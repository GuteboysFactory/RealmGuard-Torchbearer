import assert from "node:assert/strict";
import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  TALENT_SELECTION_EFFECT_PROVIDER,
  TALENT_SELECTION_PROVIDER_ID,
  buildTalentEffectContext
} from "../module/providers/talent-effects.mjs";

function makeTalent(overrides = {}) {
  return {
    id: "talent-1",
    name: "QA Talent",
    type: "talent",
    system: {
      minLevel: 2,
      linkType: "skill",
      linkedSkill: "Fighter",
      linkedAbility: "",
      frequency: "session",
      effectMode: "dice",
      diceBonus: 1,
      session: { used: false },
      conflict: { usedId: "" },
      ...overrides
    }
  };
}

function makeActor(talent, level = 2) {
  return {
    id: "actor-1",
    system: { progression: { level } },
    talents: [talent],
    items: { get: id => id === talent.id ? talent : null }
  };
}

const engine = new EffectEngine();
engine.registerProvider(TALENT_SELECTION_EFFECT_PROVIDER);
assert.equal(engine.listProviders().length, 1);
assert.equal(engine.listProviders()[0].id, TALENT_SELECTION_PROVIDER_ID);

let talent = makeTalent();
let actor = makeActor(talent, 2);
let context = buildTalentEffectContext(actor, talent.id, "Fighter", { isSkill: true });
let effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
let dice = effects.find(effect => effect.type === EFFECT_TYPES.DICE_MODIFIER);
let state = effects.find(effect => effect.type === EFFECT_TYPES.STATE_CHANGE);
assert.ok(dice);
assert.equal(dice.value, 1);
assert.equal(dice.source.providerId, TALENT_SELECTION_PROVIDER_ID);
assert.equal(dice.source.talentName, "QA Talent");
assert.ok(state);
assert.deepEqual(state.value, { path: "system.session.used", value: true });
assert.equal(Object.isFrozen(dice), true);

// Used once/session Talent is unavailable.
talent.system.session.used = true;
context = buildTalentEffectContext(actor, talent.id, "Fighter", { isSkill: true });
effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);
talent.system.session.used = false;

// Wrong linked Skill is unavailable.
context = buildTalentEffectContext(actor, talent.id, "Farmer", { isSkill: true });
effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);

// Minimum level is preserved.
actor = makeActor(talent, 1);
context = buildTalentEffectContext(actor, talent.id, "Fighter", { isSkill: true });
effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);

// Passive Ability-linked Talent gives dice without a consumption state.
talent = makeTalent({ linkType: "ability", linkedAbility: "health", frequency: "passive", diceBonus: 2 });
actor = makeActor(talent, 2);
context = buildTalentEffectContext(actor, talent.id, "Health", { isSkill: false });
effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
dice = effects.find(effect => effect.type === EFFECT_TYPES.DICE_MODIFIER);
state = effects.find(effect => effect.type === EFFECT_TYPES.STATE_CHANGE);
assert.equal(dice?.value, 2);
assert.equal(state, undefined);

// Conflict frequency requires a context and shadows usedId on commit.
talent = makeTalent({ frequency: "conflict" });
actor = makeActor(talent, 2);
context = buildTalentEffectContext(actor, talent.id, "Fighter", { isSkill: true, contextKey: "" });
effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);
context = buildTalentEffectContext(actor, talent.id, "Fighter", { isSkill: true, contextKey: "fight-1" });
effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
state = effects.find(effect => effect.type === EFFECT_TYPES.STATE_CHANGE);
assert.ok(state);
assert.deepEqual(state.value, { path: "system.conflict.usedId", value: "fight-1" });
talent.system.conflict.usedId = "fight-1";
effects = engine.collect(buildTalentEffectContext(actor, talent.id, "Fighter", { isSkill: true, contextKey: "fight-1" }), { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
assert.equal(effects.length, 0);

// Manual general Talent is represented as MANUAL plus its current session consumption.
talent = makeTalent({ linkType: "general", frequency: "session", effectMode: "manual", diceBonus: 5 });
actor = makeActor(talent, 2);
effects = engine.collect(buildTalentEffectContext(actor, talent.id, "Anything", { isSkill: false }), { providerIds: [TALENT_SELECTION_PROVIDER_ID] });
assert.ok(effects.some(effect => effect.type === EFFECT_TYPES.MANUAL));
assert.ok(effects.some(effect => effect.type === EFFECT_TYPES.STATE_CHANGE));
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.DICE_MODIFIER), false);

console.log("M2 Talent provider smoke PASS");
