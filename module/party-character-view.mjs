import { RealmGuardActorSheet } from "../sheets/actor-sheet.mjs";

const TEMPLATE = "systems/realm-guard/templates/actor/party-character.hbs";

const openSheets = new Map();
const directories = new WeakSet();

const isPlayer = user => user?.hasRole("PLAYER") && !user.isGM;
const byName = (a, b) => a.name.localeCompare(b.name);

function assignedCharacter(user) {
  const actor = user?.character;
  return isPlayer(user) && user.active && actor?.type === "character" && actor.testUserPermission(user, "OWNER")
    ? actor : null;
}

function partyCharacters(viewer = game.user) {
  if (!isPlayer(viewer) || !viewer.active) return [];
  const actors = new Map();
  for (const user of game.users) {
    if (user.id === viewer.id) continue;
    const actor = assignedCharacter(user);
    if (!actor || actor.testUserPermission(viewer, "OWNER")
      || actor.ownership?.[viewer.id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE) continue;
    actors.set(actor.id, actor);
  }
  return [...actors.values()].sort(byName);
}

function isPartyCharacter(actor, viewer = game.user) {
  if (!actor || !isPlayer(viewer) || !viewer.active || actor.testUserPermission(viewer, "OWNER")
    || actor.ownership?.[viewer.id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE) return false;
  return game.users.some(user => user.id !== viewer.id && assignedCharacter(user)?.id === actor.id);
}

function publicBiography(html) {
  const template = document.createElement("template");
  template.innerHTML = html ?? "";
  for (const hidden of template.content.querySelectorAll(".secret, [hidden], script, style")) hidden.remove();
  for (const block of template.content.querySelectorAll("p, div, li, br, h1, h2, h3, h4")) block.append("\n");
  return template.content.textContent.trim();
}

const navigation = [
  "[data-rg-tab]", "[data-rg-character-tab]", "[data-rg-drive]",
  "[data-rg-conditions-toggle]", "[data-rg-conditions-close]",
  ".rg-header-toggle", ".rg-character-relationship-strip button", ".rg-inventory-search"
].join(", ");

class RealmGuardPartySheet extends RealmGuardActorSheet {
  static DEFAULT_OPTIONS = { classes: ["rg-party-read-only"], sheetConfig: false };

  get isVisible() { return isPartyCharacter(this.actor); }
  get isEditable() { return false; }

  async _preparePartContext(partId, context, options) {
    const part = await super._preparePartContext(partId, context, options);
    part.canViewCharacterNotes = false;
    part.characterBiography = publicBiography(this.actor.system.biography);
    return part;
  }

  _toggleDisabled() {
    super._toggleDisabled(true);
    const content = this.element?.querySelector(".window-content");
    if (!content) return;
    for (const control of content.querySelectorAll(navigation)) control.disabled = false;
    for (const field of content.querySelectorAll('textarea, input:not([type]), input[type="text"], input[type="number"]')) {
      field.readOnly = true;
      field.disabled = false;
    }
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const content = this.element?.querySelector(".window-content");
    if (content && !content.dataset.rgPartyReadOnly) {
      content.dataset.rgPartyReadOnly = "true";
      content.addEventListener("click", event => {
        const control = event.target.closest("button, [data-action]");
        if (!control || control.matches(navigation)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, { capture: true });
    }
    this._toggleDisabled();
  }
}

async function openPartyCharacters() {
  const Dialog = foundry.applications.api.DialogV2;
  const render = foundry.applications.handlebars.renderTemplate;
  const actors = partyCharacters().map(({ id, name, img }) => ({ id, name, img }));
  if (!actors.length) {
    ui.notifications.info("No party characters are available.");
    return;
  }

  await Dialog.prompt({
    window: { title: "Party Characters" },
    content: await render(TEMPLATE, { actors }),
    render: (_event, dialog) => dialog.element.querySelector("[data-rg-party-list]")?.addEventListener("click", async event => {
      const id = event.target.closest("button[data-rg-party-actor]")?.dataset.rgPartyActor;
      if (id) await openPartySheetFromClick(game.actors.get(id));
    }),
    ok: { label: "Close" },
    rejectClose: false,
  });
}

async function openPartySheet(actor) {
  if (!isPartyCharacter(actor)) return;
  const pending = openSheets.get(actor.id);
  if (pending) {
    pending.maximize();
    pending.bringToFront();
    return pending;
  }
  const dialog = new RealmGuardPartySheet({ document: actor });
  dialog.addEventListener("close", () => openSheets.delete(actor.id), { once: true });
  openSheets.set(actor.id, dialog);
  try {
    await dialog.render({ force: true });
  } catch (error) {
    openSheets.delete(actor.id);
    throw error;
  }
  if (!isPartyCharacter(actor)) await dialog.close();
  return dialog;
}

function openPartySheetFromClick(actor) {
  return openPartySheet(actor).catch(error => {
    console.error("Realm Guard | Could not open character", error);
    ui.notifications.error("Could not open the read-only character sheet.");
  });
}

function bindPartyDirectory(root) {
  if (directories.has(root)) return;
  directories.add(root);
  root.addEventListener("click", event => {
    if (!root.querySelector("[data-rg-party-characters]")) return;
    const entry = event.target.closest('[data-action="activateEntry"]')?.closest("[data-entry-id]");
    const actor = entry && game.actors.get(entry.dataset.entryId);
    if (!isPartyCharacter(actor)) return;
    event.preventDefault();
    event.stopPropagation();
    void openPartySheetFromClick(actor);
  }, { capture: true });
}

function availableTokenCharacter(token) {
  if (!token.visible || token.document.hidden || token.actor?.isOwner) return null;
  const actor = token.document.baseActor;
  return isPartyCharacter(actor) ? actor : null;
}

function addPartyButton(html) {
  if (!isPlayer(game.user)) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  const header = root?.querySelector(".directory-header");
  if (!header) return;
  bindPartyDirectory(root);
  if (header.querySelector("[data-rg-party-characters]")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "rg-actor-recruit rg-party-characters";
  button.dataset.rgPartyCharacters = "";
  button.innerHTML = '<i class="fa-solid fa-people-group" aria-hidden="true"></i> Party Characters';
  button.addEventListener("click", async event => {
    event.stopPropagation();
    button.disabled = true;
    try {
      await openPartyCharacters();
    } catch (error) {
      console.error("Realm Guard | Could not open Party Characters", error);
      ui.notifications.error("Could not open Party Characters.");
    } finally {
      button.disabled = false;
    }
  });
  const actions = header.querySelector(".header-actions");
  if (actions) actions.after(button);
  else header.prepend(button);
}

export function installPartyCharacterView() {
  CONFIG.Token.objectClass = class RealmGuardPartyToken extends CONFIG.Token.objectClass {
    _canView(user, event) {
      if (!availableTokenCharacter(this)) return super._canView(user, event);
      return !this.layer._draggedToken && this.layer.active && !this.isPreview
        && !canvas.controls.ruler.active && !(CONFIG.Canvas.rulerClass.canMeasure && event?.type === "pointerdown");
    }

    _onClickLeft2(event) {
      const actor = availableTokenCharacter(this);
      if (!actor) return super._onClickLeft2(event);
      if (!this._propagateLeftClick(event)) event.stopPropagation();
      return openPartySheetFromClick(actor);
    }
  };
  Hooks.once("ready", () => addPartyButton(ui.actors?.element));
  Hooks.on("renderActorDirectory", (_app, html) => addPartyButton(html));
  const closeUnavailable = () => {
    for (const [id, dialog] of openSheets) {
      if (!isPartyCharacter(game.actors.get(id))) void dialog.close();
    }
  };
  Hooks.on("userConnected", closeUnavailable);
  Hooks.on("updateUser", closeUnavailable);
  Hooks.on("updateActor", closeUnavailable);
  Hooks.on("deleteActor", closeUnavailable);
}
