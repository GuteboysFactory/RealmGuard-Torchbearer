// Real production HBS/CSS/modules in Chromium; Foundry documents and canvas use
// controlled fixtures. This is not live-world or multiplayer acceptance testing.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const hb=require.resolve(process.env.HANDLEBARS_MODULE || 'handlebars');
const hbBrowser=path.resolve(path.dirname(hb),'../dist/handlebars.js');
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await fs.readFile(path.join(root,'system.json'),'utf8'));
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><head><script src="/test-handlebars.js"></script>${manifest.styles.map(file=>`<link rel="stylesheet" href="/${file}">`).join('')}<style>body{margin:0;background:#222;color:#332719}.application{box-sizing:border-box}.window-content{height:100%;box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}[hidden]{display:none!important}</style></head><body></body></html>`);return;}
  let filename=url.pathname==='/test-handlebars.js'?hbBrowser:path.resolve(root,'.'+decodeURIComponent(url.pathname.replace(/^\/systems\/realm-guard/,'')));
  if(filename!==hbBrowser&&!filename.startsWith(root))throw Error('Outside root');
  res.setHeader('Content-Type',filename.endsWith('.mjs')||filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':filename.endsWith('.png')?'image/png':filename.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
  res.end(await fs.readFile(filename));
 }catch(error){res.statusCode=404;res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYTEST_CHROME?{executablePath:process.env.PLAYTEST_CHROME}:{})});
const errors=[];
const screenshot=process.env.WORKSPACE_SCREENSHOT || '../tb2e-verification/workspace';
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(async()=>{
  const {installPlaytestFixture,actorData}=await import('/qa/lib/playtest-foundry-fixture.mjs');window.fx=installPlaytestFixture();
  foundry.applications.sheets.ActorSheetV2.prototype._onRender=()=>{};
  const {RealmGuardActor}=await import('/module/documents.mjs');
  const {refreshRulesProfileRuntime}=await import('/module/rules-profile-service.mjs');refreshRulesProfileRuntime();
  const {RealmGuardActorSheet}=await import('/sheets/actor-sheet.mjs');window.Sheet=RealmGuardActorSheet;
  const {installUntrainedVersusUi}=await import('/module/untrained-versus-ui.mjs');installUntrainedVersusUi(Sheet);
  const {installSkillRollUx}=await import('/module/skill-roll-ux.mjs');installSkillRollUx(Sheet,RealmGuardActor);
  const {installEquipmentSilhouette}=await import('/module/equipment-silhouette.mjs');installEquipmentSilhouette(Sheet);
  const {installActorSheetScrollPersistence}=await import('/module/actor-sheet-scroll-state.mjs');installActorSheetScrollPersistence(Sheet);
  window.workspace=await import('/module/legacy-character-workspace.mjs');workspace.installLegacyCharacterWorkspace(Sheet);
  window.menu=await import('/module/legacy-scene-menu.mjs');
  const {buildInventoryView}=await import('/module/inventory.mjs');window.inventory=await import('/module/inventory.mjs');
  const {abilityLearning,advancementRequirements}=await import('/module/advancement.mjs');
  const data=actorData();data.name='Arantor';data.system.belief='A Ranger stands between danger and those who cannot face it alone.';data.system.natureDescriptors='Tradition, Family, Grief';data.system.age=47;data.system.rank='veteran';
  for(let i=0;i<32;i++)data.items.push({id:`skill${i}`,name:`Example Skill ${i}`,type:'role',system:{rating:i%2?0:3,beginnerAbility:i%2?'will':'health',beginnerAttempts:0,learning:{passed:0,failed:0}}});
  for(const [id,name,location,slots,hands] of [['helm','Iron helm','head',1,0],['boots','Travel boots','feet',1,0],['sword','Longsword','',1,1],['greatsword','Great sword','',2,2]])data.items.push({id,name,type:'gear',system:{quantity:1,inventory:{mode:location?'worn':'unassigned',location,slots,wieldHands:hands,containerId:''}}});
  window.actor=new RealmGuardActor(data);for(const item of actor.items)item.getFlag=(ns,key)=>item.flags?.[ns]?.[key];
  const enemyData=actorData('enemy');enemyData.name='Bandit';enemyData.type='npc';game.actors.push(actor,new RealmGuardActor(enemyData));
  window.sheet=new Sheet();sheet.actor=actor;sheet.isEditable=true;
  const app=document.createElement('section');app.id='workspace-app';app.className='application realm-guard';app.style.cssText='position:fixed;left:30px;top:20px;width:850px;height:820px;';app.innerHTML='<form class="window-content"></form>';document.body.append(app);sheet.element=app;
  Handlebars.registerHelper('checked',value=>value?'checked':'');Handlebars.registerHelper('selectOptions',()=>new Handlebars.SafeString(''));
  const template=Handlebars.compile(await (await fetch('/templates/actor/character.hbs')).text());
  window.renderSheet=async()=>{
   const roleViews=actor.roles.map(role=>({...role,rating:role.system.rating,beginnerAttempts:role.system.beginnerAttempts||0,beginnerNeeded:actor.system.attributes.nature.maximum,...advancementRequirements(role.system.rating),passProgress:0,failProgress:0}));
   const context={actor:{type:'character',name:actor.name},system:actor.system,trainedRoles:roleViews.filter(role=>role.rating>0),untrainedRoles:roleViews.filter(role=>!role.rating),trainedRoleCount:roleViews.filter(role=>role.rating>0).length,untrainedRoleCount:roleViews.filter(role=>!role.rating).length,portrait:{src:'systems/realm-guard/assets/ui/silhouettes/legacy/human-male.png',framing:{fit:'cover',zoom:1}},progression:{level:2},editable:true,isGM:game.user.isGM,conditions:[],wises:[],traits:[],talents:[],tokenPowers:[],inventory:buildInventoryView(actor),natureCurrent:actor.system.attributes.nature.value,natureMaximum:actor.system.attributes.nature.maximum,natureTax:0,abilityAdvancement:Object.fromEntries(['nature','will','health','resources','circles'].map(key=>[key,abilityLearning(actor,key)])),turn:{phase:'gm',label:'GM Turn'},relationshipView:{},stationOptions:{}};
   app.querySelector('form').innerHTML=template(context);sheet._onRender(context,{});await new Promise(resolve=>setTimeout(resolve,70));
  };sheet.render=renderSheet;
  // Production actions use ApplicationV2 delegation in Foundry; reproduce only
  // the dispatcher, while handlers/forms/render callbacks remain production code.
  app.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;const action=Sheet.DEFAULT_OPTIONS.actions[target.dataset.action];if(action)void action.call(sheet,event,target);});
  foundry.applications.api.DialogV2.wait=options=>new Promise(resolve=>{
   document.querySelector('#workspace-dialog')?.remove();const element=document.createElement('section');element.id='workspace-dialog';element.className='application dialog';const width=options.position?.width ?? 370;element.style.cssText=`position:fixed;left:${Math.min(890,innerWidth-width-16)}px;top:20px;width:${width}px;max-height:840px;overflow:auto;background:#eddbb6;padding:12px;z-index:5000;`;
   element.innerHTML=`<h2>${options.window.title}</h2><form>${options.content}<footer>${options.buttons.map(row=>`<button type="button" data-dialog-action="${row.action}">${row.label}</button>`).join('')}</footer></form>`;document.body.append(element);
   const dialog={element,close:async()=>{element.remove();resolve(null);}};options.render?.(null,dialog);
   for(const node of element.querySelectorAll('[data-dialog-action]'))node.addEventListener('click',async event=>{try{const result=await options.buttons.find(row=>row.action===node.dataset.dialogAction).callback(event,{form:element.querySelector('form')});element.remove();resolve(result);}catch(error){window.dialogError=error.stack;resolve(null);}});
  });
  await renderSheet();
 });
 assert.equal(await page.locator('.rg-legacy-workspace').count(),1);
 assert.equal(await page.locator('[data-rg-equipment-figure-control]').count(),0);
 assert.equal(await page.locator('.rg-silhouette-sex option').count(),2);
 assert.equal(await page.locator('[data-action="quickRollRole"], [data-action="quickRollUntrained"]').count(),0);
 assert.equal(await page.locator('.rg-role-versus').count(),0);
 assert.equal(await page.locator('.rg-turn-strip [data-action="customRoll"]').count(),1);
 assert.equal(await page.locator('.rg-equipment-point').count(),9);
 assert.match(await page.locator('.rg-inventory-figure').getAttribute('src'),/human-male/);
 assert.equal(await page.locator('.rg-header-toggle').evaluate(node=>getComputedStyle(node).position),'absolute');
 assert.equal(await page.locator('.rg-header-toggle').evaluate(node=>getComputedStyle(node).backgroundColor),'rgba(0, 0, 0, 0)');
 await page.locator('.rg-header-toggle').hover();assert.equal(await page.locator('.rg-header-toggle').evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(57, 62, 39)');await page.mouse.move(0,0);
 for(const key of ['nature','will','health','resources','circles']) {
  assert.ok(await page.locator(`[data-ability-learning="${key}"]`).evaluate(node=>node.getBoundingClientRect().height<=46),'Ability card fits one compact row');
 }
 await page.screenshot({path:screenshot+'-header.png'});
 await page.locator('.rg-header-toggle').click();assert.equal(await page.locator('.rg-workspace-upper').isVisible(),false);
 assert.ok(await page.locator('.rg-header-toggle').evaluate(node=>node.getBoundingClientRect().top>=node.closest('.rg-sheet').getBoundingClientRect().top));
 await page.locator('.rg-header-toggle').click();assert.equal(await page.locator('.rg-workspace-upper').isVisible(),true);await page.locator('.rg-header-toggle').click();
 await page.locator('[data-rg-tab="skills"]').click();
 assert.equal(await page.locator('.rg-trained-role').first().locator('.rg-role-actions .rg-compact-roll').textContent(),'Roll');
 assert.ok(await page.locator('.rg-trained-role').first().evaluate(node=>{const progress=node.querySelector('.rg-compact-progress').getBoundingClientRect(),rating=node.querySelector('.role-rating').getBoundingClientRect();return Math.abs((progress.top+progress.bottom-rating.top-rating.bottom)/2)<8 && node.getBoundingClientRect().height<65;}),'Progress is beside the Skill name and rating');
 assert.equal(await page.locator('.rg-untrained-skill .rg-compact-roll').first().evaluate(node=>getComputedStyle(node).webkitTextFillColor),'rgb(247, 231, 189)');
 assert.ok(await page.locator('.rg-untrained-skill').first().evaluate(node=>node.querySelector('.rg-untrained-main').contains(node.querySelector('.rg-untrained-meta'))),'Learning is in the untrained name row');
 await page.locator('.rg-trained-role').first().locator('.rg-compact-progress').click();
 await page.locator('#workspace-dialog [name="passed"]').fill('1');await page.locator('#workspace-dialog [data-dialog-action="save"]').click();
 await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>actor.items.get('fighter').system.learning.passed),1);
 assert.equal(await page.locator('.rg-workspace-upper').isVisible(),false,'Collapse survives render');
 await page.screenshot({path:screenshot+'-skills.png'});
 assert.equal(await page.locator('.rg-trained-role .rg-compact-progress span').first().evaluate(node=>getComputedStyle(node).webkitTextFillColor),'rgb(73, 53, 31)');
 assert.equal(await page.locator('.rg-trained-role .rg-compact-roll').first().evaluate(node=>getComputedStyle(node).webkitTextFillColor),'rgb(247, 231, 189)');
 assert.ok(await page.locator('.rg-trained-role').first().evaluate(node=>node.querySelector('.role-rating').getBoundingClientRect().right<=node.querySelector('.rg-role-actions').getBoundingClientRect().left),'Rating must not overlap action buttons');
 // Full Skill roll form: mode and target without targeting a token or changing
 // saved Skill flags. Exercise the actual actor roll to completion.
 await page.locator('[data-item-id="fighter"] .rg-compact-roll').click();
 await page.screenshot({path:screenshot+'-roll.png'});
 assert.equal(await page.locator('#workspace-dialog').evaluate(node=>Math.round(node.getBoundingClientRect().width)),640);
 assert.ok(await page.locator('.rg-compact-roll-dialog .rg-roll-explanation').count());
 assert.equal(await page.locator('.rg-roll-explanation[open]').count(),0);
 await page.locator('.rg-roll-explanation summary').first().click();assert.equal(await page.locator('.rg-roll-explanation[open]').count(),1);await page.locator('.rg-roll-explanation[open] summary').click();
 await page.locator('[name="rollMode"]').selectOption('versus');
 await page.locator('[data-rg-opponent-search]').fill('band');await page.locator('[name="opponentActorId"]').selectOption('enemy');
 assert.equal(await page.locator('.rg-obstacle-panel').isVisible(),false);
 assert.ok(await page.locator('[name="oppositionId"] option').count());
 await page.locator('[name="rollMode"]').selectOption('standard');assert.equal(await page.locator('.rg-obstacle-panel').isVisible(),true);
 await page.locator('[name="rollMode"]').selectOption('versus');
 await page.screenshot({path:screenshot+'-versus.png'});
 await page.evaluate(()=>{actor.items.splice(actor.items.findIndex(row=>row.type==='wise'),1);fx.dice.push([4,4,1],[1,1,1]);});
 await page.locator('#workspace-dialog [data-dialog-action="roll"]').click();await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>fx.messages.at(-1)?.flags?.['realm-guard']?.rollDecisionPending),false);
 assert.equal(await page.evaluate(()=>game.user.targets.size),0,'Opponent search does not mutate scene targets');
 assert.match(await page.evaluate(()=>fx.messages.at(-1).content),/Bandit/);
 await page.locator('[data-rg-tab="gear"]').click();
 await page.locator('.rg-silhouette-sex select').selectOption('female');await page.waitForTimeout(100);
 assert.match(await page.locator('.rg-inventory-figure').getAttribute('src'),/human-female/);
 await page.locator('.rg-equipment-point[data-rg-inventory-zone="head"]').click();
 assert.match(await page.locator('.rg-slot-current').textContent(),/Iron helm/);
 await page.locator('[data-rg-remove-gear="helm"]').click();await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>actor.items.get('helm').system.inventory.mode),'unassigned');
 await page.locator('.rg-equipment-point[data-rg-inventory-zone="left-hand"]').click();
 await page.locator('[data-rg-slot-search]').fill('Great');
 assert.equal(await page.locator('[data-rg-equip-gear="helm"]').isVisible(),false);
 await page.locator('[data-rg-equip-gear="greatsword"]').click();await page.waitForTimeout(100);
 assert.match(await page.locator('[data-rg-inventory-zone="right-hand"]').getAttribute('aria-label'),/both hands/);
 await page.locator('[data-rg-inventory-zone="right-hand"]').click();await page.locator('[data-rg-equip-gear="sword"]').click();
 assert.ok((await page.locator('[data-rg-placement-status]').textContent()).length,'Illegal two-handed placement explained');
 await page.locator('[data-dialog-action="close"]').click();
 await page.screenshot({path:screenshot+'-inventory.png'});
 const inventoryBounds=await page.evaluate(()=>{const a=document.querySelector('.rg-equipment-panel').getBoundingClientRect(),b=document.querySelector('.rg-unassigned-panel').getBoundingClientRect();return{a:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},b:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}};});
 assert.ok(inventoryBounds.b.left>=inventoryBounds.a.right-1,'Inventory list cannot cover the silhouette');
 await page.locator('.rg-inventory-search').fill('Great');assert.equal(await page.locator('.rg-workspace-gear-row[data-item-id="greatsword"]').isVisible(),true,'Search includes equipped gear');await page.locator('.rg-inventory-search').fill('');
 // Every race/sex loads, default and unsupported lineage remain distinguishable.
 for(const ancestry of ['Human','Elf','Dwarf','Hobbit'])for(const sex of ['male','female']) {
  await page.evaluate(async({ancestry,sex})=>{actor.system.ancestry=ancestry;await actor.setFlag('realm-guard','inventorySilhouetteSex',sex);await renderSheet();},{ancestry,sex});
  assert.equal(await page.locator('.rg-inventory-figure').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await page.locator('.rg-equipment-stage').screenshot({path:screenshot+`-${ancestry.toLowerCase()}-${sex}.png`});
 }
 // Menus stay visible while the single active page scrolls.
 await page.locator('[data-rg-tab="skills"]').click();
 await page.evaluate(()=>{document.querySelector('[data-rg-page="skills"]').scrollTop=150;});await page.waitForTimeout(50);
 await page.locator('[data-rg-tab="character"]').click();await page.locator('[data-rg-tab="skills"]').click();
 assert.ok(await page.locator('[data-rg-page="skills"]').evaluate(node=>node.scrollTop)>50);
 assert.equal(await page.locator('.rg-sheet-tabs').isVisible(),true);
 await page.locator('.rg-untrained-skills').evaluate(node=>{const page=node.closest('[data-rg-page]');page.scrollTop+=node.getBoundingClientRect().top-page.getBoundingClientRect().top;});await page.screenshot({path:screenshot+'-untrained.png'});
 // Profile gates use the same template and original decorators without new UI.
 await page.evaluate(async()=>{fx.settings.set('activeRulesProfileId','mouse-guard-2e');await renderSheet();});
 assert.equal(await page.locator('.rg-legacy-workspace').count(),0);
 assert.ok(await page.locator('[data-action="quickRollRole"]').count());
 await page.evaluate(async()=>{fx.settings.set('activeRulesProfileId','realm-guard-legacy-mixed');await renderSheet();game.user=fx.player;});
 assert.equal(await page.evaluate(()=>menu.showLegacySceneMenu({clientX:50,clientY:50},Sheet)),false);
 await page.evaluate(()=>{game.user=fx.gm;window.hudCloses=0;window.canvas={ready:true,scene:{id:'scene'},tokens:{hover:null},canvasCoordinatesFromClient:p=>p,hud:{token:{close:()=>{hudCloses++;},clear:()=>{throw Error('Deprecated HUD.clear must not be called');}}}};canvas.activeLayer=canvas.tokens;menu.showLegacySceneMenu({clientX:1250,clientY:880},Sheet);});
 assert.equal(await page.evaluate(()=>hudCloses),1);
 assert.equal(await page.locator('[role="menu"]').count(),1);await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await page.locator('[role="menu"]').count(),0);
 // Compact width still has reachable navigation and no horizontal overflow.
 await page.evaluate(()=>{document.querySelector('#workspace-app').style.width='650px';document.querySelector('#workspace-app').style.height='650px';});
 await page.locator('[data-rg-tab="gear"]').click();await page.screenshot({path:screenshot+'-compact.png'});
 assert.ok(await page.locator('.rg-sheet').evaluate(node=>node.scrollWidth<=node.clientWidth+2));
 assert.equal(await page.evaluate(()=>window.dialogError),undefined);
 assert.deepEqual(errors,[]);
 console.log('PASS legacy-character-workspace-browser · production HBS/CSS, eight figures, collapse, skills, progress, Versus roll, equipment/2H, scroll, profile and GM gates');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
