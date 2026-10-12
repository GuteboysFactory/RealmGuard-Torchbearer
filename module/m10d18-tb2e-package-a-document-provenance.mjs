import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageAOutcomeAndProgressPlan} from "./m10d18-tb2e-package-a-outcome-chain.mjs";
import {tb2eConditionInfo} from "./m10d-tb2e-conditions-shadow.mjs";

const result=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",mode:"FOUNDRY_DOCUMENT_EVIDENCE_READ_ONLY",
  sourceEvidence:"SG 31,46-52,87-88; DH 59,77",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,
  resourceSpendCommitted:false,advancementWrite:false,
  // A mutable client document is evidence, not server attestation or an immutable log.
  actorSourceAuthenticated:false,rollSourceAuthenticated:false,
  gmPermissionAuthenticated:false,rollTimeActorStateVerified:false,
  historicalRewardBalanceVerified:false,noAdvanceAuthorized:true,...data
});
const deny=code=>result(false,code);
const id=v=>typeof v==="string"&&/^[A-Za-z0-9]{1,128}$/.test(v);
const nonnegative=v=>Number.isInteger(v)&&v>=0;

/** IDs only: resolve documents from the current Foundry session. No injected
 * runtime/Actor/User/Roll, no flags/content parsing, RNG, sockets or writes.
 * Deliberately narrow: world Actor and a single plain, evaluated Nd6 Roll.
 * Foundry clients and saved messages are mutable; never authorize a live action.
 */
export function tb2ePackageADocumentEvidence({actorId=null,messageId=null}={}){
  try {
    const g=globalThis.game;
    if(!g?.ready||g.system?.id!=="realm-guard")return deny("READY_REALM_GUARD_SESSION_REQUIRED");
    const gm=g.user;
    if(!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)
      return deny("CURRENT_SESSION_GM_REQUIRED");
    // Do not reveal Actor or private dice data before checking the current GM.
    if(!id(actorId)||!id(messageId))return deny("DOCUMENT_IDS_REQUIRED");
    const actor=g.actors?.get(actorId),message=g.messages?.get(messageId);
    if(!actor||actor.id!==actorId||actor.documentName!=="Actor"||
       actor.isToken||actor.inCompendium||actor.type!=="character")
      return deny("WORLD_CHARACTER_ACTOR_REQUIRED");
    if(!message||message.id!==messageId||message.documentName!=="ChatMessage"||
       message.visible!==true||message.isContentVisible!==true)
      return deny("VISIBLE_CHAT_MESSAGE_REQUIRED");
    if(message.speaker?.token||message.speaker?.scene||
       message.speaker?.actor!==actorId||message.speakerActor!==actor)
      return deny("WORLD_ACTOR_SPEAKER_MISMATCH");
    const author=message.author;
    if(!author||g.users.get(author.id)!==author||
       !(author.isGM===true||actor.testUserPermission(author,"OWNER")===true))
      return deny("MESSAGE_AUTHOR_CURRENT_ACTOR_PERMISSION_REQUIRED");
    const rolls=message.rolls;
    if(!Array.isArray(rolls)||rolls.length!==1)return deny("SINGLE_NATIVE_ROLL_REQUIRED");
    const roll=rolls[0];
    if(roll?._evaluated!==true||!Array.isArray(roll.terms)||roll.terms.length!==1)
      return deny("PLAIN_EVALUATED_D6_REQUIRED");
    const term=roll.terms[0];
    const nativeDie=globalThis.foundry?.dice?.terms?.Die;
    if(typeof nativeDie!=="function"||term?.constructor!==nativeDie||term.faces!==6||
       !Number.isInteger(term.number)||term.number<1||term.number>250||
       roll.formula!==`${term.number}d6`||!Array.isArray(term.modifiers)||term.modifiers.length||
       !Array.isArray(term.results)||term.results.length!==term.number)
      return deny("PLAIN_EVALUATED_D6_REQUIRED");
    if(!term.results.every(d=>Number.isInteger(d.result)&&d.result>=1&&d.result<=6&&
       d.active===true&&!d.discarded&&!d.rerolled&&!d.exploded))
      return deny("MODIFIED_OR_INVALID_DIE_HISTORY_UNSUPPORTED");
    const dice=term.results.map((d,index)=>({
      dieId:`${messageId}:0:0:${index}`,face:d.result,source:"SAVED_PLAIN_D6_RESULT"
    }));
    if(roll.total!==dice.reduce((sum,d)=>sum+d.face,0))return deny("SAVED_ROLL_TOTAL_MISMATCH");
    const conditions=[];
    for(const item of actor.items){
      if(item.type!=="condition")continue;
      if(typeof item.system?.active!=="boolean")return deny("INVALID_ACTOR_CONDITION_STATE");
      if(!item.system.active)continue;
      // Legacy names must not silently acquire TB CORE semantics.
      if(!["fresh","hungry & thirsty","hungry and thirsty","exhausted","angry",
        "sick","injured","afraid","dead"].includes(String(item.name).trim().toLowerCase()))
        return deny("UNMAPPED_ACTOR_CONDITION");
      const info=tb2eConditionInfo(item.name);
      if(!info.ok)return deny("UNMAPPED_ACTOR_CONDITION");
      conditions.push(item.name);
    }
    const fate=actor.system?.resources?.fate?.value,persona=actor.system?.resources?.persona?.value;
    if(!nonnegative(fate)||!nonnegative(persona))return deny("INVALID_CURRENT_ACTOR_REWARDS");
    return result(true,null,{
      currentSessionGmObserved:true,currentGmId:gm.id,
      actorDocumentObserved:true,actorId,actorUuid:actor.uuid,
      messageDocumentObserved:true,messageId,messageAuthorId:author.id,
      messageTimestamp:Number.isSafeInteger(message.timestamp)&&message.timestamp>=0?
        message.timestamp:null,
      authorPermissionScope:"CURRENT_PERMISSION_ONLY_NOT_PERMISSION_AT_ROLL_TIME",
      dice,conditions:[...new Set(conditions)],currentRewards:{fate,persona},
      evidenceScope:"CURRENT_MUTABLE_CLIENT_DOCUMENTS_NOT_IMMUTABLE_HISTORY",
      wiseFateChronologyVerified:false,scenarioAtRollTimeVerified:false
    });
  }catch{return deny("DOCUMENT_EVIDENCE_READ_FAILED");}
}

/** Compare a GM-reviewed scenario with current Actor facts and read the dice
 * from its linked message. Does not claim these facts existed at roll time.
 * Reward spending, helper provenance and Heroic entitlements remain separate.
 */
export function tb2ePackageADocumentOutcomePlan({actorId=null,messageId=null,scenarioInput=null}={}){
  const evidence=tb2ePackageADocumentEvidence({actorId,messageId});
  if(!evidence.ok)return evidence;
  try {
    if(!scenarioInput||scenarioInput.mode!=="SKILL"||scenarioInput.help!=null||
       scenarioInput.wiseAid!=null||scenarioInput.channelNatureFacts!=null||
       scenarioInput.heroicRatingSevenUnlocked===true||
       Object.values(scenarioInput.bonuses??{}).some(v=>v!==0))
      return deny("DOCUMENT_BRIDGE_SCOPE_UNSUPPORTED");
    const actor=globalThis.game.actors.get(actorId);
    const roles=actor.items.filter(i=>i.type==="role"&&
      i.name.trim().toLowerCase()===String(scenarioInput.skillName??"").trim().toLowerCase());
    if(roles.length!==1||!Number.isInteger(roles[0].system?.rating)||
       roles[0].system.rating!==scenarioInput.rating||scenarioInput.actingCharacterId!==actorId)
      return deny("CURRENT_ACTOR_SKILL_OR_ID_MISMATCH");
    const normalize=xs=>Array.isArray(xs)?xs.map(x=>String(x).trim().toLowerCase()).sort():null;
    if(JSON.stringify(normalize(scenarioInput.actingConditions))!==JSON.stringify(normalize(evidence.conditions)))
      return deny("CURRENT_ACTOR_CONDITIONS_MISMATCH");
    const preview=tb2ePackageAOutcomeAndProgressPlan({scenarioInput,
      dice:evidence.dice.map(d=>d.face),gmDiceReviewed:true,gmConfirmsNoRerolls:true});
    if(!preview.ok)return result(false,"PREVIEW_"+preview.reasonCode);
    return result(true,null,{evidence,outcomePreview:preview,
      currentActorScenarioMatched:true,scenarioFactsStillGmAsserted:true});
  }catch{return deny("DOCUMENT_SCENARIO_COMPARISON_FAILED");}
}
