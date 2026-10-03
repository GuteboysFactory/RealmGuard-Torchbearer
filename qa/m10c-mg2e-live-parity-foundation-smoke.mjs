import assert from "node:assert/strict";
import fs from "node:fs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import { resolveProfileCapabilities } from "../module/rules-profile-service.mjs";
import {
  familyAdvancementRequirements,
  familyBeginnerLearningPlan,
  familyCirclesContactPlan,
  familySessionPolicy,
  resolveM10BSessionCirclesProgressionPolicy
} from "../module/m10b-session-circles-progression.mjs";
import {
  mg2eLiveParityFoundationStatus,
  mg2eLiveParityMatrix
} from "../module/m10c-mg2e-live-parity.mjs";
import { mg2eActivationReadinessAudit } from "../module/m10c-mg2e-readiness-audit.mjs";
import { profileActivationAvailable, switchRulesProfile } from "../module/m10-profile-activation.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion", 1],
  ["realm-guard.systemSchemaVersion", 1],
  ["realm-guard.coreArchitectureVersion", "0.1"],
  ["realm-guard.migrationHistory", "[]"],
  ["realm-guard.migrationLastError", ""]
]);
const writes = [];

globalThis.game = {
  system: { version: "1.12.0-qa.17" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] },
  items: { contents: [] },
  settings: {
    get: (ns, key) => settings.get(ns + "." + key),
    set: async (ns, key, value) => {
      writes.push({ ns, key, value });
      settings.set(ns + "." + key, value);
      return value;
    }
  }
};
globalThis.Hooks = { callAll: () => {} };

assert.equal(MG2E_FOUNDATION_PROFILE.version, 3);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase, "M10C.6");
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveParityFoundationReady, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveParityVerified, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.foundationOnly, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.selectable, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.supported, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, false);
assert.deepEqual(MG2E_FOUNDATION_PROFILE.metadata.pendingDomains, ["live-parity-execution", "explicit-activation"]);

const caps = resolveProfileCapabilities("mg2e");
assert.equal(caps.rules.session.familySemantics, true);
assert.equal(caps.rules.circles.familySemantics, true);
assert.equal(caps.rules.session.mode, "MG2E");
assert.equal(caps.rules.circles.mode, "MG2E");

const sessionPolicy = resolveM10BSessionCirclesProgressionPolicy("mg2e");
assert.equal(sessionPolicy.profileId, "mg2e");
assert.equal(sessionPolicy.familySemantics, true);
assert.equal(familySessionPolicy(sessionPolicy).source, "MG2E_2015");
assert.equal(familyAdvancementRequirements(4, sessionPolicy).source, "MG2E_2015");
assert.equal(familyBeginnerLearningPlan({ maximumNature: 3, attempts: 2, attempted: true }, sessionPolicy).source, "MG2E_2015");
assert.equal(familyCirclesContactPlan({ knownContact: true, successful: true }, sessionPolicy).source, "MG2E_2015");

const matrix = mg2eLiveParityMatrix();
assert.equal(matrix.length, 13);
assert.equal(matrix.every(row => row.foundationReady === true), true);
assert.deepEqual(
  matrix.filter(row => row.state === "CANDIDATE_HANDOFF_READY").map(row => row.id),
  ["WISE_EFFECTS", "HELP", "INVENTORY_GEAR", "CONFLICT"]
);

const status = mg2eLiveParityFoundationStatus();
assert.equal(status.phase, "M10C.6");
assert.equal(status.mode, "MG2E_LIVE_PARITY_QA_FOUNDATION");
assert.equal(status.profileId, "mg2e");
assert.equal(status.profileVersion, 3);
assert.equal(status.foundationReady, true);
assert.equal(status.liveParityVerified, false);
assert.equal(status.controlledExecutionRequired, true);
assert.equal(status.activationAuthorized, false);
assert.equal(status.activationExpected, false);
assert.equal(status.domainCount, 13);
assert.equal(status.readyDomainCount, 13);
assert.deepEqual(status.mismatchDomains, []);
assert.deepEqual(status.handoffRequired, ["WISE_EFFECTS", "HELP", "INVENTORY_GEAR", "CONFLICT"]);
assert.deepEqual(status.writes, { actors: 0, items: 0, journals: 0, settings: 0 });
assert.equal(status.destructiveMigration, false);
assert.equal(status.existingActorMutation, false);
assert.equal(status.nextStep, "M10C.7 MG2E Controlled Live Parity Execution");

const audit = mg2eActivationReadinessAudit();
const parity = audit.blockers.find(row => row.id === "LIVE_PARITY_QA");
const activation = audit.blockers.find(row => row.id === "EXPLICIT_ACTIVATION_MILESTONE");
assert.equal(audit.technicalReadinessComplete, true);
assert.deepEqual(audit.technicalBlockers, []);
assert.equal(parity.state, "FOUNDATION_READY_NOT_RUN");
assert.equal(parity.closed, false);
assert.equal(parity.evidence.foundationReady, true);
assert.equal(parity.evidence.liveParityVerified, false);
assert.deepEqual(parity.evidence.handoffRequired, ["WISE_EFFECTS", "HELP", "INVENTORY_GEAR", "CONFLICT"]);
assert.equal(activation.state, "DEFERRED");
assert.equal(audit.decision, "NOT_READY_CONTROLLED_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN");
assert.equal(audit.nextStep, "M10C.7 MG2E Controlled Live Parity Execution");

assert.equal(profileActivationAvailable("mg2e"), false);
const before = settings.get("realm-guard.activeRulesProfileId");
await assert.rejects(() => switchRulesProfile("mg2e"), /foundation-only/i);
assert.equal(settings.get("realm-guard.activeRulesProfileId"), before);
assert.equal(writes.length, 0);

for (const path of [
  "module/m10c-mg2e-live-parity.mjs",
  "module/m10c-mg2e-readiness-audit.mjs"
]) {
  const source = fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
  for (const forbidden of [
    "Actor.create(",
    "Item.create(",
    "JournalEntry.create(",
    "game.settings.set("
  ]) {
    assert.equal(source.includes(forbidden), false, path + " must remain zero-write in M10C.6: " + forbidden);
  }
}

console.log("PASS M10C.6 MG2E live parity QA foundation · 13/13 domains ready · 4 controlled handoffs identified · activation OFF · zero writes");
