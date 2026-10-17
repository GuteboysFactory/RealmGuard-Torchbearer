import { isTb2eBeta } from "./tb2e-beta-policy.mjs";
import { registerGmDockTool } from "./gm-dock.mjs";
import { participantActors } from "./session-participants.mjs";
import { tb2eGrindTurnPlan, tb2eCampEntryPlan } from "./m10d-tb2e-session-shadow.mjs";
import { tb2eStandardRecoveryPlan } from "./m10d-tb2e-recovery-shadow.mjs";
import { setConditionActive } from "./conditions.mjs";

const NS = "realm-guard", KEY = "tb2eBetaSession";
const recovering = new Set();
export function tb2eSessionState() { return game.settings.get(NS, KEY) ?? { phase: "ADVENTURE", turn: 1, cycle: 1 }; }

export async function openTb2eSession() {
  if (!isTb2eBeta() || !game.user.isGM) return;
  const state = tb2eSessionState();
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "TB2E - Adventure / Camp / Town", resizable: true }, position: { width: 620 }, rejectClose: false,
    content: `<form class="realm-guard"><h2>${state.phase} - Turn ${state.turn}</h2><p>The GM records one turn after a completed test or conflict. Free Instinct actions cost no turn; Exhausted Instinct actions cost one turn and +1 Ob.</p><p>Every fourth adventure turn, apply the next Grind condition using the existing condition controls: Hungry &amp; Thirsty, Exhausted, Angry, Sick, Injured, Afraid, Dead. Fresh is lost when an adverse condition is gained. Death remains a GM decision.</p><label>Phase <select name="phase">${["ADVENTURE", "CAMP", "TOWN"].map(p => `<option ${p === state.phase ? "selected" : ""}>${p}</option>`).join("")}</select></label><p>Camp requires at least one party Check. Recovery in camp costs one Check. Town accommodations, lifestyle costs and events are recorded by the GM during this beta; leaving town requires the appropriate Resources test.</p></form>`,
    buttons: [
      ...(state.phase === "ADVENTURE" ? [{ action: "turn", label: "Record completed turn", callback: () => ({ action: "turn" }) }] : []),
      { action: "phase", label: "Change phase", callback: (_event, button) => ({ action: "phase", phase: button.form.elements.phase.value }) },
      { action: "close", label: "Close", default: true, callback: () => null }
    ]
  });
  if (!result || !isTb2eBeta()) return;
  const current = tb2eSessionState();
  if (JSON.stringify(current) !== JSON.stringify(state)) return ui.notifications.warn("Session changed. Reopen the panel.");
  if (result.action === "turn") {
    const plan = tb2eGrindTurnPlan({ actionType: "TEST" });
    await game.settings.set(NS, KEY, { ...state, turn: state.turn + plan.turnCostPreview });
    if (state.turn % 4 === 0) ui.notifications.warn("Grind: apply the next condition to the party using the condition controls.");
  } else if (result.phase !== state.phase) {
    let turn = state.turn;
    if (result.phase === "CAMP") {
      const checks = participantActors().reduce((sum, actor) => sum + Number(actor.system.resources.checks.value ?? 0), 0);
      const plan = tb2eCampEntryPlan({ partyChecks: checks });
      if (!plan.canCamp) return ui.notifications.warn("At least one party member needs a Check to enter camp.");
      turn = plan.turnCounterResetPreview;
    }
    await game.settings.set(NS, KEY, { phase: result.phase, turn, cycle: state.cycle + 1 });
  }
  return openTb2eSession();
}

export async function recoverTb2eCondition(actor, condition) {
  if (!isTb2eBeta() || !condition?.system?.active || recovering.has(actor.uuid)) return;
  if (!actor.isOwner) return ui.notifications.warn("You must own this character.");
  const state = tb2eSessionState();
  if (condition.name === "Hungry & Thirsty") return ui.notifications.info("Resolve food and drink with the GM, then clear Hungry & Thirsty using the condition toggle. This is not a Resources Ob 1 recovery test.");
  const attempts = actor.getFlag(NS, "tb2eRecoveryAttempts") ?? {};
  const plan = tb2eStandardRecoveryPlan({ condition: condition.name, phase: state.phase, attemptedThisPhase: attempts[condition.id] === state.cycle });
  if (!plan.ok) return ui.notifications.warn(plan.reasonCode.replaceAll("_", " "));
  const order = ["Hungry & Thirsty", "Angry", "Afraid", "Exhausted"];
  const rank = order.indexOf(condition.name);
  const blockers = rank < 0 ? order : order.slice(0, rank);
  const blocker = actor.conditions.find(item => item.system.active && blockers.includes(item.name));
  if (blocker) return ui.notifications.warn(`Recover ${blocker.name} first.`);
  const checks = Number(actor.system.resources.checks.value ?? 0);
  if (checks < plan.campCheckCost) return ui.notifications.warn("Recovery in camp requires one Check.");
  const confirmed = await foundry.applications.api.DialogV2.confirm({ window: { title: "TB2E Recovery" }, content: `<p>${condition.name}: ${plan.ability} Ob ${plan.obstacle}. ${plan.campCheckCost ? "Costs 1 Check." : "GM records the town accommodation allowance or lifestyle cost."} One attempt per condition per phase.</p>` });
  if (!confirmed || recovering.has(actor.uuid)) return;
  if (JSON.stringify(tb2eSessionState()) !== JSON.stringify(state)) return ui.notifications.warn("Phase changed. Reopen recovery.");
  if (!condition.system.active || Number(actor.system.resources.checks.value) !== checks || actor.getFlag(NS, "tb2eRecoveryAttempts")?.[condition.id] === state.cycle) return ui.notifications.warn("Character state changed. Reopen recovery.");
  recovering.add(actor.uuid);
  let spent = false, result;
  try {
    if (plan.campCheckCost) { await actor.update({ "system.resources.checks.value": checks - plan.campCheckCost }); spent = true; }
    result = await actor.rollAbility(plan.ability.toLowerCase(), { obstacle: plan.obstacle });
    if (!result || typeof result.passed !== "boolean") { result = null; return; }
    await actor.setFlag(NS, "tb2eRecoveryAttempts", { ...attempts, [condition.id]: state.cycle });
    if (result.passed) await setConditionActive(actor, condition, false);
  } finally {
    if (spent && !result) await actor.update({ "system.resources.checks.value": Number(actor.system.resources.checks.value) + plan.campCheckCost });
    recovering.delete(actor.uuid);
  }
  return result;
}

export function installTb2eBetaSession() {
  game.settings.register(NS, KEY, { scope: "world", config: false, type: Object, default: { phase: "ADVENTURE", turn: 1, cycle: 1 } });
  registerGmDockTool({ id: "tb2e-beta-session", icon: "fa-solid fa-dungeon", tooltip: "TB2E Adventure / Camp / Town", order: 35, visible: () => isTb2eBeta(), onClick: openTb2eSession });
}
