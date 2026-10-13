import assert from "node:assert/strict";
import {tb2ePackageADocumentEvidence as read,tb2ePackageADocumentOutcomePlan as plan} from "../module/m10d18-tb2e-package-a-document-provenance.mjs";
const previousGame=globalThis.game,previousFoundry=globalThis.foundry;
const forbidden=()=>{throw new Error("Write or RNG called");};
class Die {}
const gm={id:"gm1",active:true,isGM:true},player={id:"p1",active:true,isGM:false};
const role={id:"skill1",type:"role",name:"Cook",system:{rating:4}};
const actor={id:"actor1",uuid:"Actor.actor1",documentName:"Actor",type:"character",
  items:[role],system:{resources:{fate:{value:2},persona:{value:1}}},
  testUserPermission:(user,level)=>user===player&&level==="OWNER",
  update:forbidden,spendTrackedResource:forbidden};
const term=Object.assign(new Die(),{number:5,faces:6,modifiers:[],
  results:[6,2,3,4,5].map(result=>({result,active:true}))});
const roll={_evaluated:true,formula:"5d6",terms:[term],total:20,evaluate:forbidden};
const message={id:"msg1",documentName:"ChatMessage",visible:true,isContentVisible:true,
  speaker:{actor:actor.id},speakerActor:actor,author:player,rolls:[roll],
  flags:{realmGuard:{gmPermissionAuthenticated:true}},update:forbidden};
const input={actorId:actor.id,messageId:message.id};
const scenarioInput={skillName:"Cook",mode:"SKILL",rating:4,
  factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
  equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
    dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,suppliesUsed:1,gearUsed:0},
  environment:{light:"CLEAR",additionalGmHindrances:0},allModifiersGmReviewed:true,
  actingCharacterId:actor.id,actingConditions:[],conditionsGmReviewed:true};
const safe=p=>{
  for(const k of ["liveApplication","actorWrite","itemWrite","journalWrite","settingsWrite",
    "rollExecuted","resourceSpendCommitted","advancementWrite","actorSourceAuthenticated",
    "gmPermissionAuthenticated","rollSourceAuthenticated","rollTimeActorStateVerified",
    "historicalRewardBalanceVerified"])assert.equal(p[k],false,k);
  assert.equal(p.writesPlanned,0);assert.equal(Object.isFrozen(p),true);
};
const denied=reason=>{const p=read(input);safe(p);assert.equal(p.ok,false);assert.equal(p.reasonCode,reason);};
try {
  globalThis.foundry={dice:{terms:{Die}}};
  globalThis.game={ready:true,system:{id:"realm-guard"},user:gm,
    users:new Map([[gm.id,gm],[player.id,player]]),actors:new Map([[actor.id,actor]]),
    messages:new Map([[message.id,message]]),settings:{set:forbidden},socket:{emit:forbidden}};
  const before=JSON.stringify({actor,message});
  const evidence=read(input);safe(evidence);assert.equal(evidence.ok,true,JSON.stringify(evidence));
  assert.equal(evidence.currentSessionGmObserved,true);
  assert.deepEqual(evidence.dice.map(d=>d.face),[6,2,3,4,5]);
  assert.equal(new Set(evidence.dice.map(d=>d.dieId)).size,5);
  assert.equal(Object.isFrozen(term.results),false,"Must not freeze source document data");
  const preview=plan({...input,scenarioInput});safe(preview);assert.equal(preview.ok,true,JSON.stringify(preview));
  assert.equal(preview.outcomePreview.rawSuccesses,3);
  assert.equal(preview.outcomePreview.outcome,"PASS");
  assert.equal(preview.outcomePreview.advancementPreview,null);
  assert.equal(before,JSON.stringify({actor,message}));
  globalThis.game.user=player;
  // No document lookup before denying a player, including hidden results.
  const actors=globalThis.game.actors;
  globalThis.game.actors={get:forbidden};denied("CURRENT_SESSION_GM_REQUIRED");
  globalThis.game.actors=actors;globalThis.game.user=gm;
  assert.equal(read({...input,gm:{isGM:true}}).ok,true,"Injected GM does not replace session identity");
  message.visible=false;denied("VISIBLE_CHAT_MESSAGE_REQUIRED");message.visible=true;
  message.isContentVisible=false;denied("VISIBLE_CHAT_MESSAGE_REQUIRED");message.isContentVisible=true;
  message.speaker.token="token1";denied("WORLD_ACTOR_SPEAKER_MISMATCH");delete message.speaker.token;
  message.speakerActor={...actor};denied("WORLD_ACTOR_SPEAKER_MISMATCH");message.speakerActor=actor;
  actor.isToken=true;denied("WORLD_CHARACTER_ACTOR_REQUIRED");delete actor.isToken;
  message.author={...player};denied("MESSAGE_AUTHOR_CURRENT_ACTOR_PERMISSION_REQUIRED");message.author=player;
  actor.testUserPermission=()=>false;denied("MESSAGE_AUTHOR_CURRENT_ACTOR_PERMISSION_REQUIRED");
  message.author=gm;assert.equal(read(input).ok,true);
  actor.testUserPermission=()=>true;message.author=player;
  roll._evaluated=false;denied("PLAIN_EVALUATED_D6_REQUIRED");roll._evaluated=true;
  term.modifiers=["x"];denied("PLAIN_EVALUATED_D6_REQUIRED");term.modifiers=[];
  term.results[0].rerolled=true;denied("MODIFIED_OR_INVALID_DIE_HISTORY_UNSUPPORTED");delete term.results[0].rerolled;
  term.results[0].exploded=true;denied("MODIFIED_OR_INVALID_DIE_HISTORY_UNSUPPORTED");delete term.results[0].exploded;
  term.results[0].active=false;denied("MODIFIED_OR_INVALID_DIE_HISTORY_UNSUPPORTED");term.results[0].active=true;
  term.results[0].result=7;denied("MODIFIED_OR_INVALID_DIE_HISTORY_UNSUPPORTED");term.results[0].result=6;
  roll.total=21;denied("SAVED_ROLL_TOTAL_MISMATCH");roll.total=20;
  message.rolls=[roll,roll];denied("SINGLE_NATIVE_ROLL_REQUIRED");message.rolls=[roll];
  actor.items.push({type:"condition",name:"Strained",system:{active:true}});
  denied("UNMAPPED_ACTOR_CONDITION");actor.items.pop();
  actor.items.push({type:"condition",name:"Sick",system:{active:true}});
  assert.equal(plan({...input,scenarioInput}).reasonCode,"CURRENT_ACTOR_CONDITIONS_MISMATCH");actor.items.pop();
  const no=(change,reason)=>{const p=plan({...input,scenarioInput:{...scenarioInput,...change}});safe(p);assert.equal(p.reasonCode,reason);};
  no({rating:3},"CURRENT_ACTOR_SKILL_OR_ID_MISMATCH");
  no({actingCharacterId:"other"},"CURRENT_ACTOR_SKILL_OR_ID_MISMATCH");
  no({bonuses:{personaDice:1}},"DOCUMENT_BRIDGE_SCOPE_UNSUPPORTED");
  no({help:{}},"DOCUMENT_BRIDGE_SCOPE_UNSUPPORTED");
  no({mode:"BEGINNERS_LUCK"},"DOCUMENT_BRIDGE_SCOPE_UNSUPPORTED");
  role.system.rating=3;
  assert.equal(plan({...input,scenarioInput}).reasonCode,"CURRENT_ACTOR_SKILL_OR_ID_MISMATCH");
  role.system.rating=4;actor.system.resources.persona.value=9;
  assert.equal(read(input).currentRewards.persona,9);
  assert.equal(evidence.currentRewards.persona,1,"Detached snapshot remains unchanged");
  globalThis.game.actors.get=()=>{throw new Error("unavailable");};denied("DOCUMENT_EVIDENCE_READ_FAILED");
}finally{globalThis.game=previousGame;globalThis.foundry=previousFoundry;}
console.log("PASS Package A: current GM/Actor/message evidence, native plain D6 lineage, zero writes, no historical attestation");
