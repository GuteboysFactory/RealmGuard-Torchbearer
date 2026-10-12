import assert from "node:assert/strict";
import {tb2ePackageAParticipationProgressPlan as plan} from "../module/m10d18-tb2e-package-a-participation-progress.mjs";
const oldGame=globalThis.game,oldFoundry=globalThis.foundry;
const forbid=()=>{throw new Error("SIDE_EFFECT");};
class Die {}
const gm={id:"gm1",active:true,isGM:true},player={id:"p1",active:true,isGM:false};
const role=(id,name,rating,passed=0,failed=0)=>({id,name,type:"role",system:{rating,beginnerAttempts:0,
 learning:{passed,failed,passNeeded:1,failNeeded:1}}});
const actor=(id,items)=>({id,uuid:`Actor.${id}`,documentName:"Actor",type:"character",items,
 system:{resources:{fate:{value:0},persona:{value:0}},attributes:{will:{value:4},health:{value:3},
 nature:{value:2,maximum:4}}},testUserPermission:u=>u===player,update:forbid,spendTrackedResource:forbid});
const cook=role("cook1","Cook",4,3,3),alchemist=role("alchemy1","Alchemist",2,1,1);
const acting=actor("acting",[cook]),helper=actor("helper",[alchemist]);
const message={id:"msg1",documentName:"ChatMessage",visible:true,isContentVisible:true,
 speaker:{actor:acting.id},speakerActor:acting,author:player,rolls:[],update:forbid};
const setDice=faces=>message.rolls=[{_evaluated:true,formula:`${faces.length}d6`,
 total:faces.reduce((a,b)=>a+b,0),terms:[Object.assign(new Die(),{number:faces.length,faces:6,
 modifiers:[],results:faces.map(result=>({result,active:true}))})],evaluate:forbid}];
const condition=(a,name)=>a.items.push({id:name,type:"condition",name,system:{active:true}});
const scenario={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,dwarvenCraftingNature:false,
 isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:acting.id,actingConditions:[],conditionsGmReviewed:true};
const review={gmConfirmedLegalTest:true,gmConfirmsCountersExcludeThisTest:true,
 gmConfirmsHistoricalEligibility:true,context:"ADVENTURE"};
const base={actorId:acting.id,messageId:message.id,scenarioInput:scenario,progressReview:review};
const help={helperId:helper.id,helperConditions:[],conditionsGmReviewed:true,actingPlayerAccepted:true,
 describedRelevantAction:true,gmApprovedRelevance:true,helpOptions:{sourceKind:"skill",sourceName:"Alchemist",
 testName:"Cook",suggestedHelpSkill:true}};
const synergyReview={fateAtRollStartGmAsserted:1,committedBeforeRollGmAsserted:true};
const safe=p=>{for(const k of ["liveApplication","actorWrite","itemWrite","journalWrite","settingsWrite",
 "rollExecuted","resourceSpendCommitted","advancementWrite","learningWrite","ratingWrite",
 "actorSourceAuthenticated","rollSourceAuthenticated","gmPermissionAuthenticated","playerConsentAuthenticated",
 "rollTimeActorStateVerified","historicalRewardBalanceVerified","historicalProgressCountsAuthenticated",
 "duplicateTestCheckAuthenticated"])assert.equal(p[k],false,k);
 assert.equal(p.writesPlanned,0);assert.equal(Object.isFrozen(p),true);};
const denied=(overrides,reason)=>{const p=plan({...base,...overrides});safe(p);assert.equal(p.ok,false,JSON.stringify(p));
 assert.equal(p.reasonCode,reason,JSON.stringify(p));};
try {
 globalThis.foundry={dice:{terms:{Die}}};
 globalThis.game={ready:true,system:{id:"realm-guard"},user:gm,
 users:new Map([[gm.id,gm],[player.id,player]]),actors:new Map([[acting.id,acting],[helper.id,helper]]),
 messages:new Map([[message.id,message]]),settings:{set:forbid},socket:{emit:forbid}};
 setDice([6,4,5,3,2]);
 const before=JSON.stringify([acting,helper,message]);
 const pass=plan(base);safe(pass);assert.equal(pass.ok,true,JSON.stringify(pass));
 assert.equal(pass.derivedOutcome,"PASS");assert.equal(pass.actingProgressPlan.proposedMark,"PASS");
 assert.deepEqual(pass.actingCounterProjection.countersAfterPreview,{passed:4,failed:3});
 assert.equal(pass.actingCounterProjection.readyToAdvanceAfterPreview,true);
 assert.equal(pass.actingCounterProjection.proposedRatingAfterSeparateAdvance,5);
 assert.equal(pass.actingCounterProjection.requiredPasses,4);assert.equal(pass.actingCounterProjection.requiredFails,3);
 assert.deepEqual(pass.actingCounterProjection.storedLegacyThresholds,{passNeeded:1,failNeeded:1});
 assert.equal(pass.actingCounterProjection.sourceThresholdsOverrideLegacyConfiguration,false);
 assert.equal(JSON.stringify([acting,helper,message]),before);
 assert.deepEqual(plan(base),pass,"Repeat preview must not increment current counters");
 setDice([1,2,3,1,2]);cook.system.learning.passed=4;cook.system.learning.failed=2;
 const fail=plan(base);safe(fail);assert.equal(fail.derivedOutcome,"FAIL");
 assert.deepEqual(fail.actingCounterProjection.countersAfterPreview,{passed:4,failed:3});
 denied({outcome:"PASS"},"UNSUPPORTED_PARTICIPATION_PROGRESS_FIELDS");
 denied({passed:99},"UNSUPPORTED_PARTICIPATION_PROGRESS_FIELDS");
 denied({progressReview:{...review,outcome:"PASS"}},"EXPLICIT_PROGRESS_REVIEW_REQUIRED");
 denied({progressReview:undefined},"EXPLICIT_PROGRESS_REVIEW_REQUIRED");
 denied({progressReview:{...review,gmConfirmsCountersExcludeThisTest:false}},"CURRENT_COUNTERS_MAY_ALREADY_INCLUDE_TEST");
 denied({progressReview:{...review,gmConfirmsHistoricalEligibility:false}},"GM_HISTORICAL_PROGRESS_ELIGIBILITY_REQUIRED");
 for(const context of ["CONFLICT","SERIES","TIEBREAKER","TOWN","CAMP"])
   denied({progressReview:{...review,context}},"INDEPENDENT_ADVENTURE_PROGRESS_ONLY");
 cook.system.learning.passed=undefined;denied({},"CURRENT_SKILL_COUNTERS_REQUIRED");cook.system.learning.passed=4;
 cook.system.learning.failed=Number.MAX_SAFE_INTEGER;denied({},"CURRENT_SKILL_COUNTERS_REQUIRED");cook.system.learning.failed=3;
 // Sick suppresses both the new mark AND readiness, even if old counters met the threshold.
 condition(acting,"Sick");setDice([6,4,5,3]);
 const sick=plan({...base,scenarioInput:{...scenario,actingConditions:["Sick"]}});safe(sick);assert.equal(sick.ok,true);
 assert.equal(sick.actingProgressPlan.wouldRecordMark,false);
 assert.equal(sick.actingCounterProjection.readyToAdvanceAfterPreview,false);
 assert.equal(sick.actingCounterProjection.proposedRatingAfterSeparateAdvance,4);
 assert.deepEqual(sick.actingCounterProjection.countersAfterPreview,{passed:4,failed:3});acting.items.pop();
 cook.system.rating=6;cook.system.learning.passed=6;cook.system.learning.failed=5;
 setDice([6,4,5,3,2,1,4]);
 const capped=plan({...base,scenarioInput:{...scenario,rating:6}});safe(capped);assert.equal(capped.ok,true);
 assert.equal(capped.actingCounterProjection.atNormalRatingCap,true);
 assert.equal(capped.actingCounterProjection.readyToAdvanceAfterPreview,false);
 assert.equal(capped.actingCounterProjection.proposedRatingAfterSeparateAdvance,6);
 cook.system.rating=4;cook.system.learning.passed=4;cook.system.learning.failed=3;
 // Helper Synergy advances Alchemist, never the acting character's Cook; Fate remains asserted.
 setDice([6,4,5,3,2,1]);
 const assisted={...base,scenarioInput:{...scenario,help},helpSourceItemId:alchemist.id,synergyReview};
 const paid=plan(assisted);safe(paid);assert.equal(paid.ok,true,JSON.stringify(paid));
 assert.equal(paid.helperSynergyPreview.helperAdvancementSource,"SKILL:Alchemist");
 assert.equal(paid.helperSynergyPreview.projectedFateCost,1);
 assert.equal(paid.helperCounterProjection.skillName,"Alchemist");
 assert.deepEqual(paid.helperCounterProjection.countersAfterPreview,{passed:2,failed:1});
 assert.equal(paid.helperCounterProjection.readyToAdvanceAfterPreview,true);
 assert.equal(paid.helperSynergyStartingResourcesSource,"GM_ASSERTED_NOT_CURRENT_ACTOR_HOLDINGS");
 assert.equal(helper.system.resources.fate.value,0);
 setDice([6,4,5,3,2]);denied({synergyReview},"SYNERGY_REQUIRES_OBSERVED_ORDINARY_HELP");
 setDice([6,4,5,3,2,1]);
 denied({...assisted,synergyReview:{...synergyReview,helpedTestOutcome:"FAIL"}},"GM_ASSERTED_HELPER_FATE_START_REQUIRED");
 denied({...assisted,synergyReview:{...synergyReview,committedBeforeRollGmAsserted:false}},
 "SYNERGY_PRE_ROLL_COMMITMENT_GM_ASSERTION_REQUIRED");
 condition(helper,"Sick");alchemist.system.learning.passed=2;setDice([6,4,5,3,2,1]);
 const helperSick=plan({...assisted,scenarioInput:{...scenario,help:{...help,helperConditions:["Sick"]}}});
 safe(helperSick);assert.equal(helperSick.ok,true,JSON.stringify(helperSick));
 assert.equal(helperSick.helperSynergyPreview.advancementPreview,null);
 assert.equal(helperSick.helperCounterProjection.readyToAdvanceAfterPreview,false);helper.items.pop();
 // Beginner's Luck reads an existing untrained record and Maximum Nature, not taxed Current Nature.
 cook.system.rating=0;cook.system.beginnerAttempts=3;
 const bl={...scenario,mode:"BEGINNERS_LUCK",beginnerAbilityName:"WILL",equipment:{...scenario.equipment,hasSkill:false}};
 setDice([6,4,5]);
 const learned=plan({...base,scenarioInput:bl});safe(learned);assert.equal(learned.ok,true,JSON.stringify(learned));
 assert.equal(learned.actingCounterProjection.currentNature,2);
 assert.equal(learned.actingCounterProjection.maximumNature,4);
 assert.equal(learned.actingCounterProjection.attemptsAfterPreview,4);
 assert.equal(learned.actingCounterProjection.readyToLearnAfterPreview,true);
 assert.equal(learned.actingCounterProjection.proposedLearnedRating,2);
 assert.equal(learned.actingCounterProjection.willHealthAdvancementMark,false);
 setDice([1,2,3]);assert.equal(plan({...base,scenarioInput:bl}).actingCounterProjection.attemptsAfterPreview,4);
 const extraRoles=Array.from({length:24},(_,i)=>role(`known${i}`,`Known skill ${i}`,1));
 acting.items.push(...extraRoles);
 const full=plan({...base,scenarioInput:bl});safe(full);assert.equal(full.ok,true);
 assert.equal(full.actingCounterProjection.requiresForgetExistingSkill,true);
 acting.items.push(role("known25","Known skill 25",1));
 denied({scenarioInput:bl},"CURRENT_KNOWN_SKILL_COUNT_EXCEEDS_CORE_CAP");acting.items=[cook];
 cook.system.beginnerAttempts=undefined;denied({scenarioInput:bl},"CURRENT_UNTRAINED_LEARNING_RECORD_REQUIRED");
 cook.system.beginnerAttempts=3;acting.items=[];denied({scenarioInput:bl},"CURRENT_UNTRAINED_LEARNING_RECORD_REQUIRED");acting.items=[cook];
 acting.system.attributes.nature.maximum=null;denied({scenarioInput:bl},"CURRENT_NATURE_STATE_REQUIRED");
 acting.system.attributes.nature.maximum=0;acting.system.attributes.nature.value=0;
 denied({scenarioInput:bl},"ACTING_PROGRESS_LEARNING_MAXIMUM_NATURE_ZERO_RETIRED_STATE");
 acting.system.attributes.nature.maximum=4;acting.system.attributes.nature.value=2;
 condition(acting,"Sick");setDice([6,4]);
 const sickBl=plan({...base,scenarioInput:{...bl,actingConditions:["Sick"]}});safe(sickBl);assert.equal(sickBl.ok,true);
 assert.equal(sickBl.actingCounterProjection.attemptsAfterPreview,3);assert.equal(sickBl.actingCounterProjection.attemptWouldBeAdded,0);
 acting.items.pop();
 // A BL helper without the target Skill uses Will; current model has no Ability counters.
 const abilityHelp={...help,helpOptions:{sourceKind:"ability",sourceName:"Will",targetSkillName:"Cook"}};
 setDice([6,4,5]);
 const abilitySynergy=plan({...base,scenarioInput:{...bl,help:abilityHelp},synergyReview});
 safe(abilitySynergy);assert.equal(abilitySynergy.ok,true,JSON.stringify(abilitySynergy));
 assert.equal(abilitySynergy.helperSynergyPreview.helperAdvancementSource,"ABILITY:WILL");
 assert.equal(abilitySynergy.helperCounterProjection,null);assert.equal(abilitySynergy.helperAbilityCountersObserved,false);
 assert.equal(abilitySynergy.actingCounterProjection.willHealthAdvancementMark,false);
 assert.equal(Object.isFrozen(cook.system.learning),false);
 assert.equal(cook.system.beginnerAttempts,3);assert.equal(pass.actingCounterProjection.countersBefore.passed,3);
 globalThis.game.user=player;denied({},"CURRENT_SESSION_GM_REQUIRED");
}finally{globalThis.game=oldGame;globalThis.foundry=oldFoundry;}
console.log("PASS Package A saved outcome -> current Skill/BL counters and distinct Helper Synergy; Maximum Nature, Sick, no overrides/default-zero/writes");
