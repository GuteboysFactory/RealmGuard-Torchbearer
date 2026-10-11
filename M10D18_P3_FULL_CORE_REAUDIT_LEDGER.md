# M10D.18 P3 — Full CORE Re-Audit Ledger

**Status:** IN PROGRESS. P3.1 `v1.13.0-qa.25` Foundry VERIFIED/CLOSED; P3.2 `v1.13.0-qa.26` user-verified; P3.3 `v1.13.0-qa.27` Foundry Gates A-D user-verified; P3.4 `v1.13.0-qa.28` Foundry Gates A-D user-verified; P3.5 candidate `v1.13.0-qa.29`. This ledger is a source trace and backlog, **not** a blanket audit certificate.

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
| 1 | Tests | SG 26–35; DH 58–75 | **P3.1 targeted fixes Foundry VERIFIED** | Verify Factors, Versus -1s, tie breakers and advancement; full skill factors source mapping remains |
| 2 | Help | SG 36–38; DH skill entries | **P3.1 targeted fix Foundry VERIFIED** | Verify rating-zero injury/sick helper restrictions, special cases, full suggested Help skill mapping |
| 3 | Wises | DH 76–78; SG 87–88 | **P3.2 targeted Wise fixes user-verified** | Deep review Wise effects, reroll timing, synergy / multi-wise limits; no adapter change yet |
| 4 | Nature | DH 65–71; SG 25 | **P3.2 targeted source fixes user-verified** | Full channel/tax/recovery/advancement/retirement parity and exceptional abilities |
| 5 | Abilities / Skills | DH 58–75, 160–176 | **P3.2 targeted source fixes in QA** | Full factors and per-skill suggested Help, tools, Learning |
| 6 | Resources / Fate / Persona | DH 59–64; SG 83–89, 97–125 | **P3.3 targeted source fixes user-verified** | Currency/resource tests, spending, awards, timing/tie edges |
| 7 | Conditions | SG 39–57 | **P3.3 targeted source fixes user-verified** | All condition effects, disposition, recovery order, conflicts and death risk |
| 8 | Recovery | SG 46–57, 90–125 | **P3.3 targeted source fixes user-verified** | Camp/Town/phase recovery & healer sequencing, failure and exception boundaries |
| 9 | Inventory | DH 83–88, 148–159 | **P3.4 targeted source fixes user-verified** | Slots, gear, encumbrance, weapons, containers, breakage |
| 10 | Advancement | DH 108–131 | **P3.4 targeted source fixes user-verified** | Test marks, BL/Nature, pass/fail and leveling/benefit boundaries |
| 11 | Session | SG 22–25, 39–45, 90–130 | **P3.4 targeted source fixes user-verified** | Prologue/Grind/Camp/Town and checks, events & lifestyle |
| 12 | Circles | DH 36–37, 61–64 | **P3.5 targeted source fixes in QA** | Enmity, relations, factors, reputation & outcomes |
| 13 | Scales | DH 11–12, 58–64; SG 58–82 | **P3.5 targeted source fixes in QA** | Might/Precedence and conflict/social applicability |
| 14 | Creation | DH 25–47 | **P3.5 targeted source fixes in QA** | Recruitment steps, starting gear/relics/spells, P1 zero-skill corrections |

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
- Foundry gates: `TEST_PROTOCOL_v1.13.0-qa.25.md`. User confirmed Gates A–D PASS, P3.1 VERIFIED/CLOSED.
- Next: domain batches through remaining 14, keeping the entire list OPEN until complete evidence/edge-case QA for each. M11 remains paused until all gates are separately approved.

## P3.2 — Source-backed targeted findings / decisions (candidate v1.13.0-qa.26)

1. **WISE_COMBINATION_ENFORCEMENT** (DH 76-77): Up to four Wises, each Wise once per test and each effect once; multiple different effects allowed when fictionally relevant. A new `wises.combinationPlan` validates caller-supplied Wise identities/effects; no automatic inference from actors.
2. **WISE_AID_HELP_COLLISION** (DH 77): I Am Wise aid is not ordinary Help and cannot be combined by the same character on the same test. Explicit flags on `wises.aidPlan` and `combinationPlan` block this.
3. **WISE_REROLL_TIMING** (DH 77; SG 87-88): Of Course / Deeper Understanding must be used before Fate Luck rerolls. Historical `OF_COURSE_BEFORE_DEEPER_IF_BOTH` was not an explicitly established order in sources and is replaced with source-grounded `WISE_REROLLS_BEFORE_FATE_LUCK`.
4. **WISE_CYCLE_TIMING** (DH 78): Completion perk becomes available on completing the four tracked uses. New Wises remain subject to Respite rules; no actual Wise changes are committed.
5. **NATURE_ALTERNATE_DESCRIPTORS** (DH 65): Source allows Dwarf Negotiating, Elf Enchanting and Halfling Hoarding alternatives; model now includes these without assuming a choice for an Actor.
6. **NATURE_MISSED_SESSION_PRIORITY** (SG 25; DH 69): On returning after a missed session, alleviating an existing condition precedes restoring taxed Nature. Recovery preview now requires `noConditions`; earlier general DH summary lacked this eligibility requirement.
7. **NATURE_RETIREMENT_BOUNDARIES** (DH 68-70): Lower retirement at **end of adventure** if maximum becomes 0, including on voluntary conservation; upper retirement check at end of session **if Nature remains 7**. Still manual only.
8. **SKILL_SOURCE_BOUNDARY_STALE** (DH 160-176): Full skill factor/source list is available, not absent; adapter still does **not** provide a complete mapped factor catalogue. Honest metadata now distinguishes SOURCE_AVAILABLE from CATALOGUE_IMPLEMENTED.
9. **SKILL_EQUIPMENT_TOOL_RULES** (DH 73-75): Source limits use to one tool set, one supply increment and one gear item; absent/inadequate tools yield +1 Ob. New `abilities.equipmentPlan` handles GM-supplied inventory facts and the Dwarven Crafting Nature exception without writes/rolling.
10. **SKILL_CAPACITY** (DH 72,75): At 24 known Skills, learning a 25th requires forgetting an existing one. New Skill learning plan reports `requiresForgetExistingSkill` without mutation.

### P3.2 scope / release gates
- Files: `module/m10d-tb2e-wises-p32-shadow.mjs`, `module/m10d-tb2e-skills-equipment-p32-shadow.mjs`, original Wise/Nature/Abilities metadata/plan refinements and CORE registration.
- Automated source regression: `qa/m10d-tb2e-p32-wises-nature-skills-smoke.mjs` plus historical test suite.
- Manual Foundry Gate A (safety), B (Wises), C (Nature + Abilities/Skills), D (regression/reload) documented in `TEST_PROTOCOL_v1.13.0-qa.26.md`.
- **FULL DOMAIN REAUDIT remains OPEN for Wises, Nature and Abilities.** Partial source repairs are not complete mapping of all rules, exceptions or 33 skill descriptions. Domain FULL PASS remains **0/14**. M11 cannot resume on this release.

## P3.3 — Resources / Conditions / Recovery

Candidate: `v1.13.0-qa.27`; user confirmation pending. Source findings and evidence: `M10D18_P33_SOURCE_FINDINGS.md`. The three domains remain OPEN. Domain FULL PASS remains **0/14**. M11 PAUSED, global kill switch ENGAGED, Legacy Mixed live; no writes.

## P3.4 — Inventory, Advancement and Session (candidate 1.13.0-qa.28)

See `M10D18_P34_SOURCE_FINDINGS.md` for exact DH/SG citations and test status. This is a **targeted** three-domain source correction, not complete source-to-implementation parity. All three domains remain OPEN for full re-audit. **FULL PASS = 0/14** until independent complete source mapping, regression, and Foundry acceptance. Global kill switch ENGAGED; M11 PAUSED; Legacy Mixed sole live authority. Stable v1.12.0 frozen.

## P3.5 — Circles / Scales / Character Creation (candidate 1.13.0-qa.29)

Detailed primary rulebook mapping and source-bounded fixes: `M10D18_P35_SOURCE_FINDINGS.md`. These are targeted validations, not FULL domain closure; all 14 historical domains remain OPEN for exhaustive source parity, including the three P3.5 subjects. **FULL PASS = 0/14**. Legacy Mixed live, M11 PAUSED, global kill switch ENGAGED, Stable v1.12.0 unchanged.


## Package A integrated five-domain re-audit (WIP, separate Draft PR #14)

**Current source checkpoint:** 2026-10-11; based on `v1.13.0-qa.29`, not a public QA candidate. Original five domain statuses remain OPEN: **0/14 FULLY REAUDITED**.

| Domain | Evidence added to Package A draft | Blocking full domain closure |
|---|---|---|
| Tests | Existing SG 26–35 factor/versus/tie planners, cross-domain smoke added | All DH 160–176 factor value tables and complete timing/advancement interactions |
| Help | SG 37 BL matching trained Skill / assigned Will-Health, 33 DH-listed suggested Help mappings, explicit GM alternate, SG 38 Hungry/Thirsty preview | Full consent, conditions, helper consequence and conflict/edge flow end-to-end |
| Wises | DH 76–78 combined Wise effects and SG 87–88 timing regression integrated | Per-die reroll provenance, life-cycle progression, custom/edge Wise cases |
| Nature | DH 68 retired 0/0 guard, DH 69 maximum-drop erases Nature marks, previous P3.2 retirement and taxed Nature plans | All stock/class exception fiction, nature and advancement end-to-end |
| Abilities/Skills | DH 72 Heroic Skill cap 7 explicit unlock, 33 Skill BL and suggested Help catalogue, factor group metadata | Numeric skill factor catalogue, per-skill exceptions and heroic TN progression end-to-end |

CI is executed in **read-only PR workflow**, not release pipeline. Stable v1.12.0 and QA channels are immutable in branch; TB2E remains shadow/read-only; Legacy Mixed stays live; kill switch ENGAGED; M11 PAUSED.

Evidence and proposed one-shot Foundry test: `M10D18_PACKAGE_A_WORKING_AUDIT.md`, `TEST_PROTOCOL_M10D18_PACKAGE_A_DRAFT.md` and the three new Package A smoke suites. No release until complete review and verified protected pipeline.
