import { RulesProfile } from "../core/rules-profile.mjs";
import { TORCHBEARER2E_FOUNDATION_PROFILE as foundation } from "./torchbearer2e-foundation.mjs";

// The source-audit foundation remains unchanged. Only creation acquires live QA authority.
export const TB2E_WIZARD_QA_PROFILE = new RulesProfile({
  id:foundation.id, version:2, name:"Torchbearer 2E · Character Creation QA",
  classification:"QA ONLY / CHARACTER CREATION",
  domains:{
    ...foundation.domains,
    profile:{activationState:"QA_ACTIVE"},
    creation:{...foundation.domains.creation, mode:"TB2E_WIZARD_QA", profileVersion:1,
      coreEngine:"CORE_M9", liveAuthority:"CORE_M9_WHEN_ACTIVE", liveEnabled:true,
      commitAllowed:true, grantApplication:true, readyWhenActive:true,
      automation:"GUIDED_CREATION_ONLY", wiseMode:"UNRATED", ratedWises:false,
      startingSkillWiseCap:4, inventoryPolicy:"EXISTING_GEAR_ITEMS",
      conditionProvisioning:"TB2E_CREATION_DOCUMENTS", automaticNpcCreation:false,
      legacyCommitOverrideAllowed:false}
  },
  registry:foundation.registry.map(row=>row.domain==="creation"
    ? {...row,activeValue:"QA WIZARD / CORE M9",automation:"GUIDED",overrideReason:"M10D.11 user-authorized creation QA; other domains retain source-audit boundaries."}
    : row),
  metadata:{...foundation.metadata, foundationOnly:false, selectable:true, supported:true,
    liveRuleAuthority:true, activationState:"QA_ACTIVE", qaActivationOnly:true,
    explicitActivationAuthorized:true, creationCommitAllowed:true, creationWizardQa:true,
    implementationPhase:"M10D.11", mode:"CREATION_QA_ONLY", liveParityVerified:false,
    liveDomains:["creation"], nextStep:"Foundry six-class wizard playtest; gameplay domains remain read-only shadows."}
});
