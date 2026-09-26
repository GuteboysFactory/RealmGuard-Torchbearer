function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function text(value, fallback = "") {
  const next = String(value ?? "").trim();
  return next || fallback;
}

function bool(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function numeric(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function legacyCurrent(domain) {
  return text(domain?.mode).toLowerCase() === "legacy-current";
}

function mg1eTraitLevels(traits = {}) {
  const levels = traits?.levels ?? {};
  return levels?.[1] === "PLUS_1D_ONCE_PER_SESSION"
    && levels?.[2] === "PLUS_1D_EVERY_APPLICABLE_TEST"
    && levels?.[3] === "REROLL_ALL_FAILED_DICE_ONCE_PER_SESSION";
}

/**
 * M10B.1 Generic Profile Presentation & Rule Router.
 *
 * This is deliberately read-only. It normalizes a resolved RulesProfile into
 * capability flags that future live routing/UI can consume without asking
 * "is this Strict?". It performs no Foundry writes and never removes dormant
 * profile-specific data.
 */
export function buildProfileCapabilities(profile) {
  if (!profile?.id || !profile?.domains) throw new Error("buildProfileCapabilities requires a resolved RulesProfile.");

  const d = profile.domains;
  const legacyHelp = legacyCurrent(d.help);
  const legacyConflict = legacyCurrent(d.conflict);
  const ratedWises = text(d.wises?.ratingMode).toUpperCase() === "RATED";
  const mgTraits = text(d.traits?.mode).toUpperCase() === "MG1E" || mg1eTraitLevels(d.traits);
  const inventoryPolicy = text(d.inventory?.policy, "STRUCTURED").toUpperCase();
  const placementAuthority = bool(d.inventory?.structuredPlacementAuthority, inventoryPolicy === "STRUCTURED");
  const conditionNames = Array.isArray(d.conditions?.set) ? [...d.conditions.set] : [];
  const conditionSetExplicit = conditionNames.length > 0;
  const levelsEnabled = d.progression?.levels !== false;
  const talentsEnabled = d.progression?.talents !== false;
  const tokensOfPowerEnabled = d.tokensOfPower?.enabled === true;
  const scaleOfMightEnabled = d.scaleOfMight?.enabled === true;
  const foundationOnly = profile.metadata?.foundationOnly === true;

  const capabilities = {
    phase: "M10B.6",
    source: "RESOLVED_RULES_PROFILE",
    profile: {
      id: profile.id,
      version: profile.version,
      name: profile.name,
      rulesSnapshotHash: profile.rulesSnapshotHash,
      foundationOnly,
      selectable: profile.metadata?.selectable !== false,
      supported: profile.metadata?.supported !== false,
      liveRuleAuthority: !foundationOnly && profile.metadata?.liveRuleAuthority !== false
    },
    rules: {
      tests: {
        mode: text(d.tests?.mode, "PROFILE_DEFINED"),
        beginnersLuck: d.tests?.beginnersLuck !== false
      },
      wises: {
        ratingMode: text(d.wises?.ratingMode, "PROFILE_DEFINED").toUpperCase(),
        rated: ratedWises,
        testableAsSkill: ratedWises,
        selfUse: ratedWises ? "I_AM_WISE_1D" : legacyHelp ? "LEGACY_WISE_REROLL" : "PROFILE_DEFINED",
        helperUse: ratedWises && d.help?.teamwork === true
          ? "TEAMWORK_WISE_1D"
          : legacyHelp ? "LEGACY_I_AM_WISE_1D" : "PROFILE_DEFINED"
      },
      traits: {
        mode: text(d.traits?.mode, "PROFILE_DEFINED"),
        mg1eLevelSemantics: mgTraits
      },
      help: {
        teamwork: bool(d.help?.teamwork, !legacyHelp),
        iAmWise: bool(d.help?.iAmWise, !legacyHelp),
        synergyEnabled: bool(d.help?.synergy, legacyHelp),
        helperConsequences: bool(d.help?.helperConsequences, !legacyHelp),
        afraidBlocksHelp: bool(d.help?.afraidBlocksHelp, legacyHelp),
        sourcePolicy: text(d.help?.sourcePolicy, legacyHelp ? "LEGACY_OPEN" : "PROFILE_DEFINED").toUpperCase()
      },
      nature: {
        mode: text(d.nature?.mode, "PROFILE_DEFINED"),
        descriptors: Array.isArray(d.nature?.descriptors) ? [...d.nature.descriptors] : [],
        label: text(d.nature?.label, profile.id === "mg1e" ? "Nature (Mouse)" : "Nature"),
        tax: d.nature?.tax === true,
        tapNature: d.nature?.tapNature === true,
        doubleTapNature: d.nature?.doubleTapNature === true,
        tapExcludedAbilities: Array.isArray(d.nature?.tapExcludedAbilities) ? [...d.nature.tapExcludedAbilities] : []
      },
      conditions: {
        mode: text(d.conditions?.mode, conditionSetExplicit ? "PROFILE_SET" : "LEGACY_CURRENT"),
        explicitSet: conditionSetExplicit,
        names: conditionNames,
        replaces: d.conditions?.replaces ? { ...d.conditions.replaces } : {},
        excludedDefaults: Array.isArray(d.conditions?.excludesLegacyDefaults) ? [...d.conditions.excludesLegacyDefaults] : []
      },
      recovery: {
        mode: text(d.recovery?.mode, legacyCurrent(d.recovery) ? "LEGACY_CURRENT" : conditionSetExplicit ? "MG1E_FAMILY" : "PROFILE_DEFINED"),
        familySemantics: conditionSetExplicit && !legacyCurrent(d.recovery),
        order: Array.isArray(d.recovery?.order) ? [...d.recovery.order] : [],
        oneRecoveryTestPerConditionPerTurn: bool(d.recovery?.oneRecoveryTestPerConditionPerTurn, conditionSetExplicit),
        gmTurnCheckCost: numeric(d.recovery?.gmTurnCheckCost ?? d.session?.recoveryDuringGmTurnCheckCost ?? d.session?.gmTurnRecoveryCheckCost, 2),
        hungryMethods: Array.isArray(d.recovery?.hungry?.methods)
          ? [...d.recovery.hungry.methods]
          : Array.isArray(d.recovery?.hungrySkills) ? [...d.recovery.hungrySkills] : [],
        hungry: d.recovery?.hungry ? { ...d.recovery.hungry } : null,
        angry: d.recovery?.angry ? { ...d.recovery.angry } : null,
        tired: d.recovery?.tired ? { ...d.recovery.tired } : null,
        injured: d.recovery?.injured ? { ...d.recovery.injured } : null,
        sick: d.recovery?.sick ? { ...d.recovery.sick } : null,
        strained: d.recovery?.strained ? { ...d.recovery.strained } : null
      },
      inventory: {
        policy: inventoryPolicy,
        placementAuthority,
        placementPresentationOnly: !placementAuthority,
        capacityMode: text(d.inventory?.capacityMode, inventoryPolicy === "LOOSE" ? "PROFILE_DEFINED" : "STRUCTURED_PLACEMENT")
      },
      conflict: {
        mode: text(d.conflict?.mode, "PROFILE_DEFINED"),
        actionsPerExchange: numeric(d.conflict?.actionsPerExchange, 3),
        rotateParticipants: bool(d.conflict?.rotateParticipants, true),
        helpAllowed: bool(d.conflict?.helpAllowed, true),
        unarmedDefaultDice: numeric(d.conflict?.unarmedDefaultDice, legacyConflict ? -1 : 0),
        toolScope: text(d.conflict?.toolScope, "PROFILE_DEFINED"),
        toolContent: text(d.conflict?.toolContent, legacyConflict ? "LEGACY_CURRENT" : "PROFILE_DEFINED"),
        armorContent: text(d.conflict?.armorContent, legacyConflict ? "LEGACY_CURRENT" : "PROFILE_DEFINED"),
        weaponAlias: d.conflict?.weaponAlias ? { ...d.conflict.weaponAlias } : {},
        weaponScope: text(d.conflict?.weaponScope, d.conflict?.toolScope ?? "PROFILE_DEFINED"),
        weaponsOfWit: bool(d.conflict?.weaponsOfWit, !legacyConflict),
        disarmTargetKinds: Array.isArray(d.conflict?.disarmTargetKinds) ? [...d.conflict.disarmTargetKinds] : ["weapon", "gear", "trait", "natural"],
        scaleOfMightAware: d.conflict?.scaleOfMightAware === true,
        actionSkills: Object.fromEntries(Object.entries(d.conflict?.actionSkills ?? {}).map(([type, row]) => [
          type,
          Object.fromEntries(Object.entries(row ?? {}).map(([action, skills]) => [action, Array.isArray(skills) ? [...skills] : []]))
        ])),
        disposition: Object.fromEntries(Object.entries(d.conflict?.disposition ?? {}).map(([type, row]) => [
          type,
          {
            skills: Array.isArray(row?.skills) ? [...row.skills] : [],
            bases: Array.isArray(row?.bases) ? [...row.bases] : [],
            basePolicy: text(row?.basePolicy)
          }
        ]))
      },
      session: {
        mode: text(d.session?.mode, legacyCurrent(d.session) ? "LEGACY_CURRENT" : "PROFILE_DEFINED"),
        familySemantics: !legacyCurrent(d.session) && text(d.session?.mode).toUpperCase().startsWith("MG1E"),
        coreEngine: text(d.session?.coreEngine),
        playerTurnFreeTests: numeric(d.session?.playerTurnFreeTests ?? d.session?.freePlayerTurnTests, 1),
        additionalTestCheckCost: numeric(d.session?.additionalTestCheckCost, 1),
        alternationRequired: bool(d.session?.alternation, true),
        soloAlternationException: bool(d.session?.soloAlternationException, true),
        gmTurnRecoveryCheckCost: numeric(d.session?.gmTurnRecoveryCheckCost ?? d.session?.recoveryDuringGmTurnCheckCost, 2),
        checksTransferable: bool(d.session?.checksTransferable, true),
        endSessionMode: text(d.session?.endSession, legacyCurrent(d.session) ? "LEGACY_CURRENT" : "PROFILE_DEFINED"),
        embodimentMayAwardEveryone: bool(d.session?.embodimentMayAwardEveryone, legacyCurrent(d.session)),
        tableRewardAuthority: text(d.session?.tableRewardAuthority, legacyCurrent(d.session) ? "LEGACY_CURRENT" : "GROUP_CONSENSUS"),
        foundryCommitAuthority: text(d.session?.foundryCommitAuthority, "GM")
      },
      circles: {
        mode: text(d.circles?.mode, legacyCurrent(d.circles) ? "LEGACY_CURRENT" : "PROFILE_DEFINED"),
        familySemantics: !legacyCurrent(d.circles) && text(d.circles?.mode).toUpperCase().startsWith("MG1E"),
        socialStorage: text(d.circles?.socialStorage, legacyCurrent(d.circles) ? "LEGACY_CURRENT" : "CORE_M8_FOUNDRY_TOOLING"),
        knownContactFutureDice: numeric(d.circles?.knownContactFutureDice, legacyCurrent(d.circles) ? 0 : 1),
        enmityClause: bool(d.circles?.enmityClause, !legacyCurrent(d.circles)),
        enmityArgumentSpeechDispositionSuccess: numeric(d.circles?.enmityArgumentSpeechDispositionSuccess, !legacyCurrent(d.circles) ? 3 : 0),
        automaticNpcCreation: bool(d.circles?.automaticNpcCreation, false)
      },
      progression: {
        mode: text(d.progression?.mode, legacyCurrent(d.progression) ? "LEGACY_CURRENT" : "PROFILE_DEFINED"),
        levelsEnabled,
        talentsEnabled,
        preserveExistingData: bool(d.progression?.preserveExistingData, true),
        lifetimeSpendLevelTrackingEnabled: bool(d.progression?.lifetimeSpendLevelTracking, levelsEnabled && talentsEnabled),
        advancement: text(d.progression?.advancement, !legacyCurrent(d.progression) && !levelsEnabled ? "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1" : "PROFILE_DEFINED"),
        ratingZeroOnePassNeeded: numeric(d.progression?.ratingZeroOnePassNeeded, 1),
        clearSlateOnAdvance: bool(d.progression?.clearSlateOnAdvance, !legacyCurrent(d.progression)),
        oneTestPerAbilityOrSkillPerConflictScene: bool(d.progression?.oneTestPerAbilityOrSkillPerConflictScene, !legacyCurrent(d.progression)),
        beginnerLearningOpensAt: numeric(d.progression?.beginnerLearningOpensAt, 2),
        beginnerLearningAttemptsUseMaximumNature: bool(d.progression?.beginnerLearningAttemptsUseMaximumNature, !legacyCurrent(d.progression)),
        beginnerLuckAdvancesWillHealth: bool(d.progression?.beginnerLuckAdvancesWillHealth, legacyCurrent(d.progression))
      },
      tokensOfPower: {
        enabled: tokensOfPowerEnabled
      },
      naturalOrder: {
        enabled: d.naturalOrder?.enabled === true,
        mode: text(d.naturalOrder?.mode, "NONE")
      },
      scaleOfMight: {
        enabled: scaleOfMightEnabled,
        mode: text(d.scaleOfMight?.mode, scaleOfMightEnabled ? "PROFILE_DEFINED" : "NONE")
      },
      creation: {
        mode: text(d.creation?.mode, "PROFILE_DEFINED"),
        profileId: text(d.creation?.profileId),
        profileVersion: numeric(d.creation?.profileVersion, 0),
        liveAuthority: text(d.creation?.liveAuthority, "NONE")
      }
    },
    presentation: {
      showRatedWiseControls: ratedWises,
      showLevels: levelsEnabled,
      showTalents: talentsEnabled,
      showTokensOfPower: tokensOfPowerEnabled,
      showNaturalOrder: d.naturalOrder?.enabled === true,
      showScaleOfMight: scaleOfMightEnabled,
      conditionSetExplicit,
      visibleConditionNames: conditionNames,
      inventoryPlacementAffectsRules: placementAuthority
    },
    dataPolicy: {
      preserveInactiveData: true,
      preserveConditionItemsOutsideActiveProfile: true,
      preserveProgressionDataWhenHidden: true,
      preserveInventoryPlacementMetadata: true,
      destructiveProfileConversion: false,
      deleteOnProfileSwitch: false
    }
  };

  return deepFreeze(capabilities);
}
