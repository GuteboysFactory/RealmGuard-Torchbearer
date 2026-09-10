# Realm Guard / Torchbearer - System Manual

**Release:** v1.0.8.44 QA  
**Foundry target:** VTT 13.351  
**Internal system id:** `realm-guard`

## What this system is

Realm Guard / Torchbearer is a private Foundry VTT game system built from a deliberate mix of rules rather than a one-book conversion.

Rule-source order:

1. **Realm Guard: Rangers of the North** takes priority where the hack defines or replaces a rule.
2. **Mouse Guard Roleplaying Game 2nd Edition** supplies inherited core procedures where Realm Guard does not replace them.
3. **Torchbearer 2nd Edition** contributes selected compatible ideas only where the project deliberately adopted them.
4. **Realm Guard / Torchbearer Foundry expansions** are project-specific additions and are identified as such in the integrated Rules Reference.

The in-Foundry manual uses four labels:

- **RULE** - a tabletop rule used by the system.
- **AUTOMATED** - Foundry handles the bookkeeping.
- **GM CALL** - fictional/table judgement is still required.
- **RG/TB FOUNDRY** - a project-specific expansion or convenience layer.

This manual and the permanent **Realm Guard / Torchbearer - Rules Reference** Journal summarize the rules that the Foundry system actually implements. They do not reproduce the source books verbatim.

## Global Help / Manual

Every user receives a compact **book icon in Foundry's sidebar**. It opens the System Manual & Rules Reference from any normal workspace without requiring a return to chat.

The same manual is also available from chat-side system controls and, for GMs, from the GM Dock.

The manual can open the permanent Rules Reference Journal. GMs also get a shortcut from the manual to World Health Audit.

## Quick Start

Players use **Recruit Ranger** or **Create Ranger** directly from the Foundry **Actors** directory header. Both are rules-driven Recruitment paths; Recruit Ranger is the guided path and Create Ranger is the quicker presentation. The Ranger sheet then handles Skills, Abilities, Nature, Conditions, Inventory, portraits/tokens, Levels and Talents.

GMs use the **GM Dock** for GM Control, Conflict Engine, Turn Manager, End Session, Starter Compendiums, Content Studio, World Health Audit and the manual.

A normal session can flow:

`scene play -> rolls / Conditions -> Conflict if needed -> Players' Turn / Recovery if Structured Mode is used -> End Session -> Start Next Session`

## Recruitment

**Recruit Ranger** (GUIDED) and **Create Ranger** (QUICK) are available in the Foundry Actors directory header and use the same authoritative Recruitment rules; GUIDED contains more explanation. Foundry's generic Create Actor control remains an admin/GM escape hatch rather than the normal Ranger path.

The Recruitment flow covers Concept, Station/Age, Dúnadan Nature, Homeland, Natural Talent, Life Experience, Service, Specialty, Wises, Resources/Circles, Traits, relationships, Belief/Goal/Instinct and starting Gear.

For the personal Enemy relationship, the printed Realm Guard restriction remains the default: choose among the Free Peoples rather than a servant of the Enemy. Recruitment Step 9 also offers the explicit opt-in **Allow Servants of the Enemy as personal Enemies (House Rule)**. When enabled, Orc, Troll, Warg and Spider become available as Enemy types. The choice is a table variant, not a change to the source rule.

Finished Rangers are created in `Actors > PC`; the folder is created on demand.

The separate **Recruitment Guide** explains the same creation sequence without requiring character creation.

## Rolls, Learning, Fate and Persona

Skill, Ability, Nature, Versus and Beginner's Luck tests use the common Roll Dialog. Obstacle defaults to 1 and Modifier to 0.

The dialog can expose applicable Conditions, Traits, unrated Wises, Teamwork, Persona, Fate/Open 6s, Tokens of Power and Talents.

Trained Skills track Pass/Fail Learning. Untrained Skills use Beginner's Luck and their own attempt track before becoming trained.

### Trait session use

Beneficial Trait use follows the inherited Mouse Guard 2E levels. Level 1 grants +1D once per session, Level 2 grants +1D twice per session, and Level 3 grants +1s on relevant passed/tied tests. The Roll Dialog shows remaining Level 1/2 uses and enforces them automatically. These beneficial-use counters reset when the GM finalizes **End Session**. Trait Against remains separate from the beneficial-use counter. Wises are not one-use-per-session resources.

The Roll Dialog top row separates three different sources cleanly: **Obstacle** is the target, **Modifier (automatic)** is read-only system/Condition impact, and **Extra Dice** is reserved for manual or situational bonus dice. Accepted Help is shown in the Help/Teamwork section rather than as a separate editable/top-row field.

Current Fate and Persona are spendable resources. A roll may spend 0-3 Persona for +0D to +3D; supported Nature spends are additional Persona costs where applicable. Lifetime Spent Fate/Persona increases only when a real spend is committed. Rewards and manual resource corrections do not count toward lifetime progression.

## Turn Manager, Checks and Recovery

Structured Mode uses GM Turn and Players' Turn. Each participating Ranger begins Players' Turn with one Free Test. Additional Players' Turn tests cost Checks. Group play enforces the action-rotation rule; solo play is exempt.

Trait Against can earn Checks in the intended GM Turn context. Teamwork Help comes from an appropriate Skill; a relevant Wise can instead contribute +1D through I Am Wise. Traits do not Help another Ranger. Checks can be passed to patrol-mates under the implemented rules.

Recovery order is:

`Hungry & Thirsty -> Angry -> Tired -> Injured -> Strained`

Players' Turn recovery uses the Free Test first and then Checks. Supported GM Turn recovery costs two Checks. Free Play disables Turn/Check test costs while preserving the underlying character data and recovery mechanics.

## Conditions

Conditions are Realm Guard Items synchronized with Foundry Active Effects for token display.

The canonical set is Angry, Strained, Tired, Hungry & Thirsty, Afraid, Injured and Fresh. Strained is the Realm Guard replacement for the old Sick default. Fresh is a Foundry convenience Condition.

Conditions can be managed from the global Conditions dropdown, Ranger/NPC sheets and token HUD.

## Quick Token Builder

A player who owns a Ranger can drop a local image directly on that Ranger portrait; only owned Rangers are writable. The dropped image becomes the preserved source portrait and never auto-commits a token. Clicking the Ranger portrait opens **Character Portrait**. Choose **Original Portrait** or **Token Portrait**, then drag/zoom the image and choose Fill/Crop or Fit Entire Image. The selected mode and framing are stored on the Actor and survive sheet reloads. Original and Token Portrait keep separate framing, and switching modes never destroys the original source artwork.

Ranger and NPC sheets expose **Quick Token Builder**. The builder always opens from preserved full source artwork so a previously generated token never becomes the crop source by accident. Drag the complete image freely behind the round guide, zoom it, or use Center, Fit and Fill. The builder now also remembers its last saved framing for that Actor. Preview changes remain non-destructive until **Create / Save Token** is pressed. Save renders the exact framing into a real circular PNG, stores that finished token for optional Ranger Token Portrait use and updates the Actor prototype token. For NPCs, that explicitly saved round token also becomes the NPC Actor portrait while the original source artwork is retained for future reframing. The optional **Update placed tokens for this Actor** control can also refresh matching tokens on the current Scene immediately. NPC Template image-drop creates the NPC and source portrait first; it does not auto-commit a final round crop.

## Inventory, Gear and Tokens of Power

Inventory & Gear uses a paper-doll interface with Left Hand, Right Hand, Head, Neck, Cloak, Torso, Belt, Pocket and Feet plus Containers and Unassigned Gear. Two-handed items lock the opposite hand.

Tokens of Power appear at the top of Inventory & Gear. The system implements Level 1/2/3 behavior, linked Skills/uses and once-session state. Specific-use/manual effects and Scale of Might applicability remain explicit table judgement where automation cannot determine them safely.

## Card-driven Conflict Engine

Conflicts use secret three-card scripting for both sides. The action cards are Attack, Defend, Feint and Maneuver. GM and Ranger cards use separate visual identities and opposing unrevealed cards stay hidden.

The engine supports Starting Disposition, action interaction, Realm Guard conflict Skill mapping, Conflict Captain assignments, Teamwork, selected weapon qualities, Maneuvers, Disposition, ties, Learning and final Compromise.

## Levels and Talents

Levels & Talents are an explicit **Realm Guard / Torchbearer Foundry expansion** inspired by the selected Torchbearer 2E concept that spent Fate/Persona can drive level advancement.

Rangers begin at Level 1. Both lifetime Fate and Persona thresholds must be reached. From Level 2 onward the Ranger receives one Talent slot per Level through Level 10.

Talents may be Passive, Once per Session or Once per Conflict and may be linked to a Skill, Ability or a table-approved general use.

This layer does not import Torchbearer classes, Town/Camp/Grind or unrelated Torchbearer subsystems.

## NPC and GM Tools

Quick NPC creates compact NPCs in `Actors > NPC`, creating the folder on demand. Rank-aware default loadouts are Foundry convenience presets and do not claim to be new source rules.

GM Control provides Quick NPC Roll, Conditions, group resources and shortcuts to Turn Manager, Conflict Window and Content Studio. **Selected Tokens** is a live GM Quick Inspector: click a selected Ranger/NPC for Sheet, Center, Quick Roll, Conditions or Token Builder; multi-select exposes Group Conditions. The Inspector follows canvas selection without reopening GM Control and keeps identity/stats, resources and Conditions on separate readable rows. **Obstacle Control** is a separate GM Dock tool so Baseline/Live Ob changes stay visible and fast during play.

Realm Guard / Torchbearer dropdowns use contextual option help. Hover an option in the custom dropdown menu to see what that choice means before committing it. In v1.0.8.44 the option menu is rendered above Foundry windows so window position/scale does not offset the list. The native select value remains the canonical form value. The same contextual-help language is used throughout the Conflict Engine for Methods, Actions and other rule-sensitive choices. Hovering a canvas token also reveals its token name temporarily.

## Starter Compendiums

A clean GM world receives eight Starter Compendiums:

- Skills
- Traits
- Wises
- Conditions
- Gear
- Tokens of Power
- Talents
- NPC Templates

**Add Missing Entries** is non-destructive. Missing starter documents can be restored without overwriting edited/custom documents.

Wises remain unrated; Wises 2.0 is not part of this project.

## Content Studio

Content Studio is the GM authoring tool for creating or duplicating Realm Guard / Torchbearer content through type-aware forms and a **Review Before Create** gate.

It supports World content, selected Actors, recommended custom Compendiums and compatible writable Compendiums. Duplicate & Modify never edits the source and strips Starter Library identity from custom copies.

Normal player Rangers should still use Create Ranger / Recruitment rather than the admin Actor-template flow.


### Conflict chat readability

v1.0.8.44 treats Conflict chat as an at-a-glance play aid rather than a raw calculation log. Action cards show the matchup, both sides' pools/dice/successes, the immediate result and Disposition before -> after first. Roll modifiers, Weapon/Tool notes and detailed rules resolution are available in collapsible detail. Starting Disposition, Maneuver and Conflict Complete use the same hierarchy.

Standard Skill/Ability cards likewise keep **PASS / FAIL / TIE** separate from the numeric `Success: X` / `Failed: X` line and group the pool calculation into labelled rows.

## End Session

End Session is GM-only. It reviews Belief, Goal and Instinct, proposes Fate/Persona awards and requires GM approval before resources are applied.

MVP and Workhorse are separate one-Ranger awards and cannot go to the same Ranger. Embodiment represents portrayal rather than MVP and may apply to multiple Rangers, but not the entire group. In a one-Ranger session, the sole Ranger may receive Embodiment as a solo-play exception in the Foundry workflow.

Start Next Session resets supported once-session state such as Token of Power and Talent uses while preserving progression and World content.

## World Health Audit

World Health Audit is a GM-only, read-only diagnostic. It checks versions, canonical Skill/Condition duplicates, resource bounds, progression consistency, invalid 2H occupancy, Talent/Token configuration, Starter Compendiums and basic World structure.

It reports; it does not repair, move, delete or reset World data.

## Permanent Rules Reference Journal

On first GM load of v1.0, the system creates a player-readable Journal folder **Realm Guard / Torchbearer** and the Journal:

**Realm Guard / Torchbearer - Rules Reference**

The Journal is created only if it does not already exist. Existing Journal content is not overwritten by normal world loading.

The integrated manual and the created Journal use the same in-system rules-reference definitions for v1.0.

## World Backup and Transfer

The system package and a Foundry World are separate.

Installing Realm Guard / Torchbearer on another server does **not** move the campaign. Rangers, NPCs, Scenes, Journals, campaign Items, custom Compendiums, progression and campaign state live in the World data.

Before an upgrade or move:

1. Back up the current Foundry World.
2. Install a compatible Realm Guard / Torchbearer version on the destination.
3. Transfer/restore the actual World data using the server/host backup method.
4. Install modules/external assets that the World requires.
5. Open the copied World and run World Health Audit.

## Safe Upgrade Policy

v1.0 keeps the internal Foundry system id `realm-guard` so existing Worlds continue to identify the same system after the display-name change.

The v1.0 upgrade must not reset or reorganize existing Actors, NPCs, Scenes, Journals, Items, Compendiums, Inventory, Conditions, Recruitment data, Tokens, Talents or progression.

If something fails, record the exact action, copy the first relevant F12 Console error and run World Health Audit. Do not delete World data to troubleshoot a system bug without a verified backup.

## Rules Reference

See `RULES_REFERENCE.md` for the shipped text reference. The same reference is available inside Foundry through the System Manual and the permanent Rules Reference Journal.


## v1.0.5 workflow notes

- RG/TB system dialogs are non-modal: leave them open and interact with other Foundry windows as needed.
- Beginner's Luck may Tap Nature when Tap Nature is otherwise legal. Nature dice are added after the Beginner's Luck halving.
- Trained Skills advance automatically when both Pass and Fail requirements are met; there is no manual Advance step.
- Character Levels rise immediately when cumulative committed Fate/Persona spend reaches a threshold. If the new Level grants an unclaimed Talent choice, the Talent browser is offered immediately; closing it leaves the Talent choice pending.
- The GM Dock can be dragged by its RG/TB grip and Reset Position returns it beside the Hotbar.
- RG/TB system chat uses a dark presentation independent of Foundry light/dark appearance.

---

## v1.0.6 Playflow additions

### Ability advancement
Nature, Will, Health, Resources and Circles now show compact Pass/Fail progress directly in the Ranger header. Normal tests record the result automatically when **Count this test for Learning** is enabled. When both requirements are met, the Ability advances immediately. Nature uses Maximum Nature for its requirement; advancing taxed Nature raises Maximum and Current Nature by one. Beginner's Luck continues to teach the untrained Skill only and does not mark Will or Health advancement.

### Help, I Am Wise and Synergy
Normal Roll Dialog Teamwork uses a live Help Request instead of making the acting player configure other Rangers. Click **Ask for Help** and active Ranger players receive their own non-modal prompt. The acting player can keep preparing the roll; accepted Help appears automatically inside the Help / Teamwork section and is added to the pool without a separate editable field. Unanswered requests never block the roll.
- **Normal Help**: the helper chooses an appropriate trained Skill or Ability and gives +1D.
- **I Am Wise**: the helper chooses a relevant Wise and gives +1D through the Wise rule rather than ordinary Help.
- **Synergy**: an optional RG/TB adoption inspired by Torchbearer 2E. It is chosen in the helper's own prompt, so the commitment is bound to that helper, their chosen Skill/Ability and their Fate. A resolved pass/fail marks the same result on the helper's chosen source. An unresolved tie keeps the Fate; a resolved tiebreaker uses the final resolved result.
- **Afraid Rangers** cannot answer Help requests. Helper Traits are never offered.

### Obstacle Control
The GM Dock has a dedicated **Obstacle Control** window. A new world starts at **Baseline Ob 2**. The panel separates three jobs so the GM can see what each control affects:
- **Baseline Obstacle** sets the default Ob for future ordinary Skill and Ability rolls.
- **Change Open Rolls Live** pushes a temporary Ob to Roll Dialogs that are already open and still linked to Baseline; it does not change the Baseline for future rolls. Reset returns those open linked rolls to Baseline.
- **Ordinary Roll Workflow** chooses how new ordinary rolls receive their Obstacle:
  - **Automatic - use Baseline for ordinary rolls**: new ordinary rolls start at Baseline. If that individual roll is edited manually it stops following Live OB.
  - **GM approval - confirm each ordinary roll**: the player can keep preparing while an active GM receives a compact non-modal request, can raise/lower the Ob, preview the value to the player and approve it.
  - **Manual - set Obstacle in each roll**: ordinary rolls use direct per-test Ob editing instead of the Baseline/Live/approval workflow.

Versus, Resources, Circles and other rule-specific Ob tests keep their own rules. The displayed Baseline difficulty guidance follows the Mouse Guard obstacle scale; exact Skill Factors remain a GM/rules call unless explicitly represented by source-backed system data.

### Conflict flow

The v1.0.8.44 Conflict flow is staged so only the current decision dominates the UI: **Setup -> Goals & Stakes -> Starting Disposition -> Secret Planning -> Resolve -> Compromise**. The GM/Opposition and Ranger side write their own Goals; **Save Goal = Ready**. When both saved Goals are green, Starting Disposition begins automatically. Secret Planning uses progressive disclosure so Actor and Weapon/Tool controls appear only after an Action is chosen.

Starting Disposition uses the normal roll engine. A trained Conflict Skill rolls normally; an untrained Conflict Skill uses Beginner's Luck rather than becoming a 0D dead-end. The rolled successes are added to the full conflict base Ability. Team Condition penalties are unique by Condition name, so three Rangers with the same applicable Condition still produce only one copy of that penalty. GM opposition can use Calculated, Nature, Fixed or Manual Disposition when creature/NPC rules require it. The calculation is posted to chat.

During secret action planning, a compact **Conflict Action Guide** appears above the cards. Each planned Action also declares its **Conflict Weapon / Tool**. Physical Gear weapons appear only in Fight-style conflicts; other conflicts use appropriate saved or improvised tools. No valid Weapon/Tool applies the universal Unarmed -1D penalty. Custom tools can be temporary for the current Conflict or saved to the Actor, can target Attack/Defend/Feint/Maneuver and can carry dice/success modifiers, requirements and special notes. Positive +s is conditional on an otherwise successful/tied result; negative -s removes successes before resolution.

When both plans are locked, Action 1 reveals automatically. After a resolved action, the next action auto-reveals where no Maneuver/Compromise choice interrupts the sequence. Planning cards are hidden during action resolution and recent events are available under Exchange History. If hidden plans cannot be recovered, the exchange returns safely to planning instead of remaining stuck; Abort clears transient Conflict state.


## v1.0.7 - Flexible Test Engine & GM Flow (QA)

- Custom Roll: opens directly as a neutral **Free Dice Pool** for improvised/table-adjudicated tests. Use the normal Skill/Ability controls for standard rules automation, Conditions, Nature, Help and Learning.
- GM Control: Baseline Obstacle is separated from **Change Live Roll OB**; Live OB pushes immediately to currently open Baseline-linked Roll Dialogs and can reset to Baseline.
- Untrained Skills learn automatically at Rating 2 when Beginner's Luck attempts reach Maximum Nature; the manual LEARN step is removed and replaced by a celebratory chat card.
- Roll Modifier is read-only and explains automatic Condition/system dice changes; manual additions stay in Extra Dice.
- Dice results are visually coded: 1-3 red, 4-5 green, 6 green with a star.
- NPC sheets accept smart Item drag/drop (Skills, Wises, Traits, Gear, Conditions, Talents and Tokens).
- NPC Templates & Quick Spawn: create from a starter template, or drop an image file on a template to create an NPC with that image as portrait, then frame and save its round token with Token Builder.
- Conflict posts a chat result for every resolved action, including both sides' dice/successes and Disposition before/after.
