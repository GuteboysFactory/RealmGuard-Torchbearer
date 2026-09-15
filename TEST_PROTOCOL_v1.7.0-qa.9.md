# TEST PROTOCOL — v1.7.0-qa.9

## Scope
Foundry forward-compatibility hardening plus Equipment Figure toolbar responsiveness.

This build removes Realm Guard's dependency on reading Foundry's deprecated global `FilePicker` alias by installing a namespaced compatibility bridge before the main system module loads. The supported manifest range is Foundry v13 through v14; v13.351 remains the currently verified runtime until v14 QA is run directly.

No gameplay mechanics change.

## A — Version / manifest
```js
console.log(game.system.version);
console.log(game.system.compatibility);
console.log(game.realmGuard.compat?.getStatus?.());
```
Expected:
- version `1.7.0-qa.9`
- minimum `13`
- maximum `14`
- currently verified `13.351`
- compatibility status scope `FOUNDRY_V13_V14_COMPAT`
- target API `foundry.applications.apps.FilePicker.implementation`
- `deprecatedGlobalReadRequired: false`

## B — Console warning regression
1. F5/reload the world with DevTools console open.
2. Open a PC sheet.
3. Drag an image file from Windows onto the Character Portrait.
4. Open Token Builder and create/save a token.

Expected:
- NO Realm Guard-triggered warning saying: `You are accessing the global 'FilePicker' which is now namespaced under foundry.applications.apps.FilePicker.implementation`
- portrait upload works
- token PNG upload works
- no new errors from the compatibility bridge

## C — Character Portrait
Drag a PNG/JPG/WebP onto the portrait.
Expected:
- upload succeeds
- PC profile portrait remains square/rounded-square
- original portrait source is preserved
- no deprecated FilePicker warning

## D — Token Builder
Open Quick Token Builder.
Check:
- source artwork loads
- drag/reposition works
- Zoom works
- Fit/Fill works
- Create / Save Token works
- generated token remains round
- prototype token updates
- PC Character Portrait is not replaced by the round token
- no deprecated FilePicker warning

## E — Equipment Figure toolbar — normal width
Open Inventory & Gear.
Expected toolbar structure:
- Equipment Figure title/instruction at top-left
- gear/settings button at top-right
- Source and Ancestry below
- resolved figure status below fields
- no overlap with Unassigned Gear
- no clipped controls

## F — Equipment Figure toolbar — resize
Slowly resize the Actor Sheet from wide to narrow.
Expected:
- wide: Source + Ancestry may share a row
- medium: Source and Ancestry stack cleanly
- narrow: controls remain full width and readable
- gear icon remains reachable
- no horizontal overflow
- no field rendered underneath another field
- no controls jump outside Equipment panel

## G — Figure settings dialog
Click the gear icon.
Expected:
- Custom image path
- Fit
- Zoom
- Horizontal
- Vertical
- Apply / Cancel
- dialog remains usable at current Foundry v13.351 runtime

## H — Figure modes
Test Custom Figure and Ancestry Figure.
Expected:
- Custom built-in gray figure remains
- own Custom Figure remains supported
- Human/Dunadan/Elf/Dwarf/Halfling switching remains
- no paper/mannequin fallback returns

## I — Inventory layout regression
Expected desktop arrangement:
- Containers left
- Unassigned Gear directly below Containers
- Equipment main/right column

Check:
- gear drag/drop
- slots
- 2H lock
- capacities
- containers
- Unassigned drop target
- F5 persistence

## J — M5 CORE regression
```js
console.log(game.realmGuard.core.m5.getStatus());
```
Expected:
- `liveApplication:false`
- authority remains `LEGACY_MIXED`
- Gear/Inventory/Conflict Tool shadow services remain present

## K — M2 / M3 / M4 regression
Perform one ordinary test and one Nature/Condition test.
Expected:
- no new parity mismatch
- no duplicate advancement
- no duplicate Nature tax
- no duplicate Condition/Recovery write

## PASS gate
- v13 runtime boots PASS
- namespaced FilePicker bridge PASS
- deprecated FilePicker warning absent PASS
- portrait upload PASS
- Token Builder upload/save PASS
- square PC portrait / round token PASS
- Equipment toolbar wide PASS
- Equipment toolbar medium PASS
- Equipment toolbar narrow PASS
- Figure settings dialog PASS
- Custom/Ancestry figures PASS
- Inventory layout PASS
- Inventory mechanics unchanged PASS
- M5 CORE preserved PASS
- M2/M3/M4 preserved PASS

## v14 gate
This build is structured for v14 compatibility but v14 is not marked verified until the same protocol is run in an actual Foundry v14 world. Once that QA passes, `compatibility.verified` can be advanced to v14.