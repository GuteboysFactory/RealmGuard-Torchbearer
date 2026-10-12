import assert from "node:assert/strict";
import {tb2ePackageAProgressAfterTestPlan as progress} from "../module/m10d18-tb2e-package-a-progress-boundary.mjs";
const basic={skillName:"Cook",mode:"SKILL",outcome:"PASS",obstacle:2,
  gmConfirmedLegalTest:true,actingConditions:[],conditionsGmReviewed:true,
  skillAlreadyKnown:true,context:"ADVENTURE"};
const good=progress(basic);
assert.equal(good.ok,true);assert.equal(good.wouldRecordMark,true);
assert.equal(good.proposedMark,"PASS");assert.equal(good.willHealthAdvancementMark,false);
const failed=progress({...basic,outcome:"FAIL"});
assert.equal(failed.proposedMark,"FAIL");
assert.equal(progress({...basic,obstacle:0}).wouldRecordMark,false);
assert.equal(progress({...basic,context:"TOWN",alreadyCountedInContext:true}).wouldRecordMark,false);
const sick=progress({...basic,actingConditions:["SICK"]});
assert.equal(sick.ok,true);assert.equal(sick.wouldRecordMark,false);
assert.equal(sick.reasonCode,"SICK_BLOCKS_ADVANCEMENT_LOGGING");
const tie=progress({...basic,wentToTiebreaker:true});
assert.equal(tie.ok,true);assert.equal(tie.wouldRecordMark,false);
assert.equal(tie.advancementRollRequiresSeparateTieBreakerAbility,true);
const bl={...basic,mode:"BEGINNERS_LUCK",skillAlreadyKnown:false,
  previousLearningAttempts:2,maximumNature:3,currentKnownSkillCount:24};
const first=progress(bl);
assert.equal(first.ok,true,JSON.stringify(first));
assert.equal(first.attemptWouldBeAdded,1);
assert.equal(first.attemptRecorded,false);
assert.equal(first.attemptsAfterPreview,3);
assert.equal(first.readyToLearnAfterPreview,true);
assert.equal(first.learnedRating,2);
assert.equal(first.requiresForgetExistingSkill,true);
assert.equal(first.willHealthAdvancementMark,false);
assert.equal(first.skillLearningCommitted,false);
const failBl=progress({...bl,outcome:"FAIL",previousLearningAttempts:0,maximumNature:4,currentKnownSkillCount:12});
assert.equal(failBl.ok,true);assert.equal(failBl.attemptsAfterPreview,1);
assert.equal(failBl.readyToLearnAfterPreview,false);
const sickBl=progress({...bl,actingConditions:["SICK"]});
assert.equal(sickBl.ok,true);assert.equal(sickBl.attemptRecorded,false);
assert.equal(sickBl.reasonCode,"SICK_BLOCKS_ADVANCEMENT_LOGGING");
const invalid=[
 [{...basic,gmConfirmedLegalTest:false},"GM_MUST_CONFIRM_LEGAL_COMPLETED_TEST"],
 [{...basic,conditionsGmReviewed:false},"GM_ACTING_CONDITIONS_REQUIRED"],
 [{...basic,actingConditions:["DEAD"]},"DEAD_CHARACTER_CANNOT_PROGRESS"],
 [{...basic,skillAlreadyKnown:false},"SKILL_PASS_FAIL_REQUIRES_TRAINED_SKILL"],
 [{...basic,outcome:"TIE"},"UNRESOLVED_TEST_RESULT"],
 [{...bl,skillAlreadyKnown:true},"BEGINNERS_LUCK_REQUIRES_UNTRAINED_SKILL"],
 [{...bl,actingConditions:["AFRAID"]},"AFRAID_BLOCKS_BEGINNERS_LUCK"],
 [{...bl,maximumNature:0},"LEARNING_MAXIMUM_NATURE_ZERO_RETIRED_STATE"],
 [{...bl,previousLearningAttempts:-1},"LEARNING_INVALID_BEGINNERS_LUCK_ATTEMPTS"]
];
for(const [req,reason] of invalid){
 const p=progress(req);assert.equal(p.ok,false,JSON.stringify(p));
 assert.equal(p.reasonCode,reason);assert.equal(p.writesPlanned,0);
}
for(const p of [good,failed,sick,tie,first,failBl,sickBl]){
 assert.equal(p.liveApplication,false);assert.equal(p.writesPlanned,0);
 assert.equal(p.actorWrite,false);
}
console.log("PASS Package A DH75 SG34/51: trained pass/fail vs untrained BL attempts, Sick/Dead/Afraid and tiebreaker limits, 24 Skill cap; no writes");
