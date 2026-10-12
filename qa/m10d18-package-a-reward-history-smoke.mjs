import assert from "node:assert/strict";
import {tb2ePackageARewardedRollHistoryPlan as plan} from "../module/m10d18-tb2e-package-a-rewarded-roll-history.mjs";
import {tb2eWiseRerollPlan,tb2eWiseDeeperDiePlan} from "../module/m10d-tb2e-wise-shadow.mjs";
const gear={hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
 dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0};
const scenarioInput={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:gear,environment:{light:"CLEAR",additionalGmHindrances:0},
 allModifiersGmReviewed:true,actingCharacterId:"actorOne",
 actingConditions:[],conditionsGmReviewed:true};
const initialDice=[{dieId:"a",face:6},{dieId:"b",face:2},{dieId:"c",face:3},
 {dieId:"d",face:4},{dieId:"e",face:5}];
const d={type:"DEEPER_UNDERSTANDING",wiseId:"cook-wise",related:true,dieId:"b",newFace:6};
const o={type:"OF_COURSE",wiseId:"bread-wise",related:true,rerolls:[{dieId:"c",face:5}]};
const l={type:"FATE_LUCK",rounds:[
 [{dieId:"luck1",parentDieId:"a",face:6},{dieId:"luck2",parentDieId:"b",face:4}],
 [{dieId:"luck3",parentDieId:"luck1",face:5}]
]};
const base={scenarioInput,initialDice,gmDiceReviewed:true,gmEventHistoryReviewed:true,
 fateAvailable:2,personaAvailable:1};
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);
 assert.equal(p.actorWrite,false);assert.equal(p.rollExecuted,false);
 assert.equal(p.resourceSpendCommitted,false);assert.equal(p.rollSourceAuthenticated,false);
 assert.equal(p.gmPermissionAuthenticated,false)};
const good=plan({...base,rewardEvents:[d,o,l],progressFacts:{
 skillAlreadyKnown:true,gmConfirmedLegalTest:true,context:"ADVENTURE"
}});
safe(good);assert.equal(good.ok,true,JSON.stringify(good));
assert.equal(good.finalDiceCount,8);assert.equal(good.rawSuccesses,8);
assert.equal(good.projectedFateCost,2);assert.equal(good.projectedPersonaCost,1);
assert.equal(good.advancementPreview.proposedMark,"PASS");
assert.equal(good.advancementPreview.writesPlanned,0);
assert.deepEqual(good.dieHistory.filter(x=>x.source==="FATE_LUCK").map(x=>x.parentDieId),["a","b","luck1"]);
assert.equal(good.reviewedTimeline[2].generatedDice,3);
const normal=plan({...base,rewardEvents:[]});safe(normal);assert.equal(normal.ok,true);
assert.equal(normal.finalDiceCount,5);assert.equal(normal.rawSuccesses,3);
const luckOnly=plan({...base,rewardEvents:[{type:"FATE_LUCK",rounds:[
 [{dieId:"extra",parentDieId:"a",face:4}]]}]});
safe(luckOnly);assert.equal(luckOnly.ok,true);
assert.equal(luckOnly.finalDiceCount,6);assert.equal(luckOnly.projectedFateCost,1);
const deny=(opts,reason)=>{
 const p=plan({...base,...opts});safe(p);assert.equal(p.ok,false,JSON.stringify(p));
 assert.equal(p.reasonCode,reason,JSON.stringify(p));
};
deny({rewardEvents:[{type:"FATE_LUCK",rounds:[[{dieId:"x",parentDieId:"a",face:4}]]},d]},"WISE_REWARD_MUST_PRECEDE_FATE_LUCK");
deny({rewardEvents:[d,l,o]},"WISE_REWARD_MUST_PRECEDE_FATE_LUCK");
deny({rewardEvents:[d,d]},"WISE_OR_EFFECT_ALREADY_USED_ON_ROLL");
deny({rewardEvents:[d,{...o,wiseId:"cook-wise"}]},"WISE_OR_EFFECT_ALREADY_USED_ON_ROLL");
deny({rewardEvents:[{...d,wiseId:" cook-wise "},{...o,wiseId:"COOK-WISE"}]},
 "WISE_OR_EFFECT_ALREADY_USED_ON_ROLL");
deny({rewardEvents:[d,{...d,wiseId:"other-wise"}]},"WISE_OR_EFFECT_ALREADY_USED_ON_ROLL");
deny({rewardEvents:[d,l],fateAvailable:1},"INSUFFICIENT_FATE");
deny({rewardEvents:[{...o,rerolls:[{dieId:"b",face:4},{dieId:"c",face:5}]}],personaAvailable:0},"INSUFFICIENT_PERSONA");
deny({rewardEvents:[d],fateAvailable:0},"INSUFFICIENT_FATE");
deny({rewardEvents:[{...d,dieId:"a"}]},"DEEPER_REQUIRES_UNREROLLED_FAILED_DIE");
deny({rewardEvents:[{...d,dieId:"missing"}]},"DEEPER_REQUIRES_UNREROLLED_FAILED_DIE");
deny({rewardEvents:[{...d,related:false}]},"GM_CONFIRMED_RELATED_WISE_REQUIRED");
deny({rewardEvents:[{...o,rerolls:[]}]},"OF_COURSE_MUST_REROLL_ALL_FAILED_DICE");
deny({rewardEvents:[{...o,rerolls:[{dieId:"b",face:6}]}]},"OF_COURSE_MUST_REROLL_ALL_FAILED_DICE");
deny({rewardEvents:[{...o,rerolls:[{dieId:"b",face:6},{dieId:"c",face:5},{dieId:"b",face:4}]}]},"OF_COURSE_MUST_REROLL_ALL_FAILED_DICE");
deny({rewardEvents:[{type:"FATE_LUCK",rounds:[[{dieId:"x",parentDieId:"b",face:4}]]}]},"FATE_LUCK_PARENT_SIXES_MISMATCH");
deny({rewardEvents:[{type:"FATE_LUCK",rounds:[[{dieId:"x",parentDieId:"a",face:6}]]}]},"FATE_LUCK_EXPLOSION_INCOMPLETE");
deny({rewardEvents:[{type:"FATE_LUCK",rounds:[[{dieId:"x",parentDieId:"a",face:4}],
 [{dieId:"y",parentDieId:"x",face:2}]]}]},"FATE_LUCK_EXTRA_ROUND_NOT_REQUIRED");
deny({rewardEvents:[{type:"FATE_LUCK",rounds:[[{dieId:"a",parentDieId:"a",face:4}]]}]},"DUPLICATE_DIE_ID_IN_HISTORY");
deny({rewardEvents:[{type:"FATE_LUCK",rounds:[[{dieId:"x",parentDieId:"a",face:4}]]},
 {type:"FATE_LUCK",rounds:[[{dieId:"y",parentDieId:"a",face:1}]]}]},"FATE_LUCK_ONLY_ONCE_PER_TEST");
deny({initialDice:initialDice.slice(0,4),rewardEvents:[]},"INITIAL_DICE_POOL_MISMATCH");
deny({gmDiceReviewed:false,rewardEvents:[]},"GM_DICE_AND_EVENT_REVIEW_REQUIRED");
deny({rewardEvents:[],progressFacts:{skillAlreadyKnown:true,gmConfirmedLegalTest:true,outcome:"FAIL"}},"INVALID_POST_TEST_FACT_FIELDS");
deny({rewardEvents:[],progressFacts:{skillAlreadyKnown:true,gmConfirmedLegalTest:true,context:"CONFLICT"}},"INDEPENDENT_TEST_PROGRESS_CONTEXT_MISMATCH");

const personaAdvantageScenario={...scenarioInput,bonuses:{personaDice:1}};
const moreDice=[...initialDice,{dieId:"advantage1",face:5}];
const paidBefore=plan({...base,scenarioInput:personaAdvantageScenario,
 initialDice:moreDice,rewardEvents:[{...o,rerolls:[
 {dieId:"b",face:4},{dieId:"c",face:5}]}],personaAvailable:1});
safe(paidBefore);assert.equal(paidBefore.reasonCode,"INSUFFICIENT_PERSONA");
const enough=plan({...base,scenarioInput:personaAdvantageScenario,
 initialDice:moreDice,rewardEvents:[{...o,rerolls:[
 {dieId:"b",face:4},{dieId:"c",face:5}]}],personaAvailable:2});
safe(enough);assert.equal(enough.ok,true,JSON.stringify(enough));
assert.equal(enough.projectedPersonaBeforeRollCost,1);
assert.equal(enough.projectedPersonaTotalCost,2);
assert.equal(enough.projectedPersonaRemainingFromGmBalance,0);
deny({scenarioInput:personaAdvantageScenario,initialDice:moreDice,
 rewardEvents:[],personaAvailable:0},"INSUFFICIENT_PERSONA_BEFORE_ROLL");
deny({scenarioInput:{...scenarioInput,bonuses:{personaDice:4}},
 rewardEvents:[]},"SCENARIO_PERSONA_ADVANTAGE_MAXIMUM_THREE_DICE");
const natureContext={currentNature:3,maximumNature:5,personaAvailable:1,
 testName:"Cook",descriptorApplies:false,gmReviewed:true};
const natureScenario={...scenarioInput,bonuses:{channeledNatureDice:3},
 channelNatureFacts:natureContext};
const natureDice=[...initialDice,{dieId:"n1",face:5},{dieId:"n2",face:4},{dieId:"n3",face:3}];
const naturePreview=plan({...base,scenarioInput:natureScenario,initialDice:natureDice,rewardEvents:[],
 personaAvailable:1});
safe(naturePreview);assert.equal(naturePreview.ok,true,JSON.stringify(naturePreview));
assert.equal(naturePreview.projectedPersonaBeforeRollCost,1);
assert.equal(naturePreview.projectedPersonaTotalCost,1);
deny({scenarioInput:natureScenario,initialDice:natureDice,rewardEvents:[],
 personaAvailable:0},"INSUFFICIENT_PERSONA_BEFORE_ROLL");
deny({scenarioInput:natureScenario,initialDice:natureDice,rewardEvents:[],
 personaAvailable:2},"NATURE_PERSONA_BALANCE_MISMATCH");

assert.equal(tb2eWiseRerollPlan("Deeper Understanding",{failedDice:1,fateLuckAlreadyUsed:true}).reasonCode,"DEEPER_MUST_PRECEDE_FATE_LUCK");
assert.equal(tb2eWiseDeeperDiePlan({dice:[{dieId:"one",face:2,alreadyRerolled:false}],
 chosenDieId:"one",fateAvailable:1,fateLuckAlreadyUsed:true}).reasonCode,"DEEPER_MUST_PRECEDE_FATE_LUCK");
console.log("PASS Package A SG87/DH77/SG88: GM-asserted fate/wise chronology, recursive sixes with parent IDs, budget and no writes");
