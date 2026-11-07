import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";

export const END_SESSION_ROSTER_KEY = "legacyMixedEndSessionRoster";
const NS = "realm-guard";
const eligible = actor => actor && ["character", "npc"].includes(actor.type);
const sorted = actors => actors.sort((a, b) => a.name.localeCompare(b.name));
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
let saveQueue = Promise.resolve();

export function endSessionRosterActors() {
  const roster = game.settings.get(NS, END_SESSION_ROSTER_KEY);
  if (roster?.initialized) {
    return sorted([...new Set(roster.actorIds ?? [])].map(id => game.actors.get(id)).filter(eligible));
  }
  const assigned = new Set(game.users.filter(user => !user.isGM).map(user => user.character?.id).filter(Boolean));
  return sorted(game.actors.filter(actor => actor.type === "character" && (actor.hasPlayerOwner || assigned.has(actor.id))));
}

export function saveEndSessionRoster(actors) {
  if (!legacyMixedPolishEnabled() || !game.user?.isGM) return Promise.resolve(false);
  const actorIds = [...new Set(actors.filter(eligible).map(actor => actor.id))];
  const task = saveQueue.catch(() => {}).then(() => game.settings.set(NS, END_SESSION_ROSTER_KEY, { initialized: true, actorIds }));
  saveQueue = task;
  return task;
}

export function endSessionRosterHtml(actors) {
  return `<section class="rg-eos-roster" aria-label="Session participants">
    <header><h3>Session participants</h3><span data-eos-count>${actors.length} selected</span></header>
    <p>Your participant list is remembered for the next session. Remove an absent character or search to add a character or NPC.</p>
    <div class="rg-eos-roster-chips" data-eos-roster-chips></div>
    <label class="rg-eos-search-label">Add character or NPC<input type="search" data-eos-search placeholder="Search by name…" autocomplete="off"></label>
    <div class="rg-eos-search-results" data-eos-search-results role="group" aria-label="Matching characters"></div>
    <span class="rg-eos-save-status" role="status" data-eos-save-status></span>
  </section>`;
}

// Edits update only the roster / nominations and the affected card. Existing
// award checkboxes and scroll positions survive an add or remove.
export function bindEndSessionRoster(root, actors, { actorCard, nomineeOptions, draft = null }) {
  if (!root || root.dataset.eosBound) return;
  root.dataset.eosBound = "true";
  const search = root.querySelector("[data-eos-search]");
  const chips = root.querySelector("[data-eos-roster-chips]");
  const results = root.querySelector("[data-eos-search-results]");
  const status = root.querySelector("[data-eos-save-status]");
  const persist = () => {
    status.textContent = "Saving participants…";
    saveEndSessionRoster(actors).then(() => { status.textContent = "Participants saved"; }, () => {
      status.textContent = "Participants could not be saved. Reopen End Session to retry.";
      ui.notifications.error("Realm Guard: Could not save the End Session participants.");
    });
  };
  const refreshSearch = () => {
    const term = search.value.trim().toLocaleLowerCase();
    if (!term) { results.innerHTML = ""; return; }
    const ids = new Set(actors.map(actor => actor.id));
    const matches = sorted(game.actors.filter(actor => eligible(actor) && !ids.has(actor.id) && actor.name.toLocaleLowerCase().includes(term)));
    results.innerHTML = matches.length ? matches.slice(0, 30).map(actor => `<button type="button" data-eos-add="${esc(actor.id)}"><span><b>${esc(actor.name)}</b><small>${actor.type === "npc" ? "NPC" : "Character"}</small></span><span aria-hidden="true">＋</span></button>`).join("") : "<p>No matching characters.</p>";
  };
  const refresh = () => {
    chips.innerHTML = actors.map(actor => `<span class="rg-eos-roster-chip"><b>${esc(actor.name)}</b><button type="button" data-eos-remove="${esc(actor.id)}" aria-label="Remove ${esc(actor.name)}" title="Remove from this participant list">×</button></span>`).join("") || "<p>No participants selected. Search below to add someone.</p>";
    root.querySelector("[data-eos-count]").textContent = `${actors.length} selected`;
    const ids = new Set(actors.map(actor => actor.id));
    const cards = root.querySelector(".rg-eos-card-list");
    for (const card of cards.querySelectorAll("[data-actor-id]")) if (!ids.has(card.dataset.actorId)) card.remove();
    for (const actor of actors) if (![...cards.children].some(card => card.dataset.actorId === actor.id)) cards.insertAdjacentHTML("beforeend", actorCard(actor));
    for (const name of ["mvp", "workhorse"]) {
      const select = root.querySelector(`[name="${name}"]`), previous = select.value;
      select.innerHTML = nomineeOptions(actors);
      select.value = ids.has(previous) ? previous : "";
    }
    const embodiment = root.querySelector("[data-eos-embodiment]");
    const checked = new Set([...embodiment.querySelectorAll("input:checked")].map(input => input.name));
    embodiment.innerHTML = actors.map(actor => `<label><input type="checkbox" name="personaEmbodiment_${esc(actor.id)}" ${checked.has(`personaEmbodiment_${actor.id}`) ? "checked" : ""}> ${esc(actor.name)}</label>`).join("");
    refreshSearch();
  };
  search.addEventListener("input", refreshSearch);
  root.addEventListener("click", event => {
    const add = event.target.closest("[data-eos-add]"), remove = event.target.closest("[data-eos-remove]");
    if (!add && !remove) return;
    event.preventDefault();
    if (add) {
      const actor = game.actors.get(add.dataset.eosAdd);
      if (!eligible(actor) || actors.some(row => row.id === actor.id)) return;
      actors.push(actor);
    } else {
      const index = actors.findIndex(actor => actor.id === remove.dataset.eosRemove);
      if (index < 0) return;
      actors.splice(index, 1);
    }
    refresh(); persist();
  });
  refresh();
  if (draft) {
    for (const row of draft.rows ?? []) for (const [criterion, checked] of Object.entries(row.criteria)) {
      const input = root.querySelector(`[name="${criterion}_${row.actor.id}"]`);
      if (input) input.checked = checked;
    }
    root.querySelector('[name="mvp"]').value = draft.mvpId ?? "";
    root.querySelector('[name="workhorse"]').value = draft.workhorseId ?? "";
  }
}
