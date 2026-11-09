import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
const esc = value => foundry.utils.escapeHTML(String(value ?? ''));

// Limited observers may identify a target; the existing roll engine checks the
// target's actual legal opposition. Never enumerate invisible campaign actors.
export function visibleRollOpponents(actor) {
  return (game.actors?.contents ?? []).filter(row => row.id !== actor.id && (game.user?.isGM || row.visible === true || row.testUserPermission?.(game.user, 'LIMITED'))).sort((a,b) => a.name.localeCompare(b.name));
}

export function legacyRollTargetControls(actor, versus = false, target = null) {
  const rows = visibleRollOpponents(actor);
  return `<fieldset class="rg-roll-target-picker"><legend>Test type & opponent</legend><label>Test type<select name="rollMode"><option value="standard" ${!versus ? 'selected' : ''}>Standard test</option><option value="versus" ${versus ? 'selected' : ''}>Versus</option></select></label><div data-rg-versus-fields ${!versus ? 'hidden' : ''}><label>Search opponents<input type="search" data-rg-opponent-search placeholder="Search by name…" autocomplete="off"></label><label>Opponent<select name="opponentActorId"><option value="">Choose opponent…</option>${rows.map(row => `<option value="${esc(row.id)}" ${target?.id === row.id ? 'selected' : ''}>${esc(row.name)}</option>`).join('')}</select></label><label>Opponent rolls<select name="oppositionId"></select></label><p data-rg-opponent-status role="status"></p></div></fieldset>`;
}

export function bindLegacyRollTargets(dialog, actor, role, SheetClass) {
  const root = dialog.element; const picker = root?.querySelector('.rg-roll-target-picker'); if (!picker) return;
  const mode = picker.querySelector('[name="rollMode"]'), opponent = picker.querySelector('[name="opponentActorId"]'), opposition = picker.querySelector('[name="oppositionId"]');
  const initialOptions = [...opponent.options].map(option => ({value:option.value,text:option.textContent}));
  const refresh = () => {
    const isVersus = mode.value === 'versus', target = game.actors.get(opponent.value);
    picker.querySelector('[data-rg-versus-fields]').hidden = !isVersus;
    const choices = isVersus && visibleRollOpponents(actor).some(row => row.id === target?.id) ? SheetClass._availableVersusOpposition(role.name,target) : [];
    opposition.innerHTML = choices.map(choice => `<option value="${esc(choice.id)}">${esc(choice.name)} ${choice.rating}D · ${esc(choice.basis)}</option>`).join('');
    picker.querySelector('[data-rg-opponent-status]').textContent = isVersus ? !target ? 'Choose an opponent.' : choices.length ? 'The opponent’s roll determines the target.' : 'This opponent has no supported opposition for this Skill.' : '';
    const field = root.querySelector('[name="obstacle"]'); if (field) field.disabled = isVersus;
    const panel = root.querySelector('.rg-obstacle-panel'); if (panel) panel.hidden = isVersus;
    const summary = root.querySelector('.rg-roll-dialog-head > span'); if (summary) summary.textContent = isVersus ? `VERSUS · ${target?.name ?? 'Choose opponent'}` : 'Standard test';
    const trait = root.querySelector('[name="traitMode"]');
    let hurt = trait?.querySelector('[value="hurt"]');
    if (isVersus && trait && !hurt) { hurt = document.createElement('option'); hurt.value='hurt'; hurt.textContent='Against yourself in Versus (+2D opponent)'; trait.append(hurt); }
    if (!isVersus && hurt) { if (trait.value === 'hurt') trait.value='help'; hurt.remove(); }
  };
  mode.addEventListener('change',refresh); opponent.addEventListener('change',refresh);
  picker.querySelector('[data-rg-opponent-search]').addEventListener('input',event => {
    const selected = opponent.value, query = event.target.value.toLowerCase();
    opponent.replaceChildren(...initialOptions.filter(row => !row.value || row.value === selected || row.text.toLowerCase().includes(query)).map(row => { const option=document.createElement('option'); option.value=row.value; option.textContent=row.text; return option; }));
    opponent.value=selected; refresh();
  }); refresh();
}

export function resolveLegacyRollTarget(actor, role, elements, SheetClass) {
  if (!legacyMixedPolishEnabled()) return null;
  if (elements.rollMode?.value !== 'versus') return { versus:false, opponentActorId:null, oppositionId:null };
  const opponent = visibleRollOpponents(actor).find(row => row.id === elements.opponentActorId?.value);
  const choice = opponent && SheetClass._availableVersusOpposition(role.name,opponent).find(row => row.id === elements.oppositionId?.value);
  if (!opponent || !choice) { ui.notifications.warn('Choose a valid opponent and opposing Skill before rolling.'); return null; }
  return { versus:true, opponentActorId:opponent.id, oppositionId:choice.id };
}
