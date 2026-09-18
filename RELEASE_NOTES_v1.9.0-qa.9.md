# Realm Guard / Torchbearer v1.9.0-qa.9 — M7 Pass Check Live Handoff

Realm Guard / Torchbearer v1.9.0-qa.9 — M7 Pass Check Live Handoff.

This build expands the live CORE M7 Session Engine authority boundary.

Live CORE M7 scope:
- PLAYER_TURN_TEST_CLAIM (retained from qa.8)
- PASS_CHECK (new in qa.9)

Pass Check now uses a deterministic CORE transfer plan for:
- transfer legality
- donor/recipient Check balances
- donation counters
- recipient Done reset

Safety:
- Legacy Mixed computes the same transfer in parallel as a parity guard.
- On disagreement, only the Pass Check CORE handoff auto-rolls back to Legacy Mixed.
- CORE transfer-planning errors also fall back safely.
- The claim and transfer handoffs have independent rollback switches.
- Player operations remain serialized through the primary-GM authority bridge.

Still Legacy Mixed:
- Done / Discard
- phase changes
- Recovery
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Diagnostics:
- game.realmGuard.core.m7.transferHandoffStatus()
- game.realmGuard.core.m7.transferHandoffHistory()
- game.realmGuard.core.m7.setCoreTransferEnabled(...)
- game.realmGuard.core.m7.resetTransferHandoffTelemetry()

No other tabletop rule behavior is intentionally changed.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.9.md
