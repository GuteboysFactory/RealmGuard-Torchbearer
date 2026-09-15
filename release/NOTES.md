Realm Guard / Torchbearer v1.7.0-qa.18 — Recruitment long-list scrolling root-cause fix.

Live diagnostics from qa.17 proved the custom scroll enhancer was not activating at all: Recruitment had visible native selects, but `.rg-recruitment`, custom wrappers, triggers and menus were all absent in the rendered DialogV2 DOM. qa.18 fixes the activation path rather than adding another wheel workaround.

New in qa.18:
- Recruitment long-select detection no longer depends on the missing `.realm-guard.rg-recruitment` wrapper
- enhancer scans rendered selects and identifies Recruitment ownership through the stable `.rg-recruit-progress` marker in the owning DialogV2 form/application
- runtime style injection guarantees the custom scroll-menu CSS is present even if the external stylesheet is not discoverable in `document.styleSheets`
- long Recruitment selects (9+ options) receive the custom trigger/menu only when they belong to Recruitment
- explicit capture-phase wheel handling remains in place for Foundry
- keyboard support includes Arrow Up/Down, Page Up/Down, Home/End, Enter/Space and Escape
- duplicate installation guard prevents repeated global listeners

Preserved:
- all Recruitment rules, calculations and saved values
- short select behavior
- M5 promotion-readiness state and shadow parity architecture from qa.15
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- qa.12 Ranger-sheet scroll-position persistence
- Equipment layout, portrait/token workflow and FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.18.md`

Primary PASS condition: in live Foundry, Natural Talent is enhanced (`data-rg-scrollable-select`, trigger and menu present) and the open option list scrolls from top to bottom using the mouse wheel / trackpad.
