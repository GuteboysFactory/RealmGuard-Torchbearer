import { rangerPortraitState } from "./token-builder.mjs";

const NS = "realm-guard";
const FIGURE_FLAG = "equipmentFigure";
const ASSET_ROOT = "systems/realm-guard/assets/ui/silhouettes";
const FIGURE_MODES = Object.freeze(["auto", "character", "ancestry", "custom"]);
const RANGER_ART = `${ASSET_ROOT}/dunadan.svg`;

export const EQUIPMENT_SILHOUETTES = Object.freeze({
  neutral: Object.freeze({ key: "neutral", label: "Neutral Humanoid", src: `${ASSET_ROOT}/neutral.svg` }),
  dunadan: Object.freeze({ key: "dunadan", label: "Dúnadan", src: RANGER_ART }),
  human: Object.freeze({ key: "human", label: "Human", src: RANGER_ART }),
  dwarf: Object.freeze({ key: "dwarf", label: "Dwarf", src: RANGER_ART }),
  elf: Object.freeze({ key: "elf", label: "Elf", src: RANGER_ART }),
  halfling: Object.freeze({ key: "halfling", label: "Halfling / Hobbit", src: RANGER_ART })
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
function isUsableCharacterArt(src) {
  const value = String(src ?? "").trim();
  return Boolean(value) && !/icons\/svg\/mystery-man/i.test(value);
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
export function equipmentSilhouetteForActor(actor) { return resolveEquipmentSilhouette(equipmentAncestryForActor(actor)); }

export function equipmentFigurePreferences(actor) {
  const raw = actor?.getFlag?.(NS, FIGURE_FLAG) ?? {};
  const rawMode = String(raw?.mode ?? "auto").toLowerCase();
  return Object.freeze({
    mode: FIGURE_MODES.includes(rawMode) ? rawMode : "auto",
    customSrc: String(raw?.customSrc ?? "").trim(),
    fit: String(raw?.fit ?? "contain") === "cover" ? "cover" : "contain",
    zoom: clamp(raw?.zoom ?? 1, 0.5, 2.5), offsetX: clamp(raw?.offsetX ?? 0, -40, 40), offsetY: clamp(raw?.offsetY ?? 0, -40, 40)
  });
}

export function characterArtForEquipment(actor) {
  if (!actor) return "";
  try {
    const original = String(rangerPortraitState(actor)?.originalSource ?? "").trim();
    if (isUsableCharacterArt(original)) return original;
  } catch (_error) {}
  const actorImage = String(actor?.img ?? "").trim();
  return isUsableCharacterArt(actorImage) ? actorImage : "";
}

export function resolveEquipmentFigure(actor) {
  const preferences = equipmentFigurePreferences(actor);
  const ancestry = equipmentSilhouetteForActor(actor);
  const characterSrc = characterArtForEquipment(actor);
  const hasCharacterArt = Boolean(characterSrc);
  const hasCustom = Boolean(preferences.customSrc);
  let sourceType = "ancestry", src = ancestry.src, label = ancestry.label, fallbackReason = null;

  if (preferences.mode === "auto" && hasCharacterArt) {
    sourceType = "character"; src = characterSrc; label = "Character Art";
  } else if (preferences.mode === "character") {
    if (hasCharacterArt) { sourceType = "character"; src = characterSrc; label = "Character Art"; }
    else fallbackReason = "CHARACTER_ART_UNAVAILABLE";
  } else if (preferences.mode === "custom") {
    if (hasCustom) { sourceType = "custom"; src = preferences.customSrc; label = "Custom Equipment Figure"; }
    else fallbackReason = "CUSTOM_ART_UNAVAILABLE";
  }

  return Object.freeze({ mode: preferences.mode, sourceType, src, label, hasCharacterArt, hasCustom, fallbackReason, ancestry, preferences, inventoryRulesChanged: false });
}

function ancestryChoices() {
  return [
    { value: "Dúnadan", label: "Dúnadan" }, { value: "Human", label: "Human" }, { value: "Dwarf", label: "Dwarf" },
    { value: "Elf", label: "Elf" }, { value: "Halfling", label: "Halfling / Hobbit" }, { value: "Neutral", label: "Neutral Humanoid" }
  ];
}

async function saveFigurePreferences(actor, patch = {}) {
  const current = equipmentFigurePreferences(actor);
  const next = { mode: patch.mode ?? current.mode, customSrc: patch.customSrc ?? current.customSrc, fit: patch.fit ?? current.fit,
    zoom: clamp(patch.zoom ?? current.zoom, 0.5, 2.5), offsetX: clamp(patch.offsetX ?? current.offsetX, -40, 40), offsetY: clamp(patch.offsetY ?? current.offsetY, -40, 40) };
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
  image.classList.toggle("is-character-art", resolved.sourceType === "character");
  image.classList.toggle("is-custom-art", resolved.sourceType === "custom");
  image.classList.toggle("is-ancestry-art", resolved.sourceType === "ancestry");

  const customFraming = resolved.sourceType === "character" || resolved.sourceType === "custom";
  if (customFraming) {
    const framing = resolved.preferences;
    image.style.objectFit = framing.fit;
    image.style.left = `calc(50% + ${framing.offsetX}%)`;
    image.style.top = `calc(51% + ${framing.offsetY}%)`;
    image.style.transform = `translate(-50%, -50%) scale(${framing.zoom})`;
  } else {
    image.style.objectFit = "contain";
    image.style.left = "50%"; image.style.top = "51%"; image.style.transform = "translate(-50%, -50%)";
  }
}

function resolvedCopy(resolved) {
  if (resolved.sourceType === "character") return `<i class="fa-solid fa-image"></i><span><b>Character Art</b> · personal PC image</span>`;
  if (resolved.sourceType === "custom") return `<i class="fa-solid fa-wand-magic-sparkles"></i><span><b>Custom Figure</b></span>`;
  if (resolved.fallbackReason === "CHARACTER_ART_UNAVAILABLE") return `<i class="fa-solid fa-triangle-exclamation"></i><span>Character Art unavailable → <b>${esc(resolved.ancestry.label)}</b> artwork</span>`;
  if (resolved.fallbackReason === "CUSTOM_ART_UNAVAILABLE") return `<i class="fa-solid fa-triangle-exclamation"></i><span>Custom image missing → <b>${esc(resolved.ancestry.label)}</b> artwork</span>`;
  if (resolved.ancestry.fallback) return `<i class="fa-solid fa-person-rays"></i><span>Custom ancestry → <b>${esc(resolved.ancestry.label)}</b> artwork fallback</span>`;
  return `<i class="fa-solid fa-person-rays"></i><span><b>${esc(resolved.ancestry.label)}</b> artwork</span>`;
}

function ensureFigureControl(sheet, panel, resolved, image) {
  if (!panel || !sheet?.actor) return;
  let control = panel.querySelector("[data-rg-equipment-figure-control]");
  if (!control) {
    control = document.createElement("div"); control.className = "rg-equipment-figure-control"; control.dataset.rgEquipmentFigureControl = "true";
    const listId = `rg-equipment-ancestry-${sheet.actor.id}`; const choices = ancestryChoices();
    control.innerHTML = `
      <div class="rg-equipment-figure-copy"><span>Equipment Figure</span><small>PC art first · ancestry artwork fallback · visual only</small></div>
      <label class="rg-equipment-figure-mode"><span>Source</span><select data-rg-equipment-figure-mode>
        <option value="auto">Auto · Character Art → Ancestry</option><option value="character">Character Art</option><option value="ancestry">Ancestry Figure</option><option value="custom">Custom Figure</option>
      </select></label>
      <label class="rg-equipment-figure-ancestry"><span>Ancestry</span><input type="text" list="${listId}" data-rg-equipment-ancestry-input placeholder="Dúnadan, Human, Dwarf, Elf, Halfling…" />
      <datalist id="${listId}">${choices.map(choice => `<option value="${esc(choice.value)}">${esc(choice.label)}</option>`).join("")}</datalist></label>
      <div class="rg-equipment-figure-resolved" data-rg-equipment-figure-resolved></div>
      <div class="rg-equipment-figure-tools" data-rg-equipment-figure-tools>
        <label class="rg-equipment-custom-source" data-rg-equipment-custom-source-wrap><span>Custom image path</span><input type="text" data-rg-equipment-custom-source placeholder="worlds/.../figure.webp" /></label>
        <label><span>Fit</span><select data-rg-equipment-figure-fit><option value="contain">Fit Entire Image</option><option value="cover">Fill / Crop</option></select></label>
        <label><span>Zoom <output data-rg-equipment-zoom-output></output></span><input type="range" min="0.5" max="2.5" step="0.05" data-rg-equipment-figure-zoom /></label>
        <label><span>Horizontal <output data-rg-equipment-x-output></output></span><input type="range" min="-40" max="40" step="1" data-rg-equipment-figure-x /></label>
        <label><span>Vertical <output data-rg-equipment-y-output></output></span><input type="range" min="-40" max="40" step="1" data-rg-equipment-figure-y /></label>
      </div>`;
    const stage = panel.querySelector(".rg-equipment-stage"); if (stage) panel.insertBefore(control, stage); else panel.appendChild(control);
    control.querySelector("[data-rg-equipment-figure-mode]")?.addEventListener("change", async event => saveFigurePreferences(sheet.actor, { mode: String(event.currentTarget?.value ?? "auto") }));
    control.querySelector("[data-rg-equipment-ancestry-input]")?.addEventListener("change", async event => sheet.actor.update({ "system.ancestry": String(event.currentTarget?.value ?? "").trim() }));
    control.querySelector("[data-rg-equipment-custom-source]")?.addEventListener("change", async event => saveFigurePreferences(sheet.actor, { customSrc: String(event.currentTarget?.value ?? "").trim() }));
    control.querySelector("[data-rg-equipment-figure-fit]")?.addEventListener("change", async event => saveFigurePreferences(sheet.actor, { fit: String(event.currentTarget?.value ?? "contain") }));
    const bindRange = (selector, key, outputSelector, suffix = "") => {
      const input = control.querySelector(selector), output = control.querySelector(outputSelector);
      input?.addEventListener("input", event => { const value = Number(event.currentTarget?.value ?? 0); if (output) output.textContent = `${value}${suffix}`; applyFigureImage(image, { ...resolveEquipmentFigure(sheet.actor), preferences: { ...equipmentFigurePreferences(sheet.actor), [key]: value } }); });
      input?.addEventListener("change", async event => saveFigurePreferences(sheet.actor, { [key]: Number(event.currentTarget?.value ?? 0) }));
    };
    bindRange("[data-rg-equipment-figure-zoom]", "zoom", "[data-rg-equipment-zoom-output]", "x"); bindRange("[data-rg-equipment-figure-x]", "offsetX", "[data-rg-equipment-x-output]", "%"); bindRange("[data-rg-equipment-figure-y]", "offsetY", "[data-rg-equipment-y-output]", "%");
  }
  const prefs = resolved.preferences;
  const setValue = (selector, value) => { const field = control.querySelector(selector); if (field && document.activeElement !== field) field.value = String(value ?? ""); };
  setValue("[data-rg-equipment-figure-mode]", prefs.mode); setValue("[data-rg-equipment-ancestry-input]", sheet.actor.system?.ancestry ?? ""); setValue("[data-rg-equipment-custom-source]", prefs.customSrc);
  setValue("[data-rg-equipment-figure-fit]", prefs.fit); setValue("[data-rg-equipment-figure-zoom]", prefs.zoom); setValue("[data-rg-equipment-figure-x]", prefs.offsetX); setValue("[data-rg-equipment-figure-y]", prefs.offsetY);
  const zoomOutput = control.querySelector("[data-rg-equipment-zoom-output]"); if (zoomOutput) zoomOutput.textContent = `${prefs.zoom.toFixed(2)}x`;
  const xOutput = control.querySelector("[data-rg-equipment-x-output]"); if (xOutput) xOutput.textContent = `${prefs.offsetX}%`;
  const yOutput = control.querySelector("[data-rg-equipment-y-output]"); if (yOutput) yOutput.textContent = `${prefs.offsetY}%`;
  const status = control.querySelector("[data-rg-equipment-figure-resolved]"); if (status) status.innerHTML = resolvedCopy(resolved);
  control.dataset.rgFigureSource = resolved.sourceType; control.dataset.rgFigureMode = prefs.mode;
  control.querySelector("[data-rg-equipment-custom-source-wrap]")?.classList.toggle("is-visible", prefs.mode === "custom");
  control.querySelector("[data-rg-equipment-figure-tools]")?.classList.toggle("is-active", resolved.sourceType === "character" || resolved.sourceType === "custom");
}

export function applyEquipmentFigure(sheet) {
  const actor = sheet?.actor, root = sheet?.element;
  if (!actor || actor.type !== "character" || !root?.querySelector) return null;
  const image = root.querySelector(".rg-ranger-silhouette"); if (!image) return null;
  const resolved = resolveEquipmentFigure(actor); applyFigureImage(image, resolved);
  const stage = image.closest(".rg-equipment-stage");
  if (stage) { stage.dataset.rgFigureSource = resolved.sourceType; stage.dataset.rgSilhouetteKey = resolved.ancestry.key; stage.dataset.rgSilhouetteLabel = resolved.ancestry.label; stage.dataset.rgAncestry = String(actor.system?.ancestry ?? ""); }
  ensureFigureControl(sheet, image.closest(".rg-equipment-panel"), resolved, image); return resolved;
}
export const applyEquipmentSilhouette = applyEquipmentFigure;

export function equipmentFigureStatus() {
  return Object.freeze({ phase: "M5", scope: "NO_PAPER_FIGURES_EQUIPMENT_ART", defaultMode: "auto", sourceOrder: Object.freeze(["CHARACTER_ART", "ANCESTRY_ARTWORK", "NEUTRAL_ARTWORK"]), modes: FIGURE_MODES,
    liveApplication: false, inventoryAuthority: "LEGACY_MIXED", registry: Object.freeze(Object.keys(EQUIPMENT_SILHOUETTES)), ancestryField: "system.ancestry", preferencesFlag: `flags.${NS}.${FIGURE_FLAG}`,
    originalPortraitAware: true, legacyLineageBridge: true, paperFiguresAllowed: false, inventoryRulesChanged: false });
}
export const equipmentSilhouetteStatus = equipmentFigureStatus;

function exposeApi() {
  globalThis.game.realmGuard ??= {}; globalThis.game.realmGuard.inventory ??= {};
  globalThis.game.realmGuard.inventory.silhouette = Object.freeze({ getStatus: equipmentFigureStatus, registry: EQUIPMENT_SILHOUETTES, normalize: normalizeEquipmentAncestry, resolve: resolveEquipmentSilhouette, forActor: equipmentSilhouetteForActor });
  globalThis.game.realmGuard.inventory.figure = Object.freeze({ getStatus: equipmentFigureStatus, getPreferences: equipmentFigurePreferences, characterArt: characterArtForEquipment, resolve: resolveEquipmentFigure, forActor: resolveEquipmentFigure });
}

export function installEquipmentSilhouette(ActorSheetClass) {
  const original = ActorSheetClass?.prototype?._onRender;
  if (typeof original === "function" && !original._rgEquipmentSilhouetteWrapped) {
    const wrapped = function(...args) { const result = original.apply(this, args); try { applyEquipmentFigure(this); } catch (error) { console.error("realm-guard | Equipment figure render failed", error); } return result; };
    Object.defineProperty(wrapped, "_rgEquipmentSilhouetteWrapped", { value: true }); ActorSheetClass.prototype._onRender = wrapped;
  }
  globalThis.Hooks?.once?.("ready", () => { exposeApi(); console.log("realm-guard | M5 no-paper equipment artwork ready", equipmentFigureStatus()); });
}
