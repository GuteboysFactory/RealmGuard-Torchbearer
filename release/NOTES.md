Realm Guard / Torchbearer v1.8.0-qa.3 — first controlled M6 Conflict resolution live handoff.

After qa.2 verified 18/18 M6 shadow observations with zero mismatches, CORE now becomes live authority for a deliberately narrow result scope: completed action-pair pass/fail, margins, failure margins and effective successes.

Legacy Mixed still computes independently first as a parity guard and remains the sole authority for Conflict state writes, disposition mutation, Learning/Nature writes, Maneuver state, exchange advancement and compromise flow. Any CORE exception or result disagreement immediately falls back to Legacy and disables the handoff for the session. Manual rollback/re-enable APIs are exposed under game.realmGuard.core.m6.

All previous M5 live handoffs and qa.22 Token Actor resolution remain unchanged.

QA protocol: TEST_PROTOCOL_v1.8.0-qa.3.md
