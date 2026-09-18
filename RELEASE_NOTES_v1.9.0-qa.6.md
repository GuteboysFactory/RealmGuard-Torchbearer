# Realm Guard / Torchbearer v1.9.0-qa.6 — M7 Authority Boundary Closure

Realm Guard / Torchbearer v1.9.0-qa.6 — M7 Authority Boundary Closure.

This QA build closes the remaining Action Currency authority leaks before the first CORE M7 live handoff.

Changes:
- separates real session cycle from GM/Players' Turn cycle/revision
- preserves cycleId as a temporary compatibility alias for turnCycleId
- routes Trait Against Check awards through the serialized primary-GM authority bridge
- routes GM Turn Recovery Check spend through the same authority bridge
- routes Recovery rollback/refund through the same authority bridge with stale/state validation
- adds M7 Action Currency authority diagnostics

Legacy Mixed remains live rules authority.
CORE M7 remains SHADOW_READ_ONLY with liveApplication false.
No tabletop rules are intentionally changed.

New diagnostic:
- game.realmGuard.core.m7.actionCurrencyAuthority()

QA protocol: TEST_PROTOCOL_v1.9.0-qa.6.md
