import assert from "node:assert/strict";
import {tb2eWiseDeeperDiePlan as plan} from "../module/m10d-tb2e-wise-shadow.mjs";
import {tb2eFoundationStatus,installM10DFoundation} from "../module/m10d-tb2e-foundation.mjs";
const dice=[
 {dieId:"old",face:2,alreadyRerolled:true},
 {dieId:"fresh",face:3,alreadyRerolled:false},
 {dieId:"passed",face:6,alreadyRerolled:false}
];
const params={dice,chosenDieId:"fresh",fateAvailable:1};
const p=plan(params);
assert.equal(p.ok,true);assert.deepEqual(p.eligibleFailedDieIds,["fresh"]);
assert.equal(p.selectedDieId,"fresh");assert.equal(p.diceToReroll,1);
assert.equal(p.resourceAmount,1);assert.equal(p.resourceSpendCommitted,false);
assert.equal(p.rollExecuted,false);
const afterLuck=plan({...params,fateLuckAlreadyUsed:true});
assert.equal(afterLuck.ok,true);
assert.deepEqual(afterLuck.eligibleFailedDieIds,["fresh"]);
assert.equal(afterLuck.fateLuckAlreadyUsed,true);assert.equal(p.actorWrite,false);
assert.equal(p.writesPlanned,0);assert.equal(p.liveApplication,false);
for(const [opts,reason] of [
 [{...params,chosenDieId:"old"},"SELECTED_DIE_NOT_ELIGIBLE"],
 [{...params,chosenDieId:"passed"},"SELECTED_DIE_NOT_ELIGIBLE"],
 [{...params,chosenDieId:""},"DIE_SELECTION_REQUIRED"],
 [{...params,fateAvailable:0},"INSUFFICIENT_FATE"],
 [{...params,hasWise:false},"RELEVANT_WISE_REQUIRED"],
 [{...params,related:false},"RELEVANT_WISE_REQUIRED"],
 [{...params,successThreshold:3},"NO_ELIGIBLE_FAILED_DIE"],
 [{...params,dice:[...dice,{dieId:"fresh",face:2,alreadyRerolled:false}]},"DUPLICATE_DIE_ID"],
 [{...params,dice:[{dieId:"a",face:0,alreadyRerolled:false}]},"INVALID_DIE_HISTORY"]
]){
 const x=plan(opts);assert.equal(x.reasonCode,reason);assert.equal(x.liveApplication,false);assert.equal(x.writesPlanned,0);
}
const s=tb2eFoundationStatus();assert.equal(s.liveIntegrationPaused,true);
assert.equal(s.activationAllowed,false);
let writes=0;const reject=()=>{writes++;throw Error("unexpected write");};
globalThis.game={realmGuard:{core:{}},settings:{set:reject}};
globalThis.Hooks={once:(_,fn)=>fn()};
globalThis.Actor={create:reject};globalThis.Item={create:reject};
installM10DFoundation();
const api=game.realmGuard.core.m10d.wises.deeperDiePlan(params);
assert.equal(api.ok,true);assert.equal(api.selectedDieId,"fresh");
assert.equal(writes,0);
console.log("PASS Package A DH77 Wise per-die reroll history: never reroll a rerolled die, zero live writes");
