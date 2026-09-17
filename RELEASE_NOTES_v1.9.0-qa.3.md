# Realm Guard / Torchbearer v1.9.0-qa.3 — M7 End Session / Reward Shadow Parity

This QA build extends M7 with read-only End Session reward parity observation.

The existing Legacy Mixed End Session workflow remains the sole live authority. M7 now observes the same reward criteria and approval inputs, computes CORE Reward Engine proposal/commit previews, and records parity diagnostics without applying any rewards itself.

New diagnostics:
- `game.realmGuard.core.m7.rewardParity()`
- `game.realmGuard.core.m7.rewardParitySummary()`

Parity rows cover both reward proposal math and approved/capped Fate/Persona commit math.

No End Session UI rewrite, no CORE resource mutation, and no authority handoff are included.

QA protocol: `TEST_PROTOCOL_v1.9.0-qa.3.md`
