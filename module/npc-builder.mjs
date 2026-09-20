import { registerGmDockTool } from "./gm-dock.mjs";
import { modernFilePickerImplementation } from "./foundry-compat.mjs";
import { quickNpcMetadataFromIndex, scoreQuickNpcEntry, QUICK_NPC_LIBRARY_VERSION } from "./quick-npc-library.mjs";

const NS = "realm-guard";
const PACK_ID = "world.realm-guard-starter-npc-templates";
const FALLBACK_IMG = "systems/realm-guard/assets/actors/npc-creature.webp";
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

let boundCanvasElement = null;
let canvasDragOverHandler = null;
let canvasDragLeaveHandler = null;
let canvasDropHandler = null;

function isImageFile(file) {
  return Boolean(file && String(file.type || "").startsWith("image/"));
}

function currentCanvasElement() {
  const element = canvas?.app?.canvas ?? canvas?.app?.view ?? null;
  return element instanceof HTMLElement ? element : null;
}

function canvasDropPoint(event) {
  if (!canvas?.ready || !canvas?.scene || typeof canvas.canvasCoordinatesFromClient !== "function") return null;
  const point = canvas.canvasCoordinatesFromClient({ x: Number(event.clientX), y: Number(event.clientY) });
  if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return null;
  return Object.freeze({ sceneId: canvas.scene.id, x: point.x, y: point.y });
}

async function placeNpcToken(actor, drop) {
  if (!actor || !drop?.sceneId) return null;
  const scene = game.scenes?.get?.(drop.sceneId);
  if (!scene) throw new Error("The Scene used for the NPC image drop is no longer available.");

  const token = await actor.getTokenDocument();
  const tokenSource = token.toObject();
  const gridSize = Math.max(1, Number(scene.grid?.size ?? canvas?.dimensions?.size ?? 100));
  const width = Math.max(1, Number(tokenSource.width ?? 1));
  const height = Math.max(1, Number(tokenSource.height ?? 1));

  // The OS image is dropped at the intended token center. Foundry stores token x/y
  // as its top-left position, so center the generated token on that exact canvas point.
  tokenSource.x = Math.round(Number(drop.x) - (width * gridSize / 2));
  tokenSource.y = Math.round(Number(drop.y) - (height * gridSize / 2));
  tokenSource.name = actor.name;

  const created = await scene.createEmbeddedDocuments("Token", [tokenSource], {
    realmGuardQuickNpcCanvasDrop: true
  });
  return created?.[0] ?? null;
}

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
  for (const dir of ["realm-guard", nested]) {
    try { await picker.createDirectory?.("data", dir, {}, { notify: false }); }
    catch (_error) { /* existing directory is expected */ }
  }
  if (picker.browse) {
    try { await picker.browse("data", nested, {}); return nested; }
    catch (_error) { /* fallback below */ }
  } else return nested;

  try { await picker.createDirectory?.("data", fallback, {}, { notify: false }); }
  catch (_error) { /* existing directory is expected */ }
  if (picker.browse) {
    try { await picker.browse("data", fallback, {}); return fallback; }
    catch (_error) { /* handled below */ }
  } else return fallback;
  throw new Error("Could not create an NPC art upload folder in Foundry Data.");
}

async function uploadNpcImage(file) {
  if (!file || !String(file.type || "").startsWith("image/")) throw new Error("Drop an image file (PNG, JPG, WEBP, SVG, etc.).");
  const picker = modernFilePickerImplementation();
  if (!picker?.upload) throw new Error("Foundry FilePicker upload API is unavailable in this client.");
  const dir = await ensureNpcArtDirectory(picker);
  const response = await picker.upload("data", dir, file, {}, { notify: false });
  const path = response?.path ?? response?.paths?.[0];
  if (!path) throw new Error("Image upload did not return a usable path.");
  return path;
}

export async function createNpcFromTemplate(templateId, { imageFile = null, canvasDrop = null, openSheet = true } = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Templates are GM only.");
  const pack = game.packs.get(PACK_ID);
  if (!pack) return ui.notifications.warn("Realm Guard: Quick NPC Library compendium is missing. Run Starter Library sync first.");
  const template = await pack.getDocument(templateId);
  if (!template) return ui.notifications.warn("Realm Guard: NPC template not found.");

  let imagePath = null;
  if (imageFile) imagePath = await uploadNpcImage(imageFile);

  const folder = await ensureNpcFolder();
  const source = template.toObject();
  delete source._id;
  delete source.folder;
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
  source.flags[NS] = {
    ...(source.flags[NS] ?? {}),
    createdFromNpcTemplate: template.name,
    createdFromNpcTemplateId: template.getFlag?.(NS, "npcTemplate.templateId") ?? ""
  };

  const actor = await Actor.create(source);
  if (!actor) throw new Error("NPC creation failed.");

  let token = null;
  if (canvasDrop) token = await placeNpcToken(actor, canvasDrop);

  if (canvasDrop && token) {
    ui.notifications.info(`Realm Guard: ${actor.name} created from ${template.name} and placed on the Scene.`);
  } else {
    if (imagePath) ui.notifications.info(`Realm Guard: Portrait loaded for ${actor.name}. Open Token Builder when you are ready to frame and save the round token.`);
    ui.notifications.info(`Realm Guard: ${actor.name} created from ${template.name}.`);
  }
  if (openSheet) actor.sheet?.render(true);
  return actor;
}

function optionList(values, label) {
  const sorted = [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  return `<option value="">All ${esc(label)}</option>${sorted.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("")}`;
}

function templateCard(entry) {
  const meta = quickNpcMetadataFromIndex(entry);
  const badges = [meta.culture, meta.competence, meta.threat].filter(Boolean)
    .map(value => `<span>${esc(value)}</span>`).join("");
  const relationships = (meta.relationshipSuitability ?? []).slice(0, 4).map(value => String(value).replaceAll("_", " ").toLowerCase()).join(" · ");
  return `<article class="rg-npc-template-card" data-rg-npc-template="${esc(entry._id)}">
    <img src="${esc(entry.img || FALLBACK_IMG)}" alt="">
    <div class="rg-npc-template-copy">
      <div class="rg-npc-template-badges">${badges}</div>
      <h3>${esc(entry.name)}</h3>
      <small>${esc(meta.category || "NPC")}${meta.subcategory ? ` · ${esc(meta.subcategory)}` : ""}</small>
      <p>${esc(entry.system?.concept || "Quick NPC template")}</p>
      ${relationships ? `<div class="rg-npc-template-relations"><i class="fa-solid fa-link"></i> ${esc(relationships)}</div>` : ""}
    </div>
    <div class="rg-npc-template-actions">
      <button type="button" data-rg-template-create="${esc(entry._id)}"><i class="fa-solid fa-user-plus"></i> Create</button>
      <small>Drop image here</small>
    </div>
  </article>`;
}

function bindCardActions(root, createOptions = {}) {
  root.querySelectorAll("[data-rg-template-create]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    void createNpcFromTemplate(button.dataset.rgTemplateCreate, createOptions);
  }));

  root.querySelectorAll("[data-rg-npc-template]").forEach(card => {
    card.addEventListener("dblclick", event => {
      if (event.target?.closest?.("button")) return;
      event.preventDefault();
      void createNpcFromTemplate(card.dataset.rgNpcTemplate, createOptions);
    });
    card.addEventListener("dragover", event => {
      if (!event.dataTransfer?.types?.includes?.("Files")) return;
      event.preventDefault();
      card.classList.add("is-image-drop");
    });
    card.addEventListener("dragleave", event => {
      if (!card.contains(event.relatedTarget)) card.classList.remove("is-image-drop");
    });
    card.addEventListener("drop", async event => {
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      event.preventDefault();
      event.stopPropagation();
      card.classList.remove("is-image-drop");
      try {
        await createNpcFromTemplate(card.dataset.rgNpcTemplate, { ...createOptions, imageFile: file });
      } catch (error) {
        console.error(`${NS} | NPC template image drop failed`, error);
        ui.notifications.error(`Realm Guard: ${error.message || "NPC template image drop failed."}`);
      }
    });
  });
}

export async function openNpcTemplateLibrary({ initialQuery = "", imageFile = null, canvasDrop = null } = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Templates are GM only.");
  const pack = game.packs.get(PACK_ID);
  if (!pack) return ui.notifications.warn("Realm Guard: Quick NPC Library compendium is missing. Run Starter Library sync first.");

  const index = await pack.getIndex({
    fields: [
      "img",
      "system.rank",
      "system.concept",
      "flags.realm-guard.npcTemplate"
    ]
  });

  const entries = Array.from(index);
  const metadata = entries.map(entry => quickNpcMetadataFromIndex(entry));
  const categories = metadata.map(meta => meta.category);
  const cultures = metadata.map(meta => meta.culture);
  const competence = metadata.map(meta => meta.competence);

  const canvasSpawn = Boolean(imageFile && canvasDrop);
  const previewUrl = canvasSpawn ? URL.createObjectURL(imageFile) : "";
  const canvasPreview = canvasSpawn ? `<div class="rg-quick-npc-canvas-preview">
    <img src="${esc(previewUrl)}" alt="">
    <div><strong>Create NPC from dropped image</strong><span>${esc(cleanFileName(imageFile.name) || imageFile.name || "Local image")}</span><small>Choose a template below. The finished token will be placed where you dropped the image.</small></div>
  </div>` : "";

  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · Quick NPC Library", resizable: true },
    position: { width: 920, height: 760 },
    content: `<div class="rg-npc-template-library rg-quick-npc-library">
      <div class="rg-brand">REALM GUARD / TORCHBEARER · GM</div>
      ${canvasPreview}
      <div class="rg-quick-npc-heading">
        <div><h2>Quick NPC Library <span>v${esc(QUICK_NPC_LIBRARY_VERSION)}</span></h2><p>${canvasSpawn ? "Search and choose a template. Double-click a result to create the NPC and place its token at the image drop point." : "Search, choose, BAM — a complete editable NPC Actor. Double-click a result for instant creation or drop a local image onto it."}</p></div>
        <strong data-rg-result-count>${entries.length} templates</strong>
      </div>
      <div class="rg-quick-npc-search">
        <label class="rg-quick-npc-query"><i class="fa-solid fa-magnifying-glass"></i><input type="search" data-rg-npc-search value="${esc(initialQuery)}" placeholder="Try: bartender, healer bree, old ranger, big orc..."></label>
        <select data-rg-npc-category>${optionList(categories, "categories")}</select>
        <select data-rg-npc-culture>${optionList(cultures, "cultures")}</select>
        <select data-rg-npc-competence>${optionList(competence, "competence")}</select>
        <button type="button" data-rg-npc-clear><i class="fa-solid fa-eraser"></i> Clear</button>
      </div>
      <div class="rg-quick-npc-help"><span><i class="fa-solid fa-bolt"></i> Create = normal editable Actor</span><span><i class="fa-solid fa-image"></i> Drop local image = same template + portrait</span><span><i class="fa-solid fa-copy"></i> Template never stays linked to the created Actor</span></div>
      <div class="rg-npc-template-grid" data-rg-npc-results></div>
      <div class="rg-quick-npc-empty" data-rg-npc-empty hidden><i class="fa-solid fa-magnifying-glass"></i><p>No NPC templates match this search.</p><small>Try a synonym, culture, occupation or broader term.</small></div>
    </div>`,
    modal: false,
    buttons: [{ action: "close", label: "Close", callback: () => true }]
  });

  await dialog.render(true);
  const root = dialog.element;
  if (!root) return dialog;

  const queryInput = root.querySelector("[data-rg-npc-search]");
  const category = root.querySelector("[data-rg-npc-category]");
  const culture = root.querySelector("[data-rg-npc-culture]");
  const competenceSelect = root.querySelector("[data-rg-npc-competence]");
  const results = root.querySelector("[data-rg-npc-results]");
  const count = root.querySelector("[data-rg-result-count]");
  const empty = root.querySelector("[data-rg-npc-empty]");

  const renderResults = () => {
    const filters = {
      category: category?.value ?? "",
      culture: culture?.value ?? "",
      competence: competenceSelect?.value ?? ""
    };
    const query = queryInput?.value ?? "";
    const matches = entries
      .map(entry => ({ entry, score: scoreQuickNpcEntry(entry, query, filters) }))
      .filter(result => result.score >= 0)
      .sort((a, b) => (b.score - a.score) || String(a.entry.name).localeCompare(String(b.entry.name)));

    const visible = matches.slice(0, 120);
    results.innerHTML = visible.map(result => templateCard(result.entry)).join("");
    count.textContent = matches.length === entries.length ? `${matches.length} templates` : `${matches.length} / ${entries.length}`;
    empty.hidden = matches.length > 0;
    results.hidden = matches.length === 0;
    bindCardActions(results, canvasSpawn ? { imageFile, canvasDrop, openSheet: false } : {});

    if (matches.length > visible.length) {
      const note = document.createElement("div");
      note.className = "rg-quick-npc-more";
      note.textContent = `Showing the first ${visible.length} matches. Refine the search to narrow ${matches.length} results.`;
      results.append(note);
    }
  };

  queryInput?.addEventListener("input", renderResults);
  category?.addEventListener("change", renderResults);
  culture?.addEventListener("change", renderResults);
  competenceSelect?.addEventListener("change", renderResults);
  root.querySelector("[data-rg-npc-clear]")?.addEventListener("click", () => {
    if (queryInput) queryInput.value = "";
    if (category) category.value = "";
    if (culture) culture.value = "";
    if (competenceSelect) competenceSelect.value = "";
    renderResults();
    queryInput?.focus();
  });

  renderResults();
  queueMicrotask(() => {
    queryInput?.focus();
    if (initialQuery) queryInput?.select();
  });

  return dialog;
}

function unbindCanvasImageDrop() {
  if (!boundCanvasElement) return;
  if (canvasDragOverHandler) boundCanvasElement.removeEventListener("dragover", canvasDragOverHandler, true);
  if (canvasDragLeaveHandler) boundCanvasElement.removeEventListener("dragleave", canvasDragLeaveHandler, true);
  if (canvasDropHandler) boundCanvasElement.removeEventListener("drop", canvasDropHandler, true);
  boundCanvasElement.classList.remove("rg-quick-npc-canvas-image-drop");
  boundCanvasElement = null;
  canvasDragOverHandler = null;
  canvasDragLeaveHandler = null;
  canvasDropHandler = null;
}

function bindCanvasImageDrop() {
  unbindCanvasImageDrop();
  if (!game.user?.isGM || !canvas?.ready || !canvas?.scene) return;

  const element = currentCanvasElement();
  if (!element) return;
  boundCanvasElement = element;

  canvasDragOverHandler = event => {
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (!files.some(isImageFile) && !event.dataTransfer?.types?.includes?.("Files")) return;
    event.preventDefault();
    event.stopPropagation();
    element.classList.add("rg-quick-npc-canvas-image-drop");
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };

  canvasDragLeaveHandler = event => {
    if (!element.contains(event.relatedTarget)) element.classList.remove("rg-quick-npc-canvas-image-drop");
  };

  canvasDropHandler = event => {
    const file = Array.from(event.dataTransfer?.files ?? []).find(isImageFile);
    if (!file) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    element.classList.remove("rg-quick-npc-canvas-image-drop");

    const drop = canvasDropPoint(event);
    if (!drop) return ui.notifications.warn("Realm Guard: Could not resolve the image drop position on the active Scene.");

    void openNpcTemplateLibrary({ imageFile: file, canvasDrop: drop }).catch(error => {
      console.error(`${NS} | Canvas Quick NPC image drop failed`, error);
      ui.notifications.error(`Realm Guard: ${error?.message || "Could not open Quick NPC from the dropped image."}`);
    });
  };

  element.addEventListener("dragover", canvasDragOverHandler, true);
  element.addEventListener("dragleave", canvasDragLeaveHandler, true);
  element.addEventListener("drop", canvasDropHandler, true);
}

export function installNpcBuilder() {
  registerGmDockTool({
    id: "npc-templates",
    icon: "fa-solid fa-people-group",
    tooltip: "Quick NPC Library",
    order: 6,
    onClick: () => openNpcTemplateLibrary()
  });

  Hooks.on("canvasReady", () => bindCanvasImageDrop());
  Hooks.on("canvasTearDown", () => unbindCanvasImageDrop());
  Hooks.once("ready", () => {
    if (canvas?.ready) bindCanvasImageDrop();
  });
}
