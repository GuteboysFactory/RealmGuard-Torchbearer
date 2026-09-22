import assert from "node:assert/strict";
import fs from "node:fs";
import { CharacterCreationEngine, CreationPartyContext, CreationCommitPlan } from "../module/core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "../module/profiles/realm-guard-legacy-mixed-creation.mjs";
import { FoundryCreationCommitAdapter } from "../module/m9-creation-commit-adapter.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.(?:10|11)\.0(?:-qa\.\d+)?$/, "M9 commit-plan regression smoke must accept the v1.10-v1.11 QA/stable lines.");

const engine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const draft = engine.createDraft({
  answers: {
    name: "Commit Shadow Ranger",
    concept: "Commit parity test",
    background: "A test Ranger.",
    rank: "veteran",
    age: 40,
    homelandKey: "rhudaur",
    homelandSkill: "Archivist",
    homelandTrait: "Calm",
    natureAnswers: { danger: true, secondAge: true, loss: false, wilds: false, married: false, enemyFirst: false },
    apprenticeship: "Archivist",
    mentorTraining: "Scout",
    specialty: "Pathfinder",
    resourceAnswers: { trade: true, parentsWealth: false, gifts: false, thrifty: true, debt: false, pack: false },
    resourceTrade: "Archivist",
    circleAnswers: { gregarious: true, rangerTies: false, reputation: false, enemies: false, crime: false, loner: false },
    innateTrait: "Calm",
    inheritedTrait: "",
    roadTrait: "",
    mentorRuleConfirmed: true,
    allowEnemyServant: false,
    relationships: {
      lineage: "House Test",
      insignia: "Silver Star",
      mother: { name: "Mara", profession: "Archivist", location: "Rhudaur" },
      father: { name: "", profession: "", location: "" },
      seniorArtisan: { name: "Harl", profession: "Archivist", location: "Rhudaur" },
      mentor: { name: "Tor", role: "Ranger Veteran", location: "Rhudaur" },
      friend: { name: "Pip", profession: "Carpenter", location: "Rhudaur" },
      enemy: { name: "Rusk", people: "Man", profession: "Bandit", location: "Rhudaur" }
    },
    drives: { belief: "Guard the realm.", goal: "Find the trail.", instinct: "Check the road." },
    weapon: "Sword",
    armor: "Chain armor",
    distinctiveGear: "Rope, Map"
  },
  allocations: {
    naturalTalent: ["Scout"],
    parentsTrade: ["Archivist"],
    convincing: ["Persuader"],
    serviceAlloc: { Scout: 4, Pathfinder: 4 },
    wiseChoices: ["Road-wise", "Angmar-wise", "Arnor-wise"]
  }
});

const plan = engine.buildCommitPlan(draft, new CreationPartyContext());
assert.ok(plan instanceof CreationCommitPlan);
assert.equal(plan.kind, "CreationCommitPlan");
assert.ok(plan.profileVersion >= 3);
assert.equal(plan.actor.name, "Commit Shadow Ranger");
assert.equal(plan.actor.folder.name, "PC");
assert.equal(plan.actor.flags["realm-guard"].recruitmentVersion, "0.20.0");
assert.equal(plan.transaction.mode, "COMPENSATING_ROLLBACK");
assert.ok(plan.transaction.criticalPhases.includes("CREATE_ACTOR"));
assert.ok(plan.transaction.compensation.some(entry => entry.action === "DELETE_CREATED_ACTOR"));
assert.equal(plan.postCommit.find(entry => entry.kind === "RELATIONSHIP_NPC_REVIEW")?.automaticNpcCreation, false);

const adapter = new FoundryCreationCommitAdapter();
const preview = adapter.preview(plan, { isGM: true, userId: "gm" });
assert.equal(preview.liveMutation, false);
assert.equal(preview.projection.skills.length > 30, true);
assert.equal(preview.projection.conditions.length >= 7, true);
assert.equal(preview.rollback.compensation, "DELETE_CREATED_ACTOR");
assert.ok(preview.operations.some(operation => operation.phase === "CREATE_ACTOR"));
assert.equal(adapter.execute(plan, { dryRun: true, isGM: true }).kind, "FoundryCreationCommitPreview");

const adapterSource = fs.readFileSync("module/m9-creation-commit-adapter.mjs", "utf8");
for (const marker of ["class FoundryCreationCommitAdapter", "preview(plan", "execute(plan", "DELETE_CREATED_ACTOR"]) {
  assert.ok(adapterSource.includes(marker), `Missing durable commit-adapter capability: ${marker}`);
}

const recruitment = fs.readFileSync("module/recruitment.mjs", "utf8");
assert.ok(recruitment.includes("buildLegacyRecruitmentCommitProjection"));
assert.ok(recruitment.includes("buildLegacyRecruitmentParitySnapshot(state), buildLegacyRecruitmentCommitProjection(state)"));
assert.ok(recruitment.includes("async function createRanger(state)"));

const shadow = fs.readFileSync("module/m9-creation-shadow.mjs", "utf8");
for (const marker of [
  "commitMismatchedFields",
  "commitParity",
  "buildCommitPreviewFromLegacyState"
]) assert.ok(shadow.includes(marker), `Missing durable qa.3 commit-plan capability: ${marker}`);

console.log("PASS v1.10.0-qa.3 M9 transactional commit-plan / Foundry adapter shadow smoke");
