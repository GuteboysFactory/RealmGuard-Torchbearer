import assert from "node:assert/strict";
import fs from "node:fs";
import {
  evaluateM7RewardProposalLiveHandoff,
  evaluateM7RewardCommitLiveHandoff,
  getM7RewardHandoffStatus,
  resetM7RewardHandoffTelemetry,
  setM7CoreRewardEnabled,
  getM7TraitCheckAwardHandoffStatus
} from "../module/m7-session-live-handoff.mjs";
import { RewardEngine } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const endSession = fs.readFileSync("module/end-session.mjs", "utf8");
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");

assert.match(manifest.version, /^1\.(?:9\.0(?:-qa\.\d+)?|10\.0(?:-qa\.\d+)?)$/, "Smoke must accept stable/QA 1.9.0 and 1.10.0 builds.");

const engine = new RewardEngine();

resetM7RewardHandoffTelemetry();
setM7CoreRewardEnabled(true);

const criteria = {
  fateBelief: true,
  fateGoal: true,
  fateInstinct: true,
  personaGoal: true,
  personaAgainstBelief: true,
  personaEmbodiment: true
};
const legacyProposal = { fate: 2, persona: 4, personaRaw: 4, goalFateSuppressed: true };
let result = evaluateM7RewardProposalLiveHandoff({
  actorId: "A1",
  legacy: legacyProposal,
  corePlan: () => engine.proposal({ actorId: "A1", criteria, mvpId: "A1", workhorseId: "A2" })
});
assert.equal(result.m7.rewardAuthority, "CORE_M7");
assert.equal(result.fate, 2);
assert.equal(result.persona, 4);
assert.equal(result.personaRaw, 4);
assert.equal(result.goalFateSuppressed, true);

const proposal = result;
const legacyCommit = {
  beforeFate: 4,
  beforePersona: 2,
  approvedFate: 2,
  approvedPersona: 4,
  nextFate: 5,
  nextPersona: 5,
  actualFate: 1,
  actualPersona: 3
};
result = evaluateM7RewardCommitLiveHandoff({
  actorId: "A1",
  legacy: legacyCommit,
  corePlan: () => engine.previewCommit({
    currentFate: 4,
    currentPersona: 2,
    fateMax: 5,
    personaMax: 5,
    proposal,
    approval: { fate: true, persona: true }
  })
});
assert.equal(result.m7.rewardAuthority, "CORE_M7");
assert.equal(result.actualFate, 1);
assert.equal(result.actualPersona, 3);
assert.equal(result.nextFate, 5);
assert.equal(result.nextPersona, 5);

let status = getM7RewardHandoffStatus();
assert.equal(status.enabled, true);
assert.equal(status.telemetry.matches, 2);
assert.equal(status.telemetry.mismatches, 0);
assert.deepEqual(status.deferredScope, []);

result = evaluateM7RewardCommitLiveHandoff({
  actorId: "A1",
  legacy: { ...legacyCommit, nextFate: 4, actualFate: 0 },
  corePlan: () => engine.previewCommit({
    currentFate: 4,
    currentPersona: 2,
    fateMax: 5,
    personaMax: 5,
    proposal,
    approval: { fate: true, persona: true }
  })
});
assert.equal(result.m7.rewardAuthority, "LEGACY_FALLBACK");
status = getM7RewardHandoffStatus();
assert.equal(status.enabled, false);
assert.equal(status.rollbackReason, "REWARD_DISAGREEMENT");
assert.equal(status.telemetry.mismatches, 1);
assert.equal(getM7TraitCheckAwardHandoffStatus().enabled, true);

setM7CoreRewardEnabled(true);
resetM7RewardHandoffTelemetry();

assert.ok(endSession.includes("legacyAwardProposal"));
assert.ok(endSession.includes("evaluateM7RewardProposalLiveHandoff"));
assert.ok(endSession.includes("evaluateM7RewardCommitLiveHandoff"));
assert.ok(endSession.includes("legacyCommit"));
assert.ok(shadow.includes("rewardHandoffStatus"));
assert.ok(shadow.includes("setCoreRewardEnabled"));
assert.ok(shadow.includes('"EndSessionRewardLiveHandoff"'));
assert.ok(shadow.includes('"AutoRollbackOnRewardDisagreement"'));

console.log("PASS m7-end-session-reward-live-handoff-qa15-smoke");
