import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import { tb2eNumericalFactorObstaclePlan, tb2eNumericalFactorFormulaPlan } from "./m10d18-tb2e-package-a-factor-values.mjs";
const SOURCE="Scholar's Guide pp.27, 32-34";
const ACTIONS=Object.freeze(["SKILL","WILL","HEALTH","NATURE","MONSTER"]);
const number=v=>Number.isInteger(v)&&v>=0;
function plan(data){return freezeTb2e({phase:"M10D.18_P3.1",profileId:"torchbearer2e",
 mode:"READ_ONLY_SHADOW",sourceEvidence:SOURCE,liveApplication:false,
 writesPlanned:0,actorWrite:false,itemWrite:false,rollExecuted:false,
 advancementWrite:false,resourceSpendCommitted:false,...data});}
function block(reasonCode){return plan({ok:false,reasonCode});}

/** Factors must be selected by the GM from a source-authorized entry.
 * Standalone categories are alternatives, not extra contributions.
 */
export function tb2eFactorObstaclePlan({factors=[]}={}){
 if(!Array.isArray(factors)||factors.length===0)return block("FACTORS_REQUIRED");
 if(factors.some(f=>!f||typeof f.category!=="string"||!f.category.trim()||
   !number(f.value)||typeof f.additive!=="boolean"))return block("INVALID_FACTOR");
 const primary=factors.filter(f=>!f.additive);
 if(primary.length!==1)return block("EXACTLY_ONE_PRIMARY_FACTOR_REQUIRED");
 const categories=factors.map(f=>f.category.trim().toLowerCase());
 if(new Set(categories).size!==categories.length)return block("DUPLICATE_FACTOR_CATEGORY");
 const obstacle=factors.reduce((sum,f)=>sum+f.value,0);
 return plan({ok:true,obstacle,sourceFactorSelection:"GM_SUPPLIED",
  factorEntries:factors.map(f=>({category:f.category,value:f.value,additive:f.additive})),
  sourceFactorCatalogueLookup:false,gmAuthorizationRequired:true,
  resultCommitted:false});
}

/** In versus tests factors are -1s, not additional obstacle. */
export function tb2eVersusFactorPlan({applicableFactors=0}={}){
 if(!number(applicableFactors))return block("INVALID_FACTOR_COUNT");
 return plan({ok:true,applicableFactors,successModifier:applicableFactors===0?0:-applicableFactors,
  obstacleIncrease:0,factorsSelectedBy:"GM",modifierCommitted:false});
}

export function tb2eTieBreakerPlan({initialSourceKind="",beginnersLuckAbility="",natureFallbackAbility="",
 tiebreakRollOutcome="PENDING",secondTieBrokenInPlayerFavor=false,
 playerVersusMonster=false}={}){
 const source=String(initialSourceKind).trim().toUpperCase();
 const fallback=String(beginnersLuckAbility).trim().toUpperCase();
 const fromNature=String(natureFallbackAbility).trim().toUpperCase();
 const result=String(tiebreakRollOutcome).trim().toUpperCase();
 if(!ACTIONS.includes(source))return block("INVALID_INITIAL_SOURCE");
 if(source==="SKILL"&&!["WILL","HEALTH"].includes(fallback))
  return block("SKILL_BEGINNERS_LUCK_ABILITY_REQUIRED");
 if(source==="NATURE"&&!["WILL","HEALTH"].includes(fromNature))
  return block("NATURE_TIEBREAKER_ABILITY_REQUIRED");
 if(!["PENDING","PASS","FAIL","TIE"].includes(result))return block("INVALID_TIEBREAKER_RESULT");
 const tiebreakAbility=source==="SKILL"?fallback:
   ["WILL","HEALTH"].includes(source)?"NATURE":
   source==="NATURE"?fromNature:"NATURE";
 const finalOutcome=result==="TIE"?
  (secondTieBrokenInPlayerFavor?"PASS":"FAIL"):result;
 return plan({ok:true,initialSourceKind:source,
  tiebreakAbility,tiebreakMonsterAbility:"Nature",
  noHelpAllowed:true,requiresNewVersusTest:true,
  initialTestAdvancement:"NO_MARK_WHEN_TIEBREAKER_SELECTED",
  advancementOnlyFromTiebreakRoll:true,
  secondTieOutcome:result==="TIE"?"PLAYER_FAILS_UNLESS_BROKEN_IN_FAVOR":"NOT_APPLICABLE",
  tiebreakRollOutcome:result,finalOutcome,
  monsterOpponent:Boolean(playerVersusMonster),
  finalOutcomeGmAdjudicationRequired:result==="TIE",
  advancementCommitted:false,rollExecuted:false});
}

/** Source-bound factors route through the DH table catalogue. Original GM-supplied
 * factors route remains available separately for historical read-only tools.
 */
export function tb2eSourceBoundFactorPlan(options={}){
 const kind=String(options?.factorMode??"TABLE").trim().toUpperCase();
 if(kind==="TABLE")return tb2eNumericalFactorObstaclePlan(options);
 if(kind==="FORMULA")return tb2eNumericalFactorFormulaPlan(options);
 return freezeTb2e({ok:false,reasonCode:"UNKNOWN_SOURCE_FACTOR_MODE",
   profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
   liveApplication:false,writesPlanned:0});
}
