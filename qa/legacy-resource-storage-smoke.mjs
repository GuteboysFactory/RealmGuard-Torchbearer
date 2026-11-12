import assert from 'node:assert/strict';
import {installPlaytestFixture,actorData} from './lib/playtest-foundry-fixture.mjs';
const fx=installPlaytestFixture();
const {RealmGuardActor}=await import('../module/documents.mjs');
const {RealmGuardActorSheet:Sheet}=await import('../sheets/actor-sheet.mjs');
const {adjustSelectedResources}=await import('../module/gm-tools.mjs');
const {collectSystemAudit}=await import('../module/system-audit.mjs');
const {refreshRulesProfileRuntime}=await import('../module/rules-profile-service.mjs');
const {resourceStorageMaximum}=await import('../module/legacy-mixed-scope.mjs');
refreshRulesProfileRuntime();
const actors=['character','npc'].map(type=>new RealmGuardActor({...actorData(type),type}));game.actors.push(...actors);
for(const actor of actors){
 for(const resource of ['fate','persona']){
  actor.system.resources[resource].value=5;
  await Sheet._adjustResource.call({actor},resource,1);assert.equal(actor.system.resources[resource].value,6);
  actor.system.resources[resource].value=50;
  await Sheet._adjustResource.call({actor},resource,-1);assert.equal(actor.system.resources[resource].value,49,'A decrement above five must only subtract one');
  await Sheet._adjustResource.call({actor},resource,-99);assert.equal(actor.system.resources[resource].value,0);
  assert.equal(actor.system.resources[resource].max,5,'Configured metadata remains finite and unchanged');
 }
 actor.system.resources.checks.value=9;await Sheet._checksUp.call({actor});assert.equal(actor.system.resources.checks.value,9);
}
for(const resource of ['fate','persona']){
 fx.dialogs.push({resource,delta:20});assert.equal(await adjustSelectedResources(actors),2);
 fx.dialogs.push({resource,delta:-1});await adjustSelectedResources(actors);
 for(const actor of actors)assert.equal(actor.system.resources[resource].value,19);
}
let audit=await collectSystemAudit();assert.equal(audit.issues.filter(i=>i.area==='Resources').length,0,'Large Legacy balances are valid in System Audit');
actors[0].system.resources.fate.value=-1;actors[1].system.resources.checks.value=10;
audit=await collectSystemAudit();assert.equal(audit.issues.filter(i=>i.area==='Resources').length,2,'Negative balances and excessive Checks remain invalid');
for(const profile of ['mg1e','mg2e']){
 fx.settings.set('activeRulesProfileId',profile);refreshRulesProfileRuntime();
 for(const actor of actors)for(const resource of ['fate','persona']){
  actor.system.resources[resource].value=5;
  await Sheet._adjustResource.call({actor},resource,1);assert.equal(actor.system.resources[resource].value,5);
  assert.equal(resourceStorageMaximum(actor,resource),5);
 }
 fx.dialogs.push({resource:'fate',delta:20});await adjustSelectedResources(actors);
 assert.ok(actors.every(a=>a.system.resources.fate.value===5),'Other profiles keep their GM-admin cap');
}
console.log('PASS uncapped Legacy PC/NPC balances: sheet controls, GM administration, zero floor, Checks cap, finite metadata, System Audit and other-profile isolation');
