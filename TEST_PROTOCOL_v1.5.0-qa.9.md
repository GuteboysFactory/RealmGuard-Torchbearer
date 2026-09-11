# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.9

## Scope
CORE M3 Custom Roll TestContext shadow parity. Legacy Mixed remains authoritative and CORE remains observer-only.

## A. Status
Run:
```js
console.log(game.system.version);
console.log(game.realmGuard.core.testParity.getStatus());
```
Expected:
- `1.5.0-qa.9`
- `mode: SHADOW_PARITY`
- `liveApplication: false`
- `authority: LEGACY_MIXED`
- `contextCoverage` contains ordinary, ability, nature, circles, beginnerLuck, versus, recovery, custom
- `remainingContextWork` is empty

## B. Clear history
```js
game.realmGuard.core.testParity.clear();
```

## C. Blocking — normal Custom Roll
From the Ranger sheet use Custom Roll / Free Dice Pool.
Suggested values:
- Label: `QA Custom`
- Base Dice: 3
- Obstacle: 2
- Extra Dice: 1
- Persona: 0

After rolling:
```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.log("status", p?.status);
console.log("method", p?.method);
console.log("context", p?.comparison?.context);
console.log("legacy", p?.comparison?.legacy);
console.log("core", p?.comparison?.core);
console.log("fields", p?.comparison?.parity?.fields);
```
Expected:
- `MATCH`
- method `customRoll`
- context `custom`
- all five fields true: pool, target, successes, outcome, margin
- Custom Roll chat card still appears normally
- no Learning/Advancement mark is recorded

## D. Persona-inclusive Custom Roll
If Persona is available, run another Custom Roll with Persona +1D.
Expected:
- chat pool includes the Persona die
- Persona is spent exactly once by Legacy
- parity is `MATCH`
- CORE does not spend Persona again

## E. Optional Fate/Open 6s Custom Roll
If the initial Custom Roll contains at least one 6 and Fate is available, choose Fate/Open 6s.
Expected:
- bonus Fate dice appear on the Legacy chat card
- Fate is spent exactly once
- parity remains `MATCH`
- CORE supplemental faces mirror the Legacy Fate dice

## F. Context leakage regression
After Custom Roll, make one ordinary Skill or Ability test.
Expected: latest context returns to `ordinary` or `ability`, not `custom`.

## G. M2 preservation
```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```
Expected:
- SHADOW_COMPARE
- liveApplication false
- six providers

## H. Reload safety
Reload Foundry, then:
```js
game.realmGuard.core.testParity.clear();
```
Run exactly one Custom Roll and then:
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
- context `custom`

## PASS gate
qa.9 passes when:
- normal Custom Roll MATCH
- all five parity fields true
- no Learning/Advancement on unlinked free pool
- no duplicate Persona/Fate spending
- ordinary tests do not leak into custom context
- M2 still has six providers and live off
- M3 liveApplication remains off
- Legacy Mixed remains authoritative
