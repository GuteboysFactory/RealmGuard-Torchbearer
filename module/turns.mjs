import { registerGmDockTool, renderGmDock } from "./gm-dock.mjs";

const SYSTEM_ID = "realm-guard";
const ENABLED_KEY = "useTurnManager";
const PHASE_KEY = "turnPhase";
const TURN_ID_KEY = "turnCycleId";
const LAST_ACTOR_KEY = "playerTurnLastActor";
const STATE_FLAG = "playerTurnState";
const RECOVERY_FLAG = "recoveryAttempts";

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function refreshTurnSheets() {
  for (const actor of game.actors?.filter(a => a.type === "character") ?? []) {
    const rawApps = actor.apps ?? {};
    const apps = rawApps instanceof Map ? [...rawApps.values()] : Object.values(rawApps);
    for (const app of apps) {
      if (!app?.rendered || typeof app.render !== "function") continue;
      try { app.render({ force: true }); } catch (_error) { try { app.render(false); } catch (_ignored) {} }
    }
  }
}

export function turnManagerEnabled() {
  try { return Boolean(game.settings.get(SYSTEM_ID, ENABLED_KEY)); }
  catch (_error) { return true; }
}

async function handleTurnManagerToggle(enabled) {
  // Start with clean transient turn state whenever the mode changes, but never delete Actor Checks/resources.
  try {
    if (game.user?.isGM) {
      await game.settings.set(SYSTEM_ID, TURN_ID_KEY, currentTurnId() + 1);
      await game.settings.set(SYSTEM_ID, LAST_ACTOR_KEY, "");
    }
  } catch (_error) {}
  refreshTurnSheets();
  renderGmDock();
  if (game.ready) ui.notifications.info(`Realm Guard: Turn Manager ${enabled ? "enabled" : "disabled (Free Play mode)"}.`);
}

export function registerTurnSettings() {
  game.settings.register(SYSTEM_ID, ENABLED_KEY, {
    name: "Use GM Turn / Players' Turn Manager",
    hint: "World setting. When enabled, Realm Guard uses GM Turn / Players' Turn, Free Tests, Checks, alternation, Pass Check and Done/Discard. Disable it for Free Play: normal tests and Recovery ignore Turn/Check costs and the Turn Manager UI is hidden.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: enabled => { void handleTurnManagerToggle(Boolean(enabled)); }
  });
  game.settings.register(SYSTEM_ID, PHASE_KEY, {
    name: "Current Turn Phase",
    hint: "Tracks whether Realm Guard is in the GM Turn or Players' Turn.",
    scope: "world",
    config: false,
    type: String,
    default: "gm"
  });
  game.settings.register(SYSTEM_ID, TURN_ID_KEY, {
    name: "Turn Cycle ID",
    hint: "Internal counter used to reset Players' Turn state cleanly between phases.",
    scope: "world",
    config: false,
    type: Number,
    default: 1
  });
  game.settings.register(SYSTEM_ID, LAST_ACTOR_KEY, {
    name: "Last Players' Turn Actor",
    hint: "Internal guard for the no-two-tests-in-a-row rule.",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
}

export function currentTurnPhase() {
  return String(game.settings.get(SYSTEM_ID, PHASE_KEY) || "gm") === "player" ? "player" : "gm";
}

export function currentTurnId() {
  return Math.max(1, Number(game.settings.get(SYSTEM_ID, TURN_ID_KEY) || 1));
}

export function turnLabel(phase = currentTurnPhase()) {
  if (!turnManagerEnabled()) return "Free Play";
  return phase === "player" ? "Players' Turn" : "GM Turn";
}

export function lastPlayerTurnActorId() {
  return String(game.settings.get(SYSTEM_ID, LAST_ACTOR_KEY) || "");
}

export function recoveryAttempted(actor, conditionName) {
  if (!turnManagerEnabled()) return false;
  const state = actor?.getFlag(SYSTEM_ID, RECOVERY_FLAG) ?? {};
  if (Number(state.turnId ?? 0) !== currentTurnId()) return false;
  return Array.isArray(state.conditions) && state.conditions.includes(String(conditionName));
}

export async function markRecoveryAttempt(actor, conditionName) {
  if (!turnManagerEnabled()) return [];
  const stored = actor?.getFlag(SYSTEM_ID, RECOVERY_FLAG) ?? {};
  const conditions = Number(stored.turnId ?? 0) === currentTurnId() && Array.isArray(stored.conditions) ? [...stored.conditions] : [];
  const name = String(conditionName);
  if (!conditions.includes(name)) conditions.push(name);
  await actor.setFlag(SYSTEM_ID, RECOVERY_FLAG, { turnId: currentTurnId(), conditions });
  refreshTurnSheets();
  return conditions;
}

export function recoveryAttempts(actor) {
  if (!turnManagerEnabled()) return [];
  const stored = actor?.getFlag(SYSTEM_ID, RECOVERY_FLAG) ?? {};
  return Number(stored.turnId ?? 0) === currentTurnId() && Array.isArray(stored.conditions) ? [...stored.conditions] : [];
}

export function participantActors() {
  const seen = new Set();
  const actors = [];
  for (const token of canvas?.tokens?.placeables ?? []) {
    const actor = token.actor;
    if (!actor || actor.type !== "character" || seen.has(actor.id)) continue;
    seen.add(actor.id);
    actors.push(actor);
  }
  if (!actors.length) {
    for (const actor of game.actors.filter(a => a.type === "character")) {
      if (seen.has(actor.id)) continue;
      seen.add(actor.id);
      actors.push(actor);
    }
  }
  return actors.sort((a, b) => a.name.localeCompare(b.name));
}

export function playerTurnState(actor) {
  const stored = actor?.getFlag(SYSTEM_ID, STATE_FLAG) ?? {};
  if (Number(stored.turnId ?? 0) !== currentTurnId()) {
    return {
      turnId: currentTurnId(),
      freeUsed: false,
      testsTaken: 0,
      checksSpent: 0,
      donatedGiven: 0,
      donatedReceived: 0,
      done: false
    };
  }
  return {
    turnId: currentTurnId(),
    freeUsed: Boolean(stored.freeUsed),
    testsTaken: Math.max(0, Number(stored.testsTaken ?? 0)),
    checksSpent: Math.max(0, Number(stored.checksSpent ?? 0)),
    donatedGiven: Math.max(0, Number(stored.donatedGiven ?? 0)),
    donatedReceived: Math.max(0, Number(stored.donatedReceived ?? 0)),
    done: Boolean(stored.done)
  };
}

async function savePlayerTurnState(actor, patch = {}) {
  const next = { ...playerTurnState(actor), ...patch, turnId: currentTurnId() };
  await actor.setFlag(SYSTEM_ID, STATE_FLAG, next);
  refreshTurnSheets();
  return next;
}

export function playerTurnReady(actor) {
  const state = playerTurnState(actor);
  const checks = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  return state.done || (state.freeUsed && checks <= 0);
}

export function playerTurnStatus(actor) {
  if (!turnManagerEnabled()) return null;
  const state = playerTurnState(actor);
  const checks = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  const phase = currentTurnPhase();
  const solo = participantActors().filter(a => !playerTurnState(a).done).length <= 1;
  const blockedByAlternation = phase === "player" && !solo && !state.done && lastPlayerTurnActorId() === actor?.id;
  return {
    phase,
    label: turnLabel(phase),
    state,
    checks,
    freeAvailable: phase === "player" && !state.freeUsed,
    freeUsed: state.freeUsed,
    done: state.done,
    lastTester: lastPlayerTurnActorId() === actor?.id,
    blockedByAlternation,
    canDonate: phase === "player" && checks > 0 && !state.done,
    canFinish: phase === "player" && !state.done,
    ready: phase === "player" && playerTurnReady(actor)
  };
}

export async function claimPlayerTurnTest(actor, { label = "Test", allowUntracked = false } = {}) {
  if (!turnManagerEnabled()) return { ok: true, tracked: false, source: "free-play", cost: 0 };
  // NPC tests never consume a Ranger's Players' Turn Free Test or Checks.
  if (actor?.type !== "character") return { ok: true, tracked: false, source: "npc", cost: 0 };
  if (!actor || currentTurnPhase() !== "player") return { ok: true, tracked: false, source: "none", cost: 0 };
  if (allowUntracked) return { ok: true, tracked: false, source: "untracked", cost: 0 };
  if (!actor.isOwner && !game.user.isGM) return { ok: false, reason: `You do not own ${actor.name}.` };

  const state = playerTurnState(actor);
  if (state.done) return { ok: false, reason: `${actor.name} is marked Done for this Players' Turn.` };

  const activeActors = participantActors().filter(a => !playerTurnState(a).done);
  const solo = activeActors.length <= 1;
  if (!solo && lastPlayerTurnActorId() === actor.id) {
    return { ok: false, reason: `${actor.name} cannot take two tests in a row. Let another patrol member act, pass a Check, or finish the turn.` };
  }

  const checks = Math.max(0, Number(actor.system.resources?.checks?.value ?? 0));
  let source = "free";
  let before = checks;
  let after = checks;
  const updateState = { testsTaken: state.testsTaken + 1, done: false };

  if (!state.freeUsed) {
    updateState.freeUsed = true;
  } else {
    if (checks < 1) return { ok: false, reason: `${actor.name} has used the free test and has no Checks left.` };
    source = "check";
    after = checks - 1;
    updateState.checksSpent = state.checksSpent + 1;
    await actor.update({ "system.resources.checks.value": after });
  }

  await savePlayerTurnState(actor, updateState);
  await game.settings.set(SYSTEM_ID, LAST_ACTOR_KEY, actor.id);
  return { ok: true, tracked: true, source, cost: source === "check" ? 1 : 0, before, after, label };
}

export function playerTurnSpendHtml(spend) {
  if (!spend?.tracked) return "";
  return spend.source === "free"
    ? `<p class="rg-chat-turn-spend"><b>Players' Turn:</b> Free Test used.</p>`
    : `<p class="rg-chat-turn-spend"><b>Players' Turn:</b> Check ${spend.before} → ${spend.after} (-1).</p>`;
}

export async function donateCheck(donor, recipient, amount = 1) {
  if (!turnManagerEnabled()) return { ok: false, reason: "Turn Manager is disabled in this world." };
  if (currentTurnPhase() !== "player") return { ok: false, reason: "Checks can be passed during the Players' Turn." };
  if (!donor || !recipient || donor.id === recipient.id) return { ok: false, reason: "Choose two different patrol members." };
  if (!game.user.isGM && !donor.isOwner) return { ok: false, reason: `You do not control ${donor.name}.` };

  const qty = Math.max(1, Math.floor(Number(amount || 1)));
  const donorChecks = Math.max(0, Number(donor.system.resources?.checks?.value ?? 0));
  const recipientChecks = Math.max(0, Number(recipient.system.resources?.checks?.value ?? 0));
  if (donorChecks < qty) return { ok: false, reason: `${donor.name} only has ${donorChecks} Check${donorChecks === 1 ? "" : "s"}.` };
  if (recipientChecks > 0) return { ok: false, reason: `${recipient.name} already has Checks. Passing Checks is for a patrol-mate who has none.` };

  const donorState = playerTurnState(donor);
  const recipientState = playerTurnState(recipient);
  await donor.update({ "system.resources.checks.value": donorChecks - qty });
  await recipient.update({ "system.resources.checks.value": recipientChecks + qty });
  await savePlayerTurnState(donor, { donatedGiven: donorState.donatedGiven + qty });
  await savePlayerTurnState(recipient, { donatedReceived: recipientState.donatedReceived + qty, done: false });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: donor }),
    content: `<div class="realm-guard rg-turn-chat"><div class="rg-turn-chat-tag">PASSING THE CHECKS</div><h3>${esc(donor.name)} → ${esc(recipient.name)}</h3><p><b>${qty} Check${qty === 1 ? "" : "s"}</b> passed.</p></div>`
  });
  return { ok: true };
}

export async function openDonateDialog(donor) {
  if (!turnManagerEnabled()) return ui.notifications.warn("Realm Guard: Turn Manager is disabled (Free Play mode).");
  if (!donor) return;
  if (currentTurnPhase() !== "player") return ui.notifications.warn("Realm Guard: Checks are passed during the Players' Turn.");
  if (!game.user.isGM && !donor.isOwner) return ui.notifications.warn(`Realm Guard: You do not control ${donor.name}.`);

  const candidates = participantActors().filter(actor => actor.id !== donor.id && Number(actor.system.resources?.checks?.value ?? 0) <= 0);
  if (!candidates.length) return ui.notifications.warn("Realm Guard: No patrol-mate currently has zero Checks.");
  const donorChecks = Math.max(0, Number(donor.system.resources?.checks?.value ?? 0));
  if (!donorChecks) return ui.notifications.warn(`Realm Guard: ${donor.name} has no Checks to pass.`);

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Pass Checks · ${donor.name}`, resizable: true },
    content: `<div class="rg-pass-checks-dialog"><p><b>${esc(donor.name)}</b> has ${donorChecks} Check${donorChecks === 1 ? "" : "s"}.</p><label>Patrol-mate <select name="recipientId">${candidates.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></label><label>Checks <input type="number" name="amount" min="1" max="${donorChecks}" value="1"></label><p><small>Checks may be passed to a patrol-mate who has none.</small></p></div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "pass", label: "Pass Check", icon: "fa-solid fa-share", default: true, callback: (_e, button) => ({ recipientId: button.form?.elements?.recipientId?.value, amount: Number(button.form?.elements?.amount?.value ?? 1) }) },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (!result) return;
  const donation = await donateCheck(donor, game.actors.get(result.recipientId), result.amount);
  if (!donation.ok) ui.notifications.warn(`Realm Guard: ${donation.reason}`);
  else ui.notifications.info("Realm Guard: Check passed.");
}

export async function finishPlayer(actor) {
  if (!turnManagerEnabled()) return false;
  if (!actor || currentTurnPhase() !== "player") return false;
  if (!game.user.isGM && !actor.isOwner) return false;
  const checks = Math.max(0, Number(actor.system.resources?.checks?.value ?? 0));
  if (checks > 0) await actor.update({ "system.resources.checks.value": 0 });
  await savePlayerTurnState(actor, { done: true });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="realm-guard rg-turn-chat"><div class="rg-turn-chat-tag">PLAYERS' TURN</div><p><b>${esc(actor.name)}</b> is Done.${checks ? ` ${checks} unused Check${checks === 1 ? "" : "s"} discarded.` : ""}</p></div>`
  });
  return true;
}

export async function confirmFinishPlayer(actor) {
  if (!turnManagerEnabled()) return ui.notifications.warn("Realm Guard: Turn Manager is disabled (Free Play mode).");
  if (!actor || currentTurnPhase() !== "player") return;
  const checks = Math.max(0, Number(actor.system.resources?.checks?.value ?? 0));
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Done · ${actor.name}`, resizable: true },
    content: `<div class="rg-turn-done-dialog"><p>Mark <b>${esc(actor.name)}</b> Done for this Players' Turn?</p>${checks ? `<p><b>${checks} unused Check${checks === 1 ? "" : "s"}</b> will be discarded.</p>` : "<p>No unused Checks remain.</p>"}</div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "done", label: "Done / Discard", icon: "fa-solid fa-flag-checkered", default: true, callback: () => true },
      { action: "cancel", label: "Cancel", callback: () => false }
    ]
  });
  if (result) await finishPlayer(actor);
}

async function discardAllChecks() {
  const discarded = [];
  for (const actor of participantActors()) {
    const checks = Math.max(0, Number(actor.system.resources?.checks?.value ?? 0));
    if (!checks) continue;
    discarded.push(`${actor.name}: ${checks}`);
    await actor.update({ "system.resources.checks.value": 0 });
  }
  return discarded;
}

export async function setTurnPhase(phase) {
  if (!turnManagerEnabled()) return false;
  if (!game.user.isGM) return false;
  const normalized = phase === "player" ? "player" : "gm";
  const previous = currentTurnPhase();
  if (previous === normalized) return true;

  const discarded = normalized === "gm" && previous === "player" ? await discardAllChecks() : [];
  await game.settings.set(SYSTEM_ID, PHASE_KEY, normalized);
  await game.settings.set(SYSTEM_ID, TURN_ID_KEY, currentTurnId() + 1);
  await game.settings.set(SYSTEM_ID, LAST_ACTOR_KEY, "");
  refreshTurnSheets();

  const detail = normalized === "player"
    ? "Each patrol member has one Free Test. Additional tests cost 1 Check. Recovery uses the same Free Test/Check economy and each Condition gets one recovery attempt per Players' Turn."
    : `The GM drives obstacles and twists. Trait Against can earn Checks. Recovery costs 2 Checks per attempt and each Condition gets one attempt per GM Turn.${discarded.length ? ` Unused Checks discarded: ${discarded.map(esc).join(" · ")}.` : ""}`;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content: `<div class="realm-guard rg-turn-chat"><div class="rg-turn-chat-tag">TURN PHASE</div><h3>${turnLabel(normalized)}</h3><p>${detail}</p></div>`
  });
  ui.notifications.info(`Realm Guard: ${turnLabel(normalized)} started.`);
  return true;
}

function optionRows(actors) {
  return actors.map(actor => `<option value="${actor.id}">${esc(actor.name)}</option>`).join("");
}

export async function openTurnManager() {
  if (!turnManagerEnabled()) {
    ui.notifications.info("Realm Guard: Turn Manager is disabled. Enable it in Configure Settings to use structured GM/Players' Turns.");
    return;
  }
  const phase = currentTurnPhase();
  const actors = participantActors();
  const rows = actors.map(actor => {
    const state = playerTurnState(actor);
    const checks = Number(actor.system.resources?.checks?.value ?? 0);
    const status = state.done ? "DONE" : playerTurnReady(actor) ? "READY" : "ACTIVE";
    const free = state.freeUsed ? "USED" : "AVAILABLE";
    const last = lastPlayerTurnActorId() === actor.id ? `<span class="rg-turn-last">LAST TEST</span>` : "";
    const recovered = recoveryAttempts(actor);
    return `<div class="rg-turn-actor"><div class="rg-turn-actor-main"><b>${esc(actor.name)}</b>${last}<small>Free Test: ${free} · Tests ${state.testsTaken} · Checks spent ${state.checksSpent} · Passed ${state.donatedGiven}/${state.donatedReceived}${recovered.length ? ` · Recovery attempted: ${recovered.map(esc).join(", ")}` : ""}</small></div><div class="rg-turn-actor-right"><strong>${checks} Checks</strong><span class="rg-turn-status rg-turn-status-${status.toLowerCase()}">${status}</span></div></div>`;
  }).join("") || '<p class="rg-empty">No character Actors found.</p>';

  const donors = game.user.isGM ? actors : actors.filter(actor => actor.isOwner);
  const controls = phase === "player" && actors.length ? `<section class="rg-turn-tools">
    <h3>Pass the Checks</h3>
    <div class="rg-turn-tool-grid"><label>From<select name="donorId">${optionRows(donors)}</select></label><label>To<select name="recipientId">${optionRows(actors)}</select></label><label>Amount<input name="donateAmount" type="number" min="1" max="20" value="1"></label></div>
    <h3>Finish a Patrol Member</h3>
    <div class="rg-turn-finish-row"><select name="finishActorId">${optionRows(donors)}</select><small>Marks the Ranger Done and discards remaining Checks.</small></div>
  </section>` : "";

  const allReady = phase === "player" && actors.length > 0 && actors.every(playerTurnReady);
  const content = `<div class="rg-turn-manager"><header><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Turn Manager</h2></header><div class="rg-turn-phase-card"><span>CURRENT PHASE</span><strong>${turnLabel(phase)}</strong><small>${phase === "player" ? "1 Free Test each · then 1 Check per extra test · recovery uses the same economy · one attempt per Condition/Turn." : "Trait Against can earn Checks · recovery costs 2 Checks · one attempt per Condition/GM Turn."}</small></div><div class="rg-turn-actors">${rows}</div>${controls}${allReady ? '<div class="rg-turn-ready-banner"><i class="fa-solid fa-circle-check"></i><b>Players’ Turn is ready to end.</b></div>' : ""}</div>`;

  const buttons = [];
  if (phase === "player" && donors.length) {
    buttons.push({ action: "donate", label: "Pass Check", icon: "fa-solid fa-share", callback: (_e, button) => ({ action: "donate", donorId: button.form?.elements?.donorId?.value, recipientId: button.form?.elements?.recipientId?.value, amount: Number(button.form?.elements?.donateAmount?.value ?? 1) }) });
    buttons.push({ action: "finish", label: "Done / Discard", icon: "fa-solid fa-flag-checkered", callback: (_e, button) => ({ action: "finish", actorId: button.form?.elements?.finishActorId?.value }) });
  }
  if (game.user.isGM) {
    buttons.push({ action: "gm", label: "Start GM Turn", icon: "fa-solid fa-shield-halved", callback: () => ({ action: "gm" }) });
    buttons.push({ action: "player", label: "Start Players' Turn", icon: "fa-solid fa-users", callback: () => ({ action: "player" }) });
  }
  buttons.push({ action: "close", label: "Close", callback: () => null });

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Turn Manager", resizable: true },
    content,
    modal: false,
    rejectClose: false,
    buttons
  });
  if (!result) return;
  if (result.action === "gm" || result.action === "player") {
    await setTurnPhase(result.action);
    return openTurnManager();
  }
  if (result.action === "donate") {
    const donation = await donateCheck(game.actors.get(result.donorId), game.actors.get(result.recipientId), result.amount);
    if (!donation.ok) ui.notifications.warn(`Realm Guard: ${donation.reason}`);
    else ui.notifications.info("Realm Guard: Check passed.");
    return openTurnManager();
  }
  if (result.action === "finish") {
    const actor = game.actors.get(result.actorId);
    if (actor) await finishPlayer(actor);
    return openTurnManager();
  }
}

export function installTurnManager() {
  registerTurnSettings();
  Hooks.on("updateSetting", setting => {
    const key = String(setting?.key ?? "");
    if ([`${SYSTEM_ID}.${ENABLED_KEY}`, `${SYSTEM_ID}.${PHASE_KEY}`, `${SYSTEM_ID}.${TURN_ID_KEY}`, `${SYSTEM_ID}.${LAST_ACTOR_KEY}`].includes(key)) {
      refreshTurnSheets();
      if (key === `${SYSTEM_ID}.${ENABLED_KEY}`) renderGmDock();
    }
  });
  registerGmDockTool({
    id: "turn-manager",
    icon: "fa-solid fa-hourglass-half",
    tooltip: "Open Turn Manager",
    order: 20,
    visible: () => turnManagerEnabled(),
    onClick: () => openTurnManager()
  });
}
