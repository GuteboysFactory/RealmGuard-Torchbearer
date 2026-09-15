Realm Guard / Torchbearer v1.7.0-qa.11 — M5 live shadow parity bridge.

This patch resumes the functional M5 backend track after the Equipment/Portrait/FilePicker polish line. Legacy Mixed remains the sole live authority. CORE M5 remains read-only/shadow and does not block or mutate gameplay state.

New in qa.11:
- adds `M5ParityBridge` between real Legacy Mixed activity and the existing CORE M5 services
- observes successful live Gear placement/unassignment writes and compares the intended target against `PlacementValidator`
- observes resolved live Conflict Tool/Weapon results from Conflict state and compares Legacy `gearDice`, conditional +success and success penalties against `ConflictToolService.evaluate()`
- records `MATCH`, `MISMATCH`, and `CORE_ONLY` events in a bounded in-memory QA buffer
- exposes parity diagnostics through `game.realmGuard.core.m5.parity`
- adds parity counters to the GM M5 diagnostics window
- parity mismatches warn the console but never cancel, block or rewrite the Legacy Mixed operation
- adds automated smoke coverage for inventory placement/container parity, Conflict Tool parity, live observer behavior, de-duplication and explicit non-takeover guarantees

Still intentionally unchanged:
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- Legacy Inventory writers remain live
- Legacy Conflict writers remain live
- no Actor/Item migration
- no Conflict live takeover
- CORE default still has no universal Unarmed penalty, while Legacy Mixed compatibility remains −1D until a future explicit profile handoff
- locked Equipment Figure / Inventory layout remains unchanged
- PC square/original portrait and separate round token workflow remains unchanged
- FilePicker compatibility work from qa.10 is preserved
- M2, M3 and verified M4 remain unchanged

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.11.md`

Primary PASS condition: real Inventory writes and resolved Conflict Tool rolls produce expected CORE parity observations with no unexplained mismatch, while Legacy Mixed remains the only live authority.