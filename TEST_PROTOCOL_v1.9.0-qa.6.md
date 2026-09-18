# Realm Guard / Torchbearer v1.9.0-qa.6 — M7 Authority Boundary Closure QA

## Scope

This build closes the remaining M7 Action Currency authority leaks before any CORE live-authority handoff.

Legacy Mixed remains the live tabletop rules authority.
CORE M7 remains shadow/read-only with `liveApplication: false`.

## Structural changes

- `SessionState.sessionCycle` now represents the actual play-session / End Session cycle.
- `SessionState.turnCycleId` represents the GM Turn / Players' Turn revision.
- `SessionState.cycleId` remains a compatibility alias for `turnCycleId` during the QA transition.
- Trait Against Check awards are committed through the serialized GM Turn authority bridge.
- GM Turn Recovery Check spending is committed through the same bridge.
- Recovery rollback/refund is committed through the same bridge and validates the original spend state.
- No generic arbitrary `SET_CHECKS` socket operation is introduced.

## Startup

Run:

```js
game.realmGuard.core.m7.getStatus()
```

Expected:
- `buildScope: "AUTHORITY_BOUNDARY_CLOSURE"`
- `mode: "SHADOW_READ_ONLY"`
- `authority: "LEGACY_MIXED"`
- `liveApplication: false`
- capabilities include `SessionCycleSeparation` and `ActionCurrencyAuthorityBoundary`.

Run:

```js
game.realmGuard.core.m7.current()
```

Expected:
- `sessionCycle` present
- `turnCycleId` present
- `cycleId === turnCycleId`

## Action Currency authority diagnostics

Run:

```js
game.realmGuard.core.m7.actionCurrencyAuthority()
```

Expected semantic operations include:
- CLAIM_TEST
- DONATE_CHECK
- FINISH_PLAYER
- AWARD_TRAIT_CHECKS
- SPEND_RECOVERY_CHECKS
- REFUND_RECOVERY_CHECKS

Expected:
- `serializedByPrimaryGm: true`
- `directGenericSetOperation: false`
- `liveRulesAuthority: "LEGACY_MIXED"`
- `coreLiveApplication: false`

## Trait Against

As a player-owned Ranger during GM Turn:

1. Perform an ordinary test using Trait Against.
2. Confirm the correct Check award appears exactly once.
3. Repeat with a Versus Trait Against path when practical.
4. Confirm no permission/socket errors.
5. Confirm GM and player see the same Check total.

## GM Turn Recovery

1. Give a player-owned Ranger at least 2 Checks.
2. During GM Turn, start a valid Recovery test.
3. Confirm exactly 2 Checks are spent.
4. Complete the roll and confirm the recovery-attempt state still records correctly.

## Recovery rollback

Exercise a path where the Recovery spend occurs but the following roll cannot commit/returns no result.

Expected:
- the exact 2-Check spend is refunded once
- a repeated/stale refund cannot increase Checks
- phase/cycle changes reject stale refunds

## Session/Turn identity

1. Record `sessionCycle` and `turnCycleId`.
2. Change GM/Players' Turn phase.
Expected:
- `turnCycleId` increases
- `sessionCycle` does not change.

3. Finalize and start the next play session.
Expected:
- `sessionCycle` increases by one
- lifecycle ordering from qa.5 remains correct.

## Regression

Re-run:
- Free Test
- paid Players' Turn test
- Pass Check
- Done / Discard
- multiplayer state fingerprint
- stale request protection
- End Session reward parity
- lifecycle sequence

## PASS criteria

qa.6 passes when session-cycle identity is separate from turn-cycle identity, all M7-related Action Currency writes use the serialized GM authority boundary, Trait Against and Recovery behavior is unchanged, refund is safe against duplicate/stale application, and qa.2–qa.5 behavior remains green.

## Rollback criteria

Rollback if Check awards/spends duplicate, player-owned Rangers lose valid actions, Recovery refunds can be replayed, sessionCycle changes on ordinary phase changes, turnCycleId stops incrementing, or CORE becomes live unexpectedly.
