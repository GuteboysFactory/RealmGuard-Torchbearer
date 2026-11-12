import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
const esc=v=>foundry.utils.escapeHTML(String(v??''));
export function sceneRollOpponents(actor){
 return (globalThis.canvas?.tokens?.placeables??[]).filter(t=>t.actor&&t.actor.id!==actor.id&&['character','npc'].includes(t.actor.type)&&(game.user.isGM||t.visible!==false&&t.document?.hidden!==true)).map(t=>({tokenId:t.id??t.document?.id,actor:t.actor,name:t.name??t.document?.name??t.actor.name})).sort((a,b)=>a.name.localeCompare(b.name));
}
export function visibleRollOpponents(actor){return [...new Map(sceneRollOpponents(actor).map(r=>[r.actor.id,r.actor])).values()];}
export function legacyOpponentActor(options){return (globalThis.canvas?.tokens?.placeables??[]).find(t=>t.id===options.opponentTokenId)?.actor??game.actors.get(options.opponentActorId);}
export function legacyRollTargetControls(actor,versus=false,target=null){
 const row=sceneRollOpponents(actor).find(r=>r.actor.id===target?.id);
 return '<fieldset class="rg-roll-target-picker"><legend>Test type & opponent</legend><label>Test type<select name="rollMode"><option value="standard" '+(!versus?'selected':'')+'>Standard test</option><option value="versus" '+(versus?'selected':'')+'>Versus</option></select></label><div data-rg-versus-fields '+(!versus?'hidden':'')+'><label>Search opponents on this map<input type="search" data-rg-opponent-search placeholder="Search and click an opponent…" autocomplete="off" aria-label="Search opponents" value="'+esc(row?.name??'')+'"></label><input type="hidden" name="opponentActorId" value="'+esc(row?.actor.id??'')+'"><input type="hidden" name="opponentTokenId" value="'+esc(row?.tokenId??'')+'"><div data-rg-opponent-results role="listbox" aria-label="Opponents on this map"></div><label>Resolution<select name="versusResolution"><option value="manual">GM already rolled · enter Obstacle</option><option value="automatic">Roll opponent automatically</option></select></label><label data-rg-auto-opposition>Opponent rolls<select name="oppositionId"></select></label><p data-rg-opponent-status role="status"></p></div></fieldset>';
}
export function bindLegacyRollTargets(dialog,actor,role,SheetClass){
 const root=dialog.element,picker=root?.querySelector('.rg-roll-target-picker');if(!picker)return;
 const mode=picker.querySelector('[name="rollMode"]'),opponent=picker.querySelector('[name="opponentActorId"]'),token=picker.querySelector('[name="opponentTokenId"]'),opposition=picker.querySelector('[name="oppositionId"]'),search=picker.querySelector('[data-rg-opponent-search]'),results=picker.querySelector('[data-rg-opponent-results]');
 let chosenName=search.value;
 const refresh=()=>{
  const selected=sceneRollOpponents(actor).find(r=>r.tokenId===token.value),target=selected?.actor,isVersus=mode.value==='versus',automatic=isVersus&&picker.querySelector('[name="versusResolution"]').value==='automatic';
  picker.querySelector('[data-rg-auto-opposition]').hidden=!automatic;picker.querySelector('[data-rg-versus-fields]').hidden=!isVersus;
  const choices=automatic&&target?SheetClass._availableVersusOpposition(role.name,target):[];
  opposition.innerHTML=choices.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+' '+c.rating+'D · '+esc(c.basis)+'</option>').join('');
  picker.querySelector('[data-rg-opponent-status]').textContent=isVersus?(!target?'Search and click an opponent on the active map.':selected.name+' · '+(!automatic?'Enter the GM’s rolled successes as Obstacle.':choices.length?'The opponent’s roll determines the target.':'No supported opposing Skill.')):'';
  const field=root.querySelector('[name="obstacle"]');if(field)field.disabled=automatic;const panel=root.querySelector('.rg-obstacle-panel');if(panel)panel.hidden=automatic;
  const summary=root.querySelector('.rg-roll-dialog-head > span');if(summary)summary.textContent=isVersus?'VERSUS · '+(selected?.name??'Choose opponent'):'Standard test';
  const trait=root.querySelector('[name="traitMode"]');let hurt=trait?.querySelector('[value="hurt"]');if(automatic&&trait&&!hurt){hurt=document.createElement('option');hurt.value='hurt';hurt.textContent='Against yourself in Versus (+2D opponent)';trait.append(hurt);}if(!automatic&&hurt){if(trait.value==='hurt')trait.value='help';hurt.remove();}
 };
 const list=()=>{const query=search.value.trim().toLowerCase(),rows=sceneRollOpponents(actor).filter(r=>r.name.toLowerCase().includes(query)).slice(0,30);results.replaceChildren();for(const row of rows){const button=document.createElement('button');button.type='button';button.role='option';button.dataset.rgOpponentToken=row.tokenId;button.textContent=row.name;button.onclick=()=>{opponent.value=row.actor.id;token.value=row.tokenId;chosenName=row.name;search.value=row.name;results.replaceChildren();refresh();};results.append(button);}if(!rows.length)results.textContent='No matching opponents on this map.';};
 search.addEventListener('input',()=>{if(search.value!==chosenName){opponent.value='';token.value='';}list();refresh();});search.addEventListener('focus',list);
 search.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus();}if(e.key==='Enter'&&results.querySelectorAll('button').length===1){e.preventDefault();results.querySelector('button').click();}});
 results.addEventListener('keydown',e=>{if(e.key==='Escape'){results.replaceChildren();search.focus();}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const rows=[...results.querySelectorAll('button')],i=rows.indexOf(document.activeElement);rows[(i+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length]?.focus();}});
 mode.addEventListener('change',refresh);picker.querySelector('[name="versusResolution"]').addEventListener('change',refresh);refresh();
}
export function resolveLegacyRollTarget(actor,role,elements,SheetClass){
 if(!legacyMixedPolishEnabled())return null;
 if(elements.rollMode?.value!=='versus')return {versus:false,opponentActorId:null,oppositionId:null};
 const row=sceneRollOpponents(actor).find(r=>elements.opponentTokenId?.value?r.tokenId===elements.opponentTokenId.value:r.actor.id===elements.opponentActorId?.value);
 if(!row){ui.notifications.warn('Choose an opponent on the active map.');return null;}
 const result={versus:true,opponentActorId:row.actor.id,opponentTokenId:row.tokenId};
 if(elements.versusResolution?.value!=='automatic')return {...result,manualVersus:true,oppositionId:null};
 const choice=SheetClass._availableVersusOpposition(role.name,row.actor).find(r=>r.id===elements.oppositionId?.value);
 if(!choice){ui.notifications.warn('Choose a valid opposing Skill.');return null;}
 return {...result,oppositionId:choice.id};
}
