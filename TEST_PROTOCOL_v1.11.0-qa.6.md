# v1.11.0-qa.6 — M10A.5 Session / Circles / Progression QA

**QA RESULT:** 🟢✅ FULL PASS — M10A.5 Session / Circles / Progression policy, End Session ownership, Circles/Enmity, Strict resource-spend separation, advancement, Beginner's Luck, reload and Legacy Mixed regression verified in Foundry VTT 13.351.  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Active gameplay profile:** Realm Guard — Legacy Mixed  
**Strict gameplay authority:** OFF  
**Profile switching:** LOCKED  
**Strict Session/Circles/Progression writes:** OFF

## Gate A — update / boot

Update to **v1.11.0-qa.6** and open the same test world.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- no Actor/Item migration
- existing Level/Talent/progression fields remain intact
- no new console-breaking error.

## Gate B — M10 status

Run:

```js
game.realmGuard.core.m10.getStatus()
game.realmGuard.core.m10.strict.sessionCirclesProgressionStatus()
```

Expected:
- phase = `M10A.5`
- strictRulesLive = false
- sessionWrites = false
- circlesWrites = false
- progressionWrites = false
- session engine = CORE_M7
- Circles storage = CORE_M8_FOUNDRY_TOOLING
- Levels/Talents = false
- next step = M10A.6 Strict Character Creation.

## Gate C — Players' Turn / Checks

Use a plain shadow Actor:

```js
const s = {
  id:"strict-session-a",
  type:"character",
  system:{
    resources:{
      checks:{value:2,max:9},
      fate:{value:4,max:5},
      persona:{value:3,max:5}
    },
    progression:{level:4,spentFate:14,spentPersona:9}
  },
  items:{contents:[]}
}
```

First free test:

```js
game.realmGuard.core.m10.strict.playerTurnTestPlan({
  actor:s,
  actorState:{freeUsed:false,testsTaken:0,checksSpent:0,done:false},
  sessionState:{enabled:true,phase:"player",lastActorId:"",actors:[{id:"strict-session-a",done:false},{id:"B",done:false}]}
})
```

Expected:
- source = free
- cost = 0.

Second test after another Actor:

```js
game.realmGuard.core.m10.strict.playerTurnTestPlan({
  actor:s,
  actorState:{freeUsed:true,testsTaken:1,checksSpent:0,done:false},
  sessionState:{enabled:true,phase:"player",lastActorId:"B",actors:[{id:"strict-session-a",done:false},{id:"B",done:false}]}
})
```

Expected:
- source = check
- cost = 1.

Same Actor twice with another active participant should return `reasonCode: "alternation"`.
A sole active participant may continue.

## Gate D — GM Turn recovery cost

```js
game.realmGuard.core.m10.strict.recoveryCheckPlan({
  actor:s,
  conditionName:"Tired",
  sessionState:{enabled:true,phase:"gm",turnCycleId:1,actors:[{id:"strict-session-a",done:false}]}
})
```

Expected:
- cost = 2
- source = gm-checks
- no live spend.

## Gate E — End Session / Embodiment

```js
({
  solo: game.realmGuard.core.m10.strict.endSessionValidation({
    participantIds:["A"], embodimentIds:["A"]
  }),
  everyone: game.realmGuard.core.m10.strict.endSessionValidation({
    participantIds:["A","B"], embodimentIds:["A","B"]
  }),
  valid: game.realmGuard.core.m10.strict.endSessionValidation({
    participantIds:["A","B"],mvpId:"A",workhorseId:"B",embodimentIds:["A"]
  })
})
```

Expected:
- solo = invalid
- everyone = invalid
- valid = true
- tableAuthority = GROUP_CONSENSUS
- foundryCommitAuthority = GM.

## Gate F — Reward proposal

```js
game.realmGuard.core.m10.strict.rewardProposal({
  actorId:"A",
  criteria:{
    fateBelief:true,
    fateGoal:true,
    fateInstinct:true,
    personaGoal:true,
    personaAgainstBelief:true,
    personaEmbodiment:true
  },
  mvpId:"A",
  workhorseId:"B"
})
```

Expected:
- Fate = 2 because completed Goal suppresses Goal-progress Fate
- Persona = 4 max
- group consensus / GM commit metadata present
- no live resource write.

## Gate G — Circles known contact

```js
game.realmGuard.core.m10.strict.circlesContactPlan({
  knownContact:true,
  successful:true
})
```

Expected:
- futureCirclesDice = 1
- successCreatesOrConfirmsContact = true
- socialStorage = CORE_M8_FOUNDRY_TOOLING
- no automatic NPC creation.

## Gate H — Enmity disposition

```js
({
  argument: game.realmGuard.core.m10.strict.enmityDispositionPlan({
    relationshipRole:"enemy",
    relationshipStatus:"hostile",
    conflictType:"argument",
    againstRelationshipOwner:true
  }),
  fight: game.realmGuard.core.m10.strict.enmityDispositionPlan({
    relationshipRole:"enemy",
    relationshipStatus:"hostile",
    conflictType:"fight",
    againstRelationshipOwner:true
  })
})
```

Expected:
- argument active = true, dispositionSuccess = 3
- fight active = false, dispositionSuccess = 0
- scope is argument/speech against the relationship owner only.

## Gate I — Levels / Talents preserved but disabled

Use a real Ranger or shadow object with progression data / Talent Item:

```js
game.realmGuard.core.m10.strict.progressionDataPolicy(s)
```

Expected:
- levelsEnabled = false
- talentsEnabled = false
- lifetimeSpendLevelTrackingEnabled = false
- preserveExistingData = true
- deletionPlanned = false
- migrationPlanned = false.

## Gate J — Fate/Persona spend is separated from Levels

```js
game.realmGuard.core.m10.strict.resourceSpendPlan(s,"fate",1)
```

Expected:
- resource before 4 → after 3
- level remains 4
- spentFate remains 14
- levelUp = false
- talentUnlocks = 0
- writesExecuted = 0.

## Gate K — advancement requirements

```js
({
  r3: game.realmGuard.core.m10.strict.advancementRequirements(3),
  r1: game.realmGuard.core.m10.strict.advancementRequirements(1),
  ready: game.realmGuard.core.m10.strict.advancementPlan({rating:3,passed:3,failed:2})
})
```

Expected:
- rating 3 = 3 Pass / 2 Fail
- rating 1 = 1 Pass / 0 Fail
- ready advances to 4 and clears Pass/Fail slate.

## Gate L — one advancement test per conflict/scene

```js
const first = game.realmGuard.core.m10.strict.conflictAdvancementPlan({
  sceneOrConflictId:"C1",abilityOrSkillId:"fighter",loggedKeys:[],result:"pass"
})
const second = game.realmGuard.core.m10.strict.conflictAdvancementPlan({
  sceneOrConflictId:"C1",abilityOrSkillId:"fighter",loggedKeys:first.nextLoggedKeys,result:"fail"
})
({first,second})
```

Expected:
- first eligible = true
- second eligible = false
- second duplicateBlocked = true.

## Gate M — Beginner's Luck learning

```js
({
  before: game.realmGuard.core.m10.strict.beginnerLearningPlan({maximumNature:5,attempts:3,attempted:true}),
  opens: game.realmGuard.core.m10.strict.beginnerLearningPlan({maximumNature:5,attempts:4,attempted:true})
})
```

Expected:
- 4/5 does not open
- 5/5 opens at rating 2
- Will/Health advancement allowed = false.

## Gate N — Legacy Mixed regression + reload

Perform:
- normal Legacy Mixed Fate/Persona spend if safe
- confirm existing Level/Talent workflow remains unchanged
- normal End Session/Turn Manager smoke if convenient
- normal Circles Contact/Enmity smoke if convenient
- reload world.

Expected:
- Legacy Mixed remains unchanged
- existing progression data survives
- Strict switch remains locked
- no Strict planner becomes live
- no red console error.

## PASS

qa.6 passes when Strict Session / Circles / Progression policy matches MG1E ownership, Level/Talent side effects are disabled only in Strict planning, all legacy data is preserved, and Legacy Mixed remains behaviorally unchanged.

After PASS, perform a fresh read-only audit for **M10A.6 — Strict Character Creation** before mutation.
