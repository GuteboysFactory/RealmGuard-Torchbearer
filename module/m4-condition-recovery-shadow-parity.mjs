import { ConditionService, CapabilityBlockService, RecoveryService } from "./core/m4-services.mjs";
import { validateRecoveryAttempt, recoveryMethods } from "./conditions.mjs";
import { turnManagerEnabled, currentTurnPhase, recoveryAttempted } from "./turns.mjs";

const conditions = new ConditionService();
const capabilities = new CapabilityBlockService();
const recovery = new RecoveryService(conditions);
const history = [];
const recoveryInFlight = new WeakMap();
let conditionRollWrapped = false;
let capabilityWrapped = false;
let recoveryRollWrapped = false;
let recoveryActionWrapped = false;
let installed = false;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const entry of Object.values(value)) freeze(entry);
  return Object.freeze(value);
}

function push(entry) {
  history.push(freeze({ id: `m4-cr-${Date.now()}-${history.length + 1}`, ...entry, liveApplication: false, authority: "LEGACY_MIXED" }));
  while (history.length > 150) history.shift();
  return history.at(-1);
}

function conditionView(condition) {
  return freeze({
    id: condition?.id ?? null,
    name: String(condition?.name ?? ""),
    active: Boolean(condition?.system?.active),
    rollModifier: Number(condition?.system?.rollModifier ?? 0),
    appliesTo: String(condition?.system?.appliesTo ?? "all")
  });
}

function methodView(method) {
  if (!method) return null;
  return freeze({
    kind: String(method.kind ?? ""),
    key: method.key ? String(method.key) : null,
    name: String(method.name ?? method.item?.name ?? ""),
    obstacle: Math.max(0, Number(method.obstacle ?? 0)),
    dice: Math.max(0, Number(method.dice ?? 0)),
    sourceId: method.sourceId ?? method.item?.id ?? (method.key ? `ability:${method.key}` : null)
  });
}

function sortedIds(entries = []) {
  return entries.map(entry => String(entry?.id ?? "")).filter(Boolean).sort();
}

export function compareConditionRollObservation(actual = {}, expected = {}) {
  const actualConditions = Array.from(actual.active ?? actual.conditions ?? []).map(conditionView);
  const expectedConditions = Array.from(expected.conditions ?? []).map(entry => freeze({
    id: entry.id ?? null,
    name: String(entry.name ?? ""),
    active: Boolean(entry.active),
    rollModifier: Number(entry.rollModifier ?? 0),
    appliesTo: String(entry.appliesTo ?? "all")
  }));
  const fields = freeze({
    conditionIds: JSON.stringify(sortedIds(actualConditions)) === JSON.stringify(sortedIds(expectedConditions)),
    diceModifier: Number(actual.dice ?? actual.diceModifier ?? 0) === Number(expected.diceModifier ?? 0)
  });
  return freeze({ match: Object.values(fields).every(Boolean), fields, actual: { conditions: actualConditions, diceModifier: Number(actual.dice ?? actual.diceModifier ?? 0) }, expected: { conditions: expectedConditions, diceModifier: Number(expected.diceModifier ?? 0) } });
}

function legacyReasonCode(validation) {
  if (validation?.ok) return "OK";
  const reason = String(validation?.reason ?? "").toLowerCase();
  if (reason.includes("not active")) return "INACTIVE";
  if (reason.includes("recover ") && reason.includes(" before ")) return "RECOVERY_ORDER";
  if (reason.includes("already had a recovery attempt")) return "ALREADY_ATTEMPTED";
  if (reason.includes("costs 2 checks")) return "GM_CHECKS";
  return "INVALID_TARGET";
}

export function compareRecoveryPreparation({ legacyValidation, coreValidation, legacyMethods = [], coreMethods = [] } = {}) {
  const actualMethods = legacyMethods.map(methodView).filter(Boolean);
  const expectedMethods = coreMethods.map(methodView).filter(Boolean);
  const methodKey = method => `${method.kind}|${String(method.name).toLowerCase()}|${method.obstacle}|${method.dice}`;
  const fields = freeze({
    validationOk: Boolean(legacyValidation?.ok) === Boolean(coreValidation?.ok),
    validationReason: legacyReasonCode(legacyValidation) === String(coreValidation?.reasonCode ?? ""),
    methods: JSON.stringify(actualMethods.map(methodKey)) === JSON.stringify(expectedMethods.map(methodKey))
  });
  return freeze({
    match: Object.values(fields).every(Boolean),
    fields,
    actual: { validation: { ok: Boolean(legacyValidation?.ok), reasonCode: legacyReasonCode(legacyValidation) }, methods: actualMethods },
    expected: { validation: coreValidation, methods: expectedMethods }
  });
}

export function compareRecoveryResolution({ beforeActive = true, afterActive = true, result = null, ignoreConditions = false, selectedMethod = null, expectedMethods = [], checksBefore = null, checksAfter = null, economy = null, attemptRecorded = null, turnManager = false } = {}) {
  const passed = Boolean(result?.passed);
  const expectedActiveAfter = result ? !passed : beforeActive;
  const selected = methodView(selectedMethod);
  const expectedKeys = expectedMethods.map(methodView).filter(Boolean).map(method => `${method.kind}|${String(method.name).toLowerCase()}|${method.obstacle}|${method.dice}`);
  const selectedKey = selected ? `${selected.kind}|${String(selected.name).toLowerCase()}|${selected.obstacle}|${selected.dice}` : null;
  const gmEconomyExpected = Boolean(result && economy?.phase === "gm" && Number(economy?.cost) === 2);
  const gmEconomyMatch = !gmEconomyExpected || (Number(checksBefore) - Number(checksAfter) === 2);
  const attemptMatch = !turnManager || !result || attemptRecorded === true;
  const fields = freeze({
    selectedMethod: !result || expectedKeys.includes(selectedKey),
    conditionsIgnored: !result || ignoreConditions === true,
    conditionOutcome: Boolean(afterActive) === Boolean(expectedActiveAfter),
    gmCheckEconomy: gmEconomyMatch,
    attemptRecorded: attemptMatch
  });
  return freeze({ match: Object.values(fields).every(Boolean), fields, expectedActiveAfter, selectedMethod: selected, result: result ? { passed: Boolean(result.passed), tied: Boolean(result.tied), outcome: String(result.outcome ?? "") } : null });
}

function installConditionRollObserver(ActorClass) {
  const original = ActorClass?.prototype?._activeConditionRollData;
  if (typeof original !== "function" || original._rgM4ConditionRollWrapped) return;
  const wrapped = function(rollName = "", options = {}) {
    const actual = original.call(this, rollName, options);
    const expected = conditions.collectRollEffects(this, rollName, options);
    const comparison = compareConditionRollObservation(actual, expected);
    push({
      kind: "CONDITION_ROLL",
      actorId: this.id ?? null,
      actorName: String(this.name ?? ""),
      rollName: String(rollName ?? ""),
      isSkill: options?.isSkill !== false,
      status: comparison.match ? "MATCH" : "MISMATCH",
      comparison
    });
    return actual;
  };
  Object.defineProperty(wrapped, "_rgM4ConditionRollWrapped", { value: true });
  ActorClass.prototype._activeConditionRollData = wrapped;
  conditionRollWrapped = true;
}

function installCapabilityObserver(ActorClass) {
  const originalAssist = ActorClass?.prototype?._rollAssist;
  if (typeof originalAssist === "function" && !originalAssist._rgM4CapabilityWrapped) {
    const wrappedAssist = function(options = {}) {
      const actual = originalAssist.call(this, options);
      const block = capabilities.isBlocked(this, "BENEFICIAL_TRAIT_WISE");
      const trait = options.traitId ? this.items?.get?.(options.traitId) : null;
      const wise = options.wiseId ? this.items?.get?.(options.wiseId) : null;
      const requestedHelpfulTrait = trait?.type === "trait" && String(options.traitMode ?? "help") === "help";
      const requestedWise = wise?.type === "wise";
      if (requestedHelpfulTrait || requestedWise) {
        const fields = freeze({
          traitHelp: !requestedHelpfulTrait || Boolean(actual?.blockedTraitHelp) === Boolean(block.blocked),
          wise: !requestedWise || Boolean(actual?.blockedWise) === Boolean(block.blocked)
        });
        push({
          kind: "CAPABILITY_SUPPORT",
          actorId: this.id ?? null,
          actorName: String(this.name ?? ""),
          capability: "BENEFICIAL_TRAIT_WISE",
          expectedBlocked: block.blocked,
          actual: { blockedTraitHelp: Boolean(actual?.blockedTraitHelp), blockedWise: Boolean(actual?.blockedWise) },
          status: Object.values(fields).every(Boolean) ? "MATCH" : "MISMATCH",
          comparison: { fields }
        });
      }
      return actual;
    };
    Object.defineProperty(wrappedAssist, "_rgM4CapabilityWrapped", { value: true });
    ActorClass.prototype._rollAssist = wrappedAssist;
  }
  capabilityWrapped = true;
}

function installRecoveryRollObserver(ActorClass) {
  for (const method of ["rollRole", "rollAbility"]) {
    const original = ActorClass?.prototype?.[method];
    if (typeof original !== "function" || original._rgM4RecoveryRollWrapped) continue;
    const wrapped = async function(...args) {
      const flight = recoveryInFlight.get(this) ?? null;
      const options = args[1] ?? {};
      const recoveryRoll = Boolean(flight && options?.ignoreConditions === true);
      const result = await original.apply(this, args);
      if (recoveryRoll && flight) {
        flight.roll = {
          legacyMethod: method,
          kind: method === "rollRole" ? "role" : "ability",
          key: method === "rollAbility" ? String(args[0] ?? "").toLowerCase() : null,
          name: method === "rollRole" ? String(args[0]?.name ?? "") : String(args[0] ?? ""),
          sourceId: method === "rollRole" ? args[0]?.id ?? null : `ability:${String(args[0] ?? "").toLowerCase()}`,
          obstacle: Math.max(0, Number(options.obstacle ?? 0)),
          dice: method === "rollRole" ? Math.max(0, Number(args[0]?.system?.rating ?? 0)) : Math.max(0, Number(this.system?.attributes?.[String(args[0] ?? "").toLowerCase()]?.value ?? 0)),
          ignoreConditions: Boolean(options.ignoreConditions),
          result
        };
      }
      return result;
    };
    Object.defineProperty(wrapped, "_rgM4RecoveryRollWrapped", { value: true });
    ActorClass.prototype[method] = wrapped;
  }

  const originalBeginner = ActorClass?.prototype?.rollBeginnerLuck;
  if (typeof originalBeginner === "function" && !originalBeginner._rgM4BeginnerCapabilityWrapped) {
    const wrappedBeginner = async function(...args) {
      const expected = capabilities.isBlocked(this, "BEGINNER_LUCK");
      const result = await originalBeginner.apply(this, args);
      if (expected.blocked) {
        const actualBlocked = result === undefined || result === null;
        push({
          kind: "CAPABILITY_BEGINNER_LUCK",
          actorId: this.id ?? null,
          actorName: String(this.name ?? ""),
          capability: "BEGINNER_LUCK",
          expectedBlocked: true,
          actualBlocked,
          status: actualBlocked ? "MATCH" : "MISMATCH"
        });
      }
      return result;
    };
    Object.defineProperty(wrappedBeginner, "_rgM4BeginnerCapabilityWrapped", { value: true });
    ActorClass.prototype.rollBeginnerLuck = wrappedBeginner;
  }
  recoveryRollWrapped = true;
}

function installRecoveryActionObserver(ActorSheetClass) {
  const actions = ActorSheetClass?.DEFAULT_OPTIONS?.actions;
  const original = actions?.recoverCondition;
  if (typeof original !== "function" || original._rgM4RecoveryActionWrapped) return;

  const wrapped = async function(event, target) {
    const actor = this.actor;
    const id = target?.closest?.("[data-item-id]")?.dataset?.itemId;
    const item = actor?.items?.get?.(id) ?? null;
    if (!actor || !item || item.type !== "condition") return original.call(this, event, target);

    const beforeActive = Boolean(item.system?.active);
    const checksBefore = Math.max(0, Number(actor.system?.resources?.checks?.value ?? 0));
    const tmEnabled = Boolean(turnManagerEnabled());
    const phase = tmEnabled ? String(currentTurnPhase()) : "free";
    const attemptedBefore = tmEnabled ? Boolean(recoveryAttempted(actor, item.name)) : false;
    const coreContext = recovery.context(actor, item.id);
    const manual = String(item.name ?? "").toLowerCase() === "fresh" || String(item.system?.recoveryType ?? "manual") === "manual";

    if (manual) {
      const result = await original.call(this, event, target);
      const afterActive = Boolean(item.system?.active);
      const match = beforeActive ? !afterActive : true;
      push({
        kind: "RECOVERY_MANUAL",
        actorId: actor.id ?? null,
        actorName: String(actor.name ?? ""),
        conditionId: item.id,
        conditionName: String(item.name ?? ""),
        context: coreContext,
        status: match ? "MATCH" : "MISMATCH",
        comparison: { fields: { conditionCleared: match } }
      });
      return result;
    }

    const legacyValidation = validateRecoveryAttempt(actor, item);
    const coreValidation = recovery.validate(actor, item.id, { turnManagerEnabled: tmEnabled, phase, recoveryAttempted: attemptedBefore, checks: checksBefore });
    const legacyMethods = recoveryMethods(actor, item);
    const coreMethods = recovery.methods(actor, item.id);
    const preparation = compareRecoveryPreparation({ legacyValidation, coreValidation, legacyMethods, coreMethods });
    const economy = recovery.economy(actor, { turnManagerEnabled: tmEnabled, phase });
    const flight = { actor, item, beforeActive, checksBefore, tmEnabled, phase, coreContext, coreValidation, coreMethods, preparation, economy, roll: null };
    recoveryInFlight.set(actor, flight);

    try {
      const actionResult = await original.call(this, event, target);
      const afterActive = Boolean(item.system?.active);
      const checksAfter = Math.max(0, Number(actor.system?.resources?.checks?.value ?? 0));
      const attemptedAfter = tmEnabled ? Boolean(recoveryAttempted(actor, item.name)) : null;
      const roll = flight.roll;
      const resolution = compareRecoveryResolution({
        beforeActive,
        afterActive,
        result: roll?.result ?? null,
        ignoreConditions: Boolean(roll?.ignoreConditions),
        selectedMethod: roll,
        expectedMethods: coreMethods,
        checksBefore,
        checksAfter,
        economy,
        attemptRecorded: attemptedAfter,
        turnManager: tmEnabled
      });
      const committed = Boolean(roll?.result);
      const combinedMatch = preparation.match && (!committed || resolution.match);
      push({
        kind: committed ? "RECOVERY_RESOLUTION" : "RECOVERY_PREP",
        actorId: actor.id ?? null,
        actorName: String(actor.name ?? ""),
        conditionId: item.id,
        conditionName: String(item.name ?? ""),
        context: coreContext,
        phase,
        turnManagerEnabled: tmEnabled,
        committed,
        preparation,
        resolution,
        checks: { before: checksBefore, after: checksAfter },
        status: combinedMatch ? "MATCH" : "MISMATCH"
      });
      return actionResult;
    } finally {
      recoveryInFlight.delete(actor);
    }
  };
  Object.defineProperty(wrapped, "_rgM4RecoveryActionWrapped", { value: true });
  actions.recoverCondition = wrapped;
  recoveryActionWrapped = true;
}

export function getM4ConditionRecoveryParityStatus() {
  return freeze({
    mode: "REAL_LEGACY_CONDITION_RECOVERY_SHADOW_PARITY",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    installed,
    conditionRollWrapped,
    capabilityWrapped,
    recoveryRollWrapped,
    recoveryActionWrapped,
    scopes: ["CONDITION_ROLL", "CAPABILITY_SUPPORT", "CAPABILITY_BEGINNER_LUCK", "RECOVERY_PREP", "RECOVERY_RESOLUTION", "RECOVERY_MANUAL"]
  });
}

export function getM4ConditionRecoveryParityHistory() { return Object.freeze([...history]); }
export function getM4ConditionRecoveryParityLatest() { return history.at(-1) ?? null; }
export function clearM4ConditionRecoveryParity() { history.splice(0); return getM4ConditionRecoveryParityHistory(); }
export function getM4ConditionRecoveryParitySummary() {
  const byKind = Object.fromEntries([...new Set(history.map(entry => entry.kind))].map(kind => [kind, freeze({ observed: history.filter(entry => entry.kind === kind).length, matches: history.filter(entry => entry.kind === kind && entry.status === "MATCH").length, mismatches: history.filter(entry => entry.kind === kind && entry.status === "MISMATCH").length })]));
  return freeze({
    observed: history.length,
    matches: history.filter(entry => entry.status === "MATCH").length,
    mismatches: history.filter(entry => entry.status === "MISMATCH").length,
    byKind,
    latest: getM4ConditionRecoveryParityLatest()
  });
}

export function installM4ConditionRecoveryShadowParity(ActorClass, ActorSheetClass) {
  installRecoveryActionObserver(ActorSheetClass);
  Hooks.once("ready", () => {
    installConditionRollObserver(ActorClass);
    installCapabilityObserver(ActorClass);
    installRecoveryRollObserver(ActorClass);
    installed = true;
    console.log("realm-guard | CORE M4 Conditions/Capability/Recovery shadow parity ready", getM4ConditionRecoveryParityStatus());
  });
}
