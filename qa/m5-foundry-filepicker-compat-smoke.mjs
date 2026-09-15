import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.equal(manifest.version, "1.7.0-qa.18");
assert.equal(manifest.compatibility.minimum, "13");
assert.equal(manifest.compatibility.maximum, "14");
assert.ok(manifest.esmodules[0] === "module/foundry-compat.mjs");
assert.ok(manifest.esmodules.includes("module/recruitment-scroll-select.mjs"));
assert.ok(manifest.styles.includes("styles/recruitment-scroll-select.css"));

const compat = fs.readFileSync("module/foundry-compat.mjs", "utf8");
assert.match(compat, /foundry\?\.applications\?\.apps\?\.FilePicker/);
assert.match(compat, /Hooks\?\.once\?\.\("init"/);
assert.match(compat, /Hooks\?\.once\?\.\("ready"/);
assert.match(compat, /deprecatedGlobalReadRequired:\s*false/);
assert.doesNotMatch(compat, /globalThis\.FilePicker\s*\?\?/);

const ux = fs.readFileSync("module/token-builder-ux-hotfix.mjs", "utf8");
assert.match(ux, /modernFilePickerImplementation/);
assert.doesNotMatch(ux, /globalThis\.FilePicker\s*\?\?/);
assert.match(ux, /filePickerApi:\s*"foundry\.applications\.apps\.FilePicker\.implementation"/);

const recruitmentUx = fs.readFileSync("module/recruitment-scroll-select.mjs", "utf8");
assert.match(recruitmentUx, /MIN_OPTIONS = 9/);
assert.match(recruitmentUx, /rg-recruit-progress/);
assert.match(recruitmentUx, /querySelectorAll\?\.\("select"\)/);
assert.match(recruitmentUx, /STYLE_ID = "rg-recruitment-scroll-select-styles"/);
assert.match(recruitmentUx, /overflow-y:auto!important/);
assert.match(recruitmentUx, /scrollIntoView/);
assert.match(recruitmentUx, /window\.addEventListener\("wheel", handleMenuWheel, \{ capture: true, passive: false \}\)/);
assert.match(recruitmentUx, /PageDown/);

console.log("PASS m5-foundry-filepicker-compat-smoke");
