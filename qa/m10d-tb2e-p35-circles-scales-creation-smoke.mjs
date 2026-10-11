import assert from "node:assert/strict";
import fs from "node:fs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {
 tb2eCirclesShadowStatus,tb2eCirclesModel,tb2eCirclesFactorPlan,
 tb2eCirclesTestOutcomePlan,tb2eStartingRelationshipsPlan
} from "../module/m10d-tb2e-circles-shadow.mjs";
import {
 tb2eScalesShadowStatus,tb2ePlayerMightGoalPlan,
 tb2eGroupScaleComparisonPlan,tb2ePrecedenceEligibilityPlan
} from "../module/m10d-tb2e-scales-shadow.mjs";
import {
 tb2eCreationShadowStatus,tb2eCreationModel,tb2eClassStockPlan,
 tb2eStartingEquipmentBoundaryPlan
} from "../module/m10d-tb2e-creation-shadow.mjs";

const ids=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(ids.map(id=>resolveRulesProfile(id)));
const readOnly=p=>{
 assert.equal(p.liveApplication,false);
 if(Object.hasOwn(p,"writesPlanned"))assert.equal(p.writesPlanned,0);
 else assert.deepEqual(p.writes,{actors:0,items:0,journals:0,settings:0});
};
for(const status of [tb2eCirclesShadowStatus(),tb2eScalesShadowStatus(),tb2eCreationShadowStatus()]){
 readOnly(status);assert.equal(status.coreReauditTargetedPhase,"M10D.18_P3.5");
 assert.equal(status.fullDomainReauditComplete,false);
 assert.equal(status.liveEnabled,false);
}
// DH61-62 — Circles Ob factor table and special enmity clause
const c=tb2eCirclesModel();readOnly(c);
assert.equal(c.test.completeObstacleFactorsAvailable,true);
assert.equal(c.test.factors.hirePersonnel.GUIDE,3);
const guide=tb2eCirclesFactorPlan({kind:"HIRE_PERSONNEL",personnel:"GUIDE"});
const magic=tb2eCirclesFactorPlan({kind:"HIRE_PERSONNEL",personnel:"MAGICIAN"});
readOnly(guide);readOnly(magic);
assert.equal(guide.obstacle,3);assert.equal(magic.obstacle,5);
const ally=tb2eCirclesFactorPlan({kind:"FIND_ALLY",position:"GOVERNMENT_OR_RULER",level:"HIGHER",attitude:"LOYAL"});
assert.equal(ally.obstacle,7);assert.deepEqual(ally.factors,{position:3,level:2,attitude:2});
assert.equal(tb2eCirclesFactorPlan({kind:"FIND_ALLY",position:"ADVENTURER",level:"LOWER",attitude:"WILLING_TO_LISTEN"}).obstacle,1);
assert.equal(tb2eCirclesFactorPlan({kind:"FIND_ALLY",position:"ADVENTURER",level:"UNKNOWN",attitude:"LOYAL"}).reasonCode,"UNKNOWN_CIRCLES_ALLY_FACTOR");
assert.equal(tb2eCirclesFactorPlan({kind:"HIRE_PERSONNEL",personnel:"DRAGON"}).reasonCode,"UNKNOWN_CIRCLES_PERSONNEL_FACTOR");
const enmity=tb2eCirclesTestOutcomePlan({outcome:"FAIL",failureConsequence:"ENMITY_CLAUSE"});
readOnly(enmity);assert.equal(enmity.targetFound,false);assert.equal(enmity.enemyFound,true);
assert.equal(enmity.enemyDispositionBonusSuccesses,3);
assert.deepEqual(enmity.enemyDispositionConflicts,["DRIVE_OFF","CONVINCE","CONVINCE_CROWD"]);
assert.equal(enmity.relationshipMutationCommitted,false);assert.equal(enmity.npcCreationCommitted,false);
const condition=tb2eCirclesTestOutcomePlan({outcome:"FAIL",failureConsequence:"CONDITION"});
assert.equal(condition.targetFound,true);assert.equal(condition.allyRecordPreview,false);
assert.equal(tb2eCirclesTestOutcomePlan({outcome:"FAIL",failureConsequence:"MAGIC"}).reasonCode,"UNSUPPORTED_CIRCLES_FAILURE_CONSEQUENCE");
assert.equal(tb2eStartingRelationshipsPlan({friend:true,parents:true,mentor:true,enemy:true,characterClass:"WARRIOR"}).reasonCode,"STARTING_RELATIONSHIP_OPTION_LIMIT_EXCEEDED");
// DH64 & SG62 — current actor Might and highest-of-team conflict comparison.
assert.equal(tb2ePlayerMightGoalPlan({goal:"CAPTURE",targetMight:4}).eligible,false);
const raised=tb2ePlayerMightGoalPlan({goal:"CAPTURE",actorMight:5,targetMight:5});
readOnly(raised);assert.equal(raised.eligible,true);assert.equal(raised.maxTargetMight,5);
assert.equal(tb2ePlayerMightGoalPlan({goal:"KILL",actorMight:5,targetMight:6}).eligible,true);
assert.equal(tb2ePlayerMightGoalPlan({goal:"DRIVE_OFF",actorMight:5,targetMight:8}).eligible,false);
assert.equal(tb2ePlayerMightGoalPlan({goal:"KILL",actorMight:0,targetMight:1}).reasonCode,"INVALID_ACTOR_MIGHT");
const group=tb2eGroupScaleComparisonPlan({scale:"MIGHT",teamRatings:[2,5,3],opponentRatings:[1,4]});
readOnly(group);assert.equal(group.teamHighest,5);assert.equal(group.opponentHighest,4);
assert.equal(group.difference,1);assert.equal(group.higherSide,"TEAM");
const social=tb2eGroupScaleComparisonPlan({scale:"PRECEDENCE",teamRatings:[0,2],opponentRatings:[4,1]});
assert.equal(social.teamHighest,2);assert.equal(social.opponentHighest,4);assert.equal(social.higherSide,"OPPONENT");
assert.equal(tb2eGroupScaleComparisonPlan({scale:"MIGHT",teamRatings:[],opponentRatings:[3]}).reasonCode,"INVALID_GROUP_SCALE_RATINGS");
assert.equal(tb2ePrecedenceEligibilityPlan({action:"CONVINCE",actorPrecedence:0,targetPrecedence:1}).eligible,false);
// DH26-27 — human will/health distribution min 2 max 6, total 8; no actor commit.
const creation=tb2eCreationModel();readOnly(creation);
for(const cls of ["MAGICIAN","THEURGE","WARRIOR"]){
 const valid=tb2eClassStockPlan({className:cls,will:2,health:6});
 readOnly(valid);assert.equal(valid.ok,true);
 assert.equal(valid.abilitiesAuthority,"DH26_27_DISTRIBUTE_8_MIN_2_MAX_6");
 assert.equal(tb2eClassStockPlan({className:cls,will:1,health:7}).reasonCode,"INVALID_WILL_HEALTH_DISTRIBUTION");
 assert.equal(tb2eClassStockPlan({className:cls,will:0,health:8}).reasonCode,"INVALID_WILL_HEALTH_DISTRIBUTION");
}
assert.equal(creation.classRules.MAGICIAN.abilities.distribution.minEach,2);
assert.equal(creation.classRules.THEURGE.abilities.distribution.minEach,2);
const inventory=tb2eStartingEquipmentBoundaryPlan({className:"MAGICIAN"});
readOnly(inventory);assert.equal(inventory.completeGearCatalogSourceAvailable,true);
assert.equal(inventory.completeGearCatalogAvailable,false);
assert.equal(inventory.special.spellDescriptionsAuthority,"DH183_SOURCE_AVAILABLE_UNMAPPED");
const relics=tb2eStartingEquipmentBoundaryPlan({className:"THEURGE"});
assert.equal(relics.special.invocationDescriptionsAuthority,"DH209_SOURCE_AVAILABLE_UNMAPPED");
for(const file of ["module/m10d-tb2e-circles-shadow.mjs","module/m10d-tb2e-scales-shadow.mjs","module/m10d-tb2e-creation-shadow.mjs"]){
 const source=fs.readFileSync(file,"utf8");
 for(const banned of ["game.settings.set","Actor.create","Item.create","JournalEntry.create",
  "createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
 assert.equal(source.includes(banned),false,file+" unexpectedly has mutation "+banned);
}
assert.equal(JSON.stringify(ids.map(id=>resolveRulesProfile(id))),before);
console.log("PASS M10D.18 P3.5 Circles factors/Enmity, Might current/group max, creation Will/Health; read-only");
