import assert from "node:assert/strict";
import {tb2ePackageASynergyAdvancementPlan as plan} from "../module/m10d18-tb2e-package-a-synergy.mjs";
const request={helperId:"ranger",actingCharacterId:"actor",helpRequest:{
  helperRoute:"STANDARD",describedRelevantAction:true,actingPlayerAccepted:true,
  gmApprovedRelevance:true,helpOptions:{
    sourceKind:"skill",sourceName:"Peasant",testName:"Laborer",suggestedHelpSkill:true
  }
},helpingSourceKind:"SKILL",helpingSourceName:"Peasant",gmHelpSourceVerified:true,
 fateAvailable:1,fateCommittedBeforeRoll:true,helperConditions:[],
 helperConditionsGmReviewed:true,helpedTestOutcome:"PASS"};
const safe=p=>{assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);
 assert.equal(p.resourceSpendCommitted,false);assert.equal(p.advancementWrite,false);
 assert.equal(p.gmPermissionAuthenticated,false);};
const good=plan(request);safe(good);assert.equal(good.ok,true,JSON.stringify(good));
assert.equal(good.helperAdvancementSource,"SKILL:Peasant");
assert.equal(good.advancementPreview,"PASS");assert.equal(good.projectedFateCost,1);
assert.equal(good.helperDidContributeInitialHelpDie,true);
const fail=plan({...request,helpedTestOutcome:"FAIL"});safe(fail);
assert.equal(fail.advancementPreview,"FAIL");
const sick=plan({...request,helperConditions:["SICK"]});safe(sick);
assert.equal(sick.ok,true);assert.equal(sick.advancementPreview,null);
assert.equal(sick.noMarkReason,"SICK_BLOCKS_ADVANCEMENT_LOGGING");
const returned=plan({...request,helpedTestOutcome:"TIE",tieDecision:"RETRACT_FATE"});
safe(returned);assert.equal(returned.ok,true);assert.equal(returned.projectedFateRefund,1);
assert.equal(returned.netProjectedFateCost,0);assert.equal(returned.advancementPreview,null);
assert.equal(returned.helperContributesTiebreakerHelpDie,false);
const kept=plan({...request,helpedTestOutcome:"TIE",
 tieDecision:"FOLLOW_TIEBREAKER",gmTiebreakerVerified:true,
 tieBreakerSourceKind:"ABILITY",tieBreakerSourceName:"Will",tieBreakerOutcome:"FAIL"});
safe(kept);assert.equal(kept.ok,true,JSON.stringify(kept));
assert.equal(kept.helperAdvancementSource,"ABILITY:Will");
assert.equal(kept.advancementPreview,"FAIL");
assert.equal(kept.helperContributesTiebreakerHelpDie,false);
for(const [args,reason] of [
 [{...request,helperId:"actor"},"DISTINCT_HELPER_AND_ACTOR_REQUIRED"],
 [{...request,fateAvailable:0},"HELPER_FATE_POINT_REQUIRED"],
 [{...request,fateCommittedBeforeRoll:false},"SYNERGY_FATE_MUST_BE_COMMITTED_BEFORE_ROLL"],
 [{...request,gmHelpSourceVerified:false},"GM_HELP_SKILL_OR_ABILITY_VERIFICATION_REQUIRED"],
 [{...request,helpingSourceName:"Laborer"},"HELPING_ADVANCEMENT_MUST_MATCH_ACTUAL_HELP_SOURCE"],
 [{...request,helpingSourceKind:"ABILITY"},"HELPING_ADVANCEMENT_MUST_MATCH_ACTUAL_HELP_SOURCE"],
 [{...request,helperConditionsGmReviewed:false},"GM_HELPER_CONDITIONS_REQUIRED"],
 [{...request,helperConditions:["AFRAID"]},"AFRAID_BLOCKS_HELP"],
 [{...request,helperConditions:["DEAD"]},"DEAD_HELPER_CANNOT_USE_SYNERGY"],
 [{...request,helpedTestOutcome:"TIE"},"SYNERGY_TIE_DECISION_REQUIRED"],
 [{...request,helpedTestOutcome:"TIE",tieDecision:"FOLLOW_TIEBREAKER"},"GM_TIEBREAKER_SOURCE_REQUIRED"],
 [{...request,helpedTestOutcome:"TIE",tieDecision:"FOLLOW_TIEBREAKER",gmTiebreakerVerified:true,
    tieBreakerSourceKind:"ABILITY",tieBreakerSourceName:"Will"},"TIEBREAKER_OUTCOME_REQUIRED"],
 [{...request,helpedTestOutcome:"TIE",tieDecision:"RETRACT_FATE",gmTiebreakerVerified:true},"RETRACT_FATE_CANNOT_MARK_TIEBREAKER"],
 [{...request,tieDecision:"RETRACT_FATE"},"TIEBREAKER_METADATA_WITHOUT_TIE"],
 [{...request,helpRequest:{...request.helpRequest,actingPlayerAccepted:false}},"HELP_ACTING_PLAYER_DID_NOT_ACCEPT_HELP"],
 [{...request,helpRequest:{...request.helpRequest,helpOptions:{...request.helpRequest.helpOptions,sourceName:"Cook"}}},"HELP_NOT_LISTED_AS_SUGGESTED_HELP"]
]){
 const p=plan(args);safe(p);assert.equal(p.ok,false,JSON.stringify(p));assert.equal(p.reasonCode,reason,JSON.stringify(p));
}
console.log("PASS Package A SG87: Help Synergy Fate prepaid, helping-source advancement, Sick/Help limits, ties with refund or tiebreaker; zero writes");
