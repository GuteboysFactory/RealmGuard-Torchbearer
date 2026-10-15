# Realm Guard / Torchbearer v1.13.0-qa.19 — M10D.18 Controlled TB2E Basic Test Handoff

- Reuses the existing TB2E Tests/Dice read-only shadow and CORE M3 Test Engine.
- Adds a QA-only, GM-only deterministic ordinary Ob Test handoff with caller-supplied source label, dice pool, Obstacle, modifiers and d6 faces.
- Reports the M3 result and bounded route evidence in memory only.
- Keeps TB2E FOUNDATION_ONLY, READ_ONLY, unsupported, inactive and unavailable for activation.
- Does not generate random dice, automate skill Obstacle factors, create chat messages, spend resources, apply consequences, or write Actor/Item/Journal/Setting data.
- Legacy Mixed remains the active profile; Strict RG, MG1E and MG2E are unchanged.
- Stable remains v1.12.0.

Source boundary: supplied Torchbearer 2E Quick Rules Guide pages 2 and 4 and Player Guide page 5; see M10D.18 plan and TEST_PROTOCOL_v1.13.0-qa.19.md.
