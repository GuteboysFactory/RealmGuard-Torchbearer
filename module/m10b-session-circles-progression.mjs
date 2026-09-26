import { createM7Services, SessionState } from "./core/m7-session-services.mjs";
import { RelationshipRole, RelationshipStatus } from "./core/m8-social-network.mjs";
import { getActiveProfileCapabilities, resolveProfileCapabilities } from "./rules-profile-service.mjs";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function asInt(value, minimum = 0) {
  return Math.max(minimum, Math.trunc(Number(value ?? 0)));
}

function actorItems(actor) {
  try { return Array.from(actor?.items?.contents ?? actor?.items ?? []); }
  catch (_error) { return []; }
}

export function buildM10BSessionCirclesProgressionPolicy(capabilities) {
  const rules = capabilities?.rules ?? {};
  const session = rules.session ?? {};
  const circles = rules.circles ?? {};
  const progression = rules.progression ?? {};
  const familySemantics = session.familySemantics === true;
  return freeze({
    phase: "M10B.6",
    profileId: String(capabilities?.profile?.id ?? ""),
    profileVersion: Number(capabilities?.profile?.version ?? 0),
    familySemantics,
    session: {
      mode: String(session.mode ?? "PROFILE_DEFINED"),
      coreEngine: String(session.coreEngine ?? ""),
      playerTurnFreeTests: asInt(session.playerTurnFreeTests ?? 1),
      additionalTestCheckCost: asInt(session.additionalTestCheckCost ?? 1),
      alternationRequired: session.alternationRequired === true,
      soloAlternationException: session.soloAlternationException === true,
      gmTurnRecoveryCheckCost: asInt(session.gmTurnRecoveryCheckCost ?? 2),
      checksTransferable: session.checksTransferable !== false,
      endSessionMode: String(session.endSessionMode ?? "PROFILE_DEFINED"),
      embodimentMayAwardEveryone: session.embodimentMayAwardEveryone !== false,
      tableRewardAuthority: String(session.tableRewardAuthority ?? ""),
      foundryCommitAuthority: String(session.foundryCommitAuthority ?? "")
    },
    circles: {
      mode: String(circles.mode ?? "PROFILE_DEFINED"),
      familySemantics: circles.familySemantics === true,
      socialStorage: String(circles.socialStorage ?? ""),
      knownContactFutureDice: Number(circles.knownContactFutureDice ?? 0),
      enmityClause: circles.enmityClause === true,
      enmityArgumentSpeechDispositionSuccess: Number(circles.enmityArgumentSpeechDispositionSuccess ?? 0),
      automaticNpcCreation: circles.automaticNpcCreation === true
    },
    progression: {
      mode: String(progression.mode ?? "PROFILE_DEFINED"),
      levelsEnabled: progression.levelsEnabled === true,
      talentsEnabled: progression.talentsEnabled === true,
      preserveExistingData: progression.preserveExistingData !== false,
      lifetimeSpendLevelTrackingEnabled: progression.lifetimeSpendLevelTrackingEnabled === true,
      advancement: String(progression.advancement ?? "PROFILE_DEFINED"),
      ratingZeroOnePassNeeded: asInt(progression.ratingZeroOnePassNeeded ?? 1),
      clearSlateOnAdvance: progression.clearSlateOnAdvance === true,
      oneTestPerAbilityOrSkillPerConflictScene: progression.oneTestPerAbilityOrSkillPerConflictScene === true,
      beginnerLearningOpensAt: asInt(progression.beginnerLearningOpensAt ?? 2),
      beginnerLearningAttemptsUseMaximumNature: progression.beginnerLearningAttemptsUseMaximumNature === true,
      beginnerLuckAdvancesWillHealth: progression.beginnerLuckAdvancesWillHealth !== false
    },
    dataPolicy: {
      preserveProgressionData: capabilities?.dataPolicy?.preserveProgressionDataWhenHidden !== false,
      destructiveConversion: capabilities?.dataPolicy?.destructiveProfileConversion === true
    }
  });
}

export function getActiveM10BSessionCirclesProgressionPolicy() {
  return buildM10BSessionCirclesProgressionPolicy(getActiveProfileCapabilities());
}

export function resolveM10BSessionCirclesProgressionPolicy(profileId) {
  return buildM10BSessionCirclesProgressionPolicy(resolveProfileCapabilities(profileId));
}

export function familySessionPolicy(policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  return freeze({
    source: policy.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    ...policy.session,
    engine: policy.session.coreEngine || (policy.familySemantics ? "CORE_M7" : "LEGACY_CURRENT"),
    profileId: policy.profileId,
    liveApplication: false
  });
}

function sessionStateFrom(sessionState = {}, phase = "player") {
  return sessionState instanceof SessionState
    ? sessionState
    : new SessionState({
        enabled: sessionState?.enabled ?? true,
        phase: sessionState?.phase ?? phase,
        sessionCycle: sessionState?.sessionCycle ?? 1,
        turnCycleId: sessionState?.turnCycleId ?? 1,
        lastActorId: sessionState?.lastActorId ?? "",
        actors: sessionState?.actors ?? []
      });
}

export function familyPlayerTurnTestPlan({
  actor,
  actorState = {},
  sessionState = {},
  allowUntracked = false,
  label = "Test"
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const plan = createM7Services().sessionEngine.planTestClaim({
    actor,
    actorState,
    sessionState: sessionStateFrom(sessionState, "player"),
    allowUntracked,
    label
  });
  return freeze({
    ...plan,
    sourceOwnership: policy.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    profileId: policy.profileId,
    engine: policy.session.coreEngine || "CORE_M7",
    liveApplication: false
  });
}

export function familyRecoveryCheckPlan({
  actor,
  conditionName = "",
  sessionState = {}
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const plan = createM7Services().sessionEngine.planRecoverySpend({
    actor,
    conditionName,
    sessionState: sessionStateFrom(sessionState, "gm")
  });
  return freeze({
    ...plan,
    sourceOwnership: policy.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    profileId: policy.profileId,
    engine: policy.session.coreEngine || "CORE_M7",
    liveApplication: false
  });
}

export function familyEndSessionValidation({
  participantIds = [],
  mvpId = "",
  workhorseId = "",
  embodimentIds = []
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const participants = [...new Set((participantIds ?? []).map(String).filter(Boolean))];
  const participantSet = new Set(participants);
  const embodiments = [...new Set((embodimentIds ?? []).map(String).filter(Boolean))];
  const errors = [];

  if (mvpId && !participantSet.has(String(mvpId))) errors.push("MVP_NOT_PARTICIPANT");
  if (workhorseId && !participantSet.has(String(workhorseId))) errors.push("WORKHORSE_NOT_PARTICIPANT");
  if (mvpId && workhorseId && String(mvpId) === String(workhorseId)) errors.push("MVP_WORKHORSE_MUST_DIFFER");
  if (embodiments.some(id => !participantSet.has(id))) errors.push("EMBODIMENT_NOT_PARTICIPANT");
  if (!policy.session.embodimentMayAwardEveryone && participants.length > 0 && embodiments.length >= participants.length) {
    errors.push("EMBODIMENT_CANNOT_BE_EVERYONE");
  }

  return freeze({
    ok: errors.length === 0,
    errors,
    participantCount: participants.length,
    embodimentCount: embodiments.length,
    maxMvp: 1,
    maxWorkhorse: 1,
    embodimentMayBeMultiple: true,
    embodimentMayAwardEveryone: policy.session.embodimentMayAwardEveryone,
    tableAuthority: policy.session.tableRewardAuthority || (policy.familySemantics ? "GROUP_CONSENSUS" : "LEGACY_CURRENT"),
    foundryCommitAuthority: policy.session.foundryCommitAuthority || "GM",
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyRewardProposal({
  actorId = "",
  criteria = {},
  mvpId = "",
  workhorseId = ""
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  return freeze({
    ...createM7Services().rewardEngine.proposal({ actorId, criteria, mvpId, workhorseId }),
    sourceOwnership: policy.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    tableAuthority: policy.session.tableRewardAuthority || (policy.familySemantics ? "GROUP_CONSENSUS" : "LEGACY_CURRENT"),
    foundryCommitAuthority: policy.session.foundryCommitAuthority || "GM",
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyCirclesContactPlan({
  knownContact = false,
  successful = false,
  relationshipRole = RelationshipRole.CONTACT
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const isContact = String(relationshipRole ?? "") === RelationshipRole.CONTACT;
  const known = Boolean(knownContact && isContact);
  return freeze({
    source: policy.circles.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    knownContact: known,
    successCreatesOrConfirmsContact: Boolean(successful),
    futureCirclesDice: known ? Number(policy.circles.knownContactFutureDice ?? 0) : 0,
    futureBonusReason: known && Number(policy.circles.knownContactFutureDice ?? 0) ? "KNOWN_CONTACT_PLUS_1D" : "",
    socialStorage: policy.circles.socialStorage || (policy.circles.familySemantics ? "CORE_M8_FOUNDRY_TOOLING" : "LEGACY_CURRENT"),
    automaticNpcCreation: policy.circles.automaticNpcCreation,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyEnmityDispositionPlan({
  relationshipRole = RelationshipRole.ENEMY,
  relationshipStatus = RelationshipStatus.HOSTILE,
  conflictType = "",
  againstRelationshipOwner = false
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const type = String(conflictType ?? "").trim().toLowerCase();
  const hostileEnemy =
    String(relationshipRole ?? "").trim().toUpperCase() === RelationshipRole.ENEMY
    && String(relationshipStatus ?? "").trim().toUpperCase() === RelationshipStatus.HOSTILE;
  const qualifyingConflict = ["argument", "speech"].includes(type);
  const active = policy.circles.enmityClause && hostileEnemy && qualifyingConflict && Boolean(againstRelationshipOwner);
  return freeze({
    source: policy.circles.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    active,
    dispositionSuccess: active ? Number(policy.circles.enmityArgumentSpeechDispositionSuccess ?? 0) : 0,
    scope: "ARGUMENT_OR_SPEECH_AGAINST_RELATIONSHIP_OWNER",
    hostileEnemyRequired: true,
    qualifyingConflict,
    relationshipOwnerRequired: true,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyProgressionDataPolicy(actor, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const progression = actor?.system?.progression ?? {};
  const talents = actorItems(actor).filter(item => item?.type === "talent");
  return freeze({
    source: policy.progression.mode,
    levelsEnabled: policy.progression.levelsEnabled,
    talentsEnabled: policy.progression.talentsEnabled,
    lifetimeSpendLevelTrackingEnabled: policy.progression.lifetimeSpendLevelTrackingEnabled,
    preserveExistingData: policy.progression.preserveExistingData,
    preserved: {
      level: asInt(progression.level ?? 1, 1),
      spentFate: asInt(progression.spentFate ?? 0),
      spentPersona: asInt(progression.spentPersona ?? 0),
      talentItems: talents.length
    },
    deletionPlanned: false,
    migrationPlanned: false,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyResourceSpendPlan(actor, kind, amount = 1, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const resource = String(kind ?? "").toLowerCase();
  const supported = ["fate", "persona"].includes(resource);
  const spend = asInt(amount);
  const current = supported ? asInt(actor?.system?.resources?.[resource]?.value ?? 0) : 0;
  const level = asInt(actor?.system?.progression?.level ?? 1, 1);
  const spentFate = asInt(actor?.system?.progression?.spentFate ?? 0);
  const spentPersona = asInt(actor?.system?.progression?.spentPersona ?? 0);
  const affordable = supported && current >= spend;

  return freeze({
    ok: supported && affordable,
    reasonCode: !supported ? "UNSUPPORTED_RESOURCE" : (!affordable ? "INSUFFICIENT_RESOURCE" : ""),
    resource,
    requested: spend,
    before: current,
    after: affordable ? current - spend : current,
    resourceSpendAllowed: supported,
    progressionSideEffects: {
      levelBefore: level,
      levelAfter: level,
      spentFateBefore: spentFate,
      spentFateAfter: spentFate,
      spentPersonaBefore: spentPersona,
      spentPersonaAfter: spentPersona,
      levelUp: false,
      talentUnlocks: 0
    },
    lifetimeSpendLevelTrackingEnabled: policy.progression.lifetimeSpendLevelTrackingEnabled,
    preservesLegacyProgressionData: policy.progression.preserveExistingData,
    profileId: policy.profileId,
    liveApplication: false,
    writesExecuted: 0
  });
}

export function familyAdvancementRequirements(rating = 0, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const current = asInt(rating);
  if (!policy.familySemantics && policy.progression.advancement === "PROFILE_DEFINED") {
    return freeze({ rating: current, passNeeded: current <= 1 ? 1 : current, failNeeded: current <= 1 ? 0 : current - 1, source: "LEGACY_CURRENT" });
  }
  return freeze({
    rating: current,
    passNeeded: current <= 1 ? Number(policy.progression.ratingZeroOnePassNeeded ?? 1) : current,
    failNeeded: current <= 1 ? 0 : current - 1,
    source: policy.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT"
  });
}

export function familyAdvancementPlan({
  rating = 0,
  passed = 0,
  failed = 0
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const requirements = familyAdvancementRequirements(rating, policy);
  const passCount = asInt(passed);
  const failCount = asInt(failed);
  const ready = passCount >= requirements.passNeeded && failCount >= requirements.failNeeded;
  return freeze({
    ...requirements,
    passed: passCount,
    failed: failCount,
    readyToAdvance: ready,
    nextRating: ready ? requirements.rating + 1 : requirements.rating,
    clearSlateOnAdvance: policy.progression.clearSlateOnAdvance,
    nextPassed: ready && policy.progression.clearSlateOnAdvance ? 0 : passCount,
    nextFailed: ready && policy.progression.clearSlateOnAdvance ? 0 : failCount,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyConflictAdvancementPlan({
  sceneOrConflictId = "",
  abilityOrSkillId = "",
  loggedKeys = [],
  result = ""
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const id = String(abilityOrSkillId ?? "");
  const scope = String(sceneOrConflictId ?? "");
  const key = `${scope}::${id}`;
  const prior = new Set((loggedKeys ?? []).map(String));
  const normalizedResult = String(result ?? "").toLowerCase();
  const validResult = ["pass", "fail"].includes(normalizedResult);
  const limited = policy.progression.oneTestPerAbilityOrSkillPerConflictScene;
  const eligible = Boolean(scope && id && validResult && (!limited || !prior.has(key)));
  return freeze({
    key,
    eligible,
    result: validResult ? normalizedResult : "",
    oneTestPerAbilityOrSkillPerScene: limited,
    dispositionRollCounts: false,
    duplicateBlocked: limited && prior.has(key),
    nextLoggedKeys: eligible && limited ? [...prior, key] : [...prior],
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function familyBeginnerLearningPlan({
  maximumNature = 0,
  attempts = 0,
  attempted = true
} = {}, policy = getActiveM10BSessionCirclesProgressionPolicy()) {
  const target = policy.progression.beginnerLearningAttemptsUseMaximumNature ? asInt(maximumNature) : 0;
  const before = asInt(attempts);
  const after = before + Number(Boolean(attempted));
  const opens = target > 0 && after >= target;
  return freeze({
    source: policy.familySemantics ? "MG1E_2008" : "LEGACY_CURRENT",
    attemptsBefore: before,
    attemptsAfter: after,
    attemptsRequired: target,
    passFailIrrelevantForLearningAttempt: policy.familySemantics,
    opensSkill: opens,
    openingRating: opens ? Number(policy.progression.beginnerLearningOpensAt ?? 2) : 0,
    willAdvancementAllowed: policy.progression.beginnerLuckAdvancesWillHealth,
    healthAdvancementAllowed: policy.progression.beginnerLuckAdvancesWillHealth,
    profileId: policy.profileId,
    liveApplication: false
  });
}

export function getM10B6SessionCirclesProgressionStatus() {
  const policy = getActiveM10BSessionCirclesProgressionPolicy();
  return freeze({
    phase: "M10B.6",
    activeProfileId: policy.profileId,
    familySemantics: policy.familySemantics,
    session: policy.session,
    circles: policy.circles,
    progression: policy.progression,
    dataPolicy: policy.dataPolicy,
    writesActors: false,
    writesItems: false,
    liveApplication: false
  });
}
