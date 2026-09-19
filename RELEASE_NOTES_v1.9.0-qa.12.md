# Realm Guard / Torchbearer v1.9.0-qa.12 — M7 Phase Change Live Handoff

Realm Guard / Torchbearer v1.9.0-qa.12 — M7 Phase Change Live Handoff.

Live CORE M7 scope now includes:
- PLAYER_TURN_TEST_CLAIM
- PASS_CHECK
- DONE_DISCARD
- PHASE_CHANGE (new)

CORE M7 now decides phase transitions for:
- GM Turn -> Players' Turn
- Players' Turn -> GM Turn
- no-op same-phase requests
- turnCycleId increment
- last-actor reset
- discard of remaining Checks when Players' Turn ends

Safety:
- Legacy Mixed computes an independent read-only phase plan as parity guard.
- On disagreement, only Phase Change auto-rolls back to Legacy Mixed.
- CORE planning errors fall back safely.
- Claim, Pass Check, Done / Discard and Phase Change have independent rollback switches.
- sessionCycle remains separate from turnCycleId.
- phase commit remains GM-side and uses the existing Foundry world settings / Actor updates.

Lifecycle:
- PHASE_CHANGED remains observed once after a committed real phase transition.
- CORE-authoritative phase changes are tagged CORE_M7_PHASE_HANDOFF in lifecycle telemetry.

Still Legacy Mixed:
- Recovery
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Diagnostics:
- game.realmGuard.core.m7.phaseHandoffStatus()
- game.realmGuard.core.m7.phaseHandoffHistory()
- game.realmGuard.core.m7.setCorePhaseEnabled(...)
- game.realmGuard.core.m7.resetPhaseHandoffTelemetry()

QA protocol: TEST_PROTOCOL_v1.9.0-qa.12.md
