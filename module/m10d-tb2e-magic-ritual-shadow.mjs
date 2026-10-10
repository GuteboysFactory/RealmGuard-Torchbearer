import { TB2E_MAGIC_CAST_MODES as MODES,
 tb2eMagicKey as key,tb2eMagicCount as count,
 tb2eMagicPositive as positive,tb2eMagicResult as result,
 tb2eMagicBlocked as blocked } from "./m10d-tb2e-magic-contract.mjs";

export function tb2eMagicInvocationPlan({castingMode="FIXED",
 withRelic=false,baseTimeWithRelic=0,baseBurdenWithRelic=0,
 currentBurden=0,urdr=1,againstCreed=false,
 sacramental=false,ritualistHelpers=0,wiseHelpers=0,
 canSpeak=true,inConflict=false,conflictTiming="NONE",
 equippedThisRound=false}={}){
 const mode=key(castingMode),timing=key(conflictTiming);
 if(!MODES.includes(mode))return blocked("INVALID_INVOCATION_MODE");
 if(![baseTimeWithRelic,baseBurdenWithRelic,currentBurden,urdr,ritualistHelpers,wiseHelpers].every(count))
  return blocked("INVALID_INVOCATION_INPUT");
 if(!canSpeak)return blocked("INVOCATION_REQUIRES_SPEECH");
 const relicAdjustment=withRelic?0:1;
 const time=baseTimeWithRelic+relicAdjustment+(ritualistHelpers>0&&mode!=="SKILL_SWAP"?1:0);
 const increasedBurden=baseBurdenWithRelic+relicAdjustment+Number(againstCreed);
 const afterBurden=currentBurden+increasedBurden;
 if(inConflict){
  if(mode==="SKILL_SWAP"){
   if(!equippedThisRound||!["ACTION","BETWEEN_ROUNDS","BEFORE_DISPOSITION"].includes(timing))
    return blocked("INVOCATION_SKILL_SWAP_MUST_BE_EQUIPPED");
  }else if(timing!=="BEFORE_DISPOSITION")
   return blocked("INVOCATION_SPECIFIC_CONFLICT_TIMING_REQUIRED");
 }
 return result({ok:true,operation:"PERFORM_INVOCATION",testSkill:"Ritualist",
  castingMode:mode,withRelic,requiresRelic:false,usesSacramental:Boolean(sacramental),
  sacramentalBonusDice:sacramental?1:0,sacramentalConsumedPlanned:Boolean(sacramental),
  baseTimeWithRelic,invocationTurns:time,grindTurns:time,
  relicAbsenceObstacleIncrease:mode==="VERSUS"?0:relicAdjustment,
  relicAbsenceVersusSuccessPenalty:mode==="VERSUS"?-relicAdjustment:0,
  burdenIncrease:increasedBurden,currentBurden,totalBurdenAfter:afterBurden,
  urdr,urdrExceeded:afterBurden>urdr,needsHealthTest:afterBurden>urdr,
  healthObstacle:afterBurden>urdr?afterBurden:null,
  healthTestTiming:"AFTER_INVOCATION_BEFORE_TIME_GRIND",
  onFailedHealth:"GM_ASSIGNS_CONDITIONS_IN_ORDER_BY_MARGIN",
  stigmataRequired:afterBurden>urdr,
  permanentEffectsCommitted:false,burdenCommitted:false});
}

export function tb2eMagicPurificationPlan({phase="CAMP",currentBurden=0,
 atUncorruptedPlace=true,atUncorruptedShrine=false,helping=false,
 outcome="PENDING",margin=0}={}){
 const where=key(phase),rolled=key(outcome);
 if(!["CAMP","TOWN"].includes(where))return blocked("PURIFICATION_NOT_DURING_ADVENTURE");
 if(!count(currentBurden)||!count(margin))return blocked("INVALID_BURDEN_OR_MARGIN");
 if(!atUncorruptedPlace)return blocked("PURIFICATION_REQUIRES_UNCORRUPTED_PLACE");
 if(helping)return blocked("PURIFICATION_CANNOT_BE_HELPED");
 if(!["PENDING","PASS","FAIL_CONDITION","FAIL_TWIST"].includes(rolled))
  return blocked("INVALID_PURIFICATION_OUTCOME");
 const reduced=rolled==="PASS"?1+margin:rolled==="FAIL_CONDITION"?1:0;
 const after=rolled==="PENDING"?null:Math.max(0,currentBurden-reduced);
 return result({ok:true,operation:"PURIFY",phase:where,testSkill:"Theologian",
  obstacle:currentBurden,shrineBonusDice:atUncorruptedShrine?1:0,
  checksRequired:where==="CAMP"?1:0,lifestyleCostDelta:where==="TOWN"?1:0,
  outcome:rolled,margin,burdenReduction:rolled==="PENDING"?null:Math.min(currentBurden,reduced),
  burdenAfter:after,burdenCommitted:false,conditionCommitted:false,
  twistOrConditionDecidedByGM:rolled.startsWith("FAIL")});
}

export function tb2eMagicStigmataPlan({currentBurden=0,urdr=1}={}){
 if(!count(currentBurden)||!count(urdr))return blocked("INVALID_BURDEN_OR_URDR");
 const exceeded=currentBurden>urdr;
 let scale="NONE";
 if(exceeded){
  scale=currentBurden<=2?"1_2":currentBurden<=4?"3_4":
   currentBurden<=6?"5_6":currentBurden<=8?"7_8":
   currentBurden<=10?"9_10":"11_PLUS";
 }
 return result({ok:true,operation:"STIGMATA",currentBurden,urdr,
  active:exceeded,scale,precedencePenalty:exceeded?-1:0,
  stigmaEffect:"GM_CHOOSES_FROM_BURDEN_SCALE",
  sourceDescribesDeathAt11Plus:scale==="11_PLUS",
  deathApplied:false,stigmaCommitted:false});
}
