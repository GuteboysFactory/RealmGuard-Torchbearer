# TEST PROTOCOL — v1.7.0-qa.4

Scope: M5 visual/UX correction. Retire paper figures from Equipment, restore Token Builder local image drag/drop, and enforce square PC portrait / round token separation. Inventory rules remain unchanged.

## A — Version / diagnostics

```js
console.log(game.system.version);
console.log(game.realmGuard.inventory.figure.getStatus());
console.log(game.realmGuard.tokenBuilderUx.getStatus());
```

Expected:
- `1.7.0-qa.4`
- `paperFiguresAllowed: false`
- `characterPortraitShape: "SQUARE"`
- `tokenShape: "ROUND_PNG"`
- `dragDrop: true`
- `tokenMayReplaceCharacterPortrait: false`

## B — Equipment: no paper figure fallback

Open a Ranger → Inventory & Gear.

Test Source = `Custom Figure` with an empty Custom image path.

Expected:
- no geometric/paper mannequin;
- fallback is a detailed dark Ranger artwork;
- no environmental background behind the artwork;
- gear zones remain above/around the artwork.

## C — Equipment: Ancestry artwork

Set Source = `Ancestry Figure` and test:
- Dúnadan;
- Human;
- Elf;
- Dwarf;
- Halfling/Hobbit.

Expected:
- every ancestry uses the same detailed dark-fantasy Ranger art direction;
- no ancestry shows the old paper/mannequin SVG style;
- proportions differ visually through the ancestry layout;
- unknown/custom ancestry falls back to detailed Neutral artwork, never a paper figure.

## D — Character Art source

Set Source = `Character Art`.

Expected:
- preserved PC source artwork is used;
- Fit / Zoom / Horizontal / Vertical controls still work;
- Equipment figure changes do not change gear assignments or rules.

## E — Token Builder drag/drop

Open Quick Token Builder.

Expected before drop:
- the stage says `Drop image here`;
- existing artwork can still be dragged inside the stage to reposition it.

Drag a local PNG/WebP/JPG from desktop directly onto the Token Builder preview.

Expected:
- stage highlights while hovering with the file;
- file uploads successfully;
- dropped image becomes the Token Builder source preview;
- X/Y resets to 0, Zoom to 1, Fill/Crop becomes active;
- for a PC Ranger the same dropped source becomes the Character Portrait source.

## F — PC portrait stays square

After dropping/saving Character Art, inspect the Ranger sheet header.

Expected:
- Character Portrait is square/rounded-square;
- it shows the original source artwork, not the generated circular token PNG.

## G — Round token generation

From the same source artwork:
- adjust Token Builder crop;
- Create / Save Token.

Expected:
- generated token is circular with the RG gold ring;
- `prototypeToken.texture.src` points to the generated token PNG;
- placed Scene token is round if Update placed tokens is checked;
- `actor.img` remains the original/square Character Portrait artwork.

Console spot-check:

```js
const a = game.actors.getName("DIN RANGER");
console.log({
  portrait: a.img,
  preserved: a.getFlag("realm-guard", "portraitSource"),
  token: a.prototypeToken.texture.src,
  mode: a.getFlag("realm-guard", "portraitMode")
});
```

Expected:
- `portrait === preserved`
- `token !== portrait`
- `mode === "original"`

## H — Legacy token portrait repair

If a Ranger from qa.3 currently shows its round token as the sheet portrait, reload as GM.

Expected:
- system restores the preserved original Character Portrait automatically when available;
- prototype token remains unchanged.

## I — Inventory regression

Move items between Head / Neck / Cloak / Torso / Left Hand / Right Hand / Belt / Pocket / Feet.

Verify:
- drag/drop works;
- capacities remain correct;
- 2H locking remains correct;
- containers remain correct;
- changing figure source/ancestry never moves gear.

## J — M2 / M3 / M4 regression

Perform one normal Skill test and one Nature/Condition-related test.

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
console.log(game.realmGuard.core.m4.natureParity.getLatest());
console.log(game.realmGuard.core.m4.conditionRecoveryParity.getLatest());
```

Expected:
- M3 parity remains MATCH;
- M4 observers behave normally;
- no duplicate chat, Learning, Fate/Persona, Nature Tax, or Recovery writes.

## PASS gate

- No paper figure in Custom fallback: PASS
- No paper figure in Ancestry mode: PASS
- Dúnadan/Human art direction: PASS
- Elf art direction: PASS
- Dwarf art direction: PASS
- Hobbit/Halfling art direction: PASS
- Neutral/custom ancestry art fallback: PASS
- Character Art mode preserved: PASS
- Token Builder local file drag/drop: PASS
- Token Builder reposition drag preserved: PASS
- PC sheet portrait square: PASS
- Token generated round: PASS
- PC portrait not replaced by token: PASS
- Legacy token-portrait repair: PASS
- Inventory / 2H / containers preserved: PASS
- M2/M3/M4 preserved: PASS
