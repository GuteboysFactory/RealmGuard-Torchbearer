Realm Guard / Torchbearer v1.6.0-qa.2.1 — Roll Dialog Scroll Hotfix.

This micro-build preserves the fully verified v1.6.0-qa.2 M4 Advancement shadow behavior and only improves roll-dialog usability on shorter viewports.

New in qa.2.1:
- adds a dedicated viewport-safe roll-dialog stylesheet
- makes standard Realm Guard Roll Dialog content vertically scrollable when it exceeds available screen height
- makes Custom Roll / Free Dice Pool vertically scrollable under the same conditions
- prevents unnecessary horizontal scrolling
- keeps controls reachable on short desktop windows

Important preservation:
- no rules or gameplay logic changed
- Legacy Mixed remains sole live authority
- M2 remains SHADOW_COMPARE / live OFF
- M3 remains SHADOW_PARITY / live OFF
- M4 remains SHADOW_SERVICES / live OFF
- v1.6.0-qa.2 Advancement shadow behavior is unchanged

QA protocol: TEST_PROTOCOL_v1.6.0-qa.2.1.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.2 PASS.
