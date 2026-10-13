import {tb2ePackageAAuditDatasetEvidence} from "./m10d18-tb2e-package-a-saved-legacy-audit.mjs";
import {tb2ePackageAEvidenceReplayPlan} from "./m10d18-tb2e-package-a-prospective-trace.mjs";

/** Read-only replay of the explicitly persisted schema4 baseline/event set. */
export async function tb2ePackageAAuditLedgerReplay({journalId=null}={}){
 const dataset=await tb2ePackageAAuditDatasetEvidence({journalId});
 if(dataset.schemaVersion!==4||!dataset.eventLedger)return {...dataset,ledgerReplayAvailable:false};
 if(dataset.eventLedger.baseline===null&&!dataset.eventLedger.events.length)return {...dataset,ledgerReplayAvailable:true,ledgerReplayValid:false,replayProjection:null};
 const {baseline,events,previousEventIds,previousCreditKeys,previousSupplyTestIds}=dataset.eventLedger;
 const replay=tb2ePackageAEvidenceReplayPlan({baseline,events,previousEventIds,previousCreditKeys,previousSupplyTestIds});
 if(!replay.ok)return {...dataset,ok:false,reasonCode:"AUDIT_DATASET_LEDGER_"+replay.reasonCode,ledgerReplayAvailable:true,
  ledgerReplayValid:false,replayProjection:null};
 return {...dataset,ledgerReplayAvailable:true,ledgerReplayValid:true,replayProjection:replay};
}
