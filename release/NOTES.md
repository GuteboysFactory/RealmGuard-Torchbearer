Realm Guard / Torchbearer v1.5.0-qa.11 — CORE M3 Final Promotion Matrix.

qa.10 verified the Custom Content Compatibility matrix: custom Skill, Trait, Wise, Talent and Token of Power behavior, manual/free-text boundaries and reload persistence all passed without canonical-name dependence.

qa.11 is the final M3 gate. It does not promote CORE to live authority. It verifies that the complete Unified Test Engine shadow architecture is stable enough to mark M3 VERIFIED and proceed to M4.

Final M3 QA scope:
- startup / authority verification
- positive and negative modifier parity without double application
- cancel safety for ordinary and Custom Roll dialogs
- representative context regression sweep across ordinary, ability, nature, circles, beginnerLuck, versus, recovery and custom
- custom-content regression
- reload / duplicate observer safety
- GM + Player multiclient safety
- M2 six-provider shadow preservation

Important preservation:
- Legacy Mixed remains sole live authority throughout qa.11
- CORE Test Engine remains SHADOW_PARITY / live OFF
- CORE Effect Engine remains SHADOW_COMPARE / live OFF
- Conflict remains on the Legacy adapter path until M6
- no destructive world migration or strict-profile correction

If the full qa.11 matrix passes, record M3 Unified Test Engine = VERIFIED and begin M4 Advancement / Nature / Conditions Services.

QA protocol: TEST_PROTOCOL_v1.5.0-qa.11.md
Foundry target: v13.351.
Approved baseline: v1.5.0-qa.10 PASS.
