# M10D.18 P3 — Full CORE Re-Audit Ledger

**Status:** IN PROGRESS. First candidate P3.1: `v1.13.0-qa.25`. This ledger is a source trace and backlog, **not** a blanket audit certificate.

## Safety invariants
- Stable release `v1.12.0` unchanged; publish only through protected QA channel.
- Global kill switch ENGAGED. M11 PAUSED. Legacy Mixed sole live rules authority.
- Torchbearer 2E profile not selectable/live. All audits/shadow planners zero Actor, Item, Journal and Settings writes.
- A completed *source mapping* is not equivalent to *adapter parity*. Re-audit requires rule-by-rule checks, edge cases, representative read-only smokes and manual Foundry QA; no activation implied.

## Source authority
- CORE: Dungeoneer's Handbook (DH, 256 PDF pages), Scholar's Guide (SG, 320 PDF pages).
- OPTIONAL, not mixed into core by default: Lore Master's Manual, Scavenger's Supplement.
- Historical M10D.16 source matrix was based on Quick Rules and Character Creation Guides; M10D.17 source expansion unlocks the full two-book core. Legacy source statuses need not be rewritten until their corresponding complete domain audits pass.

## Four NEW adapters — already user-verified in Foundry
- Traits P2.1, Armor P2.2, Conflict P2.3, Magic P2.4: Full PASS on QA versions 1.13.0-qa.21 through qa.24. Live application OFF. Per-spell Magic catalogue and GM narrative exceptions remain outside live automation.

## Existing 14 domains — audit ledger
| # | Domain | CORE evidence | P3 review state | Next acceptance requirement |
|---|---|---|---|---|
| 1 | Tests | SG 26–35; DH 58–75 | **P3.1 targeted fixes in QA candidate** | Verify Factors, Versus -1s, tie breakers and advancement; full skill factors source mapping remains |
| 2 | Help | SG 36–38; DH skill entries | **P3.1 targeted fix in QA candidate** | Verify rating-zero injury/sick helper restrictions, special cases, full suggested Help skill mapping |
| 3 | Wises | DH 76–78; SG 87–88 | **P3.1 source spot-check only** | Deep review Wise effects, reroll timing, synergy / multi-wise limits; no adapter change yet |
| 4 | Nature | DH 65–71 | OPEN | Full channel/tax/recovery/advancement/retirement parity and exceptional abilities |
| 5 | Abilities / Skills | DH 58–75, 160–176 | OPEN | Full factors and per-skill suggested Help, tools, Learning |
| 6 | Resources / Fate / Persona | DH 59–64; SG 83–89, 97–125 | OPEN | Currency/resource tests, spending, awards, timing/tie edges |
| 7 | Conditions | SG 39–57 | OPEN | All condition effects, disposition, recovery order, conflicts and death risk |
| 8 | Recovery | SG 46–57, 90–125 | OPEN | Camp/Town/phase recovery & healer sequencing, failure and exception boundaries |
| 9 | Inventory | DH 83–88, 148–159 | OPEN | Slots, gear, encumbrance, weapons, containers, breakage |
| 10 | Advancement | DH 108–131 | OPEN | Test marks, BL/Nature, pass/fail and leveling/benefit boundaries |
| 11 | Session | SG 22–25, 39–45, 90–130 | OPEN | Prologue/Grind/Camp/Town and checks, events & lifestyle |
| 12 | Circles | DH 36–37, 61–64 | OPEN | Enmity, relations, factors, reputation & outcomes |
| 13 | Scales | DH 11–12, 58–64; SG 58–82 | OPEN | Might/Precedence and conflict/social applicability |
| 14 | Creation | DH 25–47 | OPEN | Recruitment steps, starting gear/relics/spells, P1 zero-skill corrections |

**Domain FULL PASS count: 0/14.** P3.1 consists of *targeted* findings and tests. No existing domain can be marked FULLY_REAUDITED on this patch alone. The foundation's `existingShadowReauditRequired` stays **true**.

## P3.1 — Confirmed source-backed findings / decisions

1. **TEST_FACTORS_REFERENCE_STALE** (SG 27): The earlier Tests status `UNAVAILABLE_DG160` is outdated with complete CORE PDFs now available. A new `factorObstaclePlan` computes a GM-selected source factor with additive categories, rejecting two unrelated primary categories instead of silently summing incompatible factor lists. Still no automatic DH per-skill factor catalogue.
2. **VERSUS_FACTORS_INCORRECT_BOUNDARY** (SG 32): Situational factors on a Versus test cause **-1s**, rather than +1 Ob. New `versusFactorPlan` keeps opponent Ob unchanged.
3. **TIEBREAKER_SOURCE_BOUNDARY_STALE** (SG 32–34): Source prescribes a second Versus test **without help**; skill uses its corresponding Will/Health BL ability, Will/Health use Nature, Nature uses chosen Will/Health, monsters use Nature. The original tied roll earns no advancement if a tiebreaker is chosen. The second tie fails for the player unless broken in their favor. New `tieBreakerPlan` describes this without rolling or writing.
4. **ZERO_RATED_HELP_NOT_BLOCKED** (SG 37): An Ability/Skill reduced to rating 0 from injury or sickness cannot provide Help. Old generic Help, Beginner's Luck Help, and Conflict Help planners now accept explicit rating-zero metadata and block when present; no Actor inspection.
5. **WISES_SPOTCHECK** (DH 76–78; SG 87–88): Existing I Am Wise aid (not ordinary Help), one effect per Wise per test, Of Course before Luck and Deeper before Luck are supported. Full Wise domain remains OPEN pending more extensive edge-case audit.

## P3.1 delivery / manual Foundry QA
- APIs: `game.realmGuard.core.m10d.tests.factorObstaclePlan`, `versusFactorPlan`, `tieBreakerPlan` plus existing Help plans with explicit `sourceRatingZeroDueToInjuryOrSickness` / `helperRatingZeroDueToInjuryOrSickness`.
- Automated smoke: `qa/m10d-tb2e-p31-tests-help-smoke.mjs`, plus all historical QA tests.
- Foundry gates: `TEST_PROTOCOL_v1.13.0-qa.25.md`. Hold P3.1 at QA PENDING until user confirms Gates A–D.
- Next: domain batches through remaining 14, keeping the entire list OPEN until complete evidence/edge-case QA for each. M11 remains paused until all gates are separately approved.
