import { registerGmDockTool } from "./gm-dock.mjs";

const NS = "realm-guard";
const PACK_ID = "world.realm-guard-starter-npc-templates";
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

async function ensureNpcFolder() {
  let folder = game.folders?.find?.(f => f.type === "Actor" && String(f.name ?? "").toLowerCase() === "npc");
  if (!folder) folder = await Folder.create({ name: "NPC", type: "Actor", color: "#3f4b2f", flags: { [NS]: { npcTemplateFolder: true } } });
  return folder;
}

function cleanFileName(name = "") {
  const base = String(name).replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!base || /^img\s*\d+$/i.test(base) || /^image\s*\d*$/i.test(base)) return "";
  return base.replace(/\b\w/g, c => c.toUpperCase());
}

async function ensureNpcArtDirectory(picker) {
  const nested = "realm-guard/npc-art";
  const fallback = "realm-guard-npc-art";

  // Foundry does not create missing parent directories when asked for a nested path.
  // Create each level explicitly before uploading, then verify it when browse() is available.
  for (const dir of ["realm-guard", nested]) {
    try { await picker.createDirectory?.("data", dir, {}, { notify: false }); }
    catch (_error) { /* existing directory is expected on later drops */ }
  }
  if (picker.browse) {
    try { await picker.browse("data", nested, {}); return nested; }
    catch (_error) { /* use a flat fallback below */ }
  } else {
    return nested;
  }

  try { await picker.createDirectory?.("data", fallback, {}, { notify: false }); }
  catch (_error) { /* existing directory is expected on later drops */ }
  if (picker.browse) {
    try { await picker.browse("data", fallback, {}); return fallback; }
    catch (_error) { /* handled by caller */ }
  } else {
    return fallback;
  }
  throw new Error("Could not create an NPC art upload folder in Foundry Data.");
}

async function uploadNpcImage(file) {
  if (!file || !String(file.type || "").startsWith("image/")) throw new Error("Drop an image file (PNG, JPG, WEBP, SVG, etc.).");
  const picker = globalThis.FilePicker ?? foundry.applications?.apps?.FilePicker?.implementation;
  if (!picker?.upload) throw new Error("Foundry FilePicker upload API is unavailable in this client.");
  const dir = await ensureNpcArtDirectory(picker);
  const response = await picker.upload("data", dir, file, {}, { notify: false });
  const path = response?.path ?? response?.paths?.[0];
  if (!path) throw new Error("Image upload did not return a usable path.");
  return path;
}

export async function createNpcFromTemplate(templateId, { imageFile = null } = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Templates are GM only.");
  const pack = game.packs.get(PACK_ID);
  if (!pack) return ui.notifications.warn("Realm Guard: Starter NPC Templates compendium is missing. Run Starter Library sync first.");
  const template = await pack.getDocument(templateId);
  if (!template) return ui.notifications.warn("Realm Guard: NPC template not found.");
  let imagePath = null;
  if (imageFile) imagePath = await uploadNpcImage(imageFile);
  const folder = await ensureNpcFolder();
  const source = template.toObject();
  delete source._id; delete source.folder;
  source.folder = folder?.id ?? null;
  source.name = cleanFileName(imageFile?.name) || template.name;
  if (imagePath) {
    source.img = imagePath;
    source.prototypeToken = foundry.utils.mergeObject(source.prototypeToken ?? {}, {
      name: source.name,
      width: 1,
      height: 1,
      texture: { src: imagePath, fit: "contain", anchorX: 0.5, anchorY: 0.5, scaleX: 1, scaleY: 1 }
    }, { inplace: false });
  }
  source.flags = foundry.utils.deepClone(source.flags ?? {});
  source.flags[NS] = { ...(source.flags[NS] ?? {}), createdFromNpcTemplate: template.name };
  const actor = await Actor.create(source);
  if (!actor) throw new Error("NPC creation failed.");
  if (imagePath) {
    ui.notifications.info(`Realm Guard: Portrait loaded for ${actor.name}. Open Token Builder when you are ready to frame and save the round token.`);
  }
  ui.notifications.info(`Realm Guard: ${actor.name} created from ${template.name}.`);
  actor.sheet?.render(true);
  return actor;
}

export async function openNpcTemplateLibrary() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Templates are GM only.");
  const pack = game.packs.get(PACK_ID);
  if (!pack) return ui.notifications.warn("Realm Guard: Starter NPC Templates compendium is missing. Run Starter Library sync first.");
  const index = await pack.getIndex({ fields: ["img", "system.rank", "system.concept"] });
  const cards = index.map(entry => `<article class="rg-npc-template-card" data-rg-npc-template="${esc(entry._id)}"><img src="${esc(entry.img || "systems/realm-guard/assets/actors/npc-creature.webp")}" alt=""><div><h3>${esc(entry.name)}</h3><small>${esc(entry.system?.rank || "NPC")} · ${esc(entry.system?.concept || "Template")}</small><p>Drop an image from your computer here to create a new NPC with these stats and portrait. Use Token Builder when you are ready to frame the token.</p></div><button type="button" data-rg-template-create="${esc(entry._id)}"><i class="fa-solid fa-user-plus"></i> Create</button></article>`).join("");
  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · NPC Templates", resizable: true },
    content: `<div class="rg-npc-template-library"><div class="rg-brand">REALM GUARD / TORCHBEARER · GM</div><h2>NPC Templates & Quick Spawn</h2><p>Click Create for a normal copy, or drop an image file directly on a template to create the NPC with that portrait. The final round token is only created when you choose Save in Token Builder.</p><div class="rg-npc-template-grid">${cards}</div></div>`,
    modal: false,
    buttons: [{ action: "close", label: "Close", callback: () => true }]
  });
  await dialog.render(true);
  const root = dialog.element;
  root?.querySelectorAll?.("[data-rg-template-create]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); void createNpcFromTemplate(button.dataset.rgTemplateCreate); }));
  root?.querySelectorAll?.("[data-rg-npc-template]").forEach(card => {
    card.addEventListener("dragover", event => { if (event.dataTransfer?.types?.includes?.("Files")) { event.preventDefault(); card.classList.add("is-image-drop"); } });
    card.addEventListener("dragleave", () => card.classList.remove("is-image-drop"));
    card.addEventListener("drop", async event => {
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      event.preventDefault(); event.stopPropagation(); card.classList.remove("is-image-drop");
      try { await createNpcFromTemplate(card.dataset.rgNpcTemplate, { imageFile: file }); }
      catch (error) { console.error(`${NS} | NPC template image drop failed`, error); ui.notifications.error(`Realm Guard: ${error.message || "NPC template image drop failed."}`); }
    });
  });
  return dialog;
}

export function installNpcBuilder() {
  registerGmDockTool({ id: "npc-templates", icon: "fa-solid fa-people-group", tooltip: "NPC Templates & Quick Spawn", order: 6, onClick: openNpcTemplateLibrary });
}
