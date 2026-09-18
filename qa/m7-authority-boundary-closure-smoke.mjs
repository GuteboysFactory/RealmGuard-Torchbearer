import assert from "node:assert/strict";
import fs from "node:fs";
import { SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const core = fs.readFileSync("module/core/m7-session-services.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");
const documents = fs.readFileSync("module/documents.mjs", "utf8");
const conditions = fs.readFileSync("module/conditions.mjs", "utf8");
const sheet = fs.readFileSync("sheets/actor-sheet.mjs", "utf8");

assert.ok(manifest.version.startsWith("1.9.0-qa."), `Unexpected manifest version: ${manifest.version}`);

const state = new SessionState({ sessionCycle: 7, turnCycleId: 19 });
assert.equal(state.sessionCycle, 7);
assert.equal(state.turnCycleId, 19);
assert.equal(state.cycleId, 19, "cycleId must remain a compatibility alias for turnCycleId");

assert.ok(core.includes('read("endSessionCycle", 1)'), "Snapshot must read the real session cycle");
assert.ok(core.includes('read("turnCycleId", 1)'), "Snapshot must read the Turn revision separately");
assert.ok(core.includes("sessionCycle,"));
assert.ok(core.includes("turnCycleId,"));

for (const operation of [
  "AWARD_TRAIT_CHECKS",
  "SPEND_RECOVERY_CHECKS",
  "REFUND_RECOVERY_CHECKS"
]) assert.ok(turns.includes(operation), `Missing semantic authority operation: ${operation}`);

assert.ok(bridge.includes("gmQueue = gmQueue"), "Semantic Action Currency requests must remain serialized on the primary GM");
assert.ok(documents.includes("awardTraitChecks(this, requested)"));
assert.ok(documents.includes("awardTraitChecks(this, 2)"));
assert.ok(conditions.includes("return spendRecoveryChecks(actor, condition?.name ?? \"\")"));
assert.ok(sheet.includes("refundRecoveryChecks(this.actor, spent)"));

for (const [name, source] of [
  ["documents", documents],
  ["conditions", conditions],
  ["actor-sheet", sheet]
]) {
  assert.equal(
    source.includes('update({ "system.resources.checks.value"'),
    false,
    `${name} must not directly commit M7 Action Currency writes`
  );
}

assert.ok(shadow.includes('buildScope: "PLAYER_TURN_ACTION_CURRENCY_HANDOFF"'));
assert.ok(shadow.includes("actionCurrencyAuthority"));
assert.ok(shadow.includes('"SessionCycleSeparation"'));
assert.ok(shadow.includes('"ActionCurrencyAuthorityBoundary"'));
assert.ok(shadow.includes('directGenericSetOperation: false'));
assert.ok(shadow.includes('mode: "PARTIAL_LIVE_HANDOFF"'));
assert.ok(shadow.includes('authority: "CORE_M7_TURN_CURRENCY_LEGACY_SESSION"'));
assert.ok(shadow.includes("liveApplication: true"));

console.log("PASS m7-authority-boundary-closure-smoke");
