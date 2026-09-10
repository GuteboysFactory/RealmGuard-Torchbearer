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
  return deepFreeze({
    requestId: String(spec.requestId ?? ""),
    context: normalizeContext(spec.context ?? "ordinary"),
    faces: normalizeFaces(spec.faces ?? []),
    rawSuccesses: Math.max(0, Math.trunc(finiteNumber(spec.rawSuccesses, 0))),
    successModifier: Math.trunc(finiteNumber(spec.successModifier, 0)),
    finalSuccesses: Math.max(0, Math.trunc(finiteNumber(spec.finalSuccesses, 0))),
    targetSuccesses: Math.max(0, Math.trunc(finiteNumber(spec.targetSuccesses, 0))),
    outcome,
    margin: Math.trunc(finiteNumber(spec.margin, 0)),
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

  resolveFaces(plan, faces) {
    if (!plan?.requestId) throw new Error("TestEngine.resolveFaces requires RollPlan.");
    const normalizedFaces = normalizeFaces(faces);
    if (normalizedFaces.length !== plan.finalPool) {
      throw new Error(`RollPlan expected ${plan.finalPool} dice, received ${normalizedFaces.length}.`);
    }
    const rawSuccesses = normalizedFaces.filter(face => face >= plan.successThreshold).length;
    const finalSuccesses = Math.max(0, rawSuccesses + plan.successModifier);
    const isVersus = plan.context.type === "versus";
    const targetSuccesses = isVersus ? plan.oppositionSuccesses : plan.obstacle;
    const delta = finalSuccesses - targetSuccesses;
    const outcome = delta > 0 || (!isVersus && delta === 0) ? "PASS" : delta === 0 ? "TIE" : "FAIL";
    return createTestResult({
      requestId: plan.requestId,
      context: plan.context.type,
      faces: normalizedFaces,
      rawSuccesses,
      successModifier: plan.successModifier,
      finalSuccesses,
      targetSuccesses,
      outcome,
      margin: delta,
      provenance: {
        effects: plan.effects,
        plan: plan.provenance
      }
    });
  }

  runDeterministic(requestSpec, planSpec, faces) {
    const prepared = this.prepare(requestSpec, planSpec);
    prepared.transaction.reserve().recordRoll(faces);
    const result = this.resolveFaces(prepared.plan, faces);
    prepared.transaction.resolve(result);
    return Object.freeze({ ...prepared, result });
  }
}
