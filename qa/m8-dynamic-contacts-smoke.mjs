import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createSocialNetworkServices,
  RelationshipRole,
  RelationshipStatus,
  RelationshipOrigin
} from "../module/core/m8-social-network.mjs";

function fakeActor() {
  const store = {};
  return {
    id: "RANGER-CONTACT",
    uuid: "Actor.RANGER-CONTACT",
    name: "Contact Tester",
    type: "character",
    system: { parents:"", seniorArtisan:"", mentor:"", friend:"", enemy:"" },
    getFlag(namespace,key) { return store?.[namespace]?.[key]; },
    async setFlag(namespace,key,value) {
      store[namespace] ??= {};
      store[namespace][key] = structuredClone(value);
      return value;
    }
  };
}

const actor = fakeActor();
const services = createSocialNetworkServices();

const first = await services.social.createContact(actor, {
  name: "Haldric",
  profession: "Smith",
  people: "Man",
  location: "Tharbad",
  notes: "Met during play",
  status: RelationshipStatus.NEUTRAL,
  origin: RelationshipOrigin.PLAY,
  createdBy: "GM1"
});
assert.equal(first.created, true);
assert.equal(first.duplicate, false);
assert.equal(first.relationship.role, RelationshipRole.CONTACT);
assert.equal(first.relationship.status, RelationshipStatus.NEUTRAL);
assert.equal(first.relationship.origin, RelationshipOrigin.PLAY);

const duplicate = await services.social.createContact(actor, {
  name: "Haldric",
  profession: "Smith",
  people: "Man",
  location: "Tharbad"
});
assert.equal(duplicate.created, false);
assert.equal(duplicate.duplicate, true);
assert.equal(services.social.people(actor).length, 1);
assert.equal(services.social.relationships(actor).length, 1);

const edited = await services.social.updatePerson(actor, first.person.id, {
  name: "Haldric",
  profession: "Master Smith",
  people: "Man",
  location: "Tharbad",
  notes: "Now trusted by the patrol"
});
assert.equal(edited.profession, "Master Smith");
assert.equal(edited.notes, "Now trusted by the patrol");
assert.equal(services.social.relationship(actor, first.relationship.id).status, RelationshipStatus.NEUTRAL);

const sheet = fs.readFileSync("sheets/actor-sheet.mjs","utf8");
for (const needle of [
  "createDynamicContact",
  "editDynamicContact",
  "createM8DynamicContact",
  "updateM8Person",
  "No NPC Actor was created"
]) assert.ok(sheet.includes(needle), `Missing qa.38 sheet marker: ${needle}`);

const template = fs.readFileSync("templates/actor/character.hbs","utf8");
assert.ok(template.includes("New Contact"));
assert.ok(template.includes("Edit Contact"));

console.log("PASS qa.38 Dynamic Contacts smoke");
