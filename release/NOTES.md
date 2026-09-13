Realm Guard / Torchbearer v1.6.0-qa.1 — CORE M4 Service Foundation.

M3 Unified Test Engine is now VERIFIED. v1.6.0-qa.1 begins M4: Advancement / Nature / Conditions Services while preserving Legacy Mixed as the sole live gameplay authority.

New in qa.1:
- adds a lightweight CORE domain event bus
- adds AdvancementService shadow recommendation foundation
- adds NatureService state / tax recommendation / non-mutating preview foundation
- adds ConditionService data-driven inspection and roll-effect collection foundation
- adds CapabilityBlockService foundation
- adds RecoveryService / RecoveryContext foundation
- exposes the M4 QA API under `game.realmGuard.core.m4`
- adds GM diagnostics entry for M4
- adds headless M4 foundation smoke QA

Architecture requirements preserved:
- Advancement is designed to react to TEST_RESOLVED events rather than being hard-coded into Test Engine
- Nature is a separate subsystem using Current / Maximum / Tax and descriptor capability
- Conditions are represented through Item data rather than requiring canonical names for modifier/recovery behavior
- custom Conditions are first-class in ConditionService inspection and RecoveryContext
- Recovery remains its own TestContext
- strict profile corrections are NOT globally activated

Important qa.1 boundary:
- no existing live advancement is replaced
- no live Nature tax writes are moved yet
- no live Condition/Recovery mutations are moved yet
- synthetic M4 TEST_RESOLVED events generate shadow recommendations only
- Legacy Mixed remains authoritative
- M2 remains SHADOW_COMPARE / live OFF
- M3 remains SHADOW_PARITY / live OFF
- Conflict remains Legacy adapter until M6

QA protocol: TEST_PROTOCOL_v1.6.0-qa.1.md
Foundry target: v13.351.
Approved baseline: v1.5.0-qa.11 PASS / M3 VERIFIED.
