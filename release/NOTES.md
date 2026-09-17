Realm Guard / Torchbearer v1.9.0-qa.1 — M7 Session Engine Foundation.

This QA build starts M7 with a read-only CORE session foundation. Legacy Mixed remains the only live authority for Turn Manager, Checks, Free Tests and End Session.

Added SessionState, PhaseDefinition, SessionEngine, ActionCurrencyService, PhaseAllowanceService, RewardEngine and RewardAuthority, plus a Legacy session snapshot adapter and `game.realmGuard.core.m7` diagnostics/preview API.

The shadow layer can inspect current session state, preview Free Test vs Check cost, alternation/Done/no-Checks/NPC/Free Play paths, preview Check transfer legality, and reproduce current End Session Fate/Persona proposal math including Goal suppression and caps.

M7 live application remains OFF. No Turn Manager or End Session UI rewrite, no CORE resource/session mutation, and no gameplay change is intended.

QA protocol: TEST_PROTOCOL_v1.9.0-qa.1.md