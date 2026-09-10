const TOOL_REGISTRY = new Map();
const DOCK_ID = "rg-gm-dock";
const NS = "realm-guard";
let resizeObserver = null;
let mutationObserver = null;
let observedHotbar = null;
let positionFrame = null;
let retryTimer = null;

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

export function registerGmDockTool({ id, icon, tooltip, order = 100, visible = null, onClick }) {
  if (!id || typeof onClick !== "function") throw new Error("Realm Guard / Torchbearer GM Dock tool requires id and onClick.");
  TOOL_REGISTRY.set(id, {
    id,
    icon: icon || "fa-solid fa-toolbox",
    tooltip: tooltip || id,
    order,
    visible: typeof visible === "function" ? visible : () => true,
    onClick
  });
  if (game?.ready) renderGmDock();
}

function getHotbarElement() {
  const hotbar = ui?.hotbar?.element;
  if (hotbar instanceof HTMLElement) return hotbar;
  return document.querySelector("#hotbar");
}

function removeDock() {
  document.getElementById(DOCK_ID)?.remove();
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  resizeObserver = null;
  mutationObserver = null;
  observedHotbar = null;
}

function schedulePosition() {
  if (positionFrame) cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(() => {
    positionFrame = null;
    positionDock();
  });
}

function observeHotbar(hotbar) {
  if (observedHotbar === hotbar) return;
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  observedHotbar = hotbar;

  resizeObserver = new ResizeObserver(() => schedulePosition());
  resizeObserver.observe(hotbar);

  mutationObserver = new MutationObserver(() => schedulePosition());
  mutationObserver.observe(hotbar, { attributes: true, childList: true, subtree: true });
}

function clampDockPosition(left, top, dock) {
  const edge = 8;
  const rect = dock.getBoundingClientRect();
  return {
    left: Math.min(Math.max(edge, Number(left) || edge), Math.max(edge, window.innerWidth - rect.width - edge)),
    top: Math.min(Math.max(edge, Number(top) || edge), Math.max(edge, window.innerHeight - rect.height - edge))
  };
}

function savedDockPosition() {
  const pos = game.user?.getFlag?.(NS, "gmDockPosition");
  return pos && Number.isFinite(Number(pos.left)) && Number.isFinite(Number(pos.top)) ? { left: Number(pos.left), top: Number(pos.top) } : null;
}

function positionDock() {
  const dock = document.getElementById(DOCK_ID);
  const hotbar = getHotbarElement();
  if (!dock || !hotbar) return;

  const saved = savedDockPosition();
  if (saved) {
    const clamped = clampDockPosition(saved.left, saved.top, dock);
    dock.dataset.placement = "custom";
    dock.classList.add("is-custom-position");
    dock.style.left = `${Math.round(clamped.left)}px`;
    dock.style.top = `${Math.round(clamped.top)}px`;
    return;
  }
  dock.classList.remove("is-custom-position");

  const gap = 8;
  const edge = 8;
  const hotbarRect = hotbar.getBoundingClientRect();
  const dockRect = dock.getBoundingClientRect();

  let placement = "right";
  let left = hotbarRect.right + gap;
  let top = hotbarRect.bottom - dockRect.height;

  if (left + dockRect.width > window.innerWidth - edge) {
    placement = "left";
    left = hotbarRect.left - gap - dockRect.width;
  }

  if (left < edge) {
    placement = "above";
    left = Math.min(Math.max(edge, hotbarRect.right - dockRect.width), window.innerWidth - dockRect.width - edge);
    top = hotbarRect.top - gap - dockRect.height;
  }

  top = Math.min(Math.max(edge, top), window.innerHeight - dockRect.height - edge);
  dock.dataset.placement = placement;
  dock.style.left = `${Math.round(left)}px`;
  dock.style.top = `${Math.round(top)}px`;
}

function buildDock() {
  let dock = document.getElementById(DOCK_ID);
  if (!dock) {
    dock = document.createElement("aside");
    dock.id = DOCK_ID;
    dock.className = "rg-gm-dock";
    dock.setAttribute("role", "toolbar");
    dock.setAttribute("aria-label", "Realm Guard / Torchbearer GM Dock");
    document.body.append(dock);
  }

  const tools = [...TOOL_REGISTRY.values()]
    .filter(tool => {
      try { return tool.visible?.() !== false; }
      catch (_error) { return true; }
    })
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  dock.innerHTML = `<span class="rg-gm-dock-brand rg-gm-dock-drag" title="Drag GM Dock" data-tooltip="Drag GM Dock" data-tooltip-direction="UP"><i class="fa-solid fa-grip-lines"></i><b>RG/TB</b></span>${tools.map(tool => `
    <button type="button" class="rg-gm-dock-tool" data-rg-gm-tool="${esc(tool.id)}" title="${esc(tool.tooltip)}" data-tooltip="${esc(tool.tooltip)}" data-tooltip-direction="UP" aria-label="${esc(tool.tooltip)}">
      <i class="${esc(tool.icon)}"></i>
    </button>`).join("")}<button type="button" class="rg-gm-dock-reset" title="Reset GM Dock position" data-tooltip="Reset GM Dock position" data-tooltip-direction="UP" aria-label="Reset GM Dock position"><i class="fa-solid fa-location-crosshairs"></i></button>`;

  for (const button of dock.querySelectorAll("[data-rg-gm-tool]")) {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const tool = TOOL_REGISTRY.get(button.dataset.rgGmTool);
      if (!game.user?.isGM || !tool) return;
      void tool.onClick();
    });
  }

  const handle = dock.querySelector(".rg-gm-dock-drag");
  handle?.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startRect = dock.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    dock.classList.add("is-dragging", "is-custom-position");
    dock.setPointerCapture?.(event.pointerId);
    const move = moveEvent => {
      const pos = clampDockPosition(startRect.left + (moveEvent.clientX - startX), startRect.top + (moveEvent.clientY - startY), dock);
      dock.style.left = `${Math.round(pos.left)}px`;
      dock.style.top = `${Math.round(pos.top)}px`;
      dock.dataset.placement = "custom";
    };
    const up = async upEvent => {
      dock.removeEventListener("pointermove", move);
      dock.removeEventListener("pointerup", up);
      dock.removeEventListener("pointercancel", up);
      dock.classList.remove("is-dragging");
      dock.releasePointerCapture?.(upEvent.pointerId);
      const rect = dock.getBoundingClientRect();
      const pos = clampDockPosition(rect.left, rect.top, dock);
      try { await game.user?.setFlag?.(NS, "gmDockPosition", { left: Math.round(pos.left), top: Math.round(pos.top) }); }
      catch (error) { console.warn(`${NS} | could not save GM Dock position`, error); }
    };
    dock.addEventListener("pointermove", move);
    dock.addEventListener("pointerup", up);
    dock.addEventListener("pointercancel", up);
  });

  dock.querySelector(".rg-gm-dock-reset")?.addEventListener("click", async event => {
    event.preventDefault();
    event.stopPropagation();
    try { await game.user?.unsetFlag?.(NS, "gmDockPosition"); }
    catch (error) { console.warn(`${NS} | could not reset GM Dock position`, error); }
    schedulePosition();
  });
  return dock;
}

export function renderGmDock(attempt = 0) {
  clearTimeout(retryTimer);
  if (!game.user?.isGM) {
    removeDock();
    return;
  }

  const hotbar = getHotbarElement();
  if (!hotbar) {
    if (attempt < 20) retryTimer = setTimeout(() => renderGmDock(attempt + 1), 150);
    return;
  }

  buildDock();
  observeHotbar(hotbar);
  schedulePosition();
}

export function installGmDock() {
  Hooks.once("ready", () => renderGmDock());
  Hooks.on("renderHotbar", () => renderGmDock());
  window.addEventListener("resize", schedulePosition, { passive: true });
}
