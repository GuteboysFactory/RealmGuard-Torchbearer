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
const RECOVERY_ORDER = Object.freeze(["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);

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
    const legacyOutcome = String(payload.outcome ?? "").toUpperCase();
    const hasLearningOutcome = Object.prototype.hasOwnProperty.call(payload, "learningOutcome");
    const rawLearningOutcome = hasLearningOutcome ? payload.learningOutcome : legacyOutcome;
    const learningOutcome = rawLearningOutcome === null || rawLearningOutcome === undefined
      ? null
      : String(rawLearningOutcome).toUpperCase();
    const sourceKind = String(payload.sourceKind ?? "");
    const countLearning = payload.countLearning !== false;
    const tie = legacyOutcome === "TIE";
    const beginnerLuck = context === "beginnerLuck";
    const noLegacyLearningResult = hasLearningOutcome && learningOutcome === null && !tie;
    let mode = "NONE";
    if (countLearning && !tie && !noLegacyLearningResult) {
      if (beginnerLuck) mode = "BEGINNER_ATTEMPT";
      else if (sourceKind === "role") mode = "SKILL_PASS_FAIL";
      else if (sourceKind === "ability") mode = "ABILITY_PASS_FAIL";
    }
    const passed = learningOutcome === "PASS";
    const failed = learningOutcome === "FAIL";
    const reason = tie
      ? "TIE_DOES_NOT_ADVANCE"
      : !countLearning
        ? "LEARNING_DISABLED"
        : noLegacyLearningResult
          ? "LEGACY_LEARNING_RESULT_NONE"
          : mode === "NONE"
            ? "NO_ADVANCEMENT_POLICY"
            : "LEGACY_MIXED_SHADOW_RECOMMENDATION";
    return deepFreeze({
      mode,
      eligible: mode !== "NONE",
      passed,
      failed,
      context,
      sourceKind,
      sourceId: payload.sourceId ?? null,
      sourceName: String(payload.sourceName ?? ""),
      legacyOutcome,
      learningOutcome,
      countLearning,
      countLearningSource: String(payload.countLearningSource ?? ""),
      realLegacyRoll: Boolean(payload.realLegacyRoll),
      legacyMethod: String(payload.legacyMethod ?? ""),
      parityId: payload.parityId ?? null,
      parityStatus: payload.parityStatus ?? null,
      reason,
      liveApplication: false
    });
  }

  getHistory() { return Object.freeze([...this.history]); }
  getLatest() { return this.history.at(-1) ?? null; }
  getSummary() {
    const realLegacy = this.history.filter(entry => entry.realLegacyRoll).length;
    const eligible = this.history.filter(entry => entry.eligible).length;
    const ignored = this.history.length - eligible;
    const parityMatches = this.history.filter(entry => entry.parityStatus === "MATCH").length;
    return deepFreeze({ observed: this.history.length, realLegacy, eligible, ignored, parityMatches, latest: this.getLatest() });
  }
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

  isBlocked(actor, capability) {
    const key = String(capability ?? "").trim().toUpperCase();
    const matches = this.collect(actor).filter(block => String(block.capability).toUpperCase() === key);
    return deepFreeze({ blocked: matches.length > 0, capability: key, sources: matches, liveApplication: false });
  }
}

export class RecoveryService {
  constructor(conditionService = new ConditionService()) { this.conditions = conditionService; }

  context(actor, conditionId) { return this.conditions.recoveryContext(actor, conditionId); }

  blocker(actor, conditionId) {
    const conditions = this.conditions.list(actor);
    const condition = conditions.find(entry => entry.id === conditionId) ?? null;
    if (!condition) return null;
    const index = RECOVERY_ORDER.findIndex(name => normalize(name) === normalize(condition.name));
    if (index < 0) return null;
    for (let i = 0; i < index; i += 1) {
      const blocker = conditions.find(entry => entry.active && normalize(entry.name) === normalize(RECOVERY_ORDER[i]));
      if (blocker) return deepFreeze({ id: blocker.id, name: blocker.name });
    }
    return null;
  }

  methods(actor, conditionId) {
    const condition = this.conditions.list(actor).find(entry => entry.id === conditionId) ?? null;
    if (!condition) return Object.freeze([]);
    const attributes = actor?.system?.attributes ?? {};
    const roles = Array.from(actor?.items ?? []).filter(item => item.type === "role");
    const ability = (name, obstacle) => {
      const key = normalize(name);
      const stat = attributes?.[key];
      if (!stat) return null;
      return deepFreeze({ kind: "ability", key, name: String(name), obstacle: Math.max(0, Number(obstacle ?? 0)), dice: Math.max(0, Number(stat.value ?? 0)), sourceId: `ability:${key}` });
    };
    const role = (name, obstacle) => {
      const item = roles.find(entry => normalize(entry.name) === normalize(name) && Number(entry.system?.rating ?? 0) > 0);
      if (!item) return null;
      return deepFreeze({ kind: "role", key: null, name: String(item.name), obstacle: Math.max(0, Number(obstacle ?? 0)), dice: Math.max(0, Number(item.system?.rating ?? 0)), sourceId: item.id ?? null });
    };

    const key = normalize(condition.name);
    let methods = [];
    if (key === "hungry & thirsty") methods = [role("Cook", 1), role("Brewer", 1), role("Baker", 1), ability("Resources", 1)];
    else if (key === "angry") methods = [ability("Will", 2)];
    else if (key === "afraid") methods = [ability("Will", 3)];
    else if (key === "tired") methods = [ability("Health", 3)];
    else if (key === "injured") methods = [ability("Health", 4)];
    else if (key === "strained") methods = [ability("Will", 4)];
    else if (condition.recoveryType === "ability") methods = [ability(condition.recoveryAbility, condition.recoveryObstacle)];
    else if (condition.recoveryType === "role") methods = [role(condition.recoveryRole, condition.recoveryObstacle)];
    return Object.freeze(methods.filter(Boolean));
  }

  validate(actor, conditionId, { turnManagerEnabled = false, phase = "free", recoveryAttempted = false, checks = null } = {}) {
    const condition = this.conditions.list(actor).find(entry => entry.id === conditionId) ?? null;
    if (!condition) return deepFreeze({ ok: false, reasonCode: "INVALID_TARGET", blocker: null, liveApplication: false });
    if (!condition.active) return deepFreeze({ ok: false, reasonCode: "INACTIVE", blocker: null, liveApplication: false });
    const blocker = this.blocker(actor, conditionId);
    if (blocker) return deepFreeze({ ok: false, reasonCode: "RECOVERY_ORDER", blocker, liveApplication: false });
    if (turnManagerEnabled && recoveryAttempted) return deepFreeze({ ok: false, reasonCode: "ALREADY_ATTEMPTED", blocker: null, liveApplication: false });
    const availableChecks = checks === null || checks === undefined ? Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0)) : Math.max(0, Number(checks ?? 0));
    if (turnManagerEnabled && String(phase) === "gm" && availableChecks < 2) {
      return deepFreeze({ ok: false, reasonCode: "GM_CHECKS", blocker: null, checks: availableChecks, requiredChecks: 2, liveApplication: false });
    }
    return deepFreeze({ ok: true, reasonCode: "OK", blocker: null, liveApplication: false });
  }

  economy(actor, { turnManagerEnabled = false, phase = "free" } = {}) {
    const checks = Math.max(0, Number(actor?.system?.resources?.checks?.value ?? 0));
    if (!turnManagerEnabled) return deepFreeze({ phase: "free", source: "free-play", cost: 0, checksBefore: checks, checksAfter: checks, liveApplication: false });
    if (String(phase) === "gm") return deepFreeze({ phase: "gm", source: "gm-checks", cost: 2, checksBefore: checks, checksAfter: Math.max(0, checks - 2), liveApplication: false });
    return deepFreeze({ phase: "player", source: "player-turn", cost: null, checksBefore: checks, checksAfter: null, liveApplication: false });
  }

  resolution(actor, conditionId, { passed = false } = {}) {
    const condition = this.conditions.list(actor).find(entry => entry.id === conditionId) ?? null;
    if (!condition) return null;
    return deepFreeze({
      conditionId,
      conditionName: condition.name,
      passed: Boolean(passed),
      activeBefore: condition.active,
      activeAfter: Boolean(passed) ? false : condition.active,
      liveApplication: false
    });
  }
}
