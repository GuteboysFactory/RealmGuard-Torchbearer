# Realm Guard / Torchbearer v1.5.0-qa.11 — Final M3 Promotion Matrix

**Foundry target:** v13.351  
**Authority:** Legacy Mixed  
**CORE Test Engine:** SHADOW_PARITY, live OFF  
**CORE Effect Engine:** SHADOW_COMPARE, live OFF

## Goal

This is the final M3 gate. No live CORE takeover occurs in qa.11. The build verifies that the complete M3 shadow architecture is stable enough to mark M3 VERIFIED and proceed to M4.

## A. Startup / authority

Run:

```js
console.log(game.system.version);
console.log(game.realmGuard.core.tests.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.customContent.getStatus());
```

Expected:
- version `1.5.0-qa.11`
- Test Engine `SHADOW_PARITY`, `liveApplication: false`
- Legacy Mixed remains authority
- full TestContext coverage
- Effect Engine `SHADOW_COMPARE`, `liveApplication: false`, six providers
- custom-content principle remains type/data-driven

## B. Modifier matrix — BLOCKING

Clear parity history:

```js
game.realmGuard.core.testParity.clear();
```

Run a trained Skill test with a deliberately visible positive modifier combination available in normal play, for example Extra Dice +1 and/or a valid beneficial Trait/Talent/Token effect. Record the final pool shown in chat.

Then:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p?.status);
console.log(p?.comparison?.legacy);
console.log(p?.comparison?.core);
console.log(p?.comparison?.parity?.fields);
```

Expected: `MATCH`, with pool/target/successes/outcome/margin all true. The CORE replay must match the already-prepared Legacy pool; CORE must not spend resources or apply the modifier a second time.

Repeat with one negative modifier path, such as an applicable Condition or Trait Against where legal. Expected: `MATCH` and no double application.

## C. Cancel safety — BLOCKING

Clear history. Open an ordinary Skill roll dialog and cancel it before rolling.

```js
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected: no new comparison from the cancelled roll. No Fate, Persona, Checks, Talent/Token use, Learning or other Actor state should change because of CORE.

Repeat once with a Custom Roll dialog and cancel. Expected: no parity history entry from the cancelled Custom Roll.

## D. Context regression sweep — BLOCKING

Perform one representative live test for each of these paths:
- ordinary trained Skill
- Ability
- Nature
- Circles
- Beginner's Luck
- Versus
- Recovery
- Custom Roll

After each test inspect latest parity. Every completed test must be `MATCH`; the context must match the gameplay path.

At the end:

```js
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected: zero mismatches and zero observer errors for the sweep. Skips are not expected unless Fate was spent but supplemental Fate trace was unavailable.

## E. Custom-content regression

Use the qa.10 custom test items still present on the test Ranger. Run the custom Skill once and verify:

```js
const actor = canvas.tokens.controlled[0]?.actor;
const skill = actor?.items.find(i => i.type === "role" && i.name === "QA Bog Lore");
console.log(game.realmGuard.core.customContent.compareSkillLatest(actor, skill?.id));
```

Expected: `isCustom: true`, `sourceMatches: true`, `match: true`.

Spot-check at least one custom Effect item again (Trait, Wise, Talent or Token of Power). Expected comparator `match: true`.

## F. Reload / duplicate observer safety — BLOCKING

Reload the world/client. Then:

```js
game.realmGuard.core.testParity.clear();
```

Perform exactly one ordinary trained Skill test.

```js
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected exactly:
- observed: 1
- compared: 1
- matches: 1
- mismatches: 0
- errors: 0

This confirms that reload did not duplicate observer wrappers.

## G. Multiclient safety — BLOCKING

With GM + one Player client connected:
1. Player owns/controls a Ranger.
2. Player performs one ordinary Skill test from their own client.
3. Verify normal chat/result appears once and Actor state changes only as Legacy normally dictates.
4. On the Player client, inspect `game.realmGuard.core.testParity.getLatest()` — expected `MATCH`.
5. GM should not see duplicate chat cards, duplicate resource spending, duplicate Learning marks or duplicate test resolution caused by CORE.
6. GM performs a separate test on a GM-owned/test Actor. Expected normal single resolution and local parity `MATCH`.

Parity history is client-memory-only, so histories do not need to be identical between GM and Player. The gate is absence of duplicate live effects/resolution and correct parity on the client that executed the roll.

## H. M2 preservation — BLOCKING

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

Expected:
- `SHADOW_COMPARE`
- `liveApplication: false`
- six providers
- conditions.roll-dice
- traits.selected-use
- wises.selected-reroll
- talents.selected-use
- tokens-of-power.selected-use
- conflict-tools.action-modifiers

## M3 PASS GATE

M3 may be marked VERIFIED only when all of the following are green:
- complete TestContext vocabulary verified
- ordinary/Ability/Nature/Circles/BL/Versus/Recovery/Custom parity stable
- Fate/Open-6 and Versus secondary-resolution parity preserved
- positive and negative modifier paths do not double-apply
- cancelled tests produce no CORE side effects or phantom comparisons
- custom-content compatibility preserved
- reload produces exactly one observer comparison per roll
- GM + Player multiclient test produces no duplicate live resolution/state writes
- zero blocking parity mismatches
- zero blocking observer errors
- M2 remains six-provider shadow-only
- M3 remains shadow-only
- Legacy Mixed remains sole live authority

If this matrix passes, record `M3 Unified Test Engine = VERIFIED` and begin M4 Advancement / Nature / Conditions Services.
