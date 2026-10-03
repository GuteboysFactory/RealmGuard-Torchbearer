# M10C.5 — MG2E Technical Live-Readiness Closure

**Date:** 2026-10-03  
**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**QA candidate:** v1.12.0-qa.16

## Goal

Close the two technical blockers identified by M10C.4 without enabling Mouse Guard 2E gameplay:

1. `FULL_RECRUITMENT_COMMIT_ADAPTER`
2. `DEDICATED_LIVE_RULES_REFERENCE`

Also register MG2E in the generic activation-status/Profile Management surface as a visibly locked foundation profile.

## Safety boundary

M10C.5 does **not**:
- change MG2E `foundationOnly/selectable/supported/liveRuleAuthority`
- add `switchToMg2e`
- write existing Actors, Items or Journals
- migrate Wise ratings, Conditions, inventory placement or Natural Order ranks
- infer rank from species
- claim live parity

## Source-owned CORE M9 Recruitment

Adds `module/profiles/mg2e-creation.mjs` as CharacterCreationProfile v3.

Source contracts represented:
- 21 Recruitment steps
- Guard ranks: Tenderpaw / Guardmouse / Patrol Guard / Patrol Leader / Guard Captain
- rank-owned Will / Health / base Skills / age / Resources / Circles
- eight principal hometown packages
- new Skill starts at 2; repeated selection increases it, capped at 6
- Natural Talent / parents' trade / convincing / Senior Artisan / mentor training / Specialty
- Mouse Nature base 3 with the three Recruitment questions
- unrated Wises with rank counts and Tenderpaw / Guard Captain restrictions
- source Trait selections including born quality, Tenderpaw parent Trait and veteran Life on the Road Trait
- parent / Senior Artisan / mentor / optional friend / optional enemy
- Tenderpaw no cloak
- Belief / Goal / Instinct
- starting weapon / Gear
- starting Fate 1 / Persona 1

The commit plan uses CORE M9 compensating rollback and is `READY_WHEN_ACTIVE`, but while MG2E remains foundation-only:
- `liveExecution=false`
- `previewOnly=true`
- `provenanceWrite=false`
- `relationshipWrite=false`

## Source-owned Rules Reference

The historical generic M10B.8 Rules Reference router remains the implementation owner and keeps its historical phase metadata.

MG2E now receives read-only profile-owned reference pages for:
- Source Lineage
- Tests / Advancement / Beginner's Luck
- Wises / Traits / Help
- Nature / Fate / Persona
- Conditions / Recovery
- Inventory / Conflict
- Natural Order
- Players' Turn / End Session / Circles
- Character Creation

No Journal document is created or modified.

## Activation surface

The generic activation status now includes MG2E so Profile Management can show it as a locked foundation profile.

MG2E remains:
- `foundationOnly=true`
- `selectable=false`
- `supported=false`
- `liveRuleAuthority=false`
- `activationAvailable=false`

No dedicated MG2E switch helper is added.

## Readiness result after implementation

Expected audit state:
- `FULL_RECRUITMENT_COMMIT_ADAPTER` = CLOSED
- `DEDICATED_LIVE_RULES_REFERENCE` = CLOSED
- `LIVE_PARITY_QA` = BLOCKED_NOT_RUN
- `EXPLICIT_ACTIVATION_MILESTONE` = DEFERRED
- `technicalBlockers=[]`
- decision = `NOT_READY_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN`

## Next bounded slice

**M10C.6 — MG2E Live Parity QA Foundation**

M10C.6 may prepare controlled live-parity handoff testing. Actual MG2E profile activation remains a separate explicit later milestone.
