import assert from "node:assert/strict";
import fs from "node:fs";
import { tb2eArmorShadowStatus, tb2eArmorModel, tb2eArmorAbsorptionPlan,
  tb2eShieldDefendPlan, tb2eArmorRepairBoundaryPlan } from "../module/m10d-tb2e-armor-shadow.mjs";
import {tb2eFoundationStatus, tb2eReadinessAudit, installM10DFoundation} from "../module/m10d-tb2e-foundation.mjs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {profileActivationAvailable} from "../module/m10-profile-activation.mjs";

const shadow=tb2eArmorShadowStatus();
assert.equal(shadow.adapterReady,true);
assert.equal(shadow.sourceClassification,"VERIFIED");
assert.equal(shadow.liveEnabled,false);
assert.equal(shadow.liveApplication,false);
assert.equal(shadow.activationAllowed,false);
assert.deepEqual(shadow.writes,{actors:0,items:0,journals:0,settings:0});
assert.equal(tb2eArmorModel().ordinaryArmor.CHAIN.wearRollEvenWhenBypassed,true);
assert.equal(tb2eArmorModel().ordinaryArmor.SHIELD.defendBonusDice,2);
const p=options=>tb2eArmorAbsorptionPlan(options);
function safe(a) {
  assert.equal(a.mode,"READ_ONLY_SHADOW");
  assert.equal(a.liveApplication,false);
  assert.equal(a.writesPlanned,0);
  assert.equal(a.rollExecuted,false);
  assert.equal(a.actorWrite,false);
  assert.equal(a.itemWrite,false);
  assert.equal(a.hitPointWrite,false);
  assert.equal(a.equipmentWrite,false);
}
for(const [options,expected] of [
  [{armorType:"LEATHER",d6:4},1],
  [{armorType:"LEATHER",d6:3},0],
  [{armorType:"LEATHER",weapon:"BOW",d6:6},0],
  [{armorType:"LEATHER",weapon:"CROSSBOW",d6:6},0],
  [{armorType:"LEATHER",weapon:"SPEAR",d6:6},0],
  [{armorType:"CHAIN",d6:3},1],
  [{armorType:"CHAIN",weapon:"MACE",d6:2},0],
  [{armorType:"CHAIN",weapon:"WARHAMMER",d6:5},0],
  [{armorType:"PLATE",d6:2},1],
  [{armorType:"PLATE",weapon:"WARHAMMER",d6:3},1],
  [{armorType:"HELMET"},1],
  [{armorType:"SHIELD"},1]
]) {
  const a=p(options);safe(a);assert.equal(a.ok,true);assert.equal(a.applicable,true);
  assert.equal(a.absorption,expected,JSON.stringify(options));
  assert.equal(a.damageAfter,1-expected);
  assert.equal(a.armorMutationCommitted,false);
}
assert.equal(p({armorType:"LEATHER"}).rollPending,true);
assert.equal(p({armorType:"LEATHER"}).absorption,null);
assert.equal(p({armorType:"CHAIN",weapon:"MACE"}).rollRequired,true);
assert.equal(p({armorType:"CHAIN",weapon:"MACE"}).rollPending,true);
assert.equal(p({armorType:"CHAIN",d6:3}).armorDamagedAfter,true);
assert.equal(p({armorType:"CHAIN",d6:4}).armorDamagedAfter,false);
assert.equal(p({armorType:"CHAIN",weapon:"MACE",d6:2}).armorDamagedAfter,true);
assert.equal(p({armorType:"PLATE",d6:2}).armorDamagedAfter,true);
assert.equal(p({armorType:"PLATE",d6:3}).armorDamagedAfter,false);
assert.equal(p({armorType:"PLATE",weapon:"MACE",d6:3}).armorDamagedAfter,true);
assert.equal(p({armorType:"PLATE",weapon:"WARHAMMER",d6:4}).armorDamagedAfter,false);
assert.equal(p({armorType:"LEATHER",d6:6}).armorDamagedAfter,false);
assert.equal(p({armorType:"HELMET"}).gmAdjudicationRequired,true);
assert.equal(p({armorType:"SHIELD"}).disposition,"DESTROYED");
for(const options of [
  {armorType:"LEATHER",usedThisFight:true},
  {armorType:"HELMET",usedThisFight:true},
  {armorType:"SHIELD",usedThisFight:true},
  {armorType:"CHAIN",armorDamaged:true},
  {armorType:"SHIELD",equipped:false},
  {armorType:"CHAIN",overflow:true},
  {armorType:"PLATE",directlyTargeted:false},
  {armorType:"PLATE",leadingAction:false},
  {armorType:"PLATE",conflictType:"ARGUMENT"},
  {armorType:"CHAIN",action:"MANEUVER"},
  {armorType:"PLATE",incomingDamage:0}
]){ const a=p(options);safe(a);assert.equal(a.applicable,false,JSON.stringify(options));assert.equal(a.absorption,0); }
for(const options of [{armorType:"BONE"},{armorType:"LEATHER",d6:7},{armorType:"CHAIN",incomingDamage:-1}])
  assert.equal(p(options).ok,false);
assert.equal(tb2eShieldDefendPlan({equipped:true}).diceModifier,2);
assert.equal(tb2eShieldDefendPlan({equipped:false}).applicable,false);
assert.equal(tb2eShieldDefendPlan({equipped:true,action:"ATTACK"}).applicable,false);
assert.equal(tb2eArmorRepairBoundaryPlan({armorType:"CHAIN",damaged:true}).repairCandidate,true);
assert.equal(tb2eArmorRepairBoundaryPlan({armorType:"HELMET",damaged:true}).repairCandidate,true);
assert.equal(tb2eArmorRepairBoundaryPlan({armorType:"SHIELD",damaged:true,destroyed:true}).repairCandidate,false);
assert.equal(tb2eArmorRepairBoundaryPlan({armorType:"PLATE",damaged:true,destroyed:true}).repairCandidate,false);
const foundation=tb2eFoundationStatus();
assert.equal(foundation.armorShadowReady,true);
assert.equal(foundation.traitsShadowReady,true);
assert.deepEqual(foundation.p2ImplementedShadowAdapterDomains,["traits","armor"]);
assert.deepEqual(foundation.p2PendingShadowAdapterDomains,["conflict","magic"]);
assert.deepEqual(tb2eReadinessAudit().implementationGaps.filter(g=>g.state==="NEW_SHADOW_ADAPTER_REQUIRED").map(g=>g.id),["conflict","magic"]);
assert.equal(foundation.liveIntegrationPaused,true);
const profile=resolveRulesProfile("torchbearer2e").profile;
assert.equal(profile.domains.armor.mode,"READ_ONLY_SHADOW");
assert.equal(profile.domains.armor.liveEnabled,false);
assert.equal(profile.domains.armor.shadowAdapterReady,true);
assert.equal(profile.domains.conflict.mode,"OFF");
assert.equal(profile.domains.magic.mode,"OFF");
assert.equal(profile.metadata.liveRuleAuthority,false);
assert.equal(profileActivationAvailable("torchbearer2e"),false);
let writes=0;
const fail=()=>{writes++;throw Error("Unexpected live write");};
globalThis.Actor={create:fail};globalThis.Item={create:fail};
globalThis.game={realmGuard:{core:{m10:{sentinel:"unchanged"}}},settings:{set:fail},actors:{contents:[]}};
globalThis.Hooks={once:(event,fn)=>{assert.equal(event,"ready");fn();}};
installM10DFoundation();
const api=game.realmGuard.core.m10d.armor;
assert.equal(api.getStatus().adapterReady,true);
assert.equal(api.absorptionPlan({armorType:"CHAIN",d6:5}).absorption,1);
assert.equal(api.shieldDefendPlan({equipped:true}).diceModifier,2);
assert.equal(game.realmGuard.core.m10.sentinel,"unchanged");
assert.equal(writes,0);
for(const file of ["module/m10d-tb2e-armor-shadow.mjs"]){
 const source=fs.readFileSync(file,"utf8");
 for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create",
   "createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
   assert.equal(source.includes(forbidden),false,file+" must remain read-only");
}
console.log("PASS M10D.18 P2.2 Armor CORE shadow · 5 protection items · wear/bypass/overflow · read-only · P2.1 preserved");
