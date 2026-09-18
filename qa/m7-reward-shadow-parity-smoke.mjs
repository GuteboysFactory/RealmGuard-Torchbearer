import assert from "node:assert/strict";
import fs from "node:fs";
import { RewardAuthority, RewardEngine } from "../module/core/m7-session-services.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const shadow = fs.readFileSync("module/m7-session-shadow.mjs", "utf8");
const endSession = fs.readFileSync("module/end-session.mjs", "utf8");

assert.match(manifest.version, /^1\.9\.0-qa\.\d+$/);
assert.ok(shadow.includes('buildScope: "REWARD_SHADOW_PARITY"'));
assert.ok(shadow.includes("observeM7RewardProposal"));
assert.ok(shadow.includes("observeM7RewardCommit"));
assert.ok(shadow.includes("rewardParitySummary"));
assert.ok(shadow.includes('mode: "SHADOW_READ_ONLY"'));
assert.ok(shadow.includes('authority: "LEGACY_MIXED"'));
assert.ok(shadow.includes("liveApplication: false"));

assert.ok(endSession.includes("observeM7RewardProposal({ actor, criteria, mvpId, workhorseId, legacyProposal: proposal })"));
assert.ok(endSession.includes("observeM7RewardCommit({"));
assert.ok(endSession.includes("proposal: row.proposal"));
assert.ok(endSession.includes("approval: actorApproval"));

const authority = new RewardAuthority();
const engine = new RewardEngine({ authority });

const proposal = engine.proposal({
  actorId: "A1",
  criteria: {
    fateBelief: true,
    fateGoal: true,
    fateInstinct: true,
    personaGoal: true,
    personaAgainstBelief: true,
    personaEmbodiment: true
  },
  mvpId: "A1",
  workhorseId: ""
});

assert.deepEqual(
  {
    fate: proposal.fate,
    persona: proposal.persona,
    personaRaw: proposal.personaRaw,
    goalFateSuppressed: proposal.goalFateSuppressed
  },
  { fate: 2, persona: 4, personaRaw: 4, goalFateSuppressed: true }
);

const commit = engine.previewCommit({
  currentFate: 2,
  currentPersona: 1,
  fateMax: 5,
  personaMax: 5,
  proposal: { fate: 2, persona: 4 },
  approval: { fate: true, persona: true }
});

assert.deepEqual(
  {
    approvedFate: commit.approvedFate,
    approvedPersona: commit.approvedPersona,
    nextFate: commit.nextFate,
    nextPersona: commit.nextPersona,
    actualFate: commit.actualFate,
    actualPersona: commit.actualPersona
  },
  { approvedFate: 2, approvedPersona: 4, nextFate: 4, nextPersona: 5, actualFate: 2, actualPersona: 4 }
);

const partial = engine.previewCommit({
  currentFate: 4,
  currentPersona: 4,
  fateMax: 5,
  personaMax: 5,
  proposal: { fate: 3, persona: 3 },
  approval: { fate: true, persona: false }
});
assert.equal(partial.nextFate, 5);
assert.equal(partial.actualFate, 1);
assert.equal(partial.nextPersona, 4);
assert.equal(partial.actualPersona, 0);

console.log("PASS m7-reward-shadow-parity-smoke");
