import { CharacterCreationProfile } from "../core/m9-creation.mjs";

export const MG1E_CREATION_PROFILE_ID = "mg1e";
export const MG1E_CREATION_PROFILE_VERSION = 1;
const SOURCE = "Mouse Guard Roleplaying Game (2008 / 1E)";

export const MG1E_GUARD_RANKS = Object.freeze({
  tenderpaw: Object.freeze({ label: "Tenderpaw", ageMin: 14, ageMax: 17, will: 2, health: 6, resources: 1, circles: 1, naturalTalent: 2, parentsTrade: 2, convincing: 1, mentorTraining: 2, service: 3, wises: 1, specialty: false, inheritedTrait: true, roadTrait: false }),
  guardmouse: Object.freeze({ label: "Guardmouse", ageMin: 18, ageMax: 25, will: 3, health: 5, resources: 2, circles: 2, naturalTalent: 1, parentsTrade: 1, convincing: 1, mentorTraining: 1, service: 6, wises: 2, specialty: true, inheritedTrait: false, roadTrait: false }),
  "patrol-guard": Object.freeze({ label: "Patrol Guard", ageMin: 21, ageMax: 50, will: 4, health: 4, resources: 3, circles: 3, naturalTalent: 1, parentsTrade: 1, convincing: 1, mentorTraining: 1, service: 8, wises: 3, specialty: true, inheritedTrait: false, roadTrait: false }),
  "patrol-leader": Object.freeze({ label: "Patrol Leader", ageMin: 21, ageMax: 60, will: 5, health: 4, resources: 4, circles: 3, naturalTalent: 1, parentsTrade: 1, convincing: 2, mentorTraining: 2, service: 9, wises: 4, specialty: true, inheritedTrait: false, roadTrait: true }),
  "guard-captain": Object.freeze({ label: "Guard Captain", ageMin: 41, ageMax: 60, will: 6, health: 3, resources: 5, circles: 4, naturalTalent: 2, parentsTrade: 1, convincing: 2, mentorTraining: 1, service: 12, wises: 6, specialty: true, inheritedTrait: false, roadTrait: true })
});

export const MG1E_HOMETOWNS = Object.freeze({
  barkstone: Object.freeze({ label: "Barkstone", skills: ["Carpenter", "Potter", "Glazier"], traits: ["Steady Paw"] }),
  copperwood: Object.freeze({ label: "Copperwood", skills: ["Smith", "Haggler"], traits: ["Independent"] }),
  elmoss: Object.freeze({ label: "Elmoss", skills: ["Carpenter", "Harvester"], traits: ["Alert"] }),
  ivydale: Object.freeze({ label: "Ivydale", skills: ["Harvester", "Baker"], traits: ["Hard Worker"] }),
  lockhaven: Object.freeze({ label: "Lockhaven", skills: ["Weaver", "Armorer"], traits: ["Generous", "Guard's Honor"] }),
  "port-sumac": Object.freeze({ label: "Port Sumac", skills: ["Boatcrafter", "Weather Watcher"], traits: ["Tough", "Weather Sense"] }),
  shaleburrow: Object.freeze({ label: "Shaleburrow", skills: ["Mason", "Harvester", "Miller"], traits: ["Open-Minded"] }),
  sprucetuck: Object.freeze({ label: "Sprucetuck", skills: ["Scientist", "Loremouse"], traits: ["Inquisitive", "Rational"] })
});

const NATURAL_TALENT_SKILLS = Object.freeze([
  "Administrator","Apiarist","Archivist","Armorer","Baker","Boatcrafter","Brewer","Carpenter","Cartographer","Cook",
  "Deceiver","Fighter","Glazier","Haggler","Harvester","Healer","Hunter","Insectrist","Instructor","Laborer",
  "Loremouse","Militarist","Miller","Orator","Pathfinder","Persuader","Potter","Scientist","Scout","Smith",
  "Stonemason","Survivalist","Weather Watcher","Weaver"
]);
const TRADE_SKILLS = Object.freeze(["Apiarist","Archivist","Armorer","Baker","Boatcrafter","Brewer","Carpenter","Cartographer","Glazier","Harvester","Insectrist","Miller","Potter","Smith","Stonemason","Weaver"]);
const CONVINCING_SKILLS = Object.freeze(["Deceiver","Orator","Persuader"]);
const MENTOR_SKILLS = Object.freeze(["Fighter","Healer","Hunter","Instructor","Pathfinder","Scout","Survivalist","Weather Watcher"]);
const BASE_GUARD_SKILLS = Object.freeze(["Fighter","Healer","Hunter","Instructor","Pathfinder","Scout","Survivalist","Weather Watcher"]);
const SPECIALTY_SKILLS = BASE_GUARD_SKILLS;
const WEAPONS = Object.freeze(["Shield","Knife","Sword","Staff","Spear","Hook and Line","Halberd","Sling","Bow"]);

const RESOURCE_EFFECTS = Object.freeze({ winterTrade: 1, parentsProfession: 1, gifts: -1, thrifty: 1, debt: -1, pack: 1 });
const CIRCLES_EFFECTS = Object.freeze({ gregarious: 1, guardTies: 1, reputation: 1, enemies: -1, crime: -1, loner: -1 });

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function error(code, message, field = "") {
  return { code, message, field };
}

function warning(code, message, field = "") {
  return { code, message, field };
}

function addCheck(map, name, count = 1) {
  const key = String(name ?? "").trim();
  const amount = Math.max(0, Number(count) || 0);
  if (!key || amount <= 0) return;
  map[key] = (map[key] ?? 0) + amount;
}

function sumChecks(...parts) {
  const map = {};
  for (const part of parts) {
    if (Array.isArray(part)) part.forEach(name => addCheck(map, name));
    else if (part && typeof part === "object") Object.entries(part).forEach(([name, count]) => addCheck(map, name, count));
    else addCheck(map, part);
  }
  return map;
}

function countWises(values = []) {
  const map = {};
  for (const value of values) addCheck(map, value);
  return map;
}

function questionTotal(base, answers, effects, minimum = -Infinity) {
  let value = Number(base ?? 0);
  for (const [key, amount] of Object.entries(effects)) if (answers?.[key]) value += Number(amount);
  return Math.max(minimum, value);
}

function bannedTraits(answers = {}) {
  const banned = new Set();
  if (answers.natureAnswers?.saveForWinter) ["Bold","Generous"].forEach(v => banned.add(v));
  if (answers.natureAnswers?.fearPredators) banned.add("Fearless");
  if (answers.resourceAnswers?.winterTrade) banned.add("Leader");
  if (answers.resourceAnswers?.thrifty) banned.add("Generous");
  if (answers.resourceAnswers?.pack) ["Bold","Fiery"].forEach(v => banned.add(v));
  if (answers.circleAnswers?.gregarious) ["Bitter","Jaded"].forEach(v => banned.add(v));
  if (answers.circleAnswers?.loner) banned.add("Extrovert");
  return banned;
}

function natureValue(answers = {}) {
  let value = 3;
  if (answers.natureAnswers?.saveForWinter) value += 1;
  if (answers.natureAnswers?.runAndHide) value += 1;
  if (answers.natureAnswers?.fearPredators) value += 1;
  return value;
}

function serviceSkills(rank) {
  const set = new Set(BASE_GUARD_SKILLS);
  if (rank === "tenderpaw") set.add("Laborer");
  if (rank === "guardmouse") set.add("Haggler");
  if (rank === "patrol-guard") set.add("Cook");
  if (rank === "patrol-leader") ["Persuader","Loremouse"].forEach(v => set.add(v));
  if (rank === "guard-captain") ["Orator","Militarist","Administrator"].forEach(v => set.add(v));
  return [...set];
}

function ratingFromChecks(checks, modifier = 0) {
  const count = Math.max(0, Number(checks) || 0);
  if (!count) return 0;
  return Math.max(0, Math.min(6, count + 1 + Number(modifier || 0)));
}

function learningForRating(rating) {
  const r = Math.max(0, Number(rating) || 0);
  if (r <= 1) return { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 };
  return { passed: 0, failed: 0, passNeeded: r, failNeeded: r - 1 };
}

function cleanPerson(person = {}) {
  return {
    name: String(person.name ?? "").trim(),
    profession: String(person.profession ?? person.role ?? "").trim(),
    people: String(person.people ?? "Mouse").trim(),
    location: String(person.location ?? "").trim(),
    role: String(person.role ?? "").trim(),
    actorId: String(person.actorId ?? "").trim(),
    traits: Array.isArray(person.traits) ? person.traits.map(v => String(v?.name ?? v).trim()).filter(Boolean) : []
  };
}

function personText(person = {}) {
  return [person.name, person.profession || person.role, person.location].map(v => String(v ?? "").trim()).filter(Boolean).join(", ");
}

function partyRows(partyContext = {}) {
  return [
    ...(partyContext.existingCharacters ?? []),
    ...(partyContext.otherDraftCharacters ?? [])
  ];
}

function partyRank(entry = {}) {
  return normalize(entry.rank ?? entry.station ?? entry.answers?.rank);
}

function partyTraits(entry = {}) {
  return new Set((entry.traits ?? entry.answers?.traits ?? []).map(v => normalize(v?.name ?? v)));
}

function mentorPartyMatch(mentor = {}, partyContext = {}) {
  const id = String(mentor.actorId ?? "").trim();
  const name = normalize(mentor.name);
  return partyRows(partyContext).find(entry => {
    if (id && String(entry.actorId ?? entry.id ?? "") === id) return true;
    return name && normalize(entry.name ?? entry.answers?.name) === name;
  }) ?? null;
}

function derive({ answers = {}, allocations = {} } = {}) {
  const rank = String(answers.rank || "guardmouse");
  const row = MG1E_GUARD_RANKS[rank] ?? MG1E_GUARD_RANKS.guardmouse;
  const nature = natureValue(answers);
  const hometown = MG1E_HOMETOWNS[answers.hometownKey] ?? null;
  const resources = questionTotal(row.resources, answers.resourceAnswers, RESOURCE_EFFECTS, 0);
  const circles = questionTotal(row.circles, answers.circleAnswers, CIRCLES_EFFECTS, 1);
  const skillChecks = sumChecks(
    answers.hometownSkill,
    allocations.naturalTalent,
    allocations.parentsTrade,
    allocations.convincing,
    answers.apprenticeship,
    allocations.mentorTraining,
    allocations.serviceAlloc,
    answers.specialty
  );
  const wiseChecks = countWises(allocations.wiseChoices ?? []);
  const traitChecks = sumChecks(answers.hometownTrait, answers.innateTrait, answers.inheritedTrait, answers.roadTrait);
  const skillRatings = Object.fromEntries(Object.entries(skillChecks).map(([name, checks]) => [
    name,
    ratingFromChecks(checks, name === "Fighter" && answers.natureAnswers?.runAndHide ? -1 : 0)
  ]));
  const wiseRatings = Object.fromEntries(Object.entries(wiseChecks).map(([name, checks]) => [name, ratingFromChecks(checks)]));
  const serviceAllocated = Object.values(allocations.serviceAlloc ?? {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const banned = bannedTraits(answers);
  const gear = [
    ...(String(answers.weapon ?? "").trim() ? [{ name: String(answers.weapon).trim(), kind: "weapon" }] : []),
    ...String(answers.distinctiveGear ?? "").split(",").map(v => v.trim()).filter(Boolean).map(name => ({ name, kind: "gear" }))
  ];

  return {
    derivedValues: {
      identity: {
        name: String(answers.name ?? ""),
        concept: String(answers.concept ?? ""),
        rank,
        rankLabel: row.label,
        age: Number(answers.age ?? row.ageMin),
        furColor: String(answers.furColor ?? ""),
        hometownKey: String(answers.hometownKey ?? ""),
        hometown: hometown?.label ?? "",
        cloakColor: rank === "tenderpaw" ? "" : String(answers.cloakColor ?? "")
      },
      nature,
      abilities: { nature, will: row.will, health: row.health, resources, circles },
      resources: { fate: 1, persona: 1, checks: 0 },
      skillChecks,
      skillRatings,
      wiseChecks,
      wiseRatings,
      traitChecks,
      restrictions: { bannedTraits: [...banned].sort(), fighterPenaltyFromNature: Boolean(answers.natureAnswers?.runAndHide) },
      budgets: {
        naturalTalent: row.naturalTalent,
        parentsTrade: row.parentsTrade,
        convincing: row.convincing,
        mentorTraining: row.mentorTraining,
        service: row.service,
        serviceAllocated,
        wises: row.wises
      },
      eligible: {
        naturalTalent: [...NATURAL_TALENT_SKILLS],
        parentsTrade: [...TRADE_SKILLS],
        convincing: [...CONVINCING_SKILLS],
        mentorTraining: [...MENTOR_SKILLS],
        service: serviceSkills(rank),
        specialty: [...SPECIALTY_SKILLS]
      },
      gear,
      grants: [
        { type: "RESOURCE", key: "fate", value: 1 },
        { type: "RESOURCE", key: "persona", value: 1 }
      ],
      creationPolicy: {
        source: SOURCE,
        ratedWises: true,
        startingSkillWiseCap: 6,
        inventoryPolicy: "LOOSE",
        automaticNpcCreation: false,
        liveAuthority: "CORE_M9_WHEN_ACTIVE"
      }
    },
    warnings: []
  };
}

function validatePartyRank(rank, draft, partyContext, errors) {
  const rows = partyRows(partyContext);
  if (rank === "guard-captain") {
    if (!draft.answers?.guardCaptainApproved) {
      errors.push(error("MG1E_GUARD_CAPTAIN_GROUP_APPROVAL", "A Guard Captain requires the group's approval.", "guardCaptainApproved"));
    }
    if (rows.some(entry => partyRank(entry) === "guard-captain")) {
      errors.push(error("MG1E_GUARD_CAPTAIN_UNIQUE", "There may only be one Guard Captain in the group.", "rank"));
    }
  }

  if (rank === "patrol-leader") {
    const ranks = [...rows.map(partyRank), rank];
    const leaderCount = ranks.filter(value => value === "patrol-leader").length;
    if (leaderCount > 1) {
      const tenderpawCount = ranks.filter(value => value === "tenderpaw").length;
      if (!(ranks.length === 4 && leaderCount === 2 && tenderpawCount === 2)) {
        errors.push(error("MG1E_PATROL_LEADER_LIMIT", "A second Patrol Leader is only allowed in a four-player group when the other two characters are Tenderpaws.", "rank"));
      }
    }
  }
}

function validateStep({ stepId, draft, partyContext }) {
  const errors = [];
  const warnings = [];
  const a = draft.answers ?? {};
  const alloc = draft.allocations ?? {};
  const d = draft.derivedValues ?? {};
  const rank = String(a.rank || "guardmouse");
  const row = MG1E_GUARD_RANKS[rank] ?? MG1E_GUARD_RANKS.guardmouse;
  const banned = new Set(d.restrictions?.bannedTraits ?? []);

  if (stepId === "identity") {
    if (!String(a.name ?? "").trim()) errors.push(error("NAME_REQUIRED", "Enter the guardmouse's name.", "name"));
    if (!MG1E_GUARD_RANKS[rank]) errors.push(error("MG1E_GUARD_RANK_INVALID", "Choose a valid Guard Rank.", "rank"));
    const age = Number(a.age ?? 0);
    if (age < row.ageMin || age > row.ageMax) errors.push(error("MG1E_AGE_RANGE", `${row.label} starting age must be ${row.ageMin}-${row.ageMax}.`, "age"));
    validatePartyRank(rank, draft, partyContext, errors);
  }

  if (stepId === "nature") {
    const nature = Number(d.abilities?.nature ?? 0);
    if (nature < 3 || nature > 6) errors.push(error("MG1E_NATURE_RANGE", "Mouse Nature must begin between 3 and 6 after Recruitment questions.", "nature"));
  }

  if (stepId === "hometown") {
    const home = MG1E_HOMETOWNS[a.hometownKey];
    if (!home) errors.push(error("MG1E_HOMETOWN_REQUIRED", "Choose a Mouse Territories hometown.", "hometownKey"));
    else {
      if (!home.skills.includes(a.hometownSkill)) errors.push(error("MG1E_HOMETOWN_SKILL", "Choose one Skill supplied by the hometown.", "hometownSkill"));
      if (!home.traits.includes(a.hometownTrait)) errors.push(error("MG1E_HOMETOWN_TRAIT", "Choose one Trait supplied by the hometown.", "hometownTrait"));
      if (banned.has(a.hometownTrait)) errors.push(error("MG1E_TRAIT_RESTRICTED", `${a.hometownTrait} is unavailable because of an earlier Recruitment answer.`, "hometownTrait"));
    }
  }

  if (stepId === "life-experience") {
    const groups = [
      [alloc.naturalTalent ?? [], row.naturalTalent, "Natural Talent"],
      [alloc.parentsTrade ?? [], row.parentsTrade, "Parents' Trade"],
      [alloc.convincing ?? [], row.convincing, "Convincing"],
      [alloc.mentorTraining ?? [], row.mentorTraining, "Mentor Training"]
    ];
    for (const [values, count, label] of groups) {
      if (values.length !== count || values.some(v => !String(v ?? "").trim())) errors.push(error("MG1E_LIFE_EXPERIENCE_INCOMPLETE", `${label} requires exactly ${count} choice${count === 1 ? "" : "s"}.`));
    }
    if (!String(a.apprenticeship ?? "").trim()) errors.push(error("MG1E_APPRENTICESHIP_REQUIRED", "Choose the Senior Artisan trade used during apprenticeship.", "apprenticeship"));
  }

  if (stepId === "service-specialty") {
    const allocated = Number(d.budgets?.serviceAllocated ?? 0);
    if (allocated !== row.service) errors.push(error("MG1E_SERVICE_BUDGET", `Guard service requires exactly ${row.service} checks; ${allocated} are allocated.`, "serviceAlloc"));
    for (const name of Object.keys(alloc.serviceAlloc ?? {})) {
      if (!d.eligible?.service?.includes(name)) errors.push(error("MG1E_SERVICE_SKILL_INVALID", `${name} is not available to ${row.label} as a Guard service Skill.`, "serviceAlloc"));
    }
    if (row.specialty && !String(a.specialty ?? "").trim()) errors.push(error("MG1E_SPECIALTY_REQUIRED", "Choose a unique Specialty.", "specialty"));
    if (!row.specialty && String(a.specialty ?? "").trim()) errors.push(error("MG1E_TENDERPAW_NO_SPECIALTY", "Tenderpaws do not choose a Specialty.", "specialty"));
    const specialty = String(a.specialty ?? "").trim();
    if (specialty) {
      if (!SPECIALTY_SKILLS.includes(specialty)) errors.push(error("MG1E_SPECIALTY_INVALID", "Choose a Specialty from the Guard skill list.", "specialty"));
      const collision = partyRows(partyContext).find(entry => normalize(entry.specialty ?? entry.answers?.specialty) === normalize(specialty));
      if (collision) errors.push(error("MG1E_SPECIALTY_UNIQUE", `${specialty} is already another guardmouse's Specialty.`, "specialty"));
    }
  }

  if (stepId === "wises") {
    const choices = alloc.wiseChoices ?? [];
    if (choices.length !== row.wises || choices.some(v => !String(v ?? "").trim())) errors.push(error("MG1E_WISE_BUDGET", `Choose exactly ${row.wises} Wise checks.`, "wiseChoices"));
    for (const [name, rating] of Object.entries(d.wiseRatings ?? {})) {
      if (rating < 2 || rating > 6) errors.push(error("MG1E_WISE_STARTING_RATING", `${name} must start between rating 2 and 6.`, "wiseChoices"));
    }
  }

  if (stepId === "resources-circles") {
    if (a.resourceAnswers?.winterTrade) {
      const trade = String(a.resourceTrade ?? "").trim();
      if (!trade || Number(d.skillRatings?.[trade] ?? 0) <= 0) errors.push(error("MG1E_RESOURCE_TRADE", "Winter trade requires a trained trade Skill.", "resourceTrade"));
    }
    if (a.resourceAnswers?.parentsProfession && !String(a.parentsResourceProfession ?? "").trim()) errors.push(error("MG1E_PARENTS_RESOURCE_PROFESSION", "Record the qualifying parents' profession.", "parentsResourceProfession"));
    if (a.circleAnswers?.guardTies && !String(a.guardTiesBasis ?? "").trim()) errors.push(error("MG1E_GUARD_TIES_BASIS", "Strong Guard ties require Guard parents or a mentor who is family.", "guardTiesBasis"));
    if (Number(d.abilities?.circles ?? 0) < 1) errors.push(error("MG1E_CIRCLES_MINIMUM", "Starting Circles may not be lower than 1.", "circles"));
  }

  if (stepId === "traits") {
    if (!String(a.innateTrait ?? "").trim()) errors.push(error("MG1E_INNATE_TRAIT_REQUIRED", "Choose one born quality Trait.", "innateTrait"));
    if (row.inheritedTrait && !String(a.inheritedTrait ?? "").trim()) errors.push(error("MG1E_TENDERPAW_INHERITED_TRAIT", "Tenderpaws choose one Trait learned or inherited from their parents.", "inheritedTrait"));
    if (row.roadTrait && !String(a.roadTrait ?? "").trim()) errors.push(error("MG1E_ROAD_TRAIT_REQUIRED", `${row.label}s choose one Life on the Road Trait.`, "roadTrait"));
    for (const name of [a.hometownTrait, a.innateTrait, a.inheritedTrait, a.roadTrait]) {
      if (name && banned.has(name)) errors.push(error("MG1E_TRAIT_RESTRICTED", `${name} is unavailable because of a Recruitment answer.`, "traits"));
    }
    for (const [name, count] of Object.entries(d.traitChecks ?? {})) {
      if (Number(count) > 3) errors.push(error("MG1E_TRAIT_LEVEL_MAX", `${name} would exceed Trait level 3.`, "traits"));
    }
  }

  if (stepId === "relationships") {
    const rel = a.relationships ?? {};
    const parents = Array.isArray(rel.parents) ? rel.parents.filter(p => String(p?.name ?? "").trim()) : [];
    const senior = cleanPerson(rel.seniorArtisan);
    const mentor = cleanPerson(rel.mentor);
    const friend = cleanPerson(rel.friend);
    const enemy = cleanPerson(rel.enemy);
    if (!parents.length) errors.push(error("MG1E_PARENT_REQUIRED", "Name at least one parent.", "parents"));
    if (!senior.name) errors.push(error("MG1E_SENIOR_ARTISAN_REQUIRED", "Name the Senior Artisan.", "seniorArtisan"));
    if (!mentor.name) errors.push(error("MG1E_MENTOR_REQUIRED", "Name the Guard mentor.", "mentor"));
    if (!friend.name || !friend.profession || !friend.location) errors.push(error("MG1E_FRIEND_REQUIRED", "Friend requires a name, profession/specialty and location.", "friend"));
    if (!enemy.name || !enemy.profession || !enemy.location) errors.push(error("MG1E_ENEMY_REQUIRED", "Enemy requires a name, profession/specialty and location.", "enemy"));

    if (rank === "tenderpaw") {
      if (!mentorPartyMatch(mentor, partyContext)) errors.push(error("MG1E_TENDERPAW_MENTOR_PC", "A Tenderpaw's mentor must be a current player character.", "mentor"));
    } else {
      const match = mentorPartyMatch(mentor, partyContext);
      const traits = new Set([...mentor.traits.map(normalize), ...(match ? [...partyTraits(match)] : [])]);
      if (!traits.has("oldfur")) errors.push(error("MG1E_MENTOR_OLDFUR", "An experienced guardmouse's mentor must be an NPC or player character with the Oldfur trait.", "mentor"));
    }
    if (enemy.people && normalize(enemy.people) !== "mouse") warnings.push(warning("MG1E_ENEMY_NON_MOUSE", "The source prefers a mouse as the personal Enemy, though another animal is not an absolute prohibition.", "enemy"));
  }

  if (stepId === "drives-gear") {
    const drives = a.drives ?? {};
    if (!String(drives.belief ?? "").trim() || !String(drives.goal ?? "").trim() || !String(drives.instinct ?? "").trim()) errors.push(error("MG1E_DRIVES_REQUIRED", "Write Belief, Goal and Instinct.", "drives"));
    if (!WEAPONS.includes(String(a.weapon ?? ""))) errors.push(error("MG1E_WEAPON_REQUIRED", "Choose a source-listed starting weapon.", "weapon"));
    if (rank === "tenderpaw" && String(a.cloakColor ?? "").trim()) errors.push(error("MG1E_TENDERPAW_NO_CLOAK", "Tenderpaws do not begin with a cloak.", "cloakColor"));
    if (rank !== "tenderpaw" && !String(a.cloakColor ?? "").trim()) errors.push(error("MG1E_CLOAK_REQUIRED", "Choose the cloak color granted by the mentor.", "cloakColor"));
  }

  if (stepId === "review") {
    for (const rating of Object.values(d.skillRatings ?? {})) if (Number(rating) > 6) errors.push(error("MG1E_STARTING_SKILL_CAP", "Starting Skill ratings may not exceed 6.", "skills"));
    for (const name of Object.keys(d.traitChecks ?? {})) if (banned.has(name)) errors.push(error("MG1E_TRAIT_CONFLICT", "A selected Trait conflicts with a Recruitment answer.", "traits"));
  }

  return { errors, warnings };
}

function normalizedRelationships(answers = {}) {
  const rel = answers.relationships ?? {};
  const rows = [];
  (Array.isArray(rel.parents) ? rel.parents : []).forEach((person, index) => {
    if (String(person?.name ?? "").trim()) rows.push({ slot: `parent-${index + 1}`, person: cleanPerson(person), role: "PARENT", status: "UNKNOWN", origin: "RECRUITMENT", writeMode: "CORE_M8_READY_WHEN_ACTIVE" });
  });
  for (const [slot, key, role, status] of [
    ["senior-artisan","seniorArtisan","SENIOR_ARTISAN","UNKNOWN"],
    ["mentor","mentor","MENTOR","UNKNOWN"],
    ["friend","friend","FRIEND","FRIENDLY"],
    ["enemy","enemy","ENEMY","HOSTILE"]
  ]) {
    const person = rel[key] ?? {};
    if (String(person?.name ?? "").trim()) rows.push({ slot, person: cleanPerson(person), role, status, origin: "RECRUITMENT", writeMode: "CORE_M8_READY_WHEN_ACTIVE" });
  }
  return rows;
}

function gearDoc(name, kind = "gear") {
  return {
    name,
    type: "gear",
    flags: { "realm-guard": { recruitmentGear: true, mg1eFoundation: true } },
    system: {
      quantity: 1,
      description: kind === "weapon" ? "Mouse Guard 1E Recruitment starting weapon." : "Mouse Guard 1E Recruitment starting gear.",
      inventory: { mode: "unassigned", location: "", containerId: "", slots: 1, bundle: 1, wieldHands: 0, containerType: "none", capacity: 0 }
    }
  };
}

function buildCommitSpec({ draft }) {
  const a = draft.answers ?? {};
  const d = draft.derivedValues ?? {};
  const identity = d.identity ?? {};
  const abilities = d.abilities ?? {};
  const resources = d.resources ?? {};
  const rel = a.relationships ?? {};
  const parents = (Array.isArray(rel.parents) ? rel.parents : []).map(cleanPerson).filter(p => p.name);
  const skills = Object.fromEntries(Object.entries(d.skillRatings ?? {}).map(([name, rating]) => [
    name,
    { rating: Number(rating), learning: learningForRating(rating), beginnerAttempts: 0 }
  ]));
  const traits = Object.entries(d.traitChecks ?? {}).map(([name, count]) => ({
    name,
    type: "trait",
    flags: { "realm-guard": { recruitmentTrait: true, mg1eFoundation: true } },
    system: { rating: Math.min(3, Number(count) || 1), description: "Mouse Guard 1E Recruitment Trait." }
  }));
  const wises = Object.entries(d.wiseRatings ?? {}).map(([name, rating]) => ({
    name,
    type: "wise",
    flags: { "realm-guard": { recruitmentWise: true, mg1eFoundation: true, mg1eRatedWise: true } },
    system: { rating: Number(rating), learning: learningForRating(rating), description: "Mouse Guard 1E rated Wise; tests and advances like a Skill." }
  }));
  const gear = (d.gear ?? []).map(entry => gearDoc(entry.name, entry.kind));

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
        homeland: identity.hometown,
        age: String(identity.age),
        lineage: "",
        insignia: "",
        seniorArtisan: personText(cleanPerson(rel.seniorArtisan)),
        friend: personText(cleanPerson(rel.friend)),
        cloak: identity.cloakColor,
        weapon: "",
        mentor: personText(cleanPerson(rel.mentor)),
        enemy: personText(cleanPerson(rel.enemy)),
        parents: parents.map(personText).join("; "),
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
          checks: { value: 0, max: 9 }
        },
        roll: { versus: false, obstacle: 1, modifier: 0 }
      },
      flags: {
        "realm-guard": {
          mg1eFoundationCreationPreview: true,
          recruitmentVersion: "MG1E_M10B10",
          creationRelationships: normalizedRelationships(a),
          recruitmentWiseChecks: { ...(d.wiseChecks ?? {}) },
          recruitmentSkillChecks: { ...(d.skillChecks ?? {}) },
          recruitmentNatureAnswers: { ...(a.natureAnswers ?? {}) },
          recruitmentResourceAnswers: { ...(a.resourceAnswers ?? {}) },
          recruitmentCircleAnswers: { ...(a.circleAnswers ?? {}) }
        }
      }
    },
    provisioning: {
      canonicalSkills: { mode: "PROFILE_SET", names: [...NATURAL_TALENT_SKILLS], ratings: skills },
      traits,
      wises,
      gear,
      canonicalConditions: {
        mode: "MG1E_PROFILE_SET",
        names: ["Hungry & Thirsty","Angry","Tired","Injured","Sick"]
      },
      inventory: { policy: "LOOSE", slotPlacementAuthority: false, preservePlacementAsPresentation: true }
    },
    relationships: {
      normalized: normalizedRelationships(a),
      liveWrite: false,
      readyWhenActive: true,
      plannedLiveService: "CORE_M8_ON_ACTIVE_MG1E"
    },
    postCommit: [],
    transaction: {
      mode: "COMPENSATING_ROLLBACK",
      liveExecution: false,
      readyWhenActive: true,
      atomicBoundary: "ACTOR_AND_EMBEDDED_DOCUMENTS",
      criticalPhases: ["CREATE_ACTOR","PROVISION_SKILLS","CREATE_ITEMS","PROVISION_CONDITIONS","NORMALIZE_RELATIONSHIPS","WRITE_PROVENANCE"],
      compensation: [{ onFailureAfter: "CREATE_ACTOR", action: "DELETE_CREATED_ACTOR" }],
      provenanceWrite: false,
      relationshipWrite: false,
      previewOnly: true,
      activationReadiness: "READY_WHEN_ACTIVE",
      activationRequired: "mg1e"
    }
  };
}

export const MG1E_CREATION_PROFILE = new CharacterCreationProfile({
  id: MG1E_CREATION_PROFILE_ID,
  version: MG1E_CREATION_PROFILE_VERSION,
  name: "Mouse Guard 1E — Recruitment Foundation",
  dimensions: [
    { id: "guard-rank", label: "Guard Rank", options: MG1E_GUARD_RANKS },
    { id: "hometown", label: "Hometown", options: MG1E_HOMETOWNS }
  ],
  steps: [
    { id: "identity", type: "CHOICE", sourceStep: "Concept / Guard Rank / Age" },
    { id: "nature", type: "QUESTION", sourceStep: "Mouse Nature" },
    { id: "hometown", type: "CHOICE", sourceStep: "Where Were You Born?" },
    { id: "life-experience", type: "ALLOCATION", sourceStep: "Life Experience" },
    { id: "service-specialty", type: "ALLOCATION", sourceStep: "Guard Experience / Specialty" },
    { id: "wises", type: "ALLOCATION", sourceStep: "Wises" },
    { id: "resources-circles", type: "QUESTION", sourceStep: "Guard Resources / Guard Circles" },
    { id: "traits", type: "ALLOCATION", sourceStep: "Mouse Traits" },
    { id: "relationships", type: "RELATIONSHIP", sourceStep: "Parents / Senior Artisan / Mentor / Friend / Enemy" },
    { id: "drives-gear", type: "GEAR", sourceStep: "Cloak / Belief / Goal / Instinct / Gear" },
    { id: "review", type: "REVIEW", sourceStep: "Starting Rewards / Review" }
  ],
  rules: {
    source: SOURCE,
    wiseMode: "RATED",
    startingSkillWiseCap: 6,
    inventoryPolicy: "LOOSE",
    startingNature: 3,
    natureDescriptors: ["Escaping","Climbing","Hiding","Foraging"],
    ratingResolver: "CHECKS_PLUS_BASE",
    levels: false,
    talents: false,
    relationshipOrigin: "RECRUITMENT",
    mentorValidation: "MG1E_SOURCE_RULES",
    enemyValidation: "MG1E_MOUSE_PREFERRED",
    enemyHouseRuleAllowed: false,
    automaticNpcCreation: false,
    partyConstraints: ["PATROL_LEADER_LIMIT","GUARD_CAPTAIN_UNIQUE_AND_GROUP_APPROVED","TENDERPAW_PLAYER_MENTOR","UNIQUE_SPECIALTY"]
  },
  grants: { fate: 1, persona: 1, checks: 0 },
  metadata: {
    source: SOURCE,
    coreEngine: "CORE_M9",
    liveAuthority: "CORE_M9_WHEN_ACTIVE",
    commitAuthority: "CORE_M9_WHEN_ACTIVE",
    mode: "READY_WHEN_ACTIVE",
    foundationOnly: true,
    readyWhenActive: true,
    activationRequired: "mg1e",
    automaticNpcCreation: false,
    profileRoutingKind: "MG1E_FAMILY"
  },
  derive,
  validateStep,
  buildCommitSpec
});

export const MG1E_CREATION_WEAPONS = WEAPONS;
export const MG1E_CREATION_SKILL_LISTS = freeze({
  naturalTalent: [...NATURAL_TALENT_SKILLS],
  parentsTrade: [...TRADE_SKILLS],
  convincing: [...CONVINCING_SKILLS],
  mentorTraining: [...MENTOR_SKILLS],
  specialty: [...SPECIALTY_SKILLS]
});
