import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { MAP_ICONS, MAP_ICON_GROUPS } from "../assets/ui/map-icons/catalog.mjs";

export { MAP_ICONS };
export const MAP_ITEM_TYPES = {gear:"Gear / item",role:"Skill",trait:"Trait",wise:"Wise",condition:"Condition",tokenOfPower:"Token of Power",talent:"Talent"};

const NS = "realm-guard";
const VISIBILITY = "mapMarkerVisible";
const DEFAULT_SIZE = 48;
const MIN_SIZE = 32;
const ICON_PATH = "systems/realm-guard/assets/ui/map-icons/";
const iconIds = new Set(MAP_ICONS.map(([id]) => id));
const iconTexture = id => `${ICON_PATH}${id}.svg`;
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const normalize = text => String(text ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const validSize = value => Number.isSafeInteger(value) && value >= MIN_SIZE;

function markerSizeField(size = DEFAULT_SIZE) {
  return `<label>Marker size (px)<input type="number" name="iconSize" value="${size}" min="${MIN_SIZE}" step="1" required></label>`;
}

function markerVisibilityField(visible = false) {
  return `<label>Player visibility<select name="visible">
    <option value="hide" ${visible ? "" : "selected"}>Hide from players</option>
    <option value="show" ${visible ? "selected" : ""}>Show to players</option>
  </select></label>`;
}

function iconPicker(selected = "village") {
  const categories = Object.entries(MAP_ICON_GROUPS).map(([id, label]) => `<option value="${id}">${esc(label)}</option>`).join("");
  const rows = MAP_ICONS.map(([id, label, aliases, category]) =>
    `<label data-map-category="${category}" data-map-tags="${esc(normalize(`${label} ${aliases}`))}">
      <input type="radio" name="icon" value="${id}" ${id === selected ? "checked" : ""}>
      <img src="${iconTexture(id)}" alt="" loading="lazy"><span>${esc(label)}</span>
    </label>`).join("");
  return `<div class="rg-map-icon-filters">
    <label>Search Icons<input type="search" data-map-search placeholder="Shop, fontän, tunna…"></label>
    <label>Category<select data-map-category-filter><option value="">All categories</option>${categories}</select></label>
  </div>
  <p class="rg-map-icon-count" data-map-count role="status"></p>
  <div class="rg-map-icon-grid" role="group" aria-label="Marker icon">
    ${selected === "" ? '<label data-map-category="" data-map-tags="keep current symbol"><input type="radio" name="icon" value="" checked><span>Keep current symbol</span></label>' : ""}
    ${rows}
  </div>`;
}

function bindIconPicker(_event, dialog) {
  const root = dialog.element;
  const search = root?.querySelector("[data-map-search]");
  const category = root?.querySelector("[data-map-category-filter]");
  const count = root?.querySelector("[data-map-count]");
  const grid = root?.querySelector(".rg-map-icon-grid");
  if (!search || !category || !count || !grid) return;
  const rows = [...grid.querySelectorAll("[data-map-tags]")];
  const update = () => {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const row of rows) {
      row.hidden = Boolean(category.value && category.value !== row.dataset.mapCategory)
        || !terms.every(term => row.dataset.mapTags.includes(term));
      if (!row.hidden) visible++;
    }
    count.textContent = visible ? `${visible} icon${visible === 1 ? "" : "s"}` : "No matching icons";
    grid.scrollTop = 0;
  };
  search.addEventListener("input", update);
  category.addEventListener("change", update);
  update();
}

export function isRealmGuardMapPoint(note) {
  return typeof note?.getFlag?.(NS, VISIBILITY) === "boolean"
    || String(note?.texture?.src ?? "").startsWith(ICON_PATH);
}

function canManageMapPoint(note) {
  return game.user?.isGM && legacyMixedPolishEnabled() && isRealmGuardMapPoint(note) && note.parent === canvas.scene
    && (!note.parent.notes?.get || note.parent.notes.get(note.id) === note);
}

export function mapPointShown(note) {
  return note.getFlag(NS, VISIBILITY)
    ?? Number(note.entry?.ownership?.default ?? 0) >= CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
}

export async function setMapPointVisibility(note, visible) {
  if (!canManageMapPoint(note) || note.getFlag(NS, VISIBILITY) === visible) return;
  // Visibility concerns the marker itself. Foundry still controls access to its Journal and Item.
  await note.update({[`flags.${NS}.${VISIBILITY}`]: visible});
}

export function toggleMapPointVisibility(note) {
  if (!canManageMapPoint(note)) return;
  return setMapPointVisibility(note, !mapPointShown(note));
}

export async function editMapPoint(note) {
  if (!canManageMapPoint(note)) return;
  const selected = MAP_ICONS.find(([id]) => iconTexture(id) === note.texture?.src)?.[0] ?? "";
  const originalSize = note.iconSize ?? DEFAULT_SIZE;
  const originalVisibility = mapPointShown(note);
  const result = await foundry.applications.api.DialogV2.wait({
    window: {title: "Edit map marker", resizable: true}, position: {width: 680}, modal: false, rejectClose: false,
    content: `<div class="rg-map-create">
      <label class="rg-map-marker-name">Name<input name="name" value="${esc(note.label ?? note.text)}" required maxlength="100"></label>
      <div class="rg-map-marker-settings">${markerSizeField(originalSize)}${markerVisibilityField(originalVisibility)}</div>
      ${iconPicker(selected)}
    </div>`,
    render: bindIconPicker,
    buttons: [
      {action: "save", label: "Save marker", default: true, callback: (_event, button) => {
        if (!button.form.reportValidity()) return null;
        const fields = button.form.elements;
        return {name: fields.name.value.trim(), icon: fields.icon.value, iconSize: fields.iconSize.valueAsNumber, visible: fields.visible.value === "show"};
      }},
      ...(note.entry ? [{action: "information", label: "Open linked journal", callback: () => ({openJournal: true})}] : []),
      {action: "cancel", label: "Cancel", callback: () => null}
    ]
  });
  if (!result || !canManageMapPoint(note)) return;
  if (result.openJournal) return note.entry?.sheet.render(true);
  if (!result.name || !validSize(result.iconSize) || (result.icon && !iconIds.has(result.icon))) return;
  const changes = {text: result.name};
  if (result.icon && result.icon !== selected) changes["texture.src"] = iconTexture(result.icon);
  if (result.iconSize !== originalSize) changes.iconSize = result.iconSize;
  if (result.visible !== originalVisibility) changes[`flags.${NS}.${VISIBILITY}`] = result.visible;
  return note.update(changes);
}

export async function resizeSceneMapPoints(scene) {
  if (!game.user?.isGM || !legacyMixedPolishEnabled() || !scene || scene !== canvas.scene) return;
  const markers = scene.notes.filter(isRealmGuardMapPoint);
  if (!markers.length) return;
  const iconSize = await foundry.applications.api.DialogV2.wait({
    window: {title: "Resize all markers on this scene"}, modal: true, rejectClose: false,
    content: `<p>Set the same size for ${markers.length} Realm Guard map marker${markers.length === 1 ? "" : "s"} on this scene.</p>${markerSizeField(markers[0].iconSize)}`,
    buttons: [
      {action: "resize", label: "Resize all markers", callback: (_event, button) => button.form.elements.iconSize.valueAsNumber},
      {action: "cancel", label: "Cancel", default: true, callback: () => null}
    ]
  });
  if (!validSize(iconSize) || !game.user?.isGM || !legacyMixedPolishEnabled() || scene !== canvas.scene) return;
  const updates = markers.filter(note => scene.notes.get(note.id) === note && note.iconSize !== iconSize)
    .map(note => ({_id: note.id, iconSize}));
  if (updates.length) return scene.updateEmbeddedDocuments("Note", updates);
}

export async function deleteMapPoint(note) {
  if (!canManageMapPoint(note)) return;
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: {title: "Delete map marker"}, modal: true, rejectClose: false,
    content: `<p>Delete <strong>${esc(note.label ?? note.text)}</strong> from this map?</p><p>The linked journal and item will be kept.</p>`
  });
  if (confirmed && canManageMapPoint(note)) return note.delete();
}

export function installLegacyMapPoints() {
  const BaseNote = CONFIG.Note?.objectClass;
  if (!BaseNote) return;
  CONFIG.Note.objectClass = class RealmGuardMapNote extends BaseNote {
    get isVisible() {
      if (legacyMixedPolishEnabled() && !game.user.isGM) {
        const visible = this.document.getFlag(NS, VISIBILITY);
        if (typeof visible === "boolean") return visible;
      }
      return super.isVisible;
    }

    _drawControlIcon() {
      const icon = super._drawControlIcon();
      if (legacyMixedPolishEnabled() && isRealmGuardMapPoint(this.document) && icon.bg) icon.bg.visible = false;
      return icon;
    }

    _refreshVisibility() {
      super._refreshVisibility();
      if (legacyMixedPolishEnabled() && isRealmGuardMapPoint(this.document)) this.controlIcon?.refresh({borderVisible: false});
    }

    _onClickRight2(event) {
      if (legacyMixedPolishEnabled() && game.user.isGM && isRealmGuardMapPoint(this.document) && !event.shiftKey) return;
      return super._onClickRight2(event);
    }
  };
  Hooks.on("updateNote", (note, changes) => {
    if (Object.hasOwn(changes.flags?.[NS] ?? {}, VISIBILITY)) note.object?.renderFlags.set({refreshVisibility: true});
  });
}

export async function createMapPoint(position) {
  if (!legacyMixedPolishEnabled() || !game.user?.isGM || !canvas.scene) return;
  const scene = canvas.scene;
  const result = await foundry.applications.api.DialogV2.wait({
    window: {title: "Create on map", resizable: true}, position: {width: 680}, modal: false, rejectClose: false,
    content: `<div class="rg-map-create">
      <label>Create<select name="kind"><option value="place">Place / landmark</option><option value="item">Item</option></select></label>
      <label>Item type (when creating an Item)<select name="itemType">${Object.entries(MAP_ITEM_TYPES).map(([id,label]) => `<option value="${id}">${label}</option>`).join("")}</select></label>
      <label class="rg-map-marker-name">Name<input name="name" required maxlength="100"></label>
      <div class="rg-map-marker-settings">${markerSizeField()}${markerVisibilityField()}</div>
      ${iconPicker()}
      <label>Information<textarea name="description" rows="6"></textarea></label>
    </div>`,
    render: bindIconPicker,
    buttons: [
      {action: "create", label: "Create on map", callback: (_event, button) => {
        if (!button.form.reportValidity()) return null;
        const fields = button.form.elements;
        return {kind: fields.kind.value, itemType: fields.itemType.value, name: fields.name.value.trim(), icon: fields.icon.value, description: fields.description.value, iconSize: fields.iconSize.valueAsNumber, visible: fields.visible.value === "show"};
      }},
      {action: "cancel", label: "Cancel", callback: () => null}
    ]
  });
  const iconSize = result?.iconSize ?? DEFAULT_SIZE;
  if (!result?.name || !game.user.isGM || canvas.scene?.id !== scene.id || !iconIds.has(result.icon) || !validSize(iconSize)) return;
  const texture = iconTexture(result.icon);
  const ownership = {default: result.visible ? CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER : CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE};
  let item;
  if (result.kind === "item") {
    const type = result.itemType ?? "gear";
    if (!Object.hasOwn(MAP_ITEM_TYPES, type)) return;
    item = await Item.create({name: result.name, type, img: texture, ownership, system: {description: result.description}});
  }
  let journal;
  try {
    const link = item ? `<p>@UUID[${item.uuid}]{${esc(item.name)}}</p>` : "";
    const information = esc(result.description).replace(/\r?\n/g, "<br>");
    journal = await JournalEntry.create({
      name: result.name, ownership,
      pages: [{name: result.name, type: "text", text: {format: 1, content: `<p>${information}</p>${link}`}}]
    });
    await scene.createEmbeddedDocuments("Note", [{
      entryId: journal.id, x: position.x, y: position.y, text: result.name,
      texture: {src: texture}, iconSize, global: false, flags: {[NS]: {[VISIBILITY]: result.visible}}
    }]);
  } catch (error) {
    await journal?.delete();
    await item?.delete();
    throw error;
  }
  ui.notifications.info("Marker created. Right-click it for marker actions.");
}
