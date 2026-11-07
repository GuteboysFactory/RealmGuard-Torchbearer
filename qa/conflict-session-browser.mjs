import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const exportList = 'renderConflictWindow, handleWindowAction, startConflictDialog, currentState, setPublicState, setPrivateState, eligibleActionRoles, executeActorPool, gmApplyActionRoll, gmApplyDisposition, finishConflict, reopenConflict, revealCurrentAction, canSideRoll, conflictSideCard';
const server = http.createServer(async (request,response) => {
  try {
    const url=new URL(request.url,'http://localhost');
    if(url.pathname==='/') { response.setHeader('Content-Type','text/html'); response.end('<!doctype html><html><head><link rel="stylesheet" href="/styles/realm-guard.css"><link rel="stylesheet" href="/styles/conflict-parchment-prototype.css"></head><body><div id="chat-sandbox"></div></body></html>');return; }
    const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!filename.startsWith(root))throw Error('Outside test root');
    let data=await fs.readFile(filename);
    if(url.pathname==='/module/conflicts.mjs'&&url.searchParams.has('sandbox'))data=Buffer.from(data.toString()+`\nexport { ${exportList} };\n`);
    if(url.pathname==='/module/end-session.mjs'&&url.searchParams.has('sandbox'))data=Buffer.from(data.toString()+'\nexport { collectCriteria, reviewAndApprove };\n');
    response.setHeader('Content-Type',filename.endsWith('.mjs')?'text/javascript':filename.endsWith('.css')?'text/css':filename.endsWith('.svg')?'image/svg+xml':'application/octet-stream');response.end(data);
  } catch(error) {response.statusCode=404;response.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYTEST_CHROME?{executablePath:process.env.PLAYTEST_CHROME}:{})});
const errors=[];
try {
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(async()=>{
   const {installPlaytestFixture,actorData}=await import('/qa/lib/playtest-foundry-fixture.mjs');
   window.fx=installPlaytestFixture();
   window.actorModule=await import('/module/documents.mjs');
   window.polish=await import('/module/conflict-polish.mjs');
   window.chat=await import('/module/roll-chat.mjs');
   window.conflict=await import('/module/conflicts.mjs?sandbox');
   window.session=await import('/module/end-session.mjs?sandbox');
   window.actorSheet=await import('/sheets/actor-sheet.mjs');window.itemSheet=await import('/sheets/item-sheet.mjs');
   const refresh=await import('/module/rules-profile-service.mjs');refresh.refreshRulesProfileRuntime();
   for(const id of ['ranger','ranger2','enemy']){const actor=new actorModule.RealmGuardActor(actorData(id));if(id==='enemy')actor.type='npc';game.actors.push(actor);}
   const create=ChatMessage.create;
   ChatMessage.create=async data=>{const message=await create(data);const node=document.createElement('article');node.id=message.id;node.className='sandbox-message';node.innerHTML=message.content;document.querySelector('#chat-sandbox').append(node);const update=message.update;message.update=async data=>{const result=await update.call(message,data);node.innerHTML=message.content;return result;};return message;};
   conflict.installConflictEngine();chat.installRollChat();Hooks.callAll('ready');
   window.baseState=()=>({id:'conflict-test',active:true,name:'Journey to Rivendell',type:'chase',stage:'gmPlan',exchange:1,currentIndex:0,ranger:{participantIds:['ranger','ranger2'],captainId:'ranger',goal:'Reach shelter',goalReady:true,disposition:{start:8,current:8,rolled:true}},gm:{actorId:'enemy',goal:'Catch the patrol',goalReady:true,disposition:{start:8,current:8,rolled:true}},locks:{gm:false,ranger:false},revealed:[],rolls:{gm:null,ranger:null},effects:{gm:{nextDice:0,disabledGearIds:[],swordActions:{}},ranger:{nextDice:0,disabledGearIds:[],swordActions:{}}},weaponIds:{},actionCounts:{ranger:0,ranger2:0},log:[]});
   await conflict.setPublicState(baseState());conflict.renderConflictWindow(conflict.currentState(),{force:true});
 });
 // Planning retains scroll / expanded information and user-selected size.
 await page.evaluate(()=>{const root=document.querySelector('#rg-conflict-window');root.style.width='820px';root.style.height='550px';root.style.left='10px';root.style.top='10px';root.style.transform='none';const body=root.querySelector('.rg-conflict-body');body.scrollTop=180;root.querySelector('.rg-conflict-instructions').open=true;window.beforeScroll=body.scrollTop;});
 await page.locator('.rg-card-deck [data-action-card="attack"]').first().dispatchEvent('click');
 assert.ok(await page.evaluate(()=>{const root=document.querySelector('#rg-conflict-window');return root.querySelector('.rg-conflict-body').scrollTop===beforeScroll&&root.querySelector('.rg-conflict-instructions').open&&root.style.width==='820px';}));
 // Non-owning players can see setup but cannot control either side or reveal hidden cards.
 assert.ok(await page.evaluate(()=>{game.user=fx.observer;const s=baseState();s.stage='rangerPlan';s.locks={gm:true,ranger:false};conflict.renderConflictWindow(s,{force:true});return Boolean(document.querySelector('#rg-conflict-window'))&&!document.querySelector('[data-conflict-action="lock-plan"]')&&!document.querySelector('[data-conflict-action="story-modifier"]');}));
 // GM exception changes only the current action, and player callers cannot set it.
 await page.evaluate(async()=>{game.user=fx.gm;const s=baseState();s.stage='action';s.revealed=[{index:0,gmAction:'attack',rangerAction:'attack',rangerActorId:'ranger',gmMode:'versus',rangerMode:'versus'}];await conflict.setPublicState(s);fx.dialogs.push('fighter');await conflict.handleWindowAction('skill-override','ranger',s);});
 assert.deepEqual(await page.evaluate(()=>conflict.eligibleActionRoles(game.actors.get('ranger'),conflict.currentState(),'ranger','attack').map(row=>row.name)),['Fighter']);
 assert.ok(await page.evaluate(()=>{const s=conflict.currentState();s.currentIndex=1;return conflict.eligibleActionRoles(game.actors.get('ranger'),s,'ranger','attack').every(row=>row.name!=='Fighter');}));
 // Real DOM chat interaction: original dice are visible, skip has an accessible label, question pulses.
 await page.evaluate(()=>{game.user=fx.player;fx.dice.push([6,1,2]);window.chatPromise=conflict.executeActorPool({actor:game.actors.get('ranger'),source:{id:'fighter',name:'Fighter',rating:3,kind:'role'}}).catch(error=>{window.chatError=error.stack;});});
 try { await page.locator('.rg-chat-question').waitFor({timeout:5000}); } catch(error) { console.log(await page.evaluate(()=>({error:window.chatError,notices:fx.notices,content:document.querySelector('#chat-sandbox').innerHTML})));throw error; }
 assert.match(await page.locator('.rg-first-roll').last().textContent(),/First roll/);
 assert.equal(await page.locator('.rg-chat-question').evaluate(el=>getComputedStyle(el).animationName),'rg-question-pulse');
 await page.getByRole('button',{name:'Decline this option',exact:true}).click();
 await page.evaluate(()=>window.chatPromise);
 assert.equal(await page.locator('.rg-chat-question').count(),0);
 assert.equal(await page.evaluate(()=>game.actors.get('ranger').system.resources.fate.value),3);
 // Zero Disposition disables action / Help; changed team points require GM allocation.
 assert.ok(await page.evaluate(()=>{const s=conflict.currentState();s.ranger.individualDisposition={ranger:{start:3,current:0},ranger2:{start:5,current:5}};s.ranger.disposition.current=5;return !conflict.canSideRoll(s,'ranger')&&polish.activeConflictParticipants(s).join()==='ranger2';}));
 // Temporary opposition works in every standard conflict and survives a JSON state round-trip.
 for(const type of ['argument','chase','fight','fightCreature','journey','negotiation','speech','war','other']) {
   assert.equal(await page.evaluate(async type=>{game.user=fx.gm;await conflict.setPublicState(null);fx.dialogs.push({name:'Storm',type,opponentId:'@temporary',temporaryName:'Storm',temporaryRating:4,participantIds:['ranger'],captainId:'ranger'});await conflict.startConflictDialog();const s=JSON.parse(JSON.stringify(conflict.currentState()));const a=polish.createTemporaryOpposition(s.gm.temporaryOpposition);const source=conflict.eligibleActionRoles(a,s,'gm','attack')[0];fx.dice.push([4,1,4,2]);const result=await conflict.executeActorPool({actor:a,source});return result.successes;},type),2);
 }
 // Completion can be reopened without replaying resources, learning or dice.
 assert.ok(await page.evaluate(async()=>{
   game.user=fx.gm;const s=baseState();s.stage='disposition';s.gm.disposition.rolled=false;s.ranger.disposition.rolled=false;
   await conflict.setPublicState(s);
   await Promise.all([conflict.gmApplyDisposition({side:'gm',disposition:7},s),conflict.gmApplyDisposition({side:'ranger',disposition:9},s)]);
   return conflict.currentState().gm.disposition.current===7&&conflict.currentState().ranger.disposition.current===9;
 }));
 assert.ok(await page.evaluate(async()=>{
   game.user=fx.gm;const s=baseState();s.stage='action';s.revealed=[{index:0,gmAction:'attack',rangerAction:'attack',rangerActorId:'ranger',gmMode:'independent',rangerMode:'independent'}];
   await conflict.setPublicState(s);await conflict.setPrivateState({conflictId:s.id,gmPlan:Array.from({length:3},()=>({action:'attack',actorId:'enemy'})),rangerPlan:Array.from({length:3},()=>({action:'attack',actorId:'ranger2'}))});
   await Promise.all([conflict.gmApplyActionRoll({side:'gm',exchange:1,actionIndex:0,roll:{actorId:'enemy',skillName:'Fighter',successes:2,pool:3,faces:[4,4,1]}},s),conflict.gmApplyActionRoll({side:'ranger',exchange:1,actionIndex:0,roll:{actorId:'ranger',skillName:'Fighter',successes:3,pool:3,faces:[4,4,4]}},s)]);
   const next=conflict.currentState();return next.gm.disposition.current===5&&next.ranger.disposition.current===6&&next.currentIndex===1;
 }));
 assert.ok(await page.evaluate(async()=>{
   game.user=fx.gm;const s=baseState();s.stage='action';s.revealed=[{index:0,gmAction:'attack',rangerAction:'attack',rangerActorId:'ranger',gmMode:'independent',rangerMode:'independent'}];await conflict.setPublicState(s);
   await conflict.gmApplyActionRoll({side:'gm',exchange:1,actionIndex:0,roll:{actorId:'enemy',successes:9}},s,fx.player);
   await conflict.gmApplyActionRoll({side:'ranger',exchange:0,actionIndex:0,roll:{actorId:'ranger',successes:9}},s,fx.player);
   return !conflict.currentState().rolls.gm&&!conflict.currentState().rolls.ranger;
 }));
 assert.ok(await page.evaluate(async()=>{
   game.user=fx.gm;const s=baseState();s.stage='action';s.gm.disposition={start:3,current:3,rolled:true};s.revealed=[{index:0,gmAction:'attack',rangerAction:'attack',rangerActorId:'ranger',gmMode:'independent',rangerMode:'independent'}];
   await conflict.setPublicState(s);await conflict.setPrivateState({conflictId:s.id,gmPlan:Array.from({length:3},()=>({action:'attack',actorId:'enemy'})),rangerPlan:Array.from({length:3},()=>({action:'attack',actorId:'ranger2'}))});
   await conflict.gmApplyActionRoll({side:'gm',exchange:1,actionIndex:0,roll:{actorId:'enemy',roleId:'fighter',skillName:'Fighter',successes:1,pool:3,faces:[4,1,1],natureTap:true,natureScope:'against'}},s);
   await conflict.gmApplyActionRoll({side:'ranger',exchange:1,actionIndex:0,roll:{actorId:'ranger',roleId:'fighter',skillName:'Fighter',successes:3,pool:3,faces:[4,4,4]}},s);
   if(conflict.currentState().stage!=='compromise')return false;
   const nature=game.actors.get('enemy').system.attributes.nature.value;
   const learning=JSON.stringify(game.actors.get('ranger').items.get('fighter').system.learning);
   await conflict.handleWindowAction('undo-resolution',null,conflict.currentState());
   if(conflict.currentState().stage!=='action'||conflict.currentState().gm.disposition.current!==3)return false;
   fx.dialogs.push(1);await conflict.handleWindowAction('correct-roll','ranger',conflict.currentState());
   await conflict.handleWindowAction('resolve-correction',null,conflict.currentState());
   return conflict.currentState().gm.disposition.current===2&&game.actors.get('enemy').system.attributes.nature.value===nature&&JSON.stringify(game.actors.get('ranger').items.get('fighter').system.learning)===learning;
 }));
 await page.evaluate(async()=>{game.user=fx.gm;const s=baseState();s.stage='compromise';s.outcome={winner:'ranger'};await game.actors.get('ranger').setFlag('realm-guard','conflictTools',[{id:'temporary-tool',temporaryConflictId:s.id}]);await conflict.setPublicState(s);conflict.renderConflictWindow(s,{force:true});document.querySelector('#rg-conflict-compromise-text').value='Keep these outcome notes';await Promise.all([conflict.finishConflict(s),conflict.finishConflict(s)]);if(game.actors.get('ranger').getFlag('realm-guard','conflictTools').length)throw Error('Temporary tools survived completion');await conflict.reopenConflict(conflict.currentState());});
 assert.equal(await page.evaluate(()=>conflict.currentState().stage),'compromise');
 assert.equal(await page.evaluate(()=>conflict.currentState().compromise.text),'Keep these outcome notes');
 assert.equal(await page.evaluate(()=>game.actors.get('ranger').getFlag('realm-guard','conflictTools').length),1);
 // Skill creation and the actual Item-sheet submit route retain explicit ability / corrected ticks.
 assert.ok(await page.evaluate(async()=>{
   const actor=game.actors.get('ranger'),sheet={actor,isEditable:true};
   for(const ability of ['will','health']){fx.dialogs.push({name:`Custom ${ability}`,rating:0,ability});await actorSheet.RealmGuardActorSheet._createRole.call(sheet);}
   const custom=actor.items.find(item=>item.name==='Custom health');
   await itemSheet.RealmGuardItemSheet._onSubmit.call({item:custom,isEditable:true,_processFormData:()=>({'system.learning.passed':2,'system.learning.failed':1,'system.beginnerAttempts':3}),render(){}},null,null,{});
   return custom.system.beginnerAbility==='health'&&custom.system.learning.passed===2&&custom.system.learning.failed===1&&custom.system.rating===0;
 }));
 assert.ok(await page.evaluate(async()=>{let html='';fx.dialogs.push(options=>{html=options.content;return null;});await session.collectCriteria([game.actors.get('ranger')],1);const root=document.createElement('div');root.innerHTML=html;return Boolean(root.querySelector('.rg-eos-nominations [name="personaEmbodiment_ranger"]'));}));
 assert.ok(await page.evaluate(()=>{const root=document.createElement('div');root.innerHTML='<div class="rg-conflict-roll-dialog"><label>Value<input name="saved" value="4"><small>Long explanation</small></label></div>';polish.collapseConflictHelp(root);return !root.querySelector('details').open&&root.querySelector('input').value==='4'&&root.querySelector('details small').textContent==='Long explanation';}));
 // Awards retain profile validation and use Finish Session as their sole approval.
 assert.ok(await page.evaluate(async()=>{let html='';fx.dialogs.push(options=>{html=options.content;return options.buttons.find(b=>b.action==='finish').callback(null,{});});const actor=game.actors.get('ranger');const result=await session.reviewAndApprove({rows:[{actor,criteria:{},proposal:{fate:1,persona:1}}]},1);return result.approvals.ranger.fate&&result.approvals.ranger.persona&&!html.includes('approveFate_');}));
 await page.setViewportSize({width:800,height:600});
 await page.evaluate(()=>{game.user=fx.gm;conflict.renderConflictWindow(baseState(),{force:true});const root=document.querySelector('#rg-conflict-window');root.style.width='720px';root.style.height='480px';root.style.left='8px';root.style.top='8px';root.style.transform='none';});
 assert.ok(await page.evaluate(()=>{const r=document.querySelector('#rg-conflict-window').getBoundingClientRect();return r.right<=innerWidth&&r.bottom<=innerHeight;}));
 if(process.env.PLAYTEST_SCREENSHOT)await page.screenshot({path:process.env.PLAYTEST_SCREENSHOT});
 assert.deepEqual(errors,[]);
 console.log('PASS conflict-session-browser · real Chromium DOM: scroll, resize, observer visibility, action override, flashing chat decisions, declined spend, zero Disposition, nine temporary opposition types, reopen and session approval');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
