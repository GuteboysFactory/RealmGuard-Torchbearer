import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const SESSION_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="session");

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function nonNegativeInteger(value){return Number.isInteger(Number(value))&&Number(value)>=0;}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.12",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

export function tb2eSessionShadowStatus(){
  return freezeTb2e({
    phase:"M10D.12",mode:"TB2E_SESSION_PHASES_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:SESSION_ROW?.status??"PARTIAL",
    sourceEvidence:SESSION_ROW?.evidence??"QR 3, 6, 22, 37-39, 72-82; CC 44-46",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    phaseMutationAllowed:false,turnMutationAllowed:false,checkMutationAllowed:false,townLifestyleMutationAllowed:false,rewardMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_FULL_PHASE_TRANSITION_GRAPH_IN_GUIDES",
      "NO_CAMP_EVENT_RESULT_TABLE_AUTOMATION",
      "NO_TOWN_EVENT_RESULT_TABLE_AUTOMATION",
      "NO_FULL_CAMP_TOWN_EXCEPTION_TABLES",
      "NO_LIVE_CHECK_TRANSFER_SPEND_OR_EXPIRY",
      "NO_LIVE_TURN_COUNTER_RESET_OR_ADVANCE",
      "NO_LIVE_FOOD_SPOILAGE_OR_INVENTORY_MUTATION",
      "NO_LIVE_START_OR_END_SESSION_REWARD_WRITE",
      "LIFESTYLE_RESOLUTION_DELEGATED_TO_M10D_7_RESOURCES_SHADOW",
      "RECOVERY_EXECUTION_DELEGATED_TO_M10D_9_RECOVERY_SHADOW",
      "LEVEL_EXECUTION_DELEGATED_TO_M10D_11_ADVANCEMENT_SHADOW"
    ],
    nextStep:"Verify source-bounded session start, Grind turns, Camp checks/events, Town entry/events, Lifestyle/Respite and end-session timing previews only"
  });
}

export function tb2eSessionModel(){
  return freezeTb2e({
    phase:"M10D.12",profileId:PROFILE_ID,
    phases:["ADVENTURE","CAMP","TOWN","END_SESSION"],
    transitionGraphAuthority:"SOURCE_INCOMPLETE_NO_FULL_GRAPH",
    sessionStart:{
      previousSessionSummaryRewardChoices:["ALLEVIATE_CONDITION","RECOVER_ONE_TAXED_NATURE","RECOVER_ONE_SPELL_SLOT"],
      conditionRewardExcludes:["INJURED","SICK"],
      conditionRewardOrder:"CONDITION_ORDER",
      setup:["GM_SETS_STAGE","PLAYERS_SELECT_GOALS","ADJUST_BELIEFS_AND_INSTINCTS_IF_NEEDED","SELECT_PARTY_LEADER","SELECT_CARTOGRAPHER"]
    },
    grind:{
      turnDefinition:"ONE_TEST_OR_CONFLICT_NOT_FIXED_TIME",
      gmImposedTrapTurnCost:1,
      splitPartySeparateActions:"MULTIPLE_TURNS",
      instinctsCostTurns:0,
      spellsInvocationsTurnCost:"VARIES_BY_EFFECT",
      conditionCadenceTurns:4
    },
    checks:{
      earnedBy:"USING_TRAITS_AGAINST_SELF",
      spentDuring:"CAMP",
      shareable:true,
      helpingCostsCheck:false,
      unspentCampChecks:"LOST",
      townEntryRemainingChecks:"RECOVERY_TESTS"
    },
    camp:{
      entryRequirement:"PARTY_HAS_AT_LEAST_ONE_CHECK",
      turnCounterResetPreview:1,
      survey:{costTurns:1,skill:"SURVIVALIST"},
      procedure:["GM_SELECTS_CAMP_TYPE_AND_DANGER","PLAYERS_DECIDE_SURVEY_FIRE_WATCH","GM_ROLLS_CAMP_EVENTS","IF_NO_DISASTER_SPEND_CHECKS_AND_STRATEGIZE"],
      amenities:["SHELTER","WATER","CONCEALMENT"],
      darkCamp:{calamityDanger:"REDUCED",impossibleTasks:["COOKING","FORGING"],recoveryObstacleModifier:1},
      watch:{campEventRollBonus:1,oneWatcherGrantsBonus:true}
    },
    campChecks:{
      defaultTestOrConflictCostChecks:1,
      instinctCostChecks:0,
      exploreAllowed:false,
      fightAllowed:false,
      consecutiveTestsBySameCharacterAllowed:false,
      helpCostsCheck:false,
      checkTransferAllowed:true,
      memorizeSpellCostChecks:1,
      purifyImmortalBurdenCostChecks:1,
      memorizeOrPurifyLimitPerCamp:1
    },
    townEntry:{
      procedure:["SPEND_REMAINING_CHECKS_ON_RECOVERY","LEFTOVER_FOOD_SPOILS","GM_ROLLS_TOWN_EVENTS","LEVEL_UP_IF_POSSIBLE","DIVIDE_LOOT_AND_STRATEGIZE","FIND_ACCOMMODATIONS"]
    },
    lifestyle:{
      activityCostsAccumulate:true,
      leaveTownTest:"RESOURCES",
      obstacle:"TOTAL_LIFESTYLE_COST",
      minimumObstacleDelegatedToResources:1,
      respiteLifestyleCostModifier:1
    },
    endSession:{
      fatePersonaEarnedAt:"END_OF_SESSION",
      awardAuthority:"M10D.7_RESOURCES_SHADOW"
    },
    light:{
      CANDLE:{brightTurns:4,brightPeople:1,dimExtraPeople:1},
      TORCH:{brightTurns:2,brightPeople:2,dimExtraPeople:2,groundMode:"DIM"},
      LANTERN:{brightTurns:3,brightPeople:3,dimExtraPeople:3,groundMode:"DIM"},
      darknessBlocks:["READING","DRAWING_CARTOGRAPHER_OR_SCHOLAR","FIGHTING","SEARCHING","TARGETING_OTHERS_WITH_SPELLS"],
      darknessAllows:["FLEEING","RIDDLING","SELF_TARGETING_WITH_SPELLS"]
    },
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eSessionStartPlan({
  summaryReward="",
  condition="",
  taxedNature=0,
  spellSlotsMissing=0
}={}){
  const reward=key(summaryReward);
  const allowed=["ALLEVIATE_CONDITION","RECOVER_ONE_TAXED_NATURE","RECOVER_ONE_SPELL_SLOT"];
  if(reward&&!allowed.includes(reward))return blocked("UNKNOWN_SESSION_SUMMARY_REWARD",{summaryReward:reward});
  const c=key(condition);
  if(reward==="ALLEVIATE_CONDITION"){
    if(!c)return blocked("CONDITION_REQUIRED_FOR_ALLEVIATION");
    if(["INJURED","SICK"].includes(c))return blocked("SUMMARY_REWARD_CANNOT_ALLEVIATE_INJURED_OR_SICK",{condition:c});
  }
  if(!nonNegativeInteger(taxedNature)||!nonNegativeInteger(spellSlotsMissing))return blocked("INVALID_SESSION_START_RESOURCE_STATE",{taxedNature,spellSlotsMissing});
  const available={
    ALLEVIATE_CONDITION:true,
    RECOVER_ONE_TAXED_NATURE:Number(taxedNature)>0,
    RECOVER_ONE_SPELL_SLOT:Number(spellSlotsMissing)>0
  };
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"SESSION_START_SHADOW",
    summaryReward:reward||null,condition:c||null,available,
    rewardAmount:reward?1:0,
    setup:["GM_SETS_STAGE","PLAYERS_SELECT_GOALS","ADJUST_BELIEFS_AND_INSTINCTS_IF_NEEDED","SELECT_PARTY_LEADER","SELECT_CARTOGRAPHER"],
    conditionMutationCommitted:false,natureMutationCommitted:false,spellMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eGrindTurnPlan({
  actionType="TEST",
  gmImposedTrap=false,
  separatePartyActions=1,
  instinct=false,
  explicitSpellTurnCost=null
}={}){
  const action=key(actionType);
  if(!["TEST","CONFLICT","TRAP","SPELL","INVOCATION","OTHER"].includes(action))return blocked("UNKNOWN_GRIND_ACTION_TYPE",{actionType:action});
  if(!Number.isInteger(Number(separatePartyActions))||Number(separatePartyActions)<1)return blocked("INVALID_SEPARATE_PARTY_ACTION_COUNT",{separatePartyActions});
  if(explicitSpellTurnCost!==null&&(!Number.isInteger(Number(explicitSpellTurnCost))||Number(explicitSpellTurnCost)<0))return blocked("INVALID_EXPLICIT_SPELL_TURN_COST",{explicitSpellTurnCost});
  let turns;
  let authority="GUIDE";
  if(instinct)turns=0;
  else if(Boolean(gmImposedTrap)||action==="TRAP")turns=1;
  else if(["SPELL","INVOCATION"].includes(action)){
    if(explicitSpellTurnCost===null){turns=null;authority="SPELL_OR_INVOCATION_EFFECT_SOURCE_REQUIRED";}
    else turns=Number(explicitSpellTurnCost);
  } else turns=Number(separatePartyActions);
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"GRIND_TURN_SHADOW",
    actionType:action,gmImposedTrap:Boolean(gmImposedTrap),separatePartyActions:Number(separatePartyActions),instinct:Boolean(instinct),
    turnCostPreview:turns,turnCostAuthority:authority,
    turnCounterMutationCommitted:false,conditionCadenceMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eCampEntryPlan({
  partyChecks=0,
  survey=false,
  keepFire=false,
  setWatch=false,
  darkCamp=false
}={}){
  if(!nonNegativeInteger(partyChecks))return blocked("INVALID_PARTY_CHECK_COUNT",{partyChecks});
  const canCamp=Number(partyChecks)>=1;
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"CAMP_ENTRY_SHADOW",
    partyChecks:Number(partyChecks),canCamp,
    reasonCode:canCamp?null:"CAMP_REQUIRES_AT_LEAST_ONE_PARTY_CHECK",
    turnCounterResetPreview:canCamp?1:null,
    survey:Boolean(survey),surveyTurnCost:Boolean(survey)?1:0,surveySkill:Boolean(survey)?"SURVIVALIST":null,
    keepFire:Boolean(keepFire),setWatch:Boolean(setWatch),darkCamp:Boolean(darkCamp),
    darkCampRecoveryObstacleModifier:Boolean(darkCamp)?1:0,
    darkCampImpossibleTasks:Boolean(darkCamp)?["COOKING","FORGING"]:[],
    watchCampEventRollBonus:Boolean(setWatch)?1:0,
    phaseMutationCommitted:false,turnCounterMutationCommitted:false,checkMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eCampEventModifierPlan({
  shelter=false,
  concealment=false,
  rangerInWilderness=false,
  outcastInDungeonOrDwarfStructure=false,
  settingWatch=false,
  previousDisasters=0,
  gmDiscretionPenalty=false,
  danger="NORMAL"
}={}){
  if(!nonNegativeInteger(previousDisasters))return blocked("INVALID_PREVIOUS_DISASTER_COUNT",{previousDisasters});
  const d=key(danger);
  if(!["NORMAL","UNSAFE","DANGEROUS"].includes(d))return blocked("UNKNOWN_CAMP_DANGER",{danger:d});
  const bonuses=[
    ["SHELTER",shelter],["CONCEALMENT",concealment],["RANGER_IN_WILDERNESS",rangerInWilderness],
    ["OUTCAST_IN_DUNGEON_OR_DWARF_STRUCTURE",outcastInDungeonOrDwarfStructure],["SETTING_WATCH",settingWatch]
  ].filter(([,v])=>Boolean(v)).map(([id])=>id);
  const dangerPenalty=d==="UNSAFE"?2:d==="DANGEROUS"?3:0;
  const penalties={
    previousDisasters:Number(previousDisasters),
    gmDiscretion:Boolean(gmDiscretionPenalty)?1:0,
    danger:dangerPenalty
  };
  const totalBonus=bonuses.length;
  const totalPenalty=penalties.previousDisasters+penalties.gmDiscretion+penalties.danger;
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"CAMP_EVENT_MODIFIER_SHADOW",
    bonuses,totalBonus,penalties,totalPenalty,netModifier:totalBonus-totalPenalty,
    eventResultAuthority:"CAMP_EVENT_TABLE_NOT_SUPPLIED_DO_NOT_RESOLVE",
    eventRollExecuted:false,phaseMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eCampCheckPlan({
  activity="TEST",
  checksAvailable=0,
  instinct=false,
  helping=false,
  sameCharacterActedImmediatelyBefore=false,
  memorizeOrPurifyAlreadyDone=false
}={}){
  const a=key(activity);
  if(!["TEST","CONFLICT","IMPROVE_CAMP","DRAW_MAP","RESEARCH","MEMORIZE_SPELL","PURIFY_IMMORTAL_BURDEN","EXPLORE","FIGHT"].includes(a))return blocked("UNKNOWN_CAMP_CHECK_ACTIVITY",{activity:a});
  if(!nonNegativeInteger(checksAvailable))return blocked("INVALID_CHECK_COUNT",{checksAvailable});
  if(["EXPLORE","FIGHT"].includes(a))return blocked("CAMP_CANNOT_EXPLORE_OR_FIGHT",{activity:a});
  if(Boolean(sameCharacterActedImmediatelyBefore)&&!Boolean(helping))return blocked("NO_TWO_TESTS_IN_A_ROW_IN_CAMP");
  if(["MEMORIZE_SPELL","PURIFY_IMMORTAL_BURDEN"].includes(a)&&Boolean(memorizeOrPurifyAlreadyDone))return blocked("MEMORIZE_OR_PURIFY_LIMIT_ONCE_PER_CAMP",{activity:a});
  const cost=Boolean(helping)||Boolean(instinct)?0:1;
  const affordable=Number(checksAvailable)>=cost;
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"CAMP_CHECK_SHADOW",
    activity:a,checksAvailable:Number(checksAvailable),instinct:Boolean(instinct),helping:Boolean(helping),
    checkCostPreview:cost,affordable,checkTransferAllowed:true,
    unspentChecksAtCampEnd:"LOST",
    checkSpendCommitted:false,checkTransferCommitted:false,phaseMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eWatchPlan({
  onWatch=false,
  spendCheckToAvertDisaster=false
}={}){
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"CAMP_WATCH_SHADOW",
    onWatch:Boolean(onWatch),
    campEventRollBonus:Boolean(onWatch)?1:0,
    blockedWhileWatching:Boolean(onWatch)?["RECOVERY_TEST","MEMORIZE_SPELL","PURIFY_IMMORTAL_BURDEN"]:[],
    otherChecksAllowed:Boolean(onWatch),
    maySpendCheckToAvertDisaster:Boolean(onWatch)&&Boolean(spendCheckToAvertDisaster),
    avertDisasterMethod:Boolean(onWatch)&&Boolean(spendCheckToAvertDisaster)?"TEST_OR_CONFLICT":null,
    checkSpendCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eTownEntryPlan({
  remainingChecks=0,
  leftoverFood=true,
  levelUpPossible=false
}={}){
  if(!nonNegativeInteger(remainingChecks))return blocked("INVALID_CHECK_COUNT",{remainingChecks});
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"TOWN_ENTRY_SHADOW",
    remainingChecks:Number(remainingChecks),remainingChecksUse:"RECOVERY_TESTS",
    leftoverFoodPresent:Boolean(leftoverFood),leftoverFoodOutcome:Boolean(leftoverFood)?"SPOILS_AND_IS_THROWN_AWAY":"NONE",
    townEventRollRequired:true,levelUpPossible:Boolean(levelUpPossible),
    procedure:["SPEND_REMAINING_CHECKS_ON_RECOVERY","LEFTOVER_FOOD_SPOILS","GM_ROLLS_TOWN_EVENTS","LEVEL_UP_IF_POSSIBLE","DIVIDE_LOOT_AND_STRATEGIZE","FIND_ACCOMMODATIONS"],
    delegatedRecoveryAuthority:"M10D.9_RECOVERY_SHADOW",
    delegatedLevelAuthority:"M10D.11_ADVANCEMENT_SHADOW",
    foodMutationCommitted:false,checkSpendCommitted:false,levelMutationCommitted:false,phaseMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eTownEventModifierPlan({
  prayedAtShrine=false,
  stewardMaintainedWorks=false,
  skaldCourtStanding=false,
  theurgeAlliedTown=false,
  ongoingDisasters=0,
  theurgeEnemyTown=false
}={}){
  if(!nonNegativeInteger(ongoingDisasters))return blocked("INVALID_ONGOING_DISASTER_COUNT",{ongoingDisasters});
  const bonuses=[
    ["PRAYED_AT_SHRINE",prayedAtShrine],["STEWARD_MAINTAINED_WORKS",stewardMaintainedWorks],
    ["SKALD_COURT_OF_THE_WISE",skaldCourtStanding],["THEURGE_ALLIED_TOWN",theurgeAlliedTown]
  ].filter(([,v])=>Boolean(v)).map(([id])=>id);
  const penalties={ongoingDisasters:Number(ongoingDisasters),theurgeEnemyTown:Boolean(theurgeEnemyTown)?1:0};
  const totalBonus=bonuses.length;
  const totalPenalty=penalties.ongoingDisasters+penalties.theurgeEnemyTown;
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"TOWN_EVENT_MODIFIER_SHADOW",
    bonuses,totalBonus,penalties,totalPenalty,netModifier:totalBonus-totalPenalty,
    eventResultAuthority:"TOWN_EVENT_TABLE_NOT_SUPPLIED_DO_NOT_RESOLVE",
    eventRollExecuted:false,phaseMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eLifestyleExitPlan({
  lifestyleCost=0,
  respite=false
}={}){
  if(!nonNegativeInteger(lifestyleCost))return blocked("INVALID_LIFESTYLE_COST",{lifestyleCost});
  const adjusted=Number(lifestyleCost)+(Boolean(respite)?1:0);
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"LIFESTYLE_EXIT_SHADOW",
    baseLifestyleCost:Number(lifestyleCost),respite:Boolean(respite),respiteModifier:Boolean(respite)?1:0,
    adjustedLifestyleCost:adjusted,
    resourcesObstaclePreview:Math.max(1,adjusted),
    resourcesObstacleAuthority:"M10D.7_RESOURCES_SHADOW_MINIMUM_OB_1",
    leaveTownTest:"RESOURCES",
    lifestyleMutationCommitted:false,resourcesTestExecuted:false,phaseMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eEndSessionTimingPlan({
  awardsReady=false
}={}){
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"END_SESSION_TIMING_SHADOW",
    fatePersonaEarnedAt:"END_OF_SESSION",awardsReady:Boolean(awardsReady),
    delegatedAwardAuthority:"M10D.7_RESOURCES_SHADOW",
    awardMutationCommitted:false,phaseMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eLightPlan({
  source="TORCH",
  placedOnGround=false
}={}){
  const s=key(source);
  const data=tb2eSessionModel().light[s];
  if(!data||!["CANDLE","TORCH","LANTERN"].includes(s))return blocked("UNKNOWN_LIGHT_SOURCE",{source:s});
  return freezeTb2e({
    ok:true,phase:"M10D.12",profileId:PROFILE_ID,mode:"LIGHT_SHADOW",
    source:s,...data,placedOnGround:Boolean(placedOnGround),
    lightMode:Boolean(placedOnGround)&&["TORCH","LANTERN"].includes(s)?"DIM":"NORMAL",
    turnMutationCommitted:false,inventoryMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
