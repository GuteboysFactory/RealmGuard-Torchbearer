# Realm Guard / Torchbearer — Package A consolidated Foundry 13.351 QA (DRAFT)

**Status:** DRAFT / NOT RUN. Full acceptance uses an unpublished final candidate in an isolated copy of the test World BEFORE any release.
**Baseline:** stable v1.12.0; latest published QA v1.13.0-qa.29.  
**Branch:** qa/m10d18-full-reaudit-package-a (draft PR #14).

## Current entry and completion gates

Use the five-gate checklist in [M10D18_PACKAGE_A_WORKING_AUDIT.md](M10D18_PACKAGE_A_WORKING_AUDIT.md#current-closure-checklist--2026-10-12) as the completion authority. G1-G3 must be ready for FINAL acceptance; early diagnostics are partial and cannot close G4. This is one consolidated A-D acceptance, not a release gate per small patch.

**Ordering:** finish scoped integration/source/evidence requirements → create an unpublished candidate from an exact source commit → install only in an isolated test data directory and copied World → execute ALL A-D cases → final reproducibility/safety review → protected release decision. Do not publish QA or modify production to make testing possible. Published QA.29 and stable remain untouched. Never infer installed candidate identity from version text alone: record Git SHA, artifact hash and actual installed source identity.

For the test report, record candidate/source SHA, archive SHA-256, installed-source verification, Foundry13.351 build, GM/player/browser identities, baseline QA.29 control, scenario/Actor/Item/message IDs, A-D results, all unexpected errors and before/after values. Missing/unfinished required cases are OPEN or FAIL, not PASS. The same version label as published QA.29 does not make the candidate that release.

Separate **manual fixture preparation**, **read-only API calls** and **Legacy control gameplay** in the report. Snapshots for zero-write checks start after fixtures are prepared. Read-only CORE calls must have zero Actor/Item/Journal/Settings/resource/rating/counter changes and no RNG/spend. Legacy control rolls may perform their normal Legacy-owned mutations; compare these with the separate published QA.29 control and reject extra CORE-origin writes or behavior differences. No live campaign documents are used.

Old HTML-only cards are not historical roll evidence. G3 needs prospective records and a documented trust model. Do not retrofit current Actor values or parsed HTML as verified pre-roll facts. Authentication and FULLY_REAUDITED flags stay unconfirmed until their actual requirements have been demonstrated.

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


## Additional Package A consolidated scenario gate (inside unpublished-candidate acceptance)

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

Check also that Afraid rejects Beginner's Luck; an Afraid helper cannot contribute ordinary Help; an Angry character cannot give beneficial Wise aid or use beneficial traits; Dead characters cannot test or help; Fresh contributes at the post-halving step in Beginner's Luck. Channeled Nature requires confirmed current/maximum Nature, Persona availability, exact test name and matching added dice, and reports possible Nature tax without applying it. An exhausted Instinct requires a spent turn and adds +1 Ob. Recovery, conflict and Versus are **not** supported by the independent scenario preview. Use this protocol only for the isolated unpublished candidate; release remains blocked until the complete source/evidence/runtime and protected release gates pass.


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


When the scenario channels Nature, deliberately set `channelNatureFacts.personaAvailable` to a different value from `personaAvailableAtRollStart` (plain chain) or `personaAvailable` (reward chain). Both must fail with `NATURE_PERSONA_BALANCE_MISMATCH` before any result is authorized. They do not read the actual Actor.

### Current Actor / GM / saved D6 provenance — integrate into Gates A-D (v13.351; NOT RUN)

This is part of the same consolidated acceptance, not a separate publication gate. Record Foundry build, browser, user IDs, Actor/message IDs, exact tested commit and console errors. Record before/after Actor, Item, Journal, Settings and reward values; they must remain unchanged.

1. Gate A: as a player call `A.tests.documentEvidence({actorId,messageId})`: expect `CURRENT_SESSION_GM_REQUIRED` and no document data. Repeat as an active GM on a world character. Confirm `currentSessionGmObserved:true`; all historical/authentication flags remain false. Confirm CORE stays unavailable for live selection, Legacy Mixed live, kill switch ENGAGED and M11 PAUSED.
2. Gate B: prepare one existing ordinary Skill scenario with no helpers, Nature, Heroic or bonus dice. Use a character with exactly one Cook role at rating 4 and source-valid tool +1D/Ob1. Use a GM-created ordinary `5d6` ChatMessage, linked to that world Actor without scene/token speaker. It is a manual test fixture; the adapter must not create or evaluate a Roll. Call `A.tests.documentEvidence({actorId,messageId})`; compare five saved faces and unique IDs to the native message. Check detached/frozen data, current rewards only, `rollTimeActorStateVerified:false` and `historicalRewardBalanceVerified:false`.
3. Gate B/C: call `A.tests.documentOutcomePlan({actorId,messageId,scenarioInput})` where actingCharacterId is the exact world Actor ID, current role rating and all active conditions match. Compare the computed successes (TN4), source Ob and outcome to saved native faces. Expected `currentActorScenarioMatched:true`; no advancement preview. Change scenario rating/Actor ID or omit an active condition: reject. Test a changed current Actor after the roll: the adapter must expose current state only, never claim it was the historical state.
4. Gate C: reject hidden/unreadable messages, missing/foreign documents, player authors lacking current OWNER, token/scene speakers, synthetic Actors, duplicate Cook roles, Strained/Tired CORE ambiguity, multiple Rolls, unevaluated Rolls, non-D6 terms, modifiers, inactive/rerolled/exploded dice and altered totals. An HTML-only Legacy roll has no accepted native Roll: `SINGLE_NATIVE_ROLL_REQUIRED`; log this compatibility gap. Fate/Persona bonuses, Nature Channel, BL, helpers/Wise aid and Heroic entitlement are outside this bridge and must fail closed. Existing GM-asserted Wise/Fate planners retain their separate unauthenticated status.
5. Gate D: run GM/player clients together, check no socket/write/spend/advancement changes, no private dice leakage, no authority changes and no duplicate runtime hooks. Re-run complete A-D acceptance for existing Package A scenarios. Attach results and failures before claiming Foundry acceptance.

Status: automated mocks only until this checklist is executed in Foundry v13.351. No server attestation, immutable historical ledger or full-domain certification is claimed. Release remains blocked; 0/14 FULLY_REAUDITED.

### Saved Wise/Fate event results — combined Gates B/C/D, v13.351 (NOT RUN)

Use the same GM/player world character, ordinary Cook rating-4/tool+1D/Ob1 fixture as the current-document gate. Add two actual Wise Items with different subjects and record their Item IDs. Prepare existing native plain-D6 ChatMessages for base (5d6), Deeper (1d6), Of Course (one D6 per remaining failed base die), then Luck (one new die per six, with a separate message for each subsequent six round). Each speaker must be that world Actor without scene/token; author must match; record exact message timestamps and reject ambiguous/tied ordering. Manual fixture preparation is separate from the API; the API never rolls or creates messages.

Read base evidence to obtain exact `dieId` values (`messageId:0:0:index`). Supply only message references and semantic target/parent links:

```js
A.tests.documentRewardHistoryPlan({
  actorId, initialMessageId, scenarioInput,
  gmEventLinksReviewed:true,
  fateAtRollStartGmAsserted:2, personaAtRollStartGmAsserted:1,
  events:[
    {type:"DEEPER_UNDERSTANDING",messageId:deeperMessageId,
      wiseItemId:firstWiseItemId,related:true,targetDieId:failedBaseDieId},
    {type:"OF_COURSE",messageId:ofCourseMessageId,
      wiseItemId:secondWiseItemId,related:true,targetDieIds:remainingFailedDieIds},
    {type:"FATE_LUCK",rounds:[
      {messageId:luckMessageId,parentDieIds:sixDieIds}
      // Add a round for EACH remaining six, until no six remains.
    ]}
  ]
});
```

For deterministic recorded faces base [6,2,3,4,5], Deeper replaces the 2 with 6, Of Course replaces the 3 with 5, first Luck results [6,4], second Luck result [5]: expect 8 final successes, 2 Fate and 1 Persona projected; no spend, advancement or learning. Link Luck parent IDs to the initial two sixes, then the first Luck six. Inspect returned `eventEvidence` to relate the Deeper/Of Course result-message die IDs to their targeted original die IDs.

Gate C rejection cases: extra caller faces/newFace/result/progress fields; unowned Wise Item; duplicate normalized Wise subjects; Angry actor using either Wise effect (SG47); repeated/reused message; different author/Actor; unreadable/deleted message; missing/equal/reversed timestamps; modified native die; target not a failed original die; incomplete Of Course failed set; fake/extra parent six, unfinished or extra Luck round; insufficient/omitted GM-declared historical balance; Wise after Luck. Angry ordinary Luck without Wise remains permitted if the rest of the scenario is legal.

Gate D: use both GM/player clients, verify player denial before data reads, no private result leakage, no RNG/socket/document/resource mutations and no live authority changes. Change current Fate/Persona independently of declared historical start values: current balances must remain observation only. Returned `historicalRewardBalanceVerified`, `rollTimeActorStateVerified`, `immutableChronologyVerified`, `completeTestHistoryVerified`, `rollSourceAuthenticated`, `actorSourceAuthenticated` and `gmPermissionAuthenticated` stay false. Editing a saved message changes later observations, not an immutable historical ledger; previously returned frozen evidence must remain detached.

Status: mock/automated coverage only; real Foundry v13.351 combined acceptance NOT RUN. The same-test association, fictional Wise relatedness, parent/target associations and historical resources remain GM assertions. Legacy HTML-only cards remain rejected. Keep release blocked and 0/14 FULLY_REAUDITED until all full gates actually pass.

### Current participant Actor facts — combined Gates A-D, v13.351 (NOT RUN)

Keep this within the SAME complete Package A acceptance. Record exact commit/build/user IDs, acting/helper/Wise-helper Actor IDs, selected Item IDs, conditions, pool inputs, native saved message ID/faces and all before/after documents/resources. `A.tests.actorEvidence({actorId})` must reject a player before reading Actor data; a current active GM may observe scalar snapshots only. No helper consent or historical state is authenticated.

Gate B ordinary Skill: acting Cook rating4, tool/supplies +1D as in the existing source scenario; actual helper Cook Item rating3; distinct Wise helper with one actual Wise Item. Reviewed, accepted ordinary Help and related Wise aid add 1D each. Use a saved native 7d6 message linked to the world acting Actor; the API must not create or evaluate it. Call:

```js
A.tests.participationOutcomePlan({
  actorId, messageId, scenarioInput,
  helpSourceItemId, wiseAidItemId
});
```

In scenarioInput, include the exact acting/helper/Wise-helper Actor IDs and complete current condition sets, with the previously required `conditionsGmReviewed`, described action, accepted Help and approved relevance. Helper helpOptions must identify its source Skill name and source-based Help route. Wise aid must explicitly declare relatedness. Confirm current participant/source IDs, computed pool7, saved faces/outcome and no advancement preview.

Gate B/C Beginner's Luck: acting Cook absent OR unique rating0, current Will4, hasSkill:false, source-valid supplies1. Without Help/Wise/Fresh expect ceil((4+1)/2)=3 dice. Fresh alone adds AFTER halving, for 4 dice. With trained Cook Help and distinct Wise aid expect ceil((4+1+1+1)/2)+Fresh1=5 dice. For BL helping Skill set targetSkillName:"Cook", helperSkillTrained:true. A helper lacking trained Cook may use current Will; a helper with trained Cook must use that Skill (SG37). Independently test Dungeoneer BL with current Health3, source-factor delve vertical/one, supplies1: expect 2 dice and Ob2.

Gate C reject: claimed wrong acting ID/rating/Will-Health, learned Skill used as BL, duplicate/malformed Skill IDs, unowned or mismatched helping Item, duplicate named source Skill/Wise, missing helper, helper token/synthetic Actor, same helper for ordinary Help and Wise aid, mismatched/omitted conditions, declined Help or missing described/relevant action, helper Skill1 + Injured or helper Will1 + Sick (effective 0), Afraid ordinary helper/BL actor, Angry Wise helper, Dead participant, actor zero-rated through conditions. Reject unused source IDs, caller faces/results/progression, paid bonus dice, Nature Channel, Heroic and Instinct routes. Current Actor resources are never a historical start ledger.

Gate D: simultaneous GM/player checks, no private document data on denial, no socket/RNG/Actor/Item/Journal/Settings/resource/learning/advancement changes, no duplicate hooks and unchanged live-authority/kill-switch controls. All historical/authentication flags remain false, including playerConsentAuthenticated and participationAtRollTimeVerified. Changing a current Skill/Ability/condition/Wise affects only a new observation; prior frozen snapshots remain detached. Actual player acceptance, fictional relevance and same-test identity remain GM assertions. Run all prior A-D source/dice/reward cases together before reporting acceptance.

Status: automated mock coverage; real combined Foundry v13.351 acceptance NOT RUN. Separate participation API has no Wise/Fate reroll timeline or advancement integration; the older documentRewardHistoryPlan retains its narrower Skill-only/no-helper scope. Release remains blocked, 0/14 FULLY_REAUDITED.

### Saved participant outcome → current progression / Helper Synergy — combined Gates B/C/D (v13.351; NOT RUN)

Keep inside the same consolidated Package A acceptance and use its current Skill/BL/Help source fixtures. Record Actor Item counters, Current/Maximum Nature, configured Legacy requirements, current helper resources, exact native message/faces and tested commit. There must be no actual marks, counters, ratings, resets, learned/forgotten Skills or spends.

```js
A.tests.participationProgressPlan({
  actorId, messageId, scenarioInput, helpSourceItemId, wiseAidItemId,
  progressReview:{
    gmConfirmedLegalTest:true, gmConfirmsCountersExcludeThisTest:true,
    gmConfirmsHistoricalEligibility:true, context:"ADVENTURE"
  },
  // Optional, ONLY for the observed ordinary helper (never Wise aid):
  synergyReview:{fateAtRollStartGmAsserted:1,committedBeforeRollGmAsserted:true}
});
```

Gate B/C trained Cook4 with current counters3P/3F and a source-valid saved PASS: projected4P/3F, source readiness for5. With4P/2F and saved FAIL: same projected4P/3F. A caller-selected outcome/counter/obstacle/source must be rejected. Verify configured Legacy passNeeded/failNeeded are displayed but not changed. Normal rating6 remains capped. Repeating the preview must not accumulate marks. Remove or corrupt a counter: reject, never infer0. Sick with already-ready4P/3F: no new mark, no advancement readiness or proposed rating increase.

Gate B/C BL Cook at an existing rating0 learning record, attempts3, Current Nature2/Maximum4: after a legal saved PASS OR FAIL, show attempts4 and learned-rating2 readiness, with NO acting Will/Health advancement. Repeat with24 actual known roles: require an explicit future choice to forget a Skill; no deletion. Count25, ambiguous roles, absent/missing learning counter or invalid Nature state must reject. A missing Skill may pass the separate TEST bridge, but not this counter bridge. Sick adds no attempt.

Gate B/C Helper Synergy: helper Alchemist2 with1P/1F provides source-listed Help to Cook, with explicit accepted action and source Item ID. On the acting PASS, project HELPER Alchemist2P/1F; on FAIL, project their own failed mark. Require historical helper Fate≥1 and GM-declared commitment before the roll. Current helper Fate0 must remain0 and must NOT override the separately asserted historical1. Sick helper cannot mark or advance even when old counters are ready. Wise aid alone has no Synergy route. Reject late/unreviewed Synergy, caller mark/source/result overrides, and conflict/series/tiebreaker/Camp/Town progression contexts.

Gate B/C helper lacking trained Cook may use actual Will to Help the actor's BL test. Synergy can propose that HELPER Will mark while the ACTING character gains only the BL attempt. The current model has no Will/Health P/F fields: helperAbilityCountersObserved must be false and helperCounterProjection null. Do not claim a verified Ability advancement counter chain.

Gate D: two-client GM/player rejection/privacy and before/after source documents/resources unchanged; player denied before reads; repeated snapshots remain detached. HistoricalEligibility/starting Fate/counters-exclude-test are explicit GM assertions. historicalProgressCountsAuthenticated, duplicateTestCheckAuthenticated, rollTimeActorStateVerified and all Actor/roll/GM/consent authentication flags remain false. No hooks, RNG, sockets, updates or actual logging. Repeat all prior A-D source/factor/conditions/dice/reward/participant cases together.

Status: automated mock coverage only; real Foundry v13.351 combined acceptance NOT RUN. No mark/spend/learning/advancement authorization; no full-domain certification (0/14), release still blocked.

### Current equipment Item evidence — combined Gates B/C/D, v13.351 (NOT RUN)

Use the same real world-character/saved native-D6 participant fixture. Record actual Gear Item IDs/quantities and raw inventory placements, Skill Item IDs and before/after quantities. The bridge supports a pack/satchel equipped on Torso, directly equipped Gear and one-level contents of that pack; custom/nested/hand-carried pack interpretations require separate QA and must not be inferred here.

```js
A.tests.equipmentOutcomePlan({
  actorId, messageId, scenarioInput, helpSourceItemId, wiseAidItemId,
  equipmentReview:{
    pack:{itemId:packItemId,usableGmAsserted:true},
    borrowedTools:null,
    supply:{itemId:supplyItemId,skillName:"Cook",accessibleGmAsserted:true,
      usableGmAsserted:true,oneIncrementAvailableGmAsserted:true},
    gear:{itemId:gearItemId,skillName:"Cook",accessibleGmAsserted:true,usableGmAsserted:true},
    adequacyGmReviewed:true
  }
});
```

Gate B trained Cook4, real worn Torso pack, supply quantity2 directly in that pack, gear quantity1 on belt, suppliesUsed1/gearUsed1: expect six saved D6, source Ob1 and the same derived outcome as the participant chain. Inspect bound Item IDs, quantity2 and pack→supply path. Repeat: quantity stays2, no increment/spend/update occurs. Quantities are not native supply-unit proof; projectedSupplyIncrementsUsed1 is a preview only.

Gate C reject missing/duplicate/wrong-type Item, quantity0/fractional/missing, injected quantity/face fields, wrong Skill relation, missing access/usability/increment review, wrong/unassigned pack location, multiple carried packs, orphan/malformed/custom/nested container paths, same Item reused for Pack/Supply/Gear, unused reference for a zero-use category and unsupported Dwarf/crafting exception. A positive quantity alone does not prove accessibility or old pre-roll stock.

Gate B/C damaged/unusable pack: declare usableGmAsserted:false and carriesBackpackOrSatchel:false, with zero bonuses; basic tools are absent and source Ob increases1. This is a physical-state assertion, not an authenticated damage field. For BL with no own trained tools, borrowedTools may reference a distinct current lender Actor, actual trained matching Skill Item and its worn pack:

```js
borrowedTools:{lenderActorId,skillItemId:lenderSkillItemId,packItemId:lenderPackItemId,
  accessGmAsserted:true,lenderConsentGmAsserted:true,packUsableGmAsserted:true}
```

Reject self/missing/untrained lender, missing/empty/unsupported pack, declined/omitted consent or contradictory scenario loan flags. With Will4 BL, no bonuses and borrowed tools: two saved D6 at source Cook Ob1. Without loan/basic tools: same two D6 but Ob2. No tools are created/transferred and lender inventory stays unchanged.

Gate D: two-client GM/player access guard, unchanged Actor/Item/Journal/Settings/resources/counters/quantities, no RNG/socket/update hooks and no release/authority changes. historicalEquipmentVerified, physicalConditionAuthenticated, equipmentRelevanceAuthenticated, supplyIncrementAuthenticated and lenderConsentAuthenticated remain false. inventoryCapacityAndEncumbranceVerified and completeEquipmentRuleParityVerified remain false. Existing frozen equipment evidence remains detached after later current Item changes. Run all prior A-D factor/condition/dice/reward/participant/progress cases together.

Status: automated mocks only; real Foundry v13.351 combined acceptance NOT RUN. This adds CURRENT equipment evidence, not past stock/consumption or full inventory certification. No release; 0/14 FULLY_REAUDITED.

## G1 combined candidate case — NOT RUN in Foundry v13.351

On the isolated exact-SHA unpublished candidate, invoke `tests.integratedTestPlan` with actual acting/helper Skill IDs, actual pack/supply/gear references, a native initial FAIL message, and saved Deeper/Of Course/Luck messages with explicit target/parent links. Use one actor/message/scenario and explicit equipment/reward/progress/Synergy reviews. Confirm shared base evidence identity; reward-final PASS; acting PASS and helper helping-source PASS; BL gives one attempt and no acting Ability mark. Exercise no events (FAIL), insufficient acting Fate, separate helper Fate assertion, reused/mislinked events, changed participant snapshots, forged/outcome/counter overrides, player/private visibility, repeated preview and reload. Record real IDs, source SHA/artifact hash, before/after snapshots and console results. Assert zero CORE writes/RNG/spends; Legacy control gameplay writes are separately recorded. Historical authentication must remain false. This case is pending, not a runtime PASS.

## G2 advancement evidence acceptance — NOT RUN

For the isolated exact-SHA candidate, exercise `advancement.thresholdPlan` / `advancement.naturePlan` using their registered foundation names, plus integrated Skill/BL progression. Verify numerical rating4 requires 4P/3F; extra passes do not replace failures; rating1 requires 1P/0F and normal cap6 remains fixed. Reject null/text/boolean/fractional/unsafe counts and textual review flags. Current Nature0/max4 must not preview advancement before resolving DH68 loss; nonzero taxed Nature advancement preserves the tax difference. Verify no counter/rating/Nature/trait/spend writes, and no invented Ability counters or supply-unit conversion. Consult the G2 matrix for still-pending required exceptions; record actual function names, IDs and before/after observations. No runtime PASS is claimed.
## G3 proposed-envelope diagnostic — NOT RUN in Foundry v13.351

Call `tests.prospectiveTracePlan` with an explicitly labeled proposed/unattested fixture. Verify one test identity, declared owner/GM/source scope, base native-record-shaped D6 values, helper Synergy commitment and receipt before BASE, acting Wise/Luck receipts, recursive parent chains and matching FINAL. Reject mixed test IDs, duplicate sequence/event/roll IDs, missing receipts, wrong payer/currency/balance, incomplete Luck, contradictory FINAL, reused IDs in the reviewed prior-ID set and invented Ability P/F counters. Show that coherent fabricated declarations never set authentication true. Before/after World snapshots must show zero writes/RNG/spends. This pure diagnostic does not test a capture producer or historical document reader. Actual Legacy-owned prospective data, complete source snapshots, commit/replay storage, private-message/GM-player/reload/concurrency and unchanged-Legacy control comparisons remain pending; do not label G3 complete on fixture success.
## G3 explicit observation lifecycle — NOT RUN in Foundry v13.351

As current registered GM in the isolated Legacy Mixed candidate world, open `tests.legacyObservationProbe` for a real world character/trained Skill and unique diagnostic test ID. Supply an already evaluated native plain D6 Roll; the probe must not evaluate one itself. Snapshot source data and verify finish reports OBSERVED_UNPERSISTED with unchanged Actor/Item/Settings/Chat. In separately prepared controlled runs, let Legacy perform a resource change, then observe that actual delta; record the external Legacy mutation separately from zero-write observer calls. Test missing base, unrecorded/wrong delta, explicit abort, double finish, pending/modified/non-native dice, changed source/GM/world/profile and parallel probes. Demonstrate that two probes can acknowledge one delta and neither gains authenticated causality/replay status. No reroll/final history, storage or trusted capture is certified by this case. Never execute live campaign fixtures or label this partial diagnostic a G3 PASS.