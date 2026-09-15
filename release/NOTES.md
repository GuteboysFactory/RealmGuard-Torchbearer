Realm Guard / Torchbearer v1.7.0-qa.15 — M5 promotion readiness gate.

This QA build adds an explicit readiness gate on top of the live M5 shadow-parity work. It does not perform any CORE live takeover. Legacy Mixed remains the sole gameplay authority.

New in qa.15:
- adds `game.realmGuard.core.m5.readiness()`
- requires clean live coverage for:
  - accepted Inventory write
  - rejected Inventory decision
  - Conflict Tool declaration
  - Conflict Tool live roll
  - Conflict Tool disable / Disarm
- returns `PARTIAL` until all required paths have been observed
- returns `BLOCKED_MISMATCH` when any parity mismatch exists
- returns `READY_FOR_CONTROLLED_HANDOFF` only when every required live path is observed with zero mismatches while `liveApplication:false` and `authority:"LEGACY_MIXED"`
- GM M5 diagnostics now show promotion-readiness coverage
- adds automated smoke coverage for readiness, missing-path and mismatch blocking behavior

Correction from qa.14:
- the Staff report was a false alarm caused by test setup rather than a confirmed system bug
- the temporary physical-name Conflict Tool guard introduced for that report has therefore been removed
- existing custom/narrative Conflict Tools remain untouched according to their configured data

Preserved:
- M5 remains shadow/read-only
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- accepted/rejected Inventory parity
- Conflict declaration, roll and Disarm parity
- qa.12 Ranger-sheet scroll-position persistence
- Equipment layout and portrait/token workflow
- Foundry FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.15.md`

Primary PASS condition: after one clean live observation of every required M5 path, `game.realmGuard.core.m5.readiness()` reports `READY_FOR_CONTROLLED_HANDOFF`, the mismatch list is empty, and Legacy Mixed remains sole live authority.