Realm Guard / Torchbearer v1.9.0-qa.10 — GM Dock Host Contract v2.

This build extends the neutral GuteboysFactory GM Dock Host contract for richer provider UX while preserving all qa.9 M7 rules behavior.

Dock Host v2 adds:
- provider-owned inline body region
- provider render callback for wiring compact controls
- dedicated provider footer action
- stable host rendering for compact campaign-workspace integrations
- existing provider items, badges, close behavior and callbacks remain supported

Adventurer's Tome v1.4.0-qa.5 is the reference provider and uses Host v2 for inline Quick Capture plus a persistent Open Tome footer.

Rules authority is unchanged from qa.9:
- CORE M7 PLAYER_TURN_TEST_CLAIM remains live
- CORE M7 PASS_CHECK remains live
- all remaining qa.9 Legacy Mixed boundaries remain unchanged

No tabletop rule behavior is intentionally changed.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.10.md
