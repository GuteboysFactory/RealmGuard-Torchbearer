import {
  resolveM10BSessionCirclesProgressionPolicy,
  familySessionPolicy,
  familyPlayerTurnTestPlan,
  familyRecoveryCheckPlan,
  familyEndSessionValidation,
  familyRewardProposal,
  familyCirclesContactPlan,
  familyEnmityDispositionPlan,
  familyProgressionDataPolicy,
  familyResourceSpendPlan,
  familyAdvancementRequirements,
  familyAdvancementPlan,
  familyConflictAdvancementPlan,
  familyBeginnerLearningPlan
} from "./m10b-session-circles-progression.mjs";

const strictPolicy = () => resolveM10BSessionCirclesProgressionPolicy("realm-guard-strict");

export function strictSessionPolicy() {
  const plan = familySessionPolicy(strictPolicy());
  return Object.freeze({
    ...plan,
    additionalPlayerTurnTestCheckCost: plan.additionalTestCheckCost
  });
}

export function strictPlayerTurnTestPlan(options = {}) {
  return familyPlayerTurnTestPlan(options, strictPolicy());
}

export function strictRecoveryCheckPlan(options = {}) {
  return familyRecoveryCheckPlan(options, strictPolicy());
}

export function strictEndSessionValidation(options = {}) {
  return familyEndSessionValidation(options, strictPolicy());
}

export function strictRewardProposal(options = {}) {
  return familyRewardProposal(options, strictPolicy());
}

export function strictCirclesContactPlan(options = {}) {
  return familyCirclesContactPlan(options, strictPolicy());
}

export function strictEnmityDispositionPlan(options = {}) {
  return familyEnmityDispositionPlan(options, strictPolicy());
}

export function strictProgressionDataPolicy(actor) {
  return familyProgressionDataPolicy(actor, strictPolicy());
}

export function strictResourceSpendPlan(actor, kind, amount = 1) {
  return familyResourceSpendPlan(actor, kind, amount, strictPolicy());
}

export function strictAdvancementRequirements(rating = 0) {
  const result = familyAdvancementRequirements(rating, strictPolicy());
  return Object.freeze({
    rating: result.rating,
    passNeeded: result.passNeeded,
    failNeeded: result.failNeeded,
    source: result.source
  });
}

export function strictAdvancementPlan(options = {}) {
  return familyAdvancementPlan(options, strictPolicy());
}

export function strictConflictAdvancementPlan(options = {}) {
  return familyConflictAdvancementPlan(options, strictPolicy());
}

export function strictBeginnerLearningPlan(options = {}) {
  return familyBeginnerLearningPlan(options, strictPolicy());
}

export function getStrictSessionCirclesProgressionStatus() {
  const policy = strictPolicy();
  return Object.freeze({
    phase: "M10A.5_COMPAT_WRAPPER",
    compatibilityProvider: "M10B.6_GENERIC_FAMILY",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    session: Object.freeze({
      engine: policy.session.coreEngine || "CORE_M7",
      source: "MG1E_2008",
      freePlayerTurnTests: policy.session.playerTurnFreeTests,
      additionalTestCheckCost: policy.session.additionalTestCheckCost,
      alternation: policy.session.alternationRequired,
      soloException: policy.session.soloAlternationException,
      gmTurnRecoveryCheckCost: policy.session.gmTurnRecoveryCheckCost,
      embodimentMayAwardEveryone: policy.session.embodimentMayAwardEveryone,
      tableRewardAuthority: policy.session.tableRewardAuthority,
      foundryCommitAuthority: policy.session.foundryCommitAuthority
    }),
    circles: Object.freeze({
      source: "MG1E_2008",
      socialStorage: policy.circles.socialStorage,
      knownContactFutureDice: policy.circles.knownContactFutureDice,
      enmityClause: policy.circles.enmityClause,
      enmityArgumentSpeechDispositionSuccess: policy.circles.enmityArgumentSpeechDispositionSuccess
    }),
    progression: Object.freeze({
      source: "MG1E_2008",
      levels: policy.progression.levelsEnabled,
      talents: policy.progression.talentsEnabled,
      preserveLegacyData: policy.progression.preserveExistingData,
      fatePersonaSpendStillAllowed: true,
      lifetimeSpendLevelTracking: policy.progression.lifetimeSpendLevelTrackingEnabled,
      advancement: policy.progression.advancement,
      ratingZeroOnePassNeeded: policy.progression.ratingZeroOnePassNeeded,
      clearSlateOnAdvance: policy.progression.clearSlateOnAdvance,
      oneTestPerAbilityOrSkillPerConflictScene: policy.progression.oneTestPerAbilityOrSkillPerConflictScene,
      beginnerLearningOpensAt: policy.progression.beginnerLearningOpensAt
    }),
    writesActors: false,
    writesItems: false,
    liveApplication: false,
    nextStep: "Compatibility wrapper delegates to M10B.6 generic Session / Circles / Progression routing"
  });
}
