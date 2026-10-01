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
    phase: "M10C.2",
    mode: "GENERIC_PROFILE_FOUNDATION_PREVIEW_ROUTER",
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
    nextStep: "M10C.2 MG2E Domain-Completion Audit + Generic Conversion Preview Routing"
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
    console.log("realm-guard | M10C.2 generic profile preview router ready", getM10ProfilePreviewStatus());
  });
}
