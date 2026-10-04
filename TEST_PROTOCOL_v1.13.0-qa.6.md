# TEST PROTOCOL — v1.13.0-qa.6

## M10D.5 Foundry VTT 13.351 gate — TB2E Nature bounded shadow

Torchbearer 2E remains FOUNDATION_ONLY / READ_ONLY. Nature coverage remains PARTIAL. Stable remains v1.12.0.

### Gate A — Boot / status
- Install qa.6; no boot errors.
- m10d status: phase M10D.5, shadowReadyDomains=["wises","help","tests","nature"], natureShadowReady=true.
- liveReady=false, activationAvailable=false, all writes=0.
- nature.getStatus(): PARTIAL, TB2E_NATURE_READ_ONLY_SHADOW, adapterReady=true, liveEnabled=false.

### Gate B — Model / Nature substitution
- ratingRange=0..7; Current/Maximum separation true; startingNatureGuide=3.
- stock descriptors match the supplied Player Guide for Dwarf/Elf/Halfling/Human.
- unavailable Skill + descriptor applies => dice=current Nature; no fail tax.
- zero-rated Skill + descriptor does not apply => dice=current Nature; fail tax=MARGIN_OF_FAILURE.
- attempting substitution when Skill is neither unavailable nor zero-rated rejects safely.
- tax preview changes no Actor data.

### Gate C — Channel Nature / tax
- 1 Persona required; Current Nature added as dice; timing BEFORE_TEST_ROLL.
- Resources/Circles reject with CHANNEL_NATURE_FORBIDDEN_TEST.
- no Persona rejects with INSUFFICIENT_PERSONA.
- within descriptor => no tax on pass/fail.
- outside descriptor => success tax 1; failure tax margin of failure.
- resourceSpendCommitted=false, taxMutationCommitted=false, writes=0.

### Gate D — Recovery / Conserve
- RESPITE restores Current to Maximum.
- eligible PROLOGUE restores 1 taxed Nature; requires delivered prologue and no Conditions.
- MISSED_SESSION_RETURN restores 1 when the last session was missed.
- eligible LEAVING_TOWN restores 1; requires no Conditions and passed Lifestyle test.
- CONSERVE reduces Maximum by 1 and restores Current to the new Maximum; it is not represented as tax and requires no Trait change.
- all are previews only.

### Gate E — Loss / advancement / zero writes
- Current 0 due to tax => Maximum -1, Current restored to new Maximum, change-one-non-class-Trait guidance, Trait level unchanged, tax/advancement erase guidance.
- if Maximum becomes 0 => retirementRequired=true at END_OF_CURRENT_ADVENTURE_PHASE.
- Nature advancement uses Maximum basis and increases Current+Maximum together, preserving tax difference.
- advancing Maximum 6->7 => retirementCheckRequired=true at END_OF_SESSION.
- snapshot Actors/Items/Journals/settings before/after representative calls; unchanged=true.

### Gate F — Existing profiles / release
- representative MG2E Nature or Skill roll and Recruitment/Create Ranger remain normal.
- qa.6 release assets/workflow green.
- QA=1.13.0-qa.6; Stable=1.12.0 unchanged.

Passing A-F verifies only the bounded Nature shadow contract. It does not authorize TB2E activation or live Nature mutation.
