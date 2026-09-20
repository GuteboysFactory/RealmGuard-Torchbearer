import assert from "node:assert/strict";
import {
  buildLegacySocialNetworkSnapshot,
  createSocialNetworkServices,
  RelationshipRole,
  RelationshipStatus,
  RelationshipOrigin,
  SOCIAL_NETWORK_SCHEMA_VERSION
} from "../module/core/m8-social-network.mjs";

function fakeActor({
  id = "RANGER1",
  uuid = "Actor.RANGER1",
  name = "Aranor",
  system = {},
  flags = {}
} = {}) {
  const store = structuredClone(flags);
  return {
    id,
    uuid,
    name,
    type: "character",
    system: {
      parents: "",
      seniorArtisan: "",
      mentor: "",
      friend: "",
      enemy: "",
      ...system
    },
    getFlag(namespace, key) {
      return store?.[namespace]?.[key];
    },
    async setFlag(namespace, key, value) {
      store[namespace] ??= {};
      store[namespace][key] = structuredClone(value);
      return value;
    },
    _flags: store
  };
}

const actor = fakeActor({
  system: {
    parents: "Mom: Arwen; Dad: Halbarad",
    seniorArtisan: "Beren - Smith",
    mentor: "Elladan",
    friend: "Barliman, Innkeeper, Bree",
    enemy: "Gorbag, Orc, North Downs"
  },
  flags: {
    "realm-guard": {
      recruitmentVersion: "0.19.0",
      recruitmentMother: "Arwen",
      recruitmentFather: "Halbarad"
    }
  }
});

const preview = buildLegacySocialNetworkSnapshot(actor);
assert.equal(preview.schemaVersion, SOCIAL_NETWORK_SCHEMA_VERSION);
assert.equal(preview.metadata.gameplayAuthority, "LEGACY_MIXED");
assert.equal(preview.metadata.legacyFieldsPreserved, true);
assert.equal(preview.people.length, 6);
assert.equal(preview.relationships.length, 6);

const mother = preview.relationships.find(entry => entry.source?.slot === "parent-mother");
const father = preview.relationships.find(entry => entry.source?.slot === "parent-father");
const artisan = preview.relationships.find(entry => entry.role === RelationshipRole.SENIOR_ARTISAN);
const friend = preview.relationships.find(entry => entry.role === RelationshipRole.FRIEND);
const enemy = preview.relationships.find(entry => entry.role === RelationshipRole.ENEMY);

assert.ok(mother);
assert.ok(father);
assert.equal(artisan.origin, RelationshipOrigin.RECRUITMENT);
assert.equal(friend.status, RelationshipStatus.FRIENDLY);
assert.equal(enemy.status, RelationshipStatus.HOSTILE);

const artisanPerson = preview.people.find(entry => entry.id === artisan.personId);
assert.equal(artisanPerson.name, "Beren");
assert.equal(artisanPerson.profession, "Smith");

const friendPerson = preview.people.find(entry => entry.id === friend.personId);
assert.equal(friendPerson.name, "Barliman");
assert.equal(friendPerson.profession, "Innkeeper");
assert.equal(friendPerson.location, "Bree");

const enemyPerson = preview.people.find(entry => entry.id === enemy.personId);
assert.equal(enemyPerson.name, "Gorbag");
assert.equal(enemyPerson.people, "Orc");
assert.equal(enemyPerson.location, "North Downs");

// Deterministic IDs and no accidental person-name dedupe.
const secondPreview = buildLegacySocialNetworkSnapshot(actor);
assert.deepEqual(
  preview.people.map(entry => entry.id),
  secondPreview.people.map(entry => entry.id)
);
assert.deepEqual(
  preview.relationships.map(entry => entry.id),
  secondPreview.relationships.map(entry => entry.id)
);

// Conservative fallback: arbitrary legacy strings remain raw instead of being over-parsed.
const legacy = fakeActor({
  id: "OLD1",
  uuid: "Actor.OLD1",
  system: {
    parents: "The folk of House Ruor, somewhere in the North",
    friend: "Old companion from the Greenway",
    enemy: "A shadow from long ago"
  }
});
const legacyPreview = buildLegacySocialNetworkSnapshot(legacy);
assert.equal(legacyPreview.people.length, 3);
assert.equal(legacyPreview.relationships.length, 3);
assert.ok(legacyPreview.people.every(entry => entry.source?.confidence === "LOW_RAW"));

// Repository migration is explicit, non-destructive and idempotent.
const services = createSocialNetworkServices();
const firstMigration = await services.repository.ensureMigrated(actor);
assert.equal(firstMigration.created, true);
assert.equal(actor.system.friend, "Barliman, Innkeeper, Bree");
assert.equal(actor.system.enemy, "Gorbag, Orc, North Downs");

const secondMigration = await services.repository.ensureMigrated(actor);
assert.equal(secondMigration.created, false);
assert.deepEqual(
  firstMigration.snapshot.relationships.map(entry => entry.id),
  secondMigration.snapshot.relationships.map(entry => entry.id)
);

// Status changes append history instead of replacing provenance.
const friendRel = firstMigration.snapshot.relationships.find(entry => entry.role === RelationshipRole.FRIEND);
const updated = await services.social.updateRelationshipStatus(actor, friendRel.id, RelationshipStatus.ESTRANGED, {
  reason: "Fell out after the winter patrol",
  sessionId: "session-7",
  source: "PLAY",
  timestamp: "2026-09-20T12:00:00.000Z"
});
assert.equal(updated.status, RelationshipStatus.ESTRANGED);
assert.equal(updated.history.length, 1);
assert.equal(updated.history[0].from, RelationshipStatus.FRIENDLY);
assert.equal(updated.history[0].to, RelationshipStatus.ESTRANGED);
assert.equal(updated.history[0].sessionId, "session-7");

// Person -> Actor linkage remains optional and does not create an NPC.
const linked = await services.social.linkActor(actor, friendRel.personId, "Actor.NPC123");
assert.equal(linked.actorUuid, "Actor.NPC123");

const stored = services.repository.readStored(actor);
assert.equal(stored.people.find(entry => entry.id === friendRel.personId)?.actorUuid, "Actor.NPC123");
assert.equal(actor.system.friend, "Barliman, Innkeeper, Bree");

console.log("PASS M8 Social Network foundation smoke");
