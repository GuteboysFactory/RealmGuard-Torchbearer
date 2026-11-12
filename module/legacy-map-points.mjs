import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
export const MAP_ICONS=[['village','Village','by hamlet'],['city','City','stad town'],['ruin','Ruins','ruin ruiner'],['cave','Cave','grotta cavern'],['grave','Graves','grav tomb cemetery'],['cairn','Cairn','stenröse stones'],['castle','Castle','borg fort'],['tower','Tower','torn watchtower'],['camp','Camp','läger campsite'],['bridge','Bridge','bro övergång'],['mine','Mine','gruva'],['temple','Temple','tempel shrine'],['forest','Forest','skog grove'],['mountain','Mountain','berg pass'],['harbour','Harbour','hamn port'],['item','Item / treasure','föremål skatt loot']];
const esc=v=>foundry.utils.escapeHTML(String(v??''));
export const MAP_ITEM_TYPES={gear:'Gear / item',role:'Skill',trait:'Trait',wise:'Wise',condition:'Condition',tokenOfPower:'Token of Power',talent:'Talent'};
export async function createMapPoint(position){
  if(!legacyMixedPolishEnabled()||!game.user?.isGM||!canvas.scene)return;
  const scene=canvas.scene;
  const result=await foundry.applications.api.DialogV2.wait({window:{title:'Create on map',resizable:true},position:{width:620},modal:false,rejectClose:false,
    content:`<div class="rg-map-create"><label>Create<select name="kind"><option value="place">Place / landmark</option><option value="item">Item</option></select></label><label>Item type (when creating an Item)<select name="itemType">${Object.entries(MAP_ITEM_TYPES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Name<input name="name" required maxlength="100"></label><label>Search icons<input type="search" data-map-search placeholder="Village, ruins, cave…"></label><div class="rg-map-icon-grid">${MAP_ICONS.map(([id,label,tags],i)=>`<label data-map-tags="${esc(`${label} ${tags}`.toLowerCase())}"><input type="radio" name="icon" value="${id}" ${i===0?'checked':''}><img src="systems/realm-guard/assets/ui/map-icons/${id}.svg" alt=""><span>${label}</span></label>`).join('')}</div><label>Information<textarea name="description" rows="6"></textarea></label><label><input type="checkbox" name="visible"> Visible to players (unchecked = GM only)</label></div>`,
    render:(_e,d)=>d.element?.querySelector('[data-map-search]')?.addEventListener('input',e=>{for(const el of d.element.querySelectorAll('[data-map-tags]'))el.hidden=!el.dataset.mapTags.includes(e.target.value.trim().toLowerCase());}),
    buttons:[{action:'create',label:'Create on map',callback:(_e,b)=>{if(!b.form.reportValidity())return null;const f=b.form.elements;return {kind:f.kind.value,itemType:f.itemType?.value??'gear',name:f.name.value.trim(),icon:f.icon.value,description:f.description.value,visible:f.visible.checked};}},{action:'cancel',label:'Cancel',callback:()=>null}]});
  if(!result?.name||!game.user.isGM||canvas.scene?.id!==scene.id)return;
  if(!MAP_ICONS.some(([id])=>id===result.icon))return;
  let item=null;
  const ownership={default:result.visible?CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER:CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE};
  // Standard Journal + Note documents retain Foundry's native edit and ownership UI.
  if(result.kind==='item'){const type=result.itemType??'gear';if(!Object.hasOwn(MAP_ITEM_TYPES,type))return;item=await Item.create({name:result.name,type,img:`systems/realm-guard/assets/ui/map-icons/${result.icon}.svg`,ownership,system:{description:result.description}});}
  let journal;
  try{
    journal=await JournalEntry.create({name:result.name,ownership,pages:[{name:result.name,type:'text',text:{format:1,content:`<p>${esc(result.description).replace(/\r?\n/g,'<br>')}</p>${item?`<p>@UUID[${item.uuid}]{${esc(item.name)}}</p>`:''}`}}]});
    await scene.createEmbeddedDocuments('Note',[{entryId:journal.id,x:position.x,y:position.y,text:result.name,texture:{src:`systems/realm-guard/assets/ui/map-icons/${result.icon}.svg`},iconSize:48,global:false}]);
  }catch(error){await journal?.delete();await item?.delete();throw error;}
  ui.notifications.info('Created. Double-click the map note to open its information. Use Configure Ownership on the journal to change player visibility.');
}
