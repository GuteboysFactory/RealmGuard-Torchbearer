import { EFFECT_TYPES, EFFECT_TIMINGS, EFFECT_STACKING } from "../core/effects.mjs";

export const CONDITION_ROLL_PROVIDER_ID = "conditions.roll-dice";

const normalize = value => String(value ?? "").trim().toLowerCase();

function conditionTargets(condition) {
  const raw = String(condition?.system?.appliesTo ?? "all").trim();
  const key = normalize(raw);
  if (!raw || key === "all" || raw === "*") return ["*"];
  if (key === "none") return [];
  return raw.split(",").map(normalize).filter(Boolean);
}

function actorConditions(actor) {
  return Array.from(actor?.conditions ?? []).filter(condition => Boolean(condition?.system?.active));
}

export function buildConditionEffectContext(actor, rollName, { isSkill = true, tags = [] } = {}) {
  const normalizedRoll = normalize(rollName);
  const contextTags = new Set(Array.isArray(tags) ? tags.map(normalize).filter(Boolean) : []);
  if (normalizedRoll) contextTags.add(normalizedRoll);
  if (isSkill) contextTags.add("skills");
  return Object.freeze({
    actor,
    rollName: String(rollName ?? ""),
    isSkill: Boolean(isSkill),
    tags: Object.freeze([...contextTags])
  });
}

export const CONDITION_ROLL_EFFECT_PROVIDER = Object.freeze({
  id: CONDITION_ROLL_PROVIDER_ID,
  label: "Conditions · Roll Dice (shadow)",
  priority: 20,
  collect(context = {}) {
    const effects = [];
    for (const condition of actorConditions(context.actor)) {
      const value = Number(condition?.system?.rollModifier ?? 0);
      if (!Number.isFinite(value) || value === 0) continue;
      const appliesTo = conditionTargets(condition);
      if (!appliesTo.length) continue;
      effects.push({
        id: `condition:${condition.id ?? (normalize(condition.name) || "unknown")}:roll-dice`,
        type: EFFECT_TYPES.DICE_MODIFIER,
        value,
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo,
        source: {
          actorId: context.actor?.id ?? null,
          conditionId: condition.id ?? null,
          conditionName: condition.name ?? "Condition",
          documentType: "Item"
        },
        stacking: EFFECT_STACKING.STACK,
        duration: { scope: "while-active" },
        metadata: {
          shadow: true,
          legacyField: "system.rollModifier",
          legacyAppliesTo: String(condition?.system?.appliesTo ?? "all")
        }
      });
    }
    return effects;
  }
});
