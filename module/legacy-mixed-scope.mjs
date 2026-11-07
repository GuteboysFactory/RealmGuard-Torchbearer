// Read the registered world setting at the time of use, never during module import.
// Unknown profiles fail closed. Changing profiles already requires a world reload.
export function legacyMixedPolishEnabled() {
  try { return game.settings.get("realm-guard", "activeRulesProfileId") === "realm-guard-legacy-mixed"; }
  catch { return false; }
}

// Keep the 1.13.1 implementations for other profiles, including callbacks captured
// by ApplicationV2's action map. Frozen source copies are documented alongside them.
export function scopeLegacyMixedClass(Current, Baseline) {
  const wrap = (current, baseline) => function (...args) {
    return (legacyMixedPolishEnabled() ? current : baseline).apply(this, args);
  };
  for (const [target, original] of [[Current.prototype, Baseline.prototype], [Current, Baseline]]) {
    for (const name of Object.getOwnPropertyNames(original)) {
      if (["constructor", "name", "length", "prototype"].includes(name)) continue;
      const before = Object.getOwnPropertyDescriptor(original, name);
      const after = Object.getOwnPropertyDescriptor(target, name);
      if (typeof before.value !== "function" || typeof after?.value !== "function") continue;
      if (String(before.value) === String(after.value)) continue;
      Object.defineProperty(target, name, { ...after, value: wrap(after.value, before.value) });
    }
  }
  const actions = Current.DEFAULT_OPTIONS?.actions;
  const oldActions = Baseline.DEFAULT_OPTIONS?.actions;
  if (actions && oldActions) for (const name of Object.keys(actions)) {
    if (typeof actions[name] === "function" && typeof oldActions[name] === "function") {
      actions[name] = wrap(actions[name], oldActions[name]);
    }
  }
}
