import assert from "node:assert/strict";
await import("./m10d18-package-a-legacy-audit-storage-smoke.mjs");
const {tb2ePackageASavedLegacyAuditEvidence:read}=await import("../module/m10d18-tb2e-package-a-saved-legacy-audit.mjs");
const actor=game.actors.get("actor"),role=actor.items.get("cook"),gm=game.users.get("gm");
role.system.rating=0;role.system.beginnerAttempts=3;
let queue=[],rolls=0,spends=0,prompts=0;
Roll.prototype.evaluate=async function(){rolls++;const f=queue.shift();assert.equal(f.length,Number(this.formula.split("d")[0]));this.assign(f);return this;};
actor.spendTrackedResource=async(resource,amount)=>{spends++;actor.system.resources[resource].value-=amount;return {ok:true};};
actor._askFateAfterSixes=async()=>{prompts++;return true;};
const reset=()=>{game.user=gm;game.messages.clear();actor.system.resources.fate.value=2;rolls=0;spends=0;prompts=0;queue=[[6,1],[4]];};
reset();const control=await actor.rollBeginnerLuck(role,{abilityKey:"will",obstacle:2});
const controlContent=game.messages.get(control.messageId).content;
assert.equal(rolls,2);assert.equal(spends,1);assert.equal(prompts,1);assert.equal(game.messages.size,1);
reset();const before=JSON.stringify(role.system),abilityBefore=JSON.stringify(actor.system.attributes);
const captured=await actor.rollBeginnerLuckWithAudit(role,{obstacle:2});
assert.equal(captured.audit.ok,true,JSON.stringify(captured));assert.equal(rolls,2);assert.equal(spends,1);assert.equal(prompts,1);
assert.equal(game.messages.size,2);assert.equal(game.messages.get(captured.messageId).content,controlContent);
for(const key of ["successes","passed","margin","outcome","fateSpent"])assert.equal(captured[key],control[key]);
assert.equal(JSON.stringify(role.system),before);assert.equal(JSON.stringify(actor.system.attributes),abilityBefore);
const trace=game.messages.get(captured.audit.traceMessageId),record=trace.flags["realm-guard"].packageAAudit;
assert.equal(record.schemaVersion,3);assert.equal(record.kind,"LEGACY_BL_AUDIT");assert.equal(record.nativeObservation.testMode,"BEGINNERS_LUCK");
assert.deepEqual(record.nativeObservation.abilitySource,{name:"WILL",rating:4});assert.equal(record.nativeObservation.skillSource.rating,0);
assert.equal(record.nativeObservation.skillSource.beginnerAttempts,3);assert.equal(record.nativeObservation.legacyLearningCounterChanged,false);
assert.equal(trace.rolls.length,2);assert.deepEqual(trace.whisper,["gm"]);
const evidence=read({traceMessageId:trace.id});assert.equal(evidence.ok,true,JSON.stringify(evidence));
assert.equal(evidence.testMode,"BEGINNERS_LUCK");assert.equal(evidence.recordedLegacyOutcome,"PASS");
assert.equal(evidence.legacyLearningCounterChanged,false);assert.equal(evidence.completeTestHistoryVerified,false);
const {tb2ePackageAEvidenceReplayPlan:replay}=await import("../module/m10d18-tb2e-package-a-prospective-trace.mjs");
const review=value=>({state:"GM_REVIEWED",value,reviewId:"r",reviewerId:"gm"});
const baseline={schemaVersion:1,worldId:"world",actorId:"actor",gmId:"gm",subjects:[
 {subjectId:"actor:LEARNING:cook",epochId:"l1",kind:"LEARNING",itemId:"cook",skillName:"Cook",rating:0,currentNature:null,counters:review({attempts:3})},
 {subjectId:"actor:WILL",epochId:"w1",kind:"WILL",itemId:null,skillName:null,rating:4,currentNature:null,counters:review({passed:1,failed:1})}],supplies:[]};
const credit={eventId:"capturedCredit",sequence:0,type:"CAPTURED_LEARNING_CREDIT",reviewId:"r",reviewerId:"gm",subjectId:"actor:LEARNING:cook",epochId:"l1",
 traceMessageId:trace.id,context:"ADVENTURE",gmEligibilityReviewed:true};
const learn={eventId:"learn",sequence:1,type:"LEARN_SKILL",reviewId:"r",reviewerId:"gm",subjectId:"actor:LEARNING:cook",epochId:"l1",nextEpochId:"s1",
 learningCreditEventId:"capturedCredit",knownSkillItemIds:[],forgetItemId:null,gmCanonicalRosterReviewed:true};
const replayInput={baseline,events:[credit,learn],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]};
const replayBefore=JSON.stringify([actor.system,role.system,trace.flags]),replayed=replay(replayInput);
assert.equal(replayed.ok,true,JSON.stringify(replayed));assert.equal(replayed.eventHistory[0].initialOutcome,"FAIL");
assert.equal(replayed.eventHistory[0].finalOutcome,"PASS");assert.equal(replayed.eventHistory[0].after.attempts,4);
assert.equal(replayed.eventHistory[0].evidenceScope,"SCOPED_SAVED_NATIVE_LEGACY_BL_CAPTURE");
assert.equal(replayed.subjects.find(s=>s.kind==="SKILL").rating,2);assert.deepEqual(replayed.subjects.find(s=>s.kind==="WILL").counters,{passed:1,failed:1});
assert.equal(JSON.stringify([actor.system,role.system,trace.flags]),replayBefore);assert.equal(rolls,2);assert.equal(spends,1);
const duplicate={...replayInput,events:[credit],previousCreditKeys:replayed.reviewedCreditKeys};
assert.equal(replay(duplicate).reasonCode,"REPLAY_DUPLICATE_TEST_CREDIT");
const unknown=structuredClone(replayInput);unknown.events.pop();unknown.baseline.subjects[0].counters={state:"UNKNOWN",value:null,reviewId:null,reviewerId:null};
assert.equal(replay(unknown).subjects[0].counters,null);unknown.events.push(learn);assert.equal(replay(unknown).reasonCode,"REPLAY_LEARNING_THRESHOLD_NOT_EVIDENCED");
assert.equal(Object.isFrozen(record.nativeObservation.abilitySource),false);
const flags=structuredClone(trace.flags),native=trace.rolls;
record.nativeObservation.abilitySource.name="HEALTH";assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_BL_SOURCE_MISMATCH");
trace.flags=structuredClone(flags);trace.flags["realm-guard"].packageAAudit.nativeObservation.abilitySource.rating=5;
assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_BL_SOURCE_MISMATCH");
trace.flags=structuredClone(flags);trace.flags["realm-guard"].packageAAudit.nativeObservation.legacyLearningCounterChanged=true;
assert.equal(read({traceMessageId:trace.id}).reasonCode,"SAVED_LEGACY_BL_SOURCE_MISMATCH");
trace.flags=structuredClone(flags);trace.rolls=native.map(r=>Roll.fromData(JSON.parse(JSON.stringify(r.toJSON()))));
assert.equal(read({traceMessageId:trace.id}).ok,true);assert.equal(rolls,2);
game.user=game.users.get("player");assert.equal(read({traceMessageId:trace.id}).reasonCode,"CURRENT_SESSION_GM_REQUIRED");
assert.equal((await actor.rollBeginnerLuckWithAudit(role)).reasonCode,"CURRENT_SESSION_GM_REQUIRED");
reset();queue=[[1,4]];const plain=await actor.rollBeginnerLuckWithAudit(role,{obstacle:1});assert.equal(plain.audit.ok,true,JSON.stringify(plain));
assert.equal(rolls,1);assert.equal(spends,0);assert.equal(prompts,0);assert.equal(plain.roll.terms[0].results[0].result,1);
assert.equal(read({traceMessageId:plain.audit.traceMessageId}).nativeFateRoundCount,0);
role.system.beginnerAttempts=2;reset();queue=[[1,4]];const aliasCapture=await actor.rollBeginnerLuckWithAudit(role,{obstacle:2});
const aliasTrace=game.messages.get(aliasCapture.audit.traceMessageId);
const scenario={skillName:"Cook",mode:"BEGINNERS_LUCK",rating:4,beginnerAbilityName:"WILL",factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:false,carriesBackpackOrSatchel:false,borrowedTools:false,dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:0,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,actingCharacterId:"actor",actingConditions:[],conditionsGmReviewed:true};
const generic={eventId:"generic",sequence:1,type:"LEARNING_CREDIT",reviewId:"r",reviewerId:"gm",subjectId:"actor:LEARNING:cook",epochId:"l1",integratedTestInput:{actorId:"actor",messageId:aliasTrace.id,scenarioInput:scenario,
 equipmentReview:{pack:null,borrowedTools:null,supply:null,gear:null,adequacyGmReviewed:true},
 rewardReview:{events:[],gmEventLinksReviewed:true,fateAtRollStartGmAsserted:2,personaAtRollStartGmAsserted:0},
 progressReview:{gmConfirmedLegalTest:true,gmConfirmsCountersExcludeThisTest:true,gmConfirmsHistoricalEligibility:true,context:"ADVENTURE"}}};
const aliasInput={...replayInput,baseline:structuredClone(baseline),events:[{...credit,traceMessageId:aliasTrace.id},generic]};
aliasInput.baseline.subjects[0].counters.value.attempts=2;
assert.equal(replay(aliasInput).reasonCode,"REPLAY_DUPLICATE_TEST_CREDIT");
const inconsistent=structuredClone(aliasInput);inconsistent.baseline.subjects[0].counters.value.attempts=3;
assert.equal(replay(inconsistent).reasonCode,"REPLAY_LEARNING_BASELINE_COUNTER_MISMATCH");role.system.beginnerAttempts=3;
reset();assert.equal((await actor.rollBeginnerLuckWithAudit(role,{abilityKey:"health"})).ok,false);assert.equal(rolls,0);
role.system.rating=1;assert.equal((await actor.rollBeginnerLuckWithAudit(role)).reasonCode,"OBSERVATION_CURRENT_UNTRAINED_SKILL_REQUIRED");assert.equal(rolls,0);role.system.rating=0;
role.name="Hunter";reset();queue=[[1,4]];const health=await actor.rollBeginnerLuckWithAudit(role,{obstacle:1});
assert.equal(health.audit.ok,true,JSON.stringify(health));assert.deepEqual(read({traceMessageId:health.audit.traceMessageId}).abilitySource,{name:"HEALTH",rating:3});role.name="Cook";
const create=ChatMessage.create;reset();ChatMessage.create=async data=>{if(data.flags)throw Error("STORAGE_FAIL");return create(data);};
const failed=await actor.rollBeginnerLuckWithAudit(role,{obstacle:2});assert.equal(failed.outcome,"PASS");
assert.equal(failed.audit.reasonCode,"LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY");assert.equal(rolls,2);assert.equal(spends,1);assert.equal(game.messages.size,1);
ChatMessage.create=create;reset();actor._askFateAfterSixes=async()=>{game.user=game.users.get("player");return false;};queue=[[6,1]];
const changed=await actor.rollBeginnerLuckWithAudit(role);assert.equal(changed.audit.reasonCode,"LEGACY_AUDIT_SESSION_CHANGED_BEFORE_STORAGE");
assert.equal(rolls,1);assert.equal(spends,0);assert.equal(game.messages.size,1);
console.log("PASS actual Legacy BL audit: base/Fate native capture, mapped Ability and unchanged attempts, control RNG/prompt/spend/chat parity, private reload/tamper/session/storage guards");
