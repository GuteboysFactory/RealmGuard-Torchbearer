import { getEffectEngine } from "./effect-engine-service.mjs";
import { resolveTalentUse } from "./talents.mjs";
import { EFFECT_TYPES } from "./core/effects.mjs";
import {
  TALENT_SELECTION_EFFECT_PROVIDER,
  TALENT_SELECTION_PROVIDER_ID,
  buildTalentEffectContext
} from "./providers/talent-effects.mjs";
import { registerGmDockTool } from "./gm-dock.mjs";

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function registerTalentProvider() {
  const engine = getEffectEngine();
  const registered = new Set(engine.listProviders().map(provider => provider.id));
  if (!registered.has(TALENT_SELECTION_PROVIDER_ID)) engine.registerProvider(TALENT_SELECTION_EFFECT_PROVIDER);
  return engine;
}

function talentStatus(baseApi) {
  const status = baseApi?.getStatus?.() ?? {};
  return Object.freeze({
    ...status,
    providerCount: getEffectEngine().listProviders().length,
    migratedProviders: Object.freeze(getEffectEngine().listProviders().map(provider => provider.id)),
    shadowScope: "CONDITION_DICE_TRAIT_WISE_TOKEN_POWER_TALENT_AND_CONFLICT_TOOL_EFFECTS"
  });
}

export function compareTalentEffects(actor, talentId, sourceName, { isSkill = true, contextKey = "" } = {}) {
  if (!actor) throw new Error("compareTalentEffects requires an Actor.");
  const engine = registerTalentProvider();
  const legacyUse = resolveTalentUse(actor, talentId, sourceName, { isSkill, contextKey });
  const context = buildTalentEffectContext(actor, talentId, sourceName, { isSkill, contextKey });
  const effects = engine.collect(context, { providerIds: [TALENT_SELECTION_PROVIDER_ID] });

  const diceBonus = effects
    .filter(effect => effect.type === EFFECT_TYPES.DICE_MODIFIER)
    .reduce((total, effect) => total + Number(effect.value ?? 0), 0);
  const manual = effects.some(effect => effect.type === EFFECT_TYPES.MANUAL);
  const consumeOnCommit = effects.some(effect => effect.type === EFFECT_TYPES.STATE_CHANGE);
  const frequency = String(context.talent?.system?.frequency ?? "session").trim().toLowerCase();

  const core = Object.freeze({
    talent: context.talent?.name ?? null,
    available: effects.length > 0,
    diceBonus,
    manual,
    consumeOnCommit,
    frequency,
    effects: Object.freeze(effects.map(effect => Object.freeze({
      id: effect.id,
      type: effect.type,
      value: effect.value,
      timing: effect.timing,
      channel: effect.metadata?.channel ?? null,
      talent: effect.source.talentName,
      providerId: effect.source.providerId
    })))
  });

  const legacyFrequency = String(legacyUse?.frequency ?? frequency).trim().toLowerCase();
  const legacy = Object.freeze({
    talent: legacyUse?.talent?.name ?? context.talent?.name ?? null,
    available: Boolean(legacyUse),
    diceBonus: Number(legacyUse?.diceBonus ?? 0),
    manual: Boolean(legacyUse?.manual),
    consumeOnCommit: Boolean(legacyUse && ["session", "conflict"].includes(legacyFrequency)),
    frequency: legacyFrequency
  });

  return Object.freeze({
    match:
      legacy.talent === core.talent &&
      legacy.available === core.available &&
      legacy.diceBonus === core.diceBonus &&
      legacy.manual === core.manual &&
      legacy.consumeOnCommit === core.consumeOnCommit &&
      legacy.frequency === core.frequency,
    sourceName: String(sourceName ?? ""),
    isSkill: Boolean(isSkill),
    contextKey: String(contextKey ?? ""),
    talentId: context.talentId,
    legacy,
    core
  });
}

function diagnosticsHtml() {
  const engine = registerTalentProvider();
  const baseApi = game.realmGuard?.core?.effects;
  const status = talentStatus(baseApi);
  const providers = engine.listProviders();
  return `<div class="realm-guard rg-effect-engine-scroll" style="box-sizing:border-box;padding:4px 10px 10px 2px;height:480px;max-height:55vh;min-height:0;overflow-y:scroll;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;">
    <header style="margin-bottom:14px;">
      <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M2</div>
      <h2 style="margin:3px 0 4px;">Unified Effect Engine</h2>
      <p style="margin:0;">Six real Effect Providers are running in shadow-compare mode. Existing Legacy Mixed gameplay remains authoritative.</p>
    </header>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;">
      <div><small>Mode</small><br><b>${esc(status.mode)}</b></div>
      <div><small>Live application</small><br><b>${status.liveApplication ? "ON" : "OFF"}</b></div>
      <div><small>Providers</small><br><b>${esc(status.providerCount)}</b></div>
    </div>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Shadow Migration Scope</h3>
      <p style="margin:0 0 6px;"><b>Conditions + Traits + Wises + Tokens of Power + Talents + Conflict Weapon/Tool action modifiers.</b></p>
      <p style="margin:0;">Talents translate current Legacy Mixed dice bonuses to <code>DICE_MODIFIER</code>, manual effects to <code>MANUAL</code>, and session/conflict consumption to shadow <code>STATE_CHANGE</code>. CORE does not commit Talent state in M2.</p>
      <p style="margin:6px 0 0;"><b>M2 compliance correction:</b> the qa.6 live Wise post-roll override has been removed. Profile-specific Wise corrections are deferred to the explicit profile phase. The existing Legacy Mixed Wise behavior remains the compatibility target.</p>
      <p style="margin:6px 0 0;">Conflict Tools remain shadow-only. Armor/damage absorption is not invented here because it is not part of the current live action-modifier path.</p>
      <p style="margin:6px 0 0;"><b>Compatibility note:</b> current Legacy Mixed “no valid Conflict Weapon/Tool = -1D” remains a profile-specific legacy effect, not a universal CORE rule.</p>
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Registered Providers</h3>
      ${providers.map(provider => `<div><b>${esc(provider.label)}</b> <small>${esc(provider.id)} · priority ${esc(provider.priority)}</small></div>`).join("")}
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">QA Shadow Compare</h3>
      <p style="margin:0 0 6px;">Talent:</p>
      <code>game.realmGuard.core.effects.compareTalentEffects(actor, talentId, "Fighter", { isSkill: true })</code>
      <p style="margin:8px 0 6px;">Wise compatibility:</p>
      <code>game.realmGuard.core.effects.compareWiseEffects(actor, wiseId, { faces: [1,2,4,6] })</code>
      <p style="margin:8px 0 6px;">Token of Power:</p>
      <code>game.realmGuard.core.effects.compareTokenPowerEffects(actor, tokenId, "Pathfinder", { isSkill: true })</code>
      <p style="margin:8px 0 6px;">Conflict Tool:</p>
      <code>game.realmGuard.core.effects.compareConflictToolEffects("Shield", "defend")</code>
      <p style="margin:6px 0 0;">Expected: <b>match: true</b>. Shadow helpers are read-only and do not roll dice or change Actor/Item data.</p>
    </section>
    <div style="padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
      <b>No Effect Engine gameplay takeover in qa.7.</b><br>
      <small>All six providers remain shadow-only. M2 changes rule ownership and diagnostics, not Legacy Mixed tabletop behavior.</small>
    </div>
  </div>`;
}

export async function openTalentEffectDiagnostics() {
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

function exposeTalentApi() {
  registerTalentProvider();
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  const base = game.realmGuard.core.effects ?? {};
  game.realmGuard.core.effects = Object.freeze({
    ...base,
    getStatus: () => talentStatus(base),
    compareTalentEffects,
    buildTalentEffectContext
  });
}

export function installTalentEffectShadow() {
  registerGmDockTool({
    id: "effect-engine",
    icon: "fa-solid fa-sliders",
    tooltip: "MG-Family CORE · M2 Effect Engine",
    order: 10,
    onClick: openTalentEffectDiagnostics
  });

  Hooks.once("ready", () => {
    registerTalentProvider();
    exposeTalentApi();
    console.log("realm-guard | CORE M2 Talent Effect Provider ready", game.realmGuard.core.effects.getStatus());
  });
}
