import assert from "node:assert/strict";
import {
  placeGearInZone,
  placeGearInContainer,
  getM5InventoryLiveHandoffStatus,
  getM5InventoryHandoffHistory,
  resetM5InventoryHandoffTelemetry,
  setM5InventoryCoreValidationEnabled
} from "../module/inventory.mjs";

function gear(id, name, inventory = {}, quantity = 1) {
  return {
    id,
    type: "gear",
    name,
    system: {
      quantity,
      inventory: {
        mode: "unassigned",
        location: "",
        containerId: "",
        slots: 1,
        bundle: 1,
        wieldHands: 0,
        containerType: "none",
        capacity: 0,
        ...inventory
      }
    },
    async update(changes) {
      for (const [path, value] of Object.entries(changes)) {
        const parts = path.split(".");
        let target = this;
        while (parts.length > 1) {
          const key = parts.shift();
          target[key] ??= {};
          target = target[key];
        }
        target[parts[0]] = value;
      }
      return this;
    }
  };
}

function actor(items) {
  const list = [...items];
  list.get = id => list.find(item => item.id === id) ?? null;
  return { id: "actor-qa", name: "QA Ranger", items: list };
}

const sword = gear("sword", "Sword", { wieldHands: 1 });
const cloak = gear("cloak", "Ranger Cloak");
const stone = gear("stone", "Heavy Stone", { slots: 2 });
const pack = gear("pack", "Backpack", { mode: "worn", location: "torso", containerType: "backpack", slots: 2 });
const rope = gear("rope", "Rope", { slots: 2 });
const testActor = actor([sword, cloak, stone, pack, rope]);

resetM5InventoryHandoffTelemetry();
setM5InventoryCoreValidationEnabled(true);
resetM5InventoryHandoffTelemetry();

let status = getM5InventoryLiveHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.validationAuthority, "CORE_M5");
assert.equal(status.writerAuthority, "LEGACY_MIXED");
assert.equal(status.autoRollbackOnDisagreement, true);

let result = await placeGearInZone(testActor, "sword", "right-hand");
assert.equal(result.ok, true);
assert.equal(result.m5.validationAuthority, "CORE_M5");
assert.equal(result.m5.writerAuthority, "LEGACY_MIXED");
assert.equal(sword.system.inventory.mode, "hand");
assert.equal(sword.system.inventory.location, "right-hand");

result = await placeGearInZone(testActor, "stone", "cloak");
assert.equal(result.ok, false);
assert.equal(result.m5.validationAuthority, "CORE_M5");
assert.match(result.reason, /Cloak slot/);
assert.equal(stone.system.inventory.mode, "unassigned");

result = await placeGearInContainer(testActor, "rope", "pack");
assert.equal(result.ok, true);
assert.equal(result.m5.validationAuthority, "CORE_M5");
assert.equal(rope.system.inventory.containerId, "pack");

status = getM5InventoryLiveHandoffStatus();
assert.equal(status.telemetry.coreDecisions, 3);
assert.equal(status.telemetry.coreAccepted, 2);
assert.equal(status.telemetry.coreRejected, 1);
assert.equal(status.telemetry.disagreements, 0);
assert.equal(status.telemetry.errorFallbacks, 0);
assert.equal(getM5InventoryHandoffHistory().length, 3);

setM5InventoryCoreValidationEnabled(false, { reason: "SMOKE_ROLLBACK" });
result = await placeGearInZone(testActor, "cloak", "cloak");
assert.equal(result.ok, true);
assert.equal(result.m5.validationAuthority, "LEGACY_MIXED");
assert.equal(result.m5.rollback, true);
assert.equal(cloak.system.inventory.location, "cloak");
status = getM5InventoryLiveHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "SMOKE_ROLLBACK");
assert.equal(status.telemetry.rollbackDecisions, 1);

setM5InventoryCoreValidationEnabled(true);
console.log("PASS m5-inventory-live-handoff-smoke");