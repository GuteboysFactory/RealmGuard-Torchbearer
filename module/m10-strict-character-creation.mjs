import {
  CharacterCreationEngine,
  CreationPartyContext
} from "./core/m9-creation.mjs";
import { FoundryCreationCommitAdapter } from "./m9-creation-commit-adapter.mjs";
import {
  REALM_GUARD_STRICT_CREATION_PROFILE,
  STRICT_CREATION_PROFILE_ID,
  STRICT_CREATION_PROFILE_VERSION
} from "./profiles/realm-guard-strict-creation.mjs";

const engine = new CharacterCreationEngine(REALM_GUARD_STRICT_CREATION_PROFILE);
const previewAdapter = new FoundryCreationCommitAdapter({ shadowOnly: true });

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function itemsOf(actor) {
  try { return Array.from(actor?.items?.contents ?? actor?.items ?? []); }
  catch (_error) { return []; }
}

function traitsOf(actor) {
  return itemsOf(actor)
    .filter(item => item?.type === "trait")
    .map(item => ({ name: String(item?.name ?? ""), rating: Number(item?.system?.rating ?? 0) }));
}

export function strictCreationPartyContext({ actors = null } = {}) {
  const source = actors ?? globalThis.game?.actors?.contents ?? [];
  return new CreationPartyContext({
    existingCharacters: source
      .filter(actor => actor?.type === "character")
      .map(actor => ({
        actorId: String(actor?.id ?? ""),
        name: String(actor?.name ?? ""),
        station: String(actor?.system?.rank ?? ""),
        age: Number(actor?.system?.age ?? 0),
        specialty: String(actor?.getFlag?.("realm-guard", "recruitmentSpecialty") ?? ""),
        traits: traitsOf(actor)
      }))
  });
}

export function strictCreateDraft(seed = {}) {
  return engine.createDraft(seed);
}

export function strictUpdateDraft(draft, changes = {}) {
  return engine.updateDraft(draft, changes);
}

export function strictValidateCreation(draft, { partyContext = null } = {}) {
  const context = partyContext ?? strictCreationPartyContext();
  const generic = engine.validate(draft, context);
  const errors = [...(generic.errors ?? [])];
  const warnings = [...(generic.warnings ?? [])];
  for (const step of REALM_GUARD_STRICT_CREATION_PROFILE.steps) {
    const result = engine.validateStep(step.id, draft, context);
    errors.push(...(result.errors ?? []));
    warnings.push(...(result.warnings ?? []));
  }
  const uniqueErrors = [];
  const seenErrors = new Set();
  for (const entry of errors) {
    const key = `${entry?.code ?? ""}|${entry?.field ?? ""}|${entry?.message ?? ""}`;
    if (seenErrors.has(key)) continue;
    seenErrors.add(key);
    uniqueErrors.push(entry);
  }
  return freeze({
    valid: uniqueErrors.length === 0,
    errors: uniqueErrors,
    warnings,
    profileId: STRICT_CREATION_PROFILE_ID,
    profileVersion: STRICT_CREATION_PROFILE_VERSION
  });
}

export function strictValidateCreationStep(stepId, draft, { partyContext = null } = {}) {
  return engine.validateStep(stepId, draft, partyContext ?? strictCreationPartyContext());
}

export function strictCreationReview(draft, { partyContext = null } = {}) {
  return engine.buildReview(draft, partyContext ?? strictCreationPartyContext());
}

export function strictCreationCommitPlan(draft, { partyContext = null } = {}) {
  const context = partyContext ?? strictCreationPartyContext();
  const validation = strictValidateCreation(draft, { partyContext: context });
  if (!validation.valid) {
    const first = validation.errors[0];
    throw new Error(`Strict Realm Guard creation preflight failed: ${first?.message ?? first?.code ?? "unknown validation error"}`);
  }
  return engine.buildCommitPlan(draft, context);
}

export function strictCreationCommitPreview(draft, { partyContext = null, isGM = true, userId = "" } = {}) {
  const plan = strictCreationCommitPlan(draft, { partyContext });
  return previewAdapter.preview(plan, { isGM, userId });
}

export function getStrictCreationStatus() {
  return freeze({
    phase: "M10A.6",
    profileId: STRICT_CREATION_PROFILE_ID,
    profileVersion: STRICT_CREATION_PROFILE_VERSION,
    coreEngine: "CORE_M9",
    mode: "READ_ONLY_PREVIEW",
    liveAuthority: false,
    liveCommit: false,
    ratedWises: true,
    startingSkillWiseCap: 6,
    strictEnemyValidation: true,
    mentorValidation: true,
    inventoryPolicy: "LOOSE",
    conditions: {
      healthy: "DERIVED",
      provisioned: ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"],
      excluded: ["Fresh", "Afraid", "Sick"]
    },
    levels: false,
    talents: false,
    relationships: "CORE_M8_PLAN_ONLY",
    provenance: "STRICT_PROFILE_PLAN_READY",
    writesActors: false,
    writesItems: false,
    writesRelationships: false,
    nextStep: "M10A.7 Scale / Docs / Rules Reference"
  });
}

export function strictCreationProfile() {
  return REALM_GUARD_STRICT_CREATION_PROFILE;
}
