import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationAvailable, qaProfileActivationRuntime } from "./m10-profile-activation.mjs";
import {
  tb2eConditionShadowStatus,
  tb2eConditionTestEffectPlan,
  tb2eConditionZeroRatingPlan,
  tb2eConflictDispositionConditionPlan
} from "./m10d-tb2e-conditions-shadow.mjs";
import {
  tb2eRecoveryShadowStatus,
  tb2eStandardRecoveryPlan,
  tb2eHungryThirstyRecoveryPlan,
  tb2eHealerRecoveryPlan
} from "./m10d-tb2e-recovery-shadow.mjs";
import { tb2eSessionShadowStatus, tb2eSessionModel, tb2eGrindTurnPlan } from "./m10d-tb2e-session-shadow.mjs";
import { tb2eTestPoolPlan } from "./m10d-tb2e-test-shadow.mjs";

const PROFILE_ID = "torchbearer2e";
const REQUIRED_CASES = Object.freeze([
  "CONDITION_FRESH_SKILL_M3_PASS",
  "CONDITION_INJURED_SICK_M3_PASS",
  "CONDITION_RESOURCES_FRESH_NO_BONUS",
  "CONDITION_ZERO_SKILL_BLOCKED",
  "GRIND_TEST_TURN",
  "GRIND_INSTINCT_ZERO",
  "GRIND_SPELL_SOURCE_REQUIRED",
  "RECOVERY_ANGRY_CAMP_PREVIEW",
  "RECOVERY_AFRAID_TOWN_COST_PREVIEW",
  "RECOVERY_HUNGRY_CAMP_NO_OB",
  "RECOVERY_EXHAUSTED_SOURCE_BOUNDARY",
  "RECOVERY_HEALER_INJURY_PREVIEW",
  "CONFLICT_CONDITION_PENALTY_MANUAL"
]);
const CASE_DOMAIN = Object.freeze({
  CONDITION_FRESH_SKILL_M3_PASS: "CONDITIONS",
  CONDITION_INJURED_SICK_M3_PASS: "CONDITIONS",
  CONDITION_RESOURCES_FRESH_NO_BONUS: "CONDITIONS",
  CONDITION_ZERO_SKILL_BLOCKED: "CONDITIONS",
  GRIND_TEST_TURN: "GRIND",
  GRIND_INSTINCT_ZERO: "GRIND",
  GRIND_SPELL_SOURCE_REQUIRED: "GRIND",
  RECOVERY_ANGRY_CAMP_PREVIEW: "RECOVERY",
  RECOVERY_AFRAID_TOWN_COST_PREVIEW: "RECOVERY",
  RECOVERY_HUNGRY_CAMP_NO_OB: "RECOVERY",
  RECOVERY_EXHAUSTED_SOURCE_BOUNDARY: "RECOVERY",
  RECOVERY_HEALER_INJURY_PREVIEW: "RECOVERY",
  CONFLICT_CONDITION_PENALTY_MANUAL: "SOURCE_BOUNDARIES"
});
const runtimeEvidence = new Map();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}
function isInteger(value) { return Number.isInteger(Number(value)); }
function writesZero() { return { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 }; }

function gateSnapshot() {
  const profile = resolveRulesProfile(PROFILE_ID).profile;
  const activeProfile = getRulesProfileRuntime().profile;
  const version = String(globalThis.game?.system?.version ?? "");
  const metadata = profile.metadata ?? {};
  const conditions = tb2eConditionShadowStatus();
  const recovery = tb2eRecoveryShadowStatus();
  const session = tb2eSessionShadowStatus();
  const supported = ["VERIFIED", "PARTIAL", "BOUNDED_PARTIAL"];
  const sourceBounded = [conditions, recovery, session].every(row =>
    row.adapterReady === true && supported.includes(row.sourceClassification)
  );
  const qaRuntime = version === "1.13.0-qa.21" && qaProfileActivationRuntime();
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
    phase: "M10D.20",
    qaRuntime,
    gmAuthority: globalThis.game?.user?.isGM === true,
    sourceBounded,
    profileId: PROFILE_ID,
    profileLocked,
    profileInactive: activeProfile?.id !== PROFILE_ID,
    activationAvailable
  });
}

function requireGate() {
  const gate = gateSnapshot();
  if (!gate.qaRuntime) throw new Error("Conditions / Recovery / Grind handoff is restricted to v1.13.0-qa.21.");
  if (!gate.gmAuthority) throw new Error("Conditions / Recovery / Grind handoff is GM-only.");
  if (!gate.sourceBounded) throw new Error("The bounded TB2E Conditions, Recovery and Session shadows are required.");
  if (!gate.profileLocked || gate.activationAvailable) throw new Error("TB2E handoff requires the locked FOUNDATION_ONLY profile.");
  if (!gate.profileInactive) throw new Error("TB2E handoff requires Torchbearer to remain inactive.");
  return gate;
}

function evidence(caseId, checks, details, gate, expectedRejected = false) {
  return freeze({
    caseId,
    ok: Object.values(checks).every(Boolean),
    expectedRejected,
    checks,
    details,
    ...gate,
    provider: "TB2E_M10D20_CONDITIONS_RECOVERY_GRIND_SHADOWS",
    liveApplication: false,
    randomRollExecuted: false,
    resourceSpendCommitted: false,
    conditionMutationCommitted: false,
    turnCounterMutationCommitted: false,
    phaseMutationCommitted: false,
    writes: writesZero()
  });
}

function runM3(caseId, sourceName, basePool, diceModifier, obstacle, faces, gate, expectedOutcome) {
  if (!Array.isArray(faces) || faces.some(face => !isInteger(face) || Number(face) < 1 || Number(face) > 6)) {
    throw new Error("Valid caller-supplied deterministic d6 faces are required.");
  }
  if (!isInteger(obstacle) || Number(obstacle) < 1) throw new Error("A positive caller-supplied Obstacle is required.");
  const pool = tb2eTestPoolPlan({ basePool, diceModifier, successModifier: 0 });
  if (!pool.ok || pool.finalPool !== faces.length) throw new Error("Supplied face count must match the final deterministic dice pool.");
  const engine = globalThis.game?.realmGuard?.core?.tests?.engine;
  if (!engine || typeof engine.runDeterministic !== "function") {
    throw new Error("CORE M3 Test Engine is unavailable; this handoff fails closed.");
  }
  const run = engine.runDeterministic({
    id: "m10d20-" + caseId.toLowerCase(),
    context: { type: "ordinary", sourceName, isSkill: false, metadata: { domain: "TB2E_CONDITION_EFFECTS", source: "CALLER_SUPPLIED_QA_CASE" } },
    basePool: Number(basePool),
    obstacle: Number(obstacle),
    successModifier: 0,
    successThreshold: 4,
    profileId: PROFILE_ID,
    profileVersion: 1,
    provenance: {
      provider: "TB2E_M10D20_CONDITIONS_RECOVERY_GRIND_SHADOWS",
      obstacleAuthority: "CALLER_SUPPLIED",
      obstacleFactorsAutomated: false
    }
  }, {
    diceModifier: Number(diceModifier),
    provenance: { sourceClassification: "PARTIAL", execution: "DETERMINISTIC_QA_ONLY" }
  }, faces.map(Number));
  const result = run.result;
  const checks = {
    existingM3Used: run.request.profileId === PROFILE_ID,
    providerIsTb2eOwned: run.request.provenance?.provider === "TB2E_M10D20_CONDITIONS_RECOVERY_GRIND_SHADOWS",
    obstaclePreserved: run.request.obstacle === Number(obstacle),
    obstacleFactorsRemainManual: run.request.provenance?.obstacleFactorsAutomated === false,
    suppliedFacesMatch: JSON.stringify(result.faces) === JSON.stringify(faces.map(Number)),
    poolMatchesShadow: run.plan.finalPool === pool.finalPool,
    expectedOutcome: result.outcome === expectedOutcome,
    resolvedWithoutApplication: run.transaction.state === "RESOLVED"
  };
  return { pool, run, checks };
}

function evidenceFor(caseId, payload, gate) {
  if (caseId === "CONDITION_FRESH_SKILL_M3_PASS"
    || caseId === "CONDITION_INJURED_SICK_M3_PASS"
    || caseId === "CONDITION_RESOURCES_FRESH_NO_BONUS") {
    const conditions = caseId === "CONDITION_FRESH_SKILL_M3_PASS" ? ["Fresh"]
      : caseId === "CONDITION_INJURED_SICK_M3_PASS" ? ["Injured", "Sick"] : ["Fresh"];
    const test = caseId === "CONDITION_RESOURCES_FRESH_NO_BONUS" ? "Resources" : "Skill";
    const effectPlan = tb2eConditionTestEffectPlan({ conditions, test });
    if (!effectPlan.ok) throw new Error("Condition effect plan failed closed: " + effectPlan.reasonCode);
    const expectedModifier = caseId === "CONDITION_FRESH_SKILL_M3_PASS" ? 1
      : caseId === "CONDITION_INJURED_SICK_M3_PASS" ? -2 : 0;
    const expectedOutcome = caseId === "CONDITION_RESOURCES_FRESH_NO_BONUS" ? "FAIL" : "PASS";
    const evaluated = runM3(caseId, "Condition effect / " + test, payload.basePool, effectPlan.diceModifier,
      payload.obstacle, payload.faces, gate, expectedOutcome);
    return evidence(caseId, {
      conditionPlanMatchesExpectedModifier: effectPlan.diceModifier === expectedModifier,
      conditionPlanIsPreviewOnly: effectPlan.liveApplication === false && effectPlan.writesPlanned === 0,
      ...evaluated.checks
    }, { effectPlan, poolPlan: evaluated.pool, result: evaluated.run.result,
      transaction: evaluated.run.transaction.snapshot(), route: "TB2E_CONDITION_SHADOW_TO_EXISTING_CORE_M3" }, gate);
  }

  if (caseId === "CONDITION_ZERO_SKILL_BLOCKED") {
    const plan = tb2eConditionZeroRatingPlan({ ratingAfterConditions: 0, target: "Skill" });
    return evidence(caseId, {
      zeroRatingDetected: plan.ok && plan.atZero,
      testBlocked: plan.mayTest === false,
      helpAndBenefitBlocked: plan.mayGrantHelp === false && plan.mayBenefitFrom === false,
      NatureFallbackShown: plan.natureFallbackAvailable === true,
      noApplication: plan.liveApplication === false && plan.writesPlanned === 0
    }, { plan }, gate, true);
  }

  if (caseId === "GRIND_TEST_TURN" || caseId === "GRIND_INSTINCT_ZERO" || caseId === "GRIND_SPELL_SOURCE_REQUIRED") {
    const plan = caseId === "GRIND_TEST_TURN" ? tb2eGrindTurnPlan({ actionType: "TEST" })
      : caseId === "GRIND_INSTINCT_ZERO" ? tb2eGrindTurnPlan({ actionType: "TEST", instinct: true })
        : tb2eGrindTurnPlan({ actionType: "SPELL" });
    const model = tb2eSessionModel();
    const checks = caseId === "GRIND_TEST_TURN"
      ? { testCostsOneTurn: plan.turnCostPreview === 1, conditionCadenceEveryFourTurns: model.grind.conditionCadenceTurns === 4 }
      : caseId === "GRIND_INSTINCT_ZERO"
        ? { instinctCostsNoTurn: plan.turnCostPreview === 0, noConditionCadenceMutation: plan.conditionCadenceMutationCommitted === false }
        : { unspecifiedSpellCostNotInvented: plan.turnCostPreview === null,
          sourceAuthorityRequired: plan.turnCostAuthority === "SPELL_OR_INVOCATION_EFFECT_SOURCE_REQUIRED" };
    return evidence(caseId, {
      ...checks,
      turnPlanIsPreviewOnly: plan.liveApplication === false && plan.writesPlanned === 0,
      turnCounterNotChanged: plan.turnCounterMutationCommitted === false
    }, { plan, cadenceTurns: model.grind.conditionCadenceTurns }, gate, caseId === "GRIND_SPELL_SOURCE_REQUIRED");
  }

  if (caseId === "RECOVERY_ANGRY_CAMP_PREVIEW") {
    const plan = tb2eStandardRecoveryPlan({ condition: "Angry", phase: "Camp" });
    return evidence(caseId, {
      sourceRecoveryAbility: plan.ability === "WILL",
      sourceObstacle: plan.obstacle === 2,
      campCheckCostPreview: plan.campCheckCost === 1,
      spendAndConditionRemovalNotApplied: plan.checkSpendCommitted === false && plan.conditionMutationCommitted === false && plan.liveApplication === false
    }, { plan }, gate);
  }

  if (caseId === "RECOVERY_AFRAID_TOWN_COST_PREVIEW") {
    const plan = tb2eStandardRecoveryPlan({ condition: "Afraid", phase: "Town", accommodation: "None" });
    return evidence(caseId, {
      sourceRecoveryAbility: plan.ability === "WILL",
      sourceObstacle: plan.obstacle === 3,
      lifestyleCostPreview: plan.townLifestyleCostPreview === 1,
      noCostOrConditionMutation: plan.lifestyleCostCommitted === false && plan.conditionMutationCommitted === false
    }, { plan }, gate);
  }

  if (caseId === "RECOVERY_HUNGRY_CAMP_NO_OB") {
    const plan = tb2eHungryThirstyRecoveryPlan({ phase: "Camp", foodSkill: "Hunter", cookPrepared: true });
    return evidence(caseId, {
      supportedFoodSkill: plan.foodSkillAllowed === true,
      cookingPreparationRequired: plan.cookPrepared === true,
      recoveryPreviewSatisfied: plan.satisfied === true,
      obstacleRemainsUnspecified: plan.obstacle === null && plan.obstacleAuthority === "UNAVAILABLE_NOT_IN_GUIDE",
      noMutation: plan.conditionMutationCommitted === false && plan.checkSpendCommitted === false
    }, { plan }, gate);
  }

  if (caseId === "RECOVERY_EXHAUSTED_SOURCE_BOUNDARY") {
    const plan = tb2eStandardRecoveryPlan({ condition: "Exhausted", phase: "Town", accommodation: "Inn" });
    return evidence(caseId, {
      recoveryPreviewAvailable: plan.ok === true,
      sourceBoundaryPreserved: /CAMP_TEST/.test(plan.phaseSourceBoundary ?? ""),
      sourceBoundaryStillUnresolved: plan.phaseSourceBoundary?.includes("CAMP_TOWN") === true,
      noRecoveryMutation: plan.conditionMutationCommitted === false && plan.liveApplication === false
    }, { plan }, gate);
  }

  if (caseId === "RECOVERY_HEALER_INJURY_PREVIEW") {
    const plan = tb2eHealerRecoveryPlan({ condition: "Injured", severity: "Burns" });
    return evidence(caseId, {
      healerSkill: plan.skill === "HEALER",
      sourceObstacle: plan.obstacle === 4,
      outOfOrderAllowed: plan.outOfOrderAllowed === true,
      failureRemainsNarrative: plan.failureProcedure === "GRIT_YOUR_TEETH",
      noConditionRemoval: plan.conditionMutationCommitted === false && plan.liveApplication === false
    }, { plan }, gate);
  }

  if (caseId === "CONFLICT_CONDITION_PENALTY_MANUAL") {
    const plan = tb2eConflictDispositionConditionPlan({ conditions: ["Hungry and Thirsty", "Exhausted", "Injured", "Sick"] });
    return evidence(caseId, {
      sourceConflictMarked: plan.resolution === "UNRESOLVED_SOURCE_CONFLICT",
      noPenaltyChoiceInvented: plan.chosenPenalty === null,
      conflictAutomationOff: plan.automation === false,
      conflictHandoffRemainsBlocked: plan.liveApplication === false && plan.writesPlanned === 0
    }, { plan }, gate, true);
  }

  throw new Error("Unsupported M10D.20 case: " + (caseId || "(empty)"));
}

export function runTb2eControlledConditionsRecoveryGrindHandoff(caseId, payload = {}) {
  const gate = requireGate();
  const key = String(caseId ?? "").trim().toUpperCase();
  if (!REQUIRED_CASES.includes(key)) throw new Error("Unsupported M10D.20 case: " + (key || "(empty)"));
  const row = evidenceFor(key, payload ?? {}, gate);
  runtimeEvidence.set(key, row);
  return row;
}

function buildMatrix(gate = gateSnapshot()) {
  return ["CONDITIONS", "GRIND", "RECOVERY", "SOURCE_BOUNDARIES"].map(domain => {
    const caseIds = REQUIRED_CASES.filter(id => CASE_DOMAIN[id] === domain);
    const rows = caseIds.map(id => runtimeEvidence.get(id)).filter(Boolean);
    const missing = caseIds.filter(id => !runtimeEvidence.has(id));
    const failed = rows.some(row => !row.ok);
    return freeze({
      id: domain,
      state: failed ? "EXECUTED_FAIL" : !missing.length ? "EXECUTED_PASS" : rows.length ? "EXECUTING" : "READY_FOR_CONTROLLED_EXECUTION",
      executed: rows.length > 0,
      passed: !failed && missing.length === 0,
      executedCaseCount: rows.length,
      passedCaseCount: rows.filter(row => row.ok).length,
      failedCaseCount: rows.filter(row => !row.ok).length,
      missingRequiredCases: missing,
      evidence: rows,
      gateLocked: gate.profileLocked,
      activationAvailable: gate.activationAvailable,
      writes: writesZero()
    });
  });
}

export function getTb2eControlledConditionsRecoveryGrindMatrix() { return buildMatrix(); }
export function getTb2eControlledConditionsRecoveryGrindStatus() {
  const gate = gateSnapshot();
  const matrix = buildMatrix(gate);
  const pending = matrix.flatMap(row => row.missingRequiredCases);
  const failed = matrix.filter(row => row.state === "EXECUTED_FAIL").map(row => row.id);
  const executed = matrix.filter(row => row.executed);
  const passed = matrix.filter(row => row.passed);
  return freeze({
    phase: "M10D.20",
    mode: "TB2E_CONTROLLED_CONDITIONS_RECOVERY_GRIND_QA_HANDOFF",
    ...gate,
    controlledExecutionReady: gate.qaRuntime && gate.gmAuthority && gate.sourceBounded && gate.profileLocked && gate.profileInactive && !gate.activationAvailable,
    controlledExecutionOnly: true,
    liveParityVerified: false,
    activationAuthorized: false,
    profileSwitchAuthorized: false,
    creationCommitAuthorized: false,
    domainCount: matrix.length,
    executedDomainCount: executed.length,
    passedDomainCount: passed.length,
    executedCaseCount: matrix.reduce((sum, row) => sum + row.executedCaseCount, 0),
    passedCaseCount: matrix.reduce((sum, row) => sum + row.passedCaseCount, 0),
    failedCaseCount: matrix.reduce((sum, row) => sum + row.failedCaseCount, 0),
    pendingCases: pending,
    pendingDomains: matrix.filter(row => !row.passed && row.state !== "EXECUTED_FAIL").map(row => row.id),
    failedDomains: failed,
    matrix,
    writes: writesZero(),
    randomRollExecuted: false,
    resourceSpendCommitted: false,
    conditionMutationCommitted: false,
    turnCounterMutationCommitted: false,
    phaseMutationCommitted: false,
    evidencePersistence: "MEMORY_ONLY",
    sourceBoundaries: [
      "CONFLICT_DISPOSITION_PENALTY_QR41_44_VS_QR51_UNRESOLVED_NO_AUTOMATION",
      "HUNGRY_CAMP_RECOVERY_OBSTACLE_UNAVAILABLE_IN_GUIDE",
      "EXHAUSTED_RECOVERY_CAMP_TEST_WORDING_VS_CAMP_TOWN_CONTEXT_UNRESOLVED",
      "EXHAUSTED_BONUS_STACKING_UNSPECIFIED_NO_AUTOMATIC_SUMMING",
      "CAMP_TOWN_EVENT_TABLES_NOT_AUTOMATED"
    ],
    nextStep: pending.length || failed.length
      ? "Complete all deterministic Conditions/Recovery/Grind handoff cases"
      : "Run Foundry zero-write, reload-reset and existing-profile regression gates; no activation or general TB2E parity is authorized"
  });
}
export function resetTb2eControlledConditionsRecoveryGrindEvidence() {
  requireGate();
  runtimeEvidence.clear();
  return getTb2eControlledConditionsRecoveryGrindStatus();
}
