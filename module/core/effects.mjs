export const EFFECT_TYPES = Object.freeze({
  DICE_MODIFIER: "DICE_MODIFIER",
  SUCCESS_MODIFIER: "SUCCESS_MODIFIER",
  REROLL: "REROLL",
  OPEN_SIX: "OPEN_SIX",
  CAPABILITY_BLOCK: "CAPABILITY_BLOCK",
  RESOURCE_COST: "RESOURCE_COST",
  RESOURCE_GRANT: "RESOURCE_GRANT",
  DISPOSITION: "DISPOSITION",
  DAMAGE_ABSORB: "DAMAGE_ABSORB",
  SCALE_MODIFIER: "SCALE_MODIFIER",
  CURRENCY: "CURRENCY",
  COST_OVERRIDE: "COST_OVERRIDE",
  STATE_CHANGE: "STATE_CHANGE",
  MANUAL: "MANUAL"
});

export const EFFECT_TIMINGS = Object.freeze({
  PASSIVE: "PASSIVE",
  PRE_ROLL: "PRE_ROLL",
  POST_ROLL: "POST_ROLL",
  PRE_RESOLVE: "PRE_RESOLVE",
  POST_RESOLVE: "POST_RESOLVE",
  ON_COMMIT: "ON_COMMIT",
  MANUAL: "MANUAL"
});

export const EFFECT_STACKING = Object.freeze({
  STACK: "STACK",
  MAX: "MAX",
  MIN: "MIN",
  REPLACE: "REPLACE"
});

const VALID_STACKING = new Set(Object.values(EFFECT_STACKING));

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

function normalizeList(value, fallback = []) {
  if (value === undefined || value === null) return [...fallback];
  const list = Array.isArray(value) ? value : [value];
  return list.map(entry => String(entry).trim()).filter(Boolean);
}

function getPath(target, path) {
  return String(path ?? "").split(".").filter(Boolean).reduce((value, key) => value?.[key], target);
}

export function defaultRequirementEvaluator(requirement, context) {
  if (!requirement) return true;
  if (typeof requirement === "function") return Boolean(requirement(context));
  if (typeof requirement !== "object") return Boolean(requirement);

  const actual = getPath(context, requirement.path);
  const expected = requirement.value;
  switch (String(requirement.op ?? "eq").toLowerCase()) {
    case "eq": return actual === expected;
    case "neq": return actual !== expected;
    case "truthy": return Boolean(actual);
    case "falsy": return !actual;
    case "in": return Array.isArray(expected) && expected.includes(actual);
    case "includes": return Array.isArray(actual) ? actual.includes(expected) : String(actual ?? "").includes(String(expected ?? ""));
    case "gte": return Number(actual) >= Number(expected);
    case "lte": return Number(actual) <= Number(expected);
    default: throw new Error(`Unknown Effect requirement operator: ${requirement.op}`);
  }
}

export function createEffect(spec = {}) {
  const id = String(spec.id ?? "").trim();
  const type = String(spec.type ?? "").trim().toUpperCase();
  if (!id) throw new Error("Effect requires a stable id.");
  if (!type) throw new Error(`Effect ${id} requires a type.`);

  const stacking = String(spec.stacking ?? EFFECT_STACKING.STACK).trim().toUpperCase();
  if (!VALID_STACKING.has(stacking)) throw new Error(`Effect ${id} has unsupported stacking mode: ${stacking}`);

  return deepFreeze({
    id,
    type,
    value: clone(spec.value ?? null),
    timing: String(spec.timing ?? EFFECT_TIMINGS.PASSIVE).trim().toUpperCase(),
    appliesTo: normalizeList(spec.appliesTo, ["*"]),
    excludes: normalizeList(spec.excludes),
    requirements: Array.isArray(spec.requirements) ? clone(spec.requirements) : (spec.requirements ? [clone(spec.requirements)] : []),
    source: deepFreeze(clone(spec.source ?? {})),
    stacking,
    duration: deepFreeze(clone(spec.duration ?? null)),
    metadata: deepFreeze(clone(spec.metadata ?? {}))
  });
}

function contextTags(context = {}) {
  const tags = new Set(normalizeList(context.tags));
  for (const key of ["domain", "context", "action", "sourceType", "targetType"]) {
    if (context[key]) tags.add(String(context[key]));
  }
  return tags;
}

function tokenMatches(tokens, tags) {
  if (!tokens.length) return false;
  if (tokens.includes("*")) return true;
  return tokens.some(token => tags.has(token));
}

export function effectApplies(effect, context = {}, requirementEvaluator = defaultRequirementEvaluator) {
  const tags = contextTags(context);
  if (!tokenMatches(effect.appliesTo, tags)) return false;
  if (effect.excludes.length && tokenMatches(effect.excludes, tags)) return false;
  return effect.requirements.every(requirement => requirementEvaluator(requirement, context));
}

function normalizeProvider(provider) {
  if (!provider || typeof provider !== "object") throw new Error("Effect provider must be an object.");
  const id = String(provider.id ?? "").trim();
  if (!id) throw new Error("Effect provider requires id.");
  const collect = provider.collect ?? provider.getEffects;
  if (typeof collect !== "function") throw new Error(`Effect provider ${id} requires collect(context).`);
  return Object.freeze({
    id,
    label: String(provider.label ?? id),
    priority: Number.isFinite(Number(provider.priority)) ? Number(provider.priority) : 100,
    collect: collect.bind(provider)
  });
}

export class EffectEngine {
  #providers = new Map();
  #requirementEvaluator;

  constructor({ requirementEvaluator = defaultRequirementEvaluator } = {}) {
    if (typeof requirementEvaluator !== "function") throw new Error("EffectEngine requirementEvaluator must be a function.");
    this.#requirementEvaluator = requirementEvaluator;
  }

  registerProvider(provider) {
    const normalized = normalizeProvider(provider);
    if (this.#providers.has(normalized.id)) throw new Error(`Effect provider already registered: ${normalized.id}`);
    this.#providers.set(normalized.id, normalized);
    return normalized;
  }

  unregisterProvider(providerId) {
    return this.#providers.delete(String(providerId));
  }

  clearProviders() {
    this.#providers.clear();
  }

  listProviders() {
    return [...this.#providers.values()]
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
      .map(provider => Object.freeze({ id: provider.id, label: provider.label, priority: provider.priority }));
  }

  collect(context = {}, { types = null, timings = null, providerIds = null } = {}) {
    const typeFilter = types ? new Set(normalizeList(types).map(value => value.toUpperCase())) : null;
    const timingFilter = timings ? new Set(normalizeList(timings).map(value => value.toUpperCase())) : null;
    const providerFilter = providerIds ? new Set(normalizeList(providerIds)) : null;
    const collected = [];

    const providers = [...this.#providers.values()].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    for (const provider of providers) {
      if (providerFilter && !providerFilter.has(provider.id)) continue;
      const supplied = provider.collect(context);
      if (supplied && typeof supplied.then === "function") {
        throw new Error(`Effect provider ${provider.id} returned a Promise. M2 collect() is synchronous by design.`);
      }
      const entries = Array.isArray(supplied) ? supplied : (supplied ? [supplied] : []);
      entries.forEach((entry, index) => {
        const effect = createEffect({
          ...entry,
          id: entry?.id ?? `${provider.id}:${index}`,
          source: {
            providerId: provider.id,
            providerLabel: provider.label,
            ...(entry?.source ?? {})
          }
        });
        if (typeFilter && !typeFilter.has(effect.type)) return;
        if (timingFilter && !timingFilter.has(effect.timing)) return;
        if (!effectApplies(effect, context, this.#requirementEvaluator)) return;
        collected.push(effect);
      });
    }

    return Object.freeze(collected);
  }

  collectByType(type, context = {}, options = {}) {
    return this.collect(context, { ...options, types: [type] });
  }

  summarizeNumeric(type, context = {}, options = {}) {
    const effects = this.collectByType(type, context, options).filter(effect => Number.isFinite(Number(effect.value)));
    let total = 0;
    let hasValue = false;
    for (const effect of effects) {
      const value = Number(effect.value);
      if (!hasValue) {
        total = value;
        hasValue = true;
        continue;
      }
      switch (effect.stacking) {
        case EFFECT_STACKING.MAX: total = Math.max(total, value); break;
        case EFFECT_STACKING.MIN: total = Math.min(total, value); break;
        case EFFECT_STACKING.REPLACE: total = value; break;
        default: total += value; break;
      }
    }
    return Object.freeze({ type: String(type).toUpperCase(), value: hasValue ? total : 0, effects });
  }
}
