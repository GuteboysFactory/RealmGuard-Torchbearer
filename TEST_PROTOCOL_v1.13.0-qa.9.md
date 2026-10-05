# TEST PROTOCOL — v1.13.0-qa.9

## M10D.8 Foundry VTT 13.351 gate — TB2E Conditions bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Conditions coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.9; no boot errors.
- m10d status: phase M10D.8, shadowReadyDomains=["wises","help","tests","nature","abilities","resources","conditions"], conditionsShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- conditions.getStatus(): PARTIAL, TB2E_CONDITIONS_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.
- unresolvedSourceConflicts contains CONFLICT_DISPOSITION_PENALTY_QR41_44_VS_QR51.

### Gate B — Model / order / explicit boundaries
- Grind order: Fresh -> Hungry/Thirsty -> Exhausted -> Angry -> Sick -> Injured -> Afraid -> Dead; new condition every 4 turns.
- Recovery order is separate: Hungry/Thirsty -> Angry -> Afraid -> Exhausted -> Injured/Sick.
- Dead details authority is SOURCE_INCOMPLETE_ORDER_PLACEMENT_ONLY.
- Exhausted recovery source text remains CAMP_TEST with phaseResolved=false.
- conflictDispositionBoundary is UNRESOLVED_SOURCE_CONFLICT and automation=false.

### Gate C — Fresh / Angry / Afraid
- Fresh Skill => +1D; Fresh Resources => +0D.
- Angry blocks beneficial Trait and beneficial Wise effects.
- precision/social Angry plan outside recovery exposes +1 Ob as GM_DISCRETION guidance only; no automatic Ob modifier.
- Angry recovery has no +1 Ob guidance.
- Afraid blocks Help and Beginner's Luck while exposing Nature fallback for unlearned Skills.
- no live effect mutation.

### Gate D — Injured / Sick / Exhausted / zero-rating
- Injured + Sick on Health/Will/Nature/Skill => -2D total; penalties stack.
- Sick blocks practice, Mentor learning and advancement logging.
- Exhausted FREE_INSTINCT => no longer free, turnCost=1, obstacleModifier=+1.
- post-condition rating 0 => mayTest/mayBenefitFrom/mayGrantHelp/maySpendPersonaOn all false; Nature fallback true.
- rating above 0 remains testable.

### Gate E — disposition conflict / death risk / zero writes
- Hungry+Exhausted+Injured+Sick disposition plan returns both QR41/44 -1s statements and QR51 -1D statements.
- resolution=UNRESOLVED_SOURCE_CONFLICT, automation=false, chosenPenalty=null.
- Injured serious-harm and Sick relevant-threat plans require advance warning and expose death escalation as guidance only.
- deathMutationCommitted=false, conditionMutationCommitted=false.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E Condition or normal Skill roll and Recruitment/Create Ranger remain normal.
- qa.9 release assets/workflow green.
- QA=1.13.0-qa.9; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Conditions shadow contract. It does not authorize TB2E activation, Condition mutation, Conflict-disposition automation or Recovery execution.
