import { RulesProfile } from "../core/rules-profile.mjs";

const STRICT_SOURCE = "Realm Guard v1.6 + Mouse Guard Roleplaying Game (2008 / 1E)";

export const REALM_GUARD_STRICT_PROFILE = new RulesProfile({
  id: "realm-guard-strict",
  version: 1,
  name: "Realm Guard — Strict",
  parent: "mg1e",
  classification: "STRICT PROFILE FOUNDATION / NOT SELECTABLE",
  domains: {
    profile: { activationState: "FOUNDATION_ONLY" }
  },
  registry: [
    {
      id: "PROFILE.IDENTITY",
      domain: "profile",
      title: "Rules Profile",
      activeValue: "REALM GUARD — STRICT FOUNDATION",
      classification: "STRICT PROFILE FOUNDATION / NOT LIVE",
      automation: "INACTIVE",
      source: STRICT_SOURCE,
      sourceVersion: "RG 1.6 / MG 2008",
      overrideReason: "M10A.0 registers inheritance and source ownership only. Strict gameplay remains gated until conversion preview and domain policies are verified."
    }
  ],
  metadata: {
    strictRealmGuard: true,
    foundationOnly: true,
    selectable: false,
    supported: false,
    activationState: "FOUNDATION_ONLY",
    sourceLineage: ["Mouse Guard RPG 2008 / 1E", "Realm Guard v1.6 overrides"],
    gameplayChangeIntended: false,
    liveRuleAuthority: false,
    conversionRequired: true,
    nextStep: "M10A.1 Strict Registry + Conversion Preview"
  }
});
