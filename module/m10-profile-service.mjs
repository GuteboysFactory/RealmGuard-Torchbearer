import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { buildStrictConversionPreview, openStrictConversionPreview } from "./m10-profile-conversion-preview.mjs";
import {
  getStrictGearInventoryConflictStatus,
  strictArmorPlan,
  strictAvailableConflictTools,
  strictConflictToolPlan,
  strictDisarmTargets,
  strictGearRelevancePlan,
  strictInventoryPolicyPlan,
  strictWeaponActionPlan,
  strictWeaponDefinition,
  strictWeaponOfWitPlan
} from "./m10-strict-gear-inventory-conflict.mjs";
import {
  getStrictConditionsRecoveryStatus,
  strictConditionDispositionEffects,
  strictConditionProvisionPlan,
  strictConditionRollEffects,
  strictHealthyState,
  strictHelperConsequenceResolution,
  strictInjuryWaiverPlan,
  strictLesserConditionOptions,
  strictPermanentReductionTargets,
  strictRecoveryBlocker,
  strictRecoveryEconomy,
  strictRecoveryHelpPolicy,
  strictRecoveryMethods,
  strictRecoveryState,
  strictZeroRatingPolicy
} from "./m10-strict-conditions-recovery.mjs";
import {
  buildStrictHelperConsequenceContract,
  classifyStrictHelp,
  getStrictWisesTraitsHelpStatus,
  planStrictWiseLearning,
  planStrictWiseTest,
  strictHelperEligibility,
  strictTraitAgainstPlan,
  strictTraitBenefitPlan,
  strictTraitCheckEconomy,
  strictWiseView
} from "./m10-strict-wises-traits-help.mjs";

function currentActors() {
  return globalThis.game?.actors?.contents ?? [];
}

function currentWorldItems() {
  return globalThis.game?.items?.contents ?? [];
}

export function getM10ProfilePreviewStatus() {
  const active = getRulesProfileRuntime();
  const strict = resolveRulesProfile("realm-guard-strict");
  return Object.freeze({
    phase: "M10A.4",
    mode: "STRICT_GEAR_INVENTORY_CONFLICT_FOUNDATION_PLUS_READ_ONLY_CONVERSION_PREVIEW",
    activeProfileId: active.profile.id,
    targetProfileId: strict.profile.id,
    targetActivationState: strict.profile.metadata?.activationState ?? "PREVIEW_ONLY",
    liveActivation: false,
    actorItemWrites: false,
    worldSettingWrites: false,
    conversionPreviewAvailable: true,
    strictRulesLive: false,
    wiseAutoConversion: false,
    profileSwitchAvailable: false,
    conditionWrites: false,
    recoveryWrites: false,
    inventoryWrites: false,
    conflictWrites: false,
    nextStep: "M10A.5 Session / Circles / Progression"
  });
}

export function previewStrictConversion() {
  const active = getRulesProfileRuntime();
  const strict = resolveRulesProfile("realm-guard-strict");
  return buildStrictConversionPreview({
    fromProfile: active.profile,
    toProfile: strict.profile,
    actors: currentActors(),
    worldItems: currentWorldItems()
  });
}

export function showStrictConversionPreview() {
  const active = getRulesProfileRuntime();
  const strict = resolveRulesProfile("realm-guard-strict");
  return openStrictConversionPreview({
    fromState: active,
    toState: strict,
    actors: currentActors(),
    worldItems: currentWorldItems()
  });
}

export function installM10ProfileConversionPreview() {
  globalThis.Hooks?.once?.("ready", () => {
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.core ??= {};
    globalThis.game.realmGuard.core.m10 = Object.freeze({
      getStatus: getM10ProfilePreviewStatus,
      previewStrictConversion,
      openStrictConversionPreview: showStrictConversionPreview,
      strict: Object.freeze({
        getStatus: getStrictWisesTraitsHelpStatus,
        wiseView: strictWiseView,
        planWiseTest: planStrictWiseTest,
        planWiseLearning: planStrictWiseLearning,
        traitBenefitPlan: strictTraitBenefitPlan,
        traitAgainstPlan: strictTraitAgainstPlan,
        traitCheckEconomy: strictTraitCheckEconomy,
        classifyHelp: classifyStrictHelp,
        helperEligibility: strictHelperEligibility,
        helperConsequenceContract: buildStrictHelperConsequenceContract,
        conditionsRecoveryStatus: getStrictConditionsRecoveryStatus,
        healthyState: strictHealthyState,
        conditionProvisionPlan: strictConditionProvisionPlan,
        conditionRollEffects: strictConditionRollEffects,
        conditionDispositionEffects: strictConditionDispositionEffects,
        zeroRatingPolicy: strictZeroRatingPolicy,
        recoveryMethods: strictRecoveryMethods,
        recoveryHelpPolicy: strictRecoveryHelpPolicy,
        recoveryBlocker: strictRecoveryBlocker,
        recoveryEconomy: strictRecoveryEconomy,
        recoveryState: strictRecoveryState,
        injuryWaiverPlan: strictInjuryWaiverPlan,
        permanentReductionTargets: strictPermanentReductionTargets,
        lesserConditionOptions: strictLesserConditionOptions,
        helperConsequenceResolution: strictHelperConsequenceResolution,
        gearInventoryConflictStatus: getStrictGearInventoryConflictStatus,
        inventoryPolicyPlan: strictInventoryPolicyPlan,
        availableConflictTools: strictAvailableConflictTools,
        conflictToolPlan: strictConflictToolPlan,
        weaponDefinition: strictWeaponDefinition,
        weaponActionPlan: strictWeaponActionPlan,
        armorPlan: strictArmorPlan,
        gearRelevancePlan: strictGearRelevancePlan,
        disarmTargets: strictDisarmTargets,
        weaponOfWitPlan: strictWeaponOfWitPlan
      })
    });
    console.log("realm-guard | M10A.4 Strict Gear / Inventory / Conflict ownership foundation ready", getM10ProfilePreviewStatus());
  });
}
