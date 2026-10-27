import assert from "node:assert/strict";
import { resolveRulesProfile, refreshRulesProfileRuntime, getActiveRulesSnapshot } from "../module/rules-profile-service.mjs";
import { profileActivationAvailable, profileActivationStatus, switchRulesProfile } from "../module/m10-profile-activation.mjs";
import { resolveCharacterCreationProfile, getActiveM10BCharacterCreationPolicy } from "../module/m10b-character-creation.mjs";
import { TB2E_WIZARD_CREATION_PROFILE, MODEL } from "../module/profiles/torchbearer2e-wizard-creation.mjs";
import { commitTb2eWizard } from "../module/tb2e-recruitment.mjs";
import { ensureDefaultSkills } from "../module/default-skills.mjs";
import { ensureDefaultConditions, installConditionRuleAlignment } from "../module/conditions.mjs";
import { TB2E_WIZARD_QA_SETTING } from "../module/tb2e-wizard-qa.mjs";
import { sample } from "./lib/tb2e-wizard-fixtures.mjs";

const ids=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const before=JSON.stringify(ids.map(id=>resolveRulesProfile(id)));
const settings=new Map([["activeRulesProfileId",ids[0]],["activeRulesProfileVersion",1],[TB2E_WIZARD_QA_SETTING,false]]);
const writes=[];
const actors=[];
let failItems=false, ready;
globalThis.game={system:{version:"1.13.0-qa.29"},user:{id:"gm",isGM:true},users:[],
  actors:{contents:actors},items:{contents:[]},folders:[{id:"pc",type:"Actor",name:"PC"}],
  settings:{get:(_ns,k)=>settings.get(k),set:async(_ns,k,v)=>{writes.push([k,v]);settings.set(k,v);}},
  realmGuard:{core:{getActiveRulesSnapshot}}};
globalThis.Hooks={callAll(){},on(){},once:(_event,callback)=>{ready=callback;}};
globalThis.ui={notifications:{info(){},warn(){},error(){}}};
globalThis.foundry={utils:{escapeHTML:s=>String(s),mergeObject:(a,b)=>({...a,...b})},applications:{api:{
  ApplicationV2:class{async _prepareContext(){return {}; }},HandlebarsApplicationMixin:Base=>Base,DialogV2:{wait:async()=>false}
}}};

refreshRulesProfileRuntime();
assert.equal(profileActivationAvailable("torchbearer2e"),false);
await assert.rejects(commitTb2eWizard(sample("WARRIOR")),/activation/);
assert.deepEqual(writes,[]);
settings.set(TB2E_WIZARD_QA_SETTING,true);
refreshRulesProfileRuntime();
assert.equal(profileActivationAvailable("torchbearer2e"),true);
assert.equal(resolveCharacterCreationProfile("torchbearer2e"),TB2E_WIZARD_CREATION_PROFILE);
assert.equal(getActiveM10BCharacterCreationPolicy().rulesProfileId,ids[0]);
await assert.rejects(commitTb2eWizard(sample("WARRIOR")),/activation/);
const qaProfile=resolveRulesProfile("torchbearer2e").profile;
assert.deepEqual(qaProfile.metadata.liveDomains,["creation"]);
for(const [domain,policy] of Object.entries(qaProfile.domains)) {
  if(domain!=="creation") assert.notEqual(policy.liveEnabled,true,domain+" must not be enabled by wizard QA");
}
game.user.isGM=false;
await assert.rejects(switchRulesProfile("torchbearer2e"),/GM-only/);
game.user.isGM=true;
const switched=await switchRulesProfile("torchbearer2e");
assert.equal(switched.toProfileId,"torchbearer2e");
assert.equal(switched.actorWrites,0);
assert.equal(writes.length,2);
assert.equal(actors.length,0);
assert.equal(getActiveM10BCharacterCreationPolicy().liveCommit,true);
assert.ok(profileActivationStatus().profiles.find(p=>p.id==="torchbearer2e")?.active);

globalThis.Actor={create:async(data,options)=>{
  assert.equal(options.realmGuardSkipRecruitmentProvisioning,true);
  const actor={...structuredClone(data),id:"qa-"+actors.length,items:[],deleted:false,
    get conditions(){return this.items.filter(x=>x.type==="condition");},
    getFlag(ns,key){return this.flags?.[ns]?.[key];},
    async setFlag(ns,key,value){(this.flags[ns]??={})[key]=structuredClone(value);},
    async createEmbeddedDocuments(_type,docs){
      if(failItems)throw new Error("QA item failure");
      const made=docs.map((d,i)=>({...structuredClone(d),id:"item-"+(this.items.length+i),getFlag(ns,key){return this.flags?.[ns]?.[key];},async update(){throw new Error("TB2E Conditions must not be enriched with RG rules");}}));
      this.items.push(...made);return made;
    },
    async updateEmbeddedDocuments(_type,updates){for(const row of updates){const item=this.items.find(i=>i.id===row._id);for(const [key,value]of Object.entries(row)){if(key.startsWith("system."))item.system[key.slice(7)]=structuredClone(value);}}},
    async delete(){this.deleted=true;}
  };actors.push(actor);return actor;
}};
for(const className of MODEL.classes) {
  const result=await commitTb2eWizard(sample(className));
  const actor=result.actor;
  assert.equal(result.rolledBack,false);
  assert.equal(actor.system.resources.fate.value,0);
  assert.equal(actor.system.resources.persona.value,0);
  assert.equal(actor.getFlag("realm-guard","creationProvenance").rulesProfileId,"torchbearer2e");
  assert.equal(actor.conditions.length,8);
  assert.equal(actor.conditions.find(c=>c.name==="Fresh").system.active,true);
  assert.equal(actor.items.filter(i=>i.type==="role").length,33);
  const data=JSON.stringify(actor);
  await ensureDefaultSkills(actor);await ensureDefaultConditions(actor);
  assert.equal(JSON.stringify(actor),data,"Default provisioning must preserve TB2E-created documents");
}
installConditionRuleAlignment();
await ready();
assert.equal(actors.every(a=>a.conditions.length===8),true,"Reload must preserve the TB2E Condition set and metadata");
failItems=true;
await assert.rejects(commitTb2eWizard(sample("WARRIOR")),error=>error.realmGuardCommit?.rolledBack===true);
assert.equal(actors.at(-1).deleted,true);
failItems=false;
const created=actors.length;
game.user={id:"player",isGM:false,can:()=>false};
await assert.rejects(commitTb2eWizard(sample("WARRIOR")),/permission/);
game.user={id:"gm",isGM:true};
game.system.version="1.13.0";
assert.equal(profileActivationAvailable("torchbearer2e"),false);
await assert.rejects(commitTb2eWizard(sample("WARRIOR")),/activation/);
assert.equal(actors.length,created);
game.system.version="1.13.0-qa.29";
refreshRulesProfileRuntime();

const { RealmGuardProfileManagement }=await import("../module/profile-management-menu.mjs");
const context=await new RealmGuardProfileManagement()._prepareContext({});
assert.equal(context.tb2eWizardQaEnabled,true);
assert.ok(context.activationRows.find(r=>r.id==="torchbearer2e")?.active);
const preserved=JSON.stringify(actors);
await switchRulesProfile(ids[0]);
assert.equal(JSON.stringify(actors),preserved);
await assert.rejects(commitTb2eWizard(sample("WARRIOR")),/activation/);
settings.set(TB2E_WIZARD_QA_SETTING,false);
refreshRulesProfileRuntime();
assert.equal(profileActivationAvailable("torchbearer2e"),false);
assert.equal(JSON.stringify(ids.map(id=>resolveRulesProfile(id))),before);
assert.equal(writes.length,4,"Switching there and back writes only the two profile settings each time");
console.log("PASS M10D.11 opt-in QA activation · six real wizard commits through CORE M9 · rollback · stable/inactive/player guards · UI profile row · reload preservation · no changes to other profiles");
