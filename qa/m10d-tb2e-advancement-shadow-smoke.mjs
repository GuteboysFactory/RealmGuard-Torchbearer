import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eAdvancementMarkPlan, tb2eAdvancementModel, tb2eAdvancementResetPlan, tb2eAdvancementShadowStatus, tb2eAdvancementThresholdPlan, tb2eGroupAdvancementChoicePlan, tb2eLevelProgressionBoundaryPlan, tb2eNatureAdvancementShadowPlan, tb2eNewSkillLearningAdvancementPlan, tb2eResourcesCirclesZeroToOnePlan } from "../module/m10d-tb2e-advancement-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eAdvancementShadowStatus();
assert.equal(status.phase,"M10D.11");assert.equal(status.mode,"TB2E_ADVANCEMENT_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eAdvancementModel();
assert.equal(model.standard.skillAbilityCap,6);assert.equal(model.standard.resourcesCirclesCap,10);
assert.equal(model.countEligibility.obstacleZeroCounts,false);assert.equal(model.countEligibility.versusCombatCounts,true);
assert.equal(model.countEligibility.campTownMaxCountedTests,1);assert.equal(model.countEligibility.conflictOrSeriesMaxCountedTests,1);
assert.equal(model.nature.thresholdBasis,"MAXIMUM_NATURE");assert.equal(model.newSkills.learnedRating,2);
assert.equal(model.levels.totalLevels,10);assert.equal(model.levels.thresholdTableAuthority,"VISUAL_TABLE_NOT_TRANSCRIBED");

const skill4=tb2eAdvancementThresholdPlan({kind:"Skill",rating:4,passed:4,failed:3});
assert.equal(skill4.ready,true);assert.equal(skill4.advanceTo,5);assert.equal(skill4.eraseMarksOnAdvance,true);
const health6=tb2eAdvancementThresholdPlan({kind:"Health",rating:6,passed:99,failed:99});
assert.equal(health6.atCap,true);assert.equal(health6.ready,false);assert.equal(health6.advanceTo,6);
const resources0=tb2eAdvancementThresholdPlan({kind:"Resources",rating:0,passed:1,failed:0});
assert.equal(resources0.route,"ZERO_TO_ONE_SPECIAL");assert.equal(resources0.ready,true);assert.equal(resources0.advanceTo,1);assert.equal(resources0.beginnersLuckAllowed,false);
const circles3=tb2eAdvancementThresholdPlan({kind:"Circles",rating:3,passed:3,failed:2});
assert.equal(circles3.ready,true);assert.equal(circles3.advanceTo,4);assert.equal(circles3.cap,10);

const ob0=tb2eAdvancementMarkPlan({outcome:"PASS",obstacle:0,context:"CONFLICT",versusCombat:false});
assert.equal(ob0.count,false);assert.equal(ob0.reasonCode,"OBSTACLE_ZERO_DOES_NOT_COUNT");
const versus=tb2eAdvancementMarkPlan({outcome:"PASS",obstacle:0,context:"CONFLICT",versusCombat:true});
assert.equal(versus.count,true);assert.equal(versus.mark,"PASS");
const tie=tb2eAdvancementMarkPlan({outcome:"TIE",obstacle:3});
assert.equal(tie.count,false);assert.equal(tie.reasonCode,"UNBROKEN_TIE_DOES_NOT_COUNT");
const brokenTie=tb2eAdvancementMarkPlan({outcome:"TIE",obstacle:3,tieBroken:true,resolvedTieOutcome:"FAIL"});
assert.equal(brokenTie.count,true);assert.equal(brokenTie.mark,"FAIL");
const campFirst=tb2eAdvancementMarkPlan({outcome:"PASS",obstacle:2,context:"CAMP",alreadyCountedInContext:false});
assert.equal(campFirst.count,true);assert.equal(campFirst.contextLimit,1);
const campSecond=tb2eAdvancementMarkPlan({outcome:"FAIL",obstacle:2,context:"CAMP",alreadyCountedInContext:true});
assert.equal(campSecond.count,false);assert.equal(campSecond.reasonCode,"CONTEXT_COUNT_LIMIT_REACHED");

const mixed=tb2eGroupAdvancementChoicePlan({passedAgainst:2,failedAgainst:1,choice:"Fail"});
assert.equal(mixed.mixed,true);assert.equal(mixed.chosenMark,"FAIL");
const allPass=tb2eGroupAdvancementChoicePlan({passedAgainst:3,failedAgainst:0});
assert.equal(allPass.mixed,false);assert.equal(allPass.chosenMark,"PASS");

const nature=tb2eNatureAdvancementShadowPlan({currentNature:3,maximumNature:4,passed:4,failed:3});
assert.equal(nature.ready,true);assert.equal(nature.currentAfter,4);assert.equal(nature.maximumAfter,5);assert.equal(nature.taxBefore,1);assert.equal(nature.taxAfter,1);assert.equal(nature.natureMutationCommitted,false);

const learning=tb2eNewSkillLearningAdvancementPlan({attempts:5,maximumNature:5});
assert.equal(learning.ready,true);assert.equal(learning.learnedRating,2);assert.equal(learning.eraseLearningMarksOnLearn,true);assert.equal(learning.skillCreationCommitted,false);

const zeroOne=tb2eResourcesCirclesZeroToOnePlan({kind:"Circles",passedTests:1,diceSources:["Reputation","Cash"]});
assert.equal(zeroOne.ready,true);assert.equal(zeroOne.advanceTo,1);assert.equal(zeroOne.beginnersLuckAllowed,false);
const zeroOneNoSource=tb2eResourcesCirclesZeroToOnePlan({kind:"Resources",passedTests:1,diceSources:[]});
assert.equal(zeroOneNoSource.ready,false);assert.equal(zeroOneNoSource.hasSource,false);

const resetAdvance=tb2eAdvancementResetPlan({reason:"Advancement"});
assert.equal(resetAdvance.erasePassedTests,true);assert.equal(resetAdvance.eraseFailedTests,true);assert.equal(resetAdvance.markMutationCommitted,false);
const resetLoss=tb2eAdvancementResetPlan({reason:"Rating Loss"});assert.equal(resetLoss.reason,"RATING_LOSS");

const level=tb2eLevelProgressionBoundaryPlan({currentLevel:3,inTown:true,spentFate:5,spentPersona:4});
assert.equal(level.maximumLevel,10);assert.equal(level.levelUpPhase,"TOWN_ONLY");assert.equal(level.progressionBasis,"CUMULATIVE_SPENT_FATE_AND_PERSONA");
assert.equal(level.exactNextThreshold,null);assert.equal(level.eligibleForExactLevelUp,null);assert.equal(level.thresholdTableAuthority,"VISUAL_TABLE_NOT_TRANSCRIBED");assert.equal(level.levelMutationCommitted,false);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-advancement-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.11 TB2E Advancement shadow · thresholds · count eligibility · group choice · Nature · new Skill · Resources/Circles 0-to-1 · reset · level boundary · zero writes");
