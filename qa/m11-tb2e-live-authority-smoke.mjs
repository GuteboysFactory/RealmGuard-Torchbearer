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
assert.equal(status.phase,"M11.1");
assert.equal(status.mode,"TB2E_LIVE_AUTHORITY_FRAMEWORK");
assert.equal(status.frameworkReady,true);
assert.equal(status.foundationAuditComplete,true);
assert.equal(status.registryCount,19);
assert.deepEqual(status.modeCounts,{OFF:5,SHADOW:14,DUAL_RUN:0,LIVE:0});
assert.equal(status.globalKillSwitchEngaged,true);
assert.equal(status.killSwitchReleaseAuthorized,false);
assert.equal(status.liveActivationAuthorized,false);
assert.equal(status.profileSwitchAuthorized,false);
assert.equal(status.domainLiveWritesAuthorized,0);
assert.equal(status.nextLiveDomain,"wises");
assert.equal(status.nextMilestone,"M11.2_WISES_FIRST_LIVE_DOMAIN");
assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const registry=tb2eAuthorityRegistry();
assert.equal(registry.length,19);
const wises=tb2eAuthorityDomain("wises");
assert.equal(wises.finalClassification,"VERIFIED");
assert.equal(wises.currentMode,"SHADOW");
assert.equal(wises.modeCeiling,"DUAL_RUN");
assert.equal(wises.plannedWave,1);
assert.equal(wises.authorizedWriteCount,0);
assert.equal(Object.values(wises.writePermissions).some(Boolean),false);

const tests=tb2eAuthorityDomain("tests");
assert.equal(tests.currentMode,"SHADOW");assert.equal(tests.plannedWave,2);
const creation=tb2eAuthorityDomain("creation");
assert.equal(creation.currentMode,"SHADOW");assert.equal(creation.plannedWave,8);

const traits=tb2eAuthorityDomain("traits");
assert.equal(traits.currentMode,"OFF");assert.equal(traits.modeCeiling,"OFF");assert.equal(traits.sourceBlocked,true);
const narrative=tb2eAuthorityDomain("narrative");
assert.equal(narrative.currentMode,"OFF");assert.equal(narrative.manualOnly,true);

const dual=tb2eAuthorityTransitionPlan({domainId:"wises",targetMode:"DUAL_RUN"});
assert.equal(dual.ok,true);assert.equal(dual.previewAllowed,true);assert.equal(dual.commitAuthorized,false);assert.equal(dual.writeAuthorizationGranted,false);
const live=tb2eAuthorityTransitionPlan({domainId:"wises",targetMode:"LIVE"});
assert.equal(live.ok,false);assert.equal(live.reasonCode,"EXPLICIT_LIVE_DOMAIN_GATE_REQUIRED");assert.equal(live.nextRequiredMilestone,"M11.2");
assert.equal(tb2eAuthorityTransitionPlan({domainId:"traits",targetMode:"SHADOW"}).reasonCode,"SOURCE_BLOCKED_DOMAIN_MUST_REMAIN_OFF");
assert.equal(tb2eAuthorityTransitionPlan({domainId:"narrative",targetMode:"DUAL_RUN"}).reasonCode,"MANUAL_DOMAIN_MUST_REMAIN_OFF");

const permission=tb2eWritePermissionPlan({domainId:"wises",operation:"ACTOR_UPDATE"});
assert.equal(permission.allowed,false);assert.equal(permission.contractAllows,false);assert.equal(permission.reasonCode,"GLOBAL_KILL_SWITCH_ENGAGED");assert.equal(permission.writeCommitted,false);

assert.equal(tb2eEngageGlobalKillSwitch().globalKillSwitchEngaged,true);
const release=tb2eReleaseGlobalKillSwitch();
assert.equal(release.ok,false);assert.equal(release.reasonCode,"KILL_SWITCH_RELEASE_NOT_AUTHORIZED_M11_1");

tb2eClearDualRunComparisonLog();
const match=tb2eRecordDualRunComparison({domainId:"wises",label:"same",legacyResult:{b:2,a:1},tb2eResult:{a:1,b:2}});
assert.equal(match.parity,"MATCH");assert.equal(match.simulatedDualRun,true);assert.equal(match.persisted,false);
const diff=tb2eRecordDualRunComparison({domainId:"tests",label:"different",legacyResult:{successes:2},tb2eResult:{successes:3}});
assert.equal(diff.parity,"DIVERGENCE");assert.equal(diff.documentWrites,0);assert.equal(diff.settingWrites,0);
assert.equal(tb2eDualRunComparisonLog().length,2);
assert.equal(tb2eRecordDualRunComparison({domainId:"conflict",legacyResult:1,tb2eResult:1}).reasonCode,"SOURCE_BLOCKED_DOMAIN_DUAL_RUN_FORBIDDEN");
assert.equal(tb2eClearDualRunComparisonLog().removed,2);assert.equal(tb2eDualRunComparisonLog().length,0);

let installed=false;
globalThis.game={realmGuard:{core:{m10d:{sentinel:"keep"}}}};
globalThis.Hooks={once:(event,fn)=>{assert.equal(event,"ready");fn();installed=true;}};
installM11LiveAuthorityFramework();
assert.equal(installed,true);
assert.equal(game.realmGuard.core.m10d.sentinel,"keep");
assert.equal(game.realmGuard.core.m11.getStatus().phase,"M11.1");
assert.equal(game.realmGuard.core.m11.registry().length,19);
assert.equal(typeof game.realmGuard.core.m11.recordComparison,"function");
assert.equal(typeof game.realmGuard.core.m11.releaseKillSwitch,"function");

const source=fs.readFileSync("module/m11-tb2e-live-authority.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])assert.equal(source.includes(forbidden),false,forbidden);
console.log("PASS M11.1 TB2E Live Authority Framework · OFF/SHADOW/DUAL_RUN/LIVE registry · hard kill switch · zero write grants · memory-only comparison log · source-blocked/manual refusal · zero document/settings writes");
