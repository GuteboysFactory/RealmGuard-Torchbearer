import assert from "node:assert/strict";
import fs from "node:fs";
import { CreationCommitPlan, CreationPartyContext } from "../module/core/m9-creation.mjs";
import { FoundryCreationCommitAdapter } from "../module/m9-creation-commit-adapter.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion", 4],
  ["realm-guard.systemSchemaVersion", 1],
  ["realm-guard.coreArchitectureVersion", "0.1"],
  ["realm-guard.migrationHistory", "[]"],
  ["realm-guard.migrationLastError", ""]
]);
const settingWrites = [];

globalThis.game = {
  system:{version:"1.12.0-qa.10"},
  user:{isGM:true,id:"gm"},
  actors:{contents:[]},
  items:{contents:[]},
  settings:{
    get:(ns,key)=>settings.get(`${ns}.${key}`),
    set:async(ns,key,value)=>{
      settingWrites.push({ns,key,value});
      settings.set(`${ns}.${key}`,value);
      return value;
    }
  }
};
globalThis.Hooks = { callAll:()=>{} };

const activation = await import("../module/m10-profile-activation.mjs");
const {
  createProfileCreationDraft,
  profileCreationCommitPlan,
  profileCreationPresentationSnapshot,
  profileCreationActivationReadiness,
  resolveM10BCharacterCreationPolicy
} = await import("../module/m10b-character-creation.mjs");
const { MG1E_FOUNDATION_PROFILE } = await import("../module/profiles/mg1e-foundation.mjs");
const { MG1E_CREATION_PROFILE_VERSION } = await import("../module/profiles/mg1e-creation.mjs");
const { resolveProfileCapabilities } = await import("../module/rules-profile-service.mjs");

assert.equal(MG1E_FOUNDATION_PROFILE.version, 10);
assert.equal(MG1E_CREATION_PROFILE_VERSION, 2);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.foundationOnly, true);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.selectable, false);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.supported, false);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, false);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.liveReadinessClosure, true);
assert.equal(MG1E_FOUNDATION_PROFILE.metadata.creationReadyWhenActive, true);

const mgCaps = resolveProfileCapabilities("mg1e");
assert.equal(mgCaps.rules.wises.rated, true);
assert.equal(mgCaps.presentation.showRatedWiseControls, true);
assert.equal(mgCaps.rules.conflict.descriptorNatureAllowed, true);
assert.equal(mgCaps.rules.creation.readyWhenActive, true);
assert.equal(mgCaps.rules.creation.liveAuthority, "CORE_M9_WHEN_ACTIVE");

assert.equal(activation.profileActivationAvailable("realm-guard-strict"), true);
assert.equal(activation.profileActivationAvailable("mg1e"), false);
const activationStatus = activation.profileActivationStatus();
assert.equal(activationStatus.phase, "M10B.10");
assert.equal(activationStatus.mg1eActivationAvailable, false);
assert.equal(activationStatus.mg1eSelectable, false);
assert.equal(activationStatus.mg1eSupported, false);

settingWrites.length = 0;
await assert.rejects(() => activation.switchRulesProfile("mg1e"), /foundation-only|not selectable|not marked supported|not in an activatable state/i);
assert.equal(settingWrites.length, 0, "Rejected MG1E activation must not write profile settings.");

const itemSheet = fs.readFileSync("sheets/item-sheet.mjs","utf8");
const itemTemplate = fs.readFileSync("templates/item/item.hbs","utf8");
assert.ok(itemSheet.includes("getActiveProfileCapabilities"));
assert.ok(itemSheet.includes("showRatedWiseControls: usesRatedWises()"));
assert.equal(itemSheet.includes("isStrictRealmGuard"), false);
assert.ok(itemTemplate.includes("showRatedWiseControls"));
assert.ok(itemTemplate.includes("Rated-Wise profile."));
assert.equal(itemTemplate.includes("Strict Realm Guard only."), false);

const conflicts = fs.readFileSync("module/conflicts.mjs","utf8");
assert.ok(conflicts.includes("descriptorNatureAllowed"));
assert.equal(conflicts.includes('profileId === "realm-guard-strict"'), false);

const manual = fs.readFileSync("module/manual.mjs","utf8");
assert.ok(manual.includes('activeId !== "realm-guard-legacy-mixed"'));
assert.ok(manual.includes("Open Active Profile Rules"));
assert.ok(manual.includes('openProfileRulesReference(activeId !== "realm-guard-legacy-mixed" ? activeId : "realm-guard-strict")'));

const profileMenu = fs.readFileSync("module/profile-management-menu.mjs","utf8");
const profileTemplate = fs.readFileSync("templates/apps/profile-management.hbs","utf8");
assert.ok(profileMenu.includes("switchRulesProfile"));
assert.ok(profileMenu.includes("activationRows"));
assert.ok(profileTemplate.includes('data-action="switchProfile"'));
assert.ok(profileTemplate.includes('data-rg-contract="profile-switch-supported"'));

const policy = resolveM10BCharacterCreationPolicy("mg1e");
assert.equal(policy.phase, "M10B.10");
assert.equal(policy.readyWhenActive, true);
assert.equal(policy.liveAuthority, "CORE_M9_WHEN_ACTIVE");
assert.equal(policy.liveCommit, false);
assert.equal(policy.foundationOnly, true);
assert.equal(policy.selectable, false);
assert.equal(policy.supported, false);

const presentation = profileCreationPresentationSnapshot("mg1e");
assert.equal(presentation.phase, "M10B.10");
assert.equal(presentation.presentationAuthority, "PROFILE_OWNED_CORE_M9");
assert.equal(presentation.readyWhenActive, true);
assert.equal(presentation.liveCommit, false);
assert.equal(presentation.steps.length, 11);

const readiness = profileCreationActivationReadiness("mg1e");
assert.equal(readiness.readyWhenActive, true);
assert.equal(readiness.activationGateClosed, true);
assert.equal(readiness.existingActorMigrationRequired, false);
assert.equal(readiness.transactionalCommit, true);

function guardmouseSeed() {
  return {
    mode:"guided",
    answers:{
      name:"M10B10 Mouse",
      concept:"Activation readiness QA",
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
}

const draft = createProfileCreationDraft("mg1e", guardmouseSeed());
const plan = profileCreationCommitPlan("mg1e", draft, {partyContext:new CreationPartyContext()});
assert.equal(plan.liveMutation, false);
assert.equal(plan.transaction.liveExecution, false);
assert.equal(plan.transaction.readyWhenActive, true);
assert.equal(plan.transaction.activationReadiness, "READY_WHEN_ACTIVE");
assert.equal(plan.relationships.readyWhenActive, true);
assert.ok(plan.provisioning.canonicalSkills.names.includes("Apiarist"));
assert.ok(plan.provisioning.canonicalSkills.names.includes("Scientist"));
assert.deepEqual(plan.provisioning.canonicalConditions.names,["Hungry & Thirsty","Angry","Tired","Injured","Sick"]);
assert.equal(plan.provisioning.wises.every(w=>Number(w.system.rating)>0),true);
assert.ok(Array.isArray(plan.actor.flags["realm-guard"].creationRelationships));
assert.ok(plan.actor.flags["realm-guard"].creationRelationships.length >= 5);

const liveSimulationPlan = new CreationCommitPlan({
  profileId:plan.profileId,
  profileVersion:plan.profileVersion,
  validation:plan.validation,
  review:plan.review,
  provenance:plan.provenance,
  actor:plan.actor,
  provisioning:plan.provisioning,
  relationships:{...plan.relationships,liveWrite:true},
  postCommit:plan.postCommit,
  transaction:{
    ...plan.transaction,
    liveExecution:true,
    previewOnly:false,
    provenanceWrite:true,
    relationshipWrite:true,
    activationSimulation:true
  }
});

function fakeActor(name) {
  return {
    id:"actor-qa",
    name,
    type:"character",
    items:[],
    conditions:[],
    flags:{},
    deleted:false,
    async setFlag(ns,key,value){ this.flags[ns] ??= {}; this.flags[ns][key]=value; return value; },
    async delete(){ this.deleted=true; return this; }
  };
}

const events=[];
let created=null;
const adapter = new FoundryCreationCommitAdapter({
  shadowOnly:false,
  runtime:{
    ensureFolder:async()=>({id:"pc-folder"}),
    createActor:async data=>{ created=fakeActor(data.name); created.data=data; events.push("CREATE_ACTOR"); return created; },
    applySkillRatings:async(_actor,planned)=>{ events.push("PROVISION_SKILLS"); assert.ok(planned.provisioning.canonicalSkills.names.includes("Apiarist")); return 1; },
    createPlannedItems:async(_actor,planned)=>{ events.push("CREATE_ITEMS"); assert.ok(planned.provisioning.wises.length>0); return []; },
    ensureConditions:async(_actor,planned)=>{ events.push("PROVISION_CONDITIONS"); assert.ok(planned.provisioning.canonicalConditions.names.includes("Sick")); return []; },
    normalizeRelationships:async()=>{ events.push("NORMALIZE_RELATIONSHIPS"); return {created:true}; }
  }
});
const simulated = await adapter.execute(liveSimulationPlan,{
  isGM:true,
  userId:"gm",
  rulesSnapshot:{profileId:"mg1e",profileVersion:liveSimulationPlan.profileVersion,rulesSnapshotHash:"m10b10-sim"}
});
assert.equal(simulated.rolledBack,false);
assert.equal(created.flags["realm-guard"].creationProvenance.rulesProfileId,"mg1e");
assert.deepEqual(events,["CREATE_ACTOR","PROVISION_SKILLS","CREATE_ITEMS","PROVISION_CONDITIONS","NORMALIZE_RELATIONSHIPS"]);

let rollbackActor=null;
const rollbackAdapter = new FoundryCreationCommitAdapter({
  shadowOnly:false,
  runtime:{
    ensureFolder:async()=>({id:"pc-folder"}),
    createActor:async data=>{ rollbackActor=fakeActor(data.name); return rollbackActor; },
    applySkillRatings:async()=>1,
    createPlannedItems:async()=>[],
    ensureConditions:async()=>[],
    normalizeRelationships:async()=>({created:true})
  }
});
await assert.rejects(
  () => rollbackAdapter.execute(liveSimulationPlan,{
    isGM:true,
    userId:"gm",
    rulesSnapshot:{profileId:"mg1e",profileVersion:liveSimulationPlan.profileVersion,rulesSnapshotHash:"m10b10-sim"},
    faultPhase:"CREATE_ITEMS"
  }),
  error => error?.realmGuardCommit?.rolledBack === true && error?.realmGuardCommit?.injected === true
);
assert.equal(rollbackActor.deleted,true);

const m8 = fs.readFileSync("module/core/m8-social-network.mjs","utf8");
assert.ok(m8.includes("creationRelationships"));
assert.ok(m8.includes("PROFILE_CREATION_RELATIONSHIPS"));

console.log("PASS M10B.10 MG1E Live Readiness Closure · activation gate closed · generic live surfaces · creation ready-when-active · rollback verified");
