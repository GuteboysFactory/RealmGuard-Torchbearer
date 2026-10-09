import assert from "node:assert/strict";
import fs from "node:fs";
import {
  TB2E_AUTHORITY_MODES,TB2E_WRITE_OPERATIONS,
  tb2eAuthorityDomain,tb2eAuthorityRegistry,tb2eAuthorityTransitionPlan,
  tb2eClearDualRunComparisonLog,tb2eDualRunComparisonLog,
  tb2eEngageGlobalKillSwitch,tb2eLiveAuthorityFrameworkStatus,
  tb2eRecordDualRunComparison,tb2eReleaseGlobalKillSwitch,
  tb2eWritePermissionPlan,installM11LiveAuthorityFramework
} from "../module/m11-tb2e-live-authority.mjs";

assert.deepEqual(TB2E_AUTHORITY_MODES,["OFF","SHADOW","DUAL_RUN","LIVE"]);
assert.ok(TB2E_WRITE_OPERATIONS.includes("ACTOR_UPDATE"));
assert.ok(TB2E_WRITE_OPERATIONS.includes("SETTING_WRITE"));

const status=tb2eLiveAuthorityFrameworkStatus();
assert.equal(status.phase,"M11.1");assert.equal(status.frameworkReady,true);
assert.equal(status.foundationAuditComplete,true);assert.equal(status.coreSourceExpansionAuditComplete,true);assert.equal(status.coreSourceComplete,true);
assert.equal(status.registryCount,19);assert.deepEqual(status.modeCounts,{OFF:5,SHADOW:14,DUAL_RUN:0,LIVE:0});
assert.equal(status.globalKillSwitchEngaged,true);assert.equal(status.killSwitchReleaseAuthorized,false);
assert.equal(status.liveActivationAuthorized,false);assert.equal(status.profileSwitchAuthorized,false);assert.equal(status.domainLiveWritesAuthorized,0);
assert.equal(status.liveIntegrationPaused,true);assert.equal(status.pauseReason,"FULL_CORE_SOURCE_REAUDIT_REQUIRED");
assert.deepEqual(status.sourceBlockedDomains,[]);
assert.deepEqual(status.sourceVerifiedPendingAdapterDomains,["traits","armor","conflict","magic"]);
assert.equal(status.reconciliationRequiredDomains.length,14);
assert.equal(status.nextLiveDomain,null);assert.equal(status.nextMilestone,"M10D.18_CORE_RECONCILIATION");
assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const registry=tb2eAuthorityRegistry();assert.equal(registry.length,19);
const wises=tb2eAuthorityDomain("wises");
assert.equal(wises.finalClassification,"VERIFIED");assert.equal(wises.sourceVerified,true);assert.equal(wises.currentMode,"SHADOW");assert.equal(wises.modeCeiling,"SHADOW");assert.equal(wises.adapterReady,true);assert.equal(wises.reconciliationRequired,true);assert.equal(wises.liveCandidate,false);assert.equal(wises.plannedWave,1);
assert.equal(Object.values(wises.writePermissions).some(Boolean),false);
const traits=tb2eAuthorityDomain("traits");
assert.equal(traits.finalClassification,"VERIFIED");assert.equal(traits.sourceBlocked,false);assert.equal(traits.currentMode,"OFF");assert.equal(traits.modeCeiling,"SHADOW");assert.equal(traits.adapterReady,false);assert.equal(traits.shadowAdapterRequired,true);
const narrative=tb2eAuthorityDomain("narrative");assert.equal(narrative.currentMode,"OFF");assert.equal(narrative.modeCeiling,"OFF");assert.equal(narrative.manualOnly,true);

const keepShadow=tb2eAuthorityTransitionPlan({domainId:"wises",targetMode:"SHADOW"});
assert.equal(keepShadow.ok,true);assert.equal(keepShadow.previewAllowed,true);assert.equal(keepShadow.commitAuthorized,false);
assert.equal(tb2eAuthorityTransitionPlan({domainId:"wises",targetMode:"DUAL_RUN"}).reasonCode,"FULL_CORE_REAUDIT_REQUIRED");
assert.equal(tb2eAuthorityTransitionPlan({domainId:"wises",targetMode:"LIVE"}).reasonCode,"FULL_CORE_REAUDIT_REQUIRED");
assert.equal(tb2eAuthorityTransitionPlan({domainId:"traits",targetMode:"SHADOW"}).reasonCode,"SHADOW_ADAPTER_REQUIRED");
assert.equal(tb2eAuthorityTransitionPlan({domainId:"narrative",targetMode:"SHADOW"}).reasonCode,"MANUAL_DOMAIN_MUST_REMAIN_OFF");

const permission=tb2eWritePermissionPlan({domainId:"wises",operation:"ACTOR_UPDATE"});
assert.equal(permission.allowed,false);assert.equal(permission.contractAllows,false);assert.equal(permission.reasonCode,"GLOBAL_KILL_SWITCH_ENGAGED");
assert.equal(tb2eEngageGlobalKillSwitch().globalKillSwitchEngaged,true);
assert.equal(tb2eReleaseGlobalKillSwitch().reasonCode,"KILL_SWITCH_RELEASE_NOT_AUTHORIZED_M11_1");

tb2eClearDualRunComparisonLog();
const match=tb2eRecordDualRunComparison({domainId:"wises",label:"source-reconciliation",legacyResult:{b:2,a:1},tb2eResult:{a:1,b:2}});
assert.equal(match.parity,"MATCH");assert.equal(match.simulatedDualRun,true);assert.equal(match.reconciliationRequired,true);assert.equal(match.persisted,false);
assert.equal(tb2eRecordDualRunComparison({domainId:"traits",legacyResult:1,tb2eResult:1}).reasonCode,"SHADOW_ADAPTER_REQUIRED");
assert.equal(tb2eRecordDualRunComparison({domainId:"narrative",legacyResult:1,tb2eResult:1}).reasonCode,"MANUAL_DOMAIN_DUAL_RUN_FORBIDDEN");
assert.equal(tb2eDualRunComparisonLog().length,1);assert.equal(tb2eClearDualRunComparisonLog().removed,1);

let installed=false;globalThis.game={realmGuard:{core:{m10d:{sentinel:"keep"}}}};
globalThis.Hooks={once:(event,fn)=>{assert.equal(event,"ready");fn();installed=true;}};
installM11LiveAuthorityFramework();assert.equal(installed,true);assert.equal(game.realmGuard.core.m10d.sentinel,"keep");assert.equal(game.realmGuard.core.m11.getStatus().liveIntegrationPaused,true);

const source=fs.readFileSync("module/m11-tb2e-live-authority.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])assert.equal(source.includes(forbidden),false,forbidden);
console.log("PASS M11.1 safety pause after full-core source expansion · 14 SHADOW reconciliation-required · 4 VERIFIED-source adapters pending · 0 source-blocked · hard kill switch · zero writes");
