import assert from "node:assert/strict";
import fs from "node:fs";

const settings = new Map([
  ["realm-guard.activeRulesProfileId", "realm-guard-legacy-mixed"],
  ["realm-guard.activeRulesProfileVersion", 4],
  ["realm-guard.systemSchemaVersion", 1],
  ["realm-guard.coreArchitectureVersion", "0.1"],
  ["realm-guard.migrationHistory", "[]"],
  ["realm-guard.migrationLastError", ""]
]);

globalThis.game = {
  system:{version:"1.12.0-qa.8"},
  settings:{
    get:(ns,key)=> settings.get(`${ns}.${key}`),
    set:async(ns,key,value)=>{ settings.set(`${ns}.${key}`,value); return value; }
  }
};

const { MG1E_FOUNDATION_PROFILE } = await import("../module/profiles/mg1e-foundation.mjs");
const {
  familyScaleEffectiveRankPlan,
  familyScaleEntry,
  familyScaleGroupWarPlan,
  familyScaleItemGuidance,
  familyScaleOutcomePlan,
  familyScaleRankFor,
  familyScaleSpecialPlan,
  getM10B8ComparativeScaleStatus,
  resolveComparativeScaleDefinition,
  resolveM10BComparativeScalePolicy
} = await import("../module/m10b-comparative-scale.mjs");
const {
  profileRulesReferenceHtml,
  profileRulesReferenceSnapshot
} = await import("../module/m10b-rules-reference.mjs");

assert.ok(MG1E_FOUNDATION_PROFILE.version >= 9);

const legacy = resolveM10BComparativeScalePolicy("realm-guard-legacy-mixed");
const strict = resolveM10BComparativeScalePolicy("realm-guard-strict");
const mg = resolveM10BComparativeScalePolicy("mg1e");

assert.equal(legacy.enabled, false);
assert.equal(strict.enabled, true);
assert.equal(strict.name, "Scale of Might");
assert.equal(strict.rankMin, 1);
assert.equal(strict.rankMax, 6);
assert.equal(strict.baseActorKind, "Dúnadan");
assert.equal(strict.baseRank, 3);
assert.equal(mg.enabled, true);
assert.ok(mg.profileVersion >= 9);
assert.equal(mg.name, "Natural Order");
assert.equal(mg.rankMin, 1);
assert.equal(mg.rankMax, 9);
assert.equal(mg.baseActorKind, "Mouse");
assert.equal(mg.baseRank, 3);
assert.equal(mg.foundationOnly, false);
assert.equal(mg.selectable, true);
assert.equal(mg.liveApplication, false);

const mgDef = resolveComparativeScaleDefinition("mg1e");
assert.equal(Object.keys(mgDef.orderedRanks).length, 9);
assert.equal(familyScaleRankFor("mg1e","Mouse"), 3);
assert.equal(familyScaleRankFor("mg1e","Weasel"), 4);
assert.equal(familyScaleRankFor("mg1e","Owl"), 5);
assert.equal(familyScaleRankFor("mg1e","Fox"), 6);
assert.equal(familyScaleRankFor("mg1e","Wolf"), 8);
assert.equal(familyScaleRankFor("mg1e","Black Bear"), 9);
assert.equal(familyScaleRankFor("mg1e","Moose"), 9);
assert.equal(familyScaleEntry("mg1e","Unknown").manualIfUnknown, true);

const weasel = familyScaleOutcomePlan("mg1e",{actorType:"Mouse",targetType:"Weasel"});
assert.equal(weasel.rankDifference,1);
assert.equal(weasel.killAllowed,true);
assert.equal(weasel.captureAllowed,true);
assert.equal(weasel.injureAllowed,true);
assert.equal(weasel.runOffAllowed,true);

const owl = familyScaleOutcomePlan("mg1e",{actorType:"Mouse",targetType:"Owl"});
assert.equal(owl.rankDifference,2);
assert.equal(owl.killAllowed,false);
assert.equal(owl.captureAllowed,true);
assert.equal(owl.injureAllowed,true);
assert.equal(owl.runOffAllowed,true);

const fox = familyScaleOutcomePlan("mg1e",{actorType:"Mouse",targetType:"Fox"});
assert.equal(fox.rankDifference,3);
assert.equal(fox.killAllowed,false);
assert.equal(fox.captureAllowed,false);
assert.equal(fox.injureAllowed,false);
assert.equal(fox.runOffAllowed,true);

for (const [diff,minimum] of [[2,20],[3,100],[4,200],[5,2000],[6,20000]]) {
  const plan=familyScaleGroupWarPlan("mg1e",{armyRank:3,targetRank:3+diff,forceSize:minimum});
  assert.equal(plan.rankDifference,diff);
  assert.equal(plan.minimumForce,minimum);
  assert.equal(plan.eligible,true);
}
assert.equal(familyScaleGroupWarPlan("mg1e",{armyRank:3,targetRank:5,forceSize:19}).eligible,false);

const science=familyScaleSpecialPlan("mg1e",{actorType:"Mouse",targetType:"Fox",targetNature:7});
assert.equal(science.mode,"MG1E_SCIENTIST");
assert.equal(science.eligible,true);
assert.deepEqual(science.permittedOutcomes,["CAPTURE","INJURE"]);
assert.equal(science.resourcesObstacle,7);
assert.deepEqual(science.conflict.attack,["Scientist"]);
assert.deepEqual(science.conflict.maneuver,["Scientist"]);
assert.deepEqual(science.conflict.defend,["APPROPRIATE_CRAFT_OR_TRADE"]);
assert.deepEqual(science.conflict.feint,["APPROPRIATE_CRAFT_OR_TRADE"]);
assert.equal(science.conflict.animalDisposition,"NATURE_PLUS_NATURE");
assert.equal(science.conflict.animalActions,"NATURE");
assert.equal(science.liveApplication,false);

assert.equal(familyScaleRankFor("realm-guard-strict","Dúnadan"),3);
assert.equal(familyScaleRankFor("realm-guard-strict","Ent"),5);
assert.equal(familyScaleOutcomePlan("realm-guard-strict",{actorType:"Dúnadan",targetType:"Ent"}).killAllowed,false);
assert.equal(familyScaleGroupWarPlan("realm-guard-strict",{armyRank:2,targetRank:4,forceSize:10}).minimumForce,10);
assert.equal(familyScaleGroupWarPlan("realm-guard-strict",{armyRank:2,targetRank:5,forceSize:100}).minimumForce,100);
assert.equal(familyScaleGroupWarPlan("realm-guard-strict",{armyRank:1,targetRank:5,forceSize:1000}).minimumForce,1000);
assert.equal(familyScaleGroupWarPlan("realm-guard-strict",{armyRank:1,targetRank:6,forceSize:10000}).minimumForce,10000);

const lore=familyScaleEffectiveRankPlan("realm-guard-strict",{baseRank:3,successMargin:2});
assert.equal(lore.baseRank,3);
assert.equal(lore.ranksGained,2);
assert.equal(lore.effectiveRank,5);
assert.equal(lore.opposedBy,"CREATURE_NATURE");
assert.equal(familyScaleEffectiveRankPlan("mg1e",{baseRank:3,successMargin:2}).ok,false);

const token=familyScaleItemGuidance("realm-guard-strict",{tokenLevel:3,applicable:true});
assert.equal(token.mode,"MANUAL_GUIDED");
assert.equal(token.level3PublishedExample.effectiveRank,5);
assert.equal(token.level3PublishedExample.sameRankAs,"Ent");
assert.equal(familyScaleItemGuidance("mg1e",{tokenLevel:3,applicable:true}).ok,false);

const strictDef=resolveComparativeScaleDefinition("realm-guard-strict");
assert.deepEqual(strictDef.groupWar.minimumForceByDifference,{2:10,3:100,4:1000,5:10000});
assert.deepEqual(mgDef.groupWar.minimumForceByDifference,{2:20,3:100,4:200,5:2000,6:20000});
assert.deepEqual(strictDef.alternateReferenceArmyTable.minimumForceByDifference,{2:10,3:50,4:100,5:1000,6:10000});
assert.equal(strictDef.alternateReferenceArmyTable.status,"ALTERNATE_REFERENCE_NOT_ACTIVE");

const strictRef=profileRulesReferenceSnapshot("realm-guard-strict");
const mgRef=profileRulesReferenceSnapshot("mg1e");
assert.equal(strictRef.phase,"M10B.8");
assert.equal(strictRef.profileId,"realm-guard-strict");
assert.equal(strictRef.pages.find(p=>p.id==="scale").title,"Scale of Might");
assert.equal(strictRef.pages.find(p=>p.id==="scale").rules.some(r=>r.id==="SCALE_OF_MIGHT.MODE"),true);
assert.equal(mgRef.profileId,"mg1e");
assert.ok(mgRef.profileVersion >= 9);
assert.equal(mgRef.foundationOnly,false);
assert.equal(mgRef.liveAuthority,false);
assert.equal(mgRef.selectable,true);
assert.equal(mgRef.pages.find(p=>p.id==="scale").title,"Natural Order");
assert.equal(mgRef.pages.find(p=>p.id==="scale").rules.some(r=>r.id==="NATURAL_ORDER.MODE"),true);
assert.match(profileRulesReferenceHtml("realm-guard-strict"),/Scale of Might/);
assert.match(profileRulesReferenceHtml("mg1e"),/Natural Order/);
assert.match(profileRulesReferenceHtml("mg1e"),/READ ONLY PREVIEW/);

const status=getM10B8ComparativeScaleStatus();
assert.equal(status.phase,"M10B.8");
assert.equal(status.writesActors,false);
assert.equal(status.writesItems,false);
assert.equal(status.writesJournals,false);
assert.equal(status.writesWorldSettings,false);
assert.equal(status.automaticActorRankInference,false);

for (const path of [
  "module/m10b-comparative-scale.mjs",
  "module/m10b-rules-reference.mjs",
  "module/profiles/mg1e-natural-order.mjs",
  "module/profiles/realm-guard-strict-scale.mjs"
]) {
  const source=fs.readFileSync(path,"utf8");
  for (const forbidden of ["Actor.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments","game.settings.set",".setFlag(", ".unsetFlag("]) {
    assert.equal(source.includes(forbidden),false,`${path} must remain zero-write: ${forbidden}`);
  }
}

const legacyReference=fs.readFileSync("module/rules-reference.mjs","utf8");
assert.ok(legacyReference.includes("Mouse Guard Roleplaying Game 2nd Edition"));
assert.ok(legacyReference.includes("Wises are intentionally unrated"));

const manual=fs.readFileSync("module/manual.mjs","utf8");
assert.equal(manual.includes("isStrictRealmGuard"),false);
assert.ok(manual.includes('openProfileRulesReference'));
assert.ok(manual.includes('Preview MG1E Rules'));
assert.ok(manual.includes("Open Legacy Mixed Rules Journal"));

const activation=fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.ok(activation.includes("profileActivationAvailable"),"Later M10B activation routing must remain metadata-gated.");

console.log("PASS M10B.8 Comparative Scale / Natural Order / generic Rules Reference · MG1E v9+ foundation · zero-write");
