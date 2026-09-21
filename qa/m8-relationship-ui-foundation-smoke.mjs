import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.9\.0(?:-qa\.\d+)?$/, "Smoke must accept stable 1.9.0 and 1.9.0-qa.x builds.");
assert.ok(manifest.styles.includes("styles/qa27-m8-relationships.css"));

const service = fs.readFileSync("module/m8-social-network-service.mjs", "utf8");
assert.ok(service.includes("buildM8RelationshipSheetView"));
assert.ok(service.includes('"NORMALIZED_PLUS_CURRENT_LEGACY"'));
assert.ok(service.includes('"LEGACY_FALLBACK"'));
assert.ok(service.includes("linkedActorView"));
assert.ok(service.includes("linkM8PersonActor"));

const sheet = fs.readFileSync("sheets/actor-sheet.mjs", "utf8");
assert.ok(sheet.includes("buildM8RelationshipSheetView"));
assert.ok(sheet.includes("linkRelationshipActor"));
assert.ok(sheet.includes("openRelationshipActor"));
assert.ok(sheet.includes("unlinkRelationshipActor"));
assert.ok(sheet.includes("Relationship linked to existing Actor"));
assert.ok(sheet.includes("The Actor itself was not deleted"));

const template = fs.readFileSync("templates/actor/character.hbs", "utf8");
assert.ok(template.includes("rg-m8-relationship-card"));
assert.ok(template.includes("Link Existing Actor"));
assert.ok(template.includes("Legacy Relationship Fields"));
assert.ok(template.includes("system.parents"));
assert.ok(template.includes("system.seniorArtisan"));
assert.ok(template.includes("system.mentor"));
assert.ok(template.includes("system.friend"));
assert.ok(template.includes("system.enemy"));

const css = fs.readFileSync("styles/qa27-m8-relationships.css", "utf8");
assert.ok(css.includes(".rg-m8-relationship-card"));
assert.ok(css.includes(".rg-status-FRIENDLY"));
assert.ok(css.includes(".rg-status-HOSTILE"));

console.log("PASS M8 Relationship UI foundation smoke");
