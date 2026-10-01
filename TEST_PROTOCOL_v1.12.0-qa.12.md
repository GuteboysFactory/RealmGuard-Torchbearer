# Realm Guard / Torchbearer v1.12.0-qa.12 — Live Test Protocol

**Milestone:** M10C.1 — MG2E Source Audit & Profile Foundation  
**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Primary rule:** MG2E is source-registered only; it must remain non-selectable and non-live.

## Gate A — Boot / release
- Install/update v1.12.0-qa.12.
- World boots without startup errors.
- Profile Management, Manual, Ranger/NPC sheets, Item sheets and Recruitment open.

## Gate B — MG2E profile registration
- Rules/profile API reports `mg2e` v1.
- Name is Mouse Guard 2E.
- Activation state is FOUNDATION_ONLY.
- `foundationOnly=true`, `selectable=false`, `supported=false`, `liveRuleAuthority=false`.
- MG2E resolves with independent lineage; it does not inherit MG1E or Realm Guard.

## Gate C — Activation isolation
- Profile Management has no MG2E switch button.
- No automatic switch to MG2E occurs.
- MG2E activation availability is false.
- Active world profile remains the profile selected before updating.

## Gate D — Legacy Mixed regression
- Activate/reload Legacy Mixed if needed.
- Representative Skill, Versus, Beginner's Luck, Recruitment and structured inventory remain compatible.

## Gate E — Strict regression
- Activate/reload Strict.
- Representative rated Wise, Trait/Nature, Conditions, Conflict and Recruitment behavior remains unchanged.

## Gate F — MG1E regression
- Activate/reload MG1E in QA runtime.
- MG1E remains QA-selectable.
- Rated Wises, Sick recovery, Natural Order and active Recruitment remain unchanged.

## Gate G — MG2E source snapshot
Inspect the resolved MG2E profile/Registry and verify:
- Nature (Mouse): Escaping / Climbing / Hiding / Foraging.
- Wises are UNRATED and not independently testable.
- Wise effects identify I Am Wise, Deeper Understanding and Of Course!.
- Trait L1 = +1D once/session.
- Trait L2 = +1D twice/session.
- Trait L3 = +1s on applicable tests.
- Conditions are Hungry & Thirsty / Angry / Tired / Injured / Sick.
- Recovery records Injured Healer Ob3 and Sick Healer Ob4.
- Circles records hometown +1D, known Contact +1D and Enmity +3s.
- Recruitment foundation records five Guard ranks and Wise counts 1/1/2/3/4.

## Gate H — Existing-data safety
- No Actor/Item/Journal data changes merely because MG2E is registered.
- No Wise rating conversion occurs.
- No Condition rename/delete occurs.
- No inventory placement rewrite occurs.
- No profile-specific dormant data is deleted.

## Gate I — Release/channel
- GitHub release tag/assets are v1.12.0-qa.12.
- QA channel points to qa.12 only after automated verification.
- Stable channel remains v1.11.0.

## PASS
M10C.1 is CLOSED only after Gates A-I pass in Foundry VTT 13.351.
