# Realm Guard / Torchbearer v1.9.0-qa.15 — M7 End Session / Reward Live Handoff

v1.9.0-qa.15 moves End Session reward proposal and reward commit semantics to CORE M7 live authority.

New CORE scope:
- END_SESSION_REWARD_PROPOSAL
- END_SESSION_REWARD_COMMIT

Preserved behavior:
- existing End Session UI
- group review plus GM technical approval
- Fate / Persona criteria
- Goal progress suppression when Goal is accomplished
- Persona proposal cap
- resource maximum caps
- duplicate-finalization guard
- Trait-use reset after finalization

Safety:
- Legacy Mixed computes independent read-only reward proposal/commit plans.
- Reward disagreement auto-rolls back only Reward to Legacy Mixed.
- CORE Reward errors fall back only Reward.
- Previous M7 handoffs remain independently controlled.

Still Legacy Mixed:
- SESSION_LIFECYCLE_COMMIT

qa.14 Trait Check Award Live Handoff is VERIFIED.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.15.md
