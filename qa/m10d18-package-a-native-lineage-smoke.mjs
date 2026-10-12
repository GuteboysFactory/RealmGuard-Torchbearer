import assert from "node:assert/strict";
import {tb2ePackageALegacyObservationProbe as begin} from "../module/m10d18-tb2e-package-a-legacy-observation.mjs";
const previous={game:globalThis.game,foundry:globalThis.foundry,Roll:globalThis.Roll};
const forbid=()=>{throw Error("SIDE_EFFECT");};
class Die {}
class Roll {constructor(faces){this._evaluated=true;this.formula=`${faces.length}d6`;this.total=faces.reduce((n,f)=>n+f,0);
 this.terms=[Object.assign(new Die(),{number:faces.length,faces:6,modifiers:[],results:faces.map(result=>({result,active:true}))})];}
 evaluate=forbid;toMessage=forbid;}
const gm={id:"gm",active:true,isGM:true},player={id:"player",active:true,isGM:false};
const skill={id:"cook",type:"role",name:"Cook",system:{rating:4,beginnerAttempts:0,learning:{passed:1,failed:1,passNeeded:4,failNeeded:3}}};
const actor={id:"actor",uuid:"Actor.actor",documentName:"Actor",type:"character",items:[skill,{id:"foodWise",name:"Food-wise",type:"wise"}],
 system:{resources:{fate:{value:2},persona:{value:1}},attributes:{will:{value:4},health:{value:3},nature:{value:2,maximum:4}}},update:forbid};
const options={actorId:"actor",skillItemId:"cook",testId:"test"};
const open=(faces=[1,2,6,4])=>{game.user=gm;actor.system.resources.fate.value=2;const s=begin(options);
 assert.equal(s.ok,true);assert.equal(s.observeBaseRoll(new Roll(faces)).ok,true);return s;};
const wise=(s,faces=[6,4],targetDieIds=["test:base:0","test:base:1"])=>s.observeLegacyWiseRoll({roll:new Roll(faces),targetDieIds,wiseItemId:"foodWise"});
try{
 globalThis.Roll=Roll;globalThis.foundry={dice:{terms:{Die}}};globalThis.game={ready:true,system:{id:"realm-guard"},world:{id:"world"},
 user:gm,users:new Map([["gm",gm],["player",player]]),actors:new Map([["actor",actor]]),settings:{get:()=>"realm-guard-legacy-mixed",set:forbid},
 messages:{create:forbid},socket:{emit:forbid}};
 const before=JSON.stringify(actor),s=open(),reroll=new Roll([6,4]),rerollBefore=JSON.stringify(reroll);
 assert.equal(s.observeLegacyWiseRoll({roll:reroll,targetDieIds:["test:base:0","test:base:1"],wiseItemId:"foodWise"}).ok,true);
 assert.equal(s.observeFateRound({roll:new Roll([6,2]),parentDieIds:["test:base:0","test:base:2"]}).ok,true);
 assert.equal(s.observeFateRound({roll:new Roll([4]),parentDieIds:["test:luck0:0"]}).ok,true);
 assert.equal(JSON.stringify(actor),before);assert.equal(JSON.stringify(reroll),rerollBefore);
 actor.system.resources.fate.value=1;assert.equal(s.observeResourceChange({resource:"fate",amount:1}).ok,true);
 const good=s.finish();assert.equal(good.ok,true,JSON.stringify(good));assert.equal(good.rerollParentHistoryCaptured,true);
 assert.deepEqual(good.baseRecord.dice.map(d=>d.face),[1,2,6,4]);
 assert.deepEqual(good.resolvedObservedDice.map(d=>d.face),[6,4,6,4,6,2,4]);
 assert.equal(good.nativeEventHistory[1].links[0].parentResultDieId,"test:legacyWise:0");
 assert.equal(good.nativeEventHistory[1].links[1].parentResultDieId,"test:base:2");
 assert.equal(good.nativeEventHistory[2].links[0].parentResultDieId,"test:luck0:0");
 assert.equal(Object.isFrozen(good.nativeEventHistory[0].record.dice),true);
 for(const key of ["rollExecuted","actorWrite","resourceSpendCommitted","captureStorageImplemented","legacyHookInstalled",
 "captureOfLegacyExecutionProven","rollSourceAuthenticated","spendCauseAuthenticated","completeTestHistoryVerified",
 "torchbearerWiseEffectEquivalent","finalOutcomeDerived","compatibleWithCompleteProspectiveTrace"])assert.equal(good[key],false,key);
 assert.equal(good.writesPlanned,0);reroll.terms[0].results[0].result=1;
 assert.equal(good.nativeEventHistory[0].record.dice[0].face,6);
 const fail=(stage,reason)=>{const session=open();const r=stage(session);assert.equal(r.ok,false);if(reason)assert.equal(r.reasonCode,reason);
 assert.equal(session.finish().reasonCode,"OBSERVATION_SESSION_TERMINAL");};
 fail(session=>wise(session,[4],["test:base:0"]),"OBSERVATION_LEGACY_WISE_TARGET_SET_MISMATCH");
 fail(session=>session.observeLegacyWiseRoll({roll:new Roll([4,4]),targetDieIds:["test:base:0","test:base:1"],wiseItemId:"other"}),"OBSERVATION_CURRENT_WISE_REQUIRED");
 fail(session=>wise(session,[4]),"OBSERVATION_REROLL_RESULT_COUNT_MISMATCH");
 fail(session=>{wise(session);return wise(session);},"OBSERVATION_LEGACY_WISE_STAGE_INVALID");
 fail(session=>session.observeFateRound({roll:new Roll([4]),parentDieIds:["test:base:1"]}),"OBSERVATION_FATE_PARENT_SET_MISMATCH");
 fail(session=>{wise(session);return session.observeFateRound({roll:new Roll([4]),parentDieIds:["test:base:0"]});},"OBSERVATION_FATE_PARENT_SET_MISMATCH");
 fail(session=>{session.observeFateRound({roll:new Roll([4]),parentDieIds:["test:base:2"]});return wise(session);},"OBSERVATION_LEGACY_WISE_STAGE_INVALID");
 const incomplete=open([6,1]);incomplete.observeFateRound({roll:new Roll([6]),parentDieIds:["test:base:0"]});
 assert.equal(incomplete.finish().reasonCode,"OBSERVATION_FATE_CHAIN_INCOMPLETE");
 const unpaid=open([6]);unpaid.observeFateRound({roll:new Roll([4]),parentDieIds:["test:base:0"]});
 assert.equal(unpaid.finish().reasonCode,"OBSERVATION_FATE_DELTA_MISSING");
 const plain=open([6,4]);assert.equal(plain.finish().ok,true,"No Luck use requires no child rolls or Fate delta");
 const onlyWise=open([1,2]);wise(onlyWise,[4,5]);const freeWise=onlyWise.finish();
 assert.equal(freeWise.ok,true);assert.deepEqual(freeWise.resourceChanges,[]);assert.equal(freeWise.torchbearerWiseEffectEquivalent,false);
 const denied=open();game.user=player;let reads=0;
 assert.equal(denied.observeFateRound({get roll(){reads++;throw Error("PRIVATE_DICE");},parentDieIds:[]}).reasonCode,"CURRENT_SESSION_GM_REQUIRED");
 assert.equal(reads,0);
 const reused=open([6]);const sameRoll=new Roll([6]);reused.observeFateRound({roll:sameRoll,parentDieIds:["test:base:0"]});
 assert.equal(reused.observeFateRound({roll:sameRoll,parentDieIds:["test:luck0:0"]}).reasonCode,"OBSERVATION_NATIVE_ROLL_REUSED");
 const limit=open([6]);let parent="test:base:0";
 for(let i=0;i<30;i++){assert.equal(limit.observeFateRound({roll:new Roll([6]),parentDieIds:[parent]}).ok,true);parent=`test:luck${i}:0`;}
 assert.equal(limit.observeFateRound({roll:new Roll([4]),parentDieIds:[parent]}).reasonCode,"OBSERVATION_FATE_STAGE_INVALID");
 const slots=open(Array(250).fill(6));
 slots.observeFateRound({roll:new Roll(Array(250).fill(6)),parentDieIds:Array.from({length:250},(_,i)=>`test:base:${i}`)});
 assert.equal(slots.observeFateRound({roll:new Roll(Array(250).fill(1)),parentDieIds:Array.from({length:250},(_,i)=>`test:luck0:${i}`)}).reasonCode,
 "OBSERVATION_DICE_HISTORY_LIMIT");
 const ambiguous=open([6]);ambiguous.observeFateRound({roll:new Roll([4]),parentDieIds:["test:base:0"]});
 actor.system.resources.fate.value=1;ambiguous.observeResourceChange({resource:"fate",amount:1});
 actor.system.resources.fate.value=0;ambiguous.observeResourceChange({resource:"fate",amount:1});
 assert.equal(ambiguous.finish().reasonCode,"OBSERVATION_FATE_DELTA_AMBIGUOUS");
}finally{Object.assign(globalThis,previous);}
console.log("PASS native Legacy Wise target/result and recursive Fate parent/result lineage; original records preserved, incomplete/duplicate/private rejection, no TB relabeling/RNG/spend/write/storage");
