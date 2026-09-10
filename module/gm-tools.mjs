import { registerGmDockTool } from "./gm-dock.mjs";
import { ensureDefaultConditions, openConditionMenu, openGmMassConditionMenu } from "./conditions.mjs";
import { RG_DEFAULT_SKILLS, ensureDefaultSkills } from "./default-skills.mjs";
import { openTurnManager } from "./turns.mjs";
import { openConflictWindow } from "./conflicts.mjs";
import { tokenPowerOptionViews } from "./tokens-of-power.mjs";
import { openContentStudio } from "./content-studio.mjs";
import { baselineObstacle, liveRollObstacle, obstacleMode, OBSTACLE_MODES, OBSTACLE_MODE_HELP, setBaselineObstacle, setLiveRollObstacle, resetLiveRollObstacle, setObstacleMode, obstacleDifficultyText } from "./obstacles.mjs";
import { openNpcTemplateLibrary } from "./npc-builder.mjs";
import { openQuickTokenBuilder } from "./token-builder.mjs";

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value ?? 0)));
const clampInt = (value, min, max) => Math.trunc(clamp(value, min, max));

function controlledActors() {
  const seen = new Set();
  return (canvas?.tokens?.controlled ?? []).map(token => token.actor).filter(actor => {
    if (!actor || seen.has(actor.id) || !["character", "npc"].includes(actor.type)) return false;
    seen.add(actor.id);
    return true;
  });
}

function sceneNpcActors() {
  const seen = new Set();
  return (canvas?.tokens?.placeables ?? []).map(token => token.actor).filter(actor => {
    if (!actor || actor.type !== "npc" || seen.has(actor.id)) return false;
    seen.add(actor.id);
    return true;
  });
}

function tokenForActor(actor) {
  const tokens = canvas?.tokens?.placeables ?? [];
  return tokens.find(token => token.actor?.id === actor.id && token.controlled)
    ?? tokens.find(token => token.actor?.id === actor.id)
    ?? null;
}

async function centerActorToken(actor) {
  const token = tokenForActor(actor);
  if (!token) return ui.notifications.warn(`Realm Guard: ${actor.name} has no token on the current Scene.`);
  const center = token.center ?? { x: token.x, y: token.y };
  await canvas?.animatePan?.({ x: center.x, y: center.y, duration: 250 });
  return token;
}

function selectedSummary(actors) {
  if (!actors.length) return `<div class="rg-gm-empty"><i class="fa-solid fa-arrow-pointer"></i><span>No Realm Guard tokens selected. Select tokens on the canvas for quick actions.</span></div>`;
  const group = actors.length > 1 ? `<div class="rg-gm-inspector-group"><div><b>${actors.length} Actors selected</b><span>Use group actions without opening every sheet.</span></div><button type="button" data-rg-inspect-action="group-conditions"><i class="fa-solid fa-heart-pulse"></i> Group Conditions</button></div>` : "";
  const cards = actors.map(actor => {
    const active = actor.items.filter(item => item.type === "condition" && item.system.active);
    const a = actor.system.attributes ?? {};
    const r = actor.system.resources ?? {};
    const chips = active.length ? active.slice(0, 4).map(item => `<span>${esc(item.name)}</span>`).join("") : `<span class="is-clear">No active Conditions</span>`;
    return `<article class="rg-gm-actor-card rg-gm-inspector-card" data-rg-inspector-actor="${esc(actor.id)}">
      <div class="rg-gm-inspector-head">
        <button type="button" class="rg-gm-inspector-open" data-rg-inspect-action="open" data-actor-id="${esc(actor.id)}" title="Open ${esc(actor.name)} sheet"><img src="${esc(actor.img)}" alt=""><span class="rg-gm-actor-main"><b>${esc(actor.name)}</b><small>${actor.type === "npc" ? "NPC" : "Ranger"} · Nature ${Number(a.nature?.value ?? 0)} · Will ${Number(a.will?.value ?? 0)} · Health ${Number(a.health?.value ?? 0)}</small></span></button>
        <span class="rg-gm-condition-count" title="Active Conditions"><i class="fa-solid fa-heart-pulse"></i>${active.length}</span>
      </div>
      <div class="rg-gm-inspector-resources"><span><b>Fate</b> ${Number(r.fate?.value ?? 0)}</span><span><b>Persona</b> ${Number(r.persona?.value ?? 0)}</span><span><b>Checks</b> ${Number(r.checks?.value ?? 0)}</span></div>
      <div class="rg-gm-inspector-conditions">${chips}</div>
      <div class="rg-gm-inspector-actions">
        <button type="button" data-rg-inspect-action="open" data-actor-id="${esc(actor.id)}" title="Open Sheet"><i class="fa-solid fa-address-card"></i><span>Sheet</span></button>
        <button type="button" data-rg-inspect-action="center" data-actor-id="${esc(actor.id)}" title="Center on token"><i class="fa-solid fa-crosshairs"></i><span>Center</span></button>
        <button type="button" data-rg-inspect-action="roll" data-actor-id="${esc(actor.id)}" title="Quick Roll"><i class="fa-solid fa-dice"></i><span>Roll</span></button>
        <button type="button" data-rg-inspect-action="conditions" data-actor-id="${esc(actor.id)}" title="Conditions"><i class="fa-solid fa-heart-pulse"></i><span>Conditions</span></button>
        <button type="button" data-rg-inspect-action="token" data-actor-id="${esc(actor.id)}" title="Token Builder"><i class="fa-solid fa-crop-simple"></i><span>Token</span></button>
      </div>
    </article>`;
  }).join("");
  return `${group}${cards}`;
}

function skillOptions(selected = "") {
  const current = String(selected ?? "").toLowerCase();
  return `<option value="">-- none --</option>${RG_DEFAULT_SKILLS.map(name => `<option value="${esc(name)}" ${name.toLowerCase() === current ? "selected" : ""}>${esc(name)}</option>`).join("")}`;
}

async function setNpcSkillRatings(actor, skills) {
  await ensureDefaultSkills(actor);
  for (const entry of skills) {
    const name = String(entry.name ?? "").trim();
    if (!name) continue;
    const rating = clamp(entry.rating, 1, 6);
    let role = actor.items.find(item => item.type === "role" && item.name.toLowerCase() === name.toLowerCase());
    if (!role) {
      [role] = await actor.createEmbeddedDocuments("Item", [{ name, type: "role", system: { rating } }]);
    }
    if (role && Number(role.system.rating ?? 0) !== rating) await role.update({ "system.rating": rating });
  }
}


const NPC_LOADOUTS = Object.freeze({
  none: { label: "None", gear: [] },
  scout: {
    label: "Scout / Hunter",
    gear: [
      { name: "Bow", hands: 2, mode: "hand", location: "right-hand" },
      { name: "Dagger", hands: 1, mode: "belt", location: "belt" },
      { name: "Cloak", mode: "worn", location: "cloak" }
    ]
  },
  soldier: {
    label: "Soldier / Guard",
    gear: [
      { name: "Spear", hands: 1, mode: "hand", location: "right-hand" },
      { name: "Shield", hands: 1, mode: "hand", location: "left-hand" },
      { name: "Mail Shirt", mode: "worn", location: "torso" }
    ]
  },
  veteran: {
    label: "Veteran / Elite",
    gear: [
      { name: "Sword", hands: 1, mode: "hand", location: "right-hand" },
      { name: "Shield", hands: 1, mode: "hand", location: "left-hand" },
      { name: "Mail Shirt", mode: "worn", location: "torso" },
      { name: "Helmet", mode: "worn", location: "head" }
    ]
  },
  captain: {
    label: "Captain / Leader",
    gear: [
      { name: "Sword", hands: 1, mode: "hand", location: "right-hand" },
      { name: "Shield", hands: 1, mode: "hand", location: "left-hand" },
      { name: "Mail Shirt", mode: "worn", location: "torso" },
      { name: "Helmet", mode: "worn", location: "head" },
      { name: "Cloak", mode: "worn", location: "cloak" }
    ]
  },
  raider: {
    label: "Raider / Brigand",
    gear: [
      { name: "Axe", hands: 1, mode: "hand", location: "right-hand" },
      { name: "Shield", hands: 1, mode: "hand", location: "left-hand" },
      { name: "Leather Armor", mode: "worn", location: "torso" }
    ]
  },
  natural: { label: "Creature / Natural", gear: [] }
});

function inferNpcLoadout(rank = "", concept = "") {
  const text = `${rank} ${concept}`.toLowerCase();
  if (/(?:beast|creature|animal|wolf|warg|spider|boar|bear|eagle)/.test(text)) return "natural";
  if (/(?:captain|commander|chief|chieftain|leader|lord|brigade captain)/.test(text)) return "captain";
  if (/(?:scout|hunter|archer|ranger|skirmisher|bowman)/.test(text)) return "scout";
  if (/(?:veteran|elite|champion|knight|sergeant)/.test(text)) return "veteran";
  if (/(?:raider|brigand|bandit|orc|goblin|thug)/.test(text)) return "raider";
  if (/(?:soldier|guard|warrior|infantry|mercenary|man-at-arms|man at arms)/.test(text)) return "soldier";
  return "none";
}

function npcGearDocument(entry, loadoutKey) {
  return {
    name: entry.name,
    type: "gear",
    flags: { "realm-guard": { quickNpcGear: true, quickNpcLoadout: loadoutKey } },
    system: {
      quantity: 1,
      description: `Quick NPC default loadout (${NPC_LOADOUTS[loadoutKey]?.label ?? loadoutKey}). GM convenience preset; edit or delete freely.`,
      inventory: {
        mode: String(entry.mode ?? "unassigned"),
        location: String(entry.location ?? ""),
        containerId: "",
        slots: 1,
        bundle: 1,
        wieldHands: Number(entry.hands ?? 0),
        containerType: "none",
        capacity: 0
      }
    }
  };
}

async function addNpcDefaultGear(actor, requestedLoadout, rank, concept) {
  const loadoutKey = requestedLoadout === "auto" ? inferNpcLoadout(rank, concept) : String(requestedLoadout || "none");
  const loadout = NPC_LOADOUTS[loadoutKey] ?? NPC_LOADOUTS.none;
  if (!loadout.gear.length) return { loadoutKey, label: loadout.label, created: [] };
  const created = await actor.createEmbeddedDocuments("Item", loadout.gear.map(entry => npcGearDocument(entry, loadoutKey)));
  return { loadoutKey, label: loadout.label, created };
}

function npcLoadoutOptions(selected = "auto") {
  const entries = [
    ["auto", "Auto from Type / Rank"],
    ...Object.entries(NPC_LOADOUTS).map(([key, data]) => [key, data.label])
  ];
  return entries.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${esc(label)}</option>`).join("");
}

const NPC_FOLDER_NAME = "NPC";

async function ensureNpcActorFolder() {
  let folder = game.folders?.find?.(folder =>
    folder.type === "Actor" && String(folder.name ?? "").trim().toLowerCase() === NPC_FOLDER_NAME.toLowerCase()
  );
  if (folder) return folder;

  folder = await Folder.create({
    name: NPC_FOLDER_NAME,
    type: "Actor",
    color: "#3f4b2f",
    flags: { "realm-guard": { quickNpcFolder: true } }
  });
  if (!folder) throw new Error("Realm Guard: Could not create the NPC Actor folder.");
  return folder;
}

export async function createQuickNpc() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Quick NPC is GM only.");
  const content = `<div class="rg-quick-npc">
    <header><div class="rg-brand">REALM GUARD · GM</div><h2>Quick NPC</h2><p>Create a table-ready NPC without walking through Ranger Recruitment.</p></header>
    <label>Name<input name="name" value="New NPC" maxlength="80"></label>
    <div class="rg-quick-npc-grid"><label>Type / Rank<input name="rank" placeholder="Orc scout, brigand captain..."></label><label>Concept<input name="concept" placeholder="Ambusher, guide, rival..."></label></div>
    <div class="rg-quick-npc-grid"><label>Default Gear / Loadout<select name="loadout">${npcLoadoutOptions("auto")}</select></label><div class="rg-quick-npc-loadout-note"><b>Auto</b> reads Type / Rank (for example scout, guard, veteran, captain or brigand). Unknown ranks get no automatic gear.</div></div>
    <div class="rg-quick-npc-stats">
      <label>Nature<input type="number" name="nature" min="0" max="7" value="3"></label>
      <label>Will<input type="number" name="will" min="0" max="6" value="3"></label>
      <label>Health<input type="number" name="health" min="0" max="6" value="3"></label>
      <label>Resources<input type="number" name="resources" min="0" max="10" value="2"></label>
      <label>Circles<input type="number" name="circles" min="0" max="10" value="2"></label>
    </div>
    <section class="rg-quick-npc-skills"><h3>Starting Skills</h3><p>Choose up to four trained Skills. All other canonical Realm Guard Skills remain available as untrained Rating 0 data.</p>${[1,2,3,4].map((n, index) => `<div class="rg-quick-skill"><select name="skillName${n}">${skillOptions(index === 0 ? "Fighter" : "")}</select><input type="number" name="skillRating${n}" min="1" max="6" value="${index === 0 ? 3 : 2}"><span>D</span></div>`).join("")}</section>
    <label class="rg-gm-check"><input type="checkbox" name="defaults" checked><span>Add the standard Realm Guard Conditions</span></label>
    <label class="rg-gm-check"><input type="checkbox" name="openSheet" checked><span>Open compact NPC sheet after creation</span></label>
  </div>`;

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Quick NPC", resizable: true },
    position: { width: 590 },
    content,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "create", label: "Create NPC", icon: "fa-solid fa-user-plus", default: true, callback: (_event, button) => {
        const form = button.form;
        const skills = [1,2,3,4].map(n => ({ name: String(form?.elements?.[`skillName${n}`]?.value ?? "").trim(), rating: Number(form?.elements?.[`skillRating${n}`]?.value ?? 2) })).filter(skill => skill.name);
        const unique = [];
        const seen = new Set();
        for (const skill of skills) {
          const key = skill.name.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key); unique.push(skill);
        }
        return {
          name: String(form?.elements?.name?.value ?? "").trim() || "New NPC",
          rank: String(form?.elements?.rank?.value ?? "").trim(),
          concept: String(form?.elements?.concept?.value ?? "").trim(),
          loadout: String(form?.elements?.loadout?.value ?? "auto"),
          nature: clampInt(form?.elements?.nature?.value, 0, 7),
          will: clampInt(form?.elements?.will?.value, 0, 6),
          health: clampInt(form?.elements?.health?.value, 0, 6),
          resources: clampInt(form?.elements?.resources?.value, 0, 10),
          circles: clampInt(form?.elements?.circles?.value, 0, 10),
          defaults: Boolean(form?.elements?.defaults?.checked),
          openSheet: Boolean(form?.elements?.openSheet?.checked),
          skills: unique
        };
      }},
      { action: "cancel", label: "Cancel", callback: () => ({ cancelled: true }) }
    ]
  });
  // DialogV2.wait may return a non-null action value on an explicit button close.
  // Never let Cancel fall through into Actor.create with undefined form data.
  if (!result || typeof result !== "object" || result.cancelled) return null;

  const npcFolder = await ensureNpcActorFolder();
  const actor = await Actor.create({
    name: result.name,
    type: "npc",
    folder: npcFolder.id,
    system: {
      rank: result.rank,
      concept: result.concept,
      attributes: {
        nature: { value: result.nature, maximum: result.nature },
        will: { value: result.will, max: Math.max(1, result.will) },
        health: { value: result.health, max: Math.max(1, result.health) },
        resources: { value: result.resources, max: Math.max(1, result.resources) },
        circles: { value: result.circles, max: Math.max(1, result.circles) }
      }
    },
    flags: { "realm-guard": { quickNpc: { version: "0.21.3", createdAt: Date.now(), addDefaultConditions: result.defaults } } }
  }, { realmGuardSkipRecruitmentProvisioning: true });
  if (!actor) return null;

  await setNpcSkillRatings(actor, result.skills);
  if (result.defaults) await ensureDefaultConditions(actor);
  const loadoutResult = await addNpcDefaultGear(actor, result.loadout, result.rank, result.concept);
  const gearNote = loadoutResult.created.length ? ` Loadout: ${loadoutResult.label} (${loadoutResult.created.map(item => item.name).join(", ")}).` : "";
  ui.notifications.info(`Realm Guard: ${actor.name} created in Actors > ${NPC_FOLDER_NAME}.${gearNote} Drag the Actor to a Scene to create a token.`);
  if (result.openSheet) actor.sheet?.render(true);
  return actor;
}

export async function quickActorRoll(actor) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Quick Roll is GM only.");
  if (!actor || !["npc", "character"].includes(actor.type)) return ui.notifications.warn("Realm Guard: Select a Ranger or NPC for Quick Roll.");
  const roles = actor.items.filter(item => item.type === "role" && Number(item.system.rating ?? 0) > 0).sort((a,b) => a.name.localeCompare(b.name));
  const rollChoices = [
    ...roles.map(role => ({ value: `role:${role.id}`, label: `${role.name} · ${Number(role.system.rating)}D` })),
    { value: "ability:nature", label: `Nature · ${Number(actor.system.attributes?.nature?.value ?? 0)}D` },
    { value: "ability:will", label: `Will · ${Number(actor.system.attributes?.will?.value ?? 0)}D` },
    { value: "ability:health", label: `Health · ${Number(actor.system.attributes?.health?.value ?? 0)}D` },
    { value: "ability:resources", label: `Resources · ${Number(actor.system.attributes?.resources?.value ?? 0)}D` },
    { value: "ability:circles", label: `Circles · ${Number(actor.system.attributes?.circles?.value ?? 0)}D` }
  ];
  const personaAvailable = Number(actor.system.resources?.persona?.value ?? 0) > 0;
  const tokenMap = new Map();
  for (const role of roles) for (const token of tokenPowerOptionViews(actor, role.name, { isSkill: true })) tokenMap.set(token.id, token);
  for (const abilityName of ["Nature", "Will", "Health", "Resources", "Circles"]) for (const token of tokenPowerOptionViews(actor, abilityName, { isSkill: false })) tokenMap.set(token.id, token);
  const tokenOptions = [...tokenMap.values()].sort((a,b) => a.name.localeCompare(b.name));
  const tokenBlock = tokenOptions.length ? `<label>Token of Power<select name="tokenPowerId"><option value="">None</option>${tokenOptions.map(token => `<option value="${token.id}" ${token.disabled ? "disabled" : ""}>${esc(token.label)}</option>`).join("")}</select><small>Linked Tokens must match the selected Skill. Specific-use Tokens require table approval; manual effects are not automated.</small></label>` : "";
  const content = `<div class="rg-gm-quick-roll"><header><div class="rg-brand">REALM GUARD · GM QUICK ROLL</div><h2>${esc(actor.name)}</h2><p>Fast test from GM Quick Inspector. The normal Actor roll engine still handles Conditions and Learning where applicable.</p></header>
    <label>Skill / Ability<select name="source">${rollChoices.map(choice => `<option value="${esc(choice.value)}">${esc(choice.label)}</option>`).join("")}</select></label>
    <div class="rg-roll-dialog-grid"><label>Obstacle<input type="number" name="obstacle" value="1" min="0" max="20"></label><label>Modifier<input type="number" name="modifier" value="0" min="-20" max="20"></label><label>Extra Dice<input type="number" name="extraDice" value="0" min="0" max="20"></label></div>
    <label>Persona dice<select name="persona" ${personaAvailable ? "" : "disabled"}>${[0,1,2,3].filter(n => n <= Number(actor.system.resources?.persona?.value ?? 0)).map(n => `<option value="${n}">${n} Persona · +${n}D</option>`).join("") || `<option value="0">0 Persona · +0D</option>`}</select><small>${personaAvailable ? `${Number(actor.system.resources.persona.value)} available · max +3D` : "No Persona available"}</small></label>
    ${tokenBlock}
  </div>`;
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Quick Roll · ${actor.name}`, resizable: true },
    position: { width: 500 }, content, modal: false, rejectClose: false,
    buttons: [
      { action: "roll", label: "Roll", icon: "fa-solid fa-dice", default: true, callback: (_event, button) => ({ source: String(button.form?.elements?.source?.value ?? ""), obstacle: Number(button.form?.elements?.obstacle?.value ?? 1), modifier: Number(button.form?.elements?.modifier?.value ?? 0), extraDice: Number(button.form?.elements?.extraDice?.value ?? 0), persona: Math.max(0, Math.min(3, Number(button.form?.elements?.persona?.value ?? 0))), tokenPowerId: button.form?.elements?.tokenPowerId?.value || null }) },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!result?.source) return null;
  if (result.persona > Number(actor.system.resources?.persona?.value ?? 0)) return ui.notifications.warn(`Realm Guard: ${actor.name} needs ${result.persona} Persona for this roll.`);

  const [kind, id] = result.source.split(":");
  let rolled = null;
  if (kind === "role") {
    const role = actor.items.get(id);
    if (!role) return ui.notifications.warn("Realm Guard: Selected Skill no longer exists.");
    rolled = await actor.rollRole(role, { obstacle: result.obstacle, modifier: result.modifier, extraDice: result.extraDice, persona: result.persona, tokenPowerId: result.tokenPowerId });
  } else if (kind === "ability") {
    rolled = id === "nature"
      ? await actor.rollAbility("nature", { obstacle: result.obstacle, modifier: result.modifier, extraDice: result.extraDice, persona: result.persona, tokenPowerId: result.tokenPowerId, natureUse: "within" })
      : await actor.rollAbility(id, { obstacle: result.obstacle, modifier: result.modifier, extraDice: result.extraDice, persona: result.persona, tokenPowerId: result.tokenPowerId });
  }
  if (rolled && result.persona) await actor.spendTrackedResource?.("persona", result.persona, { reason: "GM Quick Roll" });
  return rolled;
}

export async function quickNpcRoll(actors = controlledActors()) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Quick NPC Roll is GM only.");
  const npcs = actors.filter(actor => actor.type === "npc");
  if (npcs.length !== 1) return ui.notifications.warn("Realm Guard: Select exactly one NPC token for Quick NPC Roll.");
  return quickActorRoll(npcs[0]);
}

export async function adjustSelectedResources(actors = controlledActors()) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Resource Admin is GM only.");
  if (!actors.length) return ui.notifications.warn("Realm Guard: Select one or more Realm Guard tokens first.");
  const content = `<div class="rg-gm-resource-tool"><h2>Group Resource Admin</h2><p>${actors.map(actor => esc(actor.name)).join(" · ")}</p><div class="rg-gm-resource-grid"><label>Resource<select name="resource"><option value="fate">Fate</option><option value="persona">Persona</option><option value="checks">Checks</option></select></label><label>Change<input type="number" name="delta" value="1" min="-20" max="20"></label></div><p class="rg-muted"><small>Values are clamped between 0 and each Actor's configured maximum. This is an explicit GM correction/admin tool.</small></p></div>`;
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Group Resource Admin", resizable: true }, content, modal: false, rejectClose: false,
    buttons: [
      { action: "apply", label: "Apply", icon: "fa-solid fa-sliders", default: true, callback: (_event, button) => ({ resource: String(button.form?.elements?.resource?.value ?? ""), delta: Number(button.form?.elements?.delta?.value ?? 0) }) },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!result || !["fate", "persona", "checks"].includes(result.resource) || !Number.isFinite(result.delta) || result.delta === 0) return null;
  const rows = [];
  for (const actor of actors) {
    const track = actor.system.resources?.[result.resource];
    if (!track) continue;
    const before = Math.max(0, Number(track.value ?? 0));
    const maximum = Math.max(0, Number(track.max ?? (result.resource === "checks" ? 9 : 5)));
    const after = clamp(before + result.delta, 0, maximum);
    await actor.update({ [`system.resources.${result.resource}.value`]: after });
    rows.push(`<li><b>${esc(actor.name)}</b> · ${before} -> ${after}</li>`);
  }
  if (rows.length) await ChatMessage.create({ speaker: ChatMessage.getSpeaker(), content: `<div class="realm-guard rg-gm-chat"><div class="rg-custom-chat-tag">GM RESOURCE ADMIN</div><h3>${esc(result.resource.toUpperCase())}</h3><ul>${rows.join("")}</ul></div>` });
  return rows.length;
}

async function openSelectedConditions(selected) {
  if (!selected.length) return ui.notifications.warn("Realm Guard: Select at least one Realm Guard token first.");
  if (selected.length === 1) return openConditionMenu(selected[0]);
  return openGmMassConditionMenu();
}


export async function openObstacleControl() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Obstacle Control is GM only.");
  const activeMode = obstacleMode();
  const activeModeHelp = OBSTACLE_MODE_HELP[activeMode] ?? OBSTACLE_MODE_HELP.baseline;
  const content = `<div class="rg-gm-tools rg-obstacle-dock-dialog">
    <header class="rg-gm-tools-head"><div><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Obstacle Control</h2><p>Set the table's normal difficulty, adjust open rolls live, and choose how ordinary rolls get their Obstacle.</p></div><i class="fa-solid fa-bullseye"></i></header>
    <section class="rg-gm-obstacle-control">
      <div class="rg-gm-section-title"><h3>Table Difficulty</h3><span>GM only</span></div>

      <div class="rg-gm-obstacle-row">
        <div><b>Baseline Obstacle</b><small>The default Ob for new ordinary Skill and Ability tests. New worlds start at Ob 2.</small></div>
        <div class="rg-obstacle-stepper"><button type="button" data-rg-ob-baseline-down title="Lower Baseline Obstacle">−</button><input type="number" min="0" max="10" value="${baselineObstacle()}" data-rg-ob-baseline><button type="button" data-rg-ob-baseline-up title="Raise Baseline Obstacle">+</button></div>
      </div>
      <div class="rg-gm-obstacle-guide rg-gm-obstacle-baseline-guide" data-rg-ob-baseline-guide><i class="fa-solid fa-gauge-high"></i><span>${esc(obstacleDifficultyText(baselineObstacle()))}</span></div>

      <div class="rg-gm-obstacle-row rg-live-ob-row">
        <div><b>Change Open Rolls Live</b><small>Temporarily push a new Ob to Roll Dialogs that are already open and still linked to Baseline. This does not change the Baseline for future rolls.</small></div>
        <div class="rg-obstacle-stepper"><button type="button" data-rg-ob-live-down title="Lower Live Roll Obstacle">−</button><input type="number" min="0" max="10" value="${liveRollObstacle()}" data-rg-ob-live><button type="button" data-rg-ob-live-up title="Raise Live Roll Obstacle">+</button><button type="button" class="rg-ob-reset" data-rg-ob-live-reset title="Reset open rolls to Baseline"><i class="fa-solid fa-rotate-left"></i></button></div>
      </div>

      <div class="rg-obstacle-workflow">
        <div class="rg-obstacle-workflow-head"><div><b>How should ordinary rolls get their Obstacle?</b><small>This setting controls new ordinary Skill and Ability rolls. Rule-specific rolls such as Versus, Resources and Circles keep their own rules.</small></div></div>
        <select data-rg-ob-mode>${Object.entries(OBSTACLE_MODES).map(([value,label]) => `<option value="${value}" ${activeMode === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>
        <div class="rg-obstacle-mode-help" data-rg-ob-mode-help><b>${esc(activeModeHelp.title)}</b><span>${esc(activeModeHelp.text)}</span></div>
      </div>

      <div class="rg-obstacle-gm-can">
        <b>What the GM can do here</b>
        <span><i class="fa-solid fa-flag"></i> Set the Baseline used by future ordinary rolls.</span>
        <span><i class="fa-solid fa-bolt"></i> Change currently open Baseline-linked rolls without interrupting play.</span>
        <span><i class="fa-solid fa-sliders"></i> Choose automatic, GM-approved, or fully manual Obstacle handling.</span>
      </div>
    </section>
  </div>`;
  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · Obstacle Control", resizable: true },
    position: { width: 720 }, content, modal: false,
    buttons: [{ action: "close", label: "Close", default: true }], submit: () => null
  });
  await dialog.render(true);
  const root = dialog.element;
  const baselineInput = root?.querySelector?.("[data-rg-ob-baseline]");
  const baselineGuide = root?.querySelector?.("[data-rg-ob-baseline-guide] span");
  const liveInput = root?.querySelector?.("[data-rg-ob-live]");
  const modeHelp = root?.querySelector?.("[data-rg-ob-mode-help]");
  const applyBaseline = async value => {
    const next = clampInt(value, 0, 10); await setBaselineObstacle(next);
    if (baselineInput) baselineInput.value = String(next);
    if (baselineGuide) baselineGuide.textContent = obstacleDifficultyText(next);
  };
  root?.querySelector?.("[data-rg-ob-baseline-down]")?.addEventListener("click", event => { event.preventDefault(); void applyBaseline(Number(baselineInput?.value ?? baselineObstacle()) - 1); });
  root?.querySelector?.("[data-rg-ob-baseline-up]")?.addEventListener("click", event => { event.preventDefault(); void applyBaseline(Number(baselineInput?.value ?? baselineObstacle()) + 1); });
  baselineInput?.addEventListener("change", () => void applyBaseline(baselineInput.value));
  const applyLive = async value => { const next = clampInt(value,0,10); await setLiveRollObstacle(next); if (liveInput) liveInput.value = String(next); };
  root?.querySelector?.("[data-rg-ob-live-down]")?.addEventListener("click", event => { event.preventDefault(); void applyLive(Number(liveInput?.value ?? liveRollObstacle()) - 1); });
  root?.querySelector?.("[data-rg-ob-live-up]")?.addEventListener("click", event => { event.preventDefault(); void applyLive(Number(liveInput?.value ?? liveRollObstacle()) + 1); });
  liveInput?.addEventListener("change", () => void applyLive(liveInput.value));
  root?.querySelector?.("[data-rg-ob-live-reset]")?.addEventListener("click", async event => { event.preventDefault(); await resetLiveRollObstacle(); if (liveInput) liveInput.value=String(baselineObstacle()); });
  root?.querySelector?.("[data-rg-ob-mode]")?.addEventListener("change", event => {
    const value = event.currentTarget.value;
    void setObstacleMode(value);
    const help = OBSTACLE_MODE_HELP[value] ?? OBSTACLE_MODE_HELP.baseline;
    if (modeHelp) modeHelp.innerHTML = `<b>${esc(help.title)}</b><span>${esc(help.text)}</span>`;
  });
  return dialog;
}

export async function openGmTools() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: GM Control is GM only.");
  const selected = controlledActors();
  const npcsOnScene = sceneNpcActors();
  const hasOneNpc = selected.filter(actor => actor.type === "npc").length === 1;
  const content = `<div class="rg-gm-tools">
    <header class="rg-gm-tools-head"><div><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>GM Control</h2><p>Fast table administration plus a live Quick Inspector for selected Rangers and NPCs.</p></div><i class="fa-solid fa-shield-halved"></i></header>
    <section><div class="rg-gm-section-title"><h3>Selected Tokens · Quick Inspector</h3><span data-rg-selected-count>${selected.length} selected · ${npcsOnScene.length} NPCs on scene</span></div><div class="rg-gm-selected" data-rg-selected-summary>${selectedSummary(selected)}</div></section>
    <section class="rg-gm-dashboard-actions">
      <button type="button" data-rg-gm="studio"><i class="fa-solid fa-wand-magic-sparkles"></i><b>Content Studio</b><small>Create / duplicate Realm Guard content</small></button>
      <button type="button" data-rg-gm="createNpc"><i class="fa-solid fa-user-plus"></i><b>Quick NPC</b><small>Create NPC + up to four Skills</small></button><button type="button" data-rg-gm="templates"><i class="fa-solid fa-people-group"></i><b>NPC Templates</b><small>Drop an image to spawn a templated NPC</small></button>
      <button type="button" data-rg-gm="npcRoll" ${hasOneNpc ? "" : "disabled"}><i class="fa-solid fa-dice"></i><b>Quick NPC Roll</b><small>Exactly one selected NPC</small></button>
      <button type="button" data-rg-gm="conditions" ${selected.length ? "" : "disabled"}><i class="fa-solid fa-heart-pulse"></i><b>Conditions</b><small>Single or group status</small></button>
      <button type="button" data-rg-gm="resources" ${selected.length ? "" : "disabled"}><i class="fa-solid fa-coins"></i><b>Resources</b><small>Fate / Persona / Checks</small></button>
      <button type="button" data-rg-gm="turn"><i class="fa-solid fa-hourglass-half"></i><b>Turn Manager</b><small>Structured play controls</small></button>
      <button type="button" data-rg-gm="conflict"><i class="fa-solid fa-khanda"></i><b>Conflict Window</b><small>Open active card conflict</small></button>
    </section>
    <footer class="rg-gm-tools-foot"><small>Change token selection on the canvas and the Quick Inspector updates live. Inspector actions do not close GM Control.</small></footer>
  </div>`;

  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · GM Control", resizable: true },
    position: { width: 780 },
    content,
    buttons: [{ action: "close", label: "Close", default: true }],
    submit: () => null
  });

  await dialog.render(true);
  const root = dialog.element;
  const refreshSelected = () => {
    if (!root?.isConnected) return false;
    const current = controlledActors();
    const currentNpcs = sceneNpcActors();
    const summary = root.querySelector?.("[data-rg-selected-summary]");
    const count = root.querySelector?.("[data-rg-selected-count]");
    if (summary) summary.innerHTML = selectedSummary(current);
    if (count) count.textContent = `${current.length} selected · ${currentNpcs.length} NPCs on scene`;
    const npcRoll = root.querySelector?.('[data-rg-gm="npcRoll"]');
    const conditions = root.querySelector?.('[data-rg-gm="conditions"]');
    const resources = root.querySelector?.('[data-rg-gm="resources"]');
    if (npcRoll) npcRoll.disabled = current.filter(actor => actor.type === "npc").length !== 1;
    if (conditions) conditions.disabled = !current.length;
    if (resources) resources.disabled = !current.length;
    return true;
  };

  const hookIds = [];
  const liveHook = (name, callback) => hookIds.push([name, Hooks.on(name, callback)]);
  const removeHooks = () => { for (const [name, id] of hookIds.splice(0)) Hooks.off(name, id); };
  const refreshOrCleanup = () => { if (!refreshSelected()) removeHooks(); };
  liveHook("controlToken", refreshOrCleanup);
  liveHook("updateActor", actor => { if (controlledActors().some(a => a.id === actor?.id)) refreshOrCleanup(); });
  for (const hookName of ["createItem", "updateItem", "deleteItem"]) liveHook(hookName, item => {
    const parent = item?.parent;
    if (parent?.documentName === "Actor" && controlledActors().some(a => a.id === parent.id)) refreshOrCleanup();
  });
  refreshSelected();

  root?.querySelector?.("[data-rg-selected-summary]")?.addEventListener("click", async event => {
    const button = event.target.closest?.("[data-rg-inspect-action]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const action = button.dataset.rgInspectAction;
    if (action === "group-conditions") return openSelectedConditions(controlledActors());
    const actor = game.actors.get(button.dataset.actorId);
    if (!actor) return ui.notifications.warn("Realm Guard: That selected Actor no longer exists.");
    if (action === "open") return actor.sheet?.render(true);
    if (action === "center") return centerActorToken(actor);
    if (action === "roll") return quickActorRoll(actor);
    if (action === "conditions") return openConditionMenu(actor);
    if (action === "token") return openQuickTokenBuilder(actor);
  });

  root?.querySelectorAll?.("[data-rg-gm]").forEach(button => button.addEventListener("click", async event => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled) return;
    const action = button.dataset.rgGm;
    const liveSelected = controlledActors();
    await dialog.close();
    removeHooks();
    if (action === "studio") return openContentStudio();
    if (action === "createNpc") return createQuickNpc();
    if (action === "templates") return openNpcTemplateLibrary();
    if (action === "npcRoll") return quickNpcRoll(liveSelected);
    if (action === "conditions") return openSelectedConditions(liveSelected);
    if (action === "resources") return adjustSelectedResources(liveSelected);
    if (action === "turn") return openTurnManager();
    if (action === "conflict") return openConflictWindow();
  }));
  return dialog;
}

export function installGmTools() {
  registerGmDockTool({ id: "obstacle-control", icon: "fa-solid fa-bullseye", tooltip: "Obstacle Control", order: 4, onClick: openObstacleControl });
  registerGmDockTool({ id: "gm-control", icon: "fa-solid fa-shield-halved", tooltip: "Open GM Control", order: 5, onClick: openGmTools });
}
