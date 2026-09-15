import assert from "node:assert/strict";
import { evaluateM5PromotionReadiness } from "../module/m5-promotion-readiness.mjs";

function event(overrides = {}) {
  return { domain: "inventory", source: "LIVE_INVENTORY_WRITE", operation: "PLACE_ZONE", legacyAccepted: true, parity: "MATCH", ...overrides };
}

const baseReport = {
  phase: "M5",
  mode: "SHADOW_PARITY",
  authority: "LEGACY_MIXED",
  liveApplication: false,
  summary: { total: 5, matches: 5, mismatches: 0, coreOnly: 0 },
  events: [
    event(),
    event({ source: "LIVE_INVENTORY_REJECT", legacyAccepted: false }),
    event({ domain: "conflict-tool", source: "LIVE_CONFLICT_DECLARATION", operation: "DECLARED_TOOL_PROVIDER", legacyAccepted: true }),
    event({ domain: "conflict-tool", source: "LIVE_CONFLICT_ROLL", operation: "EVALUATE_TOOL" }),
    event({ domain: "conflict-tool", source: "LIVE_CONFLICT_DISABLE", operation: "DISABLE_STATE" })
  ]
};

let readiness = evaluateM5PromotionReadiness(baseReport);
assert.equal(readiness.status, "READY_FOR_CONTROLLED_HANDOFF");
assert.equal(readiness.ready, true);
assert.equal(readiness.missing.length, 0);
assert.equal(readiness.totalMismatches, 0);

const partial = structuredClone(baseReport);
partial.events = partial.events.filter(row => row.operation !== "DISABLE_STATE");
partial.summary.total = 4;
partial.summary.matches = 4;
readiness = evaluateM5PromotionReadiness(partial);
assert.equal(readiness.status, "PARTIAL");
assert.equal(readiness.ready, false);
assert.deepEqual(readiness.missing, ["conflictDisable"]);

const mismatch = structuredClone(baseReport);
mismatch.events[3].parity = "MISMATCH";
mismatch.summary.matches = 4;
mismatch.summary.mismatches = 1;
readiness = evaluateM5PromotionReadiness(mismatch);
assert.equal(readiness.status, "BLOCKED_MISMATCH");
assert.equal(readiness.ready, false);
assert.equal(readiness.totalMismatches, 1);
assert.deepEqual(readiness.mismatchCoverage, ["conflictRoll"]);

const unsafe = structuredClone(baseReport);
unsafe.liveApplication = true;
readiness = evaluateM5PromotionReadiness(unsafe);
assert.equal(readiness.status, "UNSAFE_STATE");
assert.equal(readiness.ready, false);

console.log("PASS m5-promotion-readiness-smoke");
