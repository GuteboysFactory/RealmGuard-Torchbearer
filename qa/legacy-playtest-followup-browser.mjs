// Separate browser contexts exercise production modules. The transport and
// Foundry documents are controlled fixtures, not a real Foundry server.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const exports='startConflictDialog,currentState,setPublicState,setPrivateState,handleWindowAction,gmApplyDisposition,applyDispositionAllocation,renderConflictWindow,onSocket,canSideRoll,gmApplyActionRoll,gmResolveCurrentPair,advanceAfterAction,finishConflict,editTeamDisposition,openPoolDialog,executeActorPool';
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local');if(url.pathname==='/'){const m=JSON.parse(await fs.readFile(path.join(root,'system.json'),'utf8'));res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><head>${m.styles.map(f=>`<link rel="stylesheet" href="/${f}">`).join('')}</head><body><div id="chat-controls"></div><div id="messages"></div></body></html>`);return;}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root))throw Error('Outside root');let data=await fs.readFile(file);if(url.pathname==='/module/conflicts.mjs'&&url.search)data=Buffer.from(data.toString()+`\nexport {${exports}};`);res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(data);}catch(e){res.statusCode=404;res.end(String(e));}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYTEST_CHROME?{executablePath:process.env.PLAYTEST_CHROME}:{})});
const pages=[],errors=[],bridges=[];
try{
 for(const userId of ['gm','player','observer']){
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();pages.push(page);
  page.on('pageerror',e=>errors.push(`${userId}: ${e.message}`));
  await page.exposeFunction('sendSetting',async(key,value)=>{for(const p of pages)if(p!==page)await p.evaluate(({key,value})=>{if(!window.fx)return;fx.settings.set(key,value);Hooks.callAll('updateSetting',{key:`realm-guard.${key}`});},{key,value});});
  await page.exposeFunction('sendSocket',async(message)=>{const job=Promise.all(pages.map(p=>p.evaluate(async m=>{for(const handler of window.socketHandlers??[])await handler(m);},message)));bridges.push(job);await job;});
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(async userId=>{
   const {installPlaytestFixture,actorData}=await import('/qa/lib/playtest-foundry-fixture.mjs');window.fx=installPlaytestFixture();game.user=game.users.get(userId);game.ready=false;
   const {refreshRulesProfileRuntime}=await import('/module/rules-profile-service.mjs');refreshRulesProfileRuntime();
   const {RealmGuardActor}=await import('/module/documents.mjs');window.Sheet=(await import('/sheets/actor-sheet.mjs')).RealmGuardActorSheet;
   for(const id of ['ranger','ranger2','enemy']){const data=actorData(id);data.ownership=id==='ranger'?{player:3}:{observer:3};data.items=data.items.filter(i=>i.type!=='wise');data.system.resources.fate.value=0;data.system.resources.persona.value=0;const actor=new RealmGuardActor(data);game.actors.push(actor);}
   game.users.get('player').character=game.actors.get('ranger');game.users.get('observer').character=game.actors.get('enemy');
   window.socketHandlers=[];game.socket.on=(_channel,fn)=>socketHandlers.push(fn);game.socket.emit=(_channel,m)=>void window.sendSocket(m);
   const set=game.settings.set;game.settings.set=async(ns,key,value)=>{await set(ns,key,value);if(key!=='conflictPrivateState')await window.sendSetting(key,value);return value;};
   window.conflict=await import('/module/conflicts.mjs?test');conflict.installConflictEngine();(await import('/module/turns.mjs')).installTurnManager();
   window.breaks=await import('/module/legacy-break.mjs');breaks.installLegacyBreak();
   window.view=await import('/module/legacy-session-view.mjs');view.installLegacySessionView();
   window.chat=await import('/module/legacy-chat-actions.mjs');chat.installLegacyChatActions(Sheet);
   window.undo=await import('/module/roll-undo.mjs');undo.installRollUndo(Sheet);
   (await import('/module/legacy-session.mjs')).installLegacySession();
   const create=ChatMessage.create;ChatMessage.create=async data=>{const m=await create(data),el=document.createElement('article');el.dataset.messageId=m.id;el.innerHTML=m.content;document.querySelector('#messages').append(el);const update=m.update;m.update=async patch=>{await update.call(m,patch);el.innerHTML=m.content;Hooks.callAll('renderChatMessageHTML',m,el);return m;};Hooks.callAll('renderChatMessageHTML',m,el);return m;};
   Hooks.callAll('ready');
  },userId);
 }
 const [gm,a,b]=pages;
 await gm.evaluate(async()=>{fx.dialogs.push({name:'Rivals at the ford',type:'argument',participantIds:['ranger','ranger2'],opponentIds:['enemy'],captainId:'ranger',oppositionCaptainId:'enemy'});await conflict.startConflictDialog();});
 for(const p of pages)assert.equal(await p.locator('#rg-conflict-window').count(),1,'Conflict auto-opens on every connected client');
 await b.evaluate(async()=>{fx.dialogs.push('Hold the ford');await conflict.handleWindowAction('edit-goal','gm',conflict.currentState());});
 await gm.waitForFunction(()=>conflict.currentState().gm.goal==='Hold the ford');
 await a.evaluate(async()=>{fx.dialogs.push('Cross the river');await conflict.handleWindowAction('edit-goal','ranger',conflict.currentState());});
 await gm.waitForFunction(()=>conflict.currentState().stage==='disposition');
 await gm.evaluate(async()=>{let s=conflict.currentState();await conflict.gmApplyDisposition({side:'gm',disposition:8},s);await conflict.gmApplyDisposition({side:'ranger',disposition:8},conflict.currentState());s=conflict.currentState();await conflict.applyDispositionAllocation({allocation:{ranger:{start:4,current:4},ranger2:{start:4,current:4}},start:8,current:8,exchange:1,revision:0},s,game.user);});
 assert.equal(await a.locator('[data-conflict-action="allocate-disposition"]').count(),0,'Original distribution stays locked');
 await gm.evaluate(async()=>{const s=conflict.currentState();s.stage='gmPlan';s.equipmentRequired=false;s.equipmentLocks={gm:true,ranger:true};await conflict.setPublicState(s);});
 assert.equal(await a.locator('.rg-card-deck button').count(),0,'Other team cannot choose opposition cards');
 assert.ok(await b.locator('.rg-card-deck button').count());
 for(let i=0;i<3;i++)await b.locator('.rg-card-deck [data-action-card="attack"]').click();
 await b.locator('[data-conflict-action="lock-plan"][data-side="gm"]').click();await gm.waitForFunction(()=>conflict.currentState().stage==='rangerPlan');
 assert.equal(await b.locator('.rg-card-deck button').count(),0,'Participant owning another team member cannot choose the Captain’s cards');
 assert.ok(await a.locator('.rg-card-deck button').count());
 assert.equal(await a.evaluate(()=>JSON.stringify(conflict.currentState()).includes('gmPlan')),false,'Unrevealed plans never enter public settings');
 for(let i=0;i<3;i++){await a.locator('.rg-card-deck [data-action-card="attack"]').click();await a.locator(`[data-plan-actor="${i}"]`).selectOption(i===1?'ranger2':'ranger');}
 await a.locator('[data-conflict-action="lock-plan"][data-side="ranger"]').click();await gm.waitForFunction(()=>conflict.currentState().stage==='ready');
 await gm.evaluate(async()=>{await conflict.handleWindowAction('reveal',null,conflict.currentState());});
 assert.equal(await b.evaluate(()=>conflict.canSideRoll(conflict.currentState(),'gm')),true,'Opposition player may roll');
 assert.equal(await a.evaluate(()=>conflict.canSideRoll(conflict.currentState(),'gm')),false);
 await gm.evaluate(async()=>{const s=conflict.currentState();await conflict.gmApplyActionRoll({side:'gm',exchange:s.exchange,actionIndex:s.currentIndex,roll:{actorId:'enemy',successes:2,pool:3,faces:[4,4,1],skillName:'Persuader'}},s);await conflict.gmApplyActionRoll({side:'ranger',exchange:s.exchange,actionIndex:s.currentIndex,roll:{actorId:'ranger',successes:3,pool:3,faces:[4,4,4],skillName:'Persuader'}},conflict.currentState());});
 assert.deepEqual(await gm.evaluate(()=>{const s=conflict.currentState();return {stage:s.stage,current:s.ranger.disposition.current,allocated:Object.values(s.ranger.individualDisposition).reduce((n,r)=>n+r.current,0)};}),{stage:'ready',current:6,allocated:6},'Disposition damage stays synchronized and never requests reallocation');
 assert.equal(await gm.locator('.rg-conflict-side-card').first().evaluate(e=>getComputedStyle(e).borderRadius),'0px');
 assert.equal(await gm.locator('.rg-conflict-side-card>header').first().evaluate(e=>e.querySelector('span').getBoundingClientRect().bottom<=e.querySelector('strong').getBoundingClientRect().top+1),true,'Action sits above the full-width character name');
 assert.ok(await a.locator('[data-conflict-action="back"]').count(),'A participant can Back without being Captain of both sides');
 await a.locator('[data-conflict-action="back"]').click();await gm.waitForFunction(()=>conflict.currentState().stage==='action');
 assert.equal(await gm.evaluate(()=>conflict.currentState().stage),'action','Back restores resolved action for correction');
 await gm.evaluate(async()=>{const s=conflict.currentState();s.stage='action';s.revealed=[{index:0,gmActorId:'enemy',rangerActorId:'ranger',gmAction:'maneuver',rangerAction:'defend',gmMode:'versus',rangerMode:'versus'}];s.currentIndex=0;s.rolls={gm:{actorId:'enemy',skillName:'Persuader',successes:2,pool:3,faces:[4,4,1]},ranger:{actorId:'ranger',skillName:'Persuader',successes:2,pool:3,faces:[4,4,1]}};await conflict.setPublicState(s);await conflict.gmResolveCurrentPair(s);});
 assert.equal(await gm.evaluate(()=>conflict.currentState().revealed[0].tiePending),false,'Maneuver vs Defend does not stop at a tied prompt');
 await gm.evaluate(async()=>{const s=conflict.currentState();s.stage='action';s.currentIndex=0;s.ranger.disposition.current=4;s.ranger.individualDisposition.ranger.current=0;s.ranger.individualDisposition.ranger2.current=4;s.revealed=[{index:0,gmActorId:'enemy',rangerActorId:'ranger2',gmAction:'attack',rangerAction:'defend',gmMode:'versus',rangerMode:'versus'}];s.rolls={gm:{actorId:'enemy',skillName:'Fighter',successes:1,pool:3,faces:[4,1,1]},ranger:{actorId:'ranger2',skillName:'Fighter',successes:4,pool:4,faces:[4,4,4,4]}};await conflict.setPublicState(s);await conflict.gmResolveCurrentPair(s);});
 assert.equal(await gm.evaluate(()=>conflict.currentState().ranger.disposition.current),7,'Defend restores Disposition by margin');
 assert.equal(await gm.evaluate(()=>Object.values(conflict.currentState().ranger.individualDisposition).reduce((n,r)=>n+r.current,0)),7);
 await gm.evaluate(async()=>{fx.dialogs.push(5);await conflict.editTeamDisposition('ranger',conflict.currentState());});assert.equal(await gm.evaluate(()=>conflict.currentState().ranger.disposition.current),5);
 // Resolution replaces the play view with The Compromise on all three clients.
 await gm.evaluate(async()=>{const s=conflict.currentState();s.stage='compromise';s.outcome={winner:'ranger'};await conflict.setPublicState(s);});
 for(const p of pages){assert.equal(await p.locator('.rg-conflict-ending h2').textContent(),'The Compromise');assert.equal(await p.locator('.rg-conflict-plans').count(),0);}
 for(const p of [a,b]){assert.equal(await p.locator('#rg-conflict-compromise-text').count(),0);assert.equal(await p.locator('[data-conflict-action="finish"]').count(),0);assert.equal(await p.locator('.rg-compromise-waiting').isVisible(),true);}
 await a.evaluate(async()=>{await conflict.finishConflict(conflict.currentState());});assert.equal(await gm.evaluate(()=>conflict.currentState().stage),'compromise','A player cannot finish the conflict');
 await gm.locator('#rg-conflict-compromise-text').fill('The rangers cross, but leave their supplies behind.');
 assert.equal(await gm.locator('.rg-compromise-panel').evaluate(e=>getComputedStyle(e).color),'rgb(255, 240, 198)','Compromise text is light on its dark panel');
 assert.ok(await gm.locator('.rg-conflict-goals').evaluate(e=>{const a=e.children[0].getBoundingClientRect(),b=e.children[1].getBoundingClientRect();return Math.abs(a.width-b.width)<2&&b.width>200;}),'Both goals have equal readable columns');
 await gm.evaluate(()=>conflict.renderConflictWindow(conflict.currentState()));
 assert.equal(await gm.locator('#rg-conflict-compromise-text').inputValue(),'The rangers cross, but leave their supplies behind.','Draft survives a rerender');
 await gm.locator('.rg-conflict-ending').screenshot({path:'output/playtest-followup/qa9-compromise.png'});
 await gm.locator('[data-conflict-action="finish"]').click();
 for(const p of pages)await p.waitForFunction(()=>!document.querySelector('#rg-conflict-window'));
 assert.equal(await gm.evaluate(()=>conflict.currentState().compromise.text),'The rangers cross, but leave their supplies behind.');
 assert.match(await gm.evaluate(()=>game.messages.at(-1).content),/leave their supplies behind/);
 for(const p of pages){await p.evaluate(()=>conflict.renderConflictWindow(conflict.currentState()));assert.equal(await p.locator('#rg-conflict-window').count(),0,'Later updates do not reopen an ended conflict');}
 await gm.evaluate(async()=>{window.newSetupShown=false;fx.dialogs.push(options=>{newSetupShown=options.content.includes('rg-conflict-setup');return null;});await conflict.startConflictDialog();});
 assert.equal(await gm.evaluate(()=>newSetupShown),true,'Clicking Conflict after completion opens a NEW conflict setup');
 assert.equal(await gm.locator('#rg-conflict-window').count(),0);
 // Break timer is synchronized, presence comes from a player's own click.
 await gm.evaluate(async()=>{fx.dialogs.push('0:02');await breaks.openBreak();});for(const p of pages)assert.equal(await p.locator('#rg-break').count(),1);
 assert.equal(await a.locator('[data-return="player"] .rg-break-person strong').textContent(),'ranger');
 await a.locator('[data-return="player"]').click();await gm.waitForFunction(()=>Boolean(game.settings.get('realm-guard','legacyBreak').returned.player));await b.waitForFunction(()=>document.querySelector('[data-return="player"]')?.textContent.includes('Back'));
 for(const p of pages){assert.equal(await p.locator('[data-return="player"]').evaluate(e=>e.closest('li').classList.contains('is-back')),true);assert.equal(await p.locator('[data-return="player"]').evaluate(e=>getComputedStyle(e.closest('li')).backgroundColor),'rgb(34, 76, 50)');}
 await a.waitForFunction(()=>document.querySelector('.rg-break-clock').textContent==='0:00');
 await gm.screenshot({path:path.join(root,'output/playtest-followup/break.png')});
 await gm.evaluate(()=>game.settings.set('realm-guard','legacyBreak',{active:false}));
 // End Session content propagates, and only the GM's form is editable.
 await gm.evaluate(async()=>{const el=document.createElement('div');el.className='rg-end-session';el.innerHTML='<h3>Session review</h3><label>MVP<select name="mvp"><option value="ranger">Ranger</option></select></label>';await view.publishSessionView(el);});for(const p of [a,b]){assert.equal(await p.locator('#rg-eos-shared').count(),1);assert.equal(await p.locator('#rg-eos-shared select').isDisabled(),true);}
 await a.screenshot({path:path.join(root,'output/playtest-followup/session.png')});
 await gm.evaluate(()=>view.publishSessionView(null,false));
 // A GM roll's actual successes produce a clickable reply with the target.
 await gm.evaluate(async()=>{const actor=game.actors.get('ranger');fx.dice.push([4,4,1]);await actor.rollRole(actor.items.get('fighter'),{obstacle:1});});
 assert.match(await gm.locator('[data-rg-respond]').last().textContent(),/Ob 2/);
 // Real DialogV2 form callbacks for chat replies and map creation.
 await a.evaluate(async()=>{
   foundry.applications.api.DialogV2.wait=options=>new Promise(resolve=>{const form=document.createElement('form');form.id='followup-dialog';form.style='position:fixed;top:10px;left:10px;z-index:999;width:620px;max-height:90vh;overflow:auto;background:#e5d5b1;padding:20px';form.innerHTML=options.content;document.body.append(form);for(const button of options.buttons??[]){const el=document.createElement('button');el.type='button';el.dataset.action=button.action;el.textContent=button.label;el.onclick=async()=>{const value=await button.callback?.(null,{form});(window.formResults??=[]).push({title:options.window?.title,value});form.remove();resolve(value);};form.append(el);}options.render?.(null,{element:form,close:async()=>{form.remove();resolve(null);}});Hooks.callAll('renderApplicationV2',{element:form},form);});
   window.challenge=await chat.publishChallenge(game.actors.get('ranger'),'Ford',2,{versus:true});
   // This card represents the GM's replicated chat message.
   challenge=await ChatMessage.create({content:'<button data-rg-respond>Respond</button>',flags:{'realm-guard':{challenge:{label:'Ford',obstacle:2,versus:true}}}});
   game.actors.get('ranger').system.resources.persona.value=1;
   fx.dice.push([4,4,4,1]);
 });
 await a.locator('[data-rg-respond]').last().click();
 assert.equal(await a.locator('#followup-dialog .rg-roll-dialog').count(),1,'Chat opens the normal Skill roll form directly');
 await a.locator('[data-action="cancel"]').click();assert.equal(await a.locator('[data-rg-respond]').last().evaluate(e=>e.classList.contains('rg-responded')),false,'Cancel must keep the challenge awaiting a response');
 assert.equal(await a.locator('[data-rg-respond]').last().evaluate(e=>getComputedStyle(e).animationName),'rg-ob-response-pulse');
 await a.locator('[data-rg-respond]').last().click();
 await a.locator('[name="replySkillId"]').selectOption('scout');await a.waitForFunction(()=>document.querySelector('.rg-roll-dialog-head strong')?.textContent==='Scout');await a.locator('[name="replySkillId"]').selectOption('fighter');await a.waitForFunction(()=>document.querySelector('.rg-roll-dialog-head strong')?.textContent==='Fighter');
 assert.equal(await a.locator('#followup-dialog').count(),1);
 assert.equal(await a.locator('[name="obstacle"]').inputValue(),'2');assert.equal(await a.locator('[name="extraDice"]').isEditable(),true);assert.ok(await a.locator('.rg-condition-roll-preview').count());
 await a.locator('[name="persona"]').selectOption('1');await a.locator('[data-action="roll"]').click();
 try{await a.waitForFunction(()=>Boolean(game.messages.at(-1)?.flags?.['realm-guard']?.rollUndo),{},{timeout:3000});}catch(e){console.log(errors);console.log(JSON.stringify(await a.evaluate(()=>({forms:window.formResults,notices:fx.notices,messages:game.messages.map(m=>({content:m.content,flags:m.flags})),actor:game.actors.get('ranger').system})),null,2));throw e;}
 assert.equal(await a.evaluate(()=>game.actors.get('ranger').system.resources.persona.value),0);
 assert.equal(await a.evaluate(()=>game.actors.get('ranger').items.get('fighter').system.learning.passed),1);
 await a.waitForFunction(()=>document.querySelector('[data-rg-respond].rg-responded'));
 assert.equal(await a.locator('[data-rg-respond]').last().textContent(),'ranger Responded');
 assert.equal(await a.locator('[data-rg-respond]').last().evaluate(e=>getComputedStyle(e).animationName),'none');
 await a.locator('[data-rg-respond]').last().screenshot({path:'output/playtest-followup/qa10-responded.png'});
 // Simulate Foundry delivering the original message and the player's owned
 // response document to a second client; the GM never writes the player's roll.
 const responseDocs=await a.evaluate(()=>({source:{id:challenge.id,content:challenge.content,flags:challenge.flags},reply:JSON.parse(JSON.stringify({id:game.messages.at(-1).id,flags:game.messages.at(-1).flags}))}));
 await gm.evaluate(({source,reply})=>{game.messages.push(reply);const el=document.createElement('article');el.dataset.messageId=source.id;el.innerHTML=source.content;document.querySelector('#messages').append(el);Hooks.callAll('renderChatMessageHTML',source,el);},responseDocs);
 assert.equal(await gm.locator('[data-rg-respond]').last().textContent(),'ranger Responded','Other clients read the persisted response status');
 await a.locator('[data-rg-undo-roll]').last().click();
 assert.equal(await a.evaluate(()=>game.actors.get('ranger').system.resources.persona.value),1);assert.equal(await a.evaluate(()=>game.actors.get('ranger').items.get('fighter').system.learning.passed),0);
 await a.evaluate(()=>Hooks.callAll('updateChatMessage',game.messages.at(-1)));
 assert.equal(await a.locator('[data-rg-respond]').last().evaluate(e=>e.classList.contains('rg-responded')),false,'Undo restores the pending response button');
 await a.evaluate(()=>{window.extraTest=conflict.openPoolDialog({actor:game.actors.get('ranger'),title:'Conflict action',choices:[{id:'fighter',name:'Fighter',rating:3,kind:'role'}],state:conflict.currentState(),side:'ranger'});});await a.locator('[name="source"]').selectOption('fighter');await a.locator('[data-action="continue"]').click();assert.equal(await a.locator('[name="extraDice"]').isEditable(),true);await a.locator('[name="extraDice"]').fill('2');await a.locator('[data-action="roll"]').click();assert.equal(await a.evaluate(async()=>(await extraTest).extra),2);
 assert.equal(await a.evaluate(async()=>{fx.dice.push([4,4,4,4,4]);const result=await conflict.executeActorPool({actor:game.actors.get('ranger'),source:{id:'fighter',name:'Fighter',kind:'role',rating:3},extra:2});return result.pool;}),5);
 assert.deepEqual(await a.evaluate(async()=>{const actor=game.actors.get('ranger');actor.items.get('fighter').system.rating=0;actor.system.attributes.health.value=3;actor.items.push({id:'brave',type:'trait',name:'Brave',system:{rating:1}});fx.dice.push([4,4,4]);const result=await conflict.executeActorPool({actor,source:{id:'fighter',name:'Fighter',kind:'role',rating:0,beginnerAbility:'health'},traitId:'brave'});actor.items.get('fighter').system.rating=3;actor.system.attributes.health.value=4;return {beginner:result.beginnerLuck,preHalf:result.preHalf,pool:result.pool};}),{beginner:true,preHalf:3,pool:3},'Conflict Beginner’s Luck applies the Trait die after halving');
 await gm.evaluate(async()=>{
   window.map=await import('/module/legacy-map-points.mjs');window.createdJournals=[];window.createdNotes=[];window.createdItems=[];
   globalThis.Item={create:async data=>{const item={...data,id:'new-item',uuid:'Item.new-item',delete:async()=>{}};createdItems.push(item);return item;}};
   globalThis.JournalEntry={create:async data=>{const doc={...data,id:`journal${createdJournals.length}`,delete:async()=>{}};createdJournals.push(doc);return doc;}};
   globalThis.canvas={scene:{id:'scene',createEmbeddedDocuments:async(kind,rows)=>{createdNotes.push(...rows);return rows;}}};
   CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE=0;CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER=2;
   fx.dialogs.push({kind:'place',name:'Hidden ruin',icon:'ruin',description:'Old stones <script>bad</script>',visible:false});await map.createMapPoint({x:120,y:340});
   fx.dialogs.push({kind:'place',name:'Village',icon:'village',description:'A safe village',visible:true});await map.createMapPoint({x:420,y:540});
   fx.dialogs.push({kind:'item',itemType:'wise',name:'Ford-wise',icon:'item',description:'Knowledge of the ford',visible:false});await map.createMapPoint({x:620,y:740});
 });
 assert.deepEqual(await gm.evaluate(()=>createdJournals.map(j=>j.ownership.default)),[0,2,0]);assert.deepEqual(await gm.evaluate(()=>createdNotes.map(n=>[n.x,n.y])),[[120,340],[420,540],[620,740]]);assert.equal(await gm.evaluate(()=>createdItems[0].type),'wise');
 assert.ok(await gm.evaluate(()=>createdJournals[0].pages[0].text.content.includes('&lt;script&gt;')));
 await gm.evaluate(()=>{const el=document.createElement('section');el.id='map-preview';el.style='position:fixed;inset:20px;background:#dfd0aa;padding:25px;z-index:200;display:grid;grid-template-columns:repeat(4,1fr);gap:20px';el.innerHTML=map.MAP_ICONS.map(([id,label])=>`<div style="text-align:center;color:#29251e"><img style="width:64px;height:64px" src="/assets/ui/map-icons/${id}.svg"><p>${label}</p></div>`).join('');document.body.append(el);});
 await gm.screenshot({path:path.join(root,'output/playtest-followup/map-icons.png')});
 await gm.evaluate(async()=>{
   document.querySelector('#map-preview').remove();const flags={};game.user.getFlag=(_ns,key)=>flags[key];game.user.setFlag=async(_ns,key,value)=>{flags[key]=value;};const hotbar=document.createElement('div');hotbar.id='hotbar';hotbar.style='position:fixed;left:20px;bottom:20px;width:300px;height:50px';document.body.append(hotbar);
   window.dock=await import('/module/gm-dock.mjs');dock.renderGmDock();
 });
 await gm.locator('.rg-dock-toggle').click();assert.equal(await gm.locator('#rg-gm-dock').evaluate(el=>el.classList.contains('rg-dock-minimized')),true);assert.equal(await gm.locator('[data-rg-gm-tool="break"]').isVisible(),false);await gm.locator('.rg-dock-toggle').click();assert.equal(await gm.locator('[data-rg-gm-tool="break"]').isVisible(),true);
 assert.equal(await a.locator('[data-rg-custom-chat]').count(),1);
 await a.evaluate(()=>{const app=document.createElement('section');app.className='application rg-legacy-workspace-window minimized';app.innerHTML='<header><h4 class="window-title"></h4></header>';document.body.append(app);Hooks.callAll('renderApplicationV2',{element:app,actor:game.actors.get('ranger')},app);});assert.equal(await a.locator('.window-title').last().textContent(),'ranger');
 for(const job of bridges)await job;
 assert.deepEqual(errors,[]);
 console.log('PASS 3 browser contexts: auto-open; PvP Captain-only secret plans; player opposition roll permission; allocation persistence and auto-loss; Back; Maneuver/Defend equal successes; Defend recovery; GM correction; completion close; synchronized break and presence; shared read-only End Session; GM roll reply; real reply form and Undo of Persona + Learning; map coordinates/ownership/escaping; 16 map icons.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
