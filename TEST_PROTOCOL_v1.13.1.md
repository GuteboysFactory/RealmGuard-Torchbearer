# 1.13.1 — World startup performance and Condition regression

Scope: remove redundant Condition/ActiveEffect writes and token redraws during startup without changing rules, supported profiles or existing data policies.

## Reproduced operation counts
`qa/condition-startup-smoke.mjs` builds 60 current Actor-shaped documents, each with seven legacy canonical Conditions, one active Fresh effect and one token.

| Startup operation | 1.13.0 baseline | Optimized unchanged-world load |
|---|---:|---:|
| Condition writes | 420 | 0 |
| ActiveEffect writes | 60 | 0 |
| Explicit token redraws | 60 | 0 |

The regression also verifies that real differences are batched per Actor, active Condition metadata propagates to effects, subsequent loads are no-ops, normal toggle/create/delete behavior remains correct, all four stable profiles preserve current data, custom/TB2E data is excluded from enrichment, and only the primary active GM performs alignment. ActiveEffect artwork uses Foundry's current `img` field: [Foundry v13 ActiveEffect schema](https://foundryvtt.com/api/v13/classes/foundry.documents.ActiveEffect.html).

These operation counts use simulated documents. They do not establish a new wall-clock startup time for the user's world.

## Actual Foundry acceptance
1. Update from 1.13.0 to 1.13.1 through the stable channel. Use the same world and module configuration for comparison.
2. Record time from joining until the table is usable. Reload once more and record that time separately; the first load can still repair outdated canonical data.
3. Verify the previously selected supported profile and character data remain unchanged. Toggle one Condition on/off; its icon must follow on the Actor's tokens, and ordinary roll effects must retain their previous behavior.
4. Verify an existing custom Condition remains unchanged. Check multiple tokens of the same Actor if present.
5. If startup still takes around 20 seconds, report whether the delay occurs before the join screen or after joining and supply the new measured seconds. The read-only diagnostic `game.realmGuard.startup.conditionAlignment` reports this alignment's own duration and work counts; it is not the overall world-load timer.

Existing startup repairs remain available on every load, using changed-only checks rather than a marker that could prevent later repairs. No repair is hidden behind a delayed background timer. Do not mark the actual Foundry timing check passed until the user measures it.
