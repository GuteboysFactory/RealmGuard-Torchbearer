import assert from "node:assert/strict";
import fs from "node:fs";
import { tb2eCoreReconciliationStatus, TB2E_M10D18_P1_RESOLVED_FINDINGS } from "../module/m10d-tb2e-core-reconciliation.mjs";
import { tb2eHomePlan, tb2eHumanUpbringingPlan, tb2eSocialGracePlan, tb2eSpecialtyPlan } from "../module/m10d-tb2e-creation-shadow.mjs";
import { tb2eConflictDispositionConditionPlan } from "../module/m10d-tb2e-conditions-shadow.mjs";
import { tb2eHelpPlan } from "../module/m10d-tb2e-help-shadow.mjs";
import { tb2eNatureLossPlan } from "../module/m10d-tb2e-nature-shadow.mjs";

const s=tb2eCoreReconciliationStatus();
assert.equal(s.phase,"M10D.18");assert.equal(s.package,"P1_CONFIRMED_MISMATCH_REPAIRS");assert.equal(s.packageReady,true);
assert.equal(s.resolvedFindingCount,6);assert.equal(s.pendingFindingCount,4);
assert.deepEqual(s.resolvedFindingIds,TB2E_M10D18_P1_RESOLVED_FINDINGS);
assert.equal(s.existingShadowReauditDomainCount,14);assert.equal(s.newShadowAdapterDomainCount,4);
assert.equal(s.fullDomainReauditStillRequired,true);assert.equal(s.liveIntegrationPaused,true);
assert.equal(s.liveActivationAuthorized,false);assert.equal(s.profileSwitchAuthorized,false);assert.equal(s.creationCommitAuthorized,false);
assert.equal(s.decision,"P1_REPAIRS_READY_FULL_CORE_DOMAIN_REAUDIT_STILL_REQUIRED");
assert.equal(s.nextStep,"M10D.18_P2_FULL_CORE_SHADOW_REAUDIT");assert.deepEqual(s.writes,{actors:0,items:0,journals:0,settings:0});

assert.equal(tb2eHumanUpbringingPlan({stock:"Human",skill:"Criminal",currentRating:0}).finalRating,3);
assert.equal(tb2eHomePlan({stock:"Elf",home:"Elfhome",skill:"Healer",trait:"Calm",currentSkillRating:0}).finalSkillRating,2);
assert.equal(tb2eSocialGracePlan({skill:"Orator",currentRating:0}).finalRating,2);
assert.equal(tb2eSpecialtyPlan({skill:"Scout",currentRating:0}).finalRating,2);

const disposition=tb2eConflictDispositionConditionPlan({conditions:["Hungry and Thirsty","Exhausted","Injured","Sick"]});
assert.equal(disposition.resolution,"CORE_RESOLVED");assert.equal(disposition.successPenalty,-2);assert.equal(disposition.dicePenalty,-2);
assert.deepEqual(disposition.chosenPenalty,{successes:-2,dice:-2});

assert.equal(tb2eHelpPlan({sourceKind:"ability",sourceName:"Resources",testName:"Resources",phase:"TOWN"}).ok,true);
assert.equal(tb2eHelpPlan({sourceKind:"ability",sourceName:"Resources",testName:"Resources",phase:"TOWN",context:"PAY_BILLS",payingTownBills:true}).reasonCode,"TOWN_BILLS_HELP_FORBIDDEN");
assert.equal(tb2eHelpPlan({sourceKind:"ability",sourceName:"Will",testName:"Will",context:"RECOVERY"}).reasonCode,"RECOVERY_HELP_FORBIDDEN");
assert.equal(tb2eNatureLossPlan({currentNature:0,maximumNature:1,reachedZeroDueToTax:true}).retirementTiming,"END_OF_ADVENTURE");

for(const file of ["module/m10d-tb2e-core-reconciliation.mjs","module/m10d-tb2e-creation-shadow.mjs","module/m10d-tb2e-conditions-shadow.mjs","module/m10d-tb2e-help-shadow.mjs","module/m10d-tb2e-nature-shadow.mjs"]){
  const source=fs.readFileSync(file,"utf8");
  for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])assert.equal(source.includes(forbidden),false,file+" must stay zero-write");
}
console.log("PASS M10D.18 P1 core reconciliation · 6 confirmed mismatches repaired · Human upbringing preserved at 3 · Home/Grace/Specialty 2 · disposition core-resolved · Help scope corrected · Nature end-of-adventure retirement · zero writes");
