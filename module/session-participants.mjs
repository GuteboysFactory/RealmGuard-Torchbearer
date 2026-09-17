export function participantActorReference(actor) {
  return String(actor?.uuid ?? actor?.id ?? "");
}

export function participantActors({ gameRef = globalThis.game, canvasRef = globalThis.canvas } = {}) {
  const seen = new Set();
  const actors = [];

  for (const token of canvasRef?.tokens?.placeables ?? []) {
    const actor = token?.actor;
    if (!actor || actor.type !== "character" || seen.has(actor.id)) continue;
    seen.add(actor.id);
    actors.push(actor);
  }

  if (!actors.length) {
    for (const actor of gameRef?.actors?.filter?.(entry => entry.type === "character") ?? []) {
      if (seen.has(actor.id)) continue;
      seen.add(actor.id);
      actors.push(actor);
    }
  }

  return actors.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
}

export function resolveParticipantActor(reference, { gameRef = globalThis.game, canvasRef = globalThis.canvas } = {}) {
  const ref = String(reference ?? "");
  if (!ref) return null;

  const participants = participantActors({ gameRef, canvasRef });
  const exact = participants.find(actor => participantActorReference(actor) === ref);
  if (exact) return exact;

  const byId = participants.find(actor => String(actor?.id ?? "") === ref);
  if (byId) return byId;

  try {
    const resolved = globalThis.fromUuidSync?.(ref);
    if (resolved?.documentName === "Actor" || resolved?.type === "character") return resolved;
  } catch (_error) { /* fall through to world Actor lookup */ }

  return gameRef?.actors?.get?.(ref) ?? null;
}
