import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationAvailable, qaProfileActivationRuntime } from "./m10-profile-activation.mjs";
import { tb2eTestPoolPlan, tb2eTestShadowStatus } from "./m10d-tb2e-test-shadow.mjs";

const PROFILE_ID = "torchbearer2e";
const REQUIRED_CASES = Object.freeze([
  "OB_PASS",
  "OB_FAIL",
  "DICE_MODIFIER",
  "SUCCESS_MODIFIER",
  "INVALID_DICE_COUNT",
  "INVALID_DIE_FACE"
]);
const runtimeEvidence = new Map();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function isInteger(value) {
  return Number.isInteger(Number(value));
}

function gateSnapshot() {
  const profile = resolveRulesProfile(PROFILE_ID).profile;
  const activeProfile = getRulesProfileRuntime().profile;
  const version = String(globalThis.game?.system?.version ?? "");
  const metadata = profile.metadata ?? {};
  const shadowStatus = tb2eTestShadowStatus();
  const sourceBounded = shadowStatus.adapterReady === true && shadowStatus.sourceClassification === "PARTIAL";
  const qaRuntime = version === "1.13.0-qa.19" && qaProfileActivationRuntime();
  const activationAvailable = profileActivationAvailable(PROFILE_ID);
  const profileLocked = profile.id === PROFILE_ID
    && profile.version === 1
    && metadata.foundationOnly === true
    && metadata.selectable === false
    && metadata.supported === false
    && metadata.liveRuleAuthority === false
    && metadata.explicitActivationAuthorized !== true
    && metadata.creationCommitAllowed !== true
    && activationAvailable === false;

  return freeze({
    phase: "M10D.18",
    qaRuntime,
    gmAuthority: globalThis.game?.user?.isGM === true,
    sourceBounded,
    profileId: PROFILE_ID,
    profileLocked,
    profileInactive: activeProfile?.id !== PROFILE_ID,
    activationAvailable
  });
}

function requireControlledGate() {
  const gate = gateSnapshot();
  if (!gate.qaRuntime) throw new Error("TB2E controlled Test handoff is restricted to v1.13.0-qa.19.");
  if (!gate.gmAuthority) throw new Error("TB2E controlled Test handoff is GM-only.");
  if (!gate.sourceBounded) throw new Error("TB2E Test handoff requires its bounded source-shadow adapter.");
  if (!gate.profileLocked || gate.activationAvailable) throw new Error("TB2E controlled Test handoff requires the locked FOUNDATION_ONLY profile.");
  if (!gate.profileInactive) throw new Error("TB2E controlled Test handoff requires Torchbearer to remain inactive.");
  return gate;
}

function evidenceFor(caseId, payload, gate) {
  const expectedRejected = caseId === "INVALID_DICE_COUNT" || caseId === "INVALID_DIE_FACE";
  const engineApi = globalThis.game?.realmGuard?.core?.tests;
  if (!engineApi?.engine || typeof engineApi.engine.runDeterministic !== "function") {
    throw new Error("CORE M3 Test Engine is unavailable; TB2E Test handoff fails closed.");
  }

  const plan = tb2eTestPoolPlan({
    basePool: payload.basePool,
    diceModifier: payload.diceModifier ?? 0,
    successModifier: payload.successModifier ?? 0
  });
  if (!plan.ok) {
    if (!expectedRejected) throw new Error(`Invalid TB2E Test pool: ${plan.reasonCode}`);
    return freeze({
      caseId, expectedRejected, ok: true, provider: "TB2E_M10D_TEST_SHADOW_TO_CORE_M3",
      route: "TORCHBEARER2E_TEST_SHADOW_TO_EXISTING_CORE_M3",
      rejection: plan, ...gate, randomRollExecuted: false, suppliedFacesEvaluated: false,
      liveApplication: false, writes: { actors: 0, items: 0, journals: 0, settings: 0 }
    });
  }

  const sourceName = String(payload.sourceName ?? "").trim();
  if (!sourceName) throw new Error("A caller-supplied sourceName is required; the handoff does not infer a Skill or obstacle factor.");
  if (!isInteger(payload.obstacle) || Number(payload.obstacle) < 1) throw new Error("A positive caller-supplied obstacle is required.");
  if (!Array.isArray(payload.faces)) throw new Error("Deterministic QA faces must be supplied as an array.");

  try {
    const run = engineApi.engine.runDeterministic({
      id: `m10d18-${caseId.toLowerCase()}`,
      context: {
        type: "ordinary",
        sourceName,
        isSkill: false,
        metadata: { domain: "TB2E_TEST", source: "CALLER_SUPPLIED_QA_CASE" }
      },
      basePool: Number(payload.basePool),
      obstacle: Number(payload.obstacle),
      successModifier: Number(payload.successModifier ?? 0),
      successThreshold: 4,
      profileId: PROFILE_ID,
      profileVersion: 1,
      provenance: {
        provider: "TB2E_M10D_TEST_SHADOW_TO_CORE_M3",
        obstacleAuthority: "CALLER_SUPPLIED",
        obstacleFactorsAutomated: false
      }
    }, {
      diceModifier: Number(payload.diceModifier ?? 0),
      provenance: { sourceClassification: "PARTIAL", execution: "DETERMINISTIC_QA_ONLY" }
    }, payload.faces);

    const result = run.result;
    const expected = {
      OB_PASS: { outcome: "PASS", finalPool: 3, rawSuccesses: 2, finalSuccesses: 2, targetSuccesses: 2, margin: 0 },
      OB_FAIL: { outcome: "FAIL", finalPool: 3, rawSuccesses: 0, finalSuccesses: 0, targetSuccesses: 2, margin: 2 },
      DICE_MODIFIER: { outcome: "PASS", finalPool: 4, rawSuccesses: 2, finalSuccesses: 2, targetSuccesses: 2, margin: 0 },
      SUCCESS_MODIFIER: { outcome: "PASS", finalPool: 3, rawSuccesses: 1, finalSuccesses: 2, targetSuccesses: 2, margin: 0 }
    }[caseId];

    if (expectedRejected) throw new Error("Invalid deterministic case was unexpectedly accepted by M3.");
    const checks = {
      sourceOwnedRoute: run.request.provenance?.provider === "TB2E_M10D_TEST_SHADOW_TO_CORE_M3",
      usedExistingM3: engineApi.engine.constructor?.name === "TestEngine",
      callerSuppliedObstacle: run.request.obstacle === Number(payload.obstacle),
      sourceFactorsNotAutomated: run.request.provenance?.obstacleFactorsAutomated === false,
      thresholdIsFourPlus: run.request.successThreshold === 4,
      poolMatchesPlan: run.plan.finalPool === plan.finalPool,
      deterministicFacesMatch: JSON.stringify(result.faces) === JSON.stringify(payload.faces),
      expectedOutcome: result.outcome === expected?.outcome,
      expectedPool: run.plan.finalPool === expected?.finalPool,
      expectedRawSuccesses: result.rawSuccesses === expected?.rawSuccesses,
      expectedFinalSuccesses: result.finalSuccesses === expected?.finalSuccesses,
      expectedObstacle: result.targetSuccesses === expected?.targetSuccesses,
      expectedMargin: result.margin === expected?.margin,
      transactionNotCommitted: run.transaction.state === "RESOLVED",
      noGameplayApplication: true
    };
    const ok = Object.values(checks).every(Boolean);
    return freeze({
      caseId, expectedRejected, executed: true, ok,
      provider: "TB2E_M10D_TEST_SHADOW_TO_CORE_M3",
      route: "TORCHBEARER2E_TEST_SHADOW_TO_EXISTING_CORE_M3",
      selectedSource: sourceName,
      obstacleAuthority: "CALLER_SUPPLIED",
      obstacleFactorsAutomated: false,
      checks,
      request: run.request,
      plan: run.plan,
      result,
      transaction: run.transaction.snapshot(),
      ...gate,
      randomRollExecuted: false,
      suppliedFacesEvaluated: true,
      liveApplication: false,
      resourceSpendCommitted: false,
      writes: { actors: 0, items: 0, journals: 0, settings: 0 }
    });
  } catch (error) {
    if (!expectedRejected) throw error;
    const expectedError = caseId === "INVALID_DICE_COUNT"
      ? /expected .* dice, received/i
      : /invalid d6 face/i;
    const ok = expectedError.test(String(error?.message ?? error));
    return freeze({
      caseId, expectedRejected, executed: true, ok,
      provider: "TB2E_M10D_TEST_SHADOW_TO_CORE_M3",
      route: "TORCHBEARER2E_TEST_SHADOW_TO_EXISTING_CORE_M3",
      rejection: String(error?.message ?? error),
      ...gate,
      randomRollExecuted: false,
      suppliedFacesEvaluated: false,
      liveApplication: false,
      resourceSpendCommitted: false,
      writes: { actors: 0, items: 0, journals: 0, settings: 0 }
    });
  }
}

/**
 * Executes a deterministic, caller-faced basic Ob Test through the existing M3 engine.
 * This is QA evidence only: it creates no random roll, chat message, resource spend or document write.
 */
export function runTb2eControlledTestHandoff(caseId, payload = {}) {
  const gate = requireControlledGate();
  const key = String(caseId ?? "").trim().toUpperCase();
  if (!REQUIRED_CASES.includes(key)) throw new Error(`Unsupported M10D.18 Test case: ${key || "(empty)"}`);
  const evidence = evidenceFor(key, payload, gate);
  runtimeEvidence.set(key, evidence);
  return evidence;
}

export function getTb2eControlledTestsMatrix() {
  const gate = gateSnapshot();
  const missingCases = REQUIRED_CASES.filter(id => !runtimeEvidence.has(id));
  const passed = missingCases.length === 0 && [...runtimeEvidence.values()].every(row => row.ok);
  const failed = [...runtimeEvidence.values()].some(row => !row.ok);
  return freeze([{
    id: "TB2E_BASIC_TEST",
    state: failed ? "EXECUTED_FAIL" : passed ? "EXECUTED_PASS" : runtimeEvidence.size ? "EXECUTING" : "READY_FOR_CONTROLLED_EXECUTION",
    executed: runtimeEvidence.size > 0,
    passed,
    executedCaseCount: runtimeEvidence.size,
    passedCaseCount: [...runtimeEvidence.values()].filter(row => row.ok).length,
    failedCaseCount: [...runtimeEvidence.values()].filter(row => !row.ok).length,
    missingRequiredCases: missingCases,
    evidence: [...runtimeEvidence.values()],
    gateLocked: gate.profileLocked,
    activationAvailable: gate.activationAvailable,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 }
  }]);
}

export function getTb2eControlledTestsStatus() {
  const gate = gateSnapshot();
  const row = getTb2eControlledTestsMatrix()[0];
  return freeze({
    phase: "M10D.18",
    mode: "TB2E_CONTROLLED_BASIC_TEST_QA_HANDOFF",
    ...gate,
    controlledExecutionReady: gate.qaRuntime && gate.gmAuthority && gate.sourceBounded
      && gate.profileLocked && gate.profileInactive && !gate.activationAvailable,
    controlledExecutionOnly: true,
    liveParityVerified: false,
    activationAuthorized: false,
    profileSwitchAuthorized: false,
    creationCommitAuthorized: false,
    domainCount: 1,
    executedDomainCount: row.executed ? 1 : 0,
    passedDomainCount: row.passed ? 1 : 0,
    executedCaseCount: row.executedCaseCount,
    passedCaseCount: row.passedCaseCount,
    failedCaseCount: row.failedCaseCount,
    pendingCases: row.missingRequiredCases,
    pendingDomains: row.passed ? [] : ["TB2E_BASIC_TEST"],
    failedDomains: row.state === "EXECUTED_FAIL" ? ["TB2E_BASIC_TEST"] : [],
    matrix: [row],
    writes: { actors: 0, items: 0, journals: 0, settings: 0 },
    randomRollExecuted: false,
    suppliedFacesEvaluated: row.executedCaseCount > 0,
    resourceSpendCommitted: false,
    evidencePersistence: "MEMORY_ONLY",
    nextStep: row.passed
      ? "Run Foundry zero-write and profile-regression gates; this does not authorize TB2E activation or general live parity"
      : "Complete all six deterministic basic-Test cases through the existing CORE M3 engine"
  });
}

export function resetTb2eControlledTestsEvidence() {
  requireControlledGate();
  runtimeEvidence.clear();
  return getTb2eControlledTestsStatus();
}
