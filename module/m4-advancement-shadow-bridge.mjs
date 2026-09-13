import { CORE_EVENTS, getCoreEventBus } from "./core/domain-events.mjs";

const BRIDGED_METHODS = Object.freeze([
  "rollRole",
  "rollAbility",
  "rollBeginnerLuck",
  "rollAutomaticVersus",
  "rollNatureVersus"
]);

const learningDecisionByActor = new WeakMap();
let dialogCaptureInstalled = false;
let rollBridgeInstalled = false;

function markWrapped(fn, marker) {
  Object.defineProperty(fn, marker, {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
  return fn;
}

function storeLearningDecision(actor, result, sourceName = "") {
  if (!actor) return;
  if (!result) {
    learningDecisionByActor.delete(actor);
    return;
  }
  learningDecisionByActor.set(actor, Object.freeze({
    countLearning: Boolean(result.countLearning),
    sourceName: String(sourceName ?? ""),
    timestamp: Date.now()
  }));
}

function consumeLearningDecision(actor, options = {}) {
  if (Object.prototype.hasOwnProperty.call(options ?? {}, "countLearning")) {
    return Object.freeze({
      countLearning: Boolean(options.countLearning),
      source: "LEGACY_METHOD_OPTIONS"
    });
  }

  const captured = actor ? learningDecisionByActor.get(actor) : null;
  if (actor) learningDecisionByActor.delete(actor);
  if (captured && Date.now() - captured.timestamp < 5 * 60 * 1000) {
    return Object.freeze({
      countLearning: Boolean(captured.countLearning),
      source: "LEGACY_ROLL_DIALOG"
    });
  }

  return Object.freeze({
    countLearning: actor?.type !== "npc",
    source: "ACTOR_TYPE_DEFAULT"
  });
}

function contextFor(method, args = []) {
  if (method === "rollRole") {
    const options = args[1] ?? {};
    return options.ignoreConditions === true ? "recovery" : "ordinary";
  }
  if (method === "rollAbility") {
    const key = String(args[0] ?? "").toLowerCase();
    const options = args[1] ?? {};
    if (options.ignoreConditions === true) return "recovery";
    if (key === "nature") return "nature";
    if (key === "circles") return "circles";
    return "ability";
  }
  if (method === "rollBeginnerLuck") return "beginnerLuck";
  if (method === "rollAutomaticVersus") return "versus";
  if (method === "rollNatureVersus") return "nature";
  return "ordinary";
}

function sourceFor(actor, method, args = []) {
  if (["rollRole", "rollBeginnerLuck", "rollAutomaticVersus"].includes(method)) {
    const role = args[0] ?? null;
    return Object.freeze({
      sourceKind: "role",
      sourceId: role?.id ?? null,
      sourceName: String(role?.name ?? "Skill")
    });
  }
  if (method === "rollAbility") {
    const key = String(args[0] ?? "").toLowerCase();
    return Object.freeze({
      sourceKind: "ability",
      sourceId: key || null,
      sourceName: typeof actor?._abilityLabel === "function" ? actor._abilityLabel(key) : (key || "Ability")
    });
  }
  if (method === "rollNatureVersus") {
    return Object.freeze({ sourceKind: "ability", sourceId: "nature", sourceName: "Nature" });
  }
  return Object.freeze({ sourceKind: "", sourceId: null, sourceName: "" });
}

function learningOutcomeFor(result) {
  if (!result || typeof result !== "object") return null;
  if (Object.prototype.hasOwnProperty.call(result, "learningResult")) {
    if (result.learningResult === null || result.learningResult === undefined) return null;
    return result.learningResult ? "PASS" : "FAIL";
  }
  if (Boolean(result.tied) || String(result.outcome ?? "").toUpperCase() === "TIE") return null;
  return Boolean(result.passed) ? "PASS" : "FAIL";
}

function latestParity(actor, method) {
  const latest = game.realmGuard?.core?.testParity?.getLatest?.() ?? null;
  if (!latest || latest.actorId !== actor?.id || latest.method !== method) return null;
  return latest;
}

function emitResolved(actor, method, args, result) {
  if (!result || typeof result !== "object") return null;
  const options = method === "rollRole" ? (args[1] ?? {})
    : method === "rollAbility" ? (args[1] ?? {})
      : method === "rollBeginnerLuck" ? (args[1] ?? {})
        : method === "rollAutomaticVersus" ? (args[3] ?? {})
          : method === "rollNatureVersus" ? (args[1] ?? {})
            : {};
  const learning = consumeLearningDecision(actor, options);
  const source = sourceFor(actor, method, args);
  const parity = latestParity(actor, method);
  const payload = Object.freeze({
    actorId: actor?.id ?? null,
    actorName: String(actor?.name ?? ""),
    context: contextFor(method, args),
    sourceKind: source.sourceKind,
    sourceId: source.sourceId,
    sourceName: source.sourceName,
    outcome: String(result.outcome ?? (result.tied ? "TIE" : result.passed ? "PASS" : "FAIL")).toUpperCase(),
    learningOutcome: learningOutcomeFor(result),
    countLearning: learning.countLearning,
    countLearningSource: learning.source,
    legacyMethod: method,
    parityId: parity?.id ?? null,
    parityStatus: parity?.status ?? null,
    realLegacyRoll: true,
    liveApplication: false
  });
  return getCoreEventBus().emit(CORE_EVENTS.TEST_RESOLVED, payload, {
    source: "LEGACY_MIXED_REAL_TEST",
    observerOnly: true,
    bridge: "M4_ADVANCEMENT_SHADOW"
  });
}

function installDialogCapture(ActorSheetClass) {
  if (dialogCaptureInstalled) return;
  const original = ActorSheetClass?._openRollDialog;
  if (typeof original !== "function" || original._rgM4LearningCaptureWrapped) return;

  const wrapped = markWrapped(async function(...args) {
    const actor = this?.actor ?? null;
    if (actor) learningDecisionByActor.delete(actor);
    const result = await original.apply(this, args);
    storeLearningDecision(actor, result, args?.[0]?.name ?? "");
    return result;
  }, "_rgM4LearningCaptureWrapped");

  ActorSheetClass._openRollDialog = wrapped;
  dialogCaptureInstalled = true;
}

function installRollBridge(ActorClass) {
  if (rollBridgeInstalled) return;
  for (const method of BRIDGED_METHODS) {
    const original = ActorClass?.prototype?.[method];
    if (typeof original !== "function" || original._rgM4AdvancementBridgeWrapped) continue;
    const wrapped = markWrapped(async function(...args) {
      const result = await original.apply(this, args);
      try {
        emitResolved(this, method, args, result);
      } catch (error) {
        console.warn("realm-guard | CORE M4 advancement shadow bridge error (Legacy result preserved)", error);
      }
      return result;
    }, "_rgM4AdvancementBridgeWrapped");
    ActorClass.prototype[method] = wrapped;
  }
  rollBridgeInstalled = true;
}

export function getM4AdvancementBridgeStatus() {
  return Object.freeze({
    mode: "REAL_LEGACY_TEST_RESOLVED_SHADOW",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    bridgedMethods: [...BRIDGED_METHODS],
    rollBridgeInstalled,
    dialogCaptureInstalled,
    learningDecisionCapture: "LEGACY_ROLL_DIALOG_WITH_ACTOR_TYPE_FALLBACK"
  });
}

export function installM4AdvancementShadowBridge(ActorClass, ActorSheetClass) {
  installDialogCapture(ActorSheetClass);
  Hooks.once("ready", () => {
    installRollBridge(ActorClass);
    console.log("realm-guard | CORE M4 real TEST_RESOLVED advancement shadow bridge ready", getM4AdvancementBridgeStatus());
  });
}
