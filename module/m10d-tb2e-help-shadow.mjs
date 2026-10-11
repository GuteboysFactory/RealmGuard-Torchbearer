import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";
import { tb2eSkillInfo } from "./m10d-tb2e-abilities-shadow.mjs";

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
    adapterReady:true,sourceClassification:HELP_ROW?.status??"PARTIAL",coreSourceClassification:"VERIFIED",coreReconciliationPhase:"M10D.18_P3.1_TARGETED",fullDomainReauditComplete:false,sourceEvidence:"SG pp.36-38; DH skill entries (full domain audit still open)",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    actorMutationAllowed:false,itemMutationAllowed:false,conditionMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_AUTOMATIC_SUGGESTED_HELP_LOOKUP_WITHOUT_GM_CONFIRMATION",
      "NO_HELP_FROM_RATING_ZERO_DUE_TO_INJURY_OR_SICKNESS",
      "NO_WILL_HEALTH_RECOVERY_HELP_OR_TOWN_EXIT_BILLS_HELP",
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
  payingTownBills=false,
  sourceRatingZeroDueToInjuryOrSickness=false
}={}){
  const kind=norm(sourceKind);
  const source=norm(sourceName);
  const test=norm(testName);
  const phaseKey=String(phase??"ADVENTURE").trim().toUpperCase();
  const contextKey=String(context??"TEST").trim().toUpperCase();

  if(kind==="wise") return blocked("USE_WISE_AID_ROUTE",{route:"TB2E_WISE_AID",sourceKind:"WISE"});
  if(sourceRatingZeroDueToInjuryOrSickness)
    return blocked("ZERO_RATED_SOURCE_CANNOT_HELP",{reasonSource:"SG 37"});
  if(contextKey==="RECOVERY" && ["will","health"].includes(test)){
    return blocked("RECOVERY_HELP_FORBIDDEN",{phaseContext:phaseKey,testContext:contextKey,testName:String(testName??"")});
  }
  const townBills=Boolean(payingTownBills)||["PAY_BILLS","LIFESTYLE_EXIT"].includes(contextKey);
  if(test==="resources" && townBills){
    return blocked("TOWN_BILLS_HELP_FORBIDDEN",{phaseContext:phaseKey,testContext:contextKey,testName:String(testName??""),payingTownBills:true});
  }

  let eligibility="NONE";
  if(Boolean(sameSkill) && (kind!=="skill" || !source || source!==test))
    return blocked("SAME_SKILL_SOURCE_MISMATCH",{sourceKind:kind,sourceName:String(sourceName??""),testName:String(testName??"")});
  if(Boolean(suggestedHelpSkill) && (kind!=="skill" || !source || !test))
    return blocked("SUGGESTED_HELP_REQUIRES_SKILL_SOURCE");
  if(Boolean(actingOnInstinct)){
    if(Boolean(helperActingOnInstinct)) eligibility="HELPER_ALSO_ACTING_ON_INSTINCT";
    else if(kind==="nature" && Boolean(relevantNatureDescriptor)) eligibility="RELEVANT_NATURE_DESCRIPTOR_ON_INSTINCT";
    else return blocked("INSTINCT_HELP_SOURCE_NOT_ELIGIBLE",{phaseContext:phaseKey,testContext:contextKey});
  } else if(Boolean(sameSkill)) eligibility="SAME_SKILL";
  else if(Boolean(suggestedHelpSkill)) eligibility="SUGGESTED_HELP_SKILL";
  else if(["will","health","resources","circles"].includes(test) && kind==="ability" && source===test) eligibility="ABILITY_ANYONE_CAN_HELP";
  else if(kind==="nature" && Boolean(relevantNatureDescriptor)) eligibility="RELEVANT_NATURE_DESCRIPTOR";
  else return blocked("HELP_SOURCE_NOT_ESTABLISHED",{sourceKind:String(sourceKind??""),sourceName:String(sourceName??""),testName:String(testName??"")});

  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"TEAMWORK",dice:1,
    eligibility,sourceKind:String(sourceKind??"").toUpperCase(),sourceName:String(sourceName??""),
    testName:String(testName??""),phaseContext:phaseKey,testContext:contextKey,payingTownBills:Boolean(payingTownBills),
    helperConditionRisk:true,wiseAid:false,resourceCost:"NONE",
    suggestedHelpSkillGmPreconfirmed:eligibility==="SUGGESTED_HELP_SKILL",
    liveApplication:false,writesPlanned:0
  });
}

/**
 * SG 37: a trained matching skill can help a beginner. Otherwise the helper
 * uses the skill's assigned Beginner's Luck Will/Health ability (DH 58-59).
 * When targetSkillName is omitted, the plan is explicitly unverified.
 */
export function tb2eBeginnersLuckHelpPlan({
  sourceName="",sourceKind="ability",targetSkillName="",phase="ADVENTURE",
  sourceRatingZeroDueToInjuryOrSickness=false
}={}){
  const source=norm(sourceName),kind=norm(sourceKind);
  if(sourceRatingZeroDueToInjuryOrSickness)
    return blocked("ZERO_RATED_SOURCE_CANNOT_HELP",{reasonSource:"SG 37"});
  const targetName=String(targetSkillName??"").trim();
  const target=targetName?tb2eSkillInfo(targetName):null;
  if(target&&!target.ok)return blocked("UNKNOWN_BEGINNERS_LUCK_TARGET_SKILL",{targetSkillName:targetName});
  if(kind==="skill"){
    if(!target)return blocked("BEGINNERS_LUCK_SKILL_TARGET_REQUIRED");
    if(source!==norm(target.skill))return blocked("BEGINNERS_LUCK_HELPING_SKILL_MISMATCH",{targetSkillName:target.skill,sourceName:String(sourceName??"")});
    return freezeTb2e({
      ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"BEGINNERS_LUCK_HELP",
      sourceKind:"SKILL",sourceName:target.skill,targetSkillName:target.skill,
      sourceVerification:"SAME_TRAINED_SKILL",dice:1,poolStage:"PRE_HALVING",
      phaseContext:String(phase??"ADVENTURE").trim().toUpperCase(),
      liveApplication:false,writesPlanned:0
    });
  }
  if(kind!=="ability"||!["will","health"].includes(source))
    return blocked("BEGINNERS_LUCK_HELP_REQUIRES_WILL_OR_HEALTH",{sourceKind:kind,sourceName:String(sourceName??"")});
  if(target&&source!==norm(target.beginnersLuckAbility))
    return blocked("BEGINNERS_LUCK_HELP_ABILITY_MISMATCH",{targetSkillName:target.skill,expectedAbility:target.beginnersLuckAbility,sourceName:String(sourceName??"")});
  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"BEGINNERS_LUCK_HELP",
    sourceKind:"ABILITY",sourceName:source==="will"?"Will":"Health",
    targetSkillName:target?.skill??null,sourceVerification:target?"DH_SKILL_MAPPING":"TARGET_SKILL_UNSPECIFIED_GM_MUST_VERIFY",
    dice:1,poolStage:"PRE_HALVING",phaseContext:String(phase??"ADVENTURE").trim().toUpperCase(),
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eConflictHelpPlan({
  partySize=0,
  helperHasRoundAction=true,
  hasRequiredSkill=false,
  relevantNatureDescriptor=false,
  gmApprovedSkill=false,
  helperRatingZeroDueToInjuryOrSickness=false
}={}){
  if(helperRatingZeroDueToInjuryOrSickness)return blocked("ZERO_RATED_SOURCE_CANNOT_HELP",{reasonSource:"SG 37"});
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
    helperConsequence:helperAlreadyHasCondition?"NO_ADDITIONAL_CONDITION":
      everyoneHungryChosen?"HUNGRY_AND_THIRSTY":"LESSER_CONDITION",
    everyoneHungryAlternative:true,everyoneHungryChosen:Boolean(everyoneHungryChosen),
    adjudication:"TABLE_GUIDANCE",liveApplication:false,automaticConditionWrite:false,writesPlanned:0
  });
}
