import assert from "node:assert/strict";
import fs from "node:fs";
import {tb2eFoundationStatus,tb2eReadinessAudit,installM10DFoundation} from "../module/m10d-tb2e-foundation.mjs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {profileActivationAvailable} from "../module/m10-profile-activation.mjs";
const s=tb2eFoundationStatus();
assert.equal(s.traitsShadowReady,true);
assert.equal(s.armorShadowReady,true);
assert.equal(s.conflictShadowReady,true);
assert.deepEqual(s.p2ImplementedShadowAdapterDomains,["traits","armor","conflict"]);
assert.deepEqual(s.p2PendingShadowAdapterDomains,["magic"]);
assert.equal(s.liveIntegrationPaused,true);
assert.deepEqual(tb2eReadinessAudit().implementationGaps.filter(x=>x.state==="NEW_SHADOW_ADAPTER_REQUIRED").map(x=>x.id),["magic"]);
const profile=resolveRulesProfile("torchbearer2e").profile;
assert.equal(profile.domains.conflict.mode,"READ_ONLY_SHADOW");
assert.equal(profile.domains.conflict.liveEnabled,false);
assert.equal(profile.domains.conflict.shadowAdapterReady,true);
assert.equal(profile.domains.magic.mode,"OFF");
assert.equal(profile.metadata.liveRuleAuthority,false);
assert.equal(profileActivationAvailable("torchbearer2e"),false);
let writes=0;const fail=()=>{writes++;throw Error("Unexpected write");};
globalThis.Actor={create:fail};globalThis.Item={create:fail};
globalThis.game={realmGuard:{core:{m10:{sentinel:"legacy"}}},settings:{set:fail},actors:{contents:[]}};
globalThis.Hooks={once:(event,fn)=>{assert.equal(event,"ready");fn();}};
installM10DFoundation();
const c=game.realmGuard.core.m10d.conflict;
assert.equal(c.getStatus().adapterReady,true);
assert.equal(c.actionPlan({action:"FEINT",opponentAction:"ATTACK"}).rollAllowed,false);
assert.equal(c.outcomePlan({teamRemaining:0,opponentRemaining:0}).compromiseGuidance,"MAJOR_BOTH_SIDES");
assert.equal(c.hpAllocationPlan({startingDisposition:2,participantIds:["a","b"]}).ok,true);
assert.equal(game.realmGuard.core.m10.sentinel,"legacy");
assert.equal(writes,0);
for(const file of ["m10d-tb2e-conflict-contract.mjs","m10d-tb2e-conflict-shadow.mjs",
 "m10d-tb2e-conflict-resolution-shadow.mjs","m10d-tb2e-conflict-outcome-shadow.mjs"]){
 const text=fs.readFileSync("module/"+file,"utf8");
 for(const forbidden of ["game.settings.set","Actor.create","Item.create","JournalEntry.create",
   "createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
 assert.equal(text.includes(forbidden),false,file+" read only");
}
console.log("PASS M10D.18 P2.3 Conflict API · Magic OFF · no activation · zero writes");
