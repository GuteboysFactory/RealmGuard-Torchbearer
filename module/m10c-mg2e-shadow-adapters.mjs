import { profileActivationAvailable } from "./m10-profile-activation.mjs";
import { resolveRulesProfile } from "./rules-profile-service.mjs";
import {
  familyScaleEntry,
  familyScaleGroupWarPlan,
  familyScaleOutcomePlan,
  familyScaleRankFor,
  familyScaleSpecialPlan
} from "./m10b-comparative-scale.mjs";

const PROFILE_ID = "mg2e";
const ACTIONS = Object.freeze(["attack", "defend", "feint", "maneuver"]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function clampInt(value, minimum = 0) {
  return Math.max(minimum, Math.trunc(Number(value ?? 0)));
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function profile() {
  return resolveRulesProfile(PROFILE_ID).profile;
}

function domains() {
  return profile().domains;
}

function actionKey(value) {
  const key = normalize(value);
  return ACTIONS.includes(key) ? key : "attack";
}

function conflictTypeKey(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "other";
  const key = normalize(raw).replace(/[^a-z]/g, "");
  const aliases = {
    fightanimal: "fightCreature",
    fightcreature: "fightCreature"
  };
  if (aliases[key]) return aliases[key];
  const direct = Object.keys(domains().conflict?.actionSkills ?? {}).find(name => normalize(name) === normalize(raw));
  return direct ?? raw;
}

function weaponKey(value) {
  const key = normalize(value).replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const aliases = {
    "hook and line": "hookAndLine",
    hookandline: "hookAndLine"
  };
  if (aliases[key]) return aliases[key];
  return key.replace(/\s+([a-z0-9])/g, (_m, letter) => letter.toUpperCase());
}

export function mg2eTestPolicySnapshot() {
  const d = domains();
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    profileVersion: profile().version,
    mode: String(d.tests?.mode ?? "MG2E"),
    ordinary: d.tests?.ordinary !== false,
    versus: d.tests?.versus !== false,
    beginnersLuck: d.tests?.beginnersLuck !== false,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eAdvancementRequirements(rating) {
  const d = domains().abilities ?? {};
  const value = clampInt(rating);
  if (value <= 1) {
    return freeze({
      rating: value,
      passNeeded: clampInt(d.ratingZeroOnePassNeeded ?? 1),
      failNeeded: 0
    });
  }
  return freeze({ rating: value, passNeeded: value, failNeeded: Math.max(0, value - 1) });
}

export function mg2eAdvancementPlan({
  rating = 0,
  passed = 0,
  failed = 0,
  outcome = "",
  markAllowed = true
} = {}) {
  const req = mg2eAdvancementRequirements(rating);
  const d = domains().abilities ?? {};
  const passMark = String(outcome).toUpperCase() === "PASS" && markAllowed;
  const failMark = String(outcome).toUpperCase() === "FAIL" && markAllowed;
  const nextPassed = Math.min(req.passNeeded, clampInt(passed) + (passMark ? 1 : 0));
  const nextFailed = Math.min(req.failNeeded, clampInt(failed) + (failMark ? 1 : 0));
  const advance = nextPassed >= req.passNeeded && nextFailed >= req.failNeeded;
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    mode: String(d.advancement ?? "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1"),
    requirements: req,
    before: { passed: clampInt(passed), failed: clampInt(failed) },
    outcome: String(outcome ?? "").toUpperCase(),
    markAllowed: Boolean(markAllowed),
    after: advance && d.clearSlateOnAdvance !== false
      ? { rating: req.rating + 1, passed: 0, failed: 0 }
      : { rating: req.rating, passed: nextPassed, failed: nextFailed },
    advance,
    clearSlateOnAdvance: d.clearSlateOnAdvance !== false,
    oneTestPerAbilityOrSkillPerConflictScene: d.oneTestPerAbilityOrSkillPerConflictScene === true,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eBeginnerLearningPlan({ attempts = 0, maximumNature = 0 } = {}) {
  const d = domains().abilities ?? {};
  const needed = clampInt(maximumNature);
  const current = clampInt(attempts);
  const ready = needed > 0 && current >= needed;
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    attempts: current,
    attemptsNeeded: needed,
    opensAt: clampInt(d.beginnerLearningOpensAt ?? 2),
    useMaximumNature: d.beginnerLearningAttemptsUseMaximumNature === true,
    readyToOpen: ready,
    openedRating: ready ? clampInt(d.beginnerLearningOpensAt ?? 2) : 0,
    advancesWillHealth: d.beginnerLuckAdvancesWillHealth === true,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eTraitBenefitPlan(level, { sessionUses = 0, applicable = true } = {}) {
  const traits = domains().traits ?? {};
  const value = Math.max(0, Math.min(3, clampInt(level)));
  const used = clampInt(sessionUses);
  const rule = String(traits.levels?.[value] ?? "NONE");
  let available = Boolean(applicable);
  let dice = 0;
  let successes = 0;
  let consumeSessionUse = false;

  if (rule === "PLUS_1D_ONCE_PER_SESSION") {
    available = available && used < 1;
    dice = available ? 1 : 0;
    consumeSessionUse = available;
  } else if (rule === "PLUS_1D_TWICE_PER_SESSION") {
    available = available && used < 2;
    dice = available ? 1 : 0;
    consumeSessionUse = available;
  } else if (rule === "PLUS_1S_ALL_APPLICABLE_TESTS") {
    successes = available ? 1 : 0;
  } else {
    available = false;
  }

  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    level: value,
    rule,
    applicable: Boolean(applicable),
    sessionUses: used,
    available,
    dice,
    successes,
    consumeSessionUse,
    maxPositiveTraitsPerTest: clampInt(traits.positiveTraitsPerTest ?? 1),
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eTraitAgainstPlan(mode, { versus = false } = {}) {
  const against = domains().traits?.against ?? {};
  const key = normalize(mode);
  if (key === "impede") {
    const row = against.impede ?? {};
    return freeze({ ok: true, profileId: PROFILE_ID, mode: key, selfDice: Number(row.dice ?? -1), opponentDice: 0, checks: clampInt(row.checks ?? 1), tieToOpponent: false, liveApplication: false });
  }
  if (key === "hurt" && versus) {
    const row = against.hurtVersusOpponent ?? {};
    return freeze({ ok: true, profileId: PROFILE_ID, mode: key, selfDice: 0, opponentDice: Number(row.dice ?? 2), checks: clampInt(row.checks ?? 2), tieToOpponent: false, liveApplication: false });
  }
  if (key === "breaktie" && versus) {
    const row = against.breakTieForOpponent ?? {};
    return freeze({ ok: true, profileId: PROFILE_ID, mode: "breakTie", selfDice: 0, opponentDice: 0, checks: clampInt(row.checks ?? 2), tieToOpponent: true, liveApplication: false });
  }
  return freeze({ ok: false, profileId: PROFILE_ID, mode: String(mode ?? ""), selfDice: 0, opponentDice: 0, checks: 0, tieToOpponent: false, liveApplication: false });
}

export function mg2eWiseUsePlan(effect, { hasWise = true, failedDice = 0 } = {}) {
  const wises = domains().wises ?? {};
  const effects = wises.effects ?? {};
  const key = normalize(effect).replace(/[^a-z]/g, "");
  if (!hasWise) return freeze({ ok: false, profileId: PROFILE_ID, reasonCode: "WISE_REQUIRED", effect: String(effect ?? ""), liveApplication: false });

  if (["iamwise", "wiseaid"].includes(key)) {
    const row = effects.iAmWise ?? {};
    return freeze({
      ok: true,
      profileId: PROFILE_ID,
      effect: "I_AM_WISE",
      target: String(row.target ?? "ALLY"),
      dice: clampInt(row.dice ?? 1),
      replacesHelp: row.replacesHelp !== false,
      helperConditionRisk: row.helperConditionRisk === true,
      twistRisk: row.twistRisk !== false,
      resourceCost: "NONE",
      liveApplication: false,
      writesPlanned: 0
    });
  }

  if (["deeperunderstanding", "deeper"].includes(key)) {
    const row = effects.deeperUnderstanding ?? {};
    return freeze({
      ok: true,
      profileId: PROFILE_ID,
      effect: "DEEPER_UNDERSTANDING",
      resourceCost: String(row.cost ?? "FATE"),
      reroll: String(row.reroll ?? "ONE_FAILED_DIE"),
      rerollDiceMaximum: Math.min(1, clampInt(failedDice)),
      alreadyRerolledDiceExcluded: row.alreadyRerolledDiceExcluded !== false,
      liveApplication: false,
      writesPlanned: 0
    });
  }

  if (["ofcourse", "course"].includes(key)) {
    const row = effects.ofCourse ?? {};
    return freeze({
      ok: true,
      profileId: PROFILE_ID,
      effect: "OF_COURSE",
      resourceCost: String(row.cost ?? "PERSONA"),
      reroll: String(row.reroll ?? "ALL_FAILED_DICE"),
      rerollDiceMaximum: clampInt(failedDice),
      beforeFateOpenSixes: row.beforeFateOpenSixes === true,
      liveApplication: false,
      writesPlanned: 0
    });
  }

  return freeze({ ok: false, profileId: PROFILE_ID, reasonCode: "UNKNOWN_WISE_EFFECT", effect: String(effect ?? ""), liveApplication: false });
}

export function mg2eHelpPlan({ sourceKind = "", usingWise = false } = {}) {
  const help = domains().help ?? {};
  const kind = normalize(sourceKind);
  if (usingWise || kind === "wise") {
    const wise = mg2eWiseUsePlan("I Am Wise");
    return freeze({
      ...wise,
      mode: "I_AM_WISE",
      teamworkAlsoAllowedOnSameTest: help.iAmWiseAndHelpSameTest === true,
      sourcePolicy: String(help.sourcePolicy ?? "MG2E_TYPED")
    });
  }
  if (["skill", "ability"].includes(kind) && help.teamwork === true) {
    return freeze({
      ok: true,
      profileId: PROFILE_ID,
      mode: "TEAMWORK",
      dice: 1,
      sourceKind: kind.toUpperCase(),
      helperConsequences: help.helperConsequences === true,
      sourcePolicy: String(help.sourcePolicy ?? "MG2E_TYPED"),
      liveApplication: false,
      writesPlanned: 0
    });
  }
  return freeze({ ok: false, profileId: PROFILE_ID, mode: "NONE", dice: 0, reasonCode: "HELP_SOURCE_NOT_ALLOWED", liveApplication: false });
}

export function mg2eNaturePlan({ testName = "", descriptorApplies = false } = {}) {
  const nature = domains().nature ?? {};
  const name = String(testName ?? "");
  const excluded = Array.isArray(nature.tapExcludedAbilities) ? nature.tapExcludedAbilities.map(normalize) : [];
  const excludedAbility = excluded.includes(normalize(name));
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    label: String(nature.label ?? "Nature (Mouse)"),
    descriptors: [...(nature.descriptors ?? [])],
    descriptorApplies: Boolean(descriptorApplies),
    taxEnabled: nature.tax === true,
    tapNatureAvailable: nature.tapNature === true && !excludedAbility,
    doubleTapNatureAvailable: nature.doubleTapNature === true && !excludedAbility,
    excludedAbility,
    wiseSubstitutionAllowed: nature.wiseSubstitutionAllowed === true,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eRecoveryPlan(conditionName, { selfAttemptFailed = false, gmTurn = false } = {}) {
  const recovery = domains().recovery ?? {};
  const key = normalize(conditionName);
  let rule = null;
  if (key === "hungry & thirsty") rule = recovery.hungry;
  else if (key === "angry") rule = recovery.angry;
  else if (key === "tired") rule = recovery.tired;
  else if (key === "injured") rule = recovery.injured;
  else if (key === "sick") rule = recovery.sick;

  if (!rule) return freeze({ ok: false, profileId: PROFILE_ID, condition: String(conditionName ?? ""), reasonCode: "UNKNOWN_MG2E_CONDITION", liveApplication: false });

  const healerRequired = Boolean(selfAttemptFailed && rule.failedRecovery === "HEALER_REQUIRED");
  return freeze({
    ok: true,
    phase: "M10C.3",
    profileId: PROFILE_ID,
    condition: String(conditionName ?? ""),
    recoveryAbility: String(rule.recoveryAbility ?? ""),
    obstacle: clampInt(rule.obstacle ?? 0),
    methods: Array.isArray(rule.methods) ? [...rule.methods] : [],
    helpAllowed: rule.helpAllowed !== false,
    gmTurnCheckCost: gmTurn ? clampInt(recovery.gmTurnCheckCost ?? 2) : 0,
    oneRecoveryTestPerConditionPerTurn: recovery.oneRecoveryTestPerConditionPerTurn === true,
    goodRest: rule.goodRest === true,
    resourcesObstacle: rule.resourcesObstacle == null ? null : clampInt(rule.resourcesObstacle),
    failedRecovery: String(rule.failedRecovery ?? ""),
    healerRequired,
    healerObstacle: healerRequired ? clampInt(rule.healerObstacle ?? 0) : null,
    playersTurnWaiver: rule.playersTurnWaiver === true,
    permanentReductionExcludes: [...(rule.permanentReductionExcludes ?? [])],
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eInventoryPlan({
  normalWeapons = 0,
  bulkyWeapons = 0,
  satchelItems = 0,
  armor = 0
} = {}) {
  const inventory = domains().inventory ?? {};
  const limits = inventory.carryLimits ?? {};
  const normal = clampInt(normalWeapons);
  const bulky = clampInt(bulkyWeapons);
  const satchel = clampInt(satchelItems);
  const armorCount = clampInt(armor);
  const weaponGuidanceOk = bulky > 0
    ? bulky <= 1 && normal === 0
    : normal <= clampInt(limits.weapons ?? 2);

  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    policy: String(inventory.policy ?? "LOOSE"),
    capacityMode: String(inventory.capacityMode ?? "MG2E_CARRY_LIMITS"),
    structuredPlacementAuthority: inventory.structuredPlacementAuthority === true,
    placementPresentationOnly: inventory.structuredPlacementAuthority !== true,
    carryLimits: { ...limits },
    relevantGearDice: clampInt(inventory.relevantGearDice ?? 1),
    sampleCounts: { normalWeapons: normal, bulkyWeapons: bulky, satchelItems: satchel, armor: armorCount },
    withinGuidance: weaponGuidanceOk
      && satchel <= clampInt(limits.satchelOrBagItems ?? 2)
      && armorCount <= clampInt(limits.armor ?? 1),
    preservePlacementMetadata: inventory.preservePlacementAsPresentation !== false,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eConflictActionSkills(conflictType, action) {
  const conflict = domains().conflict ?? {};
  const type = conflictTypeKey(conflictType);
  const key = actionKey(action);
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    conflictType: type,
    action: key,
    skills: [...(conflict.actionSkills?.[type]?.[key] ?? [])],
    maxActionHelpers: clampInt(conflict.maxActionHelpers ?? 2),
    source: "MG2E_PROFILE",
    liveApplication: false
  });
}

export function mg2eConflictDispositionPlan(conflictType) {
  const conflict = domains().conflict ?? {};
  const type = conflictTypeKey(conflictType);
  const row = conflict.disposition?.[type] ?? { skills: [], bases: [], basePolicy: "GM_CALL" };
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    conflictType: type,
    skills: [...(row.skills ?? [])],
    bases: [...(row.bases ?? [])],
    basePolicy: String(row.basePolicy ?? ""),
    actionsPerExchange: clampInt(conflict.actionsPerExchange ?? 3),
    rotateParticipants: conflict.rotateParticipants !== false,
    liveApplication: false
  });
}

export function mg2eWeaponActionPlan(name, action, context = {}) {
  const conflict = domains().conflict ?? {};
  const key = weaponKey(name);
  const def = conflict.weapons?.[key];
  const act = actionKey(action);
  if (!def) return freeze({ ok: false, profileId: PROFILE_ID, weaponName: String(name ?? ""), action: act, reasonCode: "UNKNOWN_MG2E_WEAPON", liveApplication: false });

  if (def.rainDisabled === true && context.raining === true) {
    return freeze({ ok: false, profileId: PROFILE_ID, weaponName: String(name ?? ""), action: act, reasonCode: "WEAPON_DISABLED_BY_RAIN", liveApplication: false });
  }

  let dice = Number(def[act + "Dice"] ?? 0);
  let conditionalSuccess = context.successful === true ? Number(def[act + "Success"] ?? 0) : 0;
  let autoDisarm = false;

  if (key === "sword" && Number(def.chooseOneFightActionDice ?? 0) !== 0) {
    dice += normalize(context.chosenFightAction) === act ? Number(def.chooseOneFightActionDice) : 0;
  }
  if (key === "knife" && def.shortAndQuickAutoDisarmAgainstLongerWeapons === true) {
    autoDisarm = act === "maneuver" && context.successful === true && context.opponentWeaponLonger === true;
  }

  return freeze({
    ok: true,
    phase: "M10C.3",
    profileId: PROFILE_ID,
    weaponKey: key,
    weaponName: String(name ?? ""),
    action: act,
    dice,
    conditionalSuccess,
    autoDisarm,
    throwable: def.throwable === true,
    missile: def.missile === true,
    twoHands: def.twoHands === true,
    shieldCompatible: def.shieldCompatible !== false,
    fatigueRecoveryHealthDice: context.usedPreviousTurn === true ? Number(def.fatigueRecoveryHealthDice ?? 0) : 0,
    definition: { ...def },
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eArmorPlan(name, context = {}) {
  const conflict = domains().conflict ?? {};
  const key = normalize(name).includes("heavy") ? "heavy" : normalize(name).includes("light") ? "light" : normalize(name);
  const def = conflict.armor?.[key];
  if (!def) return freeze({ ok: false, profileId: PROFILE_ID, armorName: String(name ?? ""), reasonCode: "UNKNOWN_MG2E_ARMOR", liveApplication: false });

  const maceException = def.maceException === true && context.maceHit === true;
  const uses = clampInt(context.usesThisConflict);
  const absorbAvailable = !maceException
    && Number(def.absorbDispositionDamage ?? 0) > 0
    && (def.usesPerHit === true || uses < clampInt(def.usesPerConflict ?? 1));

  let dice = 0;
  const action = actionKey(context.action);
  const testName = normalize(context.testName);
  if (action === "maneuver") dice += Number(def.maneuverDice ?? 0);
  if (testName === "scout" && context.sneaking === true) dice += Number(def.scoutSneakDice ?? 0);
  if (testName === "nature" && context.hiding === true) dice += Number(def.natureHideDice ?? 0);
  if (testName === "health" && context.fatigueRecovery === true) dice += Number(def.fatigueRecoveryHealthDice ?? 0);

  return freeze({
    ok: true,
    phase: "M10C.3",
    profileId: PROFILE_ID,
    armorKey: key,
    armorName: String(name ?? ""),
    absorbDispositionDamage: absorbAvailable ? Number(def.absorbDispositionDamage ?? 0) : 0,
    absorbAvailable,
    maceException,
    dice,
    definition: { ...def },
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eGearRelevancePlan({ isGear = true, gmApproved = false } = {}) {
  const inventory = domains().inventory ?? {};
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    eligible: Boolean(isGear),
    gmApprovalRequired: true,
    gmApproved: Boolean(gmApproved),
    automatic: false,
    dice: isGear && gmApproved ? clampInt(inventory.relevantGearDice ?? 1) : 0,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2ePlayerTurnPlan({
  freeTestsUsed = 0,
  checks = 0,
  conflict = false,
  isSolo = false,
  sameActorAsPrevious = false
} = {}) {
  const session = domains().session ?? {};
  const freeAvailable = clampInt(freeTestsUsed) < clampInt(session.playerTurnFreeTests ?? 1);
  const checkCost = conflict
    ? clampInt(session.playerTurnConflictCheckCost ?? 1)
    : freeAvailable ? 0 : clampInt(session.additionalTestCheckCost ?? 1);
  const alternationBlocked = session.alternation === true
    && !isSolo
    && sameActorAsPrevious;
  const affordable = clampInt(checks) >= checkCost;

  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    freeAvailable,
    checkCost,
    checksAvailable: clampInt(checks),
    alternationRequired: session.alternation === true,
    soloAlternationException: session.soloAlternationException === true,
    alternationBlocked,
    conflict: Boolean(conflict),
    canTakeTest: !alternationBlocked && affordable,
    checksTransferable: session.checksTransferable === true,
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eEndSessionPlan({ fateAwards = [], personaAwards = [], playerCount = 0 } = {}) {
  const session = domains().session ?? {};
  const allowedFate = new Set(session.fateAwards ?? []);
  const allowedPersona = new Set(session.personaAwards ?? []);
  const errors = [];
  const fateByPlayer = new Map();
  const personaByPlayer = new Map();

  const countByPlayer = (rows, map, allowed, kind) => {
    for (const row of rows ?? []) {
      const type = String(row?.type ?? row ?? "");
      const playerId = String(row?.playerId ?? "unknown");
      if (!allowed.has(type)) errors.push(kind + "_UNKNOWN_AWARD:" + type);
      map.set(playerId, (map.get(playerId) ?? 0) + 1);
    }
  };
  countByPlayer(fateAwards, fateByPlayer, allowedFate, "FATE");
  countByPlayer(personaAwards, personaByPlayer, allowedPersona, "PERSONA");

  for (const [playerId, count] of fateByPlayer) {
    if (count > clampInt(session.fatePerSessionMax ?? 3)) errors.push("FATE_MAX_EXCEEDED:" + playerId);
  }
  for (const [playerId, count] of personaByPlayer) {
    if (count > clampInt(session.personaPerSessionMax ?? 4)) errors.push("PERSONA_MAX_EXCEEDED:" + playerId);
  }

  const mvp = (personaAwards ?? []).filter(row => String(row?.type ?? row) === "MVP");
  const workhorse = (personaAwards ?? []).filter(row => String(row?.type ?? row) === "WORKHORSE");
  const embodiment = (personaAwards ?? []).filter(row => String(row?.type ?? row) === "EMBODIMENT");
  if (mvp.length > clampInt(session.mvpCountMax ?? 1)) errors.push("MVP_COUNT_EXCEEDED");
  if (workhorse.length > clampInt(session.workhorseCountMax ?? 1)) errors.push("WORKHORSE_COUNT_EXCEEDED");
  if (session.mvpAndWorkhorseSamePlayer === false && mvp[0]?.playerId && workhorse[0]?.playerId && mvp[0].playerId === workhorse[0].playerId) {
    errors.push("MVP_WORKHORSE_SAME_PLAYER");
  }
  if (session.embodimentMayAwardEveryone === false && clampInt(playerCount) > 0 && embodiment.length >= clampInt(playerCount)) {
    errors.push("EMBODIMENT_CANNOT_AWARD_EVERYONE");
  }

  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    valid: errors.length === 0,
    errors,
    fatePerSessionMax: clampInt(session.fatePerSessionMax ?? 3),
    personaPerSessionMax: clampInt(session.personaPerSessionMax ?? 4),
    tableRewardAuthority: String(session.tableRewardAuthority ?? "GROUP_CONSENSUS"),
    foundryCommitAuthority: String(session.foundryCommitAuthority ?? "GM"),
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eCirclesPlan({ hometown = false, knownContact = false, enmityArgumentSpeech = false } = {}) {
  const circles = domains().circles ?? {};
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    dice: (hometown ? Number(circles.hometownAdvantageDice ?? 0) : 0)
      + (knownContact ? Number(circles.knownContactFutureDice ?? 0) : 0),
    dispositionSuccesses: enmityArgumentSpeech && circles.enmityClause === true
      ? Number(circles.enmityArgumentSpeechDispositionSuccess ?? 0)
      : 0,
    automaticNpcCreation: circles.automaticNpcCreation === true,
    socialStorage: String(circles.socialStorage ?? "CORE_M8_FOUNDRY_TOOLING"),
    liveApplication: false,
    writesPlanned: 0
  });
}

export function mg2eScaleRankFor(kind) {
  return familyScaleRankFor(PROFILE_ID, kind);
}

export function mg2eScaleEntry(kind) {
  return familyScaleEntry(PROFILE_ID, kind);
}

export function mg2eScaleOutcomePlan(options = {}) {
  return familyScaleOutcomePlan(PROFILE_ID, options);
}

export function mg2eScaleGroupWarPlan(options = {}) {
  return familyScaleGroupWarPlan(PROFILE_ID, options);
}

export function mg2eScaleSpecialPlan(options = {}) {
  return familyScaleSpecialPlan(PROFILE_ID, options);
}

export function mg2eCreationShadowSnapshot() {
  const creation = domains().creation ?? {};
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    profileVersion: clampInt(creation.profileVersion),
    mode: String(creation.mode ?? "MG2E"),
    coreEngine: String(creation.coreEngine ?? "CORE_M9"),
    liveAuthority: String(creation.liveAuthority ?? "NONE"),
    readyWhenActive: creation.readyWhenActive === true,
    wiseMode: String(creation.wiseMode ?? "UNRATED"),
    ratedWises: creation.ratedWises === true,
    ranks: [...(creation.ranks ?? [])],
    rankTemplates: { ...(creation.rankTemplates ?? {}) },
    wiseCountByRank: { ...(creation.wiseCountByRank ?? {}) },
    natureBase: clampInt(creation.natureBase ?? 3),
    natureQuestions: clampInt(creation.natureQuestions ?? 3),
    startingSkillRating: clampInt(creation.startingSkillRating ?? 2),
    startingSkillCap: clampInt(creation.startingSkillCap ?? 6),
    startingRewards: { ...(creation.startingRewards ?? {}) },
    commitAdapterReady: true,
    liveCommit: false,
    provenanceWrite: false,
    relationshipWrite: false,
    existingActorMigrationRequired: false,
    writesPlanned: 0
  });
}

export function mg2eActivationReadiness() {
  const p = profile();
  const creation = mg2eCreationShadowSnapshot();
  const authorized = p.metadata?.explicitActivationAuthorized === true && p.metadata?.liveParityVerified === true;
  const blockers = authorized ? [] : ["LIVE_PARITY_QA", "EXPLICIT_ACTIVATION_MILESTONE"];
  return freeze({
    phase: "M10C.3",
    profileId: PROFILE_ID,
    profileVersion: p.version,
    state: authorized ? "QA_ACTIVATION_AUTHORIZED" : "TECHNICAL_READINESS_CLOSED",
    extendedPhase: p.metadata?.implementationPhase ?? "M10C.6",
    independentSourceProfile: p.lineage?.length === 1 && p.lineage?.[0]?.id === PROFILE_ID,
    sourceDomainComplete: String(p.metadata?.sourceAuditStatus ?? "").includes("DOMAIN_COMPLETE"),
    conversionPreviewReady: p.metadata?.conversionPreviewAvailable === true,
    shadowAdaptersReady: p.metadata?.shadowAdaptersReady === true,
    naturalOrderShadowReady: true,
    creationFoundationReady: creation.ranks.length === 5,
    fullRecruitmentCommitReady: true,
    dedicatedLiveRulesReferenceReady: true,
    liveParityFoundationReady: p.metadata?.liveParityFoundationReady === true,
    liveParityVerified: p.metadata?.liveParityVerified === true,
    activationGateClosed: !profileActivationAvailable(PROFILE_ID),
    activationAvailable: profileActivationAvailable(PROFILE_ID),
    foundationOnly: p.metadata?.foundationOnly === true,
    selectable: p.metadata?.selectable !== false,
    supported: p.metadata?.supported !== false,
    liveRuleAuthority: p.metadata?.liveRuleAuthority === true,
    existingActorMigrationRequired: false,
    destructiveConversionRequired: false,
    blockers
  });
}

export function getM10C3Mg2eShadowStatus() {
  const p = profile();
  return freeze({
    phase: "M10C.3",
    mode: "MG2E_READ_ONLY_SHADOW_ADAPTERS",
    profileId: PROFILE_ID,
    profileVersion: p.version,
    foundationOnly: p.metadata?.foundationOnly === true,
    liveRuleAuthority: p.metadata?.liveRuleAuthority === true,
    activationReadiness: mg2eActivationReadiness(),
    adapters: {
      tests: true,
      advancement: true,
      beginnersLuckLearning: true,
      traits: true,
      wises: true,
      help: true,
      nature: true,
      recovery: true,
      inventory: true,
      conflict: true,
      session: true,
      circles: true,
      naturalOrder: true,
      creationFoundation: true
    },
    writes: {
      actors: 0,
      items: 0,
      journals: 0,
      settings: 0
    },
    destructiveConversion: false,
    liveApplication: false,
    nextStep: p.metadata?.explicitActivationAuthorized === true
      ? "Complete M10C.8 MG2E selectable activation live QA"
      : p.metadata?.liveParityFoundationReady === true
      ? "M10C.7 MG2E Controlled Live Parity Execution"
      : "M10C.6 MG2E Live Parity QA Foundation"
  });
}
