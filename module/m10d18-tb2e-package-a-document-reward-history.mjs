import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageADocumentEvidence,tb2ePackageADocumentOutcomePlan} from "./m10d18-tb2e-package-a-document-provenance.mjs";
import {tb2ePackageARewardedRollHistoryPlan} from "./m10d18-tb2e-package-a-rewarded-roll-history.mjs";

const response=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
  mode:"SAVED_DOCUMENT_REWARD_HISTORY_READ_ONLY",sourceEvidence:"DH 77; SG 47,87-88",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,resourceSpendCommitted:false,
  advancementWrite:false,learningWrite:false,noAdvanceAuthorized:true,
  rollSourceAuthenticated:false,actorSourceAuthenticated:false,gmPermissionAuthenticated:false,
  rollTimeActorStateVerified:false,historicalRewardBalanceVerified:false,
  eventLinksGmAsserted:true,wiseRelatednessGmAsserted:true,
  immutableChronologyVerified:false,...data
});
const fail=code=>response(false,code);
class EvidenceReadError extends Error {}
const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&
  Object.keys(o).every(k=>keys.includes(k));
const ids=(xs,max=250)=>Array.isArray(xs)&&xs.length>0&&xs.length<=max&&
  xs.every(x=>typeof x==="string"&&x.length>0&&x.length<=128)&&new Set(xs).size===xs.length;

/** Saved faces are read from actual session messages; caller supplies only
 * semantic links and explicitly unverified historical reward balances.
 * Timestamps establish stored ordering, never immutable execution ordering.
 * No HTML/flag inference, capture hooks, messages, RNG, or live mutations.
 */
export function tb2ePackageADocumentRewardHistoryPlan(options={}){
  // Check session/document permission before inspecting any event declarations.
  const first=tb2ePackageADocumentEvidence({actorId:options?.actorId,messageId:options?.initialMessageId});
  if(!first.ok)return fail(first.reasonCode);
  try {
    if(!fields(options,["actorId","initialMessageId","scenarioInput","events",
      "gmEventLinksReviewed","fateAtRollStartGmAsserted","personaAtRollStartGmAsserted"]))
      return fail("UNSUPPORTED_DOCUMENT_HISTORY_FIELDS");
    const {actorId,initialMessageId,scenarioInput,events,gmEventLinksReviewed,
      fateAtRollStartGmAsserted,personaAtRollStartGmAsserted}=options;
    if(gmEventLinksReviewed!==true)return fail("GM_EVENT_LINK_REVIEW_REQUIRED");
    if(!Array.isArray(events)||events.length>3)return fail("INVALID_DOCUMENT_REWARD_EVENTS");
    if(!Number.isSafeInteger(fateAtRollStartGmAsserted)||fateAtRollStartGmAsserted<0||
       !Number.isSafeInteger(personaAtRollStartGmAsserted)||personaAtRollStartGmAsserted<0)
      return fail("GM_ASSERTED_HISTORICAL_REWARDS_REQUIRED");
    const initialCheck=tb2ePackageADocumentOutcomePlan({actorId,messageId:initialMessageId,scenarioInput});
    if(!initialCheck.ok)return fail("INITIAL_"+initialCheck.reasonCode);
    if(first.messageTimestamp===null)return fail("SAVED_MESSAGE_TIMESTAMP_REQUIRED");
    const actor=globalThis.game.actors.get(actorId);
    const usedMessages=new Set([initialMessageId]),usedWiseNames=new Set();
    const documents=[first],eventEvidence=[],rewardEvents=[];
    let previousTimestamp=first.messageTimestamp;
    const readMessage=messageId=>{
      if(usedMessages.has(messageId))throw new EvidenceReadError("DOCUMENT_MESSAGE_REUSED");
      const doc=tb2ePackageADocumentEvidence({actorId,messageId});
      if(!doc.ok)throw new EvidenceReadError("EVENT_"+doc.reasonCode);
      if(doc.currentGmId!==first.currentGmId||doc.messageAuthorId!==first.messageAuthorId)
        throw new EvidenceReadError("DOCUMENT_HISTORY_USER_MISMATCH");
      if(doc.messageTimestamp===null)throw new EvidenceReadError("SAVED_MESSAGE_TIMESTAMP_REQUIRED");
      if(doc.messageTimestamp<=previousTimestamp)throw new EvidenceReadError("DOCUMENT_TIMESTAMP_ORDER_AMBIGUOUS");
      previousTimestamp=doc.messageTimestamp;usedMessages.add(messageId);documents.push(doc);
      return doc;
    };
    for(const event of events){
      if(!fields(event,["type","messageId","wiseItemId","related","targetDieId",
        "targetDieIds","rounds"]))return fail("INVALID_DOCUMENT_EVENT_FIELDS");
      if(!["DEEPER_UNDERSTANDING","OF_COURSE","FATE_LUCK"].includes(event.type))
        return fail("UNSUPPORTED_DOCUMENT_EVENT_TYPE");
      if(event.type==="FATE_LUCK"){
        if(!fields(event,["type","rounds"])||!Array.isArray(event.rounds)||
           event.rounds.length<1||event.rounds.length>30)return fail("INVALID_DOCUMENT_LUCK_ROUNDS");
        const rounds=[],links=[];
        for(const round of event.rounds){
          if(!fields(round,["messageId","parentDieIds"])||!ids(round.parentDieIds))
            return fail("INVALID_DOCUMENT_LUCK_PARENT_IDS");
          const doc=readMessage(round.messageId);
          if(doc.dice.length!==round.parentDieIds.length)return fail("DOCUMENT_LUCK_DICE_PARENT_COUNT_MISMATCH");
          rounds.push(doc.dice.map((d,i)=>({dieId:d.dieId,face:d.face,parentDieId:round.parentDieIds[i]})));
          links.push({messageId:doc.messageId,parentDieIds:round.parentDieIds.slice()});
        }
        rewardEvents.push({type:event.type,rounds});eventEvidence.push({type:event.type,rounds:links});
      }else{
        const keys=event.type==="DEEPER_UNDERSTANDING"?
          ["type","messageId","wiseItemId","related","targetDieId"]:
          ["type","messageId","wiseItemId","related","targetDieIds"];
        if(!fields(event,keys)||event.related!==true||typeof event.wiseItemId!=="string")
          return fail("GM_RELATED_CURRENT_WISE_REQUIRED");
        const wises=actor.items.filter(i=>i.type==="wise"&&i.id===event.wiseItemId);
        if(wises.length!==1||typeof wises[0].name!=="string"||!wises[0].name.trim())
          return fail("CURRENT_ACTOR_WISE_ITEM_REQUIRED");
        const wiseName=wises[0].name.trim().toLowerCase();
        if(usedWiseNames.has(wiseName))return fail("DUPLICATE_CURRENT_WISE_SUBJECT");
        usedWiseNames.add(wiseName);
        const doc=readMessage(event.messageId);
        if(event.type==="DEEPER_UNDERSTANDING"){
          if(doc.dice.length!==1||!ids([event.targetDieId],1))return fail("DOCUMENT_DEEPER_SINGLE_DIE_REQUIRED");
          rewardEvents.push({type:event.type,wiseId:event.wiseItemId,related:true,
            dieId:event.targetDieId,newFace:doc.dice[0].face});
          eventEvidence.push({type:event.type,messageId:doc.messageId,wiseItemId:event.wiseItemId,
            targetDieIds:[event.targetDieId],newResultDieIds:[doc.dice[0].dieId]});
        }else{
          if(!ids(event.targetDieIds)||doc.dice.length!==event.targetDieIds.length)
            return fail("DOCUMENT_OF_COURSE_DICE_TARGET_COUNT_MISMATCH");
          rewardEvents.push({type:event.type,wiseId:event.wiseItemId,related:true,
            rerolls:doc.dice.map((d,i)=>({dieId:event.targetDieIds[i],face:d.face}))});
          eventEvidence.push({type:event.type,messageId:doc.messageId,wiseItemId:event.wiseItemId,
            targetDieIds:event.targetDieIds.slice(),newResultDieIds:doc.dice.map(d=>d.dieId)});
        }
      }
    }
    const timeline=tb2ePackageARewardedRollHistoryPlan({scenarioInput,initialDice:first.dice,
      rewardEvents,gmDiceReviewed:true,gmEventHistoryReviewed:true,
      fateAvailable:fateAtRollStartGmAsserted,personaAvailable:personaAtRollStartGmAsserted});
    if(!timeline.ok)return fail("TIMELINE_"+timeline.reasonCode);
    return response(true,null,{actorId,initialMessageId,
      savedFacesReadFromDocuments:true,storedTimestampOrderChecked:true,
      currentWiseItemsObserved:eventEvidence.filter(e=>e.wiseItemId).map(e=>e.wiseItemId),
      documentEvidence:documents,eventEvidence,rewardTimelinePreview:timeline,
      historicalBalancesSource:"EXPLICIT_GM_ASSERTION_NOT_CURRENT_ACTOR_REWARDS",
      scenarioFactsStillGmAsserted:true,completeTestHistoryVerified:false});
  }catch(error){
    // Never expose arbitrary error strings from client getters or document code.
    return fail(error instanceof EvidenceReadError?
      error.message:"DOCUMENT_REWARD_HISTORY_READ_FAILED");
  }
}
