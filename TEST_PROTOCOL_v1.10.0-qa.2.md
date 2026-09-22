# v1.10.0-qa.2 — M9 Draft / Recalculation / Validation Live Handoff QA

**Foundry target:** 13.351  
**GOLD fallback:** v1.9.0  
**Previous M9 gate:** v1.10.0-qa.1 PASS  
**Gameplay change:** NONE INTENDED  
**Draft authority:** CORE M9  
**Validation authority:** CORE M9  
**Commit authority:** Legacy Recruitment

## Gate A — load / authority
Run:

```js
game.realmGuard.core.m9.getStatus()
```

Expected:
- mode = DRAFT_LIVE_COMMIT_LEGACY
- draftAuthority = CORE_M9
- validationAuthority = CORE_M9
- commitAuthority = LEGACY_RECRUITMENT
- liveApplication.draft = true
- liveApplication.validation = true
- liveApplication.commit = false.

## Gate B — Guided complete Ranger
Create one full Guided Ranger.

Expected:
- same visible rules/results as qa.1
- all 11 steps validate normally
- final Ranger is created once
- no M9 parity mismatch
- Skills, Traits, Wises, Nature, Resources, Circles and Gear match the choices.

## Gate C — Back recalculation
Advance at least four steps, go Back, change Station and earlier answers, then continue.

Expected:
- dependent draft values recalculate from the changed choices
- stale Nature/Resources/Circles values do not survive
- final Ranger reflects the revised path.

## Gate D — validation authority
Deliberately test:
- incomplete Life Experience
- under/over Service allocation
- duplicate Specialty
- missing Wise
- Resources trade YES without a trained trade
- restricted Trait
- incomplete Relationship
- missing B/G/I.

Expected:
- Continue is blocked with the existing user-facing validation text.
- Console does not report M9 validation fallback during normal operation.

## Gate E — UI cleanup
Verify Recruitment no longer shows the old pseudo-live:
- Station values summary
- Nature Current result
- Resources/Circles Starting result.

Static budgets, rule text, validation warnings and Review remain.

## Gate F — Quick / Cancel / M8 regression
- Quick creation still works.
- Cancel before final Create creates no Actor.
- Relationships and optional post-Recruitment NPC review are unchanged.
- No NPC is created automatically.

## Gate G — parity / commit boundary
After at least one full creation:

```js
game.realmGuard.core.m9.getStatus()
game.realmGuard.core.m9.history()
```

Expected:
- mismatches = 0
- allParity = true
- final parity event reports draftAuthority CORE_M9 and commitAuthority LEGACY_RECRUITMENT
- liveCommit = false.

## PASS
qa.2 passes when CORE owns draft recalculation, restrictions and step validation behind the existing Recruitment UI while the legacy createRanger mutation path remains the sole commit authority, with zero representative parity mismatches and no Regression in Guided/Quick/Back/Cancel/M8.
