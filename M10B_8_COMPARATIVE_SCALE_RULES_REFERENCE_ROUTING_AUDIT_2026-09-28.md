# M10B.8 Read-Only Audit — Comparative Scale / Natural Order + Generic Rules Reference Routing

**Audit date:** 2026-09-28  
**Foundry target:** 13.351  
**Stable baseline:** v1.11.0  
**Current verified QA:** v1.12.0-qa.7 — M10B.7 VERIFIED / CLOSED  
**Audit type:** READ ONLY / NO GAMEPLAY CHANGE / NO PROFILE ACTIVATION

## 1. Audit conclusion

The next bounded M10B increment should be:

> **M10B.8 — Comparative Scale / Natural Order + Generic Rules Reference Routing**

This is the correct next slice because CORE-A10 is already LOCKED architecturally as the generic **Comparative Scale** subsystem, but the repository currently contains only a Realm Guard-specific executable implementation:

- `module/m10-strict-scale-of-might.mjs`
- `module/m10-strict-rules-reference.mjs`

MG1E already declares `naturalOrder` in its Rules Profile, but it has no executable Natural Order rank catalog or source-owned planners. The detailed Rules Reference is likewise hard-wired to Strict Realm Guard.

M10B.8 should genericize these two remaining source/routing blocks without activating MG1E and without introducing automatic live Conflict enforcement.

## 2. Architectural basis — CORE-A10

The canonical MG-family audit defines a shared **Comparative Scale** engine with:

```text
ComparativeScaleDefinition
  id
  name
  domain
  orderedRanks[]
  outcomeRules[]
  modifierRules[]
  tieRules[]
  comparisonEffects[]

ScaleRating
  scaleId
  baseRank
  effectiveRank
  modifiers[]

ScaleComparison
  sourceRank
  targetRank
  difference
  permittedOutcomes[]
  forbiddenOutcomes[]
  testModifiers[]
  specialOptions[]
```

Locked separation:

- Nature != Comparative Scale
- Station / Rank != Comparative Scale
- Base Rank != Effective Rank

Profile-specific names include:

- Mouse Guard 1E — **Natural Order**
- Realm Guard — **Scale of Might**
- future Torchbearer — Might / Precedence

CORE-A10 also explicitly locks the source conflict policy for Realm Guard army numbers:

- **Strict default:** Realm Guard v1.6
- illustrated `Rangers of the North` table: alternate/reference only
- do not silently merge the two tables

## 3. Mouse Guard 1E source contract — Natural Order

Source: **Mouse Guard Roleplaying Game (2008 / 1E), pp. 225–226**.

### 3.1 Fighter / Hunter outcome limits

The source establishes:

- kill is allowed against an animal one rank higher, equal rank or lower
- two or more ranks higher cannot be killed using Fighter or Hunter
- up to two ranks higher may be captured, injured or run off
- more than two ranks higher may only be run off with Fighter/Hunter

This maps cleanly to the generic Comparative Scale outcome planner already anticipated by CORE-A10.

### 3.2 Natural Order ranks

The 1E scale contains nine ordered ranks, lowest to highest:

1. Insect / Baby Snake / Tadpole
2. Young Mouse / Small Snake / Small Fish
3. Mouse / Bat / Chipmunk / Young Weasel
4. Star-Nosed Mole / Weasel / Mink / Rabbit / Flying Squirrel / Ground Squirrel / Snake / Bullfrog
5. Beaver / Hare / Skunk / Porcupine / Owl / Whistle Pig
6. Fox / Badger / Raccoon / Marten
7. Coyote / Otter / Sable
8. Wolf / Wolverine / Deer
9. Black Bear / Moose

The MG1E base mouse rank is therefore rank 3.

### 3.3 Militarist — War with Animals

For targets two or more steps higher than mice, MG1E uses Militarist with an army of sufficient size.

Source thresholds:

- +2 ranks -> 20 armed mice
- +3 -> 100
- +4 -> 200
- +5 -> 2,000
- +6 -> 20,000

These numbers are MG1E profile policy. They must not be replaced by Realm Guard's army table.

### 3.4 Scientist — Blinded with Science

MG1E gives Scientist a separate high-scale route:

- may capture or injure animals two or more steps higher
- first requires Resources Ob equal to the target animal's Nature
- if successful, resolve a special Scientist-vs-animal Conflict
- Scientist is used for Attack and Maneuver
- an appropriate craft/trade skill may be used for Defend and Feint
- the animal uses Nature for disposition and actions

This should be represented as a **guided plan**, not a fully automatic fictional ruling.

## 4. Realm Guard v1.6 source contract — Scale of Might

Source: **Realm Guard v1.6, Scale of Might section (PDF p. 25)**.

Realm Guard keeps the same basic rank-difference outcome logic but replaces Mouse Guard's animal scale with a six-rank Middle-earth scale that includes supernatural/ancient power.

Existing Strict catalog is source-backed:

1. Hobbit / Goblin / Great Bat / Wolf
2. Man / Dwarf / Orc / Spider / Warg / Horse / Mearh
3. Elf / Dúnadan / Torog / Great Eagle / Uruk-hai
4. Cave-Troll / Olog-hai / Winged Beast
5. Mûmak / Ent / Wight
6. Balrog / Dragon / Kraken

Strict Dúnadan base rank = 3.

### 4.1 Realm Guard v1.6 Militarist table

Strict default thresholds:

- +2 -> 10
- +3 -> 100
- +4 -> 1,000
- +5 -> 10,000

The majority creature type determines the army/band base rank.

### 4.2 Lore Master

Realm Guard adds an Effective Rank route:

- test Lore Master versus target creature Nature
- ranks gained = margin of success
- Effective Rank changes; Base Rank does not

### 4.3 Token of Power

An appropriate Token of Power may raise effective Scale for the relevant Conflict.

The source provides a Level 3 example that places the bearer at Ent rank for that Conflict. It does not provide a safe universal numeric mapping for every Token use.

Therefore existing `MANUAL_GUIDED` applicability should remain.

## 5. Important source divergence

The illustrated **Realm Guard: Rangers of the North** reference has a different army table:

- +2 -> 10
- +3 -> 50
- +4 -> 100
- +5 -> 1,000
- +6 -> 10,000

This is not the Strict default.

M10B.8 must preserve the locked policy:

> Realm Guard v1.6 is authoritative for `realm-guard-strict`. The illustrated table may only be represented later as an explicit alternate/table profile or variant.

## 6. Current implementation inventory

### 6.1 What is already good

`module/m10-strict-scale-of-might.mjs` already contains correct read-only Strict planners for:

- rank lookup / aliases
- Fighter/Hunter outcome limits
- Realm Guard v1.6 Militarist force thresholds
- Lore Master Effective Rank
- Token of Power manual guidance

The implementation is pure/read-only and should be preserved through compatibility wrappers.

`module/m10-strict-rules-reference.mjs` already provides:

- searchable/scrollable reference shell
- profile registry explanations
- source-lineage display
- zero Journal / Actor / Item / setting writes
- active-vs-preview presentation

The UX shell is reusable.

### 6.2 Remaining routing debt

#### Scale

The executable Scale implementation is Strict-only:

- exports are named `strict*`
- catalog is Realm Guard-specific
- no MG1E Natural Order catalog exists
- no generic Comparative Scale provider exists
- `profile-capabilities.mjs` only exposes shallow `naturalOrder.enabled/mode` and `scaleOfMight.enabled/mode`
- `m10-profile-service.mjs` exposes Scale only beneath `game.realmGuard.core.m10.strict`

#### Rules Reference

The detailed reference is also Strict-only:

- `m10-strict-rules-reference.mjs` resolves `realm-guard-strict` directly
- page title/content is hard-coded to Strict Realm Guard
- it checks `isStrictRealmGuard()` for active/preview state
- `manual.mjs` uses binary Strict-vs-Legacy presentation and only exposes a Strict reference preview
- MG1E has no source-owned detailed Rules Reference despite now having explicit profile ownership through M10B.7

This is the next major direct-profile block after Character Creation.

## 7. Proposed M10B.8 implementation

### 7.1 Advance MG1E foundation

Advance:

> **MG1E profile v8 -> v9**

Keep:

- `foundationOnly: true`
- `selectable: false`
- `supported: false`
- `liveRuleAuthority: false`

### 7.2 Add generic Comparative Scale provider

Recommended module:

`module/m10b-comparative-scale.mjs`

It should resolve a scale definition from any Rules Profile and expose pure/read-only planners.

Suggested API:

- `resolveM10BComparativeScalePolicy(profileId)`
- `resolveComparativeScaleDefinition(profileId)`
- `familyScaleRankFor(profileId, value)`
- `familyScaleEntry(profileId, value)`
- `familyScaleOutcomePlan(profileId, args)`
- `familyScaleGroupWarPlan(profileId, args)`
- `familyScaleSpecialPlan(profileId, args)`
- `familyScaleEffectiveRankPlan(profileId, args)`
- `familyScaleItemGuidance(profileId, args)`
- `getM10B8ComparativeScaleStatus()`

No Actor/Item/settings writes.

### 7.3 Profile-owned definitions

Recommended profile data modules:

- `module/profiles/mg1e-natural-order.mjs`
- `module/profiles/realm-guard-strict-scale.mjs`

The generic engine should not contain either game's catalog.

#### MG1E definition

Must encode:

- 9 Natural Order ranks
- Mouse base rank 3
- Fighter/Hunter outcome constraints
- MG1E Militarist army thresholds 20 / 100 / 200 / 2,000 / 20,000
- Scientist high-scale special plan
- no Token of Power/Lore Master Scale modifier

#### Strict definition

May extract/reuse the existing data from `m10-strict-scale-of-might.mjs`:

- 6 Scale of Might ranks
- Dúnadan rank 3
- v1.6 Militarist thresholds 10 / 100 / 1,000 / 10,000
- Lore Master Effective Rank
- Token of Power `MANUAL_GUIDED`

### 7.4 Capabilities

Extend `profile-capabilities.mjs` with a generic block while preserving the old Natural Order / Scale of Might flags for compatibility.

Example:

```text
comparativeScale:
  enabled
  id
  name
  mode
  profileDomain
  rankMin
  rankMax
  baseActorKind
  baseRank
  outcomePolicy
  groupWarMode
  specialSkillMode
  effectiveRankMode
  itemScaleGuidance
  liveApplication
```

Legacy Mixed should resolve to no new active Comparative Scale authority unless its existing compatibility behavior explicitly supplies one.

### 7.5 Compatibility wrapper

Keep `module/m10-strict-scale-of-might.mjs` as a historical API wrapper where existing QA/tools consume it.

It should delegate to the generic M10B.8 provider using `realm-guard-strict`.

Existing Strict outputs must remain behaviorally compatible.

### 7.6 Generic Rules Reference

Add a generic provider such as:

`module/m10b-rules-reference.mjs`

Responsibilities:

- resolve arbitrary profile + registry
- build source-lineage-aware reference snapshots
- use common page groups for shared MG-family mechanics
- inject profile-specific scale section:
  - MG1E -> Natural Order
  - Strict -> Scale of Might
- build HTML using the existing searchable reference shell
- expose read-only preview/open API for MG1E and Strict
- zero Journal/Actor/Item/settings writes

M10B.8 should not generate or replace a persistent MG1E Journal.

### 7.7 Strict reference compatibility

Keep `m10-strict-rules-reference.mjs` as a compatibility wrapper over the generic provider.

Existing APIs may remain:

- `strictRulesReferenceSnapshot()`
- `strictRulesReferenceHtml()`
- `openStrictRulesReferencePreview()`

but their source of truth should be the generic reference provider.

### 7.8 Manual routing

Refactor `manual.mjs` away from binary reference ownership.

Target behavior:

- Legacy Mixed keeps the existing embedded long-form manual and permanent Legacy Mixed Rules Journal unchanged.
- Strict active -> generic active-profile Rules Reference.
- MG1E remains non-selectable, but a read-only MG1E Rules Reference preview may be opened explicitly from M10/Profile tooling.
- no journal mutation or migration.

This is routing/presentation work, not a manual redesign.

### 7.9 M10 public API

Expose generic APIs above the historical Strict namespace, for example:

- `comparativeScaleStatus`
- `resolveComparativeScalePolicy`
- `scaleRankFor`
- `scaleOutcomePlan`
- `scaleGroupWarPlan`
- `scaleSpecialPlan`
- `rulesReferenceSnapshot(profileId)`
- `rulesReferenceHtml(profileId)`
- `openRulesReference(profileId)`

The `m10.strict.*` compatibility surface remains available.

## 8. Preservation / non-goals

M10B.8 must not:

- activate MG1E
- add MG1E to selectable profile switches
- automatically assign or migrate Comparative Scale ranks onto existing Actors
- mutate NPCs based on species/name
- enforce Natural Order/Scale of Might by blocking Conflict goals/actions live
- rewrite current Conflicts
- infer a Token of Power's fictional applicability
- merge MG1E and Realm Guard army tables
- use the illustrated Realm Guard army numbers as Strict defaults
- modify/delete the Legacy Mixed Rules Reference Journal
- create a persistent MG1E Rules Journal
- implement Torchbearer Might/Precedence yet
- add social Precedence live logic
- alter Nature values or Nature descriptors

## 9. Proposed qa.8 live gate

### Gate A — Boot / release
- qa.8 boots in Foundry 13.351
- Rules Profile Management, Manual, Ranger/NPC sheets open normally

### Gate B — Comparative Scale capability snapshot
- Legacy = no new source-owned Comparative Scale authority
- Strict = Scale of Might / Realm Guard v1.6 / rank 1-6 / Dúnadan rank 3
- MG1E v9 = Natural Order / rank 1-9 / Mouse rank 3 / foundation-only

### Gate C — Legacy Mixed regression
- ordinary rolls/conflicts/manual/journal remain compatible
- permanent Legacy Mixed Rules Journal unchanged

### Gate D — Strict compatibility
Existing Strict planners reproduce M10A.7 behavior:
- rank catalog 1-6
- Fighter/Hunter outcome bands
- v1.6 army table
- Lore Master margin -> Effective Rank
- Token of Power manual guidance

### Gate E — MG1E Natural Order catalog
Verify all nine ranks and representative lookup:
- Mouse = 3
- Weasel = 4
- Owl = 5
- Fox = 6
- Wolf = 8
- Black Bear/Moose = 9

### Gate F — MG1E Fighter/Hunter outcomes
Representative comparisons:
- Mouse -> Weasel (+1): kill/capture/injure/run off
- Mouse -> Owl (+2): no kill; capture/injure/run off
- Mouse -> Fox (+3): run off only

### Gate G — MG1E Militarist table
Verify:
- +2 = 20
- +3 = 100
- +4 = 200
- +5 = 2,000
- +6 = 20,000

### Gate H — MG1E Scientist guided plan
Verify:
- eligible against +2 or greater
- Resources Ob = target Nature
- Scientist Attack/Maneuver
- appropriate craft/trade Defend/Feint
- animal Nature for disposition/actions
- no automatic roll/Actor mutation

### Gate I — source isolation
Verify simultaneously:
- MG1E army numbers are not Realm Guard numbers
- Strict v1.6 numbers are not MG1E numbers
- illustrated Realm Guard alternate numbers are not active in Strict
- Base Rank remains separate from Effective Rank

### Gate J — generic Rules Reference
- Strict reference resolves through generic provider and remains equivalent
- MG1E reference resolves as read-only foundation preview
- MG1E scale page says Natural Order, not Scale of Might
- Strict scale page says Scale of Might and identifies Realm Guard v1.6
- both report source lineage/profile version/snapshot

### Gate K — zero-write + Manual safety
- comparative planners/reference builders write no Actor/Item/Journal/settings data
- Legacy permanent Journal unchanged
- profile round-trip does not mutate scale/reference data
- Manual remains searchable/scrollable

### Gate L — release/channel
- release tag/assets/channel all point to v1.12.0-qa.8

## 10. Likely next step after qa.8

If M10B.8 passes, the remaining work before considering an MG1E selectable QA profile should be a closure audit rather than automatically activating it.

Recommended next increment:

> **M10B.9 — MG1E Foundation Closure / Activation Readiness Audit**

That audit should prove that every source-owned domain required for normal play is profile-routed, inventory all remaining direct Legacy/Strict identity branches, and define explicit conversion/activation gates.

MG1E should not become selectable merely because M10B.8 passes.

## 11. Audit result

**READY FOR IMPLEMENTATION as v1.12.0-qa.8.**

No runtime code was changed by this audit.
