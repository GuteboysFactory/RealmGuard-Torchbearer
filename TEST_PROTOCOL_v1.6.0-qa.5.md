# TEST PROTOCOL — v1.6.0-qa.5

Scope: UI-only Roll Dialog readability pass. Preserve all verified M2/M3/M4 behavior from qa.4.

## A — Version

```js
console.log(game.system.version);
```

Expected: `1.6.0-qa.5`.

## B — Base visual hierarchy

Open a normal trained Skill roll dialog.

Verify:
- warm beige / parchment overall background;
- dense sections read as separate light panels/cards;
- headings, help text and controls remain readable;
- no black/white-only visual wall;
- no horizontal scrollbar.

## C — Active choice highlighting

In the same dialog, toggle representative options where available:
- Count for Learning;
- Tap Nature;
- Trait / support checkbox or radio choice;
- any other checkbox/radio present in the roll dialog.

Verify each checked option becomes visibly green-highlighted and unchecked options remain neutral.

## D — Nature Versus discovery

With no target selected:
- open a Nature roll.

Verify a visible hint says that Nature Versus requires exactly one targeted opponent.

Then target exactly one opponent token and reopen Nature.

Verify:
- the `Versus target: <name> · Nature` checkbox appears;
- checking it green-highlights the active Nature/Versus choice;
- Nature Versus still resolves normally.

## E — Scroll preservation

Reduce Foundry/browser window height and open a long Roll Dialog.

Verify:
- internal vertical scrolling still works;
- bottom controls remain reachable;
- no horizontal scrolling appears.

## F — Representative roll types

Spot-check:
- trained Skill;
- Ability;
- Beginner's Luck;
- Recovery;
- Nature;
- Custom Roll / Free Dice Pool.

Verify the parchment/readability treatment is coherent and nothing becomes illegible.

## G — Gameplay regression

Complete one normal Skill roll and one Nature-related roll.

Verify:
- one chat card per roll;
- M3 parity remains MATCH;
- M4 Advancement shadow remains normal;
- M4 Nature parity remains MATCH for the Nature-related roll;
- no duplicate Learning marks, Persona/Fate spend, Nature tax or chat cards.

Console:

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
console.log(game.realmGuard.core.m4.natureParity.getLatest());
```

## PASS gate

- Parchment background: PASS
- Section/card hierarchy: PASS
- Green active choices: PASS
- Nature Versus no-target hint: PASS
- Nature Versus targeted checkbox: PASS
- Scroll preserved: PASS
- Representative dialogs readable: PASS
- M3 preserved: PASS
- Advancement shadow preserved: PASS
- Nature shadow parity preserved: PASS
- No duplicate live effects: PASS
