import { registerGmDockTool } from "./gm-dock.mjs";
import { modernFilePickerImplementation } from "./foundry-compat.mjs";
import { quickNpcMetadataFromIndex, scoreQuickNpcEntry, QUICK_NPC_LIBRARY_VERSION, QUICK_NPC_GROUP_LIBRARY_VERSION, QUICK_NPC_GROUP_TEMPLATE_SPECS } from "./quick-npc-library.mjs";

const NS = "realm-guard";
export const QUICK_NPC_PACK_ID = "world.realm-guard-starter-npc-templates";
const PACK_ID = QUICK_NPC_PACK_ID;
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

async function ensureNpcFolder({ name = "NPC", flagKey = "npcTemplateFolder" } = {}) {
  const folderName = String(name || "NPC").trim() || "NPC";
  const normalized = folderName.toLowerCase();
  let folder = game.folders?.find?.(f => f.type === "Actor" && String(f.name ?? "").trim().toLowerCase() === normalized);
  if (!folder) {
    const key = String(flagKey || "npcTemplateFolder").trim() || "npcTemplateFolder";
    folder = await Folder.create({
      name: folderName,
      type: "Actor",
      color: "#3f4b2f",
      flags: { [NS]: { [key]: true } }
    });
  }
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

export async function createNpcFromTemplate(templateId, { imageFile = null, canvasDrop = null, openSheet = true, actorName = "", folderName = "NPC", folderFlag = "npcTemplateFolder", folderId = "", onCreated = null, notify = true } = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Templates are GM only.");
  const pack = game.packs.get(PACK_ID);
  if (!pack) return ui.notifications.warn("Realm Guard: Quick NPC Library compendium is missing. Run Starter Library sync first.");
  const template = await pack.getDocument(templateId);
  if (!template) return ui.notifications.warn("Realm Guard: NPC template not found.");

  let imagePath = null;
  if (imageFile) imagePath = await uploadNpcImage(imageFile);

  const folder = folderId
    ? game.folders?.get?.(String(folderId))
    : await ensureNpcFolder({ name: folderName, flagKey: folderFlag });
  if (!folder || folder.type !== "Actor") throw new Error("Quick NPC destination Actor folder is unavailable.");
  const source = template.toObject();
  delete source._id;
  delete source.folder;
  source.folder = folder?.id ?? null;
  source.name = String(actorName || "").trim() || cleanFileName(imageFile?.name) || template.name;

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

  if (typeof onCreated === "function") await onCreated(actor, template);

  if (notify) {
    if (canvasDrop && token) {
      ui.notifications.info(`Realm Guard: ${actor.name} created from ${template.name} and placed on the Scene.`);
    } else {
      if (imagePath) ui.notifications.info(`Realm Guard: Portrait loaded for ${actor.name}. Open Token Builder when you are ready to frame and save the round token.`);
      ui.notifications.info(`Realm Guard: ${actor.name} created from ${template.name}.`);
    }
  }
  if (openSheet) actor.sheet?.render(true);
  return actor;
}

export async function quickNpcTemplateMatches({
  query = "",
  relationshipRole = "",
  preferredCompetence = "",
  limit = 20
} = {}) {
  const pack = game.packs.get(PACK_ID);
  if (!pack) throw new Error("Quick NPC Library compendium is missing. Run Starter Library sync first.");

  const index = await pack.getIndex({
    fields: [
      "img",
      "system.rank",
      "system.concept",
      "flags.realm-guard.npcTemplate"
    ]
  });

  const role = String(relationshipRole || "").trim().toUpperCase();
  const competence = String(preferredCompetence || "").trim().toLowerCase();
  const queries = [String(query || "").trim()];
  const tokens = String(query || "").trim().split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    queries.push(tokens.slice(0, -1).join(" "));
    queries.push(tokens[0]);
    queries.push(tokens[tokens.length - 1]);
  }
  queries.push("");

  const seen = new Map();
  for (let pass = 0; pass < queries.length; pass += 1) {
    const q = queries[pass];
    for (const entry of Array.from(index)) {
      const base = scoreQuickNpcEntry(entry, q, {});
      if (base < 0) continue;
      const meta = quickNpcMetadataFromIndex(entry);
      let score = base - (pass * 7);
      if (role && (meta.relationshipSuitability ?? []).map(value => String(value).toUpperCase()).includes(role)) score += 32;
      if (competence && String(meta.competence || "").toLowerCase() === competence) score += 24;
      const current = seen.get(entry._id);
      if (!current || score > current.score) seen.set(entry._id, { entry, score, query: q });
    }
    if (seen.size >= Math.max(6, Number(limit || 20))) break;
  }

  return [...seen.values()]
    .sort((a, b) => (b.score - a.score) || String(a.entry.name).localeCompare(String(b.entry.name)))
    .slice(0, Math.max(1, Number(limit || 20)));
}

export async function resolveBestQuickNpcTemplate(options = {}) {
  const matches = await quickNpcTemplateMatches({ ...options, limit: Math.max(6, Number(options.limit || 12)) });
  const best = matches[0] ?? null;
  if (!best) return null;
  const meta = quickNpcMetadataFromIndex(best.entry);
  return Object.freeze({
    id: best.entry._id,
    name: best.entry.name,
    img: best.entry.img || FALLBACK_IMG,
    score: best.score,
    query: best.query,
    metadata: meta
  });
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

function bindCardActions(root, createOptions = {}, { afterCreate = null } = {}) {
  const create = async (templateId, overrides = {}) => {
    try {
      const actor = await createNpcFromTemplate(templateId, { ...createOptions, ...overrides });
      if (actor && typeof afterCreate === "function") await afterCreate(actor);
      return actor;
    } catch (error) {
      console.error(`${NS} | Quick NPC creation failed`, error);
      ui.notifications.error(`Realm Guard: ${error?.message || "Quick NPC creation failed."}`);
      return null;
    }
  };

  root.querySelectorAll("[data-rg-template-create]").forEach(button => button.addEventListener("click", async event => {
    event.preventDefault();
    await create(button.dataset.rgTemplateCreate);
  }));

  root.querySelectorAll("[data-rg-npc-template]").forEach(card => {
    card.addEventListener("dblclick", async event => {
      if (event.target?.closest?.("button")) return;
      event.preventDefault();
      await create(card.dataset.rgNpcTemplate);
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
      await create(card.dataset.rgNpcTemplate, { imageFile: file });
    });
  });
}


function groupMemberLine(member) {
  const count = Math.max(1, Number(member?.count || 1));
  return `${count}× ${esc(member?.label || "NPC")} · ${esc(member?.competence || "Any")}`;
}

function groupTemplateCard(spec) {
  const total = (spec.members ?? []).reduce((sum, member) => sum + Math.max(1, Number(member?.count || 1)), 0);
  return `<article class="rg-npc-group-card" data-rg-npc-group="${esc(spec.id)}">
    <div class="rg-npc-group-card-head">
      <span>${esc(spec.category || "Group")}</span>
      <strong>${total} NPC${total === 1 ? "" : "s"}</strong>
    </div>
    <h3>${esc(spec.name)}</h3>
    <p>${esc(spec.concept || "Quick NPC group template")}</p>
    <div class="rg-npc-group-members">${(spec.members ?? []).map(member => `<small>${groupMemberLine(member)}</small>`).join("")}</div>
    <button type="button" data-rg-group-create="${esc(spec.id)}"><i class="fa-solid fa-people-group"></i> Review Group</button>
  </article>`;
}

function parentFolderId(folder) {
  return String(folder?.folder?.id ?? folder?.folder ?? "");
}

async function createNpcGroupFolder(groupName, groupInstanceId) {
  const parent = await ensureNpcFolder({ name: "NPCs Groups", flagKey: "npcGroupsFolder" });
  const base = String(groupName || "NPC Group").trim() || "NPC Group";
  const siblings = (game.folders?.contents ?? []).filter(folder =>
    folder.type === "Actor" && parentFolderId(folder) === String(parent.id)
  );
  const occupied = new Set(siblings.map(folder => String(folder.name ?? "").trim().toLowerCase()));
  let name = base;
  let suffix = 2;
  while (occupied.has(name.toLowerCase())) {
    name = `${base} (${suffix})`;
    suffix += 1;
  }
  return Folder.create({
    name,
    type: "Actor",
    folder: parent.id,
    color: "#4e5b38",
    flags: { [NS]: { npcGroupInstance: { id: groupInstanceId, name: base } } }
  });
}

async function resolveNpcGroupMembers(spec) {
  const resolved = [];
  for (const member of spec.members ?? []) {
    const suggestion = await resolveBestQuickNpcTemplate({
      query: member.query,
      preferredCompetence: member.competence,
      limit: 12
    });
    if (!suggestion) throw new Error(`No Quick NPC template matched ${member.label || member.query}.`);
    const count = Math.max(1, Number(member.count || 1));
    for (let index = 0; index < count; index += 1) {
      resolved.push(Object.freeze({
        label: String(member.label || suggestion.metadata?.occupation || suggestion.name).trim(),
        memberIndex: index + 1,
        memberCount: count,
        suggestion
      }));
    }
  }
  return resolved;
}

function resolvedGroupRows(entries) {
  return entries.map(entry => {
    const actorName = entry.memberCount > 1 ? `${entry.label} ${entry.memberIndex}` : entry.label;
    return `<div class="rg-npc-group-review-row">
      <span><b>${esc(actorName)}</b><small>${esc(entry.suggestion.metadata?.competence || "")}</small></span>
      <span><small>Template</small><b>${esc(entry.suggestion.name)}</b></span>
    </div>`;
  }).join("");
}

async function createNpcGroupFromTemplate(spec, { groupName = "" } = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Group Templates are GM only.");
  const resolved = await resolveNpcGroupMembers(spec);
  const instanceId = `npc-group-${foundry.utils.randomID(12)}`;
  const requestedName = String(groupName || spec.name || "NPC Group").trim() || "NPC Group";
  const folder = await createNpcGroupFolder(requestedName, instanceId);
  const created = [];

  for (const entry of resolved) {
    const actorName = entry.memberCount > 1 ? `${entry.label} ${entry.memberIndex}` : entry.label;
    try {
      const actor = await createNpcFromTemplate(entry.suggestion.id, {
        actorName,
        folderId: folder.id,
        openSheet: false,
        notify: false,
        onCreated: async createdActor => {
          await createdActor.setFlag?.(NS, "quickNpcGroup", {
            groupInstanceId: instanceId,
            groupTemplateId: spec.id,
            groupTemplateName: spec.name,
            groupName: folder.name,
            memberRole: entry.label,
            memberIndex: entry.memberIndex,
            memberCount: entry.memberCount,
            sourceTemplateId: entry.suggestion.metadata?.templateId || "",
            sourceTemplateName: entry.suggestion.name
          });
        }
      });
      if (actor) created.push(actor);
    } catch (error) {
      console.error(`${NS} | Quick NPC Group member creation failed`, error);
      ui.notifications.error(`Realm Guard: Could not create ${actorName}. ${error?.message || ""}`);
    }
  }

  if (created.length) {
    ui.notifications.info(`Realm Guard: Created ${folder.name} with ${created.length} NPC${created.length === 1 ? "" : "s"} in Actors > NPCs Groups.`);
  }
  if (created.length !== resolved.length) {
    ui.notifications.warn(`Realm Guard: ${folder.name} is incomplete (${created.length}/${resolved.length} NPCs created).`);
  }
  return Object.freeze({ folder, actors: Object.freeze(created), requested: resolved.length });
}

async function reviewNpcGroupTemplate(spec) {
  const resolved = await resolveNpcGroupMembers(spec);
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · ${spec.name}`, resizable: true },
    position: { width: 760, height: 650 },
    content: `<form class="realm-guard rg-npc-group-review">
      <div class="rg-brand">REALM GUARD / TORCHBEARER · GM</div>
      <h2>${esc(spec.name)}</h2>
      <p>${esc(spec.concept || "")}</p>
      <label class="rg-npc-group-name"><span>Group Name</span><input type="text" name="groupName" value="${esc(spec.name)}"></label>
      <div class="rg-npc-group-review-list">${resolvedGroupRows(resolved)}</div>
      <p class="rg-npc-group-destination"><i class="fa-solid fa-folder-tree"></i> Creates a dedicated subfolder inside <b>Actors &gt; NPCs Groups</b>. NPCs are normal editable Actor copies and are not linked back to the templates.</p>
    </form>`,
    modal: false,
    rejectClose: false,
    buttons: [
      {
        action: "create",
        label: "Create Group",
        icon: "fa-solid fa-people-group",
        default: true,
        callback: (_event, button) => ({ action: "create", groupName: String(button.form?.elements?.groupName?.value || spec.name).trim() || spec.name })
      },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!choice || choice.action !== "create") return null;
  return createNpcGroupFromTemplate(spec, { groupName: choice.groupName });
}

export async function openNpcGroupTemplateLibrary() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: NPC Group Templates are GM only.");
  const cards = QUICK_NPC_GROUP_TEMPLATE_SPECS.map(groupTemplateCard).join("");
  const dialog = new foundry.applications.api.DialogV2({
    window: { title: "Realm Guard · NPC Group Templates", resizable: true },
    position: { width: 920, height: 760 },
    content: `<div class="realm-guard rg-npc-group-library">
      <div class="rg-brand">REALM GUARD / TORCHBEARER · GM</div>
      <div class="rg-quick-npc-heading">
        <div><h2>NPC Group Templates <span>v${esc(QUICK_NPC_GROUP_LIBRARY_VERSION)}</span></h2><p>Choose a ready-made group, review the resolved Quick NPC templates, name the group, then create it explicitly.</p></div>
        <strong>${QUICK_NPC_GROUP_TEMPLATE_SPECS.length} groups</strong>
      </div>
      <div class="rg-npc-group-grid">${cards}</div>
    </div>`,
    modal: false,
    buttons: [{ action: "close", label: "Close", callback: () => true }]
  });
  await dialog.render(true);
  const root = dialog.element;
  root?.querySelectorAll?.("[data-rg-group-create]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const spec = QUICK_NPC_GROUP_TEMPLATE_SPECS.find(entry => entry.id === button.dataset.rgGroupCreate);
      if (!spec) return;
      void reviewNpcGroupTemplate(spec).catch(error => {
        console.error(`${NS} | NPC Group Template failed`, error);
        ui.notifications.error(`Realm Guard: ${error?.message || "Could not create NPC group."}`);
      });
    });
  });
  return dialog;
}

export async function openNpcTemplateLibrary({ initialQuery = "", imageFile = null, canvasDrop = null, actorName = "", folderName = "NPC", folderFlag = "npcTemplateFolder", onCreated = null, closeAfterCreate = false, selectOnly = false, onTemplateSelected = null } = {}) {
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
        <div><h2>Quick NPC Library <span>v${esc(QUICK_NPC_LIBRARY_VERSION)}</span></h2><p>${selectOnly ? "Choose a different template for this relationship NPC. Nothing is created until you confirm the Recruitment review." : canvasSpawn ? "Search and choose a template. Double-click a result to create the NPC and place its token at the image drop point." : "Search, choose, BAM — a complete editable NPC Actor. Double-click a result for instant creation or drop a local image onto it."}</p></div>
        ${!selectOnly && !canvasSpawn ? `<button type="button" class="rg-open-group-templates" data-rg-open-group-templates><i class="fa-solid fa-people-group"></i> Group Templates</button>` : ""}
        <strong data-rg-result-count>${entries.length} templates</strong>
      </div>
      <div class="rg-quick-npc-search">
        <label class="rg-quick-npc-query"><i class="fa-solid fa-magnifying-glass"></i><input type="search" data-rg-npc-search value="${esc(initialQuery)}" placeholder="Try: bartender, healer bree, old ranger, big orc..."></label>
        <select data-rg-npc-category>${optionList(categories, "categories")}</select>
        <select data-rg-npc-culture>${optionList(cultures, "cultures")}</select>
        <select data-rg-npc-competence>${optionList(competence, "competence")}</select>
        <button type="button" data-rg-npc-clear><i class="fa-solid fa-eraser"></i> Clear</button>
      </div>
      <div class="rg-quick-npc-help">${selectOnly ? `<span><i class="fa-solid fa-check"></i> Select = use this template suggestion</span><span><i class="fa-solid fa-shield-halved"></i> No NPC is created in this picker</span>` : `<span><i class="fa-solid fa-bolt"></i> Create = normal editable Actor</span><span><i class="fa-solid fa-image"></i> Drop local image = same template + portrait</span><span><i class="fa-solid fa-copy"></i> Template never stays linked to the created Actor</span>`}</div>
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

  root.querySelector("[data-rg-open-group-templates]")?.addEventListener("click", event => {
    event.preventDefault();
    void openNpcGroupTemplateLibrary();
  });

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
    if (selectOnly) {
      const byId = new Map(entries.map(entry => [String(entry._id), entry]));
      results.querySelectorAll("[data-rg-template-create]").forEach(button => {
        button.innerHTML = '<i class="fa-solid fa-check"></i> Select';
        button.addEventListener("click", async event => {
          event.preventDefault();
          const entry = byId.get(String(button.dataset.rgTemplateCreate || ""));
          if (!entry) return;
          if (typeof onTemplateSelected === "function") await onTemplateSelected(entry, quickNpcMetadataFromIndex(entry));
          await dialog.close();
        });
      });
      results.querySelectorAll("[data-rg-npc-template]").forEach(card => {
        card.querySelector(".rg-npc-template-actions small")?.remove();
        card.addEventListener("dblclick", async event => {
          if (event.target?.closest?.("button")) return;
          event.preventDefault();
          const entry = byId.get(String(card.dataset.rgNpcTemplate || ""));
          if (!entry) return;
          if (typeof onTemplateSelected === "function") await onTemplateSelected(entry, quickNpcMetadataFromIndex(entry));
          await dialog.close();
        });
      });
    } else {
      const createOptions = {
        actorName,
        folderName,
        folderFlag,
        onCreated,
        ...(canvasSpawn ? { imageFile, canvasDrop, openSheet: false } : {})
      };
      bindCardActions(results, createOptions, {
        afterCreate: async actor => {
          if (actor && closeAfterCreate) await dialog.close();
        }
      });
    }

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

function installQuickNpcPublicApi() {
  Hooks.once("ready", () => {
    globalThis.game.realmGuard ??= {};
    const api = Object.freeze({
      contract: "realm-guard-quick-npc-provider",
      version: 1,
      libraryVersion: QUICK_NPC_LIBRARY_VERSION,
      groupLibraryVersion: QUICK_NPC_GROUP_LIBRARY_VERSION,
      capabilities: Object.freeze([
        "openLibrary",
        "openGroups",
        "createFromTemplate",
        "matches",
        "resolveBestTemplate"
      ]),
      open: options => openNpcTemplateLibrary(options),
      openGroups: () => openNpcGroupTemplateLibrary(),
      createFromTemplate: (templateId, options = {}) => createNpcFromTemplate(templateId, options),
      matches: options => quickNpcTemplateMatches(options),
      resolveBestTemplate: options => resolveBestQuickNpcTemplate(options)
    });

    globalThis.game.realmGuard.quickNpc = api;
    try {
      Hooks.callAll("realmGuardQuickNpcProviderReady", Object.freeze({
        contract: api.contract,
        version: api.version,
        libraryVersion: api.libraryVersion,
        groupLibraryVersion: api.groupLibraryVersion,
        capabilities: api.capabilities
      }));
    } catch (_error) {}

    console.info("realm-guard | Quick NPC provider API ready", {
      contract: api.contract,
      version: api.version,
      libraryVersion: api.libraryVersion,
      groupLibraryVersion: api.groupLibraryVersion
    });
  });
}

export function installNpcBuilder() {
  installQuickNpcPublicApi();

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
