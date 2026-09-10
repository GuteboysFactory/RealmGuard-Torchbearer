import { EFFECT_TYPES, EFFECT_TIMINGS, EFFECT_STACKING } from "../core/effects.mjs";

export const WISE_SELECTION_PROVIDER_ID = "wises.selected-reroll";

const normalize = value => String(value ?? "").trim().toLowerCase();

function hasActiveCondition(actor, name) {
  const wanted = normalize(name);
  return Array.from(actor?.conditions ?? []).some(condition => Boolean(condition?.system?.active) && normalize(condition?.name) === wanted);
}

function resolveWise(actor, wiseId) {
  if (!wiseId) return null;
  const direct = actor?.items?.get?.(wiseId) ?? null;
  if (direct?.type === "wise") return direct;
  return Array.from(actor?.wises ?? []).find(wise => wise?.id === wiseId) ?? null;
}

function resourceValue(actor, resource) {
  return Math.max(0, Number(actor?.system?.resources?.[resource]?.value ?? 0));
}

export function buildWiseEffectContext(actor, wiseId, {
  rollName = "",
  isSkill = true,
  effectMode = "of-course",
  relevanceConfirmed = true,
  reservedPersona = 0
} = {}) {
  const wise = resolveWise(actor, wiseId);
  return Object.freeze({
    actor,
    wise,
    wiseId: wise?.id ?? null,
    rollName: String(rollName ?? ""),
    isSkill: Boolean(isSkill),
    effectMode: normalize(effectMode) || "of-course",
    relevanceConfirmed: Boolean(relevanceConfirmed),
    reservedPersona: Math.max(0, Number(reservedPersona ?? 0)),
    tags: Object.freeze(["wise-selected-use", "wise-self-use"])
  });
}

function sourceFor(context) {
  return {
    actorId: context.actor?.id ?? null,
    wiseId: context.wise?.id ?? null,
    wiseName: context.wise?.name ?? "Wise",
    documentType: "Item"
  };
}

function block(context, reason, code) {
  return [{
    id: `wise:${context.wise.id}:blocked:${code}`,
    type: EFFECT_TYPES.CAPABILITY_BLOCK,
    value: reason,
    timing: EFFECT_TIMINGS.POST_ROLL,
    appliesTo: ["wise-self-use"],
    source: sourceFor(context),
    stacking: EFFECT_STACKING.REPLACE,
    metadata: { shadow: true, channel: "beneficial", reason, code }
  }];
}

function resourceCost(context, resource, ruleKey) {
  return {
    id: `wise:${context.wise.id}:${ruleKey}:cost`,
    type: EFFECT_TYPES.RESOURCE_COST,
    value: Object.freeze({ resource, amount: 1 }),
    timing: EFFECT_TIMINGS.POST_ROLL,
    appliesTo: ["wise-self-use"],
    source: sourceFor(context),
    stacking: EFFECT_STACKING.REPLACE,
    metadata: { shadow: true, channel: "wise-resource", ruleKey }
  };
}

function reroll(context, selector, maxDice, ruleKey) {
  return {
    id: `wise:${context.wise.id}:${ruleKey}:reroll`,
    type: EFFECT_TYPES.REROLL,
    value: Object.freeze({
      selector,
      maxDice,
      successThreshold: 4,
      replacement: true,
      excludePreviouslyRerolled: true
    }),
    timing: EFFECT_TIMINGS.POST_ROLL,
    appliesTo: ["wise-self-use"],
    source: sourceFor(context),
    stacking: EFFECT_STACKING.REPLACE,
    metadata: { shadow: true, channel: "reroll", ruleKey }
  };
}

export const WISE_SELECTION_EFFECT_PROVIDER = Object.freeze({
  id: WISE_SELECTION_PROVIDER_ID,
  label: "Wises · Self Effects (shadow)",
  priority: 35,
  collect(context = {}) {
    const wise = context.wise;
    if (!wise || wise.type !== "wise") return [];

    if (!context.relevanceConfirmed) {
      return block(context, "Wise subject must be in play and relevant to the test", "relevance");
    }

    if (hasActiveCondition(context.actor, "Angry")) {
      return block(context, "Angry blocks beneficial Wise use", "angry");
    }

    if (context.effectMode === "deeper-understanding") {
      if (resourceValue(context.actor, "fate") < 1) {
        return block(context, "Deeper Understanding requires 1 Fate", "fate");
      }
      return [
        resourceCost(context, "fate", "deeper-understanding"),
        reroll(context, "one-failed-die", 1, "deeper-understanding")
      ];
    }

    if (context.effectMode === "of-course") {
      const availablePersona = resourceValue(context.actor, "persona") - Math.max(0, Number(context.reservedPersona ?? 0));
      if (availablePersona < 1) {
        return block(context, "Of Course! requires 1 available Persona", "persona");
      }
      return [
        resourceCost(context, "persona", "of-course"),
        reroll(context, "all-failed-dice", "all", "of-course")
      ];
    }

    return block(context, `Unsupported Wise self effect: ${context.effectMode}`, "mode");
  }
});
