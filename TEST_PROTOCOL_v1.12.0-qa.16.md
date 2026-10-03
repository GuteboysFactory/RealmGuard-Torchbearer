# Realm Guard / Torchbearer v1.12.0-qa.16 — Live Test Protocol

**Milestone:** M10C.5 — MG2E Technical Live-Readiness Closure  
**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Primary rule:** close Recruitment / Rules Reference / activation-surface technical readiness without enabling MG2E.

## Gate A — Boot / release
- Install/update v1.12.0-qa.16.
- World boots without startup errors.
- `game.realmGuard.core.m10.mg2e.creationPolicy`, `.rulesReferenceSnapshot` and `.readinessAudit` exist.

## Gate B — M10C.4 closure regression
- MG2E Rules Profile remains v3 and standalone.
- FOUNDATION_ONLY / non-selectable / unsupported / non-live remain true.
- shadow adapters remain ready.
- conversion preview remains READ ONLY / zero-write.
- activation remains unavailable.

## Gate C — Technical readiness overview
Verify `game.realmGuard.core.m10.getStatus()`:
- phase = M10C.5
- mode = MG2E_TECHNICAL_LIVE_READINESS_ROUTER
- mg2eCreationReadyWhenActive = true
- mg2eCreationProfileAvailable = true
- mg2eRulesReferenceOwned = true
- mg2eActivationSurfaceRegistered = true
- nextStep = M10C.6 MG2E Live Parity QA Foundation

## Gate D — CORE M9 creation policy
Verify `game.realmGuard.core.m10.mg2e.creationPolicy()`:
- creationProfileId = mg2e
- creationProfileVersion = 3
- coreEngine = CORE_M9
- liveAuthority = CORE_M9_WHEN_ACTIVE
- readyWhenActive = true
- liveCommit = false
- foundationOnly = true
- creationProfileAvailable = true
- all resolve-write counts = 0

## Gate E — Representative Guardmouse creation / commit preview
Build a representative Guardmouse draft and verify:
- Will 3 / Health 5 / Resources 2 / Circles 2
- Nature follows the three source questions
- new Skills open at 2 and repeated selections increase them
- Wise is unrated
- source Traits are applied
- commit plan uses COMPENSATING_ROLLBACK
- transaction readyWhenActive = true
- liveExecution = false
- previewOnly = true
- provenanceWrite / relationshipWrite = false
- preview operations are all disabled

## Gate F — Recruitment source restrictions
Representative checks:
- Tenderpaw Wise is Code of the Guard-wise or Legends of the Guard-wise
- Guard Captain includes Lockhaven-wise or Matriarch-wise
- Tenderpaw chooses no Specialty and has no cloak
- other ranks choose a unique Specialty and cloak
- Nature question alternatives expose the source Trait choices
- friend and enemy remain optional
- existing Actors are not migrated

## Gate G — MG2E Rules Reference
Verify `game.realmGuard.core.m10.mg2e.rulesReferenceSnapshot()`:
- mode = READ_ONLY_PROFILE_REFERENCE
- profileId = mg2e
- liveAuthority = false
- profile-owned pages render
- Natural Order page exists
- Character Creation and Wises / Traits / Help pages exist
- Actor / Item / Journal / world-setting writes are false

## Gate H — Locked activation surface
Open Rules Profile Management:
- MG2E appears in Rules Profile Activation
- row is locked / foundation-only
- no Switch button for MG2E
- conversion preview remains available
Console:
- activation status includes mg2e
- activationAvailable("mg2e") = false

## Gate I — Readiness audit after technical closure
Verify `readinessAudit()`:
- FULL_RECRUITMENT_COMMIT_ADAPTER = CLOSED
- DEDICATED_LIVE_RULES_REFERENCE = CLOSED
- LIVE_PARITY_QA = BLOCKED_NOT_RUN
- EXPLICIT_ACTIVATION_MILESTONE = DEFERRED
- technicalReadinessComplete = true
- technicalBlockers = []
- openBlockers contains only LIVE_PARITY_QA and EXPLICIT_ACTIVATION_MILESTONE
- decision = NOT_READY_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN
- nextStep = M10C.6 MG2E Live Parity QA Foundation

## Gate J — Activation isolation
- no `switchToMg2e` API exists
- generic `switchProfile("mg2e")` rejects foundation-only
- active profile is unchanged
- audit / reference / preview / creation planning perform zero setting writes

## Gate K — Existing profile regression / data safety
Representative smoke:
- Legacy Mixed Skill / Versus / Beginner's Luck / Recruitment / structured inventory
- Strict rated Wises / Conditions / Conflict / Recruitment / Scale
- MG1E QA activation / rated Wises / Sick / Natural Order / live Recruitment
- no existing Actor / Item / Journal / Wise / Condition / inventory / provenance / rank mutation from MG2E technical readiness

## Gate L — Release / channel
- GitHub release tag/assets are v1.12.0-qa.16
- QA channel points to qa.16 only after automated verification
- Stable channel remains v1.11.0

## PASS
M10C.5 is CLOSED only after Gates A-L pass in Foundry VTT 13.351.
