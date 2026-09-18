# Realm Guard / Torchbearer v1.9.0-qa.5 — M7 Session Lifecycle Shadow QA

## Scope

This build completes the M7 Session Engine shadow contract with explicit lifecycle events.

Legacy Mixed remains the only live rules authority.
CORE M7 remains shadow/read-only with `liveApplication: false`.

Lifecycle events observed:
- `SESSION_STARTING`
- `SESSION_STARTED`
- `PHASE_CHANGED`
- `SESSION_ENDING`
- `SESSION_ENDED`

No tabletop rule behavior should change.

## Startup

1. Install/update to `v1.9.0-qa.5` on Foundry v13.351.
2. Load the world without startup errors.
3. Run:

```js
game.realmGuard.core.m7.getStatus()
```

Expected:
- `buildScope: "SESSION_LIFECYCLE_SHADOW"`
- `mode: "SHADOW_READ_ONLY"`
- `authority: "LEGACY_MIXED"`
- `liveApplication: false`
- capabilities include `SessionLifecycleService` and all five lifecycle event names.

4. Clear previous diagnostic history if desired:

```js
game.realmGuard.core.m7.clear()
```

## Phase lifecycle

5. Start Players' Turn from GM.
6. Switch back to GM Turn.
7. Run:

```js
game.realmGuard.core.m7.lifecycle()
```

Expected:
- one `PHASE_CHANGED` for each real phase transition
- correct `fromPhase` / `toPhase`
- increasing Turn cycle ids
- no event when selecting the already-current phase.

## End Session lifecycle

8. Complete an End Session cycle normally.
9. Run:

```js
game.realmGuard.core.m7.lifecycleSummary()
```

Expected sequence includes:
- `SESSION_ENDING`
- `SESSION_ENDED`

The ENDING event must occur before reward/session finalization completes.
The ENDED event must occur only after successful finalization.

10. Re-open End Session while the same cycle is finalized.
11. Do not start the next session yet.
Expected:
- duplicate-finalization protection remains unchanged
- no second `SESSION_ENDING` / `SESSION_ENDED` pair for the same finalized attempt.

## Start Next Session lifecycle

12. Choose Start Next Session.
13. Run:

```js
game.realmGuard.core.m7.lifecycle()
```

Expected sequence includes:
- `SESSION_STARTING`
- `SESSION_STARTED`

Expected details:
- previous session cycle
- new session cycle
- `SESSION_STARTING` before reset/recharge work
- `SESSION_STARTED` after the new session is ready.

## Ordering gate

14. Run:

```js
game.realmGuard.core.m7.lifecycleSummary()
```

Expected lifecycle order for a normal end/start transition:

```text
SESSION_ENDING
SESSION_ENDED
SESSION_STARTING
SESSION_STARTED
```

Phase changes may appear before, between or after those depending on GM actions, but every individual lifecycle pair must preserve its own order.

## Multiplayer regression

15. Re-run a player-owned Free Test or Check spend through the GM proxy.
16. Confirm GM/player state fingerprints still match.
17. Confirm stale request protection still works.
18. Confirm Pass Check and Done / Discard still work.

## Reward regression

19. Complete End Session rewards.
20. Run:

```js
game.realmGuard.core.m7.rewardParitySummary()
```

Expected:
- `mismatches: 0`
- `allParity: true` after observations exist.

## PASS criteria

`v1.9.0-qa.5` passes when all five lifecycle event types are present, phase changes produce exactly one shadow event per actual transition, End Session emits ENDING → ENDED once, Start Next Session emits STARTING → STARTED once, ordering is correct, and all qa.2–qa.4 multiplayer/reward behavior remains unchanged.

## Rollback criteria

Rollback if lifecycle observation mutates live rules state, duplicate events appear for a single successful transition, event ordering is reversed, failed/cancelled operations emit completion events, or any existing Turn/Reward/multiplayer behavior regresses.
