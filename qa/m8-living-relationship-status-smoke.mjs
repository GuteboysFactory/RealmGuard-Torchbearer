import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.9\.0(?:-qa\.\d+)?$/, "Smoke must accept stable 1.9.0 and 1.9.0-qa.x builds.");

const service = fs.readFileSync("module/m8-social-network-service.mjs", "utf8");
for (const needle of [
  "M8_RELATIONSHIP_STATUS_OPTIONS",
  "updateM8RelationshipStatus",
  "Relationship status changes are GM-only during M8 migration."
]) assert.ok(service.includes(needle), `Missing qa.37 service marker: ${needle}`);

const sheet = fs.readFileSync("sheets/actor-sheet.mjs", "utf8");
for (const needle of [
  "changeRelationshipStatus",
  "_changeRelationshipStatus",
  "Save Relationship",
  "Reason / event",
  "Session / reference",
  "updateM8RelationshipStatus",
  "M8_RELATIONSHIP_STATUS_OPTIONS"
]) assert.ok(sheet.includes(needle), `Missing qa.37 sheet marker: ${needle}`);

const template = fs.readFileSync("templates/actor/character.hbs", "utf8");
for (const needle of [
  "data-rg-relationship-id",
  'data-action="changeRelationshipStatus"',
  "Relationship History",
  "recentHistory",
  "recorded change(s)"
]) assert.ok(template.includes(needle), `Missing qa.37 template marker: ${needle}`);

const css = fs.readFileSync("styles/qa27-m8-relationships.css", "utf8");
for (const needle of [
  "qa.37 — Living Relationship Status & History",
  "rg-m8-status-dialog",
  "rg-m8-history-entry",
  "rg-status-NEUTRAL"
]) assert.ok(css.includes(needle), `Missing qa.37 CSS marker: ${needle}`);

console.log("PASS qa.37 Living Relationship Status UX smoke");
