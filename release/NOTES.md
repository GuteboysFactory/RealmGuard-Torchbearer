Realm Guard / Torchbearer v1.7.0-qa.20 — M5 controlled Inventory validation handoff.

qa.15 proved promotion readiness across accepted/rejected Inventory paths plus Conflict declaration/roll/disable parity. qa.20 performs the first bounded live handoff.

New in qa.20:
- CORE M5 PlacementValidator becomes live validation authority for `PLACE_ZONE` and `PLACE_CONTAINER`
- existing Legacy Mixed Item update path remains the writer; no inventory data-model migration is introduced
- Conflict remains fully Legacy Mixed
- Unassign and container detach remain Legacy Mixed
- every live validation decision records handoff telemetry
- automatic session rollback to Legacy Mixed if CORE validation throws or disagrees with the legacy validator
- manual QA rollback and re-enable controls exposed through `game.realmGuard.core.m5.inventory`
- handoff status/history exposed for direct live verification
- M5 status now reports split authority instead of claiming all-live or all-shadow state

Safety model:
- CORE validates
- Legacy Mixed writes
- CORE/Legacy disagreement does not write according to CORE; it immediately falls back to Legacy Mixed and disables the handoff for the rest of the session
- CORE error does the same
- Conflict takeover is still OFF

Preserved:
- qa.19 smart-select scroll root fix
- qa.12 Ranger sheet scroll-position persistence
- Equipment paper-doll UX
- portrait/token workflow and FilePicker compatibility
- M2, M3 and verified M4

QA protocol: `TEST_PROTOCOL_v1.7.0-qa.20.md`

Primary PASS condition: legal and illegal zone/container moves are decided by CORE with zero validation disagreements/error fallbacks, Legacy Mixed remains the writer, manual rollback works, and regression checks remain clean.