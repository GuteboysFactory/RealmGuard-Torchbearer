const MIN_OPTIONS = 9;
const STYLE_ID = "rg-recruitment-scroll-select-styles";

let openState = null;
let installed = false;
const states = new Set();

const STYLE_TEXT = `
.rg-recruit-native-select{position:absolute!important;width:1px!important;height:1px!important;min-height:0!important;padding:0!important;margin:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}
.rg-scroll-select{position:relative;width:100%}
.rg-scroll-select-trigger{box-sizing:border-box;width:100%;min-height:38px;padding:7px 32px 7px 9px;border:1px solid #5d5844;border-radius:5px;background:#0c0f0c;color:#eee2c8;font:14.5px/1.35 Georgia,serif;cursor:pointer;position:relative;display:flex;align-items:center;user-select:none}
.rg-scroll-select-trigger:after{content:"▾";position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#c8a86d;font-size:12px;pointer-events:none}
.rg-scroll-select-trigger[aria-expanded="true"]{border-color:#ad8448;box-shadow:0 0 0 1px rgba(185,139,67,.22)}
.rg-scroll-select-trigger.is-placeholder{color:#8f8c7b}
.rg-scroll-select-trigger[aria-disabled="true"]{opacity:.55;cursor:not-allowed}
.rg-scroll-select-menu{position:fixed;z-index:100000;box-sizing:border-box;overflow-y:auto!important;overscroll-behavior:contain;border:1px solid #756442;border-radius:6px;background:#11140f;box-shadow:0 10px 30px rgba(0,0,0,.55);padding:4px;scrollbar-width:thin;scrollbar-color:#8d7447 #151812}
.rg-scroll-select-menu[hidden]{display:none!important}
.rg-scroll-select-menu::-webkit-scrollbar{width:10px}
.rg-scroll-select-menu::-webkit-scrollbar-track{background:#151812;border-radius:8px}
.rg-scroll-select-menu::-webkit-scrollbar-thumb{background:#8d7447;border-radius:8px;border:2px solid #151812}
.rg-scroll-select-option{display:block!important;width:100%!important;min-height:32px!important;margin:0!important;padding:6px 9px!important;text-align:left!important;border:0!important;border-radius:4px!important;background:transparent!important;color:#e8ddc5!important;font:13.5px/1.25 Georgia,serif!important;cursor:pointer!important;white-space:normal!important}
.rg-scroll-select-option:hover,.rg-scroll-select-option:focus{outline:none!important;background:#2a2b1d!important;color:#f0cf87!important}
.rg-scroll-select-option.is-selected{background:#35341f!important;color:#f0cf87!important;font-weight:700!important}
.rg-scroll-select-option:disabled{opacity:.45!important;cursor:not-allowed!important;text-decoration:none!important}
`;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_TEXT;
  document.head.append(style);
}

function recruitmentScope(select) {
  const explicit = select.closest?.(".realm-guard.rg-recruitment");
  if (explicit) return explicit;

  const form = select.closest?.("form");
  if (form?.querySelector?.(".rg-recruit-progress")) return form;

  const application = select.closest?.(".application, .window-app, dialog");
  if (application?.querySelector?.(".rg-recruit-progress")) return application;

  return null;
}

function optionLabel(select) {
  return select.selectedOptions?.[0]?.textContent?.trim() || "Choose...";
}

function closeMenu(state, { focusTrigger = false } = {}) {
  if (!state) return;
  state.menu.hidden = true;
  state.trigger.setAttribute("aria-expanded", "false");
  if (openState === state) openState = null;
  if (focusTrigger && state.trigger.isConnected) state.trigger.focus();
}

function positionMenu(state) {
  if (!state || state.menu.hidden || !state.trigger.isConnected) return;
  const rect = state.trigger.getBoundingClientRect();
  const margin = 8;
  const desired = 300;
  const below = Math.max(0, window.innerHeight - rect.bottom - margin);
  const above = Math.max(0, rect.top - margin);
  const openUp = below < 180 && above > below;
  const available = Math.max(120, Math.min(desired, openUp ? above : below));
  const width = Math.max(220, rect.width);
  const left = Math.min(Math.max(margin, rect.left), Math.max(margin, window.innerWidth - width - margin));

  state.menu.style.left = `${Math.round(left)}px`;
  state.menu.style.width = `${Math.round(width)}px`;
  state.menu.style.maxHeight = `${Math.round(available)}px`;
  if (openUp) {
    state.menu.style.top = "auto";
    state.menu.style.bottom = `${Math.round(window.innerHeight - rect.top + 2)}px`;
  } else {
    state.menu.style.bottom = "auto";
    state.menu.style.top = `${Math.round(rect.bottom + 2)}px`;
  }
}

function focusSelected(state) {
  const selected = state.menu.querySelector('[aria-selected="true"]:not(:disabled)');
  const fallback = state.menu.querySelector("button:not(:disabled)");
  const target = selected || fallback;
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "nearest" });
}

function openMenu(state) {
  if (!state || state.select.disabled) return;
  if (openState && openState !== state) closeMenu(openState);
  state.menu.hidden = false;
  state.trigger.setAttribute("aria-expanded", "true");
  openState = state;
  positionMenu(state);
  requestAnimationFrame(() => focusSelected(state));
}

function refreshState(state) {
  if (!state) return;
  state.trigger.textContent = optionLabel(state.select);
  state.trigger.classList.toggle("is-placeholder", !state.select.value);
  state.trigger.setAttribute("aria-disabled", state.select.disabled ? "true" : "false");
  state.trigger.tabIndex = state.select.disabled ? -1 : 0;
  for (const button of state.menu.querySelectorAll("button[data-value]")) {
    const selected = button.dataset.value === state.select.value;
    button.setAttribute("aria-selected", selected ? "true" : "false");
    button.classList.toggle("is-selected", selected);
  }
}

function chooseValue(state, value) {
  if (!state || state.select.disabled) return;
  const option = [...state.select.options].find(entry => entry.value === value);
  if (!option || option.disabled) return;
  state.select.value = value;
  state.select.dispatchEvent(new Event("input", { bubbles: true }));
  state.select.dispatchEvent(new Event("change", { bubbles: true }));
  refreshState(state);
  closeMenu(state, { focusTrigger: true });
}

function menuKeydown(event, state) {
  const buttons = [...state.menu.querySelectorAll("button:not(:disabled)")];
  if (!buttons.length) return;
  const index = Math.max(0, buttons.indexOf(document.activeElement));
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(state, { focusTrigger: true });
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    if (document.activeElement?.matches?.("button[data-value]")) {
      event.preventDefault();
      document.activeElement.click();
    }
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(event.key)) return;
  event.preventDefault();
  let next = index;
  if (event.key === "ArrowDown") next = Math.min(buttons.length - 1, index + 1);
  if (event.key === "ArrowUp") next = Math.max(0, index - 1);
  if (event.key === "PageDown") next = Math.min(buttons.length - 1, index + 8);
  if (event.key === "PageUp") next = Math.max(0, index - 8);
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = buttons.length - 1;
  buttons[next].focus({ preventScroll: true });
  buttons[next].scrollIntoView({ block: "nearest" });
}

function wheelPixels(event, menu) {
  const unit = event.deltaMode === 1
    ? 28
    : event.deltaMode === 2
      ? Math.max(120, menu.clientHeight)
      : 1;
  return Number(event.deltaY || 0) * unit;
}

function handleMenuWheel(event) {
  const state = openState;
  if (!state || state.menu.hidden || !state.menu.isConnected) return;
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  const inside = path.includes(state.menu) || state.menu.contains(event.target);
  if (!inside) return;
  if (state.menu.scrollHeight <= state.menu.clientHeight) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  const max = Math.max(0, state.menu.scrollHeight - state.menu.clientHeight);
  state.menu.scrollTop = Math.max(0, Math.min(max, state.menu.scrollTop + wheelPixels(event, state.menu)));
}

function buildMenu(select) {
  ensureStyles();

  const wrapper = document.createElement("div");
  wrapper.className = "rg-scroll-select";

  const trigger = document.createElement("div");
  trigger.className = "rg-scroll-select-trigger";
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "rg-scroll-select-menu realm-guard";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  document.body.append(menu);

  for (const option of select.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rg-scroll-select-option";
    button.dataset.value = option.value;
    button.textContent = option.textContent;
    button.disabled = option.disabled;
    button.setAttribute("role", "option");
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      chooseValue(state, option.value);
    });
    menu.append(button);
  }

  select.classList.add("rg-recruit-native-select");
  select.insertAdjacentElement("afterend", wrapper);
  wrapper.append(trigger);

  const state = { select, wrapper, trigger, menu };
  states.add(state);

  trigger.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (menu.hidden) openMenu(state);
    else closeMenu(state, { focusTrigger: true });
  });
  trigger.addEventListener("keydown", event => {
    if (["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(event.key)) {
      event.preventDefault();
      openMenu(state);
    }
  });
  menu.addEventListener("keydown", event => menuKeydown(event, state));
  select.addEventListener("change", () => refreshState(state));
  refreshState(state);
  return state;
}

function enhanceSelect(select) {
  if (!(select instanceof HTMLSelectElement)) return;
  if (select.dataset.rgScrollableSelect === "true") return;
  if (!recruitmentScope(select)) return;
  if (select.options.length < MIN_OPTIONS) return;
  select.dataset.rgScrollableSelect = "true";
  buildMenu(select);
}

function scan(root = document) {
  const candidates = [];
  if (root instanceof HTMLSelectElement) candidates.push(root);
  root.querySelectorAll?.("select").forEach(select => candidates.push(select));
  candidates.forEach(enhanceSelect);
}

function cleanupDetached() {
  for (const state of [...states]) {
    if (state.select.isConnected) continue;
    if (openState === state) openState = null;
    state.menu.remove();
    states.delete(state);
  }
}

export function installRecruitmentScrollableSelects() {
  if (installed) return Object.freeze({ marker: ".rg-recruit-progress", minOptions: MIN_OPTIONS, wheelCapture: true, installed: true });
  installed = true;
  ensureStyles();
  scan(document);

  const observer = new MutationObserver(() => {
    scan(document);
    cleanupDetached();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("pointerdown", event => {
    if (!openState) return;
    if (openState.trigger.contains(event.target) || openState.menu.contains(event.target)) return;
    closeMenu(openState);
  }, true);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && openState) closeMenu(openState, { focusTrigger: true });
  }, true);
  window.addEventListener("wheel", handleMenuWheel, { capture: true, passive: false });
  window.addEventListener("resize", () => positionMenu(openState));
  document.addEventListener("scroll", () => positionMenu(openState), true);

  return Object.freeze({ marker: ".rg-recruit-progress", minOptions: MIN_OPTIONS, wheelCapture: true, installed: true });
}

Hooks.once("ready", () => {
  const state = installRecruitmentScrollableSelects();
  console.log("realm-guard | Recruitment scrollable long-select UX ready", state);
});
