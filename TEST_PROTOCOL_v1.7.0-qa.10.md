# TEST PROTOCOL — v1.7.0-qa.10

## Scope
Targeted Foundry compatibility hotfix for FilePicker deprecation warnings seen during NPC/PC artwork upload and Token Builder save. No gameplay or Inventory-rule changes.

## A — Version / compatibility
```js
console.log(game.system.version);
console.log(game.system.compatibility);
console.log(game.realmGuard.compat?.getStatus?.());
```
Expected:
- `1.7.0-qa.10`
- minimum 13
- verified 13.351
- maximum 14
- `deprecatedGlobalReadRequired:false`
- `filePickerBridgeInstalled:true`
- `lastAttemptPhase:"ready"`

## B — Clean reload console
1. Open DevTools console.
2. Clear console.
3. F5/reload world.
4. Open a Character and an NPC sheet.

Expected:
- no Realm Guard stack warning for deprecated global `FilePicker`
- compatibility status logs once at ready

## C — Character portrait drag/drop
1. Drag a PNG/JPG/WebP from desktop onto Ranger portrait.
2. Wait for upload and render.

Expected:
- upload succeeds
- original portrait updates
- no deprecated `FilePicker` warning
- square Character Portrait remains intact

## D — Character Token Builder file drop
1. Open Token Builder for a Ranger.
2. Drop an image directly onto the token preview.
3. Reposition/zoom.
4. Create / Save Token.

Expected:
- source artwork upload succeeds
- preview updates
- round token PNG is created
- prototype token updates
- original PC portrait stays separate
- no deprecated `FilePicker` warning during upload or save

## E — NPC Token Builder file drop/save
Repeat the same flow on an NPC.

Expected:
- dropped image uploads
- source artwork notification appears
- Create / Save Token creates round PNG
- placed Scene token updates when checked
- no deprecated global `FilePicker` warning from `token-builder-ux-hotfix.mjs`
- no deprecated global `FilePicker` warning from `token-builder.mjs`

## F — Compatibility API
```js
console.log(game.realmGuard.compat.getStatus());
console.log(game.realmGuard.compat.getFilePicker());
```
Expected:
- FilePicker implementation resolves
- target API reports `foundry.applications.apps.FilePicker.implementation`
- bridge installed

## G — Equipment Figure regression
Open Inventory & Gear and resize sheet wide -> medium -> narrow.
Expected:
- Source/Ancestry toolbar remains flexible
- gear settings button remains reachable
- no overlap or horizontal spill
- Containers + Unassigned left / Equipment main layout preserved

## H — Inventory / CORE regression
Check gear drag/drop, 2H locking, containers, capacities and one ordinary + Nature/Condition test.
Expected:
- no Inventory-rule change
- M5 remains shadow/read-only
- M2/M3/M4 preserved

## PASS gate
- v13.351 boot PASS
- compatibility bridge installed PASS
- reload has no Realm Guard FilePicker warning PASS
- Character portrait drop PASS
- Character Token Builder drop/save PASS
- NPC Token Builder drop/save PASS
- square PC portrait / round token separation PASS
- Equipment Figure responsive toolbar PASS
- Inventory layout/mechanics preserved PASS
- M5 CORE preserved PASS
- M2/M3/M4 preserved PASS
