import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eAbilityInfo, tb2eAbilitySkillModel, tb2eAbilitySkillShadowStatus, tb2eAdvancementThresholdPlan, tb2eBeginnersLuckAbilityPlan, tb2eNewSkillLearningPlan, tb2eSkillInfo } from "../module/m10d-tb2e-abilities-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eAbilitySkillShadowStatus();
assert.equal(status.phase,"M10D.6");assert.equal(status.mode,"TB2E_ABILITIES_SKILLS_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eAbilitySkillModel();
assert.deepEqual(model.abilities.WILL.ratingRange,{min:1,max:6});assert.deepEqual(model.abilities.HEALTH.ratingRange,{min:1,max:6});
assert.equal(model.abilities.RESOURCES.ratingRange.max,10);assert.equal(model.abilities.CIRCLES.ratingRange.max,10);
assert.equal(model.abilities.PRECEDENCE.kind,"FIXED_VALUE");assert.equal(model.abilities.MIGHT.kind,"FIXED_VALUE");
assert.equal(model.skills.maxKnown,24);assert.deepEqual(model.skills.ratingRange,{min:1,max:6});assert.equal(model.skills.names.length,33);
assert.equal(new Set([...model.beginnersLuck.WILL,...model.beginnersLuck.HEALTH]).size,33);
assert.equal(model.skills.names.every(name=>model.beginnersLuck.WILL.includes(name)||model.beginnersLuck.HEALTH.includes(name)),true);
assert.equal(model.skills.fullDescriptionsAuthority,"UNAVAILABLE_DG160");

const will=tb2eAbilityInfo("Will");assert.equal(will.ok,true);assert.equal(will.kind,"RAW");assert.equal(will.phaseContext,"ADVENTURE");assert.equal(will.recoveryReference.Anger,2);
const resources=tb2eAbilityInfo("Resources");assert.equal(resources.ok,true);assert.equal(resources.kind,"TOWN");assert.equal(resources.specialRulesDomain,"resources");
assert.equal(tb2eAbilityInfo("Dexterity").reasonCode,"UNKNOWN_ABILITY");

const scout=tb2eSkillInfo("Scout");assert.equal(scout.ok,true);assert.equal(scout.beginnersLuckAbility,"WILL");assert.equal(scout.obstacleFactorsAvailable,false);
const fighter=tb2eSkillInfo("Fighter");assert.equal(fighter.beginnersLuckAbility,"HEALTH");
assert.equal(tb2eSkillInfo("Stealth").reasonCode,"UNKNOWN_OR_UNSOURCED_SKILL");

const blWill=tb2eBeginnersLuckAbilityPlan({skillName:"Scout",abilityRating:4});assert.equal(blWill.ok,true);assert.equal(blWill.ability,"WILL");assert.equal(blWill.learningTrackRequired,true);
const blHealth=tb2eBeginnersLuckAbilityPlan({skillName:"Fighter",abilityRating:5});assert.equal(blHealth.ability,"HEALTH");
assert.equal(tb2eBeginnersLuckAbilityPlan({skillName:"Scout",abilityRating:0}).reasonCode,"ABILITY_ZERO_DUE_TO_INJURY_OR_SICKNESS_OR_OTHER_ZERO_STATE");

const learning=tb2eNewSkillLearningPlan({skillName:"Scout",beginnersLuckAttempts:3,maximumNature:5});
assert.equal(learning.ok,true);assert.equal(learning.requiredAttempts,5);assert.equal(learning.remainingAttempts,2);assert.equal(learning.ready,false);assert.equal(learning.learnedRating,null);
const learned=tb2eNewSkillLearningPlan({skillName:"Scout",beginnersLuckAttempts:5,maximumNature:5});
assert.equal(learned.ready,true);assert.equal(learned.learnedRating,2);assert.equal(learned.skillCreationCommitted,false);
assert.equal(tb2eNewSkillLearningPlan({skillName:"Scout",beginnersLuckAttempts:0,maximumNature:0}).reasonCode,"MAXIMUM_NATURE_ZERO_RETIRED_STATE");

const skillAdvance=tb2eAdvancementThresholdPlan({kind:"SKILL",rating:4});
assert.equal(skillAdvance.requiredPassedTests,4);assert.equal(skillAdvance.requiredFailedTests,3);assert.equal(skillAdvance.advanceTo,5);
const healthCap=tb2eAdvancementThresholdPlan({kind:"HEALTH",rating:6});assert.equal(healthCap.atCap,true);assert.equal(healthCap.advanceTo,null);
const resourcesZero=tb2eAdvancementThresholdPlan({kind:"RESOURCES",rating:0});
assert.equal(resourcesZero.route,"ZERO_TO_ONE_SPECIAL");assert.equal(resourcesZero.beginnersLuckAllowed,false);assert.equal(resourcesZero.requiredPassedTests,1);
const circles=tb2eAdvancementThresholdPlan({kind:"CIRCLES",rating:3});assert.equal(circles.requiredPassedTests,3);assert.equal(circles.requiredFailedTests,2);assert.equal(circles.cap,10);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-abilities-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.6 TB2E Abilities/Skills shadow · 33 skills · BL Will/Health mapping · learning threshold · advancement thresholds · source boundaries · zero writes");
