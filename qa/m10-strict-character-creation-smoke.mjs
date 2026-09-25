import assert from "node:assert/strict";
import fs from "node:fs";
import { CreationPartyContext } from "../module/core/m9-creation.mjs";
import {
  getStrictCreationStatus,
  strictCreateDraft,
  strictCreationCommitPlan,
  strictCreationCommitPreview,
  strictCreationReview,
  strictValidateCreation,
  strictValidateCreationStep
} from "../module/m10-strict-character-creation.mjs";
import {
  REALM_GUARD_STRICT_CREATION_PROFILE,
  STRICT_CREATION_PROFILE_ID,
  STRICT_CREATION_PROFILE_VERSION
} from "../module/profiles/realm-guard-strict-creation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.\d+\.\d+(?:\.\d+)*(?:-(?:alpha|beta|rc|qa)\.\d+)?$/);

function baseRelationships(overrides = {}) {
  return {
    lineage: "House QA",
    insignia: "White Star",
    mother: { name: "Mara", profession: "Farmer", location: "Bree" },
    father: { name: "", profession: "", location: "" },
    seniorArtisan: { name: "Harl", profession: "Farmer", location: "Bree" },
    mentor: { name: "Tor", role: "Veteran", location: "Bree", age: 50 },
    friend: { name: "Pip", profession: "Miller", location: "Bree" },
    enemy: { name: "Rusk", people: "Man", profession: "Bandit", location: "Bree-land" },
    ...overrides
  };
}

function scoutSeed(overrides = {}) {
  return {
    mode: "guided",
    answers: {
      name: "Strict Scout",
      concept: "qa7",
      background: "Strict preview.",
      rank: "scout",
      age: 30,
      homelandKey: "bree",
      homelandSkill: "Farmer",
      homelandTrait: "Short",
      natureAnswers: { danger:false, secondAge:false, loss:false, wilds:false, married:false, enemyFirst:false },
      apprenticeship: "Farmer",
      mentorTraining: "Scout",
      specialty: "Pathfinder",
      resourceAnswers: { trade:true, parentsWealth:false, gifts:false, thrifty:false, debt:false, pack:false },
      resourceTrade: "Farmer",
      parentsResourceProfession: "",
      circleAnswers: { gregarious:true, rangerTies:false, reputation:false, enemies:false, crime:false, loner:false },
      rangerTiesBasis: "",
      innateTrait: "Calm",
      inheritedTrait: "",
      roadTrait: "",
      mentorRuleConfirmed: true,
      allowEnemyServant: false,
      relationships: baseRelationships(),
      drives: { belief:"Guard the road.", goal:"Find the ford.", instinct:"Check the trail." },
      weapon: "Sword",
      armor: "Leather Armor",
      distinctiveGear: "Rope",
      ...overrides.answers
    },
    allocations: {
      naturalTalent: ["Scout"],
      parentsTrade: ["Farmer"],
      convincing: ["Persuader"],
      serviceAlloc: { Scout: 3, Pathfinder: 3 },
      wiseChoices: ["Road-wise", "Road-wise"],
      ...overrides.allocations
    },
    metadata: overrides.metadata ?? {}
  };
}

const status = getStrictCreationStatus();
assert.ok(["M10A.6","M10A.7","M10A.8","M10A.9"].includes(status.phase));
assert.equal(status.profileId, STRICT_CREATION_PROFILE_ID);
assert.equal(status.profileVersion, STRICT_CREATION_PROFILE_VERSION);
assert.equal(status.coreEngine, "CORE_M9");
assert.equal(status.liveAuthority, false);
assert.equal(status.liveCommit, false);
assert.equal(status.ratedWises, true);
assert.equal(status.startingSkillWiseCap, 6);
assert.equal(status.inventoryPolicy, "LOOSE");
assert.deepEqual(status.conditions.provisioned, ["Hungry & Thirsty","Angry","Tired","Injured","Strained"]);
assert.deepEqual(status.conditions.excluded, ["Fresh","Afraid","Sick"]);
assert.equal(status.levels, false);
assert.equal(status.talents, false);
assert.equal(status.liveCommitAvailable, false);
assert.equal(status.writesActorsOnCommit, false);
assert.equal(status.writesItemsOnCommit, false);
assert.equal(status.writesRelationshipsOnCommit, false);

const emptyParty = new CreationPartyContext();
const scoutDraft = strictCreateDraft(scoutSeed());
const review = strictCreationReview(scoutDraft, { partyContext: emptyParty });
assert.equal(review.profileId, STRICT_CREATION_PROFILE_ID);
assert.equal(review.abilities.will, 3);
assert.equal(review.abilities.health, 5);
assert.equal(review.abilities.nature, 3);
assert.equal(review.skillChecks.Scout, 5);
assert.equal(review.skillChecks.Pathfinder, 4);
assert.equal(review.wiseChecks["Road-wise"], 2);
assert.equal(scoutDraft.derivedValues.wiseRatings["Road-wise"], 3);
assert.equal(scoutDraft.derivedValues.budgets.service, 6);
assert.equal(scoutDraft.derivedValues.budgets.wises, 2);
assert.equal(scoutDraft.derivedValues.creationPolicy.ratedWises, true);
assert.equal(scoutDraft.derivedValues.creationPolicy.startingSkillWiseCap, 6);
assert.equal(scoutDraft.derivedValues.creationPolicy.levels, false);
assert.equal(scoutDraft.derivedValues.creationPolicy.talents, false);
assert.equal(scoutDraft.derivedValues.creationPolicy.inventoryPolicy, "LOOSE");

const scoutValidation = strictValidateCreation(scoutDraft, { partyContext: emptyParty });
assert.equal(scoutValidation.valid, true);

const duplicateSpecialtyParty = new CreationPartyContext({
  existingCharacters:[{actorId:"existing",name:"TrueBlood",station:"veteran",age:55,specialty:"Pathfinder",traits:[]}]
});
const duplicateSpecialtyValidation = strictValidateCreation(scoutDraft, { partyContext: duplicateSpecialtyParty });
const specialtyErrors = duplicateSpecialtyValidation.errors.filter(entry => entry.code === "SPECIALTY_NOT_UNIQUE");
assert.equal(duplicateSpecialtyValidation.valid, false);
assert.equal(specialtyErrors.length, 1, "Strict full preflight must report a duplicate Specialty only once.");
assert.equal(specialtyErrors[0].field, "specialty");
assert.equal(specialtyErrors[0].actorName, "TrueBlood");
assert.match(specialtyErrors[0].message, /Pathfinder is already the Specialty of TrueBlood/);

const wiseStep = strictValidateCreationStep("wises", scoutDraft, { partyContext: emptyParty });
assert.equal(wiseStep.valid, true);

const plan = strictCreationCommitPlan(scoutDraft, { partyContext: emptyParty });
assert.equal(plan.profileId, STRICT_CREATION_PROFILE_ID);
assert.equal(plan.profileVersion, STRICT_CREATION_PROFILE_VERSION);
assert.equal(plan.liveMutation, false);
assert.equal(plan.transaction.liveExecution, false);
assert.equal(plan.transaction.previewOnly, true);
assert.equal(plan.transaction.provenanceWrite, false);
assert.equal(plan.transaction.relationshipWrite, false);
assert.equal(plan.relationships.liveWrite, false);
assert.equal(plan.provisioning.inventory.policy, "LOOSE");
assert.equal(plan.provisioning.inventory.slotPlacementAuthority, false);
assert.equal(plan.provisioning.inventory.preservePlacementAsPresentation, true);
assert.equal(plan.provisioning.canonicalConditions.mode, "REALM_GUARD_STRICT_SET");
assert.deepEqual(plan.provisioning.canonicalConditions.names, ["Hungry & Thirsty","Angry","Tired","Injured","Strained"]);
assert.equal(plan.provisioning.canonicalConditions.names.includes("Fresh"), false);
assert.equal(plan.provisioning.canonicalConditions.names.includes("Afraid"), false);
assert.equal(plan.provisioning.canonicalConditions.names.includes("Sick"), false);
assert.equal(plan.provisioning.wises.length, 1);
assert.equal(plan.provisioning.wises[0].name, "Road-wise");
assert.equal(plan.provisioning.wises[0].system.rating, 3);
assert.deepEqual(plan.provisioning.wises[0].system.learning, { passed:0, failed:0, passNeeded:3, failNeeded:2 });
assert.equal(plan.provisioning.wises[0].flags["realm-guard"].strictRatedWise, true);
assert.equal(plan.actor.flags["realm-guard"].recruitmentEnemyHouseRule, undefined);
assert.equal(plan.actor.flags["realm-guard"].strictCreationProfile, true);
assert.equal(plan.actor.flags["realm-guard"].strictInventoryPolicy, "LOOSE");
assert.equal((plan.provisioning?.talents ?? []).length, 0);
assert.equal(plan.provisioning.gear.every(item => item.flags?.["realm-guard"]?.strictPlacementPresentationOnly === true), true);

const preview = strictCreationCommitPreview(scoutDraft, { partyContext: emptyParty, isGM:true, userId:"gm" });
assert.equal(preview.shadowOnly, true);
assert.equal(preview.liveMutation, false);
assert.deepEqual(preview.projection.conditions, ["Hungry & Thirsty","Angry","Tired","Injured","Strained"]);
assert.equal(preview.projection.wises[0].system.rating, 3);
assert.equal(preview.operations.every(operation => operation.enabled === false), true);

globalThis.game = {
  ...(globalThis.game ?? {}),
  realmGuard: {
    ...(globalThis.game?.realmGuard ?? {}),
    core: {
      ...(globalThis.game?.realmGuard?.core ?? {}),
      getActiveRulesProfile: () => ({ id: STRICT_CREATION_PROFILE_ID })
    }
  }
};
const livePlan = strictCreationCommitPlan(scoutDraft, { partyContext: emptyParty });
assert.equal(livePlan.profileId, STRICT_CREATION_PROFILE_ID);
assert.equal(livePlan.liveMutation, true);
assert.equal(livePlan.transaction.liveExecution, true);
assert.equal(livePlan.transaction.previewOnly, false);
assert.equal(livePlan.transaction.provenanceWrite, true);
assert.equal(livePlan.transaction.relationshipWrite, true);
assert.equal(livePlan.relationships.liveWrite, true);
assert.equal(livePlan.relationships.plannedLiveService, "CORE_M8_SOCIAL_NETWORK");

const orcDraft = strictCreateDraft(scoutSeed({
  answers: {
    relationships: baseRelationships({
      enemy: { name:"Grish", people:"Orc", profession:"Raider", location:"Misty Mountains" }
    })
  }
}));
let validation = strictValidateCreationStep("relationships", orcDraft, { partyContext: emptyParty });
assert.equal(validation.valid, false);
assert.equal(validation.errors.some(entry => entry.code === "STRICT_ENEMY_PEOPLE_INVALID"), true);

const servantOverrideDraft = strictCreateDraft(scoutSeed({
  answers: {
    allowEnemyServant: true,
    relationships: baseRelationships({
      enemy: { name:"Grish", people:"Orc", profession:"Raider", location:"Misty Mountains" }
    })
  }
}));
validation = strictValidateCreationStep("relationships", servantOverrideDraft, { partyContext: emptyParty });
assert.equal(validation.errors.some(entry => entry.code === "STRICT_ENEMY_HOUSE_RULE_DISABLED"), true);

const manDraft = strictCreateDraft(scoutSeed({
  answers: {
    relationships: baseRelationships({
      enemy: { name:"Dalby", people:"Man", profession:"Miller", location:"Rhosgobel" }
    })
  }
}));
validation = strictValidateCreationStep("relationships", manDraft, { partyContext: emptyParty });
assert.equal(validation.valid, true);

function recruitDraft() {
  return strictCreateDraft({
    answers: {
      name:"Recruit",
      rank:"recruit",
      age:23,
      relationships: baseRelationships({
        mentor:{name:"Mentor PC",role:"Ranger",location:"Bree"},
        enemy:{name:"Dalby",people:"Man",location:"Rhosgobel"}
      }),
      mentorRuleConfirmed:true
    }
  });
}

const recruit = recruitDraft();
const scoutMentorParty = new CreationPartyContext({
  existingCharacters:[{actorId:"mentor",name:"Mentor PC",station:"scout",age:35,traits:[]}]
});
validation = strictValidateCreationStep("relationships", recruit, { partyContext: scoutMentorParty });
assert.equal(validation.valid, false);
assert.equal(validation.errors.some(entry => entry.code === "STRICT_RECRUIT_MENTOR_STATION"), true);

const veteranMentorParty = new CreationPartyContext({
  existingCharacters:[{actorId:"mentor",name:"Mentor PC",station:"veteran",age:50,traits:[]}]
});
validation = strictValidateCreationStep("relationships", recruit, { partyContext: veteranMentorParty });
assert.equal(validation.valid, true);

const captainBase = strictCreateDraft({
  answers:{
    name:"Captain",
    rank:"captain",
    age:60,
    relationships:baseRelationships({
      mentor:{name:"Grey Mentor",role:"Ranger",location:"Bree",age:90},
      enemy:{name:"Dalby",people:"Man",location:"Rhosgobel"}
    }),
    mentorRuleConfirmed:true
  }
});
const noGreybeard = new CreationPartyContext({
  existingCharacters:[{name:"Grey Mentor",station:"lord",age:90,traits:[{name:"Wise",rating:2}]}]
});
validation = strictValidateCreationStep("relationships", captainBase, { partyContext:noGreybeard });
assert.equal(validation.valid, false);
assert.equal(validation.errors.some(entry => entry.code === "STRICT_MENTOR_GREYBEARD_REQUIRED"), true);

const greybeard = new CreationPartyContext({
  existingCharacters:[{name:"Grey Mentor",station:"lord",age:90,traits:[{name:"Greybeard",rating:1}]}]
});
validation = strictValidateCreationStep("relationships", captainBase, { partyContext:greybeard });
assert.equal(validation.valid, true);

assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.id, "realm-guard-strict");
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.version, 1);
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.rules.wiseMode, "RATED");
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.rules.startingSkillWiseCap, 6);
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.rules.inventoryPolicy, "LOOSE");
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.rules.levels, false);
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.rules.talents, false);
assert.equal(REALM_GUARD_STRICT_CREATION_PROFILE.rules.enemyServantHouseRule, false);
assert.ok(["NONE","CORE_M9_WHEN_STRICT_ACTIVE"].includes(REALM_GUARD_STRICT_CREATION_PROFILE.metadata.liveAuthority));

assert.ok(REALM_GUARD_STRICT_PROFILE.version >= 7, "M10A.6 creation policy must remain present in later Strict profile versions.");
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.creation.profileVersion, 1);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.creation.ratedWises, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.creation.levelsTalents, false);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.creation.inventoryPolicy, "LOOSE");
assert.ok(["M10A.6","M10A.7","M10A.8","M10A.9"].includes(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase), "M10A.6 smoke must survive later M10 phases.");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.creationPolicyReady, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.strictCreationPreviewReady, true);
assert.equal(typeof REALM_GUARD_STRICT_PROFILE.metadata.liveRuleAuthority, "boolean");

const strictService = fs.readFileSync("module/m10-strict-character-creation.mjs","utf8");
const strictProfileSource = fs.readFileSync("module/profiles/realm-guard-strict-creation.mjs","utf8");
for (const source of [strictService, strictProfileSource]) {
  for (const forbidden of [
    ".update(",
    ".createEmbeddedDocuments(",
    ".deleteEmbeddedDocuments(",
    "game.settings.set",
    ".setFlag(",
    ".unsetFlag("
  ]) assert.equal(source.includes(forbidden), false, `Strict M10A.6 preview must stay non-live: ${forbidden}`);
}

const legacyProfile = fs.readFileSync("module/profiles/realm-guard-legacy-mixed-creation.mjs","utf8");
assert.ok(legacyProfile.includes('wiseMode: "UNRATED"'), "Legacy Mixed creation must remain unrated.");
assert.ok(legacyProfile.includes('inventoryPolicy: "STRUCTURED"'), "Legacy Mixed creation must retain structured inventory.");
assert.ok(legacyProfile.includes("ENEMY_SERVANTS_HOUSE_RULE"), "Legacy Mixed enemy house-rule compatibility must remain available.");

const m9 = fs.readFileSync("module/m9-creation-shadow.mjs","utf8");
assert.ok(m9.includes("REALM_GUARD_LEGACY_MIXED_CREATION_PROFILE"), "CORE M9 must preserve the Legacy Mixed creation profile.");
if (["M10A.8","M10A.9"].includes(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase)) {
  assert.ok(m9.includes("REALM_GUARD_STRICT_CREATION_PROFILE"), "M10A.8+ must route CORE M9 to the Strict creation profile when active.");
  assert.ok(m9.includes("activeCreationEngine"), "M10A.8+ must select the creation engine from the active Rules Profile.");
} else {
  assert.equal(m9.includes("REALM_GUARD_STRICT_CREATION_PROFILE"), false, "Pre-activation phases must not route Strict creation into live M9.");
}

const profileService = fs.readFileSync("module/rules-profile-service.mjs","utf8");
assert.equal(profileService.includes("setActiveRulesProfile"), false, "No live profile switch API may exist in M10A.6.");

console.log("PASS M10A.6 Strict Character Creation regression · rated Wises · Enemy/Mentor validation · condition plan · Legacy compatibility preserved through activation");
