import { isAvailableSkill } from "./default-skills.mjs";
import { hasActiveCondition } from "./conditions.mjs";
import { getActiveM10BFamilyRulePolicy, allowedHelperKindsForTest, helperSourceAllowedForTest } from "./m10b-family-rules.mjs";
import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";

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

function helperSources(actor, testKind = "") {
  if (!actor || actor.type !== "character") return [];
  const policy = getActiveM10BFamilyRulePolicy();
  const allowedKinds = new Set(allowedHelperKindsForTest(testKind, policy));
  const attributes = actor.system?.attributes ?? {};
  return [
    ...actor.items
      .filter(item => item.type === "role" && isAvailableSkill(item.name) && Number(item.system?.rating ?? 0) > 0)
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
      .map(item => ({ id: item.id, kind: "Wise", name: item.name, rating: policy.ratedWises ? Number(item.system?.rating ?? 0) : 0 }))
      .filter(source => !policy.ratedWises || source.rating > 0)
  ].filter(source => allowedKinds.has(source.kind));
}

export function helperEligibility(actor, { excludedActorIds = [], allowedActorIds = [], testKind = "" } = {}) {
  if (!actor || actor.type !== "character") return { ok:false, reason:"Not an eligible Ranger." };
  if ((excludedActorIds ?? []).includes(actor.id)) return { ok:false, reason:"This Ranger is already taking the action." };
  if (Array.isArray(allowedActorIds) && allowedActorIds.length && !allowedActorIds.includes(actor.id)) return { ok:false, reason:"Not participating in this Conflict." };
  const policy = getActiveM10BFamilyRulePolicy();
  if (policy.afraidBlocksHelp && hasActiveCondition(actor, "Afraid")) return { ok:false, reason:"Afraid — this Condition prevents the Ranger from helping." };
  if (!helperSources(actor, testKind).length) return { ok:false, reason:"No legal Help source is currently available for this test type." };
  return { ok:true, reason:"Available" };
}

function assignedHelper(user, session) {
  const actor = user?.character;
  if (!user?.active || user.isGM || user.id === session.requesterUserId
    || !actor || !userOwnsActor(actor, user) || !helperEligibility(actor, session).ok) return null;
  return actor;
}

export function teamworkAvailability(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return [];
  const seenActors = new Set();
  return game.users.contents.flatMap(user => {
    const actor = assignedHelper(user, session);
    if (!actor || seenActors.has(actor.id)) return [];
    seenActors.add(actor.id);
    return [{ user, actor }];
  });
}

export function teamworkWaiting(sessionId) {
  const session = sessions.get(sessionId);
  return Boolean(session && [...session.requests.values()].some(row => ["waiting", "review"].includes(row.status)));
}

function sourceStillValid(entry) {
  const actor = game.actors.get(entry.actorId);
  const policy = getActiveM10BFamilyRulePolicy();
  if (!actor || (policy.afraidBlocksHelp && hasActiveCondition(actor, "Afraid"))) return false;
  if (!helperSourceAllowedForTest(entry.sourceKind, entry.testKind ?? "", policy)) return false;
  if (entry.sourceKind === "Skill") {
    const item = actor.items.get(entry.sourceId);
    return Boolean(item?.type === "role" && isAvailableSkill(item.name) && Number(item.system?.rating ?? 0) > 0);
  }
  if (entry.sourceKind === "Ability") {
    const key = String(entry.sourceId ?? "").replace("ability:", "");
    const attributes = actor.system?.attributes ?? {};
    const rating = Number(key === "nature" ? attributes.nature?.value : attributes[key]?.value ?? 0);
    return ABILITIES.includes(key) && rating > 0;
  }
  if (entry.sourceKind === "Wise") { const wise=actor.items.get(entry.sourceId); return Boolean(wise?.type === "wise" && (!policy.ratedWises || Number(wise.system?.rating ?? 0) > 0)); }
  return false;
}

function requesterRoot(sessionId) {
  return document.querySelector(`[data-rg-teamwork-session="${CSS.escape(sessionId)}"]`);
}

function renderRequesterSession(sessionId) {
  const session = sessions.get(sessionId);
  const root = requesterRoot(sessionId);
  if (!session || !root) return;
  const accepted = [...session.accepted.values()].map(entry => ({...entry,testKind:session.testKind})).filter(sourceStillValid);
  const summary = root.querySelector("[data-rg-help-summary]");
  if (summary) {
    summary.innerHTML = accepted.length
      ? accepted.map(entry => `<div class="rg-teamwork-accepted"><i class="fa-solid fa-handshake"></i><span><b>${esc(entry.actorName)}</b> - ${entry.sourceKind === "Wise" ? (getActiveM10BFamilyRulePolicy().ratedWises ? "Teamwork Wise: " : "I Am Wise: ") : ""}${esc(entry.sourceName)}</span><strong>+1D</strong>${entry.synergy ? `<span class="rg-teamwork-synergy-tag">Synergy</span>` : ""}</div>`).join("")
      : `<span class="rg-muted">No Help accepted yet.</span>`;
  }
  const waiting = teamworkWaiting(sessionId);
  const requests = [...session.requests.values()].filter(row => row.status !== "removed");
  const status = root.querySelector("[data-rg-help-request-status]");
  if (status) status.textContent = waiting ? "Waiting for Help replies."
    : accepted.length ? `Teamwork bonus: +${accepted.length}D. Ready to roll.`
      : requests.length ? "All Help requests answered. Ready to roll." : "Help is optional.";
  const labels = { waiting: "Waiting for reply", review: "Waiting for GM approval", accepted: "Helping", declined: "Declined" };
  const requestList = root.querySelector("[data-rg-help-availability]");
  if (requestList) requestList.innerHTML = requests.map(row => `<div class="rg-help-availability">
    <span><b>${esc(row.actorName)}</b> · ${esc(labels[row.status])}</span>
    ${["waiting", "review"].includes(row.status) ? `<button type="button" data-rg-dismiss-help="${esc(row.userId)}" aria-label="Stop waiting for ${esc(row.actorName)}">×</button>` : ""}
  </div>`).join("");
  const rollButton = root.closest("form")?.querySelector('[data-action="roll"],[data-dialog-action="roll"]');
  if (rollButton) rollButton.disabled = waiting;
  const button = root.querySelector("[data-rg-teamwork-ask]");
  if (button) button.disabled = waiting;
  const wise = root.querySelector('[name="wiseId"]');
  if (wise && legacyMixedPolishEnabled()) {
    wise.disabled = accepted.some(entry => entry.sourceKind === "Wise");
    wise.title = wise.disabled ? "A helper is already contributing the Wise for this test." : "";
    if (wise.disabled) wise.value = "";
  }
}

export function createTeamworkSession({ requesterActorId, testName = "Test", testKind = "", excludedActorIds = [], allowedActorIds = [] } = {}) {
  const sessionId = foundry.utils.randomID();
  sessions.set(sessionId, {
    sessionId,
    requesterUserId: game.user.id,
    requesterActorId,
    testName,
    testKind: String(testKind ?? ""),
    excludedActorIds: [...new Set([requesterActorId, ...excludedActorIds].filter(Boolean))],
    allowedActorIds: [...new Set((allowedActorIds ?? []).filter(Boolean))],
    accepted: new Map(),
    pending: new Map(),
    requests: new Map()
  });
  return sessionId;
}

export function setTeamworkOpponent(sessionId, opponentId) {
  const session = sessions.get(sessionId);
  if (!session || session.opponentId === opponentId) return;
  session.excludedActorIds = session.excludedActorIds.filter(id => id !== session.opponentId);
  session.opponentId = opponentId;
  if (opponentId) session.excludedActorIds.push(opponentId);
  session.accepted.delete(opponentId);
  for (const row of session.requests.values()) {
    if (row.actorId === opponentId && row.status !== "removed") dismissHelp(session, row.userId);
  }
  renderRequesterSession(sessionId);
}

export function teamworkEntries(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return [...session.accepted.values()].map(entry => ({...entry,testKind:session.testKind})).filter(sourceStillValid).map(entry => ({
    actorId: entry.actorId,
    actorName: entry.actorName,
    sourceId: entry.sourceId,
    sourceKind: entry.sourceKind,
    sourceName: entry.sourceName,
    dice: 1,
    mode: getActiveM10BFamilyRulePolicy().mg2eWises && entry.sourceKind === "Wise" ? "I_AM_WISE" : "TEAMWORK",
    helperConditionRisk: !(getActiveM10BFamilyRulePolicy().mg2eWises && entry.sourceKind === "Wise"),
    twistRisk: getActiveM10BFamilyRulePolicy().mg2eWises && entry.sourceKind === "Wise",
    synergy: Boolean(entry.synergy),
    note: String(entry.note ?? ""),
    approvedByGm: Boolean(entry.approvedByGm)
  }));
}

export function askForTeamwork(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const requesterActor = game.actors.get(session.requesterActorId);
  const targets = teamworkAvailability(sessionId).filter(({user, actor}) => !session.requests.has(user.id)
    && ![...session.requests.values()].some(row => row.actorId === actor.id && row.status !== "removed"));
  if (!targets.length) {
    ui.notifications.info("No eligible online players with an assigned character are available to ask.");
    return false;
  }
  for (const {user, actor} of targets) {
    session.requests.set(user.id, { userId: user.id, actorId: actor.id, actorName: actor.name, status: "waiting" });
    game.socket.emit(CHANNEL, {
      type: "teamwork-request", requestId: sessionId, requesterUserId: session.requesterUserId,
      requesterActorId: session.requesterActorId, requesterActorName: requesterActor?.name ?? "Ranger",
      testName: session.testName, testKind: session.testKind, targetUserId: user.id, helperActorIds: [actor.id],
      excludedActorIds: session.excludedActorIds, allowedActorIds: session.allowedActorIds, senderId: game.user.id
    });
  }
  renderRequesterSession(sessionId);
  return true;
}

function dismissHelp(session, userId) {
  const row = session?.requests.get(userId);
  if (!row) return;
  row.status = "removed";
  session.pending.delete(row.actorId);
  game.socket.emit(CHANNEL, { type: "teamwork-close", requestId: session.sessionId, targetUserId: userId,
    requesterUserId: session.requesterUserId, senderId: game.user.id });
  renderRequesterSession(session.sessionId);
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

async function openHelperRequest(message) {
  if (message.targetUserId !== game.user.id) return;
  if (helperDialogs.has(message.requestId)) return;
  const allowed = new Set(message.helperActorIds ?? []);
  const assigned = assignedHelper(game.user, message);
  if (!assigned || !allowed.has(assigned.id)) return;
  const actors = [assigned];

  const sourceMap = new Map(actors.map(actor => [actor.id, helperSources(actor, message.testKind ?? "")]));
  const actorOptions = actors.map(actor => `<option value="${actor.id}">${esc(actor.name)}</option>`).join("");
  const initialActor = actors[0];
  const sourceOptions = actor => {
    const sources = sourceMap.get(actor.id) ?? [];
    return ["Skill", "Ability", "Wise"].map(kind => {
      const rows = sources.filter(source => source.kind === kind);
      if (!rows.length) return "";
      const label = kind === "Wise" ? (getActiveM10BFamilyRulePolicy().ratedWises ? "Teamwork - Wises" : "I Am Wise - Wises") : `Normal Help - ${kind}s`;
      return `<optgroup label="${label}">${rows.map(source => `<option value="${source.kind}|${source.id}">${esc(source.name)}${source.rating ? ` ${source.rating}` : ""}</option>`).join("")}</optgroup>`;
    }).join("");
  };

  const content = `<div class="rg-teamwork-request" data-rg-teamwork-helper="${esc(message.requestId)}">
    <div class="rg-teamwork-request-head"><div class="rg-custom-chat-tag">HELP REQUEST</div><h2>${esc(message.requesterActorName)} asks for Help</h2><p><b>Test:</b> ${esc(message.testName)}</p></div>
    ${actors.length > 1 ? `<label>Help as <select data-helper-actor>${actorOptions}</select></label>` : `<p class="rg-teamwork-helper-name"><b>${esc(initialActor.name)}</b></p>`}
    <label>How will you help?<select data-helper-source>${sourceOptions(initialActor)}</select></label>
    <div class="rg-teamwork-source-help" data-helper-source-help>${getActiveM10BFamilyRulePolicy().helperSourcePolicy === "MG1E_TYPED" ? (String(message.testKind)==="Ability" ? "Ability tests are helped by an appropriate Ability. I Am Wise remains the acting character\'s own Wise." : "Skill/Wise tests are helped by an appropriate Skill or rated Wise. I Am Wise remains the acting character\'s own Wise.") : "Choose an appropriate trained Skill or Ability for normal Help, or a relevant Wise for I Am Wise."}</div>
    <label>How do you help? <textarea rows="3" data-helper-note placeholder="Optional — describe what your Ranger does, especially useful without voice chat."></textarea></label>
    ${getActiveM10BFamilyRulePolicy().synergyEnabled ? `<label class="rg-teamwork-request-synergy"><input type="checkbox" data-helper-synergy> <span><b>Use Synergy - spend 1 Fate</b><small data-helper-synergy-note></small></span></label>` : ""}
    <small>You can answer while ${esc(message.requesterActorName)} continues preparing the roll. Helper Traits are not used for Teamwork.</small>
  </div>`;

  const dialog = new foundry.applications.api.DialogV2({
    classes: ["rg-teamwork-helper-dialog"],
    window: { title: `Realm Guard - Help ${message.requesterActorName}`, resizable: true },
    content,
    modal: false,
    form: { closeOnSubmit: false },
    buttons: [
      { action: "acceptHelp", label: "Help +1D", icon: "fa-solid fa-handshake", callback: () => acceptHelp() },
      { action: "declineHelp", label: "Decline", icon: "fa-solid fa-xmark", default: true, callback: () => declineHelp() }
    ]
  });
  helperDialogs.set(message.requestId, dialog);
  dialog.addEventListener?.("close", () => {
    if (helperDialogs.get(message.requestId) === dialog) helperDialogs.delete(message.requestId);
  }, { once: true });
  try {
    await dialog.render(true);
  } catch (error) {
    helperDialogs.delete(message.requestId);
    throw error;
  }
  if (helperDialogs.get(message.requestId) !== dialog) return;
  const root = dialog.element?.querySelector(`[data-rg-teamwork-helper="${CSS.escape(message.requestId)}"]`);
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
    if (!synergy || !synergyNote) return;
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

  async function acceptHelp() {
    const actor = currentActor();
    const source = currentSource();
    if (!source) return ui.notifications.warn("Realm Guard: Choose how this Ranger is helping first.");
    const legality = helperEligibility(actor,{excludedActorIds:message.excludedActorIds ?? [],allowedActorIds:message.allowedActorIds ?? [],testKind:message.testKind ?? ""});
    if(!legality.ok) return ui.notifications.warn(`Realm Guard: ${actor.name} cannot Help: ${legality.reason}`);
    const useSynergy = Boolean(getActiveM10BFamilyRulePolicy().synergyEnabled && synergy?.checked && !synergy?.disabled && ["Skill", "Ability"].includes(source.kind));
    const note=String(root.querySelector("[data-helper-note]")?.value ?? "").trim();
    sendHelperResponse(message, {
      actorId: actor.id,
      actorName: actor.name,
      sourceId: source.id,
      sourceKind: source.kind,
      sourceName: source.name,
      testKind: String(message.testKind ?? ""),
      dice: 1,
      synergy: useSynergy,
      note,
      needsReview: source.kind !== "Skill" || useSynergy
    });
    ui.notifications.info(`Realm Guard: ${actor.name} is helping ${message.requesterActorName} with ${source.name}.`);
    helperDialogs.delete(message.requestId);
    await dialog.close();
  }

  async function declineHelp() {
    sendDecline(message);
    helperDialogs.delete(message.requestId);
    await dialog.close();
  }
}

function activeReviewGmId(){ return game.users.contents.filter(u=>u.active&&u.isGM).sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0]?.id ?? null; }

function acceptEntry(session, entry){
  session.pending.delete(entry.actorId);
  if (legacyMixedPolishEnabled() && entry.sourceKind === "Wise"
    && [...session.accepted.values()].some(current => current.actorId !== entry.actorId && current.sourceKind === "Wise" && sourceStillValid(current))) {
    session.requests.get(entry.helperUserId).status = "declined";
    renderRequesterSession(session.sessionId);
    ui.notifications.info("This test already has Wise Help. Ask for Help with a Skill or Ability instead.");
    return;
  }
  session.accepted.set(entry.actorId,entry);
  session.requests.get(entry.helperUserId).status = "accepted";
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
  else { session.pending.delete(message.actorId); session.requests.get(entry.helperUserId).status = "declined"; renderRequesterSession(message.requestId); ui.notifications.warn(`${entry.actorName}'s Help was not approved by the GM.`); }
}

function receiveResponse(message) {
  if (message.requesterUserId !== game.user.id) return;
  const session = sessions.get(message.requestId);
  if (!session) return;
  const request = session.requests.get(message.helperUserId);
  if (request?.status !== "waiting" || request.actorId !== message.actorId) return;
  const actor = assignedHelper(game.users.get(message.helperUserId), session);
  if (!actor || actor.id !== request.actorId) {
    request.status = "declined";
    renderRequesterSession(message.requestId);
    return;
  }
  const entry = {
    actorId: message.actorId,
    actorName: message.actorName ?? actor.name,
    sourceId: message.sourceId,
    sourceKind: message.sourceKind,
    sourceName: message.sourceName,
    testKind: String(message.testKind ?? session.testKind ?? ""),
    dice: 1,
    synergy: Boolean(message.synergy),
    note: String(message.note ?? ""),
    helperUserId: message.helperUserId,
    approvedByGm: Boolean(game.user?.isGM)
  };
  if (!sourceStillValid(entry)) { request.status = "declined"; renderRequesterSession(message.requestId); return; }
  const needsReview=Boolean(message.needsReview);
  if(!needsReview || game.user?.isGM){ acceptEntry(session,entry); return; }
  const targetGmId=activeReviewGmId();
  if(!targetGmId){ request.status = "declined"; renderRequesterSession(message.requestId); ui.notifications.warn("Realm Guard: Help requires GM review, but no GM is online."); return; }
  session.pending.set(entry.actorId,entry);
  request.status = "review";
  renderRequesterSession(message.requestId);
  game.socket.emit(CHANNEL,{type:"teamwork-review-request",requestId:message.requestId,requesterUserId:message.requesterUserId,targetGmId,entry,senderId:game.user.id});
  ui.notifications.info(`${entry.actorName}'s Help is waiting for GM approval.`);
}

function receiveDecline(message) {
  if (message.requesterUserId !== game.user.id) return;
  const session = sessions.get(message.requestId);
  if (!session) return;
  const request = session.requests.get(message.helperUserId);
  if (request?.status !== "waiting") return;
  request.status = "declined";
  renderRequesterSession(message.requestId);
}

async function closeHelperRequest(message) {
  if (message.targetUserId && message.targetUserId !== game.user.id) return;
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
      const dismiss = event.target?.closest?.("[data-rg-dismiss-help]");
      if (dismiss) {
        const id = dismiss.closest("[data-rg-teamwork-session]")?.dataset.rgTeamworkSession;
        dismissHelp(sessions.get(id), dismiss.dataset.rgDismissHelp);
        return;
      }
      const button = event.target?.closest?.("[data-rg-teamwork-ask]");
      if (!button) return;
      event.preventDefault();
      const sessionId = button.dataset.rgTeamworkAsk;
      if (sessionId) askForTeamwork(sessionId);
    });
  });
}
