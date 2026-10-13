import assert from "node:assert/strict";
import {tb2ePackageATestScenarioPlan as scenario} from "../module/m10d18-tb2e-package-a-test-scenario.mjs";
import {tb2ePackageAConditionBoundaryPlan as condition} from "../module/m10d18-tb2e-package-a-condition-boundary.mjs";
const factor={tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}};
const equipment={hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
 dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0};
const environment={light:"CLEAR",additionalGmHindrances:0};
const base={skillName:"Cook",factor,mode:"SKILL",rating:4,equipment,environment,
 allModifiersGmReviewed:true,actingCharacterId:"actorA",actingConditions:[],conditionsGmReviewed:true};
const help={helperId:"actorB",helperConditions:[],conditionsGmReviewed:true,
 describedRelevantAction:true,actingPlayerAccepted:true,gmApprovedRelevance:true,
 helpOptions:{sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}};
const wiseAid={helperId:"actorC",helperConditions:[],conditionsGmReviewed:true,hasWise:true,related:true};
const ok=p=>{assert.equal(p.ok,true,JSON.stringify(p));assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);};
const denied=(p,code)=>{assert.equal(p.ok,false,JSON.stringify(p));assert.equal(p.reasonCode,code,JSON.stringify(p));assert.equal(p.writesPlanned,0);};
const plain=scenario(base);ok(plain);assert.equal(plain.finalDicePool,5);
const fresh=scenario({...base,actingConditions:["FRESH"]});ok(fresh);
assert.equal(fresh.finalDicePool,6);assert.equal(fresh.derivedFreshDice,1);
const injured=scenario({...base,actingConditions:["INJURED"]});ok(injured);
assert.equal(injured.finalDicePool,4);assert.equal(injured.actingConditionPenaltyDice,-1);
const sickInjured=scenario({...base,actingConditions:["INJURED","SICK"]});ok(sickInjured);
assert.equal(sickInjured.finalDicePool,3);assert.equal(sickInjured.actingConditionPenaltyDice,-2);
denied(scenario({...base,rating:1,actingConditions:["INJURED"],bonuses:{personaDice:3}}),
 "CONDITION_ZERO_RATED_SKILL_CANNOT_TEST");
denied(scenario({...base,rating:2,actingConditions:["INJURED","SICK"],help:{
 helperId:"actorB",helperConditions:[],conditionsGmReviewed:true,describedRelevantAction:true,
 actingPlayerAccepted:true,gmApprovedRelevance:true,
 helpOptions:{sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}
}}),"CONDITION_ZERO_RATED_SKILL_CANNOT_TEST");

denied(scenario({...base,actingConditions:null}),"CONDITION_GM_ACTING_CONDITIONS_REQUIRED");
denied(scenario({...base,conditionsGmReviewed:false}),"CONDITION_GM_ACTING_CONDITIONS_REQUIRED");
denied(scenario({...base,testContext:"RECOVERY"}),"SCENARIO_ONLY_SUPPORTS_INDEPENDENT_TESTS");
denied(scenario({...base,actingConditions:["DEAD"]}),"CONDITION_DEAD_ACTOR_CANNOT_TEST");
denied(scenario({...base,bonuses:{freshDice:1}}),"CONDITION_FRESH_DICE_MUST_BE_DERIVED_FROM_CONDITIONS");
denied(scenario({...base,actingConditions:["ANGRY"]}),"CONDITION_ANGRY_OBSTACLE_GM_DECISION_REQUIRED");
const angry=scenario({...base,actingConditions:["ANGRY"],gmAngryObstacleDecision:"APPLY"});
ok(angry);assert.equal(angry.obstacle,2);
const waived=scenario({...base,actingConditions:["ANGRY"],gmAngryObstacleDecision:"WAIVE"});
ok(waived);assert.equal(waived.obstacle,1);
denied(scenario({...base,actingConditions:["ANGRY"],gmAngryObstacleDecision:"WAIVE",
 bonuses:{traitsDice:1}}),"CONDITION_ANGRY_BLOCKS_BENEFICIAL_TRAITS");
denied(scenario({...base,actingConditions:["EXHAUSTED"],actingOnInstinct:true}),
 "CONDITION_EXHAUSTED_INSTINCT_REQUIRES_SPENT_TURN");
const instinct=scenario({...base,actingConditions:["EXHAUSTED"],actingOnInstinct:true,instinctTurnSpent:true});
ok(instinct);assert.equal(instinct.conditionObstacleIncrease,1);
const beginner={...base,mode:"BEGINNERS_LUCK",beginnerAbilityName:"WILL",
 equipment:{...equipment,hasSkill:false}};
const freshBeginner=scenario({...beginner,actingConditions:["FRESH"]});ok(freshBeginner);
assert.equal(freshBeginner.finalDicePool,4); // ceil((Will4 + supplies1)/2) + Fresh1
const injuredBeginner=scenario({...beginner,actingConditions:["INJURED"]});ok(injuredBeginner);
assert.equal(injuredBeginner.finalDicePool,2); // ceil((Will4 -1 + supplies1)/2)
denied(scenario({...beginner,rating:1,actingConditions:["INJURED"]}),
 "POOL_ABILITY_ZERO_DUE_TO_INJURY_OR_SICKNESS");
denied(scenario({...beginner,actingConditions:["AFRAID"]}),"CONDITION_AFRAID_BLOCKS_BEGINNERS_LUCK");
denied(scenario({...base,help:{...help,helperId:"actorA"}}),"CONDITION_HELP_REQUIRES_DISTINCT_CHARACTER");
denied(scenario({...base,help:{...help,helperConditions:["AFRAID"]}}),"CONDITION_AFRAID_BLOCKS_HELP");
denied(scenario({...base,wiseAid:{...wiseAid,helperConditions:["ANGRY"]}}),"CONDITION_ANGRY_BLOCKS_BENEFICIAL_WISES");
denied(scenario({...base,wiseAid:{...wiseAid,helperConditions:["DEAD"]}}),"CONDITION_DEAD_WISE_HELPER_CANNOT_AID");
denied(scenario({...base,help:{...help,helperConditions:["DEAD"]}}),"CONDITION_DEAD_HELPER_CANNOT_HELP");
denied(scenario({...base,wiseAid:{...wiseAid,helperId:"actorA"}}),"CONDITION_WISE_AID_REQUIRES_DISTINCT_CHARACTER");
const team=scenario({...base,help,wiseAid});ok(team);assert.equal(team.finalDicePool,7);
const channelContext={currentNature:3,maximumNature:5,personaAvailable:2,
 testName:"Cook",descriptorApplies:false,gmReviewed:true};
const nature=scenario({...base,bonuses:{channeledNatureDice:3},channelNatureFacts:channelContext});
ok(nature);assert.equal(nature.finalDicePool,8);assert.equal(nature.channelTaxOnPass.amount,1);
denied(scenario({...base,bonuses:{channeledNatureDice:2},channelNatureFacts:channelContext}),
 "CONDITION_CHANNEL_DICE_MUST_EQUAL_CURRENT_NATURE");
denied(scenario({...base,bonuses:{channeledNatureDice:3}}),"CONDITION_GM_NATURE_CHANNEL_FACTS_REQUIRED");
denied(scenario({...base,bonuses:{channeledNatureDice:3},channelNatureFacts:{...channelContext,testName:"Fighter"}}),
 "CONDITION_CHANNEL_NATURE_TEST_MISMATCH");
denied(scenario({...base,channelNatureFacts:channelContext}),"CONDITION_UNUSED_NATURE_CHANNEL_FACTS");
const direct=condition({skillName:"Cook",actingCharacterId:"actorA",actingConditions:[],conditionsGmReviewed:true});
ok(direct);assert.equal(direct.sourceActorDocumentVerified,false);
console.log("PASS Package A SG46-52: condition provenance, Fresh/BL stages, sick+injured, angry/fear/dead, distinct helpers and Nature resource tax; zero writes");
