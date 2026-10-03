import { freezeTb2e, tb2eSourceCoverageMatrix } from "./m10d-tb2e-source-coverage.mjs";
import { TORCHBEARER2E_CREATION_PROFILE } from "./profiles/torchbearer2e-creation.mjs";
import { TORCHBEARER2E_FOUNDATION_PROFILE } from "./profiles/torchbearer2e-foundation.mjs";
import { resolveRulesProfile, getRulesProfileRuntime } from "./rules-profile-service.mjs";
import { profileActivationAvailable } from "./m10-profile-activation.mjs";
import { buildTorchbearer2eConversionPreview, openTorchbearer2eConversionPreview } from "./m10-profile-conversion-preview.mjs";

export function tb2eFoundationStatus() {
  const matrix=tb2eSourceCoverageMatrix();
  return freezeTb2e({phase:"M10D.1",profileId:"torchbearer2e",profileVersion:1,creationProfileVersion:1,
    mode:"READ_ONLY",activationState:"FOUNDATION_ONLY",foundationReady:true,liveReady:false,
    activationAllowed:false,activationAvailable:profileActivationAvailable("torchbearer2e"),
    profileSwitch:false,liveParityVerified:false,creationCommitAllowed:false,sourceComplete:false,
    domainCount:matrix.length,coverageCounts:Object.fromEntries(["VERIFIED","PARTIAL","MANUAL","SOURCE_INCOMPLETE"].map(status=>[status,matrix.filter(row=>row.status===status).length])),
    sourceAuthority:TORCHBEARER2E_FOUNDATION_PROFILE.metadata.sourceAuthority,
    sourceCoverageMatrix:matrix,writes:{actors:0,items:0,journals:0,settings:0},destructiveConversion:false,
    nextStep:"Source review only; no later M10D domains are enabled live"});
}

export function tb2eReadinessAudit() {
  return freezeTb2e({...tb2eFoundationStatus(),decision:"FOUNDATION_ONLY_NOT_READY_FOR_LIVE",
    blockers:["INCOMPLETE_GUIDE_SOURCES","UNRESOLVED_SOURCE_AMBIGUITIES","NO_LIVE_ADAPTERS_AUTHORIZED","NO_EXPLICIT_ACTIVATION_MILESTONE"],
    missingDomains:tb2eSourceCoverageMatrix().filter(row=>row.status!=="VERIFIED").map(row=>({id:row.id,status:row.status,gaps:row.gaps}))});
}

export function previewTorchbearer2eConversion({actors=[],worldItems=[]}={}) {
  return buildTorchbearer2eConversionPreview({fromProfile:getRulesProfileRuntime().profile,
    toProfile:resolveRulesProfile("torchbearer2e").profile,actors,worldItems});
}
export function showTorchbearer2eConversionPreview() {
  return openTorchbearer2eConversionPreview({fromState:getRulesProfileRuntime(),toState:resolveRulesProfile("torchbearer2e")});
}
export function installM10DFoundation() {
  Hooks.once("ready",()=>{
    game.realmGuard??={};game.realmGuard.core??={};
    game.realmGuard.core.m10d=Object.freeze({getStatus:tb2eFoundationStatus,readinessAudit:tb2eReadinessAudit,
      sourceCoverageMatrix:tb2eSourceCoverageMatrix,getRulesProfile:()=>resolveRulesProfile("torchbearer2e").profile,
      getCreationProfile:()=>TORCHBEARER2E_CREATION_PROFILE,
      previewConversion:previewTorchbearer2eConversion,showConversionPreview:showTorchbearer2eConversionPreview});
  });
}
