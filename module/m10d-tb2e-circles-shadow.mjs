import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const CIRCLES_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="circles");
const CIRCLES_PERSONNEL_FACTORS=freezeTb2e({PORTER:1,SENTRY:2,GUIDE:3,LABORER:1,CRAFTSMAN:2,SPECIALIST:3,EDUCATED:4,MAGICIAN:5});
const CIRCLES_ALLY_FACTORS=freezeTb2e({POSITION:{ADVENTURER:1,TOWNSFOLK:2,GOVERNMENT_OR_RULER:3},LEVEL:{LOWER:0,SAME:1,HIGHER:2},ATTITUDE:{WILLING_TO_LISTEN:0,HELP_FOR_PRICE:1,LOYAL:2}});

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function nonNegativeInteger(value){return Number.isInteger(Number(value))&&Number(value)>=0;}
function positiveInteger(value){return Number.isInteger(Number(value))&&Number(value)>=1;}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.13",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

export function tb2eCirclesShadowStatus(){
  return freezeTb2e({
    phase:"M10D.13",mode:"TB2E_CIRCLES_RELATIONSHIPS_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:CIRCLES_ROW?.status??"PARTIAL",coreReauditTargetedPhase:"M10D.18_P3.5",fullDomainReauditComplete:false,
    sourceEvidence:CIRCLES_ROW?.evidence??"QR 13, 86; CC 3, 31-35",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    circlesMutationAllowed:false,relationshipMutationAllowed:false,npcCreationAllowed:false,creationGrantAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "DH61_COMPLETE_CORE_CIRCLES_FACTOR_TABLE_AVAILABLE_AND_MAPPED_P35",
      "NO_AUTOMATIC_NPC_CREATION",
      "NO_AUTOMATIC_ALLY_ENEMY_RELATIONSHIP_WRITE",
      "NO_AUTOMATIC_CIRCLES_RATING_WRITE",
      "NO_AUTOMATIC_CREATION_GEAR_OR_TRAIT_GRANT",
      "RELATIONSHIP_EVOLUTION_REMAINS_ROLEPLAY_GM_MANUAL",
      "FAILURE_TWIST_CONDITION_OR_ENEMY_SELECTION_REMAINS_GM_MANUAL",
      "LONER_MAGICIAN_COMBINATION_NOT_RECONCILED_BY_GUIDES"
    ],
    nextStep:"Verify source-bounded Circles tests, ally/reputation previews, relationship evolution, starting relationship questionnaire and free-home lodging only"
  });
}

export function tb2eCirclesModel(){
  return freezeTb2e({
    phase:"M10D.13",profileId:PROFILE_ID,
    ability:{name:"CIRCLES",ratingRange:{min:1,max:10},primaryPhase:"TOWN",purpose:["FIND_CONTACTS","FIND_FRIENDS","FIND_HELP","FIND_INFORMATION"]},
    test:{
      completeObstacleFactorsAvailable:true,
      factors:{hirePersonnel:CIRCLES_PERSONNEL_FACTORS,findAlly:CIRCLES_ALLY_FACTORS},
      obstacleAuthority:"DH61_CORE_VERIFIED_FACTORS",
      success:{targetFound:true,mayRecordAsNewAlly:true,futureAllySearchBonusDice:1},
      failure:{targetFound:true,mayRecordAsNewAlly:false,consequenceAuthority:"GM_MANUAL_TWIST_CONDITION_OR_POSSIBLE_ENEMY"}
    },
    reputation:{unlocksAtLevel:3,hometownCirclesBonusDice:1},
    relationshipEvolution:{friendToEnemyPossible:true,enemyToFriendPossible:true,authority:"ROLEPLAY_GM_MANUAL"},
    startingRelationships:{
      baseCircles:1,
      optionIds:["FRIEND","PARENTS","MENTOR","ENEMY"],
      maximumSelectedOptions:3,
      friendCirclesIncrease:1,parentsCirclesIncrease:1,mentorCirclesIncrease:1,enemyCirclesIncrease:1,
      friendAdventurerLevel:"EQUAL_TO_CHARACTER_AND_LEVELS_WITH_CHARACTER",
      mentorLevel:7,mentorClass:"SAME_AS_CHARACTER",magicianMustHaveMentor:true,
      enemyLevel:"CHARACTER_LEVEL_PLUS_ONE",enemyClassAuthority:"GM",
      parentsAlternative:{keepsakeTreasureDice:1,wornLocation:["NECK","ONE_HAND"]},
      mentorAlternative:{goldPouchTreasureDice:2,location:"BELT"},
      loner:{startingCircles:1,enemy:true,skipRemainingRelationshipQuestions:true,trait:"LONER"}
    },
    lodging:{freeHomeIf:["PARENTS_IN_TOWN","FRIEND_IN_TOWN"]},
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eCirclesTestOutcomePlan({
  outcome="PASS",
  failureConsequence="CONDITION"
}={}){
  const o=key(outcome);
  if(!["PASS","FAIL"].includes(o))return blocked("UNKNOWN_CIRCLES_TEST_OUTCOME",{outcome:o});
  const fc=key(failureConsequence);
  if(o==="FAIL"&&!["CONDITION","TWIST","ENMITY_CLAUSE"].includes(fc))return blocked("UNSUPPORTED_CIRCLES_FAILURE_CONSEQUENCE",{failureConsequence:fc});
  if(o==="PASS"){
    return freezeTb2e({
      ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_TEST_OUTCOME_SHADOW",outcome:o,
      targetFound:true,allyRecordPreview:true,futureAllySearchBonusDice:1,
      consequenceAuthority:null,
      relationshipMutationCommitted:false,npcCreationCommitted:false,circlesMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  if(fc==="ENMITY_CLAUSE")return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_TEST_OUTCOME_SHADOW",outcome:o,
    failureConsequence:fc,targetFound:false,enemyFound:true,enemyRecordPreview:true,
    enemyDispositionBonusSuccesses:3,enemyDispositionConflicts:["DRIVE_OFF","CONVINCE","CONVINCE_CROWD"],
    sourceEvidence:"Dungeoneers Handbook p.62",
    relationshipMutationCommitted:false,npcCreationCommitted:false,circlesMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
  return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_TEST_OUTCOME_SHADOW",outcome:o,
    targetFound:true,allyRecordPreview:false,futureAllySearchBonusDice:0,
    consequenceOptions:["TWIST","CONDITION","POSSIBLE_ENEMY"],consequenceAuthority:"GM_MANUAL",
    relationshipMutationCommitted:false,npcCreationCommitted:false,circlesMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eCirclesReputationPlan({
  level=1,
  inHometown=false
}={}){
  if(!positiveInteger(level)||Number(level)>10)return blocked("INVALID_CHARACTER_LEVEL",{level});
  const reputationUnlocked=Number(level)>=3;
  return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_REPUTATION_SHADOW",
    level:Number(level),reputationUnlocked,inHometown:Boolean(inHometown),
    hometownCirclesBonusDice:reputationUnlocked&&Boolean(inHometown)?1:0,
    reputationMutationCommitted:false,circlesMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eRelationshipEvolutionPlan({
  from="FRIEND",
  to="ENEMY"
}={}){
  const a=key(from),b=key(to);
  if(!["FRIEND","ENEMY"].includes(a)||!["FRIEND","ENEMY"].includes(b))return blocked("RELATIONSHIP_EVOLUTION_ONLY_FRIEND_ENEMY_BOUNDARY",{from:a,to:b});
  if(a===b)return blocked("RELATIONSHIP_EVOLUTION_REQUIRES_CHANGE",{from:a,to:b});
  return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"RELATIONSHIP_EVOLUTION_SHADOW",
    from:a,to:b,allowedByGuide:true,authority:"ROLEPLAY_GM_MANUAL",
    relationshipMutationCommitted:false,npcMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eStartingRelationshipsPlan({
  friend=false,
  loner=false,
  parents=false,
  mentor=false,
  enemy=false,
  characterClass="",
  characterLevel=1,
  friendIsAdventurer=false,
  lonerTraitAlreadyOwned=false
}={}){
  if(!positiveInteger(characterLevel)||Number(characterLevel)>10)return blocked("INVALID_CHARACTER_LEVEL",{characterLevel});
  const cls=key(characterClass);
  if(Boolean(friend)===Boolean(loner))return blocked("CHOOSE_EXACTLY_ONE_FRIEND_OR_LONER_ROUTE",{friend:Boolean(friend),loner:Boolean(loner)});
  if(Boolean(loner)){
    if(Boolean(parents)||Boolean(mentor)||Boolean(enemy))return blocked("LONER_SKIPS_REMAINING_RELATIONSHIP_QUESTIONS",{parents:Boolean(parents),mentor:Boolean(mentor),enemy:Boolean(enemy)});
    if(cls==="MAGICIAN")return blocked("LONER_MAGICIAN_COMBINATION_NOT_RECONCILED_BY_GUIDES",{characterClass:cls});
    return freezeTb2e({
      ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"STARTING_RELATIONSHIPS_SHADOW",route:"LONER",
      baseCircles:1,startingCirclesPreview:1,selectedRelationshipCount:1,selectedRelationships:["ENEMY"],
      skipRemainingRelationshipQuestions:true,
      enemyPreview:{required:true,level:Number(characterLevel)+1,classAuthority:"GM"},
      lonerTraitPreview:{trait:"LONER",action:Boolean(lonerTraitAlreadyOwned)?"INCREASE_BY_ONE_LEVEL":"TAKE_AT_LEVEL_1",levelCapEvaluation:"NOT_EVALUATED_BY_THIS_ADAPTER"},
      npcCreationCommitted:false,relationshipMutationCommitted:false,circlesMutationCommitted:false,traitMutationCommitted:false,inventoryMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }

  if(cls==="MAGICIAN"&&!Boolean(mentor))return blocked("MAGICIAN_MUST_SELECT_MENTOR",{characterClass:cls});
  const selected=[
    ["FRIEND",friend],["PARENTS",parents],["MENTOR",mentor],["ENEMY",enemy]
  ].filter(([,v])=>Boolean(v)).map(([id])=>id);
  if(selected.length>3)return blocked("STARTING_RELATIONSHIP_OPTION_LIMIT_EXCEEDED",{selectedRelationships:selected,maximumSelectedOptions:3});

  const startingCircles=1+selected.length;
  return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"STARTING_RELATIONSHIPS_SHADOW",route:"SOCIAL",
    baseCircles:1,selectedRelationshipCount:selected.length,selectedRelationships:selected,maximumSelectedOptions:3,
    startingCirclesPreview:startingCircles,
    friendPreview:Boolean(friend)?{required:true,adventurer:Boolean(friendIsAdventurer),level:Boolean(friendIsAdventurer)?Number(characterLevel):null,levelProgression:Boolean(friendIsAdventurer)?"LEVELS_WITH_CHARACTER":null,requiredDetails:["NAME","HOMETOWN","PROFESSION","LAST_SEEN"],adventurerExtraDetails:Boolean(friendIsAdventurer)?["CLASS","SPECIALTY"]:[]}:null,
    parentsPreview:Boolean(parents)?{required:true,requiredDetails:["PARENT_NAMES","FAMILY_NAME","PROFESSION"],freeHomeCandidate:true}:{required:false,alternative:"PARENT_KEEPSAKE",treasureDice:1,wornLocationOptions:["NECK","ONE_HAND"]},
    mentorPreview:Boolean(mentor)?{required:true,level:7,classAuthority:"SAME_AS_CHARACTER",nameRequired:true}:{required:false,alternative:"SELF_MADE_GOLD_POUCH",treasureDice:2,location:"BELT"},
    enemyPreview:Boolean(enemy)?{required:true,level:Number(characterLevel)+1,classAuthority:"GM",nameRequired:true}:null,
    npcCreationCommitted:false,relationshipMutationCommitted:false,circlesMutationCommitted:false,traitMutationCommitted:false,inventoryMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eRelationshipLodgingPlan({
  parentsInTown=false,
  friendInTown=false
}={}){
  const source=Boolean(parentsInTown)?"PARENTS_IN_TOWN":Boolean(friendInTown)?"FRIEND_IN_TOWN":null;
  return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"RELATIONSHIP_LODGING_SHADOW",
    parentsInTown:Boolean(parentsInTown),friendInTown:Boolean(friendInTown),
    freeHomeLodging:Boolean(source),lodgingSource:source,
    accommodationMutationCommitted:false,relationshipMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eCirclesObstacleBoundaryPlan(){
  return freezeTb2e({
    ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_OBSTACLE_BOUNDARY_SHADOW",
    completeFactorsAvailable:true,obstacle:null,
    obstacleAuthority:"DH61_CORE_VERIFIED_FACTORS",
    testExecutionAllowed:false,liveApplication:false,writesPlanned:0
  });
}

/** DH 61 Circles factors. The GM supplies the requested NPC/factors and chooses the test. */
export function tb2eCirclesFactorPlan({
  kind="FIND_ALLY",personnel="",position="",level="",attitude=""
}={}){
  const k=key(kind);
  if(k==="HIRE_PERSONNEL"){
    const p=key(personnel),factor=CIRCLES_PERSONNEL_FACTORS[p];
    if(factor===undefined)return blocked("UNKNOWN_CIRCLES_PERSONNEL_FACTOR",{personnel:p});
    return freezeTb2e({ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_FACTOR_SHADOW",
      kind:k,personnel:p,obstacle:factor,sourceEvidence:"Dungeoneers Handbook p.61",
      rollExecuted:false,npcCreationCommitted:false,liveApplication:false,writesPlanned:0});
  }
  if(k!=="FIND_ALLY")return blocked("UNKNOWN_CIRCLES_FACTOR_KIND",{kind:k});
  const p=key(position),l=key(level),a=key(attitude);
  const positions=CIRCLES_ALLY_FACTORS.POSITION,levels=CIRCLES_ALLY_FACTORS.LEVEL,attitudes=CIRCLES_ALLY_FACTORS.ATTITUDE;
  if(positions[p]===undefined||levels[l]===undefined||attitudes[a]===undefined)
    return blocked("UNKNOWN_CIRCLES_ALLY_FACTOR",{position:p,level:l,attitude:a});
  const factors={position:positions[p],level:levels[l],attitude:attitudes[a]};
  return freezeTb2e({ok:true,phase:"M10D.13",profileId:PROFILE_ID,mode:"CIRCLES_FACTOR_SHADOW",
    kind:k,position:p,level:l,attitude:a,factors,obstacle:factors.position+factors.level+factors.attitude,
    sourceEvidence:"Dungeoneers Handbook p.61",rollExecuted:false,npcCreationCommitted:false,
    liveApplication:false,writesPlanned:0});
}
