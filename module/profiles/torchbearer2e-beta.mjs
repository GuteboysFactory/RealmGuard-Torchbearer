import { RulesProfile } from "../core/rules-profile.mjs";
import { TB2E_BETA_ID } from "./torchbearer2e-beta-creation.mjs";

// Independent live profile: the historical read-only foundation remains immutable.
export const TORCHBEARER2E_BETA_PROFILE = new RulesProfile({
  id: TB2E_BETA_ID, version: 1, name: "Torchbearer 2E - Playtest Beta", parent: null,
  classification: "QA PLAYTEST BETA",
  domains: {
    tests: { mode: "TB2E", beginnersLuck: true },
    abilities: { mode: "TB2E" },
    nature: { mode: "TB2E", tax: true, tapNature: true, doubleTapNature: true, tapExcludedAbilities: ["Resources", "Circles"] },
    wises: { ratingMode: "NONE", mode: "TB2E" },
    help: { mode: "TB2E", teamwork: true, iAmWise: true, synergy: false, helperConsequences: true, afraidBlocksHelp: true, sourcePolicy: "TB2E" },
    traits: { mode: "MANUAL" },
    conditions: { mode: "TB2E" },
    recovery: { mode: "TB2E" },
    inventory: { policy: "STRUCTURED", structuredPlacementAuthority: true },
    session: { mode: "TB2E", coreEngine: "M7", foundryCommitAuthority: "GM" },
    resources: { mode: "TB2E" },
    circles: { mode: "TB2E", automaticNpcCreation: false },
    conflict: { mode: "MANUAL", helpAllowed: false },
    creation: { profileId: TB2E_BETA_ID, profileVersion: 1, mode: "TB2E", coreEngine: "CORE_M9", liveAuthority: "CORE_M9_WHEN_ACTIVE", readyWhenActive: true, inventoryPolicy: "STRUCTURED", automaticNpcCreation: false, legacyCommitOverrideAllowed: false },
    progression: { mode: "TB2E", levels: true, talents: false, lifetimeSpendLevelTracking: false, advancement: "PASS_EQUALS_RATING_FAIL_EQUALS_RATING_MINUS_1", ratingZeroOnePassNeeded: 1, clearSlateOnAdvance: true, beginnerLearningAttemptsUseMaximumNature: true, beginnerLuckAdvancesWillHealth: false },
    tokensOfPower: { enabled: false }, scaleOfMight: { enabled: false }
  },
  registry: [{ id: "TB2E.BETA", domain: "profile", title: "TB2E Playtest Beta", activeValue: "QA playtest", classification: "BETA", automation: "GUIDED", source: "TB2E project guides and bounded M10D plans", overrideReason: "GM supplies obstacles and manual rulings. Conflict, magic, armor effects and traits are manual." }],
  metadata: { foundationOnly: false, selectable: true, supported: true, liveRuleAuthority: true, activationState: "QA_ACTIVE", qaActivationOnly: true, explicitActivationAuthorized: true, liveParityVerified: false, conversionPreviewAvailable: true, inheritedRuleProviders: [], implementationPhase: "M10D.10-M10D.12", stableApproved: false }
});
