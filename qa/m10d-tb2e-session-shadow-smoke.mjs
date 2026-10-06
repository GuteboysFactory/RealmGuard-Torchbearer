import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eCampCheckPlan, tb2eCampEntryPlan, tb2eCampEventModifierPlan, tb2eEndSessionTimingPlan, tb2eGrindTurnPlan, tb2eLifestyleExitPlan, tb2eLightPlan, tb2eSessionModel, tb2eSessionShadowStatus, tb2eSessionStartPlan, tb2eTownEntryPlan, tb2eTownEventModifierPlan, tb2eWatchPlan } from "../module/m10d-tb2e-session-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eSessionShadowStatus();
assert.equal(status.phase,"M10D.12");assert.equal(status.mode,"TB2E_SESSION_PHASES_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eSessionModel();
assert.equal(model.transitionGraphAuthority,"SOURCE_INCOMPLETE_NO_FULL_GRAPH");
assert.equal(model.grind.turnDefinition,"ONE_TEST_OR_CONFLICT_NOT_FIXED_TIME");assert.equal(model.grind.instinctsCostTurns,0);assert.equal(model.grind.conditionCadenceTurns,4);
assert.equal(model.checks.shareable,true);assert.equal(model.checks.helpingCostsCheck,false);assert.equal(model.checks.unspentCampChecks,"LOST");
assert.equal(model.camp.entryRequirement,"PARTY_HAS_AT_LEAST_ONE_CHECK");assert.equal(model.camp.turnCounterResetPreview,1);
assert.equal(model.campChecks.defaultTestOrConflictCostChecks,1);assert.equal(model.campChecks.consecutiveTestsBySameCharacterAllowed,false);
assert.equal(model.lifestyle.respiteLifestyleCostModifier,1);assert.equal(model.endSession.fatePersonaEarnedAt,"END_OF_SESSION");

const start=tb2eSessionStartPlan({summaryReward:"Recover One Taxed Nature",taxedNature:2});
assert.equal(start.ok,true);assert.equal(start.summaryReward,"RECOVER_ONE_TAXED_NATURE");assert.equal(start.rewardAmount,1);assert.equal(start.natureMutationCommitted,false);
assert.equal(tb2eSessionStartPlan({summaryReward:"Alleviate Condition",condition:"Injured"}).reasonCode,"SUMMARY_REWARD_CANNOT_ALLEVIATE_INJURED_OR_SICK");

const normalTurn=tb2eGrindTurnPlan({actionType:"Test",separatePartyActions:1});assert.equal(normalTurn.turnCostPreview,1);
const split=tb2eGrindTurnPlan({actionType:"Test",separatePartyActions:3});assert.equal(split.turnCostPreview,3);
const instinct=tb2eGrindTurnPlan({actionType:"Test",instinct:true});assert.equal(instinct.turnCostPreview,0);
const spellUnknown=tb2eGrindTurnPlan({actionType:"Spell"});assert.equal(spellUnknown.turnCostPreview,null);assert.equal(spellUnknown.turnCostAuthority,"SPELL_OR_INVOCATION_EFFECT_SOURCE_REQUIRED");

const camp=tb2eCampEntryPlan({partyChecks:2,survey:true,setWatch:true,darkCamp:true});
assert.equal(camp.canCamp,true);assert.equal(camp.turnCounterResetPreview,1);assert.equal(camp.surveyTurnCost,1);assert.equal(camp.watchCampEventRollBonus,1);assert.equal(camp.darkCampRecoveryObstacleModifier,1);
assert.equal(tb2eCampEntryPlan({partyChecks:0}).canCamp,false);

const campMods=tb2eCampEventModifierPlan({shelter:true,concealment:true,settingWatch:true,previousDisasters:1,gmDiscretionPenalty:true,danger:"Unsafe"});
assert.equal(campMods.totalBonus,3);assert.equal(campMods.totalPenalty,4);assert.equal(campMods.netModifier,-1);assert.equal(campMods.eventRollExecuted,false);
assert.equal(campMods.eventResultAuthority,"CAMP_EVENT_TABLE_NOT_SUPPLIED_DO_NOT_RESOLVE");

const check=tb2eCampCheckPlan({activity:"Research",checksAvailable:2});
assert.equal(check.checkCostPreview,1);assert.equal(check.affordable,true);assert.equal(check.checkSpendCommitted,false);
const help=tb2eCampCheckPlan({activity:"Test",checksAvailable:0,helping:true});assert.equal(help.checkCostPreview,0);assert.equal(help.affordable,true);
assert.equal(tb2eCampCheckPlan({activity:"Fight",checksAvailable:2}).reasonCode,"CAMP_CANNOT_EXPLORE_OR_FIGHT");
assert.equal(tb2eCampCheckPlan({activity:"Test",checksAvailable:2,sameCharacterActedImmediatelyBefore:true}).reasonCode,"NO_TWO_TESTS_IN_A_ROW_IN_CAMP");
assert.equal(tb2eCampCheckPlan({activity:"Memorize Spell",checksAvailable:2,memorizeOrPurifyAlreadyDone:true}).reasonCode,"MEMORIZE_OR_PURIFY_LIMIT_ONCE_PER_CAMP");

const watch=tb2eWatchPlan({onWatch:true,spendCheckToAvertDisaster:true});
assert.deepEqual(watch.blockedWhileWatching,["RECOVERY_TEST","MEMORIZE_SPELL","PURIFY_IMMORTAL_BURDEN"]);assert.equal(watch.otherChecksAllowed,true);assert.equal(watch.maySpendCheckToAvertDisaster,true);

const town=tb2eTownEntryPlan({remainingChecks:2,leftoverFood:true,levelUpPossible:true});
assert.equal(town.remainingChecksUse,"RECOVERY_TESTS");assert.equal(town.leftoverFoodOutcome,"SPOILS_AND_IS_THROWN_AWAY");assert.equal(town.townEventRollRequired,true);assert.equal(town.levelMutationCommitted,false);
const townMods=tb2eTownEventModifierPlan({prayedAtShrine:true,stewardMaintainedWorks:true,ongoingDisasters:1,theurgeEnemyTown:true});
assert.equal(townMods.totalBonus,2);assert.equal(townMods.totalPenalty,2);assert.equal(townMods.netModifier,0);assert.equal(townMods.eventResultAuthority,"TOWN_EVENT_TABLE_NOT_SUPPLIED_DO_NOT_RESOLVE");

const lifestyle=tb2eLifestyleExitPlan({lifestyleCost:0,respite:false});assert.equal(lifestyle.resourcesObstaclePreview,1);
const respite=tb2eLifestyleExitPlan({lifestyleCost:3,respite:true});assert.equal(respite.adjustedLifestyleCost,4);assert.equal(respite.resourcesObstaclePreview,4);assert.equal(respite.resourcesTestExecuted,false);
const end=tb2eEndSessionTimingPlan({awardsReady:true});assert.equal(end.fatePersonaEarnedAt,"END_OF_SESSION");assert.equal(end.awardMutationCommitted,false);

const torch=tb2eLightPlan({source:"Torch",placedOnGround:true});assert.equal(torch.brightTurns,2);assert.equal(torch.brightPeople,2);assert.equal(torch.dimExtraPeople,2);assert.equal(torch.lightMode,"DIM");
const candle=tb2eLightPlan({source:"Candle"});assert.equal(candle.brightTurns,4);assert.equal(candle.brightPeople,1);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-session-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.12 TB2E Session/Phases shadow · session start · Grind · Camp · Checks · Town · Lifestyle/Respite · end-session timing · light · zero writes");
