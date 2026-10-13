import assert from "node:assert/strict";
import {tb2eAdvancementThresholdPlan as threshold,tb2eAdvancementMarkPlan as mark,
 tb2eNatureAdvancementShadowPlan as nature,tb2eGroupAdvancementChoicePlan as group,
 tb2eNewSkillLearningAdvancementPlan as learn,tb2eLevelProgressionBoundaryPlan as level,
 tb2eResourcesCirclesZeroToOnePlan as zero} from "../module/m10d-tb2e-advancement-shadow.mjs";
// DH 108-110: separate numeric P/F evidence, no conversion, maximum Nature.
const invalid=[null,true,false,"4","",NaN,Infinity,-1,1.5,Number.MAX_SAFE_INTEGER+1];
for(const value of invalid){
 for(const field of ["passed","failed","rating"]){
  const p=threshold({kind:"SKILL",rating:4,passed:4,failed:3,[field]:value});
  assert.equal(p.ok,false,`${field}: ${String(value)}`);assert.equal(p.writesPlanned,0);
 }
 assert.equal(mark({obstacle:value}).ok,false);
 assert.equal(nature({currentNature:3,maximumNature:4,passed:value,failed:3}).ok,false);
 assert.equal(group({passedAgainst:value,failedAgainst:1}).ok,false);
 assert.equal(learn({attempts:value,maximumNature:4}).ok,false);
 assert.equal(zero({passedTests:value,diceSources:["CASH"]}).ok,false);
 assert.equal(level({spentFate:value}).ok,false);
}
for(const field of ["versusCombat","alreadyCountedInContext","tieBroken"])
 assert.equal(mark({obstacle:1,[field]:"false"}).reasonCode,"INVALID_ADVANCEMENT_REVIEW_FLAGS");
assert.equal(threshold({rating:4,passed:100,failed:2}).ready,false,"Excess PASS cannot replace FAIL");
assert.equal(threshold({rating:4,passed:3,failed:100}).ready,false,"Excess FAIL cannot replace PASS");
assert.equal(threshold({rating:1,passed:1,failed:0}).advanceTo,2);
assert.equal(threshold({rating:6,passed:100,failed:100}).ready,false);
assert.equal(nature({currentNature:0,maximumNature:4,passed:4,failed:3}).reasonCode,
 "NATURE_ZERO_TAX_LOSS_MUST_RESOLVE_FIRST");
const advanced=nature({currentNature:2,maximumNature:4,passed:4,failed:3});
assert.equal(advanced.ready,true);assert.equal(advanced.currentAfter,3);assert.equal(advanced.maximumAfter,5);
assert.equal(advanced.taxAfter,advanced.taxBefore);assert.equal(advanced.natureMutationCommitted,false);
assert.equal(Object.isFrozen(advanced),true);
console.log("PASS DH108-110 strict advancement evidence, separate P/F thresholds and DH68 zero-tax precedence; no writes");
