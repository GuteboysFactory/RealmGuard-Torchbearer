import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
const EFFECTS=new Set(["I_AM_WISE","DEEPER_UNDERSTANDING","OF_COURSE"]);
function result(data){return freezeTb2e({
 phase:"M10D.18_P3.2",profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
 sourceEvidence:"Dungeoneer's Handbook pp.76-78; Scholar's Guide pp.87-88",
 liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
 rollExecuted:false,resourceSpendCommitted:false,advancementWrite:false,...data
});}
function blocked(reasonCode){return result({ok:false,reasonCode});}
/**
 * Check use of multiple Wises during one test. Caller/GM supplies the
 * known/fictionally relevant Wise identities; no untrusted Actor inspection.
 */
export function tb2eWiseCombinationPlan({
 uses=[],knownWises=0,ordinaryHelpProvided=false
}={}){
 if(!Number.isInteger(knownWises)||knownWises<0||knownWises>4)return blocked("INVALID_WISE_COUNT");
 if(!Array.isArray(uses)||uses.length>4)return blocked("INVALID_WISE_USE_LIST");
 if(uses.some(u=>!u||typeof u.wiseId!=="string"||!u.wiseId.trim()||
  !EFFECTS.has(String(u.effect??"").trim().toUpperCase())||
  u.related!==true))return blocked("UNVERIFIED_WISE_ID_EFFECT_OR_RELEVANCE");
 if(uses.length>knownWises)return blocked("WISE_NOT_OWNED");
 const normalized=uses.map(u=>({wiseId:u.wiseId.trim(),effect:u.effect.trim().toUpperCase()}));
 if(new Set(normalized.map(u=>u.wiseId.toLowerCase())).size!==uses.length)
  return blocked("SAME_WISE_CANNOT_BE_USED_TWICE_ON_ONE_TEST");
 if(new Set(normalized.map(u=>u.effect)).size!==uses.length)
  return blocked("WISE_EFFECT_ALREADY_USED_ON_THIS_TEST");
 if(ordinaryHelpProvided&&normalized.some(u=>u.effect==="I_AM_WISE"))
  return blocked("WISE_AID_AND_HELP_MUTUALLY_EXCLUSIVE");
 return result({ok:true,knownWises,uses:normalized,gmFictionalRelevancePreconfirmed:true,
  sameTestMultipleWisesAllowed:true,eachEffectUsedAtMostOnce:true,
  eachWiseUsedAtMostOnce:true,ordinaryHelpProvided:Boolean(ordinaryHelpProvided),
  resourceSpendCommitted:false,usesCommitted:false});
}
