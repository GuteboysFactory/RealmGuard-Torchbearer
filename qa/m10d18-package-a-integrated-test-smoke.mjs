import assert from "node:assert/strict";
import {tb2ePackageAIntegratedTestPlan as plan} from "../module/m10d18-tb2e-package-a-participation-progress.mjs";
import {tb2ePackageAEquipmentRewardHistoryPlan as bridge} from "../module/m10d18-tb2e-package-a-document-reward-history.mjs";
const oldGame=globalThis.game,oldFoundry=globalThis.foundry;
const forbid=()=>{throw new Error("SIDE_EFFECT");};
class Die {}
const gm={id:"gm",active:true,isGM:true},player={id:"player",active:true,isGM:false};
const role=(id,name,rating)=>({id,name,type:"role",system:{rating,beginnerAttempts:0,
 learning:{passed:0,failed:0,passNeeded:1,failNeeded:1}}});
const pack={id:"pack",name:"Backpack",type:"gear",system:{quantity:1,
 inventory:{mode:"worn",location:"torso",containerId:"",containerType:"backpack"}}};
const actor=(id,items)=>({id,uuid:`Actor.${id}`,documentName:"Actor",type:"character",items,
 system:{resources:{fate:{value:0},persona:{value:0}},attributes:{will:{value:4},health:{value:3},nature:{value:2,maximum:4}}},
 testUserPermission:u=>u===player,update:forbid});
const acting=actor("acting",[role("cook","Cook",4),pack,{id:"wise",name:"Food-wise",type:"wise"}]);
const helper=actor("helper",[role("alchemy","Alchemist",2)]);
const message=(id,faces,timestamp)=>({id,timestamp,documentName:"ChatMessage",visible:true,isContentVisible:true,
 speaker:{actor:acting.id},speakerActor:acting,author:player,update:forbid,
 rolls:[{_evaluated:true,formula:`${faces.length}d6`,total:faces.reduce((a,b)=>a+b,0),evaluate:forbid,
 terms:[Object.assign(new Die(),{number:faces.length,faces:6,modifiers:[],results:faces.map(result=>({result,active:true}))})]}]});
const first=message("base",[1,2,3,1,2],1),reroll=message("deeper",[4],2);
const help={helperId:helper.id,helperConditions:[],conditionsGmReviewed:true,actingPlayerAccepted:true,
 describedRelevantAction:true,gmApprovedRelevance:true,helpOptions:{sourceKind:"skill",sourceName:"Alchemist",testName:"Cook",suggestedHelpSkill:true}};
const scenario={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,dwarvenCraftingNature:false,
 isCraftingTest:false,toolsInadequate:false,suppliesUsed:0,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:acting.id,actingConditions:[],conditionsGmReviewed:true,help};
const base={actorId:acting.id,messageId:first.id,scenarioInput:scenario,helpSourceItemId:"alchemy",
 equipmentReview:{pack:{itemId:"pack",usableGmAsserted:true},borrowedTools:null,supply:null,gear:null,adequacyGmReviewed:true},
 rewardReview:{events:[{type:"DEEPER_UNDERSTANDING",messageId:"deeper",wiseItemId:"wise",related:true,targetDieId:"base:0:0:0"}],
 gmEventLinksReviewed:true,fateAtRollStartGmAsserted:1,personaAtRollStartGmAsserted:0},
 progressReview:{gmConfirmedLegalTest:true,gmConfirmsCountersExcludeThisTest:true,gmConfirmsHistoricalEligibility:true,context:"ADVENTURE"},
 synergyReview:{fateAtRollStartGmAsserted:1,committedBeforeRollGmAsserted:true}};
try{
 globalThis.foundry={dice:{terms:{Die}}};globalThis.game={ready:true,system:{id:"realm-guard"},user:gm,
 users:new Map([[gm.id,gm],[player.id,player]]),actors:new Map([[acting.id,acting],[helper.id,helper]]),
 messages:new Map([[first.id,first],[reroll.id,reroll]]),settings:{set:forbid},socket:{emit:forbid}};
 const before=JSON.stringify([acting,helper,first,reroll]);
 const good=plan(base);assert.equal(good.ok,true,JSON.stringify(good));
 assert.equal(good.initialOutcome,"FAIL");assert.equal(good.finalOutcome,"PASS");
 assert.equal(good.actingProgressPlan.proposedMark,"PASS");assert.equal(good.helperSynergyPreview.advancementPreview,"PASS");
 for(const projection of [good.actingCounterProjection,good.helperCounterProjection])
   assert.deepEqual(projection.countersAfterPreview,{passed:1,failed:0});
 assert.strictEqual(good.equipmentEvidence.participationEvidence,good.participationEvidence);
 assert.strictEqual(good.rewardHistoryEvidence.documentEvidence[0],good.participationEvidence.documentEvidence);
 assert.equal(good.writesPlanned,0);assert.equal(good.rollExecuted,false);assert.equal(good.rollSourceAuthenticated,false);
 assert.equal(JSON.stringify([acting,helper,first,reroll]),before);assert.deepEqual(plan(base),good);
 assert.equal(plan({...base,outcome:"PASS"}).reasonCode,"UNSUPPORTED_INTEGRATED_TEST_FIELDS");
 assert.equal(plan({...base,rewardReview:{...base.rewardReview,initialMessageId:"other"}}).ok,false);
 assert.equal(plan({...base,rewardReview:{...base.rewardReview,fateAtRollStartGmAsserted:0}}).ok,false);
 const bridgeInput={actorId:acting.id,initialMessageId:first.id,scenarioInput:scenario,...base.rewardReview};
 assert.equal(bridge({...good.equipmentEvidence},bridgeInput).reasonCode,"ISSUED_EQUIPMENT_CONTEXT_REQUIRED");
 assert.equal(bridge(good.equipmentEvidence,{...bridgeInput,scenarioInput:{...scenario,rating:5}}).ok,false);
 const plain=plan({...base,rewardReview:{...base.rewardReview,events:[]}});
 assert.equal(plain.finalOutcome,"FAIL");assert.equal(plain.helperCounterProjection.proposedMark,"FAIL");
 // DH 59,75 and SG 87: BL attempt follows this same final result; helper
 // records the helping Skill. Deeper creates a six before a saved Luck child.
 acting.items[0].system.rating=0;helper.items=[role("helperCook","Cook",2)];
 const blHelp={...help,helpOptions:{sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook",helperSkillTrained:true}};
 const blFirst=message("base",[1,2,3],1),blDeeper=message("deeper",[6],2),luck=message("luck",[4],3);
 globalThis.game.messages=new Map([["base",blFirst],["deeper",blDeeper],["luck",luck]]);
 const blInput={...base,helpSourceItemId:"helperCook",scenarioInput:{...scenario,mode:"BEGINNERS_LUCK",
   beginnerAbilityName:"WILL",help:blHelp,equipment:{...scenario.equipment,hasSkill:false}},
   rewardReview:{...base.rewardReview,fateAtRollStartGmAsserted:2,events:[...base.rewardReview.events,
     {type:"FATE_LUCK",rounds:[{messageId:"luck",parentDieIds:["base:0:0:0"]}]}]}};
 const bl=plan(blInput);assert.equal(bl.ok,true,JSON.stringify(bl));
 assert.equal(bl.initialOutcome,"FAIL");assert.equal(bl.finalOutcome,"PASS");
 assert.equal(bl.actingCounterProjection.attemptWouldBeAdded,1);
 assert.equal(bl.actingCounterProjection.willHealthAdvancementMark,false);
 assert.equal(bl.helperCounterProjection.proposedMark,"PASS");
 assert.equal(plan({...blInput,rewardReview:{...blInput.rewardReview,fateAtRollStartGmAsserted:1}}).ok,false);
 assert.equal(plan({...blInput,progressReview:{...base.progressReview,gmConfirmsCountersExcludeThisTest:false}}).ok,false);
 globalThis.game.user=player;assert.equal(plan(base).ok,false);
 assert.equal(bridge(good.equipmentEvidence,bridgeInput).reasonCode,"CURRENT_SESSION_GM_REQUIRED");
}finally{globalThis.game=oldGame;globalThis.foundry=oldFoundry;}
console.log("PASS integrated equipment/participants/saved reward FAIL->PASS/acting+helper marks; shared context, no writes or caller outcome override");
