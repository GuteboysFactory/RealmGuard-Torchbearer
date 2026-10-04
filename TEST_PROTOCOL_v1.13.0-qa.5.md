# TEST PROTOCOL — v1.13.0-qa.5

## M10D.4 Foundry VTT 13.351 gate — TB2E Tests / Dice bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Tests coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.5; no boot errors.
- m10d status: phase M10D.4, shadowReadyDomains=["wises","help","tests"], testShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- tests.getStatus(): PARTIAL, TB2E_TESTS_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — Dice model / pool / Obstacle
- model success threshold = 4 on d6; success faces 4/5/6.
- +D/-D changes planned pool; pool never drops below 0.
- +s/-s is represented as successModifier.
- supplied dice [1,4,5,6] vs Ob 3 => 3 successes, PASS, margin 0.
- supplied dice [1,2,4] +1s vs Ob 3 => 2 final successes, FAIL, margin 1.
- Ob is caller supplied; no DG160 factor automation.
- invalid d6 values reject safely.

### Gate C — Versus / tie boundary
- three successes vs two => PASS, margin 1.
- fewer successes => FAIL with correct margin.
- equal successes => TIE.
- TIE reports tieResolutionRequired=true and tieResolutionAutomation=false.
- no MG1E/MG2E tie procedure is imported into TB2E.

### Gate D — Fate / Luck open sixes
- [2,6,6] with Fate available => Luck plan costs 1 Fate, initialExtraDice=2, recursiveOpenSixes=true.
- no sixes => NO_SIXES.
- no Fate => INSUFFICIENT_FATE.
- no resource is actually spent and no random follow-up die is rolled.

### Gate E — Beginner's Luck / zero writes
- pre-halving sources: Ability, Wises, Help, Supplies, Gear.
- halve and round up.
- post-halving sources: Traits, Persona, Channeled Nature, Fresh, other bonuses.
- Ability 0 due to Injury/Sickness blocks the plan.
- missing-tools penalty remains MANUAL_SOURCE_BOUNDARY.
- representative calls leave Actors/Items/Journals/settings unchanged.

### Gate F — Existing profiles / release
- representative MG2E roll and Recruitment/Create Ranger remain normal.
- qa.5 release assets/workflow green.
- QA=1.13.0-qa.5; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Tests/Dice shadow contract. It does not authorize TB2E activation or live test resolution.
