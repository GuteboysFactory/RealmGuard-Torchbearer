import assert from "node:assert/strict";
import fs from "node:fs";
import { CreationPartyContext } from "../module/core/m9-creation.mjs";
import { MG2E_FOUNDATION_PROFILE } from "../module/profiles/mg2e-foundation.mjs";
import {
  MG2E_CREATION_PROFILE,
  MG2E_CREATION_PROFILE_VERSION
} from "../module/profiles/mg2e-creation.mjs";
import {
  createProfileCreationDraft,
  profileCreationActivationReadiness,
  profileCreationCommitPlan,
  profileCreationCommitPreview,
  resolveCharacterCreationProfile,
  resolveM10BCharacterCreationPolicy,
  validateProfileCreation
} from "../module/m10b-character-creation.mjs";
import {
  getM10B8RulesReferenceStatus,
  profileRulesReferenceSnapshot
} from "../module/m10b-rules-reference.mjs";
import {
  profileActivationAvailable,
  profileActivationStatus,
  switchRulesProfile
} from "../module/m10-profile-activation.mjs";
import { mg2eActivationReadinessAudit } from "../module/m10c-mg2e-readiness-audit.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId","realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion",1],
  ["realm-guard.systemSchemaVersion",1],
  ["realm-guard.coreArchitectureVersion","0.1"],
  ["realm-guard.migrationHistory","[]"],
  ["realm-guard.migrationLastError",""]
]);
const writes = [];

globalThis.game = {
  system:{version:"1.12.0-qa.16"},
  user:{isGM:true,id:"gm"},
  actors:{contents:[]},
  items:{contents:[]},
  settings:{
    get:(ns,key)=>settings.get(ns + "." + key),
    set:async(ns,key,value)=>{
      writes.push({ns,key,value});
      settings.set(ns + "." + key,value);
      return value;
    }
  }
};
globalThis.Hooks = { callAll:()=>{} };

assert.equal(MG2E_FOUNDATION_PROFILE.version, 3);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.implementationPhase, "M10C.5");
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.foundationOnly, true);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.selectable, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.supported, false);
assert.equal(MG2E_FOUNDATION_PROFILE.metadata.liveRuleAuthority, false);
assert.equal(MG2E_FOUNDATION_PROFILE.domains.creation.liveAuthority, "CORE_M9_WHEN_ACTIVE");
assert.equal(MG2E_FOUNDATION_PROFILE.domains.creation.readyWhenActive, true);
assert.equal(MG2E_FOUNDATION_PROFILE.domains.creation.profileVersion, 3);

assert.equal(MG2E_CREATION_PROFILE.id, "mg2e");
assert.equal(MG2E_CREATION_PROFILE_VERSION, 3);
assert.equal(MG2E_CREATION_PROFILE.version, 3);
assert.equal(MG2E_CREATION_PROFILE.metadata.mode, "READY_WHEN_ACTIVE");
assert.equal(MG2E_CREATION_PROFILE.metadata.liveAuthority, "CORE_M9_WHEN_ACTIVE");
assert.equal(MG2E_CREATION_PROFILE.metadata.activationRequired, "mg2e");
assert.equal(MG2E_CREATION_PROFILE.rules.wiseMode, "UNRATED");
assert.equal(MG2E_CREATION_PROFILE.rules.startingSkillRating, 2);
assert.equal(MG2E_CREATION_PROFILE.rules.startingSkillCap, 6);
assert.equal(MG2E_CREATION_PROFILE.rules.recruitmentSteps, 21);
assert.equal(MG2E_CREATION_PROFILE.steps.length, 16);

const resolvedCreation = resolveCharacterCreationProfile("mg2e");
assert.equal(resolvedCreation.id, "mg2e");
assert.equal(resolvedCreation.version, 3);

const creationPolicy = resolveM10BCharacterCreationPolicy("mg2e");
assert.equal(creationPolicy.creationProfileAvailable, true);
assert.equal(creationPolicy.creationProfileVersion, 3);
assert.equal(creationPolicy.coreEngine, "CORE_M9");
assert.equal(creationPolicy.liveAuthority, "CORE_M9_WHEN_ACTIVE");
assert.equal(creationPolicy.readyWhenActive, true);
assert.equal(creationPolicy.liveCommit, false);
assert.equal(creationPolicy.foundationOnly, true);

const creationReadiness = profileCreationActivationReadiness("mg2e");
assert.equal(creationReadiness.transactionalCommit, true);
assert.equal(creationReadiness.readyWhenActive, true);
assert.equal(creationReadiness.liveCommit, false);
assert.equal(creationReadiness.activationGateClosed, true);
assert.equal(creationReadiness.existingActorMigrationRequired, false);

const party = new CreationPartyContext();
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

assert.equal(draft.derivedValues.abilities.nature, 4);
assert.equal(draft.derivedValues.abilities.will, 3);
assert.equal(draft.derivedValues.abilities.health, 5);
assert.equal(draft.derivedValues.abilities.resources, 2);
assert.equal(draft.derivedValues.abilities.circles, 2);
assert.equal(draft.derivedValues.skillRatings.Carpenter, 5);
assert.equal(draft.derivedValues.skillRatings.Manipulator, 2);
assert.equal(draft.derivedValues.skillRatings.Survivalist, 3);
assert.equal(draft.derivedValues.skillRatings.Hunter, 2);
assert.equal(draft.derivedValues.traitChecks.Alert, 1);
assert.equal(draft.derivedValues.traitChecks.Generous, 1);
assert.equal(draft.derivedValues.traitChecks.Compassionate, 1);
assert.deepEqual(draft.derivedValues.wises, ["Governor-wise"]);

const validation = validateProfileCreation("mg2e", draft, {partyContext:party});
assert.equal(validation.valid, true, JSON.stringify(validation.errors));

const plan = profileCreationCommitPlan("mg2e", draft, {partyContext:party});
assert.equal(plan.kind, "CreationCommitPlan");
assert.equal(plan.profileId, "mg2e");
assert.equal(plan.profileVersion, 3);
assert.equal(plan.validation.valid, true);
assert.equal(plan.transaction.mode, "COMPENSATING_ROLLBACK");
assert.equal(plan.transaction.readyWhenActive, true);
assert.equal(plan.transaction.liveExecution, false);
assert.equal(plan.transaction.previewOnly, true);
assert.equal(plan.transaction.provenanceWrite, false);
assert.equal(plan.transaction.relationshipWrite, false);
assert.equal(plan.transaction.activationRequired, "mg2e");
assert.equal(plan.relationships.liveWrite, false);
assert.equal(plan.actor.flags["realm-guard"].recruitmentVersion, "MG2E_M10C5");
assert.equal(plan.actor.system.attributes.nature.value, 4);
assert.equal(plan.actor.system.attributes.resources.value, 2);
assert.equal(plan.actor.system.attributes.circles.value, 2);
assert.deepEqual(plan.provisioning.canonicalConditions.names, ["Hungry & Thirsty","Angry","Tired","Injured","Sick"]);
assert.equal(plan.provisioning.inventory.policy, "LOOSE");
assert.equal(plan.provisioning.wises.length, 1);
assert.equal(plan.provisioning.wises[0].name, "Governor-wise");
assert.equal(plan.provisioning.wises[0].system.rating, 0);
assert.equal(plan.provisioning.wises[0].flags["realm-guard"].mg2eUnratedWise, true);

const commitPreview = profileCreationCommitPreview("mg2e", draft, {partyContext:party,isGM:true});
assert.equal(commitPreview.kind, "FoundryCreationCommitPreview");
assert.equal(commitPreview.shadowOnly, true);
assert.equal(commitPreview.liveMutation, false);
assert.ok(commitPreview.operations.every(row => row.enabled === false));
assert.equal(commitPreview.projection.provenance.writeLive, false);

const reference = profileRulesReferenceSnapshot("mg2e");
assert.equal(reference.profileId, "mg2e");
assert.equal(reference.mode, "READ_ONLY_PROFILE_REFERENCE");
assert.equal(reference.liveAuthority, false);
assert.equal(reference.foundationOnly, true);
assert.equal(reference.writesJournal, false);
assert.equal(reference.writesActors, false);
assert.equal(reference.writesItems, false);
assert.equal(reference.writesWorldSettings, false);
assert.ok(reference.pages.length >= 9);
assert.ok(reference.pages.some(page => page.id === "scale" && page.title === "Natural Order"));
assert.ok(reference.pages.some(page => page.id === "creation"));
assert.ok(reference.pages.some(page => page.id === "wises-traits-help"));

const referenceStatus = getM10B8RulesReferenceStatus();
assert.equal(referenceStatus.extendedPhase, "M10C.5");
assert.equal(referenceStatus.mg2e.profileId, "mg2e");
assert.ok(referenceStatus.mg2e.pages.length >= 9);

const activation = profileActivationStatus();
const mg2eActivation = activation.profiles.find(row => row.id === "mg2e");
assert.ok(mg2eActivation);
assert.equal(activation.mg2eActivationSurfaceRegistered, true);
assert.equal(mg2eActivation.foundationOnly, true);
assert.equal(mg2eActivation.selectable, false);
assert.equal(mg2eActivation.supported, false);
assert.equal(mg2eActivation.activationAvailable, false);
assert.equal(profileActivationAvailable("mg2e"), false);

writes.length = 0;
await assert.rejects(() => switchRulesProfile("mg2e"), /foundation-only/i);
assert.equal(writes.length, 0);

const audit = mg2eActivationReadinessAudit();
assert.equal(audit.technicalReadinessComplete, true);
assert.equal(audit.activationSurfaceRegistered, true);
assert.equal(audit.activationAvailable, false);
assert.deepEqual(audit.technicalBlockers, []);
assert.deepEqual(audit.openBlockers, ["LIVE_PARITY_QA","EXPLICIT_ACTIVATION_MILESTONE"]);
assert.equal(audit.decision, "NOT_READY_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN");
assert.equal(audit.nextStep, "M10C.6 MG2E Live Parity QA Foundation");

const blockerById = new Map(audit.blockers.map(row => [row.id,row]));
assert.equal(blockerById.get("FULL_RECRUITMENT_COMMIT_ADAPTER").state, "CLOSED");
assert.equal(blockerById.get("DEDICATED_LIVE_RULES_REFERENCE").state, "CLOSED");
assert.equal(blockerById.get("LIVE_PARITY_QA").state, "BLOCKED_NOT_RUN");
assert.equal(blockerById.get("EXPLICIT_ACTIVATION_MILESTONE").state, "DEFERRED");

for (const path of [
  "module/profiles/mg2e-creation.mjs",
  "module/m10b-rules-reference.mjs",
  "module/m10c-mg2e-readiness-audit.mjs"
]) {
  const source = fs.readFileSync(path,"utf8");
  for (const forbidden of ["game.settings.set","Actor.create(","deleteEmbeddedDocuments("]) {
    assert.equal(source.includes(forbidden), false, path + " must remain zero-write in M10C.5: " + forbidden);
  }
}

const activationSource = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activationSource.includes("switchToMg2e"), false);
assert.equal(activationSource.includes("MG2E_PROFILE_ID"), false);

console.log("PASS M10C.5 MG2E technical live-readiness · Recruitment READY_WHEN_ACTIVE · profile-owned Rules Reference · locked activation surface · activation OFF");
