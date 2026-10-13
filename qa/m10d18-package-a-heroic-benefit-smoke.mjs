import assert from "node:assert/strict";
import {tb2eResolveObstacleShadow,tb2eResolveVersusShadow} from "../module/m10d-tb2e-test-shadow.mjs";
import {tb2eAdvancementThresholdPlan} from "../module/m10d-tb2e-abilities-shadow.mjs";
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);};
const rolls=[3,3,4];
const normal=tb2eResolveObstacleShadow({dice:rolls,obstacle:2});
safe(normal);assert.equal(normal.successThreshold,4);assert.equal(normal.rawSuccesses,1);assert.equal(normal.outcome,"FAIL");
const heroic=tb2eResolveObstacleShadow({dice:rolls,obstacle:2,sourceKind:"SKILL",heroicTn3BenefitUnlocked:true});
safe(heroic);assert.equal(heroic.successThreshold,3);assert.equal(heroic.rawSuccesses,3);assert.equal(heroic.outcome,"PASS");
assert.equal(heroic.heroicBenefitGmPreconfirmed,true);
assert.equal(tb2eResolveVersusShadow({dice:rolls,opponentSuccesses:2}).outcome,"FAIL");
const vs=tb2eResolveVersusShadow({dice:rolls,opponentSuccesses:2,sourceKind:"HEALTH",heroicTn3BenefitUnlocked:true});
safe(vs);assert.equal(vs.successThreshold,3);assert.equal(vs.outcome,"PASS");
for(const p of [
 tb2eResolveObstacleShadow({dice:rolls,obstacle:2,heroicTn3BenefitUnlocked:true}),
 tb2eResolveVersusShadow({dice:rolls,opponentSuccesses:2,heroicTn3BenefitUnlocked:true,sourceKind:"RESOURCES"})
]){safe(p);assert.equal(p.reasonCode,"HEROIC_TN3_REQUIRES_ELIGIBLE_SKILL_OR_ABILITY");}
for(const kind of ["SKILL","WILL","HEALTH"]){
 const standard=tb2eAdvancementThresholdPlan({kind,rating:6});
 safe(standard);assert.equal(standard.cap,6);assert.equal(standard.atCap,true);
 const elevated=tb2eAdvancementThresholdPlan({kind,rating:6,heroicRatingSevenUnlocked:true});
 safe(elevated);assert.equal(elevated.cap,7);assert.equal(elevated.advanceTo,7);
 assert.equal(tb2eAdvancementThresholdPlan({kind,rating:7}).reasonCode,"INVALID_ADVANCEMENT_RATING");
 assert.equal(tb2eAdvancementThresholdPlan({kind,rating:7,heroicRatingSevenUnlocked:true}).atCap,true);
}
assert.equal(tb2eAdvancementThresholdPlan({kind:"RESOURCES",rating:10,heroicRatingSevenUnlocked:true}).cap,10);
console.log("PASS Package A DH59/72: explicitly unlocked heroic Will/Health/Skill cap-7 and TN3 read-only outcomes");
