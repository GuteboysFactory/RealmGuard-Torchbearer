import { createM5Services } from "./core/m5-services.mjs";
import { getActiveM10BGearInventoryConflictPolicy, familyConflictToolPlan } from "./m10b-gear-inventory-conflict.mjs";

const LEGACY_PROFILE_FALLBACK = Object.freeze({
  id: "realm-guard-legacy-mixed",
  domains: Object.freeze({ inventory: Object.freeze({ policy: "STRUCTURED" }) })
});
const HISTORY_LIMIT = 80;

let coreEvaluationEnabled = true;
let rollbackReason = "";

const telemetry = {
  evaluations: 0,
  matches: 0,
  mismatches: 0,
  errorFallbacks: 0,
  rollbackEvaluations: 0,
  physical: 0,
  narrative: 0,
  natural: 0,
  unarmed: 0,
  lastDecision: null,
  history: []
};

function activeProfile() {
  try {
    return globalThis.game?.realmGuard?.core?.getActiveRulesProfile?.() ?? LEGACY_PROFILE_FALLBACK;
  } catch (_error) {
    return LEGACY_PROFILE_FALLBACK;
  }
}

function services() {
  return createM5Services(activeProfile());
}

function activeConflictPolicy() {
  try { return getActiveM10BGearInventoryConflictPolicy(); }
  catch (_error) { return Object.freeze({ profileId: "realm-guard-legacy-mixed", familySemantics: false, conflict: Object.freeze({}) }); }
}

function num(value) {
  return Number(value ?? 0);
}

function normalizedEffect(effect = {}) {
  return Object.freeze({
    dice: num(effect.dice),
    conditionalSuccess: Math.max(0, num(effect.conditionalSuccess)),
    successPenalty: Math.max(0, num(effect.successPenalty))
  });
}

export function compareM5ConflictEvaluation({ legacy = {}, core = {}, toolId = "" } = {}) {
  const live = normalizedEffect(legacy);
  const shadow = normalizedEffect(core);
  const expectedToolId = String(toolId ?? "");
  const actualToolId = String(core?.tool?.id ?? "");
  const providerMatch = expectedToolId ? actualToolId === expectedToolId : !actualToolId;
  const effectMatch = live.dice === shadow.dice
    && live.conditionalSuccess === shadow.conditionalSuccess
    && live.successPenalty === shadow.successPenalty;
  return Object.freeze({
    match: providerMatch && effectMatch,
    providerMatch,
    effectMatch,
    legacy: live,
    core: shadow,
    expectedToolId,
    actualToolId
  });
}

function record(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M5",
    scope: "CONFLICT_TOOL_EVALUATION_HANDOFF",
    ...entry
  });
  telemetry.lastDecision = event;
  telemetry.history.push(event);
  if (telemetry.history.length > HISTORY_LIMIT) telemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM5ConflictEvaluationHandoff", event); } catch (_error) { /* telemetry must never interrupt a roll */ }
  return event;
}

function tripRollback(reason) {
  coreEvaluationEnabled = false;
  rollbackReason = String(reason || "SAFETY_ROLLBACK");
}

function classifyTool(coreResult, toolId) {
  if (!toolId || !coreResult?.tool) return "unarmed";
  const source = String(coreResult.tool.source ?? "");
  if (source === "physical-gear") return "physical";
  if (source === "natural-conflict-tool") return "natural";
  return "narrative";
}

function incrementClass(kind) {
  if (Object.prototype.hasOwnProperty.call(telemetry, kind)) telemetry[kind] += 1;
}

function legacyResult(legacy, meta = {}) {
  return {
    ...legacy,
    m5: Object.freeze({
      evaluationAuthority: "LEGACY_MIXED",
      conflictStateAuthority: "LEGACY_MIXED",
      ...meta
    })
  };
}

function coreResult(legacy, core, meta = {}) {
  return {
    ...legacy,
    dice: num(core?.dice),
    conditionalSuccess: Math.max(0, num(core?.conditionalSuccess)),
    successPenalty: Math.max(0, num(core?.successPenalty)),
    m5: Object.freeze({
      evaluationAuthority: "CORE_M5",
      conflictStateAuthority: "LEGACY_MIXED",
      providerId: String(core?.tool?.id ?? ""),
      providerName: String(core?.tool?.name ?? (core?.tool ? "" : "Unarmed")),
      ...meta
    })
  };
}

export function evaluateM5ConflictToolLiveHandoff({
  actor,
  state,
  side,
  toolId = "",
  action = "attack",
  legacy = {},
  requirementMet = true,
  swordUsefulAction = ""
} = {}) {
  const operation = "EVALUATE_TOOL";
  const conflictId = String(state?.id ?? "");
  const conflictType = String(state?.type ?? "fight");
  const disabled = state?.effects?.[side]?.disabledGearIds ?? [];

  if (!coreEvaluationEnabled) {
    telemetry.rollbackEvaluations += 1;
    const event = record({
      operation,
      outcome: "LEGACY_ROLLBACK",
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      side: String(side ?? ""),
      conflictId,
      conflictType,
      action: String(action ?? ""),
      toolId: String(toolId ?? ""),
      evaluationAuthority: "LEGACY_MIXED",
      conflictStateAuthority: "LEGACY_MIXED",
      reason: rollbackReason
    });
    return legacyResult(legacy, { rollback: true, reason: rollbackReason, eventAt: event.at });
  }

  let evaluated;
  try {
    const policy = activeConflictPolicy();
    evaluated = policy.familySemantics
      ? familyConflictToolPlan(actor, {
          toolId: String(toolId ?? ""),
          action,
          requirementMet: Boolean(requirementMet),
          swordUsefulAction: String(swordUsefulAction ?? ""),
          disabled,
          conflictType,
          conflictId
        }, policy)
      : services().conflictTools.evaluate(actor, {
          toolId: String(toolId ?? ""),
          action,
          requirementMet: Boolean(requirementMet),
          swordUsefulAction: String(swordUsefulAction ?? ""),
          disabled,
          conflictType,
          conflictId
        });
  } catch (error) {
    telemetry.errorFallbacks += 1;
    if (activeConflictPolicy().familySemantics) {
      record({
        operation,
        outcome: "PROFILE_CORE_EVALUATION_ERROR",
        actorId: String(actor?.id ?? ""),
        actorName: String(actor?.name ?? ""),
        side: String(side ?? ""),
        conflictId,
        conflictType,
        action: String(action ?? ""),
        toolId: String(toolId ?? ""),
        evaluationAuthority: "CORE_M5_PROFILE_ERROR",
        conflictStateAuthority: "CORE_M6_COMPATIBILITY_STATE",
        reason: String(error?.message ?? error)
      });
      throw error;
    }
    tripRollback("CORE_EVALUATION_ERROR");
    const event = record({
      operation,
      outcome: "CORE_ERROR_LEGACY_FALLBACK",
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      side: String(side ?? ""),
      conflictId,
      conflictType,
      action: String(action ?? ""),
      toolId: String(toolId ?? ""),
      evaluationAuthority: "LEGACY_FALLBACK",
      conflictStateAuthority: "LEGACY_MIXED",
      reason: String(error?.message ?? error)
    });
    return legacyResult(legacy, { rollback: true, reason: "CORE_EVALUATION_ERROR", eventAt: event.at });
  }

  telemetry.evaluations += 1;
  const kind = classifyTool(evaluated, toolId);
  incrementClass(kind);

  if (activeConflictPolicy().familySemantics) {
    telemetry.matches += 1;
    const event = record({
      operation,
      outcome: "PROFILE_CORE_EVALUATION_APPLIED",
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      side: String(side ?? ""),
      conflictId,
      conflictType,
      action: String(action ?? ""),
      toolId: String(toolId ?? ""),
      toolName: String(evaluated?.tool?.name ?? (toolId ? "" : "Unarmed")),
      toolKind: kind,
      evaluationAuthority: "CORE_M5_PROFILE",
      conflictStateAuthority: "CORE_M6_COMPATIBILITY_STATE",
      parityGuard: "PROFILE_AUTHORITY",
      dice: num(evaluated?.dice),
      conditionalSuccess: Math.max(0, num(evaluated?.conditionalSuccess)),
      successPenalty: Math.max(0, num(evaluated?.successPenalty)),
      requirementMet: Boolean(requirementMet),
      swordUsefulAction: String(swordUsefulAction ?? "")
    });
    return {
      ...coreResult(legacy, evaluated, {
        rollback: false,
        parityGuard: "PROFILE_AUTHORITY",
        toolKind: kind,
        eventAt: event.at
      }),
      m5: Object.freeze({
        evaluationAuthority: "CORE_M5_PROFILE",
        conflictStateAuthority: "CORE_M6_COMPATIBILITY_STATE",
        providerId: String(evaluated?.tool?.id ?? ""),
        providerName: String(evaluated?.tool?.name ?? (evaluated?.tool ? "" : "Unarmed")),
        rollback: false,
        parityGuard: "PROFILE_AUTHORITY",
        toolKind: kind,
        eventAt: event.at
      })
    };
  }

  const comparison = compareM5ConflictEvaluation({ legacy, core: evaluated, toolId });

  if (!comparison.match) {
    telemetry.mismatches += 1;
    tripRollback("EVALUATION_DISAGREEMENT");
    const event = record({
      operation,
      outcome: "EVALUATION_DISAGREEMENT_LEGACY_FALLBACK",
      actorId: String(actor?.id ?? ""),
      actorName: String(actor?.name ?? ""),
      side: String(side ?? ""),
      conflictId,
      conflictType,
      action: String(action ?? ""),
      toolId: String(toolId ?? ""),
      toolKind: kind,
      evaluationAuthority: "LEGACY_FALLBACK",
      conflictStateAuthority: "LEGACY_MIXED",
      providerMatch: comparison.providerMatch,
      effectMatch: comparison.effectMatch,
      legacy: comparison.legacy,
      core: comparison.core,
      actualToolId: comparison.actualToolId,
      reason: "CORE and Legacy conflict-tool evaluation did not agree."
    });
    return legacyResult(legacy, {
      rollback: true,
      reason: "EVALUATION_DISAGREEMENT",
      providerMatch: comparison.providerMatch,
      effectMatch: comparison.effectMatch,
      eventAt: event.at
    });
  }

  telemetry.matches += 1;
  const event = record({
    operation,
    outcome: "CORE_EVALUATION_APPLIED",
    actorId: String(actor?.id ?? ""),
    actorName: String(actor?.name ?? ""),
    side: String(side ?? ""),
    conflictId,
    conflictType,
    action: String(action ?? ""),
    toolId: String(toolId ?? ""),
    toolName: String(evaluated?.tool?.name ?? (toolId ? "" : "Unarmed")),
    toolKind: kind,
    evaluationAuthority: "CORE_M5",
    conflictStateAuthority: "LEGACY_MIXED",
    providerMatch: true,
    effectMatch: true,
    dice: num(evaluated?.dice),
    conditionalSuccess: Math.max(0, num(evaluated?.conditionalSuccess)),
    successPenalty: Math.max(0, num(evaluated?.successPenalty)),
    requirementMet: Boolean(requirementMet),
    swordUsefulAction: String(swordUsefulAction ?? "")
  });
  return coreResult(legacy, evaluated, { rollback: false, parityGuard: "MATCH", toolKind: kind, eventAt: event.at });
}

export function setM5ConflictCoreEvaluationEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreEvaluationEnabled = Boolean(enabled);
  rollbackReason = coreEvaluationEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  record({
    operation: "AUTHORITY_SWITCH",
    outcome: coreEvaluationEnabled ? "CORE_EVALUATION_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    evaluationAuthority: coreEvaluationEnabled ? "CORE_M5" : "LEGACY_MIXED",
    conflictStateAuthority: "LEGACY_MIXED",
    reason: rollbackReason
  });
  return getM5ConflictLiveHandoffStatus();
}

export function resetM5ConflictHandoffTelemetry() {
  telemetry.evaluations = 0;
  telemetry.matches = 0;
  telemetry.mismatches = 0;
  telemetry.errorFallbacks = 0;
  telemetry.rollbackEvaluations = 0;
  telemetry.physical = 0;
  telemetry.narrative = 0;
  telemetry.natural = 0;
  telemetry.unarmed = 0;
  telemetry.lastDecision = null;
  telemetry.history.length = 0;
  return getM5ConflictLiveHandoffStatus();
}

export function getM5ConflictHandoffHistory() {
  return Object.freeze([...telemetry.history]);
}

export function getM5ConflictLiveHandoffStatus() {
  return Object.freeze({
    phase: "M5",
    scope: "CONFLICT_TOOL_EVALUATION_HANDOFF",
    enabled: coreEvaluationEnabled,
    mode: coreEvaluationEnabled ? "CORE_EVALUATE_LEGACY_STATE" : "LEGACY_ROLLBACK",
    evaluationAuthority: coreEvaluationEnabled ? "CORE_M5" : "LEGACY_MIXED",
    conflictStateAuthority: "LEGACY_MIXED",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason,
    liveScope: Object.freeze([
      "TOOL_PROVIDER",
      "ACTION_DICE_MODIFIER",
      "CONDITIONAL_SUCCESS",
      "SUCCESS_PENALTY",
      "UNARMED_LEGACY_MIXED_PROFILE"
    ]),
    deferredScope: Object.freeze([
      "CONFLICT_STATE_WRITE",
      "ACTION_QUEUE",
      "MANEUVER_CHOICES",
      "DISARM_DISABLE_WRITE",
      "EXCHANGE_ADVANCEMENT"
    ]),
    telemetry: Object.freeze({
      evaluations: telemetry.evaluations,
      matches: telemetry.matches,
      mismatches: telemetry.mismatches,
      errorFallbacks: telemetry.errorFallbacks,
      rollbackEvaluations: telemetry.rollbackEvaluations,
      physical: telemetry.physical,
      narrative: telemetry.narrative,
      natural: telemetry.natural,
      unarmed: telemetry.unarmed,
      historyCount: telemetry.history.length,
      lastDecision: telemetry.lastDecision
    })
  });
}
