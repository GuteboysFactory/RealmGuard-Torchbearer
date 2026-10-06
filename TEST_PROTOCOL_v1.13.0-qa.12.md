# TEST PROTOCOL — v1.13.0-qa.12

## M10D.11 Foundry VTT 13.351 gate — TB2E Advancement bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Advancement coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.12; no boot errors.
- m10d status: phase M10D.11, shadowReadyDomains includes advancement, advancementShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- advancement.getStatus(): PARTIAL, TB2E_ADVANCEMENT_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — Threshold formula / caps
- Skill 4 with 4 pass / 3 fail => ready=true, advanceTo=5.
- Health 6 => atCap=true and no advance.
- Resources 0 with one pass => ZERO_TO_ONE_SPECIAL, ready=true, advanceTo=1, Beginner's Luck false.
- Circles 3 with 3 pass / 2 fail => ready=true, advanceTo=4, cap=10.
- no rating/mark writes.

### Gate C — Mark eligibility / group result
- PASS Ob0 non-Versus => count=false, OBSTACLE_ZERO_DOES_NOT_COUNT.
- combat Versus with Ob0 => count=true.
- unbroken TIE => count=false.
- broken TIE resolved FAIL => mark FAIL.
- second caller-declared counted test in Camp => count=false, CONTEXT_COUNT_LIMIT_REACHED.
- mixed group 2 pass / 1 fail + choice FAIL => chosenMark=FAIL.
- no mark writes.

### Gate D — Nature / new Skill / Resources-Circles 0-to-1
- Nature current3/max4 with 4 pass/3 fail => current4/max5, tax remains 1, zero-write.
- BL attempts5 with max Nature5 => ready=true, learnedRating=2, erase-learning-marks preview.
- Circles 0-to-1 + one pass + Reputation/Cash => ready=true, advanceTo=1.
- Resources 0-to-1 + one pass but no allowed source => ready=false.
- no Skill creation or rating mutation.

### Gate E — reset / level boundary / zero writes
- reset reason ADVANCEMENT and RATING_LOSS => erasePassedTests/eraseFailedTests true previews only.
- level boundary => max 10, cumulative spent Fate/Persona, Town-only, two irreversible benefit options after level 1.
- exactNextThreshold=null and eligibleForExactLevelUp=null because visual numeric level table is not transcribed.
- class benefit authority DG113_PLUS_UNAVAILABLE.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E advancement or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.12 release assets/workflow green.
- QA=1.13.0-qa.12; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Advancement shadow contract. It does not authorize TB2E activation, mark/rating writes, Skill creation, Nature mutation or level execution.
