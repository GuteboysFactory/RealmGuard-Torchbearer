import assert from "node:assert/strict";
import fs from "node:fs";
import { CreationPartyContext } from "../module/core/m9-creation.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion", 1],
  ["realm-guard.systemSchemaVersion", 1],
  ["realm-guard.coreArchitectureVersion", "0.1"],
  ["realm-guard.migrationHistory", "[]"],
  ["realm-guard.migrationLastError", ""]
]);
const writes = [];

globalThis.game = {
  system:{version:"1.12.0"},
  user:{isGM:true,id:"gm"},
  actors:{contents:[]},
  items:{contents:[]},
  settings:{
    get:(ns,key)=>settings.get(`${ns}.${key}`),
    set:async(ns,key,value)=>{
      writes.push({ns,key,value});
      settings.set(`${ns}.${key}`,value);
      return value;
    }
  }
};
globalThis.Hooks = { callAll:()=>{} };

const activation = await import("../module/m10-profile-activation.mjs");
const creation = await import("../module/m10b-character-creation.mjs");
const { MG1E_FOUNDATION_PROFILE } = await import("../module/profiles/mg1e-foundation.mjs");

assert.equal(MG1E_FOUNDATION_PROFILE.version, 11);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.activationState, "QA_ACTIVE");
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.qaActivationOnly, true);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.selectable, true);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.supported, true);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, true);

// Stable runtime must keep the QA-only profile closed.
assert.equal(activation.qaProfileActivationRuntime(), false);
assert.equal(activation.profileActivationAvailable("mg1e"), false);
writes.length = 0;
await assert.rejects(() => activation.switchRulesProfile("mg1e"), /not in an activatable state/i);
assert.equal(writes.length, 0);

// QA runtime opens the explicit activation gate.
game.system.version = "1.12.0-qa.11";
assert.equal(activation.qaProfileActivationRuntime(), true);
assert.equal(activation.profileActivationAvailable("mg1e"), true);

writes.length = 0;
const first = await activation.switchRulesProfile("mg1e");
assert.equal(first.changed, true);
assert.equal(first.toProfileId, "mg1e");
assert.deepEqual(writes.map(row => row.key), ["activeRulesProfileId","activeRulesProfileVersion"]);
assert.equal(activation.activeRulesProfileId(), "mg1e");

const policy = creation.resolveM10BCharacterCreationPolicy("mg1e");
assert.equal(policy.phase, "M10B.11");
assert.equal(policy.active, true);
assert.equal(policy.liveCommit, true);
assert.equal(policy.readyWhenActive, true);

const seed = {
  mode:"guided",
  answers:{
    name:"M10B11 Mouse",
    concept:"QA activation",
    rank:"guardmouse",
    age:22,
    furColor:"Brown",
    natureAnswers:{saveForWinter:false,runAndHide:false,fearPredators:true},
    hometownKey:"elmoss",
    hometownSkill:"Carpenter",
    hometownTrait:"Alert",
    apprenticeship:"Carpenter",
    specialty:"Survivalist",
    resourceAnswers:{winterTrade:true,parentsProfession:false,gifts:false,thrifty:false,debt:true,pack:true},
    resourceTrade:"Carpenter",
    parentsResourceProfession:"",
    circleAnswers:{gregarious:false,guardTies:false,reputation:false,enemies:false,crime:false,loner:false},
    guardTiesBasis:"",
    innateTrait:"Compassionate",
    inheritedTrait:"",
    roadTrait:"",
    cloakColor:"Gold",
    relationships:{
      parents:[{name:"Ma",profession:"Carpenter",people:"Mouse",location:"Elmoss"}],
      seniorArtisan:{name:"Feris",profession:"Carpenter",people:"Mouse",location:"Lockhaven"},
      mentor:{name:"Gavin",role:"Patrol Leader",profession:"Guard",people:"Mouse",location:"Elmoss",traits:["Oldfur"]},
      friend:{name:"Tuk",profession:"Bandit",people:"Mouse",location:"Elmoss"},
      enemy:{name:"Paul",profession:"Patrol Leader",people:"Mouse",location:"Lockhaven"}
    },
    drives:{belief:"Protect the Territories.",goal:"Finish the patrol.",instinct:"Check the trail."},
    weapon:"Halberd",
    distinctiveGear:"Carving knife"
  },
  allocations:{
    naturalTalent:["Deceiver"],
    parentsTrade:["Carpenter"],
    convincing:["Deceiver"],
    mentorTraining:["Survivalist"],
    serviceAlloc:{Fighter:3,Hunter:2,Scout:1},
    wiseChoices:["Lockhaven-wise","Governor-wise"]
  }
};

const draft = creation.createProfileCreationDraft("mg1e", seed);
const plan = creation.profileCreationCommitPlan("mg1e", draft, {partyContext:new CreationPartyContext()});
assert.equal(plan.liveMutation, true);
assert.equal(plan.transaction.liveExecution, true);
assert.equal(plan.transaction.previewOnly, false);
assert.equal(plan.transaction.provenanceWrite, true);
assert.equal(plan.transaction.relationshipWrite, true);
assert.equal(plan.relationships.liveWrite, true);
assert.equal(plan.transaction.activatedByRulesProfile, "mg1e");
assert.deepEqual(plan.provisioning.canonicalConditions.names, ["Hungry & Thirsty","Angry","Tired","Injured","Sick"]);
assert.ok(plan.provisioning.canonicalSkills.names.includes("Scientist"));

// Round-trip must remain settings-only and idempotent.
writes.length = 0;
await activation.switchToLegacyMixed();
await activation.switchToMg1e();
assert.deepEqual(writes.map(row => row.key), [
  "activeRulesProfileId","activeRulesProfileVersion",
  "activeRulesProfileId","activeRulesProfileVersion"
]);
assert.equal(activation.activeRulesProfileId(), "mg1e");

const source = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
for (const forbidden of ["Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create"]) {
  assert.equal(source.includes(forbidden), false, `Profile activation must remain settings-only: ${forbidden}`);
}
assert.ok(source.includes("restoreProfileSettings"));
assert.ok(source.includes("realmGuardRulesProfileChanged"));
assert.ok(source.includes("qaProfileActivationRuntime"));

console.log("PASS M10B.11 MG1E Selectable QA Activation · QA-only gate · reversible settings-only switch · live CORE M9 creation routing");
