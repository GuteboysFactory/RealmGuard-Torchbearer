# v1.11.0-qa.7 — M10A.6 Strict Character Creation QA

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Active gameplay profile:** Realm Guard — Legacy Mixed  
**Strict gameplay authority:** OFF  
**Profile switching:** LOCKED  
**Strict Character Creation live commit:** OFF

## Gate A — update / boot

Update to **v1.11.0-qa.7** and open the same test world.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- existing Recruitment 2.0 remains normal live creation
- no Actor/Item migration
- no existing creation provenance rewritten
- no new console-breaking error.

## Gate B — M10 / creation status

Run:

```js
game.system.version
game.realmGuard.core.m10.getStatus()
game.realmGuard.core.m10.strict.creationStatus()
```

Expected:
- version = `1.11.0-qa.7`
- phase = `M10A.6`
- strictRulesLive = false
- creationWrites = false
- strictCreationLiveCommit = false
- Strict creation profile id = `realm-guard-strict`
- CORE engine = CORE_M9
- ratedWises = true
- startingSkillWiseCap = 6
- inventory = LOOSE
- Levels/Talents = false
- next step = M10A.7 Scale / Docs / Rules Reference.

## Gate C — Strict Scout draft

Create a source-valid Scout preview:

```js
const seed = {
  mode:"guided",
  answers:{
    name:"Strict Scout QA",
    concept:"qa7",
    background:"Strict preview.",
    rank:"scout",
    age:30,
    homelandKey:"bree",
    homelandSkill:"Farmer",
    homelandTrait:"Short",
    natureAnswers:{danger:false,secondAge:false,loss:false,wilds:false,married:false,enemyFirst:false},
    apprenticeship:"Farmer",
    mentorTraining:"Scout",
    specialty:"Pathfinder",
    resourceAnswers:{trade:true,parentsWealth:false,gifts:false,thrifty:false,debt:false,pack:false},
    resourceTrade:"Farmer",
    parentsResourceProfession:"",
    circleAnswers:{gregarious:true,rangerTies:false,reputation:false,enemies:false,crime:false,loner:false},
    rangerTiesBasis:"",
    innateTrait:"Calm",
    inheritedTrait:"",
    roadTrait:"",
    mentorRuleConfirmed:true,
    allowEnemyServant:false,
    relationships:{
      lineage:"House QA",
      insignia:"White Star",
      mother:{name:"Mara",profession:"Farmer",location:"Bree"},
      father:{name:"",profession:"",location:""},
      seniorArtisan:{name:"Harl",profession:"Farmer",location:"Bree"},
      mentor:{name:"Tor",role:"Veteran",location:"Bree",age:50},
      friend:{name:"Pip",profession:"Miller",location:"Bree"},
      enemy:{name:"Rusk",people:"Man",profession:"Bandit",location:"Bree-land"}
    },
    drives:{belief:"Guard the road.",goal:"Find the ford.",instinct:"Check the trail."},
    weapon:"Sword",
    armor:"Leather Armor",
    distinctiveGear:"Rope"
  },
  allocations:{
    naturalTalent:["Scout"],
    parentsTrade:["Farmer"],
    convincing:["Persuader"],
    serviceAlloc:{Scout:3,Pathfinder:3},
    wiseChoices:["Road-wise","Road-wise"]
  }
}
const d = game.realmGuard.core.m10.strict.createCreationDraft(seed)
game.realmGuard.core.m10.strict.creationReview(d)
```

Expected:
- profile = realm-guard-strict
- Will 3 / Health 5
- service budget = 6
- Wise budget = 2
- Road-wise checks = 2
- derived Road-wise rating = 3.

## Gate D — full Strict validation

```js
game.realmGuard.core.m10.strict.validateCreation(d)
```

Expected:
- valid = true
- no Strict Enemy/Mentor errors.

## Gate E — rated Wise commit plan

```js
const p = game.realmGuard.core.m10.strict.creationCommitPlan(d)
({
  profileId:p.profileId,
  profileVersion:p.profileVersion,
  liveMutation:p.liveMutation,
  transaction:p.transaction,
  wises:p.provisioning.wises,
  conditions:p.provisioning.canonicalConditions,
  inventory:p.provisioning.inventory
})
```

Expected:
- profileId = realm-guard-strict
- liveMutation = false
- transaction.liveExecution = false
- Road-wise rating = 3
- learning = 3 Pass / 2 Fail needed
- inventory policy = LOOSE
- slotPlacementAuthority = false
- placement metadata may remain for presentation.

## Gate F — Strict conditions in creation preview

```js
game.realmGuard.core.m10.strict.creationCommitPreview(d)
```

Expected projected conditions:
- Hungry & Thirsty
- Angry
- Tired
- Injured
- Strained

Expected absent:
- Fresh
- Afraid
- Sick

Every preview operation must remain disabled / non-live.

## Gate G — Enemy rule

Create a copy with Enemy people = Orc:

```js
const badEnemy = game.realmGuard.core.m10.strict.createCreationDraft({
  ...seed,
  answers:{
    ...seed.answers,
    relationships:{
      ...seed.answers.relationships,
      enemy:{name:"Grish",people:"Orc",profession:"Raider",location:"Misty Mountains"}
    }
  }
})
game.realmGuard.core.m10.strict.validateCreationStep("relationships",badEnemy)
```

Expected:
- invalid
- `STRICT_ENEMY_PEOPLE_INVALID`.

With `allowEnemyServant:true`, expected:
- `STRICT_ENEMY_HOUSE_RULE_DISABLED`.

A Dúnadan/Dwarf/Elf/Hobbit/Man Enemy remains valid.

## Gate H — Recruit Mentor rule

Use a Recruit draft whose mentor is a real test-world Ranger by exact name.

```js
game.realmGuard.core.m10.strict.creationPartyContext()
```

Verify the context includes:
- actorId
- name
- station
- age
- traits.

Then validate a Recruit:
- Scout mentor → invalid
- Veteran or Captain PC mentor → valid.

## Gate I — Captain/Lord Mentor rule

For Captain/Lord:
- mentor without Greybeard → invalid
- mentor with Greybeard → valid.

The validator may use either matching world-Actor metadata or explicit preview mentor metadata.

## Gate J — no Levels / Talents / house-rule grants

Inspect the valid commit plan:

Expected:
- no Talent provisioning
- no Strict Level semantics
- `recruitmentEnemyHouseRule` absent from new Strict Actor flags
- Strict profile/provenance markers present in the plan
- automatic NPC creation = false.

## Gate K — provenance / transaction boundary

Inspect:

```js
({
  provenance:p.provenance,
  transaction:p.transaction,
  relationships:p.relationships
})
```

Expected:
- provenance profileId = realm-guard-strict
- profileVersion = 1
- relationship plan targets CORE M8
- liveWrite = false
- provenanceWrite = false in qa.7 preview
- relationshipWrite = false
- compensating rollback contract retained for future activation
- no Actor is created.

## Gate L — Legacy Mixed regression + reload

Perform:
- open Recruitment 2.0 normally
- move through representative steps
- create a disposable Legacy Mixed Ranger if safe
- verify existing unrated Wise creation remains unchanged
- verify current structured inventory placement remains unchanged
- verify current Legacy Enemy house-rule option remains unchanged
- reload world.

Expected:
- Legacy Mixed M9 live creation unchanged
- CreationProvenance still writes normally for a Legacy-created Ranger
- M8 relationship normalization still works
- Strict creation API stays preview-only
- Strict profile switch remains locked
- no red console errors.

## PASS

qa.7 passes when Strict Character Creation can be drafted, fully validated and previewed through CORE M9 with source-correct rated Wises, Enemy/Mentor rules, Strict condition provisioning and LOOSE inventory ownership while performing zero Strict live writes and preserving Legacy Mixed Recruitment unchanged.

After PASS, perform a fresh read-only audit for **M10A.7 — Scale / Docs / Rules Reference** before mutation.
