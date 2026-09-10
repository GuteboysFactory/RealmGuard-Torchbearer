const NS = "realm-guard";
const CHANNEL = `system.${NS}`;
const requests = new Map();
const gmDialogs = new Map();

export const OBSTACLE_MODES = {
  baseline: "Automatic - use Baseline for ordinary rolls",
  approval: "GM approval - confirm each ordinary roll",
  manual: "Manual - set Obstacle in each roll"
};

export const OBSTACLE_MODE_HELP = {
  baseline: {
    title: "Automatic Baseline",
    text: "New ordinary rolls start at the Baseline Obstacle. While a Baseline-linked roll is open, Change Live Roll OB can push a temporary Ob to that open roll. If the roll's Ob is edited manually, it stops following Live OB."
  },
  approval: {
    title: "GM Approval",
    text: "New ordinary rolls start at the Baseline Obstacle and send a non-modal approval request to an active GM. The GM can raise or lower the Ob, preview the change for the player and approve it before the roll resolves."
  },
  manual: {
    title: "Manual per Roll",
    text: "Ordinary rolls do not follow the Baseline/Live workflow. The Obstacle is set directly in each Roll Dialog. Use this when the table wants maximum per-roll flexibility."
  }
};

export function baselineObstacle() {
  return Math.max(0, Math.min(10, Number(game.settings.get(NS, "baselineObstacle") ?? 2)));
}

export function liveRollObstacle() {
  return Math.max(0, Math.min(10, Number(game.settings.get(NS, "liveRollObstacle") ?? baselineObstacle())));
}

export function obstacleMode() {
  return String(game.settings.get(NS, "obstacleMode") ?? "baseline");
}

export async function setBaselineObstacle(value) {
  if (!game.user?.isGM) return false;
  const next = Math.max(0, Math.min(10, Math.trunc(Number(value ?? 2))));
  await game.settings.set(NS, "baselineObstacle", next);
  return true;
}

function updateOpenLiveRolls(value, { sourceLabel = "GM Live" } = {}) {
  const next = Math.max(0, Math.min(10, Math.trunc(Number(value ?? baselineObstacle()))));
  for (const root of document.querySelectorAll('[data-rg-obstacle-live-linked="true"]')) {
    const input = root.querySelector('input[name="obstacle"]');
    if (input) input.value = String(next);
    root.dataset.rgObstacleSource = "gm-live";
    const status = root.querySelector('[data-rg-obstacle-live-status]');
    if (status) status.innerHTML = `<i class="fa-solid fa-bolt"></i> Ob ${next} · ${sourceLabel}`;
    const guide = root.querySelector('[data-rg-obstacle-guide]');
    if (guide) guide.textContent = obstacleDifficultyText(next);
  }
}

export async function setLiveRollObstacle(value, { broadcast = true } = {}) {
  if (!game.user?.isGM) return false;
  const next = Math.max(0, Math.min(10, Math.trunc(Number(value ?? baselineObstacle()))));
  await game.settings.set(NS, "liveRollObstacle", next);
  updateOpenLiveRolls(next);
  if (broadcast) game.socket.emit(CHANNEL, { type: "obstacle-live", obstacle: next, senderId: game.user.id });
  return true;
}

export async function resetLiveRollObstacle() {
  return setLiveRollObstacle(baselineObstacle());
}

export async function setObstacleMode(value) {
  if (!game.user?.isGM || !Object.hasOwn(OBSTACLE_MODES, value)) return false;
  await game.settings.set(NS, "obstacleMode", value);
  return true;
}

export function obstacleDifficultyText(ob) {
  const n = Math.max(0, Math.trunc(Number(ob ?? 0)));
  if (n <= 0) return "Ob 0 · special/independent test; use only when a rule calls for it.";
  if (n === 1) return "Ob 1 · easily overcome by one Ranger.";
  if (n === 2) return "Ob 2 · routine Guard work with some risk.";
  if (n === 3) return "Ob 3 · challenging; Help may be useful.";
  if (n === 4) return "Ob 4 · hard; teamwork is often needed.";
  if (n === 5) return "Ob 5 · very difficult; dedicated teamwork or Nature may be needed.";
  return `Ob ${n} · extreme circumstances; obstacles this high should be rare.`;
}

function activeGmId() {
  return game.users?.filter?.(u => u.active && u.isGM)?.sort?.((a,b) => String(a.id).localeCompare(String(b.id)))?.[0]?.id ?? null;
}

function updatePlayerPreview(message) {
  const request = requests.get(message.requestId);
  if (!request) return;
  const ob = Math.max(0, Math.min(10, Number(message.obstacle ?? request.obstacle)));
  request.obstacle = ob;
  const input = document.querySelector(`[data-rg-obstacle-request="${CSS.escape(message.requestId)}"] input[name="obstacle"]`);
  if (input) input.value = String(ob);
  const status = document.querySelector(`[data-rg-obstacle-request="${CSS.escape(message.requestId)}"] [data-rg-obstacle-status]`);
  if (status) {
    status.classList.toggle("approved", message.type === "obstacle-approved");
    status.innerHTML = message.type === "obstacle-approved"
      ? `<i class="fa-solid fa-circle-check"></i> GM approved Ob ${ob}`
      : `<i class="fa-solid fa-wand-magic-sparkles"></i> GM reviewing · current Ob ${ob}`;
  }
  const guide = document.querySelector(`[data-rg-obstacle-request="${CSS.escape(message.requestId)}"] [data-rg-obstacle-guide]`);
  if (guide) guide.textContent = obstacleDifficultyText(ob);
  if (message.type === "obstacle-approved") {
    request.approved = true;
    request.resolve?.(ob);
  }
}

function emitPreview(requestId, obstacle, approved = false) {
  game.socket.emit(CHANNEL, {
    type: approved ? "obstacle-approved" : "obstacle-preview",
    requestId,
    obstacle,
    senderId: game.user.id
  });
}

function openGmObstacleRequest(message) {
  if (!game.user?.isGM || message.targetGmId !== game.user.id || gmDialogs.has(message.requestId)) return;
  const DialogV2 = foundry.applications.api.DialogV2;
  const esc = foundry.utils.escapeHTML;
  const current = Math.max(0, Math.min(10, Number(message.obstacle ?? baselineObstacle())));
  let lastValue = current;
  const content = `<div class="rg-obstacle-gm-request" data-rg-obstacle-gm="${esc(message.requestId)}">
    <div class="rg-obstacle-request-head"><b>${esc(message.actorName || "Ranger")}</b><span>wants to test <strong>${esc(message.testName || "Ability / Skill")}</strong></span></div>
    <p class="rg-obstacle-request-note">Confirm the difficulty without interrupting the player's roll preparation.</p>
    <div class="rg-obstacle-stepper"><button type="button" data-ob-down title="Lower Obstacle">−</button><input type="number" min="0" max="10" value="${current}" data-ob-value><button type="button" data-ob-up title="Raise Obstacle">+</button></div>
    <small data-ob-guide>${esc(obstacleDifficultyText(current))}</small>
    <button type="button" class="rg-obstacle-approve" data-ob-approve><i class="fa-solid fa-check"></i> Approve Ob <span>${current}</span></button>
  </div>`;
  const dialog = new DialogV2({
    window: { title: "Realm Guard · Obstacle Request", resizable: true },
    content,
    modal: false,
    buttons: [{
      action: "approve-current",
      label: "Use current Ob",
      icon: "fa-solid fa-check",
      callback: () => {
        emitPreview(message.requestId, lastValue, true);
        gmDialogs.delete(message.requestId);
        return true;
      }
    }]
  });
  gmDialogs.set(message.requestId, dialog);
  dialog.render(true);
  setTimeout(() => {
    const root = document.querySelector(`[data-rg-obstacle-gm="${CSS.escape(message.requestId)}"]`);
    if (!root) return;
    const input = root.querySelector("[data-ob-value]");
    const guide = root.querySelector("[data-ob-guide]");
    const approveLabel = root.querySelector("[data-ob-approve] span");
    const apply = value => {
      const next = Math.max(0, Math.min(10, Math.trunc(Number(value ?? input.value ?? current))));
      lastValue = next;
      input.value = String(next);
      guide.textContent = obstacleDifficultyText(next);
      if (approveLabel) approveLabel.textContent = String(next);
      emitPreview(message.requestId, next, false);
    };
    root.querySelector("[data-ob-down]")?.addEventListener("click", () => apply(Number(input.value) - 1));
    root.querySelector("[data-ob-up]")?.addEventListener("click", () => apply(Number(input.value) + 1));
    input?.addEventListener("change", () => apply(input.value));
    root.querySelector("[data-ob-approve]")?.addEventListener("click", async () => {
      const next = Math.max(0, Math.min(10, Math.trunc(Number(input.value ?? current))));
      emitPreview(message.requestId, next, true);
      gmDialogs.delete(message.requestId);
      await dialog.close();
    });
    emitPreview(message.requestId, current, false);
  }, 50);
}

export function beginObstacleReview({ actorName = "Ranger", testName = "Test", obstacle = null } = {}) {
  if (game.user?.isGM || obstacleMode() !== "approval") return null;
  const targetGmId = activeGmId();
  if (!targetGmId) {
    ui.notifications.warn("Realm Guard: No active GM is available to approve the Obstacle. Using the current Baseline Obstacle.");
    return null;
  }
  const requestId = foundry.utils.randomID();
  const initial = Math.max(0, Math.min(10, Number(obstacle ?? baselineObstacle())));
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  requests.set(requestId, { obstacle: initial, approved: false, resolve });
  game.socket.emit(CHANNEL, { type: "obstacle-request", requestId, actorName, testName, obstacle: initial, targetGmId, senderId: game.user.id });
  setTimeout(() => {
    const pending = requests.get(requestId);
    if (!pending || pending.approved) return;
    pending.approved = true;
    pending.resolve?.(pending.obstacle);
    ui.notifications.warn(`Realm Guard: Obstacle approval timed out; using the current Ob ${pending.obstacle}.`);
  }, 60000);
  return { requestId, initial, promise };
}

export function obstacleReviewValue(requestId, fallback = 0) {
  return Math.max(0, Math.min(10, Number(requests.get(requestId)?.obstacle ?? fallback)));
}

export function finishObstacleReview(requestId) {
  if (requestId) requests.delete(requestId);
}

export function installObstacleWorkflow() {
  game.settings.register(NS, "baselineObstacle", {
    name: "Baseline Obstacle",
    hint: "Default Obstacle for new ordinary tests. The default for a new world is Ob 2.",
    scope: "world",
    config: false,
    type: Number,
    default: 2
  });
  game.settings.register(NS, "liveRollObstacle", {
    name: "Change Live Roll OB",
    hint: "GM live value pushed to currently open Baseline-linked ordinary Roll Dialogs. New rolls still begin at Baseline Obstacle.",
    scope: "world",
    config: false,
    type: Number,
    default: 2
  });
  game.settings.register(NS, "obstacleMode", {
    name: "Obstacle Workflow",
    hint: "Choose whether ordinary tests use the baseline automatically, wait for GM approval, or stay manual per roll.",
    scope: "world",
    config: false,
    type: String,
    choices: OBSTACLE_MODES,
    default: "baseline"
  });
  Hooks.once("ready", () => {
    document.addEventListener("change", event => {
      const input = event.target?.closest?.('[data-rg-obstacle-live-linked="true"] input[name="obstacle"]');
      if (!input) return;
      const dialogRoot = input.closest('[data-rg-obstacle-live-linked="true"]');
      if (!dialogRoot) return;
      dialogRoot.dataset.rgObstacleLiveLinked = "false";
      dialogRoot.dataset.rgObstacleSource = "manual";
      const status = dialogRoot.querySelector('[data-rg-obstacle-live-status]');
      if (status) status.innerHTML = `<i class="fa-solid fa-pen"></i> Ob ${Math.max(0, Number(input.value || 0))} · Manual override`;
    });
    game.socket.on(CHANNEL, message => {
      if (!message?.type?.startsWith?.("obstacle-")) return;
      if (message.type === "obstacle-live") return updateOpenLiveRolls(message.obstacle);
      if (message.type === "obstacle-request") return openGmObstacleRequest(message);
      if (["obstacle-preview", "obstacle-approved"].includes(message.type)) updatePlayerPreview(message);
    });
  });
}
