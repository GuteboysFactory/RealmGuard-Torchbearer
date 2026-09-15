function matchingSceneTokens(actorId, canvasRef) {
  const wanted = String(actorId ?? "");
  if (!wanted) return [];
  return (canvasRef?.tokens?.placeables ?? []).filter(token =>
    token?.actor && String(token?.document?.actorId ?? "") === wanted
  );
}

export function inspectConflictActorResolution(actorId, {
  gameRef = globalThis.game,
  canvasRef = globalThis.canvas
} = {}) {
  const id = String(actorId ?? "");
  const worldActor = id ? gameRef?.actors?.get?.(id) ?? null : null;
  const tokens = matchingSceneTokens(id, canvasRef);
  const controlledSet = new Set(canvasRef?.tokens?.controlled ?? []);
  const controlled = tokens.filter(token => controlledSet.has(token));

  let source = "WORLD_ACTOR";
  let token = null;
  if (controlled.length === 1) {
    source = "CONTROLLED_SCENE_TOKEN";
    token = controlled[0];
  } else if (tokens.length === 1) {
    source = "UNIQUE_SCENE_TOKEN";
    token = tokens[0];
  } else if (tokens.length > 1) {
    source = "AMBIGUOUS_SCENE_TOKENS";
  }

  return Object.freeze({
    actorId: id,
    source,
    actor: token?.actor ?? worldActor,
    worldActor,
    token: token ?? null,
    tokenCount: tokens.length,
    controlledTokenCount: controlled.length,
    tokenIds: Object.freeze(tokens.map(entry => String(entry?.id ?? entry?.document?.id ?? "")))
  });
}

export function resolveConflictActor(actorId, options = {}) {
  if (!actorId) return null;
  const result = inspectConflictActorResolution(actorId, options);
  if (result.source === "AMBIGUOUS_SCENE_TOKENS") {
    const logger = options?.logger ?? console;
    logger?.warn?.(
      `realm-guard | Conflict actor ${result.actorId} has ${result.tokenCount} matching active-scene tokens and none is uniquely controlled; using the world Actor as a safe fallback.`
    );
  }
  return result.actor ?? null;
}
