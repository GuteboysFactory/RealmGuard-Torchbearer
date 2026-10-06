# TEST PROTOCOL — v1.13.0-qa.13

## M10D.12 Foundry VTT 13.351 gate — TB2E Session / Phases bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Session coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.13; no boot errors.
- m10d status: phase M10D.12, shadowReadyDomains includes session, sessionShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- session.getStatus(): PARTIAL, TB2E_SESSION_PHASES_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — session start / Grind
- recap reward Recover One Taxed Nature with tax present => one-point preview, no mutation.
- recap reward cannot alleviate Injured/Sick.
- normal test => one turn; split party count 3 => three-turn preview; Instinct => zero turns.
- Spell with no explicit source cost => null turnCostPreview + SPELL_OR_INVOCATION_EFFECT_SOURCE_REQUIRED.
- no turn/Condition/resource writes.

### Gate C — Camp entry / events
- partyChecks 0 => canCamp=false; >=1 => canCamp=true and turnCounterResetPreview=1.
- Survey => one-turn Survivalist preview.
- Dark camp => recovery +1 Ob and Cooking/Forging blocked guidance.
- Watch => +1 camp-event modifier.
- shelter+concealment+watch, one previous disaster, GM penalty, Unsafe => +3 / -4 / net -1.
- eventResultAuthority=CAMP_EVENT_TABLE_NOT_SUPPLIED_DO_NOT_RESOLVE; no event roll.

### Gate D — Camp Checks / watch
- Research with 2 Checks => cost 1, affordable.
- Help => cost 0; Instinct => cost 0.
- Fight/Explore blocked in Camp.
- same character second consecutive test blocked.
- Memorize/Purify second use in same Camp blocked.
- Watch blocks Recovery, Memorize Spell, Purify Immortal Burden; other checks allowed.
- no Check spend/transfer mutation.

### Gate E — Town / Lifestyle / end-session / zero writes
- Town entry with remaining Checks => Recovery use; leftover food => spoilage preview; Town event required; level delegation.
- Town event modifier plan returns numeric modifier only and does not resolve event table.
- Lifestyle cost 0 => Resources Ob preview 1 via M10D.7 boundary.
- Respite on Lifestyle 3 => adjusted 4 / Ob4.
- End-session => Fate/Persona timing END_OF_SESSION; award authority M10D.7.
- Torch on ground => 2 turns, 2 bright + 2 dim people, ground mode DIM.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E Turn/Check or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.13 release assets/workflow green.
- QA=1.13.0-qa.13; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Session / Phases shadow contract. It does not authorize TB2E activation, phase/turn/check mutation, food spoilage, event-table automation, recovery/level execution or reward writes.
