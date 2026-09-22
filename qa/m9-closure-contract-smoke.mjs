import assert from "node:assert/strict";
import fs from "node:fs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "../module/profiles/realm-guard-legacy-mixed-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.10\.0-qa\.\d+$/, "M9 closure smoke runs across the v1.10.0 QA line.");
assert.equal(manifest.manifest, "https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/qa/system.json");

assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.metadata.liveAuthority, "CORE_M9");
assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.metadata.commitAuthority, "CORE_M9");
assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.metadata.coreMode, "CORE_LIVE_COMMIT");
assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.metadata.parityGuard, "LEGACY_RECRUITMENT");
assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.metadata.strictRealmGuard, false);
assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.rules.wiseMode, "UNRATED");
assert.equal(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.rules.gameplayChangeIntended, false);
assert.deepEqual(
  Object.keys(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.dimensions.find(entry => entry.id === "station")?.options ?? {}),
  ["recruit", "scout", "veteran", "captain", "lord"]
);

assert.equal(REALM_GUARD_LEGACY_MIXED_PROFILE.domains.creation.coreEngine, "live");
assert.equal(REALM_GUARD_LEGACY_MIXED_PROFILE.domains.creation.liveAuthority, "CORE_M9");
assert.equal(REALM_GUARD_LEGACY_MIXED_PROFILE.domains.creation.profileVersion, 4);

const m9 = fs.readFileSync("module/m9-creation-shadow.mjs", "utf8");
for (const marker of [
  'mode: "CORE_LIVE_COMMIT"',
  'authority: "CORE_M9"',
  'draftAuthority: "CORE_M9"',
  'validationAuthority: "CORE_M9"',
  'commitAuthority: "CORE_M9"',
  'parityGuard: "LEGACY_RECRUITMENT"',
  '"TransactionalLiveCommit"',
  '"CreationProvenanceWrite"',
  '"M8RecruitmentNormalization"',
  'legacyCommitAvailability: qaRuntime()',
  'if (qaRuntime()) Object.assign(api, {'
]) assert.ok(m9.includes(marker), `Missing M9 closure authority marker: ${marker}`);

assert.ok(m9.includes("setCommitMode: setM9CommitMode"));
assert.ok(m9.includes("testCommitFailure: setM9CommitFailureTestPhase"));
assert.ok(m9.indexOf("if (qaRuntime()) Object.assign(api, {") < m9.indexOf("setCommitMode: setM9CommitMode"));
assert.equal(m9.includes("commitShadowAuthority:"), false);

const adapter = fs.readFileSync("module/m9-creation-commit-adapter.mjs", "utf8");
for (const marker of [
  "COMPENSATING_ROLLBACK",
  "DELETE_CREATED_ACTOR",
  "creationProvenance",
  "ensureM8RecruitmentNetwork",
  'phase = "WRITE_PROVENANCE"'
]) assert.ok(adapter.includes(marker), `Missing transactional closure capability: ${marker}`);
assert.equal(adapter.includes("ChatMessage"), false, "Chat stays outside the atomic creation transaction.");
assert.equal(adapter.includes("reviewRecruitmentRelationshipNpcs"), false, "NPC review stays outside the atomic creation transaction.");

const recruitment = fs.readFileSync("module/recruitment.mjs", "utf8");
for (const flag of [
  "recruitmentVersion",
  "recruitmentSpecialty",
  "recruitmentWiseChecks",
  "recruitmentSkillChecks",
  "recruitmentNatureAnswers",
  "recruitmentResourceAnswers",
  "recruitmentCircleAnswers",
  "recruitmentRelationships",
  "recruitmentEnemyHouseRule"
]) assert.ok(recruitment.includes(flag), `Missing Legacy Mixed compatibility flag: ${flag}`);
assert.ok(recruitment.includes("commitM9Recruitment(state)"));
assert.ok(recruitment.includes("async function createRanger(state)"), "Legacy reference/fallback implementation must remain during QA closure.");
assert.ok(recruitment.includes("automaticNpcCreation: false") || fs.readFileSync("module/profiles/realm-guard-legacy-mixed-creation.mjs", "utf8").includes("automaticNpcCreation: false"));

const channelSmoke = fs.readFileSync("qa/release-channel-contract-smoke.mjs", "utf8");
assert.ok(channelSmoke.includes("gated qa/stable manifests"));
assert.ok(channelSmoke.includes("no exact QA version pins"));

console.log("PASS M9 qa.5 closure contract · CORE authority · transactional commit · compatibility · gated release");
