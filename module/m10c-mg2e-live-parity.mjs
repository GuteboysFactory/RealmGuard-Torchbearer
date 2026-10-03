import { resolveProfileCapabilities, resolveRulesProfile } from "./rules-profile-service.mjs";
import { resolveM10BConditionRecoveryPolicy } from "./m10b-conditions-recovery.mjs";
import { resolveM10BGearInventoryConflictPolicy } from "./m10b-gear-inventory-conflict.mjs";
import { resolveM10BSessionCirclesProgressionPolicy } from "./m10b-session-circles-progression.mjs";
import { resolveM10BComparativeScalePolicy } from "./m10b-comparative-scale.mjs";
import { resolveM10BCharacterCreationPolicy } from "./m10b-character-creation.mjs";
import { profileRulesReferenceSnapshot } from "./m10b-rules-reference.mjs";
import {
  mg2eAdvancementRequirements,
  mg2eArmorPlan,
  mg2eConflictActionSkills,
  mg2eConflictDispositionPlan,
  mg2eGearRelevancePlan,
  mg2eHelpPlan,
  mg2eInventoryPlan,
  mg2eNaturePlan,
  mg2eRecoveryPlan,
  mg2eScaleOutcomePlan,
  mg2eScaleRankFor,
  mg2eTestPolicySnapshot,
  mg2eTraitBenefitPlan,
  mg2eWeaponActionPlan,
  mg2eWiseUsePlan
} from "./m10c-mg2e-shadow-adapters.mjs";

const PROFILE_ID = "mg2e";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function sameArray(a = [], b = []) {
  return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length
    && a.every((value, index) => value === b[index]);
}

function domain(id, {
  state = "FOUNDATION_READY",
  candidateProvider = "",
  liveSurface = "",
  checks = {},
  notes = []
} = {}) {
  const checkValues = Object.values(checks);
  const ready = checkValues.length > 0 && checkValues.every(Boolean);
  return freeze({
    id,
    state: ready ? state : "FOUNDATION_MISMATCH",
    foundationReady: ready,
    candidateProvider,
    liveSurface,
    checks,
    notes: [...notes]
  });
}

/**
 * M10C.6 is a zero-write live-parity FOUNDATION.
 *
 * It proves that every MG2E source-owned domain has a deterministic candidate
 * provider and identifies the live handoff surface that a later controlled
 * execution milestone must exercise. It does not activate MG2E and does not
 * claim that live parity has already been observed.
 */
export function mg2eLiveParityMatrix() {
  const { profile } = resolveRulesProfile(PROFILE_ID);
  const caps = resolveProfileCapabilities(PROFILE_ID);
  const conditionRecovery = resolveM10BConditionRecoveryPolicy(PROFILE_ID);
  const gearConflict = resolveM10BGearInventoryConflictPolicy(PROFILE_ID);
  const sessionCircles = resolveM10BSessionCirclesProgressionPolicy(PROFILE_ID);
  const scale = resolveM10BComparativeScalePolicy(PROFILE_ID);
  const creation = resolveM10BCharacterCreationPolicy(PROFILE_ID);
  const reference = profileRulesReferenceSnapshot(PROFILE_ID);

  const test = mg2eTestPolicySnapshot();
  const advancement = mg2eAdvancementRequirements(4);
  const trait = mg2eTraitBenefitPlan(2, { sessionUses: 1, applicable: true });
  const wise = mg2eWiseUsePlan("Deeper Understanding", { failedDice: 3 });
  const help = mg2eHelpPlan({ sourceKind: "skill" });
  const nature = mg2eNaturePlan({ testName: "Fighter", descriptorApplies: true });
  const sick = mg2eRecoveryPlan("Sick", { selfAttemptFailed: true, gmTurn: true });
  const inventory = mg2eInventoryPlan({ normalWeapons: 2, bulkyWeapons: 0, satchelItems: 2, armor: 1 });
  const fightDefend = mg2eConflictActionSkills("fight", "defend");
  const fightDisposition = mg2eConflictDispositionPlan("fight");
  const axe = mg2eWeaponActionPlan("Axe", "attack", { successful: true });
  const lightArmor = mg2eArmorPlan("Light Armor", { conflictType: "fight" });
  const relevantGear = mg2eGearRelevancePlan({ isGear: true, gmApproved: true });
  const mouseRank = mg2eScaleRankFor("Mouse");
  const foxOutcome = mg2eScaleOutcomePlan({ actorType: "Mouse", targetType: "Fox" });

  const rows = [
    domain("TESTS", {
      candidateProvider: "CORE_M3_TEST_ENGINE_WITH_MG2E_PROFILE_POLICY",
      liveSurface: "RealmGuardActor roll entry points",
      checks: {
        profileMode: caps.rules.tests.mode === "MG2E",
        ordinary: test.ordinary === true,
        versus: test.versus === true,
        beginnersLuck: test.beginnersLuck === true,
        zeroWrite: test.liveApplication === false && Number(test.writesPlanned) === 0
      }
    }),
    domain("ADVANCEMENT_BEGINNERS_LUCK", {
      candidateProvider: "CORE_M4/M10B6_PROFILE_PROGRESSION + MG2E_ADAPTER",
      liveSurface: "post-test learning / advancement",
      checks: {
        profileMode: caps.rules.progression.mode === "MG2E",
        passNeeded: advancement.passNeeded === 4,
        failNeeded: advancement.failNeeded === 3,
        opensAtTwo: caps.rules.progression.beginnerLearningOpensAt === 2,
        usesMaximumNature: caps.rules.progression.beginnerLearningAttemptsUseMaximumNature === true,
        noWillHealthLearning: caps.rules.progression.beginnerLuckAdvancesWillHealth === false
      }
    }),
    domain("TRAITS", {
      candidateProvider: "ACTIVE_TRAIT_ENGINE_PROFILE_BRANCH + MG2E_PROFILE",
      liveSurface: "trait benefit / Trait Against",
      checks: {
        profileMode: caps.rules.traits.mode === "MG2E",
        level2SecondUseAvailable: trait.available === true && trait.dice === 1,
        level3ProfileRule: profile.domains.traits?.levels?.[3] === "PLUS_1S_ALL_APPLICABLE_TESTS",
        positiveTraitsPerTest: Number(profile.domains.traits?.positiveTraitsPerTest) === 1
      }
    }),
    domain("WISE_EFFECTS", {
      state: "CANDIDATE_HANDOFF_READY",
      candidateProvider: "M10C3_MG2E_WISE_ADAPTER",
      liveSurface: "RealmGuardActor Wise action routing",
      checks: {
        unrated: caps.rules.wises.rated === false,
        dedicatedEffect: wise.ok === true && wise.effect === "DEEPER_UNDERSTANDING",
        fateCost: wise.resourceCost === "FATE",
        oneFailedDie: wise.rerollDiceMaximum === 1
      },
      notes: ["Live Actor Wise routing must use the MG2E adapter; Legacy unrated-Wise auto-reroll behavior is not MG2E parity."]
    }),
    domain("HELP", {
      state: "CANDIDATE_HANDOFF_READY",
      candidateProvider: "M10C3_MG2E_HELP_ADAPTER",
      liveSurface: "Teamwork / I Am Wise request routing",
      checks: {
        policy: String(profile.domains.help?.sourcePolicy) === "MG2E_TYPED",
        teamwork: help.ok === true && help.mode === "TEAMWORK" && help.dice === 1,
        wiseAndHelpSameTestBlocked: profile.domains.help?.iAmWiseAndHelpSameTest === false
      },
      notes: ["Controlled execution must verify MG2E typed Help and I Am Wise exclusivity before activation."]
    }),
    domain("NATURE", {
      candidateProvider: "M10B3_PROFILE_NATURE + M10C3_MG2E_NATURE_ADAPTER",
      liveSurface: "Nature / Tap Nature roll routing",
      checks: {
        mode: caps.rules.nature.mode === "MG2E",
        label: caps.rules.nature.label === "Nature (Mouse)",
        descriptors: sameArray(caps.rules.nature.descriptors, ["Escaping", "Climbing", "Hiding", "Foraging"]),
        tap: nature.tapNatureAvailable === true,
        doubleTap: nature.doubleTapNatureAvailable === true
      }
    }),
    domain("CONDITIONS_RECOVERY", {
      candidateProvider: "M10B4_PROFILE_CONDITION_RECOVERY",
      liveSurface: "Condition modifiers / Recovery",
      checks: {
        profileId: conditionRecovery.profileId === PROFILE_ID,
        familySemantics: conditionRecovery.familySemantics === true,
        sickHealerOb4: Number(sick.healerObstacle) === 4,
        recoveryOrder: sameArray(conditionRecovery.recoveryOrder, ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"])
      }
    }),
    domain("INVENTORY_GEAR", {
      state: "CANDIDATE_HANDOFF_READY",
      candidateProvider: "M10C3_MG2E_INVENTORY_GEAR_ADAPTER",
      liveSurface: "inventory guidance / relevant Gear",
      checks: {
        policyLoose: gearConflict.inventory.policy === "LOOSE",
        placementPresentationOnly: gearConflict.inventory.placementPresentationOnly === true,
        carryPlanValid: inventory.withinGuidance === true,
        relevantGearPlusOne: relevantGear.eligible === true && relevantGear.dice === 1
      },
      notes: ["MG2E Gear must not be routed through the MG1E weapon catalog."]
    }),
    domain("CONFLICT", {
      state: "CANDIDATE_HANDOFF_READY",
      candidateProvider: "PROFILE_ACTION_TABLES + M10C3_MG2E_WEAPON_ARMOR_ADAPTERS",
      liveSurface: "Conflict setup / action skill / weapon / armor routing",
      checks: {
        profileMode: gearConflict.conflict.mode === "MG2E",
        fightDefendNature: sameArray(fightDefend.skills, ["Nature"]),
        dispositionSkill: sameArray(fightDisposition.skills, ["Fighter"]),
        dispositionBases: sameArray(fightDisposition.bases, ["Health", "Nature"]),
        axeAttackSuccess: axe.ok === true && Number(axe.conditionalSuccess ?? axe.successes ?? 0) === 1,
        lightArmorRecognized: lightArmor.ok === true
      },
      notes: ["Controlled execution must bind MG2E 2015 weapon/armor adapters instead of MG1E-family catalog behavior."]
    }),
    domain("SESSION_CIRCLES_PROGRESSION", {
      candidateProvider: "CORE_M7/M8 + M10B6_PROFILE_POLICY",
      liveSurface: "Players' Turn / End Session / Circles / progression",
      checks: {
        profileId: sessionCircles.profileId === PROFILE_ID,
        familySemantics: sessionCircles.familySemantics === true,
        sessionMode: sessionCircles.session.mode === "MG2E",
        circlesMode: sessionCircles.circles.mode === "MG2E",
        freeTest: sessionCircles.session.playerTurnFreeTests === 1,
        checkCost: sessionCircles.session.additionalTestCheckCost === 1,
        knownContactBonus: sessionCircles.circles.knownContactFutureDice === 1,
        noLevels: sessionCircles.progression.levelsEnabled === false,
        noTalents: sessionCircles.progression.talentsEnabled === false
      }
    }),
    domain("NATURAL_ORDER", {
      candidateProvider: "M10B8_COMPARATIVE_SCALE + MG2E_NATURAL_ORDER",
      liveSurface: "Natural Order guidance / Conflict eligibility",
      checks: {
        scaleId: scale.scaleId === "mg2e-natural-order",
        mouseRank: mouseRank === 3,
        foxRank: foxOutcome.targetRank === 6,
        runOffAllowed: foxOutcome.runOffAllowed === true,
        noLiveWrite: scale.liveApplication === false
      }
    }),
    domain("CHARACTER_CREATION", {
      state: "READY_WHEN_ACTIVE",
      candidateProvider: "CORE_M9_MG2E_CHARACTER_CREATION_PROFILE_V3",
      liveSurface: "Recruitment transactional commit",
      checks: {
        profileAvailable: creation.creationProfileAvailable === true,
        profileVersion: creation.creationProfileVersion === 3,
        readyWhenActive: creation.readyWhenActive === true,
        liveCommitLocked: creation.liveCommit === false,
        zeroResolveWrites: Object.values(creation.writes ?? {}).every(value => Number(value) === 0)
      }
    }),
    domain("RULES_REFERENCE", {
      candidateProvider: "M10B8_PROFILE_RULES_REFERENCE",
      liveSurface: "Rules Reference UI",
      checks: {
        mode: reference.mode === "READ_ONLY_PROFILE_REFERENCE",
        profileId: reference.profileId === PROFILE_ID,
        pages: Array.isArray(reference.pages) && reference.pages.length >= 9,
        zeroWrite: reference.writesJournal === false
          && reference.writesActors === false
          && reference.writesItems === false
          && reference.writesWorldSettings === false
      }
    })
  ];

  return freeze(rows);
}

export function mg2eLiveParityFoundationStatus() {
  const { profile } = resolveRulesProfile(PROFILE_ID);
  const matrix = mg2eLiveParityMatrix();
  const foundationReady = matrix.every(row => row.foundationReady === true);
  const handoffRequired = matrix
    .filter(row => row.state === "CANDIDATE_HANDOFF_READY")
    .map(row => row.id);

  return freeze({
    phase: "M10C.6",
    mode: "MG2E_LIVE_PARITY_QA_FOUNDATION",
    profileId: PROFILE_ID,
    profileVersion: profile.version,
    foundationReady,
    liveParityVerified: false,
    controlledExecutionRequired: true,
    activationAuthorized: false,
    activationExpected: false,
    handoffRequired,
    domainCount: matrix.length,
    readyDomainCount: matrix.filter(row => row.foundationReady).length,
    mismatchDomains: matrix.filter(row => !row.foundationReady).map(row => row.id),
    matrix,
    writes: {
      actors: 0,
      items: 0,
      journals: 0,
      settings: 0
    },
    destructiveMigration: false,
    existingActorMutation: false,
    nextStep: "M10C.7 MG2E Controlled Live Parity Execution"
  });
}

export function getM10C6Mg2eLiveParityFoundationStatus() {
  return mg2eLiveParityFoundationStatus();
}
