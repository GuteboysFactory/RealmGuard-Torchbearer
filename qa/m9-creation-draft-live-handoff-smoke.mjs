import assert from "node:assert/strict";
import fs from "node:fs";
import { CharacterCreationEngine, CreationPartyContext } from "../module/core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "../module/profiles/realm-guard-legacy-mixed-creation.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.(?:10|11)\.0(?:-qa\.\d+)?$/, "M9 draft live-handoff regression smoke must accept the v1.10-v1.11 QA/stable lines.");

const engine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const answers = {
  name: "Qa Two",
  rank: "scout",
  age: 30,
  homelandKey: "bree",
  homelandSkill: "Farmer",
  homelandTrait: "Short",
  natureAnswers: { danger: false, secondAge: false, loss: false, wilds: false, married: false, enemyFirst: false },
  apprenticeship: "Farmer",
  mentorTraining: "Scout",
  specialty: "Pathfinder",
  resourceAnswers: { trade: true, parentsWealth: true, gifts: false, thrifty: false, debt: false, pack: false },
  resourceTrade: "Farmer",
  parentsResourceProfession: "Merchant",
  circleAnswers: { gregarious: true, rangerTies: true, reputation: false, enemies: false, crime: false, loner: false },
  rangerTiesBasis: "parents",
  innateTrait: "Calm",
  inheritedTrait: "",
  roadTrait: "",
  mentorRuleConfirmed: true,
  allowEnemyServant: false,
  relationships: {
    lineage: "House QA",
    insignia: "Silver Leaf",
    mother: { name: "Mara", profession: "Merchant", location: "Bree" },
    father: { name: "", profession: "", location: "" },
    seniorArtisan: { name: "Harl", profession: "Farmer", location: "Bree" },
    mentor: { name: "Tor", role: "Ranger Veteran", location: "Bree" },
    friend: { name: "Pip", profession: "Miller", location: "Bree" },
    enemy: { name: "Rusk", people: "Man", profession: "Bandit", location: "Bree-land" }
  },
  drives: { belief: "Protect the road.", goal: "Reach the ford.", instinct: "Always check the trail." },
  weapon: "Sword",
  armor: "",
  distinctiveGear: "Rope"
};
const allocations = {
  naturalTalent: ["Scout"],
  parentsTrade: ["Farmer"],
  convincing: ["Persuader"],
  serviceAlloc: { Scout: 3, Pathfinder: 3 },
  wiseChoices: ["Road-wise", "Bree-land-wise"]
};
const draft = engine.createDraft({ answers, allocations });
const party = new CreationPartyContext();

for (const stepId of ["identity","nature","homeland","life-experience","service-specialty","wises","resources-circles","traits","relationships","drives-gear","review"]) {
  const result = engine.validateStep(stepId, draft, party);
  assert.equal(result.valid, true, `${stepId} should validate: ${JSON.stringify(result.errors)}`);
}

const badService = engine.createDraft({ answers, allocations: { ...allocations, serviceAlloc: { Scout: 2 } } });
assert.equal(engine.validateStep("service-specialty", badService, party).valid, false);

const collisionParty = new CreationPartyContext({ existingCharacters: [{ name: "Existing Ranger", specialty: "Pathfinder" }] });
assert.equal(engine.validateStep("service-specialty", draft, collisionParty).errors[0]?.code, "SPECIALTY_NOT_UNIQUE");

const bannedDraft = engine.createDraft({
  answers: { ...answers, natureAnswers: { ...answers.natureAnswers, married: true }, homelandTrait: "Independent" },
  allocations
});
assert.ok(bannedDraft.derivedValues.restrictions.bannedTraits.includes("Independent"));
assert.equal(engine.validateStep("homeland", bannedDraft, party).valid, false);

const recruitment = fs.readFileSync("module/recruitment.mjs", "utf8");
assert.ok(recruitment.includes("validateM9RecruitmentStep(state, stepId)"));
assert.ok(recruitment.includes("syncM9RecruitmentDraft(state"));
assert.ok(recruitment.includes("using Legacy Recruitment validation fallback"));
assert.ok(recruitment.includes("async function createRanger(state)"));
assert.ok(recruitment.includes('recruitmentVersion: "0.20.0"'));
for (const removed of ["Current result", "Starting result", "Station values"]) {
  assert.equal(recruitment.includes(removed), false, `Pseudo-live Recruitment summary should be removed: ${removed}`);
}

const service = fs.readFileSync("module/m9-creation-shadow.mjs", "utf8");
for (const marker of [
  "syncM9RecruitmentDraft",
  "validateM9RecruitmentStep",
  "getM9RecruitmentRestrictions",
  "CreationStepValidation"
]) assert.ok(service.includes(marker), `Missing durable qa.2 draft/validation capability: ${marker}`);

console.log("PASS v1.10.0-qa.2 M9 draft/recalculation/validation live handoff smoke");
