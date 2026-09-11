import { getTestEngine } from "./test-engine-service.mjs";
import { runLegacyCoreTestParity, TEST_PARITY_FIELDS } from "./core/test-parity.mjs";

const HISTORY_LIMIT = 50;
const INSTRUMENTED_METHODS = Object.freeze([
  "rollRole",
  "rollAbility",
  "rollBeginnerLuck",
  "rollAutomaticVersus",
  "rollNatureVersus"
]);
const traceByActor = new WeakMap();
const history = [];
let sequence = 0;
let installed = false;

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

function rollFaces(roll) {
  return Array.from(roll?.dice ?? []).flatMap(die =>
    Array.from(die?.results ?? []).map(result => Number(result?.result))
  ).filter(value => Number.isInteger(value) && value >= 1 && value <= 6);
}

function helperFaces(trace, key) {
  const entries = trace?.[key] ?? [];
  const latest = entries.length ? entries[entries.length - 1] : null;
  return Array.isArray(latest?.faces) && latest.faces.length ? [...latest.faces] : null;
}

function allHelperFaces(trace, key) {
  return (trace?.[key] ?? []).flatMap(entry =>
    Array.isArray(entry?.faces) ? entry.faces.map(Number) : []
  ).filter(value => Number.isInteger(value) && value >= 1 && value <= 6);
}

function resolvedOwnFaces(result, trace) {
  let faces = rollFaces(result?.roll);
  const wise = helperFaces(trace, "wiseResults");
  if (wise) faces = wise;
  const token = helperFaces(trace, "tokenResults");
  if (token) faces = token;
  return faces;
}

function pushHistory(entry) {
  history.push(deepFreeze(entry));
  while (history.length > HISTORY_LIMIT) history.shift();
  return history[history.length - 1];
}

function recordSkipped(actor, method, reason, detail = {}) {
  const entry = pushHistory({
    id: `m3-shadow-${Date.now()}-${++sequence}`,
    timestamp: new Date().toISOString(),
    status: "SKIPPED",
    reason,
    method,
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    detail: clone(detail)
  });
  console.info("realm-guard | CORE M3 Test parity skipped", entry);
  return entry;
}

function recordError(actor, method, error) {
  const entry = pushHistory({
    id: `m3-shadow-${Date.now()}-${++sequence}`,
    timestamp: new Date().toISOString(),
    status: "ERROR",
    reason: "PARITY_OBSERVER_ERROR",
    method,
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    detail: {
      message: String(error?.message ?? error ?? "Unknown parity observer error")
    }
  });
  console.warn("realm-guard | CORE M3 Test parity observer error (live Legacy result preserved)", error, entry);
  return entry;
}

function recordParity(actor, method, spec) {
  const id = `m3-shadow-${Date.now()}-${++sequence}`;
  const comparison = runLegacyCoreTestParity(getTestEngine(), {
    id,
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    ...spec,
    provenance: {
      method,
      realLegacyRoll: true,
      ...(spec.provenance ?? {})
    }
  }, {
    id,
    provenance: {
      source: "REAL_LEGACY_MIXED_ROLL",
      observerOnly: true
    }
  });

  const entry = pushHistory({
    id,
    timestamp: new Date().toISOString(),
    status: comparison.parity.all ? "MATCH" : "MISMATCH",
    method,
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    comparison
  });

  const logger = comparison.parity.all ? console.info : console.warn;
  logger.call(console, `realm-guard | CORE M3 Test parity ${entry.status}`, entry);
  return entry;
}

function paritySpecFor(actor, method, args, result, trace) {
  if (!result || typeof result !== "object" || !result.roll) return null;

  if (method === "rollAutomaticVersus" && result.tieResolution?.resolved) {
    return { skipped: "VERSUS_TIEBREAK_NOT_YET_MODELED_IN_PARITY" };
  }

  const initialFaces = rollFaces(result.roll);
  const faces = resolvedOwnFaces(result, trace);
  const supplementalFaces = allHelperFaces(trace, "fateExplosions");
  const pool = initialFaces.length;
  const successes = Number(result.successes ?? 0);
  const outcome = String(result.outcome ?? "").toUpperCase();
  const margin = Number(result.margin ?? 0);

  if (!pool || !faces.length) return { skipped: "NO_RESOLVED_DICE_AVAILABLE" };
  if (!["PASS", "FAIL", "TIE"].includes(outcome)) return { skipped: "NO_FINAL_LEGACY_OUTCOME" };

  const common = {
    pool,
    faces,
    supplementalFaces,
    successes,
    outcome,
    margin,
    provenance: {
      fateOpenSix: Boolean(result.fateSpent),
      supplementalFaceCount: supplementalFaces.length
    }
  };

  if (Boolean(result.fateSpent) && supplementalFaces.length === 0) {
    return { skipped: "FATE_TRACE_UNAVAILABLE" };
  }

  if (method === "rollRole") {
    const [role, options = {}] = args;
    return {
      ...common,
      context: "ordinary",
      target: Math.max(0, Number(options?.obstacle ?? 1)),
      sourceId: role?.id ?? null,
      sourceName: role?.name ?? "Skill",
      provenance: { ...common.provenance, targetSource: "legacy-options.obstacle" }
    };
  }

  if (method === "rollAbility") {
    const [abilityKey, options = {}] = args;
    const sourceName = typeof actor?._abilityLabel === "function"
      ? actor._abilityLabel(abilityKey)
      : String(abilityKey ?? "Ability");
    return {
      ...common,
      context: "ordinary",
      target: Math.max(0, Number(options?.obstacle ?? 1)),
      sourceId: String(abilityKey ?? ""),
      sourceName,
      provenance: { ...common.provenance, targetSource: "legacy-options.obstacle" }
    };
  }

  if (method === "rollBeginnerLuck") {
    const [role, options = {}] = args;
    if (options?.opponent && options?.opposition) {
      return { skipped: "BEGINNER_LUCK_VERSUS_TARGET_NOT_YET_CAPTURED" };
    }
    return {
      ...common,
      context: "beginnerLuck",
      target: Math.max(0, Number(options?.obstacle ?? 1)),
      sourceId: role?.id ?? null,
      sourceName: role?.name ?? "Untrained Skill",
      provenance: {
        ...common.provenance,
        targetSource: "legacy-options.obstacle",
        abilityKey: String(options?.abilityKey ?? "will")
      }
    };
  }

  if (method === "rollAutomaticVersus") {
    const [role, opponent, opposition] = args;
    return {
      ...common,
      context: "versus",
      target: Math.max(0, Number(result.opponentSuccesses ?? 0)),
      sourceId: role?.id ?? null,
      sourceName: role?.name ?? "Skill",
      provenance: {
        ...common.provenance,
        targetSource: "legacy-result.opponentSuccesses",
        opponentId: opponent?.id ?? null,
        opponentName: opponent?.name ?? "",
        oppositionName: opposition?.name ?? result.opponentName ?? ""
      }
    };
  }

  if (method === "rollNatureVersus") {
    const [opponent] = args;
    return {
      ...common,
      context: "versus",
      target: Math.max(0, Number(result.opponentSuccesses ?? 0)),
      sourceId: "nature",
      sourceName: "Nature",
      provenance: {
        ...common.provenance,
        targetSource: "legacy-result.opponentSuccesses",
        opponentId: opponent?.id ?? null,
        opponentName: opponent?.name ?? ""
      }
    };
  }

  return { skipped: "METHOD_NOT_SUPPORTED" };
}

function compareCompletedRoll(actor, method, args, result, trace) {
  try {
    const spec = paritySpecFor(actor, method, args, result, trace);
    if (!spec) return null;
    if (spec.skipped) return recordSkipped(actor, method, spec.skipped);
    return recordParity(actor, method, spec);
  } catch (error) {
    return recordError(actor, method, error);
  }
}

function markWrapped(fn) {
  Object.defineProperty(fn, "_rgM3ParityWrapped", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
  return fn;
}

function wrapHelper(ActorClass, method, traceKey) {
  const original = ActorClass?.prototype?.[method];
  if (typeof original !== "function" || original._rgM3ParityWrapped) return false;

  const wrapped = markWrapped(async function(...args) {
    const result = await original.apply(this, args);
    const trace = traceByActor.get(this);
    if (trace && Array.isArray(trace[traceKey])) {
      if (Array.isArray(result)) {
        trace[traceKey].push({
          faces: result.map(Number),
          rerollFaces: [],
          rerolledIndexes: []
        });
      } else {
        trace[traceKey].push({
          faces: Array.from(result?.faces ?? []).map(Number),
          rerollFaces: Array.from(result?.rerollFaces ?? []).map(Number),
          rerolledIndexes: Array.from(result?.rerolledIndexes ?? []).map(Number)
        });
      }
    }
    return result;
  });
  ActorClass.prototype[method] = wrapped;
  return true;
}

function wrapRollMethod(ActorClass, method) {
  const original = ActorClass?.prototype?.[method];
  if (typeof original !== "function" || original._rgM3ParityWrapped) return false;

  const wrapped = markWrapped(async function(...args) {
    const previous = traceByActor.get(this) ?? null;
    const trace = {
      method,
      wiseResults: [],
      tokenResults: [],
      fateExplosions: []
    };
    traceByActor.set(this, trace);
    try {
      const result = await original.apply(this, args);
      compareCompletedRoll(this, method, args, result, trace);
      return result;
    } finally {
      if (previous) traceByActor.set(this, previous);
      else traceByActor.delete(this);
    }
  });
  ActorClass.prototype[method] = wrapped;
  return true;
}

function installPrototypeObservers(ActorClass) {
  if (installed) return;
  wrapHelper(ActorClass, "_applyWiseReroll", "wiseResults");
  wrapHelper(ActorClass, "_applyTokenPowerReroll", "tokenResults");
  wrapHelper(ActorClass, "_explodeSixes", "fateExplosions");
  for (const method of INSTRUMENTED_METHODS) wrapRollMethod(ActorClass, method);
  installed = true;
}

export function getTestParityStatus() {
  return deepFreeze({
    phase: "M3",
    mode: "SHADOW_PARITY",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    comparisonFields: [...TEST_PARITY_FIELDS],
    instrumentedMethods: [...INSTRUMENTED_METHODS],
    historyLimit: HISTORY_LIMIT,
    persistence: "CLIENT_MEMORY_ONLY",
    bridge: "LEGACY_RESOLVED_FACES_PLUS_FATE_SUPPLEMENTAL_TO_CORE",
    supportedSpecialResolution: ["FATE_OPEN_SIX"],
    skippedCases: [
      "VERSUS_TIEBREAK_NOT_YET_MODELED_IN_PARITY",
      "BEGINNER_LUCK_VERSUS_TARGET_NOT_YET_CAPTURED",
      "FATE_TRACE_UNAVAILABLE"
    ]
  });
}

export function getTestParityHistory() {
  return Object.freeze([...history]);
}

export function getLatestTestParity() {
  return history.length ? history[history.length - 1] : null;
}

export function getTestParitySummary() {
  const matches = history.filter(entry => entry.status === "MATCH").length;
  const mismatches = history.filter(entry => entry.status === "MISMATCH").length;
  const skipped = history.filter(entry => entry.status === "SKIPPED").length;
  const errors = history.filter(entry => entry.status === "ERROR").length;
  return deepFreeze({
    observed: history.length,
    compared: matches + mismatches,
    matches,
    mismatches,
    skipped,
    errors,
    latest: getLatestTestParity()
  });
}

export function clearTestParityHistory() {
  history.splice(0, history.length);
  return getTestParitySummary();
}

function exposeParityApi() {
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.testParity = Object.freeze({
    getStatus: getTestParityStatus,
    getHistory: getTestParityHistory,
    getLatest: getLatestTestParity,
    getSummary: getTestParitySummary,
    clear: clearTestParityHistory
  });
}

export function installTestParityShadow(ActorClass) {
  Hooks.once("ready", () => {
    installPrototypeObservers(ActorClass);
    exposeParityApi();
    console.log("realm-guard | CORE M3 Legacy Mixed <-> CORE Test shadow parity ready", getTestParityStatus());
  });
}
