import assert from "node:assert/strict";
import {tb2ePackageAEvidenceBaselinePlan as plan} from "../module/m10d18-tb2e-package-a-prospective-trace.mjs";
// The contract must not touch Foundry, storage or RNG even for known baselines.
Object.defineProperty(globalThis,"game",{get(){throw Error("UNEXPECTED_GAME_READ");}});
globalThis.Roll=class {constructor(){throw Error("UNEXPECTED_RNG");}};
const unknown=()=>({state:"UNKNOWN",value:null,reviewId:null,reviewerId:null});
const reviewed=value=>({state:"GM_REVIEWED",value,reviewId:"review1",reviewerId:"gm"});
const subject=(kind,rating,itemId=null,skillName=null)=>({subjectId:`actor:${kind}${itemId?":"+itemId:""}`,
 epochId:"epoch1",kind,itemId,skillName,rating,currentNature:kind==="NATURE"?rating:null,counters:unknown()});
const supply=()=>({itemId:"ink",unitId:"inkIncrement1",skillName:"Scholar",incrementDefinition:"GM-reviewed ink allocation for one applicable test",
 unitReviewId:"unitReview",unitReviewerId:"gm",quantityMapping:"NO_AUTOMATIC_CONVERSION",stock:unknown()});
const baseline=()=>({schemaVersion:1,worldId:"world",actorId:"actor",gmId:"gm",
 subjects:[subject("WILL",4),subject("HEALTH",3),subject("NATURE",5),subject("LEARNING",0,"cook","Cook")],supplies:[supply()]});
const initial=baseline(),before=JSON.stringify(initial),u=plan(initial);
assert.equal(u.ok,true,JSON.stringify(u));assert.equal(JSON.stringify(initial),before);
assert.equal(u.subjects[0].counters,null);assert.equal(u.supplies[0].stock,null);assert.equal(u.supplies[0].incrementAvailable,null);
assert.equal(u.eventApplicationImplemented,false);assert.equal(u.baselineStored,false);assert.equal(u.quantityConversionApplied,false);
for(const k of ["actorWrite","itemWrite","settingsWrite","rollExecuted","resourceSpendCommitted","rollSourceAuthenticated",
 "actorSourceAuthenticated","gmPermissionAuthenticated","historicalRewardBalanceVerified","completeTestHistoryVerified"])
 assert.equal(u[k],false,k);
assert.equal(u.writesPlanned,0);assert.equal(Object.isFrozen(u.subjects),true);
const known=baseline();known.subjects[0].counters=reviewed({passed:0,failed:0});
known.subjects[3].counters=reviewed({attempts:4});known.supplies[0].stock=reviewed({increments:2});
const k=plan(known);assert.equal(k.ok,true);assert.deepEqual(k.subjects[0].counters,{passed:0,failed:0});
assert.equal(k.subjects[3].counters.attempts,4);assert.equal(k.supplies[0].incrementAvailable,true);
known.subjects[0].counters.value.passed=9;assert.equal(k.subjects[0].counters.passed,0);
const zero=baseline();zero.supplies[0].stock=reviewed({increments:0});assert.equal(plan(zero).supplies[0].incrementAvailable,false);
const loss=baseline();loss.subjects[2].currentNature=0;
assert.equal(plan(loss).subjects[2].natureZeroLossResolutionRequired,true);
loss.subjects[2].rating=0;assert.equal(plan(loss).subjects[2].natureRetiredState,true);
const reject=(change,reason)=>{const b=baseline();change(b);assert.equal(plan(b).reasonCode,reason);};
reject(b=>b.subjects[0].counters.value={passed:0,failed:0},"UNKNOWN_EVIDENCE_MUST_REMAIN_NULL");
reject(b=>delete b.subjects[0].counters.value,"EXPLICIT_EVIDENCE_STATE_REQUIRED");
reject(b=>b.subjects[0].counters={state:"CAPTURED",value:{passed:0,failed:0},reviewId:"r",reviewerId:"gm"},"DECLARED_GM_REVIEW_REQUIRED");
reject(b=>b.subjects[0].counters=reviewed({passed:0}),"STRICT_BASELINE_COUNTS_REQUIRED");
for(const v of [null,true,"0",-1,1.5,Number.MAX_SAFE_INTEGER,Infinity]){
 reject(b=>b.subjects[0].counters=reviewed({passed:v,failed:0}),"STRICT_BASELINE_COUNTS_REQUIRED");
 reject(b=>b.supplies[0].stock=reviewed({increments:v}),"STRICT_BASELINE_COUNTS_REQUIRED");
}
reject(b=>{b.subjects[0].counters=reviewed({passed:1,failed:0});b.subjects[0].counters.reviewerId="other";},"DECLARED_GM_REVIEW_REQUIRED");
reject(b=>b.subjects.push(structuredClone(b.subjects[0])),"BASELINE_SUBJECT_ID_MISMATCH_OR_DUPLICATE");
reject(b=>b.subjects[0].subjectId="other:WILL","BASELINE_SUBJECT_ID_MISMATCH_OR_DUPLICATE");
reject(b=>b.subjects[0].epochId=null,"BASELINE_SUBJECT_KIND_REQUIRED");
reject(b=>b.subjects[0].rating=7,"BASELINE_RATING_SCOPE_REQUIRED");
reject(b=>{b.subjects[2].rating=0;b.subjects[2].currentNature=0;b.subjects[2].counters=reviewed({passed:1,failed:0});},"RETIRED_NATURE_COUNTERS_MUST_BE_ZERO_OR_UNKNOWN");
reject(b=>b.subjects[2].currentNature=6,"BASELINE_NATURE_STATE_REQUIRED");
reject(b=>b.subjects[3].skillName="Not a sourced Skill","BASELINE_SOURCED_SKILL_REQUIRED");
reject(b=>b.subjects.push(subject("SKILL",2,"secondCook","Cook")),"BASELINE_SKILL_SUBJECT_AMBIGUOUS");
reject(b=>b.subjects[3].counters=reviewed({passed:1,failed:1}),"STRICT_BASELINE_COUNTS_REQUIRED");
reject(b=>b.supplies[0].quantityMapping="ONE_ITEM_ONE_USE","QUANTITY_IS_NOT_SUPPLY_INCREMENTS");
reject(b=>b.supplies[0].quantity=99,"SUPPLY_UNIT_FIELDS_REQUIRED");
reject(b=>b.supplies[0].unitReviewerId="other","EXPLICIT_SUPPLY_UNIT_REVIEW_REQUIRED");
reject(b=>b.supplies.push(structuredClone(b.supplies[0])),"SUPPLY_UNIT_ID_AMBIGUOUS");
reject(b=>b.subjects=Array(65).fill(b.subjects[0]),"BASELINE_COLLECTION_LIMIT");
reject(b=>b.supplies=Array(129).fill(b.supplies[0]),"BASELINE_COLLECTION_LIMIT");
assert.equal(plan().ok,false);assert.equal(plan(JSON.parse(JSON.stringify(initial))).ok,true);
console.log("PASS A05/A06 explicit baseline contract: unknown versus reviewed zero, strict counters/epochs/learning/Nature states, reviewed supply units without quantity conversion, frozen zero-write/RNG declarations only");
