import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationAvailable, qaProfileActivationRuntime } from "./m10-profile-activation.mjs";
import { tb2eWiseShadowStatus, tb2eWiseUsePlan } from "./m10d-tb2e-wise-shadow.mjs";

const PROFILE_ID = "torchbearer2e";
const DOMAIN_ID = "WISES";
const REQUIRED_CASES = Object.freeze([
  "I_AM_WISE",
  "DEEPER_UNDERSTANDING",
  "OF_COURSE",
  "WISE_REQUIRED",
  "WISE_NOT_RELATED",
  "INSUFFICIENT_FATE",
  "NO_ELIGIBLE_FAILED_DIE",
  "INSUFFICIENT_PERSONA",
  "UNKNOWN_WISE_EFFECT"
]);
const runtimeEvidence = new Map();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function gateSnapshot() {
  const profile = resolveRulesProfile(PROFILE_ID).profile;
  const activeProfile = getRulesProfileRuntime().profile;
  const version = String(globalThis.game?.system?.version ?? "");
  const metadata = profile.metadata ?? {};
  const sourceVerified = tb2eWiseShadowStatus().sourceClassification === "VERIFIED";
  const qaRuntime = /^1\.13\.0-qa\.\d+$/i.test(version) && qaProfileActivationRuntime();
  const activationAvailable = profileActivationAvailable(PROFILE_ID);
  const profileLocked = profile.version === 1
    && metadata.foundationOnly === true
    && metadata.selectable === false
    && metadata.supported === false
    && metadata.liveRuleAuthority === false
    && metadata.explicitActivationAuthorized !== true
    && metadata.creationCommitAllowed !== true
    && activationAvailable === false;

  return freeze({
    phase: "M10D.17",
    qaRuntime,
    gmAuthority: globalThis.game?.user?.isGM === true,
    sourceVerified,
    profileId: profile.id,
    profileLocked,
    profileInactive: activeProfile?.id !== PROFILE_ID,
    activationAvailable,
    liveRuleAuthority: metadata.liveRuleAuthority === true
  });
}

function requireControlledGate() {
  const gate = gateSnapshot();
  if (!gate.qaRuntime) throw new Error("TB2E controlled Wises handoff is restricted to the v1.13 QA runtime.");
  if (!gate.gmAuthority) throw new Error("TB2E controlled Wises handoff is GM-only.");
  if (!gate.sourceVerified) throw new Error("TB2E Wises handoff requires VERIFIED source coverage.");
  if (!gate.profileLocked || gate.activationAvailable) throw new Error("TB2E controlled Wises handoff requires the locked FOUNDATION_ONLY profile.");
  if (!gate.profileInactive) throw new Error("TB2E controlled Wises handoff requires Torchbearer to remain inactive.");
  return gate;
}

function makeChecks(plan, expectRejected) {
  const checks = {
    expectedPlanOutcome: plan.ok === !expectRejected,
    tb2eSourceOwnedPlan: plan.profileId === PROFILE_ID,
    liveApplicationBlocked: plan.liveApplication === false,
    zeroWritesPlanned: plan.writesPlanned === 0,
    noResourceSpendCommitted: plan.resourceSpendCommitted !== true,
    noActorItemMutation: plan.actorMutationAllowed !== true && plan.itemMutationAllowed !== true
  };

  if (plan.ok && plan.effect === "I_AM_WISE") {
    checks.iAmWiseIsOneDie = plan.dice === 1;
    checks.iAmWiseReplacesSkillHelp = plan.replacesSkillHelp === true;
    checks.twistRiskRetained = plan.helperTwistRisk === true;
    checks.noHelperConditionRisk = plan.helperConditionRisk === false;
    checks.noCost = plan.resourceCost === "NONE";
    checks.instinctAllowed = plan.worksWhenActingOnInstinct === true;
  } else if (plan.ok && plan.effect === "DEEPER_UNDERSTANDING") {
    checks.fatePlanOnly = plan.resourceCost === "FATE" && plan.resourceAmount === 1;
    checks.oneEligibleFailedDie = plan.reroll === "ONE_FAILED_DIE" && plan.rerollDiceMaximum === 1;
    checks.ofCourseOrdering = plan.orderRequirement === "OF_COURSE_BEFORE_DEEPER_IF_BOTH";
  } else if (plan.ok && plan.effect === "OF_COURSE") {
    checks.personaPlanOnly = plan.resourceCost === "PERSONA" && plan.resourceAmount === 1;
    checks.allFailedDicePlanOnly = plan.reroll === "ALL_FAILED_DICE";
    checks.ofCourseOrdering = plan.orderRequirement === "OF_COURSE_BEFORE_DEEPER_IF_BOTH";
  } else if (!plan.ok) {
    checks.rejectionHasReason = typeof plan.reasonCode === "string" && plan.reasonCode.length > 0;
  } else {
    checks.onlySupportedEffects = false;
  }

  return freeze(checks);
}

function caseId(plan) {
  return plan.ok ? plan.effect : plan.reasonCode || "REJECTED";
}

function record(plan, checks, gate, expectRejected) {
  const ok = Object.values(checks).every(Boolean);
  const evidence = freeze({
    phase: "M10D.17",
    domainId: DOMAIN_ID,
    caseId: caseId(plan),
    executed: true,
    ok,
    expectedPlanAccepted: !expectRejected,
    executedAt: Date.now(),
    provider: "TB2E_M10D_WISE_SHADOW_ADAPTER",
    liveSurface: "CONTROLLED_QA_TB2E_WISE_HANDOFF",
    selectedEffect: plan.effect ?? null,
    route: "TORCHBEARER2E_SOURCE_OWNED_WISE_PLAN",
    checks,
    plan,
    qaRuntime: gate.qaRuntime,
    gmAuthority: gate.gmAuthority,
    profileLocked: gate.profileLocked,
    profileInactive: gate.profileInactive,
    activationAvailable: gate.activationAvailable,
    liveRuleAuthority: false,
    diceEvaluated: false,
    diceRerolled: false,
    resourceSpendCommitted: false,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 },
    destructiveMigration: false,
    activeProfileMutation: false
  });
  runtimeEvidence.set(evidence.caseId, evidence);
  return evidence;
}

/**
 * Plans a source-owned TB2E Wises action for QA evidence only.
 * This function deliberately does not evaluate dice or apply the returned plan.
 */
export function runTb2eControlledWisesHandoff(effect, payload = {}) {
  const gate = requireControlledGate();
  const expectRejected = payload.expectRejected === true;
  const plan = tb2eWiseUsePlan(effect, {
    hasWise: payload.hasWise !== false,
    related: payload.related !== false,
    actingOnInstinct: payload.actingOnInstinct === true,
    context: payload.context ?? "TEST",
    failedDice: payload.failedDice ?? 0,
    alreadyRerolledFailedDice: payload.alreadyRerolledFailedDice ?? 0,
    hasFate: payload.hasFate !== false,
    hasPersona: payload.hasPersona !== false
  });
  return record(plan, makeChecks(plan, expectRejected), gate, expectRejected);
}

export function getTb2eControlledWisesMatrix() {
  const gate = gateSnapshot();
  const seen = new Set(runtimeEvidence.keys());
  const missingCases = REQUIRED_CASES.filter(id => !seen.has(id));
  const allExecutedCasesPass = runtimeEvidence.size > 0 && [...runtimeEvidence.values()].every(row => row.ok);
  const passed = missingCases.length === 0 && allExecutedCasesPass;
  const state = [...runtimeEvidence.values()].some(row => !row.ok)
    ? "EXECUTED_FAIL"
    : passed
      ? "EXECUTED_PASS"
      : runtimeEvidence.size
        ? "EXECUTING"
        : "READY_FOR_CONTROLLED_EXECUTION";

  return freeze([{
    id: DOMAIN_ID,
    state,
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

export function getTb2eControlledWisesStatus() {
  const gate = gateSnapshot();
  const matrix = getTb2eControlledWisesMatrix();
  const row = matrix[0];
  return freeze({
    phase: "M10D.17",
    mode: "TB2E_CONTROLLED_WISES_QA_HANDOFF",
    ...gate,
    controlledExecutionReady: gate.qaRuntime && gate.gmAuthority && gate.sourceVerified
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
    pendingDomains: row.passed ? [] : [DOMAIN_ID],
    failedDomains: row.state === "EXECUTED_FAIL" ? [DOMAIN_ID] : [],
    matrix,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 },
    diceEvaluated: false,
    diceRerolled: false,
    resourceSpendCommitted: false,
    destructiveMigration: false,
    activeProfileMutation: false,
    evidencePersistence: "MEMORY_ONLY",
    nextStep: row.passed
      ? "Run Foundry zero-write and regression gates; this does not authorize live parity or activation"
      : "Complete all required QA-only TB2E Wises plan cases; no rule effect is applied"
  });
}

export function resetTb2eControlledWisesEvidence() {
  requireControlledGate();
  runtimeEvidence.size = 0;
  return getTb2eControlledWisesStatus();
}
