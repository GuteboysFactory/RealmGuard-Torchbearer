import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { registerGmDockTool } from './gm-dock.mjs';
const NS='realm-guard', KEY='legacyBreak', CHANNEL=`system.${NS}`;
const esc=v=>foundry.utils.escapeHTML(String(v??''));
let ticker=null, heard=new Set(), queue=Promise.resolve();
export function parseBreakTime(text) {
  const match=String(text).trim().match(/^(\d{1,4})(?::([0-5]\d))?$/);
  const seconds=match?Number(match[1])*60+Number(match[2]??0):NaN;
  return Number.isSafeInteger(seconds)&&seconds>0&&seconds<=86400?seconds:null;
}
export function formatBreakTime(seconds) { const n=Math.max(0,Math.ceil(seconds));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; }
async function tone(key, ending=false) {
  if(heard.has(key))return;heard.add(key);
  try {
    const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)return;
    const audio=new Audio();await audio.resume();
    for(const [i,f] of (ending?[523.25,659.25,783.99]:[659.25,783.99]).entries()){
      const osc=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+i*.18;
      osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.075,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.3);
      osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(start+.32);
    }
    setTimeout(()=>void audio.close(),1200);
  }catch(error){console.debug('Realm Guard | Sound requires an audio-enabled browser',error);}
}
function state(){return game.settings.get(NS,KEY)??{};}
export function breakParticipants(s=state()){
  const ids=[...new Set([...(s.userIds??[]),...game.users.filter(u=>u.active).map(u=>u.id)])];
  return ids.map(id=>{
    const user=game.users.get(id);if(!user)return null;
    const actor=user.character??(!user.isGM?game.actors.find(a=>a.type==='character'&&a.testUserPermission(user,CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)):null);
    return {userId:id,actorId:actor?.id??null,name:actor?.name??user.name,img:actor?.img??'',playerName:user.name};
  }).filter(Boolean);
}
function primary(){return game.user?.isGM&&game.users.filter(u=>u.isGM&&u.active).sort((a,b)=>a.id.localeCompare(b.id))[0]?.id===game.user.id;}
export async function handleBreakIntent(message) {
  if(message?.type!=='legacy-break-return'||!primary())return;
  queue=queue.catch(()=>{}).then(async()=>{
    const s=state(), user=game.users.get(message.userId);
    if(!s.active||s.id!==message.id||!breakParticipants(s).some(p=>p.userId===user?.id)||s.returned?.[user.id])return;
    await game.settings.set(NS,KEY,{...s,userIds:[...new Set([...(s.userIds??[]),user.id])],returned:{...s.returned,[user.id]:Date.now()}});
  });return queue;
}
export function renderBreak() {
  const s=state();let root=document.getElementById('rg-break');
  if(!s.active){root?.remove();clearInterval(ticker);ticker=null;return;}
  if(!root){root=document.createElement('section');root.id='rg-break';root.setAttribute('role','dialog');root.setAttribute('aria-label','Session break');document.body.append(root);}
  const seconds=Math.max(0,(s.endsAt-Date.now())/1000);
  root.innerHTML=`<header><span>REALM GUARD · BREAK</span>${game.user.isGM?'<button type="button" data-break-close aria-label="Close break">×</button>':''}</header><h2>Time to recharge</h2><div class="rg-break-clock" role="timer">${formatBreakTime(seconds)}</div><p>Click your character below when you are back.</p><ul>${breakParticipants(s).map(p=>{const back=s.returned?.[p.userId];return `<li class="${back?'is-back':''}" data-break-character="${esc(p.actorId??'')}"><button type="button" class="rg-break-character" data-return="${esc(p.userId)}" ${p.userId!==game.user.id||back?'disabled':''} aria-label="${esc(p.name)} · ${back?'Back':'I am back'}">${p.img?`<img src="${esc(p.img)}" alt="">`:'<span class="rg-break-avatar"><i class="fa-solid fa-user"></i></span>'}<span class="rg-break-person"><strong>${esc(p.name)}</strong><small>${esc(p.playerName)}</small></span><b>${back?'✓ Back':'I am back'}</b></button></li>`;}).join('')}</ul>${game.user.isGM?'<button type="button" data-break-edit>Change timer</button>':''}`;
  root.querySelector('[data-break-close]')?.addEventListener('click',()=>void game.settings.set(NS,KEY,{...state(),active:false}));
  root.querySelector('[data-break-edit]')?.addEventListener('click',()=>void openBreak());
  root.querySelector(`[data-return="${game.user.id}"]`)?.addEventListener('click',async()=>{const msg={type:'legacy-break-return',id:s.id,userId:game.user.id};if(primary())await handleBreakIntent(msg);else game.socket.emit(CHANNEL,msg);});
  for(const [id,stamp] of Object.entries(s.returned??{}))void tone(`${s.id}:return:${id}:${stamp}`);
  if(!ticker)ticker=setInterval(()=>{const current=state();const left=Math.max(0,(current.endsAt-Date.now())/1000);const clock=document.querySelector('#rg-break .rg-break-clock');if(clock)clock.textContent=formatBreakTime(left);if(current.active&&left===0)void tone(`${current.id}:end`,true);},250);
}
export async function openBreak(){
  if(!game.user?.isGM)return;
  const value=await foundry.applications.api.DialogV2.wait({window:{title:'Session break'},content:'<label>Duration (minutes:seconds)<input name="duration" value="10:00" placeholder="10:00" required></label>',modal:false,rejectClose:false,buttons:[{action:'start',label:'Start break',callback:(_e,b)=>b.form.elements.duration.value},{action:'cancel',label:'Cancel',callback:()=>null}]});
  if(value===null)return;const duration=parseBreakTime(value);if(!duration)return ui.notifications.warn('Enter a time from 0:01 to 1440:00.');
  const s={id:foundry.utils.randomID(),active:true,endsAt:Date.now()+duration*1000,userIds:game.users.filter(u=>u.active).map(u=>u.id),returned:{}};
  await game.settings.set(NS,KEY,s);
}
export function installLegacyBreak(){
  if(!legacyMixedPolishEnabled())return;
  game.settings.register(NS,KEY,{scope:'world',config:false,type:Object,default:{}});
  registerGmDockTool({id:'break',icon:'fa-solid fa-mug-hot',tooltip:'Session break',order:11,onClick:openBreak});
  Hooks.on('updateSetting',setting=>{if(setting.key!==`${NS}.${KEY}`)return;const s=state();if(s.active)void tone(`${s.id}:start`);renderBreak();});
  Hooks.once('ready',()=>{game.socket.on(CHANNEL,handleBreakIntent);const s=state();if(s.id){heard.add(`${s.id}:start`);for(const [id,stamp]of Object.entries(s.returned??{}))heard.add(`${s.id}:return:${id}:${stamp}`);}renderBreak();});
  Hooks.on('updateUser',()=>{if(state().active)renderBreak();});
  Hooks.on('updateActor',()=>{if(state().active)renderBreak();});
}
