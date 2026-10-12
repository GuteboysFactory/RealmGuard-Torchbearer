import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageAParticipationOutcomePlan} from "./m10d18-tb2e-package-a-participation-provenance.mjs";
import {tb2ePackageAProgressAfterTestPlan} from "./m10d18-tb2e-package-a-progress-boundary.mjs";
import {tb2ePackageASynergyAdvancementPlan} from "./m10d18-tb2e-package-a-synergy.mjs";
import {tb2eAdvancementThresholdPlan} from "./m10d-tb2e-advancement-shadow.mjs";

const result=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
  mode:"CURRENT_COUNTERS_DERIVED_PROGRESS_READ_ONLY",sourceEvidence:"DH 72,75,108-110; SG 51,87",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,resourceSpendCommitted:false,
  advancementWrite:false,learningWrite:false,ratingWrite:false,noAdvanceAuthorized:true,
  actorSourceAuthenticated:false,rollSourceAuthenticated:false,gmPermissionAuthenticated:false,
  playerConsentAuthenticated:false,rollTimeActorStateVerified:false,historicalRewardBalanceVerified:false,
  historicalProgressCountsAuthenticated:false,duplicateTestCheckAuthenticated:false,
  historicalEligibilityGmAsserted:false,...data
});
const fail=code=>result(false,code);
const fields=(o,allowed)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>allowed.includes(k));
const count=n=>Number.isSafeInteger(n)&&n>=0&&n<Number.MAX_SAFE_INTEGER;
const key=s=>String(s??"").trim().toLowerCase();
const sourceId=id=>typeof id==="string"&&/^[A-Za-z0-9]{1,128}$/.test(id);
class CounterError extends Error {}

function skillCounterProjection(item,mark,suppressedReason=null){
  if(!item||!count(item.learning?.passed)||!count(item.learning?.failed))
    throw new CounterError("CURRENT_SKILL_COUNTERS_REQUIRED");
  const before={passed:item.learning.passed,failed:item.learning.failed};
  const after={passed:before.passed+(mark==="PASS"?1:0),failed:before.failed+(mark==="FAIL"?1:0)};
  const thresholds=tb2eAdvancementThresholdPlan({kind:"SKILL",rating:item.rating,...after});
  if(!thresholds.ok)throw new CounterError("THRESHOLD_"+thresholds.reasonCode);
  return {itemId:item.itemId,skillName:item.name,rating:item.rating,
    countersBefore:before,countersAfterPreview:after,proposedMark:mark,
    requiredPasses:thresholds.requiredPasses,requiredFails:thresholds.requiredFails,
    readyToAdvanceAfterPreview:!suppressedReason&&thresholds.ready,atNormalRatingCap:thresholds.atCap,
    proposedRatingAfterSeparateAdvance:suppressedReason?item.rating:thresholds.advanceTo,
    advancementSuppressedReason:suppressedReason,
    storedLegacyThresholds:{passNeeded:item.learning.passNeeded,failNeeded:item.learning.failNeeded},
    sourceThresholdsOverrideLegacyConfiguration:false,countersResetCommitted:false};
}

/** Uses the derived saved-message outcome and observed CURRENT counters.
 * GM must separately review past eligibility and assert this test is not yet
 * included. No default-zero counters, caller outcomes, history attestation,
 * automatic skill creation/advancement/reset, or Synergy spends.
 */
export function tb2ePackageAParticipationProgressPlan(options={}){
  const participation=tb2ePackageAParticipationOutcomePlan({actorId:options?.actorId,
    messageId:options?.messageId,scenarioInput:options?.scenarioInput,
    helpSourceItemId:options?.helpSourceItemId,wiseAidItemId:options?.wiseAidItemId});
  if(!participation.ok)return fail(participation.reasonCode);
  try {
    if(!fields(options,["actorId","messageId","scenarioInput","helpSourceItemId","wiseAidItemId",
      "progressReview","synergyReview"]))return fail("UNSUPPORTED_PARTICIPATION_PROGRESS_FIELDS");
    const review=options.progressReview;
    if(!fields(review,["gmConfirmedLegalTest","gmConfirmsCountersExcludeThisTest",
      "gmConfirmsHistoricalEligibility","context"]))return fail("EXPLICIT_PROGRESS_REVIEW_REQUIRED");
    if(review.gmConfirmedLegalTest!==true||review.gmConfirmsHistoricalEligibility!==true)
      return fail("GM_HISTORICAL_PROGRESS_ELIGIBILITY_REQUIRED");
    if(review.gmConfirmsCountersExcludeThisTest!==true)return fail("CURRENT_COUNTERS_MAY_ALREADY_INCLUDE_TEST");
    if(review.context!=="ADVENTURE")return fail("INDEPENDENT_ADVENTURE_PROGRESS_ONLY");
    const s=options.scenarioInput,acting=participation.participantEvidence[0],
      outcome=participation.outcomePreview.outcome,obstacle=participation.outcomePreview.obstacle;
    const common={skillName:s.skillName,mode:s.mode,outcome,obstacle,
      gmConfirmedLegalTest:true,actingConditions:acting.conditions,conditionsGmReviewed:true,
      context:"ADVENTURE",alreadyCountedInContext:false,wentToTiebreaker:false};
    let markPlan,actingProjection;
    if(s.mode==="SKILL"){
      markPlan=tb2ePackageAProgressAfterTestPlan({...common,skillAlreadyKnown:true});
      if(!markPlan.ok)return fail("ACTING_PROGRESS_"+markPlan.reasonCode);
      const item=acting.currentSkillItems.find(i=>i.itemId===participation.currentActingSource.itemId);
      actingProjection=skillCounterProjection(item,markPlan.wouldRecordMark?markPlan.proposedMark:null,
        markPlan.reasonCode==="SICK_BLOCKS_ADVANCEMENT_LOGGING"?markPlan.reasonCode:null);
    }else{
      const record=acting.currentSkillItems.find(i=>i.itemId===participation.currentActingSource.untrainedRoleItemId);
      if(!record||record.rating!==0||!count(record.beginnerAttempts))
        return fail("CURRENT_UNTRAINED_LEARNING_RECORD_REQUIRED");
      const nature=acting.currentNature;
      if(!nature||!Number.isInteger(nature.current)||!Number.isInteger(nature.maximum)||
         nature.current>nature.maximum||nature.maximum>7)return fail("CURRENT_NATURE_STATE_REQUIRED");
      const roles=acting.currentSkillItems;
      if(roles.some(i=>!sourceId(i.itemId)||!key(i.name)||!Number.isInteger(i.rating)||i.rating<0||i.rating>7)||
         new Set(roles.map(i=>i.itemId)).size!==roles.length||new Set(roles.map(i=>key(i.name))).size!==roles.length)
        return fail("AMBIGUOUS_CURRENT_KNOWN_SKILL_COUNT");
      const knownCount=roles.filter(i=>i.rating>0).length;
      if(knownCount>24)return fail("CURRENT_KNOWN_SKILL_COUNT_EXCEEDS_CORE_CAP");
      markPlan=tb2ePackageAProgressAfterTestPlan({...common,skillAlreadyKnown:false,
        previousLearningAttempts:record.beginnerAttempts,maximumNature:nature.maximum,
        currentKnownSkillCount:knownCount});
      if(!markPlan.ok)return fail("ACTING_PROGRESS_"+markPlan.reasonCode);
      actingProjection={itemId:record.itemId,skillName:s.skillName,
        attemptsBefore:record.beginnerAttempts,
        attemptsAfterPreview:markPlan.attemptsAfterPreview??record.beginnerAttempts,
        attemptWouldBeAdded:markPlan.attemptWouldBeAdded??0,
        currentNature:nature.current,maximumNature:nature.maximum,currentKnownSkillCount:knownCount,
        knownSkillCountBasis:"CURRENT_TRAINED_ROLE_ITEMS_NOT_CANONICAL_TB_CONVERSION",
        readyToLearnAfterPreview:markPlan.readyToLearnAfterPreview??false,
        proposedLearnedRating:markPlan.learnedRating??null,
        requiresForgetExistingSkill:markPlan.requiresForgetExistingSkill??false,
        willHealthAdvancementMark:false,newSkillCreated:false,attemptRecorded:false};
    }
    let synergy=null,helperCounterProjection=null;
    if(options.synergyReview!=null){
      const r=options.synergyReview,source=participation.currentHelpSource;
      if(!source||!s.help)return fail("SYNERGY_REQUIRES_OBSERVED_ORDINARY_HELP");
      if(!fields(r,["fateAtRollStartGmAsserted","committedBeforeRollGmAsserted"])||
         !Number.isSafeInteger(r.fateAtRollStartGmAsserted)||r.fateAtRollStartGmAsserted<1)
        return fail("GM_ASSERTED_HELPER_FATE_START_REQUIRED");
      if(r.committedBeforeRollGmAsserted!==true)return fail("SYNERGY_PRE_ROLL_COMMITMENT_GM_ASSERTION_REQUIRED");
      const helper=participation.participantEvidence.find(e=>e.actorId===source.actorId);
      synergy=tb2ePackageASynergyAdvancementPlan({helperId:source.actorId,actingCharacterId:acting.actorId,
        helpRequest:{...s.help,helperRoute:s.mode==="BEGINNERS_LUCK"?"BEGINNERS_LUCK":"STANDARD"},
        helpingSourceKind:source.kind,helpingSourceName:source.name,helpedTestOutcome:outcome,
        gmHelpSourceVerified:true,fateAvailable:r.fateAtRollStartGmAsserted,fateCommittedBeforeRoll:true,
        helperConditions:helper.conditions,helperConditionsGmReviewed:true});
      if(!synergy.ok)return fail("SYNERGY_"+synergy.reasonCode);
      if(source.kind==="SKILL"){
        const item=helper.currentSkillItems.find(i=>i.itemId===source.itemId);
        helperCounterProjection=skillCounterProjection(item,synergy.advancementPreview,synergy.noMarkReason);
      }
      // The current model lacks Will/Health advancement counters: show the
      // source-bound Synergy mark only, never invent Ability counter baselines.
    }
    return result(true,null,{participationEvidence:participation,derivedOutcome:outcome,derivedObstacle:obstacle,
      actingProgressPlan:markPlan,actingCounterProjection:actingProjection,
      helperSynergyPreview:synergy,helperCounterProjection,
      helperAbilityCountersObserved:synergy?.helpingSourceKind==="ABILITY"?false:null,
      helperSynergyStartingResourcesSource:synergy?"GM_ASSERTED_NOT_CURRENT_ACTOR_HOLDINGS":null,
      actingCounterSourceObserved:true,helperSkillCounterSourceObserved:helperCounterProjection!==null,
      countersExcludeThisTestGmAsserted:true,historicalEligibilityGmAsserted:true,
      countersHistoricalRuleEligibilityUnverified:true,duplicateMarksCommitted:false});
  }catch(error){return fail(error instanceof CounterError?error.message:"PARTICIPATION_PROGRESS_READ_FAILED");}
}
