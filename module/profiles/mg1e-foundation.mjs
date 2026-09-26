import { RulesProfile } from "../core/rules-profile.mjs";

const MG1E_SOURCE = "Mouse Guard Roleplaying Game (2008 / 1E)";

export const MG1E_FOUNDATION_PROFILE = new RulesProfile({
  id: "mg1e",
  version: 6,
  name: "Mouse Guard 1E — Foundation",
  classification: "SOURCE FOUNDATION / NOT SELECTABLE",
  domains: {
    profile: { activationState: "FOUNDATION_ONLY" },
    tests: { mode: "MG1E", ordinary: true, versus: true, beginnersLuck: true },
    abilities: { advancement: "PASS_FAIL" },
    nature: { mode: "MG1E", label: "Nature (Mouse)", descriptors: ["Escaping", "Climbing", "Hiding", "Foraging"], tax: true, tapNature: true, doubleTapNature: true, tapExcludedAbilities: ["Resources", "Circles"], zeroRatingNatureFallback: true },
    traits: {
      mode: "MG1E",
      positiveTraitsPerTest: 1,
      levels: { 1: "PLUS_1D_ONCE_PER_SESSION", 2: "PLUS_1D_EVERY_APPLICABLE_TEST", 3: "REROLL_ALL_FAILED_DICE_ONCE_PER_SESSION" },
      against: { impede: { dice: -1, checks: 1 }, hurtVersusOpponent: { dice: 2, checks: 2 }, breakTieForOpponent: { checks: 2 } },
      chargeRecharge: { chargeChecks: 3, rechargeLevel1Checks: 2, rechargeLevel3Checks: 4 }
    },
    wises: { ratingMode: "RATED", advancement: "SKILL_LIKE", selfHelp: "I_AM_WISE" },
    help: { teamwork: true, iAmWise: true, synergy: false, helperConsequences: true, afraidBlocksHelp: false, sourcePolicy: "MG1E_TYPED" },
    resources: { fatePersona: "MG1E", fateTiming: "AFTER_ROLL_OPEN_SIXES", personaTiming: "BEFORE_ROLL", personaDiceMax: 3, tapNature: true },
    conditions: { mode: "MG1E", set: ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"] },
    recovery: {
      mode: "MG1E",
      order: ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"],
      oneRecoveryTestPerConditionPerTurn: true,
      gmTurnCheckCost: 2,
      hungry: { obstacle: 1, methods: ["Harvester", "Cook", "Brewer", "Baker", "Resources", "Narrative Feeding"] },
      angry: { recoveryAbility: "Will", obstacle: 2, helpAllowed: false },
      tired: { recoveryAbility: "Health", obstacle: 3, helpAllowed: false, goodRest: true, resourcesObstacle: 2 },
      injured: { recoveryAbility: "Health", obstacle: 4, helpAllowed: false, failedRecovery: "HEALER_REQUIRED", healerObstacle: 3, permanentReductionExcludes: ["Resources", "Circles"], playersTurnWaiver: true },
      sick: { recoveryAbility: "Will", obstacle: 4, helpAllowed: false, failedRecovery: "HEALER_REQUIRED", healerObstacle: 3, permanentReductionExcludes: ["Resources", "Circles"], playersTurnWaiver: true }
    },
    inventory: { policy: "LOOSE", structuredPlacementAuthority: false, capacityMode: "CHARACTER_SHEET_GEAR_SPACE", preservePlacementAsPresentation: true },
    conflict: {
      mode: "MG1E",
      actionsPerExchange: 3,
      rotateParticipants: true,
      helpAllowed: true,
      toolScope: "EXCHANGE",
      weaponScope: "ACTION_SET",
      unarmedDefaultDice: 0,
      toolContent: "MG1E_2008",
      armorContent: "MG1E_LIGHT_HEAVY",
      weaponAlias: {},
      weaponsOfWit: true,
      disarmTargetKinds: ["weapon", "gear", "trait", "natural"],
      scaleOfMightAware: false,
      disposition: {
        argument: { skills: ["Persuader"], bases: ["Will"] },
        chase: { skills: ["Scout"], bases: ["Nature"], basePolicy: "MOUSE_NATURE_ONLY_WHEN_DESCRIPTORS_APPLY" },
        fight: { skills: ["Fighter"], bases: ["Health", "Nature"], basePolicy: "NATURE_ONLY_WHEN_DESCRIPTORS_APPLY" },
        fightCreature: { skills: ["Fighter", "Hunter"], bases: ["Health", "Nature"], basePolicy: "NATURE_ONLY_WHEN_DESCRIPTORS_APPLY" },
        journey: { skills: ["Pathfinder"], bases: ["Health"] },
        negotiation: { skills: ["Haggler"], bases: ["Will"] },
        speech: { skills: ["Orator"], bases: ["Will"] },
        war: { skills: ["Militarist"], bases: ["Will"] },
        other: { skills: [], bases: [], basePolicy: "GM_CALL" }
      },
      actionSkills: {
        argument: { attack: ["Persuader"], defend: ["Persuader"], feint: ["Persuader", "Deceiver"], maneuver: ["Persuader", "Deceiver"] },
        chase: { attack: ["Scout"], defend: ["Pathfinder"], feint: ["Pathfinder"], maneuver: ["Scout"] },
        fight: { attack: ["Fighter"], defend: ["Nature"], feint: ["Fighter"], maneuver: ["Nature"] },
        fightCreature: { attack: ["Fighter", "Hunter"], defend: ["Lore Master", "Nature"], feint: ["Fighter", "Hunter"], maneuver: ["Lore Master", "Nature"] },
        negotiation: { attack: ["Haggler"], defend: ["Haggler"], feint: ["Deceiver"], maneuver: ["Deceiver"] },
        journey: { attack: ["Pathfinder"], defend: ["Survivalist", "Weather Watcher"], feint: ["Pathfinder"], maneuver: ["Survivalist", "Weather Watcher"] },
        speech: { attack: ["Orator"], defend: ["Orator"], feint: ["Orator", "Deceiver"], maneuver: ["Orator", "Deceiver"] },
        war: { attack: ["Militarist"], defend: ["Militarist", "Orator", "Administrator"], feint: ["Militarist", "Administrator"], maneuver: ["Militarist"] },
        other: { attack: ["*"], defend: ["*"], feint: ["*"], maneuver: ["*"] }
      }
    },
    session: { mode: "MG1E", freePlayerTurnTests: 1, additionalTestCheckCost: 1, recoveryDuringGmTurnCheckCost: 2, endSession: "MG1E", embodimentMayAwardEveryone: false },
    circles: { mode: "MG1E", enmityClause: true },
    creation: { mode: "MG1E", liveAuthority: "NONE" },
    progression: { levels: false, talents: false },
    tokensOfPower: { enabled: false },
    naturalOrder: { enabled: true, mode: "MG1E", fighterHunterOutcomePolicy: true, militaristRule: true, scientistRule: true },
    scaleOfMight: { enabled: false, mode: "NONE", replacedBy: "naturalOrder" }
  },
  registry: [
    ["PROFILE.IDENTITY","profile","Rules Profile","MOUSE GUARD 1E FOUNDATION","SOURCE FOUNDATION / NOT LIVE","INACTIVE"],
    ["TEST.RESOLUTION","tests","Test Resolution","MG1E ORDINARY / VERSUS / BEGINNER'S LUCK","INHERITED CORE RULE","AUTOMATIC"],
    ["ABILITY.ADVANCEMENT","abilities","Ability / Skill Advancement","PASS / FAIL ADVANCEMENT","INHERITED CORE RULE","AUTOMATIC"],
    ["WISE.MODE","wises","Wise Rating Mode","RATED · TESTED / ADVANCED LIKE SKILLS","INHERITED CORE RULE","AUTOMATIC"],
    ["TRAIT.MODE","traits","Trait Resolution","MG1E LEVEL 1 / 2 / 3 + TRAIT AGAINST / CHECKS","INHERITED CORE RULE","GUIDED"],
    ["NATURE.MODE","nature","Nature Resolution","MG1E NATURE / TAX / TAP NATURE","INHERITED CORE RULE","GUIDED"],
    ["HELP.MODE","help","Help / Teamwork","TEAMWORK + I AM WISE · NO SYNERGY","INHERITED CORE RULE","GUIDED"],
    ["RESOURCES.FATE_PERSONA","resources","Fate / Persona","MG1E FATE / PERSONA + TAP NATURE","INHERITED CORE RULE","GUIDED"],
    ["CONDITIONS.MODE","conditions","Conditions","HEALTHY · HUNGRY/THIRSTY · ANGRY · TIRED · INJURED · SICK","INHERITED CORE RULE","GUIDED"],
    ["RECOVERY.MODE","recovery","Recovery","MG1E RECOVERY ORDER / CHECK ECONOMY","INHERITED CORE RULE","GUIDED"],
    ["INVENTORY.POLICY","inventory","Inventory Policy","LOOSE","INHERITED CORE RULE","MANUAL"],
    ["CONFLICT.ENGINE","conflict","Conflict Engine","MG1E THREE-ACTION EXCHANGES / PROFILE TOOLS","INHERITED CORE RULE","GUIDED"],
    ["SESSION.TURN_MANAGER","session","Players' Turn / Checks","ONE FREE TEST · CHECKS FOR ADDITIONAL TESTS","INHERITED CORE RULE","GUIDED"],
    ["SESSION.END_SESSION","session","End Session","MG1E FATE / PERSONA AWARDS","INHERITED CORE RULE","GUIDED"],
    ["CIRCLES.MODE","circles","Circles","MG1E CIRCLES + ENMITY CLAUSE","INHERITED CORE RULE","GUIDED"],
    ["CREATION.RECRUITMENT","creation","Character Creation","MG1E SOURCE FOUNDATION","INHERITED SOURCE RULE","INACTIVE"],
    ["PROGRESSION.LEVELS_TALENTS","progression","Levels / Talents","DISABLED / NOT PART OF MG1E","INHERITED SOURCE RULE","INACTIVE"],
    ["TOKENS_OF_POWER.MODE","tokensOfPower","Tokens of Power","NOT A BASE MG1E DOMAIN","NOT APPLICABLE","INACTIVE"],
    ["NATURAL_ORDER.MODE","naturalOrder","Natural Order","MG1E NATURAL ORDER · FIGHTER/HUNTER + MILITARIST/SCIENTIST","INHERITED SOURCE RULE","GUIDED"],
    ["SCALE_OF_MIGHT.MODE","scaleOfMight","Scale of Might","NOT A BASE MG1E DOMAIN · NATURAL ORDER APPLIES","NOT APPLICABLE","INACTIVE"]
  ].map(([id, domain, title, activeValue, classification, automation]) => ({
    id, domain, title, activeValue, classification, automation,
    source: MG1E_SOURCE, sourceVersion: "2008 / 1E"
  })),
  metadata: {
    foundationOnly: true,
    selectable: false,
    supported: false,
    activationState: "FOUNDATION_ONLY",
    sourceLineage: ["Mouse Guard RPG 2008 / 1E"],
    gameplayChangeIntended: false,
    liveRuleAuthority: false,
    conversionPreviewAvailable: true,
    implementationPhase: "M10B.5",
    nextStep: "M10B.5 Gear / Inventory / Conflict routing QA"
  }
});
