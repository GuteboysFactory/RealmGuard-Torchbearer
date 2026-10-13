import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
import {tb2ePackageALegacyObservationProbe} from "./m10d18-tb2e-package-a-legacy-observation.mjs";
import {tb2ePackageAAuditDatasetEvidence,tb2ePackageAAuditTraceFingerprint,tb2ePackageASavedLegacyAuditEvidence} from "./m10d18-tb2e-package-a-saved-legacy-audit.mjs";

const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const failure=reasonCode=>({ok:false,reasonCode});
const captures=new WeakMap();
// Private issued capability; diagnostic failures never interrupt gameplay.
export function observeLegacyAuditEvent(capability,actor,stage,roll=null){
 const c=captures.get(capability);if(!c||c.actor!==actor||c.error)return;
 try{
  let r;
  if(stage==="base")r=c.probe.observeBaseRoll(roll);
  else if(stage==="fate")r=c.probe.observeFateRound({roll,parentDieIds:c.parents});
  else if(stage==="spend")r=c.probe.observeResourceChange({resource:"fate",amount:1});
  else return;
  if(!r.ok){c.error=r;return;}
  if(roll){
   c.nativeData.push(JSON.parse(JSON.stringify(roll.toJSON())));
   const id=stage==="base"?`${c.testId}:base`:`${c.testId}:luck${c.round++}`;
   c.parents=roll.dice.flatMap(d=>d.results).flatMap((d,i)=>d.result===6?[`${id}:${i}`]:[]);
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
  if(!fields(options,["obstacle","auditDatasetId"])||!Number.isSafeInteger(options.obstacle??1)||(options.obstacle??1)<1)
    return failure("LEGACY_AUDIT_PLAIN_OBSTACLE_SCOPE_REQUIRED");
  if(options.auditDatasetId!==undefined&&(typeof options.auditDatasetId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(options.auditDatasetId)))return failure("AUDIT_DATASET_ID_REQUIRED");
  const g=globalThis.game,gm=g?.user;
  if(!g?.ready||g.system?.id!=="realm-guard"||!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)
    return failure("CURRENT_SESSION_GM_REQUIRED");
  if(!actor||!role||g.actors?.get(actor.id)!==actor||actor.items?.get(role.id)!==role||role.type!=="role")
    return failure("LEGACY_AUDIT_OWNED_WORLD_SKILL_REQUIRED");
  const testId=globalThis.foundry.utils.randomID();
  const probe=tb2ePackageALegacyObservationProbe({actorId:actor.id,skillItemId:role.id,testId,mode});
  if(!probe.ok)return failure(probe.reasonCode);
  // Saved Fate scope is checked separately; mutable records are not attestation.
  const obstacle=options.obstacle??1,worldId=g.world.id;
  const capability=Object.freeze({});
  const capture={actor,probe,testId,parents:[],round:0,nativeData:[],error:null};
  captures.set(capability,capture);
  let legacyResult;
  try{legacyResult=mode==="BEGINNERS_LUCK"
    ?await actor.rollBeginnerLuck(role,{abilityKey:tb2eSkillInfo(role.name).beginnersLuckAbility.toLowerCase(),obstacle,legacyAuditCapture:capability})
    :await actor.rollRole(role,{obstacle,legacyAuditCapture:capability});}
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
  const record={schemaVersion:blScope?3:fateScope?2:1,kind:blScope?"LEGACY_BL_AUDIT":fateScope?"LEGACY_ROLE_AUDIT_BASE_FATE":"LEGACY_ROLE_AUDIT_BASE_ONLY",testId,worldId,actorId:actor.id,
    gmId:gm.id,skillItemId:role.id,obstacle,legacyMessageId:original.id,
    status:reason?"INCOMPLETE":blScope?"BL_SCOPE_RECORDED":fateScope?"BASE_FATE_SCOPE_RECORDED":"BASE_SCOPE_RECORDED",reasonCode:reason,
    nativeObservation:observed.ok?observed:null,
    legacyOutcome:{outcome:legacyResult.outcome,successes:legacyResult.successes,fateSpent:legacyResult.fateSpent===true},
    sourceProfileId:"realm-guard-legacy-mixed",authenticated:false,completeTestHistoryVerified:false,
    ...(options.auditDatasetId?{datasetId:options.auditDatasetId}:{})};
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
    if(!reason&&options.auditDatasetId){
      const prior=await tb2ePackageAAuditDatasetEvidence({journalId:options.auditDatasetId});
      if(!prior.ok&&prior.reasonCode!=="AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE")return {...legacyResult,audit:{...failure(prior.reasonCode),traceMessageId:trace.id,gameplayCompleted:true}};
      const indexed=await legacyAppendAuditDataset({journalId:options.auditDatasetId,traceMessageIds:[trace.id],expectedRevision:prior.revision});
      if(!indexed.ok)return {...legacyResult,audit:{...indexed,traceMessageId:trace.id,gameplayCompleted:true}};
    }
    return {...legacyResult,audit:{ok:!reason,reasonCode:reason,traceMessageId:trace.id,status:record.status}};
  }catch{
    // Never reroll/re-spend/retry gameplay after a diagnostic storage failure.
    return {...legacyResult,audit:failure("LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY")};
  }
  }catch{return {...legacyResult,audit:failure("LEGACY_AUDIT_OBSERVATION_FAILED_AFTER_GAMEPLAY")};}
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
/** Explicit Legacy diagnostic creation; never called by CORE or startup. */
export async function legacyCreateAuditDataset({name="Realm Guard Package A audit"}={}){
 const session=datasetWriterSession();if(!session)return failure("CURRENT_SESSION_GM_LEGACY_REQUIRED");
 if(typeof name!=="string"||!name.trim()||name.length>128)return failure("AUDIT_DATASET_NAME_REQUIRED");
 try{
  const data={schemaVersion:1,kind:"LEGACY_AUDIT_DATASET",worldId:session.worldId,gmId:session.gm.id,revision:0,
   entries:[],commits:[],assuranceModel:"TRUSTED_GM_R",sourceProfileId:"realm-guard-legacy-mixed",authenticated:false};
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
  if(!prior.ok&&!(prior.reasonCode==="AUDIT_DATASET_UNINDEXED_ASSOCIATED_TRACE"&&prior.unindexedTraceMessageIds.every(id=>traceMessageIds.includes(id))))return failure(prior.reasonCode);
  if(prior.revision!==expectedRevision)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  if(prior.entries.length+traceMessageIds.length>128||prior.revision>=128)return failure("AUDIT_DATASET_SIZE_LIMIT");
  const journal=session.g.journal.get(journalId);
  if(!sameWriter(session)||!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  const before=stableDataset(journal.flags["realm-guard"].packageAAuditDataset);
  const entries=JSON.parse(JSON.stringify(prior.entries)),tests=new Set(entries.map(e=>e.testId)),messages=new Set(entries.map(e=>e.traceMessageId));
  for(const traceMessageId of traceMessageIds){
   const f=await tb2ePackageAAuditTraceFingerprint({traceMessageId});if(!f.ok)return failure(f.reasonCode);
   if(tests.has(f.testIdentity.testId)||messages.has(traceMessageId))return failure("AUDIT_DATASET_TEST_ALREADY_INDEXED");
   const association=session.g.messages.get(traceMessageId).flags["realm-guard"].packageAAudit.datasetId;
   if(association!==undefined&&association!==journalId)return failure("AUDIT_DATASET_TRACE_ASSOCIATION_MISMATCH");
   tests.add(f.testIdentity.testId);messages.add(traceMessageId);
   entries.push({sequence:entries.length,testId:f.testIdentity.testId,actorId:f.testIdentity.actorId,skillItemId:f.skillItemId,
    testMode:f.testMode,traceMessageId,legacyMessageId:f.legacyMessageId,outcome:f.outcome,checksum:f.checksum});
  }
  if(!sameWriter(session)||session.g.journal.get(journalId)!==journal)return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==before)return failure("AUDIT_DATASET_REVISION_CONFLICT");
  const data={...JSON.parse(before),revision:expectedRevision+1,entries,
   commits:[...JSON.parse(JSON.stringify(prior.commits)),{revision:expectedRevision+1,traceMessageIds:[...traceMessageIds]}]};
  await journal.update({"flags.realm-guard.packageAAuditDataset":JSON.parse(JSON.stringify(data))});
  if(!sameWriter(session))return failure("AUDIT_DATASET_SESSION_CHANGED");
  if(!privateDatasetJournal(journal,session))return failure("PRIVATE_CURRENT_GM_AUDIT_JOURNAL_REQUIRED");
  if(stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  const after=await tb2ePackageAAuditDatasetEvidence({journalId});if(!after.ok)return failure(after.reasonCode);
  if(!sameWriter(session)||!privateDatasetJournal(journal,session)||stableDataset(journal.flags["realm-guard"].packageAAuditDataset)!==stableDataset(data))return failure("AUDIT_DATASET_COMMIT_READBACK_CONFLICT");
  return {ok:true,journalId,revision:after.revision,indexedTraceMessageIds:[...traceMessageIds],authenticated:false};
 }catch{return failure("AUDIT_DATASET_APPEND_STORAGE_FAILED");}
 finally{appendLocks.delete(journalId);}
}
