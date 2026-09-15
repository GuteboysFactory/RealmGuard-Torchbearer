const SELECTOR = ".realm-guard.rg-recruitment select";
const MIN_OPTIONS = 9;

let openState = null;
const states = new Set();

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
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let next = index;
  if (event.key === "ArrowDown") next = Math.min(buttons.length - 1, index + 1);
  if (event.key === "ArrowUp") next = Math.max(0, index - 1);
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = buttons.length - 1;
  buttons[next].focus({ preventScroll: true });
  buttons[next].scrollIntoView({ block: "nearest" });
}

function buildMenu(select) {
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
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
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
  if (select.options.length < MIN_OPTIONS) return;
  select.dataset.rgScrollableSelect = "true";
  buildMenu(select);
}

function scan(root = document) {
  if (root instanceof Element && root.matches?.(SELECTOR)) enhanceSelect(root);
  root.querySelectorAll?.(SELECTOR).forEach(enhanceSelect);
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
  scan(document);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) if (node instanceof Element) scan(node);
    }
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
  window.addEventListener("resize", () => positionMenu(openState));
  document.addEventListener("scroll", () => positionMenu(openState), true);

  return Object.freeze({ selector: SELECTOR, minOptions: MIN_OPTIONS });
}

Hooks.once("ready", () => {
  installRecruitmentScrollableSelects();
  console.log("realm-guard | Recruitment scrollable long-select UX ready");
});
