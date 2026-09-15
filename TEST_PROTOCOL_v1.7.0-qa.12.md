# Realm Guard / Torchbearer — TEST PROTOCOL v1.7.0-qa.12

## Scope
Ranger Character-sheet scroll-position persistence hotfix.

## Runtime
- Foundry VTT v13.351
- Compatibility manifest: minimum v13, maximum v14
- Legacy Mixed remains sole live authority
- CORE M5 remains shadow/read-only

## A. Baseline
- [ ] Install/update to v1.7.0-qa.12.
- [ ] World loads without Realm Guard JavaScript errors.
- [ ] Existing Actors/Items/Scenes/Journals/Compendiums remain available.
- [ ] Character sheet opens normally.
- [ ] Equipment layout is unchanged.

## B. Character tab scroll retention
1. Open a Ranger Character sheet.
2. Stay on Character tab.
3. Scroll well down from the top.
4. Perform several actions that update Actor/Item data, for example edit a field, change a resource, toggle a condition, or change a Skill/learning value.

Expected:
- [ ] After each rerender the sheet remains at the same working position.
- [ ] The sheet does not jump back to the top.
- [ ] Character tab remains selected.
- [ ] Values still save correctly.

## C. Equipment tab scroll retention
1. Open Equipment tab.
2. Scroll down to a position that makes a reset obvious.
3. Move/unassign Gear, change Equipment placement, or perform another inventory action that rerenders the sheet.

Expected:
- [ ] Equipment tab remains selected.
- [ ] Scroll position remains where the user was working.
- [ ] Gear movement still saves correctly.
- [ ] Container and placement behavior is unchanged.

## D. Repeated updates
- [ ] Perform at least five update-triggering actions while remaining scrolled down.
- [ ] No gradual drift toward the top.
- [ ] No visible jump/flicker to the top that leaves the user at the wrong position.
- [ ] No duplicate event/listener behavior becomes apparent.

## E. Manual navigation
- [ ] Manual scrolling still works normally.
- [ ] Switching Character -> Equipment works normally.
- [ ] Switching Equipment -> Character works normally.
- [ ] The system does not force an obsolete scroll position when the user intentionally changes tab/location.

## F. Window lifecycle
- [ ] Move/resize Character sheet; no regression.
- [ ] Close and reopen Character sheet; sheet opens normally.
- [ ] Reload world; Character sheet still functions normally.
- [ ] No requirement that scroll state survive a full sheet close/world reload.

## G. M5 regression
- [ ] `game.realmGuard.core.m5.getStatus()` still reports `liveApplication:false`.
- [ ] Authority remains `LEGACY_MIXED`.
- [ ] M5 parity diagnostics still function.
- [ ] Inventory writes still produce parity observations where applicable.
- [ ] Conflict Tool parity remains functional.

## H. Locked visual regression
- [ ] Containers left.
- [ ] Unassigned Gear directly below Containers.
- [ ] Equipment large right column.
- [ ] Equipment Figure only Custom Figure / Ancestry Figure.
- [ ] No paper/geometric mannequin returns.
- [ ] PC original portrait remains square/original artwork.
- [ ] Token remains separate round PNG workflow.

## I. M2/M3/M4 smoke
- [ ] Ordinary Test works.
- [ ] Versus Test works.
- [ ] Advancement remains correct.
- [ ] Nature remains correct.
- [ ] Conditions/recovery remain correct.

## PASS gate
v1.7.0-qa.12 is PASS when Character and Equipment sheets preserve the user's current scroll position through update-triggered rerenders without changing saved data, tab state, Inventory behavior, Conflict behavior, or CORE authority.
