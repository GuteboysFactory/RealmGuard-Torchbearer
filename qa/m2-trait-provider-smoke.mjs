import assert from "node:assert/strict";
import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  TRAIT_SELECTION_EFFECT_PROVIDER,
  TRAIT_SELECTION_PROVIDER_ID,
  buildTraitEffectContext
} from "../module/providers/trait-effects.mjs";

function trait(id, rating, name = `Trait ${rating}`) {
  return { id, type: "trait", name, system: { rating } };
}

function actorWith({ traits = [], conditions = [], uses = {} } = {}) {
  const items = new Map(traits.map(entry => [entry.id, entry]));
  return {
    id: "actor-qa",
    items,
    traits,
    conditions,
    getFlag: (ns, key) => ns === "realm-guard" && key === "traitSessionUses" ? uses : undefined
  };
}

function snapshot(engine, context) {
  const effects = engine.collect(context, { providerIds: [TRAIT_SELECTION_PROVIDER_ID] });
  const sum = (type, channel) => effects
    .filter(effect => effect.type === type && effect.metadata?.channel === channel)
    .reduce((total, effect) => total + Number(effect.value ?? 0), 0);
  return {
    effects,
    selfDice: sum(EFFECT_TYPES.DICE_MODIFIER, "self"),
    opponentDice: sum(EFFECT_TYPES.DICE_MODIFIER, "opponent"),
    successBonus: sum(EFFECT_TYPES.SUCCESS_MODIFIER, "self"),
    checks: sum(EFFECT_TYPES.CURRENCY, "checks"),
    blocked: effects.some(effect => effect.type === EFFECT_TYPES.CAPABILITY_BLOCK)
  };
}

const engine = new EffectEngine();
engine.registerProvider(TRAIT_SELECTION_EFFECT_PROVIDER);
assert.deepEqual(engine.listProviders().map(provider => provider.id), [TRAIT_SELECTION_PROVIDER_ID]);

const level1 = trait("t1", 1, "Bold");
let actor = actorWith({ traits: [level1] });
let result = snapshot(engine, buildTraitEffectContext(actor, level1.id, "help"));
assert.equal(result.selfDice, 1);
assert.equal(result.successBonus, 0);
assert.equal(result.blocked, false);
assert.equal(result.effects[0].source.providerId, TRAIT_SELECTION_PROVIDER_ID);
assert.equal(result.effects[0].source.traitName, "Bold");

actor = actorWith({ traits: [level1], uses: { t1: 1 } });
result = snapshot(engine, buildTraitEffectContext(actor, level1.id, "help"));
assert.equal(result.selfDice, 0);
assert.equal(result.blocked, true);

actor = actorWith({
  traits: [level1],
  conditions: [{ id: "angry", name: "Angry", system: { active: true } }]
});
result = snapshot(engine, buildTraitEffectContext(actor, level1.id, "help"));
assert.equal(result.selfDice, 0);
assert.equal(result.blocked, true);
assert.match(String(result.effects[0].value), /Angry/);

const level3 = trait("t3", 3, "Fearless");
actor = actorWith({ traits: [level3] });
result = snapshot(engine, buildTraitEffectContext(actor, level3.id, "help", { baseSuccesses: 3, target: 3 }));
assert.equal(result.selfDice, 0);
assert.equal(result.successBonus, 1);
result = snapshot(engine, buildTraitEffectContext(actor, level3.id, "help", { baseSuccesses: 2, target: 3 }));
assert.equal(result.successBonus, 0);

actor = actorWith({ traits: [level1] });
result = snapshot(engine, buildTraitEffectContext(actor, level1.id, "against"));
assert.equal(result.selfDice, -1);
assert.equal(result.checks, 1);
assert.equal(result.opponentDice, 0);

result = snapshot(engine, buildTraitEffectContext(actor, level1.id, "hurt", { versus: true }));
assert.equal(result.selfDice, 0);
assert.equal(result.opponentDice, 2);
assert.equal(result.checks, 2);

result = snapshot(engine, buildTraitEffectContext(actor, level1.id, "hurt", { versus: false }));
assert.equal(result.opponentDice, 0);
assert.equal(result.checks, 0);

console.log("M2 Trait provider smoke PASS · L1/L3 benefit · exhaustion/Angry block · Against/Hurt channels/provenance OK");
