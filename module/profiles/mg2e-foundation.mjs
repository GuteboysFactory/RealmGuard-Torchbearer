import { RulesProfile } from "../core/rules-profile.mjs";

const MG2E_SOURCE = "Mouse Guard Roleplaying Game: Second Edition (2015)";

export const MG2E_FOUNDATION_PROFILE = new RulesProfile({
  id: "mg2e",
  version: 1,
  name: "Mouse Guard 2E",
  classification: "SOURCE PROFILE / FOUNDATION",
  domains: {
    profile: { activationState: "FOUNDATION_ONLY" },
    tests: { mode: "MG2E", ordinary: true, versus: true, beginnersLuck: true },
    nature: {
      mode: "MG2E",
      label: "Nature (Mouse)",
      descriptors: ["Escaping", "Climbing", "Hiding", "Foraging"],
      tax: true,
      tapNature: true,
      doubleTapNature: true,
      tapExcludedAbilities: ["Resources", "Circles"],
      wiseSubstitutionAllowed: false
    },
    traits: {
      mode: "MG2E",
      positiveTraitsPerTest: 1,
      levels: {
        1: "PLUS_1D_ONCE_PER_SESSION",
        2: "PLUS_1D_TWICE_PER_SESSION",
        3: "PLUS_1S_ALL_APPLICABLE_TESTS"
      },
      against: {
        impede: { dice: -1, checks: 1 },
        hurtVersusOpponent: { dice: 2, checks: 2 },
        breakTieForOpponent: { checks: 2 }
      },
      chargeRecharge: { chargeChecks: 3, rechargeLevel1Checks: 2, rechargeLevel3Checks: 4 }
    },
    wises: {
      mode: "MG2E",
      ratingMode: "NONE",
      maxWises: 4,
      testableOnOwn: false,
      effects: {
        iAmWise: { target: "ALLY", dice: 1, replacesHelp: true },
        deeperUnderstanding: { cost: "FATE", reroll: "ONE_FAILED_DIE" },
        ofCourse: { cost: "PERSONA", reroll: "ALL_FAILED_DICE" }
      }
    },
    help: {
      teamwork: true,
      iAmWise: true,
      wiseAidInPlaceOfHelp: true,
      iAmWiseAndHelpSameTest: false,
      helperConsequences: true,
      sourcePolicy: "MG2E_TYPED"
    },
    conditions: { mode: "MG2E", set: ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"] },
    recovery: {
      mode: "MG2E",
      order: ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"],
      oneRecoveryTestPerConditionPerTurn: true,
      gmTurnCheckCost: 2,
      angry: { recoveryAbility: "Will", obstacle: 2 },
      tired: { recoveryAbility: "Health", obstacle: 3 },
      injured: { recoveryAbility: "Health", obstacle: 4, healerObstacle: 3 },
      sick: { recoveryAbility: "Will", obstacle: 4, healerObstacle: 4 }
    },
    circles: {
      mode: "MG2E",
      hometownAdvantageDice: 1,
      knownContactFutureDice: 1,
      enmityClause: true,
      enmityArgumentSpeechDispositionSuccess: 3
    },
    creation: {
      mode: "MG2E",
      coreEngine: "CORE_M9",
      liveAuthority: "NONE",
      readyWhenActive: false,
      profileId: "mg2e",
      profileVersion: 1,
      wiseMode: "UNRATED",
      ratedWises: false,
      maxWiseCount: 4,
      wiseCountByRank: { tenderpaw: 1, guardmouse: 1, patrolGuard: 2, patrolLeader: 3, guardCaptain: 4 },
      ranks: ["tenderpaw", "guardmouse", "patrolGuard", "patrolLeader", "guardCaptain"],
      startingSkillCap: 6,
      natureBase: 3,
      natureQuestions: 3
    },
    progression: { mode: "MG2E_AUDIT_PARTIAL", levels: false, talents: false, preserveExistingData: true },
    tokensOfPower: { enabled: false }
  },
  registry: [
    ["PROFILE.IDENTITY","profile","Rules Profile","MOUSE GUARD 2E"],
    ["NATURE.MODE","nature","Nature Resolution","MOUSE NATURE"],
    ["TRAIT.MODE","traits","Trait Resolution","MG2E LEVEL 1 / 2 / 3"],
    ["WISE.MODE","wises","Wise Rating Mode","UNRATED"],
    ["HELP.MODE","help","Help / Wise Aid","TEAMWORK + I AM WISE"],
    ["CONDITIONS.MODE","conditions","Conditions","HUNGRY/THIRSTY · ANGRY · TIRED · INJURED · SICK"],
    ["RECOVERY.MODE","recovery","Recovery","MG2E RECOVERY"],
    ["CIRCLES.MODE","circles","Circles","HOMETOWN / CONTACT / ENMITY"],
    ["CREATION.RECRUITMENT","creation","Character Creation","MG2E 21-STEP RECRUITMENT"]
  ].map(([id, domain, title, activeValue]) => ({
    id, domain, title, activeValue,
    classification: "SOURCE-AUDITED FOUNDATION",
    automation: "READ ONLY",
    source: MG2E_SOURCE,
    sourceVersion: "2015 / 2E"
  })),
  metadata: {
    foundationOnly: true,
    selectable: false,
    supported: false,
    activationState: "FOUNDATION_ONLY",
    qaActivationOnly: false,
    sourceLineage: ["Mouse Guard RPG 2E / 2015"],
    gameplayChangeIntended: false,
    liveRuleAuthority: false,
    conversionPreviewAvailable: false,
    implementationPhase: "M10C.1",
    sourceAuditStatus: "PARTIAL_LOCKED_FOUNDATION",
    auditedDomains: ["tests","nature","traits","wises","help","conditions","recovery","circles","creation"],
    pendingDomains: ["abilities-advancement","inventory-gear","conflict","session","comparative-scale","full-recruitment-commit"],
    nextStep: "M10C.2 MG2E domain-completion audit and generic preview routing"
  }
});
