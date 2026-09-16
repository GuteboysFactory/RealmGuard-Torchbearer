import assert from "node:assert/strict";
import { m6InteractionMode, resolveM6ConflictPair, previewM6ConflictResolution } from "../module/core/m6-conflict-services.mjs";
assert.equal(m6InteractionMode("attack", "attack"), "independent");
assert.equal(m6InteractionMode("attack", "attack", { ownMissile: true }), "versus");
assert.equal(m6InteractionMode("defend", "feint"), "trumped");

let r = resolveM6ConflictPair({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 4 }, rangerRoll: { successes: 2 } });
assert.equal(r.gm.passed, true); assert.equal(r.gm.margin, 2); assert.equal(r.ranger.passed, false);

r = resolveM6ConflictPair({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 2 }, rangerRoll: { successes: 2 } });
assert.equal(r.tiePending, true);

r = resolveM6ConflictPair({ gmAction: "defend", rangerAction: "attack", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 3 }, rangerRoll: { successes: 3 }, tieResolution: { resolved: true, rangerPassed: true, margin: 2 } });
assert.equal(r.tiePending, false); assert.equal(r.ranger.passed, true); assert.equal(r.ranger.margin, 2); assert.equal(r.gm.failureMargin, 2);

let preview = previewM6ConflictResolution({ gmAction: "attack", rangerAction: "defend", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 4 }, rangerRoll: { successes: 2 }, gmDisposition: { start: 8, current: 8 }, rangerDisposition: { start: 7, current: 7 } });
assert.equal(preview.disposition.ranger.current, 5); assert.equal(preview.disposition.gm.current, 8);

preview = previewM6ConflictResolution({ gmAction: "defend", rangerAction: "attack", gmMode: "versus", rangerMode: "versus", gmRoll: { successes: 3 }, rangerRoll: { successes: 3 }, tieResolution: { resolved: true, rangerPassed: true, margin: 2 }, gmDisposition: { start: 6, current: 6 }, rangerDisposition: { start: 7, current: 7 } });
assert.equal(preview.pair.tiePending, false); assert.equal(preview.disposition.gm.current, 4); assert.equal(preview.disposition.ranger.current, 7);

console.log("PASS m6-conflict-shadow-smoke · automatic Versus tie parity");
