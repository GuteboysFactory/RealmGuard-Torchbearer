const NS = "realm-guard";

let helpTooltip = null;
let activeSmartSelect = null;
let mutationObserver = null;

const SELECT_HELP = Object.freeze({
  method: {
    calculated: "Calculated: roll the conflict Skill, then add the conflict's Base Ability to the rolled successes. Untrained Skills use Beginner's Luck.",
    nature: "Nature: use Nature as both the roll source and the disposition base. Use this when the opposition's Nature is the correct conflict measure.",
    fixed: "Fixed: enter the creature's fixed Disposition and optionally add +1 Disposition per supporting NPC or mook. Normal condition penalties still apply.",
    manual: "Manual: enter the exact final Disposition. No Skill or Ability test is rolled and no Tap Nature test exists in this method."
  },
  natureScope: {
    within: "Within descriptors: the action matches the character's Nature descriptors. A successful tapped test causes no Nature tax.",
    against: "Against descriptors: the action falls outside the character's Nature descriptors. A successful tapped test taxes Nature by 1; failure taxes by Margin of Failure."
  },
  natureUse: {
    within: "Within Nature descriptors: roll Nature normally because the action matches a Nature descriptor.",
    against: "Against Nature descriptors: the action is outside the Nature descriptors and can tax Nature according to the Nature rules."
  },
  fit: {
    cover: "Fill / Crop: fill the frame completely. Parts of the artwork may extend outside the frame; drag and zoom to choose the crop.",
    contain: "Fit Entire Image: show the whole source image inside the frame. Empty space can remain around narrow or wide artwork."
  },
  portraitMode: {
    original: "Original Portrait: show the preserved full source artwork on the Ranger sheet using your saved portrait framing.",
    token: "Token Portrait: use the finished round token image as the Ranger sheet portrait. The original artwork remains preserved."
  },
  traitMode: {
    help: "Help yourself: apply the selected Trait's normal beneficial effect, subject to its session-use rules.",
    against: "Against yourself: take the Trait penalty to earn a Check during the GM Turn according to the normal Trait Against procedure.",
    hurt: "Against yourself in Versus: give the opponent the listed benefit and earn the larger Check reward when this option is legal."
  },
  ability: {
    will: "Will: use the character's mental resilience and resolve as the Beginner's Luck base.",
    health: "Health: use the character's physical strength and endurance as the Beginner's Luck base."
  },
  recoveryType: {
    manual: "Manual / special recovery: the Condition is cleared by a table procedure rather than an automated test.",
    ability: "Ability recovery: make the configured Ability test against the configured Obstacle.",
    role: "Skill recovery: make the configured Skill test against the configured Obstacle."
  },
  resource: {
    fate: "Fate: adjust the selected Actors' current Fate resource as an explicit GM correction.",
    persona: "Persona: adjust the selected Actors' current Persona resource as an explicit GM correction.",
    checks: "Checks: adjust the selected Actors' current Checks as an explicit GM correction."
  },
  frequency: {
    session: "Once per session: the Talent can be committed once until the next End Session reset.",
    conflict: "Once per conflict: the Talent can be committed once for each Conflict.",
    passive: "Passive: the Talent can apply whenever its normal trigger and link requirements are satisfied."
  },
  linkType: {
    skill: "Linked Skill: the Item applies only when the configured Skill is the relevant test source.",
    ability: "Linked Ability: the Item applies only when the configured Ability is the relevant test source.",
    general: "General / table-approved: applicability is intentionally decided by the table instead of inferred automatically.",
    specific: "Specific Use: the written narrow use must fit the fiction; the system does not invent broad applicability."
  },
  effectMode: {
    dice: "Automatic +D: the configured dice bonus is added automatically when the Item is legally selected.",
    manual: "Manual / written effect: the system records the choice but the written effect is adjudicated at the table.",
    level: "Level effect: use the built-in Token of Power behavior for the selected Token level."
  },
  recoveryAbility: {
    will: "Will recovery: resolve the Condition's recovery test with Will.",
    health: "Health recovery: resolve the Condition's recovery test with Health.",
    nature: "Nature recovery: resolve the Condition's recovery test with Nature."
  }
});

const VALUE_HELP = Object.freeze({
  "": "None / no special option selected.",
  baseline: "Automatic: new ordinary Skill and Ability tests use the GM's current Baseline Obstacle automatically.",
  approval: "GM approval: each ordinary test sends its proposed Obstacle to the GM, who can approve or adjust it before the roll resolves.",
  manual: "Manual: set the Obstacle directly in each ordinary Roll Dialog. The Baseline is not applied automatically.",
  within: "Within descriptors: the action matches the character's Nature descriptors.",
  against: "Against descriptors: the action falls outside the character's Nature descriptors and can tax Nature.",
  original: "Use the preserved original portrait artwork.",
  token: "Use the finished token image while preserving the original artwork."
});

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function plain(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function pointerPoint(event) {
  const x = Number(event?.clientX ?? event?.nativeEvent?.clientX ?? event?.originalEvent?.clientX);
  const y = Number(event?.clientY ?? event?.nativeEvent?.clientY ?? event?.originalEvent?.clientY);
  return {
    x: Number.isFinite(x) ? x : Math.max(20, window.innerWidth / 2),
    y: Number.isFinite(y) ? y : Math.max(20, window.innerHeight / 2)
  };
}

function removeHelpTooltip() {
  helpTooltip?.remove?.();
  helpTooltip = null;
}

function positionHelpTooltip(event) {
  if (!helpTooltip) return;
  const point = pointerPoint(event);
  const margin = 12;
  const width = Math.min(380, Math.max(260, helpTooltip.offsetWidth || 320));
  const height = Math.max(70, helpTooltip.offsetHeight || 100);
  let left = point.x + 16;
  let top = point.y + 16;
  if (left + width > window.innerWidth - margin) left = point.x - width - 16;
  if (top + height > window.innerHeight - margin) top = point.y - height - 16;
  helpTooltip.style.left = `${Math.max(margin, left)}px`;
  helpTooltip.style.top = `${Math.max(margin, top)}px`;
}

function showHelpTooltip(text, event, title = "") {
  const body = plain(text);
  if (!body) return;
  removeHelpTooltip();
  const element = document.createElement("div");
  element.className = "rg-context-help-tooltip";
  element.innerHTML = `${title ? `<b>${esc(title)}</b>` : ""}<span>${esc(body)}</span>`;
  document.body.append(element);
  helpTooltip = element;
  positionHelpTooltip(event);
}

function selectLabel(select) {
  const explicit = plain(select.dataset.rgHelpLabel);
  if (explicit) return explicit;
  const label = select.closest("label");
  if (label) {
    const clone = label.cloneNode(true);
    clone.querySelectorAll("select,input,textarea,button,small,.rg-smart-select").forEach(node => node.remove());
    const text = plain(clone.textContent);
    if (text) return text;
  }
  const name = String(select.name || select.dataset.rgSelectName || "Option").replace(/([A-Z])/g, " $1").replace(/[-_]+/g, " ").trim();
  return name ? name.replace(/^./, char => char.toUpperCase()) : "Option";
}

function explicitOptionHelp(option) {
  return plain(option?.dataset?.rgHelp || option?.getAttribute?.("data-help") || "");
}

function personaHelp(value) {
  const count = Math.max(0, Math.trunc(Number(value ?? 0)));
  return count ? `Spend ${count} Persona before the roll to add +${count}D. This is separate from any Persona cost for Tap Nature.` : "Spend no Persona for bonus dice on this roll.";
}

function optionHelp(select, option) {
  const explicit = explicitOptionHelp(option);
  if (explicit) return explicit;
  const name = String(select.name || select.dataset.rgSelectName || "");
  const value = String(option?.value ?? "");
  const byName = SELECT_HELP[name]?.[value];
  if (byName) return byName;
  if (name === "persona") return personaHelp(value);
  if (name === "size") return `Token Size ${option?.textContent?.trim() || value}: set the prototype token's Scene footprint. It does not change the portrait artwork itself.`;
  if (name === "source") return `Use ${option?.textContent?.trim() || "this source"} as the Skill or Ability source for this test. The displayed rating or Beginner's Luck basis determines the starting pool.`;
  if (name === "traitId") return value ? `Use ${option?.textContent?.trim() || "this Trait"} for this test, subject to the Trait level and remaining session uses shown in the option.` : "Do not apply a Trait to this test.";
  if (name === "wiseId") return value ? `Use ${option?.textContent?.trim() || "this Wise"} for the supported Wise effect in this test.` : "Do not apply a Wise to this test.";
  if (name === "tokenPowerId") return value ? `Invoke ${option?.textContent?.trim() || "this Token of Power"}. Linked Tokens must match the current test; specific/manual effects may require table adjudication.` : "Do not invoke a Token of Power for this test.";
  if (name === "talentId") return value ? `Use ${option?.textContent?.trim() || "this Talent"} if its link and use-frequency requirements are satisfied.` : "Do not use a Talent for this test.";
  if (VALUE_HELP[value]) return VALUE_HELP[value];
  const label = selectLabel(select);
  const optionText = plain(option?.textContent) || value || "None";
  return `${label}: choose “${optionText}”.`;
}

function isRealmGuardSelect(select) {
  if (!(select instanceof HTMLSelectElement)) return false;
  if (select.multiple || select.dataset.rgNativeSelect === "true") return false;
  if (select.closest(".rg-smart-select")) return false;
  if (select.closest(".realm-guard")) return true;
  if (select.closest('[class*="rg-"]')) return true;
  const app = select.closest(".application, .app, .window-app");
  return Boolean(app?.querySelector?.(".rg-brand, .rg-sheet, .rg-conflict-window, .rg-gm-tools"));
}

function closeSmartSelect(wrapper = activeSmartSelect) {
  if (!wrapper) return;
  wrapper.classList.remove("is-open");
  const trigger = wrapper.querySelector(".rg-smart-select-trigger");
  const menu = wrapper._rgSmartMenu;
  menu?.classList?.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");
  activeSmartSelect = activeSmartSelect === wrapper ? null : activeSmartSelect;
}

function positionSmartMenu(wrapper) {
  const trigger = wrapper.querySelector(".rg-smart-select-trigger");
  const menu = wrapper._rgSmartMenu;
  if (!trigger || !menu) return;
  const rect = trigger.getBoundingClientRect();
  const margin = 10;
  const gap = 4;
  const viewportWidth = Math.max(320, window.innerWidth || 1280);
  const viewportHeight = Math.max(240, window.innerHeight || 720);
  const width = Math.min(viewportWidth - margin * 2, Math.max(280, Math.min(460, rect.width * 1.35)));
  const left = Math.max(margin, Math.min(rect.left, viewportWidth - width - margin));
  const below = Math.max(0, viewportHeight - rect.bottom - margin - gap);
  const above = Math.max(0, rect.top - margin - gap);
  const openUp = below < 180 && above > below;
  const available = Math.max(110, Math.min(360, openUp ? above : below));
  menu.classList.toggle("open-up", openUp);
  menu.style.width = `${width}px`;
  menu.style.minWidth = `${Math.min(width, Math.max(180, rect.width))}px`;
  menu.style.maxWidth = `${width}px`;
  menu.style.left = `${left}px`;
  menu.style.maxHeight = `${available}px`;
  if (openUp) {
    menu.style.top = "auto";
    menu.style.bottom = `${Math.max(margin, viewportHeight - rect.top + gap)}px`;
  } else {
    menu.style.bottom = "auto";
    menu.style.top = `${Math.min(viewportHeight - margin, rect.bottom + gap)}px`;
  }
}

function syncSmartSelect(wrapper) {
  const select = wrapper.querySelector("select[data-rg-select-enhanced='true']");
  const trigger = wrapper.querySelector(".rg-smart-select-trigger");
  const valueLabel = trigger?.querySelector(".rg-smart-select-value");
  const menu = wrapper._rgSmartMenu;
  if (!select || !trigger || !valueLabel) return;
  const selected = select.options?.[select.selectedIndex] ?? select.options?.[0];
  valueLabel.textContent = selected?.textContent?.trim() || "Select…";
  trigger.disabled = Boolean(select.disabled);
  for (const button of menu?.querySelectorAll?.(".rg-smart-select-option") ?? []) {
    button.classList.toggle("is-selected", String(button.dataset.value ?? "") === String(select.value ?? ""));
    button.setAttribute("aria-selected", String(String(button.dataset.value ?? "") === String(select.value ?? "")));
  }
}

function rebuildSmartOptions(wrapper) {
  const select = wrapper.querySelector("select[data-rg-select-enhanced='true']");
  const menu = wrapper._rgSmartMenu;
  if (!select || !menu) return;
  const label = selectLabel(select);
  menu.innerHTML = "";
  for (const option of Array.from(select.options ?? [])) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rg-smart-select-option";
    button.dataset.value = String(option.value ?? "");
    button.dataset.rgHelp = optionHelp(select, option);
    button.dataset.rgHelpTitle = `${label} · ${plain(option.textContent)}`;
    button.classList.toggle("is-disabled", Boolean(option.disabled));
    button.dataset.disabled = String(Boolean(option.disabled));
    button.setAttribute("aria-disabled", String(Boolean(option.disabled)));
    button.setAttribute("role", "option");
    if (option.disabled) button.tabIndex = -1;
    button.innerHTML = `<span>${esc(option.textContent?.trim() || "None")}</span>${option.disabled ? '<small>Unavailable</small>' : ''}`;
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (button.dataset.disabled === "true") return;
      select.value = String(option.value ?? "");
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncSmartSelect(wrapper);
      closeSmartSelect(wrapper);
      wrapper.querySelector(".rg-smart-select-trigger")?.focus?.();
    });
    menu.append(button);
  }
  syncSmartSelect(wrapper);
}

function enhanceSelect(select) {
  if (!isRealmGuardSelect(select) || select.dataset.rgSelectEnhanced === "true") return;
  select.dataset.rgSelectEnhanced = "true";
  const wrapper = document.createElement("span");
  wrapper.className = "rg-smart-select";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "rg-smart-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = '<span class="rg-smart-select-value"></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
  const menu = document.createElement("span");
  menu.className = "rg-smart-select-menu";
  menu.setAttribute("role", "listbox");

  select.parentNode?.insertBefore(wrapper, select);
  wrapper.append(select, trigger);
  document.body.append(menu);
  wrapper._rgSmartMenu = menu;
  menu._rgSmartWrapper = wrapper;
  select.classList.add("rg-smart-select-native");

  rebuildSmartOptions(wrapper);
  select.addEventListener("change", () => syncSmartSelect(wrapper));
  trigger.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (trigger.disabled) return;
    const opening = !wrapper.classList.contains("is-open");
    if (activeSmartSelect && activeSmartSelect !== wrapper) closeSmartSelect(activeSmartSelect);
    wrapper.classList.toggle("is-open", opening);
    menu.classList.toggle("is-open", opening);
    trigger.setAttribute("aria-expanded", String(opening));
    activeSmartSelect = opening ? wrapper : null;
    if (opening) positionSmartMenu(wrapper);
  });
  trigger.addEventListener("keydown", event => {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    if (!wrapper.classList.contains("is-open")) {
      event.preventDefault();
      trigger.click();
      menu.querySelector(".rg-smart-select-option:not(.is-disabled)")?.focus?.();
    }
  });
  menu.addEventListener("keydown", event => {
    const options = [...menu.querySelectorAll(".rg-smart-select-option:not(.is-disabled)")];
    const index = options.indexOf(document.activeElement);
    if (event.key === "Escape") { event.preventDefault(); closeSmartSelect(wrapper); trigger.focus(); }
    if (event.key === "ArrowDown" && options.length) { event.preventDefault(); options[(index + 1 + options.length) % options.length].focus(); }
    if (event.key === "ArrowUp" && options.length) { event.preventDefault(); options[(index - 1 + options.length) % options.length].focus(); }
  });

  const optionObserver = new MutationObserver(() => rebuildSmartOptions(wrapper));
  optionObserver.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "selected", "label"] });
}

export function enhanceRealmGuardSelects(root = document) {
  const node = root instanceof Element || root instanceof Document || root instanceof DocumentFragment ? root : document;
  if (node instanceof HTMLSelectElement) enhanceSelect(node);
  node.querySelectorAll?.("select").forEach(enhanceSelect);
}

function scanAddedNode(node) {
  if (!(node instanceof Element)) return;
  if (node instanceof HTMLSelectElement) enhanceSelect(node);
  enhanceRealmGuardSelects(node);
}

export function installContextHelp() {
  document.addEventListener("pointerover", event => {
    const target = event.target?.closest?.("[data-rg-help]");
    if (!target) return;
    const text = target.dataset.rgHelp;
    if (!plain(text)) return;
    showHelpTooltip(text, event, target.dataset.rgHelpTitle || "");
  }, true);
  document.addEventListener("pointermove", event => {
    if (helpTooltip) positionHelpTooltip(event);
  }, true);
  document.addEventListener("pointerout", event => {
    const target = event.target?.closest?.("[data-rg-help]");
    if (!target) return;
    if (target.contains(event.relatedTarget)) return;
    removeHelpTooltip();
  }, true);
  document.addEventListener("click", event => {
    if (!activeSmartSelect) return;
    const inTrigger = event.target?.closest?.(".rg-smart-select") === activeSmartSelect;
    const inMenu = event.target?.closest?.(".rg-smart-select-menu") === activeSmartSelect._rgSmartMenu;
    if (!inTrigger && !inMenu) closeSmartSelect(activeSmartSelect);
  }, true);
  window.addEventListener("resize", () => closeSmartSelect(activeSmartSelect));
  window.addEventListener("scroll", () => closeSmartSelect(activeSmartSelect), true);

  Hooks.on("renderApplicationV2", app => {
    setTimeout(() => enhanceRealmGuardSelects(app?.element ?? document), 0);
  });
  Hooks.on("renderActorSheet", (_app, html) => setTimeout(() => enhanceRealmGuardSelects(html?.[0] ?? html ?? document), 0));
  Hooks.on("renderItemSheet", (_app, html) => setTimeout(() => enhanceRealmGuardSelects(html?.[0] ?? html ?? document), 0));

  Hooks.once("ready", () => {
    enhanceRealmGuardSelects(document);
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes ?? []) scanAddedNode(node);
      for (const menu of document.querySelectorAll(".rg-smart-select-menu")) {
        const wrapper = menu._rgSmartWrapper;
        if (wrapper && !wrapper.isConnected) {
          if (activeSmartSelect === wrapper) activeSmartSelect = null;
          menu.remove();
        }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  });
}
