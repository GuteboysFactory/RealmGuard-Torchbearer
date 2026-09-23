import { RulesProfile } from "../core/rules-profile.mjs";

const RG_SOURCE = "Realm Guard v1.6";
const STRICT_SOURCE = "Mouse Guard Roleplaying Game (2008 / 1E) + Realm Guard v1.6 overrides";

export const REALM_GUARD_STRICT_PROFILE = new RulesProfile({
  id: "realm-guard-strict",
  version: 7,
  name: "Realm Guard — Strict",
  parent: "mg1e",
  classification: "STRICT PROFILE MANIFEST / PREVIEW ONLY",
  domains: {
    profile: { activationState: "PREVIEW_ONLY" },
    nature: { mode: "MG1E_WITH_REALM_GUARD_OVERRIDES", descriptors: ["Tradition", "Family", "Grief"] },
    conditions: {
      mode: "REALM_GUARD_STRICT",
      set: ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"],
      replaces: { Sick: "Strained" },
      excludesLegacyDefaults: ["Fresh", "Afraid"]
    },
    recovery: {
      mode: "REALM_GUARD_STRICT",
      order: ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"],
      hungry: { obstacle: 1, methods: ["Harvester", "Cook", "Brewer", "Baker", "Resources", "Narrative Feeding"] },
      angry: { recoveryAbility: "Will", obstacle: 2, helpAllowed: false },
      tired: { recoveryAbility: "Health", obstacle: 3, helpAllowed: false, goodRest: true, resourcesObstacle: 2 },
      injured: { recoveryAbility: "Health", obstacle: 4, helpAllowed: false, failedRecovery: "HEALER_REQUIRED", healerObstacle: 3, permanentReductionExcludes: ["Resources", "Circles"] },
      strained: { recoveryAbility: "Will", obstacle: 4, helpAllowed: false, failedRecovery: "COUNSEL_FROM_FRIEND", gmTurnCounselCheckCost: 2, penaltyExclusions: ["Resources", "Circles", "Will Recovery", "Health Recovery"] }
    },
    conflict: {
      mode: "MG1E_WITH_REALM_GUARD_CONTENT",
      toolContent: "MG1E_2008_PLUS_REALM_GUARD_V1_6",
      weaponAlias: { "Hook and Line": "Whip" },
      toolScope: "EXCHANGE",
      unarmedDefaultDice: 0,
      scaleOfMightAware: true,
      armorContent: "MG1E_LIGHT_HEAVY_PLUS_REALM_GUARD_PLATED",
      weaponsOfWit: true,
      disarmTargetKinds: ["weapon", "gear", "trait", "natural"]
    },
    session: {
      mode: "MG1E",
      coreEngine: "M7",
      playerTurnFreeTests: 1,
      additionalTestCheckCost: 1,
      alternation: true,
      soloAlternationException: true,
      gmTurnRecoveryCheckCost: 2,
      tableRewardAuthority: "GROUP_CONSENSUS",
      foundryCommitAuthority: "GM",
      embodimentMayAwardEveryone: false
    },
    circles: {
      mode: "MG1E",
      socialStorage: "CORE_M8_FOUNDRY_TOOLING",
      knownContactFutureDice: 1,
      enmityClause: true,
      enmityArgumentSpeechDispositionSuccess: 3
    },
    progression: {
      mode: "MG1E",
      levels: false,
      talents: false,
      preserveExistingData: true,
      lifetimeSpendLevelTracking: false,
      advancement: "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1",
      ratingZeroOnePassNeeded: 1,
      clearSlateOnAdvance: true,
      oneTestPerAbilityOrSkillPerConflictScene: true,
      beginnerLearningOpensAt: 2
    },
    creation: {
      mode: "REALM_GUARD_STRICT_PROFILE",
      coreEngine: "M9",
      liveAuthority: "NONE",
      profileId: "realm-guard-strict",
      profileVersion: 1,
      ratedWises: true,
      startingSkillWiseCap: 6,
      levelsTalents: false,
      inventoryPolicy: "LOOSE",
      strictEnemyValidation: true,
      mentorValidation: true,
      conditionProvisioning: "REALM_GUARD_STRICT_SET",
      automaticNpcCreation: false
    },
    tokensOfPower: { enabled: true, source: "REALM_GUARD_V1_6", levelSemantics: "MG1E_TRAIT_LEVELS" },
    scaleOfMight: { enabled: true, mode: "REALM_GUARD_V1_6", automation: "MANUAL_GUIDED", loreMasterRule: true, militaristRule: true }
  },
  registry: [
    { id: "PROFILE.IDENTITY", domain: "profile", title: "Rules Profile", activeValue: "REALM GUARD — STRICT · PREVIEW ONLY", classification: "STRICT PROFILE MANIFEST / NOT LIVE", automation: "INACTIVE", source: STRICT_SOURCE, sourceVersion: "MG 2008 / RG 1.6", overrideReason: "M10A.1 completes the Strict manifest and conversion preview. Live activation remains blocked." },
    { id: "NATURE.MODE", domain: "nature", title: "Nature Resolution", activeValue: "MG1E NATURE · DÚNADAN: TRADITION / FAMILY / GRIEF", classification: "REALM GUARD OVERRIDE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "Realm Guard supplies the Dúnadan Nature descriptors over the inherited MG1E Nature engine." },
    { id: "CONDITIONS.MODE", domain: "conditions", title: "Conditions", activeValue: "HEALTHY · HUNGRY/THIRSTY · ANGRY · TIRED · INJURED · STRAINED", classification: "REALM GUARD OVERRIDE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "Strained replaces Sick. Fresh and Afraid are not Strict Realm Guard default conditions." },
    { id: "RECOVERY.MODE", domain: "recovery", title: "Recovery", activeValue: "MG1E RECOVERY + REALM GUARD STRAINED RECOVERY", classification: "REALM GUARD OVERRIDE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6" },
    { id: "CONFLICT.ENGINE", domain: "conflict", title: "Conflict Engine", activeValue: "MG1E CONFLICT + REALM GUARD TOOLS / SCALE OWNERSHIP", classification: "REALM GUARD OVERRIDE / MG1E INHERITANCE", automation: "GUIDED", source: STRICT_SOURCE, sourceVersion: "MG 2008 / RG 1.6", overrideReason: "The generic conflict engine is inherited; Realm Guard content and Scale interactions are profile-owned." },
    { id: "SESSION.TURN_MANAGER", domain: "session", title: "Turn Manager / Checks", activeValue: "MG1E PLAYERS' TURN · 1 FREE TEST · EXTRA TESTS COST CHECKS", classification: "MG1E INHERITANCE", automation: "GUIDED", source: "Mouse Guard Roleplaying Game (2008 / 1E)", sourceVersion: "2008" },
    { id: "SESSION.END_SESSION", domain: "session", title: "End Session", activeValue: "MG1E REWARDS · GROUP CONSENSUS / GM COMMIT", classification: "MG1E INHERITANCE", automation: "GUIDED", source: "Mouse Guard Roleplaying Game (2008 / 1E)", sourceVersion: "2008" },
    { id: "CIRCLES.MODE", domain: "circles", title: "Circles", activeValue: "MG1E CIRCLES + ENMITY CLAUSE · M8 STORAGE", classification: "MG1E INHERITANCE / FOUNDRY TOOLING", automation: "GUIDED", source: "Mouse Guard Roleplaying Game (2008 / 1E)", sourceVersion: "2008" },
    { id: "PROGRESSION.LEVELS_TALENTS", domain: "progression", title: "Progression", activeValue: "MG1E PASS/FAIL ADVANCEMENT · LEVELS/TALENTS DISABLED", classification: "MG1E INHERITANCE", automation: "GUIDED", source: "Mouse Guard Roleplaying Game (2008 / 1E)", sourceVersion: "2008", overrideReason: "Strict Realm Guard preserves Legacy Mixed level/talent data but does not use it mechanically." },
    { id: "CREATION.RECRUITMENT", domain: "creation", title: "Character Creation", activeValue: "CORE M9 · STRICT REALM GUARD PROFILE · READ-ONLY PREVIEW", classification: "REALM GUARD OVERRIDE", automation: "PREVIEW", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "M10A.6 binds a source-correct Strict creation profile to CORE M9 for read-only draft, validation, review and commit-plan preview. Live commit remains locked." },
    { id: "TOKENS_OF_POWER.MODE", domain: "tokensOfPower", title: "Tokens of Power", activeValue: "ENABLED · MG1E TRAIT-LEVEL SEMANTICS", classification: "REALM GUARD RULE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6" },
    { id: "SCALE_OF_MIGHT.MODE", domain: "scaleOfMight", title: "Scale of Might", activeValue: "REALM GUARD v1.6 · MANUAL / GUIDED", classification: "REALM GUARD RULE", automation: "MANUAL", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "M10A.1 declares the source-owned domain without inventing automatic resolution." }
  ],
  metadata: {
    strictRealmGuard: true,
    foundationOnly: false,
    previewOnly: true,
    selectable: false,
    supported: false,
    activationState: "PREVIEW_ONLY",
    sourceLineage: ["Mouse Guard RPG 2008 / 1E", "Realm Guard v1.6 overrides"],
    gameplayChangeIntended: false,
    liveRuleAuthority: false,
    conversionRequired: true,
    conversionPreviewAvailable: true,
    implementationPhase: "M10A.6",
    strictRulesLive: false,
    ratedWiseSchemaReady: true,
    traitPolicyReady: true,
    helpPolicyReady: true,
    conditionPolicyReady: true,
    recoveryPolicyReady: true,
    gearInventoryConflictPolicyReady: true,
    sessionPolicyReady: true,
    circlesPolicyReady: true,
    progressionPolicyReady: true,
    creationPolicyReady: true,
    strictCreationPreviewReady: true,
    nextStep: "M10A.7 Scale / Docs / Rules Reference"
  }
});
