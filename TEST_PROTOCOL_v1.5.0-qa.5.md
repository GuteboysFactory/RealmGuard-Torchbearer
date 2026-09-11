# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.5

**Build:** v1.5.0-qa.5 — CORE M3 Beginner's Luck Versus shadow parity  
**Foundry target:** 13.351  
**Approved development baseline:** v1.5.0-qa.4 PASS  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Authority:** Legacy Mixed  
**CORE live application:** OFF

qa.5 removes the last deliberate Beginner's Luck Versus parity skip. Legacy Mixed remains the sole live authority; CORE only observes and deterministically replays the completed real data.

## A. Install / status

Run:

```js
console.log(game.system.version);
console.log(game.realmGuard.core.tests.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
```

Expected:

```text
1.5.0-qa.5
mode: SHADOW_PARITY
liveApplication: false
authority: LEGACY_MIXED
supportedSpecialResolution includes BEGINNER_LUCK_VERSUS
```

- [ ] A1. World loads without new Realm Guard console-breaking errors.
- [ ] A2. Existing Actors/Items/world state remain intact.
- [ ] A3. M2 remains six-provider SHADOW_COMPARE / live OFF.

## B. Reset parity history

```js
game.realmGuard.core.testParity.clear();
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected: observed 0, compared 0, matches 0, mismatches 0, skipped 0, errors 0.

## C. Beginner's Luck Versus — normal non-tie

Use an untrained Skill against a real opponent through the existing Beginner's Luck Versus flow. Prefer a result that does not initially tie.

Then run:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.log("status", p?.status);
console.log("method", p?.method);
console.log("context", p?.comparison?.context);
console.log("versus", p?.comparison?.versus);
console.log("legacy", p?.comparison?.legacy);
console.log("core", p?.comparison?.core);
console.log("fields", p?.comparison?.parity?.fields);
```

Expected:

```text
status: MATCH
method: rollBeginnerLuck
context: beginnerLuck
versus: true
pool/target/successes/outcome/margin: all true
```

- [ ] C1. Legacy Beginner's Luck pool/halving behaves exactly as before.
- [ ] C2. Opponent rolls exactly once through Legacy.
- [ ] C3. Parity status is MATCH, not SKIPPED.
- [ ] C4. target equals the real opponent success count.
- [ ] C5. All five parity fields are true.
- [ ] C6. Learning/attempt handling behaves exactly as before.

## D. Beginner's Luck Versus — initial tie / tiebreak

Repeat until the initial Beginner's Luck Versus result ties. Resolve the existing Legacy tie through **Roll Tiebreaker**.

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

- [ ] D1. Existing Legacy tie dialog still appears.
- [ ] D2. Legacy performs the real tiebreak dice.
- [ ] D3. CORE performs no live dice roll and no state/resource mutation.
- [ ] D4. Captured opponent target and tiebreak faces are replayed by CORE.
- [ ] D5. Final outcome and margin MATCH.
- [ ] D6. Learning remains correct; unresolved ties are not falsely counted.

## E. Fate / Open 6s within Beginner's Luck Versus

If practical, exercise Beginner's Luck Versus with Fate/Open-6.

- [ ] E1. Legacy spends Fate exactly once.
- [ ] E2. Supplemental faces are identical in Legacy and CORE.
- [ ] E3. Prepared Beginner's Luck pool does not inflate.
- [ ] E4. Final parity remains MATCH.

This is useful regression but C and D are the blocking qa.5 additions.

## F. qa.4 / qa.3 regression

- [ ] F1. Ordinary trained Skill → MATCH.
- [ ] F2. Ability → MATCH.
- [ ] F3. Ordinary Beginner's Luck → MATCH.
- [ ] F4. Fate/Open-6 → MATCH.
- [ ] F5. Automatic Versus non-tie → MATCH.
- [ ] F6. Automatic Versus resolved tiebreak → MATCH.

## G. M2 preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

Expected: SHADOW_COMPARE, liveApplication false, exactly 6 providers.

## H. Reload / duplicate observer

F5/reload, clear history, make exactly one ordinary Skill roll, then:

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

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass v1.5.0-qa.5 when real Beginner's Luck Versus produces MATCH parity for both a normal non-tie and a resolved Legacy tiebreak, all five comparison fields match, Legacy learning/resource behavior is unchanged, qa.3/qa.4 parity remains intact, M2 remains six-provider shadow-only, reload produces no duplicate observer, and Legacy Mixed remains the sole live authority.
