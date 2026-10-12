import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageAActorEvidence} from "./m10d18-tb2e-package-a-actor-evidence.mjs";

const response=(ok,reasonCode=null,data={})=>freezeTb2e({ok,reasonCode,
  phase:"M10D.18_PACKAGE_A",mode:"EXPLICIT_LEGACY_OBSERVATION_PROBE",
  sourceEvidence:"DH 59,77,108-110; SG 87-88",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,journalWrite:false,
  settingsWrite:false,rollExecuted:false,resourceSpendCommitted:false,advancementWrite:false,
  learningWrite:false,rollSourceAuthenticated:false,actorSourceAuthenticated:false,
  gmPermissionAuthenticated:false,playerConsentAuthenticated:false,rollTimeActorStateVerified:false,
  historicalRewardBalanceVerified:false,completeTestHistoryVerified:false,
  immutableChronologyVerified:false,duplicateTestCheckAuthenticated:false,
  captureStorageImplemented:false,legacyHookInstalled:false,noAdvanceAuthorized:true,...data});
const fields=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const id=x=>typeof x==="string"&&/^[A-Za-z0-9_-]{1,100}$/.test(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const withoutRewards=snapshot=>({...snapshot,currentRewards:null});

/** Explicit manual diagnostic only. Never called from Legacy or startup.
 * Native class/face and current-session checks are not proof that a supplied
 * Roll was executed by Legacy, nor immutable historical evidence.
 */
export function tb2ePackageALegacyObservationProbe(options={}){
  try{
    const initial=tb2ePackageAActorEvidence({actorId:options?.actorId});
    if(!initial.ok)return response(false,initial.reasonCode);
    if(!fields(options,["actorId","skillItemId","testId"])||!id(options.testId)||!id(options.skillItemId))
      return response(false,"OBSERVATION_IDENTITIES_REQUIRED");
    options=Object.freeze({actorId:options.actorId,skillItemId:options.skillItemId,testId:options.testId});
    const source=initial.currentSkillItems.filter(i=>i.itemId===options.skillItemId);
    if(source.length!==1||!Number.isInteger(source[0].rating)||source[0].rating<1||source[0].rating>6)
      return response(false,"OBSERVATION_CURRENT_TRAINED_SKILL_REQUIRED");
    const g=globalThis.game;
    if(!id(g.world?.id)||g.settings.get("realm-guard","activeRulesProfileId")!=="realm-guard-legacy-mixed")
      return response(false,"OBSERVATION_LEGACY_WORLD_REQUIRED");
    const worldId=g.world.id,gmId=initial.currentGmId;
    let status="OPEN",base=null,expectedRewards={...initial.currentRewards};
    const spends=[];
    const failure=reason=>{status="INCOMPLETE";base=null;spends.length=0;return response(false,reason,{status});};
    const refresh=()=>{
      if(status!=="OPEN")return response(false,"OBSERVATION_SESSION_TERMINAL",{status});
      const current=tb2ePackageAActorEvidence({actorId:options.actorId});
      if(!current.ok)return failure(current.reasonCode);
      if(current.currentGmId!==gmId||globalThis.game.world?.id!==worldId||
         globalThis.game.settings.get("realm-guard","activeRulesProfileId")!=="realm-guard-legacy-mixed")
        return failure("OBSERVATION_SESSION_SCOPE_CHANGED");
      if(!same(withoutRewards(current),withoutRewards(initial)))return failure("OBSERVATION_ACTOR_CONTEXT_CHANGED");
      return current;
    };
    const observeBaseRoll=roll=>{
      try{
        const current=refresh();if(!current.ok)return current;
        if(base)return failure("OBSERVATION_BASE_ALREADY_RECORDED");
        if(!same(current.currentRewards,expectedRewards))return failure("OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
        const RollClass=globalThis.Roll,DieClass=globalThis.foundry?.dice?.terms?.Die;
        if(typeof RollClass!=="function"||roll?.constructor!==RollClass||roll._evaluated!==true||
          !Array.isArray(roll.terms)||roll.terms.length!==1)return failure("OBSERVATION_NATIVE_PLAIN_D6_REQUIRED");
        const term=roll.terms[0];
        if(typeof DieClass!=="function"||term?.constructor!==DieClass||term.faces!==6||
          !Number.isInteger(term.number)||term.number<1||term.number>250||roll.formula!==`${term.number}d6`||
          !Array.isArray(term.modifiers)||term.modifiers.length||!Array.isArray(term.results)||term.results.length!==term.number||
          !term.results.every(d=>Number.isInteger(d.result)&&d.result>=1&&d.result<=6&&d.active===true&&
            !d.discarded&&!d.rerolled&&!d.exploded))return failure("OBSERVATION_NATIVE_PLAIN_D6_REQUIRED");
        const faces=term.results.map(d=>d.result);
        if(roll.total!==faces.reduce((sum,face)=>sum+face,0))return failure("OBSERVATION_NATIVE_ROLL_TOTAL_MISMATCH");
        base=freezeTb2e({recordId:`${options.testId}:base`,formula:roll.formula,total:roll.total,
          dice:faces.map((face,index)=>({dieId:`${options.testId}:base:${index}`,face}))});
        return response(true,null,{status,nativePlainD6ObjectObserved:true});
      }catch{return failure("OBSERVATION_ROLL_READ_FAILED");}
    };
    const observeResourceChange=receipt=>{
      try{
        const current=refresh();if(!current.ok)return current;
        if(!base)return failure("OBSERVATION_BASE_REQUIRED_BEFORE_RESOURCE_CHANGE");
        if(!fields(receipt,["resource","amount"])||!["fate","persona"].includes(receipt.resource)||
          !Number.isSafeInteger(receipt.amount)||receipt.amount<1)return failure("OBSERVATION_RESOURCE_DECLARATION_INVALID");
        const {resource,amount}=receipt,other=resource==="fate"?"persona":"fate",before=expectedRewards[resource];
        if(before<amount||current.currentRewards[resource]!==before-amount||
          current.currentRewards[other]!==expectedRewards[other])return failure("OBSERVATION_RESOURCE_DELTA_MISMATCH");
        spends.push(freezeTb2e({sequence:spends.length,actorId:options.actorId,resource,amount,
          before,after:current.currentRewards[resource]}));
        expectedRewards={...current.currentRewards};
        return response(true,null,{status,currentResourceDeltaObserved:true,
          spendCauseAuthenticated:false});
      }catch{return failure("OBSERVATION_RESOURCE_READ_FAILED");}
    };
    const finish=()=>{
      try{
        const current=refresh();if(!current.ok)return current;
        if(!base)return failure("OBSERVATION_NATIVE_BASE_MISSING");
        if(!same(current.currentRewards,expectedRewards))return failure("OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
        status="OBSERVED_UNPERSISTED";
        return response(true,null,{status,testIdentity:{worldId,testId:options.testId,actorId:options.actorId},
          currentGmId:gmId,startingActorSnapshot:initial,skillSource:source[0],baseRecord:base,
          resourceChanges:spends.slice(),observedEndingRewards:{...expectedRewards},
          observationStorage:"IN_MEMORY_ONLY",observationCoverage:"BASE_ROLL_AND_ACTING_RESOURCE_DELTAS_ONLY",
          captureOfLegacyExecutionProven:false,rerollParentHistoryCaptured:false,
          finalOutcomeDerived:false,compatibleWithCompleteProspectiveTrace:false});
      }catch{return failure("OBSERVATION_FINISH_READ_FAILED");}
    };
    const abort=()=>{
      try{
        const current=refresh();if(!current.ok)return current;
        return failure("OBSERVATION_ABORTED_BY_CALLER");
      }catch{return failure("OBSERVATION_ABORT_READ_FAILED");}
    };
    return Object.freeze({...response(true,null,{status,startingScope:"CURRENT_GM_LEGACY_WORLD_TRAINED_SKILL"}),
      observeBaseRoll,observeResourceChange,finish,abort});
  }catch{return response(false,"OBSERVATION_START_READ_FAILED");}
}
