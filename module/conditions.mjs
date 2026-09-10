import { currentTurnPhase, turnLabel, recoveryAttempted, markRecoveryAttempt, turnManagerEnabled } from "./turns.mjs";

export const RG_DEFAULT_CONDITIONS = [
  { name: "Angry", icon: "systems/realm-guard/assets/conditions/angry.svg", rollModifier: 0, appliesTo: "none", recoveryType: "ability", recoveryAbility: "will", recoveryObstacle: 2, recoveryNote: "Recover with an Ob 2 Will test. While Angry, beneficial Trait and Wise effects are unavailable; precision/social Ob increases remain GM-adjudicated.", description: "Angry subtracts 1 from disposition for conflicts that use Will as their base. Supplementary Torchbearer alignment also blocks beneficial Trait/Wise effects while Angry." },
  { name: "Tired", icon: "systems/realm-guard/assets/conditions/tired.svg", rollModifier: 0, appliesTo: "none", recoveryType: "ability", recoveryAbility: "health", recoveryObstacle: 3, recoveryNote: "Recover from fatigue with an Ob 3 Health test.", description: "Tired subtracts 1 from disposition for all conflicts. It does not penalize ordinary Skill tests." },
  { name: "Strained", icon: "systems/realm-guard/assets/conditions/strained.svg", rollModifier: -1, appliesTo: "skills,nature,will,health", recoveryType: "ability", recoveryAbility: "will", recoveryObstacle: 4, recoveryNote: "Realm Guard: recover with an Ob 4 Will test. Failure leaves Strained active; counsel may be required. Seeking counsel during the GM Turn costs two Checks.", description: "Mental fatigue and stress impose -1D to Nature, Will, Health and skill tests. This penalty does not apply to Resources or Circles tests, nor to Will or Health recovery tests." },
  { name: "Hungry & Thirsty", icon: "systems/realm-guard/assets/conditions/hungry.svg", rollModifier: 0, appliesTo: "none", recoveryType: "ability", recoveryAbility: "resources", recoveryObstacle: 1, recoveryNote: "Eat and drink. Use Resources Ob 1, or an available Cook/Brewer/Baker Skill at Ob 1 when appropriate.", description: "Hungry & Thirsty subtracts 1 from disposition for any conflict. It must be dealt with before later canonical recovery conditions." },
  { name: "Afraid", icon: "systems/realm-guard/assets/conditions/afraid.svg", rollModifier: 0, appliesTo: "none", recoveryType: "ability", recoveryAbility: "will", recoveryObstacle: 3, recoveryNote: "Supplementary Torchbearer rule: recover with an Ob 3 Will test. Afraid Rangers cannot Help and cannot use Beginner's Luck.", description: "Supplementary condition rule: while Afraid, the Ranger cannot Help another Ranger and cannot use Beginner's Luck. Nature remains available for untrained actions when appropriate." },
  { name: "Injured", icon: "systems/realm-guard/assets/conditions/injured.svg", rollModifier: -1, appliesTo: "skills,nature,will,health", recoveryType: "ability", recoveryAbility: "health", recoveryObstacle: 4, recoveryNote: "Recover with an Ob 4 Health test. Recovery tests ignore the Injury penalty.", description: "Injured imposes -1D to Nature, Will, Health and skill tests. The penalty does not apply to Resources or Circles, nor to Will or Health recovery tests." },
  { name: "Fresh", icon: "systems/realm-guard/assets/conditions/fresh.svg", rollModifier: 1, appliesTo: "skills,nature,will,health", recoveryType: "manual", recoveryAbility: "", recoveryObstacle: 0, recoveryNote: "Supplementary Torchbearer state: +1D to tests except Resources and Circles. In Beginner's Luck, Fresh is added after halving.", description: "Fresh grants +1D to tests except Resources and Circles. Fresh cannot coexist with another active Condition." }
];

export const RG_RECOVERY_ORDER = ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"];

const FALLBACK_ICON = "systems/realm-guard/assets/conditions/condition.svg";
const normalize = value => String(value ?? "").trim().toLowerCase();
export const isDefaultCondition = item => Boolean(item?.getFlag?.("realm-guard", "defaultCondition"));
export function conditionStatusId(item) { return `realm-guard.condition.${item.id}`; }


export function conditionAppliesToRoll(condition, rollName, { isSkill = true } = {}) {
  if (!condition?.system?.active) return false;
  const raw = String(condition.system.appliesTo ?? "all").trim();
  if (!raw || normalize(raw) === "all" || raw === "*") return true;
  if (normalize(raw) === "none") return false;
  const targets = raw.split(",").map(normalize).filter(Boolean);
  const key = normalize(rollName);
  if (targets.includes(key)) return true;
  if (isSkill && targets.includes("skills")) return true;
  return false;
}

export function conditionRollData(actor, rollName, { isSkill = true } = {}) {
  const active = (actor?.conditions ?? []).filter(c => conditionAppliesToRoll(c, rollName, { isSkill }));
  const dice = active.reduce((sum, c) => sum + Number(c.system.rollModifier ?? 0), 0);
  return { active, dice };
}

export function hasActiveCondition(actor, name) {
  const key = normalize(name);
  return Boolean((actor?.conditions ?? []).some(c => Boolean(c.system?.active) && normalize(c.name) === key));
}

function recoveryOrderIndex(name) {
  return RG_RECOVERY_ORDER.findIndex(entry => normalize(entry) === normalize(name));
}

export function recoveryBlocker(actor, condition) {
  const idx = recoveryOrderIndex(condition?.name);
  if (idx < 0) return null; // Supplemental/custom Conditions do not change Realm Guard's canonical recovery order.
  for (let i = 0; i < idx; i += 1) {
    const blocker = (actor?.conditions ?? []).find(c => Boolean(c.system?.active) && normalize(c.name) === normalize(RG_RECOVERY_ORDER[i]));
    if (blocker) return blocker;
  }
  return null;
}

export function validateRecoveryAttempt(actor, condition) {
  if (!actor || condition?.type !== "condition") return { ok: false, reason: "Invalid recovery target." };
  if (!condition.system?.active) return { ok: false, reason: `${condition.name} is not active.` };
  const blocker = recoveryBlocker(actor, condition);
  if (blocker) return { ok: false, reason: `Recover ${blocker.name} before ${condition.name}.` };
  if (turnManagerEnabled() && recoveryAttempted(actor, condition.name)) return { ok: false, reason: `${condition.name} already had a recovery attempt this ${turnLabel()}.` };
  if (turnManagerEnabled() && currentTurnPhase() === "gm") {
    const checks = Math.max(0, Number(actor.system?.resources?.checks?.value ?? 0));
    if (checks < 2) return { ok: false, reason: `GM Turn recovery costs 2 Checks; ${actor.name} has ${checks}.` };
  }
  return { ok: true };
}

export function recoveryMethods(actor, condition) {
  const key = normalize(condition?.name);
  const ability = (name, obstacle) => {
    const abilityKey = normalize(name);
    const stat = actor?.system?.attributes?.[abilityKey];
    return stat ? { kind: "ability", key: abilityKey, name, obstacle, dice: Math.max(0, Number(stat.value ?? 0)) } : null;
  };
  const role = (name, obstacle) => {
    const item = (actor?.roles ?? []).find(r => normalize(r.name) === normalize(name) && Number(r.system?.rating ?? 0) > 0);
    return item ? { kind: "role", item, name: item.name, obstacle, dice: Math.max(0, Number(item.system.rating ?? 0)) } : null;
  };
  let methods = [];
  if (key === "hungry & thirsty") methods = [role("Cook", 1), role("Brewer", 1), role("Baker", 1), ability("Resources", 1)];
  else if (key === "angry") methods = [ability("Will", 2)];
  else if (key === "afraid") methods = [ability("Will", 3)];
  else if (key === "tired") methods = [ability("Health", 3)];
  else if (key === "injured") methods = [ability("Health", 4)];
  else if (key === "strained") methods = [ability("Will", 4)];
  else {
    const type = String(condition?.system?.recoveryType ?? "manual");
    const ob = Math.max(0, Number(condition?.system?.recoveryObstacle ?? 1));
    if (type === "ability") methods = [ability(String(condition.system.recoveryAbility || ""), ob)];
    else if (type === "role") methods = [role(String(condition.system.recoveryRole || ""), ob)];
  }
  return methods.filter(Boolean);
}

export async function beginRecoveryAttempt(actor, condition) {
  const valid = validateRecoveryAttempt(actor, condition);
  if (!valid.ok) return valid;
  if (!turnManagerEnabled()) return { ok: true, phase: "free", source: "free-play", cost: 0 };
  if (currentTurnPhase() !== "gm") return { ok: true, phase: "player", source: "player-turn", cost: null };
  const before = Math.max(0, Number(actor.system?.resources?.checks?.value ?? 0));
  const after = before - 2;
  await actor.update({ "system.resources.checks.value": after });
  return { ok: true, phase: "gm", source: "gm-checks", cost: 2, before, after };
}

export async function finishRecoveryAttempt(actor, condition, { spent = null, result = null } = {}) {
  if (spent && result) await markRecoveryAttempt(actor, condition.name);
  return true;
}

export async function recoverCondition(actor, condition) {
  const valid = validateRecoveryAttempt(actor, condition);
  if (!valid.ok) return ui.notifications.warn(`Realm Guard: ${valid.reason}`);
  return ui.notifications.info("Realm Guard: Use the Ranger sheet Recovery control so the Turn/Check economy and Roll Dialog are applied.");
}

export async function ensureDefaultConditions(actor) {
  if (!actor || !["character", "npc"].includes(actor.type)) return [];
  const existing = new Map(actor.conditions.map(c => [normalize(c.name), c]));
  const create = [];
  for (const c of RG_DEFAULT_CONDITIONS) {
    const found = existing.get(normalize(c.name));
    if (found) {
      if (!isDefaultCondition(found)) await found.setFlag("realm-guard", "defaultCondition", true);
      continue;
    }
    create.push({
      name: c.name,
      type: "condition",
      flags: { "realm-guard": { defaultCondition: true } },
      system: {
        active: false, icon: c.icon, rollModifier: c.rollModifier, appliesTo: c.appliesTo ?? "all",
        recoveryType: c.recoveryType ?? "manual", recoveryAbility: c.recoveryAbility ?? "", recoveryRole: c.recoveryRole ?? "",
        recoveryObstacle: Number(c.recoveryObstacle ?? 1), recoveryNote: c.recoveryNote ?? "",
        description: `<p>${c.description}</p>`
      }
    });
  }
  return create.length ? actor.createEmbeddedDocuments("Item", create) : [];
}

let rgConditionMigrationRunning = false;

async function migrateSickToStrained(actor) {
  if (!actor || !["character", "npc"].includes(actor.type)) return false;
  const sick = actor.conditions.find(c => normalize(c.name) === "sick" && isDefaultCondition(c));
  if (!sick) return false;
  const strained = actor.conditions.find(c => normalize(c.name) === "strained");
  const strainedDefault = RG_DEFAULT_CONDITIONS.find(c => c.name === "Strained");

  if (strained) {
    if (Boolean(sick.system.active) && !Boolean(strained.system.active)) {
      await strained.update({ "system.active": true }, { realmGuardSkipConditionSync: true });
      await syncConditionEffect(actor, strained);
    }
    const oldEffect = actor.effects.find(e => e.getFlag("realm-guard", "conditionItemId") === sick.id);
    if (oldEffect) await oldEffect.delete({ realmGuardConditionSync: true });
    await sick.delete();
    return true;
  }

  await sick.update({
    name: "Strained",
    "system.icon": strainedDefault.icon,
    "system.rollModifier": strainedDefault.rollModifier,
    "system.appliesTo": strainedDefault.appliesTo,
    "system.recoveryType": strainedDefault.recoveryType,
    "system.recoveryAbility": strainedDefault.recoveryAbility,
    "system.recoveryObstacle": strainedDefault.recoveryObstacle,
    "system.recoveryNote": strainedDefault.recoveryNote,
    "system.description": `<p>${strainedDefault.description}</p>`
  }, { realmGuardSkipConditionSync: true });
  if (Boolean(sick.system.active)) await syncConditionEffect(actor, sick);
  return true;
}

async function migrateAndProvisionConditions() {
  if (!game.user?.isGM || rgConditionMigrationRunning) return;
  const activeGMs = game.users.filter(u => u.active && u.isGM).sort((a,b) => String(a.id).localeCompare(String(b.id)));
  if (activeGMs.length && activeGMs[0].id !== game.user.id) return;
  rgConditionMigrationRunning = true;
  try {
    let migrated = 0;
    for (const actor of game.actors?.contents ?? []) {
      if (!["character", "npc"].includes(actor.type)) continue;
      if (await migrateSickToStrained(actor)) migrated += 1;
      const quickNpc = actor.getFlag?.("realm-guard", "quickNpc");
      const skipNpcDefaults = actor.type === "npc" && quickNpc?.addDefaultConditions === false;
      if (!skipNpcDefaults) await ensureDefaultConditions(actor);
      await enrichCanonicalConditionData(actor);
    }
    if (migrated) {
      console.log(`Realm Guard | Migrated Sick to Strained on ${migrated} Actor(s).`);
      ui.notifications?.info?.(`Realm Guard: Migrated Sick to Strained on ${migrated} Actor(s).`);
    }
  } catch (err) {
    console.error("Realm Guard | Condition rule-alignment migration failed", err);
  } finally {
    rgConditionMigrationRunning = false;
  }
}


async function enrichCanonicalConditionData(actor) {
  for (const condition of actor.conditions ?? []) {
    if (!isDefaultCondition(condition)) continue;
    const def = RG_DEFAULT_CONDITIONS.find(c => normalize(c.name) === normalize(condition.name));
    if (!def) continue;
    const update = {};
    // Rule metadata was introduced in v0.9.1. Populate it for canonical defaults.
    update["system.icon"] = def.icon;
    update["system.appliesTo"] = def.appliesTo ?? "all";
    update["system.recoveryType"] = def.recoveryType ?? "manual";
    update["system.recoveryAbility"] = def.recoveryAbility ?? "";
    update["system.recoveryObstacle"] = Number(def.recoveryObstacle ?? 1);
    update["system.recoveryNote"] = def.recoveryNote ?? "";
    // v0.17.0 aligns canonical default rule text/mechanics; custom Conditions remain untouched.
    update["system.rollModifier"] = Number(def.rollModifier ?? 0);
    update["system.description"] = `<p>${def.description}</p>`;
    await condition.update(update, { realmGuardSkipConditionSync: true });
    if (condition.system.active) await syncConditionEffect(actor, condition);
  }
}

export function installConditionRuleAlignment() {
  Hooks.on("createActor", async (actor, _options, userId) => {
    if (_options?.realmGuardSkipRecruitmentProvisioning) return;
    if (userId !== game.user.id || !["character", "npc"].includes(actor.type)) return;
    try { await ensureDefaultConditions(actor); }
    catch (err) { console.error(`Realm Guard | Could not provision default Conditions for new Actor ${actor.name}`, err); }
  });
  if (game.ready) queueMicrotask(() => migrateAndProvisionConditions());
  else Hooks.once("ready", migrateAndProvisionConditions);
}

function actorTokens(actor) {
  if (!canvas?.ready || !actor) return [];
  return (canvas.tokens?.placeables ?? []).filter(t => {
    const ta = t.actor;
    return ta && (ta === actor || ta.uuid === actor.uuid || (ta.id === actor.id && ta.name === actor.name));
  });
}

async function refreshActorTokens(actor) {
  for (const token of actorTokens(actor)) {
    try {
      await token.drawEffects();
      decorateConditionTokenEffects(token);
    } catch (err) {
      console.warn("Realm Guard | Could not refresh token effects", err);
    }
  }
}

export async function syncConditionEffect(actor, item) {
  if (!actor || item?.type !== "condition") return;
  const existing = actor.effects.find(e => e.getFlag("realm-guard", "conditionItemId") === item.id);
  const active = Boolean(item.system.active);
  if (!active) {
    if (existing) await existing.delete({ realmGuardConditionSync: true });
    await refreshActorTokens(actor);
    return;
  }
  const icon = item.system.icon || FALLBACK_ICON;
  const data = {
    name: item.name,
    icon,
    disabled: false,
    statuses: [conditionStatusId(item)],
    description: item.system.description || "",
    flags: { "realm-guard": { conditionItemId: item.id, conditionIcon: icon } }
  };
  if (existing) await existing.update(data, { realmGuardConditionSync: true });
  else await actor.createEmbeddedDocuments("ActiveEffect", [data], { realmGuardConditionSync: true });
  await refreshActorTokens(actor);
}

export async function setConditionActive(actor, item, active) {
  if (!actor || item?.type !== "condition") return false;
  const next = Boolean(active);
  const isFresh = normalize(item.name) === "fresh";
  if (next && isFresh) {
    const adverse = (actor.conditions ?? []).find(c => c.id !== item.id && Boolean(c.system?.active));
    if (adverse) {
      ui.notifications.warn(`Realm Guard: Fresh cannot be activated while ${adverse.name} is active.`);
      return false;
    }
  }
  if (next && !isFresh) {
    const fresh = (actor.conditions ?? []).find(c => normalize(c.name) === "fresh" && Boolean(c.system?.active));
    if (fresh) {
      await fresh.update({ "system.active": false }, { realmGuardSkipConditionSync: true });
      await syncConditionEffect(actor, fresh);
    }
  }
  await item.update({ "system.active": next }, { realmGuardSkipConditionSync: true });
  await syncConditionEffect(actor, item);
  return true;
}
export async function toggleConditionActive(actor, item) { return setConditionActive(actor, item, !Boolean(item.system.active)); }

function stripHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = String(value ?? "");
  return div.textContent?.trim() || "No description entered.";
}

export async function openConditionInfo(condition, { actor = null } = {}) {
  if (!condition) return;
  const DialogV2 = foundry.applications.api.DialogV2;
  const icon = condition.system?.icon || condition.icon || FALLBACK_ICON;
  const mod = Number(condition.system?.rollModifier ?? condition.rollModifier ?? 0);
  const description = condition.system?.description ?? condition.description ?? "<p>No description entered.</p>";
  const appliesTo = String(condition.system?.appliesTo ?? "all");
  const recoveryType = String(condition.system?.recoveryType ?? "manual");
  const recoveryLabel = recoveryType === "ability"
    ? `${String(condition.system?.recoveryAbility || "Not set").toUpperCase()} · Ob ${Number(condition.system?.recoveryObstacle ?? 1)}`
    : recoveryType === "role"
      ? `${String(condition.system?.recoveryRole || "Not set")} · Ob ${Number(condition.system?.recoveryObstacle ?? 1)}`
      : "Manual";
  const recoveryNote = String(condition.system?.recoveryNote ?? "");
  return new DialogV2({
    window: { title: `Realm Guard · ${condition.name}`, resizable: true }, position: { width: 420 },
    content: `<div class="rg-condition-info"><header><img src="${foundry.utils.escapeHTML(icon)}" alt=""><div><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>${foundry.utils.escapeHTML(condition.name)}</h2>${actor ? `<small>${foundry.utils.escapeHTML(actor.name)}</small>` : ""}</div></header><div class="rg-condition-info-rule">${description}</div><div class="rg-condition-info-meta"><span>Roll modifier</span><strong>${mod ? `${mod > 0 ? "+" : ""}${mod}D` : "None"}</strong></div><div class="rg-condition-info-meta"><span>Affects</span><strong>${foundry.utils.escapeHTML(appliesTo)}</strong></div><div class="rg-condition-info-meta"><span>Recovery</span><strong>${foundry.utils.escapeHTML(recoveryLabel)}</strong></div>${recoveryNote ? `<div class="rg-condition-info-meta"><span>Recovery note</span><strong>${foundry.utils.escapeHTML(recoveryNote)}</strong></div>` : ""}</div>`,
    buttons: [{ action: "close", label: "Close", default: true }], submit: () => null
  }).render(true);
}

async function createCustomCondition(actor) {
  const DialogV2 = foundry.applications.api.DialogV2;
  const result = await DialogV2.wait({
    window: { title: "Realm Guard · Create Condition", resizable: true }, modal: false, rejectClose: false,
    content: `<div class="rg-create-condition"><label>Name <input name="name" type="text" value="New Condition" autofocus></label><label>Token Icon <input name="icon" type="text" value="${FALLBACK_ICON}"></label><label>Roll Modifier <input name="rollModifier" type="number" min="-6" max="6" value="0"></label><label>Affects rolls <input name="appliesTo" type="text" value="all" placeholder="all, none, skills, or comma-separated Skill names"><small>Examples: all · none · skills · Fighter,Scout · skills,nature,will,health</small></label><label>Recovery <select name="recoveryType"><option value="manual">Manual clear</option><option value="ability">Ability test</option><option value="role">Role / Skill test</option></select></label><label>Recovery ability <select name="recoveryAbility"><option value="">None</option><option value="will">Will</option><option value="health">Health</option><option value="nature">Nature</option><option value="resources">Resources</option><option value="circles">Circles</option></select></label><label>Recovery Role / Skill <input name="recoveryRole" type="text" value=""></label><label>Recovery Obstacle <input name="recoveryObstacle" type="number" min="0" max="20" value="1"></label><label>Recovery note <input name="recoveryNote" type="text" value=""></label><label>Description <textarea name="description" rows="5" placeholder="What does this Condition mean?"></textarea></label></div>`,
    buttons: [
      { action: "create", label: "Create Condition", icon: "fa-solid fa-plus", default: true, callback: (_event, button) => {
        const e = button.form?.elements;
        return e ? { name: String(e.name?.value || "New Condition").trim(), icon: String(e.icon?.value || FALLBACK_ICON).trim(), rollModifier: Number(e.rollModifier?.value || 0), appliesTo: String(e.appliesTo?.value || "all").trim(), recoveryType: String(e.recoveryType?.value || "manual"), recoveryAbility: String(e.recoveryAbility?.value || ""), recoveryRole: String(e.recoveryRole?.value || "").trim(), recoveryObstacle: Number(e.recoveryObstacle?.value || 1), recoveryNote: String(e.recoveryNote?.value || "").trim(), description: String(e.description?.value || "").trim() } : null;
      }},
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!result?.name) return null;
  const [item] = await actor.createEmbeddedDocuments("Item", [{ name: result.name, type: "condition", flags: { "realm-guard": { defaultCondition: false } }, system: { active: false, icon: result.icon || FALLBACK_ICON, rollModifier: Math.max(-6, Math.min(6, result.rollModifier)), appliesTo: result.appliesTo || "all", recoveryType: result.recoveryType || "manual", recoveryAbility: result.recoveryAbility || "", recoveryRole: result.recoveryRole || "", recoveryObstacle: Number(result.recoveryObstacle ?? 1), recoveryNote: result.recoveryNote || "", description: result.description ? `<p>${foundry.utils.escapeHTML(result.description)}</p>` : "" } }]);
  return item;
}

function conditionRows(actor) {
  return actor.conditions.map(condition => {
    const active = Boolean(condition.system.active);
    const icon = condition.system.icon || FALLBACK_ICON;
    const mod = Number(condition.system.rollModifier ?? 0);
    const locked = isDefaultCondition(condition);
    return `<div class="rg-hud-condition-row ${active ? "active" : ""}" data-condition-id="${condition.id}"><button type="button" class="rg-hud-condition" data-rg-toggle-condition data-condition-id="${condition.id}" title="${foundry.utils.escapeHTML(stripHtml(condition.system.description))}"><img src="${foundry.utils.escapeHTML(icon)}" alt=""><span><b>${foundry.utils.escapeHTML(condition.name)}</b><small>${active ? "ACTIVE" : "Inactive"}${mod ? ` · ${mod > 0 ? "+" : ""}${mod}D` : ""}${locked ? " · DEFAULT" : ""}</small></span><i class="fa-solid ${active ? "fa-toggle-on" : "fa-toggle-off"}"></i></button><button type="button" class="rg-condition-info-button" data-rg-condition-info data-condition-id="${condition.id}" title="Condition info"><i class="fa-solid fa-circle-info"></i></button>${locked ? "" : `<button type="button" class="rg-condition-delete-button" data-rg-condition-delete data-condition-id="${condition.id}" title="Delete custom Condition"><i class="fa-solid fa-trash"></i></button>`}</div>`;
  }).join("");
}

const rgConditionMenus = new Map();

function clampConditionMenu(dialog) {
  const el = dialog?.element;
  if (!(el instanceof HTMLElement) || !el.isConnected) return;
  const margin = 12;
  const rect = el.getBoundingClientRect();
  let left = rect.left;
  let top = rect.top;
  if (rect.right > window.innerWidth - margin) left -= rect.right - (window.innerWidth - margin);
  if (rect.bottom > window.innerHeight - margin) top -= rect.bottom - (window.innerHeight - margin);
  left = Math.max(margin, left);
  top = Math.max(margin, top);
  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
}

function focusConditionMenu(dialog) {
  try { dialog?.bringToFront?.(); } catch (_) {}
  const el = dialog?.element;
  if (el instanceof HTMLElement) {
    const highest = Math.max(100, ...[...document.querySelectorAll('.application')].map(node => Number.parseInt(getComputedStyle(node).zIndex || '0', 10) || 0));
    el.style.zIndex = String(highest + 1);
    el.focus?.({ preventScroll: true });
  }
  requestAnimationFrame(() => clampConditionMenu(dialog));
}

export async function openConditionMenu(actor) {
  if (!actor) return;
  const DialogV2 = foundry.applications.api.DialogV2;
  if (!(actor.isOwner || game.user.isGM)) return ui.notifications.warn("Realm Guard: You do not have permission to change this token's Conditions.");

  const key = actor.uuid;
  const existing = rgConditionMenus.get(key);
  if (existing?.element?.isConnected) {
    focusConditionMenu(existing);
    return existing;
  }
  rgConditionMenus.delete(key);

  const dialog = new DialogV2({
    window: { title: `Realm Guard · ${actor.name} Conditions`, resizable: true }, position: { width: 485 },
    content: `<div class="rg-condition-menu" data-rg-actor-uuid="${foundry.utils.escapeHTML(actor.uuid)}"><header><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>${foundry.utils.escapeHTML(actor.name)} · Conditions</h2></header><p class="rg-condition-menu-help">Toggle Conditions here. Hover a row for a quick explanation, or use the info button for full details.</p><div class="rg-condition-menu-list">${conditionRows(actor) || '<p class="rg-empty">No Conditions yet.</p>'}</div><div class="rg-condition-menu-actions rg-condition-menu-actions-3"><button type="button" data-rg-add-defaults><i class="fa-solid fa-wand-magic-sparkles"></i> Defaults</button><button type="button" data-rg-create-condition><i class="fa-solid fa-plus"></i> Custom</button><button type="button" data-rg-open-sheet><i class="fa-solid fa-user"></i> Sheet</button></div></div>`,
    buttons: [{ action: "close", label: "Close", default: true }], submit: () => null,
  });
  rgConditionMenus.set(key, dialog);
  const rendered = dialog.render(true);
  for (const delay of [0, 40, 120]) setTimeout(() => {
    if (dialog.element?.isConnected) clampConditionMenu(dialog);
    else if (rgConditionMenus.get(key) === dialog) rgConditionMenus.delete(key);
  }, delay);
  return rendered;
}

let hoverTooltip = null;

function removeHoverTooltip() {
  hoverTooltip?.remove();
  hoverTooltip = null;
}

function conditionAppliesSummary(condition) {
  const raw = String(condition.system.appliesTo ?? "all").trim();
  const lower = raw.toLowerCase();
  if (!raw || lower === "all") return "All normal rolls";
  if (lower === "none") return "No normal roll penalty";
  if (lower === "skills") return "Skill tests";
  return raw.split(",").map(v => v.trim()).filter(Boolean).join(", ");
}

function conditionRecoverySummary(condition) {
  const type = String(condition.system.recoveryType ?? "manual").toLowerCase();
  if (type === "ability") {
    const ability = String(condition.system.recoveryAbility ?? "").trim();
    const ob = Number(condition.system.recoveryObstacle ?? 1);
    return ability ? `${ability.charAt(0).toUpperCase()}${ability.slice(1)} Ob ${ob}` : `Ability Ob ${ob}`;
  }
  if (type === "role") {
    const role = String(condition.system.recoveryRole ?? "").trim();
    const ob = Number(condition.system.recoveryObstacle ?? 1);
    return role ? `${role} Ob ${ob}` : `Skill Ob ${ob}`;
  }
  return "Manual / special recovery";
}

function tooltipPoint(event) {
  const native = event?.nativeEvent ?? event?.originalEvent ?? event?.data?.originalEvent;
  const clientX = Number(event?.clientX ?? native?.clientX);
  const clientY = Number(event?.clientY ?? native?.clientY);
  if (Number.isFinite(clientX) && Number.isFinite(clientY)) return { x: clientX, y: clientY };

  const globalX = Number(event?.global?.x ?? event?.data?.global?.x);
  const globalY = Number(event?.global?.y ?? event?.data?.global?.y);
  if (Number.isFinite(globalX) && Number.isFinite(globalY)) {
    const canvasRect = document.querySelector("#board")?.getBoundingClientRect?.();
    if (canvasRect) return { x: canvasRect.left + globalX, y: canvasRect.top + globalY };
    return { x: globalX, y: globalY };
  }

  return { x: Math.max(20, window.innerWidth / 2), y: Math.max(20, window.innerHeight / 2) };
}

function positionHoverTooltip(event) {
  if (!hoverTooltip) return;
  const point = tooltipPoint(event);
  const margin = 12;
  const width = Math.min(340, Math.max(260, hoverTooltip.offsetWidth || 310));
  const height = Math.max(120, hoverTooltip.offsetHeight || 180);
  let x = point.x + 16;
  let y = point.y + 16;
  if (x + width > window.innerWidth - margin) x = point.x - width - 16;
  if (y + height > window.innerHeight - margin) y = point.y - height - 16;
  hoverTooltip.style.left = `${Math.max(margin, x)}px`;
  hoverTooltip.style.top = `${Math.max(margin, y)}px`;
}

function showHoverTooltip(condition, event) {
  removeHoverTooltip();
  const el = document.createElement("div");
  el.className = "rg-canvas-condition-tooltip";

  const mod = Number(condition.system.rollModifier ?? 0);
  const description = foundry.utils.escapeHTML(stripHtml(condition.system.description) || "No description.");
  const applies = foundry.utils.escapeHTML(conditionAppliesSummary(condition));
  const recovery = foundry.utils.escapeHTML(conditionRecoverySummary(condition));
  const recoveryNote = String(condition.system.recoveryNote ?? "").trim();

  el.innerHTML = `
    <strong>${foundry.utils.escapeHTML(condition.name)}</strong>
    <span>${description}</span>
    <div class="rg-condition-tooltip-meta">
      <small><b>Impact:</b> ${mod ? `${mod > 0 ? "+" : ""}${mod}D` : "—"}</small>
      <small><b>Affects:</b> ${applies}</small>
      <small><b>Recovery:</b> ${recovery}</small>
      ${recoveryNote ? `<small>${foundry.utils.escapeHTML(recoveryNote)}</small>` : ""}
    </div>`;
  document.body.append(el);
  hoverTooltip = el;
  positionHoverTooltip(event);
}

function spriteSource(sprite) {
  return String(
    sprite?.texture?.source?.resource?.src ??
    sprite?.texture?.baseTexture?.resource?.url ??
    sprite?.texture?.source?.label ??
    sprite?.texture?.label ??
    ""
  );
}

function bindConditionSprite(sprite, condition) {
  if (!sprite || !condition) return;
  if (sprite._rgConditionHoverBoundTo === condition.id) return;

  if (sprite._rgConditionPointerOver) sprite.off?.("pointerover", sprite._rgConditionPointerOver);
  if (sprite._rgConditionPointerMove) sprite.off?.("pointermove", sprite._rgConditionPointerMove);
  if (sprite._rgConditionPointerOut) sprite.off?.("pointerout", sprite._rgConditionPointerOut);

  const over = event => showHoverTooltip(condition, event);
  const move = event => positionHoverTooltip(event);
  const out = () => removeHoverTooltip();

  sprite._rgConditionHoverBoundTo = condition.id;
  sprite._rgConditionPointerOver = over;
  sprite._rgConditionPointerMove = move;
  sprite._rgConditionPointerOut = out;

  sprite.eventMode = "static";
  sprite.interactive = true;
  sprite.cursor = "help";
  sprite.on?.("pointerover", over);
  sprite.on?.("pointermove", move);
  sprite.on?.("pointerout", out);
}

export function decorateConditionTokenEffects(token) {
  if (!token?.effects || !token.actor) return;

  const active = token.actor.conditions?.filter(c => c.system.active) ?? [];
  if (!active.length) {
    removeHoverTooltip();
    return;
  }

  const sprites = (token.effects.children ?? []).filter(c => c?.texture);
  if (!sprites.length) return;

  const unused = new Set(active);
  for (const sprite of sprites) {
    const src = spriteSource(sprite);
    let condition = active.find(c => {
      const icon = String(c.system.icon ?? "");
      return src && icon && (src.includes(icon) || icon.includes(src));
    });

    // Foundry may wrap/normalize effect texture URLs. Fall back to effect order only
    // when the number of visible effect sprites matches the number of active RG Conditions.
    if (!condition && sprites.length === active.length) {
      condition = active[sprites.indexOf(sprite)] ?? null;
    }

    if (!condition) continue;
    unused.delete(condition);
    bindConditionSprite(sprite, condition);
  }
}

function queueConditionDecoration(token) {
  if (!token) return;
  for (const delay of [0, 50, 150, 350]) {
    setTimeout(() => decorateConditionTokenEffects(token), delay);
  }
}

export function installConditionTokenHover() {
  Hooks.on("canvasReady", () => {
    for (const token of canvas.tokens?.placeables ?? []) queueConditionDecoration(token);
  });

  // Foundry v13 can rebuild token effect sprites after canvasReady, zoom/refresh,
  // or ActiveEffect changes. Rebind whenever the token is drawn/refreshed/hovered.
  Hooks.on("drawToken", token => queueConditionDecoration(token));
  Hooks.on("refreshToken", token => queueConditionDecoration(token));
  Hooks.on("hoverToken", token => queueConditionDecoration(token));

  Hooks.on("createActiveEffect", effect => {
    const actor = effect.parent;
    if (actor instanceof Actor) setTimeout(() => actorTokens(actor).forEach(queueConditionDecoration), 50);
  });
  Hooks.on("updateActiveEffect", effect => {
    const actor = effect.parent;
    if (actor instanceof Actor) setTimeout(() => actorTokens(actor).forEach(queueConditionDecoration), 50);
  });
  Hooks.on("deleteActiveEffect", effect => {
    removeHoverTooltip();
    const actor = effect.parent;
    if (actor instanceof Actor) setTimeout(() => actorTokens(actor).forEach(queueConditionDecoration), 50);
  });
}


let conditionMenuDelegationInstalled = false;
async function resolveMenuActor(element) {
  const menu = element?.closest?.(".rg-condition-menu");
  const uuid = menu?.dataset?.rgActorUuid;
  if (!uuid) return { menu, actor: null };
  try { return { menu, actor: await fromUuid(uuid) }; }
  catch (err) { console.warn("Realm Guard | Could not resolve Condition menu Actor", err); return { menu, actor: null }; }
}
function refreshConditionMenuDom(menu, actor) {
  if (!menu || !actor) return;
  const list = menu.querySelector(".rg-condition-menu-list");
  if (list) list.innerHTML = conditionRows(actor) || '<p class="rg-empty">No Conditions yet.</p>';
}
function installConditionMenuDelegation() {
  if (conditionMenuDelegationInstalled) return;
  conditionMenuDelegationInstalled = true;
  document.addEventListener("click", async event => {
    const action = event.target?.closest?.("[data-rg-toggle-condition],[data-rg-condition-info],[data-rg-condition-delete],[data-rg-add-defaults],[data-rg-create-condition],[data-rg-open-sheet]");
    if (!action) return;
    const { menu, actor } = await resolveMenuActor(action);
    if (!menu || !actor) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      if (action.matches("[data-rg-toggle-condition]")) {
        const item = actor.items.get(action.dataset.conditionId);
        if (!item) return;
        await toggleConditionActive(actor, item);
        refreshConditionMenuDom(menu, actor);
        return;
      }
      if (action.matches("[data-rg-condition-info]")) {
        const item = actor.items.get(action.dataset.conditionId);
        if (item) await openConditionInfo(item, { actor });
        return;
      }
      if (action.matches("[data-rg-condition-delete]")) {
        const item = actor.items.get(action.dataset.conditionId);
        if (!item) return;
        if (isDefaultCondition(item)) return ui.notifications.warn("Realm Guard: Default Conditions cannot be deleted.");
        const ok = await foundry.applications.api.DialogV2.confirm({
          window: { title: "Delete custom Condition?", resizable: true },
          content: `<p>Delete <strong>${foundry.utils.escapeHTML(item.name)}</strong>?</p>`,
          rejectClose: false
        });
        if (ok) {
          await item.delete();
          refreshConditionMenuDom(menu, actor);
        }
        return;
      }
      if (action.matches("[data-rg-add-defaults]")) {
        const created = await ensureDefaultConditions(actor);
        ui.notifications.info(created.length ? `Realm Guard: Added ${created.length} default Conditions.` : "Realm Guard: Default Conditions are already present.");
        refreshConditionMenuDom(menu, actor);
        return;
      }
      if (action.matches("[data-rg-create-condition]")) {
        const created = await createCustomCondition(actor);
        if (created) {
          ui.notifications.info(`Realm Guard: Created ${created.name}.`);
          refreshConditionMenuDom(menu, actor);
        }
        return;
      }
      if (action.matches("[data-rg-open-sheet]")) {
        actor.sheet.render(true);
      }
    } catch (err) {
      console.error("Realm Guard | Condition menu action failed", err);
      ui.notifications.error("Realm Guard: Condition action failed. Check F12 Console.");
    }
  }, true);
}

function hideFoundryStatusEffectsControl(root) {
  if (!root) return;
  const controls = root.querySelectorAll("button.control-icon, .control-icon");
  for (const control of controls) {
    if (control.classList?.contains("rg-condition-hud-control") || control.classList?.contains("rg-mass-condition-hud-control")) continue;
    const action = String(control.dataset?.action ?? "").toLowerCase();
    const label = [
      control.dataset?.tooltip,
      control.getAttribute?.("aria-label"),
      control.getAttribute?.("title"),
      control.className
    ].filter(Boolean).join(" ").toLowerCase();
    const coreStatusControl =
      action === "effects" ||
      action === "statuseffects" ||
      action === "status-effects" ||
      label.includes("status effects") ||
      label.includes("status-effects") ||
      label.includes("status effects");
    if (!coreStatusControl) continue;
    control.classList.add("rg-hide-core-status-effects");
    control.setAttribute("aria-hidden", "true");
    control.tabIndex = -1;
  }
}

export function installTokenConditionHud() {
  installConditionMenuDelegation();
  Hooks.on("renderTokenHUD", (app, html) => {
    const root = html instanceof HTMLElement ? html : app?.element;
    const actor = app?.object?.actor ?? app?.token?.actor ?? app?.document?.actor;
    if (!root || !actor || !["character", "npc"].includes(actor.type)) return;

    // Realm Guard owns Condition handling for its Actors, so hide Foundry's redundant Status Effects picker.
    // The native Active Effects remain intact; only the Token HUD shortcut is removed.
    hideFoundryStatusEffectsControl(root);

    if (root.querySelector(".rg-condition-hud-control")) return;
    const button = document.createElement("button"); button.type = "button"; button.className = "control-icon rg-condition-hud-control"; button.dataset.tooltip = "Realm Guard Conditions"; button.setAttribute("aria-label", "Realm Guard Conditions");
    const active = actor.conditions.filter(c => c.system.active); button.innerHTML = `<i class="fa-solid fa-heart-pulse"></i><span class="rg-hud-condition-count">${active.length || ""}</span>`;
    button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openConditionMenu(actor); });
    (root.querySelector(".col.right") || root.querySelector(".right") || root).append(button);
  });
}

// v0.8.1 — GM multi-token Condition management
function selectedRealmGuardActors() {
  if (!canvas?.ready) return [];
  const seen = new Set();
  const actors = [];
  for (const token of canvas.tokens?.controlled ?? []) {
    const actor = token.actor;
    if (!actor || !["character", "npc"].includes(actor.type) || seen.has(actor.uuid)) continue;
    seen.add(actor.uuid); actors.push(actor);
  }
  return actors;
}
function actorConditionByName(actor, name) {
  const key = normalize(name);
  return actor?.conditions?.find(c => normalize(c.name) === key) ?? null;
}
function massState(actors, name) {
  if (!actors.length) return "NONE";
  const active = actors.filter(a => Boolean(actorConditionByName(a, name)?.system.active)).length;
  return active === 0 ? "NONE" : active === actors.length ? "ALL" : "PARTIAL";
}
async function copyConditionToActor(source, actor) {
  let target = actorConditionByName(actor, source.name);
  if (target) return target;
  const data = {
    name: source.name, type: "condition",
    flags: { "realm-guard": { defaultCondition: isDefaultCondition(source) } },
    system: {
      active: false,
      icon: source.system.icon || FALLBACK_ICON,
      rollModifier: Number(source.system.rollModifier ?? 0),
      appliesTo: source.system.appliesTo || "all",
      recoveryType: source.system.recoveryType || "manual",
      recoveryAbility: source.system.recoveryAbility || "",
      recoveryRole: source.system.recoveryRole || "",
      recoveryObstacle: Number(source.system.recoveryObstacle ?? 1),
      recoveryNote: source.system.recoveryNote || "",
      description: source.system.description || ""
    }
  };
  [target] = await actor.createEmbeddedDocuments("Item", [data]);
  return target;
}
function massRows(sourceActor, actors) {
  return sourceActor.conditions.map(condition => {
    const state = massState(actors, condition.name);
    const icon = condition.system.icon || FALLBACK_ICON;
    const mod = Number(condition.system.rollModifier ?? 0);
    return `<div class="rg-hud-condition-row rg-mass-condition-row state-${state.toLowerCase()}" data-condition-id="${condition.id}">
      <button type="button" class="rg-hud-condition" data-rg-mass-toggle data-condition-id="${condition.id}">
        <img src="${foundry.utils.escapeHTML(icon)}" alt="">
        <span><b>${foundry.utils.escapeHTML(condition.name)}</b><small>${state}${mod ? ` · ${mod > 0 ? "+" : ""}${mod}D` : ""}</small></span>
        <strong class="rg-mass-state">${state}</strong>
      </button>
      <button type="button" class="rg-condition-info-button" data-rg-mass-info data-condition-id="${condition.id}" title="Condition info"><i class="fa-solid fa-circle-info"></i></button>
    </div>`;
  }).join("");
}
export async function openGmMassConditionMenu() {
  if (!game.user.isGM) return ui.notifications.warn("Realm Guard: GM only.");
  const actors = selectedRealmGuardActors();
  if (actors.length < 2) return ui.notifications.warn("Realm Guard: Select at least two Realm Guard tokens.");
  const sourceActor = actors[0];
  await ensureDefaultConditions(sourceActor);
  const DialogV2 = foundry.applications.api.DialogV2;
  return new DialogV2({
    window: { title: `Realm Guard · Group Conditions (${actors.length} tokens)`, resizable: true }, position: { width: 520 },
    content: `<div class="rg-mass-condition-menu" data-source-actor-uuid="${foundry.utils.escapeHTML(sourceActor.uuid)}">
      <header><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Group Conditions</h2><small>${actors.map(a => foundry.utils.escapeHTML(a.name)).join(" · ")}</small></header>
      <p class="rg-condition-menu-help"><b>ALL</b> = everyone active · <b>PARTIAL</b> = some active · <b>NONE</b> = nobody active. Clicking ALL removes it from everyone; clicking PARTIAL/NONE applies it to everyone.</p>
      <div class="rg-mass-condition-list">${massRows(sourceActor, actors)}</div>
    </div>`,
    buttons: [{ action: "close", label: "Close", default: true }], submit: () => null
  }).render(true);
}
let massDelegationInstalled = false;
function installMassConditionDelegation() {
  if (massDelegationInstalled) return;
  massDelegationInstalled = true;
  document.addEventListener("click", async event => {
    const action = event.target?.closest?.("[data-rg-mass-toggle],[data-rg-mass-info]");
    if (!action) return;
    const menu = action.closest(".rg-mass-condition-menu");
    if (!menu) return;
    event.preventDefault(); event.stopPropagation();
    try {
      const sourceActor = await fromUuid(menu.dataset.sourceActorUuid);
      const source = sourceActor?.items.get(action.dataset.conditionId);
      if (!source) return;
      if (action.matches("[data-rg-mass-info]")) return openConditionInfo(source, { actor: sourceActor });
      const actors = selectedRealmGuardActors();
      if (actors.length < 2) return ui.notifications.warn("Realm Guard: Keep at least two tokens selected.");
      const state = massState(actors, source.name);
      const activate = state !== "ALL";
      for (const actor of actors) {
        const condition = await copyConditionToActor(source, actor);
        await setConditionActive(actor, condition, activate);
      }
      const list = menu.querySelector(".rg-mass-condition-list");
      if (list) list.innerHTML = massRows(sourceActor, actors);
    } catch (err) {
      console.error("Realm Guard | Group Condition action failed", err);
      ui.notifications.error("Realm Guard: Group Condition action failed. Check F12 Console.");
    }
  }, true);
}
export function installGmMassConditionHud() {
  installMassConditionDelegation();
  Hooks.on("renderTokenHUD", (app, html) => {
    if (!game.user.isGM) return;
    const root = html instanceof HTMLElement ? html : app?.element;
    if (!root || root.querySelector(".rg-mass-condition-hud-control")) return;
    const actors = selectedRealmGuardActors();
    if (actors.length < 2) return;
    const button = document.createElement("button");
    button.type = "button"; button.className = "control-icon rg-mass-condition-hud-control";
    button.dataset.tooltip = `Realm Guard Group Conditions · ${actors.length} tokens`;
    button.setAttribute("aria-label", "Realm Guard Group Conditions");
    button.innerHTML = `<i class="fa-solid fa-users-gear"></i><span class="rg-hud-condition-count">${actors.length}</span>`;
    button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openGmMassConditionMenu(); });
    (root.querySelector(".col.right") || root.querySelector(".right") || root).append(button);
  });
}
