import {
  RATED_WISE_SCHEMA_VERSION,
  familyAdvancementRequirements,
  ratedWiseView,
  planRatedWiseTest,
  planRatedWiseLearning,
  mg1eTraitBenefitPlan,
  mg1eTraitAgainstPlan,
  mg1eTraitCheckEconomy,
  classifyMg1eHelp,
  mg1eHelperEligibility,
  buildMg1eHelperConsequenceContract
} from "./m10b-wises-traits-help-nature.mjs";

export const STRICT_WISE_SCHEMA_VERSION = RATED_WISE_SCHEMA_VERSION;

export function strictAdvancementRequirements(rating) {
  return familyAdvancementRequirements(rating);
}

export function strictWiseView(wise) {
  return ratedWiseView(wise);
}

export function planStrictWiseTest(wise, options = {}) {
  return planRatedWiseTest(wise, { ...options, profileLabel: "Strict" });
}

export function planStrictWiseLearning(wise, passed) {
  return planRatedWiseLearning(wise, passed);
}

export function strictTraitBenefitPlan(trait, options = {}) {
  return mg1eTraitBenefitPlan(trait, options);
}

export function strictTraitAgainstPlan(mode, options = {}) {
  return mg1eTraitAgainstPlan(mode, options);
}

export function strictTraitCheckEconomy(options = {}) {
  return mg1eTraitCheckEconomy(options);
}

export function classifyStrictHelp(options = {}) {
  return classifyMg1eHelp(options);
}

export function strictHelperEligibility(options = {}) {
  return mg1eHelperEligibility(options);
}

export function buildStrictHelperConsequenceContract(options = {}) {
  const base = buildMg1eHelperConsequenceContract(options);
  return Object.freeze({
    ...base,
    kind: "STRICT_HELPER_CONSEQUENCE",
    applicationAuthority: "M10A.3_CONDITIONS_RECOVERY"
  });
}

export function getStrictWisesTraitsHelpStatus() {
  return Object.freeze({
    phase: "M10A.2_COMPAT_WRAPPER",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    delegatedRulesAuthority: "M10B.3_MG1E_FAMILY",
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
      sourcePolicy: "MG1E_TYPED",
      synergy: false,
      afraidBlocksHelp: false,
      helperConsequenceContract: true
    }),
    nextStep: "M10B.3 Wises / Traits / Help / Nature"
  });
}
