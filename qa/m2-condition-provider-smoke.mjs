import assert from "node:assert/strict";
import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  CONDITION_ROLL_EFFECT_PROVIDER,
  CONDITION_ROLL_PROVIDER_ID,
  buildConditionEffectContext
} from "../module/providers/condition-effects.mjs";

function condition(id, name, { active = true, rollModifier = 0, appliesTo = "none" } = {}) {
  return { id, name, system: { active, rollModifier, appliesTo } };
}

const actor = {
  id: "actor-qa",
  conditions: [
    condition("strained", "Strained", { rollModifier: -1, appliesTo: "skills,nature,will,health" }),
    condition("fresh", "Fresh", { active: false, rollModifier: 1, appliesTo: "skills,nature,will,health" }),
    condition("tired", "Tired", { rollModifier: 0, appliesTo: "none" }),
    condition("custom", "Blessed Test", { rollModifier: 2, appliesTo: "all" })
  ]
};

const engine = new EffectEngine();
engine.registerProvider(CONDITION_ROLL_EFFECT_PROVIDER);

assert.deepEqual(engine.listProviders().map(provider => provider.id), [CONDITION_ROLL_PROVIDER_ID]);

const skillContext = buildConditionEffectContext(actor, "Pathfinder", { isSkill: true });
const skillSummary = engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, skillContext);
assert.equal(skillSummary.value, 1); // Strained -1 + custom all +2.
assert.equal(skillSummary.effects.length, 2);
assert.equal(skillSummary.effects[0].source.providerId, CONDITION_ROLL_PROVIDER_ID);
assert.equal(skillSummary.effects[0].source.conditionName, "Strained");
assert.equal(skillSummary.effects[1].source.conditionName, "Blessed Test");

const natureContext = buildConditionEffectContext(actor, "Nature", { isSkill: false });
assert.equal(engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, natureContext).value, 1);

const resourcesContext = buildConditionEffectContext(actor, "Resources", { isSkill: false });
const resourcesSummary = engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, resourcesContext);
assert.equal(resourcesSummary.value, 2); // Strained does not apply; custom all does.
assert.equal(resourcesSummary.effects.length, 1);
assert.equal(resourcesSummary.effects[0].source.conditionName, "Blessed Test");

const circlesContext = buildConditionEffectContext(actor, "Circles", { isSkill: false });
assert.equal(engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, circlesContext).value, 2);

actor.conditions[1].system.active = true;
const freshSkill = engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, buildConditionEffectContext(actor, "Pathfinder", { isSkill: true }));
assert.equal(freshSkill.value, 2); // Strained -1 + Fresh +1 + custom +2.
assert.equal(freshSkill.effects.length, 3);

const inactiveActor = {
  id: "actor-inactive",
  conditions: [condition("injured", "Injured", { active: false, rollModifier: -1, appliesTo: "skills,nature,will,health" })]
};
assert.equal(engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, buildConditionEffectContext(inactiveActor, "Pathfinder", { isSkill: true })).value, 0);

console.log("M2 condition provider smoke PASS · active/appliesTo/custom/all/provenance shadow mapping OK");
