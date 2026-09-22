import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7CheckTransferLiveHandoff,
  getM7CheckTransferHandoffStatus,
  resetM7CheckTransferHandoffTelemetry,
  setM7CoreTransferEnabled
} from "../module/m7-session-live-handoff.mjs";
import { SessionEngine, SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");

assert.match(manifest.version, /^1\.(?:9\.0(?:-qa\.\d+)?|1[01]\.0(?:-qa\.\d+)?)$/, `Unexpected manifest version: ${manifest.version}`);

const donor = {
  id: "A1",
  type: "character",
  system: { resources: { checks: { value: 3 } } }
};
const recipient = {
  id: "A2",
  type: "character",
  system: { resources: { checks: { value: 0 } } }
};
const donorState = { donatedGiven: 1, donatedReceived: 0, done: false };
const recipientState = { donatedGiven: 0, donatedReceived: 2, done: true };
const sessionState = new SessionState({
  enabled: true,
  phase: "player",
  turnCycleId: 7,
  actors: [
    { id: "A1", done: false },
    { id: "A2", done: true }
  ]
});
const engine = new SessionEngine();

const legacy = {
  ok: true,
  reasonCode: "",
  amount: 2,
  donorBefore: 3,
  donorAfter: 1,
  recipientBefore: 0,
  recipientAfter: 2,
  donorStatePatch: { donatedGiven: 3 },
  recipientStatePatch: { donatedReceived: 4, done: false }
};

resetM7CheckTransferHandoffTelemetry();
setM7CoreTransferEnabled(true);

let result = evaluateM7CheckTransferLiveHandoff({
  donorId: "A1",
  recipientId: "A2",
  legacy,
  corePlan: () => engine.planCheckTransfer({
    donor,
    recipient,
    amount: 2,
    donorState,
    recipientState,
    sessionState
  })
});
assert.equal(result.m7.transferAuthority, "CORE_M7");
assert.equal(result.donorAfter, 1);
assert.equal(result.recipientAfter, 2);
assert.equal(result.recipientStatePatch.done, false);

let status = getM7CheckTransferHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 1);
assert.equal(status.telemetry.mismatches, 0);

result = evaluateM7CheckTransferLiveHandoff({
  donorId: "A1",
  recipientId: "A2",
  legacy: { ...legacy, donorAfter: 2 },
  corePlan: () => engine.planCheckTransfer({
    donor,
    recipient,
    amount: 2,
    donorState,
    recipientState,
    sessionState
  })
});
assert.equal(result.m7.transferAuthority, "LEGACY_FALLBACK");
status = getM7CheckTransferHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "TRANSFER_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);

setM7CoreTransferEnabled(true);
resetM7CheckTransferHandoffTelemetry();

assert.ok(turns.includes("legacyCheckTransferPlan"));
assert.ok(turns.includes("evaluateM7CheckTransferLiveHandoff"));
assert.ok(turns.includes("services.sessionEngine.planCheckTransfer"));
assert.ok(turns.includes("applyCheckTransferPlan"));
assert.ok(turns.includes('requestTurnAuthority("DONATE_CHECK"'), "Player transfers must still commit through the GM bridge");
assert.ok(bridge.includes("gmQueue = gmQueue"), "Player transfer requests must remain serialized on the primary GM");

assert.ok(shadow.includes('buildScope: "TURN_SESSION_HANDOFFS"'));
assert.ok(shadow.includes('authority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER"'));
assert.ok(shadow.includes('liveCoreScope: Object.freeze(["CLAIM_TEST", "DONATE_CHECK", "FINISH_PLAYER", "PHASE_CHANGE", "SPEND_RECOVERY_CHECKS", "REFUND_RECOVERY_CHECKS", "MARK_RECOVERY", "AWARD_TRAIT_CHECKS"])'));
assert.ok(shadow.includes("transferHandoffStatus"));
assert.ok(shadow.includes("setCoreTransferEnabled"));
assert.ok(shadow.includes('"PassCheckLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnTransferDisagreement"'));

console.log("PASS m7-pass-check-live-handoff-qa9-smoke");
