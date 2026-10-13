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
const actor={id:"actor",uuid:"Actor.actor",documentName:"Actor",type:"character",items:[skill],
 system:{resources:{fate:{value:3},persona:{value:1}},attributes:{will:{value:4},health:{value:3},nature:{value:2,maximum:4}}},update:forbid};
let profile="realm-guard-legacy-mixed";
const options={actorId:"actor",skillItemId:"cook",testId:"test1"};
const reset=()=>{game.user=gm;game.world.id="world";profile="realm-guard-legacy-mixed";
 actor.system.resources.fate.value=3;actor.system.resources.persona.value=1;skill.system.rating=4;};
const safe=r=>{for(const key of ["actorWrite","itemWrite","settingsWrite","rollExecuted","resourceSpendCommitted",
 "completeTestHistoryVerified","rollSourceAuthenticated","actorSourceAuthenticated","gmPermissionAuthenticated",
 "rollTimeActorStateVerified","historicalRewardBalanceVerified","captureStorageImplemented","legacyHookInstalled"])
 assert.equal(r[key],false,key);assert.equal(r.writesPlanned,0);};
try{
 globalThis.Roll=Roll;globalThis.foundry={dice:{terms:{Die}}};globalThis.game={ready:true,system:{id:"realm-guard"},
 world:{id:"world"},user:gm,users:new Map([["gm",gm],["player",player]]),actors:new Map([["actor",actor]]),
 settings:{get:()=>profile,set:forbid},socket:{emit:forbid},messages:{create:forbid}};
 const sourceBefore=JSON.stringify(actor),input={...options},session=begin(input);safe(session);assert.equal(session.ok,true);
 input.testId="tampered";const raw=new Roll([6,4,2,1]);assert.equal(session.observeBaseRoll(raw).ok,true);
 const finished=session.finish();safe(finished);assert.equal(finished.status,"OBSERVED_UNPERSISTED");
 assert.equal(finished.testIdentity.testId,"test1");assert.equal(finished.baseRecord.dice[0].dieId,"test1:base:0");
 assert.equal(finished.compatibleWithCompleteProspectiveTrace,false);assert.equal(finished.captureOfLegacyExecutionProven,false);
 assert.equal(finished.finalOutcomeDerived,false);assert.equal(JSON.stringify(actor),sourceBefore);
 raw.terms[0].results[0].result=1;assert.equal(finished.baseRecord.dice[0].face,6);
 assert.equal(Object.isFrozen(finished.baseRecord.dice),true);assert.equal(Object.isFrozen(raw),false);
 assert.equal(session.finish().reasonCode,"OBSERVATION_SESSION_TERMINAL");
 const spendSession=begin(options);spendSession.observeBaseRoll(new Roll([1,2,3,4]));
 // Fixture simulates a change by Legacy; observer must not call actor.update.
 actor.system.resources.fate.value=2;
 assert.equal(spendSession.observeResourceChange({resource:"fate",amount:1}).ok,true);
 const spent=spendSession.finish();safe(spent);assert.deepEqual(spent.resourceChanges[0],
 {sequence:0,actorId:"actor",resource:"fate",amount:1,before:3,after:2});
 assert.equal(spent.observedEndingRewards.fate,2);assert.equal(actor.system.resources.fate.value,2);
 reset();const fake=begin(options);fake.observeBaseRoll(new Roll([1]));
 assert.equal(fake.observeResourceChange({resource:"fate",amount:1}).reasonCode,"OBSERVATION_RESOURCE_DELTA_MISMATCH");
 assert.equal(fake.finish().reasonCode,"OBSERVATION_SESSION_TERMINAL");
 for(const change of [()=>game.user=player,()=>game.world.id="other",()=>profile="torchbearer2e",()=>skill.system.rating=3]){
  reset();const s=begin(options);s.observeBaseRoll(new Roll([1]));change();assert.equal(s.finish().ok,false);
 }
 reset();let reads=0;const denied=begin(options);game.user=player;
 const malicious={get constructor(){reads++;throw Error("PRIVATE_DICE_ACCESS");}};
 assert.equal(denied.observeBaseRoll(malicious).reasonCode,"CURRENT_SESSION_GM_REQUIRED");assert.equal(reads,0);
 reset();assert.equal(begin(options).finish().reasonCode,"OBSERVATION_NATIVE_BASE_MISSING");
 const abort=begin(options);assert.equal(abort.abort().reasonCode,"OBSERVATION_ABORTED_BY_CALLER");
 assert.equal(abort.observeBaseRoll(new Roll([4])).reasonCode,"OBSERVATION_SESSION_TERMINAL");
 const unrecorded=begin(options);unrecorded.observeBaseRoll(new Roll([4]));actor.system.resources.persona.value=0;
 assert.equal(unrecorded.finish().reasonCode,"OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
 reset();const duplicate=begin(options);duplicate.observeBaseRoll(new Roll([4]));
 assert.equal(duplicate.observeBaseRoll(new Roll([4])).reasonCode,"OBSERVATION_BASE_ALREADY_RECORDED");
 for(const corrupt of [r=>r._evaluated=false,r=>r.total=99,r=>r.terms[0].modifiers=["x"],r=>r.terms[0].results[0].rerolled=true]){
  reset();const s=begin(options),r=new Roll([4]);corrupt(r);assert.equal(s.observeBaseRoll(r).ok,false);
  assert.equal(s.finish().reasonCode,"OBSERVATION_SESSION_TERMINAL");
 }
 reset();const concurrent1=begin(options),concurrent2=begin({...options,testId:"test2"});
 concurrent1.observeBaseRoll(new Roll([4]));concurrent2.observeBaseRoll(new Roll([4]));actor.system.resources.fate.value=2;
 concurrent1.observeResourceChange({resource:"fate",amount:1});assert.equal(concurrent1.finish().ok,true);
 assert.equal(concurrent2.finish().reasonCode,"OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
 // One current delta can be observed by two sessions. This is NOT a spend
 // attribution/commit lock; coordinated reuse must never gain replay proof.
 reset();const first=begin(options),second=begin({...options,testId:"test2"});
 first.observeBaseRoll(new Roll([4]));second.observeBaseRoll(new Roll([4]));actor.system.resources.fate.value=2;
 first.observeResourceChange({resource:"fate",amount:1});second.observeResourceChange({resource:"fate",amount:1});
 const shared=second.finish();assert.equal(first.finish().ok,true);assert.equal(shared.ok,true);
 assert.equal(shared.duplicateTestCheckAuthenticated,false);assert.equal(shared.historicalRewardBalanceVerified,false);
 reset();const interrupted=begin(options),get=game.settings.get;game.settings.get=()=>{throw Error("PRIVATE_BACKEND_ERROR");};
 assert.equal(interrupted.abort().reasonCode,"OBSERVATION_ABORT_READ_FAILED");game.settings.get=get;
 assert.equal(interrupted.finish().reasonCode,"OBSERVATION_SESSION_TERMINAL");
}finally{Object.assign(globalThis,previous);}
console.log("PASS explicit Legacy observation probe: native scalar copies/current GM/profile/source checks, observed resource deltas, terminal abort/incomplete/concurrency; no RNG/spends/storage/hooks/authentication");
