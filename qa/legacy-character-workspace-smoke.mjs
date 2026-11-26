import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installPlaytestFixture, actorData } from './lib/playtest-foundry-fixture.mjs';
const fx=installPlaytestFixture();
const {RealmGuardActor}=await import('../module/documents.mjs');
const {RealmGuardActorSheet}=await import('../sheets/actor-sheet.mjs');
const {workspaceFigure,equipmentPoints,beginnerProgress,saveProgress}=await import('../module/legacy-character-workspace.mjs');
const {visibleRollOpponents,resolveLegacyRollTarget}=await import('../module/legacy-roll-targets.mjs');
const {sceneMenuEntries}=await import('../module/legacy-scene-menu.mjs');
const actor=new RealmGuardActor(actorData());game.actors.push(actor);
assert.equal(workspaceFigure(actor).key,'human','No ancestry defaults to human');
for(const [ancestry,key] of [['Human','human'],['Elf','elf'],['Dwarf','dwarf'],['Hobbit','hobbit'],['Dúnadan','human']]) {
 actor.system.ancestry=ancestry;
 for(const sex of ['male','female']) {await actor.setFlag('realm-guard','inventorySilhouetteSex',sex);const figure=workspaceFigure(actor);assert.equal(figure.key,key);assert.equal(figure.sex,sex);const path=new URL('../'+figure.src.replace('systems/realm-guard/',''),import.meta.url);assert.ok(fs.statSync(path).size>10000);const points=equipmentPoints(figure);assert.ok(points.head[1]<11);assert.ok(points.head[1]<points.neck[1]&&points.neck[1]<points.torso[1]&&points.torso[1]<points.belt[1]);assert.ok(points.belt[1]<53);assert.ok(points.cloak[0]>50);}
}
assert.notDeepEqual(equipmentPoints({key:'human',sex:'male'}),equipmentPoints({key:'dwarf',sex:'male'}));
assert.notDeepEqual(equipmentPoints({key:'human',sex:'male'}),equipmentPoints({key:'human',sex:'female'}));
actor.system.ancestry='Orc';assert.equal(workspaceFigure(actor).key,'neutral');
actor.system.attributes.nature={value:1,maximum:4};actor.items.get('fighter').system.rating=0;
assert.equal(beginnerProgress(actor,actor.items.get('fighter')).needed,4,'Taxed Nature must not reduce learning threshold');
let renders=0;const sheet={actor,isEditable:true,constructor:RealmGuardActorSheet,render:async()=>{renders++;}};
const role=actor.items.get('fighter');
role.getFlag=(ns,key)=>role.flags?.[ns]?.[key];
assert.equal(await saveProgress(sheet,{roleId:role.id},{attempts:2},{...beginnerProgress(actor,role),rating:0}),true);
assert.equal(role.system.beginnerAttempts,2);assert.equal(role.system.rating,0);
const expected={...beginnerProgress(actor,role),rating:0};
assert.equal(await saveProgress(sheet,{roleId:role.id},{attempts:-1},expected),false);
assert.equal(await saveProgress(sheet,{roleId:role.id},{attempts:5},expected),false);
assert.equal(await saveProgress(sheet,{roleId:role.id},{attempts:3.5},expected),false);
assert.equal(await saveProgress(sheet,{roleId:role.id},{attempts:4},expected),true);
assert.equal(role.system.rating,2);assert.equal(role.system.beginnerAttempts,0);assert.equal(role.system.learning.passed,0);assert.equal(role.system.learning.failed,0);
const trained={...role.system.learning,...{passNeeded:2,failNeeded:1},rating:2};
assert.equal(await saveProgress(sheet,{roleId:role.id},{passed:2,failed:1},trained),true);assert.equal(role.system.rating,3);
assert.equal(await saveProgress(sheet,{roleId:role.id},{passed:0,failed:0},trained),false,'Stale edit rejected');
game.user=fx.observer;assert.equal(await saveProgress(sheet,{roleId:role.id},{passed:1,failed:0},{}),false);game.user=fx.gm;
const opponent=new RealmGuardActor(actorData('opponent'));game.actors.push(opponent);
globalThis.canvas={tokens:{placeables:[{id:'opponent-token',actor:opponent,visible:true}]}};
assert.equal(visibleRollOpponents(actor).length,1);
assert.equal(resolveLegacyRollTarget(actor,{rollMode:{value:'versus'},opponentActorId:{value:opponent.id},opponentTokenId:{value:'opponent-token'}}).challengeTarget.id,opponent.id);
assert.equal(resolveLegacyRollTarget(actor,{rollMode:{value:'versus'},opponentActorId:{value:'missing'}}),null);
assert.deepEqual(resolveLegacyRollTarget(actor,{rollMode:{value:'standard'}}),{});
assert.ok(sceneMenuEntries({position:{x:0,y:0},SheetClass:RealmGuardActorSheet}).some(row=>row.label==='Place existing NPC…'));
game.user=fx.player;assert.equal(sceneMenuEntries({position:{x:0,y:0},SheetClass:RealmGuardActorSheet}).length,0);
for(const profile of ['realm-guard-strict','mouse-guard-1e','mouse-guard-2e','torchbearer-2e']) {fx.settings.set('activeRulesProfileId',profile);game.user=fx.gm;assert.equal(sceneMenuEntries({position:{x:0,y:0},SheetClass:RealmGuardActorSheet}).length,0);assert.equal(await saveProgress(sheet,{roleId:role.id},{passed:0,failed:0},{}),false);}
assert.ok(renders>=3);
// Actual Beginner's Luck execution: both outcomes count toward opening a new
// Skill; neither advances the underlying Health ability.
fx.settings.set('activeRulesProfileId','realm-guard-legacy-mixed');
const {refreshRulesProfileRuntime}=await import('../module/rules-profile-service.mjs');refreshRulesProfileRuntime();
const learner=new RealmGuardActor(actorData('learner'));learner.items.splice(learner.items.findIndex(row=>row.type==='wise'),1);learner.system.attributes.health.value=5;learner.system.attributes.nature={value:1,maximum:3};
const learningRole=learner.items.get('fighter');learningRole.system.rating=0;learningRole.getFlag=(ns,key)=>learningRole.flags?.[ns]?.[key];game.actors.push(learner);
const learnerSheet={actor:learner,isEditable:true,constructor:RealmGuardActorSheet,render:async()=>{}};
for(const [index,faces] of [[0,[4,4,1]],[1,[1,1,1]],[2,[4,4,4]]]) {
 fx.dialogs.push({obstacle:1,modifier:0,extraDice:0,help:[],persona:0,countLearning:true,versus:false});fx.dice.push(faces);
 await RealmGuardActorSheet._rollUntrained.call(learnerSheet,null,{closest:()=>({dataset:{itemId:'fighter'}})});
 if(index<2){assert.equal(learningRole.system.rating,0);assert.equal(learningRole.system.beginnerAttempts,index+1);}
}
assert.equal(learningRole.system.rating,2);assert.equal(learner.system.attributes.health.value,5);assert.equal(learner.getFlag('realm-guard','abilityLearning'),undefined);
// The published reference adds Trait dice after halving. Use an odd ability
// rating to distinguish the order; even ratings can mask this bug.
learningRole.system.rating=0;
await learner.createEmbeddedDocuments('Item',[{name:'Brave',type:'trait',system:{rating:1,session:{used:0}}}]);const trait=learner.items.at(-1);
fx.dice.push([4,4,1,1]);const traitResult=await learner.rollBeginnerLuck(learningRole,{abilityKey:'health',traitId:trait.id});
assert.equal(traitResult.roll.dice[0].results.length,4,'ceil(5/2) + 1 Trait = 4D');
assert.match(fx.messages.at(-1).content,/Trait after half/);

// Drive the real Ability dialog callback and roll pipeline with deterministic dice.
game.user.targets = new Set();
actor.system.resources.persona.value = 0;
for (const key of ["health", "will", "nature", "resources", "circles"]) {
 const ability = key[0].toUpperCase() + key.slice(1);
 if (key === "circles") fx.dialogs.push("standard");
 fx.dialogs.push(async dialog => {
   assert.match(dialog.content, /name="rollMode"/, `${ability} offers Versus`);
   return dialog.buttons.find(button => button.action === "roll").callback(null, { form: { elements: {
     rollMode: { value: "versus" }, opponentTokenId: { value: "opponent-token" }, opponentActorId:{value:opponent.id},
     obstacle: { value: "1" }, countLearning: { checked: true }
   } } });
 });
 const before = JSON.stringify(actor.getFlag("realm-guard", "abilityLearning"));
 fx.dice.push([4, ...Array(actor.system.attributes[key].value - 1).fill(1)]);
 await RealmGuardActorSheet._rollAbility.call(sheet, null, { dataset: { ability: key } });
 const message = fx.messages.at(-1);
 assert.match(message.content, /VERSUS/i);
 assert.match(message.content, /Waiting for response/);
 assert.equal(message.flags["realm-guard"].testSource.name, ability);
 assert.equal(message.flags["realm-guard"].challenge.target.id, opponent.id);
 assert.equal(message.flags["realm-guard"].versusTie, undefined);
 assert.equal(JSON.stringify(actor.getFlag("realm-guard", "abilityLearning")), before, "A pending challenge earns no Learning mark");
}

fx.dialogs.push(dialog => dialog.buttons.find(button => button.action === "roll").callback(null, { form: { elements: {
 rollMode: { value: "standard" }, obstacle: { value: "1" }
} } }));
fx.dice.push([4, 1, 1, 1]);
await RealmGuardActorSheet._rollAbility.call(sheet, null, { dataset: { ability: "health" } });
assert.match(fx.messages.at(-1).content, /PASS/);
assert.doesNotMatch(fx.messages.at(-1).content, /rg-roll-final-count|Final Successes|<b>6s<\/b>/);
assert.match(fx.messages.at(-1).content, /<b>Result<\/b>.*<b>Successes<\/b><strong>1<\/strong>.*<b>Obstacle<\/b><strong>1<\/strong>.*>PASS</s);
assert.equal(fx.messages.at(-1).flags["realm-guard"].versusTie, undefined);

const { ensureDefaultSkills } = await import("../module/default-skills.mjs");
const keeper = new RealmGuardActor(actorData("skill-retirement"));
keeper.items.push(
 { id:"active-manipulator", name:"Manipulator", type:"role", system:{rating:4, learning:{passed:2, failed:1}} },
 { id:"retired-deceiver", name:"Deceiver", type:"role", system:{rating:3, learning:{passed:1, failed:1}} }
);
await ensureDefaultSkills(keeper);
await ensureDefaultSkills(keeper);
assert.equal(keeper.items.filter(item => item.name === "Manipulator").length, 1);
assert.equal(keeper.items.get("active-manipulator").system.rating, 4);
assert.deepEqual(keeper.items.get("active-manipulator").system.learning, {passed:3, failed:2, passNeeded:4, failNeeded:3});
assert.equal(keeper.items.get("retired-deceiver").system.rating, 3);
assert.ok(!keeper.roles.some(item => item.name === "Deceiver"));
const newcomer = new RealmGuardActor(actorData("new-legacy-actor"));
await ensureDefaultSkills(newcomer);
assert.equal(newcomer.items.find(item => item.name === "Manipulator").system.rating, 0);
assert.ok(!newcomer.items.some(item => item.name === "Deceiver"));
const legacyActor = new RealmGuardActor(actorData("deceiver-only"));
legacyActor.items.push({ id:"trained-deceiver", name:"Deceiver", type:"role", system:{rating:3, learning:{passed:2, failed:1}} });
await ensureDefaultSkills(legacyActor);
await ensureDefaultSkills(legacyActor);
const transferred = legacyActor.roles.filter(item => item.name === "Manipulator");
assert.equal(transferred.length, 1);
assert.equal(transferred[0].system.rating, 3);
assert.deepEqual(transferred[0].system.learning, {passed:2, failed:1, passNeeded:3, failNeeded:2});
fx.settings.set("activeRulesProfileId", "mouse-guard-1e");
assert.ok(keeper.roles.some(item => item.name === "Deceiver"));
console.log('PASS legacy-character-workspace-smoke · eight assets, human default, Nature learning, atomic/stale edits, Versus target, GM/profile gates');
