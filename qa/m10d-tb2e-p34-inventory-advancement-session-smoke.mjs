import assert from "node:assert/strict";
import fs from "node:fs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {
 tb2eInventoryShadowStatus,tb2eInventoryModel,tb2eGearStoragePlan,
 tb2eContainerPlan,tb2eCachePlan
} from "../module/m10d-tb2e-inventory-shadow.mjs";
import {
 tb2eAdvancementShadowStatus,tb2eAdvancementModel,
 tb2eLevelProgressionBoundaryPlan,tb2eTownResourcesMarkPlan
} from "../module/m10d-tb2e-advancement-shadow.mjs";
import {
 tb2eSessionShadowStatus,tb2eSessionModel,tb2eGrindTurnPlan,
 tb2eGrindCadencePlan,tb2eCampEntryPlan,tb2eCampCheckPlan,
 tb2eCampEventModifierPlan
} from "../module/m10d-tb2e-session-shadow.mjs";

const profiles=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(profiles.map(id=>resolveRulesProfile(id)));
const readonly=p=>{
 assert.equal(p.liveApplication,false);
 if(Object.hasOwn(p,"writesPlanned"))assert.equal(p.writesPlanned,0);
 else assert.deepEqual(p.writes,{actors:0,items:0,journals:0,settings:0});
};
for(const status of [tb2eInventoryShadowStatus(),tb2eAdvancementShadowStatus(),tb2eSessionShadowStatus()]){
 readonly(status);assert.equal(status.coreReauditTargetedPhase,"M10D.18_P3.4");
 assert.equal(status.fullDomainReauditComplete,false);
}
// DH 83-88: carried 4, nested fractional slots, remote cache boundary.
const inv=tb2eInventoryModel();readonly(inv);
assert.equal(inv.specialCarried4.soloLaborerTestAllowed,true);
assert.equal(inv.nesting.roundUpItemSlots,true);
const carriedSolo=tb2eGearStoragePlan({storage:"CARRIED",slotCost:4,carriers:1});
readonly(carriedSolo);assert.equal(carriedSolo.soloCarried4RequiresLaborerTest,true);
assert.equal(carriedSolo.carriersEnoughWithoutSoloTest,false);
const carriedGroup=tb2eGearStoragePlan({storage:"CARRIED",slotCost:4,carriers:2});
assert.equal(carriedGroup.carriersEnoughWithoutSoloTest,true);
assert.equal(carriedGroup.soloCarried4RequiresLaborerTest,false);
const nesting=tb2eContainerPlan({container:"SATCHEL",usedPackSlots:2,nested:true,
 innerContainerSlotCost:0.5,innerContentsSlotCost:1});
readonly(nesting);assert.equal(nesting.requiredNestedSlots,1.5);
assert.equal(nesting.roundedNestedSlots,2);assert.equal(nesting.totalOccupiedSlots,4);
assert.equal(nesting.overCapacityIncludingNested,true);
const atCache=tb2eCachePlan({phase:"TOWN",hasParentOrFriendWithHome:true,built:true,atCacheLocation:true});
const awayCache=tb2eCachePlan({phase:"TOWN",hasParentOrFriendWithHome:true,built:true,atCacheLocation:false});
assert.equal(atCache.transferAtWill,true);assert.equal(awayCache.transferAtWill,false);
assert.equal(awayCache.transferRequiresVisit,true);
// DH 108-113: exact leveling thresholds, two resources mark sources.
const adv=tb2eAdvancementModel();readonly(adv);
const expected=[[0,0],[3,3],[7,6],[14,12],[22,20],[31,30],[41,42],[52,56],[64,72],[78,98]];
assert.deepEqual(adv.levels.thresholds.map(x=>[x.fate,x.persona]),expected);
const level=tb2eLevelProgressionBoundaryPlan({currentLevel:3,inTown:true,spentFate:14,spentPersona:12});
readonly(level);assert.equal(level.eligibleForExactLevelUp,true);
assert.deepEqual(level.exactNextThreshold,{level:4,fate:14,persona:12});
assert.equal(tb2eLevelProgressionBoundaryPlan({currentLevel:3,inTown:false,spentFate:14,spentPersona:12}).eligibleForExactLevelUp,false);
assert.equal(tb2eLevelProgressionBoundaryPlan({currentLevel:3,inTown:true,spentFate:13,spentPersona:12}).eligibleForExactLevelUp,false);
assert.equal(tb2eLevelProgressionBoundaryPlan({currentLevel:10,inTown:true,spentFate:100,spentPersona:100}).eligibleForExactLevelUp,false);
const buying=tb2eTownResourcesMarkPlan({source:"PURCHASES"});
const bills=tb2eTownResourcesMarkPlan({source:"BILLS",alreadyCountedPurchases:true});
readonly(buying);readonly(bills);
assert.equal(buying.count,true);assert.equal(bills.count,true);
assert.equal(tb2eTownResourcesMarkPlan({source:"BILLS",resourcesAdvancedOnPurchases:true}).count,false);
assert.equal(tb2eTownResourcesMarkPlan({source:"PURCHASES",alreadyCountedPurchases:true}).count,false);
assert.equal(tb2eTownResourcesMarkPlan({source:"BILLS",alreadyCountedBills:true}).count,false);
assert.equal(tb2eTownResourcesMarkPlan({source:"BILLS",hasResolvedTest:false}).count,false);
// SG 39-42, 90-96: turn conditions, Camp constraints and watch.
const session=tb2eSessionModel();readonly(session);
assert.equal(session.grind.exhaustedInstinctsCostTurns,1);
assert.equal(session.grind.extremeConditionCadenceTurns,3);
assert.equal(tb2eGrindTurnPlan({actionType:"TEST",instinct:true,exhausted:false}).turnCostPreview,0);
assert.equal(tb2eGrindTurnPlan({actionType:"TEST",instinct:true,exhausted:true}).turnCostPreview,1);
const n4=tb2eGrindCadencePlan({turn:4,extreme:false});
const e3=tb2eGrindCadencePlan({turn:3,extreme:true});
readonly(n4);readonly(e3);
assert.equal(n4.conditionTick,true);assert.equal(e3.conditionTick,true);
assert.equal(tb2eGrindCadencePlan({turn:3,extreme:false}).conditionTick,false);
assert.equal(tb2eGrindCadencePlan({turn:4,extreme:true}).conditionTick,false);
assert.equal(e3.extremeDeadMayFollowExhausted,true);
assert.equal(tb2eGrindCadencePlan({turn:0}).reasonCode,"INVALID_GRIND_TURN");
assert.equal(tb2eCampEntryPlan({partyChecks:1,restSiteAvailable:false}).canCamp,false);
assert.equal(tb2eCampEntryPlan({partyChecks:1,immediatePeril:true}).canCamp,false);
assert.equal(tb2eCampEntryPlan({partyChecks:1,restSiteAvailable:true,immediatePeril:false}).canCamp,true);
assert.equal(tb2eCampCheckPlan({activity:"TEST",checksAvailable:1,instinct:true,exhausted:false}).checkCostPreview,0);
assert.equal(tb2eCampCheckPlan({activity:"TEST",checksAvailable:1,instinct:true,exhausted:true}).checkCostPreview,1);
assert.equal(tb2eCampEventModifierPlan({danger:"UNSAFE",darkCamp:true}).netModifier,-1);
assert.equal(tb2eCampEventModifierPlan({danger:"DANGEROUS",darkCamp:true}).netModifier,-2);
assert.equal(tb2eCampEventModifierPlan({danger:"UNSAFE",darkCamp:false}).netModifier,-2);
for(const file of [
 "module/m10d-tb2e-inventory-shadow.mjs",
 "module/m10d-tb2e-advancement-shadow.mjs",
 "module/m10d-tb2e-session-shadow.mjs"
]){
 const source=fs.readFileSync(file,"utf8");
 for(const banned of ["game.settings.set","Actor.create","Item.create","JournalEntry.create",
  "createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]){
  assert.equal(source.includes(banned),false,file+" contains mutation "+banned);
 }
}
assert.equal(JSON.stringify(profiles.map(id=>resolveRulesProfile(id))),before);
console.log("PASS M10D.18 P3.4 Inventory cache/nesting/Carried4; DH112 levels/Town marks; SG Grind/Camp read-only");
