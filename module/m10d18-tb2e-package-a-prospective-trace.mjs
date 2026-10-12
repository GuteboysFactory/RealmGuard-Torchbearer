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
