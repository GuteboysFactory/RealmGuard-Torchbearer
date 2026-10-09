import assert from "node:assert/strict";
import fs from "node:fs";
import { TB2E_SOURCE_COVERAGE_MATRIX } from "../module/m10d-tb2e-source-coverage.mjs";
import { tb2eFinalDomainAudit, tb2eFinalFoundationAudit } from "../module/m10d-tb2e-final-audit.mjs";

const shadowReadyDomains=["wises","help","tests","nature","abilities","resources","conditions","recovery","inventory","advancement","session","circles","scales","creation"];
const audit=tb2eFinalFoundationAudit({shadowReadyDomains});

assert.equal(audit.phase,"M10D.16");
assert.equal(audit.mode,"TB2E_FINAL_FOUNDATION_AUDIT");
assert.equal(audit.auditComplete,true);
assert.equal(audit.domainCount,19);
assert.deepEqual(audit.counts,{VERIFIED:1,BOUNDED_PARTIAL:13,SOURCE_BLOCKED:4,MANUAL:1});
assert.deepEqual(audit.verifiedDomains,["wises"]);
assert.deepEqual(audit.boundedPartialDomains,["tests","abilities","nature","help","resources","conditions","recovery","inventory","advancement","session","circles","creation","scales"]);
assert.deepEqual(audit.sourceBlockedDomains,["traits","armor","conflict","magic"]);
assert.deepEqual(audit.manualDomains,["narrative"]);
assert.deepEqual(audit.adapterGapDomains,[]);
assert.deepEqual(audit.unexpectedReadyDomains,[]);
assert.equal(audit.mappingIntegrity,true);
assert.equal(audit.decision,"FOUNDATION_COMPLETE_LIVE_INTEGRATION_PLANNING_ALLOWED_ACTIVATION_STILL_BLOCKED");
assert.equal(audit.liveActivationAuthorized,false);
assert.equal(audit.profileSwitchAuthorized,false);
assert.equal(audit.creationCommitAuthorized,false);
assert.equal(audit.nextPhase,"CONTROLLED_TB2E_LIVE_INTEGRATION_PLANNING");
assert.deepEqual(audit.writes,{actors:0,items:0,journals:0,settings:0});

for(const row of TB2E_SOURCE_COVERAGE_MATRIX){
  const d=tb2eFinalDomainAudit(row.id,{shadowReadyDomains});
  assert.ok(d,row.id);
  if(row.id==="wises"){assert.equal(d.finalClassification,"VERIFIED");assert.equal(d.adapterReady,true);assert.equal(d.liveCandidate,true);}
  else if(["traits","armor","conflict","magic"].includes(row.id)){assert.equal(d.finalClassification,"SOURCE_BLOCKED");assert.equal(d.adapterRequired,false);assert.equal(d.sourceBlocked,true);assert.equal(d.liveCandidate,false);}
  else if(row.id==="narrative"){assert.equal(d.finalClassification,"MANUAL");assert.equal(d.manualOnly,true);assert.equal(d.liveCandidate,false);}
  else {assert.equal(d.finalClassification,"BOUNDED_PARTIAL");assert.equal(d.adapterReady,true);assert.equal(d.liveCandidate,true);}
  assert.equal(d.liveEnabled,false);
}

const source=fs.readFileSync("module/m10d-tb2e-final-audit.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.16 TB2E Final Foundation Audit · 19 domains · 1 VERIFIED · 13 BOUNDED_PARTIAL · 4 SOURCE_BLOCKED · 1 MANUAL · all 14 required shadows ready · activation still blocked · zero writes");
