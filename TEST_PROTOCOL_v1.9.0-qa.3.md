# Realm Guard / Torchbearer v1.9.0-qa.3 — M7 End Session / Reward Shadow Parity QA

## Scope

This build adds read-only parity observation around the existing Legacy Mixed End Session reward workflow.

- Legacy Mixed remains the only live authority.
- CORE M7 remains shadow/read-only.
- Existing End Session UI and award mutation path remain unchanged.
- M7 observes reward proposal inputs and approved commit results.
- No CORE reward mutation is permitted.

## Install / startup

1. Install/update to `v1.9.0-qa.3` on Foundry v13.351.
2. World loads without startup errors.
3. `game.realmGuard.core.m7.getStatus()` reports:
   - `phase: "M7"`
   - `buildScope: "REWARD_SHADOW_PARITY"`
   - `mode: "SHADOW_READ_ONLY"`
   - `authority: "LEGACY_MIXED"`
   - `liveApplication: false`

## Reward proposal parity

4. Run End Session normally and select reward criteria for at least one Ranger.
5. Proceed to Review Awards.
6. Run:

```js
game.realmGuard.core.m7.rewardParitySummary()
```

Expected:
- at least one observed row
- `mismatches: 0`
- `allParity: true`

7. Run:

```js
game.realmGuard.core.m7.rewardParity()
```

For each `PROPOSAL_PARITY` row:
- `parity: true`
- Legacy and CORE Fate match
- Legacy and CORE Persona match
- Persona raw count matches
- Goal Fate suppression matches

8. Specifically verify a case where Goal progress Fate and Goal accomplished Persona are both selected.
   - Goal progress Fate is suppressed in both paths.
9. Verify Persona cap at 4 in both paths.

## Approved commit parity

10. On Review Awards, approve Fate and/or Persona and Finish Session.
11. Run `rewardParitySummary()` again.
12. At least one `COMMIT_PARITY` row should now exist.
13. Each commit parity row should match for:
   - before Fate / Persona
   - approved Fate / Persona
   - post-cap next Fate / Persona
   - actual Fate / Persona applied
14. Test at least one resource-cap case if convenient.
15. Test one unapproved reward category.
   - CORE preview must also apply 0 for the unapproved category.

## Legacy regression

16. End Session still applies rewards only through Legacy.
17. Duplicate-finalization guard still blocks repeat rewards.
18. Start Next Session still advances the End Session cycle and clears finalized.
19. Trait reset remains unchanged.
20. Talent / Token of Power reset remains unchanged where test data exists.
21. Turn Manager, Checks, Free Tests, Conflict, rolls and Gear remain unaffected.

## Diagnostics

```js
game.realmGuard.core.m7.rewardParitySummary()
game.realmGuard.core.m7.rewardParity()
game.realmGuard.core.m7.history()
```

A clean representative run should report `mismatches: 0`.

## PASS criteria

`v1.9.0-qa.3` passes when Legacy and CORE reward proposal/commit calculations match for representative End Session cases, no CORE mutation occurs, existing End Session behavior remains unchanged, and no reward parity mismatches are observed.

## Rollback criteria

Rollback if CORE changes Fate/Persona/session state, End Session behavior changes unexpectedly, duplicate protection regresses, or any representative reward parity row reports `parity: false`.
