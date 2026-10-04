import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eEndSessionAwardPlan, tb2eFateSpendPlan, tb2eLifestyleResourcesPlan, tb2ePersonaSpendPlan, tb2eResourceModel, tb2eResourceShadowStatus, tb2eResourcesTaxPlan, tb2eResourcesTestPlan } from "../module/m10d-tb2e-resources-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eResourceShadowStatus();
assert.equal(status.phase,"M10D.7");assert.equal(status.mode,"TB2E_FATE_PERSONA_RESOURCES_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eResourceModel();
assert.equal(model.fatePersona.earnedTiming,"END_OF_SESSION");assert.equal(model.fatePersona.spentTowardLeveling,true);
assert.equal(model.persona.spends.ADVANTAGE.max,3);assert.deepEqual(model.persona.spends.CHANNEL_NATURE.blockedTests,["RESOURCES","CIRCLES"]);
assert.deepEqual(model.resources.ratingRange,{min:0,max:10});assert.equal(model.resources.hometownBonusDice,1);assert.equal(model.resources.beginnersLuckAllowed,false);

const awards=tb2eEndSessionAwardPlan({actingOnBelief:true,workingTowardGoal:true,benefitingFromInstinct:true,gallowsHumor:true,crisis:true,mvp:true});
assert.equal(awards.ok,true);assert.equal(awards.fateTotal,4);assert.equal(awards.personaTotal,2);assert.equal(awards.awardMutationCommitted,false);
assert.equal(tb2eEndSessionAwardPlan({actingOnBelief:true,playingAgainstBelief:true}).reasonCode,"BELIEF_REWARDS_DO_NOT_STACK");
assert.equal(tb2eEndSessionAwardPlan({workingTowardGoal:true,accomplishingGoal:true}).reasonCode,"GOAL_REWARDS_DO_NOT_STACK");
assert.equal(tb2eEndSessionAwardPlan({mvp:true,teamworker:true}).reasonCode,"MVP_AND_TEAMWORKER_MUST_BE_DIFFERENT_PLAYERS");

const luck=tb2eFateSpendPlan({use:"LUCK",fateAvailable:1,dice:[2,6,6]});
assert.equal(luck.ok,true);assert.equal(luck.sixCount,2);assert.equal(luck.initialExtraDice,2);assert.equal(luck.resourceSpendCommitted,false);
const deeper=tb2eFateSpendPlan({use:"DEEPER_UNDERSTANDING",fateAvailable:1,wiseRelated:true});
assert.equal(deeper.ok,true);assert.equal(deeper.rerollFailedDice,1);
const synergy=tb2eFateSpendPlan({use:"SYNERGY",fateAvailable:1,helpingAnotherPlayer:true,resolvedOutcome:"TIE"});
assert.equal(synergy.ok,true);assert.equal(synergy.tiePolicy,"RETRACT_FATE_OR_USE_TIEBREAKER");assert.equal(synergy.advancementMutationCommitted,false);
assert.equal(tb2eFateSpendPlan({use:"DEEPER_UNDERSTANDING",fateAvailable:1,wiseRelated:false}).reasonCode,"WISE_RELATION_REQUIRED");

const advantage=tb2ePersonaSpendPlan({use:"ADVANTAGE",personaAvailable:3,amount:3});
assert.equal(advantage.ok,true);assert.equal(advantage.diceAdded,3);assert.equal(advantage.resourceSpendCommitted,false);
assert.equal(tb2ePersonaSpendPlan({use:"ADVANTAGE",personaAvailable:3,amount:4}).reasonCode,"ADVANTAGE_PERSONA_AMOUNT_OUT_OF_RANGE");
const channel=tb2ePersonaSpendPlan({use:"CHANNEL_NATURE",personaAvailable:1,currentNature:4,testName:"Scout"});
assert.equal(channel.ok,true);assert.equal(channel.diceAdded,4);assert.equal(channel.delegatedRuleAuthority,"M10D.5_NATURE_SHADOW");
assert.equal(tb2ePersonaSpendPlan({use:"CHANNEL_NATURE",personaAvailable:1,currentNature:4,testName:"Resources"}).reasonCode,"CHANNEL_NATURE_FORBIDDEN_TEST");
const ofCourse=tb2ePersonaSpendPlan({use:"AH_OF_COURSE",personaAvailable:1,wiseRelated:true,failedDiceCount:3});
assert.equal(ofCourse.ok,true);assert.equal(ofCourse.extraDice,3);assert.equal(ofCourse.rerollExecuted,false);

const resourceTest=tb2eResourcesTestPlan({rating:2,obstacle:4,inHometown:true,treasureValue:3});
assert.equal(resourceTest.ok,true);assert.equal(resourceTest.finalDice,6);assert.equal(resourceTest.treasureTaxInsulation,3);assert.equal(resourceTest.treasureConsumptionCommitted,false);
const taxed=tb2eResourcesTaxPlan({rating:3,outcome:"FAIL",marginOfFailure:4,treasureValue:2});
assert.equal(taxed.baseTax,4);assert.equal(taxed.taxPrevented,2);assert.equal(taxed.finalTax,2);assert.equal(taxed.ratingAfter,1);assert.equal(taxed.taxMutationCommitted,false);
const insulated=tb2eResourcesTaxPlan({rating:1,outcome:"FAIL",marginOfFailure:2,treasureValue:3});
assert.equal(insulated.finalTax,0);assert.equal(insulated.ratingAfter,1);

const lifestyleFresh=tb2eLifestyleResourcesPlan({lifestyleCost:0,outcome:"PASS",hasConditions:false,currentNature:4,maximumNature:4});
assert.equal(lifestyleFresh.obstacle,1);assert.equal(lifestyleFresh.passBenefit,"BECOME_FRESH");
const lifestyleNature=tb2eLifestyleResourcesPlan({lifestyleCost:3,outcome:"PASS",hasConditions:false,currentNature:3,maximumNature:4});
assert.equal(lifestyleNature.passBenefit,"RECOVER_ONE_TAXED_NATURE");
const lifestyleFail=tb2eLifestyleResourcesPlan({lifestyleCost:3,outcome:"FAIL",hasConditions:false,currentNature:4,maximumNature:4});
assert.deepEqual(lifestyleFail.failureOptions,["TWIST","CONDITION","TAX"]);assert.equal(lifestyleFail.failureAdjudication,"GM_CHOICE_SOURCE_BOUNDARY");

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-resources-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.7 TB2E Fate/Persona/Resources shadow · awards · Fate spends · Persona spends · Resources pool/tax · Lifestyle guidance · zero writes");
