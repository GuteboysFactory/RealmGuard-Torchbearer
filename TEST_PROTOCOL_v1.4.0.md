# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0

**Build:** v1.4.0 QA — CORE M2 Unified Effect Engine  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**M2 qa.1 mode:** SHADOW / DIAGNOSTIC — no live gameplay takeover

Mark each item PASS / FAIL. Add a note for every FAIL.

## A. Install / baseline

- [ ] A1. Back up or copy the v1.3.0 GOLD test/campaign World.
- [ ] A2. Install v1.4.0 QA over the v1.3.0 copy and launch without console-breaking errors.
- [ ] A3. Foundry reports `1.4.0-qa.1` and internal id remains exactly `realm-guard`.
- [ ] A4. Existing Rangers, NPCs, Items, Scenes, Journals, Playlists, folders and Compendiums remain present.

## B. M0 / M1 preservation

Open **World Health Audit** and **Active Rules Registry**.

- [ ] B1. Schema remains `1`.
- [ ] B2. Architecture remains `0.1`.
- [ ] B3. Active profile remains `realm-guard-legacy-mixed` v1.
- [ ] B4. `m0-core-baseline-v1` still appears exactly once in migration history.
- [ ] B5. M2 qa.1 adds no Actor/Item/world-data migration entry.
- [ ] B6. Active Rules Registry still opens and scrolls normally.
- [ ] B7. Rules Snapshot hash is unchanged from v1.3.0 GOLD.
- [ ] B8. `WISE.MODE = UNRATED`, `INVENTORY.POLICY = STRUCTURED` and `PROGRESSION.LEVELS_TALENTS = ENABLED` remain unchanged.

## C. M2 Effect Engine diagnostics

Open the new **CORE M2 Effect Engine** tool from the GM dock.

- [ ] C1. The tool appears for the GM and opens successfully.
- [ ] C2. Heading shows `MG-FAMILY CORE · M2` and `Unified Effect Engine`.
- [ ] C3. Mode shows `SHADOW_DIAGNOSTIC`.
- [ ] C4. Live application shows `OFF`.
- [ ] C5. Providers shows `0` in qa.1.
- [ ] C6. The window explicitly says that live roll, Conflict and recovery engines still use v1.3.0 GOLD behavior.
- [ ] C7. Effect Types include at least `DICE_MODIFIER`, `SUCCESS_MODIFIER`, `REROLL`, `OPEN_SIX`, `CAPABILITY_BLOCK`, `RESOURCE_COST`, `RESOURCE_GRANT`, `DISPOSITION`, `DAMAGE_ABSORB`, `SCALE_MODIFIER`, `CURRENCY`, `COST_OVERRIDE`, `STATE_CHANGE` and `MANUAL`.
- [ ] C8. The diagnostics window is readable and scrollable at reduced height.

## D. Runtime CORE API

Use the browser console as GM.

- [ ] D1. `game.realmGuard.core.phase` returns `M2`.
- [ ] D2. `game.realmGuard.core.effects.getStatus().mode` returns `SHADOW_DIAGNOSTIC`.
- [ ] D3. `game.realmGuard.core.effects.getStatus().liveApplication` returns `false`.
- [ ] D4. `game.realmGuard.core.effects.getStatus().providerCount` returns `0`.
- [ ] D5. `game.realmGuard.core.effects.engine.listProviders()` returns an empty array.
- [ ] D6. `game.realmGuard.core.effects.types.DICE_MODIFIER` returns `DICE_MODIFIER`.
- [ ] D7. Existing M1 API still works: `game.realmGuard.core.getActiveRulesProfile().id` returns `realm-guard-legacy-mixed`.

## E. Pure Effect model smoke in Foundry console

Run:

```js
const fx = game.realmGuard.core.effects.createEffect({
  id: "qa:test",
  type: game.realmGuard.core.effects.types.DICE_MODIFIER,
  value: 1,
  appliesTo: ["ordinary"],
  source: { label: "QA Test" }
});
fx
```

- [ ] E1. The returned object has id `qa:test`, type `DICE_MODIFIER` and value `1`.
- [ ] E2. The Effect object is immutable/frozen if checked with `Object.isFrozen(fx)`.
- [ ] E3. Creating the Effect does not change any Actor, Item, roll or world data.

## F. Representative gameplay regression

The new Effect Engine must not yet own live rules.

- [ ] F1. Normal trained Skill roll works and result/pool matches v1.3.0.
- [ ] F2. Ability/Nature roll works.
- [ ] F3. Beginner's Luck works.
- [ ] F4. Fate/Open 6s works.
- [ ] F5. Persona works.
- [ ] F6. Help/Teamwork works.
- [ ] F7. Existing Trait modifier behavior is unchanged.
- [ ] F8. Conditions and Recovery work unchanged.
- [ ] F9. Inventory/Gear paper-doll and containers work unchanged.
- [ ] F10. Token Builder / portrait persistence works.
- [ ] F11. GM Control / Quick Inspector works.
- [ ] F12. One complete Conflict flow still works.
- [ ] F13. Turn Manager / Checks and End Session work.
- [ ] F14. Recruitment can create a Ranger as before.
- [ ] F15. Content Studio / Starter Library representative action works.

## G. Reload / multi-client safety

- [ ] G1. F5/reload leaves profile/snapshot/migration metadata unchanged.
- [ ] G2. Effect Engine diagnostics still reports M2 / SHADOW_DIAGNOSTIC / Live application OFF after reload.
- [ ] G3. GM + player both load without CORE M2 permission/socket errors.
- [ ] G4. Ordinary Actor/Item updates still synchronize.
- [ ] G5. Opening Effect Engine diagnostics as GM causes no error on the player client.

## H. Data preservation

- [ ] H1. Character and NPC system fields remain unchanged from v1.3.0 baseline.
- [ ] H2. Embedded Skills/Wises/Traits/Gear/Conditions/Tokens/Talents remain unchanged.
- [ ] H3. Inventory placement/container ids remain unchanged.
- [ ] H4. Progression Level / spent Fate / spent Persona remain unchanged.
- [ ] H5. Recruitment metadata remains unchanged.
- [ ] H6. Starter Compendiums are not rewritten by M2 qa.1.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass qa.1 when the unified Effect model/provider pipeline loads and exposes deterministic diagnostics, M0/M1 state remains intact, and representative gameplay still matches v1.3.0 GOLD. After qa.1 passes, M2 can begin migrating the first real effect provider in a separate QA build rather than changing live modifiers in the foundation build.
