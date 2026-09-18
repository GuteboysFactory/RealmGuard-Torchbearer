const HISTORY_LIMIT = 120;

let coreClaimEnabled = true;
let coreTransferEnabled = true;
let rollbackReason = "";
let transferRollbackReason = "";

const telemetry = {
  evaluations: 0,
  matches: 0,
  mismatches: 0,
  errorFallbacks: 0,
  rollbackEvaluations: 0,
  lastDecision: null,
  history: []
};

const transferTelemetry = {
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

function normalizeTransferPatch(patch = null) {
  if (!patch) return null;
  return Object.freeze({
    donatedGiven: num(patch.donatedGiven),
    donatedReceived: num(patch.donatedReceived),
    done: patch.done == null ? null : Boolean(patch.done)
  });
}

function normalizeTransfer(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    reasonCode: String(plan.reasonCode ?? ""),
    amount: Math.max(1, Math.floor(Number(plan.amount ?? 1))),
    donorBefore: num(plan.donorBefore),
    donorAfter: num(plan.donorAfter),
    recipientBefore: num(plan.recipientBefore),
    recipientAfter: num(plan.recipientAfter),
    donorStatePatch: normalizeTransferPatch(plan.donorStatePatch),
    recipientStatePatch: normalizeTransferPatch(plan.recipientStatePatch)
  });
}

export function compareM7CheckTransfer({ legacy = {}, core = {} } = {}) {
  const live = normalizeTransfer(legacy);
  const candidate = normalizeTransfer(core);
  const fields = ["ok", "reasonCode", "amount", "donorBefore", "donorAfter", "recipientBefore", "recipientAfter", "donorStatePatch", "recipientStatePatch"];
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

function recordTransfer(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M7",
    scope: "PASS_CHECK_HANDOFF",
    ...entry
  });
  transferTelemetry.lastDecision = event;
  transferTelemetry.history.push(event);
  if (transferTelemetry.history.length > HISTORY_LIMIT) transferTelemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7PassCheckHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripTransferRollback(reason) {
  coreTransferEnabled = false;
  transferRollbackReason = String(reason || "TRANSFER_SAFETY_ROLLBACK");
}

function withAuthority(plan, claimAuthority, meta = {}) {
  return {
    ...normalizeClaim(plan),
    m7: Object.freeze({
      claimAuthority,
      remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
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
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    parityGuard: "MATCH",
    result: comparison.core
  });
  return {
    ...comparison.core,
    m7: Object.freeze({
      claimAuthority: "CORE_M7",
      remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
      rollback: false,
      parityGuard: "MATCH",
      eventAt: event.at
    })
  };
}

export function evaluateM7CheckTransferLiveHandoff({
  donorId = "",
  recipientId = "",
  legacy = {},
  corePlan = null
} = {}) {
  const operation = "PASS_CHECK";

  if (!coreTransferEnabled) {
    transferTelemetry.rollbackEvaluations += 1;
    const event = recordTransfer({
      operation,
      outcome: "LEGACY_ROLLBACK",
      donorId: String(donorId ?? ""),
      recipientId: String(recipientId ?? ""),
      transferAuthority: "LEGACY_MIXED",
      reason: transferRollbackReason
    });
    return {
      ...normalizeTransfer(legacy),
      m7: Object.freeze({
        transferAuthority: "LEGACY_MIXED",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: transferRollbackReason,
        eventAt: event.at
      })
    };
  }

  let core;
  try {
    if (typeof corePlan !== "function") throw new Error("Missing CORE M7 transfer planner.");
    core = corePlan();
  } catch (error) {
    transferTelemetry.errorFallbacks += 1;
    tripTransferRollback("CORE_TRANSFER_ERROR");
    const event = recordTransfer({
      operation,
      outcome: "CORE_ERROR_LEGACY_FALLBACK",
      donorId: String(donorId ?? ""),
      recipientId: String(recipientId ?? ""),
      transferAuthority: "LEGACY_FALLBACK",
      reason: String(error?.message ?? error)
    });
    return {
      ...normalizeTransfer(legacy),
      m7: Object.freeze({
        transferAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "CORE_TRANSFER_ERROR",
        eventAt: event.at
      })
    };
  }

  transferTelemetry.evaluations += 1;
  const comparison = compareM7CheckTransfer({ legacy, core });
  if (!comparison.match) {
    transferTelemetry.mismatches += 1;
    tripTransferRollback("TRANSFER_DISAGREEMENT");
    const event = recordTransfer({
      operation,
      outcome: "TRANSFER_DISAGREEMENT_LEGACY_FALLBACK",
      donorId: String(donorId ?? ""),
      recipientId: String(recipientId ?? ""),
      transferAuthority: "LEGACY_FALLBACK",
      mismatchedFields: comparison.mismatchedFields,
      legacy: comparison.legacy,
      core: comparison.core,
      reason: "CORE M7 and Legacy Mixed Pass Check plans did not agree."
    });
    return {
      ...comparison.legacy,
      m7: Object.freeze({
        transferAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "TRANSFER_DISAGREEMENT",
        mismatchedFields: comparison.mismatchedFields,
        eventAt: event.at
      })
    };
  }

  transferTelemetry.matches += 1;
  const event = recordTransfer({
    operation,
    outcome: "CORE_TRANSFER_APPLIED",
    donorId: String(donorId ?? ""),
    recipientId: String(recipientId ?? ""),
    transferAuthority: "CORE_M7",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    parityGuard: "MATCH",
    result: comparison.core
  });

  return {
    ...comparison.core,
    m7: Object.freeze({
      transferAuthority: "CORE_M7",
      remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
      rollback: false,
      parityGuard: "MATCH",
      eventAt: event.at
    })
  };
}

export function setM7CoreTransferEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreTransferEnabled = Boolean(enabled);
  transferRollbackReason = coreTransferEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  recordTransfer({
    operation: "AUTHORITY_SWITCH",
    outcome: coreTransferEnabled ? "CORE_TRANSFER_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    transferAuthority: coreTransferEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    reason: transferRollbackReason
  });
  return getM7CheckTransferHandoffStatus();
}

export function resetM7CheckTransferHandoffTelemetry() {
  transferTelemetry.evaluations = 0;
  transferTelemetry.matches = 0;
  transferTelemetry.mismatches = 0;
  transferTelemetry.errorFallbacks = 0;
  transferTelemetry.rollbackEvaluations = 0;
  transferTelemetry.lastDecision = null;
  transferTelemetry.history.length = 0;
  return getM7CheckTransferHandoffStatus();
}

export function getM7CheckTransferHandoffHistory() {
  return Object.freeze([...transferTelemetry.history]);
}

export function getM7CheckTransferHandoffStatus() {
  return Object.freeze({
    phase: "M7",
    scope: "PASS_CHECK_HANDOFF",
    enabled: coreTransferEnabled,
    mode: coreTransferEnabled ? "CORE_TRANSFER_LEGACY_SESSION" : "LEGACY_ROLLBACK",
    transferAuthority: coreTransferEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason: transferRollbackReason,
    liveScope: Object.freeze(["PASS_CHECK"]),
    deferredScope: Object.freeze(["DONE_DISCARD", "PHASE_CHANGE", "RECOVERY", "TRAIT_CHECK_AWARD", "END_SESSION", "SESSION_LIFECYCLE_COMMIT"]),
    telemetry: Object.freeze({
      evaluations: transferTelemetry.evaluations,
      matches: transferTelemetry.matches,
      mismatches: transferTelemetry.mismatches,
      errorFallbacks: transferTelemetry.errorFallbacks,
      rollbackEvaluations: transferTelemetry.rollbackEvaluations,
      historyCount: transferTelemetry.history.length,
      lastDecision: transferTelemetry.lastDecision
    })
  });
}

export function setM7CoreClaimEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreClaimEnabled = Boolean(enabled);
  rollbackReason = coreClaimEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  record({
    operation: "AUTHORITY_SWITCH",
    outcome: coreClaimEnabled ? "CORE_CLAIM_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    claimAuthority: coreClaimEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
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
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
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
