import assert from "node:assert/strict";
import {tb2eMagicInvocationPlan as invoke,tb2eMagicPurificationPlan as purify,
 tb2eMagicStigmataPlan as stigma} from "../module/m10d-tb2e-magic-ritual-shadow.mjs";
const safe=p=>{assert.equal(p.mode,"READ_ONLY_SHADOW");assert.equal(p.liveApplication,false);
 assert.equal(p.writesPlanned,0);assert.equal(p.rollExecuted,false);
 assert.equal(p.actorWrite,false);assert.equal(p.itemWrite,false);
 assert.equal(p.resourceWrite,false);assert.equal(p.conditionWrite,false);
 assert.equal(p.commitAllowed,false);};
const withRelic=invoke({baseTimeWithRelic:1,baseBurdenWithRelic:1,
 currentBurden:0,urdr:2,withRelic:true,sacramental:true});
safe(withRelic);assert.equal(withRelic.ok,true);
assert.equal(withRelic.invocationTurns,1);assert.equal(withRelic.burdenIncrease,1);
assert.equal(withRelic.relicAbsenceObstacleIncrease,0);
assert.equal(withRelic.sacramentalBonusDice,1);
assert.equal(withRelic.burdenCommitted,false);
const without=invoke({baseTimeWithRelic:1,baseBurdenWithRelic:1,
 currentBurden:1,urdr:2,withRelic:false});
safe(without);assert.equal(without.invocationTurns,2);
assert.equal(without.relicAbsenceObstacleIncrease,1);
assert.equal(without.burdenIncrease,2);assert.equal(without.totalBurdenAfter,3);
assert.equal(without.urdrExceeded,true);assert.equal(without.healthObstacle,3);
assert.equal(invoke({castingMode:"VERSUS",baseBurdenWithRelic:1,urdr:3}).relicAbsenceVersusSuccessPenalty,-1);
assert.equal(invoke({baseBurdenWithRelic:1,urdr:3,againstCreed:true}).burdenIncrease,3);
assert.equal(invoke({baseTimeWithRelic:1,baseBurdenWithRelic:1,
 withRelic:true,ritualistHelpers:1}).invocationTurns,2);
assert.equal(invoke({canSpeak:false}).ok,false);
assert.equal(invoke({inConflict:true,conflictTiming:"ACTION"}).ok,false);
assert.equal(invoke({castingMode:"SKILL_SWAP",inConflict:true,
 conflictTiming:"ACTION",equippedThisRound:true}).ok,true);
assert.equal(invoke({castingMode:"SKILL_SWAP",inConflict:true,
 conflictTiming:"ACTION"}).ok,false);
const camp=purify({phase:"CAMP",currentBurden:5,atUncorruptedShrine:true,
 outcome:"PASS",margin:2});safe(camp);
assert.equal(camp.obstacle,5);assert.equal(camp.shrineBonusDice,1);
assert.equal(camp.burdenReduction,3);assert.equal(camp.burdenAfter,2);
assert.equal(camp.checksRequired,1);assert.equal(camp.burdenCommitted,false);
assert.equal(purify({phase:"TOWN",currentBurden:2,
 outcome:"FAIL_CONDITION"}).burdenAfter,1);
assert.equal(purify({phase:"TOWN",currentBurden:2,
 outcome:"FAIL_TWIST"}).burdenAfter,2);
assert.equal(purify({phase:"TOWN",currentBurden:2,
 outcome:"PASS"}).lifestyleCostDelta,1);
assert.equal(purify({phase:"ADVENTURE"}).ok,false);
assert.equal(purify({helping:true}).ok,false);
assert.equal(purify({atUncorruptedPlace:false}).ok,false);
assert.equal(stigma({currentBurden:2,urdr:2}).active,false);
assert.equal(stigma({currentBurden:3,urdr:2}).scale,"3_4");
assert.equal(stigma({currentBurden:3,urdr:2}).precedencePenalty,-1);
const eleven=stigma({currentBurden:11,urdr:3});safe(eleven);
assert.equal(eleven.sourceDescribesDeathAt11Plus,true);
assert.equal(eleven.deathApplied,false);
console.log("PASS M10D.18 P2.4 Ritual: relics, burden, Urdr, purification, stigmata; no death/condition writes");
