export const TEST_PARITY_FIELDS = Object.freeze([
  "pool",
  "target",
  "successes",
  "outcome",
  "margin"
]);

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

function integer(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeOutcome(value) {
  const outcome = String(value ?? "").trim().toUpperCase();
  if (!["PASS", "FAIL", "TIE"].includes(outcome)) throw new Error(`Invalid parity outcome: ${value}`);
  return outcome;
}

function normalizeFaces(faces = []) {
  return Object.freeze(Array.from(faces ?? []).map(face => {
    const n = integer(face, 0);
    if (n < 1 || n > 6) throw new Error(`Invalid parity d6 face: ${face}`);
    return n;
  }));
}

export function createLegacyTestSnapshot(spec = {}) {
  const context = String(spec.context ?? "ordinary").trim();
  if (!["ordinary", "versus"].includes(context)) throw new Error(`Unsupported parity context: ${context}`);
  const pool = Math.max(0, integer(spec.pool, 0));
  const faces = normalizeFaces(spec.faces ?? []);
  if (faces.length !== pool) {
    throw new Error(`Legacy parity snapshot expected ${pool} resolved dice, received ${faces.length}.`);
  }
  const successes = Math.max(0, integer(spec.successes, 0));
  const rawSuccesses = faces.filter(face => face >= Math.max(2, Math.min(6, integer(spec.successThreshold, 4)))).length;
  return deepFreeze({
    id: String(spec.id ?? ""),
    context,
    actorId: spec.actorId ?? null,
    actorName: String(spec.actorName ?? ""),
    sourceId: spec.sourceId ?? null,
    sourceName: String(spec.sourceName ?? ""),
    pool,
    target: Math.max(0, integer(spec.target, 0)),
    faces,
    rawSuccesses,
    successModifier: successes - rawSuccesses,
    successes,
    outcome: normalizeOutcome(spec.outcome),
    margin: Math.max(0, integer(spec.margin, 0)),
    successThreshold: Math.max(2, Math.min(6, integer(spec.successThreshold, 4))),
    provenance: clone(spec.provenance ?? {})
  });
}

export function compareParitySnapshots(legacy, core) {
  const fields = Object.freeze({
    pool: Number(legacy.pool) === Number(core.pool),
    target: Number(legacy.target) === Number(core.target),
    successes: Number(legacy.successes) === Number(core.successes),
    outcome: String(legacy.outcome) === String(core.outcome),
    margin: Number(legacy.margin) === Number(core.margin)
  });
  return deepFreeze({
    fields,
    all: TEST_PARITY_FIELDS.every(field => fields[field])
  });
}

export function runLegacyCoreTestParity(engine, legacySpec, {
  id = null,
  profileId = "realm-guard-legacy-mixed",
  profileVersion = null,
  rulesSnapshotHash = null,
  provenance = {}
} = {}) {
  if (!engine?.runDeterministic) throw new Error("runLegacyCoreTestParity requires a TestEngine.");
  const legacy = createLegacyTestSnapshot(legacySpec);
  const requestId = String(id ?? legacy.id ?? `m3-parity-${Date.now()}`);
  const request = {
    id: requestId,
    context: {
      type: legacy.context,
      actorId: legacy.actorId,
      sourceId: legacy.sourceId,
      sourceName: legacy.sourceName,
      metadata: {
        shadowParity: true,
        legacyMethod: legacy.provenance?.method ?? null
      }
    },
    basePool: legacy.pool,
    obstacle: legacy.context === "ordinary" ? legacy.target : 0,
    oppositionSuccesses: legacy.context === "versus" ? legacy.target : 0,
    successModifier: legacy.successModifier,
    successThreshold: legacy.successThreshold,
    profileId,
    profileVersion,
    rulesSnapshotHash,
    provenance: {
      shadowParity: true,
      legacy: legacy.provenance,
      ...clone(provenance)
    }
  };
  const prepared = engine.runDeterministic(request, {
    provenance: {
      shadowParity: true,
      legacyPoolObserved: legacy.pool
    }
  }, legacy.faces);
  const core = deepFreeze({
    pool: Number(prepared.plan.finalPool),
    target: Number(prepared.result.targetSuccesses),
    faces: [...prepared.result.faces],
    rawSuccesses: Number(prepared.result.rawSuccesses),
    successModifier: Number(prepared.result.successModifier),
    successes: Number(prepared.result.finalSuccesses),
    outcome: prepared.result.outcome,
    margin: Number(prepared.result.margin)
  });
  const parity = compareParitySnapshots(legacy, core);
  return deepFreeze({
    id: requestId,
    context: legacy.context,
    legacy,
    core,
    parity,
    transaction: prepared.transaction.snapshot()
  });
}
