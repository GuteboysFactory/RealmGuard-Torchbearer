Realm Guard / Torchbearer v1.5.0-qa.1 — CORE M3 Unified Test Engine foundation.

M2 is now treated as the approved development baseline for the CORE migration after live verification through v1.4.0-qa.8. M3 begins the next locked architecture phase: move test/roll resolution beneath the existing UI while preserving Legacy Mixed gameplay behavior.

New in v1.5.0-qa.1:
- adds the pure CORE Test Engine foundation
- implements TestRequest, RollPlan, RollTransaction, TestResult, TestContext and TestEngine
- supports initial contexts: ordinary, versus, beginnerLuck, ability, nature, recovery, circles and custom
- implements transaction states PREPARED -> RESERVED -> ROLLED -> RESOLVED -> COMMITTED
- cancel before Commit restores the pure transaction to PREPARED and clears transient roll/result state
- implements deterministic d6 result resolution with default 4+ successes
- ordinary Obstacle tests pass on final successes >= Ob
- Versus equality resolves as TIE
- result data retains base/final pool, faces, raw/final successes, target, outcome, margin and provenance hooks
- exposes `game.realmGuard.core.tests` for QA diagnostics
- adds GM-only CORE M3 Test Engine diagnostics to the GM Dock
- adds automated headless M3 smoke coverage for ordinary/Versus semantics, modifiers, transaction lifecycle, cancellation and validation

Deliberate scope limits:
- Test Engine live application remains OFF
- existing roll dialogs and Legacy Mixed resolution remain authoritative
- no live resource reservation/spend is moved into CORE yet
- no advancement semantics change
- no strict-profile correction
- no Actor/Item/world migration
- Conflict remains on the existing implementation/adapter path until the later M6 refactor
- existing M2 Effect Engine remains shadow-only with all six verified providers retained

Expected live status:
- `game.realmGuard.core.phase` = M3
- Test Engine mode = SHADOW_DIAGNOSTIC
- Test Engine live application = OFF
- Effect Engine mode remains SHADOW_COMPARE
- Effect Engine live application remains OFF
- M2 providers remain 6

QA protocol: TEST_PROTOCOL_v1.5.0-qa.1.md

GOLD baseline: v1.3.0.
Approved CORE development baseline: v1.4.0-qa.8.
Foundry target: v13.351.
