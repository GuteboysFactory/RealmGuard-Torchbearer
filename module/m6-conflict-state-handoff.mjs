import { projectM6ConflictState } from "./core/m6-conflict-runtime.mjs";

const HISTORY_LIMIT = 120;
let coreStateEnabled = true;
let rollbackReason = "";
const telemetry = { evaluations: 0, matches: 0, mismatches: 0, errorFallbacks: 0, rollbackEvaluations: 0, lastDecision: null, history: [] };

function clone(value) {
  if (value === undefined) return undefined;
  if (typeof globalThis.structuredClone === "function") return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function record(entry = {}) {
  const row = Object.freeze({ at: Date.now(), phase: "M6", scope: "CONFLICT_STATE_TRANSITION_HANDOFF", ...entry });
  telemetry.lastDecision = row;
  telemetry.history.push(row);
  if (telemetry.history.length > HISTORY_LIMIT) telemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM6StateHandoff", row); } catch (_error) { /* telemetry only */ }
  return row;
}
function trip(reason) { coreStateEnabled = false; rollbackReason = String(reason || "STATE_SAFETY_ROLLBACK"); }

function applyCoreRuntimeFields(legacyState, coreState) {
  const out = clone(legacyState);
  const core = clone(coreState);
  out.active = Boolean(core.active);
  out.stage = core.stage;
  out.exchange = core.exchange;
  out.currentIndex = core.currentIndex;
  out.locks = clone(core.locks ?? out.locks);
  if (out.gm?.disposition && core.gm?.disposition) out.gm.disposition.current = core.gm.disposition.current;
  if (out.ranger?.disposition && core.ranger?.disposition) out.ranger.disposition.current = core.ranger.disposition.current;
  out.pendingManeuver = clone(core.pendingManeuver ?? null);
  out.pendingManeuverQueue = clone(core.pendingManeuverQueue ?? []);
  out.effects = clone(core.effects ?? out.effects);
  out.actionCounts = clone(core.actionCounts ?? out.actionCounts);
  out.pendingActionCounts = core.pendingActionCounts == null ? null : clone(core.pendingActionCounts);
  out.lastRangerActorId = core.lastRangerActorId ?? out.lastRangerActorId;
  out.pendingLastRangerActorId = core.pendingLastRangerActorId == null ? null : core.pendingLastRangerActorId;
  out.outcome = clone(core.outcome ?? null);
  out.compromise = clone(core.compromise ?? null);
  out.rolls = clone(core.rolls ?? out.rolls);
  if (Array.isArray(core.revealed) && core.revealed.length === 0) out.revealed = [];
  return out;
}

export function evaluateM6ConflictStateLiveHandoff({ operation = "STATE_TRANSITION", conflictId = "", legacyState = null, coreState = null } = {}) {
  if (!coreStateEnabled) {
    telemetry.rollbackEvaluations += 1;
    const event = record({ operation, conflictId: String(conflictId), outcome: "LEGACY_STATE_ROLLBACK", stateAuthority: "LEGACY_MIXED", reason: rollbackReason });
    return { state: legacyState, m6: Object.freeze({ stateAuthority: "LEGACY_MIXED", rollback: true, reason: rollbackReason, eventAt: event.at }) };
  }
  let legacyProjection, coreProjection;
  try {
    legacyProjection = projectM6ConflictState(legacyState);
    coreProjection = projectM6ConflictState(coreState);
  } catch (error) {
    telemetry.errorFallbacks += 1;
    trip("CORE_STATE_PROJECTION_ERROR");
    const event = record({ operation, conflictId: String(conflictId), outcome: "CORE_STATE_ERROR_LEGACY_FALLBACK", stateAuthority: "LEGACY_FALLBACK", reason: String(error?.message ?? error) });
    return { state: legacyState, m6: Object.freeze({ stateAuthority: "LEGACY_FALLBACK", rollback: true, reason: "CORE_STATE_PROJECTION_ERROR", eventAt: event.at }) };
  }
  telemetry.evaluations += 1;
  if (!same(legacyProjection, coreProjection)) {
    telemetry.mismatches += 1;
    trip("STATE_TRANSITION_DISAGREEMENT");
    const event = record({ operation, conflictId: String(conflictId), outcome: "STATE_TRANSITION_DISAGREEMENT_LEGACY_FALLBACK", stateAuthority: "LEGACY_FALLBACK", legacy: legacyProjection, core: coreProjection, reason: "CORE and Legacy conflict state transitions did not agree." });
    return { state: legacyState, m6: Object.freeze({ stateAuthority: "LEGACY_FALLBACK", rollback: true, reason: "STATE_TRANSITION_DISAGREEMENT", eventAt: event.at }) };
  }
  telemetry.matches += 1;
  const applied = applyCoreRuntimeFields(legacyState, coreState);
  const event = record({ operation, conflictId: String(conflictId), outcome: "CORE_STATE_TRANSITION_APPLIED", stateAuthority: "CORE_M6_STATE", parityGuard: "MATCH", result: coreProjection });
  return { state: applied, m6: Object.freeze({ stateAuthority: "CORE_M6_STATE", rollback: false, parityGuard: "MATCH", eventAt: event.at }) };
}

export function setM6CoreStateEnabled(enabled, { reason = "MANUAL_QA_STATE_ROLLBACK" } = {}) {
  coreStateEnabled = Boolean(enabled);
  rollbackReason = coreStateEnabled ? "" : String(reason || "MANUAL_QA_STATE_ROLLBACK");
  record({ operation: "STATE_AUTHORITY_SWITCH", outcome: coreStateEnabled ? "CORE_STATE_ENABLED" : "LEGACY_STATE_ROLLBACK_ENABLED", stateAuthority: coreStateEnabled ? "CORE_M6_STATE" : "LEGACY_MIXED", reason: rollbackReason });
  return getM6ConflictStateHandoffStatus();
}
export function resetM6ConflictStateHandoffTelemetry() {
  telemetry.evaluations = 0; telemetry.matches = 0; telemetry.mismatches = 0; telemetry.errorFallbacks = 0; telemetry.rollbackEvaluations = 0; telemetry.lastDecision = null; telemetry.history.length = 0;
  return getM6ConflictStateHandoffStatus();
}
export function getM6ConflictStateHandoffHistory() { return Object.freeze([...telemetry.history]); }
export function getM6ConflictStateHandoffStatus() {
  return Object.freeze({
    phase: "M6",
    scope: "CONFLICT_STATE_TRANSITION_HANDOFF",
    enabled: coreStateEnabled,
    stateAuthority: coreStateEnabled ? "CORE_M6_STATE" : "LEGACY_MIXED",
    resolutionAuthorityIndependent: true,
    autoRollbackOnDisagreement: true,
    rollbackReason,
    liveScope: Object.freeze(["DISPOSITION_WRITE", "MANEUVER_STATE_WRITE", "ACTION_ADVANCEMENT", "EXCHANGE_ADVANCEMENT", "OUTCOME", "COMPROMISE_STATE"]),
    deferredScope: Object.freeze(["INTERACTIVE_TIEBREAK_TRANSACTION", "PRIVATE_HIDDEN_PLAN_REPOSITORY", "LEARNING_WRITE", "NATURE_TAX_WRITE"]),
    telemetry: Object.freeze({ evaluations: telemetry.evaluations, matches: telemetry.matches, mismatches: telemetry.mismatches, errorFallbacks: telemetry.errorFallbacks, rollbackEvaluations: telemetry.rollbackEvaluations, historyCount: telemetry.history.length, lastDecision: telemetry.lastDecision })
  });
}
