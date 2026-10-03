# TEST PROTOCOL — v1.12.0-qa.18

## M10C.7 — MG2E Controlled Live Parity Execution

Target: Foundry VTT 13.351

M10C.7 executes four explicit QA-only MG2E handoffs. MG2E activation must remain OFF throughout the protocol.

### Gate A — Boot / release

Verify:

- installed version = 1.12.0-qa.18
- no startup exceptions
- `game.realmGuard.core.m10.mg2e.liveParityStatus` exists
- `game.realmGuard.core.m10.mg2e.liveParityMatrix` exists
- `game.realmGuard.core.m10.mg2e.runControlledHandoff` exists
- `game.realmGuard.core.m10.mg2e.resetControlledParity` exists

### Gate B — Initial controlled execution status

Run:

`game.realmGuard.core.m10.mg2e.resetControlledParity()`

Expected:

- phase = M10C.7
- mode = MG2E_CONTROLLED_LIVE_PARITY_EXECUTION
- profileVersion = 3
- controlledExecutionReady = true
- controlledExecutionOnly = true
- liveParityVerified = false
- activationAuthorized = false
- activationAvailable = false
- foundationOnly = true
- selectable = false
- supported = false
- liveRuleAuthority = false
- domainCount = 4
- executedDomainCount = 0
- passedDomainCount = 0
- pendingDomains = WISE_EFFECTS / HELP / INVENTORY_GEAR / CONFLICT
- writes = 0 / 0 / 0 / 0

### Gate C — Wise Effects controlled handoff

Run:

`game.realmGuard.core.m10.mg2e.runControlledHandoff("WISE_EFFECTS", {effect:"Deeper Understanding", failedDice:3})`

Expected:

- executed = true
- ok = true
- provider = M10C3_MG2E_WISE_ADAPTER
- Fate cost verified
- one failed die maximum verified
- route = MG2E_2015_WISE_EFFECT
- Legacy unrated-Wise auto-reroll authorized = false

### Gate D — Help controlled handoff

Run:

`game.realmGuard.core.m10.mg2e.runControlledHandoff("HELP", {sourceKind:"skill"})`

Expected:

- executed = true
- ok = true
- Teamwork accepted = true
- Teamwork = +1D
- I Am Wise accepted = true
- routes are distinct
- same-test Help + I Am Wise double use blocked
- I Am Wise replaces Help for that contribution

### Gate E — Inventory / Gear controlled handoff

Run:

`game.realmGuard.core.m10.mg2e.runControlledHandoff("INVENTORY_GEAR")`

Expected:

- executed = true
- ok = true
- inventory policy = LOOSE
- carry guidance accepted
- relevant Gear eligible
- relevant Gear = +1D
- GM approval required
- MG1E weapon catalog authorized = false

### Gate F — Conflict controlled handoff

Run:

`game.realmGuard.core.m10.mg2e.runControlledHandoff("CONFLICT", {weapon:"Axe", armor:"Light Armor"})`

Expected:

- executed = true
- ok = true
- Fight Defend skills = Nature
- Fight disposition skills = Fighter
- Fight disposition bases = Health / Nature
- weapon adapter accepted
- armor adapter accepted
- route = MG2E_2015_WEAPON_ARMOR_ADAPTERS
- MG1E weapon catalog authorized = false

### Gate G — Four-domain parity closure

Run:

`game.realmGuard.core.m10.mg2e.liveParityStatus()`

Expected:

- liveParityVerified = true
- executedDomainCount = 4
- passedDomainCount = 4
- pendingDomains = []
- failedDomains = []
- activationAuthorized = false
- activationAvailable = false
- nextStep = M10C.8 MG2E Explicit Activation Milestone

Also run:

`console.table(game.realmGuard.core.m10.mg2e.liveParityMatrix())`

Every domain must be `EXECUTED_PASS`.

### Gate H — Readiness audit transition

Run:

`game.realmGuard.core.m10.mg2e.readinessAudit()`

Expected:

- phase = M10C.7
- technicalReadinessComplete = true
- technicalBlockers = []
- FULL_RECRUITMENT_COMMIT_ADAPTER = CLOSED
- DEDICATED_LIVE_RULES_REFERENCE = CLOSED
- LIVE_PARITY_QA = CLOSED
- EXPLICIT_ACTIVATION_MILESTONE = DEFERRED
- openBlockers = [EXPLICIT_ACTIVATION_MILESTONE]
- decision = NOT_READY_EXPLICIT_ACTIVATION_MILESTONE_REMAINS
- nextStep = M10C.8 MG2E Explicit Activation Milestone

### Gate I — Activation isolation

Verify:

- `game.realmGuard.switchToMg2e` does not exist
- `game.realmGuard.core.m10.switchProfile("mg2e")` rejects
- active Rules Profile remains unchanged
- MG2E remains foundation-only / non-selectable / unsupported / non-live

### Gate J — Zero-write / reload behavior

Before reload, note the active profile and representative Actor state.

Reload the world.

Expected:

- active profile unchanged
- no Actor / Item / Journal / setting mutation caused by M10C.7
- controlled parity evidence resets to 0/4 executed after reload
- reset is expected because the evidence is intentionally runtime-only
- static MG2E profile metadata still reports `liveParityVerified:false`

### Gate K — Existing-profile regression

Representative Legacy Mixed / Strict / MG1E behavior remains green.

Verify at minimum:

- normal roll
- Wises
- Help
- Inventory/Gear
- Conflict opening / ordinary action path
- profile switching for already supported profiles remains unchanged

### Gate L — Release / channels

Verify:

- release/tag 1.12.0-qa.18 exists
- realm-guard.zip published
- release system.json published
- QA channel = 1.12.0-qa.18
- Stable channel remains 1.11.0

## Closure

After Gates A-L PASS:

**M10C.7 — FULL PASS / VERIFIED / CLOSED**

Next bounded slice:

**M10C.8 — MG2E Explicit Activation Milestone**
