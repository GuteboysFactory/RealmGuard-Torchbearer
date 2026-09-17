import { createM7Services, legacySessionSnapshot } from "./core/m7-session-services.mjs";

const HISTORY_LIMIT = 120;
const history = [];
let installed = false;

function push(event) {
  const row = Object.freeze({
    at: Date.now(),
    phase: "M7",
    buildScope: "SESSION_ENGINE_FOUNDATION",
    mode: "SHADOW_READ_ONLY",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    ...event
  });
  history.push(row);
  if (history.length > HISTORY_LIMIT) history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7SessionShadow", row); } catch (_error) { /* observer only */ }
  return row;
}

function snapshotEvent(services) {
  const snapshot = legacySessionSnapshot();
  return push({
    domain: "SESSION_STATE",
    operation: "SNAPSHOT",
    snapshot,
    serviceSummary: Object.freeze({
      actionCurrency: "READY",
      phaseAllowance: "READY",
      sessionEngine: "READY",
      rewardEngine: "READY",
      rewardAuthority: services.rewardAuthority.mode
    })
  });
}

export function installM7SessionShadow() {
  if (installed) return;
  installed = true;
  const services = createM7Services();

  Hooks.once("ready", () => {
    game.realmGuard = game.realmGuard ?? {};
    game.realmGuard.core = game.realmGuard.core ?? {};
    game.realmGuard.core.m7 = Object.freeze({
      services,
      snapshot: () => snapshotEvent(services),
      current: () => legacySessionSnapshot(),
      previewTestClaim: actor => {
        const state = legacySessionSnapshot();
        const actorState = state.actors.find(entry => entry.id === actor?.id) ?? {};
        return services.sessionEngine.previewTestClaim({ actor, actorState, sessionState: state });
      },
      previewCheckTransfer: (donor, recipient, amount = 1) => services.actionCurrency.previewTransfer(donor, recipient, amount),
      previewReward: input => services.rewardEngine.proposal(input),
      history: () => Object.freeze([...history]),
      clear: () => { history.length = 0; return getM7SessionShadowStatus(); },
      getStatus: () => getM7SessionShadowStatus()
    });
    snapshotEvent(services);
    console.log("realm-guard | CORE M7 Session Engine foundation ready", getM7SessionShadowStatus());
  });
}

export function getM7SessionShadowStatus() {
  return Object.freeze({
    phase: "M7",
    buildScope: "SESSION_ENGINE_FOUNDATION",
    mode: "SHADOW_READ_ONLY",
    authority: "LEGACY_MIXED",
    liveApplication: false,
    observed: history.length,
    latest: history.at(-1) ?? null,
    capabilities: Object.freeze([
      "SessionState",
      "PhaseDefinition",
      "SessionEngine",
      "ActionCurrencyService",
      "PhaseAllowanceService",
      "RewardEngine",
      "RewardAuthority"
    ])
  });
}
