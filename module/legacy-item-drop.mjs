import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { placeGearInZone,placeGearInContainer } from './inventory.mjs';
const NS='realm-guard',bound=new WeakSet(),types=new Set(['role','trait','wise','gear','condition','talent','tokenOfPower']);
const fold=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc=v=>foundry.utils.escapeHTML(String(v??''));
const folders={role:['skill','skills','quickskills','quick skills','fardighet','fardigheter','roles'],trait:['trait','traits','sardrag'],wise:['wise','wises','visdom','visdomar'],talent:['talent','talents','talanger'],condition:['condition','conditions','tillstand'],tokenOfPower:['tokens of power','token of power','relics','reliker'],weapon:['weapon','weapons','vapen'],armor:['armor','armour','rustning','rustningar'],container:['containers','container','packs','backpacks','behallare'],gear:['gear','equipment','items','utrustning','foremal']};
export function sourceFolderNames(item){
  const names=[],seen=new Set();let folder=typeof item.folder==='string'?game.folders?.get(item.folder):item.folder;
  while(folder&&!seen.has(folder.id??folder)){seen.add(folder.id??folder);names.push(folder.name);folder=typeof folder.folder==='string'?game.folders?.get(folder.folder):folder.folder??folder.parent;}
  return names.filter(Boolean);
}
export function folderDropKind(names=[]){for(const name of names){const normalized=fold(name);for(const [kind,aliases]of Object.entries(folders))if(aliases.includes(normalized))return {type:['weapon','armor','container'].includes(kind)?'gear':kind,category:['weapon','armor','container'].includes(kind)?kind:''};}return null;}
export function resolveDropKind(item,{type=null,category=''}={}){
  const fromFolder=folderDropKind(sourceFolderNames(item));
  const native=types.has(item.type)?item.type:'gear';
  const result={type:type??fromFolder?.type??native,category:''};
  if(result.type==='gear')result.category=category||fromFolder?.category||item.getFlag?.(NS,'gearCategory')||(['sword','svard'].includes(fold(item.name))?'weapon':'gear');
  return result;
}
function decorate(root){
  for(const [action,type]of Object.entries({createRole:'role',createWise:'wise',createTrait:'trait',createGear:'gear',createCondition:'condition',addDefaultConditions:'condition',createTalent:'talent',createTokenOfPower:'tokenOfPower'}))for(const button of root.querySelectorAll(`[data-action="${action}"]`)){const panel=button.closest('.rg-panel,.rg-talent-panel');if(panel)panel.dataset.rgDropType=type;}
  for(const panel of root.querySelectorAll('.rg-npc-skills,.rg-roles'))panel.dataset.rgDropType='role';
  for(const panel of root.querySelectorAll('[data-rg-inventory-zone],[data-rg-inventory-container],[data-rg-inventory-unassigned],.rg-unassigned-panel,.rg-workspace-gear-list'))panel.dataset.rgDropType='gear';
  for(const row of root.querySelectorAll('[data-item-id]')){const id=row.dataset.itemId;const actor=root._rgDropSheet?.actor;const item=actor?.items.get(id);const category=item?.getFlag?.(NS,'gearCategory');if(item?.type==='gear'&&category){row.dataset.rgGearCategory=category;if(!row.querySelector('.rg-gear-category')){const tag=document.createElement('small');tag.className='rg-gear-category';tag.textContent=({weapon:'Weapon',armor:'Armor',container:'Container'})[category]??'Gear';row.append(tag);}}}
}
async function ratingFor(sheet,item,existing){
  const max=6,source=Number(item.system?.rating),current=Number(existing?.system?.rating??0);
  if(sheet.actor.type!=='npc'&&Number.isFinite(source))return Math.max(0,Math.min(max,source));
  return foundry.applications.api.DialogV2.wait({window:{title:'Set Skill rating'},content:`<p>${esc(item.name)} · ${sheet.actor.type==='npc'?'Quick Skills':'Skills'}</p><label>Rating<input name="rating" type="number" min="${sheet.actor.type==='npc'?1:0}" max="6" step="1" value="${current>0?current:source>0?Math.min(max,source):2}"></label>`,modal:false,rejectClose:false,buttons:[{action:'save',label:'Add / update Skill',callback:(_e,b)=>Number(b.form.elements.rating.value)},{action:'cancel',label:'Cancel',callback:()=>null}]});
}
export async function importSheetItem(sheet,item,target=null){
  if(!legacyMixedPolishEnabled()||!sheet.isEditable||!sheet.actor.isOwner)return null;
  const panel=target?.closest?.('[data-rg-drop-type]'),zone=target?.closest?.('[data-rg-inventory-zone]'),container=target?.closest?.('[data-rg-inventory-container]');
  const kind=resolveDropKind(item,{type:panel?.dataset.rgDropType??null,category:panel?.dataset.rgDropCategory??''});
  const data=foundry.utils.deepClone(item.toObject());const originalType=data.type;delete data._id;delete data.id;delete data.folder;delete data.pack;delete data.ownership;delete data._stats;
  data.type=kind.type;data.flags??={};data.flags[NS]??={};data.system??={};
  if(originalType!==kind.type){data.flags[NS].importOriginal={type:originalType,system:foundry.utils.deepClone(data.system)};const description=data.system.description??'';data.system={description};}
  data.flags[NS].importRouting={sourceUuid:item.uuid??'',sourceFolders:sourceFolderNames(item),type:kind.type};
  if(kind.type==='gear'){data.flags[NS].gearCategory=kind.category;data.system.inventory={...data.system.inventory,mode:'unassigned',location:'',containerId:''};}
  const duplicate=sheet.actor.items.find(i=>i.type===kind.type&&fold(i.name)===fold(item.name));
  if(kind.type==='role'){
    const rating=await ratingFor(sheet,item,duplicate);if(rating===null)return null;if(!Number.isInteger(rating)||rating<(sheet.actor.type==='npc'?1:0)||rating>6)return ui.notifications.warn('Enter a valid whole Skill rating.');
    data.system.rating=rating;
    if(duplicate){if(Number(duplicate.system.rating??0)>0&&sheet.actor.type!=='npc'){ui.notifications.info('This Skill already exists; its progression and rating were retained.');return duplicate;}const update={'system.rating':rating,'flags.realm-guard.importRouting':data.flags[NS].importRouting};if(!duplicate.system.description&&data.system.description)update['system.description']=data.system.description;await duplicate.update(update);await sheet.render({force:true});return duplicate;}
  }else if(duplicate){const choice=await foundry.applications.api.DialogV2.confirm({window:{title:'Item already exists'},content:`<p>${esc(item.name)} already exists on this character. Add a separate copy?</p>`,modal:false});if(!choice)return duplicate;}
  if(!sheet.isEditable||!sheet.actor.isOwner)return null;
  const [created]=await sheet.actor.createEmbeddedDocuments('Item',[data]);if(!created)return null;
  if(kind.type==='gear'&&(zone||container)){
    const result=zone?await placeGearInZone(sheet.actor,created.id,zone.dataset.rgInventoryZone):await placeGearInContainer(sheet.actor,created.id,container.dataset.rgInventoryContainer);
    if(!result?.ok){await sheet.actor.deleteEmbeddedDocuments('Item',[created.id]);ui.notifications.warn(result?.reason??'Item cannot be placed here.');return null;}
  }
  await sheet.render({force:true});return created;
}
export function installLegacyItemDrops(sheet){
  if(!legacyMixedPolishEnabled()||!sheet.element)return false;
  const root=sheet.element;root._rgDropSheet=sheet;decorate(root);if(bound.has(root))return true;bound.add(root);
  root.addEventListener('dragover',event=>{if(sheet.isEditable&&event.dataTransfer?.types?.includes('text/plain'))event.preventDefault();},true);
  root.addEventListener('drop',async event=>{
    let data;try{const editor=globalThis.foundry?.applications?.ux?.TextEditor?.implementation??globalThis.TextEditor;data=editor?.getDragEventData?.(event)??JSON.parse(event.dataTransfer?.getData('text/plain')||'{}');}catch{return;}
    if(data?.type!=='Item')return;event.preventDefault();event.stopImmediatePropagation();if(sheet._rgImportBusy||!sheet.isEditable||!sheet.actor.isOwner)return;sheet._rgImportBusy=true;
    try{const impl=Item.implementation??Item;const item=impl.fromDropData?await impl.fromDropData(data):data.uuid?await fromUuid(data.uuid):null;if(!item)return;await importSheetItem(sheet,item,event.target);}catch(error){console.error('Realm Guard | Item import',error);ui.notifications.error(error.message);}finally{sheet._rgImportBusy=false;}
  },true);return true;
}
