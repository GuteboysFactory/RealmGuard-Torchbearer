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

export function tb2eFoundationStatus() {
  const matrix=tb2eSourceCoverageMatrix();
  const wiseShadow=tb2eWiseShadowStatus();
  const helpShadow=tb2eHelpShadowStatus();
  const testShadow=tb2eTestShadowStatus();
  const natureShadow=tb2eNatureShadowStatus();
  const abilitiesShadow=tb2eAbilitySkillShadowStatus();
  const resourcesShadow=tb2eResourceShadowStatus();
  const conditionsShadow=tb2eConditionShadowStatus();
  return freezeTb2e({phase:"M10D.8",profileId:"torchbearer2e",profileVersion:1,creationProfileVersion:1,
    mode:"READ_ONLY",activationState:"FOUNDATION_ONLY",foundationReady:true,liveReady:false,
    activationAllowed:false,activationAvailable:profileActivationAvailable("torchbearer2e"),
    profileSwitch:false,liveParityVerified:false,creationCommitAllowed:false,sourceComplete:false,
    domainCount:matrix.length,coverageCounts:Object.fromEntries(["VERIFIED","PARTIAL","MANUAL","SOURCE_INCOMPLETE"].map(status=>[status,matrix.filter(row=>row.status===status).length])),
    shadowReadyDomains:["wises","help","tests","nature","abilities","resources","conditions"],wiseShadowReady:wiseShadow.adapterReady===true,helpShadowReady:helpShadow.adapterReady===true,testShadowReady:testShadow.adapterReady===true,natureShadowReady:natureShadow.adapterReady===true,abilitiesShadowReady:abilitiesShadow.adapterReady===true,resourcesShadowReady:resourcesShadow.adapterReady===true,conditionsShadowReady:conditionsShadow.adapterReady===true,
    sourceAuthority:TORCHBEARER2E_FOUNDATION_PROFILE.metadata.sourceAuthority,
    sourceCoverageMatrix:matrix,writes:{actors:0,items:0,journals:0,settings:0},destructiveConversion:false,
    nextStep:"M10D.8 Conditions bounded shadow QA only; no TB2E domain is enabled live"});
}

export function tb2eReadinessAudit() {
  return freezeTb2e({...tb2eFoundationStatus(),decision:"FOUNDATION_ONLY_NOT_READY_FOR_LIVE",
    blockers:["INCOMPLETE_GUIDE_SOURCES","UNRESOLVED_SOURCE_AMBIGUITIES","NO_LIVE_ADAPTERS_AUTHORIZED","NO_EXPLICIT_ACTIVATION_MILESTONE"],
    missingDomains:tb2eSourceCoverageMatrix().filter(row=>row.status!=="VERIFIED").map(row=>({id:row.id,status:row.status,gaps:row.gaps}))});
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
      sourceCoverageMatrix:tb2eSourceCoverageMatrix,getRulesProfile:()=>resolveRulesProfile("torchbearer2e").profile,
      getCreationProfile:()=>TORCHBEARER2E_CREATION_PROFILE,
      previewConversion:previewTorchbearer2eConversion,showConversionPreview:showTorchbearer2eConversionPreview,
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
      conditions:Object.freeze({getStatus:tb2eConditionShadowStatus,model:tb2eConditionModel,conditionInfo:tb2eConditionInfo,testEffectPlan:tb2eConditionTestEffectPlan,capabilityPlan:tb2eConditionCapabilityPlan,zeroRatingPlan:tb2eConditionZeroRatingPlan,conflictDispositionPlan:tb2eConflictDispositionConditionPlan,deathRiskPlan:tb2eConditionDeathRiskPlan})});
  });
}
