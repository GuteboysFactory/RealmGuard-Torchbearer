import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";
import { tb2eSkillInfo } from "./m10d-tb2e-abilities-shadow.mjs";
import { tb2eSuggestedHelpSkillPlan } from "./m10d18-tb2e-package-a-skill-index.mjs";

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
  gmApprovedAdditionalSkill=false,
  gmApprovedAdditionalSkillCount=0,
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
  let helpSourceEvidence=null;
  if(Boolean(suggestedHelpSkill)){
    const verified=tb2eSuggestedHelpSkillPlan({
      testSkillName:testName,helperSkillName:sourceName,
      gmApprovedAdditionalSkill,gmApprovedAdditionalSkillCount
    });
    if(!verified.ok)return blocked(verified.reasonCode,{
      sourceName:String(sourceName??""),testName:String(testName??""),
      skillListAuthority:"DH 160-176",verificationOnly:true
    });
    helpSourceEvidence=verified.sourceKind;
  }
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
    suggestedHelpSourceEvidence:helpSourceEvidence,
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
  helperSkillTrained=false,
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
    if(helperSkillTrained!==true)return blocked("BEGINNERS_LUCK_HELPING_SKILL_NOT_CONFIRMED_TRAINED");
    if(source!==norm(target.skill))return blocked("BEGINNERS_LUCK_HELPING_SKILL_MISMATCH",{targetSkillName:target.skill,sourceName:String(sourceName??"")});
    return freezeTb2e({
      ok:true,phase:"M10D.3",profileId:PROFILE_ID,mode:"BEGINNERS_LUCK_HELP",
      sourceKind:"SKILL",sourceName:target.skill,targetSkillName:target.skill,
      sourceVerification:"GM_CONFIRMED_SAME_TRAINED_SKILL",dice:1,poolStage:"PRE_HALVING",
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

/**
 * SG 36-38. Help is offered through an in-fiction action and is accepted
 * or declined by the acting player. Eligibility does not itself commit aid.
 */
export function tb2eHelpParticipationPlan({
  helperRoute="STANDARD",helpOptions={},
  describedRelevantAction=false,actingPlayerAccepted=false,
  gmApprovedRelevance=false
}={}){
  const route=String(helperRoute??"").trim().toUpperCase();
  if(route!=="STANDARD"&&route!=="BEGINNERS_LUCK"&&route!=="CONFLICT")
    return blocked("UNSUPPORTED_HELP_ROUTE");
  if(describedRelevantAction!==true)return blocked("RELEVANT_HELP_ACTION_REQUIRED",{sourceEvidence:"SG 36"});
  if(actingPlayerAccepted!==true)return blocked("ACTING_PLAYER_DID_NOT_ACCEPT_HELP",{sourceEvidence:"SG 36"});
  if(gmApprovedRelevance!==true)return blocked("GM_MUST_VALIDATE_HELP_RELEVANCE",{sourceEvidence:"SG 37"});
  const options=helpOptions&&typeof helpOptions==="object"&&!Array.isArray(helpOptions)?helpOptions:{};
  const candidate=route==="BEGINNERS_LUCK"?tb2eBeginnersLuckHelpPlan(options):
    route==="CONFLICT"?tb2eConflictHelpPlan(options):tb2eHelpPlan(options);
  if(!candidate.ok)return blocked(candidate.reasonCode,{sourceEvidence:"SG 36-38",helpRoute:route});
  return freezeTb2e({
    ok:true,phase:"M10D.18_PACKAGE_A",profileId:PROFILE_ID,mode:"ACCEPTED_HELP_READ_ONLY_PREVIEW",
    sourceEvidence:"Scholar's Guide pp.36-38",route,
    candidateSourceVerification:candidate.sourceVerification??candidate.suggestedHelpSourceEvidence??candidate.eligibility,
    acceptedByActingPlayer:true,helpActionDescribed:true,gmRelevanceConfirmed:true,
    dice:1,helperConditionRisk:true,helperTwistRisk:true,
    resourceSpendCommitted:false,helpDieCommitted:false,actorWrite:false,
    liveApplication:false,writesPlanned:0
  });
}

/** Group outcome: a twist affects all helpers, while a failure with a
 * condition gives the actor the primary condition and helpers lesser ones.
 * Hungry & Thirsty is the special floor (SG 38), not a GM alternative for
 * unrelated primary conditions. Wises using I Am Wise only risk twists.
 */
export function tb2eHelpGroupOutcomePlan({
  outcome="PASS",primaryCondition="",helperHasSelectedCondition=false,
  helperIsWiseAid=false
}={}){
  const state=String(outcome??"").trim().toUpperCase();
  if(!["PASS","TWIST","CONDITION"].includes(state))return blocked("INVALID_HELP_OUTCOME");
  const primary=String(primaryCondition??"").trim().toUpperCase().replace(/[ -]/g,"_");
  if(state==="CONDITION"&&!primary)return blocked("PRIMARY_CONDITION_REQUIRED");
  if(state!=="CONDITION"&&primary)return blocked("PRIMARY_CONDITION_ONLY_ON_CONDITION_OUTCOME");
  const hungry=primary==="HUNGRY_AND_THIRSTY";
  const isWise=Boolean(helperIsWiseAid);
  const already=Boolean(helperHasSelectedCondition);
  return freezeTb2e({
    ok:true,phase:"M10D.18_PACKAGE_A",profileId:PROFILE_ID,mode:"GROUP_HELP_OUTCOME_SHADOW",
    sourceEvidence:"Scholar's Guide pp.36-38; Dungeoneer's Handbook p.77",
    outcome:state,primaryCondition:primary||null,
    primaryCharacterSharesSuccess:state==="PASS",
    allParticipantsAffectedByTwist:state==="TWIST",
    helperConsequence:state!=="CONDITION"?"NONE":isWise?"WISE_AID_EXEMPT":
      already?"NO_ADDITIONAL_CONDITION":hungry?"HUNGRY_AND_THIRSTY":"GM_CHOSES_LESSER_CONDITION",
    helperConditionRisk:!isWise,helperTwistRisk:true,
    helperHasSelectedCondition:already,hungryAndThirstyException:hungry,
    conditionChangesCommitted:false,actorWrite:false,
    liveApplication:false,writesPlanned:0
  });
}

/** Backward compatible preview with explicit primary-condition verification. */
export function tb2eHelpConsequencePlan({
  testFailed=false,
  conditionApplied=false,
  helperAlreadyHasCondition=false,
  everyoneHungryChosen=false,
  primaryCondition=""
}={}){
  const primary=String(primaryCondition??"").trim().toUpperCase().replace(/[ -]/g,"_");
  const hungry=primary==="HUNGRY_AND_THIRSTY";
  if(Boolean(everyoneHungryChosen)&&!hungry)
    return blocked("HUNGRY_GROUP_RULE_REQUIRES_PRIMARY_HUNGRY_AND_THIRSTY",{sourceEvidence:"SG 38"});
  if(!testFailed||!conditionApplied){
    return freezeTb2e({
      ok:true,phase:"M10D.3",profileId:PROFILE_ID,applies:false,helperConsequence:"NONE",
      liveApplication:false,automaticConditionWrite:false,writesPlanned:0
    });
  }
  const helperConsequence=helperAlreadyHasCondition?"NO_ADDITIONAL_CONDITION":
    hungry?"HUNGRY_AND_THIRSTY":"LESSER_CONDITION";
  return freezeTb2e({
    ok:true,phase:"M10D.3",profileId:PROFILE_ID,applies:true,primaryCondition:primary||null,
    helperConsequence,everyoneHungryAlternative:hungry,
    everyoneHungryChosen:hungry,sourceEvidence:"SG 38",
    primaryConditionConfirmed:Boolean(primary),
    gmMustSelectLesserCondition:!hungry&&!helperAlreadyHasCondition,
    adjudication:"TABLE_GUIDANCE",liveApplication:false,automaticConditionWrite:false,writesPlanned:0
  });
}
