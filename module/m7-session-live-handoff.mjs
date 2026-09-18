const HISTORY_LIMIT = 120;

let coreClaimEnabled = true;
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

function num(value) { return Math.max(0, Number(value ?? 0)); }

function normalizePatch(patch = null) {
  if (!patch) return null;
  return Object.freeze({
    testsTaken: num(patch.testsTaken),
    freeUsed: Boolean(patch.freeUsed),
    checksSpent: num(patch.checksSpent),
    done: Boolean(patch.done)
  });
}

function normalizeClaim(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    tracked: Boolean(plan.tracked),
    source: String(plan.source ?? ""),
    cost: num(plan.cost),
    before: num(plan.before),
    after: num(plan.after),
    reasonCode: String(plan.reasonCode ?? ""),
    actorStatePatch: normalizePatch(plan.actorStatePatch),
    lastActorId: String(plan.lastActorId ?? "")
  });
}

export function compareM7PlayerTurnClaim({ legacy = {}, core = {} } = {}) {
  const live = normalizeClaim(legacy);
  const candidate = normalizeClaim(core);
  const fields = ["ok", "tracked", "source", "cost", "before", "after", "reasonCode", "actorStatePatch", "lastActorId"];
  const mismatchedFields = fields.filter(key => JSON.stringify(live[key]) !== JSON.stringify(candidate[key]));
  return Object.freeze({
    match: mismatchedFields.length === 0,
    mismatchedFields: Object.freeze(mismatchedFields),
    legacy: live,
    core: candidate
  });
}

function record(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M7",
    scope: "PLAYER_TURN_TEST_CLAIM_HANDOFF",
    ...entry
  });
  telemetry.lastDecision = event;
  telemetry.history.push(event);
  if (telemetry.history.length > HISTORY_LIMIT) telemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7PlayerTurnClaimHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripRollback(reason) {
  coreClaimEnabled = false;
  rollbackReason = String(reason || "CLAIM_SAFETY_ROLLBACK");
}

function withAuthority(plan, claimAuthority, meta = {}) {
  return {
    ...normalizeClaim(plan),
    m7: Object.freeze({
      claimAuthority,
      remainingSessionAuthority: "LEGACY_MIXED",
      ...meta
    })
  };
}

export function evaluateM7PlayerTurnClaimLiveHandoff({
  actorId = "",
  label = "Test",
  legacy = {},
  corePlan = null
} = {}) {
  const operation = "PLAYER_TURN_TEST_CLAIM";

  if (!coreClaimEnabled) {
    telemetry.rollbackEvaluations += 1;
    const event = record({
      operation,
      outcome: "LEGACY_ROLLBACK",
      actorId: String(actorId ?? ""),
      label: String(label ?? "Test"),
      claimAuthority: "LEGACY_MIXED",
      reason: rollbackReason
    });
    return withAuthority(legacy, "LEGACY_MIXED", { rollback: true, reason: rollbackReason, eventAt: event.at });
  }

  let core;
  try {
    if (typeof corePlan !== "function") throw new Error("Missing CORE M7 claim planner.");
    core = corePlan();
  } catch (error) {
    telemetry.errorFallbacks += 1;
    tripRollback("CORE_CLAIM_ERROR");
    const event = record({
      operation,
      outcome: "CORE_ERROR_LEGACY_FALLBACK",
      actorId: String(actorId ?? ""),
      label: String(label ?? "Test"),
      claimAuthority: "LEGACY_FALLBACK",
      reason: String(error?.message ?? error)
    });
    return withAuthority(legacy, "LEGACY_FALLBACK", { rollback: true, reason: "CORE_CLAIM_ERROR", eventAt: event.at });
  }

  telemetry.evaluations += 1;
  const comparison = compareM7PlayerTurnClaim({ legacy, core });
  if (!comparison.match) {
    telemetry.mismatches += 1;
    tripRollback("CLAIM_DISAGREEMENT");
    const event = record({
      operation,
      outcome: "CLAIM_DISAGREEMENT_LEGACY_FALLBACK",
      actorId: String(actorId ?? ""),
      label: String(label ?? "Test"),
      claimAuthority: "LEGACY_FALLBACK",
      mismatchedFields: comparison.mismatchedFields,
      legacy: comparison.legacy,
      core: comparison.core,
      reason: "CORE M7 and Legacy Mixed player-turn claim plans did not agree."
    });
    return withAuthority(legacy, "LEGACY_FALLBACK", {
      rollback: true,
      reason: "CLAIM_DISAGREEMENT",
      mismatchedFields: comparison.mismatchedFields,
      eventAt: event.at
    });
  }

  telemetry.matches += 1;
  const event = record({
    operation,
    outcome: "CORE_CLAIM_APPLIED",
    actorId: String(actorId ?? ""),
    label: String(label ?? "Test"),
    claimAuthority: "CORE_M7",
    remainingSessionAuthority: "LEGACY_MIXED",
    parityGuard: "MATCH",
    result: comparison.core
  });
  return {
    ...comparison.core,
    m7: Object.freeze({
      claimAuthority: "CORE_M7",
      remainingSessionAuthority: "LEGACY_MIXED",
      rollback: false,
      parityGuard: "MATCH",
      eventAt: event.at
    })
  };
}

export function setM7CoreClaimEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreClaimEnabled = Boolean(enabled);
  rollbackReason = coreClaimEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  record({
    operation: "AUTHORITY_SWITCH",
    outcome: coreClaimEnabled ? "CORE_CLAIM_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    claimAuthority: coreClaimEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED",
    reason: rollbackReason
  });
  return getM7PlayerTurnClaimHandoffStatus();
}

export function resetM7PlayerTurnClaimHandoffTelemetry() {
  telemetry.evaluations = 0;
  telemetry.matches = 0;
  telemetry.mismatches = 0;
  telemetry.errorFallbacks = 0;
  telemetry.rollbackEvaluations = 0;
  telemetry.lastDecision = null;
  telemetry.history.length = 0;
  return getM7PlayerTurnClaimHandoffStatus();
}

export function getM7PlayerTurnClaimHandoffHistory() {
  return Object.freeze([...telemetry.history]);
}

export function getM7PlayerTurnClaimHandoffStatus() {
  return Object.freeze({
    phase: "M7",
    scope: "PLAYER_TURN_TEST_CLAIM_HANDOFF",
    enabled: coreClaimEnabled,
    mode: coreClaimEnabled ? "CORE_CLAIM_LEGACY_SESSION" : "LEGACY_ROLLBACK",
    claimAuthority: coreClaimEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason,
    liveScope: Object.freeze([
      "FREE_TEST_OR_CHECK",
      "PLAYER_TURN_ALTERNATION",
      "DONE_GUARD",
      "NO_CHECKS_GUARD",
      "NPC_UNTRACKED",
      "FREE_PLAY_UNTRACKED"
    ]),
    deferredScope: Object.freeze([
      "PASS_CHECK",
      "DONE_DISCARD",
      "PHASE_CHANGE",
      "RECOVERY",
      "TRAIT_CHECK_AWARD",
      "END_SESSION",
      "SESSION_LIFECYCLE_COMMIT"
    ]),
    telemetry: Object.freeze({
      evaluations: telemetry.evaluations,
      matches: telemetry.matches,
      mismatches: telemetry.mismatches,
      errorFallbacks: telemetry.errorFallbacks,
      rollbackEvaluations: telemetry.rollbackEvaluations,
      historyCount: telemetry.history.length,
      lastDecision: telemetry.lastDecision
    })
  });
}
