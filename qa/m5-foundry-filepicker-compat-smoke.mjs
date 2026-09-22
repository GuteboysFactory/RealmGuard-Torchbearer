import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.(?:[789]\.0(?:-qa\.\d+)?|10\.0(?:-qa\.\d+)?)$/, "QA smoke must accept supported legacy 1.7-1.9 lines and the v1.10.0 M9 QA/stable line.");
assert.equal(manifest.compatibility.minimum, "13");
assert.equal(manifest.compatibility.maximum, "14");
assert.equal(manifest.esmodules[0], "module/foundry-compat.mjs");
assert.ok(manifest.esmodules.includes("module/smart-select-scroll-hotfix.mjs"));
assert.ok(!manifest.esmodules.includes("module/recruitment-scroll-select.mjs"));
assert.ok(!manifest.styles.includes("styles/recruitment-scroll-select.css"));

const compat = fs.readFileSync("module/foundry-compat.mjs", "utf8");
assert.ok(compat.includes("foundry?.applications?.apps?.FilePicker"));
assert.ok(compat.includes("deprecatedGlobalReadRequired: false"));

const ux = fs.readFileSync("module/token-builder-ux-hotfix.mjs", "utf8");
assert.ok(ux.includes("modernFilePickerImplementation"));
assert.ok(ux.includes("foundry.applications.apps.FilePicker.implementation"));

const smartScroll = fs.readFileSync("module/smart-select-scroll-hotfix.mjs", "utf8");
assert.ok(smartScroll.includes(".rg-smart-select-menu"));
assert.ok(smartScroll.includes("overflow-y: auto !important"));
assert.ok(smartScroll.includes('window.addEventListener("scroll", protectSmartMenuScroll, true)'));
assert.ok(smartScroll.includes("stopImmediatePropagation"));

const contextHelp = fs.readFileSync("module/context-help.mjs", "utf8");
assert.ok(contextHelp.includes("rg-smart-select-menu"));
assert.ok(contextHelp.includes('window.addEventListener("scroll", () => closeSmartSelect(activeSmartSelect), true)'));

console.log("PASS m5-foundry-filepicker-compat-smoke");

const actorSheet = fs.readFileSync("sheets/actor-sheet.mjs", "utf8");
const tokenBuilder = fs.readFileSync("module/token-builder.mjs", "utf8");
assert.ok(actorSheet.includes("modernFilePickerImplementation"));
assert.ok(tokenBuilder.includes("modernFilePickerImplementation"));
assert.ok(!actorSheet.includes("globalThis.FilePicker"));
assert.ok(!tokenBuilder.includes("globalThis.FilePicker"));
