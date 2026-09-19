import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7LifecycleCommitLiveHandoff,
  getM7LifecycleHandoffStatus,
  resetM7LifecycleHandoffTelemetry,
  setM7CoreLifecycleEnabled,
  getM7RewardHandoffStatus
} from "../module/m7-session-live-handoff.mjs";
import { SessionLifecycleService } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const core = fs.readFileSync("module/core/m7-session-services.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");

assert.equal(manifest.version, "1.9.0-qa.16");

const lifecycle = new SessionLifecycleService();
resetM7LifecycleHandoffTelemetry();
setM7CoreLifecycleEnabled(true);

for (const type of ["SESSION_STARTING", "SESSION_STARTED", "PHASE_CHANGED", "SESSION_ENDING", "SESSION_ENDED"]) {
  const details = {
    source: "SMOKE",
    sessionCycle: 7,
    turnCycleId: 12,
    participantActorIds: ["A1", "A2"]
  };
  const legacy = { ...details, type };
  const result = evaluateM7LifecycleCommitLiveHandoff({
    legacy,
    corePlan: () => lifecycle.planCommit(type, details)
  });
  assert.equal(result.type, type);
  assert.equal(result.m7.lifecycleAuthority, "CORE_M7");
  assert.equal(result.m7.rollback, false);
}

let status = getM7LifecycleHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.lifecycleAuthority, "CORE_M7");
assert.equal(status.telemetry.matches, 5);
assert.equal(status.telemetry.mismatches, 0);
assert.equal(status.telemetry.errorFallbacks, 0);
assert.deepEqual(status.deferredScope, []);

// Intentional disagreement must roll back only Lifecycle.
const mismatch = evaluateM7LifecycleCommitLiveHandoff({
  legacy: { type: "SESSION_STARTED", source: "LEGACY", sessionCycle: 2 },
  corePlan: () => lifecycle.planCommit("SESSION_STARTED", { source: "CORE", sessionCycle: 2 })
});
assert.equal(mismatch.m7.lifecycleAuthority, "LEGACY_FALLBACK");
status = getM7LifecycleHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "LIFECYCLE_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);
assert.equal(getM7RewardHandoffStatus().enabled, true);

setM7CoreLifecycleEnabled(true);
resetM7LifecycleHandoffTelemetry();

assert.ok(core.includes("planCommit(type, details = {})"));
assert.ok(core.includes("previewCommit(type, details = {})"));
assert.ok(shadow.includes("evaluateM7LifecycleCommitLiveHandoff"));
assert.ok(shadow.includes("lifecycleHandoffStatus"));
assert.ok(shadow.includes("setCoreLifecycleEnabled"));
assert.ok(shadow.includes('"SessionLifecycleLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnLifecycleDisagreement"'));

console.log("PASS m7-session-lifecycle-live-handoff-qa16-smoke");
