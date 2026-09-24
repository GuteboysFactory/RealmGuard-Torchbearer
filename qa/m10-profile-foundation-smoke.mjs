import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.\d+\.\d+(?:-qa\.\d+)?$/, "M10 foundation smoke accepts the continuing 1.x QA/stable line.");

const resolver = new ProfileResolver([
  MG1E_FOUNDATION_PROFILE,
  REALM_GUARD_LEGACY_MIXED_PROFILE,
  REALM_GUARD_STRICT_PROFILE
]);

const legacy = resolver.resolve("realm-guard-legacy-mixed");
assert.equal(legacy.id, "realm-guard-legacy-mixed");
assert.equal(legacy.domains.wises.ratingMode, "NONE");
assert.equal(legacy.domains.inventory.policy, "STRUCTURED");
assert.equal(legacy.domains.progression.levels, true);
assert.deepEqual(legacy.lineage.map(row => row.id), ["realm-guard-legacy-mixed"]);

const strict = resolver.resolve("realm-guard-strict");
assert.deepEqual(strict.lineage.map(row => row.id), ["mg1e", "realm-guard-strict"]);
assert.equal(strict.metadata.strictRealmGuard, true);
assert.equal(strict.metadata.foundationOnly, false);
assert.equal(typeof strict.metadata.previewOnly, "boolean");
assert.ok(["PREVIEW_ONLY","QA_ACTIVE"].includes(strict.metadata.activationState));
assert.equal(typeof strict.metadata.selectable, "boolean");
assert.equal(typeof strict.metadata.supported, "boolean");
assert.equal(typeof strict.metadata.liveRuleAuthority, "boolean");
assert.equal(strict.metadata.conversionRequired, true);
assert.equal(strict.registry.find(entry => entry.id === "PROFILE.IDENTITY")?.providerProfile, "realm-guard-strict");

const baseline = fs.readFileSync("module/core-baseline.mjs", "utf8");
assert.equal(baseline.includes("profileId === LEGACY_PROFILE_ID"), false, "CORE baseline readiness must not hard-lock Legacy Mixed.");
assert.ok(baseline.includes("if (!before.profileId) await setIfDifferent(SETTINGS.profileId, targetProfileId);"));
assert.ok(baseline.includes("if (before.profileVersion < 1) await setIfDifferent(SETTINGS.profileVersion, targetProfileVersion);"));

const profileService = fs.readFileSync("module/rules-profile-service.mjs", "utf8");
assert.ok(profileService.includes("MG1E_FOUNDATION_PROFILE"));
assert.ok(profileService.includes("REALM_GUARD_STRICT_PROFILE"));
assert.equal(profileService.includes("setActiveRulesProfile"), false, "M10 profile foundation must not expose a live profile switch before activation QA.");

console.log("PASS M10A.0 foundation regression · strict inheritance preserved · Legacy Mixed preserved across later activation phases");
