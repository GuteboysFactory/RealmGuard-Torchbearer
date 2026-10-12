import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";

const shadow=data=>freezeTb2e({
 phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
 sourceEvidence:"Scholar's Guide pp.32-34; Dungeoneer's Handbook pp.73-74",
 liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
 journalWrite:false,rollExecuted:false,obstacleWrite:false,
 resourceSpendCommitted:false,...data
});
const invalid=(reasonCode,details={})=>shadow({ok:false,reasonCode,...details});
const nonNegInt=v=>Number.isInteger(v)&&v>=0;
/**
 * SG 34: Dim Light adds a factor; Darkness adds a factor only for
 * actions possible in darkness (riddling excepted).
 * SG 32: Versus factors are -1 success, never +1 Ob.
 * No GM situation judgment is automated.
 */
export function tb2eEnvironmentalTestFactorPlan({
  light="CLEAR",testMode="OBSTACLE",actionPossibleInDarkness=false,
  darknessFactorExempt=false,additionalGmHindrances=0
}={}){
 const mode=String(testMode??"").trim().toUpperCase();
 const lighting=String(light??"").trim().toUpperCase();
 if(!["OBSTACLE","VERSUS"].includes(mode))return invalid("INVALID_TEST_MODE");
 if(!["CLEAR","DIM_LIGHT","DARKNESS"].includes(lighting))return invalid("INVALID_LIGHT_STATE");
 if(!nonNegInt(additionalGmHindrances))return invalid("INVALID_GM_HINDRANCE_COUNT");
 if(lighting==="DARKNESS"&&actionPossibleInDarkness!==true)
  return invalid("DARKNESS_ACTION_NOT_CONFIRMED_POSSIBLE",{gmAdjudicationRequired:true});
 if(lighting!=="DARKNESS"&&darknessFactorExempt===true)
  return invalid("DARKNESS_EXEMPTION_WITHOUT_DARKNESS");
 const lightFactors=lighting==="DIM_LIGHT"?1:lighting==="DARKNESS"&&!darknessFactorExempt?1:0;
 const factorCount=lightFactors+additionalGmHindrances;
 return shadow({ok:true,testMode:mode,light:lighting,lightFactorCount:lightFactors,
  additionalGmHindrances,totalApplicableFactors:factorCount,
  obstacleIncrease:mode==="OBSTACLE"?factorCount:0,
  successModifier:mode==="VERSUS"?-factorCount:0,
  darknessFactorExempt:Boolean(darknessFactorExempt),
  sourceFactorsSelectedBy:"GM",lightApplicationCommitted:false});
}
