import assert from "node:assert/strict";
import fs from "node:fs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import {
  getM10C3Mg2eShadowStatus,
  mg2eActivationReadiness,
  mg2eAdvancementPlan,
  mg2eAdvancementRequirements,
  mg2eArmorPlan,
  mg2eBeginnerLearningPlan,
  mg2eCirclesPlan,
  mg2eConflictActionSkills,
  mg2eConflictDispositionPlan,
  mg2eCreationShadowSnapshot,
  mg2eEndSessionPlan,
  mg2eGearRelevancePlan,
  mg2eHelpPlan,
  mg2eInventoryPlan,
  mg2eNaturePlan,
  mg2ePlayerTurnPlan,
  mg2eRecoveryPlan,
  mg2eScaleGroupWarPlan,
  mg2eScaleRankFor,
  mg2eScaleSpecialPlan,
  mg2eTestPolicySnapshot,
  mg2eTraitAgainstPlan,
  mg2eTraitBenefitPlan,
  mg2eWeaponActionPlan,
  mg2eWiseUsePlan
} from "../module/m10c-mg2e-shadow-adapters.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId","realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion",1],
  ["realm-guard.systemSchemaVersion",1],
  ["realm-guard.coreArchitectureVersion","0.1"],
  ["realm-guard.migrationHistory","[]"],
  ["realm-guard.migrationLastError",""]
]);
const writes = [];

globalThis.game = {
  system:{version:"1.12.0-qa.14"},
  user:{isGM:true,id:"gm"},
  settings:{
    get:(ns,key)=>settings.get(ns + "." + key),
    set:async(ns,key,value)=>{
      writes.push({ns,key,value});
      settings.set(ns + "." + key,value);
      return value;
    }
  }
};
globalThis.Hooks = { callAll:()=>{} };

assert.equal(MG2E_FOUNDATION_PROFILE.version, 3);
assert.ok(["M10C.3","M10C.4","M10C.5","M10C.6"].includes(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase));
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.shadowAdaptersReady, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.shadowAdapterMode, "READ_ONLY");
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.foundationOnly, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.selectable, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.supported, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, false);

const testPolicy = mg2eTestPolicySnapshot();
assert.equal(testPolicy.mode, "MG2E");
assert.equal(testPolicy.ordinary, true);
assert.equal(testPolicy.versus, true);
assert.equal(testPolicy.beginnersLuck, true);

assert.deepEqual(mg2eAdvancementRequirements(4), {rating:4,passNeeded:4,failNeeded:3});
assert.deepEqual(mg2eAdvancementRequirements(1), {rating:1,passNeeded:1,failNeeded:0});
const advance = mg2eAdvancementPlan({rating:2,passed:1,failed:1,outcome:"PASS"});
assert.equal(advance.advance, true);
assert.deepEqual(advance.after, {rating:3,passed:0,failed:0});

const beginner = mg2eBeginnerLearningPlan({attempts:4,maximumNature:4});
assert.equal(beginner.readyToOpen, true);
assert.equal(beginner.openedRating, 2);
assert.equal(beginner.advancesWillHealth, false);

assert.equal(mg2eTraitBenefitPlan(1,{sessionUses:0}).dice, 1);
assert.equal(mg2eTraitBenefitPlan(1,{sessionUses:1}).available, false);
assert.equal(mg2eTraitBenefitPlan(2,{sessionUses:1}).dice, 1);
assert.equal(mg2eTraitBenefitPlan(2,{sessionUses:2}).available, false);
assert.equal(mg2eTraitBenefitPlan(3,{sessionUses:99}).successes, 1);
assert.equal(mg2eTraitAgainstPlan("hurt",{versus:true}).opponentDice, 2);

const iAmWise = mg2eWiseUsePlan("I Am Wise");
assert.equal(iAmWise.dice, 1);
assert.equal(iAmWise.replacesHelp, true);
const deeper = mg2eWiseUsePlan("Deeper Understanding",{failedDice:3});
assert.equal(deeper.resourceCost, "FATE");
assert.equal(deeper.rerollDiceMaximum, 1);
const ofCourse = mg2eWiseUsePlan("Of Course!",{failedDice:4});
assert.equal(ofCourse.resourceCost, "PERSONA");
assert.equal(ofCourse.rerollDiceMaximum, 4);
assert.equal(mg2eHelpPlan({sourceKind:"wise"}).mode, "I_AM_WISE");

const nature = mg2eNaturePlan({testName:"Resources",descriptorApplies:true});
assert.equal(nature.tapNatureAvailable, false);
assert.equal(nature.doubleTapNatureAvailable, false);
assert.deepEqual(nature.descriptors, ["Escaping","Climbing","Hiding","Foraging"]);

const injured = mg2eRecoveryPlan("Injured",{selfAttemptFailed:true,gmTurn:true});
assert.equal(injured.obstacle, 4);
assert.equal(injured.healerRequired, true);
assert.equal(injured.healerObstacle, 3);
assert.equal(injured.gmTurnCheckCost, 2);
const sick = mg2eRecoveryPlan("Sick",{selfAttemptFailed:true});
assert.equal(sick.obstacle, 4);
assert.equal(sick.healerObstacle, 4);

const inv = mg2eInventoryPlan({normalWeapons:2,satchelItems:2,armor:1});
assert.equal(inv.withinGuidance, true);
assert.equal(inv.policy, "LOOSE");
assert.equal(inv.capacityMode, "MG2E_CARRY_LIMITS");
assert.equal(mg2eInventoryPlan({normalWeapons:1,bulkyWeapons:1}).withinGuidance, false);

assert.deepEqual(mg2eConflictActionSkills("fight","attack").skills, ["Fighter"]);
assert.deepEqual(mg2eConflictActionSkills("fight animal","defend").skills, ["Loremouse","Nature"]);
assert.equal(mg2eConflictActionSkills("fight","attack").maxActionHelpers, 2);
assert.deepEqual(mg2eConflictDispositionPlan("journey").bases, ["Health"]);

const axe = mg2eWeaponActionPlan("Axe","attack",{successful:true});
assert.equal(axe.conditionalSuccess, 1);
assert.equal(mg2eWeaponActionPlan("Halberd","attack").dice, 1);
assert.equal(mg2eWeaponActionPlan("Halberd","maneuver").dice, -1);
assert.equal(mg2eWeaponActionPlan("Spear","feint",{successful:true}).conditionalSuccess, 1);
assert.equal(mg2eWeaponActionPlan("Shield","defend").dice, 2);
assert.equal(mg2eWeaponActionPlan("Bow","attack",{raining:true}).ok, false);

const light = mg2eArmorPlan("Light Armor",{usesThisConflict:0});
assert.equal(light.absorbDispositionDamage, 1);
assert.equal(mg2eArmorPlan("Light Armor",{usesThisConflict:1}).absorbAvailable, false);
assert.equal(mg2eArmorPlan("Heavy Armor",{action:"maneuver"}).dice, -1);
assert.equal(mg2eGearRelevancePlan({isGear:true,gmApproved:true}).dice, 1);

const freeTurn = mg2ePlayerTurnPlan({freeTestsUsed:0,checks:0});
assert.equal(freeTurn.canTakeTest, true);
assert.equal(freeTurn.checkCost, 0);
const extraTurn = mg2ePlayerTurnPlan({freeTestsUsed:1,checks:1});
assert.equal(extraTurn.checkCost, 1);
assert.equal(extraTurn.canTakeTest, true);
const blockedTurn = mg2ePlayerTurnPlan({freeTestsUsed:0,checks:0,isSolo:false,sameActorAsPrevious:true});
assert.equal(blockedTurn.alternationBlocked, true);

const rewards = mg2eEndSessionPlan({
  fateAwards:[{playerId:"a",type:"ACT_ON_BELIEF"}],
  personaAwards:[{playerId:"a",type:"MVP"},{playerId:"b",type:"WORKHORSE"}],
  playerCount:3
});
assert.equal(rewards.valid, true);
const badRewards = mg2eEndSessionPlan({
  personaAwards:[{playerId:"a",type:"MVP"},{playerId:"a",type:"WORKHORSE"}],
  playerCount:2
});
assert.equal(badRewards.valid, false);
assert.ok(badRewards.errors.includes("MVP_WORKHORSE_SAME_PLAYER"));

const circles = mg2eCirclesPlan({hometown:true,knownContact:true,enmityArgumentSpeech:true});
assert.equal(circles.dice, 2);
assert.equal(circles.dispositionSuccesses, 3);
assert.equal(circles.automaticNpcCreation, false);

assert.equal(mg2eScaleRankFor("Mouse"), 3);
assert.equal(mg2eScaleRankFor("Weasel"), 4);
assert.equal(mg2eScaleRankFor("Chipmunk"), null);
assert.equal(mg2eScaleGroupWarPlan({armyRank:3,targetRank:9,forceSize:20000}).minimumForce, 20000);
assert.equal(mg2eScaleSpecialPlan({actorType:"Mouse",targetType:"Fox",targetNature:7}).resourcesObstacle, 7);

const creation = mg2eCreationShadowSnapshot();
assert.ok(["NONE","CORE_M9_WHEN_ACTIVE"].includes(creation.liveAuthority));
assert.equal(creation.liveCommit, false);
assert.equal(typeof creation.commitAdapterReady, "boolean");
assert.equal(creation.provenanceWrite, false);
assert.equal(creation.relationshipWrite, false);
assert.deepEqual(creation.ranks, ["tenderpaw","guardmouse","patrolGuard","patrolLeader","guardCaptain"]);

const readiness = mg2eActivationReadiness();
assert.equal(readiness.shadowAdaptersReady, true);
assert.equal(readiness.activationGateClosed, true);
assert.equal(readiness.activationAvailable, false);
assert.equal(typeof readiness.fullRecruitmentCommitReady, "boolean");
assert.equal(typeof readiness.dedicatedLiveRulesReferenceReady, "boolean");
assert.equal(readiness.existingActorMigrationRequired, false);
assert.ok(readiness.blockers.includes("EXPLICIT_ACTIVATION_MILESTONE"));

const status = getM10C3Mg2eShadowStatus();
assert.equal(status.phase, "M10C.3");
assert.equal(status.mode, "MG2E_READ_ONLY_SHADOW_ADAPTERS");
assert.equal(status.liveApplication, false);
assert.deepEqual(status.writes, {actors:0,items:0,journals:0,settings:0});

const activation = await import("../module/m10-profile-activation.mjs");
assert.equal(activation.profileActivationAvailable("mg2e"), false);
writes.length = 0;
await assert.rejects(() => activation.switchRulesProfile("mg2e"), /foundation-only/i);
assert.equal(writes.length, 0);

const shadowSource = fs.readFileSync("module/m10c-mg2e-shadow-adapters.mjs","utf8");
for (const forbidden of ["game.settings.set","Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create"]) {
  assert.equal(shadowSource.includes(forbidden), false, "MG2E shadow adapter must remain zero-write: " + forbidden);
}
const activationSource = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activationSource.includes("switchToMg2e"), false);
assert.equal(activationSource.includes("MG2E_PROFILE_ID"), false);

console.log("PASS M10C.3 MG2E read-only shadow adapters · activation readiness blockers explicit · zero writes · activation OFF");
