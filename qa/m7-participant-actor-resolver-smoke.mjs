import assert from "node:assert/strict";
import { participantActorReference, participantActors, resolveParticipantActor } from "../module/session-participants.mjs";

const worldActor = { id: "A1", uuid: "Actor.A1", name: "Dev Testsson", type: "character", isToken: false };
const syntheticActor = { id: "A1", uuid: "Scene.S1.Token.T1.Actor.A1", name: "Dev Testsson", type: "character", isToken: true };
const otherActor = { id: "A2", uuid: "Actor.A2", name: "Other Ranger", type: "character", isToken: false };

const gameRef = {
  actors: {
    filter: fn => [worldActor, otherActor].filter(fn),
    get: id => [worldActor, otherActor].find(actor => actor.id === id) ?? null
  }
};
const canvasRef = { tokens: { placeables: [{ actor: syntheticActor }, { actor: otherActor }] } };

const participants = participantActors({ gameRef, canvasRef });
assert.equal(participants.length, 2);
assert.equal(participants.find(actor => actor.id === "A1"), syntheticActor, "Scene participant must preserve synthetic Token Actor instance");
assert.equal(participantActorReference(syntheticActor), "Scene.S1.Token.T1.Actor.A1");
assert.equal(resolveParticipantActor("Scene.S1.Token.T1.Actor.A1", { gameRef, canvasRef }), syntheticActor);
assert.equal(resolveParticipantActor("A1", { gameRef, canvasRef }), syntheticActor, "Legacy id lookup must prefer active scene participant before world Actor fallback");

const noScene = { tokens: { placeables: [] } };
assert.equal(resolveParticipantActor("A1", { gameRef, canvasRef: noScene }), worldActor);

console.log("PASS m7-participant-actor-resolver-smoke");
