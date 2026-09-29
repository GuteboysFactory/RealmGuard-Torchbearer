# Realm Guard / Torchbearer v1.12.0-qa.11 — M10B.11 MG1E Selectable QA Activation

Built after v1.12.0-qa.10 passed full Foundry VTT 13.351 live QA and closed M10B.10.

Highlights:
- advances the MG1E Rules Profile to v11
- makes MG1E QA_ACTIVE and selectable only in QA runtime
- keeps stable runtime unable to activate MG1E
- preserves read-only conversion preview and explicit GM confirmation
- keeps Legacy Mixed / Strict / MG1E switches reversible and settings-only
- retains runtime refresh, profile-change hook and reload guidance
- enables the MG1E READY_WHEN_ACTIVE CORE M9 commit plan only while MG1E is active
- enables MG1E creation provenance and CORE M8 relationship writes for newly created MG1E characters
- keeps existing Actors and Items untouched
- performs no automatic Wise rating, species-to-rank inference, Condition rewrite, Gear placement rewrite, Talent deletion or Token of Power deletion
- adds qa.11 smoke coverage for QA-only gating, stable rejection, live MG1E creation routing and round-trip profile switching
- live QA follows TEST_PROTOCOL_v1.12.0-qa.11.md
- v1.11.0 remains STABLE / GOLD
