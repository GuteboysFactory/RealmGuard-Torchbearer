import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getStrictSessionCirclesProgressionStatus,
  strictAdvancementPlan,
  strictAdvancementRequirements,
  strictBeginnerLearningPlan,
  strictCirclesContactPlan,
  strictConflictAdvancementPlan,
  strictEndSessionValidation,
  strictEnmityDispositionPlan,
  strictPlayerTurnTestPlan,
  strictProgressionDataPolicy,
  strictRecoveryCheckPlan,
  strictResourceSpendPlan,
  strictRewardProposal,
  strictSessionPolicy
} from "../module/m10-strict-session-circles-progression.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.\d+\.\d+(?:\.\d+)*(?:-(?:alpha|beta|rc|qa)\.\d+)?$/, "M10A.5 smoke runs across v1.11.0.");

function actor(id, checks = 2) {
  return {
    id,
    type: "character",
    system: {
      resources: {
        checks: { value: checks, max: 9 },
        fate: { value: 4, max: 5 },
        persona: { value: 3, max: 5 }
      },
      progression: { level: 4, spentFate: 14, spentPersona: 9 }
    },
    items: { contents: [{ id: "tal1", type: "talent", name: "Legacy Talent" }] }
  };
}

const a1 = actor("A1", 2);
const a2 = actor("A2", 0);

const status = getStrictSessionCirclesProgressionStatus();
assert.equal(status.phase, "M10A.5_COMPAT_WRAPPER");\nassert.equal(status.compatibilityProvider, "M10B.6_GENERIC_FAMILY");
assert.equal(status.liveAuthority, false);
assert.equal(status.session.freePlayerTurnTests, 1);
assert.equal(status.session.additionalTestCheckCost, 1);
assert.equal(status.session.gmTurnRecoveryCheckCost, 2);
assert.equal(status.session.embodimentMayAwardEveryone, false);
assert.equal(status.circles.knownContactFutureDice, 1);
assert.equal(status.circles.enmityArgumentSpeechDispositionSuccess, 3);
assert.equal(status.progression.levels, false);
assert.equal(status.progression.talents, false);
assert.equal(status.progression.lifetimeSpendLevelTracking, false);
assert.equal(status.writesActors, false);
assert.equal(status.writesItems, false);

const session = strictSessionPolicy();
assert.equal(session.playerTurnFreeTests, 1);
assert.equal(session.additionalPlayerTurnTestCheckCost, 1);
assert.equal(session.alternationRequired, true);
assert.equal(session.soloAlternationException, true);
assert.equal(session.gmTurnRecoveryCheckCost, 2);

let claim = strictPlayerTurnTestPlan({
  actor: a1,
  actorState: { freeUsed: false, testsTaken: 0, checksSpent: 0, done: false },
  sessionState: { enabled: true, phase: "player", lastActorId: "", actors: [{id:"A1",done:false},{id:"A2",done:false}] }
});
assert.equal(claim.ok, true);
assert.equal(claim.source, "free");
assert.equal(claim.cost, 0);

claim = strictPlayerTurnTestPlan({
  actor: a1,
  actorState: { freeUsed: true, testsTaken: 1, checksSpent: 0, done: false },
  sessionState: { enabled: true, phase: "player", lastActorId: "A2", actors: [{id:"A1",done:false},{id:"A2",done:false}] }
});
assert.equal(claim.ok, true);
assert.equal(claim.source, "check");
assert.equal(claim.cost, 1);

claim = strictPlayerTurnTestPlan({
  actor: a1,
  actorState: { freeUsed: true, testsTaken: 1, checksSpent: 0, done: false },
  sessionState: { enabled: true, phase: "player", lastActorId: "A1", actors: [{id:"A1",done:false},{id:"A2",done:false}] }
});
assert.equal(claim.ok, false);
assert.equal(claim.reasonCode, "alternation");

claim = strictPlayerTurnTestPlan({
  actor: a1,
  actorState: { freeUsed: true, testsTaken: 1, checksSpent: 0, done: false },
  sessionState: { enabled: true, phase: "player", lastActorId: "A1", actors: [{id:"A1",done:false}] }
});
assert.equal(claim.ok, true, "Solo player may continue without alternation.");

const recovery = strictRecoveryCheckPlan({
  actor: a1,
  conditionName: "Tired",
  sessionState: { enabled: true, phase: "gm", turnCycleId: 1, actors: [{id:"A1",done:false}] }
});
assert.equal(recovery.ok, true);
assert.equal(recovery.cost, 2);

let validation = strictEndSessionValidation({
  participantIds: ["A1"],
  embodimentIds: ["A1"]
});
assert.equal(validation.ok, false);
assert.equal(validation.errors.includes("EMBODIMENT_CANNOT_BE_EVERYONE"), true);

validation = strictEndSessionValidation({
  participantIds: ["A1","A2"],
  embodimentIds: ["A1","A2"]
});
assert.equal(validation.ok, false);
validation = strictEndSessionValidation({
  participantIds: ["A1","A2"],
  mvpId: "A1",
  workhorseId: "A2",
  embodimentIds: ["A1"]
});
assert.equal(validation.ok, true);
assert.equal(validation.tableAuthority, "GROUP_CONSENSUS");
assert.equal(validation.foundryCommitAuthority, "GM");

const reward = strictRewardProposal({
  actorId:"A1",
  criteria:{
    fateBelief:true,
    fateGoal:true,
    fateInstinct:true,
    personaGoal:true,
    personaAgainstBelief:true,
    personaEmbodiment:true
  },
  mvpId:"A1",
  workhorseId:"A2"
});
assert.equal(reward.fate, 2);
assert.equal(reward.persona, 4);
assert.equal(reward.tableAuthority, "GROUP_CONSENSUS");

const contact = strictCirclesContactPlan({ knownContact:true, successful:true });
assert.equal(contact.futureCirclesDice, 1);
assert.equal(contact.successCreatesOrConfirmsContact, true);
assert.equal(contact.socialStorage, "CORE_M8_FOUNDRY_TOOLING");

let enmity = strictEnmityDispositionPlan({
  relationshipRole:"enemy",
  relationshipStatus:"hostile",
  conflictType:"argument",
  againstRelationshipOwner:true
});
assert.equal(enmity.active, true);
assert.equal(enmity.dispositionSuccess, 3);
enmity = strictEnmityDispositionPlan({
  relationshipRole:"enemy",
  relationshipStatus:"hostile",
  conflictType:"fight",
  againstRelationshipOwner:true
});
assert.equal(enmity.active, false);
assert.equal(enmity.dispositionSuccess, 0);

const progression = strictProgressionDataPolicy(a1);
assert.equal(progression.levelsEnabled, false);
assert.equal(progression.talentsEnabled, false);
assert.equal(progression.lifetimeSpendLevelTrackingEnabled, false);
assert.equal(progression.preserveExistingData, true);
assert.equal(progression.preserved.level, 4);
assert.equal(progression.preserved.spentFate, 14);
assert.equal(progression.preserved.spentPersona, 9);
assert.equal(progression.preserved.talentItems, 1);
assert.equal(progression.deletionPlanned, false);

const fateSpend = strictResourceSpendPlan(a1, "fate", 1);
assert.equal(fateSpend.ok, true);
assert.equal(fateSpend.before, 4);
assert.equal(fateSpend.after, 3);
assert.equal(fateSpend.progressionSideEffects.levelBefore, 4);
assert.equal(fateSpend.progressionSideEffects.levelAfter, 4);
assert.equal(fateSpend.progressionSideEffects.spentFateBefore, 14);
assert.equal(fateSpend.progressionSideEffects.spentFateAfter, 14);
assert.equal(fateSpend.progressionSideEffects.levelUp, false);
assert.equal(fateSpend.progressionSideEffects.talentUnlocks, 0);
assert.equal(fateSpend.writesExecuted, 0);

assert.deepEqual(strictAdvancementRequirements(3), { rating:3, passNeeded:3, failNeeded:2, source:"MG1E_2008" });
assert.deepEqual(strictAdvancementRequirements(1), { rating:1, passNeeded:1, failNeeded:0, source:"MG1E_2008" });
assert.deepEqual(strictAdvancementRequirements(0), { rating:0, passNeeded:1, failNeeded:0, source:"MG1E_2008" });

let advance = strictAdvancementPlan({ rating:3, passed:3, failed:2 });
assert.equal(advance.readyToAdvance, true);
assert.equal(advance.nextRating, 4);
assert.equal(advance.clearSlateOnAdvance, true);
assert.equal(advance.nextPassed, 0);
assert.equal(advance.nextFailed, 0);
advance = strictAdvancementPlan({ rating:3, passed:4, failed:1 });
assert.equal(advance.readyToAdvance, false);

let conflictAdvance = strictConflictAdvancementPlan({
  sceneOrConflictId:"C1",
  abilityOrSkillId:"fighter",
  loggedKeys:[],
  result:"pass"
});
assert.equal(conflictAdvance.eligible, true);
assert.equal(conflictAdvance.oneTestPerAbilityOrSkillPerScene, true);
const logged = conflictAdvance.nextLoggedKeys;
conflictAdvance = strictConflictAdvancementPlan({
  sceneOrConflictId:"C1",
  abilityOrSkillId:"fighter",
  loggedKeys:logged,
  result:"fail"
});
assert.equal(conflictAdvance.eligible, false);
assert.equal(conflictAdvance.duplicateBlocked, true);

let learning = strictBeginnerLearningPlan({ maximumNature:5, attempts:3, attempted:true });
assert.equal(learning.attemptsAfter, 4);
assert.equal(learning.opensSkill, false);
assert.equal(learning.willAdvancementAllowed, false);
assert.equal(learning.healthAdvancementAllowed, false);
learning = strictBeginnerLearningPlan({ maximumNature:5, attempts:4, attempted:true });
assert.equal(learning.opensSkill, true);
assert.equal(learning.openingRating, 2);

assert.ok(REALM_GUARD_STRICT_PROFILE.version >= 6, "M10A.5 policy must remain present in later Strict profile versions.");
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.session.playerTurnFreeTests, 1);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.circles.knownContactFutureDice, 1);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.progression.levels, false);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.progression.talents, false);
assert.match(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase, /^M10(?:A|B)\.\d+$/, "M10A.5 smoke must survive later M10 phases.");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.sessionPolicyReady, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.circlesPolicyReady, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.progressionPolicyReady, true);
assert.equal(typeof REALM_GUARD_STRICT_PROFILE.metadata.liveRuleAuthority, "boolean");

const strictSource = fs.readFileSync("module/m10-strict-session-circles-progression.mjs", "utf8");
for (const forbidden of [
  ".update(",
  ".createEmbeddedDocuments(",
  ".deleteEmbeddedDocuments(",
  "game.settings.set",
  ".setFlag(",
  ".unsetFlag("
]) assert.equal(strictSource.includes(forbidden), false, `Strict M10A.5 foundation must stay non-live: ${forbidden}`);

const liveProgression = fs.readFileSync("module/progression.mjs", "utf8");
assert.ok(liveProgression.includes("Torchbearer 2E cumulative Fate/Persona thresholds"), "Legacy Mixed Level/Talent progression must remain untouched in qa.6.");
assert.ok(liveProgression.includes("progressionLevelFor"), "Legacy progression engine must remain present.");

const liveEndSession = fs.readFileSync("module/end-session.mjs", "utf8");
assert.ok(liveEndSession.includes("rows.length > 1 && embodimentCount === rows.length"), "Legacy Mixed solo Embodiment behavior must remain untouched in qa.6.");

const profileService = fs.readFileSync("module/rules-profile-service.mjs", "utf8");
assert.equal(profileService.includes("setActiveRulesProfile"), false, "No live profile switch API may exist in M10A.5.");

console.log("PASS M10A.5 Session / Circles / Progression foundation · MG1E ownership ready · Legacy Mixed untouched · no live activation");
