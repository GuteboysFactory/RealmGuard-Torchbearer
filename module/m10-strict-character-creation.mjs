import {
  createProfileCreationDraft,
  familyCreationPartyContext,
  profileCreationCommitPlan,
  profileCreationCommitPreview,
  profileCreationReview,
  resolveCharacterCreationProfile,
  resolveM10BCharacterCreationPolicy,
  updateProfileCreationDraft,
  validateProfileCreation,
  validateProfileCreationStep
} from "./m10b-character-creation.mjs";

export const STRICT_CREATION_PROFILE_ID = "realm-guard-strict";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

export function strictCreationPartyContext({ actors = null } = {}) {
  return familyCreationPartyContext({ actors });
}

export function strictCreateDraft(seed = {}) {
  return createProfileCreationDraft(STRICT_CREATION_PROFILE_ID, seed);
}

export function strictUpdateDraft(draft, changes = {}) {
  return updateProfileCreationDraft(STRICT_CREATION_PROFILE_ID, draft, changes);
}

export function strictValidateCreation(draft, { partyContext = null } = {}) {
  return validateProfileCreation(STRICT_CREATION_PROFILE_ID, draft, { partyContext });
}

export function strictValidateCreationStep(stepId, draft, { partyContext = null } = {}) {
  return validateProfileCreationStep(STRICT_CREATION_PROFILE_ID, stepId, draft, { partyContext });
}

export function strictCreationReview(draft, { partyContext = null } = {}) {
  return profileCreationReview(STRICT_CREATION_PROFILE_ID, draft, { partyContext });
}

export function strictCreationCommitPlan(draft, { partyContext = null } = {}) {
  return profileCreationCommitPlan(STRICT_CREATION_PROFILE_ID, draft, { partyContext });
}

export function strictCreationCommitPreview(draft, { partyContext = null, isGM = true, userId = "" } = {}) {
  return profileCreationCommitPreview(STRICT_CREATION_PROFILE_ID, draft, { partyContext, isGM, userId });
}

export function getStrictCreationStatus() {
  const policy = resolveM10BCharacterCreationPolicy(STRICT_CREATION_PROFILE_ID);
  return freeze({
    phase: "M10B.7_COMPAT_WRAPPER",
    compatibilityProvider: "M10B.7_GENERIC_CHARACTER_CREATION",
    profileId: policy.creationProfileId,
    profileVersion: policy.creationProfileVersion,
    coreEngine: policy.coreEngine,
    mode: policy.liveCommit ? "SUPPORTED_PROFILE_ROUTED_LIVE" : "READ_ONLY_PREVIEW",
    liveAuthority: policy.liveCommit ? "CORE_M9" : false,
    liveCommit: policy.liveCommit,
    ratedWises: policy.ratedWises,
    startingSkillWiseCap: policy.startingSkillWiseCap,
    strictEnemyValidation: policy.enemyValidation === "REALM_GUARD_STRICT_PEOPLES",
    mentorValidation: policy.mentorValidation !== "PROFILE_DEFINED",
    inventoryPolicy: policy.inventoryPolicy,
    conditions: {
      healthy: "DERIVED",
      provisioned: ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"],
      excluded: ["Fresh", "Afraid", "Sick"]
    },
    levels: false,
    talents: false,
    relationships: policy.liveCommit ? "CORE_M8_LIVE_COMMIT" : "CORE_M8_PLAN_ONLY",
    provenance: policy.liveCommit ? "STRICT_PROFILE_LIVE_WRITE" : "STRICT_PROFILE_PLAN_READY",
    liveCommitAvailable: policy.liveCommit,
    writesActorsOnCommit: policy.liveCommit,
    writesItemsOnCommit: policy.liveCommit,
    writesRelationshipsOnCommit: policy.liveCommit,
    nextStep: "M10B.7 Character Creation Profile Routing QA"
  });
}

export function strictCreationProfile() {
  return resolveCharacterCreationProfile(STRICT_CREATION_PROFILE_ID);
}
