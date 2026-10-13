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
assert.equal(fate.outcome,"PASS");assert.equal(fate.audit.reasonCode,"LEGACY_AUDIT_NATIVE_FATE_ROUNDS_NOT_CAPTURED");
assert.equal(messages[0].id,fate.messageId);assert.equal(messages[1].flags["realm-guard"].packageAAudit.status,"INCOMPLETE");
assert.equal(read({traceMessageId:messages[1].id}).reasonCode,"SAVED_LEGACY_AUDIT_INCOMPLETE");
reset();facesQueue=[[6,1,2,3]];actor._askFateAfterSixes=async()=>{game.user=player;return false;};
const changed=await actor.rollRoleWithAudit(skill);assert.equal(changed.audit.reasonCode,"LEGACY_AUDIT_SESSION_CHANGED_BEFORE_STORAGE");
assert.equal(rollCalls,1);assert.equal(messages.length,1);
reset();facesQueue=[];await assert.rejects(()=>actor.rollRoleWithAudit(skill));assert.equal(rollCalls,1);assert.equal(messages.length,0);
console.log("PASS actual Legacy role audit path: default control unchanged, private native base persisted/read-only reload, GM/tamper/duplicate rejection, storage failure no retry, Fate incomplete not certified");
