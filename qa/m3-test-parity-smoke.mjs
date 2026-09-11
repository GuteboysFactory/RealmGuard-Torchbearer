import assert from "node:assert/strict";
import { TestEngine } from "../module/core/test-engine.mjs";
import { runLegacyCoreTestParity } from "../module/core/test-parity.mjs";

const engine = new TestEngine();

let parity = runLegacyCoreTestParity(engine,{id:"ordinary-pass",context:"ordinary",pool:4,target:2,faces:[4,4,1,2],successes:2,outcome:"PASS",margin:0,sourceName:"Fighter"});
assert.equal(parity.parity.all,true);

parity = runLegacyCoreTestParity(engine,{id:"ability-recovery-pass",context:"recovery",pool:4,target:3,faces:[4,4,5,1],successes:3,outcome:"PASS",margin:0,sourceName:"Health"});
assert.equal(parity.context,"recovery");
assert.equal(parity.parity.all,true);

parity = runLegacyCoreTestParity(engine,{id:"role-recovery-fail",context:"recovery",pool:3,target:2,faces:[4,2,1],successes:1,outcome:"FAIL",margin:1,sourceName:"Cook"});
assert.equal(parity.context,"recovery");
assert.equal(parity.core.outcome,"FAIL");
assert.equal(parity.core.margin,1);
assert.equal(parity.parity.all,true);

parity = runLegacyCoreTestParity(engine,{id:"bl-ordinary",context:"beginnerLuck",pool:3,target:2,faces:[4,2,5],successes:2,outcome:"PASS",margin:0,sourceName:"Untrained Pathfinder"});
assert.equal(parity.context,"beginnerLuck");
assert.equal(parity.versus,false);
assert.equal(parity.parity.all,true);

parity = runLegacyCoreTestParity(engine,{id:"bl-versus-pass",context:"beginnerLuck",versus:true,pool:3,target:1,faces:[4,2,5],successes:2,outcome:"PASS",margin:1,sourceName:"Untrained Fighter"});
assert.equal(parity.context,"beginnerLuck");
assert.equal(parity.versus,true);
assert.equal(parity.core.target,1);
assert.equal(parity.core.outcome,"PASS");
assert.equal(parity.parity.all,true);

parity = runLegacyCoreTestParity(engine,{id:"bl-versus-tie-break",context:"beginnerLuck",versus:true,pool:3,target:2,faces:[4,2,5],successes:2,outcome:"FAIL",margin:1,sourceName:"Untrained Fighter",versusResolution:{method:"tiebreaker",resolved:true,ownTieFaces:[4,1],oppTieFaces:[4,5],ownAbility:"Health",oppAbility:"Health"}});
assert.equal(parity.core.outcome,"FAIL");
assert.equal(parity.core.margin,1);
assert.equal(parity.core.secondaryResolution.method,"tiebreaker");
assert.equal(parity.parity.all,true);

parity = runLegacyCoreTestParity(engine,{id:"fate-open-six",context:"ordinary",pool:3,target:3,faces:[6,2,4],supplementalFaces:[6,5],successes:4,outcome:"PASS",margin:1,sourceName:"Fighter"});
assert.deepEqual(parity.core.supplementalFaces,[6,5]);
assert.equal(parity.parity.all,true);

const mismatch = runLegacyCoreTestParity(engine,{id:"intentional-mismatch",context:"ordinary",pool:4,target:3,faces:[4,1,2,3],successes:1,outcome:"PASS",margin:2,sourceName:"QA"});
assert.equal(mismatch.parity.all,false);

console.log("M3 Legacy Mixed <-> CORE Test parity smoke PASS · recovery Ability/Role · Beginner's Luck ordinary/Versus · Fate supplemental dice · mismatch detection OK");
