import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const CONDITION_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="conditions");

const CONDITION_IDS=freezeTb2e([
  "FRESH","HUNGRY_THIRSTY","EXHAUSTED","ANGRY","SICK","INJURED","AFRAID","DEAD"
]);
const GRIND_ORDER=freezeTb2e([
  "FRESH","HUNGRY_THIRSTY","EXHAUSTED","ANGRY","SICK","INJURED","AFRAID","DEAD"
]);
const RECOVERY_ORDER=freezeTb2e([
  "HUNGRY_THIRSTY","ANGRY","AFRAID","EXHAUSTED","INJURED_OR_SICK"
]);

function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.8",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}
function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function conditionId(value){
  const normalized=key(value);
  const aliases={
    HUNGRY:"HUNGRY_THIRSTY",THIRSTY:"HUNGRY_THIRSTY",HUNGRY_AND_THIRSTY:"HUNGRY_THIRSTY",
    TIRED:"EXHAUSTED",EXHAUSTION:"EXHAUSTED",FEAR:"AFRAID",INJURY:"INJURED",SICKNESS:"SICK"
  };
  const resolved=aliases[normalized]??normalized;
  return CONDITION_IDS.includes(resolved)?resolved:null;
}
function normalizeConditions(values=[]){
  if(!Array.isArray(values))return null;
  const out=[];
  for(const value of values){
    const id=conditionId(value);
    if(!id)return null;
    if(!out.includes(id))out.push(id);
  }
  return out;
}
function testFamily(value){
  const normalized=key(value);
  return ["NATURE","WILL","HEALTH","SKILL","RESOURCES","CIRCLES"].includes(normalized)?normalized:null;
}

export function tb2eConditionShadowStatus(){
  return freezeTb2e({
    phase:"M10D.8",mode:"TB2E_CONDITIONS_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:CONDITION_ROW?.status??"PARTIAL",coreSourceClassification:"VERIFIED",
    sourceEvidence:"Scholar's Guide Conditions 39-57; full-core reconciliation M10D.18 P1",coreReconciliationPhase:"M10D.18_P1",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    conditionMutationAllowed:false,effectMutationAllowed:false,deathMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    unresolvedSourceConflicts:[],coreReconciledFindings:["CONDITIONS_HUNGRY_EXHAUSTED_DISPOSITION_MINUS_1S"],
    boundaries:[
      "NO_LIVE_CONDITION_APPLICATION_OR_REMOVAL",
      "CONFLICT_DISPOSITION_CORE_RULE_RESOLVED_READ_ONLY_NO_LIVE_MUTATION",
      "DEAD_HAS_ORDER_PLACEMENT_ONLY_IN_SUPPLIED_CONDITION_SUMMARY",
      "EXHAUSTED_RECOVERY_PHASE_TEXT_QR44_PRESERVED_AS_CAMP_TEST_UNRESOLVED",
      "FULL_RECOVERY_EXECUTION_DEFERRED_TO_RECOVERY_DOMAIN"
    ],
    nextStep:"Continue full-core Conditions re-audit; disposition penalty ambiguity is resolved by Scholar's Guide while live mutation remains disabled"
  });
}

export function tb2eConditionModel(){
  return freezeTb2e({
    phase:"M10D.8",profileId:PROFILE_ID,
    conditionIds:CONDITION_IDS,
    grind:{newConditionEveryTurns:4,order:GRIND_ORDER},
    recovery:{order:RECOVERY_ORDER,executionAuthority:"DEFER_TO_M10D_RECOVERY_DOMAIN"},
    conditions:{
      FRESH:{testDice:+1,exceptTests:["RESOURCES","CIRCLES"]},
      HUNGRY_THIRSTY:{conflictDisposition:"-1s_TEAM_DISPOSITION_ONCE",recoverySummary:"FOOD_DRINK_OR_SOURCE_APPROPRIATE_RECOVERY"},
      EXHAUSTED:{freeInstinct:false,freeInstinctTurnCost:1,freeInstinctObstacleModifier:+1,conflictDisposition:"-1s_TEAM_DISPOSITION_ONCE",recoveryReference:{ability:"HEALTH",obstacle:3,phaseText:"CAMP_TEST",phaseResolved:false}},
      ANGRY:{beneficialTraitsAllowed:false,beneficialWisesAllowed:false,precisionOrSocialObstacleGuidance:+1,recoveryExcludedFromGuidance:true,recoveryReference:{ability:"WILL",obstacle:2,phases:["CAMP","TOWN"]}},
      SICK:{diceModifier:{NATURE:-1,WILL:-1,HEALTH:-1,SKILL:-1},stacksWith:"INJURED",practiceAllowed:false,mentorLearningAllowed:false,advancementLoggingAllowed:false,recoveryReference:{ability:"WILL",obstacle:3,phases:["CAMP","TOWN"]}},
      INJURED:{diceModifier:{NATURE:-1,WILL:-1,HEALTH:-1,SKILL:-1},stacksWith:"SICK",recoveryReference:{ability:"HEALTH",obstacle:4,phases:["CAMP","TOWN"]}},
      AFRAID:{helpAllowed:false,beginnersLuckAllowed:false,natureFallbackForUnlearnedSkills:true,recoveryReference:{ability:"WILL",obstacle:3,phases:["CAMP","TOWN"]}},
      DEAD:{detailsAuthority:"SOURCE_INCOMPLETE_ORDER_PLACEMENT_ONLY"}
    },
    zeroRatingRule:{
      appliesTo:"SKILL_OR_ABILITY_REDUCED_TO_ZERO_BY_CONDITIONS",
      blocked:["TEST","BENEFIT_FROM","GRANT_HELP","SPEND_PERSONA_ON"],
      natureFallbackAvailable:true
    },
    conflictDispositionBoundary:{
      status:"CORE_RESOLVED",
      authority:"SCHOLARS_GUIDE_CONDITIONS_IN_CONFLICT",
      successPenalties:{HUNGRY_THIRSTY:"-1s_ONCE_PER_TEAM",EXHAUSTED:"-1s_ONCE_PER_TEAM"},
      dicePenalties:{INJURED:"-1D_PER_CHARACTER",SICK:"-1D_PER_CHARACTER"},
      automation:false
    },
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConditionInfo(name){
  const id=conditionId(name);
  if(!id)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION",{conditionName:String(name??"")});
  return freezeTb2e({
    ok:true,phase:"M10D.8",profileId:PROFILE_ID,condition:id,
    ...tb2eConditionModel().conditions[id],liveApplication:false,writesPlanned:0
  });
}

export function tb2eConditionTestEffectPlan({
  conditions=[],
  test="SKILL",
  isRecovery=false,
  precisionOrSocial=false
}={}){
  const active=normalizeConditions(conditions);
  if(!active)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION_IN_SET",{conditions});
  const family=testFamily(test);
  if(!family)return blocked("UNSUPPORTED_TEST_FAMILY",{test});
  let diceModifier=0;
  const components=[];
  if(active.includes("FRESH")&&!["RESOURCES","CIRCLES"].includes(family)){
    diceModifier+=1;components.push({condition:"FRESH",kind:"DICE",value:+1});
  }
  for(const condition of ["INJURED","SICK"]){
    if(active.includes(condition)&&["NATURE","WILL","HEALTH","SKILL"].includes(family)){
      diceModifier-=1;components.push({condition,kind:"DICE",value:-1});
    }
  }
  const angryGuidance=active.includes("ANGRY")&&Boolean(precisionOrSocial)&&!Boolean(isRecovery);
  return freezeTb2e({
    ok:true,phase:"M10D.8",profileId:PROFILE_ID,mode:"CONDITION_TEST_EFFECT_SHADOW",
    conditions:active,testFamily:family,diceModifier,components,
    obstacleModifierAutomated:0,
    angryObstacleGuidance:angryGuidance?{value:+1,automation:"GM_DISCRETION"}:null,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConditionCapabilityPlan({
  conditions=[],
  capability=""
}={}){
  const active=normalizeConditions(conditions);
  if(!active)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION_IN_SET",{conditions});
  const cap=key(capability);
  const known=["BENEFICIAL_TRAIT","BENEFICIAL_WISE","HELP","BEGINNERS_LUCK","PRACTICE","MENTOR_LEARNING","ADVANCEMENT_LOGGING","FREE_INSTINCT"];
  if(!known.includes(cap))return blocked("UNKNOWN_CAPABILITY",{capability:cap});
  let allowed=true;
  let reasonCode=null;
  const details={};
  if(active.includes("ANGRY")&&cap==="BENEFICIAL_TRAIT"){allowed=false;reasonCode="ANGRY_BLOCKS_BENEFICIAL_TRAITS";}
  if(active.includes("ANGRY")&&cap==="BENEFICIAL_WISE"){allowed=false;reasonCode="ANGRY_BLOCKS_BENEFICIAL_WISES";}
  if(active.includes("AFRAID")&&cap==="HELP"){allowed=false;reasonCode="AFRAID_BLOCKS_HELP";}
  if(active.includes("AFRAID")&&cap==="BEGINNERS_LUCK"){allowed=false;reasonCode="AFRAID_BLOCKS_BEGINNERS_LUCK";details.natureFallbackForUnlearnedSkills=true;}
  if(active.includes("SICK")&&cap==="PRACTICE"){allowed=false;reasonCode="SICK_BLOCKS_PRACTICE";}
  if(active.includes("SICK")&&cap==="MENTOR_LEARNING"){allowed=false;reasonCode="SICK_BLOCKS_MENTOR_LEARNING";}
  if(active.includes("SICK")&&cap==="ADVANCEMENT_LOGGING"){allowed=false;reasonCode="SICK_BLOCKS_ADVANCEMENT_LOGGING";}
  if(active.includes("EXHAUSTED")&&cap==="FREE_INSTINCT"){
    allowed=false;reasonCode="EXHAUSTED_REMOVES_FREE_INSTINCT";details.turnCost=1;details.obstacleModifier=+1;
  }
  return freezeTb2e({
    ok:true,phase:"M10D.8",profileId:PROFILE_ID,mode:"CONDITION_CAPABILITY_SHADOW",
    conditions:active,capability:cap,allowed,reasonCode,...details,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConditionZeroRatingPlan({
  ratingAfterConditions=1,
  target="SKILL"
}={}){
  if(!Number.isInteger(Number(ratingAfterConditions))||Number(ratingAfterConditions)<0)return blocked("INVALID_POST_CONDITION_RATING",{ratingAfterConditions});
  const family=testFamily(target);
  if(!family||["RESOURCES","CIRCLES"].includes(family))return blocked("ZERO_RATING_RULE_REQUIRES_SKILL_OR_APPLICABLE_ABILITY",{target});
  const atZero=Number(ratingAfterConditions)===0;
  return freezeTb2e({
    ok:true,phase:"M10D.8",profileId:PROFILE_ID,mode:"CONDITION_ZERO_RATING_SHADOW",
    target:family,ratingAfterConditions:Number(ratingAfterConditions),atZero,
    mayTest:!atZero,mayBenefitFrom:!atZero,mayGrantHelp:!atZero,maySpendPersonaOn:!atZero,
    natureFallbackAvailable:atZero,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConflictDispositionConditionPlan({conditions=[]}={}){
  const active=normalizeConditions(conditions);
  if(!active)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION_IN_SET",{conditions});
  const relevant=active.filter(id=>["HUNGRY_THIRSTY","EXHAUSTED","INJURED","SICK"].includes(id));
  const successPenalty=(active.includes("HUNGRY_THIRSTY")?-1:0)+(active.includes("EXHAUSTED")?-1:0);
  const dicePenalty=(active.includes("INJURED")?-1:0)+(active.includes("SICK")?-1:0);
  const components=[
    ...(active.includes("HUNGRY_THIRSTY")?[{condition:"HUNGRY_THIRSTY",kind:"SUCCESSES",value:-1,scope:"TEAM_ONCE"}]:[]),
    ...(active.includes("EXHAUSTED")?[{condition:"EXHAUSTED",kind:"SUCCESSES",value:-1,scope:"TEAM_ONCE"}]:[]),
    ...(active.includes("INJURED")?[{condition:"INJURED",kind:"DICE",value:-1,scope:"AFFECTED_CHARACTER"}]:[]),
    ...(active.includes("SICK")?[{condition:"SICK",kind:"DICE",value:-1,scope:"AFFECTED_CHARACTER"}]:[])
  ];
  return freezeTb2e({
    ok:true,phase:"M10D.8",profileId:PROFILE_ID,mode:"CONFLICT_DISPOSITION_CONDITION_BOUNDARY",
    conditions:active,relevantConditions:relevant,
    resolution:"CORE_RESOLVED",authority:"SCHOLARS_GUIDE_CONDITIONS_IN_CONFLICT",automation:false,
    successPenalty,dicePenalty,components,
    teamSuccessPenaltyRules:{HUNGRY_THIRSTY:"-1s_ONCE",EXHAUSTED:"-1s_ONCE"},
    characterDicePenaltyRules:{INJURED:"-1D",SICK:"-1D"},
    chosenPenalty:{successes:successPenalty,dice:dicePenalty},
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConditionDeathRiskPlan({
  conditions=[],
  testInvolvesSeriousHarm=false,
  testInvolvesSicknessDiseasePoisonMadnessOrGrief=false
}={}){
  const active=normalizeConditions(conditions);
  if(!active)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION_IN_SET",{conditions});
  const injuredRisk=active.includes("INJURED")&&Boolean(testInvolvesSeriousHarm);
  const sickRisk=active.includes("SICK")&&Boolean(testInvolvesSicknessDiseasePoisonMadnessOrGrief);
  return freezeTb2e({
    ok:true,phase:"M10D.8",profileId:PROFILE_ID,mode:"CONDITION_DEATH_RISK_GUIDANCE",
    conditions:active,
    injuredSeriousHarm:{applies:injuredRisk,onFailedTest:"MAY_RESULT_IN_DEATH",warnPlayerBeforehand:injuredRisk,automation:false},
    sickRelevantThreat:{applies:sickRisk,nextCondition:"DEAD",warnPlayerBeforehand:sickRisk,automation:false},
    deathMutationCommitted:false,conditionMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
