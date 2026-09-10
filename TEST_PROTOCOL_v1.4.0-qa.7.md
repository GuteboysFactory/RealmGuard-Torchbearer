# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.7

**Build:** v1.4.0-qa.7 — CORE M2 Wise Rules Correction  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1–qa.5 PASS; qa.6 Token provider parity PASS, Wise rule defect identified  
**Internal system id:** `realm-guard`  
**Effect Engine:** `SHADOW_COMPARE`, live application OFF  

qa.7 is deliberately a focused correction build. It adds no sixth provider. The five-provider M2 shadow set is preserved while the Legacy Mixed unrated-Wise self-use workflow is corrected to the audited MG2E-style model.

## A. Install / preservation
- [ ] A1. Install/update to `1.4.0-qa.7` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit remains Schema `1`, Architecture `0.1`, Legacy Mixed profile v1 and one M0 migration entry.
- [ ] A6. Active Rules Registry remains unchanged and scrollable.
- [ ] A7. UEE remains scrollable.

## B. M2 status

```js
const fx = game.realmGuard.core.effects;
fx.getStatus();
```

- [ ] B1. `phase` = `M2`.
- [ ] B2. `mode` = `SHADOW_COMPARE`.
- [ ] B3. `liveApplication` = `false`.
- [ ] B4. `providerCount` = `5`.
- [ ] B5. `wiseRuleModel` = `MG2E_UNRATED_SELF_EFFECTS_CORRECTED_QA7`.
- [ ] B6. `wiseRelevance` = `TABLE_CONFIRMED`.
- [ ] B7. `wiseOncePerSession` = `false`.
- [ ] B8. Providers remain Conditions, Traits, Wises, Tokens of Power and Conflict Tools.

## C. Select actual test Actor / Wise
Select the Ranger token you intend to use.

```js
window.qaActor = canvas.tokens.controlled[0]?.actor;
window.qaWise = qaActor?.wises?.[0];
console.log("Actor:", qaActor?.name, "| Wise:", qaWise?.name);
```

- [ ] C1. Expected Actor is shown.
- [ ] C2. Expected Wise is shown.

Give the Ranger at least 2 Fate and 2 Persona for the focused tests if necessary.

## D. CORE Wise shadow model — Deeper Understanding

```js
fx.compareWiseRuleEffects(qaActor, qaWise.id, {
  faces: [1, 2, 4, 6],
  effectMode: "deeper-understanding",
  relevanceConfirmed: true
});
```

- [ ] D1. `match: true`.
- [ ] D2. CORE resource = `fate`, amount = `1`.
- [ ] D3. CORE selector = `one-failed-die`.
- [ ] D4. CORE `maxDice` = `1`.
- [ ] D5. Provider provenance remains `wises.selected-reroll`.

## E. CORE Wise shadow model — Of Course!

```js
fx.compareWiseRuleEffects(qaActor, qaWise.id, {
  faces: [1, 2, 4, 6],
  effectMode: "of-course",
  relevanceConfirmed: true
});
```

- [ ] E1. `match: true`.
- [ ] E2. CORE resource = `persona`, amount = `1`.
- [ ] E3. CORE selector = `all-failed-dice`.
- [ ] E4. CORE `maxDice` = `all`.

Then run with relevance denied:

```js
fx.compareWiseRuleEffects(qaActor, qaWise.id, {
  effectMode: "of-course",
  relevanceConfirmed: false
});
```

- [ ] E5. `match: true` and both reference/CORE report blocked.
- [ ] E6. Block reason states that the Wise subject must be relevant/in play.

## F. Live post-roll Wise dialog
Make a normal Skill test with at least one failed die.

- [ ] F1. Base dice appear before the Wise decision.
- [ ] F2. Dialog clearly states that the Wise subject must actually be relevant to the fiction.
- [ ] F3. A relevance confirmation is required before a Wise effect can be used.
- [ ] F4. **Keep Result** spends nothing and performs no reroll.
- [ ] F5. **Deeper Understanding** is offered only when at least 1 Fate is available.
- [ ] F6. Deeper Understanding lets the player choose one failed die and rerolls exactly that die.
- [ ] F7. Deeper Understanding deducts exactly 1 Fate.
- [ ] F8. **Of Course!** is offered only when at least 1 unreserved Persona is available.
- [ ] F9. Of Course! rerolls all failed dice once.
- [ ] F10. Of Course! deducts exactly 1 Persona.
- [ ] F11. There is no once-per-session Wise lock; a later relevant test can offer the Wise again if resources permit.

## G. Persona reservation safety
Set the Ranger to exactly 1 Persona. In the normal pre-roll dialog choose **Persona +1D**, then roll a test with failed dice.

- [ ] G1. The post-roll Wise dialog does not offer Of Course! using that already-reserved Persona.
- [ ] G2. The pre-roll Persona +1D is still deducted normally after the roll.
- [ ] G3. No free Persona die or negative resource value occurs.

Repeat with at least 2 Persona and Persona +1D preselected.

- [ ] G4. Of Course! can be offered when one additional unreserved Persona remains.
- [ ] G5. Using it plus the pre-roll +1D results in exactly 2 Persona spent in total.

## H. Wise usage marks
After using Deeper Understanding:

```js
fx.wiseUsageMarks(qaWise);
```

- [ ] H1. `deeperUnderstanding: true` after a committed Deeper Understanding use.

After using Of Course!:

```js
fx.wiseUsageMarks(qaWise);
```

- [ ] H2. `ofCourse: true` after a committed Of Course! use.
- [ ] H3. Repeating either effect on later tests does not create a once/session lock.

For **I Am Wise**, use another Ranger's Wise through the normal Help request once on a passing test and once on a failing test.

- [ ] H4. The helper Wise marks `iamWisePass: true` after the passing test.
- [ ] H5. The helper Wise marks `iamWiseFail: true` after the failing test.
- [ ] H6. I Am Wise remains separate from normal Help/Synergy and gives +1D only when the table accepts the Wise as relevant.

When all four marks are true:

```js
fx.wiseCycleComplete(qaWise);
```

- [ ] H7. Returns `true` when all four usage marks are present.
- [ ] H8. No mark automatically deletes or changes the Wise.

Optional manual reset after resolving the Wise perk:

```js
await fx.resetWiseUsageMarks(qaWise);
```

- [ ] H9. Reset clears the four usage marks only; the Wise Item remains intact.

## I. Angry block
Activate Angry on the selected Ranger and make a test with failed dice.

- [ ] I1. Beneficial self Wise use is blocked.
- [ ] I2. No Fate/Persona is spent by a blocked Wise use.
- [ ] I3. `compareWiseRuleEffects(...)` reports `match: true` with CORE/reference blocked.

Restore Angry afterward.

## J. Existing M2 providers / Token regression
- [ ] J1. `compareConditionDice(...)` representative test = `match: true`.
- [ ] J2. `compareTraitEffects(...)` representative test = `match: true`.
- [ ] J3. Token of Power Level 1 linked to Farmer still gives Token compare `match: true`, available true and +1D.
- [ ] J4. `compareConflictToolEffects("Shield", "defend")` = `match: true`, +2D.
- [ ] J5. Provider count remains 5 after F5/reload.

## K. General regression / multiplayer
- [ ] K1. Normal trained Skill roll works.
- [ ] K2. Ability/Nature roll works.
- [ ] K3. Beginner's Luck works.
- [ ] K4. Fate/Open 6s still resolves after Wise effects in the normal post-roll sequence.
- [ ] K5. Token of Power reroll does not reroll a die already rerolled by the Wise path.
- [ ] K6. One representative Conflict opens/advances normally.
- [ ] K7. No new M0/M1 migration entry is added.
- [ ] K8. GM + player load without M2 errors.
- [ ] K9. An owning player can make the post-roll Wise decision on their Ranger.
- [ ] K10. I Am Wise Pass/Fail mark synchronizes to the helper's Wise when the helper belongs to another connected player.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate
qa.7 passes when self Wise use is no longer a free universal reroll: relevance is explicitly table-confirmed, Deeper Understanding costs 1 Fate for one failed die, Of Course! costs 1 Persona for all failed dice, the four usage marks persist without a false once/session lock, Persona reservations cannot be double-spent, and the five-provider M2 shadow suite remains stable.
