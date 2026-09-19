import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7TraitCheckAwardLiveHandoff,
  getM7TraitCheckAwardHandoffStatus,
  resetM7TraitCheckAwardHandoffTelemetry,
  setM7CoreTraitAwardEnabled,
  getM7RecoveryHandoffStatus
} from "../module/m7-session-live-handoff.mjs";
import { SessionEngine, SessionState } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const turns = fs.readFileSync("module/turns.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const bridge = fs.readFileSync("module/turn-authority-bridge.mjs", "utf8");

assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);

const engine = new SessionEngine();
const actor = { id: "A1", type: "character", system: { resources: { checks: { value: 2, max: 3 } } } };
const gmState = new SessionState({ enabled: true, phase: "gm", turnCycleId: 31, actors: [{ id: "A1", ref: "Actor.A1", name: "Ranger A", checks: 2 }] });
const playerState = new SessionState({ enabled: true, phase: "player", turnCycleId: 32, actors: [{ id: "A1", ref: "Actor.A1", name: "Ranger A", checks: 2 }] });

resetM7TraitCheckAwardHandoffTelemetry();
setM7CoreTraitAwardEnabled(true);

let result = evaluateM7TraitCheckAwardLiveHandoff({
  actorId: actor.id,
  legacy: { ok: true, reasonCode: "", phase: "gm", requested: 2, earned: 1, before: 2, after: 3, maximum: 3, turnId: 31 },
  corePlan: () => engine.planTraitCheckAward({ actor, amount: 2, sessionState: gmState })
});
assert.equal(result.m7.traitAwardAuthority, "CORE_M7");
assert.equal(result.earned, 1);
assert.equal(result.after, 3);

result = evaluateM7TraitCheckAwardLiveHandoff({
  actorId: actor.id,
  legacy: { ok: true, reasonCode: "", phase: "player", requested: 1, earned: 0, before: 2, after: 2, maximum: 3, turnId: 32 },
  corePlan: () => engine.planTraitCheckAward({ actor, amount: 1, sessionState: playerState })
});
assert.equal(result.m7.traitAwardAuthority, "CORE_M7");
assert.equal(result.earned, 0);

let status = getM7TraitCheckAwardHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 2);
assert.equal(status.telemetry.mismatches, 0);
assert.deepEqual(status.deferredScope, ["SESSION_LIFECYCLE_COMMIT"]);

result = evaluateM7TraitCheckAwardLiveHandoff({
  actorId: actor.id,
  legacy: { ok: true, reasonCode: "", phase: "gm", requested: 2, earned: 0, before: 2, after: 2, maximum: 3, turnId: 31 },
  corePlan: () => engine.planTraitCheckAward({ actor, amount: 2, sessionState: gmState })
});
assert.equal(result.m7.traitAwardAuthority, "LEGACY_FALLBACK");
status = getM7TraitCheckAwardHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "TRAIT_AWARD_DISAGREEMENT");
assert.equal(getM7RecoveryHandoffStatus().enabled, true);

setM7CoreTraitAwardEnabled(true);
resetM7TraitCheckAwardHandoffTelemetry();

assert.ok(turns.includes("legacyTraitCheckAwardPlan"));
assert.ok(turns.includes("applyTraitCheckAwardPlan"));
assert.ok(turns.includes("evaluateM7TraitCheckAwardLiveHandoff"));
assert.ok(turns.includes('requestTurnAuthority("AWARD_TRAIT_CHECKS"'));
assert.ok(shadow.includes("traitAwardHandoffStatus"));
assert.ok(shadow.includes("setCoreTraitAwardEnabled"));
assert.ok(shadow.includes('"TraitCheckAwardLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnTraitAwardDisagreement"'));
assert.ok(bridge.includes('"AWARD_TRAIT_CHECKS"'));

console.log("PASS m7-trait-check-award-live-handoff-qa14-smoke");
