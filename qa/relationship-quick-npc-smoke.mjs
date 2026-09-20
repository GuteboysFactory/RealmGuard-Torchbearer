import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);

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
