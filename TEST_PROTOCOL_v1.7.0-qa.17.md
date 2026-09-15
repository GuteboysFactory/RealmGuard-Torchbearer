# Realm Guard / Torchbearer — TEST PROTOCOL v1.7.0-qa.17

## Scope
Targeted Recruitment 2.0 long-list wheel/trackpad scrolling hotfix for Foundry VTT 13.351. qa.16 rendered the custom scrollable menu correctly, but live Foundry QA showed that wheel input could still be consumed before the menu moved. qa.17 captures wheel input at the window level with a non-passive handler and explicitly advances the open Recruitment menu's scrollTop.

No Recruitment rules/calculations are changed. M5 remains in the verified qa.15 shadow/readiness state; this build performs no M5 live takeover.

## A — Baseline
- [ ] Foundry VTT 13.351 starts normally.
- [ ] System reports v1.7.0-qa.17.
- [ ] Existing world data is intact.
- [ ] No new console error on world load.

## B — Natural Talent long list
1. Open Create Ranger / Recruitment 2.0.
2. Reach Life Experience.
3. Open Natural Talent.
- [ ] Custom long-list menu opens.
- [ ] A scrollbar is visible when content exceeds menu height.
- [ ] Put the pointer over the OPTION TEXT, not only the scrollbar gutter.
- [ ] Mouse wheel scrolls smoothly downward through the list.
- [ ] Mouse wheel scrolls back upward.
- [ ] The Recruitment form/window behind the open list does NOT scroll instead of the list.
- [ ] Bottom entries such as Survivalist / Weather Watcher / Weaver can be reached.

## C — Trackpad / alternate wheel input
If a trackpad or precision wheel is available:
- [ ] Small delta scrolling moves the menu.
- [ ] Rapid scrolling remains bounded inside the menu.
- [ ] Scrolling cannot move past the top or bottom.

## D — Scrollbar interaction
- [ ] Dragging the scrollbar thumb works.
- [ ] Clicking/dragging inside the list does not close it unexpectedly.

## E — Selection persistence
1. Choose an option near the bottom of Natural Talent.
2. Continue to the next Recruitment step.
3. Go Back.
- [ ] Chosen option is still selected.
- [ ] Reopening the list highlights the current selection.
- [ ] Reopening scrolls the current selection into view.

Repeat with another long list such as Parents' Trade:
- [ ] Wheel scrolling works.
- [ ] A lower option can be selected.
- [ ] Continue / Back preserves the value.

## F — Short select regression
- [ ] Short Recruitment dropdowns remain native/unchanged.
- [ ] Normal selection still commits correctly.
- [ ] No duplicate visible controls.

## G — Viewport behavior
- [ ] Near the bottom of the screen, a long list may open upward when appropriate.
- [ ] Near the top, it opens downward when appropriate.
- [ ] The menu remains within the viewport.

## H — Reopen / duplicate-handler regression
1. Close Recruitment completely.
2. Open Recruitment again.
3. Repeat 3 times.
- [ ] No orphaned dropdown remains after closing the wizard.
- [ ] One wheel notch produces one normal scroll movement; scrolling does not accelerate because duplicate handlers accumulated.
- [ ] Only one long-list menu is open at a time.

## I — Keyboard regression
With a long list open:
- [ ] Arrow Down / Arrow Up navigate.
- [ ] Home / End navigate to ends.
- [ ] Enter or Space selects.
- [ ] Escape closes the list and returns focus to its trigger.

## J — M5 preservation
Run:
```js
game.realmGuard.core.m5.getStatus()
```
- [ ] `liveApplication:false`
- [ ] `authority:"LEGACY_MIXED"`
- [ ] qa.15 promotion-readiness architecture remains available.
- [ ] No Inventory / Conflict behavior changed by qa.17.

## K — Final console check
- [ ] No new JS errors from `recruitment-scroll-select.mjs`.
- [ ] No error loop while scrolling.
- [ ] No FilePicker/canvas regression.

## PASS gate
qa.17 PASS requires that the pointer can remain over the long-list option area and mouse-wheel/trackpad input visibly moves the list to its bottom and back to its top, while the page behind it does not steal the scroll. Selection and Continue/Back persistence must remain correct, with no new console errors.
