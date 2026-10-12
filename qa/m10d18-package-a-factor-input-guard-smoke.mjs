import assert from "node:assert/strict";
import {tb2eSourceFactorInputGuard} from "../module/m10d18-tb2e-package-a-factor-guard.mjs";
import {tb2eSourceBoundFactorPlan as plan} from "../module/m10d-tb2e-tests-fullcore-p31-shadow.mjs";
const safe=r=>{assert.equal(r.liveApplication,false);assert.equal(r.writesPlanned,0);assert.equal(r.actorWrite,false);};
const search={skillName:"Scout",tableName:"search",selections:{size:"moderate"},gmAuthorized:true};
const missing=plan(search);safe(missing);assert.equal(missing.reasonCode,"ADDITIVE_FACTOR_CONFIRMATION_REQUIRED");
assert.deepEqual(missing.missingCategories,["location"]);
const approved=plan({...search,selections:{size:"moderate",location:"known"}});
safe(approved);assert.equal(approved.ok,true);assert.equal(approved.obstacle,3);
assert.equal(approved.additiveFactorReview,"COMPLETE_OR_GM_EXPLICITLY_EXCLUDED");
const declined=plan({...search,gmExcludedAdditives:["location"],gmExclusionReason:"Exceptional location-independent GM ruling"});
safe(declined);assert.equal(declined.ok,true);assert.equal(declined.obstacle,2);
assert.deepEqual(declined.gmExcludedAdditives,["location"]);
for(const [opts,reason] of [
 [{...search,gmExcludedAdditives:["location"]},"GM_ADDITIVE_EXCLUSION_REASON_REQUIRED"],
 [{...search,gmExcludedAdditives:["size"],gmExclusionReason:"wrong"},"INVALID_ADDITIVE_EXCLUSION"],
 [{...search,gmExcludedAdditives:["location","location"],gmExclusionReason:"duplicate"},"INVALID_ADDITIVE_EXCLUSION_LIST"],
 [{...search,preconditionFacts:{skillName:"Cook"}},"INVALID_PRECONDITION_FACT_FIELDS"],
 [{...search,preconditionFacts:{tableName:"stalking"}},"INVALID_PRECONDITION_FACT_FIELDS"],
 [{...search,preconditionFacts:{gmAuthorized:true}},"INVALID_PRECONDITION_FACT_FIELDS"],
 [{...search,preconditionFacts:[]},"INVALID_PRECONDITION_FACT_FIELDS"],
 [{...search,preconditionFacts:{hasLoom:"yes"}},"INVALID_PRECONDITION_FACT_VALUE"],
 [{...search,preconditionFacts:{studentSkillRating:2.5}},"INVALID_PRECONDITION_FACT_VALUE"]
]){
 const r=plan(opts);safe(r);assert.equal(r.reasonCode,reason,JSON.stringify(r));
}
const camp=plan({skillName:"Survivalist",tableName:"camp",selections:{terrain:"near_town",group:"small"},gmAuthorized:true});
safe(camp);assert.equal(camp.ok,true);assert.equal(camp.obstacle,0);
const noCampGroup=plan({skillName:"Survivalist",tableName:"camp",selections:{terrain:"near_town"},gmAuthorized:true});
safe(noCampGroup);assert.equal(noCampGroup.reasonCode,"ADDITIVE_FACTOR_CONFIRMATION_REQUIRED");
const authorized=plan({skillName:"Sailor",tableName:"sailing",gmAuthorized:true,
 selections:{craft:"raft_skiff",waters:"known",season:"summer",weather:"calm"},
 preconditionFacts:{hasCraftOrCrew:true}});
safe(authorized);assert.equal(authorized.ok,true);assert.equal(authorized.obstacle,3);
assert.deepEqual(authorized.sourcePreconditionsValidated,["CRAFT_OR_CREW_REQUIRED"]);
const custom=tb2eSourceFactorInputGuard({...search,gmExcludedAdditives:["location"],gmExclusionReason:"GM confirmed irrelevant"});
safe(custom);assert.equal(custom.factorCompletenessChecked,true);
console.log("PASS Package A: explicit additive factor review, special optional amenities and nested GM facts cannot change source identity; read-only");
