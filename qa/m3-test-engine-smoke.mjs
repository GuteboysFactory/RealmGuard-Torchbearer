import assert from "node:assert/strict";
import {
  TestEngine,
  createTestContext,
  createTestRequest,
  createRollPlan,
  TEST_TRANSACTION_STATES
} from "../module/core/test-engine.mjs";

const engine = new TestEngine();

const context = createTestContext({ type: "ordinary", sourceName: "Fighter", isSkill: true });
assert.equal(context.type, "ordinary");
assert.equal(Object.isFrozen(context), true);

const request = createTestRequest({
  id: "m3-ordinary",
  context,
  basePool: 4,
  obstacle: 2,
  successThreshold: 4
});
const plan = createRollPlan(request);
assert.equal(plan.finalPool, 4);

let prepared = engine.prepare(request, {});
assert.equal(prepared.transaction.state, TEST_TRANSACTION_STATES.PREPARED);
prepared.transaction.reserve();
assert.equal(prepared.transaction.state, TEST_TRANSACTION_STATES.RESERVED);
prepared.transaction.recordRoll([4, 4, 1, 2]);
assert.equal(prepared.transaction.state, TEST_TRANSACTION_STATES.ROLLED);
let result = engine.resolveFaces(prepared.plan, [4, 4, 1, 2]);
assert.equal(result.rawSuccesses, 2);
assert.equal(result.finalSuccesses, 2);
assert.equal(result.targetSuccesses, 2);
assert.equal(result.outcome, "PASS");
assert.equal(result.margin, 0);
prepared.transaction.resolve(result);
assert.equal(prepared.transaction.state, TEST_TRANSACTION_STATES.RESOLVED);
prepared.transaction.commit();
assert.equal(prepared.transaction.state, TEST_TRANSACTION_STATES.COMMITTED);

prepared = engine.prepare({
  id: "m3-cancel",
  context: { type: "ordinary" },
  basePool: 3,
  obstacle: 2
});
prepared.transaction.reserve().cancel();
assert.equal(prepared.transaction.state, TEST_TRANSACTION_STATES.PREPARED);
assert.equal(prepared.transaction.cancelled, true);
assert.deepEqual(prepared.transaction.faces, []);
assert.equal(prepared.transaction.result, null);

prepared = engine.runDeterministic({
  id: "m3-versus-tie",
  context: { type: "versus" },
  basePool: 4,
  oppositionSuccesses: 2
}, {}, [4, 4, 1, 2]);
assert.equal(prepared.result.outcome, "TIE");
assert.equal(prepared.result.margin, 0);

prepared = engine.runDeterministic({
  id: "m3-modifiers",
  context: { type: "ordinary" },
  basePool: 3,
  extraDice: 1,
  obstacle: 2,
  successModifier: 1
}, { diceModifier: 1 }, [4, 1, 2, 3, 6]);
assert.equal(prepared.plan.finalPool, 5);
assert.equal(prepared.result.rawSuccesses, 2);
assert.equal(prepared.result.finalSuccesses, 3);
assert.equal(prepared.result.outcome, "PASS");

assert.throws(() => engine.resolveFaces(plan, [4, 4, 1]), /expected 4 dice/i);
assert.throws(() => createTestContext({ type: "not-a-context" }), /Unsupported TestContext/);

console.log("M3 Unified Test Engine smoke PASS · ordinary/versus · transaction lifecycle · cancel rollback · modifiers · validation OK");
