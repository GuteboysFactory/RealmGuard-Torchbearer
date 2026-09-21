import assert from "node:assert/strict";
import fs from "node:fs";
import {
  QUICK_NPC_TEMPLATE_SPECS,
  QUICK_NPC_GROUP_TEMPLATE_SPECS,
  QUICK_NPC_LIBRARY_VERSION,
  QUICK_NPC_GROUP_LIBRARY_VERSION
} from "../module/quick-npc-library.mjs";

assert.equal(QUICK_NPC_LIBRARY_VERSION, "2.1.0");
assert.equal(QUICK_NPC_GROUP_LIBRARY_VERSION, "1.1.0");

const breeDisplayTemplates = QUICK_NPC_TEMPLATE_SPECS.filter(entry => /\bBree\b/i.test(entry.name));
assert.equal(breeDisplayTemplates.length, 0, "No Quick NPC display names may contain Bree.");

const breeDisplayGroups = QUICK_NPC_GROUP_TEMPLATE_SPECS.filter(entry => /\bBree\b/i.test(entry.name));
assert.equal(breeDisplayGroups.length, 0, "No NPC Group display names may contain Bree.");

const genericCommon = QUICK_NPC_TEMPLATE_SPECS.filter(entry => entry.metadata.culture === "Common");
assert.ok(genericCommon.length > 0, "Generic Common templates must exist.");
assert.ok(genericCommon.every(entry => !/^Common\s/i.test(entry.name)), "Common templates must use role-first generic display names.");
assert.ok(genericCommon.every(entry => entry.metadata.portraitKey), "Every generic template must expose portraitKey metadata.");

assert.ok(QUICK_NPC_GROUP_TEMPLATE_SPECS.some(entry => entry.name === "Road Caravan"), "Road Caravan must replace Bree Road Caravan.");

const compendiums = fs.readFileSync("module/compendiums.mjs", "utf8");
for (const marker of [
  'const STARTER_VERSION = "0.26.0"',
  "npcTemplateIds",
  "refreshGeneratedNpcTemplatePresentation",
  "knownLegacyGeneratedName",
  "Preserve GM-renamed/edited starter entries"
]) assert.ok(compendiums.includes(marker), `Missing qa.36 migration marker: ${marker}`);

console.log(`PASS qa.36 generic NPC template naming · ${genericCommon.length} generic Common templates`);
