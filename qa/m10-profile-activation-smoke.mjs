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
  system:{version:"1.11.0"},
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
const { buildProfileCapabilities } = await import("../module/profile-capabilities.mjs");
const { buildM10BFamilyRulePolicy } = await import("../module/m10b-family-rules.mjs");

assert.equal(REALM_GUARD_STRICT_PROFILE.version, 10);
assert.match(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase, /^M10(?:A|B)\.\d+$/, "Strict activation smoke must survive later M10 profile-routing phases.");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.activationState, "SUPPORTED");
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.selectable, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.supported, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.previewOnly, false);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.liveRuleAuthority, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.strictRulesLive, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.profileActivationQaReady, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.stableActivationReady, true);

assert.equal(activation.activeRulesProfileId(), "realm-guard-legacy-mixed");
assert.equal(activation.isLegacyMixed(), true);
assert.equal(activation.isStrictRealmGuard(), false);
assert.equal(activation.strictActivationAvailable(), true);

const beforeStatus = activation.profileActivationStatus();
assert.equal(beforeStatus.activeProfileId, "realm-guard-legacy-mixed");
assert.equal(beforeStatus.switchAvailable, true);
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
assert.equal(resolveRulesProfile().profile.version, 10);

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
assert.equal(activationSource.includes("qaRuntime"), false, "Supported Strict activation must not depend on a -qa. runtime.");
assert.equal(activationSource.includes("activation is QA-only"), false, "Supported Strict activation must remain available in stable runtime.");
assert.ok(activationSource.includes("reloadRecommended:true"), "QA activation must recommend reload.");

const profileMenu = fs.readFileSync("module/profile-management-menu.mjs","utf8");
const profileTemplate = fs.readFileSync("templates/apps/profile-management.hbs","utf8");
assert.ok(profileMenu.includes("switchToStrictRealmGuard"));
assert.ok(profileMenu.includes("switchToLegacyMixed"));
assert.ok(profileMenu.includes("switchToStrictRealmGuard"));
assert.ok(profileTemplate.includes('data-rg-contract="profile-switch-strict"'));
assert.ok(profileTemplate.includes('data-rg-contract="profile-switch-legacy"'));
assert.ok(profileTemplate.includes('data-rg-contract="profile-switch-reload-guidance"'));

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
const strictFamily = buildM10BFamilyRulePolicy(buildProfileCapabilities(resolveRulesProfile("realm-guard-strict").profile));
const legacyFamily = buildM10BFamilyRulePolicy(buildProfileCapabilities(resolveRulesProfile("realm-guard-legacy-mixed").profile));
assert.equal(strictFamily.ratedWises, true);
assert.equal(strictFamily.helperSourcePolicy, "MG1E_TYPED");
assert.equal(strictFamily.synergyEnabled, false);
assert.equal(legacyFamily.ratedWises, false);
assert.equal(legacyFamily.helperSourcePolicy, "LEGACY_OPEN");
assert.equal(legacyFamily.synergyEnabled, true);
assert.ok(teamwork.includes("getActiveM10BFamilyRulePolicy"), "Teamwork must route through the generic profile policy.");

const conditions = fs.readFileSync("module/conditions.mjs","utf8");
assert.ok(conditions.includes("getActiveM10BConditionRecoveryPolicy"), "Conditions must route through the generic profile policy.");
assert.ok(conditions.includes("familyConditionRollEffects"));
assert.ok(conditions.includes("familyRecoveryMethods"));
assert.equal(conditions.includes("isStrictRealmGuard"), false, "M10B.4 retires binary Strict identity checks from Conditions/Recovery.");
assert.equal(conditions.includes("migrateSickToStrained"), false, "Profile routing must not destructively rename Sick to Strained.");
assert.ok(conditions.includes("RG_LEGACY_DEFAULT_CONDITION_NAMES"), "Legacy Mixed condition defaults must stay explicit.");
assert.ok(conditions.includes('role("Harvester"') === false, "Harvester ownership belongs to profile recovery policy, not duplicated Legacy constants.");

const documents = fs.readFileSync("module/documents.mjs","utf8");
assert.ok(documents.includes("getActiveM10BFamilyRulePolicy"), "Wises/Traits roll logic must route through generic profile policy.");
assert.ok(documents.includes("wiseDice"));
assert.ok(documents.includes("traitPoolDice"), "Strict roll presentation must keep Trait dice separate from I Am Wise dice.");
assert.ok(documents.includes('["I Am Wise", signedDice(assist.wiseDice)]') || documents.includes('["I Am Wise",signedDice(assist.wiseDice)]'), "Strict roll breakdown must label own Wise bonus as I Am Wise.");
assert.ok(documents.includes("traitRerollFaces"));
assert.ok(documents.includes("consumeTraitPositiveUse(this, trait)"));

const traits = fs.readFileSync("module/traits.mjs","utf8");
assert.ok(traits.includes("getActiveM10BFamilyRulePolicy"), "Trait semantics must route through generic profile policy.");
assert.equal(strictFamily.mg1eTraits, true);
assert.equal(legacyFamily.mg1eTraits, false);

const sheet = fs.readFileSync("sheets/actor-sheet.mjs","utf8");
const itemSheet = fs.readFileSync("sheets/item-sheet.mjs","utf8");
const character = fs.readFileSync("templates/actor/character.hbs","utf8");
const itemTemplate = fs.readFileSync("templates/item/item.hbs","utf8");
assert.ok(sheet.includes("static async _rollWise"));
assert.ok(sheet.includes("needs an explicit rating before it can be tested under this profile."));
assert.ok(sheet.includes("Levels and Talents are disabled under Strict Realm Guard"));
assert.ok(character.includes('data-action="rollWise"'));
assert.ok(character.includes("rg-wise-roll-icon"));
assert.ok(character.includes("UNRATED"), "Preserved rating-0 Wises must be visibly marked rather than displayed as a valid 0 rating.");
assert.ok(itemTemplate.includes("Rated Wise"));
assert.ok(itemTemplate.includes('name="system.rating"'));
assert.ok(itemTemplate.includes('name="system.learning.passNeeded"'));
assert.ok(itemSheet.includes("isStrictProfile: isStrictRealmGuard()"));
assert.ok(itemSheet.includes("this._processFormData(event, form, formData)"), "Item submit must normalize FormDataExtended before Strict Wise nested updates.");
assert.ok(itemSheet.includes("wiseRerender = nextRating !== previousRating"));
assert.ok(itemSheet.includes("if (wiseRerender || gearRerender || tokenRerender || talentRerender)"));
assert.ok(itemSheet.includes('"system.learning.passNeeded", nextRating'));
assert.ok(itemSheet.includes('"system.learning.failNeeded", Math.max(0, nextRating - 1)'));
assert.ok(sheet.includes("Preserved unrated Wises are not listed here."));
assert.ok(sheet.includes("Number(w.system?.rating ?? 0) > 0"), "I Am Wise selector must exclude preserved unrated Wises.");
assert.ok(character.includes("PRESERVED · INACTIVE"));
assert.ok(character.includes('{{#unless isStrictProfile}}<div class="rg-resource rg-level-resource"><span>LEVEL</span><strong>{{progression.level}}</strong></div>{{/unless}}'), "Strict sheet header must hide Level while Legacy Mixed keeps the existing header.");

const conflicts = fs.readFileSync("module/conflicts.mjs","utf8");
assert.equal(conflicts.includes("isStrictRealmGuard"), false, "M10B.5 retires Strict identity routing from live Conflict UI.");
assert.ok(conflicts.includes("activeConflictPolicy().inventory.placementAuthority"), "Conflict weapon availability must use profile inventory authority.");
assert.ok(conflicts.includes("activeConflictPolicy().presentation.showTalents"), "Conflict Talent visibility must use profile presentation capabilities.");
assert.ok(conflicts.includes("familyConflictActionSkills"), "Conflict action skills must route through profile capabilities.");
assert.ok(conflicts.includes("familyConflictDispositionPlan"), "Conflict disposition must route through profile capabilities.");
assert.ok(conflicts.includes("function conflictUnarmedLabel()"));
assert.ok(conflicts.includes("profileUnarmedDice()"), "Unarmed/no-tool must use the profile policy.");

const m5 = fs.readFileSync("module/m5-conflict-live-handoff.mjs","utf8");
assert.equal(m5.includes("isStrictRealmGuard"), false, "M10B.5 retires Strict identity routing from M5 conflict handoff.");
assert.ok(m5.includes("PROFILE_CORE_EVALUATION_APPLIED"));
assert.ok(m5.includes("PROFILE_AUTHORITY"));
assert.ok(m5.includes("CORE_M5_PROFILE"));

const endSession = fs.readFileSync("module/end-session.mjs","utf8");
assert.ok(endSession.includes("strictEndSessionValidation"));
assert.ok(endSession.includes("if (isStrictRealmGuard())"));
assert.ok(endSession.includes("!isStrictRealmGuard()) talentsReset"));

const rulesProfileService = fs.readFileSync("module/rules-profile-service.mjs","utf8");
assert.ok(rulesProfileService.includes("realmGuardRulesProfileChanged"));
assert.ok(rulesProfileService.includes('source:"SETTING_UPDATE"'));

const manual = fs.readFileSync("module/manual.mjs","utf8");
const strictReference = fs.readFileSync("module/m10-strict-rules-reference.mjs","utf8");
assert.ok(manual.includes("Strict Realm Guard is active. Use the Strict Rules Reference"));
assert.ok(manual.includes('"Open Strict Rules" : "Preview Strict Rules"'));
assert.ok(strictReference.includes("STRICT_ACTIVE_REFERENCE"));
assert.ok(strictReference.includes("ACTIVE RULES PROFILE"));

console.log("PASS M10A.9 Stable Activation Candidate · stable-runtime selectable · reversible settings-only switch · Legacy rollback retained");
