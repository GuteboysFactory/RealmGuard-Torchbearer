import { freezeTb2e, TB2E_SOURCE_COVERAGE_MATRIX } from "./m10d-tb2e-source-coverage.mjs";

const PROFILE_ID="torchbearer2e";
const PROFILE_VERSION=1;
const RECOVERY_ROW=TB2E_SOURCE_COVERAGE_MATRIX.find(row=>row.id==="recovery");

const RECOVERY_ORDER=freezeTb2e(["HUNGRY_THIRSTY","ANGRY","AFRAID","EXHAUSTED","INJURED_OR_SICK"]);
const STANDARD_RECOVERY=freezeTb2e({
  ANGRY:{ability:"WILL",obstacle:2,phases:["CAMP","TOWN"]},
  AFRAID:{ability:"WILL",obstacle:3,phases:["CAMP","TOWN"]},
  EXHAUSTED:{ability:"HEALTH",obstacle:3,phases:["CAMP","TOWN"],phaseSourceBoundary:"QR44_SAYS_CAMP_TEST_GENERIC_RECOVERY_AND_TOWN_ACCOMMODATIONS_SUPPORT_CAMP_TOWN"},
  INJURED:{ability:"HEALTH",obstacle:4,phases:["CAMP","TOWN"]},
  SICK:{ability:"WILL",obstacle:3,phases:["CAMP","TOWN"]}
});

function key(value){return String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");}
function phaseId(value){const p=key(value);return ["ADVENTURE","CAMP","TOWN"].includes(p)?p:null;}
function conditionId(value){
  const k=key(value);
  const aliases={
    HUNGRY:"HUNGRY_THIRSTY",THIRSTY:"HUNGRY_THIRSTY",HUNGRY_AND_THIRSTY:"HUNGRY_THIRSTY",
    ANGER:"ANGRY",FEAR:"AFRAID",EXHAUSTION:"EXHAUSTED",INJURY:"INJURED",SICKNESS:"SICK"
  };
  const resolved=aliases[k]??k;
  return ["HUNGRY_THIRSTY","ANGRY","AFRAID","EXHAUSTED","INJURED","SICK"].includes(resolved)?resolved:null;
}
function accommodationId(value){
  const a=key(value);
  return ["NONE","FLOPHOUSE","HOME","HOTEL","INN"].includes(a)?a:null;
}
function blocked(reasonCode,extra={}){
  return freezeTb2e({...extra,ok:false,phase:"M10D.9",profileId:PROFILE_ID,reasonCode,liveApplication:false,writesPlanned:0});
}

export function tb2eRecoveryShadowStatus(){
  return freezeTb2e({
    phase:"M10D.9",mode:"TB2E_RECOVERY_READ_ONLY_SHADOW",profileId:PROFILE_ID,profileVersion:PROFILE_VERSION,
    adapterReady:true,sourceClassification:RECOVERY_ROW?.status??"PARTIAL",
    sourceEvidence:RECOVERY_ROW?.evidence??"QR 10-11, 17, 41-47, 80, 83-88",
    liveEnabled:false,liveApplication:false,automation:"SHADOW_ONLY",activationAllowed:false,
    conditionMutationAllowed:false,abilityMutationAllowed:false,advancementMutationAllowed:false,
    checkSpendAllowed:false,lifestyleMutationAllowed:false,
    writes:{actors:0,items:0,journals:0,settings:0},
    unresolvedSourceBoundaries:[
      "EXHAUSTED_QR44_CAMP_TEST_WORDING_VS_GENERIC_CAMP_TOWN_AND_TOWN_ACCOMMODATIONS",
      "TOWN_ENTRY_REMAINING_CHECKS_VS_ACCOMMODATION_LIFESTYLE_SEQUENCE_NOT_FULLY_SPECIFIED",
      "EXHAUSTED_BONUS_SOURCE_STACKING_UNSPECIFIED"
    ],
    boundaries:[
      "NO_LIVE_RECOVERY_TEST_OR_CONDITION_CLEAR",
      "NO_CHECK_SPEND_OR_LIFESTYLE_COST_WRITE",
      "NO_HEALER_FAILURE_STAT_LOSS_OR_ADVANCEMENT_RESET_WRITE",
      "NO_INFERRED_HUNGRY_CAMP_OBSTACLES",
      "NO_INFERRED_HOME_RECOVERY_TEST_QUOTA",
      "NATURE_RECOVERY_EXECUTION_DEFERRED_TO_M10D_5_NATURE_SHADOW"
    ],
    nextStep:"Verify source-bounded Camp/Town recovery, accommodations, Hungry/Thirsty, Healer alternatives and Fresh eligibility previews only"
  });
}

export function tb2eRecoveryModel(){
  return freezeTb2e({
    phase:"M10D.9",profileId:PROFILE_ID,
    order:RECOVERY_ORDER,
    general:{
      phases:["CAMP","TOWN"],
      attemptScope:"PER_CONDITION_PER_PHASE",
      campCost:{checksPerTest:1},
      townCost:{withAccommodation:"USE_ACCOMMODATION_ALLOWANCE",withoutAccommodation:{lifestyleCostPerRecoveryTest:1}},
      townEntry:{remainingChecksMayBeSpentOnRecovery:true,sequenceWithAccommodationRules:"SOURCE_BOUNDARY_NOT_FULLY_SPECIFIED"}
    },
    standard:STANDARD_RECOVERY,
    hungryThirsty:{
      ADVENTURE:{requires:["RATIONS","WINE"]},
      CAMP:{foodSkills:["SCAVENGER","SURVIVALIST","HUNTER"],requiresCookPreparation:true,obstacleAuthority:"UNAVAILABLE_NOT_IN_GUIDE"},
      TOWN:{sources:["FRIENDS","CERTAIN_ACCOMMODATIONS"],fullFriendProcedureAuthority:"UNAVAILABLE"}
    },
    accommodations:{
      FLOPHOUSE:{freeRecoveryTests:1,additionalRecoveryTests:1,additionalLifestyleCostEach:1},
      HOME:{lodgingCost:0,recoveryTestQuotaAuthority:"UNSPECIFIED_IN_GUIDE"},
      HOTEL:{baseLifestyleCost:3,freeRecoveryTests:2,additionalRecoveryTests:2,additionalLifestyleCostEach:1,automaticRecovery:["HUNGRY_THIRSTY","EXHAUSTED"],recoveryDiceBonus:{SICK:1,INJURED:1}},
      INN:{baseLifestyleCost:2,freeRecoveryTests:2,additionalRecoveryTests:1,additionalLifestyleCostEach:1,automaticRecovery:["HUNGRY_THIRSTY"],recoveryDiceBonus:{ANGRY:1,AFRAID:1,EXHAUSTED:1}}
    },
    healer:{
      INJURED:{outOfOrderAllowed:true,severities:{BUMPS_BRUISES:2,SWORD_CUTS_OR_BROKEN_BONES:3,BURNS:4},failureProcedure:"GRIT_YOUR_TEETH"},
      SICK:{outOfOrderAllowed:true,severities:{COMMON_ILLNESS:4,VIRULENT_DISEASE:5,POISON:6},failureProcedure:"SWEAT_OUT_THE_FEVER"}
    },
    fresh:{
      requires:["IN_TOWN","NO_CONDITIONS","NATURE_UNTAXED","LIFESTYLE_MAINTENANCE_PASS"]
    },
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eStandardRecoveryPlan({
  condition="",
  phase="CAMP",
  attemptedThisPhase=false,
  accommodation="NONE"
}={}){
  const c=conditionId(condition);
  if(!c)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION",{condition});
  if(c==="HUNGRY_THIRSTY")return blocked("HUNGRY_THIRSTY_USES_SPECIAL_RECOVERY_METHODS",{condition:c});
  const spec=STANDARD_RECOVERY[c];
  if(!spec)return blocked("NO_STANDARD_RECOVERY_TEST_FOR_CONDITION",{condition:c});
  const p=phaseId(phase);
  if(!p||!["CAMP","TOWN"].includes(p))return blocked("STANDARD_RECOVERY_REQUIRES_CAMP_OR_TOWN",{phase});
  if(attemptedThisPhase)return blocked("CONDITION_RECOVERY_ALREADY_ATTEMPTED_THIS_PHASE",{condition:c,phase:p});
  const a=accommodationId(accommodation);
  if(!a)return blocked("UNKNOWN_ACCOMMODATION",{accommodation});
  const townWithoutAccommodation=p==="TOWN"&&a==="NONE";
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"STANDARD_RECOVERY_SHADOW",
    condition:c,recoveryPhase:p,ability:spec.ability,obstacle:spec.obstacle,
    attemptScope:"PER_CONDITION_PER_PHASE",
    phaseSourceBoundary:spec.phaseSourceBoundary??null,
    campCheckCost:p==="CAMP"?1:0,
    townLifestyleCostPreview:townWithoutAccommodation?1:0,
    accommodation:a,
    successMeaning:"RECOVER_CONDITION",
    failureMeaning:"STANDARD_FAILURE_CONSEQUENCE_NOT_FULLY_SPECIFIED_IN_GUIDE",
    checkSpendCommitted:false,lifestyleCostCommitted:false,conditionMutationCommitted:false,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eHungryThirstyRecoveryPlan({
  phase="ADVENTURE",
  hasRations=false,
  hasWine=false,
  foodSkill="",
  cookPrepared=false,
  friendAvailable=false,
  accommodation="NONE"
}={}){
  const p=phaseId(phase);
  if(!p)return blocked("UNKNOWN_RECOVERY_PHASE",{phase});
  if(p==="ADVENTURE"){
    const satisfied=Boolean(hasRations)&&Boolean(hasWine);
    return freezeTb2e({
      ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"HUNGRY_THIRSTY_RECOVERY_SHADOW",recoveryPhase:p,
      method:"EAT_RATIONS_AND_DRINK_WINE",requirements:{hasRations:Boolean(hasRations),hasWine:Boolean(hasWine)},satisfied,
      conditionMutationCommitted:false,inventoryMutationCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  if(p==="CAMP"){
    const skill=key(foodSkill);
    const validSkill=["SCAVENGER","SURVIVALIST","HUNTER"].includes(skill);
    return freezeTb2e({
      ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"HUNGRY_THIRSTY_RECOVERY_SHADOW",recoveryPhase:p,
      method:"FIND_FOOD_AND_COOK",foodSkill:skill||null,foodSkillAllowed:validSkill,cookPrepared:Boolean(cookPrepared),
      satisfied:validSkill&&Boolean(cookPrepared),obstacle:null,obstacleAuthority:"UNAVAILABLE_NOT_IN_GUIDE",
      conditionMutationCommitted:false,checkSpendCommitted:false,liveApplication:false,writesPlanned:0
    });
  }
  const a=accommodationId(accommodation);
  if(!a)return blocked("UNKNOWN_ACCOMMODATION",{accommodation});
  const auto=["HOTEL","INN"].includes(a);
  const supported=Boolean(friendAvailable)||auto;
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"HUNGRY_THIRSTY_RECOVERY_SHADOW",recoveryPhase:p,
    method:auto?"ACCOMMODATION_AUTOMATIC":Boolean(friendAvailable)?"FRIEND":"SOURCE_INCOMPLETE_TOWN_METHOD",
    accommodation:a,friendAvailable:Boolean(friendAvailable),supported,
    conditionMutationCommitted:false,lifestyleCostCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eAccommodationRecoveryPlan({
  accommodation="NONE",
  condition="",
  additionalTestNumber=0
}={}){
  const a=accommodationId(accommodation);
  if(!a)return blocked("UNKNOWN_ACCOMMODATION",{accommodation});
  if(a==="NONE")return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"ACCOMMODATION_RECOVERY_SHADOW",
    accommodation:a,condition:conditionId(condition),freeRecoveryTests:0,additionalRecoveryTests:null,
    additionalLifestyleCostEach:1,rule:"NO_ACCOMMODATION_RECOVERY_TEST_ADDS_1_LIFESTYLE",
    liveApplication:false,writesPlanned:0
  });
  const data=tb2eRecoveryModel().accommodations[a];
  const c=condition?conditionId(condition):null;
  if(condition&&!c)return blocked("UNKNOWN_OR_UNSOURCED_CONDITION",{condition});
  if(a==="HOME")return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"ACCOMMODATION_RECOVERY_SHADOW",
    accommodation:a,lodgingCost:0,recoveryTestQuotaAuthority:"UNSPECIFIED_IN_GUIDE",
    automaticRecovery:false,diceBonus:0,additionalTestNumber:Number(additionalTestNumber)||0,
    liveApplication:false,writesPlanned:0
  });
  const n=Number(additionalTestNumber);
  if(!Number.isInteger(n)||n<0)return blocked("INVALID_ADDITIONAL_TEST_NUMBER",{additionalTestNumber});
  const withinAdditional=n===0?true:n<=data.additionalRecoveryTests;
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"ACCOMMODATION_RECOVERY_SHADOW",
    accommodation:a,condition:c,freeRecoveryTests:data.freeRecoveryTests,
    additionalRecoveryTests:data.additionalRecoveryTests,additionalLifestyleCostEach:data.additionalLifestyleCostEach,
    baseLifestyleCost:data.baseLifestyleCost??null,additionalTestNumber:n,withinAdditionalAllowance:withinAdditional,
    additionalLifestyleCostPreview:n>0&&withinAdditional?n*data.additionalLifestyleCostEach:0,
    automaticRecovery:Boolean(c&&data.automaticRecovery?.includes(c)),
    diceBonus:c?(data.recoveryDiceBonus?.[c]??0):0,
    conditionMutationCommitted:false,lifestyleCostCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eExhaustedRecoveryModifierPlan({
  inInn=false,
  hasCloak=false,
  hasLevelBenefit=false,
  hasSpellBenefit=false,
  usedShield=false,
  castSpell=false,
  woreHeavyArmor=false,
  affectedByRelevantSpell=false
}={}){
  const bonusSources=[];
  if(inInn)bonusSources.push("INN");
  if(hasCloak)bonusSources.push("CLOAK");
  if(hasLevelBenefit)bonusSources.push("LEVEL_BENEFIT");
  if(hasSpellBenefit)bonusSources.push("SPELL_BENEFIT");
  const obstacleRiskSources=[];
  if(usedShield)obstacleRiskSources.push("USED_SHIELD");
  if(castSpell)obstacleRiskSources.push("CAST_SPELL");
  if(woreHeavyArmor)obstacleRiskSources.push("WORE_HEAVY_ARMOR");
  if(affectedByRelevantSpell)obstacleRiskSources.push("RELEVANT_SPELL_EFFECT");
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"EXHAUSTED_RECOVERY_MODIFIER_SHADOW",
    bonusSources,sourceStatesBonus:"PLUS_1D_IF_ANY_LISTED_SOURCE",
    bonusStacking:"UNSPECIFIED_DO_NOT_SUM_AUTOMATICALLY",
    automaticDiceBonus:null,
    obstacleRiskSources,gmDiscretionObstacleGuidance:obstacleRiskSources.length?1:0,
    obstacleAutomation:false,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eHealerRecoveryPlan({
  condition="",
  severity=""
}={}){
  const c=conditionId(condition);
  if(!["INJURED","SICK"].includes(c))return blocked("HEALER_ALTERNATIVE_ONLY_FOR_INJURED_OR_SICK",{condition});
  const s=key(severity);
  const table=tb2eRecoveryModel().healer[c].severities;
  if(!(s in table))return blocked("UNKNOWN_OR_UNSOURCED_HEALER_SEVERITY",{condition:c,severity:s});
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"HEALER_RECOVERY_SHADOW",
    condition:c,severity:s,skill:"HEALER",obstacle:table[s],phases:["CAMP","TOWN"],outOfOrderAllowed:true,
    successMeaning:"CURE_CONDITION",
    failureProcedure:tb2eRecoveryModel().healer[c].failureProcedure,
    conditionMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}

export function tb2eHealerFailurePlan({
  condition="",
  selectedLossTarget=""
}={}){
  const c=conditionId(condition);
  if(!["INJURED","SICK"].includes(c))return blocked("HEALER_FAILURE_PLAN_ONLY_FOR_INJURED_OR_SICK",{condition});
  const target=key(selectedLossTarget);
  const allowed=c==="INJURED"?["HEALTH","NATURE","HEALTH_BASED_SKILL"]:["WILL","NATURE","WILL_BASED_SKILL"];
  if(target&&!allowed.includes(target))return blocked("INVALID_HEALER_FAILURE_LOSS_TARGET",{condition:c,selectedLossTarget:target,allowedLossTargets:allowed});
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"HEALER_FAILURE_SHADOW",
    condition:c,procedure:c==="INJURED"?"GRIT_YOUR_TEETH":"SWEAT_OUT_THE_FEVER",
    allowedLossTargets:allowed,selectedLossTarget:target||null,ratingLoss:1,
    conditionRemovalPreview:true,erasePassFailAdvancementPreview:true,
    conditionMutationCommitted:false,abilityMutationCommitted:false,skillMutationCommitted:false,advancementMutationCommitted:false,
    liveApplication:false,writesPlanned:0
  });
}

export function tb2eFreshEligibilityPlan({
  inTown=false,
  activeConditionCount=0,
  currentNature=0,
  maximumNature=0,
  lifestylePassed=false
}={}){
  if(!Number.isInteger(Number(activeConditionCount))||Number(activeConditionCount)<0)return blocked("INVALID_ACTIVE_CONDITION_COUNT",{activeConditionCount});
  if(!Number.isInteger(Number(currentNature))||!Number.isInteger(Number(maximumNature))||Number(currentNature)<0||Number(maximumNature)<0||Number(currentNature)>Number(maximumNature))return blocked("INVALID_NATURE_RATINGS",{currentNature,maximumNature});
  const requirements=freezeTb2e({
    inTown:Boolean(inTown),
    noConditions:Number(activeConditionCount)===0,
    natureUntaxed:Number(currentNature)===Number(maximumNature),
    lifestylePassed:Boolean(lifestylePassed)
  });
  return freezeTb2e({
    ok:true,phase:"M10D.9",profileId:PROFILE_ID,mode:"FRESH_ELIGIBILITY_SHADOW",
    requirements,eligible:Object.values(requirements).every(Boolean),
    delegatedNatureAuthority:"M10D.5_NATURE_SHADOW",
    delegatedLifestyleAuthority:"M10D.7_RESOURCES_SHADOW",
    freshMutationCommitted:false,natureMutationCommitted:false,liveApplication:false,writesPlanned:0
  });
}
