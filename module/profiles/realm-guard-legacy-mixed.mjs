import { RulesProfile } from "../core/rules-profile.mjs";

const LEGACY_SOURCE = "Realm Guard / Torchbearer v1.2.0 GOLD published behavior";

export const REALM_GUARD_LEGACY_MIXED_PROFILE = new RulesProfile({
  id: "realm-guard-legacy-mixed",
  version: 1,
  name: "Realm Guard — Legacy Mixed",
  classification: "MIXED / COMPATIBILITY PROFILE",
  domains: {
    tests: { mode: "legacy-current" },
    abilities: { mode: "legacy-current" },
    nature: { mode: "legacy-current" },
    traits: { mode: "legacy-current" },
    wises: { ratingMode: "NONE" },
    help: { mode: "legacy-current" },
    resources: { fatePersona: "legacy-current" },
    conditions: { mode: "legacy-current" },
    recovery: { mode: "legacy-current" },
    inventory: { policy: "STRUCTURED" },
    conflict: { mode: "legacy-current" },
    session: { mode: "legacy-current" },
    circles: { mode: "legacy-current" },
    creation: { mode: "legacy-recruitment" },
    progression: { levels: true, talents: true },
    tokensOfPower: { enabled: true }
  },
  registry: [
    {
      id: "PROFILE.IDENTITY",
      domain: "profile",
      title: "Rules Profile",
      activeValue: "Realm Guard — Legacy Mixed",
      classification: "MIXED / COMPATIBILITY PROFILE",
      automation: "AUTOMATIC",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0",
      overrideReason: "Preserves existing published campaign behavior during the MG-family CORE migration."
    },
    {
      id: "TEST.RESOLUTION",
      domain: "tests",
      title: "Test Resolution",
      activeValue: "CURRENT PUBLISHED BEHAVIOR",
      classification: "LEGACY COMPATIBILITY",
      automation: "AUTOMATIC",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "WISE.MODE",
      domain: "wises",
      title: "Wise Rating Mode",
      activeValue: "UNRATED",
      classification: "MIXED / LEGACY PROJECT RULE",
      automation: "AUTOMATIC",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0",
      overrideReason: "Compatibility behavior only; Strict Realm Guard will later use rated Wises."
    },
    {
      id: "TRAIT.MODE",
      domain: "traits",
      title: "Trait Resolution",
      activeValue: "CURRENT PUBLISHED BEHAVIOR",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "NATURE.MODE",
      domain: "nature",
      title: "Nature Resolution",
      activeValue: "CURRENT REALM GUARD PROJECT BEHAVIOR",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "HELP.MODE",
      domain: "help",
      title: "Help / Teamwork",
      activeValue: "CURRENT PUBLISHED WORKFLOW",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "RESOURCES.FATE_PERSONA",
      domain: "resources",
      title: "Fate / Persona",
      activeValue: "CURRENT PUBLISHED BEHAVIOR",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "CONDITIONS.MODE",
      domain: "conditions",
      title: "Conditions / Recovery",
      activeValue: "CURRENT REALM GUARD PROJECT BEHAVIOR",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "INVENTORY.POLICY",
      domain: "inventory",
      title: "Inventory Policy",
      activeValue: "STRUCTURED",
      classification: "MIXED / FOUNDRY EXPANSION",
      automation: "AUTOMATIC",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0",
      overrideReason: "Preserves the current paper-doll, placement and container model."
    },
    {
      id: "CONFLICT.ENGINE",
      domain: "conflict",
      title: "Conflict Engine",
      activeValue: "CURRENT PUBLISHED ENGINE",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "SESSION.TURN_MANAGER",
      domain: "session",
      title: "Turn Manager / Checks",
      activeValue: "CURRENT PUBLISHED WORKFLOW",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "SESSION.END_SESSION",
      domain: "session",
      title: "End Session",
      activeValue: "CURRENT PUBLISHED WORKFLOW",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "CIRCLES.MODE",
      domain: "circles",
      title: "Circles",
      activeValue: "CURRENT PUBLISHED WORKFLOW",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "CREATION.RECRUITMENT",
      domain: "creation",
      title: "Character Creation",
      activeValue: "CREATE RANGER / CURRENT RECRUITMENT",
      classification: "LEGACY COMPATIBILITY",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    },
    {
      id: "PROGRESSION.LEVELS_TALENTS",
      domain: "progression",
      title: "Levels / Talents",
      activeValue: "ENABLED",
      classification: "MIXED / FOUNDRY EXPANSION",
      automation: "AUTOMATIC",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0",
      overrideReason: "Preserved for existing campaigns; not part of the future Strict Realm Guard profile."
    },
    {
      id: "TOKENS_OF_POWER.MODE",
      domain: "tokensOfPower",
      title: "Tokens of Power",
      activeValue: "ENABLED",
      classification: "REALM GUARD / PROJECT FEATURE",
      automation: "GUIDED",
      source: LEGACY_SOURCE,
      sourceVersion: "1.2.0"
    }
  ],
  metadata: {
    compatibilityProfile: true,
    strictRealmGuard: false,
    gameplayChangeIntended: false,
    migrationSource: "v1.2.0 GOLD"
  }
});
