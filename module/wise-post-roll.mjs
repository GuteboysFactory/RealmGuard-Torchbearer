import { hasActiveCondition } from "./conditions.mjs";
import { diceFacesHtml } from "./dice-ui.mjs";

function blankResult(baseFaces) {
  return { faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [], wise: null, wiseName: "", declined: false };
}

function wiseCandidates(actor, preferredWise = null) {
  const all = Array.from(actor?.wises ?? []).filter(wise => wise?.type === "wise");
  if (!preferredWise || preferredWise.type !== "wise") return all;
  return [preferredWise, ...all.filter(wise => wise.id !== preferredWise.id)];
}

async function chooseWiseAfterRoll(actor, baseFaces, failedIndexes, preferredWise = null) {
  if (hasActiveCondition(actor, "Angry")) return null;
  const candidates = wiseCandidates(actor, preferredWise);
  if (!candidates.length || !failedIndexes.length) return null;

  const esc = foundry.utils.escapeHTML;
  const preferredId = preferredWise?.type === "wise" ? preferredWise.id : candidates[0].id;
  const options = candidates.map(wise => `<option value="${esc(wise.id)}" ${wise.id === preferredId ? "selected" : ""}>${esc(wise.name)}</option>`).join("");
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Wise Reroll", resizable: true },
    content: `<div class="realm-guard rg-wise-reroll-decision">
      <h3>Use a Wise?</h3>
      <p>The base roll has ${failedIndexes.length} failed ${failedIndexes.length === 1 ? "die" : "dice"}.</p>
      <div style="margin:8px 0;">${diceFacesHtml(baseFaces)}</div>
      <p>Use a Wise to reroll all failed dice?</p>
      <label>Wise <select name="wiseId">${options}</select></label>
      <p><small>This is the actual Wise-use decision. Any Wise chosen before the roll is only the preferred default here.</small></p>
    </div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      {
        action: "use",
        label: `Reroll ${failedIndexes.length} Failed ${failedIndexes.length === 1 ? "Die" : "Dice"}`,
        icon: "fa-solid fa-rotate",
        default: true,
        callback: (_event, button) => button.form?.elements?.wiseId?.value || preferredId
      },
      { action: "keep", label: "Keep Result", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (!result) return null;
  return candidates.find(wise => wise.id === result) ?? null;
}

export function installWisePostRollPrompt(ActorClass) {
  if (!ActorClass?.prototype || ActorClass.prototype._rgWisePostRollInstalled) return;

  Object.defineProperty(ActorClass.prototype, "_rgWisePostRollInstalled", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });

  ActorClass.prototype._applyWiseReroll = async function(baseFaces, preferredWise = null) {
    const initial = Array.from(baseFaces ?? []).map(value => Number(value));
    const failedIndexes = initial.map((value, index) => value < 4 ? index : -1).filter(index => index >= 0);
    if (!failedIndexes.length) return blankResult(initial);
    if (hasActiveCondition(this, "Angry")) return blankResult(initial);

    const wise = await chooseWiseAfterRoll(this, initial, failedIndexes, preferredWise);
    if (!wise) return { ...blankResult(initial), declined: true };

    const reroll = await new Roll(`${failedIndexes.length}d6`).evaluate();
    const rerollFaces = reroll.dice.flatMap(die => die.results.map(result => result.result));
    const faces = [...initial];
    failedIndexes.forEach((index, n) => { faces[index] = rerollFaces[n]; });
    return { faces, rerollFaces, rerolledIndexes: failedIndexes, wise, wiseName: wise.name, declined: false };
  };
}
