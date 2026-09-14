Realm Guard / Torchbearer v1.6.0-qa.5 — Roll Dialog Visual UX Polish.

v1.6.0-qa.4 verified real Nature shadow parity. qa.5 is a UI-only readability pass for the Roll Dialog and preserves all M2/M3/M4 gameplay behavior.

New in qa.5:
- adds a warm beige / parchment Roll Dialog background
- groups dense roll sections into light parchment panels with clearer borders and headings
- highlights checked checkbox/radio choices in green so active roll options are immediately visible
- keeps inactive and disabled options visually quieter
- improves input/select contrast and focus visibility
- adds a Nature Versus discovery hint when no single target is selected
- highlights the Nature block when Nature Versus is actively selected
- preserves the approved viewport-safe internal scrolling from qa.3

Important preservation:
- no rules or roll resolution logic changed
- Legacy Mixed remains sole live authority
- M2 remains SHADOW_COMPARE / live OFF
- M3 remains SHADOW_PARITY / live OFF
- M4 remains SHADOW_SERVICES / live OFF
- Advancement shadow and Nature shadow parity remain enabled and unchanged
- Conflict remains on the Legacy adapter path until M6

QA protocol: TEST_PROTOCOL_v1.6.0-qa.5.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.4 PASS.
