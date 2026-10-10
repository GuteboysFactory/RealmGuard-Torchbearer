import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const HELP_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="help");

function norm(value){return String(value??"").trim().toLowerCase();}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.3",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

export function tb2eHelpShadowStatus(){
  return freezeTb2e({
    phase:"M10D.3",mode:"TB2E_HELP_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:HELP_ROW?.status??"PARTIAL",coreSourceClassification:"VERIFIED",coreReconciliationPhase:"M10D.18_P1",sourceEvidence:HELP_ROW?.evidence??"QR 5, 7, 59-60, 99; CC 5, 45",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    actorMutationAllowed:false,itemMutationAllowed:false,conditionMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_FULL_SUGGESTED_HELP_SKILL_CATALOGUE",
      "NO_TOWN_RECOVERY_OR_TOWN_RESOURCES_HELP",
      "WISE_AID_IS_SEPARATE_ROUTE",
      "NO_AUTOMATIC_HELPER_CONSEQUENCE_WRITES"
    ],
    nextStep:"Verify source-bounded TB2E Help shadow plans; no live teamwork authority is authorized"
  });
}

export function tb2eHelpPlan({
  sourceKind="",
  sourceName="",
  testName="",
  sameSkill=false,
  suggestedHelpSkill=false,
  relevantNatureDescriptor=false,
  phase="ADVENTURE",
  context="TEST",
  actingOnInstinct=false,
  helperActingOnInstinct=false,
  payingTownBills=false
}={}){
  const kind=norm(sourceKind);
  const source=norm(sourceName);
  const test=norm(testName);
  const phaseKey=String(phase??"ADVENTURE").trim().toUpperCase();
  const contextKey=String(context??"TEST").trim().toUpperCase();

  if(kind==="wise") return blocked("USE_WISE_AID_ROUTE",{route:"TB2E_WISE_AID",sourceKind:"WISE"});
  if(contextKey==="RECOVERY" && ["will","health"].includes(test)){
    return blocked("RECOVERY_HELP_FORBIDDEN",{phaseContext:phaseKey,testContext:contextKey,testName:String(testName??"")});
  }
  const townBills=Boolean(payingTownBills)||["PAY_BILLS","LIFESTYLE_EXIT"].includes(contextKey);
  if(test==="resources" && townBills){
    return blocked("TOWN_BILLS_HELP_FORBIDDEN",{phaseContext:phaseKey,testContext:contextKey,testName:String(testName??""),payingTownBills:true});
  }

  let eligibility="NONE";
  if(Boolean(actingOnInstinct)){
    if(Boolean(helperActingOnInstinct)) eligibility="HELPER_ALSO_ACTING_ON_INSTINCT";
    else if(kind==="nature" && Boolean(relevantNatureDescriptor)) eligibility="RELEVANT_NATURE_DESCRIPTOR_ON_INSTINCT";
    else return blocked("INSTINCT_HELP_SOURCE_NOT_ELIGIBLE",{phaseContext:phaseKey,testContext:contextKey});
  } else if(Boolean(sameSkill)) eligibility="SAME_SKILL";
  else if(Boolean(suggestedHelpSkill)) eligibility="SUGGESTED_HELP_SKILL";
  else if(["will","health","resources","circles"].includes(test)) eligibility="ABILITY_ANYONE_CAN_HELP";
  else if((kind==="nature" || test==="nature") && Boolean(relevantNatureDescriptor)) eligibility="RELEVANT_NATURE_DESCRIPTOR";
  else return blocked("HELP_SOURCE_NOT_ESTABLISHED",{sourceKind:String(sourceKind??""),sourceName:String(sourceName??""),testName:String(testName??"")});

  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"TEAMWORK",dice:1,
    eligibility,sourceKind:String(sourceKind??"").toUpperCase(),sourceName:String(sourceName??""),
    testName:String(testName??""),phaseContext:phaseKey,testContext:contextKey,payingTownBills:Boolean(payingTownBills),
    helperConditionRisk:true,wiseAid:false,resourceCost:"NONE",
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eBeginnersLuckHelpPlan({sourceName="",phase="ADVENTURE"}={}){
  const source=norm(sourceName);
  if(!["will","health"].includes(source)) return blocked("BEGINNERS_LUCK_HELP_REQUIRES_WILL_OR_HEALTH",{sourceName:String(sourceName??"")});
  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"BEGINNERS_LUCK_HELP",
    sourceName:source==="will"?"Will":"Health",dice:1,poolStage:"PRE_HALVING",
    phaseContext:String(phase??"ADVENTURE").trim().toUpperCase(),
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConflictHelpPlan({
  partySize=0,
  helperHasRoundAction=true,
  hasRequiredSkill=false,
  relevantNatureDescriptor=false,
  gmApprovedSkill=false
}={}){
  if(Number(partySize)<4) return blocked("CONFLICT_HELP_REQUIRES_4_PLUS_PARTY");
  if(Boolean(helperHasRoundAction)) return blocked("CONFLICT_HELP_REQUIRES_NO_ACTION_THIS_ROUND");

  let eligibility="NONE";
  if(Boolean(hasRequiredSkill)) eligibility="REQUIRED_SKILL";
  else if(Boolean(relevantNatureDescriptor)) eligibility="RELEVANT_NATURE_DESCRIPTOR";
  else if(Boolean(gmApprovedSkill)) eligibility="GM_APPROVED_SKILL";
  else return blocked("CONFLICT_HELP_SOURCE_NOT_ELIGIBLE");

  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"CONFLICT_HELP",dice:1,eligibility,
    helperConditionRisk:true,liveApplication:false,writesPlanned:0
  });
}

export function tb2eHelpConsequencePlan({
  testFailed=false,
  conditionApplied=false,
  helperAlreadyHasCondition=false,
  everyoneHungryChosen=false
}={}){
  if(!testFailed || !conditionApplied){
    return freezeTb2e({
      ok:true,phase:"M10D.3",profileId:PROFILE_ID,applies:false,helperConsequence:"NONE",
      liveApplication:false,automaticConditionWrite:false,writesPlanned:0
    });
  }
  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,applies:true,
    helperConsequence:helperAlreadyHasCondition?"NO_ADDITIONAL_CONDITION":"LESSER_CONDITION",
    everyoneHungryAlternative:true,everyoneHungryChosen:Boolean(everyoneHungryChosen),
    adjudication:"TABLE_GUIDANCE",liveApplication:false,automaticConditionWrite:false,writesPlanned:0
  });
}
