const ASSET_ROOT = "systems/realm-guard/assets/ui/silhouettes";

export const EQUIPMENT_SILHOUETTES = Object.freeze({
  neutral: Object.freeze({ key: "neutral", label: "Neutral Humanoid", src: `${ASSET_ROOT}/neutral.svg` }),
  human: Object.freeze({ key: "human", label: "Human / Dúnadan", src: `${ASSET_ROOT}/human.svg` }),
  dwarf: Object.freeze({ key: "dwarf", label: "Dwarf", src: `${ASSET_ROOT}/dwarf.svg` }),
  elf: Object.freeze({ key: "elf", label: "Elf", src: `${ASSET_ROOT}/elf.svg` }),
  halfling: Object.freeze({ key: "halfling", label: "Halfling / Hobbit", src: `${ASSET_ROOT}/halfling.svg` })
});

const ALIASES = Object.freeze({
  neutral: "neutral",
  generic: "neutral",
  humanoid: "neutral",
  human: "human",
  humans: "human",
  man: "human",
  men: "human",
  dunadan: "human",
  dunedain: "human",
  numenorean: "human",
  numenoreans: "human",
  dwarf: "dwarf",
  dwarves: "dwarf",
  dwarven: "dwarf",
  elf: "elf",
  elves: "elf",
  elven: "elf",
  eldar: "elf",
  hobbit: "halfling",
  hobbits: "halfling",
  halfling: "halfling",
  halflings: "halfling"
});

function fold(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeEquipmentAncestry(value) {
  const folded = fold(value);
  if (!folded) return "neutral";
  if (ALIASES[folded]) return ALIASES[folded];
  for (const token of folded.split(/\s+/)) {
    if (ALIASES[token]) return ALIASES[token];
  }
  return "neutral";
}

export function resolveEquipmentSilhouette(value) {
  const requested = String(value ?? "").trim();
  const key = normalizeEquipmentAncestry(requested);
  const entry = EQUIPMENT_SILHOUETTES[key] ?? EQUIPMENT_SILHOUETTES.neutral;
  return Object.freeze({
    ...entry,
    requested,
    fallback: key === "neutral" && fold(requested) !== "neutral" && Boolean(requested)
  });
}

export function equipmentAncestryForActor(actor) {
  const explicit = String(actor?.system?.ancestry ?? "").trim();
  if (explicit) return explicit;

  // Backward-compatible bridge only: older actors may have stored ancestry-like
  // wording in Lineage / House. House names such as "House of Ruor" deliberately
  // do not match and therefore use the neutral silhouette.
  const legacyLineage = String(actor?.system?.lineage ?? "").trim();
  return normalizeEquipmentAncestry(legacyLineage) !== "neutral" ? legacyLineage : "";
}

export function equipmentSilhouetteForActor(actor) {
  return resolveEquipmentSilhouette(equipmentAncestryForActor(actor));
}

function ancestryChoices() {
  return [
    { value: "Dúnadan", label: "Dúnadan / Human" },
    { value: "Dwarf", label: "Dwarf" },
    { value: "Elf", label: "Elf" },
    { value: "Halfling", label: "Halfling / Hobbit" },
    { value: "Neutral", label: "Neutral Humanoid" }
  ];
}

function ensureAncestryControl(sheet, panel, resolved) {
  if (!panel || !sheet?.actor) return;
  let control = panel.querySelector("[data-rg-equipment-ancestry-control]");
  if (!control) {
    control = document.createElement("div");
    control.className = "rg-equipment-ancestry-control";
    control.dataset.rgEquipmentAncestryControl = "true";
    const listId = `rg-equipment-ancestry-${sheet.actor.id}`;
    const choices = ancestryChoices();
    control.innerHTML = `
      <div class="rg-equipment-ancestry-copy">
        <span>Equipment silhouette</span>
        <small>Visual only · inventory rules are unchanged</small>
      </div>
      <label>
        <span>Ancestry</span>
        <input type="text" list="${listId}" data-rg-equipment-ancestry-input placeholder="Dúnadan, Dwarf, Elf, Halfling…" />
        <datalist id="${listId}">${choices.map(choice => `<option value="${choice.value}">${choice.label}</option>`).join("")}</datalist>
      </label>
      <div class="rg-equipment-ancestry-resolved" data-rg-equipment-ancestry-resolved></div>`;
    const stage = panel.querySelector(".rg-equipment-stage");
    if (stage) panel.insertBefore(control, stage);
    else panel.appendChild(control);

    const input = control.querySelector("[data-rg-equipment-ancestry-input]");
    input?.addEventListener("change", async event => {
      const value = String(event.currentTarget?.value ?? "").trim();
      try {
        await sheet.actor.update({ "system.ancestry": value });
      } catch (error) {
        console.error("realm-guard | Could not update equipment ancestry", error);
        globalThis.ui?.notifications?.error?.("Realm Guard: Could not update equipment ancestry.");
      }
    });
  }

  const input = control.querySelector("[data-rg-equipment-ancestry-input]");
  if (input && document.activeElement !== input) input.value = String(sheet.actor.system?.ancestry ?? "");
  const output = control.querySelector("[data-rg-equipment-ancestry-resolved]");
  if (output) {
    output.innerHTML = resolved.fallback
      ? `<i class="fa-solid fa-person"></i><span>Custom ancestry → <b>${resolved.label}</b> fallback</span>`
      : `<i class="fa-solid fa-person"></i><span><b>${resolved.label}</b></span>`;
  }
}

export function applyEquipmentSilhouette(sheet) {
  const actor = sheet?.actor;
  const root = sheet?.element;
  if (!actor || actor.type !== "character" || !root?.querySelector) return null;

  const image = root.querySelector(".rg-ranger-silhouette");
  if (!image) return null;

  const resolved = equipmentSilhouetteForActor(actor);
  image.src = resolved.src;
  image.alt = `${resolved.label} equipment silhouette`;
  image.removeAttribute("aria-hidden");
  image.dataset.rgSilhouetteKey = resolved.key;
  image.dataset.rgSilhouetteFallback = String(resolved.fallback);

  const stage = image.closest(".rg-equipment-stage");
  if (stage) {
    stage.dataset.rgSilhouetteKey = resolved.key;
    stage.dataset.rgSilhouetteLabel = resolved.label;
    stage.dataset.rgAncestry = String(actor.system?.ancestry ?? "");
  }

  ensureAncestryControl(sheet, image.closest(".rg-equipment-panel"), resolved);
  return resolved;
}

export function equipmentSilhouetteStatus() {
  return Object.freeze({
    phase: "M5",
    scope: "LINEAGE_AWARE_EQUIPMENT_SILHOUETTE",
    liveApplication: false,
    inventoryAuthority: "LEGACY_MIXED",
    registry: Object.freeze(Object.keys(EQUIPMENT_SILHOUETTES)),
    ancestryField: "system.ancestry",
    legacyLineageBridge: true,
    inventoryRulesChanged: false
  });
}

function exposeApi() {
  globalThis.game.realmGuard ??= {};
  globalThis.game.realmGuard.inventory ??= {};
  globalThis.game.realmGuard.inventory.silhouette = Object.freeze({
    getStatus: equipmentSilhouetteStatus,
    registry: EQUIPMENT_SILHOUETTES,
    normalize: normalizeEquipmentAncestry,
    resolve: resolveEquipmentSilhouette,
    forActor: equipmentSilhouetteForActor
  });
}

export function installEquipmentSilhouette(ActorSheetClass) {
  const original = ActorSheetClass?.prototype?._onRender;
  if (typeof original === "function" && !original._rgEquipmentSilhouetteWrapped) {
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      try { applyEquipmentSilhouette(this); }
      catch (error) { console.error("realm-guard | Equipment silhouette render failed", error); }
      return result;
    };
    Object.defineProperty(wrapped, "_rgEquipmentSilhouetteWrapped", { value: true });
    ActorSheetClass.prototype._onRender = wrapped;
  }

  globalThis.Hooks?.once?.("ready", () => {
    exposeApi();
    console.log("realm-guard | M5 equipment silhouette registry ready", equipmentSilhouetteStatus());
  });
}
