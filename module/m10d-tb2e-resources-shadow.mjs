import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const RESOURCE_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="resources");

function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.7",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}
function nonNegativeInteger(value){return Number.isInteger(Number(value))&&Number(value)>=0;}
function rating(value){return Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<=10;}
function upper(value){return String(value??"").trim().toUpperCase();}

export function tb2eResourceShadowStatus(){
  return freezeTb2e({
    phase:"M10D.7",mode:"TB2E_FATE_PERSONA_RESOURCES_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:RESOURCE_ROW?.status??"PARTIAL",
    sourceEvidence:RESOURCE_ROW?.evidence??"QR 12, 72-76, 97-98",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    resourceSpendAllowed:false,resourceAwardAllowed:false,resourcesTaxMutationAllowed:false,advancementMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_LIVE_FATE_OR_PERSONA_SPEND",
      "NO_LIVE_END_SESSION_AWARD_WRITE",
      "NO_LIVE_RESOURCES_TAX_OR_TREASURE_CONSUMPTION",
      "NO_DG148_SHOPPING_OBSTACLE_TABLES",
      "LEVEL_THRESHOLDS_DEFER_TO_ADVANCEMENT_DOMAIN",
      "LIFESTYLE_FAILURE_CHOICE_REMAINS_GM_ADJUDICATION"
    ],
    nextStep:"Verify source-bounded Fate/Persona awards and spend plans plus Resources pool/tax/lifestyle previews only"
  });
}

export function tb2eResourceModel(){
  return freezeTb2e({
    phase:"M10D.7",profileId:PROFILE_ID,
    fatePersona:{
      earnedTiming:"END_OF_SESSION",
      uses:["WISE_ACTIVATION","DICE_MODIFICATION"],
      spentTowardLeveling:true,
      levelThresholdAuthority:"DEFER_TO_ADVANCEMENT_DOMAIN"
    },
    fate:{
      spends:{
        LUCK:{cost:1,timing:"AFTER_TEST_ROLL",effect:"ONE_NEW_DIE_PER_SIX_RECURSIVE"},
        DEEPER_UNDERSTANDING:{cost:1,timing:"AFTER_TEST_ROLL",effect:"REROLL_ONE_FAILED_DIE_RELATED_TO_WISE"},
        SYNERGY:{cost:1,timing:"BEFORE_HELPED_TEST",effect:"HELPER_ADVANCEMENT_MARK_FROM_RESOLVED_RESULT"}
      }
    },
    persona:{
      spends:{
        ADVANTAGE:{min:1,max:3,timing:"BEFORE_TEST_ROLL",effect:"+1D_PER_PERSONA"},
        CHANNEL_NATURE:{cost:1,timing:"BEFORE_TEST_ROLL",effect:"ADD_CURRENT_NATURE_DICE",blockedTests:["RESOURCES","CIRCLES"]},
        AH_OF_COURSE:{cost:1,timing:"AFTER_TEST_ROLL",effect:"REROLL_ALL_FAILED_DICE_RELATED_TO_WISE"}
      }
    },
    resources:{
      ratingRange:{min:0,max:10},hometownBonusDice:1,beginnersLuckAllowed:false,
      treasureDiceAdded:true,treasureTaxInsulation:true,
      failureTax:"MARGIN_OF_FAILURE_AFTER_TREASURE_INSULATION",
      obstacleAuthority:"UNAVAILABLE_DG148_CALLER_SUPPLIED_ONLY"
    },
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eEndSessionAwardPlan({
  actingOnBelief=false,
  playingAgainstBelief=false,
  workingTowardGoal=false,
  accomplishingGoal=false,
  benefitingFromInstinct=false,
  gallowsHumor=false,
  crisis=false,
  mvp=false,
  teamworker=false
}={}){
  if(actingOnBelief&&playingAgainstBelief)return blocked("BELIEF_REWARDS_DO_NOT_STACK");
  if(workingTowardGoal&&accomplishingGoal)return blocked("GOAL_REWARDS_DO_NOT_STACK");
  if(mvp&&teamworker)return blocked("MVP_AND_TEAMWORKER_MUST_BE_DIFFERENT_PLAYERS");
  const fateAwards=[];
  const personaAwards=[];
  if(actingOnBelief)fateAwards.push("ACTING_ON_BELIEF");
  if(workingTowardGoal)fateAwards.push("WORKING_TOWARD_GOAL");
  if(benefitingFromInstinct)fateAwards.push("BENEFITING_FROM_INSTINCT");
  if(gallowsHumor)fateAwards.push("GALLOWS_HUMOR");
  if(playingAgainstBelief)personaAwards.push("PLAYING_AGAINST_BELIEF");
  if(accomplishingGoal)personaAwards.push("ACCOMPLISHING_GOAL");
  if(crisis)personaAwards.push("CRISIS");
  if(mvp)personaAwards.push("MVP");
  if(teamworker)personaAwards.push("TEAMWORKER");
  return freezeTb2e({
    ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"END_SESSION_RESOURCE_AWARD_SHADOW",
    timing:"END_OF_SESSION",fateAwards,personaAwards,fateTotal:fateAwards.length,personaTotal:personaAwards.length,
    gallowsHumorAdjudication:gallowsHumor?"GM_DISCRETION_APPROVED_BY_CALLER":null,
    awardMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eFateSpendPlan({
  use="",
  fateAvailable=0,
  dice=[],
  wiseRelated=false,
  helpingAnotherPlayer=false,
  resolvedOutcome=null
}={}){
  if(!nonNegativeInteger(fateAvailable))return blocked("INVALID_FATE_AVAILABLE",{fateAvailable});
  if(Number(fateAvailable)<1)return blocked("INSUFFICIENT_FATE",{resourceCost:"FATE",resourceAmount:1});
  const key=upper(use);
  if(key==="LUCK"){
    if(!Array.isArray(dice)||dice.some(d=>!Number.isInteger(Number(d))||Number(d)<1||Number(d)>6))return blocked("INVALID_D6_RESULTS");
    const sixCount=dice.filter(d=>Number(d)===6).length;
    if(sixCount===0)return blocked("NO_SIXES");
    return freezeTb2e({
      ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"FATE_SPEND_SHADOW",use:key,
      resourceCost:"FATE",resourceAmount:1,timing:"AFTER_TEST_ROLL",sixCount,initialExtraDice:sixCount,
      recursiveOpenSixes:true,delegatedRuleAuthority:"M10D.4_TESTS_SHADOW",
      resourceSpendCommitted:false,randomRollExecuted:false,liveApplication:false,writesPlanned:0
    });
  }
  if(key==="DEEPER_UNDERSTANDING"){
    if(!wiseRelated)return blocked("WISE_RELATION_REQUIRED",{use:key});
    return freezeTb2e({
      ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"FATE_SPEND_SHADOW",use:key,
      resourceCost:"FATE",resourceAmount:1,timing:"AFTER_TEST_ROLL",
      rerollFailedDice:1,delegatedRuleAuthority:"M10D.2_WISES_SHADOW",
      resourceSpendCommitted:false,rerollExecuted:false,liveApplication:false,writesPlanned:0
    });
  }
  if(key==="SYNERGY"){
    if(!helpingAnotherPlayer)return blocked("SYNERGY_REQUIRES_HELPING_ANOTHER_PLAYER",{use:key});
    const result=resolvedOutcome===null?null:upper(resolvedOutcome);
    if(result!==null&&!["PASS","FAIL","TIE"].includes(result))return blocked("INVALID_RESOLVED_OUTCOME",{resolvedOutcome});
    return freezeTb2e({
      ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"FATE_SPEND_SHADOW",use:key,
      resourceCost:"FATE",resourceAmount:1,timing:"BEFORE_HELPED_TEST",
      advancementMark:result==="PASS"?"PASS":result==="FAIL"?"FAIL":null,
      tiePolicy:result==="TIE"?"RETRACT_FATE_OR_USE_TIEBREAKER":"NOT_APPLICABLE",
      resourceSpendCommitted:false,advancementMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  return blocked("UNKNOWN_FATE_USE",{use:key});
}

export function tb2ePersonaSpendPlan({
  use="",
  personaAvailable=0,
  amount=1,
  currentNature=0,
  testName="",
  wiseRelated=false,
  failedDiceCount=0
}={}){
  if(!nonNegativeInteger(personaAvailable))return blocked("INVALID_PERSONA_AVAILABLE",{personaAvailable});
  const key=upper(use);
  if(key==="ADVANTAGE"){
    if(!Number.isInteger(Number(amount))||Number(amount)<1||Number(amount)>3)return blocked("ADVANTAGE_PERSONA_AMOUNT_OUT_OF_RANGE",{amount});
    if(Number(personaAvailable)<Number(amount))return blocked("INSUFFICIENT_PERSONA",{resourceCost:"PERSONA",resourceAmount:Number(amount)});
    return freezeTb2e({
      ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"PERSONA_SPEND_SHADOW",use:key,
      resourceCost:"PERSONA",resourceAmount:Number(amount),timing:"BEFORE_TEST_ROLL",diceAdded:Number(amount),
      resourceSpendCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  if(key==="CHANNEL_NATURE"){
    if(Number(personaAvailable)<1)return blocked("INSUFFICIENT_PERSONA",{resourceCost:"PERSONA",resourceAmount:1});
    if(!Number.isInteger(Number(currentNature))||Number(currentNature)<0||Number(currentNature)>7)return blocked("INVALID_CURRENT_NATURE",{currentNature});
    const test=upper(testName);
    if(["RESOURCES","CIRCLES"].includes(test))return blocked("CHANNEL_NATURE_FORBIDDEN_TEST",{testName:test});
    return freezeTb2e({
      ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"PERSONA_SPEND_SHADOW",use:key,
      resourceCost:"PERSONA",resourceAmount:1,timing:"BEFORE_TEST_ROLL",diceAdded:Number(currentNature),
      delegatedRuleAuthority:"M10D.5_NATURE_SHADOW",
      resourceSpendCommitted:false,natureTaxMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  if(key==="AH_OF_COURSE"){
    if(Number(personaAvailable)<1)return blocked("INSUFFICIENT_PERSONA",{resourceCost:"PERSONA",resourceAmount:1});
    if(!wiseRelated)return blocked("WISE_RELATION_REQUIRED",{use:key});
    if(!nonNegativeInteger(failedDiceCount))return blocked("INVALID_FAILED_DICE_COUNT",{failedDiceCount});
    return freezeTb2e({
      ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"PERSONA_SPEND_SHADOW",use:key,
      resourceCost:"PERSONA",resourceAmount:1,timing:"AFTER_TEST_ROLL",extraDice:Number(failedDiceCount),
      delegatedRuleAuthority:"M10D.2_WISES_SHADOW",
      resourceSpendCommitted:false,rerollExecuted:false,liveApplication:false,writesPlanned:0
    });
  }
  return blocked("UNKNOWN_PERSONA_USE",{use:key});
}

export function tb2eResourcesTestPlan({
  rating:resourcesRating=0,
  obstacle=0,
  inHometown=false,
  treasureValue=0
}={}){
  if(!rating(resourcesRating))return blocked("INVALID_RESOURCES_RATING",{rating:resourcesRating});
  if(!nonNegativeInteger(obstacle))return blocked("INVALID_CALLER_SUPPLIED_OBSTACLE",{obstacle});
  if(!nonNegativeInteger(treasureValue))return blocked("INVALID_TREASURE_VALUE",{treasureValue});
  const hometownDice=inHometown?1:0;
  return freezeTb2e({
    ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"RESOURCES_TEST_SHADOW",
    rating:Number(resourcesRating),obstacle:Number(obstacle),obstacleAuthority:"CALLER_SUPPLIED_DG148_UNAVAILABLE",
    inHometown:Boolean(inHometown),hometownDice,treasureValue:Number(treasureValue),
    baseDice:Number(resourcesRating),finalDice:Number(resourcesRating)+hometownDice+Number(treasureValue),
    treasureTaxInsulation:Number(treasureValue),beginnersLuckAllowed:false,
    treasureConsumptionCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eResourcesTaxPlan({
  rating:resourcesRating=0,
  outcome="PASS",
  marginOfFailure=0,
  treasureValue=0
}={}){
  if(!rating(resourcesRating))return blocked("INVALID_RESOURCES_RATING",{rating:resourcesRating});
  const result=upper(outcome);
  if(!["PASS","FAIL"].includes(result))return blocked("INVALID_TEST_OUTCOME",{outcome});
  if(!nonNegativeInteger(marginOfFailure))return blocked("INVALID_MARGIN_OF_FAILURE",{marginOfFailure});
  if(!nonNegativeInteger(treasureValue))return blocked("INVALID_TREASURE_VALUE",{treasureValue});
  const baseTax=result==="FAIL"?Number(marginOfFailure):0;
  const insulation=Math.min(baseTax,Number(treasureValue));
  const finalTax=Math.max(0,baseTax-insulation);
  return freezeTb2e({
    ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"RESOURCES_TAX_SHADOW",
    outcome:result,ratingBefore:Number(resourcesRating),marginOfFailure:Number(marginOfFailure),
    baseTax,treasureTaxInsulation:Number(treasureValue),taxPrevented:insulation,finalTax,
    ratingAfter:Math.max(0,Number(resourcesRating)-finalTax),
    taxMutationCommitted:false,treasureConsumptionCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eLifestyleResourcesPlan({
  lifestyleCost=0,
  outcome=null,
  hasConditions=false,
  currentNature=0,
  maximumNature=0
}={}){
  if(!nonNegativeInteger(lifestyleCost))return blocked("INVALID_LIFESTYLE_COST",{lifestyleCost});
  if(!Number.isInteger(Number(currentNature))||!Number.isInteger(Number(maximumNature))||Number(currentNature)<0||Number(maximumNature)<0||Number(currentNature)>7||Number(maximumNature)>7||Number(currentNature)>Number(maximumNature))return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  const obstacle=Math.max(1,Number(lifestyleCost));
  const result=outcome===null?null:upper(outcome);
  if(result!==null&&!["PASS","FAIL"].includes(result))return blocked("INVALID_TEST_OUTCOME",{outcome});
  let passBenefit=null;
  if(result==="PASS"){
    if(hasConditions)passBenefit="NONE_CONDITIONS_PRESENT";
    else if(Number(currentNature)<Number(maximumNature))passBenefit="RECOVER_ONE_TAXED_NATURE";
    else passBenefit="BECOME_FRESH";
  }
  return freezeTb2e({
    ok:true,phase:"M10D.7",profileId:PROFILE_ID,mode:"LIFESTYLE_RESOURCES_SHADOW",
    lifestyleCost:Number(lifestyleCost),obstacle,minimumObstacle:1,outcome:result,
    hasConditions:Boolean(hasConditions),currentNature:Number(currentNature),maximumNature:Number(maximumNature),
    passBenefit,failureOptions:result==="FAIL"?["TWIST","CONDITION","TAX"]:[],
    failureAdjudication:result==="FAIL"?"GM_CHOICE_SOURCE_BOUNDARY":null,
    conditionMutationCommitted:false,natureRecoveryCommitted:false,resourcesTaxMutationCommitted:false,
    liveApplication:false,writesPlanned:0
  });
}
