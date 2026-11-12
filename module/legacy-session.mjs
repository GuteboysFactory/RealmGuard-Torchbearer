import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { registerGmDockTool } from './gm-dock.mjs';
import { resetTraitSessionUses } from './traits.mjs';
import { resetTokenPowerSessionState } from './tokens-of-power.mjs';
import { resetTalentSessionState } from './talents.mjs';

const NS = 'realm-guard';
export function wiseAvailable(wise) {
  if (!legacyMixedPolishEnabled()) return true;
  return Number(wise?.system?.level ?? 1) !== 1 || !(wise?.getFlag?.(NS, 'wiseUsed') ?? wise?.flags?.[NS]?.wiseUsed);
}
export async function consumeWise(wise) {
  if (!legacyMixedPolishEnabled() || Number(wise?.system?.level ?? 1) !== 1) return;
  if (!wiseAvailable(wise)) throw new Error('This Wise was already used this session.');
  await wise.update({[`flags.${NS}.wiseUsed`]:true});
}
export async function resetWiseSessionUses(actor){let count=0;for(const wise of actor.items.filter(i=>i.type==='wise'))if(wise.getFlag?.(NS,'wiseUsed')??wise.flags?.[NS]?.wiseUsed){await wise.update({[`flags.${NS}.-=wiseUsed`]:null});count++;}return count;}
let starting = false;
const wiseRequests=new Map();let wiseQueue=Promise.resolve();
export async function consumeWiseHelpers(actor,entries=[]){
  if(!legacyMixedPolishEnabled())return;
  const seen=new Set();
  for(const entry of entries){if(entry.sourceKind!=='Wise'||seen.has(entry.actorId))continue;seen.add(entry.actorId);const helper=game.actors.get(entry.actorId),wise=helper?.items.get(entry.sourceId);if(wise?.type!=='wise'||!wiseAvailable(wise))throw Error('A helper Wise was already used this session. Refresh Help before rolling.');
    if(helper.isOwner){await consumeWise(wise);continue;}
    const gm=game.users.filter(u=>u.isGM&&u.active).sort((a,b)=>a.id.localeCompare(b.id))[0];if(!gm)throw Error('The GM must be connected to confirm the helper Wise.');
    const requestId=foundry.utils.randomID();await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{wiseRequests.delete(requestId);reject(Error('Timed out confirming helper Wise.'));},8000);wiseRequests.set(requestId,{resolve,reject,timer,gmId:gm.id});game.socket.emit(`system.${NS}`,{type:'legacy-wise-help',requestId,senderId:game.user.id,actorId:actor.id,helperId:helper.id,wiseId:wise.id});});
  }
}
async function onWiseSocket(message){
  if(message?.type==='legacy-wise-help-reply'){const row=wiseRequests.get(message.requestId);if(!row||message.senderId!==row.gmId)return;wiseRequests.delete(message.requestId);clearTimeout(row.timer);if(message.ok)row.resolve();else row.reject(Error(message.error));return;}
  if(message?.type!=='legacy-wise-help'||!game.user?.isGM)return;
  if(game.users.filter(u=>u.isGM&&u.active).sort((a,b)=>a.id.localeCompare(b.id))[0]?.id!==game.user.id)return;
  wiseQueue=wiseQueue.catch(()=>{}).then(async()=>{let error='';try{const sender=game.users.get(message.senderId),actor=game.actors.get(message.actorId),wise=game.actors.get(message.helperId)?.items.get(message.wiseId);if(!sender?.active||!actor?.testUserPermission(sender,CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)||wise?.type!=='wise')throw Error('Invalid helper Wise request.');await consumeWise(wise);}catch(e){error=e.message;}game.socket.emit(`system.${NS}`,{type:'legacy-wise-help-reply',requestId:message.requestId,senderId:game.user.id,ok:!error,error});});return wiseQueue;
}
export async function startLegacySession() {
  if (!game.user?.isGM || starting) return;
  const approved = await foundry.applications.api.DialogV2.confirm({window:{title:'Start a new session'},content:'<p>Start a new session? Resets used Level 1 Wises, Trait benefits, Tokens of Power and session Talents for all characters and NPCs. Fate, Persona, Conditions and Learning are retained.</p>',modal:false});
  if (!approved || starting) return;
  starting = true;
  try {
    for (const actor of game.actors.filter(a => ['character','npc'].includes(a.type))) {
      await resetWiseSessionUses(actor);
      await resetTraitSessionUses(actor);
      await resetTokenPowerSessionState(actor);
      await resetTalentSessionState(actor);
    }
    await game.settings.set(NS,'endSessionCycle',Number(game.settings.get(NS,'endSessionCycle') ?? 1)+1);
    await game.settings.set(NS,'endSessionFinalized',false);
    await ChatMessage.create({content:'<div class="realm-guard rg-session-notice"><h3>New session started</h3><p>Session uses restored: Wises, Traits, Tokens of Power and Talents.</p></div>'});
  } finally { starting = false; }
}
export function installLegacySession() {
  if (!legacyMixedPolishEnabled()) return;
  registerGmDockTool({id:'start-session',icon:'fa-solid fa-play',tooltip:'Start Session · reset session uses',order:9,onClick:startLegacySession});
  Hooks.once('ready',()=>game.socket.on(`system.${NS}`,onWiseSocket));
}
