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
assert.ok(["M10C.4","M10C.5","M10C.6","M10C.7","M10C.8"].includes(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase));
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.activationReadinessAuditComplete, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.foundationOnly, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.selectable, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.supported, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, true);

const audit = mg2eActivationReadinessAudit();
assert.equal(audit.phase, "M10C.8");
assert.equal(audit.mode, "MG2E_EXPLICIT_ACTIVATION_READINESS_AUDIT");
assert.equal(audit.auditComplete, true);
assert.equal(audit.activationReady, true);
assert.equal(audit.technicalReadinessComplete, true);
assert.equal(audit.shadowReadinessVerified, true);
assert.equal(audit.sourceDomainComplete, true);
assert.equal(audit.independentSourceProfile, true);
assert.equal(audit.activationGateClosed, false);
assert.equal(audit.activationAvailable, true);
assert.equal(audit.activationSurfaceRegistered, true);
assert.equal(audit.existingActorMigrationRequired, false);
assert.equal(audit.destructiveConversionRequired, false);
assert.deepEqual(audit.writes, {actors:0,items:0,journals:0,settings:0});
assert.equal(audit.decision, "READY_EXPLICIT_QA_ACTIVATION");

const byId = new Map(audit.blockers.map(row => [row.id,row]));
const recruitment = byId.get("FULL_RECRUITMENT_COMMIT_ADAPTER");
assert.equal(recruitment.state, "CLOSED");
assert.equal(recruitment.evidence.creationProfileAvailable, true);
assert.equal(recruitment.evidence.readyWhenActive, true);
assert.equal(recruitment.evidence.liveAuthority, "CORE_M9_WHEN_ACTIVE");
assert.equal(recruitment.evidence.liveCommit, false);

const reference = byId.get("DEDICATED_LIVE_RULES_REFERENCE");
assert.equal(reference.state, "CLOSED");
assert.equal(reference.evidence.mode, "READ_ONLY_PROFILE_REFERENCE");
assert.equal(reference.evidence.profileId, "mg2e");
assert.ok(reference.evidence.pageCount >= 8);
assert.equal(reference.evidence.zeroWrite, true);

const parity = byId.get("LIVE_PARITY_QA");
assert.equal(parity.state, "CLOSED");
assert.equal(parity.evidence.shadowAdaptersReady, true);
assert.equal(parity.evidence.liveApplication, false);
assert.equal(parity.evidence.activationAvailable, true);

const activation = byId.get("EXPLICIT_ACTIVATION_MILESTONE");
assert.equal(activation.state, "CLOSED");
assert.equal(activation.evidence.foundationOnly, false);
assert.equal(activation.evidence.selectable, true);
assert.equal(activation.evidence.supported, true);
assert.equal(activation.evidence.activationSurfaceRegistered, true);
assert.equal(activation.evidence.activationAvailable, true);
assert.equal(activation.evidence.genericActivationRouterPresent, true);

assert.deepEqual(audit.technicalBlockers, []);
assert.deepEqual(audit.openBlockers, []);

game.system.version = "1.12.0";
const activationModule = await import("../module/m10-profile-activation.mjs");
writes.length = 0;
game.user.isGM = false;
await assert.rejects(() => activationModule.switchRulesProfile("mg2e"), /GM-only/i);
game.user.isGM = true;
assert.equal(writes.length, 0);

const auditSource = fs.readFileSync("module/m10c-mg2e-readiness-audit.mjs","utf8");
for (const forbidden of ["game.settings.set","Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create"]) {
  assert.equal(auditSource.includes(forbidden), false, "M10C.4 audit must remain zero-write: " + forbidden);
}

console.log("PASS M10C.4 MG2E activation-readiness closure audit · exact blockers classified · zero writes · activation OFF");
