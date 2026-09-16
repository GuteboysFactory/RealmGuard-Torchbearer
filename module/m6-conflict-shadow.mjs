import { m6InteractionMode, previewM6ConflictResolution } from "./core/m6-conflict-services.mjs";

const HISTORY_LIMIT = 120;
const history = [];
let installed = false;

function push(event) {
  const row = Object.freeze({ at: Date.now(), phase: "M6", mode: "SHADOW_PARITY", liveApplication: false, authority: "LEGACY_MIXED", ...event });
  history.push(row);
  if (history.length > HISTORY_LIMIT) history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM6ConflictShadow", row); } catch (_error) { /* observer only */ }
  return row;
}

function normalizeLegacy(event = {}) {
  return Object.freeze({
    gmPassed: Boolean(event.gmPassed),
    rangerPassed: Boolean(event.rangerPassed),
    gmMargin: Number(event.gmMargin ?? 0),
    rangerMargin: Number(event.rangerMargin ?? 0),
    gmFailureMargin: Number(event.gmFailureMargin ?? 0),
    rangerFailureMargin: Number(event.rangerFailureMargin ?? 0),
    gmEffectiveSuccesses: Number(event.gmEffectiveSuccesses ?? 0),
    rangerEffectiveSuccesses: Number(event.rangerEffectiveSuccesses ?? 0),
    gmDisposition: Number(event.gmDisposition ?? 0),
    rangerDisposition: Number(event.rangerDisposition ?? 0),
    tiePending: Boolean(event.tiePending),
    maneuverQueue: Object.freeze((event.maneuverQueue ?? []).map(m => Object.freeze({ side: String(m.side ?? ""), margin: Number(m.margin ?? 0) })))
  });
}

function normalizeCore(core) {
  return Object.freeze({
    gmPassed: Boolean(core?.pair?.gm?.passed),
    rangerPassed: Boolean(core?.pair?.ranger?.passed),
    gmMargin: Number(core?.pair?.gm?.margin ?? 0),
    rangerMargin: Number(core?.pair?.ranger?.margin ?? 0),
    gmFailureMargin: Number(core?.pair?.gm?.failureMargin ?? 0),
    rangerFailureMargin: Number(core?.pair?.ranger?.failureMargin ?? 0),
    gmEffectiveSuccesses: Number(core?.pair?.gm?.effectiveSuccesses ?? 0),
    rangerEffectiveSuccesses: Number(core?.pair?.ranger?.effectiveSuccesses ?? 0),
    gmDisposition: Number(core?.disposition?.gm?.current ?? 0),
    rangerDisposition: Number(core?.disposition?.ranger?.current ?? 0),
    tiePending: Boolean(core?.pair?.tiePending),
    maneuverQueue: Object.freeze((core?.maneuverQueue ?? []).map(m => Object.freeze({ side: String(m.side ?? ""), margin: Number(m.margin ?? 0) })))
  });
}

function sameManeuvers(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((entry, index) => entry.side === b[index]?.side && entry.margin === b[index]?.margin);
}

function equalResolution(a, b) {
  return a.gmPassed === b.gmPassed
    && a.rangerPassed === b.rangerPassed
    && a.gmMargin === b.gmMargin
    && a.rangerMargin === b.rangerMargin
    && a.gmFailureMargin === b.gmFailureMargin
    && a.rangerFailureMargin === b.rangerFailureMargin
    && a.gmEffectiveSuccesses === b.gmEffectiveSuccesses
    && a.rangerEffectiveSuccesses === b.rangerEffectiveSuccesses
    && a.gmDisposition === b.gmDisposition
    && a.rangerDisposition === b.rangerDisposition
    && a.tiePending === b.tiePending
    && sameManeuvers(a.maneuverQueue, b.maneuverQueue);
}

function observeResolution(event = {}) {
  const pair = event.pair ?? {};
  const core = previewM6ConflictResolution({
    gmAction: pair.gmAction,
    rangerAction: pair.rangerAction,
    gmMode: pair.gmMode,
    rangerMode: pair.rangerMode,
    gmRoll: event.gmRoll,
    rangerRoll: event.rangerRoll,
    tieResolution: event.tieResolution ?? null,
    gmDisposition: event.beforeDisposition?.gm,
    rangerDisposition: event.beforeDisposition?.ranger
  });
  const legacy = normalizeLegacy(event);
  const shadow = normalizeCore(core);
  const match = equalResolution(legacy, shadow);
  return push({
    domain: "CONFLICT_RESOLUTION",
    operation: "RESOLVE_ACTION_PAIR",
    conflictId: String(event.conflictId ?? ""),
    exchange: Number(event.exchange ?? 0),
    actionIndex: Number(pair.index ?? 0),
    parity: match ? "MATCH" : "MISMATCH",
    match,
    legacy,
    core: shadow
  });
}

function observeInteraction(event = {}) {
  const coreMode = m6InteractionMode(event.ownAction, event.opponentAction, { ownMissile: Boolean(event.ownMissile), opponentMissile: Boolean(event.opponentMissile) });
  const legacyMode = String(event.legacyMode ?? "");
  const match = coreMode === legacyMode;
  return push({
    domain: "CONFLICT_INTERACTION",
    operation: "INTERACTION_MODE",
    conflictId: String(event.conflictId ?? ""),
    side: String(event.side ?? ""),
    ownAction: String(event.ownAction ?? ""),
    opponentAction: String(event.opponentAction ?? ""),
    legacyMode,
    coreMode,
    parity: match ? "MATCH" : "MISMATCH",
    match
  });
}

export function installM6ConflictShadow() {
  if (installed) return;
  installed = true;
  Hooks.on("realmGuardLegacyConflictResolution", observeResolution);
  Hooks.on("realmGuardLegacyConflictInteraction", observeInteraction);
  Hooks.once("ready", () => {
    game.realmGuard = game.realmGuard ?? {};
    game.realmGuard.core = game.realmGuard.core ?? {};
    game.realmGuard.core.m6 = Object.freeze({
      getStatus: () => getM6ConflictShadowStatus(),
      history: () => Object.freeze([...history]),
      clear: () => { history.length = 0; return getM6ConflictShadowStatus(); }
    });
    console.log("realm-guard | CORE M6 Conflict resolution shadow parity ready", getM6ConflictShadowStatus());
  });
}

export function getM6ConflictShadowStatus() {
  const matches = history.filter(e => e.parity === "MATCH").length;
  const mismatches = history.filter(e => e.parity === "MISMATCH").length;
  return Object.freeze({
    phase: "M6",
    buildScope: "CONFLICT_RESOLUTION_SHADOW_FOUNDATION",
    mode: "SHADOW_PARITY",
    authority: "LEGACY_MIXED",
    liveApplication: false,
    observed: history.length,
    matches,
    mismatches,
    latest: history.at(-1) ?? null
  });
}
