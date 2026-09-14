# TEST PROTOCOL — v1.7.0-qa.3

Scope: M5 Equipment Figure source workflow. PC Character Art is now preferred in Auto mode, with Ancestry Figure and Neutral fallback preserved. Inventory rules remain unchanged.

## A — Version

```js
console.log(game.system.version);
console.log(game.realmGuard.inventory.figure.getStatus());
```

Expected:
- version `1.7.0-qa.3`
- scope `PC_CHARACTER_ART_FIRST_EQUIPMENT_FIGURE`
- default mode `auto`
- inventoryRulesChanged `false`

## B — Auto mode with PC character art

Use a Ranger with a real Character Portrait / source artwork.

Open Inventory & Gear.

Expected:
- Equipment Figure Source defaults to `Auto · Character Art → Ancestry`;
- the Equipment stage uses the Ranger's original Character Art rather than the ancestry figure;
- it does not use the round token image when an original portrait source is preserved;
- status reads `Character Art · personal PC image`.

Console:

```js
const a = game.actors.getName("DIN RANGER");
console.log(game.realmGuard.inventory.figure.forActor(a));
```

Expected:
- `mode: "auto"`
- `sourceType: "character"`
- `hasCharacterArt: true`

## C — Original portrait awareness

For a Ranger that has used Token Builder:
- switch the sheet portrait to Token Portrait if available;
- leave the preserved original character artwork in place;
- open Inventory & Gear.

Expected:
- Equipment Figure still uses the original character artwork, not the generated round token.

## D — Character Art framing controls

With Character Art active, test:
- Fit Entire Image / Fill-Crop;
- Zoom;
- Horizontal offset;
- Vertical offset.

Expected:
- preview updates immediately for sliders;
- settings persist after releasing/changing the control;
- equipment slots remain independently positioned and interactive;
- image is never stretched disproportionately.

## E — Force Ancestry Figure

Set Source to `Ancestry Figure`.

Expected:
- Character Art is replaced by the ancestry figure;
- Dúnadan/Human/Dwarf/Elf/Halfling selection continues to work;
- ancestry does not change Lineage / House.

## F — Force Character Art

Set Source to `Character Art`.

Expected with valid art:
- `sourceType: "character"`.

On an Actor without usable character artwork:
- no broken image;
- ancestry fallback is shown;
- status explains `Character Art unavailable`.

## G — Custom Figure

Set Source to `Custom Figure`.

Enter a valid Foundry image path in Custom image path.

Expected:
- custom image is shown;
- Fit / Zoom / X / Y controls apply;
- setting persists after F5.

Then clear the path.

Expected:
- no broken image;
- ancestry fallback appears;
- status explains that the custom image is missing.

## H — Auto fallback

Use an Actor without usable portrait art.

Expected in Auto mode:
1. Ancestry Figure if ancestry resolves;
2. Neutral Humanoid if ancestry is custom/unknown/empty.

## I — Inventory regression

With Character Art visible, move Gear through:
- Head;
- Cloak;
- Torso;
- Left/Right Hand;
- Belt;
- Pocket;
- Feet;
- Containers;
- Unassigned.

Expected:
- drag/drop unchanged;
- capacities unchanged;
- 2H locking unchanged;
- container rules unchanged;
- changing Figure Source moves no Gear.

## J — Reload / duplicate safety

Set Auto or Character Art, adjust framing, then F5.

Expected:
- source mode persists;
- framing persists;
- exactly one Equipment Figure control exists;
- exactly one visual figure exists;
- gear assignments persist;
- no duplicate listeners/effects.

## K — Responsive

Narrow the Actor sheet below the mobile breakpoint.

Expected:
- equipment figure hides as before;
- zones become linear/mobile layout;
- Equipment Figure controls remain usable;
- no horizontal overflow.

## L — M2/M3/M4 regression

Run one ordinary Skill test plus one Nature or Condition test.

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
console.log(game.realmGuard.core.m4.natureParity.getLatest());
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
```

Expected:
- M3 parity remains MATCH;
- M4 Advancement/Nature/Condition behavior remains normal;
- no duplicate chat, Learning, resource spend, Nature tax or Recovery effects.

## PASS gate

- Auto uses original PC Character Art: PASS
- Token portrait does not replace preserved source art: PASS
- Character Art framing controls: PASS
- Ancestry force mode: PASS
- Character force mode + fallback: PASS
- Custom Figure + fallback: PASS
- Auto ancestry/neutral fallback: PASS
- Inventory rules unchanged: PASS
- Reload/persistence: PASS
- Responsive layout: PASS
- M2/M3/M4 preserved: PASS
- Legacy inventory authority preserved: PASS
