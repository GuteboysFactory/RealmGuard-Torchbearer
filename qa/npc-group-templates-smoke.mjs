import assert from "node:assert/strict";
import fs from "node:fs";
import {
  QUICK_NPC_GROUP_LIBRARY_VERSION,
  QUICK_NPC_GROUP_TEMPLATE_SPECS,
  quickNpcGroupTemplateCount
} from "../module/quick-npc-library.mjs";

assert.equal(QUICK_NPC_GROUP_LIBRARY_VERSION, "1.0.0");
assert.ok(quickNpcGroupTemplateCount() >= 8, `Expected at least 8 NPC Group Templates, got ${quickNpcGroupTemplateCount()}`);
assert.equal(new Set(QUICK_NPC_GROUP_TEMPLATE_SPECS.map(entry => entry.id)).size, QUICK_NPC_GROUP_TEMPLATE_SPECS.length, "NPC Group Template IDs must be unique");

for (const spec of QUICK_NPC_GROUP_TEMPLATE_SPECS) {
  assert.ok(spec.id, "Group template requires id");
  assert.ok(spec.name, `${spec.id} requires name`);
  assert.ok(Array.isArray(spec.members) && spec.members.length > 0, `${spec.name} requires members`);
  for (const member of spec.members) {
    assert.ok(member.label, `${spec.name} member requires label`);
    assert.ok(member.query, `${spec.name} member ${member.label} requires Quick NPC query`);
    assert.ok(member.competence, `${spec.name} member ${member.label} requires competence`);
    assert.ok(Number.isInteger(member.count) && member.count > 0, `${spec.name} member ${member.label} requires positive integer count`);
  }
}

const builder = fs.readFileSync("module/npc-builder.mjs", "utf8");
for (const needle of [
  "export async function openNpcGroupTemplateLibrary",
  "async function createNpcGroupFolder",
  'name: "NPCs Groups"',
  'flagKey: "npcGroupsFolder"',
  "folderId: folder.id",
  'setFlag?.(NS, "quickNpcGroup"',
  "data-rg-open-group-templates",
  "data-rg-group-create",
  "Create Group",
  "Review Group",
  "if (!game.user?.isGM)"
]) assert.ok(builder.includes(needle), `Missing qa.35 NPC Group Template marker: ${needle}`);

assert.ok(builder.includes('folderName = "NPC"'), "Normal individual Quick NPC destination must remain intact.");
assert.ok(builder.includes('folderName = "NPC - PC Relations"') === false, "Relationship-specific destination remains owned by Recruitment/Relationship flow, not generic NPC Builder.");

const recruitment = fs.readFileSync("module/recruitment.mjs", "utf8");
assert.ok(recruitment.includes('folderName: "NPC - PC Relations"'), "Relationship NPCs must remain in NPC - PC Relations.");
assert.ok(recruitment.includes('folderFlag: "relationshipNpcFolder"'), "Relationship NPC folder flag must remain intact.");

const css = fs.readFileSync("styles/qa28-quick-npc-library.css", "utf8");
for (const needle of [
  "qa.35 — NPC Group Templates",
  "rg-npc-group-grid",
  "rg-npc-group-card",
  "rg-npc-group-review-row"
]) assert.ok(css.includes(needle), `Missing qa.35 group CSS marker: ${needle}`);

console.log(`PASS qa.35 NPC Group Templates smoke · ${quickNpcGroupTemplateCount()} group templates`);
