import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveRulesProfile } from "../module/rules-profile-service.mjs";
import { profileActivationAvailable } from "../module/m10-profile-activation.mjs";
import {
  tb2eControlledWiseHandoffMatrix,
  tb2eControlledWiseHandoffStatus,
  resetTb2eControlledWiseHandoffEvidence,
  runTb2eControlledWiseHandoff
} from "../module/m10d-tb2e-controlled-wise-handoff.mjs";
import { installM10DFoundation } from "../module/m10d-tb2e-foundation.mjs";

const existingIds=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const profileSnapshot=()=>JSON.stringify(existingIds.map(id=>resolveRulesProfile(id)));
const profilesBefore=profileSnapshot();
const actor={id:"untouched-actor",system:{wises:["Wise A"]}};
const item={id:"untouched-item",system:{name:"Wise A"}};
const journal={id:"untouched-journal",content:"unchanged"};
const settings=new Map([
  ["activeRulesProfileId","realm-guard-legacy-mixed"],
  ["activeRulesProfileVersion",1]
]);
const settingSnapshot=()=>JSON.stringify([...settings.entries()]);
const worldSnapshot=()=>JSON.stringify({
  actors:[actor],items:[item],journals:[journal],settings:settingSnapshot()
});
const beforeWorld=worldSnapshot();
let attemptedWrites=0;
const failWrite=()=>{attemptedWrites++;throw new Error("Controlled Wises QA handoff must remain zero-write");};
actor.update=failWrite;
actor.createEmbeddedDocuments=failWrite;
actor.deleteEmbeddedDocuments=failWrite;
item.update=failWrite;
globalThis.Actor={create:failWrite};
globalThis.Item={create:failWrite};
globalThis.JournalEntry={create:failWrite};
globalThis.game={
  system:{version:"1.13.0-qa.17"},
  user:{isGM:true,id:"gm"},
  actors:{contents:[actor]},
  items:{contents:[item]},
  journal:{contents:[journal]},
  settings:{
    get:(_namespace,key)=>settings.get(key),
    set:failWrite
  },
  realmGuard:{core:{m10:{sentinel:"untouched"}}}
};
globalThis.Hooks={once:(event,callback)=>{assert.equal(event,"ready");callback();}};

const tbProfile=resolveRulesProfile("torchbearer2e").profile;
assert.equal(tbProfile.metadata.foundationOnly,true);
assert.equal(tbProfile.metadata.selectable,false);
assert.equal(tbProfile.metadata.supported,false);
assert.equal(tbProfile.metadata.liveRuleAuthority,false);
assert.equal(profileActivationAvailable("torchbearer2e"),false);

installM10DFoundation();
const api=game.realmGuard.core.m10d.controlledWiseHandoff;
assert.equal(typeof api.getStatus,"function");
assert.equal(typeof api.matrix,"function");
assert.equal(typeof api.run,"function");
assert.equal(typeof api.reset,"function");
assert.deepEqual(Object.keys(game.realmGuard.core.m10d.wises).sort(),["aidPlan","cyclePlan","getStatus","model","rerollPlan","usePlan"]);
assert.equal(game.realmGuard.core.m10.sentinel,"untouched");

const before=api.getStatus();
assert.equal(before.phase,"M10D.18");
assert.equal(before.mode,"TB2E_WISES_CONTROLLED_QA_HANDOFF");
assert.equal(before.qaOnly,true);
assert.equal(before.gmOnly,true);
assert.equal(before.foundationLocked,true);
assert.equal(before.activationAvailable,false);
assert.equal(before.profileSwitch,false);
assert.equal(before.liveRuleAuthority,false);
assert.equal(before.liveEffectApplied,false);
assert.equal(before.rollEvaluated,false);
assert.equal(before.resourceSpendCommitted,false);
assert.equal(before.evidenceStorage,"IN_MEMORY_ONLY");
assert.deepEqual(before.writes,{actors:0,items:0,journals:0,settings:0});
assert.deepEqual(api.matrix().map(row=>row.id),["I_AM_WISE","DEEPER_UNDERSTANDING","OF_COURSE"]);
assert.ok(api.matrix().every(row=>row.state==="ROUTABLE_NOT_APPLIED"));

const iAmWise=api.run("I Am Wise",{hasWise:true,related:true,actingOnInstinct:true,context:"TEST"});
assert.equal(iAmWise.ok,true);
assert.equal(iAmWise.decision,"PLAN_ROUTED_NOT_APPLIED");
assert.equal(iAmWise.source,"TB2E_WISE_SHADOW");
assert.equal(iAmWise.plan.effect,"I_AM_WISE");
assert.equal(iAmWise.plan.dice,1);
assert.equal(iAmWise.plan.actingOnInstinct,true);
assert.equal(iAmWise.liveEffectApplied,false);
assert.equal(iAmWise.rollEvaluated,false);

const deeper=api.run("Deeper Understanding",{
  hasWise:true,related:true,failedDice:3,alreadyRerolledFailedDice:1,hasFate:true
});
assert.equal(deeper.ok,true);
assert.equal(deeper.plan.resourceCost,"FATE");
assert.equal(deeper.plan.reroll,"ONE_FAILED_DIE");
assert.equal(deeper.plan.eligibleFailedDice,2);
assert.equal(deeper.plan.resourceSpendCommitted,false);

const ofCourse=api.run("Of Course",{
  hasWise:true,related:true,failedDice:3,hasPersona:true
});
assert.equal(ofCourse.ok,true);
assert.equal(ofCourse.plan.resourceCost,"PERSONA");
assert.equal(ofCourse.plan.reroll,"ALL_FAILED_DICE");
assert.equal(ofCourse.plan.mustPrecedeDeeperUnderstandingWhenBoth,true);

assert.equal(api.run("I Am Wise",{related:true,actingOnInstinct:false}).reasonCode,"INCOMPLETE_HANDOFF_CONTEXT");
assert.equal(api.run("Deeper Understanding",{
  hasWise:true,related:true,failedDice:2,alreadyRerolledFailedDice:0,hasFate:false
}).reasonCode,"INSUFFICIENT_FATE");
assert.equal(api.run("Of Course",{
  hasWise:true,related:true,failedDice:2,hasPersona:false
}).reasonCode,"INSUFFICIENT_PERSONA");
assert.equal(api.run("I Am Wise",{
  hasWise:true,related:true,actingOnInstinct:false
}).ok,true);
const unrelated=api.run("Deeper Understanding",{
  hasWise:true,related:false,failedDice:1,alreadyRerolledFailedDice:0,hasFate:true
});
assert.equal(unrelated.reasonCode,"WISE_NOT_RELATED");
const noEligible=api.run("Deeper Understanding",{hasWise:true,related:true,failedDice:0,alreadyRerolledFailedDice:0,hasFate:true});
assert.equal(noEligible.reasonCode,"NO_ELIGIBLE_FAILED_DIE");
assert.equal(api.run("Deeper Understanding",{hasWise:true,related:true,failedDice:1.5,alreadyRerolledFailedDice:0,hasFate:true}).reasonCode,"INCOMPLETE_HANDOFF_CONTEXT");
const unknown=api.run("Free Reroll",{hasWise:true,related:true});
assert.equal(unknown.reasonCode,"UNKNOWN_WISE_EFFECT");

assert.equal(api.getStatus().evidenceCount,9);
assert.deepEqual(api.getStatus().writes,{actors:0,items:0,journals:0,settings:0});
assert.equal(worldSnapshot(),beforeWorld);
assert.equal(profileSnapshot(),profilesBefore);
assert.equal(attemptedWrites,0);

game.user.isGM=false;
assert.equal(api.run("I Am Wise",{hasWise:true,related:true,actingOnInstinct:false}).reasonCode,"GM_ONLY");
game.user.isGM=true;
game.system.version="1.13.0";
assert.equal(api.run("I Am Wise",{hasWise:true,related:true,actingOnInstinct:false}).reasonCode,"QA_RUNTIME_REQUIRED");
assert.equal(profileActivationAvailable("torchbearer2e"),false);
game.system.version="1.13.0-qa.17";

const reset=api.reset();
assert.equal(reset.ok,true);
assert.equal(reset.evidenceCount,0);
assert.equal(api.getStatus().evidenceCount,0);
assert.equal(worldSnapshot(),beforeWorld);
assert.equal(profileSnapshot(),profilesBefore);

const source=fs.readFileSync("module/m10d-tb2e-controlled-wise-handoff.mjs","utf8");
for(const forbidden of [
  "game.settings.set(", "Actor.create(", "Item.create(", "JournalEntry.create(",
  "createEmbeddedDocuments(", "deleteEmbeddedDocuments(", ".update(",
  "switchRulesProfile(", "module/m10c-", "module/providers/"
]) {
  assert.equal(source.includes(forbidden),false,"Controlled Wises handoff must not cross boundaries: "+forbidden);
}

console.log("PASS M10D.18 controlled TB2E Wises handoff · QA/GM gated · TB2E source plans only · no application, roll, spend, or world writes · other rules trees unchanged");
