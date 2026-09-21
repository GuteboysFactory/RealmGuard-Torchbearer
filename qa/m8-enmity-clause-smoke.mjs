import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createSocialNetworkServices,
  RelationshipRole,
  RelationshipStatus,
  RelationshipOrigin
} from "../module/core/m8-social-network.mjs";

function fakeActor(id = "RANGER-ENMITY") {
  const store = {};
  return {
    id,
    uuid: `Actor.${id}`,
    name: "Enmity Tester",
    type: "character",
    system: { parents:"", seniorArtisan:"", mentor:"", friend:"", enemy:"" },
    getFlag(ns,key) { return store?.[ns]?.[key]; },
    async setFlag(ns,key,value) {
      store[ns] ??= {};
      store[ns][key] = structuredClone(value);
      return value;
    }
  };
}

const actor = fakeActor();
const services = createSocialNetworkServices();

const created = await services.social.createEnemy(actor, {
  name: "Varic",
  profession: "Trader",
  people: "Man",
  location: "North Road",
  notes: "Created by failed Circles",
  reason: "Enmity Clause",
  createdBy: "GM1"
});
assert.equal(created.created, true);
assert.equal(created.relationship.role, RelationshipRole.ENEMY);
assert.equal(created.relationship.status, RelationshipStatus.HOSTILE);
assert.equal(created.relationship.origin, RelationshipOrigin.ENMITY);
assert.equal(services.social.people(actor).length, 1);
assert.equal(services.social.relationships(actor).length, 1);

const duplicateEnemy = await services.social.createEnemy(actor, {
  name: "Varic",
  profession: "Trader",
  people: "Man",
  location: "North Road"
});
assert.equal(duplicateEnemy.created, false);
assert.equal(duplicateEnemy.duplicate, true);
assert.equal(services.social.people(actor).length, 1);
assert.equal(services.social.relationships(actor).length, 1);

const actor2 = fakeActor("RANGER-ENMITY-REUSE");
const services2 = createSocialNetworkServices();
const contact = await services2.social.createContact(actor2, {
  name: "Maera",
  profession: "Guide",
  people: "Man",
  location: "Tharbad",
  status: RelationshipStatus.NEUTRAL,
  origin: RelationshipOrigin.PLAY
});
const reused = await services2.social.createEnemy(actor2, {
  name: "Maera",
  profession: "Guide",
  people: "Man",
  location: "Tharbad",
  reason: "Betrayed the patrol",
  sessionId: "Session 9"
});
assert.equal(reused.created, false);
assert.equal(reused.reused, true);
assert.equal(reused.relationship.id, contact.relationship.id);
assert.equal(reused.relationship.role, RelationshipRole.ENEMY);
assert.equal(reused.relationship.status, RelationshipStatus.HOSTILE);
assert.equal(reused.relationship.origin, RelationshipOrigin.ENMITY);
assert.equal(reused.relationship.history.length, 1);
assert.equal(reused.relationship.history[0].from, RelationshipStatus.NEUTRAL);
assert.equal(reused.relationship.history[0].to, RelationshipStatus.HOSTILE);
assert.equal(services2.social.people(actor2).length, 1);
assert.equal(services2.social.relationships(actor2).length, 1);

const service = fs.readFileSync("module/m8-social-network-service.mjs","utf8");
for (const needle of [
  "createM8EnmityEnemy",
  "requestM8EnmityDecision",
  "m8-enmity-request",
  "Invoke Enmity Clause",
  "Normal Failure",
  "Create Enemy",
  '"EnmityClause"'
]) assert.ok(service.includes(needle), `Missing qa.41 service marker: ${needle}`);

const sheet = fs.readFileSync("sheets/actor-sheet.mjs","utf8");
for (const needle of [
  "requestM8EnmityDecision",
  "normal failure or may invoke the Enmity Clause"
]) assert.ok(sheet.includes(needle), `Missing qa.41 sheet marker: ${needle}`);

console.log("PASS qa.41 Enmity Clause smoke");
