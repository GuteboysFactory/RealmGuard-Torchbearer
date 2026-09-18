# Realm Guard / Torchbearer v1.9.0-qa.9 — M7 Pass Check Live Handoff QA

## Scope

This build expands live CORE M7 Session Engine authority by one bounded operation:

- `PLAYER_TURN_TEST_CLAIM` remains live in CORE M7 from qa.8.
- `PASS_CHECK` is now also live in CORE M7.

Legacy Mixed still owns:
- Done / Discard
- phase changes
- Recovery
- Trait Against Check award
- End Session
- remaining session/lifecycle commits

Player requests remain serialized through the existing primary-GM authority bridge.

## Safety model

Every Pass Check is calculated twice:
1. Legacy Mixed builds a read-only transfer plan.
2. CORE M7 builds its transfer plan.

If the plans match, CORE M7 is the live decision authority and the shared commit path applies the result.

If they disagree, only the Pass Check handoff disables itself and Legacy Mixed is applied.

A CORE transfer-planning exception also disables only the Pass Check handoff and falls back to Legacy Mixed.

The qa.8 claim handoff has its own independent rollback state.

## Startup gate

Run:

```js
game.realmGuard.core.m7.getStatus()
```

Expected:
- `buildScope: "PLAYER_TURN_ACTION_CURRENCY_HANDOFF"`
- `mode: "PARTIAL_LIVE_HANDOFF"`
- `authority: "CORE_M7_TURN_CURRENCY_LEGACY_SESSION"`
- `liveApplication: true`

Run:

```js
game.realmGuard.core.m7.transferHandoffStatus()
```

Expected:
- `enabled: true`
- `mode: "CORE_TRANSFER_LEGACY_SESSION"`
- `transferAuthority: "CORE_M7"`
- `autoRollbackOnDisagreement: true`
- `fallbackOnCoreError: true`
- telemetry counters 0 after reload

Also verify the qa.8 claim handoff is still enabled:

```js
game.realmGuard.core.m7.claimHandoffStatus()
```

Expected:
- `enabled: true`
- `claimAuthority: "CORE_M7"`

## Gate A — legal Pass Check

During Players' Turn:
1. Ranger A has at least 1 Check.
2. Ranger B has 0 Checks.
3. Pass exactly 1 Check from A to B.

Expected:
- A decreases by exactly 1.
- B increases from 0 to 1.
- `donatedGiven` increments for A.
- `donatedReceived` increments for B.
- B is not left Done after receiving a Check.
- existing chat message remains unchanged.

Run:

```js
game.realmGuard.core.m7.transferHandoffStatus()
```

Expected:
- `matches >= 1`
- `mismatches: 0`
- `transferAuthority: "CORE_M7"`

## Gate B — multi-Check transfer

With donor having enough Checks and recipient still on 0:
- pass 2 Checks in one action.

Expected:
- donor -2
- recipient +2
- donation counters increment by 2
- no duplicate mutation

## Gate C — recipient already has Checks

Attempt Pass Check to a Ranger who already has at least 1 Check.

Expected:
- blocked
- neither Actor's Checks change
- no donation-state mutation
- existing warning remains
- handoff stays enabled
- telemetry records a match

## Gate D — donor insufficient

Attempt to pass more Checks than the donor currently owns.

Expected:
- blocked
- no negative Checks
- no partial transfer
- no state mutation
- handoff stays enabled

## Gate E — invalid/self transfer

Where UI permits, attempt donor → same donor.

Expected:
- blocked
- no mutation

The normal UI may prevent selecting this directly; if so, this gate can be considered structurally covered by smoke QA unless an actual UI path permits it.

## Gate F — multiplayer

From a non-GM player client:
- pass 1 Check from a player-owned Ranger to another Ranger with 0 Checks.

Expected:
- request routes through primary GM
- GM commits once
- both clients synchronize
- no duplicate transfer
- no permission/socket errors
- transfer telemetry shows a CORE/Legacy match

## Gate G — Pass Check rollback

Disable only Pass Check CORE authority:

```js
game.realmGuard.core.m7.setCoreTransferEnabled(false)
```

Confirm:

```js
game.realmGuard.core.m7.transferHandoffStatus()
```

Expected:
- `enabled: false`
- `mode: "LEGACY_ROLLBACK"`
- `transferAuthority: "LEGACY_MIXED"`

Perform a normal legal Pass Check.

Expected:
- transfer still works via Legacy Mixed
- claim handoff remains independently enabled

Re-enable:

```js
game.realmGuard.core.m7.setCoreTransferEnabled(true)
game.realmGuard.core.m7.resetTransferHandoffTelemetry()
```

## Regression

Re-check:
- Free Test
- paid Players' Turn test
- alternation guard
- Done guard
- no Checks guard
- NPC / Free Play
- Done / Discard
- Recovery spend/refund
- Trait Against Check award
- GM Turn ↔ Players' Turn
- End Session
- reward parity
- lifecycle
- sessionCycle / turnCycleId

## PASS criteria

v1.9.0-qa.9 passes when:
- legal and blocked Pass Check paths retain verified Legacy behavior
- CORE_M7 is reported as Pass Check decision authority
- transfer telemetry records matches with zero mismatches during normal QA
- multiplayer remains serialized by the primary GM
- Pass Check rollback works independently of claim rollback
- qa.8 claim behavior and all deferred Legacy operations remain regression-safe
