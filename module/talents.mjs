import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { progressionView } from "./progression.mjs";
import { LEGACY_TALENTS, LEGACY_TALENT_LEVEL_NOTES } from "./legacy-talent-catalog.mjs";

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
  if (legacyMixedPolishEnabled() && mode === "reroll") return `${frequency === "conflict" ? "Once/conflict" : frequency === "passive" ? "Passive" : "Once/session"} · reroll failed dice`;
  if (mode === "manual") return `${frequency === "session" ? "Once/session · " : frequency === "conflict" ? "Once/conflict · " : ""}Manual effect`;
  const freq = frequency === "passive" ? "Passive" : frequency === "conflict" ? "Once/conflict" : "Once/session";
  return `${freq} · +${bonus}D`;
}

export function talentCatalogForProfile() {
  return legacyMixedPolishEnabled() ? LEGACY_TALENTS : STARTER_TALENTS;
}

export function talentChoicesForActor(actor) {
  const progression = progressionView(actor), owned = actor.items.filter(i => i.type === 'talent');
  const keys = new Set(owned.map(i => i.system?.sourceKey)), names = new Set(owned.map(i => i.name.toLowerCase()));
  const occupied = new Set();
  // Existing custom/starter choices keep their slot; repeated minimum levels use
  // the next open slot rather than making an existing character lose choices.
  for (const item of [...owned].sort((a,b) => Number(a.system?.minLevel ?? 2)-Number(b.system?.minLevel ?? 2))) {
    let slot = Math.max(2, Number(item.system?.minLevel ?? 2));
    while (occupied.has(slot)) slot++;
    occupied.add(slot);
  }
  return talentCatalogForProfile().filter(t => t.minLevel <= progression.level && !keys.has(t.key) && !names.has(t.name.toLowerCase()) && (!legacyMixedPolishEnabled() || !occupied.has(t.minLevel)));
}

export function talentCatalogDescription(talent) {
  if (!talent.source) return talent.description;
  const source = talent.source;
  return `${talent.description}\n\n${source.nameVerified && !talent.previousNames?.length ? `Title: Dungeoneer’s Handbook, p. ${source.page} (${source.class}). Effects: supplied Realm Guard adaptation.` : 'Name and effects: user-approved Realm Guard / Fire Talent.'}\nTable effect: apply the described rules with the GM.`;
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
  const reroll = legacyMixedPolishEnabled() && String(talent.system?.effectMode ?? "dice") === "reroll";
  return {
    talent,
    ...(legacyMixedPolishEnabled() ? { sourceName, isSkill, reroll } : {}),
    frequency,
    manual,
    diceBonus: manual || reroll ? 0 : Math.max(0, Number(talent.system?.diceBonus ?? 0)),
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

export async function applyTalentReroll(actor, baseFaces, use, { chatDecision = null, excludedIndexes = [] } = {}) {
  const unchanged = () => ({ faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [] });
  if (!legacyMixedPolishEnabled() || !use?.reroll || !use.talent || !chatDecision) return unchanged();
  const eligible = baseFaces.map((face, index) => face < 4 && !excludedIndexes.includes(index) ? index : -1).filter(index => index >= 0);
  if (!eligible.length) return unchanged();
  if (!await chatDecision.ask(`Use ${use.talent.name} to reroll failed dice?`, [{ label: "Use Talent reroll", value: true }], { skip: false })) return unchanged();
  const current = resolveTalentUse(actor, use.talent.id, use.sourceName, { isSkill: use.isSkill, contextKey: use.contextKey });
  if (!current?.reroll) throw new Error("This Talent is no longer available for this roll.");
  const roll = await new Roll(`${eligible.length}d6`).evaluate();
  const rerollFaces = roll.dice.flatMap(die => die.results.map(result => result.result));
  if (!await commitTalentUse(current)) throw new Error("The Talent use could not be committed.");
  const faces = [...baseFaces]; eligible.forEach((index, n) => { faces[index] = rerollFaces[n]; });
  return { faces, rerollFaces, rerolledIndexes: eligible };
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
  const available = talentChoicesForActor(actor);
  if (!available.length) return ui.notifications.warn("Realm Guard: No built-in Talent choices remain. The GM can create a custom Talent.");
  const legacy = legacyMixedPolishEnabled();
  const cards = available.map((talent, index) => `<label class="rg-talent-choice-card" data-talent-level="${talent.minLevel}"><input type="radio" name="talentKey" value="${esc(talent.key)}" ${index === 0 ? "checked" : ""}><span><b>${esc(talent.name)}</b><small>${legacy ? `Level ${talent.minLevel} · ${esc(talentEffectSummary({system:talent}))}${talent.source?.page ? ` · Handbook p. ${talent.source.page}` : ' · Realm Guard / Fire'}` : `${esc(talent.linkedSkill)} · +${talent.diceBonus}D once/session`}</small><em>${esc(talent.description)}</em></span></label>`).join("");
  const levels = [...new Set(available.map(t => t.minLevel))].sort((a,b)=>a-b);
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Choose Talent · Level ${progression.level}`, resizable: true },
    content: `<div class="rg-talent-browser"><header><h2>Choose a Talent</h2><p>Level ${progression.level} grants one permanent Talent choice. Choices cannot be changed by the player after selection.</p>${legacy ? '<p><small>Realm Guard Talents. Apply table effects with the GM.</small></p>' : '<p><small>This is the Realm Guard Foundry progression expansion inspired by Torchbearer\'s spent Fate/Persona advancement.</small></p>'}</header>${legacy ? `<div class="rg-talent-filters"><label>Search<input type="search" data-talent-search placeholder="Name or effect…"></label><label>Level<select data-talent-level-filter>${levels.map(level=>`<option value="${level}">Level ${level}</option>`).join('')}<option value="">All available levels</option></select></label></div><p data-talent-count></p>` : ''}<div class="rg-talent-browser-list">${cards}</div></div>`,
    position: legacy ? {width:640} : undefined,
    render: legacy ? (_event,dialog) => {
      const root=dialog.element, search=root.querySelector('[data-talent-search]'), select=root.querySelector('[data-talent-level-filter]');
      const levelNote=document.createElement('p');levelNote.dataset.talentLevelNote='';select.closest('.rg-talent-filters').after(levelNote);
      const note=()=>{levelNote.textContent=LEGACY_TALENT_LEVEL_NOTES[select.value]??'';};select.addEventListener('change',note);note();
      const filter=()=>{let count=0;for(const card of root.querySelectorAll('.rg-talent-choice-card')){card.hidden=Boolean(select.value && card.dataset.talentLevel!==select.value)||!card.textContent.toLowerCase().includes(search.value.trim().toLowerCase());if(!card.hidden)count++;}const selected=root.querySelector('[name="talentKey"]:checked');if(!selected||selected.closest('label').hidden){if(selected)selected.checked=false;const first=[...root.querySelectorAll('.rg-talent-choice-card')].find(c=>!c.hidden);if(first)first.querySelector('input').checked=true;}root.querySelector('[data-talent-count]').textContent=`${count} choices`;};
      search.addEventListener('input',filter);select.addEventListener('change',filter);filter();
    } : undefined,
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
  if (legacy && !talentChoicesForActor(actor).some(t=>t.key===talent.key)) return ui.notifications.warn('This Talent choice is no longer available. Reopen the Talent browser.');
  const [created] = await actor.createEmbeddedDocuments("Item", [{ name: talent.name, type: "talent", ...(talent.source ? {flags:{'realm-guard':{talentSource:talent.source}}} : {}), system: {
    sourceKey: talent.key,
    minLevel: talent.minLevel,
    frequency: talent.frequency,
    linkType: talent.linkType,
    linkedSkill: talent.linkedSkill,
    linkedAbility: talent.linkedAbility,
    effectMode: talent.effectMode,
    diceBonus: talent.diceBonus,
    description: talentCatalogDescription(talent),
    session: { used: false },
    conflict: { usedId: "" }
  }}]);
  if (created) {
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="realm-guard rg-talent-chat"><h3><i class="fa-solid fa-sparkles"></i> ${esc(actor.name)} learns ${esc(created.name)}</h3><p>${esc(talent.description)}</p></div>` });
    ui.notifications.info(`Realm Guard: ${actor.name} chose Talent — ${created.name}.`);
  }
  return created ?? null;
}
