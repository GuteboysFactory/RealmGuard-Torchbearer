import assert from "node:assert/strict";
import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  WISE_SELECTION_EFFECT_PROVIDER,
  WISE_SELECTION_PROVIDER_ID,
  buildWiseEffectContext
} from "../module/providers/wise-effects.mjs";

const wise = { id: "wise-1", name: "Forest-wise", type: "wise", system: {} };
const actor = {
  id: "actor-1",
  conditions: [],
  wises: [wise],
  items: { get: id => id === wise.id ? wise : null }
};

const engine = new EffectEngine();
engine.registerProvider(WISE_SELECTION_EFFECT_PROVIDER);
assert.equal(engine.listProviders().length, 1);
assert.equal(engine.listProviders()[0].id, WISE_SELECTION_PROVIDER_ID);

let context = buildWiseEffectContext(actor, wise.id, { rollName: "Pathfinder", isSkill: true });
let effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.REROLL);
assert.equal(effects[0].source.providerId, WISE_SELECTION_PROVIDER_ID);
assert.equal(effects[0].source.wiseName, "Forest-wise");
assert.equal(effects[0].value.selector, "failed-dice");
assert.equal(effects[0].value.successThreshold, 4);
assert.equal(effects[0].value.replacement, true);
assert.equal(Object.isFrozen(effects[0]), true);

actor.conditions = [{ name: "Angry", system: { active: true } }];
context = buildWiseEffectContext(actor, wise.id);
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.CAPABILITY_BLOCK);
assert.match(String(effects[0].value), /Angry/);

actor.conditions = [];
context = buildWiseEffectContext(actor, null);
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);

console.log("M2 Wise provider smoke PASS");
