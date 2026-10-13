import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
import {tb2ePackageALegacyObservationProbe} from "./m10d18-tb2e-package-a-legacy-observation.mjs";
import {tb2ePackageAAuditDatasetEvidence,tb2ePackageAAuditTraceFingerprint,tb2ePackageASavedLegacyAuditEvidence} from "./m10d18-tb2e-package-a-saved-legacy-audit.mjs";
import {tb2ePackageAEvidenceReplayPlan} from "./m10d18-tb2e-package-a-prospective-trace.mjs";
import {tb2ePackageAAuditLedgerReplay} from "./m10d18-tb2e-package-a-audit-ledger-replay.mjs";

const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const failure=reasonCode=>({ok:false,reasonCode});
const captures=new WeakMap();
const activeReservedTests=new Set();
// Private issued capability; diagnostic failures never interrupt gameplay.
export function observeLegacyAuditEvent(capability,actor,stage,roll=null,details={}){
 const c=captures.get(capability);if(!c||c.actor!==actor||c.error)return;
 try{
  let r;
  if(stage==="base")r=c.probe.observeBaseRoll(roll);
  else if(stage==="wise")r=c.probe.observeLegacyWiseRoll({roll,targetDieIds:details.indexes.map(i=>`${c.testId}:base:${i}`),wiseItemId:details.wiseItemId});
  else if(stage==="fate")r=c.probe.observeFateRound({roll,parentDieIds:c.parents});
  else if(stage==="spend")r=c.probe.observeResourceChange({resource:"fate",amount:1});
  else return;
  if(!r.ok){c.error=r;return;}
  if(roll){
   c.nativeData.push(JSON.parse(JSON.stringify(roll.toJSON())));
   const id=stage==="base"?`${c.testId}:base`:stage==="wise"?`${c.testId}:legacyWise`:`${c.testId}:luck${c.round++}`;
   if(stage==="base"){
    c.resolvedFaces=roll.dice.flatMap(d=>d.results).flatMap(d=>d.result);
    c.parents=c.resolvedFaces.flatMap((face,i)=>face===6?[`${c.testId}:base:${i}`]:[]);
   }
   else if(stage==="wise"){
    details.indexes.forEach((index,n)=>{c.resolvedFaces[index]=roll.dice.flatMap(d=>d.results)[n].result;});
    c.parents=c.resolvedFaces.flatMap((face,i)=>face===6?[`${c.testId}:base:${i}`]:[]);
   }else c.parents=roll.dice.flatMap(d=>d.results).flatMap((d,i)=>d.result===6?[`${id}:${i}`]:[]);
  }
 }catch{c.error=failure("LEGACY_AUDIT_CAPTURE_FAILED");}
}


/** Explicit Legacy-owned GM diagnostic. Not registered on CORE/startup/UI.
 * Executes existing live Legacy gameplay once; audit storage is an additional
 * GM-private ChatMessage, never an Actor/Item/rules/profile change by CORE.
 */
export const legacyRoleRollWithAudit=(actor,role,options={})=>legacyRollWithAudit(actor,role,options,"SKILL");
export const legacyBeginnerLuckWithAudit=(actor,role,options={})=>legacyRollWithAudit(actor,role,options,"BEGINNERS_LUCK");
async function legacyRollWithAudit(actor,role,options,mode){
  if(!fields(options,["obstacle","auditDatasetId","reserveBeforeRoll","wiseId"])||!Number.isSafeInteger(options.obstacle??1)||(options.obstacle??1)<1)
    return failure("LEGACY_AUDIT_PLAIN_OBSTACLE_SCOPE_REQUIRED");
  if(options.auditDatasetId!==undefined&&(typeof options.auditDatasetId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(options.auditDatasetId)))return failure("AUDIT_DATASET_ID_REQUIRED");
  if(options.reserveBeforeRoll!==undefined&&typeof options.reserveBeforeRoll!=="boolean"||options.reserveBeforeRoll===true&&!options.auditDatasetId)return failure("AUDIT_DATASET_RESERVATION_OPTIONS_REQUIRED");
  const g=globalThis.game,gm=g?.user;
  if(!g?.ready||g.system?.id!=="realm-guard"||!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)
    return failure("CURRENT_SESSION_GM_REQUIRED");
  if(!actor||!role||g.actors?.get(actor.id)!==actor||actor.items?.get(role.id)!==role||role.type!=="role")
    return failure("LEGACY_AUDIT_OWNED_WORLD_SKILL_REQUIRED");
  if(options.wiseId!==undefined&&options.wiseId!==null&&
    (typeof options.wiseId!=="string"||actor.items?.get(options.wiseId)?.type!=="wise"))return failure("LEGACY_AUDIT_OWNED_WORLD_WISE_REQUIRED");
  const testId=globalThis.foundry.utils.randomID();
  const probe=tb2ePackageALegacyObservationProbe({actorId:actor.id,skillItemId:role.id,testId,mode});
  if(!probe.ok)return failure(probe.reasonCode);
  // Saved Fate scope is checked separately; mutable records are not attestation.
  const obstacle=options.obstacle??1,worldId=g.world.id;
  if(options.auditDatasetId&&options.reserveBeforeRoll!==true){
    const dataset=await tb2ePackageAAuditDatasetEvidence({journalId:options.auditDatasetId});
    if(globalThis.game!==g||!sameWriter({g,gm,worldId})||g.actors.get(actor.id)!==actor||actor.items.get(role.id)!==role)return {...failure("LEGACY_AUDIT_SESSION_CHANGED_BEFORE_GAMEPLAY"),gameplayStarted:false};
    if(!dataset.ok&&dataset.reasonCode!=="AUDIT_DATASET_REVIEWED_GAPS")return {...failure(dataset.reasonCode),gameplayStarted:false};
    if(dataset.schemaVersion>=2)return {...failure("AUDIT_DATASET_PRE_ROLL_RESERVATION_REQUIRED"),gameplayStarted:false};
  }
  let reservation=null;
  if(options.reserveBeforeRoll===true){
    reservation=await reserveAuditTest({journalId:options.auditDatasetId,testId,actorId:actor.id,skillItemId:role.id,testMode:mode,obstacle});
    if(!reservation.ok)return {...reservation,gameplayStarted:false};
    if(globalThis.game!==g||!sameWriter({g,gm,worldId})||g.actors.get(actor.id)!==actor||actor.items.get(role.id)!==role){
      activeReservedTests.delete(options.auditDatasetId+":"+testId);
      return {...failure("LEGACY_AUDIT_SESSION_CHANGED_AFTER_RESERVATION"),reservation,gameplayStarted:false};
    }
  }
  const activeKey=reservation?options.auditDatasetId+":"+testId:null;
  if(activeKey)activeReservedTests.add(activeKey);
  try{
  const capability=Object.freeze({});
  const capture={actor,probe,testId,parents:[],round:0,nativeData:[],error:null,resolvedFaces:[]};
  captures.set(capability,capture);
  let legacyResult;
  try{legacyResult=mode==="BEGINNERS_LUCK"
    ?await actor.rollBeginnerLuck(role,{abilityKey:tb2eSkillInfo(role.name).beginnersLuckAbility.toLowerCase(),obstacle,wiseId:options.wiseId??null,legacyAuditCapture:capability})
    :await actor.rollRole(role,{obstacle,wiseId:options.wiseId??null,legacyAuditCapture:capability});}
  finally{captures.delete(capability);}
  if(!legacyResult?.roll)return {...(legacyResult??{}),audit:failure("LEGACY_ROLL_DID_NOT_COMPLETE")};
  try{
  const observed=capture.error??probe.finish();
  let reason=observed.ok?null:observed.reasonCode;

  const current=globalThis.game;
  if(!current?.ready||current.system?.id!=="realm-guard"||current.user!==gm||!gm.active||gm.isGM!==true||current.users?.get(gm.id)!==gm||current.world?.id!==worldId||
    current.settings.get("realm-guard","activeRulesProfileId")!=="realm-guard-legacy-mixed")
    return {...legacyResult,audit:failure("LEGACY_AUDIT_SESSION_CHANGED_BEFORE_STORAGE")};
  const original=current.messages?.get(legacyResult.messageId);
  if(!original||original.speaker?.actor!==actor.id||original.speakerActor!==actor||original.speaker?.token||
     original.author!==gm||original.visible!==true||original.isContentVisible!==true)
    return {...legacyResult,audit:failure("LEGACY_AUDIT_ORIGINAL_MESSAGE_LINK_REQUIRED")};
  const fateScope=legacyResult.fateSpent===true,blScope=mode==="BEGINNERS_LUCK";
  const wiseScope=!blScope&&capture.nativeData.length>1&&capture.nativeData.some((_,i)=>i>0)&&!fateScope;
  const record={schemaVersion:blScope?3:fateScope?2:wiseScope?4:1,kind:blScope?"LEGACY_BL_AUDIT":fateScope?"LEGACY_ROLE_AUDIT_BASE_FATE":wiseScope?"LEGACY_ROLE_AUDIT_BASE_WISE":"LEGACY_ROLE_AUDIT_BASE_ONLY",testId,worldId,actorId:actor.id,
    gmId:gm.id,skillItemId:role.id,obstacle,legacyMessageId:original.id,
    status:reason?"INCOMPLETE":blScope?"BL_SCOPE_RECORDED":fateScope?"BASE_FATE_SCOPE_RECORDED":"BASE_SCOPE_RECORDED",reasonCode:reason,
    nativeObservation:observed.ok?observed:null,
    legacyOutcome:{outcome:legacyResult.outcome,successes:legacyResult.successes,fateSpent:legacyResult.fateSpent===true},
    sourceProfileId:"realm-guard-legacy-mixed",authenticated:false,completeTestHistoryVerified:false,
    ...(options.auditDatasetId?{datasetId:options.auditDatasetId}:{}),
    ...(reservation?{reservationSequence:reservation.sequence}:{})};
  try{
    // Construct an evaluated native copy from serialized data. ChatMessage's
    // model may own/mutate its input; never hand it the gameplay Roll instance.
    const nativeCopies=capture.nativeData.map(data=>globalThis.Roll.fromData(JSON.parse(JSON.stringify(data))));
    const trace=await globalThis.ChatMessage.create({speaker:{actor:actor.id,alias:actor.name},
      whisper:[gm.id],content:"<p>Realm Guard Package A: private Legacy diagnostic record.</p>",
      rolls:nativeCopies,flags:{"realm-guard":{packageAAudit:JSON.parse(JSON.stringify(record))}}});
    if(!globalThis.game?.ready||globalThis.game.system?.id!=="realm-guard"||globalThis.game.user!==gm||!gm.active||gm.isGM!==true||globalThis.game.users?.get(gm.id)!==gm||globalThis.game.world?.id!==worldId||
      globalThis.game.settings.get("realm-guard","activeRulesProfileId")!=="realm-guard-legacy-mixed")
      return {...legacyResult,audit:{...failure("LEGACY_AUDIT_SESSION_CHANGED_DURING_STORAGE"),traceMessageId:trace.id}};
    if(!reason){
      const saved=tb2ePackageASavedLegacyAuditEvidence({traceMessageId:trace.id});
      if(!saved.ok)return {...legacyResult,audit:{...failure(saved.reasonCode),traceMessageId:trace.id}};
    }
    let datasetStatus=null;
    if(!reason&&options.auditDatasetId){
      const prior=await tb2ePackageAAuditDatasetEvidence({journalId:options.auditDatasetId});
      if(!prior.ok&&!["AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE","AUDIT_DATASET_PENDING_RESERVATION","AUDIT_DATASET_REVIEWED_GAPS"].includes(prior.reasonCode))return {...legacyResult,audit:{...failure(prior.reasonCode),traceMessageId:trace.id,gameplayCompleted:true}};
      const indexed=await legacyAppendAuditDataset({journalId:options.auditDatasetId,traceMessageIds:[trace.id],expectedRevision:prior.revision});
      if(indexed.ok)datasetStatus={datasetEvidenceComplete:indexed.datasetEvidenceComplete,reviewedGapCount:indexed.reviewedGapCount};
      if(!indexed.ok)return {...legacyResult,audit:{...indexed,traceMessageId:trace.id,gameplayCompleted:true}};
    }
    return {...legacyResult,audit:{ok:!reason,reasonCode:reason,traceMessageId:trace.id,status:record.status,...(datasetStatus??{})}};
  }catch{
    // Never reroll/re-spend/retry gameplay after a diagnostic storage failure.
    return {...legacyResult,audit:failure("LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY")};
  }
  }catch{return {...legacyResult,audit:failure("LEGACY_AUDIT_OBSERVATION_FAILED_AFTER_GAMEPLAY")};}
  }finally{if(activeKey)activeReservedTests.delete(activeKey);}
}


const appendLocks=new Set();
const stableDataset=value=>JSON.stringify(value,(_key,v)=>v&&typeof v==="object"&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const datasetWriterSession=()=>{
 const g=globalThis.game,gm=g?.user;
 return g?.ready&&g.system?.id==="realm-guard"&&gm?.active&&gm.isGM===true&&g.users?.get(gm.id)===gm&&
  g.settings.get("realm-guard","activeRulesProfileId")==="realm-guard-legacy-mixed"?{g,gm,worldId:g.world.id}:null;
};
const privateDatasetJournal=(j,s)=>j&&s.g.journal?.get(j.id)===j&&j.documentName==="JournalEntry"&&j.visible===true&&!j.inCompendium&&j.ownership?.default===0&&j.ownership?.[s.gm.id]===3&&Object.keys(j.ownership).every(k=>k==="default"||k===s.gm.id);
const sameWriter=s=>{const current=datasetWriterSession();return current&&current.g===s.g&&current.gm===s.gm&&current.worldId===s.worldId;};
/** GM review records an unrecoverable gap; never a native result or progress credit. */
export async function legacyCloseAuditReservation({journalId,testId,expectedRevision,reason,note,gmReviewed=false,captureStoppedReviewed=false,traceMessageIds=[]}={}){
 const session=datasetWriterSession();if(!session)return failure("CURRENT_SESSION_GM_LEGACY_REQUIRED");
 if(typeof journalId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(journalId)||typeof testId!=="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(testId)||
  !Number.isSafeInteger(expectedRevision)||expectedRevision<0||gmReviewed!==true||captureStoppedReviewed!==true||
  !["CAPTURE_INTERRUPTED","PRIVATE_TRACE_UNAVAILABLE","INCOMPLETE_NATIVE_CAPTURE"].includes(reason)||
  typeof note!=="string"||!note.trim()||note.length>512||!Array.isArray(traceMessageIds)||traceMessageIds.length>128||
  new Set(traceMessageIds).size!==traceMessageIds.length||traceMessageIds.some(id=>typeof id!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(id)))return failure("AUDIT_DATASET_CLOSURE_FIELDS_REQUIRED");
 const activeKey=journalId+":"+testId;
 if(activeReservedTests.has(activeKey))return failure("AUDIT_DATASET_CAPTURE_STILL_ACTIVE");
 if(appendLocks.has(journalId))return failure("AUDIT_DATASET_LOCAL_APPEND_IN_PROGRESS");
 appendLocks.add(journalId);
 try{
  const prior=await tb2ePackageAAuditDatasetEvidence({journalId});
  if(!prior.ok&&!["AUDIT_DATASET_PENDING_RESERVATION","AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE","AUDIT_DATASET_REVIEWED_GAPS"].includes(prior.reasonCode))return failure(prior.reasonCode);
  if(prior.schemaVersion!==3)return failure("AUDIT_DATASET_GAP_SCHEMA_REQUIRED");
  if(prior.revision!==expectedRevision)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  if(!prior.pendingReservations.some(r=>r.testId===testId))return failure("AUDIT_DATASET_PENDING_TEST_REQUIRED");
  if(prior.revision>=256||prior.reviewedGaps.length>=128)return failure("AUDIT_DATASET_SIZE_LIMIT");
  if(!sameWriter(session))return failure("AUDIT_DATASET_SESSION_CHANGED");
  const associated=[...session.g.messages.values()].filter(m=>m.visible===true&&m.isContentVisible===true&&
   m.flags?.["realm-guard"]?.packageAAudit?.datasetId===journalId&&m.flags["realm-guard"].packageAAudit.testId===testId);
  if(associated.length!==traceMessageIds.length||associated.some(m=>!traceMessageIds.includes(m.id)))return failure("AUDIT_DATASET_CLOSURE_TRACE_SELECTION_REQUIRED");
  if(reason==="PRIVATE_TRACE_UNAVAILABLE"&&(associated.length||traceMessageIds.length))return failure("AUDIT_DATASET_CLOSURE_REASON_MISMATCH");
  if(reason==="INCOMPLETE_NATIVE_CAPTURE"&&!associated.length)return failure("AUDIT_DATASET_INCOMPLETE_TRACE_REQUIRED");
  for(const m of associated){
   if(m.documentName!=="ChatMessage"||m.author!==session.gm||m.whisper?.length!==1||m.whisper[0]!==session.gm.id)return failure("PRIVATE_CURRENT_GM_AUDIT_MESSAGE_REQUIRED");
   const native=tb2ePackageASavedLegacyAuditEvidence({traceMessageId:m.id});
   if(native.ok)return failure("AUDIT_DATASET_RECOVERABLE_TRACE_MUST_BE_INDEXED");
  }
  const journal=session.g.journal.get(journalId);
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  const before=stableDataset(journal.flags["realm-guard"].packageAAuditDataset);
  if(before!==prior.validatedManifestSnapshot)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  if(activeReservedTests.has(activeKey))return failure("AUDIT_DATASET_CAPTURE_STILL_ACTIVE");
  const old=JSON.parse(before),closure={sequence:old.closures.length,testId,reason,note,gmReviewed:true,captureStoppedReviewed:true,
   nativeOutcome:"UNKNOWN",advancementCredit:false,resourceHistoryVerified:false,traceMessageIds:[...traceMessageIds]};
  const data={...old,revision:old.revision+1,closures:[...old.closures,closure],
   commits:[...old.commits,{revision:old.revision+1,kind:"CLOSE_GAP",testIds:[testId],traceMessageIds:[]}]};
  await journal.update({"flags.realm-guard.packageAAuditDataset":JSON.parse(JSON.stringify(data))});
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  const after=await tb2ePackageAAuditDatasetEvidence({journalId});
  if(!["AUDIT_DATASET_REVIEWED_GAPS","AUDIT_DATASET_PENDING_RESERVATION","AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE"].includes(after.reasonCode)||!after.reviewedGaps?.some(c=>c.testId===testId))return failure(after.reasonCode??"AUDIT_DATASET_CLOSURE_READBACK_FAILED");
  if(!sameWriter(session)||!privateDatasetJournal(journal,session)||stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  return {ok:true,journalId,testId,revision:after.revision,datasetEvidenceComplete:false,reviewedGapCount:after.reviewedGaps.length,
   nativeOutcome:"UNKNOWN",advancementCredit:false,resourceHistoryVerified:false,authenticated:false};
 }catch{return failure("AUDIT_DATASET_CLOSURE_STORAGE_FAILED");}
 finally{appendLocks.delete(journalId);}
}
/** Explicit Legacy diagnostic creation; never called by CORE or startup. */
export async function legacyCreateAuditDataset({name="Realm Guard Package A audit",reserveBeforeRoll=false,allowReviewedGaps=false,enableEvidenceLedger=false}={}){
 const session=datasetWriterSession();if(!session)return failure("CURRENT_SESSION_GM_LEGACY_REQUIRED");
 if(typeof enableEvidenceLedger!=="boolean"||enableEvidenceLedger&&!reserveBeforeRoll)return failure("AUDIT_DATASET_LEDGER_OPTIONS_REQUIRED");
 if(typeof allowReviewedGaps!=="boolean"||allowReviewedGaps&&!reserveBeforeRoll)return failure("AUDIT_DATASET_GAP_OPTIONS_REQUIRED");
 if(typeof reserveBeforeRoll!=="boolean")return failure("AUDIT_DATASET_RESERVATION_OPTIONS_REQUIRED");
 if(typeof name!=="string"||!name.trim()||name.length>128)return failure("AUDIT_DATASET_NAME_REQUIRED");
 try{
  const data={schemaVersion:enableEvidenceLedger?4:allowReviewedGaps?3:reserveBeforeRoll?2:1,kind:"LEGACY_AUDIT_DATASET",worldId:session.worldId,gmId:session.gm.id,revision:0,
   entries:[],commits:[],assuranceModel:"TRUSTED_GM_R",sourceProfileId:"realm-guard-legacy-mixed",authenticated:false,...(reserveBeforeRoll?{reservations:[]}: {}),...(allowReviewedGaps||enableEvidenceLedger?{closures:[]}: {}),...(enableEvidenceLedger?{eventLedger:{baseline:null,events:[],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]}}:{})};
  const journal=await globalThis.JournalEntry.create({name,ownership:{default:0,[session.gm.id]:3},
   flags:{"realm-guard":{packageAAuditDataset:JSON.parse(JSON.stringify(data))}}});
  if(!sameWriter(session))return {...failure("AUDIT_DATASET_SESSION_CHANGED"),journalId:journal?.id};
  const read=await tb2ePackageAAuditDatasetEvidence({journalId:journal.id});
  if(!sameWriter(session))return {...failure("AUDIT_DATASET_SESSION_CHANGED"),journalId:journal.id};
  return read.ok?{ok:true,journalId:journal.id,revision:0}:{...failure(read.reasonCode),journalId:journal.id};
 }catch{return failure("AUDIT_DATASET_CREATE_FAILED");}
}
/** One-client lock + revision/readback, not a server CAS or gameplay transaction. */
export async function legacyAppendAuditDataset({journalId,traceMessageIds,expectedRevision}={}){
 const session=datasetWriterSession();if(!session)return failure("CURRENT_SESSION_GM_LEGACY_REQUIRED");
 if(typeof journalId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(journalId)||!Array.isArray(traceMessageIds)||
  !traceMessageIds.length||traceMessageIds.length>128||traceMessageIds.some(id=>typeof id!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(id))||
  new Set(traceMessageIds).size!==traceMessageIds.length||!Number.isSafeInteger(expectedRevision)||expectedRevision<0)
  return failure("AUDIT_DATASET_APPEND_FIELDS_REQUIRED");
 if(appendLocks.has(journalId))return failure("AUDIT_DATASET_LOCAL_APPEND_IN_PROGRESS");
 appendLocks.add(journalId);
 try{
  const prior=await tb2ePackageAAuditDatasetEvidence({journalId});
  if(!prior.ok&&!(["AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE","AUDIT_DATASET_PENDING_RESERVATION","AUDIT_DATASET_REVIEWED_GAPS"].includes(prior.reasonCode)&&prior.unindexedTraceMessageIds.every(id=>traceMessageIds.includes(id))))return failure(prior.reasonCode);
  if(prior.revision!==expectedRevision)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  if(prior.entries.length+traceMessageIds.length>128||prior.revision>=(prior.schemaVersion>=2?256:128))return failure("AUDIT_DATASET_SIZE_LIMIT");
  const journal=session.g.journal.get(journalId);
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  const before=stableDataset(journal.flags["realm-guard"].packageAAuditDataset);
  if(before!==prior.validatedManifestSnapshot)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  const entries=JSON.parse(JSON.stringify(prior.entries)),tests=new Set(entries.map(e=>e.testId)),messages=new Set(entries.map(e=>e.traceMessageId));
  for(const traceMessageId of traceMessageIds){
   const f=await tb2ePackageAAuditTraceFingerprint({traceMessageId});if(!f.ok)return failure(f.reasonCode);
   if(tests.has(f.testIdentity.testId)||messages.has(traceMessageId))return failure("AUDIT_DATASET_TEST_ALREADY_INDEXED");
   const association=f.datasetId;
   if(association!==null&&association!==journalId)return failure("AUDIT_DATASET_TRACE_ASSOCIATION_MISMATCH");
   if(prior.schemaVersion>=2){
    if(prior.reviewedGaps.some(c=>c.testId===f.testIdentity.testId))return failure("AUDIT_DATASET_CLOSED_TEST_CANNOT_BE_INDEXED");
    const r=prior.reservations.find(r=>r.testId===f.testIdentity.testId);
    if(!r||f.datasetId!==journalId||f.reservationSequence!==r.sequence||f.obstacle!==r.obstacle||
     r.actorId!==f.testIdentity.actorId||r.skillItemId!==f.skillItemId||r.testMode!==f.testMode)return failure("AUDIT_DATASET_RESERVATION_TRACE_MISMATCH");
   }else if(f.reservationSequence!==null)return failure("AUDIT_DATASET_RESERVATION_SCHEMA_REQUIRED");
   tests.add(f.testIdentity.testId);messages.add(traceMessageId);
   entries.push({sequence:entries.length,testId:f.testIdentity.testId,actorId:f.testIdentity.actorId,skillItemId:f.skillItemId,
    testMode:f.testMode,traceMessageId,legacyMessageId:f.legacyMessageId,outcome:f.outcome,checksum:f.checksum});
  }
  if(!sameWriter(session)||session.g.journal.get(journalId)!==journal)return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==before)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  const data={...JSON.parse(before),revision:expectedRevision+1,entries,
   commits:[...JSON.parse(JSON.stringify(prior.commits)),{revision:expectedRevision+1,traceMessageIds:[...traceMessageIds],...(prior.schemaVersion>=2?{kind:"INDEX",testIds:entries.slice(prior.entries.length).map(e=>e.testId)}:{})}]};
  await journal.update({"flags.realm-guard.packageAAuditDataset":JSON.parse(JSON.stringify(data))});
  if(!sameWriter(session))return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  const after=await tb2ePackageAAuditDatasetEvidence({journalId});if(!after.ok&&after.reasonCode!=="AUDIT_DATASET_REVIEWED_GAPS")return {...failure(after.reasonCode),indexCommitObserved:true,revision:after.revision};
  if(!sameWriter(session)||!privateDatasetJournal(journal,session)||stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  return {ok:true,journalId,revision:after.revision,indexedTraceMessageIds:[...traceMessageIds],datasetEvidenceComplete:after.nativeHistoryCompleteInDataset,reviewedGapCount:after.reviewedGaps.length,authenticated:false};
 }catch{return failure("AUDIT_DATASET_APPEND_STORAGE_FAILED");}
 finally{appendLocks.delete(journalId);}
}

/** Persist one intent before explicit Legacy gameplay. No gameplay/retry/repair. */
async function reserveAuditTest({journalId,testId,actorId,skillItemId,testMode,obstacle}){
 const session=datasetWriterSession();if(!session)return failure("CURRENT_SESSION_GM_LEGACY_REQUIRED");
 if(appendLocks.has(journalId))return failure("AUDIT_DATASET_LOCAL_APPEND_IN_PROGRESS");
 appendLocks.add(journalId);
 try{
  const prior=await tb2ePackageAAuditDatasetEvidence({journalId});
  if(!prior.ok&&prior.reasonCode!=="AUDIT_DATASET_REVIEWED_GAPS")return failure(prior.reasonCode);
  if(prior.schemaVersion<2)return failure("AUDIT_DATASET_RESERVATION_SCHEMA_REQUIRED");
  if(prior.reservations.length>=128||prior.revision>=256)return failure("AUDIT_DATASET_SIZE_LIMIT");
  if(prior.reservations.some(r=>r.testId===testId))return failure("AUDIT_DATASET_TEST_ALREADY_RESERVED");
  const journal=session.g.journal.get(journalId);
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  const before=stableDataset(journal.flags["realm-guard"].packageAAuditDataset);
  // Reader validated one stable manifest. Check the exact reviewed revision before writing.
  const old=JSON.parse(before);
  if(before!==prior.validatedManifestSnapshot)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  const reservation={sequence:prior.reservations.length,testId,actorId,skillItemId,testMode,obstacle};
  const data={...old,revision:prior.revision+1,reservations:[...old.reservations,reservation],
   commits:[...old.commits,{revision:prior.revision+1,kind:"RESERVE",testIds:[testId],traceMessageIds:[]}]};
  await journal.update({"flags.realm-guard.packageAAuditDataset":JSON.parse(JSON.stringify(data))});
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  const read=await tb2ePackageAAuditDatasetEvidence({journalId});
  if(!sameWriter(session)||!privateDatasetJournal(journal,session)||stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  if(read.reasonCode!=="AUDIT_DATASET_PENDING_RESERVATION"||read.pendingReservations.length!==1||read.pendingReservations[0].testId!==testId)return failure(read.reasonCode??"AUDIT_DATASET_RESERVATION_READBACK_FAILED");
  activeReservedTests.add(journalId+":"+testId);
  return {ok:true,journalId,sequence:reservation.sequence,testId,revision:data.revision};
 }catch{return failure("AUDIT_DATASET_RESERVATION_STORAGE_FAILED");}
 finally{appendLocks.delete(journalId);}
}

/** Persist an append-only reviewed baseline/event ledger after replay validates it. */
export async function legacyAppendEvidenceLedger({journalId,expectedRevision,ledger}={}){
 const session=datasetWriterSession();if(!session)return failure("CURRENT_SESSION_GM_LEGACY_REQUIRED");
 if(typeof journalId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(journalId)||!Number.isSafeInteger(expectedRevision)||expectedRevision<0||
  !fields(ledger,["baseline","events","previousEventIds","previousCreditKeys","previousSupplyTestIds"])||
  !Array.isArray(ledger.events)||!ledger.events.length||ledger.events.length>500)return failure("AUDIT_DATASET_LEDGER_FIELDS_REQUIRED");
 if(appendLocks.has(journalId))return failure("AUDIT_DATASET_LOCAL_APPEND_IN_PROGRESS");
 appendLocks.add(journalId);
 try{
  const prior=await tb2ePackageAAuditDatasetEvidence({journalId});
  if(!prior.ok&&prior.reasonCode!=="AUDIT_DATASET_REVIEWED_GAPS")return failure(prior.reasonCode);
  if(prior.schemaVersion!==4)return failure("AUDIT_DATASET_LEDGER_SCHEMA_REQUIRED");
  if(prior.revision!==expectedRevision)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  if(prior.pendingReservations.length||prior.unindexedTraceMessageIds.length)return failure("AUDIT_DATASET_TRACE_SET_INCOMPLETE");
  if(prior.entries.length>128||prior.revision>=256)return failure("AUDIT_DATASET_SIZE_LIMIT");
  const journal=session.g.journal.get(journalId);
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  const before=stableDataset(journal.flags["realm-guard"].packageAAuditDataset);
  if(before!==prior.validatedManifestSnapshot)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  const old=JSON.parse(before),current=old.eventLedger;
  const cloned=JSON.parse(JSON.stringify(ledger));
  const exact=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
  if(!exact(cloned,["baseline","events","previousEventIds","previousCreditKeys","previousSupplyTestIds"])||
   !Array.isArray(cloned.events)||cloned.events.length>500||
   !Array.isArray(cloned.previousEventIds)||!Array.isArray(cloned.previousCreditKeys)||!Array.isArray(cloned.previousSupplyTestIds)||
   current.events.length>cloned.events.length||current.events.some((e,i)=>stableDataset(e)!==stableDataset(cloned.events[i]))||
   current.baseline!==null&&stableDataset(current.baseline)!==stableDataset(cloned.baseline)||
   current.events.length&&["previousEventIds","previousCreditKeys","previousSupplyTestIds"].some(k=>stableDataset(current[k])!==stableDataset(cloned[k])))
   return failure("AUDIT_DATASET_LEDGER_NOT_APPEND_ONLY");
  const candidate={baseline:cloned.baseline,events:cloned.events,previousEventIds:cloned.previousEventIds,
   previousCreditKeys:cloned.previousCreditKeys,previousSupplyTestIds:cloned.previousSupplyTestIds};
  const additions=cloned.events.slice(current.events.length);
  if(!additions.length)return failure("AUDIT_DATASET_LEDGER_NO_NEW_EVENTS");
  const refs=[];
  for(const e of additions){
   if(["TEST_CREDIT","LEARNING_CREDIT","CAPTURED_LEARNING_CREDIT","SUPPLY_USE"].includes(e.type)){
    const traceMessageId=e.type==="LEARNING_CREDIT"?e.integratedTestInput?.messageId:e.traceMessageId;
    if(typeof traceMessageId!=="string"||!prior.entries.some(row=>row.traceMessageId===traceMessageId))
     return failure("AUDIT_DATASET_LEDGER_TRACE_NOT_INDEXED");
    if(!refs.includes(traceMessageId))refs.push(traceMessageId);
   }else if(!["SUPPLY_REPLENISH","SUBJECT_RESET","LEARN_SKILL"].includes(e.type))
    return failure("AUDIT_DATASET_LEDGER_EVENT_ROUTE_UNSUPPORTED");
  }
  const projection=tb2ePackageAEvidenceReplayPlan(candidate);
  if(!projection.ok)return failure("AUDIT_DATASET_LEDGER_"+projection.reasonCode);
  const serialized=stableDataset(candidate);
  if(serialized.length>524288)return failure("AUDIT_DATASET_LEDGER_SIZE_LIMIT");
  const expectedRevisionNext=expectedRevision+1;
  const data={...old,revision:expectedRevisionNext,eventLedger:candidate,
   commits:[...old.commits,{revision:expectedRevisionNext,kind:"LEDGER",testIds:additions.map(e=>e.eventId),traceMessageIds:refs}]};
  await journal.update({"flags.realm-guard.packageAAuditDataset":JSON.parse(JSON.stringify(data))});
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  const after=await tb2ePackageAAuditLedgerReplay({journalId});
  if(!after.ok&&after.reasonCode!=="AUDIT_DATASET_REVIEWED_GAPS")return {...failure(after.reasonCode),ledgerCommitObserved:true};
  if(after.ledgerReplayValid!==true)return {...failure("AUDIT_DATASET_LEDGER_READBACK_REPLAY_FAILED"),ledgerCommitObserved:true};
  if(!sameWriter(session)||!privateDatasetJournal(journal,session)||stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))
   return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  return {ok:true,journalId,revision:after.revision,appendedEventIds:additions.map(e=>e.eventId),replayValidated:true,
   projection,datasetEvidenceComplete:after.nativeHistoryCompleteInDataset,authenticated:false};
 }catch{return failure("AUDIT_DATASET_LEDGER_STORAGE_FAILED");}
 finally{appendLocks.delete(journalId);}
}
