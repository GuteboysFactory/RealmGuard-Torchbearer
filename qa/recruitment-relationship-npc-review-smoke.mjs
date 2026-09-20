import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);

const recruitment = fs.readFileSync("module/recruitment.mjs","utf8");
for (const needle of [
  'openNpcTemplateLibrary',
  'buildM8RelationshipSheetView',
  'linkM8PersonActor',
  'async function reviewRecruitmentRelationshipNpcs',
  'Create All',
  'Choose NPCs',
  'Not Now',
  'folderName: "NPC - PC Relations"',
  'folderFlag: "relationshipNpcFolder"',
  'actorName: entry.name',
  'linkM8PersonActor(actor, entry.personId, createdActor.uuid)',
  'await reviewRecruitmentRelationshipNpcs(actor, state)'
]) assert.ok(recruitment.includes(needle), `Missing qa.31 recruitment marker: ${needle}`);

assert.ok(recruitment.includes('if (!game.user?.isGM) return;'), "Post-Recruitment NPC review must be GM-only.");
assert.ok(recruitment.includes('No NPC is created automatically'), "Review must state that NPC creation is explicit.");

const css = fs.readFileSync("styles/qa28-quick-npc-library.css","utf8");
assert.ok(css.includes("rg-recruit-npc-summary"));
assert.ok(css.includes("rg-recruit-npc-choice-list"));

console.log("PASS qa.31 Recruitment Relationship NPC Review smoke");
