import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import {
  getStrictCreationStatus,
  strictCreateDraft,
  strictCreationCommitPlan,
  strictCreationCommitPreview,
  strictCreationPartyContext,
  strictCreationProfile,
  strictCreationReview,
  strictUpdateDraft,
  strictValidateCreation,
  strictValidateCreationStep
} from "./m10-strict-character-creation.mjs";
import {
  getStrictSessionCirclesProgressionStatus,
  strictAdvancementPlan,
  strictAdvancementRequirements,
  strictBeginnerLearningPlan,
  strictCirclesContactPlan,
  strictConflictAdvancementPlan,
  strictEndSessionValidation,
  strictEnmityDispositionPlan,
  strictPlayerTurnTestPlan,
  strictProgressionDataPolicy,
  strictRecoveryCheckPlan,
  strictResourceSpendPlan,
  strictRewardProposal,
  strictSessionPolicy
} from "./m10-strict-session-circles-progression.mjs";
import { buildMg1eConversionPreview, buildStrictConversionPreview, openMg1eConversionPreview, openStrictConversionPreview } from "./m10-profile-conversion-preview.mjs";
import {
  getM10B5GearInventoryConflictStatus,
  resolveM10BGearInventoryConflictPolicy
} from "./m10b-gear-inventory-conflict.mjs";
import {
  getM10B6SessionCirclesProgressionStatus,
  resolveM10BSessionCirclesProgressionPolicy
} from "./m10b-session-circles-progression.mjs";
import {
  getStrictScaleStatus,
  strictFighterHunterOutcomePlan,
  strictLoreMasterScalePlan,
  strictMilitaristWarPlan,
  strictScaleEntry,
  strictScaleRankFor,
  strictTokenScaleGuidance
} from "./m10-strict-scale-of-might.mjs";
import {
  openStrictRulesReferencePreview,
  strictRulesReferenceHtml,
  strictRulesReferenceSnapshot
} from "./m10-strict-rules-reference.mjs";
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
  activeRulesProfileId,
  isStrictRealmGuard,
  profileActivationStatus,
  switchToLegacyMixed,
  switchToStrictRealmGuard
} from "./m10-profile-activation.mjs";
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
    phase: "M10B.6",
    mode: "GENERIC_PROFILE_PREVIEW_ROUTER",
    activeProfileId: active.profile.id,
    targetProfileId: strict.profile.id,
    targetActivationState: strict.profile.metadata?.activationState ?? "PREVIEW_ONLY",
    liveActivation: isStrictRealmGuard(),
    profileSwitchActorItemWrites: false,
    profileSwitchWorldSettingWrites: 2,
    conversionPreviewAvailable: true,
    strictRulesLive: isStrictRealmGuard(),
    wiseAutoConversion: false,
    profileSwitchAvailable: true,
    conditionWrites: isStrictRealmGuard(),
    recoveryWrites: isStrictRealmGuard(),
    inventoryWrites: false,
    conflictWrites: isStrictRealmGuard(),
    sessionWrites: isStrictRealmGuard(),
    circlesWrites: isStrictRealmGuard(),
    progressionWrites: isStrictRealmGuard(),
    creationWrites: isStrictRealmGuard(),
    strictCreationLiveCommit: isStrictRealmGuard(),
    scaleWrites: false,
    rulesReferenceWrites: false,
    nextStep: "M10B.6 Session / Circles / Progression routing QA"
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


export function previewMg1eConversion() {
  const active = getRulesProfileRuntime();
  const mg1e = resolveRulesProfile("mg1e");
  return buildMg1eConversionPreview({
    fromProfile: active.profile,
    toProfile: mg1e.profile,
    actors: currentActors(),
    worldItems: currentWorldItems()
  });
}

export function showMg1eConversionPreview() {
  const active = getRulesProfileRuntime();
  const mg1e = resolveRulesProfile("mg1e");
  return openMg1eConversionPreview({
    fromState: active,
    toState: mg1e,
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
      activationStatus: profileActivationStatus,
      activeProfileId: activeRulesProfileId,
      switchToStrict: switchToStrictRealmGuard,
      switchToLegacy: switchToLegacyMixed,
      previewStrictConversion,
      openStrictConversionPreview: showStrictConversionPreview,
      previewMg1eConversion,
      openMg1eConversionPreview: showMg1eConversionPreview,
      gearInventoryConflictStatus: getM10B5GearInventoryConflictStatus,
      resolveGearInventoryConflictPolicy: resolveM10BGearInventoryConflictPolicy,
      sessionCirclesProgressionStatus: getM10B6SessionCirclesProgressionStatus,
      resolveSessionCirclesProgressionPolicy: resolveM10BSessionCirclesProgressionPolicy,
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
        weaponOfWitPlan: strictWeaponOfWitPlan,
        sessionCirclesProgressionStatus: getStrictSessionCirclesProgressionStatus,
        sessionPolicy: strictSessionPolicy,
        playerTurnTestPlan: strictPlayerTurnTestPlan,
        recoveryCheckPlan: strictRecoveryCheckPlan,
        endSessionValidation: strictEndSessionValidation,
        rewardProposal: strictRewardProposal,
        circlesContactPlan: strictCirclesContactPlan,
        enmityDispositionPlan: strictEnmityDispositionPlan,
        progressionDataPolicy: strictProgressionDataPolicy,
        resourceSpendPlan: strictResourceSpendPlan,
        advancementRequirements: strictAdvancementRequirements,
        advancementPlan: strictAdvancementPlan,
        conflictAdvancementPlan: strictConflictAdvancementPlan,
        beginnerLearningPlan: strictBeginnerLearningPlan,
        creationStatus: getStrictCreationStatus,
        creationProfile: strictCreationProfile,
        creationPartyContext: strictCreationPartyContext,
        createCreationDraft: strictCreateDraft,
        updateCreationDraft: strictUpdateDraft,
        validateCreation: strictValidateCreation,
        validateCreationStep: strictValidateCreationStep,
        creationReview: strictCreationReview,
        creationCommitPlan: strictCreationCommitPlan,
        creationCommitPreview: strictCreationCommitPreview,
        scaleStatus: getStrictScaleStatus,
        scaleRankFor: strictScaleRankFor,
        scaleEntry: strictScaleEntry,
        fighterHunterOutcomePlan: strictFighterHunterOutcomePlan,
        militaristWarPlan: strictMilitaristWarPlan,
        loreMasterScalePlan: strictLoreMasterScalePlan,
        tokenScaleGuidance: strictTokenScaleGuidance,
        rulesReferenceSnapshot: strictRulesReferenceSnapshot,
        rulesReferenceHtml: strictRulesReferenceHtml,
        openRulesReferencePreview: openStrictRulesReferencePreview
      })
    });
    console.log("realm-guard | M10B.6 generic Profile router ready", getM10ProfilePreviewStatus());
  });
}
