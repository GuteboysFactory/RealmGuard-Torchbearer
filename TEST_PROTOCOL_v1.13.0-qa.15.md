# TEST PROTOCOL — v1.13.0-qa.15

## M10D.14 Foundry VTT 13.351 gate — TB2E Might / Precedence bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Might/Precedence coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.15; no boot errors.
- m10d status: phase M10D.14, shadowReadyDomains includes scales, scalesShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- scales.getStatus(): PARTIAL, TB2E_MIGHT_PRECEDENCE_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.
- ranges: Might 1-8, Precedence 0-7; assignmentAuthority=SCALE_REFERENCE_ONLY_DO_NOT_INFER_UNLISTED_ENTITIES.

### Gate B — Might scale / player goal limits
- Might 8 => IMMORTALS.
- Might 3 includes ADVENTURERS and HORSES.
- Capture 3 eligible, Capture 4 not.
- Kill 4 eligible.
- Drive Off 5 eligible, Drive Off 6 not.
- no Might/goal/conflict mutation.

### Gate C — Might action bonus / mounted / post-conflict review
- team Might 5 vs opponent 3, Kill Tie => difference 2, +2s preview.
- same on Fail => +0s.
- Convince passed into Might bonus plan => blocked; not source-authorized.
- mount character 3 / mount 6 unresolved Rider test => effectiveMightPreview=null, test details unavailable.
- same with caller-supplied resolved success => effectiveMightPreview=6, but no Rider roll executed.
- mightChanged=true => reprocessCompromisesAndPossibleGoals=true, GM review only.
- no live success modifier or compromise/goal write.

### Gate D — Precedence scale / eligibility
- Precedence 0 includes Soldiers and Adventurers.
- Precedence 7 => King, Queen.
- Actor 2: Convince target 2 yes, target 3 no.
- Actor 2: Haggle target 3 yes, target 4 no.
- Actor 2: Convince Crowd member target 4 yes, target 5 no.
- Trick/Riddle actor 0 vs target 7 => eligible.
- no conflict/Precedence mutation.

### Gate E — Precedence bonus / zero-write snapshot
- team Precedence 5 vs 2, Convince Crowd Pass => difference 3, +3s preview.
- same family on Fail => +0s.
- Kill passed into Precedence bonus plan => blocked; not source-authorized.
- snapshot Actors/Items/Journals/profile settings around representative calls => unchanged=true.
- all mutation flags false.

### Gate F — Existing profiles / release
- representative MG2E Conflict or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.15 release assets/workflow green.
- QA=1.13.0-qa.15; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Might / Precedence shadow contract. It does not authorize TB2E activation, conflict automation, scale assignment to unlisted entities, live success modifiers, Rider rolls or post-conflict mutations.
