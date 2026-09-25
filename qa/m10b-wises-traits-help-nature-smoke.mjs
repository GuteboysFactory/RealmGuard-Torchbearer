import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildProfileCapabilities } from "../module/profile-capabilities.mjs";
import { buildM10BFamilyRulePolicy, allowedHelperKindsForTest, helperSourceAllowedForTest } from "../module/m10b-family-rules.mjs";
import {
  familyAdvancementRequirements,
  ratedWiseView,
  planRatedWiseLearning,
  mg1eTraitBenefitPlan,
  classifyMg1eHelp
} from "../module/m10b-wises-traits-help-nature.mjs";
import {
  strictAdvancementRequirements,
  strictWiseView,
  planStrictWiseLearning,
  strictTraitBenefitPlan,
  classifyStrictHelp
} from "../module/m10-strict-wises-traits-help.mjs";

const manifest=JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version,/^1\.\d+\.\d+(?:\.\d+)*(?:-qa\.\d+)?$/);

const resolver=new ProfileResolver([MG1E_FOUNDATION_PROFILE,REALM_GUARD_LEGACY_MIXED_PROFILE,REALM_GUARD_STRICT_PROFILE]);
const legacy=buildM10BFamilyRulePolicy(buildProfileCapabilities(resolver.resolve("realm-guard-legacy-mixed")));
const strict=buildM10BFamilyRulePolicy(buildProfileCapabilities(resolver.resolve("realm-guard-strict")));
const mg1e=buildM10BFamilyRulePolicy(buildProfileCapabilities(resolver.resolve("mg1e")));

assert.equal(legacy.phase,"M10B.3");
assert.equal(legacy.ratedWises,false);
assert.equal(legacy.mg1eTraits,false);
assert.equal(legacy.helperSourcePolicy,"LEGACY_OPEN");
assert.equal(legacy.synergyEnabled,true);
assert.equal(legacy.afraidBlocksHelp,true);

for (const policy of [strict,mg1e]) {
  assert.equal(policy.ratedWises,true);
  assert.equal(policy.mg1eTraits,true);
  assert.equal(policy.helperSourcePolicy,"MG1E_TYPED");
  assert.equal(policy.synergyEnabled,false);
  assert.equal(policy.afraidBlocksHelp,false);
  assert.deepEqual(allowedHelperKindsForTest("Ability",policy),["Ability"]);
  assert.deepEqual(allowedHelperKindsForTest("Skill",policy),["Skill","Wise"]);
  assert.deepEqual(allowedHelperKindsForTest("Wise",policy),["Skill","Wise"]);
  assert.equal(helperSourceAllowedForTest("Ability","Skill",policy),false);
  assert.equal(helperSourceAllowedForTest("Skill","Ability",policy),false);
  assert.equal(helperSourceAllowedForTest("Wise","Skill",policy),true);
}
assert.deepEqual(strict.nature.descriptors,["Tradition","Family","Grief"]);
assert.deepEqual(mg1e.nature.descriptors,["Escaping","Climbing","Hiding","Foraging"]);
assert.equal(strict.nature.doubleTapNature,true);
assert.equal(mg1e.nature.doubleTapNature,true);

const wise={id:"w1",name:"Weather-wise",system:{rating:3,learning:{passed:2,failed:1}}};
assert.deepEqual(strictAdvancementRequirements(3),familyAdvancementRequirements(3));
assert.deepEqual(strictWiseView(wise),ratedWiseView(wise));
assert.deepEqual(planStrictWiseLearning(wise,true),planRatedWiseLearning(wise,true));

const trait={system:{rating:3}};
assert.deepEqual(strictTraitBenefitPlan(trait,{sessionUses:0}),mg1eTraitBenefitPlan(trait,{sessionUses:0}));
assert.deepEqual(classifyStrictHelp({sourceKind:"Wise",isSelf:false,testKind:"Skill"}),classifyMg1eHelp({sourceKind:"Wise",isSelf:false,testKind:"Skill"}));
assert.equal(classifyMg1eHelp({sourceKind:"Ability",isSelf:false,testKind:"Skill"}).ok,false);
assert.equal(classifyMg1eHelp({sourceKind:"Ability",isSelf:false,testKind:"Ability"}).ok,true);

const teamwork=fs.readFileSync("module/teamwork.mjs","utf8");
const traits=fs.readFileSync("module/traits.mjs","utf8");
const documents=fs.readFileSync("module/documents.mjs","utf8");
const sheet=fs.readFileSync("sheets/actor-sheet.mjs","utf8");
for(const [name,source] of [["teamwork",teamwork],["traits",traits],["documents",documents]]) {
  assert.equal(source.includes("isStrictRealmGuard"),false,`${name} must use profile capabilities for the M10B.3 domain.`);
}
assert.equal(sheet.includes("Dúnadan descriptors:"),false,"Shared Nature UI must not hardcode Dúnadan descriptors.");
assert.ok(sheet.includes("natureDescriptorText"));
assert.ok(sheet.includes("testKind: teamworkTestKind"));

const activation=fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activation.includes('"mg1e"'),false,"MG1E must remain non-selectable in M10B.3.");

console.log("PASS M10B.3 Wises / Traits / Help / Nature · generic profile routing · MG1E typed Help matrix · MG1E remains non-selectable");
