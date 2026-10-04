import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID = "torchbearer2e";
const PROFILE_VERSION = 1;
const WISE_ROW = TB2E_SOURCE_COVERAGE_MATRIX.find(row => row.id === "wises");

function clampInt(value) { return Math.max(0, Math.trunc(Number(value) || 0)); }
function normalize(value) { return String(value ?? "").trim().toLowerCase().replace(/[^a-z]/g, ""); }
function blocked(reasonCode, extra = {}) {
  return freezeTb2e({ok:false,phase:"M10D.2",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0,...extra});
}

export function tb2eWiseShadowStatus() {
  return freezeTb2e({
    phase:"M10D.2",mode:"TB2E_WISES_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:WISE_ROW?.status ?? "VERIFIED",
    sourceEvidence:WISE_ROW?.evidence ?? "QR 20, 60, 75-76; CC 25",
    ratingMode:"NONE",maxWises:4,liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",
    activationAllowed:false,actorMutationAllowed:false,itemMutationAllowed:false,resourceSpendAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    nextStep:"Verify source-owned TB2E Wise shadow plans in Foundry; no live rule authority is authorized"
  });
}

export function tb2eWiseModel() {
  return freezeTb2e({
    phase:"M10D.2",profileId:PROFILE_ID,ratingMode:"NONE",maxWises:4,
    stockOrCreatureWiseGrantsLanguageKnowledge:true,acquireNewWisesDuring:"RESPITE",
    sameTestMultipleWisesAllowed:true,sameTestEffectsMustDiffer:true,
    effects:["I_AM_WISE","DEEPER_UNDERSTANDING","OF_COURSE"],liveApplication:false,writesPlanned:0
  });
}

export function tb2eWiseAidPlan({hasWise=true,related=true,actingOnInstinct=false,context="TEST"}={}) {
  if(!hasWise) return blocked("WISE_REQUIRED",{effect:"I_AM_WISE"});
  if(!related) return blocked("WISE_NOT_RELATED",{effect:"I_AM_WISE"});
  const normalizedContext=String(context ?? "TEST").trim().toUpperCase() || "TEST";
  return freezeTb2e({
    ok:true,phase:"M10D.2",profileId:PROFILE_ID,effect:"I_AM_WISE",sourceKind:"WISE",target:"OTHER_CHARACTER",
    dice:1,replacesSkillHelp:true,resourceCost:"NONE",helperConditionRisk:false,helperTwistRisk:true,
    worksWhenActingOnInstinct:true,actingOnInstinct:Boolean(actingOnInstinct),context:normalizedContext,
    conflictNoncombatantToCombatantSupport:normalizedContext==="CONFLICT",
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eWiseRerollPlan(effect,{hasWise=true,related=true,failedDice=0,alreadyRerolledFailedDice=0,hasFate=true,hasPersona=true}={}) {
  const key=normalize(effect);
  if(!hasWise) return blocked("WISE_REQUIRED",{effect:String(effect ?? "")});
  if(!related) return blocked("WISE_NOT_RELATED",{effect:String(effect ?? "")});
  const failed=clampInt(failedDice);
  const alreadyRerolled=Math.min(failed,clampInt(alreadyRerolledFailedDice));

  if(["deeperunderstanding","deeper"].includes(key)){
    if(!hasFate) return blocked("INSUFFICIENT_FATE",{effect:"DEEPER_UNDERSTANDING",resourceCost:"FATE"});
    const eligible=Math.max(0,failed-alreadyRerolled);
    if(eligible<1) return blocked("NO_ELIGIBLE_FAILED_DIE",{effect:"DEEPER_UNDERSTANDING",resourceCost:"FATE",alreadyRerolledDiceExcluded:true});
    return freezeTb2e({
      ok:true,phase:"M10D.2",profileId:PROFILE_ID,effect:"DEEPER_UNDERSTANDING",
      resourceCost:"FATE",resourceAmount:1,timing:"AFTER_TEST_ROLL",reroll:"ONE_FAILED_DIE",
      rerollDiceMaximum:1,eligibleFailedDice:eligible,alreadyRerolledDiceExcluded:true,
      orderRequirement:"OF_COURSE_BEFORE_DEEPER_IF_BOTH",liveApplication:false,resourceSpendCommitted:false,writesPlanned:0
    });
  }

  if(["ofcourse","ahofcourse","course"].includes(key)){
    if(!hasPersona) return blocked("INSUFFICIENT_PERSONA",{effect:"OF_COURSE",resourceCost:"PERSONA"});
    if(failed<1) return blocked("NO_FAILED_DICE",{effect:"OF_COURSE",resourceCost:"PERSONA"});
    return freezeTb2e({
      ok:true,phase:"M10D.2",profileId:PROFILE_ID,effect:"OF_COURSE",
      resourceCost:"PERSONA",resourceAmount:1,timing:"AFTER_TEST_ROLL",reroll:"ALL_FAILED_DICE",
      rerollDiceMaximum:failed,mustPrecedeDeeperUnderstandingWhenBoth:true,
      orderRequirement:"OF_COURSE_BEFORE_DEEPER_IF_BOTH",liveApplication:false,resourceSpendCommitted:false,writesPlanned:0
    });
  }
  return blocked("UNKNOWN_WISE_EFFECT",{effect:String(effect ?? "")});
}

export function tb2eWiseUsePlan(effect,options={}) {
  const key=normalize(effect);
  if(["iamwise","wiseaid"].includes(key)) return tb2eWiseAidPlan(options);
  return tb2eWiseRerollPlan(effect,options);
}

export function tb2eWiseCyclePlan({iAmWisePass=false,iAmWiseFail=false,deeperUnderstanding=false,ofCourse=false}={}) {
  const uses=freezeTb2e({
    I_AM_WISE_PASS:Boolean(iAmWisePass),I_AM_WISE_FAIL:Boolean(iAmWiseFail),
    DEEPER_UNDERSTANDING:Boolean(deeperUnderstanding),OF_COURSE:Boolean(ofCourse)
  });
  const missing=Object.entries(uses).filter(([,used])=>!used).map(([id])=>id);
  return freezeTb2e({
    phase:"M10D.2",profileId:PROFILE_ID,
    requiredUses:["I_AM_WISE_PASS","I_AM_WISE_FAIL","DEEPER_UNDERSTANDING","OF_COURSE"],
    uses,complete:missing.length===0,missing,completionTiming:"RESPITE",
    completionChoices:["CHANGE_WISE","BEGINNERS_LUCK_TEST_TOWARD_NEW_SKILL","MARK_RELATED_SKILL_ADVANCEMENT_TEST"],
    automaticMutation:false,liveApplication:false,writesPlanned:0
  });
}
