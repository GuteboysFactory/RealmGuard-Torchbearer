import { createM7Services, legacySessionSnapshot } from "./core/m7-session-services.mjs";
import { participantActorReference } from "./session-participants.mjs";
import { turnAuthorityStatus } from "./turn-authority-bridge.mjs";
import { getM7PlayerTurnClaimHandoffStatus, getM7PlayerTurnClaimHandoffHistory, resetM7PlayerTurnClaimHandoffTelemetry, setM7CoreClaimEnabled, getM7CheckTransferHandoffStatus, getM7CheckTransferHandoffHistory, resetM7CheckTransferHandoffTelemetry, setM7CoreTransferEnabled, getM7FinishPlayerHandoffStatus, getM7FinishPlayerHandoffHistory, resetM7FinishPlayerHandoffTelemetry, setM7CoreFinishEnabled, getM7PhaseChangeHandoffStatus, getM7PhaseChangeHandoffHistory, resetM7PhaseChangeHandoffTelemetry, setM7CorePhaseEnabled, getM7RecoveryHandoffStatus, getM7RecoveryHandoffHistory, resetM7RecoveryHandoffTelemetry, setM7CoreRecoveryEnabled } from "./m7-session-live-handoff.mjs";

const HISTORY_LIMIT = 120;
const history = [];
let installed = false;

function push(event) {
  const row = Object.freeze({
    at: Date.now(),
    phase: "M7",
    buildScope: "TURN_SESSION_HANDOFFS",
    mode: "PARTIAL_LIVE_HANDOFF",
    liveApplication: true,
    authority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER",
    ...event
  });
  history.push(row);
  if (history.length > HISTORY_LIMIT) history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM7SessionShadow", row); } catch (_error) { /* observer only */ }
  return row;
}

function stateFingerprint(snapshot = legacySessionSnapshot()) {
  return JSON.stringify({
    enabled: snapshot.enabled,
    phase: snapshot.phase,
    sessionCycle: snapshot.sessionCycle,
    turnCycleId: snapshot.turnCycleId,
    cycleId: snapshot.cycleId,
    lastActorId: snapshot.lastActorId,
    actors: [...snapshot.actors]
      .map(actor => ({
        id: actor.id,
        ref: actor.ref,
        freeUsed: actor.freeUsed,
        testsTaken: actor.testsTaken,
        checksSpent: actor.checksSpent,
        donatedGiven: actor.donatedGiven,
        donatedReceived: actor.donatedReceived,
        done: actor.done,
        checks: actor.checks
      }))
      .sort((a, b) => String(a.ref).localeCompare(String(b.ref)))
  });
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

export function observeM7Lifecycle(type, details = {}) {
  const services = createM7Services();
  const event = services.lifecycle.create(type, details);
  return push({
    domain: "SESSION_LIFECYCLE",
    operation: event.type,
    event
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
      lifecycle: () => Object.freeze(history.filter(entry => entry.domain === "SESSION_LIFECYCLE")),
      lifecycleSummary: () => {
        const rows = history.filter(entry => entry.domain === "SESSION_LIFECYCLE");
        return Object.freeze({
          observed: rows.length,
          sequence: Object.freeze(rows.map(entry => entry.operation)),
          latest: rows.at(-1) ?? null
        });
      },
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
      authorityStatus: () => turnAuthorityStatus(),
      claimHandoffStatus: () => getM7PlayerTurnClaimHandoffStatus(),
      claimHandoffHistory: () => getM7PlayerTurnClaimHandoffHistory(),
      resetClaimHandoffTelemetry: () => resetM7PlayerTurnClaimHandoffTelemetry(),
      setCoreClaimEnabled: enabled => setM7CoreClaimEnabled(Boolean(enabled)),
      transferHandoffStatus: () => getM7CheckTransferHandoffStatus(),
      transferHandoffHistory: () => getM7CheckTransferHandoffHistory(),
      resetTransferHandoffTelemetry: () => resetM7CheckTransferHandoffTelemetry(),
      setCoreTransferEnabled: enabled => setM7CoreTransferEnabled(Boolean(enabled)),
      finishHandoffStatus: () => getM7FinishPlayerHandoffStatus(),
      finishHandoffHistory: () => getM7FinishPlayerHandoffHistory(),
      resetFinishHandoffTelemetry: () => resetM7FinishPlayerHandoffTelemetry(),
      setCoreFinishEnabled: enabled => setM7CoreFinishEnabled(Boolean(enabled)),
      phaseHandoffStatus: () => getM7PhaseChangeHandoffStatus(),
      phaseHandoffHistory: () => getM7PhaseChangeHandoffHistory(),
      resetPhaseHandoffTelemetry: () => resetM7PhaseChangeHandoffTelemetry(),
      setCorePhaseEnabled: enabled => setM7CorePhaseEnabled(Boolean(enabled)),
      recoveryHandoffStatus: () => getM7RecoveryHandoffStatus(),
      recoveryHandoffHistory: () => getM7RecoveryHandoffHistory(),
      resetRecoveryHandoffTelemetry: () => resetM7RecoveryHandoffTelemetry(),
      setCoreRecoveryEnabled: enabled => setM7CoreRecoveryEnabled(Boolean(enabled)),
      actionCurrencyAuthority: () => Object.freeze({
        technicalCommit: turnAuthorityStatus(),
        serializedByPrimaryGm: true,
        semanticOperations: Object.freeze([
          "CLAIM_TEST",
          "DONATE_CHECK",
          "FINISH_PLAYER",
          "MARK_RECOVERY",
          "AWARD_TRAIT_CHECKS",
          "SPEND_RECOVERY_CHECKS",
          "REFUND_RECOVERY_CHECKS"
        ]),
        directGenericSetOperation: false,
        liveRulesAuthority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER",
        coreLiveApplication: true,
        liveCoreScope: Object.freeze(["CLAIM_TEST", "DONATE_CHECK", "FINISH_PLAYER", "PHASE_CHANGE", "SPEND_RECOVERY_CHECKS", "REFUND_RECOVERY_CHECKS", "MARK_RECOVERY"])
      }),
      stateFingerprint: () => stateFingerprint(),
      multiplayerState: () => {
        const snapshot = legacySessionSnapshot();
        return Object.freeze({
          authority: turnAuthorityStatus(),
          fingerprint: stateFingerprint(snapshot),
          snapshot
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
    buildScope: "TURN_SESSION_HANDOFFS",
    mode: "PARTIAL_LIVE_HANDOFF",
    authority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER",
    liveApplication: true,
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
      "RewardCommitParity",
      "TurnAuthorityBridge",
      "StaleRequestGuard",
      "StateFingerprint",
      "SessionLifecycleService",
      "SESSION_STARTING",
      "SESSION_STARTED",
      "PHASE_CHANGED",
      "SESSION_ENDING",
      "SESSION_ENDED",
      "SessionCycleSeparation",
      "ActionCurrencyAuthorityBoundary",
      "PlayerTurnTestClaimLiveHandoff",
      "AutoRollbackOnClaimDisagreement",
      "PassCheckLiveHandoff",
      "AutoRollbackOnTransferDisagreement",
      "DoneDiscardLiveHandoff",
      "AutoRollbackOnFinishDisagreement",
      "PhaseChangeLiveHandoff",
      "AutoRollbackOnPhaseDisagreement",
      "RecoveryLiveHandoff",
      "AutoRollbackOnRecoveryDisagreement"
    ])
  });
}
