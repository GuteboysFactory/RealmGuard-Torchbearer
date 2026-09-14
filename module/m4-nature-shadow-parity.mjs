import { NatureService } from "./core/m4-services.mjs";

const nature = new NatureService();
const history = [];
const applyTrace = new WeakMap();
const ROLL_METHODS = Object.freeze(["rollRole", "rollAbility", "rollBeginnerLuck", "rollAutomaticVersus", "rollNatureVersus"]);
let installed = false;
let applyWrapped = false;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const entry of Object.values(value)) freeze(entry);
  return Object.freeze(value);
}

function state(actor) {
  const n = actor?.system?.attributes?.nature ?? {};
  const current = Math.max(0, Number(n.value ?? 0));
  const maximum = Math.max(current, Number(n.maximum ?? current));
  return freeze({ current, maximum, tax: Math.max(0, maximum - current) });
}

function preview(before, amount) {
  const actor = { system: { attributes: { nature: { value: before.current, maximum: before.maximum } } } };
  return nature.previewTax(actor, amount);
}

function resultLike(result) {
  return Boolean(result && typeof result === "object" && (typeof result.passed === "boolean" || result.outcome || result.tied));
}

export function natureExpectation(method, args = [], result = {}) {
  const tied = Boolean(result?.tied) || String(result?.outcome ?? "").toUpperCase() === "TIE";
  if (!resultLike(result)) return freeze({ observe: false, reason: "NO_COMPLETED_TEST" });

  if (method === "rollRole") {
    const options = args[1] ?? {};
    if (!options.tapNature) return freeze({ observe: false, reason: "NATURE_NOT_USED" });
    const scope = String(options.natureScope ?? "within");
    return freeze({ observe: true, mode: "tap", scope, doubleTap: false, expectedTax: nature.taxForResult(result, { tapped: true, scope }), tied });
  }

  if (method === "rollAbility") {
    const key = String(args[0] ?? "").toLowerCase();
    const options = args[1] ?? {};
    if (key === "nature") {
      const scope = String(options.natureUse ?? "within");
      const doubleTap = Boolean(options.doubleTapNature);
      return freeze({ observe: true, mode: "direct", scope, doubleTap, expectedTax: nature.taxForResult(result, { direct: true, scope, doubleTap }), tied });
    }
    if (!options.tapNature) return freeze({ observe: false, reason: "NATURE_NOT_USED" });
    const scope = String(options.natureScope ?? "within");
    return freeze({ observe: true, mode: "tap", scope, doubleTap: false, expectedTax: nature.taxForResult(result, { tapped: true, scope }), tied });
  }

  if (method === "rollBeginnerLuck") {
    const options = args[1] ?? {};
    if (!options.tapNature) return freeze({ observe: false, reason: "NATURE_NOT_USED" });
    const scope = String(options.natureScope ?? "within");
    return freeze({ observe: true, mode: "tap", scope, doubleTap: false, expectedTax: nature.taxForResult(result, { tapped: true, scope }), tied });
  }

  if (method === "rollAutomaticVersus") {
    const options = args[3] ?? {};
    if (!options.tapNature) return freeze({ observe: false, reason: "NATURE_NOT_USED" });
    const scope = String(options.natureScope ?? "within");
    return freeze({ observe: true, mode: "tap", scope, doubleTap: false, expectedTax: nature.taxForResult(result, { tapped: true, scope }), tied });
  }

  if (method === "rollNatureVersus") {
    const options = args[1] ?? {};
    const scope = String(options.natureUse ?? "within");
    const doubleTap = Boolean(options.doubleTapNature);
    return freeze({ observe: true, mode: "direct-versus", scope, doubleTap, expectedTax: nature.taxForResult(result, { direct: true, scope, doubleTap }), tied });
  }

  return freeze({ observe: false, reason: "UNSUPPORTED_METHOD" });
}

export function compareNatureObservation({ before, after, expectedTax = 0, appliedTax = 0 } = {}) {
  const expected = preview(before, expectedTax);
  const fields = freeze({
    tax: Number(appliedTax) === Number(expectedTax),
    current: Number(after?.current) === Number(expected.current),
    maximum: Number(after?.maximum) === Number(expected.maximum),
    collapsed: Boolean(expected.collapsed) === Boolean(Number(before?.maximum) > Number(after?.maximum))
  });
  return freeze({
    match: Object.values(fields).every(Boolean),
    fields,
    expected: freeze({ tax: Number(expectedTax), current: expected.current, maximum: expected.maximum, collapsed: expected.collapsed }),
    actual: freeze({ tax: Number(appliedTax), current: Number(after?.current ?? 0), maximum: Number(after?.maximum ?? 0), collapsed: Number(before?.maximum ?? 0) > Number(after?.maximum ?? 0) })
  });
}

function push(entry) {
  history.push(freeze(entry));
  while (history.length > 100) history.shift();
  return history.at(-1);
}

function installApplyTrace(ActorClass) {
  const original = ActorClass?.prototype?._applyNatureTax;
  if (typeof original !== "function" || original._rgM4NatureApplyWrapped) return;
  const wrapped = async function(amount, reason = "Nature Tax") {
    const before = state(this);
    const result = await original.call(this, amount, reason);
    const after = state(this);
    applyTrace.set(this, freeze({ amount: Math.max(0, Number(amount ?? 0)), reason: String(reason ?? ""), before, after, result }));
    return result;
  };
  Object.defineProperty(wrapped, "_rgM4NatureApplyWrapped", { value: true });
  ActorClass.prototype._applyNatureTax = wrapped;
  applyWrapped = true;
}

function installRollObservers(ActorClass) {
  for (const method of ROLL_METHODS) {
    const original = ActorClass?.prototype?.[method];
    if (typeof original !== "function" || original._rgM4NatureParityWrapped) continue;
    const wrapped = async function(...args) {
      const before = state(this);
      applyTrace.delete(this);
      const result = await original.apply(this, args);
      const expectation = natureExpectation(method, args, result);
      if (!expectation.observe) return result;
      const after = state(this);
      const applied = applyTrace.get(this) ?? null;
      const comparison = compareNatureObservation({ before, after, expectedTax: expectation.expectedTax, appliedTax: applied?.amount ?? 0 });
      push({
        id: `m4-nature-${Date.now()}-${history.length + 1}`,
        actorId: this.id ?? null,
        actorName: String(this.name ?? ""),
        method,
        mode: expectation.mode,
        scope: expectation.scope,
        doubleTap: expectation.doubleTap,
        outcome: String(result?.outcome ?? (result?.tied ? "TIE" : result?.passed ? "PASS" : "FAIL")).toUpperCase(),
        margin: Math.max(0, Number(result?.margin ?? 0)),
        before,
        after,
        appliedReason: applied?.reason ?? null,
        status: comparison.match ? "MATCH" : "MISMATCH",
        comparison,
        liveApplication: false,
        authority: "LEGACY_MIXED"
      });
      return result;
    };
    Object.defineProperty(wrapped, "_rgM4NatureParityWrapped", { value: true });
    ActorClass.prototype[method] = wrapped;
  }
}

export function getM4NatureParityStatus() {
  return freeze({
    mode: "REAL_LEGACY_NATURE_SHADOW_PARITY",
    liveApplication: false,
    authority: "LEGACY_MIXED",
    installed,
    applyWrapped,
    observedMethods: [...ROLL_METHODS],
    comparedFields: ["tax", "current", "maximum", "collapsed"]
  });
}

export function getM4NatureParityHistory() { return Object.freeze([...history]); }
export function getM4NatureParityLatest() { return history.at(-1) ?? null; }
export function clearM4NatureParity() { history.splice(0); return getM4NatureParityHistory(); }
export function getM4NatureParitySummary() {
  return freeze({
    observed: history.length,
    matches: history.filter(entry => entry.status === "MATCH").length,
    mismatches: history.filter(entry => entry.status === "MISMATCH").length,
    latest: getM4NatureParityLatest()
  });
}

export function installM4NatureShadowParity(ActorClass) {
  Hooks.once("ready", () => {
    installApplyTrace(ActorClass);
    installRollObservers(ActorClass);
    installed = true;
    console.log("realm-guard | CORE M4 Nature real shadow parity ready", getM4NatureParityStatus());
  });
}
