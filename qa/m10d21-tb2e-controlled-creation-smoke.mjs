import assert from "node:assert/strict";
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
  system: { version: "1.13.0-qa.25" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] },
  items: { contents: [] },
  journal: { contents: [] },
  settings: { get: (_namespace, key) => settings.get(key), set: failWrite("setting") },
  realmGuard: { core: { tests: {}, m10: { sentinel: "unchanged" } } }
};
globalThis.Hooks = { once: (event, callback) => { assert.equal(event, "ready"); callback(); } };
globalThis.Actor = { create: failWrite("Actor.create") };
globalThis.Item = { create: failWrite("Item.create") };
globalThis.JournalEntry = { create: failWrite("JournalEntry.create") };
globalThis.ChatMessage = { create: failWrite("ChatMessage.create") };

refreshRulesProfileRuntime();
installM10DFoundation();
const api = game.realmGuard.core.m10d.controlledCreation;
assert.equal(typeof api.getStatus, "function");
assert.equal(typeof api.getMatrix, "function");
assert.equal(typeof api.runHandoff, "function");
assert.equal(typeof api.resetEvidence, "function");
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");

const initial = api.getStatus();
assert.equal(initial.phase, "M10D.21");
assert.equal(initial.mode, "TB2E_CONTROLLED_CREATION_PREVIEW_REVIEW_QA_HANDOFF");
assert.equal(initial.qaRuntime, true);
assert.equal(initial.gmAuthority, true);
assert.equal(initial.sourceBounded, true);
assert.equal(initial.profileLocked, true);
assert.equal(initial.profileInactive, true);
assert.equal(initial.activationAvailable, false);
assert.equal(initial.liveParityVerified, false);
assert.equal(initial.executedCaseCount, 0);
assert.equal(initial.pendingCases.length, 4);
assert.deepEqual(initial.writes, { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 });

const cases = [
  "CREATION_PROFILE_LOCKED",
  "M10D_CREATION_PREVIEW_ONLY",
  "CORE_M9_REVIEW_ONLY",
  "CORE_M9_COMMIT_BLOCKED"
];
const rows = cases.map(caseId => api.runHandoff(caseId));
assert.deepEqual(rows.map(row => row.ok), [true, true, true, true]);
assert.equal(rows[0].details.presentation.foundationOnly, true);
assert.equal(rows[0].details.presentation.liveCommit, false);
assert.equal(rows[0].details.presentation.selectable, false);
assert.equal(rows[1].details.plan.stock, "HALFLING");
assert.equal(rows[1].details.plan.writesPlanned, 0);
assert.equal(rows[2].details.review.valid, false);
assert.deepEqual(rows[2].details.grants, []);
assert.equal(rows[3].details.commitPlanRejected, true);

for (const row of rows) {
  assert.equal(row.randomRollExecuted, false);
  assert.equal(row.liveApplication, false);
  assert.equal(row.commitExecuted, false);
  assert.deepEqual(row.writes, { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 });
}
const status = api.getStatus();
assert.equal(status.executedCaseCount, 4);
assert.equal(status.passedCaseCount, 4);
assert.equal(status.failedCaseCount, 0);
assert.deepEqual(status.pendingCases, []);
assert.equal(profileActivationAvailable("torchbearer2e"), false);
assert.equal(JSON.stringify(existingIds.map(id => resolveRulesProfile(id))), beforeProfiles);
assert.deepEqual(writes, []);

game.user.isGM = false;
assert.throws(() => api.runHandoff("CREATION_PROFILE_LOCKED"), /GM-only/i);
game.user.isGM = true;
const savedVersion = game.system.version;
game.system.version = "1.13.0-qa.24";
assert.throws(() => api.runHandoff("CREATION_PROFILE_LOCKED"), /v1.13.0-qa.25/i);
game.system.version = savedVersion;

const afterReload = api.resetEvidence();
assert.equal(afterReload.executedCaseCount, 0);
assert.equal(afterReload.pendingCases.length, 4);
assert.equal(game.realmGuard.core.m10.sentinel, "unchanged");
assert.deepEqual(writes, []);

const mainSource = await (await import("node:fs/promises")).readFile(new URL("../realm-guard.mjs", import.meta.url), "utf8");
assert.equal(mainSource.includes("world-inventory-report.mjs"), false);
assert.equal(mainSource.includes("installWorldInventoryReport"), false);
console.log("PASS M10D.21 bounded creation preview/review/commit rejection · CORE M9 reused · TB2E inactive and foundation-only · zero document/settings/chat writes");
