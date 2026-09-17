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

export function helperEligibility(actor, { excludedActorIds = [], allowedActorIds = [] } = {}) {
  if (!actor || actor.type !== "character") return { ok:false, reason:"Not an eligible Ranger." };
  if ((excludedActorIds ?? []).includes(actor.id)) return { ok:false, reason:"This Ranger is already taking the action." };
  if (Array.isArray(allowedActorIds) && allowedActorIds.length && !allowedActorIds.includes(actor.id)) return { ok:false, reason:"Not participating in this Conflict." };
  if (hasActiveCondition(actor, "Afraid")) return { ok:false, reason:"Afraid — this Condition prevents the Ranger from helping." };
  if (!helperSources(actor).length) return { ok:false, reason:"No legal Help source is currently available." };
  return { ok:true, reason:"Available" };
}

function ownedCandidateActors(user, excludedActorIds = [], allowedActorIds = []) {
  const allowed = new Set((allowedActorIds ?? []).filter(Boolean));
  return game.actors.contents.filter(actor => actor.type === "character" && userOwnsActor(actor,user) && (!allowed.size || allowed.has(actor.id)) && !(excludedActorIds ?? []).includes(actor.id));
}

function validHelperActorsForUser(user, excludedActorIds = [], allowedActorIds = []) {
  return ownedCandidateActors(user, excludedActorIds, allowedActorIds).filter(actor => helperEligibility(actor,{excludedActorIds,allowedActorIds}).ok);
}

export function teamworkAvailability(sessionId) {
  const session=sessions.get(sessionId); if(!session) return [];
  return game.users.contents.flatMap(user => {
    if(!user.active || user.id===game.user.id || user.isGM) return [];
    return ownedCandidateActors(user,session.excludedActorIds,session.allowedActorIds).map(actor => {
      const eligibility=helperEligibility(actor,{excludedActorIds:session.excludedActorIds,allowedActorIds:session.allowedActorIds});
      return { userId:user.id, userName:user.name, actorId:actor.id, actorName:actor.name, ...eligibility };
    });
  });
}

function activeHelperTargets(session) {
  return game.users.contents.flatMap(user => {
    if (!user.active || user.id === game.user.id || user.isGM) return [];
    if (session.acceptedByUser.has(user.id)) return [];
    const actors = validHelperActorsForUser(user, session.excludedActorIds, session.allowedActorIds);
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

export function createTeamworkSession({ requesterActorId, testName = "Test", excludedActorIds = [], allowedActorIds = [] } = {}) {
  const sessionId = foundry.utils.randomID();
  sessions.set(sessionId, {
    sessionId,
    requesterUserId: game.user.id,
    requesterActorId,
    testName,
    excludedActorIds: [...new Set([requesterActorId, ...excludedActorIds].filter(Boolean))],
    allowedActorIds: [...new Set((allowedActorIds ?? []).filter(Boolean))],
    accepted: new Map(),
    pending: new Map(),
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
    synergy: Boolean(entry.synergy),
    note: String(entry.note ?? ""),
    approvedByGm: Boolean(entry.approvedByGm)
  }));
}

export function askForTeamwork(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const requesterActor = game.actors.get(session.requesterActorId);
  const availability = teamworkAvailability(sessionId);
  const targets = activeHelperTargets(session);
  const blocked = availability.filter(row => !row.ok);
  const availabilityNode = requesterRoot(sessionId)?.querySelector?.("[data-rg-help-availability]");
  if (availabilityNode) availabilityNode.innerHTML = availability.length
    ? availability.map(row => `<div class="rg-help-availability ${row.ok ? "is-available" : "is-blocked"}"><i class="fa-solid ${row.ok ? "fa-circle-check" : "fa-circle-xmark"}"></i><span><b>${esc(row.actorName)}</b> · ${esc(row.reason)}</span></div>`).join("")
    : `<span class="rg-muted">No other online Conflict participants are available.</span>`;
  if (!targets.length) {
    const detail = blocked.length ? ` ${blocked.map(row => `${row.actorName}: ${row.reason}`).join(" · ")}` : "";
    ui.notifications.info(`Realm Guard: No Ranger can currently answer this Help request.${detail}`);
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
      allowedActorIds: session.allowedActorIds,
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
  const actors = validHelperActorsForUser(game.user, message.excludedActorIds ?? [], message.allowedActorIds ?? []).filter(actor => allowed.has(actor.id));
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
    <label>How do you help? <textarea rows="3" data-helper-note placeholder="Optional — describe what your Ranger does, especially useful without voice chat."></textarea></label>
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
      const legality = helperEligibility(actor,{excludedActorIds:message.excludedActorIds ?? [],allowedActorIds:message.allowedActorIds ?? []});
      if(!legality.ok) return ui.notifications.warn(`Realm Guard: ${actor.name} cannot Help: ${legality.reason}`);
      const useSynergy = Boolean(synergy.checked && !synergy.disabled && ["Skill", "Ability"].includes(source.kind));
      const note=String(root.querySelector("[data-helper-note]")?.value ?? "").trim();
      sendHelperResponse(message, {
        actorId: actor.id,
        actorName: actor.name,
        sourceId: source.id,
        sourceKind: source.kind,
        sourceName: source.name,
        dice: 1,
        synergy: useSynergy,
        note,
        needsReview: source.kind !== "Skill" || useSynergy
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

function activeReviewGmId(){ return game.users.contents.filter(u=>u.active&&u.isGM).sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0]?.id ?? null; }

function acceptEntry(session, entry){
  session.pending.delete(entry.actorId);
  session.accepted.set(entry.actorId,entry);
  session.acceptedByUser.add(entry.helperUserId);
  session.declinedUsers.delete(entry.helperUserId);
  renderRequesterSession(session.sessionId);
  ui.notifications.info(`${entry.actorName} joined the roll with ${entry.sourceName} (+1D).`);
}

async function openGmHelpReview(message){
  if(!game.user?.isGM || message.targetGmId!==game.user.id) return;
  const e=message.entry ?? {};
  const content=`<div class="rg-teamwork-review"><div class="rg-custom-chat-tag">HELP REVIEW</div><h3>${esc(e.actorName)} offers Help</h3><p><b>Source:</b> ${esc(e.sourceKind)} · ${esc(e.sourceName)}</p>${e.note ? `<blockquote>${esc(e.note)}</blockquote>` : `<p><small>No description supplied.</small></p>`}${e.synergy ? `<p><b>Synergy:</b> spend 1 Fate.</p>` : ""}<p><small>Approve only if this Help is appropriate to the current fiction/test.</small></p></div>`;
  const approved=await foundry.applications.api.DialogV2.wait({window:{title:"Realm Guard · Review Help",resizable:true},content,modal:false,rejectClose:false,buttons:[{action:"approve",label:"Approve Help",icon:"fa-solid fa-check",default:true,callback:()=>true},{action:"reject",label:"Reject",icon:"fa-solid fa-xmark",callback:()=>false}]});
  game.socket.emit(CHANNEL,{type:"teamwork-review-response",requestId:message.requestId,requesterUserId:message.requesterUserId,helperUserId:e.helperUserId,actorId:e.actorId,approved:Boolean(approved),senderId:game.user.id});
}

function receiveReviewResponse(message){
  if(message.requesterUserId!==game.user.id) return;
  const session=sessions.get(message.requestId); if(!session) return;
  const entry=session.pending.get(message.actorId); if(!entry) return;
  if(message.approved){ entry.approvedByGm=true; acceptEntry(session,entry); }
  else { session.pending.delete(message.actorId); session.declinedUsers.add(entry.helperUserId); renderRequesterSession(message.requestId); ui.notifications.warn(`${entry.actorName}'s Help was not approved by the GM.`); }
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
    note: String(message.note ?? ""),
    helperUserId: message.helperUserId,
    approvedByGm: Boolean(game.user?.isGM)
  };
  if (!sourceStillValid(entry)) return;
  const needsReview=Boolean(message.needsReview);
  if(!needsReview || game.user?.isGM){ acceptEntry(session,entry); return; }
  const targetGmId=activeReviewGmId();
  if(!targetGmId){ ui.notifications.warn("Realm Guard: Help requires GM review, but no GM is online."); return; }
  session.pending.set(entry.actorId,entry);
  renderRequesterSession(message.requestId);
  game.socket.emit(CHANNEL,{type:"teamwork-review-request",requestId:message.requestId,requesterUserId:message.requesterUserId,targetGmId,entry,senderId:game.user.id});
  ui.notifications.info(`${entry.actorName}'s Help is waiting for GM approval.`);
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
      if (message.type === "teamwork-review-request") return openGmHelpReview(message);
      if (message.type === "teamwork-review-response") return receiveReviewResponse(message);
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
