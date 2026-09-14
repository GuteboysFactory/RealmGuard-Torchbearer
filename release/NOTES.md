Realm Guard / Torchbearer v1.6.0-qa.6 — CORE M4 Conditions / Capability / Recovery Shadow Parity.

v1.6.0-qa.5 verified the Roll Dialog visual UX polish. qa.6 returns to CORE M4 and observes real Legacy Mixed Condition and Recovery behavior while Legacy remains the sole live writer.

New in qa.6:
- expands `ConditionService`, `CapabilityBlockService` and `RecoveryService` with independent shadow predictions
- adds real Condition roll-effect parity for active Condition IDs and total dice modifier
- covers canonical and custom Conditions using data-driven `rollModifier` / `appliesTo`
- observes Angry beneficial Trait/Wise blocking and Afraid Beginner's Luck blocking
- exposes CORE capability queries for HELP / BEGINNER_LUCK / BENEFICIAL_TRAIT_WISE
- compares Recovery validation and canonical recovery order
- compares canonical and structured custom Recovery methods / obstacles / base pools
- verifies Recovery rolls continue to ignore ordinary Condition penalties
- compares Recovery PASS/FAIL condition state
- compares GM Turn 2-Check Recovery economy
- compares recovery-attempt marking when Turn Manager is enabled
- observes manual/Fresh clears
- exposes diagnostics under `game.realmGuard.core.m4.conditionRecoveryParity`
- adds headless smoke QA for Condition effects, capability blocks and Recovery predictions

Important preservation:
- Legacy Mixed remains sole live authority for Condition activation, Recovery state, Checks and Learning
- CORE Condition/Capability/Recovery services are observation/prediction only
- M2 remains SHADOW_COMPARE / live OFF
- M3 remains SHADOW_PARITY / live OFF
- M4 remains SHADOW_SERVICES / live OFF
- verified Advancement and Nature shadow behavior remains enabled
- qa.5 parchment/green-choice/scroll Roll Dialog UX is preserved
- Conflict remains on the Legacy adapter path until M6

QA protocol: TEST_PROTOCOL_v1.6.0-qa.6.md
Foundry target: v13.351.
Approved baseline: v1.6.0-qa.5 PASS.
