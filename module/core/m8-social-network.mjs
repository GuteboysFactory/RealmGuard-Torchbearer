const SYSTEM_ID = "realm-guard";
export const SOCIAL_NETWORK_FLAG = "socialNetwork";
export const SOCIAL_NETWORK_SCHEMA_VERSION = 1;
export const SOCIAL_NETWORK_MIGRATION_VERSION = "M8-FOUNDATION-1";

export const RelationshipRole = Object.freeze({
  PARENT: "PARENT",
  SENIOR_ARTISAN: "SENIOR_ARTISAN",
  MENTOR: "MENTOR",
  FRIEND: "FRIEND",
  ENEMY: "ENEMY",
  CONTACT: "CONTACT",
  OTHER: "OTHER"
});

export const RelationshipStatus = Object.freeze({
  UNKNOWN: "UNKNOWN",
  FRIENDLY: "FRIENDLY",
  NEUTRAL: "NEUTRAL",
  HOSTILE: "HOSTILE",
  ESTRANGED: "ESTRANGED"
});

export const RelationshipOrigin = Object.freeze({
  RECRUITMENT: "RECRUITMENT",
  CIRCLES: "CIRCLES",
  PLAY: "PLAY",
  ENMITY: "ENMITY",
  GM: "GM",
  IMPORT: "IMPORT"
});

function clean(value = "") {
  return String(value ?? "").trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freeze(entry)])));
  }
  return value;
}

function hash32(input) {
  let hash = 0x811c9dc5;
  for (const char of String(input ?? "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function stableSocialId(prefix, ...parts) {
  return `${clean(prefix) || "social"}-${hash32(parts.map(part => clean(part)).join("|"))}`;
}

export class PersonRecord {
  constructor({
    id = "",
    name = "",
    profession = "",
    people = "",
    location = "",
    notes = "",
    actorUuid = "",
    source = null
  } = {}) {
    this.id = clean(id);
    this.name = clean(name);
    this.profession = clean(profession);
    this.people = clean(people);
    this.location = clean(location);
    this.notes = clean(notes);
    this.actorUuid = clean(actorUuid);
    this.source = source ? freeze(clone(source)) : null;
    Object.freeze(this);
  }
}

export class RelationshipHistory {
  constructor({
    id = "",
    from = RelationshipStatus.UNKNOWN,
    to = RelationshipStatus.UNKNOWN,
    reason = "",
    sessionId = "",
    timestamp = "",
    source = ""
  } = {}) {
    this.id = clean(id);
    this.from = clean(from) || RelationshipStatus.UNKNOWN;
    this.to = clean(to) || RelationshipStatus.UNKNOWN;
    this.reason = clean(reason);
    this.sessionId = clean(sessionId);
    this.timestamp = clean(timestamp);
    this.source = clean(source);
    Object.freeze(this);
  }
}

export class Relationship {
  constructor({
    id = "",
    personId = "",
    role = RelationshipRole.OTHER,
    status = RelationshipStatus.UNKNOWN,
    origin = RelationshipOrigin.IMPORT,
    capabilities = [],
    effects = [],
    history = [],
    source = null
  } = {}) {
    this.id = clean(id);
    this.personId = clean(personId);
    this.role = clean(role) || RelationshipRole.OTHER;
    this.status = clean(status) || RelationshipStatus.UNKNOWN;
    this.origin = clean(origin) || RelationshipOrigin.IMPORT;
    this.capabilities = freeze(asArray(capabilities).map(clean).filter(Boolean));
    this.effects = freeze(asArray(effects).map(entry => clone(entry)));
    this.history = freeze(asArray(history).map(entry => entry instanceof RelationshipHistory ? entry : new RelationshipHistory(entry)));
    this.source = source ? freeze(clone(source)) : null;
    Object.freeze(this);
  }
}

export class SocialNetworkSnapshot {
  constructor({
    schemaVersion = SOCIAL_NETWORK_SCHEMA_VERSION,
    migrationVersion = SOCIAL_NETWORK_MIGRATION_VERSION,
    actorUuid = "",
    people = [],
    relationships = [],
    metadata = {}
  } = {}) {
    this.schemaVersion = Number(schemaVersion || SOCIAL_NETWORK_SCHEMA_VERSION);
    this.migrationVersion = clean(migrationVersion) || SOCIAL_NETWORK_MIGRATION_VERSION;
    this.actorUuid = clean(actorUuid);
    this.people = freeze(asArray(people).map(entry => entry instanceof PersonRecord ? entry : new PersonRecord(entry)));
    this.relationships = freeze(asArray(relationships).map(entry => entry instanceof Relationship ? entry : new Relationship(entry)));
    this.metadata = freeze({
      mode: "SHADOW_NORMALIZED_STORAGE",
      gameplayAuthority: "LEGACY_MIXED",
      legacyFieldsPreserved: true,
      ...clone(metadata)
    });
    Object.freeze(this);
  }
}

function actorKey(actor) {
  return clean(actor?.uuid || actor?.id || actor?.name || "actor");
}

function flag(actor, key) {
  try { return actor?.getFlag?.(SYSTEM_ID, key); }
  catch { return undefined; }
}

function sourceDescriptor({ slot, raw, confidence, recruitment, kind = "" }) {
  return freeze({
    kind: clean(kind) || (recruitment ? "LEGACY_RECRUITMENT_FIELD" : "LEGACY_CHARACTER_FIELD"),
    slot: clean(slot),
    raw: clean(raw),
    confidence: clean(confidence) || "LOW_RAW"
  });
}

function splitRecruitmentTriple(raw) {
  const parts = clean(raw).split(",").map(part => part.trim());
  if (parts.length < 3) return null;
  return {
    name: parts.shift() || "",
    secondary: parts.shift() || "",
    location: parts.join(", ").trim()
  };
}

function splitRecruitmentArtisan(raw) {
  const value = clean(raw);
  const marker = value.lastIndexOf(" - ");
  if (marker <= 0 || marker >= value.length - 3) return null;
  return {
    name: value.slice(0, marker).trim(),
    profession: value.slice(marker + 3).trim()
  };
}

export function buildLegacySocialNetworkSnapshot(actor) {
  const key = actorKey(actor);
  const recruitmentVersion = clean(flag(actor, "recruitmentVersion"));
  const recruitment = Boolean(recruitmentVersion);
  const structured = flag(actor, "recruitmentRelationships");
  const structuredVersion = Number(structured?.version ?? 0);
  const useStructured = recruitment && structuredVersion >= 1;
  const origin = recruitment ? RelationshipOrigin.RECRUITMENT : RelationshipOrigin.IMPORT;
  const people = [];
  const relationships = [];

  const add = ({
    slot,
    raw,
    name,
    profession = "",
    peopleName = "",
    location = "",
    notes = "",
    role,
    status = RelationshipStatus.UNKNOWN,
    confidence = "LOW_RAW",
    sourceKind = ""
  }) => {
    const rawValue = clean(raw);
    const personName = clean(name || rawValue);
    if (!personName) return null;

    const personId = stableSocialId("person", key, "legacy", slot);
    const relationshipId = stableSocialId("relationship", key, "legacy", slot);
    const source = sourceDescriptor({ slot, raw: rawValue, confidence, recruitment, kind: sourceKind });

    if (!people.some(person => person.id === personId)) {
      people.push(new PersonRecord({
        id: personId,
        name: personName,
        profession,
        people: peopleName,
        location,
        notes,
        actorUuid: "",
        source
      }));
    }
    if (!relationships.some(relationship => relationship.id === relationshipId)) {
      relationships.push(new Relationship({
        id: relationshipId,
        personId,
        role,
        status,
        origin,
        source
      }));
    }
    return personId;
  };

  const addStructured = (slot, person, role, status = RelationshipStatus.UNKNOWN) => {
    const name = clean(person?.name);
    if (!name) return null;
    return add({
      slot,
      raw: [name, clean(person?.profession), clean(person?.people), clean(person?.location)].filter(Boolean).join(", "),
      name,
      profession: clean(person?.profession),
      peopleName: clean(person?.people),
      location: clean(person?.location),
      role,
      status,
      confidence: "STRUCTURED_HIGH",
      sourceKind: "RECRUITMENT_STRUCTURED_RELATIONSHIP"
    });
  };

  if (useStructured) {
    addStructured("parent-mother", structured.mother, RelationshipRole.PARENT);
    addStructured("parent-father", structured.father, RelationshipRole.PARENT);
    addStructured("senior-artisan", structured.seniorArtisan, RelationshipRole.SENIOR_ARTISAN);
    addStructured("mentor", structured.mentor, RelationshipRole.MENTOR);
    addStructured("friend", structured.friend, RelationshipRole.FRIEND, RelationshipStatus.FRIENDLY);
    addStructured("enemy", structured.enemy, RelationshipRole.ENEMY, RelationshipStatus.HOSTILE);
  } else {
    const mother = clean(flag(actor, "recruitmentMother"));
    const father = clean(flag(actor, "recruitmentFather"));
    const parentsRaw = clean(actor?.system?.parents);
    if (mother || father) {
      if (mother) add({ slot: "parent-mother", raw: mother, name: mother, role: RelationshipRole.PARENT, confidence: "HIGH" });
      if (father) add({ slot: "parent-father", raw: father, name: father, role: RelationshipRole.PARENT, confidence: "HIGH" });
    } else if (parentsRaw) {
      add({ slot: "parents-raw", raw: parentsRaw, name: parentsRaw, role: RelationshipRole.PARENT, confidence: "LOW_RAW" });
    }

    const artisanRaw = clean(actor?.system?.seniorArtisan);
    if (artisanRaw) {
      const parsed = recruitment ? splitRecruitmentArtisan(artisanRaw) : null;
      add({
        slot: "senior-artisan",
        raw: artisanRaw,
        name: parsed?.name || artisanRaw,
        profession: parsed?.profession || "",
        role: RelationshipRole.SENIOR_ARTISAN,
        confidence: parsed ? "HIGH" : "LOW_RAW"
      });
    }

    const mentorRaw = clean(actor?.system?.mentor);
    if (mentorRaw) add({ slot: "mentor", raw: mentorRaw, name: mentorRaw, role: RelationshipRole.MENTOR, confidence: recruitment ? "HIGH" : "MEDIUM" });

    const friendRaw = clean(actor?.system?.friend);
    if (friendRaw) {
      const parsed = recruitment ? splitRecruitmentTriple(friendRaw) : null;
      add({
        slot: "friend",
        raw: friendRaw,
        name: parsed?.name || friendRaw,
        profession: parsed?.secondary || "",
        location: parsed?.location || "",
        role: RelationshipRole.FRIEND,
        status: RelationshipStatus.FRIENDLY,
        confidence: parsed ? "HIGH" : "LOW_RAW"
      });
    }

    const enemyRaw = clean(actor?.system?.enemy);
    if (enemyRaw) {
      const parsed = recruitment ? splitRecruitmentTriple(enemyRaw) : null;
      add({
        slot: "enemy",
        raw: enemyRaw,
        name: parsed?.name || enemyRaw,
        peopleName: parsed?.secondary || "",
        location: parsed?.location || "",
        role: RelationshipRole.ENEMY,
        status: RelationshipStatus.HOSTILE,
        confidence: parsed ? "HIGH" : "LOW_RAW"
      });
    }
  }

  return new SocialNetworkSnapshot({
    actorUuid: key,
    people,
    relationships,
    metadata: {
      migrationSource: useStructured ? "RECRUITMENT_STRUCTURED_RELATIONSHIPS" : recruitment ? "RECRUITMENT_2_LEGACY_FIELDS" : "LEGACY_CHARACTER_FIELDS",
      recruitmentVersion,
      recruitmentRelationshipsVersion: useStructured ? structuredVersion : 0,
      duplicatePolicy: "ACTOR_PLUS_SOURCE_SLOT",
      automaticNpcCreation: false
    }
  });
}

export function normalizeSocialNetworkSnapshot(value, actor = null) {
  if (!value || typeof value !== "object") return null;
  if (Number(value.schemaVersion ?? 0) !== SOCIAL_NETWORK_SCHEMA_VERSION) return null;
  return new SocialNetworkSnapshot({
    ...clone(value),
    actorUuid: clean(value.actorUuid || actorKey(actor))
  });
}

export class SocialNetworkRepository {
  constructor({ systemId = SYSTEM_ID, flagKey = SOCIAL_NETWORK_FLAG } = {}) {
    this.systemId = clean(systemId) || SYSTEM_ID;
    this.flagKey = clean(flagKey) || SOCIAL_NETWORK_FLAG;
  }

  readStored(actor) {
    let raw;
    try { raw = actor?.getFlag?.(this.systemId, this.flagKey); }
    catch { raw = undefined; }
    return normalizeSocialNetworkSnapshot(raw, actor);
  }

  fallback(actor) {
    return buildLegacySocialNetworkSnapshot(actor);
  }

  read(actor, { fallback = true } = {}) {
    return this.readStored(actor) ?? (fallback ? this.fallback(actor) : null);
  }

  async write(actor, snapshot) {
    if (!actor?.setFlag) throw new Error("SocialNetworkRepository requires an Actor-like document with setFlag().");
    const normalized = snapshot instanceof SocialNetworkSnapshot ? snapshot : normalizeSocialNetworkSnapshot(snapshot, actor);
    if (!normalized) throw new Error("Invalid Social Network snapshot.");
    await actor.setFlag(this.systemId, this.flagKey, clone(normalized));
    return normalized;
  }

  async ensureMigrated(actor) {
    const existing = this.readStored(actor);
    if (existing) return freeze({ created: false, snapshot: existing });
    const snapshot = this.fallback(actor);
    await this.write(actor, snapshot);
    return freeze({ created: true, snapshot });
  }
}

function nextLocalId(prefix, actor, snapshot, sourceKey = "") {
  const key = actorKey(actor);
  if (sourceKey) return stableSocialId(prefix, key, sourceKey);
  const occupied = new Set([
    ...snapshot.people.map(entry => entry.id),
    ...snapshot.relationships.map(entry => entry.id)
  ]);
  let index = 1;
  let candidate = "";
  do {
    candidate = stableSocialId(prefix, key, "manual", String(index));
    index += 1;
  } while (occupied.has(candidate));
  return candidate;
}

function contactIdentityKey(value = {}) {
  return [
    value?.name,
    value?.profession,
    value?.people,
    value?.location
  ].map(entry => clean(entry).toLowerCase()).join("|");
}

export class SocialNetworkService {
  constructor({ repository = new SocialNetworkRepository() } = {}) {
    this.repository = repository;
  }

  snapshot(actor, options = {}) {
    return this.repository.read(actor, options);
  }

  people(actor) {
    return this.snapshot(actor)?.people ?? Object.freeze([]);
  }

  relationships(actor) {
    return this.snapshot(actor)?.relationships ?? Object.freeze([]);
  }

  person(actor, personId) {
    return this.people(actor).find(entry => entry.id === clean(personId)) ?? null;
  }

  relationship(actor, relationshipId) {
    return this.relationships(actor).find(entry => entry.id === clean(relationshipId)) ?? null;
  }

  byRole(actor, role) {
    const wanted = clean(role);
    return Object.freeze(this.relationships(actor).filter(entry => entry.role === wanted));
  }

  async createPerson(actor, data = {}, { sourceKey = "" } = {}) {
    const snapshot = this.snapshot(actor);
    const id = clean(data.id) || nextLocalId("person", actor, snapshot, sourceKey);
    const existing = snapshot.people.find(entry => entry.id === id);
    if (existing) return existing;
    const person = new PersonRecord({ ...data, id });
    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      people: [...snapshot.people, person]
    }));
    return person;
  }

  async createRelationship(actor, data = {}, { sourceKey = "" } = {}) {
    const snapshot = this.snapshot(actor);
    const personId = clean(data.personId);
    if (!snapshot.people.some(entry => entry.id === personId)) throw new Error(`Unknown Social Network personId: ${personId || "(empty)"}`);
    const id = clean(data.id) || nextLocalId("relationship", actor, snapshot, sourceKey);
    const existing = snapshot.relationships.find(entry => entry.id === id);
    if (existing) return existing;
    const relationship = new Relationship({ ...data, id, personId });
    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      relationships: [...snapshot.relationships, relationship]
    }));
    return relationship;
  }

  async createContact(actor, data = {}) {
    const snapshot = this.snapshot(actor);
    const name = clean(data.name);
    if (!name) throw new Error("Dynamic Contact requires a name.");

    const candidate = {
      name,
      profession: clean(data.profession),
      people: clean(data.people),
      location: clean(data.location)
    };
    const identity = contactIdentityKey(candidate);
    const existingPerson = snapshot.people.find(entry => contactIdentityKey(entry) === identity);
    if (existingPerson) {
      const existingRelationship = snapshot.relationships.find(entry => entry.personId === existingPerson.id) ?? null;
      return freeze({
        created: false,
        duplicate: true,
        person: existingPerson,
        relationship: existingRelationship
      });
    }

    const personId = nextLocalId("person", actor, snapshot);
    const relationshipId = nextLocalId("relationship", actor, snapshot);
    const origin = clean(data.origin) || RelationshipOrigin.PLAY;
    const status = clean(data.status) || RelationshipStatus.NEUTRAL;
    const person = new PersonRecord({
      id: personId,
      name,
      profession: candidate.profession,
      people: candidate.people,
      location: candidate.location,
      notes: clean(data.notes),
      actorUuid: clean(data.actorUuid),
      source: {
        kind: "DYNAMIC_CONTACT",
        origin
      }
    });
    const relationship = new Relationship({
      id: relationshipId,
      personId,
      role: RelationshipRole.CONTACT,
      status,
      origin,
      source: {
        kind: "DYNAMIC_CONTACT",
        createdBy: clean(data.createdBy)
      }
    });

    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      people: [...snapshot.people, person],
      relationships: [...snapshot.relationships, relationship]
    }));

    return freeze({ created: true, duplicate: false, person, relationship });
  }

  async createEnemy(actor, data = {}) {
    const snapshot = this.snapshot(actor);
    const name = clean(data.name);
    if (!name) throw new Error("Enmity Clause requires a name.");

    const candidate = {
      name,
      profession: clean(data.profession),
      people: clean(data.people),
      location: clean(data.location)
    };
    const identity = contactIdentityKey(candidate);
    const existingPerson = snapshot.people.find(entry => contactIdentityKey(entry) === identity);

    if (existingPerson) {
      const existingRelationship = snapshot.relationships.find(entry => entry.personId === existingPerson.id) ?? null;
      if (!existingRelationship) {
        const relationship = new Relationship({
          id: nextLocalId("relationship", actor, snapshot),
          personId: existingPerson.id,
          role: RelationshipRole.ENEMY,
          status: RelationshipStatus.HOSTILE,
          origin: RelationshipOrigin.ENMITY,
          source: {
            kind: "ENMITY_CLAUSE",
            createdBy: clean(data.createdBy)
          }
        });
        await this.repository.write(actor, new SocialNetworkSnapshot({
          ...snapshot,
          relationships: [...snapshot.relationships, relationship]
        }));
        return freeze({ created: false, duplicate: true, reused: true, person: existingPerson, relationship });
      }

      if (existingRelationship.status === RelationshipStatus.HOSTILE && existingRelationship.role === RelationshipRole.ENEMY) {
        return freeze({
          created: false,
          duplicate: true,
          reused: true,
          person: existingPerson,
          relationship: existingRelationship
        });
      }

      const timestamp = clean(data.timestamp) || new Date().toISOString();
      const history = existingRelationship.status === RelationshipStatus.HOSTILE
        ? null
        : new RelationshipHistory({
            id: stableSocialId("history", actorKey(actor), existingRelationship.id, existingRelationship.status, RelationshipStatus.HOSTILE, timestamp),
            from: existingRelationship.status,
            to: RelationshipStatus.HOSTILE,
            reason: clean(data.reason) || "Enmity Clause",
            sessionId: clean(data.sessionId),
            timestamp,
            source: RelationshipOrigin.ENMITY
          });
      const relationship = new Relationship({
        ...existingRelationship,
        role: RelationshipRole.ENEMY,
        status: RelationshipStatus.HOSTILE,
        origin: RelationshipOrigin.ENMITY,
        history: history ? [...existingRelationship.history, history] : existingRelationship.history,
        source: {
          ...(existingRelationship.source || {}),
          kind: "ENMITY_CLAUSE",
          createdBy: clean(data.createdBy)
        }
      });
      await this.repository.write(actor, new SocialNetworkSnapshot({
        ...snapshot,
        relationships: snapshot.relationships.map(entry => entry.id === existingRelationship.id ? relationship : entry)
      }));
      return freeze({
        created: false,
        duplicate: true,
        reused: true,
        person: existingPerson,
        relationship
      });
    }

    const personId = nextLocalId("person", actor, snapshot);
    const relationshipId = nextLocalId("relationship", actor, snapshot);
    const person = new PersonRecord({
      id: personId,
      name,
      profession: candidate.profession,
      people: candidate.people,
      location: candidate.location,
      notes: clean(data.notes),
      actorUuid: clean(data.actorUuid),
      source: {
        kind: "ENMITY_CLAUSE",
        origin: RelationshipOrigin.ENMITY
      }
    });
    const relationship = new Relationship({
      id: relationshipId,
      personId,
      role: RelationshipRole.ENEMY,
      status: RelationshipStatus.HOSTILE,
      origin: RelationshipOrigin.ENMITY,
      source: {
        kind: "ENMITY_CLAUSE",
        createdBy: clean(data.createdBy)
      }
    });

    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      people: [...snapshot.people, person],
      relationships: [...snapshot.relationships, relationship]
    }));

    return freeze({ created: true, duplicate: false, reused: false, person, relationship });
  }

  async updatePerson(actor, personId, data = {}) {
    const snapshot = this.snapshot(actor);
    const id = clean(personId);
    const current = snapshot.people.find(entry => entry.id === id);
    if (!current) throw new Error(`Unknown Social Network person: ${id || "(empty)"}`);

    const next = new PersonRecord({
      ...current,
      name: clean(data.name ?? current.name),
      profession: clean(data.profession ?? current.profession),
      people: clean(data.people ?? current.people),
      location: clean(data.location ?? current.location),
      notes: clean(data.notes ?? current.notes)
    });
    if (!next.name) throw new Error("PersonRecord requires a name.");

    const duplicate = snapshot.people.find(entry =>
      entry.id !== id && contactIdentityKey(entry) === contactIdentityKey(next)
    );
    if (duplicate) throw new Error(`A matching Social Network person already exists: ${duplicate.name}`);

    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      people: snapshot.people.map(entry => entry.id === id ? next : entry)
    }));
    return next;
  }

  async updateRelationshipStatus(actor, relationshipId, status, {
    reason = "",
    sessionId = "",
    source = "PLAY",
    timestamp = new Date().toISOString()
  } = {}) {
    const snapshot = this.snapshot(actor);
    const id = clean(relationshipId);
    const nextStatus = clean(status) || RelationshipStatus.UNKNOWN;
    const current = snapshot.relationships.find(entry => entry.id === id);
    if (!current) throw new Error(`Unknown Social Network relationship: ${id || "(empty)"}`);
    if (current.status === nextStatus) return current;

    const history = new RelationshipHistory({
      id: stableSocialId("history", actorKey(actor), id, current.status, nextStatus, timestamp),
      from: current.status,
      to: nextStatus,
      reason,
      sessionId,
      timestamp,
      source
    });
    const updated = new Relationship({
      ...current,
      status: nextStatus,
      history: [...current.history, history]
    });
    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      relationships: snapshot.relationships.map(entry => entry.id === id ? updated : entry)
    }));
    return updated;
  }

  async linkActor(actor, personId, actorUuid = "") {
    const snapshot = this.snapshot(actor);
    const id = clean(personId);
    const current = snapshot.people.find(entry => entry.id === id);
    if (!current) throw new Error(`Unknown Social Network person: ${id || "(empty)"}`);
    const updated = new PersonRecord({ ...current, actorUuid: clean(actorUuid) });
    await this.repository.write(actor, new SocialNetworkSnapshot({
      ...snapshot,
      people: snapshot.people.map(entry => entry.id === id ? updated : entry)
    }));
    return updated;
  }
}

export function createSocialNetworkServices() {
  const repository = new SocialNetworkRepository();
  return Object.freeze({
    repository,
    social: new SocialNetworkService({ repository })
  });
}
