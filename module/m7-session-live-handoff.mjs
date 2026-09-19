const HISTORY_LIMIT = 120;

let coreClaimEnabled = true;
let coreTransferEnabled = true;
let coreFinishEnabled = true;
let corePhaseEnabled = true;
let coreRecoveryEnabled = true;
let coreTraitAwardEnabled = true;
let rollbackReason = "";
let transferRollbackReason = "";
let finishRollbackReason = "";
let phaseRollbackReason = "";
let recoveryRollbackReason = "";
let traitAwardRollbackReason = "";

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

const finishTelemetry = {
  evaluations: 0,
  matches: 0,
  mismatches: 0,
  errorFallbacks: 0,
  rollbackEvaluations: 0,
  lastDecision: null,
  history: []
};

const phaseTelemetry = {
  evaluations: 0,
  matches: 0,
  mismatches: 0,
  errorFallbacks: 0,
  rollbackEvaluations: 0,
  lastDecision: null,
  history: []
};

const recoveryTelemetry = {
  evaluations: 0,
  matches: 0,
  mismatches: 0,
  errorFallbacks: 0,
  rollbackEvaluations: 0,
  lastDecision: null,
  history: []
};

const traitAwardTelemetry = {
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

function normalizeFinishPatch(patch = null) {
  if (!patch) return null;
  return Object.freeze({
    done: Boolean(patch.done),
    freeUsed: Boolean(patch.freeUsed),
    testsTaken: num(patch.testsTaken),
    checksSpent: num(patch.checksSpent),
    donatedGiven: num(patch.donatedGiven),
    donatedReceived: num(patch.donatedReceived)
  });
}

function normalizeFinish(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    reasonCode: String(plan.reasonCode ?? ""),
    checksBefore: num(plan.checksBefore),
    checksAfter: num(plan.checksAfter),
    discarded: num(plan.discarded),
    actorStatePatch: normalizeFinishPatch(plan.actorStatePatch)
  });
}

export function compareM7FinishPlayer({ legacy = {}, core = {} } = {}) {
  const live = normalizeFinish(legacy);
  const candidate = normalizeFinish(core);
  const fields = ["ok", "reasonCode", "checksBefore", "checksAfter", "discarded", "actorStatePatch"];
  const mismatchedFields = fields.filter(key => JSON.stringify(live[key]) !== JSON.stringify(candidate[key]));
  return Object.freeze({
    match: mismatchedFields.length === 0,
    mismatchedFields: Object.freeze(mismatchedFields),
    legacy: live,
    core: candidate
  });
}

function normalizePhaseCheckPatch(entry = {}) {
  return Object.freeze({
    id: String(entry?.id ?? ""),
    ref: String(entry?.ref ?? ""),
    name: String(entry?.name ?? ""),
    before: num(entry?.before),
    after: num(entry?.after)
  });
}

function normalizePhase(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    changed: Boolean(plan.changed),
    reasonCode: String(plan.reasonCode ?? ""),
    fromPhase: String(plan.fromPhase ?? ""),
    toPhase: String(plan.toPhase ?? ""),
    previousTurnCycleId: num(plan.previousTurnCycleId),
    turnCycleId: num(plan.turnCycleId),
    lastActorId: String(plan.lastActorId ?? ""),
    discardedChecks: Object.freeze([...(plan.discardedChecks ?? [])].map(value => String(value))),
    actorCheckPatches: Object.freeze([...(plan.actorCheckPatches ?? [])].map(normalizePhaseCheckPatch))
  });
}

export function compareM7PhaseChange({ legacy = {}, core = {} } = {}) {
  const live = normalizePhase(legacy);
  const candidate = normalizePhase(core);
  const fields = ["ok", "changed", "reasonCode", "fromPhase", "toPhase", "previousTurnCycleId", "turnCycleId", "lastActorId", "discardedChecks", "actorCheckPatches"];
  const mismatchedFields = fields.filter(key => JSON.stringify(live[key]) !== JSON.stringify(candidate[key]));
  return Object.freeze({
    match: mismatchedFields.length === 0,
    mismatchedFields: Object.freeze(mismatchedFields),
    legacy: live,
    core: candidate
  });
}

function normalizeRecoverySpend(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    reasonCode: String(plan.reasonCode ?? ""),
    phase: String(plan.phase ?? ""),
    source: String(plan.source ?? ""),
    cost: num(plan.cost),
    before: num(plan.before),
    after: num(plan.after),
    turnId: num(plan.turnId),
    conditionName: String(plan.conditionName ?? "")
  });
}

function normalizeRecoveryRefund(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    stale: Boolean(plan.stale),
    reasonCode: String(plan.reasonCode ?? ""),
    refunded: num(plan.refunded),
    before: num(plan.before),
    after: num(plan.after),
    expectedAfter: num(plan.expectedAfter),
    restore: num(plan.restore),
    turnId: num(plan.turnId),
    conditionName: String(plan.conditionName ?? "")
  });
}

function normalizeRecoveryAttempt(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    tracked: Boolean(plan.tracked),
    changed: Boolean(plan.changed),
    reasonCode: String(plan.reasonCode ?? ""),
    turnId: num(plan.turnId),
    conditionName: String(plan.conditionName ?? ""),
    beforeConditions: Object.freeze([...(plan.beforeConditions ?? [])].map(String)),
    afterConditions: Object.freeze([...(plan.afterConditions ?? [])].map(String))
  });
}

function compareNormalized(legacy, core, fields) {
  const mismatchedFields = fields.filter(key => JSON.stringify(legacy[key]) !== JSON.stringify(core[key]));
  return Object.freeze({
    match: mismatchedFields.length === 0,
    mismatchedFields: Object.freeze(mismatchedFields),
    legacy,
    core
  });
}

export function compareM7RecoverySpend({ legacy = {}, core = {} } = {}) {
  return compareNormalized(
    normalizeRecoverySpend(legacy),
    normalizeRecoverySpend(core),
    ["ok", "reasonCode", "phase", "source", "cost", "before", "after", "turnId", "conditionName"]
  );
}

export function compareM7RecoveryRefund({ legacy = {}, core = {} } = {}) {
  return compareNormalized(
    normalizeRecoveryRefund(legacy),
    normalizeRecoveryRefund(core),
    ["ok", "stale", "reasonCode", "refunded", "before", "after", "expectedAfter", "restore", "turnId", "conditionName"]
  );
}

export function compareM7RecoveryAttempt({ legacy = {}, core = {} } = {}) {
  return compareNormalized(
    normalizeRecoveryAttempt(legacy),
    normalizeRecoveryAttempt(core),
    ["ok", "tracked", "changed", "reasonCode", "turnId", "conditionName", "beforeConditions", "afterConditions"]
  );
}

function normalizeTraitCheckAward(plan = {}) {
  return Object.freeze({
    ok: Boolean(plan.ok),
    reasonCode: String(plan.reasonCode ?? ""),
    phase: String(plan.phase ?? ""),
    requested: num(plan.requested),
    earned: num(plan.earned),
    before: num(plan.before),
    after: num(plan.after),
    maximum: num(plan.maximum),
    turnId: num(plan.turnId)
  });
}

export function compareM7TraitCheckAward({ legacy = {}, core = {} } = {}) {
  return compareNormalized(
    normalizeTraitCheckAward(legacy),
    normalizeTraitCheckAward(core),
    ["ok", "reasonCode", "phase", "requested", "earned", "before", "after", "maximum", "turnId"]
  );
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

function recordFinish(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M7",
    scope: "DONE_DISCARD_HANDOFF",
    ...entry
  });
  finishTelemetry.lastDecision = event;
  finishTelemetry.history.push(event);
  if (finishTelemetry.history.length > HISTORY_LIMIT) finishTelemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7DoneDiscardHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripFinishRollback(reason) {
  coreFinishEnabled = false;
  finishRollbackReason = String(reason || "FINISH_SAFETY_ROLLBACK");
}

function recordPhase(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M7",
    scope: "PHASE_CHANGE_HANDOFF",
    ...entry
  });
  phaseTelemetry.lastDecision = event;
  phaseTelemetry.history.push(event);
  if (phaseTelemetry.history.length > HISTORY_LIMIT) phaseTelemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7PhaseChangeHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripPhaseRollback(reason) {
  corePhaseEnabled = false;
  phaseRollbackReason = String(reason || "PHASE_SAFETY_ROLLBACK");
}

function recordRecovery(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M7",
    scope: "RECOVERY_HANDOFF",
    ...entry
  });
  recoveryTelemetry.lastDecision = event;
  recoveryTelemetry.history.push(event);
  if (recoveryTelemetry.history.length > HISTORY_LIMIT) recoveryTelemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7RecoveryHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripRecoveryRollback(reason) {
  coreRecoveryEnabled = false;
  recoveryRollbackReason = String(reason || "RECOVERY_SAFETY_ROLLBACK");
}

function evaluateRecoveryPlan({
  operation,
  actorId = "",
  legacy = {},
  corePlan = null,
  compare,
  normalize
} = {}) {
  if (!coreRecoveryEnabled) {
    recoveryTelemetry.rollbackEvaluations += 1;
    const event = recordRecovery({
      operation,
      outcome: "LEGACY_ROLLBACK",
      actorId: String(actorId ?? ""),
      recoveryAuthority: "LEGACY_MIXED",
      reason: recoveryRollbackReason
    });
    return {
      ...normalize(legacy),
      m7: Object.freeze({
        recoveryAuthority: "LEGACY_MIXED",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: recoveryRollbackReason,
        eventAt: event.at
      })
    };
  }

  let core;
  try {
    if (typeof corePlan !== "function") throw new Error(`Missing CORE M7 ${operation} planner.`);
    core = corePlan();
  } catch (error) {
    recoveryTelemetry.errorFallbacks += 1;
    tripRecoveryRollback("CORE_RECOVERY_ERROR");
    const event = recordRecovery({
      operation,
      outcome: "CORE_ERROR_LEGACY_FALLBACK",
      actorId: String(actorId ?? ""),
      recoveryAuthority: "LEGACY_FALLBACK",
      reason: String(error?.message ?? error)
    });
    return {
      ...normalize(legacy),
      m7: Object.freeze({
        recoveryAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "CORE_RECOVERY_ERROR",
        eventAt: event.at
      })
    };
  }

  recoveryTelemetry.evaluations += 1;
  const comparison = compare({ legacy, core });
  if (!comparison.match) {
    recoveryTelemetry.mismatches += 1;
    tripRecoveryRollback("RECOVERY_DISAGREEMENT");
    const event = recordRecovery({
      operation,
      outcome: "RECOVERY_DISAGREEMENT_LEGACY_FALLBACK",
      actorId: String(actorId ?? ""),
      recoveryAuthority: "LEGACY_FALLBACK",
      mismatchedFields: comparison.mismatchedFields,
      legacy: comparison.legacy,
      core: comparison.core,
      reason: `CORE M7 and Legacy Mixed ${operation} plans did not agree.`
    });
    return {
      ...comparison.legacy,
      m7: Object.freeze({
        recoveryAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "RECOVERY_DISAGREEMENT",
        mismatchedFields: comparison.mismatchedFields,
        eventAt: event.at
      })
    };
  }

  recoveryTelemetry.matches += 1;
  const event = recordRecovery({
    operation,
    outcome: "CORE_RECOVERY_APPLIED",
    actorId: String(actorId ?? ""),
    recoveryAuthority: "CORE_M7",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    parityGuard: "MATCH",
    result: comparison.core
  });
  return {
    ...comparison.core,
    m7: Object.freeze({
      recoveryAuthority: "CORE_M7",
      remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
      rollback: false,
      parityGuard: "MATCH",
      eventAt: event.at
    })
  };
}

function recordTraitAward(entry = {}) {
  const event = Object.freeze({
    at: Date.now(),
    phase: "M7",
    scope: "TRAIT_CHECK_AWARD_HANDOFF",
    ...entry
  });
  traitAwardTelemetry.lastDecision = event;
  traitAwardTelemetry.history.push(event);
  if (traitAwardTelemetry.history.length > HISTORY_LIMIT) traitAwardTelemetry.history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7TraitCheckAwardHandoff", event); } catch (_error) { /* telemetry only */ }
  return event;
}

function tripTraitAwardRollback(reason) {
  coreTraitAwardEnabled = false;
  traitAwardRollbackReason = String(reason || "TRAIT_AWARD_SAFETY_ROLLBACK");
}

export function evaluateM7TraitCheckAwardLiveHandoff({ actorId = "", legacy = {}, corePlan = null } = {}) {
  const operation = "AWARD_TRAIT_CHECKS";
  if (!coreTraitAwardEnabled) {
    traitAwardTelemetry.rollbackEvaluations += 1;
    const event = recordTraitAward({ operation, outcome: "LEGACY_ROLLBACK", actorId: String(actorId ?? ""), traitAwardAuthority: "LEGACY_MIXED", reason: traitAwardRollbackReason });
    return { ...normalizeTraitCheckAward(legacy), m7: Object.freeze({ traitAwardAuthority: "LEGACY_MIXED", remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS", rollback: true, reason: traitAwardRollbackReason, eventAt: event.at }) };
  }
  let core;
  try {
    if (typeof corePlan !== "function") throw new Error("Missing CORE M7 Trait Check Award planner.");
    core = corePlan();
  } catch (error) {
    traitAwardTelemetry.errorFallbacks += 1;
    tripTraitAwardRollback("CORE_TRAIT_AWARD_ERROR");
    const event = recordTraitAward({ operation, outcome: "CORE_ERROR_LEGACY_FALLBACK", actorId: String(actorId ?? ""), traitAwardAuthority: "LEGACY_FALLBACK", reason: String(error?.message ?? error) });
    return { ...normalizeTraitCheckAward(legacy), m7: Object.freeze({ traitAwardAuthority: "LEGACY_FALLBACK", remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS", rollback: true, reason: "CORE_TRAIT_AWARD_ERROR", eventAt: event.at }) };
  }
  traitAwardTelemetry.evaluations += 1;
  const comparison = compareM7TraitCheckAward({ legacy, core });
  if (!comparison.match) {
    traitAwardTelemetry.mismatches += 1;
    tripTraitAwardRollback("TRAIT_AWARD_DISAGREEMENT");
    const event = recordTraitAward({ operation, outcome: "TRAIT_AWARD_DISAGREEMENT_LEGACY_FALLBACK", actorId: String(actorId ?? ""), traitAwardAuthority: "LEGACY_FALLBACK", mismatchedFields: comparison.mismatchedFields, legacy: comparison.legacy, core: comparison.core, reason: "CORE M7 and Legacy Mixed Trait Check Award plans did not agree." });
    return { ...comparison.legacy, m7: Object.freeze({ traitAwardAuthority: "LEGACY_FALLBACK", remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS", rollback: true, reason: "TRAIT_AWARD_DISAGREEMENT", mismatchedFields: comparison.mismatchedFields, eventAt: event.at }) };
  }
  traitAwardTelemetry.matches += 1;
  const event = recordTraitAward({ operation, outcome: "CORE_TRAIT_AWARD_APPLIED", actorId: String(actorId ?? ""), traitAwardAuthority: "CORE_M7", remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS", parityGuard: "MATCH", result: comparison.core });
  return { ...comparison.core, m7: Object.freeze({ traitAwardAuthority: "CORE_M7", remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS", rollback: false, parityGuard: "MATCH", eventAt: event.at }) };
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

export function evaluateM7FinishPlayerLiveHandoff({
  actorId = "",
  legacy = {},
  corePlan = null
} = {}) {
  const operation = "DONE_DISCARD";

  if (!coreFinishEnabled) {
    finishTelemetry.rollbackEvaluations += 1;
    const event = recordFinish({
      operation,
      outcome: "LEGACY_ROLLBACK",
      actorId: String(actorId ?? ""),
      finishAuthority: "LEGACY_MIXED",
      reason: finishRollbackReason
    });
    return {
      ...normalizeFinish(legacy),
      m7: Object.freeze({
        finishAuthority: "LEGACY_MIXED",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: finishRollbackReason,
        eventAt: event.at
      })
    };
  }

  let core;
  try {
    if (typeof corePlan !== "function") throw new Error("Missing CORE M7 Done/Discard planner.");
    core = corePlan();
  } catch (error) {
    finishTelemetry.errorFallbacks += 1;
    tripFinishRollback("CORE_FINISH_ERROR");
    const event = recordFinish({
      operation,
      outcome: "CORE_ERROR_LEGACY_FALLBACK",
      actorId: String(actorId ?? ""),
      finishAuthority: "LEGACY_FALLBACK",
      reason: String(error?.message ?? error)
    });
    return {
      ...normalizeFinish(legacy),
      m7: Object.freeze({
        finishAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "CORE_FINISH_ERROR",
        eventAt: event.at
      })
    };
  }

  finishTelemetry.evaluations += 1;
  const comparison = compareM7FinishPlayer({ legacy, core });
  if (!comparison.match) {
    finishTelemetry.mismatches += 1;
    tripFinishRollback("FINISH_DISAGREEMENT");
    const event = recordFinish({
      operation,
      outcome: "FINISH_DISAGREEMENT_LEGACY_FALLBACK",
      actorId: String(actorId ?? ""),
      finishAuthority: "LEGACY_FALLBACK",
      mismatchedFields: comparison.mismatchedFields,
      legacy: comparison.legacy,
      core: comparison.core,
      reason: "CORE M7 and Legacy Mixed Done/Discard plans did not agree."
    });
    return {
      ...comparison.legacy,
      m7: Object.freeze({
        finishAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "FINISH_DISAGREEMENT",
        mismatchedFields: comparison.mismatchedFields,
        eventAt: event.at
      })
    };
  }

  finishTelemetry.matches += 1;
  const event = recordFinish({
    operation,
    outcome: "CORE_FINISH_APPLIED",
    actorId: String(actorId ?? ""),
    finishAuthority: "CORE_M7",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    parityGuard: "MATCH",
    result: comparison.core
  });
  return {
    ...comparison.core,
    m7: Object.freeze({
      finishAuthority: "CORE_M7",
      remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
      rollback: false,
      parityGuard: "MATCH",
      eventAt: event.at
    })
  };
}

export function evaluateM7PhaseChangeLiveHandoff({
  targetPhase = "gm",
  legacy = {},
  corePlan = null
} = {}) {
  const operation = "PHASE_CHANGE";

  if (!corePhaseEnabled) {
    phaseTelemetry.rollbackEvaluations += 1;
    const event = recordPhase({
      operation,
      outcome: "LEGACY_ROLLBACK",
      targetPhase: String(targetPhase ?? ""),
      phaseAuthority: "LEGACY_MIXED",
      reason: phaseRollbackReason
    });
    return {
      ...normalizePhase(legacy),
      m7: Object.freeze({
        phaseAuthority: "LEGACY_MIXED",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: phaseRollbackReason,
        eventAt: event.at
      })
    };
  }

  let core;
  try {
    if (typeof corePlan !== "function") throw new Error("Missing CORE M7 phase-change planner.");
    core = corePlan();
  } catch (error) {
    phaseTelemetry.errorFallbacks += 1;
    tripPhaseRollback("CORE_PHASE_ERROR");
    const event = recordPhase({
      operation,
      outcome: "CORE_ERROR_LEGACY_FALLBACK",
      targetPhase: String(targetPhase ?? ""),
      phaseAuthority: "LEGACY_FALLBACK",
      reason: String(error?.message ?? error)
    });
    return {
      ...normalizePhase(legacy),
      m7: Object.freeze({
        phaseAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "CORE_PHASE_ERROR",
        eventAt: event.at
      })
    };
  }

  phaseTelemetry.evaluations += 1;
  const comparison = compareM7PhaseChange({ legacy, core });
  if (!comparison.match) {
    phaseTelemetry.mismatches += 1;
    tripPhaseRollback("PHASE_DISAGREEMENT");
    const event = recordPhase({
      operation,
      outcome: "PHASE_DISAGREEMENT_LEGACY_FALLBACK",
      targetPhase: String(targetPhase ?? ""),
      phaseAuthority: "LEGACY_FALLBACK",
      mismatchedFields: comparison.mismatchedFields,
      legacy: comparison.legacy,
      core: comparison.core,
      reason: "CORE M7 and Legacy Mixed phase-change plans did not agree."
    });
    return {
      ...comparison.legacy,
      m7: Object.freeze({
        phaseAuthority: "LEGACY_FALLBACK",
        remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
        rollback: true,
        reason: "PHASE_DISAGREEMENT",
        mismatchedFields: comparison.mismatchedFields,
        eventAt: event.at
      })
    };
  }

  phaseTelemetry.matches += 1;
  const event = recordPhase({
    operation,
    outcome: "CORE_PHASE_APPLIED",
    targetPhase: String(targetPhase ?? ""),
    phaseAuthority: "CORE_M7",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    parityGuard: "MATCH",
    result: comparison.core
  });
  return {
    ...comparison.core,
    m7: Object.freeze({
      phaseAuthority: "CORE_M7",
      remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
      rollback: false,
      parityGuard: "MATCH",
      eventAt: event.at
    })
  };
}

export function setM7CorePhaseEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  corePhaseEnabled = Boolean(enabled);
  phaseRollbackReason = corePhaseEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  recordPhase({
    operation: "AUTHORITY_SWITCH",
    outcome: corePhaseEnabled ? "CORE_PHASE_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    phaseAuthority: corePhaseEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    reason: phaseRollbackReason
  });
  return getM7PhaseChangeHandoffStatus();
}

export function resetM7PhaseChangeHandoffTelemetry() {
  phaseTelemetry.evaluations = 0;
  phaseTelemetry.matches = 0;
  phaseTelemetry.mismatches = 0;
  phaseTelemetry.errorFallbacks = 0;
  phaseTelemetry.rollbackEvaluations = 0;
  phaseTelemetry.lastDecision = null;
  phaseTelemetry.history.length = 0;
  return getM7PhaseChangeHandoffStatus();
}

export function getM7PhaseChangeHandoffHistory() {
  return Object.freeze([...phaseTelemetry.history]);
}

export function getM7PhaseChangeHandoffStatus() {
  return Object.freeze({
    phase: "M7",
    scope: "PHASE_CHANGE_HANDOFF",
    enabled: corePhaseEnabled,
    mode: corePhaseEnabled ? "CORE_PHASE_LEGACY_SESSION" : "LEGACY_ROLLBACK",
    phaseAuthority: corePhaseEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason: phaseRollbackReason,
    liveScope: Object.freeze(["PHASE_CHANGE"]),
    deferredScope: Object.freeze(["END_SESSION", "SESSION_LIFECYCLE_COMMIT"]),
    telemetry: Object.freeze({
      evaluations: phaseTelemetry.evaluations,
      matches: phaseTelemetry.matches,
      mismatches: phaseTelemetry.mismatches,
      errorFallbacks: phaseTelemetry.errorFallbacks,
      rollbackEvaluations: phaseTelemetry.rollbackEvaluations,
      historyCount: phaseTelemetry.history.length,
      lastDecision: phaseTelemetry.lastDecision
    })
  });
}

export function setM7CoreTraitAwardEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreTraitAwardEnabled = Boolean(enabled);
  traitAwardRollbackReason = coreTraitAwardEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  recordTraitAward({ operation: "AUTHORITY_SWITCH", outcome: coreTraitAwardEnabled ? "CORE_TRAIT_AWARD_ENABLED" : "LEGACY_ROLLBACK_ENABLED", traitAwardAuthority: coreTraitAwardEnabled ? "CORE_M7" : "LEGACY_MIXED", remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS", reason: traitAwardRollbackReason });
  return getM7TraitCheckAwardHandoffStatus();
}

export function resetM7TraitCheckAwardHandoffTelemetry() {
  traitAwardTelemetry.evaluations = 0;
  traitAwardTelemetry.matches = 0;
  traitAwardTelemetry.mismatches = 0;
  traitAwardTelemetry.errorFallbacks = 0;
  traitAwardTelemetry.rollbackEvaluations = 0;
  traitAwardTelemetry.lastDecision = null;
  traitAwardTelemetry.history.length = 0;
  return getM7TraitCheckAwardHandoffStatus();
}

export function getM7TraitCheckAwardHandoffHistory() { return Object.freeze([...traitAwardTelemetry.history]); }

export function getM7TraitCheckAwardHandoffStatus() {
  return Object.freeze({
    phase: "M7",
    scope: "TRAIT_CHECK_AWARD_HANDOFF",
    enabled: coreTraitAwardEnabled,
    mode: coreTraitAwardEnabled ? "CORE_TRAIT_AWARD_LEGACY_SESSION" : "LEGACY_ROLLBACK",
    traitAwardAuthority: coreTraitAwardEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason: traitAwardRollbackReason,
    liveScope: Object.freeze(["AWARD_TRAIT_CHECKS"]),
    deferredScope: Object.freeze(["END_SESSION", "SESSION_LIFECYCLE_COMMIT"]),
    telemetry: Object.freeze({
      evaluations: traitAwardTelemetry.evaluations,
      matches: traitAwardTelemetry.matches,
      mismatches: traitAwardTelemetry.mismatches,
      errorFallbacks: traitAwardTelemetry.errorFallbacks,
      rollbackEvaluations: traitAwardTelemetry.rollbackEvaluations,
      historyCount: traitAwardTelemetry.history.length,
      lastDecision: traitAwardTelemetry.lastDecision
    })
  });
}

export function evaluateM7RecoverySpendLiveHandoff(input = {}) {
  return evaluateRecoveryPlan({
    operation: "SPEND_RECOVERY_CHECKS",
    ...input,
    compare: compareM7RecoverySpend,
    normalize: normalizeRecoverySpend
  });
}

export function evaluateM7RecoveryRefundLiveHandoff(input = {}) {
  return evaluateRecoveryPlan({
    operation: "REFUND_RECOVERY_CHECKS",
    ...input,
    compare: compareM7RecoveryRefund,
    normalize: normalizeRecoveryRefund
  });
}

export function evaluateM7RecoveryAttemptLiveHandoff(input = {}) {
  return evaluateRecoveryPlan({
    operation: "MARK_RECOVERY",
    ...input,
    compare: compareM7RecoveryAttempt,
    normalize: normalizeRecoveryAttempt
  });
}

export function setM7CoreRecoveryEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreRecoveryEnabled = Boolean(enabled);
  recoveryRollbackReason = coreRecoveryEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  recordRecovery({
    operation: "AUTHORITY_SWITCH",
    outcome: coreRecoveryEnabled ? "CORE_RECOVERY_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    recoveryAuthority: coreRecoveryEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    reason: recoveryRollbackReason
  });
  return getM7RecoveryHandoffStatus();
}

export function resetM7RecoveryHandoffTelemetry() {
  recoveryTelemetry.evaluations = 0;
  recoveryTelemetry.matches = 0;
  recoveryTelemetry.mismatches = 0;
  recoveryTelemetry.errorFallbacks = 0;
  recoveryTelemetry.rollbackEvaluations = 0;
  recoveryTelemetry.lastDecision = null;
  recoveryTelemetry.history.length = 0;
  return getM7RecoveryHandoffStatus();
}

export function getM7RecoveryHandoffHistory() {
  return Object.freeze([...recoveryTelemetry.history]);
}

export function getM7RecoveryHandoffStatus() {
  return Object.freeze({
    phase: "M7",
    scope: "RECOVERY_HANDOFF",
    enabled: coreRecoveryEnabled,
    mode: coreRecoveryEnabled ? "CORE_RECOVERY_LEGACY_SESSION" : "LEGACY_ROLLBACK",
    recoveryAuthority: coreRecoveryEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason: recoveryRollbackReason,
    liveScope: Object.freeze(["SPEND_RECOVERY_CHECKS", "REFUND_RECOVERY_CHECKS", "MARK_RECOVERY"]),
    deferredScope: Object.freeze(["END_SESSION", "SESSION_LIFECYCLE_COMMIT"]),
    telemetry: Object.freeze({
      evaluations: recoveryTelemetry.evaluations,
      matches: recoveryTelemetry.matches,
      mismatches: recoveryTelemetry.mismatches,
      errorFallbacks: recoveryTelemetry.errorFallbacks,
      rollbackEvaluations: recoveryTelemetry.rollbackEvaluations,
      historyCount: recoveryTelemetry.history.length,
      lastDecision: recoveryTelemetry.lastDecision
    })
  });
}

export function setM7CoreFinishEnabled(enabled, { reason = "MANUAL_QA_ROLLBACK" } = {}) {
  coreFinishEnabled = Boolean(enabled);
  finishRollbackReason = coreFinishEnabled ? "" : String(reason || "MANUAL_QA_ROLLBACK");
  recordFinish({
    operation: "AUTHORITY_SWITCH",
    outcome: coreFinishEnabled ? "CORE_FINISH_ENABLED" : "LEGACY_ROLLBACK_ENABLED",
    finishAuthority: coreFinishEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    reason: finishRollbackReason
  });
  return getM7FinishPlayerHandoffStatus();
}

export function resetM7FinishPlayerHandoffTelemetry() {
  finishTelemetry.evaluations = 0;
  finishTelemetry.matches = 0;
  finishTelemetry.mismatches = 0;
  finishTelemetry.errorFallbacks = 0;
  finishTelemetry.rollbackEvaluations = 0;
  finishTelemetry.lastDecision = null;
  finishTelemetry.history.length = 0;
  return getM7FinishPlayerHandoffStatus();
}

export function getM7FinishPlayerHandoffHistory() {
  return Object.freeze([...finishTelemetry.history]);
}

export function getM7FinishPlayerHandoffStatus() {
  return Object.freeze({
    phase: "M7",
    scope: "DONE_DISCARD_HANDOFF",
    enabled: coreFinishEnabled,
    mode: coreFinishEnabled ? "CORE_FINISH_LEGACY_SESSION" : "LEGACY_ROLLBACK",
    finishAuthority: coreFinishEnabled ? "CORE_M7" : "LEGACY_MIXED",
    remainingSessionAuthority: "LEGACY_MIXED_WITH_OTHER_CORE_M7_HANDOFFS",
    autoRollbackOnDisagreement: true,
    fallbackOnCoreError: true,
    rollbackReason: finishRollbackReason,
    liveScope: Object.freeze(["DONE_DISCARD"]),
    deferredScope: Object.freeze(["END_SESSION", "SESSION_LIFECYCLE_COMMIT"]),
    telemetry: Object.freeze({
      evaluations: finishTelemetry.evaluations,
      matches: finishTelemetry.matches,
      mismatches: finishTelemetry.mismatches,
      errorFallbacks: finishTelemetry.errorFallbacks,
      rollbackEvaluations: finishTelemetry.rollbackEvaluations,
      historyCount: finishTelemetry.history.length,
      lastDecision: finishTelemetry.lastDecision
    })
  });
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
    deferredScope: Object.freeze(["END_SESSION", "SESSION_LIFECYCLE_COMMIT"]),
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
