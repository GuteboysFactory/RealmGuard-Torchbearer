const NS = "realm-guard";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value ?? 0)));
}

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function tokenTexture(actor) {
  return actor?.prototypeToken?.texture ?? {};
}

function normalizedFraming(value = {}, defaults = {}) {
  return {
    fit: String(value?.fit ?? defaults.fit ?? "cover") === "contain" ? "contain" : "cover",
    zoom: clamp(value?.zoom ?? defaults.zoom ?? 1, 0.25, 5),
    offsetX: clamp(value?.offsetX ?? defaults.offsetX ?? 0, -150, 150),
    offsetY: clamp(value?.offsetY ?? defaults.offsetY ?? 0, -150, 150)
  };
}

export function rangerPortraitState(actor) {
  const preserved = String(actor?.getFlag?.(NS, "portraitSource") || actor?.getFlag?.(NS, "tokenBuilderSourcePortrait") || "").trim();
  const tokenPath = String(actor?.getFlag?.(NS, "tokenPortraitPath") || tokenTexture(actor)?.src || "").trim();
  const rawMode = String(actor?.getFlag?.(NS, "portraitMode") || "original");
  const actorImage = String(actor?.img || "icons/svg/mystery-man.svg");
  const originalSource = preserved || (rawMode === "token" && tokenPath === actorImage ? "" : actorImage) || "icons/svg/mystery-man.svg";
  const mode = rawMode === "token" && tokenPath ? "token" : "original";
  const originalFraming = normalizedFraming(actor?.getFlag?.(NS, "portraitFramingOriginal"));
  const tokenFraming = normalizedFraming(actor?.getFlag?.(NS, "portraitFramingToken"), { fit: "contain" });
  const framing = mode === "token" ? tokenFraming : originalFraming;
  return {
    mode,
    originalSource,
    tokenPath,
    hasTokenPortrait: Boolean(tokenPath),
    src: mode === "token" ? tokenPath : originalSource,
    framing,
    originalFraming,
    tokenFraming,
    tokenMode: mode === "token"
  };
}

export async function setRangerOriginalPortrait(actor, source, { switchToOriginal = true } = {}) {
  const src = String(source || "").trim();
  if (!actor || !src) return false;
  const current = rangerPortraitState(actor);
  const updates = {
    "flags.realm-guard.portraitSource": src,
    "flags.realm-guard.tokenBuilderSourcePortrait": src
  };
  if (switchToOriginal || current.mode !== "token") {
    updates["flags.realm-guard.portraitMode"] = "original";
    updates.img = src;
  }
  await actor.update(updates);
  return true;
}

function safeFilePart(value = "token") {
  const clean = String(value || "token")
    .normalize?.("NFKD")
    ?.replace(/[\u0300-\u036f]/g, "") ?? String(value || "token");
  return clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "token";
}

async function ensureTokenArtDirectory(picker) {
  const nested = "realm-guard/token-art";
  const fallback = "realm-guard-token-art";
  for (const dir of ["realm-guard", nested]) {
    try { await picker.createDirectory?.("data", dir, {}, { notify: false }); }
    catch (_error) { /* existing directory is expected */ }
  }
  if (picker.browse) {
    try { await picker.browse("data", nested, {}); return nested; }
    catch (_error) { /* use fallback */ }
  } else return nested;

  try { await picker.createDirectory?.("data", fallback, {}, { notify: false }); }
  catch (_error) { /* existing directory is expected */ }
  if (picker.browse) {
    try { await picker.browse("data", fallback, {}); return fallback; }
    catch (_error) { /* handled below */ }
  } else return fallback;
  throw new Error("Could not create a token-art upload folder in Foundry Data.");
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load token source image: ${source}`));
    image.src = source;
  });
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Token image rendering returned no image data.")), "image/png");
  });
}

/**
 * Render the selected portrait crop into a real circular PNG and upload it to Foundry Data.
 * offsetX/offsetY are normalized stage percentages, so preview movement and final rendering match.
 */
export async function createRoundTokenAsset(actor, {
  source = null,
  fit = "cover",
  zoom = 1,
  offsetX = 0,
  offsetY = 0
} = {}) {
  if (!actor) throw new Error("Actor is required to create a token image.");
  const src = String(source || actor.img || tokenTexture(actor)?.src || "");
  if (!src) throw new Error("No artwork is available for this token.");

  const picker = globalThis.FilePicker ?? foundry.applications?.apps?.FilePicker?.implementation;
  if (!picker?.upload) throw new Error("Foundry FilePicker upload API is unavailable in this client.");

  const image = await loadImage(src);
  const outputSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Browser canvas is unavailable for Token Builder.");
  ctx.clearRect(0, 0, outputSize, outputSize);

  const radius = outputSize * 0.47;
  ctx.save();
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const iw = Math.max(1, Number(image.naturalWidth || image.width || outputSize));
  const ih = Math.max(1, Number(image.naturalHeight || image.height || outputSize));
  const mode = String(fit) === "contain" ? "contain" : "cover";
  const ratio = mode === "contain"
    ? Math.min(outputSize / iw, outputSize / ih)
    : Math.max(outputSize / iw, outputSize / ih);
  const z = clamp(zoom, 0.25, 5);
  const drawW = iw * ratio * z;
  const drawH = ih * ratio * z;
  const shiftX = clamp(offsetX, -150, 150) / 100 * outputSize;
  const shiftY = clamp(offsetY, -150, 150) / 100 * outputSize;
  const dx = (outputSize - drawW) / 2 + shiftX;
  const dy = (outputSize - drawH) / 2 + shiftY;
  ctx.drawImage(image, dx, dy, drawW, drawH);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, radius, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#d9bd79";
  ctx.stroke();
  ctx.restore();

  const blob = await canvasBlob(canvas);
  const directory = await ensureTokenArtDirectory(picker);
  const fileName = `${safeFilePart(actor.name)}-${safeFilePart(actor.id || "actor")}-${Date.now()}-token.png`;
  const file = new File([blob], fileName, { type: "image/png" });
  const response = await picker.upload("data", directory, file, {}, { notify: false });
  const path = response?.path ?? response?.paths?.[0];
  if (!path) throw new Error("Token upload did not return a usable path.");
  return path;
}

async function updateCurrentSceneTokens(actor, tokenPath, size) {
  const scene = canvas?.scene;
  if (!scene) return 0;
  const updates = (scene.tokens?.contents ?? [])
    .filter(token => String(token.actorId ?? "") === String(actor.id ?? ""))
    .map(token => ({
      _id: token.id,
      width: size,
      height: size,
      "texture.src": tokenPath,
      "texture.fit": "contain",
      "texture.anchorX": 0.5,
      "texture.anchorY": 0.5,
      "texture.scaleX": 1,
      "texture.scaleY": 1
    }));
  if (!updates.length) return 0;
  await scene.updateEmbeddedDocuments("Token", updates);
  return updates.length;
}

export async function openQuickTokenBuilder(actor) {
  if (!actor) return false;
  if (!actor.isOwner && !game.user?.isGM) return ui.notifications.warn("Realm Guard: You do not have permission to edit this Actor's prototype token.");

  // Always begin from the preserved source artwork when available. Once an NPC token is saved,
  // actor.img may intentionally become the round token portrait, so keep the original artwork in a flag.
  const texture = tokenTexture(actor);
  const portraitState = rangerPortraitState(actor);
  const preservedSource = actor.getFlag?.(NS, "tokenBuilderSourcePortrait");
  const source = String(preservedSource || portraitState.originalSource || actor.img || texture.src || "icons/svg/mystery-man.svg");
  const savedFraming = normalizedFraming(actor.getFlag?.(NS, "tokenBuilderFraming"));
  const fit = savedFraming.fit;
  const zoom = savedFraming.zoom;
  const x = savedFraming.offsetX;
  const y = savedFraming.offsetY;
  const width = clamp(actor.prototypeToken?.width ?? 1, 0.5, 6);
  const height = clamp(actor.prototypeToken?.height ?? 1, 0.5, 6);

  const content = `<div class="rg-token-builder" data-rg-token-builder>
    <header><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Quick Token Builder</h2><p>Move the full portrait, zoom it and frame it inside the round guide. Nothing is saved until you choose <b>Create / Save Token</b>.</p></header>
    <div class="rg-token-builder-layout">
      <div class="rg-token-builder-stage" data-rg-token-stage title="Drag the full artwork to reposition it">
        <img src="${esc(source)}" alt="${esc(actor.name)} token preview" data-rg-token-image>
        <span class="rg-token-builder-ring" aria-hidden="true"></span>
      </div>
      <div class="rg-token-builder-controls">
        <input type="hidden" name="tokenSource" value="${esc(source)}" data-rg-token-source>
        <input type="hidden" name="offsetX" value="${x}" data-rg-token-x>
        <input type="hidden" name="offsetY" value="${y}" data-rg-token-y>
        <label>Zoom <input type="range" name="zoom" min="0.25" max="5" step="0.05" value="${zoom}" data-rg-token-zoom><output data-rg-token-zoom-label>${zoom.toFixed(2)}x</output></label>
        <label>Framing <select name="fit" data-rg-token-fit><option value="cover" ${fit === "cover" ? "selected" : ""}>Fill / Crop</option><option value="contain" ${fit === "contain" ? "selected" : ""}>Fit Entire Image</option></select></label>
        <div class="rg-token-builder-actions"><button type="button" data-rg-token-center><i class="fa-solid fa-crosshairs"></i> Center</button><button type="button" data-rg-token-fit-button><i class="fa-solid fa-compress"></i> Fit</button><button type="button" data-rg-token-fill-button><i class="fa-solid fa-expand"></i> Fill</button></div>
        <label>Token Size <select name="size"><option value="1" ${width === 1 && height === 1 ? "selected" : ""}>1 × 1</option><option value="2" ${width === 2 && height === 2 ? "selected" : ""}>2 × 2</option><option value="3" ${width === 3 && height === 3 ? "selected" : ""}>3 × 3</option></select></label>
        <button type="button" class="rg-token-use-portrait" data-rg-token-use-portrait><i class="fa-solid fa-image"></i> Reset to Source Artwork</button>
        <label class="rg-token-update-scene"><span>Current Scene</span><span><input type="checkbox" name="updatePlaced" checked> Update placed tokens for this Actor</span></label>
        <small>Center, Fit, Fill, dragging and zoom only change the preview. Create / Save Token renders the current framing into a new round PNG and then updates the prototype token.</small>
      </div>
    </div>
  </div>`;

  const DialogV2 = foundry.applications.api.DialogV2;
  const dialog = new DialogV2({
    window: { title: `Realm Guard · Token Builder · ${actor.name}`, resizable: true },
    content,
    modal: false,
    buttons: [
      {
        action: "save",
        label: "Create / Save Token",
        icon: "fa-solid fa-floppy-disk",
        default: true,
        callback: async (_event, button) => {
          const form = button.form;
          if (!form) return false;
          try {
            const src = String(form.elements.tokenSource?.value || actor.img || source);
            const fitMode = String(form.elements.fit?.value || "cover");
            const zoomValue = clamp(form.elements.zoom?.value ?? 1, 0.25, 5);
            const ox = clamp(form.elements.offsetX?.value ?? 0, -150, 150);
            const oy = clamp(form.elements.offsetY?.value ?? 0, -150, 150);
            const size = clamp(form.elements.size?.value ?? 1, 0.5, 6);
            const tokenPath = await createRoundTokenAsset(actor, { source: src, fit: fitMode, zoom: zoomValue, offsetX: ox, offsetY: oy });
            const actorUpdate = {
              "flags.realm-guard.tokenBuilderSourcePortrait": src,
              "flags.realm-guard.portraitSource": String(actor.getFlag?.(NS, "portraitSource") || src),
              "flags.realm-guard.tokenBuilderFraming": { fit: fitMode, zoom: zoomValue, offsetX: ox, offsetY: oy },
              "flags.realm-guard.tokenPortraitPath": tokenPath,
              "prototypeToken.name": actor.name,
              "prototypeToken.width": size,
              "prototypeToken.height": size,
              "prototypeToken.texture.src": tokenPath,
              "prototypeToken.texture.fit": "contain",
              "prototypeToken.texture.anchorX": 0.5,
              "prototypeToken.texture.anchorY": 0.5,
              "prototypeToken.texture.scaleX": 1,
              "prototypeToken.texture.scaleY": 1
            };
            // NPCs keep their existing round-token-as-portrait workflow. Rangers only switch
            // Actor portrait when Token Portrait mode is explicitly selected. Original source art
            // remains preserved for both Actor types.
            if (actor.type === "npc" || String(actor.getFlag?.(NS, "portraitMode") || "original") === "token") actorUpdate.img = tokenPath;
            await actor.update(actorUpdate);
            const updatePlaced = Boolean(form.elements.updatePlaced?.checked);
            const updated = updatePlaced ? await updateCurrentSceneTokens(actor, tokenPath, size) : 0;
            ui.notifications.info(`Realm Guard: Token saved for ${actor.name}${updated ? ` and ${updated} Scene token${updated === 1 ? "" : "s"} updated` : ""}.`);
            return true;
          } catch (error) {
            console.error(`${NS} | Token Builder save failed`, error);
            ui.notifications.error(`Realm Guard: ${error.message || "Token Builder could not save the token."}`);
            return false;
          }
        }
      },
      { action: "cancel", label: "Cancel", callback: () => false }
    ]
  });

  await dialog.render(true);
  const root = dialog.element?.querySelector?.("[data-rg-token-builder]") ?? dialog.element;
  if (!root) return dialog;
  const stage = root.querySelector("[data-rg-token-stage]");
  const image = root.querySelector("[data-rg-token-image]");
  const xInput = root.querySelector("[data-rg-token-x]");
  const yInput = root.querySelector("[data-rg-token-y]");
  const zoomInput = root.querySelector("[data-rg-token-zoom]");
  const zoomLabel = root.querySelector("[data-rg-token-zoom-label]");
  const fitInput = root.querySelector("[data-rg-token-fit]");
  const sourceInput = root.querySelector("[data-rg-token-source]");

  const refresh = () => {
    if (!stage || !image) return;
    const stageW = Math.max(1, stage.clientWidth || 360);
    const stageH = Math.max(1, stage.clientHeight || stageW);
    const iw = Math.max(1, Number(image.naturalWidth || stageW));
    const ih = Math.max(1, Number(image.naturalHeight || stageH));
    const mode = String(fitInput?.value || "cover") === "contain" ? "contain" : "cover";
    const ratio = mode === "contain" ? Math.min(stageW / iw, stageH / ih) : Math.max(stageW / iw, stageH / ih);
    const z = clamp(zoomInput?.value ?? 1, 0.25, 5);
    const ox = clamp(xInput?.value ?? 0, -150, 150);
    const oy = clamp(yInput?.value ?? 0, -150, 150);
    image.style.width = `${iw * ratio * z}px`;
    image.style.height = `${ih * ratio * z}px`;
    image.style.left = `${stageW / 2 + stageW * ox / 100}px`;
    image.style.top = `${stageH / 2 + stageH * oy / 100}px`;
    image.style.transform = "translate(-50%, -50%)";
    if (zoomLabel) zoomLabel.textContent = `${z.toFixed(2)}x`;
  };

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  stage?.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    originX = Number(xInput?.value ?? 0);
    originY = Number(yInput?.value ?? 0);
    stage.setPointerCapture?.(event.pointerId);
  });
  stage?.addEventListener("pointermove", event => {
    if (!dragging || !stage) return;
    const stageW = Math.max(1, stage.clientWidth || 360);
    const stageH = Math.max(1, stage.clientHeight || stageW);
    if (xInput) xInput.value = String(clamp(originX + ((event.clientX - startX) / stageW) * 100, -150, 150));
    if (yInput) yInput.value = String(clamp(originY + ((event.clientY - startY) / stageH) * 100, -150, 150));
    refresh();
  });
  const endDrag = event => { dragging = false; stage?.releasePointerCapture?.(event.pointerId); };
  stage?.addEventListener("pointerup", endDrag);
  stage?.addEventListener("pointercancel", endDrag);
  zoomInput?.addEventListener("input", refresh);
  fitInput?.addEventListener("change", refresh);
  image?.addEventListener("load", refresh);
  root.querySelector("[data-rg-token-center]")?.addEventListener("click", () => { if (xInput) xInput.value = "0"; if (yInput) yInput.value = "0"; refresh(); });
  root.querySelector("[data-rg-token-fit-button]")?.addEventListener("click", () => { if (fitInput) fitInput.value = "contain"; if (zoomInput) zoomInput.value = "1"; refresh(); });
  root.querySelector("[data-rg-token-fill-button]")?.addEventListener("click", () => { if (fitInput) fitInput.value = "cover"; if (zoomInput) zoomInput.value = "1"; refresh(); });
  root.querySelector("[data-rg-token-use-portrait]")?.addEventListener("click", () => {
    if (sourceInput) sourceInput.value = source;
    if (image) image.src = source;
    if (xInput) xInput.value = "0";
    if (yInput) yInput.value = "0";
    if (zoomInput) zoomInput.value = "1";
    if (fitInput) fitInput.value = "cover";
    refresh();
  });
  if (stage && globalThis.ResizeObserver) new ResizeObserver(() => refresh()).observe(stage);
  refresh();
  return dialog;
}

/**
 * Ranger sheet portrait framing. This is intentionally separate from Token Builder:
 * it never re-renders source art and never destroys the preserved original portrait.
 */
export async function openRangerPortraitEditor(actor) {
  if (!actor || actor.type !== "character") return false;
  if (!actor.isOwner && !game.user?.isGM) return ui.notifications.warn("Realm Guard: You do not have permission to edit this Ranger portrait.");

  const state = rangerPortraitState(actor);
  const mode = state.mode;
  const workingFraming = {
    original: normalizedFraming(state.originalFraming, { fit: "cover" }),
    token: normalizedFraming(state.tokenFraming, { fit: "contain" })
  };
  let activeMode = mode;
  const framing = workingFraming[mode];
  const tokenOption = state.hasTokenPortrait
    ? `<option value="token" ${mode === "token" ? "selected" : ""} data-rg-help="Use the finished round token image as the character-sheet portrait. The original source artwork is preserved and can be restored at any time.">Token Portrait</option>`
    : `<option value="token" disabled data-rg-help="Create a token in Token Builder first. Once a finished token exists, it can be used as the character-sheet portrait.">Token Portrait · create a token first</option>`;

  const content = `<div class="rg-portrait-editor" data-rg-portrait-editor>
    <header><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Character Portrait</h2><p>Choose which image the sheet uses, then drag and zoom it until the framing looks right. Your framing is saved to this Ranger and survives reloads.</p></header>
    <div class="rg-portrait-editor-layout">
      <div class="rg-portrait-editor-stage ${mode === "token" ? "is-token" : ""}" data-rg-portrait-editor-stage title="Drag artwork to reposition it">
        <img src="${esc(state.src)}" alt="${esc(actor.name)} portrait preview" data-rg-portrait-editor-image>
      </div>
      <div class="rg-portrait-editor-controls">
        <label>Portrait Mode <select name="portraitMode" data-rg-portrait-mode><option value="original" ${mode === "original" ? "selected" : ""} data-rg-help="Show the preserved full source artwork on the Ranger sheet. Its crop, position and zoom are saved independently from Token Portrait.">Original Portrait</option>${tokenOption}</select></label>
        <input type="hidden" name="offsetX" value="${framing.offsetX}" data-rg-portrait-x>
        <input type="hidden" name="offsetY" value="${framing.offsetY}" data-rg-portrait-y>
        <label>Zoom <input type="range" name="zoom" min="0.25" max="5" step="0.05" value="${framing.zoom}" data-rg-portrait-zoom><output data-rg-portrait-zoom-label>${framing.zoom.toFixed(2)}x</output></label>
        <label>Framing <select name="fit" data-rg-portrait-fit><option value="cover" ${framing.fit === "cover" ? "selected" : ""}>Fill / Crop</option><option value="contain" ${framing.fit === "contain" ? "selected" : ""}>Fit Entire Image</option></select></label>
        <div class="rg-token-builder-actions"><button type="button" data-rg-portrait-center><i class="fa-solid fa-crosshairs"></i> Center</button><button type="button" data-rg-portrait-fit-button><i class="fa-solid fa-compress"></i> Fit</button><button type="button" data-rg-portrait-fill-button><i class="fa-solid fa-expand"></i> Fill</button></div>
        <small><b>Original Portrait</b> and <b>Token Portrait</b> keep separate saved framing. Switching modes never deletes the original source artwork.</small>
      </div>
    </div>
  </div>`;

  const dialog = new foundry.applications.api.DialogV2({
    window: { title: `Realm Guard · Character Portrait · ${actor.name}`, resizable: true },
    content,
    modal: false,
    buttons: [
      {
        action: "save",
        label: "Save Portrait",
        icon: "fa-solid fa-floppy-disk",
        default: true,
        callback: async (_event, button) => {
          const form = button.form;
          if (!form) return false;
          const selectedMode = String(form.elements.portraitMode?.value || "original") === "token" && state.hasTokenPortrait ? "token" : "original";
          workingFraming[selectedMode] = normalizedFraming({
            fit: form.elements.fit?.value,
            zoom: form.elements.zoom?.value,
            offsetX: form.elements.offsetX?.value,
            offsetY: form.elements.offsetY?.value
          }, { fit: selectedMode === "token" ? "contain" : "cover" });
          const imagePath = selectedMode === "token" ? state.tokenPath : state.originalSource;
          const updates = {
            "flags.realm-guard.portraitMode": selectedMode,
            "flags.realm-guard.portraitSource": state.originalSource,
            "flags.realm-guard.tokenBuilderSourcePortrait": state.originalSource,
            "flags.realm-guard.portraitFramingOriginal": workingFraming.original,
            "flags.realm-guard.portraitFramingToken": workingFraming.token,
            img: imagePath
          };
          await actor.update(updates);
          ui.notifications.info(`Realm Guard: ${actor.name} now uses ${selectedMode === "token" ? "Token Portrait" : "Original Portrait"}.`);
          return true;
        }
      },
      { action: "cancel", label: "Cancel", callback: () => false }
    ]
  });

  await dialog.render(true);
  const root = dialog.element?.querySelector?.("[data-rg-portrait-editor]") ?? dialog.element;
  if (!root) return dialog;
  const stage = root.querySelector("[data-rg-portrait-editor-stage]");
  const image = root.querySelector("[data-rg-portrait-editor-image]");
  const modeInput = root.querySelector("[data-rg-portrait-mode]");
  const fitInput = root.querySelector("[data-rg-portrait-fit]");
  const zoomInput = root.querySelector("[data-rg-portrait-zoom]");
  const zoomLabel = root.querySelector("[data-rg-portrait-zoom-label]");
  const xInput = root.querySelector("[data-rg-portrait-x]");
  const yInput = root.querySelector("[data-rg-portrait-y]");

  const framingForMode = selectedMode => workingFraming[selectedMode === "token" ? "token" : "original"];
  const sourceForMode = selectedMode => selectedMode === "token" ? state.tokenPath : state.originalSource;
  const captureActiveFraming = () => {
    workingFraming[activeMode] = normalizedFraming({
      fit: fitInput?.value,
      zoom: zoomInput?.value,
      offsetX: xInput?.value,
      offsetY: yInput?.value
    }, { fit: activeMode === "token" ? "contain" : "cover" });
  };
  const refresh = () => {
    if (!stage || !image) return;
    const stageW = Math.max(1, stage.clientWidth || 360);
    const stageH = Math.max(1, stage.clientHeight || stageW);
    const iw = Math.max(1, Number(image.naturalWidth || stageW));
    const ih = Math.max(1, Number(image.naturalHeight || stageH));
    const fitMode = String(fitInput?.value || "cover") === "contain" ? "contain" : "cover";
    const ratio = fitMode === "contain" ? Math.min(stageW / iw, stageH / ih) : Math.max(stageW / iw, stageH / ih);
    const z = clamp(zoomInput?.value ?? 1, 0.25, 5);
    const ox = clamp(xInput?.value ?? 0, -150, 150);
    const oy = clamp(yInput?.value ?? 0, -150, 150);
    image.style.width = `${iw * ratio * z}px`;
    image.style.height = `${ih * ratio * z}px`;
    image.style.left = `${stageW / 2 + stageW * ox / 100}px`;
    image.style.top = `${stageH / 2 + stageH * oy / 100}px`;
    image.style.transform = "translate(-50%, -50%)";
    if (zoomLabel) zoomLabel.textContent = `${z.toFixed(2)}x`;
  };

  const loadMode = selectedMode => {
    const actualMode = selectedMode === "token" && state.hasTokenPortrait ? "token" : "original";
    const next = normalizedFraming(framingForMode(actualMode), { fit: actualMode === "token" ? "contain" : "cover" });
    activeMode = actualMode;
    stage?.classList.toggle("is-token", actualMode === "token");
    if (image) image.src = sourceForMode(actualMode);
    if (fitInput) fitInput.value = next.fit;
    if (zoomInput) zoomInput.value = String(next.zoom);
    if (xInput) xInput.value = String(next.offsetX);
    if (yInput) yInput.value = String(next.offsetY);
    refresh();
    // The system-wide smart select listens to native change events; modeInput remains the canonical form field.
  };

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  stage?.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    originX = Number(xInput?.value ?? 0);
    originY = Number(yInput?.value ?? 0);
    stage.setPointerCapture?.(event.pointerId);
  });
  stage?.addEventListener("pointermove", event => {
    if (!dragging || !stage) return;
    const stageW = Math.max(1, stage.clientWidth || 360);
    const stageH = Math.max(1, stage.clientHeight || stageW);
    if (xInput) xInput.value = String(clamp(originX + ((event.clientX - startX) / stageW) * 100, -150, 150));
    if (yInput) yInput.value = String(clamp(originY + ((event.clientY - startY) / stageH) * 100, -150, 150));
    refresh();
  });
  const endDrag = event => { dragging = false; stage?.releasePointerCapture?.(event.pointerId); };
  stage?.addEventListener("pointerup", endDrag);
  stage?.addEventListener("pointercancel", endDrag);
  modeInput?.addEventListener("change", () => {
    captureActiveFraming();
    loadMode(String(modeInput.value || "original"));
  });
  zoomInput?.addEventListener("input", refresh);
  fitInput?.addEventListener("change", refresh);
  image?.addEventListener("load", refresh);
  root.querySelector("[data-rg-portrait-center]")?.addEventListener("click", () => { if (xInput) xInput.value = "0"; if (yInput) yInput.value = "0"; refresh(); });
  root.querySelector("[data-rg-portrait-fit-button]")?.addEventListener("click", () => { if (fitInput) fitInput.value = "contain"; if (zoomInput) zoomInput.value = "1"; refresh(); });
  root.querySelector("[data-rg-portrait-fill-button]")?.addEventListener("click", () => { if (fitInput) fitInput.value = "cover"; if (zoomInput) zoomInput.value = "1"; refresh(); });
  if (stage && globalThis.ResizeObserver) new ResizeObserver(() => refresh()).observe(stage);
  refresh();
  return dialog;
}
