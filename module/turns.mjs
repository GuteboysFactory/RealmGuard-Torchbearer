import { registerGmDockTool, renderGmDock } from "./gm-dock.mjs";
import { participantActorReference, participantActors, resolveParticipantActor } from "./session-participants.mjs";
import { installTurnAuthorityBridge, requestTurnAuthority } from "./turn-authority-bridge.mjs";
import { observeM7Lifecycle } from "./m7-session-shadow.mjs";
import { createM7Services, legacySessionSnapshot } from "./core/m7-session-services.mjs";
import { evaluateM7PlayerTurnClaimLiveHandoff, evaluateM7CheckTransferLiveHandoff, evaluateM7FinishPlayerLiveHandoff, evaluateM7PhaseChangeLiveHandoff, evaluateM7RecoverySpendLiveHandoff, evaluateM7RecoveryRefundLiveHandoff, evaluateM7RecoveryAttemptLiveHandoff, evaluateM7TraitCheckAwardLiveHandoff } from "./m7-session-live-handoff.mjs";

const SYSTEM_ID = "realm-guard";
const ENABLED_KEY = "useTurnManager";
const PHASE_KEY = "turnPhase";
const TURN_ID_KEY = "turnCycleId";
const LAST_ACTOR_KEY = "playerTurnLastActor";
const STATE_FLAG = "playerTurnState";
const RECOVERY_FLAG = "recoveryAttempts";

function requesterCanControlActor(requester, actor) {
  if (requester?.isGM) return true;
  return Boolean(actor?.testUserPermission?.(requester, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER));
}

function staleTurnAuthorityRequest(payload = {}) {
  const expectedTurnId = Number(payload.turnId ?? 0);
  const expectedPhase = String(payload.phase ?? "");
  if (expectedTurnId && expectedTurnId !== currentTurnId()) {
    return { ok: false, stale: true, reason: "Turn state changed before this action reached the GM. Refresh and try again." };
  }
  if (expectedPhase && expectedPhase !== currentTurnPhase()) {
    return { ok: false, stale: true, reason: "Turn phase changed before this action reached the GM. Refresh and try again." };
  }
  return null;
}

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

function legacyRecoveryAttemptPlan(actor, conditionName = "") {
  const name = String(conditionName ?? "");
  const turnId = currentTurnId();
  const base = {
    ok: true,
    tracked: false,
    changed: false,
    reasonCode: "",
    turnId,
    conditionName: name,
    beforeConditions: [],
    afterConditions: []
  };
  if (!turnManagerEnabled()) return base;
  if (!actor) return { ...base, ok: false, reasonCode: "missing-actor" };

  const stored = actor.getFlag(SYSTEM_ID, RECOVERY_FLAG) ?? {};
  const beforeConditions = Number(stored.turnId ?? 0) === turnId && Array.isArray(stored.conditions)
    ? [...stored.conditions].map(String)
    : [];
  const afterConditions = [...beforeConditions];
  if (!afterConditions.includes(name)) afterConditions.push(name);

  return {
    ...base,
    tracked: true,
    changed: afterConditions.length !== beforeConditions.length,
    beforeConditions,
    afterConditions
  };
}

async function applyRecoveryAttemptPlan(actor, plan) {
  if (!plan?.ok || !plan?.tracked) return plan;
  await actor.setFlag(SYSTEM_ID, RECOVERY_FLAG, {
    turnId: plan.turnId,
    conditions: [...(plan.afterConditions ?? [])]
  });
  refreshTurnSheets();
  return plan;
}

async function markRecoveryAttemptLocal(actor, conditionName, { requester = game.user } = {}) {
  if (turnManagerEnabled() && (!actor || !requesterCanControlActor(requester, actor))) return [];
  const legacyPlan = legacyRecoveryAttemptPlan(actor, conditionName);
  const services = createM7Services();
  const sessionState = legacySessionSnapshot();
  const ref = participantActorReference(actor);
  const actorState = sessionState.actors.find(entry => entry.ref === ref) ?? sessionState.actors.find(entry => entry.id === actor?.id) ?? {};

  const plan = evaluateM7RecoveryAttemptLiveHandoff({
    actorId: actor?.id ?? "",
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planRecoveryAttempt({
      actor,
      actorState,
      conditionName,
      sessionState
    })
  });

  if (!plan.ok) return [];
  await applyRecoveryAttemptPlan(actor, plan);
  return [...(plan.afterConditions ?? [])];
}

export async function markRecoveryAttempt(actor, conditionName) {
  if (game.user?.isGM) return markRecoveryAttemptLocal(actor, conditionName, { requester: game.user });
  const result = await requestTurnAuthority("MARK_RECOVERY", {
    actorRef: participantActorReference(actor),
    conditionName: String(conditionName ?? ""),
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
  if (!result?.ok) {
    if (result?.reason) ui.notifications.warn(`Realm Guard: ${result.reason}`);
    return [];
  }
  return Array.isArray(result.conditions) ? result.conditions : [];
}

function legacyTraitCheckAwardPlan(actor, amount = 1) {
  const phase = currentTurnPhase();
  const requested = Math.max(0, Math.min(2, Math.floor(Number(amount ?? 0))));
  const before = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  const maximum = Math.max(before, Number(actor?.system?.resources?.checks?.max ?? 9));
  const base = { ok: false, reasonCode: "", phase, requested, earned: 0, before, after: before, maximum, turnId: currentTurnId() };
  if (!turnManagerEnabled() || phase !== "gm") return { ...base, ok: true };
  if (!actor) return { ...base, reasonCode: "missing-actor" };
  const after = Math.min(maximum, before + requested);
  return { ...base, ok: true, earned: Math.max(0, after - before), after };
}

async function applyTraitCheckAwardPlan(actor, plan = {}) {
  if (!plan?.ok) return plan;
  if (actor && Number(plan.earned ?? 0) > 0) await actor.update({ "system.resources.checks.value": Math.max(0, Number(plan.after ?? 0)) });
  return plan;
}

async function awardTraitChecksLocal(actor, amount = 1, { requester = game.user } = {}) {
  if (turnManagerEnabled() && currentTurnPhase() === "gm" && (!actor || !requesterCanControlActor(requester, actor))) {
    return { ok: false, reason: actor ? `You do not control ${actor.name}.` : "Missing Ranger." };
  }
  const legacy = legacyTraitCheckAwardPlan(actor, amount);
  const sessionState = legacySessionSnapshot();
  const services = createM7Services();
  const plan = evaluateM7TraitCheckAwardLiveHandoff({
    actorId: actor?.id ?? "",
    legacy,
    corePlan: () => services.sessionEngine.planTraitCheckAward({ actor, amount, sessionState })
  });
  if (!plan?.ok) {
    const reason = plan?.reasonCode === "missing-actor" ? "Missing Ranger." : "Trait Against Check award is not available.";
    return { ...plan, reason };
  }
  return applyTraitCheckAwardPlan(actor, plan);
}

export async function awardTraitChecks(actor, amount = 1) {
  if (game.user?.isGM) return awardTraitChecksLocal(actor, amount, { requester: game.user });
  return requestTurnAuthority("AWARD_TRAIT_CHECKS", {
    actorRef: participantActorReference(actor),
    amount: Math.max(0, Math.min(2, Math.floor(Number(amount ?? 0)))),
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
}

function legacyRecoverySpendPlan(actor, conditionName = "") {
  const before = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  const phase = currentTurnPhase();
  const base = {
    ok: false,
    reasonCode: "",
    phase,
    source: "",
    cost: 0,
    before,
    after: before,
    turnId: currentTurnId(),
    conditionName: String(conditionName ?? "")
  };

  if (!turnManagerEnabled() || phase !== "gm") return { ...base, ok: true, source: "no-gm-recovery-cost" };
  if (!actor) return { ...base, reasonCode: "missing-actor" };
  if (before < 2) return { ...base, reasonCode: "insufficient-checks" };
  return { ...base, ok: true, source: "gm-checks", cost: 2, after: before - 2 };
}

function recoverySpendReason(plan, actor) {
  if (plan?.reasonCode === "insufficient-checks") return `GM Turn recovery costs 2 Checks; ${actor?.name ?? "Ranger"} has ${plan.before ?? 0}.`;
  if (plan?.reasonCode === "missing-actor") return "Missing Ranger.";
  return "Recovery Checks could not be spent.";
}

async function applyRecoverySpendPlan(actor, plan) {
  if (!plan?.ok || Number(plan.cost ?? 0) <= 0) return plan;
  if (Number(plan.before ?? 0) !== Number(plan.after ?? 0)) {
    await actor.update({ "system.resources.checks.value": Number(plan.after ?? 0) });
  }
  return plan;
}

async function spendRecoveryChecksLocal(actor, conditionName = "", { requester = game.user } = {}) {
  if (turnManagerEnabled() && currentTurnPhase() === "gm" && (!actor || !requesterCanControlActor(requester, actor))) {
    return { ok: false, reason: actor ? `You do not control ${actor.name}.` : "Missing Ranger." };
  }

  const legacyPlan = legacyRecoverySpendPlan(actor, conditionName);
  const services = createM7Services();
  const sessionState = legacySessionSnapshot();
  const plan = evaluateM7RecoverySpendLiveHandoff({
    actorId: actor?.id ?? "",
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planRecoverySpend({
      actor,
      conditionName,
      sessionState
    })
  });

  if (!plan.ok) return { ...plan, reason: recoverySpendReason(plan, actor) };
  await applyRecoverySpendPlan(actor, plan);
  return plan;
}

export async function spendRecoveryChecks(actor, conditionName = "") {
  if (game.user?.isGM) return spendRecoveryChecksLocal(actor, conditionName, { requester: game.user });
  return requestTurnAuthority("SPEND_RECOVERY_CHECKS", {
    actorRef: participantActorReference(actor),
    conditionName: String(conditionName ?? ""),
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
}

function legacyRecoveryRefundPlan(actor, receipt = {}) {
  const current = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  const expectedAfter = Math.max(0, Number(receipt?.after ?? 0));
  const restore = Math.max(expectedAfter, Number(receipt?.before ?? expectedAfter));
  const base = {
    ok: false,
    stale: false,
    reasonCode: "",
    refunded: 0,
    before: current,
    after: current,
    expectedAfter,
    restore,
    turnId: currentTurnId(),
    conditionName: String(receipt?.conditionName ?? "")
  };

  if (!actor) return { ...base, reasonCode: "missing-actor" };
  if (Number(receipt?.cost ?? 0) !== 2 || String(receipt?.phase ?? "") !== "gm") {
    return { ...base, reasonCode: "invalid-receipt" };
  }
  if (Number(receipt?.turnId ?? 0) !== currentTurnId() || currentTurnPhase() !== "gm") {
    return { ...base, stale: true, reasonCode: "stale-turn" };
  }
  if (current !== expectedAfter) return { ...base, reasonCode: "state-mismatch" };

  return { ...base, ok: true, refunded: restore - current, after: restore };
}

function recoveryRefundReason(plan) {
  if (plan?.reasonCode === "invalid-receipt") return "Invalid Recovery refund receipt.";
  if (plan?.reasonCode === "stale-turn") return "Turn state changed before the Recovery refund could be committed.";
  if (plan?.reasonCode === "state-mismatch") return "Recovery refund state no longer matches the original spend.";
  if (plan?.reasonCode === "missing-actor") return "Missing Ranger.";
  return "Recovery refund could not be committed.";
}

async function applyRecoveryRefundPlan(actor, plan) {
  if (!plan?.ok) return plan;
  if (Number(plan.before ?? 0) !== Number(plan.after ?? 0)) {
    await actor.update({ "system.resources.checks.value": Number(plan.after ?? 0) });
  }
  return plan;
}

async function refundRecoveryChecksLocal(actor, receipt = {}, { requester = game.user } = {}) {
  if (!actor || !requesterCanControlActor(requester, actor)) {
    return { ok: false, reason: actor ? `You do not control ${actor.name}.` : "Missing Ranger." };
  }

  const legacyPlan = legacyRecoveryRefundPlan(actor, receipt);
  const services = createM7Services();
  const sessionState = legacySessionSnapshot();
  const plan = evaluateM7RecoveryRefundLiveHandoff({
    actorId: actor?.id ?? "",
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planRecoveryRefund({
      actor,
      receipt,
      sessionState
    })
  });

  if (!plan.ok) return { ...plan, reason: recoveryRefundReason(plan) };
  await applyRecoveryRefundPlan(actor, plan);
  return plan;
}

export async function refundRecoveryChecks(actor, receipt = {}) {
  if (game.user?.isGM) return refundRecoveryChecksLocal(actor, receipt, { requester: game.user });
  return requestTurnAuthority("REFUND_RECOVERY_CHECKS", {
    actorRef: participantActorReference(actor),
    receipt: {
      phase: String(receipt?.phase ?? ""),
      cost: Number(receipt?.cost ?? 0),
      before: Number(receipt?.before ?? 0),
      after: Number(receipt?.after ?? 0),
      turnId: Number(receipt?.turnId ?? 0),
      conditionName: String(receipt?.conditionName ?? "")
    },
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
}

export function recoveryAttempts(actor) {
  if (!turnManagerEnabled()) return [];
  const stored = actor?.getFlag(SYSTEM_ID, RECOVERY_FLAG) ?? {};
  return Number(stored.turnId ?? 0) === currentTurnId() && Array.isArray(stored.conditions) ? [...stored.conditions] : [];
}

export { participantActors };

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

function legacyPlayerTurnClaimPlan(actor, { label = "Test", allowUntracked = false } = {}) {
  const checks = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  const base = { label, actorStatePatch: null, lastActorId: "" };
  if (!turnManagerEnabled()) return { ...base, ok: true, tracked: false, source: "free-play", cost: 0, before: checks, after: checks, reasonCode: "" };
  if (actor?.type !== "character") return { ...base, ok: true, tracked: false, source: "npc", cost: 0, before: checks, after: checks, reasonCode: "" };
  if (!actor || currentTurnPhase() !== "player") return { ...base, ok: true, tracked: false, source: "none", cost: 0, before: checks, after: checks, reasonCode: "" };
  if (allowUntracked) return { ...base, ok: true, tracked: false, source: "untracked", cost: 0, before: checks, after: checks, reasonCode: "" };

  const state = playerTurnState(actor);
  if (state.done) return { ...base, ok: false, tracked: false, source: "blocked", cost: 0, before: checks, after: checks, reasonCode: "done" };

  const activeActors = participantActors().filter(a => !playerTurnState(a).done);
  const solo = activeActors.length <= 1;
  if (!solo && lastPlayerTurnActorId() === actor.id) {
    return { ...base, ok: false, tracked: false, source: "blocked", cost: 0, before: checks, after: checks, reasonCode: "alternation" };
  }

  const actorStatePatch = {
    testsTaken: state.testsTaken + 1,
    freeUsed: state.freeUsed,
    checksSpent: state.checksSpent,
    done: false
  };

  if (!state.freeUsed) {
    actorStatePatch.freeUsed = true;
    return { ...base, ok: true, tracked: true, source: "free", cost: 0, before: checks, after: checks, reasonCode: "", actorStatePatch, lastActorId: actor.id };
  }

  if (checks < 1) return { ...base, ok: false, tracked: false, source: "blocked", cost: 0, before: checks, after: checks, reasonCode: "no-checks" };

  actorStatePatch.checksSpent += 1;
  return { ...base, ok: true, tracked: true, source: "check", cost: 1, before: checks, after: checks - 1, reasonCode: "", actorStatePatch, lastActorId: actor.id };
}

function playerTurnClaimReason(plan, actor) {
  if (plan?.reasonCode === "done") return `${actor.name} is marked Done for this Players' Turn.`;
  if (plan?.reasonCode === "alternation") return `${actor.name} cannot take two tests in a row. Let another patrol member act, pass a Check, or finish the turn.`;
  if (plan?.reasonCode === "no-checks") return `${actor.name} has used the free test and has no Checks left.`;
  return "The Players' Turn test could not be claimed.";
}

async function applyPlayerTurnClaimPlan(actor, plan) {
  if (!plan?.ok || !plan?.tracked) return plan;
  if (plan.source === "check") await actor.update({ "system.resources.checks.value": plan.after });
  await savePlayerTurnState(actor, plan.actorStatePatch ?? {});
  await game.settings.set(SYSTEM_ID, LAST_ACTOR_KEY, String(plan.lastActorId || actor.id));
  return plan;
}

async function claimPlayerTurnTestLocal(actor, { label = "Test", allowUntracked = false } = {}, { requester = game.user } = {}) {
  const legacyPlan = legacyPlayerTurnClaimPlan(actor, { label, allowUntracked });

  // Preserve Legacy Mixed permission behavior: only a tracked character claim in Players' Turn
  // requires ownership. Free Play, NPC, GM Turn and explicitly untracked tests remain untouched.
  if (legacyPlan.tracked || legacyPlan.reasonCode) {
    if (!requesterCanControlActor(requester, actor)) return { ok: false, reason: `You do not own ${actor.name}.` };
  }

  const services = createM7Services();
  const sessionState = legacySessionSnapshot();
  const ref = participantActorReference(actor);
  const actorState = sessionState.actors.find(entry => entry.ref === ref) ?? sessionState.actors.find(entry => entry.id === actor?.id) ?? {};

  const plan = evaluateM7PlayerTurnClaimLiveHandoff({
    actorId: actor?.id ?? "",
    label,
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planTestClaim({
      actor,
      actorState,
      sessionState,
      allowUntracked,
      label
    })
  });

  if (!plan.ok) return { ...plan, reason: playerTurnClaimReason(plan, actor) };
  await applyPlayerTurnClaimPlan(actor, plan);
  return plan;
}

export async function claimPlayerTurnTest(actor, { label = "Test", allowUntracked = false } = {}) {
  if (game.user?.isGM) return claimPlayerTurnTestLocal(actor, { label, allowUntracked }, { requester: game.user });
  return requestTurnAuthority("CLAIM_TEST", {
    actorRef: participantActorReference(actor),
    label,
    allowUntracked,
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
}

export function playerTurnSpendHtml(spend) {
  if (!spend?.tracked) return "";
  return spend.source === "free"
    ? `<p class="rg-chat-turn-spend"><b>Players' Turn:</b> Free Test used.</p>`
    : `<p class="rg-chat-turn-spend"><b>Players' Turn:</b> Check ${spend.before} → ${spend.after} (-1).</p>`;
}

function legacyCheckTransferPlan(donor, recipient, amount = 1) {
  const qty = Math.max(1, Math.floor(Number(amount || 1)));
  const donorChecks = Math.max(0, Number(donor?.system?.resources?.checks?.value ?? 0));
  const recipientChecks = Math.max(0, Number(recipient?.system?.resources?.checks?.value ?? 0));
  const base = {
    amount: qty,
    donorBefore: donorChecks,
    donorAfter: donorChecks,
    recipientBefore: recipientChecks,
    recipientAfter: recipientChecks,
    donorStatePatch: null,
    recipientStatePatch: null
  };

  if (!turnManagerEnabled()) return { ...base, ok: false, reasonCode: "turn-disabled" };
  if (currentTurnPhase() !== "player") return { ...base, ok: false, reasonCode: "wrong-phase" };
  if (!donor || !recipient || donor.id === recipient.id) return { ...base, ok: false, reasonCode: "invalid-participants" };
  if (donorChecks < qty) return { ...base, ok: false, reasonCode: "donor-insufficient" };
  if (recipientChecks > 0) return { ...base, ok: false, reasonCode: "recipient-has-checks" };

  const donorState = playerTurnState(donor);
  const recipientState = playerTurnState(recipient);
  return {
    ...base,
    ok: true,
    reasonCode: "",
    donorAfter: donorChecks - qty,
    recipientAfter: recipientChecks + qty,
    donorStatePatch: { donatedGiven: donorState.donatedGiven + qty },
    recipientStatePatch: { donatedReceived: recipientState.donatedReceived + qty, done: false }
  };
}

function checkTransferReason(plan, donor, recipient) {
  if (plan?.reasonCode === "turn-disabled") return "Turn Manager is disabled in this world.";
  if (plan?.reasonCode === "wrong-phase") return "Checks can be passed during the Players' Turn.";
  if (plan?.reasonCode === "invalid-participants") return "Choose two different patrol members.";
  if (plan?.reasonCode === "donor-insufficient") {
    const checks = Math.max(0, Number(plan?.donorBefore ?? 0));
    return `${donor?.name ?? "The Ranger"} only has ${checks} Check${checks === 1 ? "" : "s"}.`;
  }
  if (plan?.reasonCode === "recipient-has-checks") return `${recipient?.name ?? "The Ranger"} already has Checks. Passing Checks is for a patrol-mate who has none.`;
  return "The Check could not be passed.";
}

async function applyCheckTransferPlan(donor, recipient, plan) {
  if (!plan?.ok) return plan;
  await donor.update({ "system.resources.checks.value": plan.donorAfter });
  await recipient.update({ "system.resources.checks.value": plan.recipientAfter });
  await savePlayerTurnState(donor, plan.donorStatePatch ?? {});
  await savePlayerTurnState(recipient, plan.recipientStatePatch ?? {});

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: donor }),
    content: `<div class="realm-guard rg-turn-chat"><div class="rg-turn-chat-tag">PASSING THE CHECKS</div><h3>${esc(donor.name)} → ${esc(recipient.name)}</h3><p><b>${plan.amount} Check${plan.amount === 1 ? "" : "s"}</b> passed.</p></div>`
  });
  return plan;
}

async function donateCheckLocal(donor, recipient, amount = 1, { requester = game.user } = {}) {
  if (donor && !requesterCanControlActor(requester, donor)) return { ok: false, reason: `You do not control ${donor.name}.` };

  const legacyPlan = legacyCheckTransferPlan(donor, recipient, amount);
  const services = createM7Services();
  const sessionState = legacySessionSnapshot();
  const donorRef = participantActorReference(donor);
  const recipientRef = participantActorReference(recipient);
  const donorState = sessionState.actors.find(entry => entry.ref === donorRef) ?? sessionState.actors.find(entry => entry.id === donor?.id) ?? {};
  const recipientState = sessionState.actors.find(entry => entry.ref === recipientRef) ?? sessionState.actors.find(entry => entry.id === recipient?.id) ?? {};

  const plan = evaluateM7CheckTransferLiveHandoff({
    donorId: donor?.id ?? "",
    recipientId: recipient?.id ?? "",
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planCheckTransfer({
      donor,
      recipient,
      amount,
      donorState,
      recipientState,
      sessionState
    })
  });

  if (!plan.ok) return { ...plan, reason: checkTransferReason(plan, donor, recipient) };
  await applyCheckTransferPlan(donor, recipient, plan);
  return plan;
}


export async function donateCheck(donor, recipient, amount = 1) {
  if (game.user?.isGM) return donateCheckLocal(donor, recipient, amount, { requester: game.user });
  return requestTurnAuthority("DONATE_CHECK", {
    donorRef: participantActorReference(donor),
    recipientRef: participantActorReference(recipient),
    amount,
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
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
    content: `<div class="rg-pass-checks-dialog"><p><b>${esc(donor.name)}</b> has ${donorChecks} Check${donorChecks === 1 ? "" : "s"}.</p><label>Patrol-mate <select name="recipientId">${candidates.map(a => `<option value="${esc(participantActorReference(a))}">${esc(a.name)}</option>`).join("")}</select></label><label>Checks <input type="number" name="amount" min="1" max="${donorChecks}" value="1"></label><p><small>Checks may be passed to a patrol-mate who has none.</small></p></div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "pass", label: "Pass Check", icon: "fa-solid fa-share", default: true, callback: (_e, button) => ({ recipientId: button.form?.elements?.recipientId?.value, amount: Number(button.form?.elements?.amount?.value ?? 1) }) },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (!result) return;
  const donation = await donateCheck(donor, resolveParticipantActor(result.recipientId), result.amount);
  if (!donation.ok) ui.notifications.warn(`Realm Guard: ${donation.reason}`);
  else ui.notifications.info("Realm Guard: Check passed.");
}

function legacyFinishPlayerPlan(actor) {
  const checks = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
  const base = {
    ok: false,
    reasonCode: "",
    checksBefore: checks,
    checksAfter: checks,
    discarded: 0,
    actorStatePatch: null
  };

  if (!turnManagerEnabled()) return { ...base, reasonCode: "turn-disabled" };
  if (!actor) return { ...base, reasonCode: "missing-actor" };
  if (currentTurnPhase() !== "player") return { ...base, reasonCode: "wrong-phase" };

  const state = playerTurnState(actor);
  return {
    ...base,
    ok: true,
    checksAfter: 0,
    discarded: checks,
    actorStatePatch: {
      done: true,
      freeUsed: state.freeUsed,
      testsTaken: state.testsTaken,
      checksSpent: state.checksSpent,
      donatedGiven: state.donatedGiven,
      donatedReceived: state.donatedReceived
    }
  };
}

function finishPlayerReason(plan) {
  if (plan?.reasonCode === "turn-disabled") return "Turn Manager is disabled in this world.";
  if (plan?.reasonCode === "missing-actor") return "The Ranger for this Done action is no longer available.";
  if (plan?.reasonCode === "wrong-phase") return "Rangers can be marked Done during the Players' Turn.";
  return "The Ranger could not be marked Done.";
}

async function applyFinishPlayerPlan(actor, plan) {
  if (!plan?.ok) return plan;
  if (plan.checksBefore !== plan.checksAfter) {
    await actor.update({ "system.resources.checks.value": plan.checksAfter });
  }
  await savePlayerTurnState(actor, plan.actorStatePatch ?? { done: true });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="realm-guard rg-turn-chat"><div class="rg-turn-chat-tag">PLAYERS' TURN</div><p><b>${esc(actor.name)}</b> is Done.${plan.discarded ? ` ${plan.discarded} unused Check${plan.discarded === 1 ? "" : "s"} discarded.` : ""}</p></div>`
  });
  return plan;
}

async function finishPlayerLocal(actor, { requester = game.user } = {}) {
  if (actor && !requesterCanControlActor(requester, actor)) return { ok: false, reason: `You do not control ${actor.name}.` };

  const legacyPlan = legacyFinishPlayerPlan(actor);
  const services = createM7Services();
  const sessionState = legacySessionSnapshot();
  const ref = participantActorReference(actor);
  const actorState = sessionState.actors.find(entry => entry.ref === ref) ?? sessionState.actors.find(entry => entry.id === actor?.id) ?? {};

  const plan = evaluateM7FinishPlayerLiveHandoff({
    actorId: actor?.id ?? "",
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planFinishPlayer({
      actor,
      actorState,
      sessionState
    })
  });

  if (!plan.ok) return { ...plan, reason: finishPlayerReason(plan) };
  await applyFinishPlayerPlan(actor, plan);
  return plan;
}


export async function finishPlayer(actor) {
  if (game.user?.isGM) return finishPlayerLocal(actor, { requester: game.user });
  return requestTurnAuthority("FINISH_PLAYER", {
    actorRef: participantActorReference(actor),
    turnId: currentTurnId(),
    phase: currentTurnPhase()
  });
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

function legacyPhaseChangePlan(targetPhase = "gm") {
  const state = legacySessionSnapshot();
  const toPhase = targetPhase === "player" ? "player" : "gm";
  const fromPhase = state.phase;
  const base = {
    ok: false,
    changed: false,
    reasonCode: "",
    fromPhase,
    toPhase,
    previousTurnCycleId: state.turnCycleId,
    turnCycleId: state.turnCycleId,
    lastActorId: state.lastActorId,
    discardedChecks: [],
    actorCheckPatches: []
  };

  if (!state.enabled) return { ...base, reasonCode: "turn-disabled" };
  if (fromPhase === toPhase) return { ...base, ok: true };

  const discardChecks = fromPhase === "player" && toPhase === "gm";
  const actorCheckPatches = discardChecks
    ? state.actors
      .filter(entry => Math.max(0, Number(entry?.checks ?? 0)) > 0)
      .map(entry => ({
        id: String(entry?.id ?? ""),
        ref: String(entry?.ref ?? ""),
        name: String(entry?.name ?? ""),
        before: Math.max(0, Number(entry?.checks ?? 0)),
        after: 0
      }))
    : [];

  return {
    ...base,
    ok: true,
    changed: true,
    turnCycleId: state.turnCycleId + 1,
    lastActorId: "",
    actorCheckPatches,
    discardedChecks: actorCheckPatches.map(entry => `${entry.name}: ${entry.before}`)
  };
}

async function applyPhaseChangePlan(plan) {
  if (!plan?.ok || !plan?.changed) return plan;

  for (const patch of plan.actorCheckPatches ?? []) {
    const actor = resolveParticipantActor(patch.ref || patch.id);
    if (!actor) continue;
    const current = Math.max(0, Number(actor.system.resources?.checks?.value ?? 0));
    if (current !== Number(patch.after ?? 0)) {
      await actor.update({ "system.resources.checks.value": Number(patch.after ?? 0) });
    }
  }

  await game.settings.set(SYSTEM_ID, PHASE_KEY, plan.toPhase);
  await game.settings.set(SYSTEM_ID, TURN_ID_KEY, plan.turnCycleId);
  await game.settings.set(SYSTEM_ID, LAST_ACTOR_KEY, plan.lastActorId ?? "");
  refreshTurnSheets();

  observeM7Lifecycle("PHASE_CHANGED", {
    source: plan?.m7?.phaseAuthority === "CORE_M7" ? "CORE_M7_PHASE_HANDOFF" : "LEGACY_TURN_MANAGER",
    fromPhase: plan.fromPhase,
    toPhase: plan.toPhase,
    previousTurnCycleId: plan.previousTurnCycleId,
    turnCycleId: plan.turnCycleId,
    discardedChecks: Object.freeze([...(plan.discardedChecks ?? [])])
  });

  return plan;
}

export async function setTurnPhase(phase) {
  if (!turnManagerEnabled()) return false;
  if (!game.user.isGM) return false;

  const normalized = phase === "player" ? "player" : "gm";
  const legacyPlan = legacyPhaseChangePlan(normalized);
  const services = createM7Services();
  const sessionState = legacySessionSnapshot();

  const plan = evaluateM7PhaseChangeLiveHandoff({
    targetPhase: normalized,
    legacy: legacyPlan,
    corePlan: () => services.sessionEngine.planPhaseChange({
      targetPhase: normalized,
      sessionState
    })
  });

  if (!plan.ok) return false;
  if (!plan.changed) return true;

  await applyPhaseChangePlan(plan);
  const discarded = [...(plan.discardedChecks ?? [])];

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
  return actors.map(actor => `<option value="${esc(participantActorReference(actor))}">${esc(actor.name)}</option>`).join("");
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
    const donation = await donateCheck(resolveParticipantActor(result.donorId), resolveParticipantActor(result.recipientId), result.amount);
    if (!donation.ok) ui.notifications.warn(`Realm Guard: ${donation.reason}`);
    else ui.notifications.info("Realm Guard: Check passed.");
    return openTurnManager();
  }
  if (result.action === "finish") {
    const actor = resolveParticipantActor(result.actorId);
    if (actor) await finishPlayer(actor);
    return openTurnManager();
  }
}

export function installTurnManager() {
  registerTurnSettings();
  installTurnAuthorityBridge({
    MARK_RECOVERY: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const actor = resolveParticipantActor(payload.actorRef);
      if (!actor) return { ok: false, reason: "The Ranger for this Recovery action is no longer available." };
      if (!requesterCanControlActor(requester, actor)) return { ok: false, reason: `You do not control ${actor.name}.` };
      const conditions = await markRecoveryAttemptLocal(actor, payload.conditionName, { requester });
      return { ok: true, conditions };
    },
    AWARD_TRAIT_CHECKS: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const actor = resolveParticipantActor(payload.actorRef);
      if (!actor) return { ok: false, reason: "The Ranger for this Trait Against award is no longer available." };
      return awardTraitChecksLocal(actor, payload.amount, { requester });
    },
    SPEND_RECOVERY_CHECKS: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const actor = resolveParticipantActor(payload.actorRef);
      if (!actor) return { ok: false, reason: "The Ranger for this Recovery spend is no longer available." };
      return spendRecoveryChecksLocal(actor, payload.conditionName, { requester });
    },
    REFUND_RECOVERY_CHECKS: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const actor = resolveParticipantActor(payload.actorRef);
      if (!actor) return { ok: false, reason: "The Ranger for this Recovery refund is no longer available." };
      return refundRecoveryChecksLocal(actor, payload.receipt ?? {}, { requester });
    },
    CLAIM_TEST: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const actor = resolveParticipantActor(payload.actorRef);
      if (!actor) return { ok: false, reason: "The Ranger for this Turn action is no longer available." };
      return claimPlayerTurnTestLocal(actor, { label: payload.label, allowUntracked: Boolean(payload.allowUntracked) }, { requester });
    },
    DONATE_CHECK: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const donor = resolveParticipantActor(payload.donorRef);
      const recipient = resolveParticipantActor(payload.recipientRef);
      if (!donor || !recipient) return { ok: false, reason: "A Ranger for this Check transfer is no longer available." };
      return donateCheckLocal(donor, recipient, payload.amount, { requester });
    },
    FINISH_PLAYER: async (payload, { requester } = {}) => {
      const stale = staleTurnAuthorityRequest(payload);
      if (stale) return stale;
      const actor = resolveParticipantActor(payload.actorRef);
      if (!actor) return { ok: false, reason: "The Ranger for this Done action is no longer available." };
      return finishPlayerLocal(actor, { requester });
    }
  });
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
