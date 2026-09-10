# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.3

**Build:** v1.4.0-qa.3 — CORE M2 Trait Effect Provider  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1 PASS · qa.2 PASS  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** `SHADOW_COMPARE` — live application remains OFF

qa.3 adds the second real CORE Effect Provider: selected Trait roll effects. Existing v1.3.0-compatible Trait code still controls real rolls. The new provider only calculates a parallel result for comparison.

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / preservation

- [ ] A1. Install/update to `1.4.0-qa.3` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit remains unchanged: Schema `1`, Architecture `0.1`, Legacy Mixed profile v1, one M0 migration entry.
- [ ] A6. Active Rules Registry still opens/scrolls and its Rules Snapshot hash is unchanged.

## B. M2 diagnostics

Open **CORE M2 Effect Engine** from the GM dock.

- [ ] B1. Diagnostics opens successfully.
- [ ] B2. Mode shows `SHADOW_COMPARE`.
- [ ] B3. Live application shows `OFF`.
- [ ] B4. Providers shows `2`.
- [ ] B5. `conditions.roll-dice` is listed.
- [ ] B6. `traits.selected-use` / `Traits · Selected Use (shadow)` is listed.
- [ ] B7. Shadow Migration Scope mentions Condition dice modifiers **and** selected Trait roll effects.
- [ ] B8. Diagnostics states that Trait session-use consumption, actual Check awards and resource commits remain legacy-controlled.
- [ ] B9. Diagnostics remains readable/scrollable at reduced height.

## C. Runtime API

Copy only the JavaScript inside the code block into the Foundry console.

```js
const actor = game.actors.contents.find(a => a.type === "character");
const trait = actor?.traits?.[0];
game.realmGuard.core.effects.getStatus();
```

- [ ] C1. `phase` is `M2`.
- [ ] C2. `mode` is `SHADOW_COMPARE`.
- [ ] C3. `liveApplication` is `false`.
- [ ] C4. `providerCount` is `2`.
- [ ] C5. `migratedProviders` contains both `conditions.roll-dice` and `traits.selected-use`.
- [ ] C6. `trait` resolves to one Trait on the chosen Ranger. If not, choose a Ranger that has a Trait.

## D. Trait Help shadow comparison

Run:

```js
game.realmGuard.core.effects.compareTraitEffects(actor, trait.id, "help", {
  versus: false,
  baseSuccesses: 3,
  target: 3,
  rollName: "Pathfinder",
  isSkill: true
});
```

- [ ] D1. Result reports `match: true`.
- [ ] D2. Legacy and CORE resolve the same Trait mode.
- [ ] D3. For an available Level 1/2 Trait, Legacy and CORE both show `selfDice: 1`.
- [ ] D4. For a Level 3 Trait on the supplied passed/tied example, Legacy and CORE both show `successBonus: 1`.
- [ ] D5. CORE Effect provenance shows provider id `traits.selected-use` when an Effect is produced.

Only D3 **or** D4 needs to apply, depending on the rating of the Trait you selected.

## E. Trait Against shadow comparison

Run:

```js
game.realmGuard.core.effects.compareTraitEffects(actor, trait.id, "against", {
  versus: false,
  baseSuccesses: 0,
  target: 0
});
```

- [ ] E1. Result reports `match: true`.
- [ ] E2. Legacy and CORE both show `selfDice: -1`.
- [ ] E3. Legacy and CORE both show `checks: 1`.
- [ ] E4. CORE exposes the -1D as `DICE_MODIFIER` and the Check entitlement as `CURRENCY`.

## F. Trait Against in Versus shadow comparison

Run:

```js
game.realmGuard.core.effects.compareTraitEffects(actor, trait.id, "hurt", {
  versus: true,
  baseSuccesses: 0,
  target: 0
});
```

- [ ] F1. Result reports `match: true`.
- [ ] F2. Legacy and CORE both show `opponentDice: 2`.
- [ ] F3. Legacy and CORE both show `checks: 2`.
- [ ] F4. CORE marks the +2D Effect with channel `opponent`.

## G. Angry blocks beneficial Trait use

Temporarily activate **Angry** on the chosen Ranger and run:

```js
game.realmGuard.core.effects.compareTraitEffects(actor, trait.id, "help", {
  versus: false,
  baseSuccesses: 3,
  target: 3
});
```

- [ ] G1. Result reports `match: true`.
- [ ] G2. Legacy and CORE both report `blocked: true`.
- [ ] G3. CORE produces a `CAPABILITY_BLOCK` Effect.
- [ ] G4. The block reason identifies Angry as the reason.

Restore Angry to the Ranger's original state afterward.

## H. Live gameplay remains legacy-compatible

- [ ] H1. Perform one normal roll using a beneficial Trait; real behavior matches v1.3.0 GOLD.
- [ ] H2. Perform or preview Trait Against; existing -1D / Check workflow is unchanged.
- [ ] H3. Condition behavior from qa.2 still works and `compareConditionDice(...)` still gives `match: true` on a representative test.
- [ ] H4. Help/Fate/Persona/Wise behavior is unchanged.
- [ ] H5. No new migration entry is added.
- [ ] H6. F5/reload preserves the same M1 Rules Snapshot and M0 migration metadata.

## I. Quick multiplayer smoke

- [ ] I1. GM + player can both load the World without M2 errors.
- [ ] I2. Ordinary Actor/Item updates still synchronize.
- [ ] I3. Opening M2 diagnostics as GM causes no error on the player client.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass qa.3 when `traits.selected-use` matches the current Legacy Mixed Trait calculations for beneficial use, Trait Against, Versus Trait Against and Angry blocking, while both Effect providers remain shadow-only and real gameplay remains identical to v1.3.0 GOLD.

A PASS authorizes the next M2 provider step. It does **not** authorize live takeover or removal of legacy Trait logic.
