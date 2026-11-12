import assert from 'node:assert/strict';
import {installPlaytestFixture,actorData} from './lib/playtest-foundry-fixture.mjs';
const fx=installPlaytestFixture();game.user=fx.player;
// The turn-authority transport is controlled here; resource rolls, snapshots,
// learning and Undo below are the production implementations.
const sockets=[];game.socket.on=(_channel,fn)=>sockets.push(fn);game.socket.emit=(_channel,message)=>{if(message.scope==='TURN_AUTHORITY'&&message.type==='REQUEST')queueMicrotask(()=>sockets.forEach(fn=>fn({scope:'TURN_AUTHORITY',type:'RESPONSE',requestId:message.requestId,targetUserId:game.user.id,result:{ok:true,cost:0}})));};
const {installTurnManager}=await import('../module/turns.mjs');installTurnManager();
const {refreshRulesProfileRuntime}=await import('../module/rules-profile-service.mjs');refreshRulesProfileRuntime();
const {RealmGuardActor}=await import('../module/documents.mjs');const {RealmGuardActorSheet:Sheet}=await import('../sheets/actor-sheet.mjs');
const undo=await import('../module/roll-undo.mjs');undo.installRollUndo(Sheet);
Hooks.callAll('ready');
const {rollSkillWithOptions}=await import('../module/legacy-chat-actions.mjs');
const actor=new RealmGuardActor(actorData('hero'));game.actors.push(actor);const role=actor.items.get('fighter'),sheet={actor,isEditable:true,render:async()=>{}};
actor.items.push({id:'trait',name:'Bold',type:'trait',system:{rating:1}});actor._askFateAfterSixes=async()=>true;
const create=ChatMessage.create;ChatMessage.create=async data=>{const m=await create(data);Hooks.callAll('createChatMessage',m);return m;};
actor.system.resources.fate.value=9;actor.system.resources.persona.value=8;
const before=undo.snapshotActors([actor.id]);fx.dice.push([6,1,4,1,4],[4,4],[4]);
await rollSkillWithOptions(Sheet,sheet,role,{obstacle:2,persona:1,traitId:'trait',traitMode:'help',wiseId:'wise',countLearning:true,help:[]});
const message=game.messages.find(m=>m.flags?.['realm-guard']?.rollUndo);assert.ok(message);assert.equal(undo.canUndoRollMessage(message),true);assert.equal(undo.canUndoRollMessage(message,fx.observer),false);
assert.equal(actor.system.resources.fate.value,8);assert.equal(actor.system.resources.persona.value,7);assert.equal(role.system.learning.passed,1);assert.equal(actor.items.get('wise').getFlag('realm-guard','wiseUsed'),true);
assert.equal(actor.getFlag('realm-guard','traitSessionUses').trait,1);
assert.equal(await undo.undoSkillMessage(message),true);assert.deepEqual(undo.snapshotActors([actor.id]),before,'All resource, Wise, Trait, progression and flags return to their exact pre-roll values');assert.equal(await undo.undoSkillMessage(message),undefined);
// A failed trained test also restores Fail progression.
actor.items.splice(actor.items.findIndex(i=>i.id==='wise'),1);fx.dice.push([1,1,1]);
const failedBefore=undo.snapshotActors([actor.id]);await rollSkillWithOptions(Sheet,sheet,role,{obstacle:3,countLearning:true,help:[]});assert.equal(role.system.learning.failed,1);
await undo.undoSkillMessage(game.messages.findLast(m=>m.flags?.['realm-guard']?.rollUndo));assert.deepEqual(undo.snapshotActors([actor.id]),failedBefore);
// Undo also reverses automatic Beginner's Luck completion back to untrained.
await role.update({'system.rating':0,'system.beginnerAttempts':3});const beginnerBefore=undo.snapshotActors([actor.id]);fx.dice.push([4,4]);
await rollSkillWithOptions(Sheet,sheet,role,{obstacle:1,countLearning:true,help:[]},{abilityKey:'health'});assert.equal(role.system.rating,2);assert.equal(role.system.beginnerAttempts,0);
const beginnerMessage=game.messages.findLast(m=>m.flags?.['realm-guard']?.rollUndo);assert.equal(await undo.undoSkillMessage(beginnerMessage),true);assert.deepEqual(undo.snapshotActors([actor.id]),beginnerBefore);
console.log('PASS player Undo with production rolls: Persona, Fate, Trait use, Wise lock, Pass, Fail and completed Beginner’s Luck including unlearning; owner-only visibility and duplicate prevention');
