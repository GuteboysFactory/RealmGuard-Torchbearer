Realm Guard / Torchbearer v1.5.0-qa.2 — CORE M3 first real Legacy Mixed ↔ CORE Test Engine shadow parity.

v1.5.0-qa.1 established and verified the pure Unified Test Engine foundation. qa.2 now connects that engine to real gameplay data for the first time without allowing CORE to take over live resolution.

New in v1.5.0-qa.2:
- adds a pure Legacy Mixed ↔ CORE Test parity model
- installs an observer-only real-roll parity service around supported existing Legacy Mixed test methods
- initially instruments ordinary trained Skill rolls, ordinary Ability rolls, Automatic Versus and Nature Versus
- captures the actual Legacy roll pool and resolved dice after supported Wise/Token rerolls
- replays the same real test data through CORE TestEngine deterministically
- compares exactly five parity fields: pool, target, successes, outcome and margin
- records MATCH / MISMATCH / SKIPPED / ERROR diagnostics in a bounded client-memory history
- exposes `game.realmGuard.core.testParity` with status, latest record, history, summary and clear helpers
- updates the GM CORE Test Engine diagnostics panel with real parity status
- changes M3 mode from SHADOW_DIAGNOSTIC to SHADOW_PARITY while keeping `liveApplication: false`
- aligns CORE TestResult failure margin with Legacy Mixed/public semantics by exposing a non-negative absolute margin; the signed delta remains available only in provenance
- adds headless parity smoke coverage for ordinary PASS/FAIL, Versus PASS/TIE, success-modifier bridging, mismatch detection and positive failure margin

Important qa.2 bridge rule:
- Legacy Mixed is still authoritative for preparing the pool and applying current effects/rerolls
- when Legacy final successes differ from raw successes on the captured final dice (for example a legal +1s), that difference is passed to CORE as the Test Engine successModifier
- this verifies Test Engine resolution parity without falsely claiming that M2 providers have already moved into live M3 ownership

Deliberate scope limits:
- Test Engine live application remains OFF
- Legacy Mixed still rolls dice, resolves gameplay, spends resources, advances state and writes chat
- Effect Engine remains SHADOW_COMPARE / live OFF with the six verified M2 providers retained
- Fate/Open-6 additive bonus dice are recorded as a documented SKIPPED parity case in this first slice
- Automatic Versus results that resolve an initial tie through the secondary tiebreak workflow are recorded as SKIPPED
- Beginner's Luck, Circles, Recovery and Custom Roll are not yet instrumented by the real-roll parity observer
- parity history is diagnostic client memory only and may reset on reload
- no Actor/Item/world migration
- no strict-profile correction
- Conflict remains on the existing adapter path until M6

Expected live status:
- `game.realmGuard.core.phase` = M3
- Test Engine mode = SHADOW_PARITY
- Test Engine live application = OFF
- Test parity authority = LEGACY_MIXED
- parity comparison fields = pool / target / successes / outcome / margin
- Effect Engine remains SHADOW_COMPARE / live OFF
- M2 providers remain 6

QA protocol: TEST_PROTOCOL_v1.5.0-qa.2.md

GOLD baseline: v1.3.0.
Approved CORE development baseline: v1.5.0-qa.1 PASS.
Foundry target: v13.351.
