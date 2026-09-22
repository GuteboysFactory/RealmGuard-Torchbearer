function clonePlain(value) {
  if (Array.isArray(value)) return value.map(clonePlain);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clonePlain(child)]));
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function cleanMap(value = {}) {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([key]) => String(key || "").trim()).map(([key, count]) => [String(key), Number(count) || 0]));
}

export const CREATION_SCHEMA_VERSION = 1;
export const CREATION_PROFILE_ID = "realm-guard-legacy-mixed";

export class CreationDraft {
  constructor({ profileId, profileVersion, mode = "guided", answers = {}, allocations = {}, derivedValues = {}, warnings = [], metadata = {} } = {}) {
    if (!profileId) throw new Error("CreationDraft requires profileId.");
    this.schemaVersion = CREATION_SCHEMA_VERSION;
    this.profileId = String(profileId);
    this.profileVersion = Number(profileVersion || 1);
    this.mode = String(mode || "guided");
    this.answers = clonePlain(answers);
    this.allocations = clonePlain(allocations);
    this.derivedValues = clonePlain(derivedValues);
    this.warnings = [...warnings];
    this.metadata = clonePlain(metadata);
    deepFreeze(this);
  }

  withChanges(changes = {}) {
    return new CreationDraft({
      profileId: changes.profileId ?? this.profileId,
      profileVersion: changes.profileVersion ?? this.profileVersion,
      mode: changes.mode ?? this.mode,
      answers: changes.answers ?? this.answers,
      allocations: changes.allocations ?? this.allocations,
      derivedValues: changes.derivedValues ?? this.derivedValues,
      warnings: changes.warnings ?? this.warnings,
      metadata: changes.metadata ?? this.metadata
    });
  }
}

export class CharacterCreationProfile {
  constructor({ id, version = 1, name, steps = [], dimensions = [], rules = {}, grants = {}, metadata = {}, derive } = {}) {
    if (!id || !name) throw new Error("CharacterCreationProfile requires id and name.");
    if (typeof derive !== "function") throw new Error("CharacterCreationProfile requires a derive function.");
    this.id = String(id);
    this.version = Number(version || 1);
    this.name = String(name);
    this.steps = clonePlain(steps);
    this.dimensions = clonePlain(dimensions);
    this.rules = clonePlain(rules);
    this.grants = clonePlain(grants);
    this.metadata = clonePlain(metadata);
    this.derive = derive;
    Object.freeze(this.steps);
    Object.freeze(this.dimensions);
    Object.freeze(this.rules);
    Object.freeze(this.grants);
    Object.freeze(this.metadata);
    Object.freeze(this);
  }
}

export class CreationPartyContext {
  constructor({ existingCharacters = [], otherDraftCharacters = [], sharedChoices = {} } = {}) {
    this.existingCharacters = clonePlain(existingCharacters);
    this.otherDraftCharacters = clonePlain(otherDraftCharacters);
    this.sharedChoices = clonePlain(sharedChoices);
    deepFreeze(this);
  }
}

export class CreationValidator {
  constructor(profile) { this.profile = profile; }

  validate(draft, partyContext = new CreationPartyContext()) {
    const errors = [];
    const warnings = [];
    const a = draft.answers ?? {};
    const d = draft.derivedValues ?? {};
    if (!String(a.name ?? "").trim()) errors.push({ code: "NAME_REQUIRED", field: "name" });
    if (!String(a.rank ?? "").trim()) errors.push({ code: "STATION_REQUIRED", field: "rank" });
    if (Number(d.nature ?? 0) < 2 || Number(d.nature ?? 0) > 6) errors.push({ code: "NATURE_RANGE", field: "nature", value: d.nature });

    const specialty = String(a.specialty ?? "").trim();
    if (specialty) {
      const collision = partyContext.existingCharacters.find(entry => String(entry?.specialty ?? "") === specialty);
      if (collision) errors.push({ code: "SPECIALTY_NOT_UNIQUE", field: "specialty", value: specialty, actorName: collision.name ?? "" });
    }

    return deepFreeze({ valid: errors.length === 0, errors, warnings });
  }
}

export class CharacterCreationEngine {
  constructor(profile) {
    if (!(profile instanceof CharacterCreationProfile)) throw new Error("CharacterCreationEngine requires CharacterCreationProfile.");
    this.profile = profile;
    this.validator = new CreationValidator(profile);
  }

  createDraft(seed = {}) {
    const draft = new CreationDraft({
      profileId: this.profile.id,
      profileVersion: this.profile.version,
      mode: seed.mode ?? "guided",
      answers: seed.answers ?? {},
      allocations: seed.allocations ?? {},
      metadata: seed.metadata ?? {}
    });
    return this.recalculate(draft);
  }

  updateDraft(draft, { answers = {}, allocations = {}, mode } = {}) {
    return this.recalculate(draft.withChanges({
      mode: mode ?? draft.mode,
      answers: { ...clonePlain(draft.answers), ...clonePlain(answers) },
      allocations: { ...clonePlain(draft.allocations), ...clonePlain(allocations) }
    }));
  }

  recalculate(draft) {
    const result = this.profile.derive({
      answers: clonePlain(draft.answers),
      allocations: clonePlain(draft.allocations),
      mode: draft.mode
    }) ?? {};
    return draft.withChanges({
      derivedValues: result.derivedValues ?? {},
      warnings: result.warnings ?? []
    });
  }

  validate(draft, partyContext = new CreationPartyContext()) {
    return this.validator.validate(this.recalculate(draft), partyContext);
  }

  buildReview(draft, partyContext = new CreationPartyContext()) {
    const current = this.recalculate(draft);
    return deepFreeze({
      profileId: this.profile.id,
      profileVersion: this.profile.version,
      mode: current.mode,
      valid: this.validate(current, partyContext).valid,
      identity: clonePlain(current.derivedValues.identity ?? {}),
      abilities: clonePlain(current.derivedValues.abilities ?? {}),
      resources: clonePlain(current.derivedValues.resources ?? {}),
      skillChecks: cleanMap(current.derivedValues.skillChecks),
      traitChecks: cleanMap(current.derivedValues.traitChecks),
      wiseChecks: cleanMap(current.derivedValues.wiseChecks),
      relationships: clonePlain(current.answers.relationships ?? {}),
      drives: clonePlain(current.answers.drives ?? {}),
      gear: clonePlain(current.derivedValues.gear ?? []),
      warnings: [...current.warnings]
    });
  }

  buildCommitPlan(draft, partyContext = new CreationPartyContext()) {
    const current = this.recalculate(draft);
    const validation = this.validate(current, partyContext);
    return deepFreeze({
      kind: "CreationCommitPlan",
      liveMutation: false,
      profileId: this.profile.id,
      profileVersion: this.profile.version,
      validation,
      review: this.buildReview(current, partyContext),
      provenance: this.buildProvenance(current)
    });
  }

  buildProvenance(draft, { createdAt = null } = {}) {
    return deepFreeze({
      schemaVersion: CREATION_SCHEMA_VERSION,
      profileId: this.profile.id,
      profileVersion: this.profile.version,
      createdAt,
      answers: clonePlain(draft.answers),
      allocations: clonePlain(draft.allocations),
      grants: clonePlain(draft.derivedValues.grants ?? []),
      derivedValues: clonePlain(draft.derivedValues),
      overrides: clonePlain(draft.metadata?.overrides ?? []),
      optionalRules: clonePlain(draft.metadata?.optionalRules ?? [])
    });
  }
}

export function comparableCreationSnapshot(value = {}) {
  return deepFreeze({
    rank: String(value.rank ?? ""),
    age: Number(value.age ?? 0),
    homelandKey: String(value.homelandKey ?? ""),
    nature: Number(value.nature ?? 0),
    will: Number(value.will ?? 0),
    health: Number(value.health ?? 0),
    resources: Number(value.resources ?? 0),
    circles: Number(value.circles ?? 0),
    fate: Number(value.fate ?? 0),
    persona: Number(value.persona ?? 0),
    skillChecks: cleanMap(value.skillChecks),
    traitChecks: cleanMap(value.traitChecks),
    wiseChecks: cleanMap(value.wiseChecks),
    gear: (value.gear ?? []).map(entry => String(entry?.name ?? entry ?? "")).filter(Boolean)
  });
}
