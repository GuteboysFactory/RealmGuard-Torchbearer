# TEST PROTOCOL — v1.12.0-qa.10

## M10B.10 — MG1E Live Readiness Closure

**Foundry target:** v13.351  
**Stable baseline:** v1.11.0  
**Previous verified QA:** v1.12.0-qa.8 — M10B.8 FULL PASS / VERIFIED / CLOSED  
**Audit:** M10B.9 COMPLETE — activation NOT YET READY before this closure package

### Gate A — Boot / release
- install/update to qa.10
- world boots without startup errors
- Rules Profile Management, Manual, Ranger/NPC sheets and Item sheets open normally

### Gate B — activation gate
- Legacy Mixed remains default compatibility profile
- Strict Realm Guard remains selectable/supported
- MG1E displays profile v10 but remains FOUNDATION_ONLY / non-selectable / unsupported
- no MG1E activation button is enabled
- rejected MG1E activation produces no profile-setting writes

### Gate C — Legacy Mixed regression
- ordinary rolls / versus / Beginner's Luck remain compatible
- Legacy Mixed Rules Journal remains unchanged
- Legacy Recruitment and structured inventory remain compatible

### Gate D — Strict regression
- Strict activation and rollback remain functional
- rated Wises, Traits/Help/Nature, Conditions/Recovery, Conflict, Session/Circles/Progression and Recruitment remain compatible
- Strict Scale of Might and Rules Reference remain intact

### Gate E — rated Wise Item editor routing
- under Strict, Wise Item shows Rated Wise controls
- changing a Wise rating updates Pass Needed = rating and Fail Needed = rating - 1
- no Strict-only copy remains in the rated Wise editor
- simulated/profile-resolved MG1E capabilities expose the same rated-Wise editor authority

### Gate F — Conflict Nature routing
- Strict descriptor Nature option remains available when source policy allows it
- MG1E family policy exposes descriptor Nature without a Strict-id branch
- Legacy Mixed does not gain family descriptor-Nature behavior accidentally
- ordinary Conflict action/disposition routing remains unchanged

### Gate G — Manual / Rules Reference routing
- Legacy Mixed Manual still identifies the embedded compatibility workflow
- Strict active opens Strict profile Rules Reference
- MG1E Rules Reference remains preview-only in real UI
- simulated MG1E active state routes “Open Active Profile Rules” to MG1E, not Strict

### Gate H — Profile Management / Registry readiness
- Profile Management lists Strict and MG1E activation state from generic metadata
- Strict switch remains available when appropriate
- MG1E clearly shows locked/foundation-only
- Rules Registry can preview both Strict and MG1E conversion paths
- no campaign data is mutated by preview/status surfaces

### Gate I — MG1E creation readiness contract
Verify MG1E:
- Rules Profile v10
- Character Creation profile v2
- CORE M9
- rated Wises
- LOOSE inventory
- canonical MG1E Skill set available in commit plan
- Conditions = Hungry & Thirsty / Angry / Tired / Injured / Sick
- profile-owned relationship plan
- READY_WHEN_ACTIVE = true
- real liveCommit = false because activation gate remains closed

### Gate J — transactional creation simulation
Static/smoke coverage must prove:
- complete simulated MG1E commit can create Actor + skills + Traits/Wises/Gear + Conditions + M8 relationships + provenance
- active rules snapshot/profile id must match the plan
- injected critical failure rolls back the newly created Actor
- simulation does not expose a real MG1E switch

### Gate K — existing-data safety
- no existing Actor is automatically provisioned/migrated because of MG1E
- no Wise rating is guessed
- no Conditions are deleted/renamed
- no Gear placement/container metadata is rewritten
- no Talent/Token data is deleted
- profile switch remains settings-only

### Gate L — release/channel
- release tag/assets point to v1.12.0-qa.10
- QA channel moves only after automated smoke/preflight verification
- stable channel remains v1.11.0

## PASS gate
M10B.10 is FULL PASS only after Gates A–L pass in Foundry VTT 13.351.

After PASS, the next bounded slice is:

> **M10B.11 — MG1E Selectable QA Activation**

M10B.11 must be a separate explicit activation gate; qa.10 must not make MG1E selectable.
