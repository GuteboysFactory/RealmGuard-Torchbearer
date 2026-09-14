import assert from "node:assert/strict";
import { normalizeEquipmentAncestry, resolveEquipmentSilhouette } from "../module/equipment-silhouette.mjs";

assert.equal(normalizeEquipmentAncestry("Dúnadan"), "human");
assert.equal(normalizeEquipmentAncestry("Dunedain"), "human");
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

let resolved = resolveEquipmentSilhouette("Dúnadan");
assert.equal(resolved.key, "human");
assert.equal(resolved.fallback, false);
assert.match(resolved.src, /human\.svg$/);

resolved = resolveEquipmentSilhouette("Bogkin");
assert.equal(resolved.key, "neutral");
assert.equal(resolved.fallback, true);
assert.match(resolved.src, /neutral\.svg$/);

resolved = resolveEquipmentSilhouette("");
assert.equal(resolved.key, "neutral");
assert.equal(resolved.fallback, false);

console.log("PASS m5-equipment-silhouette-smoke");
