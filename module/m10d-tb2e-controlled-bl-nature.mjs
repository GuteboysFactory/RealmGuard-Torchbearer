import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationAvailable, qaProfileActivationRuntime } from "./m10-profile-activation.mjs";
import { tb2eBeginnersLuckAbilityPlan } from "./m10d-tb2e-abilities-shadow.mjs";
import { tb2eChannelNaturePlan, tb2eChannelNatureTaxPlan, tb2eNatureAdvancementPlan, tb2eNatureSubstitutionPlan, tb2eNatureSubstitutionTaxPlan } from "./m10d-tb2e-nature-shadow.mjs";
import { tb2eBeginnersLuckShadowPlan, tb2eTestPoolPlan, tb2eTestShadowStatus } from "./m10d-tb2e-test-shadow.mjs";
import { tb2eAbilitySkillShadowStatus } from "./m10d-tb2e-abilities-shadow.mjs";
import { tb2eNatureShadowStatus } from "./m10d-tb2e-nature-shadow.mjs";

const PROFILE_ID = "torchbearer2e";
const REQUIRED_CASES = Object.freeze([
  "BL_WILL_POOL_PASS",
  "BL_HEALTH_POOL_PASS",
  "BL_ZERO_ABILITY_BLOCKED",
  "NATURE_SUBSTITUTION_DESCRIPTOR_PASS",
  "NATURE_SUBSTITUTION_OUTSIDE_FAIL",
  "NATURE_CHANNEL_PASS",
  "NATURE_CHANNEL_RESOURCES_BLOCKED",
  "NATURE_ADVANCEMENT_MAX7_CURRENT6",
  "NATURE_ADVANCEMENT_CURRENT7"
]);
const CASE_DOMAIN = Object.freeze({
  BL_WILL_POOL_PASS: "BEGINNERS_LUCK",
  BL_HEALTH_POOL_PASS: "BEGINNERS_LUCK",
  BL_ZERO_ABILITY_BLOCKED: "BEGINNERS_LUCK",
  NATURE_SUBSTITUTION_DESCRIPTOR_PASS: "NATURE",
  NATURE_SUBSTITUTION_OUTSIDE_FAIL: "NATURE",
  NATURE_CHANNEL_PASS: "NATURE",
  NATURE_CHANNEL_RESOURCES_BLOCKED: "NATURE",
  NATURE_ADVANCEMENT_MAX7_CURRENT6: "NATURE",
  NATURE_ADVANCEMENT_CURRENT7: "NATURE"
});
const runtimeEvidence = new Map();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}
function isInteger(value) { return Number.isInteger(Number(value)); }

function gateSnapshot() {
  const profile = resolveRulesProfile(PROFILE_ID).profile;
  const activeProfile = getRulesProfileRuntime().profile;
  const version = String(globalThis.game?.system?.version ?? "");
  const metadata = profile.metadata ?? {};
  const test = tb2eTestShadowStatus();
  const abilities = tb2eAbilitySkillShadowStatus();
  const nature = tb2eNatureShadowStatus();
  const supportedClassifications = ["VERIFIED", "PARTIAL", "BOUNDED_PARTIAL"];
  const sourceBounded = test.adapterReady === true
    && abilities.adapterReady === true
    && nature.adapterReady === true
    && supportedClassifications.includes(test.sourceClassification)
    && supportedClassifications.includes(abilities.sourceClassification)
    && supportedClassifications.includes(nature.sourceClassification);
  const qaRuntime = version === "1.13.0-qa.20" && qaProfileActivationRuntime();
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
    phase: "M10D.19",
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
  if (!gate.qaRuntime) throw new Error("Beginner's Luck / Nature handoff is restricted to v1.13.0-qa.20.");
  if (!gate.gmAuthority) throw new Error("Beginner's Luck / Nature handoff is GM-only.");
  if (!gate.sourceBounded) throw new Error("The bounded TB2E Test, Ability and Nature shadows are required.");
  if (!gate.profileLocked || gate.activationAvailable) throw new Error("TB2E handoff requires the locked FOUNDATION_ONLY profile.");
  if (!gate.profileInactive) throw new Error("TB2E handoff requires Torchbearer to remain inactive.");
  return gate;
}

function rejected(caseId, reasonCode, gate, extra = {}) {
  return freeze({
    caseId, expectedRejected: true, ok: true, reasonCode, ...extra,
    provider: "TB2E_M10D19_BL_NATURE_SHADOW_TO_CORE_M3",
    route: "TORCHBEARER2E_BL_NATURE_SHADOW_TO_EXISTING_CORE_M3",
    ...gate, randomRollExecuted: false, suppliedFacesEvaluated: false,
    liveApplication: false, resourceSpendCommitted: false,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 }
  });
}

function runM3(caseId, domain, sourceName, basePool, diceModifier, obstacle, faces, gate) {
  if (!Array.isArray(faces) || faces.some(face => !isInteger(face) || Number(face) < 1 || Number(face) > 6)) {
    throw new Error("Valid caller-supplied deterministic d6 faces are required.");
  }
  if (!isInteger(obstacle) || Number(obstacle) < 1) throw new Error("A positive caller-supplied Obstacle is required.");
  if (!String(sourceName ?? "").trim()) throw new Error("A caller-supplied sourceName is required.");
  const pool = tb2eTestPoolPlan({ basePool, diceModifier, successModifier: 0 });
  if (!pool.ok) throw new Error("Invalid source-bounded dice pool: " + pool.reasonCode);
  if (pool.finalPool !== faces.length) throw new Error("Supplied face count must match the final deterministic dice pool.");
  const engine = globalThis.game?.realmGuard?.core?.tests?.engine;
  if (!engine || typeof engine.runDeterministic !== "function") {
    throw new Error("CORE M3 Test Engine is unavailable; this handoff fails closed.");
  }
  const run = engine.runDeterministic({
    id: "m10d19-" + caseId.toLowerCase(),
    context: {
      type: "ordinary",
      sourceName: String(sourceName),
      isSkill: false,
      metadata: { domain: domain, source: "CALLER_SUPPLIED_QA_CASE" }
    },
    basePool: Number(basePool),
    obstacle: Number(obstacle),
    successModifier: 0,
    successThreshold: 4,
    profileId: PROFILE_ID,
    profileVersion: 1,
    provenance: {
      provider: "TB2E_M10D19_BL_NATURE_SHADOW_TO_CORE_M3",
      route: "TORCHBEARER2E_BL_NATURE_SHADOW_TO_EXISTING_CORE_M3",
      obstacleAuthority: "CALLER_SUPPLIED",
      obstacleFactorsAutomated: false
    }
  }, {
    diceModifier: Number(diceModifier),
    provenance: { sourceClassification: "PARTIAL", execution: "DETERMINISTIC_QA_ONLY" }
  }, faces.map(Number));
  return { pool, run };
}

function planBeginnersLuck(caseId, payload, gate) {
  const ability = tb2eBeginnersLuckAbilityPlan({
    skillName: payload.skillName,
    abilityRating: payload.abilityRating
  });
  if (!ability.ok) return rejected(caseId, ability.reasonCode, gate, { abilityPlan: ability });
  const components = payload.components ?? {};
  const plan = tb2eBeginnersLuckShadowPlan({
    ...components,
    abilityDice: Number(payload.abilityRating),
    abilityZeroDueToInjuryOrSickness: Number(payload.abilityRating) === 0
  });
  if (!plan.ok) return rejected(caseId, plan.reasonCode, gate, { abilityPlan: ability, beginnersLuckPlan: plan });
  const expectedAbility = caseId === "BL_WILL_POOL_PASS" ? "WILL" : "HEALTH";
  if (ability.ability !== expectedAbility) throw new Error(caseId + " must use " + expectedAbility + ".");
  return { ability, plan };
}

function evidenceFor(caseId, payload, gate) {
  if (caseId === "BL_ZERO_ABILITY_BLOCKED") {
    const abilityPlan = tb2eBeginnersLuckAbilityPlan({ skillName: payload.skillName, abilityRating: 0 });
    const poolPlan = tb2eBeginnersLuckShadowPlan({ ...payload.components, abilityDice: 0 });
    if (abilityPlan.ok || poolPlan.ok) throw new Error("Beginner's Luck must reject a zero ability.");
    return rejected(caseId, abilityPlan.reasonCode, gate, { abilityPlan, beginnersLuckPlan: poolPlan });
  }

  if (caseId === "NATURE_ADVANCEMENT_MAX7_CURRENT6" || caseId === "NATURE_ADVANCEMENT_CURRENT7") {
    const plan = tb2eNatureAdvancementPlan({
      currentNature: payload.currentNature,
      maximumNature: payload.maximumNature,
      advancementTriggered: true
    });
    if (!plan.ok) return rejected(caseId, plan.reasonCode, gate, { naturePlan: plan });
    const expectedReview = caseId === "NATURE_ADVANCEMENT_CURRENT7";
    const checks = {
      currentAndMaximumStaySeparate: plan.currentAfter <= plan.maximumAfter,
      retirementReviewMatchesCurrentRating: plan.retirementCheckRequired === expectedReview,
      endOfSessionOnly: plan.retirementTiming === (expectedReview ? "END_OF_SESSION" : null),
      noAutomaticRetirement: plan.liveApplication === false
    };
    return freeze({
      caseId, ok: Object.values(checks).every(Boolean), expectedRejected: false,
      provider: "TB2E_M10D19_NATURE_SHADOW",
      route: "TORCHBEARER2E_NATURE_ADVANCEMENT_MANUAL_REVIEW",
      naturePlan: plan, checks, ...gate,
      randomRollExecuted: false, suppliedFacesEvaluated: false, liveApplication: false,
      writes: { actors: 0, items: 0, journals: 0, settings: 0 }
    });
  }

  let domain, sourceName, basePool, diceModifier, obstacle, faces;
  let rulesPlan, abilityPlan = null, taxPlan = null;
  if (caseId === "BL_WILL_POOL_PASS" || caseId === "BL_HEALTH_POOL_PASS") {
    const bl = planBeginnersLuck(caseId, payload, gate);
    if (bl.expectedRejected) return bl;
    abilityPlan = bl.ability;
    rulesPlan = bl.plan;
    domain = "TB2E_BEGINNERS_LUCK";
    sourceName = "Beginner's Luck / " + bl.ability.skill;
    basePool = rulesPlan.finalPool;
    diceModifier = 0;
    obstacle = payload.obstacle;
    faces = payload.faces;
  } else if (caseId === "NATURE_SUBSTITUTION_DESCRIPTOR_PASS" || caseId === "NATURE_SUBSTITUTION_OUTSIDE_FAIL") {
    rulesPlan = tb2eNatureSubstitutionPlan({
      currentNature: payload.currentNature,
      maximumNature: payload.maximumNature,
      descriptorApplies: payload.descriptorApplies,
      targetSkillUnavailable: true
    });
    if (!rulesPlan.ok) return rejected(caseId, rulesPlan.reasonCode, gate, { naturePlan: rulesPlan });
    domain = "TB2E_NATURE_SUBSTITUTION";
    sourceName = "Nature substitution / " + String(payload.targetSkill ?? "source-supplied skill");
    basePool = payload.basePool;
    diceModifier = rulesPlan.dice;
    obstacle = payload.obstacle;
    faces = payload.faces;
  } else if (caseId === "NATURE_CHANNEL_PASS" || caseId === "NATURE_CHANNEL_RESOURCES_BLOCKED") {
    rulesPlan = tb2eChannelNaturePlan({
      currentNature: payload.currentNature,
      maximumNature: payload.maximumNature,
      testName: payload.testName,
      descriptorApplies: payload.descriptorApplies,
      personaAvailable: payload.personaAvailable
    });
    if (caseId === "NATURE_CHANNEL_RESOURCES_BLOCKED" && rulesPlan.ok) throw new Error("Channel Nature must be blocked for Resources.");
    if (caseId !== "NATURE_CHANNEL_RESOURCES_BLOCKED" && !rulesPlan.ok) return rejected(caseId, rulesPlan.reasonCode, gate, { naturePlan: rulesPlan });
    if (caseId === "NATURE_CHANNEL_RESOURCES_BLOCKED") return rejected(caseId, rulesPlan.reasonCode, gate, { naturePlan: rulesPlan });
    domain = "TB2E_NATURE_CHANNEL";
    sourceName = "Channel Nature / " + String(payload.targetSkill ?? payload.testName ?? "source-supplied test");
    basePool = payload.basePool;
    diceModifier = rulesPlan.diceAdded;
    obstacle = payload.obstacle;
    faces = payload.faces;
  } else {
    throw new Error("Unsupported M10D.19 case: " + caseId);
  }

  const evaluated = runM3(caseId, domain, sourceName, basePool, diceModifier, obstacle, faces, gate);
  const result = evaluated.run.result;
  if (caseId === "NATURE_SUBSTITUTION_DESCRIPTOR_PASS" || caseId === "NATURE_SUBSTITUTION_OUTSIDE_FAIL") {
    taxPlan = tb2eNatureSubstitutionTaxPlan({
      currentNature: payload.currentNature,
      maximumNature: payload.maximumNature,
      descriptorApplies: payload.descriptorApplies,
      outcome: result.outcome,
      marginOfFailure: result.margin
    });
  } else if (caseId === "NATURE_CHANNEL_PASS" || caseId === "NATURE_CHANNEL_RESOURCES_BLOCKED") {
    taxPlan = tb2eChannelNatureTaxPlan({
      currentNature: payload.currentNature,
      maximumNature: payload.maximumNature,
      descriptorApplies: payload.descriptorApplies,
      outcome: result.outcome,
      marginOfFailure: result.margin
    });
  }
  const expected = {
    BL_WILL_POOL_PASS: { outcome: "PASS" },
    BL_HEALTH_POOL_PASS: { outcome: "PASS" },
    NATURE_SUBSTITUTION_DESCRIPTOR_PASS: { outcome: "PASS", tax: 0 },
    NATURE_SUBSTITUTION_OUTSIDE_FAIL: { outcome: "FAIL", tax: 2 },
    NATURE_CHANNEL_PASS: { outcome: "PASS", tax: 0 }
  }[caseId];
  const checks = {
    existingM3Used: evaluated.run.request.profileId === PROFILE_ID,
    providerIsTb2eOwned: evaluated.run.request.provenance?.provider === "TB2E_M10D19_BL_NATURE_SHADOW_TO_CORE_M3",
    callerObstaclePreserved: evaluated.run.request.obstacle === Number(obstacle),
    obstacleFactorsRemainManual: evaluated.run.request.provenance?.obstacleFactorsAutomated === false,
    suppliedFacesMatch: JSON.stringify(result.faces) === JSON.stringify(faces.map(Number)),
    poolMatchesShadow: evaluated.run.plan.finalPool === evaluated.pool.finalPool,
    expectedOutcome: result.outcome === expected?.outcome,
    expectedTax: taxPlan === null || taxPlan.taxAmount === expected?.tax,
    resolvedWithoutApplication: evaluated.run.transaction.state === "RESOLVED"
  };
  return freeze({
    caseId, ok: Object.values(checks).every(Boolean), expectedRejected: false,
    provider: "TB2E_M10D19_BL_NATURE_SHADOW_TO_CORE_M3",
    route: "TORCHBEARER2E_BL_NATURE_SHADOW_TO_EXISTING_CORE_M3",
    abilityPlan, rulesPlan, poolPlan: evaluated.pool, result, transaction: evaluated.run.transaction.snapshot(),
    taxPlan, checks, ...gate,
    randomRollExecuted: false, suppliedFacesEvaluated: true,
    liveApplication: false, resourceSpendCommitted: false,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 }
  });
}

export function runTb2eControlledBlNatureHandoff(caseId, payload = {}) {
  const gate = requireGate();
  const key = String(caseId ?? "").trim().toUpperCase();
  if (!REQUIRED_CASES.includes(key)) throw new Error("Unsupported M10D.19 case: " + (key || "(empty)"));
  const evidence = evidenceFor(key, payload, gate);
  runtimeEvidence.set(key, evidence);
  return evidence;
}

function buildMatrix(gate = gateSnapshot()) {
  return ["BEGINNERS_LUCK", "NATURE"].map(domain => {
    const caseIds = REQUIRED_CASES.filter(id => CASE_DOMAIN[id] === domain);
    const rows = caseIds.map(id => runtimeEvidence.get(id)).filter(Boolean);
    const missing = caseIds.filter(id => !runtimeEvidence.has(id));
    const failed = rows.some(row => !row.ok);
    return freeze({
      id: domain, state: failed ? "EXECUTED_FAIL" : !missing.length ? "EXECUTED_PASS" : rows.length ? "EXECUTING" : "READY_FOR_CONTROLLED_EXECUTION",
      executed: rows.length > 0, passed: !failed && missing.length === 0,
      executedCaseCount: rows.length, passedCaseCount: rows.filter(row => row.ok).length,
      failedCaseCount: rows.filter(row => !row.ok).length, missingRequiredCases: missing,
      evidence: rows, gateLocked: gate.profileLocked, activationAvailable: gate.activationAvailable,
      writes: { actors: 0, items: 0, journals: 0, settings: 0 }
    });
  });
}

export function getTb2eControlledBlNatureMatrix() { return buildMatrix(); }
export function getTb2eControlledBlNatureStatus() {
  const gate = gateSnapshot();
  const matrix = buildMatrix(gate);
  const pending = matrix.flatMap(row => row.missingRequiredCases);
  const failed = matrix.filter(row => row.state === "EXECUTED_FAIL").map(row => row.id);
  const executed = matrix.filter(row => row.executed);
  const passed = matrix.filter(row => row.passed);
  return freeze({
    phase: "M10D.19", mode: "TB2E_CONTROLLED_BEGINNERS_LUCK_NATURE_QA_HANDOFF",
    ...gate,
    controlledExecutionReady: gate.qaRuntime && gate.gmAuthority && gate.sourceBounded && gate.profileLocked && gate.profileInactive && !gate.activationAvailable,
    controlledExecutionOnly: true, liveParityVerified: false, activationAuthorized: false,
    profileSwitchAuthorized: false, creationCommitAuthorized: false,
    domainCount: matrix.length, executedDomainCount: executed.length, passedDomainCount: passed.length,
    executedCaseCount: executed.reduce((sum, row) => sum + row.executedCaseCount, 0),
    passedCaseCount: matrix.reduce((sum, row) => sum + row.passedCaseCount, 0),
    failedCaseCount: matrix.reduce((sum, row) => sum + row.failedCaseCount, 0),
    pendingCases: pending, pendingDomains: matrix.filter(row => !row.passed && row.state !== "EXECUTED_FAIL").map(row => row.id),
    failedDomains: failed, matrix,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 },
    randomRollExecuted: false, resourceSpendCommitted: false, evidencePersistence: "MEMORY_ONLY",
    nextStep: pending.length || failed.length
      ? "Complete all deterministic Beginner's Luck and Nature handoff cases through CORE M3"
      : "Run Foundry zero-write, reload-reset and existing-profile regression gates; no activation or general live parity is authorized"
  });
}
export function resetTb2eControlledBlNatureEvidence() {
  requireGate();
  runtimeEvidence.clear();
  return getTb2eControlledBlNatureStatus();
}
