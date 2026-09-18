import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7PlayerTurnClaimLiveHandoff,
  getM7PlayerTurnClaimHandoffStatus,
  resetM7PlayerTurnClaimHandoffTelemetry,
  setM7CoreClaimEnabled
} from "../module/m7-session-live-handoff.mjs";
import { SessionEngine, SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");

assert.equal(manifest.version, "1.9.0-qa.8");

const actor = {
  id: "A1",
  type: "character",
  system: { resources: { checks: { value: 2 } } }
};
const actorState = { freeUsed: false, testsTaken: 0, checksSpent: 0, done: false };
const sessionState = new SessionState({
  enabled: true,
  phase: "player",
  turnCycleId: 3,
  lastActorId: "",
  actors: [
    { id: "A1", done: false },
    { id: "A2", done: false }
  ]
});
const engine = new SessionEngine();

resetM7PlayerTurnClaimHandoffTelemetry();
setM7CoreClaimEnabled(true);

const legacy = {
  ok: true,
  tracked: true,
  source: "free",
  cost: 0,
  before: 2,
  after: 2,
  reasonCode: "",
  actorStatePatch: { testsTaken: 1, freeUsed: true, checksSpent: 0, done: false },
  lastActorId: "A1"
};

let result = evaluateM7PlayerTurnClaimLiveHandoff({
  actorId: "A1",
  label: "Scout",
  legacy,
  corePlan: () => engine.planTestClaim({ actor, actorState, sessionState, label: "Scout" })
});
assert.equal(result.m7.claimAuthority, "CORE_M7");
assert.equal(result.source, "free");
assert.equal(result.actorStatePatch.freeUsed, true);

let status = getM7PlayerTurnClaimHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 1);
assert.equal(status.telemetry.mismatches, 0);

result = evaluateM7PlayerTurnClaimLiveHandoff({
  actorId: "A1",
  label: "Mismatch QA",
  legacy: { ...legacy, source: "check", cost: 1, after: 1 },
  corePlan: () => engine.planTestClaim({ actor, actorState, sessionState, label: "Mismatch QA" })
});
assert.equal(result.m7.claimAuthority, "LEGACY_FALLBACK");
status = getM7PlayerTurnClaimHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "CLAIM_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);

setM7CoreClaimEnabled(true);
resetM7PlayerTurnClaimHandoffTelemetry();

assert.ok(turns.includes("legacyPlayerTurnClaimPlan"));
assert.ok(turns.includes("evaluateM7PlayerTurnClaimLiveHandoff"));
assert.ok(turns.includes("services.sessionEngine.planTestClaim"));
assert.ok(turns.includes("applyPlayerTurnClaimPlan"));
assert.ok(turns.includes('requestTurnAuthority("CLAIM_TEST"'), "Player requests must still commit through the GM bridge");
assert.ok(bridge.includes("gmQueue = gmQueue"), "Player claim requests must remain serialized on the primary GM");

assert.ok(shadow.includes('buildScope: "PLAYER_TURN_TEST_CLAIM_HANDOFF"'));
assert.ok(shadow.includes('mode: "PARTIAL_LIVE_HANDOFF"'));
assert.ok(shadow.includes('authority: "CORE_M7_CLAIM_LEGACY_SESSION"'));
assert.ok(shadow.includes("liveApplication: true"));
assert.ok(shadow.includes("claimHandoffStatus"));
assert.ok(shadow.includes("setCoreClaimEnabled"));

console.log("PASS m7-player-turn-claim-live-handoff-smoke");
