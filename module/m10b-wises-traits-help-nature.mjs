export const RATED_WISE_SCHEMA_VERSION = 1;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

export function familyAdvancementRequirements(rating) {
  const value = Math.max(0, Math.trunc(Number(rating ?? 0)));
  if (value <= 1) return freeze({ passNeeded: 1, failNeeded: 0 });
  return freeze({ passNeeded: value, failNeeded: value - 1 });
}

export function ratedWiseView(wise) {
  const rating = Math.max(0, Math.trunc(Number(wise?.system?.rating ?? 0)));
  const req = familyAdvancementRequirements(rating);
  const learning = wise?.system?.learning ?? {};
  const passed = Math.max(0, Math.min(req.passNeeded, Math.trunc(Number(learning.passed ?? 0))));
  const failed = Math.max(0, Math.min(req.failNeeded, Math.trunc(Number(learning.failed ?? 0))));
  return freeze({
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
    schemaVersion: RATED_WISE_SCHEMA_VERSION
  });
}

export function planRatedWiseTest(wise, { modifier = 0, helpDice = 0, personaDice = 0, profileLabel = "this profile" } = {}) {
  const view = ratedWiseView(wise);
  if (!view.assigned) {
    return freeze({
      ok: false,
      reasonCode: "wise-unassigned",
      reason: `This preserved Wise has no rating yet. Assign an explicit ${profileLabel} rating before testing it.`,
      wise: view,
      dice: 0
    });
  }
  const dice = Math.max(0, view.rating + Number(modifier || 0) + Math.max(0, Number(helpDice || 0)) + Math.max(0, Number(personaDice || 0)));
  return freeze({
    ok: dice > 0,
    reasonCode: dice > 0 ? "" : "zero-pool",
    reason: dice > 0 ? "" : `The ${profileLabel} Wise dice pool is 0.`,
    wise: view,
    dice
  });
}

export function planRatedWiseLearning(wise, passed) {
  const view = ratedWiseView(wise);
  if (!view.assigned) return freeze({ ok: false, reasonCode: "wise-unassigned", wise: view });
  const nextPassed = passed ? Math.min(view.passNeeded, view.passed + 1) : view.passed;
  const nextFailed = passed ? view.failed : Math.min(view.failNeeded, view.failed + 1);
  const ready = nextPassed >= view.passNeeded && nextFailed >= view.failNeeded;
  return freeze({
    ok: true,
    wise: view,
    outcome: passed ? "PASS" : "FAIL",
    next: {
      rating: view.rating,
      passed: nextPassed,
      failed: nextFailed,
      passNeeded: view.passNeeded,
      failNeeded: view.failNeeded,
      readyToAdvance: ready
    },
    advance: ready
      ? {
          rating: view.rating + 1,
          passed: 0,
          failed: 0,
          ...familyAdvancementRequirements(view.rating + 1)
        }
      : null
  });
}

export function mg1eTraitBenefitPlan(trait, { sessionUses = 0 } = {}) {
  const level = Math.max(0, Math.min(3, Math.trunc(Number(trait?.system?.rating ?? 0))));
  const used = Math.max(0, Math.trunc(Number(sessionUses ?? 0)));
  if (level === 1) return freeze({ level, available: used < 1, effect: "PLUS_1D", dice: used < 1 ? 1 : 0, rerollFailedDice: false, oncePerSession: true, consumeSessionUse: used < 1 });
  if (level === 2) return freeze({ level, available: true, effect: "PLUS_1D", dice: 1, rerollFailedDice: false, oncePerSession: false, consumeSessionUse: false });
  if (level === 3) return freeze({ level, available: used < 1, effect: "REROLL_ALL_FAILED_DICE", dice: 0, rerollFailedDice: used < 1, oncePerSession: true, consumeSessionUse: used < 1 });
  return freeze({ level, available: false, effect: "NONE", dice: 0, rerollFailedDice: false, oncePerSession: false, consumeSessionUse: false });
}

export function mg1eTraitAgainstPlan(mode, { versus = false } = {}) {
  const key = String(mode ?? "").trim();
  if (key === "impede") return freeze({ ok: true, mode: key, selfDice: -1, opponentDice: 0, checks: 1, tieToOpponent: false });
  if (key === "hurt" && versus) return freeze({ ok: true, mode: key, selfDice: 0, opponentDice: 2, checks: 2, tieToOpponent: false });
  if (key === "breakTie" && versus) return freeze({ ok: true, mode: key, selfDice: 0, opponentDice: 0, checks: 2, tieToOpponent: true });
  return freeze({ ok: false, mode: key, selfDice: 0, opponentDice: 0, checks: 0, tieToOpponent: false });
}

export function mg1eTraitCheckEconomy({ level = 0, sessionUses = 0, checks = 0 } = {}) {
  const traitLevel = Math.max(0, Math.min(3, Math.trunc(Number(level ?? 0))));
  const used = Math.max(0, Math.trunc(Number(sessionUses ?? 0)));
  const availableChecks = Math.max(0, Math.trunc(Number(checks ?? 0)));
  return freeze({
    level: traitLevel,
    sessionUses: used,
    checks: availableChecks,
    charge: { cost: 3, eligible: (traitLevel === 1 && used === 0) || traitLevel === 2, temporaryTargetLevel: traitLevel === 1 ? 2 : traitLevel === 2 ? 3 : traitLevel },
    recharge: {
      level1: { cost: 2, eligible: traitLevel === 1 && used > 0 },
      level3: { cost: 4, eligible: traitLevel === 3 && used > 0 }
    }
  });
}

function normalizedKind(value) {
  const key = String(value ?? "").trim().toLowerCase();
  if (key === "ability") return "Ability";
  if (key === "skill" || key === "role") return "Skill";
  if (key === "wise") return "Wise";
  return "";
}

export function classifyMg1eHelp({ sourceKind = "", isSelf = false, testKind = "" } = {}) {
  const kind = normalizedKind(sourceKind);
  const test = normalizedKind(testKind);
  if (isSelf && kind === "Wise") return freeze({ ok: true, mode: "I_AM_WISE", dice: 1, synergyAllowed: false, requiresGmRelevanceCheck: true });
  if (isSelf) return freeze({ ok: false, mode: "NONE", dice: 0, synergyAllowed: false, requiresGmRelevanceCheck: false });

  const sourceAllowed = !test
    || (test === "Ability" && kind === "Ability")
    || (["Skill", "Wise"].includes(test) && ["Skill", "Wise"].includes(kind));
  if (!sourceAllowed) return freeze({ ok: false, mode: "NONE", dice: 0, synergyAllowed: false, requiresGmRelevanceCheck: false });

  if (kind === "Wise") return freeze({ ok: true, mode: "TEAMWORK_WISE", dice: 1, synergyAllowed: false, requiresGmRelevanceCheck: true });
  if (kind === "Skill" || kind === "Ability") return freeze({ ok: true, mode: "TEAMWORK", dice: 1, synergyAllowed: false, requiresGmRelevanceCheck: kind !== "Skill" });
  return freeze({ ok: false, mode: "NONE", dice: 0, synergyAllowed: false, requiresGmRelevanceCheck: false });
}

export function mg1eHelperEligibility(options = {}) {
  const source = classifyMg1eHelp(options);
  return freeze({
    ...source,
    afraidBlocksHelp: false,
    helperTraitsAllowed: false,
    helperSharesConsequences: !options?.isSelf
  });
}

export function buildMg1eHelperConsequenceContract({ helperActorId = "", helperActorName = "", sourceKind = "", sourceName = "", failed = false } = {}) {
  return freeze({
    kind: "MG1E_HELPER_CONSEQUENCE",
    active: Boolean(failed),
    helperActorId: String(helperActorId ?? ""),
    helperActorName: String(helperActorName ?? ""),
    sourceKind: String(sourceKind ?? ""),
    sourceName: String(sourceName ?? ""),
    consequence: failed ? "LESSER_CONDITION_CHOSEN_BY_GM" : "NONE",
    autoApply: false
  });
}

export function getM10B3RulesStatus() {
  return freeze({
    phase: "M10B.3",
    wiseSchema: "RATED_ADDITIVE_NON_DESTRUCTIVE",
    wiseAutoConversion: false,
    traits: {
      level1: "+1D once/session",
      level2: "+1D every applicable test",
      level3: "reroll all failed dice once/session",
      positiveTraitsPerTest: 1,
      traitAgainst: ["impede", "hurt", "breakTie"],
      chargeRecharge: true
    },
    help: {
      iAmWise: "SELF_WISE_PLUS_1D",
      teamworkWise: "OTHER_CHARACTER_WISE_PLUS_1D",
      sourcePolicy: "MG1E_TYPED",
      synergy: false,
      helperConsequenceContract: true
    },
    nature: {
      descriptorsSource: "PROFILE",
      tapNature: true,
      doubleTapNature: true
    }
  });
}
