import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";

const NS = "realm-guard";
const DEFAULT_KEY = "legacyCharacterSheetLayout";
const FORCE_KEY = "legacyCharacterSheetForceDefault";
const CHARACTER_FLAG = "characterSheetLayout";
const NPC_FLAG = "npcSheetLayout";
const PC_LAYOUTS = {world: "Follow world default", compact: "Compact", detailed: "Detailed"};
const NPC_LAYOUTS = {npc: "NPC", monster: "Monster", animal: "Animal"};

function setting(key, fallback) {
  try { return game.settings.get(NS, key) ?? fallback; }
  catch (_error) { return fallback; }
}

export function characterSheetLayout(actor) {
  const saved = actor.getFlag?.(NS, CHARACTER_FLAG);
  const preferred = Object.hasOwn(PC_LAYOUTS, saved) ? saved : "world";
  const standard = setting(DEFAULT_KEY, "compact") === "detailed" ? "detailed" : "compact";
  const forced = setting(FORCE_KEY, false) === true;
  return {preferred, standard, forced, effective: forced || preferred === "world" ? standard : preferred};
}

export function npcSheetLayout(actor) {
  const saved = actor.getFlag?.(NS, NPC_FLAG);
  return Object.hasOwn(NPC_LAYOUTS, saved) ? saved : "npc";
}

export function installLegacySheetLayoutSettings() {
  const refreshSheets = () => {
    if (!game.ready || !legacyMixedPolishEnabled()) return;
    for (const app of foundry.applications.instances?.values() ?? []) {
      if (app.rendered && app.actor?.type === "character" && app.element?.classList.contains("rg-legacy-workspace-window")) {
        void app.render({force: true});
      }
    }
  };
  game.settings.register(NS, DEFAULT_KEY, {
    name: "Legacy Mixed · Default player sheet",
    hint: "Used by characters that follow the world default.",
    scope: "world", config: true, type: String, default: "compact",
    choices: {compact: PC_LAYOUTS.compact, detailed: PC_LAYOUTS.detailed}, onChange: refreshSheets
  });
  game.settings.register(NS, FORCE_KEY, {
    name: "Legacy Mixed · Apply default to all player sheets",
    hint: "Temporarily use the default on every player sheet. Individual choices are kept.",
    scope: "world", config: true, type: Boolean, default: false, onChange: refreshSheets
  });
}

export function makeSheetLayoutControl(sheet, {npc = false} = {}) {
  const layout = npc ? null : characterSheetLayout(sheet.actor);
  const choices = npc ? NPC_LAYOUTS : PC_LAYOUTS;
  const label = document.createElement("label");
  label.className = "rg-sheet-layout-control";
  label.textContent = npc ? "Sheet type" : "Sheet layout";
  const select = document.createElement("select");
  select.dataset.rgSheetLayout = npc ? "npc" : "character";
  for (const [value, text] of Object.entries(choices)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "world" ? `${text} (${PC_LAYOUTS[layout.standard]})` : text;
    select.append(option);
  }
  const current = npc ? npcSheetLayout(sheet.actor) : layout.forced ? layout.effective : layout.preferred;
  select.value = current;
  select.disabled = !sheet.isEditable || !sheet.actor.isOwner || Boolean(layout?.forced);
  if (layout?.forced) select.title = "The GM applies the world default to all player sheets.";
  select.addEventListener("change", async event => {
    event.stopPropagation();
    const value = select.value;
    if (!legacyMixedPolishEnabled() || !sheet.isEditable || !sheet.actor.isOwner || !Object.hasOwn(choices, value)) return;
    if (!npc && characterSheetLayout(sheet.actor).forced) return;
    select.disabled = true;
    try {
      await sheet.actor.setFlag(NS, npc ? NPC_FLAG : CHARACTER_FLAG, value);
    } catch (error) {
      select.value = current;
      select.disabled = false;
      ui.notifications.error(error.message);
      return;
    }
    await sheet.render({force: true});
  });
  label.append(select);
  return label;
}
