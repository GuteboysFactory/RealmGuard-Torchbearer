import { RulesProfile } from "../core/rules-profile.mjs";

const MG1E_SOURCE = "Mouse Guard Roleplaying Game (2008 / 1E)";

export const MG1E_FOUNDATION_PROFILE = new RulesProfile({
  id: "mg1e",
  version: 1,
  name: "Mouse Guard 1E — Foundation",
  classification: "SOURCE FOUNDATION / NOT SELECTABLE",
  domains: {
    profile: { activationState: "FOUNDATION_ONLY" }
  },
  registry: [
    {
      id: "PROFILE.IDENTITY",
      domain: "profile",
      title: "Rules Profile",
      activeValue: "MOUSE GUARD 1E FOUNDATION",
      classification: "SOURCE FOUNDATION / NOT LIVE",
      automation: "INACTIVE",
      source: MG1E_SOURCE,
      sourceVersion: "2008",
      overrideReason: "Internal inheritance root for Strict Realm Guard. M10A.0 does not activate MG1E gameplay."
    }
  ],
  metadata: {
    foundationOnly: true,
    selectable: false,
    supported: false,
    activationState: "FOUNDATION_ONLY",
    sourceLineage: ["Mouse Guard RPG 2008 / 1E"],
    gameplayChangeIntended: false,
    liveRuleAuthority: false
  }
});
