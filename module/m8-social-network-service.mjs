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
    liveCirclesIntegration: true,
    automaticNpcCreation: false
  });
}

export async function ensureM8RecruitmentNetwork(actorOrId) {
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor for Recruitment Social Network normalization.");
  if (actor.type !== "character") throw new Error("Recruitment Social Network normalization requires a character Actor.");
  if (!game.user?.isGM && !actor.isOwner) throw new Error("Recruitment Social Network normalization requires ownership of the Ranger.");

  const result = await services().repository.ensureMigrated(actor);
  return Object.freeze({
    actorId: actor.id ?? "",
    actorName: actor.name ?? "",
    created: Boolean(result.created),
    snapshot: result.snapshot
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

function roleLabel(role = "") {
  return String(role || "OTHER").toLowerCase().split("_").map(part => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}

function statusLabel(status = "") {
  return String(status || "UNKNOWN").toLowerCase().split("_").map(part => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}


export const M8_RELATIONSHIP_STATUS_OPTIONS = Object.freeze([
  Object.freeze({ value: RelationshipStatus.UNKNOWN, label: statusLabel(RelationshipStatus.UNKNOWN) }),
  Object.freeze({ value: RelationshipStatus.FRIENDLY, label: statusLabel(RelationshipStatus.FRIENDLY) }),
  Object.freeze({ value: RelationshipStatus.NEUTRAL, label: statusLabel(RelationshipStatus.NEUTRAL) }),
  Object.freeze({ value: RelationshipStatus.ESTRANGED, label: statusLabel(RelationshipStatus.ESTRANGED) }),
  Object.freeze({ value: RelationshipStatus.HOSTILE, label: statusLabel(RelationshipStatus.HOSTILE) })
]);

export async function updateM8RelationshipStatus(actorOrId, relationshipId, status, options = {}) {
  if (!game.user?.isGM) throw new Error("Relationship status changes are GM-only during M8 migration.");
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  return services().social.updateRelationshipStatus(actor, relationshipId, status, {
    ...options,
    source: String(options?.source || RelationshipOrigin.GM)
  });
}


export async function createM8DynamicContact(actorOrId, data = {}) {
  if (!game.user?.isGM) throw new Error("Dynamic Contact creation is GM-only during M8 migration.");
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  return services().social.createContact(actor, {
    ...data,
    origin: String(data?.origin || RelationshipOrigin.PLAY),
    status: String(data?.status || RelationshipStatus.NEUTRAL),
    createdBy: String(game.user?.id || "")
  });
}

export async function createM8CirclesContact(actorOrId, data = {}) {
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  if (!game.user?.isGM && !actor.isOwner) throw new Error("Circles Contact creation requires ownership of the Ranger.");
  return services().social.createContact(actor, {
    ...data,
    origin: RelationshipOrigin.CIRCLES,
    status: RelationshipStatus.NEUTRAL,
    createdBy: String(game.user?.id || "")
  });
}

export async function createM8EnmityEnemy(actorOrId, data = {}) {
  if (!game.user?.isGM) throw new Error("Enmity Clause resolution is GM-only.");
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  return services().social.createEnemy(actor, {
    ...data,
    createdBy: String(game.user?.id || "")
  });
}

function activeM8GmId() {
  return game.users?.filter?.(user => user.active && user.isGM)
    ?.sort?.((a,b) => String(a.id).localeCompare(String(b.id)))?.[0]?.id ?? null;
}

async function openEnmityDecision(actor, context = {}) {
  if (!game.user?.isGM) return null;
  const esc = foundry.utils.escapeHTML;
  const searchedName = String(context?.name || "").trim();
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Circles Failure", resizable: true },
    position: { width: 620 },
    content: `<div class="realm-guard rg-m8-enmity-dialog">
      <div class="rg-brand">REALM GUARD / TORCHBEARER · CIRCLES FAILURE</div>
      <h2>Circles failed</h2>
      <p><b>${esc(actor.name)}</b> failed while seeking <b>${esc(searchedName || "a new person")}</b>.</p>
      <p>Choose the normal failure route, or invoke the <b>Enmity Clause</b>. Enmity creates a hostile Social Network relationship only after GM confirmation. It does not create an NPC Actor automatically.</p>
    </div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "normal", label: "Normal Failure", icon: "fa-solid fa-shuffle", default: true, callback: () => "normal" },
      { action: "enmity", label: "Invoke Enmity Clause", icon: "fa-solid fa-user-slash", callback: () => "enmity" },
      { action: "later", label: "Decide Later", icon: "fa-solid fa-clock", callback: () => "later" }
    ]
  });

  if (choice !== "enmity") return Object.freeze({ choice: choice || "later", created: false });

  const formResult = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Enmity Clause", resizable: true },
    position: { width: 650 },
    content: `<form class="realm-guard rg-m8-enmity-dialog">
      <div class="rg-brand">REALM GUARD / TORCHBEARER · ENMITY CLAUSE</div>
      <h2>Create the enemy</h2>
      <p>The failed Circles request is used as a starting point. The GM may replace any detail, including the name.</p>
      <div class="rg-m8-contact-grid">
        <label><span>Name *</span><input type="text" name="name" required value="${esc(searchedName)}"></label>
        <label><span>Profession / Role</span><input type="text" name="profession" value="${esc(String(context?.profession || ""))}"></label>
        <label><span>People / Culture</span><input type="text" name="people" value="${esc(String(context?.people || ""))}"></label>
        <label><span>Location</span><input type="text" name="location" value="${esc(String(context?.location || ""))}"></label>
        <label class="rg-contact-wide"><span>Reason / Enmity</span><input type="text" name="reason" value="Enmity Clause" placeholder="Why does this person oppose the Ranger?"></label>
        <label class="rg-contact-wide"><span>Session / reference</span><input type="text" name="sessionId" placeholder="e.g. Session 9"></label>
        <label class="rg-contact-wide"><span>Notes</span><textarea name="notes" rows="4">${esc(String(context?.notes || ""))}</textarea></label>
      </div>
      <p class="rg-m8-circles-note"><b>Creates:</b> Enemy · Hostile · Origin ENMITY. No NPC Actor is created automatically.</p>
    </form>`,
    modal: false,
    rejectClose: false,
    buttons: [
      {
        action: "create",
        label: "Create Enemy",
        icon: "fa-solid fa-user-slash",
        default: true,
        callback: (_event,button) => ({
          name: String(button.form?.elements?.name?.value || "").trim(),
          profession: String(button.form?.elements?.profession?.value || "").trim(),
          people: String(button.form?.elements?.people?.value || "").trim(),
          location: String(button.form?.elements?.location?.value || "").trim(),
          reason: String(button.form?.elements?.reason?.value || "Enmity Clause").trim(),
          sessionId: String(button.form?.elements?.sessionId?.value || "").trim(),
          notes: String(button.form?.elements?.notes?.value || "").trim()
        })
      },
      { action: "cancel", label: "Cancel", callback: () => null }
    ]
  });

  if (!formResult) return Object.freeze({ choice: "cancel", created: false });
  if (!formResult.name) {
    ui.notifications.warn("Realm Guard: Enmity Clause requires a name.");
    return Object.freeze({ choice: "invalid", created: false });
  }

  const result = await createM8EnmityEnemy(actor, formResult);
  if (result.created) {
    ui.notifications.info(`Realm Guard: Enmity Clause created ${result.person.name} as a Hostile Enemy. No NPC Actor was created.`);
  } else if (result.relationship?.status === RelationshipStatus.HOSTILE) {
    ui.notifications.info(`Realm Guard: Enmity Clause reused ${result.person.name}; the existing relationship is Hostile and no duplicate was created.`);
  }
  return Object.freeze({ choice: "enmity", ...result });
}

export async function requestM8EnmityDecision(actorOrId, context = {}) {
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  if (game.user?.isGM) return openEnmityDecision(actor, context);

  const targetGmId = activeM8GmId();
  if (!targetGmId) {
    ui.notifications.warn("Realm Guard: Circles failed, but no active GM is available for an Enmity Clause decision.");
    return Object.freeze({ choice: "no-gm", created: false });
  }

  game.socket.emit(`system.realm-guard`, {
    type: "m8-enmity-request",
    targetGmId,
    senderId: game.user?.id || "",
    actorUuid: String(actor.uuid || ""),
    context: {
      name: String(context?.name || ""),
      profession: String(context?.profession || ""),
      people: String(context?.people || ""),
      location: String(context?.location || ""),
      notes: String(context?.notes || "")
    }
  });
  ui.notifications.info("Realm Guard: Circles failed. The GM has been asked to resolve the failure / Enmity Clause.");
  return Object.freeze({ choice: "requested", created: false });
}

export async function updateM8Person(actorOrId, personId, data = {}) {
  if (!game.user?.isGM) throw new Error("Dynamic Contact editing is GM-only during M8 migration.");
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  return services().social.updatePerson(actor, personId, data);
}

function linkedActorView(actorUuid = "") {
  const uuid = String(actorUuid || "").trim();
  if (!uuid) return Object.freeze({ uuid: "", linked: false, resolved: false, name: "", type: "", img: "" });
  const id = uuid.startsWith("Actor.") ? uuid.slice(6) : "";
  const actor = id ? game.actors?.get?.(id) : null;
  return Object.freeze({
    uuid,
    linked: true,
    resolved: Boolean(actor),
    name: actor?.name ?? "",
    type: actor?.type ?? "",
    img: actor?.img ?? ""
  });
}

export function buildM8RelationshipSheetView(actorOrId) {
  const actor = actorRef(actorOrId);
  if (!actor) return Object.freeze({ stored: false, sourceMode: "NONE", people: Object.freeze([]), relationships: Object.freeze([]) });

  const current = services();
  const stored = current.repository.readStored(actor);
  const legacy = current.repository.fallback(actor);
  const storedPeople = new Map((stored?.people ?? []).map(person => [person.id, person]));
  const storedRelationships = new Map((stored?.relationships ?? []).map(relationship => [relationship.id, relationship]));

  const people = legacy.people.map(person => {
    const normalized = storedPeople.get(person.id);
    return Object.freeze({
      ...person,
      notes: normalized?.notes || person.notes || "",
      actorUuid: normalized?.actorUuid || "",
      actorLink: linkedActorView(normalized?.actorUuid || "")
    });
  });
  for (const person of stored?.people ?? []) {
    if (people.some(entry => entry.id === person.id)) continue;
    people.push(Object.freeze({ ...person, actorLink: linkedActorView(person.actorUuid) }));
  }

  const peopleById = new Map(people.map(person => [person.id, person]));
  const relationships = legacy.relationships.map(relationship => {
    const normalized = storedRelationships.get(relationship.id);
    const effective = normalized ?? relationship;
    const person = peopleById.get(relationship.personId) ?? null;
    return Object.freeze({
      ...effective,
      source: relationship.source ?? effective.source ?? null,
      roleLabel: roleLabel(effective.role),
      statusLabel: statusLabel(effective.status),
      person
    });
  });
  for (const relationship of stored?.relationships ?? []) {
    if (relationships.some(entry => entry.id === relationship.id)) continue;
    relationships.push(Object.freeze({
      ...relationship,
      roleLabel: roleLabel(relationship.role),
      statusLabel: statusLabel(relationship.status),
      person: peopleById.get(relationship.personId) ?? null
    }));
  }

  return Object.freeze({
    stored: Boolean(stored),
    sourceMode: stored ? "NORMALIZED_PLUS_CURRENT_LEGACY" : "LEGACY_FALLBACK",
    people: Object.freeze(people),
    relationships: Object.freeze(relationships)
  });
}

export async function linkM8PersonActor(actorOrId, personId, actorUuid) {
  const actor = actorRef(actorOrId);
  if (!actor) throw new Error("Could not resolve Ranger Actor.");
  return services().social.linkActor(actor, personId, actorUuid);
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
    buildScope: "SOCIAL_NETWORK_RELATIONSHIP_UI",
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
      "ExplicitGmMigration",
      "CharacterRelationshipView",
      "ExistingActorLinking",
      "DynamicContacts",
      "DynamicContactDuplicateProtection",
      "DynamicContactEditing",
      "CirclesKnownPerson",
      "CirclesNewPerson",
      "EnmityClause"
    ]),
    preservation: Object.freeze({
      legacyFieldsDeleted: false,
      recruitmentFieldsChanged: false,
      circlesBehaviorChanged: false,
      characterSheetBehaviorChanged: true,
      characterSheetGameplayChanged: false,
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
      createContact: (actorOrId, data) => {
        const actor = actorRef(actorOrId);
        if (!actor) throw new Error("Could not resolve Ranger Actor.");
        return current.social.createContact(actor, data);
      },
      updatePerson: (actorOrId, personId, data) => {
        const actor = actorRef(actorOrId);
        if (!actor) throw new Error("Could not resolve Ranger Actor.");
        return current.social.updatePerson(actor, personId, data);
      },
      createEnemy: (actorOrId, data) => {
        const actor = actorRef(actorOrId);
        if (!actor) throw new Error("Could not resolve Ranger Actor.");
        return current.social.createEnemy(actor, data);
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
    game.socket.on("system.realm-guard", message => {
      if (message?.type !== "m8-enmity-request") return;
      if (!game.user?.isGM || message.targetGmId !== game.user.id) return;
      const actor = actorRef(message.actorUuid);
      if (!actor) return ui.notifications.warn("Realm Guard: Could not resolve the Ranger for the Enmity Clause request.");
      void openEnmityDecision(actor, message.context || {});
    });
    console.log("realm-guard | CORE M8 Social Network shadow foundation ready", getM8Status());
  });
}
