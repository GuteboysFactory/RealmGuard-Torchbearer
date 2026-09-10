import { registerGmDockTool } from "./gm-dock.mjs";
import { RG_DEFAULT_SKILLS } from "./default-skills.mjs";

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const stripHtml = value => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const clampInt = (value, min, max) => Math.max(min, Math.min(max, Math.trunc(Number(value ?? min))));
const slug = value => String(value ?? "").trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CONTENT_TYPES = Object.freeze([
  { key: "character", label: "Ranger / Actor Template", documentName: "Actor", documentType: "character", icon: "fa-solid fa-user-shield", hint: "GM/admin Actor authoring. Use Create Ranger for normal rule-driven Recruitment." },
  { key: "npc", label: "NPC / Creature Template", documentName: "Actor", documentType: "npc", icon: "fa-solid fa-dragon", hint: "Create or duplicate editable NPC templates." },
  { key: "role", label: "Skill", documentName: "Item", documentType: "role", icon: "fa-solid fa-dice-d6", hint: "Trained or untrained Skill reference/content." },
  { key: "trait", label: "Trait", documentName: "Item", documentType: "trait", icon: "fa-solid fa-seedling", hint: "Trait with starting level/rating and description." },
  { key: "wise", label: "Wise", documentName: "Item", documentType: "wise", icon: "fa-solid fa-book-open", hint: "Unrated Wise content; Wises 2.0 is not introduced." },
  { key: "condition", label: "Condition", documentName: "Item", documentType: "condition", icon: "fa-solid fa-heart-pulse", hint: "Condition rule, icon, modifier and Recovery data." },
  { key: "gear", label: "Gear / Weapon / Container", documentName: "Item", documentType: "gear", icon: "fa-solid fa-shield-halved", hint: "Inventory-ready Gear, weapons and containers." },
  { key: "tokenOfPower", label: "Token of Power", documentName: "Item", documentType: "tokenOfPower", icon: "fa-solid fa-gem", hint: "Level 1-3 relic with linked Skill or specific use." },
  { key: "talent", label: "Talent", documentName: "Item", documentType: "talent", icon: "fa-solid fa-sparkles", hint: "Progression Talent with frequency, applicability and effect." }
]);

const typeDef = key => CONTENT_TYPES.find(entry => entry.key === key) ?? null;
const abilityOptions = selected => ["will", "health", "nature", "resources", "circles"].map(value => `<option value="${value}" ${value === String(selected ?? "") ? "selected" : ""}>${value[0].toUpperCase()}${value.slice(1)}</option>`).join("");
const skillOptions = selected => {
  const current = String(selected ?? "").toLowerCase();
  return `<option value="">-- choose Skill --</option>${RG_DEFAULT_SKILLS.map(name => `<option value="${esc(name)}" ${name.toLowerCase() === current ? "selected" : ""}>${esc(name)}</option>`).join("")}`;
};

function selectedRealmGuardActors() {
  const seen = new Set();
  return (canvas?.tokens?.controlled ?? []).map(token => token.actor).filter(actor => {
    if (!actor || !["character", "npc"].includes(actor.type) || seen.has(actor.uuid)) return false;
    seen.add(actor.uuid);
    return true;
  });
}

function sourceLabel(source) {
  return String(source?.label ?? source?.name ?? "Source");
}

async function sourceDocuments(key) {
  const def = typeDef(key);
  if (!def) return [];
  const out = [];
  if (def.documentName === "Actor") {
    for (const actor of game.actors?.contents ?? []) {
      if (actor.type !== def.documentType) continue;
      out.push({ label: `World Actors · ${actor.name}`, doc: actor });
    }
  } else {
    for (const item of game.items?.contents ?? []) {
      if (item.type !== def.documentType) continue;
      out.push({ label: `World Items · ${item.name}`, doc: item });
    }
    for (const actor of game.actors?.contents ?? []) {
      for (const item of actor.items?.filter?.(entry => entry.type === def.documentType) ?? []) {
        out.push({ label: `Actor · ${actor.name} · ${item.name}`, doc: item });
      }
    }
  }

  for (const pack of game.packs?.contents ?? []) {
    if (pack.documentName !== def.documentName) continue;
    const index = await pack.getIndex({ fields: ["name", "type"] });
    for (const entry of index) {
      if (entry.type !== def.documentType) continue;
      out.push({ label: `${pack.metadata?.label ?? pack.title ?? pack.collection} · ${entry.name}`, pack, id: entry._id });
    }
  }
  out.sort((a, b) => a.label.localeCompare(b.label));
  return out;
}

async function chooseSource(key) {
  const sources = await sourceDocuments(key);
  if (!sources.length) {
    ui.notifications.warn("Realm Guard: No matching World, Actor or Compendium source exists for this content type.");
    return null;
  }
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Content Studio · Choose Source", resizable: true },
    position: { width: 620, height: 560 },
    modal: false,
    rejectClose: false,
    content: `<form class="rg-content-studio rg-studio-source"><div class="rg-studio-kicker">DUPLICATE &amp; MODIFY</div><h2>Choose source content</h2><p class="rg-muted">World documents, Actor-embedded Items and Compendium entries are available. The new copy receives a new identity; Starter Library identity flags are not copied.</p><label>Source<select name="source" size="16">${sources.map((source, index) => `<option value="${index}">${esc(source.label)}</option>`).join("")}</select></label></form>`,
    buttons: [
      { action: "pick", label: "Use Source", icon: "fa-solid fa-copy", default: true, callback: (_event, button) => Number(button.form?.elements?.source?.value ?? -1) },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!Number.isInteger(choice) || choice < 0 || choice >= sources.length) return null;
  const source = sources[choice];
  return source.doc ?? await source.pack.getDocument(source.id);
}

function editorCommon(source, def) {
  const warning = def.key === "character" ? `<div class="rg-studio-warning"><i class="fa-solid fa-triangle-exclamation"></i><div><b>Ranger template/admin mode</b><span>Use Create Ranger / Recruitment Guide for a normal rules-correct player character. Content Studio is deliberately a GM authoring tool.</span></div></div>` : "";
  return `${warning}<label>Name<input name="name" value="${esc(source?.name ?? "")}" placeholder="${esc(def.label)} name" required></label>`;
}

function actorEditor(source, def) {
  const s = source?.system ?? {};
  const a = s.attributes ?? {};
  const r = s.resources ?? {};
  const natureMax = Number(a.nature?.maximum ?? a.nature?.value ?? 3);
  return `${editorCommon(source, def)}
    <div class="rg-studio-grid rg-studio-grid-2"><label>Type / Rank<input name="rank" value="${esc(s.rank ?? "")}" placeholder="Scout, Captain, Creature..."></label><label>Concept<input name="concept" value="${esc(s.concept ?? "")}" placeholder="Short table-facing description"></label></div>
    <div class="rg-studio-grid rg-studio-grid-5">
      <label>Nature<input type="number" name="nature" min="0" max="7" value="${Number(a.nature?.value ?? 3)}"></label>
      <label>Nature Max<input type="number" name="natureMax" min="0" max="7" value="${natureMax}"></label>
      <label>Will<input type="number" name="will" min="0" max="6" value="${Number(a.will?.value ?? 3)}"></label>
      <label>Health<input type="number" name="health" min="0" max="6" value="${Number(a.health?.value ?? 3)}"></label>
      <label>Resources<input type="number" name="resources" min="0" max="10" value="${Number(a.resources?.value ?? 2)}"></label>
      <label>Circles<input type="number" name="circles" min="0" max="10" value="${Number(a.circles?.value ?? 2)}"></label>
      <label>Fate<input type="number" name="fate" min="0" max="99" value="${Number(r.fate?.value ?? (def.key === "character" ? 1 : 0))}"></label>
      <label>Persona<input type="number" name="persona" min="0" max="99" value="${Number(r.persona?.value ?? (def.key === "character" ? 1 : 0))}"></label>
      <label>Checks<input type="number" name="checks" min="0" max="99" value="${Number(r.checks?.value ?? 0)}"></label>
    </div>
    <label>Biography / Notes<textarea name="biography" rows="5">${esc(stripHtml(s.biography ?? ""))}</textarea></label>`;
}

function roleEditor(source, def) {
  const s = source?.system ?? {};
  const rating = Number(s.rating ?? 0);
  return `${editorCommon(source, def)}<div class="rg-studio-grid rg-studio-grid-3"><label>Rating<input type="number" name="rating" min="0" max="12" value="${rating}"><small>0 = untrained/reference.</small></label><label>Beginner's Luck base<select name="beginnerAbility"><option value="" ${!s.beginnerAbility ? "selected" : ""}>Unset</option><option value="will" ${s.beginnerAbility === "will" ? "selected" : ""}>Will</option><option value="health" ${s.beginnerAbility === "health" ? "selected" : ""}>Health</option></select></label><label>Versus default<select name="versus"><option value="false" ${!s.versus ? "selected" : ""}>No</option><option value="true" ${s.versus ? "selected" : ""}>Yes</option></select></label></div><label>Description<textarea name="description" rows="6">${esc(s.description ?? "")}</textarea></label>`;
}

function traitEditor(source, def) {
  const s = source?.system ?? {};
  return `${editorCommon(source, def)}<label>Trait level / rating<input type="number" name="rating" min="1" max="6" value="${Number(s.rating ?? 1)}"></label><label>Description<textarea name="description" rows="6">${esc(s.description ?? "")}</textarea></label>`;
}

function wiseEditor(source, def) {
  const s = source?.system ?? {};
  return `${editorCommon(source, def)}<div class="rg-studio-note"><i class="fa-solid fa-circle-info"></i><span>Realm Guard Wises remain unrated. Content Studio does not add Wises 2.0 advancement.</span></div><label>Description<textarea name="description" rows="7">${esc(s.description ?? "")}</textarea></label>`;
}

function conditionEditor(source, def) {
  const s = source?.system ?? {};
  return `${editorCommon(source, def)}<div class="rg-studio-grid rg-studio-grid-3"><label>Token icon<input name="icon" value="${esc(s.icon ?? "systems/realm-guard/assets/conditions/condition.svg")}"></label><label>Roll modifier<input type="number" name="rollModifier" min="-6" max="6" value="${Number(s.rollModifier ?? 0)}"></label><label>Affects rolls<input name="appliesTo" value="${esc(s.appliesTo ?? "all")}" placeholder="all, skills, none, Fighter..."></label></div><div class="rg-studio-grid rg-studio-grid-4"><label>Recovery type<select name="recoveryType"><option value="manual" ${s.recoveryType === "manual" ? "selected" : ""}>Manual</option><option value="ability" ${s.recoveryType === "ability" ? "selected" : ""}>Ability</option><option value="role" ${s.recoveryType === "role" ? "selected" : ""}>Skill</option></select></label><label>Recovery Ability<select name="recoveryAbility"><option value="">-- none --</option>${abilityOptions(s.recoveryAbility)}</select></label><label>Recovery Skill<input name="recoveryRole" value="${esc(s.recoveryRole ?? "")}"></label><label>Obstacle<input type="number" name="recoveryObstacle" min="0" max="20" value="${Number(s.recoveryObstacle ?? 1)}"></label></div><label>Recovery note<input name="recoveryNote" value="${esc(s.recoveryNote ?? "")}"></label><label>Description<textarea name="description" rows="6">${esc(stripHtml(s.description ?? ""))}</textarea></label>`;
}

function gearEditor(source, def) {
  const s = source?.system ?? {};
  const inv = s.inventory ?? {};
  return `${editorCommon(source, def)}<div class="rg-studio-grid rg-studio-grid-4"><label>Quantity<input type="number" name="quantity" min="0" max="999" value="${Number(s.quantity ?? 1)}"></label><label>Slot size<input type="number" name="slots" min="1" max="4" value="${Number(inv.slots ?? 1)}"></label><label>Bundle per slot<input type="number" name="bundle" min="1" max="99" value="${Number(inv.bundle ?? 1)}"></label><label>Wield hands<input type="number" name="wieldHands" min="0" max="2" value="${Number(inv.wieldHands ?? 0)}"></label></div><div class="rg-studio-grid rg-studio-grid-2"><label>Container type<select name="containerType"><option value="none" ${String(inv.containerType ?? "none") === "none" ? "selected" : ""}>Not a container</option><option value="backpack" ${inv.containerType === "backpack" ? "selected" : ""}>Backpack (6)</option><option value="satchel" ${inv.containerType === "satchel" ? "selected" : ""}>Satchel (3)</option><option value="custom" ${inv.containerType === "custom" ? "selected" : ""}>Custom</option></select></label><label>Custom capacity<input type="number" name="capacity" min="0" max="24" value="${Number(inv.capacity ?? 0)}"></label></div><div class="rg-studio-note"><i class="fa-solid fa-box-open"></i><span>New Gear is created Unassigned. Inventory placement is done on the Actor sheet so Content Studio never silently overfills a slot or hand.</span></div><label>Description<textarea name="description" rows="6">${esc(s.description ?? "")}</textarea></label>`;
}

function tokenEditor(source, def) {
  const s = source?.system ?? {};
  return `${editorCommon(source, def)}<div class="rg-studio-grid rg-studio-grid-4"><label>Level<select name="level"><option value="1" ${Number(s.level ?? 1) === 1 ? "selected" : ""}>1</option><option value="2" ${Number(s.level ?? 1) === 2 ? "selected" : ""}>2</option><option value="3" ${Number(s.level ?? 1) === 3 ? "selected" : ""}>3</option></select></label><label>Link type<select name="linkType"><option value="skill" ${String(s.linkType ?? "skill") === "skill" ? "selected" : ""}>Linked Skill</option><option value="specific" ${s.linkType === "specific" ? "selected" : ""}>Specific use</option></select></label><label>Effect handling<select name="effectMode"><option value="level" ${String(s.effectMode ?? "level") === "level" ? "selected" : ""}>Automatic level benefit</option><option value="manual" ${s.effectMode === "manual" ? "selected" : ""}>Manual / written</option></select></label><label>Physical form<input name="form" value="${esc(s.form ?? "")}" placeholder="Sword, ring, horn..."></label></div><div class="rg-studio-grid rg-studio-grid-2"><label>Linked Skill<select name="linkedSkill">${skillOptions(s.linkedSkill)}</select><small>Used only when Link type = Linked Skill.</small></label><label>Specific use<input name="linkedUse" value="${esc(s.linkedUse ?? "")}" placeholder="+1s disposition in Fight conflicts"><small>Used only when Link type = Specific use.</small></label></div><label>Origin / craft<select name="origin"><option value="" ${!s.origin ? "selected" : ""}>Other / unknown</option><option value="elven" ${s.origin === "elven" ? "selected" : ""}>Elven-crafted</option><option value="dwarven" ${s.origin === "dwarven" ? "selected" : ""}>Dwarven-crafted</option><option value="ancient" ${s.origin === "ancient" ? "selected" : ""}>Ancient / lost craft</option></select></label><label>Description<textarea name="description" rows="6">${esc(stripHtml(s.description ?? ""))}</textarea></label>`;
}

function talentEditor(source, def) {
  const s = source?.system ?? {};
  return `${editorCommon(source, def)}<div class="rg-studio-grid rg-studio-grid-4"><label>Minimum Level<input type="number" name="minLevel" min="2" max="10" value="${Number(s.minLevel ?? 2)}"></label><label>Frequency<select name="frequency"><option value="session" ${String(s.frequency ?? "session") === "session" ? "selected" : ""}>Once / session</option><option value="conflict" ${s.frequency === "conflict" ? "selected" : ""}>Once / conflict</option><option value="passive" ${s.frequency === "passive" ? "selected" : ""}>Passive</option></select></label><label>Link type<select name="linkType"><option value="skill" ${String(s.linkType ?? "skill") === "skill" ? "selected" : ""}>Skill</option><option value="ability" ${s.linkType === "ability" ? "selected" : ""}>Ability</option><option value="general" ${s.linkType === "general" ? "selected" : ""}>General / table-approved</option></select></label><label>Effect<select name="effectMode"><option value="dice" ${String(s.effectMode ?? "dice") === "dice" ? "selected" : ""}>Automatic +D</option><option value="manual" ${s.effectMode === "manual" ? "selected" : ""}>Manual / written</option></select></label></div><div class="rg-studio-grid rg-studio-grid-3"><label>Linked Skill<select name="linkedSkill">${skillOptions(s.linkedSkill)}</select></label><label>Linked Ability<select name="linkedAbility"><option value="">-- none --</option>${abilityOptions(s.linkedAbility)}</select></label><label>Dice Bonus<input type="number" name="diceBonus" min="0" max="6" value="${Number(s.diceBonus ?? 1)}"></label></div><label>Source key<input name="sourceKey" value="${esc(s.sourceKey ?? "")}" placeholder="custom-${slug(source?.name ?? "talent")}"><small>Stable identifier for your custom content. Blank = generated from name.</small></label><label>Description<textarea name="description" rows="7">${esc(stripHtml(s.description ?? ""))}</textarea></label>`;
}

function editorFields(key, source) {
  const def = typeDef(key);
  if (!def) return "";
  if (["character", "npc"].includes(key)) return actorEditor(source, def);
  if (key === "role") return roleEditor(source, def);
  if (key === "trait") return traitEditor(source, def);
  if (key === "wise") return wiseEditor(source, def);
  if (key === "condition") return conditionEditor(source, def);
  if (key === "gear") return gearEditor(source, def);
  if (key === "tokenOfPower") return tokenEditor(source, def);
  if (key === "talent") return talentEditor(source, def);
  return editorCommon(source, def);
}

function formValue(button, name, fallback = "") {
  return button.form?.elements?.[name]?.value ?? fallback;
}
function formChecked(button, name) {
  return Boolean(button.form?.elements?.[name]?.checked);
}

function collectEditor(key, button) {
  const name = String(formValue(button, "name", "")).trim();
  if (!name) return { error: "Name is required." };
  const common = { name };
  if (["character", "npc"].includes(key)) return { ...common,
    rank: String(formValue(button, "rank", "")).trim(), concept: String(formValue(button, "concept", "")).trim(), biography: String(formValue(button, "biography", "")).trim(),
    nature: clampInt(formValue(button, "nature", 3), 0, 7), natureMax: clampInt(formValue(button, "natureMax", 3), 0, 7), will: clampInt(formValue(button, "will", 3), 0, 6), health: clampInt(formValue(button, "health", 3), 0, 6), resources: clampInt(formValue(button, "resources", 2), 0, 10), circles: clampInt(formValue(button, "circles", 2), 0, 10), fate: clampInt(formValue(button, "fate", key === "character" ? 1 : 0), 0, 99), persona: clampInt(formValue(button, "persona", key === "character" ? 1 : 0), 0, 99), checks: clampInt(formValue(button, "checks", 0), 0, 99)
  };
  if (key === "role") return { ...common, rating: clampInt(formValue(button, "rating", 0), 0, 12), beginnerAbility: String(formValue(button, "beginnerAbility", "")), versus: String(formValue(button, "versus", "false")) === "true", description: String(formValue(button, "description", "")) };
  if (key === "trait") return { ...common, rating: clampInt(formValue(button, "rating", 1), 1, 6), description: String(formValue(button, "description", "")) };
  if (key === "wise") return { ...common, description: String(formValue(button, "description", "")) };
  if (key === "condition") return { ...common, icon: String(formValue(button, "icon", "")).trim() || "systems/realm-guard/assets/conditions/condition.svg", rollModifier: clampInt(formValue(button, "rollModifier", 0), -6, 6), appliesTo: String(formValue(button, "appliesTo", "all")).trim() || "all", recoveryType: String(formValue(button, "recoveryType", "manual")), recoveryAbility: String(formValue(button, "recoveryAbility", "")), recoveryRole: String(formValue(button, "recoveryRole", "")).trim(), recoveryObstacle: clampInt(formValue(button, "recoveryObstacle", 1), 0, 20), recoveryNote: String(formValue(button, "recoveryNote", "")).trim(), description: String(formValue(button, "description", "")) };
  if (key === "gear") return { ...common, quantity: clampInt(formValue(button, "quantity", 1), 0, 999), slots: clampInt(formValue(button, "slots", 1), 1, 4), bundle: clampInt(formValue(button, "bundle", 1), 1, 99), wieldHands: clampInt(formValue(button, "wieldHands", 0), 0, 2), containerType: String(formValue(button, "containerType", "none")), capacity: clampInt(formValue(button, "capacity", 0), 0, 24), description: String(formValue(button, "description", "")) };
  if (key === "tokenOfPower") return { ...common, level: clampInt(formValue(button, "level", 1), 1, 3), linkType: String(formValue(button, "linkType", "skill")), effectMode: String(formValue(button, "effectMode", "level")), form: String(formValue(button, "form", "")).trim(), linkedSkill: String(formValue(button, "linkedSkill", "")).trim(), linkedUse: String(formValue(button, "linkedUse", "")).trim(), origin: String(formValue(button, "origin", "")).trim(), description: String(formValue(button, "description", "")) };
  if (key === "talent") return { ...common, minLevel: clampInt(formValue(button, "minLevel", 2), 2, 10), frequency: String(formValue(button, "frequency", "session")), linkType: String(formValue(button, "linkType", "skill")), effectMode: String(formValue(button, "effectMode", "dice")), linkedSkill: String(formValue(button, "linkedSkill", "")).trim(), linkedAbility: String(formValue(button, "linkedAbility", "")).trim(), diceBonus: clampInt(formValue(button, "diceBonus", 1), 0, 6), sourceKey: String(formValue(button, "sourceKey", "")).trim(), description: String(formValue(button, "description", "")) };
  return common;
}

function learningForRating(rating) {
  const r = Math.max(0, Number(rating ?? 0));
  if (r <= 0) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 };
  if (r === 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

function sanitizeDuplicateBase(source) {
  if (!source) return null;
  const base = source.toObject();
  delete base._id;
  delete base.folder;
  delete base.sort;
  if (base.flags?.["realm-guard"]) {
    const flags = base.flags["realm-guard"];
    delete flags.starterKey;
    delete flags.starterCategory;
    delete flags.starterVersion;
    if (["character", "npc"].includes(String(source.type ?? ""))) {
      for (const key of Object.keys(flags)) if (key.startsWith("recruitment") || key === "quickNpc") delete flags[key];
    }
    if (!Object.keys(flags).length) delete base.flags["realm-guard"];
  }
  return base;
}

function itemDataFromEditor(key, values, source = null) {
  let data = sanitizeDuplicateBase(source) ?? { name: values.name, type: key, system: {} };
  data.name = values.name;
  data.type = key;
  data.system ??= {};
  if (key === "role") data.system = { ...data.system, rating: values.rating, learning: learningForRating(values.rating), description: values.description, notes: String(data.system.notes ?? ""), versus: values.versus, beginnerAbility: values.beginnerAbility, beginnerAttempts: 0 };
  if (key === "trait") data.system = { ...data.system, rating: values.rating, description: values.description };
  if (key === "wise") data.system = { ...data.system, description: values.description };
  if (key === "condition") data.system = { ...data.system, active: false, icon: values.icon, rollModifier: values.rollModifier, appliesTo: values.appliesTo, recoveryType: values.recoveryType, recoveryAbility: values.recoveryAbility, recoveryRole: values.recoveryRole, recoveryObstacle: values.recoveryObstacle, recoveryNote: values.recoveryNote, description: values.description };
  if (key === "gear") {
    let capacity = values.capacity;
    let slots = values.slots;
    if (values.containerType === "backpack") { capacity = 6; slots = 2; }
    if (values.containerType === "satchel") { capacity = 3; slots = 1; }
    data.system = { ...data.system, quantity: values.quantity, description: values.description, inventory: { mode: "unassigned", location: "", containerId: "", slots, bundle: values.bundle, wieldHands: values.wieldHands, containerType: values.containerType, capacity } };
  }
  if (key === "tokenOfPower") data.system = { ...data.system, level: values.level, linkType: values.linkType, linkedSkill: values.linkType === "skill" ? values.linkedSkill : "", linkedUse: values.linkType === "specific" ? values.linkedUse : "", effectMode: values.effectMode, form: values.form, origin: values.origin, description: values.description, session: { used: false } };
  if (key === "talent") data.system = { ...data.system, sourceKey: values.sourceKey || `custom:${slug(values.name)}`, minLevel: values.minLevel, frequency: values.frequency, linkType: values.linkType, linkedSkill: values.linkType === "skill" ? values.linkedSkill : "", linkedAbility: values.linkType === "ability" ? values.linkedAbility : "", effectMode: values.effectMode, diceBonus: values.effectMode === "dice" ? values.diceBonus : 0, description: values.description, session: { used: false }, conflict: { usedId: "" } };
  return data;
}

function actorDataFromEditor(key, values, source = null) {
  const data = sanitizeDuplicateBase(source) ?? { name: values.name, type: key, system: {} };
  data.name = values.name;
  data.type = key;
  const s = data.system ?? {};
  s.rank = values.rank;
  s.concept = values.concept;
  s.biography = values.biography;
  s.attributes ??= {};
  s.attributes.nature = { value: Math.min(values.nature, values.natureMax), maximum: values.natureMax };
  s.attributes.will = { value: values.will, max: 6 };
  s.attributes.health = { value: values.health, max: 6 };
  s.attributes.resources = { value: values.resources, max: 10 };
  s.attributes.circles = { value: values.circles, max: 10 };
  s.resources ??= {};
  s.resources.fate = { value: values.fate, max: Math.max(5, values.fate) };
  s.resources.persona = { value: values.persona, max: Math.max(5, values.persona) };
  s.resources.checks = { value: values.checks, max: Math.max(9, values.checks) };
  s.roll ??= { versus: false, obstacle: 1, modifier: 0 };
  if (!source && key === "character") s.progression = { level: 1, spentFate: 0, spentPersona: 0 };
  data.system = s;
  return data;
}

function previewRows(key, values, source) {
  const def = typeDef(key);
  const rows = [
    ["Type", def?.label ?? key],
    ["Name", values.name],
    ["Mode", source ? `Duplicate & Modify · ${source.name}` : "Create New"]
  ];
  if (["character", "npc"].includes(key)) rows.push(["Profile", `${values.rank || "No rank"} · N${values.nature}/${values.natureMax} W${values.will} H${values.health} R${values.resources} C${values.circles}`]);
  if (key === "role") rows.push(["Skill", `Rating ${values.rating}${values.rating === 0 ? " · untrained/reference" : ""}${values.beginnerAbility ? ` · BL ${values.beginnerAbility}` : ""}`]);
  if (key === "trait") rows.push(["Trait", `Level ${values.rating}`]);
  if (key === "wise") rows.push(["Wise", "Unrated"]);
  if (key === "condition") rows.push(["Condition", `${values.appliesTo} · ${values.rollModifier >= 0 ? "+" : ""}${values.rollModifier}D · Recovery ${values.recoveryType}`]);
  if (key === "gear") rows.push(["Gear", `${values.quantity}× · ${values.wieldHands}H · ${values.slots} slot(s) · ${values.containerType}`]);
  if (key === "tokenOfPower") rows.push(["Token", `Level ${values.level} · ${values.linkType === "skill" ? values.linkedSkill || "unlinked Skill" : values.linkedUse || "specific use unset"} · ${values.effectMode}`]);
  if (key === "talent") rows.push(["Talent", `Min L${values.minLevel} · ${values.frequency} · ${values.linkType} · ${values.effectMode === "dice" ? `+${values.diceBonus}D` : "manual"}`]);
  return rows;
}

function writablePacks(documentName) {
  return (game.packs?.contents ?? []).filter(pack => pack.documentName === documentName && String(pack.collection ?? "").startsWith("world.") && !pack.locked);
}

function destinationOptions(def, selected) {
  const rows = [`<option value="world">World ${def.documentName === "Actor" ? "Actors" : "Items"}</option>`];
  if (def.documentName === "Item" && selected.length) rows.push(`<option value="selected">Selected Actor${selected.length === 1 ? "" : "s"} (${selected.length})</option>`);
  rows.push(`<option value="custom-pack">Realm Guard Custom ${def.documentName === "Actor" ? "Actor" : "Item"} Compendium (recommended)</option>`);
  for (const pack of writablePacks(def.documentName)) rows.push(`<option value="pack:${esc(pack.collection)}">Compendium · ${esc(pack.metadata?.label ?? pack.title ?? pack.collection)}</option>`);
  return rows.join("");
}

async function ensureCustomPack(documentName) {
  const actor = documentName === "Actor";
  const name = actor ? "realm-guard-custom-actors" : "realm-guard-custom-items";
  const collection = `world.${name}`;
  const existing = game.packs?.get?.(collection);
  if (existing) return existing;
  const Collection = foundry?.documents?.collections?.CompendiumCollection ?? globalThis.CompendiumCollection;
  if (!Collection?.createCompendium) throw new Error("CompendiumCollection.createCompendium is unavailable.");
  return await Collection.createCompendium({ name, label: actor ? "Realm Guard · Custom Actor Templates" : "Realm Guard · Custom Content", type: documentName, package: "world", system: "realm-guard" });
}

async function ensureActorFolder(actorType) {
  const folderName = actorType === "npc" ? "NPC" : "PC";
  let folder = (game.folders?.contents ?? []).find(entry => entry.type === "Actor" && !entry.folder && String(entry.name ?? "").trim().toLowerCase() === folderName.toLowerCase());
  if (folder) return folder;
  return await Folder.create({ name: folderName, type: "Actor", sorting: "a", color: actorType === "npc" ? "#6f2f2f" : "#315f4b" });
}

async function createAtDestination(def, key, data, destination, selected) {
  if (destination === "world") {
    if (def.documentName === "Actor") {
      const folder = await ensureActorFolder(key);
      data.folder = folder.id;
      const actor = await Actor.create(data);
      actor?.sheet?.render(true);
      return { count: actor ? 1 : 0, label: `Actors > ${folder.name}`, document: actor };
    }
    const item = await Item.create(data);
    item?.sheet?.render(true);
    return { count: item ? 1 : 0, label: "World Items", document: item };
  }
  if (destination === "selected") {
    if (def.documentName !== "Item" || !selected.length) return { count: 0, label: "Selected Actors" };
    let count = 0;
    for (const actor of selected) {
      const copy = foundry.utils.deepClone(data);
      delete copy._id;
      const created = await actor.createEmbeddedDocuments("Item", [copy]);
      count += created.length;
    }
    return { count, label: `${selected.length} selected Actor${selected.length === 1 ? "" : "s"}` };
  }
  let pack = null;
  if (destination === "custom-pack") pack = await ensureCustomPack(def.documentName);
  else if (destination.startsWith("pack:")) pack = game.packs?.get?.(destination.slice(5));
  if (!pack) throw new Error("Destination Compendium was not found.");
  const DocClass = pack.documentClass ?? (def.documentName === "Actor" ? Actor : Item);
  const created = await DocClass.create(data, { pack: pack.collection });
  return { count: created ? 1 : 0, label: pack.metadata?.label ?? pack.title ?? pack.collection, document: created };
}

async function chooseTypeAndMode() {
  return await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Content Studio", resizable: true }, position: { width: 640 }, modal: false, rejectClose: false,
    content: `<form class="rg-content-studio"><header class="rg-studio-hero"><div><div class="rg-studio-kicker">REALM GUARD · GM</div><h2>Content Studio</h2><p>Create native Realm Guard content or duplicate and modify an existing World, Actor or Compendium document.</p></div><i class="fa-solid fa-wand-magic-sparkles"></i></header><div class="rg-studio-type-grid">${CONTENT_TYPES.map((entry, index) => `<label class="rg-studio-type-card"><input type="radio" name="type" value="${entry.key}" ${index === 0 ? "checked" : ""}><i class="${entry.icon}"></i><span><b>${esc(entry.label)}</b><small>${esc(entry.hint)}</small></span></label>`).join("")}</div><div class="rg-studio-mode-row"><label><input type="radio" name="mode" value="new" checked><span><b>Create New</b><small>Start from safe Realm Guard defaults.</small></span></label><label><input type="radio" name="mode" value="duplicate"><span><b>Duplicate &amp; Modify</b><small>Use existing content as a template.</small></span></label></div></form>`,
    buttons: [
      { action: "next", label: "Next", icon: "fa-solid fa-arrow-right", default: true, callback: (_event, button) => ({ type: String(button.form?.elements?.type?.value ?? ""), mode: String(button.form?.elements?.mode?.value ?? "new") }) },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
}

async function editContent(key, source, selected) {
  const def = typeDef(key);
  if (!def) return null;
  return await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Content Studio · ${def.label}`, resizable: true }, position: { width: 760, height: 760 }, modal: false, rejectClose: false,
    content: `<form class="rg-content-studio rg-studio-editor"><header class="rg-studio-editor-head"><div><div class="rg-studio-kicker">${source ? "DUPLICATE & MODIFY" : "CREATE NEW"}</div><h2><i class="${def.icon}"></i> ${esc(def.label)}</h2><p>${source ? `Source: ${esc(source.name)}` : esc(def.hint)}</p></div></header>${editorFields(key, source)}<hr><label>Destination<select name="destination">${destinationOptions(def, selected)}</select><small>Custom Compendium is recommended so the eight Starter Packs remain clean reference libraries.</small></label></form>`,
    buttons: [
      { action: "review", label: "Review", icon: "fa-solid fa-magnifying-glass", default: true, callback: (_event, button) => ({ values: collectEditor(key, button), destination: String(formValue(button, "destination", "world")) }) },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
}

async function reviewContent(key, values, destination, source, selected) {
  const def = typeDef(key);
  const destLabel = destination === "world" ? `World ${def.documentName === "Actor" ? "Actors" : "Items"}` : destination === "selected" ? `${selected.length} selected Actor${selected.length === 1 ? "" : "s"}` : destination === "custom-pack" ? `Realm Guard Custom ${def.documentName === "Actor" ? "Actor" : "Item"} Compendium` : (game.packs?.get?.(destination.slice(5))?.metadata?.label ?? "Compendium");
  const rows = previewRows(key, values, source);
  rows.push(["Destination", destLabel]);
  return await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Content Studio · Review", resizable: true }, position: { width: 620 }, modal: false, rejectClose: false,
    content: `<div class="rg-content-studio rg-studio-review"><div class="rg-studio-kicker">REVIEW BEFORE CREATE</div><h2>${esc(values.name)}</h2><div class="rg-studio-preview-card">${rows.map(([label, value]) => `<div><small>${esc(label)}</small><b>${esc(value)}</b></div>`).join("")}</div><div class="rg-studio-note"><i class="fa-solid fa-shield"></i><span>Nothing is written until you press <b>Create Content</b>. Cancel is side-effect free. Duplicate mode creates a new document and never edits the source.</span></div></div>`,
    buttons: [
      { action: "create", label: "Create Content", icon: "fa-solid fa-wand-magic-sparkles", default: true, callback: () => true },
      { action: "back", label: "Back", icon: "fa-solid fa-arrow-left", callback: () => "back" },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
}

export async function openContentStudio() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Content Studio is GM-only.");
  try {
    const first = await chooseTypeAndMode();
    if (!first?.type) return null;
    const def = typeDef(first.type);
    if (!def) return ui.notifications.warn("Realm Guard: Unknown Content Studio type.");
    const source = first.mode === "duplicate" ? await chooseSource(first.type) : null;
    if (first.mode === "duplicate" && !source) return null;
    const selected = selectedRealmGuardActors();
    while (true) {
      const edited = await editContent(first.type, source, selected);
      if (!edited) return null;
      if (edited.values?.error) { ui.notifications.warn(`Realm Guard: ${edited.values.error}`); continue; }
      const decision = await reviewContent(first.type, edited.values, edited.destination, source, selected);
      if (!decision) return null;
      if (decision === "back") continue;
      const data = def.documentName === "Actor" ? actorDataFromEditor(first.type, edited.values, source) : itemDataFromEditor(first.type, edited.values, source);
      const created = await createAtDestination(def, first.type, data, edited.destination, selected);
      if (!created.count) return ui.notifications.warn("Realm Guard: No content was created.");
      ui.notifications.info(`Realm Guard: ${edited.values.name} created in ${created.label}.`);
      await ChatMessage.create({ content: `<div class="realm-guard rg-chat-card rg-studio-chat"><span class="rg-kicker">CONTENT STUDIO</span><h3>${esc(edited.values.name)}</h3><p>${esc(def.label)} · ${esc(source ? "Duplicate & Modify" : "Create New")} · ${esc(created.label)}</p></div>` });
      return created.document ?? created.count;
    }
  } catch (error) {
    console.error("Realm Guard | Content Studio failed", error);
    ui.notifications.error("Realm Guard: Content Studio could not create the content. Check the F12 Console for details.");
    return null;
  }
}

export function installContentStudio() {
  registerGmDockTool({ id: "content-studio", icon: "fa-solid fa-wand-magic-sparkles", tooltip: "Open Content Studio", order: 6, onClick: openContentStudio });
}
