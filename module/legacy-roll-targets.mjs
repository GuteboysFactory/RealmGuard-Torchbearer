import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';

const esc = value => foundry.utils.escapeHTML(String(value ?? ''));

export function sceneRollOpponents(actor) {
  return (globalThis.canvas?.tokens?.placeables ?? [])
    .filter(token => token.actor && token.actor.id !== actor.id && ['character', 'npc'].includes(token.actor.type)
      && (game.user.isGM || (token.visible !== false && token.document?.hidden !== true)))
    .map(token => ({ tokenId: token.id ?? token.document?.id, actor: token.actor, name: token.name ?? token.actor.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function visibleRollOpponents(actor) {
  return [...new Map(sceneRollOpponents(actor).map(row => [row.actor.id, row.actor])).values()];
}

function rollOpponents(actor) {
  const rows = sceneRollOpponents(actor);
  const ids = new Set(rows.map(row => row.actor.id));
  for (const candidate of game.actors) {
    if (candidate.id === actor.id || ids.has(candidate.id)) continue;
    const playerCharacter = candidate.type === 'character' && candidate.hasPlayerOwner;
    if (['npc', 'character'].includes(candidate.type)
      && (game.user.isGM || playerCharacter || candidate.testUserPermission?.(game.user, 'LIMITED'))) {
      rows.push({ tokenId: '', actor: candidate, name: candidate.name });
    }
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

function selectedOpponent(actor, elements) {
  const actorId = elements.opponentActorId?.value;
  const tokenId = elements.opponentTokenId?.value ?? '';
  return rollOpponents(actor).find(row => row.actor.id === actorId && (row.tokenId ?? '') === tokenId);
}

export function legacyRollTargetControls(actor, versus = false, target = null) {
  const row = target && rollOpponents(actor).find(candidate => candidate.actor.id === target.id);
  return `<fieldset class="rg-roll-target-picker"><legend>Test type & opponent</legend>
    <label>Test type<select name="rollMode">
      <option value="standard" ${versus ? '' : 'selected'}>Standard test</option>
      <option value="versus" ${versus ? 'selected' : ''}>Versus</option>
    </select></label>
    <div data-rg-versus-fields ${versus ? '' : 'hidden'}>
      <label>Search opponents<input type="search" data-rg-opponent-search placeholder="Search and choose an opponent…" autocomplete="off" value="${esc(row?.name)}"></label>
      <input type="hidden" name="opponentActorId" value="${esc(row?.actor.id)}">
      <input type="hidden" name="opponentTokenId" value="${esc(row?.tokenId)}">
      <div data-rg-opponent-results role="listbox" aria-label="Opponents"></div>
      <p data-rg-opponent-status role="status"></p>
    </div>
  </fieldset>`;
}

export function bindLegacyRollTargets(dialog, actor, onOpponentChange) {
  const root = dialog.element;
  const picker = root?.querySelector('.rg-roll-target-picker');
  if (!picker) return;
  const mode = picker.querySelector('[name="rollMode"]');
  const opponentActorId = picker.querySelector('[name="opponentActorId"]');
  const opponentTokenId = picker.querySelector('[name="opponentTokenId"]');
  const search = picker.querySelector('[data-rg-opponent-search]');
  const results = picker.querySelector('[data-rg-opponent-results]');
  const field = root.querySelector('[name="obstacle"]');
  const obstacleField = field?.closest('.rg-roll-field-obstacle');
  const liveObstacle = field?.closest('[data-rg-obstacle-live-linked="true"]');
  const submitLabel = root.querySelector('button[data-action="roll"] > span');
  const standardLabel = submitLabel?.textContent;
  let chosenName = search.value;

  const refresh = () => {
    const isVersus = mode.value === 'versus';
    const target = selectedOpponent(actor, { opponentActorId, opponentTokenId });
    picker.querySelector('[data-rg-versus-fields]').hidden = !isVersus;
    onOpponentChange?.(isVersus ? target?.actor.id : undefined);
    if (field) field.disabled = isVersus;
    if (obstacleField) obstacleField.hidden = isVersus;
    if (liveObstacle) liveObstacle.dataset.rgObstacleLiveLinked = String(!isVersus);
    if (submitLabel) submitLabel.textContent = isVersus ? 'Roll & Send Challenge' : standardLabel;
    const summary = root.querySelector('.rg-roll-dialog-head > span');
    if (summary) summary.textContent = isVersus ? `VERSUS · ${target?.name ?? 'Choose opponent'}` : 'Standard test';
    const responder = target?.actor.type === 'character' ? `${target.name}'s owner or the GM` : 'The GM';
    picker.querySelector('[data-rg-opponent-status]').textContent = target
      ? `${responder} can choose Respond in chat.`
      : 'Choose a visible token or search for an opponent.';
  };

  const list = () => {
    const query = search.value.trim().toLowerCase();
    const rows = rollOpponents(actor).filter(row => row.name.toLowerCase().includes(query)).slice(0, 30);
    results.replaceChildren();
    for (const row of rows) {
      const button = document.createElement('button');
      button.type = 'button';
      button.role = 'option';
      button.textContent = row.name;
      button.onclick = () => {
        opponentActorId.value = row.actor.id;
        opponentTokenId.value = row.tokenId ?? '';
        search.value = chosenName = row.name;
        results.replaceChildren();
        refresh();
      };
      results.append(button);
    }
    if (!rows.length) results.textContent = 'No matching opponents.';
  };
  search.addEventListener('input', () => {
    if (search.value !== chosenName) opponentActorId.value = opponentTokenId.value = '';
    list();
    refresh();
  });
  search.addEventListener('focus', list);
  search.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      results.querySelector('button')?.focus();
    }
    if (event.key === 'Enter' && results.querySelectorAll('button').length === 1) {
      event.preventDefault();
      results.querySelector('button').click();
    }
  });
  results.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      search.focus();
      results.replaceChildren();
    }
    if (['ArrowDown','ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const rows = [...results.querySelectorAll('button')];
      if (rows.length) rows[(rows.indexOf(document.activeElement) + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length]?.focus();
    }
  });
  mode.addEventListener('change', refresh);
  refresh();
}

export function resolveLegacyRollTarget(actor, elements) {
  if (!legacyMixedPolishEnabled()) return null;
  if (elements.rollMode?.value !== 'versus') return {};
  const row = selectedOpponent(actor, elements);
  if (!row) {
    ui.notifications.warn('Choose an opponent for the Versus challenge.');
    return null;
  }
  return { challengeTarget: { id: row.actor.id, uuid: row.actor.uuid, name: row.name } };
}
