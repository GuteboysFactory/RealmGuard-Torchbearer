import assert from "node:assert/strict";
import { createM5Services } from "../module/core/m5-services.mjs";
import { M5ParityBridge } from "../module/m5-parity-bridge.mjs";
import "../module/m5-parity-deepening.mjs";

function gear(id, name, inventory = {}) {
  return {
    id,
    type: "gear",
    name,
    system: {
      quantity: 1,
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

function actor(id, items, flags = {}) {
  const list = [...items];
  list.get = itemId => list.find(item => item.id === itemId) ?? null;
  const result = {
    id,
    name: id,
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
const cloak = gear("cloak", "Ranger Cloak");
const rock = gear("rock", "Heavy Rock", { slots: 2 });
const ranger = actor("ranger", [sword, cloak, rock]);
const opposition = actor("opposition", [gear("shield", "Shield", { mode: "hand", location: "left-hand", wieldHands: 1 })]);
const actors = new Map([[ranger.id, ranger], [opposition.id, opposition]]);
const log = { warnings: [], warn(...args) { this.warnings.push(args); } };
const bridge = new M5ParityBridge({ services, actorResolver: id => actors.get(id) ?? null, logger: log });

let event = bridge.observeLegacyInventoryDecision({ actor: ranger, itemId: "rock", operation: "PLACE_ZONE", target: "cloak", accepted: false });
assert.equal(event.parity, "MATCH", "Legacy reject must match CORE reject");
assert.equal(event.legacyAccepted, false);
assert.equal(event.coreAccepted, false);

event = bridge.observeLegacyInventoryDecision({ actor: ranger, itemId: "cloak", operation: "PLACE_ZONE", target: "cloak", accepted: false });
assert.equal(event.parity, "MISMATCH", "A deliberate false Legacy reject against a legal CORE placement must surface");

const state = {
  id: "conflict-deep",
  active: true,
  type: "fight",
  stage: "action",
  exchange: 1,
  currentIndex: 0,
  gm: { actorId: opposition.id },
  ranger: { participantIds: [ranger.id] },
  revealed: [{
    index: 0,
    gmAction: "defend",
    rangerAction: "attack",
    rangerActorId: ranger.id,
    gmWeaponId: "gear:shield",
    rangerWeaponId: "gear:sword"
  }],
  effects: {
    gm: { disabledGearIds: ["shield"], swordActions: {} },
    ranger: { disabledGearIds: [], swordActions: {} }
  },
  rolls: { gm: null, ranger: null }
};

const providerEvents = bridge.observeConflictProviderState(state);
assert.equal(providerEvents.length, 3);
assert.equal(providerEvents.filter(row => row.operation === "DECLARED_TOOL_PROVIDER").length, 2);
assert.equal(providerEvents.filter(row => row.operation === "DISABLE_STATE").length, 1);
assert.ok(providerEvents.every(row => row.parity === "MATCH"));
assert.equal(bridge.observeConflictProviderState(state).length, 0, "provider observations must be deduplicated");

const report = bridge.report();
assert.ok(report.summary.inventory.total >= 2);
assert.ok(report.summary.conflictTools.total >= 3);
assert.ok(report.summary.matches >= 4);
assert.ok(report.summary.mismatches >= 1);
assert.ok(log.warnings.length >= 1);

bridge.clear();
assert.equal(bridge.report().summary.total, 0);
assert.equal(bridge.observeConflictProviderState(state).length, 3, "clear must reset deep provider signatures");

console.log("PASS m5-deep-live-parity-smoke");
