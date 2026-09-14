# TEST PROTOCOL — v1.6.0-qa.3

Scope: UI-only hotfix. Make Realm Guard roll dialogs viewport-safe and vertically scrollable without changing M2/M3/M4 gameplay behavior.

## A — Version

```js
console.log(game.system.version);
```

Expected: `1.6.0-qa.3`.

## B — Normal Skill roll dialog

Open a trained Skill roll dialog.

Verify:
- the dialog can be vertically scrolled with mouse wheel / trackpad when content exceeds available height;
- the lower fields and Roll/Cancel controls remain reachable;
- horizontal scrolling is not introduced;
- normal controls still work.

## C — Small viewport

Reduce the Foundry/browser window height enough that the roll dialog is taller than the visible area.

Verify:
- the roll content remains contained inside the viewport;
- an internal vertical scrollbar appears;
- you can reach the bottom of the form without resizing the dialog/window.

## D — Representative roll types

Spot-check at least:
- trained Skill;
- Ability;
- Beginner's Luck / Untrained Skill;
- Recovery roll;
- Custom Roll / Free Dice Pool.

All should remain usable and scrollable where needed.

## E — Functional regression

Complete one normal Skill roll with Learning enabled.

Verify:
- one chat card only;
- M3 parity remains `MATCH`;
- M4 Advancement shadow records one real Legacy result;
- no duplicate Learning mark or resource spend.

Console:

```js
console.log(game.realmGuard.core.testParity.getLatest());
console.log(game.realmGuard.core.m4.advancement.getLatest());
```

## PASS gate

- Roll dialog scroll works: PASS
- Small viewport containment: PASS
- Core controls remain reachable: PASS
- Custom Roll scroll works: PASS
- M2/M3/M4 regression: PASS
- No duplicate live effects: PASS
