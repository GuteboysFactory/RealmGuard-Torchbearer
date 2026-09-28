import assert from "node:assert/strict";
import fs from "node:fs";
import { CreationPartyContext } from "../module/core/m9-creation.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import {
  MG1E_CREATION_PROFILE,
  MG1E_CREATION_PROFILE_VERSION,
  MG1E_GUARD_RANKS,
  MG1E_HOMETOWNS
} from "../module/profiles/mg1e-creation.mjs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion", 4],
  ["realm-guard.systemSchemaVersion", 1],
  ["realm-guard.coreArchitectureVersion", "0.1"],
  ["realm-guard.migrationHistory", "[]"],
  ["realm-guard.migrationLastError", ""]
]);
globalThis.game = {
  system: { version: "1.12.0-qa.7" },
  user: { isGM: true, id: "gm" },
  actors: { contents: [] },
  settings: {
    get: (ns, key) => settings.get(`${ns}.${key}`),
    set: async (ns, key, value) => {
      settings.set(`${ns}.${key}`, value);
      return value;
    }
  }
};

const {
  createProfileCreationDraft,
  familyCreationPartyContext,
  getM10B7CharacterCreationStatus,
  profileCreationCommitPlan,
  profileCreationCommitPreview,
  profileCreationReview,
  resolveCharacterCreationProfile,
  resolveM10BCharacterCreationPolicy,
  validateProfileCreation,
  validateProfileCreationStep
} = await import("../module/m10b-character-creation.mjs");

const legacy = resolveM10BCharacterCreationPolicy("realm-guard-legacy-mixed");
const strict = resolveM10BCharacterCreationPolicy("realm-guard-strict");
const mg1e = resolveM10BCharacterCreationPolicy("mg1e");

assert.equal(legacy.phase, "M10B.7");
assert.equal(legacy.creationProfileId, "realm-guard-legacy-mixed");
assert.equal(legacy.familySemantics, false);
assert.equal(legacy.ratedWises, false);
assert.equal(legacy.enemyHouseRuleAllowed, true);
assert.equal(legacy.liveCommit, true);

assert.equal(strict.creationProfileId, "realm-guard-strict");
assert.equal(strict.familySemantics, true);
assert.equal(strict.ratedWises, true);
assert.equal(strict.mentorValidation, "STRICT_SOURCE_RULES");
assert.equal(strict.enemyValidation, "REALM_GUARD_STRICT_PEOPLES");
assert.equal(strict.enemyHouseRuleAllowed, false);
assert.equal(strict.liveCommit, false);

assert.equal(MG1E_FOUNDATION_PROFILE.version, 8);
assert.equal(mg1e.rulesProfileVersion, 8);
assert.equal(mg1e.creationProfileId, "mg1e");
assert.equal(mg1e.creationProfileVersion, MG1E_CREATION_PROFILE_VERSION);
assert.equal(mg1e.foundationOnly, true);
assert.equal(mg1e.selectable, false);
assert.equal(mg1e.supported, false);
assert.equal(mg1e.familySemantics, true);
assert.equal(mg1e.ratedWises, true);
assert.equal(mg1e.startingSkillWiseCap, 6);
assert.equal(mg1e.inventoryPolicy, "LOOSE");
assert.equal(mg1e.mentorValidation, "MG1E_SOURCE_RULES");
assert.equal(mg1e.enemyValidation, "MG1E_MOUSE_PREFERRED");
assert.equal(mg1e.enemyHouseRuleAllowed, false);
assert.equal(mg1e.liveAuthority, "NONE");
assert.equal(mg1e.liveCommit, false);
assert.equal(mg1e.automaticNpcCreation, false);
assert.deepEqual(mg1e.writes, { actorsOnResolve:0, itemsOnResolve:0, relationshipsOnResolve:0, settingsOnResolve:0 });

const status = getM10B7CharacterCreationStatus();
assert.equal(status.phase, "M10B.7");
assert.equal(status.coreEngine, "CORE_M9");
assert.equal(status.mg1eFoundation.profileVersion, 8);
assert.equal(status.mg1eFoundation.foundationOnly, true);
assert.equal(status.mg1eFoundation.selectable, false);
assert.equal(status.mg1eFoundation.liveCommit, false);
assert.equal(status.writesOnResolve, 0);
assert.equal(status.automaticConversion, false);
assert.equal(status.automaticNpcCreation, false);

assert.equal(resolveCharacterCreationProfile("mg1e"), MG1E_CREATION_PROFILE);
assert.deepEqual(Object.keys(MG1E_GUARD_RANKS), ["tenderpaw","guardmouse","patrol-guard","patrol-leader","guard-captain"]);
assert.deepEqual(
  Object.fromEntries(Object.entries(MG1E_GUARD_RANKS).map(([id, row]) => [id, [row.ageMin,row.ageMax,row.will,row.health]])),
  {
    tenderpaw:[14,17,2,6],
    guardmouse:[18,25,3,5],
    "patrol-guard":[21,50,4,4],
    "patrol-leader":[21,60,5,4],
    "guard-captain":[41,60,6,3]
  }
);
assert.equal(MG1E_HOMETOWNS.elmoss.skills.includes("Carpenter"), true);
assert.equal(MG1E_HOMETOWNS.elmoss.traits.includes("Alert"), true);

function guardmouseSeed(overrides = {}) {
  return {
    mode: "guided",
    answers: {
      name: "Baron QA",
      concept: "Tough guardmouse with a compassionate core",
      rank: "guardmouse",
      age: 22,
      furColor: "Light Brown",
      natureAnswers: { saveForWinter:false, runAndHide:false, fearPredators:true },
      hometownKey: "elmoss",
      hometownSkill: "Carpenter",
      hometownTrait: "Alert",
      apprenticeship: "Carpenter",
      specialty: "Survivalist",
      resourceAnswers: { winterTrade:true, parentsProfession:false, gifts:false, thrifty:false, debt:true, pack:true },
      resourceTrade: "Carpenter",
      parentsResourceProfession: "",
      circleAnswers: { gregarious:false, guardTies:false, reputation:false, enemies:false, crime:false, loner:false },
      guardTiesBasis: "",
      innateTrait: "Compassionate",
      inheritedTrait: "",
      roadTrait: "",
      cloakColor: "Gold",
      relationships: {
        parents: [{ name:"Ma Twistwood", profession:"Carpenter", people:"Mouse", location:"Elmoss" }],
        seniorArtisan: { name:"Feris", profession:"Carpenter", people:"Mouse", location:"Lockhaven" },
        mentor: { name:"Gavin", role:"Patrol Leader", profession:"Guard", people:"Mouse", location:"Elmoss", traits:["Oldfur"] },
        friend: { name:"Tuk", profession:"Bandit", people:"Mouse", location:"Elmoss" },
        enemy: { name:"Paul", profession:"Patrol Leader", people:"Mouse", location:"Lockhaven" }
      },
      drives: {
        belief: "I will build a good name for the Mouse Guard.",
        goal: "I will ensure that none of my patrolmates come to harm.",
        instinct: "Anticipate what the patrol leader needs."
      },
      weapon: "Halberd",
      distinctiveGear: "Carving knife",
      ...overrides.answers
    },
    allocations: {
      naturalTalent: ["Deceiver"],
      parentsTrade: ["Carpenter"],
      convincing: ["Deceiver"],
      mentorTraining: ["Survivalist"],
      serviceAlloc: { Fighter:3, Hunter:2, Scout:1 },
      wiseChoices: ["Lockhaven-wise","Governor-wise"],
      ...overrides.allocations
    }
  };
}

const emptyParty = new CreationPartyContext();
const draft = createProfileCreationDraft("mg1e", guardmouseSeed());
assert.equal(draft.profileId, "mg1e");
assert.equal(draft.profileVersion, MG1E_CREATION_PROFILE_VERSION);
assert.equal(draft.derivedValues.abilities.nature, 4);
assert.equal(draft.derivedValues.abilities.will, 3);
assert.equal(draft.derivedValues.abilities.health, 5);
assert.equal(draft.derivedValues.abilities.resources, 3);
assert.equal(draft.derivedValues.abilities.circles, 2);
assert.equal(draft.derivedValues.resources.fate, 1);
assert.equal(draft.derivedValues.resources.persona, 1);
assert.equal(draft.derivedValues.skillRatings.Carpenter, 4);
assert.equal(draft.derivedValues.skillRatings.Deceiver, 3);
assert.equal(draft.derivedValues.skillRatings.Survivalist, 3);
assert.equal(draft.derivedValues.skillRatings.Fighter, 4);
assert.equal(draft.derivedValues.wiseRatings["Lockhaven-wise"], 2);
assert.equal(draft.derivedValues.wiseRatings["Governor-wise"], 2);
assert.equal(draft.derivedValues.budgets.service, 6);
assert.equal(draft.derivedValues.budgets.wises, 2);
assert.equal(draft.derivedValues.restrictions.bannedTraits.includes("Fearless"), true);

const validation = validateProfileCreation("mg1e", draft, { partyContext: emptyParty });
assert.equal(validation.valid, true, JSON.stringify(validation.errors));

const review = profileCreationReview("mg1e", draft, { partyContext: emptyParty });
assert.equal(review.profileId, "mg1e");
assert.equal(review.profileVersion, MG1E_CREATION_PROFILE_VERSION);
assert.equal(review.abilities.nature, 4);
assert.equal(review.wiseChecks["Lockhaven-wise"], 1);

const plan = profileCreationCommitPlan("mg1e", draft, { partyContext: emptyParty });
assert.equal(plan.profileId, "mg1e");
assert.equal(plan.profileVersion, MG1E_CREATION_PROFILE_VERSION);
assert.equal(plan.liveMutation, false);
assert.equal(plan.transaction.liveExecution, false);
assert.equal(plan.transaction.previewOnly, true);
assert.equal(plan.transaction.provenanceWrite, false);
assert.equal(plan.transaction.relationshipWrite, false);
assert.equal(plan.relationships.liveWrite, false);
assert.equal(plan.provisioning.inventory.policy, "LOOSE");
assert.deepEqual(plan.provisioning.canonicalConditions.names, ["Hungry & Thirsty","Angry","Tired","Injured","Sick"]);
assert.equal(plan.provisioning.wises.every(w => Number(w.system.rating) === 2), true);
assert.equal(plan.provenance.profileId, "mg1e");
assert.equal(plan.provenance.profileVersion, MG1E_CREATION_PROFILE_VERSION);

const preview = profileCreationCommitPreview("mg1e", draft, { partyContext: emptyParty, isGM:true, userId:"gm" });
assert.equal(preview.shadowOnly, true);
assert.equal(preview.liveMutation, false);
assert.equal(preview.operations.every(operation => operation.enabled === false), true);
assert.equal(preview.projection.provenance.profileId, "mg1e");
assert.equal(preview.projection.provenance.profileVersion, MG1E_CREATION_PROFILE_VERSION);

const tenderpaw = createProfileCreationDraft("mg1e", guardmouseSeed({
  answers: {
    name:"Tender QA",
    rank:"tenderpaw",
    age:16,
    cloakColor:"",
    relationships: {
      parents:[{name:"Parent",profession:"Weaver",people:"Mouse",location:"Lockhaven"}],
      seniorArtisan:{name:"Senior",profession:"Weaver",people:"Mouse",location:"Lockhaven"},
      mentor:{name:"Mentor PC",role:"Patrol Leader",profession:"Guard",people:"Mouse",location:"Lockhaven"},
      friend:{name:"Friend",profession:"Weaver",people:"Mouse",location:"Lockhaven"},
      enemy:{name:"Enemy",profession:"Trader",people:"Mouse",location:"Lockhaven"}
    },
    innateTrait:"Compassionate",
    inheritedTrait:"Brave",
    specialty:""
  },
  allocations: {
    naturalTalent:["Deceiver","Scout"],
    parentsTrade:["Carpenter","Weaver"],
    convincing:["Persuader"],
    mentorTraining:["Scout","Pathfinder"],
    serviceAlloc:{Fighter:1,Scout:1,Pathfinder:1},
    wiseChoices:["Lockhaven-wise"]
  }
}));
let step = validateProfileCreationStep("mg1e","relationships",tenderpaw,{partyContext:emptyParty});
assert.equal(step.errors.some(e => e.code === "MG1E_TENDERPAW_MENTOR_PC"), true);
const tenderpawParty = new CreationPartyContext({
  existingCharacters:[{actorId:"mentor",name:"Mentor PC",rank:"patrol-leader",age:40,specialty:"Hunter",traits:[]}]
});
step = validateProfileCreationStep("mg1e","relationships",tenderpaw,{partyContext:tenderpawParty});
assert.equal(step.errors.some(e => e.code === "MG1E_TENDERPAW_MENTOR_PC"), false);

const captain = createProfileCreationDraft("mg1e", guardmouseSeed({
  answers:{name:"Captain QA",rank:"guard-captain",age:50,guardCaptainApproved:false},
  allocations:{
    naturalTalent:["Deceiver","Scout"],
    parentsTrade:["Carpenter"],
    convincing:["Deceiver","Orator"],
    mentorTraining:["Survivalist"],
    serviceAlloc:{Fighter:3,Hunter:3,Scout:2,Pathfinder:2,Militarist:2},
    wiseChoices:["A-wise","B-wise","C-wise","D-wise","E-wise","F-wise"]
  }
}));
step = validateProfileCreationStep("mg1e","identity",captain,{partyContext:emptyParty});
assert.equal(step.errors.some(e => e.code === "MG1E_GUARD_CAPTAIN_GROUP_APPROVAL"), true);

const routerSource = fs.readFileSync("module/m10b-character-creation.mjs","utf8");
const m9Source = fs.readFileSync("module/m9-creation-shadow.mjs","utf8");
const recruitmentSource = fs.readFileSync("module/recruitment.mjs","utf8");
const mgSource = fs.readFileSync("module/profiles/mg1e-creation.mjs","utf8");
for (const source of [routerSource, mgSource]) {
  for (const forbidden of ["Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","game.settings.set",".setFlag(", ".update("]) {
    assert.equal(source.includes(forbidden), false, `M10B.7 creation policy must be pure/read-only: ${forbidden}`);
  }
}
assert.equal(m9Source.includes("isStrictRealmGuard"), false, "CORE M9 must not choose Creation rules by Strict identity.");
assert.equal(recruitmentSource.includes("isStrictRealmGuard"), false, "Recruitment UI must not choose Creation presentation by Strict identity.");
assert.ok(m9Source.includes("getActiveM10BCharacterCreationPolicy"));
assert.ok(recruitmentSource.includes("getActiveM10BCharacterCreationPolicy"));
assert.equal(fs.readFileSync("module/m10-profile-activation.mjs","utf8").includes('"mg1e"'), false, "MG1E must remain non-selectable in qa.7.");

const partyContext = familyCreationPartyContext({actors:[]});
assert.equal(partyContext.existingCharacters.length, 0);

console.log("PASS M10B.7 Character Creation Profile Routing · MG1E v8 foundation · CORE M9 generic routing · zero MG1E live writes");
