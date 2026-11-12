import {legacyMixedPolishEnabled} from './legacy-mixed-scope.mjs';
import {LEGACY_TRAITS} from './legacy-trait-catalog.mjs';
const NS='realm-guard',placeholder='Starter Realm Guard Trait entry. Trait level and fictional meaning belong to the character; edit the imported copy freely.';
const normalize=s=>String(s??'').trim().toLocaleLowerCase();
const folderId=f=>typeof f==='string'?f:f?.id??null;
export function suppliedTraitDocument(trait){return {name:trait.name,type:'trait',flags:{[NS]:{starterKey:trait.key,starterCategory:'traits',suppliedTrait:true}},system:{rating:1,description:trait.description}};}
async function ensureFolder(pack=null){
 const folders=pack?(pack.folders?.contents??Array.from(pack.folders??[])):(game.folders?.contents??[]);
 let folder=folders.find(f=>f.type==='Item'&&['trait','traits'].includes(normalize(f.name)));
 if(!folder)folder=await (globalThis.Folder?.implementation??globalThis.Folder).create({name:'Traits',type:'Item',sorting:'a'},pack?{pack:pack.collection}:{});
 return folder;
}
export async function syncLegacyTraits(pack=null){
 if(!legacyMixedPolishEnabled()||!game.user.isGM)return;
 const folder=await ensureFolder(pack),docs=pack?await pack.getDocuments():game.items.contents;
 const updates=[],missing=[];
 for(const trait of LEGACY_TRAITS){
  const existing=docs.find(d=>d.type==='trait'&&(d.flags?.[NS]?.starterKey===trait.key||normalize(d.name)===normalize(trait.name)));
  if(!existing){missing.push({...suppliedTraitDocument(trait),folder:folder.id,...(!pack?{ownership:{default:CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER??2}}:{})});continue;}
  const update={_id:existing.id};
  if(folderId(existing.folder)!==folder.id)update.folder=folder.id;
  // Only upgrade a known generated placeholder; never replace custom rule text.
  if(existing.system?.description===placeholder&&existing.flags?.[NS]?.starterKey===trait.key)update['system.description']=trait.description;
  if(Object.keys(update).length>1)updates.push(update);
 }
 const Doc=pack?pack.documentClass:(globalThis.Item?.implementation??globalThis.Item),options=pack?{pack:pack.collection}:{};
 if(updates.length)await Doc.updateDocuments(updates,options);
 if(missing.length)await Doc.createDocuments(missing,options);
 return {added:missing.length,updated:updates.length};
}
export function installLegacyTraitsLibrary(){
 Hooks.once('ready',async()=>{
  if(!legacyMixedPolishEnabled()||!game.user.isGM)return;
  const primary=game.users.filter(u=>u.active&&u.isGM).sort((a,b)=>a.id.localeCompare(b.id))[0];if(primary&&primary.id!==game.user.id)return;
  try{await syncLegacyTraits();}catch(error){console.error('Realm Guard | Trait library',error);ui.notifications.warn('Could not prepare the Trait library. See the console.');}
 });
}
