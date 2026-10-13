import assert from "node:assert/strict";
// Reuse the actual Actor/native storage fixture, not an injected outcome object.
await import("./m10d18-package-a-legacy-audit-storage-smoke.mjs");
const {tb2ePackageAEvidenceReplayPlan:replay}=await import("../module/m10d18-tb2e-package-a-prospective-trace.mjs");
const actor=game.actors.get("actor"),role=actor.items.get("cook");
let queue=[[6,1,2,3],[4]],evaluations=0;
const originalEvaluate=Roll.prototype.evaluate;
Roll.prototype.evaluate=async function(){evaluations++;this.assign(queue.shift());return this;};
actor._askFateAfterSixes=async()=>true;
const capture=await actor.rollRoleWithAudit(role,{obstacle:2});assert.equal(capture.audit.ok,true);
const traceMessageId=capture.audit.traceMessageId;
const reviewed=value=>({state:"GM_REVIEWED",value,reviewId:"r",reviewerId:"gm"});
const unknown=()=>({state:"UNKNOWN",value:null,reviewId:null,reviewerId:null});
const baseline=()=>({schemaVersion:1,worldId:"world",actorId:"actor",gmId:"gm",subjects:[
 {subjectId:"actor:SKILL:cook",epochId:"e1",kind:"SKILL",itemId:"cook",skillName:"Cook",rating:4,currentNature:null,counters:reviewed({passed:3,failed:3})}],
 supplies:[{itemId:"food",unitId:"unit1",skillName:"Cook",incrementDefinition:"one reviewed applicable allocation",
 unitReviewId:"ur",unitReviewerId:"gm",quantityMapping:"NO_AUTOMATIC_CONVERSION",stock:reviewed({increments:2})}]});
const baseEvent={eventId:"credit1",sequence:0,type:"TEST_CREDIT",reviewId:"r",reviewerId:"gm",subjectId:"actor:SKILL:cook",
 epochId:"e1",traceMessageId,context:"ADVENTURE",gmEligibilityReviewed:true};
const supplyEvent={eventId:"use1",sequence:1,type:"SUPPLY_USE",reviewId:"r",reviewerId:"gm",unitId:"unit1",traceMessageId,gmUseReviewed:true};
const input=()=>({baseline:baseline(),events:[{...baseEvent},{...supplyEvent}],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]});
const beforeActor=JSON.stringify(actor.system),beforeMessages=JSON.stringify([...game.messages.values()]);
const originalCreate=ChatMessage.create;ChatMessage.create=()=>{throw Error("WRITE");};
Roll.prototype.evaluate=()=>{throw Error("RNG");};actor.spendTrackedResource=()=>{throw Error("SPEND");};
const initial=input(),beforeInput=JSON.stringify(initial),good=replay(initial);
assert.equal(good.ok,true,JSON.stringify(good));assert.equal(good.subjects[0].counters.passed,4);
assert.equal(good.subjects[0].counters.failed,3);assert.equal(good.eventHistory[0].nativeOutcome,"PASS");
assert.equal(good.supplies[0].stock.increments,1);assert.equal(good.eventHistory[1].supplyBonusCaptured,false);
assert.equal(JSON.stringify(initial),beforeInput);assert.equal(JSON.stringify(actor.system),beforeActor);
assert.equal(JSON.stringify([...game.messages.values()]),beforeMessages);assert.equal(evaluations,2);
assert.equal(Object.isFrozen(good.eventHistory),true);
for(const k of ["actorWrite","itemWrite","journalWrite","settingsWrite","rollExecuted","resourceSpendCommitted","advancementWrite",
 "learningWrite","rollSourceAuthenticated","historicalRewardBalanceVerified","completeTestHistoryVerified","captureStorageImplemented"])
 assert.equal(good[k],false,k);
const reject=(edit,reason)=>{const i=input();edit(i);const r=replay(i);assert.equal(r.reasonCode,reason,JSON.stringify(r));assert.equal(r.writesPlanned,0);};
reject(i=>i.events[0].outcome="FAIL","REPLAY_CREDIT_FIELDS_REQUIRED");
reject(i=>i.events[0].epochId="other","REPLAY_CREDIT_SUBJECT_EPOCH_UNSUPPORTED");
reject(i=>i.events[0].context="CONFLICT","REPLAY_INDEPENDENT_ADVENTURE_REVIEW_REQUIRED");
reject(i=>i.events.push({...baseEvent,eventId:"credit2",sequence:2}),"REPLAY_DUPLICATE_TEST_CREDIT");
reject(i=>i.previousCreditKeys=good.reviewedCreditKeys,"REPLAY_DUPLICATE_TEST_CREDIT");
reject(i=>i.previousEventIds=["credit1"],"REPLAY_EVENT_ID_SEQUENCE_OR_REVIEW_INVALID");
reject(i=>i.previousSupplyTestIds=good.reviewedSupplyTestIds,"REPLAY_ONE_SUPPLY_INCREMENT_PER_TEST");
reject(i=>i.events.push({...supplyEvent,eventId:"use2",sequence:2}),"REPLAY_ONE_SUPPLY_INCREMENT_PER_TEST");
reject(i=>i.baseline.supplies[0].stock=reviewed({increments:0}),"REPLAY_INSUFFICIENT_SUPPLY_STOCK");
reject(i=>i.baseline.supplies[0].skillName="Scholar","REPLAY_SUPPLY_SKILL_MISMATCH");
reject(i=>i.baseline.subjects[0].rating=5,"REPLAY_CAPTURED_SKILL_SOURCE_MISMATCH");
reject(i=>i.events[0].sequence=1,"REPLAY_EVENT_ID_SEQUENCE_OR_REVIEW_INVALID");
const u=input();u.baseline.subjects[0].counters=unknown();u.baseline.supplies[0].stock=unknown();
const unknownResult=replay(u);assert.equal(unknownResult.ok,true);assert.equal(unknownResult.subjects[0].counters,null);
assert.equal(unknownResult.supplies[0].stock,null);assert.equal(unknownResult.eventHistory[1].stockSufficiencyVerified,false);
const reset={eventId:"reset",sequence:2,type:"SUBJECT_RESET",reviewId:"r",reviewerId:"gm",subjectId:"actor:SKILL:cook",
 epochId:"e1",nextEpochId:"e2",reason:"ADVANCE",nextRating:5,nextCurrentNature:null,conditions:[]};
const advancing=input();advancing.events.push(reset);const advanced=replay(advancing);assert.equal(advanced.ok,true,JSON.stringify(advanced));
assert.deepEqual(advanced.subjects[0].counters,{passed:0,failed:0});assert.equal(advanced.subjects[0].epochId,"e2");
reject(i=>i.events.push({...reset,conditions:["Sick"]}),"REPLAY_ADVANCEMENT_CONDITION_BLOCKED");
reject(i=>{i.baseline.subjects[0].counters=unknown();i.events.push(reset);},"REPLAY_ADVANCEMENT_NOT_EVIDENCED");
reject(i=>i.events.push({...reset,nextEpochId:"e1"}),"REPLAY_EPOCH_REUSE");
reject(i=>{i.events.push(reset);i.events.push({...baseEvent,eventId:"again",sequence:3,epochId:"e2"});},"REPLAY_CAPTURED_SKILL_SOURCE_MISMATCH");
const loss=input();loss.baseline.subjects[0].counters=unknown();loss.events=[{...reset,sequence:0,reason:"RATING_LOSS",nextRating:3}];
assert.deepEqual(replay(loss).subjects[0].counters,{passed:0,failed:0});
const replenish=input();replenish.events.push({eventId:"restock",sequence:2,type:"SUPPLY_REPLENISH",reviewId:"r",reviewerId:"gm",unitId:"unit1",increments:2});
assert.equal(replay(replenish).supplies[0].stock.increments,3);
replenish.baseline.supplies[0].stock=unknown();assert.equal(replay(replenish).supplies[0].stock,null);
const message=game.messages.get(traceMessageId),savedOutcome=message.flags["realm-guard"].packageAAudit.legacyOutcome.outcome;
message.flags["realm-guard"].packageAAudit.legacyOutcome.outcome="FAIL";
assert.equal(replay(input()).reasonCode,"REPLAY_SAVED_LEGACY_FINAL_MISMATCH");message.flags["realm-guard"].packageAAudit.legacyOutcome.outcome=savedOutcome;
const capturedSnapshot=message.flags["realm-guard"].packageAAudit.nativeObservation.startingActorSnapshot;
const oldConditions=capturedSnapshot.conditions;capturedSnapshot.conditions=["Sick"];
const suppressed=replay(input());assert.equal(suppressed.ok,true);assert.equal(suppressed.eventHistory[0].proposedMark,null);
assert.equal(suppressed.subjects[0].counters.passed,3);capturedSnapshot.conditions=oldConditions;
const nature=input();nature.events=[];nature.baseline.subjects.push({subjectId:"actor:NATURE",epochId:"n1",kind:"NATURE",itemId:null,
 skillName:null,rating:5,currentNature:2,counters:reviewed({passed:5,failed:4})});
nature.events.push({...reset,eventId:"natureAdvance",sequence:0,subjectId:"actor:NATURE",epochId:"n1",nextEpochId:"n2",nextRating:6,nextCurrentNature:3});
const natureAfter=replay(nature);assert.equal(natureAfter.ok,true,JSON.stringify(natureAfter));
assert.equal(natureAfter.subjects[1].rating-natureAfter.subjects[1].currentNature,3);
nature.baseline.subjects[1].currentNature=0;assert.equal(replay(nature).reasonCode,"REPLAY_ADVANCEMENT_NOT_EVIDENCED");
nature.baseline.subjects[1].rating=1;nature.baseline.subjects[1].counters=unknown();
nature.events[0]={...nature.events[0],reason:"NATURE_ZERO_LOSS",nextRating:0,nextCurrentNature:0};
const retired=replay(nature);assert.equal(retired.ok,true);assert.equal(retired.subjects[1].natureRetiredState,true);
assert.deepEqual(retired.subjects[1].counters,{passed:0,failed:0});
const abilityTrace=[...game.messages.values()].find(m=>m.flags?.["realm-guard"]?.packageAAudit?.kind==="LEGACY_ABILITY_AUDIT"&&
 m.flags["realm-guard"].packageAAudit.abilityKey==="health");assert.ok(abilityTrace,"The storage fixture must leave a saved native Health audit trace.");
const abilityRecord=abilityTrace.flags["realm-guard"].packageAAudit,abilitySubject={subjectId:"actor:HEALTH",epochId:"h1",kind:"HEALTH",
 itemId:null,skillName:null,rating:3,currentNature:null,counters:reviewed({passed:1,failed:2})};
const abilityInput={baseline:{schemaVersion:1,worldId:"world",actorId:"actor",gmId:"gm",subjects:[abilitySubject],supplies:[]},
 events:[{eventId:"healthCredit",sequence:0,type:"TEST_CREDIT",reviewId:"r",reviewerId:"gm",subjectId:"actor:HEALTH",epochId:"h1",
  traceMessageId:abilityTrace.id,context:"ADVENTURE",gmEligibilityReviewed:true}],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]};
const abilityProjection=replay(abilityInput);assert.equal(abilityProjection.ok,true,JSON.stringify(abilityProjection));
assert.deepEqual(abilityProjection.subjects[0].counters,{passed:2,failed:2});assert.equal(abilityProjection.eventHistory[0].evidenceMode,"SAVED_NATIVE_WILL_HEALTH_ABILITY");
assert.equal(abilityProjection.eventHistory[0].nativeOutcome,abilityRecord.legacyOutcome.outcome);
const abilityReject=structuredClone(abilityInput);abilityReject.baseline.subjects[0].kind="WILL";abilityReject.baseline.subjects[0].subjectId="actor:WILL";
abilityReject.events[0].subjectId="actor:WILL";
assert.equal(replay(abilityReject).reasonCode,"REPLAY_CAPTURED_ABILITY_SOURCE_MISMATCH");
const abilityDuplicate=structuredClone(abilityInput);abilityDuplicate.events.push({...abilityDuplicate.events[0],eventId:"healthCredit2",sequence:1});
assert.equal(replay(abilityDuplicate).reasonCode,"REPLAY_DUPLICATE_TEST_CREDIT");
game.user=game.users.get("player");assert.equal(replay(input()).reasonCode,"CURRENT_SESSION_GM_REQUIRED");game.user=game.users.get("gm");
assert.equal(JSON.stringify(actor.system),beforeActor);assert.equal(evaluations,2);
Roll.prototype.evaluate=originalEvaluate;ChatMessage.create=originalCreate;
console.log("PASS native-bound evidence replay: Fate-derived PASS credit, unknown history preservation, one reviewed supply use, replay/epoch/condition guards, reset/replenish projections, no gameplay or storage writes");
