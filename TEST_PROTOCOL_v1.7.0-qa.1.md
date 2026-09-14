# TEST PROTOCOL — v1.7.0-qa.1

Scope: first M5 patch. Replace the old paper-doll presentation with an ancestry-aware equipment silhouette registry while preserving all existing inventory mechanics and verified M2/M3/M4 behavior.

## A — Version & API

```js
console.log(game.system.version);
console.log(game.realmGuard.inventory.silhouette.getStatus());
```

Expected:
- `1.7.0-qa.1`
- `phase: "M5"`
- `scope: "LINEAGE_AWARE_EQUIPMENT_SILHOUETTE"`
- `inventoryRulesChanged: false`
- registry contains `neutral`, `human`, `dwarf`, `elf`, `halfling`.

## B — Default / empty Ancestry

Open a Ranger → Inventory & Gear.

Set the new Equipment silhouette Ancestry field blank. If the Ranger's existing Lineage / House is a house name such as `House of Ruor`, verify:
- a neutral humanoid silhouette appears;
- no broken/missing image;
- all equipment zones remain aligned and usable;
- the old geometric paper-doll presentation is no longer used.

## C — Dúnadan / Human

Set Ancestry to `Dúnadan`.

Verify:
- the silhouette changes to the Human / Dúnadan Ranger form;
- gear zones do not move or lose their contents.

Console:

```js
console.log(game.realmGuard.inventory.silhouette.forActor(game.actors.getName("YOUR RANGER")));
```

Expected:
- `key: "human"`
- `fallback: false`

`Human`, `Dunedain` and `Númenórean` aliases may also be spot-checked.

## D — Dwarf

Set Ancestry to `Dwarf`.

Verify:
- shorter, broader Dwarf silhouette;
- API resolves `key: "dwarf"`;
- inventory contents remain unchanged.

## E — Elf

Set Ancestry to `Elf`.

Verify:
- tall/slender Elf silhouette;
- API resolves `key: "elf"`;
- equipment interaction remains normal.

## F — Halfling / Hobbit

Set Ancestry to `Halfling` or `Hobbit`.

Verify:
- short compact silhouette;
- API resolves `key: "halfling"`;
- equipment interaction remains normal.

## G — Custom Ancestry fallback

Set Ancestry to a custom value such as `Bogkin`.

Verify:
- Inventory does not break;
- neutral humanoid fallback is shown;
- UI states that a custom ancestry is using the neutral fallback.

Console result should include:
- `key: "neutral"`
- `fallback: true`

## H — Ancestry vs Lineage / House separation

Use:
- Ancestry: `Dúnadan`
- Lineage / House: `House of Ruor`

Verify:
- silhouette follows Ancestry and resolves Human / Dúnadan;
- the existing Lineage / House value remains untouched.

Then blank Ancestry while keeping `House of Ruor`.

Expected: neutral fallback. A House name must not be interpreted as a race/ancestry.

Backward-compatibility note: an older actor whose Lineage field literally contains an ancestry word such as `Elf`, `Dwarf` or `Dúnadan` may still use that as a temporary visual bridge when Ancestry is blank.

## I — Inventory zone regression

Drag/equip/move representative gear through the existing zones:
- Head
- Cloak
- Torso
- Left Hand
- Right Hand
- Belt / Pocket / Feet as convenient.

Verify:
- drag/drop still works;
- zone used/capacity counts remain correct;
- item actions still work;
- changing silhouette never moves gear between zones.

## J — 2H regression

Equip a two-handed item.

Verify:
- the opposite hand still locks;
- moving/removing the 2H item restores the other hand;
- silhouette choice has no mechanical effect on the rule.

## K — Containers

Equip a Backpack or Satchel and move gear into/out of it.

Verify:
- container activation rules are unchanged;
- capacity/used counts remain correct;
- no nested-container regression;
- silhouette changes do not affect contents.

## L — Responsive layout

Resize the sheet below the mobile breakpoint.

Verify:
- silhouette hides as before on narrow layouts;
- equipment zones become the existing linear/mobile layout;
- Ancestry selector remains usable;
- no horizontal overflow is introduced.

## M — Reload / persistence

Set a non-default Ancestry, assign some gear, then F5.

Verify:
- Ancestry persists;
- correct silhouette returns after reload;
- gear assignments persist;
- exactly one Equipment silhouette control exists;
- no console errors.

## N — M2 / M3 / M4 regression

Spot-check one ordinary Skill test plus one Nature- or Condition-related test.

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
console.log(game.realmGuard.core.m4.natureParity.getLatest());
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
```

Verify:
- M3 remains `MATCH`;
- Advancement shadow remains normal;
- Nature parity remains normal;
- Condition/Recovery parity remains normal;
- no duplicate chat, Learning, resource spend or Nature tax.

## PASS gate

- Silhouette registry/API: PASS
- Neutral default/fallback: PASS
- Human / Dúnadan silhouette: PASS
- Dwarf silhouette: PASS
- Elf silhouette: PASS
- Halfling / Hobbit silhouette: PASS
- Custom Ancestry graceful fallback: PASS
- Ancestry vs Lineage / House separation: PASS
- Inventory drag/drop preserved: PASS
- Zone capacities preserved: PASS
- 2H locking preserved: PASS
- Containers preserved: PASS
- Responsive layout preserved: PASS
- Reload / persistence / no duplicate control: PASS
- M2 preserved: PASS
- M3 preserved: PASS
- M4 preserved: PASS
- Legacy Mixed remains inventory authority: PASS
