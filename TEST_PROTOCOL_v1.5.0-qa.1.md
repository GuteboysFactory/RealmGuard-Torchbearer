# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.1

**Build:** v1.5.0-qa.1 — CORE M3 Unified Test Engine foundation  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Approved development baseline:** v1.4.0-qa.8 M2 shadow providers verified  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** M3 `SHADOW_DIAGNOSTIC` — live Test Engine application remains OFF

This first M3 build establishes the pure Test Engine model beneath the existing UI without taking ownership of live rolls. It implements TestRequest, RollPlan, RollTransaction, TestResult, TestContext and TestEngine, with deterministic result calculation and the transaction lifecycle PREPARED → RESERVED → ROLLED → RESOLVED → COMMITTED. Existing Legacy Mixed roll behavior remains authoritative.

## A. Install / preservation

- [ ] A1. Install/update to `1.5.0-qa.1`.
- [ ] A2. World launches without new console-breaking Realm Guard errors.
- [ ] A3. Internal system id remains `realm-guard`.
- [ ] A4. Existing Actors, Items, Scenes, Journals, Compendiums and campaign state remain present.
- [ ] A5. No Actor/Item/world-data migration is introduced by M3 qa.1.

## B. M3 runtime status

Select any Ranger token and run:

```js
console.log("CORE phase:", game.realmGuard?.core?.phase);
console.log("M3 status:", game.realmGuard?.core?.tests?.getStatus?.());
```

Expected:

```text
CORE phase: M3
phase: M3
mode: SHADOW_DIAGNOSTIC
liveApplication: false
conflictIntegration: LEGACY_ADAPTER_UNTIL_M6
```

- [ ] B1. `game.realmGuard.core.phase` = `M3`.
- [ ] B2. Test Engine status phase = `M3`.
- [ ] B3. `mode` = `SHADOW_DIAGNOSTIC`.
- [ ] B4. `liveApplication` = `false`.
- [ ] B5. Supported contexts include ordinary, versus, beginnerLuck, ability, nature, recovery, circles and custom.
- [ ] B6. Transaction states are PREPARED, RESERVED, ROLLED, RESOLVED, COMMITTED.

## C. Default deterministic diagnostic — blocking foundation gate

Run:

```js
const m3 = game.realmGuard.core.tests.runDiagnostic();
console.log(m3);
console.table({
  basePool: { value: m3.plan.basePool },
  finalPool: { value: m3.plan.finalPool },
  rawSuccesses: { value: m3.result.rawSuccesses },
  finalSuccesses: { value: m3.result.finalSuccesses },
  targetSuccesses: { value: m3.result.targetSuccesses },
  outcome: { value: m3.result.outcome },
  margin: { value: m3.result.margin },
  transactionState: { value: m3.transaction.state }
});
```

Expected default diagnostic:

```text
basePool: 4
finalPool: 4
faces: [4,4,1,2]
rawSuccesses: 2
finalSuccesses: 2
targetSuccesses: 2
outcome: PASS
margin: 0
transactionState: RESOLVED
```

- [ ] C1. Final pool = 4D.
- [ ] C2. Raw/final successes = 2.
- [ ] C3. Ob 2 test resolves PASS with margin 0.
- [ ] C4. Diagnostic transaction is RESOLVED and not COMMITTED.
- [ ] C5. Diagnostic changes no Actor/Item/resource/world state.

## D. Versus semantics

Run:

```js
const v = game.realmGuard.core.tests.runDiagnostic({
  context: "versus",
  basePool: 4,
  oppositionSuccesses: 2,
  faces: [4,4,1,2]
});
console.log(v.result);
```

Expected:

```text
finalSuccesses: 2
targetSuccesses: 2
outcome: TIE
margin: 0
```

- [ ] D1. Equal Versus successes resolve as TIE.
- [ ] D2. Margin = 0.

## E. Modifier composition smoke

Run:

```js
const mod = game.realmGuard.core.tests.runDiagnostic({
  basePool: 3,
  extraDice: 1,
  diceModifier: 1,
  successModifier: 1,
  obstacle: 2,
  faces: [4,1,2,3,6]
});
console.log(mod.plan, mod.result);
```

Expected:

```text
finalPool: 5
rawSuccesses: 2
finalSuccesses: 3
outcome: PASS
```

- [ ] E1. Base 3 + Extra 1 + modifier 1 = 5D.
- [ ] E2. Faces yield 2 raw successes.
- [ ] E3. +1 success modifier yields 3 final successes.
- [ ] E4. Ob 2 resolves PASS.

## F. Transaction / cancel safety

Run:

```js
const engine = game.realmGuard.core.tests.engine;
const prepared = engine.prepare({
  id: "live-cancel-smoke",
  context: { type: "ordinary", sourceName: "QA" },
  basePool: 3,
  obstacle: 2
});
console.log("before:", prepared.transaction.snapshot());
prepared.transaction.reserve();
console.log("reserved:", prepared.transaction.snapshot());
prepared.transaction.cancel();
console.log("cancelled:", prepared.transaction.snapshot());
```

Expected after cancel:

```text
state: PREPARED
cancelled: true
faces: []
result: null
```

- [ ] F1. New transaction begins PREPARED.
- [ ] F2. `reserve()` moves it to RESERVED.
- [ ] F3. `cancel()` before Commit returns state to PREPARED and clears transient roll/result data.
- [ ] F4. No Actor/resource mutation occurs.

## G. M2 preservation

Run:

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

- [ ] G1. Effect Engine remains `SHADOW_COMPARE`.
- [ ] G2. Effect Engine liveApplication remains `false`.
- [ ] G3. All six verified M2 providers remain registered exactly once.
- [ ] G4. No qa.8 Token L3 regression is observed.

## H. Live gameplay regression — intentionally short for qa.1

Because M3 qa.1 does not own live rolls, only a representative smoke is required.

- [ ] H1. One normal trained Skill roll still works through the existing UI.
- [ ] H2. Pool/result/chat presentation matches pre-M3 behavior.
- [ ] H3. Fate/Open 6s or Persona can still be selected/used normally if exercised.
- [ ] H4. No Test Engine transaction is shown to have committed live Actor/resource state.

## I. Reload

F5/reload, then run:

```js
console.log(game.realmGuard.core.phase);
console.log(game.realmGuard.core.tests.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

- [ ] I1. CORE phase returns M3 after reload.
- [ ] I2. Test Engine remains SHADOW_DIAGNOSTIC / live OFF.
- [ ] I3. M2 still has six providers with no duplicates.
- [ ] I4. No new Realm Guard console-breaking errors appear.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass v1.5.0-qa.1 when the M3 Test Engine foundation loads deterministically, ordinary/Versus result semantics and transaction cancellation are correct, no live gameplay takeover occurs, M2 remains intact, and representative live roll/reload smoke remains clean.
