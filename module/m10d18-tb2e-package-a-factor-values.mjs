import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";

// Compact numerical factor choice metadata from Dungeoneer's Handbook,
// printed pp.160-176. A numeric choice is only a possible GM selection;
// actors and the live dice system are NEVER inspected or changed.
// Table kind: FIXED (one main/optional + factors), VERSUS (no Ob),
// FORMULA (external value), DEFERRED (source elsewhere).
// Columns beginning with '+' in the book have additive:true.
// Independent columns are alternative primary Ob options.
const C=(id,additive,values,repeatable=false)=>({id,additive,repeatable,
  choices:values.map(([key,value])=>({key,value}))});
const F=(...columns)=>({kind:"FIXED",columns});
const V=(reference)=>({kind:"VERSUS",reference});
const D=(reference)=>({kind:"DEFERRED",reference});
const X=(formula,columns=[])=>({kind:"FORMULA",formula,columns});

export const TB2E_SKILL_FACTOR_VALUES=freezeTb2e({
 "Alchemist":{
   vapors:F(C("condition",false,[["afraid",1],["angry",2],["exhausted",3],["sick",4]]),C("duration",true,[["one_test",0],["until_recovered",1]])),
   elixirs:F(C("condition",false,[["afraid",1],["angry",2],["exhausted",3]]),C("relief",true,[["one_test",0],["counts_as_recovery",1]])),
   process:F(C("process",false,[["purify",1],["distill_or_dye",2],["magnetize_or_crystallize",3]]),C("duration",true,[["one_test",0],["one_turn",1],["phase",3]])),
   explosives:F(C("substance",false,[["flash_smoke_fireworks",1],["incendiary",2],["explosive",3]]),C("charges",true,[["one_test",0],["skill_rating_charges",1]]),C("effect",true,[["plus_one_die",1],["plus_one_success_weapon",2],["plus_one_might",3]]))
 },
 "Arcanist":{spells:D("SPELL_ENTRY_ARCANA")},
 "Armorer":{
   weapons:F(C("hand_weapon",false,[["dagger_axe",1],["mace_battleaxe",2],["flail_sword_warhammer",3]]),C("polearm",false,[["spear_lance",1],["halberd",2],["great_sword",3]]),C("missile",false,[["sling",1],["bow",2],["crossbow",3]])),
   armor:F(C("craft",false,[["shield_leather",1],["helmet",2],["chain",3],["plate",4]]),C("repair",false,[["helmet",1],["chain",2],["plate",3]]))
 },
 "Carpenter":{
   carpenter:F(C("woodworking",false,[["cup_board",1],["pulley_furniture",2],["shack",3],["small_house_bridge",4],["long_house",5]])),
   boats:F(C("boat",false,[["raft",2],["skiff",3],["faering",4]]))
 },
 "Cartographer":{map:F(C("area",false,[["small",1],["medium",2],["large",3]]),C("information",true,[["surveyed",1],["notes",2],["word_of_mouth",3]]))},
 "Commander":{command:F(C("experience",false,[["veteran",1],["experienced",2],["trained",3],["untrained",4]]),C("order",true,[["march",0],["superior_foe",1],["stand_or_fall_back",2],["prevent_rout",3]]))},
 "Cook":{
   meals:F(C("ingredients",false,[["fresh",1],["preserved_game",2],["forage",3],["rotten",4]]),C("amount",true,[["one",0],["small_group",1],["large_group",2]])),
   preserve:F(C("rations",false,[["one",1],["two",2],["four",3],["eight",4],["sixteen",5],["thirty_two",6]]))
 },
 "Criminal":{
   crime:F(C("locks",false,[["simple",1],["decent_or_rusted_simple",2],["rusted_decent",3],["complex",4],["rusted_complex",5],["masterwork",6]]),C("counterfeit",false,[["clipping",1],["simple_die",2],["complex_die",3],["coins",4],["simple_print",5],["complex_print",6]]),C("escape",false,[["leather",1],["rope",2],["metal",3]])),
   versus:V("CRIMINAL_VS_CRIMINAL")
 },
 "Dungeoneer":{
   delve:F(C("terrain",false,[["slope",1],["vertical",2],["squeeze",3],["flooded",4],["flooded_current",5]]),C("people",true,[["one",0],["two",1],["small_group",2]])),
   detect:F(C("detail",false,[["air",1],["slope",2],["direction",3]]))
 },
 "Fighter":{brawl:V("FIGHTER_VS_FIGHTER_OR_BL_HEALTH")},
 "Haggler":{market:F(C("settlement",false,[["crossroads",2],["bastion_remote_dwarven",3],["metropolis_tower",4],["elfhome",5]]))},
 "Healer":{
   healing:F(C("treatment",false,[["bruise",2],["broken_bone",3],["illness_burn",4],["virulent_disease",5],["poison",6]])),
   poultice:F(C("condition",false,[["exhausted",1],["afraid",2],["injured",3],["sick",4],["angry",5]]))
 },
 "Hunter":{
   ambush:V("HUNTER_VS_BEAST_NATURE"),
   stalking:F(C("habits",false,[["trails",1],["food_prey",2],["weapons_nests",3]]),C("rarity",true,[["common",1],["rare_shy",2],["exotic_magical",3]])),
   trapping:F(C("trap",false,[["snares_nets",1],["pit",2],["deadfall",3]]),C("prey",true,[["small",1],["human_sized",2],["large",3],["massive",4],["giant",5]]))
 },
 "Laborer":{
   labor:F(C("activity",false,[["gather_wood_extra_pack",1],["haul_water_dig",2],["stable_rock",3],["cart_mine",4]])),
   carrying:X("ZERO_PLUS_ONE_PER_EXTRA_SLOT",[
     C("base",false,[["hands_full_two_carried",0]]),
     C("extra_slot",true,[["one_slot",1]],true)
   ]),
   hauling:F(C("item",false,[["lamps",1],["chests",2],["rugs_bodies",3],["wardrobes",4],["pianos_paintings",5],["glass_mirrors",6],["thrones",7],["statues",8],["wall_panels",9],["columns",10]]))
 },
 "Lore Master":{
   lore:F(C("ephemera",false,[["folklore",1],["curses",2],["enchanted_places",3],["arcane_symbols",4]])),
   aura:F(C("vision",false,[["spell",1],["invocation",2],["potion_scroll",3],["weapon_armor",4]])),
   memorization:D("SPELL_ENTRY_MEMORY")
 },
 "Manipulator":{intimidate:V("MANIPULATOR_VS_MANIPULATOR_OR_BL_WILL"),bluff:V("MANIPULATOR_VS_PERSUADER_HAGGLER_MANIPULATOR")},
 "Mentor":{teaching:X("STUDENT_CURRENT_NATURE")},
 "Orator":{sway:V("ORATOR_VS_ORATOR_OR_CROWD_BL_WILL")},
 "Pathfinder":{journey:F(C("destination",false,[["nearby",1],["short",2],["long",3],["remote",4]]),C("route",true,[["well_traveled",1],["infrequent",2],["overgrown",3],["new_trail",4]]))},
 "Peasant":{
   field:F(C("work",false,[["herding",1],["ditches_harvest",2],["calving",3]]),C("season",true,[["summer",0],["autumn",1],["spring",2],["winter",3]])),
   mending:F(C("repair",false,[["clothing",1],["fences_tools",2],["wheels_axles",3],["huts",4],["friendships",5]])),
   truth:F(C("complain",false,[["taxes",1],["spouses_weather",2],["priests",3],["neighbors",4],["complaining",5]]))
 },
 "Persuader":{influence:V("PERSUADER_VS_PERSUADER_MANIPULATOR_OR_BL_WILL")},
 "Rider":{
   training:X("BEAST_NATURE_PLUS_USE",[C("use",true,[["domestication",1],["riding",2],["war",3]])]),
   mounted:F(C("training",false,[["war",1],["riding",2],["untrained",3]]),C("conflict",true,[["flee_pursue",0],["capture",1],["kill_driveoff",2]]))
 },
 "Ritualist":{officiant:F(C("ritual",false,[["wedding",1],["coming_of_age",2],["funeral",3],["consecration",4]])),invocations:D("INVOCATION_ENTRY")},
 "Sailor":{sailing:F(C("craft",false,[["skeid_karve",1],["raft_skiff",2],["knarr",3],["drakar_cog",4]]),C("waters",true,[["known",0],["charted",1],["uncharted",3]]),C("season",true,[["summer",0],["spring",1],["fall",2],["winter",3]]),C("weather",true,[["calm",1],["winds_rain_fog",2],["storms",3],["ragnarok",4]]))},
 "Sapper":{
   tunnel:F(C("type",false,[["crawlway",1],["shaft",2],["tunnel",3]]),C("length",true,[["short",1],["long",2]]),C("material",true,[["earth",0],["clay",1],["stone",2],["sand",3]])),
   setTrap:X("PIT_REQUIRES_MATERIAL_FACTOR",[C("trap",false,[["pit",1],["tripwire",2],["deadfall",3],["spear",4],["gas",5],["explosive",6]]),C("material",true,[["earth",0],["clay",1],["stone",2],["sand",3]])]),
   disarm:F(C("trap",false,[["tripwire_pit",1],["false_floor",2],["pressure_plate",3],["multipart",4],["explosive",5],["sigil_rune",6]]))
 },
 "Scavenger":{
   scavenging:F(C("item",false,[["material",1],["tools_gear",2],["weapons",3],["loot",4]]),C("location",true,[["near_town",0],["dungeon",1],["ruins",2],["wilderness",3]]),C("rarity",true,[["common",0],["unusual",1],["rare",2]])),
   foraging:F(C("terrain",false,[["fields_forest",1],["ruins",2],["near_town",3],["dungeons",4],["wasteland",5]]),C("amount",true,[["one",0],["two",1],["three",2]]))
 },
 "Scholar":{
   scholarly:F(C("read",false,[["journals_letters",1],["inscriptions",2],["histories",3],["playtest_docs",4]]),C("write",false,[["copy_inscriptions",1],["directions",2],["essays_letters",3],["memoirs",4]])),
   scribe:X("HIGHEST_CIRCLE_SPELL_SCRIBING_OB_PLUS_ONE_PER_ADDITIONAL"),
   knowledge:F(C("subject",false,[["misconceptions",1],["superficial",2],["expertise",3],["comprehensive",4],["complete",5]]),C("area",false,[["geography",1],["recent",2],["lineages",3],["ancient",4],["obscure",5]]))
 },
 "Scout":{
   stealth:V("SCOUT_VS_SCOUT_NATURE_OR_BL_WILL"),
   search:F(C("size",false,[["large",1],["moderate",2],["small",3],["tiny",4]]),C("location",true,[["known",1],["roughly_known",2],["guessed",3]])),
   traps:F(C("concealment",false,[["obvious",2],["concealed",3],["subtle",4],["devious",5]]))
 },
 "Steward":{
   steward:F(C("task",false,[["books_logs",1],["rents",2],["budgets",3],["projects",4],["fetes",5]]),C("settlement",true,[["base",0],["steading",1],["village_tower",2],["fortress_bastion",3],["crossroads_town",4],["port",5],["metropolis",6]])),
   legal:F(C("law",false,[["sumptuary",1],["religious",2],["criminal",3],["civil",4]]),C("settlement",true,[["steading",0],["village",1],["fortress_tower",2],["crossroads_port",3],["town_bastion",4],["metropolis",5]]))
 },
 "Stonemason":{
   building:F(C("complexity",false,[["simple",1],["moderate",2],["arch",3],["reinforced",4]]),C("size",true,[["small",1],["moderate",2],["large",3]])),
   survey:F(C("quality",false,[["age",1],["sturdiness",2],["maker",3]]))
 },
 "Survivalist":{
   camp:F(C("terrain",false,[["near_town",0],["ruins",1],["wild_caves",2],["dungeon",3],["wasteland",4]]),C("group",true,[["small",0],["large",1],["company",2]]),C("amenity",true,[["shelter",1],["water",1],["concealment",1]],true)),
   action:F(C("emergency",false,[["shelter_water",1],["fire",2],["tool",3],["boat",4]]),C("weather_wait",false,[["rain_fog",2],["snow_wind",3],["storm",4],["blizzard",5],["apocalyptic",6]]))
 },
 "Theologian":{
   immortal:F(C("entity",false,[["young",1],["spirit",2],["old",3],["ancient",4],["jotunn",5]]),C("action",true,[["gratitude",1],["favor",2],["propitiate",3]])),
   theology:F(C("doctrine",false,[["common",1],["obscure",2],["foreign",3],["secret",4]]),C("cosmology",false,[["near",2],["middle",3],["far",4]]))
 },
 "Weaver":{weaving:F(C("type",false,[["net",1],["basket_hat",2],["cloak_blanket",3],["clothing_basket",4],["tapestry",5]]),C("style",true,[["plain",0],["ornamental",1],["fashionable",2],["stunning",3]]))}
});

const FACTOR_PAGE_BY_SKILL=freezeTb2e({
 "Alchemist":160,"Arcanist":161,"Armorer":161,"Carpenter":161,
 "Cartographer":162,"Commander":162,"Cook":163,"Criminal":163,
 "Dungeoneer":164,"Fighter":164,"Haggler":165,"Healer":165,
 "Hunter":166,"Laborer":166,"Lore Master":167,"Manipulator":167,
 "Mentor":168,"Orator":168,"Pathfinder":168,"Peasant":169,
 "Persuader":169,"Rider":170,"Ritualist":170,"Sailor":171,
 "Sapper":171,"Scavenger":172,"Scholar":172,"Scout":173,
 "Steward":174,"Stonemason":174,"Survivalist":175,
 "Theologian":176,"Weaver":176
});
const FACTOR_TABLE_PAGE_OVERRIDE=freezeTb2e({
 "Laborer":{hauling:167},
 "Scholar":{knowledge:173}
});

const safe=data=>freezeTb2e({phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
 mode:"READ_ONLY_SHADOW",sourceEvidence:"Dungeoneer's Handbook pp.160-176",
 writesPlanned:0,liveApplication:false,rollExecuted:false,
 actorWrite:false,itemWrite:false,resourceSpendCommitted:false,...data});
const deny=(reasonCode,details={})=>safe({ok:false,reasonCode,...details});
export function tb2eNumericalFactorCatalogueStatus(){
 const skills=Object.keys(TB2E_SKILL_FACTOR_VALUES);
 return safe({ok:true,skillCount:skills.length,skillNames:skills,
   tableCount:skills.reduce((n,k)=>n+Object.keys(TB2E_SKILL_FACTOR_VALUES[k]).length,0),
   tableCoverage:"DH_160_176_STRUCTURED_VALUES",
   specialFormulasAndVersusRequireContext:true,
   sourceIsNotActorEntitlement:true,
   fullSourceToRuntimeParity:false});
}
export function tb2eNumericalFactorEntry({skillName="",tableName=""}={}){
 const skill=Object.keys(TB2E_SKILL_FACTOR_VALUES).find(n=>n.toLowerCase()===String(skillName??"").trim().toLowerCase());
 if(!skill)return deny("UNKNOWN_SKILL");
 const table=Object.keys(TB2E_SKILL_FACTOR_VALUES[skill]).find(n=>n.toLowerCase()===String(tableName??"").trim().toLowerCase());
 if(!table)return deny("UNKNOWN_FACTOR_TABLE",{availableTables:Object.keys(TB2E_SKILL_FACTOR_VALUES[skill])});
 return safe({ok:true,skillName:skill,tableName:table,table:TB2E_SKILL_FACTOR_VALUES[skill][table],sourcePage:FACTOR_TABLE_PAGE_OVERRIDE[skill]?.[table]??FACTOR_PAGE_BY_SKILL[skill]});
}
/** GM-confirmed, strictly keyed numeric factor preview. The key names do
 * not select fiction, equipment, action legality or conflict routing.
 * Formula & Versus are intentionally delegated to the named external source.
 */
export function tb2eNumericalFactorObstaclePlan({skillName="",tableName="",selections={},gmAuthorized=false,gmExcludedAdditives=[],exclusionReason=""}={}){
 const entry=tb2eNumericalFactorEntry({skillName,tableName});
 if(!entry.ok)return entry;
 if(gmAuthorized!==true)return deny("GM_SOURCE_SELECTION_REQUIRED");
 const table=entry.table;
 if(table.kind==="VERSUS")return deny("VERSUS_TEST_REQUIRED",{versusReference:table.reference});
 if(table.kind==="DEFERRED")return deny("EXTERNAL_RULE_ENTRY_REQUIRED",{externalReference:table.reference});
 if(table.kind==="FORMULA")return deny("SPECIAL_FACTOR_FORMULA_REQUIRED",{formula:table.formula});
 if(!selections||typeof selections!=="object"||Array.isArray(selections))return deny("INVALID_FACTOR_SELECTION");
 const ids=table.columns.map(c=>c.id);
 if(Object.keys(selections).some(id=>!ids.includes(id)))return deny("UNSOURCED_FACTOR_CATEGORY");
 const primary=table.columns.filter(c=>!c.additive);
 const chosenPrimary=primary.filter(c=>Object.prototype.hasOwnProperty.call(selections,c.id));
 if(chosenPrimary.length!==1)return deny("EXACTLY_ONE_PRIMARY_FACTOR_REQUIRED");
 let ob=0;const matched=[];
 for(const column of table.columns){
   const selected=selections[column.id];
   if(selected===undefined)continue;
   const keys=Array.isArray(selected)?selected:[selected];
   if(!keys.length||(!column.repeatable&&keys.length!==1))
     return deny("INVALID_CATEGORY_SELECTION");
   if(new Set(keys).size!==keys.length)return deny("DUPLICATE_FACTOR_CHOICE");
   for(const key of keys){
     const choice=column.choices.find(c=>c.key===key);
     if(!choice)return deny("INVALID_FACTOR_CHOICE",{category:column.id,choice:key});
     ob+=choice.value;matched.push({category:column.id,choice:key,value:choice.value});
   }
 }
 return safe({ok:true,skillName:entry.skillName,tableName:entry.tableName,
  obstacle:ob,chosenFactors:matched,factorsSelectedBy:"GM",sourceFactorCatalogueLookup:true,
  obstacleWrite:false,requiresGMFictionJudgment:true});
}


/** Explicit non-table DH formulas; no implicit actor/nature lookups. */
export function tb2eNumericalFactorFormulaPlan({skillName="",tableName="",
  gmAuthorized=false,studentNature=null,beastNature=null,use="",
  extraSlots=null,trap="",material="",highestSpellScribingObstacle=null,spellCount=null}={}){
 const entry=tb2eNumericalFactorEntry({skillName,tableName});
 if(!entry.ok)return entry;
 if(gmAuthorized!==true)return deny("GM_SOURCE_SELECTION_REQUIRED");
 if(entry.table.kind!=="FORMULA")return deny("NOT_A_SPECIAL_FACTOR_FORMULA");
 const id=entry.table.formula;
 const whole=(v,min=0,max=100)=>Number.isInteger(v)&&v>=min&&v<=max;
 let obstacle=null,inputs={};
 if(id==="STUDENT_CURRENT_NATURE"){
   if(!whole(studentNature,1,7))return deny("STUDENT_NATURE_REQUIRED");
   obstacle=studentNature;inputs={studentNature};
 }else if(id==="BEAST_NATURE_PLUS_USE"){
   if(!whole(beastNature,1,7))return deny("BEAST_NATURE_REQUIRED");
   const c=entry.table.columns[0].choices.find(c=>c.key===use);
   if(!c)return deny("INVALID_RIDER_USE");
   obstacle=beastNature+c.value;inputs={beastNature,use,useFactor:c.value};
 }else if(id==="ZERO_PLUS_ONE_PER_EXTRA_SLOT"){
   if(!whole(extraSlots,0,100))return deny("EXTRA_SLOTS_REQUIRED");
   obstacle=extraSlots;inputs={extraSlots,base:0};
 }else if(id==="PIT_REQUIRES_MATERIAL_FACTOR"){
   const pit=entry.table.columns[0].choices.find(c=>c.key===trap);
   if(!pit)return deny("INVALID_SAPPER_TRAP");
   const selected=entry.table.columns[1].choices.find(c=>c.key===material);
   if(trap==="pit"&&!selected)return deny("PIT_MATERIAL_FACTOR_REQUIRED");
   if(trap!=="pit"&&material)return deny("MATERIAL_ONLY_FOR_PIT");
   obstacle=pit.value+(selected?.value??0);inputs={trap,material:trap==="pit"?material:null};
 }else if(id==="HIGHEST_CIRCLE_SPELL_SCRIBING_OB_PLUS_ONE_PER_ADDITIONAL"){
   if(!whole(highestSpellScribingObstacle,1,100)||!whole(spellCount,1,100))
     return deny("SOURCE_SCRIBING_OBSTACLE_AND_COUNT_REQUIRED");
   obstacle=highestSpellScribingObstacle+(spellCount-1);inputs={highestSpellScribingObstacle,spellCount};
 }else return deny("UNMAPPED_SPECIAL_FORMULA",{formula:id});
 return safe({ok:true,skillName:entry.skillName,tableName:entry.tableName,formula:id,
   obstacle,formulaInputs:inputs,factorsSelectedBy:"GM",
   sourceFactorCatalogueLookup:true,requiresGMFictionJudgment:true,
   obstacleWrite:false});
}
