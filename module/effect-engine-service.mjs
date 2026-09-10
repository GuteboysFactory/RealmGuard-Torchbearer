import { registerGmDockTool } from "./gm-dock.mjs";
import { conditionRollData } from "./conditions.mjs";
import {
  EffectEngine,
  createEffect,
  effectApplies,
  defaultRequirementEvaluator,
  EFFECT_TYPES,
  EFFECT_TIMINGS,
  EFFECT_STACKING
} from "./core/effects.mjs";
import {
  CONDITION_ROLL_EFFECT_PROVIDER,
  CONDITION_ROLL_PROVIDER_ID,
  buildConditionEffectContext
} from "./providers/condition-effects.mjs";

const engine = new EffectEngine();

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function registerShadowProviders() {
  const registered = new Set(engine.listProviders().map(provider => provider.id));
  if (!registered.has(CONDITION_ROLL_PROVIDER_ID)) engine.registerProvider(CONDITION_ROLL_EFFECT_PROVIDER);
}

export function getEffectEngine() {
  return engine;
}

export function getEffectEngineStatus() {
  return Object.freeze({
    phase: "M2",
    mode: "SHADOW_COMPARE",
    liveApplication: false,
    providerCount: engine.listProviders().length,
    migratedProviders: Object.freeze(engine.listProviders().map(provider => provider.id)),
    shadowScope: "CONDITION_DICE_MODIFIERS_ONLY",
    supportedTypes: Object.freeze([...Object.values(EFFECT_TYPES)]),
    supportedTimings: Object.freeze([...Object.values(EFFECT_TIMINGS)]),
    supportedStacking: Object.freeze([...Object.values(EFFECT_STACKING)])
  });
}

export function compareConditionDice(actor, rollName, { isSkill = true } = {}) {
  if (!actor) throw new Error("compareConditionDice requires an Actor.");
  registerShadowProviders();
  const legacy = conditionRollData(actor, rollName, { isSkill });
  const context = buildConditionEffectContext(actor, rollName, { isSkill });
  const core = engine.summarizeNumeric(EFFECT_TYPES.DICE_MODIFIER, context, { providerIds: [CONDITION_ROLL_PROVIDER_ID] });
  return Object.freeze({
    match: Number(legacy.dice) === Number(core.value),
    rollName: String(rollName ?? ""),
    isSkill: Boolean(isSkill),
    legacy: Object.freeze({
      dice: Number(legacy.dice ?? 0),
      conditions: Object.freeze((legacy.active ?? []).map(condition => condition.name))
    }),
    core: Object.freeze({
      dice: Number(core.value ?? 0),
      effects: Object.freeze(core.effects.map(effect => Object.freeze({
        id: effect.id,
        value: effect.value,
        condition: effect.source.conditionName,
        providerId: effect.source.providerId
      })))
    })
  });
}

function diagnosticsHtml() {
  registerShadowProviders();
  const status = getEffectEngineStatus();
  const providers = engine.listProviders();
  return `<div class="realm-guard" style="padding:4px 10px 10px 2px;max-height:calc(100vh - 190px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;">
    <header style="margin-bottom:14px;">
      <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M2</div>
      <h2 style="margin:3px 0 4px;">Unified Effect Engine</h2>
      <p style="margin:0;">The first real Effect Provider is now running in shadow-compare mode. Existing live rolls still use the v1.3.0 GOLD Condition logic.</p>
    </header>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;">
      <div><small>Mode</small><br><b>${esc(status.mode)}</b></div>
      <div><small>Live application</small><br><b>${status.liveApplication ? "ON" : "OFF"}</b></div>
      <div><small>Providers</small><br><b>${esc(status.providerCount)}</b></div>
    </div>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Shadow Migration Scope</h3>
      <p style="margin:0 0 6px;"><b>Condition dice modifiers only.</b></p>
      <p style="margin:0;">Active Condition <code>rollModifier</code> and <code>appliesTo</code> data are translated into CORE <code>DICE_MODIFIER</code> Effects and can be compared against the existing Condition roll calculation. Recovery, disposition and capability-block rules have not moved yet.</p>
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Registered Providers</h3>
      ${providers.map(provider => `<div><b>${esc(provider.label)}</b> <small>${esc(provider.id)} · priority ${esc(provider.priority)}</small></div>`).join("")}
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">QA Shadow Compare</h3>
      <p style="margin:0 0 6px;">Console helper:</p>
      <code>game.realmGuard.core.effects.compareConditionDice(actor, "Pathfinder", { isSkill: true })</code>
      <p style="margin:6px 0 0;">Expected: <b>match: true</b>. The helper is read-only and does not roll dice or change Actor data.</p>
    </section>
    <div style="padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
      <b>No gameplay takeover in qa.2.</b><br>
      <small>The Condition provider is deliberately shadow-only. Any live pool or outcome change from v1.3.0 is a blocker.</small>
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
  registerShadowProviders();
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.phase = "M2";
  game.realmGuard.core.effects = Object.freeze({
    engine,
    getStatus: getEffectEngineStatus,
    compareConditionDice,
    buildConditionEffectContext,
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
    registerShadowProviders();
    exposeEffectApi();
    console.log("realm-guard | CORE M2 Effect Engine ready", getEffectEngineStatus());
  });
}
