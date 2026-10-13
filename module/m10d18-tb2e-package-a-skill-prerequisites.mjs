import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eNumericalFactorEntry} from "./m10d18-tb2e-package-a-factor-values.mjs";
const safe=data=>freezeTb2e({mode:"READ_ONLY_SHADOW",profileId:"torchbearer2e",
 phase:"M10D.18_PACKAGE_A",sourceEvidence:"Dungeoneer's Handbook pp.73-75, 168, 169-170, 171-176",
 liveApplication:false,writesPlanned:0,rollExecuted:false,actorWrite:false,itemWrite:false,
 resourceSpendCommitted:false,...data});
const blocked=(reasonCode,details={})=>safe({ok:false,reasonCode,...details});

/** Targeted source-specific requirements only. Unknown facts must never be
 * silently promoted to affirmative actor entitlement or completed test.
 * GM authorizes and checks all equipment, environment and fiction.
 */
export function tb2eSkillFactorPrerequisitePlan({
 skillName="",tableName="",selections={},
 languageUnderstood=null,hasLoom=null,hasCraftOrCrew=null,
 instructorSkillRating=null,studentSkillRating=null,
 mountAvailable=null,mountTrainingVerified=null
}={}){
 const e=tb2eNumericalFactorEntry({skillName,tableName});
 if(!e.ok)return e;
 const facts=[],fail=(name)=>blocked("SKILL_SOURCE_PRECONDITION_UNCONFIRMED",{required:name,skillName:e.skillName,tableName:e.tableName});
 if(e.skillName==="Scholar"&&e.tableName==="scholarly"&&selections?.read!==undefined){
   if(languageUnderstood!==true)return fail("KNOWN_WRITTEN_LANGUAGE");
   facts.push("KNOWN_WRITTEN_LANGUAGE");
 }
 if(e.skillName==="Weaver"&&e.tableName==="weaving"&&selections?.type==="tapestry"){
   if(hasLoom!==true)return fail("LOOM_REQUIRED");
   facts.push("LOOM_REQUIRED");
 }
 if(e.skillName==="Sailor"&&e.tableName==="sailing"){
   if(hasCraftOrCrew!==true)return fail("CRAFT_OR_CREW_REQUIRED");
   facts.push("CRAFT_OR_CREW_REQUIRED");
 }
 if(e.skillName==="Mentor"&&e.tableName==="teaching"){
   if(!Number.isInteger(instructorSkillRating)||!Number.isInteger(studentSkillRating)||
      instructorSkillRating<1||studentSkillRating<0||instructorSkillRating<=studentSkillRating)
       return fail("MENTOR_SKILL_HIGHER_THAN_STUDENT");
   facts.push("MENTOR_SKILL_HIGHER_THAN_STUDENT");
 }
 if(e.skillName==="Rider"&&e.tableName==="mounted"){
   if(mountAvailable!==true||mountTrainingVerified!==true)return fail("CONTROLLED_TRAINED_MOUNT_REQUIRED");
   facts.push("CONTROLLED_TRAINED_MOUNT_REQUIRED");
 }
 return safe({ok:true,skillName:e.skillName,tableName:e.tableName,
  specialRequirementsChecked:facts,othersRequireGmReview:true,
  gameplayAuthorizationGranted:false,noActorFactsInferred:true});
}
