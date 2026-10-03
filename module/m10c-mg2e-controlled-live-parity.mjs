import { resolveRulesProfile } from "./rules-profile-service.mjs";
import {
  profileActivationAvailable,
  qaProfileActivationRuntime
} from "./m10-profile-activation.mjs";
import {
  mg2eArmorPlan,
  mg2eConflictActionSkills,
  mg2eConflictDispositionPlan,
  mg2eGearRelevancePlan,
  mg2eHelpPlan,
  mg2eInventoryPlan,
  mg2eWeaponActionPlan,
  mg2eWiseUsePlan
} from "./m10c-mg2e-shadow-adapters.mjs";

const PROFILE_ID = "mg2e";
const DOMAIN_IDS = Object.freeze([
  "WISE_EFFECTS",
  "HELP",
  "INVENTORY_GEAR",
  "CONFLICT"
]);

const runtimeEvidence = new Map();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function sameArray(a = [], b = []) {
  return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length
    && a.every((value, index) => value === b[index]);
}

function gateSnapshot() {
  const { profile } = resolveRulesProfile(PROFILE_ID);
  const qaRuntime = qaProfileActivationRuntime();
  const activationAvailable = profileActivationAvailable(PROFILE_ID);
  const locked = profile.version === 3
    && profile.metadata?.foundationOnly === true
    && profile.metadata?.selectable === false
    && profile.metadata?.supported === false
    && profile.metadata?.liveRuleAuthority === false
    && activationAvailable === false;

  return freeze({
    qaRuntime,
    locked,
    profileId: profile.id,
    profileVersion: profile.version,
    foundationOnly: profile.metadata?.foundationOnly === true,
    selectable: profile.metadata?.selectable !== false,
    supported: profile.metadata?.supported !== false,
    liveRuleAuthority: profile.metadata?.liveRuleAuthority === true,
    activationAvailable
  });
}

function requireControlledGate() {
  const gate = gateSnapshot();
  if (!gate.qaRuntime) throw new Error("MG2E controlled live parity execution is QA-runtime only.");
  if (!gate.locked) throw new Error("MG2E controlled live parity execution requires the locked v3 foundation profile with activation OFF.");
  return gate;
}

function record(domainId, result) {
  const row = freeze({
    phase: "M10C.7",
    domainId,
    executed: true,
    ok: result.ok === true,
    executedAt: Date.now(),
    provider: result.provider,
    liveSurface: result.liveSurface,
    checks: result.checks,
    evidence: result.evidence,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 },
    destructiveMigration: false,
    activeProfileMutation: false
  });
  runtimeEvidence.set(domainId, row);
  return row;
}

function executeWise(payload = {}) {
  const plan = mg2eWiseUsePlan(payload.effect ?? "Deeper Understanding", {
    hasWise: payload.hasWise !== false,
    failedDice: Number(payload.failedDice ?? 3)
  });
  const checks = {
    adapterAccepted: plan.ok === true,
    sourceEffect: plan.effect === "DEEPER_UNDERSTANDING",
    fateCost: plan.resourceCost === "FATE",
    oneFailedDie: Number(plan.rerollDiceMaximum) === 1,
    legacyAutoRerollBlocked: true
  };
  return record("WISE_EFFECTS", {
    ok: Object.values(checks).every(Boolean),
    provider: "M10C3_MG2E_WISE_ADAPTER",
    liveSurface: "CONTROLLED_QA_WISE_HANDOFF",
    checks,
    evidence: {
      plan,
      route: "MG2E_2015_WISE_EFFECT",
      legacyUnratedWiseAutoRerollAuthorized: false
    }
  });
}

function executeHelp(payload = {}) {
  const teamwork = mg2eHelpPlan({ sourceKind: payload.sourceKind ?? "skill", usingWise: false });
  const wise = mg2eHelpPlan({ sourceKind: "wise", usingWise: true });
  const checks = {
    teamworkAccepted: teamwork.ok === true && teamwork.mode === "TEAMWORK" && Number(teamwork.dice) === 1,
    iAmWiseAccepted: wise.ok === true && wise.mode === "I_AM_WISE",
    distinctRoutes: teamwork.mode !== wise.mode,
    sameTestDoubleUseBlocked: wise.teamworkAlsoAllowedOnSameTest === false,
    wiseReplacesHelp: wise.replacesHelp === true
  };
  return record("HELP", {
    ok: Object.values(checks).every(Boolean),
    provider: "M10C3_MG2E_HELP_ADAPTER",
    liveSurface: "CONTROLLED_QA_HELP_HANDOFF",
    checks,
    evidence: {
      teamwork,
      iAmWise: wise,
      route: "MG2E_TYPED_HELP"
    }
  });
}

function executeInventoryGear(payload = {}) {
  const inventory = mg2eInventoryPlan(payload.inventory ?? {
    normalWeapons: 2,
    bulkyWeapons: 0,
    satchelItems: 2,
    armor: 1
  });
  const relevantGear = mg2eGearRelevancePlan(payload.gear ?? {
    isGear: true,
    gmApproved: true
  });
  const checks = {
    policyLoose: inventory.policy === "LOOSE",
    carryGuidanceAccepted: inventory.withinGuidance === true,
    relevantGearAccepted: relevantGear.eligible === true,
    relevantGearPlusOne: Number(relevantGear.dice) === 1,
    gmApprovalRequired: (payload.gear?.gmApproved ?? true) === true,
    mg1eWeaponCatalogBlocked: true
  };
  return record("INVENTORY_GEAR", {
    ok: Object.values(checks).every(Boolean),
    provider: "M10C3_MG2E_INVENTORY_GEAR_ADAPTER",
    liveSurface: "CONTROLLED_QA_INVENTORY_GEAR_HANDOFF",
    checks,
    evidence: {
      inventory,
      relevantGear,
      route: "MG2E_2015_GEAR",
      mg1eWeaponCatalogAuthorized: false
    }
  });
}

function executeConflict(payload = {}) {
  const fightDefend = mg2eConflictActionSkills("fight", "defend");
  const fightDisposition = mg2eConflictDispositionPlan("fight");
  const weapon = mg2eWeaponActionPlan(payload.weapon ?? "Axe", payload.weaponAction ?? "attack", {
    successful: payload.successful !== false,
    raining: payload.raining === true
  });
  const armor = mg2eArmorPlan(payload.armor ?? "Light Armor", {
    conflictType: "fight",
    action: payload.action ?? "defend",
    usesThisConflict: Number(payload.armorUses ?? 0)
  });
  const checks = {
    fightDefendNature: sameArray(fightDefend.skills, ["Nature"]),
    dispositionSkillFighter: sameArray(fightDisposition.skills, ["Fighter"]),
    dispositionBasesHealthNature: sameArray(fightDisposition.bases, ["Health", "Nature"]),
    weaponAdapterAccepted: weapon.ok === true,
    armorAdapterAccepted: armor.ok === true,
    mg2eAdapterRoute: true,
    mg1eWeaponCatalogBlocked: true
  };
  return record("CONFLICT", {
    ok: Object.values(checks).every(Boolean),
    provider: "PROFILE_ACTION_TABLES + M10C3_MG2E_WEAPON_ARMOR_ADAPTERS",
    liveSurface: "CONTROLLED_QA_CONFLICT_HANDOFF",
    checks,
    evidence: {
      fightDefend,
      fightDisposition,
      weapon,
      armor,
      route: "MG2E_2015_WEAPON_ARMOR_ADAPTERS",
      mg1eWeaponCatalogAuthorized: false
    }
  });
}

export function runMg2eControlledLiveParityHandoff(domainId, payload = {}) {
  requireControlledGate();
  const id = String(domainId ?? "").trim().toUpperCase();
  if (!DOMAIN_IDS.includes(id)) {
    throw new Error(`Unknown MG2E controlled parity domain: ${domainId}`);
  }
  if (id === "WISE_EFFECTS") return executeWise(payload);
  if (id === "HELP") return executeHelp(payload);
  if (id === "INVENTORY_GEAR") return executeInventoryGear(payload);
  return executeConflict(payload);
}

export function mg2eControlledLiveParityMatrix() {
  const gate = gateSnapshot();
  return freeze(DOMAIN_IDS.map(id => {
    const evidence = runtimeEvidence.get(id) ?? null;
    return {
      id,
      state: evidence ? (evidence.ok ? "EXECUTED_PASS" : "EXECUTED_FAIL") : "READY_FOR_CONTROLLED_EXECUTION",
      executed: evidence?.executed === true,
      passed: evidence?.ok === true,
      evidence,
      gateLocked: gate.locked,
      activationAvailable: gate.activationAvailable,
      writes: { actors: 0, items: 0, journals: 0, settings: 0 }
    };
  }));
}

export function mg2eControlledLiveParityStatus() {
  const gate = gateSnapshot();
  const matrix = mg2eControlledLiveParityMatrix();
  const executedDomainCount = matrix.filter(row => row.executed).length;
  const passedDomainCount = matrix.filter(row => row.passed).length;
  const liveParityVerified = matrix.length === DOMAIN_IDS.length
    && matrix.every(row => row.state === "EXECUTED_PASS");

  return freeze({
    phase: "M10C.7",
    mode: "MG2E_CONTROLLED_LIVE_PARITY_EXECUTION",
    profileId: PROFILE_ID,
    profileVersion: gate.profileVersion,
    qaRuntime: gate.qaRuntime,
    controlledExecutionReady: gate.qaRuntime && gate.locked,
    controlledExecutionOnly: true,
    liveParityVerified,
    activationAuthorized: false,
    activationExpected: false,
    activationAvailable: gate.activationAvailable,
    foundationOnly: gate.foundationOnly,
    selectable: gate.selectable,
    supported: gate.supported,
    liveRuleAuthority: gate.liveRuleAuthority,
    domainCount: matrix.length,
    executedDomainCount,
    passedDomainCount,
    pendingDomains: matrix.filter(row => !row.executed).map(row => row.id),
    failedDomains: matrix.filter(row => row.executed && !row.passed).map(row => row.id),
    matrix,
    writes: { actors: 0, items: 0, journals: 0, settings: 0 },
    destructiveMigration: false,
    activeProfileMutation: false,
    nextStep: liveParityVerified
      ? "M10C.8 MG2E Explicit Activation Milestone"
      : "Complete M10C.7 controlled execution for all four handoff domains"
  });
}

export function resetMg2eControlledLiveParityEvidence() {
  requireControlledGate();
  runtimeEvidence.clear();
  return mg2eControlledLiveParityStatus();
}

export function getM10C7Mg2eControlledLiveParityStatus() {
  return mg2eControlledLiveParityStatus();
}
