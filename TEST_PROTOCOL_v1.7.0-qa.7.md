# TEST PROTOCOL — v1.7.0-qa.7

## Scope
Equipment Figure UI cleanup. Custom path / Fit / Zoom / Horizontal / Vertical are moved out of the Inventory panel into a gear-button settings dialog. Source + Ancestry remain visible. No inventory mechanics change.

## A — Version / status
```js
console.log(game.system.version);
console.log(game.realmGuard.inventory.figure.getStatus());
```
Expected:
- `1.7.0-qa.7`
- `framingControls: "SETTINGS_DIALOG"`
- `inventoryRulesChanged: false`

## B — Clean Inventory header
Open Ranger -> Inventory.
Expected:
- Source remains visible.
- Ancestry remains visible.
- one gear button is visible beside the compact controls.
- Custom Image Path / Fit / Zoom / Horizontal / Vertical are NOT displayed inline.
- no duplicate controls after reopen/F5.

## C — Settings dialog
Click the gear icon.
Expected dialog:
- Custom image path
- Fit
- Zoom
- Horizontal
- Vertical
- Apply
- Cancel

## D — Apply
In Custom Figure mode, change Zoom/X/Y and Apply.
Expected:
- dialog closes
- figure updates
- values persist after F5/reopen
- inventory placement/data unchanged

## E — Cancel
Open settings, change fields, press Cancel.
Expected:
- no saved changes
- current figure framing remains unchanged

## F — Custom built-in fallback
Custom Figure + empty custom path.
Expected:
- built-in gray humanoid remains
- no broken image

## G — Ancestry mode
Switch to Ancestry Figure and test Human/Dunadan/Elf/Dwarf/Halfling.
Expected:
- ancestry assets continue to switch automatically
- settings button remains available
- ancestry figures keep their fixed ancestry framing
- settings remain stored for Custom Figure

## H — Inventory regression
Check:
- gear drag/drop
- Head/Neck/Cloak/Torso/Hands/Belt/Pocket/Feet
- 2H lock
- capacities
- containers
- reload persistence

## I — M5 CORE regression
```js
console.log(game.realmGuard.core.m5.getStatus());
```
Expected M5 shadow services unchanged and `liveApplication:false`.

## J — M2/M3/M4 regression
Perform one normal roll and one Nature/Condition roll.
Expected no new mismatch or duplicate write.

## PASS gate
- Compact Figure header PASS
- Gear settings button PASS
- Dialog fields PASS
- Apply persistence PASS
- Cancel safety PASS
- Custom gray fallback PASS
- Ancestry switching PASS
- Inventory unchanged PASS
- M5 CORE preserved PASS
- M2/M3/M4 preserved PASS
