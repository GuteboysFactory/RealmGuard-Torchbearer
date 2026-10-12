import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eSkillInfo,tb2eNewSkillLearningPlan} from "./m10d-tb2e-abilities-shadow.mjs";
import {tb2eConditionCapabilityPlan} from "./m10d-tb2e-conditions-shadow.mjs";
import {tb2eAdvancementMarkPlan} from "./m10d-tb2e-advancement-shadow.mjs";
const result=(ok,reasonCode=null,data={})=>freezeTb2e({
 ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
 mode:"POST_TEST_PROGRESS_READ_ONLY",sourceEvidence:"DH p.75; SG pp.34, 51-52",
 liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
 advancementWrite:false,learningWrite:false,resourceSpendCommitted:false,...data
});
const invalid=(code,more={})=>result(false,code,more);
/** Independent-test progression preview from explicitly GM supplied facts.
 * Do not use to log a roll in Foundry or confer current Actor authority.
 */
export function tb2ePackageAProgressAfterTestPlan({
 skillName="",mode="SKILL",outcome="PASS",obstacle=null,
 gmConfirmedLegalTest=false,actingConditions=null,conditionsGmReviewed=false,
 skillAlreadyKnown=null,previousLearningAttempts=null,maximumNature=null,
 currentKnownSkillCount=null,context="ADVENTURE",alreadyCountedInContext=false,
 wentToTiebreaker=false
}={}){
 const type=String(mode??"").trim().toUpperCase();
 const end=String(outcome??"").trim().toUpperCase();
 if(!["SKILL","BEGINNERS_LUCK"].includes(type))return invalid("UNSUPPORTED_PROGRESSION_MODE");
 if(!["PASS","FAIL"].includes(end))return invalid("UNRESOLVED_TEST_RESULT");
 if(gmConfirmedLegalTest!==true)return invalid("GM_MUST_CONFIRM_LEGAL_COMPLETED_TEST");
 if(conditionsGmReviewed!==true||!Array.isArray(actingConditions))
   return invalid("GM_ACTING_CONDITIONS_REQUIRED");
 const skill=tb2eSkillInfo(skillName);
 if(!skill.ok)return invalid("UNKNOWN_SKILL");
 const cap=tb2eConditionCapabilityPlan({conditions:actingConditions,capability:"ADVANCEMENT_LOGGING"});
 if(!cap.ok)return invalid("INVALID_CONDITION_SET");
 if(cap.conditions.includes("DEAD"))return invalid("DEAD_CHARACTER_CANNOT_PROGRESS");
 if(type==="BEGINNERS_LUCK"){
   if(skillAlreadyKnown!==false)return invalid("BEGINNERS_LUCK_REQUIRES_UNTRAINED_SKILL");
   const bl=tb2eConditionCapabilityPlan({conditions:actingConditions,capability:"BEGINNERS_LUCK"});
   if(!bl.ok||!bl.allowed)return invalid(bl.reasonCode??"BEGINNERS_LUCK_CONDITION_BLOCKED");
   if(cap.allowed===false)return result(true,"SICK_BLOCKS_ADVANCEMENT_LOGGING",{
     skillName:skill.skill,track:"BEGINNERS_LUCK_ATTEMPTS",attemptRecorded:false,
     willHealthAdvancementMark:false,skillLearningCommitted:false,
     gmSourceFactsReviewed:true
   });
   const options={skillName:skill.skill,beginnersLuckAttempts:previousLearningAttempts,
     maximumNature,skillAlreadyKnown:false,currentKnownSkillCount};
   const progress=tb2eNewSkillLearningPlan(options);
   if(!progress.ok)return invalid("LEARNING_"+progress.reasonCode);
   const after=tb2eNewSkillLearningPlan({...options,beginnersLuckAttempts:previousLearningAttempts+1});
   if(!after.ok)return invalid("LEARNING_"+after.reasonCode);
   return result(true,null,{skillName:skill.skill,track:"BEGINNERS_LUCK_ATTEMPTS",
     result:end,attemptRecorded:false,attemptWouldBeAdded:1,
     attemptsBefore:progress.attempts,attemptsAfterPreview:after.attempts,
     maximumNature,requiredAttempts:progress.requiredAttempts,
     readyToLearnAfterPreview:after.ready,learnedRating:after.learnedRating,
     requiresForgetExistingSkill:after.requiresForgetExistingSkill,
     willHealthAdvancementMark:false,gmSourceFactsReviewed:true,
     skillLearningCommitted:false});
 }
 if(skillAlreadyKnown!==true)return invalid("SKILL_PASS_FAIL_REQUIRES_TRAINED_SKILL");
 if(wentToTiebreaker===true)return result(true,"INITIAL_TEST_NOT_COUNTED_AFTER_TIEBREAKER",{
   skillName:skill.skill,track:"SKILL_PASS_FAIL",wouldRecordMark:false,
   advancementRollRequiresSeparateTieBreakerAbility:true});
 if(cap.allowed===false)return result(true,"SICK_BLOCKS_ADVANCEMENT_LOGGING",{
   skillName:skill.skill,track:"SKILL_PASS_FAIL",wouldRecordMark:false,
   gmSourceFactsReviewed:true});
 const mark=tb2eAdvancementMarkPlan({outcome:end,obstacle,context,alreadyCountedInContext});
 if(!mark.ok)return invalid("MARK_"+mark.reasonCode);
 return result(true,mark.reasonCode??null,{
   skillName:skill.skill,track:"SKILL_PASS_FAIL",result:end,
   wouldRecordMark:mark.count,proposedMark:mark.mark,
   markReasonCode:mark.reasonCode,gmSourceFactsReviewed:true,
   willHealthAdvancementMark:false});
}
