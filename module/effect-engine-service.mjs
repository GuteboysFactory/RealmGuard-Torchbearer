import { registerGmDockTool } from "./gm-dock.mjs";
import {
  EffectEngine,
  createEffect,
  effectApplies,
  defaultRequirementEvaluator,
  EFFECT_TYPES,
  EFFECT_TIMINGS,
  EFFECT_STACKING
} from "./core/effects.mjs";

const engine = new EffectEngine();

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

export function getEffectEngine() {
  return engine;
}

export function getEffectEngineStatus() {
  return Object.freeze({
    phase: "M2",
    mode: "SHADOW_DIAGNOSTIC",
    liveApplication: false,
    providerCount: engine.listProviders().length,
    supportedTypes: Object.freeze([...Object.values(EFFECT_TYPES)]),
    supportedTimings: Object.freeze([...Object.values(EFFECT_TIMINGS)]),
    supportedStacking: Object.freeze([...Object.values(EFFECT_STACKING)])
  });
}

function diagnosticsHtml() {
  const status = getEffectEngineStatus();
  const providers = engine.listProviders();
  return `<div class="realm-guard" style="padding:4px 10px 10px 2px;max-height:calc(100vh - 190px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;">
    <header style="margin-bottom:14px;">
      <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M2</div>
      <h2 style="margin:3px 0 4px;">Unified Effect Engine</h2>
      <p style="margin:0;">M2 introduces the shared Effect model and provider pipeline in shadow/diagnostic mode. Live roll, Conflict and recovery engines still use the v1.3.0 GOLD behavior.</p>
    </header>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;">
      <div><small>Mode</small><br><b>${esc(status.mode)}</b></div>
      <div><small>Live application</small><br><b>${status.liveApplication ? "ON" : "OFF"}</b></div>
      <div><small>Providers</small><br><b>${esc(status.providerCount)}</b></div>
    </div>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Effect Types</h3>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${status.supportedTypes.map(type => `<code style="padding:2px 5px;border:1px solid rgba(128,128,128,.25);border-radius:4px;">${esc(type)}</code>`).join("")}</div>
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Registered Providers</h3>
      ${providers.length ? providers.map(provider => `<div><b>${esc(provider.label)}</b> <small>${esc(provider.id)} · priority ${esc(provider.priority)}</small></div>`).join("") : `<p style="margin:0;"><b>0 live providers.</b> This is expected in v1.4.0-qa.1. Provider migration begins only after the engine foundation passes QA.</p>`}
    </section>
    <div style="padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
      <b>No gameplay takeover in this build.</b><br>
      <small>The Effect Engine is available for diagnostics and automated smoke tests only. It must not change existing dice pools or rule outcomes in qa.1.</small>
    </div>
  </div>`;
}

export async function openEffectEngineDiagnostics() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Effect Engine diagnostics are GM-only.");
  return foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard / Torchbearer · CORE M2 Effect Engine", resizable: true },
    position: { width: 720, height: 620 },
    content: diagnosticsHtml(),
    modal: false,
    rejectClose: false,
    buttons: [{ action: "close", label: "Close", default: true, callback: () => "close" }]
  });
}

function exposeEffectApi() {
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.phase = "M2";
  game.realmGuard.core.effects = Object.freeze({
    engine,
    getStatus: getEffectEngineStatus,
    createEffect,
    effectApplies,
    defaultRequirementEvaluator,
    types: EFFECT_TYPES,
    timings: EFFECT_TIMINGS,
    stacking: EFFECT_STACKING
  });
}

export function installEffectEngineInfrastructure() {
  registerGmDockTool({
    id: "effect-engine",
    icon: "fa-solid fa-sliders",
    tooltip: "MG-Family CORE · M2 Effect Engine",
    order: 10,
    onClick: openEffectEngineDiagnostics
  });

  Hooks.once("ready", () => {
    exposeEffectApi();
    console.log("realm-guard | CORE M2 Effect Engine ready", getEffectEngineStatus());
  });
}
