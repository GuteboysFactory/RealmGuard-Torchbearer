import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
const NS='realm-guard';
const authorId=m=>m?.author?.id??m?.user?.id??m?.user??m?._source?.user;
export function canUndoRollMessage(message,user=game.user){
  const flags=message?.flags?.[NS];
  return Boolean(flags&&!flags.rollDecisionPending&&!flags.superseded&&(user?.isGM||authorId(message)===user?.id)&&(flags.rollUndo&&!flags.rollUndo.undone||flags.conflictRoll));
}
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const copy=v=>v===undefined?undefined:foundry.utils.deepClone(v);
function tracked(doc){return {system:copy(doc.system?.toObject?.()??doc.system??{}),flags:copy(doc.flags??{})};}
export function snapshotActors(ids){
  return ids.map(id=>game.actors.get(id)).filter(Boolean).map(actor=>({id:actor.id,data:tracked(actor),items:actor.items.map(item=>({id:item.id,data:tracked(item)}))}));
}
export function changedPaths(before,after,prefix=''){
  if(equal(before,after))return [];
  if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after))return [...new Set([...Object.keys(before),...Object.keys(after)])].flatMap(key=>changedPaths(before[key],after[key],prefix?`${prefix}.${key}`:key));
  return [{path:prefix,before:copy(before),after:copy(after),hadBefore:before!==undefined,hadAfter:after!==undefined}];
}
export function actorChanges(before,after){
  return before.flatMap(a=>{const b=after.find(row=>row.id===a.id);if(!b)return [];return [{actorId:a.id,paths:changedPaths(a.data,b.data)},...a.items.map(item=>({actorId:a.id,itemId:item.id,paths:changedPaths(item.data,b.items.find(row=>row.id===item.id)?.data)}))].filter(row=>row.paths.length);});
}
function get(doc,path){return path.split('.').reduce((obj,key)=>obj?.[key],doc);}
function patchPath(path,value,exists){const parts=path.split('.');return exists?{[path]:copy(value)}:{[`${parts.slice(0,-1).join('.')}.-=${parts.at(-1)}`]:null};}
export function validateUndo(changes,user=game.user){
  for(const row of changes){const actor=game.actors.get(row.actorId),doc=row.itemId?actor?.items.get(row.itemId):actor;if(!actor||!doc||!actor.testUserPermission(user,CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))throw new Error('A changed character is missing or you lack permission. Ask the GM to undo this roll.');
    for(const p of row.paths)if(!equal(get(doc,p.path),p.after))throw new Error('Later changes depend on this roll. Undo those changes first; nothing has been restored.');
  }
}
export function validateUndoSeries(steps){
  const simulated=new Map();
  for(const changes of steps)for(const row of changes){const actor=game.actors.get(row.actorId),real=row.itemId?actor?.items.get(row.itemId):actor,key=`${row.actorId}:${row.itemId??''}`;if(!real||!actor.isOwner)throw Error('A changed document is missing or inaccessible.');if(!simulated.has(key))simulated.set(key,tracked(real));const doc=simulated.get(key);
    for(const p of row.paths){if(!equal(get(doc,p.path),p.after))throw Error('Later document changes prevent this Conflict rollback. Correct them first.');const keys=p.path.split('.');let parent=doc;for(const key of keys.slice(0,-1))parent=parent[key]??={};if(p.hadBefore)parent[keys.at(-1)]=copy(p.before);else delete parent[keys.at(-1)];}
  }
}
export async function restoreChanges(changes){
  validateUndo(changes);const applied=[];
  try{for(const row of [...changes].reverse()){const actor=game.actors.get(row.actorId),doc=row.itemId?actor.items.get(row.itemId):actor;await doc.update(Object.assign({},...row.paths.map(p=>patchPath(p.path,p.before,p.hadBefore))));applied.push(row);}}
  catch(error){for(const row of applied.reverse()){const actor=game.actors.get(row.actorId),doc=row.itemId?actor.items.get(row.itemId):actor;await doc.update(Object.assign({},...row.paths.map(p=>patchPath(p.path,p.after,p.hadAfter))));}throw error;}
}
const transactions=new Map(),busyUndo=new Set();
export function registerRollMessage(actor,message){const tx=transactions.get(actor.id);if(tx&&!tx.messages.some(m=>m.id===message.id))tx.messages.push(message);}
export function enlistRollActors(actor,ids){const tx=transactions.get(actor.id);if(tx)for(const id of ids??[])if(!tx.actorIds.has(id)){tx.actorIds.add(id);tx.before.push(...snapshotActors([id]));}}
export async function withRollUndo(actor,callback){
  if(!legacyMixedPolishEnabled())return callback();
  if(transactions.has(actor.id))return ui.notifications.warn('Finish this character’s open roll before starting another one.');
  const tx={messages:[],actorIds:new Set([actor.id]),before:snapshotActors([actor.id])};transactions.set(actor.id,tx);
  const beforeTurn=game.settings.get(NS,'playerTurnLastActor');
  try{
    let result,error;try{result=await callback();}catch(caught){error=caught;}
    if(tx.messages.length)await actor.setFlag(NS,'lastUndoRoll',tx.messages[0].id);
    const changes=actorChanges(tx.before,snapshotActors([...tx.actorIds]));
    const afterTurn=game.settings.get(NS,'playerTurnLastActor');
    const settings=equal(beforeTurn,afterTurn)?[]:[{key:'playerTurnLastActor',before:beforeTurn??'',after:afterTurn??''}];
    if(tx.messages.length){const last=tx.messages[0];await last.update({'flags.realm-guard.rollUndo':{actorId:actor.id,changes,settings,sessionCycle:Number(game.settings.get(NS,'endSessionCycle')??1),messageIds:tx.messages.map(m=>m.id),undone:false}});}
    if(error)throw error;return result;
  }finally{transactions.delete(actor.id);}
}
export async function undoSkillMessage(message,{requester=game.user}={}){
  const undo=message?.getFlag?.(NS,'rollUndo')??message?.flags?.[NS]?.rollUndo;
  if(!undo||undo.undone||busyUndo.has(message.id))return;
  busyUndo.add(message.id);
  try{
    if(message.flags?.[NS]?.rollDecisionPending)throw Error('Finish the pending roll choices first.');
    const author=authorId(message);
    if(!requester.isGM&&author!==requester.id)throw Error('Only the rolling player or GM may undo this roll.');
    if(!requester.isGM&&!game.actors.get(undo.actorId)?.testUserPermission(requester,CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))throw Error('You no longer control this character.');
    if(undo.sessionCycle!==undefined&&undo.sessionCycle!==Number(game.settings.get(NS,'endSessionCycle')??1))throw Error('This roll belongs to an earlier session. Ask the GM for a manual correction.');
    if(!game.user.isGM&&((undo.settings??[]).length||undo.changes.some(row=>!game.actors.get(row.actorId)?.isOwner))){if(!game.users.some(u=>u.isGM&&u.active))throw Error('An active GM is needed to restore shared changes.');game.socket.emit(`system.${NS}`,{type:'legacy-undo-roll',messageId:message.id,senderId:game.user.id});ui.notifications.info('Restoring your roll…');return;}
    for(const row of undo.settings??[])if(!equal(game.settings.get(NS,row.key),row.after))throw Error('A later turn depends on this roll. Undo it first.');
    await restoreChanges(undo.changes);
    for(const row of undo.settings??[])await game.settings.set(NS,row.key,row.before);
    await message.update({'flags.realm-guard.rollUndo.undone':true,content:`<div class="realm-guard rg-roll-undone"><h3>Roll undone</h3><p>Result and tracked character changes were restored.</p><details><summary>Previous result · no longer applies</summary>${message.content}</details></div>`});
    for(const id of undo.messageIds??[]){if(id===message.id)continue;const other=game.messages.get(id);if(other)await other.update({'flags.realm-guard.superseded':true,content:`<div class="realm-guard rg-roll-undone"><b>Result undone with its Skill roll</b><details><summary>Previous result</summary>${other.content}</details></div>`});}
  }catch(error){ui.notifications.warn(error.message);return false;}finally{busyUndo.delete(message.id);}
  return true;
}
export function installRollUndo(SheetClass){
  if(!legacyMixedPolishEnabled())return;
  for(const name of ['_rollRole','_rollUntrained','_rollAbility']){
    const original=SheetClass[name];if(typeof original!=='function')continue;
    const wrapped=function(...args){if(name==='_rollRole'){const id=args[1]?.closest?.('[data-item-id]')?.dataset.itemId;if(Number(this.actor.items.get(id)?.system.rating??1)<=0)return SheetClass._rollUntrained.apply(this,args);}return withRollUndo(this.actor,()=>original.apply(this,args));};SheetClass[name]=wrapped;
    if(SheetClass.DEFAULT_OPTIONS?.actions)for(const key of Object.keys(SheetClass.DEFAULT_OPTIONS.actions))if(SheetClass.DEFAULT_OPTIONS.actions[key]===original)SheetClass.DEFAULT_OPTIONS.actions[key]=wrapped;
  }
  const messageFor=li=>{const el=li?.[0]??li,node=el?.closest?.('[data-message-id],[data-entry-id],[data-document-id]')??el;return game.messages.get(node?.dataset?.messageId??node?.dataset?.entryId??node?.dataset?.documentId??li?.attr?.('data-message-id'));};
  const run=m=>m?.flags?.[NS]?.conflictRoll?game.realmGuard.undoConflictMessage?.(m):undoSkillMessage(m);
  const add=(_html,options)=>options.push({name:'Undo roll',icon:'<i class="fa-solid fa-rotate-left"></i>',condition:li=>canUndoRollMessage(messageFor(li)),callback:li=>run(messageFor(li))});
  Hooks.on('getChatMessageContextOptions',add);
  Hooks.on('renderChatMessageHTML',(message,html)=>{const root=html instanceof HTMLElement?html:html?.[0];if(!root||!canUndoRollMessage(message)||root.querySelector('[data-rg-undo-roll]'))return;const button=document.createElement('button');button.type='button';button.dataset.rgUndoRoll='';button.textContent=game.user.isGM?'Undo roll':'Undo my roll';button.onclick=()=>void run(message);root.append(button);});
  Hooks.on('createChatMessage',message=>{const author=message.author?.id??message.user?.id??message.user;if(author!==game.user.id)return;for(const tx of transactions.values())if(tx.actorIds.has(message.speaker?.actor)&&!tx.messages.some(m=>m.id===message.id))tx.messages.push(message);});
  Hooks.once('ready',()=>game.socket.on(`system.${NS}`,async m=>{if(m?.type!=='legacy-undo-roll'||!game.user.isGM)return;const first=game.users.filter(u=>u.isGM&&u.active).sort((a,b)=>a.id.localeCompare(b.id))[0];if(first?.id!==game.user.id)return;const requester=game.users.get(m.senderId);if(requester)await undoSkillMessage(game.messages.get(m.messageId),{requester});}));
  game.realmGuard??={};game.realmGuard.undoSkillMessage=undoSkillMessage;
}
