import { M5ParityBridge, compareInventoryValidation } from "./m5-parity-bridge.mjs";

function idOf(value) {
  return String(value?.id ?? value?._id ?? value ?? "");
}

function itemsOf(actor) {
  if (!actor?.items) return [];
  if (Array.isArray(actor.items)) return actor.items;
  if (Array.isArray(actor.items.contents)) return actor.items.contents;
  try { return Array.from(actor.items); } catch (_error) { return []; }
}

function itemById(actor, id) {
  if (!actor || !id) return null;
  if (typeof actor.items?.get === "function") return actor.items.get(id) ?? null;
  return itemsOf(actor).find(item => idOf(item) === String(id)) ?? null;
}

function sideActors(bridge, state, side) {
  if (side === "gm") {
    const actor = bridge.actorResolver(state?.gm?.actorId);
    return actor ? [actor] : [];
  }
  return [...new Set(state?.ranger?.participantIds ?? [])]
    .map(id => bridge.actorResolver(id))
    .filter(Boolean);
}

function signatureSeen(bridge, signature) {
  bridge._m5DeepSignatures ??= new Set();
  if (bridge._m5DeepSignatures.has(signature)) return true;
  bridge._m5DeepSignatures.add(signature);
  return false;
}

M5ParityBridge.prototype.observeLegacyInventoryDecision = function observeLegacyInventoryDecision(decision = {}) {
  const actor = decision.actor ?? this.actorResolver(decision.actorId);
  const operation = String(decision.operation ?? "").toUpperCase();
  const source = String(decision.source ?? "LIVE_INVENTORY_DECISION");
  const legacyAccepted = Boolean(decision.accepted);
  const itemId = String(decision.itemId ?? decision.item?.id ?? "");
  const target = String(decision.target ?? "");

  if (operation === "PLACE_ZONE") {
    return this.probeZone(actor, itemId, target, { legacyAccepted, source });
  }
  if (operation === "PLACE_CONTAINER") {
    return this.probeContainer(actor, itemId, target, { legacyAccepted, source });
  }
  if (operation === "UNASSIGN") {
    const item = itemById(actor, itemId);
    const coreValidation = item?.type === "gear"
      ? { ok: true, reason: "Unassign is permitted for a valid Gear item.", policy: this.services.policy?.mode ?? "", manual: false }
      : { ok: false, reason: "Invalid gear item.", policy: this.services.policy?.mode ?? "", manual: false };
    const comparison = compareInventoryValidation({ legacyAccepted, coreValidation });
    return this._record({
      domain: "inventory",
      operation: "UNASSIGN",
      source,
      actorId: String(actor?.id ?? decision.actorId ?? ""),
      actorName: String(actor?.name ?? ""),
      itemId,
      itemName: String(item?.name ?? decision.itemName ?? ""),
      target: "unassigned",
      legacyReason: String(decision.reason ?? ""),
      ...comparison
    });
  }
  return null;
};

M5ParityBridge.prototype.observeConflictProviderState = function observeConflictProviderState(state = null) {
  const current = state ?? this.conflictStateReader();
  if (!current?.active || !current?.id) return [];
  const recorded = [];
  const conflictType = String(current.type ?? "fight");
  const conflictId = String(current.id ?? "");

  for (const pair of current.revealed ?? []) {
    for (const side of ["gm", "ranger"]) {
      const actorId = side === "gm" ? current.gm?.actorId : pair?.rangerActorId;
      const actor = this.actorResolver(actorId);
      const toolId = String(side === "gm" ? pair?.gmWeaponId ?? "" : pair?.rangerWeaponId ?? "");
      if (!actor || !toolId) continue;
      const signature = [conflictId, "declaration", pair?.index ?? "", side, actorId, toolId].join("|");
      if (signatureSeen(this, signature)) continue;
      const coreTool = this.services.conflictTools.resolve(actor, toolId, { conflictType, conflictId, disabled: [] });
      const match = Boolean(coreTool && coreTool.id === toolId);
      recorded.push(this._record({
        domain: "conflict-tool",
        operation: "DECLARED_TOOL_PROVIDER",
        source: "LIVE_CONFLICT_DECLARATION",
        actorId: String(actor?.id ?? ""),
        actorName: String(actor?.name ?? ""),
        side,
        conflictId,
        conflictType,
        exchange: Number(current.exchange ?? 0),
        actionIndex: Number(pair?.index ?? 0),
        toolId,
        toolName: String(coreTool?.name ?? ""),
        parity: match ? "MATCH" : "MISMATCH",
        match,
        legacyAccepted: true,
        coreAccepted: match,
        core: coreTool ? { id: coreTool.id, rawId: coreTool.rawId, source: coreTool.source, disabled: Boolean(coreTool.disabled) } : null
      }));
    }
  }

  for (const side of ["gm", "ranger"]) {
    const disabled = [...new Set((current.effects?.[side]?.disabledGearIds ?? []).map(String).filter(Boolean))];
    if (!disabled.length) continue;
    const actors = sideActors(this, current, side);
    for (const rawId of disabled) {
      const actor = actors.find(candidate => itemById(candidate, rawId)) ?? actors[0] ?? null;
      const signature = [conflictId, "disable", side, rawId, disabled.slice().sort().join(",")].join("|");
      if (signatureSeen(this, signature)) continue;
      const coreTools = actor ? this.services.conflictTools.list(actor, { conflictType, conflictId, disabled }) : [];
      const provider = coreTools.find(tool => String(tool.rawId ?? "") === rawId) ?? null;
      const match = Boolean(provider?.disabled);
      recorded.push(this._record({
        domain: "conflict-tool",
        operation: "DISABLE_STATE",
        source: "LIVE_CONFLICT_DISABLE",
        actorId: String(actor?.id ?? ""),
        actorName: String(actor?.name ?? ""),
        side,
        conflictId,
        conflictType,
        rawId,
        toolId: String(provider?.id ?? ""),
        toolName: String(provider?.name ?? itemById(actor, rawId)?.name ?? ""),
        legacyDisabled: true,
        coreDisabled: Boolean(provider?.disabled),
        parity: match ? "MATCH" : "MISMATCH",
        match,
        core: provider ? { id: provider.id, rawId: provider.rawId, source: provider.source, disabled: Boolean(provider.disabled) } : null
      }));
    }
  }

  return recorded;
};

const originalObserveConflictState = M5ParityBridge.prototype.observeConflictState;
M5ParityBridge.prototype.observeConflictState = function observeConflictStateWithProviderParity(state = null) {
  const liveRollEvents = originalObserveConflictState.call(this, state);
  const providerEvents = this.observeConflictProviderState(state);
  return Object.freeze([...liveRollEvents, ...providerEvents]);
};

const originalClear = M5ParityBridge.prototype.clear;
M5ParityBridge.prototype.clear = function clearDeepParity() {
  this._m5DeepSignatures?.clear?.();
  return originalClear.call(this);
};

const originalInstall = M5ParityBridge.prototype.install;
M5ParityBridge.prototype.install = function installDeepParity() {
  const result = originalInstall.call(this);
  if (!this._m5DeepHookInstalled && globalThis.Hooks?.on) {
    this._m5DeepHookInstalled = true;
    Hooks.on("realmGuardInventoryDecision", decision => {
      try { this.observeLegacyInventoryDecision(decision); }
      catch (error) { this.logger?.warn?.("realm-guard | CORE M5 rejected inventory decision parity observer failed safely", error); }
    });
  }
  return result;
};
