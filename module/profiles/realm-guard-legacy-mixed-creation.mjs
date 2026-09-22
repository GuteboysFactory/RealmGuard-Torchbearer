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
const WEAPONS = Object.freeze([
  { name: "Shield", hands: 1 }, { name: "Knife", hands: 1 }, { name: "Sword", hands: 1 },
  { name: "Staff", hands: 2 }, { name: "Spear", hands: 2 }, { name: "Whip", hands: 1 },
  { name: "Halberd", hands: 2 }, { name: "Sling", hands: 1 }, { name: "Bow", hands: 2 }
]);
const WEAPON_NAMES = Object.freeze(WEAPONS.map(entry => entry.name));

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

function cleanPerson(person = {}) {
  return {
    name: String(person.name ?? "").trim(),
    profession: String(person.profession ?? "").trim(),
    people: String(person.people ?? "").trim(),
    location: String(person.location ?? "").trim(),
    role: String(person.role ?? "").trim()
  };
}

function structuredRelationships(answers = {}) {
  const relationships = answers.relationships ?? {};
  return {
    version: 1,
    homeland: HOMELANDS[answers.homelandKey]?.label ?? "",
    mother: cleanPerson(relationships.mother),
    father: cleanPerson(relationships.father),
    seniorArtisan: cleanPerson(relationships.seniorArtisan),
    mentor: cleanPerson({
      ...relationships.mentor,
      profession: relationships.mentor?.role || "Ranger"
    }),
    friend: cleanPerson(relationships.friend),
    enemy: cleanPerson(relationships.enemy)
  };
}

function formatLegacyPerson(person = {}, secondaryKey = "profession") {
  const secondary = secondaryKey === "people" ? person.people : (person.profession || person.role);
  return [person.name, secondary, person.location].map(value => String(value ?? "").trim()).filter(Boolean).join(", ");
}

function skillLearningForRating(rating) {
  const r = Number(rating ?? 0);
  if (r <= 0) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 1 };
  if (r === 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

function gearSpec(name, { hands = 0, location = "", mode = "unassigned", description = "Created during Realm Guard Recruitment." } = {}) {
  return {
    name,
    type: "gear",
    flags: { "realm-guard": { recruitmentGear: true } },
    system: {
      quantity: 1,
      description,
      inventory: { mode, location, containerId: "", slots: 1, bundle: 1, wieldHands: hands, containerType: "none", capacity: 0 }
    }
  };
}

function normalizedRelationshipPlan(answers = {}) {
  const rel = answers.relationships ?? {};
  const rows = [
    ["parent-mother", rel.mother, "PARENT", "UNKNOWN"],
    ["parent-father", rel.father, "PARENT", "UNKNOWN"],
    ["senior-artisan", rel.seniorArtisan, "SENIOR_ARTISAN", "UNKNOWN"],
    ["mentor", rel.mentor, "MENTOR", "UNKNOWN"],
    ["friend", rel.friend, "FRIEND", "FRIENDLY"],
    ["enemy", rel.enemy, "ENEMY", "HOSTILE"]
  ];
  return rows
    .filter(([, person]) => String(person?.name ?? "").trim())
    .map(([slot, person, role, status]) => ({
      slot,
      person: cleanPerson(person),
      role,
      status,
      origin: "RECRUITMENT",
      writeMode: "CORE_M8_SERVICE_ON_LIVE_COMMIT"
    }));
}

function buildCommitSpec({ draft }) {
  const a = draft.answers ?? {};
  const d = draft.derivedValues ?? {};
  const identity = d.identity ?? {};
  const abilities = d.abilities ?? {};
  const resources = d.resources ?? {};
  const relationships = a.relationships ?? {};
  const structured = structuredRelationships(a);
  const mother = relationships.mother ?? {};
  const father = relationships.father ?? {};
  const artisan = relationships.seniorArtisan ?? {};
  const mentor = relationships.mentor ?? {};
  const friend = relationships.friend ?? {};
  const enemy = relationships.enemy ?? {};
  const parentNames = [
    mother.name ? `Mom: ${formatLegacyPerson(mother)}` : "",
    father.name ? `Dad: ${formatLegacyPerson(father)}` : ""
  ].filter(Boolean).join("; ");
  const skillRatings = Object.fromEntries(Object.entries(d.skillChecks ?? {}).map(([name, checks]) => {
    const rating = Number(checks) > 0 ? Math.min(6, Number(checks) + 1) : 0;
    return [name, { rating, learning: skillLearningForRating(rating), beginnerAttempts: 0 }];
  }));
  const traitDocs = Object.entries(d.traitChecks ?? {}).map(([name, count]) => ({
    name,
    type: "trait",
    flags: { "realm-guard": { recruitmentTrait: true } },
    system: { rating: Math.min(3, Number(count) || 0), description: "Selected during Realm Guard Recruitment." }
  }));
  const wiseDocs = Object.keys(d.wiseChecks ?? {}).map(name => ({
    name,
    type: "wise",
    flags: { "realm-guard": { recruitmentWise: true } },
    system: { description: "Selected during Realm Guard Recruitment. Wises are unrated in the current Realm Guard / Legacy Mixed profile. If your table uses Mouse Guard 1st Edition-style rated Wises, represent them as custom Skills." }
  }));
  const weapon = WEAPONS.find(entry => entry.name === a.weapon) ?? WEAPONS.find(entry => entry.name === "Sword");
  const gearDocs = [
    gearSpec(weapon.name, { hands: weapon.hands, mode: "hand", location: "right-hand", description: "Starting weapon chosen during Realm Guard Recruitment." }),
    ...(String(a.armor ?? "").trim() ? [gearSpec(String(a.armor).trim(), { mode: "worn", location: "torso", description: "Armor recorded during Realm Guard Recruitment." })] : []),
    ...String(a.distinctiveGear ?? "").split(",").map(value => value.trim()).filter(Boolean).map(name => gearSpec(name, { description: "Distinctive gear recorded during Realm Guard Recruitment." }))
  ];

  return {
    actor: {
      name: identity.name,
      type: "character",
      folder: { documentName: "Actor", name: "PC" },
      ownershipPolicy: "CREATOR_OWNER_IF_NON_GM",
      createOptions: { realmGuardSkipRecruitmentProvisioning: true },
      system: {
        biographySource: String(a.background ?? ""),
        notes: "",
        concept: identity.concept,
        rank: identity.rank,
        homeland: identity.homeland,
        age: String(identity.age),
        lineage: String(relationships.lineage ?? ""),
        insignia: String(relationships.insignia ?? ""),
        seniorArtisan: `${String(artisan.name ?? "")} - ${String(artisan.profession || a.apprenticeship || "")}`,
        friend: formatLegacyPerson(friend),
        cloak: "",
        weapon: "",
        mentor: formatLegacyPerson(mentor),
        enemy: formatLegacyPerson(enemy, "people"),
        parents: parentNames,
        belief: String(a.drives?.belief ?? ""),
        goal: String(a.drives?.goal ?? ""),
        instinct: String(a.drives?.instinct ?? ""),
        attributes: {
          nature: { value: Number(abilities.nature ?? 0), maximum: Number(abilities.nature ?? 0) },
          will: { value: Number(abilities.will ?? 0), max: 6 },
          health: { value: Number(abilities.health ?? 0), max: 6 },
          resources: { value: Number(abilities.resources ?? 0), max: 10 },
          circles: { value: Number(abilities.circles ?? 0), max: 10 }
        },
        resources: {
          fate: { value: Number(resources.fate ?? 1), max: 5 },
          persona: { value: Number(resources.persona ?? 1), max: 5 },
          checks: { value: Number(resources.checks ?? 0), max: 9 }
        },
        roll: { versus: false, obstacle: 1, modifier: 0 }
      },
      flags: {
        "realm-guard": {
          recruitmentVersion: "0.20.0",
          recruitmentSpecialty: String(a.specialty ?? ""),
          recruitmentWiseChecks: { ...(d.wiseChecks ?? {}) },
          recruitmentSkillChecks: { ...(d.skillChecks ?? {}) },
          recruitmentNatureAnswers: { ...(a.natureAnswers ?? {}) },
          recruitmentResourceAnswers: { ...(a.resourceAnswers ?? {}) },
          recruitmentCircleAnswers: { ...(a.circleAnswers ?? {}) },
          recruitmentMentorRuleConfirmed: Boolean(a.mentorRuleConfirmed),
          recruitmentRelationships: structured,
          recruitmentMother: String(mother.name ?? ""),
          recruitmentFather: String(father.name ?? ""),
          recruitmentEnemyHouseRule: Boolean(a.allowEnemyServant)
        }
      }
    },
    provisioning: {
      canonicalSkills: { mode: "ENSURE_DEFAULT_SET", ratings: skillRatings },
      traits: traitDocs,
      wises: wiseDocs,
      gear: gearDocs,
      canonicalConditions: { mode: "ENSURE_DEFAULT_SET" }
    },
    relationships: {
      compatibilityFlag: structured,
      normalized: normalizedRelationshipPlan(a),
      liveWrite: true,
      plannedLiveService: "CORE_M8_SOCIAL_NETWORK"
    },
    postCommit: [
      { kind: "CHAT_RECRUITED", critical: false, outsideAtomicBoundary: true },
      { kind: "RELATIONSHIP_NPC_REVIEW", critical: false, outsideAtomicBoundary: true, gmControlled: true, automaticNpcCreation: false }
    ],
    transaction: {
      mode: "COMPENSATING_ROLLBACK",
      liveExecution: true,
      atomicBoundary: "ACTOR_AND_EMBEDDED_DOCUMENTS",
      criticalPhases: ["CREATE_ACTOR", "PROVISION_SKILLS", "CREATE_ITEMS", "PROVISION_CONDITIONS", "NORMALIZE_RELATIONSHIPS", "WRITE_PROVENANCE"],
      compensation: [{ onFailureAfter: "CREATE_ACTOR", action: "DELETE_CREATED_ACTOR" }],
      provenanceWrite: true,
      relationshipWrite: true,
      postCommitOutsideTransaction: ["CHAT_RECRUITED", "RELATIONSHIP_NPC_REVIEW"]
    }
  };
}

export const REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE = new CharacterCreationProfile({
  id: CREATION_PROFILE_ID,
  version: 4,
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
    liveAuthority: "CORE_M9",
    commitAuthority: "CORE_M9",
    commitShadow: "LEGACY_RECRUITMENT_PARITY_GUARD",
    coreMode: "CORE_LIVE_COMMIT",
    source: "v1.9.0 STABLE Recruitment 2.0",
    strictRealmGuard: false
  },
  derive,
  validateStep,
  buildCommitSpec
});

export {
  STATIONS as LEGACY_CREATION_STATIONS,
  HOMELANDS as LEGACY_CREATION_HOMELANDS,
  ENEMY_SERVANTS_HOUSE_RULE as LEGACY_CREATION_ENEMY_SERVANTS,
  WEAPON_NAMES as LEGACY_CREATION_WEAPON_NAMES
};
