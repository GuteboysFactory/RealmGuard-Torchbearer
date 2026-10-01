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
import { buildMg1eConversionPreview, buildMg2eConversionPreview, buildStrictConversionPreview, openMg1eConversionPreview, openMg2eConversionPreview, openStrictConversionPreview } from "./m10-profile-conversion-preview.mjs";
import {
  getM10B5GearInventoryConflictStatus,
  resolveM10BGearInventoryConflictPolicy
} from "./m10b-gear-inventory-conflict.mjs";
import {
  getM10B6SessionCirclesProgressionStatus,
  resolveM10BSessionCirclesProgressionPolicy
} from "./m10b-session-circles-progression.mjs";
import {
  getActiveM10BCharacterCreationPolicy,
  getM10B7CharacterCreationStatus,
  resolveCharacterCreationProfile,
  resolveM10BCharacterCreationPolicy,
  createProfileCreationDraft,
  updateProfileCreationDraft,
  validateProfileCreation,
  validateProfileCreationStep,
  profileCreationReview,
  profileCreationCommitPlan,
  profileCreationCommitPreview,
  profileCreationPresentationSnapshot,
  profileCreationPresentationHtml,
  profileCreationActivationReadiness,
  familyCreationPartyContext
} from "./m10b-character-creation.mjs";
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
  familyScaleEffectiveRankPlan,
  familyScaleEntry,
  familyScaleGroupWarPlan,
  familyScaleItemGuidance,
  familyScaleOutcomePlan,
  familyScaleRankFor,
  familyScaleSpecialPlan,
  getM10B8ComparativeScaleStatus,
  resolveComparativeScaleDefinition,
  resolveM10BComparativeScalePolicy
} from "./m10b-comparative-scale.mjs";
import {
  getM10B8RulesReferenceStatus,
  openProfileRulesReference,
  profileRulesReferenceHtml,
  profileRulesReferenceSnapshot
} from "./m10b-rules-reference.mjs";
import {
  getM10C3Mg2eShadowStatus,
  mg2eActivationReadiness,
  mg2eAdvancementPlan,
  mg2eAdvancementRequirements,
  mg2eArmorPlan,
  mg2eBeginnerLearningPlan,
  mg2eCirclesPlan,
  mg2eConflictActionSkills,
  mg2eConflictDispositionPlan,
  mg2eCreationShadowSnapshot,
  mg2eEndSessionPlan,
  mg2eGearRelevancePlan,
  mg2eHelpPlan,
  mg2eInventoryPlan,
  mg2eNaturePlan,
  mg2ePlayerTurnPlan,
  mg2eRecoveryPlan,
  mg2eScaleEntry,
  mg2eScaleGroupWarPlan,
  mg2eScaleOutcomePlan,
  mg2eScaleRankFor,
  mg2eScaleSpecialPlan,
  mg2eTestPolicySnapshot,
  mg2eTraitAgainstPlan,
  mg2eTraitBenefitPlan,
  mg2eWeaponActionPlan,
  mg2eWiseUsePlan
} from "./m10c-mg2e-shadow-adapters.mjs";
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
  profileActivationAvailable,
  switchRulesProfile,
  switchToLegacyMixed,
  switchToStrictRealmGuard,
  switchToMg1e
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
  const activation = profileActivationStatus();
  const creation = getActiveM10BCharacterCreationPolicy();
  return Object.freeze({
    phase: "M10C.3",
    mode: "GENERIC_PROFILE_FOUNDATION_PREVIEW_ROUTER_PLUS_MG2E_SHADOW",
    activeProfileId: active.profile.id,
    activeProfileVersion: active.profile.version,
    activeActivationState: active.profile.metadata?.activationState ?? "ACTIVE",
    activeLiveRuleAuthority: active.profile.metadata?.foundationOnly !== true && active.profile.metadata?.liveRuleAuthority !== false,
    activationProfiles: activation.profiles,
    profileSwitchActorItemWrites: false,
    profileSwitchWorldSettingWrites: 2,
    conversionPreviewAvailable: active.profile.metadata?.conversionPreviewAvailable === true,
    wiseAutoConversion: false,
    profileSwitchAvailable: true,
    creationWrites: creation.liveCommit,
    creationReadyWhenActive: creation.readyWhenActive === true,
    scaleWrites: false,
    rulesReferenceWrites: false,
    strictRulesLive: isStrictRealmGuard(),
    strictCreationLiveCommit: resolveM10BCharacterCreationPolicy("realm-guard-strict").liveCommit,
    mg1eActivationAvailable: profileActivationAvailable("mg1e"),
    mg1eCreationReadyWhenActive: resolveM10BCharacterCreationPolicy("mg1e").readyWhenActive === true,
    mg2eActivationAvailable: profileActivationAvailable("mg2e"),
    mg2eFoundationOnly: resolveRulesProfile("mg2e").profile.metadata?.foundationOnly === true,
    mg2eConversionPreviewAvailable: resolveRulesProfile("mg2e").profile.metadata?.conversionPreviewAvailable === true,
    mg2eShadowAdaptersReady: resolveRulesProfile("mg2e").profile.metadata?.shadowAdaptersReady === true,
    mg2eActivationReadiness: mg2eActivationReadiness(),
    nextStep: "M10C.4 MG2E activation-readiness closure audit"
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

export function previewMg2eConversion() {
  const active = getRulesProfileRuntime();
  const mg2e = resolveRulesProfile("mg2e");
  return buildMg2eConversionPreview({
    fromProfile: active.profile,
    toProfile: mg2e.profile,
    actors: currentActors(),
    worldItems: currentWorldItems()
  });
}

export function showMg2eConversionPreview() {
  const active = getRulesProfileRuntime();
  const mg2e = resolveRulesProfile("mg2e");
  return openMg2eConversionPreview({
    fromState: active,
    toState: mg2e,
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
      activationAvailable: profileActivationAvailable,
      activeProfileId: activeRulesProfileId,
      switchProfile: switchRulesProfile,
      switchToStrict: switchToStrictRealmGuard,
      switchToMg1e,
      switchToLegacy: switchToLegacyMixed,
      previewStrictConversion,
      openStrictConversionPreview: showStrictConversionPreview,
      previewMg1eConversion,
      openMg1eConversionPreview: showMg1eConversionPreview,
      previewMg2eConversion,
      openMg2eConversionPreview: showMg2eConversionPreview,
      mg2eShadowStatus: getM10C3Mg2eShadowStatus,
      mg2e: Object.freeze({
        getStatus: getM10C3Mg2eShadowStatus,
        activationReadiness: mg2eActivationReadiness,
        testPolicy: mg2eTestPolicySnapshot,
        advancementRequirements: mg2eAdvancementRequirements,
        advancementPlan: mg2eAdvancementPlan,
        beginnerLearningPlan: mg2eBeginnerLearningPlan,
        traitBenefitPlan: mg2eTraitBenefitPlan,
        traitAgainstPlan: mg2eTraitAgainstPlan,
        wiseUsePlan: mg2eWiseUsePlan,
        helpPlan: mg2eHelpPlan,
        naturePlan: mg2eNaturePlan,
        recoveryPlan: mg2eRecoveryPlan,
        inventoryPlan: mg2eInventoryPlan,
        conflictActionSkills: mg2eConflictActionSkills,
        conflictDispositionPlan: mg2eConflictDispositionPlan,
        weaponActionPlan: mg2eWeaponActionPlan,
        armorPlan: mg2eArmorPlan,
        gearRelevancePlan: mg2eGearRelevancePlan,
        playerTurnPlan: mg2ePlayerTurnPlan,
        endSessionPlan: mg2eEndSessionPlan,
        circlesPlan: mg2eCirclesPlan,
        scaleRankFor: mg2eScaleRankFor,
        scaleEntry: mg2eScaleEntry,
        scaleOutcomePlan: mg2eScaleOutcomePlan,
        scaleGroupWarPlan: mg2eScaleGroupWarPlan,
        scaleSpecialPlan: mg2eScaleSpecialPlan,
        creationShadowSnapshot: mg2eCreationShadowSnapshot
      }),
      gearInventoryConflictStatus: getM10B5GearInventoryConflictStatus,
      resolveGearInventoryConflictPolicy: resolveM10BGearInventoryConflictPolicy,
      sessionCirclesProgressionStatus: getM10B6SessionCirclesProgressionStatus,
      resolveSessionCirclesProgressionPolicy: resolveM10BSessionCirclesProgressionPolicy,
      characterCreationStatus: getM10B7CharacterCreationStatus,
      resolveCharacterCreationPolicy: resolveM10BCharacterCreationPolicy,
      resolveCharacterCreationProfile,
      activeCharacterCreationPolicy: getActiveM10BCharacterCreationPolicy,
      creationPartyContext: familyCreationPartyContext,
      createCreationDraft: createProfileCreationDraft,
      updateCreationDraft: updateProfileCreationDraft,
      validateProfileCreation,
      validateProfileCreationStep,
      creationReview: profileCreationReview,
      creationCommitPlan: profileCreationCommitPlan,
      creationCommitPreview: profileCreationCommitPreview,
      creationPresentationSnapshot: profileCreationPresentationSnapshot,
      creationPresentationHtml: profileCreationPresentationHtml,
      creationActivationReadiness: profileCreationActivationReadiness,
      comparativeScaleStatus: getM10B8ComparativeScaleStatus,
      resolveComparativeScalePolicy: resolveM10BComparativeScalePolicy,
      resolveComparativeScaleDefinition,
      scaleRankFor: familyScaleRankFor,
      scaleEntry: familyScaleEntry,
      scaleOutcomePlan: familyScaleOutcomePlan,
      scaleGroupWarPlan: familyScaleGroupWarPlan,
      scaleSpecialPlan: familyScaleSpecialPlan,
      scaleEffectiveRankPlan: familyScaleEffectiveRankPlan,
      scaleItemGuidance: familyScaleItemGuidance,
      rulesReferenceStatus: getM10B8RulesReferenceStatus,
      rulesReferenceSnapshot: profileRulesReferenceSnapshot,
      rulesReferenceHtml: profileRulesReferenceHtml,
      openRulesReference: openProfileRulesReference,
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
    console.log("realm-guard | M10C.3 MG2E shadow adapter router ready", getM10ProfilePreviewStatus());
  });
}
