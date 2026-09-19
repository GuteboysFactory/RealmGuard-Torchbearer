Realm Guard / Torchbearer v1.9.0-qa.15 — M7 End Session / Reward Live Handoff.

New CORE M7 reward scope:
- END_SESSION_REWARD_PROPOSAL
- END_SESSION_REWARD_COMMIT

CORE M7 now owns:
- Fate / Persona proposal calculation
- Goal-progress Fate suppression when Goal is accomplished
- Persona proposal cap
- approval-aware reward commit planning
- Fate / Persona resource cap handling
- exact before / after / actual award values

Safety:
- Legacy Mixed computes independent read-only proposal/commit plans.
- Any disagreement auto-rolls back only Reward authority.
- CORE Reward errors fall back only Reward.
- Existing End Session UI and approval flow are preserved.
- Duplicate-finalization guard remains Legacy-compatible.
- Previous M7 handoffs remain independently controlled.

Still Legacy Mixed:
- SESSION_LIFECYCLE_COMMIT

qa.14 Trait Check Award Live Handoff is VERIFIED.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.15.md
