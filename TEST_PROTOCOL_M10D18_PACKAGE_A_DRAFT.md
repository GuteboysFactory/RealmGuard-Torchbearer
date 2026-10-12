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
A.wises.rerollPlan("Deeper Understanding",{failedDice:2,fateLuckAlreadyUsed:true}).ok; // true, subject to per-die history verification
A.wises.deeperDiePlan({dice:[{dieId:"a",face:2,alreadyRerolled:true},{dieId:"b",face:3,alreadyRerolled:false}],chosenDieId:"b",fateAvailable:1}).selectedDieId; // "b"
A.wises.deeperDiePlan({dice:[{dieId:"a",face:2,alreadyRerolled:true},{dieId:"b",face:3,alreadyRerolled:false}],chosenDieId:"b",fateAvailable:1,fateLuckAlreadyUsed:true}).ok; // true, chosen b not previously rerolled
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
