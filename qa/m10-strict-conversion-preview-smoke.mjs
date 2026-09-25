import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildStrictConversionPreview } from "../module/m10-profile-conversion-preview.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.\d+\.\d+(?:\.\d+)*(?:-(?:alpha|beta|rc|qa)\.\d+)?$/, "M10A.1 smoke runs across v1.11.0.");

const resolver = new ProfileResolver([
  MG1E_FOUNDATION_PROFILE,
  REALM_GUARD_LEGACY_MIXED_PROFILE,
  REALM_GUARD_STRICT_PROFILE
]);

const legacy = resolver.resolve("realm-guard-legacy-mixed");
const strict = resolver.resolve("realm-guard-strict");

assert.deepEqual(strict.lineage.map(row => row.id), ["mg1e", "realm-guard-strict"]);
assert.equal(typeof strict.metadata.previewOnly, "boolean");
assert.equal(typeof strict.metadata.selectable, "boolean");
assert.equal(typeof strict.metadata.supported, "boolean");
assert.equal(typeof strict.metadata.liveRuleAuthority, "boolean");
assert.equal(strict.metadata.conversionPreviewAvailable, true);

assert.equal(strict.domains.wises.ratingMode, "RATED");
assert.equal(strict.domains.inventory.policy, "LOOSE");
assert.equal(strict.domains.progression.levels, false);
assert.equal(strict.domains.progression.talents, false);
assert.deepEqual(strict.domains.nature.descriptors, ["Tradition", "Family", "Grief"]);
assert.equal(strict.domains.conditions.set.includes("Strained"), true);
assert.equal(strict.domains.conditions.set.includes("Fresh"), false);
assert.equal(strict.domains.conditions.set.includes("Afraid"), false);
assert.equal(strict.domains.tokensOfPower.enabled, true);
assert.equal(strict.domains.scaleOfMight.enabled, true);
assert.equal(strict.domains.scaleOfMight.automation, "MANUAL_GUIDED");
assert.equal(strict.domains.conflict.unarmedDefaultDice, 0);

assert.equal(strict.registry.find(row => row.id === "WISE.MODE")?.providerProfile, "mg1e");
assert.equal(strict.registry.find(row => row.id === "TRAIT.MODE")?.providerProfile, "mg1e");
assert.equal(strict.registry.find(row => row.id === "INVENTORY.POLICY")?.providerProfile, "mg1e");
assert.equal(strict.registry.find(row => row.id === "CONDITIONS.MODE")?.providerProfile, "realm-guard-strict");
assert.equal(strict.registry.find(row => row.id === "TOKENS_OF_POWER.MODE")?.providerProfile, "realm-guard-strict");
assert.equal(strict.registry.find(row => row.id === "SCALE_OF_MIGHT.MODE")?.providerProfile, "realm-guard-strict");

const fakeActors = [{
  id: "r1",
  name: "Ranger One",
  type: "character",
  system: { progression: { level: 2, spentFate: 0, spentPersona: 0 } },
  flags: { "realm-guard": { creationProvenance: { rulesProfileId: "realm-guard-legacy-mixed" } } },
  items: { contents: [
    { id: "w1", type: "wise", name: "Road-wise", system: { description: "" } },
    { id: "t1", type: "talent", name: "Legacy Talent", system: {} },
    { id: "g1", type: "gear", name: "Sword", system: { inventory: { mode: "hand", location: "", containerId: "" } } },
    { id: "c1", type: "condition", name: "Fresh", system: { active: true } }
  ] }
}, {
  id: "r2",
  name: "Ranger Two",
  type: "character",
  system: { progression: { level: 1, spentFate: 0, spentPersona: 0 } },
  items: { contents: [{ id: "c2", type: "condition", name: "Afraid", system: { active: false } }] }
}];

const preview = buildStrictConversionPreview({
  fromProfile: legacy,
  toProfile: strict,
  actors: fakeActors,
  worldItems: [{ id: "wt", type: "talent", name: "Template Talent", system: {} }]
});

assert.equal(preview.kind, "ProfileConversionPreview");
assert.equal(preview.mode, "READ_ONLY");
assert.equal(preview.readOnly, true);
assert.equal(preview.activationAllowed, false);
assert.equal(preview.writesPlanned, 0);
assert.equal(preview.safety.actorWrites, 0);
assert.equal(preview.safety.itemWrites, 0);
assert.equal(preview.safety.settingWrites, 0);
assert.equal(preview.safety.profileSwitch, false);
assert.equal(preview.safety.destructiveConversion, false);
assert.ok(preview.domainDiff.length > 10);
assert.ok(preview.deltas.some(row => row.id === "WISE_RATINGS"));
assert.ok(preview.deltas.some(row => row.id === "LEVELS_TALENTS"));
assert.ok(preview.deltas.some(row => row.id === "SCALE_OF_MIGHT"));
assert.equal(preview.worldImpact.rangers, 2);
assert.equal(preview.worldImpact.rangersWithWises, 1);
assert.equal(preview.worldImpact.wiseItems, 1);
assert.equal(preview.worldImpact.talentItems, 1);
assert.equal(preview.worldImpact.actorsAboveLevelOne, 1);
assert.equal(preview.worldImpact.structuredGearItems, 1);
assert.equal(preview.worldImpact.freshItems, 1);
assert.equal(preview.worldImpact.afraidItems, 1);
assert.equal(preview.worldImpact.actorsWithLegacyCreationProvenance, 1);
assert.equal(preview.worldImpact.standaloneTemplates.talents, 1);

const previewSource = fs.readFileSync("module/m10-profile-conversion-preview.mjs", "utf8");
for (const forbidden of ["game.settings.set", ".updateEmbeddedDocuments(", ".createEmbeddedDocuments(", ".deleteEmbeddedDocuments(", ".setFlag(", ".unsetFlag("]) {
  assert.equal(previewSource.includes(forbidden), false, `Read-only preview contains mutation API: ${forbidden}`);
}

const serviceSource = fs.readFileSync("module/rules-profile-service.mjs", "utf8");
assert.ok(serviceSource.includes("Preview Strict Conversion"));
assert.equal(serviceSource.includes("setActiveRulesProfile"), false);

const dataModels = fs.readFileSync("module/data-models.mjs", "utf8");
assert.ok(dataModels.includes("export class RealmGuardWiseData extends TypeDataModel"), "Wise data model must remain registered.");
assert.ok(dataModels.includes("rating: int(0, 0, 12)"), "M10A.2 additive Wise rating schema must remain available without forcing a rating.");
assert.ok(dataModels.includes("learning: new fields.SchemaField"), "M10A.2 additive Wise learning schema must remain available.");

console.log("PASS M10A.1 regression · Strict Registry + read-only Conversion Preview · no preview world writes across later activation phases");
