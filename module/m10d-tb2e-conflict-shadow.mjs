import { tb2eCoreDomainAudit } from "./m10d-tb2e-core-source-expansion.mjs";
import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
import { TB2E_CONFLICT_ACTIONS as ACTIONS, TB2E_CONFLICT_TYPES as TYPES,
 TB2E_CONFLICT_MATRIX as MATRIX, TB2E_CONFLICT_SKILLS as SKILLS,
 TB2E_MANEUVER_COSTS as COSTS,tb2eConflictKey as key,
 tb2eConflictTypeKey as typeKey,tb2eConflictCount as count,
 tb2eConflictResult as result,tb2eConflictBlocked as blocked
} from "./m10d-tb2e-conflict-contract.mjs";

export function tb2eConflictShadowStatus(){
 return freezeTb2e({phase:"M10D.18_P2.3",profileId:"torchbearer2e",profileVersion:1,
  adapterReady:true,sourceClassification:tb2eCoreDomainAudit("conflict")?.status??"VERIFIED",
  mode:"TB2E_CONFLICT_READ_ONLY_SHADOW",liveEnabled:false,liveApplication:false,
  activationAllowed:false,actorMutationAllowed:false,itemMutationAllowed:false,
  hpMutationAllowed:false,actionMutationAllowed:false,
  writes:{actors:0,items:0,journals:0,settings:0},
  boundaries:["SEVEN_CORE_CONFLICT_TYPES","THREE_ACTIONS_PER_ROUND","NO_LIVE_ROLL_OR_HP_WRITES",
   "CAPTAIN_CHOOSES_ODD_HP","GM_AND_TABLE_CHOOSE_COMPROMISE","M11_PAUSED","LEGACY_MIXED_AUTHORITY"],
  nextStep:"Foundry P2.3 Conflict QA; Magic remains pending"});
}
export function tb2eConflictModel(){
 return result({ok:true,actions:ACTIONS,types:TYPES,actionInteractionMatrix:MATRIX,
  actionSkills:SKILLS,maneuverCosts:COSTS,actionsPerRound:3,minimumDisposition:1,
  independentObstacles:{ATTACK:0,DEFEND:3,FEINT:0,MANEUVER:0},
  helpingDice:1,unarmedDicePenalty:-1,
  compromise:"GM_AND_TABLE_ADJUDICATION",
  advancement:"FIRST_PASS_OR_FAIL_PER_SKILL_OR_ABILITY_PER_CONFLICT"});
}
export function tb2eConflictDispositionPlan({conflictType="KILL",baseRating=0,
 rolledSuccesses=null,teamConditions=[],captainConditions=[],
 captainHasBackpack=false,captainInDimOrDarkness=false,rollIncludesDicePenalty=false}={}){
 const type=typeKey(conflictType);
 if(!TYPES.includes(type))return blocked("UNSUPPORTED_CONFLICT_TYPE");
 if(!count(baseRating)||(rolledSuccesses!==null&&!count(rolledSuccesses)))return blocked("INVALID_RATING_OR_SUCCESSES");
 if(!Array.isArray(teamConditions)||!Array.isArray(captainConditions))return blocked("INVALID_CONDITION_LIST");
 const t=new Set(teamConditions.map(key)),c=new Set(captainConditions.map(key));
 const hungry=t.has("HUNGRY_AND_THIRSTY")||t.has("HUNGRY_THIRSTY");
 const exhausted=t.has("EXHAUSTED"),backpack=captainHasBackpack&&["KILL","CAPTURE","DRIVE_OFF"].includes(type);
 const darkness=captainInDimOrDarkness&&type!=="TRICK_OR_RIDDLE";
 const successCount=Number(hungry)+Number(exhausted)+Number(backpack)+Number(darkness);
 const diceCount=Number(c.has("INJURED"))+Number(c.has("SICK"));
 const successesPenalty=successCount>0?-successCount:0;
 const dicePenalty=diceCount>0?-diceCount:0;
 const pending=rolledSuccesses===null||(dicePenalty<0&&!rollIncludesDicePenalty);
 return result({ok:true,conflictType:type,dispositionRollSkills:SKILLS[type].disposition,
  dispositionBaseAbility:SKILLS[type].base,baseRating,rolledSuccesses,
  successPenalty:successesPenalty,dicePenalty,
  requiresAdjustedPool:dicePenalty<0&&!rollIncludesDicePenalty,calculationPending:pending,
  startingDisposition:pending?null:Math.max(1,baseRating+rolledSuccesses+successesPenalty),
  appliedOncePerTeam:{hungry,exhausted},backpackPenalty:backpack,darknessPenalty:darkness,
  minimumStartingDisposition:1});
}
export function tb2eConflictActionPlan({conflictType="KILL",action,opponentAction}={}){
 const type=typeKey(conflictType),a=key(action),b=key(opponentAction);
 if(!TYPES.includes(type))return blocked("UNSUPPORTED_CONFLICT_TYPE");
 if(!ACTIONS.includes(a)||!ACTIONS.includes(b))return blocked("INVALID_ACTION");
 const interaction=MATRIX[a][b];
 return result({ok:true,conflictType:type,action:a,opponentAction:b,interaction,
  actionSkillOrAbility:SKILLS[type].actions[ACTIONS.indexOf(a)],
  rollAllowed:interaction!=="NO_TEST",
  independentObstacle:interaction==="INDEPENDENT"?{ATTACK:0,DEFEND:3,FEINT:0,MANEUVER:0}[a]:null,
  bonusSuccessesRequirePassedOrTiedTest:true});
}
export function tb2eConflictHpAllocationPlan({startingDisposition=0,participantIds=[],oddPointRecipients=[]}={}){
 if(!count(startingDisposition)||startingDisposition===0)return blocked("INVALID_STARTING_DISPOSITION");
 if(!Array.isArray(participantIds)||participantIds.length===0||
    participantIds.some(id=>typeof id!=="string"||!id.trim())||
    new Set(participantIds).size!==participantIds.length)return blocked("INVALID_PARTICIPANTS");
 if(!Array.isArray(oddPointRecipients))return blocked("INVALID_ODD_RECIPIENTS");
 if(startingDisposition<participantIds.length)
  return blocked("CAPTAIN_MUST_SELECT_ACTIVE_PARTICIPANTS",{maxActive:startingDisposition});
 const base=Math.floor(startingDisposition/participantIds.length);
 const remainder=startingDisposition%participantIds.length;
 if(oddPointRecipients.length!==remainder||new Set(oddPointRecipients).size!==remainder||
    oddPointRecipients.some(id=>!participantIds.includes(id)))
  return blocked("CAPTAIN_MUST_ASSIGN_ODD_HP",{oddPoints:remainder});
 return result({ok:true,startingDisposition,participants:participantIds.map(id=>({
  id,startingHp:base+Number(oddPointRecipients.includes(id))})),
  oddPointRecipients,allocatedTotal:startingDisposition,hpCommitted:false});
}
