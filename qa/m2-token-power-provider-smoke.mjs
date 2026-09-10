import assert from "node:assert/strict";
import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  TOKEN_POWER_EFFECT_PROVIDER,
  TOKEN_POWER_PROVIDER_ID,
  buildTokenPowerEffectContext
} from "../module/providers/token-power-effects.mjs";

function token(id, level, { used = false, effectMode = "level", linkedSkill = "Pathfinder", linkType = "skill" } = {}) {
  return {
    id,
    type: "tokenOfPower",
    name: `Token L${level}`,
    system: {
      level,
      effectMode,
      linkType,
      linkedSkill,
      linkedUse: linkType === "specific" ? "QA specific use" : "",
      session: { used }
    }
  };
}

function actorWith(tokens) {
  return {
    id: "actor-qa",
    items: new Map(tokens.map(entry => [entry.id, entry])),
    tokensOfPower: tokens
  };
}

function effectsFor(engine, actor, tokenId, sourceName = "Pathfinder", options = { isSkill: true }) {
  return engine.collect(buildTokenPowerEffectContext(actor, tokenId, sourceName, options), { providerIds: [TOKEN_POWER_PROVIDER_ID] });
}

const engine = new EffectEngine();
engine.registerProvider(TOKEN_POWER_EFFECT_PROVIDER);
assert.deepEqual(engine.listProviders().map(provider => provider.id), [TOKEN_POWER_PROVIDER_ID]);

let power = token("l1", 1);
let actor = actorWith([power]);
let effects = effectsFor(engine, actor, power.id);
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.DICE_MODIFIER && effect.value === 1), true);
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.STATE_CHANGE), true);
assert.equal(effects[0].source.providerId, TOKEN_POWER_PROVIDER_ID);

power = token("l2", 2);
actor = actorWith([power]);
effects = effectsFor(engine, actor, power.id);
assert.equal(effects.length, 1);
assert.equal(effects[0].type, EFFECT_TYPES.DICE_MODIFIER);
assert.equal(effects[0].value, 1);
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.STATE_CHANGE), false);

power = token("l3", 3);
actor = actorWith([power]);
effects = effectsFor(engine, actor, power.id);
const reroll = effects.find(effect => effect.type === EFFECT_TYPES.REROLL);
assert.ok(reroll);
assert.equal(reroll.value.selector, "failed-dice");
assert.equal(reroll.value.successThreshold, 4);
assert.equal(reroll.metadata.consumeOnRerollAccept, true);
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.STATE_CHANGE), false);

power = token("used", 3, { used: true });
actor = actorWith([power]);
assert.equal(effectsFor(engine, actor, power.id).length, 0);

power = token("manual", 1, { effectMode: "manual" });
actor = actorWith([power]);
effects = effectsFor(engine, actor, power.id);
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.MANUAL), true);
assert.equal(effects.some(effect => effect.type === EFFECT_TYPES.STATE_CHANGE), true);

power = token("wrong-skill", 2, { linkedSkill: "Fighter" });
actor = actorWith([power]);
assert.equal(effectsFor(engine, actor, power.id, "Pathfinder").length, 0);

power = token("ability-no", 2);
actor = actorWith([power]);
assert.equal(effectsFor(engine, actor, power.id, "Will", { isSkill: false }).length, 0);

console.log("M2 Token of Power provider smoke PASS · L1/L2 dice · L3 reroll-on-accept · manual/state · used/applicability/provenance OK");
