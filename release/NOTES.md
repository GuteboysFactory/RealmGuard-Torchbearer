Realm Guard / Torchbearer v1.5.0-qa.10 — CORE M3 Custom Content Compatibility QA.

qa.9 verified the complete TestContext vocabulary including Custom Roll. qa.10 now verifies that supported user-created content remains first-class through the CORE shadow architecture and does not depend on canonical/default item names or IDs.

New in v1.5.0-qa.10:
- adds a dedicated `game.realmGuard.core.customContent` QA API
- exposes custom-content status, Actor inspection and named-item verification
- verifies a non-default custom Skill against the latest real Test parity result
- verifies custom Trait through the existing M2 Trait shadow comparator
- verifies custom Wise through the existing M2 Wise shadow comparator
- verifies custom Talent through the existing M2 Talent shadow comparator
- verifies custom Token of Power through the existing M2 Token of Power shadow comparator
- keeps the architectural rule explicit: type/data-driven, not name-driven
- preserves manual/free-text content as manual unless a structured effect mode exists
- keeps custom Conditions as an M4 carry-forward requirement and custom Gear as an M5 carry-forward requirement
- extends headless smoke coverage to retain Custom TestContext parity

Important preservation:
- Legacy Mixed remains sole live authority
- Test Engine remains SHADOW_PARITY / live OFF
- Effect Engine remains SHADOW_COMPARE / live OFF
- all six M2 providers remain registered
- no custom Item is migrated, renamed or rewritten by qa.10
- no canonical content replacement is performed
- no strict-profile correction or Conflict takeover

M3 work remaining after qa.10:
- final promotion matrix: modifiers, cancellation safety, duplicate-observer/reload, multi-client behavior and promotion-readiness review

QA protocol: TEST_PROTOCOL_v1.5.0-qa.10.md
Foundry target: v13.351.
Approved baseline: v1.5.0-qa.9 PASS.
