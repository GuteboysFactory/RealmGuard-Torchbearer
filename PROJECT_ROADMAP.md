# Realm Guard / Torchbearer - Local Project Roadmap

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

