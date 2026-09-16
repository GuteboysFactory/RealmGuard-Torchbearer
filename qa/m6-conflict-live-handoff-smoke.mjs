import assert from "node:assert/strict";
import { evaluateM6ConflictResolutionLiveHandoff, getM6ConflictLiveHandoffStatus, resetM6ConflictHandoffTelemetry, setM6CoreResolutionEnabled } from "../module/m6-conflict-live-handoff.mjs";

resetM6ConflictHandoffTelemetry();
setM6CoreResolutionEnabled(true);
let result = evaluateM6ConflictResolutionLiveHandoff({
  conflictId: "qa", exchange: 1, actionIndex: 0, gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus",
  gmRoll: { successes: 4 }, rangerRoll: { successes: 2 },
  legacy: { gmPassed: true, rangerPassed: false, gmMargin: 2, rangerMargin: 0, gmFailureMargin: 0, rangerFailureMargin: 2, gmEffectiveSuccesses: 4, rangerEffectiveSuccesses: 2, tiePending: false }
});
assert.equal(result.m6.resolutionAuthority, "CORE_M6"); assert.equal(result.gmMargin, 2);
let status = getM6ConflictLiveHandoffStatus(); assert.equal(status.telemetry.matches, 1); assert.equal(status.telemetry.mismatches, 0);

result = evaluateM6ConflictResolutionLiveHandoff({
  conflictId: "qa", exchange: 1, actionIndex: 1, gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus",
  gmRoll: { successes: 4 }, rangerRoll: { successes: 2 },
  legacy: { gmPassed: false, rangerPassed: true, gmMargin: 0, rangerMargin: 1, gmFailureMargin: 1, rangerFailureMargin: 0, gmEffectiveSuccesses: 4, rangerEffectiveSuccesses: 2, tiePending: false }
});
assert.equal(result.m6.resolutionAuthority, "LEGACY_FALLBACK");
status = getM6ConflictLiveHandoffStatus(); assert.equal(status.enabled, false); assert.equal(status.rollbackReason, "RESOLUTION_DISAGREEMENT"); assert.equal(status.telemetry.mismatches, 1);

setM6CoreResolutionEnabled(true); resetM6ConflictHandoffTelemetry();
console.log("PASS m6-conflict-live-handoff-smoke");
