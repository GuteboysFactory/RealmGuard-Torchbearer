import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
import { tb2eCoreDomainAudit } from "./m10d-tb2e-core-source-expansion.mjs";

const PROFILE_ID = "torchbearer2e";
const PHASE = "M10D.18_P2.2";
const EVIDENCE = "Dungeoneer's Handbook pp. 150-151, 156-159; Scholar's Guide p. 65";
const ARMOR_TYPES = ["LEATHER", "CHAIN", "PLATE", "HELMET", "SHIELD"];
const CONFLICT_TYPES = ["KILL", "CAPTURE", "DRIVE_OFF"];
const DAMAGE_ACTIONS = ["ATTACK", "FEINT"];
const k = v => String(v ?? "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
const isNonnegative = n => Number.isInteger(n) && n >= 0;

function plan(fields) {
  return freezeTb2e({
    phase: PHASE, profileId: PROFILE_ID, mode: "READ_ONLY_SHADOW",
    sourceEvidence: EVIDENCE, liveApplication: false, writesPlanned: 0,
    actorWrite: false, itemWrite: false, hitPointWrite: false,
    equipmentWrite: false, rollExecuted: false, ...fields
  });
}
function invalid(reasonCode, extra = {}) { return plan({ok: false, reasonCode, ...extra}); }
function ineligible(reasonCode, extra = {}) {
  return plan({ok:true, applicable:false, reasonCode, absorption:0,
    rollRequired:false, rollConsumed:false, armorMutationCommitted:false, ...extra});
}

export function tb2eArmorShadowStatus() {
  return freezeTb2e({
    phase:PHASE, profileId:PROFILE_ID, profileVersion:1,
    mode:"TB2E_ARMOR_READ_ONLY_SHADOW", adapterReady:true,
    sourceClassification:tb2eCoreDomainAudit("armor")?.status ?? "VERIFIED",
    sourceEvidence:EVIDENCE, liveEnabled:false, liveApplication:false,
    automation:"SHADOW_ONLY", activationAllowed:false,
    actorMutationAllowed:false, itemMutationAllowed:false,
    hpMutationAllowed:false, armorMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    boundaries:[
      "ONLY_KILL_CAPTURE_DRIVE_OFF_CONFLICTS",
      "DIRECTLY_TARGETED_LEADING_ACTION_ONLY",
      "ONLY_ATTACK_OR_FEINT_HIT_DAMAGE",
      "NO_OVERFLOW_DAMAGE_ABSORPTION",
      "WEAPON_BYPASS_DOES_NOT_IMPLY_PLATE_BYPASS",
      "CHAIN_BYPASS_STILL_CHECKS_WEAR",
      "LEATHER_ROLL_ONCE_PER_FIGHT",
      "HELMET_FATE_GM_DISCRETION",
      "NO_AUTOMATIC_LAYER_STACKING_OR_ARMOR_CHOICE",
      "NO_ACTOR_HP_EQUIPMENT_OR_RESOURCE_WRITES"
    ],
    nextStep:"P2.2 Foundry QA; Conflict and Magic adapters remain pending"
  });
}

export function tb2eArmorModel() {
  return plan({ok:true, armorTypes:ARMOR_TYPES,
    eligibleConflicts:CONFLICT_TYPES, damageActions:DAMAGE_ACTIONS,
    ordinaryArmor:{
      LEATHER:{absorption:1,successFaces:[4,5,6],rollTiming:"BEFORE_ABSORPTION",oncePerFight:true,damageOnUse:false,bypassedBy:["BOW","CROSSBOW","SPEAR"]},
      CHAIN:{absorption:1,wearFaces:[1,2,3],safeFaces:[4,5,6],rollTiming:"AFTER_ABSORPTION",bypassedBy:["MACE","WARHAMMER"],wearRollEvenWhenBypassed:true},
      PLATE:{absorption:1,normalWearFaces:[1,2],maceWarhammerWearFaces:[1,2,3],rollTiming:"AFTER_ABSORPTION"},
      HELMET:{absorption:1,uses:1,afterAbsorption:"LOST_DAMAGED_OR_DESTROYED_GM_DECIDES"},
      SHIELD:{absorption:1,uses:1,afterAbsorption:"DESTROYED",defendBonusDice:2,requiresEquippedForDefend:true}
    },
    limits:{onlyOneProtectionPlannedAtATime:true,armorCannotStopOverflow:true,
      noCustomOrEnchantedArmorAutomation:true,repairTests:"GM_MANUAL"}
  });
}

/** Pure per-hit guidance for one ordinary protection item. Caller supplies die and state. */
export function tb2eArmorAbsorptionPlan({
  armorType="LEATHER", conflictType="KILL", action="ATTACK", weapon="SWORD",
  directlyTargeted=true, leadingAction=true, overflow=false,
  incomingDamage=1, armorDamaged=false, usedThisFight=false,
  equipped=true, d6=null
} = {}) {
  const type=k(armorType), conflict=k(conflictType), attack=k(action), sourceWeapon=k(weapon);
  if (!ARMOR_TYPES.includes(type)) return invalid("UNKNOWN_ARMOR_TYPE",{armorType:type});
  if (!CONFLICT_TYPES.includes(conflict)) return ineligible("CONFLICT_NOT_ARMOR_ELIGIBLE",{armorType:type,conflictType:conflict});
  if (!DAMAGE_ACTIONS.includes(attack)) return ineligible("ACTION_NOT_ATTACK_OR_FEINT",{armorType:type,action:attack});
  if (!isNonnegative(incomingDamage)) return invalid("INVALID_INCOMING_DAMAGE",{incomingDamage});
  if (d6 !== null && (!Number.isInteger(d6) || d6 < 1 || d6 > 6)) return invalid("INVALID_ARMOR_D6",{d6});
  if (!directlyTargeted || !leadingAction) return ineligible("NOT_DIRECTLY_TARGETED_LEADING_ACTION",{armorType:type});
  if (overflow) return ineligible("OVERFLOW_CANNOT_BE_ABSORBED",{armorType:type});
  if (incomingDamage === 0) return ineligible("NO_DAMAGE_TO_ABSORB",{armorType:type});
  if (armorDamaged) return ineligible("ARMOR_ALREADY_DAMAGED",{armorType:type});
  if (type === "SHIELD" && !equipped) return ineligible("SHIELD_NOT_EQUIPPED",{armorType:type});
  if ((type === "LEATHER" || type === "HELMET" || type === "SHIELD") && usedThisFight)
    return ineligible("ARMOR_SINGLE_USE_EXHAUSTED",{armorType:type});

  const base={ok:true, applicable:true, armorType:type, conflictType:conflict,
    incomingDamage, weapon:sourceWeapon, roll:d6, armorMutationCommitted:false,
    damageAfter:null, armorDamagedAfter:null};
  const bypass = type === "LEATHER" && ["BOW","CROSSBOW","SPEAR"].includes(sourceWeapon)
    || type === "CHAIN" && ["MACE","WARHAMMER"].includes(sourceWeapon);
  if (type === "LEATHER") {
    if (bypass) return plan({...base,absorption:0,damageAfter:incomingDamage,rollRequired:false,
      rollConsumed:false,reasonCode:"LEATHER_BYPASSED_BY_WEAPON",armorDamagedAfter:false});
    if (d6 === null) return plan({...base,absorption:null,rollRequired:true,
      rollTiming:"BEFORE_ABSORPTION",rollConsumed:false,rollPending:true,
      rollOutcome:"PENDING",oncePerFight:true});
    const absorption=d6>=4?1:0;
    return plan({...base,absorption,damageAfter:incomingDamage-absorption,rollRequired:true,
      rollTiming:"BEFORE_ABSORPTION",rollConsumed:true,oncePerFight:true,
      armorDamagedAfter:false,rollOutcome:absorption?"ABSORBED":"NOT_ABSORBED"});
  }
  if (type === "HELMET" || type === "SHIELD") {
    return plan({...base,absorption:1,damageAfter:incomingDamage-1,rollRequired:false,
      rollConsumed:false,usedUpAfterAbsorption:true,
      disposition:type==="SHIELD"?"DESTROYED":"LOST_DAMAGED_OR_DESTROYED_GM_DECIDES",
      armorDamagedAfter:type==="SHIELD"?true:null,
      gmAdjudicationRequired:type==="HELMET"});
  }
  const wearThreshold=type==="PLATE" && ["MACE","WARHAMMER"].includes(sourceWeapon)?3
    :type==="PLATE"?2:3;
  const absorption=bypass?0:1;
  if (d6 === null) return plan({...base,absorption,damageAfter:incomingDamage-absorption,
    rollRequired:true,rollTiming:"AFTER_ABSORPTION_OR_BYPASS_HIT",rollConsumed:false,
    rollPending:true,wearThreshold,armorDamagedAfter:null,bypassed:bypass});
  return plan({...base,absorption,damageAfter:incomingDamage-absorption,
    rollRequired:true,rollTiming:"AFTER_ABSORPTION_OR_BYPASS_HIT",rollConsumed:true,
    wearThreshold,armorDamagedAfter:d6<=wearThreshold,bypassed:bypass,
    rollOutcome:d6<=wearThreshold?"ARMOR_DAMAGED":"ARMOR_INTACT"});
}

export function tb2eShieldDefendPlan({equipped=false, action="DEFEND"}={}) {
  if(k(action)!=="DEFEND") return ineligible("SHIELD_BONUS_ONLY_FOR_DEFEND");
  if(!equipped) return ineligible("SHIELD_MUST_BE_EQUIPPED");
  return plan({ok:true,applicable:true,operation:"SHIELD_DEFEND_BONUS",diceModifier:2,
    timing:"PRE_ROLL",source:"SHIELD_WEAPON_RULE",weariness:"GM_MANUAL"});
}

export function tb2eArmorRepairBoundaryPlan({armorType="CHAIN",damaged=false,destroyed=false}={}) {
  const type=k(armorType);
  if(!ARMOR_TYPES.includes(type)) return invalid("UNKNOWN_ARMOR_TYPE",{armorType:type});
  return plan({ok:true,operation:"ARMOR_REPAIR_BOUNDARY",armorType:type,
    repairCandidate:Boolean(damaged)&&!Boolean(destroyed)&&["CHAIN","PLATE","HELMET"].includes(type),
    repairAuthority:"GM_ARMORER_TEST_MANUAL",repairCommitted:false,
    destroyedItemsCannotBeRepaired:true});
}
