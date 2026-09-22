import assert from "node:assert/strict";
import fs from "node:fs";
import { CharacterCreationEngine, CreationPartyContext } from "../module/core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "../module/profiles/realm-guard-legacy-mixed-creation.mjs";
import { FoundryCreationCommitAdapter } from "../module/m9-creation-commit-adapter.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.(?:10|11)\.0(?:-qa\.\d+)?$/);

const engine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const draft = engine.createDraft({
  answers: {
    name: "Live Commit Ranger",
    concept: "qa4",
    background: "Transactional test.",
    rank: "scout",
    age: 30,
    homelandKey: "bree",
    homelandSkill: "Farmer",
    homelandTrait: "Short",
    natureAnswers: { danger: false, secondAge: false, loss: false, wilds: false, married: false, enemyFirst: false },
    apprenticeship: "Farmer",
    mentorTraining: "Scout",
    specialty: "Pathfinder",
    resourceAnswers: { trade: true, parentsWealth: false, gifts: false, thrifty: false, debt: false, pack: false },
    resourceTrade: "Farmer",
    circleAnswers: { gregarious: true, rangerTies: false, reputation: false, enemies: false, crime: false, loner: false },
    innateTrait: "Calm",
    inheritedTrait: "",
    roadTrait: "",
    mentorRuleConfirmed: true,
    allowEnemyServant: false,
    relationships: {
      lineage: "House QA4",
      insignia: "White Star",
      mother: { name: "Mara", profession: "Farmer", location: "Bree" },
      father: { name: "", profession: "", location: "" },
      seniorArtisan: { name: "Harl", profession: "Farmer", location: "Bree" },
      mentor: { name: "Tor", role: "Ranger Veteran", location: "Bree" },
      friend: { name: "Pip", profession: "Miller", location: "Bree" },
      enemy: { name: "Rusk", people: "Man", profession: "Bandit", location: "Bree-land" }
    },
    drives: { belief: "Guard the road.", goal: "Find the ford.", instinct: "Check the trail." },
    weapon: "Sword",
    armor: "",
    distinctiveGear: "Rope"
  },
  allocations: {
    naturalTalent: ["Scout"],
    parentsTrade: ["Farmer"],
    convincing: ["Persuader"],
    serviceAlloc: { Scout: 3, Pathfinder: 3 },
    wiseChoices: ["Road-wise", "Bree-land-wise"]
  }
});

const plan = engine.buildCommitPlan(draft, new CreationPartyContext());
assert.equal(plan.liveMutation, true);
assert.equal(plan.transaction.liveExecution, true);
assert.equal(plan.transaction.provenanceWrite, true);
assert.equal(plan.transaction.relationshipWrite, true);
assert.ok(plan.transaction.criticalPhases.includes("WRITE_PROVENANCE"));

let deleted = 0;
let provenanceWrites = 0;
let relationshipWrites = 0;
let createdItems = 0;
const fakeActor = {
  id: "qa4-actor",
  name: "Live Commit Ranger",
  type: "character",
  items: [],
  async updateEmbeddedDocuments() { return []; },
  async createEmbeddedDocuments(_type, docs) { createdItems += docs.length; return docs; },
  async setFlag(scope, key, value) {
    assert.equal(scope, "realm-guard");
    assert.equal(key, "creationProvenance");
    assert.equal(value.rulesSnapshotHash, "fnv1a-qa4test");
    provenanceWrites += 1;
    return value;
  },
  async delete() { deleted += 1; return true; }
};

const runtime = {
  ensureFolder: async () => ({ id: "pc-folder" }),
  createActor: async () => fakeActor,
  applySkillRatings: async () => 0,
  createPlannedItems: async (actor, p) => actor.createEmbeddedDocuments("Item", [...p.provisioning.traits, ...p.provisioning.wises, ...p.provisioning.gear]),
  ensureConditions: async () => [],
  normalizeRelationships: async () => {
    relationshipWrites += 1;
    return { created: true, snapshot: { people: [], relationships: [] } };
  }
};

const rulesSnapshot = { profileId: "realm-guard-legacy-mixed", profileVersion: 1, rulesSnapshotHash: "fnv1a-qa4test" };
const adapter = new FoundryCreationCommitAdapter({ shadowOnly: false, runtime });

await assert.rejects(
  adapter.execute(plan, { isGM: true, userId: "gm", rulesSnapshot, faultPhase: "CREATE_ITEMS" }),
  error => Boolean(error?.realmGuardCommit?.rolledBack) && error?.realmGuardCommit?.phase === "CREATE_ITEMS"
);
assert.equal(deleted, 1, "Injected failure after Actor creation must delete the new Actor.");
assert.equal(provenanceWrites, 0, "Provenance must not be written after a failed transaction.");
assert.equal(relationshipWrites, 0, "M8 normalization must not run after an earlier failed transaction.");

deleted = 0;
const result = await adapter.execute(plan, { isGM: true, userId: "gm", rulesSnapshot });
assert.equal(result.actor, fakeActor);
assert.equal(result.rolledBack, false);
assert.equal(provenanceWrites, 1);
assert.equal(relationshipWrites, 1);
assert.ok(createdItems > 0);
assert.ok(result.completedPhases.includes("WRITE_PROVENANCE"));

const adapterSource = fs.readFileSync("module/m9-creation-commit-adapter.mjs", "utf8");
for (const marker of ["Actor?.create", "DELETE_CREATED_ACTOR", "creationProvenance", "ensureM8RecruitmentNetwork"]) {
  assert.ok(adapterSource.includes(marker), `Missing live commit marker: ${marker}`);
}
assert.equal(adapterSource.includes("ChatMessage"), false, "Chat must remain outside the atomic adapter.");
assert.equal(adapterSource.includes("reviewRecruitmentRelationshipNpcs"), false, "NPC review must remain outside the atomic adapter.");

const recruitment = fs.readFileSync("module/recruitment.mjs", "utf8");
assert.ok(recruitment.includes("commitM9Recruitment(state)"));
assert.ok(recruitment.includes("shouldUseLegacyM9Commit()"));
assert.ok(recruitment.includes("async function createRanger(state)"), "Legacy commit must remain for explicit QA rollback.");
assert.ok(recruitment.includes("CORE Creation parity mismatch. The Ranger was not created"));

const m8 = fs.readFileSync("module/m8-social-network-service.mjs", "utf8");
assert.ok(m8.includes("export async function ensureM8RecruitmentNetwork"));

console.log("PASS M9 qa.4 CORE live transactional commit · rollback · provenance · M8 normalization smoke");
