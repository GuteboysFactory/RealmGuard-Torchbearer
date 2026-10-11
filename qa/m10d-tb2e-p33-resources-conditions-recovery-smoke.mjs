import assert from "node:assert/strict";
import fs from "node:fs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {tb2eResourcesTestPlan, tb2eResourcesTaxPlan,tb2eFateSpendPlan,tb2ePersonaSpendPlan,tb2eResourceShadowStatus} from "../module/m10d-tb2e-resources-shadow.mjs";
import {tb2eConditionModel,tb2eConditionShadowStatus,tb2eConditionTestEffectPlan} from "../module/m10d-tb2e-conditions-shadow.mjs";
import {tb2eRecoveryShadowStatus,tb2eStandardRecoveryPlan,tb2eHungryThirstyRecoveryPlan} from "../module/m10d-tb2e-recovery-shadow.mjs";
import {tb2eTownRecoveryVenueModel,tb2eTownRecoveryVenuePlan} from "../module/m10d-tb2e-town-recovery-p33-shadow.mjs";
const names=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(names.map(id=>resolveRulesProfile(id)));
const unchanged=p=>{assert.equal(p.liveApplication,false); if(Object.hasOwn(p,"writesPlanned"))assert.equal(p.writesPlanned,0);else assert.deepEqual(p.writes,{actors:0,items:0,journals:0,settings:0});};
for(const status of [tb2eResourceShadowStatus(),tb2eConditionShadowStatus(),tb2eRecoveryShadowStatus()]){
  unchanged(status); assert.equal(status.coreReauditTargetedPhase,"M10D.18_P3.3");assert.equal(status.fullDomainReauditComplete,false);
}
// Resources/Fate/Persona — DH 60-61, SG 83-88
assert.equal(tb2eResourcesTestPlan({rating:0,obstacle:3,inHometown:true,treasureValue:0}).reasonCode,"RESOURCES_ZERO_REQUIRES_TREASURE");
const zero=tb2eResourcesTestPlan({rating:0,obstacle:3,treasureValue:2});
unchanged(zero);assert.equal(zero.ok,true);assert.equal(zero.finalDice,2);assert.equal(zero.resourcesZeroSpecialRoute,true);assert.equal(zero.onePassFromZeroAdvancesToOne,true);
const taxed=tb2eResourcesTaxPlan({rating:3,outcome:"FAIL",marginOfFailure:3,treasureValue:1});
assert.equal(taxed.finalTax,2);assert.equal(taxed.ratingAfter,1);assert.equal(taxed.eraseResourceAdvancementOnTax,true);
const protectedTax=tb2eResourcesTaxPlan({rating:3,outcome:"FAIL",marginOfFailure:2,treasureValue:2});
assert.equal(protectedTax.finalTax,0);assert.equal(protectedTax.eraseResourceAdvancementOnTax,false);
assert.equal(tb2eFateSpendPlan({use:"DEEPER_UNDERSTANDING",fateAvailable:1,wiseRelated:true,failedDiceAvailable:0}).reasonCode,"NO_ELIGIBLE_FAILED_DIE");
assert.equal(tb2eFateSpendPlan({use:"DEEPER_UNDERSTANDING",fateAvailable:1,wiseRelated:true,failedDiceAvailable:1,fateLuckAlreadyUsed:true}).reasonCode,"WISE_REROLL_MUST_PRECEDE_FATE_LUCK");
assert.equal(tb2ePersonaSpendPlan({use:"AH_OF_COURSE",personaAvailable:1,wiseRelated:true,failedDiceCount:0}).reasonCode,"NO_FAILED_DICE");
assert.equal(tb2ePersonaSpendPlan({use:"AH_OF_COURSE",personaAvailable:1,wiseRelated:true,failedDiceCount:2,fateLuckAlreadyUsed:true}).reasonCode,"WISE_REROLL_MUST_PRECEDE_FATE_LUCK");
// Conditions — SG 46-55
const m=tb2eConditionModel();unchanged(m);
assert.equal(m.conditions.DEAD.mayTest,false);assert.equal(m.conditions.DEAD.mayUseWises,false);
assert.equal(m.grind.extremeNewConditionEveryTurns,3);
assert.equal(m.grind.extremeDeathEligibleAfter,"EXHAUSTED");
assert.equal(m.conditions.EXHAUSTED.recoveryReference.phaseResolved,true);
const recover=tb2eConditionTestEffectPlan({conditions:["Injured","Sick"],test:"Will",isRecovery:true});
unchanged(recover);assert.equal(recover.diceModifier,0);assert.equal(recover.recoveryWillHealthPenaltyExempted,true);
assert.equal(tb2eConditionTestEffectPlan({conditions:["Injured","Sick"],test:"Health",isRecovery:true}).diceModifier,0);
assert.equal(tb2eConditionTestEffectPlan({conditions:["Injured","Sick"],test:"Skill"}).diceModifier,-2);
assert.equal(tb2eConditionTestEffectPlan({conditions:["Fresh","Angry"],test:"Skill"}).diceModifier,0);
const angryVs=tb2eConditionTestEffectPlan({conditions:["Angry"],test:"Skill",precisionOrSocial:true,isVersus:true});
assert.equal(angryVs.angryVersusSuccessModifier,-1);assert.equal(angryVs.angryObstacleGuidance,null);
const angryOb=tb2eConditionTestEffectPlan({conditions:["Angry"],test:"Skill",precisionOrSocial:true,isVersus:false});
assert.equal(angryOb.angryObstacleGuidance.value,1);
assert.equal(tb2eConditionTestEffectPlan({conditions:["Angry"],test:"Will",isRecovery:true,precisionOrSocial:true}).angryObstacleGuidance,null);
// Recovery — SG 47,49,55-57,102-105
assert.equal(tb2eStandardRecoveryPlan({condition:"Exhausted",phase:"Town",accommodation:"Inn"}).phaseSourceBoundary,"SG49_CAMP_AND_TOWN_VERIFIED");
assert.equal(tb2eStandardRecoveryPlan({condition:"Angry",phase:"Camp"}).failureMeaning,"CONDITION_REMAINS_NO_NEW_TWIST_OR_CONDITION_SG56");
const rations=tb2eHungryThirstyRecoveryPlan({phase:"Adventure",hasRations:true,hasWine:false});
assert.equal(rations.satisfied,true);assert.equal(rations.method,"EAT_OR_DRINK_IN_PEACE");
assert.equal(tb2eHungryThirstyRecoveryPlan({phase:"Adventure",hasWater:true}).satisfied,true);
assert.equal(tb2eHungryThirstyRecoveryPlan({phase:"Adventure",hasWine:true,safePause:false}).satisfied,false);
assert.equal(tb2eHungryThirstyRecoveryPlan({phase:"Adventure"}).satisfied,false);
assert.equal(tb2eHungryThirstyRecoveryPlan({phase:"Camp",foodSkill:"Hunter",cookPrepared:false,foodAcquired:true}).satisfied,true);
assert.equal(tb2eHungryThirstyRecoveryPlan({phase:"Camp",foodSkill:"Hunter",cookPrepared:true,foodAcquired:false}).satisfied,false);
const venues=tb2eTownRecoveryVenueModel();
assert.equal(Object.keys(venues).length,6);
for(const [venue,condition,auto,bonus,base] of [
 ["STABLES","ANGRY",false,0,1],
 ["TAVERN","HUNGRY_THIRSTY",true,0,1],
 ["FLOPHOUSE","INJURED",false,0,1],
 ["INN","AFRAID",false,1,2],
 ["HOTEL","EXHAUSTED",true,0,3],
 ["HOTEL","SICK",false,1,3]
]){
 const plan=tb2eTownRecoveryVenuePlan({venue,condition});
 unchanged(plan);assert.equal(plan.ok,true);assert.equal(plan.automaticRecovery,auto);assert.equal(plan.recoveryBonusDice,bonus);assert.equal(plan.baseLifestyleCost,base);
}
assert.equal(tb2eTownRecoveryVenuePlan({venue:"STREETS",condition:"AFRAID"}).reasonCode,"VENUE_DOES_NOT_SUPPORT_CONDITION_RECOVERY");
assert.equal(tb2eTownRecoveryVenuePlan({venue:"FLOPHOUSE",condition:"SICK"}).reasonCode,"VENUE_DOES_NOT_SUPPORT_CONDITION_RECOVERY");
assert.equal(tb2eTownRecoveryVenuePlan({venue:"HOME",condition:"ANGRY"}).reasonCode,"HOME_EQUIVALENT_LODGING_REQUIRES_GM_SELECTION");
const paid=tb2eTownRecoveryVenuePlan({venue:"INN",condition:"INJURED",freeTestsUsed:2,paidTestsRequested:1});
assert.equal(paid.ok,true);assert.equal(paid.totalLifestylePreview,3);
assert.equal(tb2eTownRecoveryVenuePlan({venue:"INN",condition:"INJURED",paidTestsRequested:2}).reasonCode,"PAID_RECOVERY_TEST_ALLOWANCE_EXCEEDED");
for(const file of ["module/m10d-tb2e-resources-shadow.mjs","module/m10d-tb2e-conditions-shadow.mjs","module/m10d-tb2e-recovery-shadow.mjs","module/m10d-tb2e-town-recovery-p33-shadow.mjs"]){
 const source=fs.readFileSync(file,"utf8");
 for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
 assert.equal(source.includes(forbidden),false,file+" must remain read-only");
}
assert.equal(JSON.stringify(names.map(id=>resolveRulesProfile(id))),before);
console.log("PASS M10D.18 P3.3 Resources zero/tax/Fate, Conditions penalties, Recovery food/Town venues; zero writes");
