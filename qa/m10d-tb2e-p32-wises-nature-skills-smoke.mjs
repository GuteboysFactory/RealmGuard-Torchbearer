import assert from "node:assert/strict";
import fs from "node:fs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {tb2eWiseCombinationPlan as wiseCombination} from "../module/m10d-tb2e-wises-p32-shadow.mjs";
import {tb2eWiseAidPlan, tb2eWiseRerollPlan, tb2eWiseCyclePlan, tb2eWiseShadowStatus} from "../module/m10d-tb2e-wise-shadow.mjs";
import {tb2eNatureModel,tb2eNatureRecoveryPlan,tb2eNatureAdvancementPlan,tb2eNatureShadowStatus} from "../module/m10d-tb2e-nature-shadow.mjs";
import {tb2eAbilitySkillModel,tb2eSkillInfo,tb2eNewSkillLearningPlan,tb2eAbilitySkillShadowStatus} from "../module/m10d-tb2e-abilities-shadow.mjs";
import {tb2eSkillEquipmentPlan as equipment} from "../module/m10d-tb2e-skills-equipment-p32-shadow.mjs";
const profiles=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(profiles.map(id=>resolveRulesProfile(id)));
const immutable=p=>{assert.equal(p.liveApplication,false);if(Object.hasOwn(p,"writesPlanned"))assert.equal(p.writesPlanned,0);else assert.deepEqual(p.writes,{actors:0,items:0,journals:0,settings:0});};
for(const status of [tb2eWiseShadowStatus(),tb2eNatureShadowStatus(),tb2eAbilitySkillShadowStatus()]){
 immutable(status);assert.equal(status.coreReauditTargetedPhase,"M10D.18_P3.2");assert.equal(status.fullDomainReauditComplete,false);
}
// Wises, DH 76-78 and SG 87-88
const combos=wiseCombination({knownWises:2,uses:[
 {wiseId:"orc-wise",effect:"I_AM_WISE",related:true},
 {wiseId:"cave-wise",effect:"DEEPER_UNDERSTANDING",related:true}
]});
immutable(combos);assert.equal(combos.ok,true);assert.equal(combos.eachEffectUsedAtMostOnce,true);
assert.equal(wiseCombination({knownWises:5}).reasonCode,"INVALID_WISE_COUNT");
assert.equal(wiseCombination({knownWises:1,uses:[
 {wiseId:"orc-wise",effect:"I_AM_WISE",related:true},
 {wiseId:"orc-wise",effect:"DEEPER_UNDERSTANDING",related:true}
]}).reasonCode,"WISE_NOT_OWNED");
assert.equal(wiseCombination({knownWises:2,uses:[
 {wiseId:"orc-wise",effect:"I_AM_WISE",related:true},
 {wiseId:"orc-wise",effect:"DEEPER_UNDERSTANDING",related:true}
]}).reasonCode,"SAME_WISE_CANNOT_BE_USED_TWICE_ON_ONE_TEST");
assert.equal(wiseCombination({knownWises:2,uses:[
 {wiseId:"orc-wise",effect:"I_AM_WISE",related:true},
 {wiseId:"cave-wise",effect:"I_AM_WISE",related:true}
]}).reasonCode,"WISE_EFFECT_ALREADY_USED_ON_THIS_TEST");
assert.equal(wiseCombination({knownWises:1,ordinaryHelpProvided:true,uses:[
 {wiseId:"orc-wise",effect:"I_AM_WISE",related:true}
]}).reasonCode,"WISE_AID_AND_HELP_MUTUALLY_EXCLUSIVE");
assert.equal(wiseCombination({knownWises:1,uses:[
 {wiseId:"orc-wise",effect:"I_AM_WISE",related:false}
]}).reasonCode,"UNVERIFIED_WISE_ID_EFFECT_OR_RELEVANCE");
assert.equal(tb2eWiseAidPlan({alsoProvidingHelp:true}).reasonCode,"WISE_AID_AND_HELP_MUTUALLY_EXCLUSIVE");
assert.equal(tb2eWiseRerollPlan("Deeper Understanding",{failedDice:1,fateLuckAlreadyUsed:true}).reasonCode,"DEEPER_MUST_PRECEDE_FATE_LUCK");
assert.equal(tb2eWiseRerollPlan("Of Course",{failedDice:1,fateLuckAlreadyUsed:true}).reasonCode,"OF_COURSE_MUST_PRECEDE_FATE_LUCK");
assert.equal(tb2eWiseRerollPlan("Of Course",{failedDice:2}).mustPrecedeFateLuck,true);
assert.equal(tb2eWiseRerollPlan("Deeper Understanding",{failedDice:1}).mustPrecedeFateLuck,true);
assert.equal(tb2eWiseCyclePlan({iAmWisePass:true,iAmWiseFail:true,deeperUnderstanding:true,ofCourse:true}).completionTiming,"ON_COMPLETING_FOUR_REQUIRED_USES");
// Nature, DH 65-70 and SG 25
const nature=tb2eNatureModel();immutable(nature);
assert.equal(nature.alternateDescriptors.dwarf,"Negotiating");
assert.equal(nature.alternateDescriptors.elf,"Enchanting");
assert.equal(nature.alternateDescriptors.halfling,"Hoarding");
assert.equal(nature.alternateDescriptors.human,null);
assert.equal(nature.lowerRetirementBoundary.timing,"END_OF_ADVENTURE");
assert.equal(tb2eNatureRecoveryPlan({method:"MISSED_SESSION_RETURN",currentNature:2,maximumNature:4,missedLastSession:true,noConditions:false}).reasonCode,"NATURE_RECOVERY_REQUIREMENTS_NOT_MET");
assert.equal(tb2eNatureRecoveryPlan({method:"MISSED_SESSION_RETURN",currentNature:2,maximumNature:4,missedLastSession:true,noConditions:true}).currentAfter,3);
const conserveZero=tb2eNatureRecoveryPlan({method:"CONSERVE",currentNature:1,maximumNature:1});
immutable(conserveZero);assert.equal(conserveZero.maximumAfter,0);assert.equal(conserveZero.retirementRequired,true);assert.equal(conserveZero.retirementTiming,"END_OF_ADVENTURE");
assert.equal(tb2eNatureAdvancementPlan({currentNature:6,maximumNature:6,advancementTriggered:true}).retirementTiming,"END_OF_SESSION_IF_STILL_AT_SEVEN");
// Skill source status, capacity and gear, DH 72-75, 160-176
const skills=tb2eAbilitySkillModel();immutable(skills);
assert.equal(skills.skills.maxKnown,24);
assert.equal(skills.skills.heroicRatingCapWithLevelBenefit,7);
assert.equal(skills.skills.fullDescriptionsAuthority,"DH160_176_SOURCE_AVAILABLE_NOT_FULLY_MAPPED");
assert.equal(tb2eSkillInfo("Hunter").sourceBoundary,"DH160_176_AVAILABLE_CATALOGUE_MAPPING_PENDING");
const newSkill=tb2eNewSkillLearningPlan({skillName:"Scout",beginnersLuckAttempts:5,maximumNature:5,currentKnownSkillCount:24});
immutable(newSkill);assert.equal(newSkill.ready,true);assert.equal(newSkill.requiresForgetExistingSkill,true);
assert.equal(tb2eNewSkillLearningPlan({skillName:"Scout",beginnersLuckAttempts:5,maximumNature:5,currentKnownSkillCount:23}).requiresForgetExistingSkill,false);
assert.equal(tb2eNewSkillLearningPlan({skillName:"Scout",beginnersLuckAttempts:5,maximumNature:5,currentKnownSkillCount:25}).reasonCode,"INVALID_KNOWN_SKILL_COUNT");
const equipped=equipment({hasSkill:true,carriesBackpackOrSatchel:true,suppliesUsed:1,gearUsed:1});
immutable(equipped);assert.equal(equipped.ok,true);assert.equal(equipped.obstacleIncrease,0);
assert.equal(equipped.bonusDice,2);assert.equal(equipped.suppliesConsumedPlanned,true);
const unskilled=equipment({hasSkill:false});assert.equal(unskilled.obstacleIncrease,1);
assert.equal(equipment({hasSkill:false,borrowedTools:true}).obstacleIncrease,0);
assert.equal(equipment({hasSkill:true,carriesBackpackOrSatchel:false}).obstacleIncrease,1);
assert.equal(equipment({hasSkill:true,toolsInadequate:true}).obstacleIncrease,1);
assert.equal(equipment({hasSkill:false,dwarvenCraftingNature:true,isCraftingTest:true}).obstacleIncrease,0);
assert.equal(equipment({suppliesUsed:2}).reasonCode,"AT_MOST_ONE_SUPPLY_INCREMENT_PER_TEST");
assert.equal(equipment({gearUsed:2}).reasonCode,"AT_MOST_ONE_GEAR_PER_TEST");
assert.equal(JSON.stringify(profiles.map(id=>resolveRulesProfile(id))),before);
for(const file of [
 "module/m10d-tb2e-wises-p32-shadow.mjs","module/m10d-tb2e-skills-equipment-p32-shadow.mjs",
 "module/m10d-tb2e-wise-shadow.mjs","module/m10d-tb2e-nature-shadow.mjs","module/m10d-tb2e-abilities-shadow.mjs"
]){
 const src=fs.readFileSync(file,"utf8");
 for(const banned of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
 assert.equal(src.includes(banned),false,file+" must not mutate Foundry state");
}
console.log("PASS M10D.18 P3.2 · Wises/Help/Fate order, Nature recovery/retirement/descriptors, Skills tools/capacity · zero writes");
