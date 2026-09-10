import assert from "node:assert/strict";
import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  WISE_SELECTION_EFFECT_PROVIDER,
  WISE_SELECTION_PROVIDER_ID,
  buildWiseEffectContext
} from "../module/providers/wise-effects.mjs";

const wise = { id: "wise-1", name: "Forest-wise", type: "wise", system: { session: { used: true } } };
const actor = {
  id: "actor-1",
  system: { resources: { fate: { value: 2 }, persona: { value: 2 } } },
  conditions: [],
  wises: [wise],
  items: { get: id => id === wise.id ? wise : null }
};

const engine = new EffectEngine();
engine.registerProvider(WISE_SELECTION_EFFECT_PROVIDER);
assert.equal(engine.listProviders().length, 1);
assert.equal(engine.listProviders()[0].id, WISE_SELECTION_PROVIDER_ID);

let context = buildWiseEffectContext(actor, wise.id, {
  rollName: "Pathfinder",
  isSkill: true,
  effectMode: "deeper-understanding",
  relevanceConfirmed: true
});
let effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
let cost = effects.find(effect => effect.type === EFFECT_TYPES.RESOURCE_COST);
let reroll = effects.find(effect => effect.type === EFFECT_TYPES.REROLL);
assert.ok(cost);
assert.ok(reroll);
assert.deepEqual(cost.value, { resource: "fate", amount: 1 });
assert.equal(reroll.value.selector, "one-failed-die");
assert.equal(reroll.value.maxDice, 1);
assert.equal(reroll.value.successThreshold, 4);
assert.equal(reroll.value.excludePreviouslyRerolled, true);
assert.equal(reroll.source.providerId, WISE_SELECTION_PROVIDER_ID);
assert.equal(reroll.source.wiseName, "Forest-wise");

context = buildWiseEffectContext(actor, wise.id, {
  effectMode: "of-course",
  relevanceConfirmed: true
});
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
cost = effects.find(effect => effect.type === EFFECT_TYPES.RESOURCE_COST);
reroll = effects.find(effect => effect.type === EFFECT_TYPES.REROLL);
assert.deepEqual(cost.value, { resource: "persona", amount: 1 });
assert.equal(reroll.value.selector, "all-failed-dice");
assert.equal(reroll.value.maxDice, "all");

// No false once-per-session restriction: legacy session.used metadata on the Wise is ignored.
assert.ok(reroll);

context = buildWiseEffectContext(actor, wise.id, {
  effectMode: "of-course",
  relevanceConfirmed: false
});
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.CAPABILITY_BLOCK);
assert.match(String(effects[0].value), /subject|relevant/i);

actor.conditions = [{ name: "Angry", system: { active: true } }];
context = buildWiseEffectContext(actor, wise.id, {
  effectMode: "deeper-understanding",
  relevanceConfirmed: true
});
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.CAPABILITY_BLOCK);
assert.match(String(effects[0].value), /Angry/);

actor.conditions = [];
actor.system.resources.fate.value = 0;
context = buildWiseEffectContext(actor, wise.id, {
  effectMode: "deeper-understanding",
  relevanceConfirmed: true
});
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.CAPABILITY_BLOCK);
assert.match(String(effects[0].value), /Fate/);

actor.system.resources.fate.value = 2;
actor.system.resources.persona.value = 1;
context = buildWiseEffectContext(actor, wise.id, {
  effectMode: "of-course",
  relevanceConfirmed: true,
  reservedPersona: 1
});
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.CAPABILITY_BLOCK);
assert.match(String(effects[0].value), /Persona/);

context = buildWiseEffectContext(actor, null);
effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);

console.log("M2 Wise provider smoke PASS · Deeper Understanding/Fate · Of Course/Persona · relevance · Angry · reservation · no session lock");
