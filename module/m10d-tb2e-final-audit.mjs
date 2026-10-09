import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const VERIFIED_IDS=freezeTb2e(["wises"]);
const BOUNDED_PARTIAL_IDS=freezeTb2e(["tests","abilities","nature","help","resources","conditions","recovery","inventory","advancement","session","circles","creation","scales"]);
const SOURCE_BLOCKED_IDS=freezeTb2e(["traits","armor","conflict","magic"]);
const MANUAL_IDS=freezeTb2e(["narrative"]);
const ADAPTER_REQUIRED_IDS=freezeTb2e([...VERIFIED_IDS,...BOUNDED_PARTIAL_IDS]);

function finalClass(row){
  if(row.status==="VERIFIED")return "VERIFIED";
  if(row.status==="PARTIAL")return "BOUNDED_PARTIAL";
  if(row.status==="SOURCE_INCOMPLETE")return "SOURCE_BLOCKED";
  if(row.status==="MANUAL")return "MANUAL";
  return "UNKNOWN";
}

export function tb2eFinalFoundationAudit({shadowReadyDomains=[]}={}){
  const ready=new Set(Array.isArray(shadowReadyDomains)?shadowReadyDomains:[]);
  const domains=TB2E_SOURCE_COVERAGE_MATRIX.map(row=>{
    const classification=finalClass(row);
    const adapterRequired=ADAPTER_REQUIRED_IDS.includes(row.id);
    const adapterReady=adapterRequired?ready.has(row.id):false;
    return freezeTb2e({
      id:row.id,domain:row.domain,
      sourceStatus:row.status,finalClassification:classification,
      evidence:row.evidence,verifiedScope:row.verifiedScope,gaps:row.gaps,
      adapterRequired,adapterReady,
      liveEnabled:false,
      liveCandidate:classification==="VERIFIED"||classification==="BOUNDED_PARTIAL",
      sourceBlocked:classification==="SOURCE_BLOCKED",
      manualOnly:classification==="MANUAL"
    });
  });
  const counts=Object.fromEntries(["VERIFIED","BOUNDED_PARTIAL","SOURCE_BLOCKED","MANUAL"].map(c=>[c,domains.filter(d=>d.finalClassification===c).length]));
  const adapterGapDomains=domains.filter(d=>d.adapterRequired&&!d.adapterReady).map(d=>d.id);
  const unexpectedReadyDomains=[...ready].filter(id=>!ADAPTER_REQUIRED_IDS.includes(id));
  const mappingIntegrity=
    JSON.stringify(domains.filter(d=>d.finalClassification==="VERIFIED").map(d=>d.id))===JSON.stringify(VERIFIED_IDS)&&
    JSON.stringify(domains.filter(d=>d.finalClassification==="BOUNDED_PARTIAL").map(d=>d.id))===JSON.stringify(BOUNDED_PARTIAL_IDS)&&
    JSON.stringify(domains.filter(d=>d.finalClassification==="SOURCE_BLOCKED").map(d=>d.id))===JSON.stringify(SOURCE_BLOCKED_IDS)&&
    JSON.stringify(domains.filter(d=>d.finalClassification==="MANUAL").map(d=>d.id))===JSON.stringify(MANUAL_IDS);
  const auditComplete=domains.length===19&&adapterGapDomains.length===0&&mappingIntegrity;
  return freezeTb2e({
    phase:"M10D.16",mode:"TB2E_FINAL_FOUNDATION_AUDIT",profileId:"torchbearer2e",
    auditComplete,domainCount:domains.length,counts,domains,
    verifiedDomains:VERIFIED_IDS,boundedPartialDomains:BOUNDED_PARTIAL_IDS,
    sourceBlockedDomains:SOURCE_BLOCKED_IDS,manualDomains:MANUAL_IDS,
    adapterRequiredDomains:ADAPTER_REQUIRED_IDS,adapterGapDomains,unexpectedReadyDomains,mappingIntegrity,
    decision:auditComplete?"FOUNDATION_COMPLETE_LIVE_INTEGRATION_PLANNING_ALLOWED_ACTIVATION_STILL_BLOCKED":"FOUNDATION_AUDIT_INCOMPLETE",
    liveActivationAuthorized:false,profileSwitchAuthorized:false,creationCommitAuthorized:false,
    sourceBlockedPolicy:"KEEP_DISABLED_UNTIL_AUTHORITATIVE_SOURCE_COVERAGE_EXISTS",
    manualPolicy:"KEEP_GM_MANUAL_DO_NOT_AUTOMATE_BY_DEFAULT",
    liveCandidatePolicy:"ONLY_VERIFIED_OR_BOUNDED_PARTIAL_DOMAINS_MAY_ENTER_FUTURE_EXPLICIT_LIVE_GATES",
    nextPhase:"CONTROLLED_TB2E_LIVE_INTEGRATION_PLANNING",
    writes:{actors:0,items:0,journals:0,settings:0},
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eFinalDomainAudit(domainId,{shadowReadyDomains=[]}={}){
  const audit=tb2eFinalFoundationAudit({shadowReadyDomains});
  return audit.domains.find(d=>d.id===domainId)??null;
}
