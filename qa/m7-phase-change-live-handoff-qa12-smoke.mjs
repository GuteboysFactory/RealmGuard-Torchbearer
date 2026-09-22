import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7PhaseChangeLiveHandoff,
  getM7PhaseChangeHandoffStatus,
  resetM7PhaseChangeHandoffTelemetry,
  setM7CorePhaseEnabled
} from "../module/m7-session-live-handoff.mjs";
import { SessionEngine, SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");

assert.match(manifest.version, /^1\.(?:9\.0(?:-qa\.\d+)?|10\.0(?:-qa\.\d+)?)$/, `Unexpected manifest version: ${manifest.version}`);

const engine = new SessionEngine();
const sessionState = new SessionState({
  enabled: true,
  phase: "player",
  sessionCycle: 4,
  turnCycleId: 11,
  lastActorId: "A1",
  actors: [
    { id: "A1", ref: "Actor.A1", name: "Ranger A", checks: 2, done: false },
    { id: "A2", ref: "Actor.A2", name: "Ranger B", checks: 0, done: true },
    { id: "A3", ref: "Actor.A3", name: "Ranger C", checks: 1, done: false }
  ]
});

const legacy = {
  ok: true,
  changed: true,
  reasonCode: "",
  fromPhase: "player",
  toPhase: "gm",
  previousTurnCycleId: 11,
  turnCycleId: 12,
  lastActorId: "",
  discardedChecks: ["Ranger A: 2", "Ranger C: 1"],
  actorCheckPatches: [
    { id: "A1", ref: "Actor.A1", name: "Ranger A", before: 2, after: 0 },
    { id: "A3", ref: "Actor.A3", name: "Ranger C", before: 1, after: 0 }
  ]
};

resetM7PhaseChangeHandoffTelemetry();
setM7CorePhaseEnabled(true);

let result = evaluateM7PhaseChangeLiveHandoff({
  targetPhase: "gm",
  legacy,
  corePlan: () => engine.planPhaseChange({ targetPhase: "gm", sessionState })
});
assert.equal(result.m7.phaseAuthority, "CORE_M7");
assert.equal(result.changed, true);
assert.equal(result.turnCycleId, 12);
assert.equal(result.lastActorId, "");
assert.deepEqual(result.discardedChecks, ["Ranger A: 2", "Ranger C: 1"]);

let status = getM7PhaseChangeHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 1);
assert.equal(status.telemetry.mismatches, 0);

result = evaluateM7PhaseChangeLiveHandoff({
  targetPhase: "gm",
  legacy: { ...legacy, turnCycleId: 13 },
  corePlan: () => engine.planPhaseChange({ targetPhase: "gm", sessionState })
});
assert.equal(result.m7.phaseAuthority, "LEGACY_FALLBACK");
status = getM7PhaseChangeHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "PHASE_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);

setM7CorePhaseEnabled(true);
resetM7PhaseChangeHandoffTelemetry();

const samePhaseState = new SessionState({
  enabled: true,
  phase: "gm",
  turnCycleId: 12,
  lastActorId: "",
  actors: []
});
const same = engine.planPhaseChange({ targetPhase: "gm", sessionState: samePhaseState });
assert.equal(same.ok, true);
assert.equal(same.changed, false);
assert.equal(same.turnCycleId, 12);

assert.ok(turns.includes("legacyPhaseChangePlan"));
assert.ok(turns.includes("evaluateM7PhaseChangeLiveHandoff"));
assert.ok(turns.includes("services.sessionEngine.planPhaseChange"));
assert.ok(turns.includes("applyPhaseChangePlan"));
assert.ok(turns.includes('source: plan?.m7?.phaseAuthority === "CORE_M7" ? "CORE_M7_PHASE_HANDOFF" : "LEGACY_TURN_MANAGER"'));
assert.ok(shadow.includes('buildScope: "TURN_SESSION_HANDOFFS"'));
assert.ok(shadow.includes('authority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER"'));
assert.ok(shadow.includes("phaseHandoffStatus"));
assert.ok(shadow.includes("setCorePhaseEnabled"));
assert.ok(shadow.includes('"PhaseChangeLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnPhaseDisagreement"'));

console.log("PASS m7-phase-change-live-handoff-qa12-smoke");
