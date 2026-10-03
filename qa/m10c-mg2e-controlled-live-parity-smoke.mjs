import assert from "node:assert/strict";
import fs from "node:fs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import {
  mg2eControlledLiveParityMatrix,
  mg2eControlledLiveParityStatus,
  resetMg2eControlledLiveParityEvidence,
  runMg2eControlledLiveParityHandoff
} from "../module/m10c-mg2e-controlled-live-parity.mjs";
import { mg2eActivationReadinessAudit } from "../module/m10c-mg2e-readiness-audit.mjs";
import { profileActivationAvailable, switchRulesProfile } from "../module/m10-profile-activation.mjs";

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
  system:{version:"1.12.0-qa.18"},
  user:{isGM:true,id:"gm"},
  actors:{contents:[]},
  items:{contents:[]},
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
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase, "M10C.8");
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.foundationOnly, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.selectable, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.supported, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveParityVerified, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.controlledLiveParityReady, true);

const before = mg2eControlledLiveParityStatus();
assert.equal(before.phase, "M10C.7");
assert.equal(before.mode, "MG2E_CONTROLLED_LIVE_PARITY_EXECUTION");
assert.equal(before.controlledExecutionReady, true);
assert.equal(before.liveParityVerified, true);
assert.equal(before.runtimeParityVerified, false);
assert.equal(before.verifiedRelease, "1.12.0-qa.18");
assert.equal(before.domainCount, 4);
assert.equal(before.executedDomainCount, 0);
assert.equal(before.passedDomainCount, 0);
assert.deepEqual(before.pendingDomains, ["WISE_EFFECTS","HELP","INVENTORY_GEAR","CONFLICT"]);
assert.equal(before.activationAuthorized, true);
assert.equal(before.activationAvailable, true);
assert.equal(before.foundationOnly, false);
assert.equal(before.selectable, true);
assert.equal(before.supported, true);
assert.equal(before.liveRuleAuthority, true);
assert.deepEqual(before.writes, {actors:0,items:0,journals:0,settings:0});

const wise = runMg2eControlledLiveParityHandoff("WISE_EFFECTS", {effect:"Deeper Understanding",failedDice:3});
assert.equal(wise.ok, true);
assert.equal(wise.checks.fateCost, true);
assert.equal(wise.checks.oneFailedDie, true);
assert.equal(wise.evidence.legacyUnratedWiseAutoRerollAuthorized, false);

const help = runMg2eControlledLiveParityHandoff("HELP", {sourceKind:"skill"});
assert.equal(help.ok, true);
assert.equal(help.checks.teamworkAccepted, true);
assert.equal(help.checks.iAmWiseAccepted, true);
assert.equal(help.checks.distinctRoutes, true);
assert.equal(help.checks.sameTestDoubleUseBlocked, true);

const gear = runMg2eControlledLiveParityHandoff("INVENTORY_GEAR");
assert.equal(gear.ok, true);
assert.equal(gear.checks.policyLoose, true);
assert.equal(gear.checks.relevantGearPlusOne, true);
assert.equal(gear.evidence.mg1eWeaponCatalogAuthorized, false);

const conflict = runMg2eControlledLiveParityHandoff("CONFLICT", {weapon:"Axe",armor:"Light Armor"});
assert.equal(conflict.ok, true);
assert.equal(conflict.checks.fightDefendNature, true);
assert.equal(conflict.checks.dispositionSkillFighter, true);
assert.equal(conflict.checks.dispositionBasesHealthNature, true);
assert.equal(conflict.checks.weaponAdapterAccepted, true);
assert.equal(conflict.checks.armorAdapterAccepted, true);
assert.equal(conflict.evidence.mg1eWeaponCatalogAuthorized, false);

const matrix = mg2eControlledLiveParityMatrix();
assert.equal(matrix.length, 4);
assert.ok(matrix.every(row => row.state === "EXECUTED_PASS"));

const after = mg2eControlledLiveParityStatus();
assert.equal(after.liveParityVerified, true);
assert.equal(after.executedDomainCount, 4);
assert.equal(after.passedDomainCount, 4);
assert.deepEqual(after.pendingDomains, []);
assert.deepEqual(after.failedDomains, []);
assert.equal(after.nextStep, "Complete M10C.8 MG2E selectable activation live QA");

const audit = mg2eActivationReadinessAudit();
const parity = audit.blockers.find(row => row.id === "LIVE_PARITY_QA");
const activation = audit.blockers.find(row => row.id === "EXPLICIT_ACTIVATION_MILESTONE");
assert.equal(audit.phase, "M10C.8");
assert.equal(parity.state, "CLOSED");
assert.equal(parity.closed, true);
assert.equal(parity.evidence.liveParityVerified, true);
assert.equal(activation.state, "CLOSED");
assert.equal(activation.closed, true);
assert.deepEqual(audit.openBlockers, []);
assert.equal(audit.decision, "READY_EXPLICIT_QA_ACTIVATION");
assert.equal(audit.nextStep, "M10C.8 FULL PASS / VERIFIED / CLOSED · MG2E supported stable");

game.system.version = "1.12.0";
assert.equal(profileActivationAvailable("mg2e"), true);
writes.length = 0;
game.user.isGM = false;
await assert.rejects(() => switchRulesProfile("mg2e"), /GM-only/i);
game.user.isGM = true;
assert.equal(writes.length, 0);

const serviceSource = fs.readFileSync("module/m10c-mg2e-controlled-live-parity.mjs","utf8");
for (const forbidden of [
  "game.settings.set(",
  "Actor.create(",
  "Item.create(",
  "JournalEntry.create(",
  "createEmbeddedDocuments(",
  "deleteEmbeddedDocuments("
]) {
  assert.equal(serviceSource.includes(forbidden), false, "M10C.7 controlled parity must remain zero-write: " + forbidden);
}
const activationSource = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activationSource.includes("switchToMg2e"), true);

game.system.version = "1.12.0-qa.19";
const reset = resetMg2eControlledLiveParityEvidence();
assert.equal(reset.liveParityVerified, true);
assert.equal(reset.runtimeParityVerified, false);
assert.equal(reset.executedDomainCount, 0);
assert.equal(reset.passedDomainCount, 0);

console.log("PASS M10C.7 MG2E controlled live parity execution · 4/4 bounded handoffs PASS · source adapters zero-write · stable activation locked");
