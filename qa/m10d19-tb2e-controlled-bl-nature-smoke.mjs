import assert from "node:assert/strict";
import fs from "node:fs";
import { TestEngine } from "../module/core/test-engine.mjs";
import { refreshRulesProfileRuntime, resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { installM10DFoundation } from "../module/m10d-tb2e-foundation.mjs";
import { tb2eBeginnersLuckShadowPlan } from "../module/m10d-tb2e-test-shadow.mjs";
import { tb2eNatureAdvancementPlan, tb2eNatureModel } from "../module/m10d-tb2e-nature-shadow.mjs";
import { profileActivationAvailable } from "../module/m10-profile-activation.mjs";

const existingIds = ["realm-guard-legacy-mixed", "realm-guard-strict", "mg1e", "mg2e"];
const beforeProfiles = JSON.stringify(existingIds.map(id => resolveRulesProfile(id)));
const settings = new Map([
  ["activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["activeRulesProfileVersion", 1],
  ["systemSchemaVersion", 1],
  ["coreArchitectureVersion", "0.1"],
  ["migrationHistory", "[]"],
  ["migrationLastError", ""]
]);
const writes = [];
const failWrite = name => (...args) => { writes.push({ name, args }); throw new Error("Unexpected write: " + name); };

globalThis.game = {
  system: { version: "1.13.0-qa.20" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] }, items: { contents: [] }, journal: { contents: [] },
  settings: { get: (_namespace, key) => settings.get(key), set: failWrite("setting") },
  realmGuard: { core: { tests: { engine: new TestEngine() }, m10: { sentinel: "unchanged" } } }
};
globalThis.Hooks = { once: (event, callback) => { assert.equal(event, "ready"); callback(); } };
globalThis.Actor = { create: failWrite("Actor.create") };
globalThis.Item = { create: failWrite("Item.create") };
globalThis.JournalEntry = { create: failWrite("JournalEntry.create") };

refreshRulesProfileRuntime();
installM10DFoundation();
const api = game.realmGuard.core.m10d.controlledBlNature;
assert.equal(typeof api.getStatus, "function");
assert.equal(typeof api.getMatrix, "function");
assert.equal(typeof api.runHandoff, "function");
assert.equal(typeof api.resetEvidence, "function");
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");

const initial = api.getStatus();
assert.equal(initial.phase, "M10D.19");
assert.equal(initial.mode, "TB2E_CONTROLLED_BEGINNERS_LUCK_NATURE_QA_HANDOFF");
assert.equal(initial.qaRuntime, true);
assert.equal(initial.gmAuthority, true);
assert.equal(initial.sourceBounded, true);
assert.equal(initial.profileLocked, true);
assert.equal(initial.profileInactive, true);
assert.equal(initial.activationAvailable, false);
assert.equal(initial.liveParityVerified, false);
assert.deepEqual(initial.writes, { actors: 0, items: 0, journals: 0, settings: 0 });

assert.equal(tb2eBeginnersLuckShadowPlan({ abilityDice: 0, helpDice: 3 }).reasonCode, "ABILITY_ZERO_DUE_TO_INJURY_OR_SICKNESS");
assert.equal(tb2eNatureModel().upperRetirementBoundary.ratingBasis, "CURRENT_NATURE");
const taxedToSeven = tb2eNatureAdvancementPlan({ currentNature: 5, maximumNature: 6, advancementTriggered: true });
assert.equal(taxedToSeven.currentAfter, 6);
assert.equal(taxedToSeven.maximumAfter, 7);
assert.equal(taxedToSeven.retirementCheckRequired, false);
const currentToSeven = tb2eNatureAdvancementPlan({ currentNature: 6, maximumNature: 6, advancementTriggered: true });
assert.equal(currentToSeven.retirementCheckRequired, true);
assert.equal(currentToSeven.retirementTiming, "END_OF_SESSION");

const cases = [
  ["BL_WILL_POOL_PASS", {
    skillName: "Scout", abilityRating: 4,
    components: { helpDice: 1, gearDice: 1, traitsDice: 1, freshDice: 1 },
    obstacle: 3, faces: [4, 1, 5, 2, 6]
  }],
  ["BL_HEALTH_POOL_PASS", {
    skillName: "Fighter", abilityRating: 3,
    components: { suppliesDice: 1, gearDice: 1, personaDice: 1 },
    obstacle: 2, faces: [4, 2, 3, 6]
  }],
  ["BL_ZERO_ABILITY_BLOCKED", { skillName: "Scout", components: {} }],
  ["NATURE_SUBSTITUTION_DESCRIPTOR_PASS", {
    currentNature: 4, maximumNature: 5, descriptorApplies: true,
    basePool: 2, obstacle: 3, targetSkill: "Scout", faces: [4, 1, 5, 2, 6, 1]
  }],
  ["NATURE_SUBSTITUTION_OUTSIDE_FAIL", {
    currentNature: 4, maximumNature: 5, descriptorApplies: false,
    basePool: 2, obstacle: 3, targetSkill: "Scout", faces: [4, 1, 2, 3, 1, 1]
  }],
  ["NATURE_CHANNEL_PASS", {
    currentNature: 3, maximumNature: 4, descriptorApplies: true,
    testName: "Scout", targetSkill: "Scout", personaAvailable: 1,
    basePool: 2, obstacle: 2, faces: [4, 5, 1, 2, 3]
  }],
  ["NATURE_CHANNEL_RESOURCES_BLOCKED", {
    currentNature: 3, maximumNature: 4, descriptorApplies: false,
    testName: "Resources", personaAvailable: 1
  }],
  ["NATURE_ADVANCEMENT_MAX7_CURRENT6", { currentNature: 5, maximumNature: 6 }],
  ["NATURE_ADVANCEMENT_CURRENT7", { currentNature: 6, maximumNature: 6 }]
];
const rows = cases.map(([id, payload]) => api.runHandoff(id, payload));
assert.deepEqual(rows.map(row => row.ok), [true, true, true, true, true, true, true, true, true]);
assert.equal(rows[0].abilityPlan.ability, "WILL");
assert.equal(rows[0].rulesPlan.finalPool, 5);
assert.equal(rows[0].result.outcome, "PASS");
assert.equal(rows[1].abilityPlan.ability, "HEALTH");
assert.equal(rows[1].rulesPlan.finalPool, 4);
assert.equal(rows[1].result.outcome, "PASS");
assert.equal(rows[2].expectedRejected, true);
assert.equal(rows[2].suppliedFacesEvaluated, false);
assert.equal(rows[3].result.outcome, "PASS");
assert.equal(rows[3].taxPlan.taxAmount, 0);
assert.equal(rows[4].result.outcome, "FAIL");
assert.equal(rows[4].taxPlan.taxAmount, 2);
assert.equal(rows[4].taxPlan.currentAfter, 2);
assert.equal(rows[5].result.outcome, "PASS");
assert.equal(rows[5].taxPlan.taxAmount, 0);
assert.equal(rows[5].resourceSpendCommitted, false);
assert.equal(rows[6].expectedRejected, true);
assert.equal(rows[6].reasonCode, "CHANNEL_NATURE_FORBIDDEN_TEST");
assert.equal(rows[7].naturePlan.maximumAfter, 7);
assert.equal(rows[7].naturePlan.currentAfter, 6);
assert.equal(rows[7].naturePlan.retirementCheckRequired, false);
assert.equal(rows[8].naturePlan.currentAfter, 7);
assert.equal(rows[8].naturePlan.retirementCheckRequired, true);

for (const row of rows) {
  assert.equal(row.randomRollExecuted, false);
  assert.equal(row.liveApplication, false);
  assert.deepEqual(row.writes, { actors: 0, items: 0, journals: 0, settings: 0 });
}
const status = api.getStatus();
assert.equal(status.executedCaseCount, 9);
assert.equal(status.passedCaseCount, 9);
assert.equal(status.failedCaseCount, 0);
assert.deepEqual(status.pendingCases, []);
assert.deepEqual(status.failedDomains, []);
assert.equal(profileActivationAvailable("torchbearer2e"), false);
assert.equal(JSON.stringify(existingIds.map(id => resolveRulesProfile(id))), beforeProfiles);
assert.deepEqual(writes, []);

const savedVersion = game.system.version;
game.system.version = "1.13.0-qa.19";
assert.throws(() => api.runHandoff("BL_WILL_POOL_PASS", cases[0][1]), /v1.13.0-qa.20/i);
game.system.version = savedVersion;
game.user.isGM = false;
assert.throws(() => api.runHandoff("BL_WILL_POOL_PASS", cases[0][1]), /GM-only/i);
game.user.isGM = true;

const afterReload = api.resetEvidence();
assert.equal(afterReload.executedCaseCount, 0);
assert.equal(afterReload.pendingCases.length, 9);
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");
assert.deepEqual(writes, []);

console.log("PASS M10D.19 TB2E Beginner's Luck + Nature controlled handoff · M3 deterministic cases · current/max Nature retirement boundary · QA/GM lock · zero writes · memory reset");
