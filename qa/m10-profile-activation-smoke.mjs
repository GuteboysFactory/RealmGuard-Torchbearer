import assert from "node:assert/strict";
import fs from "node:fs";

const settings = new Map([
  ["realm-guard.systemSchemaVersion", 1],
  ["realm-guard.coreArchitectureVersion", "0.1"],
  ["realm-guard.activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion", 1],
  ["realm-guard.migrationHistory", "[]"],
  ["realm-guard.migrationLastError", ""]
]);
const settingWrites = [];
globalThis.game = {
  system:{version:"1.11.0-qa.9"},
  user:{isGM:true,id:"gm"},
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
const { REALM_GUARD_STRICT_PROFILE } = await import("../module/profiles/realm-guard-strict.mjs");
const { resolveRulesProfile } = await import("../module/rules-profile-service.mjs");

assert.equal(REALM_GUARD_STRICT_PROFILE.version, 9);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase, "M10A.8");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.activationState, "QA_ACTIVE");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.selectable, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.supported, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.previewOnly, false);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.liveRuleAuthority, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.strictRulesLive, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.profileActivationQaReady, true);

assert.equal(activation.activeRulesProfileId(), "realm-guard-legacy-mixed");
assert.equal(activation.isLegacyMixed(), true);
assert.equal(activation.isStrictRealmGuard(), false);
assert.equal(activation.strictActivationAvailable(), true);

const beforeStatus = activation.profileActivationStatus();
assert.equal(beforeStatus.activeProfileId, "realm-guard-legacy-mixed");
assert.equal(beforeStatus.qaSwitchAvailable, true);
assert.equal(beforeStatus.actorWritesOnSwitch, 0);
assert.equal(beforeStatus.itemWritesOnSwitch, 0);
assert.equal(beforeStatus.journalWritesOnSwitch, 0);
assert.equal(beforeStatus.worldSettingWritesOnSwitch, 2);
assert.equal(beforeStatus.reloadRecommended, true);

settingWrites.length = 0;
const strictSwitch = await activation.switchToStrictRealmGuard();
assert.equal(strictSwitch.changed, true);
assert.equal(strictSwitch.toProfileId, "realm-guard-strict");
assert.equal(activation.isStrictRealmGuard(), true);
assert.deepEqual(settingWrites.map(row=>row.key), ["activeRulesProfileId","activeRulesProfileVersion"]);
assert.equal(settingWrites.some(row=>/actor|item|journal/i.test(row.key)), false);
assert.equal(resolveRulesProfile().profile.id, "realm-guard-strict");
assert.equal(resolveRulesProfile().profile.version, 9);

settingWrites.length = 0;
const legacySwitch = await activation.switchToLegacyMixed();
assert.equal(legacySwitch.changed, true);
assert.equal(legacySwitch.toProfileId, "realm-guard-legacy-mixed");
assert.equal(activation.isLegacyMixed(), true);
assert.deepEqual(settingWrites.map(row=>row.key), ["activeRulesProfileId","activeRulesProfileVersion"]);

const activationSource = fs.readFileSync("module/m10-profile-activation.mjs","utf8");
for (const forbidden of ["Actor.create","createEmbeddedDocuments","deleteEmbeddedDocuments","JournalEntry.create",".delete("]) {
  assert.equal(activationSource.includes(forbidden), false, `Profile switch must not mutate campaign documents: ${forbidden}`);
}
assert.ok(activationSource.includes("restoreProfileSettings"), "Profile switch must include setting rollback.");
assert.ok(activationSource.includes("reloadRecommended:true"), "QA activation must recommend reload.");

const profileMenu = fs.readFileSync("module/profile-management-menu.mjs","utf8");
const profileTemplate = fs.readFileSync("templates/apps/profile-management.hbs","utf8");
assert.ok(profileMenu.includes("switchToStrictRealmGuard"));
assert.ok(profileMenu.includes("switchToLegacyMixed"));
assert.ok(profileMenu.includes("Switch this world to Strict Realm Guard?"));
assert.ok(profileTemplate.includes('data-action="switchStrict"'));
assert.ok(profileTemplate.includes('data-action="switchLegacy"'));
assert.ok(profileTemplate.includes("Reload the world after every profile switch"));

const m9 = fs.readFileSync("module/m9-creation-shadow.mjs","utf8");
assert.ok(m9.includes("REALM_GUARD_STRICT_CREATION_PROFILE"));
assert.ok(m9.includes("activeCreationEngine"));
assert.ok(m9.includes("STRICT_SOURCE_PROFILE"));
assert.ok(m9.includes("DISABLED_UNDER_STRICT"));
assert.ok(m9.includes('return qaCommitMode === "LEGACY" && !isStrictRealmGuard();'), "Strict must not inherit a stale Legacy QA commit override.");
assert.ok(m9.includes("isStrictRealmGuard() ? REALM_GUARD_STRICT_CREATION_PROFILE"));

const strictCreation = fs.readFileSync("module/profiles/realm-guard-strict-creation.mjs","utf8");
assert.ok(strictCreation.includes("strictProfileLive"));
assert.ok(strictCreation.includes("base.transaction.liveExecution = live"));
assert.ok(strictCreation.includes("base.transaction.provenanceWrite = live"));
assert.ok(strictCreation.includes("base.transaction.relationshipWrite = live"));

const adapter = fs.readFileSync("module/m9-creation-commit-adapter.mjs","utf8");
assert.ok(adapter.includes("CORE M9 profile mismatch"), "Live creation must reject cross-profile commit plans.");

const progression = fs.readFileSync("module/progression.mjs","utf8");
assert.ok(progression.includes("!isStrictRealmGuard()"), "Level/Talent progression must be gated out under Strict.");
assert.ok(progression.includes("strictProgressionSuppressed"));

const teamwork = fs.readFileSync("module/teamwork.mjs","utf8");
assert.ok(teamwork.includes("Teamwork - Wises"));
assert.ok(teamwork.includes("!isStrictRealmGuard() && synergy"));
assert.ok(teamwork.includes("rating: isStrictRealmGuard() ? Number(item.system?.rating"));

const conditions = fs.readFileSync("module/conditions.mjs","utf8");
assert.ok(conditions.includes("strictConditionRollEffects"));
assert.ok(conditions.includes("strictRecoveryMethods"));
assert.ok(conditions.includes('["fresh","afraid"]'));
assert.ok(conditions.includes('role("Harvester"') === false, "Harvester ownership belongs to Strict recovery policy, not duplicated Legacy constants.");

const documents = fs.readFileSync("module/documents.mjs","utf8");
assert.ok(documents.includes("ratedStrictWise"));
assert.ok(documents.includes("wiseDice"));
assert.ok(documents.includes("traitRerollFaces"));
assert.ok(documents.includes("consumeTraitPositiveUse(this, trait)"));

const traits = fs.readFileSync("module/traits.mjs","utf8");
assert.ok(traits.includes("isStrictRealmGuard() && level === 2"));
assert.ok(traits.includes("isStrictRealmGuard() && level === 3"));

const sheet = fs.readFileSync("sheets/actor-sheet.mjs","utf8");
const itemSheet = fs.readFileSync("sheets/item-sheet.mjs","utf8");
const character = fs.readFileSync("templates/actor/character.hbs","utf8");
const itemTemplate = fs.readFileSync("templates/item/item.hbs","utf8");
assert.ok(sheet.includes("static async _rollWise"));
assert.ok(sheet.includes("needs an explicit Strict rating"));
assert.ok(sheet.includes("Levels and Talents are disabled under Strict Realm Guard"));
assert.ok(character.includes('data-action="rollWise"'));
assert.ok(character.includes("rg-wise-roll-icon"));
assert.ok(character.includes("UNRATED"), "Preserved rating-0 Wises must be visibly marked rather than displayed as a valid 0 rating.");
assert.ok(itemTemplate.includes("Rated Wise"));
assert.ok(itemTemplate.includes('name="system.rating"'));
assert.ok(itemTemplate.includes('name="system.learning.passNeeded"'));
assert.ok(itemSheet.includes("isStrictProfile: isStrictRealmGuard()"));
assert.ok(itemSheet.includes('"system.learning.passNeeded", nextRating'));
assert.ok(itemSheet.includes('"system.learning.failNeeded", Math.max(0, nextRating - 1)'));
assert.ok(sheet.includes("Preserved unrated Wises are not listed here."));
assert.ok(sheet.includes("Number(w.system?.rating ?? 0) > 0"), "I Am Wise selector must exclude preserved unrated Wises.");
assert.ok(character.includes("PRESERVED · INACTIVE"));

const conflicts = fs.readFileSync("module/conflicts.mjs","utf8");
assert.ok(conflicts.includes("i.type === \"gear\"\n    && (isStrictRealmGuard() || String(i.system.inventory?.mode ?? \"\") === \"hand\")"));
assert.ok(conflicts.includes("const talentUse = isStrictRealmGuard() ? null"));
assert.ok(conflicts.includes("!isStrictRealmGuard() && Number(assist?.traitStatus?.level"));

const m5 = fs.readFileSync("module/m5-conflict-live-handoff.mjs","utf8");
assert.ok(m5.includes("STRICT_CORE_EVALUATION_APPLIED"));
assert.ok(m5.includes("STRICT_PROFILE_AUTHORITY"));
assert.ok(m5.includes("CORE_M5_STRICT"));

const endSession = fs.readFileSync("module/end-session.mjs","utf8");
assert.ok(endSession.includes("strictEndSessionValidation"));
assert.ok(endSession.includes("if (isStrictRealmGuard())"));
assert.ok(endSession.includes("!isStrictRealmGuard()) talentsReset"));

const rulesProfileService = fs.readFileSync("module/rules-profile-service.mjs","utf8");
assert.ok(rulesProfileService.includes("realmGuardRulesProfileChanged"));
assert.ok(rulesProfileService.includes('source:"SETTING_UPDATE"'));

const manual = fs.readFileSync("module/manual.mjs","utf8");
const strictReference = fs.readFileSync("module/m10-strict-rules-reference.mjs","utf8");
assert.ok(manual.includes("Strict Realm Guard is active for M10A.8 QA"));
assert.ok(manual.includes('"Open Strict Rules" : "Preview Strict Rules"'));
assert.ok(strictReference.includes("STRICT_ACTIVE_REFERENCE"));
assert.ok(strictReference.includes("ACTIVE RULES PROFILE"));

console.log("PASS M10A.8 Profile Activation foundation · reversible settings-only switch · Strict live routing gates · Legacy rollback retained");
