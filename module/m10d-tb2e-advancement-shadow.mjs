import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const ADVANCEMENT_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="advancement");

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function nonNegativeInteger(value){return Number.isInteger(Number(value))&&Number(value)>=0;}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.11",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}
function capFor(kind){return ["RESOURCES","CIRCLES"].includes(kind)?10:6;}

export function tb2eAdvancementShadowStatus(){
  return freezeTb2e({
    phase:"M10D.11",mode:"TB2E_ADVANCEMENT_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:ADVANCEMENT_ROW?.status??"PARTIAL",
    sourceEvidence:ADVANCEMENT_ROW?.evidence??"QR 18-19, 99-101; CC 47",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    markMutationAllowed:false,ratingMutationAllowed:false,skillLearningMutationAllowed:false,levelMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_LIVE_PASS_FAIL_MARK_WRITE",
      "NO_LIVE_RATING_ADVANCEMENT_OR_RESET",
      "NO_LIVE_NEW_SKILL_CREATION",
      "NO_LIVE_RESOURCES_CIRCLES_ZERO_TO_ONE_WRITE",
      "LEVEL_THRESHOLD_TABLE_IS_VISUAL_AND_NOT_TRANSCRIBED",
      "CLASS_LEVEL_BENEFITS_DG113_PLUS_UNAVAILABLE",
      "COUNT_LIMIT_SCOPE_PRESERVES_GUIDE_WORDING_WITH_CALLER_SUPPLIED_ALREADY_COUNTED_STATE"
    ],
    nextStep:"Verify source-bounded Pass/Fail thresholds, count eligibility, Nature advancement, new-Skill learning, Resources/Circles 0-to-1 and level boundaries only"
  });
}

export function tb2eAdvancementModel(){
  return freezeTb2e({
    phase:"M10D.11",profileId:PROFILE_ID,
    standard:{
      passRequirement:"CURRENT_RATING",
      failRequirement:"CURRENT_RATING_MINUS_ONE",
      skillAbilityCap:6,
      resourcesCirclesCap:10,
      resetMarksAfter:["ADVANCEMENT","RATING_LOSS"]
    },
    countEligibility:{
      obstacleZeroCounts:false,
      versusCombatCounts:true,
      campTownMaxCountedTests:1,
      conflictOrSeriesMaxCountedTests:1,
      groupMixedOutcome:"PLAYER_CHOOSES_PASS_OR_FAIL",
      tieCountsOnlyIfBroken:true
    },
    nature:{
      thresholdBasis:"MAXIMUM_NATURE",
      onAdvance:{maximumDelta:1,currentDelta:1},
      delegatedRuleAuthority:"M10D.5_NATURE_SHADOW"
    },
    newSkills:{
      tracking:"BEGINNERS_LUCK_ATTEMPTS",
      threshold:"MAXIMUM_NATURE",
      learnedRating:2,
      delegatedRuleAuthority:"M10D.6_ABILITIES_SKILLS_SHADOW"
    },
    resourcesCirclesZeroToOne:{
      beginnersLuckAllowed:false,
      requiredPassedTests:1,
      allowedDiceSources:["REPUTATION","HOMETOWN_ADVANTAGE","CASH","LOOT","TREASURE"],
      delegatedRuleAuthority:"M10D.6_ABILITIES_SKILLS_SHADOW"
    },
    levels:{
      totalLevels:10,
      levelOneDefinesBaseMechanics:true,
      afterLevelOneBenefitChoiceCount:2,
      benefitChoiceReversible:false,
      progressionBasis:"CUMULATIVE_SPENT_FATE_AND_PERSONA",
      levelUpPhase:"TOWN_ONLY",
      thresholdTableAuthority:"VISUAL_TABLE_NOT_TRANSCRIBED",
      classBenefitsAuthority:"DG113_PLUS_UNAVAILABLE"
    },
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eAdvancementThresholdPlan({
  kind="SKILL",
  rating=1,
  passed=0,
  failed=0
}={}){
  const k=key(kind);
  if(!["SKILL","WILL","HEALTH","RESOURCES","CIRCLES"].includes(k))return blocked("UNKNOWN_ADVANCEMENT_KIND",{kind:k});
  if(!Number.isInteger(Number(rating))||Number(rating)<0||Number(rating)>capFor(k))return blocked("RATING_OUT_OF_RANGE",{kind:k,rating,cap:capFor(k)});
  if(!nonNegativeInteger(passed)||!nonNegativeInteger(failed))return blocked("INVALID_ADVANCEMENT_MARK_COUNT",{passed,failed});
  if(["SKILL","WILL","HEALTH"].includes(k)&&Number(rating)<1)return blocked("STANDARD_ADVANCEMENT_REQUIRES_RATING_AT_LEAST_ONE",{kind:k,rating});
  if(["RESOURCES","CIRCLES"].includes(k)&&Number(rating)===0)return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_THRESHOLD_SHADOW",
    kind:k,rating:0,route:"ZERO_TO_ONE_SPECIAL",beginnersLuckAllowed:false,
    requiredPassedTests:1,allowedDiceSources:["REPUTATION","HOMETOWN_ADVANTAGE","CASH","LOOT","TREASURE"],
    passed:Number(passed),failed:Number(failed),ready:Number(passed)>=1,advanceTo:Number(passed)>=1?1:0,
    markMutationCommitted:false,ratingMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
  const cap=capFor(k);
  const requiredPasses=Number(rating);
  const requiredFails=Math.max(0,Number(rating)-1);
  const atCap=Number(rating)>=cap;
  const ready=!atCap&&Number(passed)>=requiredPasses&&Number(failed)>=requiredFails;
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_THRESHOLD_SHADOW",
    kind:k,rating:Number(rating),route:"STANDARD",cap,requiredPasses,requiredFails,
    passed:Number(passed),failed:Number(failed),atCap,ready,advanceTo:ready?Number(rating)+1:Number(rating),
    eraseMarksOnAdvance:ready,
    markMutationCommitted:false,ratingMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eAdvancementMarkPlan({
  outcome="PASS",
  obstacle=1,
  versusCombat=false,
  context="ADVENTURE",
  alreadyCountedInContext=false,
  tieBroken=false,
  resolvedTieOutcome=null
}={}){
  const result=key(outcome);
  if(!["PASS","FAIL","TIE"].includes(result))return blocked("INVALID_TEST_OUTCOME",{outcome:result});
  if(!Number.isInteger(Number(obstacle))||Number(obstacle)<0)return blocked("INVALID_OBSTACLE",{obstacle});
  const ctx=key(context);
  if(!["ADVENTURE","CAMP","TOWN","CONFLICT","SERIES"].includes(ctx))return blocked("UNKNOWN_ADVANCEMENT_CONTEXT",{context:ctx});
  let mark=result;
  if(result==="TIE"){
    if(!tieBroken)return freezeTb2e({
      ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_MARK_SHADOW",
      outcome:result,context:ctx,count:false,mark:null,reasonCode:"UNBROKEN_TIE_DOES_NOT_COUNT",
      markMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
    const resolved=key(resolvedTieOutcome);
    if(!["PASS","FAIL"].includes(resolved))return blocked("BROKEN_TIE_REQUIRES_RESOLVED_PASS_OR_FAIL",{resolvedTieOutcome:resolved});
    mark=resolved;
  }
  if(Number(obstacle)===0&&!Boolean(versusCombat))return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_MARK_SHADOW",
    outcome:result,resolvedMark:mark,context:ctx,obstacle:0,versusCombat:false,
    count:false,mark:null,reasonCode:"OBSTACLE_ZERO_DOES_NOT_COUNT",
    markMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
  const limitedContext=["CAMP","TOWN","CONFLICT","SERIES"].includes(ctx);
  if(limitedContext&&Boolean(alreadyCountedInContext))return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_MARK_SHADOW",
    outcome:result,resolvedMark:mark,context:ctx,obstacle:Number(obstacle),versusCombat:Boolean(versusCombat),
    count:false,mark:null,reasonCode:"CONTEXT_COUNT_LIMIT_REACHED",
    contextLimit:1,scopeAuthority:"GUIDE_WORDING_CALLER_SUPPLIED_ALREADY_COUNTED_STATE",
    markMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_MARK_SHADOW",
    outcome:result,resolvedMark:mark,context:ctx,obstacle:Number(obstacle),versusCombat:Boolean(versusCombat),
    count:true,mark,reasonCode:null,
    contextLimit:limitedContext?1:null,
    markMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eGroupAdvancementChoicePlan({
  passedAgainst=0,
  failedAgainst=0,
  choice=""
}={}){
  if(!nonNegativeInteger(passedAgainst)||!nonNegativeInteger(failedAgainst))return blocked("INVALID_GROUP_RESULT_COUNT",{passedAgainst,failedAgainst});
  const hasPass=Number(passedAgainst)>0;
  const hasFail=Number(failedAgainst)>0;
  if(!hasPass&&!hasFail)return blocked("GROUP_TEST_HAS_NO_RESOLVED_RESULTS");
  const requested=key(choice);
  if(hasPass&&hasFail){
    if(!["PASS","FAIL"].includes(requested))return blocked("MIXED_GROUP_TEST_REQUIRES_PASS_OR_FAIL_CHOICE",{choice:requested});
    return freezeTb2e({
      ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"GROUP_ADVANCEMENT_CHOICE_SHADOW",
      passedAgainst:Number(passedAgainst),failedAgainst:Number(failedAgainst),mixed:true,chosenMark:requested,
      markMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"GROUP_ADVANCEMENT_CHOICE_SHADOW",
    passedAgainst:Number(passedAgainst),failedAgainst:Number(failedAgainst),mixed:false,chosenMark:hasPass?"PASS":"FAIL",
    markMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eNatureAdvancementShadowPlan({
  currentNature=0,
  maximumNature=0,
  passed=0,
  failed=0
}={}){
  if(!Number.isInteger(Number(currentNature))||!Number.isInteger(Number(maximumNature))||Number(currentNature)<0||Number(maximumNature)<0||Number(currentNature)>Number(maximumNature)||Number(maximumNature)>7)return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  if(!nonNegativeInteger(passed)||!nonNegativeInteger(failed))return blocked("INVALID_ADVANCEMENT_MARK_COUNT",{passed,failed});
  const basis=Number(maximumNature);
  if(basis===0)return blocked("MAXIMUM_NATURE_ZERO_RETIREMENT_BOUNDARY");
  const requiredPasses=basis;
  const requiredFails=Math.max(0,basis-1);
  const atCap=basis>=7;
  const ready=!atCap&&Number(passed)>=requiredPasses&&Number(failed)>=requiredFails;
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"NATURE_ADVANCEMENT_SHADOW",
    thresholdBasis:"MAXIMUM_NATURE",currentBefore:Number(currentNature),maximumBefore:basis,
    requiredPasses,requiredFails,passed:Number(passed),failed:Number(failed),atCap,ready,
    currentAfter:ready?Number(currentNature)+1:Number(currentNature),
    maximumAfter:ready?basis+1:basis,
    taxBefore:basis-Number(currentNature),
    taxAfter:ready?(basis+1)-(Number(currentNature)+1):basis-Number(currentNature),
    eraseMarksOnAdvance:ready,retirementCheck:ready&&basis+1===7?"END_OF_SESSION":null,
    delegatedRuleAuthority:"M10D.5_NATURE_SHADOW",
    markMutationCommitted:false,natureMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eNewSkillLearningAdvancementPlan({
  attempts=0,
  maximumNature=1,
  alreadyKnown=false
}={}){
  if(!nonNegativeInteger(attempts))return blocked("INVALID_BEGINNERS_LUCK_ATTEMPTS",{attempts});
  if(!Number.isInteger(Number(maximumNature))||Number(maximumNature)<1||Number(maximumNature)>7)return blocked("INVALID_MAXIMUM_NATURE_FOR_LEARNING",{maximumNature});
  if(alreadyKnown)return blocked("SKILL_ALREADY_KNOWN");
  const requiredAttempts=Number(maximumNature);
  const ready=Number(attempts)>=requiredAttempts;
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"NEW_SKILL_LEARNING_ADVANCEMENT_SHADOW",
    tracking:"BEGINNERS_LUCK_ATTEMPTS",attempts:Number(attempts),requiredAttempts,maximumNature:Number(maximumNature),
    ready,learnedRating:ready?2:null,eraseLearningMarksOnLearn:ready,
    delegatedRuleAuthority:"M10D.6_ABILITIES_SKILLS_SHADOW",
    skillCreationCommitted:false,learningMarkMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eResourcesCirclesZeroToOnePlan({
  kind="RESOURCES",
  passedTests=0,
  diceSources=[]
}={}){
  const k=key(kind);
  if(!["RESOURCES","CIRCLES"].includes(k))return blocked("ZERO_TO_ONE_ONLY_FOR_RESOURCES_OR_CIRCLES",{kind:k});
  if(!nonNegativeInteger(passedTests))return blocked("INVALID_PASSED_TEST_COUNT",{passedTests});
  if(!Array.isArray(diceSources))return blocked("INVALID_DICE_SOURCES");
  const allowed=["REPUTATION","HOMETOWN_ADVANTAGE","CASH","LOOT","TREASURE"];
  const normalized=[...new Set(diceSources.map(key))];
  const invalid=normalized.filter(source=>!allowed.includes(source));
  if(invalid.length)return blocked("UNSUPPORTED_ZERO_TO_ONE_DICE_SOURCE",{invalidDiceSources:invalid});
  const hasSource=normalized.length>0;
  const ready=hasSource&&Number(passedTests)>=1;
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"RESOURCES_CIRCLES_ZERO_TO_ONE_SHADOW",
    kind:k,beginnersLuckAllowed:false,allowedDiceSources:allowed,diceSources:normalized,
    passedTests:Number(passedTests),requiredPassedTests:1,hasSource,ready,advanceTo:ready?1:0,
    delegatedRuleAuthority:"M10D.6_ABILITIES_SKILLS_SHADOW",
    markMutationCommitted:false,ratingMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eAdvancementResetPlan({reason="ADVANCEMENT"}={}){
  const r=key(reason);
  if(!["ADVANCEMENT","RATING_LOSS"].includes(r))return blocked("UNKNOWN_ADVANCEMENT_RESET_REASON",{reason:r});
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"ADVANCEMENT_RESET_SHADOW",
    reason:r,erasePassedTests:true,eraseFailedTests:true,
    markMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eLevelProgressionBoundaryPlan({
  currentLevel=1,
  inTown=false,
  spentFate=0,
  spentPersona=0
}={}){
  if(!Number.isInteger(Number(currentLevel))||Number(currentLevel)<1||Number(currentLevel)>10)return blocked("INVALID_CLASS_LEVEL",{currentLevel});
  if(!nonNegativeInteger(spentFate)||!nonNegativeInteger(spentPersona))return blocked("INVALID_SPENT_RESOURCE_COUNT",{spentFate,spentPersona});
  return freezeTb2e({
    ok:true,phase:"M10D.11",profileId:PROFILE_ID,mode:"LEVEL_PROGRESSION_BOUNDARY_SHADOW",
    currentLevel:Number(currentLevel),maximumLevel:10,inTown:Boolean(inTown),
    cumulativeSpentFate:Number(spentFate),cumulativeSpentPersona:Number(spentPersona),
    progressionBasis:"CUMULATIVE_SPENT_FATE_AND_PERSONA",levelUpPhase:"TOWN_ONLY",
    afterLevelOneBenefitChoiceCount:2,benefitChoiceReversible:false,
    thresholdTableAuthority:"VISUAL_TABLE_NOT_TRANSCRIBED",
    exactNextThreshold:null,eligibleForExactLevelUp:null,
    classBenefitsAuthority:"DG113_PLUS_UNAVAILABLE",
    levelMutationCommitted:false,benefitChoiceMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
