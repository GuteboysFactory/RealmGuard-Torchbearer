# 1.13.1 — Reduce repeated world-startup writes

Fixes repeated Condition alignment work during world startup in stable 1.13.0. Previously every canonical Condition was saved on every GM startup even when already current; active Conditions also rewrote their ActiveEffects and redrew their tokens. These document updates create avoidable network/server work and sheet/token refreshes in worlds containing many Actors.

Now only changed canonical Condition fields are written, in one embedded-Item batch per affected Actor. Current ActiveEffects are left untouched; missing or stale effects are still repaired. Startup redraws occur only for repaired effects and are coalesced per Actor. Normal Condition toggles keep their immediate updates and redraws. ActiveEffect artwork uses the current Foundry img field.

## Verification
A reproducible document-shaped test world with 60 current Actors and one active Fresh effect/token each produced 420 Condition writes, 60 effect writes and 60 token redraws with 1.13.0. The optimized startup performs zero writes or redraws for the same unchanged world. Tests also cover batched repairs, active-description/icon synchronization, repeated startup, normal toggles, all four stable profiles, custom/TB2E document preservation and primary-GM authority. These are simulated operation counts, not a measured loading time in the user's Foundry world.

No rules, profile availability or campaign-data policies change. Missing default Conditions are still added as before, and outdated canonical metadata is still repaired. The Starter Library already has a version-gated seed path and is unchanged. The QA channel stays at qa.29.

## Check the improvement
Update through the stable channel, enter the same world, then reload it again and compare time to a usable table. The first load may still apply needed repairs. Report the measured seconds and whether the delay occurs before the join screen or after joining. If delay remains, the latest read-only Condition startup report is available at game.realmGuard.startup.conditionAlignment to distinguish this work from other loading costs.

See TEST_PROTOCOL_v1.13.1.md. All required syntax, regression, release preflight and package checks run before the stable channel is promoted.
