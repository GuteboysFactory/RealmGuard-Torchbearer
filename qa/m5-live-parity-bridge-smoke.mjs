import assert from "node:assert/strict";
import { createM5Services } from "../module/core/m5-services.mjs";
import {
  M5ParityBridge,
  compareInventoryValidation,
  compareConflictToolEffects
} from "../module/m5-parity-bridge.mjs";

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
    flags: {}
  };
}

function actor(items, flags = {}) {
  const list = [...items];
  list.get = id => list.find(item => item.id === id) ?? null;
  const result = {
    id: "ranger-1",
    name: "Parity Ranger",
    items: list,
    flags: { "realm-guard": flags },
    getFlag(namespace, key) { return this.flags?.[namespace]?.[key]; }
  };
  for (const item of list) item.parent = result;
  return result;
}

const profile = { id: "realm-guard-legacy-mixed", domains: { inventory: { policy: "STRUCTURED" } } };
const services = createM5Services(profile);

const sword = gear("sword", "Sword", { mode: "hand", location: "right-hand", wieldHands: 1 });
const dagger = gear("dagger", "Knife", { wieldHands: 1 });
const cloak = gear("cloak", "Ranger Cloak");
const rock = gear("rock", "Heavy Rock", { slots: 2 });
const backpack = gear("pack", "Backpack", { mode: "worn", location: "torso", containerType: "backpack", slots: 2 });
const rope = gear("rope", "Rope", { slots: 2 });
const ranger = actor([sword, dagger, cloak, rock, backpack, rope], {
  conflictTools: [{
    id: "evidence",
    name: "Evidence",
    conflictTypes: ["argument"],
    effects: [
      { kind: "dice", value: 1, actions: ["maneuver"] },
      { kind: "success", value: 1, actions: ["maneuver"], conditional: "successful-test" }
    ],
    requirement: "Evidence must be credible"
  }]
});

const log = { warnings: [], warn(...args) { this.warnings.push(args); } };
const bridge = new M5ParityBridge({ services, actorResolver: id => id === ranger.id ? ranger : null, logger: log });

let comparison = compareInventoryValidation({ legacyAccepted: true, coreValidation: { ok: true, policy: "STRUCTURED" } });
assert.equal(comparison.parity, "MATCH");
comparison = compareInventoryValidation({ legacyAccepted: true, coreValidation: { ok: false, reason: "blocked", policy: "STRUCTURED" } });
assert.equal(comparison.parity, "MISMATCH");

let event = bridge.probeZone(ranger, cloak, "cloak", { legacyAccepted: true });
assert.equal(event.parity, "MATCH");
event = bridge.probeZone(ranger, rock, "cloak", { legacyAccepted: true });
assert.equal(event.parity, "MISMATCH");
assert.equal(event.coreAccepted, false);

event = bridge.probeContainer(ranger, rope, backpack, { legacyAccepted: true });
assert.equal(event.parity, "MATCH");

comparison = compareConflictToolEffects({
  legacy: { dice: 1, conditionalSuccess: 1, successPenalty: 0 },
  core: { dice: 1, conditionalSuccess: 1, successPenalty: 0 }
});
assert.equal(comparison.parity, "MATCH");
comparison = compareConflictToolEffects({ legacy: { dice: 0 }, core: { dice: 1 } });
assert.equal(comparison.parity, "MISMATCH");

event = bridge.probeConflict(ranger, {
  toolId: "tool:evidence",
  action: "maneuver",
  conflictType: "argument",
  requirementMet: true
}, { dice: 1, conditionalSuccess: 1, successPenalty: 0 });
assert.equal(event.parity, "MATCH");

event = bridge.probeConflict(ranger, {
  toolId: "",
  action: "attack",
  conflictType: "fight"
}, { dice: -1, conditionalSuccess: 0, successPenalty: 0 });
assert.equal(event.parity, "MATCH", "Legacy Mixed unarmed -1D remains parity-compatible while CORE takeover stays off");

const observedZone = bridge.observeInventoryWrite(dagger, {
  "system.inventory.mode": "hand",
  "system.inventory.location": "left-hand",
  "system.inventory.containerId": ""
}, { source: "SMOKE_LIVE_WRITE" });
assert.equal(observedZone.parity, "MATCH");
assert.equal(observedZone.source, "SMOKE_LIVE_WRITE");

const observedContainer = bridge.observeInventoryWrite(rope, {
  "system.inventory.mode": "pack",
  "system.inventory.location": "",
  "system.inventory.containerId": "pack"
}, { source: "SMOKE_LIVE_WRITE" });
assert.equal(observedContainer.parity, "MATCH", "pre-update container validation must use the item's current placement for capacity accounting");

const conflictState = {
  id: "conflict-1",
  active: true,
  type: "argument",
  stage: "action",
  exchange: 1,
  currentIndex: 0,
  gm: { actorId: "opposition" },
  ranger: { participantIds: [ranger.id] },
  revealed: [{
    index: 0,
    gmAction: "attack",
    rangerAction: "maneuver",
    rangerActorId: ranger.id,
    gmWeaponId: "",
    rangerWeaponId: "tool:evidence"
  }],
  effects: {
    gm: { disabledGearIds: [], swordActions: {} },
    ranger: { disabledGearIds: [], swordActions: {} }
  },
  rolls: {
    gm: null,
    ranger: {
      actorId: ranger.id,
      faces: [4, 5, 2],
      gearDice: 1,
      conditionalSuccess: 1,
      successPenalty: 0,
      gearNotes: ["Evidence +1D · +1s"]
    }
  }
};

let observed = bridge.observeConflictState(conflictState);
assert.equal(observed.length, 1);
assert.equal(observed[0].parity, "MATCH");
observed = bridge.observeConflictState(conflictState);
assert.equal(observed.length, 0, "identical live conflict state must not be double-counted");

const mismatchState = structuredClone(conflictState);
mismatchState.rolls.ranger.faces = [6, 4, 1];
mismatchState.rolls.ranger.gearDice = 0;
observed = bridge.observeConflictState(mismatchState);
assert.equal(observed.length, 1);
assert.equal(observed[0].parity, "MISMATCH");

const report = bridge.report();
assert.equal(report.phase, "M5");
assert.equal(report.mode, "SHADOW_PARITY");
assert.equal(report.authority, "LEGACY_MIXED");
assert.equal(report.liveApplication, false);
assert.ok(report.summary.matches >= 6);
assert.ok(report.summary.mismatches >= 2);
assert.ok(report.summary.inventory.total >= 5);
assert.ok(report.summary.conflictTools.total >= 4);
assert.ok(log.warnings.length >= 2, "mismatches should be visible to QA without blocking the live flow");

const cleared = bridge.clear();
assert.equal(cleared.summary.total, 0);

console.log("PASS m5-live-parity-bridge-smoke");
