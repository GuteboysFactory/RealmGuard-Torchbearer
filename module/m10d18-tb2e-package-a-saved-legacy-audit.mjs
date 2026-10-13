import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageAActorEvidence} from "./m10d18-tb2e-package-a-actor-evidence.mjs";
import {tb2ePackageADocumentEvidence} from "./m10d18-tb2e-package-a-document-provenance.mjs";

const result=(ok,reasonCode=null,data={})=>freezeTb2e({ok,reasonCode,phase:"M10D.18_PACKAGE_A",
 mode:"SAVED_PRIVATE_LEGACY_AUDIT_READ_ONLY",sourceEvidence:"SG 31,87; DH 59",liveApplication:false,writesPlanned:0,
 actorWrite:false,itemWrite:false,journalWrite:false,settingsWrite:false,rollExecuted:false,
 resourceSpendCommitted:false,advancementWrite:false,learningWrite:false,
 actorSourceAuthenticated:false,rollSourceAuthenticated:false,gmPermissionAuthenticated:false,
 historicalRewardBalanceVerified:false,rollTimeActorStateVerified:false,playerConsentAuthenticated:false,
 immutableChronologyVerified:false,duplicateTestCheckAuthenticated:false,completeTestHistoryVerified:false,
 noAdvanceAuthorized:true,...data});

// Separate bounded multi-Roll contract; the general single-Roll adapter stays narrow.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function savedActorGmSource(message,r){
 const actor=tb2ePackageAActorEvidence({actorId:r.actorId});
 if(!actor.ok)return actor;
 const worldActor=globalThis.game.actors.get(r.actorId),o=r.nativeObservation,snapshot=o?.startingActorSnapshot;
 if(message.speaker?.actor!==r.actorId||message.speakerActor!==worldActor||message.speaker?.scene||message.speaker?.token)
  return {ok:false,reasonCode:"WORLD_ACTOR_SPEAKER_MISMATCH"};
 if(typeof globalThis.Roll!=="function"||!Array.isArray(message.rolls)||
  message.rolls.some(roll=>roll?.constructor!==globalThis.Roll))
  return {ok:false,reasonCode:"SAVED_LEGACY_NATIVE_ROLL_IDENTITY_REQUIRED"};
 const sources=snapshot?.currentSkillItems;
 const owned=worldActor.items?.get(r.skillItemId);
 if(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||o.testIdentity?.worldId!==r.worldId||
  o.testIdentity?.actorId!==r.actorId||o.currentGmId!==r.gmId||snapshot?.actorId!==r.actorId||
  snapshot.currentGmId!==r.gmId||snapshot.actorUuid!==actor.actorUuid||!owned||owned.type!=="role"||
  o.skillSource?.itemId!==r.skillItemId||!Array.isArray(sources)||sources.filter(i=>i.itemId===r.skillItemId).length!==1||
  !same(sources.find(i=>i.itemId===r.skillItemId),o.skillSource)||
  !Number.isSafeInteger(o.skillSource.rating)||o.skillSource.rating<1||o.skillSource.rating>6)
  return {ok:false,reasonCode:"SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH"};
 for(const flag of ["rollSourceAuthenticated","actorSourceAuthenticated","gmPermissionAuthenticated","playerConsentAuthenticated",
  "rollTimeActorStateVerified","historicalRewardBalanceVerified","completeTestHistoryVerified","immutableChronologyVerified",
  "duplicateTestCheckAuthenticated","spendCauseAuthenticated","captureOfLegacyExecutionProven"])
  if(o[flag]!==false)return {ok:false,reasonCode:"EDITABLE_AUDIT_ATTESTATION_REJECTED"};
 return {ok:true,actorEvidence:actor};
}

function savedFateEvidence(message,r){
 const actor=tb2ePackageAActorEvidence({actorId:r.actorId});
 if(!actor.ok)return actor;
 const worldActor=globalThis.game.actors.get(r.actorId);
 if(message.speaker?.actor!==r.actorId||message.speakerActor!==worldActor||message.speaker?.scene||message.speaker?.token)
  return {ok:false,reasonCode:"WORLD_ACTOR_SPEAKER_MISMATCH"};
 const o=r.nativeObservation,events=o?.nativeEventHistory,rolls=message.rolls;
 if(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||
  o.testIdentity?.worldId!==r.worldId||o.testIdentity?.actorId!==r.actorId||o.currentGmId!==r.gmId||
  o.startingActorSnapshot?.actorId!==r.actorId||o.startingActorSnapshot?.currentGmId!==r.gmId||
  o.skillSource?.itemId!==r.skillItemId||!actor.currentSkillItems.some(i=>i.itemId===r.skillItemId)||
  !Array.isArray(events)||events.length<1||events.length>30||!Array.isArray(rolls)||rolls.length!==events.length+1)
  return {ok:false,reasonCode:"SAVED_LEGACY_FATE_SCOPE_MISMATCH"};
 const resolved=[],seenRolls=new Set();let parents=[],count=0;
 for(let n=0;n<rolls.length;n++){
  const roll=rolls[n],term=roll?.terms?.[0],record=n?events[n-1]?.record:o.baseRecord;
  const recordId=n?`${r.testId}:luck${n-1}`:`${r.testId}:base`;
  const Die=globalThis.foundry?.dice?.terms?.Die;
  if(typeof globalThis.Roll!=="function"||roll?.constructor!==globalThis.Roll||seenRolls.has(roll)||roll._evaluated!==true||
   !Array.isArray(roll.terms)||roll.terms.length!==1||typeof Die!=="function"||term?.constructor!==Die||term.faces!==6||
   !Number.isSafeInteger(term.number)||term.number<1||term.number>250||roll.formula!==`${term.number}d6`||
   !Array.isArray(term.modifiers)||term.modifiers.length||!Array.isArray(term.results)||term.results.length!==term.number||
   !term.results.every(d=>Number.isSafeInteger(d.result)&&d.result>=1&&d.result<=6&&d.active===true&&!d.discarded&&!d.rerolled&&!d.exploded))
   return {ok:false,reasonCode:"SAVED_LEGACY_FATE_NATIVE_INVALID"};
  seenRolls.add(roll);count+=term.number;
  if(count>500)return {ok:false,reasonCode:"SAVED_LEGACY_FATE_HISTORY_LIMIT"};
  const dice=term.results.map((d,i)=>({dieId:`${recordId}:${i}`,face:d.result,lastResultDieId:`${recordId}:${i}`}));
  if(roll.total!==dice.reduce((v,d)=>v+d.face,0)||record?.recordId!==recordId||record.formula!==roll.formula||record.total!==roll.total||
   !Array.isArray(record.dice)||record.dice.length!==dice.length||record.dice.some((d,i)=>d.dieId!==dice[i].dieId||d.face!==dice[i].face))
   return {ok:false,reasonCode:"SAVED_LEGACY_FATE_NATIVE_MISMATCH"};
  if(n){
   const event=events[n-1];
   if(event.kind!=="LEGACY_FATE_ROUND"||!parents.length||parents.length!==dice.length||!Array.isArray(event.links)||
    event.links.length!==dice.length||event.links.some((link,i)=>link.resultDieId!==dice[i].dieId||link.parentDieId!==parents[i]||link.parentResultDieId!==parents[i]))
    return {ok:false,reasonCode:"SAVED_LEGACY_FATE_LINEAGE_MISMATCH"};
  }
  resolved.push(...dice);parents=dice.filter(d=>d.face===6).map(d=>d.dieId);
 }
 if(parents.length||!same(o.resolvedObservedDice,resolved))return {ok:false,reasonCode:"SAVED_LEGACY_FATE_CHAIN_INCOMPLETE"};
 const spends=o.resourceChanges,start=o.startingActorSnapshot?.currentRewards,end=o.observedEndingRewards;
 const valid=v=>Number.isSafeInteger(v)&&v>=0;
 if(!Array.isArray(spends)||spends.length!==1||!valid(start?.fate)||!valid(start?.persona)||!valid(end?.fate)||!valid(end?.persona)||
  start.fate<1||end.fate!==start.fate-1||end.persona!==start.persona||spends[0].sequence!==0||spends[0].actorId!==r.actorId||
  spends[0].resource!=="fate"||spends[0].amount!==1||spends[0].before!==start.fate||spends[0].after!==end.fate)
  return {ok:false,reasonCode:"SAVED_LEGACY_FATE_BALANCE_MISMATCH"};
 return {ok:true,dice:resolved,baseFaces:o.baseRecord.dice.map(d=>d.face),nativeRoundCount:events.length,
  recordedBalanceDeltaConsistent:true,actorEvidence:actor};
}

/** Resolves saved current-session private native evidence. Never interprets
 * Legacy Wise/Fate as TB costs or trusts editable flags as attestation.
 */
export function tb2ePackageASavedLegacyAuditEvidence({traceMessageId=null}={}){
 try{
  const g=globalThis.game,gm=g?.user;
  if(!g?.ready||g.system?.id!=="realm-guard")return result(false,"READY_REALM_GUARD_SESSION_REQUIRED");
  if(!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)return result(false,"CURRENT_SESSION_GM_REQUIRED");
  if(typeof traceMessageId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(traceMessageId))return result(false,"DOCUMENT_IDS_REQUIRED");
  const message=g.messages?.get(traceMessageId);
  if(!message||message.documentName!=="ChatMessage"||message.visible!==true||message.isContentVisible!==true||
    message.author!==gm||!Array.isArray(message.whisper)||message.whisper.length!==1||message.whisper[0]!==gm.id)
    return result(false,"PRIVATE_CURRENT_GM_AUDIT_MESSAGE_REQUIRED");
  const r=message.flags?.["realm-guard"]?.packageAAudit;
  const fateScope=r?.schemaVersion===2&&r.kind==="LEGACY_ROLE_AUDIT_BASE_FATE";
  if(!r||(!fateScope&&(r.schemaVersion!==1||r.kind!=="LEGACY_ROLE_AUDIT_BASE_ONLY"))||r.sourceProfileId!=="realm-guard-legacy-mixed"||
    r.worldId!==g.world?.id||r.gmId!==gm.id||typeof r.testId!=="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(r.testId))
    return result(false,"SAVED_LEGACY_AUDIT_SCOPE_MISMATCH");
  if(r.status!==(fateScope?"BASE_FATE_SCOPE_RECORDED":"BASE_SCOPE_RECORDED")||r.reasonCode!==null||r.legacyOutcome?.fateSpent!==fateScope)
    return result(false,"SAVED_LEGACY_AUDIT_INCOMPLETE");
  if(r.authenticated!==false||r.completeTestHistoryVerified!==false)return result(false,"EDITABLE_AUDIT_ATTESTATION_REJECTED");
  const original=g.messages.get(r.legacyMessageId);
  if(!original||original===message||original.documentName!=="ChatMessage"||original.visible!==true||original.isContentVisible!==true||
    original.author!==gm||original.speaker?.actor!==r.actorId||original.speakerActor!==g.actors?.get(r.actorId)||original.speaker?.token)
    return result(false,"SAVED_LEGACY_ORIGINAL_MESSAGE_REQUIRED");
  const source=savedActorGmSource(message,r);
  if(!source.ok)return result(false,source.reasonCode);
  const evidence=fateScope?savedFateEvidence(message,r):tb2ePackageADocumentEvidence({actorId:r.actorId,messageId:traceMessageId});
  if(!evidence.ok)return result(false,evidence.reasonCode);
  const o=r.nativeObservation,base=o?.baseRecord;
  if(!fateScope&&(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||
    o.testIdentity?.worldId!==r.worldId||o.testIdentity?.actorId!==r.actorId||o.skillSource?.itemId!==r.skillItemId||
    !Array.isArray(base?.dice)||base.dice.length!==evidence.dice.length||
    base.dice.some((d,i)=>d.face!==evidence.dice[i].face||d.dieId!==`${r.testId}:base:${i}`)||
    base.recordId!==`${r.testId}:base`||base.formula!==`${base.dice.length}d6`||
    base.total!==evidence.dice.reduce((n,d)=>n+d.face,0)||
    !Array.isArray(o.nativeEventHistory)||o.nativeEventHistory.length||!Array.isArray(o.resourceChanges)||o.resourceChanges.length))
    return result(false,"SAVED_LEGACY_NATIVE_BASE_MISMATCH");
  const successes=evidence.dice.filter(d=>d.face>=4).length;
  if(!Number.isSafeInteger(r.obstacle)||r.obstacle<1||r.legacyOutcome.successes!==successes||
    r.legacyOutcome.outcome!==(successes>=r.obstacle?"PASS":"FAIL"))return result(false,"SAVED_LEGACY_FINAL_MISMATCH");
  const duplicate=[...g.messages.values()].filter(m=>m!==message&&m.visible===true&&m.isContentVisible===true&&
    m.flags?.["realm-guard"]?.packageAAudit?.worldId===r.worldId&&m.flags?.["realm-guard"]?.packageAAudit?.testId===r.testId);
  if(duplicate.length)return result(false,"SAVED_LEGACY_DUPLICATE_TEST_IN_CURRENT_MESSAGES");
  return result(true,null,{testIdentity:{worldId:r.worldId,testId:r.testId,actorId:r.actorId},
    traceMessageId,legacyMessageId:original.id,skillItemId:r.skillItemId,savedNativeEvidence:evidence,
    baseFaces:fateScope?evidence.baseFaces:evidence.dice.map(d=>d.face),
    nativeFateRoundCount:fateScope?evidence.nativeRoundCount:0,
    savedFateChainConsistent:fateScope,recordedLegacyOutcome:r.legacyOutcome.outcome,
    evidenceScope:fateScope?"CURRENT_MUTABLE_PRIVATE_CHAT_AND_NATIVE_BASE_FATE":"CURRENT_MUTABLE_PRIVATE_CHAT_AND_NATIVE_BASE_ONLY",
    storedNativeBaseAndLinkedOutcomeAgree:true,recordedActorGmSourceConsistent:true,
    permissionEvidenceScope:"CURRENT_REGISTERED_GM_ONLY_NOT_HISTORICAL_OWNER",historicalSnapshotAuthentication:false});
 }catch{return result(false,"SAVED_LEGACY_AUDIT_READ_FAILED");}
}
