import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eConditionTestEffectPlan,tb2eConditionCapabilityPlan} from "./m10d-tb2e-conditions-shadow.mjs";
import {tb2eChannelNaturePlan} from "./m10d-tb2e-nature-shadow.mjs";
import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
const response=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
  mode:"CONDITION_PROVENANCE_SHADOW",sourceEvidence:"SG pp.46-49; DH p.59, p.67",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,
  resourceSpendCommitted:false,...data
});
const no=(code,extra={})=>response(false,code,extra);
const ident=v=>typeof v==="string"&&v.trim().length>0&&v.trim().length<=128;
/**
 * Validate an independent-test's claimed condition and participant facts.
 * Only GM-supplied source evidence, no Foundry Actor read or identity grant.
 */
export function tb2ePackageAConditionBoundaryPlan({
  skillName="",scenarioType="SKILL",actingCharacterId="",
  actingConditions=null,conditionsGmReviewed=false,
  help=null,wiseAid=null,bonusTraitsDice=0,bonusFreshDice=0,
  channelNatureDice=0,channelNatureFacts=null
}={}){
 const type=String(scenarioType??"").trim().toUpperCase();
 if(!["SKILL","BEGINNERS_LUCK"].includes(type))return no("UNSUPPORTED_CONDITION_SCENARIO_TYPE");
 if(!ident(actingCharacterId))return no("ACTING_CHARACTER_ID_REQUIRED");
 if(conditionsGmReviewed!==true||!Array.isArray(actingConditions))
   return no("GM_ACTING_CONDITIONS_REQUIRED");
 const skill=tb2eSkillInfo(skillName);
 if(!skill.ok)return no("UNKNOWN_SKILL");
 const test=type==="SKILL"?"SKILL":skill.beginnersLuckAbility;
 const actor=tb2eConditionTestEffectPlan({conditions:actingConditions,test});
 if(!actor.ok)return no("ACTOR_"+actor.reasonCode);
 if(type==="BEGINNERS_LUCK"){
   const bl=tb2eConditionCapabilityPlan({conditions:actingConditions,capability:"BEGINNERS_LUCK"});
   if(!bl.ok||!bl.allowed)return no(bl.reasonCode??"BEGINNERS_LUCK_CONDITION_BLOCKED");
 }
 if((bonusTraitsDice>0||wiseAid!==null)&&actingConditions.includes("ANGRY")&&bonusTraitsDice>0)
   return no("ANGRY_BLOCKS_BENEFICIAL_TRAITS");
 if(!Number.isInteger(bonusFreshDice)||bonusFreshDice!==0)
   return no("FRESH_DICE_MUST_BE_DERIVED_FROM_CONDITIONS");
 const actorFreshDice=actor.components.filter(x=>x.condition==="FRESH"&&x.kind==="DICE")
   .reduce((n,x)=>n+x.value,0);
 const actorConditionPenalty=actor.components.filter(x=>x.condition!=="FRESH"&&x.kind==="DICE")
   .reduce((n,x)=>n+x.value,0);
 if(actor.angryObstacleGuidance)
   return no("ANGRY_PRECISION_OBSTACLE_NEEDS_GM_DECISION");
 if(help!==null){
   if(!ident(help?.helperId)||help.helperId.trim()===actingCharacterId.trim())
     return no("HELP_REQUIRES_DISTINCT_CHARACTER");
   if(help.conditionsGmReviewed!==true||!Array.isArray(help.helperConditions))
     return no("GM_HELPER_CONDITIONS_REQUIRED");
   const cap=tb2eConditionCapabilityPlan({conditions:help.helperConditions,capability:"HELP"});
   if(!cap.ok||!cap.allowed)return no(cap.reasonCode??"HELPER_CONDITION_BLOCKED");
 }
 if(wiseAid!==null){
   if(!ident(wiseAid?.helperId)||wiseAid.helperId.trim()===actingCharacterId.trim())
     return no("WISE_AID_REQUIRES_DISTINCT_CHARACTER");
   if(wiseAid.conditionsGmReviewed!==true||!Array.isArray(wiseAid.helperConditions))
     return no("GM_WISE_HELPER_CONDITIONS_REQUIRED");
   const cap=tb2eConditionCapabilityPlan({conditions:wiseAid.helperConditions,capability:"BENEFICIAL_WISE"});
   if(!cap.ok||!cap.allowed)return no(cap.reasonCode??"WISE_HELPER_CONDITION_BLOCKED");
   if(help!==null&&wiseAid.helperId.trim()===help.helperId.trim())
     return no("SAME_HELPER_CANNOT_HELP_AND_WISE_AID");
 }
 let channel=null;
 if(channelNatureDice>0){
   if(!channelNatureFacts||typeof channelNatureFacts!=="object"||Array.isArray(channelNatureFacts)||
      channelNatureFacts.gmReviewed!==true)
     return no("GM_NATURE_CHANNEL_FACTS_REQUIRED");
   if(String(channelNatureFacts.testName??"").trim().toLowerCase()!==String(skillName).trim().toLowerCase())
     return no("CHANNEL_NATURE_TEST_MISMATCH");
   channel=tb2eChannelNaturePlan(channelNatureFacts);
   if(!channel.ok)return no("CHANNEL_"+channel.reasonCode);
   if(channel.diceAdded!==channelNatureDice)return no("CHANNEL_DICE_MUST_EQUAL_CURRENT_NATURE");
 }else if(channelNatureFacts!==null)return no("UNUSED_NATURE_CHANNEL_FACTS");
 return response(true,null,{
   actingCharacterId:actingCharacterId.trim(),conditionSource:"GM_REVIEWED_NOT_ACTOR_VERIFIED",
   actingConditions:actor.conditions,abilityOrSkillConditionDice:actorConditionPenalty,
   freshDiceAfterHalving:actorFreshDice,actingConditionModifiersGmReviewed:true,
   helperConditionRiskConfirmed:help!==null,
   wiseHelperConditionRiskConfirmed:wiseAid!==null,
   channeledNatureDice:channel?.diceAdded??0,
   channelTaxOnPass:channel?.onPassTax??null,
   channelTaxOnFail:channel?.onFailTax??null,
   conditionChangesAuthorized:false,sourceActorDocumentVerified:false
 });
}
