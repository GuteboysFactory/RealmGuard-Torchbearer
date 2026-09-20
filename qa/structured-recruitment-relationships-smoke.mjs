import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);

const recruitment = fs.readFileSync("module/recruitment.mjs","utf8");
for (const needle of [
  'QUICK_NPC_TEMPLATE_SPECS',
  'recruitmentRelationships: structuredRelationships',
  'structuredRelationshipFlag',
  'momProfession',
  'momLocation',
  'dadProfession',
  'dadLocation',
  'seniorArtisanProfession',
  'seniorArtisanLocation',
  'mentorRole',
  'mentorLocation',
  'enemyProfession',
  'data-rg-service-check',
  'data-rg-service-counter',
  'data-rg-service-counter-value',
  'Array.from({ length: s.service + 1 }'
]) assert.ok(recruitment.includes(needle), `Missing qa.32 Recruitment marker: ${needle}`);

assert.ok(!recruitment.includes("alive/dead"), "Structured Recruitment must not ask for alive/dead status.");
assert.ok(recruitment.includes('recruitmentVersion: "0.20.0"'));
assert.ok(!recruitment.includes('input type="number" data-rg-service-check'), "Service allocation must use dropdowns, not number inputs.");

const core = fs.readFileSync("module/core/m8-social-network.mjs","utf8");
for (const needle of [
  'recruitmentRelationships',
  'RECRUITMENT_STRUCTURED_RELATIONSHIP',
  'RECRUITMENT_STRUCTURED_RELATIONSHIPS',
  'STRUCTURED_HIGH'
]) assert.ok(core.includes(needle), `Missing qa.32 M8 marker: ${needle}`);

const css = fs.readFileSync("styles/qa28-quick-npc-library.css","utf8");
assert.ok(css.includes("rg-recruit-relationship-group"));
assert.ok(css.includes("rg-recruit-summary.is-complete"));
assert.ok(css.includes("rg-recruit-summary.is-over"));

console.log("PASS qa.32 Structured Recruitment Relationships + Service dropdown smoke");
