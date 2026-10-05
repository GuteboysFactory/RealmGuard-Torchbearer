import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eConditionCapabilityPlan, tb2eConditionDeathRiskPlan, tb2eConditionInfo, tb2eConditionModel, tb2eConditionShadowStatus, tb2eConditionTestEffectPlan, tb2eConditionZeroRatingPlan, tb2eConflictDispositionConditionPlan } from "../module/m10d-tb2e-conditions-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eConditionShadowStatus();
assert.equal(status.phase,"M10D.8");assert.equal(status.mode,"TB2E_CONDITIONS_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});
assert.deepEqual(status.unresolvedSourceConflicts,["CONFLICT_DISPOSITION_PENALTY_QR41_44_VS_QR51"]);

const model=tb2eConditionModel();
assert.deepEqual(model.grind.order,["FRESH","HUNGRY_THIRSTY","EXHAUSTED","ANGRY","SICK","INJURED","AFRAID","DEAD"]);
assert.equal(model.grind.newConditionEveryTurns,4);
assert.deepEqual(model.recovery.order,["HUNGRY_THIRSTY","ANGRY","AFRAID","EXHAUSTED","INJURED_OR_SICK"]);
assert.equal(model.conditions.DEAD.detailsAuthority,"SOURCE_INCOMPLETE_ORDER_PLACEMENT_ONLY");
assert.equal(model.conditions.EXHAUSTED.recoveryReference.phaseText,"CAMP_TEST");
assert.equal(model.conditions.EXHAUSTED.recoveryReference.phaseResolved,false);
assert.equal(model.conflictDispositionBoundary.status,"UNRESOLVED_SOURCE_CONFLICT");assert.equal(model.conflictDispositionBoundary.automation,false);

const fresh=tb2eConditionTestEffectPlan({conditions:["Fresh"],test:"Skill"});
assert.equal(fresh.diceModifier,1);assert.equal(fresh.components[0].condition,"FRESH");
const freshResources=tb2eConditionTestEffectPlan({conditions:["Fresh"],test:"Resources"});
assert.equal(freshResources.diceModifier,0);
const hurt=tb2eConditionTestEffectPlan({conditions:["Injured","Sick"],test:"Health"});
assert.equal(hurt.diceModifier,-2);assert.equal(hurt.components.length,2);
const angry=tb2eConditionTestEffectPlan({conditions:["Angry"],test:"Skill",precisionOrSocial:true,isRecovery:false});
assert.equal(angry.obstacleModifierAutomated,0);assert.equal(angry.angryObstacleGuidance.value,1);assert.equal(angry.angryObstacleGuidance.automation,"GM_DISCRETION");
const angryRecovery=tb2eConditionTestEffectPlan({conditions:["Angry"],test:"Will",precisionOrSocial:true,isRecovery:true});
assert.equal(angryRecovery.angryObstacleGuidance,null);

assert.equal(tb2eConditionCapabilityPlan({conditions:["Angry"],capability:"BENEFICIAL_TRAIT"}).reasonCode,"ANGRY_BLOCKS_BENEFICIAL_TRAITS");
assert.equal(tb2eConditionCapabilityPlan({conditions:["Angry"],capability:"BENEFICIAL_WISE"}).reasonCode,"ANGRY_BLOCKS_BENEFICIAL_WISES");
const afraidBL=tb2eConditionCapabilityPlan({conditions:["Afraid"],capability:"BEGINNERS_LUCK"});
assert.equal(afraidBL.allowed,false);assert.equal(afraidBL.natureFallbackForUnlearnedSkills,true);
assert.equal(tb2eConditionCapabilityPlan({conditions:["Afraid"],capability:"HELP"}).reasonCode,"AFRAID_BLOCKS_HELP");
assert.equal(tb2eConditionCapabilityPlan({conditions:["Sick"],capability:"ADVANCEMENT_LOGGING"}).reasonCode,"SICK_BLOCKS_ADVANCEMENT_LOGGING");
const instinct=tb2eConditionCapabilityPlan({conditions:["Exhausted"],capability:"FREE_INSTINCT"});
assert.equal(instinct.allowed,false);assert.equal(instinct.turnCost,1);assert.equal(instinct.obstacleModifier,1);

const zero=tb2eConditionZeroRatingPlan({ratingAfterConditions:0,target:"Skill"});
assert.equal(zero.atZero,true);assert.equal(zero.mayTest,false);assert.equal(zero.mayBenefitFrom,false);assert.equal(zero.mayGrantHelp,false);assert.equal(zero.maySpendPersonaOn,false);assert.equal(zero.natureFallbackAvailable,true);
const nonzero=tb2eConditionZeroRatingPlan({ratingAfterConditions:1,target:"Will"});assert.equal(nonzero.mayTest,true);

const conflict=tb2eConflictDispositionConditionPlan({conditions:["Hungry and Thirsty","Exhausted","Injured","Sick"]});
assert.equal(conflict.resolution,"UNRESOLVED_SOURCE_CONFLICT");assert.equal(conflict.automation,false);assert.equal(conflict.qr41_44.HUNGRY_THIRSTY,"-1s");assert.equal(conflict.qr41_44.EXHAUSTED,"-1s");
assert.equal(conflict.qr51.HUNGRY_THIRSTY,"-1D");assert.equal(conflict.qr51.EXHAUSTED,"-1D");assert.equal(conflict.qr51.INJURED,"-1D");assert.equal(conflict.qr51.SICK,"-1D");assert.equal(conflict.chosenPenalty,null);

const risk=tb2eConditionDeathRiskPlan({conditions:["Injured","Sick"],testInvolvesSeriousHarm:true,testInvolvesSicknessDiseasePoisonMadnessOrGrief:true});
assert.equal(risk.injuredSeriousHarm.applies,true);assert.equal(risk.injuredSeriousHarm.warnPlayerBeforehand,true);assert.equal(risk.injuredSeriousHarm.automation,false);
assert.equal(risk.sickRelevantThreat.applies,true);assert.equal(risk.sickRelevantThreat.nextCondition,"DEAD");assert.equal(risk.sickRelevantThreat.automation,false);
assert.equal(risk.deathMutationCommitted,false);assert.equal(risk.conditionMutationCommitted,false);

assert.equal(tb2eConditionInfo("Fear").condition,"AFRAID");
assert.equal(tb2eConditionInfo("unknown").reasonCode,"UNKNOWN_OR_UNSOURCED_CONDITION");
assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-conditions-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.8 TB2E Conditions shadow · orders · effects · capability blocks · zero-rating boundary · unresolved disposition source conflict · death-risk guidance · zero writes");
