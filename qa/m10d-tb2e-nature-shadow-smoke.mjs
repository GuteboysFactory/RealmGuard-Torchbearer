import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eChannelNaturePlan, tb2eChannelNatureTaxPlan, tb2eNatureAdvancementPlan, tb2eNatureLossPlan, tb2eNatureModel, tb2eNatureRecoveryPlan, tb2eNatureShadowStatus, tb2eNatureSubstitutionPlan, tb2eNatureSubstitutionTaxPlan } from "../module/m10d-tb2e-nature-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eNatureShadowStatus();
assert.equal(status.phase,"M10D.5");assert.equal(status.mode,"TB2E_NATURE_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.coreSourceClassification,"VERIFIED");assert.equal(status.coreReconciliationPhase,"M10D.18_P1");assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eNatureModel();
assert.deepEqual(model.ratingRange,{min:0,max:7});assert.equal(model.startingNatureGuide,3);assert.equal(model.currentMaximumSeparated,true);
assert.deepEqual(model.stockDescriptors.dwarf,["Delving","Crafting","Avenging Grudges"]);
assert.deepEqual(model.stockDescriptors.elf,["Singing","Remembering","Hiding"]);
assert.deepEqual(model.stockDescriptors.halfling,["Sneaking","Riddling","Merrymaking"]);
assert.deepEqual(model.stockDescriptors.human,["Boasting","Demanding","Running"]);
assert.equal(model.advancementBasis,"MAXIMUM_NATURE");

const within=tb2eNatureSubstitutionPlan({currentNature:4,maximumNature:5,descriptorApplies:true,targetSkillUnavailable:true});
assert.equal(within.ok,true);assert.equal(within.dice,4);assert.equal(within.onFailTax.kind,"NONE");
const outside=tb2eNatureSubstitutionPlan({currentNature:4,maximumNature:5,descriptorApplies:false,targetSkillRatingZero:true});
assert.equal(outside.ok,true);assert.equal(outside.dice,4);assert.equal(outside.onFailTax.kind,"MARGIN_OF_FAILURE");
assert.equal(tb2eNatureSubstitutionPlan({currentNature:4,maximumNature:5,descriptorApplies:true}).reasonCode,"NATURE_SUBSTITUTION_REQUIRES_UNAVAILABLE_OR_ZERO_SKILL");
const outsideFail=tb2eNatureSubstitutionTaxPlan({currentNature:4,maximumNature:5,descriptorApplies:false,outcome:"FAIL",marginOfFailure:2});
assert.equal(outsideFail.taxAmount,2);assert.equal(outsideFail.currentAfter,2);assert.equal(outsideFail.taxMutationCommitted,false);

const channel=tb2eChannelNaturePlan({currentNature:4,maximumNature:5,testName:"Scout",descriptorApplies:false,personaAvailable:1});
assert.equal(channel.ok,true);assert.equal(channel.diceAdded,4);assert.equal(channel.resourceCost,"PERSONA");assert.equal(channel.resourceAmount,1);
assert.equal(channel.onPassTax.amount,1);assert.equal(channel.onFailTax.kind,"MARGIN_OF_FAILURE");assert.equal(channel.resourceSpendCommitted,false);
assert.equal(tb2eChannelNaturePlan({currentNature:4,maximumNature:5,testName:"Resources",personaAvailable:1}).reasonCode,"CHANNEL_NATURE_FORBIDDEN_TEST");
assert.equal(tb2eChannelNaturePlan({currentNature:4,maximumNature:5,testName:"Scout",personaAvailable:0}).reasonCode,"INSUFFICIENT_PERSONA");
const channelFail=tb2eChannelNatureTaxPlan({currentNature:4,maximumNature:5,descriptorApplies:false,outcome:"FAIL",marginOfFailure:3});
assert.equal(channelFail.taxAmount,3);assert.equal(channelFail.currentAfter,1);
const channelWithin=tb2eChannelNatureTaxPlan({currentNature:4,maximumNature:5,descriptorApplies:true,outcome:"FAIL",marginOfFailure:3});
assert.equal(channelWithin.taxAmount,0);assert.equal(channelWithin.currentAfter,4);

const respite=tb2eNatureRecoveryPlan({method:"RESPITE",currentNature:2,maximumNature:5});
assert.equal(respite.currentAfter,5);assert.equal(respite.maximumAfter,5);
const prologue=tb2eNatureRecoveryPlan({method:"PROLOGUE",currentNature:3,maximumNature:5,noConditions:true,deliveredPrologue:true});
assert.equal(prologue.currentAfter,4);
assert.equal(tb2eNatureRecoveryPlan({method:"PROLOGUE",currentNature:3,maximumNature:5,noConditions:false,deliveredPrologue:true}).reasonCode,"NATURE_RECOVERY_REQUIREMENTS_NOT_MET");
const missed=tb2eNatureRecoveryPlan({method:"MISSED_SESSION_RETURN",currentNature:3,maximumNature:5,missedLastSession:true});
assert.equal(missed.currentAfter,4);
const town=tb2eNatureRecoveryPlan({method:"LEAVING_TOWN",currentNature:3,maximumNature:5,noConditions:true,passedLifestyle:true});
assert.equal(town.currentAfter,4);
const conserve=tb2eNatureRecoveryPlan({method:"CONSERVE",currentNature:1,maximumNature:5});
assert.equal(conserve.maximumAfter,4);assert.equal(conserve.currentAfter,4);assert.equal(conserve.traitChangeRequired,false);

const loss=tb2eNatureLossPlan({currentNature:0,maximumNature:3,reachedZeroDueToTax:true});
assert.equal(loss.maximumAfter,2);assert.equal(loss.currentAfter,2);assert.equal(loss.changeOneNonClassTrait,true);assert.equal(loss.traitLevelUnchanged,true);assert.equal(loss.eraseTax,true);assert.equal(loss.eraseNatureAdvancement,true);
const finalLoss=tb2eNatureLossPlan({currentNature:0,maximumNature:1,reachedZeroDueToTax:true});
assert.equal(finalLoss.retirementRequired,true);assert.equal(finalLoss.retirementTiming,"END_OF_ADVENTURE");

const advance=tb2eNatureAdvancementPlan({currentNature:3,maximumNature:5,advancementTriggered:true});
assert.equal(advance.currentAfter,4);assert.equal(advance.maximumAfter,6);assert.equal(advance.taxDifferenceBefore,2);assert.equal(advance.taxDifferenceAfter,2);
const advanceToSeven=tb2eNatureAdvancementPlan({currentNature:5,maximumNature:6,advancementTriggered:true});
assert.equal(advanceToSeven.retirementCheckRequired,true);assert.equal(advanceToSeven.retirementTiming,"END_OF_SESSION");
assert.equal(tb2eNatureAdvancementPlan({currentNature:7,maximumNature:7,advancementTriggered:true}).reasonCode,"MAXIMUM_NATURE_AT_CAP");

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-nature-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.5 TB2E Nature shadow · substitution · channel/tax · recovery/conserve · loss · advancement · zero writes");
