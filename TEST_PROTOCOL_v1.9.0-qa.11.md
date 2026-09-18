# Realm Guard / Torchbearer v1.9.0-qa.11 — M7 Done / Discard Live Handoff QA

## Scope

This build expands live CORE M7 Players' Turn authority by one bounded operation:

- `PLAYER_TURN_TEST_CLAIM` remains live in CORE M7.
- `PASS_CHECK` remains live in CORE M7.
- `DONE_DISCARD` is now live in CORE M7.

Legacy Mixed still owns:
- phase changes
- Recovery
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Player requests remain serialized through the existing primary-GM authority bridge.

## Safety model

Every Done / Discard action is planned twice:
1. Legacy Mixed builds a read-only finish plan.
2. CORE M7 builds its finish plan.

If the plans match, CORE M7 is the live decision authority and the shared commit path applies:
- actor marked Done
- unused Checks discarded to 0
- existing Players' Turn state preserved
- existing chat output preserved

If they disagree, only the Done / Discard handoff disables itself and Legacy Mixed is applied.

A CORE planning exception also disables only the Done / Discard handoff and falls back to Legacy Mixed.

Claim, Pass Check and Done / Discard maintain independent rollback switches.

## Startup gate

Run:

```js
game.realmGuard.core.m7.getStatus()
```

Expected:
- `buildScope: "PLAYER_TURN_HANDOFFS"`
- `mode: "PARTIAL_LIVE_HANDOFF"`
- `authority: "CORE_M7_PLAYER_TURN_LEGACY_SESSION"`
- `liveApplication: true`

Run:

```js
game.realmGuard.core.m7.finishHandoffStatus()
```

Expected:
- `enabled: true`
- `mode: "CORE_FINISH_LEGACY_SESSION"`
- `finishAuthority: "CORE_M7"`
- `autoRollbackOnDisagreement: true`
- `fallbackOnCoreError: true`
- telemetry counters 0 after reload

Also verify:

```js
game.realmGuard.core.m7.claimHandoffStatus()
game.realmGuard.core.m7.transferHandoffStatus()
```

Both should remain enabled and CORE M7 authoritative for their bounded operations.

## Gate A — Done with unused Checks

During Players' Turn:
1. Ranger has at least 2 unused Checks.
2. Use Done / Discard.

Expected:
- Ranger becomes Done
- Checks become exactly 0
- discarded amount equals previous Check total
- other Players' Turn state remains unchanged
- existing chat message reports discarded Checks once
- no duplicate mutation

Run:

```js
game.realmGuard.core.m7.finishHandoffStatus()
```

Expected:
- `matches >= 1`
- `mismatches: 0`
- `finishAuthority: "CORE_M7"`

## Gate B — Done with zero Checks

Use Done / Discard on a Ranger with 0 Checks.

Expected:
- Ranger becomes Done
- Checks remain 0
- no fake discard amount
- state changes once
- handoff remains enabled

## Gate C — already Done

Invoke Done / Discard again where the UI permits.

Expected Legacy parity:
- no unexpected Check change
- Done remains true
- no CORE/Legacy disagreement

If normal UI prevents this path, smoke QA provides structural coverage.

## Gate D — wrong phase

Attempt or invoke Done outside Players' Turn where possible.

Expected:
- operation blocked
- no state mutation
- handoff remains enabled
- Legacy and CORE agree

## Gate E — multiplayer

From a non-GM player client:
- use Done / Discard on a player-owned Ranger with unused Checks.

Expected:
- request routes through primary GM
- GM commits exactly once
- both clients synchronize
- Ranger Done
- Checks 0
- no duplicate chat/state mutation
- no permission/socket errors
- telemetry records a match

## Gate F — independent Done rollback

Disable only Done / Discard CORE authority:

```js
game.realmGuard.core.m7.setCoreFinishEnabled(false)
```

Confirm:

```js
game.realmGuard.core.m7.finishHandoffStatus()
```

Expected:
- `enabled: false`
- `mode: "LEGACY_ROLLBACK"`
- `finishAuthority: "LEGACY_MIXED"`

Confirm claim and transfer remain enabled.

Perform a normal Done / Discard.

Expected:
- Legacy Mixed still completes the action correctly
- other CORE handoffs remain active

Re-enable:

```js
game.realmGuard.core.m7.setCoreFinishEnabled(true)
game.realmGuard.core.m7.resetFinishHandoffTelemetry()
```

## Regression

Quickly re-check:
- Free Test
- paid Players' Turn test
- alternation guard
- Pass Check
- Recovery spend/refund
- Trait Against Check award
- GM Turn ↔ Players' Turn
- End Session
- reward parity
- lifecycle
- sessionCycle / turnCycleId

## PASS criteria

v1.9.0-qa.11 passes when:
- Done / Discard retains verified Legacy Mixed behavior
- CORE M7 is reported as Done / Discard decision authority
- parity telemetry shows matches with zero mismatches in normal QA
- multiplayer remains serialized by primary GM
- Done rollback works independently
- qa.8/qa.9 live handoffs remain regression-safe

## Packaging note

The main branch already contained the unreleased GM Dock Host Contract v2 changes prepared as qa.10. qa.10 was not published because an older qa.9 smoke had an exact-version assertion. That smoke guard is now corrected. qa.11 therefore packages those current-main GM Dock Host v2 changes together with this M7 Done / Discard handoff.
