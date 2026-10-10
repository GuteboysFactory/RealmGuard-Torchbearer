import assert from "node:assert/strict";
import fs from "node:fs";
import {tb2eConflictShadowStatus,tb2eConflictModel,tb2eConflictDispositionPlan,
 tb2eConflictActionPlan,tb2eConflictHpAllocationPlan} from "../module/m10d-tb2e-conflict-shadow.mjs";
import {tb2eConflictHitPlan,tb2eConflictRegroupPlan,tb2eConflictManeuverPlan} from "../module/m10d-tb2e-conflict-resolution-shadow.mjs";
import {tb2eConflictOutcomePlan} from "../module/m10d-tb2e-conflict-outcome-shadow.mjs";
import {tb2eFoundationStatus,tb2eReadinessAudit,installM10DFoundation} from "../module/m10d-tb2e-foundation.mjs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {profileActivationAvailable} from "../module/m10-profile-activation.mjs";
const safe=p=>{assert.equal(p.mode,"READ_ONLY_SHADOW");assert.equal(p.liveApplication,false);
 assert.equal(p.writesPlanned,0);assert.equal(p.actorWrite,false);assert.equal(p.hpWrite,false);
 assert.equal(p.rollExecuted,false);assert.equal(p.commitAllowed,false);};
const status=tb2eConflictShadowStatus();
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);
assert.equal(status.activationAllowed,false);
assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});
const model=tb2eConflictModel();safe(model);
assert.equal(model.types.length,7);assert.equal(model.actionsPerRound,3);
assert.equal(model.independentObstacles.DEFEND,3);
const t=(a,b)=>tb2eConflictActionPlan({conflictType:"KILL",action:a,opponentAction:b});
for(const a of model.actions)for(const b of model.actions){
 const p=t(a,b);safe(p);assert.equal(p.interaction,model.actionInteractionMatrix[a][b]);}
assert.equal(t("DEFEND","FEINT").rollAllowed,false);
assert.equal(t("FEINT","ATTACK").rollAllowed,false);
assert.equal(t("DEFEND","DEFEND").independentObstacle,3);
assert.equal(t("FEINT","MANEUVER").interaction,"INDEPENDENT");
assert.equal(tb2eConflictActionPlan({conflictType:"ARGUMENT",action:"ATTACK",opponentAction:"DEFEND"}).ok,false);
assert.equal(tb2eConflictActionPlan({conflictType:"CAPTURE",action:"DEFEND",opponentAction:"ATTACK"}).actionSkillOrAbility,"Hunter");
assert.equal(tb2eConflictActionPlan({conflictType:"KILL",action:"DEFEND",opponentAction:"ATTACK"}).actionSkillOrAbility,"Health");

const dis=tb2eConflictDispositionPlan({conflictType:"KILL",baseRating:5,rolledSuccesses:4,
 teamConditions:["Hungry and Thirsty","Exhausted","Hungry and Thirsty"],
 captainConditions:["Injured","Sick"],captainHasBackpack:true,
 captainInDimOrDarkness:true,rollIncludesDicePenalty:true});
safe(dis);assert.equal(dis.ok,true);assert.equal(dis.successPenalty,-4);
assert.equal(dis.dicePenalty,-2);assert.equal(dis.startingDisposition,5);
assert.equal(tb2eConflictDispositionPlan({baseRating:1,rolledSuccesses:0,teamConditions:["Exhausted"]}).startingDisposition,1);
const waiting=tb2eConflictDispositionPlan({baseRating:5,rolledSuccesses:4,captainConditions:["Injured"]});
assert.equal(waiting.calculationPending,true);assert.equal(waiting.startingDisposition,null);
assert.equal(tb2eConflictDispositionPlan({conflictType:"TRICK_OR_RIDDLE",baseRating:3,rolledSuccesses:1,captainInDimOrDarkness:true}).successPenalty,0);
assert.equal(tb2eConflictDispositionPlan({conflictType:"CONVINCE",baseRating:3,rolledSuccesses:1,captainHasBackpack:true}).successPenalty,0);
assert.equal(tb2eConflictDispositionPlan({conflictType:"UNKNOWN"}).ok,false);
const hp=tb2eConflictHpAllocationPlan({startingDisposition:9,participantIds:["a","b"],oddPointRecipients:["b"]});
safe(hp);assert.deepEqual(hp.participants,[{id:"a",startingHp:4},{id:"b",startingHp:5}]);
assert.equal(tb2eConflictHpAllocationPlan({startingDisposition:9,participantIds:["a","b"]}).reasonCode,"CAPTAIN_MUST_ASSIGN_ODD_HP");
assert.equal(tb2eConflictHpAllocationPlan({startingDisposition:2,participantIds:["a","b","c"]}).reasonCode,"CAPTAIN_MUST_SELECT_ACTIVE_PARTICIPANTS");
assert.equal(tb2eConflictHpAllocationPlan({startingDisposition:4,participantIds:["a","b"],oddPointRecipients:[]}).allocatedTotal,4);
