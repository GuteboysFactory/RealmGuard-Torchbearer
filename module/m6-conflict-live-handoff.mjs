import { resolveM6ConflictPair } from "./core/m6-conflict-services.mjs";

const HISTORY_LIMIT = 100;
let coreResolutionEnabled = true;
let rollbackReason = "";

const telemetry = {
  evaluations: 0,
  matches: 0,
  mismatches: 0,
  errorFallbacks: 0,
  rollbackEvaluations: 0,
  lastDecision: null,
  history: []
};

function num(value) { return Number(value ?? 0); }

function normalizeLegacy(result = {}) {
  return Object.freeze({
    gmPassed: Boolean(result.gmPassed),
    rangerPassed: Boolean(result.rangerPassed),
    gmMargin: Math.max(0, num(result.gmMargin)),
    rangerMargin: Math.max(0, num(result.rangerMargin)),
    gmFailureMargin: Math.max(0, num(result.gmFailureMargin)),
    rangerFailureMargin: Math.max(0, num(result.rangerFailureMargin)),
    gmEffectiveSuccesses: Math.max(0, num(result.gmEffectiveSuccesses)),
    rangerEffectiveSuccesses: Math.max(0, num(result.rangerEffectiveSuccesses)),
    tiePending: Boolean(result.tiePending)
  });
}

function normalizeCore(pair = {}) {
  return Object.freeze({
    gmPassed: Boolean(pair?.gm?.passed),
    rangerPassed: Boolean(pair?.ranger?.passed),
    gmMargin: Math.max(0, num(pair?.gm?.margin)),
    rangerMargin: Math.max(0, num(pair?.ranger?.margin)),
    gmFailureMargin: Math.max(0, num(pair?.gm?.failureMargin)),
    rangerFailureMargin: Math.max(0, num(pair?.ranger?.failureMargin)),
    gmEffectiveSuccesses: Math.max(0, num(pair?.gm?.effectiveSuccesses)),
    rangerEffectiveSuccesses: Math.max(0, num(pair?.ranger?.effectiveSuccesses)),
    tiePending: Boolean(pair?.tiePending)
  });
}

export function compareM6ResolutionResult({ legacy = {}, core = {} } = {}) {
  const live = normalizeLegacy(legacy);
  const candidate = normalizeCore(core);
  const fields = Object.keys(live);
  const mismatchedFields = fields.filter(key => live[key] !== candidate[key]);
  return Object.freeze({
    match: mismatchedFields.length === 0,
    mismatchedFields: Object.freeze(mismatchedFields),
    legacy: live,
    core: candidate
  });
}

function record(entry = {}) {
  const event = Object.freeze({ at: Date.now(), phase: "M6", scope: "CONFLICT_RESOLUTION_RESULT_HANDOFF", ...entry });
  telemetry.lastDecision = event;
  telemetry.history.push(event);
  if (telemetry.history.length > HISTORY_LIMIT) telemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM6ResolutionHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripRollback(reason) {
  coreResolutionEnabled = false;
  rollbackReason = String(reason || "SAFETY_ROLLBACK");
}

function withAuthority(result, resolutionAuthority, meta = {}) {
  return {
    ...normalizeLegacy(result),
    m6: Object.freeze({
      resolutionAuthority,
      conflictStateAuthority: "LEGACY_MIXED",
      ...meta
    })
  };
}

export function evaluateM6ConflictResolutionLiveHandoff({
  conflictId = "",
  exchange = 0,
  actionIndex = 0,
  gmAction = "",
  rangerAction = "",
  gmMode = "",
  rangerMode = "",
  gmRoll = null,
  rangerRoll = null,
  tieResolution = null,
  legacy = {}
} = {}) {
  const operation = "RESOLVE_ACTION_PAIR";

  if (!coreResolutionEnabled) {
    telemetry.rollbackEvaluations += 1;
    const event = record({
      operation, outcome: "LEGACY_ROLLBACK", conflictId: String(conflictId), exchange: num(exchange), actionIndex: num(actionIndex),
      resolutionAuthority: "LEGACY_MIXED", conflictStateAuthority: "LEGACY_MIXED", reason: rollbackReason
    });
    return withAuthority(legacy, "LEGACY_MIXED", { rollback: true, reason: rollbackReason, eventAt: event.at });
  }

  let corePair;
  try {
    corePair = resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll, tieResolution });
  } catch (error) {
    telemetry.errorFallbacks += 1;
    tripRollback("CORE_RESOLUTION_ERROR");
    const event = record({
      operation, outcome: "CORE_ERROR_LEGACY_FALLBACK", conflictId: String(conflictId), exchange: num(exchange), actionIndex: num(actionIndex),
      resolutionAuthority: "LEGACY_FALLBACK", conflictStateAuthority: "LEGACY_MIXED", reason: String(error?.message ?? error)
    });
    return withAuthority(legacy, "LEGACY_FALLBACK", { rollback: true, reason: "CORE_RESOLUTION_ERROR", eventAt: event.at });
  }

  telemetry.evaluations += 1;
  const comparison = compareM6ResolutionResult({ legacy, core: corePair });
  if (!comparison.match) {
    telemetry.mismatches += 1;
    tripRollback("RESOLUTION_DISAGREEMENT");
    const event = record({
      operation, outcome: "RESOLUTION_DISAGREEMENT_LEGACY_FALLBACK", conflictId: String(conflictId), exchange: num(exchange), actionIndex: num(actionIndex),
      resolutionAuthority: "LEGACY_FALLBACK", conflictStateAuthority: "LEGACY_MIXED",
      mismatchedFields: comparison.mismatchedFields, legacy: comparison.legacy, core: comparison.core, reason: "CORE and Legacy resolution results did not agree."
    });
    return withAuthority(legacy, "LEGACY_FALLBACK", { rollback: true, reason: "RESOLUTION_DISAGREEMENT", mismatchedFields: comparison.mismatchedFields, eventAt: event.at });
  }

  telemetry.matches += 1;
  const applied = comparison.core;
  const event = record({
    operation, outcome: "CORE_RESOLUTION_APPLIED", conflictId: String(conflictId), exchange: num(exchange), actionIndex: num(actionIndex),
    gmAction: String(gmAction), rangerAction: String(rangerAction), gmMode: String(gmMode), rangerMode: String(rangerMode),
    resolutionAuthority: "CORE_M6", conflictStateAuthority: "LEGACY_MIXED", parityGuard: "MATCH", result: applied
  });
  return {
    ...applied,
    m6: Object.freeze({ resolutionAuthority: "CORE_M6", conflictStateAuthority: "LEGACY_MIXED", rollback: false, parityGuard: "MATCH", eventAt: event.at })
  };
}

export function setM6CoreResolutionEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreResolutionEnabled = Boolean(enabled);
  rollbackReason = coreResolutionEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  record({
    operation: "AUTHORITY_SWITCH",
    outcome: coreResolutionEnabled ? "CORE_RESOLUTION_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    resolutionAuthority: coreResolutionEnabled ? "CORE_M6" : "LEGACY_MIXED",
    conflictStateAuthority: "LEGACY_MIXED", reason: rollbackReason
  });
  return getM6ConflictLiveHandoffStatus();
}

export function resetM6ConflictHandoffTelemetry() {
  telemetry.evaluations = 0;
  telemetry.matches = 0;
  telemetry.mismatches = 0;
  telemetry.errorFallbacks = 0;
  telemetry.rollbackEvaluations = 0;
  telemetry.lastDecision = null;
  telemetry.history.length = 0;
  return getM6ConflictLiveHandoffStatus();
}

export function getM6ConflictHandoffHistory() { return Object.freeze([...telemetry.history]); }

export function getM6ConflictLiveHandoffStatus() {
  return Object.freeze({
    phase: "M6",
    scope: "CONFLICT_RESOLUTION_RESULT_HANDOFF",
    enabled: coreResolutionEnabled,
    mode: coreResolutionEnabled ? "CORE_RESOLUTION_LEGACY_STATE" : "LEGACY_ROLLBACK",
    resolutionAuthority: coreResolutionEnabled ? "CORE_M6" : "LEGACY_MIXED",
    conflictStateAuthority: "LEGACY_MIXED",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason,
    liveScope: Object.freeze(["PASS_FAIL", "MARGIN", "FAILURE_MARGIN", "EFFECTIVE_SUCCESSES"]),
    deferredScope: Object.freeze(["UNRESOLVED_TIEBREAK", "CONFLICT_STATE_WRITE", "DISPOSITION_WRITE", "LEARNING_WRITE", "NATURE_TAX_WRITE", "MANEUVER_STATE_WRITE", "EXCHANGE_ADVANCEMENT", "COMPROMISE_FLOW"]),
    telemetry: Object.freeze({
      evaluations: telemetry.evaluations, matches: telemetry.matches, mismatches: telemetry.mismatches, errorFallbacks: telemetry.errorFallbacks,
      rollbackEvaluations: telemetry.rollbackEvaluations, historyCount: telemetry.history.length, lastDecision: telemetry.lastDecision
    })
  });
}
