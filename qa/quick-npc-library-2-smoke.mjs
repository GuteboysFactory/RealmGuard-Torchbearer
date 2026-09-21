import assert from "node:assert/strict";
import fs from "node:fs";
import { QUICK_NPC_TEMPLATE_SPECS, quickNpcTemplateCount, scoreQuickNpcEntry } from "../module/quick-npc-library.mjs";
import { RG_DEFAULT_SKILLS } from "../module/default-skills.mjs";

assert.ok(quickNpcTemplateCount() >= 250, `Expected at least 250 Quick NPC templates, got ${quickNpcTemplateCount()}`);
assert.equal(new Set(QUICK_NPC_TEMPLATE_SPECS.map(entry => entry.metadata.templateId)).size, QUICK_NPC_TEMPLATE_SPECS.length, "Quick NPC template IDs must be unique");

const canonical = new Set(RG_DEFAULT_SKILLS);
for (const spec of QUICK_NPC_TEMPLATE_SPECS) {
  assert.ok(spec.metadata.category);
  assert.ok(spec.metadata.culture);
  assert.ok(spec.metadata.occupation);
  assert.ok(spec.metadata.competence);
  assert.ok(spec.metadata.searchText);
  for (const [skill] of spec.skills) assert.ok(canonical.has(skill), `${spec.name} uses non-canonical Skill ${skill}`);
}

const toIndex = spec => ({
  _id: spec.metadata.templateId,
  name: spec.name,
  system: { rank: spec.rank, concept: spec.concept },
  flags: { "realm-guard": { npcTemplate: spec.metadata } }
});
const entries = QUICK_NPC_TEMPLATE_SPECS.map(toIndex);

const top = query => entries
  .map(entry => ({ entry, score: scoreQuickNpcEntry(entry, query) }))
  .filter(hit => hit.score >= 0)
  .sort((a, b) => b.score - a.score)[0]?.entry;

assert.match(top("bartender")?.name ?? "", /Innkeeper/i, "bartender should find an Innkeeper");
assert.match(top("healer")?.name ?? "", /^Healer · /i, "generic healer should resolve without a location prefix");
assert.match(top("old ranger")?.name ?? "", /Ranger/i, "old ranger should find a Ranger template");
assert.match(top("big orc")?.name ?? "", /Orc.*Brute/i, "big orc should find Orc Brute");

const npcBuilder = fs.readFileSync("module/npc-builder.mjs", "utf8");
assert.ok(npcBuilder.includes("modernFilePickerImplementation"));
assert.ok(!npcBuilder.includes("globalThis.FilePicker"));
assert.ok(npcBuilder.includes("data-rg-npc-search"));
assert.ok(npcBuilder.includes("scoreQuickNpcEntry"));
assert.ok(npcBuilder.includes("dblclick"));

const compendiums = fs.readFileSync("module/compendiums.mjs", "utf8");
assert.ok(compendiums.includes('const STARTER_VERSION = "0.27.0"'));
assert.ok(compendiums.includes("QUICK_NPC_TEMPLATE_SPECS.map"));
assert.ok(compendiums.includes("npcTemplateIds"), "Starter sync must match NPC templates by stable templateId.");
assert.ok(compendiums.includes("refreshGeneratedNpcTemplatePresentation"), "Starter sync must safely refresh generated NPC template display names.");
assert.equal(QUICK_NPC_TEMPLATE_SPECS.filter(entry => /\\bBree\\b/i.test(entry.name)).length, 0, "No Quick NPC display name may contain Bree.");
assert.ok(QUICK_NPC_TEMPLATE_SPECS.filter(entry => entry.metadata.culture === "Common").every(entry => !/^Common\\s/i.test(entry.name)), "Generic common templates must not receive a Common display-name prefix.");

console.log(`PASS Quick NPC Library 2.0 smoke · ${quickNpcTemplateCount()} generated templates`);
