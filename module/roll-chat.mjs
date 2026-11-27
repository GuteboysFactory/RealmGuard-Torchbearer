import { registerRollMessage } from './roll-undo.mjs';
import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { diceFacesHtml } from "./dice-ui.mjs";
import { compactStoredRollCards } from "./roll-card.mjs";

const pending = new Map();
const active = new Map();
const actorRolls = new Set();
const spendQueues = new Map();
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const TOME_ID = "adventurers-tome";

function prepareDiceStage(faces) {
  if (!faces.length) return null;
  const api = game.modules?.get(TOME_ID)?.api?.diceTable;
  if (!api?.flag || typeof api.prepareChatStage !== "function" || typeof api.waitForStage !== "function") return null;
  try {
    const timing = api.prepareChatStage(faces.map(value => ({faces: 6, value})));
    return timing ? {flag: api.flag, timing, wait: () => api.waitForStage(timing)} : null;
  } catch (error) {
    console.warn("Realm Guard | Tome dice presentation unavailable.", error);
    return null;
  }
}

function diceStageHtml(stage, content) {
  return stage ? `<div data-at-dice-stage="${esc(stage.timing.key)}">${content}</div>` : content;
}

async function waitForDiceStage(stage) {
  try {
    await stage.wait();
  } catch (error) {
    console.warn("Realm Guard | Tome dice presentation interrupted.", error);
  }
}

export function claimActorRoll(actor) {
  const key = actor.uuid || actor.id;
  if (actorRolls.has(key)) return false;
  actorRolls.add(key); return true;
}
export function releaseActorRoll(actor) { actorRolls.delete(actor.uuid || actor.id); }
export async function spendRollResource(actor, kind, amount, options = {}) {
  if (!amount) return;
  const key = actor.uuid || actor.id;
  const previous = spendQueues.get(key) ?? Promise.resolve();
  const task = previous.catch(() => {}).then(async () => {
    if (!Number.isInteger(amount) || amount < 0 || Number(actor.system?.resources?.[kind]?.value ?? 0) < amount) throw new Error(`Not enough ${kind} remains for this roll.`);
    const result = await actor.spendTrackedResource(kind, amount, options);
    if (result?.ok === false) throw new Error(result.reason || `Could not spend ${kind}.`);
    return result;
  });
  spendQueues.set(key, task);
  try { return await task; } finally { if (spendQueues.get(key) === task) spendQueues.delete(key); }
}

export async function beginRollChat(actor, label, faces) {
  const initial = [...faces];
  const history = [];
  let current = [...faces];
  const initialHtml = stage => `<section class="rg-first-roll"><b>First roll · ${esc(label)}</b>${diceStageHtml(stage, `${diceFacesHtml(initial)}<span>${initial.filter(face => face >= 4).length} initial successes</span>`)}</section>`;
  const historyHtml = () => history.length ? `<ul class="rg-roll-decisions" aria-label="Selected roll options">${history.map(row => `<li>${esc(row)}</li>`).join("")}</ul>` : "";
  const firstStage = prepareDiceStage(initial);
  const message = await ChatMessage.create({ speaker: actor.temporaryOpposition ? { alias: actor.name } : ChatMessage.getSpeaker({ actor }), content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml(firstStage)}<p>Resolving roll…</p></div>`, flags: { "realm-guard": { rollDecisionPending: true },
    ...(firstStage ? {[TOME_ID]: {[firstStage.flag]: firstStage.timing}} : {}) } });
  registerRollMessage(actor,message);
  const context = {
    message,
    async show(faces) { current = [...faces]; },
    async animate(label, faces) {
      const stage = prepareDiceStage(faces);
      if (!stage) return;
      await message.update({
        content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml()}${historyHtml()}<section class="rg-roll-current"><b>${esc(label)}</b>${diceStageHtml(stage, diceFacesHtml(faces))}</section></div>`,
        [`flags.${TOME_ID}.${stage.flag}`]: stage.timing
      });
      await waitForDiceStage(stage);
    },
    async ask(question, choices, { skip = null } = {}) {
      if (pending.has(message.id)) throw new Error("A roll question is already pending.");
      const nonce = foundry.utils.randomID();
      let answer;
      const result = new Promise(resolve => { answer = resolve; });
      pending.set(message.id, { actor, userId: game.user.id, nonce, choices, skip, answer });
      const buttons = choices.map((choice, index) => `<button type="button" data-rg-chat-choice="${index}" data-message-id="${message.id}" data-decision-nonce="${nonce}">${esc(choice.label)}</button>`).join("");
      try {
        await message.update({ content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml()}${historyHtml()}<div class="rg-roll-current"><b>Current dice</b>${diceFacesHtml(current)}</div><section class="rg-chat-question" role="status"><span class="rg-decision-alert">Your choice is required</span><strong>${esc(question)}</strong><div class="rg-chat-question-buttons">${buttons}<button type="button" class="rg-chat-skip" data-rg-chat-choice="skip" data-message-id="${message.id}" data-decision-nonce="${nonce}" title="Decline · keep current dice" aria-label="Decline this option">×</button></div></section></div>` });
      } catch (error) { pending.delete(message.id); throw error; }
      const choice = await result;
      if (choice?.label) history.push(choice.label);
      await message.update({ content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml()}${historyHtml()}<p>Resolving roll…</p></div>` });
      return choice ? choice.value : null;
    },
    async finish(content, {versusTie = null, testSource = null, includeInitialRoll = true, directedVersus = null} = {}) {
      pending.delete(message.id); active.delete(message.id);
      const finished = typeof content === "function" ? content(historyHtml()) : `${includeInitialRoll ? initialHtml() : ""}${historyHtml()}${content}`;
      return message.update({ content: `<div class="realm-guard rg-chat-roll-pipeline">${finished}</div>`, "flags.realm-guard.rollDecisionPending": false,
        ...(versusTie ? {"flags.realm-guard.versusTie":versusTie} : {}),
        ...(directedVersus ? {"flags.realm-guard.challenge":{
          ...directedVersus, label, versus: true, actorId: actor.id, actorUuid: actor.uuid,
          source: testSource
        }} : {}),
        ...(testSource ? {"flags.realm-guard.testSource":{...testSource,actorUuid:actor.uuid??null}} : {}) });
    },
    async interrupt() {
      pending.get(message.id)?.answer(null); pending.delete(message.id); active.delete(message.id);
      return message.update({ content: `<div class="realm-guard">${initialHtml()}${historyHtml()}<p>Roll interrupted. Check already spent resources before retrying.</p></div>`, "flags.realm-guard.rollDecisionPending": false });
    }
  };
  active.set(message.id, context);
  if (firstStage) await waitForDiceStage(firstStage);
  return context;
}

export function resolveRollChatChoice(messageId, nonce, choiceId, user = game.user) {
  const row = pending.get(messageId);
  if (!row || row.nonce !== nonce || row.userId !== user?.id || !(user.isGM || row.actor.isOwner)) return false;
  const skip = choiceId === "skip";
  const choice = skip ? null : row.choices[Number(choiceId)];
  if (!skip && (!Number.isInteger(Number(choiceId)) || !choice)) return false;
  pending.delete(messageId); // First accepted click wins, before any asynchronous spending.
  row.answer(skip ? { value: row.skip } : choice);
  return true;
}

export function installRollChat() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (root && !message.flags?.["realm-guard"]?.rollDecisionPending && !message.flags?.["realm-guard"]?.rollUndo?.undone) {
      compactStoredRollCards(root);
    }
  });
  if (!legacyMixedPolishEnabled()) return;
  Hooks.once("ready", () => {
    document.addEventListener("click", event => {
      const button = event.target?.closest?.("[data-rg-chat-choice]");
      if (!button) return;
      event.preventDefault();
      if (resolveRollChatChoice(button.dataset.messageId, button.dataset.decisionNonce, button.dataset.rgChatChoice)) button.closest(".rg-chat-question")?.querySelectorAll("button").forEach(el => { el.disabled = true; });
    });
  });
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root) return;
    const authorId = message.author?.id ?? message.user?.id ?? message.user;
    if (authorId !== game.user.id) root.querySelectorAll("[data-rg-chat-choice]").forEach(button => { button.disabled = true; });
    else if (message.flags?.["realm-guard"]?.rollDecisionPending && !active.has(message.id)) {
      const question = root.querySelector(".rg-chat-question");
      if (question) { question.classList.remove("rg-chat-question"); question.textContent = "This roll was interrupted by a reload. Check spent resources before retrying."; }
    }
    root.classList.toggle('rg-choice-needs-attention',authorId===game.user.id&&Boolean(message.flags?.['realm-guard']?.rollDecisionPending)&&Boolean(root.querySelector('.rg-chat-question')));
  });
}
