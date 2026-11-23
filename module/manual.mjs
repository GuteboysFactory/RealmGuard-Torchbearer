import { registerGmDockTool } from "./gm-dock.mjs";
import { openSystemAudit } from "./system-audit.mjs";
import { RG_SYSTEM_NAME, rulesReferenceDetailsHtml, openRulesReferenceJournal, installRulesReferenceJournal } from "./rules-reference.mjs";
import { openProfileRulesReference } from "./m10b-rules-reference.mjs";
import { fitWindowToViewport } from "./window-position-service.mjs";
import { MANUAL_GUIDE_TOPICS, manualGuideTitle, openManualGuide } from "./manual-guides.mjs";
import { legacyPeopleCreationEnabled } from "./legacy-character-creation.mjs";
import { openCharacterCreation } from "./recruitment.mjs";

const SIDEBAR_HELP_ID = "rg-sidebar-manual";
const MANUAL_LANGUAGE = "manualLanguage";
const manualLanguage = () => game.settings.get("realm-guard", MANUAL_LANGUAGE) === "sv" ? "sv" : "en";
let referenceControlsInstalled = false;

function referenceToolbar(placeholder = "Search manual & rules…", language = null) {
  return `<div class="rg-reference-toolbar">
    <label class="rg-reference-search">
      <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      <input type="search" data-rg-reference-search placeholder="${placeholder}" autocomplete="off" spellcheck="false" aria-label="${placeholder}">
      <button type="button" data-rg-reference-clear title="Clear search" aria-label="Clear search"><i class="fa-solid fa-xmark"></i></button>
    </label>
    <div class="rg-reference-toolbar-actions">
      ${language ? `<select data-rg-reference-language aria-label="Manual language"><option value="en" ${language === "en" ? "selected" : ""}>English</option><option value="sv" ${language === "sv" ? "selected" : ""}>Svenska</option></select>` : ""}
      <span class="rg-reference-search-count" data-rg-reference-search-count>All sections</span>
      <button type="button" data-rg-reference-expand><i class="fa-solid fa-angles-down"></i><span>Expand All</span></button>
      <button type="button" data-rg-reference-collapse><i class="fa-solid fa-angles-up"></i><span>Collapse All</span></button>
    </div>
  </div>`;
}

function restoreReferenceSearch(root) {
  const details = Array.from(root?.querySelectorAll?.(".rg-reference-scroll details") ?? []);
  for (const detail of details) {
    detail.hidden = false;
    if (detail.dataset.rgSearchOriginalOpen !== undefined) {
      detail.open = detail.dataset.rgSearchOriginalOpen === "1";
      delete detail.dataset.rgSearchOriginalOpen;
    }
  }
  for (const heading of root?.querySelectorAll?.(".rg-manual-section-title") ?? []) heading.hidden = false;
  const count = root?.querySelector?.("[data-rg-reference-search-count]");
  if (count) count.textContent = "All sections";
}

function updateReferenceSectionHeadings(root) {
  const headings = Array.from(root?.querySelectorAll?.(".rg-manual-section-title") ?? []);
  for (const heading of headings) {
    let node = heading.nextElementSibling;
    let hasVisible = false;
    while (node && !node.classList?.contains("rg-manual-section-title")) {
      if (node.matches?.("details") && !node.hidden) {
        hasVisible = true;
        break;
      }
      node = node.nextElementSibling;
    }
    heading.hidden = !hasVisible;
  }
}

function filterReference(root, rawQuery) {
  if (!root) return;
  const query = String(rawQuery ?? "").trim().toLocaleLowerCase();
  const details = Array.from(root.querySelectorAll(".rg-reference-scroll details"));
  const count = root.querySelector("[data-rg-reference-search-count]");

  if (!query) {
    restoreReferenceSearch(root);
    return;
  }

  let matches = 0;
  for (const detail of details) {
    if (detail.dataset.rgSearchOriginalOpen === undefined) {
      detail.dataset.rgSearchOriginalOpen = detail.open ? "1" : "0";
    }
    const hit = String(detail.textContent ?? "").toLocaleLowerCase().includes(query);
    detail.hidden = !hit;
    if (hit) {
      detail.open = true;
      matches += 1;
    }
  }
  updateReferenceSectionHeadings(root);
  if (count) count.textContent = `${matches} match${matches === 1 ? "" : "es"}`;
}

function installReferenceControls() {
  if (referenceControlsInstalled) return;
  referenceControlsInstalled = true;

  document.addEventListener("input", event => {
    const input = event.target?.closest?.("[data-rg-reference-search]");
    if (!input) return;
    filterReference(input.closest("[data-rg-reference-root]"), input.value);
  });

  document.addEventListener("keydown", event => {
    const input = event.target?.closest?.("[data-rg-reference-search]");
    if (!input || event.key !== "Escape") return;
    event.preventDefault();
    input.value = "";
    filterReference(input.closest("[data-rg-reference-root]"), "");
  });

  document.addEventListener("click", event => {
    const lesson = event.target?.closest?.("[data-rg-manual-guide]");
    if (lesson) {
      void openManualGuide(lesson.dataset.rgManualGuide, lesson.dataset.language);
      return;
    }
    const people = event.target?.closest?.("[data-rg-manual-people]");
    if (people) {
      void openCharacterCreation();
      return;
    }
    const clear = event.target?.closest?.("[data-rg-reference-clear]");
    if (clear) {
      const root = clear.closest("[data-rg-reference-root]");
      const input = root?.querySelector?.("[data-rg-reference-search]");
      if (input) input.value = "";
      restoreReferenceSearch(root);
      input?.focus?.();
      return;
    }

    const expand = event.target?.closest?.("[data-rg-reference-expand]");
    const collapse = event.target?.closest?.("[data-rg-reference-collapse]");
    const control = expand ?? collapse;
    if (!control) return;
    const root = control.closest("[data-rg-reference-root]");
    const shouldOpen = Boolean(expand);
    for (const detail of root?.querySelectorAll?.(".rg-reference-scroll details") ?? []) {
      if (!detail.hidden) detail.open = shouldOpen;
    }
  });

  document.addEventListener("change", async event => {
    const control = event.target?.closest?.("[data-rg-reference-language]");
    if (!control) return;
    const root = control.closest("[data-rg-reference-root]");
    const topics = root.querySelector("[data-rg-manual-topics]");
    const language = control.value === "sv" ? "sv" : "en";
    const previous = topics.lang;
    control.disabled = true;
    try {
      const html = await loadUserGuide(language);
      await game.settings.set("realm-guard", MANUAL_LANGUAGE, language);
      topics.innerHTML = html;
      topics.lang = language;
      filterReference(root, root.querySelector("[data-rg-reference-search]").value);
    } catch (error) {
      console.warn("Realm Guard | Could not change manual language", error);
      control.value = previous;
      ui.notifications.warn("Realm Guard: The selected manual language could not be loaded.");
    } finally {
      control.disabled = false;
    }
  });
}

async function loadUserGuide(language = "en") {
  const file = language === "sv" ? "SYSTEM_MANUAL.sv.md" : "SYSTEM_MANUAL.md";
  const response = await fetch(foundry.utils.getRoute(`systems/realm-guard/${file}`));
  if (!response.ok) throw new Error(`Manual request returned ${response.status}.`);
  const converter = new globalThis.showdown.Converter({ tables: true, ghCompatibleHeaderId: true });
  const source = new DOMParser().parseFromString(converter.makeHtml(await response.text()), "text/html");
  const guide = document.createElement("div");
  let sectionTitle;
  let currentBody;
  let first = true;
  let contents = false;
  for (const node of source.body.children) {
    if (node.tagName === "H1") continue;
    if (node.tagName === "H2") {
      contents = ["Contents", "Innehåll"].includes(node.textContent);
      if (contents) continue;
      sectionTitle = document.createElement("section");
      sectionTitle.className = "rg-manual-section-title";
      const heading = document.createElement("h3");
      heading.textContent = node.textContent;
      sectionTitle.append(heading);
      guide.append(sectionTitle);
      currentBody = null;
      continue;
    }
    if (!sectionTitle || contents) continue;
    if (node.tagName === "H3") {
      const details = document.createElement("details");
      details.className = "rg-user-guide-topic";
      const summary = document.createElement("summary");
      summary.textContent = node.textContent;
      currentBody = document.createElement("div");
      currentBody.className = "rg-manual-body rg-user-guide-body";
      const topic = node.textContent;
      const people = ["Create a Human, Dwarf, Hobbit, or Elf", "Skapa en karaktär från ett annat folkslag"].includes(topic);
      if (legacyPeopleCreationEnabled() && (Object.hasOwn(MANUAL_GUIDE_TOPICS, topic) || people)) {
        const button = document.createElement("button");
        button.type = "button";
        if (Object.hasOwn(MANUAL_GUIDE_TOPICS, topic)) {
          const key = MANUAL_GUIDE_TOPICS[topic];
          button.dataset.rgManualGuide = key;
          button.dataset.language = language;
          button.textContent = `Start Guide · ${manualGuideTitle(key, language)}`;
        } else {
          button.dataset.rgManualPeople = "true";
          button.textContent = "Start Guide";
        }
        currentBody.append(button);
      }
      details.append(summary, currentBody);
      details.open = first;
      first = false;
      guide.append(details);
      continue;
    }
    if (currentBody) currentBody.append(node.cloneNode(true));
  }
  for (const link of guide.querySelectorAll("a[href]")) {
    link.href = new URL(link.getAttribute("href"), response.url).href;
    link.target = "_blank";
    link.rel = "noopener";
  }
  for (const image of guide.querySelectorAll("img[src]")) {
    image.src = new URL(image.getAttribute("src"), response.url).href;
    image.loading = "lazy";
  }
  return guide.innerHTML;
}

function manualContent(guideHtml, language) {
  const active = globalThis.game?.realmGuard?.core?.getActiveRulesProfile?.();
  const systemVersion = String(globalThis.game?.system?.version ?? "unknown");
  const activeName = String(active?.name ?? "Realm Guard — Legacy Mixed");
  const activeId = String(active?.id ?? "realm-guard-legacy-mixed");
  const activeVersion = String(active?.version ?? "1");
  const sourceProfileActive = activeId !== "realm-guard-legacy-mixed";
  return `<div class="realm-guard rg-reference-shell" data-rg-reference-root>
    ${referenceToolbar("Search manual & rules…", language)}
    <div class="rg-reference-scroll">
    <div class="rg-system-manual">
    <header class="rg-manual-hero"><div><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>System Manual & Rules Reference</h2><p>Foundry VTT 13.351 · system ${systemVersion} · player and GM reference</p></div><i class="fa-solid fa-book-open-reader"></i></header>

    <div class="rg-manual-callout"><i class="fa-solid fa-scale-balanced"></i><div><b>Active Rules Profile</b><span>${activeName} · ${activeId} · profile v${activeVersion}. ${sourceProfileActive ? "A source-owned Rules Profile is active. Use its profile Rules Reference for current mechanics." : "Sections marked Legacy Mixed describe workflows and rules for this profile."}</span></div></div>

    <div class="rg-manual-legend">
      <span class="rg-rule-badge rule">RULE</span><small>tabletop rule used by the system</small>
      <span class="rg-rule-badge automated">AUTOMATED</span><small>Foundry handles the bookkeeping</small>
      <span class="rg-rule-badge gm-call">GM CALL</span><small>fiction/table judgement remains required</small>
      <span class="rg-rule-badge rg-tb-foundry">RG/TB FOUNDRY</span><small>project-specific expansion or convenience layer</small>
    </div>

    <div data-rg-manual-topics lang="${language}">${guideHtml}</div>

    <section class="rg-manual-section-title"><i class="fa-solid fa-scale-balanced"></i><div><h3>Rules Reference</h3><p>A practical summary of the tabletop rules and project expansions the system actually implements.</p></div></section>
    ${rulesReferenceDetailsHtml()}
  </div>
  </div>
  </div>`;
}

export async function openRealmGuardManual() {
  const language = manualLanguage();
  const activeId = String(globalThis.game?.realmGuard?.core?.getActiveRulesProfile?.()?.id ?? "realm-guard-legacy-mixed");
  const buttons = [
    { action: "profile-reference", label: activeId !== "realm-guard-legacy-mixed" ? "Open Active Profile Rules" : "Preview Strict Rules", icon: "fa-solid fa-scale-balanced", callback: () => "profile-reference" },
    { action: "mg1e-reference", label: "Preview MG1E Rules", icon: "fa-solid fa-book-open", callback: () => "mg1e-reference" },
    { action: "rules", label: "Open Legacy Mixed Rules Journal", icon: "fa-solid fa-book-bookmark", callback: () => "rules" }
  ];
  if (game.user?.isGM) buttons.push({ action: "audit", label: "World Health Audit", icon: "fa-solid fa-shield-heart", callback: () => "audit" });
  buttons.push({ action: "close", label: "Close", default: true, callback: () => "close" });
  let guideHtml;
  try {
    guideHtml = await loadUserGuide(language);
  } catch (error) {
    console.warn("Realm Guard | Could not load the user manual", error);
    guideHtml = `<p>The user manual could not be loaded. Open <a href="${foundry.utils.getRoute("systems/realm-guard/SYSTEM_MANUAL.md")}" target="_blank" rel="noopener">SYSTEM_MANUAL.md</a> or try again.</p>`;
  }
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `${RG_SYSTEM_NAME} · Manual & Rules Reference`, resizable: true },
    classes: ["rg-manual-dialog"],
    position: fitWindowToViewport(900, 840),
    content: manualContent(guideHtml, language),
    modal: false,
    rejectClose: false,
    buttons
  });
  if (result === "audit") setTimeout(() => void openSystemAudit(), 0);
  if (result === "rules") setTimeout(() => void openRulesReferenceJournal(), 0);
  if (result === "profile-reference") setTimeout(() => void openProfileRulesReference(activeId !== "realm-guard-legacy-mixed" ? activeId : "realm-guard-strict"), 0);
  if (result === "mg1e-reference") setTimeout(() => void openProfileRulesReference("mg1e"), 0);
}

function injectManualTool(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector?.("[data-rg-system-manual-button]")) return;
  const recruitmentBar = root.querySelector?.("[data-rg-recruitment-tools]");
  const button = document.createElement("button");
  button.type = "button";
  button.className = recruitmentBar ? "rg-recruit-tool" : "rg-system-manual-button";
  button.dataset.rgSystemManualButton = "true";
  button.title = `Open the complete ${RG_SYSTEM_NAME} Manual`;
  button.innerHTML = `<i class="fa-solid fa-book-open-reader"></i><span>System Manual</span>`;
  button.addEventListener("click", event => { event.preventDefault(); void openRealmGuardManual(); });
  if (recruitmentBar) recruitmentBar.append(button);
  else {
    const form = root.querySelector?.(".chat-form") ?? root.querySelector?.("#chat-form") ?? root;
    const bar = document.createElement("div");
    bar.className = "rg-system-manual-tools";
    bar.append(button);
    form.prepend(bar);
  }
}

function resolveSidebarRoot(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  const sidebar = ui?.sidebar?.element;
  if (sidebar instanceof HTMLElement) return sidebar;
  if (sidebar?.[0] instanceof HTMLElement) return sidebar[0];
  return document.querySelector("#sidebar");
}

function findSidebarTabs(root) {
  if (!root?.querySelectorAll) return null;
  const direct = root.querySelector("#sidebar-tabs")
    ?? root.querySelector('[data-application-part="tabs"]');
  if (direct) {
    if (direct.matches?.("nav")) return direct;
    const nested = direct.querySelector?.("nav") ?? direct.querySelector?.(".tabs");
    if (nested) return nested;
  }
  const candidates = root.querySelectorAll("nav, .tabs");
  return Array.from(candidates).find(node => node.querySelector?.('[data-tab="chat"], [data-tab="combat"], [data-tab="scenes"]')) ?? null;
}

function ensureSidebarHelpButton(html) {
  const root = resolveSidebarRoot(html);
  if (!root) return null;
  const existing = root.querySelector?.(`#${SIDEBAR_HELP_ID}`) ?? document.getElementById(SIDEBAR_HELP_ID);
  if (existing) return existing;
  const tabs = findSidebarTabs(root);
  if (!tabs) return null;

  const button = document.createElement("button");
  button.id = SIDEBAR_HELP_ID;
  button.type = "button";
  button.className = "ui-control rg-sidebar-manual-button";
  button.title = `${RG_SYSTEM_NAME} · Manual & Rules Reference`;
  button.setAttribute("aria-label", `${RG_SYSTEM_NAME} Manual & Rules Reference`);
  button.setAttribute("data-tooltip", `${RG_SYSTEM_NAME} · Manual & Rules Reference`);
  button.setAttribute("data-tooltip-direction", "LEFT");
  button.innerHTML = `<i class="fa-solid fa-book-open-reader" aria-hidden="true"></i>`;
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    void openRealmGuardManual();
  });

  const firstTab = tabs.querySelector?.("[data-tab]");
  if (firstTab) firstTab.before(button);
  else tabs.prepend(button);
  return button;
}

export function installRealmGuardManual() {
  game.settings.register("realm-guard", MANUAL_LANGUAGE, { scope: "client", config: false, type: String, default: "en" });
  installReferenceControls();
  registerGmDockTool({ id: "system-manual", icon: "fa-solid fa-book-open-reader", tooltip: `Open ${RG_SYSTEM_NAME} Manual`, order: 7, onClick: openRealmGuardManual });
  Hooks.on("renderChatLog", (_app, html) => injectManualTool(html));
  Hooks.on("renderSidebar", (_app, html) => ensureSidebarHelpButton(html));
  Hooks.once("ready", () => {
    const chat = ui?.chat?.element;
    if (chat) injectManualTool(chat);
    ensureSidebarHelpButton(ui?.sidebar?.element);
  });
  installRulesReferenceJournal();
}
