import { tb2eConflictCount as count,tb2eConflictResult as result,
 tb2eConflictBlocked as blocked,tb2eConflictKey as key,
 TB2E_MANEUVER_COSTS as COSTS } from "./m10d-tb2e-conflict-contract.mjs";

export function tb2eConflictHitPlan({marginOfSuccess=0,absorbed=0,currentHp=0}={}){
 if(!count(marginOfSuccess)||!count(absorbed)||!count(currentHp))return blocked("INVALID_HIT_VALUES");
 if(absorbed>marginOfSuccess)return blocked("ABSORPTION_EXCEEDS_HIT");
 const damage=marginOfSuccess-absorbed,hpLost=Math.min(damage,currentHp);
 return result({ok:true,marginOfSuccess,absorbed,currentHp,damage,hpLost,
  hpAfter:currentHp-hpLost,overflowDamage:damage-hpLost,
  knockedOut:currentHp>0&&currentHp-hpLost===0,
  overflowProtectionAllowed:false,overflowDistribution:"CAPTAIN_MANUAL",hpCommitted:false});
}
export function tb2eConflictRegroupPlan({interaction="VERSUS",marginOfSuccess=0,
 passed=true,actingCurrentHp=0,actingStartingHp=0}={}){
 const mode=key(interaction);
 if(!["VERSUS","INDEPENDENT"].includes(mode))return blocked("INVALID_REGROUP_INTERACTION");
 if(!count(marginOfSuccess)||!count(actingCurrentHp)||!count(actingStartingHp)||
  actingCurrentHp>actingStartingHp)return blocked("INVALID_REGROUP_VALUES");
 const pool=!passed?0:mode==="INDEPENDENT"?1+marginOfSuccess:marginOfSuccess;
 const selfHeal=Math.min(pool,actingStartingHp-actingCurrentHp);
 return result({ok:true,interaction:mode,passed:Boolean(passed),
  independentObstacle:mode==="INDEPENDENT"?3:null,restorePool:pool,
  restoredToActor:selfHeal,actingHpAfter:actingCurrentHp+selfHeal,
  availableToTeammates:pool-selfHeal,
  teammateRestorationOrder:"RESTORE_ONE_TEAMMATE_TO_STARTING_HP_BEFORE_NEXT",
  knockedOutReturnsAtOneHp:true,hpCommitted:false});
}
export function tb2eConflictManeuverPlan({marginOfSuccess=0,effects=[]}={}){
 if(!count(marginOfSuccess)||!Array.isArray(effects))return blocked("INVALID_MANEUVER_INPUT");
 const selected=effects.map(key);
 if(selected.some(id=>!(id in COSTS)))return blocked("UNKNOWN_MANEUVER_EFFECT");
 if(new Set(selected).size!==selected.length)return blocked("DUPLICATE_MANEUVER_EFFECT");
 const cost=selected.reduce((sum,id)=>sum+COSTS[id],0);
 if(cost>marginOfSuccess)return blocked("INSUFFICIENT_MANEUVER_MARGIN",{cost,marginOfSuccess});
 return result({ok:true,marginOfSuccess,effects:selected.map(id=>({id,cost:COSTS[id]})),
  totalCost:cost,unusedMargin:marginOfSuccess-cost,effectsApplied:false,nextActionOnly:true});
}
