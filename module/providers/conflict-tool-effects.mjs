import { EFFECT_TYPES, EFFECT_TIMINGS, EFFECT_STACKING } from "../core/effects.mjs";

export const CONFLICT_TOOL_PROVIDER_ID = "conflict-tools.action-modifiers";

const normalize = value => String(value ?? "").trim().toLowerCase();

function normalizeSelection(selection) {
  if (!selection) return Object.freeze({ kind: "unarmed", id: null, name: "Unarmed" });
  if (typeof selection === "string") return Object.freeze({ kind: "gear", id: null, name: selection });
  if (selection.kind === "tool") {
    const tool = selection.tool ?? selection;
    return Object.freeze({
      kind: "tool",
      id: selection.id ?? tool.id ?? null,
      name: selection.name ?? tool.name ?? "Conflict Tool",
      action: String(tool.action ?? "any"),
      effect: String(tool.effect ?? "none"),
      value: Number(tool.value ?? 0),
      requirement: String(tool.requirement ?? ""),
      special: String(tool.special ?? "")
    });
  }
  return Object.freeze({
    kind: "gear",
    id: selection.id ?? null,
    name: selection.name ?? "Gear"
  });
}

export function buildConflictToolEffectContext(selection, action, {
  swordAction = "",
  requirementMet = true
} = {}) {
  const selected = normalizeSelection(selection);
  return Object.freeze({
    selection: selected,
    action: normalize(action),
    swordAction: normalize(swordAction),
    requirementMet: Boolean(requirementMet),
    tags: Object.freeze(["conflict-tool", `conflict-action:${normalize(action)}`])
  });
}

function sourceFor(context, extra = {}) {
  const selection = context.selection;
  return {
    documentType: selection.kind === "gear" ? "Item" : "ConflictTool",
    gearId: selection.kind === "gear" ? selection.id : null,
    toolId: selection.kind === "tool" ? selection.id : null,
    toolName: selection.name,
    toolKind: selection.kind,
    ...extra
  };
}

function effectId(context, suffix) {
  const selection = context.selection;
  const key = selection.id ?? normalize(selection.name) || "unarmed";
  return `conflict-tool:${key}:${context.action || "any"}:${suffix}`;
}

function diceEffect(context, value, suffix, metadata = {}) {
  if (!Number(value)) return null;
  return {
    id: effectId(context, suffix),
    type: EFFECT_TYPES.DICE_MODIFIER,
    value: Number(value),
    timing: EFFECT_TIMINGS.PRE_ROLL,
    appliesTo: ["conflict-tool"],
    source: sourceFor(context),
    stacking: EFFECT_STACKING.STACK,
    metadata: { shadow: true, channel: "dice", ...metadata }
  };
}

function successEffect(context, value, channel, suffix, metadata = {}) {
  if (!Number(value)) return null;
  return {
    id: effectId(context, suffix),
    type: EFFECT_TYPES.SUCCESS_MODIFIER,
    value: Number(value),
    timing: EFFECT_TIMINGS.POST_ROLL,
    appliesTo: ["conflict-tool"],
    source: sourceFor(context),
    stacking: EFFECT_STACKING.STACK,
    metadata: { shadow: true, channel, conditionalOnLegalSuccess: channel === "conditionalSuccess", ...metadata }
  };
}

function push(effects, effect) {
  if (effect) effects.push(effect);
}

export const CONFLICT_TOOL_EFFECT_PROVIDER = Object.freeze({
  id: CONFLICT_TOOL_PROVIDER_ID,
  label: "Conflict Tools · Action Modifiers (shadow)",
  priority: 40,
  collect(context = {}) {
    const selection = context.selection ?? normalizeSelection(null);
    const action = normalize(context.action);
    const effects = [];

    if (selection.kind === "unarmed") {
      push(effects, diceEffect(context, -1, "legacy-unarmed-penalty", {
        legacyCompatibility: true,
        rule: "Legacy Mixed no valid Conflict Weapon or Tool"
      }));
      return effects;
    }

    if (selection.kind === "tool") {
      const applies = selection.action === "any" || normalize(selection.action) === action;
      if (selection.requirement && !context.requirementMet) {
        effects.push({
          id: effectId(context, "requirement-block"),
          type: EFFECT_TYPES.CAPABILITY_BLOCK,
          value: selection.requirement,
          timing: EFFECT_TIMINGS.PRE_ROLL,
          appliesTo: ["conflict-tool"],
          source: sourceFor(context),
          stacking: EFFECT_STACKING.REPLACE,
          metadata: {
            shadow: true,
            channel: "requirement",
            requirement: selection.requirement,
            reason: "requirement not met — no bonus"
          }
        });
        return effects;
      }
      if (!applies) return effects;
      if (selection.effect === "dice") push(effects, diceEffect(context, selection.value, "tool-dice"));
      if (selection.effect === "success") {
        const value = Number(selection.value ?? 0);
        if (value > 0) push(effects, successEffect(context, value, "conditionalSuccess", "tool-success"));
        if (value < 0) push(effects, successEffect(context, value, "successPenalty", "tool-success-penalty"));
      }
      return effects;
    }

    const name = normalize(selection.name);
    if (name === "shield" && action === "defend") push(effects, diceEffect(context, 2, "shield-defend"));

    if (name === "halberd") {
      if (["attack", "defend"].includes(action)) push(effects, diceEffect(context, 1, "halberd-positive"));
      if (["feint", "maneuver"].includes(action)) push(effects, diceEffect(context, -1, "halberd-negative"));
    }

    if (["whip", "hook and line"].includes(name)) {
      if (action === "maneuver") {
        push(effects, diceEffect(context, 1, "whip-maneuver-dice"));
        push(effects, successEffect(context, 1, "conditionalSuccess", "whip-maneuver-success"));
      }
      if (action === "attack") push(effects, diceEffect(context, -1, "whip-attack"));
    }

    if (name === "spear") {
      if (action === "defend") push(effects, diceEffect(context, 1, "spear-defend"));
      if (action === "feint") push(effects, successEffect(context, 1, "conditionalSuccess", "spear-feint-success"));
    }

    if (name === "staff" && action === "feint") push(effects, diceEffect(context, 1, "staff-feint"));
    if (name === "bow" && action === "maneuver") push(effects, diceEffect(context, 2, "bow-maneuver"));
    if (name === "sling" && action === "maneuver") push(effects, diceEffect(context, 1, "sling-maneuver"));

    if (name === "axe") {
      if (action === "attack") push(effects, successEffect(context, 1, "conditionalSuccess", "axe-attack-success"));
      if (["defend", "feint"].includes(action)) push(effects, diceEffect(context, -1, "axe-negative"));
    }

    if (name === "sword" && context.swordAction && context.swordAction === action) {
      push(effects, diceEffect(context, 1, "sword-useful", { swordAction: context.swordAction }));
    }

    return effects;
  }
});
