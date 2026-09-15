# Realm Guard / Torchbearer v1.7.0-qa.14 — QA Protocol

## Scope
Fix physical Conflict weapon source-of-truth. In Fight/Fight Creature, names that represent physical weapons (Sword, Staff, Bow, etc.) must come from currently held Gear, not stale/saved Conflict Tool flags. Narrative/custom tools remain supported.

## Baseline
1. Install v1.7.0-qa.14 on Foundry v13.351.
2. Confirm normal world load and no new console error.
3. Confirm `game.realmGuard.core.m5.getStatus()` still reports `liveApplication:false` and `authority:"LEGACY_MIXED"`.

## Primary reproduction
1. Open the same Ranger used in qa.13.
2. Equip Shield in one hand and Sword in the other.
3. Start a Fight Conflict and enter Ranger Planning.
4. Open Weapon / Tool for that Ranger.

PASS:
- Sword is available because Sword is actually held.
- Shield is available because Shield is actually held.
- A stale/saved Staff entry is NOT offered merely because a previous custom Conflict Tool named Staff exists.
- No phantom physical weapon appears that is not currently held.

## Equipment change
1. Before a new Fight, unassign Sword and equip Staff instead.
2. Start a fresh Fight.

PASS:
- Staff is now available because Staff is actually held.
- Sword is no longer available from physical Gear.

## Narrative/custom tool preservation
1. Create or use a non-physical custom tool, e.g. Evidence, Superior Position, Threatening Display.
2. Use a conflict type for which it is valid.

PASS:
- The custom tool remains available according to its configured conflict types.
- The physical-source guard does not remove normal narrative tools.

## Regression
- Conflict planning still locks/reveals correctly.
- Existing M5 declaration and roll parity remains active.
- Equipment drag/drop still works.
- qa.12 scroll persistence still works.
- No M2/M3/M4 regression.

## Final check
Run:
`game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })`

PASS: no new unexplained mismatch caused by the source guard.
