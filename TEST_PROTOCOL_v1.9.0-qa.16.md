# Realm Guard / Torchbearer v1.9.0-qa.16 — M7 Session Lifecycle Live Handoff QA

## Scope

This build promotes the final deferred M7 semantic authority to CORE:

- SESSION_STARTING
- SESSION_STARTED
- PHASE_CHANGED
- SESSION_ENDING
- SESSION_ENDED

The existing Foundry-side mutations remain in their current controllers. CORE now owns the canonical lifecycle event plan/commit semantics, while Legacy Mixed builds an independent event for parity.

Any lifecycle disagreement or CORE planner error rolls back **only Lifecycle authority** to Legacy Mixed.

After this patch, M7 has no deferred semantic authority remaining.

## Startup gate

Run:

```js
game.realmGuard.core.m7.lifecycleHandoffStatus()
```

Expected:
- enabled: true
- mode: "CORE_SESSION_LIFECYCLE"
- lifecycleAuthority: "CORE_M7"
- rollbackReason: ""
- liveScope contains all five lifecycle events
- deferredScope: []
- mismatches: 0
- errorFallbacks: 0

Also verify Claim / Transfer / Finish / Phase / Recovery / Trait Award / Reward all remain enabled.

## Gate A — Phase Changed lifecycle
Change GM Turn -> Players' Turn, then back.

Expected:
- one PHASE_CHANGED event per real phase change
- correct fromPhase / toPhase / turnCycleId details
- lifecycle telemetry matches increment
- no duplicate lifecycle events

## Gate B — End Session lifecycle
Finish a normal End Session.

Expected:
- one SESSION_ENDING
- one SESSION_ENDED
- correct sessionCycle and participant ids
- rewards still commit once
- finalized guard remains correct
- lifecycle parity remains green

## Gate C — Start Next Session lifecycle
Start the next session from the finalized-session guard.

Expected:
- one SESSION_STARTING
- sessionCycle increments exactly once
- reset/recharge work as before
- one SESSION_STARTED
- finalized becomes false
- no duplicate events

## Gate D — sequence integrity
Run:

```js
game.realmGuard.core.m7.lifecycleSummary()
```

Expected lifecycle order for a full end/start cycle:
- SESSION_ENDING
- SESSION_ENDED
- SESSION_STARTING
- SESSION_STARTED

PHASE_CHANGED events may appear before/after as caused by actual phase changes, but never duplicate without a real transition.

## Gate E — multiplayer observation
With GM + Player connected:
- GM performs phase change and End/Start Session
- both clients converge on the same shared Foundry state
- only the GM performs world-setting/resource commits
- no socket or permission errors
- lifecycle telemetry on the committing GM remains parity-green

## Gate F — independent Lifecycle rollback

```js
game.realmGuard.core.m7.setCoreLifecycleEnabled(false)
```

Expected:
- Lifecycle: enabled false / LEGACY_ROLLBACK / LEGACY_MIXED
- all other M7 handoffs remain enabled
- phase changes and End/Start Session still work through Legacy lifecycle observation

Re-enable/reset:

```js
game.realmGuard.core.m7.setCoreLifecycleEnabled(true)
game.realmGuard.core.m7.resetLifecycleHandoffTelemetry()
```

## Regression
Re-check:
- Free Test / paid Players' Turn test
- Pass Check
- Done / Discard
- Recovery
- Trait Against -> Check
- Reward Proposal + Commit
- duplicate End Session guard
- sessionCycle vs turnCycleId separation
- reload
- multi-client synchronization

## PASS criteria
qa.16 passes when all five lifecycle event types are CORE-authoritative with zero normal-QA mismatches/error fallbacks, lifecycle order and state transitions remain exact, independent Lifecycle rollback works, and all prior M7 handoffs remain regression-safe.


## Verification result — 2026-09-19

**VERIFIED.**

Manual Foundry v13.351 QA completed successfully:

- startup gate PASS
- PHASE_CHANGED lifecycle PASS
- SESSION_ENDING / SESSION_ENDED PASS
- SESSION_STARTING / SESSION_STARTED PASS
- lifecycle sequence integrity PASS
- multiplayer observation PASS
- independent Lifecycle rollback PASS
- final M7 regression / closure gate PASS

Verified final state:

- Claim handoff enabled
- Transfer handoff enabled
- Finish handoff enabled
- Phase handoff enabled
- Recovery handoff enabled
- Trait Award handoff enabled
- Reward handoff enabled
- Lifecycle handoff enabled
- no deferred M7 semantic authority remains
- no normal-QA lifecycle mismatches or CORE error fallbacks remained at verification
- reload and multi-client synchronization remained regression-safe

**M7 — Session Engine, Turn Manager & End Session = VERIFIED / CLOSED.**
