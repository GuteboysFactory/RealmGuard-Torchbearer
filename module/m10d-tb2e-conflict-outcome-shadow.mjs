import { tb2eConflictCount as count,tb2eConflictResult as result,
 tb2eConflictBlocked as blocked } from "./m10d-tb2e-conflict-contract.mjs";

export function tb2eConflictOutcomePlan({teamStart=1,teamRemaining=1,
 opponentStart=1,opponentRemaining=1}={}){
 if(![teamStart,teamRemaining,opponentStart,opponentRemaining].every(count)||
   teamStart<1||opponentStart<1||teamRemaining>teamStart||opponentRemaining>opponentStart)
  return blocked("INVALID_CONFLICT_DISPOSITION");
 let outcome="ONGOING";
 if(teamRemaining===0&&opponentRemaining===0)outcome="TIE";
 else if(opponentRemaining===0)outcome="WIN";
 else if(teamRemaining===0)outcome="LOSE";
 const start=outcome==="WIN"?teamStart:outcome==="LOSE"?opponentStart:null;
 const remaining=outcome==="WIN"?teamRemaining:outcome==="LOSE"?opponentRemaining:null;
 const lost=outcome==="WIN"?teamStart-teamRemaining:outcome==="LOSE"?opponentStart-opponentRemaining:null;
 const compromise=outcome==="TIE"?"MAJOR_BOTH_SIDES":outcome==="ONGOING"?"NOT_RESOLVED"
  :lost===0?"NONE":remaining>start/2?"MINOR":"GM_CHOOSE_HALF_OR_MAJOR";
 return result({ok:true,outcome,compromiseGuidance:compromise,
  compromiseGMApprovalRequired:!["NONE","NOT_RESOLVED"].includes(compromise),
  fictionalTerms:"GM_AND_TABLE_NEGOTIATION_MANUAL",
  conditionsAndDeathApplied:false,conflictEnded:outcome!=="ONGOING"});
}
