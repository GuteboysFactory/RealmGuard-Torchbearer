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
assert.deepEqual(parity.parity.fields, {
  pool: true,
  target: true,
  successes: true,
  outcome: true,
  margin: true
});

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
  id: "versus-pass",
  context: "versus",
  pool: 4,
  target: 1,
  faces: [4, 5, 6, 1],
  successes: 3,
  outcome: "PASS",
  margin: 2,
  sourceName: "Fighter"
});
assert.equal(parity.parity.all, true);

parity = runLegacyCoreTestParity(engine, {
  id: "versus-tie",
  context: "versus",
  pool: 4,
  target: 2,
  faces: [4, 5, 1, 2],
  successes: 2,
  outcome: "TIE",
  margin: 0,
  sourceName: "Fighter"
});
assert.equal(parity.parity.all, true);

parity = runLegacyCoreTestParity(engine, {
  id: "success-modifier",
  context: "ordinary",
  pool: 4,
  target: 3,
  faces: [4, 5, 1, 2],
  successes: 3,
  outcome: "PASS",
  margin: 0,
  sourceName: "Orator"
});
assert.equal(parity.legacy.rawSuccesses, 2);
assert.equal(parity.legacy.successModifier, 1);
assert.equal(parity.core.successes, 3);
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

assert.throws(() => runLegacyCoreTestParity(engine, {
  context: "ordinary",
  pool: 3,
  target: 2,
  faces: [4, 4],
  successes: 2,
  outcome: "PASS",
  margin: 0
}), /expected 3 resolved dice/i);

console.log("M3 Legacy Mixed <-> CORE Test parity smoke PASS · ordinary/versus · PASS/FAIL/TIE · positive failure margin · success modifier · mismatch detection OK");
