import assert from "node:assert/strict";
await import("./m10d18-package-a-legacy-audit-storage-smoke.mjs");
const {tb2ePackageAEvidenceReplayPlan:replay}=await import("../module/m10d18-tb2e-package-a-prospective-trace.mjs");
const actor=game.actors.get("actor"),role=actor.items.get("cook");role.system.rating=0;role.system.beginnerAttempts=3;
actor.items.push({id:"wise",name:"Food-wise",type:"wise",system:{}});
actor.system.attributes.nature.maximum=4;actor.system.attributes.nature.value=2;
const create=async faces=>ChatMessage.create({speaker:{actor:actor.id},content:"test fixture",rolls:[Roll.fromData({formula:`${faces.length}d6`,faces})]});
const base=await create([1,2]),deeper=await create([6]),luck=await create([4]);
const scenario={skillName:"Cook",mode:"BEGINNERS_LUCK",rating:4,beginnerAbilityName:"WILL",
 factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
 equipment:{hasSkill:false,carriesBackpackOrSatchel:false,borrowedTools:false,dwarvenCraftingNature:false,
 isCraftingTest:false,toolsInadequate:false,suppliesUsed:0,gearUsed:0},
 environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
 actingCharacterId:actor.id,actingConditions:[],conditionsGmReviewed:true};
const test={actorId:actor.id,messageId:base.id,scenarioInput:scenario,
 equipmentReview:{pack:null,borrowedTools:null,supply:null,gear:null,adequacyGmReviewed:true},
 rewardReview:{events:[{type:"DEEPER_UNDERSTANDING",messageId:deeper.id,wiseItemId:"wise",related:true,targetDieId:`${base.id}:0:0:0`},
 {type:"FATE_LUCK",rounds:[{messageId:luck.id,parentDieIds:[`${base.id}:0:0:0`]}]}],
 gmEventLinksReviewed:true,fateAtRollStartGmAsserted:2,personaAtRollStartGmAsserted:0},
 progressReview:{gmConfirmedLegalTest:true,gmConfirmsCountersExcludeThisTest:true,gmConfirmsHistoricalEligibility:true,context:"ADVENTURE"}};
const reviewed=value=>({state:"GM_REVIEWED",value,reviewId:"r",reviewerId:"gm"});
const initial=()=>({schemaVersion:1,worldId:"world",actorId:actor.id,gmId:"gm",subjects:[
 {subjectId:"actor:LEARNING:cook",epochId:"l1",kind:"LEARNING",itemId:"cook",skillName:"Cook",rating:0,currentNature:null,counters:reviewed({attempts:3})},
 {subjectId:"actor:WILL",epochId:"w1",kind:"WILL",itemId:null,skillName:null,rating:4,currentNature:null,counters:reviewed({passed:1,failed:1})},
 {subjectId:"actor:NATURE",epochId:"n1",kind:"NATURE",itemId:null,skillName:null,rating:4,currentNature:2,counters:reviewed({passed:0,failed:0})}],supplies:[]});
const credit={eventId:"blCredit",sequence:0,type:"LEARNING_CREDIT",reviewId:"r",reviewerId:"gm",subjectId:"actor:LEARNING:cook",epochId:"l1",integratedTestInput:test};
const learn={eventId:"learn",sequence:1,type:"LEARN_SKILL",reviewId:"r",reviewerId:"gm",subjectId:"actor:LEARNING:cook",epochId:"l1",nextEpochId:"s1",
 learningCreditEventId:"blCredit",knownSkillItemIds:[],forgetItemId:null,gmCanonicalRosterReviewed:true};
const input=()=>({baseline:initial(),events:[structuredClone(credit),structuredClone(learn)],previousEventIds:[],previousCreditKeys:[],previousSupplyTestIds:[]});
const forbid=()=>{throw Error("SIDE_EFFECT");};Roll.prototype.evaluate=forbid;ChatMessage.create=forbid;actor.update=forbid;
const before=JSON.stringify([actor.system,actor.items,[...game.messages.values()]]),i=input(),inputBefore=JSON.stringify(i),good=replay(i);
assert.equal(good.ok,true,JSON.stringify(good));assert.equal(good.eventHistory[0].initialOutcome,"FAIL");
assert.equal(good.eventHistory[0].finalOutcome,"PASS");assert.deepEqual(good.eventHistory[0].after,{attempts:4});
assert.equal(good.eventHistory[0].maximumNatureObserved,4);assert.equal(good.eventHistory[0].willHealthAdvancementMark,false);
assert.equal(good.subjects.find(s=>s.kind==="SKILL").rating,2);assert.equal(good.subjects.some(s=>s.kind==="LEARNING"),false);
assert.deepEqual(good.subjects.find(s=>s.kind==="WILL").counters,{passed:1,failed:1});
assert.deepEqual(good.subjects.find(s=>s.kind==="SKILL").counters,{passed:0,failed:0});
assert.equal(JSON.stringify(i),inputBefore);assert.equal(JSON.stringify([actor.system,actor.items,[...game.messages.values()]]),before);
assert.equal(good.learningWrite,false);assert.equal(good.completeTestHistoryVerified,false);assert.equal(good.writesPlanned,0);
const reject=(edit,reason)=>{const i=input();edit(i);const p=replay(i);assert.equal(p.reasonCode,reason,JSON.stringify(p));};
reject(i=>i.events[0].outcome="PASS","REPLAY_LEARNING_CREDIT_FIELDS_REQUIRED");
reject(i=>i.events[0].epochId="stale","REPLAY_LEARNING_SUBJECT_EPOCH_REQUIRED");
reject(i=>i.events[0].integratedTestInput.scenarioInput.mode="SKILL","REPLAY_LEARNING_TEST_SOURCE_REQUIRED");
reject(i=>i.events[0].integratedTestInput.rewardReview.fateAtRollStartGmAsserted=0,"REPLAY_INTEGRATED_TIMELINE_INSUFFICIENT_FATE");
reject(i=>i.previousCreditKeys=good.reviewedCreditKeys,"REPLAY_DUPLICATE_TEST_CREDIT");
reject(i=>i.baseline.subjects[0].counters=reviewed({attempts:1}),"REPLAY_LEARNING_BASELINE_COUNTER_MISMATCH");
role.system.beginnerAttempts=1;
const tooEarly=input();tooEarly.baseline.subjects[0].counters=reviewed({attempts:1});
assert.equal(replay(tooEarly).reasonCode,"REPLAY_LEARNING_THRESHOLD_NOT_EVIDENCED");role.system.beginnerAttempts=3;
reject(i=>i.events[1].knownSkillItemIds=["invented"],"REPLAY_COMPLETE_REVIEWED_SKILL_ROSTER_REQUIRED");
reject(i=>i.events[1].forgetItemId="invented","REPLAY_LEARN_FORGET_SELECTION_REQUIRED");
reject(i=>i.events[1].nextEpochId="l1","REPLAY_EPOCH_REUSE");
const unknown=input();unknown.events.pop();unknown.baseline.subjects[0].counters={state:"UNKNOWN",value:null,reviewId:null,reviewerId:null};
assert.equal(replay(unknown).subjects[0].counters,null);unknown.events.push(structuredClone(learn));
assert.equal(replay(unknown).reasonCode,"REPLAY_LEARNING_THRESHOLD_NOT_EVIDENCED");
const plain=input();plain.events[0].integratedTestInput.rewardReview.events=[];assert.equal(replay(plain).ok,true);
assert.equal(replay(plain).eventHistory[0].finalOutcome,"FAIL");assert.equal(replay(plain).eventHistory[0].after.attempts,4);
actor.items.push({id:"sick",name:"Sick",type:"condition",system:{active:true,rollModifier:-1}});
const sick=input();sick.events[0].integratedTestInput.scenarioInput.actingConditions=["Sick"];sick.events.pop();
const stopped=replay(sick);assert.equal(stopped.ok,true,JSON.stringify(stopped));assert.equal(stopped.eventHistory[0].attemptWouldBeAdded,0);
assert.equal(stopped.subjects[0].counters.attempts,3);sick.events.push(structuredClone(learn));
assert.equal(replay(sick).reasonCode,"REPLAY_LEARN_MATCHING_CREDIT_REQUIRED");actor.items.pop();
const {tb2eAbilitySkillModel}=await import("../module/m10d-tb2e-abilities-shadow.mjs");
const names=tb2eAbilitySkillModel().skills.names.filter(n=>n!=="Cook").slice(0,24);
const known=names.map((name,i)=>({id:`known${i}`,name,type:"role",system:{rating:2,beginnerAttempts:0,learning:{passed:0,failed:0,passNeeded:2,failNeeded:1}}}));
actor.items.push(...known);
const atCapacity=input();atCapacity.events[1].knownSkillItemIds=known.map(i=>i.id);
assert.equal(replay(atCapacity).reasonCode,"REPLAY_LEARN_FORGET_SELECTION_REQUIRED");
atCapacity.events[1].forgetItemId=known[0].id;
atCapacity.baseline.subjects.push({subjectId:`actor:SKILL:${known[0].id}`,epochId:"f1",kind:"SKILL",itemId:known[0].id,
 skillName:known[0].name,rating:2,currentNature:null,counters:reviewed({passed:0,failed:0})});
const rosterBefore=JSON.stringify(actor.items),replacement=replay(atCapacity);
assert.equal(replacement.ok,true,JSON.stringify(replacement));assert.equal(replacement.eventHistory[1].projectedKnownSkillItemIds.length,24);
assert.equal(replacement.subjects.some(s=>s.itemId===known[0].id),false);assert.equal(JSON.stringify(actor.items),rosterBefore);
const missingRoster=structuredClone(atCapacity);missingRoster.events[1].knownSkillItemIds.pop();
assert.equal(replay(missingRoster).reasonCode,"REPLAY_COMPLETE_REVIEWED_SKILL_ROSTER_REQUIRED");
const replayAfterLearning=structuredClone(atCapacity);replayAfterLearning.events.push({...structuredClone(credit),sequence:2,eventId:"again"});
assert.equal(replay(replayAfterLearning).reasonCode,"REPLAY_LEARNING_SUBJECT_EPOCH_REQUIRED");
console.log("PASS BL document-chain replay: reward-final PASS/FAIL attempt, Maximum Nature/rating2/reset, no Ability mark, unknown/identity/replay/Sick/24-Skill replacement guards, no writes");
