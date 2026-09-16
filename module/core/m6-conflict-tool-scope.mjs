export function applyExchangeToolScope(plan = [], weaponIds = {}, { defaultActorId = "" } = {}) {
  return (Array.isArray(plan) ? plan : []).map(entry => {
    const actorId = String(entry?.actorId ?? defaultActorId ?? "");
    return { ...entry, actorId, weaponId: String(weaponIds?.[actorId] ?? "") };
  });
}

export function exchangeToolScopeIsConsistent(plan = [], weaponIds = {}, { defaultActorId = "" } = {}) {
  return (Array.isArray(plan) ? plan : []).every(entry => {
    const actorId = String(entry?.actorId ?? defaultActorId ?? "");
    return String(entry?.weaponId ?? "") === String(weaponIds?.[actorId] ?? "");
  });
}
