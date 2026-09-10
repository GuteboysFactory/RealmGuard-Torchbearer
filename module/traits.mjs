const NS = "realm-guard";
const USE_FLAG = "traitSessionUses";

export function traitLevel(trait) {
  return Math.max(0, Math.min(3, Number(trait?.system?.rating ?? 0)));
}

export function traitPositiveLimit(trait) {
  const level = traitLevel(trait);
  if (level === 1) return 1;
  if (level === 2) return 2;
  return null;
}

export function traitPositiveUsed(actor, trait) {
  if (!actor || !trait) return 0;
  const uses = actor.getFlag?.(NS, USE_FLAG) ?? {};
  return Math.max(0, Number(uses?.[trait.id] ?? 0));
}

export function traitPositiveRemaining(actor, trait) {
  const limit = traitPositiveLimit(trait);
  if (limit === null) return null;
  return Math.max(0, limit - traitPositiveUsed(actor, trait));
}

export function traitPositiveAvailable(actor, trait) {
  const level = traitLevel(trait);
  if (level === 3) return true;
  const remaining = traitPositiveRemaining(actor, trait);
  return level > 0 && Number(remaining ?? 0) > 0;
}

export function traitPositiveDice(actor, trait) {
  const level = traitLevel(trait);
  if ((level === 1 || level === 2) && traitPositiveAvailable(actor, trait)) return 1;
  return 0;
}

export function traitPositiveSuccessBonus(actor, trait, { baseSuccesses = 0, target = 0, versus = false } = {}) {
  if (traitLevel(trait) !== 3) return 0;
  const own = Number(baseSuccesses ?? 0);
  const opposition = Number(target ?? 0);
  // MG2E +1s is added after a passed/tied roll. It can break a Versus tie,
  // but it does not turn a failed independent test into a pass.
  return versus ? (own >= opposition ? 1 : 0) : (own >= opposition ? 1 : 0);
}

export function traitPositiveStatus(actor, trait) {
  const level = traitLevel(trait);
  if (level === 1 || level === 2) {
    const limit = traitPositiveLimit(trait);
    const used = Math.min(limit, traitPositiveUsed(actor, trait));
    const remaining = Math.max(0, limit - used);
    return {
      level,
      limit,
      used,
      remaining,
      available: remaining > 0,
      label: remaining > 0 ? `${remaining}/${limit} beneficial use${limit === 1 ? "" : "s"} left` : "beneficial use spent this session",
      effect: "+1D"
    };
  }
  if (level === 3) {
    return { level, limit: null, used: 0, remaining: null, available: true, label: "+1s on relevant passed/tied tests", effect: "+1s" };
  }
  return { level, limit: 0, used: 0, remaining: 0, available: false, label: "no beneficial effect", effect: "—" };
}

export async function consumeTraitPositiveUse(actor, trait) {
  if (!actor || !trait) return { consumed: false, reason: "missing" };
  const level = traitLevel(trait);
  if (level === 3) return { consumed: false, unlimited: true, level };
  const limit = traitPositiveLimit(trait);
  if (!limit) return { consumed: false, reason: "no-effect", level };
  const used = traitPositiveUsed(actor, trait);
  if (used >= limit) return { consumed: false, exhausted: true, used, limit, level };
  const next = Math.min(limit, used + 1);
  await actor.setFlag(NS, USE_FLAG, { ...(actor.getFlag(NS, USE_FLAG) ?? {}), [trait.id]: next });
  return { consumed: true, used: next, limit, remaining: Math.max(0, limit - next), level };
}

export async function resetTraitSessionUses(actor) {
  if (!actor) return 0;
  const uses = actor.getFlag?.(NS, USE_FLAG) ?? {};
  const count = Object.values(uses).reduce((n, value) => n + Math.max(0, Number(value ?? 0)), 0);
  if (Object.keys(uses).length) await actor.unsetFlag(NS, USE_FLAG);
  return count;
}
