const NS = "realm-guard";
const FIGURE_FLAG = "equipmentFigure";
const ASSET_ROOT = "systems/realm-guard/assets/ui/silhouettes";
const FIGURE_MODES = Object.freeze(["custom", "ancestry"]);
const DEFAULT_CUSTOM_FIGURE = `${ASSET_ROOT}/neutral.svg`;

export const EQUIPMENT_SILHOUETTES = Object.freeze({
  neutral: Object.freeze({ key: "neutral", label: "Neutral Humanoid", src: `${ASSET_ROOT}/neutral.svg` }),
  dunadan: Object.freeze({ key: "dunadan", label: "Dúnadan", src: `${ASSET_ROOT}/dunadan.svg` }),
  human: Object.freeze({ key: "human", label: "Human", src: `${ASSET_ROOT}/human.svg` }),
  dwarf: Object.freeze({ key: "dwarf", label: "Dwarf", src: `${ASSET_ROOT}/dwarf.svg` }),
  elf: Object.freeze({ key: "elf", label: "Elf", src: `${ASSET_ROOT}/elf.svg` }),
  halfling: Object.freeze({ key: "halfling", label: "Halfling / Hobbit", src: `${ASSET_ROOT}/halfling.svg` })
});

const ALIASES = Object.freeze({
  neutral: "neutral", generic: "neutral", humanoid: "neutral",
  human: "human", humans: "human", man: "human", men: "human",
  dunadan: "dunadan", dunedain: "dunadan", numenorean: "dunadan", numenoreans: "dunadan",
  dwarf: "dwarf", dwarves: "dwarf", dwarven: "dwarf",
  elf: "elf", elves: "elf", elven: "elf", eldar: "elf",
  hobbit: "halfling", hobbits: "halfling", halfling: "halfling", halflings: "halfling"
});

function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value ?? 0))); }
function fold(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function esc(value) {
  const text = String(value ?? "");
  return globalThis.foundry?.utils?.escapeHTML ? foundry.utils.escapeHTML(text) : text.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

export function normalizeEquipmentAncestry(value) {
  const folded = fold(value);
  if (!folded) return "neutral";
  if (ALIASES[folded]) return ALIASES[folded];
  for (const token of folded.split(/\s+/)) if (ALIASES[token]) return ALIASES[token];
  return "neutral";
}

export function resolveEquipmentSilhouette(value) {
  const requested = String(value ?? "").trim();
  const key = normalizeEquipmentAncestry(requested);
  const entry = EQUIPMENT_SILHOUETTES[key] ?? EQUIPMENT_SILHOUETTES.neutral;
  return Object.freeze({ ...entry, requested, fallback: key === "neutral" && fold(requested) !== "neutral" && Boolean(requested) });
}

export function equipmentAncestryForActor(actor) {
  const explicit = String(actor?.system?.ancestry ?? "").trim();
  if (explicit) return explicit;
  const legacyLineage = String(actor?.system?.lineage ?? "").trim();
  return normalizeEquipmentAncestry(legacyLineage) !== "neutral" ? legacyLineage : "";
}

export function equipmentSilhouetteForActor(actor) {
  return resolveEquipmentSilhouette(equipmentAncestryForActor(actor));
}

export function equipmentFigurePreferences(actor) {
  const raw = actor?.getFlag?.(NS, FIGURE_FLAG) ?? {};
  const oldMode = String(raw?.mode ?? "custom").toLowerCase();
  const mode = oldMode === "ancestry" ? "ancestry" : "custom";
  return Object.freeze({
    mode,
    customSrc: String(raw?.customSrc ?? "").trim(),
    fit: String(raw?.fit ?? "contain") === "cover" ? "cover" : "contain",
    zoom: clamp(raw?.zoom ?? 1, 0.5, 2.5),
    offsetX: clamp(raw?.offsetX ?? 0, -40, 40),
    offsetY: clamp(raw?.offsetY ?? 0, -40, 40)
  });
}

export function characterArtForEquipment(_actor) {
  return "";
}

export function resolveEquipmentFigure(actor) {
  const preferences = equipmentFigurePreferences(actor);
  const ancestry = equipmentSilhouetteForActor(actor);
  if (preferences.mode === "ancestry") {
    return Object.freeze({
      mode: "ancestry",
      sourceType: "ancestry",
      src: ancestry.src,
      label: ancestry.label,
      ancestry,
      preferences,
      hasCustom: Boolean(preferences.customSrc),
      fallbackReason: ancestry.fallback ? "UNKNOWN_ANCESTRY" : null,
      inventoryRulesChanged: false
    });
  }

  return Object.freeze({
    mode: "custom",
    sourceType: preferences.customSrc ? "custom" : "default-custom",
    src: preferences.customSrc || DEFAULT_CUSTOM_FIGURE,
    label: preferences.customSrc ? "Custom Equipment Figure" : "Default Custom Figure",
    ancestry,
    preferences,
    hasCustom: Boolean(preferences.customSrc),
    fallbackReason: preferences.customSrc ? null : "DEFAULT_CUSTOM_FIGURE",
    inventoryRulesChanged: false
  });
}

function ancestryChoices() {
  return [
    { value: "Dúnadan", label: "Dúnadan" },
    { value: "Human", label: "Human" },
    { value: "Elf", label: "Elf" },
    { value: "Dwarf", label: "Dwarf" },
    { value: "Halfling", label: "Halfling / Hobbit" },
    { value: "Neutral", label: "Neutral Humanoid" }
  ];
}

async function saveFigurePreferences(actor, patch = {}) {
  const current = equipmentFigurePreferences(actor);
  const next = {
    mode: patch.mode === "ancestry" ? "ancestry" : patch.mode === "custom" ? "custom" : current.mode,
    customSrc: patch.customSrc ?? current.customSrc,
    fit: patch.fit ?? current.fit,
    zoom: clamp(patch.zoom ?? current.zoom, 0.5, 2.5),
    offsetX: clamp(patch.offsetX ?? current.offsetX, -40, 40),
    offsetY: clamp(patch.offsetY ?? current.offsetY, -40, 40)
  };
  await actor.update({ [`flags.${NS}.${FIGURE_FLAG}`]: next });
  return next;
}

function applyFigureImage(image, resolved) {
  if (!image || !resolved) return;
  image.src = resolved.src;
  image.alt = `${resolved.label} equipment figure`;
  image.removeAttribute("aria-hidden");
  image.dataset.rgFigureSource = resolved.sourceType;
  image.dataset.rgSilhouetteKey = resolved.ancestry.key;
  image.dataset.rgSilhouetteFallback = String(resolved.ancestry.fallback);
  image.classList.toggle("is-character-art", false);
  image.classList.toggle("is-custom-art", resolved.mode === "custom");
  image.classList.toggle("is-ancestry-art", resolved.mode === "ancestry");

  if (resolved.mode === "custom") {
    const framing = resolved.preferences;
    image.style.objectFit = framing.fit;
    image.style.left = `calc(50% + ${framing.offsetX}%)`;
    image.style.top = `calc(51% + ${framing.offsetY}%)`;
    image.style.transform = `translate(-50%, -50%) scale(${framing.zoom})`;
  } else {
    image.style.objectFit = "contain";
    image.style.left = "50%";
    image.style.top = "51%";
    image.style.transform = "translate(-50%, -50%)";
  }
}

function resolvedCopy(resolved) {
  if (resolved.mode === "custom") {
    if (resolved.sourceType === "custom") return `<i class="fa-solid fa-image"></i><span><b>Custom Figure</b> · own image</span>`;
    return `<i class="fa-solid fa-person"></i><span><b>Custom Figure</b> · built-in gray humanoid</span>`;
  }
  if (resolved.ancestry.fallback) return `<i class="fa-solid fa-person"></i><span>Unknown ancestry → <b>Neutral Humanoid</b></span>`;
  return `<i class="fa-solid fa-person"></i><span><b>${esc(resolved.ancestry.label)}</b> ancestry figure</span>`;
}

function figureSettingsContent(actor) {
  const prefs = equipmentFigurePreferences(actor);
  const ancestry = equipmentSilhouetteForActor(actor);
  const modeNote = prefs.mode === "custom"
    ? `These settings affect the active <b>Custom Figure</b>. Leave the image path empty to use the built-in gray humanoid.`
    : `These settings are stored for <b>Custom Figure</b>. Current Ancestry Figure is <b>${esc(ancestry.label)}</b> and keeps its fixed ancestry framing.`;
  return `<div class="rg-equipment-figure-settings-dialog">
    <header>
      <div class="rg-equipment-figure-settings-kicker"><i class="fa-solid fa-gear"></i> Equipment Figure</div>
      <h2>Figure Settings</h2>
      <p>${modeNote}</p>
    </header>
    <div class="rg-equipment-figure-settings-grid">
      <label class="rg-equipment-figure-settings-wide"><span>Custom image path · optional</span><input type="text" name="customSrc" value="${esc(prefs.customSrc)}" placeholder="Leave empty for built-in gray figure"></label>
      <label><span>Fit</span><select name="fit"><option value="contain" ${prefs.fit === "contain" ? "selected" : ""}>Fit Entire Image</option><option value="cover" ${prefs.fit === "cover" ? "selected" : ""}>Fill / Crop</option></select></label>
      <label><span>Zoom · ${prefs.zoom.toFixed(2)}x</span><input type="range" name="zoom" min="0.5" max="2.5" step="0.05" value="${prefs.zoom}"></label>
      <label><span>Horizontal · ${prefs.offsetX}%</span><input type="range" name="offsetX" min="-40" max="40" step="1" value="${prefs.offsetX}"></label>
      <label><span>Vertical · ${prefs.offsetY}%</span><input type="range" name="offsetY" min="-40" max="40" step="1" value="${prefs.offsetY}"></label>
    </div>
    <p class="rg-equipment-figure-settings-foot"><i class="fa-solid fa-circle-info"></i> Figure settings are visual only. Inventory zones, capacity, two-handed locking and containers are unchanged.</p>
  </div>`;
}

async function openFigureSettings(sheet, image) {
  if (!sheet?.actor) return null;
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `${sheet.actor.name} · Equipment Figure Settings`, resizable: true },
    position: { width: 560, height: "auto" },
    content: figureSettingsContent(sheet.actor),
    modal: false,
    rejectClose: false,
    buttons: [
      {
        action: "apply",
        label: "Apply",
        icon: "fa-solid fa-check",
        default: true,
        callback: (_event, button) => ({
          customSrc: String(button.form?.elements?.customSrc?.value ?? "").trim(),
          fit: String(button.form?.elements?.fit?.value ?? "contain"),
          zoom: Number(button.form?.elements?.zoom?.value ?? 1),
          offsetX: Number(button.form?.elements?.offsetX?.value ?? 0),
          offsetY: Number(button.form?.elements?.offsetY?.value ?? 0)
        })
      },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (!result) return null;
  await saveFigurePreferences(sheet.actor, result);
  const resolved = resolveEquipmentFigure(sheet.actor);
  applyFigureImage(image, resolved);
  return resolved;
}

function ensureFigureControl(sheet, panel, resolved, image) {
  if (!panel || !sheet?.actor) return;
  let control = panel.querySelector("[data-rg-equipment-figure-control]");
  if (!control) {
    control = document.createElement("div");
    control.className = "rg-equipment-figure-control";
    control.dataset.rgEquipmentFigureControl = "true";
    const listId = `rg-equipment-ancestry-${sheet.actor.id}`;
    const choices = ancestryChoices();
    control.innerHTML = `
      <div class="rg-equipment-figure-copy"><span>Equipment Figure</span><small>Two modes only · custom or ancestry · visual only</small></div>
      <label class="rg-equipment-figure-mode"><span>Source</span><select data-rg-equipment-figure-mode>
        <option value="custom">Custom Figure</option>
        <option value="ancestry">Ancestry Figure</option>
      </select></label>
      <label class="rg-equipment-figure-ancestry"><span>Ancestry</span><input type="text" list="${listId}" data-rg-equipment-ancestry-input placeholder="Dúnadan, Human, Elf, Dwarf, Halfling…" />
      <datalist id="${listId}">${choices.map(choice => `<option value="${esc(choice.value)}">${esc(choice.label)}</option>`).join("")}</datalist></label>
      <button type="button" class="rg-equipment-figure-settings-button" data-rg-equipment-figure-settings title="Figure settings" aria-label="Open Equipment Figure settings"><i class="fa-solid fa-gear"></i></button>
      <div class="rg-equipment-figure-resolved" data-rg-equipment-figure-resolved></div>`;
    const stage = panel.querySelector(".rg-equipment-stage");
    if (stage) panel.insertBefore(control, stage); else panel.appendChild(control);

    control.querySelector("[data-rg-equipment-figure-mode]")?.addEventListener("change", async event => {
      await saveFigurePreferences(sheet.actor, { mode: String(event.currentTarget?.value ?? "custom") });
    });
    control.querySelector("[data-rg-equipment-ancestry-input]")?.addEventListener("change", async event => {
      await sheet.actor.update({ "system.ancestry": String(event.currentTarget?.value ?? "").trim() });
    });
    control.querySelector("[data-rg-equipment-figure-settings]")?.addEventListener("click", async event => {
      event.preventDefault();
      await openFigureSettings(sheet, image);
    });
  }

  const prefs = resolved.preferences;
  const setValue = (selector, value) => {
    const field = control.querySelector(selector);
    if (field && document.activeElement !== field) field.value = String(value ?? "");
  };
  setValue("[data-rg-equipment-figure-mode]", prefs.mode);
  setValue("[data-rg-equipment-ancestry-input]", sheet.actor.system?.ancestry ?? "");

  const status = control.querySelector("[data-rg-equipment-figure-resolved]");
  if (status) status.innerHTML = resolvedCopy(resolved);

  control.dataset.rgFigureSource = resolved.sourceType;
  control.dataset.rgFigureMode = prefs.mode;
  control.querySelector("[data-rg-equipment-ancestry-input]")?.closest("label")?.classList.toggle("is-disabled", prefs.mode !== "ancestry");
}

export function applyEquipmentFigure(sheet) {
  const actor = sheet?.actor, root = sheet?.element;
  if (!actor || actor.type !== "character" || !root?.querySelector) return null;
  const image = root.querySelector(".rg-ranger-silhouette");
  if (!image) return null;

  const resolved = resolveEquipmentFigure(actor);
  applyFigureImage(image, resolved);
  const stage = image.closest(".rg-equipment-stage");
  if (stage) {
    stage.dataset.rgFigureSource = resolved.sourceType;
    stage.dataset.rgSilhouetteKey = resolved.ancestry.key;
    stage.dataset.rgSilhouetteLabel = resolved.ancestry.label;
    stage.dataset.rgAncestry = String(actor.system?.ancestry ?? "");
  }
  ensureFigureControl(sheet, image.closest(".rg-equipment-panel"), resolved, image);
  return resolved;
}

export const applyEquipmentSilhouette = applyEquipmentFigure;

export function equipmentFigureStatus() {
  return Object.freeze({
    phase: "M5",
    scope: "CUSTOM_OR_ANCESTRY_EQUIPMENT_FIGURE",
    defaultMode: "custom",
    modes: FIGURE_MODES,
    defaultCustomFigure: DEFAULT_CUSTOM_FIGURE,
    automaticAncestrySelection: true,
    supportedAncestries: Object.freeze(Object.keys(EQUIPMENT_SILHOUETTES)),
    characterArtModeRemoved: true,
    framingControls: "SETTINGS_DIALOG",
    paperFiguresAllowed: false,
    liveApplication: false,
    inventoryAuthority: "LEGACY_MIXED",
    ancestryField: "system.ancestry",
    preferencesFlag: `flags.${NS}.${FIGURE_FLAG}`,
    inventoryRulesChanged: false
  });
}

export const equipmentSilhouetteStatus = equipmentFigureStatus;

function exposeApi() {
  globalThis.game.realmGuard ??= {};
  globalThis.game.realmGuard.inventory ??= {};
  game.realmGuard.inventory.silhouette = Object.freeze({
    getStatus: equipmentFigureStatus,
    registry: EQUIPMENT_SILHOUETTES,
    normalize: normalizeEquipmentAncestry,
    resolve: resolveEquipmentSilhouette,
    forActor: equipmentSilhouetteForActor
  });
  game.realmGuard.inventory.figure = Object.freeze({
    getStatus: equipmentFigureStatus,
    getPreferences: equipmentFigurePreferences,
    characterArt: characterArtForEquipment,
    resolve: resolveEquipmentFigure,
    forActor: resolveEquipmentFigure
  });
}

export function installEquipmentSilhouette(ActorSheetClass) {
  const original = ActorSheetClass?.prototype?._onRender;
  if (typeof original === "function" && !original._rgEquipmentSilhouetteWrapped) {
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      try { applyEquipmentFigure(this); }
      catch (error) { console.error("realm-guard | Equipment figure render failed", error); }
      return result;
    };
    Object.defineProperty(wrapped, "_rgEquipmentSilhouetteWrapped", { value: true });
    ActorSheetClass.prototype._onRender = wrapped;
  }

  globalThis.Hooks?.once?.("ready", () => {
    exposeApi();
    console.log("realm-guard | M5 Equipment Figure custom/ancestry mode ready", equipmentFigureStatus());
  });
}