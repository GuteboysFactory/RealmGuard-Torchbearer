import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";

const resolver = new ProfileResolver([
  MG1E_FOUNDATION_PROFILE,
  MG2E_FOUNDATION_PROFILE,
  REALM_GUARD_LEGACY_MIXED_PROFILE,
  REALM_GUARD_STRICT_PROFILE
]);

const mg2e = resolver.resolve("mg2e");
assert.ok(mg2e.version >= 1);
assert.deepEqual(mg2e.lineage.map(row => row.id), ["mg2e"]);
assert.equal(mg2e.metadata.foundationOnly, false);
assert.equal(mg2e.metadata.selectable, true);
assert.equal(mg2e.metadata.supported, true);
assert.equal(mg2e.metadata.liveRuleAuthority, true);
assert.equal(mg2e.metadata.activationState, "SUPPORTED");
assert.equal(mg2e.domains.wises.ratingMode, "NONE");
assert.equal(mg2e.domains.wises.testableOnOwn, false);
assert.equal(mg2e.domains.wises.effects.iAmWise.dice, 1);
assert.equal(mg2e.domains.wises.effects.deeperUnderstanding.cost, "FATE");
assert.equal(mg2e.domains.wises.effects.ofCourse.cost, "PERSONA");
assert.deepEqual(mg2e.domains.nature.descriptors, ["Escaping","Climbing","Hiding","Foraging"]);
assert.equal(mg2e.domains.traits.levels[1], "PLUS_1D_ONCE_PER_SESSION");
assert.equal(mg2e.domains.traits.levels[2], "PLUS_1D_TWICE_PER_SESSION");
assert.equal(mg2e.domains.traits.levels[3], "PLUS_1S_ALL_APPLICABLE_TESTS");
assert.deepEqual(mg2e.domains.conditions.set, ["Healthy","Hungry & Thirsty","Angry","Tired","Injured","Sick"]);
assert.equal(mg2e.domains.recovery.injured.healerObstacle, 3);
assert.equal(mg2e.domains.recovery.sick.healerObstacle, 4);
assert.equal(mg2e.domains.circles.hometownAdvantageDice, 1);
assert.equal(mg2e.domains.circles.knownContactFutureDice, 1);
assert.equal(mg2e.domains.circles.enmityArgumentSpeechDispositionSuccess, 3);
assert.equal(mg2e.domains.creation.wiseMode, "UNRATED");
assert.deepEqual(mg2e.domains.creation.wiseCountByRank, {
  tenderpaw:1, guardmouse:1, patrolGuard:2, patrolLeader:3, guardCaptain:4
});

const service = fs.readFileSync("module/rules-profile-service.mjs","utf8");
assert.ok(service.includes("MG2E_FOUNDATION_PROFILE"));
const activation = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activation.includes('MG2E_PROFILE_ID'), true, "M10C.8 adds an explicit QA activation path.");
assert.equal(activation.includes('switchToMg2e'), true, "M10C.8 explicit QA switch is present.");

for (const forbidden of ["Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create"]) {
  const source = fs.readFileSync("module/profiles/mg2e-foundation.mjs","utf8");
  assert.equal(source.includes(forbidden), false);
}

console.log("PASS M10C.1 MG2E source foundation · QA-selectable · source ownership retained · source-audited domains registered");
