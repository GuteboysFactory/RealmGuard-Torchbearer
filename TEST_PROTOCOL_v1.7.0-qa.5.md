# TEST PROTOCOL — v1.7.0-qa.5

## Scope

M5 Gear / Inventory / Conflict Tool CORE service foundation.

This build is deliberately **shadow/read-only**. Legacy Mixed remains the sole live writer for Inventory placement and Conflict behavior.

## A — Version / service status

```js
console.log(game.system.version);
console.log(game.realmGuard.core.m5.getStatus());
```

Expected:
- `1.7.0-qa.5`
- `phase: M5`
- `mode: SHADOW_SERVICES`
- `liveApplication: false`
- `authority: LEGACY_MIXED`
- `inventoryPolicy: STRUCTURED`
- all six M5 services listed
- `coreDefaultDice: 0`
- `legacyMixedCompatibilityDice: -1`

## B — Existing Equipment UX regression

Open a normal Ranger and Inventory & Gear.

Verify:
- approved Equipment artwork remains visible
- no old paper/mannequin fallback returns
- Character Art / Ancestry / Custom Figure controls still work
- gear drag/drop still works
- Head / Neck / Cloak / Hands / Torso / Belt / Pocket / Feet still work
- 2H locking still works
- Backpack / Satchel capacity still works
- Containers still accept valid Gear
- invalid placement still gives the existing Legacy message
- F5 preserves assignments

No visual or gameplay behavior should change from qa.4.

## C — M5 Actor snapshot

```js
const a = game.actors.getName("DIN RANGER");
console.log(game.realmGuard.core.m5.actorSnapshot(a));
```

Expected:
- `policy.mode === "STRUCTURED"`
- Gear is listed without mutation
- inventory mode/location/container data matches the sheet
- equipped/stored state matches current Gear
- active Containers show capacity/used/remaining

## D — PlacementValidator shadow checks

Choose one Gear Item:

```js
const a = game.actors.getName("DIN RANGER");
const g = a.items.find(i => i.type === "gear");
console.log(game.realmGuard.core.m5.inventory.validateZone(a, g.id, "right-hand"));
```

Expected:
- returns `{ok:true...}` for a legal placement
- returns `{ok:false, reason:"..."}` when the current structured rules reject it
- **the Item must not move**; this is validation only

Test a known invalid case where practical:
- non-cloak into Cloak
- second item into occupied Hand
- item opposite an equipped 2H weapon
- oversized item into Belt/Pocket

Shadow result should agree with current Legacy behavior.

## E — ContainerService shadow checks

With an active Backpack/Satchel:

```js
const a = game.actors.getName("DIN RANGER");
const c = a.items.find(i => i.type === "gear" && ["backpack","satchel","custom"].includes(i.system.inventory?.containerType));
console.log(game.realmGuard.core.m5.containers.usage(a, c));
```

Expected:
- correct `capacity`
- correct `used`
- correct `remaining`
- correct `active`
- no Item mutation

## F — Physical Conflict Tools

For a Ranger holding a normal Fight weapon/tool:

```js
const a = game.actors.getName("DIN RANGER");
console.table(game.realmGuard.core.m5.conflictTools.list(a,{conflictType:"fight"}).map(t => ({id:t.id,name:t.name,type:t.type,disabled:t.disabled})));
```

Expected:
- held supported Fight Gear appears as `gear:<itemId>`
- Gear not held does not appear as an active physical Conflict Tool
- physical Fight weapons do not leak into Argument/Negotiation etc.

## G — Legacy physical effect mapping

Use the returned Tool ID, for example Staff:

```js
const a = game.actors.getName("DIN RANGER");
const tool = game.realmGuard.core.m5.conflictTools.list(a,{conflictType:"fight"}).find(t => t.name === "Staff");
console.log(game.realmGuard.core.m5.conflictTools.evaluate(a,{toolId:tool?.id,action:"feint",conflictType:"fight"}));
```

Expected for Staff Feint:
- `dice: 1`

Spot-check any Gear you already use in Conflict:
- Shield Defend +2D
- Halberd Attack/Defend +1D; Feint/Maneuver -1D
- Whip/Hook and Line Maneuver +1D/+1s; Attack -1D
- Spear Defend +1D; successful Feint +1s
- Bow Maneuver +2D
- Sling Maneuver +1D
- Axe successful Attack +1s; Defend/Feint -1D

This is shadow evaluation only; live Conflict still uses Legacy.

## H — Custom multi-effect Tool

On a test Actor, temporarily add a structured tool flag from console:

```js
const a = game.actors.getName("DIN RANGER");
const old = foundry.utils.deepClone(a.getFlag("realm-guard","conflictTools") ?? []);
await a.setFlag("realm-guard","conflictTools",[
  ...old,
  {
    id:"qa-multi",
    name:"QA Multi Tool",
    conflictTypes:["fight"],
    effects:[
      {kind:"dice",value:1,actions:["attack","maneuver"]},
      {kind:"success",value:1,actions:["maneuver"],conditional:"successful-test"}
    ]
  }
]);
console.log(game.realmGuard.core.m5.conflictTools.evaluate(a,{toolId:"tool:qa-multi",action:"maneuver",conflictType:"fight"}));
```

Expected:
- `dice: 1`
- `conditionalSuccess: 1`

Cleanup:

```js
await a.setFlag("realm-guard","conflictTools",old);
```

## I — Natural Conflict Tool

Temporary QA data:

```js
const a = game.actors.getName("DIN RANGER");
const old = foundry.utils.deepClone(a.getFlag("realm-guard","naturalConflictTools") ?? []);
await a.setFlag("realm-guard","naturalConflictTools",[
  ...old,
  {id:"qa-claws",name:"QA Claws",conflictTypes:["fight"],effect:"dice",value:1,action:"attack"}
]);
console.log(game.realmGuard.core.m5.conflictTools.evaluate(a,{toolId:"natural:qa-claws",action:"attack",conflictType:"fight"}));
```

Expected:
- Natural Tool resolves independently of physical Gear
- `dice: 1`

Cleanup:

```js
await a.setFlag("realm-guard","naturalConflictTools",old);
```

## J — Disable target capability

```js
const a = game.actors.getName("DIN RANGER");
console.table(game.realmGuard.core.m5.conflictTools.disableTargets(a,{conflictType:"fight"}));
```

Expected available backend target families where present:
- physical Gear / Conflict Tool
- natural Conflict Tool
- Trait

Then shadow-disable a returned tool ID:

```js
const tools = game.realmGuard.core.m5.conflictTools.list(a,{conflictType:"fight"});
const t = tools[0];
console.log(game.realmGuard.core.m5.conflictTools.list(a,{conflictType:"fight",disabled:[t?.rawId]}).find(x => x.id === t?.id));
```

Expected:
- `disabled: true`
- no live Item/Actor mutation

## K — Unarmed architecture

```js
const a = game.actors.getName("DIN RANGER");
console.log(game.realmGuard.core.m5.conflictTools.evaluate(a,{toolId:"",action:"attack",conflictType:"fight"}));
```

Expected:
- `coreDefaultUnarmedPenalty: 0`
- `activeProfileUnarmedPenalty: -1`
- `dice: -1`

Meaning:
- HARD CORE does not define a universal unarmed penalty
- Legacy Mixed still preserves the existing live -1D compatibility rule
- qa.5 changes no live gameplay

## L — Live Conflict regression

Run or open a normal existing Conflict far enough to verify:
- planning opens
- Weapon / Tool choices still appear
- current per-Action selection still works
- existing bonuses/penalties still apply
- Maneuver still functions
- Disarm still functions as before
- no new M5 service writes into Conflict state

## M — Token / portrait / Equipment regression from qa.4

Verify quickly:
- Token Builder file drop works
- artwork can be repositioned
- PC Character Portrait stays square
- generated token stays round
- Equipment Figure does not regress

## N — M2 / M3 / M4 regression

Perform one ordinary Skill test plus one Nature/Condition test.

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
console.log(game.realmGuard.core.m4.natureParity.getLatest());
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
```

Expected:
- M3 MATCH
- no duplicate advancement
- Nature parity normal
- Condition/Recovery parity normal

# PASS GATE

- M5 service status correct ⏳
- Structured policy resolved from Legacy Mixed ⏳
- Equipment qa.4 UX preserved ⏳
- Gear snapshot correct ⏳
- Placement validation parity ⏳
- Container usage parity ⏳
- Physical Conflict Tool discovery ⏳
- Legacy physical Tool effects shadow parity ⏳
- custom multi-effect Tool ⏳
- natural Tool ⏳
- disable target capability ⏳
- CORE unarmed = 0 / Legacy compatibility = -1 ⏳
- live Conflict unchanged ⏳
- no destructive migration ⏳
- Token/portrait regression PASS ⏳
- M2/M3/M4 preserved ⏳
