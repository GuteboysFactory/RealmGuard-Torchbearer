Realm Guard / Torchbearer v1.7.0-qa.19 — System smart-select scrolling root fix.

Live diagnostics from qa.18 identified the actual component and failure path. Recruitment was not using the temporary `rg-scroll-select` menu for the visible dropdown. The visible dropdown is the existing system-wide `rg-smart-select` component from Context Help. Its menu received wheel input correctly, but Context Help also had a global captured `scroll` listener that closed every open smart select as soon as the menu itself scrolled.

New in qa.19:
- uses the existing system-wide `rg-smart-select` as the sole dropdown authority
- removes the temporary Recruitment-specific scroll enhancer from system loading
- removes the temporary Recruitment scroll stylesheet from system loading
- adds `module/smart-select-scroll-hotfix.mjs` before `realm-guard.mjs` so the internal-menu scroll guard registers before Context Help's global close-on-scroll listener
- open `.rg-smart-select-menu` now has explicit vertical overflow, contained overscroll and a visible scrollbar
- scroll events originating inside the open smart-select menu stop before they reach the later global close-on-scroll listener
- outside/viewport scrolling behavior is otherwise unchanged

Preserved:
- existing system-wide smart-select option help and selection behavior
- Recruitment rules, calculations and saved values
- M5 promotion-readiness state and shadow parity architecture from qa.15
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- qa.12 Ranger-sheet scroll-position persistence
- Equipment layout, portrait/token workflow and FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.19.md`

Primary PASS condition: open Recruitment Natural Talent, scroll the visible `rg-smart-select` option list with the mouse wheel/trackpad without the menu closing, reach the bottom, select a lower option, and confirm the value persists through Continue/Back.
