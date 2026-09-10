import { progressionView } from "./progression.mjs";

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

export const STARTER_TALENTS = Object.freeze([
  { key: "battle-hardened", name: "Battle Hardened", linkedSkill: "Fighter", description: "Hard-earned calm in close combat. Once per session, add +1D to a Fighter test." },
  { key: "pathfinders-eye", name: "Pathfinder's Eye", linkedSkill: "Pathfinder", description: "An instinct for roads, tracks and the shape of the land. Once per session, add +1D to a Pathfinder test." },
  { key: "hunters-patience", name: "Hunter's Patience", linkedSkill: "Hunter", description: "Wait, watch and strike only when the sign is right. Once per session, add +1D to a Hunter test." },
  { key: "healers-touch", name: "Healer's Touch", linkedSkill: "Healer", description: "Steady hands and practiced care. Once per session, add +1D to a Healer test." },
  { key: "rangers-instinct", name: "Ranger's Instinct", linkedSkill: "Scout", description: "Read danger before it fully reveals itself. Once per session, add +1D to a Scout test." },
  { key: "road-hardened", name: "Road-Hardened", linkedSkill: "Survivalist", description: "Long years beneath rain, wind and stars. Once per session, add +1D to a Survivalist test." },
  { key: "weatherwise", name: "Weatherwise", linkedSkill: "Weather Watcher", description: "Cloud, wind and cold speak clearly to you. Once per session, add +1D to a Weather Watcher test." },
  { key: "lore-keeper", name: "Lore Keeper", linkedSkill: "Lore Master", description: "Fragments of the old world have a way of staying with you. Once per session, add +1D to a Lore Master test." },
  { key: "voice-of-the-north", name: "Voice of the North", linkedSkill: "Orator", description: "Your words carry the weight of service and old lineage. Once per session, add +1D to an Orator test." },
  { key: "silver-tongue", name: "Silver Tongue", linkedSkill: "Persuader", description: "You know when to press, when to soften and when to stay silent. Once per session, add +1D to a Persuader test." },
  { key: "beast-friend", name: "Beast Friend", linkedSkill: "Animal Handler", description: "Animals more readily accept your voice and hand. Once per session, add +1D to an Animal Handler test." },
  { key: "teacher-of-the-guard", name: "Teacher of the Guard", linkedSkill: "Instructor", description: "You can turn hard experience into a lesson another Ranger can use. Once per session, add +1D to an Instructor test." }
].map(t => Object.freeze({
  ...t,
  minLevel: 2,
  frequency: "session",
  linkType: "skill",
  linkedAbility: "",
  effectMode: "dice",
  diceBonus: 1
})));

export function talentEffectSummary(talent) {
  const frequency = String(talent?.system?.frequency ?? "session");
  const mode = String(talent?.system?.effectMode ?? "dice");
  const bonus = Math.max(0, Number(talent?.system?.diceBonus ?? 0));
  if (mode === "manual") return `${frequency === "session" ? "Once/session · " : frequency === "conflict" ? "Once/conflict · " : ""}Manual effect`;
  const freq = frequency === "passive" ? "Passive" : frequency === "conflict" ? "Once/conflict" : "Once/session";
  return `${freq} · +${bonus}D`;
}

export function talentLinkSummary(talent) {
  const type = String(talent?.system?.linkType ?? "skill");
  if (type === "ability") return String(talent?.system?.linkedAbility ?? "Ability") || "Ability";
  if (type === "general") return "General / table-approved";
  return String(talent?.system?.linkedSkill ?? "Skill") || "Skill";
}

export function talentStateLabel(talent) {
  const frequency = String(talent?.system?.frequency ?? "session");
  if (frequency === "passive") return "PASSIVE";
  if (frequency === "conflict") return "PER CONFLICT";
  return Boolean(talent?.system?.session?.used) ? "USED" : "READY";
}

function linkApplies(talent, sourceName, { isSkill = true } = {}) {
  const linkType = String(talent?.system?.linkType ?? "skill");
  const source = String(sourceName ?? "").trim().toLowerCase();
  if (linkType === "general") return true;
  if (linkType === "skill") return isSkill && source === String(talent?.system?.linkedSkill ?? "").trim().toLowerCase();
  if (linkType === "ability") return !isSkill && source === String(talent?.system?.linkedAbility ?? "").trim().toLowerCase();
  return false;
}

export function resolveTalentUse(actor, talentId, sourceName, { isSkill = true, contextKey = "" } = {}) {
  if (!talentId) return null;
  const talent = actor?.items?.get?.(talentId);
  if (!talent || talent.type !== "talent") return null;
  const level = Number(actor?.system?.progression?.level ?? 1);
  if (level < Math.max(2, Number(talent.system?.minLevel ?? 2))) return null;
  if (!linkApplies(talent, sourceName, { isSkill })) return null;
  const frequency = String(talent.system?.frequency ?? "session");
  if (frequency === "session" && Boolean(talent.system?.session?.used)) return null;
  if (frequency === "conflict") {
    if (!contextKey) return null;
    if (String(talent.system?.conflict?.usedId ?? "") === String(contextKey)) return null;
  }
  const manual = String(talent.system?.effectMode ?? "dice") === "manual";
  return {
    talent,
    frequency,
    manual,
    diceBonus: manual ? 0 : Math.max(0, Number(talent.system?.diceBonus ?? 0)),
    contextKey: String(contextKey ?? ""),
    linkSummary: talentLinkSummary(talent),
    effectSummary: talentEffectSummary(talent)
  };
}

export function talentOptionViews(actor, sourceName, { isSkill = true, contextKey = "" } = {}) {
  const level = Number(actor?.system?.progression?.level ?? 1);
  return (actor?.items?.filter?.(item => item.type === "talent") ?? [])
    .filter(talent => level >= Math.max(2, Number(talent.system?.minLevel ?? 2)) && linkApplies(talent, sourceName, { isSkill }))
    .map(talent => {
      const frequency = String(talent.system?.frequency ?? "session");
      let disabled = false;
      if (frequency === "session") disabled = Boolean(talent.system?.session?.used);
      const conflictUsed = frequency === "conflict" && Boolean(contextKey) && String(talent.system?.conflict?.usedId ?? "") === String(contextKey);
      if (frequency === "conflict") disabled = !contextKey || conflictUsed;
      const state = frequency === "passive" ? "PASSIVE" : frequency === "conflict" ? (!contextKey ? "CONFLICT ONLY" : conflictUsed ? "USED THIS CONFLICT" : "READY") : (disabled ? "USED" : "READY");
      return {
        id: talent.id,
        name: talent.name,
        disabled,
        label: `${talent.name} · ${talentEffectSummary(talent)} · ${state}`,
        manual: String(talent.system?.effectMode ?? "dice") === "manual"
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function commitTalentUse(use) {
  if (!use?.talent) return false;
  if (use.frequency === "session") {
    if (Boolean(use.talent.system?.session?.used)) return false;
    await use.talent.update({ "system.session.used": true });
    return true;
  }
  if (use.frequency === "conflict") {
    if (!use.contextKey) return false;
    if (String(use.talent.system?.conflict?.usedId ?? "") === use.contextKey) return false;
    await use.talent.update({ "system.conflict.usedId": use.contextKey });
    return true;
  }
  return true;
}

export async function postTalentUseChat(actor, use, { label = "Test" } = {}) {
  if (!actor || !use?.talent) return;
  const effect = use.manual ? "Manual / table effect invoked" : `+${use.diceBonus}D`;
  const content = `<div class="realm-guard rg-talent-chat"><h3><i class="fa-solid fa-sparkles"></i> Talent · ${esc(use.talent.name)}</h3><p><b>${esc(label)}</b> · ${esc(effect)} · ${esc(talentStateLabel(use.talent))}</p></div>`;
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
}

export async function resetTalentSessionState(actor) {
  let reset = 0;
  for (const talent of actor?.items?.filter?.(item => item.type === "talent") ?? []) {
    const update = {};
    if (Boolean(talent.system?.session?.used)) update["system.session.used"] = false;
    if (String(talent.system?.conflict?.usedId ?? "")) update["system.conflict.usedId"] = "";
    if (Object.keys(update).length) { await talent.update(update); reset += 1; }
  }
  return reset;
}

export async function chooseTalentForActor(actor) {
  if (!actor || actor.type !== "character") return ui.notifications.warn("Realm Guard: Talents belong to Rangers.");
  if (!game.user?.isGM && !actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return ui.notifications.warn("Realm Guard: Only the Ranger owner or GM can choose this Ranger's Talent.");
  const progression = progressionView(actor);
  if (progression.pendingTalents < 1) return ui.notifications.info("Realm Guard: This Ranger has no unclaimed Talent choices.");
  const ownedKeys = new Set((actor.items.filter(i => i.type === "talent")).map(i => String(i.system?.sourceKey ?? "")).filter(Boolean));
  const ownedNames = new Set((actor.items.filter(i => i.type === "talent")).map(i => String(i.name ?? "").toLowerCase()));
  const available = STARTER_TALENTS.filter(t => Number(t.minLevel ?? 2) <= progression.level && !ownedKeys.has(t.key) && !ownedNames.has(t.name.toLowerCase()));
  if (!available.length) return ui.notifications.warn("Realm Guard: No built-in Talent choices remain. The GM can create a custom Talent.");
  const cards = available.map((talent, index) => `<label class="rg-talent-choice-card"><input type="radio" name="talentKey" value="${esc(talent.key)}" ${index === 0 ? "checked" : ""}><span><b>${esc(talent.name)}</b><small>${esc(talent.linkedSkill)} · +${talent.diceBonus}D once/session</small><em>${esc(talent.description)}</em></span></label>`).join("");
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Choose Talent · Level ${progression.level}`, resizable: true },
    content: `<div class="rg-talent-browser"><header><h2>Choose a Talent</h2><p>Level ${progression.level} grants one permanent Talent choice. Choices cannot be changed by the player after selection.</p><p><small>This is the Realm Guard Foundry progression expansion inspired by Torchbearer's spent Fate/Persona advancement.</small></p></header><div class="rg-talent-browser-list">${cards}</div></div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "choose", label: "Choose Talent", icon: "fa-solid fa-sparkles", default: true, callback: (_event, button) => button.form?.elements?.talentKey?.value || null },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (!result) return null;
  const talent = available.find(t => t.key === result);
  if (!talent) return null;
  const [created] = await actor.createEmbeddedDocuments("Item", [{ name: talent.name, type: "talent", system: {
    sourceKey: talent.key,
    minLevel: talent.minLevel,
    frequency: talent.frequency,
    linkType: talent.linkType,
    linkedSkill: talent.linkedSkill,
    linkedAbility: talent.linkedAbility,
    effectMode: talent.effectMode,
    diceBonus: talent.diceBonus,
    description: talent.description,
    session: { used: false },
    conflict: { usedId: "" }
  }}]);
  if (created) {
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="realm-guard rg-talent-chat"><h3><i class="fa-solid fa-sparkles"></i> ${esc(actor.name)} learns ${esc(created.name)}</h3><p>${esc(talent.description)}</p></div>` });
    ui.notifications.info(`Realm Guard: ${actor.name} chose Talent — ${created.name}.`);
  }
  return created ?? null;
}
