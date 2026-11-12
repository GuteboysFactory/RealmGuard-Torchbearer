import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
const NS='realm-guard',KEY='legacyEndSessionView';
let updateTimer, activeSource=null, publishQueue=Promise.resolve();
export async function publishSessionView(root, active=true){
  if(!game.user?.isGM||!legacyMixedPolishEnabled())return;
  const copy=root?.cloneNode(true);
  if(copy){for(const el of copy.querySelectorAll('input,select,textarea,button'))el.disabled=true;for(const el of root.querySelectorAll('input,select,textarea')){const name=el.name;if(!name)continue;const target=copy.querySelector(`[name="${CSS.escape(name)}"]`);if(!target)continue;if(el.type==='checkbox'||el.type==='radio'){target.checked=el.checked;if(el.checked)target.setAttribute('checked','');else target.removeAttribute('checked');}else if(el.tagName==='SELECT'){for(const opt of target.options)opt.selected=opt.value===el.value;for(const opt of target.options)if(opt.selected)opt.setAttribute('selected','');else opt.removeAttribute('selected');}else if(el.tagName==='TEXTAREA')target.textContent=el.value;else target.setAttribute('value',el.value);}}
  const state={active,html:copy?.outerHTML??'',updatedAt:Date.now()};
  publishQueue=publishQueue.catch(()=>{}).then(()=>game.settings.set(NS,KEY,state));return publishQueue;
}
function render(){
  if(game.user?.isGM)return;
  const s=game.settings.get(NS,KEY);let root=document.getElementById('rg-eos-shared');
  if(!s?.active){root?.remove();return;}
  if(!root){root=document.createElement('section');root.id='rg-eos-shared';root.className='rg-shared-session';root.setAttribute('role','dialog');root.setAttribute('aria-label','End of Session');document.body.append(root);}
  const scroll=root.scrollTop;
  // This HTML is authored only by a world-setting-authorized GM, never by socket payloads.
  root.innerHTML=`<header><h2>End of Session</h2><span>Live review · GM controls awards</span><button type="button" aria-label="Minimize End of Session">−</button></header><div class="rg-shared-content">${s.html}</div>`;
  root.querySelector('header button').onclick=()=>root.classList.toggle('minimized');root.scrollTop=scroll;
}
export function installLegacySessionView(){
  if(!legacyMixedPolishEnabled())return;
  game.settings.register(NS,KEY,{scope:'world',config:false,type:Object,default:{active:false}});
  Hooks.on('renderApplicationV2',(app)=>{
    if(!game.user?.isGM)return;const root=app.element?.querySelector('.rg-end-session');if(!root)return;activeSource=app;
    const publish=()=>{clearTimeout(updateTimer);updateTimer=setTimeout(()=>void publishSessionView(root),150);};
    root.addEventListener('input',publish);root.addEventListener('change',publish);void publishSessionView(root);
  });
  Hooks.on('closeApplicationV2',app=>{if(app===activeSource){clearTimeout(updateTimer);activeSource=null;void publishSessionView(null,false);}});
  Hooks.on('updateSetting',s=>{if(s.key===`${NS}.${KEY}`)render();});Hooks.once('ready',render);
}
