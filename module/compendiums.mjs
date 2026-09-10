import { registerGmDockTool } from "./gm-dock.mjs";
import { RG_DEFAULT_SKILLS } from "./default-skills.mjs";
import { RG_DEFAULT_CONDITIONS } from "./conditions.mjs";
import { STARTER_TALENTS } from "./talents.mjs";

const STARTER_VERSION = "0.24.0";
const SETTING_KEY = "starterCompendiumSeedVersion";
const FLAG_SCOPE = "realm-guard";

const PACKS = Object.freeze({
  skills: { name: "realm-guard-starter-skills", label: "Realm Guard · Starter Skills", type: "Item" },
  traits: { name: "realm-guard-starter-traits", label: "Realm Guard · Starter Traits", type: "Item" },
  wises: { name: "realm-guard-starter-wises", label: "Realm Guard · Starter Wises", type: "Item" },
  conditions: { name: "realm-guard-starter-conditions", label: "Realm Guard · Starter Conditions", type: "Item" },
  gear: { name: "realm-guard-starter-gear", label: "Realm Guard · Starter Gear", type: "Item" },
  powers: { name: "realm-guard-starter-tokens-of-power", label: "Realm Guard · Starter Tokens of Power", type: "Item" },
  talents: { name: "realm-guard-starter-talents", label: "Realm Guard · Starter Talents", type: "Item" },
  npcs: { name: "realm-guard-starter-npc-templates", label: "Realm Guard · Starter NPC Templates", type: "Actor" }
});

const TRAIT_NAMES = Object.freeze([
  "Bitter", "Bodyguard", "Bold", "Brave", "Calm", "Clever", "Compassionate", "Cunning", "Curious", "Defender", "Determined", "Driven", "Early Riser", "Extrovert", "Fat", "Fearful", "Fearless", "Fiery", "Generous", "Graceful", "Greybeard", "Hard Worker", "Independent", "Innocent", "Jaded", "Keen-Eared", "Leader", "Lost", "Natural Bearings", "Nimble", "Nocturnal", "Open-Minded", "Quick-Witted", "Quiet", "Rational", "Realm's Honor", "Rough Hands", "Scarred", "Sharp-Eyed", "Short", "Skeptical", "Skinny", "Steady Hand", "Stern", "Stoic", "Stubborn", "Suspicious", "Tall", "Thoughtful", "Tough", "Weather Sense", "Wise", "Young"
]);

const WISE_NAMES = Object.freeze([
  "Anduin-wise", "Angmar-wise", "Armor-wise", "Arnor-wise", "Bandit-wise", "Bat-wise", "Barrow-wise", "Beer-wise", "Blizzard-wise", "Bree-land-wise", "Captain-wise", "Celebrations-wise", "Coast-wise", "Cold-wise", "Craft-wise", "Crop-wise", "Crow-wise", "Deadman's Dike-wise", "Drought-wise", "Dwarf-wise", "Dwarven rune-wise", "Eagle-wise", "Elf-wise", "Elven sanctuary-wise", "Epidemic-wise", "Erebor-wise", "Esgaroth-wise", "Escort-wise", "Famine-wise", "Fireworks-wise", "First Age-wise", "Flood-wise", "Forest-wise", "Funeral rites-wise", "Gondor-wise", "Governing-wise", "Heat-wise", "Herb-wise", "Herd-wise", "Hobbit-wise", "Horse-wise", "Inn-wise", "Ithilien-wise", "Lake-wise", "Lord-wise", "Lothlorien-wise", "Medicine-wise", "Minerals-wise", "Mirkwood-wise", "Mordor-wise", "Moria-wise", "Morgul-wise", "Mountain-wise", "Night-wise", "Open ground-wise", "Orc-wise", "Orthanc-wise", "Palantir-wise", "Path-wise", "Pipeweed-wise", "Poems-wise", "Poison-wise", "Rain-wise", "Rebellion-wise", "Recipe-wise", "Refuge-wise", "Reunited Realms-wise", "Rhovanion-wise", "River-wise", "Road-wise", "Rohan-wise", "Rumor-wise", "Sea-wise", "Second Age-wise", "Shield-wise", "Ship-wise", "Shire-wise", "Shore-wise", "Snow-wise", "Song-wise", "Spider-wise", "Star-wise", "Stream-wise", "Swamp-wise", "Tale-wise", "Third Age-wise", "Thunderstorm-wise", "Tide-wise", "Tokens of Power-wise", "Tradesman-wise", "Trail-wise", "Trap-wise", "Troll-wise", "Tunnel-wise", "War-wise", "Warg-wise", "Watchtower-wise", "Wight-wise", "Wilds-wise", "Wine-wise", "Wizard-wise"
]);

function starterFlags(key, category) {
  return { [FLAG_SCOPE]: { starterKey: key, starterCategory: category, starterVersion: STARTER_VERSION } };
}

function slug(value) {
  return String(value ?? "").trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function learningForRating(rating = 0) {
  const r = Math.max(0, Math.trunc(Number(rating ?? 0)));
  if (r <= 0) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 };
  if (r === 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

function skillDoc(name) {
  return {
    name,
    type: "role",
    flags: starterFlags(`skill:${slug(name)}`, "skills"),
    system: {
      rating: 0,
      learning: learningForRating(0),
      description: "Canonical Realm Guard Skill reference. Rangers already receive the canonical Skill set; use this compendium as a rules/content library and for custom workflows.",
      notes: "",
      versus: false,
      beginnerAbility: "",
      beginnerAttempts: 0
    }
  };
}

function traitDoc(name) {
  return {
    name,
    type: "trait",
    flags: starterFlags(`trait:${slug(name)}`, "traits"),
    system: {
      rating: 1,
      description: "Starter Realm Guard Trait entry. Trait level and fictional meaning belong to the character; edit the imported copy freely."
    }
  };
}

function wiseDoc(name) {
  return {
    name,
    type: "wise",
    flags: starterFlags(`wise:${slug(name)}`, "wises"),
    system: { description: "Starter Wise example from Realm Guard Recruitment. Wises remain unrated in the current Realm Guard project scope." }
  };
}

function conditionDoc(condition) {
  return {
    name: condition.name,
    type: "condition",
    flags: starterFlags(`condition:${slug(condition.name)}`, "conditions"),
    system: {
      active: false,
      icon: condition.icon,
      rollModifier: Number(condition.rollModifier ?? 0),
      appliesTo: String(condition.appliesTo ?? "all"),
      recoveryType: String(condition.recoveryType ?? "manual"),
      recoveryAbility: String(condition.recoveryAbility ?? ""),
      recoveryRole: String(condition.recoveryRole ?? ""),
      recoveryObstacle: Number(condition.recoveryObstacle ?? 1),
      recoveryNote: String(condition.recoveryNote ?? ""),
      description: String(condition.description ?? "")
    }
  };
}

function gearDoc(name, { hands = 0, slots = 1, bundle = 1, containerType = "none", capacity = 0, description = "" } = {}) {
  return {
    name,
    type: "gear",
    flags: starterFlags(`gear:${slug(name)}`, "gear"),
    system: {
      quantity: 1,
      description: description || "Starter Realm Guard Gear. Import or drag a copy to an Actor, then place it on the Inventory paper-doll or in a container.",
      inventory: {
        mode: "unassigned",
        location: "",
        containerId: "",
        slots,
        bundle,
        wieldHands: hands,
        containerType,
        capacity
      }
    }
  };
}

const GEAR = Object.freeze([
  gearDoc("Shield", { hands: 1, description: "A hand-held shield. Conflict qualities are handled by the Realm Guard Conflict Engine when equipped and selected." }),
  gearDoc("Knife", { hands: 1 }),
  gearDoc("Dagger", { hands: 1 }),
  gearDoc("Sword", { hands: 1 }),
  gearDoc("Axe", { hands: 1 }),
  gearDoc("Staff", { hands: 2 }),
  gearDoc("Spear", { hands: 2 }),
  gearDoc("Whip", { hands: 1, description: "Realm Guard handling of Hook & Line for Recruitment/Conflict weapon use." }),
  gearDoc("Halberd", { hands: 2 }),
  gearDoc("Sling", { hands: 1 }),
  gearDoc("Bow", { hands: 2 }),
  gearDoc("Mail Shirt", { slots: 2 }),
  gearDoc("Leather Armor", { slots: 2 }),
  gearDoc("Helmet"),
  gearDoc("Cloak"),
  gearDoc("Backpack", { slots: 2, containerType: "backpack", capacity: 6, description: "Inventory container preset: 6 pack slots. Equip it on the Torso to activate its storage." }),
  gearDoc("Satchel", { slots: 1, containerType: "satchel", capacity: 3, description: "Inventory container preset: 3 pack slots. Equip it on the Torso to activate its storage." }),
  gearDoc("Pouch", { containerType: "custom", capacity: 1 }),
  gearDoc("Rope"),
  gearDoc("Rations", { bundle: 3 }),
  gearDoc("Waterskin"),
  gearDoc("Torches", { bundle: 3 }),
  gearDoc("Healing Herbs"),
  gearDoc("Lantern")
]);

function tokenDoc(name, level, { linkType = "skill", linkedSkill = "", linkedUse = "", effectMode = "level", form = "Relic", origin = "", description = "" } = {}) {
  return {
    name,
    type: "tokenOfPower",
    flags: starterFlags(`token:${slug(name)}`, "tokens-of-power"),
    system: {
      level,
      linkType,
      linkedSkill,
      linkedUse,
      effectMode,
      form,
      origin,
      description,
      session: { used: false }
    }
  };
}

const TOKENS_OF_POWER = Object.freeze([
  tokenDoc("Token of Power · Level 1 Template", 1, { linkedSkill: "Fighter", description: "Rename and relink this template. Level 1 grants +1D once per session on an appropriate linked use." }),
  tokenDoc("Token of Power · Level 2 Template", 2, { linkedSkill: "Fighter", description: "Rename and relink this template. Level 2 grants +1D on every appropriate linked use." }),
  tokenDoc("Token of Power · Level 3 Template", 3, { linkedSkill: "Fighter", description: "Rename and relink this template. Level 3 can reroll failed dice once per session on an appropriate linked use." }),
  tokenDoc("Token of Power · Specific Use Template", 2, { linkType: "specific", linkedUse: "Write the narrow fictional/mechanical use here", effectMode: "manual", form: "Named relic", description: "Use this template for effects the system must surface without guessing, such as a narrow disposition or fictional effect." })
]);

function talentDoc(talent) {
  return {
    name: talent.name,
    type: "talent",
    flags: starterFlags(`talent:${talent.key}`, "talents"),
    system: {
      sourceKey: talent.key,
      minLevel: Number(talent.minLevel ?? 2),
      frequency: String(talent.frequency ?? "session"),
      linkType: String(talent.linkType ?? "skill"),
      linkedSkill: String(talent.linkedSkill ?? ""),
      linkedAbility: String(talent.linkedAbility ?? ""),
      effectMode: String(talent.effectMode ?? "dice"),
      diceBonus: Number(talent.diceBonus ?? 1),
      description: String(talent.description ?? ""),
      session: { used: false },
      conflict: { usedId: "" }
    }
  };
}

function npcSkill(name, rating) {
  return {
    name,
    type: "role",
    flags: { [FLAG_SCOPE]: { starterNpcSkill: true } },
    system: {
      rating,
      learning: learningForRating(rating),
      description: "",
      notes: "",
      versus: false,
      beginnerAbility: "",
      beginnerAttempts: 0
    }
  };
}

function npcGear(name, { hands = 0, mode = "unassigned", location = "", slots = 1 } = {}) {
  return {
    name,
    type: "gear",
    flags: { [FLAG_SCOPE]: { starterNpcGear: true } },
    system: {
      quantity: 1,
      description: "Starter NPC template gear; edit or delete freely after importing the NPC.",
      inventory: { mode, location, containerId: "", slots, bundle: 1, wieldHands: hands, containerType: "none", capacity: 0 }
    }
  };
}

function npcDoc(name, { rank, concept, nature = 3, will = 3, health = 3, resources = 1, circles = 1, skills = [], gear = [] } = {}) {
  return {
    name,
    type: "npc",
    img: "systems/realm-guard/assets/actors/npc-creature.webp",
    flags: starterFlags(`npc:${slug(name)}`, "npc-templates"),
    system: {
      biography: "",
      notes: "Starter NPC template. This is a Foundry convenience baseline, not a mandatory canonical stat block; tune it for the scene and campaign.",
      concept: concept ?? "",
      rank: rank ?? "",
      homeland: "",
      age: "",
      lineage: "",
      insignia: "",
      seniorArtisan: "",
      friend: "",
      cloak: "",
      weapon: "",
      mentor: "",
      enemy: "",
      parents: "",
      belief: "",
      goal: "",
      instinct: "",
      attributes: {
        nature: { value: nature, maximum: nature },
        will: { value: will, max: Math.max(1, will) },
        health: { value: health, max: Math.max(1, health) },
        resources: { value: resources, max: Math.max(1, resources) },
        circles: { value: circles, max: Math.max(1, circles) }
      },
      resources: { fate: { value: 0, max: 5 }, persona: { value: 0, max: 5 }, checks: { value: 0, max: 9 } },
      progression: { level: 1, spentFate: 0, spentPersona: 0 },
      roll: { versus: false, obstacle: 1, modifier: 0 }
    },
    items: [
      ...skills.map(([skillName, rating]) => npcSkill(skillName, rating)),
      ...gear
    ]
  };
}

const NPCS = Object.freeze([
  npcDoc("Ranger Ally · Scout", { rank: "Scout", concept: "Dunadan patrol ally", nature: 3, will: 3, health: 5, resources: 2, circles: 2, skills: [["Scout", 4], ["Pathfinder", 4], ["Fighter", 3], ["Survivalist", 3]], gear: [npcGear("Bow", { hands: 2, mode: "hand", location: "right-hand" }), npcGear("Dagger", { hands: 1, mode: "belt", location: "belt" }), npcGear("Cloak", { mode: "worn", location: "cloak" })] }),
  npcDoc("Town Guard", { rank: "Guard", concept: "Local watch or garrison soldier", nature: 3, will: 3, health: 4, resources: 1, circles: 1, skills: [["Fighter", 3], ["Scout", 2], ["Persuader", 2]], gear: [npcGear("Spear", { hands: 1, mode: "hand", location: "right-hand" }), npcGear("Shield", { hands: 1, mode: "hand", location: "left-hand" }), npcGear("Mail Shirt", { mode: "worn", location: "torso", slots: 2 })] }),
  npcDoc("Veteran Soldier", { rank: "Veteran", concept: "Experienced warrior", nature: 3, will: 4, health: 4, resources: 2, circles: 2, skills: [["Fighter", 4], ["Militarist", 3], ["Scout", 3]], gear: [npcGear("Sword", { hands: 1, mode: "hand", location: "right-hand" }), npcGear("Shield", { hands: 1, mode: "hand", location: "left-hand" }), npcGear("Mail Shirt", { mode: "worn", location: "torso", slots: 2 }), npcGear("Helmet", { mode: "worn", location: "head" })] }),
  npcDoc("Brigand", { rank: "Brigand", concept: "Roadside raider or outlaw", nature: 3, will: 3, health: 4, resources: 1, circles: 1, skills: [["Fighter", 3], ["Scout", 3], ["Deceiver", 2]], gear: [npcGear("Axe", { hands: 1, mode: "hand", location: "right-hand" }), npcGear("Shield", { hands: 1, mode: "hand", location: "left-hand" }), npcGear("Leather Armor", { mode: "worn", location: "torso", slots: 2 })] }),
  npcDoc("Orc Scout", { rank: "Scout", concept: "Enemy scout and skirmisher", nature: 4, will: 3, health: 4, resources: 0, circles: 1, skills: [["Scout", 4], ["Fighter", 3], ["Pathfinder", 3], ["Hunter", 3]], gear: [npcGear("Bow", { hands: 2, mode: "hand", location: "right-hand" }), npcGear("Dagger", { hands: 1, mode: "belt", location: "belt" })] }),
  npcDoc("Orc Warrior", { rank: "Warrior", concept: "Enemy infantry", nature: 4, will: 3, health: 5, resources: 0, circles: 1, skills: [["Fighter", 4], ["Hunter", 3], ["Scout", 2]], gear: [npcGear("Axe", { hands: 1, mode: "hand", location: "right-hand" }), npcGear("Shield", { hands: 1, mode: "hand", location: "left-hand" }), npcGear("Leather Armor", { mode: "worn", location: "torso", slots: 2 })] }),
  npcDoc("Warg", { rank: "Creature", concept: "Large predatory beast", nature: 5, will: 2, health: 5, resources: 0, circles: 0, skills: [["Hunter", 4], ["Scout", 4], ["Fighter", 3]] }),
  npcDoc("Enemy Captain", { rank: "Captain", concept: "Leader of an enemy warband", nature: 4, will: 4, health: 5, resources: 2, circles: 2, skills: [["Fighter", 5], ["Militarist", 4], ["Orator", 3], ["Scout", 3]], gear: [npcGear("Sword", { hands: 1, mode: "hand", location: "right-hand" }), npcGear("Shield", { hands: 1, mode: "hand", location: "left-hand" }), npcGear("Mail Shirt", { mode: "worn", location: "torso", slots: 2 }), npcGear("Helmet", { mode: "worn", location: "head" }), npcGear("Cloak", { mode: "worn", location: "cloak" })] })
]);

export const RG_STARTER_LIBRARY = Object.freeze({
  skills: Object.freeze(RG_DEFAULT_SKILLS.map(skillDoc)),
  traits: Object.freeze(TRAIT_NAMES.map(traitDoc)),
  wises: Object.freeze(WISE_NAMES.map(wiseDoc)),
  conditions: Object.freeze(RG_DEFAULT_CONDITIONS.map(conditionDoc)),
  gear: GEAR,
  powers: TOKENS_OF_POWER,
  talents: Object.freeze(STARTER_TALENTS.map(talentDoc)),
  npcs: NPCS
});

function isPrimaryActiveGm() {
  if (!game.user?.isGM) return false;
  const activeGms = (game.users?.contents ?? []).filter(user => user.active && user.isGM).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return !activeGms.length || activeGms[0].id === game.user.id;
}

async function createPack(definition) {
  const collectionKey = `world.${definition.name}`;
  const existing = game.packs?.get?.(collectionKey);
  if (existing) return { pack: existing, created: false };
  if (!game.user?.isGM) return { pack: null, created: false };

  const Collection = foundry?.documents?.collections?.CompendiumCollection ?? globalThis.CompendiumCollection;
  if (!Collection?.createCompendium) throw new Error("CompendiumCollection.createCompendium is unavailable in this Foundry build.");
  const pack = await Collection.createCompendium({
    name: definition.name,
    label: definition.label,
    type: definition.type,
    package: "world",
    system: "realm-guard"
  });
  return { pack: pack ?? game.packs?.get?.(collectionKey) ?? null, created: true };
}

async function starterIdentitySet(pack) {
  const docs = await pack.getDocuments();
  const keys = new Set();
  const names = new Set();
  for (const doc of docs) {
    const key = String(doc.getFlag?.(FLAG_SCOPE, "starterKey") ?? "").trim();
    if (key) keys.add(key);
    names.add(`${String(doc.type ?? "").toLowerCase()}::${String(doc.name ?? "").trim().toLowerCase()}`);
  }
  return { keys, names };
}

async function seedPack(pack, documents) {
  if (!pack || !documents?.length) return 0;
  const identities = await starterIdentitySet(pack);
  const missing = documents.filter(data => {
    const key = String(data.flags?.[FLAG_SCOPE]?.starterKey ?? "").trim();
    const nameKey = `${String(data.type ?? "").toLowerCase()}::${String(data.name ?? "").trim().toLowerCase()}`;
    return key ? !identities.keys.has(key) && !identities.names.has(nameKey) : !identities.names.has(nameKey);
  });
  if (!missing.length) return 0;
  const DocClass = pack.documentClass ?? globalThis.getDocumentClass?.(pack.documentName);
  if (!DocClass?.createDocuments) throw new Error(`No document class available for ${pack.collection}.`);
  await DocClass.createDocuments(missing, { pack: pack.collection, realmGuardStarterSeed: true, realmGuardSkipRecruitmentProvisioning: pack.documentName === "Actor" });
  return missing.length;
}

export async function ensureStarterCompendiums({ syncMissing = false, notify = false } = {}) {
  if (!game.user?.isGM) return { packs: 0, createdPacks: 0, added: 0 };
  const mapping = [
    [PACKS.skills, RG_STARTER_LIBRARY.skills],
    [PACKS.traits, RG_STARTER_LIBRARY.traits],
    [PACKS.wises, RG_STARTER_LIBRARY.wises],
    [PACKS.conditions, RG_STARTER_LIBRARY.conditions],
    [PACKS.gear, RG_STARTER_LIBRARY.gear],
    [PACKS.powers, RG_STARTER_LIBRARY.powers],
    [PACKS.talents, RG_STARTER_LIBRARY.talents],
    [PACKS.npcs, RG_STARTER_LIBRARY.npcs]
  ];
  let packs = 0;
  let createdPacks = 0;
  let added = 0;
  let failed = 0;
  for (const [definition, documents] of mapping) {
    try {
      const { pack, created } = await createPack(definition);
      if (!pack) continue;
      packs += 1;
      if (created) createdPacks += 1;
      if (created || syncMissing) added += await seedPack(pack, documents);
    } catch (error) {
      failed += 1;
      console.error(`Realm Guard | Starter Compendium failed: ${definition.label}`, error);
    }
  }
  if (notify) {
    if (added || createdPacks) ui.notifications.info(`Realm Guard: Starter Library ready · ${packs} packs · ${added} starter entries added. Existing entries were not overwritten.`);
    else ui.notifications.info("Realm Guard: Starter Library is already up to date. Existing entries were left untouched.");
  }
  return { packs, createdPacks, added, failed };
}

export async function openStarterCompendiums({ syncMissing = false } = {}) {
  const result = await ensureStarterCompendiums({ syncMissing, notify: syncMissing });
  if (!result.packs) return ui.notifications.warn("Realm Guard: Starter Compendiums could not be opened.");
  if (typeof ui.sidebar?.activateTab === "function") await ui.sidebar.activateTab("compendium");
  else if (typeof ui.sidebar?.changeTab === "function") ui.sidebar.changeTab("compendium");
  if (!syncMissing) ui.notifications.info("Realm Guard: Opened Starter Compendiums.");
}

async function openStarterLibraryDialog() {
  if (!game.user?.isGM) return;
  const counts = Object.fromEntries(Object.entries(RG_STARTER_LIBRARY).map(([key, docs]) => [key, docs.length]));
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Starter Library", resizable: true },
    content: `<div class="rg-starter-library-dialog"><h2><i class="fa-solid fa-book-atlas"></i> Starter Compendiums</h2><p>The Starter Library contains reusable Realm Guard content for a clean world.</p><div class="rg-starter-library-grid"><span>Skills <b>${counts.skills}</b></span><span>Traits <b>${counts.traits}</b></span><span>Wises <b>${counts.wises}</b></span><span>Conditions <b>${counts.conditions}</b></span><span>Gear <b>${counts.gear}</b></span><span>Tokens of Power <b>${counts.powers}</b></span><span>Talents <b>${counts.talents}</b></span><span>NPC Templates <b>${counts.npcs}</b></span></div><p><small><b>Non-destructive:</b> sync only adds missing starter entries. It never overwrites an existing or edited entry.</small></p></div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "open", label: "Open Library", icon: "fa-solid fa-book-open", default: true, callback: () => "open" },
      { action: "sync", label: "Add Missing Entries", icon: "fa-solid fa-rotate", callback: () => "sync" },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (result === "sync") return openStarterCompendiums({ syncMissing: true });
  if (result === "open") return openStarterCompendiums({ syncMissing: false });
}

async function initialSeed() {
  if (!isPrimaryActiveGm()) return;
  const seededVersion = String(game.settings.get("realm-guard", SETTING_KEY) ?? "");
  const syncMissing = seededVersion !== STARTER_VERSION;
  const result = await ensureStarterCompendiums({ syncMissing, notify: syncMissing });
  if (syncMissing && result.packs === Object.keys(PACKS).length && !result.failed) await game.settings.set("realm-guard", SETTING_KEY, STARTER_VERSION);
}

export function installStarterCompendiums() {
  game.settings.register("realm-guard", SETTING_KEY, {
    name: "Realm Guard Starter Compendium Seed Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  registerGmDockTool({
    id: "starter-library",
    icon: "fa-solid fa-book-atlas",
    tooltip: "Starter Compendiums",
    order: 25,
    onClick: openStarterLibraryDialog
  });

  Hooks.once("ready", () => { void initialSeed(); });
}
