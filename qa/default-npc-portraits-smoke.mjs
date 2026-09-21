import assert from "node:assert/strict";
import fs from "node:fs";
import {
  QUICK_NPC_TEMPLATE_SPECS,
  QUICK_NPC_LIBRARY_VERSION
} from "../module/quick-npc-library.mjs";

assert.equal(QUICK_NPC_LIBRARY_VERSION, "2.2.0");

const root = "systems/realm-guard/assets/actors/default-npcs/";
assert.ok(QUICK_NPC_TEMPLATE_SPECS.length >= 250, "Quick NPC template library unexpectedly small.");

for (const spec of QUICK_NPC_TEMPLATE_SPECS) {
  assert.ok(spec.img?.startsWith(root), `${spec.name} is missing a packaged default portrait path.`);
  assert.equal(spec.metadata?.portraitPath, spec.img, `${spec.name} metadata portraitPath must match template img.`);
  const repoPath = spec.img.replace("systems/realm-guard/", "");
  assert.ok(fs.existsSync(repoPath), `Missing packaged portrait asset: ${repoPath}`);
}

const compendiums = fs.readFileSync("module/compendiums.mjs", "utf8");
for (const needle of [
  'const STARTER_VERSION = "0.27.0"',
  "img: spec.img",
  "prototypeToken.texture.src",
  "Preserve any GM-selected custom image"
]) assert.ok(compendiums.includes(needle), `Missing qa.42 compendium marker: ${needle}`);

const files = fs.readdirSync("assets/actors/default-npcs").filter(name => name.endsWith(".webp"));
assert.equal(files.length, 63, `Expected 63 optimized default NPC portraits, got ${files.length}.`);

console.log(`PASS qa.42 default NPC portraits · ${QUICK_NPC_TEMPLATE_SPECS.length} templates · ${files.length} packaged portraits`);
