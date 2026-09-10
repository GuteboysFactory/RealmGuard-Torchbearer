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

export function buildWiseEffectContext(actor, wiseId, { rollName = "", isSkill = true } = {}) {
  const wise = resolveWise(actor, wiseId);
  return Object.freeze({
    actor,
    wise,
    wiseId: wise?.id ?? null,
    rollName: String(rollName ?? ""),
    isSkill: Boolean(isSkill),
    tags: Object.freeze(["wise-selected-use"])
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

export const WISE_SELECTION_EFFECT_PROVIDER = Object.freeze({
  id: WISE_SELECTION_PROVIDER_ID,
  label: "Wises · Selected Reroll (shadow)",
  priority: 35,
  collect(context = {}) {
    const wise = context.wise;
    if (!wise || wise.type !== "wise") return [];

    if (hasActiveCondition(context.actor, "Angry")) {
      return [{
        id: `wise:${wise.id}:blocked-angry`,
        type: EFFECT_TYPES.CAPABILITY_BLOCK,
        value: "Angry blocks beneficial Wise use",
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["wise-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.REPLACE,
        metadata: { shadow: true, channel: "beneficial", reason: "Angry blocks beneficial Wise use" }
      }];
    }

    return [{
      id: `wise:${wise.id}:reroll-failed-dice`,
      type: EFFECT_TYPES.REROLL,
      value: Object.freeze({ selector: "failed-dice", successThreshold: 4, replacement: true }),
      timing: EFFECT_TIMINGS.POST_ROLL,
      appliesTo: ["wise-selected-use"],
      source: sourceFor(context),
      stacking: EFFECT_STACKING.REPLACE,
      metadata: { shadow: true, channel: "reroll", oncePerSelectedRoll: true }
    }];
  }
});
