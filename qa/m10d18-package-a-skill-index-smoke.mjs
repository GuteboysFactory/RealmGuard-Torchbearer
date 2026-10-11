import assert from "node:assert/strict";
import fs from "node:fs";
import {tb2eSkillIndex,tb2eSkillSourceEntry,tb2eSuggestedHelpSkillPlan} from "../module/m10d18-tb2e-package-a-skill-index.mjs";
import {tb2eHelpPlan} from "../module/m10d-tb2e-help-shadow.mjs";
import {tb2eSkillInfo} from "../module/m10d-tb2e-abilities-shadow.mjs";
const expected={
  "Alchemist": [
    "Lore Master",
    "Laborer"
  ],
  "Arcanist": [
    "Lore Master"
  ],
  "Armorer": [
    "Smith",
    "Laborer"
  ],
  "Carpenter": [
    "Alchemist",
    "Laborer"
  ],
  "Cartographer": [
    "Scholar",
    "Pathfinder"
  ],
  "Commander": [
    "Steward",
    "Orator"
  ],
  "Cook": [
    "Alchemist",
    "Laborer"
  ],
  "Criminal": [
    "Scout",
    "Scholar"
  ],
  "Dungeoneer": [
    "Sapper",
    "Survivalist"
  ],
  "Fighter": [
    "Hunter"
  ],
  "Haggler": [
    "Manipulator"
  ],
  "Healer": [
    "Survivalist",
    "Alchemist"
  ],
  "Hunter": [
    "Survivalist",
    "Laborer"
  ],
  "Laborer": [
    "Peasant"
  ],
  "Lore Master": [
    "Arcanist",
    "Theologian"
  ],
  "Manipulator": [
    "Haggler",
    "Persuader"
  ],
  "Mentor": [
    "Persuader"
  ],
  "Orator": [
    "Manipulator"
  ],
  "Pathfinder": [
    "Scout",
    "Cartographer"
  ],
  "Peasant": [
    "Laborer"
  ],
  "Persuader": [
    "Manipulator"
  ],
  "Rider": [
    "Peasant"
  ],
  "Ritualist": [
    "Theologian"
  ],
  "Sailor": [
    "Survivalist",
    "Laborer"
  ],
  "Sapper": [
    "Alchemist",
    "Laborer"
  ],
  "Scavenger": [
    "Scout"
  ],
  "Scholar": [
    "Lore Master",
    "Steward"
  ],
  "Scout": [
    "Pathfinder",
    "Hunter"
  ],
  "Stonemason": [
    "Laborer"
  ],
  "Steward": [
    "Scholar",
    "Theologian"
  ],
  "Survivalist": [
    "Peasant"
  ],
  "Theologian": [
    "Scholar",
    "Ritualist"
  ],
  "Weaver": [
    "Laborer",
    "Peasant"
  ]
};
const index=tb2eSkillIndex();
assert.equal(index.skillCount,33);
assert.equal(index.fullSuggestedHelpIndexMapped,true);
assert.equal(index.fullFactorValueCatalogueMapped,false);
assert.deepEqual([...index.skillNames].sort(),Object.keys(expected).sort());
for(const [skill,helpers] of Object.entries(expected)){
 const entry=tb2eSkillSourceEntry({skillName:skill});
 assert.equal(entry.ok,true,skill);
 assert.deepEqual(entry.suggestedHelp,helpers,skill);
 assert.ok(entry.sourcePage>=160&&entry.sourcePage<=176,skill);
 assert.ok(entry.factorFamilies.length>=1,skill);
 assert.equal(entry.factorValuesAutomatic,false,skill);
 assert.equal(tb2eSkillInfo(skill).beginnersLuckAbility,entry.beginnersLuckAbility,skill);
 for(const helper of helpers){
  const candidate=tb2eSuggestedHelpSkillPlan({testSkillName:skill,helperSkillName:helper});
  assert.equal(candidate.ok,true,skill+" + "+helper);
  assert.equal(candidate.gmFictionalRelevanceStillRequired,true);
  const route=tb2eHelpPlan({sourceKind:"skill",sourceName:helper,testName:skill,suggestedHelpSkill:true});
  assert.equal(route.ok,true,skill+" + "+helper);
  assert.equal(route.suggestedHelpSourceEvidence,"SUGGESTED_HELP");
  assert.equal(route.writesPlanned,0);
 }
}
const smith=tb2eSuggestedHelpSkillPlan({testSkillName:"Armorer",helperSkillName:"Smith"});
assert.equal(smith.nonCoreNamedSource,true);
assert.equal(tb2eSkillSourceEntry({skillName:"Smith"}).ok,false);
assert.equal(tb2eSuggestedHelpSkillPlan({testSkillName:"Cook",helperSkillName:"Hunter"}).reasonCode,"NOT_LISTED_AS_SUGGESTED_HELP");
assert.equal(tb2eHelpPlan({sourceKind:"skill",sourceName:"Hunter",testName:"Cook",suggestedHelpSkill:true}).ok,false);
const extra=tb2eHelpPlan({sourceKind:"skill",sourceName:"Hunter",testName:"Cook",suggestedHelpSkill:true,gmApprovedAdditionalSkill:true,gmApprovedAdditionalSkillCount:1});
assert.equal(extra.ok,true);assert.equal(extra.suggestedHelpSourceEvidence,"GM_APPROVED_ADDITIONAL_HELP");
assert.equal(tb2eSuggestedHelpSkillPlan({testSkillName:"Cook",helperSkillName:"Hunter",gmApprovedAdditionalSkill:true,gmApprovedAdditionalSkillCount:2}).reasonCode,"AT_MOST_ONE_GM_APPROVED_ADDITIONAL_SKILL");
for(const file of ["module/m10d18-tb2e-package-a-skill-index.mjs","module/m10d-tb2e-help-shadow.mjs"]){
 const content=fs.readFileSync(file,"utf8");
 for(const banned of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
  assert.equal(content.includes(banned),false,file+" "+banned);
}
console.log("PASS Package A DH160-176: 33/33 skills, "+Object.values(expected).reduce((sum,a)=>sum+a.length,0)+" suggested Help routes, zero-write safety");
