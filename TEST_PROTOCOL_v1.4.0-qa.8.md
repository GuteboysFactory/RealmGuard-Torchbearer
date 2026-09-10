# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.8

**Build:** v1.4.0-qa.8 — CORE M2 Token of Power L3 parity hotfix  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1–qa.5 PASS; qa.7 Talent provider positive/negative/usage-state paths verified; qa.7 Token L1/L2 verified; qa.7 exposed one L3 shadow parity mismatch  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** `SHADOW_COMPARE` — live application remains OFF

qa.8 is deliberately narrow. It corrects the Token of Power Level 3 shadow provider so CORE mirrors the current Legacy Mixed resolver: L3 offers a failed-dice reroll but does not claim that the Token is consumed by the base roll commit. The real live Legacy Mixed flow remains authoritative in M2 and consumes L3 only when the reroll is actually accepted/used.

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / preservation

- [ ] A1. Install/update to `1.4.0-qa.8` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. No new M0/M1 migration entry is added.

## B. M2 status

```js
const fx = game.realmGuard.core.effects;
fx.getStatus();
```

- [ ] B1. `phase` = `M2`.
- [ ] B2. `mode` = `SHADOW_COMPARE`.
- [ ] B3. `liveApplication` = `false`.
- [ ] B4. `providerCount` = `6`.
- [ ] B5. Providers remain:
  - `conditions.roll-dice`
  - `traits.selected-use`
  - `wises.selected-reroll`
  - `tokens-of-power.selected-use`
  - `talents.selected-use`
  - `conflict-tools.action-modifiers`

## C. L3 fresh-token parity — blocking gate

Use a fresh/unused Level 3 Token of Power linked to a trained Skill on the selected Ranger.

```js
window.qaActor = canvas.tokens.controlled[0]?.actor;
window.qaToken3 = qaActor?.items?.find?.(
  i => i.type === "tokenOfPower" &&
       Number(i.system?.level) === 3 &&
       i.system?.session?.used === false
);

console.log({
  actor: qaActor?.name,
  token: qaToken3?.name,
  level: qaToken3?.system?.level,
  linkedSkill: qaToken3?.system?.linkedSkill,
  used: qaToken3?.system?.session?.used
});
```

- [ ] C1. Expected Actor and fresh L3 Token are shown.
- [ ] C2. `used` = `false`.

Run:

```js
fx.compareTokenPowerEffects(
  qaActor,
  qaToken3.id,
  qaToken3.system.linkedSkill,
  { isSkill: true }
);
```

- [ ] C3. Result reports `match: true`.
- [ ] C4. Legacy and CORE both report `available: true`.
- [ ] C5. Legacy and CORE both report `level: 3`.
- [ ] C6. Legacy and CORE both report `diceBonus: 0`.
- [ ] C7. Legacy and CORE both report `reroll: true`.
- [ ] C8. Legacy and CORE both report `manual: false`.
- [ ] C9. Legacy and CORE both report `consumeOnRoll: false`.
- [ ] C10. CORE L3 effects contain `REROLL` and no `STATE_CHANGE` for the base-roll commit.
- [ ] C11. CORE reroll metadata identifies consumption intent on actual reroll acceptance/use (`consumeOnRerollAccept: true`).

## D. L3 live Legacy Mixed lifecycle regression

Perform a real roll with the L3 Token using the existing live UI. Make sure the base roll contains at least one failed die (1–3) so the reroll can be exercised.

- [ ] D1. Selecting L3 does not add +1D to the base pool.
- [ ] D2. Failed-dice reroll is offered/handled exactly as before qa.8.
- [ ] D3. If the reroll is declined, the Token is not consumed.
- [ ] D4. If the reroll is accepted, failed dice are rerolled once and the Token becomes `session.used: true`.
- [ ] D5. Chat/result presentation remains unchanged from Legacy Mixed behavior.

After actual reroll use, run the comparator again:

```js
fx.compareTokenPowerEffects(
  qaActor,
  qaToken3.id,
  qaToken3.system.linkedSkill,
  { isSkill: true }
);
```

- [ ] D6. Used L3 returns `match: true`.
- [ ] D7. Legacy and CORE both report `available: false`, `reroll: false`, and `consumeOnRoll: false`.

## E. L1/L2 regression

Use representative Level 1 and Level 2 Tokens linked to valid Skills.

- [ ] E1. L1 unused comparison remains `match: true`, `available: true`, `diceBonus: 1`, with shadow `STATE_CHANGE` intent.
- [ ] E2. L1 live use still gives +1D once/session and becomes used after committed use.
- [ ] E3. L1 used comparison remains `match: true`, `available: false`.
- [ ] E4. L2 comparison remains `match: true`, `available: true`, `diceBonus: 1`, with no session-use `STATE_CHANGE`.
- [ ] E5. L2 can still be used repeatedly on appropriate checks and remains available afterward.

## F. Talent regression from qa.7

Use the qa.7 Talent test Actor/Talent or another equivalent session Talent.

- [ ] F1. Valid linked Talent comparison remains `match: true` with the same `available`, `diceBonus`, `manual`, `consumeOnCommit`, and `frequency` in Legacy/CORE.
- [ ] F2. Wrong linked Skill remains `match: true` and unavailable in both.
- [ ] F3. Already-used once/session Talent remains `match: true` and unavailable in both.
- [ ] F4. Live Talent +1D and session consumption remain unchanged.

## G. Existing provider smoke

- [ ] G1. Representative Condition comparison returns `match: true`.
- [ ] G2. Representative Trait comparison returns `match: true`.
- [ ] G3. Representative Wise comparison returns `match: true`; qa.6 live Wise override remains absent.
- [ ] G4. `fx.compareConflictToolEffects("Shield", "defend")` returns `match: true` and +2D.
- [ ] G5. `fx.compareConflictToolEffects("Axe", "attack")` returns `match: true` and +1 conditional success.

## H. General safety

- [ ] H1. Normal trained Skill roll works.
- [ ] H2. Fate/Open 6s and Persona work as before.
- [ ] H3. Help, Conditions, Traits, Wises, Talents and Conflict remain operational.
- [ ] H4. No Actor/Item/world migration is introduced.
- [ ] H5. Reload preserves provider count 6 and produces no M2 errors.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass qa.8 when a fresh L3 Token reports `match: true` with `reroll: true` and `consumeOnRoll: false` in both Legacy and CORE; live L3 use still consumes only when the reroll is actually used; L1/L2/Talent regressions remain green; all six Effect providers remain shadow-only; and no unrelated gameplay/data regression is introduced.
