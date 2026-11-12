import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const exportList = 'renderConflictWindow, handleWindowAction, startConflictDialog, currentState, setPublicState, setPrivateState, eligibleActionRoles, executeActorPool, gmApplyActionRoll, gmApplyDisposition, finishConflict, reopenConflict, revealCurrentAction, canSideRoll, conflictSideCard, gmHandleRangerPlan, cardPlannerHtml, applyEquipment, actorById, rollDisposition, advanceAfterAction, gmApplyManeuverChoice, gearActionModifiers, availableConflictWeapons, applyDispositionAllocation, reserveDispositionAuthoritative, releaseDispositionRoll, onSocket, rollCurrentAction';
const server = http.createServer(async (request,response) => {
  try {
    const url=new URL(request.url,'http://localhost');
    if(url.pathname==='/') { const manifest=JSON.parse(await fs.readFile(path.join(root,'system.json'),'utf8'));response.setHeader('Content-Type','text/html'); response.end(`<!doctype html><html><head>${manifest.styles.map(file=>`<link rel="stylesheet" href="/${file}">`).join('')}</head><body><div id="chat-sandbox"></div></body></html>`);return; }
    const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!filename.startsWith(root))throw Error('Outside test root');
    let data=await fs.readFile(filename);
    if(url.pathname==='/module/conflicts.mjs'&&url.searchParams.has('sandbox'))data=Buffer.from(data.toString()+`\nexport { ${exportList} };\n`);
    if(url.pathname==='/module/end-session.mjs'&&url.searchParams.has('sandbox'))data=Buffer.from(data.toString()+'\nexport { collectCriteria, reviewAndApprove, applyAwards };\n');
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
 assert.deepEqual(await page.evaluate(()=>conflict.eligibleActionRoles(game.actors.get('ranger'),conflict.currentState(),'ranger','attack').map(row=>row.name)),['Fighter','Scout']);
 assert.ok(await page.evaluate(()=>{const s=conflict.currentState();s.currentIndex=1;return conflict.eligibleActionRoles(game.actors.get('ranger'),s,'ranger','attack').some(row=>row.name==='Fighter');}));
 // Real DOM chat interaction: original dice are visible, skip has an accessible label, question pulses.
 await page.evaluate(()=>{game.user=fx.player;game.actors.get('ranger').items.splice(game.actors.get('ranger').items.findIndex(item=>item.id==='wise'),1);fx.dice.push([6,1,2]);window.chatPromise=conflict.executeActorPool({actor:game.actors.get('ranger'),source:{id:'fighter',name:'Fighter',rating:3,kind:'role'}}).catch(error=>{window.chatError=error.stack;});});
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
 // Outcome naming uses every actual participant, including ephemeral weather,
 // PCs on either side, and NPCs; the same names must reach the final chat card.
 for(const scenario of [
   {winner:'gm',ids:['enemy'],names:'enemy'},
   {winner:'gm',ids:['enemy','storm'],temporary:[{id:'storm',name:'The Winter Storm',rating:5}],names:'enemy, The Winter Storm'},
   {winner:'gm',ids:['storm'],temporary:[{id:'storm',name:'Rain & Wind <danger>',rating:5}],names:'Rain & Wind <danger>'},
   {winner:'gm',ids:['ranger2'],names:'ranger2'},
   {winner:'ranger',ids:['enemy'],names:'ranger, ranger2'}
 ]){
   await page.evaluate(async scenario=>{const s=baseState();s.stage='compromise';s.outcome={winner:scenario.winner};s.gm.participantIds=scenario.ids;s.gm.actorId=scenario.ids[0];s.gm.temporaryOpponents=scenario.temporary??[];await conflict.setPublicState(s);conflict.renderConflictWindow(s,{force:true});},scenario);
   assert.match(await page.locator('.rg-compromise-panel p').first().textContent(),new RegExp(scenario.names.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
   assert.equal(await page.locator('.rg-compromise-panel danger').count(),0,'Names are escaped');
   await page.locator('.rg-conflict-ending').screenshot({path:'output/playtest-followup/qa11-conflict-winner.png'});
   await page.evaluate(async()=>{document.querySelector('#rg-conflict-compromise-text').value='Agreed outcome';await conflict.finishConflict(conflict.currentState());});
   assert.equal(await page.locator('.rg-conflict-complete-card .rg-conflict-outcome strong').last().textContent(),scenario.names);
 }
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
 // Submitted cards stay hidden until the explicit flip, including in the GM UI.
 assert.ok(await page.evaluate(async()=>{
   game.user=fx.gm;const s=baseState();s.stage='rangerPlan';s.locks.gm=true;
   await conflict.setPrivateState({conflictId:s.id,gmPlan:['attack','defend','feint'].map(action=>({action,actorId:'enemy'}))});
   await conflict.setPublicState(s);
   await conflict.gmHandleRangerPlan({senderId:fx.player.id,conflictId:s.id,payload:{plan:[{action:'defend',actorId:'ranger'},{action:'feint',actorId:'ranger2'},{action:'maneuver',actorId:'ranger'}],weaponIds:{}}},s);
   const next=conflict.currentState();
   if(next.stage!=='ready'||next.revealed.length!==0)return false;
   conflict.renderConflictWindow(next,{force:true});
   const ranger=document.querySelector('.rg-side-plan.ranger');
   if(ranger.querySelector('.own-plan,.editable')||ranger.querySelectorAll('.rg-plan-slot.locked').length!==3)return false;
   if(!document.querySelector('[data-conflict-action="reveal"]'))return false;
   await conflict.revealCurrentAction(next);
   const revealed=conflict.currentState();
   conflict.renderConflictWindow(revealed,{force:true});
   if(revealed.revealed.length!==1||document.querySelectorAll('.rg-side-plan.ranger .revealed').length!==1||document.querySelectorAll('.rg-side-plan.ranger .locked').length!==2)return false;
   game.user=fx.player;conflict.renderConflictWindow(revealed,{force:true});
   if(document.querySelectorAll('.rg-side-plan.gm .revealed').length!==1||document.querySelectorAll('.rg-side-plan.gm .locked').length!==2)return false;
   game.user=fx.observer;conflict.renderConflictWindow(revealed,{force:true});
   return !document.querySelector('.rg-side-plan .own-plan');
 }));
 // Actual End Session render callback binds search/add/remove without resetting awards.
 await page.evaluate(async()=>{
   game.user=fx.gm;document.querySelector('#rg-conflict-window')?.remove();document.querySelector('#chat-sandbox').innerHTML='';
   window.roster=await import('/module/end-session-roster.mjs');session.installEndSession();
   const gmOnly=new actorModule.RealmGuardActor({...game.actors.get('ranger').toObject?.(),id:'gm-only',name:'GM character',type:'character',ownership:{gm:3},system:game.actors.get('ranger').system});game.actors.push(gmOnly);
   const originalWait=foundry.applications.api.DialogV2.wait;
   foundry.applications.api.DialogV2.wait=async options=>{
     document.querySelector('#eos-test-app')?.remove();
     const element=document.createElement('section');element.id='eos-test-app';element.className='application dialog';element.style.cssText='position:fixed;inset:10px;overflow:auto;padding:0;';
     element.innerHTML=`<header class="window-header" style="padding:10px">Realm Guard · End Session</header><form class="window-content" style="padding:16px">${options.content}<footer class="dialog-buttons" style="display:flex;gap:8px;margin-top:14px">${options.buttons.map(button=>`<button type="button">${button.label}</button>`).join('')}</footer></form>`;
     document.body.append(element);options.render?.(null,{element});window.lastEosOptions=options;return null;
   };
   window.showEndSession=async()=>{window.rosterActors=roster.endSessionRosterActors();await session.collectCriteria(rosterActors,1);};
   await showEndSession();window.restoreWait=()=>{foundry.applications.api.DialogV2.wait=originalWait;};
 });
 assert.equal(await page.locator('[data-eos-remove="gm-only"]').count(),0);
 assert.equal(await page.locator('[data-eos-remove="enemy"]').count(),0);
 await page.locator('[name="fateBelief_ranger"]').check();
 await page.locator('[name="mvp"]').selectOption('ranger');
 await page.locator('[data-eos-search]').fill('enemy');
 await page.locator('[data-eos-add="enemy"]').click();
 await page.waitForFunction(()=>game.settings.get('realm-guard','legacyMixedEndSessionRoster').actorIds.includes('enemy'));
 assert.equal(await page.locator('[data-eos-remove="enemy"]').count(),1);
 assert.equal(await page.locator('[name="fateBelief_ranger"]').isChecked(),true);
 assert.equal(await page.locator('[name="mvp"]').inputValue(),'ranger');
 await page.locator('[data-eos-remove="ranger2"]').click();
 await page.waitForFunction(()=>!game.settings.get('realm-guard','legacyMixedEndSessionRoster').actorIds.includes('ranger2'));
 await page.evaluate(()=>showEndSession());
 assert.equal(await page.locator('[data-eos-remove="enemy"]').count(),1);
 assert.equal(await page.locator('[data-eos-remove="ranger2"]').count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.querySelector('.rg-eos-legacy')).color==='rgb(43, 33, 21)'&&getComputedStyle(document.querySelector('[name="mvp"]')).color==='rgb(43, 33, 21)'));
 if(process.env.PLAYTEST_SCREENSHOT)await page.screenshot({path:process.env.PLAYTEST_SCREENSHOT.replace(/\.png$/, '-end-session.png')});
 // Review / Back retains criteria; choosing nobody stays empty after reopening.
 assert.ok(await page.evaluate(async()=>{
   const actors=roster.endSessionRosterActors();await session.collectCriteria(actors,1,{rows:[{actor:actors.find(a=>a.id==='ranger'),criteria:{fateBelief:true,personaEmbodiment:true}}],mvpId:'ranger'});
   return document.querySelector('[name="fateBelief_ranger"]').checked&&document.querySelector('[name="personaEmbodiment_ranger"]').checked&&document.querySelector('[name="mvp"]').value==='ranger';
 }));
 await page.locator('[data-eos-remove="enemy"]').click();await page.locator('[data-eos-remove="ranger"]').click();
 await page.waitForFunction(()=>game.settings.get('realm-guard','legacyMixedEndSessionRoster').actorIds.length===0);
 await page.evaluate(()=>showEndSession());assert.equal(await page.locator('.rg-eos-card').count(),0);
 await page.locator('[data-eos-search]').fill('ranger');await page.locator('[data-eos-add="ranger"]').click();
 assert.equal(await page.locator('.rg-eos-card').count(),1);
 await page.evaluate(()=>restoreWait());
 console.log("// QA.3 actual form interactions");
 // QA.3 actual form interactions use the production render callbacks and buttons.
 await page.evaluate(()=>{
   document.querySelector('#eos-test-app')?.remove();
   window.savedDialogWait=foundry.applications.api.DialogV2.wait;
   foundry.applications.api.DialogV2.wait=options=>new Promise(resolve=>{
     document.querySelector('#qa3-dialog')?.remove();
     const element=document.createElement('section');element.id='qa3-dialog';element.className='application dialog';element.style.cssText='position:fixed;inset:8px;overflow:auto;z-index:10000;background:#eddbb6;';
     element.innerHTML=`<header class="window-header" style="padding:10px">${options.window.title}</header><form class="window-content" style="padding:12px"><div class="dialog-content">${options.content}</div><footer class="dialog-buttons" style="display:flex;gap:8px">${options.buttons.map(button=>`<button type="button" data-dialog-action="${button.action}">${button.label}</button>`).join('')}</footer></form>`;
     document.body.append(element);options.render?.(null,{element});window.qa3DialogOptions=options;
     for(const button of element.querySelectorAll('[data-dialog-action]'))button.addEventListener('click',async event=>{
       try{const config=options.buttons.find(row=>row.action===button.dataset.dialogAction),result=await config.callback(event,{form:element.querySelector('form')});element.remove();resolve(result);}catch(error){window.qa3DialogError=error.stack;resolve(null);}
     });
   });
   window.actualFormDialogWait=foundry.applications.api.DialogV2.wait;
   game.user=fx.gm;window.criteriaActors=[game.actors.get('ranger'),game.actors.get('ranger2')];criteriaActors[0].system.creed='Protect the lost at great personal risk.';
   window.criteriaPromise=session.collectCriteria(criteriaActors,1);
 });
 assert.match(await page.locator('.rg-eos-creed').first().textContent(),/Protect the lost/);
 assert.deepEqual(await page.locator('.rg-eos-card').first().locator('.rg-eos-awards fieldset').nth(1).locator('input').evaluateAll(inputs=>inputs.map(input=>input.name)),['personaAgainstBelief_ranger','personaGoal_ranger','personaMortalCrisis_ranger']);
 await page.locator('[name="mvp"]').selectOption('ranger');await page.locator('[name="workhorse"]').selectOption('ranger');assert.equal(await page.locator('[name="mvp"]').inputValue(),'');
 await page.locator('[name="personaEmbodiment_ranger"]').check();await page.locator('[name="personaEmbodiment_ranger2"]').check();assert.equal(await page.locator('[name="personaEmbodiment_ranger"]').isChecked(),false);
 console.log("// Validation cannot be bypassed");
 // Validation cannot be bypassed by a malformed form with two Embodiment choices.
 await page.evaluate(()=>{document.querySelector('[name="personaEmbodiment_ranger"]').checked=true;});
 await page.locator('[data-dialog-action="review"]').click();assert.match((await page.evaluate(()=>criteriaPromise)).error,/Only one/);
 await page.evaluate(()=>{window.criteriaPromise=session.collectCriteria(criteriaActors,1);});
 for(const criterion of ['personaAgainstBelief','personaGoal','personaMortalCrisis','personaEmbodiment'])await page.locator(`[name="${criterion}_ranger"]`).check();
 await page.locator('[name="mvp"]').selectOption('ranger');await page.locator('[data-dialog-action="review"]').click();
 assert.equal(await page.evaluate(async()=>{window.awardCriteria=await criteriaPromise;return awardCriteria.rows[0].proposal.persona;}),5);
 assert.ok(await page.evaluate(async()=>{const a=game.actors.get('ranger');a.system.resources.persona.value=4;a.system.resources.persona.max=5;a.system.resources.fate.value=8;a.system.resources.fate.max=5;awardCriteria.rows.find(r=>r.actor.id==='ranger').proposal.fate=2;fx.settings.set('endSessionFinalized',false);await session.applyAwards(awardCriteria,{approvals:{ranger:{persona:true,fate:true},ranger2:{persona:true,fate:true}}},1);const first=a.system.resources.persona.value;await session.applyAwards(awardCriteria,{approvals:{ranger:{persona:true}}},1);return first===9&&a.system.resources.persona.value===9&&a.system.resources.fate.value===10;}));
 console.log("// Searchable team setup");
 // Searchable team setup, multiple ephemeral opponents, and remembered players.
 await page.evaluate(async()=>{game.user=fx.gm;await conflict.setPublicState(null);window.beforeActorCount=game.actors.size;window.startPromise=conflict.startConflictDialog();});
 assert.equal(await page.locator('.rg-conflict-setup-ranger').count(),0);
 const gmRoster=page.locator('[data-roster-side="gm"]');
 await gmRoster.locator('summary').click();
 for(const name of ['Rain','Wind']){await gmRoster.locator('[data-custom-name]').fill(name);await gmRoster.locator('[data-custom-add]').click();}
 await gmRoster.locator('[data-roster-search]').fill('enemy');await gmRoster.locator('[data-add="enemy"]').click();
 await page.locator('[name="type"]').selectOption('chase');await page.locator('[data-dialog-action="start"]').click();await page.evaluate(()=>startPromise);
 assert.deepEqual(await page.evaluate(()=>({actors:game.actors.size===beforeActorCount,opponents:conflict.currentState().gm.participantIds.length,temporary:conflict.currentState().gm.temporaryOpponents.length})),{actors:true,opponents:3,temporary:2});
 console.log("// Starting Disposition opens");
 // Starting Disposition opens the ordinary roll dialog directly, including its normal choices.
 await page.evaluate(async()=>{const s=conflict.currentState();s.stage='disposition';await conflict.setPublicState(s);window.dispositionPromise=conflict.rollDisposition('gm',s);});
 console.log('QA3 waiting for normal roll');
 await page.locator('.rg-conflict-standard-roll').waitFor();assert.equal(await page.locator('.rg-disposition-method').count(),0);
 assert.equal(await page.locator('.rg-roll-dialog [name="traitId"]').count(),1);assert.equal(await page.locator('.rg-roll-dialog [name="wiseId"]').count(),1);
 await page.locator('[data-dialog-action="cancel"]').click();await page.evaluate(()=>dispositionPromise);
 // Optional GM methods remain available without intercepting the ordinary roll.
 await page.evaluate(()=>{window.optionalPromise=conflict.handleWindowAction('disposition-options','gm',conflict.currentState());});
 await page.locator('[name="method"]').selectOption('manual');await page.locator('[name="fixed"]').fill('8');
 await page.locator('[data-dialog-action="continue"]').click();await page.evaluate(()=>optionalPromise);
 await page.evaluate(async()=>{const s=conflict.currentState();await conflict.gmApplyDisposition({side:'gm',disposition:8},s);await conflict.gmApplyDisposition({side:'ranger',disposition:8},conflict.currentState());});
 assert.equal(await page.evaluate(()=>conflict.currentState().stage),'equipment');
 assert.equal(await page.locator('.rg-equipment-step select').first().inputValue(),'');
 assert.equal(await page.locator('.rg-card-deck').count(),0);
 await page.locator('[data-conflict-action="lock-equipment"][data-side="gm"]').click();assert.equal(await page.evaluate(()=>Boolean(conflict.currentState().equipmentLocks.gm)),false);
 const opponentIds=await page.evaluate(()=>conflict.currentState().gm.participantIds);
 for(const id of opponentIds){await page.locator(`[data-conflict-custom-tool-actor="${id}"]`).click();await page.locator('#qa3-dialog [name="name"]').fill(`Custom tool ${id}`);await page.locator('#qa3-dialog [name="value"]').fill('1');await page.locator('[data-dialog-action="save"]').click();}
 await page.locator('[data-conflict-action="lock-equipment"][data-side="gm"]').click();
 await page.evaluate(()=>{game.user=fx.player;const s=conflict.currentState();for(const id of s.ranger.participantIds){game.actors.get(id).items.push({id:'boots',type:'gear',name:'Travel boots',system:{inventory:{mode:'worn'}}});}game.socket.emit=(_channel,message)=>{window.lastIntent=message;};conflict.renderConflictWindow(s,{force:true});});
 const rangerIds=await page.evaluate(()=>conflict.currentState().ranger.participantIds);
 for(const id of rangerIds)await page.locator(`[data-conflict-weapon-actor="${id}"]`).selectOption('gear:boots');
 await page.locator('[data-conflict-action="lock-equipment"][data-side="ranger"]').click();
 await page.evaluate(async()=>{game.user=fx.gm;await conflict.applyEquipment(lastIntent.payload,conflict.currentState());});
 assert.equal(await page.evaluate(()=>conflict.currentState().stage),'gmPlan');
 for(const [index,action]of ['attack','defend','maneuver'].entries()){await page.locator(`.rg-card-deck [data-action-card="${action}"]`).click();await page.locator(`[data-plan-actor="${index}"][data-plan-side="gm"]`).selectOption(opponentIds[index]);}
 await page.locator('[data-conflict-action="lock-plan"][data-side="gm"]').click();
 await page.evaluate(()=>{game.user=fx.player;conflict.renderConflictWindow(conflict.currentState(),{force:true});});
 for(const action of ['attack','defend','maneuver'])await page.locator(`.rg-card-deck [data-action-card="${action}"]`).click();
 await page.locator('[data-conflict-action="lock-plan"][data-side="ranger"]').click();
 await page.evaluate(async()=>{game.user=fx.gm;await conflict.gmHandleRangerPlan(lastIntent,conflict.currentState());});
 assert.equal(await page.evaluate(()=>conflict.currentState().stage),'ready');
 await page.locator('[data-conflict-action="reveal"]').click();assert.equal(await page.evaluate(()=>conflict.currentState().revealed[0].gmActorId),opponentIds[0]);
 await page.evaluate(async()=>{const s=conflict.currentState();s.currentIndex=1;s.stage='ready';await conflict.setPublicState(s);await conflict.revealCurrentAction(s);});
 assert.equal(await page.evaluate(()=>conflict.currentState().revealed.find(pair=>pair.index===1).gmActorId),opponentIds[1]);
 assert.ok(await page.evaluate(()=>conflict.actorById(conflict.currentState().gm.participantIds[1]).temporaryOpposition));
 // Disarm targets the declared custom benefit and leaves the inventory item intact.
 console.log('QA3 Custom inventory benefit / Maneuver');
 await page.evaluate(async()=>{
   const s=conflict.currentState(),pair=s.revealed.find(row=>row.index===s.currentIndex),actor=game.actors.get(pair.rangerActorId);
   await actor.setFlag('realm-guard','conflictTools',[{id:'travel-benefit',name:'Excellent travel boots',inventoryId:'boots',conflictTypes:[s.type],action:'any',effect:'dice',value:1,temporaryConflictId:s.id}]);
   pair.rangerWeaponId='tool:travel-benefit';s.stage='maneuver';s.pendingManeuver={side:'gm',margin:3};s.pendingManeuverQueue=[s.pendingManeuver];
   window.disarmActorId=actor.id;window.inventoryBefore=actor.items.length;await conflict.setPublicState(s);
   if(conflict.gearActionModifiers(actor,'attack',s,'ranger','tool:travel-benefit').dice!==1)throw Error('Custom benefit not applied');
   window.disarmPromise=conflict.gmApplyManeuverChoice({choice:'disarm'},s);
 });
 await page.locator('.rg-disarm-dialog').waitFor();assert.equal(await page.locator('[name="gearId"]').inputValue(),'tool:travel-benefit');
 await page.locator('#qa3-dialog [data-dialog-action]').first().click();await page.evaluate(()=>disarmPromise);
 assert.ok(await page.evaluate(()=>{const actor=game.actors.get(disarmActorId),s=conflict.currentState();return actor.items.length===inventoryBefore&&actor.items.get('boots')&&conflict.gearActionModifiers(actor,'attack',s,'ranger','tool:travel-benefit').dice===0&&!conflict.availableConflictWeapons(actor,s,'ranger').some(tool=>tool.id==='tool:travel-benefit');}));
 await page.evaluate(async()=>{const s=conflict.currentState();s.currentIndex=2;await conflict.advanceAfterAction(s);});
 assert.deepEqual(await page.evaluate(()=>({stage:conflict.currentState().stage,tools:Object.keys(conflict.currentState().weaponIds??{}).length>0,locks:conflict.currentState().equipmentLocks})),{stage:'equipment',tools:true,locks:{gm:false,ranger:false}});
 if(process.env.PLAYTEST_SCREENSHOT)await page.screenshot({path:process.env.PLAYTEST_SCREENSHOT.replace(/\.png$/,'-equipment.png')});
 await page.evaluate(()=>{foundry.applications.api.DialogV2.wait=savedDialogWait;});
 // Unused Wise costs Persona; a prepared Wise is not offered twice in that roll.
 console.log('QA3 visible paid Wise and prepared-Wise reuse guard');
 await page.evaluate(()=>{game.user=fx.player;const actor=game.actors.get('ranger');actor.items.push({id:'wise-paid',name:'Orc-wise',type:'wise',system:{}});actor.system.resources.persona.value=1;actor.system.resources.fate.value=0;fx.dice.push([1,2,4],[4,4]);window.paidWisePromise=conflict.executeActorPool({actor,source:{id:'fighter',name:'Fighter',rating:3,kind:'role'}});});
 await page.locator('.rg-chat-question').waitFor();assert.match(await page.locator('.rg-chat-question').textContent(),/1 Persona/);assert.match(await page.locator('.rg-decision-alert').textContent(),/Your choice is required/);
 assert.equal(await page.locator('.rg-chat-question-buttons button').first().evaluate(button=>getComputedStyle(button).color),'rgb(37, 27, 13)');
 await page.locator('.rg-chat-question-buttons button:not(.rg-chat-skip)').click();await page.evaluate(()=>paidWisePromise);
 assert.equal(await page.evaluate(()=>game.actors.get('ranger').system.resources.persona.value),0);
 await page.evaluate(async()=>{const actor=game.actors.get('ranger');await actor.items.get('wise-paid').update({"flags.realm-guard.wiseUsed":false});fx.dice.push([1,2,4],[4,4]);window.preparedResult=await conflict.executeActorPool({actor,source:{id:'fighter',name:'Fighter',rating:3,kind:'role'},wiseId:'wise-paid'});});
 assert.equal(await page.locator('.rg-chat-question').count(),0);assert.equal(await page.evaluate(()=>preparedResult.successes),3);
 // Three-player assignment is manual and permits A-B-A without requiring C first.
 await page.evaluate(async()=>{game.user=fx.gm;const s=baseState();s.stage='rangerPlan';s.locks={gm:true,ranger:false};s.ranger.participantIds=['ranger','ranger2','gm-only'];await conflict.setPublicState(s);game.user=fx.player;conflict.renderConflictWindow(s,{force:true});});
 for(const [index,actorId]of ['ranger','ranger2','ranger'].entries()){
   await page.locator('.rg-card-deck [data-action-card="attack"]').click();
   assert.equal(await page.locator(`[data-plan-side="ranger"][data-plan-actor="${index}"]`).inputValue(),'');
   await page.locator(`[data-plan-side="ranger"][data-plan-actor="${index}"]`).selectOption(actorId);
 }
 await page.locator('[data-conflict-action="lock-plan"][data-side="ranger"]').click();
 assert.deepEqual(await page.evaluate(()=>lastIntent.payload.plan.map(row=>row.actorId)),['ranger','ranger2','ranger']);
 console.log("// Other profile installers");
 // Stable 1.13.2: one roll per side, shared team points and Back without rerolls.
 console.log('Stable 1.13.2 · one team roll, manual Skills, GM/player distribution and Back');
 await page.evaluate(async()=>{
   game.user=fx.gm;foundry.applications.api.DialogV2.wait=actualFormDialogWait;
   const s=baseState();s.id='stable-team';s.stage='disposition';s.dispositionAllocationRequired=true;s.equipmentRequired=true;s.equipmentLocks={gm:false,ranger:false};s.allocationRevision=0;
   s.gm.disposition={start:0,current:0,rolled:false};s.ranger.disposition={start:0,current:0,rolled:false};
   game.actors.get('ranger').system.resources.persona.value=0;game.actors.get('ranger').system.resources.fate.value=0;
   game.actors.get('ranger2').ownership={observer:3};
   await conflict.setPublicState(s);window.transportMessages=[];game.socket.emit=(_channel,message)=>transportMessages.push(structuredClone(message));
   window.teamInitialCards=fx.messages.filter(message=>message.content.includes('First roll · Starting Disposition')).length;
 });
 assert.deepEqual(await page.evaluate(async()=>{
   const s=conflict.currentState();const results=await Promise.all([conflict.reserveDispositionAuthoritative({side:'gm',token:'first'},s,fx.gm),conflict.reserveDispositionAuthoritative({side:'gm',token:'second'},s,fx.gm)]);
   await conflict.gmApplyDisposition({side:'gm',disposition:999,claimToken:'wrong'},s);if(conflict.currentState().gm.disposition.rolled)throw Error('A foreign claim committed a roll');
   await conflict.releaseDispositionRoll({side:'gm',claimToken:'first'},s,fx.gm);return results;
 }),[true,false]);
 await page.evaluate(()=>{fx.dice.push([4,4]);window.teamGmPromise=conflict.rollDisposition('gm',conflict.currentState());});
 await page.locator('.rg-roll-dialog').waitFor();await page.evaluate(()=>conflict.rollDisposition('gm',conflict.currentState()));assert.equal(await page.locator('.rg-roll-dialog').count(),1);
 await page.locator('[data-dialog-action="roll"]').click();await page.evaluate(()=>teamGmPromise);
 assert.equal(await page.evaluate(()=>conflict.currentState().gm.disposition.current),6);
 await page.evaluate(()=>{game.user=fx.player;fx.dice.push([4,4,4]);window.teamPlayerPromise=conflict.rollDisposition('ranger',conflict.currentState());});
 await page.locator('[name="source"]').waitFor();assert.equal(await page.locator('[name="source"]').inputValue(),'');
 assert.ok(await page.locator('[name="source"] option[value="fighter"]').count());
 await page.locator('[name="source"]').selectOption('fighter');await page.locator('[data-dialog-action="continue"]').click();
 await page.locator('.rg-roll-dialog').waitFor();await page.locator('[data-dialog-action="roll"]').click();
 await page.waitForFunction(()=>transportMessages.some(message=>message.intent==='reserveDispositionRoll'));
 await page.evaluate(async()=>{game.user=fx.gm;await conflict.onSocket(transportMessages.find(message=>message.intent==='reserveDispositionRoll'));});
 await page.evaluate(async()=>{game.user=fx.player;await conflict.onSocket(transportMessages.find(message=>message.type==='conflict-disposition-reply'));});
 await page.evaluate(()=>teamPlayerPromise);
 await page.evaluate(async()=>{game.user=fx.gm;for(const message of transportMessages.filter(message=>['submitDisposition','releaseDispositionRoll'].includes(message.intent)))await conflict.onSocket(message);});
 assert.deepEqual(await page.evaluate(()=>({stage:conflict.currentState().stage,gm:conflict.currentState().gm.disposition.current,team:conflict.currentState().ranger.disposition.current,newRollCards:fx.messages.filter(message=>message.content.includes('First roll · Starting Disposition')).length-teamInitialCards,diceLeft:fx.dice.length})),{stage:'allocation',gm:6,team:7,newRollCards:2,diceLeft:0});
 await page.evaluate(()=>conflict.rollDisposition('ranger',conflict.currentState()));assert.equal(await page.locator('#qa3-dialog').count(),0);
 // A participating player who is not the captain can distribute the shared total.
 await page.evaluate(()=>{game.user=fx.observer;conflict.renderConflictWindow(conflict.currentState(),{force:true});});
 await page.locator('[data-conflict-action="allocate-disposition"]').click();
 await page.locator('[name="current_ranger"]').fill('3');await page.locator('[name="current_ranger2"]').fill('4');
 assert.match(await page.locator('[data-allocation-total]').textContent(),/7 \/ 7/);
 await page.locator('[data-dialog-action="save"]').click();
 await page.waitForFunction(()=>transportMessages.some(message=>message.intent==='submitAllocation'));
 await page.evaluate(async()=>{game.user=fx.gm;window.playerAllocationMessage=transportMessages.find(message=>message.intent==='submitAllocation');await conflict.onSocket(playerAllocationMessage);});
 assert.deepEqual(await page.evaluate(()=>({stage:conflict.currentState().stage,allocation:conflict.currentState().ranger.individualDisposition})),{stage:'equipment',allocation:{ranger:{start:3,current:3},ranger2:{start:4,current:4}}});
 assert.ok(await page.evaluate(async()=>{const s=conflict.currentState(),before=JSON.stringify(s);await conflict.applyDispositionAllocation({...playerAllocationMessage.payload,revision:s.allocationRevision},s,{id:'outsider',isGM:false});await conflict.applyDispositionAllocation(playerAllocationMessage.payload,s,fx.player);return JSON.stringify(conflict.currentState())===before;}));
 assert.equal(await page.locator('[data-conflict-action="allocate-disposition"]').count(),0,'Allocation is fixed after initial distribution; GM corrects the bar instead');
 assert.deepEqual(await page.locator('.rg-conflict-admin button').evaluateAll(buttons=>buttons.map(button=>button.dataset.conflictAction)),['back','abort']);
 // Skill choice stays manual during action rolls too, including an off-list Skill.
 await page.evaluate(async()=>{const s=conflict.currentState();s.stage='action';s.revealed=[{index:0,gmAction:'attack',rangerAction:'attack',rangerActorId:'ranger',gmActorId:'enemy',gmMode:'independent',rangerMode:'independent'}];await conflict.setPublicState(s);game.user=fx.player;window.manualActionPromise=conflict.rollCurrentAction('ranger',s);});
 await page.locator('[name="source"]').waitFor();assert.equal(await page.locator('[name="source"]').inputValue(),'');await page.locator('[name="source"]').selectOption('fighter');
 await page.locator('[data-dialog-action="continue"]').click();await page.locator('.rg-roll-dialog').waitFor();await page.locator('[data-dialog-action="cancel"]').click();await page.evaluate(()=>manualActionPromise);
 // A solo player receives the team total directly, without a distribution screen.
 await page.evaluate(async()=>{game.user=fx.gm;const s=baseState();s.id='stable-solo';s.stage='disposition';s.ranger.participantIds=['ranger'];s.dispositionAllocationRequired=false;s.equipmentRequired=true;s.gm.disposition={start:0,current:0,rolled:false};s.ranger.disposition={start:0,current:0,rolled:false};await conflict.setPublicState(s);await conflict.gmApplyDisposition({side:'gm',disposition:6},s);await conflict.gmApplyDisposition({side:'ranger',disposition:7},conflict.currentState());});
 assert.equal(await page.evaluate(()=>conflict.currentState().stage),'equipment');assert.equal(await page.locator('[data-conflict-action="allocate-disposition"]').count(),0);
 if(process.env.PLAYTEST_SCREENSHOT)await page.screenshot({path:process.env.PLAYTEST_SCREENSHOT.replace(/\.png$/,'-shared-disposition.png')});
 await page.evaluate(()=>{foundry.applications.api.DialogV2.wait=savedDialogWait;});
 // Other profile installers actually select the stable conflict / End Session flows.
 for(const profile of ['realm-guard-strict','mg1e','mg2e','torchbearer2e']) {
   const other=await browser.newPage({viewport:{width:800,height:600}});other.on('pageerror',error=>errors.push(error.message));
   await other.goto(`http://127.0.0.1:${server.address().port}`);
   assert.ok(await other.evaluate(async ({profile,state})=>{
     const {installPlaytestFixture,actorData}=await import('/qa/lib/playtest-foundry-fixture.mjs');const f=installPlaytestFixture();f.settings.set('activeRulesProfileId',profile);
     const {refreshRulesProfileRuntime}=await import('/module/rules-profile-service.mjs');refreshRulesProfileRuntime();
     const {RealmGuardActor}=await import('/module/documents.mjs');for(const id of ['ranger','ranger2','enemy'])game.actors.push(new RealmGuardActor(actorData(id)));
     const {installConflictEngine,openConflictWindow}=await import('/module/conflicts.mjs');installConflictEngine();f.settings.set('conflictState',JSON.stringify(state));openConflictWindow();
     if(!document.querySelector('#rg-conflict-window')||document.querySelector('.rg-legacy-polish,.rg-individual-disposition,.rg-conflict-instructions'))return false;
     const {installEndSession,openEndSession}=await import('/module/end-session.mjs');installEndSession();let criteriaHtml='',reviewHtml='';
     f.dialogs.push(options=>{criteriaHtml=options.content;return {rows:[{actor:game.actors.get('ranger'),criteria:{},proposal:{fate:1,persona:1}}]};},options=>{reviewHtml=options.content;return null;});await openEndSession();
     return !criteriaHtml.includes('rg-eos-roster')&&!criteriaHtml.includes('rg-eos-legacy')&&reviewHtml.includes('approveFate_ranger')&&reviewHtml.includes('approvePersona_ranger')&&!f.settings.has('legacyMixedEndSessionRoster');
   },{profile,state:await page.evaluate(()=>baseState())}),`${profile} must use the old installers and UI`);
   await other.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS conflict-session-browser · Chromium DOM: conflict/chat regressions; hidden plans and explicit flips; saved/searchable End Session roster, preserved selections, Back, empty list and parchment layout; four other profile installers retain stable UI');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
