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
import {
  TRAIT_SELECTION_EFFECT_PROVIDER,
  TRAIT_SELECTION_PROVIDER_ID,
  buildTraitEffectContext
} from "./providers/trait-effects.mjs";
import {
  WISE_SELECTION_EFFECT_PROVIDER,
  WISE_SELECTION_PROVIDER_ID,
  buildWiseEffectContext
} from "./providers/wise-effects.mjs";
import {
  CONFLICT_TOOL_EFFECT_PROVIDER,
  CONFLICT_TOOL_PROVIDER_ID,
  buildConflictToolEffectContext
} from "./providers/conflict-tool-effects.mjs";
import { legacyConflictToolReference } from "./legacy/conflict-tool-reference.mjs";

const engine = new EffectEngine();

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function registerShadowProviders() {
  const registered = new Set(engine.listProviders().map(provider => provider.id));
  if (!registered.has(CONDITION_ROLL_PROVIDER_ID)) engine.registerProvider(CONDITION_ROLL_EFFECT_PROVIDER);
  if (!registered.has(TRAIT_SELECTION_PROVIDER_ID)) engine.registerProvider(TRAIT_SELECTION_EFFECT_PROVIDER);
  if (!registered.has(WISE_SELECTION_PROVIDER_ID)) engine.registerProvider(WISE_SELECTION_EFFECT_PROVIDER);
  if (!registered.has(CONFLICT_TOOL_PROVIDER_ID)) engine.registerProvider(CONFLICT_TOOL_EFFECT_PROVIDER);
}

function sumChannel(effects, type, channel) {
  return effects
    .filter(effect => effect.type === type && effect.metadata?.channel === channel)
    .reduce((total, effect) => total + Number(effect.value ?? 0), 0);
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
    shadowScope: "CONDITION_DICE_TRAIT_WISE_AND_CONFLICT_TOOL_EFFECTS",
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

export function compareTraitEffects(actor, traitId, traitMode = "help", {
  versus = false,
  baseSuccesses = 0,
  target = 0,
  rollName = "QA Trait Test",
  isSkill = true
} = {}) {
  if (!actor) throw new Error("compareTraitEffects requires an Actor.");
  if (typeof actor._rollAssist !== "function" || typeof actor._traitSuccessBonus !== "function") {
    throw new Error("compareTraitEffects requires a Realm Guard Actor with legacy Trait helpers.");
  }

  registerShadowProviders();
  const legacyAssist = actor._rollAssist({ traitId, traitMode, versus: Boolean(versus) });
  const legacySuccessBonus = actor._traitSuccessBonus(
    legacyAssist,
    Number(baseSuccesses ?? 0),
    Number(target ?? 0),
    { versus: Boolean(versus) }
  );
  const context = buildTraitEffectContext(actor, traitId, traitMode, {
    versus,
    baseSuccesses,
    target,
    rollName,
    isSkill
  });
  const effects = engine.collect(context, { providerIds: [TRAIT_SELECTION_PROVIDER_ID] });
  const blocked = effects.some(effect => effect.type === EFFECT_TYPES.CAPABILITY_BLOCK);
  const resolvedMode = effects[0]?.metadata?.resolvedMode ?? context.traitMode;
  const selfDice = sumChannel(effects, EFFECT_TYPES.DICE_MODIFIER, "self");
  const opponentDice = sumChannel(effects, EFFECT_TYPES.DICE_MODIFIER, "opponent");
  const successBonus = sumChannel(effects, EFFECT_TYPES.SUCCESS_MODIFIER, "self");
  const checks = sumChannel(effects, EFFECT_TYPES.CURRENCY, "checks");

  const legacy = Object.freeze({
    trait: legacyAssist.trait?.name ?? null,
    mode: legacyAssist.traitMode,
    selfDice: Number(legacyAssist.traitDice ?? 0),
    opponentDice: Number(legacyAssist.opponentDice ?? 0),
    successBonus: Number(legacySuccessBonus ?? 0),
    checks: Number(legacyAssist.checks ?? 0),
    blocked: Boolean(legacyAssist.blockedTraitHelp),
    blockedReason: legacyAssist.blockedTraitReason || ""
  });
  const core = Object.freeze({
    trait: context.trait?.name ?? null,
    mode: resolvedMode,
    selfDice,
    opponentDice,
    successBonus,
    checks,
    blocked,
    effects: Object.freeze(effects.map(effect => Object.freeze({
      id: effect.id,
      type: effect.type,
      value: effect.value,
      channel: effect.metadata?.channel ?? null,
      trait: effect.source.traitName,
      providerId: effect.source.providerId
    })))
  });

  return Object.freeze({
    match:
      legacy.mode === core.mode &&
      legacy.selfDice === core.selfDice &&
      legacy.opponentDice === core.opponentDice &&
      legacy.successBonus === core.successBonus &&
      legacy.checks === core.checks &&
      legacy.blocked === core.blocked,
    traitId: context.traitId,
    requestedMode: context.traitMode,
    versus: Boolean(versus),
    baseSuccesses: Number(baseSuccesses ?? 0),
    target: Number(target ?? 0),
    legacy,
    core
  });
}

export function compareWiseEffects(actor, wiseId, {
  faces = [1, 2, 4, 6],
  rollName = "QA Wise Test",
  isSkill = true
} = {}) {
  if (!actor) throw new Error("compareWiseEffects requires an Actor.");
  if (typeof actor._rollAssist !== "function") {
    throw new Error("compareWiseEffects requires a Realm Guard Actor with legacy roll-assist helpers.");
  }

  registerShadowProviders();
  const legacyAssist = actor._rollAssist({ wiseId });
  const requestedWise = legacyAssist.requestedWise?.type === "wise" ? legacyAssist.requestedWise : null;
  const legacyBlocked = Boolean(legacyAssist.blockedWise);
  const legacyCanReroll = Boolean(legacyAssist.wise?.type === "wise");
  const normalizedFaces = Object.freeze(Array.from(faces ?? []).map(value => Number(value)));
  const legacyIndexes = Object.freeze(legacyCanReroll
    ? normalizedFaces.map((value, index) => value < 4 ? index : -1).filter(index => index >= 0)
    : []);

  const context = buildWiseEffectContext(actor, wiseId, { rollName, isSkill });
  const effects = engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
  const blockEffect = effects.find(effect => effect.type === EFFECT_TYPES.CAPABILITY_BLOCK) ?? null;
  const rerollEffect = effects.find(effect => effect.type === EFFECT_TYPES.REROLL) ?? null;
  const threshold = Number(rerollEffect?.value?.successThreshold ?? 4);
  const coreIndexes = Object.freeze(rerollEffect
    ? normalizedFaces.map((value, index) => value < threshold ? index : -1).filter(index => index >= 0)
    : []);
  const coreBlocked = Boolean(blockEffect);
  const coreCanReroll = Boolean(rerollEffect);

  const legacy = Object.freeze({
    wise: requestedWise?.name ?? null,
    blocked: legacyBlocked,
    canReroll: legacyCanReroll,
    rerollIndexes: legacyIndexes,
    rerollCount: legacyIndexes.length
  });
  const core = Object.freeze({
    wise: context.wise?.name ?? null,
    blocked: coreBlocked,
    canReroll: coreCanReroll,
    rerollIndexes: coreIndexes,
    rerollCount: coreIndexes.length,
    effects: Object.freeze(effects.map(effect => Object.freeze({
      id: effect.id,
      type: effect.type,
      value: effect.value,
      channel: effect.metadata?.channel ?? null,
      wise: effect.source.wiseName,
      providerId: effect.source.providerId
    })))
  });

  return Object.freeze({
    match:
      legacy.wise === core.wise &&
      legacy.blocked === core.blocked &&
      legacy.canReroll === core.canReroll &&
      legacy.rerollIndexes.length === core.rerollIndexes.length &&
      legacy.rerollIndexes.every((value, index) => value === core.rerollIndexes[index]),
    faces: normalizedFaces,
    wiseId: context.wiseId,
    legacy,
    core
  });
}

export function compareConflictToolEffects(selection, action, {
  swordAction = "",
  requirementMet = true
} = {}) {
  registerShadowProviders();
  const legacy = legacyConflictToolReference(selection, action, { swordAction, requirementMet });
  const context = buildConflictToolEffectContext(selection, action, { swordAction, requirementMet });
  const effects = engine.collect(context, { providerIds: [CONFLICT_TOOL_PROVIDER_ID] });
  const dice = effects
    .filter(effect => effect.type === EFFECT_TYPES.DICE_MODIFIER)
    .reduce((total, effect) => total + Number(effect.value ?? 0), 0);
  const conditionalSuccess = effects
    .filter(effect => effect.type === EFFECT_TYPES.SUCCESS_MODIFIER && effect.metadata?.channel === "conditionalSuccess")
    .reduce((total, effect) => total + Math.max(0, Number(effect.value ?? 0)), 0);
  const successPenalty = effects
    .filter(effect => effect.type === EFFECT_TYPES.SUCCESS_MODIFIER && effect.metadata?.channel === "successPenalty")
    .reduce((total, effect) => total + Math.abs(Math.min(0, Number(effect.value ?? 0))), 0);
  const blocked = effects.some(effect => effect.type === EFFECT_TYPES.CAPABILITY_BLOCK);
  const core = Object.freeze({
    dice,
    conditionalSuccess,
    successPenalty,
    blocked,
    effects: Object.freeze(effects.map(effect => Object.freeze({
      id: effect.id,
      type: effect.type,
      value: effect.value,
      channel: effect.metadata?.channel ?? null,
      tool: effect.source.toolName,
      kind: effect.source.toolKind,
      providerId: effect.source.providerId,
      legacyCompatibility: Boolean(effect.metadata?.legacyCompatibility)
    })))
  });
  const legacyView = Object.freeze({
    dice: Number(legacy.dice ?? 0),
    conditionalSuccess: Number(legacy.conditionalSuccess ?? 0),
    successPenalty: Number(legacy.successPenalty ?? 0),
    requirement: legacy.requirement ?? "",
    requirementMet: Boolean(legacy.requirementMet),
    toolName: legacy.toolName ?? "",
    notes: Object.freeze([...(legacy.notes ?? [])])
  });
  return Object.freeze({
    match:
      legacyView.dice === core.dice &&
      legacyView.conditionalSuccess === core.conditionalSuccess &&
      legacyView.successPenalty === core.successPenalty &&
      Boolean(legacyView.requirement && !legacyView.requirementMet) === core.blocked,
    action: String(action ?? ""),
    swordAction: String(swordAction ?? ""),
    legacy: legacyView,
    core
  });
}

function diagnosticsHtml() {
  registerShadowProviders();
  const status = getEffectEngineStatus();
  const providers = engine.listProviders();
  return `<div class="realm-guard rg-effect-engine-scroll" style="box-sizing:border-box;padding:4px 10px 10px 2px;height:480px;max-height:55vh;min-height:0;overflow-y:scroll;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;">
    <header style="margin-bottom:14px;">
      <div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M2</div>
      <h2 style="margin:3px 0 4px;">Unified Effect Engine</h2>
      <p style="margin:0;">Four real Effect Providers are now running in shadow-compare mode. Existing live rolls and Conflict resolution still use the v1.3.0 GOLD-compatible logic.</p>
    </header>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;">
      <div><small>Mode</small><br><b>${esc(status.mode)}</b></div>
      <div><small>Live application</small><br><b>${status.liveApplication ? "ON" : "OFF"}</b></div>
      <div><small>Providers</small><br><b>${esc(status.providerCount)}</b></div>
    </div>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Shadow Migration Scope</h3>
      <p style="margin:0 0 6px;"><b>Condition dice + selected Traits + selected Wise rerolls + Conflict Weapon/Tool action modifiers.</b></p>
      <p style="margin:0;">Wises now translate selected beneficial reroll access into a CORE <code>REROLL</code> Effect. Angry blocking becomes <code>CAPABILITY_BLOCK</code>. The provider describes which failed dice are eligible; it does not roll or replace dice in qa.5.</p>
      <p style="margin:6px 0 0;">Conflict Tools remain shadow-only. Armor/damage absorption is not invented here because it is not part of the current live action-modifier path.</p>
      <p style="margin:6px 0 0;"><b>Compatibility note:</b> current Legacy Mixed “no valid Conflict Weapon/Tool = -1D” remains a profile-specific legacy effect, not a universal CORE rule.</p>
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">Registered Providers</h3>
      ${providers.map(provider => `<div><b>${esc(provider.label)}</b> <small>${esc(provider.id)} · priority ${esc(provider.priority)}</small></div>`).join("")}
    </section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;">
      <h3 style="margin:0 0 8px;">QA Shadow Compare</h3>
      <p style="margin:0 0 6px;">Condition:</p>
      <code>game.realmGuard.core.effects.compareConditionDice(actor, "Pathfinder", { isSkill: true })</code>
      <p style="margin:8px 0 6px;">Trait:</p>
      <code>game.realmGuard.core.effects.compareTraitEffects(actor, traitId, "help", { baseSuccesses: 3, target: 3 })</code>
      <p style="margin:8px 0 6px;">Wise:</p>
      <code>game.realmGuard.core.effects.compareWiseEffects(actor, wiseId, { faces: [1,2,4,6] })</code>
      <p style="margin:8px 0 6px;">Conflict Tool:</p>
      <code>game.realmGuard.core.effects.compareConflictToolEffects("Shield", "defend")</code>
      <p style="margin:6px 0 0;">Expected: <b>match: true</b>. Helpers are read-only and do not roll dice or change Actor data.</p>
    </section>
    <div style="padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
      <b>No gameplay takeover in qa.5.</b><br>
      <small>All four providers are deliberately shadow-only. Any live pool, reroll, success, resource, inventory or Conflict outcome change from v1.3.0 is a blocker.</small>
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
    compareTraitEffects,
    compareWiseEffects,
    compareConflictToolEffects,
    buildConditionEffectContext,
    buildTraitEffectContext,
    buildWiseEffectContext,
    buildConflictToolEffectContext,
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
