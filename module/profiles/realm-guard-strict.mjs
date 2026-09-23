import { RulesProfile } from "../core/rules-profile.mjs";

const RG_SOURCE = "Realm Guard v1.6";
const STRICT_SOURCE = "Mouse Guard Roleplaying Game (2008 / 1E) + Realm Guard v1.6 overrides";

export const REALM_GUARD_STRICT_PROFILE = new RulesProfile({
  id: "realm-guard-strict",
  version: 3,
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
      strained: { recoveryAbility: "Will", obstacle: 4, failedRecovery: "COUNSEL_FROM_FRIEND", gmTurnCounselCheckCost: 2, penaltyExclusions: ["Resources", "Circles", "Will Recovery", "Health Recovery"] }
    },
    conflict: { mode: "MG1E_WITH_REALM_GUARD_CONTENT", toolContent: "REALM_GUARD_V1_6", toolScope: "EXCHANGE", unarmedDefaultDice: 0, scaleOfMightAware: true },
    creation: { mode: "REALM_GUARD_STRICT_PROFILE", coreEngine: "M9", liveAuthority: "NONE", profileId: "realm-guard-strict", profileVersion: 1, ratedWises: true, levelsTalents: false },
    tokensOfPower: { enabled: true, source: "REALM_GUARD_V1_6", levelSemantics: "MG1E_TRAIT_LEVELS" },
    scaleOfMight: { enabled: true, mode: "REALM_GUARD_V1_6", automation: "MANUAL_GUIDED", loreMasterRule: true, militaristRule: true }
  },
  registry: [
    { id: "PROFILE.IDENTITY", domain: "profile", title: "Rules Profile", activeValue: "REALM GUARD — STRICT · PREVIEW ONLY", classification: "STRICT PROFILE MANIFEST / NOT LIVE", automation: "INACTIVE", source: STRICT_SOURCE, sourceVersion: "MG 2008 / RG 1.6", overrideReason: "M10A.1 completes the Strict manifest and conversion preview. Live activation remains blocked." },
    { id: "NATURE.MODE", domain: "nature", title: "Nature Resolution", activeValue: "MG1E NATURE · DÚNADAN: TRADITION / FAMILY / GRIEF", classification: "REALM GUARD OVERRIDE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "Realm Guard supplies the Dúnadan Nature descriptors over the inherited MG1E Nature engine." },
    { id: "CONDITIONS.MODE", domain: "conditions", title: "Conditions", activeValue: "HEALTHY · HUNGRY/THIRSTY · ANGRY · TIRED · INJURED · STRAINED", classification: "REALM GUARD OVERRIDE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "Strained replaces Sick. Fresh and Afraid are not Strict Realm Guard default conditions." },
    { id: "RECOVERY.MODE", domain: "recovery", title: "Recovery", activeValue: "MG1E RECOVERY + REALM GUARD STRAINED RECOVERY", classification: "REALM GUARD OVERRIDE", automation: "GUIDED", source: RG_SOURCE, sourceVersion: "1.6" },
    { id: "CONFLICT.ENGINE", domain: "conflict", title: "Conflict Engine", activeValue: "MG1E CONFLICT + REALM GUARD TOOLS / SCALE OWNERSHIP", classification: "REALM GUARD OVERRIDE / MG1E INHERITANCE", automation: "GUIDED", source: STRICT_SOURCE, sourceVersion: "MG 2008 / RG 1.6", overrideReason: "The generic conflict engine is inherited; Realm Guard content and Scale interactions are profile-owned." },
    { id: "CREATION.RECRUITMENT", domain: "creation", title: "Character Creation", activeValue: "CORE M9 · STRICT REALM GUARD PROFILE · NOT LIVE YET", classification: "REALM GUARD OVERRIDE", automation: "INACTIVE", source: RG_SOURCE, sourceVersion: "1.6", overrideReason: "M10A.6 will bind the Strict creation profile; M10A.1 only declares ownership." },
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
    implementationPhase: "M10A.2",
    strictRulesLive: false,
    ratedWiseSchemaReady: true,
    traitPolicyReady: true,
    helpPolicyReady: true,
    nextStep: "M10A.3 Conditions / Recovery"
  }
});
