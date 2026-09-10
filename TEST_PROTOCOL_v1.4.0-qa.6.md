# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.6

**Build:** v1.4.0-qa.6 — CORE M2 Token of Power Provider + Wise Post-Roll Decision  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1–qa.5 PASS  
**Internal system id:** `realm-guard`  
**Effect Engine mode:** `SHADOW_COMPARE` — live application remains OFF  
**Intended live UX change:** Wise reroll is accepted/declined after the base roll; reroll math itself is unchanged.

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / preservation

- [ ] A1. Install/update to `1.4.0-qa.6` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit remains Schema `1`, Architecture `0.1`, Legacy Mixed profile v1 and one M0 migration entry.
- [ ] A6. Active Rules Registry remains unchanged and scrollable.
- [ ] A7. UEE remains scrollable after the qa.5 fix.

## B. M2 status

```js
const fx = game.realmGuard.core.effects;
fx.getStatus();
```

- [ ] B1. `phase` = `M2`.
- [ ] B2. `mode` = `SHADOW_COMPARE`.
- [ ] B3. `liveApplication` = `false`.
- [ ] B4. `providerCount` = `5`.
- [ ] B5. Providers contain `conditions.roll-dice`, `traits.selected-use`, `wises.selected-reroll`, `tokens-of-power.selected-use`, `conflict-tools.action-modifiers`.
- [ ] B6. UEE text explains the Wise post-roll decision and Token of Power shadow scope.

## C. Wise post-roll UX — no preselection required

Select a Ranger token that has at least one Wise.

```js
window.qaActor = canvas.tokens.controlled[0]?.actor;
console.log("Actor:", qaActor?.name, "| Wises:", qaActor?.wises?.map(w => w.name));
```

Then make a normal Skill/Ability roll from the sheet and leave **Wise = None** before the roll.

- [ ] C1. The base dice are rolled first.
- [ ] C2. If at least one die is below 4, a **Wise Reroll** decision appears after the base roll.
- [ ] C3. The dialog lists the Ranger's Wises.
- [ ] C4. Choosing **Keep Result** performs no Wise reroll.
- [ ] C5. Repeat a roll with failed dice and choose a Wise; all failed dice are rerolled once.
- [ ] C6. Chat output shows a separate **Wise reroll** row when the reroll is used.
- [ ] C7. A Wise selected before the roll is only the preferred/default Wise; the post-roll dialog can still be declined.

If a roll has no failed dice, no Wise dialog is expected.

## D. Wise Angry block

Activate **Angry** on the same selected Actor and make another roll with failed dice.

- [ ] D1. Beneficial Wise reroll is unavailable while Angry.
- [ ] D2. No post-roll Wise reroll is performed.
- [ ] D3. Existing `compareWiseEffects(...)` still returns `match: true` and Legacy/CORE both report blocked.

Restore Angry afterward.

## E. Token of Power shadow provider

Use the same selected Actor and select one existing Token of Power that is linked to a Skill. If necessary, create a temporary QA Token of Power through the normal sheet UI.

```js
window.qaTokenPower = qaActor?.tokensOfPower?.[0];
console.log("Token:", qaTokenPower?.name, "| Level:", qaTokenPower?.system?.level, "| Linked Skill:", qaTokenPower?.system?.linkedSkill);
```

Use the linked Skill name from the console output:

```js
fx.compareTokenPowerEffects(
  qaActor,
  qaTokenPower.id,
  qaTokenPower.system.linkedSkill,
  { isSkill: true }
);
```

- [ ] E1. Result reports `match: true`.
- [ ] E2. CORE Effect provenance reports provider id `tokens-of-power.selected-use`.
- [ ] E3. For Level 1 or Level 2, CORE/Legacy agree on `diceBonus: 1`.
- [ ] E4. For Level 3, CORE/Legacy agree on `reroll: true`.
- [ ] E5. For Level 1/3 once-per-session behavior, CORE exposes a shadow `STATE_CHANGE`; it does not write Actor/Item state during comparison.
- [ ] E6. If the selected Token is manual, CORE/Legacy agree on `manual: true` instead of inventing an automatic mechanical effect.

Only the checks applicable to the Token's configured level/mode need to be exercised live; the release smoke gate covers L1/L2/L3/manual/used/applicability cases.

## F. Token applicability / used state

- [ ] F1. Comparing the Token against an unrelated Skill returns `match: true` with no available mechanical benefit.
- [ ] F2. Existing live Token of Power behavior works as before for the Token's configured level.
- [ ] F3. Level 3 live Token reroll still asks for confirmation after failed dice, as before.
- [ ] F4. Once/session used-state behavior remains unchanged.

## G. Existing provider regression

- [ ] G1. Representative `compareConditionDice(...)` returns `match: true`.
- [ ] G2. Representative `compareTraitEffects(...)` returns `match: true`.
- [ ] G3. Representative `compareWiseEffects(...)` returns `match: true`.
- [ ] G4. `fx.compareConflictToolEffects("Shield", "defend")` returns `match: true` and +2D.
- [ ] G5. `fx.compareConflictToolEffects("Axe", "attack")` returns `match: true` and +1 conditional success.

## H. General regression

- [ ] H1. Normal trained Skill roll works.
- [ ] H2. Nature / Ability roll works.
- [ ] H3. Beginner's Luck works.
- [ ] H4. Fate/Open 6s still prompts and resolves normally.
- [ ] H5. Persona works.
- [ ] H6. Trait/Condition/Help workflows remain unchanged apart from the intended Wise timing correction.
- [ ] H7. One representative Conflict still opens/advances normally.
- [ ] H8. No new migration entry is added.

## I. Reload / multiplayer

- [ ] I1. F5/reload preserves M0/M1 state and provider count remains 5.
- [ ] I2. GM + player load without M2 errors.
- [ ] I3. Post-roll Wise dialog works on the owning player client.
- [ ] I4. UEE can be opened/scrolled by GM without causing a player-client error.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass qa.6 when Wise use is a genuine post-roll accept/decline decision, the existing Wise reroll arithmetic remains unchanged, `tokens-of-power.selected-use` matches current Legacy Mixed Token behavior, all five CORE providers remain shadow-only, and no unrelated gameplay/data regression is introduced.
