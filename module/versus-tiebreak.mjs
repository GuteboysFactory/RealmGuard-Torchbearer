import { diceFacesHtml } from "./dice-ui.mjs";
import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { installTurnAuthorityBridge, requestTurnAuthority } from "./turn-authority-bridge.mjs";

const NS = "realm-guard";
const OPERATION = "VERSUS_TIEBREAK";
const FLAG = `flags.${NS}.versusTie`;
const TOME = "adventurers-tome";
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const label = key => key.charAt(0).toUpperCase() + key.slice(1);
let queue = Promise.resolve();

export function versusTieState(actor, source, opponent, opposition) {
  if (!legacyMixedPolishEnabled() || !actor?.uuid || !opponent?.uuid || actor.uuid === opponent.uuid) return null;
  const side = (participant, test) => ({
    ref: participant.uuid,
    name: participant.name,
    source: test?.name ?? "",
    options: test?.name ? actor._tiebreakOptions(test.name, test.kind) : ["health", "will", "nature"],
    ability: null,
    roll: null
  });
  return { sides: [side(actor, source), side(opponent, opposition)], winner: null, needsGM: false };
}

function canAct(actor, user) {
  if (!actor || !user) return false;
  if (user.isGM) return !actor.hasPlayerOwner;
  return actor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
}

function tieOf(message) {
  const flags = message?.flags?.[NS];
  return flags?.rollUndo?.undone ? null : flags?.versusTie;
}

const diceTable = () => game.modules?.get(TOME)?.api?.diceTable;

async function presentTiebreakRoll(message, state) {
  const api = diceTable();
  if (!api?.flag || typeof api.prepareChatStage !== "function" || typeof api.isStageActive !== "function"
    || typeof api.waitForStage !== "function") return false;
  const dice = state.sides.flatMap(side => side.roll.faces.map(value => ({faces: 6, value})));
  let stage;
  try {
    stage = api.prepareChatStage(dice, {
      whisper: message.whisper ?? [], blind: message.blind, sceneId: message.speaker?.scene || undefined
    });
  } catch (error) {
    console.warn("Realm Guard | Tome tiebreaker presentation unavailable.", error);
    return false;
  }
  if (!stage) return false;

  const marker = `<div data-rg-tiebreak-stage data-at-dice-stage="${esc(stage.key)}">Rolling tiebreaker…</div>`;
  const stageFlag = `flags.${TOME}.${api.flag}`;
  await message.update({[FLAG]: {...state, presentation: stage.key}, [stageFlag]: stage, content: message.content + marker});
  try {
    await api.waitForStage(stage);
  } catch (error) {
    console.warn("Realm Guard | Tome tiebreaker presentation interrupted.", error);
  } finally {
    const current = game.messages.get(message.id);
    if (tieOf(current)?.presentation === stage.key) {
      const cleaned = current.content.replace(marker, "");
      await current.update({[FLAG]: {...state, presentation: null}, [`flags.${TOME}.-=${api.flag}`]: null, content: cleaned});
    }
  }
  return true;
}

async function commitChoice({messageId, side: index, action, ability}, requester) {
  const message = game.messages.get(messageId);
  const original = tieOf(message);
  if (!legacyMixedPolishEnabled() || !original || original.winner !== null || ![0, 1].includes(index)) {
    return {ok:false, reason:"This tiebreaker is no longer available."};
  }
  const author = message.author?.id ?? message.user?.id ?? message.user;
  if (!requester || (message.whisper?.length && !requester.isGM
    && author !== requester.id && !message.whisper.includes(requester.id))) {
    return {ok:false, reason:"You cannot act on this tiebreaker."};
  }
  const state = foundry.utils.deepClone(original);
  const side = state.sides[index];
  const actor = await fromUuid(side.ref);
  if (action === "decide") {
    if (!requester.isGM || !state.needsGM) return {ok:false, reason:"Only the GM can decide a second tie."};
    state.winner = index;
    state.needsGM = false;
  } else {
    if (!canAct(actor, requester)) return {ok:false, reason:"You do not control this character."};
    if (action === "confirm" && !side.ability && side.options.includes(ability)) {
      const pool = actor._abilityPool(actor, ability);
      if (!pool || pool.dice < 1) return {ok:false, reason:"This ability needs at least 1D."};
      side.ability = ability;
    } else if (action === "roll" && state.sides.every(entry => entry.ability) && !side.roll) {
      const pool = actor._abilityPool(actor, side.ability);
      if (!pool || pool.dice < 1) return {ok:false, reason:"This ability needs at least 1D."};
      const roll = await new Roll(`${pool.dice}d6`).evaluate();
      const faces = roll.dice.flatMap(die => die.results.map(result => result.result));
      side.roll = {faces, successes: faces.filter(face => face >= 4).length};
      if (state.sides.every(entry => entry.roll)) {
        const [own, other] = state.sides.map(entry => entry.roll.successes);
        const opponent = await fromUuid(state.sides[1].ref);
        const initiator = await fromUuid(state.sides[0].ref);
        if (own !== other) state.winner = own > other ? 0 : 1;
        else if (initiator?.hasPlayerOwner !== opponent?.hasPlayerOwner) state.winner = initiator?.hasPlayerOwner ? 1 : 0;
        else state.needsGM = true;
      }
    } else return {ok:false, reason:"This step was already taken or is not ready."};
  }
  if (tieOf(game.messages.get(messageId)) !== original) return {ok:false,reason:"The original result changed. Reopen the chat card."};
  if (action === "roll" && state.sides.every(entry => entry.roll) && await presentTiebreakRoll(message, state)) return {ok:true};
  await message.update({[FLAG]:state});
  return {ok:true};
}

function renderTie(message, html) {
  const state = tieOf(message);
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!state || !root || message.visible === false || message.isContentVisible === false || !legacyMixedPolishEnabled()) return;
  root.querySelector(".rg-versus-tiebreak")?.remove();
  if (diceTable()?.isStageActive?.(message, state.presentation)) return;
  root.querySelector("[data-rg-tiebreak-stage]")?.remove();
  const bothReady = state.sides.every(side => side.ability);
  const bothRolled = state.sides.every(side => side.roll);
  const panel = document.createElement("section");
  panel.className = "realm-guard rg-versus-tiebreak";
  panel.innerHTML = `<h4>Versus tiebreaker</h4>${state.sides.map((side, index) => {
    const controls = state.winner === null && !state.needsGM && canAct(fromUuidSync(side.ref), game.user);
    const source = side.source ? ` · ${esc(side.source)}` : "";
    const choices = side.options.length === 1
      ? `<input type="hidden" data-tie-ability value="${esc(side.options[0])}">`
      : `<select aria-label="${esc(side.name)} tiebreaker ability" data-rg-native-select="true" data-tie-ability>${side.options.map(key =>
        `<option value="${esc(key)}">${esc(label(key))}</option>`).join("")}</select>`;
    const button = (action, text) => `<button type="button" data-versus-tie-action="${action}" data-tie-side="${index}">${esc(text)}</button>`;
    const waiting = bothReady ? "Ready to roll" : "Waiting for ability confirmation";
    const detail = side.roll
      ? (bothRolled ? `${diceFacesHtml(side.roll.faces)} <b>${side.roll.successes} successes</b>` : "Rolled")
      : side.ability ? `${esc(label(side.ability))} · ${waiting}` : (controls ? choices : "Waiting for ability choice");
    const action = !controls || side.roll ? "" : !side.ability
      ? button("confirm", `${side.name} · Confirm ${side.options.length === 1 ? label(side.options[0]) : "ability"}`)
      : bothReady ? button("roll", `${side.name} · Roll ${label(side.ability)}`) : "";
    return `<div class="rg-versus-tiebreak-side"><b>${esc(side.name)}${source}</b><div>${detail}</div>${action}</div>`;
  }).join("")}`;
  if (state.winner !== null) {
    const margin = Math.abs(state.sides[0].roll.successes - state.sides[1].roll.successes);
    panel.insertAdjacentHTML("beforeend", `<strong>${esc(state.sides[state.winner].name)} wins${margin ? ` · margin ${margin}` : " · second tie"}</strong>`);
    const summary = root.querySelector(".rg-roll-outcome.tie");
    if (summary) {
      summary.textContent = state.winner === 0 ? "PASS" : "FAIL";
      summary.classList.remove("tie");
      summary.classList.add(state.winner === 0 ? "pass" : "fail");
      const detail = summary.parentElement.querySelector(".rg-result-margin");
      if (detail) detail.textContent = `${state.sides[state.winner].name} wins the tiebreaker`;
    }
  } else if (state.needsGM) {
    panel.insertAdjacentHTML("beforeend", `<p>Second tie · GM decides</p>${game.user.isGM ? state.sides.map((side, index) =>
      `<button type="button" data-versus-tie-action="decide" data-tie-side="${index}">${esc(side.name)} wins</button>`).join("") : ""}`);
  } else if (state.sides.some(side => side.roll)) {
    panel.insertAdjacentHTML("beforeend", `<p>Waiting for ${esc(state.sides.find(side => !side.roll).name)} to roll.</p>`);
  }
  panel.addEventListener("click", async event => {
    const button = event.target.closest("[data-versus-tie-action]");
    if (!button || button.disabled) return;
    button.disabled = true;
    try {
      const reply = await requestTurnAuthority(OPERATION, {
        messageId: message.id,
        action: button.dataset.versusTieAction,
        side: Number(button.dataset.tieSide),
        ability: button.closest(".rg-versus-tiebreak-side")?.querySelector("[data-tie-ability]")?.value
      }, {primaryOnly:true});
      if (!reply.ok) ui.notifications.warn(reply.reason);
    } catch (error) {
      ui.notifications.error(error.message);
    } finally {
      button.disabled = false;
    }
  });
  const result = root.querySelector(".rg-compact-roll-card > .rg-roll-card-result");
  if (result) result.before(panel);
  else (root.querySelector(".rg-chat-roll-pipeline") ?? root).append(panel);
}

export function installVersusTiebreak() {
  installTurnAuthorityBridge({
    [OPERATION]: (payload, {requester}) => {
      const task = queue.then(() => commitChoice(payload, requester));
      queue = task.catch(() => {});
      return task;
    }
  });
  Hooks.on("renderChatMessageHTML", renderTie);
  Hooks.on("adventurersTomeDiceComplete", (message, key) => {
    if (tieOf(message)?.presentation === key) ui.chat?.updateMessage?.(message);
  });
}
