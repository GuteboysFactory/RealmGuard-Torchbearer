import assert from "node:assert/strict";
import {
  EffectEngine,
  createEffect,
  effectApplies,
  EFFECT_TYPES,
  EFFECT_TIMINGS,
  EFFECT_STACKING
} from "../module/core/effects.mjs";

const sample = createEffect({
  id: "condition:tired:test",
  type: EFFECT_TYPES.DICE_MODIFIER,
  value: -1,
  timing: EFFECT_TIMINGS.PRE_ROLL,
  appliesTo: ["ordinary", "conflict"],
  excludes: ["recovery"],
  requirements: [{ path: "actorReady", op: "eq", value: true }],
  source: { providerId: "condition", sourceId: "tired", label: "Tired" },
  stacking: EFFECT_STACKING.STACK,
  duration: { scope: "while-active" },
  metadata: { shadow: true }
});

assert.equal(Object.isFrozen(sample), true);
assert.equal(Object.isFrozen(sample.source), true);
assert.equal(sample.type, "DICE_MODIFIER");
assert.equal(effectApplies(sample, { context: "ordinary", actorReady: true }), true);
assert.equal(effectApplies(sample, { context: "recovery", actorReady: true }), false);
assert.equal(effectApplies(sample, { context: "ordinary", actorReady: false }), false);

const engine = new EffectEngine();
engine.registerProvider({
  id: "conditions",
  label: "Conditions",
  priority: 20,
  collect: () => [sample]
});
engine.registerProvider({
  id: "gear",
  label: "Gear",
  priority: 30,
  collect: () => [{
    id: "gear:rope:test",
    type: EFFECT_TYPES.DICE_MODIFIER,
    value: 1,
    timing: EFFECT_TIMINGS.PRE_ROLL,
    appliesTo: ["ordinary"],
    source: { sourceId: "rope", label: "Rope" }
  }]
});

assert.deepEqual(engine.listProviders().map(provider => provider.id), ["conditions", "gear"]);

const ordinary = engine.collect({ context: "ordinary", actorReady: true });
assert.equal(ordinary.length, 2);
assert.equal(ordinary[0].source.providerId, "conditions");
assert.equal(ordinary[1].source.providerId, "gear");
assert.equal(Object.isFrozen(ordinary), true);

const dice = engine.collectByType(EFFECT_TYPES.DICE_MODIFIER, { context: "ordinary", actorReady: true });
assert.equal(dice.length, 2);

const summary = engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, { context: "ordinary", actorReady: true });
assert.equal(summary.value, 0);
assert.equal(summary.effects.length, 2);

const recovery = engine.collect({ context: "recovery", actorReady: true });
assert.equal(recovery.length, 0);

const onlyGear = engine.collect({ context: "ordinary", actorReady: true }, { providerIds: ["gear"] });
assert.equal(onlyGear.length, 1);
assert.equal(onlyGear[0].source.providerId, "gear");

assert.throws(() => engine.registerProvider({ id: "gear", collect: () => [] }), /already registered/);
assert.equal(engine.unregisterProvider("gear"), true);
assert.deepEqual(engine.listProviders().map(provider => provider.id), ["conditions"]);

console.log(`M2 effect smoke PASS · ${Object.values(EFFECT_TYPES).length} effect types · deterministic provider ordering · applicability/provenance/numeric summary OK`);
