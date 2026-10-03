import assert from "node:assert/strict";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import { MG2E_CREATION_PROFILE } from "../module/profiles/mg2e-creation.mjs";
import { mg2eActivationReadinessAudit } from "../module/m10c-mg2e-readiness-audit.mjs";
import { applyMg2eWiseEffect } from "../module/m10c-mg2e-live-wises.mjs";
import { familyWeaponActionPlan, familyArmorPlan, familyConflictToolPlan, getActiveM10BGearInventoryConflictPolicy } from "../module/m10b-gear-inventory-conflict.mjs";
import { getActiveM10BFamilyRulePolicy, helperSourceAllowedForTest } from "../module/m10b-family-rules.mjs";
import { resolveM10BCharacterCreationPolicy, createProfileCreationDraft, profileCreationCommitPlan } from "../module/m10b-character-creation.mjs";
import * as activation from "../module/m10-profile-activation.mjs";
import { mg2eLiveParityFoundationStatus } from "../module/m10c-mg2e-live-parity.mjs";

const settings = new Map([
  ["activeRulesProfileId", "realm-guard-legacy-mixed"], ["activeRulesProfileVersion", 1],
  ["systemSchemaVersion", 1], ["coreArchitectureVersion", "0.1"], ["migrationHistory", "[]"], ["migrationLastError", ""]
]);
const writes = [];
let failNextVersionWrite = false;
const preservedActor = { id: "old", type: "character", system: { rank: "Ranger", progression: {level:4} }, items: [{type:"wise",system:{rating:3}},{type:"gear",system:{inventory:{location:"back"}}}] };
const originalData = JSON.stringify(preservedActor);
globalThis.game = {
  system: { version: "1.12.0" }, user: {isGM:true,id:"gm"}, actors: {contents:[preservedActor]}, items: {contents:[]},
  settings: { get: (_ns,key)=>settings.get(key), set: async (_ns,key,value)=>{
    if(key === "activeRulesProfileVersion" && failNextVersionWrite){failNextVersionWrite=false;throw new Error("injected setting failure");}
    writes.push({key,value}); settings.set(key,value);return value;
  } }
};
globalThis.Hooks = {callAll:()=>{}};
assert.equal(MG2E_FOUNDATION_PROFILE.version,3);
assert.equal(MG2E_CREATION_PROFILE.version,3);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase,"M10C.8");
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.qaActivationOnly,true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.explicitActivationAuthorized,true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveParityVerifiedRelease,"1.12.0-qa.18");
assert.equal(activation.profileActivationAvailable("mg2e"),false);
await assert.rejects(()=>activation.switchToMg2e(),/not in an activatable state/i);
assert.equal(writes.length,0);
game.system.version="1.12.0-qa.19";
game.user.isGM=false;
await assert.rejects(()=>activation.switchToMg2e(),/GM-only/i);
assert.equal(writes.length,0);
game.user.isGM=true;
const audit=mg2eActivationReadinessAudit();
assert.equal(audit.liveParityVerified,true); // Durable qa.18 QA result, no in-memory auto-pass.
assert.equal(audit.activationAuthorized,true);
assert.equal(audit.activationAvailable,true);
assert.deepEqual(audit.openBlockers,[]);
assert.equal(audit.decision,"READY_EXPLICIT_QA_ACTIVATION");

failNextVersionWrite=true;
await assert.rejects(()=>activation.switchToMg2e(),/injected setting failure/);
assert.equal(activation.activeRulesProfileId(),"realm-guard-legacy-mixed");
assert.equal(activation.activeRulesProfileVersion(),1);
writes.length=0;
await activation.switchToMg2e();
assert.deepEqual(writes.map(row=>row.key),["activeRulesProfileId","activeRulesProfileVersion"]);
assert.equal(activation.activeRulesProfileId(),"mg2e");
const count=writes.length;
assert.equal((await activation.switchToMg2e()).changed,false);
assert.equal(writes.length,count);
assert.equal(JSON.stringify(preservedActor),originalData);
const family=getActiveM10BFamilyRulePolicy();
assert.equal(family.mg2eWises,true);
assert.equal(family.ratedWises,false);
assert.equal(helperSourceAllowedForTest("Wise","Ability",family),true);
assert.equal(helperSourceAllowedForTest("Ability","Skill",family),false);
const gear=getActiveM10BGearInventoryConflictPolicy();
assert.equal(gear.familySemantics,true);
assert.deepEqual(gear.conflict.actionSkills.fight.defend,["Nature"]);
assert.deepEqual(gear.conflict.disposition.fight.bases,["Health","Nature"]);
assert.equal(familyWeaponActionPlan("Halberd","attack",{},gear).dice,1); // MG2E, no MG1E mode choice.
assert.equal(familyWeaponActionPlan("Axe","attack",{},gear).conditionalSuccess,1);
assert.equal(familyWeaponActionPlan("Whip","attack",{},gear).ok,false); // No MG1E/RG alias inference.
assert.equal(familyArmorPlan("Light Armor",{usesThisConflict:0},gear).absorbDispositionDamage,1);
assert.equal(familyArmorPlan("Light Armor",{usesThisConflict:1},gear).absorbAvailable,false);
assert.equal(familyArmorPlan("Heavy Armor",{maceHit:true},gear).absorbAvailable,false);
const toolsActor={id:"tools",type:"character",items:[{id:"halberd",type:"gear",name:"Halberd",system:{inventory:{mode:"unassigned"}}}]};
const tool=familyConflictToolPlan(toolsActor,{toolId:"gear:halberd",action:"attack"},gear);
assert.equal(tool.ok,true);
assert.equal(tool.dice,1);
assert.equal(tool.source,"MG2E_2015");
assert.equal(resolveM10BCharacterCreationPolicy("mg2e").liveCommit,true);
const draft = createProfileCreationDraft("mg2e", {
  answers:{
    name:"Baron QA",
    concept:"Compassionate guardmouse",
    rank:"guardmouse",
    age:22,
    hometown:"Elmoss",
    hometownSkill:"Carpenter",
    hometownTrait:"Alert",
    natureAnswers:{
      saveForWinter:false,
      runAndHide:false,
      fearPredators:true
    },
    winterTrait:"Generous",
    bornTrait:"Compassionate",
    furColor:"Brown",
    cloakColor:"Gold",
    relationships:{
      parents:[{name:"Ma Twistwood"},{name:"Pa Twistwood"}],
      seniorArtisan:{name:"Feris",role:"Carpenter"},
      mentor:{name:"Gavin",olderMouse:true,role:"Patrol Leader"},
      friend:{name:"Tuk",role:"Bandit"},
      enemy:{name:"Paul",role:"Patrol Leader"}
    },
    drives:{
      belief:"I will build a good name for the Mouse Guard.",
      goal:"I will keep my patrol safe.",
      instinct:"Always prepare before setting out."
    },
    weapon:"Halberd",
    jobTools:["Wood carving knife"]
  },
  allocations:{
    naturalTalent:["Carpenter"],
    parentsTrade:"Carpenter",
    convincing:["Manipulator"],
    seniorArtisanTrade:"Carpenter",
    mentorTraining:["Survivalist"],
    specialty:"Hunter",
    wises:["Governor-wise"],
    traits:[]
  }
});
const plan=profileCreationCommitPlan("mg2e",draft);
assert.equal(plan.liveMutation,true);
assert.equal(plan.transaction.activatedByRulesProfile,"mg2e");
assert.equal(mg2eLiveParityFoundationStatus().foundationReady,true,JSON.stringify(mg2eLiveParityFoundationStatus().matrix.filter(row=>!row.foundationReady)));

// Exercise the actual Actor reroll helper through its MG2E branch.
globalThis.Actor=class {}; globalThis.Item=class {};
globalThis.foundry={utils:{escapeHTML:s=>s},applications:{api:{DialogV2:{wait:async()=>null}}}};
let rolls=0;
globalThis.Roll=class {constructor(formula){this.count=Number(formula.split('d')[0]);}async evaluate(){rolls++;this.dice=[{results:Array.from({length:this.count},()=>({result:5}))}];return this;}};
const {RealmGuardActor}=await import("../module/documents.mjs");
const roller=new RealmGuardActor();
roller.system={resources:{fate:{value:2},persona:{value:2}}};
const spends=[];
roller.spendTrackedResource=async(kind,amount)=>{spends.push(kind);roller.system.resources[kind].value-=amount;return {ok:true};};
const wise={type:"wise",name:"Trail-wise",system:{rating:4}}; // Preserved rating is not converted or tested.
let result=await roller._applyWiseReroll([1,2,6],wise);
assert.deepEqual(result.faces,[1,2,6]);assert.equal(rolls,0);assert.equal(spends.length,0);
foundry.applications.api.DialogV2.wait=async()=>({effect:"Deeper Understanding",index:1});
result=await roller._applyWiseReroll([1,2,6],wise);
assert.deepEqual(result.faces,[1,5,6]);assert.deepEqual(result.rerolledIndexes,[1]);assert.deepEqual(spends,["fate"]);
result=await applyMg2eWiseEffect(roller,[1,2,6],wise,{choose:async()=>({effect:"Of Course"}),excludedIndexes:[0]});
assert.deepEqual(result.faces,[1,5,6]);assert.equal(spends.at(-1),"persona");
await assert.rejects(()=>applyMg2eWiseEffect(roller,[1,2,6],wise,{choose:async()=>({effect:"Deeper Understanding",index:0}),excludedIndexes:[0]}),/eligible failed die/);
assert.equal(wise.system.rating,4);
const spentBeforeFailure=spends.length;
const NormalRoll=globalThis.Roll;
globalThis.Roll=class {async evaluate(){throw new Error("injected dice failure");}};
await assert.rejects(()=>applyMg2eWiseEffect(roller,[1],wise,{choose:async()=>({effect:"Deeper Understanding",index:0})}),/injected dice failure/);
assert.equal(spends.length,spentBeforeFailure);
globalThis.Roll=NormalRoll;
await activation.switchToLegacyMixed();
await activation.switchToStrictRealmGuard();
await activation.switchToMg1e();
await activation.switchToMg2e();
await activation.switchToLegacyMixed();
assert.equal(JSON.stringify(preservedActor),originalData);
assert.equal(resolveM10BCharacterCreationPolicy("mg2e").liveCommit,false);
assert.equal(getActiveM10BFamilyRulePolicy().mg2eWises,false);
Hooks.once=(_event,fn)=>fn();
const service=await import("../module/m10-profile-service.mjs");
service.installM10ProfileConversionPreview();
assert.equal(game.realmGuard.core.m10.getStatus().phase,"M10C.8");
assert.equal(game.realmGuard.core.m10.switchToMg2e,activation.switchToMg2e);
assert.equal(game.realmGuard.core.m10.mg2e.liveParityStatus().verifiedRelease,"1.12.0-qa.18");
assert.equal(game.realmGuard.core.m10.mg2e.readinessAudit().activationAvailable,true);
assert.equal(writes.every(row=>["activeRulesProfileId","activeRulesProfileVersion"].includes(row.key)),true);
console.log("PASS M10C.8 MG2E selectable QA activation · stable/GM gates · settings rollback/idempotence · source-owned live Wise/Conflict · creation authority · existing data preserved");
