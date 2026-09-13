export const CORE_EVENTS = Object.freeze({
  TEST_PREPARED: "TEST_PREPARED",
  TEST_RESOLVED: "TEST_RESOLVED",
  RESOURCE_SPENT: "RESOURCE_SPENT",
  ADVANCEMENT_GAINED: "ADVANCEMENT_GAINED",
  CONDITION_APPLIED: "CONDITION_APPLIED",
  CONDITION_REMOVED: "CONDITION_REMOVED",
  NATURE_TAXED: "NATURE_TAXED"
});

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

export class CoreEventBus {
  constructor() {
    this.listeners = new Map();
    this.sequence = 0;
  }

  on(type, listener) {
    const key = String(type ?? "").trim();
    if (!key) throw new Error("CoreEventBus.on requires an event type.");
    if (typeof listener !== "function") throw new Error("CoreEventBus.on requires a listener function.");
    const set = this.listeners.get(key) ?? new Set();
    set.add(listener);
    this.listeners.set(key, set);
    return () => this.off(key, listener);
  }

  off(type, listener) {
    const key = String(type ?? "").trim();
    const set = this.listeners.get(key);
    if (!set) return false;
    const removed = set.delete(listener);
    if (!set.size) this.listeners.delete(key);
    return removed;
  }

  emit(type, payload = {}, metadata = {}) {
    const key = String(type ?? "").trim();
    if (!key) throw new Error("CoreEventBus.emit requires an event type.");
    const event = deepFreeze({
      id: String(metadata.id ?? `core-event-${Date.now()}-${++this.sequence}`),
      type: key,
      timestamp: String(metadata.timestamp ?? new Date().toISOString()),
      payload: clone(payload),
      metadata: clone(metadata)
    });
    const errors = [];
    for (const listener of this.listeners.get(key) ?? []) {
      try { listener(event); }
      catch (error) { errors.push(error); }
    }
    return deepFreeze({ event, delivered: (this.listeners.get(key) ?? new Set()).size, errors });
  }

  listenerCount(type = null) {
    if (type !== null) return this.listeners.get(String(type))?.size ?? 0;
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}

const coreEventBus = new CoreEventBus();

export function getCoreEventBus() {
  return coreEventBus;
}
