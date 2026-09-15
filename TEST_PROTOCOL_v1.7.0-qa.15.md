# Realm Guard / Torchbearer — TEST PROTOCOL v1.7.0-qa.15

## Scope
M5 promotion-readiness gate. No live takeover. Legacy Mixed remains sole authority.

## Baseline
- Foundry VTT 13.351
- System v1.7.0-qa.15
- `game.realmGuard.core.m5.getStatus()` must show:
  - `mode: "SHADOW_PARITY"`
  - `liveApplication: false`
  - `authority: "LEGACY_MIXED"`

## A. Reset QA session
Run:
```js
game.realmGuard.core.m5.parity.clear()
game.realmGuard.core.m5.readiness()
```
Expected: `PARTIAL`, because required live paths have not all been exercised yet.

## B. Accepted Inventory live path
Perform one legal Equipment move, e.g. Sword to an empty hand or Gear into an active container.
Expected parity event:
- domain `inventory`
- source `LIVE_INVENTORY_WRITE`
- `legacyAccepted: true`
- `parity: "MATCH"`

## C. Rejected Inventory live path
Perform one deliberately illegal drop, e.g. ordinary Gear onto Cloak or into an occupied hand.
Expected parity event after the rejection observer delay:
- domain `inventory`
- source `LIVE_INVENTORY_REJECT`
- `legacyAccepted: false`
- `coreAccepted: false`
- `parity: "MATCH"`

## D. Conflict declaration live path
Start a Fight and reveal an action with a Weapon / Tool selected.
Expected event:
- operation `DECLARED_TOOL_PROVIDER`
- source `LIVE_CONFLICT_DECLARATION`
- `parity: "MATCH"`

## E. Conflict roll live path
Resolve a real Conflict action with a Weapon / Tool effect.
Expected event:
- operation `EVALUATE_TOOL`
- source `LIVE_CONFLICT_ROLL`
- `parity: "MATCH"`

## F. Conflict disable / Disarm live path
Resolve a successful Maneuver with margin 3+, choose Disarm, and disable an equipped Gear item.
Expected event:
- operation `DISABLE_STATE`
- source `LIVE_CONFLICT_DISABLE`
- `legacyDisabled: true`
- `coreDisabled: true`
- `parity: "MATCH"`

## G. Promotion readiness
Run:
```js
game.realmGuard.core.m5.readiness()
```
PASS target:
- `status: "READY_FOR_CONTROLLED_HANDOFF"`
- `ready: true`
- `missing: []`
- `mismatchCoverage: []`
- `totalMismatches: 0`

This status means only that the required observed paths have clean shadow parity. It does NOT activate CORE live authority.

## H. Mismatch gate
Run:
```js
game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })
```
Expected: empty array.
Any mismatch blocks promotion consideration.

## I. Regression checks
- Ranger sheet scroll position remains stable across rerenders.
- Equipment layout and ancestry/custom figure controls unchanged.
- PC portrait and token workflow unchanged.
- Existing custom/narrative Conflict Tools remain available according to their saved configuration.
- M2/M3/M4 representative tests remain functional.
- No new console errors.

## PASS / FAIL
PASS if readiness reaches `READY_FOR_CONTROLLED_HANDOFF`, mismatch list is empty, and live authority remains Legacy Mixed.
FAIL if any required coverage remains missing after being exercised, any unexplained mismatch appears, or CORE takes live authority.
