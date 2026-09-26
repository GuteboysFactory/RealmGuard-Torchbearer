import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildProfileCapabilities } from "../module/profile-capabilities.mjs";
import {
  buildM10BSessionCirclesProgressionPolicy,
  familySessionPolicy,
  familyEndSessionValidation,
  familyCirclesContactPlan,
  familyEnmityDispositionPlan,
  familyProgressionDataPolicy,
  familyResourceSpendPlan,
  familyAdvancementRequirements,
  familyAdvancementPlan,
  familyConflictAdvancementPlan,
  familyBeginnerLearningPlan
} from "../module/m10b-session-circles-progression.mjs";
import {
  getStrictSessionCirclesProgressionStatus,
  strictAdvancementRequirements,
  strictCirclesContactPlan,
  strictEndSessionValidation
} from "../module/m10-strict-session-circles-progression.mjs";

const resolver = new ProfileResolver([MG1E_FOUNDATION_PROFILE, REALM_GUARD_LEGACY_MIXED_PROFILE, REALM_GUARD_STRICT_PROFILE]);
const legacy = buildM10BSessionCirclesProgressionPolicy(buildProfileCapabilities(resolver.resolve("realm-guard-legacy-mixed")));
const strict = buildM10BSessionCirclesProgressionPolicy(buildProfileCapabilities(resolver.resolve("realm-guard-strict")));
const mg1e = buildM10BSessionCirclesProgressionPolicy(buildProfileCapabilities(resolver.resolve("mg1e")));

assert.equal(legacy.phase,"M10B.6");
assert.equal(strict.phase,"M10B.6");
assert.equal(mg1e.phase,"M10B.6");
assert.equal(legacy.familySemantics,false);
assert.equal(strict.familySemantics,true);
assert.equal(mg1e.familySemantics,true);
assert.equal(mg1e.profileVersion,7);

for (const policy of [strict,mg1e]) {
  assert.equal(policy.session.playerTurnFreeTests,1);
  assert.equal(policy.session.additionalTestCheckCost,1);
  assert.equal(policy.session.alternationRequired,true);
  assert.equal(policy.session.soloAlternationException,true);
  assert.equal(policy.session.gmTurnRecoveryCheckCost,2);
  assert.equal(policy.session.checksTransferable,true);
  assert.equal(policy.session.embodimentMayAwardEveryone,false);
  assert.equal(policy.session.tableRewardAuthority,"GROUP_CONSENSUS");
  assert.equal(policy.session.foundryCommitAuthority,"GM");
  assert.equal(policy.circles.knownContactFutureDice,1);
  assert.equal(policy.circles.enmityClause,true);
  assert.equal(policy.circles.enmityArgumentSpeechDispositionSuccess,3);
  assert.equal(policy.circles.automaticNpcCreation,false);
  assert.equal(policy.progression.levelsEnabled,false);
  assert.equal(policy.progression.talentsEnabled,false);
  assert.equal(policy.progression.preserveExistingData,true);
  assert.equal(policy.progression.lifetimeSpendLevelTrackingEnabled,false);
  assert.equal(policy.progression.ratingZeroOnePassNeeded,1);
  assert.equal(policy.progression.clearSlateOnAdvance,true);
  assert.equal(policy.progression.oneTestPerAbilityOrSkillPerConflictScene,true);
  assert.equal(policy.progression.beginnerLearningOpensAt,2);
  assert.equal(policy.progression.beginnerLearningAttemptsUseMaximumNature,true);
  assert.equal(policy.progression.beginnerLuckAdvancesWillHealth,false);
}
assert.equal(legacy.progression.levelsEnabled,true);
assert.equal(legacy.progression.talentsEnabled,true);
assert.equal(legacy.progression.lifetimeSpendLevelTrackingEnabled,true);
assert.equal(legacy.circles.knownContactFutureDice,0);

assert.equal(familySessionPolicy(mg1e).source,"MG1E_2008");
assert.equal(familyEndSessionValidation({participantIds:["A"],embodimentIds:["A"]},mg1e).ok,false);
assert.equal(familyEndSessionValidation({participantIds:["A","B"],mvpId:"A",workhorseId:"B",embodimentIds:["A"]},mg1e).ok,true);
assert.equal(familyEndSessionValidation({participantIds:["A","B"],embodimentIds:["A","B"]},strict).errors.includes("EMBODIMENT_CANNOT_BE_EVERYONE"),true);
assert.deepEqual(
  strictEndSessionValidation({participantIds:["A","B"],mvpId:"A",workhorseId:"B",embodimentIds:["A"]}),
  familyEndSessionValidation({participantIds:["A","B"],mvpId:"A",workhorseId:"B",embodimentIds:["A"]},strict)
);

assert.equal(familyCirclesContactPlan({knownContact:true,successful:true,relationshipRole:"CONTACT"},mg1e).futureCirclesDice,1);
assert.equal(familyCirclesContactPlan({knownContact:true,successful:true,relationshipRole:"ENEMY"},mg1e).futureCirclesDice,0);
assert.equal(familyCirclesContactPlan({knownContact:true,successful:true,relationshipRole:"CONTACT"},legacy).futureCirclesDice,0);
assert.equal(strictCirclesContactPlan({knownContact:true,successful:true,relationshipRole:"CONTACT"}).futureCirclesDice,1);

const enmity = familyEnmityDispositionPlan({relationshipRole:"ENEMY",relationshipStatus:"HOSTILE",conflictType:"argument",againstRelationshipOwner:true},mg1e);
assert.equal(enmity.active,true);
assert.equal(enmity.dispositionSuccess,3);
assert.equal(familyEnmityDispositionPlan({relationshipRole:"ENEMY",relationshipStatus:"HOSTILE",conflictType:"fight",againstRelationshipOwner:true},mg1e).active,false);

function actor() {
  return {
    id:"A",type:"character",
    system:{
      resources:{fate:{value:4},persona:{value:3}},
      progression:{level:4,spentFate:14,spentPersona:9}
    },
    items:{contents:[{id:"t1",type:"talent",name:"Preserved Talent"}]}
  };
}
const a=actor();
const strictData=familyProgressionDataPolicy(a,strict);
assert.equal(strictData.levelsEnabled,false);
assert.equal(strictData.talentsEnabled,false);
assert.equal(strictData.preserved.level,4);
assert.equal(strictData.preserved.talentItems,1);
assert.equal(strictData.deletionPlanned,false);
assert.equal(familyProgressionDataPolicy(a,legacy).levelsEnabled,true);

const spend=familyResourceSpendPlan(a,"fate",1,strict);
assert.equal(spend.ok,true);
assert.equal(spend.before,4);
assert.equal(spend.after,3);
assert.equal(spend.progressionSideEffects.spentFateAfter,14);
assert.equal(spend.progressionSideEffects.levelAfter,4);
assert.equal(spend.writesExecuted,0);

assert.deepEqual(strictAdvancementRequirements(3),{rating:3,passNeeded:3,failNeeded:2,source:"MG1E_2008"});
assert.equal(familyAdvancementRequirements(1,mg1e).passNeeded,1);
const advance=familyAdvancementPlan({rating:3,passed:3,failed:2},mg1e);
assert.equal(advance.readyToAdvance,true);
assert.equal(advance.nextRating,4);
assert.equal(advance.nextPassed,0);
assert.equal(advance.nextFailed,0);

let conflictAdvance=familyConflictAdvancementPlan({sceneOrConflictId:"C1",abilityOrSkillId:"fighter",loggedKeys:[],result:"pass"},mg1e);
assert.equal(conflictAdvance.eligible,true);
conflictAdvance=familyConflictAdvancementPlan({sceneOrConflictId:"C1",abilityOrSkillId:"fighter",loggedKeys:conflictAdvance.nextLoggedKeys,result:"fail"},mg1e);
assert.equal(conflictAdvance.duplicateBlocked,true);
const learning=familyBeginnerLearningPlan({maximumNature:5,attempts:4,attempted:true},mg1e);
assert.equal(learning.opensSkill,true);
assert.equal(learning.openingRating,2);
assert.equal(learning.willAdvancementAllowed,false);
assert.equal(learning.healthAdvancementAllowed,false);

const status=getStrictSessionCirclesProgressionStatus();
assert.equal(status.phase,"M10A.5_COMPAT_WRAPPER");
assert.equal(status.compatibilityProvider,"M10B.6_GENERIC_FAMILY");

const generic=fs.readFileSync("module/m10b-session-circles-progression.mjs","utf8");
for(const forbidden of [".update(","createEmbeddedDocuments","deleteEmbeddedDocuments","game.settings.set",".setFlag(",".unsetFlag("]) {
  assert.equal(generic.includes(forbidden),false,`M10B.6 generic provider must remain non-destructive: ${forbidden}`);
}
const endSession=fs.readFileSync("module/end-session.mjs","utf8");
assert.equal(endSession.includes("isStrictRealmGuard"),false);
assert.equal(endSession.includes("strictEndSessionValidation"),false);
assert.ok(endSession.includes("familyEndSessionValidation"));
assert.ok(endSession.includes("rows.length > 1 && embodimentCount === rows.length"),"Legacy End Session compatibility validation must remain.");

const progressionSource=fs.readFileSync("module/progression.mjs","utf8");
assert.equal(progressionSource.includes("isStrictRealmGuard"),false);
assert.ok(progressionSource.includes("lifetimeSpendLevelTrackingEnabled"));
assert.ok(progressionSource.includes("Torchbearer 2E cumulative Fate/Persona thresholds"));

const sheet=fs.readFileSync("sheets/actor-sheet.mjs","utf8");
assert.ok(sheet.includes("familyCirclesContactPlan"));
assert.ok(sheet.includes("futureCirclesDice"));
assert.ok(sheet.includes("progression.talentsEnabled"));
assert.equal(sheet.includes("isStrictRealmGuard"),false);

const npc=fs.readFileSync("templates/actor/npc.hbs","utf8");
const identityClose=npc.indexOf("</div>\n    <div class=\"rg-npc-resource-stack rg-meta\"");
assert.ok(identityClose>0,"NPC resources must be a right-side sibling of identity, matching the Character header pattern.");
const css=fs.readFileSync("styles/realm-guard.css","utf8");
assert.ok(css.includes("v1.12.0-qa.6 — NPC/Character header resource alignment"));
assert.ok(css.includes("grid-template-columns:96px minmax(0,1fr) 170px"));

const conflicts=fs.readFileSync("module/conflicts.mjs","utf8");
assert.ok(conflicts.includes("familyEnmityDispositionPlan"));
assert.ok(conflicts.includes("enmityDispositionBonus"));
assert.ok(conflicts.includes("Enmity Clause:"));
assert.ok(conflicts.includes("buildM8RelationshipSheetView"));

const activation=fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activation.includes('"mg1e"'),false,"MG1E remains non-selectable in M10B.6.");

console.log("PASS M10B.6 Session / Circles / Progression routing · MG1E foundation v7 · Strict wrappers · Legacy preservation · NPC resource-stack alignment");
