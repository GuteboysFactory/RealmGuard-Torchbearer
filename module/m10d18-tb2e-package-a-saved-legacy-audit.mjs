import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
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
 const abilityScope=r.schemaVersion===5&&r.kind==="LEGACY_ABILITY_AUDIT";
 const sources=snapshot?.currentSkillItems;
 const owned=worldActor.items?.get(r.skillItemId);
 if(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||o.testIdentity?.worldId!==r.worldId||
  o.testIdentity?.actorId!==r.actorId||o.currentGmId!==r.gmId||snapshot?.actorId!==r.actorId||
  snapshot.currentGmId!==r.gmId||snapshot.actorUuid!==actor.actorUuid||
  (abilityScope?(r.skillItemId!==null||!['will','health'].includes(r.abilityKey)||o.testMode!=="ABILITY"||
    o.abilitySource?.key!==r.abilityKey||snapshot.currentAbilities?.[r.abilityKey]!==o.abilitySource.rating||
    !Number.isSafeInteger(o.abilitySource.rating)||o.abilitySource.rating<1||o.abilitySource.rating>6):
   (!owned||owned.type!=="role"||o.skillSource?.itemId!==r.skillItemId||!Array.isArray(sources)||sources.filter(i=>i.itemId===r.skillItemId).length!==1||
    !same(sources.find(i=>i.itemId===r.skillItemId),o.skillSource)||!Number.isSafeInteger(o.skillSource.rating)||
    (r.schemaVersion===3?o.skillSource.rating!==0:o.skillSource.rating<1||o.skillSource.rating>6))))
  return {ok:false,reasonCode:"SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH"};
 if(r.schemaVersion===3){
  const skill=tb2eSkillInfo(o.skillSource.name),ability=o.abilitySource;
  if(!skill.ok||o.testMode!=="BEGINNERS_LUCK"||ability?.name!==skill.beginnersLuckAbility||
   !Number.isSafeInteger(ability.rating)||ability.rating<1||ability.rating>6||snapshot.currentAbilities?.[ability.name.toLowerCase()]!==ability.rating||
   !Number.isSafeInteger(o.skillSource.beginnerAttempts)||o.skillSource.beginnerAttempts<0||o.legacyLearningCounterChanged!==false)
   return {ok:false,reasonCode:"SAVED_LEGACY_BL_SOURCE_MISMATCH"};
 }
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
 const abilityScope=r.schemaVersion===5&&r.kind==="LEGACY_ABILITY_AUDIT";
 const o=r.nativeObservation,events=o?.nativeEventHistory,rolls=message.rolls;
 if(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||
  o.testIdentity?.worldId!==r.worldId||o.testIdentity?.actorId!==r.actorId||o.currentGmId!==r.gmId||
  o.startingActorSnapshot?.actorId!==r.actorId||o.startingActorSnapshot?.currentGmId!==r.gmId||
  (abilityScope?(o.testMode!=="ABILITY"||o.abilitySource?.key!==r.abilityKey||
    o.startingActorSnapshot.currentAbilities?.[r.abilityKey]!==o.abilitySource.rating):
   (o.skillSource?.itemId!==r.skillItemId||!actor.currentSkillItems.some(i=>i.itemId===r.skillItemId)))||
  !Array.isArray(events)||events.length>(abilityScope?31:30)||(!abilityScope&&events.length<1)||!Array.isArray(rolls)||rolls.length!==events.length+1)
  return {ok:false,reasonCode:"SAVED_LEGACY_FATE_SCOPE_MISMATCH"};
 const resolved=new Map(),seenRolls=new Set();let parents=[],count=0,fateRounds=0,wiseSeen=false;
 for(let n=0;n<rolls.length;n++){
  const roll=rolls[n],term=roll?.terms?.[0],event=n?events[n-1]:null,record=n?event?.record:o.baseRecord;
  const recordId=!n?`${r.testId}:base`:event?.kind==="LEGACY_MIXED_WISE_REROLL"?`${r.testId}:legacyWise`:`${r.testId}:luck${fateRounds++}`;
  if(n&&event?.kind==="LEGACY_MIXED_WISE_REROLL"&&record?.recordId!==recordId)return {ok:false,reasonCode:"SAVED_LEGACY_FATE_LINEAGE_MISMATCH"};
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
  if(!n){for(const d of dice)resolved.set(d.dieId,{...d,opened:false});parents=dice.filter(d=>d.face===6).map(d=>d.dieId);continue;}
  if(!Array.isArray(event.links)||event.links.length!==dice.length)return {ok:false,reasonCode:"SAVED_LEGACY_FATE_LINEAGE_MISMATCH"};
  if(event.kind==="LEGACY_MIXED_WISE_REROLL"){
   const targets=[...resolved.values()].filter(d=>d.face<4).map(d=>d.dieId);
   const wise=globalThis.game.actors.get(r.actorId)?.items?.get(event.wiseItemId);
   if(wiseSeen||fateRounds||wise?.type!=="wise"||!o.startingActorSnapshot?.currentWiseItems?.some(w=>w.itemId===event.wiseItemId)||
    !targets.length||event.torchbearerWiseEffectEquivalent!==false||targets.length!==dice.length||
    event.links.some((link,i)=>link.resultDieId!==dice[i].dieId||link.targetDieId!==targets[i]))return {ok:false,reasonCode:"SAVED_LEGACY_FATE_LINEAGE_MISMATCH"};
   targets.forEach((target,i)=>{const d=resolved.get(target);d.face=dice[i].face;d.lastResultDieId=dice[i].dieId;});wiseSeen=true;
  }else if(event.kind==="LEGACY_FATE_ROUND"){
   const live=[...resolved.values()].filter(d=>d.face===6&&!d.opened).map(d=>d.dieId);
   if(!live.length||live.length!==dice.length||event.links.some((link,i)=>link.resultDieId!==dice[i].dieId||link.parentDieId!==live[i]||link.parentResultDieId!==resolved.get(live[i]).lastResultDieId))return {ok:false,reasonCode:"SAVED_LEGACY_FATE_LINEAGE_MISMATCH"};
   live.forEach(id=>{resolved.get(id).opened=true;});for(const d of dice)resolved.set(d.dieId,{...d,opened:false});parents=dice.filter(d=>d.face===6).map(d=>d.dieId);
  }else return {ok:false,reasonCode:"SAVED_LEGACY_FATE_LINEAGE_MISMATCH"};
 }
 const resolvedList=[...resolved.values()].map(({dieId,face,lastResultDieId})=>({dieId,face,lastResultDieId}));
 if(fateRounds&&parents.length||!same(o.resolvedObservedDice,resolvedList))return {ok:false,reasonCode:"SAVED_LEGACY_FATE_CHAIN_INCOMPLETE"};
 const spends=o.resourceChanges,start=o.startingActorSnapshot?.currentRewards,end=o.observedEndingRewards;
 const valid=v=>Number.isSafeInteger(v)&&v>=0;
 if(!Array.isArray(spends)||spends.length!==(fateRounds?1:0)||!valid(start?.fate)||!valid(start?.persona)||!valid(end?.fate)||!valid(end?.persona)||
  (fateRounds?(start.fate<1||end.fate!==start.fate-1||end.persona!==start.persona||spends[0].sequence!==0||spends[0].actorId!==r.actorId||
  spends[0].resource!=="fate"||spends[0].amount!==1||spends[0].before!==start.fate||spends[0].after!==end.fate):(end.fate!==start.fate||end.persona!==start.persona)))
  return {ok:false,reasonCode:"SAVED_LEGACY_FATE_BALANCE_MISMATCH"};
 return {ok:true,dice:resolvedList,baseFaces:o.baseRecord.dice.map(d=>d.face),nativeRoundCount:fateRounds,
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
  const blScope=r?.schemaVersion===3&&r.kind==="LEGACY_BL_AUDIT";
  const abilityScope=r?.schemaVersion===5&&r.kind==="LEGACY_ABILITY_AUDIT";
  const fateScope=r?.schemaVersion===2&&r.kind==="LEGACY_ROLE_AUDIT_BASE_FATE"||blScope&&r.legacyOutcome?.fateSpent===true||abilityScope&&r.legacyOutcome?.fateSpent===true;
  const wiseScope=r?.schemaVersion===4&&r.kind==="LEGACY_ROLE_AUDIT_BASE_WISE";
  if(!r||(!abilityScope&&!blScope&&!fateScope&&!wiseScope&&(r.schemaVersion!==1||r.kind!=="LEGACY_ROLE_AUDIT_BASE_ONLY"))||r.sourceProfileId!=="realm-guard-legacy-mixed"||
    r.worldId!==g.world?.id||r.gmId!==gm.id||typeof r.testId!=="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(r.testId))
    return result(false,"SAVED_LEGACY_AUDIT_SCOPE_MISMATCH");
  if(r.status!==(abilityScope?(fateScope?"BASE_FATE_SCOPE_RECORDED":"ABILITY_SCOPE_RECORDED"):blScope?"BL_SCOPE_RECORDED":fateScope?"BASE_FATE_SCOPE_RECORDED":"BASE_SCOPE_RECORDED")||r.reasonCode!==null||r.legacyOutcome?.fateSpent!==fateScope)
    return result(false,"SAVED_LEGACY_AUDIT_INCOMPLETE");
  if(r.authenticated!==false||r.completeTestHistoryVerified!==false)return result(false,"EDITABLE_AUDIT_ATTESTATION_REJECTED");
  const original=g.messages.get(r.legacyMessageId);
  if(!original||original===message||original.documentName!=="ChatMessage"||original.visible!==true||original.isContentVisible!==true||
    original.author!==gm||original.speaker?.actor!==r.actorId||original.speakerActor!==g.actors?.get(r.actorId)||original.speaker?.token)
    return result(false,"SAVED_LEGACY_ORIGINAL_MESSAGE_REQUIRED");
  const source=savedActorGmSource(message,r);
  if(!source.ok)return result(false,source.reasonCode);
  const linkedHistory=abilityScope||fateScope||wiseScope||blScope&&r.nativeObservation?.nativeEventHistory?.length>0;
  const evidence=linkedHistory?savedFateEvidence(message,r):tb2ePackageADocumentEvidence({actorId:r.actorId,messageId:traceMessageId});
  if(!evidence.ok)return result(false,evidence.reasonCode);
  const o=r.nativeObservation,base=o?.baseRecord;
  if(!linkedHistory&&(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||
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
    baseFaces:linkedHistory?evidence.baseFaces:evidence.dice.map(d=>d.face),
    nativeFateRoundCount:linkedHistory?evidence.nativeRoundCount:0,testMode:abilityScope?"ABILITY":blScope?"BEGINNERS_LUCK":"SKILL",
    abilitySource:abilityScope||blScope?{...o.abilitySource}:null,legacyLearningCounterChanged:blScope?false:null,
    savedFateChainConsistent:linkedHistory,recordedLegacyOutcome:r.legacyOutcome.outcome,
    evidenceScope:abilityScope?"CURRENT_MUTABLE_PRIVATE_CHAT_AND_NATIVE_ABILITY_BASE_WISE_FATE":linkedHistory?"CURRENT_MUTABLE_PRIVATE_CHAT_AND_NATIVE_BASE_WISE_FATE":"CURRENT_MUTABLE_PRIVATE_CHAT_AND_NATIVE_BASE_ONLY",
    storedNativeBaseAndLinkedOutcomeAgree:true,recordedActorGmSourceConsistent:true,
    permissionEvidenceScope:"CURRENT_REGISTERED_GM_ONLY_NOT_HISTORICAL_OWNER",historicalSnapshotAuthentication:false});
 }catch{return result(false,"SAVED_LEGACY_AUDIT_READ_FAILED");}
}


const canonicalAudit=value=>JSON.stringify(value,(_key,v)=>v&&typeof v==="object"&&!Array.isArray(v)
 ?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const datasetSession=(g,gm,worldId)=>globalThis.game===g&&g.ready&&g.system?.id==="realm-guard"&&g.user===gm&&gm.active&&gm.isGM===true&&g.users?.get(gm.id)===gm&&g.world?.id===worldId;

/** SHA256 is a consistency checksum, never an issuer signature. */
export async function tb2ePackageAAuditTraceFingerprint({traceMessageId=null}={}){
 const evidence=tb2ePackageASavedLegacyAuditEvidence({traceMessageId});if(!evidence.ok)return evidence;
 try{
  const g=globalThis.game,gm=g.user,worldId=g.world.id,message=g.messages.get(traceMessageId);
  const {datasetId,reservationSequence,obstacle}=message.flags["realm-guard"].packageAAudit;
  if(datasetId!==undefined&&(typeof datasetId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(datasetId))||
   reservationSequence!==undefined&&(!Number.isSafeInteger(reservationSequence)||reservationSequence<0||reservationSequence>=128||datasetId===undefined))
   return result(false,"AUDIT_TRACE_DATASET_FIELDS_INVALID");
  const snapshot=()=>canonicalAudit({record:message.flags["realm-guard"].packageAAudit,rolls:message.rolls.map(r=>({formula:r.formula,total:r.total,
   faces:r.terms[0].results.map(d=>d.result)}))});
  const text=snapshot();if(text.length>524288)return result(false,"AUDIT_TRACE_CHECKSUM_SIZE_LIMIT");
  if(!globalThis.crypto?.subtle)return result(false,"AUDIT_CHECKSUM_API_UNAVAILABLE");
  const bytes=await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  if(!datasetSession(g,gm,worldId)||g.messages.get(traceMessageId)!==message)return result(false,"AUDIT_DATASET_SESSION_CHANGED");
  if(snapshot()!==text)return result(false,"AUDIT_TRACE_CHANGED_DURING_CHECKSUM");
  const refreshed=tb2ePackageASavedLegacyAuditEvidence({traceMessageId});if(!refreshed.ok)return refreshed;
  return result(true,null,{testIdentity:evidence.testIdentity,traceMessageId,legacyMessageId:evidence.legacyMessageId,
   skillItemId:evidence.skillItemId,testMode:evidence.testMode,outcome:evidence.recordedLegacyOutcome,
   datasetId:datasetId??null,reservationSequence:reservationSequence??null,obstacle,
   checksum:[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,"0")).join(""),checksumAuthenticated:false});
 }catch{return result(false,"AUDIT_TRACE_CHECKSUM_READ_FAILED");}
}

/** Reads a persisted, explicitly selected dataset; no repair, storage or RNG. */
export async function tb2ePackageAAuditDatasetEvidence({journalId=null}={}){
 try{
  const g=globalThis.game,gm=g?.user,worldId=g?.world?.id;
  if(!g?.ready||g.system?.id!=="realm-guard"||!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)return result(false,"CURRENT_SESSION_GM_REQUIRED");
  if(typeof journalId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(journalId))return result(false,"DOCUMENT_IDS_REQUIRED");
  const journal=g.journal?.get(journalId);
  if(!journal||journal.id!==journalId||journal.documentName!=="JournalEntry"||journal.visible!==true||journal.inCompendium||
   journal.ownership?.default!==0||journal.ownership?.[gm.id]!==3||Object.keys(journal.ownership).some(k=>k!=="default"&&k!==gm.id))
   return result(false,"PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  const original=journal.flags?.["realm-guard"]?.packageAAuditDataset,stable=canonicalAudit(original);
  const d=JSON.parse(stable??"null");
  const exact=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
  const ledgerEnabled=d?.schemaVersion===4,terminal=d?.schemaVersion===3||ledgerEnabled,reserved=d?.schemaVersion===2||terminal;
  if(!exact(d,["schemaVersion","kind","worldId","gmId","revision","entries","commits","assuranceModel","sourceProfileId","authenticated",...(reserved?["reservations"]:[]),...(terminal?["closures"]:[]),...(ledgerEnabled?["eventLedger"]:[])])||(!reserved&&d.schemaVersion!==1)||d.kind!=="LEGACY_AUDIT_DATASET"||d.worldId!==worldId||d.gmId!==gm.id||
   d.assuranceModel!=="TRUSTED_GM_R"||d.sourceProfileId!=="realm-guard-legacy-mixed"||d.authenticated!==false||
   !Number.isSafeInteger(d.revision)||d.revision<0||d.revision>(reserved?256:128)||!Array.isArray(d.entries)||d.entries.length>128||
   !Array.isArray(d.commits)||d.commits.length!==d.revision)
   return result(false,"AUDIT_DATASET_MANIFEST_INVALID");
  const committed=[],reservationTests=new Set(),reservedIds=[],indexedIds=[],closedIds=[],ledgerEventIds=[],ledgerTraceIds=[];
  if(reserved){
   if(!Array.isArray(d.reservations)||d.reservations.length>128)return result(false,"AUDIT_DATASET_RESERVATIONS_INVALID");
   for(const [i,r] of d.reservations.entries()){
    if(!exact(r,["sequence","testId","actorId","skillItemId","testMode","obstacle"])||r.sequence!==i||
     typeof r.testId!=="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(r.testId)||reservationTests.has(r.testId)||
     [r.actorId,r.skillItemId].some(id=>typeof id!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(id))||
     !["SKILL","BEGINNERS_LUCK"].includes(r.testMode)||!Number.isSafeInteger(r.obstacle)||r.obstacle<1)
     return result(false,"AUDIT_DATASET_RESERVATIONS_INVALID");
    reservationTests.add(r.testId);
   }
  }
  if(terminal){
   if(!Array.isArray(d.closures)||d.closures.length>128)return result(false,"AUDIT_DATASET_CLOSURES_INVALID");
   const closed=new Set();
   for(const [i,c] of d.closures.entries()){
    if(!exact(c,["sequence","testId","reason","note","gmReviewed","captureStoppedReviewed","nativeOutcome","advancementCredit","resourceHistoryVerified","traceMessageIds"])||
     c.sequence!==i||!reservationTests.has(c.testId)||closed.has(c.testId)||
     !["CAPTURE_INTERRUPTED","PRIVATE_TRACE_UNAVAILABLE","INCOMPLETE_NATIVE_CAPTURE"].includes(c.reason)||
     typeof c.note!=="string"||!c.note.trim()||c.note.length>512||c.gmReviewed!==true||c.captureStoppedReviewed!==true||c.nativeOutcome!=="UNKNOWN"||
     c.advancementCredit!==false||c.resourceHistoryVerified!==false||!Array.isArray(c.traceMessageIds)||c.traceMessageIds.length>128||
     new Set(c.traceMessageIds).size!==c.traceMessageIds.length||c.traceMessageIds.some(id=>typeof id!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(id)))
     return result(false,"AUDIT_DATASET_CLOSURES_INVALID");
    closed.add(c.testId);
   }
  }
  for(const [i,c] of d.commits.entries()){
   if(!exact(c,reserved?["revision","kind","testIds","traceMessageIds"]:["revision","traceMessageIds"])||c.revision!==i+1||
    !Array.isArray(c.traceMessageIds)||c.traceMessageIds.length>128)return result(false,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");
   if(reserved){
    if(!Array.isArray(c.testIds)||!c.testIds.length||c.testIds.length>128)return result(false,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");
    if(c.kind==="RESERVE"&&c.testIds.length===1&&!c.traceMessageIds.length){
     if(reservedIds.includes(c.testIds[0]))return result(false,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");
     reservedIds.push(c.testIds[0]);
    }else if(c.kind==="INDEX"&&c.testIds.length===c.traceMessageIds.length&&c.testIds.every(id=>reservedIds.includes(id)&&!closedIds.includes(id)))indexedIds.push(...c.testIds);
    else if(terminal&&c.kind==="CLOSE_GAP"&&c.testIds.length===1&&!c.traceMessageIds.length&&reservedIds.includes(c.testIds[0])&&!closedIds.includes(c.testIds[0])&&!indexedIds.includes(c.testIds[0]))closedIds.push(c.testIds[0]);
    else if(ledgerEnabled&&c.kind==="LEDGER"&&c.testIds.length>0&&c.testIds.every(id=>typeof id==="string")&&
     c.testIds.every(id=>/^[A-Za-z0-9_-]{1,128}$/.test(id))&&
     c.traceMessageIds.every(id=>d.entries.some(e=>e.traceMessageId===id&&indexedIds.includes(e.testId)))&&
     new Set(c.testIds).size===c.testIds.length&&new Set(c.traceMessageIds).size===c.traceMessageIds.length){
     ledgerEventIds.push(...c.testIds);for(const id of c.traceMessageIds)if(!ledgerTraceIds.includes(id))ledgerTraceIds.push(id);
    }else return result(false,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");
   }else if(!c.traceMessageIds.length)return result(false,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");
   if(!reserved||c.kind==="INDEX")committed.push(...c.traceMessageIds);
  }
  if(committed.length!==d.entries.length||new Set(committed).size!==committed.length||committed.some((id,i)=>id!==d.entries[i]?.traceMessageId)||
   reserved&&(reservedIds.length!==d.reservations.length||reservedIds.some((id,i)=>id!==d.reservations[i].testId)||
    indexedIds.length!==d.entries.length||indexedIds.some((id,i)=>id!==d.entries[i]?.testId))||
   terminal&&(closedIds.length!==d.closures.length||closedIds.some((id,i)=>id!==d.closures[i].testId)))return result(false,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");
  let eventLedger=d.eventLedger??null;
  if(ledgerEnabled){
   const validPrior=(v,key)=>Array.isArray(v)&&v.length<=2000&&v.every(x=>key==="previousCreditKeys"?typeof x==="string"&&x.length>0&&x.length<=512:typeof x==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(x))&&new Set(v).size===v.length;
   if(!exact(eventLedger,["baseline","events","previousEventIds","previousCreditKeys","previousSupplyTestIds"])||
    !Array.isArray(eventLedger.events)||eventLedger.events.length>500||
    !validPrior(eventLedger.previousEventIds,"previousEventIds")||!validPrior(eventLedger.previousCreditKeys,"previousCreditKeys")||
    !validPrior(eventLedger.previousSupplyTestIds,"previousSupplyTestIds"))return result(false,"AUDIT_DATASET_LEDGER_INVALID");
   const eventIds=eventLedger.events.map(e=>e?.eventId),traceIds=[];
   for(const e of eventLedger.events){
    if(!e||typeof e!=="object"||Array.isArray(e)||typeof e.eventId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(e.eventId))
     return result(false,"AUDIT_DATASET_LEDGER_INVALID");
    if(["TEST_CREDIT","LEARNING_CREDIT","CAPTURED_LEARNING_CREDIT","SUPPLY_USE"].includes(e.type)){
     const traceMessageId=e.type==="LEARNING_CREDIT"?e.integratedTestInput?.messageId:e.traceMessageId;
     if(typeof traceMessageId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(traceMessageId))return result(false,"AUDIT_DATASET_LEDGER_TRACE_REQUIRED");
     if(!traceIds.includes(traceMessageId))traceIds.push(traceMessageId);
    }else if(["SUPPLY_REPLENISH","SUBJECT_RESET","LEARN_SKILL"].includes(e.type)){}
    else return result(false,"AUDIT_DATASET_LEDGER_EVENT_ROUTE_UNSUPPORTED");
   }
   if(new Set(eventIds).size!==eventIds.length||ledgerEventIds.length!==eventIds.length||
    ledgerEventIds.some((id,i)=>id!==eventIds[i])||new Set(ledgerEventIds).size!==ledgerEventIds.length||
    ledgerTraceIds.length!==traceIds.length||ledgerTraceIds.some((id,i)=>id!==traceIds[i])||
    eventLedger.events.length>0&&(!eventLedger.baseline||typeof eventLedger.baseline!=="object"))
    return result(false,"AUDIT_DATASET_LEDGER_COMMIT_CHAIN_MISMATCH");
  }
  const seenTests=new Set(),seenMessages=new Set();
  for(const [i,e] of d.entries.entries()){
   if(!exact(e,["sequence","testId","actorId","skillItemId","testMode","traceMessageId","legacyMessageId","outcome","checksum"])||e.sequence!==i||typeof e.testId!=="string"||seenTests.has(e.testId)||seenMessages.has(e.traceMessageId)||
    typeof e.checksum!=="string"||!/^[a-f0-9]{64}$/.test(e.checksum))return result(false,"AUDIT_DATASET_DUPLICATE_OR_INVALID_ENTRY");
   seenTests.add(e.testId);seenMessages.add(e.traceMessageId);
   const f=await tb2ePackageAAuditTraceFingerprint({traceMessageId:e.traceMessageId});
   if(!f.ok)return result(false,"AUDIT_DATASET_TRACE_"+f.reasonCode,{journalId,traceMessageId:e.traceMessageId});
   if(f.testIdentity.testId!==e.testId||f.testIdentity.actorId!==e.actorId||f.skillItemId!==e.skillItemId||f.testMode!==e.testMode||
    f.legacyMessageId!==e.legacyMessageId||f.outcome!==e.outcome||f.checksum!==e.checksum)
    return result(false,"AUDIT_DATASET_TRACE_FINGERPRINT_MISMATCH",{journalId,traceMessageId:e.traceMessageId});
   if(reserved){
    const r=d.reservations.find(r=>r.testId===e.testId);
    if(!r||f.datasetId!==journalId||f.reservationSequence!==r.sequence||f.obstacle!==r.obstacle||
     r.actorId!==e.actorId||r.skillItemId!==e.skillItemId||r.testMode!==e.testMode)
     return result(false,"AUDIT_DATASET_RESERVATION_TRACE_MISMATCH");
   }else if(f.reservationSequence!==null)return result(false,"AUDIT_DATASET_RESERVATION_SCHEMA_REQUIRED");
  }
  if(!datasetSession(g,gm,worldId)||g.journal.get(journalId)!==journal)return result(false,"AUDIT_DATASET_SESSION_CHANGED");
  if(journal.visible!==true||journal.ownership?.default!==0||journal.ownership?.[gm.id]!==3||Object.keys(journal.ownership).some(k=>k!=="default"&&k!==gm.id))return result(false,"PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  if(canonicalAudit(journal.flags?.["realm-guard"]?.packageAAuditDataset)!==stable)return result(false,"AUDIT_DATASET_CHANGED_DURING_READ");
  const gapMessages=new Set(),gapTraceAvailability=[];
  for(const c of terminal?d.closures:[]){
   for(const id of c.traceMessageIds){
    if(gapMessages.has(id))return result(false,"AUDIT_DATASET_CLOSURE_TRACE_MISMATCH");
    const m=g.messages.get(id);
    if(m){
     const r=m.visible===true&&m.isContentVisible===true&&m.author===gm&&m.whisper?.length===1&&m.whisper[0]===gm.id?m.flags?.["realm-guard"]?.packageAAudit:null;
     if(m.documentName!=="ChatMessage"||r?.datasetId!==journalId||r?.testId!==c.testId)return result(false,"AUDIT_DATASET_CLOSURE_TRACE_MISMATCH");
    }
    gapMessages.add(id);gapTraceAvailability.push({testId:c.testId,traceMessageId:id,availability:m?"CURRENT_REFERENCE_ONLY_NOT_NATIVE_VERIFIED":"UNAVAILABLE"});
   }
  }
  const unindexed=[...g.messages.values()].filter(m=>m.visible===true&&m.isContentVisible===true&&
   m.flags?.["realm-guard"]?.packageAAudit?.datasetId===journalId&&!seenMessages.has(m.id)&&!gapMessages.has(m.id)).map(m=>m.id);
  const pending=reserved?d.reservations.filter(r=>!seenTests.has(r.testId)&&!closedIds.includes(r.testId)):[];
  const gaps=terminal?d.closures:[];
  const data={eventLedger,reviewedGaps:gaps,gapTraceAvailability,nativeHistoryCompleteInDataset:!gaps.length&&!pending.length&&!unindexed.length,validatedManifestSnapshot:stable,schemaVersion:d.schemaVersion,reservations:reserved?d.reservations:[],pendingReservations:pending,
   preRollReservationScope:reserved?"EXPLICIT_RESERVED_TESTS_NOT_ALL_WORLD_TESTS":"NOT_RECORDED_SCHEMA1",journalId,worldId,gmId:gm.id,revision:d.revision,entries:d.entries,commits:d.commits,unindexedTraceMessageIds:unindexed,
   indexScope:"EXPLICIT_SELECTED_TRACE_MESSAGES_NOT_ALL_WORLD_TESTS",persistedIndexObserved:true,
   datasetChecksumsConsistent:true,datasetAuthenticated:false,durableGlobalReplayVerified:false};
  return result(!unindexed.length&&!pending.length&&!gaps.length,unindexed.length?"AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE":pending.length?"AUDIT_DATASET_PENDING_RESERVATION":gaps.length?"AUDIT_DATASET_REVIEWED_GAPS":null,data);
 }catch{return result(false,"AUDIT_DATASET_READ_FAILED");}
}
