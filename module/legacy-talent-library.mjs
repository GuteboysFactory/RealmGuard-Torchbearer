import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { LEGACY_TALENTS } from './legacy-talent-catalog.mjs';
const NS='realm-guard',channel=`system.${NS}`,pending=new Map();
const esc=v=>foundry.utils.escapeHTML(String(v??''));
const primary=()=>game.users.filter(u=>u.active&&u.isGM).sort((a,b)=>a.id.localeCompare(b.id))[0];
const levelOf=t=>Math.max(1,Math.min(10,Math.trunc(Number(t.system?.minLevel??2))||2));
const folderId=f=>typeof f==='string'?f:f?.id??null;
let folderQueue=Promise.resolve();
export function ensureTalentFolders(pack=null){
  const run=folderQueue.then(()=>createTalentFolders(pack));folderQueue=run.catch(()=>{});return run;
}
async function createTalentFolders(pack){
  const folders=()=>Array.from(pack?.folders?.contents??pack?.folders??game.folders?.contents??[]);
  const FolderClass=globalThis.Folder?.implementation??globalThis.Folder;
  if(!FolderClass?.create)throw Error('Folder creation is unavailable.');
  const options=pack?{pack:pack.collection}:{};
  let parent=folders().find(f=>f.type==='Item'&&f.name==='Talents');
  if(!parent)parent=await FolderClass.create({name:'Talents',type:'Item',sorting:'m'},options);
  const result=new Map();
  for(let level=1;level<=10;level++){
    let folder=folders().find(f=>f.type==='Item'&&folderId(f.folder)===parent.id&&f.name===`Level ${level}`);
    if(!folder)folder=await FolderClass.create({name:`Level ${level}`,type:'Item',folder:parent.id,sorting:'a',sort:level*100000},options);
    result.set(level,folder.id);
  }
  return result;
}
export async function organizeTalentLibrary(pack){
  if(!legacyMixedPolishEnabled()||!game.user.isGM)return;
  const folders=await ensureTalentFolders(pack),docs=await pack.getDocuments(),updates=[];
  for(const item of docs.filter(i=>i.type==='talent')){
    const update={_id:item.id,...approvedTitleUpdate(item)};
    if(folderId(item.folder)!==folders.get(levelOf(item)))update.folder=folders.get(levelOf(item));
    const key=item.system?.sourceKey??item.flags?.[NS]?.starterKey?.replace(/^talent:/,'');
    const talent=LEGACY_TALENTS.find(t=>t.key===key);
    // Only rename known generated titles. A GM's own title and rule text survive.
    if(talent?.previousNames?.includes(item.name))update.name=talent.name;
    if(Object.keys(update).length>1)updates.push(update);
  }
  if(updates.length)await pack.documentClass.updateDocuments(updates,{pack:pack.collection,realmGuardTalentOrganization:true});
}
export async function defaultLibraryVisibility(pack){
  if(!legacyMixedPolishEnabled()||!game.user.isGM||!pack.configure)return;
  // An explicit core ownership configuration, including NONE/INHERIT, is GM policy.
  const configuration=game.settings.get('core','compendiumConfiguration')??{};
  if(configuration[pack.collection]?.ownership||pack.config?.ownership)return;
  await pack.configure({ownership:{PLAYER:'OBSERVER',TRUSTED:'OBSERVER',ASSISTANT:'OBSERVER'}});
}
function definition(data){
  const name=String(data?.name??'').trim().slice(0,100),description=String(data?.description??'').trim().slice(0,20000),level=Number(data?.level);
  if(!name||!description||!Number.isInteger(level)||level<2||level>10)throw Error('Enter a name, level 2–10 and rules text.');
  return {name,type:'talent',system:{sourceKey:`custom-${foundry.utils.randomID()}`,minLevel:level,frequency:'passive',linkType:'general',linkedSkill:'',linkedAbility:'',effectMode:'manual',diceBonus:0,description,session:{used:false},conflict:{usedId:''}},flags:{[NS]:{customTalent:true}}};
}
async function saveCustom(data,actorId,sender,actorUuid=null){
  const actor=actorUuid&&globalThis.fromUuid?await fromUuid(actorUuid):game.actors.get(actorId);
  if(!['character','npc'].includes(actor?.type)||typeof actor.createEmbeddedDocuments!=='function'||!actor.testUserPermission(sender,CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))throw Error('Only the character owner or GM may create its Talent.');
  const doc=definition(data),folders=await ensureTalentFolders();
  const ItemClass=globalThis.Item?.implementation??globalThis.Item;
  const item=await ItemClass.create({...doc,folder:folders.get(doc.system.minLevel),ownership:{default:CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER??2,[sender.id]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER}});
  // Creation is GM-authoritative so players without ITEM_CREATE still get both
  // the shared library reference and their own embedded copy exactly once.
  try{const [embedded]=await actor.createEmbeddedDocuments('Item',[{...doc,flags:{[NS]:{...doc.flags[NS],customTalentLibraryId:item.id}}}]);return {itemId:item.id,embeddedId:embedded.id};}
  catch(error){await item.delete();throw error;}
}
export async function createCustomTalent(sheet){
  if(!legacyMixedPolishEnabled()||!sheet.isEditable||!sheet.actor?.isOwner)return;
  const data=await foundry.applications.api.DialogV2.wait({window:{title:'Create Custom Talent',resizable:true},position:{width:560},modal:false,rejectClose:false,
    content:`<p>Create a Talent on ${esc(sheet.actor.name)} and save a reusable copy in Talents → its Level folder.</p><label>Name<input name="name" maxlength="100" required></label><label>Level<input type="number" name="level" min="2" max="10" step="1" value="2" required></label><label>Rules / effect<textarea name="description" rows="8" required></textarea></label>`,
    buttons:[{action:'create',label:'Create Talent',default:true,callback:(_e,b)=>({name:b.form.elements.name.value,level:Number(b.form.elements.level.value),description:b.form.elements.description.value})},{action:'cancel',label:'Cancel',callback:()=>null}]});
  if(!data)return;
  try{
    definition(data);
    if(game.user.isGM)await saveCustom(data,sheet.actor.id,game.user,sheet.actor.uuid);
    else{
      if(!primary())throw Error('An active GM is needed to save the shared Talent.');
      await new Promise((resolve,reject)=>{const requestId=foundry.utils.randomID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('The GM did not respond. Check the library before trying again.'));},15000);pending.set(requestId,{resolve,reject,timer});game.socket.emit(channel,{type:'legacy-custom-talent',requestId,actorId:sheet.actor.id,actorUuid:sheet.actor.uuid,data,senderId:game.user.id});});
    }
    await sheet.render({force:true});ui.notifications.info('Talent added to the sheet and saved in the Talent library.');
  }catch(error){ui.notifications.warn(error.message);}
}
export function installLegacyTalentLibrary(){
  Hooks.once('ready',async()=>{
    if(!legacyMixedPolishEnabled())return;
    const requests=new Map();
    game.socket.on(channel,async message=>{
      if(message?.type==='legacy-custom-talent-result'&&message.userId===game.user.id){const p=pending.get(message.requestId);if(p){pending.delete(message.requestId);clearTimeout(p.timer);message.error?p.reject(Error(message.error)):p.resolve(message.result);}return;}
      if(message?.type!=='legacy-custom-talent'||primary()?.id!==game.user.id)return;
      const sender=game.users.get(message.senderId);if(!sender)return;
      const key=`${sender.id}:${message.requestId}`;
      if(!requests.has(key))requests.set(key,saveCustom(message.data,message.actorId,sender,message.actorUuid).then(result=>({result}),error=>({error:error.message})));
      const reply=await requests.get(key);game.socket.emit(channel,{type:'legacy-custom-talent-result',requestId:message.requestId,userId:sender.id,...reply});
    });
    if(primary()?.id===game.user.id){
      try{
        const folders=await ensureTalentFolders();
        for(const item of game.items.filter(i=>i.type==='talent')){
          const update=approvedTitleUpdate(item);if(folderId(item.folder)!==folders.get(levelOf(item)))update.folder=folders.get(levelOf(item));
          if(Object.keys(update).length)await item.update(update);
        }
        for(const actor of game.actors)for(const item of actor.items.filter(i=>i.type==='talent')){const update=approvedTitleUpdate(item);if(Object.keys(update).length)await item.update(update);}
      }catch(error){console.error('Realm Guard | Talent library organization',error);ui.notifications.warn(error.message);}
    }
  });
  Hooks.on('preCreateItem',(item,data)=>{
    if(!legacyMixedPolishEnabled()||item.parent||item.pack||Object.hasOwn(data,'ownership'))return;
    item.updateSource({ownership:{default:CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER??2}});
  });
}
function approvedTitleUpdate(item){
  const talent=LEGACY_TALENTS.find(t=>t.key===item.system?.sourceKey),update={};
  if(talent?.previousNames?.includes(item.name))update.name=talent.name;
  const description=String(item.system?.description??'');
  if(talent&&description.includes('Working title: original name not verified in the supplied Handbook.'))update['system.description']=description.replace('Working title: original name not verified in the supplied Handbook. Effects: supplied Realm Guard adaptation.','Name and effects: user-approved Realm Guard / Fire Talent.');
  return update;
}
