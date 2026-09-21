import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7FinishPlayerLiveHandoff,
  getM7FinishPlayerHandoffStatus,
  resetM7FinishPlayerHandoffTelemetry,
  setM7CoreFinishEnabled
} from "../module/m7-session-live-handoff.mjs";
import { SessionEngine, SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");

assert.match(manifest.version, /^1\.9\.0(?:-qa\.\d+)?$/, `Unexpected manifest version: ${manifest.version}`);

const actor = {
  id: "A1",
  type: "character",
  system: { resources: { checks: { value: 3 } } }
};
const actorState = {
  freeUsed: true,
  testsTaken: 2,
  checksSpent: 1,
  donatedGiven: 1,
  donatedReceived: 0,
  done: false
};
const sessionState = new SessionState({
  enabled: true,
  phase: "player",
  turnCycleId: 9,
  actors: [{ id: "A1", done: false }]
});
const engine = new SessionEngine();

const legacy = {
  ok: true,
  reasonCode: "",
  checksBefore: 3,
  checksAfter: 0,
  discarded: 3,
  actorStatePatch: {
    done: true,
    freeUsed: true,
    testsTaken: 2,
    checksSpent: 1,
    donatedGiven: 1,
    donatedReceived: 0
  }
};

resetM7FinishPlayerHandoffTelemetry();
setM7CoreFinishEnabled(true);

let result = evaluateM7FinishPlayerLiveHandoff({
  actorId: "A1",
  legacy,
  corePlan: () => engine.planFinishPlayer({ actor, actorState, sessionState })
});
assert.equal(result.m7.finishAuthority, "CORE_M7");
assert.equal(result.checksAfter, 0);
assert.equal(result.discarded, 3);
assert.equal(result.actorStatePatch.done, true);

let status = getM7FinishPlayerHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 1);
assert.equal(status.telemetry.mismatches, 0);

result = evaluateM7FinishPlayerLiveHandoff({
  actorId: "A1",
  legacy: { ...legacy, discarded: 2 },
  corePlan: () => engine.planFinishPlayer({ actor, actorState, sessionState })
});
assert.equal(result.m7.finishAuthority, "LEGACY_FALLBACK");
status = getM7FinishPlayerHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "FINISH_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);

setM7CoreFinishEnabled(true);
resetM7FinishPlayerHandoffTelemetry();

assert.ok(turns.includes("legacyFinishPlayerPlan"));
assert.ok(turns.includes("evaluateM7FinishPlayerLiveHandoff"));
assert.ok(turns.includes("services.sessionEngine.planFinishPlayer"));
assert.ok(turns.includes("applyFinishPlayerPlan"));
assert.ok(turns.includes('requestTurnAuthority("FINISH_PLAYER"'), "Player Done requests must still commit through the GM bridge");
assert.ok(bridge.includes("gmQueue = gmQueue"), "Player Done requests must remain serialized on the primary GM");

assert.ok(shadow.includes('buildScope: "TURN_SESSION_HANDOFFS"'));
assert.ok(shadow.includes('authority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER"'));
assert.ok(shadow.includes('liveCoreScope: Object.freeze(["CLAIM_TEST", "DONATE_CHECK", "FINISH_PLAYER", "PHASE_CHANGE", "SPEND_RECOVERY_CHECKS", "REFUND_RECOVERY_CHECKS", "MARK_RECOVERY", "AWARD_TRAIT_CHECKS"])'));
assert.ok(shadow.includes("finishHandoffStatus"));
assert.ok(shadow.includes("setCoreFinishEnabled"));
assert.ok(shadow.includes('"DoneDiscardLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnFinishDisagreement"'));

console.log("PASS m7-done-discard-live-handoff-qa11-smoke");
