import assert from "node:assert/strict";
import {tb2ePackageAProspectiveTracePlan as plan} from "../module/m10d18-tb2e-package-a-prospective-trace.mjs";
const roll=(recordId,faces)=>({recordId,faces,formula:`${faces.length}d6`,evaluated:true,total:faces.reduce((n,f)=>n+f,0)});
const participant=(actorId,itemId,name,rating,fate)=>({actorId,ownerUserIds:["player"],ownedItemIds:[itemId],
 conditions:[],source:{kind:"SKILL",itemId,name,rating},rewards:{fate,persona:0},counters:{passed:0,failed:0}});
const acting=participant("actor","cook","Cook",4,2);acting.ownedItemIds.push("foodWise");
const helper=participant("helper","helperCook","Cook",3,1);
const help={helperId:"helper",helperConditions:[],conditionsGmReviewed:true,describedRelevantAction:true,
 actingPlayerAccepted:true,gmApprovedRelevance:true,helpOptions:{sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}};
const scenario={skillName:"Cook",mode:"SKILL",rating:4,
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"small_group"}},
 equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,dwarvenCraftingNature:false,
 isCraftingTest:false,toolsInadequate:false,suppliesUsed:0,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:"actor",actingConditions:[],conditionsGmReviewed:true,help};
const events=[
 {eventId:"synergy",type:"SYNERGY_COMMIT",helperId:"helper",sourceItemId:"helperCook"},
 {eventId:"helperSpend",type:"SPEND",actorId:"helper",resource:"fate",amount:1,before:1,after:0,forEventId:"synergy"},
 {eventId:"base",type:"BASE_ROLL",roll:roll("baseDice",[1,2,3,1,2])},
 {eventId:"deeper",type:"DEEPER_UNDERSTANDING",wiseItemId:"foodWise",related:true,targetDieIds:["baseDice:0"],roll:roll("deeperDice",[6])},
 {eventId:"deeperSpend",type:"SPEND",actorId:"actor",resource:"fate",amount:1,before:2,after:1,forEventId:"deeper"},
 {eventId:"luck",type:"FATE_LUCK",rounds:[{parentDieIds:["baseDice:0"],roll:roll("luckDice",[4])}]},
 {eventId:"luckSpend",type:"SPEND",actorId:"actor",resource:"fate",amount:1,before:1,after:0,forEventId:"luck"},
 {eventId:"final",type:"FINAL",outcome:"PASS"}
].map((e,sequence)=>({...e,sequence,testId:"test1"}));
const trace={schemaVersion:1,producer:"LEGACY_MIXED",status:"COMPLETE",worldId:"world1",sessionId:"session1",
 testId:"test1",actorId:"actor",author:{userId:"player",role:"OWNER",gmId:"gm"},participants:[acting,helper],events};
const input={trace,scenarioInput:scenario,gmTraceReviewed:true,previousTestIds:[]};
const oldGame=globalThis.game;globalThis.game=new Proxy({}, {get(){throw Error("AMBIENT_RUNTIME_ACCESS_FORBIDDEN");}});
try{
 const before=JSON.stringify(input),good=plan(input);assert.equal(good.ok,true,JSON.stringify(good));
 assert.equal(good.finalOutcome,"PASS");assert.equal(good.rewardTimelinePreview.projectedFateCost,2);
 assert.deepEqual(good.declaredBalancesAfter.map(p=>p.rewards.fate),[0,0]);
 for(const key of ["captureImplemented","completeTestHistoryVerified","rollSourceAuthenticated","actorSourceAuthenticated",
 "gmPermissionAuthenticated","playerConsentAuthenticated","historicalRewardBalanceVerified","rollTimeActorStateVerified",
 "duplicateTestCheckAuthenticated","immutableChronologyVerified","rollExecuted","resourceSpendCommitted","actorWrite","itemWrite"])
 assert.equal(good[key],false,key);
 assert.equal(good.writesPlanned,0);assert.equal(JSON.stringify(input),before);assert.equal(Object.isFrozen(input.trace),false);
 assert.equal(Object.isFrozen(good.rewardTimelinePreview.dieHistory),true);assert.deepEqual(plan(input),good);
 const denied=change=>{const copy=structuredClone(input);change(copy);const p=plan(copy);assert.equal(p.ok,false,JSON.stringify(p));assert.equal(p.writesPlanned,0);};
 denied(c=>c.previousTestIds.push("test1"));denied(c=>c.gmTraceReviewed=false);
 denied(c=>c.trace.status="PENDING");denied(c=>c.trace.author.userId="intruder");
 denied(c=>c.trace.author.role="PLAYER");denied(c=>c.trace.author.role="GM");
 denied(c=>c.trace.events[3].testId="other");denied(c=>c.trace.events[4].sequence=8);
 denied(c=>c.trace.events[4].eventId="helperSpend");denied(c=>c.trace.events[3].roll.recordId="baseDice");
 denied(c=>c.trace.events[4].before=3);denied(c=>c.trace.events[4].after=0);
 denied(c=>c.trace.events[6].forEventId="deeper");denied(c=>c.trace.events[6].resource="persona");
 denied(c=>c.trace.events[6].actorId="helper");denied(c=>c.trace.events[6].type="UNSUPPORTED");
 denied(c=>c.trace.events[1].sequence=3);denied(c=>c.trace.events[3].targetDieIds=["other:0"]);
 denied(c=>c.trace.events[5].rounds[0].parentDieIds=["baseDice:1"]);
 denied(c=>c.trace.events[5].rounds[0].roll.faces=[6]); // incomplete recursive chain
 denied(c=>c.trace.events[7].outcome="FAIL");denied(c=>c.trace.events[2].roll.total=999);
 denied(c=>c.trace.events[2].roll.faces[0]=0);denied(c=>c.trace.events[2].roll.evaluated=false);
 denied(c=>c.trace.participants[0].ownedItemIds=["cook"]);
 denied(c=>c.trace.participants[0].source.rating=3);denied(c=>c.trace.participants[1].source.name="Laborer");
 denied(c=>c.trace.participants[0].rewards.fate=null);denied(c=>c.trace.participants[0].counters.passed="0");
 denied(c=>c.trace.events.pop());denied(c=>c.trace.events[6].forEventId="missing");
 denied(c=>c.trace.events[3].roll={...c.trace.events[3].roll,authenticated:true});
 denied(c=>c.trace.events.push({...c.trace.events[7],eventId:"late",sequence:8}));
 // A consistent fabricated author/snapshot remains acceptable as declarations,
 // never evidence of real ownership/authenticated rolls. This is the trust limit.
 const fabricated=structuredClone(input);fabricated.trace.author.userId="invented";
 fabricated.trace.participants[0].ownerUserIds=["invented"];
 assert.equal(plan(fabricated).ok,true);assert.equal(plan(fabricated).actorSourceAuthenticated,false);
 const bl=structuredClone(input);bl.scenarioInput.mode="BEGINNERS_LUCK";bl.scenarioInput.beginnerAbilityName="WILL";
 bl.scenarioInput.equipment.hasSkill=false;
 bl.scenarioInput.help.helpOptions={sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook",helperSkillTrained:true};
 bl.trace.participants[0].source={kind:"ABILITY",itemId:null,name:"WILL",rating:4};bl.trace.participants[0].counters=null;
 bl.trace.events[2].roll=roll("baseDice",[1,2,3]);
 bl.trace.events[5].rounds=[{parentDieIds:["baseDice:0"],roll:roll("luckDice",[6])},
   {parentDieIds:["luckDice:0"],roll:roll("luckDice2",[4])}];
 assert.equal(plan(bl).ok,true,JSON.stringify(plan(bl)));assert.equal(plan(bl).finalOutcome,"PASS");
 bl.trace.participants[0].counters={passed:0,failed:0};
 assert.equal(plan(bl).reasonCode,"TRACE_ABILITY_WISE_COUNTERS_NOT_SUPPORTED_BY_CURRENT_MODEL");
}finally{globalThis.game=oldGame;}
console.log("PASS proposed Legacy trace contract: identity/declared ownership/dice/spend chains/replay set; no capture, ambient runtime, writes or authentication claims");
