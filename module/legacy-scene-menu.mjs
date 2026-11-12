import { createMapPoint } from './legacy-map-points.mjs';
import { openBreak } from './legacy-break.mjs';
import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { openConflictWindow } from './conflicts.mjs';
import { openEndSession } from './end-session.mjs';
import { openConditionMenu } from './conditions.mjs';

const permitted = () => legacyMixedPolishEnabled() && Boolean(game.user?.isGM);
const esc = value => foundry.utils.escapeHTML(String(value ?? ''));
let activeMenu = null, cleanup = null;
export function closeLegacySceneMenu() { activeMenu?.remove(); activeMenu=null; cleanup?.(); cleanup=null; }

async function placeExistingNpc(position) {
  if (!permitted()) return;
  const scene = canvas.scene;
  const actors = game.actors.filter(actor => actor.type === 'npc');
  const id = await foundry.applications.api.DialogV2.wait({
    window: { title:'Place existing NPC', resizable:true }, modal:false, rejectClose:false,
    content:`<label>Search NPCs<input type="search" data-rg-npc-search placeholder="Search by name…"></label><label>NPC<select name="actorId"><option value="">Choose NPC…</option>${actors.map(actor => `<option value="${esc(actor.id)}">${esc(actor.name)}</option>`).join('')}</select></label><p>Places a token on this scene. Creates no new Actor.</p>`,
    render:(_event,dialog) => { const root=dialog.element, select=root?.querySelector('[name="actorId"]'); const rows=[...(select?.options ?? [])].map(option=>({value:option.value,text:option.textContent})); root?.querySelector('[data-rg-npc-search]')?.addEventListener('input',event=>{ const selected=select.value; select.innerHTML=rows.filter(row=>!row.value||row.value===selected||row.text.toLowerCase().includes(event.target.value.toLowerCase())).map(row=>`<option value="${esc(row.value)}">${esc(row.text)}</option>`).join(''); select.value=selected; }); },
    buttons:[{action:'place',label:'Place token',callback:(_event,b)=>b.form.elements.actorId.value},{action:'cancel',label:'Cancel',callback:()=>null}]
  });
  if (!id || !permitted() || canvas.scene?.id !== scene?.id) return;
  const actor=game.actors.get(id); if (!actor || actor.type!=='npc') return;
  const token=await actor.getTokenDocument({x:position.x,y:position.y});
  await scene.createEmbeddedDocuments('Token',[token.toObject()]);
}

export function sceneMenuEntries({ token=null, position, SheetClass }) {
  if (!permitted()) return [];
  const actor=token?.actor;
  return [
    ...(actor ? [
      {label:'Open character sheet',run:()=>actor.sheet.render(true)},
      {label:'Conditions',run:()=>openConditionMenu(actor)},
      {label:'Custom Roll',run:()=>SheetClass._customRoll.call({actor})},
      {label:'Select as opponent',run:()=>token.setTarget(true,{releaseOthers:true})},
      {label:'Foundry token controls',run:()=>canvas.hud.token.bind(token)}
    ] : [{label:'Place existing NPC…',run:()=>placeExistingNpc(position)}]),
    {label:'Create item / place on map…',run:()=>createMapPoint(position)},
    {label:'Session break…',run:()=>openBreak()},
    {label:'Open / start Conflict…',run:()=>openConflictWindow()},
    {label:'End Session…',run:()=>openEndSession()},
    {label:'Ping this location',run:()=>canvas.ping(position)}
  ];
}

export function showLegacySceneMenu(event, SheetClass) {
  if (!permitted() || !canvas.ready || canvas.activeLayer !== canvas.tokens) return false;
  const position=canvas.canvasCoordinatesFromClient({x:event.clientX,y:event.clientY});
  const token=canvas.tokens.hover ?? null;
  closeLegacySceneMenu();
  canvas.hud?.token?.close?.();
  const menu=document.createElement('div'); menu.className='rg-scene-quick-menu'; menu.setAttribute('role','menu'); menu.setAttribute('aria-label','Realm Guard GM tools');
  const surface=document.createElement('div');surface.className='rg-scene-quick-surface';
  if(token?.actor){const name=document.createElement('div');name.className='rg-scene-token-name';name.textContent=token.actor.name;surface.append(name);}
  surface.append(menu);
  const entries=sceneMenuEntries({token,position,SheetClass});
  entries.forEach(entry=>{const item=document.createElement('button'); item.type='button'; item.setAttribute('role','menuitem'); item.textContent=entry.label; item.addEventListener('click',async()=>{closeLegacySceneMenu(); if (!permitted()) return; try { await entry.run(); } catch(error){console.error('Realm Guard | GM scene menu',error);ui.notifications.error(error.message);} }); menu.append(item);});
  document.body.append(surface); activeMenu=surface;
  surface.style.left=`${Math.max(4,Math.min(event.clientX,innerWidth-surface.offsetWidth-6))}px`;
  surface.style.top=`${Math.max(4,Math.min(event.clientY,innerHeight-surface.offsetHeight-6))}px`;
  const pointer=event=>{if(!surface.contains(event.target))closeLegacySceneMenu();};
  const key=event=>{
    if(event.key==='Escape'){event.preventDefault();closeLegacySceneMenu();}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)) { event.preventDefault(); const buttons=[...menu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus(); }
  };
  document.addEventListener('pointerdown',pointer,true); document.addEventListener('keydown',key,true);
  cleanup=()=>{document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('keydown',key,true);};
  menu.querySelector('button')?.focus(); return true;
}

export function installLegacySceneMenu(SheetClass) {
  let bound=null;
  Hooks.on('canvasReady',()=>{
    const view=canvas.app?.canvas ?? canvas.app?.view; if (!view || view===bound) return; bound=view;
    let origin=null,dragged=false;
    view.addEventListener('pointerdown',event=>{if(event.button===2){origin={x:event.clientX,y:event.clientY};dragged=false;}});
    view.addEventListener('pointermove',event=>{if(origin && (event.buttons&2) && Math.hypot(event.clientX-origin.x,event.clientY-origin.y)>5)dragged=true;});
    view.addEventListener('contextmenu',event=>{if(dragged||event.shiftKey||!permitted())return; if(showLegacySceneMenu(event,SheetClass)){event.preventDefault();event.stopImmediatePropagation();}},true);
  });
  Hooks.on('canvasTearDown',closeLegacySceneMenu);
}
