import {legacyMixedPolishEnabled} from './legacy-mixed-scope.mjs';
import {baselineObstacle} from './obstacles.mjs';
import {diceFacesHtml, diceSuccesses} from './dice-ui.mjs';
const esc=v=>foundry.utils.escapeHTML(String(v??''));
let open=false;
let d6Open = false;

function postStandaloneRoll(roll, flags, content) {
  const data = {
    speaker: { actor: null, token: null, scene: null, alias: game.user.name },
    rolls: [roll],
    flags: { "realm-guard": flags },
    content
  };
  (ChatMessage.implementation ?? ChatMessage).applyRollMode?.(data, game.settings.get("core", "rollMode") || "publicroll");
  return ChatMessage.create(data);
}

export async function rollStandaloneD6() {
  if (!legacyMixedPolishEnabled() || d6Open) return;
  d6Open = true;
  try {
    const count = await foundry.applications.api.DialogV2.wait({
      window: { title: "D6s" },
      position: { width: 340 },
      modal: false,
      rejectClose: false,
      content: '<label>Number of d6s <input name="d6Count" type="number" min="1" max="50" step="1" value="1" required></label>',
      buttons: [
        { action: "roll", label: "Roll", default: true, callback: (_event, button) => button.form.elements.d6Count.valueAsNumber },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });
    if (count == null) return;
    if (!Number.isInteger(count) || count < 1 || count > 50) return ui.notifications.warn("Choose a whole number from 1 to 50.");

    const roll = await new Roll(`${count}d6`).evaluate();
    const faces = roll.dice.flatMap(die => die.results.map(result => result.result));
    const passed = diceSuccesses(faces);
    return await postStandaloneRoll(roll, { standaloneD6: true },
      `<div class="realm-guard chat-roll rg-standalone-roll-chat"><h3>D6s · ${count}d6</h3>
      ${diceFacesHtml(faces, { label: "D6 results", openSixes: false })}
      <p><b>Pass</b> ${passed} · <b>Fail</b> ${faces.length - passed}</p></div>`
    );
  } finally {
    d6Open = false;
  }
}

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
 return postStandaloneRoll(roll, {standaloneCustomRoll:true}, `<div class="realm-guard chat-roll rg-standalone-roll-chat"><div class="rg-custom-chat-tag">CUSTOM ROLL</div><h3>${esc(result.label)}</h3><p><b>Pool:</b> ${pool}D</p>${diceFacesHtml(faces)}<p><b>Successes:</b> ${successes} · <b>Obstacle:</b> ${result.obstacle}</p><strong class="rg-roll-outcome ${successes>=result.obstacle?'pass':'fail'}">${successes>=result.obstacle?'PASS':'FAIL'}</strong></div>`);
}
