Realm Guard / Torchbearer v1.7.0-qa.13 — M5 deep live shadow parity.

This patch resumes the main M5 functional track after the qa.12 Ranger-sheet scroll-position hotfix. Legacy Mixed remains the sole live authority. CORE M5 remains shadow/read-only and still does not block, rewrite or migrate gameplay state.

New in qa.13:
- deepens Inventory parity beyond successful Item writes
- observes real Ranger Equipment drag/drop intent and identifies rejected Legacy placement attempts when no Item write follows
- records rejected operations as `LIVE_INVENTORY_REJECT` and compares the same target against CORE PlacementValidator
- accepted Inventory writes continue to use the existing live preUpdateItem parity path
- adds Conflict declaration/provider parity: revealed `gmWeaponId` / `rangerWeaponId` selections are resolved through CORE and compared
- adds Conflict disabled-provider parity: live `disabledGearIds` from Disarm are checked against CORE provider disabled state
- declaration and disable observations are de-duplicated to avoid rerender warning/count loops
- exposes manual `observeInventoryDecision` and `observeConflictProviders` QA helpers
- adds automated smoke coverage for rejected Inventory parity, declaration parity, disabled provider parity and deep-state de-duplication

Preserved:
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- Legacy Inventory writers remain live
- Legacy Conflict writers remain live
- no Actor/Item migration
- no Conflict live takeover
- existing Conflict roll effect parity from qa.11 remains active
- qa.12 Ranger sheet scroll-position persistence remains active
- Equipment Figure / Inventory layout remains locked
- PC square/original portrait and separate round token workflow remains unchanged
- FilePicker compatibility remains unchanged
- M2, M3 and verified M4 remain unchanged

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.13.md`

Primary PASS condition: both accepted and rejected real Inventory interactions agree with CORE, Conflict declarations and Disarm-disabled providers agree with CORE, real Conflict roll parity remains clean, and Legacy Mixed remains the only live authority.