Realm Guard / Torchbearer v1.9.0-qa.4 — M7 Multiplayer State Authority Hardening.

This QA build hardens the existing Legacy Mixed structured Turn workflow across multiple connected Foundry clients.

Player-initiated Turn mutations are technically committed by one deterministic active GM and serialized there. Free Test/Check claims, Pass Check, Done/Discard and Recovery-attempt state use this authority path. Requests from stale Turn cycles/phases are rejected before mutation.

M7 adds read-only authority/state diagnostics for comparing GM and player clients:
- game.realmGuard.core.m7.authorityStatus()
- game.realmGuard.core.m7.stateFingerprint()
- game.realmGuard.core.m7.multiplayerState()

Legacy Mixed remains live rules authority. CORE M7 remains shadow/read-only with liveApplication false. No tabletop Turn, Check, Reward or Conflict rules are intentionally changed.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.4.md