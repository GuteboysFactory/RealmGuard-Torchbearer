Realm Guard / Torchbearer v1.7.0-qa.16 — Recruitment long-list scrolling UX hotfix.

This QA build fixes the Recruitment 2.0 usability issue where long select lists could not be scrolled reliably with the mouse wheel / trackpad in Foundry VTT.

New in qa.16:
- long Recruitment selects (9+ options) are enhanced with a dedicated scrollable menu
- mouse wheel / trackpad scrolling works inside the menu
- visible scrollbar and bounded menu height
- menu opens above or below depending on available viewport space
- currently selected value is highlighted and scrolled into view
- keyboard navigation supports Arrow Up/Down, Home/End, Enter/Space and Escape
- short Recruitment selects remain native/unchanged
- underlying native select remains the form authority, so Recruitment commit/validation logic and saved data are unchanged

Preserved:
- all Recruitment rules and calculations
- M5 promotion-readiness state and shadow parity architecture from qa.15
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- qa.12 Ranger-sheet scroll-position persistence
- Equipment layout, portrait/token workflow and FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.16.md`

Primary PASS condition: open Life Experience and other Recruitment steps with long lists, scroll from the first options to the bottom with mouse wheel/trackpad, select a lower option, continue/back through the wizard, and confirm the chosen value persists without console errors.