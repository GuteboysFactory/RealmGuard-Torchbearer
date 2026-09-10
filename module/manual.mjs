import { registerGmDockTool } from "./gm-dock.mjs";
import { openSystemAudit } from "./system-audit.mjs";
import { RG_SYSTEM_NAME, rulesReferenceDetailsHtml, openRulesReferenceJournal, installRulesReferenceJournal } from "./rules-reference.mjs";

const SIDEBAR_HELP_ID = "rg-sidebar-manual";

function manualContent() {
  return `<div class="realm-guard rg-system-manual">
    <header class="rg-manual-hero"><div><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>System Manual & Rules Reference</h2><p>Foundry VTT 13.351 · v1.0.4 · player and GM reference</p></div><i class="fa-solid fa-book-open-reader"></i></header>

    <div class="rg-manual-callout"><i class="fa-solid fa-compass"></i><div><b>How this rules engine is built</b><span>Realm Guard rules take priority. Mouse Guard 2E supplies inherited core mechanics where Realm Guard does not replace them. Selected compatible Torchbearer 2E ideas are deliberately adopted where noted. Project-specific digital additions are explicitly marked as Realm Guard / Torchbearer Foundry expansions.</span></div></div>

    <div class="rg-manual-legend">
      <span class="rg-rule-badge rule">RULE</span><small>tabletop rule used by the system</small>
      <span class="rg-rule-badge automated">AUTOMATED</span><small>Foundry handles the bookkeeping</small>
      <span class="rg-rule-badge gm-call">GM CALL</span><small>fiction/table judgement remains required</small>
      <span class="rg-rule-badge rg-tb-foundry">RG/TB FOUNDRY</span><small>project-specific expansion or convenience layer</small>
    </div>

    <section class="rg-manual-section-title"><i class="fa-solid fa-gamepad"></i><div><h3>Using the Foundry System</h3><p>Where the tools live and how the implemented play loop fits together.</p></div></section>

    <details open><summary><i class="fa-solid fa-play"></i> Quick Start</summary><div class="rg-manual-body"><p><b>Players:</b> use <b>Create Ranger</b> for rules-driven Recruitment, then roll Skills/Abilities directly from the Ranger sheet. <b>GM:</b> use the GM Dock for GM Control, Content Studio, Starter Compendiums, Conflicts, Turns, End Session, World Health Audit and this manual.</p><p>A normal session can flow from scene play -> rolls/Conditions -> Conflict when needed -> Players' Turn/Recovery when using Structured Mode -> End Session -> Start Next Session.</p><p>The <b>book icon</b> in Foundry's sidebar remains available globally so the manual can be reopened without returning to chat.</p></div></details>

    <details><summary><i class="fa-solid fa-user-shield"></i> Create Ranger & Recruitment</summary><div class="rg-manual-body"><p><b>Create Ranger</b> is the authoritative rules-driven player-character path. GUIDED mode explains the choices; QUICK uses the same rules with less text. Completed Rangers are created in <b>Actors > PC</b>, creating that folder if needed.</p><p>The separate Recruitment Guide explains Station, Dúnadan Nature, Homeland, Natural Talent, Life Experience, Specialty, Relationships, BGI and starting Gear without starting creation.</p></div></details>

    <details><summary><i class="fa-solid fa-dice"></i> Rolls, Learning, Fate & Persona</summary><div class="rg-manual-body"><p>Skill, Ability, Nature, Versus and Beginner's Luck tests use the Realm Guard / Torchbearer Roll Dialog. Obstacle defaults to 1 and Modifier to 0. Traits, Wises, Teamwork, Persona, Fate/Open 6s, Tokens and Talents appear when applicable.</p><p>Trained Skills track Pass/Fail advancement. <b>Lifetime Spent Fate/Persona</b> only increases when a real committed Fate/Persona spend occurs; awards and GM +/- corrections do not count as advancement spend.</p></div></details>

    <details><summary><i class="fa-solid fa-arrows-rotate"></i> Turn Manager, Checks & Recovery</summary><div class="rg-manual-body"><p>Structured Mode uses GM Turn and Players' Turn. Each Ranger receives one Free Test at the start of Players' Turn; additional tests cost Checks. Trait Against during GM Turn can earn Checks. Free Play disables that economy without deleting Actor data.</p><p>Recovery follows the configured Condition rules. Canonical recovery order is Hungry & Thirsty -> Angry -> Tired -> Injured -> Strained. Afraid and Fresh use their own supplementary handling.</p></div></details>

    <details><summary><i class="fa-solid fa-heart-pulse"></i> Conditions</summary><div class="rg-manual-body"><p>Conditions can be managed from the global Conditions dropdown, Ranger/NPC sheets and token HUD. Hover/click condition controls for explanations. Fresh cannot coexist with another active Condition. Custom Conditions are supported and can use manual, Ability or Skill recovery.</p></div></details>

    <details><summary><i class="fa-solid fa-shield-halved"></i> Inventory, Gear & Tokens of Power</summary><div class="rg-manual-body"><p>Inventory & Gear uses the paper-doll layout with Left Hand, Right Hand, Head, Neck, Cloak, Torso, Belt, Pocket and Feet plus Containers and Unassigned Gear. Two-handed weapons lock the opposite hand.</p><p><b>Tokens of Power</b> live at the top of Inventory & Gear. The system implements their Level 1/2/3 behavior and keeps specific-use/manual effects explicit when fictional applicability cannot be inferred safely.</p></div></details>

    <details><summary><i class="fa-solid fa-khanda"></i> Card-driven Conflict Engine</summary><div class="rg-manual-body"><p>GM and Ranger side secretly script three Action cards: <b>Attack, Defend, Feint, Maneuver</b>. GM cards and Ranger cards use different visual families and remain hidden from the opposing side until reveal. The Conflict Captain assigns each Ranger action to a participating Ranger.</p><p>The engine handles Starting Disposition, action interaction, Skill mapping, Teamwork, weapons, Maneuvers, Disposition, ties, Learning and Compromise. Use table/Modifier judgement for deliberately non-automated edge cases.</p></div></details>

    <details><summary><i class="fa-solid fa-star"></i> Levels & Talents</summary><div class="rg-manual-body"><p>Realm Guard / Torchbearer Foundry adds long-term Level progression driven by <b>lifetime spent Fate and Persona</b>. Both thresholds are required. From Level 2 onward a Ranger gains one Talent slot per Level. Talents may be Passive, Once per Session or Once per Conflict and may link to a Skill, Ability or table-approved general use.</p><p>This is an explicit Foundry expansion inspired by a selected Torchbearer 2E progression idea; it does not import Torchbearer classes, Town/Camp/Grind or other unrelated subsystems.</p></div></details>

    <details><summary><i class="fa-solid fa-user-gear"></i> NPC & GM Control</summary><div class="rg-manual-body"><p><b>Quick NPC</b> creates compact NPCs in <b>Actors > NPC</b> and can apply rank-aware convenience loadouts. GM Control also provides Quick NPC Roll, Conditions, group resource administration and shortcuts to the active table tools.</p><p>NPC presets/loadouts are Foundry conveniences rather than new printed-source rules.</p></div></details>

    <details><summary><i class="fa-solid fa-book-atlas"></i> Starter Compendiums</summary><div class="rg-manual-body"><p>A clean GM world receives eight Starter Compendiums: Skills, Traits, Wises, Conditions, Gear, Tokens of Power, Talents and NPC Templates. <b>Add Missing Entries</b> is non-destructive: it restores missing starter entries without overwriting edited or custom documents.</p><p>Wises remain unrated. The project does not implement Wises 2.0.</p></div></details>

    <details><summary><i class="fa-solid fa-wand-magic-sparkles"></i> Content Studio</summary><div class="rg-manual-body"><p>GM Content Studio creates or duplicates system content using type-aware forms and a Review Before Create gate. It can write to World content, selected Actors, the recommended custom Compendiums or another writable matching Compendium.</p><p>Duplicate & Modify never edits the source and strips Starter Library identity from custom copies. For ordinary player Rangers, continue to use Create Ranger rather than the admin/template Actor flow.</p></div></details>

    <details><summary><i class="fa-solid fa-award"></i> End Session</summary><div class="rg-manual-body"><p>End Session is GM-only in the GM Dock. Use it to review BGI/rewards and finalize Fate/Persona awards. Start Next Session resets supported once/session state such as Tokens of Power and Talents while preserving progression and world content.</p></div></details>

    <details><summary><i class="fa-solid fa-server"></i> World Backup & Transfer</summary><div class="rg-manual-body"><p><b>The game-system package and a Foundry World are separate.</b> Installing Realm Guard / Torchbearer on another server gives that server the system, not your campaign.</p><ol><li>Back up the existing Foundry World before major upgrades or moves.</li><li>Install a compatible system version on the destination server.</li><li>Transfer/restore the actual World data using your Foundry hosting/server backup method.</li><li>Also install any modules or external assets the World depends on.</li><li>Open the copied World and run the GM <b>World Health Audit</b> before play.</li></ol><p>Rangers, NPCs, Scenes, Journals, campaign Items, custom Compendiums, progression and campaign state live with the World. Starter definitions live with the system and can seed clean worlds.</p></div></details>

    <details><summary><i class="fa-solid fa-screwdriver-wrench"></i> Troubleshooting & Safe Upgrades</summary><div class="rg-manual-body"><p>Before replacing a major system version, back up the World. Upgrades are designed to be non-destructive: existing Actors/Items should be preserved and migrations should move data forward rather than reset it.</p><p>If something fails, note the exact action, capture the F12 Console error and run the GM World Health Audit. Do not delete world data to troubleshoot a system bug unless you have a verified backup.</p></div></details>

    <section class="rg-manual-section-title"><i class="fa-solid fa-scale-balanced"></i><div><h3>Rules Reference</h3><p>A practical summary of the tabletop rules and project expansions the system actually implements.</p></div></section>
    ${rulesReferenceDetailsHtml()}
  </div>`;
}

export async function openRealmGuardManual() {
  const buttons = [
    { action: "rules", label: "Open Rules Journal", icon: "fa-solid fa-book-bookmark", callback: () => "rules" }
  ];
  if (game.user?.isGM) buttons.push({ action: "audit", label: "World Health Audit", icon: "fa-solid fa-shield-heart", callback: () => "audit" });
  buttons.push({ action: "close", label: "Close", default: true, callback: () => "close" });
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: `${RG_SYSTEM_NAME} · Manual & Rules Reference`, resizable: true },
    position: { width: 800, height: 840 },
    content: manualContent(),
    modal: false,
    rejectClose: false,
    buttons
  });
  if (result === "audit") setTimeout(() => void openSystemAudit(), 0);
  if (result === "rules") setTimeout(() => void openRulesReferenceJournal(), 0);
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
