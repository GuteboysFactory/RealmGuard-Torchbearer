Realm Guard / Torchbearer v1.9.0-qa.14 — M7 Trait Check Award Live Handoff.

New live CORE M7 operation:
- AWARD_TRAIT_CHECKS

CORE M7 now deterministically plans:
- GM Turn eligibility
- requested Trait Against award clamp (0–2)
- Check maximum/cap handling
- exact before/after state
- exact earned amount
- zero structured award outside GM Turn / in Free Play

Safety:
- Legacy Mixed computes an independent read-only award plan.
- Any disagreement auto-rolls back only Trait Check Award.
- CORE planner errors fall back only Trait Check Award.
- Claim, Pass Check, Done / Discard, Phase Change and Recovery remain independent live handoffs.
- Player requests continue through the primary-GM technical authority bridge.

Still Legacy Mixed:
- End Session live commit
- Session Lifecycle live commit

qa.13 Recovery Live Handoff is VERIFIED.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.14.md
