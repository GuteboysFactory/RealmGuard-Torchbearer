# Realm Guard / Torchbearer v1.13.0-qa.25 — M10D.18 P3.1 Full CORE Re-Audit (targeted)

**QA candidate; Foundry Gate A–D still required. Not a complete 14-domain re-audit.**

### Source-backed repairs (Torchbearer 2E Scholar's Guide)
- SG p.27: GM-selected factors + additive categories yield Ob; unrelated primary categories cannot be summed. Pure `tests.factorObstaclePlan`, with caller/GMs responsible for category selection.
- SG p.32: a situational factor in a Versus test is **-1s** rather than +1 Ob, exposed as `tests.versusFactorPlan`.
- SG pp.32–34: `tests.tieBreakerPlan` follows the source's tiebreaker rolls and tests: no Help; initial Skill -> linked Will/Health, Will/Health -> Nature, Nature -> explicitly selected Will/Health, monsters -> Nature; original tied test gives no advancement when a tiebreaker is chosen; second tie fails unless broken in the player's favor. Never executes dice or marks advancement.
- SG p.37: injured/sick **rating-zero** Skills or Abilities cannot provide Help. Generic Help, Beginner's Luck Help, and Conflict Help now honor explicit helper-zero flags; no Actor inspection.
- DH pp.76–78 and SG pp.87–88 Wises rules spot-checked; full Wise-domain audit still OPEN.

### Release safety
- New read-only API additions `game.realmGuard.core.m10d.tests.factorObstaclePlan`, `versusFactorPlan`, `tieBreakerPlan`. All write flags false, no new live authority.
- New QA smokes plus historical QA suite, including P2.1 Traits, P2.2 Armor, P2.3 Conflict and P2.4 Magic.
- **M10D18_P3_FULL_CORE_REAUDIT_LEDGER.md** tracks the **14 historical adapter domains**. Full audit count remains **0/14** pending complete source/per-domain parity and Foundry QA; no premature completion.
- Legacy Mixed live authority; global kill switch ENGAGED; M11 PAUSED; full-core re-audit required. Stable v1.12.0 unchanged.
- Install only via protected QA manifest after tested ZIP and GitHub Release assets verify; Foundry test protocol `TEST_PROTOCOL_v1.13.0-qa.25.md`.
