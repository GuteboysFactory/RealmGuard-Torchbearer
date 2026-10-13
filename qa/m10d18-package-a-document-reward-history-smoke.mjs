import assert from "node:assert/strict";
import {tb2ePackageADocumentRewardHistoryPlan as plan} from "../module/m10d18-tb2e-package-a-document-reward-history.mjs";
const oldGame=globalThis.game,oldFoundry=globalThis.foundry;
const forbid=()=>{throw new Error("SIDE_EFFECT");};
class Die {}
const gm={id:"gm1",active:true,isGM:true},player={id:"p1",isGM:false};
const actor={id:"actor1",uuid:"Actor.actor1",documentName:"Actor",type:"character",
 items:[{id:"cook",name:"Cook",type:"role",system:{rating:4}},
   {id:"wise1",name:"Cooking-wise",type:"wise",system:{}},
   {id:"wise2",name:"Bread-wise",type:"wise",system:{}}],
 system:{resources:{fate:{value:0},persona:{value:0}}},testUserPermission:u=>u===player,
 update:forbid,spendTrackedResource:forbid};
const make=(id,faces,timestamp)=>({id,documentName:"ChatMessage",visible:true,isContentVisible:true,
 speaker:{actor:actor.id},speakerActor:actor,author:player,timestamp,
 rolls:[{_evaluated:true,formula:`${faces.length}d6`,total:faces.reduce((a,b)=>a+b,0),
   terms:[Object.assign(new Die(),{faces:6,number:faces.length,modifiers:[],
     results:faces.map(result=>({result,active:true}))})],evaluate:forbid}],update:forbid});
const initial=make("initial",[6,2,3,4,5],1000),deeper=make("deeper",[6],2000),
 ofcourse=make("ofcourse",[5],3000),luck1=make("luck1",[6,4],4000),luck2=make("luck2",[5],5000);
const messages=new Map([initial,deeper,ofcourse,luck1,luck2].map(m=>[m.id,m]));
const die=(message,index)=>`${message}:0:0:${index}`;
const scenarioInput={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
 dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:actor.id,actingConditions:[],conditionsGmReviewed:true};
const d={type:"DEEPER_UNDERSTANDING",messageId:deeper.id,wiseItemId:"wise1",related:true,targetDieId:die("initial",1)};
const o={type:"OF_COURSE",messageId:ofcourse.id,wiseItemId:"wise2",related:true,targetDieIds:[die("initial",2)]};
const l={type:"FATE_LUCK",rounds:[{messageId:"luck1",parentDieIds:[die("initial",0),die("initial",1)]},
 {messageId:"luck2",parentDieIds:[die("luck1",0)]}]};
const base={actorId:actor.id,initialMessageId:initial.id,scenarioInput,events:[d,o,l],
 gmEventLinksReviewed:true,fateAtRollStartGmAsserted:2,personaAtRollStartGmAsserted:1};
const safe=p=>{for(const k of ["liveApplication","rollExecuted","actorWrite","itemWrite",
 "journalWrite","settingsWrite","resourceSpendCommitted","advancementWrite",
 "rollSourceAuthenticated","actorSourceAuthenticated","gmPermissionAuthenticated",
 "rollTimeActorStateVerified","historicalRewardBalanceVerified"])assert.equal(p[k],false,k);
 assert.equal(p.writesPlanned,0);assert.equal(Object.isFrozen(p),true);};
const denied=(overrides,reason)=>{const p=plan({...base,...overrides});safe(p);
 assert.equal(p.ok,false,JSON.stringify(p));assert.equal(p.reasonCode,reason,JSON.stringify(p));};
try {
 globalThis.foundry={dice:{terms:{Die}}};
 globalThis.game={ready:true,system:{id:"realm-guard"},user:gm,
  users:new Map([[gm.id,gm],[player.id,player]]),actors:new Map([[actor.id,actor]]),messages,
  settings:{set:forbid},socket:{emit:forbid}};
 const before=JSON.stringify({actor,messages:[...messages.values()]});
 const good=plan(base);safe(good);assert.equal(good.ok,true,JSON.stringify(good));
 assert.equal(good.rewardTimelinePreview.rawSuccesses,8);
 assert.equal(good.rewardTimelinePreview.finalDiceCount,8);
 assert.equal(good.rewardTimelinePreview.projectedFateCost,2);
 assert.equal(good.rewardTimelinePreview.projectedPersonaTotalCost,1);
 assert.equal(good.savedFacesReadFromDocuments,true);
 assert.equal(good.eventLinksGmAsserted,true);assert.equal(good.immutableChronologyVerified,false);
 assert.equal(good.completeTestHistoryVerified,false);
 assert.equal(good.rewardTimelinePreview.advancementPreview,null);
 assert.deepEqual(good.currentWiseItemsObserved,["wise1","wise2"]);
 assert.deepEqual(good.eventEvidence[0].newResultDieIds,[die("deeper",0)]);
 assert.deepEqual(good.rewardTimelinePreview.dieHistory.filter(x=>x.source==="FATE_LUCK").map(x=>x.parentDieId),
 [die("initial",0),die("initial",1),die("luck1",0)]);
 assert.equal(good.documentEvidence[0].currentRewards.fate,0,"Current zero balance must not replace historical assertion");
 assert.equal(JSON.stringify({actor,messages:[...messages.values()]}),before);
 assert.equal(Object.isFrozen(initial.rolls[0].terms[0].results),false);
 denied({initialDice:[{face:6}]},"UNSUPPORTED_DOCUMENT_HISTORY_FIELDS");
 denied({gmEventLinksReviewed:false},"GM_EVENT_LINK_REVIEW_REQUIRED");
 denied({fateAtRollStartGmAsserted:undefined},"GM_ASSERTED_HISTORICAL_REWARDS_REQUIRED");
 denied({fateAtRollStartGmAsserted:1},"TIMELINE_INSUFFICIENT_FATE");
 denied({personaAtRollStartGmAsserted:0},"TIMELINE_INSUFFICIENT_PERSONA");
 denied({events:[{...d,newFace:4}]},"INVALID_DOCUMENT_EVENT_FIELDS");
 denied({events:[{...d,wiseItemId:"notowned"}]},"CURRENT_ACTOR_WISE_ITEM_REQUIRED");
 denied({events:[{...d,related:false}]},"GM_RELATED_CURRENT_WISE_REQUIRED");
 denied({events:[{...d,targetDieId:die("initial",0)}]},"TIMELINE_DEEPER_REQUIRES_UNREROLLED_FAILED_DIE");
 denied({events:[{...d,targetDieId:"invented"}]},"TIMELINE_DEEPER_REQUIRES_UNREROLLED_FAILED_DIE");
 denied({events:[d,{...o,targetDieIds:[die("initial",1)]}]},"TIMELINE_OF_COURSE_MUST_REROLL_ALL_FAILED_DICE");
 denied({events:[d,{...o,targetDieIds:[die("initial",2),die("initial",2)]}]},"DOCUMENT_OF_COURSE_DICE_TARGET_COUNT_MISMATCH");
 denied({events:[d,{...o,messageId:"deeper"}]},"DOCUMENT_MESSAGE_REUSED");
 denied({events:[{...d,messageId:"initial"}]},"DOCUMENT_MESSAGE_REUSED");
 denied({events:[{...d,messageId:"missing"}]},"EVENT_VISIBLE_CHAT_MESSAGE_REQUIRED");
 const swapTime=deeper.timestamp;deeper.timestamp=initial.timestamp;
 denied({},"DOCUMENT_TIMESTAMP_ORDER_AMBIGUOUS");deeper.timestamp=swapTime;
 deeper.timestamp=999;denied({},"DOCUMENT_TIMESTAMP_ORDER_AMBIGUOUS");deeper.timestamp=swapTime;
 deeper.timestamp=null;denied({},"SAVED_MESSAGE_TIMESTAMP_REQUIRED");deeper.timestamp=swapTime;
 deeper.author=gm;denied({},"DOCUMENT_HISTORY_USER_MISMATCH");deeper.author=player;
 deeper.isContentVisible=false;denied({},"EVENT_VISIBLE_CHAT_MESSAGE_REQUIRED");deeper.isContentVisible=true;
 deeper.speaker.actor="foreign";denied({},"EVENT_WORLD_ACTOR_SPEAKER_MISMATCH");deeper.speaker.actor=actor.id;
 deeper.rolls[0].terms[0].results[0].rerolled=true;
 denied({},"EVENT_MODIFIED_OR_INVALID_DIE_HISTORY_UNSUPPORTED");delete deeper.rolls[0].terms[0].results[0].rerolled;
 actor.items[2].name=" COOKING-WISE ";denied({},"DUPLICATE_CURRENT_WISE_SUBJECT");actor.items[2].name="Bread-wise";
 const lateWise={...d,messageId:"luck2"};
 const earlyLuck={type:"FATE_LUCK",rounds:[{messageId:"luck1",parentDieIds:[die("initial",0)]}]};
 // One natural base six: use a one-die Luck record, then a chronologically later Wise.
 const savedLuck=luck1.rolls;luck1.rolls=make("unused",[4],4000).rolls;
 denied({events:[earlyLuck,lateWise]},"TIMELINE_WISE_REWARD_MUST_PRECEDE_FATE_LUCK");luck1.rolls=savedLuck;
 denied({events:[d,o,{...l,rounds:[{messageId:"luck1",parentDieIds:[die("initial",0),die("initial",2)]},l.rounds[1]]}]},
 "TIMELINE_FATE_LUCK_PARENT_SIXES_MISMATCH");
 denied({events:[d,o,{...l,rounds:[l.rounds[0]]}]},"TIMELINE_FATE_LUCK_EXPLOSION_INCOMPLETE");
 denied({events:[d,o,{...l,rounds:[{messageId:"luck1",parentDieIds:[die("initial",0)]}]}]},
 "DOCUMENT_LUCK_DICE_PARENT_COUNT_MISMATCH");
 actor.items.push({type:"condition",name:"Angry",system:{active:true}});
 const angryScenario={...scenarioInput,actingConditions:["Angry"],gmAngryObstacleDecision:"WAIVE"};
 denied({scenarioInput:angryScenario},"TIMELINE_ANGRY_BLOCKS_WISE_REWARDS");actor.items.pop();
 globalThis.game.user=player;denied({},"CURRENT_SESSION_GM_REQUIRED");
 globalThis.game.user=gm;
 const resultBefore=good.rewardTimelinePreview.resolvedDice.slice();
 deeper.rolls[0].terms[0].results[0].result=4;deeper.rolls[0].total=4;
 const altered=plan({...base,events:[d]});assert.equal(altered.ok,true);assert.equal(altered.rewardTimelinePreview.rawSuccesses,4);
 assert.deepEqual(good.rewardTimelinePreview.resolvedDice,resultBefore,"Previously returned detached evidence must not mutate");
}finally{globalThis.game=oldGame;globalThis.foundry=oldFoundry;}
console.log("PASS Package A saved Wise/Fate dice: current owned Wises, stored event order, parent-six/target links, no historical attestation or writes");
