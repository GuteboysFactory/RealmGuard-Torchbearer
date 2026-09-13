# Realm Guard / Torchbearer — TEST PROTOCOL v1.6.0-qa.2

**Phase:** CORE M4 — Advancement / Nature / Conditions  
**Scope:** Real Legacy `TEST_RESOLVED` → AdvancementService shadow bridge  
**Foundry target:** v13.351  
**Approved baseline:** v1.6.0-qa.1 PASS  
**Live authority:** Legacy Mixed  
**CORE live application:** OFF

## A — Startup / bridge status

```js
console.log(game.system.version);
console.log(game.realmGuard.core.m4.getStatus());
```

Expected:
- version `1.6.0-qa.2`
- M4 `SHADOW_SERVICES`
- `liveApplication: false`
- `authority: LEGACY_MIXED`
- `currentScope: REAL_TEST_RESOLVED_ADVANCEMENT_SHADOW`
- testResolvedBridge mode `REAL_LEGACY_TEST_RESOLVED_SHADOW`
- rollBridgeInstalled `true`
- dialogCaptureInstalled `true`

## B — Real Skill test feeds AdvancementService

Clear both histories:

```js
game.realmGuard.core.testParity.clear();
game.realmGuard.core.m4.advancement.clear();
```

Perform one normal trained Skill test from the Ranger sheet with **Count this test for Learning ON**.

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
```

Expected M4 entry:
- `realLegacyRoll: true`
- `legacyMethod: rollRole`
- `context: ordinary`
- `sourceKind: role`
- correct Skill name/id
- `countLearning: true`
- `countLearningSource: LEGACY_ROLL_DIALOG`
- `parityStatus: MATCH`
- `mode: SKILL_PASS_FAIL`
- `eligible: true`
- PASS produces `passed:true`; FAIL produces `failed:true`
- `liveApplication:false`

Legacy must still be the only code that writes the actual Skill Pass/Fail mark.

## C — Learning OFF

Clear Advancement history. Perform one normal trained Skill test with **Count this test for Learning OFF**.

```js
console.log(game.realmGuard.core.m4.advancement.getLatest());
```

Expected:
- real Legacy test observed
- `countLearning:false`
- `mode:NONE`
- `eligible:false`
- `reason:LEARNING_DISABLED`
- no CORE mutation of Skill learning state

## D — Ability learning

Clear Advancement history. Perform one Will or Health test with Learning ON.

Expected:
- `legacyMethod: rollAbility`
- `sourceKind: ability`
- correct source (`will` or `health`)
- `mode: ABILITY_PASS_FAIL`
- `eligible:true`
- `countLearning:true`
- `parityStatus:MATCH`

Legacy ability learning remains authoritative.

## E — Beginner's Luck

Clear Advancement history. Perform one untrained Skill / Beginner's Luck test with Learning ON.

Expected:
- `legacyMethod: rollBeginnerLuck`
- `context: beginnerLuck`
- `sourceKind: role`
- `mode: BEGINNER_ATTEMPT`
- `eligible:true`
- `realLegacyRoll:true`
- `parityStatus:MATCH`

CORE must not increment `beginnerAttempts`; Legacy does that once.

## F — Recovery learning metadata

Clear Advancement history. Perform one real Condition Recovery test through the Ranger sheet, using an Ability or trained Skill, with Learning ON.

Expected:
- `context: recovery`
- sourceKind matches the actual Recovery method (`ability` or `role`)
- appropriate PASS/FAIL advancement mode
- `countLearningSource: LEGACY_ROLL_DIALOG`
- `liveApplication:false`
- normal Legacy Recovery behavior remains unchanged

## G — Automatic Versus special learning result

Perform an Automatic Versus test. Inspect:

```js
const a = game.realmGuard.core.m4.advancement.getLatest();
console.log(a);
```

For ordinary resolved Versus results where Legacy supplies a learning result, CORE shadow should recommend the matching Skill Pass/Fail mark.

If Legacy resolves a secondary tiebreak path that deliberately returns `learningResult:null`, expected:
- final roll may be PASS/FAIL
- `learningOutcome:null`
- `mode:NONE`
- `eligible:false`
- `reason:LEGACY_LEARNING_RESULT_NONE`

An unresolved final tie must produce:
- `mode:NONE`
- `reason:TIE_DOES_NOT_ADVANCE`

## H — Nature / Circles

Run one Nature or Circles test with Learning ON.

Expected:
- sourceKind `ability`
- Nature context `nature`, Circles context `circles`
- `mode:ABILITY_PASS_FAIL`
- correct source id/name
- M3 parity remains MATCH
- Legacy remains sole writer of the ability-learning track

## I — No Custom Roll advancement

Clear Advancement history:

```js
game.realmGuard.core.m4.advancement.clear();
```

Perform one Custom Roll / Free Dice Pool.

Then:

```js
console.log(game.realmGuard.core.m4.advancement.getSummary());
```

Expected:
- no AdvancementService entry is created by Custom Roll
- `observed:0`
- Custom Roll still gets its normal M3 parity observation
- no Learning/Advancement mutation

## J — Summary / duplicate safety

Reload Foundry. Clear M3 and M4 histories. Perform exactly one normal Skill test with Learning ON.

```js
console.log(game.realmGuard.core.testParity.getSummary());
console.log(game.realmGuard.core.m4.advancement.getSummary());
console.log(game.realmGuard.core.m4.events.listenerCount("TEST_RESOLVED"));
```

Expected:
- M3: exactly one observed/comparison and MATCH
- M4 Advancement: `observed:1`, `realLegacy:1`, `eligible:1`
- TEST_RESOLVED listener count: `1`
- no duplicate chat card
- no duplicate learning mark

## K — Preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
console.log(game.realmGuard.core.m4.getStatus());
```

Expected:
- M2 `SHADOW_COMPARE`, live OFF, six providers
- M3 `SHADOW_PARITY`, live OFF
- M4 `SHADOW_SERVICES`, live OFF
- Legacy Mixed authority ON
- Conflict remains Legacy adapter until M6

## PASS gate

- Real Skill → automatic TEST_RESOLVED shadow recommendation PASS
- Learning checkbox ON/OFF captured correctly
- Ability recommendation PASS
- Beginner's Luck recommendation PASS
- Recovery recommendation PASS
- Versus null-learning semantics preserved
- Nature/Circles recommendation PASS
- Custom Roll produces no advancement recommendation
- reload/duplicate safety PASS
- no double advancement/state writes
- M2/M3 preserved
- Legacy Mixed remains sole live authority
