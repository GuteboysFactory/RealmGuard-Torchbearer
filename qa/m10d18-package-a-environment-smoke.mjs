import assert from "node:assert/strict";
import {tb2eEnvironmentalTestFactorPlan as plan} from "../module/m10d18-tb2e-package-a-environment.mjs";
import {tb2eFactorObstaclePlan,tb2eVersusFactorPlan} from "../module/m10d-tb2e-tests-fullcore-p31-shadow.mjs";
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);
 assert.equal(p.rollExecuted,false);assert.equal(p.actorWrite,false);}
const cases=[
 [{},0,0],
 [{light:"DIM_LIGHT",testMode:"OBSTACLE"},1,0],
 [{light:"DARKNESS",actionPossibleInDarkness:true},1,0],
 [{light:"DARKNESS",actionPossibleInDarkness:true,darknessFactorExempt:true},0,0],
 [{light:"CLEAR",testMode:"OBSTACLE",additionalGmHindrances:2},2,0],
 [{light:"DIM_LIGHT",testMode:"VERSUS"},0,-1],
 [{light:"DARKNESS",actionPossibleInDarkness:true,testMode:"VERSUS",additionalGmHindrances:2},0,-3]
];
for(const [opts,ob,s] of cases){const v=plan(opts);safe(v);assert.equal(v.ok,true);assert.equal(v.obstacleIncrease,ob);assert.equal(v.successModifier,s);}
for(const [opts,reason] of [
 [{light:"DARKNESS"},"DARKNESS_ACTION_NOT_CONFIRMED_POSSIBLE"],
 [{light:"FOG"},"INVALID_LIGHT_STATE"],
 [{light:"DIM_LIGHT",darknessFactorExempt:true},"DARKNESS_EXEMPTION_WITHOUT_DARKNESS"],
 [{testMode:"SKILL"},"INVALID_TEST_MODE"],
 [{additionalGmHindrances:-1},"INVALID_GM_HINDRANCE_COUNT"],
 [{additionalGmHindrances:1.25},"INVALID_GM_HINDRANCE_COUNT"]
]){const v=plan(opts);safe(v);assert.equal(v.reasonCode,reason);}
const factors=tb2eFactorObstaclePlan({factors:[{category:"base",value:2,additive:false},{category:"weather",value:1,additive:true}]});safe(factors);assert.equal(factors.obstacle,3);
const versus=tb2eVersusFactorPlan({applicableFactors:2});safe(versus);assert.equal(versus.successModifier,-2);assert.equal(versus.obstacleIncrease,0);
console.log("PASS Package A SG32/34: light + GM factors, Ob vs Versus, darkness gating, zero-write");
