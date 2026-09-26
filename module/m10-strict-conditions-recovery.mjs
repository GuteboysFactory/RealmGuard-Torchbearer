import {
  MG1E_FAMILY_CONDITION_DEFINITIONS,
  resolveM10BConditionRecoveryPolicy,
  familyHealthyState,
  familyConditionProvisionPlan,
  familyConditionRollEffects,
  familyConditionDispositionEffects,
  familyZeroRatingPolicy,
  familyRecoveryMethods,
  familyRecoveryHelpPolicy,
  familyRecoveryBlocker,
  familyRecoveryEconomy,
  familyRecoveryState,
  familyPermanentConditionWaiverPlan,
  familyPermanentReductionTargets,
  familyLesserConditionOptions,
  familyHelperConsequenceResolution
} from "./m10b-conditions-recovery.mjs";

const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
};

const strictPolicy = () => resolveM10BConditionRecoveryPolicy("realm-guard-strict");

export const STRICT_CONDITION_SET = Object.freeze(["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
export const STRICT_RECOVERY_ORDER = Object.freeze(["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
export const STRICT_IGNORED_LEGACY_CONDITIONS = Object.freeze(["Fresh", "Afraid"]);
export const STRICT_CONDITION_DEFINITIONS = freeze(Object.fromEntries(
  STRICT_RECOVERY_ORDER.map(name => [name, MG1E_FAMILY_CONDITION_DEFINITIONS[name]])
));

export function strictHealthyState(actor) { return familyHealthyState(actor, strictPolicy()); }
export function strictConditionProvisionPlan(actor) { return familyConditionProvisionPlan(actor, strictPolicy()); }
export function strictConditionRollEffects(actor, rollName, options = {}) { return familyConditionRollEffects(actor, rollName, options, strictPolicy()); }
export function strictConditionDispositionEffects(actor, options = {}) { return familyConditionDispositionEffects(actor, options, strictPolicy()); }
export function strictZeroRatingPolicy(options = {}) { return familyZeroRatingPolicy(options); }
export function strictRecoveryMethods(actor, conditionName) { return familyRecoveryMethods(actor, conditionName, strictPolicy()); }
export function strictRecoveryHelpPolicy(options = {}) { return familyRecoveryHelpPolicy(options); }
export function strictRecoveryBlocker(actor, conditionName) { return familyRecoveryBlocker(actor, conditionName, strictPolicy()); }
export function strictRecoveryEconomy(options = {}) { return familyRecoveryEconomy(options, strictPolicy()); }
export function strictRecoveryState(conditionName, options = {}) { return familyRecoveryState(conditionName, options, strictPolicy()); }

export function strictInjuryWaiverPlan(options = {}) {
  const plan = familyPermanentConditionWaiverPlan("Injured", options, strictPolicy());
  return freeze({
    allowed: plan.allowed,
    phase: plan.phase,
    checkCost: plan.checkCost,
    testRequired: plan.testRequired,
    clearInjured: plan.clearCondition,
    nextState: plan.nextState,
    excludedTargets: plan.excludedTargets,
    liveApplication: plan.liveApplication
  });
}

export function strictPermanentReductionTargets(actor) { return familyPermanentReductionTargets(actor); }
export function strictLesserConditionOptions(mainConditionName) { return familyLesserConditionOptions(mainConditionName, strictPolicy()); }

export function strictHelperConsequenceResolution(contract, options = {}) {
  const result = familyHelperConsequenceResolution(contract, options, strictPolicy());
  return freeze({ ...result, kind: "STRICT_HELPER_CONSEQUENCE_RESOLUTION" });
}

export function getStrictConditionsRecoveryStatus() {
  const policy = strictPolicy();
  return freeze({
    phase: "M10A.3",
    compatibilityProvider: "M10B.4_GENERIC_FAMILY",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    conditions: {
      healthy: "DERIVED",
      adverse: [...policy.adverseConditions],
      ignoredLegacyPreserved: [...STRICT_IGNORED_LEGACY_CONDITIONS],
      sickReplacement: "Strained"
    },
    recovery: {
      order: [...policy.recoveryOrder],
      hungryIncludesHarvester: true,
      tiredGoodRest: true,
      injuredHealerFlow: true,
      strainedCounselFlow: true,
      willHealthRecoveryHelp: false,
      gmTurnRecoveryCheckCost: policy.gmTurnCheckCost,
      helperLesserConditionResolver: true
    },
    writesActors: false,
    writesItems: false,
    nextStep: "Compatibility wrapper delegates to M10B.4 generic Conditions / Recovery routing"
  });
}
