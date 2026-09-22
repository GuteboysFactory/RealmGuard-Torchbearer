import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.(?:[789]\.0(?:-qa\.\d+)?|10\.0-qa\.\d+)$/, "QA smoke must accept supported legacy 1.7-1.9 lines and the v1.10.0 M9 QA line.");

const builder = fs.readFileSync("module/npc-builder.mjs","utf8");
for (const needle of [
  'actorName = ""',
  'folderName = "NPC"',
  'folderFlag = "npcTemplateFolder"',
  'onCreated = null',
  'closeAfterCreate = false',
  'typeof onCreated === "function"',
  'await dialog.close()'
]) assert.ok(builder.includes(needle), `Missing contextual Quick NPC marker: ${needle}`);

const sheet = fs.readFileSync("sheets/actor-sheet.mjs","utf8");
for (const needle of [
  'openNpcTemplateLibrary',
  'createRelationshipNpc: RealmGuardActorSheet._createRelationshipNpc',
  'static async _createRelationshipNpc',
  'folderName: "NPC - PC Relations"',
  'folderFlag: "relationshipNpcFolder"',
  'actorName: person.name',
  'linkM8PersonActor(rangerActor, personId, createdActor.uuid)',
  'relationshipQuickNpcQuery'
]) assert.ok(sheet.includes(needle), `Missing Relationship Quick NPC marker: ${needle}`);

const template = fs.readFileSync("templates/actor/character.hbs","utf8");
assert.ok(template.includes('data-action="createRelationshipNpc"'));
assert.ok(template.includes('> Create NPC</button>'));
assert.ok(template.includes('data-action="linkRelationshipActor"'));

console.log("PASS qa.30 Relationship -> Quick NPC smoke");
