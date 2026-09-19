# Realm Guard / Torchbearer v1.9.0-qa.14 — M7 Trait Check Award Live Handoff QA

## Scope

This build promotes the bounded **Trait Against -> Check award** decision to CORE M7 live authority.

Live CORE M7 scope now includes:
- CLAIM_TEST
- PASS_CHECK
- DONE_DISCARD
- PHASE_CHANGE
- SPEND_RECOVERY_CHECKS
- REFUND_RECOVERY_CHECKS
- MARK_RECOVERY
- AWARD_TRAIT_CHECKS

Still Legacy Mixed:
- END_SESSION
- SESSION_LIFECYCLE_COMMIT

Legacy Mixed continues to compute an independent read-only Trait Check Award plan. A disagreement or CORE planner error rolls back **only Trait Check Award** to Legacy Mixed.

## Startup gate

Run:

```js
game.realmGuard.core.m7.traitAwardHandoffStatus()
```

Expected:
- enabled: true
- mode: "CORE_TRAIT_AWARD_LEGACY_SESSION"
- traitAwardAuthority: "CORE_M7"
- mismatches: 0
- errorFallbacks: 0
- deferredScope: ["END_SESSION", "SESSION_LIFECYCLE_COMMIT"]

Also verify Claim / Transfer / Finish / Phase / Recovery remain enabled.

## Gate A — normal GM Turn Trait Against award
During GM Turn, resolve a normal legal Trait Against test.
Expected: correct Check award, one Actor mutation, exact before/after/earned, parity match.

## Gate B — +2 award and cap handling
Exercise a 2-Check award or planner path.
Expected: request clamps to 2, Check maximum is respected, earned equals actual increase, no overflow.

## Gate C — no award outside GM Turn
During Players' Turn or Free Play, reach the award helper where possible.
Expected: earned 0, Checks unchanged, no mismatch.

## Gate D — multiplayer authority
Player resolves Trait Against on an owned Ranger.
Expected: AWARD_TRAIT_CHECKS routes through primary GM, exactly one mutation, synchronized Checks, no permission/socket errors.

## Gate E — independent Trait Award rollback

```js
game.realmGuard.core.m7.setCoreTraitAwardEnabled(false)
```

Expected only Trait Award rolls back; Claim / Transfer / Finish / Phase / Recovery remain CORE-enabled. Confirm Legacy award still works.

Re-enable:

```js
game.realmGuard.core.m7.setCoreTraitAwardEnabled(true)
game.realmGuard.core.m7.resetTraitAwardHandoffTelemetry()
```

## Regression
Re-check Free Test / paid test / alternation, Pass Check, Done / Discard, phase changes, Recovery, End Session + reward parity, lifecycle, sessionCycle vs turnCycleId, reload and multi-client synchronization.

## PASS criteria
qa.14 passes when Trait Against Check awards preserve verified Legacy Mixed behavior, cap/clamp behavior is exact, player commits remain serialized through primary GM, normal QA shows no parity mismatches, independent Trait Award rollback works, and previous M7 live handoffs remain regression-safe.


## Verification result — 2026-09-19

**VERIFIED.**

Manual Foundry v13.351 QA completed successfully:
- startup gate PASS
- normal GM Turn Trait Against -> Check PASS
- +2 award and cap handling PASS
- no structured Trait Check award outside GM Turn PASS
- multiplayer primary-GM authority PASS
- independent Trait Award rollback PASS
- prior M7 live-handoff regression PASS
- End Session + lifecycle + reload regression PASS

No normal-QA Trait Award mismatches or CORE error fallbacks remained at verification.
