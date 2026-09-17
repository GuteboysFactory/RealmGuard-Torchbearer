# Realm Guard / Torchbearer v1.9.0-qa.2 — M7 Synthetic Participant Parity

This QA patch fixes an Actor-resolution bug discovered during M7 live QA when Turn Manager is used with unlinked/synthetic token Actors.

Turn Manager now preserves the displayed participant Actor through Pass Check and Done/Discard instead of falling back to the world Actor by id. This keeps scene-token Check state authoritative for the existing Legacy Mixed workflow when an unlinked token is the active participant.

M7 now uses the same participant selection path for session snapshots and preview matching, including participant reference provenance and synthetic-token state. CORE M7 remains shadow/read-only; Legacy Mixed remains the only live authority for Turn Manager, Checks, Free Tests and End Session.

No Check rules, phase rules, reward rules or other gameplay semantics are intentionally changed.

QA protocol: `TEST_PROTOCOL_v1.9.0-qa.2.md`
