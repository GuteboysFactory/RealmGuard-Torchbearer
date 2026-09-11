import { getTestEngine } from "./test-engine-service.mjs";
import { runLegacyCoreTestParity, TEST_PARITY_FIELDS } from "./core/test-parity.mjs";

const HISTORY_LIMIT = 50;
const INSTRUMENTED_METHODS = Object.freeze(["rollRole","rollAbility","rollBeginnerLuck","rollAutomaticVersus","rollNatureVersus"]);
const traceByActor = new WeakMap();
const history = [];
let sequence = 0;
let installed = false;

function clone(value){if(value===undefined)return undefined;if(value===null||typeof value!=="object")return value;if(Array.isArray(value))return value.map(clone);return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)]));}
function deepFreeze(value){if(!value||typeof value!=="object"||Object.isFrozen(value))return value;for(const entry of Object.values(value))deepFreeze(entry);return Object.freeze(value);}
function rollFaces(roll){return Array.from(roll?.dice??[]).flatMap(d=>Array.from(d?.results??[]).map(r=>Number(r?.result))).filter(v=>Number.isInteger(v)&&v>=1&&v<=6);}
function helperFaces(trace,key){const entries=trace?.[key]??[];const latest=entries.length?entries[entries.length-1]:null;return Array.isArray(latest?.faces)&&latest.faces.length?[...latest.faces]:null;}
function allHelperFaces(trace,key){return (trace?.[key]??[]).flatMap(e=>Array.isArray(e?.faces)?e.faces.map(Number):[]).filter(v=>Number.isInteger(v)&&v>=1&&v<=6);}
function resolvedOwnFaces(result,trace){let faces=rollFaces(result?.roll);const wise=helperFaces(trace,"wiseResults");if(wise)faces=wise;const token=helperFaces(trace,"tokenResults");if(token)faces=token;return faces;}
function pushHistory(entry){history.push(deepFreeze(entry));while(history.length>HISTORY_LIMIT)history.shift();return history[history.length-1];}
function recordSkipped(actor,method,reason,detail={}){const entry=pushHistory({id:`m3-shadow-${Date.now()}-${++sequence}`,timestamp:new Date().toISOString(),status:"SKIPPED",reason,method,actorId:actor?.id??null,actorName:actor?.name??"",detail:clone(detail)});console.info("realm-guard | CORE M3 Test parity skipped",entry);return entry;}
function recordError(actor,method,error){const entry=pushHistory({id:`m3-shadow-${Date.now()}-${++sequence}`,timestamp:new Date().toISOString(),status:"ERROR",reason:"PARITY_OBSERVER_ERROR",method,actorId:actor?.id??null,actorName:actor?.name??"",detail:{message:String(error?.message??error??"Unknown parity observer error")}});console.warn("realm-guard | CORE M3 Test parity observer error (live Legacy result preserved)",error,entry);return entry;}
function recordParity(actor,method,spec){const id=`m3-shadow-${Date.now()}-${++sequence}`;const comparison=runLegacyCoreTestParity(getTestEngine(),{id,actorId:actor?.id??null,actorName:actor?.name??"",...spec,provenance:{method,realLegacyRoll:true,...(spec.provenance??{})}},{id,provenance:{source:"REAL_LEGACY_MIXED_ROLL",observerOnly:true}});const entry=pushHistory({id,timestamp:new Date().toISOString(),status:comparison.parity.all?"MATCH":"MISMATCH",method,actorId:actor?.id??null,actorName:actor?.name??"",comparison});(comparison.parity.all?console.info:console.warn).call(console,`realm-guard | CORE M3 Test parity ${entry.status}`,entry);return entry;}

function normalizeTieTrace(trace){const entry=trace?.tieResolutions?.length?trace.tieResolutions[trace.tieResolutions.length-1]:null;if(!entry)return null;const tie=entry.result??{};return {method:tie.method??"pending",resolved:Boolean(tie.resolved),ownTieFaces:Array.from(tie.ownTieFaces??[]).map(Number),oppTieFaces:Array.from(tie.oppTieFaces??[]).map(Number),finalOwnSuccesses:tie.finalOwnSuccesses??null,finalOpponentSuccesses:tie.finalOpponentSuccesses??null,ownAbility:tie.ownAbility??null,oppAbility:tie.oppAbility??null,opponentFaces:Array.from(entry.args?.[0]?.opponentFaces??[]).map(Number)};}
function abilityContext(abilityKey){const key=String(abilityKey??"").toLowerCase();if(key==="nature")return "nature";if(key==="circles")return "circles";return "ability";}

function paritySpecFor(actor,method,args,result,trace){
  if(!result||typeof result!=="object"||!result.roll)return null;
  const initialFaces=rollFaces(result.roll),faces=resolvedOwnFaces(result,trace),supplementalFaces=allHelperFaces(trace,"fateExplosions"),pool=initialFaces.length,successes=Number(result.successes??0),outcome=String(result.outcome??"").toUpperCase(),margin=Number(result.margin??0);
  if(!pool||!faces.length)return {skipped:"NO_RESOLVED_DICE_AVAILABLE"};
  if(!["PASS","FAIL","TIE"].includes(outcome))return {skipped:"NO_FINAL_LEGACY_OUTCOME"};
  const common={pool,faces,supplementalFaces,successes,outcome,margin,provenance:{fateOpenSix:Boolean(result.fateSpent),supplementalFaceCount:supplementalFaces.length}};
  if(Boolean(result.fateSpent)&&supplementalFaces.length===0&&!result.tieResolution?.fateFaces?.length&&!trace?.tieResolutions?.length)return {skipped:"FATE_TRACE_UNAVAILABLE"};

  if(method==="rollRole"){
    const [role,options={}]=args;
    return {...common,context:"ordinary",target:Math.max(0,Number(options?.obstacle??1)),sourceId:role?.id??null,sourceName:role?.name??"Skill",provenance:{...common.provenance,targetSource:"legacy-options.obstacle",semanticContext:"trained-skill"}};
  }

  if(method==="rollAbility"){
    const [abilityKey,options={}]=args;
    const key=String(abilityKey??"").toLowerCase();
    const sourceName=typeof actor?._abilityLabel==="function"?actor._abilityLabel(abilityKey):String(abilityKey??"Ability");
    return {...common,context:abilityContext(key),target:Math.max(0,Number(options?.obstacle??1)),sourceId:key,sourceName,provenance:{...common.provenance,targetSource:"legacy-options.obstacle",abilityKey:key,semanticContext:key==="nature"?"nature":key==="circles"?"circles":key==="resources"?"resources":"ability"}};
  }

  if(method==="rollBeginnerLuck"){
    const [role,options={}]=args;const isVersus=Boolean(options?.opponent&&options?.opposition);let target=Math.max(0,Number(options?.obstacle??1));let versusResolution=null;
    if(isVersus){versusResolution=normalizeTieTrace(trace);if(versusResolution?.opponentFaces?.length)target=versusResolution.opponentFaces.filter(v=>v>=4).length;else if(outcome==="PASS")target=Math.max(0,successes-margin);else if(outcome==="FAIL")target=successes+margin;else target=successes;}
    return {...common,context:"beginnerLuck",versus:isVersus,target,sourceId:role?.id??null,sourceName:role?.name??"Untrained Skill",versusResolution,provenance:{...common.provenance,targetSource:isVersus?(versusResolution?.opponentFaces?.length?"legacy-tie-opponent-faces":"legacy-outcome-margin-reconstruction"):"legacy-options.obstacle",abilityKey:String(options?.abilityKey??"will"),opponentId:options?.opponent?.id??null,opponentName:options?.opponent?.name??"",oppositionName:options?.opposition?.name??"",semanticContext:"beginner-luck"}};
  }

  if(method==="rollAutomaticVersus"){
    const [role,opponent,opposition]=args;const tie=result.tieResolution??null;const versusResolution=tie?{method:tie.method??"pending",resolved:Boolean(tie.resolved),ownTieFaces:Array.from(tie.ownTieFaces??[]).map(Number),oppTieFaces:Array.from(tie.oppTieFaces??[]).map(Number),finalOwnSuccesses:tie.finalOwnSuccesses??null,finalOpponentSuccesses:tie.finalOpponentSuccesses??null,ownAbility:tie.ownAbility??null,oppAbility:tie.oppAbility??null}:null;
    return {...common,context:"versus",versus:true,target:Math.max(0,Number(result.opponentSuccesses??0)),sourceId:role?.id??null,sourceName:role?.name??"Skill",versusResolution,provenance:{...common.provenance,targetSource:"legacy-result.opponentSuccesses",opponentId:opponent?.id??null,opponentName:opponent?.name??"",oppositionName:opposition?.name??result.opponentName??"",tieResolutionMethod:tie?.method??null,semanticContext:"trained-skill-versus"}};
  }

  if(method==="rollNatureVersus"){
    const [opponent]=args;
    return {...common,context:"nature",versus:true,target:Math.max(0,Number(result.opponentSuccesses??0)),sourceId:"nature",sourceName:"Nature",provenance:{...common.provenance,targetSource:"legacy-result.opponentSuccesses",opponentId:opponent?.id??null,opponentName:opponent?.name??"",semanticContext:"nature-versus"}};
  }

  return {skipped:"METHOD_NOT_SUPPORTED"};
}

function compareCompletedRoll(actor,method,args,result,trace){try{const spec=paritySpecFor(actor,method,args,result,trace);if(!spec)return null;if(spec.skipped)return recordSkipped(actor,method,spec.skipped);return recordParity(actor,method,spec);}catch(error){return recordError(actor,method,error);}}
function markWrapped(fn){Object.defineProperty(fn,"_rgM3ParityWrapped",{value:true,configurable:false,enumerable:false,writable:false});return fn;}
function wrapHelper(ActorClass,method,traceKey){const original=ActorClass?.prototype?.[method];if(typeof original!=="function"||original._rgM3ParityWrapped)return false;const wrapped=markWrapped(async function(...args){const result=await original.apply(this,args);const trace=traceByActor.get(this);if(trace&&Array.isArray(trace[traceKey])){if(method==="_resolveAutomaticVersusTie")trace[traceKey].push({args:clone(args),result:clone(result)});else if(Array.isArray(result))trace[traceKey].push({faces:result.map(Number),rerollFaces:[],rerolledIndexes:[]});else trace[traceKey].push({faces:Array.from(result?.faces??[]).map(Number),rerollFaces:Array.from(result?.rerollFaces??[]).map(Number),rerolledIndexes:Array.from(result?.rerolledIndexes??[]).map(Number)});}return result;});ActorClass.prototype[method]=wrapped;return true;}
function wrapRollMethod(ActorClass,method){const original=ActorClass?.prototype?.[method];if(typeof original!=="function"||original._rgM3ParityWrapped)return false;const wrapped=markWrapped(async function(...args){const previous=traceByActor.get(this)??null;const trace={method,wiseResults:[],tokenResults:[],fateExplosions:[],tieResolutions:[]};traceByActor.set(this,trace);try{const result=await original.apply(this,args);compareCompletedRoll(this,method,args,result,trace);return result;}finally{if(previous)traceByActor.set(this,previous);else traceByActor.delete(this);}});ActorClass.prototype[method]=wrapped;return true;}
function installPrototypeObservers(ActorClass){if(installed)return;wrapHelper(ActorClass,"_applyWiseReroll","wiseResults");wrapHelper(ActorClass,"_applyTokenPowerReroll","tokenResults");wrapHelper(ActorClass,"_explodeSixes","fateExplosions");wrapHelper(ActorClass,"_resolveAutomaticVersusTie","tieResolutions");for(const method of INSTRUMENTED_METHODS)wrapRollMethod(ActorClass,method);installed=true;}
export function getTestParityStatus(){return deepFreeze({phase:"M3",mode:"SHADOW_PARITY",liveApplication:false,authority:"LEGACY_MIXED",comparisonFields:[...TEST_PARITY_FIELDS],instrumentedMethods:[...INSTRUMENTED_METHODS],historyLimit:HISTORY_LIMIT,persistence:"CLIENT_MEMORY_ONLY",bridge:"LEGACY_RESOLVED_FACES_WITH_SEMANTIC_CONTEXT_TO_CORE",supportedSpecialResolution:["FATE_OPEN_SIX","AUTOMATIC_VERSUS_TIEBREAK","BEGINNER_LUCK_VERSUS","NATURE_VERSUS"],contextCoverage:["ordinary","ability","nature","circles","beginnerLuck","versus"],remainingContextWork:["recovery","custom"],skippedCases:["FATE_TRACE_UNAVAILABLE"]});}
export function getTestParityHistory(){return Object.freeze([...history]);}
export function getLatestTestParity(){return history.length?history[history.length-1]:null;}
export function getTestParitySummary(){const matches=history.filter(e=>e.status==="MATCH").length,mismatches=history.filter(e=>e.status==="MISMATCH").length,skipped=history.filter(e=>e.status==="SKIPPED").length,errors=history.filter(e=>e.status==="ERROR").length;return deepFreeze({observed:history.length,compared:matches+mismatches,matches,mismatches,skipped,errors,latest:getLatestTestParity()});}
export function clearTestParityHistory(){history.splice(0,history.length);return getTestParitySummary();}
function exposeParityApi(){game.realmGuard??={};game.realmGuard.core??={};game.realmGuard.core.testParity=Object.freeze({getStatus:getTestParityStatus,getHistory:getTestParityHistory,getLatest:getLatestTestParity,getSummary:getTestParitySummary,clear:clearTestParityHistory});}
export function installTestParityShadow(ActorClass){Hooks.once("ready",()=>{installPrototypeObservers(ActorClass);exposeParityApi();console.log("realm-guard | CORE M3 Legacy Mixed <-> CORE Test shadow parity ready",getTestParityStatus());});}
