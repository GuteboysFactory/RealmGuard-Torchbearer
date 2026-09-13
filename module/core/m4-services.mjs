import { CORE_EVENTS, getCoreEventBus } from "./domain-events.mjs";

function clone(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clone(entry)]));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const entry of Object.values(value)) deepFreeze(entry);
  return Object.freeze(value);
}

const normalize = value => String(value ?? "").trim().toLowerCase();

export class AdvancementService {
  constructor({ eventBus = getCoreEventBus() } = {}) {
    this.eventBus = eventBus;
    this.history = [];
    this.unsubscribe = null;
  }

  start() {
    if (this.unsubscribe) return this;
    this.unsubscribe = this.eventBus.on(CORE_EVENTS.TEST_RESOLVED, event => {
      const recommendation = this.evaluate(event.payload);
      this.history.push(deepFreeze({ eventId: event.id, ...recommendation }));
      while (this.history.length > 50) this.history.shift();
    });
    return this;
  }

  evaluate(payload = {}) {
    const context = String(payload.context ?? "ordinary");
    const outcome = String(payload.outcome ?? "").toUpperCase();
    const sourceKind = String(payload.sourceKind ?? "");
    const countLearning = payload.countLearning !== false;
    const tie = outcome === "TIE";
    const beginnerLuck = context === "beginnerLuck";
    let mode = "NONE";
    if (countLearning && !tie) {
      if (beginnerLuck) mode = "BEGINNER_ATTEMPT";
      else if (sourceKind === "role") mode = "SKILL_PASS_FAIL";
      else if (sourceKind === "ability") mode = "ABILITY_PASS_FAIL";
    }
    return deepFreeze({
      mode,
      eligible: mode !== "NONE",
      passed: outcome === "PASS",
      failed: outcome === "FAIL",
      context,
      sourceKind,
      sourceId: payload.sourceId ?? null,
      sourceName: String(payload.sourceName ?? ""),
      reason: tie ? "TIE_DOES_NOT_ADVANCE" : !countLearning ? "LEARNING_DISABLED" : mode === "NONE" ? "NO_ADVANCEMENT_POLICY" : "LEGACY_MIXED_SHADOW_RECOMMENDATION",
      liveApplication: false
    });
  }

  getHistory() { return Object.freeze([...this.history]); }
  getLatest() { return this.history.at(-1) ?? null; }
  clear() { this.history.splice(0); return this.getHistory(); }
}

export class NatureService {
  state(actor) {
    const nature = actor?.system?.attributes?.nature ?? {};
    const current = Math.max(0, Number(nature.value ?? 0));
    const maximum = Math.max(current, Number(nature.maximum ?? current));
    const descriptors = Array.from(nature.descriptors ?? actor?.getFlag?.("realm-guard", "natureDescriptors") ?? []).map(String);
    return deepFreeze({ current, maximum, tax: Math.max(0, maximum - current), descriptors });
  }

  taxForResult(result = {}, { tapped = false, scope = "within", direct = false, doubleTap = false } = {}) {
    if (!result || Boolean(result.tied) || String(result.outcome ?? "").toUpperCase() === "TIE") return 0;
    const passed = Boolean(result.passed ?? String(result.outcome ?? "").toUpperCase() === "PASS");
    const margin = Math.max(0, Number(result.margin ?? 0));
    const against = String(scope) === "against";
    let tax = 0;
    if (direct) tax = against && !passed ? Math.max(1, margin || 1) : 0;
    else if (tapped) tax = passed ? (against ? 1 : 0) : Math.max(1, margin || 1);
    if (direct && doubleTap && !passed) tax = Math.max(tax, Math.max(1, margin || 1));
    return tax;
  }

  previewTax(actor, amount = 0) {
    const before = this.state(actor);
    const tax = Math.max(0, Number(amount ?? 0));
    let current = Math.max(0, before.current - tax);
    let maximum = before.maximum;
    let collapsed = false;
    if (tax && current <= 0 && maximum > 0) {
      maximum = Math.max(0, maximum - 1);
      current = maximum;
      collapsed = true;
    }
    return deepFreeze({ before, tax, current, maximum, collapsed, liveApplication: false });
  }
}

export class ConditionService {
  list(actor) {
    return Object.freeze(Array.from(actor?.items ?? []).filter(item => item.type === "condition").map(item => deepFreeze({
      id: item.id,
      name: item.name,
      active: Boolean(item.system?.active),
      rollModifier: Number(item.system?.rollModifier ?? 0),
      appliesTo: String(item.system?.appliesTo ?? "all"),
      recoveryType: String(item.system?.recoveryType ?? "manual"),
      recoveryAbility: String(item.system?.recoveryAbility ?? ""),
      recoveryRole: String(item.system?.recoveryRole ?? ""),
      recoveryObstacle: Math.max(0, Number(item.system?.recoveryObstacle ?? 1)),
      custom: !Boolean(item.getFlag?.("realm-guard", "defaultCondition"))
    })));
  }

  applies(condition, rollName, { isSkill = true } = {}) {
    if (!condition?.active) return false;
    const raw = String(condition.appliesTo ?? "all").trim();
    if (!raw || normalize(raw) === "all" || raw === "*") return true;
    if (normalize(raw) === "none") return false;
    const targets = raw.split(",").map(normalize).filter(Boolean);
    const key = normalize(rollName);
    return targets.includes(key) || (isSkill && targets.includes("skills"));
  }

  collectRollEffects(actor, rollName, { isSkill = true } = {}) {
    const active = this.list(actor).filter(condition => this.applies(condition, rollName, { isSkill }));
    return deepFreeze({
      conditions: active,
      diceModifier: active.reduce((sum, condition) => sum + Number(condition.rollModifier ?? 0), 0),
      liveApplication: false
    });
  }

  recoveryContext(actor, conditionId) {
    const condition = this.list(actor).find(entry => entry.id === conditionId) ?? null;
    if (!condition) return null;
    return deepFreeze({
      actorId: actor?.id ?? null,
      conditionId: condition.id,
      conditionName: condition.name,
      type: condition.recoveryType,
      ability: condition.recoveryAbility,
      role: condition.recoveryRole,
      obstacle: condition.recoveryObstacle,
      customCondition: condition.custom,
      context: "recovery",
      liveApplication: false
    });
  }
}

export class CapabilityBlockService {
  collect(actor) {
    const blocks = [];
    for (const condition of Array.from(actor?.items ?? []).filter(item => item.type === "condition" && item.system?.active)) {
      const name = normalize(condition.name);
      if (name === "angry") blocks.push({ sourceId: condition.id, sourceName: condition.name, capability: "BENEFICIAL_TRAIT_WISE", reason: "Legacy Mixed Angry rule" });
      if (name === "afraid") {
        blocks.push({ sourceId: condition.id, sourceName: condition.name, capability: "HELP", reason: "Legacy Mixed Afraid rule" });
        blocks.push({ sourceId: condition.id, sourceName: condition.name, capability: "BEGINNER_LUCK", reason: "Legacy Mixed Afraid rule" });
      }
    }
    return Object.freeze(blocks.map(deepFreeze));
  }
}

export class RecoveryService {
  constructor(conditionService = new ConditionService()) { this.conditions = conditionService; }
  context(actor, conditionId) { return this.conditions.recoveryContext(actor, conditionId); }
}
