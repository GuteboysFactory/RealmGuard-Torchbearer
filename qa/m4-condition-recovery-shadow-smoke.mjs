import assert from "node:assert/strict";
import { ConditionService, CapabilityBlockService, RecoveryService } from "../module/core/m4-services.mjs";
import { compareConditionRollObservation, compareRecoveryPreparation, compareRecoveryResolution } from "../module/m4-condition-recovery-shadow-parity.mjs";

const item = ({ id, name, active = true, rollModifier = 0, appliesTo = "all", recoveryType = "manual", recoveryAbility = "", recoveryRole = "", recoveryObstacle = 1, type = "condition", rating = 0, isDefault = true }) => ({
  id, name, type,
  system: { active, rollModifier, appliesTo, recoveryType, recoveryAbility, recoveryRole, recoveryObstacle, rating },
  getFlag: (_scope, key) => key === "defaultCondition" ? isDefault : undefined
});

const conditions = [
  item({ id: "angry", name: "Angry", appliesTo: "none", recoveryType: "ability", recoveryAbility: "will", recoveryObstacle: 2 }),
  item({ id: "strained", name: "Strained", rollModifier: -1, appliesTo: "skills,nature,will,health", recoveryType: "ability", recoveryAbility: "will", recoveryObstacle: 4 }),
  item({ id: "afraid", name: "Afraid", appliesTo: "none", recoveryType: "ability", recoveryAbility: "will", recoveryObstacle: 3 }),
  item({ id: "custom", name: "Bog Fever", rollModifier: -2, appliesTo: "scout", recoveryType: "role", recoveryRole: "Healer", recoveryObstacle: 3, isDefault: false }),
  item({ id: "healer", name: "Healer", type: "role", rating: 4, active: false })
];
const actor = {
  id: "actor-1",
  items: conditions,
  system: {
    attributes: { will: { value: 5 }, health: { value: 4 }, resources: { value: 2 }, circles: { value: 2 }, nature: { value: 4, maximum: 5 } },
    resources: { checks: { value: 3 } }
  }
};

const conditionService = new ConditionService();
const capabilityService = new CapabilityBlockService();
const recoveryService = new RecoveryService(conditionService);

let effect = conditionService.collectRollEffects(actor, "Scout", { isSkill: true });
assert.equal(effect.diceModifier, -3);
assert.deepEqual(effect.conditions.map(c => c.name), ["Strained", "Bog Fever"]);
let comparison = compareConditionRollObservation({ active: [conditions[1], conditions[3]], dice: -3 }, effect);
assert.equal(comparison.match, true);

assert.equal(capabilityService.isBlocked(actor, "BENEFICIAL_TRAIT_WISE").blocked, true);
assert.equal(capabilityService.isBlocked(actor, "HELP").blocked, true);
assert.equal(capabilityService.isBlocked(actor, "BEGINNER_LUCK").blocked, true);

let coreValidation = recoveryService.validate(actor, "strained", { turnManagerEnabled: false, phase: "free" });
assert.equal(coreValidation.ok, false);
assert.equal(coreValidation.reasonCode, "RECOVERY_ORDER");
assert.equal(coreValidation.blocker.name, "Angry");

const angryMethods = recoveryService.methods(actor, "angry");
assert.equal(angryMethods.length, 1);
assert.equal(angryMethods[0].kind, "ability");
assert.equal(angryMethods[0].name, "Will");
assert.equal(angryMethods[0].obstacle, 2);

const customMethods = recoveryService.methods(actor, "custom");
assert.equal(customMethods.length, 1);
assert.equal(customMethods[0].kind, "role");
assert.equal(customMethods[0].name, "Healer");
assert.equal(customMethods[0].obstacle, 3);

comparison = compareRecoveryPreparation({
  legacyValidation: { ok: true },
  coreValidation: { ok: true, reasonCode: "OK" },
  legacyMethods: [{ kind: "ability", key: "will", name: "Will", obstacle: 2, dice: 5 }],
  coreMethods: [{ kind: "ability", key: "will", name: "Will", obstacle: 2, dice: 5 }]
});
assert.equal(comparison.match, true);

comparison = compareRecoveryResolution({
  beforeActive: true,
  afterActive: false,
  result: { passed: true, tied: false, outcome: "PASS" },
  ignoreConditions: true,
  selectedMethod: { kind: "ability", key: "will", name: "Will", obstacle: 2, dice: 5 },
  expectedMethods: [{ kind: "ability", key: "will", name: "Will", obstacle: 2, dice: 5 }],
  checksBefore: 4,
  checksAfter: 2,
  economy: { phase: "gm", cost: 2 },
  attemptRecorded: true,
  turnManager: true
});
assert.equal(comparison.match, true);

comparison = compareRecoveryResolution({
  beforeActive: true,
  afterActive: true,
  result: { passed: false, tied: false, outcome: "FAIL" },
  ignoreConditions: true,
  selectedMethod: { kind: "ability", key: "will", name: "Will", obstacle: 2, dice: 5 },
  expectedMethods: [{ kind: "ability", key: "will", name: "Will", obstacle: 2, dice: 5 }],
  checksBefore: 3,
  checksAfter: 3,
  economy: { phase: "free", cost: 0 },
  attemptRecorded: null,
  turnManager: false
});
assert.equal(comparison.match, true);

console.log("PASS m4-condition-recovery-shadow-smoke");
