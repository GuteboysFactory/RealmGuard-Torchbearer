# TEST PROTOCOL — v1.13.0-qa.2

## M10D.2 Foundry VTT 13.351 gate — TB2E Wises read-only shadow adapter

Use a QA world. Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY and cannot be activated. Stable remains v1.12.0.

### Gate A — Boot / M10D status

- Install qa.2 and reload without boot errors. System version is 1.13.0-qa.2.
- `game.realmGuard.core.m10d.getStatus()` reports phase M10D.2, foundationReady=true, liveReady=false, activationAvailable=false, wiseShadowReady=true, shadowReadyDomains=["wises"] and all writes=0.
- `game.realmGuard.core.m10d.wises.getStatus()` reports VERIFIED source classification, TB2E_WISES_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false and writes=0.
- Rules / Creation Profile remain torchbearer2e v1 and FOUNDATION_ONLY. Generic TB2E activation remains rejected.

### Gate B — Wise model / source boundary

- `game.realmGuard.core.m10d.wises.model()` reports ratingMode=NONE, maxWises=4, Respite acquisition/cycle timing, stock-or-creature language guidance and three effects: I_AM_WISE / DEEPER_UNDERSTANDING / OF_COURSE.
- Existing rated Wise Items are not rewritten or interpreted as live TB2E ratings.
- No MG1E/MG2E/Realm Guard rule is imported to fill a TB2E source gap.

### Gate C — I Am Wise shadow plan

- `aidPlan({hasWise:true, related:true})` returns +1D, replaces Skill Help, no helper Condition risk, twist risk retained, no resource cost and liveApplication=false.
- Instinct remains allowed. Conflict context reports non-combatant-to-combatant support guidance.
- Missing Wise or unrelated Wise returns a rejected plan without writes.
- The plan never inserts Help, changes dice pools or marks Wise-cycle state live.

### Gate D — Paid rerolls / ordering

- Deeper Understanding with failed dice and Fate available returns FATE x1, ONE_FAILED_DIE, maximum 1 eligible failed die and excludes already-rerolled failed dice.
- If every failed die is already rerolled, the plan rejects with NO_ELIGIBLE_FAILED_DIE. Missing Fate rejects with INSUFFICIENT_FATE.
- Of Course with failed dice and Persona available returns PERSONA x1, ALL_FAILED_DICE and the exact failed-dice count.
- Of Course states that it must precede Deeper Understanding when both are intended. Missing Persona/no failed dice rejects safely.
- No plan actually spends Fate/Persona and no die is rerolled by the shadow adapter.

### Gate E — Wise cycle guidance / zero writes

- `cyclePlan()` requires I_AM_WISE_PASS, I_AM_WISE_FAIL, DEEPER_UNDERSTANDING and OF_COURSE.
- A complete shadow cycle exposes: change Wise, Beginner's Luck test toward a new Skill, or mark a related Skill advancement test.
- Cycle guidance is read-only: no Wise creation/replacement, advancement mark, Actor flag or Item mutation occurs.
- Snapshot representative Actors/Items/Journals/settings before and after representative calls; all data remains unchanged.

### Gate F — Existing profiles / release channels

- Representative Legacy Mixed / Strict RG / MG1E / MG2E roll/creation behavior remains unchanged.
- qa.2 prerelease contains realm-guard.zip and system.json; syntax/smoke/package verification is green.
- QA = 1.13.0-qa.2. Stable = 1.12.0 and remains unchanged.

Report Gate A-F PASS/FAIL. Passing this protocol verifies M10D.2 Wises shadow parity only; it does not authorize TB2E activation or any live Wise automation.
