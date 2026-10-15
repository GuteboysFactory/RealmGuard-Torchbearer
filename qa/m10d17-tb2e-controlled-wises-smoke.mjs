import assert from "node:assert/strict";
import fs from "node:fs";
import { refreshRulesProfileRuntime, resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { installM10DFoundation } from "../module/m10d-tb2e-foundation.mjs";
import { profileActivationAvailable } from "../module/m10-profile-activation.mjs";

const settings = new Map([
  ["activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["activeRulesProfileVersion", 1],
  ["systemSchemaVersion", 1],
  ["coreArchitectureVersion", "0.1"],
  ["migrationHistory", "[]"],
  ["migrationLastError", ""]
]);
const writes = [];
const failWrite = () => { writes.push("unexpected write"); throw new Error("M10D.17 handoff must remain zero-write"); };
globalThis.game = {
  system: { version: "1.13.0-qa.18" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] },
  items: { contents: [] },
  journal: { contents: [] },
  settings: {
    get: (_namespace, key) => settings.get(key),
    set: failWrite
  },
  realmGuard: { core: { m10: { sentinel: "unchanged" } } }
};
globalThis.Hooks = { once: (event, callback) => { assert.equal(event, "ready"); callback(); } };
globalThis.Actor = { create: failWrite };
globalThis.Item = { create: failWrite };
globalThis.JournalEntry = { create: failWrite };

installM10DFoundation();
const api = game.realmGuard.core.m10d.controlledWises;
assert.equal(typeof api.getStatus, "function");
assert.equal(typeof api.getMatrix, "function");
assert.equal(typeof api.runHandoff, "function");
assert.equal(typeof api.resetEvidence, "function");
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");

const ready = api.getStatus();
assert.equal(ready.phase, "M10D.17");
assert.equal(ready.mode, "TB2E_CONTROLLED_WISES_QA_HANDOFF");
assert.equal(ready.qaRuntime, true);
assert.equal(ready.gmAuthority, true);
assert.equal(ready.sourceVerified, true);
assert.equal(ready.profileLocked, true);
assert.equal(ready.profileInactive, true);
assert.equal(ready.activationAvailable, false);
assert.equal(ready.controlledExecutionReady, true);
assert.equal(ready.liveParityVerified, false);
assert.deepEqual(ready.writes, { actors: 0, items: 0, journals: 0, settings: 0 });

const wise = api.runHandoff("I Am Wise", { hasWise: true, related: true, actingOnInstinct: true });
assert.equal(wise.ok, true);
assert.equal(wise.caseId, "I_AM_WISE");
assert.equal(wise.plan.dice, 1);
assert.equal(wise.plan.replacesSkillHelp, true);
assert.equal(wise.plan.helperTwistRisk, true);
assert.equal(wise.plan.resourceCost, "NONE");
assert.equal(wise.plan.liveApplication, false);
assert.equal(wise.plan.worksWhenActingOnInstinct, true);
assert.equal(wise.diceEvaluated, false);
assert.equal(wise.diceRerolled, false);
assert.equal(wise.resourceSpendCommitted, false);

const deeper = api.runHandoff("Deeper Understanding", {
  failedDice: 3, alreadyRerolledFailedDice: 2, hasFate: true
});
assert.equal(deeper.ok, true);
assert.equal(deeper.caseId, "DEEPER_UNDERSTANDING");
assert.equal(deeper.plan.resourceCost, "FATE");
assert.equal(deeper.plan.resourceAmount, 1);
assert.equal(deeper.plan.reroll, "ONE_FAILED_DIE");
assert.equal(deeper.plan.rerollDiceMaximum, 1);
assert.equal(deeper.plan.eligibleFailedDice, 1);
assert.equal(deeper.plan.resourceSpendCommitted, false);

const course = api.runHandoff("Of Course", { failedDice: 3, hasPersona: true });
assert.equal(course.ok, true);
assert.equal(course.caseId, "OF_COURSE");
assert.equal(course.plan.resourceCost, "PERSONA");
assert.equal(course.plan.resourceAmount, 1);
assert.equal(course.plan.reroll, "ALL_FAILED_DICE");
assert.equal(course.plan.mustPrecedeDeeperUnderstandingWhenBoth, true);

const rejectedCases = [
  ["I Am Wise", { hasWise: false, expectRejected: true }, "WISE_REQUIRED"],
  ["I Am Wise", { hasWise: true, related: false, expectRejected: true }, "WISE_NOT_RELATED"],
  ["Deeper Understanding", { failedDice: 2, hasFate: false, expectRejected: true }, "INSUFFICIENT_FATE"],
  ["Deeper Understanding", { failedDice: 2, alreadyRerolledFailedDice: 2, expectRejected: true }, "NO_ELIGIBLE_FAILED_DIE"],
  ["Of Course", { failedDice: 2, hasPersona: false, expectRejected: true }, "INSUFFICIENT_PERSONA"],
  ["Unlisted effect", { expectRejected: true }, "UNKNOWN_WISE_EFFECT"]
];
for (const [effect, payload, reason] of rejectedCases) {
  const result = api.runHandoff(effect, payload);
  assert.equal(result.ok, true);
  assert.equal(result.caseId, reason);
  assert.equal(result.plan.reasonCode, reason);
  assert.equal(result.plan.liveApplication, false);
  assert.equal(result.resourceSpendCommitted, false);
}

const matrix = api.getMatrix();
assert.equal(matrix.length, 1);
assert.equal(matrix[0].state, "EXECUTED_PASS");
assert.deepEqual(matrix[0].missingRequiredCases, []);
const after = api.getStatus();
assert.equal(after.domainCount, 1);
assert.equal(after.executedDomainCount, 1);
assert.equal(after.passedDomainCount, 1);
assert.equal(after.executedCaseCount, 9);
assert.equal(after.passedCaseCount, 9);
assert.equal(after.failedCaseCount, 0);
assert.deepEqual(after.pendingCases, []);
assert.equal(after.activationAuthorized, false);
assert.deepEqual(after.writes, { actors: 0, items: 0, journals: 0, settings: 0 });

const stableVersion = game.system.version;
game.system.version = "1.13.0";
assert.throws(() => api.runHandoff("I Am Wise"), /v1.13 QA runtime/i);
game.system.version = stableVersion;

game.user.isGM = false;
assert.throws(() => api.runHandoff("I Am Wise"), /GM-only/i);
game.user.isGM = true;

settings.set("activeRulesProfileId", "torchbearer2e");
refreshRulesProfileRuntime();
assert.equal(profileActivationAvailable("torchbearer2e"), false);
assert.throws(() => api.runHandoff("I Am Wise"), /requires Torchbearer to remain inactive/i);
settings.set("activeRulesProfileId", "realm-guard-legacy-mixed");
refreshRulesProfileRuntime();

api.resetEvidence();
assert.equal(api.getStatus().executedDomainCount, 0);
assert.equal(api.getMatrix()[0].state, "READY_FOR_CONTROLLED_EXECUTION");
assert.deepEqual(writes, []);
assert.deepEqual([...settings], [
  ["activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["activeRulesProfileVersion", 1],
  ["systemSchemaVersion", 1],
  ["coreArchitectureVersion", "0.1"],
  ["migrationHistory", "[]"],
  ["migrationLastError", ""]
]);

for (const id of ["realm-guard-legacy-mixed", "realm-guard-strict", "mg1e", "mg2e"]) {
  assert.ok(resolveRulesProfile(id).profile);
}
const source = fs.readFileSync("module/m10d-tb2e-controlled-wises.mjs", "utf8");
assert.doesNotMatch(source, /m10c|mg2eWise|applyMg2eWiseEffect|legacy.*reroll/i);
for (const forbidden of [
  "game.settings.set(", "Actor.create(", "Item.create(", "JournalEntry.create(",
  "createEmbeddedDocuments(", "deleteEmbeddedDocuments(", "new Roll(", "spendTrackedResource("
]) assert.equal(source.includes(forbidden), false, "M10D.17 handoff must remain plan-only: " + forbidden);

console.log("PASS M10D.17 controlled TB2E Wises handoff · QA/GM locked gate · source-owned plans · fail-closed · zero writes · no roll/resource mutation");
