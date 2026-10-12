# Realm Guard / Torchbearer - Local Project Roadmap

**Current Package A completion plan:** [five-gate closure checklist](M10D18_PACKAGE_A_WORKING_AUDIT.md#current-closure-checklist--2026-10-12). Historical NEXT/checkpoint sections below preserve earlier evidence; use the current list to avoid opening unrelated incremental packages. G1 integrated final outcome, G2 five-domain source/model closure, G3 historical provenance contract/data, G4 unpublished-candidate Foundry A-D, G5 final safety/release decision remain OPEN. Current automated baseline: 152/152, ZIP21/21; manual acceptance NOT RUN; 0/14 domain certificates.

**Foundry target:** 13.351  
**Current GOLD baseline:** v1.0.8.3  
**Current build:** v1.0.8.44 - Roll & Conflict Readability Polish - QA  
**Internal system id:** `realm-guard` (do not rename)

## Rule-source precedence

1. Realm Guard rules where the hack overrides the base game.
2. Mouse Guard RPG 2nd Edition for inherited core mechanics.
3. Torchbearer 2E only for selected compatible mechanics deliberately adopted by this project.
4. Explicit Realm Guard / Torchbearer Foundry expansions and optional table rules.

## v1.0.6 - Playflow, Advancement & Conflict UX

**Status:** GOLD / verified baseline.

### Ability advancement
- Visible Pass/Fail tracks for Nature, Will, Health, Resources and Circles.
- Ability advancement is automatic when its Pass/Fail requirements are met.
- Nature advancement uses Maximum Nature and raises both Maximum and Current Nature by one when advancing while taxed.
- Beginner's Luck continues to track its own attempts and never advances the Will/Health base Ability.
- Manual +/- controls remain correction tools only; they are not required for normal advancement.

### Help / Teamwork / Synergy
- Normal Roll Dialog Teamwork uses a **player-to-player Help Request**: the acting Ranger clicks Help, active Ranger players answer on their own clients, and accepted Help appears live in the acting roll.
- The roller no longer configures another Ranger's source or Synergy choice. Normal Help distinguishes trained Skill/Ability from **I Am Wise**; helper Traits remain excluded and Afraid Rangers cannot answer Help.
- Selected Torchbearer-inspired **Synergy** is adopted as an RG/TB option and is chosen by the helper in their own prompt. It is bound to that helper's Fate and helping Skill/Ability; on a resolved result the helper spends 1 Fate and marks Pass/Fail. An unresolved tie spends nothing; a resolved tiebreaker uses the resolved result.
- Help requests are non-modal and never force the acting player to wait; unanswered requests close when the roll is committed/cancelled.
- Unavailable Fate/Persona spends state the reason directly in the UI.

### Smart Obstacle workflow
- GM Control includes a live **Baseline Obstacle** that can be changed during play.
- Three modes: Baseline automatically, GM approval, or Manual per roll.
- GM approval uses a compact non-modal request with +/- adjustment and live synchronization to the player's open Roll Dialog.
- Ordinary tests can be prepared while Ob is reviewed. Versus and rule-specific tests are not forced through the Baseline workflow.
- Source-backed Ob 1-6+ difficulty guidance is shown inline; no invented skill factors are introduced.

### Conflict Engine repair & simplification
- Hidden plans are cached defensively in addition to the existing private setting to reduce missing-plan/stuck-state failures.
- If hidden plan data genuinely cannot be recovered, the exchange safely returns to planning instead of remaining stuck.
- Locking both plans reveals the next action automatically; subsequent actions auto-reveal after resolution.
- The primary Conflict window explains the current step and who/what is waiting.
- Planning cards are hidden during resolution to reduce visual noise; recent exchange events move into compact history.
- A small Retry Reveal control remains only as a recovery path for the GM.

### Self-explanatory UI
- Contextual hover/focus explanations for unclear rules and controls.
- Short inline guidance explains consequences rather than reproducing the manual.
- Disabled resource options state why they are unavailable.
- Nature management is non-modal, correcting the remaining v1.0.5 modal regression.

### v1.0.6 release gate
Completed and approved as GOLD after live playtest. v1.0.7 is built from this baseline.

## v1.0.7.1 - Flexible Test Engine & GM Flow

**Status:** GOLD / VERIFIED. Supersedes v1.0.6 as the stable baseline.

### Flexible Test Engine
- Custom Roll is available from Ranger and NPC sheets.
- Linked Skill/Ability Custom Rolls hand off to the normal automated roll engine.
- Free Custom Rolls support an improvised dice pool/Ob/Extra Dice/Persona and deliberately record no Learning.

### Live Obstacle control
- **Baseline Obstacle** remains the default for newly opened ordinary tests.
- **Change Live Roll OB** pushes a temporary Ob live to currently open Baseline-linked Roll Dialogs across connected clients.
- **Reset to Baseline** restores the live control to the current baseline.
- Manual, approval, Versus, Resources/Circles and fixed Ob tests are not overwritten.

### Learning & roll readability
- Untrained Skills learn automatically at Rating 2 when Beginner's Luck attempts reach Maximum Nature; no manual LEARN gate remains.
- NEW SKILL LEARNED uses the established celebratory chat-card family.
- Roll Modifier is read-only and surfaces automatic Condition/system modifiers; Extra Dice stays separate.
- Dice faces use immediate visual language: 1-3 red, 4-5 green, 6 green + star.

### Smart NPC workflow
- NPC sheets accept drag/drop for Skills, Wises, Traits, Gear, Conditions, Talents and Tokens of Power with duplicate protection.
- NPC Template Library can create standalone NPC copies.
- Dropping an image from the GM computer onto a template uploads the art and creates the NPC with template stats/items plus that portrait; the GM frames the final round token manually in Token Builder.

### Conflict chat QoL
- Every resolved Conflict Action posts a step card with action pairing, both sides' dice/successes and Disposition before/after.
- Maneuver effects receive a concise follow-up chat entry.
- Final Conflict Complete remains the summary card.

### v1.0.7.1 release gate
Completed and approved as GOLD after live Foundry 13.351 QA.


## v1.0.8.3 - NPC Layout & Token Portrait Hotfix
**Status:** QA

- GM Notes is compact and stays in the NPC sheet's left column beneath Quick Skills.
- Create / Save Token remains explicit/non-destructive until pressed.
- On NPC save, the generated round token also becomes the NPC portrait while preserving the original source artwork for future reframing.

## v1.0.8.43 - Portrait Persistence, Context Help & QA Fixes

**Status:** QA HOTFIX. Built from v1.0.8.42 QA; v1.0.8.3 remains GOLD/public until live QA passes.

- Adds persistent Ranger Character Portrait framing with saved X/Y position, zoom and Fill/Fit mode. Reloading/reopening the sheet no longer resets player framing.
- Adds non-destructive **Original Portrait / Token Portrait** choice. Original source artwork remains preserved; each portrait mode keeps its own framing.
- Token Builder now reopens with its last saved framing instead of resetting to center/1.0x/Fill every time. The generated token path is retained for optional Token Portrait use.
- Audits Conflict Tap Nature availability: legal Conflict Skill/Ability tests, Starting Disposition and Beginner's Luck retain Tap Nature; Fixed/Manual non-roll methods do not create a Tap Nature test; Resources/Circles remain excluded by the inherited rule.
- Adds reusable system-wide contextual dropdown help. Realm Guard/Torchbearer selects render as accessible custom dropdowns whose individual alternatives can expose hover explanations while preserving the native form value underneath.
- Extends contextual hover help through Conflict Actions, Starting Disposition Method, Nature scope, plan controls, Weapon/Tool choices, roll controls and Maneuver choices.
- Hovering a canvas token temporarily reveals its token name without requiring permanent Foundry nameplate display.
- Fixes GM Quick Inspector metadata overlap by separating identity/stats, Fate/Persona/Checks, Conditions and action buttons into stable rows.
- No destructive Actor migration. New portrait data is stored in `flags.realm-guard`; existing Actors fall back safely to their current portrait/token data.

## v1.0.8.44 - Roll & Conflict Readability Polish

**Status:** QA HOTFIX. Built from v1.0.8.43 QA; v1.0.8.3 remains GOLD/public until live QA passes.

- Repairs the v1.0.8.43 dropdown regression by moving custom option menus to a document-level overlay. Existing native `<select>` values remain authoritative for Foundry forms while option hover-help no longer inherits transformed-window positioning.
- Simplifies standard roll outcomes: **PASS / FAIL / TIE** is the headline; the second line shows **Success: X**, **Failed: X**, or **Tiebreaker pending** instead of embedding `Margin of ...` in the result badge.
- Reorganizes standard Skill, Ability and Beginner's Luck chat cards into labelled Dice Pool, roll-face, resource/support and final-result groups.
- Rebuilds Conflict Action chat cards around three visual levels: matchup, immediate result/disposition change, then collapsible roll/rules detail.
- Starting Disposition, Maneuver and Conflict Complete cards use the same readability hierarchy.
- No gameplay rule changes and no destructive Actor migration.
- Live QA must verify dropdown placement/selection, narrow chat cards, Conflict action pairings and regression against v1.0.8.43 portrait/Tap Nature/Inspector behavior.

## v1.0.8.2 - Token Builder & NPC Conditions Hotfix

### Scope
- Token Builder opens from the full Actor portrait and allows free image positioning plus wider zoom control.
- Center/Fit/Fill/drag/zoom are preview-only; Actor/token data changes only on **Create / Save Token**.
- NPC Template image-drop no longer auto-generates a final round token crop.
- NPC Conditions use a compact single-column presentation in the NPC side panel so names and edit/recovery controls remain aligned and readable.
- Carries forward v1.0.8.1 Roll Dialog grouping and all v1.0.8 rules corrections.

### v1.0.8.2 release gate
Live QA must pass `TEST_PROTOCOL_v1.0.8.2.md`. Until then v1.0.7.1 remains GOLD.

## v1.0.8.1 - Token Persistence & Roll Layout Hotfix

**Status:** SUPERSEDED QA CANDIDATE. Replaced by v1.0.8.2; retained here only as version history.

### Token persistence correction
- Quick Token Builder saves the adjusted crop/zoom/position into a real round PNG rather than only changing preview state.
- Actor prototype token is updated to the generated PNG.
- Optional current-Scene update refreshes already placed tokens for the same Actor immediately.
- NPC Template image-drop uses the same round-token generator automatically.

### Roll Dialog core-field grouping
- Obstacle, Modifier (automatic), and Extra Dice are visually grouped with their own values and help text.
- Obstacle source/difficulty text stays with Obstacle.
- Condition/system breakdown stays with Modifier.
- Manual/situational explanation stays with Extra Dice.
- Responsive layout collapses cleanly instead of separating labels from values on wide/narrow dialogs.

### v1.0.8.1 release gate
Superseded by v1.0.8.2 before GOLD promotion.

## v1.0.8 - Rules, NPC & Token Polish

**Status:** SUPERSEDED QA CANDIDATE. Its scope is carried forward into v1.0.8.2.

### Trait rules correction
- Beneficial Character Traits follow Mouse Guard 2E exactly: L1 +1D once/session, L2 +1D twice/session, L3 +1s on relevant passed/tied tests.
- Beneficial L1/L2 uses are stored as session state and reset when End Session is finalized.
- Trait Against remains separate. Wises are not given a false once/session restriction.
- Tokens of Power retain their Realm Guard-specific level behavior and are regression-tested separately.

### Roll/chat polish
- Remove the redundant top-row Help Dice field; accepted Teamwork stays automatic inside Help/Teamwork.
- Extra Dice is explicitly manual/situational; Modifier remains read-only automatic system/Condition impact.
- Fix duplicate NEW SKILL LEARNED publication.
- Preserve red/green/star dice language and narrow Result layout.

### NPC & Token polish
- Cosmetic NPC sheet alignment/responsiveness pass.
- NPC template image-spawn gets automatic centered 1x1 aspect-safe token defaults.
- Quick Token Builder for Ranger and NPC: drag position, zoom, Center, Fit, Fill, token size, portrait source and preview before Save.

### v1.0.8 release gate
1. Static/package QA PASS.
2. Live Trait-use tests across normal, Beginner's Luck, Ability/Nature and Conflict rolls.
3. End Session resets Trait benefit use state exactly once.
4. Token Builder/image-template tests on Foundry 13.351.
5. Regression against v1.0.7.1 GOLD before promotion.

## v1.1.0 - Circles & Contacts

**Status:** PLANNED MAJOR FEATURE.

- Dynamic Contacts gained through play.
- Better, more pedagogical Circles flow.
- Keep existing fixed Relationships and add Contacts as a separate growing layer.
- Source-audit exact Circles factors and contact mechanical benefits before implementation.

## Later post-v1.0 backlog

- Optional Mouse Guard-style freeform Inventory mode alongside current paper-doll/slot inventory.
- Additional Starter Library content, Talents, Tokens and NPC templates.
- Illustrated manual/screenshots if useful.
- Additional GM quality-of-life tools driven by actual playtest need.
- Future Foundry major-version compatibility.
- **Wises 2.0 remains deliberately omitted** unless explicitly reopened.

## Version discipline

Every package receives its own QA protocol. Stable 1.x work is built from the latest verified GOLD baseline and remains non-destructive wherever possible. v1.0.8 is the active QA branch; v1.0.7.1 remains the verified GOLD fallback until v1.0.8 passes live QA.



## Current MG2E QA milestone — 2026-10-03

M10C.7 / qa.18 FULL PASS confirmed by the user in Foundry v13.351. M10C.8 / v1.12.0-qa.19 implements explicit reversible QA activation. See REALM_GUARD_TORCHBEARER_PROJECT_ROADMAP.md and TEST_PROTOCOL_v1.12.0-qa.19.md. Stable remains v1.11.0; qa.19 live activation QA is pending.

## v1.12.0-qa.20 — M10C.8 preview correction

MG2E Conversion Preview remains zero-write and now reports QA-active status and separate explicit activation. Focused Gate A / B / L plus activation sanity are pending. Stable remains v1.11.0.

## v1.12.0 — STABLE / GOLD

Promoted from verified qa.20. M10C.8 FULL PASS / VERIFIED / CLOSED. MG2E supported stable; no gameplay changes. QA stays v1.12.0-qa.20.

## v1.13.0-qa.1 — M10D.1 TB2E Foundation

Source-constrained 19-domain audit, locked Rules / Creation Profile v1 and zero-write preview/status API. No later live domains. Stable remains 1.12.0. First foundation gate pending.

### 2026-10-12 — Package A Actor / GM / saved-D6 evidence (Draft)

Implemented a GM-only current-document read boundary and a narrow current-Actor-to-plain-D6 obstacle preview through `tests.documentEvidence` / `tests.documentOutcomePlan`. Caller assertions cannot replace session identity, document lookup, message visibility or current author ownership. Current Actor role/conditions are compared to the reviewed scenario. Stored plain native D6 results have bounded, unique per-message IDs; modified/rerolled/exploded histories fail closed. No RNG, writes, spends or advancement.

NEXT: execute the combined Foundry v13.351 A-D protocol, then design historical Actor/resource snapshots and a verified Wise/Fate event ledger without enabling live CORE. Current mutable client evidence is not historical/server attestation. BL/helpers/Heroic/token routes and complete exception parity remain OPEN. CI/local regression evidence is in the Package A audit checkpoint. 0/14 FULLY_REAUDITED; Legacy Mixed only live authority; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED. No release, version/channel/tag change.

### 2026-10-12 — Package A saved Wise/Fate result-document chain

Implemented `tests.documentRewardHistoryPlan`: current session GM/Actor/message/Wise identity checks, strictly ordered unique saved result documents, source-bound Deeper/Of Course/recursive Luck target/parent-six validation and explicit GM-asserted historical budgets. Fixed Angry permitting beneficial Wise rerolls (SG47); normal Luck remains allowed. All results remain read-only and all historical/authentication claims false. Full test evidence is in the Package A audit checkpoint.

NEXT: combined Foundry v13.351 A-D execution and design trustworthy historical Actor/resource/event provenance. Saved timestamps and current Wise items cannot establish historical ownership, complete same-test linkage or immutable chronology. Legacy HTML-only cards, helpers/BL/Heroic/token paths and full exception parity remain OPEN. 0/14 FULLY_REAUDITED. Legacy Mixed live; CORE shadow/read-only; kill switch ENGAGED; M11 PAUSED. Stable/QA unchanged, no release.

### 2026-10-12 — Package A current Skill / BL / Help / Wise participant evidence

Added shared GM-only scalar `tests.actorEvidence` and separate `tests.participationOutcomePlan`: current unique trained Skill or correctly mapped untrained Will/Health, actual helping Skill/Wise Item IDs, distinct helper conditions, zero-rating Help exclusions and correct BL/Fresh stages. No historical permission/consent/spend claim, rolls, writes or advancement. Existing document/Wise-Fate history scope remains unchanged.

NEXT: full Foundry v13.351 combined A-D acceptance; historical Actor/resource/consent/event provenance; equipment-source evidence and remaining reward/advancement/exception paths. Current participant records cannot certify actual past participation. Nature/Instinct/conflict/series/tiebreaker/Heroic/token routes and Legacy HTML-only native Roll gap remain OPEN. CI evidence in Package A audit. 0/14 FULLY_REAUDITED; Legacy Mixed live; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED. Stable/QA unchanged; no release.

### 2026-10-12 — Current counter progression from the saved participant outcome

Added `tests.participationProgressPlan`: source-derived acting Skill/BL proposals from the same saved outcome, observed current P/F/BL/Nature values and optional distinct Helper Synergy. Missing counters are not defaulted. Sick suppresses marks/readiness; BL uses Maximum Nature; cap6 and capacity24 are guarded. Current Legacy threshold settings are shown but untouched. Helper Ability Synergy reports the missing Will/Health counter model explicitly; no fields or baseline0 are invented.

NEXT: combined Foundry v13.351 A-D verification, historical counter/duplicate-test/resource/event/consent provenance, equipment evidence, Ability counter model and complete reward/participation/exception parity. The projected marks remain zero-write and do not authorize any actual advancement. See working audit for verification checkpoint. 0/14 FULLY_REAUDITED; Legacy Mixed live; CORE shadow/read-only; M11 PAUSED; kill switch ENGAGED; stable/QA unchanged. No release.

### 2026-10-12 — Current Item / pack / supply / gear / tool-lender evidence

Added `tests.equipmentOutcomePlan` with actual current Gear IDs/quantities/placements, one supported worn pack/satchel, distinct Supply/Gear roles and a real trained tool lender. Caller quantity/role reuse and missing/unassigned/orphan/ambiguous paths fail closed. Item relevance/usability/access, supply increment and loan consent remain explicit GM assertions; no classification from names/flags or quantity consumption. Current mutable evidence does not certify old inventory/spends. Source tests/checkpoint are in the working audit.

NEXT: combined Foundry v13.351 A-D verification and reliable historical/item semantics; custom/nested container capacity/encumbrance; stock/crafting exceptions; full equipment/reward/progress integration; remaining Ability/history gates. All existing live authority and release controls unchanged: 0/14 FULLY_REAUDITED, Legacy Mixed live, CORE shadow/read-only, M11 PAUSED, kill switch ENGAGED, stable/QA untouched. No release.

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