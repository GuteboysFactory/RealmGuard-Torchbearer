import {tb2ePackageASavedLegacyAuditEvidence} from "./m10d18-tb2e-package-a-saved-legacy-audit.mjs";
import {tb2ePackageAProgressAfterTestPlan} from "./m10d18-tb2e-package-a-progress-boundary.mjs";
import {tb2eConditionCapabilityPlan} from "./m10d-tb2e-conditions-shadow.mjs";
import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageARewardedRollHistoryPlan} from "./m10d18-tb2e-package-a-rewarded-roll-history.mjs";

const result=(ok,reasonCode=null,data={})=>freezeTb2e({ok,reasonCode,
  phase:"M10D.18_PACKAGE_A",mode:"PROPOSED_LEGACY_TRACE_CONTRACT_READ_ONLY",
  sourceEvidence:"DH 59,75,77,108-110; SG 36-38,47,51,87-88",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,journalWrite:false,
  settingsWrite:false,rollExecuted:false,resourceSpendCommitted:false,advancementWrite:false,
  learningWrite:false,rollSourceAuthenticated:false,actorSourceAuthenticated:false,
  gmPermissionAuthenticated:false,playerConsentAuthenticated:false,rollTimeActorStateVerified:false,
  historicalRewardBalanceVerified:false,immutableChronologyVerified:false,
  duplicateTestCheckAuthenticated:false,completeTestHistoryVerified:false,
  captureImplemented:false,noAdvanceAuthorized:true,evidenceScope:"CALLER_SUPPLIED_UNATTESTED_TRACE",...data});
const fail=code=>result(false,code);
const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const id=x=>typeof x==="string"&&/^[A-Za-z0-9:_-]{1,128}$/.test(x);
const count=x=>Number.isSafeInteger(x)&&x>=0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
class TraceError extends Error {}
const check=(condition,code)=>{if(!condition)throw new TraceError(code);};

/** Contract validation, NOT a document reader/capture hook/attestation service.
 * Even mutually consistent snapshots and receipts can be fabricated together.
 * Replay checks only cover the explicitly reviewed caller-provided ID set.
 */
export function tb2ePackageAProspectiveTracePlan(options={}){
  try{
    check(fields(options,["trace","scenarioInput","gmTraceReviewed","previousTestIds"]),"UNSUPPORTED_TRACE_OPTIONS");
    check(options.gmTraceReviewed===true,"GM_TRACE_REVIEW_REQUIRED");
    const t=options.trace,s=options.scenarioInput;
    check(fields(t,["schemaVersion","producer","status","worldId","sessionId","testId","actorId","author","participants","events"]),"INVALID_TRACE_FIELDS");
    check(t.schemaVersion===1&&t.producer==="LEGACY_MIXED"&&t.status==="COMPLETE","UNSUPPORTED_OR_INCOMPLETE_TRACE");
    check([t.worldId,t.sessionId,t.testId,t.actorId].every(id),"TRACE_IDENTITY_REQUIRED");
    check(s&&s.actingCharacterId===t.actorId,"TRACE_ACTING_ID_MISMATCH");
    check(["SKILL","BEGINNERS_LUCK"].includes(s.mode)&&!s.actingOnInstinct&&!s.channelNatureFacts&&
      !s.heroicRatingSevenUnlocked&&!s.bonuses,"TRACE_SCOPE_INDEPENDENT_SKILL_BL_ONLY");
    check(Array.isArray(options.previousTestIds)&&options.previousTestIds.every(id)&&
      new Set(options.previousTestIds).size===options.previousTestIds.length,"REVIEWED_PREVIOUS_TEST_IDS_REQUIRED");
    check(!options.previousTestIds.includes(t.testId),"TRACE_TEST_ID_REPLAY_IN_DECLARED_HISTORY");
    const a=t.author;
    check(fields(a,["userId","role","gmId"])&&id(a.userId)&&id(a.gmId)&&["OWNER","GM"].includes(a.role),"TRACE_AUTHOR_SCOPE_REQUIRED");
    check(a.role!=="GM"||a.userId===a.gmId,"TRACE_GM_AUTHOR_MISMATCH");
    check(Array.isArray(t.participants)&&t.participants.length>=1&&t.participants.length<=4,"TRACE_PARTICIPANTS_REQUIRED");
    const participants=new Map(),balances=new Map();
    for(const p of t.participants){
      check(fields(p,["actorId","ownerUserIds","ownedItemIds","conditions","source","rewards","counters"])&&id(p.actorId)&&
        !participants.has(p.actorId),"TRACE_PARTICIPANT_ID_DUPLICATE_OR_INVALID");
      check(Array.isArray(p.ownerUserIds)&&p.ownerUserIds.every(id)&&new Set(p.ownerUserIds).size===p.ownerUserIds.length,
        "TRACE_OWNER_IDS_REQUIRED");
      check(Array.isArray(p.ownedItemIds)&&p.ownedItemIds.every(id)&&new Set(p.ownedItemIds).size===p.ownedItemIds.length,
        "TRACE_OWNED_ITEM_IDS_REQUIRED");
      check(Array.isArray(p.conditions)&&p.conditions.every(c=>typeof c==="string"&&c.length>0&&c.length<=80),"TRACE_CONDITIONS_REQUIRED");
      check(fields(p.source,["kind","itemId","name","rating"])&&["SKILL","ABILITY","WISE"].includes(p.source.kind)&&
        typeof p.source.name==="string"&&p.source.name.trim()&&count(p.source.rating),"TRACE_SOURCE_REQUIRED");
      check(p.source.kind==="ABILITY"?p.source.itemId===null:id(p.source.itemId),"TRACE_SOURCE_ID_REQUIRED");
      check(p.source.itemId===null||p.ownedItemIds.includes(p.source.itemId),"TRACE_SOURCE_ITEM_NOT_IN_DECLARED_ACTOR");
      check(p.source.kind==="WISE"?p.source.rating===0:p.source.rating>=1&&p.source.rating<=6,"TRACE_SOURCE_RATING_OUT_OF_SCOPE");
      check(fields(p.rewards,["fate","persona"])&&count(p.rewards.fate)&&count(p.rewards.persona),"TRACE_START_BALANCES_REQUIRED");
      check(p.counters===null||fields(p.counters,["passed","failed"])&&count(p.counters.passed)&&count(p.counters.failed),
        "TRACE_COUNTERS_INVALID");
      check(p.source.kind==="SKILL"||p.counters===null,"TRACE_ABILITY_WISE_COUNTERS_NOT_SUPPORTED_BY_CURRENT_MODEL");
      participants.set(p.actorId,p);balances.set(p.actorId,{...p.rewards});
    }
    const acting=participants.get(t.actorId);
    check(acting,"TRACE_ACTING_SNAPSHOT_REQUIRED");
    check(a.role==="GM"||acting.ownerUserIds.includes(a.userId),"TRACE_AUTHOR_NOT_IN_DECLARED_OWNER_SCOPE");
    check(same(acting.conditions,s.actingConditions),"TRACE_ACTING_CONDITION_MISMATCH");
    check(acting.source.kind===(s.mode==="SKILL"?"SKILL":"ABILITY")&&
      acting.source.name===(s.mode==="SKILL"?s.skillName:s.beginnerAbilityName)&&acting.source.rating===s.rating,
      "TRACE_ACTING_SOURCE_MISMATCH");
    const expectedActors=new Set([t.actorId]);
    if(s.help){
      const p=participants.get(s.help.helperId);expectedActors.add(s.help.helperId);
      check(p&&same(p.conditions,s.help.helperConditions)&&
        p.source.kind===String(s.help.helpOptions?.sourceKind).toUpperCase()&&
        p.source.name.toLowerCase()===String(s.help.helpOptions?.sourceName).toLowerCase(),"TRACE_HELP_SOURCE_MISMATCH");
    }
    if(s.wiseAid){
      const p=participants.get(s.wiseAid.helperId);expectedActors.add(s.wiseAid.helperId);
      check(p&&p.source.kind==="WISE"&&same(p.conditions,s.wiseAid.helperConditions),"TRACE_WISE_AID_SOURCE_MISMATCH");
      check(!s.help||s.help.helperId!==s.wiseAid.helperId,"TRACE_SAME_HELPER_WISE_AID_UNSUPPORTED");
    }
    check(participants.size===expectedActors.size&&[...expectedActors].every(x=>participants.has(x)),"TRACE_UNLINKED_PARTICIPANT");
    check(Array.isArray(t.events)&&t.events.length>=2&&t.events.length<=100,"TRACE_EVENTS_REQUIRED");
    const seen=new Set(),rollIds=new Set(),eventMap=new Map(),spends=[],rewards=[];
    let initial=null,final=null,baseIndex=-1;
    const readRoll=roll=>{
      check(fields(roll,["recordId","formula","evaluated","faces","total"])&&id(roll.recordId)&&!rollIds.has(roll.recordId),"TRACE_ROLL_ID_DUPLICATE_OR_INVALID");
      check(roll.evaluated===true&&Array.isArray(roll.faces)&&roll.faces.length>=1&&roll.faces.length<=250&&
        roll.faces.every(f=>Number.isInteger(f)&&f>=1&&f<=6)&&roll.formula===`${roll.faces.length}d6`&&
        count(roll.total)&&roll.total===roll.faces.reduce((n,f)=>n+f,0),"TRACE_PLAIN_D6_RECORD_REQUIRED");
      rollIds.add(roll.recordId);return roll.faces.map((face,i)=>({dieId:`${roll.recordId}:${i}`,face}));
    };
    for(const [index,e] of t.events.entries()){
      check(e&&id(e.eventId)&&!seen.has(e.eventId)&&e.sequence===index&&e.testId===t.testId,"TRACE_EVENT_ID_SEQUENCE_OR_TEST_MISMATCH");
      check(!final,"TRACE_EVENTS_AFTER_FINAL");seen.add(e.eventId);eventMap.set(e.eventId,e);
      const common=["eventId","sequence","testId","type"];
      if(e.type==="BASE_ROLL"){
        check(fields(e,[...common,"roll"])&&!initial,"TRACE_BASE_ROLL_DUPLICATE_OR_INVALID");
        initial=readRoll(e.roll);baseIndex=index;
      }else if(e.type==="SPEND"){
        check(fields(e,[...common,"actorId","resource","amount","before","after","forEventId"])&&participants.has(e.actorId)&&
          ["fate","persona"].includes(e.resource)&&count(e.amount)&&e.amount>0&&count(e.before)&&count(e.after)&&id(e.forEventId),
          "TRACE_SPEND_RECEIPT_REQUIRED");
        const b=balances.get(e.actorId);check(b[e.resource]===e.before&&e.before>=e.amount&&e.after===e.before-e.amount,
          "TRACE_RESOURCE_CHAIN_MISMATCH");b[e.resource]=e.after;spends.push(e);
      }else if(e.type==="SYNERGY_COMMIT"){
        check(fields(e,[...common,"helperId","sourceItemId"])&&s.help&&e.helperId===s.help.helperId&&
          e.sourceItemId===participants.get(e.helperId)?.source.itemId&&baseIndex<0,"TRACE_SYNERGY_PRE_ROLL_SOURCE_REQUIRED");
      }else if(e.type==="FINAL"){
        check(fields(e,[...common,"outcome"])&&initial&&["PASS","FAIL"].includes(e.outcome),"TRACE_FINAL_REQUIRED");final=e;
      }else{
        check(initial,"TRACE_REWARD_BEFORE_BASE");
        if(e.type==="DEEPER_UNDERSTANDING"||e.type==="OF_COURSE"){
          check(fields(e,[...common,"wiseItemId","related","targetDieIds","roll"])&&id(e.wiseItemId)&&e.related===true&&
            Array.isArray(e.targetDieIds)&&e.targetDieIds.every(id)&&new Set(e.targetDieIds).size===e.targetDieIds.length,
            "TRACE_WISE_TARGETS_REQUIRED");
          check(acting.ownedItemIds.includes(e.wiseItemId),"TRACE_WISE_NOT_IN_DECLARED_ACTOR_ITEMS");
          const dice=readRoll(e.roll);check(dice.length===e.targetDieIds.length,"TRACE_WISE_RESULT_COUNT_MISMATCH");
          if(e.type==="DEEPER_UNDERSTANDING"){
            check(dice.length===1,"TRACE_DEEPER_SINGLE_TARGET_REQUIRED");
            rewards.push({type:e.type,wiseId:e.wiseItemId,related:true,dieId:e.targetDieIds[0],newFace:dice[0].face});
          }else rewards.push({type:e.type,wiseId:e.wiseItemId,related:true,rerolls:dice.map((d,i)=>({dieId:e.targetDieIds[i],face:d.face}))});
        }else if(e.type==="FATE_LUCK"){
          check(fields(e,[...common,"rounds"])&&Array.isArray(e.rounds)&&e.rounds.length>=1&&e.rounds.length<=30,"TRACE_LUCK_ROUNDS_REQUIRED");
          const rounds=e.rounds.map(r=>{
            check(fields(r,["parentDieIds","roll"])&&Array.isArray(r.parentDieIds)&&r.parentDieIds.every(id),"TRACE_LUCK_PARENT_IDS_REQUIRED");
            const dice=readRoll(r.roll);check(dice.length===r.parentDieIds.length,"TRACE_LUCK_PARENT_COUNT_MISMATCH");
            return dice.map((d,i)=>({...d,parentDieId:r.parentDieIds[i]}));
          });rewards.push({type:e.type,rounds});
        }else throw new TraceError("TRACE_UNSUPPORTED_EVENT");
      }
    }
    check(initial&&final,"TRACE_BASE_AND_FINAL_REQUIRED");
    const spentFor=new Set();
    for(const spend of spends){
      const event=eventMap.get(spend.forEventId);
      check(event&&!spentFor.has(event.eventId),"TRACE_SPEND_EVENT_MISSING_OR_DUPLICATE");spentFor.add(event.eventId);
      const synergy=event.type==="SYNERGY_COMMIT";
      check(["DEEPER_UNDERSTANDING","OF_COURSE","FATE_LUCK","SYNERGY_COMMIT"].includes(event.type)&&
        spend.amount===1&&spend.resource===(event.type==="OF_COURSE"?"persona":"fate")&&
        spend.actorId===(synergy?event.helperId:t.actorId),"TRACE_SPEND_SOURCE_OR_COST_MISMATCH");
      check(!synergy||spend.sequence<baseIndex,"TRACE_SYNERGY_SPEND_MUST_PRECEDE_BASE");
      check(synergy||spend.sequence>baseIndex,"TRACE_REWARD_SPEND_MUST_FOLLOW_BASE");
    }
    for(const e of t.events)if(["DEEPER_UNDERSTANDING","OF_COURSE","FATE_LUCK","SYNERGY_COMMIT"].includes(e.type))
      check(spentFor.has(e.eventId),"TRACE_REQUIRED_SPEND_RECEIPT_MISSING");
    check(t.events.filter(e=>e.type==="SYNERGY_COMMIT").length<=1,"TRACE_DUPLICATE_SYNERGY_COMMIT");
    const timeline=tb2ePackageARewardedRollHistoryPlan({scenarioInput:s,initialDice:initial,rewardEvents:rewards,
      gmDiceReviewed:true,gmEventHistoryReviewed:true,fateAvailable:acting.rewards.fate,personaAvailable:acting.rewards.persona});
    check(timeline.ok,"TRACE_TIMELINE_"+timeline.reasonCode);
    check(final.outcome===timeline.outcome,"TRACE_FINAL_OUTCOME_MISMATCH");
    return result(true,null,{testIdentity:{worldId:t.worldId,sessionId:t.sessionId,testId:t.testId,actorId:t.actorId},
      declaredTraceStructurallyConsistent:true,declaredSpendChainsConsistent:true,
      finalOutcome:timeline.outcome,rewardTimelinePreview:timeline,
      declaredBalancesAfter:[...balances].map(([actorId,rewards])=>({actorId,rewards:{...rewards}})),
      replayCheckScope:"CALLER_SUPPLIED_PREVIOUS_TEST_IDS_ONLY",
      captureStorageImplemented:false,nativeRollDocumentsRead:false});
  }catch(error){return fail(error instanceof TraceError?error.message:"TRACE_CONTRACT_READ_FAILED");}
}


/** A05/A06 v1 explicit reviewed baselines. Pure declarations, no Foundry reads,
 * migration, replay, spending or event application. UNKNOWN is not zero.
 */
export function tb2ePackageAEvidenceBaselinePlan(input={}){
 try{
  const exact=(o,keys)=>fields(o,keys)&&keys.every(k=>Object.hasOwn(o,k));
  check(exact(input,["schemaVersion","worldId","actorId","gmId","subjects","supplies"])&&input.schemaVersion===1&&
   [input.worldId,input.actorId,input.gmId].every(id),"BASELINE_ENVELOPE_REQUIRED");
  check(Array.isArray(input.subjects)&&input.subjects.length<=64&&Array.isArray(input.supplies)&&input.supplies.length<=128,
   "BASELINE_COLLECTION_LIMIT");
  const seenSubjects=new Set(),seenItems=new Set(),seenUnits=new Set(),seenSkills=new Set();
  const review=(r,keys)=>{
   check(exact(r,["state","value","reviewId","reviewerId"]),"EXPLICIT_EVIDENCE_STATE_REQUIRED");
   if(r.state==="UNKNOWN"){
    check(r.value===null&&r.reviewId===null&&r.reviewerId===null,"UNKNOWN_EVIDENCE_MUST_REMAIN_NULL");return null;
   }
   check(r.state==="GM_REVIEWED"&&id(r.reviewId)&&r.reviewerId===input.gmId,"DECLARED_GM_REVIEW_REQUIRED");
   check(exact(r.value,keys)&&keys.every(k=>count(r.value[k])&&r.value[k]<Number.MAX_SAFE_INTEGER),"STRICT_BASELINE_COUNTS_REQUIRED");
   return Object.fromEntries(keys.map(k=>[k,r.value[k]]));
  };
  const subjects=input.subjects.map(s=>{
   check(exact(s,["subjectId","epochId","kind","itemId","skillName","rating","currentNature","counters"]),"BASELINE_SUBJECT_FIELDS_REQUIRED");
   check(["WILL","HEALTH","NATURE","SKILL","LEARNING"].includes(s.kind)&&id(s.epochId),"BASELINE_SUBJECT_KIND_REQUIRED");
   const itemBased=["SKILL","LEARNING"].includes(s.kind);
   check(itemBased?id(s.itemId)&&typeof s.skillName==="string"&&s.skillName.trim().length>0:s.itemId===null&&s.skillName===null,
    "BASELINE_SUBJECT_SOURCE_REQUIRED");
   const subjectId=`${input.actorId}:${s.kind}${itemBased?":"+s.itemId:""}`;
   check(s.subjectId===subjectId&&!seenSubjects.has(subjectId),"BASELINE_SUBJECT_ID_MISMATCH_OR_DUPLICATE");seenSubjects.add(subjectId);
   if(itemBased){
    const skill=tb2eSkillInfo(s.skillName);check(skill.ok,"BASELINE_SOURCED_SKILL_REQUIRED");
    const name=s.skillName.trim().toLowerCase();check(!seenSkills.has(name),"BASELINE_SKILL_SUBJECT_AMBIGUOUS");seenSkills.add(name);
    check(!seenItems.has(s.itemId),"BASELINE_ITEM_SUBJECT_AMBIGUOUS");seenItems.add(s.itemId);
   }
   check(Number.isSafeInteger(s.rating)&&(s.kind==="LEARNING"?s.rating===0:s.rating>=(s.kind==="NATURE"?0:1)&&s.rating<=(s.kind==="NATURE"?7:6)),
    "BASELINE_RATING_SCOPE_REQUIRED");
   check(s.kind==="NATURE"?Number.isSafeInteger(s.currentNature)&&s.currentNature>=0&&s.currentNature<=s.rating:s.currentNature===null,
    "BASELINE_NATURE_STATE_REQUIRED");
   const counters=review(s.counters,s.kind==="LEARNING"?["attempts"]:["passed","failed"]);
   check(s.kind!=="NATURE"||s.rating!==0||counters===null||(counters.passed===0&&counters.failed===0),"RETIRED_NATURE_COUNTERS_MUST_BE_ZERO_OR_UNKNOWN");
   return {subjectId,epochId:s.epochId,kind:s.kind,itemId:s.itemId,skillName:s.skillName,rating:s.rating,currentNature:s.currentNature,
    counterState:s.counters.state,counters,reviewId:s.counters.reviewId,reviewerId:s.counters.reviewerId,
    observedFromFoundry:false,historicalCountsAuthenticated:false,advancementAuthorized:false,
    natureZeroLossResolutionRequired:s.kind==="NATURE"&&s.currentNature===0&&s.rating>0,
    natureRetiredState:s.kind==="NATURE"&&s.rating===0};
  });
  const supplyItems=new Set();
  const supplies=input.supplies.map(s=>{
   check(exact(s,["itemId","unitId","skillName","incrementDefinition","unitReviewId","unitReviewerId","quantityMapping","stock"]),
    "SUPPLY_UNIT_FIELDS_REQUIRED");
   check(id(s.itemId)&&id(s.unitId)&&!seenUnits.has(s.unitId)&&!supplyItems.has(s.itemId),"SUPPLY_UNIT_ID_AMBIGUOUS");
   seenUnits.add(s.unitId);supplyItems.add(s.itemId);
   check(typeof s.skillName==="string"&&s.skillName.trim().length>0&&s.skillName.length<=128&&
    typeof s.incrementDefinition==="string"&&s.incrementDefinition.trim().length>0&&s.incrementDefinition.length<=512&&
    id(s.unitReviewId)&&s.unitReviewerId===input.gmId,"EXPLICIT_SUPPLY_UNIT_REVIEW_REQUIRED");
   check(tb2eSkillInfo(s.skillName).ok,"SUPPLY_SOURCED_SKILL_REQUIRED");
   check(s.quantityMapping==="NO_AUTOMATIC_CONVERSION","QUANTITY_IS_NOT_SUPPLY_INCREMENTS");
   const stock=review(s.stock,["increments"]);
   return {itemId:s.itemId,unitId:s.unitId,skillName:s.skillName,incrementDefinition:s.incrementDefinition,
    unitReviewId:s.unitReviewId,unitReviewerId:s.unitReviewerId,stockState:s.stock.state,stock,
    stockReviewId:s.stock.reviewId,stockReviewerId:s.stock.reviewerId,
    incrementAvailable:stock===null?null:stock.increments>0,quantityDecrementPlanned:false,supplySpent:false,
    classificationSource:"DECLARED_GM_REVIEW_NOT_BOOK_UNIT_TABLE",supplyIncrementAuthenticated:false};
  });
  return result(true,null,{mode:"PROSPECTIVE_EVIDENCE_BASELINE_CONTRACT_READ_ONLY",sourceEvidence:"DH 68-69,72-75,108-110",
   schemaVersion:1,worldId:input.worldId,actorId:input.actorId,declaredGmId:input.gmId,subjects,supplies,
   evidenceScope:"EXPLICIT_GM_REVIEW_DECLARATIONS_NOT_DOCUMENT_OBSERVATIONS",missingHistoryPreserved:true,
   eventApplicationImplemented:false,baselineStored:false,quantityConversionApplied:false,completeModelLifecycleVerified:false});
 }catch(error){return result(false,error instanceof TraceError?error.message:"BASELINE_CONTRACT_READ_FAILED",
  {mode:"PROSPECTIVE_EVIDENCE_BASELINE_CONTRACT_READ_ONLY",eventApplicationImplemented:false,baselineStored:false});}
}


/** Replays a reviewed dataset against saved native Legacy outcomes. Never
 * updates the dataset/Actor/Item, spends or evaluates a Roll. Supply use and
 * rating-change reviews remain explicit GM assertions, not captured causes.
 */
export function tb2ePackageAEvidenceReplayPlan(input={}){
 try{
  const exact=(o,keys)=>fields(o,keys)&&keys.every(k=>Object.hasOwn(o,k));
  const g=globalThis.game,gm=g?.user;
  check(g?.ready&&g.system?.id==="realm-guard"&&gm?.active&&gm.isGM===true&&g.users?.get(gm.id)===gm,"CURRENT_SESSION_GM_REQUIRED");
  check(exact(input,["baseline","events","previousEventIds","previousCreditKeys","previousSupplyTestIds"]),"REPLAY_ENVELOPE_REQUIRED");
  const baseline=tb2ePackageAEvidenceBaselinePlan(input.baseline);check(baseline.ok,"REPLAY_"+baseline.reasonCode);
  check(baseline.worldId===g.world?.id&&baseline.declaredGmId===gm.id,"REPLAY_WORLD_GM_MISMATCH");
  const actor=g.actors?.get(baseline.actorId);check(actor?.documentName==="Actor"&&actor.type==="character"&&!actor.isToken&&!actor.inCompendium,"REPLAY_WORLD_CHARACTER_REQUIRED");
  check(Array.isArray(input.events)&&input.events.length<=500,"REPLAY_EVENT_LIMIT");
  for(const key of ["previousEventIds","previousCreditKeys","previousSupplyTestIds"])
   check(Array.isArray(input[key])&&input[key].length<=2000&&input[key].every(v=>key==="previousCreditKeys"?typeof v==="string"&&v.length>0&&v.length<=512:id(v))&&new Set(input[key]).size===input[key].length,"REPLAY_REVIEWED_PRIOR_IDS_REQUIRED");
  const events=new Set(input.previousEventIds),credits=new Set(input.previousCreditKeys),supplyTests=new Set(input.previousSupplyTestIds);
  const subjects=new Map(baseline.subjects.map(s=>[s.subjectId,JSON.parse(JSON.stringify(s))]));
  const supplies=new Map(baseline.supplies.map(s=>[s.unitId,JSON.parse(JSON.stringify(s))]));
  const epochs=new Set(baseline.subjects.map(s=>`${s.subjectId}:${s.epochId}`)),history=[],savedCache=new Map();
  const saved=id=>{
   if(savedCache.has(id))return savedCache.get(id);
   const evidence=tb2ePackageASavedLegacyAuditEvidence({traceMessageId:id});check(evidence.ok,"REPLAY_"+evidence.reasonCode);
   check(evidence.testIdentity.actorId===baseline.actorId&&evidence.testIdentity.worldId===baseline.worldId,"REPLAY_TEST_ACTOR_MISMATCH");
   const record=JSON.parse(JSON.stringify(g.messages.get(id).flags["realm-guard"].packageAAudit));
   const data={evidence,record};savedCache.set(id,data);return data;
  };
  const increment=(value,key,delta)=>{
   if(value===null)return null;
   check(count(value[key]+delta)&&value[key]+delta<Number.MAX_SAFE_INTEGER,"REPLAY_COUNT_OVERFLOW_OR_UNDERFLOW");
   return {...value,[key]:value[key]+delta};
  };
  for(const [sequence,e] of input.events.entries()){
   check(e&&id(e.eventId)&&e.sequence===sequence&&!events.has(e.eventId)&&id(e.reviewId)&&e.reviewerId===gm.id,"REPLAY_EVENT_ID_SEQUENCE_OR_REVIEW_INVALID");
   events.add(e.eventId);
   if(e.type==="TEST_CREDIT"){
    check(exact(e,["eventId","sequence","type","reviewId","reviewerId","subjectId","epochId","traceMessageId","context","gmEligibilityReviewed"]),"REPLAY_CREDIT_FIELDS_REQUIRED");
    const subject=subjects.get(e.subjectId);check(subject?.kind==="SKILL"&&subject.epochId===e.epochId,"REPLAY_CREDIT_SUBJECT_EPOCH_UNSUPPORTED");
    check(e.context==="ADVENTURE"&&e.gmEligibilityReviewed===true,"REPLAY_INDEPENDENT_ADVENTURE_REVIEW_REQUIRED");
    const {evidence,record}=saved(e.traceMessageId),source=record.nativeObservation.skillSource;
    check(evidence.skillItemId===subject.itemId&&source.rating===subject.rating&&source.name.trim().toLowerCase()===subject.skillName.trim().toLowerCase(),"REPLAY_CAPTURED_SKILL_SOURCE_MISMATCH");
    const creditKey=`${evidence.testIdentity.testId}:${subject.subjectId}`;
    check(!credits.has(creditKey),"REPLAY_DUPLICATE_TEST_CREDIT");credits.add(creditKey);
    const projection=tb2ePackageAProgressAfterTestPlan({skillName:subject.skillName,mode:"SKILL",outcome:evidence.recordedLegacyOutcome,
     obstacle:record.obstacle,gmConfirmedLegalTest:true,actingConditions:record.nativeObservation.startingActorSnapshot.conditions,
     conditionsGmReviewed:true,skillAlreadyKnown:true,context:"ADVENTURE",alreadyCountedInContext:false,wentToTiebreaker:false});
    check(projection.ok,"REPLAY_PROGRESS_"+projection.reasonCode);
    const mark=projection.wouldRecordMark?projection.proposedMark:null,before=subject.counters;
    subject.counters=mark?increment(before,mark==="PASS"?"passed":"failed",1):before;
    history.push({eventId:e.eventId,type:e.type,subjectId:e.subjectId,epochId:e.epochId,testId:evidence.testIdentity.testId,
     nativeOutcome:evidence.recordedLegacyOutcome,proposedMark:mark,suppressedReason:projection.reasonCode,before,after:subject.counters});
   }else if(e.type==="SUPPLY_USE"){
    check(exact(e,["eventId","sequence","type","reviewId","reviewerId","unitId","traceMessageId","gmUseReviewed"]),"REPLAY_SUPPLY_USE_FIELDS_REQUIRED");
    const supply=supplies.get(e.unitId);check(supply&&e.gmUseReviewed===true,"REPLAY_SUPPLY_REVIEW_REQUIRED");
    const {evidence,record}=saved(e.traceMessageId),testId=evidence.testIdentity.testId;
    check(record.nativeObservation.skillSource.name.trim().toLowerCase()===supply.skillName.trim().toLowerCase(),"REPLAY_SUPPLY_SKILL_MISMATCH");
    check(!supplyTests.has(testId),"REPLAY_ONE_SUPPLY_INCREMENT_PER_TEST");supplyTests.add(testId);
    const before=supply.stock;check(before===null||before.increments>=1,"REPLAY_INSUFFICIENT_SUPPLY_STOCK");
    supply.stock=increment(before,"increments",-1);supply.incrementAvailable=supply.stock===null?null:supply.stock.increments>0;
    history.push({eventId:e.eventId,type:e.type,unitId:e.unitId,testId,before,after:supply.stock,
     useGmAsserted:true,supplyBonusCaptured:false,stockSufficiencyVerified:before!==null});
   }else if(e.type==="SUPPLY_REPLENISH"){
    check(exact(e,["eventId","sequence","type","reviewId","reviewerId","unitId","increments"]),"REPLAY_REPLENISH_FIELDS_REQUIRED");
    const supply=supplies.get(e.unitId);check(supply&&count(e.increments)&&e.increments>0&&e.increments<Number.MAX_SAFE_INTEGER,"REPLAY_REPLENISH_AMOUNT_REQUIRED");
    const before=supply.stock;supply.stock=increment(before,"increments",e.increments);supply.incrementAvailable=supply.stock===null?null:supply.stock.increments>0;
    history.push({eventId:e.eventId,type:e.type,unitId:e.unitId,before,after:supply.stock,replenishmentGmAsserted:true});
   }else if(e.type==="SUBJECT_RESET"){
    check(exact(e,["eventId","sequence","type","reviewId","reviewerId","subjectId","epochId","nextEpochId","reason","nextRating","nextCurrentNature","conditions"]),"REPLAY_RESET_FIELDS_REQUIRED");
    const subject=subjects.get(e.subjectId);check(subject&&subject.kind!=="LEARNING"&&subject.epochId===e.epochId&&id(e.nextEpochId),"REPLAY_RESET_SUBJECT_EPOCH_REQUIRED");
    const epochKey=`${subject.subjectId}:${e.nextEpochId}`;check(!epochs.has(epochKey),"REPLAY_EPOCH_REUSE");
    const nature=subject.kind==="NATURE",cap=nature?7:6;
    check(Number.isSafeInteger(e.nextRating)&&e.nextRating>=(nature?0:1)&&e.nextRating<=cap&&
     (nature?Number.isSafeInteger(e.nextCurrentNature)&&e.nextCurrentNature>=0&&e.nextCurrentNature<=e.nextRating:e.nextCurrentNature===null),"REPLAY_RESET_RATINGS_INVALID");
    const conditionGate=tb2eConditionCapabilityPlan({conditions:e.conditions,capability:"ADVANCEMENT_LOGGING"});
    check(Array.isArray(e.conditions)&&conditionGate.ok,"REPLAY_RESET_CONDITIONS_REQUIRED");
    if(e.reason==="ADVANCE"){
     check(conditionGate.allowed&&!conditionGate.conditions.includes("DEAD"),"REPLAY_ADVANCEMENT_CONDITION_BLOCKED");
     check(subject.counters!==null&&subject.rating>0&&subject.rating<cap&&e.nextRating===subject.rating+1&&
      subject.counters.passed>=subject.rating&&subject.counters.failed>=subject.rating-1&&
      (!nature||subject.currentNature>0&&e.nextCurrentNature===subject.currentNature+1),"REPLAY_ADVANCEMENT_NOT_EVIDENCED");
    }else if(e.reason==="RATING_LOSS"){
     check(!nature&&e.nextRating<subject.rating,"REPLAY_RATING_LOSS_INVALID");
    }else if(["NATURE_ZERO_LOSS","CONSERVE_NATURE"].includes(e.reason)){
     check(nature&&subject.rating>0&&e.nextRating===subject.rating-1&&e.nextCurrentNature===e.nextRating&&
      (e.reason==="NATURE_ZERO_LOSS"?subject.currentNature===0:subject.currentNature>0),"REPLAY_NATURE_LOSS_INVALID");
    }else check(false,"REPLAY_RESET_REASON_UNSUPPORTED");
    const before=JSON.parse(JSON.stringify(subject));epochs.add(epochKey);
    subject.epochId=e.nextEpochId;subject.rating=e.nextRating;subject.currentNature=e.nextCurrentNature;
    subject.counters={passed:0,failed:0};subject.counterState="GM_REVIEWED";subject.reviewId=e.reviewId;subject.reviewerId=e.reviewerId;
    subject.natureZeroLossResolutionRequired=false;subject.natureRetiredState=nature&&e.nextRating===0;
    history.push({eventId:e.eventId,type:e.type,reason:e.reason,before,after:JSON.parse(JSON.stringify(subject)),ratingChangeGmAsserted:true});
   }else check(false,"REPLAY_EVENT_TYPE_UNSUPPORTED");
  }
  return result(true,null,{mode:"SAVED_NATIVE_EVIDENCE_REPLAY_READ_ONLY",sourceEvidence:"DH 68-69,73-75,108-110; SG87",
   subjects:[...subjects.values()],supplies:[...supplies.values()],eventHistory:history,
   reviewedEventIds:[...events],reviewedCreditKeys:[...credits],reviewedSupplyTestIds:[...supplyTests],
   replayCheckScope:"EXPLICIT_DATASET_AND_REVIEWED_PRIOR_IDS_NOT_DURABLE_WORLD_INDEX",
   baselineStored:false,eventApplicationImplemented:true,eventProjectionOnly:true,
   captureStorageImplemented:false,supplyBonusCaptureVerified:false,completeModelLifecycleVerified:false});
 }catch(error){return result(false,error instanceof TraceError?error.message:"EVIDENCE_REPLAY_READ_FAILED",
  {mode:"SAVED_NATIVE_EVIDENCE_REPLAY_READ_ONLY",eventProjectionOnly:true,baselineStored:false});}
}
