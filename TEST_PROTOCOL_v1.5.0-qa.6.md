# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.6

**Build:** v1.5.0-qa.6 — CORE M3 Beginner's Luck Versus UI bridge + focused parity QA  
**Foundry target:** 13.351  
**Approved regression baseline:** qa.5 non-BL-Versus checks PASS  
**Internal system id:** `realm-guard`  
**Gameplay authority:** Legacy Mixed  
**CORE live application:** OFF

qa.6 exposes the already-supported Legacy Beginner's Luck Versus path in the Ranger sheet so the remaining qa.5 parity cases can be tested normally.

## A. Install / UI

- [ ] A1. Install/update to `1.5.0-qa.6`.
- [ ] A2. World launches without new Realm Guard console-breaking errors.
- [ ] A3. Open a Ranger sheet > Skills > Untrained.
- [ ] A4. Each untrained Skill row now exposes a visible `VERSUS` checkbox/toggle.
- [ ] A5. Toggle one untrained Skill ON, close/reopen or refresh the sheet, and confirm it remains ON.
- [ ] A6. Toggle it OFF and confirm it persists OFF.

## B. Status

Run:

```js
console.log(game.system.version);
console.log(game.realmGuard.core.tests.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
```

Expected:

```text
1.5.0-qa.6
Test Engine mode: SHADOW_PARITY
Test Engine liveApplication: false
parity authority: LEGACY_MIXED
supportedSpecialResolution includes BEGINNER_LUCK_VERSUS
```

## C. Beginner's Luck Versus — non-tie

1. Target exactly one valid opponent token.
2. Enable `VERSUS` on one untrained Skill.
3. Click that Skill to use the normal Beginner's Luck flow.
4. Choose a valid offered opposition.
5. Complete a result that does not require a secondary tie if practical.

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

- [ ] C1. Normal Legacy Beginner's Luck UI works.
- [ ] C2. Opponent roll is shown/used normally.
- [ ] C3. Parity status = MATCH.
- [ ] C4. All five parity fields = true.
- [ ] C5. Learning increments only once when the test is resolved.

## D. Beginner's Luck Versus — resolved tiebreak

Repeat Beginner's Luck Versus until initial successes tie. Resolve through the existing Legacy tie flow, preferably `Roll Tiebreaker`.

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

- [ ] D1. Legacy still owns the tie dialog.
- [ ] D2. Legacy still rolls all real tiebreak dice.
- [ ] D3. CORE performs no extra live dice roll or state mutation.
- [ ] D4. CORE replays captured real Legacy tie data.
- [ ] D5. Final outcome and margin MATCH.
- [ ] D6. Learning is not duplicated.

## E. Minimal preservation check

The rest of qa.5 was already reported PASS, so only do a quick safety check:

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

Expected:

```text
Effect Engine: SHADOW_COMPARE
liveApplication: false
provider count: 6
```

- [ ] E1. M2 still has exactly six providers.
- [ ] E2. M2 live application remains OFF.
- [ ] E3. M3 live application remains OFF.

## PASS gate

Pass v1.5.0-qa.6 when the new untrained VERSUS toggle is visible and persistent, a real non-tie Beginner's Luck Versus produces MATCH parity, a real resolved Beginner's Luck Versus tiebreak produces MATCH parity, learning/state changes are not duplicated, and M2/M3 remain shadow-only with Legacy Mixed authoritative.
