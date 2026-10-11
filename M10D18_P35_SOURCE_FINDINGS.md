# M10D.18 P3.5 — Circles, Scales & Character Creation

**Scope:** targeted source-backed corrections, not a complete 14-domain CORE re-audit. CORE books: Dungeoneer's Handbook (DH), Scholar's Guide (SG).

| Finding | Source | Code change and boundary |
|---|---|---|
| C1 — Circles factors available | DH 61 | Previous historical adapter marked the Circles factors unavailable. Exact personnel categories and **Find Ally** position + level + attitude factors are now in `circles.factorPlan`; it is read-only and does not roll or choose an NPC. |
| C2 — Enmity Clause | DH 61–62 | Explicit `circles.testOutcomePlan({outcome:'FAIL',failureConsequence:'ENMITY_CLAUSE'})` returns **enemy instead of intended target** and +3 successes to enemy disposition for Drive Off/Convince/Convince Crowd when opposing the player. GM still chooses consequence, names NPC and records any relationship manually. Standard condition/twist failed outcome kept compatible. |
| C3 — Starting relationships | DH 36–37 | Existing limit 3 of 4, friend/loner choice, Magician mentor, orphan keepsake and self-made money retain historical behavior. Apparent **Loner Magician vs mentor obligation** conflict is deliberately **NOT** auto-resolved without GM decision. |
| S1 — Might goals depend on CURRENT Might | DH 64 | Capture target <= character Might; Kill <= Might+1; Drive Off <= Might+2 (clamped to scale max 8). Existing historical fixed 3/4/5 applies only to unmodified starting Might 3. `scales.playerMightGoalPlan` adds `actorMight` (defaults to 3 for compatibility). |
| S2 — Highest team scale | SG 62 | Before kill/capture/drive-off and social conflict outcomes, compare **highest** Might/Precedence value on each side. New `scales.groupScaleComparisonPlan` accepts caller-supplied lists and previews max/difference, without effect application. |
| S3 — Existing Precedence goals | DH 62–63 | Convince target <= actor Precedence; Haggle <= actor+1; Convince Crowd <= actor+2; Trick/Riddle any. Existing adapter retains test plans; no automatic adjustment of unlisted NPC social ranks or non-CORE conflict types. |
| K1 — Human Will/Health minimum | DH 26–27 | Magician, Theurge and Warrior must allocate 8 points with **each ability at least 2 and at most 6**. Previous planner permitted invalid 1/7 or 0/8. `creation.classStockPlan` now rejects those. |
| K2 — Full source available vs mapped mechanics | DH 148–159, 183 and 209 onward | Earlier metadata incorrectly claimed gear, spell and invocation source text unavailable. The rulebook source **is** accessible but complete automated effects and visual tables remain **unmapped**; no auto-grants. |

## API and QA
- `game.realmGuard.core.m10d.circles.factorPlan` — new pure obstacle preview.
- `game.realmGuard.core.m10d.scales.groupScaleComparisonPlan` — new pure team maximum comparison.
- Existing `circles.testOutcomePlan`, `scales.playerMightGoalPlan`, `creation.classStockPlan` fixed without changing legacy live rules.
- Automated smoke: `qa/m10d-tb2e-p35-circles-scales-creation-smoke.mjs` plus all historical tests.
- Manual Foundry Gates A–D: `TEST_PROTOCOL_v1.13.0-qa.29.md` (pending after QA release).

**Do not mark Circles, Scales or Character Creation FULLY_REAUDITED.** Complete NPC factor applicability, combat/story exceptions, full recruitment and gear/spell/relic mapping, manual QA and all historical 14-domain reviews remain separate. Full domain count **0/14**. Stable v1.12.0 unaffected; M11 PAUSED, global kill switch ENGAGED, Legacy Mixed sole live authority, no actor/item/journal/settings writes or roll execution.
