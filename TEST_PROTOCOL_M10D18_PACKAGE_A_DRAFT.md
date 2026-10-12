# Realm Guard / Torchbearer — Package A consolidated Foundry 13.351 QA (DRAFT)

**Status:** STAGED ONLY. Do not run before verified QA release is published.  
**Baseline:** stable v1.12.0; latest published QA v1.13.0-qa.29.  
**Branch:** qa/m10d18-full-reaudit-package-a (draft PR #14).

## Safety prerequisites
Use a copy of the test World. Do not switch Rules Profiles, reactivate M11, disable the global kill switch, or edit live campaign documents to make a planner work. Legacy Mixed must remain the sole live authority; TB2E CORE is shadow/read-only.

## Gate A — Isolation, identity and no writes
1. In Foundry v13.351 as GM, confirm world and character sheets load normally. In console:
   `game.realmGuard.core.m10d.getStatus()`
2. Expected: `profileId === "torchbearer2e"`, `liveIntegrationPaused === true`, `activationAllowed === false`, `existingShadowReauditRequired === true`, `writes.actors === 0`. No profile conversion or roll engine swap.
3. Snapshot one Actor's Nature, Skill advancements, Fate/Persona and Conditions. Repeat read-only calls below; verify values unchanged on reload.

## Gate B — Tests / Help and 33-skill reference
Use console (read-only):
```js
const A = game.realmGuard.core.m10d;
A.abilities.skillIndex().skillCount; // 33
A.abilities.skillSourceEntry({skillName:"Cook"}).suggestedHelp; // ["Alchemist","Laborer"]
A.help.suggestedSkillPlan({testSkillName:"Cook",helperSkillName:"Hunter"}).ok; // false
A.help.suggestedSkillPlan({testSkillName:"Cook",helperSkillName:"Laborer"}).ok; // true
A.help.beginnersLuckPlan({sourceKind:"skill",sourceName:"Cook",targetSkillName:"Cook",helperSkillTrained:true}).ok; // true
A.help.beginnersLuckPlan({sourceKind:"ability",sourceName:"Health",targetSkillName:"Cook"}).ok; // false
A.help.beginnersLuckPlan({sourceKind:"ability",sourceName:"Will",targetSkillName:"Cook"}).ok; // true
A.tests.factorObstaclePlan({factors:[{category:"base",value:2,additive:false},{category:"extra",value:1,additive:true}]}).obstacle; // 3
A.tests.versusFactorPlan({applicableFactors:2}).successModifier; // -2
A.tests.tieBreakerPlan({initialSourceKind:"SKILL",beginnersLuckAbility:"WILL"}).noHelpAllowed; // true
A.tests.environmentalFactorPlan({light:"DIM_LIGHT",testMode:"OBSTACLE"}).obstacleIncrease; // 1
A.tests.environmentalFactorPlan({light:"DARKNESS",testMode:"VERSUS",actionPossibleInDarkness:true}).successModifier; // -1
A.help.plan({sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true,context:"TIEBREAKER"}).ok; // false
A.help.participationPlan({describedRelevantAction:true,actingPlayerAccepted:true,gmApprovedRelevance:true,helpOptions:{sourceKind:"skill",sourceName:"Cook",testName:"Cook",sameSkill:true}}).ok; // true
A.help.groupOutcomePlan({outcome:"CONDITION",primaryCondition:"HUNGRY_AND_THIRSTY"}).helperConsequence; // "HUNGRY_AND_THIRSTY"
A.help.groupOutcomePlan({outcome:"CONDITION",primaryCondition:"AFRAID",helperIsWiseAid:true}).helperConsequence; // "WISE_AID_EXEMPT"
```
Legacy `factorObstaclePlan` still accepts GM-supplied values. The **new** source-bound planner below verifies the exact DH category/value selection without granting game-rule permission:

```js
A.abilities.numericalFactorStatus().skillCount; // 33
A.abilities.numericalFactorEntry({skillName:"Hunter",tableName:"stalking"}).sourcePage; // 166
A.tests.sourceBoundFactorPlan({skillName:"Hunter",tableName:"stalking",gmAuthorized:true,selections:{habits:"trails",rarity:"rare_shy"}}).obstacle; // 3
A.tests.sourceBoundFactorPlan({skillName:"Sailor",tableName:"sailing",gmAuthorized:true,selections:{craft:"raft_skiff",waters:"known",season:"summer",weather:"calm"}}).ok; // false: craft/crew unconfirmed
A.tests.sourceBoundFactorPlan({skillName:"Sailor",tableName:"sailing",gmAuthorized:true,selections:{craft:"raft_skiff",waters:"known",season:"summer",weather:"calm"},preconditionFacts:{hasCraftOrCrew:true}}).obstacle; // 3
A.tests.sourceBoundFactorPlan({factorMode:"FORMULA",skillName:"Rider",tableName:"training",gmAuthorized:true,beastNature:3,use:"war"}).obstacle; // 6
A.tests.sourceBoundFactorPlan({factorMode:"FORMULA",skillName:"Scholar",tableName:"scribe",gmAuthorized:true,highestSpellScribingObstacle:6,spellCount:3}).obstacle; // 8 (source-listed scribing Ob6 +2, not spell circle)
A.tests.sourceBoundFactorPlan({skillName:"Arcanist",tableName:"spells",gmAuthorized:true}).reasonCode; // "EXTERNAL_RULE_ENTRY_REQUIRED"
A.tests.sourceBoundFactorPlan({skillName:"Fighter",tableName:"brawl",gmAuthorized:true}).reasonCode; // "VERSUS_TEST_REQUIRED"
```

Values come from DH 160–176, but spell/Versus routing and all fictional permission must still be adjudicated by the GM. No numeric data is applied to a live Actor or roll.

## Gate C — Wises / Nature / Skills
```js
A.wises.combinationPlan({knownWises:2,uses:[{wiseId:"cooking-wise",effect:"I_AM_WISE",related:true},{wiseId:"bread-wise",effect:"OF_COURSE",related:true}]}).ok; // true
A.wises.rerollPlan("Deeper Understanding",{failedDice:2,fateLuckAlreadyUsed:true}).ok; // false: SG87 requires before Fate Luck
A.wises.deeperDiePlan({dice:[{dieId:"a",face:2,alreadyRerolled:true},{dieId:"b",face:3,alreadyRerolled:false}],chosenDieId:"b",fateAvailable:1}).selectedDieId; // "b"
A.wises.deeperDiePlan({dice:[{dieId:"a",face:2,alreadyRerolled:true},{dieId:"b",face:3,alreadyRerolled:false}],chosenDieId:"b",fateAvailable:1,fateLuckAlreadyUsed:true}).ok; // false: Deeper must come before Fate Luck
A.wises.deeperDiePlan({dice:[{dieId:"a",face:2,alreadyRerolled:true},{dieId:"b",face:3,alreadyRerolled:false}],chosenDieId:"a",fateAvailable:1}).ok; // false
A.nature.recoveryPlan({method:"CONSERVE",currentNature:2,maximumNature:5}).eraseNatureAdvancementRequired; // true
A.nature.recoveryPlan({method:"RESPITE",currentNature:0,maximumNature:0}).ok; // false
A.nature.recoveryPlan({method:"RESPITE",currentNature:0,maximumNature:4}).reasonCode; // "NATURE_ZERO_TAX_LOSS_MUST_RESOLVE_FIRST"
A.abilities.advancementThresholdPlan({kind:"SKILL",rating:6}).atCap; // true
A.abilities.advancementThresholdPlan({kind:"SKILL",rating:6,heroicRatingSevenUnlocked:true}).advanceTo; // 7
A.abilities.advancementThresholdPlan({kind:"WILL",rating:6,heroicRatingSevenUnlocked:true}).advanceTo; // 7
A.tests.resolveObstacle({dice:[3,3,4],obstacle:2}).outcome; // "FAIL" (normal TN4)
A.tests.resolveObstacle({dice:[3,3,4],obstacle:2,sourceKind:"SKILL",heroicTn3BenefitUnlocked:true}).outcome; // "PASS" (DH72 explicit benefit)
A.tests.resolveVersus({dice:[3,3,4],opponentSuccesses:2,sourceKind:"HEALTH",heroicTn3BenefitUnlocked:true}).outcome; // "PASS"
A.abilities.skillSourceEntry({skillName:"Armorer"}).suggestedHelp; // ["Smith","Laborer"]
A.wises.languageRetentionPlan({peopleWise:true,wiseChanged:true,retainLanguage:true,languageRecordedWithLevelBenefit:false}).retentionStatus; // "PENDING_RECORD"
A.wises.communicationPlan({peopleWiseApplies:false,otherCommunicationMethod:false}).canCommunicate; // false
A.nature.descriptorContextPlan({stock:"dwarf",descriptor:"Avenging Grudges",gmConfirmsRelevance:true}).ok; // false: written goal required
A.nature.descriptorContextPlan({stock:"dwarf",descriptor:"Avenging Grudges",gmConfirmsRelevance:true,writtenGrudgeGoal:true}).ok; // true
A.nature.descriptorContextPlan({stock:"halfling",descriptor:"Merrymaking",gmConfirmsRelevance:true,merrymakingGroupSize:3,merrymakingTargetCondition:"ANGRY"}).recommendedGroupObstacleIncrease; // 1 (GM guidance only)
```
Confirm each plan advertises read-only, no actual dice rolls, zero resource spending and no document writes. Wise identity/relevance and Nature descriptors are GM supplied and must not be treated as verified Actor facts.

## Gate D — Historical regression and reload
1. Use the existing **Legacy Mixed** live test roller with ordinary Skill, Versus and Beginner's Luck tests; check existing chat presentation and normal advancement behavior against QA.29.
2. Check representative previous P2 and P3 read-only APIs (Traits/Armor/Conflict/Magic; Resources/Conditions/Recovery/Inventory/Session/Circles/Scales/Creation).
3. Use one player client if possible, reload GM/player, re-open character sheets and re-run Gates A–C.
4. No script errors, profile changes, system settings modifications, new Actor/Item/Journal records or unexpected character changes.

**Acceptance:** Report PASS/FAIL for A–D and any console errors. A domain remains OPEN if its source-to-rule exceptions are not fully covered by the delivered package. No FULLY_REAUDITED status or M11 authorization is inferred merely from this test.


## Additional Package A consolidated scenario gate (staged until release)

After the other tests in Gate B, use this **read-only** scenario to validate that a complete GM selection combines multiple systems consistently:

```js
const gearA={hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
  dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,
  suppliesUsed:1,gearUsed:0};
const scenario=A.tests.scenarioPlan({
  skillName:"Cook",mode:"SKILL",rating:4,
  factor:{tableName:"meals",gmAuthorized:true,
    selections:{ingredients:"fresh",amount:"small_group"}},
  environment:{light:"DIM_LIGHT",additionalGmHindrances:0},
  equipment:gearA,allModifiersGmReviewed:true,
  actingCharacterId:"qa-acting-character",actingConditions:[],conditionsGmReviewed:true
});
[scenario.ok,scenario.obstacle,scenario.finalDicePool,scenario.sourceFactorPage];
// [true,3,5,163]
```

An absent additive category must now fail with `ADDITIVE_FACTOR_CONFIRMATION_REQUIRED`. A non-applicable additive category may be omitted **only with** an explicitly declared `gmExcludedAdditives` list and `gmExclusionReason`. Omitting optional Survivalist camp amenities requires neither. Any `preconditionFacts` containing `skillName`, `tableName` or `gmAuthorized` must be rejected.

The scenario is **not an Actor lookup or authorization** and commits no dice, conditions, resource spending or advancement. Report it alongside the existing A–D gates during the one combined Foundry session, not in a separate micro-test.


### Condition and Nature cross-domain boundary (SG pp.46-52; DH p.59)

For the exact `scenario` shown above, `actingConditions:[]` explicitly means the GM reviewed and confirmed **no Conditions**. Removing `conditionsGmReviewed:true` must return `CONDITION_GM_ACTING_CONDITIONS_REQUIRED`. These are input assertions, **not** genuine document reads.

```js
A.tests.scenarioPlan({
  skillName:"Cook",mode:"SKILL",rating:4,
  factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"small_group"}},
  environment:{light:"DIM_LIGHT",additionalGmHindrances:0},
  equipment:gearA,allModifiersGmReviewed:true,
  actingCharacterId:"qa-acting-character",actingConditions:["INJURED","SICK"],conditionsGmReviewed:true
}).finalDicePool; // 3 (-2D from stacked conditions)
A.tests.scenarioPlan({
  skillName:"Cook",mode:"SKILL",rating:4,
  factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"small_group"}},
  environment:{light:"DIM_LIGHT",additionalGmHindrances:0},
  equipment:gearA,allModifiersGmReviewed:true,
  actingCharacterId:"qa-acting-character",actingConditions:["ANGRY"],conditionsGmReviewed:true,
  gmAngryObstacleDecision:"APPLY"
}).conditionObstacleIncrease; // 1, explicitly GM-selected option
```

Check also that Afraid rejects Beginner's Luck; an Afraid helper cannot contribute ordinary Help; an Angry character cannot give beneficial Wise aid or use beneficial traits; Dead characters cannot test or help; Fresh contributes at the post-halving step in Beginner's Luck. Channeled Nature requires confirmed current/maximum Nature, Persona availability, exact test name and matching added dice, and reports possible Nature tax without applying it. An exhausted Instinct requires a spent turn and adds +1 Ob. Recovery, conflict and Versus are **not** supported by the independent scenario preview. Do not use this draft protocol until the combined QA release is approved.


### Post-test advancement preview (within the same consolidated Gate C)

```js
A.tests.progressAfterTestPlan({
 skillName:"Cook",mode:"SKILL",outcome:"PASS",obstacle:2,
 skillAlreadyKnown:true,gmConfirmedLegalTest:true,
 actingConditions:[],conditionsGmReviewed:true
}).proposedMark; // "PASS" (preview only)
A.tests.progressAfterTestPlan({
 skillName:"Cook",mode:"BEGINNERS_LUCK",outcome:"FAIL",
 skillAlreadyKnown:false,gmConfirmedLegalTest:true,
 actingConditions:[],conditionsGmReviewed:true,
 previousLearningAttempts:2,maximumNature:3,currentKnownSkillCount:24
}).requiresForgetExistingSkill; // true (learned rating 2, no Will/Health mark)
A.tests.progressAfterTestPlan({
 skillName:"Cook",mode:"SKILL",outcome:"PASS",obstacle:2,
 skillAlreadyKnown:true,gmConfirmedLegalTest:true,
 actingConditions:["SICK"],conditionsGmReviewed:true
}).wouldRecordMark; // false
```

Also verify SG52: Skill rating 1 with Injured (or rating 2 with Sick + Injured) returns `CONDITION_ZERO_RATED_SKILL_CANNOT_TEST` from `tests.scenarioPlan`, even when equipment, Help or Persona would otherwise supply dice. These remain **pure previews**. Confirm no log, Actor write, new Skill, resource deduction or roll is performed.


### Integrated plain-D6 outcome / advancement gate (staged, not runnable as live dice)

This supplements Gate B and C in the **same** eventual Foundry test, not as a separate micro-gate. Construct `scenarioInput` with all explicitly GM-reviewed Conditions, tools, light and factor selections as already shown, then:

```js
const scenarioInput={
  skillName:"Cook",mode:"SKILL",rating:4,
  factor:{tableName:"meals",gmAuthorized:true,selections:{ingredients:"fresh",amount:"one"}},
  equipment:{hasSkill:true,carriesBackpackOrSatchel:true,borrowedTools:false,
    dwarvenCraftingNature:false,isCraftingTest:false,toolsInadequate:false,
    suppliesUsed:1,gearUsed:0},
  environment:{light:"CLEAR",additionalGmHindrances:0},
  allModifiersGmReviewed:true,actingCharacterId:"qa-actor",
  actingConditions:[],conditionsGmReviewed:true
};
A.tests.outcomeAndProgressPlan({
  scenarioInput,dice:[1,2,3,4,2],gmDiceReviewed:true,
  gmConfirmsNoRerolls:true,progressFacts:{
    skillAlreadyKnown:true,gmConfirmedLegalTest:true,context:"ADVENTURE"
  }
}).advancementPreview.proposedMark; // "PASS"
A.tests.outcomeAndProgressPlan({
  scenarioInput,dice:[1,2,3,4],gmDiceReviewed:true,
  gmConfirmsNoRerolls:true
}).reasonCode; // "SUPPLIED_DICE_DO_NOT_MATCH_SCENARIO_POOL"
```

The provided D6s are **not actually rolled or imported from Foundry**. No Fate Luck or Wise reroll history is accepted by this limited preview; set `gmConfirmsNoRerolls:true` only for a genuinely plain pool. Treat all proposed marks as uncommitted. This does not authenticate the GM, Actor, class benefits or dice and does not authorize a QA release.


### Reward event chronology and Synergy (additional checks within combined Gate B/C)

For the already configured `scenarioInput` (with Cook, Skill rating 4, tool +1D, Ob 1), verify the *read-only* reward sequence:

```js
A.tests.rewardedRollHistoryPlan({
  scenarioInput,
  initialDice:[{dieId:"a",face:6},{dieId:"b",face:2},
    {dieId:"c",face:3},{dieId:"d",face:4},{dieId:"e",face:5}],
  rewardEvents:[
    {type:"DEEPER_UNDERSTANDING",wiseId:"cook-wise",related:true,dieId:"b",newFace:6},
    {type:"OF_COURSE",wiseId:"bread-wise",related:true,
      rerolls:[{dieId:"c",face:5}]},
    {type:"FATE_LUCK",rounds:[
      [{dieId:"luck1",parentDieId:"a",face:6},
       {dieId:"luck2",parentDieId:"b",face:4}],
      [{dieId:"luck3",parentDieId:"luck1",face:5}]
    ]}
  ],
  fateAvailable:2,personaAvailable:1,
  gmDiceReviewed:true,gmEventHistoryReviewed:true
}).finalDiceCount; // 8
```

Provide all results as GM assertions; no real Foundry D6 are rolled, no history is authenticated and the projected resource costs are never committed. Exercise failed-parent-six, duplicate-ID, insufficient Fate and post-Luck Wise rejections. For Synergy use `A.tests.synergyAdvancementPlan` with a valid accepted Help request, Fate paid before the test, and a helper source distinct from the acting character. On tie the Helper chooses either retracted Fate (no mark) or keeps Fate to mark the GM-verified tiebreaker ability/Skill without adding a tiebreaker Help die (SG p.87). Test Sick helper no-mark and Afraid helper forbidden. This remains a single comprehensive Foundry acceptance, never a small patch gate.


### Persona cross-source budget (inside combined Gate B/C, SG p.88)

On the **same** read-only Cook source scenario with exactly five non-Persona base dice, add `bonuses:{personaDice:1}` and a **sixth** explicit D6. In `A.tests.outcomeAndProgressPlan`, omit `personaAvailableAtRollStart`: it must reject `PERSONA_START_BALANCE_REQUIRED_FOR_PRE_ROLL_SPENDING`. Set it to 0: reject `INSUFFICIENT_PERSONA_BEFORE_ROLL`. Set it to 1: the plain preview may proceed while `personaStartingBalanceAuthenticated` remains false.

For `A.tests.rewardedRollHistoryPlan`, confirm that `personaAvailable:1` together with `personaDice:1` and a subsequent `OF_COURSE` yields `INSUFFICIENT_PERSONA`; `personaAvailable:2` allows the *GM-declared* combined cost and exposes `projectedPersonaTotalCost:2`. With `bonuses:{channeledNatureDice:3}` plus source-valid Nature context, the starting budget must include the additional 1 Persona Channel cost. Reject 4 Advantage dice (`PERSONA_ADVANTAGE_MAXIMUM_THREE_DICE`). Duplicate Wise names differing only in spaces or letter case must be rejected on the same test.

These are GM-supplied *start-of-test balances*, not verified live Actor funds. Confirm no resource spends, rolls or mutation.
