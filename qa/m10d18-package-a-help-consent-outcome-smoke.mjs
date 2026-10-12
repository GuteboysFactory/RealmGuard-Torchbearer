import assert from "node:assert/strict";
import {tb2eHelpParticipationPlan as participation, tb2eHelpGroupOutcomePlan as group,
  tb2eHelpConsequencePlan as legacy, tb2eHelpPlan, tb2eConflictHelpPlan,
  tb2eBeginnersLuckHelpPlan} from "../module/m10d-tb2e-help-shadow.mjs";
import {resolveRulesProfile} from "../module/rules-profile-service.mjs";
const ids=["realm-guard-legacy-mixed","realm-guard-strict","mg1e","mg2e"];
const baseline=JSON.stringify(ids.map(id=>resolveRulesProfile(id)));
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);};
const sample={sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true};
for(const [options,reason] of [
  [{actingPlayerAccepted:true,gmApprovedRelevance:true,helpOptions:sample},"RELEVANT_HELP_ACTION_REQUIRED"],
  [{describedRelevantAction:true,gmApprovedRelevance:true,helpOptions:sample},"ACTING_PLAYER_DID_NOT_ACCEPT_HELP"],
  [{describedRelevantAction:true,actingPlayerAccepted:true,helpOptions:sample},"GM_MUST_VALIDATE_HELP_RELEVANCE"],
  [{describedRelevantAction:true,actingPlayerAccepted:true,gmApprovedRelevance:true,helpOptions:{sourceKind:"skill",sourceName:"Fighter",testName:"Cook",sameSkill:true}},"SAME_SKILL_SOURCE_MISMATCH"]
]){const p=participation(options);safe(p);assert.equal(p.reasonCode,reason);}
const yes=participation({describedRelevantAction:true,actingPlayerAccepted:true,gmApprovedRelevance:true,helpOptions:sample});
safe(yes);assert.equal(yes.ok,true);assert.equal(yes.dice,1);assert.equal(yes.helpDieCommitted,false);
const pass=group({outcome:"PASS"});safe(pass);assert.equal(pass.primaryCharacterSharesSuccess,true);
const twist=group({outcome:"TWIST",helperIsWiseAid:true});safe(twist);assert.equal(twist.allParticipantsAffectedByTwist,true);
assert.equal(group({outcome:"CONDITION"}).reasonCode,"PRIMARY_CONDITION_REQUIRED");
assert.equal(group({outcome:"PASS",primaryCondition:"AFRAID"}).reasonCode,"PRIMARY_CONDITION_ONLY_ON_CONDITION_OUTCOME");
const afraid=group({outcome:"CONDITION",primaryCondition:"AFRAID"});safe(afraid);
assert.equal(afraid.helperConsequence,"GM_CHOSES_LESSER_CONDITION");
const hungry=group({outcome:"CONDITION",primaryCondition:"HUNGRY_AND_THIRSTY"});safe(hungry);
assert.equal(hungry.helperConsequence,"HUNGRY_AND_THIRSTY");
assert.equal(group({outcome:"CONDITION",primaryCondition:"HUNGRY_AND_THIRSTY",helperHasSelectedCondition:true}).helperConsequence,"NO_ADDITIONAL_CONDITION");
assert.equal(group({outcome:"CONDITION",primaryCondition:"AFRAID",helperIsWiseAid:true}).helperConsequence,"WISE_AID_EXEMPT");
assert.equal(group({outcome:"CONDITION",primaryCondition:"AFRAID",helperIsWiseAid:true}).helperTwistRisk,true);
assert.equal(legacy({testFailed:true,conditionApplied:true,everyoneHungryChosen:true,primaryCondition:"INJURED"}).reasonCode,"HUNGRY_GROUP_RULE_REQUIRES_PRIMARY_HUNGRY_AND_THIRSTY");
assert.equal(legacy({testFailed:true,conditionApplied:true,everyoneHungryChosen:true}).reasonCode,"HUNGRY_GROUP_RULE_REQUIRES_PRIMARY_HUNGRY_AND_THIRSTY");
assert.equal(legacy({testFailed:true,conditionApplied:true,primaryCondition:"HUNGRY_AND_THIRSTY"}).helperConsequence,"HUNGRY_AND_THIRSTY");
for(const p of [
  tb2eHelpPlan({...sample,context:"TIEBREAKER"}),
  tb2eBeginnersLuckHelpPlan({sourceKind:"ability",sourceName:"Will",targetSkillName:"Cook",context:"TIEBREAKER"}),
  tb2eConflictHelpPlan({partySize:4,helperHasRoundAction:false,hasRequiredSkill:true,context:"TIEBREAKER"}),
]){safe(p);assert.equal(p.reasonCode,"TIEBREAKER_HELP_FORBIDDEN");}
assert.equal(tb2eHelpPlan({sourceKind:"skill",sourceName:"Cook",testName:"Cook",actingOnInstinct:true,helperActingOnInstinct:true}).reasonCode,"INSTINCT_HELP_SOURCE_NOT_ELIGIBLE");
assert.equal(tb2eHelpPlan({sourceKind:"skill",sourceName:"Cook",testName:"Cook",actingOnInstinct:true,helperActingOnInstinct:true,helperSimilarInstinct:true}).ok,true);
assert.equal(JSON.stringify(ids.map(id=>resolveRulesProfile(id))),baseline);
console.log("PASS M10D.18 Package A · SG33 tiebreaker excludes Help · SG36 player consent · SG38 consequences / Wise aid · zero writes");
