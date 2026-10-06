import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eCirclesModel, tb2eCirclesObstacleBoundaryPlan, tb2eCirclesReputationPlan, tb2eCirclesShadowStatus, tb2eCirclesTestOutcomePlan, tb2eRelationshipEvolutionPlan, tb2eRelationshipLodgingPlan, tb2eStartingRelationshipsPlan } from "../module/m10d-tb2e-circles-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eCirclesShadowStatus();
assert.equal(status.phase,"M10D.13");assert.equal(status.mode,"TB2E_CIRCLES_RELATIONSHIPS_READ_ONLY_SHADOW");
assert.equal(status.sourceClassification,"PARTIAL");assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);
assert.equal(status.npcCreationAllowed,false);assert.equal(status.relationshipMutationAllowed,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eCirclesModel();
assert.deepEqual(model.ability.ratingRange,{min:1,max:10});assert.equal(model.ability.primaryPhase,"TOWN");
assert.equal(model.test.completeObstacleFactorsAvailable,false);assert.equal(model.test.obstacleAuthority,"DG_FACTORS_UNAVAILABLE_DO_NOT_INFER");
assert.equal(model.test.success.futureAllySearchBonusDice,1);assert.equal(model.reputation.unlocksAtLevel,3);
assert.equal(model.startingRelationships.baseCircles,1);assert.equal(model.startingRelationships.maximumSelectedOptions,3);
assert.equal(model.startingRelationships.mentorLevel,7);assert.equal(model.startingRelationships.magicianMustHaveMentor,true);

const pass=tb2eCirclesTestOutcomePlan({outcome:"Pass"});
assert.equal(pass.targetFound,true);assert.equal(pass.allyRecordPreview,true);assert.equal(pass.futureAllySearchBonusDice,1);assert.equal(pass.npcCreationCommitted,false);
const fail=tb2eCirclesTestOutcomePlan({outcome:"Fail"});
assert.equal(fail.targetFound,true);assert.equal(fail.allyRecordPreview,false);assert.deepEqual(fail.consequenceOptions,["TWIST","CONDITION","POSSIBLE_ENEMY"]);assert.equal(fail.consequenceAuthority,"GM_MANUAL");

assert.equal(tb2eCirclesReputationPlan({level:2,inHometown:true}).hometownCirclesBonusDice,0);
assert.equal(tb2eCirclesReputationPlan({level:3,inHometown:true}).hometownCirclesBonusDice,1);
assert.equal(tb2eCirclesReputationPlan({level:5,inHometown:false}).hometownCirclesBonusDice,0);

const social=tb2eStartingRelationshipsPlan({friend:true,parents:true,mentor:false,enemy:true,characterClass:"Warrior",characterLevel:2,friendIsAdventurer:true});
assert.equal(social.ok,true);assert.equal(social.startingCirclesPreview,4);assert.equal(social.selectedRelationshipCount,3);
assert.equal(social.friendPreview.level,2);assert.equal(social.parentsPreview.freeHomeCandidate,true);
assert.equal(social.mentorPreview.alternative,"SELF_MADE_GOLD_POUCH");assert.equal(social.mentorPreview.treasureDice,2);assert.equal(social.mentorPreview.location,"BELT");
assert.equal(social.enemyPreview.level,3);assert.equal(social.enemyPreview.classAuthority,"GM");
assert.equal(social.circlesMutationCommitted,false);assert.equal(social.inventoryMutationCommitted,false);

const four=tb2eStartingRelationshipsPlan({friend:true,parents:true,mentor:true,enemy:true,characterClass:"Warrior",characterLevel:1});
assert.equal(four.ok,false);assert.equal(four.reasonCode,"STARTING_RELATIONSHIP_OPTION_LIMIT_EXCEEDED");
const magician=tb2eStartingRelationshipsPlan({friend:true,parents:true,mentor:false,enemy:false,characterClass:"Magician",characterLevel:1});
assert.equal(magician.ok,false);assert.equal(magician.reasonCode,"MAGICIAN_MUST_SELECT_MENTOR");

const loner=tb2eStartingRelationshipsPlan({friend:false,loner:true,characterClass:"Warrior",characterLevel:2,lonerTraitAlreadyOwned:true});
assert.equal(loner.ok,true);assert.equal(loner.startingCirclesPreview,1);assert.equal(loner.skipRemainingRelationshipQuestions,true);
assert.equal(loner.enemyPreview.level,3);assert.equal(loner.lonerTraitPreview.action,"INCREASE_BY_ONE_LEVEL");assert.equal(loner.traitMutationCommitted,false);
assert.equal(tb2eStartingRelationshipsPlan({friend:false,loner:true,parents:true,characterClass:"Warrior"}).reasonCode,"LONER_SKIPS_REMAINING_RELATIONSHIP_QUESTIONS");
assert.equal(tb2eStartingRelationshipsPlan({friend:false,loner:true,characterClass:"Magician"}).reasonCode,"LONER_MAGICIAN_COMBINATION_NOT_RECONCILED_BY_GUIDES");

const shift=tb2eRelationshipEvolutionPlan({from:"Friend",to:"Enemy"});assert.equal(shift.ok,true);assert.equal(shift.authority,"ROLEPLAY_GM_MANUAL");assert.equal(shift.relationshipMutationCommitted,false);
const lodging=tb2eRelationshipLodgingPlan({parentsInTown:false,friendInTown:true});assert.equal(lodging.freeHomeLodging,true);assert.equal(lodging.lodgingSource,"FRIEND_IN_TOWN");assert.equal(lodging.accommodationMutationCommitted,false);
const noHome=tb2eRelationshipLodgingPlan({parentsInTown:false,friendInTown:false});assert.equal(noHome.freeHomeLodging,false);

const obstacle=tb2eCirclesObstacleBoundaryPlan();assert.equal(obstacle.completeFactorsAvailable,false);assert.equal(obstacle.obstacle,null);assert.equal(obstacle.testExecutionAllowed,false);

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-circles-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.13 TB2E Circles/Relationships shadow · Circles outcomes · reputation · starting relationships · Loner boundary · lodging · source-incomplete factors · zero writes");
