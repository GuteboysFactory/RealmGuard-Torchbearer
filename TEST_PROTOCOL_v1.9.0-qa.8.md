# Realm Guard / Torchbearer v1.9.0-qa.8 — M7 Player Turn Test Claim Live Handoff QA

## Scope

This build performs the first live M7 Session Engine authority handoff.

Only `PLAYER_TURN_TEST_CLAIM` is live in CORE M7.

CORE M7 now decides:
- Free Test vs Check spend
- Players' Turn alternation
- Done guard
- no-Checks guard
- NPC untracked path
- Free Play untracked path

Legacy Mixed still owns:
- Pass Check
- Done / Discard commit
- phase changes
- Recovery
- Trait Against Check award
- End Session
- lifecycle/session transitions outside this claim decision

The existing primary-GM authority bridge still serializes player requests.

## Safety model

Every claim is calculated twice:
1. Legacy Mixed produces a read-only claim plan.
2. CORE M7 produces its claim plan.

If the plans match, CORE M7 is the live decision authority.

If they disagree, the handoff automatically disables itself and the Legacy Mixed plan is applied.

A CORE planning exception also disables the handoff and falls back to Legacy Mixed.

## Startup gate

Run:

```js
game.realmGuard.core.m7.getStatus()
```

Expected:
- `buildScope: "PLAYER_TURN_TEST_CLAIM_HANDOFF"`
- `mode: "PARTIAL_LIVE_HANDOFF"`
- `authority: "CORE_M7_CLAIM_LEGACY_SESSION"`
- `liveApplication: true`

Run:

```js
game.realmGuard.core.m7.claimHandoffStatus()
```

Expected:
- `enabled: true`
- `mode: "CORE_CLAIM_LEGACY_SESSION"`
- `claimAuthority: "CORE_M7"`
- `remainingSessionAuthority: "LEGACY_MIXED"`
- `autoRollbackOnDisagreement: true`
- `fallbackOnCoreError: true`
- all telemetry counters initially 0 after reload

## Gate A — first Free Test

During Players' Turn with a player-owned Ranger whose Free Test is unused:

1. Perform a normal Skill or Ability test.
2. Confirm the roll is allowed.
3. Confirm no Check is spent.
4. Confirm chat still reports Free Test used.

Then run:

```js
game.realmGuard.core.m7.claimHandoffStatus()
```

Expected:
- `matches >= 1`
- `mismatches: 0`
- `claimAuthority: "CORE_M7"`

## Gate B — paid Players' Turn test

After the Ranger's Free Test is used and the Ranger has at least 1 Check:

1. Perform the next legal test.
2. Confirm exactly 1 Check is spent.
3. Confirm `checksSpent` increments once.
4. Confirm chat still reports the Check spend.

Expected handoff telemetry:
- match count increases
- mismatch count remains 0

## Gate C — alternation guard

With at least two active Rangers:

1. Let Ranger A complete a Players' Turn test.
2. Attempt another tracked test immediately with Ranger A.

Expected:
- test is blocked
- no Check/Free Test state changes
- existing user-facing alternation message remains
- telemetry records a CORE/Legacy match, not a rollback

Then let Ranger B act and confirm Ranger A can act again if otherwise legal.

## Gate D — Done guard

Mark a Ranger Done using the existing Legacy Mixed Done / Discard flow.

Attempt a tracked test with that Ranger.

Expected:
- CORE claim decision blocks the test
- no resource/state mutation
- existing Done message remains
- handoff stays enabled

## Gate E — no Checks

Use the Free Test and reduce a Ranger to 0 Checks.

Attempt another tracked test.

Expected:
- blocked
- no negative Check value
- no state mutation
- handoff remains enabled

## Gate F — NPC and Free Play

NPC:
- make an NPC test while Turn Manager is active
- it must remain untracked and consume no Ranger Free Test/Checks

Free Play:
- disable Turn Manager
- make a normal character test
- it must remain untracked and consume no Free Test/Checks

Re-enable Turn Manager afterwards.

## Gate G — multiplayer

Repeat at least the Free Test and paid Check test from a non-GM player client.

Expected:
- player request still routes through the primary GM
- GM commits the state
- GM/player values synchronize
- no duplicate spend
- no permission/socket errors

## Gate H — forced rollback QA

This is optional/manual diagnostics and should be done only after normal gates pass.

Current status:

```js
game.realmGuard.core.m7.claimHandoffStatus()
```

Manual disable:

```js
game.realmGuard.core.m7.setCoreClaimEnabled(false)
```

Expected:
- claimAuthority becomes Legacy Mixed
- normal claim behavior continues through Legacy rollback mode

Re-enable before continuing:

```js
game.realmGuard.core.m7.setCoreClaimEnabled(true)
game.realmGuard.core.m7.resetClaimHandoffTelemetry()
```

## Regression

Re-check:
- Pass Check
- Done / Discard
- Recovery spend/refund
- Trait Against Check award
- phase changes
- End Session rewards
- reward parity
- lifecycle observation
- sessionCycle / turnCycleId separation

These remain outside the qa.8 live CORE claim scope and must behave exactly as in verified qa.6.

## PASS criteria

v1.9.0-qa.8 passes when:
- all normal claim paths remain behaviorally identical
- CORE_M7 is reported as claim authority
- normal telemetry shows matches with zero mismatches
- player requests remain serialized by the GM bridge
- rollback mode preserves gameplay
- all deferred Legacy Mixed session operations remain regression-safe
