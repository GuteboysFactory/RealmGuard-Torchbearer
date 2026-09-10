import { EFFECT_TYPES, EFFECT_TIMINGS, EFFECT_STACKING } from "../core/effects.mjs";
import { tokenPowerApplies, tokenPowerLevel, tokenPowerUsed } from "../tokens-of-power.mjs";

export const TOKEN_POWER_PROVIDER_ID = "tokens-of-power.selected-use";

function resolveToken(actor, tokenId) {
  if (!tokenId) return null;
  const direct = actor?.items?.get?.(tokenId) ?? null;
  if (direct?.type === "tokenOfPower") return direct;
  return Array.from(actor?.tokensOfPower ?? []).find(token => token?.id === tokenId) ?? null;
}

export function buildTokenPowerEffectContext(actor, tokenId, sourceName, { isSkill = true } = {}) {
  const token = resolveToken(actor, tokenId);
  return Object.freeze({
    actor,
    token,
    tokenId: token?.id ?? null,
    sourceName: String(sourceName ?? ""),
    isSkill: Boolean(isSkill),
    tags: Object.freeze(["token-power-selected-use"])
  });
}

function sourceFor(context) {
  return {
    actorId: context.actor?.id ?? null,
    tokenId: context.token?.id ?? null,
    tokenName: context.token?.name ?? "Token of Power",
    documentType: "Item"
  };
}

function stateChange(context, when) {
  return {
    id: `token-power:${context.token.id}:session-use`,
    type: EFFECT_TYPES.STATE_CHANGE,
    value: Object.freeze({ path: "system.session.used", value: true }),
    timing: when,
    appliesTo: ["token-power-selected-use"],
    source: sourceFor(context),
    stacking: EFFECT_STACKING.REPLACE,
    metadata: { shadow: true, channel: "session-use", commitRequired: true }
  };
}

export const TOKEN_POWER_EFFECT_PROVIDER = Object.freeze({
  id: TOKEN_POWER_PROVIDER_ID,
  label: "Tokens of Power · Selected Use (shadow)",
  priority: 37,
  collect(context = {}) {
    const token = context.token;
    if (!token || token.type !== "tokenOfPower") return [];
    if (!tokenPowerApplies(token, context.sourceName, { isSkill: context.isSkill })) return [];

    const level = tokenPowerLevel(token);
    const used = tokenPowerUsed(token);
    const oncePerSession = level === 1 || level === 3;
    if (oncePerSession && used) return [];

    const manual = String(token.system?.effectMode ?? "level") === "manual";
    const effects = [];

    if (manual) {
      effects.push({
        id: `token-power:${token.id}:manual`,
        type: EFFECT_TYPES.MANUAL,
        value: String(token.system?.description ?? token.system?.effect ?? "Manual Token of Power effect"),
        timing: EFFECT_TIMINGS.MANUAL,
        appliesTo: ["token-power-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.REPLACE,
        metadata: { shadow: true, channel: "manual", level }
      });
      if (oncePerSession) effects.push(stateChange(context, EFFECT_TIMINGS.ON_COMMIT));
      return effects;
    }

    if (level === 1 || level === 2) {
      effects.push({
        id: `token-power:${token.id}:dice`,
        type: EFFECT_TYPES.DICE_MODIFIER,
        value: 1,
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["token-power-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.STACK,
        metadata: { shadow: true, channel: "self", level, oncePerSession: level === 1 }
      });
      if (level === 1) effects.push(stateChange(context, EFFECT_TIMINGS.ON_COMMIT));
      return effects;
    }

    effects.push({
      id: `token-power:${token.id}:reroll-failed-dice`,
      type: EFFECT_TYPES.REROLL,
      value: Object.freeze({ selector: "failed-dice", successThreshold: 4, replacement: true }),
      timing: EFFECT_TIMINGS.POST_ROLL,
      appliesTo: ["token-power-selected-use"],
      source: sourceFor(context),
      stacking: EFFECT_STACKING.REPLACE,
      metadata: { shadow: true, channel: "reroll", level: 3, oncePerSession: true }
    });
    effects.push(stateChange(context, EFFECT_TIMINGS.ON_COMMIT));
    return effects;
  }
});
