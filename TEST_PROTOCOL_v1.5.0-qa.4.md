# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.4

**Build:** v1.5.0-qa.4 — CORE M3 Automatic Versus tie-resolution parity  
**Foundry target:** 13.351  
**Approved development baseline:** v1.5.0-qa.3 PASS  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Authority:** Legacy Mixed  
**CORE live application:** OFF

qa.4 removes the previous Automatic Versus secondary-tiebreak shadow gap. Legacy Mixed still performs all real dialogs, resource spends, tiebreak rolls and state mutation. CORE now independently resolves the captured secondary resolution data and compares the same five parity fields: pool, target, successes, outcome and margin.

## A. Install / status

- [ ] A1. Install/update to `1.5.0-qa.4`.
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
1.5.0-qa.4
mode: SHADOW_PARITY
liveApplication: false
authority: LEGACY_MIXED
supportedSpecialResolution includes FATE_OPEN_SIX and AUTOMATIC_VERSUS_TIEBREAK
```

## B. Reset parity history

```js
game.realmGuard.core.testParity.clear();
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected: observed 0, compared 0, matches 0, mismatches 0, skipped 0, errors 0.

## C. Automatic Versus — normal non-tie regression

Perform one normal Automatic Versus that does not begin tied.

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.log(p?.status, p?.method, p?.comparison?.parity);
```

- [ ] C1. Status = MATCH.
- [ ] C2. method = rollAutomaticVersus.
- [ ] C3. pool/target/successes/outcome/margin are all true.
- [ ] C4. Legacy gameplay/chat remains unchanged.

## D. Automatic Versus — resolved tiebreaker roll

Create/repeat an Automatic Versus until the initial successes tie. Resolve the Legacy tie through **Roll Tiebreaker**.

After completion:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.log("status", p?.status);
console.log("legacy tie", p?.comparison?.legacy?.versusResolution);
console.log("core tie", p?.comparison?.core?.secondaryResolution);
console.log("fields", p?.comparison?.parity?.fields);
```

Expected:

```text
status: MATCH
legacy tie method: tiebreaker
core tie method: tiebreaker
pool/target/successes/outcome/margin: all true
```

- [ ] D1. Initial tie still opens the existing Legacy tie dialog.
- [ ] D2. Legacy performs the real tiebreak rolls.
- [ ] D3. CORE performs no additional live dice roll and no resource/state mutation.
- [ ] D4. Captured own/opponent tiebreak faces are replayed by CORE.
- [ ] D5. Final outcome and margin MATCH.
- [ ] D6. The parity entry is no longer SKIPPED.

## E. Alternate tie-resolution paths

If practical, exercise one or more additional Legacy tie choices.

### Trait gives opponent the win
Expected CORE result: FAIL, margin 0, parity MATCH.

### Fate resolves initial tie
If an unused 6 and Fate are available, resolve with Fate. Legacy remains the sole Fate spender. CORE only receives the completed secondary-resolution result. Expected parity MATCH when the tie is resolved.

### Second tie / GM wins
If the tiebreaker itself ties against a GM-controlled opponent and the procedure reaches GM Wins, expected CORE result: FAIL, margin 0, parity MATCH.

These alternate branches are useful coverage but only D (ordinary tiebreaker) is blocking for qa.4.

## F. qa.3 preservation

- [ ] F1. Ordinary trained Skill → MATCH.
- [ ] F2. Ability → MATCH.
- [ ] F3. Ordinary Beginner's Luck → MATCH.
- [ ] F4. Fate/Open-6 → MATCH with identical supplementalFaces.
- [ ] F5. Original prepared pool remains unchanged by Fate supplemental dice.

## G. Remaining deliberate gap

Beginner's Luck Versus remains outside qa.4 real parity capture. If exercised, expected:

```text
SKIPPED · BEGINNER_LUCK_VERSUS_TARGET_NOT_YET_CAPTURED
```

- [ ] G1. If exercised, Legacy live gameplay remains correct.
- [ ] G2. Observer skips safely rather than claiming false parity.

## H. M2 preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

- [ ] H1. Effect Engine = SHADOW_COMPARE.
- [ ] H2. Effect Engine liveApplication = false.
- [ ] H3. Exactly six verified providers remain registered.

## I. Reload / no duplicate observer

F5/reload, clear parity history, perform exactly one ordinary Skill roll, then:

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
- [ ] I2. One roll produces exactly one parity observation.
- [ ] I3. No duplicate observer registration.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass v1.5.0-qa.4 when a real Automatic Versus initial tie resolved through the existing Legacy tiebreaker produces MATCH parity for pool, target, successes, final outcome and margin; qa.3 Beginner's Luck/Fate parity remains intact; M2 remains six-provider shadow-only; reload produces no duplicate observer; and Legacy Mixed remains the sole live authority.
