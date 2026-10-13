import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eNumericalFactorEntry} from "./m10d18-tb2e-package-a-factor-values.mjs";
const result=(ok,reasonCode=null,extra={})=>freezeTb2e({
 ok,reasonCode,profileId:"torchbearer2e",phase:"M10D.18_PACKAGE_A",mode:"READ_ONLY_SHADOW",
 sourceEvidence:"DH p.73; SG p.27",liveApplication:false,writesPlanned:0,rollExecuted:false,
 actorWrite:false,itemWrite:false,settingWrite:false,resourceSpendCommitted:false,...extra
});
const FACT_KEYS=["languageUnderstood","hasLoom","hasCraftOrCrew","instructorSkillRating",
 "studentSkillRating","mountAvailable","mountTrainingVerified"];
/** Treat nested provenance only as declared facts, never a way to replace
 * skillName, tableName, selections, or approval on the outer request.
 */
export function tb2eSourceFactorInputGuard({
 skillName="",tableName="",factorMode="TABLE",selections={},
 preconditionFacts={},gmExcludedAdditives=[],gmExclusionReason=""
}={}){
 const entry=tb2eNumericalFactorEntry({skillName,tableName});
 if(!entry.ok)return entry;
 if(!preconditionFacts||typeof preconditionFacts!=="object"||Array.isArray(preconditionFacts)||
   Object.keys(preconditionFacts).some(key=>!FACT_KEYS.includes(key)))
   return result(false,"INVALID_PRECONDITION_FACT_FIELDS");
 const context=Object.fromEntries(FACT_KEYS.filter(k=>Object.hasOwn(preconditionFacts,k))
   .map(k=>[k,preconditionFacts[k]]));
 if(Object.entries(context).some(([k,v])=>k.endsWith("Rating")?
   !Number.isInteger(v):typeof v!=="boolean"))
   return result(false,"INVALID_PRECONDITION_FACT_VALUE");
 if(String(factorMode).toUpperCase()!=="TABLE")return result(true,null,{verifiedFacts:context,
   gmExcludedAdditives:[],factorCompletenessChecked:false});
 if(entry.table.kind!=="FIXED")return result(true,null,{verifiedFacts:context,
   gmExcludedAdditives:[],factorCompletenessChecked:false});
 if(!selections||typeof selections!=="object"||Array.isArray(selections))
   return result(false,"INVALID_FACTOR_SELECTION");
 const exclusions=gmExcludedAdditives;
 if(!Array.isArray(exclusions)||exclusions.some(k=>typeof k!=="string")||
   new Set(exclusions).size!==exclusions.length)
   return result(false,"INVALID_ADDITIVE_EXCLUSION_LIST");
 const optional=(column)=>entry.skillName==="Survivalist"&&entry.tableName==="camp"&&column.id==="amenity";
 const additive=entry.table.columns.filter(c=>c.additive);
 if(exclusions.some(id=>!additive.some(c=>c.id===id&&!optional(c))||
   Object.hasOwn(selections,id)))
   return result(false,"INVALID_ADDITIVE_EXCLUSION");
 const missing=additive.filter(c=>!optional(c)&&!Object.hasOwn(selections,c.id)&&
   !exclusions.includes(c.id)).map(c=>c.id);
 if(missing.length)return result(false,"ADDITIVE_FACTOR_CONFIRMATION_REQUIRED",{missingCategories:missing});
 if(exclusions.length&&!(typeof gmExclusionReason==="string"&&gmExclusionReason.trim()))
   return result(false,"GM_ADDITIVE_EXCLUSION_REASON_REQUIRED");
 return result(true,null,{verifiedFacts:context,gmExcludedAdditives:exclusions,
   factorCompletenessChecked:true,gmExclusionDocumented:exclusions.length>0});
}
