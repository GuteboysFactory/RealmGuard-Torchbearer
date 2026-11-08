// One team pool; new multi-player conflicts require an explicit distribution.
export function activeConflictParticipants(state) {
  const ids = state?.ranger?.participantIds ?? [];
  const allocation = state?.ranger?.individualDisposition;
  return allocation ? ids.filter(id => Number(allocation[id]?.current ?? 0) > 0) : [...ids];
}

export function createTemporaryOpposition(data) {
  if (!data || !data.id || !String(data.name ?? "").trim() || !Number.isInteger(data.rating) || data.rating < 1 || data.rating > 30) throw new Error("Invalid temporary opposition.");
  const items = [];
  items.get = id => items.find(item => item.id === id);
  return {
    id: data.id, uuid: `Conflict.${data.id}`, name: data.name, type: "npc", isOwner: Boolean(globalThis.game?.user?.isGM),
    hasPlayerOwner: false, temporaryOpposition: true, flags: {}, items, traits: [], wises: [], conditions: [], gear: [], talents: [], tokensOfPower: [],
    system: { attributes: Object.fromEntries(["will", "health", "nature", "resources", "circles"].map(key => [key, { value: data.rating, maximum: data.rating }])), resources: { fate: { value: 0 }, persona: { value: 0 } }, progression: { level: 1 } },
    testUserPermission: user => Boolean(user?.isGM)
  };
}

export function dispositionAllocationPending(state) {
  const allocation = state?.ranger?.individualDisposition;
  if (state?.dispositionAllocationRequired && state.ranger?.disposition?.rolled && state.ranger.participantIds.length > 1 && !allocation) return true;
  return Boolean(allocation && (state.ranger.participantIds ?? []).reduce((n, id) => n + Number(allocation[id]?.current ?? 0), 0) !== Number(state.ranger.disposition.current));
}

export function validateDispositionAllocation(state, allocation) {
  const ids = state?.ranger?.participantIds ?? [];
  if (!allocation || Object.keys(allocation).some(id => !ids.includes(id))) return false;
  let start = 0, current = 0;
  for (const id of ids) {
    const row = allocation[id];
    if (!row || !Number.isInteger(row.start) || !Number.isInteger(row.current) || row.start < 0 || row.current < 0 || row.current > row.start) return false;
    start += row.start; current += row.current;
  }
  return start === Number(state.ranger.disposition.start) && current === Number(state.ranger.disposition.current);
}

export function captureConflictView(root) {
  if (!root) return null;
  const body = root.querySelector('.rg-conflict-body');
  return {
    scrollTop: body?.scrollTop ?? 0,
    scrollLeft: body?.scrollLeft ?? 0,
    details: [...root.querySelectorAll('details')].map((el, index) => ({ key: el.dataset.viewKey || el.className || String(index), open: el.open })),
    compromise: root.querySelector('#rg-conflict-compromise-text')?.value
  };
}

export function restoreConflictView(root, view) {
  if (!view) return;
  for (const [index, el] of [...root.querySelectorAll('details')].entries()) {
    const key = el.dataset.viewKey || el.className || String(index);
    const saved = view.details.find(row => row.key === key);
    if (saved) el.open = saved.open;
  }
  const text = root.querySelector('#rg-conflict-compromise-text');
  if (text && view.compromise !== undefined) text.value = view.compromise;
  const body = root.querySelector('.rg-conflict-body');
  if (body) { body.scrollTop = view.scrollTop; body.scrollLeft = view.scrollLeft; }
}

export function collapseConflictHelp(root) {
  for (const text of root.querySelectorAll('.rg-conflict-roll-dialog small, .rg-conflict-setup .rg-conflict-callout')) {
    if (text.closest('details')) continue;
    const details = root.ownerDocument.createElement('details'); details.className = 'rg-conflict-help';
    const summary = root.ownerDocument.createElement('summary'); summary.textContent = 'Rules / explanation';
    text.replaceWith(details); details.append(summary, text);
  }
}
