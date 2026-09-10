import { EffectEngine, EFFECT_TYPES } from "../module/core/effects.mjs";
import {
  CONFLICT_TOOL_EFFECT_PROVIDER,
  CONFLICT_TOOL_PROVIDER_ID,
  buildConflictToolEffectContext
} from "../module/providers/conflict-tool-effects.mjs";
import { legacyConflictToolReference } from "../module/legacy/conflict-tool-reference.mjs";

const engine = new EffectEngine();
engine.registerProvider(CONFLICT_TOOL_EFFECT_PROVIDER);

function summarize(selection, action, options = {}) {
  const legacy = legacyConflictToolReference(selection, action, options);
  const context = buildConflictToolEffectContext(selection, action, options);
  const effects = engine.collect(context, { providerIds: [CONFLICT_TOOL_PROVIDER_ID] });
  const dice = effects.filter(e => e.type === EFFECT_TYPES.DICE_MODIFIER).reduce((n, e) => n + Number(e.value ?? 0), 0);
  const conditionalSuccess = effects
    .filter(e => e.type === EFFECT_TYPES.SUCCESS_MODIFIER && e.metadata?.channel === "conditionalSuccess")
    .reduce((n, e) => n + Math.max(0, Number(e.value ?? 0)), 0);
  const successPenalty = effects
    .filter(e => e.type === EFFECT_TYPES.SUCCESS_MODIFIER && e.metadata?.channel === "successPenalty")
    .reduce((n, e) => n + Math.abs(Math.min(0, Number(e.value ?? 0))), 0);
  const blocked = effects.some(e => e.type === EFFECT_TYPES.CAPABILITY_BLOCK);
  const expectedBlocked = Boolean(legacy.requirement && !legacy.requirementMet);
  if (dice !== legacy.dice || conditionalSuccess !== legacy.conditionalSuccess || successPenalty !== legacy.successPenalty || blocked !== expectedBlocked) {
    throw new Error(`Conflict Tool mismatch for ${legacy.toolName} / ${action}: legacy=${JSON.stringify(legacy)} core=${JSON.stringify({ dice, conditionalSuccess, successPenalty, blocked, effects })}`);
  }
  return { legacy, effects };
}

summarize("Shield", "defend");
summarize("Shield", "attack");
summarize("Halberd", "attack");
summarize("Halberd", "maneuver");
summarize("Whip", "maneuver");
summarize("Whip", "attack");
summarize("Hook and Line", "maneuver");
summarize("Spear", "defend");
summarize("Spear", "feint");
summarize("Staff", "feint");
summarize("Bow", "maneuver");
summarize("Sling", "maneuver");
summarize("Axe", "attack");
summarize("Axe", "defend");
summarize("Sword", "attack", { swordAction: "attack" });
summarize("Sword", "defend", { swordAction: "attack" });
summarize("Knife", "attack");
summarize(null, "attack");

summarize({ kind: "tool", id: "qa-dice", name: "QA Dice Tool", action: "attack", effect: "dice", value: 2 }, "attack");
summarize({ kind: "tool", id: "qa-success", name: "QA Success Tool", action: "any", effect: "success", value: 1 }, "defend");
summarize({ kind: "tool", id: "qa-penalty", name: "QA Penalty Tool", action: "feint", effect: "success", value: -1 }, "feint");
summarize({ kind: "tool", id: "qa-off-action", name: "QA Off Action", action: "attack", effect: "dice", value: 3 }, "defend");
summarize({ kind: "tool", id: "qa-required", name: "QA Required", action: "attack", effect: "dice", value: 3, requirement: "high ground" }, "attack", { requirementMet: false });

const unarmed = summarize(null, "attack");
if (!unarmed.effects.some(effect => effect.metadata?.legacyCompatibility === true)) {
  throw new Error("Legacy Mixed unarmed penalty must be marked legacyCompatibility=true.");
}

console.log("CORE M2 Conflict Tool provider smoke PASS");
