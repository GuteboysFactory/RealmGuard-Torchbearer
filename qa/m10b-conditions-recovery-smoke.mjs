import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildProfileCapabilities } from "../module/profile-capabilities.mjs";
import {
  buildM10BConditionRecoveryPolicy,
  familyConditionRollEffects,
  familyRecoveryMethods,
  familyRecoveryBlocker,
  familyRecoveryHelpPolicy,
  familyRecoveryState,
  familyZeroRatingPolicy
} from "../module/m10b-conditions-recovery.mjs";
import {
  strictConditionRollEffects,
  strictRecoveryMethods,
  strictRecoveryState
} from "../module/m10-strict-conditions-recovery.mjs";

const resolver = new ProfileResolver([MG1E_FOUNDATION_PROFILE, REALM_GUARD_LEGACY_MIXED_PROFILE, REALM_GUARD_STRICT_PROFILE]);
const legacy = buildM10BConditionRecoveryPolicy(buildProfileCapabilities(resolver.resolve("realm-guard-legacy-mixed")));
const strict = buildM10BConditionRecoveryPolicy(buildProfileCapabilities(resolver.resolve("realm-guard-strict")));
const mg1e = buildM10BConditionRecoveryPolicy(buildProfileCapabilities(resolver.resolve("mg1e")));

assert.equal(legacy.phase, "M10B.4");
assert.equal(legacy.familySemantics, false);
assert.equal(strict.familySemantics, true);
assert.equal(mg1e.familySemantics, true);
assert.deepEqual(strict.conditionSet, ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
assert.deepEqual(mg1e.conditionSet, ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"]);
assert.deepEqual(strict.recoveryOrder, ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
assert.deepEqual(mg1e.recoveryOrder, ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Sick"]);
assert.equal(strict.gmTurnCheckCost, 2);
assert.equal(mg1e.gmTurnCheckCost, 2);

function item(id, type, name, system = {}) { return { id, type, name, system }; }
const actor = {
  id: "a1", type: "character",
  system: { attributes: { nature:{value:3}, will:{value:4}, health:{value:5}, resources:{value:3}, circles:{value:2} } },
  items: { contents: [
    item("harv","role","Harvester",{rating:3}),
    item("cook","role","Cook",{rating:2}),
    item("inj","condition","Injured",{active:true}),
    item("sick","condition","Sick",{active:true}),
    item("strained","condition","Strained",{active:true}),
    item("fresh","condition","Fresh",{active:true}),
    item("afraid","condition","Afraid",{active:true})
  ] }
};

const strictEffects = familyConditionRollEffects(actor, "Pathfinder", { isSkill:true }, strict);
assert.equal(strictEffects.diceModifier, -2);
assert.deepEqual(strictEffects.applied.map(row=>row.name).sort(), ["Injured","Strained"]);
assert.equal(strictEffects.ignored.some(row=>row.name==="Sick"), true);

const mgEffects = familyConditionRollEffects(actor, "Pathfinder", { isSkill:true }, mg1e);
assert.equal(mgEffects.diceModifier, -2);
assert.deepEqual(mgEffects.applied.map(row=>row.name).sort(), ["Injured","Sick"]);
assert.equal(mgEffects.ignored.some(row=>row.name==="Strained"), true);

assert.deepEqual(strictConditionRollEffects(actor, "Pathfinder", { isSkill:true }), familyConditionRollEffects(actor, "Pathfinder", { isSkill:true }, strict));
assert.deepEqual(strictRecoveryMethods(actor, "Injured"), familyRecoveryMethods(actor, "Injured", strict));
assert.deepEqual(strictRecoveryState("Strained", { passed:false }), familyRecoveryState("Strained", { passed:false }, strict));

const hungry = familyRecoveryMethods(actor, "Hungry & Thirsty", mg1e);
assert.equal(hungry.find(row=>row.name==="Harvester")?.dice, 3);
assert.equal(hungry.find(row=>row.name==="Resources")?.obstacle, 1);
assert.equal(hungry.some(row=>row.kind==="narrative"), true);
assert.equal(familyRecoveryMethods(actor, "Angry", mg1e)[0].obstacle, 2);
assert.equal(familyRecoveryMethods(actor, "Tired", mg1e)[0].obstacle, 3);
assert.equal(familyRecoveryMethods(actor, "Injured", mg1e)[0].obstacle, 4);
assert.equal(familyRecoveryMethods(actor, "Sick", mg1e)[0].obstacle, 4);

const hungryActor = structuredClone(actor);
hungryActor.items.contents.push(item("hun","condition","Hungry & Thirsty",{active:true}));
assert.equal(familyRecoveryBlocker(hungryActor, "Sick", mg1e)?.name, "Hungry & Thirsty");

assert.equal(familyRecoveryHelpPolicy({methodKind:"ability",methodName:"Will"}).helpAllowed, false);
assert.equal(familyRecoveryHelpPolicy({methodKind:"ability",methodName:"Health"}).helpAllowed, false);
assert.equal(familyRecoveryHelpPolicy({methodKind:"skill",methodName:"Harvester"}).helpAllowed, true);

const sickFail = familyRecoveryState("Sick", { passed:false }, mg1e);
assert.equal(sickFail.state, "HEALER_REQUIRED");
assert.equal(sickFail.healerObstacle, 3);
const healerFail = familyRecoveryState("Sick", { passed:false, route:"HEALER", priorState:"HEALER_REQUIRED" }, mg1e);
assert.equal(healerFail.state, "PERMANENT_REDUCTION_REQUIRED");
assert.deepEqual(healerFail.excludedTargets, ["Resources","Circles"]);

const zero = familyZeroRatingPolicy({ baseRating:1, conditionDice:-1 });
assert.equal(zero.zeroedByCondition, true);
assert.equal(zero.teamworkAllowed, false);
assert.equal(zero.selfHelpAllowed, false);
assert.equal(zero.personaAllowed, false);
assert.equal(zero.beginnerLuckAllowed, false);

const conditionsSource=fs.readFileSync("module/conditions.mjs","utf8");
assert.equal(conditionsSource.includes("isStrictRealmGuard"), false);
assert.equal(conditionsSource.includes("migrateSickToStrained"), false);
assert.ok(conditionsSource.includes('{ name: "Sick"'));
assert.ok(conditionsSource.includes("RG_LEGACY_DEFAULT_CONDITION_NAMES"));
assert.ok(conditionsSource.includes('methods = [role("Cook", 1), role("Brewer", 1), role("Baker", 1), ability("Resources", 1)]'));

const sheetSource=fs.readFileSync("sheets/actor-sheet.mjs","utf8");
assert.ok(sheetSource.includes("familyRecoveryState"));
assert.ok(sheetSource.includes("allowHelp: method.helpAllowed !== false"));
assert.equal(sheetSource.includes('import { strictRecoveryState }'), false);

const activationSource=fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activationSource.includes('"mg1e"'), false);

console.log("PASS M10B.4 Conditions / Recovery · generic routing · MG1E Sick · Strict wrapper parity · dormant-data preservation");
