# TEST PROTOCOL — v1.13.0-qa.25

## QA25 — M10D.21 Character Creation Preview/Review Boundary
Foundry VTT 13.351 · Stable remains v1.12.0 · Legacy stays active

QA25 reuses the already-registered CORE M9 Character Creator and M10D.15 TB2E creation shadows. It adds a GM-only, memory-only QA handoff to check the TB2E profile lock, one existing creation preview, the CORE M9 review result and the blocked commit boundary. No player-facing creator is added. No Actor, Item, Journal, setting or Chat Message is created or changed. No random roll is run. Evidence resets on reload.

QA25 also removes the QA24 GM-only Foundry World Inventory Report and its generated source-inventory report tooling from the active package and release checks. The inventory report is no longer needed. This does not remove game inventory, equipment or storage rules. QA22–24 protocols/releases remain historical records and are not rewritten.

### Before you test

- Install v1.13.0-qa.25 through the existing QA update channel and reload the same test world.
- Confirm **Legacy Mixed** is still the active profile. Do not switch profiles.
- Do not create or edit any character, item, journal, setting, compendium entry or other world record.
- Confirm that **Foundry World Inventory Report** is no longer listed in the GM Dock.
- Open the browser developer console (F12) as GM.

### Run the four handoff checks

Run each command separately and check that the returned object has `ok: true`.

1. Confirm TB2E remains locked:
   `game.realmGuard.core.m10d.controlledCreation.runHandoff("CREATION_PROFILE_LOCKED")`
2. Confirm the existing class/stock plan is preview-only:
   `game.realmGuard.core.m10d.controlledCreation.runHandoff("M10D_CREATION_PREVIEW_ONLY")`
3. Confirm CORE M9 review is read-only and grants nothing:
   `game.realmGuard.core.m10d.controlledCreation.runHandoff("CORE_M9_REVIEW_ONLY")`
4. Confirm the commit plan is rejected:
   `game.realmGuard.core.m10d.controlledCreation.runHandoff("CORE_M9_COMMIT_BLOCKED")`

Then run:
`game.realmGuard.core.m10d.controlledCreation.getStatus()`

Confirm `executedCaseCount=4`, `passedCaseCount=4`, `failedCaseCount=0`, no pending cases, `profileInactive=true`, `activationAvailable=false`, `liveParityVerified=false`, and all write counters are zero. The commit case should report a rejected commit plan with a FOUNDATION_ONLY/preflight reason.

### Reload and report

- Reload the world. Run `game.realmGuard.core.m10d.controlledCreation.getStatus()` again.
- Confirm evidence reset to zero executed/four pending. The active profile must still be Legacy Mixed.
- Report PASS/FAIL for the four cases, whether the inventory report disappeared from GM Dock, and whether any unexpected dialog/error appeared.
- Do not attempt to activate TB2E or commit a character as part of this test.

A PASS verifies only this QA handoff and its no-write boundary. It does not close M10D.10, authorize a TB2E creation commit, establish full live parity, or change any other M10D gate.
