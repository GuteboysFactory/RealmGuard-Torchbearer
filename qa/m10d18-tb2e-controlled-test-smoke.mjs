import assert from "node:assert/strict";
import fs from "node:fs";
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
const failWrite = name => (...args) => { writes.push({name,args}); throw new Error(`Unexpected write: ${name}`); };

globalThis.game = {
  system: { version: "1.13.0-qa.19" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] },
  items: { contents: [] },
  journal: { contents: [] },
  settings: {
    get: (_namespace, key) => settings.get(key),
    set: failWrite("setting")
  },
  realmGuard: { core: { tests: { engine: new TestEngine() }, m10: { sentinel: "unchanged" } } }
};
globalThis.Hooks = { once: (event, callback) => { assert.equal(event, "ready"); callback(); } };
globalThis.Actor = { create: failWrite("Actor.create") };
globalThis.Item = { create: failWrite("Item.create") };
globalThis.JournalEntry = { create: failWrite("JournalEntry.create") };

refreshRulesProfileRuntime();
installM10DFoundation();
const api = game.realmGuard.core.m10d.controlledTests;
assert.equal(typeof api.getStatus, "function");
assert.equal(typeof api.getMatrix, "function");
assert.equal(typeof api.runHandoff, "function");
assert.equal(typeof api.resetEvidence, "function");
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");

const initial = api.getStatus();
assert.equal(initial.phase, "M10D.18");
assert.equal(initial.mode, "TB2E_CONTROLLED_BASIC_TEST_QA_HANDOFF");
assert.equal(initial.qaRuntime, true);
assert.equal(initial.gmAuthority, true);
assert.equal(initial.sourceBounded, true);
assert.equal(initial.profileLocked, true);
assert.equal(initial.profileInactive, true);
assert.equal(initial.activationAvailable, false);
assert.equal(initial.liveParityVerified, false);
assert.deepEqual(initial.writes, {actors:0,items:0,journals:0,settings:0});

const cases = [
  ["OB_PASS", {sourceName:"Fighter",basePool:3,obstacle:2,faces:[4,2,6]}],
  ["OB_FAIL", {sourceName:"Fighter",basePool:3,obstacle:2,faces:[1,2,3]}],
  ["DICE_MODIFIER", {sourceName:"Fighter",basePool:3,diceModifier:1,obstacle:2,faces:[4,5,1,2]}],
  ["SUCCESS_MODIFIER", {sourceName:"Fighter",basePool:3,successModifier:1,obstacle:2,faces:[4,1,2]}],
  ["INVALID_DICE_COUNT", {sourceName:"Fighter",basePool:3,obstacle:2,faces:[4,1]}],
  ["INVALID_DIE_FACE", {sourceName:"Fighter",basePool:3,obstacle:2,faces:[1,2,8]}]
];
const rows = cases.map(([id,payload]) => api.runHandoff(id,payload));
assert.deepEqual(rows.map(row=>row.ok), [true,true,true,true,true,true]);
assert.equal(rows[0].result.outcome, "PASS");
assert.equal(rows[0].result.finalSuccesses, 2);
assert.equal(rows[1].result.outcome, "FAIL");
assert.equal(rows[1].result.margin, 2);
assert.equal(rows[2].plan.finalPool, 4);
assert.equal(rows[2].result.outcome, "PASS");
assert.equal(rows[3].result.rawSuccesses, 1);
assert.equal(rows[3].result.finalSuccesses, 2);
assert.match(rows[4].rejection, /expected .* dice, received/i);
assert.match(rows[5].rejection, /Invalid d6 face/i);
for (const row of rows) {
  assert.equal(row.provider, "TB2E_M10D_TEST_SHADOW_TO_CORE_M3");
  assert.equal(row.liveApplication, false);
  assert.equal(row.randomRollExecuted, false);
  assert.deepEqual(row.writes, {actors:0,items:0,journals:0,settings:0});
}
const status = api.getStatus();
assert.equal(status.executedCaseCount, 6);
assert.equal(status.passedCaseCount, 6);
assert.equal(status.failedCaseCount, 0);
assert.deepEqual(status.pendingCases, []);
assert.equal(status.resourceSpendCommitted, false);
assert.equal(status.suppliedFacesEvaluated, true);
assert.equal(profileActivationAvailable("torchbearer2e"), false);

const savedVersion = game.system.version;
game.system.version = "1.13.0";
assert.throws(() => api.runHandoff("OB_PASS", cases[0][1]), /v1.13.0-qa.19/i);
game.system.version = savedVersion;

game.user.isGM = false;
assert.throws(() => api.runHandoff("OB_PASS", cases[0][1]), /GM-only/i);
game.user.isGM = true;

settings.set("activeRulesProfileId", "torchbearer2e");
refreshRulesProfileRuntime();
assert.throws(() => api.runHandoff("OB_PASS", cases[0][1]), /remain inactive/i);
settings.set("activeRulesProfileId", "realm-guard-legacy-mixed");
refreshRulesProfileRuntime();

api.resetEvidence();
assert.equal(api.getStatus().executedCaseCount, 0);
assert.equal(api.getMatrix()[0].state, "READY_FOR_CONTROLLED_EXECUTION");
assert.deepEqual(writes, []);
assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))), beforeProfiles);
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");

const source = fs.readFileSync("module/m10d-tb2e-controlled-tests.mjs", "utf8");
for (const forbidden of [
  "new Roll(", "ChatMessage.create(", "game.settings.set(", "Actor.create(",
  "Item.create(", "JournalEntry.create(", "createEmbeddedDocuments(",
  "deleteEmbeddedDocuments(", "spendTrackedResource("
]) assert.equal(source.includes(forbidden), false, `Forbidden gameplay/write path: ${forbidden}`);

console.log("PASS M10D.18 controlled TB2E basic Test handoff · QA/GM locked gate · existing M3 engine · Ob PASS/FAIL · +D/+s · fail-closed · no RNG/write");
