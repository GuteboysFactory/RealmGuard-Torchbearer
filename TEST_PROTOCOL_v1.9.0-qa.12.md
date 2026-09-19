# Realm Guard / Torchbearer v1.9.0-qa.12 — M7 Phase Change Live Handoff QA

## Scope

This build promotes one additional M7 session operation to live CORE authority:

- `PLAYER_TURN_TEST_CLAIM` remains live in CORE M7.
- `PASS_CHECK` remains live in CORE M7.
- `DONE_DISCARD` remains live in CORE M7.
- `PHASE_CHANGE` is now live in CORE M7.

Legacy Mixed still owns:
- Recovery
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Phase changes remain GM-triggered. CORE decides the phase transition plan; the existing Foundry settings/Actor mutations are still committed by the GM client.

## Phase-change semantics under test

CORE M7 now plans:
- GM Turn -> Players' Turn
- Players' Turn -> GM Turn
- no-op when already in the requested phase
- increment of `turnCycleId` exactly once on a real phase change
- reset of `playerTurnLastActor`
- discard of all remaining Checks when leaving Players' Turn for GM Turn
- preservation of `sessionCycle`
- one `PHASE_CHANGED` lifecycle observation after commit

Legacy Mixed computes the same plan independently as a parity guard.

If CORE and Legacy disagree:
- only the Phase Change handoff rolls back
- Legacy Mixed phase behavior is applied
- Claim / Pass Check / Done handoffs remain independently enabled

## Startup gate

Run:

```js
game.realmGuard.core.m7.getStatus()
```

Expected:
- `buildScope: "TURN_SESSION_HANDOFFS"`
- `mode: "PARTIAL_LIVE_HANDOFF"`
- `authority: "CORE_M7_TURN_SESSION_LEGACY_REMAINDER"`
- `liveApplication: true`

Run:

```js
game.realmGuard.core.m7.phaseHandoffStatus()
```

Expected:
- `enabled: true`
- `mode: "CORE_PHASE_LEGACY_SESSION"`
- `phaseAuthority: "CORE_M7"`
- `mismatches: 0`
- `errorFallbacks: 0`

Also verify Claim / Transfer / Finish handoffs remain enabled.

## Gate A — GM Turn -> Players' Turn

From GM Turn:
1. Note current `turnCycleId`.
2. Start Players' Turn.

Expected:
- phase becomes `player`
- `turnCycleId` increments exactly once
- `playerTurnLastActor` resets to empty
- no Checks are discarded
- Rangers receive fresh transient Players' Turn state via the new cycle id
- one phase chat message
- one lifecycle `PHASE_CHANGED` observation

Check:

```js
game.realmGuard.core.m7.phaseHandoffStatus()
```

Expected `matches >= 1`, zero mismatches.

## Gate B — Players' Turn -> GM Turn with unused Checks

During Players' Turn:
1. Give at least two Rangers non-zero Checks.
2. Note `turnCycleId`.
3. Start GM Turn.

Expected:
- phase becomes `gm`
- `turnCycleId` increments exactly once
- last actor resets
- every remaining Check is discarded to 0
- phase chat lists discarded Checks once
- no duplicate Actor mutation
- one lifecycle `PHASE_CHANGED` observation

## Gate C — same-phase no-op

While already in GM Turn, request GM Turn again.

Expected:
- returns cleanly
- phase unchanged
- `turnCycleId` unchanged
- no Check mutation
- no duplicate lifecycle event
- no duplicate chat message

Repeat similarly for Players' Turn if useful.

## Gate D — transient state reset

1. During Players' Turn, use a Ranger's Free Test and/or mark Done.
2. Change to GM Turn.
3. Change back to Players' Turn.

Expected:
- new `turnCycleId`
- prior transient state is no longer active
- Free Test is available again
- Done is false in the new cycle
- previous last-actor alternation state does not leak forward

## Gate E — multi-client synchronization

With GM + Player clients open:
1. GM changes phase.
2. Confirm Player sees the same phase and Check values.
3. Change back after generating some Players' Turn state.

Expected:
- both clients synchronize
- no duplicate settings writes
- no socket/permission errors
- phase telemetry records parity matches

## Gate F — independent Phase rollback

Disable only Phase Change CORE authority:

```js
game.realmGuard.core.m7.setCorePhaseEnabled(false)
```

Confirm:

```js
game.realmGuard.core.m7.phaseHandoffStatus()
```

Expected:
- `enabled: false`
- `mode: "LEGACY_ROLLBACK"`
- `phaseAuthority: "LEGACY_MIXED"`

Confirm Claim / Transfer / Finish remain enabled.

Perform both phase directions.

Expected:
- Legacy phase changes still work correctly
- Checks discard correctly on Players' -> GM
- other CORE handoffs remain active

Re-enable:

```js
game.realmGuard.core.m7.setCorePhaseEnabled(true)
game.realmGuard.core.m7.resetPhaseHandoffTelemetry()
```

## Regression

Quickly re-check:
- Free Test
- paid Players' Turn test
- alternation block
- Pass Check
- Done / Discard
- Recovery spend/refund
- Trait Against -> Check
- End Session
- reward parity
- lifecycle
- sessionCycle remains separate from turnCycleId

## PASS criteria

v1.9.0-qa.12 passes when:
- both phase directions preserve verified Legacy Mixed behavior
- turnCycleId increments once per real phase change and not on same-phase no-op
- leaving Players' Turn discards all remaining Checks exactly once
- transient Players' Turn state resets through cycle separation
- lifecycle observation occurs once per real phase change
- CORE phase telemetry shows parity matches with zero normal-QA mismatches
- independent Phase rollback works
- qa.8 / qa.9 / qa.11 handoffs remain regression-safe
