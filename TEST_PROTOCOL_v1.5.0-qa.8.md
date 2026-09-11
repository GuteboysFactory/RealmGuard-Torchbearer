# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.8

**Focus:** CORE M3 Recovery TestContext shadow parity  
**Approved baseline:** v1.5.0-qa.7 PASS  
**Foundry:** 13.351  
**Live authority:** Legacy Mixed  
**CORE live application:** OFF

## A — Status

Run:

```js
console.log(game.system.version);
console.log(game.realmGuard.core.testParity.getStatus());
```

Expected:
- version `1.5.0-qa.8`
- `mode: SHADOW_PARITY`
- `liveApplication: false`
- `authority: LEGACY_MIXED`
- `contextCoverage` includes `recovery`
- `remainingContextWork` contains only `custom`
- `supportedSpecialResolution` includes `RECOVERY_TEST`

## B — Clear parity history

```js
game.realmGuard.core.testParity.clear();
```

## C — BLOCKING: Ability-based Recovery

1. Activate a Condition with an Ability recovery method, for example Tired, Injured, Angry, Afraid or Strained.
2. Use the Ranger sheet **Recovery** control for that Condition. Do not roll the Ability directly from the stat bar.
3. Complete the real Legacy recovery roll.

Then run:

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
- `status: MATCH`
- `method: rollAbility`
- `context: recovery`
- `versus: false`
- pool / target / successes / outcome / margin all `true`
- target equals the selected Condition recovery Obstacle

Legacy behavior must remain authoritative:
- PASS/FAIL handling behaves exactly as before
- Condition state changes only through Legacy recovery handling
- no duplicate clearing/state mutation from CORE
- the recovery roll ignores the relevant active Condition penalty where the existing Legacy flow does so

## D — Role/Skill-based Recovery

Preferred canonical setup: Hungry & Thirsty with a trained Cook, Brewer or Baker.

1. Activate Hungry & Thirsty.
2. Use its Recovery control.
3. Choose the trained Skill recovery option and complete the roll.

Then run:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log("status", p?.status);
console.log("method", p?.method);
console.log("context", p?.comparison?.context);
console.log("fields", p?.comparison?.parity?.fields);
```

Expected:
- `MATCH`
- `rollRole`
- `recovery`
- all five parity fields `true`

## E — Recovery classification must not leak

After recovery, perform one normal Will or Health roll from the Ability control.

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p?.status, p?.method, p?.comparison?.context, p?.comparison?.parity?.fields);
```

Expected:
- `MATCH`
- `rollAbility`
- `ability`, not `recovery`
- all five fields `true`

## F — M2 preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

Expected:
- `SHADOW_COMPARE`
- `liveApplication: false`
- six providers

## G — Reload safety

Reload Foundry, clear parity history, then perform exactly one Ability-based Recovery roll.

```js
game.realmGuard.core.testParity.clear();
```

After the roll:

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
- latest context `recovery`

## PASS GATE

v1.5.0-qa.8 passes when:
- Ability Recovery = MATCH / recovery
- Role Recovery = MATCH / recovery
- ordinary Ability still = MATCH / ability
- pool/target/successes/outcome/margin all true
- no duplicate recovery state mutation
- no unexpected mismatch/error
- M2 remains six-provider shadow mode
- M3 live remains OFF
- Legacy Mixed remains authoritative
