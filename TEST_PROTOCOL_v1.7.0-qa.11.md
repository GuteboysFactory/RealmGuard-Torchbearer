# Realm Guard / Torchbearer — TEST PROTOCOL v1.7.0-qa.11

**Milestone:** M5 — Gear / Inventory / Conflict Tools  
**Build:** v1.7.0-qa.11  
**Foundry target:** v13.351  
**Rules authority:** Legacy Mixed  
**CORE application:** SHADOW / READ-ONLY  
**Live takeover:** OFF

## Purpose

This build is the first M5 backend step that connects **real live Legacy Mixed activity** to the CORE M5 services without changing live authority.

The new `M5ParityBridge` observes:

- successful live Gear placement/unassignment writes,
- container placement writes,
- resolved live Conflict Tool/Weapon roll effects,
- explicit manual QA probes.

It compares the Legacy Mixed result with the M5 CORE validator/evaluator and records `MATCH`, `MISMATCH`, or `CORE_ONLY` diagnostics.

A mismatch is diagnostic only. It must **never block, rewrite, cancel, or replace** the live Legacy Mixed operation.

---

# A. Installation / baseline

- [ ] A1. Install/update **v1.7.0-qa.11**.
- [ ] A2. Start a world in **Foundry v13.351**.
- [ ] A3. World loads without Realm Guard JavaScript errors.
- [ ] A4. Existing Ranger/NPC Actors, Items, Scenes, Journals and Compendiums remain present.
- [ ] A5. Existing Equipment layout is unchanged.
- [ ] A6. PC portrait remains square/original artwork; generated round token does not replace it.
- [ ] A7. `game.realmGuard.core.m5.getStatus()` returns:
  - `phase: "M5"`
  - `mode: "SHADOW_PARITY"`
  - `liveApplication: false`
  - `authority: "LEGACY_MIXED"`
  - `parity.inventoryLiveObservation: true`
  - `parity.conflictToolLiveObservation: true`
- [ ] A8. M2, M3 and M4 remain available and show their previously verified state.

**A result:** PASS / FAIL

---

# B. Parity diagnostics API

Open the browser console as GM.

1. Run:

```js
game.realmGuard.core.m5.parity.clear()
```

- [ ] B1. Returns a report with `total: 0`.

2. Run:

```js
game.realmGuard.core.m5.parity.report()
```

- [ ] B2. Report says `mode: "SHADOW_PARITY"`.
- [ ] B3. Report says `authority: "LEGACY_MIXED"`.
- [ ] B4. Report says `liveApplication: false`.

3. Open the GM Dock → **MG-Family CORE · M5 Gear / Inventory / Conflict Tools**.

- [ ] B5. Dialog opens normally.
- [ ] B6. Dialog shows live parity counters.
- [ ] B7. Dialog explicitly says live application is OFF and Legacy Mixed remains authority.

**B result:** PASS / FAIL

---

# C. Inventory — real successful operations

Use a Ranger with representative Gear. Before beginning:

```js
game.realmGuard.core.m5.parity.clear()
```

Perform these actions through the normal Character sheet UI, not console mutation.

- [ ] C1. Move a valid 1H item into an empty Left or Right Hand.
- [ ] C2. Move a valid cloak/cape/mantle into Cloak.
- [ ] C3. Equip a Backpack/Satchel correctly on Torso.
- [ ] C4. Move a legal item into the active Backpack/Satchel.
- [ ] C5. Move the contained item back to Unassigned Gear.
- [ ] C6. Move ordinary Gear between two legal Equipment zones.

Then run:

```js
game.realmGuard.core.m5.parity.report({ domain: "inventory" })
```

Expected:

- [ ] C7. Inventory observations exist.
- [ ] C8. Successful ordinary placements are `MATCH`.
- [ ] C9. Container placement is `MATCH`.
- [ ] C10. Unassign is `MATCH`.
- [ ] C11. No successful normal UI operation is blocked by CORE.
- [ ] C12. Legacy Mixed remains the writer; CORE has not created or rewritten Items itself.

**C result:** PASS / FAIL

---

# D. Inventory — structured placement regression

Verify the existing live UI/Legacy Mixed behavior remains unchanged.

- [ ] D1. A 2H item occupies/locks the opposite Hand as before.
- [ ] D2. Two incompatible hand placements cannot coexist through normal UI.
- [ ] D3. Cloak accepts the intended cloak/cape/mantle family only.
- [ ] D4. Belt capacity behaves as before.
- [ ] D5. Pocket capacity behaves as before.
- [ ] D6. Torso capacity behaves as before.
- [ ] D7. Only one Backpack/Satchel can be actively equipped where the existing policy requires it.
- [ ] D8. Inactive Backpack/Satchel cannot be used for pack storage.
- [ ] D9. Container capacity is enforced.
- [ ] D10. Nested containers remain rejected/deferred exactly as before.
- [ ] D11. Existing orphan/missing-container handling is unchanged.

Important: qa.11 does not yet replace the Legacy Mixed validators. Rejected operations that do not reach an Item write may therefore not create an automatic live parity event. They can be compared with the manual probes in section E.

**D result:** PASS / FAIL

---

# E. Manual placement/container parity probes

Choose an Actor and Gear IDs from the live world.

Example setup:

```js
const actor = game.actors.getName("Ranger Name");
const gear = actor.items.find(i => i.type === "gear");
```

Test a known legal zone:

```js
game.realmGuard.core.m5.parity.probeZone(actor, gear.id, "right-hand", { legacyAccepted: true })
```

- [ ] E1. A case known to be accepted by Legacy Mixed returns `MATCH` when CORE also accepts it.

Test a known illegal placement and state the expected Legacy result:

```js
game.realmGuard.core.m5.parity.probeZone(actor, gear.id, "cloak", { legacyAccepted: false })
```

- [ ] E2. A case rejected by both Legacy Mixed and CORE returns `MATCH`.

For a valid active container:

```js
game.realmGuard.core.m5.parity.probeContainer(actor, gear.id, containerId, { legacyAccepted: true })
```

- [ ] E3. Legal container placement returns `MATCH`.

- [ ] E4. If a deliberate wrong `legacyAccepted` value is supplied, the result becomes `MISMATCH` and a warning is logged.
- [ ] E5. A diagnostic `MISMATCH` does not mutate the Actor/Item.

Clear the deliberately manufactured mismatch before continuing:

```js
game.realmGuard.core.m5.parity.clear()
```

**E result:** PASS / FAIL

---

# F. Conflict Tool — physical Gear parity

Start a normal **Fight** Conflict with weapons/tools equipped as the existing live workflow expects.

Before rolling:

```js
game.realmGuard.core.m5.parity.clear()
```

Test representative physical tools where available.

- [ ] F1. Unarmed / no valid tool applies the existing **Legacy Mixed −1D** live behavior.
- [ ] F2. CORE parity records the same Legacy Mixed compatibility result while takeover remains OFF.
- [ ] F3. Shield / Defend live modifier matches CORE.
- [ ] F4. Halberd action modifier matches CORE.
- [ ] F5. Spear action modifier matches CORE.
- [ ] F6. Staff / Feint modifier matches CORE.
- [ ] F7. Bow / Maneuver modifier matches CORE.
- [ ] F8. Sling / Maneuver modifier matches CORE.
- [ ] F9. Axe dice/success behavior matches CORE.
- [ ] F10. Sword Useful selected action matches CORE.

After one or more rolls, run:

```js
game.realmGuard.core.m5.parity.report({ domain: "conflict-tool" })
```

- [ ] F11. `LIVE_CONFLICT_ROLL` observations are present.
- [ ] F12. Tested normal physical tools report `MATCH`.
- [ ] F13. The live Conflict result/disposition behavior is unchanged.

**F result:** PASS / FAIL

---

# G. Conflict Tool — custom / narrative multi-effect parity

Create/use an existing custom Conflict Tool with more than one effect, for example:

- `+1D` on Maneuver
- `+1s` on a successful Maneuver
- a requirement such as credible evidence

- [ ] G1. Tool appears only for the intended Conflict Type.
- [ ] G2. When requirement is met, live dice modifier matches CORE.
- [ ] G3. When requirement is met, live conditional success modifier matches CORE.
- [ ] G4. When requirement is not met, live flow grants no tool bonus.
- [ ] G5. Requirement-not-met result matches CORE.
- [ ] G6. No sword/physical Fight Gear leaks into an Argument-style Conflict unless the existing workflow explicitly allows it.

**G result:** PASS / FAIL

---

# H. Natural Conflict Tool parity

Use an NPC/creature with a natural Conflict Tool if available, e.g. Claws.

- [ ] H1. Natural Tool is visible to CORE for the intended Conflict Type.
- [ ] H2. Natural Tool action modifier evaluates correctly.
- [ ] H3. Live Conflict behavior remains Legacy Mixed-authoritative.
- [ ] H4. Manual `probeConflict(...)` can compare the natural Tool result if the current legacy UI path does not expose it directly.

**H result:** PASS / FAIL

---

# I. Disable / Disarm backend regression

qa.11 does not transfer Disarm authority to CORE, but the M5 backend capability must remain intact.

Run representative inspection:

```js
game.realmGuard.core.m5.conflictTools.disableTargets(actor, { conflictType: "fight" })
```

- [ ] I1. Eligible Gear/Conflict Tool providers are listed.
- [ ] I2. Eligible Trait provider targets remain representable where supported by M5.
- [ ] I3. Existing live disabled Gear state continues to remove disabled Gear from the live Conflict choice/result.
- [ ] I4. CORE evaluation receives the live disabled Gear IDs when a Conflict roll is observed.
- [ ] I5. Disable/restore behavior does not permanently mutate unrelated Gear state.

**I result:** PASS / FAIL

---

# J. Reload / persistence

Generate a few parity observations, then reload the browser/world.

- [ ] J1. World reload succeeds.
- [ ] J2. Actor Gear placement persists exactly as before.
- [ ] J3. Containers/content persist exactly as before.
- [ ] J4. Conflict state recovery behavior is unchanged.
- [ ] J5. `game.realmGuard.core.m5` is rebuilt and available after reload.
- [ ] J6. Parity event history is reset after reload (expected for qa.11 in-memory diagnostics).
- [ ] J7. No gameplay data was relying on parity event persistence.

**J result:** PASS / FAIL

---

# K. Multi-client smoke

Run GM + one owning player client if practical.

- [ ] K1. Player can perform normal permitted Inventory movement.
- [ ] K2. GM and player see the resulting Actor state converge normally.
- [ ] K3. CORE parity observation does not create duplicate Item mutations.
- [ ] K4. Conflict rolls submitted by the player still reach the GM as before.
- [ ] K5. GM-authoritative Conflict state still resolves normally.
- [ ] K6. No socket/permission error is introduced by M5 parity observation.

**K result:** PASS / FAIL

---

# L. Locked Equipment / Portrait / Token regression

No cosmetic redesign is part of qa.11.

- [ ] L1. Containers remain in the left column.
- [ ] L2. Unassigned Gear remains directly below Containers.
- [ ] L3. Equipment remains the large right column.
- [ ] L4. Equipment Figure offers only Custom Figure + Ancestry Figure.
- [ ] L5. Human/Dúnadan figure remains approved gray humanoid silhouette.
- [ ] L6. Elf figure remains approved gray humanoid silhouette/proportions.
- [ ] L7. Dwarf figure remains approved gray humanoid silhouette/proportions.
- [ ] L8. Hobbit/Halfling figure remains approved gray humanoid silhouette/proportions.
- [ ] L9. No cardboard/geometric mannequin appears.
- [ ] L10. Figure Settings gear still exposes Custom image path / Fit / Zoom / Horizontal / Vertical.
- [ ] L11. Source + Ancestry toolbar remains responsive.
- [ ] L12. PC original square portrait is preserved.
- [ ] L13. PC round token remains separate.
- [ ] L14. NPC round-token portrait workflow remains unchanged.

**L result:** PASS / FAIL

---

# M. M2 / M3 / M4 preservation smoke

Representative regression only; previous milestone QA remains authoritative.

- [ ] M1. Ordinary test works.
- [ ] M2. Versus test works.
- [ ] M3. Fate/Open 6s works.
- [ ] M4. Persona spend works.
- [ ] M5. Beginner's Luck works.
- [ ] M6. Advancement still records exactly once.
- [ ] M7. Nature Tap/Tax representative flow works.
- [ ] M8. Condition modifier representative flow works.
- [ ] M9. Recovery representative flow works.
- [ ] M10. No new M2/M3/M4 parity errors are introduced.

**M result:** PASS / FAIL

---

# N. Console / error gate

After all tests:

```js
game.realmGuard.core.m5.parity.report()
game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })
```

- [ ] N1. No unexpected `MISMATCH` remains.
- [ ] N2. Any deliberate manufactured mismatch from section E was cleared.
- [ ] N3. No uncaught Realm Guard exception appears in console.
- [ ] N4. No repeated parity warning loop appears.
- [ ] N5. No Foundry canvas/render regression appears.
- [ ] N6. No new FilePicker regression appears.

**N result:** PASS / FAIL

---

# Promotion decision

## PASS criteria

Promote qa.11 M5 live parity bridge only if:

1. real successful Inventory writes produce expected CORE parity observations,
2. live Conflict Tool rolls produce expected CORE parity observations,
3. representative placement/container/tool cases show no unexplained mismatch,
4. Legacy Mixed remains the sole live writer/authority,
5. CORE still has `liveApplication:false`,
6. no locked Equipment/Portrait/Token regression exists,
7. no M2/M3/M4 regression exists.

## If PASS

Next M5 step:

- instrument rejected Legacy Inventory operations directly so accepted **and rejected** Legacy validator decisions can be compared automatically,
- deepen Conflict Tool declaration/disable parity,
- only after a sufficiently broad parity matrix is clean consider any controlled live handoff.

## If FAIL

Do **not** enable CORE takeover. Record the exact parity event from:

```js
game.realmGuard.core.m5.parity.events({ mismatchesOnly: true })
```

and patch the shadow service/bridge while preserving Legacy Mixed live behavior.

---

# Final QA result

**Build:** v1.7.0-qa.11  
**Foundry:** 13.351  
**Result:** PASS / FAIL / PARTIAL  
**Blocking issues:**  
**Non-blocking issues:**  
**Notes:**
