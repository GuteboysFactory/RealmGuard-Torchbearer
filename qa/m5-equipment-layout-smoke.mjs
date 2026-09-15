import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.equal(manifest.version, "1.7.0-qa.8");
assert.ok(manifest.styles.includes("styles/m5-equipment-layout-final.css"));

const css = fs.readFileSync("styles/m5-equipment-layout-final.css", "utf8");
assert.match(css, /grid-template-columns:\s*minmax\(220px,.72fr\)\s+minmax\(500px,1.75fr\)/);
assert.match(css, /\.rg-unassigned-panel\s*\{[\s\S]*?grid-column:1\s*!important;[\s\S]*?grid-row:2;/);
assert.match(css, /\.rg-equipment-panel\s*\{[\s\S]*?grid-column:2;[\s\S]*?grid-row:1 \/ span 2;/);

console.log("PASS m5-equipment-layout-smoke");
