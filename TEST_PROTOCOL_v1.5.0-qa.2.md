# TEST PROTOCOL — Realm Guard / Torchbearer v1.5.0-qa.2

**Build:** v1.5.0-qa.2 — CORE M3 first real Legacy Mixed ↔ CORE Test Engine shadow parity  
**Foundry target:** 13.351  
**GOLD baseline:** v1.3.0  
**Approved development baseline:** v1.5.0-qa.1 PASS / M3 foundation VERIFIED  
**Internal system id:** `realm-guard`  
**Gameplay change:** NONE INTENDED  
**Mode:** M3 `SHADOW_PARITY` — Legacy Mixed remains authoritative; live Test Engine application remains OFF

This build installs the first real-roll parity bridge. Supported Legacy Mixed test methods continue to run exactly through the existing live code. After the Legacy result is complete, the observer captures the actual resolved dice/pool/target/success data, replays that same data through the pure CORE Test Engine, and compares five blocking parity fields:

```text
pool · target · successes · outcome · margin
```

The parity layer is diagnostic only. It does not roll the live dice, spend resources, write chat, advance characters or mutate Actor/world state.

## A. Install / preservation

- [ ] A1. Install/update to `1.5.0-qa.2`.
- [ ] A2. World launches without new console-breaking Realm Guard errors.
- [ ] A3. Internal system id remains `realm-guard`.
- [ ] A4. Existing Actors, Items, Scenes, Journals, Compendiums and campaign state remain present.
- [ ] A5. No Actor/Item/world-data migration is introduced by M3 qa.2.
- [ ] A6. Existing roll dialogs, chat cards and Legacy Mixed gameplay behavior remain visually/operationally unchanged.

## B. M3 runtime / parity status

Run:

```js
console.log("Version:", game.system.version);
console.log("Test Engine:", game.realmGuard.core.tests.getStatus());
console.log("Parity:", game.realmGuard.core.testParity.getStatus());
```

Expected essentials:

```text
Version: 1.5.0-qa.2
Test Engine mode: SHADOW_PARITY
Test Engine liveApplication: false
Parity phase: M3
Parity mode: SHADOW_PARITY
Parity liveApplication: false
Parity authority: LEGACY_MIXED
Parity persistence: CLIENT_MEMORY_ONLY
```

Expected comparison fields:

```text
pool, target, successes, outcome, margin
```

Expected instrumented live methods:

```text
rollRole
rollAbility
rollAutomaticVersus
rollNatureVersus
```

- [ ] B1. CORE phase remains `M3`.
- [ ] B2. Test Engine mode = `SHADOW_PARITY`.
- [ ] B3. Test Engine liveApplication = `false`.
- [ ] B4. Parity mode = `SHADOW_PARITY`.
- [ ] B5. Parity authority = `LEGACY_MIXED`.
- [ ] B6. All five comparison fields are present.
- [ ] B7. All four initial live methods are listed as instrumented.

## C. Reset the parity observer before live QA

Run:

```js
game.realmGuard.core.testParity.clear();
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected:

```text
observed: 0
compared: 0
matches: 0
mismatches: 0
skipped: 0
errors: 0
latest: null
```

- [ ] C1. Parity history clears without touching Actor/world state.

## D. Real ordinary Skill test — PASS parity

Use a normal trained Skill from the existing Ranger sheet/roll dialog.

For the cleanest blocking test:
- use a normal Obstacle test
- do not spend Fate if a 6 appears
- avoid a deliberate secondary/edge-case workflow for this first roll

After the roll resolves normally in chat, run:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.table({
  pool:      { legacy: p?.comparison?.legacy?.pool,      core: p?.comparison?.core?.pool,      match: p?.comparison?.parity?.fields?.pool },
  target:    { legacy: p?.comparison?.legacy?.target,    core: p?.comparison?.core?.target,    match: p?.comparison?.parity?.fields?.target },
  successes: { legacy: p?.comparison?.legacy?.successes, core: p?.comparison?.core?.successes, match: p?.comparison?.parity?.fields?.successes },
  outcome:   { legacy: p?.comparison?.legacy?.outcome,   core: p?.comparison?.core?.outcome,   match: p?.comparison?.parity?.fields?.outcome },
  margin:    { legacy: p?.comparison?.legacy?.margin,    core: p?.comparison?.core?.margin,    match: p?.comparison?.parity?.fields?.margin }
});
```

Expected:

```text
status: MATCH
method: rollRole
comparison.context: ordinary
all five match fields: true
comparison.parity.all: true
```

- [ ] D1. The Legacy roll itself resolves exactly once through the normal UI/chat path.
- [ ] D2. One parity observation is added.
- [ ] D3. Status = `MATCH`.
- [ ] D4. Pool matches.
- [ ] D5. Target/Obstacle matches.
- [ ] D6. Final successes match.
- [ ] D7. Outcome matches.
- [ ] D8. Margin matches.

## E. Real ordinary Skill test — FAIL / positive margin gate

Run a second ordinary trained Skill test against an Obstacle high enough to produce a normal failure. Do not spend Fate.

Then:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log("Status:", p?.status);
console.log("Legacy:", p?.comparison?.legacy);
console.log("CORE:", p?.comparison?.core);
console.log("Fields:", p?.comparison?.parity?.fields);
```

Expected on a failure:

```text
status: MATCH
legacy.outcome: FAIL
core.outcome: FAIL
legacy.margin === core.margin
legacy.margin >= 0
core.margin >= 0
```

This is a blocking qa.2 gate because the qa.1 foundation stored a signed failure delta internally while Legacy Mixed exposes an absolute Margin of Failure. qa.2 aligns CORE TestResult margin with the Legacy/public result semantics while retaining the signed delta only as provenance.

- [ ] E1. Failure parity status = `MATCH`.
- [ ] E2. Both margins are non-negative.
- [ ] E3. Both margins are numerically identical.
- [ ] E4. No Legacy gameplay behavior changed because of the CORE margin correction.

## F. Real Ability test parity

Run one ordinary **Will** or **Health** test through the existing UI. Do not spend Fate.

Then:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
```

Expected:

```text
status: MATCH
method: rollAbility
context: ordinary
all five parity fields: true
```

- [ ] F1. Ability roll remains normal Legacy Mixed gameplay.
- [ ] F2. Parity status = `MATCH`.
- [ ] F3. All five fields match.

## G. Real Automatic Versus parity — non-tie blocking gate

Run one existing **Automatic Versus** Skill test against an NPC/opponent.

For this blocking case:
- use a result that does **not** end in an initial tie requiring the secondary Versus tie-resolution workflow
- do not spend Fate/Open 6s

Then:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log(p);
console.table({
  pool:      { legacy: p?.comparison?.legacy?.pool,      core: p?.comparison?.core?.pool,      match: p?.comparison?.parity?.fields?.pool },
  target:    { legacy: p?.comparison?.legacy?.target,    core: p?.comparison?.core?.target,    match: p?.comparison?.parity?.fields?.target },
  successes: { legacy: p?.comparison?.legacy?.successes, core: p?.comparison?.core?.successes, match: p?.comparison?.parity?.fields?.successes },
  outcome:   { legacy: p?.comparison?.legacy?.outcome,   core: p?.comparison?.core?.outcome,   match: p?.comparison?.parity?.fields?.outcome },
  margin:    { legacy: p?.comparison?.legacy?.margin,    core: p?.comparison?.core?.margin,    match: p?.comparison?.parity?.fields?.margin }
});
```

Expected:

```text
status: MATCH
method: rollAutomaticVersus
comparison.context: versus
comparison.legacy.target === opponent successes
all five match fields: true
```

- [ ] G1. Legacy Automatic Versus resolves exactly once.
- [ ] G2. CORE receives the same actual resolved own-side test data.
- [ ] G3. Opponent successes become CORE target successes.
- [ ] G4. Outcome parity matches PASS/FAIL semantics.
- [ ] G5. Margin matches.

If the random roll ties and you choose a secondary tie-resolution option, that case is deliberately outside this qa.2 slice and should be recorded as `SKIPPED`; simply rerun for a non-tie blocking test.

## H. Optional Nature Versus parity

If convenient, run one Nature Versus test without Fate/Open 6s.

Expected:

```text
method: rollNatureVersus
context: versus
status: MATCH
all five fields: true
```

- [ ] H1. Nature Versus parity matches if exercised.

This is useful coverage but not required to pass qa.2 if D/E/F/G are clean.

## I. Deliberate skip safety — no false takeover

Two cases are intentionally not replayed yet:

```text
FATE_OPEN_SIX_NOT_YET_MODELED_IN_PARITY
VERSUS_TIEBREAK_NOT_YET_MODELED_IN_PARITY
```

If practical, reproduce either case:

1. Spend Fate on Open 6s in a supported live roll, **or**
2. Resolve an Automatic Versus tie through the secondary tiebreak workflow.

Then:

```js
console.log(game.realmGuard.core.testParity.getLatest());
```

Expected:

```text
status: SKIPPED
reason: one of the documented reasons above
```

Most important: the real Legacy Mixed roll must still complete normally.

- [ ] I1. A documented unsupported case is skipped rather than falsely reported as parity.
- [ ] I2. Skip does not cancel, reroll, duplicate or alter the Legacy test.

This section is non-blocking if the random state is inconvenient to reproduce.

## J. Success-modifier bridge observation

qa.2 intentionally sits **after** Legacy Mixed has already applied its current effects/rerolls. If final Legacy successes differ from successes visible on the final resolved dice (for example a legal `+1s`), the parity adapter carries that difference into CORE as a `successModifier` so CORE can still resolve the same final test semantics.

This is a bridge, not live Effect Engine ownership.

Inspect any parity record:

```js
const p = game.realmGuard.core.testParity.getLatest();
console.log("Legacy raw:", p?.comparison?.legacy?.rawSuccesses);
console.log("Legacy final:", p?.comparison?.legacy?.successes);
console.log("Bridged +s/-s:", p?.comparison?.legacy?.successModifier);
console.log("CORE +s/-s:", p?.comparison?.core?.successModifier);
```

- [ ] J1. If a success modifier is present, Legacy and CORE final successes still match.
- [ ] J2. No M2 provider has been switched to live application.

## K. M2 preservation

Run:

```js
console.log(game.realmGuard.core.effects.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

- [ ] K1. Effect Engine remains `SHADOW_COMPARE`.
- [ ] K2. Effect Engine liveApplication remains `false`.
- [ ] K3. All six verified M2 providers remain registered exactly once.
- [ ] K4. Token L3 qa.8 behavior remains intact.

## L. Observer isolation / gameplay regression

- [ ] L1. Parity creates no extra ChatMessage.
- [ ] L2. Parity spends no Fate/Persona/Checks and consumes no Trait/Wise/Token/Talent state itself.
- [ ] L3. Existing advancement still comes only from the Legacy gameplay path.
- [ ] L4. Existing roll/chat presentation is unchanged.
- [ ] L5. A parity mismatch/error, if one occurs, is diagnostic only and must not break the live Legacy roll.

## M. Summary inspection

Run:

```js
console.log(game.realmGuard.core.testParity.getSummary());
console.table(game.realmGuard.core.testParity.getHistory().map(entry => ({
  status: entry.status,
  method: entry.method,
  reason: entry.reason ?? "",
  pool: entry.comparison?.parity?.fields?.pool ?? "",
  target: entry.comparison?.parity?.fields?.target ?? "",
  successes: entry.comparison?.parity?.fields?.successes ?? "",
  outcome: entry.comparison?.parity?.fields?.outcome ?? "",
  margin: entry.comparison?.parity?.fields?.margin ?? ""
})));
```

Blocking expectation after D/E/F/G:

```text
mismatches: 0
errors: 0
matches: at least 4
```

Documented `SKIPPED` cases are not parity failures.

- [ ] M1. No unexpected mismatch.
- [ ] M2. No observer error.
- [ ] M3. Required ordinary/ability/versus observations are present.

## N. Reload / duplicate-wrapper gate

Parity history is deliberately client-memory diagnostics and may reset on F5/reload. This build does not persist diagnostic history into the world.

F5/reload, then run:

```js
console.log(game.realmGuard.core.phase);
console.log(game.realmGuard.core.tests.getStatus());
console.log(game.realmGuard.core.testParity.getStatus());
console.log(game.realmGuard.core.effects.engine.listProviders().map(p => p.id));
```

Then clear parity, make **one** supported ordinary Skill roll, and inspect:

```js
game.realmGuard.core.testParity.clear();
// make exactly one ordinary Skill roll through the UI
console.log(game.realmGuard.core.testParity.getSummary());
```

Expected after that single roll:

```text
observed: 1
compared: 1
matches: 1
mismatches: 0
errors: 0
```

- [ ] N1. M3 Test Engine returns as `SHADOW_PARITY` / live OFF.
- [ ] N2. Test parity observer returns as `SHADOW_PARITY` / Legacy authority.
- [ ] N3. M2 still has six providers with no duplicates.
- [ ] N4. One supported live roll creates exactly one parity entry after reload.
- [ ] N5. No new Realm Guard console-breaking errors appear.

## QA decision

**Blocking failures:**  

**Non-blocking observations:**  

**Final verdict:** PASS / FAIL

### PASS gate

Pass `v1.5.0-qa.2` when:

1. a real ordinary Skill PASS test matches on pool/target/successes/outcome/margin,
2. a real ordinary Skill FAIL test matches and both margins are the same non-negative Margin of Failure,
3. a real ordinary Ability test matches on all five fields,
4. a real non-tie Automatic Versus test matches on all five fields,
5. there are no unexpected parity mismatches or observer errors,
6. the parity layer creates no live gameplay side effects,
7. M2 remains shadow-only with six providers,
8. reload installs exactly one parity observer path per live roll.

Documented qa.2 skips for Fate/Open-6 additive dice and resolved secondary Versus tiebreaks do **not** fail the build; those are explicitly staged for later M3 parity coverage.
