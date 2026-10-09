import assert from "node:assert/strict";
import fs from "node:fs";
import {
  TB2E_CORE_SOURCE_SET,TB2E_CORE_SOURCE_COVERAGE_MATRIX,
  TB2E_CONFIRMED_CORE_RECONCILIATION_FINDINGS,
  TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS,TB2E_NEW_SHADOW_ADAPTER_DOMAINS,
  tb2eCoreDomainAudit,tb2eCoreSourceExpansionAudit
} from "../module/m10d-tb2e-core-source-expansion.mjs";

const audit=tb2eCoreSourceExpansionAudit();
assert.equal(audit.phase,"M10D.17");
assert.equal(audit.mode,"TB2E_FULL_CORE_SOURCE_EXPANSION_AUDIT");
assert.equal(audit.auditComplete,true);
assert.equal(audit.coreSourceComplete,true);
assert.equal(audit.domainCount,19);
assert.deepEqual(audit.sourceCounts,{VERIFIED:18,MANUAL:1,SOURCE_BLOCKED:0});
assert.equal(audit.sourceBlockedDomains.length,0);
assert.equal(audit.sourceVerifiedDomains.length,18);
assert.equal(audit.existingShadowReauditDomains.length,14);
assert.deepEqual(audit.newShadowAdapterDomains,["traits","armor","conflict","magic"]);
assert.deepEqual(audit.manualDomains,["narrative"]);
assert.equal(audit.liveIntegrationPauseRequired,true);
assert.equal(audit.liveActivationAuthorized,false);
assert.equal(audit.profileSwitchAuthorized,false);
assert.equal(audit.creationCommitAuthorized,false);
assert.equal(audit.decision,"CORE_SOURCE_COMPLETE_IMPLEMENTATION_RECONCILIATION_REQUIRED");
assert.equal(audit.nextMilestone,"M10D.18_CORE_RECONCILIATION");
assert.deepEqual(audit.writes,{actors:0,items:0,journals:0,settings:0});

assert.equal(TB2E_CORE_SOURCE_SET.filter(s=>s.tier==="CORE").length,2);
assert.equal(TB2E_CORE_SOURCE_SET.filter(s=>s.tier==="OPTIONAL_EXPANSION").length,2);
assert.equal(TB2E_CORE_SOURCE_COVERAGE_MATRIX.filter(d=>d.status==="VERIFIED").length,18);
assert.equal(TB2E_CORE_SOURCE_COVERAGE_MATRIX.filter(d=>d.status==="MANUAL").length,1);

for(const id of TB2E_EXISTING_SHADOW_REAUDIT_DOMAINS){
  const d=tb2eCoreDomainAudit(id);assert.ok(d,id);assert.equal(d.sourceVerified,true);assert.equal(d.adapterPresent,true);assert.equal(d.adapterReauditRequired,true);assert.equal(d.liveCandidate,false);
}
for(const id of TB2E_NEW_SHADOW_ADAPTER_DOMAINS){
  const d=tb2eCoreDomainAudit(id);assert.ok(d,id);assert.equal(d.sourceVerified,true);assert.equal(d.adapterPresent,false);assert.equal(d.newShadowAdapterRequired,true);assert.equal(d.sourceBlocked,false);
}
assert.equal(tb2eCoreDomainAudit("narrative").manualOnly,true);

const findingIds=TB2E_CONFIRMED_CORE_RECONCILIATION_FINDINGS.map(f=>f.id);
for(const id of [
  "CREATION_HOME_MISSING_SKILL_2_NOT_3",
  "CREATION_SOCIAL_GRACE_MISSING_SKILL_2_NOT_3",
  "CREATION_SPECIALTY_MISSING_SKILL_2_NOT_3",
  "CONDITIONS_HUNGRY_EXHAUSTED_DISPOSITION_MINUS_1S",
  "HELP_ONLY_RECOVERY_AND_LEAVING_TOWN_BILLS_BLOCK_HELP",
  "NATURE_MAX_ZERO_RETIRE_AT_END_OF_ADVENTURE"
])assert.ok(findingIds.includes(id),id);

const source=fs.readFileSync("module/m10d-tb2e-core-source-expansion.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])assert.equal(source.includes(forbidden),false,forbidden);
console.log("PASS M10D.17 TB2E full-core source expansion · 18 VERIFIED source domains · 0 SOURCE_BLOCKED · 1 MANUAL · 14 shadows require full-core re-audit · 4 new shadows required · M11 paused · zero writes");
