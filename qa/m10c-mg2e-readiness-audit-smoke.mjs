import assert from "node:assert/strict";
import fs from "node:fs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import { mg2eActivationReadinessAudit } from "../module/m10c-mg2e-readiness-audit.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId","realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion",1],
  ["realm-guard.systemSchemaVersion",1],
  ["realm-guard.coreArchitectureVersion","0.1"],
  ["realm-guard.migrationHistory","[]"],
  ["realm-guard.migrationLastError",""]
]);
const writes = [];

globalThis.game = {
  system:{version:"1.12.0-qa.15"},
  user:{isGM:true,id:"gm"},
  settings:{
    get:(ns,key)=>settings.get(ns + "." + key),
    set:async(ns,key,value)=>{
      writes.push({ns,key,value});
      settings.set(ns + "." + key,value);
      return value;
    }
  }
};
globalThis.Hooks = { callAll:()=>{} };

assert.equal(MG2E_FOUNDATION_PROFILE.version, 3);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase, "M10C.4");
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.activationReadinessAuditComplete, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.foundationOnly, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.selectable, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.supported, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, false);

const audit = mg2eActivationReadinessAudit();
assert.equal(audit.phase, "M10C.4");
assert.equal(audit.mode, "MG2E_ACTIVATION_READINESS_CLOSURE_AUDIT");
assert.equal(audit.auditComplete, true);
assert.equal(audit.activationReady, false);
assert.equal(audit.technicalReadinessComplete, false);
assert.equal(audit.shadowReadinessVerified, true);
assert.equal(audit.sourceDomainComplete, true);
assert.equal(audit.independentSourceProfile, true);
assert.equal(audit.activationGateClosed, true);
assert.equal(audit.activationAvailable, false);
assert.equal(audit.activationSurfaceRegistered, false);
assert.equal(audit.existingActorMigrationRequired, false);
assert.equal(audit.destructiveConversionRequired, false);
assert.deepEqual(audit.writes, {actors:0,items:0,journals:0,settings:0});
assert.equal(audit.decision, "NOT_READY_TECHNICAL_IMPLEMENTATION_REQUIRED");

const byId = new Map(audit.blockers.map(row => [row.id,row]));
const recruitment = byId.get("FULL_RECRUITMENT_COMMIT_ADAPTER");
assert.equal(recruitment.state, "OPEN");
assert.equal(recruitment.evidence.creationProfileAvailable, false);
assert.equal(recruitment.evidence.readyWhenActive, false);
assert.equal(recruitment.evidence.liveAuthority, "NONE");
assert.equal(recruitment.evidence.liveCommit, false);

const reference = byId.get("DEDICATED_LIVE_RULES_REFERENCE");
assert.equal(reference.state, "OPEN");
assert.equal(reference.evidence.mode, "LEGACY_MIXED_REFERENCE_OWNED_EXTERNALLY");
assert.equal(reference.evidence.profileId, "mg2e");
assert.equal(reference.evidence.pageCount, 0);
assert.equal(reference.evidence.zeroWrite, true);

const parity = byId.get("LIVE_PARITY_QA");
assert.equal(parity.state, "BLOCKED_NOT_RUN");
assert.equal(parity.evidence.shadowAdaptersReady, true);
assert.equal(parity.evidence.liveApplication, false);
assert.equal(parity.evidence.activationAvailable, false);

const activation = byId.get("EXPLICIT_ACTIVATION_MILESTONE");
assert.equal(activation.state, "DEFERRED");
assert.equal(activation.evidence.foundationOnly, true);
assert.equal(activation.evidence.selectable, false);
assert.equal(activation.evidence.supported, false);
assert.equal(activation.evidence.activationSurfaceRegistered, false);
assert.equal(activation.evidence.activationAvailable, false);
assert.equal(activation.evidence.genericActivationRouterPresent, true);

assert.deepEqual(audit.technicalBlockers, [
  "FULL_RECRUITMENT_COMMIT_ADAPTER",
  "DEDICATED_LIVE_RULES_REFERENCE"
]);
assert.deepEqual(audit.openBlockers, [
  "FULL_RECRUITMENT_COMMIT_ADAPTER",
  "DEDICATED_LIVE_RULES_REFERENCE",
  "LIVE_PARITY_QA",
  "EXPLICIT_ACTIVATION_MILESTONE"
]);

const activationModule = await import("../module/m10-profile-activation.mjs");
writes.length = 0;
await assert.rejects(() => activationModule.switchRulesProfile("mg2e"), /foundation-only/i);
assert.equal(writes.length, 0);

const auditSource = fs.readFileSync("module/m10c-mg2e-readiness-audit.mjs","utf8");
for (const forbidden of ["game.settings.set","Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create"]) {
  assert.equal(auditSource.includes(forbidden), false, "M10C.4 audit must remain zero-write: " + forbidden);
}

console.log("PASS M10C.4 MG2E activation-readiness closure audit · exact blockers classified · zero writes · activation OFF");
