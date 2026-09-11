# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.7

**Build:** v1.5.0-qa.7 — CORE M3 semantic TestContext parity expansion  
**Foundry target:** 13.351  
**Approved development baseline:** v1.5.0-qa.6 PASS  
**Gameplay change:** NONE INTENDED  
**Authority:** Legacy Mixed  
**CORE live application:** OFF

qa.7 verifies that real Legacy tests are not only numerically equal in CORE but also classified under the correct semantic TestContext. This is preparation for M4 services, which need to react differently to Ability, Nature and Circles tests without re-reading UI branches.

## A. Install / status

```js
console.log(game.system.version);
console.log(game.realmGuard.core.testParity.getStatus());
```

Expected:
- version = 1.5.0-qa.7
- mode = SHADOW_PARITY
- liveApplication = false
- authority = LEGACY_MIXED
- contextCoverage includes ordinary, ability, nature, circles, beginnerLuck, versus
- remainingContextWork includes recovery and custom

## B. Reset

```js
game.realmGuard.core.testParity.clear();
```

## C. Will or Health

Perform one normal Will or Health test.

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p?.status, p?.method, p?.comparison?.context, p?.comparison?.parity?.fields);
```

Expected:
- MATCH
- rollAbility
- context = ability
- all five parity fields true

## D. Resources

Perform one Resources test.

Expected:
- MATCH
- rollAbility
- context = ability
- provenance.semanticContext = resources
- all five parity fields true

## E. Circles

Perform one Circles test.

Expected:
- MATCH
- rollAbility
- context = circles
- all five parity fields true

## F. Nature ordinary

Perform one direct Nature test.

Expected:
- MATCH
- rollAbility
- context = nature
- versus = false
- all five parity fields true

## G. Nature Versus

Perform one Nature Versus test.

Expected:
- MATCH
- rollNatureVersus
- context = nature
- versus = true
- all five parity fields true

## H. Regression spot-check

One trained Skill and one Beginner's Luck test should still produce MATCH. If convenient, verify Beginner's Luck Versus remains MATCH as established in qa.6.

## I. M2 preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

Expected:
- SHADOW_COMPARE
- liveApplication false
- exactly six providers

## J. Reload

F5, clear parity, perform exactly one Will or Health test, then:

```js
console.log(game.realmGuard.core.testParity.getSummary());
console.log(game.realmGuard.core.testParity.getLatest()?.comparison?.context);
```

Expected:
- observed 1
- compared 1
- matches 1
- mismatches 0
- errors 0
- context ability

## PASS gate

PASS when Ability, Resources, Circles, Nature and Nature Versus all MATCH numerically and expose the intended semantic contexts; qa.6 Beginner's Luck/Versus behavior remains intact; M2 remains six-provider shadow-only; reload creates no duplicate observer; and Legacy Mixed remains sole live authority.
