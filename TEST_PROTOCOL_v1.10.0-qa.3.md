# v1.10.0-qa.3 — M9 Transactional Commit Plan / Foundry Adapter Shadow QA

**Foundry target:** 13.351  
**GOLD fallback:** v1.9.0  
**Previous M9 gate:** v1.10.0-qa.2 PASS  
**Gameplay change:** NONE INTENDED  
**Draft / validation authority:** CORE M9  
**Live commit authority:** Legacy Recruitment  
**CORE commit mode:** PLAN + FOUNDRY ADAPTER SHADOW ONLY

## Gate A — authority / status

```js
game.realmGuard.core.m9.getStatus()
```

Expected:
- mode = DRAFT_LIVE_COMMIT_PLAN_SHADOW
- draftAuthority = CORE_M9
- validationAuthority = CORE_M9
- commitAuthority = LEGACY_RECRUITMENT
- commitShadowAuthority = CORE_M9_PLAN_AND_FOUNDRY_ADAPTER
- liveApplication.commitPlan = true
- liveApplication.commit = false.

## Gate B — full Ranger / dual parity
Create one complete Guided or Quick Ranger.

Then run:

```js
game.realmGuard.core.m9.getStatus()
game.realmGuard.core.m9.history()
```

Expected latest event:
- parity = true
- mismatchedFields = []
- commitParity = true
- commitMismatchedFields = []
- commitPlanLiveMutation = false.

Status:
- mismatches = 0
- commitMismatches = 0
- allParity = true
- allCommitParity = true.

## Gate C — inspect commit plan
Expand latest `commitPlan` and `commitPreview`.

Expected plan covers:
- Actor identity/system payload
- Legacy Recruitment compatibility flags
- canonical Skills + planned ratings
- Traits
- Wises
- Gear
- canonical Conditions
- structured + normalized Recruitment relationships
- CreationProvenance preview
- transaction phases
- compensating rollback plan.

Expected:
- transaction.liveExecution = false
- transaction.provenanceWrite = false
- transaction.relationshipWrite = false
- commitPreview.liveMutation = false
- every mutation operation is disabled.

## Gate D — rollback contract

In the latest commit preview inspect `rollback`.

Expected:
- strategy = COMPENSATING_ROLLBACK
- trigger = ANY_CRITICAL_FAILURE_AFTER_ACTOR_CREATE
- compensation = DELETE_CREATED_ACTOR
- Chat + Relationship NPC Review are outside the atomic boundary.

No failure is induced in qa.3 because Legacy still performs the only real commit.

## Gate E — live regression
Verify the actually created Ranger still has:
- correct Skills/rankings
- Traits
- unrated Wises
- Gear
- Conditions
- Recruitment flags
- Relationships
- Fate/Persona
- PC folder placement.

M8 Relationship NPC review remains optional and no NPC is created automatically.

## PASS
qa.3 passes when the CORE CreationCommitPlan + Foundry adapter describe the same commit as Legacy with commitParity=true, while the adapter performs zero live mutation and Legacy remains the sole commit authority.
