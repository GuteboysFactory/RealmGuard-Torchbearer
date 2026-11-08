import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { diceFacesHtml } from "./dice-ui.mjs";

const pending = new Map();
const active = new Map();
const actorRolls = new Set();
const spendQueues = new Map();
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

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
  const initialHtml = () => `<section class="rg-first-roll"><b>First roll · ${esc(label)}</b>${diceFacesHtml(initial)}<span>${initial.filter(face => face >= 4).length} initial successes</span></section>`;
  const historyHtml = () => history.length ? `<ol class="rg-roll-decisions">${history.map(row => `<li>${esc(row)}</li>`).join("")}</ol>` : "";
  const message = await ChatMessage.create({ speaker: actor.temporaryOpposition ? { alias: actor.name } : ChatMessage.getSpeaker({ actor }), content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml()}<p>Resolving roll…</p></div>`, flags: { "realm-guard": { rollDecisionPending: true } } });
  const context = {
    message,
    async show(faces) { current = [...faces]; },
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
      history.push(`${question} — ${choices.find(row => row.value === choice)?.label ?? "Declined"}`);
      await message.update({ content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml()}${historyHtml()}<p>Resolving roll…</p></div>` });
      return choice;
    },
    async finish(content) {
      pending.delete(message.id); active.delete(message.id);
      return message.update({ content: `<div class="realm-guard rg-chat-roll-pipeline">${initialHtml()}${historyHtml()}${content}</div>`, "flags.realm-guard.rollDecisionPending": false });
    },
    async interrupt() {
      pending.get(message.id)?.answer(null); pending.delete(message.id); active.delete(message.id);
      return message.update({ content: `<div class="realm-guard">${initialHtml()}${historyHtml()}<p>Roll interrupted. Check already spent resources before retrying.</p></div>`, "flags.realm-guard.rollDecisionPending": false });
    }
  };
  active.set(message.id, context);
  return context;
}

export function resolveRollChatChoice(messageId, nonce, choiceId, user = game.user) {
  const row = pending.get(messageId);
  if (!row || row.nonce !== nonce || row.userId !== user?.id || !(user.isGM || row.actor.isOwner)) return false;
  const skip = choiceId === "skip";
  const choice = skip ? null : row.choices[Number(choiceId)];
  if (!skip && (!Number.isInteger(Number(choiceId)) || !choice)) return false;
  pending.delete(messageId); // First accepted click wins, before any asynchronous spending.
  row.answer(skip ? row.skip : choice.value);
  return true;
}

export function installRollChat() {
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
  });
}
