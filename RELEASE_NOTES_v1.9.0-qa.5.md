# Realm Guard / Torchbearer v1.9.0-qa.5 — M7 Session Lifecycle Shadow

This QA build completes the planned M7 Session Engine shadow contract with explicit lifecycle observation.

Added CORE lifecycle definitions:
- SESSION_STARTING
- SESSION_STARTED
- PHASE_CHANGED
- SESSION_ENDING
- SESSION_ENDED

Legacy Mixed phase changes and End Session flows now emit read-only M7 lifecycle observations. These observations do not control or mutate gameplay state.

New diagnostics:
- `game.realmGuard.core.m7.lifecycle()`
- `game.realmGuard.core.m7.lifecycleSummary()`

Legacy Mixed remains the only live rules authority.
CORE M7 remains `SHADOW_READ_ONLY` with `liveApplication: false`.

This build is intended to close the final missing M7 shadow-contract element before any separate, explicitly approved live-authority handoff work begins.

QA protocol: `TEST_PROTOCOL_v1.9.0-qa.5.md`
