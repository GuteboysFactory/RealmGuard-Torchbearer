# TEST PROTOCOL — v1.13.0-qa.25 · M10D.18 P3.1 Full CORE Re-Audit (targeted)

Source: Torchbearer 2E Scholar's Guide **SG pp.27, 32–34, 36–38**, Dungeoneer's Handbook DH pp.75–78.
P3.1 covers targeted test factor, versus factor, tiebreaker and zero-rated-helper source mismatches. It DOES NOT close the full re-audit of all 14 existing adapters.

## Gate A — Installation & Safety
1. QA manifest shows `1.13.0-qa.25` in Foundry v13.351.
2. `game.realmGuard.core.m10d.tests.factorObstaclePlan`, `versusFactorPlan`, `tieBreakerPlan` exist.
3. `m10d.getStatus().existingShadowReauditRequired === true`.
4. Global kill switch ENGAGED, M11 PAUSED, liveDomainCount 0, Legacy Mixed live authority. Stable 1.12.0 unchanged.

## Gate B — Tests / Factors / Tiebreak (SG 27, 32–34)
- GM-selected Hunter Stalking Trails(1) + Rarity Shy Beast(2) => Ob 3. Unrelated non-additive primary factors together => BLOCKED.
- Versus factor count 2 => -2s and no +Ob.
- A tied Skill test uses its linked Beginner's Luck Will or Health ability for an independent NO_HELP second versus test; Will/Health -> Nature; Nature -> GM-selected Will/Health; monster -> Nature.
- The original tied roll logs **no advancement** when tiebreaker is used. A second tie fails for the player unless broken in their favor.
- No dice executed, no source factor category inferred without GM, no advancement committed.

## Gate C — Help restrictions (SG 37)
- An injured/sick zero-rated Will/Health/Skill helper is blocked for ordinary help.
- Beginner's Luck Help is blocked if chosen Will/Health rating fell to 0 from Injury/Sickness.
- Conflict Help cannot use a helper with the same rating-zero restriction.
- Valid same-skill help, eligible Will/Health, BL Help and Conflict Help continue to work.
- Wise aid stays a separate route and is not reclassified as ordinary Help.

## Gate D — Regression / persistence
- Historical M10D.2 Wises, M10D.3 Help, M10D.4 Tests + all P1/P2 smoke tests pass in Actions.
- Manually verify Ranger and NPC sheets, existing Legacy Mixed rolls, Versus, Conflict, Gear, Conditions and Magic remain unaffected.
- Reload: HP, Traits, equipment, Conditions, Tests/Checks, Fate/Persona, active profile and M11 flags unchanged.
- All new planners return read-only output; zero Actor/Item/Journal/Settings writes.

Acceptance: Gates A–D must be confirmed in Foundry. Track each of the fourteen audit domains separately in `M10D18_P3_FULL_CORE_REAUDIT_LEDGER.md`. No M11 restart from P3.1.
