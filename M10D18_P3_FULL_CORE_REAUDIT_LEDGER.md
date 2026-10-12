# M10D.18 P3 — Full CORE Re-Audit Ledger

**Current Package A completion plan:** [five-gate closure checklist](M10D18_PACKAGE_A_WORKING_AUDIT.md#current-closure-checklist--2026-10-12). Historical NEXT/checkpoint sections below preserve earlier evidence; use the current list to avoid opening unrelated incremental packages. G1 integrated final outcome, G2 five-domain source/model closure, G3 historical provenance contract/data, G4 unpublished-candidate Foundry A-D, G5 final safety/release decision remain OPEN. Current automated baseline: 152/152, ZIP21/21; manual acceptance NOT RUN; 0/14 domain certificates.

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


### 2026-10-12 Package A source reconciliation checkpoint (Draft, not released)

- **Tests** — SG 32-34: added read-only GM-confirmed clear/dim/darkness and situational factors with independent +Ob versus Versus -1s. SG 33 tiebreakers cannot accept Help. DH 59,72: explicitly unlocked heroic TN 3 changes success faces for Will/Health/Skill read-only resolutions.
- **Help** — SG 36-38: acting player's acceptance and fictionally meaningful assistance are verified before a Help participation preview. Similar Instinct vs any Instinct is distinguished. Failed test helper effects include group Twists, selected lesser Conditions, Hungry & Thirsty exception, and condition-exempt (but twist-vulnerable) Wise aid.
- **Wises** — DH 78 language retention/communication preview and existing reroll/usage checks remain subject to full per-die provenance and lifecycle audit.
- **Nature** — DH 68 zero-tax loss handling and DH 69 maximum Nature reduction advancement reset are protected by shadow guards. Full Nature stock edge coverage is still open.
- **Abilities/Skills** — DH 59,72 heroic Will/Health/Skill rating 7 with explicit unlock. Mapping for all 33 Skill names/suggested Help routes is present; numeric factor tables remain unmapped.
- CI: all-suite PR smoke and channel immutability check, **not** protected release pipeline. No release candidate or manual Foundry gate authorized by this checkpoint.
- **FULLY_REAUDITED remains 0/14.** None of the five Package A domains has earned complete certification. Stable 1.12.0 untouched, Legacy Mixed sole live authority, TB2E shadow/read-only, M11 paused, kill switch engaged.


## Package A 2026-10-12 — DH numeric Skill factors checkpoint

The separate source catalogue `module/m10d18-tb2e-package-a-factor-values.mjs` now contains structured numeric factor choices for all **33 Skills** from DH pp.160–176, including source-page provenance for split-page tables. Specialized entries use explicit Formula, Versus and Deferred rule classifications; no numeric Ob is fabricated when a spell, invocation, separate monster roll or missing context supplies the obstacle. `tests.sourceBoundFactorPlan` is read-only, validates factor combination and selected source-backed values, and enforces explicit GM provenance checks for known Scholar/Weaver/Sailor/Mentor/Rider special cases. Advanced Nature stock descriptors (DH pp.65,70–71) also have targeted read-only validation.

**This is full numerical cataloguing, NOT complete runtime or exhaustive exception-rule parity.** Tests/Help/Wises/Nature/Abilities & Skills remain OPEN. Other resource, spell, equipment, actor identity and conflict interactions remain GM-controlled/manual. Manual Foundry 13.351 acceptance is still pending. **0/14 FULLY REAUDITED** remains the only honest domain certification. Legacy Mixed sole live; TB2E CORE read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 frozen.


### 2026-10-12 — Source correction to historical P3.2 Wise timing and Scholar Scribe

**Corrected against SG p.87 and DH p.77:** Both **Of Course!** and **Deeper Understanding** must precede Fate Luck. The Deeper effect separately forbids re-rolling the same die twice. An earlier checkpoint wrongly interpreted SG p.87 as applying only to Of Course!; it is superseded. All count-based and per-die read-only Wise planners now enforce this source-specific timing. The per-die planner checks individual die identities; no live-roll sequence is modified.

DH p.172 Scholar Scribe: a multi-spell obstacle is the spell-specific *scribing Ob* of the highest-circle spell **plus 1 per additional spell**. It is **not** numerically equivalent to spell circle. The dynamic catalogue now rejects missing source-supplied scribing Ob.

These corrections are source-reviewed and regression-tested in the Draft Package A branch; five-domain full parity and manual Foundry acceptance remain OPEN, 0/14 FULLY_REAUDITED. Stable v1.12.0 frozen; no profile activation.


### 2026-10-12 — Package A cross-domain source review and input safety

Historical P3.1–P3.5 targeted checks, the 33-skill/64-table catalogue, and 53 Help routes are retained. The new `tests.sourceBoundFactorPlan` guard prevents additive category undercount and nested provenance from changing the declared source Skill or table. The new `tests.scenarioPlan` preview composes source Ob, light, tools, Help, Wise aid and Beginner's Luck according to printed DH 59,73–77 and SG 27,32–38 using explicit GM-supplied facts. It records the printed factor page and identifies itself as **not Actor-authoritative**.

Tests, Help, Wises, Nature and Abilities/Skills remain **OPEN** pending complete actor-to-source rule parity, original per-roll data provenance, all cross-domain exceptions and a combined Foundry 13.351 acceptance. **0/14 FULLY REAUDITED**. Kill switch ENGAGED, M11 PAUSED, Legacy Mixed live, stable 1.12.0 immutable. No QA release authorized by this milestone.


### 2026-10-12 — Paket A Conditions–Tests–Help–Wise–Nature cross-domain checkpoint

Added a read-only, explicitly GM-asserted participant/Condition gate to `tests.scenarioPlan` (*Scholar's Guide* pp.46–52; *Dungeoneer's Handbook* p.59). The preview blocks Afraid Beginner's Luck / ordinary Help, Angry beneficial Traits / Wise aid, Dead participation, and unreconciled or missing actor/helper condition data. It applies Fresh at the correct post-halving stage, stacks Sick and Injured dice penalties, requires an explicit Angry precision/social Ob choice and spent turn for exhausted Instinct, and previews GM-reviewed channeled Nature and possible Tax without writing resources. Same Actor ID cannot act and Help itself.

**Not a full Conditions audit certificate:** all input facts remain caller-declared, not authenticated from real Actors, and advanced lifecycle effects are not applied. Full five-domain source-to-runtime and Foundry v13.351 acceptance remain OPEN. **0/14 FULLY REAUDITED**; stable 1.12.0 frozen, Legacy Mixed sole live authority, M11 PAUSED, kill switch ENGAGED.


### 2026-10-12 — Source-linked advancement boundary, still read-only

Trained Skill advancement marks, untrained Beginner's Luck learning attempts based on Maximum Nature, the 24-Skill capacity decision and loss of ability advancement from BL are previewed separately (DH p.75). Sick prevents the proposed log (SG p.51); original ties resolved through a tiebreaker do not mark the initial Skill (SG p.34). Rating zero from conditions prevents an ordinary test despite available bonus dice (SG p.52). No Actual Actor/roll/GM authority has yet been bound; therefore Tests, Abilities/Skills, Nature and cross-domain advancement remain OPEN. FULLY_REAUDITED **0/14**.


### 2026-10-12 — Independent outcome and advancement integrity checkpoint

The GM-supplied source-factor + equipment + condition + Help/Wise + Beginner's Luck test preview is now linked to an externally supplied **plain, non-rerolled** D6 result list in `tests.outcomeAndProgressPlan`. The guard validates exact pool/dice count, D6 faces, fixed Obstacle resolution and derived PASS/FAIL before any read-only proposed Skill or untrained BL learning mark. Post-test metadata cannot change Skill identity, Ob, conditions or outcome. Source: SG pp.31–35,46–52; DH pp.59,75.

No live-roll execution, no proof of real roll provenance and no writes. Real Actor and GM authorization, Fate/Persona/Wise reroll event history and complete Domain A exception coverage remain OPEN. FULLY_REAUDITED **0/14**; stable v1.12.0 frozen, Legacy Mixed sole live authority, M11 paused, kill switch engaged.


## 2026-10-12 — Fate/Wise event chronology and Helper Synergy source correction

Original references: DH pp.76–78, SG pp.87–88. **Corrected** both Deeper Understanding and Of Course to precede Fate Luck; SG p.87 explicitly requires Deeper-before-Luck, while DH p.77 additionally forbids rerolling an already-rerolled die. Old statements permitting Deeper after Luck are superseded.

`module/m10d18-tb2e-package-a-rewarded-roll-history.mjs` now previews one GM-asserted test with uniquely identified base dice, per-die Wise rerolls (related Wise, at most one per effect/wise) and a Fate Luck event holding recursive rounds with explicit parent-six associations. Every six must produce exactly one follow-up die; new sixes continue until exhausted. Unrelated/duplicated Wise effects, late Wise actions, incomplete 6-chains, fake parent die IDs, repeated new IDs and insufficient declared Fate/Persona balances fail closed. The preview sums *potential* resource cost without spending resources, and derives an uncommitted outcome and optional advancement from the enriched results. No Foundry roll log, actor/GM credentials or resource balance is authenticated.

`module/m10d18-tb2e-package-a-synergy.mjs` separately implements SG p.87 Helper Fate Synergy as a read-only advancement proposal: helper must have accepted eligible ordinary Help, declared Fate pre-roll, and a verified helping Skill/Ability. The Helper marks their own helping source on PASS/FAIL; on an initial tie ending in tiebreaker, either retract Fate/no mark or keep Fate and mark the tiebreaker source without giving Help on that roll. Sick and Afraid/Dead conditions remain in force. No reward or advancement is committed.

New regression suites: `qa/m10d18-package-a-reward-history-smoke.mjs` and `qa/m10d18-package-a-synergy-smoke.mjs`.

**Limitations:** all dice and event histories are GM asserted, not read from immutable Foundry roll records; the code must not be treated as actual runtime authority. External reward provenance, per-Actor Fate/Persona state, token ownership, all bonus interactions and complete end-to-end Foundry QA remain blockers. 0/14 FULLY REAUDITED; Kill Switch engaged; M11 paused; stable v1.12.0 untouched.


### 2026-10-12 — SG88 Persona double-count guard

Independent Package A read-only planners now share source-backed Persona accounting: a maximum three pre-roll Advantage dice, one pre-roll point for Nature Channel, plus post-roll Of Course. The reward-timeline preview compares the combined cost against one GM-stated balance at the *beginning* of the test; the plain-D6 outcome preview requires an explicit sufficient starting balance before allowing an outcome based on Persona bonus dice. Duplicate Wise IDs with whitespace/case aliases are rejected. The code makes **no** real resources available, spends none and authenticates no Actor/GM identity. Full source and live proof remain OPEN; 0/14 FULLY REAUDITED.


Nature Channel's claimed Persona balance must now agree with the same GM-declared starting balance used by post-roll Wise rewards (`NATURE_PERSONA_BALANCE_MISMATCH` if it differs). No Foundry Actor or ledger is consulted.

## 2026-10-12 — Package A current-document provenance boundary (Draft; no release)

Source re-read: uploaded DH printed pp.59,77 and SG pp.31,47,51,87-88. SG31 ties the base pool to the acting Skill; SG46-52 conditions require current character facts; SG87-88 Wise/Fate/Persona rules require chronological, roll-time resources. Current holdings cannot certify an earlier expenditure. Foundry v13 API basis: https://foundryvtt.com/api/v13/classes/foundry.documents.ChatMessage.html and https://foundryvtt.com/api/v13/classes/foundry.dice.Roll.html.

New public shadow APIs `tests.documentEvidence({actorId,messageId})` and `tests.documentOutcomePlan({actorId,messageId,scenarioInput})` resolve IDs from the ready Realm Guard session. Current active GM identity is checked against `game.users` before reading Actor/messages. Caller GM/Actor/Roll objects and message flags do not supply authority. Only a world character with the exact speaker Actor object, visible message content and currently authorized message author (GM or Actor OWNER) is accepted. Token/scene/synthetic Actors, unavailable documents and unknown active conditions fail closed. Legacy Tired/Strained are not silently converted to CORE conditions.

The dice evidence is detached, frozen and namespaced by message/roll/term/result index. Only one evaluated native plain Nd6 term (1-250 dice), no modifiers, all results active, no rerolled/discarded/exploded results and a matching raw total is accepted. This reads stored results; it never calls evaluate, creates a message, sends a socket request or changes documents/settings/resources. Missing/incomplete Wise/Fate histories and multi-roll messages are rejected rather than inferred from chat HTML or flags.

The outcome bridge compares the GM-reviewed scenario's acting ID, uniquely named role rating and complete active condition names to current Actor data, then feeds saved D6 faces into the existing obstacle planner. Scope: ordinary non-Heroic Skill test, no helper/Wise aid, no paid/extra bonus dice, no Nature channel and no advancement request. Equipment, factors, environment and narrative eligibility remain GM assertions. An Actor/message match does NOT certify the scenario or Actor state at roll time. Current Fate/Persona are observation only and are never substituted as test-start balances.

Evidence fields explicitly separate `currentSessionGmObserved`, `actorDocumentObserved`, `messageDocumentObserved` and `currentActorScenarioMatched` from false `gmPermissionAuthenticated`, `actorSourceAuthenticated`, `rollSourceAuthenticated`, `rollTimeActorStateVerified` and `historicalRewardBalanceVerified`. Client documents are mutable, not immutable records or server attestations. Current message-author permission is not permission at the original roll time. No new live authority is granted.

Regression: `qa/m10d18-package-a-document-provenance-smoke.mjs` covers native plain dice → obstacle result, identity/visibility/ownership failures, tokens/speaker mismatch, unknown conditions, altered rating/conditions, modified dice, bad totals, unsupported scopes, detached snapshots and zero-write/RNG sentinels. Full local/CI verification is recorded in the subsequent verification checkpoint.

Remaining gaps: historical Actor snapshots and reward spends; immutable/server-verifiable roll-event provenance; actual Legacy chat records that may contain only HTML faces or separate Fate Rolls; Wise ownership and chronological rerolls; helper/BL/Heroic/token routes; source-complete cross-domain parity; consolidated Foundry v13.351 multiplayer execution. Runtime integration is implemented but NOT Foundry-verified. 0/14 FULLY_REAUDITED. Legacy Mixed sole live authority; CORE shadow/read-only; kill switch ENGAGED; M11 PAUSED. Stable v1.12.0 and published QA v1.13.0-qa.29 untouched.

### GitHub CI verified — source commit 59831c341a805fa9ca1cb459e760707784512965

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38282096333 completed SUCCESS. Job logs explicitly confirm **148/148 smoke suites PASS**, parse/safety preflight PASS, unpublished ZIP integrity/manifest equality and **21/21 manifest dependencies PASS**, frozen QA/stable/manifest guard PASS. Local ZIP checks independently passed. No release actions ran.

Confirmed compatibility finding from `module/documents.mjs`: Legacy ChatMessage creation stores rendered `content` without native `rolls`. These existing HTML-only cards are outside the evidence adapter's accepted scope; reconstructing dice or Wise/Fate chronology from their HTML is not permitted. The new native-message bridge is implemented and mock-tested, not certified compatible with all live Legacy cards.

Audit documents and the consolidated Foundry v13.351 protocol are updated. Manual A-D execution, historical resources/Actor provenance, complete Wise/Fate event lineage and remaining full CORE domain exceptions are still OPEN. **0/14 FULLY_REAUDITED**, Draft PR #14, no merge/release, unchanged stable v1.12.0 and published QA v1.13.0-qa.29; Legacy Mixed sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED.

## 2026-10-12 — Package A saved-message Wise/Fate bridge and Angry correction (Draft)

Re-read uploaded Scholar's Guide printed p.47 and pp.87-88, Dungeoneer's Handbook p.77. Confirmed bug: `rewardedRollHistoryPlan` allowed Deeper Understanding / Of Course for an Angry actor. SG47 forbids beneficial Wise effects; both now reject `ANGRY_BLOCKS_WISE_REWARDS`. Ordinary Fate Luck remains permitted by this condition boundary. No Legacy live behavior changed.

New `tests.documentRewardHistoryPlan` reads initial and subsequent results from separate native plain-D6 session ChatMessages through the existing GM-only document reader. The initial reviewed Skill scenario must match the current Actor role/conditions and remains within the existing non-Heroic, no-helper/no-BL/no-Nature/no-extra-bonus bridge scope. Only GM-declared semantic links and historical start balances are inputs: caller dice/newFace/rerolls/roll objects, flags, result overrides and progression claims are not accepted.

Every event document must have the same world Actor and currently authorized author as the initial message, be visible/readable, be unique in this timeline and have a safe integer timestamp strictly later than the prior document. Missing/tied/reversed timestamps fail closed; this checks stored ordering only. Native results stay bounded, unmodified and detached. Deeper maps one newly read face to a named failed original die; Of Course maps read faces to the full failed-die set; Luck maps each read new die to one existing six, recursively. Existing source guards reject late Wise use, unknown/extra parents, missing explosion rounds, duplicate Wise/effects and insufficient asserted starting resources. Return evidence preserves each new-result-message ID and its GM-declared target/parent linkage.

Wise effects additionally resolve a real current `wise` Item ID on the acting Actor; missing items and repeated normalized Wise names are rejected. This verifies only CURRENT holdings. The topic being relevant, the documents belonging to the SAME actual test and the target/parent associations remain GM assertions. A manually fabricated or edited native ChatMessage is not server-attested randomness. Timestamp order cannot prove immutable execution order or event completeness.

Historical balances MUST be explicit `fateAtRollStartGmAsserted` / `personaAtRollStartGmAsserted`; current Actor Fate/Persona are never used as test-start funds. Tests demonstrate an Actor with current balances 0/0 and a separately declared historical 2 Fate/1 Persona yielding a valid preview, without claiming an authenticated spend. All authentication, historical Actor/resource and immutable chronology flags remain false; no advancement preview, RNG, sockets, writes, capture hooks, spend or live authority.

Regression evidence: new `qa/m10d18-package-a-document-reward-history-smoke.mjs` exercises the full saved base + Deeper + Of Course + recursive Luck chain (8 final successes), current Wise holdings, declared budgets, privacy/Actor/author failure, duplicate messages, equal/missing/reversed timestamps, forbidden face injection, rerolled native dice, incomplete or false parent-six chains, Angry rejection and detached snapshots. Existing reward-history suite adds source-specific Angry Wise / permitted Luck tests. Full regression and CI checkpoint follows.

OPEN: historical Actor/ownership and Wise snapshots; trustworthy starting balances and actual spend transactions; immutable/server-verified event history, actual same-test identity, event completeness, helper/BL/Heroic/token routes, Legacy HTML-only cards, full CORE exception parity and combined Foundry v13.351 A-D acceptance. No domain marked FULLY_REAUDITED (0/14). Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No release/merge.

### GitHub CI verified — saved-message Wise/Fate source commit cfab9483194f19c8d76a988518584857cf1d033a

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38284931885 completed SUCCESS. Logs explicitly confirm **149/149 smoke suites PASS**, saved-document reward chain regression PASS, syntax/safety preflight PASS, temporary unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest diff PASS. Local full regression and independent ZIP checks also PASS.

The Angry Wise guard is a verified source-bound correction; the new document timeline remains evidence read from mutable current session records and GM-declared associations, not authenticated or complete historical gameplay. Foundry v13.351 A-D acceptance NOT RUN. All remaining gaps above remain OPEN; 0/14 FULLY_REAUDITED, Legacy Mixed only live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No release/merge/tag/channel action.

## 2026-10-12 — Package A current Actor participation provenance (Draft)

Source re-read: uploaded Dungeoneer's Handbook printed pp.58-59 (Will/Health mapping and Beginner's Luck staging), p.77 (Wise aid separate from ordinary Help); Scholar's Guide pp.36-38 (fictional action/acceptance, same or suggested Skill, trained Skill before Will/Health when helping a beginner, no rating-0 Help) and pp.46-52 (Fresh, Afraid/Angry, Injured/Sick and zero-rated sources).

New `tests.actorEvidence({actorId})` checks the current active session GM BEFORE looking up a world character. It copies only current scalar Skill Item IDs/names/ratings, Wise Item IDs/names, Will/Health, active source-mapped conditions and current reward holdings. Unknown active Legacy conditions remain rejected. Returned evidence is frozen/detached; no flags/descriptions/live Document references, Item provisioning, RNG or writes. The existing saved-D6 document reader now uses this common Actor boundary, so the older outcome and Wise/Fate APIs retain their scope and safety guards.

New separate `tests.participationOutcomePlan({actorId,messageId,scenarioInput,helpSourceItemId,wiseAidItemId})` connects those current Actor facts to ONE saved plain native D6 message:
- Ordinary Skill requires a unique matching trained current Skill rating 1-6.
- Beginner's Luck requires the target Skill absent or uniquely present at rating 0 (including normal untrained default Skill records). The underlying Will/Health MUST be the DH-mapped Ability, match the Actor's current value and remain source-eligible under conditions. A learned Skill, duplicate/malformed Skill records and claimed wrong Ability/rating fail closed. No automatic Skill creation or learning.
- Ordinary Help is bound to the selected helper's actual Skill Item ID, matching name and trained rating; source-listed relevance/acceptance remain explicitly required by the existing planner. For BL, a helper with the trained target Skill must use it; otherwise the correct current Will/Health route is supported. Non-positive effective helping sources from stacked Sick/Injured are rejected before preview even if other bonuses might add dice. Nature/Instinct/other Ability helper routes remain outside this bridge.
- Wise aid is bound to an actual unique Wise Item on a distinct helper Actor, with separately checked current conditions; the same character cannot supply both ordinary Help and Wise aid. Angry/Dead Wise aid and Afraid/Dead ordinary Help are blocked by existing source guards. Wise fictional relatedness is not inferred from the Item name.
- Actor/helper/Wise-helper condition declarations must match observed complete current condition sets. The original source planner still requires reviewed conditions, described relevant action, explicit accepted Help and GM-approved relevance. Helpers/Wise aid enter the correct pre-halving BL stage; Fresh remains derived after halving. Stored dice count must match the complete resulting pool.

Returns current participant/source evidence and an uncommitted outcome only. Current documents do NOT authenticate earlier ownership or character state, actual player acceptance, same-test participation or server-generated randomness. `playerConsentAuthenticated`, `participationAtRollTimeVerified`, `actorSourceAuthenticated`, `rollSourceAuthenticated`, `gmPermissionAuthenticated`, `rollTimeActorStateVerified` and `historicalRewardBalanceVerified` remain false. No resource costs, advancement preview, spends or writes. Equipment, environment, factor selections and narrative eligibility remain reviewed GM assertions.

Regression: `qa/m10d18-package-a-participation-provenance-smoke.mjs` covers trained Skill with distinct ordinary Help/Wise aid; current Will and Health BL routes; default rating-0 and absent Skill; Fresh after halving; learned/duplicate/malformed Skill rejection; wrong/unowned/duplicate helper and Wise Items; declined Help; wrong Actor/condition source; zero-rated Skill and Ability helpers; Afraid/Angry rejection; unsupported spend/Instinct/Heroic inputs; player denial before Actor reads; detached snapshots and zero-write/RNG sentinels. Existing saved-document and Wise/Fate suites also re-run after the shared reader change.

OPEN: historical Actor/resource/ownership snapshots and actual consent/events, immutable same-test history, equipment-source provenance, reward/advancement linkage for participation, Nature/Instinct/conflict/series/tiebreaker/Heroic/token paths, Legacy HTML-only native Roll gap, complete CORE exception parity and consolidated Foundry v13.351 A-D acceptance. This is CURRENT participant evidence only, not a historical actor authority or full-domain certificate. 0/14 FULLY_REAUDITED; Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 untouched. No release/merge.

### GitHub CI verified — current participation source commit 201da6a4d69b63aa4ba28e8a35805477eebb8ea2

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38286617101 completed SUCCESS. Logs explicitly confirm **150/150 smoke suites PASS**, Actor-backed Skill/BL/Help/Wise-aid regression PASS, syntax/safety preflight PASS, temporary unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest diff PASS. Local full regression and independent ZIP checks also PASS.

Current participant source matching is implemented and automatically verified, not historical gameplay authentication. Actual acceptance/ownership at roll time, resource spend history, equipment and complete event/exception parity remain OPEN. Consolidated Foundry v13.351 A-D acceptance NOT RUN. **0/14 FULLY_REAUDITED**, Draft PR #14, Legacy Mixed sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No merge/release/tag/channel action.

## 2026-10-12 — Package A saved outcome / current counters / Helper Synergy (Draft)

Re-read uploaded DH pp.72,75,108-110 and SG pp.51,87. DH75 learns a Skill at rating2 after attempts equal to Maximum Nature, regardless of pass/fail, and never advances the acting BL Will/Health. DH108 requires Skill passes equal to current rating and failures equal to rating minus1; DH109 forbids pass/fail conversion and resets only after advancement. SG51 forbids logging or advancing while Sick. SG87 Synergy spends the HELPER's Fate before the roll and marks THEIR actual helping Skill/Ability, not the acting source.

`tests.actorEvidence` now additionally projects scalar current Skill P/F counters, configured Legacy thresholds, beginnerAttempts and Current/Maximum Nature. Missing/invalid numbers remain null; they are never silently defaulted to 0. Existing Actor/dice/participation scopes are unchanged.

New separate `tests.participationProgressPlan` first uses the verified current-participant/saved plain-D6 chain, then derives every mark from that SAME outcome and Obstacle. Callers cannot choose result, difficulty, source, counters, Maximum Nature, known-Skill count, tiebreaker outcome or progression mode through separate facts. Explicit GM review must confirm a legal independent Adventure test, historical eligibility and that the CURRENT counters exclude this test. Those reviews remain unverified assertions; the adapter does not claim an immutable historical/duplicate-log check.

- Trained Skill reads its current observed P/F counters and projects only the derived mark. Source thresholds use current raw rating, not temporary condition-reduced dice and not custom Legacy passNeeded/failNeeded; both source requirements and stored Legacy configuration are shown without rewriting either. Normal cap6 blocks rating7. There is no automatic rating increment or counter reset.
- BL progression requires an actual unique rating0 learning record with a valid beginnerAttempts counter; a missing Skill remains allowed for the TEST preview but is rejected for COUNTER progression, rather than inventing a starting0 record. It uses observed Maximum Nature, with coherent Current/Maximum state and the current unique trained role count. Ambiguous/malformed records and counts above the CORE24 capacity fail closed. At24, reaching the threshold shows the need to choose an old Skill to forget; nothing is deleted/learned. The count is explicitly current Realm Guard role-item evidence, not a certified TB profile conversion.
- Sick suppresses both proposed marks/BL attempts AND advancement readiness even when old P/F counts already met the threshold. No Skill, Ability or learning writes occur.
- Optional Synergy requires observed ORDINARY Help, a separately GM-asserted historical HELPER Fate balance and pre-roll commitment. It derives the helping source from current participant evidence and its mark from the actor's SAME pass/fail. A different helping Skill gets its own observed P/F arithmetic/threshold preview. Wise aid does not qualify for Synergy. Current helper Fate is never substituted as the start balance.
- Ability Help Synergy can propose the source-bound Will/Health mark, but the current data model does not store Will/Health P/F advancement counters. `helperAbilityCountersObserved:false`, null helper counter projection and unchanged acting BL Will/Health marks explicitly preserve this model gap. No Ability baseline or new model fields are invented.

Regression: new `qa/m10d18-package-a-participation-progress-smoke.mjs` covers saved PASS/FAIL derivation, actual counters, rejected overrides/history/context/counter gaps, repeat-preview non-mutation, normal cap6, Legacy threshold divergence, Sick suppression even with ready counters, different-Skill Helper Synergy, current helper Fate0 versus historical asserted1, missing/late Synergy declaration, BL Current2/Maximum4 threshold on PASS and FAIL, existing versus absent learning record, capacity24/25, Maximum Nature0 and missing state, Sick no-attempt, and Ability Synergy's explicit missing-counter boundary. No resources/documents/settings/rating/learning/advancement writes, RNG, sockets or capture hooks.

OPEN: actual historical counter eligibility, duplicate-test ledger, player consent/ownership/participation at roll time, actual starting balances/transactions, complete event/source provenance, equipment evidence, Ability P/F data-model support, reward-history/participation integration, Nature/Instinct/conflict/series/tiebreaker/Heroic/token exceptions, Legacy HTML-only Roll gap and combined Foundry v13.351 A-D execution. No advancement/learning/spend authorization. 0/14 FULLY_REAUDITED; Legacy Mixed sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED. Stable v1.12.0 / published QA v1.13.0-qa.29 unchanged; no merge/release.

### GitHub CI verified — saved participant outcome / current progress counters source commit 8631c7d6e8dc2c46f1ecef0fb284555b8286187e

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38288506035 completed SUCCESS. Logs explicitly confirm **151/151 smoke suites PASS**, saved-outcome/current Skill-BL counter/Helper Synergy regression PASS, syntax/safety preflight PASS, unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest guard PASS. Local full regression and independent ZIP checks also PASS.

Counter arithmetic and source-bound suppression/thresholds are automatically verified. Historical rule eligibility, duplicate-test exclusion, actual Helper Fate commitment/consent and immutable event provenance remain GM assertions. Will/Health Helper Synergy still has no observed P/F counter model. Complete CORE exceptions and combined Foundry v13.351 A-D acceptance remain OPEN / NOT RUN; **0/14 FULLY_REAUDITED**. Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No merge/release/tag/channel action.

## 2026-10-12 — Package A actual current equipment references (Draft)

Re-read uploaded DH pp.73-75: tools/supplies/gear are separate roles; trained basic tools depend on carrying an intact pack/satchel; missing/inadequate tools add Ob; untrained tools may be borrowed from a companion with the Skill; one supply increment and one ordinary gear use apply per test. SG31/36-38 and DH59 continue to govern the derived saved-D6 participant pool. Actual model: Gear stores quantity and inventory placement/container type but no reliable Skill-specific supply increment, damage, adequacy or loan-consent field.

Actor scalar evidence now includes Gear Item ID/name/current quantity and raw mode/location/container ID/type. Missing numeric/string data remains null. New separate `tests.equipmentOutcomePlan` wraps the SAME current-participant/saved plain-D6 outcome, requires explicit equipment role references and matches them to those current Actor Items:
- One uniquely referenced worn Torso pack/satchel with positive quantity; ambiguity/missing placement/reference fails closed. This is the supported CURRENT Realm Guard inventory placement scope, not proof that a physically hand-carried pack is absent in all fiction. Usability is explicitly GM asserted and must agree with the scenario carriesBackpackOrSatchel claim. A declared damaged/unusable pack does not grant basic tools.
- Selected Supply/Gear must be actual distinct Gear Items with positive safe-integer quantities, not caller-supplied holdings. They must be directly equipped in a recognized zone or directly inside the referenced usable worn pack/satchel. Missing/orphan/malformed/nested/custom-container paths are outside the bridge and reject. Pack, Supply and Gear cannot silently reuse one Actor Item for several roles. Zero-use categories require null references.
- Each Supply/Gear reference requires GM-reviewed Skill relatedness, physical usability and accessibility. Supplies additionally require an explicit assertion that one increment is available. The model's generic quantity is OBSERVED, not assumed to equal a Torchbearer supply increment; no decrement or historical consumption is inferred. Names/HTML/flags do not establish classification.
- Borrowed tools require a distinct real current lender Actor, unique trained matching Skill Item and its actual carried pack/satchel, plus explicit pack usability, access and lender-consent assertions. Missing/untrained lender, absent/empty pack, self-lending and contradictory borrowedTools declarations reject. Dwarf/Crafting Nature exceptions remain outside this narrow equipment bridge.

`historicalEquipmentVerified`, physicalConditionAuthenticated, equipmentRelevanceAuthenticated, supplyIncrementAuthenticated, lenderConsentAuthenticated and all Actor/roll/GM/player authentication flags stay false. Quantity/placement observations cannot certify those conditions at the recorded roll time. Inventory slot capacity/encumbrance and complete equipment-rule parity remain explicitly unverified. No supplies consumed, quantity decrements planned, inventory moves, tools created, Item/Actor/Settings writes, RNG, sockets, advances or spends. Other existing GM-asserted planners retain their earlier scope.

Regression: `qa/m10d18-package-a-equipment-provenance-smoke.mjs` covers current trained Cook pack + Supply + Gear → six saved D6; actual quantity and direct pack path; repeated detached non-consumption; wrong Skill/category review, injected quantity, inaccessible/empty/missing/duplicate Item, ambiguous/unequipped pack, orphan/malformed path, same Item used twice, unsupported crafting, unusable pack penalty, BL tools borrowed from a real trained lender, declined/untrained/empty/self lender, omitted/unused loan or Supply references, player denial and frozen prior evidence. Existing participation and current-counter suites are re-run after the shared Actor projection change.

OPEN: historical inventory state/spends, trusted Skill-specific item semantics/physical condition/access/consent, supply-unit representation, custom/nested containers and full capacity/encumbrance validation, Dwarf/stock/crafting/equipment exceptions, integrated equipment+reward+progress history, Ability counters, all prior historical/event/runtime gaps and combined Foundry v13.351 A-D acceptance. **0/14 FULLY_REAUDITED**; Legacy Mixed sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED. Stable v1.12.0 / published QA v1.13.0-qa.29 unchanged; no release/merge.

### GitHub CI verified — current equipment source commit 5298dea7c672b5d5e67d2b47e938bc38a539ff21

Run https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38290534291 completed SUCCESS. Logs explicitly confirm **152/152 smoke suites PASS**, Gear/pack/supply/quantity/carried-path/trained-lender regression PASS, syntax/safety preflight PASS, unpublished ZIP integrity/manifest byte equality and **21/21 manifest dependencies PASS**, protected QA/stable/system manifest guard PASS. Local full regression and independent ZIP checks also PASS.

Current Item/quantity/placement bindings are automatically verified; historical equipment, physical adequacy/classification, supply-unit semantics, actual loan consent and consumption remain unverified. Full inventory capacity/custom/nested paths, stock/crafting exceptions, complete integration and real Foundry v13.351 A-D remain OPEN / NOT RUN; **0/14 FULLY_REAUDITED**. Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable v1.12.0 / published QA v1.13.0-qa.29 unchanged. No merge/release/tag/channel action.

## 2026-10-12 — G1 integrated saved-test implementation

`tests.integratedTestPlan` captures participant/equipment evidence once and binds the native base message, saved Wise/Fate events and final acting/helper progress to the same actor/message identity and scenario. An internal issued-result registry rejects forged or mismatched equipment contexts. Event reads and final participant/lender checks reject changed current snapshots. No caller final outcome or counter override is accepted.

Source basis: DH 59,73-77,108-110; SG 36-38,47,51,87-88. The new regression proves ordinary Skill FAIL→Deeper→PASS gives acting PASS and helper's own helping-Skill PASS; BL FAIL→Deeper six→Luck child→PASS gives one learning attempt, no Will/Health mark, and helper Skill PASS. No events preserves FAIL; insufficient Fate, fabricated context, conflicting scenario, unsupported outcome/history fields, duplicate-counter review and player invocation are rejected. Existing narrower public adapters retain their boundaries.

G1 engineering chain is implemented for independent Adventure Skill/BL in the existing supported equipment/participant scope. Full G1 acceptance remains OPEN pending the combined real-runtime case and broader exception coverage; this does not close G2–G5. Historical budgets/eligibility/relevance/consent/event links remain assertions, authentication remains false, Ability counters are still absent. No prospective capture was added. Foundry v13.351: NOT RUN. FULLY_REAUDITED: 0/14. Legacy sole live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; versions/channels/READY frozen.

Verified code SHA `ef721151f810f0c9d1cb8cc96dabb0d3d02e81f0`: [CI 38294327585](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38294327585) SUCCESS; 153/153 suites, syntax/preflight, unpublished ZIP integrity/manifest byte equality and 21/21 dependencies PASS; frozen stable/QA/system/READY guard PASS. Foundry acceptance remains NOT RUN.

## 2026-10-12 — G2 single source/code/test matrix and advancement boundaries

Current mapping: [Package A rule/code/test matrix](M10D18_PACKAGE_A_RULE_CODE_TEST_MATRIX.md). It separates pure regression, observed-document integration, model gaps and pending runtime acceptance across all five domains. It is not an exhaustive exception certificate. G2 remains OPEN.

Source-backed code corrections: DH108-110 advancement count/rating/Obstacle readers reject null, boolean, textual, fractional and unsafe numeric evidence instead of coercing it; mark review booleans must be actual booleans. DH68 zero-current Nature requires the immediate loss/trait/max/tax/mark-reset boundary before DH109 advancement. No live actions or schema changes. Regression proves distinct P/F thresholds, rating1/cap6 and preserved Nature tax difference; 154/154 local smoke suites plus preflight PASS. Final CI reference is recorded on Draft PR #14.

Required model decisions remain OPEN: no observed Will/Health/Nature P/F rows in current schema; no canonical Gear quantity-to-supply-increment unit. Never infer history or default-zero counts. Entitlement/Instinct/channel/crafting/Versus/tie/series/conflict/Wise-lifecycle integration and prospective Legacy-owned evidence still require work. Foundry v13.351 NOT RUN; G1 full acceptance and G2-G5 remain OPEN; 0/14 FULLY_REAUDITED. Legacy sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED; published versions/channels/READY untouched.
Verified G2 source/code SHA `e378731eae5d3d8ea0272cc8e91e2099cb2c137d`: [CI 38295483768](https://github.com/GuteboysFactory/RealmGuard-Torchbearer/actions/runs/38295483768) SUCCESS; 154/154 suites, syntax/preflight, unpublished ZIP integrity/manifest equality and 21/21 dependencies PASS; stable/QA/system/READY frozen guard PASS. Runtime acceptance NOT RUN; full gates and certifications unchanged.
## 2026-10-12 — G3 proposed trace contract / read-only consistency validation

Design and current limits: [Prospective Legacy trace contract](M10D18_PACKAGE_A_PROSPECTIVE_TRACE_CONTRACT.md). `tests.prospectiveTracePlan` validates explicit envelope/test/author/participant/item/die/spend/final declarations using the existing reward engine; it does not read native documents or install capture/storage/hooks. Source basis DH59,75,77,108-110; SG36-38,47,51,87-88. Envelope/receipt fields are engineering choices, not quoted rules.

Regression covers Skill and BL with Help, helper pre-roll Synergy receipt, Deeper before recursive Luck, linked acting spends and one final result; inconsistent edits, mixed/duplicate identities, malformed plain D6 records, missing/wrong-payee/wrong-cost/invalid-balance receipts, unsupported counters and declared prior-test replay are rejected. A consistently fabricated author/owner snapshot can still pass structural checks; all authentication/complete-history flags remain false. No real-session permission or global replay proof is claimed by this pure validator.

Legacy inspection confirms role chat cards retain HTML rather than complete native Roll/parent histories; existing spend results have no saved test/event identity. Future producer placement is specified in Legacy's existing roll and spend path, preserving Legacy rules and failure behavior, but no writer is installed in this checkpoint. G3 capture/trust/data and real runtime acceptance remain OPEN; current evidence cannot recover old HTML-only history. G1/G2 full acceptance and G4/G5 remain OPEN; certifications0/14; Legacy sole live authority, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable/published QA/READY untouched. Final verification is recorded after CI.