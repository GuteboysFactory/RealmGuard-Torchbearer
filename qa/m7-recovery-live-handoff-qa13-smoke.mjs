import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7RecoverySpendLiveHandoff,
  evaluateM7RecoveryRefundLiveHandoff,
  evaluateM7RecoveryAttemptLiveHandoff,
  getM7RecoveryHandoffStatus,
  resetM7RecoveryHandoffTelemetry,
  setM7CoreRecoveryEnabled
} from "../module/m7-session-live-handoff.mjs";
import { SessionEngine, SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");

assert.equal(manifest.version, "1.9.0-qa.13");

const actor = {
  id: "A1",
  system: { resources: { checks: { value: 3 } } }
};
const engine = new SessionEngine();
const gmState = new SessionState({
  enabled: true,
  phase: "gm",
  turnCycleId: 21,
  actors: [{ id: "A1", ref: "Actor.A1", name: "Ranger A", checks: 3, recoveryAttempts: [] }]
});
const playerState = new SessionState({
  enabled: true,
  phase: "player",
  turnCycleId: 22,
  actors: [{ id: "A1", ref: "Actor.A1", name: "Ranger A", checks: 3, recoveryAttempts: [] }]
});

resetM7RecoveryHandoffTelemetry();
setM7CoreRecoveryEnabled(true);

const spendLegacy = {
  ok: true,
  reasonCode: "",
  phase: "gm",
  source: "gm-checks",
  cost: 2,
  before: 3,
  after: 1,
  turnId: 21,
  conditionName: "Tired"
};
let result = evaluateM7RecoverySpendLiveHandoff({
  actorId: actor.id,
  legacy: spendLegacy,
  corePlan: () => engine.planRecoverySpend({ actor, conditionName: "Tired", sessionState: gmState })
});
assert.equal(result.m7.recoveryAuthority, "CORE_M7");
assert.equal(result.cost, 2);
assert.equal(result.after, 1);

const noCostLegacy = {
  ok: true,
  reasonCode: "",
  phase: "player",
  source: "no-gm-recovery-cost",
  cost: 0,
  before: 3,
  after: 3,
  turnId: 22,
  conditionName: "Tired"
};
result = evaluateM7RecoverySpendLiveHandoff({
  actorId: actor.id,
  legacy: noCostLegacy,
  corePlan: () => engine.planRecoverySpend({ actor, conditionName: "Tired", sessionState: playerState })
});
assert.equal(result.m7.recoveryAuthority, "CORE_M7");
assert.equal(result.cost, 0);

const refundActor = {
  id: "A1",
  system: { resources: { checks: { value: 1 } } }
};
const receipt = { phase: "gm", cost: 2, before: 3, after: 1, turnId: 21, conditionName: "Tired" };
const refundLegacy = {
  ok: true,
  stale: false,
  reasonCode: "",
  refunded: 2,
  before: 1,
  after: 3,
  expectedAfter: 1,
  restore: 3,
  turnId: 21,
  conditionName: "Tired"
};
result = evaluateM7RecoveryRefundLiveHandoff({
  actorId: actor.id,
  legacy: refundLegacy,
  corePlan: () => engine.planRecoveryRefund({ actor: refundActor, receipt, sessionState: gmState })
});
assert.equal(result.m7.recoveryAuthority, "CORE_M7");
assert.equal(result.refunded, 2);
assert.equal(result.after, 3);

const attemptLegacy = {
  ok: true,
  tracked: true,
  changed: true,
  reasonCode: "",
  turnId: 21,
  conditionName: "Tired",
  beforeConditions: [],
  afterConditions: ["Tired"]
};
result = evaluateM7RecoveryAttemptLiveHandoff({
  actorId: actor.id,
  legacy: attemptLegacy,
  corePlan: () => engine.planRecoveryAttempt({
    actor,
    actorState: { recoveryAttempts: [] },
    conditionName: "Tired",
    sessionState: gmState
  })
});
assert.equal(result.m7.recoveryAuthority, "CORE_M7");
assert.deepEqual(result.afterConditions, ["Tired"]);

const duplicate = engine.planRecoveryAttempt({
  actor,
  actorState: { recoveryAttempts: ["Tired"] },
  conditionName: "Tired",
  sessionState: gmState
});
assert.equal(duplicate.ok, true);
assert.equal(duplicate.changed, false);
assert.deepEqual(duplicate.afterConditions, ["Tired"]);

let status = getM7RecoveryHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 4);
assert.equal(status.telemetry.mismatches, 0);

result = evaluateM7RecoverySpendLiveHandoff({
  actorId: actor.id,
  legacy: { ...spendLegacy, after: 0 },
  corePlan: () => engine.planRecoverySpend({ actor, conditionName: "Tired", sessionState: gmState })
});
assert.equal(result.m7.recoveryAuthority, "LEGACY_FALLBACK");
status = getM7RecoveryHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "RECOVERY_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);

setM7CoreRecoveryEnabled(true);
resetM7RecoveryHandoffTelemetry();

assert.ok(turns.includes("legacyRecoverySpendPlan"));
assert.ok(turns.includes("legacyRecoveryRefundPlan"));
assert.ok(turns.includes("legacyRecoveryAttemptPlan"));
assert.ok(turns.includes("evaluateM7RecoverySpendLiveHandoff"));
assert.ok(turns.includes("evaluateM7RecoveryRefundLiveHandoff"));
assert.ok(turns.includes("evaluateM7RecoveryAttemptLiveHandoff"));
assert.ok(turns.includes('requestTurnAuthority("SPEND_RECOVERY_CHECKS"'));
assert.ok(turns.includes('requestTurnAuthority("REFUND_RECOVERY_CHECKS"'));
assert.ok(turns.includes('requestTurnAuthority("MARK_RECOVERY"'));
assert.ok(shadow.includes("recoveryHandoffStatus"));
assert.ok(shadow.includes("setCoreRecoveryEnabled"));
assert.ok(shadow.includes('"RecoveryLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnRecoveryDisagreement"'));
assert.ok(bridge.includes('"SPEND_RECOVERY_CHECKS"'));
assert.ok(bridge.includes('"REFUND_RECOVERY_CHECKS"'));
assert.ok(bridge.includes('"MARK_RECOVERY"'));

console.log("PASS m7-recovery-live-handoff-qa13-smoke");
