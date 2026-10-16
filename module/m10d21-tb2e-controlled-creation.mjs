import { getRulesProfileRuntime, resolveRulesProfile } from "./rules-profile-service.mjs";
import { profileActivationAvailable } from "./m10-profile-activation.mjs";
import { tb2eClassStockPlan, tb2eCreationShadowStatus } from "./m10d-tb2e-creation-shadow.mjs";
import {
  createProfileCreationDraft,
  profileCreationCommitPlan,
  profileCreationPresentationSnapshot,
  profileCreationReview,
  resolveM10BCharacterCreationPolicy
} from "./m10b-character-creation.mjs";

const PROFILE_ID = "torchbearer2e";
const PHASE = "M10D.21";
const REQUIRED_CASES = Object.freeze([
  "CREATION_PROFILE_LOCKED",
  "M10D_CREATION_PREVIEW_ONLY",
  "CORE_M9_REVIEW_ONLY",
  "CORE_M9_COMMIT_BLOCKED"
]);
const evidence = new Map();

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function gateSnapshot() {
  const profile = resolveRulesProfile(PROFILE_ID).profile;
  const activeProfile = getRulesProfileRuntime().profile;
  const shadow = tb2eCreationShadowStatus();
  const policy = resolveM10BCharacterCreationPolicy(PROFILE_ID);
  const activationAvailable = profileActivationAvailable(PROFILE_ID);
  return freeze({
    phase: PHASE,
    qaRuntime: String(globalThis.game?.system?.version ?? "") === "1.13.0-qa.25",
    gmAuthority: globalThis.game?.user?.isGM === true,
    sourceBounded: shadow.adapterReady === true && shadow.liveEnabled === false && shadow.creationCommitAllowed === false,
    profileId: PROFILE_ID,
    profileLocked: profile.metadata?.foundationOnly === true
      && profile.metadata?.selectable === false
      && profile.metadata?.creationCommitAllowed === false
      && policy.foundationOnly === true
      && policy.liveCommit === false
      && activationAvailable === false,
    profileInactive: activeProfile?.id !== PROFILE_ID,
    activationAvailable,
    activeProfileId: String(activeProfile?.id ?? ""),
    creationCommitAllowed: false,
    writes: { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 }
  });
}

function requireGate() {
  const gate = gateSnapshot();
  if (!gate.qaRuntime) throw new Error("M10D.21 handoff is restricted to v1.13.0-qa.25.");
  if (!gate.gmAuthority) throw new Error("M10D.21 handoff is GM-only.");
  if (!gate.sourceBounded) throw new Error("The bounded TB2E Creation shadow is required.");
  if (!gate.profileLocked || gate.activationAvailable) throw new Error("TB2E creation must remain FOUNDATION_ONLY and non-committable.");
  if (!gate.profileInactive) throw new Error("Torchbearer 2E must remain inactive during this handoff.");
  return gate;
}

function record(caseId, gate, details, expected) {
  const passed = Boolean(expected);
  const row = freeze({
    caseId, ok: passed, expectedRejected: caseId === "CORE_M9_COMMIT_BLOCKED",
    provider: "CORE_M9_AND_M10D_CREATION_READ_ONLY_SHADOWS",
    route: "TORCHBEARER2E_FOUNDATION_PREVIEW_TO_EXISTING_CORE_M9_REVIEW_BOUNDARY",
    ...gate, details,
    randomRollExecuted: false, liveApplication: false, commitExecuted: false,
    writes: { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 }
  });
  evidence.set(caseId, row);
  return row;
}

export function getTb2eControlledCreationStatus() {
  const gate = gateSnapshot();
  const rows = REQUIRED_CASES.map(caseId => evidence.get(caseId)).filter(Boolean);
  const failed = rows.filter(row => !row.ok);
  return freeze({
    ...gate,
    mode: "TB2E_CONTROLLED_CREATION_PREVIEW_REVIEW_QA_HANDOFF",
    requiredCases: [...REQUIRED_CASES],
    executedCaseCount: rows.length,
    passedCaseCount: rows.filter(row => row.ok).length,
    failedCaseCount: failed.length,
    pendingCases: REQUIRED_CASES.filter(caseId => !evidence.has(caseId)),
    failedCases: failed.map(row => row.caseId),
    liveParityVerified: false,
    evidencePersistence: "MEMORY_ONLY",
    writes: { actors: 0, items: 0, journals: 0, settings: 0, chatMessages: 0 }
  });
}

export function getTb2eControlledCreationMatrix() {
  return freeze(REQUIRED_CASES.map(caseId => ({
    caseId, domain: caseId.startsWith("M10D_") ? "M10D_CREATION_SHADOW" : "CORE_M9_CREATION_BOUNDARY",
    status: evidence.has(caseId) ? (evidence.get(caseId).ok ? "PASS" : "FAIL") : "PENDING",
    required: true, liveApplication: false, writesPlanned: 0
  })));
}

export function runTb2eControlledCreationHandoff(caseId) {
  const gate = requireGate();
  if (!REQUIRED_CASES.includes(caseId)) throw new Error("Unsupported M10D.21 case: " + String(caseId));

  if (caseId === "CREATION_PROFILE_LOCKED") {
    const snapshot = profileCreationPresentationSnapshot(PROFILE_ID);
    const profile = resolveRulesProfile(PROFILE_ID).profile;
    const ok = snapshot.foundationOnly === true
      && snapshot.selectable === false
      && snapshot.liveCommit === false
      && snapshot.creationProfileId === PROFILE_ID
      && Object.keys(snapshot.grants ?? {}).length === 0
      && profile.metadata?.activationState === "FOUNDATION_ONLY";
    return record(caseId, gate, { presentation: snapshot, activationState: profile.metadata?.activationState }, ok);
  }

  if (caseId === "M10D_CREATION_PREVIEW_ONLY") {
    const plan = tb2eClassStockPlan({ className: "Burglar" });
    const ok = plan.ok === true && plan.stock === "HALFLING" && plan.will === 5 && plan.health === 3 && plan.liveApplication === false && plan.writesPlanned === 0;
    return record(caseId, gate, { plan }, ok);
  }

  if (caseId === "CORE_M9_REVIEW_ONLY") {
    const draft = createProfileCreationDraft(PROFILE_ID, { answers: { name: "QA-only preview" } });
    const review = profileCreationReview(PROFILE_ID, draft);
    const grants = draft.derivedValues?.grants ?? [];
    const ok = review.profileId === PROFILE_ID
      && review.valid === false
      && grants.length === 0
      && (draft.warnings ?? []).some(value => /FOUNDATION_ONLY|No derived statistics|No document grants/i.test(String(value)));
    return record(caseId, gate, { draftProfileId: draft.profileId, review, grants, draftWarnings: draft.warnings }, ok);
  }

  let rejected = false;
  let reason = "";
  try {
    const draft = createProfileCreationDraft(PROFILE_ID, { answers: { name: "QA-only preview" } });
    profileCreationCommitPlan(PROFILE_ID, draft);
  } catch (error) {
    rejected = true;
    reason = String(error?.message ?? error);
  }
  const ok = rejected && /FOUNDATION_ONLY|preflight failed|no creation commit/i.test(reason);
  return record(caseId, gate, { commitPlanRejected: rejected, reason }, ok);
}

export function resetTb2eControlledCreationEvidence() {
  evidence.clear();
  return getTb2eControlledCreationStatus();
}
