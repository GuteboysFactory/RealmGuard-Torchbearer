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
