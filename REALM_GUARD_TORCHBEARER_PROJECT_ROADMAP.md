# Realm Guard / Torchbearer - Local Project Roadmap

**Foundry target:** 13.351  
**Current GOLD baseline:** v1.0.8.3  
**Current QA build:** v1.0.8.44 - Roll & Conflict Readability Polish  
**Next major feature build after hotfix line:** v1.1.0 - Circles & Contacts - PLANNED  
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
- Custom Roll opens directly as a Free Dice Pool for improvised/table-adjudicated tests.
- Standard Skill/Ability rolls remain on their dedicated sheet controls and retain the normal automated roll engine.
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

**Status:** GOLD / PUBLISHED. Final v1.0 baseline.

- GM Notes is compact and stays in the NPC sheet's left column beneath Quick Skills.
- Create / Save Token remains explicit/non-destructive until pressed.
- On NPC save, the generated round token also becomes the NPC portrait while preserving the original source artwork for future reframing.
- v1.0.8.3 closes the planned v1.0 feature line. Future feature development continues in v1.1.x.

## v1.0.8.42 - Playtest Hotfix & Conflict Flow Hardening

**Status:** QA HOTFIX. v1.0.8.3 remains GOLD until live multiplayer QA passes.

- Fix NPC Skill drag/drop and same-name Conflict Skill duplication.
- Rebuild Starting Disposition around the normal roll engine, including Beginner's Luck for untrained Conflict Skills, full base Ability, team Condition deduplication and transparent chat math.
- Add opposition Disposition modes: Calculated, Nature, Fixed and Manual.
- Rework Conflict flow into explicit Setup -> Goals & Stakes -> Starting Disposition -> Planning -> Resolve -> Compromise stages and harden abort/restart/hidden-plan state.
- Add Conflict Weapon/Tool infrastructure: per-Action declarations, custom/improvised tools, requirements, +D/-D, conditional +s, unconditional -s and universal Unarmed -1D when no valid tool is declared. Full content libraries remain later data work.
- Move Obstacle Control into its own GM Dock tool and make Selected Tokens update live in GM Control.
- Move Recruit Ranger/Create Ranger/Recruitment Guide into the Actors directory and add Owner-only Ranger portrait file drop.
- Improve resize/scroll safety, typography and Conflict visual hierarchy based on 3-player + GM exploratory playtest feedback.
- Preserve the highly rated NPC Template -> portrait -> Token Builder workflow unchanged in intent.
- Remove redundant Goal confirmation: saving a GM/Ranger Goal marks that side Ready immediately and both saved Goals auto-advance to Starting Disposition.
- Simplify secret Action planning visually with progressive disclosure, clearer Action choices and compact locked-plan summaries.
- Turn Selected Tokens into a GM Quick Inspector with per-Actor Sheet/Center/Roll/Conditions/Token actions and multi-select Group Conditions.
- No destructive migration.

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
Superseded by v1.0.8.3 after final NPC layout/token portrait polish.

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

**Status:** SUPERSEDED QA CANDIDATE. Its scope is carried forward into v1.0.8.3 GOLD.

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

---

# v1.1.x Working Roadmap

## v1.1.0 - Circles & Contacts

**Status:** NEXT / PLANNED MAJOR FEATURE.

### Circles flow
- Build a true Circles Test flow instead of treating Circles as only a generic Ability roll.
- Provide concise, pedagogical guidance for when Circles applies and what the GM needs to decide.
- Source-audit exact Circles factors, Obstacle construction and mechanical benefits before implementation.
- Reuse the established RG/TB roll UX: Obstacle, automatic Modifier, Extra Dice, Fate/Persona where legal, dice visualization and chat result cards.

### Dynamic Contacts
- Add a separate growing Contacts layer alongside the fixed Relationships created during Recruitment.
- Contacts can be created through play and reused in later Circles interactions.
- A Contact remains a known person even if the relationship changes.
- Contact data should at minimum support: Name, People, Profession/Role, Location, Notes and current relationship status.

### Living relationships
- Relationship status is dynamic rather than permanently positive or negative.
- Supported baseline states should include: **Friend / Ally**, **Neutral / Contact**, **Rival**, **Enemy**, and **Complicated**.
- Friends can become Rivals or Enemies through play; Enemies can become Neutral, Contacts, Allies or Friends.
- Preserve a lightweight relationship history so major changes can be traced by session/event without turning Contacts into a campaign-management burden.
- Fixed Recruitment Relationships remain intact; dynamic Contacts do not replace them.

### Portrait scope note
- Character Portrait Mode was pulled forward into the v1.0.8.43 QA hotfix because portrait persistence was a blocking playtest issue. v1.1.0 must preserve that behavior but does not reimplement it.

### v1.1.0 release gate
1. Circles factor/rule audit completed before automation is locked.
2. Contacts can be created, reused and edited without touching fixed Recruitment Relationships.
3. Relationship state can change in both directions and persists correctly across reload/multi-client use.
4. Regression includes the v1.0.8.43 portrait persistence/mode behavior.
5. Regression against the latest verified GOLD baseline promoted from the v1.0.8.x hotfix line.

## v1.1.1 - Wises 2.0

**Status:** PLANNED. Wises are back in active development scope.

- Perform a full Wise rule audit before locking the automation model.
- Make Wise use/type clearer in the roll flow.
- Keep **I Am Wise** distinct from ordinary Teamwork and from Skill/Ability Help.
- Preserve correct separation between Wises, Traits, Skills/Abilities and Tokens of Power.
- Implement the selected Wise effect/reward/progression cycle only after the exact source-backed model is agreed.
- Do not introduce a false once-per-session restriction.
- Add clear chat feedback/tooltips showing what a selected Wise use actually did.
- Migration must be non-destructive for existing Wise Items and Actors.

## v1.1.2 - Token & Portrait Frames

**Status:** PLANNED COSMETIC FEATURE.

- Build a shared cosmetic Frame Library for tokens and round character portraits.
- Frames have no gameplay, stat, progression or rule effect.
- Include **No Frame** and a starter set of visual styles such as plain, wood, iron, bronze, silver, gold, ranger, dark and ornate.
- Preview frame choice live inside Token Builder before Save.
- Allow the same selected frame to be reused for the Actor's round Token Portrait presentation.
- Keep the frame layer separate from the underlying portrait/token art so changing frames is non-destructive.
- Prepare the architecture for future GM/custom frame images without requiring that capability in the first release.

## v1.1.3 - Feedback, Diagnostics & Stability

**Status:** PLANNED.

### Feedback Center
- Add a compact **RG/TB Feedback Center** with three clear entry points: **Report Bug**, **Suggest Feature**, and **Idea / Improvement**.
- Keep reporting lightweight so players and GMs can return to play immediately.
- Prepare GitHub-friendly reports rather than relying on email.
- Where practical, open a pre-filled GitHub Issue so the user only needs to review and submit it in their browser.
- Keep fallback actions for **Copy Report** and **Download Report** when GitHub submission is not appropriate.
- Categorize reports with clear labels such as `bug`, `feature-request`, `idea`, `ui-ux`, `rules`, `npc`, `token-builder`, `circles`, and `wises`.
- Feature/idea reports should ask for the desired outcome and why it would improve play, without requiring technical knowledge.

### Diagnostics & stability
- Local diagnostics/ring buffer for recent RG/TB system events; no broad campaign surveillance.
- Include useful technical context such as RG/TB version, Foundry version, relevant Actor/function/test type, Ob source, Conditions/modifiers, resource spends, Help/Synergy, advancement, Conflict state, token/NPC actions, socket messages and JS errors/stack where available.
- Provide preview and explicit opt-in before diagnostics are exported or shared.
- Support a human-readable report plus structured JSON where useful.
- Optional GM Debug Mode for difficult multiplayer/Conflict reproduction.
- Never embed GitHub tokens, SMTP credentials or other secrets in the game system.

## v1.1.4 - Expanded NPC Template Library

**Status:** PLANNED DATA / UX EXPANSION.

### Goal
- Expand the existing NPC Template system into a broad, fast GM library for ordinary people, cultures, factions, creatures and major threats that may plausibly appear in a Realm Guard campaign.
- Treat this primarily as a **data + organization + cosmetic UX** release rather than a new rules engine.
- Reuse the existing Create NPC, image-drop and Token Builder workflows instead of introducing a parallel NPC creation system.

### Template architecture
- Organize templates by **base archetype + culture/faction + role + threat level + tags** rather than maintaining large numbers of near-duplicate stat blocks.
- Support searchable/filterable metadata such as `Culture`, `Type`, `Role`, `Threat`, `Faction`, and `Habitat`.
- Where useful, allow a base template to expose variants such as **Ordinary / Skilled / Veteran / Elite / Named** without duplicating the entire template.
- Keep templates editable after creation; generated NPCs remain standalone Actor copies.

### Planned content families
- **Common Folk / Civilians:** innkeeper, miller, farmer, blacksmith, carpenter, healer, merchant, hunter, woodsman, fisher, ferryman, shepherd, miner, messenger, caravaner, guard, watchman, steward, scholar, servant, noble, refugee and similar everyday roles.
- **Hobbits:** farmers, gardeners, innkeepers, brewers, Shirriffs/Bounders, merchants, craftsmen, hunters, wanderers and other ordinary or adventurous Hobbit types.
- **Dwarves:** miners, smiths, craftsmen, merchants, scouts, warriors, veterans, guards, lorekeepers and expedition leaders.
- **Rohan:** villagers, herders, horse-breeders, riders, scouts, veterans, royal guards and command-level variants.
- **Gondor / Men of the West:** townsfolk, Rangers, soldiers, archers, guards, veterans, officers, nobles, healers, scouts and sailors.
- **Bree-land / Northmen:** villagers, innkeepers, farmers, woodsmen, caravan guards, hunters, travellers and local watch.
- **Dunlendings / Wild Men:** hunters, warriors, raiders, scouts, chieftains and appropriate lorekeeper/shaman-type roles.
- **Isengard:** Orc labourers, Orc soldiers, Uruk-hai variants, scouts, captains, Warg Riders, allied Dunlendings and other servants/creatures appropriate to the faction.
- **Orcs & Goblins:** weak goblins through scouts, archers, warriors, veterans, captains, bodyguards, Warg Riders and tribal leaders.
- **Trolls:** cave, hill, mountain and high-threat war-troll style variants where appropriate.
- **Wild Animals:** dogs, horses/ponies, deer, boar, wolves, bears, snakes, spiders, great spiders, ravens, hawks and other wilderness fauna.
- **Dark Creatures:** corrupted beasts, giant spiders, shadow-creatures, underground horrors and other setting-appropriate threats.
- **Undead / Spirits:** restless dead, haunted spirits, Barrow-wight style threats, Wraiths and greater cursed guardians.
- **Dragons / Drakes:** young drakes through cold-drake, fire-drake, winged and ancient high-threat variants; dragons are treated as boss-level threats rather than ordinary NPCs.
- **Special / Legendary bases:** reusable unnamed archetypes for warlords, chieftains, ancient beasts, powerful servants and other major adversaries that the GM can customize.

### Template browser UX
- Add category navigation, search and filters so the GM can move quickly from broad family to usable template, e.g. **Rohan -> Rider -> Veteran** or **Enemy -> Creatures -> High Threat**.
- Add compact visual chips/badges for Culture, Role and Threat where they improve scanning.
- Preserve the fast flow: **choose template -> create or drop portrait -> NPC Actor -> Token Builder -> play**.

### v1.1.4 release gate
1. Existing NPC creation and Smart Drag & Drop remain regression-safe.
2. Template search/filtering remains fast with the expanded data set.
3. Generated NPCs are standalone and editable.
4. Template metadata does not alter gameplay unless the selected template's actual stats/items explicitly do so.
5. No unnecessary duplicate templates where a base archetype + variant can express the same result.

## v1.1.5 - Traits & Talents Expansion

**Status:** PLANNED CONTENT / RULE-SUPPORT EXPANSION.

- Expand the ready-to-use Trait library while preserving custom Traits and the existing Level 1/2/3 Trait engine.
- Expand the Talent library with clearer categories, linked Skill/Ability uses and table-readable descriptions.
- Keep normal trained Skill cap at Rating 6. Implement explicit Talent-based cap extension to Rating 7 only for the Talent(s) that grant it; do not globally raise the Skill cap.
- Audit new Talent effects before automating them so content does not silently change core roll rules.
- Improve browsing/selection UX where the larger content library would otherwise become difficult to scan.
- Keep Traits, Talents, Wises and Tokens of Power mechanically distinct.
- Migration must remain non-destructive for existing custom Traits/Talents.

### v1.1.5 release gate
1. Existing Trait session-use behavior remains regression-safe.
2. Rating 7 is impossible without an explicit qualifying Talent.
3. New content remains editable/extensible by GM.
4. Regression against the latest verified GOLD build before promotion.

---

# v1.2.0 Working Target

## v1.2.0 - Inventory & Equipment Evolution

**Status:** PLANNED MAJOR FEATURE / SCOPE TO BE LOCKED AFTER v1.1.x PLAYTEST.

- Evolve the current Inventory/Gear experience using real playtest feedback from the v1.1.x line.
- Preserve the current structured paper-doll/slot/container model as a supported mode.
- Evaluate an optional freer Mouse Guard-style inventory presentation alongside the structured/Torchbearer-inspired mode.
- Prefer shared underlying Actor/Gear data rather than two incompatible inventory data models.
- Improve Containers/Gear handling where playtesting shows friction.
- Keep switching modes non-destructive wherever practical.
- Final v1.2.0 scope is deliberately not locked until v1.1.x has been used in real sessions.

## Later backlog

- Additional Starter Library content, Talents, Tokens and post-v1.1.4 NPC template expansions.
- Illustrated manual/screenshots if useful.
- Additional GM quality-of-life tools driven by actual playtest need.
- Future Foundry major-version compatibility.

## Version discipline

Every package receives its own QA protocol. Stable 1.x work is built from the latest verified GOLD baseline and remains non-destructive wherever possible. **v1.0.8.3 is the current GOLD/public baseline; v1.0.8.44 is the active QA hotfix, then v1.1.0 remains the next major feature target.** Patch/hotfix versions may be inserted when QA requires them without changing the planned feature order.
