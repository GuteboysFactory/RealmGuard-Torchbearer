import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
const SOURCE="Scholar's Guide pp.102-105 (Town Recovery Options)";
const TABLE=freezeTb2e({
 STREETS:{baseLifestyle:0,freeTests:0,paidTests:0,allowed:[],automatic:[],bonuses:[]},
 STABLES:{baseLifestyle:1,freeTests:1,paidTests:0,allowed:["ANGRY","AFRAID","EXHAUSTED"],automatic:[],bonuses:[]},
 TAVERN:{baseLifestyle:1,freeTests:0,paidTests:1,allowed:["ANGRY"],automatic:["HUNGRY_THIRSTY"],bonuses:[]},
 FLOPHOUSE:{baseLifestyle:1,freeTests:1,paidTests:1,allowed:["ANGRY","AFRAID","EXHAUSTED","INJURED"],automatic:[],bonuses:[]},
 INN:{baseLifestyle:2,freeTests:2,paidTests:1,allowed:["ANGRY","AFRAID","EXHAUSTED","INJURED","SICK"],
   automatic:["HUNGRY_THIRSTY"],bonuses:["ANGRY","AFRAID","EXHAUSTED"]},
 HOTEL:{baseLifestyle:3,freeTests:2,paidTests:2,allowed:["ANGRY","AFRAID","INJURED","SICK"],
   automatic:["HUNGRY_THIRSTY","EXHAUSTED"],bonuses:["INJURED","SICK"]}
});
const conditionKey=x=>String(x??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");
const aliases={HUNGRY_AND_THIRSTY:"HUNGRY_THIRSTY",HUNGRY:"HUNGRY_THIRSTY",THIRSTY:"HUNGRY_THIRSTY",FEAR:"AFRAID",ANGER:"ANGRY",INJURY:"INJURED",SICKNESS:"SICK"};
const result=data=>freezeTb2e({phase:"M10D.18_P3.3",profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
 sourceEvidence:SOURCE,liveApplication:false,writesPlanned:0,rollExecuted:false,
 actorWrite:false,itemWrite:false,conditionMutationCommitted:false,lifestyleCostCommitted:false,...data});
const blocked=code=>result({ok:false,reasonCode:code});
export function tb2eTownRecoveryVenueModel(){return TABLE;}
export function tb2eTownRecoveryVenuePlan({venue="",condition="",freeTestsUsed=0,paidTestsRequested=0}={}){
 const v=String(venue??"").trim().toUpperCase();
 if(v==="HOME")return blocked("HOME_EQUIVALENT_LODGING_REQUIRES_GM_SELECTION");
 const entry=TABLE[v];if(!entry)return blocked("UNKNOWN_TOWN_RECOVERY_VENUE");
 const parsed=conditionKey(condition);const c=aliases[parsed]??parsed;
 if(!["HUNGRY_THIRSTY","ANGRY","AFRAID","EXHAUSTED","INJURED","SICK"].includes(c))
  return blocked("INVALID_TOWN_RECOVERY_CONDITION");
 if(!Number.isInteger(freeTestsUsed)||freeTestsUsed<0||freeTestsUsed>entry.freeTests)
  return blocked("INVALID_FREE_RECOVERY_TEST_USAGE");
 if(!Number.isInteger(paidTestsRequested)||paidTestsRequested<0||paidTestsRequested>entry.paidTests)
  return blocked("PAID_RECOVERY_TEST_ALLOWANCE_EXCEEDED");
 const automatic=entry.automatic.includes(c),testAvailable=entry.allowed.includes(c);
 if(!automatic&&!testAvailable)return blocked("VENUE_DOES_NOT_SUPPORT_CONDITION_RECOVERY");
 return result({ok:true,venue:v,condition:c,automaticRecovery:automatic,standardTestAllowed:testAvailable,
  recoveryBonusDice:entry.bonuses.includes(c)?1:0,freeTestsAvailable:entry.freeTests-freeTestsUsed,
  paidTestsAllowed:entry.paidTests,paidTestsRequested,
  baseLifestyleCost:entry.baseLifestyle,additionalLifestyleCost:paidTestsRequested,
  totalLifestylePreview:entry.baseLifestyle+paidTestsRequested,gmConditionTestSequencingRequired:true});
}
