# Realm Guard / Torchbearer v1.9.0-qa.13 — M7 Recovery Live Handoff

Realm Guard / Torchbearer v1.9.0-qa.13 — M7 Recovery Live Handoff.

New live CORE M7 Recovery scope:
- SPEND_RECOVERY_CHECKS
- REFUND_RECOVERY_CHECKS
- MARK_RECOVERY

CORE M7 now deterministically plans:
- GM Turn Recovery cost: 2 Checks
- no direct GM-Recovery charge outside GM Turn
- Recovery spend before/after state
- valid refund receipts
- stale refund rejection
- state-mismatch refund rejection
- turn-scoped Recovery attempt marking
- duplicate-attempt state protection

Safety:
- Legacy Mixed computes independent read-only Recovery plans.
- Any Recovery disagreement auto-rolls back only Recovery to Legacy Mixed.
- CORE Recovery planner errors fall back safely.
- Claim, Pass Check, Done / Discard and Phase Change remain independently controlled.
- Existing player -> primary GM authority bridge remains the technical commit path.
- Recovery attempt state remains keyed by turnCycleId.

Still Legacy Mixed:
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Diagnostics:
- game.realmGuard.core.m7.recoveryHandoffStatus()
- game.realmGuard.core.m7.recoveryHandoffHistory()
- game.realmGuard.core.m7.setCoreRecoveryEnabled(...)
- game.realmGuard.core.m7.resetRecoveryHandoffTelemetry()

QA protocol: TEST_PROTOCOL_v1.9.0-qa.13.md
