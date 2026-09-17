# Realm Guard / Torchbearer v1.9.0-qa.1

## M7 — Session Engine Foundation

This QA build starts M7 with a read-only CORE session foundation. Legacy Mixed remains the only live authority.

### Added
- `SessionState`
- `PhaseDefinition`
- `SessionEngine`
- `ActionCurrencyService`
- `PhaseAllowanceService`
- `RewardEngine`
- `RewardAuthority`
- Legacy session snapshot adapter
- `game.realmGuard.core.m7` diagnostics / preview API
- reusable M7 smoke test
- dedicated qa.1 test protocol

### Shadow capabilities
- current GM/Players' Turn snapshot
- current cycle / last actor / Ranger turn-state snapshot
- Free Test vs Check preview
- no-two-tests-in-a-row preview
- Done/no-Checks/NPC/Free Play preview paths
- Check transfer preview
- End Session Fate/Persona proposal preview including caps and Goal suppression

### Authority
- M7 mode: `SHADOW_READ_ONLY`
- live application: OFF
- live authority: `LEGACY_MIXED`
- no Turn Manager or End Session UI rewrite
- no live resource/session mutation by CORE M7

### QA
See `TEST_PROTOCOL_v1.9.0-qa.1.md`.
