import assert from "node:assert/strict";
import {tb2eHelpPlan,tb2eBeginnersLuckHelpPlan,tb2eHelpConsequencePlan} from "../module/m10d-tb2e-help-shadow.mjs";
import {tb2eSkillInfo,tb2eBeginnersLuckAbilityPlan} from "../module/m10d-tb2e-abilities-shadow.mjs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
import {profileActivationAvailable} from "../module/m10-profile-activation.mjs";
const before=JSON.stringify(["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"].map(resolveRulesProfile));
const ok=p=>{assert.equal(p.ok,true,JSON.stringify(p));assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);};
for(const p of [
  tb2eBeginnersLuckHelpPlan({sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook",helperSkillTrained:true}),
  tb2eBeginnersLuckHelpPlan({sourceKind:"ability",sourceName:"Will",targetSkillName:"Cook"}),
  tb2eBeginnersLuckHelpPlan({sourceKind:"ability",sourceName:"Health",targetSkillName:"Fighter"}),
  tb2eHelpPlan({sourceKind:"nature",sourceName:"Nature",testName:"Cook",relevantNatureDescriptor:true}),
  tb2eHelpPlan({sourceKind:"ability",sourceName:"Will",testName:"Will"}),
])ok(p);
const failures=[
  [tb2eBeginnersLuckHelpPlan({sourceKind:"skill",sourceName:"Fighter",targetSkillName:"Cook",helperSkillTrained:true}),"BEGINNERS_LUCK_HELPING_SKILL_MISMATCH"],
  [tb2eBeginnersLuckHelpPlan({sourceKind:"skill",sourceName:"Cook"}),"BEGINNERS_LUCK_SKILL_TARGET_REQUIRED"],
  [tb2eBeginnersLuckHelpPlan({sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook"}),"BEGINNERS_LUCK_HELPING_SKILL_NOT_CONFIRMED_TRAINED"],
  [tb2eBeginnersLuckHelpPlan({sourceKind:"ability",sourceName:"Health",targetSkillName:"Cook"}),"BEGINNERS_LUCK_HELP_ABILITY_MISMATCH"],
  [tb2eBeginnersLuckHelpPlan({sourceKind:"ability",sourceName:"Will",targetSkillName:"Fighter"}),"BEGINNERS_LUCK_HELP_ABILITY_MISMATCH"],
  [tb2eBeginnersLuckHelpPlan({sourceKind:"ability",sourceName:"Will",targetSkillName:"NotASkill"}),"UNKNOWN_BEGINNERS_LUCK_TARGET_SKILL"],
  [tb2eHelpPlan({sourceKind:"ability",sourceName:"Health",testName:"Will"}),"HELP_SOURCE_NOT_ESTABLISHED"],
  [tb2eHelpPlan({sourceKind:"skill",sourceName:"Fighter",testName:"Cook",sameSkill:true}),"SAME_SKILL_SOURCE_MISMATCH"],
  [tb2eHelpPlan({sourceKind:"skill",sourceName:"Cook",testName:"Cook",sourceRatingZeroDueToInjuryOrSickness:true,sameSkill:true}),"ZERO_RATED_SOURCE_CANNOT_HELP"],
  [tb2eHelpPlan({sourceKind:"nature",sourceName:"Nature",testName:"Cook"}),"HELP_SOURCE_NOT_ESTABLISHED"],
  [tb2eHelpPlan({sourceKind:"ability",sourceName:"Will",testName:"Will",context:"RECOVERY"}),"RECOVERY_HELP_FORBIDDEN"],
  [tb2eHelpPlan({sourceKind:"ability",sourceName:"Resources",testName:"Resources",context:"PAY_BILLS"}),"TOWN_BILLS_HELP_FORBIDDEN"]
];
for(const [p,reason] of failures){assert.equal(p.ok,false);assert.equal(p.reasonCode,reason);assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);}
assert.equal(tb2eBeginnersLuckHelpPlan({sourceName:"Will"}).sourceVerification,"TARGET_SKILL_UNSPECIFIED_GM_MUST_VERIFY");
assert.equal(tb2eSkillInfo("Fighter").beginnersLuckAbility,"HEALTH");
assert.equal(tb2eBeginnersLuckAbilityPlan({skillName:"Cook"}).ability,"WILL");
const hungry=tb2eHelpConsequencePlan({testFailed:true,conditionApplied:true,everyoneHungryChosen:true});
assert.equal(hungry.helperConsequence,"HUNGRY_AND_THIRSTY");
assert.equal(hungry.automaticConditionWrite,false);
assert.equal(profileActivationAvailable("torchbearer2e"),false);
assert.equal(JSON.stringify(["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"].map(resolveRulesProfile)),before);
console.log("PASS Package A source-backed Help/BL routing, aid consequences, profile isolation; shadow-only");