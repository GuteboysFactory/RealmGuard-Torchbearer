import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageATestScenarioPlan} from "./m10d18-tb2e-package-a-test-scenario.mjs";
import {tb2eResolveObstacleShadow} from "./m10d-tb2e-test-shadow.mjs";
import {tb2ePackageAProgressAfterTestPlan} from "./m10d18-tb2e-package-a-progress-boundary.mjs";
const state=(ok,reasonCode=null,extra={})=>freezeTb2e({
 ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
 mode:"PACKAGE_A_CONSOLIDATED_OUTCOME_PREVIEW",
 sourceEvidence:"SG pp.31,34,35,46-52; DH pp.59,75",
 liveApplication:false,writesPlanned:0,rollExecuted:false,actorWrite:false,
 itemWrite:false,journalWrite:false,resourceSpendCommitted:false,
 advancementWrite:false,learningWrite:false,
 rollSourceAuthenticated:false,actorSourceAuthenticated:false,
 gmPermissionAuthenticated:false,...extra
});
const blocked=(code,extra={})=>state(false,code,extra);
const allowedProgress=new Set(["skillAlreadyKnown","previousLearningAttempts","maximumNature",
 "currentKnownSkillCount","context","alreadyCountedInContext","gmConfirmedLegalTest"]);
/** Independent obstacle result from a fully specified read-only scenario.
 * Numeric D6 input is *asserted* by the GM, never rolled or read from Foundry.
 * No Fate Luck / Wise reroll provenance is inferred. Accept only final plain
 * dice without extra Fate dice; enriched roll resolution needs its own audit.
 */
export function tb2ePackageAOutcomeAndProgressPlan({
 scenarioInput=null,dice=null,gmDiceReviewed=false,
 gmConfirmsNoRerolls=false,heroicTn3BenefitUnlocked=false,
 progressFacts=null
}={}){
 if(!scenarioInput||typeof scenarioInput!=="object"||Array.isArray(scenarioInput))
   return blocked("SCENARIO_INPUT_REQUIRED");
 if(gmDiceReviewed!==true)return blocked("GM_MUST_REVIEW_SUPPLIED_DICE");
 if(gmConfirmsNoRerolls!==true)
   return blocked("REROLL_AND_FATE_HISTORY_NOT_SUPPORTED_IN_THIS_PREVIEW");
 if(!Array.isArray(dice)||!dice.every(d=>Number.isInteger(d)&&d>=1&&d<=6))
   return blocked("INVALID_EXTERNAL_D6_LIST");
 const plan=tb2ePackageATestScenarioPlan(scenarioInput);
 if(!plan.ok)return blocked("SCENARIO_"+plan.reasonCode,{scenarioReasonCode:plan.reasonCode});
 if(dice.length!==plan.finalDicePool)
   return blocked("SUPPLIED_DICE_DO_NOT_MATCH_SCENARIO_POOL",{
     expectedPool:plan.finalDicePool,actualDice:dice.length});
 const sourceKind=plan.scenarioType==="BEGINNERS_LUCK"?
   String(scenarioInput.beginnerAbilityName??"").trim().toUpperCase():"SKILL";
 if(typeof heroicTn3BenefitUnlocked!=="boolean")
   return blocked("INVALID_HEROIC_TN3_BENEFIT_STATE");
 const resolved=tb2eResolveObstacleShadow({
   dice,obstacle:plan.obstacle,sourceKind,heroicTn3BenefitUnlocked
 });
 if(!resolved.ok)return blocked("RESOLUTION_"+resolved.reasonCode);
 let advancement=null;
 if(progressFacts!==null){
   if(!progressFacts||typeof progressFacts!=="object"||Array.isArray(progressFacts)||
      Object.keys(progressFacts).some(key=>!allowedProgress.has(key)))
     return blocked("INVALID_POST_TEST_FACT_FIELDS");
   if(["CONFLICT","SERIES","TIEBREAKER"].includes(String(progressFacts.context??"ADVENTURE").trim().toUpperCase()))
     return blocked("INDEPENDENT_TEST_PROGRESS_CONTEXT_MISMATCH");
   if(progressFacts.gmConfirmedLegalTest!==true)
     return blocked("GM_MUST_CONFIRM_PROGRESSION_ELIGIBILITY");
   advancement=tb2ePackageAProgressAfterTestPlan({
     ...progressFacts,skillName:plan.skillName,mode:plan.scenarioType,
     outcome:resolved.outcome,obstacle:plan.obstacle,
     actingConditions:scenarioInput.actingConditions,
     conditionsGmReviewed:scenarioInput.conditionsGmReviewed,
     wentToTiebreaker:false
   });
   if(!advancement.ok)return blocked("PROGRESS_"+advancement.reasonCode,{
     progressReasonCode:advancement.reasonCode});
 }
 return state(true,null,{
   scenarioSkill:plan.skillName,actingCharacterId:plan.actingCharacterId,
   scenarioType:plan.scenarioType,sourceFactorPage:plan.sourceFactorPage,
   finalDicePool:plan.finalDicePool,diceSuppliedBy:"GM_ASSERTION_NOT_ACTUAL_ROLL",
   resolvedDice:dice.slice(),successThreshold:resolved.successThreshold,
   rawSuccesses:resolved.rawSuccesses,finalSuccesses:resolved.finalSuccesses,
   obstacle:resolved.obstacle,outcome:resolved.outcome,
   margin:resolved.margin,marginKind:resolved.marginKind,
   advancementPreview:advancement,
   gmInputsReviewed:true,gmNoRerollsAsserted:true,
   noAdvanceAuthorized:true,finalRollEventNotRead:true,
   playerPermissionNotVerified:true
 });
}
