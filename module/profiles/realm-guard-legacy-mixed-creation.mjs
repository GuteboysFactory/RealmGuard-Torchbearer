import { CharacterCreationProfile, CREATION_PROFILE_ID } from "../core/m9-creation.mjs";

const STATIONS = Object.freeze({
  recruit: { label: "Recruit", ageMin: 20, ageMax: 25, will: 2, health: 6, resources: 1, circles: 1, natural: 2, service: 3, wises: 1 },
  scout: { label: "Scout", ageMin: 25, ageMax: 45, will: 3, health: 5, resources: 2, circles: 2, natural: 1, service: 6, wises: 2 },
  veteran: { label: "Veteran", ageMin: 40, ageMax: 75, will: 4, health: 4, resources: 3, circles: 3, natural: 1, service: 8, wises: 3 },
  captain: { label: "Captain", ageMin: 50, ageMax: 90, will: 5, health: 4, resources: 4, circles: 3, natural: 1, service: 9, wises: 4 },
  lord: { label: "Lord", ageMin: 80, ageMax: 150, will: 6, health: 3, resources: 5, circles: 4, natural: 2, service: 12, wises: 6 }
});

const HOMELANDS = Object.freeze({
  rhudaur: { label: "Rhudaur", text: "Formerly the eastern nation of Arnor, including Rivendell and villages between Bree and the Misty Mountains.", skills: ["Archivist", "Animal Handler", "Carpenter"], traits: ["Calm", "Natural Bearings"] },
  bree: { label: "Bree-land", text: "A quiet area whose populace keeps to their own business.", skills: ["Miller", "Farmer", "Brewer"], traits: ["Short", "Independent"] },
  esgaroth: { label: "Esgaroth & Dale", text: "The folk of this region ply the lake and river.", skills: ["Boatcrafter", "Carpenter", "Haggler"], traits: ["Sharp-Eyed", "Driven"] },
  gondor: { label: "Gondor", text: "Includes the capital, Lebennin and Lamedon.", skills: ["Archivist", "Stonemason", "Alchemist"], traits: ["Brave", "Wise"] },
  doren: { label: "Dor-en-Ernil", text: "Includes Dol Amroth, Belfalas and Anfalas.", skills: ["Rider", "Boatcrafter", "Orator"], traits: ["Graceful", "Tall"] },
  tharbad: { label: "Tharbad", text: "A trade town on the Bruinen and Greenway.", skills: ["Haggler", "Glazier", "Laborer"], traits: ["Rational", "Hard Worker"] },
  sarn: { label: "Sarn Ford", text: "A quiet, self-sufficient town named for the ford it straddles.", skills: ["Farmer", "Stonemason", "Miller"], traits: ["Steady Hand", "Quick-Witted"] },
  rhovanion: { label: "Rhovanion", text: "Villages and communities on the western border of Mirkwood.", skills: ["Baker", "Animal Handler", "Herdsman"], traits: ["Stoic", "Tough"] }
});

const NATURE_EFFECTS = Object.freeze({ danger: -1, secondAge: 1, loss: 1, wilds: -1, married: 1, enemyFirst: -1 });
const RESOURCE_EFFECTS = Object.freeze({ trade: 1, parentsWealth: 1, gifts: -1, thrifty: 1, debt: -1, pack: 1 });
const CIRCLES_EFFECTS = Object.freeze({ gregarious: 1, rangerTies: 1, reputation: 1, enemies: -1, crime: -1, loner: -1 });
const ENEMY_SERVANTS_HOUSE_RULE = Object.freeze(["Orc", "Troll", "Warg", "Spider", "Other servant of the Enemy"]);
const WEAPON_NAMES = Object.freeze(["Shield", "Knife", "Sword", "Staff", "Spear", "Whip", "Halberd", "Sling", "Bow"]);

function sumChecks(...parts) {
  const map = {};
  const add = (name, count = 1) => {
    const key = String(name ?? "").trim();
    if (!key || Number(count) <= 0) return;
    map[key] = (map[key] ?? 0) + Number(count);
  };
  for (const part of parts) {
    if (Array.isArray(part)) part.forEach(name => add(name));
    else if (part && typeof part === "object") Object.entries(part).forEach(([name, count]) => add(name, count));
    else add(part);
  }
  return map;
}

function countWises(values = []) {
  const map = {};
  for (const name of values) {
    const key = String(name ?? "").trim();
    if (!key) continue;
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

function questionTotal(base, answers, effects, minimum = -Infinity) {
  let value = Number(base ?? 0);
  for (const [key, effect] of Object.entries(effects)) if (answers?.[key]) value += effect;
  return Math.max(minimum, value);
}

function bannedTraits(answers = {}) {
  const out = new Set();
  const nature = answers.natureAnswers ?? {};
  const resources = answers.resourceAnswers ?? {};
  const circles = answers.circleAnswers ?? {};
  if (nature.danger) { out.add("Fearful"); out.add("Young"); }
  if (nature.loss) out.add("Innocent");
  if (nature.wilds) out.add("Open-Minded");
  if (nature.married) out.add("Independent");
  if (nature.enemyFirst) out.add("Compassionate");
  if (resources.trade) out.add("Leader");
  if (resources.thrifty) out.add("Generous");
  if (resources.pack) { out.add("Bold"); out.add("Fiery"); }
  if (circles.gregarious) { out.add("Bitter"); out.add("Jaded"); }
  if (circles.loner) out.add("Extrovert");
  return out;
}

function derive({ answers = {}, allocations = {} } = {}) {
  const rank = String(answers.rank || "scout");
  const station = STATIONS[rank] ?? STATIONS.scout;
  const nature = questionTotal(3, answers.natureAnswers, NATURE_EFFECTS);
  const resources = questionTotal(station.resources, answers.resourceAnswers, RESOURCE_EFFECTS, 0);
  const circles = questionTotal(station.circles, answers.circleAnswers, CIRCLES_EFFECTS, 1);
  const banned = bannedTraits(answers);

  const skillChecks = sumChecks(
    answers.homelandSkill,
    allocations.naturalTalent,
    allocations.parentsTrade,
    allocations.convincing,
    answers.apprenticeship,
    answers.mentorTraining,
    allocations.serviceAlloc,
    answers.specialty
  );
  const traitChecks = sumChecks(answers.homelandTrait, answers.innateTrait, answers.inheritedTrait, answers.roadTrait);
  const wiseChecks = countWises(allocations.wiseChoices ?? []);
  const allocatedService = Object.values(allocations.serviceAlloc ?? {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);

  const gear = [
    { name: String(answers.weapon || "Sword"), kind: "weapon" },
    ...(String(answers.armor || "").trim() ? [{ name: String(answers.armor).trim(), kind: "armor" }] : []),
    ...String(answers.distinctiveGear || "").split(",").map(name => name.trim()).filter(Boolean).map(name => ({ name, kind: "distinctive" }))
  ];

  return {
    derivedValues: {
      identity: {
        name: String(answers.name || ""),
        concept: String(answers.concept || ""),
        rank,
        stationLabel: station.label,
        homelandKey: String(answers.homelandKey || ""),
        homeland: HOMELANDS[answers.homelandKey]?.label ?? "",
        age: Number(answers.age || station.ageMin)
      },
      nature,
      abilities: { nature, will: station.will, health: station.health, resources, circles },
      resources: { fate: 1, persona: 1, checks: 0 },
      skillChecks,
      traitChecks,
      wiseChecks,
      restrictions: { bannedTraits: [...banned].sort() },
      budgets: {
        naturalTalent: station.natural,
        parentsTrade: rank === "recruit" ? 2 : 1,
        convincing: ["captain", "lord"].includes(rank) ? 2 : 1,
        service: station.service,
        serviceAllocated: allocatedService,
        wises: station.wises
      },
      gear,
      grants: [
        { type: "RESOURCE", key: "fate", value: 1 },
        { type: "RESOURCE", key: "persona", value: 1 }
      ]
    },
    warnings: []
  };
}

function error(code, message, field = "") {
  return { code, message, field };
}

function validateStep({ stepId, draft, partyContext }) {
  const errors = [];
  const a = draft.answers ?? {};
  const alloc = draft.allocations ?? {};
  const d = draft.derivedValues ?? {};
  const rank = String(a.rank || "scout");
  const station = STATIONS[rank] ?? STATIONS.scout;
  const banned = new Set(d.restrictions?.bannedTraits ?? []);
  const relationships = a.relationships ?? {};

  if (stepId === "identity") {
    if (!String(a.name ?? "").trim()) errors.push(error("NAME_REQUIRED", "Enter the Ranger's name.", "name"));
    if (!STATIONS[rank]) errors.push(error("STATION_INVALID", "Choose a valid Station.", "rank"));
    const age = Number(a.age ?? 0);
    if (age < station.ageMin || age > station.ageMax) errors.push(error("AGE_RANGE", `${station.label} starting age must be ${station.ageMin}-${station.ageMax}.`, "age"));
  }

  if (stepId === "nature") {
    const nature = Number(d.abilities?.nature ?? 0);
    if (nature < 2 || nature > 6) errors.push(error("NATURE_RANGE", `These answers produce Nature ${nature}. A starting Ranger must have a playable starting Nature between 2 and 6; revise an answer.`, "nature"));
  }

  if (stepId === "homeland") {
    const home = HOMELANDS[a.homelandKey];
    if (!home) errors.push(error("HOMELAND_REQUIRED", "Choose a homeland. The step will then show its Skill and Trait choices.", "homelandKey"));
    else {
      if (!home.skills.includes(a.homelandSkill)) errors.push(error("HOMELAND_SKILL_REQUIRED", "Choose one Skill from your homeland.", "homelandSkill"));
      if (!home.traits.includes(a.homelandTrait)) errors.push(error("HOMELAND_TRAIT_REQUIRED", "Choose one Trait from your homeland.", "homelandTrait"));
      if (banned.has(a.homelandTrait)) errors.push(error("TRAIT_RESTRICTED", `${a.homelandTrait} is unavailable because of your Nature answers.`, "homelandTrait"));
    }
  }

  if (stepId === "life-experience") {
    const required = [
      ...(alloc.naturalTalent ?? []),
      ...(alloc.parentsTrade ?? []),
      ...(alloc.convincing ?? []),
      a.apprenticeship,
      a.mentorTraining
    ];
    const expected = Number(d.budgets?.naturalTalent ?? 0) + Number(d.budgets?.parentsTrade ?? 0) + Number(d.budgets?.convincing ?? 0) + 2;
    if (required.length !== expected || required.some(value => !String(value ?? "").trim())) {
      errors.push(error("LIFE_EXPERIENCE_INCOMPLETE", "Complete every Life Experience choice before continuing."));
    }
  }

  if (stepId === "service-specialty") {
    const allocated = Number(d.budgets?.serviceAllocated ?? 0);
    const budget = Number(d.budgets?.service ?? 0);
    if (allocated < budget) {
      const missing = budget - allocated;
      errors.push(error("SERVICE_UNDER_ALLOCATED", `You selected ${allocated} of ${budget} Service Checks. Allocate ${missing} more check${missing === 1 ? "" : "s"}.`, "serviceAlloc"));
    } else if (allocated > budget) {
      const excess = allocated - budget;
      errors.push(error("SERVICE_OVER_ALLOCATED", `You selected ${allocated} of ${budget} Service Checks. Remove ${excess} check${excess === 1 ? "" : "s"}.`, "serviceAlloc"));
    }
    if (rank !== "recruit" && !String(a.specialty ?? "").trim()) errors.push(error("SPECIALTY_REQUIRED", "Choose a Specialty.", "specialty"));
    const specialty = String(a.specialty ?? "").trim();
    const collision = specialty ? (partyContext?.existingCharacters ?? []).find(entry => String(entry?.specialty ?? "") === specialty) : null;
    if (collision) errors.push(error("SPECIALTY_NOT_UNIQUE", `${specialty} is already the Specialty of ${collision.name ?? "another Ranger"}. Choose another.`, "specialty"));
  }

  if (stepId === "wises") {
    const choices = alloc.wiseChoices ?? [];
    const count = Number(d.budgets?.wises ?? 0);
    if (choices.length !== count || choices.some(value => !String(value ?? "").trim())) errors.push(error("WISE_ALLOCATION_INCOMPLETE", `Choose all ${count} Wise checks.`, "wiseChoices"));
  }

  if (stepId === "resources-circles") {
    if (a.resourceAnswers?.trade) {
      const trade = String(a.resourceTrade ?? "").trim();
      if (!trade || Number(d.skillChecks?.[trade] ?? 0) <= 0) errors.push(error("RESOURCE_TRADE_REQUIRED", "Practicing a trade requires a trained trade Skill. Choose it or answer NO.", "resourceTrade"));
    }
    if (a.resourceAnswers?.parentsWealth && !String(a.parentsResourceProfession ?? "").trim()) errors.push(error("PARENTS_PROFESSION_REQUIRED", "Note the parents' qualifying profession for the Resources bonus.", "parentsResourceProfession"));
    if (a.circleAnswers?.rangerTies && !String(a.rangerTiesBasis ?? "").trim()) errors.push(error("RANGER_TIES_BASIS_REQUIRED", "For strong Ranger ties, identify whether the basis is Ranger parents or a mentor who is family.", "rangerTiesBasis"));
  }

  if (stepId === "traits") {
    if (banned.has(a.homelandTrait)) errors.push(error("HOMELAND_TRAIT_RESTRICTED", `${a.homelandTrait} is no longer legal after your Recruitment answers. Go back and change the conflicting answer or homeland Trait.`, "homelandTrait"));
    if (!String(a.innateTrait ?? "").trim()) errors.push(error("INNATE_TRAIT_REQUIRED", "Choose an Innate Quality.", "innateTrait"));
    if (rank === "recruit" && !String(a.inheritedTrait ?? "").trim()) errors.push(error("INHERITED_TRAIT_REQUIRED", "Recruits choose one Inherited or Learned Trait.", "inheritedTrait"));
    if (["captain", "lord"].includes(rank) && !String(a.roadTrait ?? "").trim()) errors.push(error("ROAD_TRAIT_REQUIRED", `${station.label}s choose one Life on the Road Trait.`, "roadTrait"));
    for (const name of [a.innateTrait, a.inheritedTrait, a.roadTrait]) {
      if (name && banned.has(name)) errors.push(error("TRAIT_RESTRICTED", `${name} is unavailable because of an earlier Recruitment answer.`, "traits"));
    }
  }

  if (stepId === "relationships") {
    const mother = relationships.mother ?? {};
    const father = relationships.father ?? {};
    const artisan = relationships.seniorArtisan ?? {};
    const mentor = relationships.mentor ?? {};
    const friend = relationships.friend ?? {};
    const enemy = relationships.enemy ?? {};
    if (!String(relationships.lineage ?? "").trim() || !String(relationships.insignia ?? "").trim()) errors.push(error("HOUSE_REQUIRED", "Enter both Lineage / House and House Insignia."));
    if ((!String(mother.name ?? "").trim() && !String(father.name ?? "").trim()) || !String(artisan.name ?? "").trim() || !String(mentor.name ?? "").trim()) errors.push(error("CORE_RELATIONSHIPS_REQUIRED", "Enter at least one parent, plus Senior Artisan and Mentor."));
    if (mother.name && (!mother.profession || !mother.location)) errors.push(error("MOTHER_DETAILS_REQUIRED", "Mother needs a profession and location."));
    if (father.name && (!father.profession || !father.location)) errors.push(error("FATHER_DETAILS_REQUIRED", "Father needs a profession and location."));
    if (!artisan.profession || !artisan.location) errors.push(error("ARTISAN_DETAILS_REQUIRED", "Senior Artisan needs a profession and location."));
    if (!mentor.role || !mentor.location) errors.push(error("MENTOR_DETAILS_REQUIRED", "Mentor needs a Ranger role/station and location."));
    if (!a.mentorRuleConfirmed) errors.push(error("MENTOR_RULE_CONFIRM_REQUIRED", "Confirm that the Mentor follows the Station-specific Recruitment rule."));
    if (!friend.name || !friend.profession || !friend.location) errors.push(error("FRIEND_DETAILS_REQUIRED", "A Friend needs a name, profession/specialty and typical location."));
    if (!enemy.name || !enemy.people || !enemy.location) errors.push(error("ENEMY_DETAILS_REQUIRED", "An Enemy needs a name, people/type and location."));
    if (ENEMY_SERVANTS_HOUSE_RULE.includes(enemy.people) && !a.allowEnemyServant) errors.push(error("ENEMY_HOUSE_RULE_REQUIRED", `Enable the House Rule to choose ${enemy.people} as a personal Enemy.`, "enemyPeople"));
  }

  if (stepId === "drives-gear") {
    const drives = a.drives ?? {};
    if (!String(drives.belief ?? "").trim() || !String(drives.goal ?? "").trim() || !String(drives.instinct ?? "").trim()) errors.push(error("DRIVES_REQUIRED", "Write Belief, Goal and Instinct before continuing."));
    else if (!WEAPON_NAMES.includes(a.weapon)) errors.push(error("WEAPON_REQUIRED", "Choose a starting weapon.", "weapon"));
  }

  if (stepId === "review") {
    const nature = Number(d.abilities?.nature ?? 0);
    if (nature < 2 || nature > 6) errors.push(error("NATURE_RANGE", "Starting Nature is outside the valid Recruitment range.", "nature"));
    if (Object.keys(d.traitChecks ?? {}).some(name => banned.has(name))) errors.push(error("TRAIT_CONFLICT", "A selected Trait conflicts with a Recruitment answer. Go back to Traits and correct it."));
  }

  return { errors, warnings: [] };
}

export const REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE = new CharacterCreationProfile({
  id: CREATION_PROFILE_ID,
  version: 2,
  name: "Realm Guard — Legacy Mixed Recruitment",
  dimensions: [
    { id: "station", label: "Station", options: STATIONS },
    { id: "homeland", label: "Homeland", options: HOMELANDS }
  ],
  steps: [
    { id: "identity", type: "CHOICE", legacyStep: 1 },
    { id: "nature", type: "QUESTION", legacyStep: 2 },
    { id: "homeland", type: "CHOICE", legacyStep: 3 },
    { id: "life-experience", type: "ALLOCATION", legacyStep: 4 },
    { id: "service-specialty", type: "ALLOCATION", legacyStep: 5 },
    { id: "wises", type: "ALLOCATION", legacyStep: 6 },
    { id: "resources-circles", type: "QUESTION", legacyStep: 7 },
    { id: "traits", type: "ALLOCATION", legacyStep: 8 },
    { id: "relationships", type: "RELATIONSHIP", legacyStep: 9 },
    { id: "drives-gear", type: "GEAR", legacyStep: 10 },
    { id: "review", type: "REVIEW", legacyStep: 11 }
  ],
  rules: {
    gameplayChangeIntended: false,
    wiseMode: "UNRATED",
    inventoryPolicy: "STRUCTURED",
    startingNature: 3,
    natureEffects: NATURE_EFFECTS,
    resourceEffects: RESOURCE_EFFECTS,
    circlesEffects: CIRCLES_EFFECTS,
    ratingResolvers: ["SET", "ADD", "SET_OR_INCREMENT", "CHECKS_PLUS_BASE", "DISTRIBUTE_POOL"],
    restrictions: ["requires", "forbids", "enables", "disables", "minimum", "maximum", "dependsOn"],
    partyConstraints: ["UNIQUE_SPECIALTY"],
    relationshipOrigin: "RECRUITMENT"
  },
  grants: { fate: 1, persona: 1, checks: 0 },
  metadata: {
    liveAuthority: "CORE_M9_DRAFT_VALIDATION",
    commitAuthority: "LEGACY_RECRUITMENT",
    coreMode: "DRAFT_LIVE_COMMIT_LEGACY",
    source: "v1.9.0 STABLE Recruitment 2.0",
    strictRealmGuard: false
  },
  derive,
  validateStep
});

export {
  STATIONS as LEGACY_CREATION_STATIONS,
  HOMELANDS as LEGACY_CREATION_HOMELANDS,
  ENEMY_SERVANTS_HOUSE_RULE as LEGACY_CREATION_ENEMY_SERVANTS,
  WEAPON_NAMES as LEGACY_CREATION_WEAPON_NAMES
};
