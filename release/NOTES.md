Realm Guard / Torchbearer v1.9.0-qa.8 — M7 Player Turn Test Claim Live Handoff.

This build performs the first live CORE M7 Session Engine authority handoff.

Live CORE scope:
- PLAYER_TURN_TEST_CLAIM
- Free Test vs Check
- alternation
- Done guard
- no-Checks guard
- NPC untracked
- Free Play untracked

Safety:
- Legacy Mixed calculates the same claim in parallel as a parity guard.
- If CORE M7 and Legacy Mixed disagree, CORE claim authority automatically disables and the Legacy plan is applied.
- CORE planning errors also fall back to Legacy Mixed.
- Player requests remain serialized through the existing primary-GM authority bridge.

Still Legacy Mixed:
- Pass Check
- Done / Discard
- phase changes
- Recovery
- Trait Against Check awards
- End Session
- remaining session/lifecycle commits

Diagnostics:
- game.realmGuard.core.m7.claimHandoffStatus()
- game.realmGuard.core.m7.claimHandoffHistory()
- game.realmGuard.core.m7.setCoreClaimEnabled(...)
- game.realmGuard.core.m7.resetClaimHandoffTelemetry()

No other tabletop rule behavior is intentionally changed.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.8.md
