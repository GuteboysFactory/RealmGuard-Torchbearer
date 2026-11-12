import { installLegacyItemDrops, resolveDropKind } from './legacy-item-drop.mjs';
import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { equipmentAncestryForActor, normalizeEquipmentAncestry } from './equipment-silhouette.mjs';
import { buildInventoryView, placeGearInZone, placeGearInContainer, unassignGear, inventoryData } from './inventory.mjs';
import { abilityLearning, advancementRequirements, autoAdvanceAbility } from './advancement.mjs';

const NS = 'realm-guard';
const esc = value => foundry.utils.escapeHTML(String(value ?? ''));
const canEdit = sheet => Boolean(sheet.isEditable && sheet.actor?.isOwner);
const integer = value => Number.isInteger(Number(value)) && Number(value) >= 0;
const figures = 'systems/realm-guard/assets/ui/silhouettes/legacy';
const progressEdits = new Set();

export function workspaceFigure(actor) {
  const raw = equipmentAncestryForActor(actor);
  const folded = String(raw).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const ancestry = !folded ? 'human' : ({manniska:'human',alv:'elf',dvarg:'dwarf'}[folded] ?? normalizeEquipmentAncestry(raw));
  const key = ancestry === 'dunadan' ? 'human' : ancestry === 'halfling' ? 'hobbit' : ancestry;
  const sex = actor.getFlag?.(NS, 'inventorySilhouetteSex') === 'female' ? 'female' : 'male';
  const known = ['human', 'elf', 'dwarf', 'hobbit'].includes(key);
  return { key, sex, src: known ? `${figures}/${key}-${sex}.png` : 'systems/realm-guard/assets/ui/silhouettes/neutral.svg', label: known ? `${key} · ${sex}` : 'Unknown ancestry · neutral figure' };
}

export function beginnerProgress(actor, role) {
  const needed = Math.max(1, Number(actor.system?.attributes?.nature?.maximum ?? actor.system?.attributes?.nature?.value ?? 1));
  const ability = String(role.system?.beginnerAbility || '').toLowerCase();
  const inferred = actor._tiebreakOptions?.(role.name, 'role') ?? [];
  const base = ['will','health'].includes(ability) ? ability : inferred.length === 1 ? inferred[0] : '';
  return { needed, attempts: Number(role.system?.beginnerAttempts ?? 0), base, label: base ? base[0].toUpperCase() + base.slice(1) : 'Choose at roll' };
}

function button(label, callback, className = '') {
  const node = document.createElement('button');
  node.type = 'button'; node.className = className; node.textContent = label;
  node.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); Promise.resolve(callback(event, node)).catch(error => { console.error('Realm Guard | Character workspace', error); ui.notifications.error(error.message); }); });
  return node;
}

// Manual corrections are explicit and atomic: never advance after only half a correction.
export async function saveProgress(sheet, { roleId = null, abilityKey = null }, values, expected) {
  if (!legacyMixedPolishEnabled() || !canEdit(sheet)) return false;
  const role = roleId ? sheet.actor.items.get(roleId) : null;
  if (roleId && !role || !roleId && !['nature','will','health','resources','circles'].includes(abilityKey)) return false;
  const lock = `${sheet.actor.id}:${roleId ?? abilityKey}`;
  if (progressEdits.has(lock)) return false;
  progressEdits.add(lock);
  try {
  const state = role ? Number(role.system.rating) > 0 ? { ...role.system.learning, ...advancementRequirements(role.system.rating), rating: Number(role.system.rating) } : { ...beginnerProgress(sheet.actor, role), rating: 0 } : abilityLearning(sheet.actor, abilityKey);
  if (JSON.stringify(state) !== JSON.stringify(expected)) { ui.notifications.warn('Progress changed while this editor was open. Open it again.'); return false; }
  if (role && state.rating <= 0) {
    if (!integer(values.attempts) || Number(values.attempts) > state.needed) return false;
    await role.update({ 'system.beginnerAttempts': Number(values.attempts), ...(Number(values.attempts) >= state.needed ? { 'flags.realm-guard.autoLearnRequestedBy': game.user.id } : {}) });
    await sheet.constructor._autoLearnSkill.call(sheet, role);
  } else {
    if (!integer(values.passed) || !integer(values.failed) || Number(values.passed) > state.passNeeded || Number(values.failed) > state.failNeeded) return false;
    if (role) {
      await role.update({ 'system.learning.passed': Number(values.passed), 'system.learning.failed': Number(values.failed) });
      await sheet.constructor._autoAdvanceRole.call(sheet, role);
    } else {
      const root = foundry.utils.deepClone(sheet.actor.getFlag(NS, 'abilityLearning') ?? {});
      root[abilityKey] = { passed: Number(values.passed), failed: Number(values.failed) };
      await sheet.actor.setFlag(NS, 'abilityLearning', root);
      await autoAdvanceAbility(sheet.actor, abilityKey);
    }
  }
  await sheet.render({ force: true }); return true;
  } finally { progressEdits.delete(lock); }
}

async function editProgress(sheet, identity) {
  if (!canEdit(sheet)) return;
  const role = identity.roleId ? sheet.actor.items.get(identity.roleId) : null;
  const learning = role ? Number(role.system.rating) > 0 ? { ...role.system.learning, ...advancementRequirements(role.system.rating), rating: Number(role.system.rating) } : { ...beginnerProgress(sheet.actor, role), rating: 0 } : abilityLearning(sheet.actor, identity.abilityKey);
  const untrained = role && learning.rating <= 0;
  const field = (key, label, max) => `<label>${label}<input type="number" name="${key}" min="0" max="${max}" step="1" value="${Number(learning[key] ?? 0)}" required></label>`;
  const values = await foundry.applications.api.DialogV2.wait({
    window: { title: `Progress · ${role?.name ?? learning.label}`, resizable: false }, modal: false, rejectClose: false,
    content: `<div class="rg-progress-editor">${untrained ? `<p>Beginner’s Luck uses ${esc(learning.label)}. Learning requires ${learning.needed} attempts (maximum Nature); success or failure both count.</p>${field('attempts','Learning attempts',learning.needed)}` : field('passed','Pass',learning.passNeeded) + field('failed','Fail',learning.failNeeded)}</div>`,
    buttons: [{ action: 'save', label: 'Save', default: true, callback: (_event, b) => b.form.checkValidity() ? Object.fromEntries(['attempts','passed','failed'].map(key => [key,b.form.elements[key]?.value])) : null }, { action: 'cancel', label: 'Cancel', callback: () => null }]
  });
  if (values) await saveProgress(sheet, identity, values, learning);
}

function progressButton(sheet, node, identity, label = null) {
  if (!node || node.dataset.rgCompactProgress) return;
  node.dataset.rgCompactProgress = 'true';
  const edit = button('', () => editProgress(sheet, identity), 'rg-compact-progress');
  edit.disabled = !canEdit(sheet); edit.title = 'Edit progress';
  if (label) edit.textContent = label;
  else for (const part of node.querySelectorAll('.pass, .fail, .rg-learn-track')) { const row = document.createElement('span'); row.textContent = part.textContent.trim().replace(/\s+/g,' '); edit.append(row); }
  node.replaceChildren(edit);
}

function compactSkills(sheet, root) {
  for (const card of root.querySelectorAll('.rg-trained-role, .rg-untrained-skill')) {
    if (card.dataset.rgCompactSkill) continue;
    card.dataset.rgCompactSkill = 'true';
    const role = sheet.actor.items.get(card.dataset.itemId); if (!role) continue;
    const untrained = Number(role.system.rating ?? 0) <= 0;
    card.querySelectorAll('.rg-role-versus, [data-rg-untrained-versus], [data-action="quickRollRole"], [data-action="quickRollUntrained"]').forEach(node => node.remove());
    const actions = card.querySelector(untrained ? '.rg-untrained-actions' : '.rg-role-actions');
    const roll = card.querySelector(`[data-action="${untrained ? 'rollUntrained' : 'rollRole'}"]`);
    if (roll && actions) { roll.textContent = 'Roll'; roll.title = `Roll ${role.name}`; roll.classList.add('rg-compact-roll'); const remove = actions.querySelector('[data-action="deleteItem"]'); actions.insertBefore(roll,remove); }
    card.querySelector('.rg-skill-roll-actions')?.remove();
    if (untrained) {
      const state = beginnerProgress(sheet.actor, role);
      const learning = card.querySelector('.rg-untrained-meta');
      progressButton(sheet, learning, { roleId: role.id }, `Learning ${state.attempts}/${state.needed}`);
      if (learning) { learning.title = `Base: ${state.label}. Learning requires maximum Nature attempts.`; actions?.before(learning); }
    } else progressButton(sheet, card.querySelector('.rg-learning'), { roleId: role.id });
    if (!untrained) {
      const learning = card.querySelector('.rg-learning'), rating = card.querySelector('.role-rating');
      if (learning && rating) rating.before(learning);
    }
  }
  for (const stat of root.querySelectorAll('[data-ability-learning]')) {
    const learning = stat.querySelector('.rg-ability-learning');
    progressButton(sheet, learning, { abilityKey: stat.dataset.abilityLearning });
    if (learning) { const tax=stat.querySelector('.rg-nature-manage-btn'); if (tax) tax.before(learning); else stat.append(learning); }
  }
}

function compactHeader(sheet, root, section) {
  if (section.querySelector('.rg-header-toggle')) return;
  const upper = document.createElement('div'); upper.className = 'rg-workspace-upper';
  const header = section.querySelector(':scope > .rg-header'); if (!header) return;
  header.before(upper);
  for (const selector of ['.rg-header','.rg-turn-strip','.rg-statbar','.rg-global-tools']) { const node = section.querySelector(`:scope > ${selector}`); if (node) upper.append(node); }
  const tools = upper.querySelector('.rg-global-tools'), turn = upper.querySelector('.rg-turn-strip');
  if (tools && turn) { turn.append(...tools.children); tools.remove(); }
  const toggle = button('', () => { sheet._rgHeaderCollapsed = !sheet._rgHeaderCollapsed; refresh(); }, 'rg-header-toggle');
  const refresh = () => {
    upper.hidden = Boolean(sheet._rgHeaderCollapsed); toggle.textContent = sheet._rgHeaderCollapsed ? '⌄' : '⌃';
    toggle.title = sheet._rgHeaderCollapsed ? 'Expand character header' : 'Collapse character header'; toggle.setAttribute('aria-expanded',String(!sheet._rgHeaderCollapsed));
    const stat=upper.querySelector('.rg-statbar');
    toggle.style.top = sheet._rgHeaderCollapsed ? '0px' : `${Math.max(0,(stat?.offsetTop ?? upper.offsetHeight)+(stat?.offsetHeight ?? 0)-12)}px`;
  };
  upper.after(toggle); refresh();
  sheet._rgHeaderSizeObserver?.disconnect();
  if (globalThis.ResizeObserver) { sheet._rgHeaderSizeObserver=new ResizeObserver(refresh); sheet._rgHeaderSizeObserver.observe(upper); }
  // Per-tab scroll keys also work with the existing scroll persistence wrapper.
  for (const page of section.querySelectorAll('[data-rg-page]')) { page.dataset.rgScrollKey = `workspace-${page.dataset.rgPage}`; }
}

// Positions are percentages of each figure's own drawing area, not screen pixels.
const BASE_POINTS = { head:[50,8], neck:[50,19], cloak:[65,24], torso:[50,29], belt:[50,44], pocket:[64,57], 'left-hand':[20,58], 'right-hand':[80,58], feet:[50,91] };
const FIGURE_POINTS = {
  'human-male': { head:[50,7.5],neck:[50,19],torso:[50,27],belt:[50,44],cloak:[65,22.5] },
  'human-female': { head:[50,8.5],neck:[50,19],torso:[50,28.5],belt:[50,44.5],cloak:[64,22.5] },
  'elf-male': { head:[50,7.5],neck:[50,18.8],torso:[50,26.5],belt:[50,40.5],cloak:[64,20.5] },
  'elf-female': { head:[50,8],neck:[50,18],torso:[50,27.5],belt:[50,41],cloak:[62,21] },
  'dwarf-male': { head:[50,8.5],neck:[50,26],torso:[50,34],belt:[50,49],cloak:[68.5,26] },
  'dwarf-female': { head:[50,9],neck:[50,25],torso:[50,34],belt:[50,49],cloak:[68,26.5] },
  'hobbit-male': { head:[50,8],neck:[50,21],torso:[50,30],belt:[50,44.5],cloak:[67,25] },
  'hobbit-female': { head:[50,8],neck:[50,23],torso:[50,33],belt:[50,47],cloak:[68,27] }
};
export function equipmentPoints(figure) { return { ...BASE_POINTS, ...(FIGURE_POINTS[`${figure.key}-${figure.sex}`] ?? {}) }; }

async function chooseZoneGear(sheet, zoneId) {
  if (!canEdit(sheet)) return;
  const zone = buildInventoryView(sheet.actor).zones.find(row => row.id === zoneId);
  if (!zone) return;
  const gear = sheet.actor.items.filter(item => item.type === 'gear');
  const content = `<div class="rg-slot-editor"><p>${esc(zone.blocked ? zone.blockedReason : `${zone.used}/${zone.capacity} slots used`)}</p><div class="rg-slot-current">${zone.items.map(item => `<div>${esc(item.name)} <button type="button" data-rg-remove-gear="${esc(item.id)}">Take off</button></div>`).join('') || '<p>Empty</p>'}</div><label>Search inventory<input type="search" data-rg-slot-search placeholder="Search by name…"></label><div class="rg-slot-candidates">${gear.map(item => `<button type="button" data-rg-equip-gear="${esc(item.id)}">${esc(item.name)}</button>`).join('') || '<p>No gear yet. Add gear from the inventory list.</p>'}</div><p data-rg-placement-status role="status"></p></div>`;
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `Equipment · ${zone.label}`, resizable: true }, content, modal: false, rejectClose: false,
    render: (_event, dialog) => {
      const host = dialog.element; if (!host) return;
      host.querySelector('[data-rg-slot-search]')?.addEventListener('input', event => { const query = event.target.value.toLowerCase(); for (const node of host.querySelectorAll('[data-rg-equip-gear]')) node.hidden = !node.textContent.toLowerCase().includes(query); });
      let busy = false;
      for (const node of host.querySelectorAll('[data-rg-equip-gear], [data-rg-remove-gear]')) node.addEventListener('click', async () => {
        if (busy || !canEdit(sheet)) return; busy = true;
        try {
          const outcome = node.dataset.rgRemoveGear ? await unassignGear(sheet.actor,node.dataset.rgRemoveGear) : await placeGearInZone(sheet.actor,node.dataset.rgEquipGear,zoneId);
          if (!outcome?.ok) { host.querySelector('[data-rg-placement-status]').textContent = outcome?.reason ?? 'Placement failed'; return; }
          await sheet.render({ force: true }); await dialog.close();
        } finally { busy = false; }
      });
    }, buttons: [{ action: 'close', label: 'Close', callback: () => null }]
  });
  return result;
}

function equipment(sheet, root) {
  const stage = root.querySelector('.rg-equipment-stage'); if (!stage || stage.dataset.rgDotEquipment) return;
  stage.dataset.rgDotEquipment = 'true';
  const figure = workspaceFigure(sheet.actor), view = buildInventoryView(sheet.actor), points = equipmentPoints(figure);
  stage.className = 'rg-equipment-stage rg-equipment-dots'; stage.dataset.rgFigureAncestry = figure.key;
  stage.style.aspectRatio = figure.key === 'dwarf' ? '1199 / 1312' : '2 / 3';
  stage.replaceChildren();
  const image = document.createElement('img'); image.src = figure.src; image.alt = figure.label; image.className = 'rg-inventory-figure'; stage.append(image);
  for (const zone of view.zones) {
    const point = button('', () => chooseZoneGear(sheet,zone.id), 'rg-equipment-point');
    point.dataset.rgInventoryZone = zone.id; point.style.left = `${points[zone.id][0]}%`; point.style.top = `${points[zone.id][1]}%`;
    const label = `${zone.label}: ${zone.blocked ? zone.blockedByName + ' · both hands' : zone.items.map(item => item.name).join(', ') || 'Empty'}`;
    point.title = label; point.setAttribute('aria-label',label); point.setAttribute('aria-haspopup','dialog'); point.classList.toggle('is-equipped',zone.items.length > 0 || zone.blocked); point.disabled = !canEdit(sheet);
    point.innerHTML = `<span aria-hidden="true">${zone.blocked ? '⌁' : zone.items.length ? '●' : '+'}</span><span class="rg-equipment-tip">${esc(label)}</span>`;
    point.addEventListener('dragover',event => { if (canEdit(sheet)) event.preventDefault(); });
    point.addEventListener('drop',async event => { if (!canEdit(sheet)) return; event.preventDefault(); event.stopPropagation(); const id = event.dataTransfer?.getData('application/x-realm-guard-gear'); if (!id) return; const outcome = await placeGearInZone(sheet.actor,id,zone.id); if (!outcome.ok) ui.notifications.warn(outcome.reason); else await sheet.render({force:true}); });
    stage.append(point);
  }
  root.querySelector('.rg-equipment-figure-controls')?.remove();
  // Existing selector has different markup in older sheets; hide the whole old control.
  root.querySelectorAll('[data-rg-equipment-figure-mode]').forEach(node => node.closest('.rg-equipment-figure-control')?.remove());
  const panel = stage.closest('.rg-equipment-panel');
  panel?.querySelector('.rg-slot-guide')?.remove();
  const choice = document.createElement('label'); choice.className = 'rg-silhouette-sex'; choice.innerHTML = `Silhouette <select aria-label="Silhouette"><option value="male">Male</option><option value="female">Female</option></select>`;
  choice.querySelector('select').value = figure.sex; choice.querySelector('select').disabled = !canEdit(sheet);
  choice.querySelector('select').addEventListener('change',async event => { if (!canEdit(sheet)) return; await sheet.actor.setFlag(NS,'inventorySilhouetteSex',event.target.value === 'female' ? 'female' : 'male'); await sheet.render({force:true}); });
  stage.before(choice);
  const layout = root.querySelector('.rg-gear-layout');
  const loose = layout?.querySelector('.rg-unassigned-panel');
  if (loose) {
    loose.querySelector('h2').textContent = 'Inventory';
    loose.querySelector('.rg-unassigned-help')?.remove();
    const list = loose.querySelector('.rg-inventory-loose-grid'); list.replaceChildren();
    let lastCategory=null;const categoryOrder={weapon:0,armor:1,container:2,gear:3};
    const categoryFor=item=>resolveDropKind(item,{type:'gear'}).category;
    for (const item of sheet.actor.items.filter(item => item.type === 'gear').sort((a,b)=>(categoryOrder[categoryFor(a)]??3)-(categoryOrder[categoryFor(b)]??3)||a.name.localeCompare(b.name))) {
      const category=categoryFor(item);if(category!==lastCategory){const h=document.createElement('h3');h.className='rg-gear-category-heading';h.dataset.rgDropType='gear';h.dataset.rgDropCategory=category;h.textContent=({weapon:'Weapons',armor:'Armor',container:'Containers'})[category]??'Gear';list.append(h);lastCategory=category;}
      const data = inventoryData(item), row = document.createElement('div');
      row.className='rg-inventory-item rg-workspace-gear-row'; row.dataset.itemId=item.id; row.dataset.rgGearId=item.id;row.dataset.rgDropType='gear';row.dataset.rgDropCategory=category;
      const location = data.containerId ? sheet.actor.items.get(data.containerId)?.name ?? 'Missing container' : view.zones.find(zone => zone.id === data.location)?.label ?? 'Unassigned';
      row.innerHTML=`<span><b>${esc(item.name)}</b><small>${esc(location)} · ×${Number(item.system.quantity ?? 1)}</small></span>`;
      const move=button('Move…',()=>moveGear(sheet,item.id),'rg-gear-move');move.disabled=!canEdit(sheet);row.append(move);
      const edit=button('✎',()=>item.sheet?.render(true));edit.disabled=!canEdit(sheet);edit.title=`Edit ${item.name}`;row.append(edit);
      row.draggable=canEdit(sheet);row.addEventListener('dragstart',event=>{if(!canEdit(sheet)){event.preventDefault();return;}event.dataTransfer?.setData('application/x-realm-guard-gear',item.id);event.dataTransfer?.setData('text/plain',`rg-gear:${item.id}`);});
      list.append(row);
    }
    layout.querySelector('.rg-gear-left-rail')?.append(loose);
  }
  const powers=root.querySelector('.rg-token-power-inventory');
  if (powers && !powers.closest('.rg-workspace-relics')) { const details=document.createElement('details');details.className='rg-workspace-relics';const summary=document.createElement('summary');summary.textContent='Tokens of Power · details';details.append(summary,powers);layout?.after(details); }
  if (layout && !layout.querySelector('.rg-inventory-search')) {
    const search = document.createElement('input'); search.type='search'; search.className='rg-inventory-search'; search.placeholder='Search inventory…'; search.setAttribute('aria-label','Search inventory'); search.value=sheet._rgInventoryQuery ?? '';
    const filter = () => { sheet._rgInventoryQuery=search.value; for (const node of layout.querySelectorAll('[data-rg-gear-id]')) node.hidden = !node.textContent.toLowerCase().includes(search.value.toLowerCase()); };
    search.addEventListener('input',filter); layout.prepend(search); filter();
  }
}

async function moveGear(sheet,itemId) {
  if (!canEdit(sheet)) return;
  const view=buildInventoryView(sheet.actor);
  const destination=await foundry.applications.api.DialogV2.wait({window:{title:'Move inventory item'},modal:false,rejectClose:false,
    content:`<label>Destination<select name="destination"><option value="unassigned">Unassigned</option>${view.zones.map(zone=>`<option value="zone:${zone.id}">${esc(zone.label)}</option>`).join('')}${view.containers.filter(row=>row.id!==itemId).map(row=>`<option value="container:${esc(row.id)}">Inside ${esc(row.name)}${row.active?'':' (inactive)'}</option>`).join('')}</select></label>`,
    buttons:[{action:'move',label:'Move',callback:(_event,b)=>b.form.elements.destination.value},{action:'cancel',label:'Cancel',callback:()=>null}]
  });
  if (!destination || !canEdit(sheet)) return;
  const outcome=destination==='unassigned'?await unassignGear(sheet.actor,itemId):destination.startsWith('zone:')?await placeGearInZone(sheet.actor,itemId,destination.slice(5)):await placeGearInContainer(sheet.actor,itemId,destination.slice(10));
  if (!outcome.ok) ui.notifications.warn(outcome.reason);else await sheet.render({force:true});
}

export function enhanceLegacyWorkspace(sheet) {
  if (!legacyMixedPolishEnabled() || sheet.actor?.type !== 'character') { sheet.element?.classList?.remove('rg-legacy-workspace-window'); return false; }
  const root = sheet.element, section = root?.matches?.('.rg-sheet') ? root : root?.querySelector('.rg-sheet.character'); if (!section) return false;
  section.classList.add('rg-legacy-workspace'); root.classList?.add('rg-legacy-workspace-window');
  compactHeader(sheet,root,section); compactDrives(sheet,root); compactSkills(sheet,root); equipment(sheet,root); installLegacyItemDrops(sheet); return true;
}

function compactDrives(sheet,root){
  const panel=root.querySelector('.rg-drives');if(!panel||panel.dataset.compactDrives)return;
  panel.dataset.compactDrives='true';
  const fields=[['natureDescriptors','Nature'],['belief','Belief'],['goal','Goal'],['instinct','Instinct'],['creed','Creed']];
  const title=panel.querySelector('h2');title.replaceChildren();
  sheet._rgDriveKey??='natureDescriptors';
  const resize=()=>{
    const input=panel.querySelector(`[name="system.${sheet._rgDriveKey}"]`);if(!input||!input.getClientRects().length)return;
    input.style.height='0px';
    const style=getComputedStyle(input),border=parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
    input.style.height=`${Math.ceil(input.scrollHeight+border)}px`;
  };
  const show=()=>{for(const [key] of fields){const input=panel.querySelector(`[name="system.${key}"]`);input.closest('label').hidden=key!==sheet._rgDriveKey;title.querySelector(`[data-rg-drive="${key}"]`).setAttribute('aria-pressed',String(key===sheet._rgDriveKey));}resize();};
  for(const [key,label] of fields){
    if(title.childNodes.length)title.append(' · ');
    const tab=button(label,async()=>{
      const previous=sheet._rgDriveKey,input=panel.querySelector(`[name="system.${previous}"]`);
      sheet._rgDriveKey=key;show();
      if(canEdit(sheet)&&input.value!==String(sheet.actor.system[previous]??'')){
        try{await sheet.actor.update({[`system.${previous}`]:input.value});}
        catch(error){sheet._rgDriveKey=previous;show();throw error;}
      }
    },'rg-drive-tab');tab.dataset.rgDrive=key;title.append(tab);
    const input=panel.querySelector(`[name="system.${key}"]`);input.rows=1;input.readOnly=!canEdit(sheet);input.setAttribute('aria-label',label);input.addEventListener('input',resize);
  }
  const hint=document.createElement('small');hint.className='rg-drive-hint';hint.textContent=' – Click on the text to the left to display text';title.append(hint);show();
  sheet._rgDrivesObserver?.disconnect();let width=-1;
  sheet._rgDrivesObserver=new ResizeObserver(entries=>{const next=entries[0].contentRect.width;if(next!==width){width=next;resize();}});sheet._rgDrivesObserver.observe(panel);
}

export function installLegacyCharacterWorkspace(SheetClass) {
  if (SheetClass.prototype._rgLegacyWorkspaceInstalled) return;
  SheetClass.prototype._rgLegacyWorkspaceInstalled = true;
  const original = SheetClass.prototype._onRender;
  SheetClass.prototype._onRender = function (...args) { const result = original.apply(this,args); queueMicrotask(() => enhanceLegacyWorkspace(this)); return result; };
}
