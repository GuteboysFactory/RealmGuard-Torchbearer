# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.2

**Build:** v1.4.0-qa.2 — CORE M2 Condition Dice Effect Provider  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous QA:** v1.4.0-qa.1 — PASS  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**M2 qa.2 mode:** SHADOW_COMPARE — live application remains OFF

This is a focused provider-migration QA. qa.2 does **not** replace the current Condition roll calculation. It independently translates active Condition `rollModifier` / `appliesTo` data into CORE Effects and compares that shadow result with the existing v1.3.0-compatible calculation.

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / preservation

- [ ] A1. Install/update to `1.4.0-qa.2` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit still shows Schema `1`, Architecture `0.1`, Legacy Mixed profile v1 and one M0 migration entry.
- [ ] A6. Active Rules Registry still opens/scrolls and its Rules Snapshot hash is unchanged from v1.3.0 / qa.1.

## B. M2 diagnostics

Open **CORE M2 Effect Engine** from the GM dock.

- [ ] B1. Diagnostics opens successfully.
- [ ] B2. Mode shows `SHADOW_COMPARE`.
- [ ] B3. Live application shows `OFF`.
- [ ] B4. Providers shows `1`.
- [ ] B5. Registered provider is `conditions.roll-dice` / `Conditions · Roll Dice (shadow)`.
- [ ] B6. Shadow Migration Scope states that only Condition dice modifiers have moved into shadow comparison.
- [ ] B7. Diagnostics explicitly states that recovery, disposition and capability-block Condition rules have **not** moved yet.
- [ ] B8. Diagnostics remains scrollable/readable at reduced height.

## C. Runtime API

Use the browser console. Copy only the JavaScript lines inside the blocks — do not copy the Markdown fence markers.

Run:

```js
const actor = game.actors.contents.find(a => a.type === "character");
game.realmGuard.core.effects.getStatus();
```

- [ ] C1. `phase` is `M2`.
- [ ] C2. `mode` is `SHADOW_COMPARE`.
- [ ] C3. `liveApplication` is `false`.
- [ ] C4. `providerCount` is `1`.
- [ ] C5. `migratedProviders` contains `conditions.roll-dice`.

## D. Shadow comparison — no dice Condition

Make sure the chosen Ranger has no active Condition with a non-zero roll modifier. Then run:

```js
game.realmGuard.core.effects.compareConditionDice(actor, "Pathfinder", { isSkill: true });
```

- [ ] D1. Result reports `match: true`.
- [ ] D2. `legacy.dice` and `core.dice` are both `0`.
- [ ] D3. Running the comparison does not roll dice, spend resources or change Actor data.

## E. Shadow comparison — Strained or Injured

Activate **Strained** (or Injured) on the Ranger and make sure Fresh is not active.

Run:

```js
game.realmGuard.core.effects.compareConditionDice(actor, "Pathfinder", { isSkill: true });
```

- [ ] E1. Result reports `match: true`.
- [ ] E2. Legacy and CORE both report the same negative dice modifier (normally `-1` for one active Strained/Injured).
- [ ] E3. CORE effects identify the Condition by name.
- [ ] E4. CORE effect provenance reports provider id `conditions.roll-dice`.

Then run:

```js
game.realmGuard.core.effects.compareConditionDice(actor, "Nature", { isSkill: false });
game.realmGuard.core.effects.compareConditionDice(actor, "Resources", { isSkill: false });
```

- [ ] E5. Nature comparison reports `match: true` and receives the Condition penalty.
- [ ] E6. Resources comparison reports `match: true` and does not receive the Strained/Injured penalty.

## F. Shadow comparison — Fresh

Deactivate other Conditions and activate **Fresh**.

Run:

```js
game.realmGuard.core.effects.compareConditionDice(actor, "Pathfinder", { isSkill: true });
game.realmGuard.core.effects.compareConditionDice(actor, "Resources", { isSkill: false });
```

- [ ] F1. Pathfinder reports `match: true` and Legacy/CORE both report `+1`.
- [ ] F2. Resources reports `match: true` and Legacy/CORE both report `0`.

Restore the Ranger's preferred Condition state after testing.

## G. Live gameplay remains legacy-compatible

- [ ] G1. With Strained or Injured active, perform one normal Skill roll; the existing Condition modifier behavior still works as in v1.3.0 GOLD.
- [ ] G2. Condition activation/deactivation still works normally.
- [ ] G3. Recovery control still works normally.
- [ ] G4. Help/Fate/Persona interaction is unchanged.
- [ ] G5. No new migration entry is added.
- [ ] G6. F5/reload preserves the same M1 Rules Snapshot and M0 migration metadata.

## H. Quick multiplayer smoke

- [ ] H1. GM + player can both load the World without M2 errors.
- [ ] H2. Condition activation and ordinary Actor updates still synchronize.
- [ ] H3. Opening M2 diagnostics as GM causes no error on the player client.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass qa.2 when the first real provider, `conditions.roll-dice`, independently matches the current Condition dice calculation for representative Skill/Nature/Resources contexts, while `liveApplication` remains OFF and existing gameplay stays identical to v1.3.0 GOLD.

A PASS authorizes the next M2 step. It does **not** by itself authorize removal of legacy Condition logic.
