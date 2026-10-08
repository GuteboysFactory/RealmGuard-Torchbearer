import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { tb2eClassStockPlan, tb2eCreationModel, tb2eCreationShadowStatus, tb2eDrivesPlan, tb2eFinalDetailsPlan, tb2eHomePlan, tb2eHumanUpbringingPlan, tb2eLevelOneBenefitPlan, tb2eNatureQuestionnairePlan, tb2eRelationshipsBoundaryPlan, tb2eSkillRedistributionPlan, tb2eSocialGracePlan, tb2eSpecialtyPlan, tb2eStartingEquipmentBoundaryPlan, tb2eStartingWisesPlan } from "../module/m10d-tb2e-creation-shadow.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));

const status=tb2eCreationShadowStatus();
assert.equal(status.phase,"M10D.15");assert.equal(status.mode,"TB2E_CHARACTER_CREATION_READ_ONLY_SHADOW");
assert.equal(status.sourceClassification,"PARTIAL");assert.equal(status.adapterReady,true);assert.equal(status.liveEnabled,false);
assert.equal(status.creationCommitAllowed,false);assert.equal(status.actorCreationAllowed,false);assert.deepEqual(status.writes,{actors:0,items:0,journals:0,settings:0});

const model=tb2eCreationModel();
assert.deepEqual(model.stocks,["DWARF","ELF","HALFLING","HUMAN"]);assert.equal(model.classes.length,6);
assert.equal(model.classRules.BURGLAR.stock,"HALFLING");assert.equal(model.classRules.RANGER.stock,"ELF");assert.equal(model.classRules.OUTCAST.stock,"DWARF");
assert.equal(model.resources.defaultStartingRating,0);assert.equal(model.level.starting,1);assert.equal(model.level.maximum,10);assert.equal(model.level.creedUnlock,3);

const burglar=tb2eClassStockPlan({className:"Burglar"});assert.equal(burglar.stock,"HALFLING");assert.equal(burglar.will,5);assert.equal(burglar.health,3);assert.equal(burglar.skills.FIGHTER,3);
const mage=tb2eClassStockPlan({className:"Magician",will:6,health:2});assert.equal(mage.stock,"HUMAN");assert.equal(mage.will,6);assert.equal(mage.health,2);
assert.equal(tb2eClassStockPlan({className:"Magician",will:7,health:1}).reasonCode,"INVALID_WILL_HEALTH_DISTRIBUTION");

const redistributed=tb2eSkillRedistributionPlan({className:"Warrior",proposedSkills:{Fighter:4,Hunter:2,Commander:3,Mentor:2,Rider:2}});
assert.equal(redistributed.ok,true);assert.equal(redistributed.baseTotal,13);assert.equal(redistributed.proposedTotal,13);
assert.equal(tb2eSkillRedistributionPlan({className:"Warrior",proposedSkills:{Fighter:4,Hunter:3,Commander:2,Mentor:2,Rider:1,Scout:1}}).reasonCode,"REDISTRIBUTION_CANNOT_ADD_NEW_SKILLS");

assert.equal(tb2eHumanUpbringingPlan({stock:"Human",skill:"Criminal",currentRating:0}).finalRating,3);
assert.equal(tb2eHumanUpbringingPlan({stock:"Human",skill:"Haggler",currentRating:3}).finalRating,4);
assert.equal(tb2eHumanUpbringingPlan({stock:"Elf",skill:"Haggler"}).reasonCode,"HUMAN_UPBRINGING_REQUIRES_HUMAN_STOCK");

const home=tb2eHomePlan({stock:"Elf",home:"Elfhome",skill:"Healer",trait:"Calm",currentSkillRating:0});
assert.equal(home.finalSkillRating,3);assert.equal(home.homeTraitLevelPreview,1);
assert.equal(tb2eHomePlan({stock:"Human",home:"Elfhome",skill:"Healer",trait:"Calm"}).reasonCode,"HOME_NOT_AVAILABLE_TO_STOCK");
assert.equal(tb2eSocialGracePlan({skill:"Orator",currentRating:2}).finalRating,3);
assert.equal(tb2eSpecialtyPlan({skill:"Scout",currentRating:0,alreadyTakenByParty:false}).finalRating,3);
assert.equal(tb2eSpecialtyPlan({skill:"Scout",alreadyTakenByParty:true}).reasonCode,"SPECIALTY_ALREADY_TAKEN_BY_PARTY");

const dwWises=tb2eStartingWisesPlan({stock:"Dwarf",stockWise:"Dwarven Chronicles",customWise:"Troll-wise"});
assert.deepEqual(dwWises.startingWises,["DWARVEN_CHRONICLES","Troll-wise"]);
const humanWises=tb2eStartingWisesPlan({stock:"Human",customWise:"Water-wise"});assert.deepEqual(humanWises.startingWises,["Water-wise"]);
assert.equal(tb2eStartingWisesPlan({stock:"Human",customWise:"Water-wise",secondCustomWise:"Troll-wise"}).reasonCode,"HUMAN_DOES_NOT_CHOOSE_SECOND_STARTING_WISE");

const dwarfNature=tb2eNatureQuestionnairePlan({stock:"Dwarf",answers:{q1:"Revenge",q2:"Dig Deeper",q3:"Spend Gold"}});
assert.equal(dwarfNature.startingNaturePreview,5);assert.equal(dwarfNature.resourcesPreview,1);
const elfNature=tb2eNatureQuestionnairePlan({stock:"Elf",answers:{q1:"Enchant",q2:"Retreat Hide",q3:"Struggle"},replacementTrait:"Curious"});
assert.equal(elfNature.startingNaturePreview,4);assert.ok(elfNature.descriptorsPreview.includes("ENCHANTING"));assert.equal(elfNature.homeTraitReplacement,"CURIOUS");
const humanNature=tb2eNatureQuestionnairePlan({stock:"Human",answers:{q1:"Prepare",q2:"Listen Elders",q3:"Fight"},secondWise:"Politics-wise",replacementTrait:"Defender"});
assert.equal(humanNature.startingNaturePreview,3);assert.equal(humanNature.classTraitLevelPreview,2);assert.equal(humanNature.wisePreview,"POLITICS_WISE");assert.equal(humanNature.homeTraitReplacement,"DEFENDER");

assert.equal(tb2eRelationshipsBoundaryPlan().delegatedAuthority,"M10D.13_CIRCLES_SHADOW");
const eqMage=tb2eStartingEquipmentBoundaryPlan({className:"Magician"});assert.equal(eqMage.special.spellBookRequired,true);assert.equal(eqMage.special.startingFirstCircleSpells,3);assert.equal(eqMage.special.selectionMethod,"ROLL_2D6_VISUAL_TABLE_NOT_TRANSCRIBED");
const eqTheurge=tb2eStartingEquipmentBoundaryPlan({className:"Theurge"});assert.equal(eqTheurge.special.minorRelics,2);assert.equal(eqTheurge.special.selectionMethod,"ROLL_3D6_VISUAL_TABLE_NOT_TRANSCRIBED");

const drives=tb2eDrivesPlan({belief:"Stand with my friends.",instinct:"Always keep the light lit.",goal:"I will find the gate.",level:3,creed:"No one is beyond hope."});
assert.equal(drives.creedUnlocked,true);assert.equal(drives.beliefPresent,true);assert.equal(drives.semanticValidationAuthority,"PLAYER_GM_MANUAL");

const rangerL1=tb2eLevelOneBenefitPlan({className:"Ranger"});assert.ok(rangerL1.benefits.includes("PLUS_1_CAMP_EVENT_WILDERNESS"));
const finalElf=tb2eFinalDetailsPlan({stock:"Elf",name:"Aelir",raiment:"Silver cloak",age:60});assert.equal(finalElf.freshConditionPreview,true);
assert.equal(tb2eFinalDetailsPlan({stock:"Elf",name:"Aelir",raiment:"Silver cloak",age:59}).reasonCode,"AGE_OUTSIDE_STOCK_RANGE");

assert.equal(JSON.stringify(existingIds.map(id=>resolveRulesProfile(id))),before);
const source=fs.readFileSync("module/m10d-tb2e-creation-shadow.mjs","utf8");
for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]) assert.equal(source.includes(forbidden),false);
console.log("PASS M10D.15 TB2E Character Creation bounded completion · class/stock · redistribution · upbringing/home · graces/specialty/wises · Nature questionnaire · equipment/drives/level1/final details · zero writes");
