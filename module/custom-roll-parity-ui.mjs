import { baselineObstacle } from "./obstacles.mjs";
import { spendTrackedResource } from "./progression.mjs";
import { diceFacesHtml } from "./dice-ui.mjs";
import { observeCustomRollParity } from "./test-parity-service.mjs";

async function customRollWithParity() {
  const esc = foundry.utils.escapeHTML;
  const fate = Number(this.actor.system.resources?.fate?.value ?? 0);
  const persona = Number(this.actor.system.resources?.persona?.value ?? 0);
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Custom Roll · Free Dice Pool", resizable: true }, modal: false, rejectClose: false,
    content: `<div class="rg-free-custom-roll"><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Custom Roll · Free Dice Pool</h2><p>Custom Roll is intentionally freeform. Use the normal Skill or Ability buttons on the sheet whenever standard rules automation and Learning should apply.</p><label>Label<input name="label" value="Improvised Test" maxlength="80"></label><div class="rg-roll-dialog-grid"><label>Base Dice<input type="number" name="dice" min="0" max="30" value="3"></label><label>Obstacle<input type="number" name="obstacle" min="0" max="20" value="${baselineObstacle()}"></label><label>Extra Dice<input type="number" name="extra" min="0" max="20" value="0"></label><label>Persona dice<select name="persona">${[0,1,2,3].filter(n=>n<=persona).map(n=>`<option value="${n}">${n} Persona · +${n}D</option>`).join("")}</select></label></div><p class="rg-custom-roll-warning"><i class="fa-solid fa-circle-info"></i> Free Dice Pool does not infer Conditions, Nature, Help or Learning/Advancement. Set the pool and Obstacle manually for improvised or table-adjudicated tests.</p></div>`,
    buttons: [
      { action: "roll", label: "Roll", icon: "fa-solid fa-dice", default: true, callback: (_e,b) => ({ label: b.form?.elements?.label?.value || "Improvised Test", dice: Math.max(0, Number(b.form?.elements?.dice?.value||0)), obstacle: Math.max(0, Number(b.form?.elements?.obstacle?.value||0)), extra: Math.max(0, Number(b.form?.elements?.extra?.value||0)), persona: Math.max(0, Math.min(3, Number(b.form?.elements?.persona?.value||0))) }) },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!result) return;
  if (result.persona > persona) return ui.notifications.warn("Realm Guard: Not enough Persona.");
  const pool = Math.max(0, result.dice + result.extra + result.persona);
  if (!pool) return ui.notifications.warn("Realm Guard: Custom Roll dice pool is 0.");
  const roll = await new Roll(`${pool}d6`).evaluate();
  const faces = roll.dice.flatMap(d => d.results.map(r => r.result));
  let bonusFaces = [];
  const sixes = faces.filter(v=>v===6).length;
  let spendFate = false;
  if (sixes && fate > 0) {
    spendFate = await this.actor._askFateAfterSixes({ roleName: result.label, sixCount: sixes });
    if (spendFate) { bonusFaces = await this.actor._explodeSixes(faces); await spendTrackedResource(this.actor, "fate", 1, { reason: `Custom Roll · ${result.label}` }); }
  }
  if (result.persona) await spendTrackedResource(this.actor, "persona", result.persona, { reason: `Custom Roll · ${result.label}` });
  const all = faces.concat(bonusFaces);
  const successes = all.filter(v=>v>=4).length;
  const passed = successes >= result.obstacle;
  observeCustomRollParity(this.actor, {
    label: result.label,
    baseDice: result.dice,
    extraDice: result.extra,
    personaDice: result.persona,
    pool,
    target: result.obstacle,
    faces,
    supplementalFaces: bonusFaces,
    successes,
    outcome: passed ? "PASS" : "FAIL",
    margin: Math.abs(successes - result.obstacle),
    fateSpent: spendFate
  });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="realm-guard chat-roll rg-custom-roll-chat"><div class="rg-custom-chat-tag">CUSTOM ROLL · FREE POOL</div><h3>${esc(result.label)}</h3><p><b>Pool:</b> ${pool}D · Base ${result.dice}D${result.extra?` · Extra +${result.extra}D`:""}${result.persona?` · Persona +${result.persona}D`:""}</p><p><b>Roll:</b> ${diceFacesHtml(faces, {label:"Base roll"})}</p>${bonusFaces.length?`<p><b>Fate / Open 6s:</b> ${diceFacesHtml(bonusFaces,{label:"Fate dice"})}</p>`:""}<p><b>Successes:</b> ${successes} · <b>Ob ${result.obstacle}</b></p><div class="rg-result-summary"><span class="rg-result-final"><b>Result</b><strong class="rg-roll-outcome ${passed?"pass":"fail"}">${passed?"PASS":"FAIL"}</strong></span></div><small>No Learning/Advancement is recorded for an unlinked free pool.</small></div>` });
}

Object.defineProperty(customRollWithParity, "_rgM3CustomRollParity", { value: true });

export function installCustomRollParityAction(ActorSheetClass) {
  const actions = ActorSheetClass?.DEFAULT_OPTIONS?.actions;
  if (!actions || typeof actions.customRoll !== "function") return false;
  if (actions.customRoll._rgM3CustomRollParity) return true;
  actions.customRoll = customRollWithParity;
  return true;
}
