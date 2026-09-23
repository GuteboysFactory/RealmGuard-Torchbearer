# v1.11.0-qa.4 — M10A.3 Conditions / Recovery QA

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Active gameplay profile:** Realm Guard — Legacy Mixed  
**Strict gameplay authority:** OFF  
**Profile switching:** LOCKED  
**Strict Condition/Recovery writes:** OFF

## Gate A — update / boot

Update to **v1.11.0-qa.4** through the QA manifest and open the same test world.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- the existing 61 Fresh Items remain intact
- Afraid, Fresh and other Legacy Mixed Conditions remain behaviorally unchanged
- no Actor/Item migration or conversion prompt
- no new console-breaking error.

## Gate B — M10 status

Run:

```js
game.realmGuard.core.m10.getStatus()
game.realmGuard.core.m10.strict.conditionsRecoveryStatus()
```

Expected:
- phase = `M10A.3`
- strictRulesLive = false
- conditionWrites = false
- recoveryWrites = false
- Strict Healthy = DERIVED
- Strict ignored Legacy Conditions = Fresh / Afraid
- Strict sickReplacement = Strained
- next step = M10A.4 Gear / Inventory / Conflict Ownership.

## Gate C — derived Healthy + preserved Fresh/Afraid

Pick a Ranger with Fresh and no active Strict adverse Conditions:

```js
const a = game.actors.find(x => x.type === "character")
game.realmGuard.core.m10.strict.healthyState(a)
game.realmGuard.core.m10.strict.conditionProvisionPlan(a)
```

Expected:
- Healthy is derived; no Healthy Item required
- Fresh/Afraid are listed under ignored/preserved if present
- provision plan has `writesPlanned: 0`
- no Fresh/Afraid deletion or creation
- no Sick→Strained mutation is executed by this planner.

## Gate D — Strict condition roll policy

For an Actor with active Injured or Strained, run representative calls:

```js
game.realmGuard.core.m10.strict.conditionRollEffects(a, "Pathfinder", {isSkill:true})
game.realmGuard.core.m10.strict.conditionRollEffects(a, "Will", {isSkill:false, recovery:true})
game.realmGuard.core.m10.strict.conditionRollEffects(a, "Resources", {isSkill:false})
```

Expected:
- active Injured/Strained each contribute -1D to relevant Skill/Nature/Will/Health tests
- Will/Health recovery ignores their penalty
- Resources/Circles ignore their penalty
- Fresh/Afraid appear only as preserved/ignored Strict data.

## Gate E — zero-rating policy

Run:

```js
game.realmGuard.core.m10.strict.zeroRatingPolicy({baseRating:1,conditionDice:-1})
```

Expected:
- modifiedRating = 0
- zeroedByCondition = true
- Beginner's Luck = false
- Teamwork = false
- self Help/I Am Wise = false
- Persona = false
- Nature required if the test is attempted.

## Gate F — recovery method plans

Run on a representative Ranger:

```js
game.realmGuard.core.m10.strict.recoveryMethods(a, "Hungry & Thirsty")
game.realmGuard.core.m10.strict.recoveryMethods(a, "Angry")
game.realmGuard.core.m10.strict.recoveryMethods(a, "Tired")
game.realmGuard.core.m10.strict.recoveryMethods(a, "Injured")
game.realmGuard.core.m10.strict.recoveryMethods(a, "Strained")
```

Expected:
- Hungry includes Harvester, Cook, Brewer, Baker, Resources at Ob 1 plus narrative feeding
- Angry = Will Ob 2
- Tired = Health Ob 3 plus Resources Ob 2 / good-night's-rest route
- Injured = Health Ob 4
- Strained = Will Ob 4
- Will/Health recovery methods expose Help = false.

## Gate G — recovery Help restriction

Run:

```js
game.realmGuard.core.m10.strict.recoveryHelpPolicy({methodKind:"ability",methodName:"Will"})
game.realmGuard.core.m10.strict.recoveryHelpPolicy({methodKind:"ability",methodName:"Health"})
game.realmGuard.core.m10.strict.recoveryHelpPolicy({methodKind:"skill",methodName:"Harvester"})
```

Expected:
- Will recovery Help = false
- Health recovery Help = false
- Harvester follows normal Help rules
- Strict Synergy remains false.

## Gate H — Injured state machine

Run:

```js
game.realmGuard.core.m10.strict.recoveryState("Injured",{passed:false})
game.realmGuard.core.m10.strict.recoveryState("Injured",{passed:false,route:"HEALER",priorState:"HEALER_REQUIRED"})
game.realmGuard.core.m10.strict.injuryWaiverPlan({phase:"player"})
game.realmGuard.core.m10.strict.permanentReductionTargets(a)
```

Expected:
- failed Health recovery → `HEALER_REQUIRED`, Healer Ob 3
- failed Healer → `PERMANENT_REDUCTION_REQUIRED`
- Players' Turn waiver is allowed and costs 0 Checks
- permanent reduction target list excludes Resources/Circles
- target is never auto-selected.

## Gate I — Strained counsel state machine

Run:

```js
game.realmGuard.core.m10.strict.recoveryState("Strained",{passed:false})
game.realmGuard.core.m10.strict.recoveryState("Strained",{passed:false,route:"COUNSEL",priorState:"COUNSEL_REQUIRED",phase:"gm",turnManagerEnabled:true,checks:1})
game.realmGuard.core.m10.strict.recoveryState("Strained",{passed:false,route:"COUNSEL",priorState:"COUNSEL_REQUIRED",phase:"gm",turnManagerEnabled:true,checks:2})
```

Expected:
- failed Ob 4 Will → `COUNSEL_REQUIRED`
- 1 Check in GM Turn is insufficient
- 2 Checks allows counsel/recovery
- planner itself performs no Check spend or Condition mutation.

## Gate J — helper lesser-condition options

Run:

```js
game.realmGuard.core.m10.strict.lesserConditionOptions("Angry")
game.realmGuard.core.m10.strict.lesserConditionOptions("Injured")
game.realmGuard.core.m10.strict.lesserConditionOptions("Strained")
```

Expected:
- Angry → Hungry & Thirsty
- Injured → Hungry & Thirsty / Angry / Tired
- Strained → Hungry & Thirsty / Angry / Tired / Injured
- Fresh/Afraid never appear
- autoApply = false.

## Gate K — Legacy Mixed regression + reload

Perform:
- normal Legacy Mixed Skill roll
- Condition toggle
- current Legacy recovery control
- Help/Synergy spot-check if convenient
- reload world.

Expected:
- Legacy Mixed remains unchanged
- 61 Fresh Items survive
- Profile Management remains available
- Strict Switch remains locked
- no Strict Condition/Recovery policy becomes live.

## PASS

qa.4 passes when Strict Conditions/Recovery policy and state planning match the source-backed M10A.3 contract while all operations remain non-live/read-only and Legacy Mixed remains behaviorally unchanged.

After PASS, perform a fresh read-only audit for **M10A.4 — Gear / Inventory / Conflict Ownership** before any mutation.
