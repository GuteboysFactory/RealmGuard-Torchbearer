# Realm Guard / Torchbearer - Rules Reference

**Version:** 1.0.0  
**Purpose:** concise reference for the rules and project expansions implemented by the Foundry system.

## Source hierarchy

1. Realm Guard: Rangers of the North takes priority where it defines or replaces a rule.
2. Mouse Guard RPG 2E supplies inherited core mechanics where Realm Guard does not replace them.
3. Selected compatible Torchbearer 2E ideas are used only where deliberately adopted.
4. Project-specific additions are labelled **RG/TB FOUNDRY**.

Labels used below: **RULE**, **AUTOMATED**, **GM CALL**, **RG/TB FOUNDRY**.

## Core tests and Versus

**RULE:** Roll d6s; 4-6 are successes. An Obstacle test passes when successes meet or exceed the Ob. In Versus, higher successes win; equal successes use tie resolution.

**AUTOMATED:** the Roll Dialog starts at Ob 1 / Modifier 0 and reports pool, successes and margin.

**GM CALL:** the table still decides when a test is required, what Skill/Ability applies and the Obstacle when no factor supplies it.

## Skills, Learning and Beginner's Luck

**RULE:** trained Skills record eligible Pass/Fail advancement and advance when their displayed requirements are met. The current normal trained Skill cap is 6.

An untrained Skill is Rating 0. Beginner's Luck uses its linked Will or Health base, halves the pre-Persona support pool and rounds up. Attempts are tracked until the Skill can be learned at Rating 2.

## Nature

**RULE:** Realm Guard Recruitment starts Dúnadan Nature from 3. A starting Ranger cannot begin at Nature 1 or 7. The implemented Dúnadan descriptors are Tradition, Family and Grief.

Nature can be used when the action genuinely matches a descriptor. Tap Nature and Acting Against Nature/Tax follow the inherited Nature procedure implemented by the system.

**GM CALL:** whether the fiction is truly within Nature remains a table judgement.

## Traits, Wises, Help, Fate and Persona

**RULE:** Beneficial Trait use follows Mouse Guard 2E: Level 1 grants +1D once per session; Level 2 grants +1D twice per session; Level 3 grants +1s on relevant passed/tied tests. Only one Trait may help you on a test. Beneficial Level 1/2 uses are session state and reset when End Session is finalized. Trait Against is a separate use of a Trait and can earn Checks in the intended GM Turn context. Traits do not Help another Ranger. Wises remain unrated knowledge and are not limited to one use per session; their normal restriction is once per test/effect where relevant. No numeric Wises 2.0 subsystem is added.

Teamwork can add eligible patrol-mate Help from an appropriate Skill. A relevant Wise may instead add +1D through I Am Wise. Persona can add +1D per point up to +3D before a roll and can also support configured Nature spends. Fate enables Open 6s after a qualifying roll.

**AUTOMATED:** cancelled/uncommitted rolls do not spend resources.

## Turns, Checks, Conditions and Recovery

**RULE:** Structured Mode has GM Turn and Players' Turn. Each Ranger gets one Free Test at Players' Turn start; additional tests cost Checks. Group play uses action rotation; solo play is exempt.

Recovery order is Hungry & Thirsty -> Angry -> Tired -> Injured -> Strained. Supported GM Turn recovery costs two Checks.

Current canonical examples include Angry Will Ob 2, Tired Health Ob 3, Injured Health Ob 4 and Strained Will Ob 4.

**RG/TB FOUNDRY:** Free Play disables the Turn/Check test economy while preserving Actor data and recovery mechanics.

## Inventory, Gear and Tokens of Power

**RG/TB FOUNDRY:** the paper-doll Inventory/Container system is a project expansion.

**RULE:** a Token of Power has a name, Level and specific linked Skill/use. Level 1 gives +1D once/session; Level 2 gives +1D on every appropriate check; Level 3 gives a failed-dice reroll once/session. Elven/Dwarven craft is at least Level 1 in Realm Guard. Naming ordinary Gear does not by itself create a Token.

**GM CALL:** specific-use relics and Scale of Might relevance require table judgement where no safe universal conversion exists.

## Conflict

**RULE:** each side secretly scripts three actions: Attack, Defend, Feint or Maneuver. Actions reveal one pair at a time. The matrix resolves Independent, Versus and Trumped interactions. Realm Guard conflict Skill mappings take priority; inherited Mouse Guard cells are used where Realm Guard directs.

The engine supports Starting Disposition, Conflict Captain action assignment, Teamwork, selected weapon qualities, Maneuvers, Disposition, ties, Learning and Compromise.

**RG/TB FOUNDRY:** During action planning, the Conflict window shows a concise Action Guide above the cards. It summarizes each card's purpose, strongest use and main risk; it is play guidance, not a replacement for the action interaction rules.

**AUTOMATED:** unrevealed opposing card identities remain hidden.

**GM CALL:** fictional positioning, edge-case weapon effects and final Compromise terms remain table decisions.

## Recruitment

**RULE:** the Create Ranger wizard follows Realm Guard Recruitment: Concept, Station/Age, Dúnadan Nature, Homeland, Natural Talent, Life Experience, Service, Specialty, Wises, Resources/Circles, Traits, relationships, BGI and starting Gear.

Natural Talent is a Recruitment Skill check rather than the later Talent progression subsystem. Recruit and Lord choose two; Scout, Veteran and Captain choose one.

**RULE:** by default, the Recruitment personal Enemy is chosen from the Free Peoples rather than from servants of the Enemy.

**RG/TB FOUNDRY:** Recruitment Step 9 can explicitly enable **Allow Servants of the Enemy as personal Enemies (House Rule)**, adding Orc, Troll, Warg and Spider as table-variant choices. This option is off by default and is stored in Recruitment metadata.

## End of Session

**RULE:** End of Session reviews Belief, Goal and Instinct and proposes Fate/Persona awards. The implemented Fate criteria include Belief, progress toward an uncompleted Goal and Instinct. Persona criteria include accomplished Goal, played against Belief, MVP, Workhorse and Embodiment.

MVP and Workhorse are one Ranger each and cannot be the same Ranger. Embodiment represents portrayal and can apply to more than one Ranger but not the entire group. For a one-Ranger session, the Foundry workflow allows the sole Ranger to receive Embodiment as a solo-play exception.

## Levels and Talents

**RG/TB FOUNDRY:** the Level/Talent layer is a project expansion inspired by the selected Torchbearer 2E concept that Fate/Persona actually spent can drive level advancement.

Both lifetime spend thresholds are required. Rangers start at Level 1 and gain one Talent slot per Level from Level 2 through Level 10.

Talents can be Passive, Once per Session or Once per Conflict and can link to a Skill, Ability or explicit table-approved use.

This does not import Torchbearer classes, Town/Camp/Grind or other unrelated subsystems.

## Automation boundary

**AUTOMATED:** safe bookkeeping such as dice pools, committed resource spends, Learning marks, Inventory placement, Condition state, hidden Conflict plans, session recharge, progression counters and non-destructive starter seeding.

**GM CALL:** fictional applicability is not replaced by software. The GM/table determines when rules apply where context cannot be known by Foundry.

**RG/TB FOUNDRY:** Quick NPC loadouts, paper-doll inventory, Free Play, Levels/Talents, Content Studio and World Health Audit are project additions.

## World safety

The system package and campaign World are separate. Installing the system elsewhere does not move Actors, Scenes, Journals, custom Compendiums or progression. Back up and transfer/restore the World data separately.

---

## v1.0.6 quick reference

### Ability advancement — RULE / AUTOMATED
Abilities and Skills advance from Pass/Fail tests. A rating normally needs Passes equal to the current rating and Fails equal to one less; rating 0/1 advances from one Pass. Nature uses Maximum Nature for this calculation. When taxed Nature advances, Maximum and Current Nature both increase by one. Advancement occurs immediately when requirements are fulfilled. Beginner's Luck does **not** mark Will/Health advancement.

### Help Request & Synergy — RG/TB FOUNDRY / selected Torchbearer-inspired rule
The acting Ranger can send a non-modal Help Request to active Ranger players. Each helper chooses their own appropriate Skill/Ability or a relevant Wise; accepted Help is added automatically to the acting Ranger's open roll. This Foundry workflow changes presentation, not the +1D Teamwork rule.

When helping with a Skill/Ability, the helper may choose Synergy before the test and commit 1 Fate. The choice is made on the helper's client and is bound to the helper's own Actor, Fate and chosen source. A resolved pass marks a Pass for that source; a resolved failure marks a Fail. On an unresolved tie the Fate is retained; if the tie is resolved, the resolved result is used. I Am Wise is separate and does not use Synergy.

### Obstacle guidance — RULE / GM CALL
Obstacle is the number of successes required. The broad scale is: Ob 1 easy for one Ranger; Ob 2 routine work with risk; Ob 3 challenging; Ob 4 hard and commonly needs teamwork; Ob 5 very difficult; Ob 6+ extreme and rare. Exact Skill Obstacles should follow applicable source Factors. The live Baseline Ob and GM approval workflow are Foundry table tools; the GM can override them.


## v1.0.7 - Flexible Test Engine & GM Flow (QA)

- Custom Roll is intentionally a neutral **Free Dice Pool**. Standard Skill/Ability tests should use their normal sheet controls so the RG/TB rules engine can apply Conditions, Nature, Help and Learning correctly.
- GM Control: Baseline Obstacle is separated from **Change Live Roll OB**; Live OB pushes immediately to currently open Baseline-linked Roll Dialogs and can reset to Baseline.
- Untrained Skills learn automatically at Rating 2 when Beginner's Luck attempts reach Maximum Nature; the manual LEARN step is removed and replaced by a celebratory chat card.
- Roll Modifier is read-only and explains automatic Condition/system dice changes; manual additions stay in Extra Dice.
- Dice results are visually coded: 1-3 red, 4-5 green, 6 green with a star.
- NPC sheets accept smart Item drag/drop (Skills, Wises, Traits, Gear, Conditions, Talents and Tokens).
- NPC Templates & Quick Spawn: create from a starter template, or drop an image file on a template to create an NPC with that image as portrait/token.
- Conflict posts a chat result for every resolved action, including both sides' dice/successes and Disposition before/after.
