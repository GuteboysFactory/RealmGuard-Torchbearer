import assert from "node:assert/strict";
import fs from "node:fs";

const { ProfileResolver } = await import("../module/core/rules-profile.mjs");
const { REALM_GUARD_LEGACY_MIXED_PROFILE } = await import("../module/profiles/realm-guard-legacy-mixed.mjs");
const { MG1E_FOUNDATION_PROFILE } = await import("../module/profiles/mg1e-foundation.mjs");
const { REALM_GUARD_STRICT_PROFILE } = await import("../module/profiles/realm-guard-strict.mjs");
const { buildProfileCapabilities } = await import("../module/profile-capabilities.mjs");

const resolver = new ProfileResolver([
  MG1E_FOUNDATION_PROFILE,
  REALM_GUARD_LEGACY_MIXED_PROFILE,
  REALM_GUARD_STRICT_PROFILE
]);

const legacy = buildProfileCapabilities(resolver.resolve("realm-guard-legacy-mixed"));
const strict = buildProfileCapabilities(resolver.resolve("realm-guard-strict"));
const mg1e = buildProfileCapabilities(resolver.resolve("mg1e"));

assert.match(legacy.phase, /^M10B\.[1-4]$/);
assert.equal(legacy.profile.id, "realm-guard-legacy-mixed");
assert.equal(legacy.rules.wises.rated, false);
assert.equal(legacy.rules.wises.selfUse, "LEGACY_WISE_REROLL");
assert.equal(legacy.rules.wises.helperUse, "LEGACY_I_AM_WISE_1D");
assert.equal(legacy.rules.help.synergyEnabled, true);
assert.equal(legacy.rules.help.afraidBlocksHelp, true);
assert.equal(legacy.rules.help.sourcePolicy, "LEGACY_OPEN");
assert.equal(legacy.rules.traits.mg1eLevelSemantics, false);
assert.equal(legacy.rules.inventory.policy, "STRUCTURED");
assert.equal(legacy.rules.inventory.placementAuthority, true);
assert.equal(legacy.rules.conflict.unarmedDefaultDice, -1);
assert.equal(legacy.rules.progression.levelsEnabled, true);
assert.equal(legacy.rules.progression.talentsEnabled, true);
assert.equal(legacy.rules.tokensOfPower.enabled, true);
assert.equal(legacy.presentation.showLevels, true);
assert.equal(legacy.dataPolicy.deleteOnProfileSwitch, false);

assert.equal(strict.profile.id, "realm-guard-strict");
assert.equal(strict.rules.wises.rated, true);
assert.equal(strict.rules.wises.selfUse, "I_AM_WISE_1D");
assert.equal(strict.rules.wises.helperUse, "TEAMWORK_WISE_1D");
assert.equal(strict.rules.help.synergyEnabled, false);
assert.equal(strict.rules.help.afraidBlocksHelp, false);
assert.equal(strict.rules.help.sourcePolicy, "MG1E_TYPED");
assert.deepEqual(strict.rules.nature.descriptors, ["Tradition","Family","Grief"]);
assert.equal(strict.rules.nature.doubleTapNature, true);
assert.equal(strict.rules.traits.mg1eLevelSemantics, true);
assert.equal(strict.rules.inventory.policy, "LOOSE");
assert.equal(strict.rules.inventory.placementAuthority, false);
assert.equal(strict.rules.conflict.unarmedDefaultDice, 0);
assert.equal(strict.rules.progression.levelsEnabled, false);
assert.equal(strict.rules.progression.talentsEnabled, false);
assert.equal(strict.rules.tokensOfPower.enabled, true);
assert.equal(strict.rules.naturalOrder.enabled, false);
assert.equal(strict.rules.scaleOfMight.enabled, true);
assert.equal(strict.rules.conditions.names.includes("Strained"), true);
assert.equal(strict.rules.conditions.names.includes("Sick"), false);
assert.equal(strict.rules.recovery.familySemantics, true);
assert.deepEqual(strict.rules.recovery.order, ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
assert.equal(strict.rules.recovery.gmTurnCheckCost, 2);
assert.equal(strict.presentation.showLevels, false);
assert.equal(strict.dataPolicy.preserveInactiveData, true);

assert.equal(mg1e.profile.id, "mg1e");
assert.equal(mg1e.profile.foundationOnly, true);
assert.equal(mg1e.profile.selectable, false);
assert.equal(mg1e.profile.supported, false);
assert.equal(mg1e.profile.liveRuleAuthority, false);
assert.equal(mg1e.rules.wises.rated, true);
assert.equal(mg1e.rules.wises.helperUse, "TEAMWORK_WISE_1D");
assert.equal(mg1e.rules.help.synergyEnabled, false);
assert.equal(mg1e.rules.help.sourcePolicy, "MG1E_TYPED");
assert.deepEqual(mg1e.rules.nature.descriptors, ["Escaping","Climbing","Hiding","Foraging"]);
assert.equal(mg1e.rules.nature.label, "Nature (Mouse)");
assert.equal(mg1e.rules.nature.doubleTapNature, true);
assert.equal(mg1e.rules.traits.mg1eLevelSemantics, true);
assert.equal(mg1e.rules.inventory.policy, "LOOSE");
assert.equal(mg1e.rules.conflict.unarmedDefaultDice, 0);
assert.equal(mg1e.rules.progression.levelsEnabled, false);
assert.equal(mg1e.rules.progression.talentsEnabled, false);
assert.equal(mg1e.rules.tokensOfPower.enabled, false);
assert.equal(mg1e.rules.naturalOrder.enabled, true);
assert.equal(mg1e.rules.naturalOrder.mode, "MG1E");
assert.equal(mg1e.rules.scaleOfMight.enabled, false);
assert.equal(mg1e.rules.inventory.capacityMode, "CHARACTER_SHEET_GEAR_SPACE");
assert.equal(mg1e.rules.conditions.names.includes("Sick"), true);
assert.equal(mg1e.rules.conditions.names.includes("Strained"), false);
assert.equal(mg1e.rules.recovery.familySemantics, true);
assert.deepEqual(mg1e.rules.recovery.order, ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"]);
assert.equal(mg1e.rules.recovery.gmTurnCheckCost, 2);

for (const key of ["rated","helperUse","synergyEnabled","mg1eLevelSemantics","policy","unarmedDefaultDice"]) {
  const pair = {
    rated: [strict.rules.wises.rated, mg1e.rules.wises.rated],
    helperUse: [strict.rules.wises.helperUse, mg1e.rules.wises.helperUse],
    synergyEnabled: [strict.rules.help.synergyEnabled, mg1e.rules.help.synergyEnabled],
    mg1eLevelSemantics: [strict.rules.traits.mg1eLevelSemantics, mg1e.rules.traits.mg1eLevelSemantics],
    policy: [strict.rules.inventory.policy, mg1e.rules.inventory.policy],
    unarmedDefaultDice: [strict.rules.conflict.unarmedDefaultDice, mg1e.rules.conflict.unarmedDefaultDice]
  }[key];
  assert.deepEqual(pair[0], pair[1], `Strict inheritance and MG1E foundation diverged for ${key}`);
}

const capabilitySource = fs.readFileSync(new URL("../module/profile-capabilities.mjs", import.meta.url), "utf8");
for (const forbidden of ["game.settings.set", "createEmbeddedDocuments", "deleteEmbeddedDocuments", "Actor.create", ".delete("]) {
  assert.equal(capabilitySource.includes(forbidden), false, `Capability router must remain read-only: ${forbidden}`);
}

const activationSource = fs.readFileSync(new URL("../module/m10-profile-activation.mjs", import.meta.url), "utf8");
assert.equal(activationSource.includes('"mg1e"'), false, "M10B.1 must not make MG1E selectable/live.");

const consumers = [
  "../module/conditions.mjs",
  "../module/teamwork.mjs",
  "../module/traits.mjs",
  "../module/progression.mjs",
  "../module/conflicts.mjs",
  "../module/documents.mjs",
  "../sheets/actor-sheet.mjs"
];
assert.ok(consumers.some(path => fs.readFileSync(new URL(path, import.meta.url), "utf8").includes("isStrictRealmGuard")), "M10B.1 is shadow parity only; existing live routing must remain in place.");

console.log("PASS M10B.1/M10B.2 Generic Profile Presentation & Rule Router · Legacy/Strict parity preserved · MG1E foundation read-only/not selectable");
