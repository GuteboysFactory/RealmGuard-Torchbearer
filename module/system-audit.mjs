import { registerGmDockTool } from "./gm-dock.mjs";
import { RG_DEFAULT_SKILLS } from "./default-skills.mjs";
import { progressionLevelFor } from "./progression.mjs";
import { getCoreBaselineStatus, CORE_SCHEMA_VERSION, CORE_ARCHITECTURE_VERSION, LEGACY_PROFILE_ID } from "./core-baseline.mjs";

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const normalize = value => String(value ?? "").trim().toLowerCase();

const STARTER_PACKS = Object.freeze([
  { collection: "world.realm-guard-starter-skills", label: "Starter Skills", expected: 35 },
  { collection: "world.realm-guard-starter-traits", label: "Starter Traits", expected: 53 },
  { collection: "world.realm-guard-starter-wises", label: "Starter Wises", expected: 101 },
  { collection: "world.realm-guard-starter-conditions", label: "Starter Conditions", expected: 7 },
  { collection: "world.realm-guard-starter-gear", label: "Starter Gear", expected: 24 },
  { collection: "world.realm-guard-starter-tokens-of-power", label: "Starter Tokens of Power", expected: 4 },
  { collection: "world.realm-guard-starter-talents", label: "Starter Talents", expected: 12 },
  { collection: "world.realm-guard-starter-npc-templates", label: "Starter NPC Templates", expected: 8 }
]);

function issue(severity, area, message, actor = null) {
  return { severity, area, message, actor: actor?.name ?? "", actorId: actor?.id ?? "" };
}

function auditActor(actor) {
  const issues = [];
  const roles = actor.items.filter(item => item.type === "role");
  const byName = new Map();
  for (const role of roles) {
    const key = normalize(role.name);
    if (!key) continue;
    byName.set(key, [...(byName.get(key) ?? []), role]);
  }

  const missingSkills = RG_DEFAULT_SKILLS.filter(name => !byName.has(normalize(name)));
  if (missingSkills.length) issues.push(issue("warn", "Skills", `Missing ${missingSkills.length} canonical Skill entr${missingSkills.length === 1 ? "y" : "ies"}.`, actor));
  const duplicateSkills = [...byName.entries()].filter(([, items]) => items.length > 1 && RG_DEFAULT_SKILLS.some(name => normalize(name) === normalize(items[0].name)));
  if (duplicateSkills.length) issues.push(issue("error", "Skills", `Duplicate canonical Skills: ${duplicateSkills.map(([, items]) => items[0].name).join(", ")}.`, actor));

  const conditions = actor.items.filter(item => item.type === "condition");
  const conditionNames = new Map();
  for (const condition of conditions) {
    const key = normalize(condition.name);
    conditionNames.set(key, (conditionNames.get(key) ?? 0) + 1);
  }
  const duplicateConditions = [...conditionNames.entries()].filter(([, count]) => count > 1).map(([name]) => name);
  if (duplicateConditions.length) issues.push(issue("warn", "Conditions", `Duplicate Condition names: ${duplicateConditions.join(", ")}.`, actor));

  for (const resource of ["fate", "persona", "checks"]) {
    const track = actor.system?.resources?.[resource];
    if (!track) continue;
    const value = Number(track.value ?? 0);
    const max = Number(track.max ?? 0);
    if (!Number.isInteger(value) || value < 0 || value > max) issues.push(issue("error", "Resources", `${resource} is outside 0-${max}: ${value}.`, actor));
  }

  for (const ability of ["will", "health", "resources", "circles"]) {
    const track = actor.system?.attributes?.[ability];
    if (!track) continue;
    const value = Number(track.value ?? 0);
    const max = Number(track.max ?? 0);
    if (!Number.isInteger(value) || value < 0 || value > max) issues.push(issue("error", "Abilities", `${ability} is outside 0-${max}: ${value}.`, actor));
  }
  const nature = actor.system?.attributes?.nature;
  if (nature) {
    const value = Number(nature.value ?? 0);
    const maximum = Number(nature.maximum ?? 0);
    if (!Number.isInteger(value) || !Number.isInteger(maximum) || value < 0 || maximum < 0 || value > maximum || maximum > 7) issues.push(issue("error", "Nature", `Nature value/maximum is invalid: ${value}/${maximum}.`, actor));
  }

  if (actor.type === "character") {
    const spentFate = Number(actor.system?.progression?.spentFate ?? 0);
    const spentPersona = Number(actor.system?.progression?.spentPersona ?? 0);
    const stored = Number(actor.system?.progression?.level ?? 1);
    const expected = progressionLevelFor(spentFate, spentPersona);
    if (stored !== expected) issues.push(issue("warn", "Progression", `Stored Level ${stored} does not match lifetime spend (${spentFate} Fate / ${spentPersona} Persona -> Level ${expected}).`, actor));
  }

  const gear = actor.items.filter(item => item.type === "gear");
  const left = gear.filter(item => String(item.system?.inventory?.location ?? "") === "left-hand");
  const right = gear.filter(item => String(item.system?.inventory?.location ?? "") === "right-hand");
  if (left.length > 1) issues.push(issue("warn", "Inventory", `More than one item occupies Left Hand: ${left.map(item => item.name).join(", ")}.`, actor));
  if (right.length > 1) issues.push(issue("warn", "Inventory", `More than one item occupies Right Hand: ${right.map(item => item.name).join(", ")}.`, actor));
  const leftTwo = left.find(item => Number(item.system?.inventory?.wieldHands ?? 0) === 2);
  const rightTwo = right.find(item => Number(item.system?.inventory?.wieldHands ?? 0) === 2);
  if (leftTwo && right.length) issues.push(issue("error", "Inventory", `${leftTwo.name} is 2H in Left Hand while Right Hand is occupied.`, actor));
  if (rightTwo && left.length) issues.push(issue("error", "Inventory", `${rightTwo.name} is 2H in Right Hand while Left Hand is occupied.`, actor));

  for (const talent of actor.items.filter(item => item.type === "talent")) {
    const frequency = String(talent.system?.frequency ?? "session");
    const linkType = String(talent.system?.linkType ?? "skill");
    if (!["passive", "session", "conflict"].includes(frequency)) issues.push(issue("warn", "Talents", `${talent.name} has unknown frequency '${frequency}'.`, actor));
    if (!["skill", "ability", "general"].includes(linkType)) issues.push(issue("warn", "Talents", `${talent.name} has unknown link type '${linkType}'.`, actor));
  }
  for (const token of actor.items.filter(item => item.type === "tokenOfPower")) {
    const level = Number(token.system?.level ?? 1);
    if (![1, 2, 3].includes(level)) issues.push(issue("error", "Tokens of Power", `${token.name} has invalid Level ${level}.`, actor));
  }

  return issues;
}

async function packCount(pack) {
  try {
    const index = await pack.getIndex();
    return Number(index?.size ?? index?.contents?.length ?? 0);
  } catch (_error) {
    return -1;
  }
}

export async function collectSystemAudit() {
  const issues = [];
  const foundryVersion = String(game.version ?? game.release?.version ?? "Unknown");
  const systemVersion = String(game.system?.version ?? "Unknown");
  if (!foundryVersion.startsWith("13")) issues.push(issue("error", "Compatibility", `Foundry ${foundryVersion} is outside the supported v13 line.`));
  else if (foundryVersion !== "13.351") issues.push(issue("warn", "Compatibility", `Project target is Foundry 13.351; current host reports ${foundryVersion}.`));

  const core = getCoreBaselineStatus();
  if (core.schemaVersion < CORE_SCHEMA_VERSION) issues.push(issue("error", "CORE M0", `Schema metadata is ${core.schemaVersion}; expected ${CORE_SCHEMA_VERSION}.`));
  if (core.architectureVersion !== CORE_ARCHITECTURE_VERSION) issues.push(issue("warn", "CORE M0", `Architecture metadata is '${core.architectureVersion || "unset"}'; expected '${CORE_ARCHITECTURE_VERSION}'.`));
  if (core.profileId !== LEGACY_PROFILE_ID) issues.push(issue("warn", "CORE M0", `Active rules-profile metadata is '${core.profileId || "unset"}'; M0 compatibility target is '${LEGACY_PROFILE_ID}'.`));
  if (core.lastError) issues.push(issue("error", "CORE M0", "The last CORE migration recorded an error. Review the F12 console and migration metadata before continuing."));

  const actors = (game.actors?.contents ?? []).filter(actor => ["character", "npc"].includes(actor.type));
  for (const actor of actors) issues.push(...auditActor(actor));

  const packRows = [];
  for (const expected of STARTER_PACKS) {
    const pack = game.packs?.get?.(expected.collection);
    if (!pack) {
      packRows.push({ ...expected, count: 0, ok: false });
      issues.push(issue("warn", "Starter Library", `${expected.label} pack is missing.`));
      continue;
    }
    const count = await packCount(pack);
    const ok = count >= expected.expected;
    packRows.push({ ...expected, count, ok });
    if (!ok) issues.push(issue("warn", "Starter Library", `${expected.label} has ${count} entries; expected at least ${expected.expected}.`));
  }

  const folders = (game.folders?.contents ?? []).filter(folder => folder.type === "Actor" && !folder.folder);
  const pcFolder = folders.find(folder => normalize(folder.name) === "pc") ?? null;
  const npcFolder = folders.find(folder => normalize(folder.name) === "npc") ?? null;
  const counts = {
    characters: actors.filter(actor => actor.type === "character").length,
    npcs: actors.filter(actor => actor.type === "npc").length,
    worldItems: game.items?.size ?? game.items?.contents?.length ?? 0,
    scenes: game.scenes?.size ?? game.scenes?.contents?.length ?? 0,
    journals: game.journal?.size ?? game.journal?.contents?.length ?? 0,
    users: game.users?.size ?? game.users?.contents?.length ?? 0
  };

  const errors = issues.filter(row => row.severity === "error").length;
  const warnings = issues.filter(row => row.severity === "warn").length;
  return { foundryVersion, systemVersion, core, actors, counts, packRows, pcFolder, npcFolder, issues, errors, warnings, ok: errors === 0 && warnings === 0 };
}

function auditHtml(report) {
  const status = report.errors ? "BLOCKING ISSUES" : report.warnings ? "REVIEW WARNINGS" : "CLEAN";
  const statusClass = report.errors ? "bad" : report.warnings ? "warn" : "good";
  const issueRows = report.issues.length ? report.issues.map(row => `<div class="rg-audit-issue ${row.severity}"><i class="fa-solid ${row.severity === "error" ? "fa-circle-xmark" : "fa-triangle-exclamation"}"></i><div><b>${esc(row.area)}${row.actor ? ` · ${esc(row.actor)}` : ""}</b><span>${esc(row.message)}</span></div></div>`).join("") : `<div class="rg-audit-empty"><i class="fa-solid fa-circle-check"></i><span>No structural warnings found by the automated World Health Audit.</span></div>`;
  return `<div class="realm-guard rg-system-audit">
    <header class="rg-audit-hero"><div><div class="rg-brand">REALM GUARD / TORCHBEARER · CORE M0</div><h2>World Health Audit</h2><p>Read-only diagnostics. This tool does not move, delete, reset or repair world content.</p></div><span class="rg-audit-status ${statusClass}">${status}</span></header>
    <div class="rg-audit-summary"><div><small>RG / TB</small><b>${esc(report.systemVersion)}</b></div><div><small>Foundry</small><b>${esc(report.foundryVersion)}</b></div><div><small>Schema</small><b>${report.core.schemaVersion}</b></div><div><small>Profile</small><b>${esc(report.core.profileId || "unset")}</b></div><div><small>Warnings</small><b>${report.warnings}</b></div><div><small>Errors</small><b>${report.errors}</b></div></div>
    <section><h3>CORE migration baseline</h3><div class="rg-audit-facts"><span>Architecture <b>${esc(report.core.architectureVersion || "unset")}</b></span><span>Profile version <b>${report.core.profileVersion}</b></span><span>Migration entries <b>${report.core.migrationCount}</b></span><span>Last migration <b>${esc(report.core.lastMigration?.id || "none")}</b></span></div><p><small>M0 metadata is compatibility bookkeeping only. It does not convert this world to Strict Realm Guard and does not rewrite Actor or Item rules.</small></p></section>
    <section><h3>World structure</h3><div class="rg-audit-facts"><span>PC folder <b>${report.pcFolder ? "Present" : "Not present yet"}</b></span><span>NPC folder <b>${report.npcFolder ? "Present" : "Not present yet"}</b></span><span>World Items <b>${report.counts.worldItems}</b></span><span>Scenes <b>${report.counts.scenes}</b></span><span>Journals <b>${report.counts.journals}</b></span><span>Users <b>${report.counts.users}</b></span></div><p><small>PC/NPC folders are created on demand by Realm Guard creation flows. Their absence is not itself an error.</small></p></section>
    <section><h3>Starter Library</h3><div class="rg-audit-packs">${report.packRows.map(row => `<span class="${row.ok ? "ok" : "missing"}">${esc(row.label)} <b>${row.count}/${row.expected}</b></span>`).join("")}</div></section>
    <section><h3>Findings</h3><div class="rg-audit-issues">${issueRows}</div></section>
    <div class="rg-audit-note"><i class="fa-solid fa-database"></i><span>Before a major upgrade or server move, back up the Foundry World data. Installing the Realm Guard / Torchbearer system on another server does not move your World automatically.</span></div>
  </div>`;
}

function auditChatHtml(report) {
  const label = report.errors ? "BLOCKING ISSUES" : report.warnings ? "WARNINGS" : "CLEAN";
  const top = report.issues.slice(0, 8);
  return `<div class="realm-guard rg-chat-card"><span class="rg-kicker">CORE M0 · WORLD AUDIT</span><h3>${esc(label)}</h3><p>Realm Guard / Torchbearer ${esc(report.systemVersion)} · Foundry ${esc(report.foundryVersion)} · Schema ${report.core.schemaVersion} · ${esc(report.core.profileId || "profile unset")} · ${report.counts.characters} Rangers · ${report.counts.npcs} NPCs</p>${top.length ? `<ul>${top.map(row => `<li><b>${esc(row.area)}${row.actor ? ` · ${esc(row.actor)}` : ""}:</b> ${esc(row.message)}</li>`).join("")}</ul>` : `<p>No structural warnings found.</p>`}${report.issues.length > top.length ? `<p><small>${report.issues.length - top.length} additional finding(s) remain in the full audit window.</small></p>` : ""}</div>`;
}

export async function openSystemAudit() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: World Health Audit is GM-only.");
  const report = await collectSystemAudit();
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard / Torchbearer · World Health Audit", resizable: true },
    position: { width: 760, height: 760 },
    content: auditHtml(report),
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "post", label: "Post Summary to Chat", icon: "fa-solid fa-message", callback: () => "post" },
      { action: "close", label: "Close", default: true, callback: () => "close" }
    ]
  });
  if (result === "post") await ChatMessage.create({ content: auditChatHtml(report) });
  return report;
}

export function installSystemAudit() {
  registerGmDockTool({ id: "system-audit", icon: "fa-solid fa-shield-heart", tooltip: "Realm Guard / Torchbearer World Health Audit", order: 8, onClick: openSystemAudit });
}
