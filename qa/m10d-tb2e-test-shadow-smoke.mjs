import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eBeginnersLuckShadowPlan, tb2eDiceModel, tb2eLuckPlan, tb2eResolveObstacleShadow, tb2eResolveVersusShadow, tb2eTestPoolPlan, tb2eTestShadowStatus } from "../module/m10d-tb2e-test-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eTestShadowStatus();
assert.equal(status.phase,"M10D.4");assert.equal(status.mode,"TB2E_TESTS_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eDiceModel();
assert.equal(model.successThreshold,4);assert.deepEqual(model.successFaces,[4,5,6]);assert.equal(model.luck.resource,"FATE");assert.equal(model.luck.recursive,true);
assert.equal(model.obstacleFactorsAuthority,"UNAVAILABLE_DG160_CALLER_SUPPLIED_ONLY");

const pool=tb2eTestPoolPlan({basePool:5,diceModifier:-2,successModifier:1});
assert.equal(pool.ok,true);assert.equal(pool.finalPool,3);assert.equal(pool.successModifier,1);assert.equal(pool.writesPlanned,0);
const clamped=tb2eTestPoolPlan({basePool:1,diceModifier:-3});
assert.equal(clamped.finalPool,0);assert.equal(clamped.poolClampedAtZero,true);

const obPass=tb2eResolveObstacleShadow({dice:[1,4,5,6],obstacle:3});
assert.equal(obPass.ok,true);assert.equal(obPass.rawSuccesses,3);assert.equal(obPass.finalSuccesses,3);assert.equal(obPass.outcome,"PASS");assert.equal(obPass.margin,0);
const obFail=tb2eResolveObstacleShadow({dice:[1,2,4],obstacle:3,successModifier:1});
assert.equal(obFail.finalSuccesses,2);assert.equal(obFail.outcome,"FAIL");assert.equal(obFail.margin,1);
assert.equal(tb2eResolveObstacleShadow({dice:[7],obstacle:1}).reasonCode,"INVALID_D6_RESULT");

const vsPass=tb2eResolveVersusShadow({dice:[4,5,6],opponentSuccesses:2});
assert.equal(vsPass.outcome,"PASS");assert.equal(vsPass.margin,1);assert.equal(vsPass.tieResolutionRequired,false);
const vsTie=tb2eResolveVersusShadow({dice:[4,5],opponentSuccesses:2});
assert.equal(vsTie.outcome,"TIE");assert.equal(vsTie.tieResolutionRequired,true);assert.equal(vsTie.tieResolutionAutomation,false);
assert.match(vsTie.tieBoundary,/GUIDES_DO_NOT_ESTABLISH_COMPLETE_GENERIC_TIE_PROCEDURE/);

const luck=tb2eLuckPlan({dice:[2,6,6],fateAvailable:1});
assert.equal(luck.ok,true);assert.equal(luck.resourceCost,"FATE");assert.equal(luck.resourceAmount,1);assert.equal(luck.initialExtraDice,2);assert.equal(luck.recursiveOpenSixes,true);
assert.equal(luck.resourceSpendCommitted,false);assert.equal(luck.randomRollExecuted,false);
assert.equal(tb2eLuckPlan({dice:[1,2,3],fateAvailable:1}).reasonCode,"NO_SIXES");
assert.equal(tb2eLuckPlan({dice:[6],fateAvailable:0}).reasonCode,"INSUFFICIENT_FATE");

const bl=tb2eBeginnersLuckShadowPlan({abilityDice:5,wisesDice:1,helpDice:1,suppliesDice:1,gearDice:0,traitsDice:1,personaDice:1,channeledNatureDice:2,freshDice:1});
assert.equal(bl.ok,true);assert.equal(bl.preHalving,8);assert.equal(bl.halvedPool,4);assert.equal(bl.postHalving,5);assert.equal(bl.finalPool,9);
assert.equal(bl.missingToolsPenalty.automation,"MANUAL_SOURCE_BOUNDARY");assert.equal(bl.resourceSpendCommitted,false);
assert.equal(tb2eBeginnersLuckShadowPlan({abilityDice:4,abilityZeroDueToInjuryOrSickness:true}).reasonCode,"ABILITY_ZERO_DUE_TO_INJURY_OR_SICKNESS");

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-test-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.4 TB2E Tests shadow · 4+ d6 · +D/+s · Ob/Versus margin · Fate Luck plan · BL ordering · source boundaries · zero writes");
