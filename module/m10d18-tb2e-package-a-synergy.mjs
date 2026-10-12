import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eHelpParticipationPlan} from "./m10d-tb2e-help-shadow.mjs";
import {tb2eConditionCapabilityPlan} from "./m10d-tb2e-conditions-shadow.mjs";
import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
const safe=(ok,reasonCode=null,more={})=>freezeTb2e({
 ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
 mode:"HELP_SYNERGY_ADVANCEMENT_SHADOW",sourceEvidence:"Scholar's Guide p.87",
 liveApplication:false,writesPlanned:0,resourceSpendCommitted:false,
 actorWrite:false,itemWrite:false,advancementWrite:false,
 rollExecuted:false,gmPermissionAuthenticated:false,actorSourceAuthenticated:false,...more
});
const no=(reasonCode,extra={})=>safe(false,reasonCode,extra);
const id=v=>typeof v==="string"&&v.trim().length>0&&v.length<=128;
/** A Helper may spend Fate before the dice to mark the Skill/Ability
 * actually used for Help, not the acting character's tested Skill.
 * In a tie resolved with a tiebreaker, helper either retracts Fate or
 * leaves it spent to mark the tiebreaker test, despite not adding Help die.
 * All data GM asserted; no resource/advancement mutation.
 */
export function tb2ePackageASynergyAdvancementPlan({
 helperId="",actingCharacterId="",helpRequest=null,
 helpingSourceKind="",helpingSourceName="",helpedTestOutcome="",
 gmHelpSourceVerified=false,fateAvailable=null,fateCommittedBeforeRoll=false,
 helperConditions=null,helperConditionsGmReviewed=false,
 tieDecision="",tieBreakerSourceKind="",tieBreakerSourceName="",
 tieBreakerOutcome="",gmTiebreakerVerified=false
}={}){
 if(!id(helperId)||!id(actingCharacterId)||helperId.trim()===actingCharacterId.trim())
   return no("DISTINCT_HELPER_AND_ACTOR_REQUIRED");
 if(!Number.isInteger(fateAvailable)||fateAvailable<1)
   return no("HELPER_FATE_POINT_REQUIRED");
 if(fateCommittedBeforeRoll!==true)
   return no("SYNERGY_FATE_MUST_BE_COMMITTED_BEFORE_ROLL");
 if(gmHelpSourceVerified!==true)
   return no("GM_HELP_SKILL_OR_ABILITY_VERIFICATION_REQUIRED");
 if(!helpRequest||typeof helpRequest!=="object"||Array.isArray(helpRequest))
   return no("VALID_HELP_PARTICIPATION_REQUIRED");
 const help=tb2eHelpParticipationPlan(helpRequest);
 if(!help.ok)return no("HELP_"+help.reasonCode);
 const kind=String(helpingSourceKind??"").trim().toUpperCase();
 const name=String(helpingSourceName??"").trim();
 if(!["SKILL","ABILITY"].includes(kind)||!id(name))
   return no("HELPING_ADVANCEMENT_SOURCE_REQUIRED");
 const declared=helpRequest.helpOptions??{};
 if(String(declared.sourceKind??"").trim().toUpperCase()!==kind||
    String(declared.sourceName??"").trim().toLowerCase()!==name.toLowerCase())
   return no("HELPING_ADVANCEMENT_MUST_MATCH_ACTUAL_HELP_SOURCE");
 if(kind==="SKILL"&&!tb2eSkillInfo(name).ok)return no("UNKNOWN_HELPING_SKILL");
 if(kind==="ABILITY"&&!["WILL","HEALTH","RESOURCES","CIRCLES","NATURE"].includes(name.toUpperCase()))
   return no("UNKNOWN_HELPING_ABILITY");
 if(helperConditionsGmReviewed!==true||!Array.isArray(helperConditions))
   return no("GM_HELPER_CONDITIONS_REQUIRED");
 const capability=tb2eConditionCapabilityPlan({
   conditions:helperConditions,capability:"ADVANCEMENT_LOGGING"
 });
 if(!capability.ok)return no("INVALID_HELPER_CONDITIONS");
 if(capability.conditions.includes("DEAD"))return no("DEAD_HELPER_CANNOT_USE_SYNERGY");
 const result=String(helpedTestOutcome??"").trim().toUpperCase();
 if(!["PASS","FAIL","TIE"].includes(result))return no("UNRESOLVED_ACTOR_TEST_OUTCOME");
 const markAllowed=capability.allowed!==false;
 if(result!=="TIE"){
   if(tieDecision||tieBreakerSourceKind||tieBreakerSourceName||tieBreakerOutcome||gmTiebreakerVerified)
     return no("TIEBREAKER_METADATA_WITHOUT_TIE");
   return safe(true,null,{
     helperId:helperId.trim(),actingCharacterId:actingCharacterId.trim(),
     helpingSourceKind:kind,helpingSourceName:name,
     helperAdvancementSource:kind+":"+name,
     advancementPreview:markAllowed?(result==="PASS"?"PASS":"FAIL"):null,
     noMarkReason:markAllowed?null:"SICK_BLOCKS_ADVANCEMENT_LOGGING",
     projectedFateCost:1,projectedFateRefund:0,
     helperDidContributeInitialHelpDie:true,
     sourceFactsDeclaredByGm:true,synergyStillNotCommitted:true
   });
 }
 const choice=String(tieDecision??"").trim().toUpperCase();
 if(!["RETRACT_FATE","FOLLOW_TIEBREAKER"].includes(choice))
   return no("SYNERGY_TIE_DECISION_REQUIRED");
 if(choice==="RETRACT_FATE"){
   if(tieBreakerSourceKind||tieBreakerSourceName||tieBreakerOutcome||gmTiebreakerVerified)
     return no("RETRACT_FATE_CANNOT_MARK_TIEBREAKER");
   return safe(true,null,{
     helperId:helperId.trim(),actingCharacterId:actingCharacterId.trim(),
     helperDidContributeInitialHelpDie:true,
     helperContributesTiebreakerHelpDie:false,
     advancementPreview:null,projectedFateCost:1,projectedFateRefund:1,
     netProjectedFateCost:0,sourceFactsDeclaredByGm:true
   });
 }
 if(gmTiebreakerVerified!==true)return no("GM_TIEBREAKER_SOURCE_REQUIRED");
 const tKind=String(tieBreakerSourceKind??"").trim().toUpperCase();
 const tName=String(tieBreakerSourceName??"").trim();
 const tOutcome=String(tieBreakerOutcome??"").trim().toUpperCase();
 if(!["SKILL","ABILITY"].includes(tKind)||!id(tName))
   return no("INVALID_TIEBREAKER_ADVANCEMENT_SOURCE");
 if(tKind==="SKILL"&&!tb2eSkillInfo(tName).ok)return no("UNKNOWN_TIEBREAKER_SKILL");
 if(tKind==="ABILITY"&&!["WILL","HEALTH","NATURE","RESOURCES","CIRCLES"].includes(tName.toUpperCase()))
   return no("UNKNOWN_TIEBREAKER_ABILITY");
 if(!["PASS","FAIL"].includes(tOutcome))
   return no("TIEBREAKER_OUTCOME_REQUIRED");
 return safe(true,null,{
   helperId:helperId.trim(),actingCharacterId:actingCharacterId.trim(),
   helpingSourceKind:kind,helpingSourceName:name,
   helperAdvancementSource:tKind+":"+tName,
   advancementPreview:markAllowed?tOutcome:null,
   noMarkReason:markAllowed?null:"SICK_BLOCKS_ADVANCEMENT_LOGGING",
   projectedFateCost:1,projectedFateRefund:0,
   helperDidContributeInitialHelpDie:true,
   helperContributesTiebreakerHelpDie:false,
   sourceFactsDeclaredByGm:true,synergyStillNotCommitted:true
 });
}
