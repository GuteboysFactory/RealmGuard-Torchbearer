import { isTb2eWizardActor } from "./tb2e-wizard-qa.mjs";
import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { learningForRating } from "./recruitment-catalog.mjs";

export const RG_DEFAULT_SKILLS = [
  "Administrator",
  "Alchemist",
  "Animal Handler",
  "Archivist",
  "Armorer",
  "Baker",
  "Boatcrafter",
  "Brewer",
  "Carpenter",
  "Cartographer",
  "Cook",
  "Deceiver",
  "Farmer",
  "Fighter",
  "Glazier",
  "Haggler",
  "Healer",
  "Herdsman",
  "Hunter",
  "Instructor",
  "Laborer",
  "Lore Master",
  "Militarist",
  "Miller",
  "Orator",
  "Pathfinder",
  "Persuader",
  "Potter",
  "Rider",
  "Scout",
  "Smith",
  "Stonemason",
  "Survivalist",
  "Weather Watcher",
  "Weaver"
];

const normalizeSkillName = value => String(value ?? "").trim().toLowerCase();
const legacySkillKey = name => normalizeSkillName(name).replace(/^manipulater$/, "manipulator");

export const isLegacyMixedSkill = name => normalizeSkillName(name) !== "deceiver";
export const LEGACY_MIXED_DEFAULT_SKILLS = Object.freeze(
  [...RG_DEFAULT_SKILLS.filter(isLegacyMixedSkill), "Manipulator"].sort((a, b) => a.localeCompare(b))
);
export const activeDefaultSkills = () => legacyMixedPolishEnabled() ? LEGACY_MIXED_DEFAULT_SKILLS : RG_DEFAULT_SKILLS;
export const isAvailableSkill = name => !legacyMixedPolishEnabled() || isLegacyMixedSkill(name);

export const isDefaultSkill = item => Boolean(item?.getFlag?.("realm-guard", "defaultSkill"));

async function transferDeceiverLearning(roles, manipulator) {
  if (!manipulator) return;
  const copiedIds = new Set(manipulator.getFlag("realm-guard", "deceiverLearningSources") ?? []);
  const sources = roles.filter(item => normalizeSkillName(item.name) === "deceiver"
    && Number(item.system.rating ?? 0) > 0 && !copiedIds.has(item.id));
  if (!sources.length) return;

  const rating = Math.max(Number(manipulator.system.rating ?? 0), ...sources.map(item => Number(item.system.rating)));
  const learning = learningForRating(rating);
  for (const field of ["passed", "failed"]) {
    learning[field] = [manipulator, ...sources].reduce((total, item) => total + Number(item.system.learning?.[field] ?? 0), 0);
  }
  // Store progress and the source IDs in the same update so retrying cannot add it twice.
  await manipulator.update({
    "system.rating": rating,
    "system.learning": learning,
    "flags.realm-guard.deceiverLearningSources": [...copiedIds, ...sources.map(item => item.id)]
  });
}

export async function ensureDefaultSkills(actor) {
  if (!actor || !["character", "npc"].includes(actor.type)) return [];
  if (isTb2eWizardActor(actor)) return [];

  const legacy = legacyMixedPolishEnabled();
  const key = legacy ? legacySkillKey : normalizeSkillName;
  const roles = actor.items.filter(i => i.type === "role");
  const existing = new Map(roles.map(r => [key(r.name), r]));
  const create = [];

  for (const name of activeDefaultSkills()) {
    const found = existing.get(key(name));
    if (found) {
      // Adopt an already-existing canonical skill without changing its rating or learning data.
      if (!isDefaultSkill(found)) await found.setFlag("realm-guard", "defaultSkill", true);
      continue;
    }
    create.push({
      name,
      type: "role",
      flags: { "realm-guard": { defaultSkill: true } },
      system: {
        rating: 0,
        learning: { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 },
        description: "",
        notes: "",
        versus: false
      }
    });
  }

  const created = create.length ? await actor.createEmbeddedDocuments("Item", create) : [];
  if (legacy) {
    const manipulator = existing.get("manipulator") ?? created.find(item => key(item.name) === "manipulator");
    await transferDeceiverLearning(roles, manipulator);
  }
  return created;
}

let rgDefaultSkillsMigrationRunning = false;

async function migrateExistingActors() {
  if (!game.user?.isGM || rgDefaultSkillsMigrationRunning) return;

  const activeGMs = game.users
    .filter(u => u.active && u.isGM)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  if (activeGMs.length && activeGMs[0].id !== game.user.id) return;

  rgDefaultSkillsMigrationRunning = true;
  try {
    let added = 0;
    for (const actor of game.actors?.contents ?? []) {
      if (!["character", "npc"].includes(actor.type)) continue;
      try {
        const created = await ensureDefaultSkills(actor);
        added += created.length;
      } catch (err) {
        console.error(`Realm Guard | Could not provision default skills for ${actor.name}`, err);
      }
    }

    if (added) {
      console.log(`Realm Guard | Added ${added} missing default skill entries to existing Actors.`);
      ui.notifications?.info?.(`Realm Guard: Added ${added} missing default skill entries.`);
    }
  } finally {
    rgDefaultSkillsMigrationRunning = false;
  }
}

export function installDefaultSkillProvisioning() {
  // New Actors: provision on the client which created the document.
  Hooks.on("createActor", async (actor, _options, userId) => {
    if (_options?.realmGuardSkipRecruitmentProvisioning) return;
    if (userId !== game.user.id) return;
    if (!["character", "npc"].includes(actor.type)) return;

    try {
      await ensureDefaultSkills(actor);
    } catch (err) {
      console.error(`Realm Guard | Could not provision default skills for new Actor ${actor.name}`, err);
    }
  });

  // Existing Actors:
  // If this function is installed before Foundry is ready, use the normal ready hook.
  // If Foundry is already ready (for example after a hot reload / system update),
  // run migration immediately instead of registering a hook which will never fire.
  if (game.ready) {
    queueMicrotask(() => migrateExistingActors());
  } else {
    Hooks.once("ready", migrateExistingActors);
  }
}
