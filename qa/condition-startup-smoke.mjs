import assert from "node:assert/strict";
import { RG_DEFAULT_CONDITIONS, installConditionRuleAlignment, setConditionActive } from "../module/conditions.mjs";
import { refreshRulesProfileRuntime } from "../module/rules-profile-service.mjs";

const counts={itemUpdates:0,itemBatches:0,effectUpdates:0,effectCreates:0,effectDeletes:0,draws:0};
const hooks=new Map();
const clone=value=>JSON.parse(JSON.stringify(value));
function assign(doc,update) {for(const [key,value] of Object.entries(update)){if(key==="_id")continue;if(key.startsWith("system."))doc.system[key.slice(7)]=value;else doc[key]=clone(value);}}
function effect(actor,data,id="effect") {return {...clone(data),id,img:data.img??data.icon,statuses:new Set(data.statuses),
  getFlag(ns,key){return this.flags?.[ns]?.[key];},
  async update(update){counts.effectUpdates++;Object.assign(this,clone(update),{img:update.img??update.icon,statuses:new Set(update.statuses)});},
  async delete(){counts.effectDeletes++;actor.effects=actor.effects.filter(e=>e!==this);}
};}
function fixture(index,includeSick=false) {
  const actor={id:"actor-"+index,uuid:"Actor.actor-"+index,name:"Actor "+index,type:"character",flags:{},effects:[],items:[],
    get conditions(){return this.items.filter(i=>i.type==="condition");},
    getFlag(ns,key){return this.flags?.[ns]?.[key];},
    async updateEmbeddedDocuments(type,updates,options){assert.equal(type,"Item");assert.equal(options.realmGuardSkipConditionSync,true);counts.itemBatches++;for(const update of updates){counts.itemUpdates++;assign(this.items.find(i=>i.id===update._id),update);}return updates;},
    async createEmbeddedDocuments(type,docs){if(type!=="ActiveEffect")throw new Error("A current world must not require new Conditions");counts.effectCreates+=docs.length;const made=docs.map(d=>effect(this,d));this.effects.push(...made);return made;}
  };
  actor.items=RG_DEFAULT_CONDITIONS.filter(c=>includeSick||c.name!=="Sick").map((def,i)=>({id:"condition-"+i,name:def.name,type:"condition",flags:{"realm-guard":{defaultCondition:true}},
    system:{active:def.name==="Fresh",icon:def.icon,appliesTo:def.appliesTo??"all",recoveryType:def.recoveryType??"manual",recoveryAbility:def.recoveryAbility??"",recoveryRole:"",recoveryObstacle:Number(def.recoveryObstacle??1),recoveryNote:def.recoveryNote??"",rollModifier:Number(def.rollModifier??0),description:`<p>${def.description}</p>`},
    getFlag(ns,key){return this.flags?.[ns]?.[key];},async update(update){counts.itemUpdates++;assign(this,update);}
  }));
  const fresh=actor.conditions.find(i=>i.name==="Fresh");
  actor.effects.push(effect(actor,{name:fresh.name,icon:fresh.system.icon,description:fresh.system.description,disabled:false,statuses:[`realm-guard.condition.${fresh.id}`],flags:{"realm-guard":{conditionItemId:fresh.id,conditionIcon:fresh.system.icon}}}));
  return actor;
}
const actors=Array.from({length:60},(_,i)=>fixture(i));
let activeProfileId="realm-guard-legacy-mixed";
globalThis.game={system:{version:"1.13.0"},user:{id:"gm",isGM:true},users:[{id:"gm",isGM:true,active:true}],actors:{contents:actors},settings:{get:(_ns,key)=>key==="activeRulesProfileId"?activeProfileId:undefined}};
globalThis.Hooks={on(){},once:(name,callback)=>hooks.set(name,callback)};
globalThis.canvas={ready:true,tokens:{placeables:actors.map(actor=>({actor,drawEffects:async()=>{counts.draws++;}}))}};
refreshRulesProfileRuntime();
installConditionRuleAlignment();
const ready=hooks.get("ready");
const original=JSON.stringify(actors);
await ready();
console.log("Condition startup, current world of 60 Actors:",JSON.stringify(counts));
assert.deepEqual(counts,{itemUpdates:0,itemBatches:0,effectUpdates:0,effectCreates:0,effectDeletes:0,draws:0},"An unchanged world must perform no Condition/effect writes or redraws at startup");
assert.equal(JSON.stringify(actors),original);

actors[0].conditions[0].system.description="Legacy description";
actors[0].conditions[1].system.icon="legacy-icon.svg";
actors[0].effects[0].img="stale-effect.svg";
await ready();
assert.equal(counts.itemBatches,1,"Repairs on one Actor must use one batched Item update");
assert.equal(counts.itemUpdates,2,"Only changed Condition documents are written");
assert.equal(counts.effectUpdates,1);
assert.equal(counts.draws,1,"Token redraws must be coalesced per changed Actor");
const activeFresh=actors[0].conditions.find(i=>i.name==="Fresh");
activeFresh.system.description="Legacy active description";actors[0].effects[0].description="Legacy active description";
await ready();
assert.equal(counts.itemBatches,2);assert.equal(counts.itemUpdates,3);assert.equal(counts.effectUpdates,2);assert.equal(counts.draws,2);
const repaired=JSON.stringify(counts);
await ready();
assert.equal(JSON.stringify(counts),repaired,"A second startup after repairs must be a no-op");
assert.equal(JSON.stringify(actors),original,"Repair preserves the canonical values and existing documents");

const fresh=actors[0].conditions.find(i=>i.name==="Fresh");
await setConditionActive(actors[0],fresh,false);
assert.equal(fresh.system.active,false);assert.equal(actors[0].effects.length,0);assert.equal(counts.effectDeletes,1);
await setConditionActive(actors[0],fresh,true);
assert.equal(fresh.system.active,true);assert.equal(actors[0].effects.length,1);assert.equal(counts.effectCreates,1);

const tbActor=fixture(60);tbActor.flags={"realm-guard":{recruitmentVersion:"TB2E_WIZARD_M10D8"}};
tbActor.conditions[0].system.description="TB2E source data";actors.push(tbActor);
const tbData=JSON.stringify(tbActor);
const custom={id:"custom",name:"GM custom condition",type:"condition",system:{active:false,description:"GM-owned"},getFlag:()=>false};actors[0].items.push(custom);
const before=JSON.stringify(counts);
await ready();
assert.equal(JSON.stringify(counts),before);assert.equal(JSON.stringify(tbActor),tbData);assert.equal(custom.system.description,"GM-owned");
game.user.isGM=false;await ready();assert.equal(JSON.stringify(counts),before);
game.user={id:"other",isGM:true};await ready();assert.equal(JSON.stringify(counts),before,"A second GM must not duplicate startup work");
game.user={id:"gm",isGM:true};game.actors.contents=Array.from({length:5},(_,i)=>fixture(i+100,true));
const familyData=JSON.stringify(game.actors.contents);
for(const id of ["realm-guard-strict","mg1e","mg2e"]) {
  activeProfileId=id;refreshRulesProfileRuntime();await ready();
  assert.equal(JSON.stringify(counts),before,id+": current Conditions must not be rewritten");
  assert.equal(JSON.stringify(game.actors.contents),familyData,id+": preserved Condition data must remain intact");
}
console.log("PASS Condition startup: all four stable profiles, warm world zero writes/redraws, changed-only batched repair, idempotent ActiveEffects, live toggles intact, custom/TB2E data preserved and primary-GM authority retained");
