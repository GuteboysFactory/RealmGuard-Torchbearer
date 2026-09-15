import { setRangerOriginalPortrait } from "./token-builder.mjs";

const NS = "realm-guard";
let installed = false;

function pickerApi() {
  return globalThis.FilePicker ?? globalThis.foundry?.applications?.apps?.FilePicker?.implementation ?? null;
}

async function ensureUploadDirectory(picker) {
  const root = "realm-guard";
  const nested = `${root}/token-art`;
  try { await picker.createDirectory?.("data", root, {}, { notify: false }); } catch (_error) {}
  try { await picker.createDirectory?.("data", nested, {}, { notify: false }); } catch (_error) {}
  return nested;
}

async function uploadDroppedFile(file) {
  const picker = pickerApi();
  if (!picker?.upload) throw new Error("Foundry FilePicker upload API is unavailable.");
  const directory = await ensureUploadDirectory(picker);
  const response = await picker.upload("data", directory, file, {}, { notify: false });
  const path = response?.path ?? response?.paths?.[0];
  if (!path) throw new Error("Dropped artwork upload returned no usable path.");
  return path;
}

function actorForDialog(app) {
  const direct = app?.actor ?? app?.document;
  if (direct?.documentName === "Actor" || direct?.type === "character" || direct?.type === "npc") return direct;
  const title = String(app?.window?.title ?? app?.options?.window?.title ?? "");
  const marker = "Token Builder · ";
  const actorName = title.includes(marker) ? title.slice(title.indexOf(marker) + marker.length).trim() : "";
  return actorName ? globalThis.game?.actors?.getName?.(actorName) ?? null : null;
}

function installDropTarget(app) {
  const element = app?.element;
  const root = element?.querySelector?.("[data-rg-token-builder]") ?? (element?.matches?.("[data-rg-token-builder]") ? element : null);
  if (!root || root.dataset.rgDropHotfix === "true") return false;
  const stage = root.querySelector("[data-rg-token-stage]");
  const image = root.querySelector("[data-rg-token-image]");
  const sourceInput = root.querySelector("[data-rg-token-source]");
  const xInput = root.querySelector("[data-rg-token-x]");
  const yInput = root.querySelector("[data-rg-token-y]");
  const zoomInput = root.querySelector("[data-rg-token-zoom]");
  const fitInput = root.querySelector("[data-rg-token-fit]");
  const actor = actorForDialog(app);
  if (!stage || !image || !sourceInput) return false;

  root.dataset.rgDropHotfix = "true";
  stage.dataset.rgDropReady = "true";
  stage.title = "Drop an image here, or drag the artwork to reposition it";

  stage.addEventListener("dragenter", event => {
    if (!event.dataTransfer?.types?.includes?.("Files")) return;
    event.preventDefault();
    stage.classList.add("is-file-dragover");
  });
  stage.addEventListener("dragover", event => {
    if (!event.dataTransfer?.types?.includes?.("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    stage.classList.add("is-file-dragover");
  });
  stage.addEventListener("dragleave", event => {
    if (!stage.contains(event.relatedTarget)) stage.classList.remove("is-file-dragover");
  });
  stage.addEventListener("drop", async event => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    event.preventDefault();
    event.stopPropagation();
    stage.classList.remove("is-file-dragover");
    if (!String(file.type ?? "").startsWith("image/")) {
      globalThis.ui?.notifications?.warn?.("Realm Guard: Drop an image file into Token Builder.");
      return;
    }
    try {
      stage.classList.add("is-uploading");
      const path = await uploadDroppedFile(file);
      sourceInput.value = path;
      image.src = path;
      if (xInput) xInput.value = "0";
      if (yInput) yInput.value = "0";
      if (zoomInput) zoomInput.value = "1";
      if (fitInput) fitInput.value = "cover";
      if (actor?.type === "character") await setRangerOriginalPortrait(actor, path, { switchToOriginal: true });
      globalThis.ui?.notifications?.info?.(`Realm Guard: ${file.name} loaded as source artwork${actor?.type === "character" ? " and set as the Ranger portrait" : ""}.`);
    } catch (error) {
      console.error("realm-guard | Token Builder dropped artwork failed", error);
      globalThis.ui?.notifications?.error?.(`Realm Guard: ${error.message || "Could not load dropped artwork."}`);
    } finally {
      stage.classList.remove("is-uploading");
    }
  });
  return true;
}

function keepCharacterPortraitOriginal(actor, changes) {
  if (actor?.type !== "character") return;
  const tokenPath = changes?.["prototypeToken.texture.src"] ?? globalThis.foundry?.utils?.getProperty?.(changes, "prototypeToken.texture.src");
  const requestedImg = String(changes?.img ?? "");
  if (!tokenPath || requestedImg !== String(tokenPath)) return;
  const original = String(changes?.["flags.realm-guard.portraitSource"] ?? actor.getFlag?.(NS, "portraitSource") ?? actor.getFlag?.(NS, "tokenBuilderSourcePortrait") ?? "").trim();
  if (!original) return;
  changes.img = original;
  changes["flags.realm-guard.portraitMode"] = "original";
}

async function repairLegacyCharacterPortraits() {
  if (!globalThis.game?.user?.isGM) return;
  for (const actor of game.actors?.contents ?? []) {
    if (actor.type !== "character") continue;
    const original = String(actor.getFlag?.(NS, "portraitSource") ?? actor.getFlag?.(NS, "tokenBuilderSourcePortrait") ?? "").trim();
    const token = String(actor.getFlag?.(NS, "tokenPortraitPath") ?? actor.prototypeToken?.texture?.src ?? "").trim();
    const mode = String(actor.getFlag?.(NS, "portraitMode") ?? "original");
    if (!original || (mode !== "token" && String(actor.img ?? "") !== token)) continue;
    try { await actor.update({ img: original, "flags.realm-guard.portraitMode": "original" }); }
    catch (error) { console.warn("realm-guard | Could not restore Ranger original portrait", actor.name, error); }
  }
}

function onDialogRender(app) {
  try { installDropTarget(app); } catch (error) { console.warn("realm-guard | Token Builder drag/drop install failed", error); }
}

Hooks.on("preUpdateActor", keepCharacterPortraitOriginal);
Hooks.on("renderDialogV2", onDialogRender);
Hooks.on("renderApplicationV2", onDialogRender);
Hooks.once("ready", async () => {
  installed = true;
  await repairLegacyCharacterPortraits();
  globalThis.game.realmGuard ??= {};
  game.realmGuard.tokenBuilderUx = Object.freeze({
    getStatus: () => Object.freeze({ phase: "M5", scope: "TOKEN_BUILDER_DRAG_DROP_AND_PC_PORTRAIT_SEPARATION", installed,
      characterPortraitShape: "SQUARE", tokenShape: "ROUND_PNG", dragDrop: true, tokenMayReplaceCharacterPortrait: false })
  });
  console.log("realm-guard | M5 Token Builder UX hotfix ready", game.realmGuard.tokenBuilderUx.getStatus());
});
