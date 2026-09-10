import { hasActiveCondition } from "./conditions.mjs";

const NS = "realm-guard";
const CHANNEL = `system.${NS}`;
const sessions = new Map();
const helperDialogs = new Map();

const ABILITIES = ["nature", "will", "health", "resources", "circles"];
const ABILITY_LABELS = {
  nature: "Nature",
  will: "Will",
  health: "Health",
  resources: "Resources",
  circles: "Circles"
};

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function ownerLevel() {
  return Number(globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3);
}

function userOwnsActor(actor, user) {
  if (!actor || !user) return false;
  try {
    if (typeof actor.testUserPermission === "function") return actor.testUserPermission(user, "OWNER");
  } catch (_err) {
    // Fall through to direct ownership inspection.
  }
  const ownership = actor.ownership ?? {};
  return Number(ownership[user.id] ?? ownership.default ?? 0) >= ownerLevel();
}

function helperSources(actor) {
  if (!actor || actor.type !== "character") return [];
  const attributes = actor.system?.attributes ?? {};
  return [
    ...actor.items
      .filter(item => item.type === "role" && Number(item.system?.rating ?? 0) > 0)
      .map(item => ({ id: item.id, kind: "Skill", name: item.name, rating: Number(item.system?.rating ?? 0) })),
    ...ABILITIES
      .map(key => ({
        id: `ability:${key}`,
        kind: "Ability",
        name: ABILITY_LABELS[key] ?? key,
        rating: Number(key === "nature" ? attributes.nature?.value : attributes[key]?.value ?? 0)
      }))
      .filter(source => source.rating > 0),
    ...actor.items
      .filter(item => item.type === "wise")
      .map(item => ({ id: item.id, kind: "Wise", name: item.name, rating: 0 }))
  ];
}

function validHelperActorsForUser(user, excludedActorIds = []) {
  const excluded = new Set(excludedActorIds.filter(Boolean));
  return game.actors.contents.filter(actor => {
    if (actor.type !== "character" || excluded.has(actor.id)) return false;
    if (!userOwnsActor(actor, user)) return false;
    if (hasActiveCondition(actor, "Afraid")) return false;
    return helperSources(actor).length > 0;
  });
}

function activeHelperTargets(session) {
  return game.users.contents.flatMap(user => {
    if (!user.active || user.id === game.user.id || user.isGM) return [];
    if (session.acceptedByUser.has(user.id)) return [];
    const actors = validHelperActorsForUser(user, session.excludedActorIds);
    if (!actors.length) return [];
    return [{ user, actorIds: actors.map(actor => actor.id) }];
  });
}

function sourceStillValid(entry) {
  const actor = game.actors.get(entry.actorId);
  if (!actor || hasActiveCondition(actor, "Afraid")) return false;
  if (entry.sourceKind === "Skill") {
    const item = actor.items.get(entry.sourceId);
    return Boolean(item?.type === "role" && Number(item.system?.rating ?? 0) > 0);
  }
  if (entry.sourceKind === "Ability") {
    const key = String(entry.sourceId ?? "").replace("ability:", "");
    const attributes = actor.system?.attributes ?? {};
    const rating = Number(key === "nature" ? attributes.nature?.value : attributes[key]?.value ?? 0);
    return ABILITIES.includes(key) && rating > 0;
  }
  if (entry.sourceKind === "Wise") return actor.items.get(entry.sourceId)?.type === "wise";
  return false;
}

function requesterRoot(sessionId) {
  return document.querySelector(`[data-rg-teamwork-session="${CSS.escape(sessionId)}"]`);
}

function renderRequesterSession(sessionId) {
  const session = sessions.get(sessionId);
  const root = requesterRoot(sessionId);
  if (!session || !root) return;
  const accepted = [...session.accepted.values()].filter(sourceStillValid);
  const summary = root.querySelector("[data-rg-help-summary]");
  if (summary) {
    summary.innerHTML = accepted.length
      ? accepted.map(entry => `<div class="rg-teamwork-accepted"><i class="fa-solid fa-handshake"></i><span><b>${esc(entry.actorName)}</b> - ${entry.sourceKind === "Wise" ? "I Am Wise: " : ""}${esc(entry.sourceName)}</span><strong>+1D</strong>${entry.synergy ? `<span class="rg-teamwork-synergy-tag">Synergy</span>` : ""}</div>`).join("")
      : `<span class="rg-muted">No Help accepted yet.</span>`;
  }
  const status = root.querySelector("[data-rg-help-request-status]");
  if (status) {
    if (accepted.length) status.textContent = `Teamwork bonus: +${accepted.length}D. You can roll now or ask more Rangers.`;
    else if (session.requestedUsers.size) status.textContent = "Help request sent. Keep preparing the roll while Rangers answer.";
    else status.textContent = "Help is optional. Ask active Rangers only when you want it.";
  }
  const button = root.querySelector("[data-rg-teamwork-ask]");
  if (button) button.innerHTML = accepted.length ? `<i class="fa-solid fa-handshake-angle"></i> Ask for more Help` : `<i class="fa-solid fa-handshake-angle"></i> Ask for Help`;
}

export function createTeamworkSession({ requesterActorId, testName = "Test", excludedActorIds = [] } = {}) {
  const sessionId = foundry.utils.randomID();
  sessions.set(sessionId, {
    sessionId,
    requesterUserId: game.user.id,
    requesterActorId,
    testName,
    excludedActorIds: [...new Set([requesterActorId, ...excludedActorIds].filter(Boolean))],
    accepted: new Map(),
    acceptedByUser: new Set(),
    declinedUsers: new Set(),
    requestedUsers: new Set()
  });
  return sessionId;
}

export function teamworkEntries(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return [...session.accepted.values()].filter(sourceStillValid).map(entry => ({
    actorId: entry.actorId,
    actorName: entry.actorName,
    sourceId: entry.sourceId,
    sourceKind: entry.sourceKind,
    sourceName: entry.sourceName,
    dice: 1,
    synergy: Boolean(entry.synergy)
  }));
}

export function askForTeamwork(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const requesterActor = game.actors.get(session.requesterActorId);
  const targets = activeHelperTargets(session);
  if (!targets.length) {
    ui.notifications.info("Realm Guard: No additional active Ranger players are available to answer a Help request.");
    renderRequesterSession(sessionId);
    return false;
  }
  for (const target of targets) {
    session.requestedUsers.add(target.user.id);
    game.socket.emit(CHANNEL, {
      type: "teamwork-request",
      requestId: sessionId,
      requesterUserId: session.requesterUserId,
      requesterActorId: session.requesterActorId,
      requesterActorName: requesterActor?.name ?? "Ranger",
      testName: session.testName,
      targetUserId: target.user.id,
      helperActorIds: target.actorIds,
      excludedActorIds: session.excludedActorIds,
      senderId: game.user.id
    });
  }
  renderRequesterSession(sessionId);
  return true;
}

export function finishTeamworkSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  game.socket.emit(CHANNEL, {
    type: "teamwork-close",
    requestId: sessionId,
    requesterUserId: session.requesterUserId,
    senderId: game.user.id
  });
  sessions.delete(sessionId);
}

function sendHelperResponse(message, entry) {
  game.socket.emit(CHANNEL, {
    type: "teamwork-response",
    requestId: message.requestId,
    requesterUserId: message.requesterUserId,
    helperUserId: game.user.id,
    ...entry,
    senderId: game.user.id
  });
}

function sendDecline(message) {
  game.socket.emit(CHANNEL, {
    type: "teamwork-decline",
    requestId: message.requestId,
    requesterUserId: message.requesterUserId,
    helperUserId: game.user.id,
    senderId: game.user.id
  });
}

function openHelperRequest(message) {
  if (message.targetUserId !== game.user.id) return;
  if (document.querySelector(`[data-rg-teamwork-helper="${CSS.escape(message.requestId)}"]`)) return;
  helperDialogs.delete(message.requestId);
  const allowed = new Set(message.helperActorIds ?? []);
  const actors = validHelperActorsForUser(game.user, message.excludedActorIds ?? []).filter(actor => allowed.has(actor.id));
  if (!actors.length) return;

  const sourceMap = new Map(actors.map(actor => [actor.id, helperSources(actor)]));
  const actorOptions = actors.map(actor => `<option value="${actor.id}">${esc(actor.name)}</option>`).join("");
  const initialActor = actors[0];
  const sourceOptions = actor => {
    const sources = sourceMap.get(actor.id) ?? [];
    return ["Skill", "Ability", "Wise"].map(kind => {
      const rows = sources.filter(source => source.kind === kind);
      if (!rows.length) return "";
      const label = kind === "Wise" ? "I Am Wise - Wises" : `Normal Help - ${kind}s`;
      return `<optgroup label="${label}">${rows.map(source => `<option value="${source.kind}|${source.id}">${esc(source.name)}${source.rating ? ` ${source.rating}` : ""}</option>`).join("")}</optgroup>`;
    }).join("");
  };

  const content = `<div class="rg-teamwork-request" data-rg-teamwork-helper="${esc(message.requestId)}">
    <div class="rg-teamwork-request-head"><div class="rg-custom-chat-tag">HELP REQUEST</div><h2>${esc(message.requesterActorName)} asks for Help</h2><p><b>Test:</b> ${esc(message.testName)}</p></div>
    ${actors.length > 1 ? `<label>Help as <select data-helper-actor>${actorOptions}</select></label>` : `<p class="rg-teamwork-helper-name"><b>${esc(initialActor.name)}</b></p>`}
    <label>How will you help?<select data-helper-source>${sourceOptions(initialActor)}</select></label>
    <div class="rg-teamwork-source-help" data-helper-source-help>Choose an appropriate trained Skill or Ability for normal Help, or a relevant Wise for I Am Wise.</div>
    <label class="rg-teamwork-request-synergy"><input type="checkbox" data-helper-synergy> <span><b>Use Synergy - spend 1 Fate</b><small data-helper-synergy-note></small></span></label>
    <div class="rg-teamwork-request-actions"><button type="button" data-helper-accept><i class="fa-solid fa-handshake"></i> Help +1D</button><button type="button" data-helper-decline><i class="fa-solid fa-xmark"></i> Decline</button></div>
    <small>You can answer while ${esc(message.requesterActorName)} continues preparing the roll. Helper Traits are not used for Teamwork.</small>
  </div>`;

  const dialog = new foundry.applications.api.DialogV2({
    window: { title: `Realm Guard - Help ${message.requesterActorName}`, resizable: true },
    content,
    modal: false,
    buttons: []
  });
  helperDialogs.set(message.requestId, dialog);
  dialog.render(true);

  setTimeout(() => {
    const root = document.querySelector(`[data-rg-teamwork-helper="${CSS.escape(message.requestId)}"]`);
    if (!root) return;
    const actorSelect = root.querySelector("[data-helper-actor]");
    const sourceSelect = root.querySelector("[data-helper-source]");
    const synergy = root.querySelector("[data-helper-synergy]");
    const synergyNote = root.querySelector("[data-helper-synergy-note]");

    const currentActor = () => game.actors.get(actorSelect?.value || initialActor.id) ?? initialActor;
    const currentSource = () => {
      const [kind, id] = String(sourceSelect?.value ?? "").split("|");
      return (sourceMap.get(currentActor().id) ?? []).find(source => source.kind === kind && source.id === id) ?? null;
    };
    const refreshSynergy = () => {
      const actor = currentActor();
      const source = currentSource();
      const fate = Number(actor.system?.resources?.fate?.value ?? 0);
      const eligible = Boolean(source && ["Skill", "Ability"].includes(source.kind) && fate > 0);
      synergy.disabled = !eligible;
      if (!eligible) synergy.checked = false;
      synergyNote.textContent = source?.kind === "Wise"
        ? "I Am Wise is separate from Synergy."
        : fate < 1
          ? ` ${actor.name} has 0 Fate available.`
          : ` ${actor.name} has ${fate} Fate available. Pass/Fail is marked on the helping source.`;
    };
    const refreshSources = () => {
      const actor = currentActor();
      sourceSelect.innerHTML = sourceOptions(actor);
      refreshSynergy();
    };

    actorSelect?.addEventListener("change", refreshSources);
    sourceSelect?.addEventListener("change", refreshSynergy);
    refreshSynergy();

    root.querySelector("[data-helper-accept]")?.addEventListener("click", async () => {
      const actor = currentActor();
      const source = currentSource();
      if (!source) return ui.notifications.warn("Realm Guard: Choose how this Ranger is helping first.");
      const useSynergy = Boolean(synergy.checked && !synergy.disabled && ["Skill", "Ability"].includes(source.kind));
      sendHelperResponse(message, {
        actorId: actor.id,
        actorName: actor.name,
        sourceId: source.id,
        sourceKind: source.kind,
        sourceName: source.name,
        dice: 1,
        synergy: useSynergy
      });
      ui.notifications.info(`Realm Guard: ${actor.name} is helping ${message.requesterActorName} with ${source.name}.`);
      helperDialogs.delete(message.requestId);
      await dialog.close();
    });

    root.querySelector("[data-helper-decline]")?.addEventListener("click", async () => {
      sendDecline(message);
      helperDialogs.delete(message.requestId);
      await dialog.close();
    });
  }, 50);
}

function receiveResponse(message) {
  if (message.requesterUserId !== game.user.id) return;
  const session = sessions.get(message.requestId);
  if (!session) return;
  const actor = game.actors.get(message.actorId);
  if (!actor || hasActiveCondition(actor, "Afraid")) return;
  const entry = {
    actorId: message.actorId,
    actorName: message.actorName ?? actor.name,
    sourceId: message.sourceId,
    sourceKind: message.sourceKind,
    sourceName: message.sourceName,
    dice: 1,
    synergy: Boolean(message.synergy),
    helperUserId: message.helperUserId
  };
  if (!sourceStillValid(entry)) return;
  session.accepted.set(entry.actorId, entry);
  session.acceptedByUser.add(message.helperUserId);
  session.declinedUsers.delete(message.helperUserId);
  renderRequesterSession(message.requestId);
  ui.notifications.info(`${entry.actorName} joined the roll with ${entry.sourceName} (+1D).`);
}

function receiveDecline(message) {
  if (message.requesterUserId !== game.user.id) return;
  const session = sessions.get(message.requestId);
  if (!session) return;
  session.declinedUsers.add(message.helperUserId);
  renderRequesterSession(message.requestId);
}

async function closeHelperRequest(message) {
  const dialog = helperDialogs.get(message.requestId);
  if (!dialog) return;
  helperDialogs.delete(message.requestId);
  await dialog.close();
}

export function installTeamworkWorkflow() {
  Hooks.once("ready", () => {
    game.socket.on(CHANNEL, message => {
      if (!String(message?.type ?? "").startsWith("teamwork-")) return;
      if (message.type === "teamwork-request") return openHelperRequest(message);
      if (message.type === "teamwork-response") return receiveResponse(message);
      if (message.type === "teamwork-decline") return receiveDecline(message);
      if (message.type === "teamwork-close") return closeHelperRequest(message);
    });
    document.addEventListener("click", event => {
      const button = event.target?.closest?.("[data-rg-teamwork-ask]");
      if (!button) return;
      event.preventDefault();
      const sessionId = button.dataset.rgTeamworkAsk;
      if (sessionId) askForTeamwork(sessionId);
    });
  });
}
