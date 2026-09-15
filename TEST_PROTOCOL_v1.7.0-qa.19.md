# Realm Guard / Torchbearer — TEST PROTOCOL v1.7.0-qa.19

## Scope
Verify the root fix for system-wide `rg-smart-select` scrolling, with Recruitment / Natural Talent as the primary live case.

## Preconditions
- Foundry VTT v13.351
- Realm Guard / Torchbearer v1.7.0-qa.19
- Open a world where Recruitment 2.0 is available

## 1. Version / hotfix status
Run in console:

```js
game.system.version
game.realmGuard.smartSelectScroll.getStatus()
```

Expected:
- version = `1.7.0-qa.19`
- `authority: "RG_SMART_SELECT"`
- `installed: true`
- `ready: true`
- `nativeOverflow: true`
- `internalScrollCloseGuard: true`

## 2. Confirm only the system smart-select is live
Open Recruitment and reach Life Experience. Run:

```js
({
  version: game.system.version,
  smartMenus: document.querySelectorAll(".rg-smart-select-menu").length,
  oldMenus: document.querySelectorAll(".rg-scroll-select-menu").length,
  oldTriggers: document.querySelectorAll(".rg-scroll-select-trigger").length,
  state: game.realmGuard.smartSelectScroll.getStatus()
})
```

Expected:
- `smartMenus` > 0
- `oldMenus: 0`
- `oldTriggers: 0`

## 3. Primary Natural Talent wheel-scroll test
1. Open `Natural Talent`.
2. Put the pointer over the option list.
3. Scroll 3–5 wheel notches / trackpad gestures.
4. The menu MUST remain open.
5. The option list MUST move vertically.
6. Continue to the bottom and confirm lower entries such as `Survivalist`, `Weather Watcher`, and `Weaver` are reachable.
7. Scroll back toward the top.

PASS when the visible `rg-smart-select` menu scrolls without closing.

## 4. Scrollbar test
1. Open Natural Talent again.
2. Confirm a vertical scrollbar is available when the list exceeds the menu height.
3. Drag the scrollbar thumb down and back up.

Expected: list position follows the thumb and the menu remains open.

## 5. Selection persistence
1. Select an option near the bottom of Natural Talent.
2. Click `Continue`.
3. Click `Back`.

Expected: the selected value is still present.

## 6. Second long-list regression
Repeat the wheel-scroll test on another long Recruitment dropdown, for example Parents' Trade.

Expected: same behavior as Natural Talent.

## 7. Normal close behavior
Verify the menu still closes normally when appropriate:
- click outside the dropdown
- resize the Foundry window / viewport
- leave the dropdown and scroll the surrounding UI rather than the menu itself

Expected: no permanently stuck floating menu.

## 8. Keyboard regression
With a smart-select focused:
- Enter / Space or Arrow Down opens the menu
- Arrow Down / Arrow Up moves between available options
- Escape closes the menu

Expected: existing smart-select keyboard behavior remains intact.

## 9. Context-help regression
Hover options that expose contextual help.

Expected: existing option help / tooltip behavior remains available and does not interfere with scrolling.

## 10. Console regression
During the tests:
- no new red console errors
- no repeated smart-select exceptions
- no duplicate Recruitment-specific dropdown layer

## PASS criteria
qa.19 passes when:
- Natural Talent wheel/trackpad scrolling works
- the menu remains open while its own contents scroll
- the scrollbar can be used
- a lower option can be selected and persists through Continue/Back
- another long Recruitment list also scrolls
- outside-close / resize-close / keyboard / help behavior remains functional
- `oldMenus` and `oldTriggers` are both 0
- no new console errors occur

## Preserved architecture
This QA build does not alter M5 live authority:
- `liveApplication: false`
- `authority: "LEGACY_MIXED"`
- qa.15 promotion-readiness remains the M5 baseline
