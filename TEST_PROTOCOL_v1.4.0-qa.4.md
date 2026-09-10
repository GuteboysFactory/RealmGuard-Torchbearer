# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.4

**Build:** v1.4.0-qa.4 — CORE M2 Conflict Tool Effect Provider  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1 PASS · qa.2 PASS · qa.3 PASS  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** `SHADOW_COMPARE` — live application remains OFF

qa.4 adds the third real CORE Effect Provider: current Legacy Mixed Conflict Weapon/Tool action modifiers. Existing Conflict code still controls live rolls and outcomes.

## A. Install / preservation
- [ ] A1. Install/update to `1.4.0-qa.4` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit remains Schema `1`, Architecture `0.1`, Legacy Mixed profile v1, one M0 migration entry.
- [ ] A6. Active Rules Registry still opens/scrolls and its Rules Snapshot hash is unchanged.

## B. M2 diagnostics
Open **CORE M2 Effect Engine**.
- [ ] B1. Mode shows `SHADOW_COMPARE`.
- [ ] B2. Live application shows `OFF`.
- [ ] B3. Providers shows `3`.
- [ ] B4. Providers include `conditions.roll-dice`, `traits.selected-use`, `conflict-tools.action-modifiers`.
- [ ] B5. Scope mentions Conflict Weapon/Tool action modifiers.
- [ ] B6. UI states Armor/damage absorption is not invented in this provider.
- [ ] B7. Legacy Mixed no-tool −1D is explicitly identified as profile-specific legacy compatibility.
- [ ] B8. Diagnostics remains readable and scrollable.

## C. Runtime status
```js
const fx = game.realmGuard.core.effects;
fx.getStatus();
```
- [ ] C1. `phase` = `M2`.
- [ ] C2. `mode` = `SHADOW_COMPARE`.
- [ ] C3. `liveApplication` = `false`.
- [ ] C4. `providerCount` = `3`.
- [ ] C5. `migratedProviders` contains all three provider ids.

## D. Physical weapon table
Run these one at a time. Every result must show `match: true`.

```js
fx.compareConflictToolEffects("Shield", "defend");
fx.compareConflictToolEffects("Halberd", "attack");
fx.compareConflictToolEffects("Halberd", "maneuver");
fx.compareConflictToolEffects("Whip", "maneuver");
fx.compareConflictToolEffects("Spear", "feint");
fx.compareConflictToolEffects("Staff", "feint");
fx.compareConflictToolEffects("Bow", "maneuver");
fx.compareConflictToolEffects("Sling", "maneuver");
fx.compareConflictToolEffects("Axe", "attack");
fx.compareConflictToolEffects("Axe", "defend");
```

- [ ] D1. Shield Defend = +2D.
- [ ] D2. Halberd Attack = +1D.
- [ ] D3. Halberd Maneuver = −1D.
- [ ] D4. Whip Maneuver = +1D and +1 conditional success.
- [ ] D5. Spear Feint = +1 conditional success.
- [ ] D6. Staff Feint = +1D.
- [ ] D7. Bow Maneuver = +2D.
- [ ] D8. Sling Maneuver = +1D.
- [ ] D9. Axe Attack = +1 conditional success.
- [ ] D10. Axe Defend = −1D.

## E. Sword Useful action
```js
fx.compareConflictToolEffects("Sword", "attack", { swordAction: "attack" });
fx.compareConflictToolEffects("Sword", "defend", { swordAction: "attack" });
```
- [ ] E1. Sword Attack with `swordAction: "attack"` = `match: true`, +1D.
- [ ] E2. Sword Defend with Attack locked = `match: true`, 0D.

## F. Generic Conflict Tool
```js
const qaTool = { kind: "tool", id: "qa-tool", name: "QA Tool", action: "attack", effect: "dice", value: 2 };
fx.compareConflictToolEffects(qaTool, "attack");
fx.compareConflictToolEffects(qaTool, "defend");
```
- [ ] F1. Attack = `match: true`, +2D.
- [ ] F2. Defend = `match: true`, 0D.

Then:
```js
const requiredTool = { kind: "tool", id: "qa-required", name: "QA Required", action: "attack", effect: "dice", value: 3, requirement: "high ground" };
fx.compareConflictToolEffects(requiredTool, "attack", { requirementMet: false });
```
- [ ] F3. Result = `match: true`.
- [ ] F4. CORE modifier is 0 and exposes `CAPABILITY_BLOCK`.

## G. Legacy no-tool compatibility
```js
fx.compareConflictToolEffects(null, "attack");
```
- [ ] G1. Result = `match: true`.
- [ ] G2. Legacy/Core both show −1D.
- [ ] G3. CORE Effect has `legacyCompatibility: true`.

**Important:** this preserves current Legacy Mixed behavior only. It is not a universal MG-family CORE rule.

## H. Existing providers regression
Use the token/Actor you actually intend to test, not the first world Actor.

```js
const actor = canvas.tokens.controlled[0]?.actor;
const trait = actor?.traits?.[0];
```
- [ ] H1. Representative `compareConditionDice(...)` still returns `match: true`.
- [ ] H2. Representative `compareTraitEffects(...)` still returns `match: true`.
- [ ] H3. Angry beneficial Trait blocking still reports Legacy/Core `blocked: true` when Angry is active on that selected Actor.

## I. Live Conflict regression
- [ ] I1. Start/open a normal Conflict without errors.
- [ ] I2. Physical Conflict Weapon selection still works.
- [ ] I3. Weapon/Tool modifiers shown/applied by the live Conflict engine behave as before v1.3.0.
- [ ] I4. Sword Useful action behavior still works.
- [ ] I5. Maneuver Disarm still disables eligible Gear as before.
- [ ] I6. Conflict can resolve/advance normally.
- [ ] I7. No CORE shadow calculation changes live Dice, successes, Disposition or outcomes.

## J. Data / reload / multiplayer
- [ ] J1. No new migration entry is added.
- [ ] J2. Gear inventory placement/container ids remain unchanged.
- [ ] J3. F5/reload preserves M0/M1 state and M2 providers remain 3.
- [ ] J4. GM + player load without M2 errors.
- [ ] J5. Opening M2 diagnostics as GM causes no player-client error.

## QA decision
**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate
Pass qa.4 when `conflict-tools.action-modifiers` matches the frozen Legacy Mixed action-modifier reference for representative physical weapons, Sword Useful, generic Conflict Tools, requirement blocking and legacy no-tool behavior, while all live Conflict behavior remains unchanged.

A PASS authorizes the next M2 provider step. It does **not** authorize live takeover or removal of legacy Conflict logic.
