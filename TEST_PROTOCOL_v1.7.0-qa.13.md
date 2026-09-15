# Realm Guard / Torchbearer v1.7.0-qa.13 — M5 Deep Live Shadow Parity QA

## Scope
qa.13 deepens M5 shadow parity without changing live authority.

- Legacy Mixed remains the sole live authority.
- `liveApplication:false` remains mandatory.
- CORE M5 remains observation/validation only.
- No Actor/Item migration is introduced.
- qa.12 Ranger sheet scroll persistence must remain intact.

## A. Startup / authority baseline
1. Install v1.7.0-qa.13 in Foundry v13.351.
2. Open an existing world with existing Ranger/NPC data.
3. Confirm no startup JavaScript errors.
4. Run:

```js
game.realmGuard.core.m5.getStatus()
```

Expected:
- `phase: "M5"`
- `mode: "SHADOW_PARITY"`
- `liveApplication: false`
- `authority: "LEGACY_MIXED"`
- `parity.inventoryRejectedObservation: true`
- `parity.conflictDeclarationObservation: true`
- `parity.conflictDisableObservation: true`

## B. Reset QA buffer
Run:

```js
game.realmGuard.core.m5.parity.clear()
game.realmGuard.core.m5.parity.report()
```

Expected: zero observations after clear.

## C. Accepted Inventory parity regression
Using the normal Ranger Equipment UI:
1. Move a legal one-handed item to an empty hand.
2. Move a cloak to Cloak.
3. Equip a Backpack/Satchel on Torso.
4. Move legal Gear into the active container.
5. Return an item to Unassigned Gear.

Run:

```js
game.realmGuard.core.m5.parity.report({ domain: "inventory" })
```

Expected:
- accepted writes still produce `MATCH`
- Legacy Mixed performs the actual write
- no duplicated gameplay update
- no CORE blocking or mutation

## D. Rejected Inventory operations — NEW qa.13 gate
Use real drag/drop through Equipment UI and deliberately attempt invalid moves.

Recommended cases:
1. Drag a non-cloak item onto Cloak.
2. Drag an item into an already occupied one-hand slot.
3. With a two-handed weapon equipped, try to place another item in the opposite hand.
4. Drag a bundled/oversized item to Belt.
5. Drag an oversized item to Pocket.
6. Fill a container, then try to exceed capacity.
7. Try to place an item into an inactive Backpack/Satchel.
8. Try to equip a second Backpack/Satchel on Torso.

Expected for each case:
- Legacy UI rejects the move exactly as before.
- No Item update occurs.
- After roughly 300 ms, qa.13 records a `LIVE_INVENTORY_REJECT` observation.
- CORE should independently reject the same target.
- parity should be `MATCH`.

Inspect:

```js
game.realmGuard.core.m5.parity.events({ domain: "inventory" })
```

Important: if the UI rejects but CORE accepts, the event must become `MISMATCH`; the rejected Legacy move must still remain rejected because CORE has no authority.

## E. Rejected Inventory no-false-positive check
1. Perform a valid drag/drop.
2. Wait at least one second.
3. Inspect inventory events.

Expected:
- accepted move is recorded by the existing live write observer
- there is no later false `LIVE_INVENTORY_REJECT` for the same move

## F. Conflict declaration/provider parity — NEW qa.13 gate
Start a Fight/Fight Creature Conflict and choose actual Weapon/Tool providers in the normal Conflict UI.

Test at least:
- physical Sword or Shield
- a second physical weapon if available
- saved/custom Conflict Tool in a suitable conflict type

After actions are revealed, inspect:

```js
game.realmGuard.core.m5.parity.events({ domain: "conflict-tool" })
```

Expected:
- each declared non-empty `gmWeaponId` / `rangerWeaponId` produces `DECLARED_TOOL_PROVIDER`
- CORE resolves the same provider id
- parity is `MATCH`
- normal Conflict flow remains Legacy Mixed authority

## G. Conflict Tool roll parity regression
Resolve representative Conflict rolls using:
- Unarmed / no tool (Legacy Mixed −1D compatibility)
- Sword useful action
- Shield Defend
- one other physical weapon
- one saved/custom tool if available

Expected:
- existing `LIVE_CONFLICT_ROLL` events still appear
- dice / conditional success / success penalty parity remains `MATCH`

## H. Disarm / disabled provider parity — NEW qa.13 gate
Create a successful Maneuver with enough margin for Disarm and disable an opposing supported Gear item.

Expected:
- the live Conflict state adds the raw Gear id to `disabledGearIds`
- qa.13 records `DISABLE_STATE`
- CORE resolves the same provider with `disabled: true`
- parity is `MATCH`
- disabled weapon disappears/becomes unavailable in the live Legacy flow as before
- no permanent Actor inventory mutation occurs solely because of Disarm

Inspect:

```js
game.realmGuard.core.m5.parity.events({ domain: "conflict-tool" })
```

## I. Conflict provider de-duplication
Without changing the Conflict state, trigger/re-render the Conflict window several times.

Expected:
- the same declaration/disable state is not counted repeatedly
- no warning loop

## J. Reload regression
Reload Foundry.

Expected:
- world data unchanged
- `game.realmGuard.core.m5` rebuilds
- parity buffer resets in memory (expected)
- qa.12 scroll persistence still works during subsequent Ranger sheet rerenders

## K. Locked Equipment / portrait regression
Confirm no visual regression:
- Containers left
- Unassigned Gear directly below Containers
- Equipment large right column
- Figure only `Custom Figure` + `Ancestry Figure`
- approved gray ancestry silhouettes remain
- no cardboard/geometric mannequins
- Figure Settings remain behind cog
- PC original/square portrait remains separate from round generated token
- Token Builder still works

## L. M2 / M3 / M4 regression
Run representative checks for:
- Ordinary Test
- Versus Test
- Fate / open 6s
- Persona
- Beginner's Luck
- advancement
- Nature
- Conditions / Recovery

Expected: no regression.

## M. Final parity gate
Run:

```js
game.realmGuard.core.m5.parity.report()
game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })
game.realmGuard.core.m5.getStatus()
```

PASS if:
- accepted Inventory operations remain correct
- rejected real Inventory drag/drop attempts are observed automatically and agree with CORE
- Conflict declarations resolve to the same CORE providers
- Disarm/disabled provider state agrees with CORE
- real Conflict roll effect parity remains clean
- there are no unexplained mismatches
- `liveApplication:false`
- `authority:"LEGACY_MIXED"`
- Legacy Mixed remains sole live authority

If any `MISMATCH` appears, do not proceed toward live takeover. Copy the mismatch event(s) into the development chat for analysis.

## Next step after PASS
If qa.13 passes broadly, M5 can move toward the final parity/handoff preparation layer: consolidate Inventory and Conflict Tool parity evidence, close remaining edge cases, and define a controlled live-handoff gate. Live takeover must still not occur until explicitly approved.
