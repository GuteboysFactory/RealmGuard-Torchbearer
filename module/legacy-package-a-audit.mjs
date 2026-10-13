import {tb2ePackageALegacyObservationProbe} from "./m10d18-tb2e-package-a-legacy-observation.mjs";

const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const failure=reasonCode=>({ok:false,reasonCode});

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
  // Do not change/disable the normal Fate prompt. If used, the saved BASE_ONLY
  // trace is explicitly incomplete because native Fate rounds are not hooked.
  const obstacle=options.obstacle??1,worldId=g.world.id;
  const legacyResult=await actor.rollRole(role,{obstacle});
  if(!legacyResult?.roll)return {...(legacyResult??{}),audit:failure("LEGACY_ROLL_DID_NOT_COMPLETE")};
  try{
  let observed=probe.observeBaseRoll(legacyResult.roll);
  if(observed.ok)observed=probe.finish();
  let reason=observed.ok?null:observed.reasonCode;
  if(legacyResult.fateSpent)reason="LEGACY_AUDIT_NATIVE_FATE_ROUNDS_NOT_CAPTURED";
  const current=globalThis.game;
  if(!current?.ready||current.system?.id!=="realm-guard"||current.user!==gm||!gm.active||gm.isGM!==true||current.users?.get(gm.id)!==gm||current.world?.id!==worldId||
    current.settings.get("realm-guard","activeRulesProfileId")!=="realm-guard-legacy-mixed")
    return {...legacyResult,audit:failure("LEGACY_AUDIT_SESSION_CHANGED_BEFORE_STORAGE")};
  const original=current.messages?.get(legacyResult.messageId);
  if(!original||original.speaker?.actor!==actor.id||original.speakerActor!==actor||original.speaker?.token||
     original.author!==gm||original.visible!==true||original.isContentVisible!==true)
    return {...legacyResult,audit:failure("LEGACY_AUDIT_ORIGINAL_MESSAGE_LINK_REQUIRED")};
  const record={schemaVersion:1,kind:"LEGACY_ROLE_AUDIT_BASE_ONLY",testId,worldId,actorId:actor.id,
    gmId:gm.id,skillItemId:role.id,obstacle,legacyMessageId:original.id,
    status:reason?"INCOMPLETE":"BASE_SCOPE_RECORDED",reasonCode:reason,
    nativeObservation:observed.ok?observed:null,
    legacyOutcome:{outcome:legacyResult.outcome,successes:legacyResult.successes,fateSpent:legacyResult.fateSpent===true},
    sourceProfileId:"realm-guard-legacy-mixed",authenticated:false,completeTestHistoryVerified:false};
  try{
    // Construct an evaluated native copy from serialized data. ChatMessage's
    // model may own/mutate its input; never hand it the gameplay Roll instance.
    const nativeCopy=globalThis.Roll.fromData(legacyResult.roll.toJSON());
    const trace=await globalThis.ChatMessage.create({speaker:{actor:actor.id,alias:actor.name},
      whisper:[gm.id],content:"<p>Realm Guard Package A: private Legacy diagnostic record.</p>",
      rolls:[nativeCopy],flags:{"realm-guard":{packageAAudit:record}}});
    if(!globalThis.game?.ready||globalThis.game.system?.id!=="realm-guard"||globalThis.game.user!==gm||!gm.active||gm.isGM!==true||globalThis.game.users?.get(gm.id)!==gm||globalThis.game.world?.id!==worldId||
      globalThis.game.settings.get("realm-guard","activeRulesProfileId")!=="realm-guard-legacy-mixed")
      return {...legacyResult,audit:{...failure("LEGACY_AUDIT_SESSION_CHANGED_DURING_STORAGE"),traceMessageId:trace.id}};
    return {...legacyResult,audit:{ok:!reason,reasonCode:reason,traceMessageId:trace.id,status:record.status}};
  }catch{
    // Never reroll/re-spend/retry gameplay after a diagnostic storage failure.
    return {...legacyResult,audit:failure("LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY")};
  }
  }catch{return {...legacyResult,audit:failure("LEGACY_AUDIT_OBSERVATION_FAILED_AFTER_GAMEPLAY")};}
}
