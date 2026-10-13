import assert from "node:assert/strict";
await import("./m10d18-package-a-legacy-audit-storage-smoke.mjs");
const {legacyCreateAuditDataset:create,legacyAppendAuditDataset:append,legacyCloseAuditReservation:close,legacyAppendEvidenceLedger:appendLedger}=await import("../module/legacy-package-a-audit.mjs");
const {tb2ePackageAAuditDatasetEvidence:read}=await import("../module/m10d18-tb2e-package-a-saved-legacy-audit.mjs");
const {tb2ePackageAAuditLedgerReplay:readReplay}=await import("../module/m10d18-tb2e-package-a-audit-ledger-replay.mjs");
const actor=game.actors.get("actor"),role=actor.items.get("cook"),gm=game.users.get("gm");
let creates=0,updates=0,rolls=0,failUpdate=false;
game.journal=new Map();game.messages.clear();
globalThis.JournalEntry={async create(data){const j={id:`reserved${++creates}`,documentName:"JournalEntry",visible:true,
 ownership:structuredClone(data.ownership),flags:structuredClone(data.flags),async update(data){updates++;
 if(failUpdate)throw Error("STORE");this.flags["realm-guard"].packageAAuditDataset=structuredClone(data["flags.realm-guard.packageAAuditDataset"]);
 data["flags.realm-guard.packageAAuditDataset"].revision=999;return this;}};game.journal.set(j.id,j);return j;}};
Roll.prototype.evaluate=async function(){rolls++;this.assign(Array.from({length:Number(this.formula.split("d")[0])},(_,i)=>[1,2,4,5][i%4]));return this;};
const make=async(options={})=>{const d=await create({reserveBeforeRoll:true,...options});assert.equal(d.ok,true,JSON.stringify(d));return {journalId:d.journalId,j:game.journal.get(d.journalId)};};
const opts=journalId=>({obstacle:2,auditDatasetId:journalId,reserveBeforeRoll:true});
const {journalId,j}=await make();
assert.equal((await read({journalId})).schemaVersion,2);
const ordinary=await actor.rollRole(role,{obstacle:2});const ordinaryContent=game.messages.get(ordinary.messageId).content;
const originalEvaluate=Roll.prototype.evaluate;
Roll.prototype.evaluate=async function(){
 const pending=await read({journalId});assert.equal(pending.reasonCode,"AUDIT_DATASET_PENDING_RESERVATION");
 assert.equal(pending.pendingReservations.length,1);assert.equal(pending.entries.length,0);
 return originalEvaluate.call(this);
};
const captured=await actor.rollRoleWithAudit(role,opts(journalId));Roll.prototype.evaluate=originalEvaluate;
assert.equal(captured.audit.ok,true,JSON.stringify(captured));assert.equal(rolls,2);assert.equal(updates,2);
assert.equal(game.messages.get(captured.messageId).content,ordinaryContent);
for(const k of ["successes","sixes","passed","margin","outcome","fateSpent"])assert.equal(captured[k],ordinary[k],k);
const resolved=await read({journalId});assert.equal(resolved.ok,true,JSON.stringify(resolved));assert.equal(resolved.revision,2);
assert.equal(resolved.reservations.length,1);assert.equal(resolved.pendingReservations.length,0);
assert.deepEqual(resolved.commits.map(c=>c.kind),["RESERVE","INDEX"]);
assert.equal(resolved.entries[0].testId,resolved.reservations[0].testId);
assert.equal(Object.isFrozen(j.flags["realm-guard"].packageAAuditDataset.reservations),false);
const snapshot=JSON.stringify([actor.system,role.system,j.flags,[...game.messages.values()]]),updatesBefore=updates;
assert.equal((await read({journalId})).ok,true);assert.equal(updates,updatesBefore);assert.equal(rolls,2);
assert.equal(JSON.stringify([actor.system,role.system,j.flags,[...game.messages.values()]]),snapshot);
for(const k of ["actorWrite","itemWrite","journalWrite","rollExecuted","resourceSpendCommitted","immutableChronologyVerified","completeTestHistoryVerified"])assert.equal(resolved[k],false,k);
j.flags=JSON.parse(JSON.stringify(j.flags));assert.equal((await read({journalId})).ok,true);assert.equal(rolls,2);
// A schema2 dataset cannot accept a post-game-only call or unreserved older trace.
assert.equal((await actor.rollRoleWithAudit(role,{obstacle:2,auditDatasetId:journalId})).reasonCode,"AUDIT_DATASET_PRE_ROLL_RESERVATION_REQUIRED");assert.equal(rolls,2);
const unreserved=await actor.rollRoleWithAudit(role,{obstacle:2});assert.equal(rolls,3);
assert.equal((await append({journalId,traceMessageIds:[unreserved.audit.traceMessageId],expectedRevision:2})).reasonCode,"AUDIT_DATASET_RESERVATION_TRACE_MISMATCH");
const capturedRecord=game.messages.get(captured.audit.traceMessageId).flags["realm-guard"].packageAAudit;
const sequence=capturedRecord.reservationSequence,malformed={sequence};capturedRecord.reservationSequence=malformed;
assert.equal((await read({journalId})).reasonCode,"AUDIT_DATASET_TRACE_AUDIT_TRACE_DATASET_FIELDS_INVALID");
assert.equal(Object.isFrozen(malformed),false);capturedRecord.reservationSequence=sequence;
const saved=structuredClone(j.flags),manifest=j.flags["realm-guard"].packageAAuditDataset;
manifest.reservations[0].obstacle++;assert.equal((await read({journalId})).reasonCode,"AUDIT_DATASET_RESERVATION_TRACE_MISMATCH");j.flags=structuredClone(saved);
j.flags["realm-guard"].packageAAuditDataset.commits.reverse();assert.equal((await read({journalId})).reasonCode,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");j.flags=structuredClone(saved);
j.flags["realm-guard"].packageAAuditDataset.reservations.push(structuredClone(resolved.reservations[0]));assert.equal((await read({journalId})).reasonCode,"AUDIT_DATASET_RESERVATIONS_INVALID");j.flags=structuredClone(saved);
// Reservation cannot be silently downgraded to the compatible schema1 format.
const d=j.flags["realm-guard"].packageAAuditDataset;d.schemaVersion=1;delete d.reservations;d.revision=1;d.commits=[{revision:1,traceMessageIds:[captured.audit.traceMessageId]}];
assert.equal((await read({journalId})).reasonCode,"AUDIT_DATASET_RESERVATION_SCHEMA_REQUIRED");j.flags=structuredClone(saved);
const old=await create();assert.equal((await actor.rollRoleWithAudit(role,opts(old.journalId))).reasonCode,"AUDIT_DATASET_RESERVATION_SCHEMA_REQUIRED");assert.equal(rolls,3);
assert.equal((await actor.rollRoleWithAudit(role,{reserveBeforeRoll:true})).reasonCode,"AUDIT_DATASET_RESERVATION_OPTIONS_REQUIRED");
// Failure to persist intent prevents gameplay. Ambiguous readback is also a stop.
failUpdate=true;const beforeFail=rolls;const failed=await actor.rollRoleWithAudit(role,opts(journalId));failUpdate=false;
assert.equal(failed.reasonCode,"AUDIT_DATASET_RESERVATION_STORAGE_FAILED");assert.equal(failed.gameplayStarted,false);assert.equal(rolls,beforeFail);
const ambiguous=await make(),update=ambiguous.j.update;
ambiguous.j.update=async function(data){await update.call(this,data);this.flags["realm-guard"].packageAAuditDataset.revision++;return this;};
assert.equal((await actor.rollRoleWithAudit(role,opts(ambiguous.journalId))).reasonCode,"AUDIT_DATASET_COMMIT_READBACK_CONFLICT");assert.equal(rolls,beforeFail);
// Gameplay exception propagates unchanged; persisted intent survives reload.
const interrupted=await make();Roll.prototype.evaluate=async()=>{rolls++;throw Error("GAMEPLAY_INTERRUPTED");};
await assert.rejects(actor.rollRoleWithAudit(role,opts(interrupted.journalId)),/GAMEPLAY_INTERRUPTED/);Roll.prototype.evaluate=originalEvaluate;
const pending=await read({journalId:interrupted.journalId});assert.equal(pending.reasonCode,"AUDIT_DATASET_PENDING_RESERVATION");assert.equal(pending.pendingReservations.length,1);
interrupted.j.flags=JSON.parse(JSON.stringify(interrupted.j.flags));const stoppedRolls=rolls;
assert.equal((await actor.rollRoleWithAudit(role,opts(interrupted.journalId))).reasonCode,"AUDIT_DATASET_PENDING_RESERVATION");assert.equal(rolls,stoppedRolls);
// Missing private trace storage after gameplay is visible through the reservation.
const privateCreate=ChatMessage.create,missing=await make();
ChatMessage.create=async function(data){if(data.flags)throw Error("NO_AUDIT_STORE");return privateCreate.call(this,data);};
const lost=await actor.rollRoleWithAudit(role,opts(missing.journalId));ChatMessage.create=privateCreate;
assert.equal(lost.outcome,"PASS");assert.equal(lost.audit.reasonCode,"LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY");
assert.equal((await read({journalId:missing.journalId})).reasonCode,"AUDIT_DATASET_PENDING_RESERVATION");
// A saved trace + failed index can recover explicitly, with no new gameplay.
const recovery=await make(),recoverUpdate=recovery.j.update;let writes=0;
recovery.j.update=async function(data){if(++writes===2)throw Error("INDEX_FAIL");return recoverUpdate.call(this,data);};
const recoverable=await actor.rollRoleWithAudit(role,opts(recovery.journalId));assert.equal(recoverable.audit.reasonCode,"AUDIT_DATASET_APPEND_STORAGE_FAILED");
const pendingRead=await read({journalId:recovery.journalId});assert.equal(pendingRead.pendingReservations.length,1);assert.equal(pendingRead.unindexedTraceMessageIds.length,1);
recovery.j.update=recoverUpdate;const count=rolls;
assert.equal((await append({journalId:recovery.journalId,traceMessageIds:[recoverable.audit.traceMessageId],expectedRevision:1})).ok,true);
assert.equal((await read({journalId:recovery.journalId})).ok,true);assert.equal(rolls,count);
// BL uses the same reservation identity; learning remains display-only.
const bl=await make(),roleState=structuredClone(role.system);role.system.rating=0;
const attempts=role.system.beginnerAttempts;const blResult=await actor.rollBeginnerLuckWithAudit(role,opts(bl.journalId));
assert.equal(blResult.audit.ok,true,JSON.stringify(blResult));assert.equal(role.system.beginnerAttempts,attempts);
assert.equal((await read({journalId:bl.journalId})).reservations[0].testMode,"BEGINNERS_LUCK");role.system=roleState;
// Recursive Fate preserves the ordinary live cost/prompt and one reserved identity.
const fate=await make(),startingFate=actor.system.resources.fate.value,ask=actor._askFateAfterSixes;
let nativeFaces=[[1,2,6,5],[6],[4]],prompts=0;
Roll.prototype.evaluate=async function(){rolls++;this.assign(nativeFaces.shift());return this;};
actor._askFateAfterSixes=async()=>{prompts++;return true;};
const fateResult=await actor.rollRoleWithAudit(role,opts(fate.journalId));
assert.equal(fateResult.audit.ok,true,JSON.stringify(fateResult));assert.equal(prompts,1);assert.equal(nativeFaces.length,0);
assert.equal(actor.system.resources.fate.value,startingFate-1);assert.equal((await read({journalId:fate.journalId})).pendingReservations.length,0);
actor.system.resources.fate.value=startingFate;actor._askFateAfterSixes=ask;Roll.prototype.evaluate=originalEvaluate;
// Active gameplay cannot be closed, even between base and recursive Fate rounds.
const active=await make({allowReviewedGaps:true}),closeFromRoll=Roll.prototype.evaluate;
let activeClose;
Roll.prototype.evaluate=async function(){
 const manifest=active.j.flags["realm-guard"].packageAAuditDataset,reservation=manifest.reservations.at(-1);
 activeClose=await close({journalId:active.journalId,testId:reservation.testId,expectedRevision:manifest.revision,
  reason:"CAPTURE_INTERRUPTED",note:"Attempted during the live roll; must be blocked.",gmReviewed:true,captureStoppedReviewed:true});
 return closeFromRoll.call(this);
};
const live=await actor.rollRoleWithAudit(role,opts(active.journalId));Roll.prototype.evaluate=closeFromRoll;
assert.equal(live.audit.ok,true,JSON.stringify(live));assert.equal(activeClose.reasonCode,"AUDIT_DATASET_CAPTURE_STILL_ACTIVE");
assert.equal((await read({journalId:active.journalId})).ok,true);
const closeGuard=await make({allowReviewedGaps:true}),closeGuardUpdate=closeGuard.j.update;let closeGuardWrites=0;
closeGuard.j.update=async function(data){if(++closeGuardWrites===2)throw Error("INDEX_PENDING");return closeGuardUpdate.call(this,data);};
const validAttempt=await actor.rollRoleWithAudit(role,opts(closeGuard.journalId));closeGuard.j.update=closeGuardUpdate;
assert.equal(validAttempt.audit.reasonCode,"AUDIT_DATASET_APPEND_STORAGE_FAILED");const recoverableManifest=closeGuard.j.flags["realm-guard"].packageAAuditDataset;
assert.equal((await close({journalId:closeGuard.journalId,testId:recoverableManifest.reservations[0].testId,
 expectedRevision:recoverableManifest.revision,reason:"CAPTURE_INTERRUPTED",note:"Checking that a recoverable record cannot be closed.",
 gmReviewed:true,captureStoppedReviewed:true,traceMessageIds:[validAttempt.audit.traceMessageId]})).reasonCode,"AUDIT_DATASET_RECOVERABLE_TRACE_MUST_BE_INDEXED");
assert.equal((await append({journalId:closeGuard.journalId,traceMessageIds:[validAttempt.audit.traceMessageId],expectedRevision:recoverableManifest.revision})).ok,true);
assert.equal((await read({journalId:closeGuard.journalId})).ok,true);
// An irrecoverable private trace loss closes only as a GM-reviewed gap.
const gap=await make({allowReviewedGaps:true}),privateCreateForGap=ChatMessage.create;
ChatMessage.create=async function(data){if(data.flags)throw Error("TRACE_LOST");return privateCreateForGap.call(this,data);};
const unobserved=await actor.rollRoleWithAudit(role,opts(gap.journalId));ChatMessage.create=privateCreateForGap;
assert.equal(unobserved.outcome,"PASS");assert.equal(unobserved.audit.reasonCode,"LEGACY_AUDIT_STORAGE_FAILED_AFTER_GAMEPLAY");
const gapManifest=gap.j.flags["realm-guard"].packageAAuditDataset,gapTestId=gapManifest.reservations[0].testId;
const closeInput={journalId:gap.journalId,testId:gapTestId,expectedRevision:gapManifest.revision,
 reason:"PRIVATE_TRACE_UNAVAILABLE",note:"Reviewed as GM after reload; private native trace is unavailable.",
 gmReviewed:true,captureStoppedReviewed:true,traceMessageIds:[]};
assert.equal((await close({...closeInput,gmReviewed:false})).reasonCode,"AUDIT_DATASET_CLOSURE_FIELDS_REQUIRED");
assert.equal((await close({...closeInput,expectedRevision:0})).reasonCode,"AUDIT_DATASET_REVISION_CONFLICT");
assert.equal((await close({...closeInput,reason:"INCOMPLETE_NATIVE_CAPTURE"})).reasonCode,"AUDIT_DATASET_INCOMPLETE_TRACE_REQUIRED");
assert.equal((await close({...closeInput,reason:"PRIVATE_TRACE_UNAVAILABLE",traceMessageIds:[unobserved.messageId]})).reasonCode,"AUDIT_DATASET_CLOSURE_TRACE_SELECTION_REQUIRED");
const closed=await close(closeInput);assert.equal(closed.ok,true,JSON.stringify(closed));
const gapEvidence=await read({journalId:gap.journalId});assert.equal(gapEvidence.reasonCode,"AUDIT_DATASET_REVIEWED_GAPS");
assert.equal(gapEvidence.pendingReservations.length,0);assert.equal(gapEvidence.reviewedGaps[0].testId,gapTestId);
assert.equal(gapEvidence.reviewedGaps[0].nativeOutcome,"UNKNOWN");assert.equal(gapEvidence.reviewedGaps[0].advancementCredit,false);
assert.equal(gapEvidence.nativeHistoryCompleteInDataset,false);assert.equal(closed.authenticated,false);
const forgedGap=structuredClone(gap.j.flags);gap.j.flags["realm-guard"].packageAAuditDataset.closures[0].advancementCredit=true;
assert.equal((await read({journalId:gap.journalId})).reasonCode,"AUDIT_DATASET_CLOSURES_INVALID");gap.j.flags=forgedGap;
const continuing=await actor.rollRoleWithAudit(role,opts(gap.journalId));
assert.equal(continuing.audit.ok,true,JSON.stringify(continuing));assert.equal(continuing.audit.datasetEvidenceComplete,false);
assert.equal((await read({journalId:gap.journalId})).reviewedGaps.length,1);
// Permission/session changes across reservation writes stop before RNG and keep intent.
const switched=await make(),switchUpdate=switched.j.update,rollsBeforeSwitch=rolls;
switched.j.update=async function(data){await switchUpdate.call(this,data);game.user=game.users.get("player");return this;};
assert.equal((await actor.rollRoleWithAudit(role,opts(switched.journalId))).reasonCode,"AUDIT_DATASET_SESSION_CHANGED");assert.equal(rolls,rollsBeforeSwitch);game.user=gm;
assert.equal((await read({journalId:switched.journalId})).reasonCode,"AUDIT_DATASET_PENDING_RESERVATION");
// Private access and same-client concurrent intents never start extra gameplay.
game.user=game.users.get("player");assert.equal((await actor.rollRoleWithAudit(role,opts(journalId))).reasonCode,"CURRENT_SESSION_GM_REQUIRED");game.user=gm;
const concurrent=await make();const a=actor.rollRoleWithAudit(role,opts(concurrent.journalId)),b=actor.rollRoleWithAudit(role,opts(concurrent.journalId));
assert.equal((await b).reasonCode,"AUDIT_DATASET_LOCAL_APPEND_IN_PROGRESS");assert.equal((await a).audit.ok,true);
// Persist the already-supported source-bound Skill/supply replay and read it again without writes.
const ledgerDoc=await create({reserveBeforeRoll:true,enableEvidenceLedger:true});assert.equal(ledgerDoc.ok,true,JSON.stringify(ledgerDoc));
const ledgerJournal=game.journal.get(ledgerDoc.journalId);
const ledgerRun=await actor.rollRoleWithAudit(role,opts(ledgerDoc.journalId));assert.equal(ledgerRun.audit.ok,true,JSON.stringify(ledgerRun));
const traceMessageId=ledgerRun.audit.traceMessageId;
const review=value=>({state:"GM_REVIEWED",value,reviewId:"r",reviewerId:"gm"});
const baseline={schemaVersion:1,worldId:"world",actorId:"actor",gmId:"gm",subjects:[
 {subjectId:"actor:SKILL:cook",epochId:"counter-e1",kind:"SKILL",itemId:"cook",skillName:"Cook",rating:4,currentNature:null,counters:review({passed:3,failed:3})}],
 supplies:[{itemId:"food",unitId:"unit1",skillName:"Cook",incrementDefinition:"one reviewed applicable allocation",
  unitReviewId:"ur",unitReviewerId:"gm",quantityMapping:"NO_AUTOMATIC_CONVERSION",stock:review({increments:2})}]};
const credit={eventId:"ledgerCredit",sequence:0,type:"TEST_CREDIT",reviewId:"r",reviewerId:"gm",subjectId:"actor:SKILL:cook",
 epochId:"counter-e1",traceMessageId,context:"ADVENTURE",gmEligibilityReviewed:true};
const use={eventId:"ledgerUse",sequence:1,type:"SUPPLY_USE",reviewId:"r",reviewerId:"gm",unitId:"unit1",traceMessageId,gmUseReviewed:true};
const ledger={baseline,events:[credit,use],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]};
const committed=await appendLedger({journalId:ledgerDoc.journalId,expectedRevision:2,ledger});
assert.equal(committed.ok,true,JSON.stringify(committed));assert.equal(committed.replayValidated,true);assert.equal(committed.datasetEvidenceComplete,true);
assert.equal(committed.projection.subjects[0].counters.passed,4);assert.equal(committed.projection.supplies[0].stock.increments,1);
const beforeLedgerState=JSON.stringify([actor.system,role.system,ledgerJournal.flags,[...game.messages.values()]]);
const durable=await readReplay({journalId:ledgerDoc.journalId});assert.equal(durable.ok,true,JSON.stringify(durable));
assert.equal(durable.ledgerReplayValid,true);assert.equal(durable.replayProjection.eventHistory.length,2);
assert.equal(JSON.stringify([actor.system,role.system,ledgerJournal.flags,[...game.messages.values()]]),beforeLedgerState);
const altered=structuredClone(ledger);altered.events[0]={...altered.events[0],context:"CONFLICT",sequence:2};
assert.equal((await appendLedger({journalId:ledgerDoc.journalId,expectedRevision:3,ledger:altered})).reasonCode,"AUDIT_DATASET_LEDGER_NOT_APPEND_ONLY");
const replenished={...ledger,events:[...ledger.events,{eventId:"ledgerRestock",sequence:2,type:"SUPPLY_REPLENISH",
 reviewId:"r",reviewerId:"gm",unitId:"unit1",increments:2}]};
const second=await appendLedger({journalId:ledgerDoc.journalId,expectedRevision:3,ledger:replenished});assert.equal(second.ok,true,JSON.stringify(second));
assert.equal(second.projection.supplies[0].stock.increments,3);
assert.equal((await readReplay({journalId:ledgerDoc.journalId})).replayProjection.reviewedEventIds.length,3);
const invalidAppend={...replenished,events:[...replenished.events,{eventId:"ledgerBadRestock",sequence:3,type:"SUPPLY_REPLENISH",
 reviewId:"r",reviewerId:"gm",unitId:"unit1",increments:-1}]};
const revisionBeforeInvalid=ledgerJournal.flags["realm-guard"].packageAAuditDataset.revision;
assert.equal((await appendLedger({journalId:ledgerDoc.journalId,expectedRevision:revisionBeforeInvalid,ledger:invalidAppend})).reasonCode,
 "AUDIT_DATASET_LEDGER_REPLAY_REPLENISH_AMOUNT_REQUIRED");
assert.equal(ledgerJournal.flags["realm-guard"].packageAAuditDataset.revision,revisionBeforeInvalid);
const pristineLedgerFlags=structuredClone(ledgerJournal.flags);ledgerJournal.flags=structuredClone(pristineLedgerFlags);
ledgerJournal.flags["realm-guard"].packageAAuditDataset.eventLedger.events[2].increments=-1;
assert.equal((await readReplay({journalId:ledgerDoc.journalId})).reasonCode,"AUDIT_DATASET_LEDGER_REPLAY_REPLENISH_AMOUNT_REQUIRED");ledgerJournal.flags=pristineLedgerFlags;
ledgerJournal.flags=structuredClone(pristineLedgerFlags);
ledgerJournal.flags["realm-guard"].packageAAuditDataset.commits[2].traceMessageIds=["not-indexed"];
assert.equal((await readReplay({journalId:ledgerDoc.journalId})).reasonCode,"AUDIT_DATASET_COMMIT_CHAIN_MISMATCH");ledgerJournal.flags=pristineLedgerFlags;
const restoredLedger=await readReplay({journalId:ledgerDoc.journalId});assert.equal(restoredLedger.ok,true,JSON.stringify(restoredLedger));
// Persist the integrated learning route only when its source BL trace is indexed.
const learningState=structuredClone(role.system);role.system.rating=0;role.system.beginnerAttempts=3;
const learningDoc=await create({reserveBeforeRoll:true,enableEvidenceLedger:true});assert.equal(learningDoc.ok,true,JSON.stringify(learningDoc));
const learningJournal=game.journal.get(learningDoc.journalId),learningRun=await actor.rollBeginnerLuckWithAudit(role,opts(learningDoc.journalId));
assert.equal(learningRun.audit.ok,true,JSON.stringify(learningRun));const learningTraceId=learningRun.audit.traceMessageId;
const learningBaseline={schemaVersion:1,worldId:"world",actorId:"actor",gmId:"gm",subjects:[
 {subjectId:"actor:LEARNING:cook",epochId:"learning-e1",kind:"LEARNING",itemId:"cook",skillName:"Cook",rating:0,currentNature:null,
  counters:review({attempts:3})}],supplies:[]};
const learningScenario={skillName:"Cook",mode:"BEGINNERS_LUCK",rating:4,beginnerAbilityName:"WILL",
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:false,carriesBackpackOrSatchel:false,borrowedTools:false,dwarvenCraftingNature:false,isCraftingTest:false,
  toolsInadequate:false,suppliesUsed:0,gearUsed:0},environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:"actor",actingConditions:[],conditionsGmReviewed:true};
const integratedTestInput={actorId:"actor",messageId:learningTraceId,scenarioInput:learningScenario,
 equipmentReview:{pack:null,borrowedTools:null,supply:null,gear:null,adequacyGmReviewed:true},
 rewardReview:{events:[],gmEventLinksReviewed:true,fateAtRollStartGmAsserted:2,personaAtRollStartGmAsserted:0},
 progressReview:{gmConfirmedLegalTest:true,gmConfirmsCountersExcludeThisTest:true,gmConfirmsHistoricalEligibility:true,context:"ADVENTURE"}};
const learningEvent={eventId:"durableLearning",sequence:0,type:"LEARNING_CREDIT",reviewId:"r",reviewerId:"gm",
 subjectId:"actor:LEARNING:cook",epochId:"learning-e1",integratedTestInput};
const unindexedLearning=structuredClone(learningEvent);unindexedLearning.integratedTestInput.messageId="unindexedMessage";
assert.equal((await appendLedger({journalId:learningDoc.journalId,expectedRevision:2,
 ledger:{baseline:learningBaseline,events:[unindexedLearning],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]}})).reasonCode,
 "AUDIT_DATASET_LEDGER_TRACE_NOT_INDEXED");
const durableLearning=await appendLedger({journalId:learningDoc.journalId,expectedRevision:2,
 ledger:{baseline:learningBaseline,events:[learningEvent],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]}});
assert.equal(durableLearning.ok,true,JSON.stringify(durableLearning));
const readLearning=await readReplay({journalId:learningDoc.journalId});assert.equal(readLearning.ok,true,JSON.stringify(readLearning));
assert.equal(readLearning.ledgerReplayValid,true);assert.equal(readLearning.replayProjection.eventHistory[0].traceMessageId,learningTraceId);
assert.equal(readLearning.replayProjection.eventHistory[0].evidenceScope,"SCOPED_SAVED_NATIVE_LEGACY_BL_CAPTURE");role.system=learningState;
console.log("PASS reserved and reviewed evidence lifecycle: pre-roll intent, pending recovery/GM disposition, append-only durable Skill/supply replay, tamper rejection, no Actor/Item mutation or CORE writes");
