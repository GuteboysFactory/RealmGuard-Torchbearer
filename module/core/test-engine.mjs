export const TEST_CONTEXTS = Object.freeze([
  "ordinary",
  "versus",
  "beginnerLuck",
  "ability",
  "nature",
  "recovery",
  "circles",
  "custom"
]);

export const TEST_TRANSACTION_STATES = Object.freeze({
  PREPARED: "PREPARED",
  RESERVED: "RESERVED",
  ROLLED: "ROLLED",
  RESOLVED: "RESOLVED",
  COMMITTED: "COMMITTED"
});

const VALID_CONTEXTS = new Set(TEST_CONTEXTS);
const VALID_STATES = new Set(Object.values(TEST_TRANSACTION_STATES));

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

function finiteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeFaces(faces = []) {
  return Object.freeze(Array.from(faces ?? []).map(face => {
    const n = Math.trunc(finiteNumber(face, 0));
    if (n < 1 || n > 6) throw new Error(`Invalid d6 face: ${face}`);
    return n;
  }));
}

function normalizeContext(value) {
  const context = String(value ?? "ordinary").trim();
  if (!VALID_CONTEXTS.has(context)) throw new Error(`Unsupported TestContext: ${context}`);
  return context;
}

function countSuccesses(faces, threshold = 4) {
  const t = Math.min(6, Math.max(2, Math.trunc(finiteNumber(threshold, 4))));
  return normalizeFaces(faces ?? []).filter(face => face >= t).length;
}

export function createTestContext(spec = {}) {
  return deepFreeze({
    type: normalizeContext(spec.type),
    actorId: spec.actorId ?? null,
    sourceId: spec.sourceId ?? null,
    sourceName: String(spec.sourceName ?? ""),
    isSkill: Boolean(spec.isSkill),
    metadata: clone(spec.metadata ?? {})
  });
}

export function createTestRequest(spec = {}) {
  const id = String(spec.id ?? "").trim();
  if (!id) throw new Error("TestRequest requires id.");
  const basePool = Math.max(0, Math.trunc(finiteNumber(spec.basePool, 0)));
  const obstacle = Math.max(0, Math.trunc(finiteNumber(spec.obstacle, 0)));
  const oppositionSuccesses = Math.max(0, Math.trunc(finiteNumber(spec.oppositionSuccesses, 0)));
  return deepFreeze({
    id,
    context: createTestContext(spec.context ?? {}),
    basePool,
    obstacle,
    oppositionSuccesses,
    extraDice: Math.trunc(finiteNumber(spec.extraDice, 0)),
    successModifier: Math.trunc(finiteNumber(spec.successModifier, 0)),
    successThreshold: Math.min(6, Math.max(2, Math.trunc(finiteNumber(spec.successThreshold, 4)))),
    profileId: spec.profileId ?? null,
    profileVersion: spec.profileVersion ?? null,
    rulesSnapshotHash: spec.rulesSnapshotHash ?? null,
    provenance: clone(spec.provenance ?? {})
  });
}

export function createRollPlan(request, spec = {}) {
  if (!request?.id) throw new Error("RollPlan requires a TestRequest.");
  const diceModifier = Math.trunc(finiteNumber(spec.diceModifier, 0));
  const finalPool = Math.max(0, request.basePool + request.extraDice + diceModifier);
  return deepFreeze({
    requestId: request.id,
    context: request.context,
    basePool: request.basePool,
    extraDice: request.extraDice,
    diceModifier,
    finalPool,
    obstacle: request.obstacle,
    oppositionSuccesses: request.oppositionSuccesses,
    successModifier: request.successModifier,
    successThreshold: request.successThreshold,
    effects: clone(spec.effects ?? []),
    resourceReservations: clone(spec.resourceReservations ?? []),
    provenance: clone(spec.provenance ?? {})
  });
}

export function createTestResult(spec = {}) {
  const outcome = String(spec.outcome ?? "").toUpperCase();
  if (!["PASS", "FAIL", "TIE"].includes(outcome)) throw new Error(`Invalid TestResult outcome: ${outcome}`);
  const faces = normalizeFaces(spec.faces ?? []);
  const supplementalFaces = normalizeFaces(spec.supplementalFaces ?? []);
  return deepFreeze({
    requestId: String(spec.requestId ?? ""),
    context: normalizeContext(spec.context ?? "ordinary"),
    faces,
    supplementalFaces,
    allFaces: Object.freeze([...faces, ...supplementalFaces]),
    rawSuccesses: Math.max(0, Math.trunc(finiteNumber(spec.rawSuccesses, 0))),
    successModifier: Math.trunc(finiteNumber(spec.successModifier, 0)),
    finalSuccesses: Math.max(0, Math.trunc(finiteNumber(spec.finalSuccesses, 0))),
    targetSuccesses: Math.max(0, Math.trunc(finiteNumber(spec.targetSuccesses, 0))),
    outcome,
    margin: Math.max(0, Math.trunc(finiteNumber(spec.margin, 0))),
    provenance: clone(spec.provenance ?? {})
  });
}

export class RollTransaction {
  constructor(plan) {
    if (!plan?.requestId) throw new Error("RollTransaction requires a RollPlan.");
    this.plan = plan;
    this.state = TEST_TRANSACTION_STATES.PREPARED;
    this.faces = Object.freeze([]);
    this.result = null;
    this.cancelled = false;
    this.history = [TEST_TRANSACTION_STATES.PREPARED];
  }

  #transition(expected, next) {
    if (this.cancelled) throw new Error("RollTransaction is cancelled.");
    if (this.state !== expected) throw new Error(`RollTransaction expected ${expected}, got ${this.state}.`);
    if (!VALID_STATES.has(next)) throw new Error(`Invalid RollTransaction state: ${next}`);
    this.state = next;
    this.history.push(next);
    return this;
  }

  reserve() {
    return this.#transition(TEST_TRANSACTION_STATES.PREPARED, TEST_TRANSACTION_STATES.RESERVED);
  }

  recordRoll(faces) {
    this.#transition(TEST_TRANSACTION_STATES.RESERVED, TEST_TRANSACTION_STATES.ROLLED);
    this.faces = normalizeFaces(faces);
    return this;
  }

  resolve(result) {
    if (!result?.outcome) throw new Error("RollTransaction.resolve requires TestResult.");
    this.#transition(TEST_TRANSACTION_STATES.ROLLED, TEST_TRANSACTION_STATES.RESOLVED);
    this.result = result;
    return this;
  }

  commit() {
    return this.#transition(TEST_TRANSACTION_STATES.RESOLVED, TEST_TRANSACTION_STATES.COMMITTED);
  }

  cancel() {
    if (this.state === TEST_TRANSACTION_STATES.COMMITTED) throw new Error("Committed RollTransaction cannot be cancelled.");
    this.cancelled = true;
    this.state = TEST_TRANSACTION_STATES.PREPARED;
    this.faces = Object.freeze([]);
    this.result = null;
    this.history.push("CANCELLED->PREPARED");
    return this;
  }

  snapshot() {
    return deepFreeze({
      requestId: this.plan.requestId,
      state: this.state,
      cancelled: this.cancelled,
      faces: [...this.faces],
      result: this.result,
      history: [...this.history]
    });
  }
}

export class TestEngine {
  prepare(requestSpec, planSpec = {}) {
    const request = createTestRequest(requestSpec);
    const plan = createRollPlan(request, planSpec);
    const transaction = new RollTransaction(plan);
    return Object.freeze({ request, plan, transaction });
  }

  resolveFaces(plan, faces, { supplementalFaces = [] } = {}) {
    if (!plan?.requestId) throw new Error("TestEngine.resolveFaces requires RollPlan.");
    const normalizedFaces = normalizeFaces(faces);
    if (normalizedFaces.length !== plan.finalPool) {
      throw new Error(`RollPlan expected ${plan.finalPool} dice, received ${normalizedFaces.length}.`);
    }
    const normalizedSupplementalFaces = normalizeFaces(supplementalFaces);
    const allFaces = Object.freeze([...normalizedFaces, ...normalizedSupplementalFaces]);
    const rawSuccesses = allFaces.filter(face => face >= plan.successThreshold).length;
    const finalSuccesses = Math.max(0, rawSuccesses + plan.successModifier);
    const isVersus = plan.context.type === "versus" || Boolean(plan.context.metadata?.versus);
    const targetSuccesses = isVersus ? plan.oppositionSuccesses : plan.obstacle;
    const delta = finalSuccesses - targetSuccesses;
    const outcome = delta > 0 || (!isVersus && delta === 0) ? "PASS" : delta === 0 ? "TIE" : "FAIL";
    return createTestResult({
      requestId: plan.requestId,
      context: plan.context.type,
      faces: normalizedFaces,
      supplementalFaces: normalizedSupplementalFaces,
      rawSuccesses,
      successModifier: plan.successModifier,
      finalSuccesses,
      targetSuccesses,
      outcome,
      margin: Math.abs(delta),
      provenance: {
        effects: plan.effects,
        plan: plan.provenance,
        signedDelta: delta,
        supplementalDice: normalizedSupplementalFaces.length,
        isVersus
      }
    });
  }

  resolveVersusTie(result, resolutionSpec = {}) {
    if (!result?.requestId) throw new Error("TestEngine.resolveVersusTie requires TestResult.");
    const isVersus = result.context === "versus" || Boolean(result.provenance?.isVersus);
    if (!isVersus) throw new Error("Versus tie resolution requires a versus TestResult.");

    const method = String(resolutionSpec?.method ?? "pending").trim().toLowerCase();
    const resolved = Boolean(resolutionSpec?.resolved);
    let outcome = result.outcome;
    let margin = result.margin;
    let ownTieSuccesses = null;
    let opponentTieSuccesses = null;

    if (!resolved || method === "pending" || method === "gm-decision") {
      outcome = "TIE";
      margin = 0;
    } else if (["trait", "second-trait", "gm-wins"].includes(method)) {
      outcome = "FAIL";
      margin = 0;
    } else if (method === "tiebreaker" || method === "second-fate") {
      ownTieSuccesses = countSuccesses(resolutionSpec?.ownTieFaces ?? [], 4);
      opponentTieSuccesses = countSuccesses(resolutionSpec?.oppTieFaces ?? [], 4);
      const delta = ownTieSuccesses - opponentTieSuccesses;
      outcome = delta > 0 ? "PASS" : delta < 0 ? "FAIL" : "TIE";
      margin = Math.abs(delta);
    } else if (method === "fate") {
      const own = Math.max(0, Math.trunc(finiteNumber(resolutionSpec?.finalOwnSuccesses, result.finalSuccesses)));
      const opponent = Math.max(0, Math.trunc(finiteNumber(resolutionSpec?.finalOpponentSuccesses, result.targetSuccesses)));
      const delta = own - opponent;
      outcome = delta > 0 ? "PASS" : delta < 0 ? "FAIL" : "TIE";
      margin = Math.abs(delta);
    } else {
      throw new Error(`Unsupported Versus tie resolution method: ${method}`);
    }

    return createTestResult({
      requestId: result.requestId,
      context: result.context,
      faces: result.faces,
      supplementalFaces: result.supplementalFaces,
      rawSuccesses: result.rawSuccesses,
      successModifier: result.successModifier,
      finalSuccesses: result.finalSuccesses,
      targetSuccesses: result.targetSuccesses,
      outcome,
      margin,
      provenance: {
        ...clone(result.provenance ?? {}),
        secondaryResolution: {
          method,
          resolved,
          ownTieSuccesses,
          opponentTieSuccesses,
          ownAbility: resolutionSpec?.ownAbility ?? null,
          opponentAbility: resolutionSpec?.oppAbility ?? null
        }
      }
    });
  }

  runDeterministic(requestSpec, planSpec, faces, resolveSpec = {}) {
    const prepared = this.prepare(requestSpec, planSpec);
    prepared.transaction.reserve().recordRoll(faces);
    const baseResult = this.resolveFaces(prepared.plan, faces, resolveSpec);
    const result = resolveSpec?.versusResolution
      ? this.resolveVersusTie(baseResult, resolveSpec.versusResolution)
      : baseResult;
    prepared.transaction.resolve(result);
    return Object.freeze({ ...prepared, result });
  }
}
