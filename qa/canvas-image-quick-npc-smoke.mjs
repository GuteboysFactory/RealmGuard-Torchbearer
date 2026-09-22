import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.(?:[789]\.0(?:-qa\.\d+)?|1[01]\.0(?:-qa\.\d+)?)$/, "QA smoke must accept supported legacy 1.7-1.9 lines and the v1.10-v1.11 CORE QA/stable lines.");

const builder = fs.readFileSync("module/npc-builder.mjs","utf8");
for (const needle of [
  "canvasDropPoint",
  "placeNpcToken",
  "canvas.canvasCoordinatesFromClient",
  "actor.getTokenDocument",
  'scene.createEmbeddedDocuments("Token"',
  "openNpcTemplateLibrary({ imageFile: file, canvasDrop: drop })",
  'Hooks.on("canvasReady"',
  'Hooks.on("canvasTearDown"',
  "Create NPC from dropped image"
]) assert.ok(builder.includes(needle), `Missing qa.29 builder marker: ${needle}`);

assert.ok(!builder.includes("globalThis.FilePicker"), "NPC Builder must stay on modern FilePicker");
assert.ok(builder.includes("openSheet: false"), "Canvas quick spawn should not force-open the Actor sheet");

const css = fs.readFileSync("styles/qa28-quick-npc-library.css","utf8");
assert.ok(css.includes("rg-quick-npc-canvas-image-drop"));
assert.ok(css.includes("rg-quick-npc-canvas-preview"));

console.log("PASS qa.29 Canvas Image -> Quick NPC smoke");
