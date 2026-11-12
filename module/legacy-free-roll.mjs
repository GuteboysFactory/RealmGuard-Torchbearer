import {legacyMixedPolishEnabled} from './legacy-mixed-scope.mjs';
import {baselineObstacle} from './obstacles.mjs';
import {diceFacesHtml} from './dice-ui.mjs';
const esc=v=>foundry.utils.escapeHTML(String(v??''));
let open=false;
export async function openStandaloneCustomRoll(){
 if(!legacyMixedPolishEnabled()||open)return;
 open=true;
 try{return await standaloneDialog();}catch(error){console.error('Realm Guard | Standalone Custom Roll',error);ui.notifications.error(error.message);}finally{open=false;}
}
async function standaloneDialog(){
 const result=await foundry.applications.api.DialogV2.wait({window:{title:'Realm Guard · Custom Roll',resizable:true},position:{width:520},modal:false,rejectClose:false,
  content:`<div class="rg-standalone-custom-roll"><h2>Custom Roll</h2><label>Label<input name="label" value="Custom Roll" maxlength="80"></label><div class="rg-roll-dialog-grid"><label>Base Dice<input name="dice" type="number" min="0" max="30" step="1" value="3"></label><label>Extra Dice<input name="extra" type="number" min="0" max="20" step="1" value="0"></label><label>Obstacle<input name="obstacle" type="number" min="0" max="20" step="1" value="${baselineObstacle()}"></label></div></div>`,
  buttons:[{action:'roll',label:'Roll',default:true,callback:(_e,b)=>({label:String(b.form.elements.label.value).trim().slice(0,80)||'Custom Roll',dice:Number(b.form.elements.dice.value),extra:Number(b.form.elements.extra.value),obstacle:Number(b.form.elements.obstacle.value)})},{action:'cancel',label:'Cancel',callback:()=>null}]});
 if(!result)return;
 if(!Number.isInteger(result.dice)||result.dice<0||result.dice>30||!Number.isInteger(result.extra)||result.extra<0||result.extra>20||!Number.isInteger(result.obstacle)||result.obstacle<0||result.obstacle>20||result.dice+result.extra<1)return ui.notifications.warn('Use whole dice counts and a pool of at least 1D.');
 const pool=result.dice+result.extra,roll=await new Roll(`${pool}d6`).evaluate(),faces=roll.dice.flatMap(d=>d.results.map(r=>r.result)),successes=faces.filter(v=>v>=4).length;
 const data={speaker:{actor:null,token:null,scene:null,alias:game.user.name},rolls:[roll],flags:{'realm-guard':{standaloneCustomRoll:true}},content:`<div class="realm-guard chat-roll rg-standalone-roll-chat"><div class="rg-custom-chat-tag">CUSTOM ROLL</div><h3>${esc(result.label)}</h3><p><b>Pool:</b> ${pool}D</p>${diceFacesHtml(faces)}<p><b>Successes:</b> ${successes} · <b>Obstacle:</b> ${result.obstacle}</p><strong class="rg-roll-outcome ${successes>=result.obstacle?'pass':'fail'}">${successes>=result.obstacle?'PASS':'FAIL'}</strong></div>`};
 (globalThis.ChatMessage?.implementation??ChatMessage).applyRollMode?.(data,game.settings.get('core','rollMode')||'publicroll');
 return ChatMessage.create(data);
}
