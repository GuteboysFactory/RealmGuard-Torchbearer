import assert from "node:assert/strict";
import {tb2eAdvancementThresholdPlan,tb2eSkillInfo} from "../module/m10d-tb2e-abilities-shadow.mjs";
import {tb2eNatureRecoveryPlan,tb2eNatureLossPlan,tb2eNatureAdvancementPlan,tb2eChannelNatureTaxPlan,tb2eChannelNaturePlan,tb2eNatureSubstitutionPlan,tb2eNatureSubstitutionTaxPlan} from "../module/m10d-tb2e-nature-shadow.mjs";
import {tb2eWiseRerollPlan,tb2eWiseAidPlan,tb2eWiseLanguageRetentionPlan,tb2eWiseCommunicationPlan} from "../module/m10d-tb2e-wise-shadow.mjs";
import {tb2eWiseCombinationPlan as validateWiseCombos} from "../module/m10d-tb2e-wises-p32-shadow.mjs";
import {tb2eResolveObstacleShadow,tb2eResolveVersusShadow,tb2eBeginnersLuckShadowPlan} from "../module/m10d-tb2e-test-shadow.mjs";
import {tb2eFactorObstaclePlan,tb2eVersusFactorPlan,tb2eTieBreakerPlan} from "../module/m10d-tb2e-tests-fullcore-p31-shadow.mjs";
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);};
const heroic=tb2eAdvancementThresholdPlan({kind:"SKILL",rating:6,heroicRatingSevenUnlocked:true});
safe(heroic);assert.equal(heroic.cap,7);assert.equal(heroic.advanceTo,7);
const end=tb2eAdvancementThresholdPlan({kind:"SKILL",rating:7,heroicRatingSevenUnlocked:true});
safe(end);assert.equal(end.atCap,true);assert.equal(end.advanceTo,null);
assert.equal(tb2eAdvancementThresholdPlan({kind:"SKILL",rating:7}).reasonCode,"INVALID_ADVANCEMENT_RATING");
assert.equal(tb2eAdvancementThresholdPlan({kind:"WILL",rating:6,heroicRatingSevenUnlocked:true}).cap,6);
assert.equal(tb2eSkillInfo("Cook").heroicRatingCap,7);
for(const f of [tb2eNatureRecoveryPlan,tb2eNatureLossPlan,tb2eNatureAdvancementPlan]){
 const p=f({currentNature:0,maximumNature:0,reachedZeroDueToTax:true,advancementTriggered:true,method:"RESPITE"});
 safe(p);assert.equal(p.reasonCode,"MAXIMUM_NATURE_ZERO_RETIRED_STATE");
}
assert.equal(tb2eNatureRecoveryPlan({method:"CONSERVE",currentNature:1,maximumNature:1}).retirementTiming,"END_OF_ADVENTURE");
assert.equal(tb2eNatureRecoveryPlan({method:"CONSERVE",currentNature:2,maximumNature:5}).eraseNatureAdvancementRequired,true);

for(const [planner,extra] of [
 [tb2eNatureSubstitutionPlan,{targetSkillUnavailable:true}],
 [tb2eNatureSubstitutionTaxPlan,{outcome:"FAIL",marginOfFailure:2}],
 [tb2eChannelNaturePlan,{testName:"Scout",personaAvailable:1}],
 [tb2eChannelNatureTaxPlan,{outcome:"FAIL",marginOfFailure:2}],
 [tb2eNatureRecoveryPlan,{method:"RESPITE"}],
 [tb2eNatureAdvancementPlan,{advancementTriggered:true}]
]){
 const p=planner({currentNature:0,maximumNature:4,...extra});
 safe(p);assert.equal(p.reasonCode,"NATURE_ZERO_TAX_LOSS_MUST_RESOLVE_FIRST");
}
assert.equal(tb2eNatureLossPlan({currentNature:0,maximumNature:4,reachedZeroDueToTax:true}).maximumAfter,3);

assert.equal(tb2eNatureRecoveryPlan({method:"RESPITE",currentNature:2,maximumNature:5}).eraseNatureAdvancementRequired,false);
assert.equal(tb2eNatureAdvancementPlan({currentNature:4,maximumNature:6,advancementTriggered:true}).retirementTiming,"END_OF_SESSION_IF_STILL_AT_SEVEN");
const tax=tb2eChannelNatureTaxPlan({currentNature:4,maximumNature:5,outcome:"FAIL",marginOfFailure:3});
safe(tax);assert.equal(tax.currentAfter,1);assert.equal(tax.taxAmount,3);
assert.equal(tb2eWiseRerollPlan("Of Course",{failedDice:2,fateLuckAlreadyUsed:true}).reasonCode,"WISE_REROLL_MUST_PRECEDE_FATE_LUCK");
assert.equal(tb2eWiseRerollPlan("Deeper Understanding",{failedDice:2,alreadyRerolledFailedDice:2}).reasonCode,"NO_ELIGIBLE_FAILED_DIE");
assert.equal(tb2eWiseAidPlan({alsoProvidingHelp:true}).ok,false);
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:true,wiseChanged:false}).languageRetained,true);
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:true,wiseChanged:true,retainLanguage:false}).languageForgotten,true);
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:true,wiseChanged:true,retainLanguage:true,languageRecordedWithLevelBenefit:false}).gmBookkeepingRequired,true);
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:true,wiseChanged:true,retainLanguage:true,languageRecordedWithLevelBenefit:false}).retentionStatus,"PENDING_RECORD");
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:true,wiseChanged:true,retainLanguage:true,languageRecordedWithLevelBenefit:false}).languageForgotten,false);
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:true,wiseChanged:true,retainLanguage:true,languageRecordedWithLevelBenefit:true}).languageRetained,true);
assert.equal(tb2eWiseLanguageRetentionPlan({peopleWise:false}).reasonCode,"LANGUAGE_WISE_REQUIRED");
assert.equal(tb2eWiseCommunicationPlan({peopleWiseApplies:false,otherCommunicationMethod:false}).socialVerbalTestsAllowed,false);
assert.equal(tb2eWiseCommunicationPlan({peopleWiseApplies:false,otherCommunicationMethod:true}).canCommunicate,true);

const wise=validateWiseCombos({knownWises:2,uses:[{wiseId:"a",effect:"I_AM_WISE",related:true},{wiseId:"b",effect:"OF_COURSE",related:true}]});
safe(wise);assert.equal(wise.ok,true);
const bl=tb2eBeginnersLuckShadowPlan({abilityDice:4,helpDice:1,gearDice:1,personaDice:1,traitsDice:1});
safe(bl);assert.equal(bl.preHalving,6);assert.equal(bl.finalPool,5);
const factors=tb2eFactorObstaclePlan({factors:[{category:"base",value:2,additive:false},{category:"other",value:1,additive:true}]});
safe(factors);assert.equal(factors.obstacle,3);assert.equal(factors.sourceFactorCatalogueLookup,false);
assert.equal(tb2eVersusFactorPlan({applicableFactors:2}).successModifier,-2);
assert.equal(tb2eResolveObstacleShadow({dice:[6,5,2],obstacle:2}).outcome,"PASS");
assert.equal(tb2eResolveVersusShadow({dice:[6,5,2],opponentSuccesses:2}).outcome,"TIE");
assert.equal(tb2eTieBreakerPlan({initialSourceKind:"SKILL",beginnersLuckAbility:"WILL",tiebreakRollOutcome:"TIE"}).finalOutcome,"FAIL");
console.log("PASS Package A five-domain cross-regression · DH 58-78, SG 26-38 · no live commits");
