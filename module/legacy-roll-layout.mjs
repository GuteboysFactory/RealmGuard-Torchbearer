import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';

// Keep all original controls, values, status nodes and delegated actions. Only
// explanatory text is folded; pending requests and rule restrictions stay visible.
export function compactLegacyRollDialog(dialog) {
  if (!legacyMixedPolishEnabled()) return false;
  const root=dialog.element?.querySelector('.rg-roll-dialog');
  if (!root || root.classList.contains('rg-compact-roll-dialog')) return false;
  root.classList.add('rg-compact-roll-dialog'); dialog.element.classList.add('rg-compact-roll-window');
  for (const node of root.querySelectorAll('.rg-help-tip[title]')) {
    node.tabIndex=0;node.setAttribute('aria-label',node.title);
  }
  for (const note of [...root.querySelectorAll('small')]) {
    if (note.closest('.rg-condition-roll-preview') || note.querySelector('.rg-disabled-reason') || /available; max/.test(note.textContent) || note.closest('[data-rg-help-summary]')) continue;
    if (!note.textContent.trim() || note.querySelector('input,select,button')) continue;
    const details=document.createElement('details');details.className='rg-roll-explanation';
    const summary=document.createElement('summary');summary.textContent='?';summary.title='Show explanation';summary.setAttribute('aria-label','Show explanation');
    note.before(details);details.append(summary,note);
  }
  const helpStatus=root.querySelector('[data-rg-help-request-status]');
  if (helpStatus?.textContent.startsWith('Help is optional.')) helpStatus.textContent='Optional';
  const conditions=root.querySelector('.rg-condition-roll-preview');
  if (conditions && !conditions.querySelector('.rg-chat-condition')) {
    conditions.classList.add('rg-no-roll-conditions');
    const description=conditions.querySelector('div');if(description)description.textContent='None';
  }
  const traits=root.querySelector('[name="traitId"]')?.closest('fieldset');
  if (traits) { traits.classList.add('rg-compact-traits'); for(const explanation of traits.querySelectorAll(':scope > .rg-roll-explanation')) traits.append(explanation); }
  return true;
}
