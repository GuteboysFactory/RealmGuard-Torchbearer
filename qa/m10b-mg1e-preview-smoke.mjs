import assert from "node:assert/strict";
import fs from "node:fs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { buildProfileConversionPreview } from "../module/m10-profile-conversion-preview.mjs";

const manifest=JSON.parse(fs.readFileSync("system.json","utf8"));
assert.match(manifest.version,/^1\.\d+\.\d+(?:\.\d+)*(?:-qa\.\d+)?$/);

const resolver=new ProfileResolver([MG1E_FOUNDATION_PROFILE,REALM_GUARD_LEGACY_MIXED_PROFILE,REALM_GUARD_STRICT_PROFILE]);
const legacy=resolver.resolve("realm-guard-legacy-mixed");
const strict=resolver.resolve("realm-guard-strict");
const mg1e=resolver.resolve("mg1e");

assert.ok(mg1e.version>=4,"MG1E source-manifest preview remains valid after later M10B profile revisions.");
assert.equal(mg1e.metadata.foundationOnly,true);
assert.equal(mg1e.metadata.selectable,false);
assert.equal(mg1e.metadata.liveRuleAuthority,false);
assert.deepEqual(mg1e.domains.nature.descriptors,["Escaping","Climbing","Hiding","Foraging"]);
assert.equal(mg1e.domains.inventory.policy,"LOOSE");
assert.equal(mg1e.domains.inventory.capacityMode,"CHARACTER_SHEET_GEAR_SPACE");
assert.equal(mg1e.domains.naturalOrder.enabled,true);
assert.equal(mg1e.domains.naturalOrder.mode,"MG1E");
assert.equal(mg1e.domains.scaleOfMight.enabled,false);
assert.equal(strict.domains.naturalOrder.enabled,false);
assert.equal(strict.domains.scaleOfMight.enabled,true);

const fakeActor={
  id:"a1",name:"QA",type:"character",
  system:{progression:{level:2}},
  items:{contents:[
    {type:"wise",name:"Rain-wise",system:{rating:0}},
    {type:"wise",name:"Guard-wise",system:{rating:3}},
    {type:"talent",name:"Legacy Talent",system:{}},
    {type:"tokenOfPower",name:"Token",system:{}},
    {type:"gear",name:"Sword",system:{inventory:{mode:"hand"}}},
    {type:"condition",name:"Fresh",system:{}},
    {type:"condition",name:"Afraid",system:{}},
    {type:"condition",name:"Strained",system:{}},
    {type:"condition",name:"Sick",system:{}}
  ]},
  flags:{"realm-guard":{creationProvenance:{rulesProfileId:"realm-guard-strict"}}}
};

const preview=buildProfileConversionPreview({fromProfile:legacy,toProfile:mg1e,actors:[fakeActor],worldItems:[]});
assert.equal(preview.phase,"M10B.2");
assert.equal(preview.mode,"READ_ONLY");
assert.equal(preview.activationAllowed,false);
assert.equal(preview.writesPlanned,0);
assert.equal(preview.safety.actorWrites,0);
assert.equal(preview.safety.itemWrites,0);
assert.equal(preview.safety.journalWrites,0);
assert.equal(preview.safety.settingWrites,0);
assert.equal(preview.safety.destructiveConversion,false);
assert.equal(preview.worldImpact.unratedWiseItems,1);
assert.equal(preview.worldImpact.ratedWiseItems,1);
assert.equal(preview.worldImpact.strainedItems,1);
assert.equal(preview.worldImpact.sickItems,1);
assert.equal(preview.worldImpact.tokenOfPowerItems,1);
assert.equal(preview.worldImpact.actorsWithStrictCreationProvenance,1);
assert.ok(preview.deltas.some(d=>d.domain==="naturalOrder"));
assert.ok(preview.deltas.some(d=>d.domain==="scaleOfMight"));
assert.ok(preview.deltas.some(d=>d.domain==="creation"));

const activation=fs.readFileSync("module/m10-profile-activation.mjs","utf8");
assert.equal(activation.includes('"mg1e"'),false,"MG1E must remain non-selectable throughout M10B.");

const previewSource=fs.readFileSync("module/m10-profile-conversion-preview.mjs","utf8");
for(const forbidden of ["game.settings.set","createEmbeddedDocuments","deleteEmbeddedDocuments","Actor.create"]) {
  assert.equal(previewSource.includes(forbidden),false,`MG1E preview must remain read-only: ${forbidden}`);
}

console.log("PASS M10B.2 MG1E Source Manifest + Conversion Preview · read-only · non-selectable");
