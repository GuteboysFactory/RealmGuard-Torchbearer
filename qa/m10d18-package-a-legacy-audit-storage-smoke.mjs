import assert from "node:assert/strict";
import {tb2ePackageASavedLegacyAuditEvidence as read} from "../module/m10d18-tb2e-package-a-saved-legacy-audit.mjs";
globalThis.Actor=class {};globalThis.Item=class {};
const gm={id:"gm",active:true,isGM:true},player={id:"player",active:true,isGM:false};
let rollCalls=0,spendCalls=0,nextId=0,facesQueue=[],messages=[],storageFail=false;
class Die {}
class Roll {constructor(formula){this.formula=formula;this._evaluated=false;}
 toJSON(){return {formula:this.formula,faces:this.terms[0].results.map(d=>d.result)};}
 static fromData(data){const r=new Roll(data.formula);r.assign(data.faces);return r;}
 async evaluate(){rollCalls++;const faces=facesQueue.shift();assert.equal(faces?.length,Number(this.formula.split("d")[0]));
  this.assign(faces);return this;}
 assign(faces){this._evaluated=true;this.total=faces.reduce((n,f)=>n+f,0);this.terms=[Object.assign(new Die(),
  {number:faces.length,faces:6,modifiers:[],results:faces.map(result=>({result,active:true}))})];this.dice=this.terms;}
}
globalThis.Roll=Roll;globalThis.foundry={dice:{terms:{Die}},utils:{escapeHTML:s=>String(s),randomID:()=>`test${++nextId}`},
 applications:{api:{DialogV2:{wait:async()=>false}}}};
globalThis.ui={notifications:{warn:()=>{}}};
globalThis.game={ready:true,version:"13.351",system:{id:"realm-guard",version:"1.13.0-qa.29"},world:{id:"world"},
 user:gm,users:new Map([["gm",gm],["player",player]]),actors:new Map(),messages:new Map(),
 settings:{get:(_ns,key)=>({activeRulesProfileId:"realm-guard-legacy-mixed",activeRulesProfileVersion:1,
  systemSchemaVersion:1,coreArchitectureVersion:"0.1",migrationHistory:"[]",useTurnManager:false}[key]),set:()=>{throw Error("SETTINGS_WRITE");}}};
globalThis.ChatMessage={getSpeaker:({actor})=>({actor:actor.id,scene:"scene"}),
 async create(data){if(data.flags&&storageFail)throw Error("PRIVATE_STORAGE_FAILURE");
  const rolls=(data.rolls||[]).map(r=>{const copy=new Roll(r.formula);copy.assign(r.terms[0].results.map(d=>d.result));return copy;});
  const savedFlags=structuredClone(data.flags||{});
  // Model owns/mutates its supplied data: gameplay's original Roll must survive.
  if(data.flags&&data.rolls?.[0])data.rolls[0].terms[0].results[0].result=6;
  if(data.flags?.["realm-guard"]?.packageAAudit?.nativeObservation)
    data.flags["realm-guard"].packageAAudit.nativeObservation.baseRecord.dice[0].face=6;
  const m={id:`msg${++nextId}`,documentName:"ChatMessage",visible:true,isContentVisible:true,author:game.user,
   timestamp:nextId,whisper:data.whisper||[],speaker:data.speaker,content:data.content,flags:savedFlags,rolls,
   get speakerActor(){return game.actors.get(this.speaker.actor);},async update(change){Object.assign(this,change);return this;}};
  messages.push(m);game.messages.set(m.id,m);return m;}};
const {RealmGuardActor}=await import("../module/documents.mjs");
const actor=new RealmGuardActor(),skill={id:"cook",type:"role",name:"Cook",system:{rating:4,beginnerAttempts:0,
 learning:{passed:1,failed:1,passNeeded:4,failNeeded:3}}};
const items=[skill];items.get=id=>items.find(i=>i.id===id);
Object.assign(actor,{id:"actor",uuid:"Actor.actor",documentName:"Actor",type:"character",name:"Cook tester",items,
 system:{attributes:{will:{value:4},health:{value:3},nature:{value:2,maximum:4}},resources:{fate:{value:2},persona:{value:1}}},
 update:()=>{throw Error("UNEXPECTED_ACTOR_WRITE");},testUserPermission:u=>u===player});
actor._askFateAfterSixes=async()=>false;
actor.spendTrackedResource=async(kind,amount)=>{spendCalls++;actor.system.resources[kind].value-=amount;return {ok:true,spent:amount};};
game.actors.set(actor.id,actor);
const reset=()=>{game.user=gm;game.world.id="world";actor.system.resources.fate.value=2;actor.system.resources.persona.value=1;
 facesQueue=[];rollCalls=0;spendCalls=0;messages=[];game.messages.clear();storageFail=false;actor._askFateAfterSixes=async()=>false;};
reset();facesQueue=[[1,2,4,5]];const control=await actor.rollRole(skill,{obstacle:2}),controlContent=messages[0].content;
assert.equal(rollCalls,1);assert.equal(messages.length,1);assert.deepEqual(messages[0].flags,{});
reset();facesQueue=[[1,2,4,5]];const before=JSON.stringify(actor.system),captured=await actor.rollRoleWithAudit(skill,{obstacle:2});
assert.equal(captured.audit.ok,true,JSON.stringify(captured));assert.equal(rollCalls,1);assert.equal(spendCalls,0);
assert.equal(captured.roll.terms[0].results[0].result,1);
assert.equal(JSON.stringify(actor.system),before);assert.equal(messages.length,2);assert.equal(messages[0].content,controlContent);
for(const key of ["successes","sixes","passed","margin","outcome","fateSpent"])
 assert.equal(captured[key],control[key],key);
const trace=messages[1];assert.deepEqual(trace.whisper,["gm"]);assert.equal(trace.rolls.length,1);assert.equal(trace.speaker.scene,undefined);
assert.equal(trace.flags["realm-guard"].packageAAudit.legacyMessageId,messages[0].id);
const seen=read({traceMessageId:trace.id});assert.equal(seen.ok,true,JSON.stringify(seen));assert.deepEqual(seen.baseFaces,[1,2,4,5]);
assert.equal(seen.recordedLegacyOutcome,"PASS");
for(const key of ["actorWrite","itemWrite","settingsWrite","rollExecuted","resourceSpendCommitted","rollSourceAuthenticated",
 "actorSourceAuthenticated","gmPermissionAuthenticated","historicalRewardBalanceVerified","rollTimeActorStateVerified",
 "completeTestHistoryVerified","duplicateTestCheckAuthenticated"])assert.equal(seen[key],false,key);
assert.equal(seen.writesPlanned,0);assert.equal(rollCalls,1);assert.equal(Object.isFrozen(seen.baseFaces),true);
// Simulate a serialized native/flag reload, not a live Foundry acceptance run.
const serialized=JSON.parse(JSON.stringify({flags:trace.flags,faces:trace.rolls[0].terms[0].results.map(d=>d.result)}));
const restoredRoll=new Roll("4d6");restoredRoll.assign(serialized.faces);
game.messages.set(trace.id,{...trace,flags:serialized.flags,rolls:[restoredRoll]});
assert.equal(read({traceMessageId:trace.id}).ok,true);assert.equal(rollCalls,1);game.messages.set(trace.id,trace);
const r=trace.flags["realm-guard"].packageAAudit;
r.nativeObservation.baseRecord.dice[0].face=6;assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_NATIVE_BASE_MISMATCH");
r.nativeObservation.baseRecord.dice[0].face=1;r.legacyOutcome.outcome="FAIL";
assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_FINAL_MISMATCH");r.legacyOutcome.outcome="PASS";
r.authenticated=true;assert.equal(read({traceMessageId:trace.id}).reasonCode,"EDITABLE_AUDIT_ATTESTATION_REJECTED");r.authenticated=false;
const baseFlags=structuredClone(trace.flags);
const rejectBase=(mutate,reason)=>{
 trace.flags=structuredClone(baseFlags);mutate(trace.flags["realm-guard"].packageAAudit);
 assert.equal(read({traceMessageId:trace.id}).reasonCode,reason);trace.flags=structuredClone(baseFlags);
};
rejectBase(r=>r.nativeObservation.currentGmId="other","SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
rejectBase(r=>r.nativeObservation.startingActorSnapshot.currentGmId="other","SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
rejectBase(r=>r.nativeObservation.startingActorSnapshot.actorId="other","SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
rejectBase(r=>r.nativeObservation.startingActorSnapshot.actorUuid="Actor.other","SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
rejectBase(r=>r.skillItemId="unknown","SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
rejectBase(r=>r.nativeObservation.skillSource.rating=5,"SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
rejectBase(r=>r.nativeObservation.startingActorSnapshot.currentSkillItems.push({...r.nativeObservation.skillSource}),"SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
for(const flag of ["rollSourceAuthenticated","actorSourceAuthenticated","gmPermissionAuthenticated","spendCauseAuthenticated",
 "captureOfLegacyExecutionProven","historicalRewardBalanceVerified","completeTestHistoryVerified"])
 rejectBase(r=>r.nativeObservation[flag]=true,"EDITABLE_AUDIT_ATTESTATION_REJECTED");
rejectBase(r=>{r.nativeObservation.skillSource.rating="4";r.nativeObservation.startingActorSnapshot.currentSkillItems[0].rating="4";},"SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
const nativeBaseRolls=trace.rolls;trace.rolls=[{...trace.rolls[0]}];
assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_NATIVE_ROLL_IDENTITY_REQUIRED");trace.rolls=nativeBaseRolls;
const oldRating=skill.system.rating;skill.system.rating=5;
assert.equal(read({traceMessageId:trace.id}).ok,true);skill.system.rating=oldRating;
const savedSkill=items.splice(0,1)[0];assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");items.push(savedSkill);
assert.equal(read({traceMessageId:trace.id}).recordedActorGmSourceConsistent,true);
game.messages.set("duplicate",{...trace,id:"duplicate"});assert.equal(read({traceMessageId:trace.id}).reasonCode,
 "SAVED_LEGACY_DUPLICATE_TEST_IN_CURRENT_MESSAGES");game.messages.delete("duplicate");
game.user=player;let privateReads=0;const originalFlags=trace.flags;
Object.defineProperty(trace,"flags",{configurable:true,get(){privateReads++;throw Error("PRIVATE_FLAGS");}});
assert.equal(read({traceMessageId:trace.id}).reasonCode,"CURRENT_SESSION_GM_REQUIRED");assert.equal(privateReads,0);
Object.defineProperty(trace,"flags",{configurable:true,writable:true,value:originalFlags});
assert.equal((await actor.rollRoleWithAudit(skill)).reasonCode,"CURRENT_SESSION_GM_REQUIRED");assert.equal(rollCalls,1);
reset();assert.equal((await actor.rollRoleWithAudit(skill,{wiseId:"x"})).ok,false);assert.equal(rollCalls,0);
assert.equal((await actor.rollRoleWithAudit({...skill})).reasonCode,"LEGACY_AUDIT_OWNED_WORLD_SKILL_REQUIRED");assert.equal(rollCalls,0);
reset();storageFail=true;facesQueue=[[1,2,4,5]];const failed=await actor.rollRoleWithAudit(skill,{obstacle:2});
assert.equal(failed.outcome,"PASS");assert.equal(failed.audit.reasonCode,"LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY");
assert.equal(rollCalls,1);assert.equal(messages.length,1);assert.equal(spendCalls,0);
reset();actor._askFateAfterSixes=async()=>true;facesQueue=[[6,1,2,3],[4]];
const fate=await actor.rollRoleWithAudit(skill,{obstacle:2});assert.equal(rollCalls,2);assert.equal(spendCalls,1);
assert.equal(fate.outcome,"PASS");assert.equal(fate.audit.ok,true,JSON.stringify(fate.audit));
assert.equal(messages[0].id,fate.messageId);assert.equal(messages[1].flags["realm-guard"].packageAAudit.status,"BASE_FATE_SCOPE_RECORDED");
assert.equal(read({traceMessageId:messages[1].id}).ok,true);
reset();actor._askFateAfterSixes=async()=>true;facesQueue=[[6,6,1,2],[6,4],[5]];
const fateControl=await actor.rollRole(skill,{obstacle:4,legacyAuditCapture:{}}),fateContent=messages[0].content;
assert.equal(rollCalls,3);assert.equal(spendCalls,1);assert.equal(messages.length,1);
reset();actor._askFateAfterSixes=async()=>true;facesQueue=[[6,6,1,2],[6,4],[5]];
const recursive=await actor.rollRoleWithAudit(skill,{obstacle:4});
assert.equal(rollCalls,3);assert.equal(spendCalls,1);assert.equal(recursive.successes,5);
const recursiveTrace=messages[1],observation=recursiveTrace.flags["realm-guard"].packageAAudit.nativeObservation;
assert.equal(messages[0].content,fateContent);
for(const key of ["successes","sixes","outcome","fateSpent"])assert.equal(recursive[key],fateControl[key]);
assert.equal(recursiveTrace.rolls.length,3);assert.equal(observation.nativeEventHistory.length,2);
assert.equal(observation.nativeEventHistory[1].links[0].parentResultDieId,`${observation.testIdentity.testId}:luck0:0`);
assert.equal(observation.resourceChanges[0].before,2);assert.equal(observation.resourceChanges[0].after,1);
assert.equal(read({traceMessageId:recursiveTrace.id}).ok,true);
const rr=recursiveTrace.flags["realm-guard"].packageAAudit;
const saved=read({traceMessageId:recursiveTrace.id});
assert.deepEqual(saved.baseFaces,[6,6,1,2]);assert.equal(saved.nativeFateRoundCount,2);
assert.equal(saved.savedFateChainConsistent,true);assert.equal(saved.completeTestHistoryVerified,false);
assert.equal(saved.historicalRewardBalanceVerified,false);assert.equal(saved.rollExecuted,false);
assert.equal(saved.writesPlanned,0);assert.equal(rollCalls,3);assert.equal(spendCalls,1);
const cleanFlags=structuredClone(recursiveTrace.flags),cleanRolls=recursiveTrace.rolls;
const reject=(mutate,reason)=>{
 recursiveTrace.flags=structuredClone(cleanFlags);recursiveTrace.rolls=[...cleanRolls];
 mutate(recursiveTrace.flags["realm-guard"].packageAAudit,recursiveTrace);
 assert.equal(read({traceMessageId:recursiveTrace.id}).reasonCode,reason);
 recursiveTrace.flags=structuredClone(cleanFlags);recursiveTrace.rolls=cleanRolls;
};
reject(r=>r.nativeObservation.nativeEventHistory[0].links.reverse(),"SAVED_LEGACY_FATE_LINEAGE_MISMATCH");
reject(r=>r.nativeObservation.nativeEventHistory[1].links[0].parentResultDieId="other","SAVED_LEGACY_FATE_LINEAGE_MISMATCH");
reject(r=>r.nativeObservation.nativeEventHistory[1].record.dice[0].face=4,"SAVED_LEGACY_FATE_NATIVE_MISMATCH");
reject(r=>r.nativeObservation.nativeEventHistory[0].kind="LEGACY_MIXED_WISE_REROLL","SAVED_LEGACY_FATE_LINEAGE_MISMATCH");
reject((r,m)=>m.rolls.pop(),"SAVED_LEGACY_FATE_SCOPE_MISMATCH");
reject((r,m)=>{r.nativeObservation.nativeEventHistory.pop();m.rolls.pop();},"SAVED_LEGACY_FATE_CHAIN_INCOMPLETE");
reject((r,m)=>m.rolls[2]=m.rolls[1],"SAVED_LEGACY_FATE_NATIVE_INVALID");
reject(r=>r.nativeObservation.startingActorSnapshot.actorId="other","SAVED_LEGACY_ACTOR_GM_SOURCE_MISMATCH");
reject(r=>r.nativeObservation.resourceChanges=[],"SAVED_LEGACY_FATE_BALANCE_MISMATCH");
reject(r=>r.nativeObservation.resourceChanges[0].amount=2,"SAVED_LEGACY_FATE_BALANCE_MISMATCH");
reject(r=>r.nativeObservation.observedEndingRewards.persona=0,"SAVED_LEGACY_FATE_BALANCE_MISMATCH");
reject(r=>r.nativeObservation.startingActorSnapshot.currentRewards.fate="2","SAVED_LEGACY_FATE_BALANCE_MISMATCH");
reject(r=>r.nativeObservation.resourceChanges.push({...r.nativeObservation.resourceChanges[0]}),"SAVED_LEGACY_FATE_BALANCE_MISMATCH");
reject(r=>r.nativeObservation.resolvedObservedDice[0].face=1,"SAVED_LEGACY_FATE_CHAIN_INCOMPLETE");
reject(r=>r.nativeObservation.spendCauseAuthenticated=true,"EDITABLE_AUDIT_ATTESTATION_REJECTED");
reject(r=>r.legacyOutcome.successes=6,"SAVED_LEGACY_FINAL_MISMATCH");
reject(r=>r.status="INCOMPLETE","SAVED_LEGACY_AUDIT_INCOMPLETE");
reject(r=>r.nativeObservation.nativeEventHistory=Array(31).fill(r.nativeObservation.nativeEventHistory[0]),"SAVED_LEGACY_FATE_SCOPE_MISMATCH");
const reloaded=JSON.parse(JSON.stringify(cleanFlags));
recursiveTrace.flags=reloaded;recursiveTrace.rolls=cleanRolls.map(r=>Roll.fromData(JSON.parse(JSON.stringify(r.toJSON()))));
assert.equal(read({traceMessageId:recursiveTrace.id}).ok,true);assert.equal(rollCalls,3);
recursiveTrace.flags=cleanFlags;recursiveTrace.rolls=cleanRolls;
game.messages.set("duplicate",{...recursiveTrace,id:"duplicate"});
assert.equal(read({traceMessageId:recursiveTrace.id}).reasonCode,"SAVED_LEGACY_DUPLICATE_TEST_IN_CURRENT_MESSAGES");game.messages.delete("duplicate");
game.user=player;let reads=0;Object.defineProperty(recursiveTrace,"flags",{configurable:true,get(){reads++;throw Error("PRIVATE");}});
assert.equal(read({traceMessageId:recursiveTrace.id}).reasonCode,"CURRENT_SESSION_GM_REQUIRED");assert.equal(reads,0);
Object.defineProperty(recursiveTrace,"flags",{configurable:true,writable:true,value:cleanFlags});game.user=gm;
// Current holdings may change later: saved arithmetic is not authenticated history.
actor.system.resources.fate.value=9;assert.equal(read({traceMessageId:recursiveTrace.id}).ok,true);
reset();storageFail=true;actor._askFateAfterSixes=async()=>true;facesQueue=[[6,1,2,3],[4]];
const fateStorageFailure=await actor.rollRoleWithAudit(skill,{obstacle:2});
assert.equal(fateStorageFailure.audit.reasonCode,"LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY");
assert.equal(fateStorageFailure.outcome,"PASS");assert.equal(rollCalls,2);assert.equal(spendCalls,1);assert.equal(messages.length,1);

reset();facesQueue=[[6,1,2,3]];actor._askFateAfterSixes=async()=>{game.user=player;return false;};
const changed=await actor.rollRoleWithAudit(skill);assert.equal(changed.audit.reasonCode,"LEGACY_AUDIT_SESSION_CHANGED_BEFORE_STORAGE");
assert.equal(rollCalls,1);assert.equal(messages.length,1);
reset();facesQueue=[];await assert.rejects(()=>actor.rollRoleWithAudit(skill));assert.equal(rollCalls,1);assert.equal(messages.length,0);
console.log("PASS actual Legacy role audit path: default control unchanged, private native base persisted/read-only reload, GM/tamper/duplicate rejection, storage failure no retry, recursive saved Fate consistency/reload/tamper guards, history never authenticated");
