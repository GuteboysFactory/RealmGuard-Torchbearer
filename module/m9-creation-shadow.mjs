import {
  CharacterCreationEngine,
  CreationPartyContext,
  comparableCreationSnapshot
} from "./core/m9-creation.mjs";
import { REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE } from "./profiles/realm-guard-legacy-mixed-creation.mjs";
import { REALM_GUARD_STRICT_CREATION_PROFILE } from "./profiles/realm-guard-strict-creation.mjs";
import { isStrictRealmGuard } from "./m10-profile-activation.mjs";
import { FoundryCreationCommitAdapter, compareCommitProjections } from "./m9-creation-commit-adapter.mjs";

const legacyEngine = new CharacterCreationEngine(REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE);
const strictEngine = new CharacterCreationEngine(REALM_GUARD_STRICT_CREATION_PROFILE);
const commitAdapter = new FoundryCreationCommitAdapter({ shadowOnly: false });

function activeCreationProfile() {
  return isStrictRealmGuard() ? REALM_GUARD_STRICT_CREATION_PROFILE : REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE;
}

function activeCreationEngine() {
  return isStrictRealmGuard() ? strictEngine : legacyEngine;
}
const history = [];
const draftEvents = [];
const draftByState = new WeakMap();
const MAX_HISTORY = 100;
const MAX_DRAFT_EVENTS = 250;
const MAX_COMMIT_EVENTS = 100;
const commitEvents = [];
let qaCommitMode = "CORE";
let qaFaultPhase = "";

const QA_FAULT_PHASES = Object.freeze([
  "CREATE_ACTOR",
  "PROVISION_SKILLS",
  "CREATE_ITEMS",
  "PROVISION_CONDITIONS",
  "NORMALIZE_RELATIONSHIPS",
  "WRITE_PROVENANCE"
]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function fromLegacyState(state = {}) {
  return activeCreationEngine().createDraft({
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
        mentor: {
          name: state.mentor,
          role: state.mentorRole,
          location: state.mentorLocation,
          age: Number(state.mentorAge ?? 0),
          traits: String(state.mentorTraits ?? "").split(",").map(value => value.trim()).filter(Boolean)
        },
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
        actorId: String(actor.id ?? ""),
        name: actor.name,
        specialty: String(actor.getFlag?.("realm-guard", "recruitmentSpecialty") ?? ""),
        station: String(actor.system?.rank ?? ""),
        age: Number(actor.system?.age ?? 0),
        traits: Array.from(actor.items ?? [])
          .filter(item => item?.type === "trait")
          .map(item => ({ name: String(item?.name ?? ""), rating: Number(item?.system?.rating ?? 0) }))
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
    commitAuthority: "CORE_M9",
    liveDraft: true,
    liveCommit: true,
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
  return activeCreationEngine().buildReview(draft, partyContext());
}

export function validateM9RecruitmentStep(state, stepId) {
  const draft = syncM9RecruitmentDraft(state, { stepId, reason: "validate" });
  const validation = activeCreationEngine().validateStep(stepId, draft, partyContext());
  return freeze({
    draft,
    validation,
    error: validation.errors?.[0]?.message ?? null
  });
}

export function observeM9RecruitmentDraft(state, legacyProjection = {}, legacyCommitProjection = null) {
  const draft = syncM9RecruitmentDraft(state, { stepId: "review", reason: "final-parity" });
  const core = coreSnapshot(draft);
  const strict = isStrictRealmGuard();
  const legacy = strict ? null : comparableCreationSnapshot(legacyProjection);
  const fields = Object.keys(core);
  const mismatchedFields = strict ? [] : fields.filter(key => JSON.stringify(core[key]) !== JSON.stringify(legacy[key]));
  const commitPlan = activeCreationEngine().buildCommitPlan(draft, partyContext());
  const commitPreview = commitAdapter.preview(commitPlan, {
    isGM: Boolean(globalThis.game?.user?.isGM),
    userId: String(globalThis.game?.user?.id ?? "")
  });
  const commitComparison = strict
    ? freeze({ parity: true, mismatchedFields: [], core: commitPreview.projection, legacy: null })
    : legacyCommitProjection
      ? compareCommitProjections(commitPreview.projection, legacyCommitProjection)
      : freeze({ parity: null, mismatchedFields: [], core: commitPreview.projection, legacy: null });
  const event = freeze({
    at: new Date().toISOString(),
    scope: "M9_CREATION_PARITY",
    draftAuthority: "CORE_M9",
    validationAuthority: "CORE_M9",
    commitAuthority: "CORE_M9",
    parityGuard: strict ? "STRICT_SOURCE_PROFILE" : "LEGACY_RECRUITMENT",
    liveDraft: true,
    liveCommit: true,
    commitPlanLiveMutation: Boolean(commitPlan.liveMutation),
    parity: strict || mismatchedFields.length === 0,
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


function recordCommitEvent(event) {
  commitEvents.push(freeze(event));
  if (commitEvents.length > MAX_COMMIT_EVENTS) commitEvents.shift();
}

function qaRuntime() {
  return String(globalThis.game?.system?.version ?? "").includes("-qa.");
}

export function setM9CommitMode(mode = "CORE") {
  const next = String(mode || "CORE").trim().toUpperCase();
  if (!["CORE", "LEGACY"].includes(next)) throw new Error("M9 commit mode must be CORE or LEGACY.");
  if (next === "LEGACY" && isStrictRealmGuard()) throw new Error("Legacy M9 commit override is disabled while Strict Realm Guard is active.");
  if (next === "LEGACY" && !qaRuntime()) throw new Error("Legacy M9 commit override is available only in QA builds.");
  qaCommitMode = next;
  return getM9CreationShadowStatus();
}

export function shouldUseLegacyM9Commit() {
  return qaCommitMode === "LEGACY" && !isStrictRealmGuard();
}

export function setM9CommitFailureTestPhase(phase = "") {
  if (!qaRuntime()) throw new Error("M9 commit fault injection is available only in QA builds.");
  const next = String(phase || "").trim().toUpperCase();
  if (next && !QA_FAULT_PHASES.includes(next)) {
    throw new Error(`Unknown M9 commit failure phase '${next}'. Valid phases: ${QA_FAULT_PHASES.join(", ")}.`);
  }
  qaFaultPhase = next;
  return freeze({ armed: Boolean(next), phase: next, oneShot: true });
}

function consumeQaFaultPhase() {
  const phase = qaFaultPhase;
  qaFaultPhase = "";
  return phase;
}

function validateDraftForLiveCommit(draft, context) {
  const engine = activeCreationEngine();
  const profile = activeCreationProfile();
  const errors = [];
  const generic = engine.validate(draft, context);
  errors.push(...(generic.errors ?? []));
  for (const step of profile.steps) {
    const result = engine.validateStep(step.id, draft, context);
    errors.push(...(result.errors ?? []));
  }

  const seen = new Set();
  const unique = errors.filter(entry => {
    const key = `${entry?.code ?? ""}|${entry?.field ?? ""}|${entry?.message ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return freeze({ valid: unique.length === 0, errors: unique });
}

export async function commitM9Recruitment(state) {
  if (shouldUseLegacyM9Commit()) throw new Error("CORE M9 commit was called while the QA Legacy commit override is active.");

  const draft = syncM9RecruitmentDraft(state, { stepId: "review", reason: "live-commit-preflight" });
  const context = partyContext();
  const validation = validateDraftForLiveCommit(draft, context);
  if (!validation.valid) {
    const first = validation.errors[0];
    throw new Error(`CORE M9 final commit validation failed: ${first?.message ?? first?.code ?? "unknown validation error"}`);
  }

  const rulesSnapshot = globalThis.game?.realmGuard?.core?.getActiveRulesSnapshot?.() ?? null;
  if (!rulesSnapshot?.rulesSnapshotHash) throw new Error("CORE M9 could not resolve the active Rules Profile snapshot.");

  const plan = activeCreationEngine().buildCommitPlan(draft, context);
  const faultPhase = consumeQaFaultPhase();
  const startedAt = new Date().toISOString();

  try {
    const result = await commitAdapter.execute(plan, {
      isGM: Boolean(globalThis.game?.user?.isGM),
      userId: String(globalThis.game?.user?.id ?? ""),
      rulesSnapshot,
      faultPhase
    });
    recordCommitEvent({
      at: new Date().toISOString(),
      startedAt,
      success: true,
      authority: "CORE_M9",
      actorId: result.actor?.id ?? "",
      actorName: result.actor?.name ?? "",
      rolledBack: false,
      completedPhases: [...(result.completedPhases ?? [])],
      faultPhase
    });
    return { ...result, plan };
  } catch (error) {
    recordCommitEvent({
      at: new Date().toISOString(),
      startedAt,
      success: false,
      authority: "CORE_M9",
      phase: error?.realmGuardCommit?.phase ?? "PREFLIGHT",
      actorId: error?.realmGuardCommit?.actorId ?? "",
      rolledBack: Boolean(error?.realmGuardCommit?.rolledBack),
      rollbackError: String(error?.realmGuardCommit?.rollbackError ?? ""),
      injected: Boolean(error?.realmGuardCommit?.injected),
      faultPhase
    });
    throw error;
  }
}

export function getM9CreationShadowStatus() {
  const rows = [...history];
  return freeze({
    phase: "M9",
    buildScope: "GENERIC_CHARACTER_CREATION_CORE_LIVE_COMMIT",
    mode: "CORE_LIVE_COMMIT",
    authority: "CORE_M9",
    draftAuthority: "CORE_M9",
    validationAuthority: "CORE_M9",
    commitAuthority: "CORE_M9",
    parityGuard: isStrictRealmGuard() ? "STRICT_SOURCE_PROFILE" : "LEGACY_RECRUITMENT",
    legacyCommitAvailability: isStrictRealmGuard()
      ? "DISABLED_UNDER_STRICT"
      : qaRuntime()
        ? (qaCommitMode === "LEGACY" ? "QA_OVERRIDE_ACTIVE" : "QA_EXPLICIT_ONLY")
        : "DISABLED_IN_STABLE",
    liveApplication: { draft: true, validation: true, commitPlan: true, commit: true, provenance: true, relationships: true },
    profileId: activeCreationProfile().id,
    profileVersion: activeCreationProfile().version,
    observations: rows.length,
    draftUpdates: draftEvents.length,
    mismatches: rows.filter(row => !row.parity).length,
    allParity: rows.length > 0 && rows.every(row => row.parity),
    commitObservations: rows.filter(row => row.commitParity !== null).length,
    commitMismatches: rows.filter(row => row.commitParity === false).length,
    allCommitParity: rows.some(row => row.commitParity !== null) && rows.filter(row => row.commitParity !== null).every(row => row.commitParity === true),
    liveCommits: commitEvents.filter(row => row.success).length,
    failedCommits: commitEvents.filter(row => !row.success).length,
    rollbacks: commitEvents.filter(row => row.rolledBack).length,
    commitMode: qaCommitMode,
    qaFaultArmed: qaFaultPhase || "",
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
      "TransactionalLiveCommit",
      "CreationProvenanceWrite",
      "M8RecruitmentNormalization",
      "CreationProvenance"
    ]
  });
}

export function installM9CreationShadow() {
  globalThis.Hooks?.once?.("ready", () => {
    globalThis.game.realmGuard ??= {};
    globalThis.game.realmGuard.core ??= {};
    globalThis.game.realmGuard.core.m9 ??= {};
    const api = {
      getStatus: getM9CreationShadowStatus,
      history: () => Object.freeze([...history]),
      draftHistory: () => Object.freeze([...draftEvents]),
      clear: () => { history.length = 0; draftEvents.length = 0; commitEvents.length = 0; qaFaultPhase = ""; return getM9CreationShadowStatus(); },
      commitHistory: () => Object.freeze([...commitEvents]),
      getCommitMode: () => qaCommitMode,
      profile: () => activeCreationProfile(),
      createDraftFromLegacyState: fromLegacyState,
      syncDraft: syncM9RecruitmentDraft,
      validateStep: validateM9RecruitmentStep,
      buildCommitPlanFromLegacyState: state => activeCreationEngine().buildCommitPlan(fromLegacyState(state), partyContext()),
      buildCommitPreviewFromLegacyState: state => commitAdapter.preview(activeCreationEngine().buildCommitPlan(fromLegacyState(state), partyContext()), {
        isGM: Boolean(globalThis.game?.user?.isGM),
        userId: String(globalThis.game?.user?.id ?? "")
      }),
      commitRecruitment: commitM9Recruitment
    };
    if (qaRuntime()) Object.assign(api, {
      setCommitMode: setM9CommitMode,
      testCommitFailure: setM9CommitFailureTestPhase
    });
    Object.assign(globalThis.game.realmGuard.core.m9, api);
    console.log("realm-guard | CORE M9 Character Creation live authority ready; Legacy comparison retained as parity guard", getM9CreationShadowStatus());
  });
}
