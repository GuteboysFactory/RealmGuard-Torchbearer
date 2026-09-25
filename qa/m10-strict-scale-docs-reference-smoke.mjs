import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getStrictScaleStatus,
  strictFighterHunterOutcomePlan,
  strictLoreMasterScalePlan,
  strictMilitaristWarPlan,
  strictScaleEntry,
  strictScaleRankFor,
  strictTokenScaleGuidance
} from "../module/m10-strict-scale-of-might.mjs";
import {
  strictRulesReferenceHtml,
  strictRulesReferenceSnapshot
} from "../module/m10-strict-rules-reference.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version, /^1\.\d+\.\d+(?:\.\d+)*(?:-(?:alpha|beta|rc|qa)\.\d+)?$/);

const status = getStrictScaleStatus();
assert.equal(status.phase, "M10A.7");
assert.equal(status.source, "Realm Guard v1.6");
assert.equal(status.mode, "MANUAL_GUIDED");
assert.equal(status.liveAuthority, false);
assert.equal(status.liveApplication, false);
assert.equal(status.scaleMin, 1);
assert.equal(status.scaleMax, 6);
assert.equal(status.dunadanRank, 3);
assert.equal(status.writesActors, false);
assert.equal(status.writesItems, false);
assert.equal(status.writesWorldSettings, false);
assert.equal(status.nextStep, "M10A.9 Stable Activation Candidate · CLOSURE QA");

assert.equal(strictScaleRankFor("Hobbit"), 1);
assert.equal(strictScaleRankFor("Goblin"), 1);
assert.equal(strictScaleRankFor("Man"), 2);
assert.equal(strictScaleRankFor("Dwarf"), 2);
assert.equal(strictScaleRankFor("Dúnadan"), 3);
assert.equal(strictScaleRankFor("Dunadan"), 3);
assert.equal(strictScaleRankFor("Uruk-hai"), 3);
assert.equal(strictScaleRankFor("Cave-Troll"), 4);
assert.equal(strictScaleRankFor("Ent"), 5);
assert.equal(strictScaleRankFor("Dragon"), 6);
assert.equal(strictScaleRankFor("Kraken"), 6);
assert.equal(strictScaleRankFor("Unknown"), null);

const dragon = strictScaleEntry("Dragon");
assert.equal(dragon.ok, true);
assert.equal(dragon.rank, 6);
assert.equal(dragon.manualIfUnknown, false);
const unknown = strictScaleEntry("Unknown");
assert.equal(unknown.ok, false);
assert.equal(unknown.manualIfUnknown, true);

const caveTroll = strictFighterHunterOutcomePlan({actorType:"Dúnadan",targetType:"Cave-Troll"});
assert.equal(caveTroll.actorRank, 3);
assert.equal(caveTroll.targetRank, 4);
assert.equal(caveTroll.rankDifference, 1);
assert.equal(caveTroll.killAllowed, true);
assert.equal(caveTroll.captureAllowed, true);
assert.equal(caveTroll.injureAllowed, true);
assert.equal(caveTroll.runOffAllowed, true);

const ent = strictFighterHunterOutcomePlan({actorType:"Dúnadan",targetType:"Ent"});
assert.equal(ent.rankDifference, 2);
assert.equal(ent.killAllowed, false);
assert.equal(ent.captureAllowed, true);
assert.equal(ent.injureAllowed, true);
assert.equal(ent.runOffAllowed, true);

const dragonOutcome = strictFighterHunterOutcomePlan({actorType:"Dúnadan",targetType:"Dragon"});
assert.equal(dragonOutcome.rankDifference, 3);
assert.equal(dragonOutcome.killAllowed, false);
assert.equal(dragonOutcome.captureAllowed, false);
assert.equal(dragonOutcome.injureAllowed, false);
assert.equal(dragonOutcome.runOffAllowed, true);
assert.equal(dragonOutcome.liveApplication, false);

const army = strictMilitaristWarPlan({armyRank:2,targetRank:5,forceSize:75});
assert.equal(army.rankDifference, 3);
assert.equal(army.minimumForce, 100);
assert.equal(army.eligible, false);
assert.equal(army.reasonCode, "INSUFFICIENT_FORCE");
const armyEnough = strictMilitaristWarPlan({armyRank:2,targetRank:5,forceSize:100});
assert.equal(armyEnough.minimumForce, 100);
assert.equal(armyEnough.eligible, true);
assert.equal(armyEnough.majorityCreatureTypeDeterminesArmyRank, true);

assert.equal(strictMilitaristWarPlan({armyRank:2,targetRank:4,forceSize:10}).minimumForce, 10);
assert.equal(strictMilitaristWarPlan({armyRank:1,targetRank:5,forceSize:1000}).minimumForce, 1000);
assert.equal(strictMilitaristWarPlan({armyRank:1,targetRank:6,forceSize:10000}).minimumForce, 10000);

const lore = strictLoreMasterScalePlan({baseRank:3,successMargin:2});
assert.equal(lore.baseRank, 3);
assert.equal(lore.successMargin, 2);
assert.equal(lore.ranksGained, 2);
assert.equal(lore.effectiveRank, 5);
assert.equal(lore.opposedBy, "CREATURE_NATURE");
assert.equal(lore.liveApplication, false);

const tokenNo = strictTokenScaleGuidance({tokenLevel:3,applicable:false});
assert.equal(tokenNo.mode, "MANUAL_GUIDED");
assert.equal(tokenNo.exactNumericAutomation, false);
assert.equal(tokenNo.level3PublishedExample?.effectiveRank, 5);
assert.equal(tokenNo.applicable, false);
const tokenYes = strictTokenScaleGuidance({tokenLevel:3,applicable:true});
assert.equal(tokenYes.level3PublishedExample.sameRankAs, "Ent");
assert.equal(tokenYes.level3PublishedExample.conflictOnly, true);
assert.equal(tokenYes.liveApplication, false);

const ref = strictRulesReferenceSnapshot();
assert.ok(["M10A.7","M10A.8","M10A.9"].includes(ref.phase));
assert.equal(ref.mode, "STRICT_READ_ONLY_REFERENCE");
assert.equal(ref.profileId, "realm-guard-strict");
assert.ok(ref.profileVersion >= 8);
assert.ok(["PREVIEW_ONLY","QA_ACTIVE","SUPPORTED"].includes(ref.activationState));
assert.deepEqual(ref.sourceLineage, ["Mouse Guard RPG 2008 / 1E","Realm Guard v1.6 overrides"]);
assert.equal(ref.liveAuthority, false);
assert.equal(ref.writesJournal, false);
assert.equal(ref.writesActors, false);
assert.equal(ref.writesItems, false);
assert.equal(ref.writesWorldSettings, false);

const scalePage = ref.pages.find(page => page.id === "scale");
assert.ok(scalePage);
assert.equal(scalePage.rules.some(rule => rule.id === "SCALE_OF_MIGHT.MODE"), true);
const wisePage = ref.pages.find(page => page.id === "wises-traits-help");
assert.ok(wisePage.rules.some(rule => rule.id === "WISE.MODE" && /RATED/.test(rule.activeValue)));
assert.ok(wisePage.rules.some(rule => rule.id === "TRAIT.MODE" && /MG1E/.test(rule.activeValue)));
const progressionPage = ref.pages.find(page => page.id === "tests");
assert.ok(progressionPage.rules.some(rule => rule.id === "PROGRESSION.LEVELS_TALENTS" && /DISABLED/.test(rule.activeValue)));

const html = strictRulesReferenceHtml();
assert.match(html, /Strict Realm Guard · Rules Reference/);
assert.match(html, /Mouse Guard RPG 2008 \/ 1E.*Realm Guard v1\.6 overrides/);
assert.match(html, /(READ ONLY PREVIEW|ACTIVE RULES PROFILE)/);
assert.match(html, /(does not switch the world|active QA rules profile)/i);
assert.match(html, /Scale of Might/);

assert.ok(REALM_GUARD_STRICT_PROFILE.version >= 8);
assert.ok(["M10A.7","M10A.8","M10A.9"].includes(REALM_GUARD_STRICT_PROFILE.metadata.implementationPhase));
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.scalePolicyReady, true);
assert.equal(REALM_GUARD_STRICT_PROFILE.metadata.rulesReferencePreviewReady, true);
assert.equal(typeof REALM_GUARD_STRICT_PROFILE.metadata.liveRuleAuthority, "boolean");
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.scaleOfMight.rankMin, 1);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.scaleOfMight.rankMax, 6);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.scaleOfMight.dunadanRank, 3);
assert.equal(REALM_GUARD_STRICT_PROFILE.domains.scaleOfMight.tokenScaleGuidance, "MANUAL_GUIDED");

const scaleSource = fs.readFileSync("module/m10-strict-scale-of-might.mjs","utf8");
const refSource = fs.readFileSync("module/m10-strict-rules-reference.mjs","utf8");
for (const source of [scaleSource, refSource]) {
  for (const forbidden of [
    ".update(",
    ".createEmbeddedDocuments(",
    ".deleteEmbeddedDocuments(",
    "game.settings.set",
    ".setFlag(",
    ".unsetFlag(",
    "JournalEntry.create"
  ]) assert.equal(source.includes(forbidden), false, `M10A.7 Strict Scale/docs must remain read-only: ${forbidden}`);
}

const legacyReference = fs.readFileSync("module/rules-reference.mjs","utf8");
assert.ok(legacyReference.includes("Mouse Guard Roleplaying Game 2nd Edition"), "Legacy Mixed reference must remain intact during qa.8.");
assert.ok(legacyReference.includes("Wises are intentionally unrated"), "Legacy Mixed Wise documentation must remain intact during qa.8.");
const manual = fs.readFileSync("module/manual.mjs","utf8");
assert.ok(manual.includes("Preview Strict Rules"), "Integrated manual must expose Strict read-only preview.");
assert.ok(manual.includes("Open Legacy Mixed Rules Journal"), "Existing permanent journal must remain explicitly Legacy Mixed.");
assert.ok(manual.includes("game?.system?.version"), "Manual runtime version metadata must not be hard-coded to an obsolete release.");

const strictReferenceSource = fs.readFileSync("module/m10-strict-rules-reference.mjs","utf8");
assert.ok(strictReferenceSource.includes("data-rg-reference-root"), "Strict reference must use the shared searchable reference shell.");
assert.ok(strictReferenceSource.includes("data-rg-reference-search"), "Strict reference must expose a search field.");
assert.ok(strictReferenceSource.includes("data-rg-reference-expand"), "Strict reference must expose Expand All.");
assert.ok(strictReferenceSource.includes("data-rg-reference-collapse"), "Strict reference must expose Collapse All.");

const manualSource = fs.readFileSync("module/manual.mjs","utf8");
assert.ok(manualSource.includes("data-rg-reference-root"), "System Manual must use the shared searchable reference shell.");
assert.ok(manualSource.includes("data-rg-reference-search"), "System Manual must expose a search field.");
assert.ok(manualSource.includes("filterReference"), "System Manual must provide live reference filtering.");
assert.ok(manualSource.includes("restoreReferenceSearch"), "System Manual must restore search state safely.");

const cssSource = fs.readFileSync("styles/realm-guard.css","utf8");
assert.ok(cssSource.includes(".rg-reference-scroll"), "Reference content must own an explicit scroll container.");
assert.ok(cssSource.includes("overflow-y:auto"), "Reference content must be vertically scrollable.");
assert.ok(cssSource.includes(".rg-reference-toolbar"), "Reference search controls must have a persistent toolbar.");

const profileService = fs.readFileSync("module/rules-profile-service.mjs","utf8");
assert.equal(profileService.includes("setActiveRulesProfile"), false, "M10A.7 must not expose profile activation.");

console.log("PASS M10A.7 Scale / Docs / Rules Reference · RG v1.6 Scale planners · profile-aware manual · Strict read-only reference · Legacy journal untouched · no live activation");
