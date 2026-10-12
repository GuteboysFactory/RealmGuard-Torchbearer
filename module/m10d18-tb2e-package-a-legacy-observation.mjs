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
    const spends=[],history=[],resolved=new Map(),observedRolls=new WeakSet();
    let wiseObserved=false,luckStarted=false,luckRounds=0;
    const failure=reason=>{status="INCOMPLETE";base=null;spends.length=0;history.length=0;resolved.clear();return response(false,reason,{status});};
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
    const readNative= (roll,recordId)=>{
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
        if(observedRolls.has(roll))return failure("OBSERVATION_NATIVE_ROLL_REUSED");
        observedRolls.add(roll);
        return freezeTb2e({recordId,formula:roll.formula,total:roll.total,
          dice:faces.map((face,index)=>({dieId:`${recordId}:${index}`,face}))});
    };
    const observeBaseRoll=roll=>{
      try{
        const current=refresh();if(!current.ok)return current;
        if(base)return failure("OBSERVATION_BASE_ALREADY_RECORDED");
        if(!same(current.currentRewards,expectedRewards))return failure("OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
        const record=readNative(roll,`${options.testId}:base`);if(record.ok===false)return record;
        base=record;for(const d of base.dice)resolved.set(d.dieId,{...d,opened:false,lastResultDieId:d.dieId});
        return response(true,null,{status,nativePlainD6ObjectObserved:true});
      }catch{return failure("OBSERVATION_ROLL_READ_FAILED");}
    };
    const observeLegacyWiseRoll=event=>{
      try{
        const current=refresh();if(!current.ok)return current;
        if(!base||wiseObserved||luckStarted)return failure("OBSERVATION_LEGACY_WISE_STAGE_INVALID");
        if(!same(current.currentRewards,expectedRewards))return failure("OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
        if(!fields(event,["roll","targetDieIds","wiseItemId"])||!id(event.wiseItemId)||
          initial.currentWiseItems.filter(i=>i.itemId===event.wiseItemId).length!==1)
          return failure("OBSERVATION_CURRENT_WISE_REQUIRED");
        // Legacy Mixed rerolls ALL failed indexes for its Wise effect. Do not
        // relabel this free Legacy effect as TB Deeper/Of Course or charge it.
        const targets=[...resolved.values()].filter(d=>d.face<4).map(d=>d.dieId);
        if(!targets.length||!same(event.targetDieIds,targets))return failure("OBSERVATION_LEGACY_WISE_TARGET_SET_MISMATCH");
        const record=readNative(event.roll,`${options.testId}:legacyWise`);if(record.ok===false)return record;
        if(record.dice.length!==targets.length)return failure("OBSERVATION_REROLL_RESULT_COUNT_MISMATCH");
        history.push(freezeTb2e({kind:"LEGACY_MIXED_WISE_REROLL",wiseItemId:event.wiseItemId,
          record,links:record.dice.map((d,i)=>({resultDieId:d.dieId,targetDieId:targets[i]})),
          torchbearerWiseEffectEquivalent:false}));
        targets.forEach((target,i)=>{resolved.get(target).face=record.dice[i].face;
          resolved.get(target).lastResultDieId=record.dice[i].dieId;});wiseObserved=true;
        return response(true,null,{status,legacyWiseTargetsObserved:true,torchbearerWiseEffectEquivalent:false});
      }catch{return failure("OBSERVATION_WISE_READ_FAILED");}
    };
    const unopenedSixes=()=>[...resolved.values()].filter(d=>d.face===6&&!d.opened).map(d=>d.dieId);
    const observeFateRound=event=>{
      try{
        const current=refresh();if(!current.ok)return current;
        if(!base||luckRounds>=30)return failure("OBSERVATION_FATE_STAGE_INVALID");
        if(!same(current.currentRewards,expectedRewards))return failure("OBSERVATION_UNRECORDED_RESOURCE_CHANGE");
        const parents=unopenedSixes();
        if(!fields(event,["roll","parentDieIds"])||!parents.length||!same(event.parentDieIds,parents))
          return failure("OBSERVATION_FATE_PARENT_SET_MISMATCH");
        const record=readNative(event.roll,`${options.testId}:luck${luckRounds}`);if(record.ok===false)return record;
        if(record.dice.length!==parents.length)return failure("OBSERVATION_FATE_RESULT_COUNT_MISMATCH");
        if(resolved.size+record.dice.length>500)return failure("OBSERVATION_DICE_HISTORY_LIMIT");
        history.push(freezeTb2e({kind:"LEGACY_FATE_ROUND",record,
          links:record.dice.map((d,i)=>({resultDieId:d.dieId,parentDieId:parents[i],
            parentResultDieId:resolved.get(parents[i]).lastResultDieId}))}));
        parents.forEach(parent=>{resolved.get(parent).opened=true;});
        record.dice.forEach(d=>resolved.set(d.dieId,{...d,opened:false,lastResultDieId:d.dieId}));luckStarted=true;luckRounds++;
        return response(true,null,{status,fateParentsObserved:true,recursiveContinuationRequired:unopenedSixes().length>0});
      }catch{return failure("OBSERVATION_FATE_READ_FAILED");}
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
        if(luckStarted&&unopenedSixes().length)return failure("OBSERVATION_FATE_CHAIN_INCOMPLETE");
        if(luckStarted&&!spends.some(s=>s.resource==="fate"&&s.amount===1))
          return failure("OBSERVATION_FATE_DELTA_MISSING");
        if(luckStarted&&spends.filter(s=>s.resource==="fate").length!==1)
          return failure("OBSERVATION_FATE_DELTA_AMBIGUOUS");
        status="OBSERVED_UNPERSISTED";
        return response(true,null,{status,testIdentity:{worldId,testId:options.testId,actorId:options.actorId},
          currentGmId:gmId,startingActorSnapshot:initial,skillSource:source[0],baseRecord:base,
          resourceChanges:spends.slice(),observedEndingRewards:{...expectedRewards},
          observationStorage:"IN_MEMORY_ONLY",observationCoverage:"BASE_OPTIONAL_LEGACY_WISE_FATE_AND_ACTING_DELTAS",
          nativeEventHistory:history.slice(),resolvedObservedDice:[...resolved.values()].map(({dieId,face,lastResultDieId})=>({dieId,face,lastResultDieId})),
          captureOfLegacyExecutionProven:false,rerollParentHistoryCaptured:history.length>0,
          spendCauseAuthenticated:false,torchbearerWiseEffectEquivalent:false,
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
      observeBaseRoll,observeLegacyWiseRoll,observeFateRound,observeResourceChange,finish,abort});
  }catch{return response(false,"OBSERVATION_START_READ_FAILED");}
}
