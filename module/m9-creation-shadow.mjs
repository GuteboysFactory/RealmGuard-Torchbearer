import {
  CharacterCreationEngine,
  CreationPartyContext,
  comparableCreationSnapshot
} from "./core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "./profiles/realm-guard-legacy-mixed-creation.mjs";
import { FoundryCreationCommitAdapter, compareCommitProjections } from "./m9-creation-commit-adapter.mjs";

const engine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const commitAdapter = new FoundryCreationCommitAdapter({ shadowOnly: true });
const history = [];
const draftEvents = [];
const draftByState = new WeakMap();
const MAX_HISTORY = 100;
const MAX_DRAFT_EVENTS = 250;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function fromLegacyState(state = {}) {
  return engine.createDraft({
    mode: state.mode ?? "guided",
    answers: {
      name: state.name,
      concept: state.concept,
      background: state.background,
      rank: state.rank,
      age: state.age,
      natureAnswers: state.natureAnswers,
      homelandKey: state.homelandKey,
      homelandSkill: state.homelandSkill,
      homelandTrait: state.homelandTrait,
      apprenticeship: state.apprenticeship,
      mentorTraining: state.mentorTraining,
      specialty: state.specialty,
      resourceAnswers: state.resourceAnswers,
      resourceTrade: state.resourceTrade,
      parentsResourceProfession: state.parentsResourceProfession,
      circleAnswers: state.circleAnswers,
      rangerTiesBasis: state.rangerTiesBasis,
      reputationNote: state.reputationNote,
      innateTrait: state.innateTrait,
      inheritedTrait: state.inheritedTrait,
      roadTrait: state.roadTrait,
      mentorRuleConfirmed: Boolean(state.mentorRuleConfirmed),
      allowEnemyServant: Boolean(state.allowEnemyServant),
      relationships: {
        lineage: state.lineage,
        insignia: state.insignia,
        mother: { name: state.mom, profession: state.momProfession, location: state.momLocation },
        father: { name: state.dad, profession: state.dadProfession, location: state.dadLocation },
        seniorArtisan: { name: state.seniorArtisan, profession: state.seniorArtisanProfession, location: state.seniorArtisanLocation },
        mentor: { name: state.mentor, role: state.mentorRole, location: state.mentorLocation },
        friend: { name: state.friend, profession: state.friendProfession, location: state.friendLocation },
        enemy: { name: state.enemyName, people: state.enemyPeople, profession: state.enemyProfession, location: state.enemyLocation }
      },
      drives: { belief: state.belief, goal: state.goal, instinct: state.instinct },
      weapon: state.weapon,
      armor: state.armor,
      distinctiveGear: state.distinctiveGear
    },
    allocations: {
      naturalTalent: state.naturalTalent,
      parentsTrade: state.parentsTrade,
      convincing: state.convincing,
      serviceAlloc: state.serviceAlloc,
      wiseChoices: state.wiseChoices
    },
    metadata: {
      overrides: state.allowEnemyServant ? ["ALLOW_ENEMY_SERVANT"] : [],
      optionalRules: state.allowEnemyServant ? ["ENEMY_SERVANT_HOUSE_RULE"] : []
    }
  });
}

function coreSnapshot(draft) {
  const d = draft.derivedValues;
  return comparableCreationSnapshot({
    rank: d.identity?.rank,
    age: d.identity?.age,
    homelandKey: d.identity?.homelandKey,
    nature: d.abilities?.nature,
    will: d.abilities?.will,
    health: d.abilities?.health,
    resources: d.abilities?.resources,
    circles: d.abilities?.circles,
    fate: d.resources?.fate,
    persona: d.resources?.persona,
    skillChecks: d.skillChecks,
    traitChecks: d.traitChecks,
    wiseChecks: d.wiseChecks,
    gear: d.gear
  });
}

function partyContext() {
  const actors = globalThis.game?.actors?.contents ?? [];
  return new CreationPartyContext({
    existingCharacters: actors
      .filter(actor => actor.type === "character")
      .map(actor => ({
        name: actor.name,
        specialty: String(actor.getFlag?.("realm-guard", "recruitmentSpecialty") ?? "")
      }))
  });
}

function applyDerivedToLegacyState(state, draft) {
  const abilities = draft.derivedValues?.abilities ?? {};
  state.nature = Number(abilities.nature ?? state.nature ?? 3);
  state.resources = Number(abilities.resources ?? state.resources ?? 0);
  state.circles = Number(abilities.circles ?? state.circles ?? 1);
  return draft;
}

function recordDraftEvent(event) {
  draftEvents.push(freeze(event));
  if (draftEvents.length > MAX_DRAFT_EVENTS) draftEvents.shift();
}

export function syncM9RecruitmentDraft(state, { stepId = "", reason = "sync" } = {}) {
  const draft = applyDerivedToLegacyState(state, fromLegacyState(state));
  draftByState.set(state, draft);
  recordDraftEvent({
    at: new Date().toISOString(),
    scope: "M9_CREATION_DRAFT_LIVE",
    stepId: String(stepId ?? ""),
    reason: String(reason ?? "sync"),
    draftAuthority: "CORE_M9",
    validationAuthority: "CORE_M9",
    commitAuthority: "LEGACY_RECRUITMENT",
    liveDraft: true,
    liveCommit: false,
    profileId: draft.profileId,
    profileVersion: draft.profileVersion
  });
  return draft;
}

export function getM9RecruitmentDraft(state) {
  return draftByState.get(state) ?? syncM9RecruitmentDraft(state, { reason: "lazy" });
}

export function getM9RecruitmentRestrictions(state) {
  const draft = getM9RecruitmentDraft(state);
  return {
    bannedTraits: new Set(draft.derivedValues?.restrictions?.bannedTraits ?? [])
  };
}

export function getM9RecruitmentReview(state) {
  const draft = getM9RecruitmentDraft(state);
  return engine.buildReview(draft, partyContext());
}

export function validateM9RecruitmentStep(state, stepId) {
  const draft = syncM9RecruitmentDraft(state, { stepId, reason: "validate" });
  const validation = engine.validateStep(stepId, draft, partyContext());
  return freeze({
    draft,
    validation,
    error: validation.errors?.[0]?.message ?? null
  });
}

export function observeM9RecruitmentDraft(state, legacyProjection = {}, legacyCommitProjection = null) {
  const draft = syncM9RecruitmentDraft(state, { stepId: "review", reason: "final-parity" });
  const core = coreSnapshot(draft);
  const legacy = comparableCreationSnapshot(legacyProjection);
  const fields = Object.keys(core);
  const mismatchedFields = fields.filter(key => JSON.stringify(core[key]) !== JSON.stringify(legacy[key]));
  const commitPlan = engine.buildCommitPlan(draft, partyContext());
  const commitPreview = commitAdapter.preview(commitPlan, {
    isGM: Boolean(globalThis.game?.user?.isGM),
    userId: String(globalThis.game?.user?.id ?? "")
  });
  const commitComparison = legacyCommitProjection
    ? compareCommitProjections(commitPreview.projection, legacyCommitProjection)
    : freeze({ parity: null, mismatchedFields: [], core: commitPreview.projection, legacy: null });
  const event = freeze({
    at: new Date().toISOString(),
    scope: "M9_CREATION_PARITY",
    draftAuthority: "CORE_M9",
    validationAuthority: "CORE_M9",
    commitAuthority: "LEGACY_RECRUITMENT",
    commitShadowAuthority: "CORE_M9_PLAN_AND_FOUNDRY_ADAPTER",
    liveDraft: true,
    liveCommit: false,
    commitPlanLiveMutation: false,
    parity: mismatchedFields.length === 0,
    mismatchedFields,
    commitParity: commitComparison.parity,
    commitMismatchedFields: commitComparison.mismatchedFields,
    legacy,
    core,
    commitPlan,
    commitPreview
  });
  history.push(event);
  if (history.length > MAX_HISTORY) history.shift();
  try { globalThis.Hooks?.callAll?.("realmGuardM9CreationShadow", event); } catch (_error) { /* observer only */ }
  return event;
}

export function getM9CreationShadowStatus() {
  const rows = [...history];
  return freeze({
    phase: "M9",
    buildScope: "GENERIC_CHARACTER_CREATION_COMMIT_PLAN_SHADOW",
    mode: "DRAFT_LIVE_COMMIT_PLAN_SHADOW",
    authority: "SPLIT",
    draftAuthority: "CORE_M9",
    validationAuthority: "CORE_M9",
    commitAuthority: "LEGACY_RECRUITMENT",
    commitShadowAuthority: "CORE_M9_PLAN_AND_FOUNDRY_ADAPTER",
    liveApplication: { draft: true, validation: true, commitPlan: true, commit: false },
    profileId: REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.id,
    profileVersion: REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE.version,
    observations: rows.length,
    draftUpdates: draftEvents.length,
    mismatches: rows.filter(row => !row.parity).length,
    allParity: rows.length > 0 && rows.every(row => row.parity),
    commitObservations: rows.filter(row => row.commitParity !== null).length,
    commitMismatches: rows.filter(row => row.commitParity === false).length,
    allCommitParity: rows.some(row => row.commitParity !== null) && rows.filter(row => row.commitParity !== null).every(row => row.commitParity === true),
    capabilities: [
      "CreationDraft",
      "CharacterCreationProfile",
      "CreationStepValidation",
      "CreationRestriction",
      "CreationPartyContext",
      "CreationReview",
      "CreationCommitPlan",
      "FoundryCreationCommitAdapter",
      "CompensatingRollbackPlan",
      "CreationProvenance"
    ]
  });
}

export function installM9CreationShadow() {
  globalThis.Hooks?.once?.("ready", () => {
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.core ??= {};
    globalThis.game.realmGuard.core.m9 ??= {};
    Object.assign(globalThis.game.realmGuard.core.m9, {
      getStatus: getM9CreationShadowStatus,
      history: () => Object.freeze([...history]),
      draftHistory: () => Object.freeze([...draftEvents]),
      clear: () => { history.length = 0; draftEvents.length = 0; return getM9CreationShadowStatus(); },
      profile: () => REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE,
      createDraftFromLegacyState: fromLegacyState,
      syncDraft: syncM9RecruitmentDraft,
      validateStep: validateM9RecruitmentStep,
      buildCommitPlanFromLegacyState: state => engine.buildCommitPlan(fromLegacyState(state), partyContext()),
      buildCommitPreviewFromLegacyState: state => commitAdapter.preview(engine.buildCommitPlan(fromLegacyState(state), partyContext()), {
        isGM: Boolean(globalThis.game?.user?.isGM),
        userId: String(globalThis.game?.user?.id ?? "")
      })
    });
    console.log("realm-guard | CORE M9 commit plan + Foundry adapter shadow active; Legacy Recruitment commit retained", getM9CreationShadowStatus());
  });
}
