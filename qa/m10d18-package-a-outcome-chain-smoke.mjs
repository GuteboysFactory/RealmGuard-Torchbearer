import assert from "node:assert/strict";
import {tb2ePackageAOutcomeAndProgressPlan as chain} from "../module/m10d18-tb2e-package-a-outcome-chain.mjs";
const gear={hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
 dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0};
const factor={tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}};
const scenarioInput={skillName:"Cook",mode:"SKILL",rating:4,factor,equipment:gear,
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:"c1",actingConditions:[],conditionsGmReviewed:true};
const progressFacts={skillAlreadyKnown:true,gmConfirmedLegalTest:true,
 context:"ADVENTURE",alreadyCountedInContext:false};
const case0={scenarioInput,gmDiceReviewed:true,gmConfirmsNoRerolls:true};
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);
 assert.equal(p.rollExecuted,false);assert.equal(p.actorWrite,false);
 assert.equal(p.resourceSpendCommitted,false);};
const good=chain({...case0,dice:[1,2,3,4,2],progressFacts});
safe(good);assert.equal(good.ok,true,JSON.stringify(good));
assert.equal(good.scenarioSkill,"Cook");assert.equal(good.outcome,"PASS");
assert.equal(good.finalDicePool,5);assert.equal(good.rawSuccesses,1);
assert.equal(good.advancementPreview.wouldRecordMark,true);
assert.equal(good.advancementPreview.proposedMark,"PASS");
assert.equal(good.advancementPreview.advancementWrite,false);
assert.equal(good.rollSourceAuthenticated,false);
assert.equal(good.playerPermissionNotVerified,true);
const fail=chain({...case0,dice:[1,2,3,2,2],progressFacts});
safe(fail);assert.equal(fail.outcome,"FAIL");
assert.equal(fail.advancementPreview.proposedMark,"FAIL");
const noMark=chain({...case0,dice:[1,2,3,4,2]});safe(noMark);
assert.equal(noMark.ok,true);assert.equal(noMark.advancementPreview,null);
const blInput={...scenarioInput,mode:"BEGINNERS_LUCK",beginnerAbilityName:"WILL",
 equipment:{...gear,hasSkill:false}};
const learn=chain({...case0,scenarioInput:blInput,dice:[4,1,2],
 progressFacts:{skillAlreadyKnown:false,previousLearningAttempts:2,
 maximumNature:3,currentKnownSkillCount:23,gmConfirmedLegalTest:true}});
safe(learn);assert.equal(learn.ok,true,JSON.stringify(learn));
assert.equal(learn.advancementPreview.readyToLearnAfterPreview,true);
assert.equal(learn.advancementPreview.willHealthAdvancementMark,false);
const heroic=chain({...case0,dice:[3,3,1,1,2],heroicTn3BenefitUnlocked:true});
safe(heroic);assert.equal(heroic.successThreshold,3);assert.equal(heroic.outcome,"PASS");
assert.equal(good.successThreshold,4);
const sick=chain({...case0,scenarioInput:{...scenarioInput,actingConditions:["SICK"]},
 dice:[4,1,1,1],progressFacts});safe(sick);
assert.equal(sick.ok,true);assert.equal(sick.advancementPreview.wouldRecordMark,false);
const rejection=[
 [{...case0,dice:[1,2,3,4]},"SUPPLIED_DICE_DO_NOT_MATCH_SCENARIO_POOL"],
 [{...case0,dice:[1,2,3,4,7]},"INVALID_EXTERNAL_D6_LIST"],
 [{...case0,dice:[1,2,3,4,3.4]},"INVALID_EXTERNAL_D6_LIST"],
 [{...case0,dice:[1,2,3,4,2],gmDiceReviewed:false},"GM_MUST_REVIEW_SUPPLIED_DICE"],
 [{...case0,dice:[1,2,3,4,2],gmConfirmsNoRerolls:false},"REROLL_AND_FATE_HISTORY_NOT_SUPPORTED_IN_THIS_PREVIEW"],
 [{...case0,dice:[1,2,3,4,2],progressFacts:{...progressFacts,outcome:"FAIL"}},"INVALID_POST_TEST_FACT_FIELDS"],
 [{...case0,dice:[1,2,3,4,2],progressFacts:{...progressFacts,skillName:"Fighter"}},"INVALID_POST_TEST_FACT_FIELDS"],
 [{...case0,dice:[1,2,3,4,2],progressFacts:{...progressFacts,context:"CONFLICT"}},"INDEPENDENT_TEST_PROGRESS_CONTEXT_MISMATCH"],
 [{...case0,dice:[1,2,3,4,2],progressFacts:{...progressFacts,context:"TIEBREAKER"}},"INDEPENDENT_TEST_PROGRESS_CONTEXT_MISMATCH"],
 [{...case0,dice:[1,2,3,4,2],progressFacts:{...progressFacts,actingConditions:["SICK"]}},"INVALID_POST_TEST_FACT_FIELDS"],
 [{...case0,dice:[1,2,3,4,2],progressFacts:{...progressFacts,gmConfirmedLegalTest:false}},"GM_MUST_CONFIRM_PROGRESSION_ELIGIBILITY"],
 [{...case0,dice:[1,2,3,4,2],scenarioInput:{...scenarioInput,actingConditions:["DEAD"]}},"SCENARIO_CONDITION_DEAD_ACTOR_CANNOT_TEST"],
 [{...case0,dice:[1,2,3,4,2],scenarioInput:{...scenarioInput,gmAngryObstacleDecision:"APPLY",actingConditions:["ANGRY"]},progressFacts},
  "SUPPLIED_DICE_DO_NOT_MATCH_SCENARIO_POOL_EXPECTED_NEVER"]
];
for(const [request,reason] of rejection){
 if(reason.endsWith("_EXPECTED_NEVER"))continue;
 const p=chain(request);safe(p);assert.equal(p.ok,false,JSON.stringify(p));
 assert.equal(p.reasonCode,reason,JSON.stringify(p));
}
assert.deepEqual(good.resolvedDice,[1,2,3,4,2]);
console.log("PASS Package A immutable chain: GM-reviewed pool-sized supplied D6 -> outcome -> source-bound BL/Skill marks, no roll or Actor writes");
