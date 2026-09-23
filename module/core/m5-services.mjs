const SYSTEM_ID = "realm-guard";

export const INVENTORY_MODES = Object.freeze({
  LOOSE: "LOOSE",
  STRUCTURED: "STRUCTURED",
  CUSTOM: "CUSTOM"
});

export const M5_STRUCTURED_ZONES = Object.freeze([
  Object.freeze({ id: "head", label: "Head", mode: "worn", capacity: 1 }),
  Object.freeze({ id: "neck", label: "Neck", mode: "worn", capacity: 1 }),
  Object.freeze({ id: "cloak", label: "Cloak", mode: "worn", capacity: 1 }),
  Object.freeze({ id: "left-hand", label: "Left Hand", mode: "hand", capacity: 1 }),
  Object.freeze({ id: "right-hand", label: "Right Hand", mode: "hand", capacity: 1 }),
  Object.freeze({ id: "torso", label: "Torso", mode: "worn", capacity: 3 }),
  Object.freeze({ id: "belt", label: "Belt", mode: "belt", capacity: 3 }),
  Object.freeze({ id: "feet", label: "Feet", mode: "worn", capacity: 1 }),
  Object.freeze({ id: "pocket", label: "Pocket", mode: "pocket", capacity: 1 })
]);

export const M5_CONTAINER_PRESETS = Object.freeze({
  none: Object.freeze({ label: "Not a container", capacity: 0, slots: null }),
  backpack: Object.freeze({ label: "Backpack", capacity: 6, slots: 2 }),
  satchel: Object.freeze({ label: "Satchel", capacity: 3, slots: 1 }),
  custom: Object.freeze({ label: "Custom container", capacity: null, slots: null })
});

const HAND_ZONES = Object.freeze(["left-hand", "right-hand"]);
const LEGACY_PHYSICAL_TOOL_NAMES = new Set(["axe", "bow", "halberd", "whip", "hook and line", "knife", "shield", "sling", "spear", "staff", "sword"]);
const ACTIONS = Object.freeze(["attack", "defend", "feint", "maneuver"]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value ?? 0)));
}

function lower(value) {
  return String(value ?? "").trim().toLowerCase();
}

function itemsOf(actor) {
  if (!actor?.items) return [];
  if (Array.isArray(actor.items)) return actor.items;
  if (Array.isArray(actor.items.contents)) return actor.items.contents;
  try { return Array.from(actor.items); } catch (_error) { return []; }
}

function itemById(actor, id) {
  if (!id) return null;
  if (typeof actor?.items?.get === "function") return actor.items.get(id) ?? null;
  return itemsOf(actor).find(item => String(item?.id ?? item?._id ?? "") === String(id)) ?? null;
}

function itemId(item) {
  return String(item?.id ?? item?._id ?? "");
}

function actorFlag(actor, key) {
  try {
    const viaApi = actor?.getFlag?.(SYSTEM_ID, key);
    if (viaApi !== undefined) return viaApi;
  } catch (_error) { /* plain-data fallback below */ }
  return actor?.flags?.[SYSTEM_ID]?.[key];
}

function isHandZone(id) {
  return HAND_ZONES.includes(String(id ?? ""));
}

function oppositeHand(id) {
  return id === "left-hand" ? "right-hand" : id === "right-hand" ? "left-hand" : "";
}

function isCloakLike(item) {
  return /(?:cloak|cape|mantle)/i.test(String(item?.name ?? ""));
}

function effect(kind, value, actions = ACTIONS, extra = {}) {
  return Object.freeze({ kind, value: Number(value ?? 0), actions: Object.freeze([...actions]), ...extra });
}

function legacyPhysicalEffects(name) {
  switch (lower(name)) {
    case "shield":
      return [effect("dice", 2, ["defend"])];
    case "halberd":
      return [effect("dice", 1, ["attack", "defend"]), effect("dice", -1, ["feint", "maneuver"])];
    case "whip":
    case "hook and line":
      return [effect("dice", 1, ["maneuver"]), effect("success", 1, ["maneuver"], { conditional: "successful-test" }), effect("dice", -1, ["attack"])];
    case "spear":
      return [effect("dice", 1, ["defend"]), effect("success", 1, ["feint"], { conditional: "successful-test" })];
    case "staff":
      return [effect("dice", 1, ["feint"])];
    case "bow":
      return [effect("dice", 2, ["maneuver"])];
    case "sling":
      return [effect("dice", 1, ["maneuver"])];
    case "axe":
      return [effect("success", 1, ["attack"], { conditional: "successful-test" }), effect("dice", -1, ["defend", "feint"])];
    case "sword":
      return [effect("dice", 1, ACTIONS, { requiresContext: "swordUsefulAction" })];
    default:
      return [];
  }
}

function legacyToolEffects(tool) {
  if (Array.isArray(tool?.effects)) {
    return tool.effects.map(raw => effect(
      ["success", "dice", "text"].includes(String(raw?.kind ?? raw?.effect)) ? String(raw?.kind ?? raw?.effect) : "text",
      Number(raw?.value ?? 0),
      Array.isArray(raw?.actions) && raw.actions.length ? raw.actions.map(lower) : (ACTIONS.includes(lower(raw?.action)) ? [lower(raw.action)] : ACTIONS),
      {
        conditional: raw?.conditional ?? (String(raw?.kind ?? raw?.effect) === "success" && Number(raw?.value ?? 0) > 0 ? "successful-test" : ""),
        requiresContext: String(raw?.requiresContext ?? ""),
        note: String(raw?.note ?? raw?.special ?? "")
      }
    ));
  }
  const kind = String(tool?.effect ?? "none") === "dice" ? "dice" : String(tool?.effect ?? "none") === "success" ? "success" : "text";
  const action = ACTIONS.includes(lower(tool?.action)) ? [lower(tool.action)] : ACTIONS;
  return [effect(kind, Number(tool?.value ?? 0), action, {
    conditional: kind === "success" && Number(tool?.value ?? 0) > 0 ? "successful-test" : "",
    note: String(tool?.special ?? "")
  })];
}

export class InventoryPolicy {
  constructor({ mode = INVENTORY_MODES.STRUCTURED, zones = M5_STRUCTURED_ZONES, customId = "" } = {}) {
    this.mode = Object.values(INVENTORY_MODES).includes(String(mode).toUpperCase()) ? String(mode).toUpperCase() : INVENTORY_MODES.STRUCTURED;
    this.zones = Object.freeze((zones ?? []).map(zone => Object.freeze({ ...zone })));
    this.customId = String(customId ?? "");
    Object.freeze(this);
  }

  static fromProfile(profile = null) {
    const requested = String(profile?.domains?.inventory?.policy ?? INVENTORY_MODES.STRUCTURED).toUpperCase();
    return new InventoryPolicy({ mode: requested });
  }

  zone(id) {
    return this.zones.find(zone => zone.id === String(id ?? "")) ?? null;
  }

  describe() {
    return Object.freeze({ mode: this.mode, zoneCount: this.zones.length, customId: this.customId });
  }
}

export class GearService {
  inventoryData(item) {
    const data = item?.system?.inventory ?? {};
    return Object.freeze({
      mode: String(data.mode ?? "unassigned"),
      location: String(data.location ?? ""),
      containerId: String(data.containerId ?? ""),
      slots: Math.max(1, Number(data.slots ?? 1)),
      bundle: Math.max(1, Number(data.bundle ?? 1)),
      wieldHands: clamp(data.wieldHands ?? 0, 0, 2),
      containerType: String(data.containerType ?? "none"),
      capacity: Math.max(0, Number(data.capacity ?? 0))
    });
  }

  list(actor) {
    return itemsOf(actor).filter(item => item?.type === "gear");
  }

  get(actor, id) {
    const item = itemById(actor, id);
    return item?.type === "gear" ? item : null;
  }

  slotCost(item, { forZone = null } = {}) {
    const data = this.inventoryData(item);
    const quantity = Math.max(0, Number(item?.system?.quantity ?? 1));
    if (quantity <= 0) return 0;
    const bundles = Math.max(1, Math.ceil(quantity / data.bundle));
    if (isHandZone(forZone)) return 1;
    return Math.max(1, data.slots) * bundles;
  }

  state(item) {
    const data = this.inventoryData(item);
    const equipped = ["hand", "worn", "belt", "pocket", "slot"].includes(data.mode) && !data.containerId;
    const stored = Boolean(data.containerId);
    return Object.freeze({
      carried: data.mode !== "unassigned" || stored,
      equipped,
      stored,
      available: Number(item?.system?.quantity ?? 1) > 0,
      placement: stored ? `container:${data.containerId}` : data.location ? `${data.mode}:${data.location}` : data.mode
    });
  }

  effects(item) {
    const raw = Array.isArray(item?.system?.effects) ? item.system.effects : actorFlag(item, "coreGearEffects");
    return Object.freeze((Array.isArray(raw) ? raw : []).map(entry => Object.freeze({ ...entry })));
  }

  snapshot(actor) {
    return Object.freeze(this.list(actor).map(item => Object.freeze({
      id: itemId(item),
      name: String(item?.name ?? "Gear"),
      quantity: Math.max(0, Number(item?.system?.quantity ?? 1)),
      inventory: this.inventoryData(item),
      state: this.state(item),
      effects: this.effects(item)
    })));
  }
}

export class ContainerService {
  constructor(gear = new GearService()) {
    this.gear = gear;
  }

  capacity(item) {
    const data = this.gear.inventoryData(item);
    const preset = M5_CONTAINER_PRESETS[data.containerType];
    if (!preset || data.containerType === "none") return 0;
    if (preset.capacity !== null && preset.capacity !== undefined) return Number(preset.capacity);
    return Math.max(0, data.capacity);
  }

  isContainer(item) {
    return item?.type === "gear" && this.capacity(item) > 0;
  }

  isActive(item) {
    if (!this.isContainer(item)) return false;
    const data = this.gear.inventoryData(item);
    if (["backpack", "satchel"].includes(data.containerType)) return data.mode === "worn" && data.location === "torso" && !data.containerId;
    return data.mode !== "unassigned" && !data.containerId;
  }

  contents(actor, containerId) {
    return this.gear.list(actor).filter(item => this.gear.inventoryData(item).containerId === String(containerId ?? ""));
  }

  usage(actor, container) {
    const contents = this.contents(actor, itemId(container));
    const capacity = this.capacity(container);
    const used = contents.reduce((sum, item) => sum + this.gear.slotCost(item), 0);
    return Object.freeze({ capacity, used, remaining: Math.max(0, capacity - used), over: used > capacity, active: this.isActive(container), contents: Object.freeze([...contents]) });
  }
}

export class PlacementValidator {
  constructor({ policy = new InventoryPolicy(), gear = new GearService(), containers = null } = {}) {
    this.policy = policy;
    this.gear = gear;
    this.containers = containers ?? new ContainerService(gear);
  }

  _otherZoneUse(actor, zone, movingItem) {
    return this.gear.list(actor).filter(item => {
      if (itemId(item) === itemId(movingItem)) return false;
      const data = this.gear.inventoryData(item);
      return !data.containerId && data.mode === zone.mode && data.location === zone.id;
    }).reduce((sum, item) => sum + this.gear.slotCost(item, { forZone: zone.id }), 0);
  }

  validateZone(actor, itemOrId, zoneId) {
    const item = typeof itemOrId === "string" ? this.gear.get(actor, itemOrId) : itemOrId;
    if (!item || item.type !== "gear") return Object.freeze({ ok: false, reason: "Invalid gear." });
    if (this.policy.mode === INVENTORY_MODES.LOOSE) return Object.freeze({ ok: true, policy: this.policy.mode });
    if (this.policy.mode === INVENTORY_MODES.CUSTOM) return Object.freeze({ ok: true, policy: this.policy.mode, manual: true });

    const zone = this.policy.zone(zoneId);
    if (!zone) return Object.freeze({ ok: false, reason: "Invalid inventory zone." });
    const data = this.gear.inventoryData(item);
    const cost = this.gear.slotCost(item, { forZone: zone.id });

    if (zone.id === "cloak" && !isCloakLike(item)) return Object.freeze({ ok: false, reason: "The Cloak slot accepts cloaks, capes or mantles." });

    if (isHandZone(zone.id)) {
      const targetItems = this.gear.list(actor).filter(other => {
        if (itemId(other) === itemId(item)) return false;
        const od = this.gear.inventoryData(other);
        return !od.containerId && od.location === zone.id;
      });
      if (targetItems.length) return Object.freeze({ ok: false, reason: `${zone.label} is already occupied by ${targetItems[0].name}.` });
      const otherId = oppositeHand(zone.id);
      const otherItems = this.gear.list(actor).filter(other => {
        if (itemId(other) === itemId(item)) return false;
        const od = this.gear.inventoryData(other);
        return !od.containerId && od.location === otherId;
      });
      const otherTwoHanded = otherItems.find(other => this.gear.inventoryData(other).wieldHands >= 2);
      if (otherTwoHanded) return Object.freeze({ ok: false, reason: `${otherId === "left-hand" ? "Left Hand" : "Right Hand"} is using ${otherTwoHanded.name}, which requires both hands.` });
      if (data.wieldHands >= 2 && otherItems.length) return Object.freeze({ ok: false, reason: `${item.name} requires both hands. Clear the other hand first.` });
      return Object.freeze({ ok: true, policy: this.policy.mode });
    }

    if (zone.id === "belt" && (data.slots !== 1 || data.bundle !== 1 || cost !== 1)) return Object.freeze({ ok: false, reason: "Belt slots accept only single 1-slot items; bundled or oversized items must go elsewhere." });
    if (zone.id === "pocket" && cost !== 1) return Object.freeze({ ok: false, reason: "The pocket can hold only one small 1-slot item." });
    const used = this._otherZoneUse(actor, zone, item);
    if (used + cost > zone.capacity) return Object.freeze({ ok: false, reason: `${zone.label} does not have enough space (${used}/${zone.capacity} already used; item needs ${cost}).` });

    if (zone.id === "torso" && ["backpack", "satchel"].includes(data.containerType)) {
      const otherPack = this.gear.list(actor).find(other => {
        if (itemId(other) === itemId(item)) return false;
        const od = this.gear.inventoryData(other);
        return ["backpack", "satchel"].includes(od.containerType) && od.mode === "worn" && od.location === "torso" && !od.containerId;
      });
      if (otherPack) return Object.freeze({ ok: false, reason: `Only one backpack or satchel can be equipped at a time. ${otherPack.name} is already on the Torso.` });
    }
    return Object.freeze({ ok: true, policy: this.policy.mode });
  }

  validateContainer(actor, itemOrId, containerOrId) {
    const item = typeof itemOrId === "string" ? this.gear.get(actor, itemOrId) : itemOrId;
    const container = typeof containerOrId === "string" ? this.gear.get(actor, containerOrId) : containerOrId;
    if (!item || item.type !== "gear" || !container || !this.containers.isContainer(container)) return Object.freeze({ ok: false, reason: "Invalid gear or container." });
    if (itemId(item) === itemId(container)) return Object.freeze({ ok: false, reason: "A container cannot contain itself." });
    if (this.containers.isContainer(item)) return Object.freeze({ ok: false, reason: "Nested containers are deferred from this inventory layer." });
    if (this.policy.mode === INVENTORY_MODES.LOOSE) return Object.freeze({ ok: true, policy: this.policy.mode });
    if (!this.containers.isActive(container)) return Object.freeze({ ok: false, reason: `${container.name} is not active. Equip the container first.` });
    const usage = this.containers.usage(actor, container);
    const currentCost = this.gear.inventoryData(item).containerId === itemId(container) ? this.gear.slotCost(item) : 0;
    const nextUsed = usage.used - currentCost + this.gear.slotCost(item);
    if (nextUsed > usage.capacity) return Object.freeze({ ok: false, reason: `${container.name} does not have enough space (${usage.used}/${usage.capacity} already used; item needs ${this.gear.slotCost(item)}).` });
    return Object.freeze({ ok: true, policy: this.policy.mode });
  }
}

export class ConflictToolEffectProvider {
  collect(tool, { action = "attack", requirementMet = true, swordUsefulAction = "" } = {}) {
    const normalizedAction = ACTIONS.includes(lower(action)) ? lower(action) : "attack";
    if (!tool || tool.disabled) return Object.freeze({ dice: 0, conditionalSuccess: 0, successPenalty: 0, notes: Object.freeze([]), requirement: String(tool?.requirement ?? ""), toolName: String(tool?.name ?? "") });
    if (tool.requirement && !requirementMet) return Object.freeze({ dice: 0, conditionalSuccess: 0, successPenalty: 0, notes: Object.freeze([`${tool.name}: requirement not met — no bonus`]), requirement: String(tool.requirement), toolName: String(tool.name) });

    let dice = 0;
    let conditionalSuccess = 0;
    let successPenalty = 0;
    const notes = [];
    for (const entry of tool.effects ?? []) {
      if (Array.isArray(entry.actions) && !entry.actions.includes(normalizedAction)) continue;
      if (entry.requiresContext === "swordUsefulAction" && lower(swordUsefulAction) !== normalizedAction) continue;
      const value = Number(entry.value ?? 0);
      if (entry.kind === "dice") dice += value;
      else if (entry.kind === "success") {
        if (value > 0) conditionalSuccess += value;
        else if (value < 0) successPenalty += Math.abs(value);
      }
      if (entry.note) notes.push(String(entry.note));
      else if (entry.kind !== "text" && value) notes.push(`${tool.name} ${value > 0 ? "+" : ""}${value}${entry.kind === "dice" ? "D" : "s"}`);
    }
    if (tool.special) notes.push(String(tool.special));
    return Object.freeze({ dice, conditionalSuccess, successPenalty, notes: Object.freeze(notes), requirement: String(tool.requirement ?? ""), toolName: String(tool.name ?? "") });
  }
}

export class ConflictToolService {
  constructor({ profileId = "realm-guard-legacy-mixed", inventoryPolicy = INVENTORY_MODES.STRUCTURED, effectProvider = new ConflictToolEffectProvider() } = {}) {
    this.profileId = String(profileId ?? "realm-guard-legacy-mixed");
    this.inventoryPolicy = String(inventoryPolicy ?? INVENTORY_MODES.STRUCTURED).toUpperCase();
    this.effectProvider = effectProvider;
  }

  _isDisabled(id, rawId, disabled = []) {
    const set = new Set((disabled ?? []).map(String));
    return set.has(String(id)) || set.has(String(rawId));
  }

  _physical(actor, { conflictType = "fight", disabled = [] } = {}) {
    if (!["fight", "fightCreature"].includes(String(conflictType))) return [];
    const requiresHandPlacement = this.inventoryPolicy !== INVENTORY_MODES.LOOSE;
    return itemsOf(actor).filter(item => {
      if (item?.type !== "gear" || !LEGACY_PHYSICAL_TOOL_NAMES.has(lower(item?.name))) return false;
      if (Number(item?.system?.quantity ?? 1) <= 0) return false;
      if (!requiresHandPlacement) return true;
      return String(item?.system?.inventory?.mode ?? "") === "hand";
    }).map(item => {
      const rawId = itemId(item);
      const name = String(item?.name ?? "Gear");
      return Object.freeze({
        id: `gear:${rawId}`,
        rawId,
        name,
        type: "gear",
        source: "physical-gear",
        tags: Object.freeze(["physical", ...( ["bow", "sling"].includes(lower(name)) ? ["missile"] : [] )]),
        effects: Object.freeze(legacyPhysicalEffects(name)),
        requirements: Object.freeze([]),
        requirement: "",
        special: "",
        disabled: this._isDisabled(`gear:${rawId}`, rawId, disabled),
        legacyItem: item
      });
    });
  }

  _saved(actor, { conflictType = "*", conflictId = "", disabled = [] } = {}) {
    const raw = actorFlag(actor, "conflictTools");
    return (Array.isArray(raw) ? raw : []).filter(tool => {
      if (!tool || !tool.id || !tool.name) return false;
      if (tool.temporaryConflictId && conflictId && tool.temporaryConflictId !== conflictId) return false;
      const types = Array.isArray(tool.conflictTypes) ? tool.conflictTypes : [tool.conflictType || "*"];
      return types.includes("*") || types.includes(conflictType);
    }).map(tool => Object.freeze({
      id: `tool:${tool.id}`,
      rawId: String(tool.id),
      name: String(tool.name),
      type: String(tool.type ?? "narrative"),
      source: "saved-conflict-tool",
      tags: Object.freeze(Array.isArray(tool.tags) ? [...tool.tags] : ["narrative"]),
      effects: Object.freeze(legacyToolEffects(tool)),
      requirements: Object.freeze(Array.isArray(tool.requirements) ? [...tool.requirements] : []),
      requirement: String(tool.requirement ?? ""),
      special: String(tool.special ?? ""),
      disabled: this._isDisabled(`tool:${tool.id}`, tool.id, disabled),
      temporaryConflictId: String(tool.temporaryConflictId ?? ""),
      legacyTool: tool
    }));
  }

  _natural(actor, { conflictType = "*", disabled = [] } = {}) {
    const raw = actorFlag(actor, "naturalConflictTools");
    return (Array.isArray(raw) ? raw : []).filter(tool => {
      const types = Array.isArray(tool?.conflictTypes) ? tool.conflictTypes : [tool?.conflictType || "*"];
      return tool?.id && tool?.name && (types.includes("*") || types.includes(conflictType));
    }).map(tool => Object.freeze({
      id: `natural:${tool.id}`,
      rawId: String(tool.id),
      name: String(tool.name),
      type: "natural",
      source: "natural-conflict-tool",
      tags: Object.freeze(["natural", ...(Array.isArray(tool.tags) ? tool.tags : [])]),
      effects: Object.freeze(legacyToolEffects(tool)),
      requirements: Object.freeze(Array.isArray(tool.requirements) ? [...tool.requirements] : []),
      requirement: String(tool.requirement ?? ""),
      special: String(tool.special ?? ""),
      disabled: this._isDisabled(`natural:${tool.id}`, tool.id, disabled),
      legacyTool: tool
    }));
  }

  list(actor, options = {}) {
    return Object.freeze([
      ...this._saved(actor, options),
      ...this._natural(actor, options),
      ...this._physical(actor, options)
    ].sort((a, b) => a.name.localeCompare(b.name)));
  }

  resolve(actor, toolId, options = {}) {
    return this.list(actor, options).find(tool => tool.id === String(toolId ?? "")) ?? null;
  }

  evaluate(actor, { toolId = "", action = "attack", requirementMet = true, swordUsefulAction = "", disabled = [], conflictType = "fight", conflictId = "" } = {}) {
    const tool = toolId ? this.resolve(actor, toolId, { conflictType, conflictId, disabled }) : null;
    if (!tool) {
      const legacyPenalty = this.profileId === "realm-guard-legacy-mixed" ? -1 : 0;
      return Object.freeze({
        tool: null,
        dice: legacyPenalty,
        conditionalSuccess: 0,
        successPenalty: 0,
        notes: Object.freeze([legacyPenalty ? "Legacy Mixed: Unarmed / no valid Conflict Tool −1D" : "No Conflict Tool: no CORE tool effect"]),
        coreDefaultUnarmedPenalty: 0,
        activeProfileUnarmedPenalty: legacyPenalty
      });
    }
    return Object.freeze({ tool, ...this.effectProvider.collect(tool, { action, requirementMet, swordUsefulAction }), coreDefaultUnarmedPenalty: 0, activeProfileUnarmedPenalty: 0 });
  }

  disableTargets(actor, options = {}) {
    const toolTargets = this.list(actor, { ...options, disabled: [] }).map(tool => Object.freeze({ providerId: tool.id, rawId: tool.rawId, name: tool.name, kind: tool.type }));
    const traits = itemsOf(actor).filter(item => item?.type === "trait").map(item => Object.freeze({ providerId: `trait:${itemId(item)}`, rawId: itemId(item), name: String(item?.name ?? "Trait"), kind: "trait" }));
    const deduped = new Map();
    for (const target of [...toolTargets, ...traits]) if (!deduped.has(target.providerId)) deduped.set(target.providerId, target);
    return Object.freeze([...deduped.values()]);
  }
}

export function createM5Services(profile = null) {
  const policy = InventoryPolicy.fromProfile(profile);
  const gear = new GearService();
  const containers = new ContainerService(gear);
  const placement = new PlacementValidator({ policy, gear, containers });
  const conflictToolEffects = new ConflictToolEffectProvider();
  const conflictTools = new ConflictToolService({
    profileId: profile?.id ?? "realm-guard-legacy-mixed",
    inventoryPolicy: policy.mode,
    effectProvider: conflictToolEffects
  });
  return Object.freeze({ policy, gear, containers, placement, conflictTools, conflictToolEffects });
}
