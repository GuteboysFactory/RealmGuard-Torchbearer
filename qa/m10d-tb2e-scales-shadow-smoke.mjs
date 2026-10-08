import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eMightActionBonusPlan, tb2eMightScalePlan, tb2eMountedMightBoundaryPlan, tb2ePlayerMightGoalPlan, tb2ePostConflictMightReviewPlan, tb2ePrecedenceActionBonusPlan, tb2ePrecedenceEligibilityPlan, tb2ePrecedenceScalePlan, tb2eScalesModel, tb2eScalesShadowStatus } from "../module/m10d-tb2e-scales-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eScalesShadowStatus();
assert.equal(status.phase,"M10D.14");assert.equal(status.mode,"TB2E_MIGHT_PRECEDENCE_READ_ONLY_SHADOW");
assert.equal(status.sourceClassification,"PARTIAL");assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);
assert.equal(status.mightMutationAllowed,false);assert.equal(status.precedenceMutationAllowed,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eScalesModel();
assert.deepEqual(model.might.range,{min:1,max:8});assert.deepEqual(model.precedence.range,{min:0,max:7});
assert.equal(model.might.playerAdventurerScaleEntry,3);assert.deepEqual(model.might.playerGoalLimits,{CAPTURE:3,KILL:4,DRIVE_OFF:5});
assert.equal(model.precedence.analogy,"MIGHT_FOR_NON_COMBAT_CONFLICTS");
assert.equal(model.assignmentAuthority,"SCALE_REFERENCE_ONLY_DO_NOT_INFER_UNLISTED_ENTITIES");

const m8=tb2eMightScalePlan({might:8});assert.deepEqual(m8.listedExamples,["IMMORTALS"]);
const m3=tb2eMightScalePlan({might:3});assert.ok(m3.listedExamples.includes("ADVENTURERS"));assert.ok(m3.listedExamples.includes("HORSES"));
assert.equal(tb2eMightScalePlan({might:0}).reasonCode,"INVALID_MIGHT");

assert.equal(tb2ePlayerMightGoalPlan({goal:"Capture",targetMight:3}).eligible,true);
assert.equal(tb2ePlayerMightGoalPlan({goal:"Capture",targetMight:4}).eligible,false);
assert.equal(tb2ePlayerMightGoalPlan({goal:"Kill",targetMight:4}).eligible,true);
assert.equal(tb2ePlayerMightGoalPlan({goal:"Drive Off",targetMight:5}).eligible,true);
assert.equal(tb2ePlayerMightGoalPlan({goal:"Drive Off",targetMight:6}).eligible,false);

const mb=tb2eMightActionBonusPlan({teamMight:5,opponentMight:3,conflictType:"Kill",outcome:"Tie"});
assert.equal(mb.mightDifference,2);assert.equal(mb.bonusSuccessesPreview,2);assert.equal(mb.successModifierCommitted,false);
assert.equal(tb2eMightActionBonusPlan({teamMight:5,opponentMight:3,conflictType:"Kill",outcome:"Fail"}).bonusSuccessesPreview,0);
assert.equal(tb2eMightActionBonusPlan({teamMight:5,opponentMight:3,conflictType:"Convince",outcome:"Pass"}).reasonCode,"MIGHT_BONUS_CONFLICT_NOT_SOURCE_AUTHORIZED");

const mountUnknown=tb2eMountedMightBoundaryPlan({characterMight:3,mountMight:6});
assert.equal(mountUnknown.effectiveMightPreview,null);assert.equal(mountUnknown.riderTestDetailsAuthority,"NOT_SUPPLIED_BY_GUIDE");
const mountPass=tb2eMountedMightBoundaryPlan({characterMight:3,mountMight:6,riderTestResolved:true});
assert.equal(mountPass.effectiveMightPreview,6);assert.equal(mountPass.mountMightUsePreview,true);assert.equal(mountPass.riderTestExecuted,false);

assert.equal(tb2ePostConflictMightReviewPlan({mightChanged:false}).reprocessCompromisesAndPossibleGoals,false);
const review=tb2ePostConflictMightReviewPlan({mightChanged:true});assert.equal(review.reprocessCompromisesAndPossibleGoals,true);assert.equal(review.reviewAuthority,"GM_REVIEW_REQUIRED_BY_GUIDE");

const p0=tb2ePrecedenceScalePlan({precedence:0});assert.ok(p0.listedExamples.includes("ADVENTURERS"));assert.ok(p0.listedExamples.includes("SOLDIERS"));
const p7=tb2ePrecedenceScalePlan({precedence:7});assert.deepEqual(p7.listedExamples,["KING","QUEEN"]);

assert.equal(tb2ePrecedenceEligibilityPlan({action:"Convince",actorPrecedence:2,targetPrecedence:2}).eligible,true);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Convince",actorPrecedence:2,targetPrecedence:3}).eligible,false);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Haggle",actorPrecedence:2,targetPrecedence:3}).eligible,true);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Haggle",actorPrecedence:2,targetPrecedence:4}).eligible,false);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Convince Crowd",actorPrecedence:2,targetPrecedence:4}).eligible,true);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Convince Crowd",actorPrecedence:2,targetPrecedence:5}).eligible,false);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Trick",actorPrecedence:0,targetPrecedence:7}).eligible,true);
assert.equal(tb2ePrecedenceEligibilityPlan({action:"Riddle",actorPrecedence:0,targetPrecedence:7}).eligible,true);

const pb=tb2ePrecedenceActionBonusPlan({teamPrecedence:5,opponentPrecedence:2,conflictType:"Convince Crowd",outcome:"Pass"});
assert.equal(pb.precedenceDifference,3);assert.equal(pb.bonusSuccessesPreview,3);assert.equal(pb.successModifierCommitted,false);
assert.equal(tb2ePrecedenceActionBonusPlan({teamPrecedence:5,opponentPrecedence:2,conflictType:"Convince",outcome:"Fail"}).bonusSuccessesPreview,0);
assert.equal(tb2ePrecedenceActionBonusPlan({teamPrecedence:5,opponentPrecedence:2,conflictType:"Kill",outcome:"Pass"}).reasonCode,"PRECEDENCE_BONUS_CONFLICT_NOT_SOURCE_AUTHORIZED");

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-scales-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.14 TB2E Might/Precedence shadow · scales · player goal limits · action success bonuses · mounted boundary · post-conflict review · precedence eligibility · zero writes");
