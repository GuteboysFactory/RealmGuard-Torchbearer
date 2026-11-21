import { fitWindowToViewport } from "./window-position-service.mjs";

const escapeHtml = value => foundry.utils.escapeHTML(String(value ?? ""));

export async function openNpcFolderImport({ pack, entries, buildNpcSource, cleanFileName, uploadImage }) {
  if (!game.user?.isGM || !entries.length) return;

  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const labels = new Map();
  for (const entry of sorted) {
    labels.set(entry.name, (labels.get(entry.name) ?? 0) + 1);
  }
  const templates = new Map(sorted.map(entry => [
    labels.get(entry.name) === 1 ? entry.name : `${entry.name} (${entry._id})`, entry._id
  ]));
  const options = [...templates.keys()].map(label => `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`).join("");
  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · Import Image Folder", resizable: true },
    position: fitWindowToViewport(850, 720),
    modal: false,
    content: `<div class="rg-npc-folder-import">
      <fieldset data-rg-npc-import-controls>
        <label>Image Folder <input type="file" webkitdirectory multiple data-rg-npc-import-files></label>
        <label>New Actor Compendium <input type="text" required data-rg-npc-import-name></label>
        <label>Default Template
          <select required data-rg-npc-import-template>
            <option value="">Choose a template</option>${options}
          </select>
        </label>
        <p>Templates from <strong>${escapeHtml(pack.title || pack.collection)}</strong></p>
        <datalist data-rg-npc-import-options>${options}</datalist>
        <ul class="rg-npc-folder-preview" data-rg-npc-import-preview aria-label="NPC Preview"></ul>
        <button type="button" data-rg-npc-import-create disabled>Create Compendium</button>
      </fieldset>
      <p role="status" aria-live="polite" data-rg-npc-import-status></p>
    </div>`,
    buttons: [{ action: "close", label: "Close" }]
  });
  await dialog.render(true);
  const root = dialog.element;
  const controls = root.querySelector("[data-rg-npc-import-controls]");
  const folderInput = root.querySelector("[data-rg-npc-import-files]");
  const packName = root.querySelector("[data-rg-npc-import-name]");
  const defaultTemplate = root.querySelector("[data-rg-npc-import-template]");
  const datalist = root.querySelector("[data-rg-npc-import-options]");
  const preview = root.querySelector("[data-rg-npc-import-preview]");
  const create = root.querySelector("[data-rg-npc-import-create]");
  const status = root.querySelector("[data-rg-npc-import-status]");
  datalist.id = `${root.id}-npc-templates`;

  let rows = [];
  let destination;
  let running = false;

  function revokePreviews() {
    for (const row of rows) URL.revokeObjectURL(row.previewUrl);
  }

  dialog.addEventListener("close", revokePreviews, { once: true });
  folderInput.addEventListener("change", () => {
    revokePreviews();
    const files = Array.from(folderInput.files ?? []);
    const images = files.map(file => {
      const extension = file.name.split(".").at(-1)?.toLowerCase();
      const mimeType = Object.hasOwn(CONST.IMAGE_FILE_EXTENSIONS, extension) && CONST.IMAGE_FILE_EXTENSIONS[extension];
      return mimeType && file.size ? {
        file: file.type === mimeType ? file : new File([file], file.name, { type: mimeType }),
        path: file.webkitRelativePath || file.name
      } : null;
    }).filter(Boolean).sort((a, b) => a.path.localeCompare(b.path));

    if (!packName.value.trim()) {
      const folder = images[0]?.path.split("/");
      if (folder?.length > 1) packName.value = folder[0];
    }
    rows = images.map(({ file, path }) => ({ file, path, previewUrl: URL.createObjectURL(file) }));
    preview.innerHTML = rows.map(row => `<li title="${escapeHtml(row.path)}">
      <img loading="lazy" src="${escapeHtml(row.previewUrl)}" alt="">
      <label>NPC Name
        <input type="text" required value="${escapeHtml(cleanFileName(row.file.name) || row.file.name.replace(/\.[^.]+$/, ""))}">
      </label>
      <label>Template Override
        <input type="text" list="${escapeHtml(datalist.id)}" placeholder="Use default template">
      </label>
      <small data-rg-npc-import-row-status></small>
    </li>`).join("");
    rows.forEach((row, index) => {
      const element = preview.children[index];
      [row.name, row.override] = element.querySelectorAll("input");
      row.status = element.querySelector("[data-rg-npc-import-row-status]");
      row.override.addEventListener("input", () => row.override.setCustomValidity(""));
    });
    create.disabled = rows.length === 0;
    const skipped = files.length - rows.length;
    status.textContent = `${rows.length} images ready for review.${skipped ? ` ${skipped} unsupported or empty files skipped.` : ""}`;
  });

  create.addEventListener("click", async () => {
    if (running || !game.user?.isGM || !rows.length) return;
    if (!defaultTemplate.reportValidity() || !packName.reportValidity()) return;
    const packLabel = packName.value.trim();
    if (!packLabel) {
      ui.notifications.warn("Realm Guard: Enter a name for the new compendium.");
      packName.focus();
      return;
    }

    const pending = rows.filter(row => !row.created);
    for (const row of pending) {
      if (!row.name.value.trim()) {
        ui.notifications.warn("Realm Guard: Enter a name for each NPC.");
        row.name.focus();
        return;
      }
      row.templateId = templates.get(row.override.value.trim() || defaultTemplate.value);
      if (!row.templateId) {
        row.override.setCustomValidity("Choose a template from the list or clear this field to use the default.");
        row.override.reportValidity();
        return;
      }
    }

    running = true;
    controls.disabled = true;
    try {
      if (!destination) {
        if (game.packs.some(existing => existing.title.toLowerCase() === packLabel.toLowerCase())) {
          throw new Error("A compendium with this name already exists. Choose another name.");
        }
        const collection = foundry.documents.collections.CompendiumCollection;
        destination = await collection.createCompendium({ label: packLabel, type: "Actor", package: "world" });
        if (!destination) throw new Error("Could not create the Actor Compendium.");
        folderInput.disabled = true;
        packName.disabled = true;
      }

      let createdCount = rows.length - pending.length;
      for (const row of pending) {
        status.textContent = `${createdCount} of ${rows.length} NPCs created.`;
        row.status.textContent = "Importing…";
        try {
          const template = await pack.getDocument(row.templateId);
          if (template?.type !== "npc") throw new Error("NPC template is unavailable.");
          row.imagePath ??= await uploadImage(row.file);
          const source = buildNpcSource(template, {
            packId: pack.collection, actorName: row.name.value, imagePath: row.imagePath
          });
          const actor = await Actor.implementation.create(source, { pack: destination.collection });
          if (!actor) throw new Error("NPC creation failed.");
          row.created = true;
          row.name.disabled = row.override.disabled = true;
          row.status.textContent = "Created";
          createdCount += 1;
        } catch (error) {
          row.status.textContent = error?.message || "Import failed.";
        }
      }

      const failed = rows.length - createdCount;
      status.textContent = `${createdCount} of ${rows.length} NPCs created in ${destination.title}.${failed ? ` Retry the ${failed} failed rows.` : ""}`;
      create.disabled = !failed;
      if (failed) create.textContent = "Retry Failed Rows";
      else ui.notifications.info(`Realm Guard: ${createdCount} NPCs added to ${destination.title}.`);
    } catch (error) {
      status.textContent = error?.message || "Could not import the image folder.";
    } finally {
      running = false;
      controls.disabled = false;
    }
  });
  return dialog;
}
