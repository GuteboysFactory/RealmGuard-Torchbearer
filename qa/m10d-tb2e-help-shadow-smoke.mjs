import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eBeginnersLuckHelpPlan, tb2eConflictHelpPlan, tb2eHelpConsequencePlan, tb2eHelpPlan, tb2eHelpShadowStatus } from "../module/m10d-tb2e-help-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eHelpShadowStatus();
assert.equal(status.phase,"M10D.3");assert.equal(status.mode,"TB2E_HELP_READ_ONLY_SHADOW");assert.equal(status.sourceClassification,"PARTIAL");
assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const same=tb2eHelpPlan({sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true});
assert.equal(same.ok,true);assert.equal(same.dice,1);assert.equal(same.eligibility,"SAME_SKILL");assert.equal(same.helperConditionRisk,true);
const suggested=tb2eHelpPlan({sourceKind:"skill",sourceName:"Laborer",testName:"Cook",suggestedHelpSkill:true});
assert.equal(suggested.ok,true);assert.equal(suggested.eligibility,"SUGGESTED_HELP_SKILL");
const ability=tb2eHelpPlan({sourceKind:"ability",sourceName:"Will",testName:"Will"});
assert.equal(ability.ok,true);assert.equal(ability.eligibility,"ABILITY_ANYONE_CAN_HELP");
const nature=tb2eHelpPlan({sourceKind:"nature",testName:"Nature",relevantNatureDescriptor:true});
assert.equal(nature.ok,true);assert.equal(nature.eligibility,"RELEVANT_NATURE_DESCRIPTOR");
assert.equal(tb2eHelpPlan({sourceKind:"wise",testName:"Scout"}).reasonCode,"USE_WISE_AID_ROUTE");
assert.equal(tb2eHelpPlan({sourceKind:"skill",testName:"Resources",phase:"TOWN"}).reasonCode,"TOWN_HELP_FORBIDDEN");
assert.equal(tb2eHelpPlan({sourceKind:"ability",testName:"Health",phase:"TOWN",context:"RECOVERY"}).reasonCode,"TOWN_HELP_FORBIDDEN");

const instinct=tb2eHelpPlan({sourceKind:"skill",testName:"Scout",actingOnInstinct:true,helperActingOnInstinct:true});
assert.equal(instinct.ok,true);assert.equal(instinct.eligibility,"HELPER_ALSO_ACTING_ON_INSTINCT");
const instinctNature=tb2eHelpPlan({sourceKind:"nature",actingOnInstinct:true,relevantNatureDescriptor:true});
assert.equal(instinctNature.ok,true);assert.equal(instinctNature.eligibility,"RELEVANT_NATURE_DESCRIPTOR_ON_INSTINCT");
assert.equal(tb2eHelpPlan({sourceKind:"skill",actingOnInstinct:true}).reasonCode,"INSTINCT_HELP_SOURCE_NOT_ELIGIBLE");

const bl=tb2eBeginnersLuckHelpPlan({sourceName:"Will"});
assert.equal(bl.ok,true);assert.equal(bl.dice,1);assert.equal(bl.poolStage,"PRE_HALVING");
assert.equal(tb2eBeginnersLuckHelpPlan({sourceName:"Cook"}).reasonCode,"BEGINNERS_LUCK_HELP_REQUIRES_WILL_OR_HEALTH");

assert.equal(tb2eConflictHelpPlan({partySize:3,helperHasRoundAction:false,hasRequiredSkill:true}).reasonCode,"CONFLICT_HELP_REQUIRES_4_PLUS_PARTY");
assert.equal(tb2eConflictHelpPlan({partySize:4,helperHasRoundAction:true,hasRequiredSkill:true}).reasonCode,"CONFLICT_HELP_REQUIRES_NO_ACTION_THIS_ROUND");
const conflict=tb2eConflictHelpPlan({partySize:4,helperHasRoundAction:false,relevantNatureDescriptor:true});
assert.equal(conflict.ok,true);assert.equal(conflict.dice,1);assert.equal(conflict.eligibility,"RELEVANT_NATURE_DESCRIPTOR");

const consequence=tb2eHelpConsequencePlan({testFailed:true,conditionApplied:true});
assert.equal(consequence.applies,true);assert.equal(consequence.helperConsequence,"LESSER_CONDITION");assert.equal(consequence.everyoneHungryAlternative,true);
assert.equal(consequence.automaticConditionWrite,false);assert.equal(consequence.writesPlanned,0);
const already=tb2eHelpConsequencePlan({testFailed:true,conditionApplied:true,helperAlreadyHasCondition:true});
assert.equal(already.helperConsequence,"NO_ADDITIONAL_CONDITION");
assert.equal(tb2eHelpConsequencePlan({testFailed:false,conditionApplied:true}).applies,false);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-help-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.3 TB2E Help shadow · same/suggested/ability/Nature · BL pre-halving · Instinct/Conflict · consequence guidance · zero writes");
