import assert from "node:assert/strict";
import { ProfileResolver, createProfileSnapshot } from "../module/core/rules-profile.mjs";
import { RulesRegistry } from "../module/core/rules-registry.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";

const resolver = new ProfileResolver([REALM_GUARD_LEGACY_MIXED_PROFILE]);
const resolved = resolver.resolve("realm-guard-legacy-mixed");
const registry = new RulesRegistry(resolved);
const snapshot = createProfileSnapshot(resolved);

assert.equal(resolved.id, "realm-guard-legacy-mixed");
assert.equal(resolved.version, 1);
assert.equal(resolved.domains.wises.ratingMode, "NONE");
assert.equal(resolved.domains.inventory.policy, "STRUCTURED");
assert.equal(resolved.domains.progression.levels, true);
assert.equal(resolved.domains.progression.talents, true);
assert.equal(registry.get("WISE.MODE")?.activeValue, "UNRATED");
assert.equal(registry.get("INVENTORY.POLICY")?.activeValue, "STRUCTURED");
assert.equal(registry.get("PROGRESSION.LEVELS_TALENTS")?.activeValue, "ENABLED");
assert.equal(registry.list().length, 16);
assert.match(snapshot.rulesSnapshotHash, /^fnv1a-[0-9a-f]{8}$/);
assert.deepEqual(snapshot, {
  profileId: "realm-guard-legacy-mixed",
  profileVersion: 1,
  rulesSnapshotHash: resolved.rulesSnapshotHash
});
assert.equal(Object.isFrozen(resolved), true);
assert.equal(Object.isFrozen(resolved.domains), true);
assert.equal(Object.isFrozen(snapshot), true);

const resolvedAgain = resolver.resolve("realm-guard-legacy-mixed");
assert.equal(resolvedAgain.rulesSnapshotHash, resolved.rulesSnapshotHash);

console.log(`M1 profile smoke PASS · ${resolved.id} v${resolved.version} · ${resolved.rulesSnapshotHash} · ${registry.list().length} rules`);
