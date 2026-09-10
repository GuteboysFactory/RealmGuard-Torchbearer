# MG-Family CORE M0 — Baseline Inventory

**Build:** Realm Guard / Torchbearer v1.2.0 QA  
**Phase:** M0 — Safety, Schema & Migration Baseline  
**Foundry target:** 13.351  
**Code baseline:** v1.0.8.44 GOLD / published  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED

## 1. Baseline decision

M0 is built from **v1.0.8.44**, the last live-approved/published baseline.

The separate **v1.1.0 Circles & Contacts** package is preserved as an unpromoted development/reference branch. Its static QA passed, but its live test protocol remained uncompleted. M0 therefore does not stack the architecture migration on top of an unverified gameplay feature branch.

The Circles/Contacts work is not discarded. It is retained as implementation reference for the later Social Network/Circles phase (M8).

## 2. Package identity

```text
Foundry system id: realm-guard
Display title: Realm Guard / Torchbearer
Foundry target: 13.351
M0 QA version: 1.2.0
```

The package id is deliberately unchanged.

## 3. Actor document types

```text
Actor.character
Actor.npc
```

Both currently use the same underlying Realm Guard character schema; NPC extends the character data model.

### Character/NPC persistent system data

```text
biography
notes
concept
rank
homeland
age
lineage
insignia
seniorArtisan
friend
cloak
weapon
mentor
enemy
parents
belief
goal
instinct

attributes.nature.value
attributes.nature.maximum
attributes.will.value/max
attributes.health.value/max
attributes.resources.value/max
attributes.circles.value/max

resources.fate.value/max
resources.persona.value/max
resources.checks.value/max

progression.level
progression.spentFate
progression.spentPersona

roll.versus
roll.obstacle
roll.modifier
```

### Current hard schema limits

```text
Nature maximum: 7
Will maximum default: 6
Health maximum default: 6
Resources maximum default: 10
Circles maximum default: 10
Level: 1-10
```

These are current Legacy Mixed schema facts, not declarations that all future CORE profiles must use the same limits.

## 4. Item document types

```text
role
trait
wise
gear
condition
tokenOfPower
talent
```

### role / Skill

```text
rating: 0-12
learning.passed
learning.failed
learning.passNeeded
learning.failNeeded
description
notes
versus
beginnerAbility
beginnerAttempts
```

### trait

```text
rating: 0-6
description
```

### wise

```text
description
```

Current Legacy Mixed Wise Items are unrated.

### gear

```text
quantity
description
inventory.mode
inventory.location
inventory.containerId
inventory.slots
inventory.bundle
inventory.wieldHands
inventory.containerType
inventory.capacity
```

### condition

```text
active
icon
rollModifier
appliesTo
recoveryType
recoveryAbility
recoveryRole
recoveryObstacle
recoveryNote
description
```

### tokenOfPower

```text
level
linkType
linkedSkill
linkedUse
effectMode
form
origin
description
session.used
```

### talent

```text
sourceKey
minLevel
frequency
linkType
linkedSkill
linkedAbility
effectMode
diceBonus
description
session.used
conflict.usedId
```

## 5. Existing world settings before M0

| Setting | Scope | Type | Default | Role |
|---|---|---|---|---|
| `starterCompendiumSeedVersion` | world | String | empty | Starter Library seed tracking |
| `baselineObstacle` | world | Number | 2 | default ordinary-test Ob |
| `liveRollObstacle` | world | Number | 2 | live Ob push to open baseline-linked rolls |
| `obstacleMode` | world | String | `baseline` | baseline / approval / manual workflow |
| `useTurnManager` | world | Boolean | true | structured Turn Manager toggle |
| `turnPhase` | world | String | `gm` | GM vs Players' Turn phase |
| `turnCycleId` | world | Number | 1 | turn-cycle identity |
| `playerTurnLastActor` | world | String | empty | no-two-tests-in-a-row guard |
| `endSessionCycle` | world | Number | 1 | end-session cycle identity |
| `endSessionFinalized` | world | Boolean | false | duplicate reward guard |
| `defaultActorArt` | world | String | `northern` | default new-Actor art family |
| `placeholderArtUpgradeV0183` | world | Boolean | false | historical art migration guard |
| `conflictState` | world | String(JSON) | empty | public/recoverable Conflict state |
| `conflictPrivateState` | client | String(JSON) | empty | private local Conflict state |

## 6. New M0 world metadata

M0 adds only non-destructive bookkeeping settings:

| Setting | Scope | Default after migration |
|---|---|---|
| `systemSchemaVersion` | world | `1` |
| `coreArchitectureVersion` | world | `0.1` |
| `activeRulesProfileId` | world | `realm-guard-legacy-mixed` |
| `activeRulesProfileVersion` | world | `1` |
| `migrationHistory` | world | JSON history containing `m0-core-baseline-v1` |
| `migrationLastError` | world | empty |

These settings do **not** alter the active tabletop rules in M0.

## 7. Persistent Realm Guard flags in the current baseline

### Actor flags

Major known keys include:

```text
abilityLearning
autoLearnRequestedBy
autoLearnedAt
traitSessionUses
playerTurnState
recoveryAttempts
conflictTools
portraitMode
portraitSource
portraitFramingOriginal
portraitFramingToken
tokenBuilderSourcePortrait
tokenBuilderFraming
tokenPortraitPath
quickNpc
recruitmentVersion
recruitmentSpecialty
recruitmentWiseChecks
recruitmentSkillChecks
recruitmentNatureAnswers
recruitmentResourceAnswers
recruitmentCircleAnswers
recruitmentMentorRuleConfirmed
recruitmentMother
recruitmentFather
recruitmentEnemyHouseRule
```

### Item / ActiveEffect flags

```text
defaultSkill
defaultCondition
conditionItemId
conditionIcon
recruitmentTrait
recruitmentWise
recruitmentGear
quickNpcGear
quickNpcLoadout
starterKey
starterPack / starter identity metadata
QA inventory flags
```

### User flags

```text
gmDockPosition
```

### Folder / Journal metadata

Current system-created folders/Journals also use Realm Guard flags for identities such as PC/NPC folders, NPC template folders and the Rules Reference Journal.

M0 does not rename or migrate these flags.

## 8. Runtime/session-state inventory

### Recoverable/persistent runtime state

```text
world conflictState
client conflictPrivateState
world turnPhase / turnCycleId / playerTurnLastActor
Actor playerTurnState
Actor recoveryAttempts
world endSessionCycle / endSessionFinalized
Actor traitSessionUses
Token session.used
Talent session.used / conflict.usedId
Condition active state + synchronized ActiveEffect
Actor conflictTools
```

### Memory-only transient state

Current code also contains ephemeral process/UI state such as:

```text
Conflict draftPlans
Conflict weaponDrafts
Conflict lockedPlanCache
Conflict dismissedConflictId / drag state
Teamwork sessions / helperDialogs
Obstacle requests / GM dialogs
in-flight automatic learning guard
smart-select / tooltip state
GM Dock observer/positioning state
```

These are important inputs to later RuntimeStateRepository work. M0 does not move them yet.

## 9. Socket inventory

Current system uses the shared Foundry channel:

```text
system.realm-guard
```

Major message families include:

```text
Obstacle live/update/request/response
Teamwork request/accept/decline/close
Conflict intents and GM-authoritative state changes
```

M0 adds no new gameplay socket protocol.

## 10. Legacy Mixed behavior inventory for M1

The compatibility profile must preserve the currently published behavior, including at least:

- Realm Guard setting/content and current Ranger/NPC sheets.
- d6 4+ success core and current roll-result behavior.
- Persona 0-3D where legal.
- Fate/Open-6 flow.
- current Beginner's Luck ordering.
- current Nature/Tap/Double-Tap behavior.
- current Help request workflow plus selected Torchbearer-inspired Synergy.
- current Condition set including Realm Guard Strained and selected TB-inspired Afraid/Fresh behavior.
- current automatic Skill/Ability advancement.
- **unrated Wises** in current live storage/creation.
- current Trait beneficial-use implementation.
- structured paper-doll Inventory and containers.
- TB-inspired cumulative Fate/Persona Level + Talent progression.
- Realm Guard Tokens of Power implementation.
- current Conflict implementation, including per-Action Weapon/Tool declaration and current Unarmed `-1D` behavior.
- Turn Manager / Checks / Recovery workflow.
- End Session workflow.
- current Recruitment 2.0 behavior and provenance flags.
- portrait/token framing and Token Builder behavior.
- GM Control, Quick Inspector, NPC tools, Content Studio and Starter Library.

This list describes compatibility behavior. It does not declare these rules to be Strict Realm Guard.

## 11. Known architecture debt captured at M0

M0 records, but does not yet correct, known mismatches such as:

- strict RG source inheritance should be RG v1.6 -> MG1E rather than MG2E;
- Strict RG Wises should be rated;
- current Level/Talent system is a Mixed/Foundry expansion;
- current structured inventory is Mixed/TB-inspired rather than Strict RG default;
- current Conflict Tool declaration is per Action rather than strict set-scope;
- current Unarmed `-1D` is not HARD CORE;
- several rules remain embedded in UI/domain-specific code rather than shared Effects/Profiles.

These are intentionally deferred to later M-phases.

## 12. M0 source-code corrections that are diagnostic only

The v1.0.8.44 package contained two stale diagnostic/version labels:

- the initialization console message still named v1.0.8.43;
- World Health Audit contained an old hard-coded `1.0.4` version expectation.

M0 removes those stale diagnostics. This does not change tabletop behavior or campaign data.

---

**M0 baseline rule:** no Actor, Item, Scene, Journal, Compendium or gameplay rule is rewritten by the CORE M0 migration.
