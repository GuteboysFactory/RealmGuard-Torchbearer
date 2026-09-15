# Realm Guard / Torchbearer — TEST PROTOCOL v1.7.0-qa.20

## Scope
M5 controlled live handoff, step 1: Inventory placement validation.

CORE M5 becomes the live validation authority only for:
- PLACE_ZONE
- PLACE_CONTAINER

The existing Legacy Mixed writer remains the only writer. Conflict remains Legacy Mixed. Unassign/detach remain Legacy Mixed. Any CORE validation error or CORE/Legacy validation disagreement automatically trips session rollback to Legacy Mixed.

## 1. Start status
Run:

```js
game.realmGuard.core.m5.getStatus()
game.realmGuard.core.m5.inventory.handoffStatus()
```

Expected:
- `mode: "PARTIAL_LIVE_HANDOFF"`
- `liveApplication: true`
- `authority.inventoryValidation: "CORE_M5"`
- `authority.inventoryWriter: "LEGACY_MIXED"`
- `authority.conflict: "LEGACY_MIXED"`
- handoff `enabled: true`
- handoff `mode: "CORE_VALIDATE_LEGACY_WRITE"`
- `autoRollbackOnDisagreement: true`
- `fallbackOnCoreError: true`

Reset telemetry before live testing:

```js
game.realmGuard.core.m5.inventory.resetHandoffTelemetry()
```

## 2. Legal zone placement
Drag a legal Gear item to a valid slot, e.g. Sword to an empty hand.

Expected:
- move succeeds
- UI behaves exactly as before
- no new console error
- `handoffStatus().telemetry.coreAccepted` increments
- latest history event has `outcome: "CORE_ACCEPT_WRITE"`
- `validationAuthority: "CORE_M5"`
- `writerAuthority: "LEGACY_MIXED"`

Check:

```js
game.realmGuard.core.m5.inventory.handoffHistory().slice(-5)
```

## 3. Illegal zone placement
Attempt at least two rejected placements, e.g.:
- non-cloak item to Cloak
- item into occupied hand
- 2H item while opposite hand is occupied
- oversized/bundled item to Belt or Pocket

Expected:
- each move is rejected
- same user-facing rejection as before
- item remains in original location
- telemetry `coreRejected` increments
- latest event has `outcome: "CORE_REJECT"`
- no rollback

## 4. Legal container placement
Equip an active Backpack/Satchel and move a valid item into it.

Expected:
- item moves into the container
- `coreAccepted` increments
- history shows `PLACE_CONTAINER` + `CORE_ACCEPT_WRITE`
- writer remains Legacy Mixed

## 5. Illegal container placement
Test one or more:
- item into inactive Backpack/Satchel
- item that exceeds remaining capacity
- container into another container

Expected:
- rejected by CORE
- no data mutation
- `coreRejected` increments
- no rollback

## 6. Legacy-only operations preserved
Use Unassign and any container-detach flow currently exposed.

Expected:
- behavior unchanged
- these operations are not claimed as CORE live validation in `handoffStatus()`

## 7. Manual rollback test
Run:

```js
game.realmGuard.core.m5.inventory.rollback("QA_MANUAL_ROLLBACK")
game.realmGuard.core.m5.inventory.handoffStatus()
```

Expected:
- `enabled: false`
- `mode: "LEGACY_ROLLBACK"`
- `validationAuthority: "LEGACY_MIXED"`
- `rollbackReason: "QA_MANUAL_ROLLBACK"`

Perform one legal and one illegal inventory placement.

Expected:
- old Legacy Mixed behavior still works
- telemetry `rollbackDecisions` increments

Re-enable:

```js
game.realmGuard.core.m5.inventory.enableCoreValidation()
```

Expected `enabled: true` and `validationAuthority: "CORE_M5"`.

## 8. Safety gate
Run:

```js
game.realmGuard.core.m5.inventory.handoffStatus()
game.realmGuard.core.m5.inventory.handoffHistory()
game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })
```

PASS requires:
- `disagreements: 0`
- `errorFallbacks: 0`
- CORE accepted and rejected paths both observed
- no unexpected parity mismatch
- handoff remains enabled after normal testing

If `disagreements > 0`, `errorFallbacks > 0`, or handoff automatically flips to `LEGACY_ROLLBACK`, STOP and report the history entry. Do not patch from assumption; diagnose the recorded failure first.

## 9. Regression checks
- qa.19 smart-select scrolling still works in Recruitment
- Ranger sheet keeps scroll position on rerender
- Conflict flow remains Legacy Mixed and behaves as before
- Disarm still works
- Equipment paper-doll layout unchanged
- portrait/token workflow unchanged
- no new console errors

## PASS definition
qa.20 passes when CORE is demonstrably the live validation authority for zone/container placement, the existing writer remains stable, legal and illegal decisions are correct, rollback works, and telemetry shows zero disagreements/errors.