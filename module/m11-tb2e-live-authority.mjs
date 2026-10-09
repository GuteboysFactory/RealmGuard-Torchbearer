import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
import { tb2eCoreSourceExpansionAudit } from "./m10d-tb2e-core-source-expansion.mjs";

export const TB2E_AUTHORITY_MODES=freezeTb2e(["OFF","SHADOW","DUAL_RUN","LIVE"]);
export const TB2E_WRITE_OPERATIONS=freezeTb2e([
  "ACTOR_UPDATE","ITEM_UPDATE","JOURNAL_WRITE","SETTING_WRITE",
  "DOCUMENT_CREATE","DOCUMENT_DELETE","CHAT_CREATE","SOCKET_BROADCAST"
]);

const READY_DOMAINS=freezeTb2e(["wises","help","tests","nature","abilities","resources","conditions","recovery","inventory","advancement","session","circles","scales","creation"]);
const WAVE_BY_DOMAIN=freezeTb2e({
  wises:1,help:2,tests:2,nature:3,abilities:3,resources:4,conditions:4,
  recovery:5,advancement:5,inventory:6,session:6,circles:7,scales:7,creation:8
});
const runtimeState={killSwitchEngaged:true,comparisons:[],comparisonSequence:0};
const MAX_COMPARISON_LOG=50;

function key(value){return String(value??"").trim().toLowerCase();}
function upper(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function blankPermissions(){return Object.freeze(Object.fromEntries(TB2E_WRITE_OPERATIONS.map(op=>[op,false])));}
function audit(){return tb2eCoreSourceExpansionAudit();}

function domainRows(){
  return audit().domains.map(d=>{
    const adapterReady=READY_DOMAINS.includes(d.id);
    const manualOnly=d.manualOnly===true;
    const shadowAdapterRequired=d.newShadowAdapterRequired===true;
    const reconciliationRequired=adapterReady;
    return freezeTb2e({
      id:d.id,domain:d.domain,
      finalClassification:d.status==="VERIFIED"?"VERIFIED":"MANUAL",
      sourceStatus:d.status,sourceVerified:d.sourceVerified,
      adapterReady,reconciliationRequired,shadowAdapterRequired,
      currentMode:adapterReady?"SHADOW":"OFF",
      modeCeiling:manualOnly?"OFF":"SHADOW",
      liveCandidate:false,sourceBlocked:false,manualOnly,
      plannedWave:WAVE_BY_DOMAIN[d.id]??null,
      explicitLiveGateRequired:d.status==="VERIFIED",
      writePermissions:blankPermissions(),authorizedWriteCount:0,
      killSwitchApplies:true,liveEnabled:false
    });
  });
}
function domainRow(domainId){const id=key(domainId);return domainRows().find(d=>d.id===id)??null;}
function blocked(reasonCode,extra={}){return freezeTb2e({...extra,ok:false,phase:"M11.1",profileId:"torchbearer2e",reasonCode,liveApplication:false,writesPlanned:0});}
function canonical(value,seen=new WeakSet()){
  if(value===null||typeof value!=="object")return value;
  if(seen.has(value))throw new Error("CYCLIC_VALUE");
  seen.add(value);
  if(Array.isArray(value)){const out=value.map(v=>canonical(v,seen));seen.delete(value);return out;}
  const out={};for(const k of Object.keys(value).sort())out[k]=canonical(value[k],seen);seen.delete(value);return out;
}
function fingerprint(value){try{return JSON.stringify(canonical(value));}catch(_error){return null;}}

export function tb2eLiveAuthorityFrameworkStatus(){
  const rows=domainRows(),core=audit();
  const counts=Object.fromEntries(TB2E_AUTHORITY_MODES.map(mode=>[mode,rows.filter(r=>r.currentMode===mode).length]));
  return freezeTb2e({
    phase:"M11.1",mode:"TB2E_LIVE_AUTHORITY_FRAMEWORK",profileId:"torchbearer2e",
    frameworkReady:true,foundationAuditComplete:true,coreSourceExpansionAuditComplete:core.auditComplete,
    coreSourceComplete:core.coreSourceComplete,
    authorityModes:TB2E_AUTHORITY_MODES,registryCount:rows.length,modeCounts:counts,
    shadowDomainCount:counts.SHADOW,offDomainCount:counts.OFF,dualRunDomainCount:counts.DUAL_RUN,liveDomainCount:counts.LIVE,
    globalKillSwitchEngaged:runtimeState.killSwitchEngaged,killSwitchReleaseAuthorized:false,
    liveActivationAuthorized:false,profileSwitchAuthorized:false,persistentAuthorityMutationAuthorized:false,
    worldSettingAuthorityWritesAuthorized:false,domainLiveWritesAuthorized:0,
    liveIntegrationPaused:true,pauseReason:"FULL_CORE_SOURCE_REAUDIT_REQUIRED",
    sourceBlockedDomains:[],sourceVerifiedPendingAdapterDomains:core.newShadowAdapterDomains,
    reconciliationRequiredDomains:core.existingShadowReauditDomains,manualDomains:core.manualDomains,
    comparisonLogPersistence:"MEMORY_ONLY",comparisonLogSize:runtimeState.comparisons.length,
    nextLiveDomain:null,nextMilestone:"M10D.18_CORE_RECONCILIATION",
    writes:{actors:0,items:0,journals:0,settings:0},liveApplication:false,writesPlanned:0
  });
}
export function tb2eAuthorityRegistry(){return freezeTb2e(domainRows());}
export function tb2eAuthorityDomain(domainId){return domainRow(domainId);}

export function tb2eAuthorityTransitionPlan({domainId,targetMode}={}){
  const d=domainRow(domainId);
  if(!d)return blocked("UNKNOWN_TB2E_DOMAIN",{domainId:key(domainId)});
  const target=upper(targetMode);
  if(!TB2E_AUTHORITY_MODES.includes(target))return blocked("UNKNOWN_AUTHORITY_MODE",{domainId:d.id,targetMode:target});
  if(d.manualOnly&&target!=="OFF")return blocked("MANUAL_DOMAIN_MUST_REMAIN_OFF",{domainId:d.id,currentMode:d.currentMode,targetMode:target});
  if(d.shadowAdapterRequired&&target!=="OFF")return blocked("SHADOW_ADAPTER_REQUIRED",{domainId:d.id,currentMode:d.currentMode,targetMode:target,nextRequiredMilestone:"M10D.18"});
  if(d.reconciliationRequired&&["DUAL_RUN","LIVE"].includes(target))return blocked("FULL_CORE_REAUDIT_REQUIRED",{domainId:d.id,currentMode:d.currentMode,targetMode:target,nextRequiredMilestone:"M10D.18"});
  if(["DUAL_RUN","LIVE"].includes(target))return blocked("LIVE_INTEGRATION_PAUSED_FULL_CORE_REAUDIT_REQUIRED",{domainId:d.id,currentMode:d.currentMode,targetMode:target,nextRequiredMilestone:"M10D.18"});
  const previewAllowed=target==="OFF"||target==="SHADOW";
  return freezeTb2e({
    ok:previewAllowed,phase:"M11.1",profileId:"torchbearer2e",mode:"AUTHORITY_TRANSITION_PREVIEW",
    domainId:d.id,currentMode:d.currentMode,targetMode:target,modeCeiling:d.modeCeiling,previewAllowed,
    commitAuthorized:false,persistentMutationAuthorized:false,writeAuthorizationGranted:false,
    globalKillSwitchEngaged:runtimeState.killSwitchEngaged,liveApplication:false,writesPlanned:0
  });
}
export function tb2eWritePermissionPlan({domainId,operation}={}){
  const d=domainRow(domainId);if(!d)return blocked("UNKNOWN_TB2E_DOMAIN",{domainId:key(domainId)});
  const op=upper(operation);if(!TB2E_WRITE_OPERATIONS.includes(op))return blocked("UNKNOWN_WRITE_OPERATION",{domainId:d.id,operation:op});
  const contractAllows=d.writePermissions[op]===true;
  const allowed=contractAllows&&!runtimeState.killSwitchEngaged&&d.currentMode==="LIVE";
  let reasonCode=null;
  if(runtimeState.killSwitchEngaged)reasonCode="GLOBAL_KILL_SWITCH_ENGAGED";
  else if(d.currentMode!=="LIVE")reasonCode="DOMAIN_NOT_LIVE";
  else if(!contractAllows)reasonCode="WRITE_OPERATION_NOT_AUTHORIZED";
  return freezeTb2e({ok:true,phase:"M11.1",profileId:"torchbearer2e",mode:"WRITE_PERMISSION_PLAN",domainId:d.id,operation:op,currentMode:d.currentMode,contractAllows,globalKillSwitchEngaged:runtimeState.killSwitchEngaged,allowed,reasonCode,writeCommitted:false,liveApplication:false,writesPlanned:0});
}
export function tb2eEngageGlobalKillSwitch(){runtimeState.killSwitchEngaged=true;return freezeTb2e({ok:true,phase:"M11.1",profileId:"torchbearer2e",globalKillSwitchEngaged:true,changed:false,reasonCode:"KILL_SWITCH_HARD_ENGAGED_M11_1",persistentWrite:false,writesPlanned:0});}
export function tb2eReleaseGlobalKillSwitch(){return blocked("KILL_SWITCH_RELEASE_NOT_AUTHORIZED_M11_1",{globalKillSwitchEngaged:runtimeState.killSwitchEngaged,releaseAuthorized:false});}
export function tb2eRecordDualRunComparison({domainId,label="",legacyResult,tb2eResult}={}){
  const d=domainRow(domainId);if(!d)return blocked("UNKNOWN_TB2E_DOMAIN",{domainId:key(domainId)});
  if(d.manualOnly)return blocked("MANUAL_DOMAIN_DUAL_RUN_FORBIDDEN",{domainId:d.id});
  if(d.shadowAdapterRequired)return blocked("SHADOW_ADAPTER_REQUIRED",{domainId:d.id,nextRequiredMilestone:"M10D.18"});
  const legacyFingerprint=fingerprint(legacyResult),tb2eFingerprint=fingerprint(tb2eResult);
  if(legacyFingerprint===null||tb2eFingerprint===null)return blocked("DUAL_RUN_RESULT_NOT_SERIALIZABLE",{domainId:d.id});
  const parity=legacyFingerprint===tb2eFingerprint?"MATCH":"DIVERGENCE";
  const record=freezeTb2e({sequence:++runtimeState.comparisonSequence,phase:"M11.1",domainId:d.id,label:String(label??""),currentMode:d.currentMode,simulatedDualRun:true,reconciliationRequired:true,parity,legacyFingerprint,tb2eFingerprint,persisted:false,documentWrites:0,settingWrites:0});
  runtimeState.comparisons.push(record);
  if(runtimeState.comparisons.length>MAX_COMPARISON_LOG)runtimeState.comparisons.splice(0,runtimeState.comparisons.length-MAX_COMPARISON_LOG);
  return record;
}
export function tb2eDualRunComparisonLog(){return freezeTb2e(runtimeState.comparisons.map(r=>({...r})));}
export function tb2eClearDualRunComparisonLog(){const removed=runtimeState.comparisons.length;runtimeState.comparisons.length=0;return freezeTb2e({ok:true,phase:"M11.1",removed,persisted:false,documentWrites:0,settingWrites:0,writesPlanned:0});}
export function installM11LiveAuthorityFramework(){
  Hooks.once("ready",()=>{
    game.realmGuard??={};game.realmGuard.core??={};
    game.realmGuard.core.m11=Object.freeze({
      getStatus:tb2eLiveAuthorityFrameworkStatus,registry:tb2eAuthorityRegistry,domain:tb2eAuthorityDomain,
      transitionPlan:tb2eAuthorityTransitionPlan,writePermissionPlan:tb2eWritePermissionPlan,
      engageKillSwitch:tb2eEngageGlobalKillSwitch,releaseKillSwitch:tb2eReleaseGlobalKillSwitch,
      recordComparison:tb2eRecordDualRunComparison,comparisonLog:tb2eDualRunComparisonLog,clearComparisonLog:tb2eClearDualRunComparisonLog
    });
  });
}
