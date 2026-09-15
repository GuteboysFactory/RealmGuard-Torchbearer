# Realm Guard / Torchbearer v1.7.0-qa.16 — QA Protocol

Scope: Recruitment 2.0 long-list scrolling UX only. No Recruitment rule changes and no M5 live takeover.

## A. Baseline
- Install v1.7.0-qa.16 on Foundry VTT 13.351.
- World opens with no new console errors.
- Existing Ranger data remains intact.
- `game.realmGuard.core.m5.getStatus()` still reports M5 shadow parity with `liveApplication:false` and `authority:"LEGACY_MIXED"`.

## B. Life Experience — long selects
1. Open Recruitment 2.0 and reach Life Experience.
2. Open Natural Talent.
3. Confirm the long menu has a visible vertical scrollbar.
4. Use mouse wheel / trackpad over the open menu.
5. Scroll from the first options to options near the bottom, e.g. Survivalist / Weather Watcher / Weaver.
6. Select one lower-list option.
7. Confirm the closed control displays the chosen value.

Repeat for Parents' Trade / other long Life Experience selects.

PASS:
- wheel / trackpad scrolls the option list itself
- menu does not get stuck at the first visible rows
- selected value persists in the control
- no page/dialog jump while scrolling the menu

## C. Viewport positioning
- Open a long select near the lower part of the Recruitment dialog.
- Confirm the menu chooses above/below placement according to available screen space.
- Resize or move the dialog and reopen the select.
- Menu remains inside the visible viewport and remains scrollable.

## D. Keyboard
With a long menu open:
- Arrow Down / Arrow Up moves between options.
- Home / End jumps to first / last available option.
- Enter or Space selects the focused option.
- Escape closes the menu and returns focus to the control.

## E. Native form authority / wizard persistence
- Select a lower-list option.
- Continue to the next Recruitment step.
- Go Back.
- Confirm the selected value is still present.
- Continue through Recruitment and verify normal validation/commit behavior.

PASS: the UX wrapper does not alter Recruitment calculations or saved values.

## F. Short selects regression
- Check Station, Homeland or another short select.
- Short lists should remain normal native selects and behave as before.

## G. Close / reopen regression
- Open a long menu and then close/cancel the Recruitment dialog.
- No orphan dropdown remains on screen.
- Reopen Recruitment and test another long menu.
- No duplicate menus or duplicate interaction.

## H. Existing regressions
- Ranger sheet scroll persistence from qa.12 remains functional.
- Equipment layout / inventory drag-drop remains functional.
- Conflict planning / rolls remain functional.
- M5 parity/readiness API remains available.

## PASS Gate
qa.16 PASS when long Recruitment lists can be scrolled reliably with wheel/trackpad to the bottom, a lower option can be selected and survives Continue/Back, short selects remain unchanged, no orphan menus remain after close, and there are no new console errors.
