# Realm Guard / Torchbearer v1.8.0-qa.5 QA Protocol

## Scope
Targeted UX fix for Conflict window stacking. Live diagnosis showed the custom `.rg-conflict-window` at computed z-index `120` while the active Realm Guard roll `DialogV2` was at `103`, so the Conflict window covered the roll dialog. qa.5 lowers only the custom Conflict surface to `99`, below Foundry's managed application stack. No Conflict rules/state/resolution logic changes.

## 1. Initial version and M6 regression status
```js
game.system.version
game.realmGuard.core.m6.getStatus()
game.realmGuard.core.m6.handoffStatus()
```
Expected `1.8.0-qa.5`; existing qa.4 / M6 state remains enabled with no rollback reason.

## 2. Primary stacking reproduction
Keep the Conflict window visible and click a Conflict Roll button.
Expected: the roll dialog opens visibly above the Conflict window every time. It must be fully clickable without first moving/minimizing/closing Conflict.

While the dialog is open, run:
```js
const conflict = document.querySelector('.rg-conflict-window');
const dialogs = [...document.querySelectorAll('.application')];
console.log({
  conflictZ: conflict ? getComputedStyle(conflict).zIndex : null,
  dialogs: dialogs.map(el => ({ id: el.id, title: el.querySelector('.window-title')?.textContent?.trim() ?? '', z: getComputedStyle(el).zIndex }))
});
```
Expected Conflict `99`; active roll dialog `>99`.

## 3. Repeated roll regression
Complete/close a roll dialog and open at least two more Conflict rolls across different Actions.
Expected every new dialog is above Conflict; Conflict rerenders/state updates must not jump above it.

## 4. Other transient Conflict dialogs
Open any available Conflict transient dialog (custom tool, Disarm, disposition method, tie/other dialog where applicable).
Expected Foundry dialog is above Conflict and remains interactive.

## 5. Conflict interaction regression
Close transient dialogs and interact with Conflict normally: drag it, scroll it, plan cards, choose Exchange Weapon / Tool, lock/reveal and roll.
Expected Conflict itself remains above the canvas/sidebar enough to be usable; no layout or drag regression.

## 6. qa.4 + M6 regression
Confirm Exchange-scoped Weapon / Tool behavior remains correct and resolve at least one action pair.
```js
game.realmGuard.core.m6.handoffStatus()
game.realmGuard.core.m6.getStatus()
```
Expected handoff telemetry mismatches `0`, errorFallbacks `0`, shadow mismatches `0`, enabled `true`.

## PASS
Conflict computed z-index is 99, Foundry roll/transient dialogs open above it consistently, Conflict remains usable, and qa.4/M6 regressions remain green.
