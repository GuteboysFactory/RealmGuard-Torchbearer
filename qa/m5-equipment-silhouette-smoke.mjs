import assert from "node:assert/strict";
import { normalizeEquipmentAncestry, resolveEquipmentSilhouette, equipmentFigureStatus } from "../module/equipment-silhouette.mjs";

assert.equal(normalizeEquipmentAncestry("Dúnadan"), "dunadan");
assert.equal(normalizeEquipmentAncestry("Dunedain"), "dunadan");
assert.equal(normalizeEquipmentAncestry("Númenórean"), "dunadan");
assert.equal(normalizeEquipmentAncestry("Human"), "human");
assert.equal(normalizeEquipmentAncestry("Dwarf"), "dwarf");
assert.equal(normalizeEquipmentAncestry("Dwarven"), "dwarf");
assert.equal(normalizeEquipmentAncestry("Elf"), "elf");
assert.equal(normalizeEquipmentAncestry("Eldar"), "elf");
assert.equal(normalizeEquipmentAncestry("Hobbit"), "halfling");
assert.equal(normalizeEquipmentAncestry("Halfling"), "halfling");
assert.equal(normalizeEquipmentAncestry("House of Ruor"), "neutral");
assert.equal(normalizeEquipmentAncestry("Bogkin"), "neutral");
assert.equal(normalizeEquipmentAncestry(""), "neutral");

const expected = new Map([
  ["Dúnadan", "dunadan.svg"],
  ["Human", "human.svg"],
  ["Dwarf", "dwarf.svg"],
  ["Elf", "elf.svg"],
  ["Halfling", "halfling.svg"],
  ["Hobbit", "halfling.svg"]
]);
for (const [ancestry, file] of expected) {
  const resolved = resolveEquipmentSilhouette(ancestry);
  assert.equal(resolved.fallback, false);
  assert.ok(resolved.src.endsWith(`/${file}`));
}

let resolved = resolveEquipmentSilhouette("Bogkin");
assert.equal(resolved.key, "neutral");
assert.equal(resolved.fallback, true);
assert.match(resolved.src, /neutral\.svg$/);

resolved = resolveEquipmentSilhouette("");
assert.equal(resolved.key, "neutral");
assert.equal(resolved.fallback, false);
assert.match(resolved.src, /neutral\.svg$/);

const status = equipmentFigureStatus();
assert.equal(status.paperFiguresAllowed, false);
assert.equal(status.inventoryRulesChanged, false);
assert.equal(status.defaultMode, "custom");
assert.deepEqual(status.modes, ["custom", "ancestry"]);
assert.equal(status.characterArtModeRemoved, true);
assert.equal(status.automaticAncestrySelection, true);

console.log("PASS m5-equipment-silhouette-smoke");
