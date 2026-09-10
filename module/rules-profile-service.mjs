import { registerGmDockTool } from "./gm-dock.mjs";
import { getCoreBaselineStatus, LEGACY_PROFILE_ID } from "./core-baseline.mjs";
import { ProfileResolver, createProfileSnapshot } from "./core/rules-profile.mjs";
import { RulesRegistry } from "./core/rules-registry.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "./profiles/realm-guard-legacy-mixed.mjs";

const resolver = new ProfileResolver([REALM_GUARD_LEGACY_MIXED_PROFILE]);
let runtime = null;

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function resolveRequestedProfileId(profileId = null) {
  if (profileId) return String(profileId);
  const core = getCoreBaselineStatus();
  return core.profileId || LEGACY_PROFILE_ID;
}

export function resolveRulesProfile(profileId = null) {
  const requestedProfileId = resolveRequestedProfileId(profileId);
  const profile = resolver.resolve(requestedProfileId);
  const registry = new RulesRegistry(profile);
  const snapshot = createProfileSnapshot(profile);
  return Object.freeze({ profile, registry, snapshot });
}

export function refreshRulesProfileRuntime() {
  runtime = resolveRulesProfile();
  return runtime;
}

export function getRulesProfileRuntime() {
  return runtime ?? refreshRulesProfileRuntime();
}

export function getActiveRulesProfile() {
  return getRulesProfileRuntime().profile;
}

export function getActiveRulesRegistry() {
  return getRulesProfileRuntime().registry;
}

export function getActiveRulesSnapshot() {
  return getRulesProfileRuntime().snapshot;
}

function registryHtml(state) {
  const grouped = new Map();
  for (const entry of state.registry.list()) {
    const rows = grouped.get(entry.domain) ?? [];
    rows.push(entry);
    grouped.set(entry.domain, rows);
  }

  const sections = [...grouped.entries()].map(([domain, entries]) => `
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;text-transform:uppercase;font-size:0.9em;letter-spacing:.05em;">${esc(domain)}</h3>
      ${entries.map(entry => `
        <div style="display:grid;grid-template-columns:minmax(145px,1fr) minmax(150px,1.1fr);gap:5px 12px;padding:7px 0;border-top:1px solid rgba(128,128,128,.2);">
          <div><b>${esc(entry.title)}</b><br><small>${esc(entry.id)}</small></div>
          <div><b>${esc(entry.activeValue)}</b><br><small>${esc(entry.classification)} · ${esc(entry.automation)}</small></div>
          <div style="grid-column:1/-1;"><small>Provider: ${esc(entry.providerProfile)} · Source: ${esc(entry.source)}${entry.sourceVersion ? ` · ${esc(entry.sourceVersion)}` : ""}</small>${entry.overrideReason ? `<br><small>${esc(entry.overrideReason)}</small>` : ""}</div>
        </div>`).join("")}
    </section>`).join("");

  return `<div class="realm-guard" style="padding:4px 2px 10px;">
    <header style="margin-bottom:14px;">
      <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M1</div>
      <h2 style="margin:3px 0 4px;">Active Rules Registry</h2>
      <p style="margin:0;">M1 documents and resolves the current compatibility profile. It does not replace the live gameplay engines yet.</p>
    </header>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;">
      <div><small>Profile</small><br><b>${esc(state.profile.name)}</b></div>
      <div><small>Profile version</small><br><b>${esc(state.profile.version)}</b></div>
      <div><small>Rules snapshot</small><br><b>${esc(state.profile.rulesSnapshotHash)}</b></div>
    </div>
    <div style="padding:8px 10px;margin-bottom:14px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
      <b>Compatibility profile</b><br>
      <small>${esc(state.profile.id)} preserves the v1.2.0 GOLD behavior during the CORE refactor. Strict Realm Guard is not active.</small>
    </div>
    ${sections}
  </div>`;
}

export async function openRulesRegistry() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Rules Registry is GM-only.");
  let state;
  try {
    state = refreshRulesProfileRuntime();
  } catch (error) {
    console.error("realm-guard | Failed to resolve active Rules Profile", error);
    return ui.notifications.error(`Realm Guard: Rules Profile could not be resolved. ${error?.message ?? error}`);
  }

  return foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard / Torchbearer · Active Rules Registry", resizable: true },
    position: { width: 760, height: 760 },
    content: registryHtml(state),
    modal: false,
    rejectClose: false,
    buttons: [{ action: "close", label: "Close", default: true, callback: () => "close" }]
  });
}

function exposeCoreApi() {
  const state = getRulesProfileRuntime();
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  Object.assign(game.realmGuard.core, {
    phase: "M1",
    getActiveRulesProfile,
    getActiveRulesRegistry,
    getActiveRulesSnapshot,
    resolveRulesProfile,
    refreshRulesProfileRuntime,
    registeredProfiles: () => resolver.list().map(profile => ({ id: profile.id, version: profile.version, name: profile.name })),
    currentSnapshot: state.snapshot
  });
}

export function installRulesProfileInfrastructure() {
  registerGmDockTool({
    id: "rules-registry",
    icon: "fa-solid fa-scale-balanced",
    tooltip: "MG-Family CORE · Active Rules Registry",
    order: 9,
    onClick: openRulesRegistry
  });

  Hooks.once("ready", () => {
    try {
      refreshRulesProfileRuntime();
      exposeCoreApi();
      console.log("realm-guard | CORE M1 Rules Profile ready", getActiveRulesSnapshot());
    } catch (error) {
      console.error("realm-guard | CORE M1 Rules Profile initialization failed", error);
    }
  });
}
