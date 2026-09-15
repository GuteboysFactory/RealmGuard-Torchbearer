import assert from "node:assert/strict";
import {
  EQUIPMENT_SILHOUETTES,
  normalizeEquipmentAncestry,
  resolveEquipmentSilhouette
} from "../module/equipment-silhouette.mjs";

assert.equal(normalizeEquipmentAncestry("Dúnadan"), "dunadan");
assert.equal(normalizeEquipmentAncestry("Human"), "human");
assert.equal(normalizeEquipmentAncestry("Elf"), "elf");
assert.equal(normalizeEquipmentAncestry("Dwarf"), "dwarf");
assert.equal(normalizeEquipmentAncestry("Hobbit"), "halfling");
assert.equal(normalizeEquipmentAncestry("Halfling"), "halfling");
assert.equal(normalizeEquipmentAncestry("Unknown Folk"), "neutral");

for (const key of ["neutral", "dunadan", "human", "elf", "dwarf", "halfling"]) {
  assert.ok(EQUIPMENT_SILHOUETTES[key]);
  assert.match(EQUIPMENT_SILHOUETTES[key].src, new RegExp(`${key === "dunadan" ? "dunadan" : key}\\.svg$`));
}

assert.equal(resolveEquipmentSilhouette("Elf").src.endsWith("/elf.svg"), true);
assert.equal(resolveEquipmentSilhouette("Dwarf").src.endsWith("/dwarf.svg"), true);
assert.equal(resolveEquipmentSilhouette("Hobbit").src.endsWith("/halfling.svg"), true);
assert.equal(resolveEquipmentSilhouette("Bogkin").src.endsWith("/neutral.svg"), true);

console.log("PASS m5-equipment-figure-mode-smoke");
