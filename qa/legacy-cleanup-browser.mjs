// Actual production UI/services in Chromium. Foundry persistence is isolated;
// registered tool spies verify routing without touching a real campaign.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://local');if(u.pathname==='/'){const m=JSON.parse(await fs.readFile(path.join(root,'system.json'),'utf8'));res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><head>${m.styles.map(f=>`<link rel="stylesheet" href="/${f}">`).join('')}<style>body{background:#222}#messages{width:330px;position:absolute;top:15px;right:15px}#hotbar{position:fixed;bottom:20px;left:20px;width:280px;height:40px}#test-dialog{position:fixed;left:15px;top:15px;width:560px;max-height:85vh;overflow:auto;padding:20px;z-index:10010;background:#e6d9ba;color:#251f16}</style></head><body><div id="hotbar"></div><div id="chat-controls"></div><div id="messages"></div></body></html>`);return;}const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!file.startsWith(root))throw Error('Outside root');res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(await fs.readFile(file));}catch(e){res.statusCode=404;res.end(String(e));}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,...(process.env.PLAYTEST_CHROME?{executablePath:process.env.PLAYTEST_CHROME}:{})}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(async()=>{
  const {installPlaytestFixture,actorData}=await import('/qa/lib/playtest-foundry-fixture.mjs');window.fx=installPlaytestFixture();
  const {refreshRulesProfileRuntime}=await import('/module/rules-profile-service.mjs');refreshRulesProfileRuntime();
  const {RealmGuardActor}=await import('/module/documents.mjs');window.actor=new RealmGuardActor(actorData('hero'));game.actors.push(actor);
  window.registeredMenus=new Map();game.settings.registerMenu=(ns,key,options)=>registeredMenus.set(`${ns}.${key}`,options);
  for(const user of game.users){const flags={};user.getFlag=(_ns,key)=>flags[key];user.setFlag=async(_ns,key,value)=>{flags[key]=value;};user.unsetFlag=async(_ns,key)=>{delete flags[key];};}
  foundry.applications.api.DialogV2.wait=options=>new Promise(resolve=>{const form=document.createElement('form');form.id='test-dialog';form.innerHTML=options.content;document.body.append(form);for(const button of options.buttons??[]){const el=document.createElement('button');el.type='button';el.dataset.dialogAction=button.action;el.textContent=button.label;el.onclick=async()=>{const result=await button.callback?.(null,{form});form.remove();resolve(result);};form.append(el);}options.render?.(null,{element:form,close:async()=>{form.remove();resolve(null);}});});
  const create=ChatMessage.create;ChatMessage.create=async data=>{const m=await create(data),article=document.createElement('article');article.dataset.messageId=m.id;article.innerHTML=m.content;document.querySelector('#messages').append(article);const update=m.update;m.update=async patch=>{await update.call(m,patch);article.innerHTML=m.content;Hooks.callAll('renderChatMessageHTML',m,article);return m;};Hooks.callAll('renderChatMessageHTML',m,article);return m;};
  window.dock=await import('/module/gm-dock.mjs');window.calls=[];
  for(const id of ['start-session','end-session','conflict','turn-manager','post-obstacle','break','gm-control','npc-templates','content-studio','obstacle-control','starter-library','system-audit','rules-registry','effect-engine','test-engine','m4-core','m5-core','system-manual'])dock.registerGmDockTool({id,tooltip:id,icon:'fa-solid fa-dice',onClick:()=>calls.push(id)});
  dock.registerGmDockProvider({id:'extension',label:'Example extension',badge:()=>3,menu:()=>({title:'Extension menu',items:[{id:'open',label:'Open extension',onClick:()=>calls.push('extension')} ]})});
  dock.installGmDock();
  window.Sheet=(await import('/sheets/actor-sheet.mjs')).RealmGuardActorSheet;
  (await import('/module/legacy-chat-actions.mjs')).installLegacyChatActions(Sheet);
  window.rollChat=await import('/module/roll-chat.mjs');rollChat.installRollChat();
  window.hud=await import('/module/legacy-token-hud.mjs');hud.installLegacyTokenHud();
  Hooks.callAll('ready');
 });
 // Five play actions plus Other tools; no diagnostics or reset button in dock.
 assert.deepEqual(await page.locator('#rg-gm-dock>[data-rg-gm-tool]').evaluateAll(els=>els.map(e=>e.dataset.rgGmTool)),['conflict','turn-manager','post-obstacle','break']);
 assert.equal(await page.locator('#rg-gm-dock>[data-rg-gm-provider]').count(),2);assert.equal(await page.locator('.rg-gm-dock-reset').count(),0);
 await page.locator('[data-rg-gm-provider="rg-session-menu"]').click();assert.equal(await page.locator('[data-rg-provider-item="start-session"]').count(),1);assert.equal(await page.locator('[data-rg-provider-item="end-session"]').count(),1);await page.locator('[data-rg-provider-item="start-session"]').click();assert.ok(await page.evaluate(()=>calls.includes('start-session')));
 await page.locator('[data-rg-gm-provider="rg-tools-menu"]').click();assert.equal(await page.locator('[data-rg-provider-item="npc-templates"]').count(),1);assert.equal(await page.locator('[data-rg-provider-item="system-audit"]').count(),0);assert.equal(await page.locator('[data-rg-provider-item="system-manual"]').count(),0);
 await page.locator('[data-rg-provider-item="provider:extension"]').click();assert.equal(await page.locator('[data-rg-provider-menu="extension"]').count(),1);await page.locator('[data-rg-provider-item="open"]').click();assert.ok(await page.evaluate(()=>calls.includes('extension')));
 await page.evaluate(()=>game.settings.set('realm-guard','turnPhase','player'));assert.match(await page.locator('.rg-dock-play-status').textContent(),/Players/);
 await page.locator('[data-rg-gm-provider="rg-tools-menu"]').click();await page.locator('#rg-gm-dock').screenshot({path:'output/cleanup-review/dock.png'});await page.locator('[data-rg-provider-close]').click();
 await page.locator('.rg-dock-toggle').click();assert.equal(await page.locator('#rg-gm-dock>button:visible').count(),1);await page.locator('.rg-dock-toggle').click();
 // Move normal and external tools in and out, with choices retained on rerender.
 await page.locator('[data-rg-gm-provider="rg-tools-menu"]').click();await page.locator('[data-rg-provider-item="customize-quick-access"]').click();
 await page.locator('[name="quickAccess"][value="break"]').uncheck();await page.locator('[name="quickAccess"][value="npc-templates"]').check();await page.locator('[name="quickAccess"][value="provider:extension"]').check();await page.locator('[data-dialog-action="save"]').click();
 await page.evaluate(()=>dock.renderGmDock());
 assert.equal(await page.locator('#rg-gm-dock>[data-rg-gm-tool="break"]').count(),0);assert.equal(await page.locator('#rg-gm-dock>[data-rg-gm-tool="npc-templates"]').count(),1);assert.equal(await page.locator('#rg-gm-dock>[data-rg-gm-provider="extension"]').count(),1);
 assert.ok(await page.evaluate(()=>game.user.getFlag('realm-guard','gmDockQuickAccess').includes('npc-templates')));
 assert.ok(await page.locator('#rg-gm-dock').evaluate(e=>{const buttons=[...e.querySelectorAll(':scope>button')];return buttons.every(b=>Math.abs(b.getBoundingClientRect().top-buttons[0].getBoundingClientRect().top)<10); }),'Dock buttons never wrap onto a second row');
 await page.locator('#rg-gm-dock').screenshot({path:'output/cleanup-review/qa9-custom-dock.png'});
 await page.locator('#rg-gm-dock>[data-rg-gm-tool="npc-templates"]').click();assert.ok(await page.evaluate(()=>calls.includes('npc-templates')));
 await page.locator('[data-rg-gm-provider="extension"]').click();await page.locator('[data-rg-provider-item="open"]').click();
 await page.locator('[data-rg-gm-provider="rg-tools-menu"]').click();assert.equal(await page.locator('[data-rg-provider-item="break"]').count(),1);assert.equal(await page.locator('[data-rg-provider-item="npc-templates"]').count(),0);await page.locator('[data-rg-provider-item="customize-quick-access"]').click();
 await page.locator('[data-dialog-action="cancel"]').click();assert.equal(await page.locator('#rg-gm-dock>[data-rg-gm-tool="npc-templates"]').count(),1);
 await page.locator('[data-rg-gm-provider="rg-tools-menu"]').click();await page.locator('[data-rg-provider-item="customize-quick-access"]').click();await page.locator('[data-dialog-action="reset"]').click();
 assert.deepEqual(await page.locator('#rg-gm-dock>[data-rg-gm-tool]').evaluateAll(els=>els.map(e=>e.dataset.rgGmTool)),['conflict','turn-manager','post-obstacle','break']);
 await page.evaluate(()=>{const options=registeredMenus.get('realm-guard.dockAdministration');if(!options.restricted)throw Error('Settings must be GM-only');window.settingsApp=new options.type();window.settingsResult=settingsApp.render(true);});
 assert.equal(await page.locator('[data-rg-admin-tool="system-audit"]').count(),1);assert.equal(await page.locator('[data-rg-admin-tool="npc-templates"]').count(),0);await page.locator('[data-rg-admin-tool="system-audit"]').click();assert.ok(await page.evaluate(()=>calls.includes('system-audit')));
 await page.locator('[data-rg-dock-status]').uncheck();assert.equal(await page.locator('.rg-dock-play-status').count(),0);await page.locator('[data-rg-dock-status]').check();
 await page.evaluate(()=>game.user.setFlag('realm-guard','gmDockPosition',{left:700,top:40}));await page.locator('[data-rg-dock-reset]').click();assert.equal(await page.evaluate(()=>game.user.getFlag('realm-guard','gmDockPosition')),undefined);await page.locator('#test-dialog').screenshot({path:'output/cleanup-review/settings.png'});await page.locator('[data-dialog-action="close"]').click();
 // Player and GM see the same hidden marked controls; delete/config remain.
 await page.evaluate(()=>{const root=document.createElement('section');root.id='token-hud';root.innerHTML='<div class="col left"><button data-action="config">Config</button><input name="elevation" value="0"></div><div class="col right"><button data-action="visibility">Visibility</button><button data-action="togglePalette" data-palette="effects">Effects</button><button data-action="togglePalette" data-palette="movementActions">Movement</button><button data-action="target">Target</button><button data-action="combat">Combat</button><button data-action="delete">Delete</button><button class="rg-condition-hud-control">Conditions</button></div>';document.body.append(root);Hooks.callAll('renderTokenHUD',{element:root},root);});
 for(const user of ['gm','player']){await page.evaluate(id=>{game.user=game.users.get(id);Hooks.callAll('renderTokenHUD',{},document.getElementById('token-hud'));},user);for(const action of ['visibility','target','combat','togglePalette'])assert.equal(await page.locator(`#token-hud [data-action="${action}"]`).first().isVisible(),false);assert.equal(await page.locator('#token-hud .rg-condition-hud-control').isVisible(),false);assert.equal(await page.locator('#token-hud [data-action="delete"]').isVisible(),true);assert.equal(await page.locator('#token-hud [data-action="config"]').isVisible(),true);}
 // Chat custom roll opens directly for a user with no selected/assigned actor.
 await page.evaluate(()=>{game.user=fx.player;game.user.character=null;window.canvas={tokens:{controlled:[]}};window.before=JSON.stringify(actor.system);fx.dice.push([4,4,1]);});
 await page.locator('[data-rg-custom-chat]').dblclick();assert.equal(await page.locator('.rg-standalone-custom-roll').count(),1);assert.equal(await page.locator('#test-dialog [name="actorId"]').count(),0);await page.locator('[data-dialog-action="roll"]').click();await page.waitForFunction(()=>game.messages.at(-1)?.flags?.['realm-guard']?.standaloneCustomRoll);
 assert.equal(await page.evaluate(()=>game.messages.at(-1).speaker.actor),null);assert.equal(await page.evaluate(()=>JSON.stringify(actor.system)),await page.evaluate(()=>before));
 const d6 = page.getByRole('button', {name:'D6s', exact:true});
 for (const [user, faces, passed, failed] of [['player',[1,3,4,6],2,2], ['gm',[6],1,0]]) {
   await page.evaluate(({user,faces})=>{game.user=game.users.get(user);fx.dice.push(faces);},{user,faces});
   await d6.click();
   assert.equal(await page.locator('[name="d6Count"]').inputValue(),'1');
   await page.locator('[name="d6Count"]').fill(String(faces.length));
   await page.locator('[data-dialog-action="roll"]').click();
   await page.waitForFunction(user=>game.messages.at(-1)?.flags?.['realm-guard']?.standaloneD6 && game.messages.at(-1)?.author.id===user,user);
   const card = page.locator('.rg-standalone-roll-chat').last();
   assert.equal(await card.locator('.rg-die-face.success').count(),passed);
   assert.equal(await card.locator('.rg-die-face.failure').count(),failed);
   assert.equal(await card.locator('.rg-die-face.six').count(),0);
   assert.equal(await card.locator('.rg-roll-card-tally > span').allTextContents().then(values => values.join(' · ')), `Pass ${passed} · Fail ${failed}`);
 }
 assert.equal(await page.evaluate(()=>JSON.stringify(actor.system)),await page.evaluate(()=>before));
 // An ordinary roll shows its result and skips redundant history.
 await page.evaluate(async()=>{game.user=fx.gm;fx.settings.set('turnPhase','gm');actor.system.resources.persona.value=0;actor.system.resources.fate.value=0;actor.items.splice(actor.items.findIndex(i=>i.type==='wise'),1);fx.dice.push([4,4,1]);await actor.rollRole(actor.items.get('fighter'),{obstacle:1});});
 const final=page.locator('.rg-chat-roll-pipeline>.realm-guard.chat-roll').last();
 assert.deepEqual(await final.locator('.rg-roll-card-result > div > b').allTextContents(),['Result']);
 assert.equal(await final.locator('.rg-roll-card-fold').count(),0);
 assert.equal(await final.locator('.rg-roll-card-result .rg-die-face').count(),3);
 // Real pending roll choice: conspicuous animation only for the rolling user,
 // reduced-motion fallback, and working choice buttons.
 await page.evaluate(async()=>{window.choice=await rollChat.beginRollChat(actor,'Fighter',[6,1,4]);window.answer=choice.ask('Spend Persona on a Wise or Trait?',[{label:'Spend 1 Persona',value:'yes'}]);});
 await page.locator('.rg-choice-needs-attention .rg-chat-question').waitFor();assert.equal(await page.locator('.rg-choice-needs-attention .rg-chat-question').evaluate(e=>getComputedStyle(e).animationName),'rg-clear-choice-pulse');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.rg-choice-needs-attention .rg-chat-question').evaluate(e=>getComputedStyle(e).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.rg-choice-needs-attention').screenshot({path:'output/cleanup-review/attention.png'});await page.locator('[data-rg-chat-choice="0"]').click();assert.equal(await page.evaluate(()=>answer),'yes');await page.evaluate(()=>choice.finish('<p>Finished.</p>'));assert.equal(await page.locator('.rg-choice-needs-attention').count(),0);
 await page.evaluate(async()=>{
   await actor.createEmbeddedDocuments('Item',[{name:'Angmar-wise',type:'wise'}]);
   actor.system.resources.persona.value=1;
   actor.system.resources.fate.value=1;
   fx.dice.push([3,6,3,3,1,3],[2,5,2,1,5]);
   window.wiseRoll=actor.rollRole(actor.items.get('fighter'),{obstacle:1,extraDice:3});
 });
 const wiseQuestion = page.locator('.rg-chat-question').last();
 await wiseQuestion.getByRole('button',{name:'Angmar-wise · 1 Persona',exact:true}).click();
 await wiseQuestion.getByRole('button',{name:'Spend 1 Fate',exact:true}).waitFor();
 await wiseQuestion.getByRole('button',{name:'Decline this option',exact:true}).click();
 await page.evaluate(()=>wiseRoll);
 const wiseCard = page.locator('.rg-wise-dice-timeline').last();
 assert.deepEqual(await wiseCard.locator(':scope > div > b').allTextContents(),['Initial roll','Wise reroll']);
 assert.equal(await wiseCard.locator('.rg-die-crossed').count(),5);
 assert.equal(await wiseCard.locator('.rg-die-slot').count(),1);
 const finished = wiseCard.locator('xpath=ancestor::*[contains(@class,"rg-chat-roll-pipeline")]');
 const folds = finished.locator('.rg-roll-card-fold');
 assert.match(await folds.nth(0).locator('summary').innerText(),/^Teamwork & costs/);
 assert.match(await folds.nth(1).locator('summary').innerText(),/^Dice history/);
 assert.equal(await finished.locator('details[open]').count(),0);
 await folds.nth(1).locator('summary').click();
 const positions = await wiseCard.locator(':scope > div').evaluateAll(rows=>rows.map(row=>Array.from(row.querySelectorAll('.rg-die-face'),die=>die.getBoundingClientRect().left)));
 assert.deepEqual(positions[0],positions[1]);
 assert.equal(await finished.locator('.rg-roll-card-result .rg-die-face').count(),6);
 assert.deepEqual(await finished.locator('.rg-roll-decisions li').allTextContents(),['Angmar-wise · 1 Persona']);
 assert.equal(await finished.locator('.rg-first-roll').count(),0);
 assert.doesNotMatch(await finished.innerText(),/Declined|Spend 1 Fate|Use a relevant Wise/);
 // An actual OB challenge gets a red/green response button with a motion fallback.
 await page.evaluate(async()=>{const chat=await import('/module/legacy-chat-actions.mjs');await chat.publishChallenge(actor,'Persuader',1);});
 const response=page.locator('[data-rg-respond]').last();assert.equal(await response.evaluate(e=>getComputedStyle(e).animationName),'rg-ob-response-pulse');
 const colors=await response.evaluate(e=>{const a=e.getAnimations()[0];a.pause();a.currentTime=0;const red=getComputedStyle(e).backgroundColor;a.currentTime=1000;return [red,getComputedStyle(e).backgroundColor];});assert.deepEqual(colors,['rgb(147, 47, 52)','rgb(36, 99, 60)']);
 await response.screenshot({path:'output/cleanup-review/qa9-ob-response.png'});
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await response.evaluate(e=>getComputedStyle(e).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
 // Other profiles retain the original dock and native HUD controls.
 await page.evaluate(()=>{fx.settings.set('activeRulesProfileId','mouse-guard-2e');dock.renderGmDock();Hooks.callAll('renderTokenHUD',{},document.getElementById('token-hud'));});assert.equal(await page.locator('[data-rg-gm-tool="system-audit"]').count(),1);assert.equal(await page.locator('.rg-gm-dock-reset').count(),1);assert.equal(await page.locator('#token-hud [data-action="visibility"]').isVisible(),true);
 await page.evaluate(async()=>{
   actor.system.resources.fate.value=0;actor.system.resources.persona.value=0;
   fx.dice.push([4,4,1]);await actor.rollRole(actor.items.get('fighter'),{obstacle:1});
 });
 const compatibilityCard=page.locator('#messages article').last().locator('.rg-compact-roll-card');
 assert.equal(await compatibilityCard.locator('.rg-roll-card-result .rg-die-face').count(),3);
 assert.equal(await compatibilityCard.locator('.rg-roll-card-result .rg-roll-outcome').textContent(),'PASS');
 assert.deepEqual(errors,[]);console.log('PASS cleanup browser: compact dock, native Settings, HUD, D6s, actorless Custom Roll, ordinary and compatibility roll cards, Wise alignment, pending-choice attention and reduced motion');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
