# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.3

**Build:** v1.5.0-qa.3 — CORE M3 expanded real-roll shadow parity  
**Foundry target:** 13.351  
**Approved development baseline:** v1.5.0-qa.2 PASS  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Authority:** Legacy Mixed  
**CORE live application:** OFF

qa.3 expands verified real-roll shadow parity to ordinary Beginner's Luck and Fate/Open-6 supplemental dice. CORE still does not own live gameplay.

## A. Install / status

- [ ] A1. Install/update to `1.5.0-qa.3`.
- [ ] A2. World launches without new Realm Guard console-breaking errors.
- [ ] A3. Existing Actors/Items/world state remain intact.

Run:

```js
console.log(game.system.version);
console.log(game.realmGuard.core.tests.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
```

Expected:

```text
1.5.0-qa.3
mode: SHADOW_PARITY
liveApplication: false
authority: LEGACY_MIXED
instrumentedMethods includes rollBeginnerLuck
supportedSpecialResolution includes FATE_OPEN_SIX
```

- [ ] A4. Test Engine remains SHADOW_PARITY / live OFF.
- [ ] A5. Parity authority remains LEGACY_MIXED.
- [ ] A6. `rollBeginnerLuck` appears in instrumented methods.
- [ ] A7. `FATE_OPEN_SIX` appears in supported special resolution.

## B. Reset parity history

```js
game.realmGuard.core.testParity.clear();
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected: observed 0, compared 0, matches 0, mismatches 0, skipped 0, errors 0.

## C. Beginner's Luck — ordinary

Use an untrained Skill through the normal Beginner's Luck UI. Do not use Fate for this first test if possible.

Then run:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.log("status", p?.status);
console.log("method", p?.method);
console.log("context", p?.comparison?.context);
console.log("fields", p?.comparison?.parity?.fields);
```

Expected:

```text
status: MATCH
method: rollBeginnerLuck
context: beginnerLuck
pool/target/successes/outcome/margin: all true
```

- [ ] C1. Beginner's Luck live roll behaves exactly as before.
- [ ] C2. Parity entry is MATCH.
- [ ] C3. Context is beginnerLuck.
- [ ] C4. All five parity fields are true.
- [ ] C5. No duplicate advancement/learning behavior appears.

## D. Fate / Open 6s — ordinary Skill

Clear history, then make an ordinary trained Skill roll that produces at least one 6. Choose **Spend 1 Fate** so Open 6s actually occurs.

```js
game.realmGuard.core.testParity.clear();
```

After the completed roll:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.log("status", p?.status);
console.log("legacy supplemental", p?.comparison?.legacy?.supplementalFaces);
console.log("core supplemental", p?.comparison?.core?.supplementalFaces);
console.log("fields", p?.comparison?.parity?.fields);
```

Expected:

```text
status: MATCH
legacy supplementalFaces: one or more dice
core supplementalFaces: identical dice
pool/target/successes/outcome/margin: all true
```

Important: the compared `pool` remains the original prepared pool. Fate explosion dice are supplemental and must not inflate pool parity.

- [ ] D1. Legacy Fate prompt/use works normally.
- [ ] D2. Exactly 1 Fate is spent by Legacy gameplay.
- [ ] D3. Parity entry is MATCH, not SKIPPED.
- [ ] D4. Legacy/CORE supplementalFaces match exactly.
- [ ] D5. Prepared pool remains unchanged by supplemental Fate dice.
- [ ] D6. Final successes/outcome/margin match.

## E. Fate chaining smoke

If practical, repeat a Fate/Open-6 test where an exploded die itself rolls 6 and creates another explosion. This is useful but not required to force manually.

If it occurs naturally:

- [ ] E1. All generated Fate explosion dice are captured.
- [ ] E2. CORE supplementalFaces contain the full chain.
- [ ] E3. Parity remains MATCH.

If no chained 6 occurs naturally, mark E as NOT EXERCISED rather than FAIL.

## F. Existing qa.2 regression

Clear history and perform one representative ordinary trained Skill and one Ability roll.

- [ ] F1. rollRole → MATCH.
- [ ] F2. rollAbility → MATCH.
- [ ] F3. No unexpected MISMATCH or ERROR.

Perform one Automatic Versus without a resolved secondary tie if practical.

- [ ] F4. rollAutomaticVersus → MATCH.

A resolved secondary Versus tie may still produce:

```text
SKIPPED · VERSUS_TIEBREAK_NOT_YET_MODELED_IN_PARITY
```

That is expected for qa.3.

## G. Beginner's Luck Versus scope guard

If exercised, Beginner's Luck against an opponent is not yet a blocking parity case. Expected diagnostic is:

```text
SKIPPED · BEGINNER_LUCK_VERSUS_TARGET_NOT_YET_CAPTURED
```

- [ ] G1. If exercised, live Legacy gameplay remains correct.
- [ ] G2. Observer skips safely rather than generating false parity.

## H. M2 preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

- [ ] H1. Effect Engine = SHADOW_COMPARE.
- [ ] H2. Effect Engine liveApplication = false.
- [ ] H3. Exactly six verified providers remain registered.

## I. Reload / no duplicate observer

F5/reload. Then:

```js
game.realmGuard.core.testParity.clear();
```

Make exactly one ordinary Skill roll without Fate if possible, then:

```js
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected:

```text
observed: 1
compared: 1
matches: 1
mismatches: 0
errors: 0
```

- [ ] I1. M3 status returns after reload.
- [ ] I2. Exactly one parity observation is produced by one roll.
- [ ] I3. No duplicate wrapper/observer registration.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass v1.5.0-qa.3 when ordinary Beginner's Luck produces real MATCH parity, Fate/Open-6 real supplemental dice are replayed through CORE and produce MATCH parity without changing prepared pool semantics, qa.2 parity remains intact, M2 remains six-provider shadow-only, reload produces no duplicate observer, and Legacy Mixed remains the sole live authority.
