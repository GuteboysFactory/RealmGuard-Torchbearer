Realm Guard / Torchbearer v1.9.0-qa.11 — M7 Done / Discard Live Handoff.

Live CORE M7 Players' Turn scope:
- PLAYER_TURN_TEST_CLAIM
- PASS_CHECK
- DONE_DISCARD (new)

Done / Discard now uses a deterministic CORE plan for:
- marking the Ranger Done
- discarding unused Checks to 0
- preserving the existing Players' Turn state fields
- retaining existing chat behavior

Safety:
- Legacy Mixed computes the same finish plan in parallel as a parity guard.
- On disagreement, only the Done / Discard CORE handoff auto-rolls back to Legacy Mixed.
- CORE planning errors fall back safely.
- Claim, Pass Check and Done / Discard each have independent rollback switches.
- Player operations remain serialized through the primary-GM authority bridge.

Still Legacy Mixed:
- phase changes
- Recovery
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Diagnostics:
- game.realmGuard.core.m7.finishHandoffStatus()
- game.realmGuard.core.m7.finishHandoffHistory()
- game.realmGuard.core.m7.setCoreFinishEnabled(...)
- game.realmGuard.core.m7.resetFinishHandoffTelemetry()

Packaging note:
- qa.11 also carries the current-main GM Dock Host Contract v2 changes that had been prepared as qa.10.
- qa.10 itself was not published because the release pipeline was stopped by an obsolete exact-version assertion in the qa.9 Pass Check smoke.
- That smoke guard is corrected in qa.11.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.11.md
