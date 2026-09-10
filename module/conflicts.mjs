import { diceFacesHtml } from "./dice-ui.mjs";
import { registerGmDockTool } from "./gm-dock.mjs";
import { tokenPowerOptionViews } from "./tokens-of-power.mjs";
import { talentOptionViews, resolveTalentUse, commitTalentUse, talentEffectSummary } from "./talents.mjs";
import { recordAbilityTest, recordHelperSkillTest } from "./advancement.mjs";
import { traitPositiveStatus } from "./traits.mjs";

const SYSTEM_ID = "realm-guard";
const PUBLIC_SETTING = "conflictState";
const PRIVATE_SETTING = "conflictPrivateState";
const SOCKET_CHANNEL = "system.realm-guard";
const WINDOW_ID = "rg-conflict-window";
const ACTIONS = ["attack", "defend", "feint", "maneuver"];
const ACTION_LABELS = { attack: "Attack", defend: "Defend", feint: "Feint", maneuver: "Maneuver" };
const ACTION_ICONS = {
  attack: "fa-solid fa-khanda",
  defend: "fa-solid fa-shield-halved",
  feint: "fa-solid fa-masks-theater",
  maneuver: "fa-solid fa-route"
};

const ACTION_GUIDE = {
  attack: {
    summary: "Direct pressure against the opponent's goal.",
    good: "Best for reducing enemy Disposition.",
    drawback: "Defend and Maneuver can oppose it."
  },
  defend: {
    summary: "Protect your position and recover lost ground.",
    good: "Best for preserving or restoring Disposition.",
    drawback: "Feint bypasses Defend."
  },
  feint: {
    summary: "Trick or misdirect the opposition.",
    good: "Best for exploiting an opponent who Defends.",
    drawback: "Attack trumps Feint."
  },
  maneuver: {
    summary: "Create a tactical opening instead of pressing directly.",
    good: "Best for Impede, Gain Position or Disarm effects.",
    drawback: "Often contests Attack or Defend before it pays off."
  }
};

function actionHoverHelp(action) {
  const guide = ACTION_GUIDE[action];
  if (!guide) return actionLabel(action);
  return `${actionLabel(action)} — ${guide.summary} ${guide.good} ${guide.drawback}`;
}

export const CONFLICT_TYPES = {
  argument: { label: "Argument", disposition: { skills: ["Persuader"], base: "will" } },
  chase: { label: "Chase", disposition: { skills: ["Scout"], base: "health" } },
  fight: { label: "Fight", disposition: { skills: ["Fighter"], base: "health" } },
  fightCreature: { label: "Fight Creature", disposition: { skills: ["Hunter"], base: "health" } },
  journey: { label: "Journey", disposition: { skills: ["Pathfinder"], base: "health" } },
  negotiation: { label: "Negotiation", disposition: { skills: ["Haggler"], base: "will" } },
  speech: { label: "Speech", disposition: { skills: ["Orator"], base: "will" } },
  war: { label: "War", disposition: { skills: ["Militarist", "Lore Master"], base: "will" } },
  other: { label: "Other", disposition: { skills: [], base: "health" } }
};

// Realm Guard v1.6 takes precedence. Journey/War entries explicitly inherit the
// Mouse Guard descriptions for the cells where Realm Guard says "See MG".
export const CONFLICT_ACTION_SKILLS = {
  argument: {
    attack: ["Persuader"], defend: ["Persuader"],
    feint: ["Persuader", "Deceiver"], maneuver: ["Persuader", "Deceiver"]
  },
  chase: { attack: ["Scout"], defend: ["Pathfinder"], feint: ["Pathfinder"], maneuver: ["Scout"] },
  fight: { attack: ["Fighter"], defend: ["Fighter"], feint: ["Fighter"], maneuver: ["Fighter"] },
  fightCreature: {
    attack: ["Hunter", "Fighter"], defend: ["Hunter", "Animal Handler"],
    feint: ["Hunter"], maneuver: ["Animal Handler", "Lore Master"]
  },
  negotiation: { attack: ["Haggler"], defend: ["Haggler"], feint: ["Deceiver"], maneuver: ["Deceiver"] },
  journey: {
    attack: ["Pathfinder"], defend: ["Survivalist", "Weather Watcher"],
    feint: ["Pathfinder"], maneuver: ["Survivalist", "Weather Watcher"]
  },
  speech: { attack: ["Orator"], defend: ["Orator"], feint: ["Orator", "Deceiver"], maneuver: ["Orator", "Deceiver"] },
  war: {
    attack: ["Militarist", "Lore Master"], defend: ["Militarist", "Orator", "Administrator"],
    feint: ["Militarist", "Administrator"], maneuver: ["Militarist", "Lore Master"]
  },
  other: { attack: ["*"], defend: ["*"], feint: ["*"], maneuver: ["*"] }
};

export const ACTION_INTERACTION = {
  attack: { attack: "independent", defend: "versus", feint: "independent", maneuver: "versus" },
  defend: { attack: "versus", defend: "independent", feint: "trumped", maneuver: "versus" },
  feint: { attack: "trumped", defend: "independent", feint: "versus", maneuver: "independent" },
  maneuver: { attack: "versus", defend: "versus", feint: "independent", maneuver: "independent" }
};

const draftPlans = new Map();
const weaponDrafts = new Map();
const lockedPlanCache = new Map();
const CONFLICT_WEAPON_NAMES = new Set(["axe", "bow", "halberd", "whip", "hook and line", "knife", "shield", "sling", "spear", "staff", "sword"]);
const PHYSICAL_BEGINNER_SKILLS = new Set(["armorer","animal handler","boatcrafter","brewer","carpenter","fighter","glazier","harvester","hunter","laborer","miller","potter","rider","scout","smith","stonemason","survivalist"]);
const MENTAL_BEGINNER_SKILLS = new Set(["administrator","alchemist","apiarist","archivist","baker","cartographer","cook","deceiver","haggler","healer","herdsman","instructor","lore master","militarist","orator","pathfinder","persuader","scientist","weather watcher","weaver"]);
let dismissedConflictId = null;
let dragOffset = null;

function esc(value) { return foundry.utils.escapeHTML(String(value ?? "")); }
function clone(value) { return foundry.utils.deepClone(value); }
function actionLabel(action) { return ACTION_LABELS[action] ?? action; }
function actorById(id) { return id ? game.actors.get(id) : null; }
function currentState() {
  try {
    const raw = game.settings.get(SYSTEM_ID, PUBLIC_SETTING);
    return raw ? JSON.parse(raw) : null;
  } catch (_err) { return null; }
}
function privateState() {
  try {
    const raw = game.settings.get(SYSTEM_ID, PRIVATE_SETTING);
    return raw ? JSON.parse(raw) : {};
  } catch (_err) { return {}; }
}
async function setPrivateState(value) {
  await game.settings.set(SYSTEM_ID, PRIVATE_SETTING, JSON.stringify(value ?? {}));
}
async function setPublicState(value) {
  if (!game.user?.isGM) throw new Error("Realm Guard: only the GM may write Conflict state.");
  await game.settings.set(SYSTEM_ID, PUBLIC_SETTING, value ? JSON.stringify(value) : "");
}
function isActive(state) { return Boolean(state?.active && state?.id); }
function isParticipantOwner(state) {
  if (!state || game.user?.isGM) return Boolean(game.user?.isGM);
  return (state.ranger?.participantIds ?? []).some(id => actorById(id)?.isOwner);
}
function canCaptainControl(state) {
  if (game.user?.isGM) return true;
  return Boolean(actorById(state?.ranger?.captainId)?.isOwner);
}
function canSideRoll(state, side) {
  if (side === "gm") return Boolean(game.user?.isGM);
  const pair = state?.revealed?.find(r => Number(r.index) === Number(state.currentIndex));
  const actor = actorById(pair?.rangerActorId);
  return Boolean(game.user?.isGM || actor?.isOwner);
}
function stageLabel(stage) {
  return ({
    goals: "Goals & Stakes", disposition: "Starting Disposition", gmPlan: "GM Planning", rangerPlan: "Ranger Planning",
    ready: "Actions Locked", action: "Resolve Action", maneuver: "Maneuver Choice",
    compromise: "Compromise", complete: "Complete"
  })[stage] ?? String(stage ?? "Conflict");
}
function conflictTypeLabel(type) { return CONFLICT_TYPES[type]?.label ?? type; }
function conditionActive(actor, name) {
  const n = String(name).trim().toLowerCase();
  return actor?.items?.some(i => i.type === "condition" && i.system.active && String(i.name).trim().toLowerCase() === n);
}
function findRole(actor, names = []) {
  const wanted = names.map(n => String(n).toLowerCase());
  return actor?.items?.filter(i => i.type === "role" && wanted.includes(String(i.name).toLowerCase()))
    .sort((a, b) => Number(b.system.rating ?? 0) - Number(a.system.rating ?? 0))[0] ?? null;
}
function allTrainedRoles(actor) {
  return actor?.items?.filter(i => i.type === "role" && Number(i.system.rating ?? 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name)) ?? [];
}

function dedupeRoleChoices(choices = []) {
  const byName = new Map();
  for (const choice of choices) {
    const key = String(choice?.name ?? "").trim().toLowerCase();
    if (!key) continue;
    const current = byName.get(key);
    if (!current || Number(choice.rating ?? 0) > Number(current.rating ?? 0)) byName.set(key, choice);
  }
  return [...byName.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
function beginnerAbilityKey(actor, source, fallback = "will") {
  const item = source?.id && source.id !== "@nature" ? actor?.items?.get?.(source.id) : null;
  const stored = String(item?.system?.beginnerAbility ?? source?.beginnerAbility ?? "").toLowerCase();
  if (["will", "health"].includes(stored)) return stored;
  const name = String(source?.name ?? item?.name ?? "").trim().toLowerCase();
  if (PHYSICAL_BEGINNER_SKILLS.has(name)) return "health";
  if (MENTAL_BEGINNER_SKILLS.has(name)) return "will";
  return ["will", "health"].includes(String(fallback).toLowerCase()) ? String(fallback).toLowerCase() : "will";
}
function activeDispositionPenaltyNames(actors = [], baseKey = "health") {
  const penalties = new Set();
  for (const actor of actors.filter(Boolean)) {
    if (conditionActive(actor, "Tired")) penalties.add("Tired");
    if (conditionActive(actor, "Hungry & Thirsty")) penalties.add("Hungry & Thirsty");
    if (String(baseKey) === "will" && conditionActive(actor, "Angry")) penalties.add("Angry");
  }
  return [...penalties];
}
function dispositionPenaltyForSide(state, side, baseKey) {
  const actors = side === "ranger"
    ? (state.ranger?.participantIds ?? []).map(actorById)
    : [actorById(state.gm?.actorId)];
  const names = activeDispositionPenaltyNames(actors, baseKey);
  return { value: names.length, names };
}
function equippedGear(actor) {
  return actor?.items?.filter(i => i.type === "gear" && ["hand", "worn", "belt", "pocket", "slot"].includes(String(i.system.inventory?.mode ?? ""))) ?? [];
}
function normalizedGearName(item) { return String(item?.name ?? "").trim().toLowerCase(); }
function heldConflictWeapons(actor, state, side) {
  const disabled = new Set(state?.effects?.[side]?.disabledGearIds ?? []);
  return actor?.items?.filter(i => i.type === "gear" && String(i.system.inventory?.mode ?? "") === "hand" && !disabled.has(i.id) && CONFLICT_WEAPON_NAMES.has(normalizedGearName(i))) ?? [];
}
function savedConflictTools(actor, state) {
  const raw = actor?.getFlag?.(SYSTEM_ID, "conflictTools");
  return (Array.isArray(raw) ? raw : []).filter(tool => {
    if (!tool || !tool.id || !tool.name) return false;
    if (tool.temporaryConflictId && tool.temporaryConflictId !== state?.id) return false;
    const types = Array.isArray(tool.conflictTypes) ? tool.conflictTypes : [tool.conflictType || "*"];
    return types.includes("*") || types.includes(state?.type);
  });
}
function availableConflictWeapons(actor, state, side) {
  const tools = savedConflictTools(actor, state).map(tool => ({ id: `tool:${tool.id}`, name: tool.name, kind: "tool", tool }));
  // Physical held weapons belong to Fight-style conflicts only. Other conflicts use
  // their own Conflict Weapons/Tools (saved or improvised) instead of leaking swords into every list.
  const gear = ["fight", "fightCreature"].includes(state?.type)
    ? heldConflictWeapons(actor, state, side).map(item => ({ id: `gear:${item.id}`, name: item.name, kind: "gear", item }))
    : [];
  return [...tools, ...gear].sort((a,b) => a.name.localeCompare(b.name));
}
function selectedConflictWeapon(actor, state, side, explicitWeaponId = null) {
  const weapons = availableConflictWeapons(actor, state, side);
  const explicit = explicitWeaponId !== null && explicitWeaponId !== undefined;
  const selectedId = explicit ? String(explicitWeaponId || "") : String(state?.weaponIds?.[actor?.id] ?? "");
  return weapons.find(i => i.id === selectedId) ?? (!explicit && weapons.length === 1 ? weapons[0] : null);
}
function weaponDraftFor(actor, state, side) {
  const all = weaponDrafts.get(state.id) ?? {};
  const weapons = availableConflictWeapons(actor, state, side);
  const requested = all[actor.id] ?? state?.weaponIds?.[actor?.id] ?? "";
  if (weapons.some(w => w.id === requested)) return requested;
  return weapons.length === 1 ? weapons[0].id : "";
}
function setWeaponDraft(state, actorId, weaponId) {
  const all = { ...(weaponDrafts.get(state.id) ?? {}) };
  all[actorId] = weaponId || "";
  weaponDrafts.set(state.id, all);
}
function validateWeaponId(actor, state, side, weaponId) {
  if (!weaponId) return "";
  return availableConflictWeapons(actor, state, side).some(w => w.id === weaponId) ? weaponId : "";
}
async function saveConflictTool(actor, tool) {
  const current = actor?.getFlag?.(SYSTEM_ID, "conflictTools");
  const tools = Array.isArray(current) ? clone(current) : [];
  const idx = tools.findIndex(existing => existing.id === tool.id);
  if (idx >= 0) tools[idx] = tool; else tools.push(tool);
  await actor.setFlag(SYSTEM_ID, "conflictTools", tools);
  return tool;
}
async function cleanupTemporaryConflictTools(state) {
  if (!game.user?.isGM || !state?.id) return;
  const ids = [...new Set([state.gm?.actorId, ...(state.ranger?.participantIds ?? [])].filter(Boolean))];
  for (const id of ids) {
    const actor = actorById(id); if (!actor) continue;
    const current = actor.getFlag?.(SYSTEM_ID, "conflictTools");
    if (!Array.isArray(current)) continue;
    const kept = current.filter(tool => tool?.temporaryConflictId !== state.id);
    if (kept.length !== current.length) await actor.setFlag(SYSTEM_ID, "conflictTools", kept);
  }
}
async function openCustomConflictTool(actor, state, side) {
  if (!actor || (!actor.isOwner && !game.user?.isGM)) return ui.notifications.warn("Realm Guard: You may only create Conflict Weapons/Tools on Actors you own.");
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Custom Conflict Weapon / Tool · ${actor.name}`, resizable: true }, modal: false, rejectClose: false,
    content: `<div class="rg-conflict-tool-editor"><h3>Custom Conflict Weapon / Tool</h3><p>Create an improvised tool for this conflict, or save it permanently on the Actor.</p><label>Name <input name="name" placeholder="Evidence, Piercing Evil Gaze, Superior Position…"></label><label>Applies to action <select name="action"><option value="any">Any action</option>${ACTIONS.map(action => `<option value="${action}">${actionLabel(action)}</option>`).join("")}</select></label><label>Effect <select name="effect"><option value="dice">Dice modifier (+D / −D)</option><option value="success">Success modifier (+s / −s)</option><option value="none">Special / text only</option></select></label><label>Value <input type="number" name="value" min="-6" max="6" value="1"></label><label>Requirement <input name="requirement" placeholder="You must have evidence / proper equipment / roleplay…"></label><label>Special <textarea name="special" rows="3" placeholder="Optional precedence, expend-on-use or other table note"></textarea></label><label class="rg-conflict-inline-choice"><input type="checkbox" name="permanent"> Save permanently on ${esc(actor.name)}</label><small>Temporary tools are automatically removed when this Conflict ends or is aborted.</small></div>`,
    buttons: [{ action: "save", label: "Create Tool", icon: "fa-solid fa-plus", default: true, callback: (_e,b) => ({ name: String(b.form?.elements?.name?.value ?? "").trim(), action: String(b.form?.elements?.action?.value ?? "any"), effect: String(b.form?.elements?.effect?.value ?? "none"), value: Number(b.form?.elements?.value?.value ?? 0), requirement: String(b.form?.elements?.requirement?.value ?? "").trim(), special: String(b.form?.elements?.special?.value ?? "").trim(), permanent: Boolean(b.form?.elements?.permanent?.checked) }) }, { action: "cancel", label: "Cancel", callback: () => null }]
  });
  if (!result) return null;
  if (!result.name) return ui.notifications.warn("Realm Guard: Give the Conflict Weapon / Tool a name.");
  const tool = { id: foundry.utils.randomID(), name: result.name, conflictTypes: [state.type], action: ACTIONS.includes(result.action) ? result.action : "any", effect: ["dice","success","none"].includes(result.effect) ? result.effect : "none", value: Math.max(-6, Math.min(6, Number(result.value ?? 0))), requirement: result.requirement, special: result.special, createdAt: Date.now(), temporaryConflictId: result.permanent ? "" : state.id };
  await saveConflictTool(actor, tool);
  const id = `tool:${tool.id}`; setWeaponDraft(state, actor.id, id);
  ui.notifications.info(`Realm Guard: ${tool.name} ${result.permanent ? "saved to" : "created for"} ${actor.name}.`);
  return id;
}

function enabledGear(actor, state, side) {
  const disabled = new Set(state?.effects?.[side]?.disabledGearIds ?? []);
  return equippedGear(actor).filter(item => !disabled.has(item.id));
}
function hasGearNamed(actor, state, side, names) {
  const wanted = new Set(names.map(n => String(n).toLowerCase()));
  return enabledGear(actor, state, side).some(i => wanted.has(normalizedGearName(i)));
}

export function interactionMode(ownAction, opponentAction, { ownMissile = false, opponentMissile = false } = {}) {
  if (ownAction === "attack" && opponentAction === "attack" && (ownMissile || opponentMissile)) return "versus";
  return ACTION_INTERACTION?.[ownAction]?.[opponentAction] ?? "independent";
}

export function validateRangerSequence(plan, participantIds, historicalCounts = {}, lastActorId = null) {
  if (!Array.isArray(plan) || plan.length !== 3) return { ok: false, reason: "Choose exactly three Ranger actions." };
  const team = [...new Set(participantIds ?? [])];
  if (!team.length) return { ok: false, reason: "The conflict needs at least one Ranger." };
  const counts = Object.fromEntries(team.map(id => [id, Math.max(0, Number(historicalCounts?.[id] ?? 0))]));
  let previous = lastActorId || null;
  for (let index = 0; index < plan.length; index += 1) {
    const actorId = plan[index]?.actorId;
    if (!team.includes(actorId)) return { ok: false, reason: `Action ${index + 1} must be assigned to a participating Ranger.` };
    if (team.length > 1 && actorId === previous) return { ok: false, reason: "A Ranger cannot take two actions in a row." };
    const currentCount = counts[actorId] ?? 0;
    const someoneStillBehind = team.some(id => (counts[id] ?? 0) < currentCount);
    if (someoneStillBehind) return { ok: false, reason: `${actorById(actorId)?.name ?? "That Ranger"} must wait until every patrol member has acted before taking another action.` };
    counts[actorId] = currentCount + 1;
    previous = actorId;
  }
  return { ok: true, counts, lastActorId: previous };
}

export function compromiseGrade(start, current) {
  const s = Math.max(0, Number(start ?? 0));
  const c = Math.max(0, Number(current ?? 0));
  if (!s || c >= s) return "none";
  const lost = s - c;
  if (lost * 2 < s) return "minor";
  if (lost * 2 === s) return "compromise";
  return "major";
}

function makeSideState() {
  return {
    disposition: { start: 0, current: 0, rolled: false, roll: null, method: "calculated" },
    nextDice: 0,
    disabledGearIds: [],
    swordAction: ""
  };
}

async function startConflictDialog() {
  if (!game.user?.isGM) return;
  const existing = currentState();
  if (isActive(existing)) {
    dismissedConflictId = null;
    renderConflictWindow(existing, { force: true });
    return;
  }

  const characters = game.actors.filter(a => a.type === "character").sort((a, b) => a.name.localeCompare(b.name));
  const opponents = game.actors.filter(a => ["character", "npc"].includes(a.type)).sort((a, b) => a.name.localeCompare(b.name));
  if (!characters.length || !opponents.length) return ui.notifications.warn("Realm Guard: Create at least one Ranger and one opponent Actor first.");

  const participantChecks = characters.map((a, i) => `<label class="rg-conflict-setup-ranger"><input type="checkbox" name="participant" value="${a.id}" ${i < Math.min(3, characters.length) ? "checked" : ""}> ${esc(a.name)}</label>`).join("");
  const captainOptions = characters.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("");
  const opponentOptions = opponents.map(a => `<option value="${a.id}">${esc(a.name)} · ${a.type === "npc" ? "NPC" : "Character"}</option>`).join("");
  const typeOptions = Object.entries(CONFLICT_TYPES).map(([id, d]) => `<option value="${id}">${esc(d.label)}</option>`).join("");
  const content = `<div class="rg-conflict-setup">
    <p class="rg-conflict-callout"><b>Card Conflict Engine:</b> choose the Conflict type, opposition, captain and Ranger team. Goals are entered together in the next shared step.</p>
    <div class="rg-conflict-setup-grid">
      <label>Conflict name <input name="name" value="Realm Guard Conflict"></label>
      <label>Conflict type <select name="type">${typeOptions}</select></label>
      <label>Opponent <select name="opponentId">${opponentOptions}</select></label>
      <label>Conflict Captain <select name="captainId">${captainOptions}</select></label>
      <label class="rg-other-conflict-base">Other conflict base <select name="otherBaseKey"><option value="health">Health</option><option value="will">Will</option><option value="nature">Nature</option><option value="resources">Resources</option><option value="circles">Circles</option></select><small>Only used when Conflict Type is Other.</small></label>
    </div>
    <fieldset><legend>Ranger team</legend><div class="rg-conflict-setup-rangers">${participantChecks}</div></fieldset>
    <p class="rg-conflict-callout"><b>Next:</b> both sides enter their Conflict Goal in the shared Goals & Stakes step. No hidden action cards exist until both sides are ready.</p>
    <p><small>Other conflicts use GM-assigned Skills in the roll dialog. Realm Guard conflict Skills are used automatically for standard conflict types.</small></p>
  </div>`;
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Start Conflict", resizable: true }, content, modal: false, rejectClose: false,
    buttons: [
      { action: "start", label: "Start Conflict", icon: "fa-solid fa-khanda", default: true, callback: (_e, b) => {
        const f = b.form?.elements;
        return {
          name: f?.name?.value?.trim() || "Realm Guard Conflict",
          type: f?.type?.value || "fight",
          opponentId: f?.opponentId?.value || "",
          captainId: f?.captainId?.value || "",
          otherBaseKey: f?.otherBaseKey?.value || "health",
          participantIds: [...(b.form?.querySelectorAll('input[name="participant"]:checked') ?? [])].map(el => el.value)
        };
      } },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (!result) return;
  if (!result.participantIds.length) return ui.notifications.warn("Realm Guard: Select at least one Ranger.");
  if (!result.participantIds.includes(result.captainId)) return ui.notifications.warn("Realm Guard: The Conflict Captain must be one of the participating Rangers.");
  if (!actorById(result.opponentId)) return ui.notifications.warn("Realm Guard: Choose an opponent Actor.");
  const id = foundry.utils.randomID();
  const state = {
    id, active: true, name: result.name, type: result.type, stage: "goals", exchange: 1, currentIndex: 0,
    createdBy: game.user.id, createdAt: Date.now(), otherBaseKey: result.otherBaseKey || "health",
    ranger: { participantIds: result.participantIds, captainId: result.captainId, goal: "", goalReady: false, ...makeSideState() },
    gm: { actorId: result.opponentId, goal: "", goalReady: false, ...makeSideState() },
    locks: { gm: false, ranger: false },
    revealed: [], rolls: { gm: null, ranger: null },
    effects: { ranger: { nextDice: 0, disabledGearIds: [], swordActions: {} }, gm: { nextDice: 0, disabledGearIds: [], swordActions: {} } },
    actionCounts: Object.fromEntries(result.participantIds.map(actorId => [actorId, 0])), lastRangerActorId: null,
    loreMasterActions: {}, weaponIds: {},
    outcome: null, compromise: null, log: []
  };
  await setPrivateState({ conflictId: id, gmPlan: [], rangerPlan: [] });
  lockedPlanCache.set(id, { gmPlan: [], rangerPlan: [] });
  dismissedConflictId = null;
  await setPublicState(state);
  renderConflictWindow(state, { force: true });
}

function conflictCard(action, side, { small = false, faceDown = false, selected = false, index = null } = {}) {
  const cls = [`rg-conflict-card`, `rg-${side}-card`, small ? "small" : "", faceDown ? "face-down" : "", selected ? "selected" : ""].filter(Boolean).join(" ");
  if (faceDown) return `<div class="${cls}" ${index !== null ? `data-slot-index="${index}"` : ""}><div class="rg-card-back-mark"><i class="${side === "gm" ? "fa-solid fa-eye" : "fa-solid fa-tree"}"></i></div><b>${side === "gm" ? "GM" : "RANGERS"}</b><span>Realm Guard / Torchbearer</span></div>`;
  return `<button type="button" class="${cls}" data-action-card="${esc(action)}" ${index !== null ? `data-slot-index="${index}"` : ""} data-rg-help="${esc(actionHoverHelp(action))}" data-rg-help-title="${esc(actionLabel(action))}" title="${esc(actionLabel(action))}"><i class="${ACTION_ICONS[action]}"></i><b>${esc(actionLabel(action))}</b><span>${action === "attack" ? "Press the goal" : action === "defend" ? "Protect position" : action === "feint" ? "Exploit a weakness" : "Gain advantage"}</span></button>`;
}

function dispositionBar(side, data) {
  const start = Math.max(0, Number(data?.start ?? 0));
  const current = Math.max(0, Number(data?.current ?? 0));
  const pct = start ? Math.max(0, Math.min(100, Math.round((current / start) * 100))) : 0;
  return `<div class="rg-disposition rg-disposition-${side}"><div class="rg-disposition-head"><b>${side === "gm" ? "GM / Opposition" : "Rangers"}</b><strong>${data?.rolled ? `${current} / ${start}` : "Not rolled"}</strong></div><div class="rg-disposition-track"><span style="width:${pct}%"></span></div></div>`;
}

function planFor(side, state) {
  const draft = draftPlans.get(state.id)?.[side];
  if (Array.isArray(draft) && draft.length) return draft;
  const privateData = privateState();
  if (game.user?.isGM) return side === "gm" ? (privateData.gmPlan ?? []) : (privateData.rangerPlan ?? []);
  return [];
}
function setDraft(side, state, plan) {
  const d = draftPlans.get(state.id) ?? { gm: [], ranger: [] };
  d[side] = plan;
  draftPlans.set(state.id, d);
}
function planWeaponName(actor, state, side, weaponId) {
  if (!actor) return "Unarmed · −1D";
  return selectedConflictWeapon(actor, state, side, weaponId)?.name ?? "Unarmed · −1D";
}
function planWeaponSelect(actor, state, side, index, selectedId = "") {
  const weapons = availableConflictWeapons(actor, state, side);
  const validSelected = weapons.some(w => w.id === selectedId) ? selectedId : "";
  return `<label class="rg-plan-weapon"><span>Weapon / Tool</span><select data-plan-weapon="${index}" data-plan-side="${side}" data-rg-help-label="Weapon / Tool"><option value="" ${!validSelected ? "selected" : ""} data-rg-help="No valid Conflict Weapon / Tool is selected. This Action is Unarmed and takes −1D.">Unarmed · −1D</option>${weapons.map(w => `<option value="${w.id}" ${validSelected === w.id ? "selected" : ""} data-rg-help="Use ${esc(w.name)} as this Action's Conflict Weapon / Tool. Its action-specific bonus or penalty is applied when the test resolves.">${esc(w.name)}</option>`).join("")}</select></label>`;
}
function planSlotHtml(side, state, index, planEntry, { editable = false } = {}) {
  const locked = Boolean(state.locks?.[side]);
  const revealed = state.revealed?.find(r => r.index === index);
  if (revealed) {
    const action = side === "gm" ? revealed.gmAction : revealed.rangerAction;
    const actor = side === "ranger" ? actorById(revealed.rangerActorId) : actorById(state.gm.actorId);
    const weaponId = side === "gm" ? revealed.gmWeaponId : revealed.rangerWeaponId;
    return `<div class="rg-plan-slot revealed"><span class="rg-plan-no">${index + 1}</span>${conflictCard(action, side, { small: true })}<div class="rg-plan-summary"><b>${esc(actor?.name ?? "")}</b><span>${esc(planWeaponName(actor, state, side, weaponId))}</span></div></div>`;
  }
  if (locked) {
    const ownSideView = side === "gm" ? Boolean(game.user?.isGM) : Boolean(!game.user?.isGM && canCaptainControl(state));
    if (ownSideView && planEntry?.action) {
      const actor = side === "ranger" ? actorById(planEntry.actorId) : actorById(state.gm.actorId);
      return `<div class="rg-plan-slot locked own-plan"><span class="rg-plan-no">${index + 1}</span>${conflictCard(planEntry.action, side, { small: true })}<div class="rg-plan-summary"><b>${esc(actor?.name ?? "Locked")}</b><span>${esc(planWeaponName(actor, state, side, planEntry.weaponId))}</span></div></div>`;
    }
    return `<div class="rg-plan-slot locked"><span class="rg-plan-no">${index + 1}</span>${conflictCard("attack", side, { small: true, faceDown: true })}<div class="rg-plan-summary"><b>PLAN LOCKED</b><span>Hidden until reveal</span></div></div>`;
  }
  if (!editable) return `<div class="rg-plan-slot waiting"><span class="rg-plan-no">${index + 1}</span>${conflictCard("attack", side, { small: true, faceDown: true })}<div class="rg-plan-summary"><b>WAITING</b><span>Other side is planning</span></div></div>`;

  const action = planEntry?.action;
  if (!action) {
    return `<div class="rg-plan-slot editable is-empty" data-plan-slot="${index}"><span class="rg-plan-no">${index + 1}</span><div class="rg-plan-empty-state"><i class="fa-regular fa-square-plus"></i><b>Choose an Action</b><span>Pick Attack, Defend, Feint or Maneuver above.</span></div></div>`;
  }

  const actorId = side === "ranger" ? (planEntry?.actorId || state.ranger.participantIds[index % state.ranger.participantIds.length]) : state.gm.actorId;
  const actor = actorById(actorId);
  const actorSelect = side === "ranger"
    ? `<label class="rg-plan-field"><span>Acting Ranger</span><select class="rg-plan-actor" data-plan-actor="${index}">${(state.ranger.participantIds ?? []).map(id => `<option value="${id}" ${actorId === id ? "selected" : ""}>${esc(actorById(id)?.name ?? id)}</option>`).join("")}</select></label>`
    : `<div class="rg-plan-field rg-plan-fixed-actor"><span>Actor</span><b>${esc(actor?.name ?? "GM / Opposition")}</b></div>`;
  const defaultWeaponId = planEntry?.weaponId || weaponDraftFor(actor, state, side);
  const canCreate = actor && (game.user?.isGM || actor.isOwner);
  const custom = canCreate ? `<button type="button" class="rg-plan-custom-tool" data-conflict-custom-tool-actor="${actor.id}" data-side="${side}" title="Create a custom or improvised Conflict Weapon / Tool"><i class="fa-solid fa-plus"></i> Custom Tool</button>` : "";
  const weaponName = planWeaponName(actor, state, side, defaultWeaponId);
  const unarmed = !defaultWeaponId || weaponName.startsWith("Unarmed");
  return `<div class="rg-plan-slot editable has-action ${unarmed ? "is-unarmed" : ""}" data-plan-slot="${index}"><span class="rg-plan-no">${index + 1}</span><div class="rg-plan-action-head">${conflictCard(action, side, { small: true })}<div><b>${esc(actionLabel(action))}</b><span>Action ${index + 1}</span></div></div><div class="rg-plan-fields">${actorSelect}${planWeaponSelect(actor, state, side, index, defaultWeaponId)}${custom}${unarmed ? `<div class="rg-plan-unarmed"><i class="fa-solid fa-triangle-exclamation"></i><span>No valid Conflict Weapon / Tool selected · <b>Unarmed −1D</b></span></div>` : ""}</div><button type="button" class="rg-plan-clear" data-clear-plan="${index}" title="Clear this planned Action"><i class="fa-solid fa-xmark"></i></button></div>`;
}

function weaponPlannerHtml(side, state, editable) {
  if (!editable) return "";
  const actorIds = side === "gm" ? [state.gm.actorId] : (state.ranger.participantIds ?? []);
  const rows = actorIds.map(actorId => {
    const actor = actorById(actorId); if (!actor) return "";
    const weapons = availableConflictWeapons(actor, state, side);
    const selected = weaponDraftFor(actor, state, side);
    const canCreate = game.user?.isGM || actor.isOwner;
    return `<div class="rg-conflict-weapon-row rg-conflict-weapon-edit"><b>${esc(actor.name)}</b><select data-conflict-weapon-actor="${actorId}"><option value="" ${!selected ? "selected" : ""}>Unarmed / no tool · −1D</option>${weapons.map(w => `<option value="${w.id}" ${selected === w.id ? "selected" : ""}>${esc(w.name)}${w.kind === "tool" ? " · Conflict Tool" : " · Gear"}</option>`).join("")}</select>${canCreate ? `<button type="button" data-conflict-custom-tool-actor="${actorId}" data-side="${side}" title="Create a custom/improvised Conflict Weapon or Tool"><i class="fa-solid fa-plus"></i> Custom</button>` : ""}</div>`;
  }).join("");
  return `<details class="rg-conflict-weapon-defaults"><summary><i class="fa-solid fa-wand-sparkles"></i> Optional: set quick Weapon / Tool defaults</summary><div class="rg-conflict-weapons"><small class="rg-conflict-weapon-rule">Defaults prefill new Action slots. Every planned Action can still choose a different Weapon / Tool. No valid tool = Unarmed −1D.</small>${rows}</div></details>`;
}

function conflictActionGuideHtml() {
  return `<details class="rg-conflict-action-guide" aria-label="Conflict action guide"><summary><i class="fa-solid fa-circle-info"></i><b>Action Guide</b><span>What do Attack, Defend, Feint and Maneuver do?</span></summary><div class="rg-conflict-action-guide-grid">${ACTIONS.map(action => {
      const guide = ACTION_GUIDE[action];
      return `<article class="rg-conflict-action-guide-item rg-guide-${esc(action)}"><header><i class="${ACTION_ICONS[action]}"></i><b>${esc(actionLabel(action))}</b></header><p>${esc(guide.summary)}</p><small><strong>Good for:</strong> ${esc(guide.good)} <strong>Watch out:</strong> ${esc(guide.drawback)}</small></article>`;
    }).join("")}</div></details>`;
}

function planActionChoice(action, side) {
  return `<button type="button" class="rg-plan-action-choice rg-${side}-choice" data-action-card="${esc(action)}" data-rg-help="${esc(actionHoverHelp(action))}" data-rg-help-title="${esc(actionLabel(action))}"><i class="${ACTION_ICONS[action]}"></i><span><b>${esc(actionLabel(action))}</b><small>${action === "attack" ? "Press the goal" : action === "defend" ? "Protect position" : action === "feint" ? "Exploit a weakness" : "Gain advantage"}</small></span></button>`;
}

function cardPlannerHtml(side, state, editable) {
  const plan = planFor(side, state);
  const filled = [0,1,2].filter(i => plan[i]?.action).length;
  return `<div class="rg-card-planner ${editable ? "editable" : "readonly"}">
    ${editable ? `<div class="rg-plan-step-head"><div><b>Choose three Actions</b><span>Select an Action first. Actor and Weapon / Tool controls appear only after that slot is filled.</span></div><strong>${filled}/3</strong></div><div class="rg-card-deck">${ACTIONS.map(action => planActionChoice(action, side)).join("")}</div>${weaponPlannerHtml(side, state, editable)}` : ""}
    <div class="rg-plan-row">${[0,1,2].map(i => planSlotHtml(side, state, i, plan[i], { editable })).join("")}</div>
  </div>`;
}

function currentPair(state) { return state.revealed?.find(r => Number(r.index) === Number(state.currentIndex)) ?? null; }
function interactionBadge(mode) {
  const label = mode === "versus" ? "VERSUS" : mode === "trumped" ? "TRUMPED" : "INDEPENDENT";
  return `<span class="rg-interaction ${mode}">${label}</span>`;
}
function currentActionHtml(state) {
  const pair = currentPair(state);
  if (!pair) return "";
  const gmActor = actorById(state.gm.actorId);
  const rangerActor = actorById(pair.rangerActorId);
  const gmMode = pair.gmMode ?? interactionMode(pair.gmAction, pair.rangerAction, { ownMissile: sideHasMissile(gmActor, state, "gm", pair.gmWeaponId), opponentMissile: sideHasMissile(rangerActor, state, "ranger", pair.rangerWeaponId) });
  const rangerMode = pair.rangerMode ?? interactionMode(pair.rangerAction, pair.gmAction, { ownMissile: sideHasMissile(rangerActor, state, "ranger", pair.rangerWeaponId), opponentMissile: sideHasMissile(gmActor, state, "gm", pair.gmWeaponId) });
  const gmRoll = state.rolls?.gm;
  const rangerRoll = state.rolls?.ranger;
  const gmCan = canSideRoll(state, "gm") && gmMode !== "trumped" && !gmRoll && state.stage === "action";
  const rangerCan = canSideRoll(state, "ranger") && rangerMode !== "trumped" && !rangerRoll && state.stage === "action";
  const rollSummary = (roll, mode) => mode === "trumped" ? `<div class="rg-roll-state trumped">No test · action trumped</div>` : roll ? `<div class="rg-roll-state done"><b>${roll.successes}</b> successes <small>${esc(roll.skillName)} · ${diceFacesHtml(roll.faces ?? [])}${roll.tokenPowerName ? ` · Token: ${esc(roll.tokenPowerName)} L${Number(roll.tokenPowerLevel ?? 0)}` : ""}${roll.talentName ? ` · Talent: ${esc(roll.talentName)}${Number(roll.talentDice ?? 0) ? ` +${Number(roll.talentDice)}D` : ""}` : ""}</small></div>` : `<div class="rg-roll-state waiting">Waiting for roll</div>`;
  return `<section class="rg-current-action">
    <header><span>ACTION ${state.currentIndex + 1} · EXCHANGE ${state.exchange}</span><b>${interactionBadge(gmMode)} / ${interactionBadge(rangerMode)}</b></header>
    <div class="rg-action-versus-grid">
      <div class="rg-action-side gm"><h4>${esc(gmActor?.name ?? "Opposition")}</h4>${conflictCard(pair.gmAction, "gm")}<div class="rg-action-tool"><i class="fa-solid fa-wand-sparkles"></i> ${esc(planWeaponName(gmActor, state, "gm", pair.gmWeaponId))}</div>${interactionBadge(gmMode)}${rollSummary(gmRoll, gmMode)}${gmCan ? `<button type="button" class="rg-conflict-primary" data-conflict-action="roll" data-side="gm" data-rg-help="Roll the revealed GM / Opposition Action using its legal Conflict Skill or Nature source, selected Weapon / Tool and available character resources." data-rg-help-title="Roll GM Action"><i class="fa-solid fa-dice"></i> Roll GM Action</button>` : ""}</div>
      <div class="rg-action-clash"><i class="fa-solid fa-bolt"></i><b>VS</b><small>${gmMode === "versus" ? "Opposed test" : "Resolve by action rules"}</small></div>
      <div class="rg-action-side ranger"><h4>${esc(rangerActor?.name ?? "Ranger")}</h4>${conflictCard(pair.rangerAction, "ranger")}<div class="rg-action-tool"><i class="fa-solid fa-wand-sparkles"></i> ${esc(planWeaponName(rangerActor, state, "ranger", pair.rangerWeaponId))}</div>${interactionBadge(rangerMode)}${rollSummary(rangerRoll, rangerMode)}${rangerCan ? `<button type="button" class="rg-conflict-primary" data-conflict-action="roll" data-side="ranger" data-rg-help="Roll the revealed Ranger Action using its legal Conflict Skill or Nature source, selected Weapon / Tool, Teamwork and available character resources." data-rg-help-title="Roll Ranger Action"><i class="fa-solid fa-dice"></i> Roll Ranger Action</button>` : ""}</div>
    </div>
    ${pair.resultText ? `<div class="rg-action-result">${pair.resultText}${pair.tiePending && game.user?.isGM ? `<button type="button" class="rg-conflict-primary" data-conflict-action="resolve-tie" data-rg-help="Resolve the pending Versus tie using the conflict tiebreak procedure. Resource spending is committed only when the tie is actually resolved." data-rg-help-title="Resolve Versus Tie"><i class="fa-solid fa-scale-balanced"></i> Resolve Versus Tie</button>` : ""}</div>` : ""}
  </section>`;
}

function maneuverHtml(state) {
  const pending = state.pendingManeuver;
  if (!pending || state.stage !== "maneuver") return "";
  const side = pending.side;
  const actor = side === "gm" ? actorById(state.gm.actorId) : actorById(currentPair(state)?.rangerActorId);
  const canChoose = side === "gm" ? game.user?.isGM : (game.user?.isGM || actor?.isOwner);
  if (!canChoose) return `<div class="rg-maneuver-panel"><b>${esc(actor?.name ?? side)} is choosing a Maneuver effect…</b></div>`;
  const points = Math.max(0, Number(pending.margin ?? 0));
  const choices = [];
  if (points >= 1) choices.push(`<button data-maneuver-choice="impede" data-rg-help="Spend 1 Maneuver margin to Impede the opponent: the opponent takes −1D on its next action." data-rg-help-title="Maneuver · Impede">Impede · opponent −1D next action</button>`);
  if (points >= 2) choices.push(`<button data-maneuver-choice="position" data-rg-help="Spend 2 Maneuver margin to Gain Position: your side gains +2D on its next action." data-rg-help-title="Maneuver · Gain Position">Gain Position · +2D next action</button>`);
  if (points >= 3) {
    choices.push(`<button data-maneuver-choice="disarm" data-rg-help="Spend 3 Maneuver margin to Disarm: disable an opposing weapon or appropriate Gear for the conflict." data-rg-help-title="Maneuver · Disarm">Disarm · disable weapon / gear</button>`);
    choices.push(`<button data-maneuver-choice="combo" data-rg-help="Spend 3 Maneuver margin to combine Impede and Gain Position: opponent −1D next action and your side +2D next action." data-rg-help-title="Maneuver · Combined Effect">Impede + Gain Position</button>`);
  }
  return `<div class="rg-maneuver-panel"><h4>Maneuver · Margin ${points}</h4><p>Choose the effect for <b>${esc(actor?.name ?? side)}</b>.</p><div class="rg-maneuver-buttons">${choices.join("")}</div></div>`;
}

function compromiseHtml(state) {
  if (state.stage !== "compromise" && state.stage !== "complete") return "";
  const outcome = state.outcome ?? {};
  const winner = outcome.winner === "ranger" ? "Rangers" : outcome.winner === "gm" ? "GM / Opposition" : "Tie";
  const winnerSide = outcome.winner === "ranger" ? state.ranger : state.gm;
  const grade = outcome.winner === "tie" ? "dangerous tie" : compromiseGrade(winnerSide?.disposition?.start, winnerSide?.disposition?.current);
  const label = ({ none: "No Compromise", minor: "Minor Compromise", compromise: "Compromise", major: "Major Compromise", "dangerous tie": "Conflict Tie" })[grade] ?? grade;
  return `<section class="rg-compromise-panel"><h3>${esc(label)}</h3><p><b>${esc(winner)}</b> ${outcome.winner === "tie" ? "reached 0 disposition in the same action. Both goals are achieved; this is a dangerous outcome." : "won the conflict."}</p>
    ${outcome.winner !== "tie" ? `<p>Winner remaining disposition: <b>${winnerSide.disposition.current}/${winnerSide.disposition.start}</b>. The losing side proposes an appropriate “You win, but…” concession.</p>` : ""}
    ${state.compromise?.text ? `<div class="rg-compromise-text">${esc(state.compromise.text)}</div>` : ""}
    ${game.user?.isGM && state.stage === "compromise" ? `<label>Compromise / outcome notes<textarea id="rg-conflict-compromise-text" rows="3" placeholder="Record the agreed compromise…">${esc(state.compromise?.text ?? "")}</textarea></label><button type="button" class="rg-conflict-primary" data-conflict-action="finish"><i class="fa-solid fa-flag-checkered"></i> Finish Conflict</button>` : ""}
  </section>`;
}

function conflictGuidanceHtml(state) {
  const pair = currentPair(state);
  if (state.stage === "goals") return `<section class="rg-conflict-guidance current"><b>Step 1 · Goals & Stakes</b><span>Each side writes its Conflict Goal and presses Save. Saving marks that side Ready automatically; when both sides are green, Starting Disposition begins.</span></section>`;
  if (state.stage === "disposition") return `<section class="rg-conflict-guidance"><b>Step 2 · Starting Disposition</b><span>Generate disposition for each side. Calculated, Nature, Fixed and Manual opposition methods are supported.</span></section>`;
  if (state.stage === "gmPlan") return `<section class="rg-conflict-guidance"><b>Step 3 · GM plans secretly</b><span>GM chooses three action cards and locks them. Rangers do not see them.</span></section>`;
  if (state.stage === "rangerPlan") return `<section class="rg-conflict-guidance"><b>Step 4 · Rangers plan secretly</b><span>The Conflict Captain chooses three cards and assigns Rangers. Locking the plan reveals Action 1 automatically.</span></section>`;
  if (state.stage === "ready") return `<section class="rg-conflict-guidance"><b>Next action loading</b><span>No extra reveal click is normally needed.</span></section>`;
  if (state.stage === "action" && pair) {
    const waiting = []; if (!state.rolls?.gm && pair.gmMode !== "trumped") waiting.push("GM / Opposition"); if (!state.rolls?.ranger && pair.rangerMode !== "trumped") waiting.push("Ranger");
    const modeText = pair.gmMode === "versus" || pair.rangerMode === "versus" ? "Versus: both results oppose each other." : "Independent/trumped actions resolve by their Conflict interaction.";
    return `<section class="rg-conflict-guidance current"><b>Action ${state.currentIndex + 1} · ${esc(actionLabel(pair.gmAction))} vs ${esc(actionLabel(pair.rangerAction))}</b><span>${esc(modeText)} ${waiting.length ? `Waiting for: ${esc(waiting.join(" + "))}.` : "All required rolls are in; resolving automatically."}</span></section>`;
  }
  if (state.stage === "maneuver") return `<section class="rg-conflict-guidance current"><b>Maneuver result</b><span>Choose the earned Maneuver effect; the Conflict then continues automatically.</span></section>`;
  if (state.stage === "compromise") return `<section class="rg-conflict-guidance current"><b>Conflict resolved</b><span>Agree the final compromise/outcome and finish the Conflict.</span></section>`;
  return "";
}

function conflictHistoryHtml(state) {
  const rows = (state.log ?? []).slice(-16);
  if (!rows.length) return "";
  return `<details class="rg-conflict-history"><summary><i class="fa-solid fa-clock-rotate-left"></i> Exchange history</summary><ol>${rows.map(row => `<li>${esc(row)}</li>`).join("")}</ol></details>`;
}

function controlsHtml(state) {
  if (state.stage === "goals") {
    const gmCan = Boolean(game.user?.isGM);
    const rangerCan = canCaptainControl(state);
    const gmEdit = gmCan ? `<button class="rg-conflict-primary gm" data-conflict-action="edit-goal" data-side="gm" data-rg-help="Write or edit the GM / Opposition Conflict Goal. Saving the Goal marks this side Ready automatically." data-rg-help-title="GM Conflict Goal"><i class="fa-solid fa-pen"></i> ${state.gm.goal ? "Edit" : "Write"} GM Goal</button>` : "";
    const rangerEdit = rangerCan ? `<button class="rg-conflict-primary ranger" data-conflict-action="edit-goal" data-side="ranger" data-rg-help="Write or edit the Ranger Conflict Goal. Saving the Goal marks the Rangers Ready automatically." data-rg-help-title="Ranger Conflict Goal"><i class="fa-solid fa-pen"></i> ${state.ranger.goal ? "Edit" : "Write"} Ranger Goal</button>` : "";
    const status = `<div class="rg-goal-ready-strip"><span class="${state.gm.goalReady ? "is-ready" : "is-waiting"}"><i class="fa-solid ${state.gm.goalReady ? "fa-circle-check" : "fa-pen"}"></i> GM / Opposition · ${state.gm.goalReady ? "READY" : "WRITE & SAVE"}</span><span class="${state.ranger.goalReady ? "is-ready" : "is-waiting"}"><i class="fa-solid ${state.ranger.goalReady ? "fa-circle-check" : "fa-pen"}"></i> Rangers · ${state.ranger.goalReady ? "READY" : "WRITE & SAVE"}</span></div>`;
    return `<div class="rg-conflict-controls rg-goal-controls">${gmEdit}${rangerEdit}${status}<small>Save = Ready. There is no second confirmation click.</small></div>`;
  }
  if (state.stage === "disposition") {
    const gmButton = !state.gm.disposition.rolled && game.user?.isGM ? `<button class="rg-conflict-primary" data-conflict-action="disposition" data-side="gm" data-rg-help="Generate the GM / Opposition Starting Disposition. The GM chooses the disposition Method before any roll is made." data-rg-help-title="GM Starting Disposition"><i class="fa-solid fa-dice"></i> Roll GM Disposition</button>` : "";
    const rangerButton = !state.ranger.disposition.rolled && canCaptainControl(state) ? `<button class="rg-conflict-primary" data-conflict-action="disposition" data-side="ranger" data-rg-help="Roll the Rangers’ Starting Disposition using the conflict’s legal Skill and Base Ability procedure." data-rg-help-title="Ranger Starting Disposition"><i class="fa-solid fa-dice"></i> Roll Ranger Disposition</button>` : "";
    return `<div class="rg-conflict-controls">${gmButton}${rangerButton}<small>When both sides have disposition, the GM plans three secret cards first.</small></div>`;
  }
  if (state.stage === "gmPlan") {
    if (!game.user?.isGM) return `<div class="rg-conflict-controls waiting"><i class="fa-solid fa-lock"></i> GM is choosing three hidden action cards…</div>`;
    return `<div class="rg-conflict-controls"><button class="rg-conflict-primary gm" data-conflict-action="lock-plan" data-side="gm" data-rg-help="Lock the GM’s three hidden Actions. Once locked, the GM plan is ready and the Ranger side can finish planning." data-rg-help-title="Lock GM Plan"><i class="fa-solid fa-lock"></i> Lock GM Cards</button></div>`;
  }
  if (state.stage === "rangerPlan") {
    if (!canCaptainControl(state)) return `<div class="rg-conflict-controls waiting"><i class="fa-solid fa-user-shield"></i> Conflict Captain is choosing and assigning three hidden cards…</div>`;
    return `<div class="rg-conflict-controls"><button class="rg-conflict-primary ranger" data-conflict-action="lock-plan" data-side="ranger" data-rg-help="Lock the Rangers’ three hidden Actions. When both plans are locked, the next Action reveals automatically." data-rg-help-title="Lock Ranger Plan"><i class="fa-solid fa-lock"></i> Lock Ranger Cards</button></div>`;
  }
  if (state.stage === "ready" && game.user?.isGM) return `<div class="rg-conflict-controls waiting"><i class="fa-solid fa-spinner fa-spin"></i> Plans locked · revealing Action ${state.currentIndex + 1} automatically… <button type="button" class="rg-conflict-retry" data-conflict-action="reveal" title="Use only if the automatic reveal did not complete">Retry reveal</button></div>`;
  if (state.stage === "ready") return `<div class="rg-conflict-controls waiting"><i class="fa-solid fa-lock"></i> Plans locked · Action ${state.currentIndex + 1} is revealing automatically.</div>`;
  return "";
}

function renderConflictWindow(state = currentState(), { force = false } = {}) {
  const old = document.getElementById(WINDOW_ID);
  if (!isActive(state) || !isParticipantOwner(state)) { old?.remove(); return; }
  if (!force && dismissedConflictId === state.id && !old) return;
  let root = old;
  if (!root) {
    root = document.createElement("section"); root.id = WINDOW_ID; root.className = "rg-conflict-window"; document.body.append(root);
  }
  root.dataset.stage = state.stage;
  const gmActor = actorById(state.gm.actorId);
  const captain = actorById(state.ranger.captainId);
  const gmEditable = state.stage === "gmPlan" && game.user?.isGM && !state.locks.gm;
  const rangerEditable = state.stage === "rangerPlan" && canCaptainControl(state) && !state.locks.ranger;
  root.innerHTML = `<header class="rg-conflict-titlebar" data-conflict-drag><div><span>REALM GUARD</span><h2>${esc(state.name)}</h2><small>${esc(conflictTypeLabel(state.type))} · ${esc(stageLabel(state.stage))} · Exchange ${state.exchange}</small></div><div class="rg-conflict-window-actions"><button type="button" data-conflict-action="close" title="Minimize / Restore Conflict Window"><i class="fa-solid fa-window-minimize"></i></button></div></header>
    <div class="rg-conflict-body">
      <div class="rg-conflict-goals"><article class="gm"><b>${esc(gmActor?.name ?? "Opposition")}</b><span>GM GOAL</span><p>${esc(state.gm.goal || "No goal entered")}</p></article><div class="rg-conflict-emblem"><i class="fa-solid fa-khanda"></i></div><article class="ranger"><b>Rangers · Captain ${esc(captain?.name ?? "—")}</b><span>RANGER GOAL</span><p>${esc(state.ranger.goal || "No goal entered")}</p></article></div>
      <div class="rg-disposition-grid">${dispositionBar("gm", state.gm.disposition)}${dispositionBar("ranger", state.ranger.disposition)}</div>
      ${conflictGuidanceHtml(state)}
      ${(state.stage === "gmPlan" || state.stage === "rangerPlan") ? conflictActionGuideHtml() : ""}
      <div class="rg-conflict-plans"><section class="rg-side-plan gm ${gmEditable ? "is-active-plan" : ""}"><h3><span><i class="fa-solid fa-eye"></i> GM / OPPOSITION PLAN</span><small>${state.locks.gm ? "LOCKED" : gmEditable ? "PLANNING NOW" : "HIDDEN / WAITING"}</small></h3>${cardPlannerHtml("gm", state, gmEditable)}</section><section class="rg-side-plan ranger ${rangerEditable ? "is-active-plan" : ""}"><h3><span><i class="fa-solid fa-tree"></i> RANGER PLAN</span><small>${state.locks.ranger ? "LOCKED" : rangerEditable ? "PLANNING NOW" : "HIDDEN / WAITING"}</small></h3>${cardPlannerHtml("ranger", state, rangerEditable)}</section></div>
      ${controlsHtml(state)}${currentActionHtml(state)}${maneuverHtml(state)}${compromiseHtml(state)}${conflictHistoryHtml(state)}
      ${game.user?.isGM && state.stage !== "complete" ? `<div class="rg-conflict-admin"><button type="button" data-conflict-action="abort"><i class="fa-solid fa-ban"></i> Abort Conflict</button></div>` : ""}
    </div>`;
  bindWindowEvents(root, state);
}

function bindWindowEvents(root, state) {
  root.querySelector('[data-conflict-action="close"]')?.addEventListener("click", () => {
    root.classList.toggle("minimized");
    const icon = root.querySelector('[data-conflict-action="close"] i');
    if (icon) icon.className = root.classList.contains("minimized") ? "fa-solid fa-window-maximize" : "fa-solid fa-window-minimize";
  });
  root.querySelector('[data-conflict-action="abort"]')?.addEventListener("click", () => void abortConflict());
  root.querySelectorAll(".rg-card-deck [data-action-card]").forEach(button => button.addEventListener("click", () => {
    const side = state.stage === "gmPlan" && game.user?.isGM ? "gm" : state.stage === "rangerPlan" && canCaptainControl(state) ? "ranger" : null;
    if (!side) return;
    const plan = [...planFor(side, state)];
    const index = plan.findIndex(entry => !entry?.action);
    const slot = index >= 0 ? index : (plan.length < 3 ? plan.length : -1);
    if (slot < 0) return ui.notifications.warn("Realm Guard: Clear a plan slot before choosing another card.");
    const actorId = side === "ranger" ? (plan[slot]?.actorId || state.ranger.participantIds[slot % state.ranger.participantIds.length]) : state.gm.actorId;
    const actor = actorById(actorId);
    plan[slot] = { action: button.dataset.actionCard, actorId, weaponId: plan[slot]?.weaponId ?? weaponDraftFor(actor, state, side) };
    setDraft(side, state, plan);
    renderConflictWindow(state, { force: true });
  }));
  root.querySelectorAll("[data-clear-plan]").forEach(button => button.addEventListener("click", () => {
    const side = state.stage === "gmPlan" && game.user?.isGM ? "gm" : "ranger";
    const plan = [...planFor(side, state)];
    const index = Number(button.dataset.clearPlan); plan[index] = null; setDraft(side, state, plan); renderConflictWindow(state, { force: true });
  }));
  root.querySelectorAll("[data-plan-actor]").forEach(select => select.addEventListener("change", () => {
    const plan = [...planFor("ranger", state)]; const index = Number(select.dataset.planActor);
    const actor = actorById(select.value);
    plan[index] = { ...(plan[index] ?? {}), actorId: select.value, weaponId: weaponDraftFor(actor, state, "ranger") }; setDraft("ranger", state, plan);
    renderConflictWindow(state, { force: true });
  }));
  root.querySelectorAll("[data-plan-weapon]").forEach(select => select.addEventListener("change", () => {
    const side = select.dataset.planSide; if (!["gm","ranger"].includes(side)) return;
    const plan = [...planFor(side, state)]; const index = Number(select.dataset.planWeapon);
    const actorId = side === "ranger" ? (plan[index]?.actorId || state.ranger.participantIds[index % state.ranger.participantIds.length]) : state.gm.actorId;
    const actor = actorById(actorId);
    plan[index] = { ...(plan[index] ?? {}), actorId, weaponId: validateWeaponId(actor, state, side, select.value) };
    setDraft(side, state, plan);
  }));
  root.querySelectorAll("[data-conflict-weapon-actor]").forEach(select => select.addEventListener("change", () => {
    setWeaponDraft(state, select.dataset.conflictWeaponActor, select.value);
  }));
  root.querySelectorAll("[data-conflict-custom-tool-actor]").forEach(button => button.addEventListener("click", async event => {
    event.preventDefault();
    const actor = actorById(button.dataset.conflictCustomToolActor); if (!actor) return;
    await openCustomConflictTool(actor, state, button.dataset.side || "ranger");
    renderConflictWindow(state, { force: true });
  }));
  root.querySelectorAll("[data-conflict-action]").forEach(button => {
    const action = button.dataset.conflictAction;
    if (["close", "abort"].includes(action)) return;
    button.addEventListener("click", () => void handleWindowAction(action, button.dataset.side, state));
  });
  root.querySelectorAll("[data-maneuver-choice]").forEach(button => button.addEventListener("click", () => void chooseManeuver(button.dataset.maneuverChoice, state)));
  const header = root.querySelector("[data-conflict-drag]");
  header?.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    const rect = root.getBoundingClientRect(); dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    header.setPointerCapture?.(event.pointerId);
  });
  header?.addEventListener("pointermove", event => {
    if (!dragOffset) return;
    root.style.left = `${Math.max(4, Math.min(window.innerWidth - root.offsetWidth - 4, event.clientX - dragOffset.x))}px`;
    root.style.top = `${Math.max(4, Math.min(window.innerHeight - 80, event.clientY - dragOffset.y))}px`;
    root.style.transform = "none";
  });
  header?.addEventListener("pointerup", () => { dragOffset = null; });
}

async function handleWindowAction(action, side, state) {
  if (action === "edit-goal") return editConflictGoal(side, state);
  if (action === "ready-goal") return setConflictGoalReady(side, state);
  if (action === "disposition") return rollDisposition(side, state);
  if (action === "lock-plan") return lockPlan(side, state);
  if (action === "reveal") return revealCurrentAction(state);
  if (action === "roll") return rollCurrentAction(side, state);
  if (action === "resolve-tie") return gmResolveCurrentPair(state);
  if (action === "finish") return finishConflict(state);
}


async function editConflictGoal(side, state) {
  if (state.stage !== "goals" || !["gm", "ranger"].includes(side)) return;
  if (side === "gm" && !game.user?.isGM) return;
  if (side === "ranger" && !canCaptainControl(state)) return;
  const current = String(state?.[side]?.goal ?? "");
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · ${side === "gm" ? "GM / Opposition" : "Ranger"} Conflict Goal`, resizable: true }, modal: false, rejectClose: false,
    content: `<div class="rg-conflict-goal-editor"><h3>${side === "gm" ? "GM / Opposition Goal" : "Ranger Goal"}</h3><p>Write what this side wants to achieve if it wins the Conflict.</p><textarea name="goal" rows="5" placeholder="What are you fighting for?">${esc(current)}</textarea></div>`,
    buttons: [{ action: "save", label: "Save Goal", icon: "fa-solid fa-floppy-disk", default: true, callback: (_e,b) => String(b.form?.elements?.goal?.value ?? "").trim() }, { action: "cancel", label: "Cancel", callback: () => null }]
  });
  if (result === null) return;
  if (!result) return ui.notifications.warn("Realm Guard: A Conflict Goal cannot be empty.");
  if (game.user?.isGM) {
    const next = clone(state);
    next[side].goal = result;
    next[side].goalReady = true;
    next.log.push(`${side === "gm" ? "GM / Opposition" : "Rangers"} Goal saved and marked Ready.`);
    if (next.gm.goalReady && next.ranger.goalReady) {
      next.stage = "disposition";
      next.log.push("Both Goals saved. Starting Disposition begins.");
    }
    await setPublicState(next);
  } else {
    game.socket.emit(SOCKET_CHANNEL, { type: "conflict-intent", intent: "setRangerGoal", conflictId: state.id, senderId: game.user.id, payload: { goal: result } });
  }
}

async function setConflictGoalReady(side, state) {
  if (state.stage !== "goals" || !state?.[side]?.goal) return;
  if (side === "gm" && !game.user?.isGM) return;
  if (side === "ranger" && !canCaptainControl(state)) return;
  if (!game.user?.isGM && side === "ranger") {
    game.socket.emit(SOCKET_CHANNEL, { type: "conflict-intent", intent: "rangerGoalReady", conflictId: state.id, senderId: game.user.id, payload: {} });
    return;
  }
  const next = clone(state); next[side].goalReady = true; next.log.push(`${side === "gm" ? "GM" : "Rangers"} marked Goal ready.`);
  if (next.gm.goalReady && next.ranger.goalReady) { next.stage = "disposition"; next.log.push("Goals locked. Starting Disposition begins."); }
  await setPublicState(next);
}

async function gmApplyRangerGoal(message, state, ready = false) {
  const captain = actorById(state.ranger.captainId); const sender = game.users.get(message.senderId);
  if (!sender || !captain?.testUserPermission(sender, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) || state.stage !== "goals") return;
  const next = clone(state);
  if (!ready) {
    const goal = String(message.payload?.goal ?? "").trim(); if (!goal) return;
    next.ranger.goal = goal;
    next.ranger.goalReady = true;
    next.log.push("Ranger Goal saved and marked Ready.");
  } else {
    // Backward-compatible intent from an older open client. v1.0.8.42 does not require this click.
    if (!next.ranger.goal) return; next.ranger.goalReady = true;
  }
  if (next.gm.goalReady && next.ranger.goalReady) { next.stage = "disposition"; next.log.push("Both Goals saved. Starting Disposition begins."); }
  await setPublicState(next);
}

async function lockPlan(side, state) {
  const plan = planFor(side, state).filter(Boolean).slice(0, 3);
  if (plan.length !== 3 || plan.some(p => !ACTIONS.includes(p.action))) return ui.notifications.warn("Realm Guard: Choose all three action cards before locking.");
  if (side === "gm") {
    if (!game.user?.isGM || state.stage !== "gmPlan") return;
    const gmActor = actorById(state.gm.actorId);
    const p = privateState(); p.conflictId = state.id; p.gmPlan = plan.map(x => ({ action: x.action, actorId: state.gm.actorId, weaponId: validateWeaponId(gmActor, state, "gm", x.weaponId ?? weaponDraftFor(gmActor, state, "gm")) })); await setPrivateState(p);
    lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), gmPlan: clone(p.gmPlan) });
    const next = clone(state);
    next.weaponIds = { ...(next.weaponIds ?? {}), [state.gm.actorId]: validateWeaponId(gmActor, state, "gm", weaponDraftFor(gmActor, state, "gm")) };
    next.locks.gm = true; next.stage = "rangerPlan"; next.log.push(`Exchange ${next.exchange}: GM cards locked.`); await setPublicState(next);
    return;
  }
  if (!canCaptainControl(state) || state.stage !== "rangerPlan") return;
  const validated = validateRangerSequence(plan, state.ranger.participantIds, state.actionCounts, state.lastRangerActorId);
  if (!validated.ok) return ui.notifications.warn(`Realm Guard: ${validated.reason}`);
  const rangerWeaponIds = Object.fromEntries((state.ranger.participantIds ?? []).map(actorId => {
    const actor = actorById(actorId);
    return [actorId, validateWeaponId(actor, state, "ranger", weaponDraftFor(actor, state, "ranger"))];
  }));
  const validatedPlan = plan.map(entry => {
    const actor = actorById(entry.actorId);
    return { ...entry, weaponId: validateWeaponId(actor, state, "ranger", entry.weaponId ?? rangerWeaponIds[entry.actorId] ?? "") };
  });
  if (game.user?.isGM) {
    const p = privateState(); p.conflictId = state.id; p.rangerPlan = validatedPlan; await setPrivateState(p);
    lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), rangerPlan: clone(validatedPlan) });
    const next = clone(state); next.weaponIds = { ...(next.weaponIds ?? {}), ...rangerWeaponIds }; next.locks.ranger = true; next.stage = "ready"; next.pendingActionCounts = validated.counts; next.pendingLastRangerActorId = validated.lastActorId; next.log.push(`Exchange ${next.exchange}: Ranger cards locked.`); await setPublicState(next);
    await revealCurrentAction(next);
  } else {
    game.socket.emit(SOCKET_CHANNEL, { type: "conflict-intent", intent: "submitRangerPlan", conflictId: state.id, senderId: game.user.id, payload: { plan: validatedPlan, weaponIds: rangerWeaponIds } });
    ui.notifications.info("Realm Guard: Ranger action cards sent to the GM and locked.");
  }
}

async function gmHandleRangerPlan(message, state) {
  const captain = actorById(state.ranger.captainId);
  const sender = game.users.get(message.senderId);
  if (!sender || !captain?.testUserPermission(sender, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
  if (state.stage !== "rangerPlan" || state.id !== message.conflictId) return;
  const plan = Array.isArray(message.payload?.plan) ? message.payload.plan.slice(0, 3) : [];
  if (plan.length !== 3 || plan.some(entry => !ACTIONS.includes(entry?.action))) return;
  const validated = validateRangerSequence(plan, state.ranger.participantIds, state.actionCounts, state.lastRangerActorId);
  if (!validated.ok) return;
  const weaponIds = Object.fromEntries((state.ranger.participantIds ?? []).map(actorId => {
    const actor = actorById(actorId);
    return [actorId, validateWeaponId(actor, state, "ranger", message.payload?.weaponIds?.[actorId] ?? "")];
  }));
  const validatedPlan = plan.map(entry => {
    const actor = actorById(entry.actorId);
    return { ...entry, weaponId: validateWeaponId(actor, state, "ranger", entry.weaponId ?? weaponIds[entry.actorId] ?? "") };
  });
  const p = privateState(); p.conflictId = state.id; p.rangerPlan = validatedPlan; await setPrivateState(p);
  lockedPlanCache.set(state.id, { ...(lockedPlanCache.get(state.id) ?? {}), rangerPlan: clone(validatedPlan) });
  const next = clone(state); next.weaponIds = { ...(next.weaponIds ?? {}), ...weaponIds }; next.locks.ranger = true; next.stage = "ready"; next.pendingActionCounts = validated.counts; next.pendingLastRangerActorId = validated.lastActorId; next.log.push(`Exchange ${next.exchange}: Ranger cards locked.`); await setPublicState(next);
  await revealCurrentAction(next);
}

function sideHasMissile(actor, state, side, weaponId = null) {
  const weapon = selectedConflictWeapon(actor, state, side, weaponId);
  return weapon?.kind === "gear" && ["bow", "sling"].includes(normalizedGearName(weapon.item));
}
function gearActionModifiers(actor, action, state, side, weaponId = null) {
  const selected = selectedConflictWeapon(actor, state, side, weaponId);
  let dice = 0, conditionalSuccess = 0, successPenalty = 0; const notes = [];
  if (!selected) {
    return { dice: -1, conditionalSuccess: 0, successPenalty: 0, notes: [`Unarmed / no valid Conflict Weapon or Tool −1D`], hasSword: false, swordAction: "", requirement: "", toolName: "Unarmed" };
  }
  if (selected.kind === "tool") {
    const tool = selected.tool ?? {};
    const applies = tool.action === "any" || tool.action === action;
    if (applies && tool.effect === "dice") dice += Number(tool.value ?? 0);
    if (applies && tool.effect === "success") {
      const value = Number(tool.value ?? 0);
      if (value > 0) conditionalSuccess += value;
      if (value < 0) successPenalty += Math.abs(value);
    }
    notes.push(`${selected.name}${applies && tool.effect !== "none" && Number(tool.value ?? 0) ? ` ${Number(tool.value) > 0 ? "+" : ""}${Number(tool.value)}${tool.effect === "dice" ? "D" : "s"}` : ""}${tool.special ? ` · ${tool.special}` : ""}`);
    return { dice, conditionalSuccess, successPenalty, notes, hasSword: false, swordAction: "", requirement: String(tool.requirement ?? ""), toolName: selected.name };
  }
  const weapon = selected.item;
  const names = new Set(weapon ? [normalizedGearName(weapon)] : []);
  if (names.has("shield") && action === "defend") { dice += 2; notes.push("Shield +2D Defend"); }
  if (names.has("halberd")) {
    if (["attack", "defend"].includes(action)) { dice += 1; notes.push("Halberd +1D"); }
    if (["feint", "maneuver"].includes(action)) { dice -= 1; notes.push("Halberd -1D"); }
  }
  if ((names.has("whip") || names.has("hook and line"))) {
    if (action === "maneuver") { dice += 1; conditionalSuccess += 1; notes.push("Whip +1D / +1s successful Maneuver"); }
    if (action === "attack") { dice -= 1; notes.push("Whip -1D Attack"); }
  }
  if (names.has("spear")) {
    if (action === "defend") { dice += 1; notes.push("Spear +1D Defend"); }
    if (action === "feint") { conditionalSuccess += 1; notes.push("Spear +1s successful Feint"); }
  }
  if (names.has("staff") && action === "feint") { dice += 1; notes.push("Staff +1D Feint"); }
  if (names.has("bow") && action === "maneuver") { dice += 2; notes.push("Bow +2D Maneuver"); }
  if (names.has("sling") && action === "maneuver") { dice += 1; notes.push("Sling +1D Maneuver"); }
  if (names.has("axe")) {
    if (action === "attack") { conditionalSuccess += 1; notes.push("Axe +1s successful Attack"); }
    if (["defend", "feint"].includes(action)) { dice -= 1; notes.push("Axe -1D"); }
  }
  const swordAction = String(state.effects?.[side]?.swordActions?.[actor?.id] ?? state.effects?.[side]?.swordAction ?? "");
  if (names.has("sword") && swordAction === action) { dice += 1; notes.push(`Sword Useful +1D ${actionLabel(action)}`); }
  return { dice, conditionalSuccess, successPenalty, notes, hasSword: names.has("sword"), swordAction, requirement: "", toolName: weapon?.name ?? "Gear" };
}

function eligibleActionRoles(actor, state, side, action) {
  const lockedLoreAction = String(state?.loreMasterActions?.[actor?.id] ?? "");
  const roleAllowed = role => String(role?.name ?? "").toLowerCase() !== "lore master" || !lockedLoreAction || lockedLoreAction === action;
  let choices = [];
  // Realm Guard creature/NPC examples sometimes substitute Nature or a creature-specific trained
  // Skill for an action. Give the GM that adjudication space instead of forcing one generic pool.
  if (side === "gm" && state.type === "fightCreature" && actor?.type === "npc") {
    choices = allTrainedRoles(actor).filter(roleAllowed).map(r => ({ id: r.id, name: r.name, rating: Number(r.system.rating ?? 0), kind: "role" }));
  } else {
    const names = CONFLICT_ACTION_SKILLS[state.type]?.[action] ?? ["*"];
    if (names.includes("*")) choices = allTrainedRoles(actor).filter(roleAllowed).map(r => ({ id: r.id, name: r.name, rating: Number(r.system.rating ?? 0), kind: "role" }));
    else {
      const lower = new Set(names.map(n => n.toLowerCase()));
      choices = actor.items.filter(i => i.type === "role" && lower.has(String(i.name).toLowerCase()) && roleAllowed(i)).map(r => ({ id: r.id, name: r.name, rating: Number(r.system.rating ?? 0), kind: "role" }));
    }
  }
  // Realm Guard permits Dunadan Nature to stand in for a typical ability when a descriptor
  // genuinely fits the fiction. The table/GM must validate the descriptor; this is not an
  // Acting Against Nature shortcut.
  const nature = Number(actor?.system?.attributes?.nature?.value ?? 0);
  if (nature > 0) choices.push({ id: "@nature", name: "Nature", label: "Nature (descriptor applies)", rating: nature, kind: "ability", key: "nature", allowDoubleTap: true });
  const roles = dedupeRoleChoices(choices.filter(choice => choice.id !== "@nature"));
  const natureChoice = choices.find(choice => choice.id === "@nature");
  return natureChoice ? [...roles, natureChoice] : roles;
}

async function openPoolDialog({ actor, title, choices, temporaryDice = 0, gear = null, participants = [], side = "ranger", allowSwordChoice = false, state = null, action = "", maxHelpers = null, allowTapNature = true, baseAbilityHint = "will" }) {
  choices = dedupeRoleChoices(choices.filter(choice => choice.id !== "@nature")).concat(choices.filter(choice => choice.id === "@nature").slice(0,1));
  if (!choices.length) return ui.notifications.warn(`Realm Guard: ${actor.name} has no eligible Skill or Ability for this conflict action.`);
  const roleOptions = choices.map(c => {
    const untrained = c.kind === "role" && Number(c.rating ?? 0) <= 0;
    const bl = untrained ? beginnerAbilityKey(actor, c, baseAbilityHint).toUpperCase() : "";
    const directNature = c.id === "@nature" || String(c.key ?? "") === "nature";
    const help = directNature
      ? (c.allowDoubleTap === false
          ? "Nature is the direct roll source here, but its descriptors do not apply; Double-Tap Nature is therefore unavailable for this choice."
          : "Use Nature directly because a relevant Nature descriptor applies. If you also spend 1 Persona to add Nature again, that is Double-Tap Nature and is legal only within the descriptors.")
      : (untrained ? `This Skill is untrained. Conflict Beginner's Luck uses ${bl}, halves the supported pre-Persona pool and rounds up.` : `Use ${c.label ?? c.name} as the trained Conflict Skill for this test.`);
    return `<option value="${c.id}" data-rg-help="${esc(help)}">${esc(c.label ?? c.name)} · ${untrained ? `UNTRAINED · BL ${bl}` : `${c.rating}D`}</option>`;
  }).join("");
  const traitOptions = actor.traits?.map(t => { const status = traitPositiveStatus(actor, t); const level = Number(t.system.rating ?? 0); const stateLabel = level === 3 ? "+1s · always" : status.available ? `+1D · ${status.remaining}/${status.limit} left` : "+1D · USED"; return `<option value="${t.id}">${esc(t.name)} · L${level} · ${stateLabel}</option>`; }).join("") ?? "";
  const wiseOptions = actor.wises?.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join("") ?? "";
  const tokenById = new Map();
  for (const choice of choices) {
    const choiceIsSkill = choice.id !== "@nature" && choice.kind !== "ability";
    for (const token of tokenPowerOptionViews(actor, choice.name, { isSkill: choiceIsSkill })) if (!tokenById.has(token.id)) tokenById.set(token.id, token);
  }
  const tokenOptions = [...tokenById.values()].sort((a, b) => a.name.localeCompare(b.name));
  const tokenBlock = tokenOptions.length ? `<label>Token of Power <select name="tokenPowerId"><option value="">None</option>${tokenOptions.map(t => `<option value="${t.id}" ${t.disabled ? "disabled" : ""}>${esc(t.label)}</option>`).join("")}</select></label><small class="rg-token-conflict-note"><i class="fa-solid fa-gem"></i> Skill-linked Tokens must match the selected Skill/Ability. Manual effects remain table-adjudicated.</small>` : "";
  const talentById = new Map();
  for (const choice of choices) {
    const choiceIsSkill = choice.id !== "@nature" && choice.kind !== "ability";
    for (const talent of talentOptionViews(actor, choice.name, { isSkill: choiceIsSkill, contextKey: state?.id ?? "" })) if (!talentById.has(talent.id)) talentById.set(talent.id, talent);
  }
  const talentOptions = [...talentById.values()].sort((a, b) => a.name.localeCompare(b.name));
  const talentBlock = talentOptions.length ? `<label>Talent <select name="talentId"><option value="">None</option>${talentOptions.map(t => `<option value="${t.id}" ${t.disabled ? "disabled" : ""}>${esc(t.label)}</option>`).join("")}</select></label><small class="rg-talent-conflict-note"><i class="fa-solid fa-sparkles"></i> Talent uses are committed only when the roll is made.</small>` : "";
  const helperBlocks = side === "ranger" ? participants.filter(id => id !== actor.id).map(id => {
    const h = actorById(id); if (!h || conditionActive(h, "Afraid")) return "";
    return `<label class="rg-conflict-helper"><input type="checkbox" name="helper" value="${id}"> ${esc(h.name)} +1D Help</label>`;
  }).join("") : "";
  const sword = allowSwordChoice && gear?.hasSword && !gear.swordAction ? `<label><input type="checkbox" name="lockSword"> Use Sword's +1D on ${esc(actionLabel(action))} for the rest of this fight</label>` : "";
  const natureCurrent = Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0));
  const personaAvailable = Math.max(0, Number(actor.system.resources?.persona?.value ?? 0));
  const tapNature = allowTapNature && natureCurrent > 0 ? `<fieldset class="rg-conflict-tap-nature ${personaAvailable < 1 ? "is-unavailable" : "is-available"}" data-rg-help="Tap Nature is legal on Conflict Skill/Ability tests when the character has current Nature and can pay 1 Persona. If Nature itself is the roll source, adding Nature again is Double-Tap Nature and requires acting within the Nature descriptors. Resources, Circles and non-roll Fixed/Manual methods are excluded." data-rg-help-title="Tap / Double-Tap Nature"><legend>Tap Nature</legend><label class="rg-conflict-inline-choice"><input type="checkbox" name="tapNature" ${personaAvailable < 1 ? "disabled" : ""}> Add current Nature (+${natureCurrent}D), costs 1 Persona</label><label>Nature scope <select name="natureScope"><option value="within">Within descriptors</option><option value="against">Against descriptors</option></select></label><small>${personaAvailable < 1 ? "Unavailable: this character has no Persona to pay the Tap Nature cost. " : `Available: ${personaAvailable} Persona. `}For Beginner's Luck, Tap Nature is added after halving. If Nature itself is selected, this becomes Double-Tap Nature and is legal only Within descriptors. Nature tax is resolved when the Conflict test resolves.</small></fieldset>` : "";
  const content = `<div class="rg-conflict-roll-dialog"><h3>${esc(title)}</h3>
    <label>Skill / Ability <select name="source">${roleOptions}</select><small>Untrained Skills automatically use Beginner's Luck instead of becoming a 0D dead-end.</small></label>
    <div class="rg-roll-dialog-grid rg-conflict-core-fields"><label><span>Modifier</span><input type="number" name="modifier" value="0"><small>Situational dice modifier.</small></label><label><span>Extra Dice</span><input type="number" name="extra" min="0" value="0"><small>Manual bonus dice only.</small></label></div>
    ${temporaryDice ? `<p class="rg-conflict-tactical"><b>Tactical modifier:</b> ${temporaryDice > 0 ? "+" : ""}${temporaryDice}D from Maneuver.</p>` : ""}
    ${gear?.notes?.length ? `<p class="rg-conflict-gear"><b>Conflict Weapon / Tool:</b> ${gear.notes.map(esc).join(" · ")}</p>` : ""}
    ${gear?.requirement ? `<label class="rg-conflict-requirement"><span><input type="checkbox" name="weaponRequirementMet" checked> Requirement met</span><small>${esc(gear.requirement)} · if not met, the tool grants no bonus.</small></label>` : ""}
    ${choices.some(c => c.id === "@nature") ? `<p class="rg-conflict-nature"><b>Nature:</b> choose it only when a relevant Nature descriptor genuinely applies.</p>` : ""}
    ${sword}
    ${helperBlocks ? `<fieldset><legend>Teamwork</legend>${helperBlocks}${Number.isFinite(maxHelpers) ? `<small>Up to ${maxHelpers} patrol-mates may help this action.</small>` : ""}</fieldset>` : ""}
    ${tapNature}
    <fieldset><legend>Resources / Character</legend><label>Persona dice <select name="persona" ${personaAvailable < 1 ? "disabled" : ""}>${[0,1,2,3].filter(n => n <= personaAvailable).map(n => `<option value="${n}">${n} Persona · +${n}D</option>`).join("") || `<option value="0">0 Persona · +0D</option>`}</select></label><label>Trait <select name="traitId"><option value="">None</option>${traitOptions}</select></label><small>Trait benefits use normal session limits: L1 +1D once, L2 +1D twice, L3 +1s when relevant.</small><label>Wise <select name="wiseId"><option value="">None</option>${wiseOptions}</select></label>${tokenBlock}${talentBlock}</fieldset>
    <small>Fate is offered after the roll when a 6 is present. Conflict rolls do not spend Players' Turn Free Tests/Checks.</small>
  </div>`;
  return await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · ${title}`, resizable: true }, content, modal: false, rejectClose: false,
    buttons: [
      { action: "roll", label: "Roll", icon: "fa-solid fa-dice", default: true, callback: (_e, b) => ({
        sourceId: b.form?.elements?.source?.value || choices[0].id,
        modifier: Number(b.form?.elements?.modifier?.value ?? 0), extra: Math.max(0, Number(b.form?.elements?.extra?.value ?? 0)),
        persona: Math.max(0, Math.min(3, Number(b.form?.elements?.persona?.value ?? 0))), traitId: b.form?.elements?.traitId?.value || null, wiseId: b.form?.elements?.wiseId?.value || null, tokenPowerId: b.form?.elements?.tokenPowerId?.value || null, talentId: b.form?.elements?.talentId?.value || null,
        helperIds: (() => { const ids = [...(b.form?.querySelectorAll('input[name="helper"]:checked') ?? [])].map(el => el.value); return Number.isFinite(maxHelpers) ? ids.slice(0, maxHelpers) : ids; })(), lockSword: Boolean(b.form?.elements?.lockSword?.checked),
        tapNature: Boolean(b.form?.elements?.tapNature?.checked), natureScope: String(b.form?.elements?.natureScope?.value ?? "within"), weaponRequirementMet: b.form?.elements?.weaponRequirementMet ? Boolean(b.form.elements.weaponRequirementMet.checked) : true
      }) },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
}

async function executeActorPool({ actor, source, modifier = 0, extra = 0, persona = 0, traitId = null, wiseId = null, tokenPowerId = null, talentId = null, helperIds = [], temporaryDice = 0, gear = { dice: 0, conditionalSuccess: 0, successPenalty: 0, notes: [] }, label = "Conflict", contextKey = "", tapNature = false, natureScope = "within", baseAbilityHint = "will" }) {
  const personaDice = Math.max(0, Math.min(3, Math.trunc(Number(persona ?? 0))));
  const isNature = source.id === "@nature" || source.kind === "ability";
  const role = !isNature ? actor.items.get(source.id) : null;
  const trainedBase = source.id === "@nature" ? Number(source.overrideRating ?? source.rating ?? actor.system.attributes?.nature?.value ?? 0) : (source.kind === "ability" ? Number(source.rating ?? actor.system.attributes?.[source.key]?.value ?? 0) : Number(role?.system.rating ?? source.rating ?? 0));
  const beginnerLuck = !isNature && trainedBase <= 0;
  if (beginnerLuck && conditionActive(actor, "Afraid")) return ui.notifications.warn("Realm Guard: Afraid characters cannot use Beginner's Luck in a Conflict.");
  const blAbilityKey = beginnerLuck ? beginnerAbilityKey(actor, source, baseAbilityHint) : "";
  const blAbilityBase = beginnerLuck ? Math.max(0, Number(actor.system.attributes?.[blAbilityKey]?.value ?? 0)) : 0;
  if (beginnerLuck && blAbilityBase <= 0) return ui.notifications.warn(`Realm Guard: ${blAbilityKey === "health" ? "Health" : "Will"} is 0; Beginner's Luck cannot be used.`);
  const power = actor._tokenPowerUse?.(tokenPowerId, source.name, { isSkill: !isNature }) ?? null;
  if (tokenPowerId && !power) return ui.notifications.warn("Realm Guard: That Token of Power is spent, unavailable, or does not match the selected conflict Skill/use.");
  const talentUse = resolveTalentUse(actor, talentId, source.name, { isSkill: !isNature, contextKey });
  if (talentId && !talentUse) return ui.notifications.warn("Realm Guard: That Talent is used, unavailable, or does not match the selected conflict Skill/Ability.");
  const conditionData = actor._activeConditionRollData?.(source.name, { isSkill: !isNature }) ?? { dice: 0, active: [] };
  const assist = actor._rollAssist?.({ traitId, wiseId, traitMode: "help", versus: false }) ?? { traitDice: 0, trait: null, wise: null };
  const helpDice = helperIds.length;
  const fresh = beginnerLuck ? (conditionData.active ?? []).find(c => String(c.name ?? "").trim().toLowerCase() === "fresh") : null;
  const freshDice = fresh ? Math.max(0, Number(fresh.system?.rollModifier ?? 1)) : 0;
  const preHalfConditionDice = Number(conditionData.dice ?? 0) - freshDice;
  const directNatureSource = source.id === "@nature" || String(source.key ?? "") === "nature";
  if (tapNature && directNatureSource && source.allowDoubleTap === false) return ui.notifications.warn("Realm Guard: Double-Tap Nature is unavailable because the Nature descriptors do not apply to this direct Nature test.");
  if (tapNature && directNatureSource && String(natureScope || "within") !== "within") return ui.notifications.warn("Realm Guard: Double-Tapping Nature is only available while acting within Nature descriptors.");
  const natureTapDice = tapNature ? Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0)) : 0;
  const totalPersonaCost = personaDice + (tapNature ? 1 : 0);
  const personaAvailable = Math.max(0, Number(actor.system.resources?.persona?.value ?? 0));
  if (totalPersonaCost > personaAvailable) return ui.notifications.warn(`Realm Guard: This conflict roll requires ${totalPersonaCost} Persona.`);

  const commonPre = Number(modifier) + Number(extra) + Number(temporaryDice) + Number(gear.dice ?? 0) + Number(assist.traitDice ?? 0) + Number(power?.diceBonus ?? 0) + Number(talentUse?.diceBonus ?? 0) + helpDice;
  let preHalf = null, beginnerDice = null;
  let pool;
  if (beginnerLuck) {
    preHalf = Math.max(0, blAbilityBase + commonPre + preHalfConditionDice);
    beginnerDice = Math.ceil(preHalf / 2);
    pool = Math.max(0, beginnerDice + personaDice + freshDice + natureTapDice);
  } else {
    pool = Math.max(0, trainedBase + commonPre + Number(conditionData.dice ?? 0) + personaDice + natureTapDice);
  }
  if (pool < 1) return ui.notifications.warn("Realm Guard: Conflict dice pool is 0 after all modifiers.");
  if (totalPersonaCost) {
    const spent = await actor.spendTrackedResource?.("persona", totalPersonaCost, { reason: `${label} conflict roll${tapNature ? " · Tap Nature" : ""}` });
    if (spent && !spent.ok) return ui.notifications.warn(`Realm Guard: ${spent.reason}`);
  }
  const roll = await new Roll(`${pool}d6`).evaluate();
  await actor._commitTraitBenefit?.(assist);
  await actor._commitTokenPowerUse?.(power);
  if (talentUse?.talent) await commitTalentUse(talentUse);
  let baseFaces = roll.dice.flatMap(d => d.results.map(r => r.result));
  const wise = assist.wise ?? (wiseId ? actor.items.get(wiseId) : null);
  const wiseResult = actor._applyWiseReroll ? await actor._applyWiseReroll(baseFaces, wise) : { faces: baseFaces, rerollFaces: [], rerolledIndexes: [] };
  baseFaces = wiseResult.faces;
  const tokenResult = actor._applyTokenPowerReroll ? await actor._applyTokenPowerReroll(baseFaces, power, wiseResult.rerolledIndexes ?? []) : { faces: baseFaces, rerollFaces: [], rerolledIndexes: [] };
  baseFaces = tokenResult.faces;
  const sixes = baseFaces.filter(v => v === 6).length;
  let fateFaces = [], fateSpent = false;
  if (sixes > 0 && Number(actor.system.resources?.fate?.value ?? 0) > 0 && actor._askFateAfterSixes) {
    fateSpent = await actor._askFateAfterSixes({ roleName: `${label} · ${source.name}`, sixCount: sixes });
    if (fateSpent) { fateFaces = await actor._explodeSixes(baseFaces); await actor.spendTrackedResource?.("fate", 1, { reason: `${label} conflict Fate` }); }
  }
  const faces = baseFaces.concat(fateFaces);
  return {
    actorId: actor.id, sourceId: source.id, roleId: isNature ? null : source.id, abilityKey: isNature ? (source.key ?? "nature") : null, skillName: source.name,
    base: beginnerLuck ? blAbilityBase : trainedBase, pool, faces, beginnerLuck, beginnerAbilityKey: blAbilityKey, preHalf, beginnerDice,
    rerollFaces: wiseResult.rerollFaces ?? [], tokenPowerRerollFaces: tokenResult.rerollFaces ?? [], fateFaces, fateSpent, personaSpent: totalPersonaCost,
    successes: faces.filter(v => v >= 4).length, conditionalSuccess: Math.max(0, Number(gear.conditionalSuccess ?? 0)), successPenalty: Math.max(0, Number(gear.successPenalty ?? 0)),
    traitSuccessLevel3: Number(assist?.traitStatus?.level ?? 0) === 3 && assist?.traitMode === "help", traitName: assist?.trait?.name ?? "",
    tokenPowerId: power?.token?.id ?? null, tokenPowerName: power?.token?.name ?? "", tokenPowerLevel: power?.level ?? 0, tokenPowerManual: Boolean(power?.manual), tokenPowerLink: power?.linkSummary ?? "",
    talentId: talentUse?.talent?.id ?? null, talentName: talentUse?.talent?.name ?? "", talentDice: Number(talentUse?.diceBonus ?? 0), talentManual: Boolean(talentUse?.manual), talentEffect: talentUse?.talent ? talentEffectSummary(talentUse.talent) : "",
    helperIds, helpDice, modifier: Number(modifier), extra: Number(extra), temporaryDice: Number(temporaryDice), gearDice: Number(gear.dice ?? 0), gearNotes: gear.notes ?? [], conditionDice: Number(conditionData.dice ?? 0), traitDice: Number(assist.traitDice ?? 0),
    natureTap: Boolean(tapNature), natureTapDice, natureScope: String(natureScope || "within")
  };
}

async function chooseGmDispositionMethod(actor, state, defaultBaseKey) {
  const nature = Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0));
  return await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Opposition Starting Disposition", resizable: true }, modal: false, rejectClose: false,
    content: `<div class="rg-disposition-method"><h3>How is opposition Disposition generated?</h3><label>Method <select name="method" data-rg-help-label="Starting Disposition Method"><option value="calculated">Calculated Skill roll + Base Ability</option><option value="nature" ${nature ? "" : "disabled"}>Nature roll + Nature</option><option value="fixed">Fixed creature Disposition + supporting NPCs</option><option value="manual">Manual final Disposition</option></select></label><label>Fixed / Manual value <input type="number" name="fixed" min="1" max="999" value="1"></label><label>Supporting NPCs / mooks <input type="number" name="helpers" min="0" max="99" value="0"><small>Fixed method: +1 Disposition per supporting NPC. Manual uses the exact entered final value.</small></label><label class="rg-conflict-inline-choice"><input type="checkbox" name="natureHalf"> Nature descriptors do not apply — use half Nature for both roll pool and Nature base</label><p><small>Calculated uses the normal Conflict Skill and ${esc(defaultBaseKey)} base. Untrained Skills automatically use Beginner's Luck.</small></p></div>`,
    buttons: [{ action: "continue", label: "Continue", default: true, callback: (_e,b) => ({ method: String(b.form?.elements?.method?.value ?? "calculated"), fixed: Math.max(1, Number(b.form?.elements?.fixed?.value ?? 1)), helpers: Math.max(0, Number(b.form?.elements?.helpers?.value ?? 0)), natureHalf: Boolean(b.form?.elements?.natureHalf?.checked) }) }, { action: "cancel", label: "Cancel", callback: () => null }]
  });
}

async function postStartingDispositionChat(state, payload) {
  const sideLabel = payload.side === "gm" ? "GM / Opposition" : "Rangers";
  const roll = payload.roll;
  const method = payload.method ?? "calculated";
  const penaltyText = payload.penaltyNames?.length ? ` · Conditions −${payload.penalty}: ${payload.penaltyNames.map(esc).join(", ")}` : "";
  let math = "";
  if (roll) {
    const bl = roll.beginnerLuck ? `<br><b>Beginner's Luck:</b> ${esc((roll.beginnerAbilityKey || "will").toUpperCase())} pre-pool ${Number(roll.preHalf ?? 0)}D → half/round up ${Number(roll.beginnerDice ?? 0)}D` : "";
    const tap = roll.natureTap ? ` · Tap Nature +${Number(roll.natureTapDice ?? 0)}D` : "";
    const rolled = Number(roll.successes ?? 0);
    const traitS = roll.traitSuccessLevel3 ? ` · ${esc(roll.traitName || "Trait")} +1s` : "";
    const effective = Number(payload.dispositionRollSuccesses ?? rolled + (roll.traitSuccessLevel3 ? 1 : 0));
    math = `<div class="rg-disposition-breakdown"><div><b>Roll Pool</b><strong>${Number(roll.pool ?? 0)}D</strong></div><div><b>Rolled Successes</b><strong>${rolled}</strong></div><div><b>Effective Successes</b><strong>${effective}</strong></div><div><b>Base ${esc(String(payload.baseKey || "ability").toUpperCase())}</b><strong>+${Number(payload.baseValue ?? 0)}</strong></div></div><div class="rg-disposition-dice">${diceFacesHtml(roll.faces ?? [])}</div>${tap ? `<p class="rg-disposition-note">${tap.replace(/^ · /, "")}</p>` : ""}${traitS ? `<p class="rg-disposition-note">${traitS.replace(/^ · /, "")}</p>` : ""}${penaltyText ? `<p class="rg-disposition-note">${penaltyText.replace(/^ · /, "")}</p>` : ""}${bl ? `<p class="rg-disposition-note">${bl.replace(/^<br>/, "")}</p>` : ""}`;
  } else {
    math = `<div class="rg-disposition-breakdown"><div><b>${method === "manual" ? "Manual final" : "Fixed base"}</b><strong>${Number(payload.fixedBase ?? payload.disposition ?? 0)}</strong></div>${method === "fixed" ? `<div><b>Supporting NPCs</b><strong>+${Number(payload.helperBonus ?? 0)}</strong></div>` : ""}${payload.penalty ? `<div><b>Condition penalty</b><strong>−${Number(payload.penalty)}</strong></div>` : ""}</div>${payload.penaltyNames?.length ? `<p class="rg-disposition-note">Conditions: ${payload.penaltyNames.map(esc).join(", ")}</p>` : ""}`;
  }
  await ChatMessage.create({ content: `<div class="realm-guard rg-conflict-chat rg-disposition-chat rg-conflict-readable-card"><div class="rg-custom-chat-tag">STARTING DISPOSITION · ${esc(sideLabel.toUpperCase())}</div><h3>${esc(state.name)} · ${esc(conflictTypeLabel(state.type))}</h3><div class="rg-conflict-method-label">Method: <b>${esc(String(method).replace(/^./, c => c.toUpperCase()))}</b></div>${math}<div class="rg-disposition-total"><small>STARTING DISPOSITION</small><strong>${Number(payload.disposition ?? 0)}</strong></div></div>` });
}

async function rollDisposition(side, state) {
  if (state.stage !== "disposition") return;
  if (side === "gm" && !game.user?.isGM) return;
  if (side === "ranger" && !canCaptainControl(state)) return;
  const actor = side === "gm" ? actorById(state.gm.actorId) : actorById(state.ranger.captainId);
  if (!actor) return;
  let baseKey = state.type === "other" ? (state.otherBaseKey || "health") : (CONFLICT_TYPES[state.type]?.disposition?.base ?? "health");
  let method = "calculated", methodOptions = null;
  if (side === "gm") {
    methodOptions = await chooseGmDispositionMethod(actor, state, baseKey);
    if (!methodOptions) return;
    method = methodOptions.method;
  }
  if (["fixed", "manual"].includes(method)) {
    const penaltyData = method === "manual" ? { value: 0, names: [] } : dispositionPenaltyForSide(state, side, baseKey);
    const fixedBase = Math.max(1, Number(methodOptions.fixed ?? 1));
    const helperBonus = method === "fixed" ? Math.max(0, Number(methodOptions.helpers ?? 0)) : 0;
    const disposition = method === "manual" ? fixedBase : Math.max(1, fixedBase + helperBonus - penaltyData.value);
    const payload = { side, disposition, baseKey, baseValue: 0, penalty: penaltyData.value, penaltyNames: penaltyData.names, roll: null, method, fixedBase, helperBonus };
    return gmApplyDisposition(payload, state);
  }

  let choices = [];
  let natureHalf = false;
  if (method === "nature") {
    const fullNature = Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0));
    natureHalf = Boolean(methodOptions?.natureHalf);
    const natureValue = natureHalf ? Math.ceil(fullNature / 2) : fullNature;
    if (natureValue <= 0) return ui.notifications.warn("Realm Guard: This opposition has no usable Nature.");
    choices = [{ id: "@nature", name: natureHalf ? "Nature (half — descriptors do not apply)" : "Nature", rating: natureValue, kind: "ability", key: "nature", overrideRating: natureValue, allowDoubleTap: !natureHalf }];
    baseKey = "nature";
  } else {
    const names = CONFLICT_TYPES[state.type]?.disposition?.skills ?? [];
    if (state.type === "other") choices = actor.items.filter(i => i.type === "role").map(r => ({ id: r.id, name: r.name, rating: Number(r.system.rating ?? 0), beginnerAbility: r.system.beginnerAbility, kind: "role" }));
    else {
      const wanted = new Set(names.map(n => n.toLowerCase()));
      choices = actor.items.filter(i => i.type === "role" && wanted.has(String(i.name).toLowerCase())).map(r => ({ id: r.id, name: r.name, rating: Number(r.system.rating ?? 0), beginnerAbility: r.system.beginnerAbility, kind: "role" }));
    }
    choices = dedupeRoleChoices(choices);
  }
  if (!choices.length) return ui.notifications.warn(`Realm Guard: ${actor.name} has no matching Conflict Skill. Add the canonical Skill to the NPC or use Manual/Fixed opposition Disposition.`);
  const fullBase = Number(actor.system.attributes?.[baseKey]?.value ?? 0);
  const baseValue = method === "nature" && natureHalf ? Math.ceil(fullBase / 2) : fullBase;
  const dialog = await openPoolDialog({ actor, title: `${side === "gm" ? "GM" : "Ranger"} Starting Disposition`, choices, participants: side === "ranger" ? state.ranger.participantIds : [], side, state, allowTapNature: !(method === "nature" && natureHalf), baseAbilityHint: baseKey });
  if (!dialog) return;
  const source = choices.find(c => c.id === dialog.sourceId) ?? choices[0];
  if (source?.overrideRating != null) source.rating = Number(source.overrideRating);
  const roll = await executeActorPool({ actor, source, modifier: dialog.modifier, extra: dialog.extra, persona: dialog.persona, traitId: dialog.traitId, wiseId: dialog.wiseId, tokenPowerId: dialog.tokenPowerId, talentId: dialog.talentId, helperIds: dialog.helperIds, label: "Starting Disposition", contextKey: state.id, tapNature: dialog.tapNature, natureScope: dialog.natureScope, baseAbilityHint: baseKey });
  if (!roll) return;
  if (roll.natureTap && roll.natureScope === "against") await actor._applyNatureTax?.(1, `Starting Disposition · ${state.name}`);
  const penaltyData = dispositionPenaltyForSide(state, side, baseKey);
  // Starting Disposition is an Ob 0-style successful test: Level 3 Trait +1s therefore
  // applies to the rolled successes before the full disposition base is added.
  const dispositionRollSuccesses = Number(roll.successes ?? 0) + (roll.traitSuccessLevel3 ? 1 : 0);
  const disposition = Math.max(1, baseValue + dispositionRollSuccesses - penaltyData.value);
  const payload = { side, disposition, baseKey, baseValue, penalty: penaltyData.value, penaltyNames: penaltyData.names, roll, method, natureHalf, dispositionRollSuccesses };
  if (game.user?.isGM) await gmApplyDisposition(payload, state);
  else game.socket.emit(SOCKET_CHANNEL, { type: "conflict-intent", intent: "submitDisposition", conflictId: state.id, senderId: game.user.id, payload });
}

async function gmApplyDisposition(payload, state = currentState()) {
  if (!game.user?.isGM || !state || state.stage !== "disposition") return;
  const side = payload.side; if (!["gm","ranger"].includes(side)) return;
  const next = clone(state); const d = Math.max(1, Number(payload.disposition ?? 1));
  next[side].disposition = { start: d, current: d, rolled: true, roll: payload.roll, baseKey: payload.baseKey, baseValue: payload.baseValue, penalty: payload.penalty, penaltyNames: payload.penaltyNames ?? [], method: payload.method ?? "calculated", helperBonus: payload.helperBonus ?? 0 };
  next.log.push(`${side === "gm" ? "GM" : "Rangers"} starting disposition: ${d} (${payload.method ?? "calculated"}).`);
  if (next.gm.disposition.rolled && next.ranger.disposition.rolled) next.stage = "gmPlan";
  await setPublicState(next);
  await postStartingDispositionChat(next, payload);
}

async function revealCurrentAction(state) {
  if (!game.user?.isGM || state.stage !== "ready") return;
  const p = privateState();
  const cached = lockedPlanCache.get(state.id) ?? {};
  const gmPlan = Array.isArray(p.gmPlan) && p.gmPlan.length === 3 ? p.gmPlan : cached.gmPlan;
  const rangerPlan = Array.isArray(p.rangerPlan) && p.rangerPlan.length === 3 ? p.rangerPlan : cached.rangerPlan;
  const gmEntry = gmPlan?.[state.currentIndex]; const rangerEntry = rangerPlan?.[state.currentIndex];
  if (!gmEntry?.action || !rangerEntry?.action) {
    ui.notifications.error("Realm Guard: Hidden Conflict plan data could not be recovered. The exchange was safely returned to planning instead of getting stuck.");
    const reset = clone(state); reset.stage = "gmPlan"; reset.currentIndex = 0; reset.locks = { gm: false, ranger: false }; reset.revealed = []; reset.rolls = { gm: null, ranger: null }; reset.log.push(`Exchange ${reset.exchange}: hidden plan recovery failed; planning reset.`);
    await setPrivateState({ conflictId: state.id, gmPlan: [], rangerPlan: [] }); lockedPlanCache.set(state.id, { gmPlan: [], rangerPlan: [] }); await setPublicState(reset);
    return;
  }
  const gmActor = actorById(state.gm.actorId); const rangerActor = actorById(rangerEntry.actorId);
  const gmWeaponId = validateWeaponId(gmActor, state, "gm", gmEntry.weaponId ?? "");
  const rangerWeaponId = validateWeaponId(rangerActor, state, "ranger", rangerEntry.weaponId ?? "");
  const gmMode = interactionMode(gmEntry.action, rangerEntry.action, { ownMissile: sideHasMissile(gmActor, state, "gm", gmWeaponId), opponentMissile: sideHasMissile(rangerActor, state, "ranger", rangerWeaponId) });
  const rangerMode = interactionMode(rangerEntry.action, gmEntry.action, { ownMissile: sideHasMissile(rangerActor, state, "ranger", rangerWeaponId), opponentMissile: sideHasMissile(gmActor, state, "gm", gmWeaponId) });
  const next = clone(state);
  next.revealed = [...(next.revealed ?? []).filter(r => r.index !== next.currentIndex), { index: next.currentIndex, gmAction: gmEntry.action, rangerAction: rangerEntry.action, rangerActorId: rangerEntry.actorId, gmWeaponId, rangerWeaponId, gmMode, rangerMode, resultText: "" }];
  next.rolls = { gm: gmMode === "trumped" ? { trumped: true, successes: 0 } : null, ranger: rangerMode === "trumped" ? { trumped: true, successes: 0 } : null };
  next.stage = "action";
  next.log.push(`Action ${next.currentIndex + 1}: ${actionLabel(gmEntry.action)} vs ${actionLabel(rangerEntry.action)}.`);
  await setPublicState(next);
  // If both actions are trumped (should not occur in the legal matrix), resolve defensively.
  if (next.rolls.gm?.trumped && next.rolls.ranger?.trumped) await gmResolveCurrentPair(next);
}

async function rollCurrentAction(side, state) {
  const pair = currentPair(state); if (!pair || state.stage !== "action" || !canSideRoll(state, side)) return;
  const actor = side === "gm" ? actorById(state.gm.actorId) : actorById(pair.rangerActorId); if (!actor) return;
  const action = side === "gm" ? pair.gmAction : pair.rangerAction;
  const mode = side === "gm" ? pair.gmMode : pair.rangerMode; if (mode === "trumped") return;
  const choices = eligibleActionRoles(actor, state, side, action);
  const tactical = Number(state.effects?.[side]?.nextDice ?? 0);
  const actionWeaponId = side === "gm" ? pair.gmWeaponId : pair.rangerWeaponId;
  const gear = gearActionModifiers(actor, action, state, side, actionWeaponId);
  const dialog = await openPoolDialog({ actor, title: `${actionLabel(action)} · ${mode === "versus" ? "Versus" : "Independent"}`, choices, temporaryDice: tactical, gear, participants: side === "ranger" ? state.ranger.participantIds : [], side, allowSwordChoice: ["fight", "fightCreature"].includes(state.type), state, action, maxHelpers: side === "ranger" ? 2 : null, allowTapNature: true });
  if (!dialog) return;
  if (dialog.lockSword && gear.hasSword && !gear.swordAction) gear.dice += 1;
  if (gear.requirement && !dialog.weaponRequirementMet) { gear.dice = 0; gear.conditionalSuccess = 0; gear.successPenalty = 0; gear.notes = [`${gear.toolName}: requirement not met — no bonus`]; }
  const source = choices.find(c => c.id === dialog.sourceId) ?? choices[0];
  const roll = await executeActorPool({ actor, source, modifier: dialog.modifier, extra: dialog.extra, persona: dialog.persona, traitId: dialog.traitId, wiseId: dialog.wiseId, tokenPowerId: dialog.tokenPowerId, talentId: dialog.talentId, helperIds: dialog.helperIds, temporaryDice: tactical, gear, label: actionLabel(action), contextKey: state.id, tapNature: dialog.tapNature, natureScope: dialog.natureScope });
  if (!roll) return;
  roll.lockSwordAction = dialog.lockSword ? action : "";
  const message = { side, roll };
  if (game.user?.isGM) await gmApplyActionRoll(message, state);
  else game.socket.emit(SOCKET_CHANNEL, { type: "conflict-intent", intent: "submitActionRoll", conflictId: state.id, senderId: game.user.id, payload: message });
}

async function gmApplyActionRoll(payload, state = currentState(), sender = null) {
  if (!game.user?.isGM || !state || state.stage !== "action") return;
  const side = payload.side; if (!['gm','ranger'].includes(side) || state.rolls?.[side]) return;
  const pair = currentPair(state); if (!pair) return;
  if (side === "ranger" && sender) {
    const actor = actorById(pair.rangerActorId); if (!actor?.testUserPermission(sender, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
  }
  const next = clone(state);
  if (String(payload.roll?.skillName ?? "").toLowerCase() === "lore master") {
    const actorId = payload.roll?.actorId;
    const action = side === "gm" ? pair.gmAction : pair.rangerAction;
    const locked = String(next.loreMasterActions?.[actorId] ?? "");
    if (locked && locked !== action) return ui.notifications.warn(`Realm Guard: Lore Master is already assigned to ${actionLabel(locked)} in this conflict.`);
    next.loreMasterActions = { ...(next.loreMasterActions ?? {}), [actorId]: action };
  }
  next.rolls[side] = payload.roll;
  if (payload.roll?.lockSwordAction) {
    const actorId = payload.roll?.actorId;
    next.effects[side].swordActions = { ...(next.effects[side].swordActions ?? {}) };
    if (actorId && !next.effects[side].swordActions[actorId]) next.effects[side].swordActions[actorId] = payload.roll.lockSwordAction;
  }
  // Tactical Maneuver bonuses/penalties are consumed by the next actual test.
  next.effects[side].nextDice = 0;
  await setPublicState(next);
  const latest = currentState();
  if (latest?.rolls?.gm && latest?.rolls?.ranger) await gmResolveCurrentPair(latest);
}

function independentObstacle(action, opponentAction) {
  if (action === "defend" && opponentAction === "defend") return 3;
  return 0;
}
function capDisposition(value, start) { return Math.max(0, Math.min(Math.max(0, Number(start ?? 0)), Number(value ?? 0))); }

function conflictRawSuccesses(roll) {
  return Math.max(0, Number(roll?.successes ?? 0) - Math.max(0, Number(roll?.successPenalty ?? 0)));
}
function conflictPositiveSuccessBonus(roll) {
  return Math.max(0, Number(roll?.conditionalSuccess ?? 0)) + (roll?.traitSuccessLevel3 ? 1 : 0);
}
function conflictEffectiveSuccesses(roll, threshold) {
  const raw = conflictRawSuccesses(roll);
  return raw >= Number(threshold ?? 0) ? raw + conflictPositiveSuccessBonus(roll) : raw;
}

async function recordConflictBeginnerAttempt(actor, roleId) {
  const role = actor?.items?.get?.(roleId);
  if (!role || role.type !== "role" || Number(role.system?.rating ?? 0) > 0) return false;
  const needed = Math.max(1, Number(actor.system.attributes?.nature?.maximum ?? actor.system.attributes?.nature?.value ?? 1));
  const attempts = Math.min(needed, Math.max(0, Number(role.system?.beginnerAttempts ?? 0)) + 1);
  if (attempts < needed) {
    await role.update({ "system.beginnerAttempts": attempts });
    return true;
  }
  // Conflict resolution is GM-authoritative, so complete the automatic learn here instead of
  // leaving a cross-client auto-learn request that another owner cannot legally claim.
  await role.update({
    "system.rating": 2,
    "system.beginnerAttempts": 0,
    "system.learning.passed": 0,
    "system.learning.failed": 0,
    "system.learning.passNeeded": 2,
    "system.learning.failNeeded": 1,
    "flags.realm-guard.autoLearnedAt": Date.now(),
    "flags.realm-guard.-=autoLearnRequestedBy": null
  });
  const refreshed = actor.items.get(roleId);
  if (refreshed && Number(refreshed.system?.rating ?? 0) === 2) {
    const e = foundry.utils.escapeHTML;
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="realm-guard rg-advancement-chat rg-celebration-chat rg-skill-learned-chat"><div class="rg-celebration-kicker">✦ NEW SKILL LEARNED! ✦</div><h2>Congratulations, ${e(actor.name)}!</h2><h3>${e(refreshed.name)} is now Rating 2</h3><p>Beginner's Luck in Conflict completed the learning track. Normal advancement begins now: <b>2 Pass / 1 Fail</b>.</p></div>` });
  }
  return true;
}

async function recordConflictLearning(state, roll, passed, versus) {
  if (!roll?.actorId) return;
  const sourceKey = roll.abilityKey ? `ability:${roll.abilityKey}` : roll.roleId ? `role:${roll.roleId}` : "";
  if (!sourceKey) return;
  const key = `${roll.actorId}:${sourceKey}`;
  if ((state.learningKeys ?? []).includes(key)) return;
  const actor = actorById(roll.actorId);
  if (!actor) return;
  if (roll.beginnerLuck && roll.roleId) await recordConflictBeginnerAttempt(actor, roll.roleId);
  else if (roll.abilityKey) await recordAbilityTest(actor, roll.abilityKey, Boolean(passed));
  else if (roll.roleId) await recordHelperSkillTest(actor, roll.roleId, Boolean(passed));
  state.learningKeys = [...(state.learningKeys ?? []), key];
}

async function applyConflictNatureTax(roll, { passed = false, tied = false, failureMargin = 0, label = "Conflict" } = {}) {
  if (!roll?.natureTap || tied) return null;
  const actor = actorById(roll.actorId);
  if (!actor?._applyNatureTax) return null;
  const scope = String(roll.natureScope || "within");
  let tax = 0;
  if (passed) tax = scope === "against" ? 1 : 0;
  else tax = Math.max(1, Number(failureMargin || 1));
  return tax ? await actor._applyNatureTax(tax, `${label} · Tap Nature`) : null;
}

function conflictRollDetails(roll) {
  if (!roll || roll.trumped) return [];
  const rows = [];
  rows.push(["Base", `${Number(roll.base ?? 0)}D`]);
  if (roll.beginnerLuck) rows.push(["Beginner's Luck", `${Number(roll.preHalf ?? 0)}D → ${Number(roll.beginnerDice ?? 0)}D`]);
  if (Number(roll.modifier ?? 0)) rows.push(["Modifier", `${Number(roll.modifier) > 0 ? "+" : ""}${Number(roll.modifier)}D`]);
  if (Number(roll.extra ?? 0)) rows.push(["Extra Dice", `+${Number(roll.extra)}D`]);
  if (Number(roll.helpDice ?? 0)) rows.push(["Teamwork", `+${Number(roll.helpDice)}D`]);
  if (Number(roll.temporaryDice ?? 0)) rows.push(["Maneuver", `${Number(roll.temporaryDice) > 0 ? "+" : ""}${Number(roll.temporaryDice)}D`]);
  if (Number(roll.gearDice ?? 0)) rows.push(["Weapon / Tool", `${Number(roll.gearDice) > 0 ? "+" : ""}${Number(roll.gearDice)}D`]);
  if (Number(roll.conditionDice ?? 0)) rows.push(["Conditions", `${Number(roll.conditionDice) > 0 ? "+" : ""}${Number(roll.conditionDice)}D`]);
  if (Number(roll.traitDice ?? 0)) rows.push(["Trait", `${Number(roll.traitDice) > 0 ? "+" : ""}${Number(roll.traitDice)}D${roll.traitName ? ` · ${roll.traitName}` : ""}`]);
  if (Number(roll.talentDice ?? 0) || roll.talentName) rows.push(["Talent", `${roll.talentName || "Talent"}${Number(roll.talentDice ?? 0) ? ` · +${Number(roll.talentDice)}D` : ""}`]);
  const personaDice = Math.max(0, Number(roll.personaSpent ?? 0) - (roll.natureTap ? 1 : 0));
  if (personaDice) rows.push(["Persona Dice", `+${personaDice}D`]);
  if (roll.natureTap) rows.push(["Tap Nature", `+${Number(roll.natureTapDice ?? 0)}D · ${String(roll.natureScope || "within")}`]);
  if (roll.fateSpent) rows.push(["Fate", "−1 · Open 6s"]);
  if (Number(roll.successPenalty ?? 0)) rows.push(["Success penalty", `−${Number(roll.successPenalty)}s`]);
  if (Number(roll.conditionalSuccess ?? 0)) rows.push(["Conditional success", `+${Number(roll.conditionalSuccess)}s if legal`]);
  if (roll.traitSuccessLevel3) rows.push(["Trait success", `${roll.traitName || "Trait"} · +1s if relevant`]);
  if (Array.isArray(roll.gearNotes) && roll.gearNotes.length) rows.push(["Weapon / Tool note", roll.gearNotes.join(" · ")]);
  return rows;
}

function conflictSideCard({ actorName, action, roll, passed, margin, mode }) {
  const actionName = actionLabel(action);
  if (roll?.trumped || mode === "trumped") {
    return `<section class="rg-conflict-side-card is-trumped"><header><strong>${esc(actorName)}</strong><span>${esc(actionName)}</span></header><div class="rg-conflict-side-primary"><span class="rg-conflict-status trumped">TRUMPED</span><small>No test is rolled.</small></div></section>`;
  }
  const rolled = Number(roll?.successes ?? 0);
  const effective = Number(roll?.effectiveSuccesses ?? rolled);
  const detailRows = conflictRollDetails(roll);
  const detailHtml = detailRows.length ? `<details class="rg-conflict-roll-details"><summary>Roll details</summary><div>${detailRows.map(([label, value]) => `<span><b>${esc(label)}</b><em>${esc(value)}</em></span>`).join("")}</div></details>` : "";
  return `<section class="rg-conflict-side-card ${passed ? "is-pass" : "is-fail"}">
    <header><strong>${esc(actorName)}</strong><span>${esc(actionName)}</span></header>
    <div class="rg-conflict-side-numbers"><span><b>Pool</b><strong>${Number(roll?.pool ?? 0)}D</strong></span><span><b>Successes</b><strong>${effective}</strong></span></div>
    <div class="rg-conflict-side-dice">${diceFacesHtml(roll?.faces ?? [])}</div>
    <div class="rg-conflict-side-primary"><span class="rg-conflict-status ${passed ? "pass" : "fail"}">${passed ? "PASS" : "FAIL"}</span><small>${passed ? "Success" : "Failed"}: ${Number(margin ?? 0)}</small>${effective !== rolled ? `<small>${rolled} rolled → ${effective} effective</small>` : ""}</div>
    ${detailHtml}
  </section>`;
}

async function postConflictStepChat(state, pair, { gmRoll, rangerRoll, gmPassed, rangerPassed, gmMargin, rangerMargin, gmFailureMargin = 0, rangerFailureMargin = 0, beforeGm, beforeRanger } = {}) {
  const gmAfter = Number(state.gm.disposition.current ?? 0), rangerAfter = Number(state.ranger.disposition.current ?? 0);
  const actionNo = Number(pair.index ?? state.currentIndex ?? 0) + 1;
  const gmActorName = actorById(state.gm.actorId)?.name || "GM / Opposition";
  const rangerActorName = actorById(pair.rangerActorId)?.name || "Rangers";
  const gmBeforeValue = Number(beforeGm ?? gmAfter), rangerBeforeValue = Number(beforeRanger ?? rangerAfter);
  const gmDelta = gmAfter - gmBeforeValue, rangerDelta = rangerAfter - rangerBeforeValue;
  let outcome = "Action resolved";
  if (gmPassed && rangerPassed) outcome = "Both tests succeed";
  else if (gmPassed) outcome = `${gmActorName} wins this action`;
  else if (rangerPassed) outcome = `${rangerActorName} wins this action`;
  else if (gmRoll?.trumped && !rangerRoll?.trumped) outcome = `${rangerActorName}'s action is unopposed`;
  else if (rangerRoll?.trumped && !gmRoll?.trumped) outcome = `${gmActorName}'s action is unopposed`;
  else outcome = "Neither side succeeds";
  const disposition = (label, before, after, delta) => `<span class="${delta ? "changed" : ""}"><b>${esc(label)}</b><strong>${before} → ${after}</strong><small>${delta > 0 ? "+" : ""}${delta}</small></span>`;
  const content = `<div class="realm-guard rg-conflict-chat rg-conflict-step-chat rg-conflict-readable-card">
    <div class="rg-custom-chat-tag">CONFLICT · EXCHANGE ${Number(state.exchange ?? 1)} · ACTION ${actionNo}</div>
    <div class="rg-conflict-matchup"><strong>${esc(actionLabel(pair.gmAction))}</strong><span>vs</span><strong>${esc(actionLabel(pair.rangerAction))}</strong></div>
    ${conflictSideCard({ actorName: gmActorName, action: pair.gmAction, roll: gmRoll, passed: gmPassed, margin: gmPassed ? gmMargin : gmFailureMargin, mode: pair.gmMode })}
    ${conflictSideCard({ actorName: rangerActorName, action: pair.rangerAction, roll: rangerRoll, passed: rangerPassed, margin: rangerPassed ? rangerMargin : rangerFailureMargin, mode: pair.rangerMode })}
    <div class="rg-conflict-outcome"><small>RESULT</small><strong>${esc(outcome)}</strong></div>
    <div class="rg-conflict-disposition-chat">${disposition("Rangers", rangerBeforeValue, rangerAfter, rangerDelta)}${disposition("Opposition", gmBeforeValue, gmAfter, gmDelta)}</div>
    ${pair.resultText ? `<details class="rg-conflict-rule-detail"><summary>Rules resolution</summary><div>${pair.resultText}</div></details>` : ""}
  </div>`;
  await ChatMessage.create({ content });
}

async function gmResolveCurrentPair(state) {
  if (!game.user?.isGM || state.stage !== "action") return;
  const pair = currentPair(state); if (!pair) return;
  const next = clone(state); const gmRoll = next.rolls.gm; const rr = next.rolls.ranger;
  const gmMode = pair.gmMode, rangerMode = pair.rangerMode;
  let gmPassed = false, rPassed = false, gmMargin = 0, rMargin = 0;
  let gmFailureMargin = 0, rFailureMargin = 0, tiePending = false;
  const gmBaseRaw = conflictRawSuccesses(gmRoll), rBaseRaw = conflictRawSuccesses(rr);
  let gmRaw = gmBaseRaw, rRaw = rBaseRaw;

  if (gmMode === "versus" || rangerMode === "versus") {
    // Positive +s is conditional: it may improve a success or break a raw tie, but it never
    // rescues a side that rolled fewer successes. Negative -s has already reduced raw successes.
    const gmBonus = gmBaseRaw >= rBaseRaw ? conflictPositiveSuccessBonus(gmRoll) : 0;
    const rBonus = rBaseRaw >= gmBaseRaw ? conflictPositiveSuccessBonus(rr) : 0;
    gmRaw = gmBaseRaw + gmBonus;
    rRaw = rBaseRaw + rBonus;
    gmPassed = gmMode !== "trumped" && gmRaw > rRaw;
    rPassed = rangerMode !== "trumped" && rRaw > gmRaw;
    let tieResolution = null;
    if (gmRaw === rRaw && gmMode === "versus" && rangerMode === "versus") {
      const rangerActor = actorById(pair.rangerActorId);
      const gmActor = actorById(next.gm.actorId);
      const rangerRole = rr?.roleId ? rangerActor?.items.get(rr.roleId) : null;
      const rangerSource = rangerRole ?? (rr?.skillName ? { name: rr.skillName } : null);
      const opposition = gmRoll?.roleId
        ? { kind: "role", name: gmRoll.skillName, rating: Number(gmRoll.base ?? 0) }
        : { kind: "ability", name: gmRoll?.skillName || "Nature", rating: Number(gmRoll?.base ?? 0) };
      if (rangerSource && rangerActor?._resolveAutomaticVersusTie && gmActor) {
        tieResolution = await rangerActor._resolveAutomaticVersusTie({
          role: rangerSource, opponent: gmActor, opposition, ownFaces: rr.faces ?? [], opponentFaces: gmRoll.faces ?? [], fateAlreadySpent: Boolean(rr.fateSpent)
        });
      }
      if (tieResolution?.resolved) {
        rPassed = Boolean(tieResolution.passed); gmPassed = !rPassed;
        rMargin = rPassed ? Math.max(0, Number(tieResolution.margin ?? 0)) : 0;
        gmMargin = gmPassed ? Math.max(0, Number(tieResolution.margin ?? 0)) : 0;
        rFailureMargin = rPassed ? 0 : Math.max(0, Number(tieResolution.margin ?? 0));
        gmFailureMargin = gmPassed ? 0 : Math.max(0, Number(tieResolution.margin ?? 0));
        pair.resultText = `<b>Versus tie resolved:</b> ${rPassed ? "Rangers" : "GM / Opposition"} wins${Number(tieResolution.margin ?? 0) ? ` · margin ${Number(tieResolution.margin)}` : ""}.`;
      } else {
        pair.resultText = `<b>VERSUS TIE:</b> standard tiebreaker remains unresolved. No disposition change until the table resolves it.`;
        tiePending = true;
      }
    } else {
      gmMargin = gmPassed ? Math.max(0, gmRaw - rRaw) : 0;
      rMargin = rPassed ? Math.max(0, rRaw - gmRaw) : 0;
      gmFailureMargin = !gmPassed ? Math.max(0, rRaw - gmRaw) : 0;
      rFailureMargin = !rPassed ? Math.max(0, gmRaw - rRaw) : 0;
    }
    if (tiePending) {
      const text = pair.resultText || `<b>VERSUS TIE:</b> tiebreaker is pending. Disposition and Learning remain unchanged until the tie is resolved.`;
      next.revealed = next.revealed.map(r => r.index === pair.index ? { ...r, resultText: text, tiePending: true } : r);
      await setPublicState(next);
      return;
    }
  } else {
    if (gmMode !== "trumped") {
      const ob = independentObstacle(pair.gmAction, pair.rangerAction);
      gmRaw = conflictEffectiveSuccesses(gmRoll, ob);
      gmPassed = gmRaw >= ob; gmMargin = gmPassed ? Math.max(0, gmRaw - ob) : 0; gmFailureMargin = gmPassed ? 0 : Math.max(1, ob - gmRaw);
    }
    if (rangerMode !== "trumped") {
      const ob = independentObstacle(pair.rangerAction, pair.gmAction);
      rRaw = conflictEffectiveSuccesses(rr, ob);
      rPassed = rRaw >= ob; rMargin = rPassed ? Math.max(0, rRaw - ob) : 0; rFailureMargin = rPassed ? 0 : Math.max(1, ob - rRaw);
    }
  }

  if (gmRoll && !gmRoll.trumped) gmRoll.effectiveSuccesses = gmRaw;
  if (rr && !rr.trumped) rr.effectiveSuccesses = rRaw;

  const beforeGm = Number(next.gm.disposition.current ?? 0);
  const beforeRanger = Number(next.ranger.disposition.current ?? 0);
  const applyAction = (side, action, mode, passed, margin, roll) => {
    if (mode === "trumped" || !passed) return;
    const own = next[side], oppSide = side === "gm" ? "ranger" : "gm", opp = next[oppSide];
    if (["attack", "feint"].includes(action)) {
      const damage = mode === "independent" ? Math.max(0, Number(roll?.effectiveSuccesses ?? 0)) : margin;
      opp.disposition.current = Math.max(0, Number(opp.disposition.current ?? 0) - Math.max(0, damage));
    } else if (action === "defend") {
      own.disposition.current = capDisposition(Number(own.disposition.current ?? 0) + Math.max(0, margin), own.disposition.start);
    }
  };
  applyAction("gm", pair.gmAction, gmMode, gmPassed, gmMargin, gmRoll);
  applyAction("ranger", pair.rangerAction, rangerMode, rPassed, rMargin, rr);

  await recordConflictLearning(next, gmRoll, gmPassed, gmMode === "versus");
  await recordConflictLearning(next, rr, rPassed, rangerMode === "versus");
  await applyConflictNatureTax(gmRoll, { passed: gmPassed, failureMargin: gmFailureMargin, label: `${actionLabel(pair.gmAction)} Conflict` });
  await applyConflictNatureTax(rr, { passed: rPassed, failureMargin: rFailureMargin, label: `${actionLabel(pair.rangerAction)} Conflict` });

  const maneuverPending = [];
  if (pair.gmAction === "maneuver" && gmMode !== "trumped" && gmPassed && gmMargin > 0) maneuverPending.push({ side: "gm", margin: gmMargin });
  if (pair.rangerAction === "maneuver" && rangerMode !== "trumped" && rPassed && rMargin > 0) maneuverPending.push({ side: "ranger", margin: rMargin });
  pair.resultText = pair.resultText || `<b>Resolved:</b> GM ${gmRaw} effective successes${gmRoll?.successPenalty ? ` (−${Number(gmRoll.successPenalty)}s penalty)` : ""}${gmPassed ? ` · margin ${gmMargin}` : ""} · Rangers ${rRaw} effective successes${rr?.successPenalty ? ` (−${Number(rr.successPenalty)}s penalty)` : ""}${rPassed ? ` · margin ${rMargin}` : ""}.`;
  next.revealed = next.revealed.map(r => r.index === pair.index ? { ...r, resultText: pair.resultText, tiePending: false, gmPassed, rangerPassed: rPassed, gmMargin, rangerMargin: rMargin, gmRoll: gmRoll?.trumped ? null : gmRoll, rangerRoll: rr?.trumped ? null : rr } : r);
  await postConflictStepChat(next, pair, { gmRoll, rangerRoll: rr, gmPassed, rangerPassed: rPassed, gmMargin, rangerMargin: rMargin, gmFailureMargin, rangerFailureMargin: rFailureMargin, beforeGm, beforeRanger });

  const gmZero = Number(next.gm.disposition.current ?? 0) <= 0, rangerZero = Number(next.ranger.disposition.current ?? 0) <= 0;
  if (gmZero || rangerZero) {
    next.outcome = { winner: gmZero && rangerZero ? "tie" : gmZero ? "ranger" : "gm", endedExchange: next.exchange, endedAction: next.currentIndex + 1 };
    next.stage = "compromise"; next.pendingManeuver = null; next.rolls = { gm: null, ranger: null };
    await setPublicState(next); return;
  }
  if (maneuverPending.length) {
    next.pendingManeuverQueue = maneuverPending; next.pendingManeuver = maneuverPending[0]; next.stage = "maneuver"; next.rolls = { gm: null, ranger: null };
    await setPublicState(next); return;
  }
  await advanceAfterAction(next);
}

async function chooseManeuver(choice, state) {
  const pending = state.pendingManeuver; if (!pending || state.stage !== "maneuver") return;
  const side = pending.side; const actor = side === "gm" ? actorById(state.gm.actorId) : actorById(currentPair(state)?.rangerActorId);
  if (!(side === "gm" ? game.user?.isGM : (game.user?.isGM || actor?.isOwner))) return;
  if (!game.user?.isGM) {
    game.socket.emit(SOCKET_CHANNEL, { type: "conflict-intent", intent: "maneuverChoice", conflictId: state.id, senderId: game.user.id, payload: { choice } });
    return;
  }
  await gmApplyManeuverChoice({ choice }, state);
}

async function postConflictManeuverChat(state, pair, { side, choice, margin, disarmedName = "" } = {}) {
  const label = side === "gm" ? "GM / Opposition" : "Rangers";
  const targetLabel = side === "gm" ? "Rangers" : "GM / Opposition";
  const detail = choice === "impede"
    ? `${targetLabel} suffers -1D on its next test.`
    : choice === "position"
      ? `${label} gains +2D on its next test.`
      : choice === "disarm"
        ? (disarmedName ? `${targetLabel} has ${esc(disarmedName)} disabled for the rest of the conflict.` : `Disarm chosen; no supported equipped Gear Item was available, so adjudicate a natural weapon or trait manually.`)
        : choice === "combo"
          ? `${targetLabel} suffers -1D and ${label} gains +2D on the next tests.`
          : `Maneuver effect applied.`;
  const content = `<div class="realm-guard rg-conflict-chat rg-conflict-step-chat rg-conflict-maneuver-chat rg-conflict-readable-card"><div class="rg-custom-chat-tag">CONFLICT · EXCHANGE ${Number(state.exchange ?? 1)} · ACTION ${Number(pair?.index ?? state.currentIndex ?? 0) + 1}</div><div class="rg-conflict-outcome"><small>MANEUVER · ${esc(label.toUpperCase())}</small><strong>${esc(String(choice ?? "Maneuver").replace(/^./, c => c.toUpperCase()))}</strong><span>Success: ${Number(margin ?? 0)}</span></div><p class="rg-conflict-effect-text">${esc(detail)}</p></div>`;
  await ChatMessage.create({ content });
}

async function gmApplyManeuverChoice(payload, state = currentState(), sender = null) {
  if (!game.user?.isGM || !state?.pendingManeuver || state.stage !== "maneuver") return;
  const pending = state.pendingManeuver; const side = pending.side; const pair = currentPair(state);
  if (side === "ranger" && sender) {
    const actor = actorById(pair?.rangerActorId); if (!actor?.testUserPermission(sender, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
  }
  const margin = Number(pending.margin ?? 0); const choice = payload.choice;
  if (choice === "impede" && margin < 1 || choice === "position" && margin < 2 || ["disarm","combo"].includes(choice) && margin < 3) return;
  const next = clone(state); const opp = side === "gm" ? "ranger" : "gm";
  let disarmedName = "";
  if (choice === "impede" || choice === "combo") next.effects[opp].nextDice = Number(next.effects[opp].nextDice ?? 0) - 1;
  if (choice === "position" || choice === "combo") next.effects[side].nextDice = Number(next.effects[side].nextDice ?? 0) + 2;
  if (choice === "disarm") {
    const targetActor = opp === "gm" ? actorById(next.gm.actorId) : actorById(pair?.rangerActorId);
    const gear = enabledGear(targetActor, next, opp);
    if (gear.length) {
      const selection = await chooseDisarmTarget(targetActor, gear, side === "gm" || game.user?.isGM);
      if (selection) {
        next.effects[opp].disabledGearIds = [...new Set([...(next.effects[opp].disabledGearIds ?? []), selection])];
        disarmedName = gear.find(item => item.id === selection)?.name ?? "Gear";
      }
    } else next.log.push(`Maneuver Disarm: ${targetActor?.name ?? "target"} has no equipped Gear Item to disable; adjudicate a natural weapon/trait manually.`);
  }
  next.log.push(`${side === "gm" ? "GM" : "Rangers"} Maneuver: ${choice}.`);
  await postConflictManeuverChat(next, pair, { side, choice, margin, disarmedName });
  const queue = [...(next.pendingManeuverQueue ?? [])]; queue.shift(); next.pendingManeuverQueue = queue; next.pendingManeuver = queue[0] ?? null;
  if (!next.pendingManeuver) await advanceAfterAction(next); else await setPublicState(next);
}

async function chooseDisarmTarget(actor, gear) {
  const options = gear.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join("");
  return await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Disarm ${actor.name}`, resizable: true }, content: `<div class="rg-disarm-dialog"><p>Choose one equipped weapon or piece of gear to disable for the rest of this conflict.</p><label>Target <select name="gearId">${options}</select></label></div>`, modal: false, rejectClose: false,
    buttons: [{ action: "ok", label: "Disarm", icon: "fa-solid fa-hand", default: true, callback: (_e,b) => b.form?.elements?.gearId?.value || null }, { action: "cancel", label: "Cancel", callback: () => null }]
  });
}

async function advanceAfterAction(state) {
  const next = clone(state); next.rolls = { gm: null, ranger: null }; next.pendingManeuver = null; next.pendingManeuverQueue = [];
  if (next.currentIndex < 2) { next.currentIndex += 1; next.stage = "ready"; await setPublicState(next); await revealCurrentAction(next); return; }
  next.actionCounts = next.pendingActionCounts ?? next.actionCounts; next.lastRangerActorId = next.pendingLastRangerActorId ?? next.lastRangerActorId;
  next.pendingActionCounts = null; next.pendingLastRangerActorId = null;
  next.exchange += 1; next.currentIndex = 0; next.locks = { gm: false, ranger: false }; next.stage = "gmPlan"; next.revealed = [];
  const p = privateState(); p.gmPlan = []; p.rangerPlan = []; await setPrivateState(p); lockedPlanCache.set(next.id, { gmPlan: [], rangerPlan: [] }); draftPlans.delete(next.id); weaponDrafts.delete(next.id);
  next.log.push(`Exchange ${next.exchange} begins.`); await setPublicState(next);
}

async function finishConflict(state) {
  if (!game.user?.isGM || state.stage !== "compromise") return;
  const text = document.getElementById("rg-conflict-compromise-text")?.value?.trim() || "";
  const next = clone(state); next.compromise = { text, grade: next.outcome?.winner === "tie" ? "tie" : compromiseGrade((next.outcome?.winner === "ranger" ? next.ranger : next.gm).disposition.start, (next.outcome?.winner === "ranger" ? next.ranger : next.gm).disposition.current) }; next.stage = "complete"; next.active = false;
  const winner = next.outcome?.winner === "ranger" ? "Rangers" : next.outcome?.winner === "gm" ? "GM / Opposition" : "Tie";
  await ChatMessage.create({ content: `<div class="realm-guard rg-conflict-chat rg-conflict-complete-card rg-conflict-readable-card"><div class="rg-custom-chat-tag">CONFLICT COMPLETE</div><h3>${esc(next.name)} · ${esc(conflictTypeLabel(next.type))}</h3><div class="rg-conflict-outcome final"><small>WINNER</small><strong>${esc(winner)}</strong></div><div class="rg-conflict-final-disposition"><span><b>Rangers</b><strong>${next.ranger.disposition.current}/${next.ranger.disposition.start}</strong></span><span><b>Opposition</b><strong>${next.gm.disposition.current}/${next.gm.disposition.start}</strong></span></div><div class="rg-conflict-goals-summary"><p><b>Ranger Goal</b><span>${esc(next.ranger.goal || "—")}</span></p><p><b>Opposition Goal</b><span>${esc(next.gm.goal || "—")}</span></p></div>${text ? `<div class="rg-conflict-compromise-summary"><b>Compromise</b><p>${esc(text)}</p></div>` : ""}</div>` });
  await cleanupTemporaryConflictTools(next); await setPublicState(next); await setPrivateState({}); lockedPlanCache.delete(next.id);
  document.getElementById(WINDOW_ID)?.remove();
  ui.notifications.info("Realm Guard: Conflict complete.");
}

async function abortConflict() {
  if (!game.user?.isGM) return;
  const state = currentState(); if (!isActive(state)) return;
  const confirmed = await foundry.applications.api.DialogV2.confirm({ window: { title: "Abort Realm Guard Conflict?", resizable: true }, content: "<p>Abort the current conflict? No Actor data or resources already spent will be rolled back.</p>", modal: false });
  if (!confirmed) return;
  await cleanupTemporaryConflictTools(state); await setPublicState(null); await setPrivateState({}); draftPlans.clear(); weaponDrafts.clear(); lockedPlanCache.clear(); document.getElementById(WINDOW_ID)?.remove();
}

async function onSocket(message) {
  if (!game.user?.isGM || message?.type !== "conflict-intent") return;
  const state = currentState(); if (!state || state.id !== message.conflictId) return;
  const sender = game.users.get(message.senderId); if (!sender) return;
  if (message.intent === "setRangerGoal") return gmApplyRangerGoal(message, state, false);
  if (message.intent === "rangerGoalReady") return gmApplyRangerGoal(message, state, true);
  if (message.intent === "submitRangerPlan") return gmHandleRangerPlan(message, state);
  if (message.intent === "submitDisposition") {
    const captain = actorById(state.ranger.captainId); if (!captain?.testUserPermission(sender, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
    return gmApplyDisposition(message.payload, state);
  }
  if (message.intent === "submitActionRoll") return gmApplyActionRoll(message.payload, state, sender);
  if (message.intent === "maneuverChoice") return gmApplyManeuverChoice(message.payload, state, sender);
}

function onConflictSettingUpdate(setting) {
  if (setting.key !== `${SYSTEM_ID}.${PUBLIC_SETTING}`) return;
  const state = currentState();
  if (isActive(state)) renderConflictWindow(state);
  else document.getElementById(WINDOW_ID)?.remove();
}

export function installConflictEngine() {
  game.settings.register(SYSTEM_ID, PUBLIC_SETTING, { name: "Realm Guard Conflict State", scope: "world", config: false, type: String, default: "" });
  game.settings.register(SYSTEM_ID, PRIVATE_SETTING, { name: "Realm Guard Conflict Private State", scope: "client", config: false, type: String, default: "" });
  registerGmDockTool({ id: "conflict", icon: "fa-solid fa-khanda", tooltip: "Open Conflict Engine", order: 15, onClick: startConflictDialog });
  Hooks.once("ready", () => {
    game.socket.on(SOCKET_CHANNEL, onSocket);
    const state = currentState(); if (isActive(state) && isParticipantOwner(state)) { dismissedConflictId = null; renderConflictWindow(state, { force: true }); }
  });
  Hooks.on("updateSetting", onConflictSettingUpdate);
}

export function openConflictWindow() {
  const state = currentState();
  if (!isActive(state)) return game.user?.isGM ? startConflictDialog() : ui.notifications.info("Realm Guard: No active conflict.");
  dismissedConflictId = null; renderConflictWindow(state, { force: true });
}
