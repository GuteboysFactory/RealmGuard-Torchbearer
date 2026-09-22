import { CharacterCreationProfile, CREATION_PROFILE_ID } from "../core/m9-creation.mjs";

const STATIONS = Object.freeze({
  recruit: { label: "Recruit", ageMin: 20, ageMax: 25, will: 2, health: 6, resources: 1, circles: 1, natural: 2, service: 3, wises: 1 },
  scout: { label: "Scout", ageMin: 25, ageMax: 45, will: 3, health: 5, resources: 2, circles: 2, natural: 1, service: 6, wises: 2 },
  veteran: { label: "Veteran", ageMin: 40, ageMax: 75, will: 4, health: 4, resources: 3, circles: 3, natural: 1, service: 8, wises: 3 },
  captain: { label: "Captain", ageMin: 50, ageMax: 90, will: 5, health: 4, resources: 4, circles: 3, natural: 1, service: 9, wises: 4 },
  lord: { label: "Lord", ageMin: 80, ageMax: 150, will: 6, health: 3, resources: 5, circles: 4, natural: 2, service: 12, wises: 6 }
});

const HOMELANDS = Object.freeze({
  rhudaur: { label: "Rhudaur", skills: ["Archivist", "Animal Handler", "Carpenter"], traits: ["Calm", "Natural Bearings"] },
  bree: { label: "Bree-land", skills: ["Miller", "Farmer", "Brewer"], traits: ["Short", "Independent"] },
  esgaroth: { label: "Esgaroth & Dale", skills: ["Boatcrafter", "Carpenter", "Haggler"], traits: ["Sharp-Eyed", "Driven"] },
  gondor: { label: "Gondor", skills: ["Archivist", "Stonemason", "Alchemist"], traits: ["Brave", "Wise"] },
  doren: { label: "Dor-en-Ernil", skills: ["Rider", "Boatcrafter", "Orator"], traits: ["Graceful", "Tall"] },
  tharbad: { label: "Tharbad", skills: ["Haggler", "Glazier", "Laborer"], traits: ["Rational", "Hard Worker"] },
  sarn: { label: "Sarn Ford", skills: ["Farmer", "Stonemason", "Miller"], traits: ["Steady Hand", "Quick-Witted"] },
  rhovanion: { label: "Rhovanion", skills: ["Baker", "Animal Handler", "Herdsman"], traits: ["Stoic", "Tough"] }
});

const NATURE_EFFECTS = Object.freeze({ danger: -1, secondAge: 1, loss: 1, wilds: -1, married: 1, enemyFirst: -1 });
const RESOURCE_EFFECTS = Object.freeze({ trade: 1, parentsWealth: 1, gifts: -1, thrifty: 1, debt: -1, pack: 1 });
const CIRCLES_EFFECTS = Object.freeze({ gregarious: 1, rangerTies: 1, reputation: 1, enemies: -1, crime: -1, loner: -1 });

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

function derive({ answers = {}, allocations = {} } = {}) {
  const rank = String(answers.rank || "scout");
  const station = STATIONS[rank] ?? STATIONS.scout;
  const nature = questionTotal(3, answers.natureAnswers, NATURE_EFFECTS);
  const resources = questionTotal(station.resources, answers.resourceAnswers, RESOURCE_EFFECTS, 0);
  const circles = questionTotal(station.circles, answers.circleAnswers, CIRCLES_EFFECTS, 1);

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
      gear,
      grants: [
        { type: "RESOURCE", key: "fate", value: 1 },
        { type: "RESOURCE", key: "persona", value: 1 }
      ]
    },
    warnings: []
  };
}

export const REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE = new CharacterCreationProfile({
  id: CREATION_PROFILE_ID,
  version: 1,
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
    liveAuthority: "LEGACY_RECRUITMENT",
    coreMode: "SHADOW_ONLY",
    source: "v1.9.0 STABLE Recruitment 2.0",
    strictRealmGuard: false
  },
  derive
});

export { STATIONS as LEGACY_CREATION_STATIONS, HOMELANDS as LEGACY_CREATION_HOMELANDS };
