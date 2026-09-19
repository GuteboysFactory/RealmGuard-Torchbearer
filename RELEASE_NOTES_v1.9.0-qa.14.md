# Realm Guard / Torchbearer v1.9.0-qa.14 — M7 Trait Check Award Live Handoff

v1.9.0-qa.14 moves the bounded **Trait Against -> Check award** decision to CORE M7 live authority.

New live CORE M7 operation:
- AWARD_TRAIT_CHECKS

CORE M7 now deterministically plans GM Turn eligibility, requested award clamp (0–2), Check cap handling, exact before/after state and exact earned amount. Outside GM Turn / in Free Play the structured Check award remains zero.

Safety:
- Legacy Mixed computes an independent read-only award plan.
- Any disagreement auto-rolls back only Trait Check Award.
- CORE planner errors fall back only Trait Check Award.
- Claim, Pass Check, Done / Discard, Phase Change and Recovery remain independent live handoffs.
- Player requests continue through the primary-GM technical authority bridge.

Still Legacy Mixed:
- End Session live commit
- Session Lifecycle live commit

qa.13 Recovery Live Handoff completed manual Foundry v13.351 QA and is VERIFIED.

Diagnostics:
- game.realmGuard.core.m7.traitAwardHandoffStatus()
- game.realmGuard.core.m7.traitAwardHandoffHistory()
- game.realmGuard.core.m7.setCoreTraitAwardEnabled(...)
- game.realmGuard.core.m7.resetTraitAwardHandoffTelemetry()

QA protocol: TEST_PROTOCOL_v1.9.0-qa.14.md
