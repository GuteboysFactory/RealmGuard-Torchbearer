import assert from "node:assert/strict";
import { TestEngine } from "../module/core/test-engine.mjs";
import { runLegacyCoreTestParity } from "../module/core/test-parity.mjs";

const engine = new TestEngine();

let parity = runLegacyCoreTestParity(engine, {
  id: "ordinary-pass",
  context: "ordinary",
  pool: 4,
  target: 2,
  faces: [4, 4, 1, 2],
  successes: 2,
  outcome: "PASS",
  margin: 0,
  sourceName: "Fighter"
});
assert.equal(parity.parity.all, true);

parity = runLegacyCoreTestParity(engine, {
  id: "ordinary-fail",
  context: "ordinary",
  pool: 4,
  target: 3,
  faces: [4, 1, 2, 3],
  successes: 1,
  outcome: "FAIL",
  margin: 2,
  sourceName: "Scout"
});
assert.equal(parity.parity.all, true);
assert.equal(parity.core.margin, 2);

parity = runLegacyCoreTestParity(engine, {
  id: "versus-tie-tiebreak-pass",
  context: "versus",
  pool: 4,
  target: 2,
  faces: [4, 5, 1, 2],
  successes: 2,
  outcome: "PASS",
  margin: 1,
  sourceName: "Fighter",
  versusResolution: {
    method: "tiebreaker",
    resolved: true,
    ownTieFaces: [4, 5, 1],
    oppTieFaces: [4, 1, 2],
    ownAbility: "Health",
    oppAbility: "Health"
  }
});
assert.equal(parity.parity.all, true);
assert.equal(parity.core.outcome, "PASS");
assert.equal(parity.core.margin, 1);
assert.equal(parity.core.secondaryResolution.method, "tiebreaker");

parity = runLegacyCoreTestParity(engine, {
  id: "versus-tie-trait-fail",
  context: "versus",
  pool: 3,
  target: 1,
  faces: [4, 1, 2],
  successes: 1,
  outcome: "FAIL",
  margin: 0,
  sourceName: "Fighter",
  versusResolution: {
    method: "trait",
    resolved: true
  }
});
assert.equal(parity.parity.all, true);
assert.equal(parity.core.outcome, "FAIL");
assert.equal(parity.core.margin, 0);

parity = runLegacyCoreTestParity(engine, {
  id: "versus-tie-gm-wins",
  context: "versus",
  pool: 3,
  target: 1,
  faces: [4, 1, 2],
  successes: 1,
  outcome: "FAIL",
  margin: 0,
  sourceName: "Fighter",
  versusResolution: {
    method: "gm-wins",
    resolved: true,
    ownTieFaces: [4, 1],
    oppTieFaces: [4, 2]
  }
});
assert.equal(parity.parity.all, true);

parity = runLegacyCoreTestParity(engine, {
  id: "beginner-luck",
  context: "beginnerLuck",
  pool: 3,
  target: 2,
  faces: [4, 2, 5],
  successes: 2,
  outcome: "PASS",
  margin: 0,
  sourceName: "Untrained Pathfinder"
});
assert.equal(parity.context, "beginnerLuck");
assert.equal(parity.parity.all, true);

parity = runLegacyCoreTestParity(engine, {
  id: "fate-open-six",
  context: "ordinary",
  pool: 3,
  target: 3,
  faces: [6, 2, 4],
  supplementalFaces: [6, 5],
  successes: 4,
  outcome: "PASS",
  margin: 1,
  sourceName: "Fighter"
});
assert.deepEqual(parity.core.supplementalFaces, [6, 5]);
assert.equal(parity.parity.all, true);

const mismatch = runLegacyCoreTestParity(engine, {
  id: "intentional-mismatch",
  context: "ordinary",
  pool: 4,
  target: 3,
  faces: [4, 1, 2, 3],
  successes: 1,
  outcome: "PASS",
  margin: 2,
  sourceName: "QA"
});
assert.equal(mismatch.parity.all, false);
assert.equal(mismatch.parity.fields.outcome, false);

console.log("M3 Legacy Mixed <-> CORE Test parity smoke PASS · ordinary/Beginner's Luck/Fate · Automatic Versus resolved tie methods · mismatch detection OK");
