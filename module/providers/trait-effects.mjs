import { EFFECT_TYPES, EFFECT_TIMINGS, EFFECT_STACKING } from "../core/effects.mjs";

export const TRAIT_SELECTION_PROVIDER_ID = "traits.selected-use";

const NS = "realm-guard";
const USE_FLAG = "traitSessionUses";
const normalize = value => String(value ?? "").trim().toLowerCase();

function traitLevel(trait) {
  return Math.max(0, Math.min(3, Number(trait?.system?.rating ?? 0)));
}

function traitLimit(trait) {
  const level = traitLevel(trait);
  if (level === 1) return 1;
  if (level === 2) return 2;
  return null;
}

function traitUsed(actor, trait) {
  const uses = actor?.getFlag?.(NS, USE_FLAG) ?? {};
  return Math.max(0, Number(uses?.[trait?.id] ?? 0));
}

function traitAvailable(actor, trait) {
  const level = traitLevel(trait);
  if (level === 3) return true;
  const limit = traitLimit(trait);
  if (!limit) return false;
  return traitUsed(actor, trait) < limit;
}

function hasActiveCondition(actor, name) {
  const wanted = normalize(name);
  return Array.from(actor?.conditions ?? []).some(condition => Boolean(condition?.system?.active) && normalize(condition?.name) === wanted);
}

function resolveTrait(actor, traitId) {
  if (!traitId) return null;
  const direct = actor?.items?.get?.(traitId) ?? null;
  if (direct?.type === "trait") return direct;
  return Array.from(actor?.traits ?? []).find(trait => trait?.id === traitId) ?? null;
}

export function buildTraitEffectContext(actor, traitId, traitMode = "help", {
  versus = false,
  baseSuccesses = 0,
  target = 0,
  rollName = "",
  isSkill = true
} = {}) {
  const trait = resolveTrait(actor, traitId);
  return Object.freeze({
    actor,
    trait,
    traitId: trait?.id ?? null,
    traitMode: trait?.type === "trait" ? String(traitMode || "help") : "none",
    versus: Boolean(versus),
    baseSuccesses: Number(baseSuccesses ?? 0),
    target: Number(target ?? 0),
    rollName: String(rollName ?? ""),
    isSkill: Boolean(isSkill),
    tags: Object.freeze(["trait-selected-use"])
  });
}

function sourceFor(context, extra = {}) {
  const trait = context.trait;
  return {
    actorId: context.actor?.id ?? null,
    traitId: trait?.id ?? null,
    traitName: trait?.name ?? "Trait",
    traitLevel: traitLevel(trait),
    documentType: "Item",
    ...extra
  };
}

function effectId(context, suffix) {
  const traitKey = context.trait?.id ?? normalize(context.trait?.name) || "unknown";
  return `trait:${traitKey}:${suffix}`;
}

export const TRAIT_SELECTION_EFFECT_PROVIDER = Object.freeze({
  id: TRAIT_SELECTION_PROVIDER_ID,
  label: "Traits · Selected Use (shadow)",
  priority: 30,
  collect(context = {}) {
    const trait = context.trait;
    if (!trait || trait.type !== "trait") return [];

    const effects = [];
    const requestedMode = String(context.traitMode || "help");
    const level = traitLevel(trait);
    const available = traitAvailable(context.actor, trait);
    const angry = hasActiveCondition(context.actor, "Angry");
    const blockedHelp = requestedMode === "help" && (angry || !available);
    const resolvedMode = blockedHelp ? "blocked-help" : requestedMode;
    const commonMetadata = {
      shadow: true,
      requestedMode,
      resolvedMode,
      channel: "self"
    };

    if (blockedHelp) {
      effects.push({
        id: effectId(context, "benefit-blocked"),
        type: EFFECT_TYPES.CAPABILITY_BLOCK,
        value: angry ? "Angry blocks beneficial Trait use" : "beneficial use already spent this session",
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["trait-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.REPLACE,
        metadata: { ...commonMetadata, channel: "beneficial", available, angry }
      });
      return effects;
    }

    if (resolvedMode === "help") {
      if ((level === 1 || level === 2) && available) {
        effects.push({
          id: effectId(context, "benefit-dice"),
          type: EFFECT_TYPES.DICE_MODIFIER,
          value: 1,
          timing: EFFECT_TIMINGS.PRE_ROLL,
          appliesTo: ["trait-selected-use"],
          source: sourceFor(context),
          stacking: EFFECT_STACKING.STACK,
          metadata: { ...commonMetadata, channel: "self", sessionUseRequired: true, used: traitUsed(context.actor, trait), limit: traitLimit(trait) }
        });
      }
      if (level === 3 && Number(context.baseSuccesses ?? 0) >= Number(context.target ?? 0)) {
        effects.push({
          id: effectId(context, "benefit-success"),
          type: EFFECT_TYPES.SUCCESS_MODIFIER,
          value: 1,
          timing: EFFECT_TIMINGS.POST_ROLL,
          appliesTo: ["trait-selected-use"],
          source: sourceFor(context),
          stacking: EFFECT_STACKING.STACK,
          metadata: { ...commonMetadata, channel: "self", passedOrTied: true }
        });
      }
      return effects;
    }

    if (resolvedMode === "against") {
      effects.push({
        id: effectId(context, "against-self-dice"),
        type: EFFECT_TYPES.DICE_MODIFIER,
        value: -1,
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["trait-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.STACK,
        metadata: { ...commonMetadata, channel: "self" }
      });
      effects.push({
        id: effectId(context, "against-check"),
        type: EFFECT_TYPES.CURRENCY,
        value: 1,
        timing: EFFECT_TIMINGS.POST_RESOLVE,
        appliesTo: ["trait-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.STACK,
        metadata: { ...commonMetadata, channel: "checks", currency: "checks", awardControlledBySessionEngine: true }
      });
      return effects;
    }

    if (resolvedMode === "hurt" && context.versus) {
      effects.push({
        id: effectId(context, "hurt-opponent-dice"),
        type: EFFECT_TYPES.DICE_MODIFIER,
        value: 2,
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["trait-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.STACK,
        metadata: { ...commonMetadata, channel: "opponent" }
      });
      effects.push({
        id: effectId(context, "hurt-checks"),
        type: EFFECT_TYPES.CURRENCY,
        value: 2,
        timing: EFFECT_TIMINGS.POST_RESOLVE,
        appliesTo: ["trait-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.STACK,
        metadata: { ...commonMetadata, channel: "checks", currency: "checks", awardControlledBySessionEngine: true }
      });
    }

    return effects;
  }
});
