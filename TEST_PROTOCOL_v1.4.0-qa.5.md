# TEST PROTOCOL — Realm Guard / Torchbearer v1.4.0-qa.5

**Build:** v1.4.0-qa.5 — CORE M2 Wise Reroll Effect Provider + UEE Scroll Fix  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Previous M2 QA:** qa.1 PASS · qa.2 PASS · qa.3 PASS · qa.4 provider tests PASS; UEE scroll observation carried into qa.5  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** `SHADOW_COMPARE` — live application remains OFF

## A. Install / preservation
- [ ] A1. Install/update to `1.4.0-qa.5` using the QA manifest.
- [ ] A2. World launches without console-breaking errors.
- [ ] A3. Internal system id remains exactly `realm-guard`.
- [ ] A4. Existing Actors/Items/world content remain present.
- [ ] A5. World Health Audit remains Schema `1`, Architecture `0.1`, Legacy Mixed profile v1 and one M0 migration entry.
- [ ] A6. Active Rules Registry remains unchanged and scrollable.

## B. UEE scroll / resize fix
Open **CORE M2 Effect Engine**.
- [ ] B1. UEE opens successfully.
- [ ] B2. A vertical scrollbar is available in the UEE content area.
- [ ] B3. Scroll from the top to the bottom and back again.
- [ ] B4. Registered Providers, QA Shadow Compare and the bottom no-takeover notice are all reachable.
- [ ] B5. Resize the UEE window smaller; content remains reachable by scrolling.
- [ ] B6. Close button remains usable after scrolling/resizing.

## C. M2 status
```js
const fx = game.realmGuard.core.effects;
fx.getStatus();
```
- [ ] C1. `phase` = `M2`.
- [ ] C2. `mode` = `SHADOW_COMPARE`.
- [ ] C3. `liveApplication` = `false`.
- [ ] C4. `providerCount` = `4`.
- [ ] C5. Providers contain `conditions.roll-dice`, `traits.selected-use`, `wises.selected-reroll`, `conflict-tools.action-modifiers`.

## D. Select the actual test Actor/token
Select the token you intend to test, then run:
```js
window.qaActor = canvas.tokens.controlled[0]?.actor;
window.qaWise = qaActor?.wises?.[0];
console.log("Actor:", qaActor?.name, "| Wise:", qaWise?.name);
```
- [ ] D1. The expected Actor name is shown.
- [ ] D2. A real Wise on that Actor is shown.

If the Actor has no Wise, add/use a test Wise before continuing.

## E. Wise reroll shadow comparison — normal
Make sure **Angry is not active** on the selected Actor.
```js
fx.compareWiseEffects(qaActor, qaWise.id, {
  faces: [1, 2, 4, 6],
  rollName: "Pathfinder",
  isSkill: true
});
```
- [ ] E1. `match: true`.
- [ ] E2. Legacy and CORE both report `blocked: false`.
- [ ] E3. Legacy and CORE both report `canReroll: true`.
- [ ] E4. Both identify failed dice indexes `0` and `1` for faces `[1,2,4,6]`.
- [ ] E5. CORE exposes a `REROLL` Effect.
- [ ] E6. CORE Effect provenance shows provider id `wises.selected-reroll`.

## F. Wise reroll shadow comparison — Angry block
Activate **Angry** on the same selected Actor and rerun the E command.
- [ ] F1. `match: true`.
- [ ] F2. Legacy and CORE both report `blocked: true`.
- [ ] F3. Legacy and CORE both report `canReroll: false`.
- [ ] F4. No reroll indexes are offered.
- [ ] F5. CORE exposes `CAPABILITY_BLOCK`.
- [ ] F6. Block reason identifies Angry.

Restore Angry to the Actor's preferred state after testing.

## G. Existing provider regression
- [ ] G1. Representative `compareConditionDice(...)` returns `match: true`.
- [ ] G2. Representative `compareTraitEffects(...)` returns `match: true`.
- [ ] G3. `fx.compareConflictToolEffects("Shield", "defend")` returns `match: true` and +2D.
- [ ] G4. `fx.compareConflictToolEffects("Axe", "attack")` returns `match: true` and +1 conditional success.

## H. Live Wise / gameplay regression
- [ ] H1. Perform a normal real roll using a Wise; current Legacy Mixed reroll workflow works as before.
- [ ] H2. Angry still blocks beneficial Wise use in the live roll workflow.
- [ ] H3. Conditions, Traits and Conflict Tool live behavior remain unchanged.
- [ ] H4. No CORE shadow helper rolls dice or changes Actor data by itself.
- [ ] H5. No new migration entry is added.

## I. Reload / multiplayer
- [ ] I1. F5/reload preserves M0/M1 state and provider count remains 4.
- [ ] I2. GM + player load without M2 errors.
- [ ] I3. Opening/scrolling UEE as GM causes no player-client error.

## QA decision
**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate
Pass qa.5 when the UEE window is reliably scrollable, `wises.selected-reroll` matches the current Legacy Mixed Wise availability/blocking behavior and failed-die eligibility, and all four providers remain shadow-only with no live gameplay regression.
