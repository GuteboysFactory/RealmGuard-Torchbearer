// Production services and DOM events; only Foundry persistence/socket transport
// are fixtures. This does not replace live Foundry acceptance testing.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local');if(url.pathname==='/'){const m=JSON.parse(await fs.readFile(path.join(root,'system.json'),'utf8'));res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><head>${m.styles.map(f=>`<link rel="stylesheet" href="/${f}">`).join('')}</head><body></body></html>`);return;}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root))throw Error('Outside root');res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(await fs.readFile(file));}catch(e){res.statusCode=404;res.end(String(e));}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYTEST_CHROME?{executablePath:process.env.PLAYTEST_CHROME}:{})}),pages=[],errors=[];
try{
 for(const userId of ['gm','player']){
  const page=await(await browser.newContext({viewport:{width:1280,height:900}})).newPage();pages.push(page);page.on('pageerror',e=>errors.push(`${userId}: ${e.message}`));
  await page.exposeFunction('sendSetting',async(key,value)=>{for(const p of pages)if(p!==page)await p.evaluate(({key,value})=>{if(!window.fx)return;fx.settings.set(key,value);Hooks.callAll('updateSetting',{key:`realm-guard.${key}`});},{key,value});});
  await page.exposeFunction('sendSocket',async message=>{await Promise.all(pages.map(p=>p.evaluate(async m=>{window.received.push(m);for(const handler of window.socketHandlers??[])await handler(m);},message)));});
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(async userId=>{
   const {installPlaytestFixture,actorData,collection}=await import('/qa/lib/playtest-foundry-fixture.mjs');window.fx=installPlaytestFixture();game.user=game.users.get(userId);CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER=2;
   const {RealmGuardActor}=await import('/module/documents.mjs');const pc=new RealmGuardActor(actorData('hero'));const data=actorData('enemy');data.name='Röde Matthis, Rövare (Edrik Fiende)';data.type='npc';data.ownership={gm:3};const npc=new RealmGuardActor(data);game.actors.push(pc,npc);game.user.character=pc;
   window.received=[];window.socketHandlers=[];game.socket.on=(_channel,fn)=>socketHandlers.push(fn);game.socket.emit=(_channel,m)=>void window.sendSocket(m);
   const set=game.settings.set;game.settings.set=async(ns,key,value)=>{await set(ns,key,value);await window.sendSetting(key,value);Hooks.callAll('updateSetting',{key:`${ns}.${key}`});return value;};
   game.folders=collection();let sequence=0;
   globalThis.Folder={async create(data){const doc={...structuredClone(data),id:`folder${++sequence}`};game.folders.push(doc);return doc;}};
   globalThis.Item={async create(data){const doc={...structuredClone(data),id:`library${++sequence}`,async delete(){game.items.splice(game.items.indexOf(this),1);}};game.items.push(doc);return doc;}};
   foundry.applications.api.DialogV2.wait=options=>new Promise(resolve=>{const form=document.createElement('form');form.id='qa6-dialog';form.style='position:fixed;top:8px;left:8px;z-index:999;width:760px;max-height:95vh;overflow:auto;background:#e5d5b1;padding:20px';form.innerHTML=options.content;document.body.append(form);for(const button of options.buttons??[]){const el=document.createElement('button');el.type='button';el.dataset.dialogAction=button.action;el.textContent=button.label;el.onclick=async()=>{try{const value=await button.callback?.(null,{form});form.remove();resolve(value);}catch(e){window.dialogError=e.stack;}};form.append(el);}options.render?.(null,{element:form,close:async()=>{form.remove();resolve(null);}});});
   window.library=await import('/module/legacy-talent-library.mjs');library.installLegacyTalentLibrary();
   window.setup=await import('/module/legacy-conflict-setup-view.mjs');setup.installLegacyConflictSetupView();
   for(const callback of fx.hooks.get('ready')??[])await callback();
  },userId);
 }
 const [gm,player]=pages;
 // The GM-authoritative setup preview opens before Start Conflict is confirmed.
 await gm.evaluate(async()=>{window.roster=await import('/module/conflict-roster.mjs');window.startResult=roster.chooseConflictRoster({argument:{label:'Argument'}});});
 await player.locator('#rg-shared-conflict-setup').waitFor();
 assert.equal(await player.locator('#rg-shared-conflict-setup input[name="name"]').isDisabled(),true);
  const contrast=await player.locator('#rg-shared-conflict-setup input[name="name"]').evaluate(e=>({color:getComputedStyle(e).color,fill:getComputedStyle(e).webkitTextFillColor,background:getComputedStyle(e).backgroundColor,opacity:getComputedStyle(e).opacity}));
  assert.deepEqual(contrast,{color:'rgb(255, 240, 198)',fill:'rgb(255, 240, 198)',background:'rgb(36, 35, 43)',opacity:'1'},'Disabled player fields remain readable on a dark background');
  assert.equal(await player.locator('#rg-shared-conflict-setup [data-roster-search]').first().evaluate(e=>getComputedStyle(e,'::placeholder').color),'rgb(213, 204, 178)','Player search placeholders are light');
 await gm.locator('#qa6-dialog [name="name"]').fill('Live setup from GM');
 await player.waitForFunction(()=>document.querySelector('#rg-shared-conflict-setup [name="name"]')?.value==='Live setup from GM');
 await gm.locator('[data-roster-side="gm"] [data-roster-search]').fill('Matthis');await gm.locator('[data-roster-side="gm"] [data-add="enemy"]').click();
 await player.waitForFunction(()=>document.querySelector('#rg-shared-conflict-setup [data-roster-side="gm"] [data-roster-chips]')?.textContent.includes('Matthis'));
 await player.locator('#rg-shared-conflict-setup').screenshot({path:'output/playtest-followup/qa6-start-preview.png'});
 await gm.locator('[data-dialog-action="cancel"]').click();await gm.evaluate(()=>startResult);await player.waitForFunction(()=>!document.querySelector('#rg-shared-conflict-setup'));
 // Player-created Custom Talent is stored on the character and in the shared
 // world Item folder even when that player has no Item-create permission.
 await player.evaluate(()=>{window.renders=0;window.customResult=library.createCustomTalent({actor:game.actors.get('hero'),isEditable:true,render:async()=>renders++});});
 await player.locator('#qa6-dialog [name="name"]').fill('Fire’s custom Talent');await player.locator('[name="level"]').fill('4');await player.locator('[name="description"]').fill('A custom table effect with a clear condition.');await player.locator('[data-dialog-action="create"]').click();
 await player.evaluate(()=>customResult);
 assert.equal(await player.evaluate(()=>renders),1);
 const created=await gm.evaluate(()=>{const item=game.items.find(i=>i.name==='Fire’s custom Talent');return {name:item?.name,level:item?.system.minLevel,folder:game.folders.get(item?.folder)?.name,visibility:item?.ownership.default,owner:item?.ownership.player,embedded:game.actors.get('hero').items.some(i=>i.name===item?.name)};});
 assert.deepEqual(created,{name:'Fire’s custom Talent',level:4,folder:'Level 4',visibility:2,owner:3,embedded:true});
 await gm.evaluate(()=>{window.npcResult=library.createCustomTalent({actor:game.actors.get('enemy'),isEditable:true,render:async()=>{}});});
 await gm.locator('[name="name"]').fill('NPC Custom Talent');await gm.locator('[name="level"]').fill('5');await gm.locator('[name="description"]').fill('NPC-specific effect.');await gm.locator('[data-dialog-action="create"]').click();await gm.evaluate(()=>npcResult);
 assert.equal(await gm.evaluate(()=>game.actors.get('enemy').items.some(i=>i.name==='NPC Custom Talent')),true);
 assert.equal(await gm.evaluate(()=>game.folders.length),11,'Repeated creation reuses all ten level folders');
 await player.evaluate(()=>game.socket.emit('system.realm-guard',{type:'legacy-custom-talent',requestId:'unauthorized',actorId:'enemy',senderId:game.user.id,data:{name:'Forbidden',level:2,description:'Must not be created'}}));
 await player.waitForFunction(()=>received.some(m=>m.requestId==='unauthorized'&&m.error));assert.equal(await gm.evaluate(()=>game.items.some(i=>i.name==='Forbidden')),false);
 await gm.evaluate(()=>{let update;const doc={updateSource:data=>{update=data;}};for(const callback of fx.hooks.get('preCreateItem')??[])callback(doc,{name:'Public Item'});if(update?.ownership.default!==2)throw Error('New world Items should be player-readable');update=null;for(const callback of fx.hooks.get('preCreateItem')??[])callback(doc,{ownership:{default:0}});if(update)throw Error('Explicit GM-hidden Item changed');});
 // Late chat growth and new messages keep the entire latest normal-sized card
 // in the viewport; an oversized card remains scrollable from its heading.
 await player.evaluate(async()=>{const log=document.createElement('div');log.id='chat-log';log.style='position:fixed;left:20px;top:20px;width:340px;height:320px;overflow-y:auto;background:#222';document.body.append(log);for(let i=0;i<8;i++){const el=document.createElement('article');el.dataset.messageId=`message${i}`;el.style='height:80px;box-sizing:border-box;border:1px solid #aaa';el.textContent=`Message ${i}`;log.append(el);}window.follow=await import('/module/legacy-chat-follow.mjs');follow.bindLegacyChatFollow();});
 const inView=()=>{const log=document.getElementById('chat-log'),a=log.getBoundingClientRect(),b=log.lastElementChild.getBoundingClientRect();return b.top>=a.top-1&&b.bottom<=a.bottom+1;};
 await player.waitForFunction(inView);
 await player.evaluate(()=>{const latest=document.querySelector('#chat-log').lastElementChild;latest.style.height='250px';const questionButton=document.createElement('button');questionButton.dataset.messageId=latest.dataset.messageId;questionButton.textContent='Roll decision';latest.append(questionButton);});await player.waitForFunction(inView);
 await player.evaluate(()=>{const log=document.getElementById('chat-log');log.scrollTop=0;const el=log.lastElementChild.cloneNode(true);el.dataset.messageId='latest';el.style.height='180px';el.textContent='Latest message · footer visible';log.append(el);});await player.waitForFunction(inView);
 await player.evaluate(()=>document.querySelector('#chat-log').lastElementChild.style.height='450px');await player.waitForFunction(()=>Math.abs(document.getElementById('chat-log').lastElementChild.getBoundingClientRect().top-document.getElementById('chat-log').getBoundingClientRect().top)<15);
 await player.locator('#chat-log').screenshot({path:'output/playtest-followup/qa6-chat-follow.png'});
 // Token name is a sibling above the menu, never the first menu action.
 await gm.evaluate(async()=>{window.menu=await import('/module/legacy-scene-menu.mjs');const actor=game.actors.get('enemy');window.canvas={ready:true,scene:{id:'scene'},tokens:{hover:{actor}},hud:{token:{close(){}}},canvasCoordinatesFromClient:p=>p};canvas.activeLayer=canvas.tokens;menu.showLegacySceneMenu({clientX:1200,clientY:850},{});});
 assert.match(await gm.locator('.rg-scene-token-name').textContent(),/Röde Matthis/);assert.equal(await gm.locator('[role="menu"] .rg-scene-token-name').count(),0);assert.equal(await gm.locator('[role="menuitem"]').first().textContent(),'Open character sheet');
 assert.ok(await gm.locator('.rg-scene-quick-surface').evaluate(e=>e.getBoundingClientRect().right<=innerWidth));await gm.locator('.rg-scene-quick-surface').screenshot({path:'output/playtest-followup/qa6-token-menu.png'});
 assert.deepEqual(errors,[]);assert.equal(await gm.evaluate(()=>window.dialogError),undefined);
 console.log('PASS QA6: shared initial setup and live values; cancellation; player/GM Custom Talents; level folders; ownership and rejected unauthorized creation; late chat growth/new messages/tall cards; separate token-name header');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
