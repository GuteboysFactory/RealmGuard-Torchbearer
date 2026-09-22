import assert from "node:assert/strict";
import fs from "node:fs";
import { CharacterCreationEngine, CreationPartyContext } from "../module/core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "../module/profiles/realm-guard-legacy-mixed-creation.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.equal(manifest.version, "1.10.0-qa.1");

const engine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const draft = engine.createDraft({
  answers: {
    name: "M9 Smoke Ranger",
    rank: "scout",
    age: 25,
    homelandKey: "bree",
    homelandSkill: "Farmer",
    homelandTrait: "Independent",
    natureAnswers: { danger: false, secondAge: true, loss: false, wilds: false, married: false, enemyFirst: false },
    resourceAnswers: { trade: true, parentsWealth: false, gifts: false, thrifty: false, debt: false, pack: false },
    circleAnswers: { gregarious: true, rangerTies: false, reputation: false, enemies: false, crime: false, loner: false },
    apprenticeship: "Farmer",
    mentorTraining: "Scout",
    specialty: "Pathfinder",
    innateTrait: "Calm",
    weapon: "Sword",
    armor: "",
    distinctiveGear: "Rope"
  },
  allocations: {
    naturalTalent: ["Scout"],
    parentsTrade: ["Farmer"],
    convincing: ["Persuader"],
    serviceAlloc: { Scout: 3, Pathfinder: 3 },
    wiseChoices: ["Bree-land-wise", "Road-wise"]
  }
});

assert.equal(draft.profileId, "realm-guard-legacy-mixed");
assert.equal(draft.derivedValues.abilities.nature, 4);
assert.equal(draft.derivedValues.abilities.resources, 3);
assert.equal(draft.derivedValues.abilities.circles, 3);
assert.equal(draft.derivedValues.resources.fate, 1);
assert.equal(draft.derivedValues.resources.persona, 1);
assert.equal(draft.derivedValues.skillChecks.Farmer, 2);
assert.equal(draft.derivedValues.skillChecks.Scout, 4);
assert.equal(draft.derivedValues.skillChecks.Pathfinder, 4);

const plan = engine.buildCommitPlan(draft, new CreationPartyContext());
assert.equal(plan.kind, "CreationCommitPlan");
assert.equal(plan.liveMutation, false);
assert.equal(plan.provenance.profileId, "realm-guard-legacy-mixed");

const recruitment = fs.readFileSync("module/recruitment.mjs", "utf8");
for (const needle of [
  "observeM9RecruitmentDraft",
  "buildLegacyRecruitmentParitySnapshot",
  "Legacy Recruitment remains authoritative"
]) assert.ok(recruitment.includes(needle), `Missing M9 shadow marker: ${needle}`);

const shadow = fs.readFileSync("module/m9-creation-shadow.mjs", "utf8");
assert.ok(shadow.includes('authority: "LEGACY_RECRUITMENT"'));
assert.ok(shadow.includes('liveApplication: false'));

console.log("PASS v1.10.0-qa.1 M9 Generic Character Creation shadow foundation smoke");
