import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const CREATION_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="creation");

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function int(value){return Number.isInteger(Number(value));}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.15",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

const CLASSES=freezeTb2e({
  BURGLAR:{stock:"HALFLING",abilities:{will:5,health:3,distribution:null},skills:{COOK:3,CRIMINAL:3,FIGHTER:3,HUNTER:2,SCOUT:2,SCAVENGER:2},trait:"HIDDEN_DEPTHS",weapons:{mode:"ANY_EXCEPT",excluded:["CROSSBOW","GREATSWORD","HALBERD","POLEARM"]},armorUse:["LEATHER_ARMOR","HELMET","SHIELD"],startingArmor:["LEATHER_ARMOR"]},
  MAGICIAN:{stock:"HUMAN",abilities:{will:null,health:null,distribution:{total:8,capEach:6}},skills:{ARCANIST:4,LORE_MASTER:3,ALCHEMIST:2,CARTOGRAPHER:2,SCHOLAR:2},trait:"WIZARDS_SIGHT",weapons:{mode:"ONLY",allowed:["DAGGER","STAFF"]},armorUse:[],startingArmor:[]},
  OUTCAST:{stock:"DWARF",abilities:{will:3,health:5,distribution:null},skills:{FIGHTER:4,DUNGEONEER:3,ARMORER:2,SAPPER:2,ORATOR:2,SCOUT:2},trait:"BORN_OF_EARTH_AND_STONE",weapons:{mode:"ANY_EXCEPT",excluded:["GREATSWORD"]},armorUse:["ANY"],startingArmor:["LEATHER_ARMOR"],optionalHelmetIfNoShield:true},
  RANGER:{stock:"ELF",abilities:{will:4,health:4,distribution:null},skills:{FIGHTER:3,PATHFINDER:3,SCOUT:3,HUNTER:2,LORE_MASTER:2,SURVIVALIST:2},trait:"FIRST_BORN",weapons:{mode:"ONLY",allowed:["SWORD","SPEAR","BOW","DAGGER"]},armorUse:["LEATHER_ARMOR","CHAIN_ARMOR","HELMET"],startingArmor:["LEATHER_ARMOR"]},
  THEURGE:{stock:"HUMAN",abilities:{will:null,health:null,distribution:{total:8,capEach:6}},skills:{FIGHTER:3,RITUALIST:3,ORATOR:3,HEALER:2,THEOLOGIAN:2},trait:"TOUCHED_BY_THE_GODS",weapons:{mode:"ANY_ONE_EXCEPT",excluded:["BOW","CROSSBOW"]},armorUse:["SHIELD"],startingArmor:[]},
  WARRIOR:{stock:"HUMAN",abilities:{will:null,health:null,distribution:{total:8,capEach:6}},skills:{FIGHTER:4,HUNTER:3,COMMANDER:2,MENTOR:2,RIDER:2},trait:"HEART_OF_BATTLE",weapons:{mode:"ANY"},armorUse:["ANY"],startingArmor:["LEATHER_ARMOR"],optionalHelmetIfNoShield:true}
});

const HOMES=freezeTb2e({
  ELFHOME:{stocks:["ELF"],skills:["HEALER","MENTOR","PATHFINDER"],traits:["CALM","QUIET"]},
  DWARVEN_HALLS:{stocks:["DWARF","ELF","HALFLING","HUMAN"],skills:["ARMORER","LABORER","STONEMASON"],traits:["CUNNING","FIERY"]},
  RELIGIOUS_BASTION:{stocks:["DWARF","ELF","HALFLING","HUMAN"],skills:["CARTOGRAPHER","SCHOLAR","THEOLOGIAN"],traits:["DEFENDER","SCARRED"]},
  BUSTLING_METROPOLIS:{stocks:["DWARF","ELF","HALFLING","HUMAN"],skills:["HAGGLER","SAILOR","STEWARD"],traits:["EXTRAVAGANT","JADED"]},
  WIZARDS_TOWER:{stocks:["DWARF","ELF","HALFLING","HUMAN"],skills:["ALCHEMIST","LORE_MASTER","SCHOLAR"],traits:["SKEPTICAL","THOUGHTFUL"]},
  REMOTE_VILLAGE:{stocks:["DWARF","ELF","HALFLING","HUMAN"],skills:["CARPENTER","PEASANT","WEAVER"],traits:["EARLY_RISER","ROUGH_HANDS"]},
  BUSY_CROSSROADS:{stocks:["DWARF","ELF","HALFLING","HUMAN"],skills:["COOK","HAGGLER","RIDER"],traits:["FOOLHARDY","QUICK_WITTED"]}
});

const HUMAN_UPBRINGING=["CRIMINAL","LABORER","HAGGLER","PATHFINDER","PEASANT","SURVIVALIST"];
const SOCIAL_GRACES=["HAGGLER","MANIPULATOR","ORATOR","PERSUADER"];
const SPECIALTIES=["CARTOGRAPHER","COOK","CRIMINAL","DUNGEONEER","HAGGLER","HEALER","HUNTER","MANIPULATOR","PATHFINDER","PERSUADER","ORATOR","RIDER","SAPPER","SCAVENGER","SCOUT","SURVIVALIST"];
const AGE_RANGES=freezeTb2e({DWARF:{min:30,max:51},ELF:{min:60,max:101},HALFLING:{min:26,max:31},HUMAN:{min:14,max:21}});
const BASE_NATURE=freezeTb2e({
  DWARF:["DELVING","CRAFTING","AVENGING_GRUDGES"],
  ELF:["SINGING","REMEMBERING","HIDING"],
  HALFLING:["SNEAKING","RIDDLING","MERRYMAKING"],
  HUMAN:["BOASTING","DEMANDING","RUNNING"]
});

export function tb2eCreationShadowStatus(){
  return freezeTb2e({
    phase:"M10D.15",mode:"TB2E_CHARACTER_CREATION_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:CREATION_ROW?.status??"PARTIAL",sourceEvidence:CREATION_ROW?.evidence??"CC 2-48; QR 8-26",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    creationCommitAllowed:false,actorCreationAllowed:false,itemCreationAllowed:false,grantApplicationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_EXECUTABLE_CHARACTER_CREATION_COMMIT",
      "NO_ACTOR_ITEM_OR_EMBEDDED_DOCUMENT_CREATION",
      "NO_AUTOMATIC_TRAIT_SKILL_WISE_GEAR_GRANTS",
      "NO_DG_TRAIT_EFFECT_INFERENCE",
      "NO_COMPLETE_GEAR_CATALOG_OR_VISUAL_TABLE_TRANSCRIPTION",
      "NO_SPELLBOOK_OR_RELIC_RANDOM_TABLE_EXECUTION",
      "NO_SPELL_OR_INVOCATION_EFFECT_INFERENCE",
      "RELATIONSHIPS_DELEGATED_TO_M10D_13_CIRCLES_SHADOW",
      "INVENTORY_PLACEMENT_DELEGATED_TO_M10D_10_INVENTORY_SHADOW",
      "NATURE_RUNTIME_DELEGATED_TO_M10D_5_NATURE_SHADOW"
    ],
    nextStep:"Verify bounded class/stock, skills, home, social graces, specialty, Wises, Nature questionnaire, creation boundaries, drives, level-1 benefits and final details previews only"
  });
}

export function tb2eCreationModel(){
  return freezeTb2e({
    phase:"M10D.15",profileId:PROFILE_ID,
    stocks:["DWARF","ELF","HALFLING","HUMAN"],
    classes:Object.keys(CLASSES),
    classRules:CLASSES,
    humanUpbringing:HUMAN_UPBRINGING,
    homes:HOMES,
    socialGraces:SOCIAL_GRACES,
    specialties:SPECIALTIES,
    wises:{
      DWARF:{stockChoices:["DWARVEN_CHRONICLES","SHREWD_APPRAISAL"],customSecond:true},
      ELF:{stockChoices:["ELVEN_LORE","FOLLY_OF_HUMANITY","FOLLY_OF_DWARVEN_KIND"],customSecond:true},
      HALFLING:{stockChoices:["HOME","NEEDS_A_LITTLE_SALT"],customSecond:true},
      HUMAN:{stockChoices:[],customFirst:true,customSecond:false}
    },
    nature:{startingRating:3,descriptors:BASE_NATURE},
    resources:{defaultStartingRating:0},
    relationshipsAuthority:"M10D.13_CIRCLES_SHADOW",
    inventoryAuthority:"M10D.10_INVENTORY_SHADOW",
    level:{starting:1,maximum:10,creedUnlock:3},
    ageRanges:AGE_RANGES,
    finalCondition:"FRESH",
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eClassStockPlan({className="",will=null,health=null}={}){
  const c=key(className),data=CLASSES[c];
  if(!data)return blocked("UNKNOWN_CLASS",{className:c});
  if(data.abilities.distribution){
    if(!int(will)||!int(health))return blocked("WILL_HEALTH_DISTRIBUTION_REQUIRED",{className:c,requiredTotal:8,capEach:6});
    const w=Number(will),h=Number(health);
    if(w<0||h<0||w>6||h>6||w+h!==8)return blocked("INVALID_WILL_HEALTH_DISTRIBUTION",{className:c,will:w,health:h,requiredTotal:8,capEach:6});
    return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"CLASS_STOCK_SHADOW",className:c,stock:data.stock,will:w,health:h,skills:data.skills,trait:data.trait,abilitiesAuthority:"PLAYER_DISTRIBUTES_8_CAP_6",actorMutationCommitted:false,itemMutationCommitted:false,liveApplication:false,writesPlanned:0});
  }
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"CLASS_STOCK_SHADOW",className:c,stock:data.stock,will:data.abilities.will,health:data.abilities.health,skills:data.skills,trait:data.trait,abilitiesAuthority:"FIXED_BY_CLASS",actorMutationCommitted:false,itemMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eSkillRedistributionPlan({className="",proposedSkills={}}={}){
  const c=key(className),data=CLASSES[c];
  if(!data)return blocked("UNKNOWN_CLASS",{className:c});
  if(!proposedSkills||typeof proposedSkills!=="object"||Array.isArray(proposedSkills))return blocked("INVALID_PROPOSED_SKILLS");
  const normalized={};
  for(const [name,value] of Object.entries(proposedSkills)) normalized[key(name)]=Number(value);
  const baseKeys=Object.keys(data.skills);
  const newSkills=Object.keys(normalized).filter(name=>!baseKeys.includes(name)&&Number(normalized[name])>0);
  if(newSkills.length)return blocked("REDISTRIBUTION_CANNOT_ADD_NEW_SKILLS",{newSkills});
  const values=Object.fromEntries(baseKeys.map(name=>[name,Number(normalized[name]??0)]));
  if(Object.values(values).some(v=>!Number.isInteger(v)||v<0||v>4))return blocked("REDISTRIBUTED_SKILL_RATING_OUT_OF_RANGE",{maximumRating:4});
  const baseTotal=Object.values(data.skills).reduce((a,b)=>a+b,0);
  const proposedTotal=Object.values(values).reduce((a,b)=>a+b,0);
  if(proposedTotal!==baseTotal)return blocked("REDISTRIBUTION_MUST_PRESERVE_TOTAL_SKILL_POINTS",{baseTotal,proposedTotal});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"SKILL_REDISTRIBUTION_SHADOW",className:c,baseTotal,proposedTotal,skills:values,maximumRating:4,newSkillsAllowed:false,skillMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

function raisedSkillPreview(currentRating){
  const n=Number(currentRating??0);
  if(!Number.isFinite(n)||n<0||n>4)return null;
  return n>=1?Math.min(4,n+1):3;
}

export function tb2eHumanUpbringingPlan({stock="HUMAN",skill="",currentRating=0}={}){
  const s=key(stock),sk=key(skill);
  if(s!=="HUMAN")return blocked("HUMAN_UPBRINGING_REQUIRES_HUMAN_STOCK",{stock:s});
  if(!HUMAN_UPBRINGING.includes(sk))return blocked("INVALID_HUMAN_UPBRINGING_SKILL",{skill:sk});
  const finalRating=raisedSkillPreview(currentRating);if(finalRating===null)return blocked("INVALID_CURRENT_SKILL_RATING",{currentRating});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"HUMAN_UPBRINGING_SHADOW",skill:sk,currentRating:Number(currentRating),finalRating,maximumRating:4,skillMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eHomePlan({stock="",home="",skill="",trait="",currentSkillRating=0}={}){
  const s=key(stock),h=key(home),sk=key(skill),tr=key(trait),data=HOMES[h];
  if(!["DWARF","ELF","HALFLING","HUMAN"].includes(s))return blocked("INVALID_STOCK",{stock:s});
  if(!data)return blocked("UNKNOWN_HOME",{home:h});
  if(!data.stocks.includes(s))return blocked("HOME_NOT_AVAILABLE_TO_STOCK",{stock:s,home:h});
  if(!data.skills.includes(sk))return blocked("INVALID_HOME_SKILL",{home:h,skill:sk});
  if(!data.traits.includes(tr))return blocked("INVALID_HOME_TRAIT",{home:h,trait:tr});
  const finalSkillRating=raisedSkillPreview(currentSkillRating);if(finalSkillRating===null)return blocked("INVALID_CURRENT_SKILL_RATING",{currentSkillRating});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"HOME_SHADOW",stock:s,home:h,skill:sk,trait:tr,currentSkillRating:Number(currentSkillRating),finalSkillRating,homeTraitLevelPreview:1,skillMaximumRating:4,skillMutationCommitted:false,traitMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eSocialGracePlan({skill="",currentRating=0}={}){
  const sk=key(skill);if(!SOCIAL_GRACES.includes(sk))return blocked("INVALID_SOCIAL_GRACE_SKILL",{skill:sk});
  const finalRating=raisedSkillPreview(currentRating);if(finalRating===null)return blocked("INVALID_CURRENT_SKILL_RATING",{currentRating});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"SOCIAL_GRACE_SHADOW",skill:sk,currentRating:Number(currentRating),finalRating,maximumRating:4,skillMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eSpecialtyPlan({skill="",currentRating=0,alreadyTakenByParty=false}={}){
  const sk=key(skill);if(!SPECIALTIES.includes(sk))return blocked("INVALID_SPECIALTY",{skill:sk});
  if(Boolean(alreadyTakenByParty))return blocked("SPECIALTY_ALREADY_TAKEN_BY_PARTY",{skill:sk});
  const finalRating=raisedSkillPreview(currentRating);if(finalRating===null)return blocked("INVALID_CURRENT_SKILL_RATING",{currentRating});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"SPECIALTY_SHADOW",skill:sk,currentRating:Number(currentRating),finalRating,maximumRating:4,underlineOnSheet:true,uniqueWithinParty:true,skillMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eStartingWisesPlan({stock="",stockWise="",customWise="",secondCustomWise=""}={}){
  const s=key(stock),sw=key(stockWise),cw=String(customWise??"").trim(),cw2=String(secondCustomWise??"").trim();
  const rules=tb2eCreationModel().wises[s];if(!rules)return blocked("INVALID_STOCK",{stock:s});
  if(s==="HUMAN"){
    if(!cw)return blocked("HUMAN_CUSTOM_WISE_REQUIRED");
    if(cw2)return blocked("HUMAN_DOES_NOT_CHOOSE_SECOND_STARTING_WISE");
    return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"STARTING_WISES_SHADOW",stock:s,startingWises:[cw],semanticSpecificityAuthority:"PLAYER_GM_MANUAL_NOT_TOO_GENERAL_OR_GAME_TERMS",wiseMutationCommitted:false,liveApplication:false,writesPlanned:0});
  }
  if(!rules.stockChoices.includes(sw))return blocked("INVALID_STOCK_WISE",{stock:s,stockWise:sw});
  if(!cw)return blocked("SECOND_CUSTOM_WISE_REQUIRED",{stock:s});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"STARTING_WISES_SHADOW",stock:s,startingWises:[sw,cw],semanticSpecificityAuthority:"PLAYER_GM_MANUAL_NOT_TOO_GENERAL_OR_GAME_TERMS",languageGrantBoundary:"SPECIFIC_GROUP_OF_PEOPLE_WISE_MAY_GRANT_LANGUAGE_BUT_NO_AUTOMATIC_GRANT",wiseMutationCommitted:false,languageMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eNatureQuestionnairePlan({stock="",answers={},replacementTrait="",secondWise=""}={}){
  const s=key(stock);if(!BASE_NATURE[s])return blocked("INVALID_STOCK",{stock:s});
  const a1=key(answers?.q1),a2=key(answers?.q2),a3=key(answers?.q3);
  const descriptors=[...BASE_NATURE[s]];let rating=3;let resourcesPreview=0;let classTraitLevelPreview=null;let homeTraitReplacement=null;let wisePreview=null;
  const replaceDescriptor=(from,to)=>{const i=descriptors.indexOf(from);if(i>=0)descriptors[i]=to;};
  if(s==="DWARF"){
    if(!["REVENGE","NEGOTIATE"].includes(a1)||!["DIG_DEEPER","FEAR_BELOW"].includes(a2)||!["CRAFT","SPEND_GOLD"].includes(a3))return blocked("INVALID_DWARF_NATURE_ANSWERS",{answers:{q1:a1,q2:a2,q3:a3}});
    if(a1==="REVENGE")rating++;else replaceDescriptor("AVENGING_GRUDGES","NEGOTIATING");
    if(a2==="DIG_DEEPER")rating++;else classTraitLevelPreview=2;
    if(a3==="CRAFT")rating++;else resourcesPreview=1;
  } else if(s==="ELF"){
    if(!["SING","ENCHANT"].includes(a1)||!["CONFRONT_EVIL","RETREAT_HIDE"].includes(a2)||!["JOURNEY_WEST","STRUGGLE"].includes(a3))return blocked("INVALID_ELF_NATURE_ANSWERS",{answers:{q1:a1,q2:a2,q3:a3}});
    if(a1==="SING")rating++;else replaceDescriptor("SINGING","ENCHANTING");
    if(a2==="RETREAT_HIDE")rating++;else classTraitLevelPreview=2;
    if(a3==="JOURNEY_WEST")rating++;else {const tr=key(replacementTrait);if(!["FIERY","CURIOUS","RESTLESS"].includes(tr))return blocked("ELF_STRUGGLE_REPLACEMENT_TRAIT_REQUIRED");homeTraitReplacement=tr;}
  } else if(s==="HALFLING"){
    if(!["FEAST","HOARD"].includes(a1)||!["RIDDLE","FIGHT"].includes(a2)||!["SNEAK","DEMAND"].includes(a3))return blocked("INVALID_HALFLING_NATURE_ANSWERS",{answers:{q1:a1,q2:a2,q3:a3}});
    if(a1==="FEAST")rating++;else replaceDescriptor("MERRYMAKING","HOARDING");
    if(a2==="RIDDLE")rating++;else classTraitLevelPreview=2;
    if(a3==="SNEAK")rating++;else replaceDescriptor("SNEAKING","DEMANDING");
  } else {
    if(!["BOAST","PREPARE"].includes(a1)||!["DEMAND_RIGHTS","LISTEN_ELDERS"].includes(a2)||!["FLEE_HIDE","FIGHT"].includes(a3))return blocked("INVALID_HUMAN_NATURE_ANSWERS",{answers:{q1:a1,q2:a2,q3:a3}});
    if(a1==="BOAST")rating++;else classTraitLevelPreview=2;
    if(a2==="DEMAND_RIGHTS")rating++;else {const w=key(secondWise);if(!["ELF_WISE","DWARF_WISE","POLITICS_WISE"].includes(w))return blocked("HUMAN_LISTEN_SECOND_WISE_REQUIRED");wisePreview=w;}
    if(a3==="FLEE_HIDE")rating++;else {const tr=key(replacementTrait);if(!["LONER","FOOLHARDY","DEFENDER"].includes(tr))return blocked("HUMAN_FIGHT_REPLACEMENT_TRAIT_REQUIRED");homeTraitReplacement=tr;}
  }
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"NATURE_QUESTIONNAIRE_SHADOW",stock:s,startingNatureBase:3,startingNaturePreview:rating,descriptorsPreview:descriptors,resourcesPreview,classTraitLevelPreview,homeTraitReplacement,wisePreview,retirementBoundary:{at7:"RETIREMENT_RISK_PER_GUIDE",at0:"RETIREMENT_RISK_PER_GUIDE"},natureMutationCommitted:false,traitMutationCommitted:false,resourceMutationCommitted:false,wiseMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eRelationshipsBoundaryPlan(){
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"CREATION_RELATIONSHIPS_BOUNDARY_SHADOW",delegatedAuthority:"M10D.13_CIRCLES_SHADOW",baseCircles:1,creationCommitAllowed:false,relationshipMutationCommitted:false,circlesMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eStartingEquipmentBoundaryPlan({className=""}={}){
  const c=key(className),data=CLASSES[c];if(!data)return blocked("UNKNOWN_CLASS",{className:c});
  const special=c==="MAGICIAN"?{spellBookRequired:true,startingFirstCircleSpells:3,memoryPalaceCapacity:1,selectionMethod:"ROLL_2D6_VISUAL_TABLE_NOT_TRANSCRIBED",spellDescriptionsAuthority:"DG183_UNAVAILABLE"}:c==="THEURGE"?{minorRelics:2,associatedInvocations:true,selectionMethod:"ROLL_3D6_VISUAL_TABLE_NOT_TRANSCRIBED",invocationDescriptionsAuthority:"DG209_UNAVAILABLE"}:null;
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"STARTING_EQUIPMENT_BOUNDARY_SHADOW",className:c,slotless:["WELL_WORN_CLOTHES","UTILITARIAN_BELT"],containerChoice:["SATCHEL","BACKPACK"],weaponPolicy:data.weapons,startingArmor:data.startingArmor,optionalHelmetIfNoShield:Boolean(data.optionalHelmetIfNoShield),special,inventoryAuthority:"M10D.10_INVENTORY_SHADOW",completeGearCatalogAvailable:false,gearDetailsAuthority:"DG148_DG150_DG156_DG157_UNAVAILABLE_OR_VISUAL_TABLE_NOT_TRANSCRIBED",actorMutationCommitted:false,itemMutationCommitted:false,inventoryMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eDrivesPlan({belief="",instinct="",goal="",level=1,creed=""}={}){
  if(!int(level)||Number(level)<1||Number(level)>10)return blocked("INVALID_CHARACTER_LEVEL",{level});
  const l=Number(level),b=String(belief??"").trim(),i=String(instinct??"").trim(),g=String(goal??"").trim(),c=String(creed??"").trim();
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"DRIVES_SHADOW",level:l,beliefPresent:Boolean(b),instinctPresent:Boolean(i),goalPresent:Boolean(g),creedUnlocked:l>=3,creedPresent:Boolean(c),beliefGuidance:"SINGLE_SENTENCE_PERSONAL_PHILOSOPHY_MOTIVATION_OR_MOTTO",instinctGuidance:"CONDITIONAL_ALWAYS_NEVER_OR_IF_THEN_ACTION",goalGuidance:"ACTIVE_OBJECTIVE_FEASIBLE_IN_ONE_OR_TWO_SESSIONS",creedGuidance:"IDEAL_BIGGER_THAN_PERSONAL_BELIEF_UNLOCKED_AT_LEVEL_3",semanticValidationAuthority:"PLAYER_GM_MANUAL",actorMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eLevelOneBenefitPlan({className=""}={}){
  const c=key(className);if(!CLASSES[c])return blocked("UNKNOWN_CLASS",{className:c});
  const benefits={
    BURGLAR:["WEAPON_POLICY_FROM_CLASS","LEATHER_ARMOR_HELMETS_SHIELDS_ALLOWED"],
    MAGICIAN:["MEMORY_PALACE","START_WITH_3_FIRST_CIRCLE_SPELLS","MEMORY_PALACE_CAPACITY_1","DAGGERS_STAVES","NO_ARMOR"],
    OUTCAST:["WEAPON_POLICY_FROM_CLASS","ANY_ARMOR_HELMET_SHIELD","PLUS_1_CAMP_EVENT_DUNGEONS_DWARF_STRUCTURES"],
    RANGER:["BOWS_SWORDS_SPEARS_DAGGERS","LEATHER_CHAIN_HELMETS","PLUS_1_CAMP_EVENT_WILDERNESS"],
    THEURGE:["URDR_STARTS_1","TWO_MINOR_RELICS","ONE_WEAPON_EXCEPT_BOW_CROSSBOW","NO_ARMOR_SHIELD_ALLOWED"],
    WARRIOR:["ANY_WEAPON_OR_ARMOR","FREE_CAMP_WATCH_IF_NO_CONDITIONS"]
  }[c];
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"LEVEL_ONE_BENEFIT_SHADOW",className:c,level:1,benefits,missingEffectAuthority:["SPELL_DESCRIPTIONS_DG183_UNAVAILABLE","INVOCATION_DESCRIPTIONS_DG209_UNAVAILABLE","TRAIT_DETAILS_DG_UNAVAILABLE"],benefitMutationCommitted:false,liveApplication:false,writesPlanned:0});
}

export function tb2eFinalDetailsPlan({stock="",name="",raiment="",age=null}={}){
  const s=key(stock),range=AGE_RANGES[s];if(!range)return blocked("INVALID_STOCK",{stock:s});
  if(!int(age))return blocked("AGE_REQUIRED",{stock:s,range});
  const n=Number(age);if(n<range.min||n>range.max)return blocked("AGE_OUTSIDE_STOCK_RANGE",{stock:s,age:n,range});
  return freezeTb2e({ok:true,phase:"M10D.15",profileId:PROFILE_ID,mode:"FINAL_DETAILS_SHADOW",stock:s,namePresent:Boolean(String(name??"").trim()),raimentPresent:Boolean(String(raiment??"").trim()),age:n,ageRange:range,freshConditionPreview:true,actorCreationCommitted:false,conditionMutationCommitted:false,liveApplication:false,writesPlanned:0});
}
