import assert from "node:assert/strict";
import {tb2eSkillIndex} from "../module/m10d18-tb2e-package-a-skill-index.mjs";
import {tb2eNumericalFactorCatalogueStatus as status,tb2eNumericalFactorEntry as entry,
 tb2eNumericalFactorObstaclePlan as plan,tb2eNumericalFactorFormulaPlan as formula} from "../module/m10d18-tb2e-package-a-factor-values.mjs";
const idx=tb2eSkillIndex(), meta=status();
assert.equal(meta.skillCount,33);
assert.ok(meta.tableCount>=55);
assert.equal(meta.fullSourceToRuntimeParity,false);
assert.equal(entry({skillName:"Laborer",tableName:"hauling"}).sourcePage,167);
assert.equal(entry({skillName:"Scholar",tableName:"knowledge"}).sourcePage,173);
assert.equal(entry({skillName:"Hunter",tableName:"trapping"}).sourcePage,166);
assert.deepEqual(idx.skillNames.slice().sort(),meta.skillNames.slice().sort());
const sourceEntries=idx.skillNames;
for(const skillName of sourceEntries){
 assert.ok(["FIXED","FORMULA","VERSUS","DEFERRED"].includes(entry({skillName,tableName:({Alchemist:"process",Arcanist:"spells",Armorer:"armor",Carpenter:"boats",Cartographer:"map",Commander:"command",Cook:"meals",Criminal:"crime",Dungeoneer:"delve",Fighter:"brawl",Haggler:"market",Healer:"healing",Hunter:"stalking",Laborer:"labor", "Lore Master":"lore",Manipulator:"intimidate",Mentor:"teaching",Orator:"sway",Pathfinder:"journey",Peasant:"field",Persuader:"influence",Rider:"mounted",Ritualist:"officiant",Sailor:"sailing",Sapper:"tunnel",Scavenger:"scavenging",Scholar:"scholarly",Scout:"search",Stonemason:"building",Steward:"legal",Survivalist:"camp",Theologian:"immortal",Weaver:"weaving"})[skillName]}).table.kind));
}
const checks=[["Alchemist","process",{"process":"purify","duration":"one_test"},1],["Armorer","armor",{"craft":"helmet"},2],["Carpenter","boats",{"boat":"raft"},2],["Cartographer","map",{"area":"small","information":"surveyed"},2],["Commander","command",{"experience":"veteran","order":"march"},1],["Cook","meals",{"ingredients":"fresh","amount":"one"},1],["Criminal","crime",{"locks":"simple"},1],["Dungeoneer","delve",{"terrain":"slope","people":"one"},1],["Haggler","market",{"settlement":"crossroads"},2],["Healer","healing",{"treatment":"bruise"},2],["Hunter","stalking",{"habits":"trails","rarity":"common"},2],["Laborer","labor",{"activity":"gather_wood_extra_pack"},1],["Lore Master","lore",{"ephemera":"folklore"},1],["Pathfinder","journey",{"destination":"nearby","route":"well_traveled"},2],["Peasant","field",{"work":"herding","season":"summer"},1],["Rider","mounted",{"training":"war","conflict":"flee_pursue"},1],["Ritualist","officiant",{"ritual":"wedding"},1],["Sailor","sailing",{"craft":"skeid_karve","waters":"known","season":"summer","weather":"calm"},2],["Sapper","tunnel",{"type":"crawlway","length":"short","material":"earth"},2],["Scavenger","scavenging",{"item":"material","location":"near_town","rarity":"common"},1],["Scholar","scholarly",{"read":"journals_letters"},1],["Scout","search",{"size":"large","location":"known"},2],["Steward","legal",{"law":"sumptuary","settlement":"steading"},1],["Stonemason","building",{"complexity":"simple","size":"small"},2],["Survivalist","camp",{"terrain":"near_town","group":"small","amenity":["shelter","water","concealment"]},3],["Theologian","immortal",{"entity":"young","action":"gratitude"},2],["Weaver","weaving",{"type":"net","style":"plain"},1]];
const safe=o=>{assert.equal(o.liveApplication,false);assert.equal(o.writesPlanned,0);assert.equal(o.rollExecuted,false);assert.equal(o.actorWrite,false);};
for(const [skillName,tableName,selections,obstacle] of checks){
 const r=plan({skillName,tableName,selections,gmAuthorized:true});
 safe(r);assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.obstacle,obstacle,skillName);
 assert.equal(r.sourceFactorCatalogueLookup,true);
}
const fail=[
 [plan({skillName:"Cook",tableName:"meals",selections:{ingredients:"fresh",amount:"one"}}),"GM_SOURCE_SELECTION_REQUIRED"],
 [plan({skillName:"Cook",tableName:"meals",selections:{ingredients:"fresh",fish:"wild"},gmAuthorized:true}),"UNSOURCED_FACTOR_CATEGORY"],
 [plan({skillName:"Cook",tableName:"meals",selections:{},gmAuthorized:true}),"EXACTLY_ONE_PRIMARY_FACTOR_REQUIRED"],
 [plan({skillName:"Armorer",tableName:"weapons",selections:{hand_weapon:"dagger_axe",polearm:"spear_lance"},gmAuthorized:true}),"EXACTLY_ONE_PRIMARY_FACTOR_REQUIRED"],
 [plan({skillName:"Fighter",tableName:"brawl",gmAuthorized:true}),"VERSUS_TEST_REQUIRED"],
 [plan({skillName:"Arcanist",tableName:"spells",gmAuthorized:true}),"EXTERNAL_RULE_ENTRY_REQUIRED"],
 [plan({skillName:"Rider",tableName:"training",gmAuthorized:true}),"SPECIAL_FACTOR_FORMULA_REQUIRED"],
 [plan({skillName:"Sailor",tableName:"sailing",selections:{craft:"drakar_cog",waters:"ocean"},gmAuthorized:true}),"INVALID_FACTOR_CHOICE"],
 [plan({skillName:"Survivalist",tableName:"camp",selections:{terrain:"dungeon",amenity:["shelter","shelter"]},gmAuthorized:true}),"DUPLICATE_FACTOR_CHOICE"],
 [plan({skillName:"Cook",tableName:"bogus",gmAuthorized:true}),"UNKNOWN_FACTOR_TABLE"]
];
for(const [x,reason] of fail){safe(x);assert.equal(x.reasonCode,reason,JSON.stringify(x));}
const dynamic=[
 [{skillName:"Mentor",tableName:"teaching",studentNature:4},4],
 [{skillName:"Rider",tableName:"training",beastNature:3,use:"war"},6],
 [{skillName:"Laborer",tableName:"carrying",extraSlots:3},3],
 [{skillName:"Sapper",tableName:"setTrap",trap:"pit",material:"stone"},3],
 [{skillName:"Sapper",tableName:"setTrap",trap:"tripwire"},2],
 [{skillName:"Scholar",tableName:"scribe",highestSpellScribingObstacle:3,spellCount:2},4]
];
for(const [opts,ob] of dynamic){const x=formula({...opts,gmAuthorized:true});safe(x);assert.equal(x.ok,true,JSON.stringify(x));assert.equal(x.obstacle,ob);}
const scribing=formula({skillName:"Scholar",tableName:"scribe",
 highestSpellScribingObstacle:6,spellCount:3,gmAuthorized:true});
safe(scribing);assert.equal(scribing.obstacle,8);
assert.equal(formula({skillName:"Scholar",tableName:"scribe",highestSpellCircle:6,spellCount:3,gmAuthorized:true}).reasonCode,
 "SOURCE_SCRIBING_OBSTACLE_AND_COUNT_REQUIRED");

for(const [opts,reason] of [
 [{skillName:"Mentor",tableName:"teaching",studentNature:0},"STUDENT_NATURE_REQUIRED"],
 [{skillName:"Sapper",tableName:"setTrap",trap:"pit"},"PIT_MATERIAL_FACTOR_REQUIRED"],
 [{skillName:"Sapper",tableName:"setTrap",trap:"tripwire",material:"stone"},"MATERIAL_ONLY_FOR_PIT"],
 [{skillName:"Rider",tableName:"training",beastNature:3,use:"unknown"},"INVALID_RIDER_USE"],
 [{skillName:"Scholar",tableName:"scribe",highestSpellScribingObstacle:3,spellCount:0},"SOURCE_SCRIBING_OBSTACLE_AND_COUNT_REQUIRED"],
 [{skillName:"Weaver",tableName:"weaving"},"NOT_A_SPECIAL_FACTOR_FORMULA"]
]){const x=formula({...opts,gmAuthorized:true});safe(x);assert.equal(x.reasonCode,reason,JSON.stringify(x));}
console.log("PASS M10D.18 Paket A DH160-176: 33 skills, "+meta.tableCount+" source factor tables; GM keys, dynamic formulas, special/deferred routes and zero writes");
