import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildMg2eConversionPreview } from "../module/m10-profile-conversion-preview.mjs";

const resolver = new ProfileResolver([
  MG1E_FOUNDATION_PROFILE,
  MG2E_FOUNDATION_PROFILE,
  REALM_GUARD_LEGACY_MIXED_PROFILE,
  REALM_GUARD_STRICT_PROFILE
]);

const legacy = resolver.resolve("realm-guard-legacy-mixed");
const mg2e = resolver.resolve("mg2e");

assert.ok(mg2e.version >= 2);
assert.deepEqual(mg2e.lineage.map(row => row.id), ["mg2e"]);
assert.ok(["M10C.2","M10C.3"].includes(mg2e.metadata.implementationPhase));
assert.equal(mg2e.metadata.sourceAuditStatus, "DOMAIN_COMPLETE_FOUNDATION");
assert.equal(mg2e.metadata.foundationOnly, true);
assert.equal(mg2e.metadata.selectable, false);
assert.equal(mg2e.metadata.supported, false);
assert.equal(mg2e.metadata.liveRuleAuthority, false);
assert.equal(mg2e.metadata.conversionPreviewAvailable, true);

assert.equal(mg2e.domains.abilities.advancement, "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1");
assert.equal(mg2e.domains.abilities.ratingZeroOnePassNeeded, 1);
assert.equal(mg2e.domains.abilities.oneTestPerAbilityOrSkillPerConflictScene, true);
assert.equal(mg2e.domains.abilities.beginnerLearningOpensAt, 2);
assert.equal(mg2e.domains.abilities.beginnerLearningAttemptsUseMaximumNature, true);
assert.equal(mg2e.domains.abilities.beginnerLuckAdvancesWillHealth, false);
assert.equal(mg2e.domains.abilities.skillWiseCombinedMaximum, 24);

assert.equal(mg2e.domains.inventory.policy, "LOOSE");
assert.equal(mg2e.domains.inventory.capacityMode, "MG2E_CARRY_LIMITS");
assert.equal(mg2e.domains.inventory.carryLimits.weapons, 2);
assert.equal(mg2e.domains.inventory.carryLimits.bulkyWeaponReplacesWeaponCapacity, true);
assert.equal(mg2e.domains.inventory.carryLimits.satchelOrBagItems, 2);
assert.equal(mg2e.domains.inventory.relevantGearDice, 1);

assert.equal(mg2e.domains.conflict.actionsPerExchange, 3);
assert.equal(mg2e.domains.conflict.maxActionHelpers, 2);
assert.deepEqual(mg2e.domains.conflict.disposition.fight.skills, ["Fighter"]);
assert.deepEqual(mg2e.domains.conflict.actionSkills.fight, {
  attack:["Fighter"], defend:["Nature"], feint:["Fighter"], maneuver:["Nature"]
});
assert.deepEqual(mg2e.domains.conflict.actionSkills.fightCreature, {
  attack:["Fighter","Hunter"], defend:["Loremouse","Nature"], feint:["Fighter","Hunter"], maneuver:["Loremouse","Nature"]
});
assert.deepEqual(mg2e.domains.conflict.actionSkills.negotiation.feint, ["Manipulator","Persuader"]);
assert.equal(mg2e.domains.conflict.weapons.halberd.attackDice, 1);
assert.equal(mg2e.domains.conflict.weapons.halberd.maneuverDice, -1);
assert.equal(mg2e.domains.conflict.weapons.spear.feintSuccess, 1);
assert.equal(mg2e.domains.conflict.armor.light.usesPerConflict, 1);
assert.equal(mg2e.domains.conflict.armor.heavy.maneuverDice, -1);

assert.equal(mg2e.domains.session.playerTurnFreeTests, 1);
assert.equal(mg2e.domains.session.additionalTestCheckCost, 1);
assert.equal(mg2e.domains.session.alternation, true);
assert.equal(mg2e.domains.session.soloAlternationException, true);
assert.equal(mg2e.domains.session.checksTransferable, true);
assert.equal(mg2e.domains.session.fatePerSessionMax, 3);
assert.equal(mg2e.domains.session.personaPerSessionMax, 4);
assert.equal(mg2e.domains.session.mvpAndWorkhorseSamePlayer, false);
assert.equal(mg2e.domains.session.embodimentMayAwardEveryone, false);

assert.equal(mg2e.domains.naturalOrder.enabled, true);
assert.equal(mg2e.domains.naturalOrder.rankMin, 1);
assert.equal(mg2e.domains.naturalOrder.rankMax, 9);
assert.equal(mg2e.domains.naturalOrder.baseRank, 3);
assert.equal(mg2e.domains.scaleOfMight.enabled, false);

assert.equal(mg2e.domains.creation.profileVersion, 2);
assert.equal(mg2e.domains.creation.liveAuthority, "NONE");
assert.equal(mg2e.domains.creation.readyWhenActive, false);
assert.deepEqual(mg2e.domains.creation.rankTemplates.tenderpaw.age, [14,17]);
assert.equal(mg2e.domains.creation.rankTemplates.guardCaptain.resources, 5);
assert.equal(mg2e.domains.creation.rankTemplates.guardCaptain.circles, 4);
assert.deepEqual(mg2e.domains.creation.tenderpawWiseChoices, ["Code of the Guard-wise","Legends of the Guard-wise"]);
assert.deepEqual(mg2e.domains.creation.guardCaptainRequiredWiseChoices, ["Lockhaven-wise","Matriarch-wise"]);
assert.equal(mg2e.domains.creation.enemyHouseRuleAllowed, false);
assert.equal(mg2e.domains.creation.enemyScope, "ANY_APPROPRIATE_CHARACTER_OR_CREATURE");
assert.deepEqual(mg2e.domains.creation.startingRewards, {fate:1,persona:1});

const fakeActor = {
  id:"a1", name:"Old Ranger", type:"character",
  system:{progression:{level:3}},
  items:{contents:[
    {type:"wise",name:"Rain-wise",system:{rating:3}},
    {type:"talent",name:"Old Talent",system:{}},
    {type:"tokenOfPower",name:"Old Token",system:{}},
    {type:"gear",name:"Sword",system:{inventory:{mode:"hand"}}},
    {type:"condition",name:"Strained",system:{}},
    {type:"condition",name:"Sick",system:{}}
  ]},
  flags:{"realm-guard":{creationProvenance:{rulesProfileId:"mg1e"}}}
};
const preview = buildMg2eConversionPreview({fromProfile:legacy,toProfile:mg2e,actors:[fakeActor],worldItems:[]});
assert.equal(preview.phase, "M10C.2");
assert.equal(preview.mode, "READ_ONLY");
assert.equal(preview.activationAllowed, false);
assert.equal(preview.writesPlanned, 0);
assert.equal(preview.safety.actorWrites, 0);
assert.equal(preview.safety.itemWrites, 0);
assert.equal(preview.safety.journalWrites, 0);
assert.equal(preview.safety.settingWrites, 0);
assert.equal(preview.safety.destructiveConversion, false);
assert.equal(preview.worldImpact.ratedWiseItems, 1);
assert.equal(preview.worldImpact.actorsWithMg1eCreationProvenance, 1);
assert.ok(preview.deltas.some(row => row.domain === "inventory"));
assert.ok(preview.deltas.some(row => row.domain === "conflict"));
assert.ok(preview.deltas.some(row => row.domain === "session"));
assert.ok(preview.deltas.some(row => row.domain === "naturalOrder"));
assert.ok(preview.deltas.some(row => row.domain === "creation"));

const settings = new Map([
  ["realm-guard.activeRulesProfileId","realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion",1],
  ["realm-guard.systemSchemaVersion",1],
  ["realm-guard.coreArchitectureVersion","0.1"],
  ["realm-guard.migrationHistory","[]"],
  ["realm-guard.migrationLastError",""]
]);
globalThis.game = {
  system:{version:"1.12.0-qa.13"},
  user:{isGM:true,id:"gm"},
  settings:{
    get:(ns,key)=>settings.get(`${ns}.${key}`),
    set:async(ns,key,value)=>{ settings.set(`${ns}.${key}`,value); return value; }
  }
};
globalThis.Hooks = { callAll:()=>{} };

const activation = await import("../module/m10-profile-activation.mjs");
assert.equal(activation.profileActivationAvailable("mg2e"), false);
await assert.rejects(() => activation.switchRulesProfile("mg2e"), /foundation-only/i);

const scale = await import("../module/m10b-comparative-scale.mjs");
assert.equal(scale.familyScaleRankFor("mg2e","Mouse"), 3);
assert.equal(scale.familyScaleRankFor("mg2e","Weasel"), 4);
assert.equal(scale.familyScaleRankFor("mg2e","Black Bear"), 9);
assert.equal(scale.familyScaleRankFor("mg2e","Chipmunk"), null, "MG2E Natural Order must not silently inherit MG1E-only entries.");
for (const [diff,minimum] of [[2,20],[3,100],[4,200],[5,2000],[6,20000]]) {
  const plan = scale.familyScaleGroupWarPlan("mg2e",{armyRank:3,targetRank:3+diff,forceSize:minimum});
  assert.equal(plan.minimumForce, minimum);
  assert.equal(plan.eligible, true);
}
const science = scale.familyScaleSpecialPlan("mg2e",{actorType:"Mouse",targetType:"Fox",targetNature:7});
assert.equal(science.mode, "MG2E_SCIENTIST");
assert.equal(science.eligible, true);
assert.equal(science.resourcesObstacle, 7);

const previewSource = fs.readFileSync("module/m10-profile-conversion-preview.mjs","utf8");
for (const forbidden of ["game.settings.set","Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create"]) {
  assert.equal(previewSource.includes(forbidden), false, `MG2E preview must remain zero-write: ${forbidden}`);
}
const activationSource = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activationSource.includes("switchToMg2e"), false);
assert.equal(activationSource.includes('MG2E_PROFILE_ID'), false);

console.log("PASS M10C.2 MG2E domain-complete foundation · Natural Order · read-only conversion preview · activation remains OFF");
