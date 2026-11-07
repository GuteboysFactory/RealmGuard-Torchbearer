import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import { installPlaytestFixture, actorData } from './lib/playtest-foundry-fixture.mjs';
const fx=installPlaytestFixture();
const {RealmGuardActor}=await import('../module/documents.mjs');
const {RealmGuardActor:BaselineActor}=await import('../module/baseline-1.13.1/documents.mjs');
const {RealmGuardActorSheet}=await import('../sheets/actor-sheet.mjs');
const {installCustomRollParityAction}=await import('../module/custom-roll-parity-ui.mjs');
const {installCustomRollParityAction:baselineCustomInstall}=await import('../module/baseline-1.13.1/custom-roll-parity-ui.mjs');
const {refreshRulesProfileRuntime}=await import('../module/rules-profile-service.mjs');
const {legacyMixedPolishEnabled}=await import('../module/legacy-mixed-scope.mjs');
const {endSessionRosterActors,saveEndSessionRoster}=await import('../module/end-session-roster.mjs');
const snapshotHashes=JSON.parse(fs.readFileSync(new URL('./lib/stable-profile-snapshot-hashes.json',import.meta.url),'utf8'));
for(const [file,expected] of Object.entries(snapshotHashes)) {
  const source=fs.readFileSync(new URL('../module/baseline-1.13.1/'+file,import.meta.url),'utf8').replaceAll('\r\n','\n');
  assert.equal(createHash('sha256').update(source).digest('hex'),expected,`${file} stable snapshot must remain unchanged`);
}

async function scenario(Class, operation) {
  fx.messages.length=0;fx.dice.length=0;fx.dialogs.length=0;fx.notices.length=0;
  const actor=new Class(actorData());game.actors.length=0;game.actors.push(actor);
  const result=await operation(actor);
  return {result:JSON.parse(JSON.stringify(result??null)),system:actor.system,items:actor.items.map(({parent,update,...item})=>item),messages:fx.messages.map(message=>message.content),dialogsLeft:fx.dialogs.length,diceLeft:fx.dice.length};
}
const scenarios=[
  async a=>{fx.dice.push([4,2,5]);return a.rollRole(a.items.get('fighter'));},
  async a=>{fx.dice.push([6,1,2]);fx.dialogs.push(false);return a.rollRole(a.items.get('fighter'));},
  async a=>{fx.dice.push([6,1,2],[5]);fx.dialogs.push(true);return a.rollRole(a.items.get('fighter'));},
  async a=>{fx.dice.push([4,2,5,1]);return a.rollAbility('will');},
  async a=>{a.items.get('fighter').system.rating=0;fx.dice.push([4,2]);return a.rollBeginnerLuck(a.items.get('fighter'),{abilityKey:'health'});},
  async a=>{fx.dice.push([4,2,5],[1,2]);return a.rollAutomaticVersus(a.items.get('fighter'),new BaselineActor(actorData('opponent')),{kind:'role',name:'Scout',rating:2});},
  async a=>{fx.dice.push([4,4,4,4],[1,1,1,1]);return a.rollNatureVersus(new BaselineActor(actorData('opponent')));},
  async a=>{fx.dice.push([1,2,4],[4,5]);fx.dialogs.push({effect:'Of Course'});return a.rollRole(a.items.get('fighter'),{wiseId:'wise'});}
];
for(const profile of ['realm-guard-strict','mg1e','mg2e','torchbearer2e']) {
  fx.settings.set('activeRulesProfileId',profile);refreshRulesProfileRuntime();assert.equal(legacyMixedPolishEnabled(),false);
  for(const operation of scenarios) assert.deepEqual(await scenario(RealmGuardActor,operation),await scenario(BaselineActor,operation),`${profile} Actor behavior must match stable`);
  const actor=new RealmGuardActor(actorData());let prompts=0;const oldWait=foundry.applications.api.DialogV2.wait;foundry.applications.api.DialogV2.wait=async()=>{prompts++;return null;};
  await RealmGuardActorSheet._createRole.call({actor,isEditable:true});
  assert.equal(prompts,0,`${profile} must retain the old Skill creation`);assert.equal(actor.items.at(-1).name,'New Role');
  foundry.applications.api.DialogV2.wait=oldWait;
  const Current={DEFAULT_OPTIONS:{actions:{customRoll(){}}}},Baseline={DEFAULT_OPTIONS:{actions:{customRoll(){}}}};
  installCustomRollParityAction(Current);baselineCustomInstall(Baseline);
  const run=action=>scenario(RealmGuardActor,async a=>{fx.dialogs.push({label:'Free pool',dice:3,extra:0,persona:0,obstacle:1},false);fx.dice.push([6,1,2]);return action.call({actor:a});});
  assert.deepEqual(await run(Current.DEFAULT_OPTIONS.actions.customRoll),await run(Baseline.DEFAULT_OPTIONS.actions.customRoll),`${profile} runtime Custom Roll must match stable`);
  assert.equal(await saveEndSessionRoster([actor]),false);
}
fx.settings.set('activeRulesProfileId','unknown-profile');assert.equal(legacyMixedPolishEnabled(),false);
fx.settings.set('activeRulesProfileId','realm-guard-legacy-mixed');refreshRulesProfileRuntime();
game.actors.length=0;
const pc=new RealmGuardActor(actorData('pc')),gmOnly=new RealmGuardActor({...actorData('gm-only'),ownership:{gm:3}}),npc=new RealmGuardActor({...actorData('npc'),type:'npc'});
game.actors.push(pc,gmOnly,npc);
assert.deepEqual(endSessionRosterActors().map(a=>a.id),['pc'],'First use must exclude GM-only characters and NPCs');
await saveEndSessionRoster([pc,npc,npc]);assert.deepEqual(endSessionRosterActors().map(a=>a.id),['npc','pc']);
await saveEndSessionRoster([]);assert.deepEqual(endSessionRosterActors(),[],'An explicitly empty saved roster must stay empty');
fx.settings.set('legacyMixedEndSessionRoster',{initialized:true,actorIds:['deleted','pc','pc']});assert.deepEqual(endSessionRosterActors().map(a=>a.id),['pc']);
console.log('PASS legacy-mixed-profile-isolation-smoke · other profiles match stable Actor/Skill/Custom Roll behavior; roster defaults, persistence, deletion and empty selection');
