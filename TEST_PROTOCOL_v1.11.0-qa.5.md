# v1.11.0-qa.5 — M10A.4 Gear / Inventory / Conflict Ownership QA

**QA RESULT:** ⏳ PENDING LIVE QA  
**Foundry target:** 13.351  
**GOLD fallback:** v1.10.0  
**Active gameplay profile:** Realm Guard — Legacy Mixed  
**Strict gameplay authority:** OFF  
**Profile switching:** LOCKED  
**Strict Gear/Inventory/Conflict writes:** OFF

## Gate A — update / boot

Update to **v1.11.0-qa.5** through the QA manifest and open the same test world.

Expected:
- world opens normally
- active profile remains `realm-guard-legacy-mixed`
- existing Gear Items and paper-doll/container placement metadata remain intact
- no Actor/Item migration or conversion prompt
- no new console-breaking error.

## Gate B — M10 status

Run:

```js
game.realmGuard.core.m10.getStatus()
game.realmGuard.core.m10.strict.gearInventoryConflictStatus()
```

Expected:
- phase = `M10A.4`
- strictRulesLive = false
- inventoryWrites = false
- conflictWrites = false
- Strict Inventory = LOOSE
- slot placement authority = false
- Strict unarmed/no-tool default = 0D
- weapon scope = ACTION_SET
- Whip alias = Hook and Line inheritance
- Weapons of Wit = true
- next step = M10A.5 Session / Circles / Progression.

## Gate C — LOOSE inventory preserves placement metadata

Pick a Ranger with Gear:

```js
const a = game.actors.find(x => x.type === "character" && x.items.some(i => i.type === "gear"))
game.realmGuard.core.m10.strict.inventoryPolicyPlan(a)
```

Expected:
- policy = LOOSE
- slotPlacementAuthority = false
- preservePlacementMetadata = true
- writesPlanned = 0
- destructive = false.

No item placement may change.

## Gate D — unassigned physical weapon is Strict-available

Pick a physical weapon Gear Item and temporarily use a plain shadow object if all live weapons are hand-placed.

Representative:

```js
game.realmGuard.core.m10.strict.availableConflictTools(a,{conflictType:"fight"})
```

Expected under Strict planning:
- physical Sword/Axe/etc. can be available without requiring `inventory.mode === "hand"`
- paper-doll placement is presentation/UX only
- no live Conflict state changes.

Legacy Mixed live Conflict must still use its current structured hand-slot behavior.

## Gate E — no-tool difference

Run:

```js
game.realmGuard.core.m10.strict.conflictToolPlan(a,{action:"attack",conflictType:"fight"})
```

Expected:
- dice = 0
- activeProfileUnarmedPenalty = 0
- note says Strict has no universal unarmed/no-tool penalty.

Normal Legacy Mixed live Conflict remains unchanged at its current -1D behavior.

## Gate F — MG1E / RG weapon ownership

Run representative planners:

```js
({
  axe: game.realmGuard.core.m10.strict.weaponActionPlan("Axe","attack",{successful:true}),
  spear: game.realmGuard.core.m10.strict.weaponActionPlan("Spear","maneuver",{opponentRange:"normal"}),
  halberd: game.realmGuard.core.m10.strict.weaponActionPlan("Halberd","maneuver",{halberdMode:"spear",opponentRange:"normal"}),
  knife: game.realmGuard.core.m10.strict.weaponActionPlan("Knife","maneuver",{successful:true,opponentRange:"spear"}),
  shield: game.realmGuard.core.m10.strict.weaponActionPlan("Shield","defend"),
  sword: game.realmGuard.core.m10.strict.weaponActionPlan("Sword","attack",{swordUsefulAction:"attack"}),
  whip: game.realmGuard.core.m10.strict.weaponDefinition("Whip")
})
```

Expected:
- Axe successful Attack = +1s; Defend/Feint = -1D
- Spear Maneuver vs normal = +1D
- Halberd delegates to selected Axe/Spear mode for ACTION_SET
- Knife successful Maneuver vs spear/thrown/missile can auto-Disarm
- Shield Defend = +2D
- Sword selected Useful action = +1D
- Whip inherits MG1E Hook and Line.

## Gate G — Armor

Run:

```js
({
  leather: game.realmGuard.core.m10.strict.armorPlan("Leather Armor",{conflictType:"fight"}),
  chain: game.realmGuard.core.m10.strict.armorPlan("Chainmail Armor",{conflictType:"fight",action:"maneuver"}),
  plated: game.realmGuard.core.m10.strict.armorPlan("Plated Armor",{conflictType:"fight",action:"defend"})
})
```

Expected:
- Leather = MG1E Light Armor inheritance
- Chainmail = MG1E Heavy Armor inheritance
- Plated = Realm Guard v1.6 ownership
- all remain planning only / liveApplication false.

## Gate H — relevant Gear +1D planner

Choose any Gear Item:

```js
const g = a.items.find(i => i.type === "gear")
({
  pending: game.realmGuard.core.m10.strict.gearRelevancePlan(g),
  approved: game.realmGuard.core.m10.strict.gearRelevancePlan(g,{gmApproved:true})
})
```

Expected:
- pending = 0D and GM relevance decision required
- approved = +1D
- automatic = false
- no Actor/Item write.

## Gate I — Disarm target ownership

Run:

```js
game.realmGuard.core.m10.strict.disarmTargets(a,{conflictType:"fight"})
```

Expected:
- target contract can include weapon, Gear, Trait and natural Conflict Tool
- GM choice required
- duration = remainder of conflict
- writesPlanned = 0
- liveApplication = false.

## Gate J — Weapons of Wit

Run:

```js
({
  evidence: game.realmGuard.core.m10.strict.weaponOfWitPlan("Evidence","attack",{evidenceEstablished:true,successful:true}),
  promises: game.realmGuard.core.m10.strict.weaponOfWitPlan("Promises","defend",{promiseMade:true}),
  roleplay: game.realmGuard.core.m10.strict.weaponOfWitPlan("Roleplay","feint",{roleplayed:true,chosenAction:"feint"}),
  repeat: game.realmGuard.core.m10.strict.weaponOfWitPlan("Repeating Yourself","attack",{repeating:true})
})
```

Expected:
- Evidence successful Attack = +1s
- Promises Defend = +1D
- Roleplay chosen action = +1D
- Repeating Yourself = -1D
- all non-live.

## Gate K — Legacy Mixed regression + reload

Perform:
- normal Legacy Mixed Skill roll
- open Inventory / move no items unless desired
- start or inspect a normal Legacy Mixed Conflict if convenient
- reload world.

Expected:
- current Legacy Mixed Inventory and Conflict behavior unchanged
- structured placement metadata survives
- normal live no-tool penalty remains Legacy behavior
- Profile Management remains available
- Strict Switch remains locked
- no Strict Gear/Conflict policy becomes live.

## PASS

qa.5 passes when Strict Gear / Inventory / Conflict ownership matches MG1E 2008 + Realm Guard v1.6 while all planners remain non-live/read-only and Legacy Mixed remains behaviorally unchanged.

After PASS, perform a fresh read-only audit for **M10A.5 — Session / Circles / Progression** before mutation.
