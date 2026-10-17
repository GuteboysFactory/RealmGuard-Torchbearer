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

export const isDefaultSkill = item => Boolean(item?.getFlag?.("realm-guard", "defaultSkill"));

export async function ensureDefaultSkills(actor) {
  if (!actor || !["character", "npc"].includes(actor.type)) return [];

  const roles = actor.items.filter(i => i.type === "role");
  const existing = new Map(roles.map(r => [normalizeSkillName(r.name), r]));
  const create = [];

  for (const name of RG_DEFAULT_SKILLS) {
    const found = existing.get(normalizeSkillName(name));
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

  return create.length ? actor.createEmbeddedDocuments("Item", create) : [];
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
