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
    adapterReady:true,sourceClassification:WISE_ROW?.status ?? "VERIFIED",coreReauditTargetedPhase:"M10D.18_P3.2",fullDomainReauditComplete:false,
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

export function tb2eWiseAidPlan({hasWise=true,related=true,actingOnInstinct=false,context="TEST",alsoProvidingHelp=false}={}) {
  if(!hasWise) return blocked("WISE_REQUIRED",{effect:"I_AM_WISE"});
  if(!related) return blocked("WISE_NOT_RELATED",{effect:"I_AM_WISE"});
  if(alsoProvidingHelp)return blocked("WISE_AID_AND_HELP_MUTUALLY_EXCLUSIVE",{effect:"I_AM_WISE",sourceEvidence:"DH 77"});
  const normalizedContext=String(context ?? "TEST").trim().toUpperCase() || "TEST";
  return freezeTb2e({
    ok:true,phase:"M10D.2",profileId:PROFILE_ID,effect:"I_AM_WISE",sourceKind:"WISE",target:"OTHER_CHARACTER",
    dice:1,replacesSkillHelp:true,resourceCost:"NONE",helperConditionRisk:false,helperTwistRisk:true,
    worksWhenActingOnInstinct:true,actingOnInstinct:Boolean(actingOnInstinct),context:normalizedContext,
    conflictNoncombatantToCombatantSupport:normalizedContext==="CONFLICT",
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eWiseRerollPlan(effect,{hasWise=true,related=true,failedDice=0,alreadyRerolledFailedDice=0,hasFate=true,hasPersona=true,fateLuckAlreadyUsed=false}={}) {
  const key=normalize(effect);
  if(!hasWise) return blocked("WISE_REQUIRED",{effect:String(effect ?? "")});
  if(!related) return blocked("WISE_NOT_RELATED",{effect:String(effect ?? "")});
  const failed=clampInt(failedDice);
  const alreadyRerolled=Math.min(failed,clampInt(alreadyRerolledFailedDice));

  if(["deeperunderstanding","deeper"].includes(key)){
    if(fateLuckAlreadyUsed)return blocked("DEEPER_MUST_PRECEDE_FATE_LUCK",{sourceEvidence:"SG p.87"});
    if(!hasFate) return blocked("INSUFFICIENT_FATE",{effect:"DEEPER_UNDERSTANDING",resourceCost:"FATE"});
    const eligible=Math.max(0,failed-alreadyRerolled);
    if(eligible<1) return blocked("NO_ELIGIBLE_FAILED_DIE",{effect:"DEEPER_UNDERSTANDING",resourceCost:"FATE",alreadyRerolledDiceExcluded:true});
    return freezeTb2e({
      ok:true,phase:"M10D.2",profileId:PROFILE_ID,effect:"DEEPER_UNDERSTANDING",
      resourceCost:"FATE",resourceAmount:1,timing:"AFTER_TEST_ROLL",reroll:"ONE_FAILED_DIE",
      rerollDiceMaximum:1,eligibleFailedDice:eligible,alreadyRerolledDiceExcluded:true,
      orderRequirement:"BEFORE_FATE_LUCK_AND_NO_DIE_REROLLED_TWICE",mustPrecedeFateLuck:true,
      fateLuckAlreadyUsed:Boolean(fateLuckAlreadyUsed),perDieRerollHistoryRequiresConfirmation:true,
      liveApplication:false,resourceSpendCommitted:false,writesPlanned:0
    });
  }

  if(["ofcourse","ahofcourse","course"].includes(key)){
    if(fateLuckAlreadyUsed)return blocked("OF_COURSE_MUST_PRECEDE_FATE_LUCK",{sourceEvidence:"DH 77"});
    if(!hasPersona) return blocked("INSUFFICIENT_PERSONA",{effect:"OF_COURSE",resourceCost:"PERSONA"});
    if(failed<1) return blocked("NO_FAILED_DICE",{effect:"OF_COURSE",resourceCost:"PERSONA"});
    return freezeTb2e({
      ok:true,phase:"M10D.2",profileId:PROFILE_ID,effect:"OF_COURSE",
      resourceCost:"PERSONA",resourceAmount:1,timing:"AFTER_TEST_ROLL",reroll:"ALL_FAILED_DICE",
      rerollDiceMaximum:failed,mustPrecedeFateLuck:true,
      orderRequirement:"WISE_REROLLS_BEFORE_FATE_LUCK",liveApplication:false,resourceSpendCommitted:false,writesPlanned:0
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
    uses,complete:missing.length===0,missing,completionTiming:"ON_COMPLETING_FOUR_REQUIRED_USES",
    completionChoices:["CHANGE_WISE","BEGINNERS_LUCK_TEST_TOWARD_NEW_SKILL","MARK_RELATED_SKILL_ADVANCEMENT_TEST"],
    automaticMutation:false,liveApplication:false,writesPlanned:0
  });
}


/** DH 78: creature/people-Wise grants communication with that people.
 * When that Wise changes, language persists only if recorded alongside
 * the character's current-level benefit. This is read-only bookkeeping.
 */
export function tb2eWiseLanguageRetentionPlan({
  peopleWise=false,wiseChanged=false,retainLanguage=false,
  languageRecordedWithLevelBenefit=false
}={}){
  if(!peopleWise)return blocked("LANGUAGE_WISE_REQUIRED",{sourceEvidence:"DH 78"});
  const changed=Boolean(wiseChanged),requested=Boolean(retainLanguage);
  const recorded=Boolean(languageRecordedWithLevelBenefit);
  const pending=changed&&requested&&!recorded;
  const retention=changed?requested&&recorded:true;
  return freezeTb2e({
    ok:true,phase:"M10D.18_PACKAGE_A",profileId:PROFILE_ID,
    mode:"WISE_LANGUAGE_RETENTION_SHADOW",sourceEvidence:"Dungeoneer's Handbook p.78",
    peopleWise:true,wiseChanged:changed,retainLanguageRequested:requested,
    languageRetained:retention,languageForgotten:changed&&!requested,
    retentionPendingLevelBenefitRecord:pending,
    retentionStatus:pending?"PENDING_RECORD":!changed?"WISE_UNCHANGED":retention?"RETAINED":"FORGOTTEN",
    retentionRequiresCurrentLevelBenefitRecord:changed&&requested,
    levelBenefitRecordConfirmed:recorded,
    gmBookkeepingRequired:changed&&requested&&!recorded,
    languageWriteCommitted:false,wiseMutationCommitted:false,
    liveApplication:false,writesPlanned:0
  });
}
export function tb2eWiseCommunicationPlan({
  peopleWiseApplies=false,otherCommunicationMethod=false
}={}){
  const permitted=Boolean(peopleWiseApplies)||Boolean(otherCommunicationMethod);
  return freezeTb2e({
    ok:true,phase:"M10D.18_PACKAGE_A",profileId:PROFILE_ID,
    mode:"WISE_COMMUNICATION_SHADOW",sourceEvidence:"Dungeoneer's Handbook p.78",
    canCommunicate:permitted,
    socialVerbalTestsAllowed:permitted,
    blockedWhenNoCommunication:["ARGUMENT","RIDDLE","SPEECH","NEGOTIATION"],
    requiresGmFictionalApplicabilityConfirmation:true,
    languageGrantedByPeopleWise:Boolean(peopleWiseApplies),
    alternateCommunicationMethod:Boolean(otherCommunicationMethod),
    liveApplication:false,writesPlanned:0
  });
}


/**
 * DH 77 Deeper Understanding: choose exactly one failed, never-rerolled
 * die on a related test. Numeric rolled faces are caller supplied.
 * No Fate point is spent or any die rolled by this planner.
 */
export function tb2eWiseDeeperDiePlan({
  dice=[],chosenDieId="",hasWise=true,related=true,
  fateAvailable=0,fateLuckAlreadyUsed=false,successThreshold=4
}={}){
  const state={phase:"M10D.18_PACKAGE_A",profileId:PROFILE_ID,
    mode:"DEEPER_UNDERSTANDING_DIE_SELECTION_SHADOW",
    sourceEvidence:"Dungeoneer's Handbook p.77",
    liveApplication:false,writesPlanned:0,rollExecuted:false,
    resourceSpendCommitted:false,actorWrite:false};
  const fail=(reasonCode)=>freezeTb2e({...state,ok:false,reasonCode});
  if(!hasWise||!related)return fail("RELEVANT_WISE_REQUIRED");
  if(fateLuckAlreadyUsed)return fail("DEEPER_MUST_PRECEDE_FATE_LUCK");
  if(!Number.isInteger(fateAvailable)||fateAvailable<1)return fail("INSUFFICIENT_FATE");
  if(![3,4].includes(successThreshold))return fail("UNSUPPORTED_SUCCESS_THRESHOLD");
  if(!Array.isArray(dice)||dice.some(d=>!d||typeof d.dieId!=="string"||!d.dieId.trim()||
     !Number.isInteger(d.face)||d.face<1||d.face>6||
     typeof d.alreadyRerolled!=="boolean"))
    return fail("INVALID_DIE_HISTORY");
  if(new Set(dice.map(d=>d.dieId.trim())).size!==dice.length)
    return fail("DUPLICATE_DIE_ID");
  const failedDice=dice.filter(d=>d.face<successThreshold);
  const eligible=failedDice.filter(d=>!d.alreadyRerolled).map(d=>d.dieId.trim());
  if(!eligible.length)return fail("NO_ELIGIBLE_FAILED_DIE");
  const chosen=String(chosenDieId??"").trim();
  if(!chosen)return fail("DIE_SELECTION_REQUIRED");
  if(!eligible.includes(chosen))return fail("SELECTED_DIE_NOT_ELIGIBLE");
  return freezeTb2e({...state,ok:true,successThreshold,
    eligibleFailedDieIds:eligible,previouslyRerolledDiceExcluded:true,
    selectedDieId:chosen,diceToReroll:1,
    fateLuckAlreadyUsed:Boolean(fateLuckAlreadyUsed),
    timingBoundary:"SELECTED_DIE_NEVER_BEFORE_REROLLED",
    resourceCost:"FATE",resourceAmount:1,rerollCommitted:false});
}
