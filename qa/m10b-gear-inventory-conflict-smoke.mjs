import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildProfileCapabilities } from "../module/profile-capabilities.mjs";
import {
  buildM10BGearInventoryConflictPolicy,
  familyWeaponDefinition,
  familyArmorPlan,
  familyInventoryPolicyPlan,
  familyAvailableConflictTools,
  familyConflictToolPlan,
  familyConflictActionSkills,
  familyConflictDispositionPlan
} from "../module/m10b-gear-inventory-conflict.mjs";
import {
  strictWeaponDefinition,
  strictArmorPlan,
  strictInventoryPolicyPlan
} from "../module/m10-strict-gear-inventory-conflict.mjs";

const resolver = new ProfileResolver([MG1E_FOUNDATION_PROFILE, REALM_GUARD_LEGACY_MIXED_PROFILE, REALM_GUARD_STRICT_PROFILE]);
const legacy = buildM10BGearInventoryConflictPolicy(buildProfileCapabilities(resolver.resolve("realm-guard-legacy-mixed")));
const strict = buildM10BGearInventoryConflictPolicy(buildProfileCapabilities(resolver.resolve("realm-guard-strict")));
const mg1e = buildM10BGearInventoryConflictPolicy(buildProfileCapabilities(resolver.resolve("mg1e")));

assert.equal(legacy.phase, "M10B.5");
assert.equal(strict.phase, "M10B.5");
assert.equal(mg1e.phase, "M10B.5");

assert.equal(legacy.familySemantics, false);
assert.equal(legacy.inventory.policy, "STRUCTURED");
assert.equal(legacy.inventory.placementAuthority, true);
assert.equal(legacy.conflict.unarmedDefaultDice, -1);

assert.equal(strict.familySemantics, true);
assert.equal(strict.inventory.policy, "LOOSE");
assert.equal(strict.inventory.placementAuthority, false);
assert.equal(strict.conflict.unarmedDefaultDice, 0);
assert.equal(strict.conflict.weaponAlias["Hook and Line"], "Whip");
assert.equal(strict.conflict.scaleOfMightAware, true);

assert.equal(mg1e.familySemantics, true);
assert.ok(mg1e.profileVersion >= 6, "M10B.5 gear/conflict contract must survive later MG1E foundation revisions.");
assert.equal(mg1e.inventory.policy, "LOOSE");
assert.equal(mg1e.inventory.placementAuthority, false);
assert.equal(mg1e.conflict.unarmedDefaultDice, 0);
assert.deepEqual(mg1e.conflict.weaponAlias, {});
assert.equal(mg1e.conflict.scaleOfMightAware, false);

assert.deepEqual(familyConflictActionSkills("fight", "defend", mg1e).skills, ["Nature"]);
assert.deepEqual(familyConflictActionSkills("fight", "maneuver", mg1e).skills, ["Nature"]);
assert.deepEqual(familyConflictActionSkills("fight", "defend", strict).skills, ["Fighter"]);
assert.deepEqual(familyConflictActionSkills("fight", "maneuver", strict).skills, ["Fighter"]);
assert.deepEqual(familyConflictDispositionPlan("chase", mg1e).bases, ["Nature"]);
assert.deepEqual(familyConflictDispositionPlan("chase", strict).bases, ["Health"]);
assert.deepEqual(familyConflictDispositionPlan("war", mg1e).skills, ["Militarist"]);
assert.deepEqual(familyConflictDispositionPlan("war", strict).skills, ["Militarist","Lore Master"]);

assert.equal(familyWeaponDefinition("Hook and Line", {}, mg1e)?.name, "Hook and Line");
assert.equal(familyWeaponDefinition("Whip", {}, mg1e)?.name, "Hook and Line");
assert.equal(familyWeaponDefinition("Hook and Line", {}, strict)?.name, "Whip");
assert.equal(familyWeaponDefinition("Whip", {}, strict)?.inheritedName, "Hook and Line");
assert.equal(strictWeaponDefinition("Hook and Line")?.name, "Whip");

assert.equal(familyArmorPlan("Light Armor", { conflictType:"fight" }, mg1e).dispositionDice, 1);
assert.equal(familyArmorPlan("Heavy Armor", { conflictType:"fight" }, mg1e).dispositionSuccess, 1);
assert.equal(familyArmorPlan("Plated Armor", { conflictType:"fight" }, mg1e).ok, false);
assert.equal(familyArmorPlan("Leather Armor", { conflictType:"fight" }, strict).dispositionDice, 1);
assert.equal(familyArmorPlan("Chainmail Armor", { conflictType:"fight" }, strict).dispositionSuccess, 1);
assert.equal(familyArmorPlan("Plated Armor", { conflictType:"fight", action:"defend" }, strict).conditionalSuccess, 1);
assert.deepEqual(strictArmorPlan("Plated Armor", { conflictType:"fight", action:"defend" }), familyArmorPlan("Plated Armor", { conflictType:"fight", action:"defend" }, strict));

function item(id,type,name,system={}) { return { id,type,name,system }; }
const actor = {
  id:"a1", type:"character",
  flags:{"realm-guard":{}},
  items:{contents:[
    item("sword","gear","Sword",{quantity:1,inventory:{mode:"unassigned",location:"",containerId:""}}),
    item("shield","gear","Shield",{quantity:1,inventory:{mode:"hand",location:"left-hand",containerId:""}})
  ]}
};

const mgInventory = familyInventoryPolicyPlan(actor, mg1e);
const strictInventory = familyInventoryPolicyPlan(actor, strict);
assert.equal(mgInventory.writesPlanned, 0);
assert.equal(mgInventory.destructive, false);
assert.equal(mgInventory.gearItemsWithPlacementMetadata, 1);
assert.deepEqual(strictInventoryPolicyPlan(actor), strictInventory);

const legacyTools = familyAvailableConflictTools(actor, {conflictType:"fight"}, legacy);
const mgTools = familyAvailableConflictTools(actor, {conflictType:"fight"}, mg1e);
assert.equal(legacyTools.some(t=>t.id==="gear:sword"), false, "Legacy structured inventory keeps hand placement authority.");
assert.equal(legacyTools.some(t=>t.id==="gear:shield"), true);
assert.equal(mgTools.some(t=>t.id==="gear:sword"), true, "MG1E loose inventory ignores placement for rules while preserving metadata.");
assert.equal(mgTools.some(t=>t.id==="gear:shield"), true);

assert.equal(familyConflictToolPlan(actor,{conflictType:"fight",action:"attack"},legacy).dice,-1);
assert.equal(familyConflictToolPlan(actor,{conflictType:"fight",action:"attack"},mg1e).dice,0);
assert.equal(familyConflictToolPlan(actor,{conflictType:"fight",action:"attack"},strict).dice,0);

const genericSource = fs.readFileSync("module/m10b-gear-inventory-conflict.mjs","utf8");
for (const forbidden of [".update(","createEmbeddedDocuments","deleteEmbeddedDocuments","game.settings.set",".setFlag(",".unsetFlag("]) {
  assert.equal(genericSource.includes(forbidden), false, `M10B.5 generic provider must remain non-destructive: ${forbidden}`);
}
const activation = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activation.includes('"mg1e"'),false,"MG1E must remain non-selectable in M10B.5.");

const conflicts = fs.readFileSync("module/conflicts.mjs","utf8");
assert.equal(conflicts.includes("isStrictRealmGuard"),false,"Conflict live routing must no longer key off Strict identity.");
assert.ok(conflicts.includes("familyConflictActionSkills"));
assert.ok(conflicts.includes("familyConflictDispositionPlan"));

const handoff = fs.readFileSync("module/m5-conflict-live-handoff.mjs","utf8");
assert.equal(handoff.includes("isStrictRealmGuard"),false,"M5 conflict handoff must route through profile policy.");
assert.ok(handoff.includes("familyConflictToolPlan"));

const npcTemplate = fs.readFileSync("templates/actor/npc.hbs","utf8");
const identityStart = npcTemplate.indexOf('<div class="rg-npc-identity">');
const resourceStart = npcTemplate.indexOf('<div class="rg-npc-resource-stack"', identityStart);
const identityEnd = npcTemplate.indexOf("</div>\n  </header>", identityStart);
assert.ok(resourceStart > identityStart && resourceStart < identityEnd, "NPC resources must sit inside the identity/header content rather than a tall third column.");
const css = fs.readFileSync("styles/realm-guard.css","utf8");
assert.ok(css.includes("v1.12.0-qa.5 — compact NPC header/resources"));
assert.ok(css.includes("grid-template-columns:repeat(3,minmax(0,1fr))"));

console.log("PASS M10B.5 Gear / Inventory / Conflict routing · MG1E source tables · Strict overrides · Legacy preservation · NPC compact header");
