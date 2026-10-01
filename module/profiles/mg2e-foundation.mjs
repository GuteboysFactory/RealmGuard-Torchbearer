import { RulesProfile } from "../core/rules-profile.mjs";

const MG2E_SOURCE = "Mouse Guard Roleplaying Game: Second Edition (2015)";

export const MG2E_FOUNDATION_PROFILE = new RulesProfile({
  id: "mg2e",
  version: 2,
  name: "Mouse Guard 2E",
  classification: "SOURCE PROFILE / FOUNDATION",
  domains: {
    profile: { activationState: "FOUNDATION_ONLY" },

    tests: { mode: "MG2E", ordinary: true, versus: true, beginnersLuck: true },

    abilities: {
      advancement: "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1",
      ratingZeroOnePassNeeded: 1,
      clearSlateOnAdvance: true,
      oneTestPerAbilityOrSkillPerConflictScene: true,
      dispositionRollAdvances: false,
      tieWithoutBreakerAdvances: false,
      obstacleZeroOneSuccessPasses: true,
      beginnerLearningAttemptsUseMaximumNature: true,
      beginnerLearningOpensAt: 2,
      beginnerLuckAdvancesWillHealth: false,
      skillWiseCombinedMaximum: 24
    },

    nature: {
      mode: "MG2E",
      label: "Nature (Mouse)",
      descriptors: ["Escaping", "Climbing", "Hiding", "Foraging"],
      tax: true,
      tapNature: true,
      doubleTapNature: true,
      tapExcludedAbilities: ["Resources", "Circles"],
      wiseSubstitutionAllowed: false,
      currentMaximumAdvancementAuthority: true
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
        iAmWise: { target: "ALLY", dice: 1, replacesHelp: true, helperConditionRisk: false, twistRisk: true },
        deeperUnderstanding: { cost: "FATE", reroll: "ONE_FAILED_DIE", alreadyRerolledDiceExcluded: true },
        ofCourse: { cost: "PERSONA", reroll: "ALL_FAILED_DICE", beforeFateOpenSixes: true }
      },
      progression: {
        usageMarks: ["I_AM_WISE_PASS", "I_AM_WISE_FAIL", "DEEPER_UNDERSTANDING", "OF_COURSE"],
        completedCycleOptions: ["CHANGE_WISE", "BEGINNERS_LUCK_TEST", "SKILL_ADVANCEMENT_TEST"],
        resetAfterPerk: true
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

    conditions: {
      mode: "MG2E",
      set: ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"]
    },

    recovery: {
      mode: "MG2E",
      order: ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"],
      oneRecoveryTestPerConditionPerTurn: true,
      gmTurnCheckCost: 2,
      hungry: { obstacle: 1, methods: ["Harvester", "Cook", "Brewer", "Baker", "Resources", "Narrative Feeding"] },
      angry: { recoveryAbility: "Will", obstacle: 2, helpAllowed: false },
      tired: { recoveryAbility: "Health", obstacle: 3, helpAllowed: false, goodRest: true, resourcesObstacle: 2 },
      injured: {
        recoveryAbility: "Health",
        obstacle: 4,
        helpAllowed: false,
        failedRecovery: "HEALER_REQUIRED",
        healerObstacle: 3,
        permanentReductionExcludes: ["Resources", "Circles"],
        playersTurnWaiver: true
      },
      sick: {
        recoveryAbility: "Will",
        obstacle: 4,
        helpAllowed: false,
        failedRecovery: "HEALER_REQUIRED",
        healerObstacle: 4,
        permanentReductionExcludes: ["Resources", "Circles"],
        playersTurnWaiver: true
      }
    },

    inventory: {
      policy: "LOOSE",
      structuredPlacementAuthority: false,
      capacityMode: "MG2E_CARRY_LIMITS",
      carryLimits: {
        weapons: 2,
        bulkyWeaponReplacesWeaponCapacity: true,
        bulkyExamples: ["Halberd", "Black Axe"],
        satchelOrBagItems: 2,
        armor: 1,
        personalItemsNarrative: true
      },
      relevantGearDice: 1,
      preservePlacementAsPresentation: true
    },

    conflict: {
      mode: "MG2E",
      actionsPerExchange: 3,
      rotateParticipants: true,
      helpAllowed: true,
      maxActionHelpers: 2,
      descriptorNatureAllowed: true,
      toolScope: "ACTION_SET",
      weaponScope: "ACTION_SET",
      unarmedDefaultDice: 0,
      toolContent: "MG2E_2015",
      armorContent: "MG2E_LIGHT_HEAVY",
      weaponsOfWit: true,
      disarmTargetKinds: ["weapon", "gear", "trait", "natural"],
      scaleOfMightAware: false,
      disposition: {
        argument: { skills: ["Persuader"], bases: ["Will"] },
        chase: { skills: ["Scout"], bases: ["Health", "Nature"], basePolicy: "MOUSE_NATURE_ONLY_WHEN_DESCRIPTORS_APPLY" },
        fight: { skills: ["Fighter"], bases: ["Health", "Nature"], basePolicy: "NATURE_ONLY_WHEN_DESCRIPTORS_APPLY" },
        fightCreature: { skills: ["Fighter", "Hunter"], bases: ["Health", "Nature"], basePolicy: "NATURE_ONLY_WHEN_DESCRIPTORS_APPLY" },
        journey: { skills: ["Pathfinder"], bases: ["Health"] },
        negotiation: { skills: ["Haggler"], bases: ["Will"] },
        speech: { skills: ["Orator"], bases: ["Will"] },
        war: { skills: ["Militarist"], bases: ["Will"] },
        other: { skills: [], bases: [], basePolicy: "GM_CALL" }
      },
      actionSkills: {
        argument: { attack: ["Persuader"], defend: ["Persuader"], feint: ["Persuader", "Manipulator"], maneuver: ["Persuader", "Manipulator"] },
        chase: { attack: ["Scout"], defend: ["Pathfinder"], feint: ["Pathfinder"], maneuver: ["Scout"] },
        fight: { attack: ["Fighter"], defend: ["Nature"], feint: ["Fighter"], maneuver: ["Nature"] },
        fightCreature: { attack: ["Fighter", "Hunter"], defend: ["Loremouse", "Nature"], feint: ["Fighter", "Hunter"], maneuver: ["Loremouse", "Nature"] },
        negotiation: { attack: ["Haggler"], defend: ["Haggler"], feint: ["Manipulator", "Persuader"], maneuver: ["Manipulator", "Persuader"] },
        journey: { attack: ["Pathfinder"], defend: ["Survivalist", "Weather Watcher"], feint: ["Pathfinder"], maneuver: ["Survivalist", "Weather Watcher"] },
        speech: { attack: ["Orator"], defend: ["Orator"], feint: ["Orator", "Manipulator"], maneuver: ["Orator", "Manipulator"] },
        war: { attack: ["Militarist"], defend: ["Militarist", "Orator", "Administrator"], feint: ["Militarist", "Administrator"], maneuver: ["Militarist"] },
        other: { attack: ["*"], defend: ["*"], feint: ["*"], maneuver: ["*"] }
      },
      weapons: {
        axe: { attackSuccess: 1, defendDice: -1, feintDice: -1 },
        bow: { missile: true, maneuverDice: 2, rainDisabled: true, twoHands: true, shieldCompatible: false },
        halberd: { attackDice: 1, defendDice: 1, feintDice: -1, maneuverDice: -1, bulky: true, twoHands: true, shieldCompatible: false },
        hookAndLine: { maneuverDice: 1, maneuverSuccess: 1, attackDice: -1 },
        knife: { shortAndQuickAutoDisarmAgainstLongerWeapons: true, throwable: true },
        shield: { defendDice: 2, fatigueRecoveryHealthDice: -1 },
        sling: { missile: true, maneuverDice: 1 },
        spear: { feintSuccess: 1, defendDice: 1 },
        staff: { feintDice: 1, staffConditionRecoveryDice: 1 },
        sword: { chooseOneFightActionDice: 1 }
      },
      armor: {
        light: { absorbDispositionDamage: 1, usesPerConflict: 1, maceException: true, fatigueRecoveryHealthDice: -1 },
        heavy: { absorbDispositionDamage: 1, usesPerHit: true, maceException: true, maneuverDice: -1, scoutSneakDice: -1, natureHideDice: -1, fatigueRecoveryHealthDice: -1 }
      }
    },

    session: {
      mode: "MG2E",
      coreEngine: "M7",
      playerTurnFreeTests: 1,
      additionalTestCheckCost: 1,
      alternation: true,
      soloAlternationException: true,
      checksTransferable: true,
      playerTurnConflictCheckCost: 1,
      traitAgainstChecksOnlyDuringGmTurn: true,
      gmTurnRecoveryCheckCost: 2,
      endSession: "MG2E",
      tableRewardAuthority: "GROUP_CONSENSUS",
      foundryCommitAuthority: "GM",
      fatePerSessionMax: 3,
      personaPerSessionMax: 4,
      fateAwards: ["ACT_ON_BELIEF", "WORK_TOWARD_UNFINISHED_GOAL", "PLAY_INSTINCT"],
      personaAwards: ["ACCOMPLISH_GOAL", "PLAY_AGAINST_BELIEF", "MVP", "WORKHORSE", "EMBODIMENT"],
      mvpCountMax: 1,
      workhorseCountMax: 1,
      mvpAndWorkhorseSamePlayer: false,
      embodimentMayAwardMultiple: true,
      embodimentMayAwardEveryone: false
    },

    circles: {
      mode: "MG2E",
      socialStorage: "CORE_M8_FOUNDRY_TOOLING",
      hometownAdvantageDice: 1,
      knownContactFutureDice: 1,
      enmityClause: true,
      enmityArgumentSpeechDispositionSuccess: 3,
      automaticNpcCreation: false
    },

    creation: {
      mode: "MG2E",
      coreEngine: "CORE_M9",
      liveAuthority: "NONE",
      readyWhenActive: false,
      profileId: "mg2e",
      profileVersion: 2,
      wiseMode: "UNRATED",
      ratedWises: false,
      maxWiseCount: 4,
      wiseCountByRank: { tenderpaw: 1, guardmouse: 1, patrolGuard: 2, patrolLeader: 3, guardCaptain: 4 },
      tenderpawWiseChoices: ["Code of the Guard-wise", "Legends of the Guard-wise"],
      guardCaptainRequiredWiseChoices: ["Lockhaven-wise", "Matriarch-wise"],
      ranks: ["tenderpaw", "guardmouse", "patrolGuard", "patrolLeader", "guardCaptain"],
      rankTemplates: {
        tenderpaw: { will: 2, health: 6, resources: 1, circles: 1, age: [14,17], skills: { Pathfinder: 2, Scout: 2, Laborer: 2 } },
        guardmouse: { will: 3, health: 5, resources: 2, circles: 2, age: [18,25], skills: { Fighter: 3, Haggler: 2, Scout: 2, Pathfinder: 3, Survivalist: 2 } },
        patrolGuard: { will: 4, health: 4, resources: 3, circles: 3, age: [21,50], skills: { Cook: 2, Fighter: 3, Hunter: 3, Scout: 2, Healer: 2, Pathfinder: 2, Survivalist: 2, "Weather Watcher": 2 } },
        patrolLeader: { will: 5, health: 4, resources: 4, circles: 3, age: [21,60], skills: { Fighter: 3, Hunter: 3, Instructor: 2, Loremouse: 2, Persuader: 2, Pathfinder: 3, Scout: 2, Survivalist: 3, "Weather Watcher": 2 } },
        guardCaptain: { will: 6, health: 3, resources: 5, circles: 4, age: [41,60], skills: { Administrator: 3, Fighter: 3, Healer: 2, Hunter: 3, Instructor: 2, Militarist: 3, Orator: 2, Pathfinder: 3, Scout: 3, Survivalist: 3, "Weather Watcher": 3 } }
      },
      startingSkillRating: 2,
      startingSkillCap: 6,
      natureBase: 3,
      natureQuestions: 3,
      mentorValidation: "MG2E_SOURCE_RULES",
      tenderpawMentorMustBeCurrentPlayerCharacterPreferredPatrolLeader: true,
      experiencedMentorRequiresNpcOrOldfurPc: true,
      enemyValidation: "MG2E_OPTIONAL_ANY_APPROPRIATE_ENEMY",
      enemyHouseRuleAllowed: true,
      cloakTenderpawStartsWithout: true,
      startingRewards: { fate: 1, persona: 1 },
      startingGear: {
        oneWeaponChoice: ["Shield", "Knife", "Sword", "Staff", "Spear", "Hook and Line", "Halberd", "Sling", "Bow"],
        additionalJobToolsAllowed: true
      },
      automaticNpcCreation: false,
      legacyCommitOverrideAllowed: false
    },

    progression: {
      mode: "MG2E",
      levels: false,
      talents: false,
      preserveExistingData: true,
      lifetimeSpendLevelTracking: false,
      advancement: "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1",
      ratingZeroOnePassNeeded: 1,
      clearSlateOnAdvance: true,
      oneTestPerAbilityOrSkillPerConflictScene: true,
      beginnerLearningOpensAt: 2,
      beginnerLearningAttemptsUseMaximumNature: true,
      beginnerLuckAdvancesWillHealth: false,
      skillWiseCombinedMaximum: 24
    },

    tokensOfPower: { enabled: false },

    naturalOrder: {
      enabled: true,
      mode: "MG2E",
      scaleId: "mg2e-natural-order",
      name: "Natural Order",
      rankMin: 1,
      rankMax: 9,
      baseActorKind: "Mouse",
      baseRank: 3,
      fighterHunterOutcomePolicy: true,
      militaristRule: true,
      scientistRule: true,
      groupWarMode: "MG2E_MILITARIST",
      specialSkillMode: "MG2E_SCIENTIST",
      liveApplication: false
    },

    scaleOfMight: { enabled: false, mode: "NONE", replacedBy: "naturalOrder" }
  },

  registry: [
    ["PROFILE.IDENTITY","profile","Rules Profile","MOUSE GUARD 2E"],
    ["TEST.RESOLUTION","tests","Test Resolution","MG2E ORDINARY / VERSUS / BEGINNER'S LUCK"],
    ["ABILITY.ADVANCEMENT","abilities","Ability / Skill Advancement","PASS=RATING · FAIL=RATING-1"],
    ["NATURE.MODE","nature","Nature Resolution","MOUSE NATURE"],
    ["TRAIT.MODE","traits","Trait Resolution","L1 +1D ONCE · L2 +1D TWICE · L3 +1s"],
    ["WISE.MODE","wises","Wise Mode","UNRATED · I AM WISE / DEEPER UNDERSTANDING / OF COURSE!"],
    ["HELP.MODE","help","Help / Wise Aid","TEAMWORK + I AM WISE AS DISTINCT SUPPORT"],
    ["CONDITIONS.MODE","conditions","Conditions","HUNGRY/THIRSTY · ANGRY · TIRED · INJURED · SICK"],
    ["RECOVERY.MODE","recovery","Recovery","MG2E ORDER / CHECK ECONOMY / HEALER ROUTES"],
    ["INVENTORY.POLICY","inventory","Inventory Policy","LOOSE · MG2E CARRY LIMITS"],
    ["CONFLICT.ENGINE","conflict","Conflict Engine","THREE-ACTION EXCHANGES · MG2E SKILLS / GEAR"],
    ["SESSION.TURN_MANAGER","session","Players' Turn / Checks","ONE FREE TEST · CHECKS · ALTERNATION"],
    ["SESSION.END_SESSION","session","End Session","MG2E FATE / PERSONA AWARDS"],
    ["CIRCLES.MODE","circles","Circles","HOMETOWN +1D · CONTACT +1D · ENMITY +3s"],
    ["CREATION.RECRUITMENT","creation","Character Creation","MG2E 21-STEP RECRUITMENT FOUNDATION"],
    ["PROGRESSION.LEVELS_TALENTS","progression","Levels / Talents","DISABLED / NOT BASE MG2E"],
    ["TOKENS_OF_POWER.MODE","tokensOfPower","Tokens of Power","NOT A BASE MG2E DOMAIN"],
    ["NATURAL_ORDER.MODE","naturalOrder","Natural Order","MG2E 9-RANK NATURAL ORDER · MILITARIST / SCIENTIST"],
    ["SCALE_OF_MIGHT.MODE","scaleOfMight","Scale of Might","NOT A BASE MG2E DOMAIN"]
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
    conversionPreviewAvailable: true,
    implementationPhase: "M10C.2",
    sourceAuditStatus: "DOMAIN_COMPLETE_FOUNDATION",
    auditedDomains: [
      "tests","abilities-advancement","nature","traits","wises","help","conditions","recovery",
      "inventory-gear","conflict","session","circles","creation","progression","natural-order"
    ],
    pendingDomains: ["full-recruitment-commit","live-rules-reference","activation-readiness"],
    nextStep: "M10C.3 MG2E shadow rule adapters / activation-readiness foundation"
  }
});
