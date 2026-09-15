import { resolveConflictActor } from "./conflict-actor-resolver.mjs";

const SYSTEM_ID = "realm-guard";
const CONFLICT_SETTING = "conflictState";
const DEFAULT_EVENT_LIMIT = 250;

function num(value) {
  return Number(value ?? 0);
}

function itemId(item) {
  return String(item?.id ?? item?._id ?? "");
}

function cloneData(value) {
  try {
    if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  } catch (_error) { /* plain fallback below */ }
  try { return structuredClone(value); } catch (_error) { /* JSON fallback below */ }
  try { return JSON.parse(JSON.stringify(value)); } catch (_error) { return value; }
}

function getNested(source, path) {
  if (!source || !path) return undefined;
  if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
  let cursor = source;
  for (const part of String(path).split(".")) {
    if (cursor == null || !Object.prototype.hasOwnProperty.call(cursor, part)) return undefined;
    cursor = cursor[part];
  }
  return cursor;
}

function hasNested(source, path) {
  if (!source || !path) return false;
  if (Object.prototype.hasOwnProperty.call(source, path)) return true;
  let cursor = source;
  for (const part of String(path).split(".")) {
    if (cursor == null || !Object.prototype.hasOwnProperty.call(cursor, part)) return false;
    cursor = cursor[part];
  }
  return true;
}

function setNested(target, path, value) {
  const parts = String(path).split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
}

function projectedItem(item, changes = {}) {
  const projected = {
    id: itemId(item),
    _id: itemId(item),
    type: item?.type,
    name: item?.name,
    system: cloneData(item?.system ?? {}),
    flags: cloneData(item?.flags ?? {})
  };
  for (const path of [
    "system.inventory.mode",
    "system.inventory.location",
    "system.inventory.containerId",
    "system.inventory.slots",
    "system.inventory.bundle",
    "system.inventory.wieldHands",
    "system.inventory.containerType",
    "system.inventory.capacity",
    "system.quantity"
  ]) {
    if (hasNested(changes, path)) setNested(projected, path, getNested(changes, path));
  }
  projected.getFlag = (namespace, key) => projected.flags?.[namespace]?.[key];
  return projected;
}

function inventoryPlacementChanged(changes = {}) {
  return [
    "system.inventory.mode",
    "system.inventory.location",
    "system.inventory.containerId"
  ].some(path => hasNested(changes, path));
}

function normalizedCoreValidation(core) {
  return {
    ok: Boolean(core?.ok),
    reason: String(core?.reason ?? ""),
    policy: String(core?.policy ?? ""),
    manual: Boolean(core?.manual)
  };
}

export function compareInventoryValidation({ legacyAccepted = null, coreValidation = null } = {}) {
  const core = normalizedCoreValidation(coreValidation);
  if (legacyAccepted === null || legacyAccepted === undefined) {
    return Object.freeze({ parity: "CORE_ONLY", match: null, legacyAccepted: null, coreAccepted: core.ok, core });
  }
  const legacy = Boolean(legacyAccepted);
  const match = legacy === core.ok;
  return Object.freeze({ parity: match ? "MATCH" : "MISMATCH", match, legacyAccepted: legacy, coreAccepted: core.ok, core });
}

export function compareConflictToolEffects({ legacy = {}, core = {} } = {}) {
  const live = Object.freeze({
    dice: num(legacy?.dice ?? legacy?.gearDice),
    conditionalSuccess: Math.max(0, num(legacy?.conditionalSuccess)),
    successPenalty: Math.max(0, num(legacy?.successPenalty))
  });
  const shadow = Object.freeze({
    dice: num(core?.dice),
    conditionalSuccess: Math.max(0, num(core?.conditionalSuccess)),
    successPenalty: Math.max(0, num(core?.successPenalty))
  });
  const match = live.dice === shadow.dice
    && live.conditionalSuccess === shadow.conditionalSuccess
    && live.successPenalty === shadow.successPenalty;
  return Object.freeze({ parity: match ? "MATCH" : "MISMATCH", match, legacy: live, core: shadow });
}

function summarize(events = []) {
  const summary = {
    total: events.length,
    matches: 0,
    mismatches: 0,
    coreOnly: 0,
    inventory: { total: 0, matches: 0, mismatches: 0, coreOnly: 0 },
    conflictTools: { total: 0, matches: 0, mismatches: 0, coreOnly: 0 }
  };
  for (const event of events) {
    const bucket = event.domain === "inventory" ? summary.inventory : event.domain === "conflict-tool" ? summary.conflictTools : null;
    if (bucket) bucket.total += 1;
    if (event.parity === "MATCH") {
      summary.matches += 1;
      if (bucket) bucket.matches += 1;
    } else if (event.parity === "MISMATCH") {
      summary.mismatches += 1;
      if (bucket) bucket.mismatches += 1;
    } else if (event.parity === "CORE_ONLY") {
      summary.coreOnly += 1;
      if (bucket) bucket.coreOnly += 1;
    }
  }
  return Object.freeze({
    ...summary,
    inventory: Object.freeze(summary.inventory),
    conflictTools: Object.freeze(summary.conflictTools)
  });
}

export class M5ParityBridge {
  constructor({ services, eventLimit = DEFAULT_EVENT_LIMIT, actorResolver = null, conflictStateReader = null, logger = console } = {}) {
    if (!services?.placement || !services?.conflictTools) throw new Error("M5ParityBridge requires M5 services.");
    this.services = services;
    this.eventLimit = Math.max(25, Number(eventLimit ?? DEFAULT_EVENT_LIMIT));
    this.actorResolver = actorResolver ?? (id => resolveConflictActor(id));
    this.conflictStateReader = conflictStateReader ?? (() => {
      try {
        const raw = globalThis.game?.settings?.get?.(SYSTEM_ID, CONFLICT_SETTING);
        return raw ? JSON.parse(raw) : null;
      } catch (_error) { return null; }
    });
    this.logger = logger;
    this._events = [];
    this._conflictSignatures = new Set();
    this._installed = false;
  }

  _record(event) {
    const row = Object.freeze({
      seq: (this._events.at(-1)?.seq ?? 0) + 1,
      at: Date.now(),
      authority: "LEGACY_MIXED",
      liveApplication: false,
      ...event
    });
    this._events.push(row);
    if (this._events.length > this.eventLimit) this._events.splice(0, this._events.length - this.eventLimit);
    if (row.parity === "MISMATCH") this.logger?.warn?.("realm-guard | CORE M5 shadow parity mismatch", row);
    return row;
  }

  clear() {
    this._events.length = 0;
    this._conflictSignatures.clear();
    return this.report();
  }

  events({ actorId = "", domain = "", mismatchesOnly = false } = {}) {
    return Object.freeze(this._events.filter(event => {
      if (actorId && String(event.actorId ?? "") !== String(actorId)) return false;
      if (domain && event.domain !== domain) return false;
      if (mismatchesOnly && event.parity !== "MISMATCH") return false;
      return true;
    }).map(event => Object.freeze({ ...event })));
  }

  report(options = {}) {
    const events = this.events(options);
    return Object.freeze({
      phase: "M5",
      mode: "SHADOW_PARITY",
      authority: "LEGACY_MIXED",
      liveApplication: false,
      summary: summarize(events),
      events
    });
  }

  probeZone(actor, itemOrId, zoneId, { legacyAccepted = null, source = "QA_PROBE" } = {}) {
    const item = typeof itemOrId === "string" ? this.services.gear.get(actor, itemOrId) : itemOrId;
    const coreValidation = this.services.placement.validateZone(actor, item, zoneId);
    const comparison = compareInventoryValidation({ legacyAccepted, coreValidation });
    return this._record({
      domain: "inventory",
      operation: "PLACE_ZONE",
      source,
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      itemId: itemId(item),
      itemName: String(item?.name ?? ""),
      target: String(zoneId ?? ""),
      ...comparison
    });
  }

  probeContainer(actor, itemOrId, containerOrId, { legacyAccepted = null, source = "QA_PROBE" } = {}) {
    const item = typeof itemOrId === "string" ? this.services.gear.get(actor, itemOrId) : itemOrId;
    const container = typeof containerOrId === "string" ? this.services.gear.get(actor, containerOrId) : containerOrId;
    const coreValidation = this.services.placement.validateContainer(actor, item, container);
    const comparison = compareInventoryValidation({ legacyAccepted, coreValidation });
    return this._record({
      domain: "inventory",
      operation: "PLACE_CONTAINER",
      source,
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      itemId: itemId(item),
      itemName: String(item?.name ?? ""),
      target: itemId(container),
      targetName: String(container?.name ?? ""),
      ...comparison
    });
  }

  probeConflict(actor, options = {}, legacy = null, { source = "QA_PROBE" } = {}) {
    const coreResult = this.services.conflictTools.evaluate(actor, options);
    const core = {
      dice: num(coreResult?.dice),
      conditionalSuccess: Math.max(0, num(coreResult?.conditionalSuccess)),
      successPenalty: Math.max(0, num(coreResult?.successPenalty))
    };
    const base = {
      domain: "conflict-tool",
      operation: "EVALUATE_TOOL",
      source,
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      toolId: String(options?.toolId ?? ""),
      toolName: String(coreResult?.tool?.name ?? (options?.toolId ? "" : "Unarmed / no tool")),
      action: String(options?.action ?? "attack"),
      conflictType: String(options?.conflictType ?? "fight"),
      core
    };
    if (!legacy) return this._record({ ...base, parity: "CORE_ONLY", match: null, legacy: null });
    const comparison = compareConflictToolEffects({ legacy, core });
    return this._record({ ...base, ...comparison });
  }

  observeInventoryWrite(item, changes = {}, { userId = "", source = "preUpdateItem" } = {}) {
    if (item?.type !== "gear" || !item?.parent || !inventoryPlacementChanged(changes)) return null;
    const actor = item.parent;
    const projected = projectedItem(item, changes);
    const inventory = this.services.gear.inventoryData(projected);
    let event;
    if (inventory.containerId) {
      event = this.probeContainer(actor, item, inventory.containerId, { legacyAccepted: true, source });
    } else if (inventory.mode === "unassigned" || !inventory.location) {
      event = this._record({
        domain: "inventory",
        operation: "UNASSIGN",
        source,
        actorId: String(actor?.id ?? ""),
        actorName: String(actor?.name ?? ""),
        itemId: itemId(item),
        itemName: String(item?.name ?? ""),
        target: "unassigned",
        parity: "MATCH",
        match: true,
        legacyAccepted: true,
        coreAccepted: true,
        core: { ok: true, reason: "Unassign is always permitted by the M5 shadow bridge.", policy: this.services.policy?.mode ?? "", manual: false }
      });
    } else {
      event = this.probeZone(actor, item, inventory.location, { legacyAccepted: true, source });
    }
    if (event && userId) return Object.freeze({ ...event, userId: String(userId) });
    return event;
  }

  observeConflictState(state = null) {
    const current = state ?? this.conflictStateReader();
    if (!current?.active || !current?.id || current?.stage !== "action") return [];
    const pair = (current.revealed ?? []).find(entry => Number(entry?.index) === Number(current.currentIndex));
    if (!pair) return [];
    const recorded = [];
    for (const side of ["gm", "ranger"]) {
      const roll = current.rolls?.[side];
      if (!roll || roll.trumped || !roll.actorId) continue;
      const actor = this.actorResolver(roll.actorId);
      if (!actor) continue;
      const action = side === "gm" ? pair.gmAction : pair.rangerAction;
      const toolId = side === "gm" ? pair.gmWeaponId : pair.rangerWeaponId;
      const disabled = current.effects?.[side]?.disabledGearIds ?? [];
      const swordUsefulAction = String(current.effects?.[side]?.swordActions?.[actor.id] ?? current.effects?.[side]?.swordAction ?? roll.lockSwordAction ?? "");
      const requirementMet = !(roll.gearNotes ?? []).some(note => /requirement not met/i.test(String(note)));
      const signature = [
        current.id,
        current.exchange,
        current.currentIndex,
        side,
        action,
        toolId,
        JSON.stringify(roll.faces ?? []),
        num(roll.gearDice),
        num(roll.conditionalSuccess),
        num(roll.successPenalty),
        requirementMet,
        swordUsefulAction
      ].join("|");
      if (this._conflictSignatures.has(signature)) continue;
      this._conflictSignatures.add(signature);
      recorded.push(this.probeConflict(actor, {
        toolId: String(toolId ?? ""),
        action,
        requirementMet,
        swordUsefulAction,
        disabled,
        conflictType: current.type ?? "fight",
        conflictId: current.id
      }, {
        dice: num(roll.gearDice),
        conditionalSuccess: num(roll.conditionalSuccess),
        successPenalty: num(roll.successPenalty)
      }, { source: "LIVE_CONFLICT_ROLL" }));
    }
    return recorded;
  }

  observeConflictFromSettings() {
    try { return this.observeConflictState(this.conflictStateReader()); }
    catch (error) {
      this.logger?.warn?.("realm-guard | CORE M5 conflict parity observer failed safely", error);
      return [];
    }
  }

  install() {
    if (this._installed || !globalThis.Hooks?.on) return false;
    this._installed = true;
    Hooks.on("preUpdateItem", (item, changes, options, userId) => {
      try { this.observeInventoryWrite(item, changes, { userId, source: "LIVE_INVENTORY_WRITE" }); }
      catch (error) { this.logger?.warn?.("realm-guard | CORE M5 inventory parity observer failed safely", error); }
    });
    Hooks.on("updateSetting", setting => {
      const key = String(setting?.key ?? setting?.name ?? setting?.id ?? "");
      if (key !== `${SYSTEM_ID}.${CONFLICT_SETTING}` && !key.endsWith(`.${CONFLICT_SETTING}`)) return;
      setTimeout(() => this.observeConflictFromSettings(), 0);
    });
    this.observeConflictFromSettings();
    return true;
  }
}

export function createM5ParityBridge(options = {}) {
  return new M5ParityBridge(options);
}
