import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eAccommodationRecoveryPlan, tb2eExhaustedRecoveryModifierPlan, tb2eFreshEligibilityPlan, tb2eHealerFailurePlan, tb2eHealerRecoveryPlan, tb2eHungryThirstyRecoveryPlan, tb2eRecoveryModel, tb2eRecoveryShadowStatus, tb2eStandardRecoveryPlan } from "../module/m10d-tb2e-recovery-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eRecoveryShadowStatus();
assert.equal(status.phase,"M10D.9");assert.equal(status.mode,"TB2E_RECOVERY_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});
assert.ok(status.unresolvedSourceBoundaries.includes("EXHAUSTED_QR44_CAMP_TEST_WORDING_VS_GENERIC_CAMP_TOWN_AND_TOWN_ACCOMMODATIONS"));

const model=tb2eRecoveryModel();
assert.deepEqual(model.order,["HUNGRY_THIRSTY","ANGRY","AFRAID","EXHAUSTED","INJURED_OR_SICK"]);
assert.equal(model.general.campCost.checksPerTest,1);assert.equal(model.general.townCost.withoutAccommodation.lifestyleCostPerRecoveryTest,1);
assert.equal(model.standard.ANGRY.ability,"WILL");assert.equal(model.standard.ANGRY.obstacle,2);
assert.equal(model.standard.AFRAID.obstacle,3);assert.equal(model.standard.EXHAUSTED.ability,"HEALTH");assert.equal(model.standard.EXHAUSTED.obstacle,3);
assert.equal(model.standard.INJURED.obstacle,4);assert.equal(model.standard.SICK.ability,"WILL");assert.equal(model.standard.SICK.obstacle,3);

const angryCamp=tb2eStandardRecoveryPlan({condition:"Angry",phase:"Camp"});
assert.equal(angryCamp.ok,true);assert.equal(angryCamp.ability,"WILL");assert.equal(angryCamp.obstacle,2);assert.equal(angryCamp.campCheckCost,1);assert.equal(angryCamp.townLifestyleCostPreview,0);
const afraidTown=tb2eStandardRecoveryPlan({condition:"Afraid",phase:"Town",accommodation:"None"});
assert.equal(afraidTown.obstacle,3);assert.equal(afraidTown.campCheckCost,0);assert.equal(afraidTown.townLifestyleCostPreview,1);
assert.equal(tb2eStandardRecoveryPlan({condition:"Angry",phase:"Camp",attemptedThisPhase:true}).reasonCode,"CONDITION_RECOVERY_ALREADY_ATTEMPTED_THIS_PHASE");
const exhausted=tb2eStandardRecoveryPlan({condition:"Exhausted",phase:"Town",accommodation:"Inn"});
assert.match(exhausted.phaseSourceBoundary,/QR44_SAYS_CAMP_TEST/);

const hungryAdventure=tb2eHungryThirstyRecoveryPlan({phase:"Adventure",hasRations:true,hasWine:true});
assert.equal(hungryAdventure.satisfied,true);assert.equal(hungryAdventure.method,"EAT_RATIONS_AND_DRINK_WINE");
const hungryCamp=tb2eHungryThirstyRecoveryPlan({phase:"Camp",foodSkill:"Hunter",cookPrepared:true});
assert.equal(hungryCamp.satisfied,true);assert.equal(hungryCamp.obstacle,null);assert.equal(hungryCamp.obstacleAuthority,"UNAVAILABLE_NOT_IN_GUIDE");
const hungryInn=tb2eHungryThirstyRecoveryPlan({phase:"Town",accommodation:"Inn"});
assert.equal(hungryInn.supported,true);assert.equal(hungryInn.method,"ACCOMMODATION_AUTOMATIC");

const flophouse=tb2eAccommodationRecoveryPlan({accommodation:"Flophouse"});
assert.equal(flophouse.freeRecoveryTests,1);assert.equal(flophouse.additionalRecoveryTests,1);
const hotelSick=tb2eAccommodationRecoveryPlan({accommodation:"Hotel",condition:"Sick"});
assert.equal(hotelSick.freeRecoveryTests,2);assert.equal(hotelSick.additionalRecoveryTests,2);assert.equal(hotelSick.diceBonus,1);assert.equal(hotelSick.automaticRecovery,false);
const hotelExhausted=tb2eAccommodationRecoveryPlan({accommodation:"Hotel",condition:"Exhausted"});
assert.equal(hotelExhausted.automaticRecovery,true);
const innAngry=tb2eAccommodationRecoveryPlan({accommodation:"Inn",condition:"Angry",additionalTestNumber:1});
assert.equal(innAngry.diceBonus,1);assert.equal(innAngry.additionalLifestyleCostPreview,1);
const home=tb2eAccommodationRecoveryPlan({accommodation:"Home"});
assert.equal(home.lodgingCost,0);assert.equal(home.recoveryTestQuotaAuthority,"UNSPECIFIED_IN_GUIDE");

const exhaustedMods=tb2eExhaustedRecoveryModifierPlan({inInn:true,hasCloak:true,usedShield:true,woreHeavyArmor:true});
assert.deepEqual(exhaustedMods.bonusSources,["INN","CLOAK"]);assert.equal(exhaustedMods.bonusStacking,"UNSPECIFIED_DO_NOT_SUM_AUTOMATICALLY");
assert.equal(exhaustedMods.automaticDiceBonus,null);assert.equal(exhaustedMods.gmDiscretionObstacleGuidance,1);assert.equal(exhaustedMods.obstacleAutomation,false);

const healerInjury=tb2eHealerRecoveryPlan({condition:"Injured",severity:"Burns"});
assert.equal(healerInjury.skill,"HEALER");assert.equal(healerInjury.obstacle,4);assert.equal(healerInjury.outOfOrderAllowed,true);assert.equal(healerInjury.failureProcedure,"GRIT_YOUR_TEETH");
const healerSick=tb2eHealerRecoveryPlan({condition:"Sick",severity:"Poison"});
assert.equal(healerSick.obstacle,6);assert.equal(healerSick.failureProcedure,"SWEAT_OUT_THE_FEVER");

const grit=tb2eHealerFailurePlan({condition:"Injured",selectedLossTarget:"Health"});
assert.deepEqual(grit.allowedLossTargets,["HEALTH","NATURE","HEALTH_BASED_SKILL"]);assert.equal(grit.ratingLoss,1);assert.equal(grit.conditionRemovalPreview,true);assert.equal(grit.erasePassFailAdvancementPreview,true);
assert.equal(grit.conditionMutationCommitted,false);assert.equal(grit.abilityMutationCommitted,false);assert.equal(grit.advancementMutationCommitted,false);
const sweat=tb2eHealerFailurePlan({condition:"Sick",selectedLossTarget:"Will Based Skill"});
assert.deepEqual(sweat.allowedLossTargets,["WILL","NATURE","WILL_BASED_SKILL"]);assert.equal(sweat.selectedLossTarget,"WILL_BASED_SKILL");

const fresh=tb2eFreshEligibilityPlan({inTown:true,activeConditionCount:0,currentNature:4,maximumNature:4,lifestylePassed:true});
assert.equal(fresh.eligible,true);assert.equal(fresh.freshMutationCommitted,false);
const notFresh=tb2eFreshEligibilityPlan({inTown:true,activeConditionCount:1,currentNature:4,maximumNature:4,lifestylePassed:true});
assert.equal(notFresh.eligible,false);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-recovery-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.9 TB2E Recovery shadow · order/costs · Hungry-Thirsty · accommodations · Exhausted source boundary · Healer alternatives/failures · Fresh eligibility · zero writes");
