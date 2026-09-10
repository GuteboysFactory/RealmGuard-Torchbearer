const norm = value => String(value ?? "").trim().toLowerCase();

export function tokenPowerLevel(token) {
  const raw = Number(token?.system?.level ?? 1);
  return Number.isFinite(raw) ? Math.min(3, Math.max(1, Math.trunc(raw))) : 1;
}

export function tokenPowerUsed(token) {
  return Boolean(token?.system?.session?.used);
}

export function tokenPowerLinkSummary(token) {
  if (!token) return "Unlinked";
  const type = String(token.system?.linkType ?? "skill");
  if (type === "specific") return String(token.system?.linkedUse ?? "").trim() || "Specific use not set";
  return String(token.system?.linkedSkill ?? "").trim() || "Skill not set";
}

export function tokenPowerEffectSummary(token) {
  const level = tokenPowerLevel(token);
  const manual = String(token?.system?.effectMode ?? "level") === "manual";
  if (manual) return "Manual specific effect - use the written effect / table ruling";
  if (level === 1) return "+1D once per session";
  if (level === 2) return "+1D on every appropriate check";
  return "Reroll failed dice once per session";
}

export function tokenPowerApplies(token, sourceName, { isSkill = true } = {}) {
  if (!token || token.type !== "tokenOfPower") return false;
  const linkType = String(token.system?.linkType ?? "skill");
  if (linkType === "specific") return Boolean(String(token.system?.linkedUse ?? "").trim());
  if (!isSkill) return false;
  const linked = norm(token.system?.linkedSkill);
  return Boolean(linked) && linked === norm(sourceName);
}

export function tokenPowerOptionViews(actor, sourceName, { isSkill = true } = {}) {
  const tokens = actor?.items?.filter?.(item => item.type === "tokenOfPower") ?? [];
  return tokens
    .filter(token => tokenPowerApplies(token, sourceName, { isSkill }))
    .map(token => {
      const level = tokenPowerLevel(token);
      const used = tokenPowerUsed(token);
      const oncePerSession = level === 1 || level === 3;
      const linkType = String(token.system?.linkType ?? "skill");
      const manual = String(token.system?.effectMode ?? "level") === "manual";
      return {
        id: token.id,
        name: token.name,
        level,
        used,
        disabled: oncePerSession && used,
        linkType,
        linkSummary: tokenPowerLinkSummary(token),
        effectSummary: tokenPowerEffectSummary(token),
        manual,
        label: `${token.name} · L${level} · ${tokenPowerEffectSummary(token)}${linkType === "specific" ? " · TABLE CHECK" : ""}${oncePerSession && used ? " · USED" : ""}`
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveTokenPowerUse(actor, tokenId, sourceName, { isSkill = true } = {}) {
  if (!tokenId) return null;
  const token = actor?.items?.get?.(tokenId);
  if (!token || token.type !== "tokenOfPower") return null;
  if (!tokenPowerApplies(token, sourceName, { isSkill })) return null;
  const level = tokenPowerLevel(token);
  const used = tokenPowerUsed(token);
  if ((level === 1 || level === 3) && used) return null;
  const manual = String(token.system?.effectMode ?? "level") === "manual";
  return {
    token,
    level,
    manual,
    diceBonus: !manual && (level === 1 || level === 2) ? 1 : 0,
    reroll: !manual && level === 3,
    consumeOnRoll: (manual && (level === 1 || level === 3)) || (!manual && level === 1),
    linkType: String(token.system?.linkType ?? "skill"),
    linkSummary: tokenPowerLinkSummary(token),
    effectSummary: tokenPowerEffectSummary(token)
  };
}

export function tokenPowerChatText(power, { rerolled = false } = {}) {
  if (!power?.token) return "";
  const name = foundry.utils.escapeHTML(power.token.name);
  const effect = foundry.utils.escapeHTML(power.effectSummary);
  const detail = rerolled ? " · reroll used" : power.diceBonus ? ` · +${power.diceBonus}D` : power.manual ? " · manual effect" : "";
  return ` · Token of Power: ${name} (L${power.level}) · ${effect}${detail}`;
}

export async function resetTokenPowerSessionState(actor) {
  if (!actor) return 0;
  const updates = actor.items
    .filter(item => item.type === "tokenOfPower" && Boolean(item.system?.session?.used))
    .map(item => ({ _id: item.id, "system.session.used": false }));
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
  return updates.length;
}
