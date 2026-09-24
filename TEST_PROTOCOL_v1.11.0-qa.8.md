# v1.11.0-qa.8 — M10A.7 Scale / Docs / Rules Reference QA

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Active gameplay profile:** Realm Guard — Legacy Mixed  
**Strict gameplay authority:** OFF  
**Profile switching:** LOCKED  
**Strict Scale live application:** OFF  
**Strict Rules Reference writes:** OFF

## Gate A — update / boot

Update to **v1.11.0-qa.8** and open the same test world.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- no Actor/Item/world-setting migration
- existing permanent Rules Reference Journal is not replaced or rewritten
- no red console-breaking error.

## Gate B — M10 / Scale status

Run:

```js
game.system.version
game.realmGuard.core.m10.getStatus()
game.realmGuard.core.m10.strict.scaleStatus()
```

Expected:
- version = `1.11.0-qa.8`
- phase = `M10A.7`
- strictRulesLive = false
- scaleWrites = false
- rulesReferenceWrites = false
- Scale mode = MANUAL_GUIDED
- Dúnadan rank = 3
- Scale min/max = 1/6
- next step = M10A.8 Profile Activation QA.

## Gate C — Scale rank lookup

```js
({
  hobbit: game.realmGuard.core.m10.strict.scaleRankFor("Hobbit"),
  man: game.realmGuard.core.m10.strict.scaleRankFor("Man"),
  dunadan: game.realmGuard.core.m10.strict.scaleRankFor("Dúnadan"),
  caveTroll: game.realmGuard.core.m10.strict.scaleRankFor("Cave-Troll"),
  ent: game.realmGuard.core.m10.strict.scaleRankFor("Ent"),
  dragon: game.realmGuard.core.m10.strict.scaleRankFor("Dragon")
})
```

Expected:
- Hobbit 1
- Man 2
- Dúnadan 3
- Cave-Troll 4
- Ent 5
- Dragon 6.

## Gate D — Fighter / Hunter outcome policy

```js
({
  troll: game.realmGuard.core.m10.strict.fighterHunterOutcomePlan({actorType:"Dúnadan",targetType:"Cave-Troll"}),
  ent: game.realmGuard.core.m10.strict.fighterHunterOutcomePlan({actorType:"Dúnadan",targetType:"Ent"}),
  dragon: game.realmGuard.core.m10.strict.fighterHunterOutcomePlan({actorType:"Dúnadan",targetType:"Dragon"})
})
```

Expected:
- Cave-Troll (+1): kill/capture/injure/run off = true
- Ent (+2): kill false; capture/injure/run off true
- Dragon (+3): only run off true
- all liveApplication = false.

## Gate E — Militarist

```js
({
  short: game.realmGuard.core.m10.strict.militaristWarPlan({armyRank:2,targetRank:5,forceSize:75}),
  enough: game.realmGuard.core.m10.strict.militaristWarPlan({armyRank:2,targetRank:5,forceSize:100}),
  plus2: game.realmGuard.core.m10.strict.militaristWarPlan({armyRank:2,targetRank:4,forceSize:10}),
  plus4: game.realmGuard.core.m10.strict.militaristWarPlan({armyRank:1,targetRank:5,forceSize:1000}),
  plus5: game.realmGuard.core.m10.strict.militaristWarPlan({armyRank:1,targetRank:6,forceSize:10000})
})
```

Expected:
- +2 requires 10
- +3 requires 100
- +4 requires 1000
- +5 requires 10000
- force 75 against +3 is ineligible
- force 100 against +3 is eligible
- majorityCreatureTypeDeterminesArmyRank = true.

## Gate F — Lore Master

```js
game.realmGuard.core.m10.strict.loreMasterScalePlan({
  baseRank:3,
  successMargin:2
})
```

Expected:
- opposedBy = CREATURE_NATURE
- ranksGained = 2
- effectiveRank = 5
- liveApplication = false.

## Gate G — Token of Power Scale guidance

```js
({
  no: game.realmGuard.core.m10.strict.tokenScaleGuidance({tokenLevel:3,applicable:false}),
  yes: game.realmGuard.core.m10.strict.tokenScaleGuidance({tokenLevel:3,applicable:true})
})
```

Expected:
- mode = MANUAL_GUIDED
- exactNumericAutomation = false
- useHighestApplicableToken = true
- published Level 3 example = rank 5 / Ent
- no live application.

## Gate H — Strict Rules Reference snapshot

```js
game.realmGuard.core.m10.strict.rulesReferenceSnapshot()
```

Expected:
- profileId = realm-guard-strict
- profileVersion = 8
- phase = M10A.7
- activationState = PREVIEW_ONLY
- sourceLineage = Mouse Guard RPG 2008 / 1E -> Realm Guard v1.6 overrides
- writesJournal/Actors/Items/WorldSettings = false
- pages include Scale, Rated Wises/Traits/Help, Conditions, Session/Circles and Strict Character Creation.

## Gate I — Manual UI

Open **System Manual**.

Expected:
- current active profile is shown explicitly as Realm Guard — Legacy Mixed
- the normal embedded manual remains the Legacy Mixed reference
- button **Preview Strict Rules** exists
- button **Open Legacy Mixed Rules Journal** exists
- the content area is independently scrollable when the window is shorter than the document
- a sticky **Search manual & rules…** field is visible
- **Expand All** / **Collapse All** controls are visible
- typing a term such as `Conditions` hides non-matching detail sections and opens matching sections
- clearing the search restores all sections and their pre-search open/closed state.

Open **Preview Strict Rules**.

Expected:
- separate non-modal read-only Strict reference
- independent scrollable content area
- sticky **Search Strict rules…** field
- **Expand All** / **Collapse All** controls
- search filters matching Strict sections live and Clear/Escape restores the full reference
- visible source lineage MG1E 2008 -> RG v1.6
- Scale of Might section
- rated Wises
- Strict Conditions
- LOOSE inventory
- Levels/Talents disabled
- no profile switch or save action.

## Gate J — permanent Journal safety

Open the existing permanent Rules Reference Journal.

Expected:
- existing Journal content is unchanged
- qa.8 does not create a second Strict Journal automatically
- no page overwrite
- no world-setting write.

## Gate K — Legacy Mixed regression + reload

Perform a representative Legacy Mixed smoke:
- normal roll
- inventory/paper-doll
- Recruitment 2.0
- Turn Manager / Conflict if convenient
- reload world.

Expected:
- Legacy behavior unchanged
- active profile still Legacy Mixed
- Strict profile switch still locked
- no red console error.

## PASS

qa.8 passes when source-backed Scale planners and the Strict read-only reference are correct, no Strict live writes occur, the existing Legacy Mixed manual/Journal remain intact, and Legacy Mixed gameplay remains unchanged.

After PASS, perform a fresh read-only audit for **M10A.8 — Profile Activation QA** before any mutation.
