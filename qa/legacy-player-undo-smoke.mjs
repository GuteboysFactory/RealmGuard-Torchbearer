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
const before=undo.snapshotActors([actor.id]);fx.dice.push([6,1,4,1,4,4],[4]);
await rollSkillWithOptions(Sheet,sheet,role,{obstacle:2,persona:1,traitId:'trait',traitMode:'help',wiseId:'wise',countLearning:true,help:[]});
const message=game.messages.find(m=>m.flags?.['realm-guard']?.rollUndo);assert.ok(message);assert.equal(undo.canUndoRollMessage(message),true);assert.equal(undo.canUndoRollMessage(message,fx.observer),false);
assert.equal(actor.system.resources.fate.value,8);assert.equal(actor.system.resources.persona.value,7);assert.equal(role.system.learning.passed,1);assert.equal(actor.items.get('wise').getFlag('realm-guard','wiseUsed'),undefined);
assert.equal(actor.getFlag('realm-guard','traitSessionUses').trait,1);
assert.equal(await undo.undoSkillMessage(message),true);assert.deepEqual(undo.snapshotActors([actor.id]),before,'All resource, Wise, Trait, progression and flags return to their exact pre-roll values');assert.equal(await undo.undoSkillMessage(message),undefined);
// A paid Wise reroll can be used on a separate test and Undo refunds its Persona.
const ask = actor._applySelectedWiseReroll.bind(actor);
actor._applySelectedWiseReroll = (faces, wise, assist) => ask(faces, wise, {...assist, chatDecision:{ask:async()=> 'wise'}});
const paidBefore = undo.snapshotActors([actor.id]);
fx.dice.push([1,4,4],[5]);
await rollSkillWithOptions(Sheet,sheet,role,{obstacle:2,help:[]});
assert.equal(actor.system.resources.persona.value,7);
const paidMessage = game.messages.findLast(m=>m.flags?.['realm-guard']?.rollUndo);
const rows = [...paidMessage.content.matchAll(/<div><b>(Initial roll|Wise reroll|Result)<\/b>(.*?)<\/div>/gs)]
  .map(([, label, html]) => [label, [...html.matchAll(/<span>(\d+)<\/span>/g)].map(match => Number(match[1]))]);
assert.deepEqual(rows, [["Initial roll", [1,4,4]], ["Wise reroll", [5]], ["Result", [5,4,4]]]);
assert.equal((paidMessage.content.match(/rg-die-crossed/g) ?? []).length, 1);
assert.equal((paidMessage.content.match(/rg-die-slot/g) ?? []).length, 2);
assert.doesNotMatch(paidMessage.content, /rg-first-roll/);
assert.doesNotMatch(paidMessage.content, /rg-roll-final-count|Final Successes|<b>6s<\/b>/);
assert.match(paidMessage.content, /<b>Result<\/b>.*<b>Successes<\/b><strong>3<\/strong>.*<b>Obstacle<\/b><strong>2<\/strong>.*>PASS</s);
await undo.undoSkillMessage(paidMessage);
assert.deepEqual(undo.snapshotActors([actor.id]),paidBefore);
actor._applySelectedWiseReroll = ask;
// A failed trained test also restores Fail progression.
actor.items.splice(actor.items.findIndex(i=>i.id==='wise'),1);fx.dice.push([1,1,1]);
const failedBefore=undo.snapshotActors([actor.id]);await rollSkillWithOptions(Sheet,sheet,role,{obstacle:3,countLearning:true,help:[]});assert.equal(role.system.learning.failed,1);
await undo.undoSkillMessage(game.messages.findLast(m=>m.flags?.['realm-guard']?.rollUndo));assert.deepEqual(undo.snapshotActors([actor.id]),failedBefore);
// Undo also reverses automatic Beginner's Luck completion back to untrained.
await role.update({'system.rating':0,'system.beginnerAttempts':3});const beginnerBefore=undo.snapshotActors([actor.id]);fx.dice.push([4,4]);
await rollSkillWithOptions(Sheet,sheet,role,{obstacle:1,countLearning:true,help:[]},{abilityKey:'health'});assert.equal(role.system.rating,2);assert.equal(role.system.beginnerAttempts,0);
const beginnerMessage=game.messages.findLast(m=>m.flags?.['realm-guard']?.rollUndo);assert.equal(await undo.undoSkillMessage(beginnerMessage),true);assert.deepEqual(undo.snapshotActors([actor.id]),beginnerBefore);

// A second directed Versus and a different Ability share the same Trait use.
const { resetLegacySessionUses } = await import('../module/legacy-session.mjs');
await role.update({'system.rating':3});
const target = {id:'ugluk', uuid:'Actor.ugluk', name:'Ugluk'};
const traitOptions = {traitId:'trait', traitMode:'help', obstacle:0, challengeTarget:target};
fx.dice.push([4,4,1,1], [4,4,1], [4,1,1,1]);
const firstVersus = await actor.rollRole(role, traitOptions);
const secondVersus = await actor.rollRole(role, traitOptions);
const ability = await actor.rollAbility('will', {traitId:'trait', traitMode:'help'});
assert.equal(firstVersus.roll.dice[0].results.length, 4);
assert.equal(secondVersus.roll.dice[0].results.length, 3);
assert.equal(ability.roll.dice[0].results.length, actor.system.attributes.will.value);
assert.equal(actor._rollAssist({traitId:'trait', traitMode:'against'}).traitPoolDice, -1);
await resetLegacySessionUses(actor);
assert.equal(actor._rollAssist({traitId:'trait', traitMode:'help'}).traitPoolDice, 1);
console.log('PASS player Undo with production rolls: Persona, Fate, Trait use, Wise lock, Pass, Fail and completed Beginner’s Luck including unlearning; owner-only visibility and duplicate prevention');
