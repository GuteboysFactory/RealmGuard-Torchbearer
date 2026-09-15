import assert from "node:assert/strict";
import {
  INVENTORY_MODES,
  InventoryPolicy,
  GearService,
  ContainerService,
  PlacementValidator,
  ConflictToolEffectProvider,
  ConflictToolService,
  createM5Services
} from "../module/core/m5-services.mjs";

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

function trait(id, name) {
  return { id, type: "trait", name, system: {}, flags: {} };
}

function actor(items, flags = {}) {
  const list = [...items];
  list.get = id => list.find(item => item.id === id) ?? null;
  return {
    id: "actor-1",
    name: "QA Ranger",
    items: list,
    flags: { "realm-guard": flags },
    getFlag(namespace, key) { return this.flags?.[namespace]?.[key]; }
  };
}

const structuredProfile = { id: "realm-guard-legacy-mixed", domains: { inventory: { policy: "STRUCTURED" } } };
const looseProfile = { id: "realm-guard-strict-preview", domains: { inventory: { policy: "LOOSE" } } };

const policy = InventoryPolicy.fromProfile(structuredProfile);
assert.equal(policy.mode, INVENTORY_MODES.STRUCTURED);
assert.equal(policy.zone("right-hand")?.capacity, 1);
assert.equal(InventoryPolicy.fromProfile(looseProfile).mode, INVENTORY_MODES.LOOSE);

const staff = gear("staff", "Staff", { mode: "hand", location: "right-hand", wieldHands: 2 });
const dagger = gear("dagger", "Knife", { wieldHands: 1 });
const cloak = gear("cloak", "Ranger Cloak");
const stone = gear("stone", "Stone", { slots: 2 });
const backpack = gear("pack", "Backpack", { mode: "worn", location: "torso", containerType: "backpack", slots: 2 });
const rope = gear("rope", "Rope", { mode: "stored", containerId: "pack", slots: 2 });
const rations = gear("rations", "Rations", { slots: 3 });
const brave = trait("trait-1", "Brave");
const testActor = actor([staff, dagger, cloak, stone, backpack, rope, rations, brave], {
  conflictTools: [
    {
      id: "evidence",
      name: "Evidence",
      conflictTypes: ["argument"],
      effects: [
        { kind: "dice", value: 1, actions: ["attack", "maneuver"] },
        { kind: "success", value: 1, actions: ["maneuver"], conditional: "successful-test" }
      ],
      requirement: "Evidence must be credible"
    }
  ],
  naturalConflictTools: [
    {
      id: "claws",
      name: "Claws",
      conflictTypes: ["fight", "fightCreature"],
      effect: "dice",
      value: 1,
      action: "attack"
    }
  ]
});

const gearService = new GearService();
const containers = new ContainerService(gearService);
const placement = new PlacementValidator({ policy, gear: gearService, containers });

assert.equal(gearService.list(testActor).length, 7);
assert.equal(gearService.slotCost(rope), 2);
assert.equal(gearService.slotCost(staff, { forZone: "right-hand" }), 1);
assert.equal(gearService.state(staff).equipped, true);
assert.equal(gearService.state(rope).stored, true);

assert.equal(containers.capacity(backpack), 6);
assert.equal(containers.isActive(backpack), true);
assert.equal(containers.usage(testActor, backpack).used, 2);
assert.equal(containers.usage(testActor, backpack).remaining, 4);

assert.equal(placement.validateZone(testActor, dagger, "left-hand").ok, false, "other hand is locked by the 2H staff");
assert.equal(placement.validateZone(testActor, cloak, "cloak").ok, true);
assert.equal(placement.validateZone(testActor, stone, "cloak").ok, false);
assert.equal(placement.validateContainer(testActor, rations, backpack).ok, true);

const loosePlacement = new PlacementValidator({ policy: InventoryPolicy.fromProfile(looseProfile), gear: gearService, containers });
assert.equal(loosePlacement.validateZone(testActor, stone, "cloak").ok, true, "LOOSE policy does not enforce structured zones");

const effectProvider = new ConflictToolEffectProvider();
const conflictTools = new ConflictToolService({ profileId: "realm-guard-legacy-mixed", effectProvider });
const fightTools = conflictTools.list(testActor, { conflictType: "fight", conflictId: "c1" });
assert.ok(fightTools.some(tool => tool.id === "gear:staff"));
assert.ok(fightTools.some(tool => tool.id === "natural:claws"));
assert.ok(!fightTools.some(tool => tool.id === "tool:evidence"));

const argumentTools = conflictTools.list(testActor, { conflictType: "argument", conflictId: "c1" });
assert.ok(argumentTools.some(tool => tool.id === "tool:evidence"));
assert.ok(!argumentTools.some(tool => tool.id === "gear:staff"), "physical Fight gear must not leak into Argument");

let result = conflictTools.evaluate(testActor, { toolId: "gear:staff", action: "feint", conflictType: "fight" });
assert.equal(result.dice, 1);
result = conflictTools.evaluate(testActor, { toolId: "natural:claws", action: "attack", conflictType: "fight" });
assert.equal(result.dice, 1);
result = conflictTools.evaluate(testActor, { toolId: "tool:evidence", action: "maneuver", conflictType: "argument", requirementMet: true });
assert.equal(result.dice, 1);
assert.equal(result.conditionalSuccess, 1);
result = conflictTools.evaluate(testActor, { toolId: "tool:evidence", action: "maneuver", conflictType: "argument", requirementMet: false });
assert.equal(result.dice, 0);
assert.equal(result.conditionalSuccess, 0);

result = conflictTools.evaluate(testActor, { toolId: "", action: "attack", conflictType: "fight" });
assert.equal(result.coreDefaultUnarmedPenalty, 0);
assert.equal(result.activeProfileUnarmedPenalty, -1);
assert.equal(result.dice, -1, "Legacy Mixed preserves live -1D compatibility");
const strictTools = new ConflictToolService({ profileId: "realm-guard-strict-preview", effectProvider });
result = strictTools.evaluate(testActor, { toolId: "", action: "attack", conflictType: "fight" });
assert.equal(result.dice, 0, "CORE default has no universal unarmed penalty");

const disabled = conflictTools.list(testActor, { conflictType: "fight", disabled: ["staff"] }).find(tool => tool.id === "gear:staff");
assert.equal(disabled.disabled, true);
assert.ok(conflictTools.disableTargets(testActor, { conflictType: "fight" }).some(target => target.providerId === "trait:trait-1"));

const bundle = createM5Services(structuredProfile);
assert.equal(bundle.policy.mode, "STRUCTURED");
assert.equal(bundle.conflictTools.profileId, "realm-guard-legacy-mixed");

console.log("PASS m5-core-services-smoke");
