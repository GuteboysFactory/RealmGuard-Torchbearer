Realm Guard / Torchbearer v1.9.0-qa.3 — M7 End Session / Reward Shadow Parity.

This QA build adds read-only reward parity observation around the existing Legacy Mixed End Session workflow.

Legacy End Session remains the only live authority for reward selection, GM approval, Fate/Persona mutation, duplicate-finalization locking and session reset. CORE M7 now receives the same selected criteria and approval inputs, computes its own proposal/commit preview, and records whether the CORE result matches Legacy.

Added diagnostics:
- game.realmGuard.core.m7.rewardParity()
- game.realmGuard.core.m7.rewardParitySummary()

The shadow records PROPOSAL_PARITY and COMMIT_PARITY rows with Legacy and CORE values. No CORE reward application is enabled.

Legacy Mixed remains live authority. M7 remains SHADOW_READ_ONLY with liveApplication false.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.3.md