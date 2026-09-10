import { hasActiveCondition } from "./conditions.mjs";
import { diceFacesHtml } from "./dice-ui.mjs";
import { registerGmDockTool } from "./gm-dock.mjs";
import { EFFECT_TYPES } from "./core/effects.mjs";
import { WISE_SELECTION_PROVIDER_ID, buildWiseEffectContext } from "./providers/wise-effects.mjs";

const NS = "realm-guard";
const CHANNEL = `system.${NS}`;
const WISE_MARK_FLAG = "wiseUsageMarks";
const WISE_MARK_KEYS = Object.freeze(["iamWisePass", "iamWiseFail", "deeperUnderstanding", "ofCourse"]);
const RESERVED_PERSONA = Symbol("realmGuardWiseReservedPersona");

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function blankMarks() {
  return { iamWisePass: false, iamWiseFail: false, deeperUnderstanding: false, ofCourse: false };
}

export function wiseUsageMarks(wise) {
  const raw = wise?.getFlag?.(NS, WISE_MARK_FLAG) ?? wise?.flags?.[NS]?.[WISE_MARK_FLAG] ?? {};
  return Object.freeze({ ...blankMarks(), ...Object.fromEntries(WISE_MARK_KEYS.map(key => [key, Boolean(raw?.[key])])) });
}

export function wiseCycleComplete(wiseOrMarks) {
  const marks = wiseOrMarks?.type === "wise" ? wiseUsageMarks(wiseOrMarks) : { ...blankMarks(), ...(wiseOrMarks ?? {}) };
  return WISE_MARK_KEYS.every(key => Boolean(marks[key]));
}

export async function markWiseUsage(wise, key, { notify = true } = {}) {
  if (!wise || wise.type !== "wise") return { ok: false, reason: "Wise Item required." };
  if (!WISE_MARK_KEYS.includes(key)) return { ok: false, reason: `Unknown Wise usage mark: ${key}` };
  const before = wiseUsageMarks(wise);
  if (before[key]) return { ok: true, changed: false, marks: before, complete: wiseCycleComplete(before) };
  const next = { ...before, [key]: true };
  await wise.setFlag(NS, WISE_MARK_FLAG, next);
  const complete = wiseCycleComplete(next);
  if (notify) {
    const label = {
      iamWisePass: "I Am Wise · Pass",
      iamWiseFail: "I Am Wise · Fail",
      deeperUnderstanding: "Deeper Understanding",
      ofCourse: "Of Course!"
    }[key] ?? key;
    ui.notifications.info(`Realm Guard: ${wise.name} marked ${label}.${complete ? " Wise cycle complete — choose its perk, then reset the four marks." : ""}`);
  }
  return { ok: true, changed: true, marks: Object.freeze(next), complete };
}

export async function resetWiseUsageMarks(wise) {
  if (!wise || wise.type !== "wise") return { ok: false, reason: "Wise Item required." };
  const next = blankMarks();
  await wise.setFlag(NS, WISE_MARK_FLAG, next);
  return { ok: true, marks: Object.freeze(next) };
}

function blankResult(baseFaces, extra = {}) {
  return {
    faces: [...baseFaces],
    rerollFaces: [],
    rerolledIndexes: [],
    wise: null,
    wiseName: "",
    effectMode: "none",
    resourceSpent: null,
    declined: false,
    blocked: false,
    ...extra
  };
}

function wiseCandidates(actor, preferredWise = null) {
  const all = Array.from(actor?.wises ?? []).filter(wise => wise?.type === "wise");
  if (!preferredWise || preferredWise.type !== "wise") return all;
  return [preferredWise, ...all.filter(wise => wise.id !== preferredWise.id)];
}

function availablePersonaForWise(actor) {
  const current = Math.max(0, Number(actor?.system?.resources?.persona?.value ?? 0));
  const reserved = Math.max(0, Number(actor?.[RESERVED_PERSONA] ?? 0));
  return Math.max(0, current - reserved);
}

function failedDieOptions(baseFaces, failedIndexes) {
  return failedIndexes.map(index => `<option value="${index}">Die ${index + 1} · rolled ${Number(baseFaces[index])}</option>`).join("");
}

async function chooseWiseAfterRoll(actor, baseFaces, failedIndexes, preferredWise = null) {
  if (hasActiveCondition(actor, "Angry")) return { blocked: true, reason: "Angry blocks beneficial Wise use" };
  const candidates = wiseCandidates(actor, preferredWise);
  if (!candidates.length || !failedIndexes.length) return null;

  const preferredId = preferredWise?.type === "wise" ? preferredWise.id : candidates[0].id;
  const options = candidates.map(wise => `<option value="${esc(wise.id)}" ${wise.id === preferredId ? "selected" : ""}>${esc(wise.name)}</option>`).join("");

  while (true) {
    const fate = Math.max(0, Number(actor.system?.resources?.fate?.value ?? 0));
    const persona = availablePersonaForWise(actor);
    const buttons = [];
    if (persona >= 1) {
      buttons.push({
        action: "of-course",
        label: `Of Course! · 1 Persona · Reroll ${failedIndexes.length}`,
        icon: "fa-solid fa-rotate",
        default: true,
        callback: (_event, button) => ({
          action: "of-course",
          wiseId: button.form?.elements?.wiseId?.value || preferredId,
          relevant: Boolean(button.form?.elements?.relevant?.checked)
        })
      });
    }
    if (fate >= 1) {
      buttons.push({
        action: "deeper-understanding",
        label: "Deeper Understanding · 1 Fate · Reroll 1",
        icon: "fa-solid fa-lightbulb",
        default: persona < 1,
        callback: (_event, button) => ({
          action: "deeper-understanding",
          wiseId: button.form?.elements?.wiseId?.value || preferredId,
          failedIndex: Number(button.form?.elements?.failedIndex?.value ?? failedIndexes[0]),
          relevant: Boolean(button.form?.elements?.relevant?.checked)
        })
      });
    }
    buttons.push({ action: "keep", label: "Keep Result", icon: "fa-solid fa-xmark", callback: () => null });

    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Wise Decision", resizable: true },
      content: `<div class="realm-guard rg-wise-reroll-decision">
        <h3>Use a Wise?</h3>
        <p>The base roll has <b>${failedIndexes.length}</b> failed ${failedIndexes.length === 1 ? "die" : "dice"}.</p>
        <div style="margin:8px 0;">${diceFacesHtml(baseFaces)}</div>
        <label>Wise <select name="wiseId">${options}</select></label>
        <label style="display:flex;gap:8px;align-items:flex-start;margin:10px 0;"><input type="checkbox" name="relevant"><span><b>This Wise is relevant to the fiction.</b><br><small>Its subject must actually be in play. Selecting a Wise does not make it applicable automatically; the GM remains final arbiter.</small></span></label>
        <label>Failed die for Deeper Understanding <select name="failedIndex">${failedDieOptions(baseFaces, failedIndexes)}</select></label>
        <div style="margin:10px 0;padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);">
          <b>Deeper Understanding</b> · spend 1 Fate to reroll one failed die.<br>
          <b>Of Course!</b> · spend 1 Persona to reroll all failed dice.<br>
          <small>No Wise self-reroll is free and there is no once-per-session Wise lock.</small>
        </div>
        <p><small>Available now: Fate ${fate} · Persona ${persona}${Number(actor?.[RESERVED_PERSONA] ?? 0) ? ` (${Number(actor[RESERVED_PERSONA])} Persona already reserved for this roll)` : ""}.</small></p>
      </div>`,
      modal: false,
      rejectClose: false,
      buttons
    });

    if (!result) return null;
    if (!result.relevant) {
      ui.notifications.warn("Realm Guard: Confirm that the Wise is actually relevant to the current fiction before using it.");
      continue;
    }
    const wise = candidates.find(candidate => candidate.id === result.wiseId) ?? null;
    if (!wise) return null;
    return { ...result, wise };
  }
}

function reservedPersonaFromRollOptions(args = []) {
  const options = args.length ? args[args.length - 1] : null;
  if (!options || typeof options !== "object" || Array.isArray(options)) return 0;
  const persona = Math.max(0, Math.min(3, Math.trunc(Number(options.persona ?? 0) || 0)));
  const tapNature = options.tapNature ? 1 : 0;
  const doubleTapNature = options.doubleTapNature ? 1 : 0;
  return persona + tapNature + doubleTapNature;
}

function installPersonaReservation(ActorClass) {
  for (const methodName of ["rollRole", "rollAbility", "rollNatureVersus", "rollBeginnerLuck", "rollAutomaticVersus"]) {
    const original = ActorClass?.prototype?.[methodName];
    if (typeof original !== "function" || original._rgWiseReservationWrapper) continue;
    const wrapped = async function(...args) {
      const previous = this[RESERVED_PERSONA] ?? 0;
      this[RESERVED_PERSONA] = reservedPersonaFromRollOptions(args);
      try {
        return await original.apply(this, args);
      } finally {
        this[RESERVED_PERSONA] = previous;
      }
    };
    Object.defineProperty(wrapped, "_rgWiseReservationWrapper", { value: true });
    ActorClass.prototype[methodName] = wrapped;
  }
}

function activeOwnerForActor(actor) {
  const users = Array.from(game.users ?? []).filter(user => Boolean(user?.active));
  const players = users
    .filter(user => !user.isGM && actor?.testUserPermission?.(user, "OWNER"))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const gms = users.filter(user => user.isGM).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return players[0] ?? gms[0] ?? null;
}

async function markHelperWise(entry, mark) {
  const actor = game.actors.get(entry?.actorId);
  const wise = actor?.items?.get(entry?.sourceId);
  if (!actor || wise?.type !== "wise") return false;
  if (wise.isOwner) {
    await markWiseUsage(wise, mark);
    return true;
  }
  const owner = activeOwnerForActor(actor);
  if (!owner) return false;
  game.socket.emit(CHANNEL, {
    type: "wise-usage-mark",
    targetUserId: owner.id,
    actorId: actor.id,
    wiseId: wise.id,
    mark,
    senderId: game.user.id
  });
  return true;
}

function installIAmWiseMarks(ActorSheetClass) {
  const original = ActorSheetClass?._commitSynergy;
  if (typeof original !== "function" || original._rgWiseMarksWrapper) return;
  const wrapped = async function(help, result, reason = "Help") {
    const output = await original.call(this, help, result, reason);
    if (!Array.isArray(help) || !result || result.tied) return output;
    const passed = result.learningResult ?? result.tieResolution?.passed ?? result.passed;
    if (passed === null || passed === undefined) return output;
    const mark = passed ? "iamWisePass" : "iamWiseFail";
    for (const entry of help.filter(row => row?.sourceKind === "Wise")) {
      try { await markHelperWise(entry, mark); }
      catch (error) { console.warn(`${NS} | could not mark I Am Wise usage`, error); }
    }
    return output;
  };
  Object.defineProperty(wrapped, "_rgWiseMarksWrapper", { value: true });
  ActorSheetClass._commitSynergy = wrapped;
}

function installWiseSocket() {
  game.socket.on(CHANNEL, async message => {
    if (message?.type !== "wise-usage-mark" || message.targetUserId !== game.user.id) return;
    const actor = game.actors.get(message.actorId);
    const wise = actor?.items?.get(message.wiseId);
    if (!wise?.isOwner || wise.type !== "wise") return;
    try { await markWiseUsage(wise, message.mark); }
    catch (error) { console.warn(`${NS} | remote Wise usage mark failed`, error); }
  });
}

export function compareWiseRuleEffects(actor, wiseId, {
  faces = [1, 2, 4, 6],
  effectMode = "of-course",
  relevanceConfirmed = true,
  rollName = "QA Wise Test",
  isSkill = true,
  reservedPersona = 0
} = {}) {
  if (!actor) throw new Error("compareWiseRuleEffects requires an Actor.");
  const api = game.realmGuard?.core?.effects;
  if (!api?.engine) throw new Error("CORE Effect Engine is not ready.");
  const context = buildWiseEffectContext(actor, wiseId, { rollName, isSkill, effectMode, relevanceConfirmed, reservedPersona });
  const effects = api.engine.collect(context, { providerIds: [WISE_SELECTION_PROVIDER_ID] });
  const block = effects.find(effect => effect.type === EFFECT_TYPES.CAPABILITY_BLOCK) ?? null;
  const cost = effects.find(effect => effect.type === EFFECT_TYPES.RESOURCE_COST) ?? null;
  const reroll = effects.find(effect => effect.type === EFFECT_TYPES.REROLL) ?? null;
  const normalizedFaces = Object.freeze(Array.from(faces ?? []).map(value => Number(value)));
  const failedIndexes = Object.freeze(normalizedFaces.map((value, index) => value < 4 ? index : -1).filter(index => index >= 0));
  const angry = hasActiveCondition(actor, "Angry");
  const mode = String(effectMode ?? "of-course").trim().toLowerCase();
  const resource = mode === "deeper-understanding" ? "fate" : "persona";
  const currentResource = Math.max(0, Number(actor.system?.resources?.[resource]?.value ?? 0));
  const availableResource = resource === "persona" ? Math.max(0, currentResource - Math.max(0, Number(reservedPersona ?? 0))) : currentResource;
  const expectedBlocked = !relevanceConfirmed || angry || availableResource < 1;
  const expectedSelector = mode === "deeper-understanding" ? "one-failed-die" : "all-failed-dice";
  const expectedMaxDice = mode === "deeper-understanding" ? 1 : "all";
  const core = Object.freeze({
    wise: context.wise?.name ?? null,
    blocked: Boolean(block),
    blockedReason: String(block?.value ?? ""),
    resource: cost?.value?.resource ?? null,
    resourceAmount: Number(cost?.value?.amount ?? 0),
    selector: reroll?.value?.selector ?? null,
    maxDice: reroll?.value?.maxDice ?? null,
    eligibleIndexes: failedIndexes,
    effects: Object.freeze(effects.map(effect => Object.freeze({ id: effect.id, type: effect.type, value: effect.value, providerId: effect.source.providerId })))
  });
  const reference = Object.freeze({
    effectMode: mode,
    relevanceConfirmed: Boolean(relevanceConfirmed),
    blocked: expectedBlocked,
    resource: expectedBlocked ? null : resource,
    resourceAmount: expectedBlocked ? 0 : 1,
    selector: expectedBlocked ? null : expectedSelector,
    maxDice: expectedBlocked ? null : expectedMaxDice,
    eligibleIndexes: failedIndexes
  });
  return Object.freeze({
    match:
      reference.blocked === core.blocked &&
      reference.resource === core.resource &&
      reference.resourceAmount === core.resourceAmount &&
      reference.selector === core.selector &&
      reference.maxDice === core.maxDice,
    faces: normalizedFaces,
    wiseId: context.wiseId,
    reference,
    core
  });
}

function qa7DiagnosticsHtml() {
  const api = game.realmGuard?.core?.effects;
  const status = api?.getStatus?.() ?? {};
  const providers = api?.engine?.listProviders?.() ?? [];
  return `<div class="realm-guard rg-effect-engine-scroll" style="box-sizing:border-box;padding:4px 10px 10px 2px;height:480px;max-height:55vh;min-height:0;overflow-y:scroll;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;">
    <header style="margin-bottom:14px;"><div style="font-size:.75em;text-transform:uppercase;letter-spacing:.08em;opacity:.75;">MG-FAMILY CORE · M2 · QA.7</div><h2 style="margin:3px 0 4px;">Unified Effect Engine</h2><p style="margin:0;">Five Effect Providers remain in shadow-compare mode. qa.7 corrects the live Legacy Mixed Wise self-use workflow without turning CORE live application on.</p></header>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;"><div><small>Mode</small><br><b>${esc(status.mode)}</b></div><div><small>Live application</small><br><b>${status.liveApplication ? "ON" : "OFF"}</b></div><div><small>Providers</small><br><b>${esc(status.providerCount)}</b></div></div>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;"><h3 style="margin:0 0 8px;">Wise correction</h3><p><b>Relevance is fictional/table-approved, not Skill-name mapping.</b> The Wise subject must be in play.</p><p><b>Deeper Understanding:</b> 1 Fate → reroll one failed die.</p><p><b>Of Course!:</b> 1 Persona → reroll all failed dice.</p><p><b>I Am Wise:</b> remains the separate +1D ally-aid path. Pass/Fail usage marks are recorded on the Wise.</p><p style="margin-bottom:0;"><b>No once-per-session Wise lock.</b> Four usage marks form the Wise reward cycle.</p></section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;"><h3 style="margin:0 0 8px;">Registered Providers</h3>${providers.map(provider => `<div><b>${esc(provider.label)}</b> <small>${esc(provider.id)} · priority ${esc(provider.priority)}</small></div>`).join("")}</section>
    <section style="margin:0 0 14px;padding:10px;border:1px solid var(--color-border-light-tertiary);border-radius:6px;"><h3 style="margin:0 0 8px;">QA Wise Compare</h3><code>game.realmGuard.core.effects.compareWiseRuleEffects(actor, wiseId, { effectMode: "deeper-understanding", relevanceConfirmed: true })</code><br><br><code>game.realmGuard.core.effects.compareWiseRuleEffects(actor, wiseId, { effectMode: "of-course", relevanceConfirmed: true })</code><p style="margin-bottom:0;">Expected: <b>match: true</b>. CORE remains read-only.</p></section>
    <div style="padding:8px 10px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);"><b>CORE live application remains OFF.</b><br><small>The Wise dialog/resource spend is a Legacy Mixed rule correction. Condition, Trait, Token of Power and Conflict Tool providers remain shadow-only.</small></div>
  </div>`;
}

async function openQa7EffectDiagnostics() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Effect Engine diagnostics are GM-only.");
  return foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard / Torchbearer · CORE M2 Effect Engine", resizable: true },
    position: { width: 720, height: 620 },
    content: qa7DiagnosticsHtml(),
    modal: false,
    rejectClose: false,
    buttons: [{ action: "close", label: "Close", default: true, callback: () => "close" }]
  });
}

function extendCoreApi() {
  const prior = game.realmGuard?.core?.effects;
  if (!prior) return;
  const previousGetStatus = prior.getStatus;
  const getStatus = () => Object.freeze({
    ...previousGetStatus(),
    wiseRuleModel: "MG2E_UNRATED_SELF_EFFECTS_CORRECTED_QA7",
    wiseRelevance: "TABLE_CONFIRMED",
    wiseOncePerSession: false
  });
  game.realmGuard.core.effects = Object.freeze({
    ...prior,
    getStatus,
    compareWiseEffects: compareWiseRuleEffects,
    compareWiseRuleEffects,
    wiseUsageMarks,
    wiseCycleComplete,
    markWiseUsage,
    resetWiseUsageMarks
  });
}

export function installWisePostRollPrompt(ActorClass, ActorSheetClass = null) {
  if (!ActorClass?.prototype || ActorClass.prototype._rgWisePostRollInstalled) return;

  Object.defineProperty(ActorClass.prototype, "_rgWisePostRollInstalled", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });

  installPersonaReservation(ActorClass);
  installIAmWiseMarks(ActorSheetClass);

  ActorClass.prototype._applyWiseReroll = async function(baseFaces, preferredWise = null) {
    const initial = Array.from(baseFaces ?? []).map(value => Number(value));
    const failedIndexes = initial.map((value, index) => value < 4 ? index : -1).filter(index => index >= 0);
    if (!failedIndexes.length) return blankResult(initial);
    if (hasActiveCondition(this, "Angry")) return blankResult(initial, { blocked: true, blockedReason: "Angry blocks beneficial Wise use" });

    const decision = await chooseWiseAfterRoll(this, initial, failedIndexes, preferredWise);
    if (!decision) return blankResult(initial, { declined: true });
    if (decision.blocked) return blankResult(initial, { blocked: true, blockedReason: decision.reason });

    const wise = decision.wise;
    const deeper = decision.action === "deeper-understanding";
    const resource = deeper ? "fate" : "persona";
    const mark = deeper ? "deeperUnderstanding" : "ofCourse";
    const indexes = deeper ? [failedIndexes.includes(decision.failedIndex) ? decision.failedIndex : failedIndexes[0]] : [...failedIndexes];

    const spend = await this.spendTrackedResource(resource, 1, { reason: `Wise · ${wise.name} · ${deeper ? "Deeper Understanding" : "Of Course!"}` });
    if (!spend?.ok) {
      ui.notifications.warn(`Realm Guard: ${spend?.reason ?? `Could not spend 1 ${resource}.`}`);
      return blankResult(initial, { declined: true });
    }

    const reroll = await new Roll(`${indexes.length}d6`).evaluate();
    const rerollFaces = reroll.dice.flatMap(die => die.results.map(result => result.result));
    const faces = [...initial];
    indexes.forEach((index, n) => { faces[index] = rerollFaces[n]; });
    try { await markWiseUsage(wise, mark); }
    catch (error) { console.warn(`${NS} | Wise usage mark failed`, error); }

    return {
      faces,
      rerollFaces,
      rerolledIndexes: indexes,
      wise,
      wiseName: wise.name,
      effectMode: decision.action,
      resourceSpent: resource,
      declined: false,
      blocked: false
    };
  };

  registerGmDockTool({
    id: "effect-engine",
    icon: "fa-solid fa-sliders",
    tooltip: "MG-Family CORE · M2 Effect Engine",
    order: 10,
    onClick: openQa7EffectDiagnostics
  });

  Hooks.once("ready", () => {
    installWiseSocket();
    extendCoreApi();
  });
}
