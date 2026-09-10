import { EFFECT_TYPES, EFFECT_TIMINGS, EFFECT_STACKING } from "../core/effects.mjs";

export const TALENT_SELECTION_PROVIDER_ID = "talents.selected-use";

const normalize = value => String(value ?? "").trim().toLowerCase();

function resolveTalent(actor, talentId) {
  if (!talentId) return null;
  const direct = actor?.items?.get?.(talentId) ?? null;
  if (direct?.type === "talent") return direct;
  return Array.from(actor?.talents ?? []).find(talent => talent?.id === talentId) ?? null;
}

function appliesToSource(talent, sourceName, isSkill) {
  const type = normalize(talent?.system?.linkType || "skill");
  const source = normalize(sourceName);
  if (type === "general") return true;
  if (type === "skill") return Boolean(isSkill && source && normalize(talent?.system?.linkedSkill) === source);
  if (type === "ability") return Boolean(!isSkill && source && normalize(talent?.system?.linkedAbility) === source);
  return false;
}

function availableByFrequency(talent, contextKey) {
  const frequency = normalize(talent?.system?.frequency || "session");
  if (frequency === "passive") return true;
  if (frequency === "session") return !Boolean(talent?.system?.session?.used);
  if (frequency === "conflict") {
    const key = String(contextKey ?? "").trim();
    return Boolean(key && String(talent?.system?.conflict?.usedId ?? "") !== key);
  }
  return true;
}

export function buildTalentEffectContext(actor, talentId, sourceName, { isSkill = true, contextKey = "" } = {}) {
  const talent = resolveTalent(actor, talentId);
  return Object.freeze({
    actor,
    talent,
    talentId: talent?.id ?? null,
    sourceName: String(sourceName ?? ""),
    isSkill: Boolean(isSkill),
    contextKey: String(contextKey ?? ""),
    tags: Object.freeze(["talent-selected-use"])
  });
}

function sourceFor(context) {
  return {
    actorId: context.actor?.id ?? null,
    talentId: context.talent?.id ?? null,
    talentName: context.talent?.name ?? "Talent",
    documentType: "Item"
  };
}

export const TALENT_SELECTION_EFFECT_PROVIDER = Object.freeze({
  id: TALENT_SELECTION_PROVIDER_ID,
  label: "Talents · Selected Use (shadow)",
  priority: 37,
  collect(context = {}) {
    const talent = context.talent;
    if (!talent || talent.type !== "talent") return [];

    const actorLevel = Math.max(1, Number(context.actor?.system?.progression?.level ?? 1));
    const minLevel = Math.max(2, Number(talent.system?.minLevel ?? 2));
    if (actorLevel < minLevel) return [];
    if (!appliesToSource(talent, context.sourceName, context.isSkill)) return [];
    if (!availableByFrequency(talent, context.contextKey)) return [];

    const frequency = normalize(talent.system?.frequency || "session");
    const manual = normalize(talent.system?.effectMode || "dice") === "manual";
    const diceBonus = manual ? 0 : Math.max(0, Number(talent.system?.diceBonus ?? 0));
    const effects = [];

    if (manual) {
      effects.push({
        id: `talent:${talent.id}:manual`,
        type: EFFECT_TYPES.MANUAL,
        value: Object.freeze({ enabled: true, label: String(talent.name ?? "Talent") }),
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["talent-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.REPLACE,
        metadata: { shadow: true, channel: "talent", frequency }
      });
    } else {
      effects.push({
        id: `talent:${talent.id}:dice`,
        type: EFFECT_TYPES.DICE_MODIFIER,
        value: diceBonus,
        timing: EFFECT_TIMINGS.PRE_ROLL,
        appliesTo: ["talent-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.STACK,
        metadata: { shadow: true, channel: "talent", frequency }
      });
    }

    if (frequency === "session") {
      effects.push({
        id: `talent:${talent.id}:consume-session`,
        type: EFFECT_TYPES.STATE_CHANGE,
        value: Object.freeze({ path: "system.session.used", value: true }),
        timing: EFFECT_TIMINGS.ON_COMMIT,
        appliesTo: ["talent-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.REPLACE,
        metadata: { shadow: true, channel: "talent-consumption", frequency }
      });
    }

    if (frequency === "conflict") {
      effects.push({
        id: `talent:${talent.id}:consume-conflict`,
        type: EFFECT_TYPES.STATE_CHANGE,
        value: Object.freeze({ path: "system.conflict.usedId", value: context.contextKey }),
        timing: EFFECT_TIMINGS.ON_COMMIT,
        appliesTo: ["talent-selected-use"],
        source: sourceFor(context),
        stacking: EFFECT_STACKING.REPLACE,
        metadata: { shadow: true, channel: "talent-consumption", frequency }
      });
    }

    return effects;
  }
});
