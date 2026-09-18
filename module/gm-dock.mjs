const TOOL_REGISTRY = new Map();
const PROVIDER_REGISTRY = new Map();
const DOCK_ID = "rg-gm-dock";
const NS = "realm-guard";
const HOST_CONTRACT = "gbf-gm-dock-host";
const HOST_VERSION = 1;

let resizeObserver = null;
let mutationObserver = null;
let observedHotbar = null;
let positionFrame = null;
let retryTimer = null;
let openProviderId = "";
let outsideListenerInstalled = false;
let hostApi = null;

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function safeCall(fn, fallback = null, ...args) {
  try {
    return typeof fn === "function" ? fn(...args) : fallback;
  } catch (error) {
    console.warn(`${NS} | GM Dock provider callback failed safely`, error);
    return fallback;
  }
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

export function registerGmDockProvider(provider = {}) {
  const id = String(provider?.id || "").trim();
  if (!id) throw new Error("GM Dock provider requires a stable id.");
  if (typeof provider?.menu !== "function") throw new Error(`GM Dock provider ${id} requires a menu() callback.`);

  PROVIDER_REGISTRY.set(id, {
    id,
    label: String(provider.label || id),
    icon: String(provider.icon || "fa-solid fa-puzzle-piece"),
    tooltip: String(provider.tooltip || provider.label || id),
    order: Number.isFinite(Number(provider.order)) ? Number(provider.order) : 100,
    visible: typeof provider.visible === "function" ? provider.visible : () => true,
    badge: typeof provider.badge === "function" ? provider.badge : () => 0,
    menu: provider.menu
  });

  if (game?.ready) renderGmDock();
  return id;
}

export function unregisterGmDockProvider(id) {
  const key = String(id || "").trim();
  if (!key) return false;
  if (openProviderId === key) openProviderId = "";
  const removed = PROVIDER_REGISTRY.delete(key);
  if (removed && game?.ready) renderGmDock();
  return removed;
}

function providerHostApi() {
  if (hostApi) return hostApi;
  hostApi = Object.freeze({
    contract: HOST_CONTRACT,
    version: HOST_VERSION,
    id: NS,
    label: "Realm Guard / Torchbearer GM Dock",
    registerProvider: provider => registerGmDockProvider(provider),
    unregisterProvider: id => unregisterGmDockProvider(id),
    hasProvider: id => PROVIDER_REGISTRY.has(String(id || "")),
    refresh: () => renderGmDock(),
    element: () => document.getElementById(DOCK_ID)
  });
  return hostApi;
}

function publishHost() {
  const root = globalThis.GuteboysFactory ??= {};
  const previous = root.gmDockHost;
  root.gmDockHost = providerHostApi();
  if (previous && previous !== root.gmDockHost && previous.id !== NS) {
    console.info(`${NS} | GM Dock became the active GuteboysFactory Dock Host (replacing fallback host ${previous.id || "unknown"}).`);
  }
  Hooks.callAll("guteboysFactoryGmDockHostReady", root.gmDockHost);
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
  openProviderId = "";
}

function schedulePosition() {
  if (positionFrame) cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(() => {
    positionFrame = null;
    positionDock();
    positionProviderMenu();
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

function visibleProviders() {
  return [...PROVIDER_REGISTRY.values()]
    .filter(provider => safeCall(provider.visible, true) !== false)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function providerBadge(provider) {
  const raw = Number(safeCall(provider.badge, 0) || 0);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
}

function providerButtonHtml(provider) {
  const count = providerBadge(provider);
  return `<button type="button" class="rg-gm-dock-tool rg-gm-dock-provider${openProviderId === provider.id ? " is-open" : ""}" data-rg-gm-provider="${esc(provider.id)}" title="${esc(provider.tooltip)}" data-tooltip="${esc(provider.tooltip)}" data-tooltip-direction="UP" aria-label="${esc(provider.tooltip)}" aria-expanded="${openProviderId === provider.id ? "true" : "false"}">
    <i class="${esc(provider.icon)}"></i>
    <span class="rg-gm-dock-provider-badge"${count ? "" : " hidden"}>${count || ""}</span>
  </button>`;
}

function normalizeMenu(provider) {
  const raw = safeCall(provider.menu, {}, providerHostApi()) || {};
  const items = Array.isArray(raw.items) ? raw.items : [];
  return {
    title: String(raw.title || provider.label),
    subtitle: String(raw.subtitle || ""),
    context: String(raw.context || ""),
    items: items.map((item, index) => {
      if (item?.separator) return { separator: true, label: String(item.label || "") };
      return {
        id: String(item?.id || `item-${index}`),
        label: String(item?.label || item?.id || "Action"),
        detail: String(item?.detail || ""),
        icon: String(item?.icon || "fa-solid fa-chevron-right"),
        badge: Math.max(0, Math.floor(Number(item?.badge || 0) || 0)),
        disabled: Boolean(item?.disabled),
        keepOpen: Boolean(item?.keepOpen),
        onClick: typeof item?.onClick === "function" ? item.onClick : null
      };
    })
  };
}

function providerMenuHtml(provider) {
  const menu = normalizeMenu(provider);
  return `<section class="rg-gm-dock-provider-menu" data-rg-provider-menu="${esc(provider.id)}" role="menu" aria-label="${esc(menu.title)}">
    <header>
      <span class="rg-gm-dock-provider-mark"><i class="${esc(provider.icon)}"></i></span>
      <div><small>INTEGRATED GM TOOLS</small><h3>${esc(menu.title)}</h3>${menu.subtitle ? `<p>${esc(menu.subtitle)}</p>` : ""}${menu.context ? `<p class="rg-gm-dock-provider-context">${esc(menu.context)}</p>` : ""}</div>
      <button type="button" class="rg-gm-dock-provider-close" data-rg-provider-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    </header>
    <div class="rg-gm-dock-provider-items">
      ${menu.items.map(item => item.separator
        ? `<div class="rg-gm-dock-provider-separator">${esc(item.label)}</div>`
        : `<button type="button" class="rg-gm-dock-provider-item" data-rg-provider-item="${esc(item.id)}"${item.disabled ? " disabled" : ""}>
            <i class="${esc(item.icon)}"></i>
            <span><strong>${esc(item.label)}</strong>${item.detail ? `<small>${esc(item.detail)}</small>` : ""}</span>
            ${item.badge ? `<b>${item.badge}</b>` : '<i class="fa-solid fa-chevron-right rg-gm-dock-provider-chevron"></i>'}
          </button>`).join("")}
    </div>
  </section>`;
}

function positionProviderMenu() {
  const dock = document.getElementById(DOCK_ID);
  const menu = dock?.querySelector?.("[data-rg-provider-menu]");
  if (!dock || !menu) return;

  menu.classList.remove("is-below", "is-align-left", "is-align-right");
  const dockRect = dock.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const edge = 8;
  const fitsAbove = dockRect.top - menuRect.height - 8 >= edge;
  if (!fitsAbove) menu.classList.add("is-below");

  const roomRight = window.innerWidth - dockRect.left;
  if (roomRight >= menuRect.width + edge) menu.classList.add("is-align-left");
  else menu.classList.add("is-align-right");
}

function wireProviderMenu(dock, provider) {
  const menuElement = dock.querySelector(`[data-rg-provider-menu="${CSS.escape(provider.id)}"]`);
  if (!menuElement) return;
  const menu = normalizeMenu(provider);

  menuElement.querySelector("[data-rg-provider-close]")?.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    openProviderId = "";
    renderGmDock();
  });

  for (const button of menuElement.querySelectorAll("[data-rg-provider-item]")) {
    button.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      if (!game.user?.isGM) return;
      const item = menu.items.find(row => !row.separator && row.id === button.dataset.rgProviderItem);
      if (!item || item.disabled || !item.onClick) return;
      try {
        await item.onClick({ host: providerHostApi(), providerId: provider.id, itemId: item.id });
      } catch (error) {
        console.error(`${NS} | GM Dock provider action ${provider.id}/${item.id} failed`, error);
        ui.notifications?.error?.(`GM Dock: ${provider.label} action failed. See console.`);
      }
      if (!item.keepOpen) {
        openProviderId = "";
        renderGmDock();
      } else {
        renderGmDock();
      }
    });
  }

  requestAnimationFrame(positionProviderMenu);
}

function installOutsideListener() {
  if (outsideListenerInstalled) return;
  outsideListenerInstalled = true;
  document.addEventListener("pointerdown", event => {
    if (!openProviderId) return;
    const dock = document.getElementById(DOCK_ID);
    if (dock?.contains(event.target)) return;
    openProviderId = "";
    renderGmDock();
  }, true);
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

  const providers = visibleProviders();
  if (openProviderId && !providers.some(provider => provider.id === openProviderId)) openProviderId = "";

  dock.innerHTML = `<span class="rg-gm-dock-brand rg-gm-dock-drag" title="Drag GM Dock" data-tooltip="Drag GM Dock" data-tooltip-direction="UP"><i class="fa-solid fa-grip-lines"></i><b>RG/TB</b></span>${tools.map(tool => `
    <button type="button" class="rg-gm-dock-tool" data-rg-gm-tool="${esc(tool.id)}" title="${esc(tool.tooltip)}" data-tooltip="${esc(tool.tooltip)}" data-tooltip-direction="UP" aria-label="${esc(tool.tooltip)}">
      <i class="${esc(tool.icon)}"></i>
    </button>`).join("")}${providers.length ? '<span class="rg-gm-dock-provider-divider" aria-hidden="true"></span>' : ""}${providers.map(providerButtonHtml).join("")}<button type="button" class="rg-gm-dock-reset" title="Reset GM Dock position" data-tooltip="Reset GM Dock position" data-tooltip-direction="UP" aria-label="Reset GM Dock position"><i class="fa-solid fa-location-crosshairs"></i></button>${openProviderId && PROVIDER_REGISTRY.has(openProviderId) ? providerMenuHtml(PROVIDER_REGISTRY.get(openProviderId)) : ""}`;

  for (const button of dock.querySelectorAll("[data-rg-gm-tool]")) {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const tool = TOOL_REGISTRY.get(button.dataset.rgGmTool);
      if (!game.user?.isGM || !tool) return;
      void tool.onClick();
    });
  }

  for (const button of dock.querySelectorAll("[data-rg-gm-provider]")) {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const id = String(button.dataset.rgGmProvider || "");
      if (!game.user?.isGM || !PROVIDER_REGISTRY.has(id)) return;
      openProviderId = openProviderId === id ? "" : id;
      renderGmDock();
    });
  }

  if (openProviderId) {
    const provider = PROVIDER_REGISTRY.get(openProviderId);
    if (provider) wireProviderMenu(dock, provider);
  }

  const handle = dock.querySelector(".rg-gm-dock-drag");
  handle?.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    event.preventDefault();
    openProviderId = "";
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
    openProviderId = "";
    try { await game.user?.unsetFlag?.(NS, "gmDockPosition"); }
    catch (error) { console.warn(`${NS} | could not reset GM Dock position`, error); }
    schedulePosition();
  });

  installOutsideListener();
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
  Hooks.once("ready", () => {
    publishHost();
    renderGmDock();
  });
  Hooks.on("renderHotbar", () => renderGmDock());
  window.addEventListener("resize", schedulePosition, { passive: true });
}
