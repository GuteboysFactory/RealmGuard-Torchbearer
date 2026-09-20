import {
  createSocialNetworkServices,
  buildLegacySocialNetworkSnapshot,
  SOCIAL_NETWORK_SCHEMA_VERSION,
  SOCIAL_NETWORK_MIGRATION_VERSION,
  RelationshipRole,
  RelationshipStatus,
  RelationshipOrigin
} from "./core/m8-social-network.mjs";

let runtime = null;

function services() {
  if (!runtime) runtime = createSocialNetworkServices();
  return runtime;
}

function actorRef(actorOrId) {
  if (!actorOrId) return null;
  if (typeof actorOrId === "object") return actorOrId;
  return game.actors?.get?.(String(actorOrId))
    ?? game.actors?.contents?.find?.(actor => actor.uuid === String(actorOrId))
    ?? null;
}

function eligibleActors() {
  return Object.freeze((game.actors?.contents ?? []).filter(actor => actor.type === "character"));
}

function previewActor(actorOrId) {
  const actor = actorRef(actorOrId);
  if (!actor) return null;
  const current = services();
  const stored = current.repository.readStored(actor);
  const fallback = buildLegacySocialNetworkSnapshot(actor);
  return Object.freeze({
    actorId: actor.id ?? "",
    actorUuid: actor.uuid ?? "",
    actorName: actor.name ?? "",
    stored: Boolean(stored),
    schemaVersion: stored?.schemaVersion ?? fallback.schemaVersion,
    migrationVersion: stored?.migrationVersion ?? fallback.migrationVersion,
    personCount: (stored ?? fallback).people.length,
    relationshipCount: (stored ?? fallback).relationships.length,
    people: (stored ?? fallback).people,
    relationships: (stored ?? fallback).relationships,
    legacyFieldsPreserved: true,
    gameplayAuthority: "LEGACY_MIXED",
    liveCirclesIntegration: false,
    automaticNpcCreation: false
  });
}

async function migrateActor(actorOrId) {
  if (!game.user?.isGM) throw new Error("M8 Social Network migration is GM-only.");
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor for M8 migration.");
  if (actor.type !== "character") throw new Error("M8 Social Network migration currently targets Ranger character Actors only.");
  const result = await services().repository.ensureMigrated(actor);
  return Object.freeze({
    actorId: actor.id ?? "",
    actorName: actor.name ?? "",
    created: result.created,
    snapshot: result.snapshot
  });
}

async function migrateAll() {
  if (!game.user?.isGM) throw new Error("M8 Social Network migration is GM-only.");
  const results = [];
  for (const actor of eligibleActors()) results.push(await migrateActor(actor));
  return Object.freeze(results);
}

function getM8Status() {
  const actors = eligibleActors();
  const current = services();
  let stored = 0;
  let fallbackOnly = 0;
  for (const actor of actors) {
    if (current.repository.readStored(actor)) stored += 1;
    else fallbackOnly += 1;
  }
  return Object.freeze({
    phase: "M8",
    buildScope: "SOCIAL_NETWORK_FOUNDATION",
    mode: "SHADOW_READ_COMPATIBILITY",
    authority: "LEGACY_MIXED",
    liveApplication: false,
    schemaVersion: SOCIAL_NETWORK_SCHEMA_VERSION,
    migrationVersion: SOCIAL_NETWORK_MIGRATION_VERSION,
    actors: Object.freeze({
      eligible: actors.length,
      stored,
      fallbackOnly
    }),
    capabilities: Object.freeze([
      "PersonRecord",
      "Relationship",
      "RelationshipRole",
      "RelationshipStatus",
      "RelationshipOrigin",
      "RelationshipHistory",
      "SocialNetworkRepository",
      "SocialNetworkService",
      "LegacyRecruitmentRead",
      "LegacyCharacterRead",
      "DeterministicSourceSlotIds",
      "DuplicateProtection",
      "OptionalActorUuid",
      "FallbackCompatibilityRead",
      "ExplicitGmMigration"
    ]),
    preservation: Object.freeze({
      legacyFieldsDeleted: false,
      recruitmentFieldsChanged: false,
      circlesBehaviorChanged: false,
      characterSheetBehaviorChanged: false,
      automaticNpcCreation: false,
      gameplayChangeIntended: false
    })
  });
}

function exposeApi() {
  const current = services();
  game.realmGuard ??= {};
  game.realmGuard.core ??= {};
  game.realmGuard.core.phase = "M8";
  game.realmGuard.core.m8 = Object.freeze({
    getStatus: getM8Status,
    previewActor,
    previewAll: () => Object.freeze(eligibleActors().map(previewActor)),
    migrateActor,
    migrateAll,
    repository: Object.freeze({
      read: (actorOrId, options) => {
        const actor = actorRef(actorOrId);
        return actor ? current.repository.read(actor, options) : null;
      },
      readStored: actorOrId => {
        const actor = actorRef(actorOrId);
        return actor ? current.repository.readStored(actor) : null;
      }
    }),
    social: Object.freeze({
      snapshot: (actorOrId, options) => {
        const actor = actorRef(actorOrId);
        return actor ? current.social.snapshot(actor, options) : null;
      },
      people: actorOrId => {
        const actor = actorRef(actorOrId);
        return actor ? current.social.people(actor) : Object.freeze([]);
      },
      relationships: actorOrId => {
        const actor = actorRef(actorOrId);
        return actor ? current.social.relationships(actor) : Object.freeze([]);
      },
      byRole: (actorOrId, role) => {
        const actor = actorRef(actorOrId);
        return actor ? current.social.byRole(actor, role) : Object.freeze([]);
      },
      updateRelationshipStatus: (actorOrId, relationshipId, status, options) => {
        const actor = actorRef(actorOrId);
        if (!actor) throw new Error("Could not resolve Ranger Actor.");
        return current.social.updateRelationshipStatus(actor, relationshipId, status, options);
      },
      linkActor: (actorOrId, personId, linkedActorUuid) => {
        const actor = actorRef(actorOrId);
        if (!actor) throw new Error("Could not resolve Ranger Actor.");
        return current.social.linkActor(actor, personId, linkedActorUuid);
      }
    }),
    constants: Object.freeze({
      RelationshipRole,
      RelationshipStatus,
      RelationshipOrigin
    })
  });
}

export function installM8SocialNetworkFoundation() {
  Hooks.once("ready", () => {
    exposeApi();
    console.log("realm-guard | CORE M8 Social Network shadow foundation ready", getM8Status());
  });
}
