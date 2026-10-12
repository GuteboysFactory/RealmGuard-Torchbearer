import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2eConditionInfo} from "./m10d-tb2e-conditions-shadow.mjs";

const state=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
  mode:"CURRENT_ACTOR_EVIDENCE_READ_ONLY",sourceEvidence:"DH 58-59,77; SG 36-38,46-52",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,resourceSpendCommitted:false,
  advancementWrite:false,learningWrite:false,actorSourceAuthenticated:false,
  rollSourceAuthenticated:false,gmPermissionAuthenticated:false,
  rollTimeActorStateVerified:false,historicalRewardBalanceVerified:false,
  playerConsentAuthenticated:false,noAdvanceAuthorized:true,...data
});
const fail=code=>state(false,code);
const numeric=v=>Number.isSafeInteger(v)&&v>=0?v:null;
const str=v=>typeof v==="string"?v:null;

/** Current session world Actor only. Return scalar copies, never Documents,
 * Item data/flags or descriptions; no inferred historical state or consent.
 */
export function tb2ePackageAActorEvidence({actorId=null}={}){
  try {
    const g=globalThis.game,gm=g?.user;
    if(!g?.ready||g.system?.id!=="realm-guard")return fail("READY_REALM_GUARD_SESSION_REQUIRED");
    if(!gm?.active||gm.isGM!==true||g.users?.get(gm.id)!==gm)return fail("CURRENT_SESSION_GM_REQUIRED");
    if(typeof actorId!=="string"||!/^[A-Za-z0-9]{1,128}$/.test(actorId))return fail("DOCUMENT_IDS_REQUIRED");
    const actor=g.actors?.get(actorId);
    if(!actor||actor.id!==actorId||actor.documentName!=="Actor"||actor.isToken||
       actor.inCompendium||actor.type!=="character")return fail("WORLD_CHARACTER_ACTOR_REQUIRED");
    const conditions=[],skills=[],wises=[];
    for(const item of actor.items){
      if(item.type==="role")skills.push({itemId:str(item.id),name:str(item.name),rating:numeric(item.system?.rating)});
      if(item.type==="wise")wises.push({itemId:str(item.id),name:str(item.name)});
      if(item.type!=="condition")continue;
      if(typeof item.system?.active!=="boolean")return fail("INVALID_ACTOR_CONDITION_STATE");
      if(!item.system.active)continue;
      if(!["fresh","hungry & thirsty","hungry and thirsty","exhausted","angry",
        "sick","injured","afraid","dead"].includes(String(item.name).trim().toLowerCase())||
        !tb2eConditionInfo(item.name).ok)return fail("UNMAPPED_ACTOR_CONDITION");
      conditions.push(String(item.name));
    }
    const fate=numeric(actor.system?.resources?.fate?.value),persona=numeric(actor.system?.resources?.persona?.value);
    if(fate===null||persona===null)return fail("INVALID_CURRENT_ACTOR_REWARDS");
    return state(true,null,{actorId,actorUuid:str(actor.uuid),currentGmId:gm.id,
      currentSessionGmObserved:true,actorDocumentObserved:true,
      conditions:[...new Set(conditions)],currentSkillItems:skills,currentWiseItems:wises,
      currentAbilities:{will:numeric(actor.system?.attributes?.will?.value),
        health:numeric(actor.system?.attributes?.health?.value)},
      currentRewards:{fate,persona},evidenceScope:"CURRENT_MUTABLE_CLIENT_ACTOR_NOT_HISTORICAL_ATTESTATION"});
  }catch{return fail("ACTOR_EVIDENCE_READ_FAILED");}
}
