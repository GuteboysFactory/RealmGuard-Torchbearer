# Realm Guard / Torchbearer — TEST PROTOCOL v1.6.0-qa.1

**Phase:** M4 — Advancement / Nature / Conditions Services  
**Build:** v1.6.0-qa.1  
**Foundry:** v13.351  
**Baseline:** v1.5.0-qa.11 M3 VERIFIED  
**Gameplay authority:** Legacy Mixed  
**CORE M4 live application:** OFF

## Goal

Verify that the first M4 service foundation is present and observational only. This build introduces:

- lightweight CORE domain event bus
- AdvancementService shadow recommendation layer
- NatureService state/tax preview layer
- ConditionService data-driven inspection layer
- CapabilityBlockService foundation
- RecoveryService / RecoveryContext foundation

No existing Legacy Mixed advancement, Nature tax, Condition application or Recovery behavior is replaced in qa.1.

## A — Startup

```js
console.log(game.system.version);
console.log(game.realmGuard.core.m4.getStatus());
```

Expected:

- version `1.6.0-qa.1`
- phase `M4`
- mode `SHADOW_SERVICES`
- liveApplication `false`
- authority `LEGACY_MIXED`
- five services listed
- gameplayChangeIntended `false`

## B — M2 / M3 preservation

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
```

Expected:

- M2 `SHADOW_COMPARE`, live OFF
- M3 `SHADOW_PARITY`, live OFF
- Legacy Mixed authority preserved

Run one ordinary trained Skill test and verify latest M3 parity is still MATCH with all five fields true.

## C — Nature state shadow

Select/control a Ranger token:

```js
const actor = canvas.tokens.controlled[0]?.actor;
console.log(game.realmGuard.core.m4.nature.state(actor));
```

Expected values must match the Ranger sheet:

- current
- maximum
- tax = maximum - current
- descriptors may be empty in current Legacy data; this is allowed in qa.1

No Actor data may change from this call.

## D — Nature tax preview

```js
console.log(game.realmGuard.core.m4.nature.previewTax(actor, 1));
```

Expected:

- returns before/current/maximum/tax/collapsed preview
- `liveApplication: false`
- Ranger Nature values remain unchanged after the call

Then exercise deterministic tax recommendations:

```js
const n = game.realmGuard.core.m4.nature;
console.log("Tap within PASS", n.taxForResult({outcome:"PASS",passed:true,margin:0},{tapped:true,scope:"within"}));
console.log("Tap against PASS", n.taxForResult({outcome:"PASS",passed:true,margin:0},{tapped:true,scope:"against"}));
console.log("Direct against FAIL 2", n.taxForResult({outcome:"FAIL",passed:false,margin:2},{direct:true,scope:"against"}));
```

Expected:

- Tap within PASS = 0
- Tap against PASS = 1
- Direct against FAIL margin 2 = 2

## E — Conditions data-driven inspection

```js
console.table(game.realmGuard.core.m4.conditions.list(actor));
```

Expected:

- every embedded Condition appears
- active state matches sheet
- rollModifier / appliesTo / recovery metadata matches Item data
- custom Conditions have `custom: true`

Activate a Condition with a roll modifier, e.g. Strained or Injured, then:

```js
console.log(game.realmGuard.core.m4.conditions.collectRollEffects(actor, "Fighter", {isSkill:true}));
```

Expected diceModifier must match current Legacy condition calculation. No extra modifier is applied by CORE.

## F — Custom Condition first-class check

Create a custom Condition with a unique name, for example `QA Windburn`:

- active ON
- Roll Modifier -1
- Affects rolls `skills`
- Recovery Ability Will, Ob 2 (or another valid custom setup)

Then:

```js
console.table(game.realmGuard.core.m4.conditions.list(actor));
const custom = actor.items.find(i => i.type === "condition" && i.name === "QA Windburn");
console.log(game.realmGuard.core.m4.conditions.recoveryContext(actor, custom.id));
console.log(game.realmGuard.core.m4.conditions.collectRollEffects(actor, "QA Bog Lore", {isSkill:true}));
```

Expected:

- `QA Windburn` appears with `custom: true`
- recovery context uses the custom Item's fields
- custom modifier participates by data, not canonical name
- no migration/rename/replacement of the custom Condition

## G — Capability block foundation

Activate Angry and/or Afraid if present:

```js
console.log(game.realmGuard.core.m4.capabilityBlocks.collect(actor));
```

Expected in Legacy Mixed shadow model:

- Angry -> BENEFICIAL_TRAIT_WISE block
- Afraid -> HELP and BEGINNER_LUCK blocks

This is observational only in qa.1. Existing live rules remain authoritative.

## H — RecoveryContext

Choose one active Condition:

```js
const condition = actor.items.find(i => i.type === "condition" && i.system.active);
console.log(game.realmGuard.core.m4.recovery.context(actor, condition.id));
```

Expected:

- context = `recovery`
- correct Condition id/name
- correct recovery type / ability / role / obstacle
- customCondition correctly true/false
- liveApplication false

## I — Advancement shadow recommendation / event bus

Clear shadow history:

```js
game.realmGuard.core.m4.advancement.clear();
```

Emit a synthetic TEST_RESOLVED event (this must NOT alter Actor advancement):

```js
game.realmGuard.core.m4.events.emitTestResolved({
  context: "ordinary",
  sourceKind: "role",
  sourceId: "qa-skill",
  sourceName: "QA Bog Lore",
  outcome: "PASS",
  countLearning: true
});
console.log(game.realmGuard.core.m4.advancement.getLatest());
```

Expected:

- mode `SKILL_PASS_FAIL`
- eligible true
- passed true
- liveApplication false

Then tie:

```js
game.realmGuard.core.m4.events.emitTestResolved({
  context: "versus",
  sourceKind: "role",
  sourceName: "QA Bog Lore",
  outcome: "TIE",
  countLearning: true
});
console.log(game.realmGuard.core.m4.advancement.getLatest());
```

Expected:

- eligible false
- reason `TIE_DOES_NOT_ADVANCE`

Then Beginner's Luck:

```js
game.realmGuard.core.m4.events.emitTestResolved({
  context: "beginnerLuck",
  sourceKind: "role",
  sourceName: "QA New Skill",
  outcome: "FAIL",
  countLearning: true
});
console.log(game.realmGuard.core.m4.advancement.getLatest());
```

Expected mode `BEGINNER_ATTEMPT`.

No Skill rating, Pass/Fail mark or beginnerAttempts value may change from these synthetic shadow events.

## J — Live regression

Verify current Legacy Mixed behavior still works normally:

- ordinary Skill roll
- Ability roll
- direct Nature roll
- Condition modifier
- Recovery button
- Skill/Ability advancement behavior
- Beginner's Luck attempt tracking

No duplicate chat cards, duplicate advancement, duplicate Nature tax or duplicate Condition removal.

## K — Reload

Reload Foundry and rerun:

```js
console.log(game.realmGuard.core.m4.getStatus());
console.log(game.realmGuard.core.m4.events.listenerCount("TEST_RESOLVED"));
```

Expected:

- M4 API present
- TEST_RESOLVED listener count = 1

## PASS gate

- M4 five service boundaries available
- domain event bus available
- M2 preserved
- M3 preserved
- Nature state/tax preview correct and non-mutating
- Conditions data-driven inspection correct
- custom Condition supported by fields, not name
- RecoveryContext correct
- Advancement recommendation correct and non-mutating
- no duplicate event listener after reload
- live Legacy behavior unchanged
- M4 liveApplication OFF

If all pass: `v1.6.0-qa.1 = PASS` and proceed to M4 qa.2, where real Legacy TEST_RESOLVED results can begin shadow-feeding AdvancementService automatically without live takeover.
