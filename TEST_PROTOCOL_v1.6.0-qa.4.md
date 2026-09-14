# TEST PROTOCOL — v1.6.0-qa.4

Scope: Real Legacy Mixed Nature usage is observed after completed rolls and compared against CORE NatureService predictions. Legacy Mixed remains the sole live writer.

## A — Version / status

```js
console.log(game.system.version);
console.log(game.realmGuard.core.m4.getStatus());
console.log(game.realmGuard.core.m4.natureParity.getStatus());
```

Expected:
- version `1.6.0-qa.4`
- M4 `SHADOW_SERVICES`
- `liveApplication: false`
- `authority: LEGACY_MIXED`
- Nature parity mode `REAL_LEGACY_NATURE_SHADOW_PARITY`
- `installed: true`
- `applyWrapped: true`

## B — Tap Nature within / PASS

Clear history:

```js
game.realmGuard.core.m4.natureParity.clear();
```

Run a normal Skill test with Tap Nature enabled, scope WITHIN, and obtain a PASS.

Then:

```js
console.log(game.realmGuard.core.m4.natureParity.getLatest());
```

Expected:
- `status: MATCH`
- `mode: tap`
- `scope: within`
- expected and actual tax `0`
- Current / Maximum unchanged
- all comparison fields true

## C — Tap Nature against / PASS

Run a Skill or Ability test with Tap Nature enabled, scope AGAINST, and obtain a PASS.

Expected latest parity:
- `status: MATCH`
- expected and actual tax `1`
- Current reduced by 1 unless collapse handling is triggered
- all comparison fields true

## D — Tap Nature fail

Run a tapped Nature test that FAILS with a visible margin greater than 0.

Expected:
- `status: MATCH`
- CORE expected tax equals Legacy tax
- resulting Current / Maximum match

## E — Direct Nature within

Run an ordinary direct Nature test with Nature use WITHIN.

Expected:
- `mode: direct`
- `scope: within`
- `status: MATCH`
- normal Legacy direct-within tax semantics preserved

## F — Direct Nature against

Run a direct Nature test with Nature use AGAINST.

A PASS should produce zero tax. A FAIL should produce tax based on failure margin.

Expected latest parity:
- `status: MATCH`
- `mode: direct`
- `scope: against`
- tax / Current / Maximum / collapsed all true

## G — Nature Versus

Run Nature Versus once.

Expected:
- `method: rollNatureVersus`
- `mode: direct-versus`
- `status: MATCH`
- M3 parity remains healthy

If practical, test AGAINST + FAIL and Double Tap. CORE and Legacy must still MATCH.

## H — Collapse boundary

For a disposable QA character, set Current Nature low enough that the next real Legacy Nature tax reaches 0.

Run a tax-producing Nature test.

Expected:
- Legacy performs its existing collapse behavior
- Maximum drops by 1
- Current resets to the new Maximum
- Nature parity `status: MATCH`
- `comparison.fields.collapsed: true`
- `comparison.fields.current: true`
- `comparison.fields.maximum: true`

Do not perform this on a production character unless the state is intentionally disposable/restorable.

## I — No Nature use = no Nature parity entry

Clear Nature parity, then perform a normal Skill roll without Tap Nature.

```js
console.log(game.realmGuard.core.m4.natureParity.getSummary());
```

Expected `observed: 0`.

## J — Preservation / reload

Reload Foundry, clear Nature parity, and run exactly one Nature-using test.

Expected:
- exactly one Nature parity observation
- no duplicate Nature tax
- one chat card
- no duplicate resource spend
- M3 parity remains MATCH
- M4 Advancement shadow still behaves normally

```js
console.log(game.realmGuard.core.m4.natureParity.getSummary());
console.log(game.realmGuard.core.testParity.getSummary());
console.log(game.realmGuard.core.m4.advancement.getSummary());
```

## K — Roll dialog scroll regression

Open a tall roll dialog and verify qa.3 scrolling remains intact.

## PASS gate

- Tap Nature within PASS: PASS
- Tap Nature against PASS: PASS
- Tap Nature failure tax: PASS
- Direct Nature within: PASS
- Direct Nature against: PASS
- Nature Versus: PASS
- Collapse Current / Maximum semantics: PASS
- No Nature use does not create Nature observation: PASS
- Reload / no duplicate observer: PASS
- M2/M3/Advancement preservation: PASS
- Roll dialog scroll preserved: PASS
- Legacy remains sole Nature writer: PASS
