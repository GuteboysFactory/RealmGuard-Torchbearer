import assert from "node:assert/strict";
import fs from "node:fs";
import {tb2eFactorObstaclePlan as factor,tb2eVersusFactorPlan as versus,
 tb2eTieBreakerPlan as tie} from "../module/m10d-tb2e-tests-fullcore-p31-shadow.mjs";
import {tb2eHelpPlan as help,tb2eBeginnersLuckHelpPlan as luckHelp,
 tb2eConflictHelpPlan as conflictHelp} from "../module/m10d-tb2e-help-shadow.mjs";
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);
 assert.equal(p.actorWrite,false);assert.equal(p.itemWrite,false);
 assert.equal(p.rollExecuted,false);assert.equal(p.advancementWrite,false);};
const f=factor({factors:[{category:"stalking",value:1,additive:false},
 {category:"rarity",value:2,additive:true}]});
safe(f);assert.equal(f.ok,true);assert.equal(f.obstacle,3);
assert.equal(f.sourceFactorCatalogueLookup,false);
assert.equal(factor({factors:[]}).ok,false);
assert.equal(factor({factors:[{category:"A",value:1,additive:false},{category:"B",value:2,additive:false}]}).reasonCode,"EXACTLY_ONE_PRIMARY_FACTOR_REQUIRED");
assert.equal(factor({factors:[{category:"A",value:1,additive:false},{category:"a",value:2,additive:true}]}).reasonCode,"DUPLICATE_FACTOR_CATEGORY");
const v=versus({applicableFactors:2});safe(v);
assert.equal(v.successModifier,-2);assert.equal(v.obstacleIncrease,0);
assert.equal(versus({applicableFactors:0}).successModifier,0);
assert.equal(versus({applicableFactors:-1}).ok,false);
const skill=tie({initialSourceKind:"SKILL",beginnersLuckAbility:"HEALTH"});
safe(skill);assert.equal(skill.tiebreakAbility,"HEALTH");
assert.equal(skill.noHelpAllowed,true);assert.equal(skill.advancementOnlyFromTiebreakRoll,true);
assert.equal(tie({initialSourceKind:"SKILL"}).ok,false);
assert.equal(tie({initialSourceKind:"WILL"}).tiebreakAbility,"NATURE");
assert.equal(tie({initialSourceKind:"HEALTH"}).tiebreakAbility,"NATURE");
assert.equal(tie({initialSourceKind:"NATURE"}).tiebreakAbility,"WILL_OR_HEALTH_GM_SELECT");
assert.equal(tie({initialSourceKind:"MONSTER"}).tiebreakAbility,"NATURE");
assert.equal(tie({initialSourceKind:"NATURE",tiebreakRollOutcome:"TIE"}).finalOutcome,"FAIL");
assert.equal(tie({initialSourceKind:"NATURE",tiebreakRollOutcome:"TIE",secondTieBrokenInPlayerFavor:true}).finalOutcome,"PASS");
assert.equal(tie({initialSourceKind:"WILL",tiebreakRollOutcome:"PASS"}).finalOutcome,"PASS");
for(const p of [
 help({sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true,sourceRatingZeroDueToInjuryOrSickness:true}),
 help({sourceKind:"ability",sourceName:"Will",testName:"Will",sourceRatingZeroDueToInjuryOrSickness:true}),
 luckHelp({sourceName:"Will",sourceRatingZeroDueToInjuryOrSickness:true}),
 conflictHelp({partySize:4,helperHasRoundAction:false,hasRequiredSkill:true,helperRatingZeroDueToInjuryOrSickness:true})
]) assert.equal(p.reasonCode,"ZERO_RATED_SOURCE_CANNOT_HELP");
assert.equal(help({sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}).ok,true);
assert.equal(luckHelp({sourceName:"Will"}).ok,true);
assert.equal(conflictHelp({partySize:4,helperHasRoundAction:false,hasRequiredSkill:true}).ok,true);
for(const p of ["module/m10d-tb2e-tests-fullcore-p31-shadow.mjs","module/m10d-tb2e-help-shadow.mjs"]){
 const code=fs.readFileSync(p,"utf8");
 for(const banned of ["game.settings.set","Actor.create","Item.create","JournalEntry.create","createEmbeddedDocuments","deleteEmbeddedDocuments",".update(","new Roll("])
 assert.equal(code.includes(banned),false,p+" must remain read only");
}
console.log("PASS M10D.18 P3.1 · SG27 factors/versus, SG32-34 tiebreakers, SG37 rating-zero help; no writes");
