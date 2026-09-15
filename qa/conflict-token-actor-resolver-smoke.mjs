import assert from "node:assert/strict";
import { inspectConflictActorResolution, resolveConflictActor } from "../module/conflict-actor-resolver.mjs";

const world = { id: "A1", name: "World Dev" };
const tokenActor = { id: "A1", name: "Token Dev", isToken: true };
const token = { id: "T1", actor: tokenActor, document: { id: "T1", actorId: "A1", actorLink: false } };
const gameRef = { actors: { get: id => id === "A1" ? world : null } };
const canvasRef = { tokens: { placeables: [token], controlled: [] } };
const inspected = inspectConflictActorResolution("A1", { gameRef, canvasRef });
assert.equal(inspected.source, "UNIQUE_SCENE_TOKEN");
assert.equal(resolveConflictActor("A1", { gameRef, canvasRef }), tokenActor);
const ambiguousCanvas = { tokens: { placeables: [token, { ...token, id: "T2", actor: { ...tokenActor, name: "Token Dev 2" }, document: { id: "T2", actorId: "A1", actorLink: false } }], controlled: [] } };
assert.equal(inspectConflictActorResolution("A1", { gameRef, canvasRef: ambiguousCanvas }).source, "AMBIGUOUS_SCENE_TOKENS");
assert.equal(resolveConflictActor("A1", { gameRef, canvasRef: ambiguousCanvas, logger: { warn() {} } }), world);
console.log("PASS conflict-token-actor-resolver-smoke");
