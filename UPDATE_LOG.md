# Realm Guard - Update Log

**Active development line:** rebuilt/tested branch  
**Foundry target:** VTT 13.351  
**Current GOLD baseline:** v1.0.8.3  
**Current QA build:** v1.0.8.44


## v1.0.8.44 - QA / Roll & Conflict Readability Polish

- Built from the active **v1.0.8.43 QA** package; v1.0.8.3 remains GOLD/public pending live QA.
- Fixes the v1.0.8.43 custom-dropdown positioning regression. Custom option menus now render as a document-level overlay so Foundry window transforms do not offset or distort the menu; the hidden native select remains the canonical form value.
- Keeps per-option hover explanations across RG/TB dropdowns while restoring stable selection, keyboard navigation, disabled-option handling and outside-click/scroll close behavior.
- Simplifies roll result cards to a clear **PASS / FAIL / TIE** headline plus a second line of **Success: X / Failed: X / Tiebreaker pending**.
- Reorganizes normal Skill and Ability rolls into labelled Dice Pool components, separate roll/reroll rows, resource/support notes and final counts. Beginner's Luck now exposes pre-half -> halved pool -> after-halving additions as separate readable entries.
- Rebuilds Conflict Action chat into clear side cards for opposition and Ranger, visible pools/successes/dice, a prominent action result, Disposition before -> after with delta, and collapsible technical/rules detail.
- Rebuilds Starting Disposition, Maneuver effect and Conflict Complete chat cards to use the same hierarchy.
- No rule-source change and no destructive migration.
- Test status: **QA**. Use `TEST_PROTOCOL_v1.0.8.44.md`.


## v1.0.8.43 - QA / Portrait Persistence, Context Help & Inspector Layout

- Built from the active **v1.0.8.42 QA** package; v1.0.8.3 remains GOLD/public pending live QA.
- Fixes Ranger portrait persistence: X/Y position, zoom and Fill/Fit framing are stored per Actor instead of snapping back on sheet reload.
- Adds explicit, non-destructive **Original Portrait / Token Portrait** mode. Original source art is preserved and each mode keeps separate framing.
- Token Builder now persists and reloads its last framing and records the generated token path for Token Portrait use.
- Adds system-wide custom RG/TB dropdown presentation with per-option hover explanations while retaining the native select value for existing form/event logic.
- Adds contextual hover help across Conflict planning/actions, Starting Disposition Method, Nature scope, Weapons/Tools, Tap Nature and Maneuver effects.
- Tap Nature Conflict eligibility is explicitly surfaced and retained on legal Skill/Ability tests; no-roll Fixed/Manual methods remain outside the Tap Nature procedure and Resources/Circles remain excluded.
- Direct Nature Conflict tests treat an added Nature rating as **Double-Tap Nature**: it is within-descriptors only, and half-Nature/no-descriptor opposition methods cannot Double-Tap.
- Canvas token hover temporarily reveals the token name.
- Rebuilds GM Quick Inspector metadata into separate identity/stats, resources, Conditions and action rows to stop visual overlap.
- Queues v1.0.8.44 cosmetic roll-card work: PASS/FAIL headline, `Failed: X / Success: X` second row, and clearer roll-detail grouping.
- No destructive migration.
- Test status: **QA**. Use `TEST_PROTOCOL_v1.0.8.43.md`.


## v1.0.8.42 - QA / Conflict Planning & GM Quick Inspector Refinement

- Supersedes the **v1.0.8.41 QA candidate** before formal protocol execution; v1.0.8.3 remains the GOLD/public baseline.
- Removes redundant Conflict Goal confirmation. Saving a GM/Opposition or Ranger Goal now marks that side **Ready** immediately; when both saved Goals are Ready, all clients advance automatically to Starting Disposition.
- Reworks Secret Planning presentation with progressive disclosure: large Action choices first, then Actor and Weapon/Tool controls only for populated slots. Action Guide and quick Weapon/Tool defaults are collapsed by default, Unarmed `-1D` is a single prominent slot warning, and locked plans reduce to compact summaries.
- Upgrades **GM Control > Selected Tokens** into a live **GM Quick Inspector**. Each selected Ranger/NPC exposes Sheet, Center, Quick Roll, Conditions and Token Builder actions without closing GM Control.
- Adds multi-select **Group Conditions** directly in the Quick Inspector while retaining the existing group Conditions/Resources dashboard tools.
- Quick Inspector reacts to canvas selection and selected Actor/Item updates so Condition status remains current during play.
- GM Quick Roll now supports both Rangers and NPCs through the Actor's normal roll methods.
- Carries forward every v1.0.8.41 hotfix: NPC Skill drop hardening, Starting Disposition/Beginner's Luck, Conflict Weapon/Tool engine, Obstacle Control, Actors-directory Ranger creation, portrait drop, resize/readability and all non-destructive behavior.
- Test status: **QA**. Use `TEST_PROTOCOL_v1.0.8.42.md`; do not continue the superseded v1.0.8.41 protocol.


## v1.0.8.41 - SUPERSEDED QA / Playtest Hotfix & Conflict Flow Hardening

- Superseded by v1.0.8.42 before formal protocol execution.
- Built from the published **v1.0.8.3 GOLD** baseline after a four-client exploratory playtest (3 Rangers + GM).
- Fixes NPC Skill drag/drop from Item/Starter Compendium. Root cause of the playtest "click forever" behavior was duplicate drop listeners accumulating after force-renders, so one physical drop could open several identical dialogs and stack several notifications. Drop listeners now bind once per rendered root and a drop-in-progress guard prevents duplicate delivery. Canonical 0D NPC Skills now use one purposeful **Set NPC Skill** dialog with a 1-6D rating instead of a Replace loop; the existing Skill is activated/updated in place and success no longer spams global notification banners.
- Deduplicates same-name Conflict Skill choices and supports untrained Conflict Skills through Beginner's Luck instead of 0D dead-ends.
- Rebuilds Starting Disposition around the normal roll engine: rolled successes + full base Ability, unique team Condition penalties, Beginner's Luck, Help, Traits, Wises, Persona, Tap Nature and Fate/Open 6s. Opposition additionally supports Calculated, Nature, Fixed and Manual Disposition modes plus fixed-mode supporting NPC modifiers.
- Adds transparent Starting Disposition chat breakdowns.
- Introduces an explicit Conflict flow: **Setup -> Goals & Stakes -> Starting Disposition -> Secret Planning -> Resolve -> Compromise**. Each side writes and readies its own Goal before disposition begins. Hidden-plan recovery remains defensive and Abort clears transient Conflict/tool state.
- Conflict Weapon/Tool handling is separated from physical Gear. Physical weapons appear only in Fight-style conflicts; other conflicts use saved/custom Conflict Tools. Each planned Action can choose its own Weapon/Tool. No valid tool applies the universal Unarmed `-1D` penalty.
- Adds Custom/Improvised Conflict Weapons/Tools with Conflict-type scoping, per-action use, `+D/-D`, conditional `+s`, unconditional `-s`, requirements, special text and temporary/permanent Actor storage. Temporary tools are cleaned up at Conflict end/abort.
- Corrects asymmetric Conflict success-modifier timing: positive `+s` can improve a successful/tied result but cannot rescue a lower raw Versus result; negative `-s` reduces successes before resolution.
- Makes the main Conflict Window manually resizeable, improves scroll safety, typography, spacing, current-step hierarchy and reduces stage clutter. Central Realm Guard dialogs are now resizeable. Uploaded decorative fonts are not bundled pending redistribution-license verification.
- Moves **Recruit Ranger**, **Create Ranger** and the Recruitment Guide into the Foundry Actors directory header; generic native Actor creation remains available to GM/admin users.
- Adds Owner-only Ranger portrait file-drop. Dropping an image updates only that owned Ranger's source portrait and never auto-creates a token; Token Builder remains explicit Save/Create.
- Moves **Obstacle Control** out of GM Control into its own GM Dock tool. Baseline now defaults to **Ob 2** in new worlds, Live OB is explicitly described as affecting currently open Baseline-linked rolls only, and the Automatic / GM Approval / Manual workflow modes now explain their behavior directly in the panel.
- GM Control Selected Tokens now refreshes live when canvas token selection changes.
- Preserves the v1.0.8.3 Token Builder/NPC Template workflow that received strong positive GM playtest feedback.
- Normal Skill cap remains Rating 6. Any future Rating-7 Talent support is deferred to the planned Traits/Talents expansion rather than opening the cap globally.
- No destructive Actor/World migration.
- Test status: **QA**. v1.0.8.3 remains GOLD until `TEST_PROTOCOL_v1.0.8.41.md` passes.




## v1.0.6 - QA - Playflow, Advancement & Conflict UX

- Feature-frozen QA build from v1.0.5 GOLD.
- Adds Ability Pass/Fail advancement, rebuilt Help Request/Synergy flow, Baseline Obstacle controls and simplified/hardened Conflict progression.
- Adds a compact **Conflict Action Guide** above planning cards with a short explanation of Attack, Defend, Feint and Maneuver plus each action's main strength and drawback.
- The guide is always visible during GM/Ranger planning and requires no hover or separate popup.
- Data migration: none destructive.
- Test status: `QA`; v1.0.5 remains GOLD until the full v1.0.6 live protocol passes.

## v1.0.5 - QA - Gameplay & UI Polish Hotfix

- Built from v1.0.4; verified GOLD baseline remains v1.0.3 until live QA passes.
- Makes Realm Guard / Torchbearer DialogV2 workflows non-modal so open system windows do not block the rest of Foundry.
- Adds Tap Nature to Beginner's Luck. Tap dice are added after halving, the separate 1 Persona Tap cost is enforced, and normal Within/Against Nature tax rules apply.
- Changes trained Skill advancement to automatic advancement immediately when the required Pass/Fail marks are satisfied. Removes the manual advancement button.
- Rebuilds Skill Advancement chat as a high-visibility congratulatory card.
- Keeps character Level Up immediate when progression thresholds are crossed; replaces the old pale notification with a large Level Up celebration and opens any unlocked Talent choice without delaying the level increase.
- Makes the GM Dock draggable, stores the position per User via a system flag and adds Reset Position.
- Adds a complete chat presentation fallback: every RG/TB-generated message uses a dark system surface, including Foundry's outer message wrapper, for reliable contrast in light and dark UI appearances.
- Carries forward v1.0.4 Recruitment House Rule UX.
- Data migration: none.
- Test status: `QA`; requires v1.0.5 focused live QA and representative regression.


## v1.0.3 - QA - GM Playtest hotfix

- Built from v1.0.2; internal system id remains `realm-guard`.
- Corrects Mouse Guard 2E Persona spending in supported roll dialogs: **0-3 Persona** may be committed for **+0D to +3D**, subject to available Persona. Tap/Double-Tap Nature costs remain separate and additive where applicable.
- Corrects Teamwork helper sources: a helper's Trait is no longer offered. An appropriate trained Skill may Help; a relevant Wise may contribute +1D through **I Am Wise**.
- Rewords Nature scope UI from ambiguous **Relationship** wording to **Test is: Within Nature descriptors / Against Nature descriptors**.
- Fixes one-Ranger End of Session Embodiment handling: the sole Ranger can receive Embodiment as a Foundry solo-play exception; the inherited 'not everyone' restriction remains for groups of two or more.
- Adds a generic high-contrast Realm Guard chat-card fallback for light Foundry chat themes, covering ADVANCEMENT and other system cards that are not normal roll cards.
- Retains v1.0.2 sidebar Manual UI and v1.0.1 Join Page / World Description behavior.
- Data migration: none. Existing Actors, Items, Scenes, Journals, Compendiums and progression are untouched.
- Rule-source change: alignment/hardening against Mouse Guard 2E Persona, Teamwork/Wises and Embodiment procedures; solo Embodiment is an explicit Foundry usability exception.
- Test status: `QA`; requires focused live tests plus representative regression.

## v1.0.2 - QA - Sidebar Manual UI hotfix

- Built from v1.0.1; internal system id remains `realm-guard`.
- Removes the floating pill-shaped **RG/TB** Manual launcher that could overlap Foundry's workspace/sidebar region.
- Adds an icon-only book button directly inside Foundry's sidebar tab strip, using Foundry's `ui-control` class plus narrow fallback sizing.
- Keeps the existing Manual & Rules Reference click behavior, tooltip and accessibility label.
- Retains v1.0.1 Join Page / World Description behavior unchanged; no automatic description seeding is included.
- Gameplay, Actors, Items, Journals, Scenes, Compendiums, progression and permissions are unchanged.
- Data migration: none.
- Rule-source change: none.
- Test status: `QA`; verify visual sidebar alignment, click behavior, reload persistence and representative v1.0.1 regression smoke tests.


## v1.0.1 - QA - World Description / Join Page hotfix

- Built directly from the approved v1.0.0 package for Foundry VTT 13.351.
- Version bumped to **1.0.1**; internal system id remains `realm-guard`.
- Removes the v1.0.0 CSS pseudo-element that attempted to inject a hard-coded system description into the Join Page.
- The Join Page now treats Foundry's native **World Description** field as the single source for World Info text.
- Adds defensive visibility/readability styling for `#world-description` and its rich-text children over the Realm Guard / Torchbearer background.
- An empty World Description remains empty; the system does not create, overwrite or mutate campaign description data.
- Existing background artwork, World title, Join controls and all gameplay/data-model code remain otherwise unchanged.
- Data migration: none.
- Rule-source change: none.
- Test status: `QA`; verify populated, formatted and empty World Description cases plus v1.0.0 regression smoke test.


## v1.0.0 - QA / Release Candidate - Final join-page presentation

- Same **v1.0.0** release line; no v1.0.1 bump.
- Adds dedicated Realm Guard / Torchbearer 1920x1080 world/login artwork under `assets/ui/realm-guard-torchbearer-world-bg.webp`.
- Adds the artwork to `system.json` as the default background for new Worlds using this system.
- Adds scoped Join Game CSS so launched Realm Guard / Torchbearer Worlds use the themed artwork instead of Foundry's generic default presentation.
- Adds a concise Join Game description explaining the deliberate Realm Guard + Mouse Guard RPG 2E + selected compatible Torchbearer 2E mix and clearly marked Foundry expansions.
- Existing campaign World content remains non-destructive; no Actors, Scenes, Journals, Items, Compendiums, folders, progression or ownership are reset/moved by this presentation change.
- All previously approved v1.0.0 release-gate checks remain the baseline; only final Join Game presentation needs visual confirmation.


## v0.25.0 - QA - GM Content Studio

- Built from verified **v0.24.0 GOLD** for Foundry VTT 13.351.
- Adds GM-only **Content Studio** as a dedicated GM Dock wand and a shortcut inside GM Control.
- Supports Create New and Duplicate & Modify for Ranger/Actor Templates, NPC/Creature Templates, Skills, Traits, Wises, Conditions, Gear/Weapons/Containers, Tokens of Power and Talents.
- Duplicate sources can come from World documents, Actor-embedded Items and Compendium entries. The source itself is never edited.
- Adds Realm Guard-aware type forms plus an explicit Review Before Create gate; Cancel before final confirmation creates no Actor, Item, folder or custom Compendium.
- Item destinations include World Items, selected Realm Guard Actor(s), recommended Realm Guard Custom Content Compendium and other writable world Item Compendiums. Actor templates support World Actors and writable Actor Compendiums.
- Recommended custom Item/Actor Compendiums are created on demand only, keeping GM-authored content separate from the eight Starter Packs.
- World Actor templates reuse/create PC or NPC Actor folders according to type.
- Duplicate mode removes Starter Library identity flags from the new copy. Volatile play state is reset where appropriate: Skill Learning marks, Condition active state, Gear placement, Token session use and Talent session/conflict use.
- Wises remain unrated and Wises 2.0 remains deliberately omitted.
- Content Studio Ranger/Actor mode is identified as an admin/template tool; Recruitment remains the authoritative normal PC creation flow.
- Existing v0.24.0 Actors, Items, Starter Compendiums and custom content are not migrated or rewritten.
- Test status: `QA`. Verified GOLD remains **v0.24.0** pending live `TEST_PROTOCOL_v0.25.0.md`.

## v0.24.0 - GOLD - Starter Compendiums

- Full v0.24.0 live QA protocol passed, including eight Starter Packs, entry counts, non-destructive missing-entry sync, representative imports, NPC Templates, Token/Talent content, Token of Power sheet relocation and v0.23.0 regression.
- No blocking or non-blocking issues were recorded in the approved protocol.
- Promoted **v0.24.0** to verified GOLD baseline.
- Test status: `PASS/GOLD`.


## v0.24.0 - QA - Starter Compendiums

- Built from verified **v0.23.0 GOLD** for Foundry VTT 13.351.
- Adds eight world-level Starter Compendiums: Skills, Traits, Wises, Conditions, Gear, Tokens of Power, Talents and NPC Templates.
- The first active GM automatically creates/seeds the Starter Library. A hidden world seed-version setting prevents routine reloads from repeatedly restoring deliberately removed entries.
- Adds a GM Dock **Starter Compendiums** tool with Open Library and explicit Add Missing Entries actions.
- Starter sync is non-destructive: it adds missing starter-key/name entries but does not update/overwrite existing documents.
- Starter library contains 35 Skills, 53 Traits, 101 Wises, 7 Conditions, 24 Gear entries, 4 Token of Power templates, 12 Talents and 8 NPC Templates.
- Wises stay unrated; no Wises 2.0 subsystem is introduced. NPC templates are marked as Foundry convenience baselines rather than canonical mandatory stat blocks.
- Moves the existing **Tokens of Power** panel from Character to the top of **Inventory & Gear**, above the paper-doll layout. Level & Talents remains on Character. Token mechanics are unchanged.
- Existing v0.23.0 Actors/Items and edited compendium entries are not reorganized or rewritten.
- Test status: `QA`. Verified GOLD remains **v0.23.0** pending live `TEST_PROTOCOL_v0.24.0.md`.

## v0.23.0 - GOLD - Levels & Talents

- Full v0.23.0 live QA protocol passed, including lifetime Fate/Persona spend tracking, Level math, Talent slot progression, built-in/custom Talents, session/conflict usage state, Conflict integration and v0.22.0 regression.
- No blocking or non-blocking issues were recorded in the approved protocol.
- Promoted **v0.23.0** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v0.23.0 - QA - Levels & Talents

- Built from verified **v0.22.0 GOLD** for Foundry VTT 13.351.
- Adds Ranger long-term progression as an explicit Realm Guard Foundry expansion: Level is driven by cumulative **Fate actually spent** and **Persona actually spent**, not XP or resources earned.
- Adds non-destructive Character progression fields: Level 1-10, Lifetime Spent Fate and Lifetime Spent Persona. Existing Rangers initialize safely at Level 1 / 0 / 0 because historical spend cannot be reconstructed reliably from prior builds.
- Adopts the Torchbearer 2E cumulative spend table as progression math only: L2 3 Fate / 3 Persona; L3 7/6; L4 14/9; L5 22/12; L6 31/16; L7 41/20; L8 52/24; L9 64/28; L10 77/32. Both thresholds are required.
- Does **not** import Torchbearer classes, Town/Camp/Grind, lifestyle, spell progression or class benefits. Level benefits in Realm Guard are project-defined Talents.
- Tracks committed Persona spend through supported standard rolls, Beginner's Luck, Recovery, Tap Nature/Double-Tap Nature and Conflict. Tracks committed Fate through Open 6s and supported Fate tie resolution.
- Cancelling before commitment, declining Fate, End-of-Session awards and manual resource +/- or GM Resource Admin changes do not increment lifetime spend.
- Adds GM-only **Progression Admin** for deliberate credit/correction of historical Lifetime Spent Fate/Persona; Level is re-derived from both totals rather than entered directly.
- Every Level from 2 through 10 unlocks one permanent Talent slot. Multiple unclaimed choices remain pending if a Ranger advances several Levels before choosing.
- Adds a dedicated `talent` embedded Item/data model with minimum Level, frequency (once/session, once/conflict, passive), link type (Skill, Ability, general/table-approved), automatic +D or manual effect, description and usage state.
- Adds a scrollable **Choose Talent** browser with twelve initial Ranger/Dunedain-flavoured once/session +1D Talent choices linked to existing Realm Guard Skills. Players can choose unlocked built-ins; Talent definitions remain GM-managed after assignment.
- Ranger sheet gains Level in the header plus a Level & Talents panel showing cumulative progress, next thresholds, pending choices and assigned Talent state.
- Talent selection is integrated into trained Skill/Ability rolls, Beginner's Luck, Recovery, Starting Disposition and Conflict Action rolls. Applicable automatic +D is included in the pool; manual Talents remain explicit table rulings.
- Beginner's Luck treats automatic Talent +D as pre-halving support; existing Persona/Fresh post-halving behavior is unchanged.
- Once/session Talent state resets when the GM starts the next End-of-Session cycle. Once/conflict state is keyed to the active Conflict id; passive Talents do not consume state.
- Existing v0.22.0 Token of Power, Recruitment, NPC/GM tools, Inventory, Conditions, Turns, Recovery, End Session and card-driven Conflict behavior remains in the regression gate.
- Roadmap shifts Starter Compendiums to v0.24.x and adds Talents to that pack scope; Content Studio moves to v0.25.x and the final pre-v1.0 audit/manual/hardening gate to v0.26.x.
- Rule-source change: deliberate project expansion approved by the project owner. Torchbearer 2E supplies only the cumulative spent Fate/Persona threshold model; Realm Guard/Mouse Guard remain authoritative for the rest of play.
- Test status: `QA`. Verified GOLD remains **v0.22.0** pending live `TEST_PROTOCOL_v0.23.0.md`.

## v0.22.0 - GOLD - Tokens of Power

- Full v0.22.0 live QA protocol passed with no blocking or non-blocking issues recorded.
- Verified Level 1/2/3 Token benefits, once/session state, Wise/Token reroll ordering, Specific Use/manual handling, Beginner's Luck, Recovery, Quick NPC Roll, Conflict integration, session recharge, Gear separation and v0.21.3 regression.
- Promoted **v0.22.0** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v0.22.0 - QA - Tokens of Power

- Built from verified **v0.21.3 GOLD** for Foundry VTT 13.351.
- Adds a dedicated embedded `tokenOfPower` Item/data model rather than overloading ordinary Gear.
- Token definitions store Name, Level 1-3, linked Skill or narrow Specific Use, automatic/manual effect handling, physical form, origin/craft, description and per-session used state.
- GM-managed Actor-sheet creation/definition: players can see and invoke assigned Tokens but are not given Token create/edit/delete controls on the Ranger sheet.
- Automatic level handling follows the Realm Guard Token text: Level 1 = +1D once/session; Level 2 = +1D on every appropriate check; Level 3 = failed-dice reroll once/session.
- Skill-linked Tokens are exact Skill matches. Specific-use Tokens are surfaced as TABLE CHECK because applicability is fictional/narrow and cannot safely be inferred by the system.
- Adds Manual Effect mode for bespoke written effects such as the source example `+1s disposition in Fight conflicts`; manual mode records/surfaces the Token without inventing a dice conversion.
- Integrates Token selection into normal Skill rolls, Automatic Versus, Beginner's Luck, Ability/Nature Specific-use rolls, Recovery, Quick NPC Roll, Starting Disposition and Conflict Action rolls.
- Level 3 rerolls use an after-roll confirmation so a player can keep the once/session power for later; dice already rerolled by a Wise are not silently rerolled a second time by a Token.
- Beginner's Luck treats Token +1D as trait-like pre-halving support; existing Persona/Fresh post-halving handling is unchanged.
- Conflict Window roll summaries identify the invoked Token and level. Conflict dialogs also surface the Realm Guard Scale of Might reminder.
- Scale of Might automatic rank conversion is deliberately not invented: the source clearly establishes that appropriate Tokens can raise effective rank, but does not provide a universal numeric conversion for every Token level/target pairing beyond examples. GM/table adjudication remains explicit.
- Starting the next End-of-Session cycle resets USED Level 1/3 Token state on Character and NPC Actors.
- No destructive Actor migration. Existing v0.21.3 Actors/Items/world data are preserved and no Tokens are auto-created or inferred from named Gear/House Insignia.
- Rule-source change: none. Realm Guard Token of Power and Power Against Power rules are implemented directly; Mouse Guard 2E is used only for inherited roll/reroll behavior where compatible.
- Test status: `QA`. Verified GOLD remains **v0.21.3** pending live `TEST_PROTOCOL_v0.22.0.md`.

## v0.21.3 - GOLD - NPC & GM Tools

- Full v0.21.3 live QA was approved by the project owner.
- Verified NPC/PC Actor-folder automation, Quick NPC Cancel/DataModel hotfix regression, GM Control actions, Quick NPC creation and v0.20.0 core regression.
- Final same-version refinement was manually verified as working: compact NPC Condition tiles and rank-aware default NPC Gear/loadouts.
- Promoted **v0.21.3** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v0.21.3 - QA - Automatic NPC/PC Actor folder placement

- Quick NPC-created Actors are placed directly in an Actor folder named **NPC**. If it does not exist, the Quick NPC process creates it automatically; an existing case-insensitive `NPC` Actor folder is reused.
- Recruitment-created Ranger Actors are placed directly in an Actor folder named **PC**. If it does not exist, the Recruitment process creates it automatically; an existing case-insensitive `PC` Actor folder is reused.
- Both chat-side **Create Ranger** and the **Create Ranger** action launched from Recruitment Guide use the same Recruitment creation path, so both receive the PC-folder behavior.
- Existing Actors are not moved or reorganized.
- Cancel remains side-effect free: Quick NPC cancellation runs before NPC-folder creation, while Recruitment cancellation exits before the final PC-folder/create stage.
- No NPC rules, Skill provisioning, Conditions, resources, Conflict logic or v0.20.0 GOLD behavior changed.

## v0.21.2 - QA - Quick NPC cancel/DataModel hotfix

- Fixes a Quick NPC cancellation bug where pressing **Cancel** could return a truthy DialogV2 action result and fall through into `Actor.create`.
- The bad fall-through produced undefined Actor name/stat values and Foundry `DataModelValidationError` messages for Actor name, stat maxima and prototype token name.
- Cancel now returns an explicit `{ cancelled: true }` sentinel and Quick NPC refuses any missing/non-object/cancelled result before Actor creation.
- Quick NPC numeric fields are normalized to integers before DataModel validation.
- No NPC rules, Skill provisioning, Conditions, resources, Conflict logic or v0.20.0 GOLD behavior changed.

## v0.21.1 - QA - GM Control action binding hotfix

- Fixes GM Control dashboard buttons appearing clickable but doing nothing.
- Root cause: v0.21.0 supplied a `render` callback to the DialogV2 constructor; in Foundry v13 that callback belongs to static DialogV2 wait/prompt helpers, so the in-content button listeners were never attached.
- GM Control now awaits ApplicationV2.render(), then binds Quick NPC, Quick NPC Roll, Conditions, Resources, Turn Manager and Conflict Window actions against `dialog.element`.
- No NPC rules, data model, resource logic, Conflict logic or v0.20.0 GOLD behavior changed.

## v0.21.0 - QA - NPC & GM Tools
- Built from verified v0.20.0 GOLD.
- Added a dedicated compact NPC Actor sheet with direct ability/Skill rolls, Conditions, Traits, Gear and GM Notes.
- Added GM Control to the existing global GM Dock.
- Added selected-token overview for Rangers/NPCs.
- Added Quick NPC creation with abilities, up to four trained starting Skills and optional standard Conditions.
- Quick NPC creation reuses canonical Skill Items safely instead of duplicating them.
- Added Quick NPC Roll for trained Skills and core abilities.
- Added single/group Condition shortcuts and group Fate/Persona/Checks administration.
- Added Turn Manager and active Conflict Window shortcuts to GM Control.
- Hardened structured-turn handling so NPC tests never consume Ranger Free Tests or Checks.
- Existing Actor/Item data is preserved; no destructive migration.
- Status: QA pending live Foundry test.

---

## v0.11.1 — QA · Rule-Aware Versus & Result Terminology
- Built from v0.11.0 QA while v0.10.2 remains the verified GOLD baseline.
- Replaced the old automatic Versus fallback that could choose an unrelated highest-rated opponent Skill.
- Roll Dialog now shows rule-aware opposition choices available on the targeted Actor.
- Explicit simple-versus mappings implemented from Mouse Guard / Realm Guard rules for Fighter, Scout, Persuader, Deceiver, Orator, Haggler, Hunter, Lore Master and Pathfinder.
- Target preview identifies the actual opponent Skill/Ability and rating before the roll.
- Chat now records the actual matchup (for example Fighter vs Fighter, Persuader vs Will, Hunter vs Nature).
- Skills without an explicit simple-versus rule only allow a matching trained Skill; no unrelated automatic fallback is invented.
- Exact Obstacle success now displays **PASS** (not PASS by 0).
- Positive/negative margins use rule terminology: Margin of Success / Margin of Failure.
- Versus ties display **TIE · Tiebreaker pending** and return `needsTiebreaker` metadata; full automated tie-break sequencing remains a later layer.
- No Actor data migration.
- Rule-source change: implementation aligned to current Mouse Guard 2E simple-versus rules plus Realm Guard Lore Master/Deceiver terminology.
- Status: `QA`.


## v0.11.0 — QA · Result & Margin (superseded by v0.11.1)
- Unified final result presentation for Skill, Ability and Automatic Versus rolls.
- Obstacle tests show PASS/FAIL margin from final successes versus Obstacle.
- Exact Obstacle success is PASS by 0.
- Automatic Versus shows PASS/FAIL by success difference; equal successes remain TIE with Margin 0.
- Final margin is calculated after Wise rerolls and Fate/open-six dice.
- Result methods now return margin/outcome metadata for later feature layers.
- No Actor data migration.
- Status: `QA / SUPERSEDED`.


## v0.10.2 — GOLD · Unified Recovery + Sheet Reorganization
- Condition Recovery tests now open the shared Roll Dialog before rolling.
- Recovery supports Modifier, Extra / Help Dice, Persona, Traits/Wises, Fate/open sixes and hard Cancel.
- Recovery ignores Injured/Strained penalties to the recovery test itself, preserving the existing recovery rule behavior.
- Character page now contains Belief/Goal/Instinct, Wises, Traits, Ranger Details & Relationships and Character Notes.
- Skills page remains dedicated to Roles & Skills.
- Third page is now Conditions & Gear.
- Roll Settings row includes quick navigation to Skills / Roles and Conditions & Gear.
- No Actor data migration; this is roll-flow and sheet-layout work.
- Status: `QA`.


## v0.10.1 — QA / Unified Ability Roll Dialog
- Nature, Will, Health, Resources and Circles now open the same pre-roll dialog flow used by trained Skills.
- Renamed `Extra Dice` to `Extra / Help Dice` in roll UI/chat reporting.
- Ability rolls support Obstacle, Modifier, Extra/Help Dice, Persona, Traits, Wises, applicable Conditions and Fate/open-six resolution.
- Ability rolls intentionally do not record Skill Learning marks.
- Modifier remains a separate signed GM/manual adjustment.
- v0.9.6 remains the GOLD baseline until this patch passes QA.


**Historical rebuild snapshot (superseded):** v0.16.0 GOLD / v0.18.5 QA at the time this section was written. The active status is the header at the top of this file.

> **Important:** Packages/files whose names begin with `OLD_` are **legacy reference material only**. They document ideas and previously implemented feature layers from the first fast-development branch, but their code and version state are not active. New versions must be built from the latest tested GOLD baseline and may reuse the old branch only as a design/reference source.

## Development policy

- Build one feature layer at a time from the latest verified baseline.
- Test each version before advancing.
- A blocking regression stops the version chain until fixed.
- Preserve existing Actor data unless an explicit migration is required.
- Realm Guard rules take precedence where they override Mouse Guard; Mouse Guard 2E supplies base mechanics where Realm Guard does not replace them.
- `OLD_` versions are not upgrade targets and must never replace the active branch.

---

# Active rebuilt / tested branch

## v0.18.6 — Hand UX + Cloak slot — QA
- Replaces `Hands · Worn` / `Hands · Carried` presentation with explicit **Left Hand** and **Right Hand** slots.
- Two-handed Gear (`Wield Hands = 2`) locks the opposite hand until moved/unequipped.
- Adds a dedicated **Cloak** body slot opposite Neck; cloak/cape/mantle Gear can be placed there.
- Adds a non-destructive migration from legacy v0.18.5 hand zones; any overflow is returned to Unassigned Gear rather than deleted.
- Existing Cloak Gear placed on Torso is moved to the new Cloak slot when that slot is free.
- No change to Recovery, Turn Manager, Conditions, resources or core roll rules.
- Test status: `QA`.

## v0.1.0 — Initial system foundation
- Character and NPC Actor types.
- Native Realm Guard character sheet.
- Roles/Skills as embedded Items.
- Rating plus Pass/Fail learning counters.
- Basic Role/Skill d6 rolls to chat.
- Versus checkbox foundation.
- Obstacle and Modifier controls.
- Fate and Persona counters.
- Conditions, Traits, Gear and Notes.

## v0.2.x — Native sheet rebuild & Foundry 13 hardening
### v0.2.3
- Ranger identity and core character data expanded.
- Resizable Actor/Item sheets.
- Responsive layout and vertical scrolling.
### v0.2.4
- Fixed Foundry 13.351 ApplicationV2 form handling.
- Removed nested forms and fixed action-handler receiver errors.
### v0.2.5
- Chat and sheet contrast/readability hardening.
### v0.2.6 — GOLD
- PASS/FAIL chat badges.
- Condition editing from Actor sheet.
- Wise description editing.
- Robust Notes/description fields.

## v0.3.1 — Versus per Skill & Advancement — GOLD
- Per-Role/Skill Versus checkbox with persistent state.
- Versus labeling in chat.
- Advancement readiness detection.
- ADVANCE raises rating and resets Pass/Fail counters.

## v0.4.2 — Automatic Versus + resource foundation — GOLD
- Automatic Versus against exactly one targeted token.
- Same-name opponent Skill used when available; fallback opponent handling retained.
- Explicit pre-roll Persona +1D.
- Fate/Open 6s resource flow.
- Resource validation and spend after committed roll.

## v0.5.3 — Roll Dialog — GOLD
- Native Realm Guard Roll Dialog.
- Base pool, Obstacle/Target controls and modifiers in one workflow.
- Persona/Fate selection before resolving the roll.
- Target preview and Versus integration.
- Fate decision flow refined so rolls can pause when a 6 is present and Fate is available.
- No Fate prompt when the Actor has no Fate.

## v0.6.1 — Traits & Wises in rolls — GOLD
- Traits and Wises available from Roll Dialog.
- Trait/Wise contribution shown in chat results.
- Existing Versus, resource and learning flows retained.

## v0.7.x — Conditions & Token HUD
### v0.7.1
- Conditions synchronized with Foundry Active Effects and token icons.
- Realm Guard Conditions control in Token HUD.
- Custom Conditions with description, icon and Roll Modifier.
### v0.7.2
- Fixed Foundry v13 Condition-menu interaction.
- Added custom Condition creation from HUD.
- Condition info/hover support.
### v0.7.3 — GOLD
- Replaced fragile Dialog event binding with delegated actions.
- Toggle/info/delete/default/custom/sheet actions stabilized.

## v0.8.x — GM Conditions, canonical Skills & sheet architecture
### v0.8.1
- Initial GM multi-token Group Conditions layer.
- ALL / PARTIAL / NONE group-state concept.
### v0.8.2–v0.8.4
- Canonical Realm Guard default Skills provisioned on new/existing Actors.
- Existing ratings and custom Skills preserved.
- Fixed provisioning timing and wiring bugs.
- Fixed wiring for GM Group Conditions.
### v0.8.5
- Character sheet split into three tabs:
  - CHARACTER
  - SKILLS
  - GEAR & RELATIONS
- Same Actor/data model retained; tabs are presentation only.
### v0.8.6
- Two-column full Skill layout tested and rejected as too dense.
### v0.8.7
- Returned full Skill rows to one-column presentation.
- Added Station/Rank dropdown: Recruit, Scout, Veteran, Captain, Lord.
- Station can apply starting Will, Health, Resources and Circles; Nature remains separate.
- Age range displayed for selected Station.
- Rating 0 Skills presented as UNTRAINED and blocked from normal advancement.
### v0.8.8
- Skills UI split into Trained/Custom and compact Untrained groups.
- Trained Skills retain full roll/Versus/learning controls.
### v0.8.9
- Trained/Custom and Untrained groups displayed side-by-side on wide sheets.
- Wises and Traits moved to CHARACTER tab.
### v0.8.10 — GOLD / Rule Alignment
- Added **Lore Master** to the canonical default Skill list.
- Realm Guard default **Sick** replaced by **Strained**.
- Strained rule description aligned to Realm Guard.
- Fate/Open 6s audited: recursive/open-ended sixes already work as required for one Fate spend.
- Clean-world test verified correct default Condition set and Lore Master provisioning.

**Current canonical default Conditions:** Angry, Strained, Tired, Hungry & Thirsty, Afraid, Injured, Fresh.  
`Fresh` is a Foundry convenience Condition rather than a Realm Guard rulebook Condition.

---


## v0.9.1 — Condition Targeting & Recovery — QA
- Built from v0.8.10 GOLD; OLD v0.9.0 used only as design reference.
- Conditions now carry `appliesTo` targeting metadata; active modifiers affect only matching Skill rolls.
- Roll Dialog previews only active Conditions that affect the selected Skill.
- Automatic Versus now applies relevant Condition modifiers to both acting and targeted Actors.
- Condition editor exposes affected-roll targeting plus configurable manual / Ability / Role-Skill recovery.
- Active Conditions gain a Recovery button on the Character sheet.
- Successful recovery automatically clears the Condition; failed recovery leaves it active.
- Canonical recovery defaults aligned to the current rule sources: Angry = Will Ob 2, Tired = Health Ob 3, Injured = Health Ob 4, Strained = Will Ob 4; Hungry & Thirsty remains manual/acquisition-oriented at this layer.
- Injured and Strained target Skills plus Nature/Will/Health; their penalties do not affect recovery tests.
- No Turn/Check economy or recovery-order enforcement yet; those remain a later feature layer.
- Data migration: existing canonical default Conditions are enriched with v0.9.1 targeting/recovery metadata without replacing custom Conditions.
- Rule-source change: none; this implements already-audited Mouse Guard 2E recovery rules plus Realm Guard Strained override.
- Test status: `QA`.

---


## v0.9.2 — QA / Token Condition Hover Fix
- Fixed Condition tooltip binding on Foundry VTT 13 token effect icons.
- Rebinds Condition effect sprites after token draw/refresh/hover and ActiveEffect changes.
- Hardened pointer-coordinate handling for Foundry/PIXI pointer events.
- Token Condition tooltip now shows:
  - Condition description
  - Roll impact
  - Affects-rolls scope
  - Recovery method / Obstacle
  - Recovery note when configured
- No Actor data migration.
- No rule-source change; this is UI/interaction hardening of the v0.9.1 Condition layer.
- Test status: `QA`.



## v0.9.3 — QA / Condition Row Layout Fix
- Fixed active Condition rows wrapping the Edit action onto a second blank row.
- Consolidated Recovery and Edit controls into a single non-wrapping action cluster.
- Active and inactive Conditions now use the same stable two-column row structure.
- Added responsive sizing for narrow Actor sheets.
- No Actor data migration.
- No rule-source change; UI-only fix.
- Test status: `QA`.

## v0.9.4 — QA / Learning & Advancement 2.0
- Added per-roll **Count for Learning** toggle, default ON.
- PASS/FAIL marks are only recorded when Learning is enabled.
- Added visual Pass/Fail progress bars and retained manual correction controls.
- Advancement now occurs immediately when requirements are met, matching Mouse Guard advancement timing.
- Advancement resets marks and posts a chat announcement.
- Rating 6 is capped and displayed as MAX 6.
- Automatic Versus ties now display TIE and do not earn an advancement mark.
- Untrained Skill / Beginner's Luck learning remains deferred to its dedicated later layer.
- Test status: `QA`.


## v0.9.5 — QA / Advancement Ready UX
- Replaces immediate automatic Skill advancement with an explicit Ready-to-Advance action.
- When Pass/Fail requirements are met, a pulsing gold `A` button appears beside the Skill row actions.
- Clicking `A` raises Rating by 1, resets Pass/Fail marks, updates requirements and posts an advancement message to chat.
- Rating 6 remains capped and displays MAX 6.
- Manual Pass/Fail correction immediately affects whether the `A` button is shown.
- No Actor data migration.
- No rule-source change; this is a deliberate Foundry UX choice for transparent advancement confirmation during QA.
- Test status: `QA`.


## v0.9.6 — QA / Roll Cancel, Learning Persistence & Condition Dialog Fixes
- Built from v0.9.5 QA after reported live-test failures.
- Roll Dialog Cancel is now a hard abort: no roll, chat message, resource spend, Learning mark, Condition resolution or Versus resolution.
- Learning marks now persist through Actor embedded-Item updates and the sheet refreshes immediately so progress and READY/A state are visible.
- Automatic Learning marks stop at the current advancement threshold; excess automatic marks are not accumulated while a Skill is READY.
- Condition menu is now singleton per Actor: reopening focuses the existing window instead of spawning duplicates.
- Condition menu position is clamped to the viewport after rendering/reopening.
- No Actor data migration.
- No rule-source change; bugfix/hardening only.
- Test status: `QA`.


## v0.9.6 — GOLD / Bugfix hardening
- Roll Dialog Cancel/X performs a hard abort with no roll or state mutation.
- Learning Pass/Fail persistence repaired and READY thresholds hardened.
- Condition menu singleton/focus and viewport positioning repaired.
- Full v0.9.6 QA protocol passed.
- Promoted to GOLD baseline.

## v0.10.0 — QA / Roll Resources & Extra Dice
- Added explicit **Extra Dice** field to the Roll Dialog.
- Extra Dice are additive dice for the current test only and do not modify Actor/Skill data.
- Added roll-pool breakdown in chat for Base, Modifier, Extra Dice and Persona.
- Added explicit **Resources spent** reporting for Persona and Fate.
- Extra Dice are supported by both standard/manual tests and Automatic Versus.
- Existing Condition, Trait/Wise, Fate/Open 6s, Versus and Learning flows retained.
- No Actor data migration.
- Rule-source change: none; this is roll-workflow/UI infrastructure.
- Test status: `QA`.


## v0.11.2 — QA / Versus Tie Resolution
- Compact TIE result presentation; no vertical word-breaking.
- First tie now follows Mouse Guard 2E resolution order: Trait in opponent's favor, unused Fate on 6s, then tiebreaker roll.
- Tiebreaker chooses Health for physical Skills and Will for mental/social Skills; Will/Health tie into Nature, Nature tie into GM-selected Will/Health.
- Second ties support Trait/Fate and fall back to GM win/GM decision per opponent ownership.
- Tie Learning semantics aligned: Trait break = original Skill FAIL, Fate break = original Skill PASS, tiebreaker = no original Skill mark.
- Known rules gap: core Ability advancement counters are not yet implemented, so tiebreaker ability advancement is not recorded yet.
- Test status: `QA`.


## v0.12.2 — QA / Responsive Trained Skills consistency
- Built from v0.12.1 QA; no gameplay or Actor-data changes.
- Applied the same responsive strategy to **Trained & Custom** that v0.12.1 introduced for Untrained Beginner's Luck cards.
- At medium sheet widths, trained Skill cards keep name/rating/Versus on the top row while Pass/Fail tracks and correction controls reflow into stable compact rows.
- Advancement/Edit/Delete actions stay aligned instead of colliding with learning tracks.
- Very narrow sheets tighten the same layout without hiding functionality.
- Two-column Trained/Untrained layout is retained where space allows; the existing container-width fallback still stacks the major columns when narrow.
- Test status: `QA`.

### v0.13.0 — Help / Teamwork — QA
- Built from v0.12.3 GOLD.
- Roll Dialog now discovers other Ranger tokens on the active scene as potential helpers.
- Each helper can contribute one accepted source (trained Skill or Trait) for +1D.
- Teamwork dice are tracked separately from manual Extra Dice.
- Chat cards name each helper, source and contribution.
- Teamwork works with normal Skill/Ability rolls, Automatic Versus and Beginner's Luck.
- Beginner's Luck includes Help before halving; Persona remains after halving.
- Recovery restrictions and deeper Suggested Help validation remain future rule-hardening items; v0.13.0 requires table/GM adjudication of whether a chosen source is appropriate.
- No Actor-data migration.
- Rule basis: Mouse Guard 2E Teamwork/Beginner's Luck plus Realm Guard's inherited core where not replaced.
- Status: QA.

# Legacy OLD_ branch — reference roadmap only

The following describes functionality that existed or was planned in the original rapid-development branch. **Do not treat these packages as current builds.** Each layer must be re-evaluated against the active code, the current sheet architecture and the rule sources before being rebuilt.

## OLD v0.9.0 — Condition targeting & Recovery
- Condition applies-to targeting for specific Skills/stats.
- Applicable Condition preview in Roll Dialog.
- Opponent Condition modifiers in Versus.
- Manual/configured recovery tests and automatic Condition clearing.

## OLD v0.10.0 — Learning & Advancement 2.0
- Automatic Pass/Fail registration.
- Per-roll Count for Learning.
- Advancement progress visualization and chat notification.
- Manual correction controls.

## OLD v0.11.0 — Roll resources & Extra Dice
- Dedicated Extra Dice field.
- Explicit per-roll resource spending and resource-change chat reporting.

## OLD v0.12.0 — Target Number
- Explicit Target Number normal-test model.
- Separate Target Token Versus model.
- Margin shown in chat.

## OLD v0.13.0 — Custom Roll
- Chat-side Custom Roll.
- Manual Base Dice / Target Number / Modifier / Extra Dice.
- Actor-linked Persona, Fate, Traits, Wises, Conditions and optional Learning.
- Custom Versus.

## OLD v0.14.0 — Untrained Skills / Beginner's Luck foundation
- Dedicated untrained Skill learning track.
- Rating 0 Skill Items.
- Transition from untrained to trained Skill.

## OLD v0.15.0 — Help / Teamwork
- Other scene Actors as helpers.
- Helper source and contribution recorded in chat.

## OLD v0.16.0 — Nature System
- Roll Nature workflow.
- Nature Versus.
- Tap Nature / Nature Tax support.

## OLD v0.17–v0.18 — End of Session
- Shared End of Session workflow.
- Belief / Goal / Instinct review.
- Fate/Persona awards.
- GM approval model and optional player self-approval.

## OLD v0.19.0 — Realm Guard rules audit
- First hack-specific rules pass.
- Strained replacing Sick.
- Tokens of Power concept.
- Some old assumptions were later superseded by the current rule-source audit.

## OLD v0.20.0 — Mouse Guard 2E core-rule audit
- Persona 0–3D spend model.
- Fate/Open 6s.
- Unrated Wises with Pass/Fail/Fate/Persona marks.
- Trait levels/use-against/Checks.
- Beginner's Luck using Will/Health and halving.
- Tap Nature / Acting Against Nature.
- Rule-based End of Session awards.

## OLD v0.21.0 — Recovery, Turns & Wise Rewards
- Turn Manager.
- Recovery order and per-turn recovery tracking.
- Condition-specific recovery tests.
- Wise reward cycle.

## OLD v0.22.0 — Players' Turn / Checks 2.0
- Per-Ranger free Players' Turn test.
- Additional tests spend Checks.
- No-two-tests-in-a-row rule except solo play.
- Check donation, Done/Ready state and unused-Check cleanup.
- Trait-against Checks restricted to GM Turn.

## OLD v0.23.0 — NPC & GM Tools
- Compact NPC sheet.
- Quick NPC creator and Quick NPC Roll.
- GM Control panel.
- Group resource adjustment and shortcuts.

## OLD v0.24.0 — Starter Compendiums
- Skills, Traits, Wises, Conditions, Gear, Tokens of Power and NPC Templates.
- Non-destructive seeding.

## OLD v0.25.0 — Create Ranger Wizard
- Guided multi-step Ranger creation.
- Skills, Traits, Wises, BGI, relations, gear and review.

## OLD v0.26.0 — Content Studio / old feature freeze
- Semi-guided creation and duplication of Realm Guard content.
- World / Actor / Compendium destinations.
- Preview before creation.

## OLD v0.27.0 — Foundry 13.351 audit / old pre-1.0 gate
- Compatibility hardening and syntax validation.
- Full core-loop live-test checklist.
- No new gameplay feature in the old branch.

The old v0.27 test documentation describes the intended broad pre-1.0 core loop: Ranger creation, standard and Versus rolls, Persona/Fate, Traits/Wises/Teamwork, Beginner's Luck, Nature, Conditions/Recovery, Turns/Checks, Custom Roll, NPC/GM tools, End of Session, Content Studio and starter Compendiums.

---

# Deferred / post-v1.0 ideas

These are deliberately not required to reach the first stable 1.0 unless later testing proves one is necessary:

- User-configurable drag-and-drop sheet panel layout.
- Deeper rule-reference/tooltips and illustrated manual integration.
- More extensive automation beyond the core playable rules.
- Expanded content libraries and templates.
- Additional GM quality-of-life tooling.

---

# Maintenance rule for this log

Every new package must add an entry here before it is handed off for testing. Entries should record:

1. Version number.
2. Feature/fix scope.
3. Data migration, if any.
4. Rule-source change, if any.
5. Test status: `DEV`, `QA`, `PASS/GOLD`, or `REJECTED/ROLLED BACK`.

This file is the development history. It is **not** a substitute for the version-specific QA checklist.

## v0.12.0 — Beginner's Luck / Untrained Skills — QA
- Built from v0.11.2 GOLD.
- Rating 0 Skills now roll through Beginner's Luck instead of being blocked.
- Physical Skills use Health; mental/social Skills use Will; custom/unclassified Skills ask and persist the choice.
- Beginner's Luck halves the pre-Persona pool and rounds up; Persona is added after halving.
- Dedicated attempt track: pass/fail does not matter. Required attempts equal current maximum Nature (current Nature value until Nature Tax exists).
- LEARN control converts a completed untrained Skill to Rating 2 and normal 2 Pass / 1 Fail advancement.
- Beginner's Luck can use the existing rule-aware Versus opposition flow.
- Data model adds `beginnerAbility` and `beginnerAttempts` to Role Items; existing Role data is preserved.
- Custom Roll remains deliberately deferred to post-v1.0 backlog.
- Test status: QA. GOLD remains v0.11.2 until approved.

## v0.12.1 — Beginner's Luck Responsive Layout — QA
- Built from v0.12.0 QA; v0.11.2 remains the current GOLD baseline.
- Fixes the v0.12.0 Untrained Skill overlap at normal/narrow Actor-sheet widths.
- Keeps the two-primary-column Skills design on wide/medium sheets.
- Untrained Skills now use a coherent two-line card: Skill/actions on top; Beginner's Luck metadata below.
- Uses sheet-width container queries so narrow Actor sheets stack Trained and Untrained groups even on a wide desktop viewport.
- No gameplay/rule/data-model change; Beginner's Luck mechanics are unchanged.
- Test status: QA.

## v0.12.3 — QA / Skills Page Layout Consolidation
- Built from v0.12.2 QA; v0.11.2 remains the current GOLD baseline.
- Replaces the side-by-side Trained-vs-Untrained page split with a stacked architecture.
- TRAINED & CUSTOM now spans the full Skills page and displays Skill cards in two columns.
- UNTRAINED sits below a visual divider and also displays in two columns.
- Narrow sheet widths collapse both sections to one column using sheet-width container queries.
- Trained Skill actions are consolidated on the top row: Versus, Advance (when ready), Edit and Delete.
- PASS/FAIL progression remains on the dedicated second row.
- No gameplay, rule or Actor-data migration in this patch; Beginner's Luck mechanics remain unchanged.
- Test status: QA.

## v0.13.0 — GOLD / Help & Teamwork
- v0.13.0 passed version-specific QA and is the GOLD baseline for v0.14.0.

## v0.14.0 — GOLD / Nature System
- Nature tracks Current / Maximum and Tax.
- Dúnadan descriptors: Tradition, Family, Grief.
- Within/Against Nature direct tests, Tap Nature, Double-Tap Nature, Nature Versus, Nature Tax and manual recovery/depletion workflow.
- Beginner's Luck requirement now reads Maximum Nature instead of taxed Current Nature.
- Rule basis: Realm Guard v1.6 Nature descriptors/usage guidance and Mouse Guard 2E Nature/Tax/Tap/Double-Tap rules.
- Test status: PASS/GOLD.

## v0.15.0 — QA / End of Session Core — SUPERSEDED
- Built from v0.14.0 GOLD.
- Introduced the first GM-controlled shared End of Session workflow across participating character Actors.
- Added Belief / Goal / Instinct review, Fate/Persona award criteria, GM approval, Finish Session reward application, chat summary and duplicate-session-cycle protection.
- Initial QA exposed UI placement/readability issues in the GM entry point and final chat presentation.
- No Actor data migration. Internal world settings only: End of Session cycle/finalized state.
- Test status: `QA / SUPERSEDED by v0.15.1`. GOLD remains v0.14.0.

## v0.15.1 — GOLD / End of Session GM Dock & UX Polish
- Built from the v0.15.0 End of Session layer while v0.14.0 remains the verified GOLD baseline.
- Removes End Session from Ranger sheets and from Token/Scene Controls.
- Adds an expandable, GM-only **Realm Guard GM Dock** anchored beside Foundry's macro Hotbar.
- First dock tool is a flag icon with hover text **Start End Session**; players do not see the dock and cannot start the workflow.
- Keeps the shared group End of Session review with participating Rangers and their Belief, Goal and Instinct.
- Fate rewards: acted on Belief, worked toward but did not accomplish Goal, played Instinct; max 3/session.
- Persona rewards: accomplished Goal, played against Belief, MVP, Workhorse, Embodiment; max 4/session.
- UI explicitly separates **MVP**, **Workhorse**, and **Embodiment** and explains each award.
- Enforces one MVP, one Workhorse, MVP != Workhorse, and Embodiment not awarded to everyone.
- Keeps independent GM approval for Fate and Persona, duplicate-cycle protection and Start Next Session.
- Reworks the final End of Session chat card for compact, high-contrast readability in Foundry's narrow/light sidebar.
- No Actor data migration. Rule source unchanged: Mouse Guard 2E End of Session / Earning Fate / Earning Persona; Realm Guard does not replace these reward rules.
- Player self-approval remains deferred.
- Test status: `PASS / GOLD`. Full v0.15.1 live QA passed, including Start Next Session and duplicate-cycle protection.

## v0.16.0 — GOLD / Turn Manager Core & Checks Economy
- Built from verified v0.15.1 GOLD.
- Adds **Turn Manager** to the GM-only Realm Guard GM Dock.
- GM controls the global phase: **GM Turn** or **Players' Turn**.
- Character sheets show current turn phase and Players' Turn status.
- Starting Players' Turn gives every participating Ranger one Free Test.
- The first committed test consumes the Free Test automatically; additional tests consume 1 Check.
- Enforces the no-two-tests-in-a-row Players' Turn rule when more than one active Ranger can act; solo play is exempt.
- Adds Check passing/donation to a patrol-mate with no Checks, plus Done/Discard state.
- Ending Players' Turn and starting GM Turn clears unused Checks.
- Trait Against modes are exposed in the Roll Dialog: -1D for +1 Check, or opponent +2D in a Versus test for +2 Checks. Checks are awarded only during GM Turn.
- Turn spending is recorded on Realm Guard chat roll cards.
- Existing End of Session, Nature, Beginner's Luck, Teamwork, Conditions, Versus and advancement flows remain in place.
- No Actor data migration; turn state uses world settings and Actor flags.
- Rule-source change: Mouse Guard 2E Players' Turn / Trait Check economy implemented where Realm Guard does not override it.
- Deferred at the time: full rule-ordered Recovery 2.0 remained planned for the next dedicated layer. The later proposed Wise Reward/Wises 2.0 expansion was subsequently removed from the active pre-v1.0 roadmap at GM request.
- Test status: `PASS / GOLD`. Full v0.16.0 live QA passed, including GM/Players' Turn switching, Free Tests, Checks, Trait Against, donation, Done/Discard, End of Session regression and core regression.

## v0.17.0 — QA / Recovery 2.0 + Condition Rules + Fresh — SUPERSEDED
- Built from verified v0.16.0 GOLD.
- Adds ordered canonical recovery: Hungry & Thirsty → Angry → Tired → Injured → Strained.
- Adds one recovery attempt per Condition per Turn; changing phase starts a new Turn cycle and resets the attempt gate.
- Players' Turn recovery uses v0.16.0's normal Free Test → 1 Check economy and alternation guard.
- GM Turn recovery is a special 2-Check purchase.
- Successful recovery clears the Condition; failed recovery leaves it active and does not create an extra twist/Condition.
- Hungry & Thirsty supports Resources Ob 1 plus trained Cook/Brewer/Baker Ob 1 methods when available.
- Realm Guard Strained remains the authoritative Sick replacement: -1D to Nature/Will/Health/Skills, Will Ob 4 recovery, no penalty to its recovery test.
- Supplementary Torchbearer-compatible hardening: Afraid uses Will Ob 3 and blocks Help/Beginner's Luck; Angry blocks beneficial Trait/Wise effects.
- Fresh becomes functional: +1D to tests except Resources/Circles; Beginner's Luck applies Fresh after halving. Fresh cannot coexist with another active Condition.
- Afraid is intentionally supplemental and does not alter/block the established Realm Guard canonical recovery-order chain.
- Existing canonical default Condition rule metadata/text is synchronized; custom Conditions and Actor data are preserved.
- No Wise Reward cycle in this build. The previously proposed Wises 2.0 / additional Fate-Persona Wise expansion is not part of the active pre-v1.0 roadmap; existing Wise functionality remains unchanged.
- Rule-source change: Realm Guard/Mouse Guard recovery remain primary; compatible Torchbearer 2E condition/Fresh rules are supplementary only where they do not conflict.
- Test status: `QA / SUPERSEDED by v0.17.1`. GOLD remains v0.16.0.

## Roadmap decision — Wises expansion removed
- The previously planned **Wises 2.0 + additional Fate/Persona Wise uses** layer is removed from the active pre-v1.0 roadmap at GM request.
- Existing Wise functionality remains in place and is not expanded unless explicitly requested later.
- Version sequence after v0.18.x is renumbered: **v0.19.x Recruitment 2.0 / Create Ranger / Natural Talent**, then **v0.20.x Full Conflict Engine**.

## v0.17.1 — QA / Optional Turn Manager + Recovery 2.0
- Built from v0.17.0 QA; verified GOLD baseline remains v0.16.0.
- Adds a world setting: **Use GM Turn / Players' Turn Manager** (default ON).
- Structured mode ON preserves the full v0.16/v0.17 Turn economy: GM Turn, Players' Turn, Free Tests, Checks, alternation, Pass Check, Done/Discard, Trait Against Check earning and turn-scoped Recovery costs/attempt limits.
- Free Play mode OFF hides the Turn Manager tool from the GM Dock and hides the turn-status strip from Ranger sheets.
- In Free Play, normal Skill/Ability/Nature/Beginner's Luck/Versus rolls do not consume Free Tests or Checks and are not blocked by alternation/Done state.
- In Free Play, Recovery still uses condition order, methods, Obstacles and success/failure effects, but does not charge GM/Players' Turn Checks/Free Tests and does not enforce the turn-scoped one-attempt gate because no Turn cycle exists.
- In Free Play, Trait Against still applies its dice/opponent penalty but does not award Checks.
- Toggling the setting resets transient turn-cycle/last-actor state without deleting Actor Checks or other resources, so switching modes is non-destructive.
- End Session remains independent and stays available in the GM Dock.
- No Actor data migration. Existing turn flags/check values are preserved and simply ignored while Free Play is active.
- Test status: `QA / ROLLED FORWARD into v0.18.0`. v0.17.1 was intentionally not promoted separately; its behavior must pass the v0.18.0 regression gate. GOLD remains v0.16.0.


## v0.18.0 — QA / Inventory & Gear 2.0
- Built from v0.17.1 QA by explicit project decision; verified GOLD baseline remains v0.16.0.
- Extends Gear Item data non-destructively with inventory placement, slot size, bundle size, wield-hands and container metadata.
- Replaces the old flat Gear list with a structured Inventory workspace while preserving all existing Gear Items as Unassigned until placed.
- Adds capacity-aware body zones: Head 1, Neck 1, Hands Worn 2, Hands Carried 2, Torso 3, Belt 3, Feet 1 and Pocket 1.
- Adds sheet-local drag/drop between body zones, containers and Unassigned Gear.
- Belt accepts only single 1-slot items; two-handed gear can reserve both carried-hand slots through Wield Hands = 2.
- Adds Backpack preset (2 Torso slots / 6 pack slots), Satchel preset (1 Torso slot / 3 pack slots) and configurable Custom containers.
- Backpack/Satchel containers are usable only while equipped on Torso and only one of those two types can be equipped at once.
- Container deletion safely unassigns its contents instead of leaving them silently lost; missing-container references are surfaced as repairable orphan warnings.
- Inventory warnings identify over-capacity locations/containers without deleting data.
- Rule-source change: Realm Guard remains primary and still does not require common clothing/backpacks to be recorded. Torchbearer 2E is used only as the approved supplementary model for slot locations, carried/worn/pack storage, backpack/satchel capacity and belt/pocket handling.
- Deliberately deferred: cache system, container damage/lost-content twists, nested containers, Torchbearer backpack Skill penalties, and automatic gear bonuses to rolls/conflicts.
- v0.17.1 Optional Turn Manager + Recovery 2.0 is included unchanged and is part of the v0.18.0 live regression gate.
- No destructive Actor migration. Existing Gear data is preserved; new inventory fields receive safe defaults.
- Test status: `QA`. GOLD remains v0.16.0 until v0.18.0 passes its complete live protocol.

## v0.18.1 — QA / Inventory layout polish
- Cosmetic-only follow-up to v0.18.0 Inventory & Gear 2.0.
- Reworked the CONDITIONS & GEAR page into a responsive two-column workspace on wide sheets: Conditions in a compact left rail and Inventory & Gear in the larger right workspace.
- Inventory body/location cards now use two wider columns instead of four cramped columns, improving item names, slot usage and action readability.
- Responsive fallback stacks the page into one column on narrower sheet widths.
- No inventory rules, capacities, drag/drop logic or Actor/Item data model changed.
- Test status: QA.


## v0.18.2 — QA / Inventory test gear + thematic Actor art
- Follow-up to v0.18.1 before full live Inventory QA.
- Adds a GM-only temporary **Test Gear** creator on the Inventory header. It creates a deterministic QA gear set and does not affect normal Ranger creation or gameplay data unless explicitly clicked.
- Adds original Realm Guard thematic art assets for Character/NPC portraits and prototype tokens.
- Adds world setting **Default Realm Guard Actor Art**: Northern Ranger, Mouse Ranger, or Foundry Default.
- New Actors only replace Foundry placeholder art; custom art is preserved. NPCs use a Realm Guard creature placeholder when thematic art is enabled.
- Adds per-Actor palette action to apply Northern Ranger, Mouse Ranger or Foundry default portrait/prototype-token art to existing Actors. Existing placed Scene tokens are not overwritten.
- No Inventory rules, slot capacities, Turn Manager, Recovery, roll logic or Actor resource rules changed.
- Test status: `QA`. GOLD remains v0.16.0 until the carried v0.17.x + v0.18.x live protocol is approved.

## v0.18.3 — QA / Approved Visual Identity + Inventory Polish
- Built from v0.18.2 QA; verified GOLD baseline remains v0.16.0 while v0.17.1/v0.18.x are tested cumulatively.
- Implements the approved Realm Guard mockup direction without replacing the existing rules/data model: dark carved frame, brass/forest accents and parchment work surfaces.
- Adds a Realm Guard crest/lockup and **Rangers of the North** subtitle to the Ranger sheet header.
- Conditions & Gear receives the strongest visual pass: parchment panels, olive section headers, condition icons, clearer active-condition treatment, and thematic gear-card icons.
- Reorganizes Inventory on wide sheets into an equipped/container workspace plus a dedicated **Unassigned Gear** rail; responsive layouts collapse safely at narrower widths.
- Keeps the v0.18.2 GM-only **Create Test Gear** helper and actor/token art picker.
- Art labels are clarified to **Middle-earth Inspired** and **Mouse Guard Style**; Middle-earth remains the default and Foundry Default remains available.
- Adds a one-time safe visual migration for existing Realm Guard Actors that still use Foundry mystery-man placeholders: only placeholder portrait/prototype-token art is replaced; custom art is preserved.
- Inventory rules, capacities, placement validation, Turn Manager, Recovery and gameplay Actor/Item data are unchanged by this visual patch.
- Test status: `QA`.


## v0.18.4 — QA / Inventory QA visibility + Token HUD cleanup
- Built from v0.18.3 QA; verified GOLD baseline remains v0.16.0 while the cumulative v0.17.x/v0.18.x layer is tested.
- Adds an idempotent GM-visible world Items folder **Realm Guard - QA Test Gear** containing 17 deterministic Gear templates for Inventory testing.
- Keeps the sheet-local QA helper, renamed **Load QA Gear**, which creates Actor-embedded copies on the open Ranger and now explicitly points the GM to the world Items library as well.
- QA Gear templates use a Realm Guard-owned Gear icon so they are visually identifiable in Foundry's Items directory.
- Hides Foundry's redundant **Status Effects** shortcut on Realm Guard Character/NPC Token HUDs. The Realm Guard Conditions HUD shortcut remains available.
- This UI cleanup does not remove Foundry Active Effects, token condition icons, Realm Guard Condition Items, custom Conditions, recovery rules or group-condition tooling.
- No Inventory rules, capacities, Actor data, roll logic, Turn Manager/Free Play logic or Recovery mechanics changed.
- Test status: `QA`. v0.18.3 is superseded for live testing by v0.18.4.


## v0.18.5 — QA / Paper-Doll Inventory UI
- Built from v0.18.4 QA; verified GOLD baseline remains v0.16.0 while the cumulative v0.17.x/v0.18.x layer is tested.
- Redesigns only the third Ranger-sheet page (**CONDITIONS & GEAR**) into the approved paper-doll direction; Character and Skills pages are not redesigned.
- Adds an original Realm Guard human Ranger silhouette with the existing inventory zones positioned around the body: Head, Neck, Hands Worn, Hands Carried, Torso, Belt, Pocket and Feet.
- Compresses Conditions into the left rail and moves active/inactive Containers directly underneath Conditions.
- Gives Unassigned Gear a dedicated right-hand rail and keeps drag/drop back to Unassigned as the unequip path.
- Adds a small placement guide beneath the silhouette so Wielded/Torso/Belt/Pocket/Container roles are visible without opening documentation.
- Responsive fallback removes the silhouette at narrow sheet widths and stacks the same real inventory zones as normal cards; no item placement data is lost.
- Existing v0.18.4 QA Items library and Token HUD Status Effects cleanup are retained unchanged.
- No Actor/Item migration and no change to capacities, placement validation, container rules, Turn Manager/Free Play, Recovery, rolls or resources.
- Test status: `QA`. v0.18.4 is superseded for live testing by v0.18.5.


## v0.18.7 — QA / Global Conditions Menu + Condition Icon Polish
- Removes the redundant QUICK navigation controls above the primary sheet tabs.
- Adds a global **Conditions** control beside Roll Settings with an active-condition count.
- Conditions open in a compact sheet-level dropdown available from Character, Skills and Inventory & Gear. Toggle, Recovery, info/edit, Defaults and Custom actions remain available.
- Removes the permanent Conditions rail from the inventory page; the third tab is renamed **INVENTORY & GEAR** and Containers now own the left rail.
- Replaces generic letter/symbol Condition icons with distinct thematic SVG art for Angry, Tired, Strained, Hungry & Thirsty, Afraid, Injured and Fresh.
- Existing canonical default Conditions refresh to the new icon paths during safe rule-alignment enrichment; custom Condition icons are preserved.
- v0.18.6 Left/Right Hand, two-hand lock and dedicated Cloak slot remain unchanged.
- No gameplay/rule, inventory-capacity, Turn Manager, Recovery, roll or Actor-resource change.
- Test status: `QA`. GOLD remains v0.16.0 pending cumulative live approval.


## v0.18.8 - QA / Character Page Cleanup
- Removes the redundant Ranger-sheet Roll Settings / Obstacle / Modifier strip. Roll Dialog becomes the only visible place for per-roll Obstacle and Modifier choices, opening at Obstacle 1 / Modifier 0.
- Keeps the global Conditions dropdown in a compact standalone tool strip above the main tabs.
- Removes Cloak and Weapon from Ranger Details because Gear now belongs on the Inventory & Gear page. Legacy `system.cloak` / `system.weapon` data remains preserved and is not migrated or deleted.
- Adds Biography / Background, Lineage / House and House Insignia to visible Ranger Details.
- Expands visible Relationships to Parents, Senior Artisan, Mentor, Friend / Ally and Enemy / Rival. Existing Mentor, Enemy and Parents values remain in place; new fields are additive.
- No change to inventory mechanics, Recovery, Turn Manager / Free Play, Conditions, Nature, resources, advancement or roll resolution.
- Test status: `QA`. GOLD remains v0.16.0 pending cumulative live approval.

## v0.18.8 - GOLD / Character Page Cleanup + Cumulative v0.17-v0.18 Gate
- v0.18.8 passed its complete live protocol with no blocking or non-blocking issues recorded.
- The cumulative v0.17.1 -> v0.18.8 branch passed, including Optional Turn Manager / Free Play, Recovery 2.0, Fresh/Angry/Afraid behavior, Inventory & Gear 2.0, the paper-doll equipment UI, Left/Right Hand + 2H lock, dedicated Cloak slot, global Conditions menu, thematic Condition icons, QA Gear library, Token HUD cleanup, Character-page relationship/detail cleanup and core roll/session regression.
- Promoted verified GOLD baseline from v0.16.0 to **v0.18.8**.
- No additional migration beyond the already-tested non-destructive v0.17/v0.18 migrations.
- Test status: `PASS/GOLD`.

## v0.19.0 - QA / Recruitment 2.0 + Built-in Recruitment Guide
- Built from verified **v0.18.8 GOLD** for Foundry VTT 13.351.
- Adds chat-side **Create Ranger** and **Recruitment Guide** entry points.
- Adds GUIDED and QUICK character-creation modes; both use the same rule validation while GUIDED includes explanatory rule prompts.
- Implements Realm Guard Recruitment Station/Age/Will/Health and base Resources/Circles values for Recruit, Scout, Veteran, Captain and Lord.
- Implements the six Dunadan Nature questions from base Nature 3, including the associated starting-Trait restrictions.
- Implements the eight Realm Guard Homeland packages, each granting one Homeland Skill check and one Homeland Trait check.
- Implements Life Experience: Area of Natural Talent, Parents' Trade, Convincing Others, Apprenticeship, Mentor Training, Experience Gained in Service and Specialty.
- Service check budgets are Station-driven and allow specialization through repeated checks; starting Skill ratings are tallied as checks + 1 with maximum rating 6.
- Specialty is omitted for Recruits and checked against existing wizard-created Rangers so two player Rangers cannot intentionally receive the same Specialty.
- Implements Station-based Recruitment Wise-check selection. By explicit project/GM decision, numeric Wise ratings / Wises 2.0 remain omitted; the allocation is stored as Actor Recruitment metadata while unique Wise Items use the existing unrated data model.
- Implements Recruitment Resources/Circles questions and their Trait restrictions; Character Resources/Circles schema maximum support increases to 10 so valid creation outcomes above 6 are not clipped. Will/Health remain capped at 6. Existing Character/NPC Resources/Circles max fields below 10 migrate upward non-destructively; current values are not changed.
- Implements Homeland/Innate/Recruit-only/Captain-Lord Trait checks, with duplicate checks stacking into Trait level and level capped at 3.
- Guides and stores Lineage, House Insignia, Parents, Senior Artisan, Mentor, Friend and Enemy. Mentor rule is shown by Station and requires explicit player confirmation. Enemy people choices exclude creatures of the Enemy.
- Implements BGI and starting Gear handoff into the existing Inventory system: selected weapon, optional armor and comma-separated distinctive Gear. Ordinary backpacks/clothing/boots are not auto-added by Recruitment.
- New Rangers start with Fate 1 and Persona 1.
- Wizard creation suppresses normal createActor default-Skill/default-Condition provisioning hooks for that one create call, then provisions canonical Skills and Conditions deterministically once, preventing duplicate embedded Items.
- Stores Recruitment provenance in Actor flags: version, Specialty, Skill checks, Wise checks, Nature answers, Resources answers, Circles answers and Mentor-rule confirmation.
- Rule-source change: none. This feature implements already-selected source precedence: Realm Guard Recruitment first; Mouse Guard 2E only where Realm Guard explicitly inherits base mechanics.
- Test status: `PASS/GOLD`. Live `TEST_PROTOCOL_v0.19.0.md` passed completely with no blocking bugs. One non-blocking UX note was recorded: the browser-native Wise datalist was searchable by typing but its full suggestion list was not conveniently scrollable.

## v0.19.1 - QA / Recruitment Wise Picker UX
- Built from verified **v0.19.0 GOLD**.
- Replaces the browser-native Wise datalist with a normal scrollable example selector for each Recruitment Wise check.
- Keeps a separate custom Wise text field beside each selector; custom text takes priority and normalization still appends `-wise` when omitted.
- Repeated Wise selections still stack Recruitment checks in metadata without creating duplicate Wise Items.
- No rule-source change and no changes to Recruitment math, Wises scope, Actor data model, Inventory, Conditions, Recovery, Turn Manager, rolls or End Session.
- Test status: `QA`. GOLD remains v0.19.0 pending the focused v0.19.1 live check.

## v0.19.1 - GOLD / Recruitment Wise Picker UX
- The focused v0.19.1 live QA protocol passed.
- Recruitment Step 6 now uses scrollable example selectors with separate custom Wise input while preserving the existing unrated Wise data model and Recruitment metadata behavior.
- No Recruitment rule math, Actor migration, Inventory, Conditions, Recovery, Turn Manager, roll or End Session regression was introduced.
- Promoted **v0.19.1** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v0.20.0 - QA / Card-driven Full Conflict Engine
- Built from verified **v0.19.1 GOLD** for Foundry VTT 13.351.
- Adds **Open Conflict Engine** to the GM-only Realm Guard Dock and enables the system socket channel for synchronized multiplayer Conflict state.
- Adds a shared draggable/minimizable **Conflict Window** for the GM and participating Ranger owners.
- Introduces visually distinct action-card families: dark red/black GM cards and green/gold Ranger cards, including distinct hidden card backs.
- Implements Conflict setup with type, opposition Actor, participating Rangers, Conflict Captain and both sides' stated goals.
- Implements Realm Guard starting Disposition mappings; Fight Creature GM NPCs can use Nature + Nature and Other conflicts expose a GM-selected base Ability.
- GM privately scripts and locks three actions first. The Conflict Captain then privately scripts three Ranger actions and assigns each action to a Ranger.
- Hidden card identities are not written to the public conflict world state. GM locked plans persist in GM client-private settings; Ranger drafts remain local until submission.
- Enforces Ranger action rotation: no two actions in a row for the same Ranger when the team has alternatives, and patrol members behind in action count must act before another Ranger advances again.
- Implements Attack / Defend / Feint / Maneuver Independent, Versus and Trumped interaction matrix.
- Implements Realm Guard action-Skill mappings, including inherited Mouse Guard Journey/War cells referenced by Realm Guard.
- Allows Dunadan Nature on an action when an appropriate descriptor genuinely applies and explicitly warns against Nature mongering.
- Enforces Realm Guard Lore Master Minor Mysteries: an Actor's Lore Master can be assigned to only one action category during a conflict.
- Adds per-exchange **Conflict weapon** selection from supported weapons actually held in the Actor's hand slots, preventing simultaneous stacking of multiple weapon qualities.
- Implements core conflict weapon qualities for Axe, Bow, Halberd, Whip/Hook and Line, Shield, Sling, Spear, Staff and Sword where directly representable in the current Gear model.
- Bow/Sling Missile modifies Attack-vs-Attack to Versus when selected. Sword Useful locks its +1D to one chosen action for the fight.
- Complex Knife special handling, environmental Bow Fragile handling and unstructured creature natural-weapon qualities remain table/Modifier adjudication in v0.20.0 QA.
- Conflict roll dialog supports applicable Conditions, Persona, Fate/Open 6s, Traits, existing Wises and Ranger Teamwork without consuming Players' Turn Free Tests/Checks; action rolls cap Teamwork at two helpers while starting Disposition can receive team-wide help.
- Resolves Independent and Versus tests into Disposition changes; deferred Versus ties pause the conflict instead of silently advancing or recording Learning.
- Implements Maneuver Impede, Gain Position, Disarm and margin-3 Impede + Gain Position. Disarm disables an equipped Gear Item for the conflict.
- Implements one Pass/Fail Learning mark per trained Skill per Actor per conflict.
- Stops immediately when either side reaches 0 Disposition and presents winner/tie plus compromise tier and GM/table outcome notes.
- No core Actor schema migration. Conflict state uses hidden client state plus synchronized world state; existing v0.19.1 Actor and Item data are preserved.
- Rule source: Realm Guard v1.6 takes precedence; Mouse Guard 2E supplies inherited Conflict sequencing/action interactions where Realm Guard does not replace them.
- Test status: `QA`. Verified GOLD remains **v0.19.1** until live Conflict QA passes.
### v0.21.3 - QA refresh / compact NPC sheet + rank-aware default loadouts
- Kept the same **v0.21.3 QA** version while live testing continues; no version bump was made for this in-progress UX/content refinement.
- Replaces the wrapping NPC Condition chip cluster with a compact two-column tile grid using the existing thematic Condition icons. Toggle, active state, Recovery and Edit remain available inline; narrow sheets fall back to one column.
- NPC Gear rows now show a useful visual icon and current inventory placement (Right Hand, Left Hand, Torso, Head, Cloak, Belt, etc.).
- Quick NPC adds **Default Gear / Loadout** with Auto plus explicit presets. Auto interprets Type/Rank keywords and assigns a table-ready equipment package; unknown ranks intentionally receive no automatic Gear.
- Auto examples: Captain/Leader -> Sword, Shield, Mail Shirt, Helmet, Cloak; Scout/Hunter -> Bow, Dagger, Cloak; Soldier/Guard -> Spear, Shield, Mail Shirt; Veteran/Elite -> Sword, Shield, Mail Shirt, Helmet; Raider/Brigand -> Axe, Shield, Leather Armor; Creature/Natural -> no Gear.
- Auto-created Gear is normal editable/deletable Realm Guard Gear and is placed into existing Inventory zones so Conflict weapon selection can see held weapons. Loadouts are GM convenience presets and do not change source rules.
- Existing NPCs are not retroactively equipped and their data is not rewritten.
- Test status: `QA`; verified GOLD remains v0.20.0.

## v0.25.0 - GOLD / GM Content Studio
- Full v0.25.0 live QA passed with no blocking bugs or recorded UX notes.
- Content Studio create/duplicate flows, type-aware authoring, Review Before Create, all destinations, Starter identity safety, volatile-state resets and v0.24.0 regression were verified.
- Promoted **v0.25.0** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v0.26.0 - QA / Pre-v1.0 Audit, Manual & Hardening
- Built from verified **v0.25.0 GOLD** for Foundry VTT 13.351.
- Feature freeze maintained: no new major tabletop subsystem.
- Adds an integrated **Realm Guard System Manual** available to all users from chat-side Realm Guard tools and to GMs from the GM Dock.
- Ships the same operational guidance in `SYSTEM_MANUAL.md`, including World backup/server-transfer guidance clarifying that the system package and campaign World data are separate.
- Adds GM-only **World Health Audit**, a read-only structural diagnostic for versions, Actor Skill/Condition duplicates, resource/Ability bounds, Ranger progression consistency, two-hand inventory conflicts, Talent/Token configuration and all eight Starter Compendiums.
- Audit can post a compact chat summary but never moves, deletes, resets or repairs World content.
- Hardens Starter Compendium document-class fallback by guarding the global `getDocumentClass` lookup through `globalThis`, avoiding an undeclared-global ReferenceError path.
- Adds responsive styling for the Manual and Audit windows.
- Establishes the final whole-system v1.0 release gate: clean-world onboarding, v0.25 GOLD upgrade preservation, multiplayer privacy/permissions, complete gameplay regression, UI review and recommended World-transfer smoke test.
- Data-preservation rule remains strict: existing Actors, Items, folders, Scenes, Journals, Compendiums, progression and campaign state must survive the upgrade unchanged except for previously approved non-destructive migrations.
- Test status: `QA`. Verified GOLD remains **v0.25.0** until the v0.26.0 release-gate protocol passes.

## v0.26.0 - GOLD / Pre-v1.0 Release Gate
- Full v0.26.0 live release-gate protocol passed in Foundry VTT 13.351.
- Upgrade/data-preservation, integrated manual, World Health Audit, clean-world onboarding, Recruitment, core rolls, Conditions/Recovery, Turns, Inventory/Tokens, Levels/Talents, multiplayer Conflict privacy, NPC/GM tools, Starter Compendiums, Content Studio, End Session, responsive UI/permissions and World-transfer smoke testing were all approved.
- No blocking bugs or non-blocking UX notes were recorded in the approved gate.
- Promoted **v0.26.0** to the final verified 0.x GOLD baseline and approved v1.0 release preparation.
- Test status: `PASS/GOLD`.

## v1.0.0 - QA / Realm Guard / Torchbearer First Release Candidate
- Built from verified **v0.26.0 GOLD** for Foundry VTT 13.351.
- Changes visible system title from Realm Guard to **Realm Guard / Torchbearer** while deliberately keeping internal Foundry system id `realm-guard` to preserve existing World compatibility.
- Expands the system description to state the deliberate rule mix: Realm Guard first, inherited Mouse Guard RPG 2E core mechanics, selected compatible Torchbearer 2E ideas, plus explicitly identified Foundry expansions.
- Adds a persistent global **RG/TB Manual** button for all users so the manual can be opened without returning to chat or the GM Dock.
- Expands the integrated System Manual into both operational Foundry guidance and a practical Rules Reference.
- Adds visible Rules Reference labels: **RULE**, **AUTOMATED**, **GM CALL**, **RG/TB FOUNDRY**.
- Adds shared v1.0 Rules Reference definitions covering core tests, Learning/Beginner's Luck, Nature, Traits/Wises/Help/resources, Turns/Checks/Recovery, Inventory/Tokens, Conflict, Recruitment, End Session, Levels/Talents and the automation boundary.
- On first GM load, non-destructively creates a player-readable **Realm Guard / Torchbearer - Rules Reference** Journal in a matching Journal folder if the reference does not already exist. Existing reference content is not overwritten during normal load.
- Adds `RULES_REFERENCE.md` and updates `SYSTEM_MANUAL.md` for the v1.0 identity, rule-source explanation, global help flow and Journal reference.
- Aligns World Health Audit version/branding to v1.0.0.
- Updates major visible Ranger/NPC/Item header branding and Conflict card backs to Realm Guard / Torchbearer without changing Actor/Item schema or gameplay mechanics.
- No destructive data migration and no new major tabletop subsystem.
- Test status: `QA / RELEASE CANDIDATE`. Verified GOLD remains **v0.26.0** until `TEST_PROTOCOL_v1.0.0.md` passes.

## v1.0.0 - final Join Game presentation correction (same release version)
- Kept version **1.0.0**; no 1.0.1 patch was created.
- Replaced the earlier Join Game artwork with the approved ultra-wide Realm Guard / Torchbearer release composition chosen during final QA.
- Corrected Join Game alignment for the approved ultra-wide artwork and hides the redundant World title/core footer over the artwork while preserving those values in Foundry data.
- Added a robust system-owned About Realm Guard / Torchbearer description overlay in the World Description panel, with the artwork itself retaining the same description as a visual fallback.
- No Actor, Item, Scene, Journal, Compendium, progression, Conflict, Recruitment or other campaign data is changed.

### v1.0.0 final Join Page presentation correction
- Kept release version at **v1.0.0** (no patch bump).
- Replaced the Join Page background with pure artwork containing no baked-in menus, text, logo, buttons or footer.
- Restored Foundry's real editable World title instead of hiding it behind artwork branding.
- Added a CSS-level Realm Guard / Torchbearer system-information fallback to the live World Description panel when World description data is empty.
- Added the project homepage URL for the future GitHub distribution repository: `https://github.com/GuteboysFactory/RealmGuard-Torchbearer`.
- Manifest/download release URLs remain intentionally unset until the GitHub Release asset is published.

### v1.0.0 - Join Page World Description selector correction (same release version)
- Live Foundry 13.351 QA confirmed the themed background was correct but the system-description fallback remained invisible.
- Corrected the Join Page fallback from the generic `.right::after` target to Foundry's actual `#world-description::after` panel selector.
- The game description is now provided by the system stylesheet on the pre-login page, where system runtime JavaScript cannot be relied upon.
- No World data is modified; a GM-authored World Description remains intact and the system information is appended visually beneath it.
- Version remains **1.0.0**.

## v1.0.3 - GOLD / GM Playtest Hotfix
- Full v1.0.3 focused live QA passed in Foundry VTT 13.351.
- Persona 0-3D, Skill/Wise Teamwork, Nature wording, solo Embodiment and theme-independent chat contrast all passed.
- Regression smoke passed for Conditions, Fate/Open 6s, Learning/Advancement, Recovery, Inventory, Create Ranger and End Session.
- No blocking bugs or non-blocking notes were recorded.
- Promoted **v1.0.3** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v1.0.4 - QA / Recruitment Enemy House Rule
- Built from verified **v1.0.3 GOLD** for Foundry VTT 13.351.
- Keeps the printed Realm Guard personal-Enemy restriction as the default Recruitment behavior.
- Adds explicit opt-in **Allow Servants of the Enemy as personal Enemies (House Rule)** in Recruitment Step 9.
- When enabled, Orc, Troll, Warg and Spider can be selected as the recurring personal Enemy.
- Renames the ambiguous Enemy `People` field to **Enemy's People / Type** and adds explanatory copy.
- Stores the opt-in choice in Actor Recruitment metadata as `recruitmentEnemyHouseRule`.
- No Actor schema migration and no changes to existing Actors or Worlds.
- Test status: `QA`. Verified GOLD remains **v1.0.3** until focused live QA passes.

## v1.0.5 - GOLD / Gameplay & UI Polish Hotfix
- Built for Foundry VTT 13.351 and includes the v1.0.4 Recruitment Enemy House Rule UX.
- Makes Realm Guard / Torchbearer DialogV2 workflows non-modal so open system windows no longer block normal Foundry interaction.
- Corrects Beginner's Luck so Tap Nature is available where legal, with Nature dice added after Beginner's Luck halving and normal Persona/tax handling preserved.
- Restores automatic trained-Skill advancement when Pass/Fail requirements are met and removes the manual Advance control.
- Rebuilds Skill Advancement and Level Up chat output as dark, high-contrast celebratory cards and completes a broader dark-surface audit for RG/TB-generated chat messages.
- Keeps Character Level advancement immediate when cumulative spent Fate/Persona crosses a threshold and opens an available Talent choice without delaying the Level increase.
- Makes the GM Dock draggable, saves its position per user, constrains it to the visible viewport and provides Reset Position.
- Carries forward and verifies the opt-in Recruitment House Rule allowing Servants of the Enemy as personal Enemies while keeping printed-rule choices as the default.
- Full v1.0.5 live QA and regression smoke passed with no blocking bugs or non-blocking notes.
- Promoted **v1.0.5** to verified GOLD baseline.
- Test status: `PASS/GOLD`.

## v1.0.6 - QA / Playflow, Advancement & Conflict UX
- Built from verified **v1.0.5 GOLD** for Foundry VTT 13.351 after the v1.0.6 feedback window was explicitly closed and feature-frozen.
- Adds non-destructive Actor-flag Pass/Fail tracking for Nature, Will, Health, Resources and Circles, with automatic immediate advancement and special Maximum-Nature handling.
- Beginner's Luck remains on its dedicated attempt track and does not advance Will/Health.
- Teamwork UI now distinguishes normal Skill/Ability Help from **I Am Wise**; helper Traits remain excluded.
- Adds selected Torchbearer-inspired **Synergy** as an RG/TB option: choose before the helped roll; a resolved result spends 1 helper Fate and marks Pass/Fail on the helping Skill/Ability; unresolved ties retain Fate.
- Adds live **Baseline Obstacle** and Obstacle workflow mode to GM Control: Baseline auto-use, optional GM approval with live player-dialog sync, or manual per-roll control.
- Adds source-backed Ob difficulty guidance and preserves rule-specific Versus/Resources/Circles behavior rather than forcing every test through Baseline.
- Hardens Conflict hidden-plan state with an in-session private fallback cache; missing private plan data safely resets the exchange to planning instead of leaving a stuck `Actions Locked` state.
- Removes normal manual Reveal-step friction: locking both plans auto-reveals Action 1 and resolved actions auto-reveal the next action when safe.
- Adds Conflict current-step guidance, reduces planning-card clutter during resolution and adds compact Exchange History.
- Adds contextual help text/tooltips and explicit disabled-resource reasons across the edited roll UI.
- Fixes the remaining `Manage Nature` modal regression; normal RG/TB windows remain non-modal.
- No destructive Actor/World migration. New Ability-learning data uses `flags.realm-guard.abilityLearning` and is created only as needed.
- Rule-source change: adopts the selected Torchbearer 2E Synergy mechanic as an explicit RG/TB option; Ability advancement and Ob scale/factoring behavior follow the existing Mouse Guard 2E inheritance unless Realm Guard overrides.
- Test status: `QA`. Verified GOLD remains **v1.0.5** until `TEST_PROTOCOL_v1.0.6.md` passes.
### v1.0.6 - QA revision / Player-driven Help Request
- Kept release version at **v1.0.6** because the build is still in live QA and this work repairs/rebuilds the already frozen Help/Teamwork scope rather than adding a post-freeze feature.
- Replaces the acting player's per-helper dropdown configuration with a single **Ask for Help** action in normal Roll Dialogs.
- Active Ranger players receive their own non-modal Help Request and choose the Actor/source they actually use to Help.
- Accepted Help is synchronized back to the acting player's still-open Roll Dialog and appears automatically in the read-only Help Dice total and accepted-helper list.
- The acting player may continue configuring the roll and may roll without waiting for unanswered Help requests. Pending requests close when the roll dialog is committed or cancelled.
- Normal Skill/Ability Help and **I Am Wise** remain distinct; helper Traits are excluded and Afraid Rangers are not eligible.
- **Synergy** is now selected on the helper's own client and is explicitly bound to the helper Actor, chosen Skill/Ability and helper Fate, eliminating ambiguity about whose Fate is used.
- No Actor/World migration and no change to the v1.0.6 feature freeze.



## v1.0.7 - Flexible Test Engine & GM Flow (QA)
- Built from v1.0.6 GOLD.
- Added Custom Roll / Flexible Test Engine.
- Added Change Live Roll OB with live socket sync to open Baseline-linked Roll Dialogs and Reset to Baseline.
- Removed manual untrained Skill LEARN gate; learning is automatic at the Beginner's Luck threshold with a celebration card.
- Made Roll Modifier read-only with automatic effect breakdown.
- Added red/green/starred dice presentation.
- Added Smart NPC Drag & Drop and NPC Template image-drop Quick Spawn.
- QA hotfix: NPC image-drop now creates the required Foundry Data upload directories one level at a time before FilePicker upload, with a verified flat fallback path if nested creation is unavailable.
- Added step-by-step Conflict roll/result chat cards.
- No destructive Actor/Item migration.


## v1.0.7.1 - GOLD / v1.0.7 QA hotfix baseline
- v1.0.7 feature layer plus the NPC image-drop upload-folder hotfix passed the dedicated live Foundry 13.351 QA protocol.
- Custom Roll, Live Roll OB sync, automatic untrained Skill learning, Smart NPC Drag & Drop, NPC Templates/image Quick Spawn and step-by-step Conflict chat were verified.
- No blocking bugs remained at promotion.
- No destructive Actor/World migration.
- Test status: `PASS/GOLD`.

## v1.0.8 - Rules, NPC & Token Polish (QA)
- Built from verified v1.0.7.1 GOLD.
- Corrects beneficial Character Trait automation to Mouse Guard 2E: Level 1 +1D once/session, Level 2 +1D twice/session, Level 3 +1s on relevant passed/tied tests; Level 1/2 use state resets when End Session is finalized.
- Trait Against remains separate; Wises remain unrated and are not incorrectly limited to one use per session.
- Conflict rolls use the same Trait session-use enforcement.
- Tokens of Power retain Realm Guard-specific level rules; no Token rules are migrated into Character Trait logic.
- Fixes duplicate NEW SKILL LEARNED chat publication with a per-client in-flight guard plus a single requester/authority owner for multi-client auto-learning.
- Removes the redundant top-row Help Dice display; Teamwork remains live/automatic in its own section. Extra Dice is documented as manual/situational only; Modifier stays read-only automatic.
- Adds Quick Token Builder for Rangers/NPCs with drag positioning, zoom, Center/Fit/Fill, size and portrait source.
- NPC Template image-spawn now creates centered 1x1 aspect-safe prototype tokens by default.
- Polishes NPC header/resources/statbar/quick tools/drop hint/responsive layout.
- No destructive Actor/World migration; Trait use state is stored in `flags.realm-guard.traitSessionUses`.
- Rule-source change: Character Trait benefit automation is corrected to inherited Mouse Guard 2E. Realm Guard Token of Power rules remain separate.
- Test status: `QA`. Verified GOLD remains v1.0.7.1 until `TEST_PROTOCOL_v1.0.8.md` passes.

### v1.0.8 QA hotfix - Token Builder persisted round output
- Token Builder now renders and uploads a real circular PNG instead of only previewing a round crop.
- Drag/zoom/fit changes are baked into the saved token image.
- Save can update matching tokens on the current Scene immediately (enabled by default) while also updating the Actor prototype token.
- NPC Template image-drop now attempts to generate the same round token asset automatically; the portrait remains intact if token generation fails.

### v1.0.8.1 QA hotfix - Token persistence and Roll Dialog grouping
- Supersedes the v1.0.8 QA candidate without changing the verified GOLD baseline (v1.0.7.1).
- Token Builder Save now persists the visual adjustment as a generated circular PNG, updates the Actor prototype token, and can update matching tokens on the current Scene.
- NPC Template image-drop uses the same generated round-token asset for the prototype token while retaining the original uploaded portrait.
- Rebuilt the standard Roll Dialog core row into three coherent groups: Obstacle, Modifier (automatic), and Extra Dice.
- Obstacle live/baseline status and difficulty guidance remain attached to the Obstacle group; automatic modifier breakdown remains attached to Modifier; manual/situational guidance remains attached to Extra Dice.
- Added responsive grouping so wide dialogs do not visually detach labels from their controls.
- No destructive Actor/World migration.
- Test status: QA. v1.0.7.1 remains GOLD until `TEST_PROTOCOL_v1.0.8.1.md` passes.


## v1.0.8.2 - QA hotfix / Manual Token Framing & NPC Conditions
- Supersedes the v1.0.8.1 QA candidate; verified GOLD remains v1.0.7.1 until live QA passes.
- Token Builder now always starts from the full Actor portrait source. A generated token image is treated as output, not as the next editable crop source.
- Dragging moves the complete source image behind the round guide; zoom range is expanded and preview/final rendering use the same normalized offsets.
- Center, Fit, Fill, drag and zoom are non-destructive preview actions. Actor prototype-token data and Scene tokens change only after **Create / Save Token**.
- NPC Template image-drop no longer auto-commits a round token. It creates the NPC and portrait first and leaves final framing to the GM in Token Builder.
- NPC Conditions on the compact side column now use a readable single-column layout with full labels and aligned action controls.
- Carries forward the v1.0.8.1 Roll Dialog grouping hotfix and all v1.0.8 rules/polish work.
- No destructive Actor/World migration.
- Test status: QA.


### v1.0.8.3 QA hotfix - NPC Layout & Token Portrait
- Moved GM Notes into the left NPC column beneath Quick Skills and constrained it to a compact editable panel instead of spanning the full sheet width.
- Token Builder remains preview-only until Create / Save Token is pressed.
- On explicit Token Builder save for NPCs, the generated circular PNG now becomes both prototype-token art and the NPC Actor portrait.
- Preserves the original full source artwork in `flags.realm-guard.tokenBuilderSourcePortrait` so later Token Builder sessions can reframe from the source image.

### v1.0.8.41 QA refinement - Dialog readability
- Raised the typography floor across Recruitment, GM Control, Obstacle Control, Conflict and roll dialogs after multiplayer playtest feedback that table-facing text was too small.
- Increased labels, explanatory microcopy, button text, controls and Conflict hierarchy rather than only enlarging headings.
- Increased default Recruitment, GM Control and Obstacle Control widths to preserve whitespace with the larger type.
- Recruitment Step 9 now separates **Parents** into side-by-side **Mom** and **Dad** fields while preserving a combined legacy `system.parents` value and dedicated Recruitment metadata for compatibility.
- Simplifies **Custom Roll** to open directly as **Free Dice Pool**; linked Skill/Ability choices are removed because standard rolls already have dedicated automated controls.
