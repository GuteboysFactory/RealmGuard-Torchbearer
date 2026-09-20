import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);

const builder = fs.readFileSync("module/npc-builder.mjs","utf8");
for (const needle of [
  'export async function quickNpcTemplateMatches',
  'export async function resolveBestQuickNpcTemplate',
  'selectOnly = false',
  'onTemplateSelected = null'
]) assert.ok(builder.includes(needle), `Missing qa.31 smart Quick NPC marker: ${needle}`);

const recruitment = fs.readFileSync("module/recruitment.mjs","utf8");
for (const needle of [
  'createNpcFromTemplate',
  'resolveBestQuickNpcTemplate',
  'buildM8RelationshipSheetView',
  'linkM8PersonActor',
  'async function reviewRecruitmentRelationshipNpcs',
  'async function resolveRecruitmentNpcSuggestions',
  'recruitmentPreferredCompetence',
  'Suggested template',
  'Change Template',
  'Create All',
  'Choose NPCs',
  'Not Now',
  'Create Selected',
  'folderName: "NPC - PC Relations"',
  'folderFlag: "relationshipNpcFolder"',
  'actorName: entry.name',
  'linkM8PersonActor(ownerActor, entry.personId, createdActor.uuid)',
  'await reviewRecruitmentRelationshipNpcs(actor, state)'
]) assert.ok(recruitment.includes(needle), `Missing qa.31 recruitment marker: ${needle}`);

assert.ok(recruitment.includes('if (!game.user?.isGM) return;'), "Post-Recruitment NPC review must be GM-only.");
assert.ok(recruitment.includes('Template selection is automatic by default'), "Review must make automatic template resolution explicit.");
assert.ok(!recruitment.includes('Quick NPC Library opens for each selected person and the GM chooses the template.'), "Old manual-per-NPC flow must be removed.");

const css = fs.readFileSync("styles/qa28-quick-npc-library.css","utf8");
assert.ok(css.includes("rg-recruit-npc-smart-list"));
assert.ok(css.includes("rg-recruit-npc-smart-row"));

console.log("PASS qa.31 Smart Recruitment Relationship NPC Review smoke");
