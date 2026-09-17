# Realm Guard / Torchbearer v1.8.0-qa.7 — Conflict Parchment UI Prototype QA

## Scope
Visual-only prototype for the Conflict Window and Conflict-owned DialogV2 windows.

No Conflict rules, M6 state transitions, sockets, roll resolution, Weapon/Tool scope, advancement, Nature, Learning or compromise rules are intentionally changed.

## Visual direction
- Warm parchment background with ornamental corners.
- Dark title chrome with brass/gold trim.
- Parchment information panels for readability.
- Rangers use restrained forest-green accents.
- GM / Opposition uses restrained wine/brown accents.
- Current Action receives stronger visual priority.
- Conflict roll dialogs share the same parchment identity.

## QA

### A. Conflict Window
1. Open a new Conflict.
2. Verify parchment background is visible without reducing text readability.
3. Verify Goals are clearly separated GM vs Rangers.
4. Verify Disposition bars remain readable.
5. Verify Planning panels, three Action slots and Exchange Weapon / Tool controls remain usable.
6. Verify Current Action is visually prominent.
7. Verify Maneuver and Compromise content remain readable.
8. Resize the window smaller/larger and confirm scrolling/resizing still works.
9. Minimize/restore and drag the window.

### B. Conflict roll dialog
1. Open an Action roll.
2. Verify parchment background and dark title chrome.
3. Verify Skill / Ability selection, Modifier, Extra Dice, Weapon/Tool, Teamwork, Nature, Persona, Trait, Wise, Token and Talent controls remain readable and clickable.
4. Verify Roll and Cancel buttons remain visible.
5. Verify roll dialog still appears above the Conflict Window.

### C. Other Conflict-owned dialogs
Check at least:
- Conflict setup
- Goal editor
- Starting Disposition method
- Disarm
- Custom Conflict Tool

Confirm parchment background does not break form readability.

### D. Functional regression
Run one complete Conflict and confirm:
- Goals
- Starting Disposition
- hidden planning
- Exchange Weapon / Tool
- Action reveal
- roll resolution
- Maneuver
- Action / Exchange advancement
- Conflict end / Compromise
all behave exactly as v1.8.0-qa.6.

### E. M6 telemetry
After the run:
```js
game.realmGuard.core.m6.handoffStatus()
game.realmGuard.core.m6.stateHandoffStatus()
game.realmGuard.core.m6.getStatus()
```
Expected: no new mismatches, no error fallback, no rollback.
