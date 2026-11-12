import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
const NS='realm-guard',key='legacyConflictSetupPreview';let active=null,queue=Promise.resolve(),dismissed=null;
export function beginConflictSetupPreview(){active=foundry.utils.randomID();return active;}
export function publishConflictSetupPreview(root,id){
  if(!legacyMixedPolishEnabled()||!game.user.isGM||active!==id)return;
  const copy=root.cloneNode(true);
  for(const node of copy.querySelectorAll('input')){if(node.matches('[type="search"]'))node.value='';node.setAttribute('value',node.value);node.toggleAttribute('checked',node.checked);}
  for(const select of copy.querySelectorAll('select'))for(const option of select.options)option.toggleAttribute('selected',option.selected);
  for(const area of copy.querySelectorAll('textarea'))area.textContent=area.value;
  for(const results of copy.querySelectorAll('[data-roster-results]'))results.replaceChildren();
  const value=JSON.stringify({id,html:copy.outerHTML});
  queue=queue.catch(()=>{}).then(()=>game.settings.set(NS,key,value));
}
export async function closeConflictSetupPreview(id){if(active!==id)return;active=null;queue=queue.catch(()=>{}).then(()=>game.settings.set(NS,key,''));await queue;}
export function renderConflictSetupPreview(){
  const old=document.getElementById('rg-shared-conflict-setup');
  if(game.user.isGM||!legacyMixedPolishEnabled()){old?.remove();return;}
  let data;try{data=JSON.parse(game.settings.get(NS,key)||'null');}catch{}
  if(!data){old?.remove();dismissed=null;return;}
  if(dismissed===data.id)return;
  const root=old??document.createElement('section');root.id='rg-shared-conflict-setup';root.className='rg-shared-session';
  root.innerHTML='<header><h2>Start Conflict · GM setup</h2><button type="button" data-close-setup>×</button></header><p>The GM is preparing the conflict. These choices update live.</p><div class="rg-shared-content"></div>';
  const content=root.querySelector('.rg-shared-content');
  // Only the GM writes this setting. Parse and strip active elements even when
  // a third-party module has decorated the GM's setup form.
  const parsed=new DOMParser().parseFromString(data.html,'text/html');
  parsed.querySelectorAll('script,style,iframe,object,embed,link').forEach(e=>e.remove());
  for(const element of parsed.body.querySelectorAll('*'))for(const attr of [...element.attributes])if(attr.name.startsWith('on')||attr.name==='srcdoc')element.removeAttribute(attr.name);
  content.replaceChildren(...parsed.body.childNodes);content.querySelectorAll('input,select,textarea,button').forEach(e=>e.disabled=true);
  root.querySelector('[data-close-setup]').onclick=()=>{dismissed=data.id;root.remove();};
  if(!old)document.body.append(root);
}
export function installLegacyConflictSetupView(){
  game.settings.register(NS,key,{scope:'world',config:false,type:String,default:''});
  Hooks.on('updateSetting',setting=>{if(setting.key===`${NS}.${key}`)renderConflictSetupPreview();});
  Hooks.once('ready',()=>{if(game.user.isGM&&game.users.filter(u=>u.isGM&&u.active).sort((a,b)=>a.id.localeCompare(b.id))[0]?.id===game.user.id)void game.settings.set(NS,key,'');else renderConflictSetupPreview();});
}
