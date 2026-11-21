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
  const tomeArt = actor?.flags?.["adventurers-tome"]?.tokenArtV1;
  const texturePath = tokenTexture(actor)?.src;
  const preserved = String(actor?.getFlag?.(NS, "portraitSource") || actor?.getFlag?.(NS, "tokenBuilderSourcePortrait") || tomeArt?.source || "").trim();
  // The current prototype contains Tome's output. Keep the legacy path for older actors.
  const tokenPath = String((tomeArt && texturePath) || actor?.getFlag?.(NS, "tokenPortraitPath") || texturePath || "").trim();
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
    : `<option value="token" disabled data-rg-help="A token image becomes available here when the Actor has one.">Token Portrait · create a token first</option>`;

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
        <div class="rg-portrait-editor-actions"><button type="button" data-rg-portrait-center><i class="fa-solid fa-crosshairs"></i> Center</button><button type="button" data-rg-portrait-fit-button><i class="fa-solid fa-compress"></i> Fit</button><button type="button" data-rg-portrait-fill-button><i class="fa-solid fa-expand"></i> Fill</button></div>
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
