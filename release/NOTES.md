Realm Guard / Torchbearer v1.7.0-qa.17 — Recruitment Foundry wheel-capture hotfix.

Live QA of qa.16 confirmed that the custom long-list menu rendered correctly, but mouse-wheel input could still be consumed by Foundry before the menu actually scrolled. qa.17 fixes that specific live behavior.

New in qa.17:
- captures wheel input at the window capture phase while a Recruitment long-list menu is open
- uses a non-passive wheel listener so the Foundry/background handler can be prevented
- explicitly converts wheel/trackpad delta to pixels and updates the menu's `scrollTop`
- clamps scrolling to the menu's top/bottom bounds
- stops the wheel event from propagating to the Recruitment window/canvas while the pointer is inside the long list
- preserves keyboard navigation, selection highlighting, viewport-aware menu placement and native-select form authority from qa.16
- strengthens automated smoke checks for capture/passive behavior and explicit scrollTop movement

Preserved:
- all Recruitment rules, validation and calculations
- selected Recruitment values and Continue/Back flow
- short Recruitment selects remain native/unchanged
- M5 promotion-readiness state and shadow parity architecture from qa.15
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- qa.12 Ranger-sheet scroll-position persistence
- Equipment layout, portrait/token workflow and FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.17.md`

Primary PASS condition: with the pointer over the option text in a long Recruitment list, mouse-wheel/trackpad input visibly scrolls the list to the bottom and back while the underlying Recruitment window does not steal the scroll; selected values must still persist through Continue/Back without console errors.