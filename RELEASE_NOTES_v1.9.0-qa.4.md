# Realm Guard / Torchbearer v1.9.0-qa.4 — M7 Multiplayer State Authority Hardening

This QA build hardens Legacy Mixed structured Turn state across multiple Foundry clients.

Player-initiated structured Turn mutations now use a single active GM as the technical commit authority. The GM serializes requests for Free Test/Check claims, Pass Check, Done/Discard and Recovery-attempt state. Requests carrying a stale Turn cycle or phase are rejected rather than being applied to newer state.

M7 adds multiplayer diagnostics:
- `game.realmGuard.core.m7.authorityStatus()`
- `game.realmGuard.core.m7.stateFingerprint()`
- `game.realmGuard.core.m7.multiplayerState()`

These diagnostics are read-only and allow GM/player clients to compare the state they observe after updates, reloads and reconnects.

Legacy Mixed remains the only live rules authority. CORE M7 remains `SHADOW_READ_ONLY` with `liveApplication: false`. No Turn, Check, Reward or Conflict rules are intentionally changed.

QA protocol: `TEST_PROTOCOL_v1.9.0-qa.4.md`
