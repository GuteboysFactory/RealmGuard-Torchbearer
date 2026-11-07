import assert from 'node:assert/strict';
import { installPlaytestFixture, actorData } from './lib/playtest-foundry-fixture.mjs';
import { activeConflictParticipants, dispositionAllocationPending, validateDispositionAllocation, createTemporaryOpposition } from '../module/conflict-polish.mjs';
const fixture = installPlaytestFixture();
const { RealmGuardActor } = await import('../module/documents.mjs');
const { refreshRulesProfileRuntime } = await import('../module/rules-profile-service.mjs');
const { resolveRollChatChoice, claimActorRoll, releaseActorRoll, spendRollResource } = await import('../module/roll-chat.mjs');
const { resolveTalentUse } = await import('../module/talents.mjs');
const { RealmGuardActorSheet } = await import('../sheets/actor-sheet.mjs');
const { installCustomRollParityAction } = await import('../module/custom-roll-parity-ui.mjs');

async function complete(operation, answers = []) {
  let done=false, result, failure;
  operation.then(value=>{result=value;done=true;},error=>{failure=error;done=true;});
  const visited=new Set();
  for(let tick=0;tick<500&&!done;tick++) {
    await new Promise(resolve=>setImmediate(resolve));
    for(const message of fixture.messages) {
      const nonce=message.content.match(/data-decision-nonce="([^"]+)"/)?.[1];
      if(!nonce||visited.has(nonce))continue;
      visited.add(nonce);
      assert.match(message.content,/First roll/,'Original dice must precede every decision');
      assert.match(message.content,/rg-chat-question/,'Pending questions receive the attention style');
      assert.equal(resolveRollChatChoice(message.id,nonce,'skip',fixture.observer),false);
      assert.equal(resolveRollChatChoice(message.id,'stale','skip'),false);
      const answer=String(answers.shift()??'skip');
      assert.equal(resolveRollChatChoice(message.id,nonce,answer),true);
      assert.equal(resolveRollChatChoice(message.id,nonce,answer),false,'A double click cannot resolve twice');
    }
  }
  assert.ok(done,'Roll must finish after all decisions');
  if(failure)throw failure;
  return result;
}
function ranger(profile='realm-guard-legacy-mixed') {
  fixture.messages.length=0;fixture.dice.length=0;fixture.settings.set('activeRulesProfileId',profile); refreshRulesProfileRuntime();
  const actor=new RealmGuardActor(actorData()); game.actors.length=0;game.actors.push(actor);return actor;
}

for(const profile of ['realm-guard-legacy-mixed','realm-guard-strict','mg1e','mg2e']) {
  let actor=ranger(profile);fixture.dice.push([4,2,5]);
  let result=await complete(actor.rollRole(actor.items.get('fighter')));
  assert.equal(result.successes,2);assert.equal(fixture.messages.length,1);assert.equal(actor.system.resources.fate.value,3);
  assert.equal(fixture.messages[0].flags['realm-guard'].rollDecisionPending,false);
  assert.doesNotMatch(fixture.messages[0].content,/data-rg-chat-choice/);
  actor=ranger(profile);fixture.dice.push([6,1,2]);
  result=await complete(actor.rollRole(actor.items.get('fighter')),['skip']);
  assert.equal(result.fateSpent,false);assert.equal(actor.system.resources.fate.value,3);
  actor=ranger(profile);fixture.dice.push([6,1,2],[6],[5]);
  result=await complete(actor.rollRole(actor.items.get('fighter')),['0']);
  assert.equal(result.successes,3);assert.equal(actor.system.resources.fate.value,2);assert.equal(fixture.messages.length,1);
  actor=ranger(profile);fixture.dice.push([4,2,5,1]);
  result=await complete(actor.rollAbility('will'));assert.equal(result.successes,2);
  actor=ranger(profile);actor.items.get('fighter').system.rating=0;fixture.dice.push([4,2]);
  result=await complete(actor.rollBeginnerLuck(actor.items.get('fighter'),{abilityKey:'health'}));assert.equal(result.successes,1);
  actor=ranger(profile);const opponent=new RealmGuardActor(actorData('opponent'));fixture.dice.push([4,2,5],[1,2]);
  result=await complete(actor.rollAutomaticVersus(actor.items.get('fighter'),opponent,{kind:'role',name:'Scout',rating:2}));assert.equal(result.passed,true);
  actor=ranger(profile);fixture.dice.push([4,4,4,4],[1,1,1,1]);
  result=await complete(actor.rollNatureVersus(new RealmGuardActor(actorData('opponent'))));assert.equal(fixture.messages.length,1);
}

let actor=ranger();fixture.dice.push([1,6,3],[4,2]);
let result=await complete(actor.rollRole(actor.items.get('fighter'),{wiseId:'wise'}),['0','skip']);
assert.equal(result.successes,2);assert.equal(actor.system.resources.fate.value,3);
assert.match(fixture.messages[0].content,/Use Wise reroll/);
actor=ranger();fixture.dice.push([1,6,3]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{wiseId:'wise'}),['skip','skip']);
assert.equal(result.successes,1);assert.equal(fixture.dice.length,0);

actor=ranger('mg2e');fixture.dice.push([1,6,3],[4,5]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{wiseId:'wise'}),['2','skip']);
assert.equal(result.successes,3);assert.equal(actor.system.resources.persona.value,2);assert.equal(actor.system.resources.fate.value,3);
actor=ranger('mg2e');actor.system.resources.persona.value=1;fixture.dice.push([1,2,4,5]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{wiseId:'wise',persona:1}),['skip']);
assert.equal(actor.system.resources.persona.value,0,'Pre-roll Persona is committed before Wise choices');
assert.doesNotMatch(fixture.messages[0].content,/Of Course · all failures · 1 Persona<\/button>/);

actor=ranger();
const talent={id:'reroll-talent',name:'Second Chance',type:'talent',system:{minLevel:2,frequency:'session',effectMode:'reroll',linkedSkill:'Fighter',linkType:'skill',session:{used:false}},async update(data){ for(const [key,value]of Object.entries(data)){if(key==='system.session.used')this.system.session.used=value;}}};
actor.items.push(talent); fixture.dice.push([1,2,4]);
let talentUse=resolveTalentUse(actor,talent.id,'Fighter');
result=await complete(actor.rollRole(actor.items.get('fighter'),{talentUse}),['skip']);
assert.equal(talent.system.session.used,false);
fixture.messages.length=0;fixture.dice.push([1,2,4],[5,4]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{talentUse}),['0']);
assert.equal(result.successes,3);assert.equal(talent.system.session.used,true);

actor=ranger();const token={id:'token',name:'Guard Ring',type:'tokenOfPower',system:{level:3,effectMode:'level',linkType:'skill',linkedSkill:'Fighter',session:{used:false}},async update(data){if(data['system.session.used']!==undefined)this.system.session.used=data['system.session.used'];}};
actor.items.push(token);fixture.dice.push([1,2,4]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{tokenPowerId:'token'}),['skip']);assert.equal(token.system.session.used,false);
fixture.messages.length=0;fixture.dice.push([1,2,4],[5,4]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{tokenPowerId:'token'}),['0']);assert.equal(result.successes,3);assert.equal(token.system.session.used,true);

actor=ranger('mg1e');const trait={id:'trait',name:'Bold',type:'trait',system:{rating:3,session:{positiveUses:0}},async update(update){const{assignPaths}=await import('./lib/playtest-foundry-fixture.mjs');assignPaths(this,update);}};actor.items.push(trait);fixture.dice.push([1,2,4]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{traitId:'trait',traitMode:'help'}),['skip']);assert.equal(result.successes,1);
fixture.messages.length=0;fixture.dice.push([1,2,4],[4,5]);
result=await complete(actor.rollRole(actor.items.get('fighter'),{traitId:'trait',traitMode:'help'}),['0']);assert.equal(result.successes,3);
actor=ranger();let tiedOpponent=new RealmGuardActor(actorData('opponent'));fixture.dice.push([4,1,1],[4,1]);
result=await complete(actor.rollAutomaticVersus(actor.items.get('fighter'),tiedOpponent,{kind:'role',name:'Scout',rating:2}),['skip']);assert.equal(result.tied,true);
actor=ranger();tiedOpponent=new RealmGuardActor(actorData('opponent'));fixture.dice.push([4,1,1],[4,1],[4,4,1,1],[1,1,1,1]);
result=await complete(actor.rollAutomaticVersus(actor.items.get('fighter'),tiedOpponent,{kind:'role',name:'Scout',rating:2}),['0']);assert.equal(result.passed,true);assert.equal(fixture.messages.length,1);

actor=ranger();fixture.dice.push([6,1,2]);
const inProgress=actor.rollRole(actor.items.get('fighter'));
await new Promise(resolve=>setImmediate(resolve));
assert.equal(await actor.rollRole(actor.items.get('fighter')),undefined,'An actor cannot start another roll during pending choices');
await complete(inProgress,['skip']);assert.equal(claimActorRoll(actor),true);releaseActorRoll(actor);
for(const parity of [false,true]) {
  actor=ranger();fixture.dialogs.push({label:'Free pool',dice:3,extra:0,persona:0,obstacle:1});fixture.dice.push([6,1,2]);
  if(parity)installCustomRollParityAction(RealmGuardActorSheet);
  const action=parity?RealmGuardActorSheet.DEFAULT_OPTIONS.actions.customRoll:RealmGuardActorSheet._customRoll;
  await complete(action.call({actor,isEditable:true}),['skip']);
  assert.equal(fixture.messages.length,1);assert.equal(actor.system.resources.fate.value,3);assert.match(fixture.messages[0].content,/Final|Result/);
}
actor=ranger();fixture.dice.push(new Error('dice engine failure'));
await assert.rejects(actor.rollRole(actor.items.get('fighter')),/dice engine failure/);
assert.equal(claimActorRoll(actor),true);releaseActorRoll(actor);
actor.system.resources.fate.value=1;
const spends=await Promise.allSettled([spendRollResource(actor,'fate',1),spendRollResource(actor,'fate',1)]);
assert.equal(spends.filter(row=>row.status==='fulfilled').length,1);assert.equal(actor.system.resources.fate.value,0);

const state={ranger:{participantIds:['a','b'],disposition:{start:8,current:5},individualDisposition:{a:{start:3,current:0},b:{start:5,current:5}}}};
assert.deepEqual(activeConflictParticipants(state),['b']);assert.equal(validateDispositionAllocation(state,state.ranger.individualDisposition),true);assert.equal(dispositionAllocationPending(state),false);
state.ranger.disposition.current=4;assert.equal(dispositionAllocationPending(state),true);
assert.equal(validateDispositionAllocation(state,{a:{start:3,current:-1},b:{start:5,current:5}}),false);
assert.equal(validateDispositionAllocation(state,{a:{start:3,current:0},b:{start:5,current:4},outsider:{start:0,current:0}}),false);
assert.throws(()=>createTemporaryOpposition({id:'x',name:'Rain',rating:-1}));
const opponent=createTemporaryOpposition({id:'rain',name:'Rain',rating:4});assert.equal(opponent.system.attributes.health.value,4);assert.equal(opponent.items.length,0);assert.equal(game.actors.some(a=>a.id==='rain'),false);
console.log('PASS conflict-session-polish-smoke · four profiles, original chat dice, optional Wise/Fate/Talent, double-click/ownership guards, resource order, concurrency, allocation and temporary opposition');
