import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eSourceBoundFactorPlan} from "./m10d-tb2e-tests-fullcore-p31-shadow.mjs";
import {tb2eNumericalFactorEntry} from "./m10d18-tb2e-package-a-factor-values.mjs";
import {tb2ePackageAConditionBoundaryPlan} from "./m10d18-tb2e-package-a-condition-boundary.mjs";
import {tb2eEnvironmentalTestFactorPlan} from "./m10d18-tb2e-package-a-environment.mjs";
import {tb2eSkillEquipmentPlan} from "./m10d-tb2e-skills-equipment-p32-shadow.mjs";
import {tb2eHelpParticipationPlan} from "./m10d-tb2e-help-shadow.mjs";
import {tb2eWiseAidPlan} from "./m10d-tb2e-wise-shadow.mjs";
import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
import {tb2eBeginnersLuckShadowPlan,tb2eTestPoolPlan} from "./m10d-tb2e-test-shadow.mjs";
const safe=data=>freezeTb2e({
 phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
 mode:"GM_INPUT_SCENARIO_READ_ONLY",liveApplication:false,writesPlanned:0,
 actorWrite:false,itemWrite:false,journalWrite:false,settingsWrite:false,
 rollExecuted:false,resourceSpendCommitted:false,sourceEvidence:"DH 59, 73-77; SG 27, 32-38",...data
});
const fail=(reasonCode,extra={})=>safe({ok:false,reasonCode,...extra});
const n=v=>Number.isInteger(v)&&v>=0;
/**
 * Assemble verified, caller-supplied GM *scenario* inputs across separate
 * Package A planners. Never reads Foundry documents, verifies player
 * permissions, rolls dice, applies effects or commits resource spending.
 * A valid preview does NOT mean that a real Actor is authorized to act.
 */
export function tb2ePackageATestScenarioPlan({
 skillName="",factor={},mode="SKILL",rating=null,
 equipment=null,environment=null,help=null,wiseAid=null,
 bonuses={},allModifiersGmReviewed=false,abilityZeroFromInjuryOrSickness=false,
 beginnerAbilityName="",heroicRatingSevenUnlocked=false,
 testContext="INDEPENDENT",actingCharacterId="",actingConditions=null,
 conditionsGmReviewed=false,channelNatureFacts=null,
 gmAngryObstacleDecision="",actingOnInstinct=false,instinctTurnSpent=false
}={}){
 const type=String(mode??"").trim().toUpperCase();
 if(!["SKILL","BEGINNERS_LUCK"].includes(type))return fail("UNSUPPORTED_TEST_SCENARIO");
 if(String(testContext??"").trim().toUpperCase()!=="INDEPENDENT")
   return fail("SCENARIO_ONLY_SUPPORTS_INDEPENDENT_TESTS");
 if(allModifiersGmReviewed!==true)return fail("GM_FULL_MODIFIER_REVIEW_REQUIRED");
 if(!Number.isInteger(rating)||rating<1||rating>7)return fail("INVALID_SCENARIO_RATING");
 if(rating===7&&heroicRatingSevenUnlocked!==true)return fail("HEROIC_RATING_SEVEN_NOT_UNLOCKED");
 if(!equipment||typeof equipment!=="object"||Array.isArray(equipment)||
    ["hasSkill","carriesBackpackOrSatchel","borrowedTools","dwarvenCraftingNature",
      "isCraftingTest","toolsInadequate","suppliesUsed","gearUsed"].some(k=>!Object.hasOwn(equipment,k)))
   return fail("EXPLICIT_EQUIPMENT_FACTS_REQUIRED");
 const skillKnown=type==="SKILL";
 if(equipment.hasSkill!==skillKnown)return fail("SKILL_TRAINING_EQUIPMENT_MISMATCH");
 if(!environment||typeof environment!=="object"||Array.isArray(environment)||
    !Object.hasOwn(environment,"light")||!Object.hasOwn(environment,"additionalGmHindrances"))
   return fail("EXPLICIT_ENVIRONMENT_FACTS_REQUIRED");
 const factorOptions={...factor,skillName};
 if(factor?.skillName && String(factor.skillName).trim().toLowerCase()!==String(skillName).trim().toLowerCase())
   return fail("SCENARIO_SKILL_FACTOR_ID_MISMATCH");
 const source=tb2eSourceBoundFactorPlan(factorOptions);
 if(!source.ok)return fail("FACTOR_"+source.reasonCode,{sourceReasonCode:source.reasonCode});
 const env=tb2eEnvironmentalTestFactorPlan({...environment,testMode:"OBSTACLE"});
 if(!env.ok)return fail("ENVIRONMENT_"+env.reasonCode);
 const gear=tb2eSkillEquipmentPlan(equipment);
 if(!gear.ok)return fail("EQUIPMENT_"+gear.reasonCode);
 const skill=tb2eSkillInfo(skillName);
 if(!skill.ok)return fail("UNKNOWN_SKILL");
 if(type==="BEGINNERS_LUCK"&&
    String(beginnerAbilityName??"").trim().toUpperCase()!==skill.beginnersLuckAbility)
   return fail("BEGINNERS_LUCK_ABILITY_MISMATCH");
 let helpResult=null,wiseResult=null;
 if(help!==null){
   if(!help||typeof help!=="object"||!help.helperId||!help.helpOptions)
      return fail("EXPLICIT_HELP_ID_AND_SOURCE_REQUIRED");
   const target=type==="BEGINNERS_LUCK"?help.helpOptions.targetSkillName:help.helpOptions.testName;
   if(String(target??"").trim().toLowerCase()!==String(skillName).trim().toLowerCase())
      return fail("HELP_TARGET_SKILL_MISMATCH");
   helpResult=tb2eHelpParticipationPlan({
     ...help,helperRoute:type==="SKILL"?"STANDARD":"BEGINNERS_LUCK"
   });
   if(!helpResult.ok)return fail("HELP_"+helpResult.reasonCode);
 }
 if(wiseAid!==null){
   if(!wiseAid||typeof wiseAid!=="object"||!wiseAid.helperId||
      wiseAid.hasWise!==true||wiseAid.related!==true)return fail("EXPLICIT_WISE_AID_SOURCE_REQUIRED");
   if(help!==null&&String(help.helperId)===String(wiseAid.helperId))
      return fail("SAME_HELPER_CANNOT_HELP_AND_WISE_AID");
   wiseResult=tb2eWiseAidPlan({...wiseAid,alsoProvidingHelp:false});
   if(!wiseResult.ok)return fail("WISE_"+wiseResult.reasonCode);
 }
 const knownBonusKeys=["traitsDice","personaDice","channeledNatureDice","freshDice","otherBonusDice"];
 if(!bonuses||typeof bonuses!=="object"||Array.isArray(bonuses)||
    Object.keys(bonuses).some(k=>!knownBonusKeys.includes(k))||
    Object.values(bonuses).some(v=>!n(v)))return fail("INVALID_SCENARIO_BONUS_DICE");
 const values=Object.fromEntries(knownBonusKeys.map(k=>[k,bonuses[k]??0]));
 const conditions=tb2ePackageAConditionBoundaryPlan({
   skillName,scenarioType:type,actingCharacterId,actingConditions,conditionsGmReviewed,
   help,wiseAid,bonusTraitsDice:values.traitsDice,bonusFreshDice:values.freshDice,
   channelNatureDice:values.channeledNatureDice,channelNatureFacts,
   gmAngryObstacleDecision,actingOnInstinct,instinctTurnSpent
 });
 if(!conditions.ok)return fail("CONDITION_"+conditions.reasonCode);
 if(type==="SKILL"&&rating+conditions.abilityOrSkillConditionDice<=0)
   return fail("CONDITION_ZERO_RATED_SKILL_CANNOT_TEST");
 const helping=helpResult?1:0,wise=wiseResult?1:0;
 let pool;
 if(type==="BEGINNERS_LUCK"){
   pool=tb2eBeginnersLuckShadowPlan({
     abilityDice:Math.max(0,rating+conditions.abilityOrSkillConditionDice),wisesDice:wise,helpDice:helping,
     suppliesDice:gear.supplyDice,gearDice:gear.gearDice,
     traitsDice:values.traitsDice,personaDice:values.personaDice,
     channeledNatureDice:values.channeledNatureDice,freshDice:conditions.freshDiceAfterHalving,
     otherBonusDice:values.otherBonusDice,
     abilityZeroDueToInjuryOrSickness:abilityZeroFromInjuryOrSickness||
       (rating+conditions.abilityOrSkillConditionDice<=0&&conditions.abilityOrSkillConditionDice<0)
   });
 }else{
   pool=tb2eTestPoolPlan({
     basePool:rating,diceModifier:gear.bonusDice+helping+wise+
       conditions.abilityOrSkillConditionDice+conditions.freshDiceAfterHalving+
       Object.values(values).reduce((a,b)=>a+b,0)
   });
 }
 if(!pool.ok)return fail("POOL_"+pool.reasonCode);
 return safe({ok:true,skillName:skill.skill,scenarioType:type,
   baseRating:rating,obstacle:source.obstacle+env.obstacleIncrease+gear.obstacleIncrease+
     conditions.angryObstacleIncrease+conditions.instinctObstacleIncrease,
   factorObstacle:source.obstacle,lightAndSituationalOb:env.obstacleIncrease,
   equipmentObstacleIncrease:gear.obstacleIncrease,
   conditionObstacleIncrease:conditions.angryObstacleIncrease+conditions.instinctObstacleIncrease,
   finalDicePool:pool.finalPool,poolStage:type==="BEGINNERS_LUCK"?"HALVE_THEN_ADD":"ADD",
   helpingDice:helping,wiseAidDice:wise,
   actingCharacterId:conditions.actingCharacterId,
   actingConditionPenaltyDice:conditions.abilityOrSkillConditionDice,
   derivedFreshDice:conditions.freshDiceAfterHalving,
   actingConditionsGmReviewed:true,
   channelTaxOnPass:conditions.channelTaxOnPass,
   channelTaxOnFail:conditions.channelTaxOnFail,
   actingOnInstinct:Boolean(actingOnInstinct),exhaustedInstinctTurnSpent:Boolean(instinctTurnSpent),
   helpAndWiseFromDifferentCharacters:!(helpResult&&wiseResult)||
     String(help.helperId)!==String(wiseAid.helperId),
   gmScenarioInputsReviewed:true,actorEntitlementVerified:false,
   advancementAuthorized:false,conditionChangesAuthorized:false,
   noFoundryDocumentReads:true,resourceAuthorizationStillRequired:
     values.personaDice>0||values.channeledNatureDice>0,
   sourceFactorPage:tb2eNumericalFactorEntry({
     skillName,tableName:factor?.tableName
   }).sourcePage??null,
   poolAuthority:"GM_INPUT_PREVIEW_NOT_ACTOR_VERIFIED",
   sourceFactorReview:"GM_SELECTED_NO_LIVE_TEST_AUTHORIZATION"});
}
