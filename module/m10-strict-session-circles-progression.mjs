import { createM7Services, SessionState } from "./core/m7-session-services.mjs";
import { RelationshipRole, RelationshipStatus } from "./core/m8-social-network.mjs";

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

export function strictSessionPolicy() {
  return freeze({
    source: "MG1E_2008",
    playerTurnFreeTests: 1,
    additionalPlayerTurnTestCheckCost: 1,
    alternationRequired: true,
    soloAlternationException: true,
    gmTurnRecoveryCheckCost: 2,
    checksTransferable: true,
    engine: "CORE_M7",
    liveApplication: false
  });
}

export function strictPlayerTurnTestPlan({
  actor,
  actorState = {},
  sessionState = {},
  allowUntracked = false,
  label = "Test"
} = {}) {
  const services = createM7Services();
  const state = sessionState instanceof SessionState
    ? sessionState
    : new SessionState({
        enabled: sessionState?.enabled ?? true,
        phase: sessionState?.phase ?? "player",
        sessionCycle: sessionState?.sessionCycle ?? 1,
        turnCycleId: sessionState?.turnCycleId ?? 1,
        lastActorId: sessionState?.lastActorId ?? "",
        actors: sessionState?.actors ?? []
      });
  const plan = services.sessionEngine.planTestClaim({
    actor,
    actorState,
    sessionState: state,
    allowUntracked,
    label
  });
  return freeze({
    ...plan,
    sourceOwnership: "MG1E_2008",
    engine: "CORE_M7",
    liveApplication: false
  });
}

export function strictRecoveryCheckPlan({ actor, conditionName = "", sessionState = {} } = {}) {
  const services = createM7Services();
  const state = sessionState instanceof SessionState
    ? sessionState
    : new SessionState({
        enabled: sessionState?.enabled ?? true,
        phase: sessionState?.phase ?? "gm",
        sessionCycle: sessionState?.sessionCycle ?? 1,
        turnCycleId: sessionState?.turnCycleId ?? 1,
        actors: sessionState?.actors ?? []
      });
  return freeze({
    ...services.sessionEngine.planRecoverySpend({ actor, conditionName, sessionState: state }),
    sourceOwnership: "MG1E_2008",
    engine: "CORE_M7",
    liveApplication: false
  });
}

export function strictEndSessionValidation({
  participantIds = [],
  mvpId = "",
  workhorseId = "",
  embodimentIds = []
} = {}) {
  const participants = [...new Set((participantIds ?? []).map(String).filter(Boolean))];
  const participantSet = new Set(participants);
  const embodiments = [...new Set((embodimentIds ?? []).map(String).filter(Boolean))];
  const errors = [];

  if (mvpId && !participantSet.has(String(mvpId))) errors.push("MVP_NOT_PARTICIPANT");
  if (workhorseId && !participantSet.has(String(workhorseId))) errors.push("WORKHORSE_NOT_PARTICIPANT");
  if (mvpId && workhorseId && String(mvpId) === String(workhorseId)) errors.push("MVP_WORKHORSE_MUST_DIFFER");
  if (embodiments.some(id => !participantSet.has(id))) errors.push("EMBODIMENT_NOT_PARTICIPANT");
  if (participants.length > 0 && embodiments.length >= participants.length) errors.push("EMBODIMENT_CANNOT_BE_EVERYONE");

  return freeze({
    ok: errors.length === 0,
    errors,
    participantCount: participants.length,
    embodimentCount: embodiments.length,
    maxMvp: 1,
    maxWorkhorse: 1,
    embodimentMayBeMultiple: true,
    embodimentMayAwardEveryone: false,
    tableAuthority: "GROUP_CONSENSUS",
    foundryCommitAuthority: "GM",
    liveApplication: false
  });
}

export function strictRewardProposal({
  actorId = "",
  criteria = {},
  mvpId = "",
  workhorseId = ""
} = {}) {
  const services = createM7Services();
  return freeze({
    ...services.rewardEngine.proposal({ actorId, criteria, mvpId, workhorseId }),
    sourceOwnership: "MG1E_2008",
    tableAuthority: "GROUP_CONSENSUS",
    foundryCommitAuthority: "GM",
    liveApplication: false
  });
}

export function strictCirclesContactPlan({
  knownContact = false,
  successful = false,
  relationshipRole = RelationshipRole.CONTACT
} = {}) {
  const isContact = String(relationshipRole ?? "") === RelationshipRole.CONTACT;
  const known = Boolean(knownContact && isContact);
  return freeze({
    source: "MG1E_2008",
    knownContact: known,
    successCreatesOrConfirmsContact: Boolean(successful),
    futureCirclesDice: known ? 1 : 0,
    futureBonusReason: known ? "KNOWN_CONTACT_PLUS_1D" : "",
    socialStorage: "CORE_M8_FOUNDRY_TOOLING",
    automaticNpcCreation: false,
    liveApplication: false
  });
}

export function strictEnmityDispositionPlan({
  relationshipRole = RelationshipRole.ENEMY,
  relationshipStatus = RelationshipStatus.HOSTILE,
  conflictType = "",
  againstRelationshipOwner = false
} = {}) {
  const type = String(conflictType ?? "").trim().toLowerCase();
  const hostileEnemy =
    String(relationshipRole ?? "").trim().toUpperCase() === RelationshipRole.ENEMY
    && String(relationshipStatus ?? "").trim().toUpperCase() === RelationshipStatus.HOSTILE;
  const qualifyingConflict = ["argument", "speech"].includes(type);
  const active = hostileEnemy && qualifyingConflict && Boolean(againstRelationshipOwner);
  return freeze({
    source: "MG1E_2008",
    active,
    dispositionSuccess: active ? 3 : 0,
    scope: "ARGUMENT_OR_SPEECH_AGAINST_RELATIONSHIP_OWNER",
    hostileEnemyRequired: true,
    qualifyingConflict,
    relationshipOwnerRequired: true,
    liveApplication: false
  });
}

export function strictProgressionDataPolicy(actor) {
  const progression = actor?.system?.progression ?? {};
  const talents = actorItems(actor).filter(item => item?.type === "talent");
  return freeze({
    source: "MG1E_2008_STRICT_NO_TB_LEVELS",
    levelsEnabled: false,
    talentsEnabled: false,
    lifetimeSpendLevelTrackingEnabled: false,
    preserveExistingData: true,
    preserved: {
      level: asInt(progression.level ?? 1, 1),
      spentFate: asInt(progression.spentFate ?? 0),
      spentPersona: asInt(progression.spentPersona ?? 0),
      talentItems: talents.length
    },
    deletionPlanned: false,
    migrationPlanned: false,
    liveApplication: false
  });
}

export function strictResourceSpendPlan(actor, kind, amount = 1) {
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
    preservesLegacyProgressionData: true,
    liveApplication: false,
    writesExecuted: 0
  });
}

export function strictAdvancementRequirements(rating = 0) {
  const current = asInt(rating);
  return freeze({
    rating: current,
    passNeeded: current <= 1 ? 1 : current,
    failNeeded: current <= 1 ? 0 : current - 1,
    source: "MG1E_2008"
  });
}

export function strictAdvancementPlan({
  rating = 0,
  passed = 0,
  failed = 0
} = {}) {
  const requirements = strictAdvancementRequirements(rating);
  const passCount = asInt(passed);
  const failCount = asInt(failed);
  const ready = passCount >= requirements.passNeeded && failCount >= requirements.failNeeded;
  return freeze({
    ...requirements,
    passed: passCount,
    failed: failCount,
    readyToAdvance: ready,
    nextRating: ready ? requirements.rating + 1 : requirements.rating,
    clearSlateOnAdvance: ready,
    nextPassed: ready ? 0 : passCount,
    nextFailed: ready ? 0 : failCount,
    liveApplication: false
  });
}

export function strictConflictAdvancementPlan({
  sceneOrConflictId = "",
  abilityOrSkillId = "",
  loggedKeys = [],
  result = ""
} = {}) {
  const id = String(abilityOrSkillId ?? "");
  const scope = String(sceneOrConflictId ?? "");
  const key = `${scope}::${id}`;
  const prior = new Set((loggedKeys ?? []).map(String));
  const normalizedResult = String(result ?? "").toLowerCase();
  const validResult = ["pass", "fail"].includes(normalizedResult);
  const eligible = Boolean(scope && id && validResult && !prior.has(key));
  return freeze({
    key,
    eligible,
    result: validResult ? normalizedResult : "",
    oneTestPerAbilityOrSkillPerScene: true,
    dispositionRollCounts: false,
    duplicateBlocked: prior.has(key),
    nextLoggedKeys: eligible ? [...prior, key] : [...prior],
    liveApplication: false
  });
}

export function strictBeginnerLearningPlan({
  maximumNature = 0,
  attempts = 0,
  attempted = true
} = {}) {
  const target = asInt(maximumNature);
  const before = asInt(attempts);
  const after = before + Number(Boolean(attempted));
  const opens = target > 0 && after >= target;
  return freeze({
    source: "MG1E_2008",
    attemptsBefore: before,
    attemptsAfter: after,
    attemptsRequired: target,
    passFailIrrelevantForLearningAttempt: true,
    opensSkill: opens,
    openingRating: opens ? 2 : 0,
    willAdvancementAllowed: false,
    healthAdvancementAllowed: false,
    liveApplication: false
  });
}

export function getStrictSessionCirclesProgressionStatus() {
  return freeze({
    phase: "M10A.5",
    liveAuthority: false,
    activeProfileRequired: "realm-guard-strict",
    session: {
      engine: "CORE_M7",
      source: "MG1E_2008",
      freePlayerTurnTests: 1,
      additionalTestCheckCost: 1,
      alternation: true,
      soloException: true,
      gmTurnRecoveryCheckCost: 2,
      embodimentMayAwardEveryone: false,
      tableRewardAuthority: "GROUP_CONSENSUS",
      foundryCommitAuthority: "GM"
    },
    circles: {
      source: "MG1E_2008",
      socialStorage: "CORE_M8_FOUNDRY_TOOLING",
      knownContactFutureDice: 1,
      enmityClause: true,
      enmityArgumentSpeechDispositionSuccess: 3
    },
    progression: {
      source: "MG1E_2008",
      levels: false,
      talents: false,
      preserveLegacyData: true,
      fatePersonaSpendStillAllowed: true,
      lifetimeSpendLevelTracking: false,
      advancement: "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1",
      ratingZeroOnePassNeeded: 1,
      clearSlateOnAdvance: true,
      oneTestPerAbilityOrSkillPerConflictScene: true,
      beginnerLearningOpensAt: 2
    },
    writesActors: false,
    writesItems: false,
    liveApplication: false,
    nextStep: "M10A.6 Strict Character Creation"
  });
}
