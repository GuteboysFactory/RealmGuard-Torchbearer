import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const SCALES_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="scales");

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function integerInRange(value,min,max){return Number.isInteger(Number(value))&&Number(value)>=min&&Number(value)<=max;}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.14",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

const MIGHT_SCALE=freezeTb2e({
  8:["IMMORTALS"],
  7:["ANCIENT_DRAGONS","STORM_GIANTS","YOUNG_GODS"],
  6:["DRAGONS","HILL_GIANTS"],
  5:["OGRES","TROLLS","YOUNG_DRAGONS"],
  4:["BUGBEARS","GIANT_SPIDERS","OWLBEARS"],
  3:["ADVENTURERS","ORCS","GNOLLS","HORSES","DIRE_WOLVES"],
  2:["REGULAR_PEOPLE","GOBLINS","FROSK"],
  1:["CRITTERS","KOBOLDS"]
});

const PRECEDENCE_SCALE=freezeTb2e({
  7:["KING","QUEEN"],
  6:["HIGH_CLERGY_PRELATES_BISHOPS_CARDINALS"],
  5:["LOW_CLERGY_CANONS_PRIESTS_MONKS"],
  4:["HIGH_NOBILITY"],
  3:["LANDLESS_TITLELESS_NOBILITY"],
  2:["MERCHANTS","FINANCIERS","ARCHITECTS","DOCTORS"],
  1:["PEASANTS","LABORERS","ACTORS","BOATMEN","SHOPKEEPERS"],
  0:["SOLDIERS","ADVENTURERS","PROSTITUTES","CRIMINALS"]
});

export function tb2eScalesShadowStatus(){
  return freezeTb2e({
    phase:"M10D.14",mode:"TB2E_MIGHT_PRECEDENCE_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:SCALES_ROW?.status??"PARTIAL",
    sourceEvidence:SCALES_ROW?.evidence??"QR 68-71",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    mightMutationAllowed:false,precedenceMutationAllowed:false,conflictMutationAllowed:false,scaleAssignmentAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_STOCK_SPECIES_TO_MIGHT_INFERENCE",
      "NO_CHARACTER_CLASS_TO_PRECEDENCE_INFERENCE",
      "NO_EXCEPTION_INTERACTION_AUTOMATION",
      "NO_LIVE_CONFLICT_SUCCESS_MODIFIER_APPLICATION",
      "NO_LIVE_RIDER_TEST_OR_MOUNT_MIGHT_SWITCH",
      "NO_LIVE_COMPROMISE_OR_GOAL_REPROCESSING",
      "NO_MIGHT_OR_PRECEDENCE_DOCUMENT_WRITE"
    ],
    nextStep:"Verify source-bounded Might/Precedence scales, player goal limits, greater-scale +1s previews, mount boundary and post-conflict review only"
  });
}

export function tb2eScalesModel(){
  return freezeTb2e({
    phase:"M10D.14",profileId:PROFILE_ID,
    might:{
      range:{min:1,max:8},
      scale:MIGHT_SCALE,
      playerAdventurerScaleEntry:3,
      playerGoalLimits:{CAPTURE:3,KILL:4,DRIVE_OFF:5},
      bonusConflicts:["KILL","CAPTURE","DRIVE_OFF"],
      greaterMightBonus:"PLUS_ONE_SUCCESS_PER_POINT_GREATER_ON_SUCCESSFUL_OR_TIED_ACTIONS",
      mountedUse:{requires:"RIDER_SKILL_BEFORE_COMBAT",testDetailsAuthority:"NOT_SUPPLIED_BY_GUIDE"},
      postConflictMightChange:"REPROCESS_COMPROMISES_AND_POSSIBLE_GOALS_MAY_BE_REQUIRED"
    },
    precedence:{
      range:{min:0,max:7},
      scale:PRECEDENCE_SCALE,
      analogy:"MIGHT_FOR_NON_COMBAT_CONFLICTS",
      eligibility:{CONVINCE:"TARGET_LE_ACTOR",HAGGLE:"TARGET_LE_ACTOR_PLUS_1",CONVINCE_CROWD:"MEMBER_TARGET_LE_ACTOR_PLUS_2",TRICK:"ANY",RIDDLE:"ANY"},
      bonusConflicts:["NEGOTIATE","CONVINCE","CONVINCE_CROWD"],
      greaterPrecedenceBonus:"PLUS_ONE_SUCCESS_PER_POINT_GREATER_ON_SUCCESSFUL_OR_TIED_ACTIONS"
    },
    assignmentAuthority:"SCALE_REFERENCE_ONLY_DO_NOT_INFER_UNLISTED_ENTITIES",
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eMightScalePlan({might}={}){
  if(!integerInRange(might,1,8))return blocked("INVALID_MIGHT",{might});
  const n=Number(might);
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"MIGHT_SCALE_SHADOW",
    might:n,listedExamples:MIGHT_SCALE[n],
    assignmentAuthority:"SCALE_REFERENCE_ONLY_DO_NOT_INFER_UNLISTED_ENTITIES",
    mightMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2ePlayerMightGoalPlan({goal="CAPTURE",targetMight=1}={}){
  const g=key(goal);
  if(!["CAPTURE","KILL","DRIVE_OFF"].includes(g))return blocked("UNKNOWN_PLAYER_MIGHT_GOAL",{goal:g});
  if(!integerInRange(targetMight,1,8))return blocked("INVALID_TARGET_MIGHT",{targetMight});
  const limits={CAPTURE:3,KILL:4,DRIVE_OFF:5};
  const maxTargetMight=limits[g];
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"PLAYER_MIGHT_GOAL_SHADOW",
    goal:g,targetMight:Number(targetMight),maxTargetMight,
    eligible:Number(targetMight)<=maxTargetMight,
    authority:"QR_PLAYER_GOAL_LIMIT",
    goalMutationCommitted:false,conflictMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eMightActionBonusPlan({
  teamMight=1,
  opponentMight=1,
  conflictType="KILL",
  outcome="PASS"
}={}){
  if(!integerInRange(teamMight,1,8))return blocked("INVALID_TEAM_MIGHT",{teamMight});
  if(!integerInRange(opponentMight,1,8))return blocked("INVALID_OPPONENT_MIGHT",{opponentMight});
  const c=key(conflictType),o=key(outcome);
  if(!["KILL","CAPTURE","DRIVE_OFF"].includes(c))return blocked("MIGHT_BONUS_CONFLICT_NOT_SOURCE_AUTHORIZED",{conflictType:c});
  if(!["PASS","TIE","FAIL"].includes(o))return blocked("UNKNOWN_ACTION_OUTCOME",{outcome:o});
  const difference=Math.max(0,Number(teamMight)-Number(opponentMight));
  const applies=(o==="PASS"||o==="TIE")&&difference>0;
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"MIGHT_ACTION_BONUS_SHADOW",
    teamMight:Number(teamMight),opponentMight:Number(opponentMight),conflictType:c,outcome:o,
    mightDifference:difference,bonusSuccessesPreview:applies?difference:0,
    appliesTo:"SUCCESSFUL_OR_TIED_ACTION",
    successModifierCommitted:false,conflictMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eMountedMightBoundaryPlan({
  characterMight=3,
  mountMight=3,
  riderTestResolved=null
}={}){
  if(!integerInRange(characterMight,1,8))return blocked("INVALID_CHARACTER_MIGHT",{characterMight});
  if(!integerInRange(mountMight,1,8))return blocked("INVALID_MOUNT_MIGHT",{mountMight});
  if(riderTestResolved!==null&&typeof riderTestResolved!=="boolean")return blocked("INVALID_RIDER_TEST_RESOLUTION",{riderTestResolved});
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"MOUNTED_MIGHT_BOUNDARY_SHADOW",
    characterMight:Number(characterMight),mountMight:Number(mountMight),
    requires:"RIDER_SKILL_BEFORE_COMBAT",
    riderTestDetailsAuthority:"NOT_SUPPLIED_BY_GUIDE",
    riderTestResolved,
    effectiveMightPreview:riderTestResolved===true?Number(mountMight):riderTestResolved===false?Number(characterMight):null,
    mountMightUsePreview:riderTestResolved===true,
    riderTestExecuted:false,mightMutationCommitted:false,conflictMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2ePostConflictMightReviewPlan({
  mightChanged=false
}={}){
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"POST_CONFLICT_MIGHT_REVIEW_SHADOW",
    mightChanged:Boolean(mightChanged),
    reprocessCompromisesAndPossibleGoals:Boolean(mightChanged),
    reviewAuthority:Boolean(mightChanged)?"GM_REVIEW_REQUIRED_BY_GUIDE":"NONE",
    compromiseMutationCommitted:false,goalMutationCommitted:false,mightMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2ePrecedenceScalePlan({precedence}={}){
  if(!integerInRange(precedence,0,7))return blocked("INVALID_PRECEDENCE",{precedence});
  const n=Number(precedence);
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"PRECEDENCE_SCALE_SHADOW",
    precedence:n,listedExamples:PRECEDENCE_SCALE[n],
    assignmentAuthority:"SCALE_REFERENCE_ONLY_DO_NOT_INFER_UNLISTED_ENTITIES",
    precedenceMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2ePrecedenceEligibilityPlan({
  action="CONVINCE",
  actorPrecedence=0,
  targetPrecedence=0
}={}){
  const a=key(action);
  if(!["CONVINCE","HAGGLE","CONVINCE_CROWD","TRICK","RIDDLE"].includes(a))return blocked("UNKNOWN_PRECEDENCE_ACTION",{action:a});
  if(!integerInRange(actorPrecedence,0,7))return blocked("INVALID_ACTOR_PRECEDENCE",{actorPrecedence});
  if(!integerInRange(targetPrecedence,0,7))return blocked("INVALID_TARGET_PRECEDENCE",{targetPrecedence});
  let eligible=true,maximumTargetPrecedence=null,authority;
  if(a==="CONVINCE"){maximumTargetPrecedence=Number(actorPrecedence);eligible=Number(targetPrecedence)<=maximumTargetPrecedence;authority="TARGET_LE_ACTOR";}
  else if(a==="HAGGLE"){maximumTargetPrecedence=Math.min(7,Number(actorPrecedence)+1);eligible=Number(targetPrecedence)<=Number(actorPrecedence)+1;authority="TARGET_LE_ACTOR_PLUS_1";}
  else if(a==="CONVINCE_CROWD"){maximumTargetPrecedence=Math.min(7,Number(actorPrecedence)+2);eligible=Number(targetPrecedence)<=Number(actorPrecedence)+2;authority="MEMBER_TARGET_LE_ACTOR_PLUS_2";}
  else authority="ANY_PRECEDENCE";
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"PRECEDENCE_ELIGIBILITY_SHADOW",
    action:a,actorPrecedence:Number(actorPrecedence),targetPrecedence:Number(targetPrecedence),
    eligible,maximumTargetPrecedence,authority,
    conflictMutationCommitted:false,precedenceMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2ePrecedenceActionBonusPlan({
  teamPrecedence=0,
  opponentPrecedence=0,
  conflictType="CONVINCE",
  outcome="PASS"
}={}){
  if(!integerInRange(teamPrecedence,0,7))return blocked("INVALID_TEAM_PRECEDENCE",{teamPrecedence});
  if(!integerInRange(opponentPrecedence,0,7))return blocked("INVALID_OPPONENT_PRECEDENCE",{opponentPrecedence});
  const c=key(conflictType),o=key(outcome);
  if(!["NEGOTIATE","CONVINCE","CONVINCE_CROWD"].includes(c))return blocked("PRECEDENCE_BONUS_CONFLICT_NOT_SOURCE_AUTHORIZED",{conflictType:c});
  if(!["PASS","TIE","FAIL"].includes(o))return blocked("UNKNOWN_ACTION_OUTCOME",{outcome:o});
  const difference=Math.max(0,Number(teamPrecedence)-Number(opponentPrecedence));
  const applies=(o==="PASS"||o==="TIE")&&difference>0;
  return freezeTb2e({
    ok:true,phase:"M10D.14",profileId:PROFILE_ID,mode:"PRECEDENCE_ACTION_BONUS_SHADOW",
    teamPrecedence:Number(teamPrecedence),opponentPrecedence:Number(opponentPrecedence),conflictType:c,outcome:o,
    precedenceDifference:difference,bonusSuccessesPreview:applies?difference:0,
    appliesTo:"SUCCESSFUL_OR_TIED_ACTION",
    successModifierCommitted:false,conflictMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
