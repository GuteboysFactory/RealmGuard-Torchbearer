export const STRICT_WISE_SCHEMA_VERSION = 1;

export function strictAdvancementRequirements(rating) {
  const value = Math.max(0, Math.trunc(Number(rating ?? 0)));
  if (value <= 1) return Object.freeze({ passNeeded: 1, failNeeded: 0 });
  return Object.freeze({ passNeeded: value, failNeeded: value - 1 });
}

export function strictWiseView(wise) {
  const rating = Math.max(0, Math.trunc(Number(wise?.system?.rating ?? 0)));
  const req = strictAdvancementRequirements(rating);
  const learning = wise?.system?.learning ?? {};
  const passed = Math.max(0, Math.min(req.passNeeded, Math.trunc(Number(learning.passed ?? 0))));
  const failed = Math.max(0, Math.min(req.failNeeded, Math.trunc(Number(learning.failed ?? 0))));
  return Object.freeze({
    id: wise?.id ?? null,
    name: String(wise?.name ?? "Wise"),
    rating,
    assigned: rating > 0,
    conversionState: rating > 0 ? "RATED" : "UNASSIGNED_PRESERVED",
    passed,
    failed,
    passNeeded: req.passNeeded,
    failNeeded: req.failNeeded,
    readyToAdvance: rating > 0 && passed >= req.passNeeded && failed >= req.failNeeded,
    schemaVersion: STRICT_WISE_SCHEMA_VERSION
  });
}

export function planStrictWiseTest(wise, { modifier = 0, helpDice = 0, personaDice = 0 } = {}) {
  const view = strictWiseView(wise);
  if (!view.assigned) {
    return Object.freeze({
      ok: false,
      reasonCode: "wise-unassigned",
      reason: "This preserved Wise has no Strict rating yet. Assign a rating during an explicit profile conversion before testing it.",
      wise: view,
      dice: 0
    });
  }
  const dice = Math.max(0, view.rating + Number(modifier || 0) + Math.max(0, Number(helpDice || 0)) + Math.max(0, Number(personaDice || 0)));
  return Object.freeze({
    ok: dice > 0,
    reasonCode: dice > 0 ? "" : "zero-pool",
    reason: dice > 0 ? "" : "The Strict Wise dice pool is 0.",
    wise: view,
    dice
  });
}

export function planStrictWiseLearning(wise, passed) {
  const view = strictWiseView(wise);
  if (!view.assigned) return Object.freeze({ ok: false, reasonCode: "wise-unassigned", wise: view });
  const nextPassed = passed ? Math.min(view.passNeeded, view.passed + 1) : view.passed;
  const nextFailed = passed ? view.failed : Math.min(view.failNeeded, view.failed + 1);
  const ready = nextPassed >= view.passNeeded && nextFailed >= view.failNeeded;
  return Object.freeze({
    ok: true,
    wise: view,
    outcome: passed ? "PASS" : "FAIL",
    next: Object.freeze({
      rating: view.rating,
      passed: nextPassed,
      failed: nextFailed,
      passNeeded: view.passNeeded,
      failNeeded: view.failNeeded,
      readyToAdvance: ready
    }),
    advance: ready
      ? Object.freeze({
          rating: view.rating + 1,
          passed: 0,
          failed: 0,
          ...strictAdvancementRequirements(view.rating + 1)
        })
      : null
  });
}

export function strictTraitBenefitPlan(trait, { sessionUses = 0 } = {}) {
  const level = Math.max(0, Math.min(3, Math.trunc(Number(trait?.system?.rating ?? 0))));
  const used = Math.max(0, Math.trunc(Number(sessionUses ?? 0)));
  if (level === 1) {
    return Object.freeze({
      level,
      available: used < 1,
      effect: "PLUS_1D",
      dice: used < 1 ? 1 : 0,
      rerollFailedDice: false,
      oncePerSession: true,
      consumeSessionUse: used < 1
    });
  }
  if (level === 2) {
    return Object.freeze({
      level,
      available: true,
      effect: "PLUS_1D",
      dice: 1,
      rerollFailedDice: false,
      oncePerSession: false,
      consumeSessionUse: false
    });
  }
  if (level === 3) {
    return Object.freeze({
      level,
      available: used < 1,
      effect: "REROLL_ALL_FAILED_DICE",
      dice: 0,
      rerollFailedDice: used < 1,
      oncePerSession: true,
      consumeSessionUse: used < 1
    });
  }
  return Object.freeze({
    level,
    available: false,
    effect: "NONE",
    dice: 0,
    rerollFailedDice: false,
    oncePerSession: false,
    consumeSessionUse: false
  });
}

export function strictTraitAgainstPlan(mode, { versus = false } = {}) {
  const key = String(mode ?? "").trim();
  if (key === "impede") return Object.freeze({ ok: true, mode: key, selfDice: -1, opponentDice: 0, checks: 1, tieToOpponent: false });
  if (key === "hurt" && versus) return Object.freeze({ ok: true, mode: key, selfDice: 0, opponentDice: 2, checks: 2, tieToOpponent: false });
  if (key === "breakTie" && versus) return Object.freeze({ ok: true, mode: key, selfDice: 0, opponentDice: 0, checks: 2, tieToOpponent: true });
  return Object.freeze({ ok: false, mode: key, selfDice: 0, opponentDice: 0, checks: 0, tieToOpponent: false });
}

export function strictTraitCheckEconomy({ level = 0, sessionUses = 0, checks = 0 } = {}) {
  const traitLevel = Math.max(0, Math.min(3, Math.trunc(Number(level ?? 0))));
  const used = Math.max(0, Math.trunc(Number(sessionUses ?? 0)));
  const availableChecks = Math.max(0, Math.trunc(Number(checks ?? 0)));
  return Object.freeze({
    level: traitLevel,
    sessionUses: used,
    checks: availableChecks,
    charge: Object.freeze({
      cost: 3,
      eligible: (traitLevel === 1 && used === 0) || traitLevel === 2,
      temporaryTargetLevel: traitLevel === 1 ? 2 : traitLevel === 2 ? 3 : traitLevel
    }),
    recharge: Object.freeze({
      level1: Object.freeze({ cost: 2, eligible: traitLevel === 1 && used > 0 }),
      level3: Object.freeze({ cost: 4, eligible: traitLevel === 3 && used > 0 })
    })
  });
}

export function classifyStrictHelp({ sourceKind = "", isSelf = false } = {}) {
  const kind = String(sourceKind ?? "").trim();
  if (isSelf && kind === "Wise") {
    return Object.freeze({ ok: true, mode: "I_AM_WISE", dice: 1, synergyAllowed: false, requiresGmRelevanceCheck: true });
  }
  if (!isSelf && kind === "Wise") {
    return Object.freeze({ ok: true, mode: "TEAMWORK_WISE", dice: 1, synergyAllowed: false, requiresGmRelevanceCheck: true });
  }
  if (!isSelf && ["Skill", "Ability"].includes(kind)) {
    return Object.freeze({ ok: true, mode: "TEAMWORK", dice: 1, synergyAllowed: false, requiresGmRelevanceCheck: kind !== "Skill" });
  }
  return Object.freeze({ ok: false, mode: "NONE", dice: 0, synergyAllowed: false, requiresGmRelevanceCheck: false });
}

export function strictHelperEligibility({ sourceKind = "", isSelf = false } = {}) {
  const source = classifyStrictHelp({ sourceKind, isSelf });
  return Object.freeze({
    ...source,
    afraidBlocksHelp: false,
    helperTraitsAllowed: false,
    helperSharesConsequences: !isSelf
  });
}

export function buildStrictHelperConsequenceContract({ helperActorId = "", helperActorName = "", sourceKind = "", sourceName = "", failed = false } = {}) {
  return Object.freeze({
    kind: "STRICT_HELPER_CONSEQUENCE",
    active: Boolean(failed),
    helperActorId: String(helperActorId ?? ""),
    helperActorName: String(helperActorName ?? ""),
    sourceKind: String(sourceKind ?? ""),
    sourceName: String(sourceName ?? ""),
    consequence: failed ? "LESSER_CONDITION_CHOSEN_BY_GM" : "NONE",
    applicationAuthority: "M10A.3_CONDITIONS_RECOVERY",
    autoApply: false
  });
}

export function getStrictWisesTraitsHelpStatus() {
  return Object.freeze({
    phase: "M10A.2",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    wiseSchema: "RATED_ADDITIVE_NON_DESTRUCTIVE",
    wiseAutoConversion: false,
    traits: Object.freeze({
      level1: "+1D once/session",
      level2: "+1D every applicable test",
      level3: "reroll all failed dice once/session",
      positiveTraitsPerTest: 1,
      traitAgainst: ["impede", "hurt", "breakTie"],
      chargeRecharge: true
    }),
    help: Object.freeze({
      iAmWise: "SELF_WISE_PLUS_1D",
      teamworkWise: "OTHER_RANGER_WISE_PLUS_1D",
      synergy: false,
      afraidBlocksHelp: false,
      helperConsequenceContract: true
    }),
    nextStep: "M10A.3 Conditions / Recovery"
  });
}
