import assert from "node:assert/strict";
import fs from "node:fs";
const css = fs.readFileSync("styles/realm-guard.css", "utf8");
assert.match(css, /\.rg-conflict-window\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*99;/);
assert.ok(!/\.rg-conflict-window\s*\{[\s\S]*?z-index:\s*120;/.test(css));
console.log("PASS conflict-window-stacking-smoke · Conflict below Foundry application stack");
