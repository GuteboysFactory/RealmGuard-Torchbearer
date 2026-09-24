import assert from "node:assert/strict";
import fs from "node:fs";
import { createM5Services } from "../module/core/m5-services.mjs";
import {
  getStrictGearInventoryConflictStatus,
  strictArmorPlan,
  strictAvailableConflictTools,
  strictConflictToolPlan,
  strictDisarmTargets,
  strictGearRelevancePlan,
  strictInventoryPolicyPlan,
  strictWeaponActionPlan,
  strictWeaponDefinition,
  strictWeaponOfWitPlan
} from "../module/m10-strict-gear-inventory-conflict.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.11\.0(?:-qa\.\d+)?$/, "M10A.4 smoke runs across v1.11.0.");

function item(id, type, name, system = {}) {
  return { id, type, name, system };
}

const actor = {
  id: "r1",
  name: "Ranger",
  type: "character",
  flags: {
    "realm-guard": {
      conflictTools: [{
        id: "wit1",
        name: "Prepared Evidence",
        conflictTypes: ["argument"],
        effects: [
          { kind: "dice", value: 1, actions: ["attack"] },
          { kind: "success", value: 1, actions: ["attack"] }
        ]
      }],
      naturalConflictTools: [{
        id: "fangs",
        name: "Fangs",
        conflictTypes: ["fight"],
        effects: [{ kind: "dice", value: 1, actions: ["attack"] }]
      }]
    }
  },
  items: { contents: [
    item("sword", "gear", "Sword", { quantity: 1, inventory: { mode: "unassigned", location: "", containerId: "" } }),
    item("shield", "gear", "Shield", { quantity: 1, inventory: { mode: "hand", location: "left-hand", containerId: "" } }),
    item("rope", "gear", "Rope", { quantity: 1, inventory: { mode: "unassigned", location: "", containerId: "" } }),
    item("trait1", "trait", "Bold", { rating: 1 })
  ] }
};

const status = getStrictGearInventoryConflictStatus();
assert.equal(status.phase, "M10A.4");
assert.equal(status.liveAuthority, false);
assert.equal(status.inventory.policy, "LOOSE");
assert.equal(status.inventory.slotPlacementAuthority, false);
assert.equal(status.conflict.unarmedDefaultDice, 0);
assert.equal(status.conflict.whipAliasOfHookAndLine, true);
assert.equal(status.conflict.multipleToolEffects, true);
assert.equal(status.conflict.weaponsOfWit, true);
assert.deepEqual(status.conflict.disarmTargets, ["weapon", "gear", "trait", "natural"]);
assert.equal(status.writesActors, false);
assert.equal(status.writesItems, false);

const inventory = strictInventoryPolicyPlan(actor);
assert.equal(inventory.policy, "LOOSE");
assert.equal(inventory.slotPlacementAuthority, false);
assert.equal(inventory.preservePlacementMetadata, true);
assert.equal(inventory.gearItems, 3);
assert.equal(inventory.gearItemsWithPlacementMetadata, 1);
assert.equal(inventory.writesPlanned, 0);

const strictTools = strictAvailableConflictTools(actor, { conflictType: "fight" });
assert.equal(strictTools.some(tool => tool.id === "gear:sword"), true, "Strict LOOSE must see an unassigned Sword.");
assert.equal(strictTools.some(tool => tool.id === "gear:shield"), true);
assert.equal(strictTools.some(tool => tool.id === "natural:fangs"), true);

const legacyServices = createM5Services({
  id: "realm-guard-legacy-mixed",
  domains: { inventory: { policy: "STRUCTURED" } }
});
const legacyTools = legacyServices.conflictTools.list(actor, { conflictType: "fight" });
assert.equal(legacyTools.some(tool => tool.id === "gear:sword"), false, "Legacy STRUCTURED must retain hand-placement authority.");
assert.equal(legacyTools.some(tool => tool.id === "gear:shield"), true);

const strictNoTool = strictConflictToolPlan(actor, { conflictType: "fight", action: "attack" });
assert.equal(strictNoTool.dice, 0);
assert.equal(strictNoTool.activeProfileUnarmedPenalty, 0);
const legacyNoTool = legacyServices.conflictTools.evaluate(actor, { conflictType: "fight", action: "attack" });
assert.equal(legacyNoTool.dice, -1);
assert.equal(legacyNoTool.activeProfileUnarmedPenalty, -1);

assert.equal(strictWeaponDefinition("Whip")?.inheritedName, "Hook and Line");
assert.equal(strictWeaponDefinition("Hook and Line")?.name, "Whip");
assert.equal(strictWeaponDefinition("Halberd")?.requiresModeChoice, true);

const axeAttack = strictWeaponActionPlan("Axe", "attack", { successful: true });
assert.equal(axeAttack.conditionalSuccess, 1);
assert.equal(strictWeaponActionPlan("Axe", "defend").dice, -1);

const spearAttack = strictWeaponActionPlan("Spear", "attack", { opponentAction: "attack", opponentRange: "normal" });
assert.equal(spearAttack.interactionOverride, "versus");
assert.equal(strictWeaponActionPlan("Spear", "maneuver", { opponentRange: "normal" }).dice, 1);

const halberdMissing = strictWeaponActionPlan("Halberd", "maneuver", { opponentRange: "normal" });
assert.equal(halberdMissing.ok, false);
assert.equal(halberdMissing.reasonCode, "HALBERD_MODE_REQUIRED");
const halberdSpear = strictWeaponActionPlan("Halberd", "maneuver", { halberdMode: "spear", opponentRange: "normal" });
assert.equal(halberdSpear.ok, true);
assert.equal(halberdSpear.dice, 1);
assert.equal(halberdSpear.modeScope, "ACTION_SET");

const knife = strictWeaponActionPlan("Knife", "maneuver", { successful: true, opponentRange: "spear" });
assert.equal(knife.autoDisarm, true);
assert.equal(strictWeaponActionPlan("Knife", "attack", { thrown: true, opponentAction: "attack", opponentRange: "normal" }).expendedAfterAction, true);

assert.equal(strictWeaponActionPlan("Shield", "defend").dice, 2);
assert.equal(strictWeaponActionPlan("Shield", "defend", { usedPreviousTurn: true }).fatigueRecoveryHealthDice, -1);
assert.equal(strictWeaponActionPlan("Sword", "attack", { swordUsefulAction: "attack" }).dice, 1);
assert.equal(strictWeaponActionPlan("Sword", "defend", { swordUsefulAction: "attack" }).dice, 0);

const leather = strictArmorPlan("Leather Armor", { conflictType: "fight" });
assert.equal(leather.dispositionDice, 1);
assert.equal(leather.dispositionSuccess, 0);
const chain = strictArmorPlan("Chainmail Armor", { conflictType: "fight", action: "maneuver" });
assert.equal(chain.dispositionSuccess, 1);
assert.equal(chain.dice, -1);
const plated = strictArmorPlan("Plated Armor", { conflictType: "fight", action: "defend" });
assert.equal(plated.dispositionSuccess, 1);
assert.equal(plated.conditionalSuccess, 1);
assert.equal(strictArmorPlan("Plated Armor", { conflictType: "fight", action: "feint" }).dice, -1);
assert.equal(strictArmorPlan("Plated Armor", { testName: "Survivalist" }).dice, -1);

assert.equal(strictGearRelevancePlan(actor.items.contents[2]).dice, 0);
assert.equal(strictGearRelevancePlan(actor.items.contents[2], { gmApproved: true }).dice, 1);
assert.equal(strictGearRelevancePlan(actor.items.contents[2]).automatic, false);

const argumentTool = strictConflictToolPlan(actor, {
  toolId: "tool:wit1",
  action: "attack",
  conflictType: "argument"
});
assert.equal(argumentTool.dice, 1);
assert.equal(argumentTool.conditionalSuccess, 1, "CORE conflict tools must retain multiple simultaneous effects.");

const disarm = strictDisarmTargets(actor, { conflictType: "fight" });
assert.equal(disarm.allowWeapon, true);
assert.equal(disarm.allowGear, true);
assert.equal(disarm.allowTrait, true);
assert.equal(disarm.allowNaturalWeapon, true);
assert.equal(disarm.targets.some(row => row.providerId === "gear:sword"), true);
assert.equal(disarm.targets.some(row => row.providerId === "trait:trait1"), true);
assert.equal(disarm.targets.some(row => row.providerId === "natural:fangs"), true);
assert.equal(disarm.writesPlanned, 0);

const evidence = strictWeaponOfWitPlan("Evidence", "attack", { evidenceEstablished: true, successful: true });
assert.equal(evidence.conditionalSuccess, 1);
assert.equal(strictWeaponOfWitPlan("Promises", "defend", { promiseMade: true }).dice, 1);
assert.equal(strictWeaponOfWitPlan("Roleplay", "feint", { roleplayed: true, chosenAction: "feint" }).dice, 1);
assert.equal(strictWeaponOfWitPlan("Repeating Yourself", "attack", { repeating: true }).dice, -1);

assert.ok(REALM_GUARD_STRICT_PROFILE.version >= 5, "M10A.4 conflict policy must remain present in later Strict profile versions.");
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.conflict.unarmedDefaultDice, 0);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.conflict.weaponAlias["Hook and Line"], "Whip");
assert.ok(["M10A.4","M10A.5","M10A.6","M10A.7","M10A.8","M10A.9"].includes(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase), "M10A.4 smoke must survive later M10 phases.");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.gearInventoryConflictPolicyReady, true);
assert.equal(typeof REALM_GUARD_STRICT_PROFILE.metadata.liveRuleAuthority, "boolean");

const strictSource = fs.readFileSync("module/m10-strict-gear-inventory-conflict.mjs", "utf8");
for (const forbidden of [
  ".update(",
  ".createEmbeddedDocuments(",
  ".deleteEmbeddedDocuments(",
  "game.settings.set",
  ".setFlag(",
  ".unsetFlag("
]) assert.equal(strictSource.includes(forbidden), false, `Strict M10A.4 foundation must stay non-live: ${forbidden}`);

const legacyConflict = fs.readFileSync("module/conflicts.mjs", "utf8");
assert.ok(legacyConflict.includes("Unarmed / no valid Conflict Weapon or Tool −1D"), "Legacy Mixed live unarmed penalty must remain untouched in qa.5.");
assert.ok(legacyConflict.includes('String(i.system.inventory?.mode ?? "") === "hand"'), "Legacy Mixed live hand-slot behavior must remain untouched in qa.5.");

const profileService = fs.readFileSync("module/rules-profile-service.mjs", "utf8");
assert.equal(profileService.includes("setActiveRulesProfile"), false, "No live profile switch API may exist in M10A.4.");

console.log("PASS M10A.4 Gear / Inventory / Conflict ownership foundation · Strict source policy ready · Legacy Mixed untouched · no live activation");
