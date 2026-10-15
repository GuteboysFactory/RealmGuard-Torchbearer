import assert from "node:assert/strict";
import fs from "node:fs";
import { buildWorldInventoryReport } from "../module/world-inventory-report.mjs";
import { buildSourceInventory } from "./generate-source-inventory.mjs";

const makeDoc = (data) => ({ id: data._id, toObject: () => structuredClone(data) });
const gm = { id: "gm-1", name: "Test GM", isGM: true };
const fakePack = {
  collection: "world.realm-guard-gear",
  metadata: { label: "Realm Guard Gear", package: "world", packageType: "world" },
  documentName: "Item",
  locked: false,
  async getDocuments() { return [makeDoc({ _id: "pack-gear-1", name: "Backpack", type: "gear", system: { capacity: 6 } })]; }
};
const runtime = {
  user: gm,
  users: { contents: [gm, { id: "player-1", name: "Player", role: 1, active: true, isGM: false }] },
  version: "13.351",
  world: { id: "qa-world", title: "QA World", system: "realm-guard", coreVersion: "13.351" },
  system: { id: "realm-guard", title: "Realm Guard / Torchbearer", version: JSON.parse(fs.readFileSync(new URL("../system.json", import.meta.url), "utf8")).version },
  modules: { contents: [{ id: "adventurers-tome", title: "Adventurer's Tome", version: "1.0.0", active: true, manifest: { id: "adventurers-tome", version: "1.0.0" } }] },
  actors: { contents: [makeDoc({ _id: "actor-1", name: "Existing Test Adventurer", type: "character", items: [{ name: "Sword", type: "gear" }] })] },
  items: { contents: [makeDoc({ _id: "item-1", name: "Backpack", type: "gear" })] },
  scenes: { contents: [] }, journal: { contents: [] }, tables: { contents: [] },
  playlists: { contents: [] }, cards: { contents: [] }, combats: { contents: [] },
  messages: { contents: [makeDoc({ _id: "message-1", content: "QA note" })] },
  macros: { contents: [] }, folders: { contents: [] },
  packs: { contents: [fakePack] },
  settings: { settings: new Map([["module.apiToken", { scope: "world", type: String, config: false, name: "API token", value: "SHOULD_NEVER_APPEAR" }]]) },
  realmGuard: { core: { m10d: { getStatus: () => ({ phase: "M10D.20", liveReady: false }), inventory: { getStatus: () => ({ phase: "M10D.10", liveApplication: false }) } } } }
};

const sourceIndex = buildSourceInventory();
const report = await buildWorldInventoryReport(runtime, { sourceInventory: sourceIndex });
assert.equal(report.report.readOnly, true);
assert.equal(report.report.automaticUpload, false);
assert.deepEqual(report.report.writes, { actors: 0, items: 0, scenes: 0, journals: 0, settings: 0, chatMessages: 0, compendiums: 0 });
assert.equal(report.environment.foundry.modules[0].active, true);
assert.equal(report.environment.foundry.registeredSettings[0].key, "apiToken");
assert.equal(report.environment.rules.m10dDomains.inventory.phase, "M10D.10");
assert.equal(report.worldCollections.actors.count, 1);
assert.equal(report.sourceInventory.status, "available");
assert.equal(report.sourceInventory.inventory.summary.codeFileCount, sourceIndex.summary.codeFileCount);
assert.ok(report.environment.rules.registeredRuleProfiles.length >= 5);
assert.ok(report.environment.rules.registeredRuleProfiles.some(profile => profile.id === "torchbearer2e"));
assert.equal(report.summary.sourceInventoryStatus, "available");
assert.equal(report.worldCollections.actors.documents[0].name, "Existing Test Adventurer");
assert.equal(report.worldCollections.messages.count, 1);
assert.equal(report.compendiums.packs[0].documents[0].name, "Backpack");
assert.equal(report.summary.compiled, undefined);
assert.equal(JSON.stringify(report).includes("SHOULD_NEVER_APPEAR"), false);
await assert.rejects(() => buildWorldInventoryReport({ ...runtime, user: { isGM: false } }), /restricted to an active GM/);

const source = fs.readFileSync(new URL("../module/world-inventory-report.mjs", import.meta.url), "utf8");
for (const forbidden of ["game.settings.set(", ".update(", ".createDocuments(", ".deleteDocuments(", "Actor.create(", "Item.create(", "new Blob(", "URL.createObjectURL("]) {
  assert.equal(source.includes(forbidden), false, `report source must not contain write/download API ${forbidden}`);
}
assert.ok(source.includes("saveDataToFile"), "report should use Foundry native file-save utility");
assert.match(source, /Copy JSON/);
console.log("PASS QA24 read-only Foundry, source and profile inventory · Foundry-native save · copy fallback · zero writes");
