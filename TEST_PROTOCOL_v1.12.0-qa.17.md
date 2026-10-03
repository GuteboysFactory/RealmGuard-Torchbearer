# TEST PROTOCOL — v1.12.0-qa.17

## M10C.6 — MG2E Live Parity QA Foundation

Target: Foundry VTT 13.351

M10C.6 is a zero-write parity-foundation milestone. MG2E activation must remain OFF for the entire protocol.

### Gate A — Boot / release

- update/install v1.12.0-qa.17
- no startup errors
- `game.realmGuard.core.m10.mg2e.liveParityStatus` exists
- `game.realmGuard.core.m10.mg2e.liveParityMatrix` exists

### Gate B — Foundation overview

`game.realmGuard.core.m10.mg2e.liveParityStatus()` must report:

- phase = M10C.6
- mode = MG2E_LIVE_PARITY_QA_FOUNDATION
- profileVersion = 3
- foundationReady = true
- liveParityVerified = false
- controlledExecutionRequired = true
- activationAuthorized = false
- domainCount = 13
- readyDomainCount = 13
- mismatchDomains = []
- writes = 0 / 0 / 0 / 0
- nextStep = M10C.7 MG2E Controlled Live Parity Execution

### Gate C — Activation isolation

MG2E remains:

- FOUNDATION_ONLY
- selectable false
- supported false
- liveRuleAuthority false
- activationAvailable false
- no `switchToMg2e`
- generic `switchProfile("mg2e")` rejected
- active profile unchanged

### Gate D — Session / Circles / Progression edition routing

Resolved MG2E M10B.6 policy must report:

- familySemantics true
- session mode MG2E
- circles mode MG2E
- Session source MG2E_2015
- Advancement source MG2E_2015
- Beginner's Luck source MG2E_2015
- Circles source MG2E_2015

Legacy and MG1E source labels must remain unchanged.

### Gate E — 13-domain matrix

Every matrix row must have `foundationReady:true`.

Expected IDs:

- TESTS
- ADVANCEMENT_BEGINNERS_LUCK
- TRAITS
- WISE_EFFECTS
- HELP
- NATURE
- CONDITIONS_RECOVERY
- INVENTORY_GEAR
- CONFLICT
- SESSION_CIRCLES_PROGRESSION
- NATURAL_ORDER
- CHARACTER_CREATION
- RULES_REFERENCE

### Gate F — Controlled Wise / Help handoffs

Matrix state must be `CANDIDATE_HANDOFF_READY` for:

- WISE_EFFECTS
- HELP

Verify candidate contracts:

- MG2E Wises unrated
- Deeper Understanding = Fate + reroll one failed die
- I Am Wise remains distinct from normal Help
- no Legacy unrated-Wise auto-reroll is authorized by M10C.6

### Gate G — Controlled Gear / Conflict handoffs

Matrix state must be `CANDIDATE_HANDOFF_READY` for:

- INVENTORY_GEAR
- CONFLICT

Verify:

- inventory policy LOOSE
- relevant Gear = +1D with GM approval
- MG2E 2015 weapon/armor adapters are candidate providers
- Fight Defend = Nature
- Fight starting disposition = Fighter + Health/Nature
- no routing through the MG1E weapon catalog is authorized

### Gate H — Nature / Recovery / Natural Order

Verify representative contracts:

- Nature (Mouse) descriptors Escaping / Climbing / Hiding / Foraging
- Tap Nature and Double-Tap available where legal
- Sick failed recovery -> Healer Ob4
- MG2E Natural Order Mouse = rank 3
- Fox = rank 6
- no species-to-rank Actor write

### Gate I — Creation / Rules Reference regression

- MG2E CORE M9 Creation remains READY_WHEN_ACTIVE
- liveCommit false
- Rules Reference remains READ_ONLY_PROFILE_REFERENCE
- Character Creation and Natural Order pages remain present
- zero Actor / Item / Journal / settings writes

### Gate J — Readiness audit transition

`game.realmGuard.core.m10.mg2e.readinessAudit()` must report:

- technicalReadinessComplete true
- technicalBlockers []
- FULL_RECRUITMENT_COMMIT_ADAPTER CLOSED
- DEDICATED_LIVE_RULES_REFERENCE CLOSED
- LIVE_PARITY_QA FOUNDATION_READY_NOT_RUN
- EXPLICIT_ACTIVATION_MILESTONE DEFERRED
- decision = NOT_READY_CONTROLLED_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN
- nextStep = M10C.7 MG2E Controlled Live Parity Execution

### Gate K — Existing-profile regression / data safety

Representative Legacy Mixed / Strict / MG1E behavior remains green.

M10C.6 must not mutate:

- Actors
- Items
- Journals
- Wises
- Conditions
- inventory metadata
- Creation provenance
- Natural Order ranks
- active Rules Profile settings

### Gate L — Release / channels

- tag/release v1.12.0-qa.17 exists
- realm-guard.zip published
- release system.json published
- QA channel = v1.12.0-qa.17
- Stable channel remains v1.11.0

## Closure

After Gates A-L PASS:

**M10C.6 — FULL PASS / VERIFIED / CLOSED**

Next bounded slice: **M10C.7 — MG2E Controlled Live Parity Execution**.
