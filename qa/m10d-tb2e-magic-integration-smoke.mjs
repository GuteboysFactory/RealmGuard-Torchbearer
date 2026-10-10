import assert from "node:assert/strict";
import fs from "node:fs";
import {tb2eFoundationStatus,tb2eReadinessAudit,installM10DFoundation} from "../module/m10d-tb2e-foundation.mjs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {profileActivationAvailable} from "../module/m10-profile-activation.mjs";
const s=tb2eFoundationStatus();
assert.equal(s.traitsShadowReady,true);
assert.equal(s.armorShadowReady,true);
assert.equal(s.conflictShadowReady,true);
assert.equal(s.magicShadowReady,true);
assert.deepEqual(s.p2ImplementedShadowAdapterDomains,["traits","armor","conflict","magic"]);
assert.deepEqual(s.p2PendingShadowAdapterDomains,[]);
assert.equal(s.liveIntegrationPaused,true);
assert.equal(s.existingShadowReauditRequired,true);
assert.deepEqual(tb2eReadinessAudit().implementationGaps.filter(g=>g.state==="NEW_SHADOW_ADAPTER_REQUIRED"),[]);
const profile=resolveRulesProfile("torchbearer2e").profile;
assert.equal(profile.domains.magic.mode,"READ_ONLY_SHADOW");
assert.equal(profile.domains.magic.shadowAdapterReady,true);
assert.equal(profile.domains.magic.liveEnabled,false);
assert.equal(profile.metadata.liveRuleAuthority,false);
assert.equal(profile.metadata.fullCoreShadowReauditRequired,true);
assert.equal(profileActivationAvailable("torchbearer2e"),false);
let writes=0;const fail=()=>{writes++;throw Error("Unexpected LIVE write");};
globalThis.Actor={create:fail};globalThis.Item={create:fail};
globalThis.JournalEntry={create:fail};
globalThis.game={realmGuard:{core:{m10:{sentinel:"preserve"}}},
 settings:{set:fail},actors:{contents:[]}};
globalThis.Hooks={once:(name,fn)=>{assert.equal(name,"ready");fn();}};
installM10DFoundation();
const m=game.realmGuard.core.m10d.magic;
assert.equal(m.getStatus().adapterReady,true);
assert.equal(m.getStatus().liveApplication,false);
assert.equal(m.model().arcanaTestSkill,"Arcanist");
assert.equal(m.memoryPlan({capacity:2,newSpells:[{id:"a",circle:1}],carriedBookSpells:["a"]}).obstacle,1);
assert.equal(m.invocationPlan({withRelic:false,baseTimeWithRelic:1,baseBurdenWithRelic:1}).invocationTurns,2);
assert.equal(m.purificationPlan({phase:"CAMP",currentBurden:3}).obstacle,3);
assert.equal(game.realmGuard.core.m10.sentinel,"preserve");
assert.equal(writes,0);
for(const p of ["m10d-tb2e-magic-contract.mjs","m10d-tb2e-magic-shadow.mjs",
 "m10d-tb2e-magic-arcana-shadow.mjs","m10d-tb2e-magic-ritual-shadow.mjs"]){
 const source=fs.readFileSync("module/"+p,"utf8");
 for(const danger of ["game.settings.set","Actor.create","Item.create","JournalEntry.create",
 "createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("]){
  assert.equal(source.includes(danger),false,p+" contains prohibited live operation: "+danger);
 }
}
console.log("PASS M10D.18 P2.4 Magic profile/API, 4/4 P2 adapters, historical re-audit still required, zero writes");
