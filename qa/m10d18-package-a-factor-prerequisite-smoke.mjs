import assert from "node:assert/strict";
import {tb2eSkillFactorPrerequisitePlan as pre} from "../module/m10d18-tb2e-package-a-skill-prerequisites.mjs";
import {tb2eSourceBoundFactorPlan as resolved} from "../module/m10d-tb2e-tests-fullcore-p31-shadow.mjs";
const no=(x,reason)=>{assert.equal(x.ok,false,JSON.stringify(x));assert.equal(x.reasonCode,reason);assert.equal(x.writesPlanned,0);};
const yes=x=>{assert.equal(x.ok,true,JSON.stringify(x));assert.equal(x.writesPlanned,0);assert.equal(x.liveApplication,false);};
const scenarios=[
 ["Scholar","scholarly",{read:"journals_letters"},{languageUnderstood:true},"KNOWN_WRITTEN_LANGUAGE"],
 ["Weaver","weaving",{type:"tapestry",style:"plain"},{hasLoom:true},"LOOM_REQUIRED"],
 ["Sailor","sailing",{craft:"raft_skiff",waters:"known",season:"summer",weather:"calm"},{hasCraftOrCrew:true},"CRAFT_OR_CREW_REQUIRED"],
 ["Mentor","teaching",{}, {instructorSkillRating:4,studentSkillRating:3},"MENTOR_SKILL_HIGHER_THAN_STUDENT"],
 ["Rider","mounted",{training:"war",conflict:"capture"},{mountAvailable:true,mountTrainingVerified:true},"CONTROLLED_TRAINED_MOUNT_REQUIRED"]
];
for(const [skillName,tableName,selections,facts,required] of scenarios){
 no(pre({skillName,tableName,selections}),"SKILL_SOURCE_PRECONDITION_UNCONFIRMED");
 const p=pre({skillName,tableName,selections,...facts});yes(p);
 assert.deepEqual(p.specialRequirementsChecked,[required]);
 const good=resolved({skillName,tableName,selections,gmAuthorized:true,
   factorMode:tableName==="teaching"?"FORMULA":"TABLE",studentNature:3,preconditionFacts:facts});
 yes(good);assert.deepEqual(good.sourcePreconditionsValidated,[required]);
}
no(resolved({skillName:"Scholar",tableName:"scholarly",selections:{read:"journals_letters"},gmAuthorized:true}),"SKILL_SOURCE_PRECONDITION_UNCONFIRMED");
no(resolved({skillName:"Rider",tableName:"mounted",selections:{training:"war",conflict:"capture"},gmAuthorized:true,preconditionFacts:{mountAvailable:true}}),"SKILL_SOURCE_PRECONDITION_UNCONFIRMED");
no(resolved({skillName:"Cook",tableName:"meals",selections:{ingredients:"fresh",amount:"one"},gmAuthorized:false}),"GM_SOURCE_SELECTION_REQUIRED");
yes(resolved({skillName:"Cook",tableName:"meals",selections:{ingredients:"fresh",amount:"one"},gmAuthorized:true}));
no(resolved({skillName:"Mentor",tableName:"teaching",factorMode:"FORMULA",studentNature:2,gmAuthorized:true,preconditionFacts:{instructorSkillRating:2,studentSkillRating:2}}),"SKILL_SOURCE_PRECONDITION_UNCONFIRMED");
console.log("PASS Package A: source-bound factors require GM-verified language, loom, vessel, Mentor rating, trained mount; no writes");
