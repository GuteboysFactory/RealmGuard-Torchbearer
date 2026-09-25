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
    phase: "M10B.1",
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
        afraidBlocksHelp: bool(d.help?.afraidBlocksHelp, legacyHelp)
      },
      conditions: {
        mode: text(d.conditions?.mode, conditionSetExplicit ? "PROFILE_SET" : "LEGACY_CURRENT"),
        explicitSet: conditionSetExplicit,
        names: conditionNames
      },
      inventory: {
        policy: inventoryPolicy,
        placementAuthority,
        placementPresentationOnly: !placementAuthority
      },
      conflict: {
        mode: text(d.conflict?.mode, "PROFILE_DEFINED"),
        unarmedDefaultDice: numeric(d.conflict?.unarmedDefaultDice, legacyConflict ? -1 : 0),
        toolScope: text(d.conflict?.toolScope, "PROFILE_DEFINED")
      },
      progression: {
        levelsEnabled,
        talentsEnabled
      },
      tokensOfPower: {
        enabled: tokensOfPowerEnabled
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
