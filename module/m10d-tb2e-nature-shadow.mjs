import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const NATURE_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="nature");

const STOCK_DESCRIPTORS=freezeTb2e({
  dwarf:["Delving","Crafting","Avenging Grudges"],
  elf:["Singing","Remembering","Hiding"],
  halfling:["Sneaking","Riddling","Merrymaking"],
  human:["Boasting","Demanding","Running"]
});

function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.5",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}
function rating(value){return Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<=7;}
function margin(value){return Number.isInteger(Number(value))&&Number(value)>=0;}
function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
function taxPreview({currentNature,maximumNature,tax}){
  const nextCurrent=clamp(Number(currentNature)-Number(tax),0,Number(maximumNature));
  return {taxAmount:Number(tax),currentBefore:Number(currentNature),maximumBefore:Number(maximumNature),currentAfter:nextCurrent,maximumAfter:Number(maximumNature)};
}

export function tb2eNatureShadowStatus(){
  return freezeTb2e({
    phase:"M10D.5",mode:"TB2E_NATURE_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:NATURE_ROW?.status??"PARTIAL",
    sourceEvidence:NATURE_ROW?.evidence??"QR 14-18, 76, 99; CC 26-30",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    actorMutationAllowed:false,itemMutationAllowed:false,traitMutationAllowed:false,advancementMutationAllowed:false,resourceSpendAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "CURRENT_AND_MAXIMUM_NATURE_REMAIN_SEPARATE",
      "NO_AUTOMATIC_RETIREMENT",
      "NO_AUTOMATIC_TRAIT_CHANGE_ON_NATURE_LOSS",
      "NO_AUTOMATIC_ADVANCEMENT_RESET_OR_WRITE",
      "NO_STOCK_INFERENCE_FROM_EXISTING_ACTORS"
    ],
    nextStep:"Verify source-bounded TB2E Nature shadow plans; no live Nature authority is authorized"
  });
}

export function tb2eNatureModel(){
  return freezeTb2e({
    phase:"M10D.5",profileId:PROFILE_ID,
    ratingRange:{min:0,max:7},startingNatureGuide:3,
    currentMaximumSeparated:true,descriptorCountGuide:3,
    stockDescriptors:STOCK_DESCRIPTORS,
    directWithinDescriptorPenalty:"NONE",
    substitutionUsesCurrentNature:true,
    channel:{resource:"PERSONA",amount:1,addsCurrentNatureDice:true,blockedTests:["RESOURCES","CIRCLES"]},
    advancementBasis:"MAXIMUM_NATURE",
    upperRetirementBoundary:{rating:7,timing:"END_OF_SESSION",automation:"MANUAL_CONFIRMATION"},
    lowerRetirementBoundary:{maximumAfterNatureLoss:0,timing:"END_OF_CURRENT_ADVENTURE_PHASE",automation:"MANUAL_CONFIRMATION"},
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eNatureSubstitutionPlan({
  currentNature=0,
  maximumNature=0,
  descriptorApplies=false,
  targetSkillUnavailable=false,
  targetSkillRatingZero=false
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  if(!targetSkillUnavailable&&!targetSkillRatingZero) return blocked("NATURE_SUBSTITUTION_REQUIRES_UNAVAILABLE_OR_ZERO_SKILL");
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"NATURE_SUBSTITUTION_SHADOW",
    currentNature:Number(currentNature),maximumNature:Number(maximumNature),dice:Number(currentNature),
    descriptorApplies:Boolean(descriptorApplies),
    targetSkillState:targetSkillUnavailable?"UNAVAILABLE":"RATING_ZERO",
    onPassTax:{kind:"NONE",amount:0},
    onFailTax:Boolean(descriptorApplies)?{kind:"NONE",amount:0}:{kind:"MARGIN_OF_FAILURE",amount:"MARGIN_OF_FAILURE"},
    taxMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eNatureSubstitutionTaxPlan({
  currentNature=0,
  maximumNature=0,
  descriptorApplies=false,
  outcome="PASS",
  marginOfFailure=0
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  const result=String(outcome??"PASS").trim().toUpperCase();
  if(!["PASS","FAIL"].includes(result)) return blocked("INVALID_TEST_OUTCOME",{outcome});
  if(!margin(marginOfFailure)) return blocked("INVALID_MARGIN_OF_FAILURE",{marginOfFailure});
  const tax=Boolean(descriptorApplies)||result==="PASS"?0:Number(marginOfFailure);
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"NATURE_SUBSTITUTION_TAX_SHADOW",
    descriptorApplies:Boolean(descriptorApplies),outcome:result,marginOfFailure:Number(marginOfFailure),
    ...taxPreview({currentNature,maximumNature,tax}),taxMutationCommitted:false,
    zeroCurrentNatureRequiresLossProcedure:tax>0&&clamp(Number(currentNature)-tax,0,Number(maximumNature))===0,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eChannelNaturePlan({
  currentNature=0,
  maximumNature=0,
  testName="",
  descriptorApplies=false,
  personaAvailable=0
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  if(!Number.isInteger(Number(personaAvailable))||Number(personaAvailable)<0) return blocked("INVALID_PERSONA_AVAILABLE",{personaAvailable});
  const test=String(testName??"").trim().toUpperCase();
  if(["RESOURCES","CIRCLES"].includes(test)) return blocked("CHANNEL_NATURE_FORBIDDEN_TEST",{testName:test});
  if(Number(personaAvailable)<1) return blocked("INSUFFICIENT_PERSONA",{resourceCost:"PERSONA",resourceAmount:1});
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"CHANNEL_NATURE_SHADOW",
    currentNature:Number(currentNature),maximumNature:Number(maximumNature),testName:test||"UNSPECIFIED",
    descriptorApplies:Boolean(descriptorApplies),diceAdded:Number(currentNature),
    resourceCost:"PERSONA",resourceAmount:1,timing:"BEFORE_TEST_ROLL",
    onPassTax:Boolean(descriptorApplies)?{kind:"NONE",amount:0}:{kind:"FIXED",amount:1},
    onFailTax:Boolean(descriptorApplies)?{kind:"NONE",amount:0}:{kind:"MARGIN_OF_FAILURE",amount:"MARGIN_OF_FAILURE"},
    resourceSpendCommitted:false,taxMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eChannelNatureTaxPlan({
  currentNature=0,
  maximumNature=0,
  descriptorApplies=false,
  outcome="PASS",
  marginOfFailure=0
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  const result=String(outcome??"PASS").trim().toUpperCase();
  if(!["PASS","FAIL"].includes(result)) return blocked("INVALID_TEST_OUTCOME",{outcome});
  if(!margin(marginOfFailure)) return blocked("INVALID_MARGIN_OF_FAILURE",{marginOfFailure});
  const tax=Boolean(descriptorApplies)?0:(result==="PASS"?1:Number(marginOfFailure));
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"CHANNEL_NATURE_TAX_SHADOW",
    descriptorApplies:Boolean(descriptorApplies),outcome:result,marginOfFailure:Number(marginOfFailure),
    ...taxPreview({currentNature,maximumNature,tax}),taxMutationCommitted:false,
    zeroCurrentNatureRequiresLossProcedure:tax>0&&clamp(Number(currentNature)-tax,0,Number(maximumNature))===0,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eNatureRecoveryPlan({
  method="",
  currentNature=0,
  maximumNature=0,
  noConditions=false,
  deliveredPrologue=false,
  missedLastSession=false,
  passedLifestyle=false
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  const key=String(method??"").trim().toUpperCase();
  let nextCurrent=Number(currentNature),nextMaximum=Number(maximumNature),requirements=[],eligible=true;
  if(key==="RESPITE"){
    nextCurrent=nextMaximum;
  }else if(key==="PROLOGUE"){
    requirements=["DELIVERED_PROLOGUE","NO_CONDITIONS"];eligible=Boolean(deliveredPrologue)&&Boolean(noConditions);
    if(eligible) nextCurrent=Math.min(nextMaximum,nextCurrent+1);
  }else if(key==="MISSED_SESSION_RETURN"){
    requirements=["MISSED_LAST_SESSION"];eligible=Boolean(missedLastSession);
    if(eligible) nextCurrent=Math.min(nextMaximum,nextCurrent+1);
  }else if(key==="LEAVING_TOWN"){
    requirements=["NO_CONDITIONS","PASSED_LIFESTYLE"];eligible=Boolean(noConditions)&&Boolean(passedLifestyle);
    if(eligible) nextCurrent=Math.min(nextMaximum,nextCurrent+1);
  }else if(key==="CONSERVE"){
    if(nextMaximum<1)return blocked("CANNOT_CONSERVE_ZERO_MAXIMUM_NATURE");
    nextMaximum-=1;nextCurrent=nextMaximum;requirements=["VOLUNTARY_MAXIMUM_REDUCTION"];
  }else return blocked("UNKNOWN_NATURE_RECOVERY_METHOD",{method:key});

  if(!eligible)return blocked("NATURE_RECOVERY_REQUIREMENTS_NOT_MET",{method:key,requirements});
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"NATURE_RECOVERY_SHADOW",method:key,requirements,
    currentBefore:Number(currentNature),maximumBefore:Number(maximumNature),currentAfter:nextCurrent,maximumAfter:nextMaximum,
    maximumReduction:key==="CONSERVE"?1:0,traitChangeRequired:false,
    mutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eNatureLossPlan({
  currentNature=0,
  maximumNature=0,
  reachedZeroDueToTax=false
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  if(Number(currentNature)!==0||!Boolean(reachedZeroDueToTax)) return blocked("NATURE_LOSS_REQUIRES_ZERO_CURRENT_FROM_TAX");
  const nextMaximum=Math.max(0,Number(maximumNature)-1);
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"NATURE_LOSS_SHADOW",
    currentBefore:0,maximumBefore:Number(maximumNature),maximumAfter:nextMaximum,currentAfter:nextMaximum,
    changeOneNonClassTrait:true,traitLevelUnchanged:true,eraseTax:true,eraseNatureAdvancement:true,
    retirementRequired:nextMaximum===0,retirementTiming:nextMaximum===0?"END_OF_CURRENT_ADVENTURE_PHASE":null,
    traitMutationCommitted:false,natureMutationCommitted:false,advancementMutationCommitted:false,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eNatureAdvancementPlan({
  currentNature=0,
  maximumNature=0,
  advancementTriggered=false
}={}){
  if(!rating(currentNature)||!rating(maximumNature)||Number(currentNature)>Number(maximumNature)) return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  if(!Boolean(advancementTriggered)) return blocked("ADVANCEMENT_NOT_TRIGGERED");
  if(Number(maximumNature)>=7) return blocked("MAXIMUM_NATURE_AT_CAP",{maximumNature});
  const taxDifference=Number(maximumNature)-Number(currentNature);
  return freezeTb2e({
    ok:true,phase:"M10D.5",profileId:PROFILE_ID,mode:"NATURE_ADVANCEMENT_SHADOW",
    advancementBasis:"MAXIMUM_NATURE",currentBefore:Number(currentNature),maximumBefore:Number(maximumNature),
    currentAfter:Number(currentNature)+1,maximumAfter:Number(maximumNature)+1,taxDifferenceBefore:taxDifference,taxDifferenceAfter:taxDifference,
    retirementCheckRequired:Number(maximumNature)+1===7,retirementTiming:Number(maximumNature)+1===7?"END_OF_SESSION":null,
    mutationCommitted:false,advancementResetCommitted:false,liveApplication:false,writesPlanned:0
  });
}
