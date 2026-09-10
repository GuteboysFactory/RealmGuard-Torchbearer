# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.7

**Build:** v1.4.0-qa.7 — CORE M2 Talent Effect Provider + Roadmap Compliance Correction  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1–qa.5 PASS; qa.6 Token of Power parity verified; qa.6 Wise live-UX experiment is deliberately reverted here  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** `SHADOW_COMPARE` — live application remains OFF

This build returns M2 to the locked implementation roadmap: the Effect Engine may model and compare effects, but M2 does not change the active Wise rules model. The new functional scope is the sixth shadow provider, `talents.selected-use`.

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / preservation

- [ ] A1. Install/update to `1.4.0-qa.7` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit remains Schema `1`, Architecture `0.1`, Legacy Mixed profile v1 and one M0 migration entry.
- [ ] A6. Active Rules Registry remains unchanged and scrollable.
- [ ] A7. UEE remains scrollable at reduced height.

## B. M2 status

```js
const fx = game.realmGuard.core.effects;
fx.getStatus();
```

- [ ] B1. `phase` = `M2`.
- [ ] B2. `mode` = `SHADOW_COMPARE`.
- [ ] B3. `liveApplication` = `false`.
- [ ] B4. `providerCount` = `6`.
- [ ] B5. `migratedProviders` contains all six providers:
  - `conditions.roll-dice`
  - `traits.selected-use`
  - `wises.selected-reroll`
  - `tokens-of-power.selected-use`
  - `talents.selected-use`
  - `conflict-tools.action-modifiers`
- [ ] B6. UEE diagnostics explicitly states that the qa.6 Wise live override was removed/deferred and that M2 preserves Legacy Mixed behavior.

## C. Roadmap compliance — Wise baseline restored

Select the Ranger/token you use for QA:

```js
window.qaActor = canvas.tokens.controlled[0]?.actor;
window.qaWise = qaActor?.wises?.[0];
console.log("Actor:", qaActor?.name, "| Wise:", qaWise?.name);
```

- [ ] C1. The expected Actor and Wise are shown.
- [ ] C2. The qa.6 automatic post-roll `Use a Wise?` override is no longer injected when no Wise was selected before the roll.
- [ ] C3. Selecting a Wise through the existing Legacy Mixed roll workflow behaves as it did before qa.6.
- [ ] C4. Existing selected-Wise failed-dice reroll behavior remains unchanged from the Legacy Mixed baseline.
- [ ] C5. No new MG2E-specific Deeper Understanding / Of Course! Fate/Persona UI is active in M2.

Shadow parity still needs to remain green:

```js
fx.compareWiseEffects(qaActor, qaWise.id, {
  faces: [1, 2, 4, 6],
  rollName: "Pathfinder",
  isSkill: true
});
```

- [ ] C6. `match: true`.
- [ ] C7. With Angry inactive, Legacy/CORE both identify failed indexes `0` and `1`.
- [ ] C8. With Angry active on the same selected Actor, Legacy/CORE both report blocked and `match: true`.

Restore Angry afterward.

## D. Select an actual Talent

Select a Ranger/token that owns at least one Talent:

```js
window.qaActor = canvas.tokens.controlled[0]?.actor;
window.qaTalent = qaActor?.talents?.[0];
console.log(
  "Actor:", qaActor?.name,
  "| Talent:", qaTalent?.name,
  "| Link:", qaTalent?.system?.linkType,
  qaTalent?.system?.linkedSkill || qaTalent?.system?.linkedAbility,
  "| Frequency:", qaTalent?.system?.frequency,
  "| Used:", qaTalent?.system?.session?.used
);
```

- [ ] D1. The expected Actor and Talent are shown.
- [ ] D2. Talent configuration shown in the console matches the Item sheet.

If no suitable Talent exists, use/create a temporary Level-2+ QA Talent through the normal UI.

## E. Talent shadow comparison — linked dice Talent

For a Skill-linked Talent, use its real linked Skill name. Example:

```js
fx.compareTalentEffects(
  qaActor,
  qaTalent.id,
  qaTalent.system.linkedSkill,
  { isSkill: true }
);
```

For an Ability-linked Talent, use:

```js
fx.compareTalentEffects(
  qaActor,
  qaTalent.id,
  qaTalent.system.linkedAbility,
  { isSkill: false }
);
```

- [ ] E1. Result reports `match: true`.
- [ ] E2. Legacy and CORE agree on `available`.
- [ ] E3. Legacy and CORE agree on `diceBonus`.
- [ ] E4. Legacy and CORE agree on `manual`.
- [ ] E5. Legacy and CORE agree on `frequency`.
- [ ] E6. For session/conflict frequency, CORE exposes a shadow `STATE_CHANGE` but does not mutate the Talent.
- [ ] E7. CORE effect provenance shows provider id `talents.selected-use`.

## F. Talent applicability / used state

For a Skill-linked Talent, compare it against an unrelated Skill:

```js
fx.compareTalentEffects(
  qaActor,
  qaTalent.id,
  "Definitely Not The Linked Skill",
  { isSkill: true }
);
```

- [ ] F1. Result reports `match: true`.
- [ ] F2. Legacy and CORE both report `available: false`.

If the Talent has `frequency: "session"`, use it normally or temporarily test an already-used QA Talent, then rerun the linked comparison.

- [ ] F3. An already-used once/session Talent gives `match: true` and `available: false` in both Legacy and CORE.

## G. Optional Talent modes

Only test the cases that exist in your QA world; the automated release smoke covers all modes.

- [ ] G1. Passive Talent: Legacy/CORE agree on dice bonus and no consumption state.
- [ ] G2. Conflict-frequency Talent: without a conflict `contextKey`, Legacy/CORE agree that it is unavailable.
- [ ] G3. Conflict-frequency Talent: with a fresh `contextKey`, Legacy/CORE agree and CORE exposes the shadow conflict `STATE_CHANGE`.
- [ ] G4. Manual Talent: Legacy/CORE agree on `manual: true`, and CORE exposes `MANUAL` rather than inventing dice.

Mark non-applicable rows N/A rather than FAIL.

## H. Existing M2 provider regression

Using the selected test Actor/token:

- [ ] H1. Representative `compareConditionDice(...)` returns `match: true`.
- [ ] H2. Representative `compareTraitEffects(...)` returns `match: true`.
- [ ] H3. Representative `compareWiseEffects(...)` returns `match: true`.
- [ ] H4. Representative `compareTokenPowerEffects(...)` returns `match: true`.
- [ ] H5. `fx.compareConflictToolEffects("Shield", "defend")` returns `match: true` and +2D.
- [ ] H6. `fx.compareConflictToolEffects("Axe", "attack")` returns `match: true` and +1 conditional success.

## I. Live Talent regression

- [ ] I1. A normal current Talent can be selected/used through the existing UI exactly as before.
- [ ] I2. Its dice bonus is unchanged from the Legacy Mixed baseline.
- [ ] I3. Once/session Talent consumption is unchanged.
- [ ] I4. Conflict-frequency Talent consumption is unchanged where applicable.
- [ ] I5. Passive/manual Talent behavior is unchanged where applicable.
- [ ] I6. CORE shadow comparison itself does not write Talent state or spend resources.

## J. General regression / data safety

- [ ] J1. Normal trained Skill roll works.
- [ ] J2. Ability/Nature roll works.
- [ ] J3. Beginner's Luck works.
- [ ] J4. Fate/Open 6s and Persona work as before.
- [ ] J5. Help, Conditions, Traits, Tokens of Power and Conflict remain operational.
- [ ] J6. No new migration entry is added.
- [ ] J7. Existing Talent/Wise/Token Item data is unchanged by installing qa.7.

## K. Reload / multiplayer

- [ ] K1. F5/reload preserves M0/M1 state and provider count remains `6`.
- [ ] K2. GM + player load without M2 errors.
- [ ] K3. Ordinary Actor/Item updates still synchronize.
- [ ] K4. Opening/scrolling UEE as GM causes no player-client error.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass qa.7 when `talents.selected-use` matches current Legacy Mixed Talent availability, dice/manual behavior and consumption intent; the qa.6 Wise live override is gone; all six Effect providers remain shadow-only; and no unrelated gameplay/data regression is introduced.

A PASS advances M2 without activating strict-profile rule corrections or Effect Engine live takeover.
