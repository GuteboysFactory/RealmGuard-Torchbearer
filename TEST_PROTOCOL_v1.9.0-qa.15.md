# Realm Guard / Torchbearer v1.9.0-qa.15 — M7 End Session / Reward Live Handoff QA

## Scope

This build promotes End Session **reward proposal and reward commit semantics** to CORE M7 live authority.

Live CORE M7 reward scope:
- END_SESSION_REWARD_PROPOSAL
- END_SESSION_REWARD_COMMIT

Still Legacy Mixed:
- SESSION_LIFECYCLE_COMMIT

The End Session UI and group/GM approval flow are preserved. Legacy Mixed computes independent read-only reward plans for parity. Any disagreement or CORE planner error rolls back **only reward authority** to Legacy Mixed.

## Startup gate

Run:

```js
game.realmGuard.core.m7.rewardHandoffStatus()
```

Expected:
- enabled: true
- mode: "CORE_REWARD_LEGACY_LIFECYCLE"
- rewardAuthority: "CORE_M7"
- approvalAuthority: "GROUP_CONSENSUS_GM_COMMIT"
- mismatches: 0
- errorFallbacks: 0
- deferredScope: ["SESSION_LIFECYCLE_COMMIT"]

## Gate A — proposal parity
Open End Session and select representative Fate/Persona criteria, including Goal progress vs Goal accomplished where possible.

Expected:
- review values match prior behavior
- Goal-progress Fate suppressed when Goal accomplished
- Persona session proposal cap remains 4
- reward proposal telemetry records CORE/Legacy match

## Gate B — approved reward commit
Approve selected Fate and Persona and finish the session.

Expected:
- exact approved resources applied once
- current resource maximums respected
- actual award equals real before -> after increase
- no duplicate award
- FINALIZED guard remains active
- reward commit telemetry match

## Gate C — partial approval
Approve Fate but not Persona, then on another test case Persona but not Fate.

Expected:
- only approved reward category mutates
- unapproved proposal remains informational only
- no mismatch

## Gate D — resource cap
Use a Ranger close to Fate/Persona maximum.

Expected:
- resource never exceeds max
- actual award reflects capped increase
- chat summary marks cap as before
- parity remains green

## Gate E — duplicate finalization guard
Try End Session again after the same cycle is finalized without starting a new session.

Expected:
- no duplicate rewards
- normal existing "already finalized" guard remains
- reward handoff does not create a second commit

## Gate F — independent Reward rollback

```js
game.realmGuard.core.m7.setCoreRewardEnabled(false)
```

Expected:
- reward mode: LEGACY_ROLLBACK
- rewardAuthority: LEGACY_MIXED
- Claim / Transfer / Finish / Phase / Recovery / Trait Award remain CORE-enabled
- End Session rewards still apply correctly via Legacy

Re-enable:

```js
game.realmGuard.core.m7.setCoreRewardEnabled(true)
game.realmGuard.core.m7.resetRewardHandoffTelemetry()
```

## Regression
Re-check prior M7 handoffs, rewardParitySummary(), lifecycle observation, sessionCycle separation, Start Next Session reset/recharge, reload, and multi-client synchronization.

## PASS criteria
qa.15 passes when reward proposal/commit behavior matches verified Legacy Mixed, caps and approvals remain exact, duplicate awards remain impossible, normal QA has zero reward mismatches/error fallbacks, independent Reward rollback works, and all prior M7 handoffs remain regression-safe.
