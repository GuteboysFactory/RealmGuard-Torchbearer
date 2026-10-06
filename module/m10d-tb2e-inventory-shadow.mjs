import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const INVENTORY_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="inventory");

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function nonNegativeNumber(value){return Number.isFinite(Number(value))&&Number(value)>=0;}
function positiveNumber(value){return Number.isFinite(Number(value))&&Number(value)>0;}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.10",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

export function tb2eInventoryShadowStatus(){
  return freezeTb2e({
    phase:"M10D.10",mode:"TB2E_INVENTORY_GEAR_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:INVENTORY_ROW?.status??"PARTIAL",
    sourceEvidence:INVENTORY_ROW?.evidence??"QR 23-26; CC 37-40",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    placementMutationAllowed:false,containerMutationAllowed:false,cacheMutationAllowed:false,gearGrantAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "NO_FULL_GEAR_CATALOGUE_DG148_UNAVAILABLE",
      "NO_WEAPON_EFFECTS_DG156_157_UNAVAILABLE",
      "NO_ARMOR_RULE_AUTOMATION",
      "NO_BACKPACK_FIGHTER_DUNGEONEER_PENALTY_MAGNITUDE_INFERENCE",
      "NO_NESTED_CONTAINER_ITEM_CATALOGUE_INFERENCE",
      "NO_CONTAINER_DAMAGE_OR_CONTENT_LOSS_MUTATION",
      "NO_STARTING_GEAR_TABLE_AUTOGRANTS_FROM_VISUAL_ONLY_TABLES",
      "NO_EXISTING_ITEM_CONVERSION_OR_PLACEMENT_WRITE"
    ],
    nextStep:"Verify source-bounded inventory locations, storage labels, containers, belt/two-hand rules, caches and starting-gear boundaries only"
  });
}

export function tb2eInventoryModel(){
  return freezeTb2e({
    phase:"M10D.10",profileId:PROFILE_ID,
    inventoryPurpose:["EXPENDABLE_SUPPLIES","EXTRA_ITEMS","TREASURE","WEAPONS","ARMOR"],
    assumedNotListed:["SKILL_TOOLS_AND_COMMON_WORK_GEAR"],
    overCapacityGuidance:"CHECK_LABORER_SKILL",
    locations:{
      HEAD:{wornSlots:1},
      NECK:{wornSlots:1},
      HANDS:{wornSlotsPerHand:1,carriedSlotsPerHand:1,hands:2,totalWornSlots:2,totalCarriedSlots:2},
      TORSO:{slots:3},
      BELT:{slots:3,allowed:["PACK_1","CARRIED_1"],bundledAllowed:false},
      FEET:{wears:"SHOES",slotCountAuthority:"NOT_NUMERICALLY_STATED_BEYOND_LOCATION"},
      LEGS:{wears:"PANTS",inventoryLocationListedAmongSix:false,slotCountAuthority:"UNSPECIFIED"},
      POCKET:{smallItems:1}
    },
    storageLabels:{
      CARRIED:"HELD_IN_ONE_OR_BOTH_HANDS",
      WIELD:"HANDS_REQUIRED_TO_USE_WEAPON",
      WORN:"PLACED_IN_WEARABLE_LOCATIONS",
      PACK:"PLACED_IN_BACKPACK_POUCH_SACK_SATCHEL_OR_BELT"
    },
    specialCarried4:{carriersRequired:2,handsPerCarrier:2,totalHands:4},
    containers:{
      BACKPACK:{torsoWornSlots:2,packSlots:6,mutuallyExclusiveWith:"SATCHEL",negativeTests:["FIGHTER","DUNGEONEER"],negativeModifierMagnitudeAuthority:"UNAVAILABLE"},
      SATCHEL:{torsoWornSlots:1,packSlots:3,mutuallyExclusiveWith:"BACKPACK",negativeTests:[]},
      BELT:{packOrCarriedSlots:3,maxItemSizeEach:1,bundledAllowed:false},
      BOTTLE:{contents:["LIQUIDS","IMPROVISED_SAND_OR_GEMS"],capacityAuthority:"ITEM_CATALOGUE_UNAVAILABLE"},
      WATERSKIN:{contents:["LIQUIDS","IMPROVISED_SAND_OR_GEMS"],capacityAuthority:"ITEM_CATALOGUE_UNAVAILABLE"}
    },
    nesting:{allowed:true,outerMustFitInnerAndContents:true,halfSlotContainersExist:true},
    containerDamage:{possibleAsTwist:true,contentsMayBeLost:"SOME_OR_ALL",automation:false},
    cache:{standardSlots:12,carried:false,campBuild:{costChecks:1},townBuild:{cost:"FREE",requiresParentOrFriendWithHome:true},transferAfterBuilt:"AT_WILL"},
    startingGear:{
      wellWornClothesSlotCost:0,utilitarianBeltSlotCost:0,
      chooseOneContainer:["SATCHEL","BACKPACK"],
      magicianRequiresSpellBook:true,theurgeHolyRelics:2,
      detailedGearAuthority:"DG148_UNAVAILABLE",
      startingGearChoiceTables:"VISUAL_SOURCE_NOT_EXECUTABLE_AUTOGRANT"
    },
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eInventoryLocationPlan({location=""}={}){
  const id=key(location);
  const data=tb2eInventoryModel().locations[id];
  if(!data)return blocked("UNKNOWN_OR_UNSOURCED_INVENTORY_LOCATION",{location:id});
  return freezeTb2e({ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"INVENTORY_LOCATION_SHADOW",location:id,...data,liveApplication:false,writesPlanned:0});
}

export function tb2eGearStoragePlan({
  storage="",
  slotCost=1,
  wieldHands=null,
  carriers=1
}={}){
  const method=key(storage);
  if(!["CARRIED","WIELD","WORN","PACK"].includes(method))return blocked("UNKNOWN_STORAGE_LABEL",{storage:method});
  if(!positiveNumber(slotCost))return blocked("INVALID_SLOT_COST",{slotCost});
  if(!positiveNumber(carriers))return blocked("INVALID_CARRIER_COUNT",{carriers});
  if(wieldHands!==null&&(!Number.isInteger(Number(wieldHands))||Number(wieldHands)<1))return blocked("INVALID_WIELD_HANDS",{wieldHands});
  const carried4=method==="CARRIED"&&Number(slotCost)===4;
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"GEAR_STORAGE_SHADOW",
    storage:method,slotCost:Number(slotCost),wieldHands:wieldHands===null?null:Number(wieldHands),carriers:Number(carriers),
    carried4,
    carried4Requirement:carried4?{carriersRequired:2,handsPerCarrier:2,totalHands:4}:null,
    fullItemStorageAuthority:"DG148_UNAVAILABLE_CALLER_SUPPLIED_ONLY",
    placementMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eContainerPlan({
  container="",
  usedPackSlots=0,
  nested=false,
  innerContainerSlotCost=0,
  innerContentsSlotCost=0
}={}){
  const id=key(container);
  const data=tb2eInventoryModel().containers[id];
  if(!data)return blocked("UNKNOWN_OR_UNSOURCED_CONTAINER",{container:id});
  if(!nonNegativeNumber(usedPackSlots))return blocked("INVALID_USED_PACK_SLOTS",{usedPackSlots});
  if(!nonNegativeNumber(innerContainerSlotCost)||!nonNegativeNumber(innerContentsSlotCost))return blocked("INVALID_NESTED_SLOT_COST");
  const capacity=data.packSlots??data.packOrCarriedSlots??null;
  const requiredNestedSlots=Boolean(nested)?Number(innerContainerSlotCost)+Number(innerContentsSlotCost):0;
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"CONTAINER_SHADOW",
    container:id,...data,usedPackSlots:Number(usedPackSlots),capacity,
    overCapacity:capacity===null?null:Number(usedPackSlots)>capacity,
    nested:Boolean(nested),requiredNestedSlots,
    nestingRule:Boolean(nested)?"OUTER_MUST_FIT_INNER_AND_CONTENTS":"NOT_APPLICABLE",
    placementMutationCommitted:false,containerMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eBeltStoragePlan({
  storage="PACK",
  slotCost=1,
  bundled=false
}={}){
  const method=key(storage);
  if(!["PACK","CARRIED"].includes(method))return blocked("BELT_ACCEPTS_PACK_OR_CARRIED_ONLY",{storage:method});
  if(!positiveNumber(slotCost))return blocked("INVALID_SLOT_COST",{slotCost});
  const allowed=Number(slotCost)===1&&!Boolean(bundled);
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"BELT_STORAGE_SHADOW",
    storage:method,slotCost:Number(slotCost),bundled:Boolean(bundled),beltSlots:3,
    allowed,
    reasonCode:allowed?null:Boolean(bundled)?"BELT_BUNDLED_ITEMS_NOT_ALLOWED":"BELT_ITEM_MUST_BE_SIZE_1",
    placementMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eTwoHandedWeaponPlan({
  wieldHands=2,
  handsCurrentlyHolding=0
}={}){
  if(!Number.isInteger(Number(wieldHands))||Number(wieldHands)<1)return blocked("INVALID_WIELD_HANDS",{wieldHands});
  if(!Number.isInteger(Number(handsCurrentlyHolding))||Number(handsCurrentlyHolding)<0)return blocked("INVALID_HANDS_CURRENTLY_HOLDING",{handsCurrentlyHolding});
  const twoHanded=Number(wieldHands)===2;
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"TWO_HANDED_WEAPON_SHADOW",
    wieldHands:Number(wieldHands),handsCurrentlyHolding:Number(handsCurrentlyHolding),twoHanded,
    mustBeHeldWithTwoHandsOrDropped:twoHanded,
    compliant:twoHanded?Number(handsCurrentlyHolding)===2:true,
    requiredActionIfNonCompliant:twoHanded&&Number(handsCurrentlyHolding)!==2?"DROP":"NONE",
    placementMutationCommitted:false,dropMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eContainerDamagePlan({
  damaged=false,
  contentsAtRisk="NONE"
}={}){
  const risk=key(contentsAtRisk);
  if(!["NONE","SOME","ALL"].includes(risk))return blocked("INVALID_CONTENT_LOSS_SCOPE",{contentsAtRisk:risk});
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"CONTAINER_DAMAGE_GUIDANCE_SHADOW",
    damaged:Boolean(damaged),twistAuthority:"GM_ADJUDICATION",contentsAtRisk:risk,
    contentLossMutationCommitted:false,containerMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eCachePlan({
  phase="CAMP",
  hasCheck=false,
  hasParentOrFriendWithHome=false,
  built=false
}={}){
  const p=key(phase);
  if(!["CAMP","TOWN"].includes(p))return blocked("CACHE_BUILD_REQUIRES_CAMP_OR_TOWN",{phase:p});
  const canBuild=p==="CAMP"?Boolean(hasCheck):Boolean(hasParentOrFriendWithHome);
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"CACHE_SHADOW",
    cacheSlots:12,carried:false,buildPhase:p,
    buildCost:p==="CAMP"?{checks:1}:{cost:"FREE"},
    hasCheck:Boolean(hasCheck),hasParentOrFriendWithHome:Boolean(hasParentOrFriendWithHome),
    canBuild,
    requirement:p==="CAMP"?"SPEND_ONE_CHECK":"LEAVE_WITH_PARENT_OR_FRIEND_WHO_HAS_HOME",
    built:Boolean(built),transferAtWill:Boolean(built),
    checkSpendCommitted:false,cacheMutationCommitted:false,itemTransferCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eStartingGearBoundaryPlan({
  className="",
  containerChoice=""
}={}){
  const cls=key(className);
  const container=key(containerChoice);
  if(container&&!["BACKPACK","SATCHEL"].includes(container))return blocked("STARTING_CONTAINER_MUST_BE_BACKPACK_OR_SATCHEL",{containerChoice:container});
  return freezeTb2e({
    ok:true,phase:"M10D.10",profileId:PROFILE_ID,mode:"STARTING_GEAR_BOUNDARY_SHADOW",
    className:cls||null,
    slotlessStartingItems:["WELL_WORN_CLOTHES","UTILITARIAN_BELT"],
    chooseOneContainer:["BACKPACK","SATCHEL"],containerChoice:container||null,
    classRequirements:{
      spellBookRequired:cls==="MAGICIAN",
      holyRelicsRequired:cls==="THEURGE"?2:0
    },
    detailedStartingGearChoiceTableAuthority:"VISUAL_TABLE_NOT_EXECUTABLE_WITHOUT_EXPLICIT_ITEM_TRANSCRIPTION",
    detailedItemRulesAuthority:"DG148_UNAVAILABLE",
    gearGrantCommitted:false,placementMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
