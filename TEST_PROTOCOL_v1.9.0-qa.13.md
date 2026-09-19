# Realm Guard / Torchbearer v1.9.0-qa.13 — M7 Recovery Live Handoff QA

## Scope

This build promotes Recovery economy/attempt state to CORE M7 live authority while preserving Legacy Mixed behavior through independent parity planning and rollback.

Live CORE M7 scope:
- CLAIM_TEST
- PASS_CHECK
- DONE_DISCARD
- PHASE_CHANGE
- SPEND_RECOVERY_CHECKS
- REFUND_RECOVERY_CHECKS
- MARK_RECOVERY

Still Legacy Mixed:
- TRAIT_CHECK_AWARD
- END_SESSION
- remaining session/lifecycle commits

## Recovery semantics under test

CORE M7 now decides:
- GM Turn Recovery costs exactly 2 Checks
- Players' Turn Recovery has no direct Recovery spend here; it uses the existing Players' Turn test economy
- Free Play Recovery has no Turn/Check cost
- failed/blocked Recovery rolls can restore a valid 2-Check GM Turn spend through the refund receipt
- refund receipts are rejected if stale, invalid, or state no longer matches
- each Condition is marked attempted at most once per turnCycleId
- Recovery attempt state resets naturally on a new turnCycleId

Legacy Mixed computes independent read-only plans for spend, refund and attempt marking. Any disagreement rolls back only the Recovery handoff.

## Startup gate

Run:

```js
game.realmGuard.core.m7.recoveryHandoffStatus()
```

Expected:
- enabled: true
- mode: "CORE_RECOVERY_LEGACY_SESSION"
- recoveryAuthority: "CORE_M7"
- mismatches: 0
- errorFallbacks: 0

Also verify:

```js
game.realmGuard.core.m7.claimHandoffStatus()
game.realmGuard.core.m7.transferHandoffStatus()
game.realmGuard.core.m7.finishHandoffStatus()
game.realmGuard.core.m7.phaseHandoffStatus()
```

All remain enabled.

## Gate A — GM Turn Recovery spend

During GM Turn:
1. Use a Ranger with at least 3 Checks.
2. Start a valid Recovery test.

Expected:
- exactly 2 Checks spent before roll
- spend receipt reports phase gm, source gm-checks, cost 2
- before/after values exact
- Recovery handoff telemetry records a CORE match

## Gate B — insufficient GM Turn Checks

During GM Turn:
1. Use Ranger with 0 or 1 Check.
2. Attempt Recovery.

Expected:
- blocked before roll
- no Check mutation
- normal Legacy user-facing warning retained
- no handoff mismatch

## Gate C — Players' Turn Recovery

During Players' Turn:
1. Attempt a valid Recovery.

Expected:
- Recovery spend planner cost 0 / source no-gm-recovery-cost
- actual test still uses existing Players' Turn Free Test / Check economy
- no extra 2-Check Recovery charge
- successful roll marks that Condition attempted for this turnCycleId

## Gate D — Recovery attempt limit

1. Complete one Recovery attempt for a Condition.
2. Try the same Condition again in the same Turn.

Expected:
- second attempt blocked by existing Recovery validation
- attempt list contains the Condition once only
- no duplicate state mutation

## Gate E — refund after blocked/cancelled roll path

During GM Turn:
1. Start Recovery with at least 2 Checks so spend occurs.
2. Cause the subsequent roll to return no result via an existing valid blocked/cancel path after the spend.

Expected:
- exact 2 Checks restored
- receipt matches current turnCycleId and GM phase
- no over-refund
- refund telemetry matches CORE/Legacy

## Gate F — stale refund protection

Using a Recovery spend receipt:
1. Change turnCycleId or phase before refund.
2. Attempt refund.

Expected:
- refund rejected as stale
- no Check mutation
- no mismatch

## Gate G — state-mismatch refund protection

1. Spend 2 Checks for Recovery.
2. Change the Ranger's Checks before refund so current value no longer equals receipt.after.
3. Attempt refund.

Expected:
- refund rejected
- no overwrite of intervening Check state
- no mismatch

## Gate H — new Turn resets Recovery attempt allowance

1. Mark a Condition attempted.
2. Change phase through a new turnCycleId.
3. Return to a phase where Recovery can be attempted.

Expected:
- prior attempt flag no longer blocks the new cycle
- same Condition can receive one new attempt
- previous history remains non-destructively stored but inactive by cycle id

## Gate I — multi-client

With GM + Player:
1. Player starts Recovery on owned Ranger.
2. Verify spend/mark/refund operations proxy through primary GM.
3. Observe both clients.

Expected:
- exactly one authoritative mutation
- synchronized Checks and attempt state
- no socket/permission errors
- no duplicate spend/refund/mark

## Gate J — independent Recovery rollback

Run:

```js
game.realmGuard.core.m7.setCoreRecoveryEnabled(false)
```

Expected Recovery status:
- enabled: false
- mode: "LEGACY_ROLLBACK"
- recoveryAuthority: "LEGACY_MIXED"

Confirm Claim / Transfer / Finish / Phase remain enabled.

Perform:
- GM Turn Recovery spend
- attempt mark
- refund path

Expected:
- Legacy behavior still works
- only Recovery is rolled back

Re-enable:

```js
game.realmGuard.core.m7.setCoreRecoveryEnabled(true)
game.realmGuard.core.m7.resetRecoveryHandoffTelemetry()
```

## Regression

Quickly re-check:
- Free Test
- paid Players' Turn test
- alternation
- Pass Check
- Done / Discard
- phase changes
- Trait Against -> Check
- End Session
- reward parity
- lifecycle
- sessionCycle separate from turnCycleId

## PASS criteria

qa.13 passes when Recovery spend, refund and attempt marking preserve verified Legacy Mixed behavior, CORE parity shows no normal-QA mismatches, stale/state-mismatch refund guards hold, one-attempt-per-Condition-per-turn remains correct, multi-client commits exactly once, independent Recovery rollback works, and previous M7 handoffs remain regression-safe.
