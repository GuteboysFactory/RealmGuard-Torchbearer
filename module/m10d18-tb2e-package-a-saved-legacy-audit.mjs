import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageADocumentEvidence} from "./m10d18-tb2e-package-a-document-provenance.mjs";

const result=(ok,reasonCode=null,data={})=>freezeTb2e({ok,reasonCode,phase:"M10D.18_PACKAGE_A",
 mode:"SAVED_PRIVATE_LEGACY_AUDIT_READ_ONLY",liveApplication:false,writesPlanned:0,
 actorWrite:false,itemWrite:false,journalWrite:false,settingsWrite:false,rollExecuted:false,
 resourceSpendCommitted:false,advancementWrite:false,learningWrite:false,
 actorSourceAuthenticated:false,rollSourceAuthenticated:false,gmPermissionAuthenticated:false,
 historicalRewardBalanceVerified:false,rollTimeActorStateVerified:false,playerConsentAuthenticated:false,
 immutableChronologyVerified:false,duplicateTestCheckAuthenticated:false,completeTestHistoryVerified:false,
 noAdvanceAuthorized:true,...data});

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
  if(!r||r.schemaVersion!==1||r.kind!=="LEGACY_ROLE_AUDIT_BASE_ONLY"||r.sourceProfileId!=="realm-guard-legacy-mixed"||
    r.worldId!==g.world?.id||r.gmId!==gm.id||typeof r.testId!=="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(r.testId))
    return result(false,"SAVED_LEGACY_AUDIT_SCOPE_MISMATCH");
  if(r.status!=="BASE_SCOPE_RECORDED"||r.reasonCode!==null||r.legacyOutcome?.fateSpent!==false)
    return result(false,"SAVED_LEGACY_AUDIT_INCOMPLETE");
  if(r.authenticated!==false||r.completeTestHistoryVerified!==false)return result(false,"EDITABLE_AUDIT_ATTESTATION_REJECTED");
  const original=g.messages.get(r.legacyMessageId);
  if(!original||original===message||original.documentName!=="ChatMessage"||original.visible!==true||original.isContentVisible!==true||
    original.author!==gm||original.speaker?.actor!==r.actorId||original.speakerActor!==g.actors?.get(r.actorId)||original.speaker?.token)
    return result(false,"SAVED_LEGACY_ORIGINAL_MESSAGE_REQUIRED");
  const evidence=tb2ePackageADocumentEvidence({actorId:r.actorId,messageId:traceMessageId});
  if(!evidence.ok)return result(false,evidence.reasonCode);
  const o=r.nativeObservation,base=o?.baseRecord;
  if(!o?.ok||o.status!=="OBSERVED_UNPERSISTED"||o.testIdentity?.testId!==r.testId||
    o.testIdentity?.worldId!==r.worldId||o.testIdentity?.actorId!==r.actorId||o.skillSource?.itemId!==r.skillItemId||
    !Array.isArray(base?.dice)||base.dice.length!==evidence.dice.length||
    base.dice.some((d,i)=>d.face!==evidence.dice[i].face||d.dieId!==`${r.testId}:base:${i}`)||
    base.recordId!==`${r.testId}:base`||base.formula!==`${base.dice.length}d6`||
    base.total!==evidence.dice.reduce((n,d)=>n+d.face,0)||
    !Array.isArray(o.nativeEventHistory)||o.nativeEventHistory.length||!Array.isArray(o.resourceChanges)||o.resourceChanges.length)
    return result(false,"SAVED_LEGACY_NATIVE_BASE_MISMATCH");
  const successes=evidence.dice.filter(d=>d.face>=4).length;
  if(!Number.isSafeInteger(r.obstacle)||r.obstacle<1||r.legacyOutcome.successes!==successes||
    r.legacyOutcome.outcome!==(successes>=r.obstacle?"PASS":"FAIL"))return result(false,"SAVED_LEGACY_FINAL_MISMATCH");
  const duplicate=[...g.messages.values()].filter(m=>m!==message&&m.visible===true&&m.isContentVisible===true&&
    m.flags?.["realm-guard"]?.packageAAudit?.worldId===r.worldId&&m.flags?.["realm-guard"]?.packageAAudit?.testId===r.testId);
  if(duplicate.length)return result(false,"SAVED_LEGACY_DUPLICATE_TEST_IN_CURRENT_MESSAGES");
  return result(true,null,{testIdentity:{worldId:r.worldId,testId:r.testId,actorId:r.actorId},
    traceMessageId,legacyMessageId:original.id,skillItemId:r.skillItemId,savedNativeEvidence:evidence,
    baseFaces:evidence.dice.map(d=>d.face),recordedLegacyOutcome:r.legacyOutcome.outcome,
    evidenceScope:"CURRENT_MUTABLE_PRIVATE_CHAT_AND_NATIVE_BASE_ONLY",
    storedNativeBaseAndLinkedOutcomeAgree:true,historicalSnapshotAuthentication:false});
 }catch{return result(false,"SAVED_LEGACY_AUDIT_READ_FAILED");}
}
