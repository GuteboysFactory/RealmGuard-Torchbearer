import { freezeTb2e, tb2eSourceCoverageMatrix } from "./m10d-tb2e-source-coverage.mjs";
import { TORCHBEARER2E_CREATION_PROFILE } from "./profiles/torchbearer2e-creation.mjs";
import { TORCHBEARER2E_FOUNDATION_PROFILE } from "./profiles/torchbearer2e-foundation.mjs";
import { resolveRulesProfile, getRulesProfileRuntime } from "./rules-profile-service.mjs";
import { profileActivationAvailable } from "./m10-profile-activation.mjs";
import { buildTorchbearer2eConversionPreview, openTorchbearer2eConversionPreview } from "./m10-profile-conversion-preview.mjs";
import { tb2eWiseAidPlan, tb2eWiseCyclePlan, tb2eWiseModel, tb2eWiseRerollPlan, tb2eWiseShadowStatus, tb2eWiseUsePlan } from "./m10d-tb2e-wise-shadow.mjs";
import { tb2eBeginnersLuckHelpPlan, tb2eConflictHelpPlan, tb2eHelpConsequencePlan, tb2eHelpPlan, tb2eHelpShadowStatus } from "./m10d-tb2e-help-shadow.mjs";
import { tb2eBeginnersLuckShadowPlan, tb2eDiceModel, tb2eLuckPlan, tb2eResolveObstacleShadow, tb2eResolveVersusShadow, tb2eTestPoolPlan, tb2eTestShadowStatus } from "./m10d-tb2e-test-shadow.mjs";
import { tb2eChannelNaturePlan, tb2eChannelNatureTaxPlan, tb2eNatureAdvancementPlan, tb2eNatureLossPlan, tb2eNatureModel, tb2eNatureRecoveryPlan, tb2eNatureShadowStatus, tb2eNatureSubstitutionPlan, tb2eNatureSubstitutionTaxPlan } from "./m10d-tb2e-nature-shadow.mjs";
import { tb2eAbilityInfo, tb2eAbilitySkillModel, tb2eAbilitySkillShadowStatus, tb2eAdvancementThresholdPlan, tb2eBeginnersLuckAbilityPlan, tb2eNewSkillLearningPlan, tb2eSkillInfo } from "./m10d-tb2e-abilities-shadow.mjs";
import { tb2eEndSessionAwardPlan, tb2eFateSpendPlan, tb2eLifestyleResourcesPlan, tb2ePersonaSpendPlan, tb2eResourceModel, tb2eResourceShadowStatus, tb2eResourcesTaxPlan, tb2eResourcesTestPlan } from "./m10d-tb2e-resources-shadow.mjs";
import { tb2eConditionCapabilityPlan, tb2eConditionDeathRiskPlan, tb2eConditionInfo, tb2eConditionModel, tb2eConditionShadowStatus, tb2eConditionTestEffectPlan, tb2eConditionZeroRatingPlan, tb2eConflictDispositionConditionPlan } from "./m10d-tb2e-conditions-shadow.mjs";
import { tb2eAccommodationRecoveryPlan, tb2eExhaustedRecoveryModifierPlan, tb2eFreshEligibilityPlan, tb2eHealerFailurePlan, tb2eHealerRecoveryPlan, tb2eHungryThirstyRecoveryPlan, tb2eRecoveryModel, tb2eRecoveryShadowStatus, tb2eStandardRecoveryPlan } from "./m10d-tb2e-recovery-shadow.mjs";
import { tb2eBeltStoragePlan, tb2eCachePlan, tb2eContainerDamagePlan, tb2eContainerPlan, tb2eGearStoragePlan, tb2eInventoryLocationPlan, tb2eInventoryModel, tb2eInventoryShadowStatus, tb2eStartingGearBoundaryPlan, tb2eTwoHandedWeaponPlan } from "./m10d-tb2e-inventory-shadow.mjs";
import { tb2eAdvancementMarkPlan, tb2eAdvancementModel, tb2eAdvancementResetPlan, tb2eAdvancementShadowStatus, tb2eAdvancementThresholdPlan as tb2eM10D11AdvancementThresholdPlan, tb2eGroupAdvancementChoicePlan, tb2eLevelProgressionBoundaryPlan, tb2eNatureAdvancementShadowPlan, tb2eNewSkillLearningAdvancementPlan, tb2eResourcesCirclesZeroToOnePlan } from "./m10d-tb2e-advancement-shadow.mjs";
import { tb2eCampCheckPlan, tb2eCampEntryPlan, tb2eCampEventModifierPlan, tb2eEndSessionTimingPlan, tb2eGrindTurnPlan, tb2eLifestyleExitPlan, tb2eLightPlan, tb2eSessionModel, tb2eSessionShadowStatus, tb2eSessionStartPlan, tb2eTownEntryPlan, tb2eTownEventModifierPlan, tb2eWatchPlan } from "./m10d-tb2e-session-shadow.mjs";
import { tb2eCirclesModel, tb2eCirclesObstacleBoundaryPlan, tb2eCirclesReputationPlan, tb2eCirclesShadowStatus, tb2eCirclesTestOutcomePlan, tb2eRelationshipEvolutionPlan, tb2eRelationshipLodgingPlan, tb2eStartingRelationshipsPlan } from "./m10d-tb2e-circles-shadow.mjs";
import { tb2eMightActionBonusPlan, tb2eMightScalePlan, tb2eMountedMightBoundaryPlan, tb2ePlayerMightGoalPlan, tb2ePostConflictMightReviewPlan, tb2ePrecedenceActionBonusPlan, tb2ePrecedenceEligibilityPlan, tb2ePrecedenceScalePlan, tb2eScalesModel, tb2eScalesShadowStatus } from "./m10d-tb2e-scales-shadow.mjs";
import { tb2eClassStockPlan, tb2eCreationModel, tb2eCreationShadowStatus, tb2eDrivesPlan, tb2eFinalDetailsPlan, tb2eHomePlan, tb2eHumanUpbringingPlan, tb2eLevelOneBenefitPlan, tb2eNatureQuestionnairePlan, tb2eRelationshipsBoundaryPlan, tb2eSkillRedistributionPlan, tb2eSocialGracePlan, tb2eSpecialtyPlan, tb2eStartingEquipmentBoundaryPlan, tb2eStartingWisesPlan } from "./m10d-tb2e-creation-shadow.mjs";
import { tb2eFinalDomainAudit, tb2eFinalFoundationAudit } from "./m10d-tb2e-final-audit.mjs";
import { tb2eCoreDomainAudit, tb2eCoreSourceCoverageMatrix, tb2eCoreSourceExpansionAudit } from "./m10d-tb2e-core-source-expansion.mjs";
import { tb2eCoreReconciliationStatus } from "./m10d-tb2e-core-reconciliation.mjs";
import { tb2eTraitsShadowStatus, tb2eTraitModel, tb2eTraitUsePlan, tb2eTraitRefreshPlan, tb2eClassTraitBoundaryPlan } from "./m10d-tb2e-traits-shadow.mjs";
import { tb2eArmorShadowStatus, tb2eArmorModel, tb2eArmorAbsorptionPlan, tb2eShieldDefendPlan, tb2eArmorRepairBoundaryPlan } from "./m10d-tb2e-armor-shadow.mjs";
import { tb2eConflictShadowStatus, tb2eConflictModel, tb2eConflictDispositionPlan, tb2eConflictActionPlan, tb2eConflictHpAllocationPlan } from "./m10d-tb2e-conflict-shadow.mjs";
import { tb2eConflictHitPlan, tb2eConflictRegroupPlan, tb2eConflictManeuverPlan } from "./m10d-tb2e-conflict-resolution-shadow.mjs";
import { tb2eConflictOutcomePlan } from "./m10d-tb2e-conflict-outcome-shadow.mjs";
import { tb2eMagicShadowStatus, tb2eMagicModel } from "./m10d-tb2e-magic-shadow.mjs";
import { tb2eMagicMemoryPlan, tb2eMagicSpellbookPlan, tb2eMagicCastPlan, tb2eMagicDischargePlan, tb2eMagicSpellInterruptPlan } from "./m10d-tb2e-magic-arcana-shadow.mjs";
import { tb2eMagicInvocationPlan, tb2eMagicInvocationInterruptPlan, tb2eMagicPurificationPlan, tb2eMagicStigmataPlan } from "./m10d-tb2e-magic-ritual-shadow.mjs";

export function tb2eFoundationStatus() {
  const matrix=tb2eSourceCoverageMatrix();
  const coreMatrix=tb2eCoreSourceCoverageMatrix();
  const sourceExpansionAudit=tb2eCoreSourceExpansionAudit();
  const reconciliation=tb2eCoreReconciliationStatus();
  const wiseShadow=tb2eWiseShadowStatus();
  const helpShadow=tb2eHelpShadowStatus();
  const testShadow=tb2eTestShadowStatus();
  const natureShadow=tb2eNatureShadowStatus();
  const abilitiesShadow=tb2eAbilitySkillShadowStatus();
  const resourcesShadow=tb2eResourceShadowStatus();
  const conditionsShadow=tb2eConditionShadowStatus();
  const recoveryShadow=tb2eRecoveryShadowStatus();
  const inventoryShadow=tb2eInventoryShadowStatus();
  const advancementShadow=tb2eAdvancementShadowStatus();
  const sessionShadow=tb2eSessionShadowStatus();
  const circlesShadow=tb2eCirclesShadowStatus();
  const scalesShadow=tb2eScalesShadowStatus();
  const creationShadow=tb2eCreationShadowStatus();
  const traitsShadow=tb2eTraitsShadowStatus();
  const armorShadow=tb2eArmorShadowStatus();
  const conflictShadow=tb2eConflictShadowStatus();
  const magicShadow=tb2eMagicShadowStatus();
  return freezeTb2e({phase:"M10D.18",profileId:"torchbearer2e",profileVersion:1,creationProfileVersion:1,
    mode:"READ_ONLY",activationState:"FOUNDATION_ONLY",foundationReady:true,liveReady:false,
    activationAllowed:false,activationAvailable:profileActivationAvailable("torchbearer2e"),
    profileSwitch:false,liveParityVerified:false,creationCommitAllowed:false,sourceComplete:true,coreSourceComplete:true,
    domainCount:coreMatrix.length,coverageCounts:Object.fromEntries(["VERIFIED","PARTIAL","MANUAL","SOURCE_INCOMPLETE"].map(status=>[status,coreMatrix.filter(row=>row.status===status).length])),
    guideBaselineCoverageCounts:Object.fromEntries(["VERIFIED","PARTIAL","MANUAL","SOURCE_INCOMPLETE"].map(status=>[status,matrix.filter(row=>row.status===status).length])),
    shadowReadyDomains:["wises","help","tests","nature","abilities","resources","conditions","recovery","inventory","advancement","session","circles","scales","creation"],wiseShadowReady:wiseShadow.adapterReady===true,helpShadowReady:helpShadow.adapterReady===true,testShadowReady:testShadow.adapterReady===true,natureShadowReady:natureShadow.adapterReady===true,abilitiesShadowReady:abilitiesShadow.adapterReady===true,resourcesShadowReady:resourcesShadow.adapterReady===true,conditionsShadowReady:conditionsShadow.adapterReady===true,recoveryShadowReady:recoveryShadow.adapterReady===true,inventoryShadowReady:inventoryShadow.adapterReady===true,advancementShadowReady:advancementShadow.adapterReady===true,sessionShadowReady:sessionShadow.adapterReady===true,circlesShadowReady:circlesShadow.adapterReady===true,scalesShadowReady:scalesShadow.adapterReady===true,creationShadowReady:creationShadow.adapterReady===true,traitsShadowReady:traitsShadow.adapterReady===true,armorShadowReady:armorShadow.adapterReady===true,conflictShadowReady:conflictShadow.adapterReady===true,magicShadowReady:magicShadow.adapterReady===true,
    sourceAuthority:TORCHBEARER2E_FOUNDATION_PROFILE.metadata.sourceAuthority,
    sourceCoverageMatrix:coreMatrix,guideBaselineCoverageMatrix:matrix,writes:{actors:0,items:0,journals:0,settings:0},destructiveConversion:false,
    historicalFinalFoundationAuditComplete:tb2eFinalFoundationAudit({shadowReadyDomains:["wises","help","tests","nature","abilities","resources","conditions","recovery","inventory","advancement","session","circles","scales","creation"]}).auditComplete,
    finalFoundationAuditComplete:sourceExpansionAudit.auditComplete,
    finalClassificationCounts:{VERIFIED:sourceExpansionAudit.sourceCounts.VERIFIED,BOUNDED_PARTIAL:0,SOURCE_BLOCKED:0,MANUAL:sourceExpansionAudit.sourceCounts.MANUAL},
    sourceExpansionAuditComplete:sourceExpansionAudit.auditComplete,
    existingShadowReauditRequired:sourceExpansionAudit.existingShadowReauditRequired,
    existingShadowReauditDomains:sourceExpansionAudit.existingShadowReauditDomains,
    newShadowAdapterDomains:sourceExpansionAudit.newShadowAdapterDomains,
    p2ImplementedShadowAdapterDomains:[...(traitsShadow.adapterReady?["traits"]:[]),...(armorShadow.adapterReady?["armor"]:[]),...(conflictShadow.adapterReady?["conflict"]:[]),...(magicShadow.adapterReady?["magic"]:[])],
    p2PendingShadowAdapterDomains:sourceExpansionAudit.newShadowAdapterDomains.filter(id=>!((id==="traits"&&traitsShadow.adapterReady)||(id==="armor"&&armorShadow.adapterReady)||(id==="conflict"&&conflictShadow.adapterReady)||(id==="magic"&&magicShadow.adapterReady))),
    liveIntegrationPaused:sourceExpansionAudit.liveIntegrationPauseRequired,
    coreReconciliationPackage:reconciliation.package,
    coreReconciliationPackageReady:reconciliation.packageReady,
    resolvedReconciliationFindingCount:reconciliation.resolvedFindingCount,
    pendingReconciliationFindingCount:reconciliation.pendingFindingCount,
    fullDomainReauditStillRequired:reconciliation.fullDomainReauditStillRequired,
    nextStep:"M10D.18 P2.4 Magic shadow QA; full-core 14-domain re-audit remains pending; M11 stays paused"});
}

export function tb2eReadinessAudit() {
  const expansion=tb2eCoreSourceExpansionAudit();
  return freezeTb2e({...tb2eFoundationStatus(),decision:"CORE_SOURCE_COMPLETE_IMPLEMENTATION_RECONCILIATION_REQUIRED",
    blockers:["FULL_CORE_SHADOW_REAUDIT_REQUIRED","NEW_SHADOW_ADAPTERS_REQUIRED","NO_LIVE_ADAPTERS_AUTHORIZED","NO_EXPLICIT_ACTIVATION_MILESTONE"],
    sourceMissingDomains:[],
    implementationGaps:[
      ...expansion.existingShadowReauditDomains.map(id=>({id,state:"FULL_CORE_REAUDIT_REQUIRED"})),
      ...tb2eFoundationStatus().p2PendingShadowAdapterDomains.map(id=>({id,state:"NEW_SHADOW_ADAPTER_REQUIRED"}))
    ]});
}

export function previewTorchbearer2eConversion({actors=[],worldItems=[]}={}) {
  return buildTorchbearer2eConversionPreview({fromProfile:getRulesProfileRuntime().profile,
    toProfile:resolveRulesProfile("torchbearer2e").profile,actors,worldItems});
}
export function showTorchbearer2eConversionPreview() {
  return openTorchbearer2eConversionPreview({fromState:getRulesProfileRuntime(),toState:resolveRulesProfile("torchbearer2e")});
}
export function installM10DFoundation() {
  Hooks.once("ready",()=>{
    game.realmGuard??={};game.realmGuard.core??={};
    game.realmGuard.core.m10d=Object.freeze({getStatus:tb2eFoundationStatus,readinessAudit:tb2eReadinessAudit,
      sourceCoverageMatrix:tb2eCoreSourceCoverageMatrix,guideBaselineCoverageMatrix:tb2eSourceCoverageMatrix,
      sourceExpansionAudit:tb2eCoreSourceExpansionAudit,coreDomainAudit:tb2eCoreDomainAudit,reconciliationStatus:tb2eCoreReconciliationStatus,
      getRulesProfile:()=>resolveRulesProfile("torchbearer2e").profile,
      getCreationProfile:()=>TORCHBEARER2E_CREATION_PROFILE,
      previewConversion:previewTorchbearer2eConversion,showConversionPreview:showTorchbearer2eConversionPreview,
      finalAudit:tb2eCoreSourceExpansionAudit,
      finalDomainAudit:tb2eCoreDomainAudit,
      historicalFinalAudit:()=>tb2eFinalFoundationAudit({shadowReadyDomains:tb2eFoundationStatus().shadowReadyDomains}),
      historicalFinalDomainAudit:(domainId)=>tb2eFinalDomainAudit(domainId,{shadowReadyDomains:tb2eFoundationStatus().shadowReadyDomains}),
      magicShadowStatus:tb2eMagicShadowStatus,
      magic:Object.freeze({getStatus:tb2eMagicShadowStatus,model:tb2eMagicModel,memoryPlan:tb2eMagicMemoryPlan,spellbookPlan:tb2eMagicSpellbookPlan,castPlan:tb2eMagicCastPlan,dischargePlan:tb2eMagicDischargePlan,spellInterruptPlan:tb2eMagicSpellInterruptPlan,invocationPlan:tb2eMagicInvocationPlan,invocationInterruptPlan:tb2eMagicInvocationInterruptPlan,purificationPlan:tb2eMagicPurificationPlan,stigmataPlan:tb2eMagicStigmataPlan}),
      conflictShadowStatus:tb2eConflictShadowStatus,
      conflict:Object.freeze({getStatus:tb2eConflictShadowStatus,model:tb2eConflictModel,dispositionPlan:tb2eConflictDispositionPlan,actionPlan:tb2eConflictActionPlan,hpAllocationPlan:tb2eConflictHpAllocationPlan,hitPlan:tb2eConflictHitPlan,regroupPlan:tb2eConflictRegroupPlan,maneuverPlan:tb2eConflictManeuverPlan,outcomePlan:tb2eConflictOutcomePlan}),
      armorShadowStatus:tb2eArmorShadowStatus,
      armor:Object.freeze({getStatus:tb2eArmorShadowStatus,model:tb2eArmorModel,absorptionPlan:tb2eArmorAbsorptionPlan,shieldDefendPlan:tb2eShieldDefendPlan,repairBoundaryPlan:tb2eArmorRepairBoundaryPlan}),
      traitsShadowStatus:tb2eTraitsShadowStatus,
      traits:Object.freeze({getStatus:tb2eTraitsShadowStatus,model:tb2eTraitModel,usePlan:tb2eTraitUsePlan,refreshPlan:tb2eTraitRefreshPlan,classTraitBoundaryPlan:tb2eClassTraitBoundaryPlan}),
      wiseShadowStatus:tb2eWiseShadowStatus,
      wises:Object.freeze({getStatus:tb2eWiseShadowStatus,model:tb2eWiseModel,usePlan:tb2eWiseUsePlan,aidPlan:tb2eWiseAidPlan,rerollPlan:tb2eWiseRerollPlan,cyclePlan:tb2eWiseCyclePlan}),
      helpShadowStatus:tb2eHelpShadowStatus,
      help:Object.freeze({getStatus:tb2eHelpShadowStatus,plan:tb2eHelpPlan,beginnersLuckPlan:tb2eBeginnersLuckHelpPlan,conflictPlan:tb2eConflictHelpPlan,consequencePlan:tb2eHelpConsequencePlan}),
      testShadowStatus:tb2eTestShadowStatus,
      tests:Object.freeze({getStatus:tb2eTestShadowStatus,model:tb2eDiceModel,poolPlan:tb2eTestPoolPlan,resolveObstacle:tb2eResolveObstacleShadow,resolveVersus:tb2eResolveVersusShadow,luckPlan:tb2eLuckPlan,beginnersLuckPlan:tb2eBeginnersLuckShadowPlan}),
      natureShadowStatus:tb2eNatureShadowStatus,
      nature:Object.freeze({getStatus:tb2eNatureShadowStatus,model:tb2eNatureModel,substitutionPlan:tb2eNatureSubstitutionPlan,substitutionTaxPlan:tb2eNatureSubstitutionTaxPlan,channelPlan:tb2eChannelNaturePlan,channelTaxPlan:tb2eChannelNatureTaxPlan,recoveryPlan:tb2eNatureRecoveryPlan,lossPlan:tb2eNatureLossPlan,advancementPlan:tb2eNatureAdvancementPlan}),
      abilitiesShadowStatus:tb2eAbilitySkillShadowStatus,
      abilities:Object.freeze({getStatus:tb2eAbilitySkillShadowStatus,model:tb2eAbilitySkillModel,abilityInfo:tb2eAbilityInfo,skillInfo:tb2eSkillInfo,beginnersLuckAbilityPlan:tb2eBeginnersLuckAbilityPlan,newSkillLearningPlan:tb2eNewSkillLearningPlan,advancementThresholdPlan:tb2eAdvancementThresholdPlan}),
      resourcesShadowStatus:tb2eResourceShadowStatus,
      resources:Object.freeze({getStatus:tb2eResourceShadowStatus,model:tb2eResourceModel,endSessionAwardPlan:tb2eEndSessionAwardPlan,fateSpendPlan:tb2eFateSpendPlan,personaSpendPlan:tb2ePersonaSpendPlan,testPlan:tb2eResourcesTestPlan,taxPlan:tb2eResourcesTaxPlan,lifestylePlan:tb2eLifestyleResourcesPlan}),
      conditionsShadowStatus:tb2eConditionShadowStatus,
      conditions:Object.freeze({getStatus:tb2eConditionShadowStatus,model:tb2eConditionModel,conditionInfo:tb2eConditionInfo,testEffectPlan:tb2eConditionTestEffectPlan,capabilityPlan:tb2eConditionCapabilityPlan,zeroRatingPlan:tb2eConditionZeroRatingPlan,conflictDispositionPlan:tb2eConflictDispositionConditionPlan,deathRiskPlan:tb2eConditionDeathRiskPlan}),
      recoveryShadowStatus:tb2eRecoveryShadowStatus,
      recovery:Object.freeze({getStatus:tb2eRecoveryShadowStatus,model:tb2eRecoveryModel,standardPlan:tb2eStandardRecoveryPlan,hungryThirstyPlan:tb2eHungryThirstyRecoveryPlan,accommodationPlan:tb2eAccommodationRecoveryPlan,exhaustedModifierPlan:tb2eExhaustedRecoveryModifierPlan,healerPlan:tb2eHealerRecoveryPlan,healerFailurePlan:tb2eHealerFailurePlan,freshEligibilityPlan:tb2eFreshEligibilityPlan}),
      inventoryShadowStatus:tb2eInventoryShadowStatus,
      inventory:Object.freeze({getStatus:tb2eInventoryShadowStatus,model:tb2eInventoryModel,locationPlan:tb2eInventoryLocationPlan,storagePlan:tb2eGearStoragePlan,containerPlan:tb2eContainerPlan,beltPlan:tb2eBeltStoragePlan,twoHandedPlan:tb2eTwoHandedWeaponPlan,containerDamagePlan:tb2eContainerDamagePlan,cachePlan:tb2eCachePlan,startingGearBoundaryPlan:tb2eStartingGearBoundaryPlan}),
      advancementShadowStatus:tb2eAdvancementShadowStatus,
      advancement:Object.freeze({getStatus:tb2eAdvancementShadowStatus,model:tb2eAdvancementModel,thresholdPlan:tb2eM10D11AdvancementThresholdPlan,markPlan:tb2eAdvancementMarkPlan,groupChoicePlan:tb2eGroupAdvancementChoicePlan,naturePlan:tb2eNatureAdvancementShadowPlan,newSkillPlan:tb2eNewSkillLearningAdvancementPlan,zeroToOnePlan:tb2eResourcesCirclesZeroToOnePlan,resetPlan:tb2eAdvancementResetPlan,levelBoundaryPlan:tb2eLevelProgressionBoundaryPlan}),
      sessionShadowStatus:tb2eSessionShadowStatus,
      session:Object.freeze({getStatus:tb2eSessionShadowStatus,model:tb2eSessionModel,startPlan:tb2eSessionStartPlan,grindTurnPlan:tb2eGrindTurnPlan,campEntryPlan:tb2eCampEntryPlan,campEventModifierPlan:tb2eCampEventModifierPlan,campCheckPlan:tb2eCampCheckPlan,watchPlan:tb2eWatchPlan,townEntryPlan:tb2eTownEntryPlan,townEventModifierPlan:tb2eTownEventModifierPlan,lifestyleExitPlan:tb2eLifestyleExitPlan,endSessionTimingPlan:tb2eEndSessionTimingPlan,lightPlan:tb2eLightPlan}),
      circlesShadowStatus:tb2eCirclesShadowStatus,
      circles:Object.freeze({getStatus:tb2eCirclesShadowStatus,model:tb2eCirclesModel,testOutcomePlan:tb2eCirclesTestOutcomePlan,reputationPlan:tb2eCirclesReputationPlan,relationshipEvolutionPlan:tb2eRelationshipEvolutionPlan,startingPlan:tb2eStartingRelationshipsPlan,lodgingPlan:tb2eRelationshipLodgingPlan,obstacleBoundaryPlan:tb2eCirclesObstacleBoundaryPlan}),
      scalesShadowStatus:tb2eScalesShadowStatus,
      scales:Object.freeze({getStatus:tb2eScalesShadowStatus,model:tb2eScalesModel,mightScalePlan:tb2eMightScalePlan,playerMightGoalPlan:tb2ePlayerMightGoalPlan,mightActionBonusPlan:tb2eMightActionBonusPlan,mountedMightPlan:tb2eMountedMightBoundaryPlan,postConflictMightReviewPlan:tb2ePostConflictMightReviewPlan,precedenceScalePlan:tb2ePrecedenceScalePlan,precedenceEligibilityPlan:tb2ePrecedenceEligibilityPlan,precedenceActionBonusPlan:tb2ePrecedenceActionBonusPlan}),
      creationShadowStatus:tb2eCreationShadowStatus,
      creation:Object.freeze({getStatus:tb2eCreationShadowStatus,model:tb2eCreationModel,classStockPlan:tb2eClassStockPlan,skillRedistributionPlan:tb2eSkillRedistributionPlan,humanUpbringingPlan:tb2eHumanUpbringingPlan,homePlan:tb2eHomePlan,socialGracePlan:tb2eSocialGracePlan,specialtyPlan:tb2eSpecialtyPlan,startingWisesPlan:tb2eStartingWisesPlan,natureQuestionnairePlan:tb2eNatureQuestionnairePlan,relationshipsBoundaryPlan:tb2eRelationshipsBoundaryPlan,startingEquipmentPlan:tb2eStartingEquipmentBoundaryPlan,drivesPlan:tb2eDrivesPlan,levelOnePlan:tb2eLevelOneBenefitPlan,finalDetailsPlan:tb2eFinalDetailsPlan})});
  });
}
