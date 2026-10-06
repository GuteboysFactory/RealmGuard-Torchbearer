import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eBeltStoragePlan, tb2eCachePlan, tb2eContainerDamagePlan, tb2eContainerPlan, tb2eGearStoragePlan, tb2eInventoryLocationPlan, tb2eInventoryModel, tb2eInventoryShadowStatus, tb2eStartingGearBoundaryPlan, tb2eTwoHandedWeaponPlan } from "../module/m10d-tb2e-inventory-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eInventoryShadowStatus();
assert.equal(status.phase,"M10D.10");assert.equal(status.mode,"TB2E_INVENTORY_GEAR_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eInventoryModel();
assert.equal(model.locations.HEAD.wornSlots,1);assert.equal(model.locations.NECK.wornSlots,1);
assert.equal(model.locations.HANDS.totalWornSlots,2);assert.equal(model.locations.HANDS.totalCarriedSlots,2);
assert.equal(model.locations.TORSO.slots,3);assert.equal(model.locations.BELT.slots,3);assert.equal(model.locations.POCKET.smallItems,1);
assert.equal(model.containers.BACKPACK.torsoWornSlots,2);assert.equal(model.containers.BACKPACK.packSlots,6);
assert.equal(model.containers.SATCHEL.torsoWornSlots,1);assert.equal(model.containers.SATCHEL.packSlots,3);
assert.equal(model.containers.BACKPACK.negativeModifierMagnitudeAuthority,"UNAVAILABLE");
assert.equal(model.cache.standardSlots,12);

const hands=tb2eInventoryLocationPlan({location:"Hands"});
assert.equal(hands.totalWornSlots,2);assert.equal(hands.totalCarriedSlots,2);
const carried4=tb2eGearStoragePlan({storage:"Carried",slotCost:4,carriers:2});
assert.equal(carried4.carried4,true);assert.deepEqual(carried4.carried4Requirement,{carriersRequired:2,handsPerCarrier:2,totalHands:4});
const wield=tb2eGearStoragePlan({storage:"Wield",slotCost:1,wieldHands:2});
assert.equal(wield.wieldHands,2);assert.equal(wield.placementMutationCommitted,false);

const backpack=tb2eContainerPlan({container:"Backpack",usedPackSlots:6});
assert.equal(backpack.capacity,6);assert.equal(backpack.overCapacity,false);assert.equal(backpack.torsoWornSlots,2);
const overBackpack=tb2eContainerPlan({container:"Backpack",usedPackSlots:7});
assert.equal(overBackpack.overCapacity,true);
const nested=tb2eContainerPlan({container:"Satchel",usedPackSlots:2,nested:true,innerContainerSlotCost:0.5,innerContentsSlotCost:1});
assert.equal(nested.requiredNestedSlots,1.5);assert.equal(nested.nestingRule,"OUTER_MUST_FIT_INNER_AND_CONTENTS");

const beltOk=tb2eBeltStoragePlan({storage:"Pack",slotCost:1,bundled:false});assert.equal(beltOk.allowed,true);
const beltBundle=tb2eBeltStoragePlan({storage:"Pack",slotCost:1,bundled:true});assert.equal(beltBundle.allowed,false);assert.equal(beltBundle.reasonCode,"BELT_BUNDLED_ITEMS_NOT_ALLOWED");
const beltBig=tb2eBeltStoragePlan({storage:"Carried",slotCost:2,bundled:false});assert.equal(beltBig.allowed,false);assert.equal(beltBig.reasonCode,"BELT_ITEM_MUST_BE_SIZE_1");

const twoHanded=tb2eTwoHandedWeaponPlan({wieldHands:2,handsCurrentlyHolding:1});
assert.equal(twoHanded.mustBeHeldWithTwoHandsOrDropped,true);assert.equal(twoHanded.compliant,false);assert.equal(twoHanded.requiredActionIfNonCompliant,"DROP");
const held=tb2eTwoHandedWeaponPlan({wieldHands:2,handsCurrentlyHolding:2});assert.equal(held.compliant,true);

const damage=tb2eContainerDamagePlan({damaged:true,contentsAtRisk:"Some"});
assert.equal(damage.twistAuthority,"GM_ADJUDICATION");assert.equal(damage.contentsAtRisk,"SOME");assert.equal(damage.contentLossMutationCommitted,false);

const campCache=tb2eCachePlan({phase:"Camp",hasCheck:true,built:false});
assert.equal(campCache.cacheSlots,12);assert.equal(campCache.canBuild,true);assert.deepEqual(campCache.buildCost,{checks:1});assert.equal(campCache.transferAtWill,false);
const townCache=tb2eCachePlan({phase:"Town",hasParentOrFriendWithHome:true,built:true});
assert.equal(townCache.canBuild,true);assert.equal(townCache.buildCost.cost,"FREE");assert.equal(townCache.transferAtWill,true);

const magician=tb2eStartingGearBoundaryPlan({className:"Magician",containerChoice:"Backpack"});
assert.deepEqual(magician.slotlessStartingItems,["WELL_WORN_CLOTHES","UTILITARIAN_BELT"]);assert.equal(magician.classRequirements.spellBookRequired,true);assert.equal(magician.classRequirements.holyRelicsRequired,0);assert.equal(magician.gearGrantCommitted,false);
const theurge=tb2eStartingGearBoundaryPlan({className:"Theurge",containerChoice:"Satchel"});
assert.equal(theurge.classRequirements.holyRelicsRequired,2);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-inventory-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.10 TB2E Inventory/Gear shadow · locations · storage labels · containers · belt/two-hand · caches · starting boundaries · zero writes");
