import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.equal(manifest.version, "1.7.0-qa.9");
assert.ok(manifest.styles.includes("styles/m5-equipment-layout-final.css"));
assert.equal(String(manifest.compatibility?.minimum), "13");
assert.equal(String(manifest.compatibility?.maximum), "14");
assert.ok(manifest.esmodules.includes("module/foundry-compat.mjs"));

const css = fs.readFileSync("styles/m5-equipment-layout-final.css", "utf8");
assert.match(css, /grid-template-columns:\s*minmax\(220px,.72fr\)\s+minmax\(500px,1.75fr\)/);
assert.match(css, /\.rg-unassigned-panel\s*\{[\s\S]*?grid-column:1\s*!important;[\s\S]*?grid-row:2;/);
assert.match(css, /\.rg-equipment-panel\s*\{[\s\S]*?grid-column:2;[\s\S]*?grid-row:1 \/ span 2;/);
assert.match(css, /grid-template-areas:[\s\S]*?"copy copy settings"[\s\S]*?"source ancestry ancestry"[\s\S]*?"status status status"/);
assert.match(css, /@media \(max-width: 1120px\)/);

console.log("PASS m5-equipment-layout-smoke");
