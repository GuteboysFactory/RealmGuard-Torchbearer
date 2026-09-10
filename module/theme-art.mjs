export const RG_ART = Object.freeze({
  northern: {
    label: "Middle-earth Inspired Ranger",
    character: "systems/realm-guard/assets/actors/northern-ranger.webp",
    token: "systems/realm-guard/assets/tokens/northern-ranger-token.webp"
  },
  mouse: {
    label: "Mouse Guard Style Ranger",
    character: "systems/realm-guard/assets/actors/mouse-ranger.webp",
    token: "systems/realm-guard/assets/tokens/mouse-ranger-token.webp"
  },
  foundry: {
    label: "Foundry Default",
    character: "icons/svg/mystery-man.svg",
    token: "icons/svg/mystery-man.svg"
  }
});

export const RG_NPC_ART = Object.freeze({
  character: "systems/realm-guard/assets/actors/npc-creature.webp",
  token: "systems/realm-guard/assets/tokens/npc-creature-token.webp"
});

const DEFAULT_ICON = "icons/svg/mystery-man.svg";

export function currentArtTheme() {
  try { return String(game.settings.get("realm-guard", "defaultActorArt") || "northern"); }
  catch { return "northern"; }
}

export function artForActor(actorOrType, theme = currentArtTheme()) {
  const type = typeof actorOrType === "string" ? actorOrType : actorOrType?.type;
  if (theme === "foundry") return RG_ART.foundry;
  if (type === "npc") return { label: "Realm Guard Creature", ...RG_NPC_ART };
  return RG_ART[theme] ?? RG_ART.northern;
}

function isFoundryPlaceholder(src) {
  const value = String(src ?? "");
  return !value || value === DEFAULT_ICON || value.endsWith("/mystery-man.svg");
}

export function installRealmGuardArt() {
  game.settings.register("realm-guard", "defaultActorArt", {
    name: "Default Realm Guard Actor & Token Art",
    hint: "Choose the default Realm Guard portrait and prototype-token style for newly created characters. Middle-earth inspired art is the Realm Guard default; Mouse Guard style remains optional. Existing custom art is never overwritten automatically.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      northern: "Middle-earth Inspired Ranger (Realm Guard)",
      mouse: "Mouse Guard Style Ranger",
      foundry: "Foundry Default"
    },
    default: "northern"
  });
  game.settings.register("realm-guard", "placeholderArtUpgradeV0183", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  Hooks.on("preCreateActor", (actor, data) => {
    const theme = currentArtTheme();
    if (theme === "foundry") return;
    const art = artForActor(data?.type ?? actor.type, theme);
    const update = {};
    if (isFoundryPlaceholder(data?.img ?? actor.img)) update.img = art.character;
    const tokenSrc = foundry.utils.getProperty(data, "prototypeToken.texture.src") ?? actor.prototypeToken?.texture?.src;
    if (isFoundryPlaceholder(tokenSrc)) update["prototypeToken.texture.src"] = art.token;
    if (Object.keys(update).length) actor.updateSource(update);
  });

  Hooks.once("ready", async () => {
    if (!game.user?.isGM) return;
    if (game.settings.get("realm-guard", "placeholderArtUpgradeV0183")) return;
    const theme = currentArtTheme();
    if (theme === "foundry") return;
    let changed = 0;
    for (const actor of game.actors ?? []) {
      if (!['character', 'npc'].includes(actor.type)) continue;
      const art = artForActor(actor, theme);
      const update = {};
      if (isFoundryPlaceholder(actor.img)) update.img = art.character;
      if (isFoundryPlaceholder(actor.prototypeToken?.texture?.src)) update["prototypeToken.texture.src"] = art.token;
      if (!Object.keys(update).length) continue;
      await actor.update(update);
      changed += 1;
    }
    await game.settings.set("realm-guard", "placeholderArtUpgradeV0183", true);
    if (changed) ui.notifications.info(`Realm Guard: Replaced Foundry placeholder art on ${changed} Actor${changed === 1 ? "" : "s"}. Custom art was preserved.`);
  });
}

export async function chooseRealmGuardArt(actor) {
  if (!actor?.isOwner && !game.user?.isGM) return ui.notifications.warn("Realm Guard: You do not have permission to change this Actor's art.");
  const esc = foundry.utils.escapeHTML;
  const current = currentArtTheme();
  const content = `<div class="rg-art-picker">
    <p>Choose a Realm Guard portrait and prototype-token style for <b>${esc(actor.name)}</b>.</p>
    <label><input type="radio" name="theme" value="northern" ${current === "northern" ? "checked" : ""}> <img src="${RG_ART.northern.character}" alt=""> <span><b>Middle-earth Inspired</b><small>Realm Guard ranger art with a northern Middle-earth feel.</small></span></label>
    <label><input type="radio" name="theme" value="mouse" ${current === "mouse" ? "checked" : ""}> <img src="${RG_ART.mouse.character}" alt=""> <span><b>Mouse Guard Style</b><small>Optional woodland ranger art inspired by the Mouse Guard roots of the ruleset.</small></span></label>
    <label><input type="radio" name="theme" value="foundry" ${current === "foundry" ? "checked" : ""}> <span class="rg-art-foundry"><i class="fa-solid fa-user"></i></span> <span><b>Foundry Default</b><small>Restore the standard placeholder art.</small></span></label>
    <p class="rg-muted"><small>This changes the Actor portrait and prototype token. Tokens already placed on a Scene are not overwritten.</small></p>
  </div>`;
  const DialogV2 = foundry.applications.api.DialogV2;
  const theme = await DialogV2.wait({
    window: { title: "Realm Guard · Actor Art", resizable: true },
    content,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "apply", label: "Apply Art", icon: "fa-solid fa-palette", default: true, callback: (_event, button) => String(button.form?.elements?.theme?.value ?? "northern") },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });
  if (!theme) return;
  const art = artForActor(actor, theme);
  await actor.update({
    img: art.character,
    "prototypeToken.texture.src": art.token,
    "flags.realm-guard.portraitMode": "original",
    "flags.realm-guard.portraitSource": art.character,
    "flags.realm-guard.tokenBuilderSourcePortrait": art.character,
    "flags.realm-guard.tokenPortraitPath": art.token
  });
  ui.notifications.info(`Realm Guard: Applied ${art.label} source artwork to ${actor.name}. Original Portrait is active; portrait framing remains editable.`);
}
