import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
export const TB2E_MAGIC_CAST_MODES=freezeTb2e(["FIXED","FACTORS","VERSUS","SKILL_SWAP"]);
export const TB2E_MAGIC_PHASES=freezeTb2e(["ADVENTURE","CAMP","TOWN"]);
export const tb2eMagicKey=v=>String(v??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");
export const tb2eMagicCount=n=>Number.isInteger(n)&&n>=0;
export const tb2eMagicPositive=n=>Number.isInteger(n)&&n>=1;
export function tb2eMagicResult(fields){
 return freezeTb2e({phase:"M10D.18_P2.4",profileId:"torchbearer2e",
  mode:"READ_ONLY_SHADOW",liveEnabled:false,liveApplication:false,
  writesPlanned:0,actorWrite:false,itemWrite:false,journalWrite:false,
  settingWrite:false,spellWrite:false,resourceWrite:false,
  conditionWrite:false,rollExecuted:false,commitAllowed:false,
  sourceEvidence:"Dungeoneer's Handbook Arcana pp.89-97, Ritual pp.98-106; Scholar's Guide Conflicts p.79",...fields});
}
export const tb2eMagicBlocked=(reasonCode,detail={})=>tb2eMagicResult({ok:false,reasonCode,...detail});
export function tb2eMagicCircleSum(spells){
 if(!Array.isArray(spells)||spells.some(s=>!tb2eMagicPositive(s?.circle)))return null;
 return spells.reduce((n,s)=>n+s.circle,0);
}
