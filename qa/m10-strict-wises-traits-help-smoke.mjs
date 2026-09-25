import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildStrictHelperConsequenceContract,
  classifyStrictHelp,
  getStrictWisesTraitsHelpStatus,
  planStrictWiseLearning,
  planStrictWiseTest,
  strictHelperEligibility,
  strictTraitAgainstPlan,
  strictTraitBenefitPlan,
  strictTraitCheckEconomy,
  strictWiseView
} from "../module/m10-strict-wises-traits-help.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
assert.match(manifest.version, /^1\.\d+\.\d+(?:\.\d+)*(?:-(?:alpha|beta|rc|qa)\.\d+)?$/, "M10A.2 smoke runs across v1.11.0.");

const unratedWise = { id: "w0", name: "Road-wise", system: { rating: 0, learning: { passed: 0, failed: 0, passNeeded: 1, failNeeded: 0 } } };
const ratedWise = { id: "w3", name: "Road-wise", system: { rating: 3, learning: { passed: 3, failed: 1, passNeeded: 3, failNeeded: 2 } } };

assert.equal(strictWiseView(unratedWise).conversionState, "UNASSIGNED_PRESERVED");
assert.equal(planStrictWiseTest(unratedWise).ok, false);
assert.equal(planStrictWiseTest(unratedWise).reasonCode, "wise-unassigned");

const wiseView = strictWiseView(ratedWise);
assert.equal(wiseView.rating, 3);
assert.equal(wiseView.passNeeded, 3);
assert.equal(wiseView.failNeeded, 2);
assert.equal(planStrictWiseTest(ratedWise, { helpDice: 1, personaDice: 1 }).dice, 5);
const learning = planStrictWiseLearning(ratedWise, false);
assert.equal(learning.next.failed, 2);
assert.equal(learning.advance?.rating, 4);
assert.equal(learning.advance?.passNeeded, 4);
assert.equal(learning.advance?.failNeeded, 3);

assert.deepEqual(strictTraitBenefitPlan({ system: { rating: 1 } }, { sessionUses: 0 }), {
  level: 1, available: true, effect: "PLUS_1D", dice: 1, rerollFailedDice: false, oncePerSession: true, consumeSessionUse: true
});
assert.equal(strictTraitBenefitPlan({ system: { rating: 1 } }, { sessionUses: 1 }).available, false);
const l2 = strictTraitBenefitPlan({ system: { rating: 2 } }, { sessionUses: 99 });
assert.equal(l2.available, true);
assert.equal(l2.dice, 1);
assert.equal(l2.consumeSessionUse, false);
const l3 = strictTraitBenefitPlan({ system: { rating: 3 } }, { sessionUses: 0 });
assert.equal(l3.rerollFailedDice, true);
assert.equal(l3.dice, 0);
assert.equal(strictTraitBenefitPlan({ system: { rating: 3 } }, { sessionUses: 1 }).available, false);

assert.deepEqual(strictTraitAgainstPlan("impede"), { ok: true, mode: "impede", selfDice: -1, opponentDice: 0, checks: 1, tieToOpponent: false });
assert.equal(strictTraitAgainstPlan("hurt", { versus: true }).checks, 2);
const breakTie = strictTraitAgainstPlan("breakTie", { versus: true });
assert.equal(breakTie.tieToOpponent, true);
assert.equal(breakTie.checks, 2);

const chargeL1 = strictTraitCheckEconomy({ level: 1, sessionUses: 0, checks: 3 });
assert.equal(chargeL1.charge.eligible, true);
assert.equal(chargeL1.charge.cost, 3);
assert.equal(chargeL1.charge.temporaryTargetLevel, 2);
assert.equal(strictTraitCheckEconomy({ level: 1, sessionUses: 1 }).charge.eligible, false);
assert.equal(strictTraitCheckEconomy({ level: 1, sessionUses: 1 }).recharge.level1.cost, 2);
assert.equal(strictTraitCheckEconomy({ level: 3, sessionUses: 1 }).recharge.level3.cost, 4);

const ownWise = classifyStrictHelp({ sourceKind: "Wise", isSelf: true });
assert.equal(ownWise.mode, "I_AM_WISE");
assert.equal(ownWise.dice, 1);
assert.equal(ownWise.synergyAllowed, false);
const otherWise = classifyStrictHelp({ sourceKind: "Wise", isSelf: false });
assert.equal(otherWise.mode, "TEAMWORK_WISE");
assert.equal(strictHelperEligibility({ sourceKind: "Wise", isSelf: false }).afraidBlocksHelp, false);
assert.equal(strictHelperEligibility({ sourceKind: "Skill", isSelf: false }).helperSharesConsequences, true);

const consequence = buildStrictHelperConsequenceContract({
  helperActorId: "h1",
  helperActorName: "Helper",
  sourceKind: "Wise",
  sourceName: "Road-wise",
  failed: true
});
assert.equal(consequence.active, true);
assert.equal(consequence.consequence, "LESSER_CONDITION_CHOSEN_BY_GM");
assert.equal(consequence.applicationAuthority, "M10A.3_CONDITIONS_RECOVERY");
assert.equal(consequence.autoApply, false);

const status = getStrictWisesTraitsHelpStatus();
assert.equal(status.phase, "M10A.2_COMPAT_WRAPPER");
assert.equal(status.delegatedRulesAuthority, "M10B.3_MG1E_FAMILY");
assert.equal(status.liveAuthority, false);
assert.equal(status.wiseAutoConversion, false);
assert.equal(status.help.synergy, false);
assert.equal(status.help.afraidBlocksHelp, false);

const models = fs.readFileSync("module/data-models.mjs", "utf8");
assert.ok(models.includes("rating: int(0, 0, 12)"));
assert.ok(models.includes("learning: new fields.SchemaField"));
assert.ok(models.includes("description: str()"));

const legacyTraits = fs.readFileSync("module/traits.mjs", "utf8");
assert.ok(legacyTraits.includes("getActiveM10BFamilyRulePolicy"), "Trait behavior must remain profile-routed.");
assert.ok(legacyTraits.includes("+1s on relevant passed/tied tests"), "Legacy Mixed L3 +1s behavior must remain untouched in qa.3.");

const legacyTeamwork = fs.readFileSync("module/teamwork.mjs", "utf8");
assert.ok(legacyTeamwork.includes("Use Synergy - spend 1 Fate"), "Legacy Mixed Synergy must remain available.");
assert.ok(legacyTeamwork.includes("afraidBlocksHelp"), "Legacy Mixed Afraid help compatibility must remain expressed by the profile policy.");

const menu = fs.readFileSync("module/profile-management-menu.mjs", "utf8");
assert.match(menu, /game\.settings\.registerMenu\(\s*"realm-guard"\s*,\s*"rulesProfileManagement"/);
assert.ok(menu.includes("templates/apps/profile-management.hbs"));
assert.ok(menu.includes("switchToStrictRealmGuard"));
assert.ok(menu.includes("switchToLegacyMixed"));
const menuTemplate = fs.readFileSync("templates/apps/profile-management.hbs", "utf8");
assert.ok(menuTemplate.includes('data-rg-contract="profile-preview-strict"'));
assert.ok(menuTemplate.includes('data-rg-contract="profile-switch-strict"'));
assert.ok(menuTemplate.includes('data-rg-contract="profile-switch-legacy"'));
assert.equal(menu.includes('game.settings.set("realm-guard", "activeRulesProfileId"'), false);
assert.equal(menu.includes('game.settings.set("realm-guard", "activeRulesProfileVersion"'), false);

const profileService = fs.readFileSync("module/rules-profile-service.mjs", "utf8");
assert.equal(profileService.includes("setActiveRulesProfile"), false, "No live profile switch API may exist in M10A.2.");

console.log("PASS M10A.2 Wises / Traits / Help + Profile Management regression · Legacy routing preserved · QA activation controls present");
