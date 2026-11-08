const NS = "realm-guard";
export const CONFLICT_ROSTER_KEY = "legacyMixedConflictParticipants";
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const eligible = actor => actor && ["character", "npc"].includes(actor.type);
export function initialConflictRangers() {
  const saved = game.settings.get(NS, CONFLICT_ROSTER_KEY);
  if (saved?.initialized) return [...new Set(saved.actorIds ?? [])].filter(id => eligible(game.actors.get(id)));
  if (Array.isArray(saved)) return [...new Set(saved)].filter(id => eligible(game.actors.get(id)));
  const assigned = new Set(game.users.filter(user => !user.isGM).map(user => user.character?.id));
  return game.actors.filter(actor => actor.type === "character" && (actor.hasPlayerOwner || assigned.has(actor.id))).map(actor => actor.id);
}
export async function chooseConflictRoster(types) {
  const selected = { ranger: initialConflictRangers(), gm: [] };
  const custom = [];
  const content = `<div class="rg-conflict-setup rg-conflict-setup-simple">
    <div class="rg-conflict-setup-grid"><label>Conflict name<input name="name" value="Realm Guard Conflict" maxlength="100"></label><label>Conflict type<select name="type">${Object.entries(types).map(([id,type])=>`<option value="${id}">${esc(type.label)}</option>`).join("")}</select></label></div>
    <div class="rg-conflict-roster-columns">${["gm","ranger"].map(side=>`<section class="rg-conflict-roster" data-roster-side="${side}"><h3>${side==="gm"?"Opponents / GM":"Rangers / Players"}</h3><div data-roster-chips></div><label>Search characters or NPCs<input type="search" data-roster-search autocomplete="off" placeholder="Search by name…"></label><div data-roster-results></div>${side==="gm"?'<details class="rg-custom-opponent"><summary>Create temporary opponent</summary><label>Name<input data-custom-name maxlength="100" placeholder="Storm, pursuer, rival…"></label><label>Dice pool<input data-custom-rating type="number" min="1" max="30" step="1" value="4"></label><button type="button" data-custom-add>Add temporary opponent</button><small>Only exists in this conflict. No Actor or Contact is created.</small></details>':''}</section>`).join("")}</div>
    <label>Conflict Captain<select name="captainId" data-conflict-captain></select></label>
    <details><summary>Other conflict options</summary><label>Other conflict base<select name="otherBaseKey">${["health","will","nature","resources","circles"].map(key=>`<option value="${key}">${key}</option>`).join("")}</select></label></details>
  </div>`;
  const result = await foundry.applications.api.DialogV2.wait({window:{title:"Realm Guard · Start Conflict",resizable:true},position:{width:800},content,modal:false,rejectClose:false,
    render:(_event,dialog)=>{
      const root=dialog.element?.querySelector('.rg-conflict-setup-simple');if(!root||root.dataset.bound)return;root.dataset.bound="true";
      const actor=id=>game.actors.get(id)??custom.find(row=>row.id===id);
      const refresh=()=>{
        for(const side of ['gm','ranger']){
          const box=root.querySelector(`[data-roster-side="${side}"]`),term=box.querySelector('[data-roster-search]').value.trim().toLocaleLowerCase();
          box.querySelector('[data-roster-chips]').innerHTML=selected[side].map(id=>`<span class="rg-roster-chip"><b>${esc(actor(id)?.name??id)}</b><button type="button" data-remove="${id}" aria-label="Remove ${esc(actor(id)?.name??id)}">×</button></span>`).join('')||'<p>No participants selected.</p>';
          box.querySelector('[data-roster-results]').innerHTML=!term?'':game.actors.filter(eligible).filter(row=>!selected.gm.includes(row.id)&&!selected.ranger.includes(row.id)&&row.name.toLocaleLowerCase().includes(term)).slice(0,30).map(row=>`<button type="button" data-add="${row.id}">${esc(row.name)} ＋</button>`).join('')||'<p>No matches.</p>';
        }
        const captain=root.querySelector('[name="captainId"]'),previous=captain.value;captain.innerHTML=selected.ranger.map(id=>`<option value="${id}">${esc(actor(id)?.name)}</option>`).join('');if(selected.ranger.includes(previous))captain.value=previous;
      };
      root.addEventListener('input',event=>{if(event.target.matches('[data-roster-search]'))refresh();});
      root.addEventListener('click',event=>{
        const button=event.target.closest('button');if(!button)return;
        const box=button.closest('[data-roster-side]');if(!box)return;const side=box.dataset.rosterSide;
        if(button.hasAttribute('data-add')){const id=button.dataset.add;if(eligible(game.actors.get(id))&&!selected.gm.includes(id)&&!selected.ranger.includes(id))selected[side].push(id);}
        else if(button.hasAttribute('data-remove'))selected[side]=selected[side].filter(id=>id!==button.dataset.remove);
        else if(button.hasAttribute('data-custom-add')){const name=box.querySelector('[data-custom-name]').value.trim(),rating=Number(box.querySelector('[data-custom-rating]').value);if(!name||!Number.isInteger(rating)||rating<1||rating>30)return ui.notifications.warn('Enter a name and a whole dice pool from 1 to 30.');const row={id:foundry.utils.randomID(),name,rating};custom.push(row);selected.gm.push(row.id);box.querySelector('[data-custom-name]').value='';}
        else return;event.preventDefault();refresh();
      });refresh();
    },buttons:[{action:'start',label:'Start Conflict',default:true,callback:(_event,button)=>{
      if(!selected.ranger.length||!selected.gm.length)return {error:'Select at least one participant on each side.'};
      const f=button.form.elements,captainId=f.captainId.value;if(!selected.ranger.includes(captainId))return {error:'Choose a participating captain.'};
      return {name:f.name.value.trim()||'Realm Guard Conflict',type:f.type.value,participantIds:[...selected.ranger],opponentIds:[...selected.gm],temporaryOpponents:custom.filter(row=>selected.gm.includes(row.id)),captainId,otherBaseKey:f.otherBaseKey.value};
    }},{action:'cancel',label:'Cancel',callback:()=>null}]});
  if(result?.error){ui.notifications.warn(result.error);return chooseConflictRoster(types);}
  return result;
}
