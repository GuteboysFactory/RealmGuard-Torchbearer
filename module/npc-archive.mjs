import { fitWindowToViewport } from "./window-position-service.mjs";

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

function archiveRow(actor) {
  const folder = actor.folder;
  const ancestry = folder ? [...folder.ancestors].reverse().concat(folder) : [];
  return {
    id: actor.id, name: actor.name,
    folder: ancestry.map(entry => entry.name).join(" / ") || "Unfiled",
    folderIds: ancestry.map(entry => entry.id)
  };
}

function usedActorIds() {
  const ids = new Set();
  for (const scene of game.scenes) {
    for (const token of scene.tokens) if (token.actorId) ids.add(token.actorId);
  }
  for (const combat of game.combats) {
    for (const combatant of combat.combatants) if (combatant.actorId) ids.add(combatant.actorId);
  }
  return ids;
}

function archiveSource(actor, pack) {
  return actor.toCompendium(pack, {
    keepId: true, clearFolder: true, clearSort: false, clearSource: false,
    clearState: false, clearOwnership: false
  });
}

function signature(source) {
  return JSON.stringify(source, (key, value) => {
    if (key === "_stats") return undefined;
    if (value && !Array.isArray(value) && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
    }
    return value;
  });
}

export async function openNpcArchive() {
  if (!game.user?.isGM) return;
  const folderName = folder => folder ? [...folder.ancestors].reverse().concat(folder).map(entry => entry.name).join(" / ") : "Unfiled";
  const folders = game.folders.filter(folder => folder.type === "Actor").sort((a, b) => folderName(a).localeCompare(folderName(b)));
  const selected = new Set();
  const verified = new Map();
  const markedForRemoval = new Set();
  const removed = new Set();
  const errors = new Map();
  let destination;
  let privateArchive = false;
  let running = false;
  let selection;

  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · Archive NPCs", resizable: true },
    position: fitWindowToViewport(830, 720),
    content: `<div class="rg-npc-archive">
      <fieldset data-rg-archive-controls>
        <div data-rg-archive-select>
          <label>New Actor Compendium <input type="text" required data-rg-archive-name></label>
          <label>Actor Folder <select data-rg-archive-folder><option value="">All folders</option>
            <option value="unfiled">Unfiled</option>
            ${folders.map(folder => `<option value="${esc(folder.id)}">${esc(folderName(folder))}</option>`).join("")}
          </select></label>
          <label>Find NPC <input type="search" data-rg-archive-search></label>
          <div class="rg-npc-archive-actions">
            <button type="button" data-rg-archive-all>Select Visible</button>
            <button type="button" data-rg-archive-clear>Clear Selection</button>
          </div>
        </div>
        <p data-rg-archive-selection></p>
        <ul class="rg-npc-archive-list" data-rg-archive-list></ul>
        <div class="rg-npc-archive-actions">
          <button type="button" data-rg-archive-copy>Create Archive</button>
          <button type="button" data-rg-archive-remove hidden>Remove Selected Originals</button>
        </div>
      </fieldset>
      <p role="status" data-rg-archive-status></p>
    </div>`,
    buttons: [{ action: "close", label: "Close" }]
  });
  await dialog.render(true);
  const root = dialog.element;
  const controls = root.querySelector("[data-rg-archive-controls]");
  const packName = root.querySelector("[data-rg-archive-name]");
  const folder = root.querySelector("[data-rg-archive-folder]");
  const search = root.querySelector("[data-rg-archive-search]");
  const label = root.querySelector("[data-rg-archive-selection]");
  const list = root.querySelector("[data-rg-archive-list]");
  const copy = root.querySelector("[data-rg-archive-copy]");
  const remove = root.querySelector("[data-rg-archive-remove]");
  const status = root.querySelector("[data-rg-archive-status]");

  function updateControls() {
    label.textContent = selection
      ? `${markedForRemoval.size} originals selected for removal. Only verified, unused NPCs can be selected.`
      : `${selected.size} NPCs selected.`;
    copy.disabled = selection ? verified.size === selection.length : selected.size === 0;
    copy.hidden = Boolean(selection && verified.size === selection.length);
    remove.disabled = !markedForRemoval.size;
  }

  function renderRows() {
    const inUse = usedActorIds();
    const query = search.value.trim().toLowerCase();
    const rows = selection ?? game.actors.filter(actor => actor.type === "npc").map(archiveRow);
    const visible = rows.filter(row => row.name.toLowerCase().includes(query)
      && (!folder.value || (folder.value === "unfiled" ? !row.folderIds.length : row.folderIds.includes(folder.value))))
      .sort((a, b) => a.name.localeCompare(b.name));
    list.innerHTML = visible.map(({ id, name, folder }) => {
      const active = inUse.has(id);
      if (active) markedForRemoval.delete(id);
      const checked = (selection ? markedForRemoval : selected).has(id);
      const disabled = selection && (!verified.has(id) || active || removed.has(id) || !game.actors.has(id));
      const note = errors.get(id) || (removed.has(id) ? "Original removed" : active ? "Used by a token or combatant"
        : verified.has(id) ? "Copy verified" : "");
      return `<li><label><input type="checkbox" value="${esc(id)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
        <span>${esc(name)} <small>${esc(folder)}</small></span><small>${esc(note)}</small></label></li>`;
    }).join("");
    updateControls();
  }

  folder.addEventListener("change", renderRows);
  search.addEventListener("input", renderRows);
  list.addEventListener("change", event => {
    const choice = event.target.closest('input[type="checkbox"]');
    if (!choice) return;
    const target = selection ? markedForRemoval : selected;
    if (choice.checked) target.add(choice.value);
    else target.delete(choice.value);
    updateControls();
  });
  root.querySelector("[data-rg-archive-all]").addEventListener("click", () => {
    const target = selection ? markedForRemoval : selected;
    for (const input of list.querySelectorAll("input:not(:disabled)")) target.add(input.value);
    renderRows();
  });
  root.querySelector("[data-rg-archive-clear]").addEventListener("click", () => {
    (selection ? markedForRemoval : selected).clear();
    renderRows();
  });

  copy.addEventListener("click", async () => {
    if (running || !game.user?.isGM || !selected.size) return;
    const name = packName.value.trim();
    if (!name) {
      ui.notifications.warn("Realm Guard: Enter a name for the archive.");
      packName.focus();
      return;
    }
    running = controls.disabled = true;
    try {
      if (!destination) {
        if (game.packs.some(pack => pack.title.toLowerCase() === name.toLowerCase())) throw new Error("A compendium with that name already exists.");
        destination = await foundry.documents.collections.CompendiumCollection.createCompendium({
          label: name, type: "Actor", package: "world"
        });
        if (!destination) throw new Error("Could not create the archive.");
        selection = [...selected].map(id => {
          const actor = game.actors.get(id);
          return actor ? archiveRow(actor) : { id, name: id, folder: "Unfiled", folderIds: [] };
        });
        packName.closest("label").hidden = true;
        folder.value = "";
        search.value = "";
        folder.dispatchEvent(new Event("change", { bubbles: true }));
        copy.textContent = "Retry Unverified Copies";
        remove.hidden = false;
      }
      if (!privateArchive) {
        await destination.configure({ ownership: { GAMEMASTER: "OWNER", ASSISTANT: "NONE", TRUSTED: "NONE", PLAYER: "NONE" } });
        privateArchive = true;
      }
      for (const { id } of selection) {
        if (verified.has(id)) continue;
        const actor = game.actors.get(id);
        errors.delete(id);
        try {
          if (actor?.type !== "npc") throw new Error("Original NPC is no longer available.");
          const source = archiveSource(actor, destination);
          const expected = signature(source);
          const existing = destination.index.has(id) ? await destination.getDocument(id) : null;
          const saved = existing ?? await Actor.implementation.create(source, {
            pack: destination.collection, keepId: true, keepEmbeddedIds: true,
            noHook: true, realmGuardSkipRecruitmentProvisioning: true
          });
          if (!saved || saved.id !== id || signature(archiveSource(saved, destination)) !== expected) {
            throw new Error("The archived copy differs from the original.");
          }
          verified.set(id, expected);
        } catch (error) {
          errors.set(id, error.message);
        }
        status.textContent = `${verified.size} of ${selection.length} copies verified in ${destination.title}.`;
      }
    } catch (error) {
      status.textContent = error.message;
    } finally {
      running = controls.disabled = false;
      renderRows();
    }
  });

  remove.addEventListener("click", async () => {
    if (running || !game.user?.isGM || !markedForRemoval.size) return;
    running = controls.disabled = true;
    try {
      const count = markedForRemoval.size;
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Realm Guard · Remove Archived Originals" },
        content: `<p>Remove ${count} selected NPC originals from the world?</p>
          <p>The compendium copies are kept. Links to the original world Actors can stop working.</p>`,
        yes: { label: "Remove Originals" },
        no: { label: "Cancel" },
        rejectClose: false
      });
      if (!confirmed || !game.user?.isGM) return;
      let countRemoved = 0;
      for (const id of markedForRemoval) {
        errors.delete(id);
        try {
          const saved = await destination.getDocument(id);
          const actor = game.actors.get(id);
          const expected = verified.get(id);
          if (!actor || !saved || !expected || signature(archiveSource(saved, destination)) !== expected
            || signature(archiveSource(actor, destination)) !== expected) {
            throw new Error("The original or its archived copy changed. The original was kept.");
          }
          if (usedActorIds().has(id)) throw new Error("A token or combatant uses this NPC. The original was kept.");
          if (!await actor.delete() || game.actors.has(id)) throw new Error("Foundry did not remove the original.");
          removed.add(id);
          countRemoved += 1;
        } catch (error) {
          errors.set(id, error.message);
        }
      }
      markedForRemoval.clear();
      status.textContent = `${countRemoved} of ${count} originals removed. Verified copies are in ${destination.title}.`;
    } finally {
      running = controls.disabled = false;
      renderRows();
    }
  });
  renderRows();
  return dialog;
}
