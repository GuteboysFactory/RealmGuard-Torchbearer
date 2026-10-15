import assert from "node:assert/strict";
import { TestEngine } from "../module/core/test-engine.mjs";
import { refreshRulesProfileRuntime, resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { installM10DFoundation } from "../module/m10d-tb2e-foundation.mjs";
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
  system: { version: "1.13.0-qa.21" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] },
  items: { contents: [] },
  journal: { contents: [] },
  settings: { get: (_namespace, key) => settings.get(key), set: failWrite("setting") },
  realmGuard: { core: { tests: { engine: new TestEngine() }, m10: { sentinel: "unchanged" } } }
};
globalThis.Hooks = { once: (event, callback) => { assert.equal(event, "ready"); callback(); } };
globalThis.Actor = { create: failWrite("Actor.create") };
globalThis.Item = { create: failWrite("Item.create") };
globalThis.JournalEntry = { create: failWrite("JournalEntry.create") };
globalThis.ChatMessage = { create: failWrite("ChatMessage.create") };

refreshRulesProfileRuntime();
installM10DFoundation();
const api = game.realmGuard.core.m10d.controlledConditionsRecoveryGrind;
assert.equal(typeof api.getStatus, "function");
assert.equal(typeof api.getMatrix, "function");
assert.equal(typeof api.runHandoff, "function");
assert.equal(typeof api.resetEvidence, "function");
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");

const initial = api.getStatus();
assert.equal(initial.phase, "M10D.20");
assert.equal(initial.mode, "TB2E_CONTROLLED_CONDITIONS_RECOVERY_GRIND_QA_HANDOFF");
assert.equal(initial.qaRuntime, true);
assert.equal(initial.gmAuthority, true);
assert.equal(initial.sourceBounded, true);
assert.equal(initial.profileLocked, true);
assert.equal(initial.profileInactive, true);
assert.equal(initial.activationAvailable, false);
assert.equal(initial.liveParityVerified, false);
assert.equal(initial.executedCaseCount, 0);
assert.equal(initial.pendingCases.length, 13);
assert.deepEqual(initial.writes, { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 });

const cases = [
  ["CONDITION_FRESH_SKILL_M3_PASS", { basePool: 2, obstacle: 2, faces: [4, 1, 5] }],
  ["CONDITION_INJURED_SICK_M3_PASS", { basePool: 4, obstacle: 2, faces: [4, 5] }],
  ["CONDITION_RESOURCES_FRESH_NO_BONUS", { basePool: 2, obstacle: 2, faces: [4, 1] }],
  ["CONDITION_ZERO_SKILL_BLOCKED", {}],
  ["GRIND_TEST_TURN", {}],
  ["GRIND_INSTINCT_ZERO", {}],
  ["GRIND_SPELL_SOURCE_REQUIRED", {}],
  ["RECOVERY_ANGRY_CAMP_PREVIEW", {}],
  ["RECOVERY_AFRAID_TOWN_COST_PREVIEW", {}],
  ["RECOVERY_HUNGRY_CAMP_NO_OB", {}],
  ["RECOVERY_EXHAUSTED_SOURCE_BOUNDARY", {}],
  ["RECOVERY_HEALER_INJURY_PREVIEW", {}],
  ["CONFLICT_CONDITION_PENALTY_MANUAL", {}]
];
const rows = cases.map(([id, payload]) => api.runHandoff(id, payload));
assert.deepEqual(rows.map(row => row.ok), cases.map(() => true));

assert.equal(rows[0].details.result.outcome, "PASS");
assert.equal(rows[0].details.effectPlan.diceModifier, 1);
assert.equal(rows[0].details.poolPlan.finalPool, 3);
assert.equal(rows[1].details.result.outcome, "PASS");
assert.equal(rows[1].details.effectPlan.diceModifier, -2);
assert.equal(rows[1].details.poolPlan.finalPool, 2);
assert.equal(rows[2].details.result.outcome, "FAIL");
assert.equal(rows[2].details.effectPlan.diceModifier, 0);
assert.equal(rows[2].details.poolPlan.finalPool, 2);
assert.equal(rows[3].expectedRejected, true);
assert.equal(rows[3].details.plan.mayTest, false);
assert.equal(rows[4].details.plan.turnCostPreview, 1);
assert.equal(rows[5].details.plan.turnCostPreview, 0);
assert.equal(rows[6].details.plan.turnCostPreview, null);
assert.equal(rows[7].details.plan.ability, "WILL");
assert.equal(rows[7].details.plan.obstacle, 2);
assert.equal(rows[8].details.plan.townLifestyleCostPreview, 1);
assert.equal(rows[9].details.plan.obstacle, null);
assert.equal(rows[10].checks.sourceBoundaryStillUnresolved, true);
assert.equal(rows[11].details.plan.obstacle, 4);
assert.equal(rows[12].expectedRejected, true);
assert.equal(rows[12].details.plan.chosenPenalty, null);

for (const row of rows) {
  assert.equal(row.randomRollExecuted, false);
  assert.equal(row.liveApplication, false);
  assert.equal(row.resourceSpendCommitted, false);
  assert.equal(row.conditionMutationCommitted, false);
  assert.equal(row.turnCounterMutationCommitted, false);
  assert.deepEqual(row.writes, { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 });
}
const status = api.getStatus();
assert.equal(status.executedCaseCount, 13);
assert.equal(status.passedCaseCount, 13);
assert.equal(status.failedCaseCount, 0);
assert.deepEqual(status.pendingCases, []);
assert.deepEqual(status.failedDomains, []);
assert.equal(profileActivationAvailable("torchbearer2e"), false);
assert.equal(JSON.stringify(existingIds.map(id => resolveRulesProfile(id))), beforeProfiles);
assert.deepEqual(writes, []);

game.user.isGM = false;
assert.throws(() => api.runHandoff("CONDITION_FRESH_SKILL_M3_PASS", cases[0][1]), /GM-only/i);
game.user.isGM = true;
const savedVersion = game.system.version;
game.system.version = "1.13.0-qa.20";
assert.throws(() => api.runHandoff("CONDITION_FRESH_SKILL_M3_PASS", cases[0][1]), /v1.13.0-qa.21/i);
game.system.version = savedVersion;

const afterReload = api.resetEvidence();
assert.equal(afterReload.executedCaseCount, 0);
assert.equal(afterReload.pendingCases.length, 13);
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");
assert.deepEqual(writes, []);

console.log("PASS M10D.20 Conditions / Recovery / Grind controlled handoff · M3 deterministic condition effects · Grind previews · bounded recovery and source boundaries · QA/GM lock · zero writes · memory reset");
