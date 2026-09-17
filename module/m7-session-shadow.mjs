import { createM7Services, legacySessionSnapshot } from "./core/m7-session-services.mjs";
import { participantActorReference } from "./session-participants.mjs";

const HISTORY_LIMIT = 120;
const history = [];
let installed = false;

function push(event) {
  const row = Object.freeze({
    at: Date.now(),
    phase: "M7",
    buildScope: "REWARD_SHADOW_PARITY",
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

export function observeM7RewardProposal({ actor, criteria = {}, mvpId = "", workhorseId = "", legacyProposal = {} } = {}) {
  const services = createM7Services();
  const coreProposal = services.rewardEngine.proposal({
    actorId: actor?.id ?? "",
    criteria,
    mvpId,
    workhorseId
  });
  const comparableLegacy = {
    fate: Math.max(0, Number(legacyProposal?.fate ?? 0)),
    persona: Math.max(0, Number(legacyProposal?.persona ?? 0)),
    personaRaw: Math.max(0, Number(legacyProposal?.personaRaw ?? 0)),
    goalFateSuppressed: Boolean(legacyProposal?.goalFateSuppressed)
  };
  const comparableCore = {
    fate: coreProposal.fate,
    persona: coreProposal.persona,
    personaRaw: coreProposal.personaRaw,
    goalFateSuppressed: coreProposal.goalFateSuppressed
  };
  const parity = JSON.stringify(comparableLegacy) === JSON.stringify(comparableCore);
  return push({
    domain: "REWARD_ENGINE",
    operation: "PROPOSAL_PARITY",
    actorId: actor?.id ?? "",
    actorName: actor?.name ?? "",
    legacy: comparableLegacy,
    core: comparableCore,
    parity
  });
}

export function observeM7RewardCommit({
  actor,
  proposal = {},
  approval = {},
  legacy = {}
} = {}) {
  const services = createM7Services();
  const coreCommit = services.rewardEngine.previewCommit({
    currentFate: legacy.beforeFate,
    currentPersona: legacy.beforePersona,
    fateMax: legacy.fateMax,
    personaMax: legacy.personaMax,
    proposal,
    approval
  });
  const comparableLegacy = {
    beforeFate: Math.max(0, Number(legacy?.beforeFate ?? 0)),
    beforePersona: Math.max(0, Number(legacy?.beforePersona ?? 0)),
    approvedFate: Math.max(0, Number(legacy?.approvedFate ?? 0)),
    approvedPersona: Math.max(0, Number(legacy?.approvedPersona ?? 0)),
    nextFate: Math.max(0, Number(legacy?.nextFate ?? 0)),
    nextPersona: Math.max(0, Number(legacy?.nextPersona ?? 0)),
    actualFate: Math.max(0, Number(legacy?.actualFate ?? 0)),
    actualPersona: Math.max(0, Number(legacy?.actualPersona ?? 0))
  };
  const comparableCore = {
    beforeFate: coreCommit.beforeFate,
    beforePersona: coreCommit.beforePersona,
    approvedFate: coreCommit.approvedFate,
    approvedPersona: coreCommit.approvedPersona,
    nextFate: coreCommit.nextFate,
    nextPersona: coreCommit.nextPersona,
    actualFate: coreCommit.actualFate,
    actualPersona: coreCommit.actualPersona
  };
  const parity = JSON.stringify(comparableLegacy) === JSON.stringify(comparableCore);
  return push({
    domain: "REWARD_ENGINE",
    operation: "COMMIT_PARITY",
    actorId: actor?.id ?? "",
    actorName: actor?.name ?? "",
    legacy: comparableLegacy,
    core: comparableCore,
    parity
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
        const ref = participantActorReference(actor);
        const actorState = state.actors.find(entry => entry.ref === ref) ?? state.actors.find(entry => entry.id === actor?.id) ?? {};
        return services.sessionEngine.previewTestClaim({ actor, actorState, sessionState: state });
      },
      previewCheckTransfer: (donor, recipient, amount = 1) => services.actionCurrency.previewTransfer(donor, recipient, amount),
      previewReward: input => services.rewardEngine.proposal(input),
      rewardParity: () => Object.freeze(history.filter(entry => entry.domain === "REWARD_ENGINE")),
      rewardParitySummary: () => {
        const rows = history.filter(entry => entry.domain === "REWARD_ENGINE");
        return Object.freeze({
          observed: rows.length,
          mismatches: rows.filter(entry => entry.parity === false).length,
          allParity: rows.length > 0 && rows.every(entry => entry.parity === true),
          latest: rows.at(-1) ?? null
        });
      },
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
      "RewardAuthority",
      "ParticipantActorResolver",
      "RewardProposalParity",
      "RewardCommitParity"
    ])
  });
}
