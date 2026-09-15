# Realm Guard / Torchbearer v1.7.0-qa.18 — QA Protocol

## Scope
Root-cause fix for Recruitment 2.0 long dropdown scrolling in Foundry VTT 13.351.

The prior qa.16/qa.17 enhancer searched for `.realm-guard.rg-recruitment select`, but live diagnostics proved that DialogV2 does not preserve that wrapper in the rendered DOM. qa.18 therefore identifies Recruitment selects by the stable `.rg-recruit-progress` marker inside the owning DialogV2 form/application and injects its required scroll-menu styles directly as a runtime safeguard.

No Recruitment rules, calculations or saved-data semantics are changed.

## 1. Version / load
- Start Foundry after updating the system.
- Confirm `game.system.version` is `1.7.0-qa.18`.
- Open Recruitment 2.0.

PASS: qa.18 is loaded and Recruitment opens normally.

## 2. Runtime enhancer presence
Open a Recruitment step containing Natural Talent, then run:

```js
({
  version: game.system.version,
  recruitProgress: document.querySelectorAll('.rg-recruit-progress').length,
  enhancedSelects: document.querySelectorAll('select[data-rg-scrollable-select="true"]').length,
  triggers: document.querySelectorAll('.rg-scroll-select-trigger').length,
  menus: document.querySelectorAll('.rg-scroll-select-menu').length,
  runtimeStyle: Boolean(document.getElementById('rg-recruitment-scroll-select-styles'))
})
```

PASS while the relevant step is open:
- `version: "1.7.0-qa.18"`
- `recruitProgress >= 1`
- `enhancedSelects >= 1`
- `triggers >= 1`
- `menus >= 1`
- `runtimeStyle: true`

## 3. Natural Talent mouse-wheel scrolling — PRIMARY PASS
- Open Recruitment -> Life Experience -> Natural Talent.
- Open the Natural Talent dropdown.
- Put the pointer over the option list.
- Scroll down using the mouse wheel / trackpad.
- Reach lower entries such as `Survivalist`, `Weather Watcher`, and `Weaver`.
- Scroll back to the top.

PASS:
- the dropdown list itself scrolls;
- the Recruitment dialog behind it does not consume that wheel input;
- a visible scrollbar is available on the custom list.

## 4. Manual scrollbar
- Drag the list scrollbar thumb down and up.

PASS: list position follows the thumb normally.

## 5. Keyboard navigation
With the long list open test:
- Arrow Down / Arrow Up
- Page Down / Page Up
- Home / End
- Enter or Space to choose
- Escape to close

PASS: navigation works and focused options scroll into view.

## 6. Value persistence
- Choose a Natural Talent option near the bottom.
- Continue to the next Recruitment step.
- Go Back.

PASS: the chosen value remains selected.

## 7. Second long list
Repeat mouse-wheel and selection testing on Parents' Trade or another long Recruitment select.

PASS: scrolling and selection work there too.

## 8. Short-list regression
Open Recruitment steps with short selects.

PASS: short selects remain native and usable; no duplicate controls appear.

## 9. Cleanup / duplicate-listener regression
- Close Recruitment with a custom list open.
- Reopen Recruitment several times.
- Open and scroll a long list again.

PASS:
- no orphan menu remains on screen;
- scroll speed does not multiply across openings;
- only the current dialog's controls are enhanced.

## 10. Console
PASS: no new Realm Guard / Recruitment JavaScript errors.

## 11. M5 regression boundary
No M5 behavior changed in qa.18. Existing qa.15 promotion-readiness remains the reference state.

PASS:
- `game.realmGuard.core.m5.getStatus()` remains shadow/read-only;
- `liveApplication:false`;
- `authority:"LEGACY_MIXED"`.

## Release decision
qa.18 is PASS when the Natural Talent list can be scrolled by mouse wheel in live Foundry and the runtime enhancer diagnostic reports at least one enhanced select/trigger/menu with the runtime style present.
