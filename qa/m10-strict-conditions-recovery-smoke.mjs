import assert from "node:assert/strict";
import fs from "node:fs";
import {
  STRICT_CONDITION_SET,
  STRICT_IGNORED_LEGACY_CONDITIONS,
  STRICT_RECOVERY_ORDER,
  getStrictConditionsRecoveryStatus,
  strictConditionDispositionEffects,
  strictConditionProvisionPlan,
  strictConditionRollEffects,
  strictHealthyState,
  strictHelperConsequenceResolution,
  strictInjuryWaiverPlan,
  strictLesserConditionOptions,
  strictPermanentReductionTargets,
  strictRecoveryBlocker,
  strictRecoveryEconomy,
  strictRecoveryHelpPolicy,
  strictRecoveryMethods,
  strictRecoveryState,
  strictZeroRatingPolicy
} from "../module/m10-strict-conditions-recovery.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.11\.0(?:-qa\.\d+)?$/, "M10A.3 smoke runs across v1.11.0.");

function item(id, type, name, system = {}) {
  return { id, type, name, system };
}

const actor = {
  id: "r1",
  name: "Ranger",
  type: "character",
  system: {
    attributes: {
      nature: { value: 4 },
      will: { value: 4 },
      health: { value: 5 },
      resources: { value: 3 },
      circles: { value: 2 }
    },
    resources: { checks: { value: 4 } }
  },
  items: { contents: [
    item("harv", "role", "Harvester", { rating: 3 }),
    item("cook", "role", "Cook", { rating: 2 }),
    item("path", "role", "Pathfinder", { rating: 4 }),
    item("fresh", "condition", "Fresh", { active: true }),
    item("afraid", "condition", "Afraid", { active: true }),
    item("inj", "condition", "Injured", { active: true }),
    item("str", "condition", "Strained", { active: true })
  ] }
};

assert.deepEqual(STRICT_CONDITION_SET, ["Healthy", "Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
assert.deepEqual(STRICT_RECOVERY_ORDER, ["Hungry & Thirsty", "Angry", "Tired", "Injured", "Strained"]);
assert.deepEqual(STRICT_IGNORED_LEGACY_CONDITIONS, ["Fresh", "Afraid"]);

const health = strictHealthyState(actor);
assert.equal(health.healthy, false);
assert.deepEqual(health.ignoredPreserved.sort(), ["Afraid", "Fresh"]);

const provision = strictConditionProvisionPlan(actor);
assert.equal(provision.mode, "READ_ONLY_PROVISION_PLAN");
assert.equal(provision.writesPlanned, 0);
assert.equal(provision.destructive, false);
assert.deepEqual(provision.preserveIgnored.map(row => row.name).sort(), ["Afraid", "Fresh"]);
assert.equal(provision.create.some(row => row.name === "Fresh"), false);
assert.equal(provision.create.some(row => row.name === "Afraid"), false);

const pathfinder = strictConditionRollEffects(actor, "Pathfinder", { isSkill: true });
assert.equal(pathfinder.diceModifier, -2);
assert.deepEqual(pathfinder.applied.map(row => row.name).sort(), ["Injured", "Strained"]);
assert.deepEqual(pathfinder.ignored.map(row => row.name).sort(), ["Afraid", "Fresh"]);

const willRecovery = strictConditionRollEffects(actor, "Will", { isSkill: false, recovery: true });
assert.equal(willRecovery.diceModifier, 0);
const resources = strictConditionRollEffects(actor, "Resources", { isSkill: false });
assert.equal(resources.diceModifier, 0);

const zero = strictZeroRatingPolicy({ baseRating: 1, conditionDice: -1 });
assert.equal(zero.zeroedByCondition, true);
assert.equal(zero.beginnerLuckAllowed, false);
assert.equal(zero.teamworkAllowed, false);
assert.equal(zero.selfHelpAllowed, false);
assert.equal(zero.personaAllowed, false);
assert.equal(zero.natureRequiredIfTested, true);

const hungry = strictRecoveryMethods(actor, "Hungry & Thirsty");
assert.equal(hungry.find(row => row.name === "Harvester")?.dice, 3);
assert.equal(hungry.find(row => row.name === "Cook")?.dice, 2);
assert.equal(hungry.find(row => row.name === "Resources")?.obstacle, 1);
assert.equal(hungry.some(row => row.kind === "narrative"), true);

const tired = strictRecoveryMethods(actor, "Tired");
assert.equal(tired.find(row => row.name === "Health")?.obstacle, 3);
assert.equal(tired.find(row => row.name === "Resources")?.obstacle, 2);
assert.equal(tired.some(row => row.purpose === "GOOD_NIGHTS_REST"), true);

assert.equal(strictRecoveryMethods(actor, "Angry")[0].obstacle, 2);
assert.equal(strictRecoveryMethods(actor, "Injured")[0].obstacle, 4);
assert.equal(strictRecoveryMethods(actor, "Strained")[0].obstacle, 4);

assert.equal(strictRecoveryHelpPolicy({ methodKind: "ability", methodName: "Will" }).helpAllowed, false);
assert.equal(strictRecoveryHelpPolicy({ methodKind: "ability", methodName: "Health" }).helpAllowed, false);
assert.equal(strictRecoveryHelpPolicy({ methodKind: "skill", methodName: "Harvester" }).helpAllowed, true);

const hungryActor = structuredClone(actor);
hungryActor.items.contents.push(item("hun", "condition", "Hungry & Thirsty", { active: true }));
assert.equal(strictRecoveryBlocker(hungryActor, "Angry")?.name, "Hungry & Thirsty");
assert.equal(strictRecoveryBlocker(hungryActor, "Strained")?.name, "Hungry & Thirsty");

const gmEconomy = strictRecoveryEconomy({ phase: "gm", turnManagerEnabled: true, checks: 4 });
assert.equal(gmEconomy.costChecks, 2);
assert.equal(gmEconomy.affordable, true);
assert.equal(strictRecoveryEconomy({ phase: "gm", turnManagerEnabled: true, checks: 1 }).affordable, false);

const injuredFail = strictRecoveryState("Injured", { passed: false });
assert.equal(injuredFail.state, "HEALER_REQUIRED");
assert.equal(injuredFail.healerObstacle, 3);
const healerFail = strictRecoveryState("Injured", { passed: false, route: "HEALER", priorState: "HEALER_REQUIRED" });
assert.equal(healerFail.state, "PERMANENT_REDUCTION_REQUIRED");
assert.equal(healerFail.activeAfter, false);
assert.deepEqual(healerFail.excludedTargets, ["Resources", "Circles"]);
const healerPass = strictRecoveryState("Injured", { passed: true, route: "HEALER", priorState: "HEALER_REQUIRED" });
assert.equal(healerPass.state, "RECOVERED");

assert.equal(strictInjuryWaiverPlan({ phase: "player" }).allowed, true);
assert.equal(strictInjuryWaiverPlan({ phase: "player" }).checkCost, 0);
assert.equal(strictInjuryWaiverPlan({ phase: "gm" }).allowed, false);

const reduction = strictPermanentReductionTargets(actor);
assert.equal(reduction.excluded.includes("Resources"), true);
assert.equal(reduction.excluded.includes("Circles"), true);
assert.equal(reduction.abilities.some(row => row.name === "Health"), true);
assert.equal(reduction.skills.some(row => row.name === "Pathfinder"), true);
assert.equal(reduction.autoSelect, false);

const strainedFail = strictRecoveryState("Strained", { passed: false });
assert.equal(strainedFail.state, "COUNSEL_REQUIRED");
const noChecksCounsel = strictRecoveryState("Strained", { passed: false, route: "COUNSEL", priorState: "COUNSEL_REQUIRED", phase: "gm", turnManagerEnabled: true, checks: 1 });
assert.equal(noChecksCounsel.state, "COUNSEL_REQUIRED");
assert.equal(noChecksCounsel.nextAction, "NEED_2_CHECKS_IN_GM_TURN");
const counsel = strictRecoveryState("Strained", { passed: false, route: "COUNSEL", priorState: "COUNSEL_REQUIRED", phase: "gm", turnManagerEnabled: true, checks: 2 });
assert.equal(counsel.state, "RECOVERED");
assert.equal(counsel.economy.costChecks, 2);

assert.deepEqual(strictLesserConditionOptions("Angry").options, ["Hungry & Thirsty"]);
assert.deepEqual(strictLesserConditionOptions("Injured").options, ["Hungry & Thirsty", "Angry", "Tired"]);
assert.deepEqual(strictLesserConditionOptions("Strained").options, ["Hungry & Thirsty", "Angry", "Tired", "Injured"]);
assert.equal(strictLesserConditionOptions("Injured").freshAllowed, false);
assert.equal(strictLesserConditionOptions("Injured").afraidAllowed, false);

const helper = strictHelperConsequenceResolution({
  active: true,
  helperActorId: "h1",
  helperActorName: "Helper"
}, { mainConditionName: "Injured" });
assert.equal(helper.active, true);
assert.equal(helper.gmChoiceRequired, true);
assert.equal(helper.autoApply, false);
assert.deepEqual(helper.options, ["Hungry & Thirsty", "Angry", "Tired"]);

const disposition = strictConditionDispositionEffects({
  ...actor,
  items: { contents: [
    item("hun", "condition", "Hungry & Thirsty", { active: true }),
    item("ang", "condition", "Angry", { active: true }),
    item("tir", "condition", "Tired", { active: true })
  ] }
}, { baseAbility: "Will" });
assert.equal(disposition.dispositionModifier, -3);

const status = getStrictConditionsRecoveryStatus();
assert.equal(status.phase, "M10A.3");
assert.equal(status.liveAuthority, false);
assert.equal(status.conditions.healthy, "DERIVED");
assert.equal(status.recovery.hungryIncludesHarvester, true);
assert.equal(status.recovery.injuredHealerFlow, true);
assert.equal(status.recovery.strainedCounselFlow, true);
assert.equal(status.writesActors, false);
assert.equal(status.writesItems, false);

const strictSource = fs.readFileSync("module/m10-strict-conditions-recovery.mjs", "utf8");
for (const forbidden of [
  ".update(",
  ".createEmbeddedDocuments(",
  ".deleteEmbeddedDocuments(",
  "game.settings.set"
]) assert.equal(strictSource.includes(forbidden), false, `Strict M10A.3 foundation must stay non-live: ${forbidden}`);

const legacyConditions = fs.readFileSync("module/conditions.mjs", "utf8");
assert.ok(legacyConditions.includes('{ name: "Fresh"'), "Legacy Mixed Fresh definition must remain untouched.");
assert.ok(legacyConditions.includes('{ name: "Afraid"'), "Legacy Mixed Afraid definition must remain untouched.");
assert.ok(legacyConditions.includes('methods = [role("Cook", 1), role("Brewer", 1), role("Baker", 1), ability("Resources", 1)]'), "Legacy Mixed recovery method list must remain untouched in qa.4.");

const profileService = fs.readFileSync("module/rules-profile-service.mjs", "utf8");
assert.equal(profileService.includes("setActiveRulesProfile"), false, "No live profile switch API may exist in M10A.3.");

console.log("PASS M10A.3 Conditions / Recovery foundation · Strict policy complete · Legacy Mixed untouched · no live activation");
