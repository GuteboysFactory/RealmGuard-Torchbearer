import { CharacterCreationEngine, CreationPartyContext } from "./core/m9-creation.mjs";
import { FoundryCreationCommitAdapter } from "./m9-creation-commit-adapter.mjs";
import { buildProfileCapabilities } from "./profile-capabilities.mjs";
import { getActiveRulesProfile, resolveRulesProfile } from "./rules-profile-service.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "./profiles/realm-guard-legacy-mixed-creation.mjs";
import { REALM_GUARD_STRICT_CREATION_PROFILE } from "./profiles/realm-guard-strict-creation.mjs";
import { MG1E_CREATION_PROFILE } from "./profiles/mg1e-creation.mjs";

const CREATION_PROFILES = new Map([
  [REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.id, REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE],
  [REALM_GUARD_STRICT_CREATION_PROFILE.id, REALM_GUARD_STRICT_CREATION_PROFILE],
  [MG1E_CREATION_PROFILE.id, MG1E_CREATION_PROFILE]
]);
const ENGINES = new Map([...CREATION_PROFILES.entries()].map(([id, profile]) => [id, new CharacterCreationEngine(profile)]));
const previewAdapter = new FoundryCreationCommitAdapter({ shadowOnly: true });

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function creationProfileIdForRulesProfile(profile) {
  return String(profile?.domains?.creation?.profileId || profile?.id || "");
}

function liveAuthorityAllowsCommit(profile, capabilities) {
  if (profile?.metadata?.foundationOnly === true) return false;
  if (capabilities?.profile?.liveRuleAuthority === false) return false;
  const authority = String(capabilities?.rules?.creation?.liveAuthority ?? "").toUpperCase();
  return authority === "CORE_M9" || authority === "CORE_M9_WHEN_ACTIVE";
}

function activeProfileIdSafe() {
  try { return String(getActiveRulesProfile()?.id ?? ""); }
  catch (_error) { return ""; }
}

export function resolveM10BCharacterCreationPolicy(profileId = null) {
  const { profile } = resolveRulesProfile(profileId);
  const capabilities = buildProfileCapabilities(profile);
  const creationProfileId = creationProfileIdForRulesProfile(profile);
  const creationProfile = CREATION_PROFILES.get(creationProfileId) ?? null;
  const active = activeProfileIdSafe() === profile.id;
  const profileAllowsLiveCommit = liveAuthorityAllowsCommit(profile, capabilities);

  return freeze({
    phase: "M10B.7",
    source: "RESOLVED_RULES_PROFILE",
    rulesProfileId: profile.id,
    rulesProfileVersion: profile.version,
    rulesSnapshotHash: profile.rulesSnapshotHash,
    foundationOnly: profile.metadata?.foundationOnly === true,
    selectable: profile.metadata?.selectable !== false,
    supported: profile.metadata?.supported !== false,
    active,
    creationProfileId,
    creationProfileVersion: Number(creationProfile?.version ?? capabilities.rules.creation.profileVersion ?? 0),
    creationProfileName: String(creationProfile?.name ?? ""),
    coreEngine: String(capabilities.rules.creation.coreEngine || "CORE_M9"),
    mode: String(capabilities.rules.creation.mode || "PROFILE_DEFINED"),
    liveAuthority: String(capabilities.rules.creation.liveAuthority || "NONE"),
    profileAllowsLiveCommit,
    liveCommit: active && profileAllowsLiveCommit,
    familySemantics: capabilities.rules.creation.familySemantics === true,
    ratedWises: capabilities.rules.creation.ratedWises === true,
    wiseMode: String(capabilities.rules.creation.wiseMode || "PROFILE_DEFINED"),
    startingSkillWiseCap: Number(capabilities.rules.creation.startingSkillWiseCap || 0),
    inventoryPolicy: String(capabilities.rules.creation.inventoryPolicy || "PROFILE_DEFINED"),
    mentorValidation: String(capabilities.rules.creation.mentorValidation || "PROFILE_DEFINED"),
    enemyValidation: String(capabilities.rules.creation.enemyValidation || "PROFILE_DEFINED"),
    enemyHouseRuleAllowed: capabilities.rules.creation.enemyHouseRuleAllowed === true,
    allowedEnemyPeoples: [...(capabilities.rules.creation.allowedEnemyPeoples ?? [])],
    conditionProvisioning: String(capabilities.rules.creation.conditionProvisioning || "PROFILE_DEFINED"),
    automaticNpcCreation: capabilities.rules.creation.automaticNpcCreation === true,
    legacyCommitOverrideAllowed: capabilities.rules.creation.legacyCommitOverrideAllowed === true,
    creationProfileAvailable: Boolean(creationProfile),
    dataPolicy: {
      preserveInactiveData: capabilities.dataPolicy.preserveInactiveData,
      destructiveProfileConversion: capabilities.dataPolicy.destructiveProfileConversion,
      deleteOnProfileSwitch: capabilities.dataPolicy.deleteOnProfileSwitch
    },
    writes: {
      actorsOnResolve: 0,
      itemsOnResolve: 0,
      relationshipsOnResolve: 0,
      settingsOnResolve: 0
    }
  });
}

export function getActiveM10BCharacterCreationPolicy() {
  return resolveM10BCharacterCreationPolicy(null);
}

export function resolveCharacterCreationProfile(profileId = null) {
  const policy = resolveM10BCharacterCreationPolicy(profileId);
  const profile = CREATION_PROFILES.get(policy.creationProfileId);
  if (!profile) throw new Error(`No CharacterCreationProfile is registered for Rules Profile '${policy.rulesProfileId}'.`);
  return profile;
}

export function resolveCharacterCreationEngine(profileId = null) {
  const profile = resolveCharacterCreationProfile(profileId);
  const engine = ENGINES.get(profile.id);
  if (!engine) throw new Error(`No CharacterCreationEngine is registered for Creation Profile '${profile.id}'.`);
  return engine;
}

export function activeCharacterCreationProfile() {
  return resolveCharacterCreationProfile(null);
}

export function activeCharacterCreationEngine() {
  return resolveCharacterCreationEngine(null);
}

function traitsOf(actor) {
  try {
    return Array.from(actor?.items?.contents ?? actor?.items ?? [])
      .filter(item => item?.type === "trait")
      .map(item => ({ name: String(item?.name ?? ""), rating: Number(item?.system?.rating ?? 0) }));
  } catch (_error) {
    return [];
  }
}

export function familyCreationPartyContext({ actors = null, otherDraftCharacters = [] } = {}) {
  const source = actors ?? globalThis.game?.actors?.contents ?? [];
  return new CreationPartyContext({
    existingCharacters: source
      .filter(actor => actor?.type === "character")
      .map(actor => ({
        actorId: String(actor?.id ?? ""),
        name: String(actor?.name ?? ""),
        rank: String(actor?.system?.rank ?? ""),
        station: String(actor?.system?.rank ?? ""),
        age: Number(actor?.system?.age ?? 0),
        specialty: String(actor?.getFlag?.("realm-guard", "recruitmentSpecialty") ?? ""),
        traits: traitsOf(actor)
      })),
    otherDraftCharacters
  });
}

export function createProfileCreationDraft(profileId, seed = {}) {
  return resolveCharacterCreationEngine(profileId).createDraft(seed);
}

export function updateProfileCreationDraft(profileId, draft, changes = {}) {
  return resolveCharacterCreationEngine(profileId).updateDraft(draft, changes);
}

export function validateProfileCreation(profileId, draft, { partyContext = null } = {}) {
  const engine = resolveCharacterCreationEngine(profileId);
  const profile = resolveCharacterCreationProfile(profileId);
  const context = partyContext ?? familyCreationPartyContext();
  const generic = engine.validate(draft, context);
  const errors = [...(generic.errors ?? [])];
  const warnings = [...(generic.warnings ?? [])];

  for (const step of profile.steps) {
    const result = engine.validateStep(step.id, draft, context);
    errors.push(...(result.errors ?? []));
    warnings.push(...(result.warnings ?? []));
  }

  const unique = new Map();
  for (const entry of errors) {
    const key = `${entry?.code ?? ""}|${entry?.field ?? ""}|${entry?.message ?? ""}`;
    if (!unique.has(key)) unique.set(key, { ...entry });
  }

  return freeze({
    valid: unique.size === 0,
    errors: [...unique.values()],
    warnings,
    profileId: profile.id,
    profileVersion: profile.version
  });
}

export function validateProfileCreationStep(profileId, stepId, draft, { partyContext = null } = {}) {
  return resolveCharacterCreationEngine(profileId).validateStep(stepId, draft, partyContext ?? familyCreationPartyContext());
}

export function profileCreationReview(profileId, draft, { partyContext = null } = {}) {
  return resolveCharacterCreationEngine(profileId).buildReview(draft, partyContext ?? familyCreationPartyContext());
}

export function profileCreationCommitPlan(profileId, draft, { partyContext = null } = {}) {
  const context = partyContext ?? familyCreationPartyContext();
  const validation = validateProfileCreation(profileId, draft, { partyContext: context });
  if (!validation.valid) {
    const first = validation.errors[0];
    throw new Error(`Character Creation preflight failed for ${profileId}: ${first?.message ?? first?.code ?? "unknown validation error"}`);
  }
  return resolveCharacterCreationEngine(profileId).buildCommitPlan(draft, context);
}

export function profileCreationCommitPreview(profileId, draft, { partyContext = null, isGM = true, userId = "" } = {}) {
  const plan = profileCreationCommitPlan(profileId, draft, { partyContext });
  return previewAdapter.preview(plan, { isGM, userId });
}

export function getM10B7CharacterCreationStatus() {
  const rows = ["realm-guard-legacy-mixed", "realm-guard-strict", "mg1e"].map(id => resolveM10BCharacterCreationPolicy(id));
  const mg1e = rows.find(row => row.rulesProfileId === "mg1e");
  return freeze({
    phase: "M10B.7",
    mode: "GENERIC_CHARACTER_CREATION_PROFILE_ROUTER",
    coreEngine: "CORE_M9",
    profiles: rows,
    mg1eFoundation: {
      profileVersion: mg1e?.rulesProfileVersion ?? 0,
      creationProfileVersion: mg1e?.creationProfileVersion ?? 0,
      foundationOnly: mg1e?.foundationOnly === true,
      selectable: mg1e?.selectable === true,
      liveCommit: mg1e?.liveCommit === true
    },
    writesOnResolve: 0,
    automaticConversion: false,
    automaticNpcCreation: false
  });
}
