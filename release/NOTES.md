Realm Guard / Torchbearer v1.7.0-qa.21 — M5 controlled Conflict Tool evaluation handoff.

qa.20 verified CORE M5 as live Inventory placement validator with Legacy Mixed remaining writer. qa.21 now promotes only Conflict Tool evaluation: provider resolution and action-specific dice/success modifiers are calculated by CORE M5, but only after the live Legacy calculation agrees.

Safety:
- Legacy Mixed still owns all Conflict state writes, action queue, Maneuver choices, Disarm/disable writes and exchange advancement.
- Every live Tool evaluation compares CORE against the existing Legacy calculation before CORE values are applied.
- Any provider/effect disagreement or CORE exception automatically disables CORE evaluation for the session and falls back to Legacy Mixed.
- Manual rollback and re-enable APIs are exposed for QA.
- Legacy Mixed Unarmed -1D remains active through the profile override.

Preserved: qa.20 Inventory handoff, qa.19 smart-select scroll fix, M2/M3/M4, Equipment/portrait/token workflows.

QA protocol: TEST_PROTOCOL_v1.7.0-qa.21.md
