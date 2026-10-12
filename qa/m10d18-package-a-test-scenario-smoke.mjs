import assert from "node:assert/strict";
import {tb2ePackageATestScenarioPlan as plan} from "../module/m10d18-tb2e-package-a-test-scenario.mjs";
const equipment={hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
 dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0};
const environment={light:"DIM_LIGHT",additionalGmHindrances:0};
const factor={tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"small_group"}};
const help={helperId:"helperA",helperConditions:[],conditionsGmReviewed:true,describedRelevantAction:true,actingPlayerAccepted:true,gmApprovedRelevance:true,
 helpOptions:{sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}};
const wiseAid={helperId:"helperB",helperConditions:[],conditionsGmReviewed:true,hasWise:true,related:true};
const basic={skillName:"Cook",factor,mode:"SKILL",rating:4,equipment,environment,allModifiersGmReviewed:true,actingCharacterId:"actor",actingConditions:[],conditionsGmReviewed:true};
const good=plan({...basic,help,wiseAid});
assert.equal(good.ok,true,JSON.stringify(good));assert.equal(good.obstacle,3);
assert.equal(good.finalDicePool,7);assert.equal(good.actorEntitlementVerified,false);
assert.equal(good.sourceFactorPage,163);
assert.equal(good.poolAuthority,"GM_INPUT_PREVIEW_NOT_ACTOR_VERIFIED");
assert.equal(good.liveApplication,false);assert.equal(good.writesPlanned,0);
const beginner=plan({...basic,mode:"BEGINNERS_LUCK",beginnerAbilityName:"WILL",
 equipment:{...equipment,hasSkill:false},
 help:{...help,helpOptions:{sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook",helperSkillTrained:true}},
 bonuses:{traitsDice:1}});
assert.equal(beginner.ok,true,JSON.stringify(beginner));
assert.equal(beginner.obstacle,4);assert.equal(beginner.finalDicePool,4); // ceil((Will4+Help1+Supplies1)/2) + Trait1
assert.equal(plan({...basic,allModifiersGmReviewed:false}).reasonCode,"GM_FULL_MODIFIER_REVIEW_REQUIRED");
assert.equal(plan({...basic,rating:7}).reasonCode,"HEROIC_RATING_SEVEN_NOT_UNLOCKED");
assert.equal(plan({...basic,help,wiseAid:{...wiseAid,helperId:"helperA"}}).reasonCode,"SAME_HELPER_CANNOT_HELP_AND_WISE_AID");
assert.equal(plan({...basic,factor:{...factor,skillName:"Scout"}}).reasonCode,"SCENARIO_SKILL_FACTOR_ID_MISMATCH");
assert.equal(plan({...basic,mode:"BEGINNERS_LUCK",beginnerAbilityName:"HEALTH",equipment:{...equipment,hasSkill:false}}).reasonCode,"BEGINNERS_LUCK_ABILITY_MISMATCH");
console.log("PASS Package A integrated source/Help/Wise/BL GM-scenario zero-write previews");
