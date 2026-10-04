# TEST PROTOCOL — v1.13.0-qa.7

## M10D.6 Foundry VTT 13.351 gate — TB2E Abilities / Skills bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Abilities coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.7; no boot errors.
- m10d status: phase M10D.6, shadowReadyDomains=["wises","help","tests","nature","abilities"], abilitiesShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- abilities.getStatus(): PARTIAL, TB2E_ABILITIES_SKILLS_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — Ability / Skill model
- Will/Health are RAW Adventure abilities, rating 1-6.
- Resources/Circles are Town abilities, max 10; 0 is represented only as their special zero state.
- Precedence/Might are FIXED_VALUE references.
- Skill max-known count=24, Skill rating 1-6.
- supplied Skill list contains 33 names.
- full Skill descriptions/Obstacle factors report UNAVAILABLE_DG160.

### Gate C — Beginner's Luck mapping
- Scout => WILL.
- Fighter => HEALTH.
- every supplied Skill maps to exactly one of Will/Health.
- unknown/unsourced Skill rejects.
- supplied ability rating 0 rejects; no live roll is attempted.

### Gate D — New Skill learning
- Scout with 3 BL attempts and Maximum Nature 5 => required=5, remaining=2, ready=false.
- Scout with 5 attempts and Maximum Nature 5 => ready=true, learnedRating=2.
- Maximum Nature 0 rejects as the retired-state boundary.
- no Skill Item is created and no learning state is written.

### Gate E — Advancement thresholds / zero writes
- Skill 4 => 4 passes / 3 fails / advanceTo 5.
- Health 6 => cap / no advanceTo.
- Resources 0 => ZERO_TO_ONE_SPECIAL, BL forbidden, one passed test reference with allowed reputation/hometown/cash/loot/treasure sources.
- Circles 3 => 3 passes / 2 fails / cap 10.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E Skill/Ability roll and Recruitment/Create Ranger remain normal.
- qa.7 release assets/workflow green.
- QA=1.13.0-qa.7; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Abilities/Skills shadow contract. It does not authorize TB2E activation, Skill provisioning, learning or advancement mutation.
