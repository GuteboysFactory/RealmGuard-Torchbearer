import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
import { TB2E_CONFIRMED_CORE_RECONCILIATION_FINDINGS, TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS, TB2E_NEW_SHADOW_ADAPTER_DOMAINS } from "./m10d-tb2e-core-source-expansion.mjs";

export const TB2E_M10D18_P1_RESOLVED_FINDINGS=freezeTb2e([
  "CREATION_HOME_MISSING_SKILL_2_NOT_3",
  "CREATION_SOCIAL_GRACE_MISSING_SKILL_2_NOT_3",
  "CREATION_SPECIALTY_MISSING_SKILL_2_NOT_3",
  "CONDITIONS_HUNGRY_EXHAUSTED_DISPOSITION_MINUS_1S",
  "HELP_ONLY_RECOVERY_AND_LEAVING_TOWN_BILLS_BLOCK_HELP",
  "NATURE_MAX_ZERO_RETIRE_AT_END_OF_ADVENTURE"
]);

export function tb2eCoreReconciliationStatus(){
  const all=TB2E_CONFIRMED_CORE_RECONCILIATION_FINDINGS.map(f=>f.id);
  const pending=all.filter(id=>!TB2E_M10D18_P1_RESOLVED_FINDINGS.includes(id));
  return freezeTb2e({
    phase:"M10D.18",
    package:"P1_CONFIRMED_MISMATCH_REPAIRS",
    profileId:"torchbearer2e",
    packageReady:true,
    resolvedFindingIds:TB2E_M10D18_P1_RESOLVED_FINDINGS,
    resolvedFindingCount:TB2E_M10D18_P1_RESOLVED_FINDINGS.length,
    pendingFindingIds:pending,
    pendingFindingCount:pending.length,
    fullDomainReauditStillRequired:true,
    existingShadowReauditDomains:TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS,
    existingShadowReauditDomainCount:TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS.length,
    newShadowAdapterDomains:TB2E_NEW_SHADOW_ADAPTER_DOMAINS,
    newShadowAdapterDomainCount:TB2E_NEW_SHADOW_ADAPTER_DOMAINS.length,
    liveIntegrationPaused:true,
    globalKillSwitchMustRemainEngaged:true,
    liveActivationAuthorized:false,
    profileSwitchAuthorized:false,
    creationCommitAuthorized:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    decision:"P1_REPAIRS_READY_FULL_CORE_DOMAIN_REAUDIT_STILL_REQUIRED",
    nextStep:"M10D.18_P2_FULL_CORE_SHADOW_REAUDIT",
    liveApplication:false,
    writesPlanned:0
  });
}
