import {tb2ePackageALegacyObservationProbe} from "./m10d18-tb2e-package-a-legacy-observation.mjs";
import {tb2ePackageASavedLegacyAuditEvidence} from "./m10d18-tb2e-package-a-saved-legacy-audit.mjs";

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
export async function legacyRoleRollWithAudit(actor,role,options={}){
  if(!fields(options,["obstacle"])||!Number.isSafeInteger(options.obstacle??1)||(options.obstacle??1)<1)
    return failure("LEGACY_AUDIT_PLAIN_OBSTACLE_SCOPE_REQUIRED");
  const g=globalThis.game,gm=g?.user;
  if(!g?.ready||g.system?.id!=="realm-guard"||!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)
    return failure("CURRENT_SESSION_GM_REQUIRED");
  if(g.actors?.get(actor?.id)!==actor||actor.items?.get(role?.id)!==role||role?.type!=="role")
    return failure("LEGACY_AUDIT_OWNED_WORLD_SKILL_REQUIRED");
  const testId=globalThis.foundry.utils.randomID();
  const probe=tb2ePackageALegacyObservationProbe({actorId:actor.id,skillItemId:role.id,testId});
  if(!probe.ok)return failure(probe.reasonCode);
  // Saved Fate scope is checked separately; mutable records are not attestation.
  const obstacle=options.obstacle??1,worldId=g.world.id;
  const capability=Object.freeze({});
  const capture={actor,probe,testId,parents:[],round:0,nativeData:[],error:null};
  captures.set(capability,capture);
  let legacyResult;
  try{legacyResult=await actor.rollRole(role,{obstacle,legacyAuditCapture:capability});}
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
  const fateScope=legacyResult.fateSpent===true;
  const record={schemaVersion:fateScope?2:1,kind:fateScope?"LEGACY_ROLE_AUDIT_BASE_FATE":"LEGACY_ROLE_AUDIT_BASE_ONLY",testId,worldId,actorId:actor.id,
    gmId:gm.id,skillItemId:role.id,obstacle,legacyMessageId:original.id,
    status:reason?"INCOMPLETE":fateScope?"BASE_FATE_SCOPE_RECORDED":"BASE_SCOPE_RECORDED",reasonCode:reason,
    nativeObservation:observed.ok?observed:null,
    legacyOutcome:{outcome:legacyResult.outcome,successes:legacyResult.successes,fateSpent:legacyResult.fateSpent===true},
    sourceProfileId:"realm-guard-legacy-mixed",authenticated:false,completeTestHistoryVerified:false};
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
    return {...legacyResult,audit:{ok:!reason,reasonCode:reason,traceMessageId:trace.id,status:record.status}};
  }catch{
    // Never reroll/re-spend/retry gameplay after a diagnostic storage failure.
    return {...legacyResult,audit:failure("LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY")};
  }
  }catch{return {...legacyResult,audit:failure("LEGACY_AUDIT_OBSERVATION_FAILED_AFTER_GAMEPLAY")};}
}
